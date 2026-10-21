---
title: "Redis"
concept: "Redis"
summary: "Redis는 메모리에 데이터를 두는 키-값 저장소로, 캐시를 넘어 세션·분산 락·카운터·레이트 리미터·랭킹·큐로 쓰인다. 빠른 이유(메모리, 단일 스레드 이벤트 루프와 I/O 다중화, 효율적인 자료구조), 자료구조별 쓰임, 영속성(RDB·AOF·혼합)과 큰 키의 영향, 복제·센티널·클러스터로 이어진 고가용성 구조, Memcached와의 차이를 정리한다."
tags: ["backend", "database", "redis", "cache", "nosql"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/the-ultimate-redis-101", "https://bytebytego.com/guides/why-is-redis-so-fast", "https://bytebytego.com/guides/how-can-redis-be-used", "https://bytebytego.com/guides/memcached-vs-redis", "https://bytebytego.com/guides/how-does-redis-persist-data", "https://bytebytego.com/guides/how-do-big-keys-impact-redis-persistence", "https://bytebytego.com/guides/how-redis-architecture-evolve", "https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/", "https://www.slideshare.net/charsyam2/redis-196314086", "https://mingrammer.com/redis-migration/"]
---

> ByteByteGo의 System Design 101 가이드 「[The Ultimate Redis 101](https://bytebytego.com/guides/the-ultimate-redis-101)」, 「[Why is Redis so Fast?](https://bytebytego.com/guides/why-is-redis-so-fast)」, 「[How can Redis be used?](https://bytebytego.com/guides/how-can-redis-be-used)」, 「[Memcached vs Redis](https://bytebytego.com/guides/memcached-vs-redis)」, 「[How Does Redis Persist Data?](https://bytebytego.com/guides/how-does-redis-persist-data)」, 「[How Big Keys Impact Redis Persistence](https://bytebytego.com/guides/how-do-big-keys-impact-redis-persistence)」, 「[How Redis Architecture Evolved](https://bytebytego.com/guides/how-redis-architecture-evolve)」을 바탕으로, 영속성 설정은 Redis 공식 문서로 확인해 재구성한 노트다. 운영 주의점은 「[우아한 Redis](https://www.slideshare.net/charsyam2/redis-196314086)」(발표 슬라이드, [영상](https://youtu.be/mPB2CZiAkKM)), 데이터 이전은 「[IDC에서 AWS로 Redis 데이터 이전하기](https://mingrammer.com/redis-migration/)」로 보강했다.

## Redis란

Redis(Remote Dictionary Server)는 **데이터를 메모리에 두고 키-값으로 읽고 쓰는 저장소**다. 읽기·쓰기가 보통 1밀리초 안에 끝난다. 핵심 발상은 「캐시도 제대로 된 데이터베이스가 될 수 있다」는 것이다. 메모리에서 읽고 쓰면서도 디스크에 영속화할 수 있고, 값으로 문자열뿐 아니라 리스트·해시·정렬 집합 같은 자료구조를 그대로 담는다.

그래서 **캐시가 가장 흔한 용도지만 캐시만은 아니다.** 여러 서버가 함께 보는 빠른 공유 메모리가 필요할 때 두루 쓴다.

2024년 라이선스 변경 뒤 리눅스 재단 산하 포크인 **Valkey**가 나왔고, Redis도 이후 AGPL을 선택지로 다시 열었다. 명령과 프로토콜은 대부분 호환되므로 아래 개념은 둘 다에 해당한다.

## 왜 빠른가

| 이유 | 설명 |
| --- | --- |
| **메모리 저장** | RAM 접근은 디스크 무작위 접근보다 수천 배 빠르다([[backend-latency-optimization\|백엔드 지연 시간 숫자]]) |
| **단일 스레드 실행 + I/O 다중화** | 명령은 한 스레드가 차례로 실행한다. 락과 문맥 교환이 없다. 수많은 연결은 epoll 같은 I/O 다중화로 한 이벤트 루프가 감시한다([[event-loop-server\|이벤트 루프 서버]]) |
| **효율적인 내부 자료구조** | 작은 해시·리스트는 연속 메모리(listpack)로, 정렬 집합은 스킵 리스트로, 정수 집합은 intset으로 저장하는 식으로 크기에 따라 표현을 바꾼다 |

Redis 6.0부터는 **네트워크 읽기·쓰기만 여러 스레드**로 나눌 수 있다(I/O threads). 명령 실행은 여전히 단일 스레드라 원자성은 그대로다. 병목이 CPU가 아니라 네트워크 처리일 때 쓴다.

단일 스레드라는 점은 약점이기도 하다. **오래 걸리는 명령 하나가 모든 요청을 막는다.** `KEYS *`, 거대한 컬렉션 전체 조회, 큰 키 삭제가 대표적이다. 운영에서는 `SCAN`으로 나눠 훑고, 큰 키는 `UNLINK`로 백그라운드에서 지운다.

## 자료구조와 쓰임

| 자료구조 | 쓰임 | 대표 명령 |
| --- | --- | --- |
| String | 캐시(객체·페이지), 세션, **분산 락**, 카운터, 전역 ID 생성 | `SET key val NX PX 30000`, `INCR` |
| Hash | 장바구니, 게시물별 클릭·댓글 수처럼 필드가 여럿인 객체 | `HSET`, `HINCRBY` |
| List | 단순 메시지 큐, 최근 목록 | `LPUSH`, `BRPOP` |
| Set | 중복 제거, 태그, 공통 친구 | `SADD`, `SINTER` |
| Sorted Set (ZSet) | **랭킹**, 점수순 정렬, 시간순 행동 기록(점수 = 타임스탬프) | `ZADD`, `ZRANGE ... REV` |
| Bitmap | 사용자별 일일 로그인 여부 같은 대량의 참/거짓을 아주 작은 공간에. **리텐션 계산** | `SETBIT`, `BITCOUNT` |
| HyperLogLog | 고유 방문자 수 근사 집계 | `PFADD`, `PFCOUNT` |
| Stream | 소비자 그룹과 확인(ack)이 있는 로그형 메시지 큐 | `XADD`, `XREADGROUP` |
| Geo | 반경 내 위치 검색 | `GEOADD`, `GEOSEARCH` |

용도별로 다시 보면 다음과 같다.

| 용도 | 방법 |
| --- | --- |
| 캐시 | 자주 읽는 객체·페이지를 TTL과 함께 저장. 패턴은 [[caching-strategies\|캐시 전략]] |
| 세션 저장소 | 여러 서버가 같은 세션을 본다([[session-vs-token-auth\|세션과 토큰 인증]]) |
| 분산 락 | `SET NX`로 한 프로세스만 키를 잡게 하고 만료 시간을 둔다. 락을 푸는 쪽이 자기 값인지 확인하고 지워야 한다 |
| 카운터 · 레이트 리미터 | `INCR` + `EXPIRE`로 IP·사용자별 요청 수를 센다. `INCR`은 원자적이라 경쟁이 없다 |
| 전역 ID | `INCR`로 서비스 전체에서 겹치지 않는 번호를 발급 |
| 메시지 큐 · Pub/Sub | 가벼운 큐는 List, 재처리가 필요하면 Stream. Pub/Sub은 저장하지 않고 지금 구독 중인 쪽에만 뿌린다 |
| 랭킹 | ZSet에 점수를 넣고 상위 N개를 꺼낸다 |

JSON 문서, 보조 인덱스 검색, 시계열, 블룸 필터 같은 확률형 자료구조는 과거에 별도 모듈(RedisJSON, RediSearch, RedisTimeSeries, RedisBloom)이었고, Redis 8부터는 기본 배포에 들어 있다. RedisGraph 같은 일부 모듈은 지원이 끝났다.

## 영속성: RDB와 AOF

메모리에만 두면 재시작할 때 데이터가 사라진다. Redis는 두 방식으로 디스크에 남긴다. 둘 다 **응답 경로 밖에서** 일어나 쓰기를 기다리게 하지 않는 것이 원칙이다.

| | RDB (스냅샷) | AOF (Append-Only File) |
| --- | --- | --- |
| 무엇을 남기나 | 특정 시점의 **데이터 전체** | 실행한 **쓰기 명령** 하나하나 |
| 복구 속도 | 빠르다. 파일을 그대로 메모리에 올린다 | 느리다. 명령을 처음부터 다시 실행한다 |
| 잃을 수 있는 양 | 마지막 스냅샷 이후 전부 | fsync 정책에 따라 0~1초 분량 |
| 파일 크기 | 작다(압축된 바이너리) | 크다. 주기적으로 다시 써서(rewrite) 줄인다 |

**AOF는 쓰기 후 로그**(write-after log)다. DB의 WAL(write-ahead log)은 로그를 먼저 쓰고 데이터를 바꾸지만, Redis는 메모리에서 명령을 먼저 실행하고 성공한 명령만 로그에 붙인다. 잘못된 명령을 검사할 필요가 없고 쓰기를 막지 않지만, 실행 직후 로그를 쓰기 전에 죽으면 그 명령은 잃는다.

**RDB는 fork와 COW로 만든다.**

```text
메인 프로세스 ── fork() ──▶ 자식(bgsave): 메모리를 공유한 채 RDB 파일로 기록
     │
     └─ 그동안 쓰기가 오면 바뀌는 페이지만 복사해서(Copy-On-Write) 거기에 쓴다
        → 자식은 fork 시점의 일관된 스냅샷을 그대로 본다
```

fork 자체는 페이지 테이블을 복사하므로 메모리가 클수록 순간 멈춤이 길어지고, 쓰기가 많으면 COW 복사본 때문에 메모리가 일시적으로 늘어난다([[process-and-thread|프로세스와 스레드]]의 `fork()`).

**운영에서는 둘을 섞는다.** AOF를 다시 쓸 때 앞부분은 RDB 형식 스냅샷으로, 그 뒤는 그 이후의 명령으로 채운다(`aof-use-rdb-preamble`). 복구는 빠르고 잃는 양은 적다. 순수 캐시로만 쓴다면 영속성을 끄기도 한다.

### AOF fsync 정책과 큰 키

명령은 메모리 → `write()`로 커널 버퍼 → `fsync()`로 디스크 순으로 내려간다. `appendfsync` 설정이 `fsync()`를 언제 부를지 정한다.

| 설정 | 동작 | 잃을 수 있는 양 | 큰 키의 영향 |
| --- | --- | --- | --- |
| `always` | 쓰기마다 메인 스레드가 동기 fsync | 거의 없음 | **큰 키를 쓰면 fsync가 끝날 때까지 메인 스레드가 막힌다** |
| `everysec` (기본값) | 백그라운드 스레드가 1초마다 fsync | 약 1초 | 메인 스레드에 영향 거의 없음 |
| `no` | OS가 알아서 디스크에 내린다 | OS 플러시 주기만큼 | 메인 스레드에 영향 없음 |

**큰 키**(big key)는 값 하나가 수 MB이거나 원소가 수십만 개인 키다. AOF `always`뿐 아니라 조회·삭제·복제·클러스터 슬롯 이동에서도 단일 스레드를 오래 붙잡고, 특정 노드에 메모리를 쏠리게 한다. 값을 쪼개 여러 키로 나누는 것이 기본 대응이다.

## 구조의 진화: 단일 → 복제 → 센티널 → 클러스터

```text
단일 인스턴스        재시작하면 데이터가 사라지고 트래픽이 DB로 쏟아진다
   │ + RDB·AOF      디스크에 남겨 재시작 후 복구
   │ + 복제         주(primary)가 읽기·쓰기, 복제본(replica)이 주를 따라간다
   │ + 센티널        주를 감시하다가 죽으면 복제본을 주로 승격(자동 장애 조치)
   ▼ + 클러스터      데이터를 샤딩해 여러 주 노드에 나눈다
```

| 단계 | 해결하는 문제 | 남는 문제 |
| --- | --- | --- |
| 영속성 | 재시작 시 데이터 유실 | 서버가 하나라 죽으면 서비스가 멈춘다 |
| 복제 | 읽기 확장, 사본 확보 | 주가 죽으면 사람이 직접 승격해야 한다. 복제는 비동기라 승격 직전 쓰기를 잃을 수 있다 |
| 센티널 | 감시·알림·**자동 장애 조치**·클라이언트에 새 주 주소 제공 | 쓰기와 메모리는 여전히 주 하나의 한계 |
| 클러스터 | 데이터를 **16,384개 해시 슬롯**으로 나눠 노드들이 슬롯을 나눠 맡는다. 노드마다 복제본을 둬 장애 조치도 내장 | 여러 키를 한 번에 다루는 명령은 키들이 같은 슬롯에 있어야 한다 |

클러스터에서 키의 슬롯은 `CRC16(key) mod 16384`다. `{user:42}:cart`처럼 중괄호 안의 **해시 태그**만으로 슬롯을 정하게 하면 관련 키를 같은 노드에 모을 수 있다. 샤딩 일반론은 [[database-sharding|데이터베이스 샤딩]]에 있다.

## Memcached와의 차이

| 기준 | Redis | Memcached |
| --- | --- | --- |
| 값 | 문자열 + 리스트·해시·집합·정렬 집합·비트맵·스트림 등 | 문자열(바이트 덩어리)만 |
| 영속성 | RDB·AOF | 없다. 재시작하면 비어 있다 |
| 복제·장애 조치 | 복제, 센티널, 클러스터 내장 | 내장 기능이 없다. 클라이언트가 키를 여러 서버로 나눈다 |
| 스레드 | 명령 실행은 단일 스레드(I/O는 멀티 스레드 가능) | 멀티 스레드. 코어를 많이 쓰는 단순 get/set에 강하다 |
| 교체 정책 | 정책을 고른다(`allkeys-lru`, `allkeys-lfu`, `volatile-ttl`, 기본은 `noeviction`) | LRU |
| 그 밖 | Pub/Sub, Lua 스크립트, 트랜잭션 | 단순하고 메모리 오버헤드가 작다 |

자료구조가 필요하면 Redis다. 게시물별 클릭·댓글 수는 해시로, 댓글 단 사용자 목록의 정렬·중복 제거는 정렬 집합으로, 로그인·멤버십 같은 대량의 참/거짓은 비트맵으로 담는다. 단순한 문자열 캐시만 필요하고 멀티 코어를 꽉 쓰고 싶으면 Memcached도 여전히 선택지다.

## 운영에서 조심할 것

| 주의점 | 이유와 대응 |
| --- | --- |
| 컬렉션 하나에 너무 많이 담지 않는다 | 원소가 많으면 조회·삭제 한 번이 길어져 다른 요청을 막는다. 수천 개 수준을 넘으면 키를 나눠 담는다 |
| 만료는 키 단위다 | 리스트·집합 안의 원소마다 TTL을 줄 수 없다. 원소별 만료가 필요하면 키를 나누거나 정렬 집합에 만료 시각을 점수로 넣고 주기적으로 지운다. Redis 7.4부터는 해시 필드에 한해 `HEXPIRE`로 필드 단위 만료를 줄 수 있다 |
| 정렬 집합의 점수는 실수(double) | 아주 큰 정수나 정밀한 소수는 정확히 표현되지 않는다. 점수에 넣을 값의 범위를 확인한다 |
| `maxmemory`만 믿지 않는다 | 메모리 파편화 때문에 실제 RSS가 설정값보다 커질 수 있고, 물리 메모리를 넘으면 스왑으로 급격히 느려진다. `INFO memory`의 RSS와 파편화 비율을 감시하고, 큰 인스턴스 하나보다 작은 인스턴스 여러 개가 안전할 수 있다 |
| 복제는 비동기다 | 장애 조치 순간 마지막 쓰기가 사라질 수 있다. 전체 재동기화는 fork로 메모리를 더 쓰고, 여러 복제본이 한꺼번에 재동기화하면 마스터가 버티지 못하므로 재시도 시점을 흩는다 |
| 원자적 명령을 활용한다 | `INCR`, `SETNX`, 정렬 집합 갱신은 원자적이라 읽고-고치고-쓰는 경쟁 조건을 피한다. 여러 명령을 앱에서 조합하면 다시 경쟁이 생기므로 `MULTI`나 Lua 스크립트로 묶는다 |

### 데이터 옮기기

다른 Redis로 데이터를 옮길 때는 규모와 정확성 요구로 방법을 고른다.

| 방법 | 장점 | 단점 |
| --- | --- | --- |
| 복제 연결 후 승격 | 서비스 중에도 따라잡으며 옮긴다 | 대상에서 원본으로 복제 연결이 가능해야 한다. 관리형 서비스는 막혀 있는 경우가 많다 |
| RDB 파일 복원 | 빠르다 | 여러 원본을 하나로 합치기 어렵고 키 단위 검증이 어렵다 |
| `SCAN` + `DUMP`/`RESTORE`(또는 `MIGRATE`) | 키 단위로 옮겨 병합·검증이 쉽고 TTL도 함께 넘길 수 있다 | 느리다. **파이프라이닝**으로 명령을 묶어 왕복 횟수를 줄이고, 키 공간을 나눠 병렬로 돌린다 |

병렬 작업은 키 수가 고르지 않으면 일부만 오래 걸리므로 큰 범위를 더 잘게 나눈다. 옮기는 동안 원본에 쓰기가 계속되면 「복제 완료」 판단이 무의미하므로 쓰기를 멈추는 점검 시간을 잡거나 이중 쓰기를 둔다. 속도보다 **누락 없이 옮겨졌는지 검증**하는 것이 핵심이다.

## 정리

- Redis는 메모리 기반 키-값 저장소이고, 자료구조를 그대로 담아 캐시 외에 락·카운터·랭킹·큐로도 쓴다.
- 빠른 이유는 메모리, 단일 스레드 이벤트 루프, 크기에 따라 바뀌는 내부 표현이다. 반대로 **느린 명령 하나가 전체를 막는다.**
- 영속성은 RDB(빠른 복구)와 AOF(적은 유실)를 섞어 쓰고, AOF는 보통 `everysec`이다.
- 가용성은 복제 → 센티널(자동 장애 조치) → 클러스터(16,384 슬롯 샤딩) 순으로 쌓인다.
- 큰 키는 쪼갠다. 지울 때는 `UNLINK`, 훑을 때는 `SCAN`.

관련 노트: [[server-incident-diagnosis|서버 장애 진단 패턴]], [[realtime-websocket-server|실시간 웹소켓 서버 설계]], [[caching-strategies|캐시 전략]], [[cache-cluster-operations|캐시 클러스터 운영과 장애 대응]], [[database-models|데이터베이스 모델]], [[event-loop-server|이벤트 루프 서버]], [[database-sharding|데이터베이스 샤딩]], [[session-vs-token-auth|세션과 토큰 인증]]
