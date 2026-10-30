---
title: "Redis"
concept: "Redis"
summary: "Redis는 메모리에 데이터를 두는 키-값 저장소로, 캐시를 넘어 세션·분산 락·카운터·레이트 리미터·랭킹·큐로 쓰인다. 빠른 이유(메모리, 단일 스레드 이벤트 루프와 I/O 다중화, 효율적인 자료구조), 자료구조별 쓰임, 영속성(RDB·AOF·혼합)과 큰 키의 영향, 만료·교체 정책과 메모리 지표, 트랜잭션(MULTI·WATCH)과 Lua, 복제·센티널·클러스터와 리샤딩, ACL, 장애 진단, Memcached와의 차이를 정리한다."
tags: ["backend", "database", "redis", "cache", "nosql"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/the-ultimate-redis-101", "https://bytebytego.com/guides/why-is-redis-so-fast", "https://bytebytego.com/guides/how-can-redis-be-used", "https://bytebytego.com/guides/memcached-vs-redis", "https://bytebytego.com/guides/how-does-redis-persist-data", "https://bytebytego.com/guides/how-do-big-keys-impact-redis-persistence", "https://bytebytego.com/guides/how-redis-architecture-evolve", "https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/", "https://www.slideshare.net/charsyam2/redis-196314086", "https://mingrammer.com/redis-migration/", "https://github.com/fru1tworld/cs-basic/blob/main/interview/database/redis.md", "https://redis.io/docs/latest/develop/reference/eviction/", "https://redis.io/docs/latest/develop/using-commands/transactions/", "https://redis.io/docs/latest/operate/oss_and_stack/management/security/acl/"]
---

> ByteByteGo의 System Design 101 가이드 「[The Ultimate Redis 101](https://bytebytego.com/guides/the-ultimate-redis-101)」, 「[Why is Redis so Fast?](https://bytebytego.com/guides/why-is-redis-so-fast)」, 「[How can Redis be used?](https://bytebytego.com/guides/how-can-redis-be-used)」, 「[Memcached vs Redis](https://bytebytego.com/guides/memcached-vs-redis)」, 「[How Does Redis Persist Data?](https://bytebytego.com/guides/how-does-redis-persist-data)」, 「[How Big Keys Impact Redis Persistence](https://bytebytego.com/guides/how-do-big-keys-impact-redis-persistence)」, 「[How Redis Architecture Evolved](https://bytebytego.com/guides/how-redis-architecture-evolve)」을 바탕으로, 영속성 설정은 Redis 공식 문서로 확인해 재구성한 노트다. 운영 주의점은 「[우아한 Redis](https://www.slideshare.net/charsyam2/redis-196314086)」(발표 슬라이드, [영상](https://youtu.be/mPB2CZiAkKM)), 데이터 이전은 「[IDC에서 AWS로 Redis 데이터 이전하기](https://mingrammer.com/redis-migration/)」로 보강했다. 만료·교체 정책, 트랜잭션과 Lua, 복제와 정합성, 리샤딩, ACL, 메모리 지표와 장애 진단은 「[fru1tworld/cs-basic 모의 면접 질문 목록](https://github.com/fru1tworld/cs-basic/blob/main/interview/database/redis.md)」의 질문을 실마리로 Redis 공식 문서로 확인해 보강했다.

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

메모리에 둔다는 것 자체도 대가가 있다.

| 메모리 저장의 이점 | 대가 |
| --- | --- |
| 마이크로초 단위 읽기·쓰기, 디스크 I/O 대기 없음 | 데이터 크기가 **RAM 용량에 묶인다**. GB당 비용이 디스크보다 훨씬 비싸다 |
| 자료구조를 직렬화 없이 그대로 다룬다 | 영속성을 켜도 마지막 스냅샷·fsync 이후의 쓰기는 장애 때 잃을 수 있다 |
| 캐시·카운터처럼 잃어도 다시 만들 수 있는 데이터에 알맞다 | 영속화(fork)와 복제 중에는 메모리가 일시적으로 더 필요하다. 남는 메모리를 두고 운영한다 |

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

세션 저장소로 쓰면 여러 서버가 같은 세션을 보고, TTL로 만료가 자연스럽게 처리되며, 접근할 때마다 `EXPIRE`를 다시 걸어 활동 기준 만료(sliding expiration)도 쉽다. 대신 모든 요청이 네트워크 한 홉을 더 거치고, Redis가 죽으면 모든 사용자가 로그아웃되므로 복제·장애 조치가 필요하다. 비동기 복제라 장애 조치 직전에 만든 세션은 사라질 수 있다.

JSON 문서, 보조 인덱스 검색, 시계열, 블룸 필터 같은 확률형 자료구조는 과거에 별도 모듈(RedisJSON, RediSearch, RedisTimeSeries, RedisBloom)이었고, Redis 8부터는 기본 배포에 들어 있다. Redis 8은 벡터 유사도 검색용 벡터 집합(vector set) 자료형도 더했다. RedisGraph 같은 일부 모듈은 지원이 끝났다. 모듈은 C로 새 명령과 자료형을 더하는 확장 방식이라, 앱에서 Lua로 흉내 내는 것보다 빠르고 원자적이다.

### 내부 표현과 메모리 최적화

같은 자료형도 크기에 따라 내부 표현(encoding)이 바뀐다. `OBJECT ENCODING key`로 확인한다.

| 자료형 | 작을 때 | 커지면 | 전환 기준(기본값) |
| --- | --- | --- | --- |
| Hash | listpack(연속 메모리에 필드·값을 나란히) | 해시 테이블 | 필드 128개 초과 또는 값 64바이트 초과(`hash-max-listpack-entries`·`-value`) |
| Sorted Set | listpack | **스킵 리스트 + 해시 테이블** | 원소 128개 초과 또는 값 64바이트 초과(`zset-max-listpack-*`) |
| Set | intset(정수만) 또는 listpack | 해시 테이블 | 원소 수 기준(`set-max-intset-entries` 등) |
| List | listpack | quicklist(listpack을 이은 연결 리스트) | 크기 기준 |

**정렬 집합**은 두 구조를 함께 쓴다. 스킵 리스트는 점수순으로 원소를 정렬해 범위 조회·순위 조회(`ZRANGE`, `ZRANK`)를 O(log N)에 하고, 해시 테이블은 원소 → 점수를 O(1)로 찾는다(`ZSCORE`). 균형 트리 대신 스킵 리스트를 쓰는 이유는 구현이 단순하고 범위 순회가 쉬워서다.

| 정렬 집합 활용 | 점수 | 대표 명령 |
| --- | --- | --- |
| 랭킹 | 점수 | `ZINCRBY`, `ZREVRANGE 0 9` |
| 슬라이딩 윈도 레이트 리미터 | 요청 시각 | `ZADD` 후 `ZREMRANGEBYSCORE`로 창 밖 기록을 지우고 `ZCARD`로 센다 |
| 지연 작업 큐 | 실행할 시각 | `ZRANGEBYSCORE key 0 <지금>`으로 꺼낼 때가 된 작업을 찾는다 |
| 시간순 피드·최근 본 목록 | 타임스탬프 | `ZADD`, `ZREMRANGEBYRANK`로 개수 제한 |

**해시로 메모리 아끼기**: 작은 해시는 listpack이라 키마다 붙는 객체·포인터 오버헤드가 없다. 그래서 작은 문자열 키 수백만 개(`media:1155315 → 939`)를 그대로 두는 것보다, ID를 묶음 단위로 잘라 해시 하나에 필드로 담으면(`HSET media:1155 315 939`) 메모리가 크게 준다. 묶음 크기는 listpack 기준을 넘지 않게 잡는다. 대가로 필드마다 TTL을 주기 어렵고(7.4부터 `HEXPIRE`가 있다), 클러스터에서 분산 단위가 굵어지며, 기준을 넘으면 해시 테이블로 바뀌어 이득이 사라진다.

### 키 이름 짓기

Redis에는 테이블이 없으므로 **키 이름이 곧 구조**다. `서비스:엔터티:ID:필드`처럼 콜론으로 이름공간을 나누는 접두사(prefix)가 관례다(`order:42:items`).

- 여러 서비스·기능이 한 인스턴스를 나눠 써도 키가 겹치지 않는다.
- `SCAN 0 MATCH order:*`로 한 범주만 훑고, `--bigkeys` 결과나 메모리 사용을 접두사별로 집계할 수 있다.
- ACL의 키 패턴(`~order:*`)으로 서비스마다 접근 범위를 나눈다.
- 클러스터에서는 `{order:42}:items`처럼 해시 태그로 관련 키를 같은 슬롯에 모은다.
- 키도 메모리를 쓰므로 너무 길게 짓지 않는다. 번호로 고르는 논리 DB(`SELECT 0~15`)는 클러스터에서 0번만 쓸 수 있어 접두사로 나누는 편이 낫다.

### Pub/Sub과 Stream

| 비교 | Pub/Sub | List 큐 | Stream |
| --- | --- | --- | --- |
| 저장 | 하지 않는다. 지금 구독 중인 쪽에만 보낸다 | 꺼낼 때까지 남는다 | 로그로 남는다. `MAXLEN`으로 길이를 자른다 |
| 받는 쪽 | 구독자 **모두** (팬아웃) | 소비자 **하나** | 소비자 그룹마다 하나씩 나눠 받고, 그룹은 여러 개 둘 수 있다 |
| 처리 확인·재처리 | 없다(최대 한 번) | 꺼내면 끝. 처리 중 죽으면 잃는다(`LMOVE`로 보관 리스트를 두어 보완) | `XACK`로 확인. 확인 안 된 메시지는 대기 목록(PEL)에 남아 `XAUTOCLAIM`으로 다른 소비자가 가져간다 |
| 맞는 곳 | 실시간 알림, 여러 웹소켓 서버로 채팅 메시지 뿌리기, 로컬 캐시 무효화 방송 | 단순 작업 큐 | 재처리가 필요한 작업 큐, 이벤트 로그 |

- Pub/Sub은 끊겼던 구독자가 그동안의 메시지를 받지 못한다. 느린 구독자는 출력 버퍼가 쌓이다 한도(`client-output-buffer-limit pubsub`)를 넘으면 연결이 끊긴다.
- 클러스터에서 일반 `PUBLISH`는 모든 노드에 퍼진다. 7.0의 **샤드 Pub/Sub**(`SPUBLISH`·`SSUBSCRIBE`)은 채널을 슬롯에 매여 그 샤드 안에서만 전달해 확장된다.
- Stream은 Kafka와 모양이 닮았지만 메모리에 담기고 스트림 하나가 노드 하나에 있다. 보관 기간이 길거나 처리량이 아주 크면 Kafka 같은 전용 브로커를 쓴다.

## 만료와 메모리 교체

### 만료 설정

`SET key val EX 60`, `EXPIRE key 60`, `PEXPIREAT`로 수명을 주고, `TTL`로 남은 시간을 보고, `PERSIST`로 없앤다. 값을 `SET`으로 덮어쓰면 TTL이 사라지므로(옵션 `KEEPTTL`로 유지) 갱신 코드에서 주의한다.

운영에서 고려할 점은 셋이다.

- **동시 만료를 피한다.** 같은 시각에 채운 키들은 같은 시각에 만료되어 DB로 몰린다. TTL에 무작위 지터를 더한다([[caching-strategies|캐시 전략]]의 동시 만료).
- **TTL과 데이터 수명을 맞춘다.** 너무 짧으면 적중률이 떨어지고, 너무 길면 원본과 어긋난 값이 오래 남는다. 원본이 바뀔 때 키를 지우는 무효화를 함께 쓴다.
- **캐시 키에는 늘 TTL을 둔다.** 무효화 코드에 버그가 있어도 언젠가는 사라진다. `volatile-*` 교체 정책은 TTL이 있는 키만 대상으로 한다.

### 만료가 처리되는 방식

만료 시각이 지난다고 그 순간 지워지지는 않는다. 키마다 타이머를 두면 비싸므로 두 방식을 섞는다.

| 방식 | 동작 |
| --- | --- |
| 수동 만료(passive) | 키에 접근할 때 만료됐는지 확인하고, 지났으면 그때 지우고 없는 것처럼 답한다 |
| 능동 만료(active) | 주기적으로(`hz`, 기본 초당 10번) TTL이 있는 키의 일부를 표본으로 골라 만료된 것을 지운다. 만료된 비율이 높으면 같은 주기 안에서 더 돈다. 한 번에 쓰는 CPU 시간에는 상한이 있다 |

- 아무도 읽지 않는 만료 키는 능동 만료가 찾을 때까지 메모리를 차지한다. 만료 키가 한꺼번에 아주 많이 생기면 능동 만료가 CPU를 써서 지연이 튈 수 있다.
- 복제본은 스스로 키를 지우지 않는다. 주가 키를 지우면서 `DEL`을 복제 스트림과 AOF에 남기고, 복제본은 그것을 받아 지운다(읽기 요청에는 만료된 키를 없는 것으로 답한다). 그래서 모든 사본이 같은 시점에 같은 키를 지운다.
- 큰 키의 만료 삭제가 메인 스레드를 막지 않게 `lazyfree-lazy-expire yes`로 백그라운드에서 해제한다.

### 교체 정책 (eviction)

`maxmemory`에 닿으면 새 쓰기가 들어올 때 `maxmemory-policy`에 따라 키를 내보낸다. 교체 알고리즘 일반론은 [[caching-strategies|캐시 전략]]에 있다.

| 정책 | 대상 키 | 내보내는 기준 |
| --- | --- | --- |
| `noeviction` (기본값) | - | 내보내지 않고 쓰기 명령에 오류를 낸다. 읽기는 된다 |
| `allkeys-lru` / `volatile-lru` | 전체 / TTL 있는 키 | 가장 오래 안 쓴 것 |
| `allkeys-lfu` / `volatile-lfu` | 전체 / TTL 있는 키 | 가장 적게 쓴 것(4.0부터). 횟수는 시간이 지나면 감쇠한다 |
| `allkeys-lrm` / `volatile-lrm` | 전체 / TTL 있는 키 | 가장 오래 **안 고친** 것(8.6부터). 읽기는 기록하지 않는다 |
| `allkeys-random` / `volatile-random` | 전체 / TTL 있는 키 | 무작위 |
| `volatile-ttl` | TTL 있는 키 | 남은 TTL이 가장 짧은 것 |

- LRU·LFU는 정확한 값이 아니라 **근사**다. 키 몇 개(`maxmemory-samples`, 기본 5)를 표본으로 뽑아 그중 가장 나쁜 것을 내보낸다. 표본을 10으로 늘리면 정확한 LRU에 가까워지고 CPU를 조금 더 쓴다.
- 고르는 기준: 순수 캐시이고 일부 키에 접근이 몰리면 `allkeys-lru`(무난한 기본), 인기 키가 오래 유지되면 `allkeys-lfu`, 캐시와 지우면 안 되는 데이터를 한 인스턴스에 섞었다면 `volatile-*`(가능하면 인스턴스를 나눈다). 세션·큐처럼 잃으면 안 되는 데이터만 있으면 `noeviction`으로 두고 메모리 경보를 건다.
- `volatile-*` 정책인데 TTL 있는 키가 없으면 `noeviction`처럼 동작해 쓰기가 실패한다.
- 복제·AOF 버퍼는 `maxmemory` 계산에서 빠지므로, 영속성이나 복제를 쓰면 물리 메모리보다 넉넉히 낮게 잡는다.

### 메모리 지표: used_memory와 RSS

| 지표 (`INFO memory`) | 뜻 |
| --- | --- |
| `used_memory` | Redis가 할당자(jemalloc)에 요청해 쓰고 있는 메모리. 데이터 + 내부 구조 + 클라이언트 버퍼 |
| `used_memory_rss` | OS가 보는 프로세스의 실제 상주 메모리 |
| `mem_fragmentation_ratio` | RSS ÷ used_memory. 1보다 꽤 크면(1.5 이상) 단편화, **1보다 작으면 스왑**을 의심한다 |
| `used_memory_peak` | 지금까지의 최대치. 지금 줄었어도 RSS가 그만큼 남아 있을 수 있다 |
| `mem_not_counted_for_evict` | 복제·AOF 버퍼처럼 교체 계산에서 빠지는 양 |

RSS가 `used_memory`보다 큰 이유는 두 가지다.

- **단편화**: 키를 지워도 할당자가 그 공간을 OS에 바로 돌려주지 않는다. 크기가 제각각인 값이 생겼다 지워지면 페이지 곳곳에 빈 조각이 남는다. jemalloc을 쓸 때 `activedefrag yes`로 **능동 단편화 정리**를 켜면 값을 조금씩 새 자리로 옮겨 조각을 모은다. 재시작이나 복제본 승격으로도 초기화된다.
- **백그라운드 저장 중 COW**: `BGSAVE`·AOF 재작성은 fork한 자식이 메모리를 공유한 채 파일을 쓴다. 그동안 부모가 쓰기를 받으면 바뀐 페이지만 복사되므로, 쓰기가 많으면 RSS가 크게 늘고 최악에는 두 배 가까이 된다. 리눅스의 투명 대용량 페이지(THP)를 켜 두면 4KB 대신 2MB 단위로 복사돼 더 커지므로 끈다. fork가 메모리 부족으로 실패하지 않게 `vm.overcommit_memory = 1`을 권장한다.

| 확인 명령 | 용도 |
| --- | --- |
| `INFO memory`, `MEMORY STATS` | 위 지표 전체 |
| `MEMORY DOCTOR` | 단편화·피크 같은 문제를 문장으로 진단 |
| `MEMORY USAGE key` | 키 하나가 쓰는 바이트 |
| `redis-cli --bigkeys`, `--memkeys` | `SCAN`으로 훑어 가장 큰 키를 자료형별로 찾는다 |

## 트랜잭션과 Lua 스크립트

### MULTI·EXEC와 WATCH

`MULTI` 뒤의 명령은 바로 실행되지 않고 큐에 쌓였다가 `EXEC`에서 **한 번에 연달아** 실행된다. 단일 스레드라 그 사이에 다른 클라이언트의 명령이 끼어들지 않는다. `DISCARD`는 큐를 버린다.

```text
WATCH stock:1                 ← 이 키를 지켜본다
GET stock:1   → 10            ← 읽고 앱에서 계산
MULTI
DECRBY stock:1 1
EXEC          → 그사이 누가 stock:1을 바꿨으면 nil(전체 취소), 아니면 실행
```

**WATCH는 낙관적 잠금**이다. 지켜본 키가 `EXEC` 전에 바뀌면 트랜잭션 전체가 실행되지 않고 nil을 돌려주므로, 앱은 처음부터 다시 읽고 시도한다. 잠그지 않으므로 기다림이 없지만 경쟁이 심하면 재시도가 늘어난다.

ACID로 보면 다음과 같다.

| 성질 | Redis 트랜잭션 |
| --- | --- |
| 원자성 | **부분적**. 큐에 넣을 때 문법 오류가 있으면 `EXEC`가 전체를 거절한다. 하지만 실행 중 오류(문자열 키에 리스트 명령 등)는 그 명령만 실패하고 **나머지는 실행된다. 롤백이 없다** |
| 일관성 | 앱이 정한 불변식을 DB가 검사하지 않는다. `WATCH`로 읽은 값이 그대로일 때만 쓰게 해서 지킨다 |
| 격리성 | 강하다. 실행 중에 다른 명령이 끼어들지 않아 직렬 실행과 같다 |
| 지속성 | 영속성 설정을 따른다. `appendfsync always`가 아니면 커밋 직후 장애에 잃을 수 있다 |

### Lua 스크립트와 함수

`WATCH`로는 「읽고 판단하고 쓰는」 흐름이 여러 번 왕복하고 재시도도 필요하다. **Lua 스크립트**는 그 흐름 전체를 서버에서 한 번에 실행한다.

```text
EVAL "local v = tonumber(redis.call('GET', KEYS[1]) or '0')
      if v > 0 then return redis.call('DECR', KEYS[1]) end
      return -1" 1 stock:1
```

- **원자적**이다. 스크립트가 도는 동안 다른 명령이 실행되지 않는다. 그래서 재고 차감, 분산 락 해제(자기 값일 때만 `DEL`), 레이트 리미터처럼 조건과 쓰기를 묶을 때 쓴다.
- 네트워크 왕복이 한 번으로 준다.
- 대신 **스크립트가 길면 서버 전체가 멈춘다.** 일정 시간(`busy-reply-threshold`, 기본 5초)을 넘으면 다른 클라이언트는 `BUSY` 오류를 받고, 아직 쓰기를 하지 않은 스크립트만 `SCRIPT KILL`로 멈출 수 있다. 무거운 반복은 넣지 않는다.
- 사용할 키는 `KEYS` 인자로 넘긴다. 클러스터에서 키들이 같은 슬롯에 있는지 판단하는 근거가 된다.
- `EVALSHA`로 스크립트 해시만 보내 재사용한다. Redis 7.0의 **함수**(`FUNCTION LOAD`, `FCALL`)는 스크립트를 서버에 이름 붙여 저장하고 영속화·복제까지 해 주는, 스크립트의 관리형 버전이다.

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

### 복제가 동작하는 방식

```text
복제본 ── PSYNC <replication ID> <offset> ──▶ 주
  ├─ 주의 복제 백로그(repl-backlog-size, 기본 1MB)에 그 offset 이후가 남아 있다
  │     → 부분 재동기화: 빠진 명령만 보낸다
  └─ 처음 연결이거나 백로그를 넘었다
        → 전체 재동기화: 주가 RDB 스냅샷을 만들어(fork) 보내고,
          그동안 들어온 쓰기는 버퍼에 모았다가 이어서 보낸다
이후   주가 실행한 쓰기 명령을 복제 스트림으로 계속 흘려보낸다
```

- 복제는 **비동기**다. 주는 쓰기에 응답한 뒤 복제본에 보낸다. 복제본은 기본적으로 읽기 전용이고, 읽기 부하를 나누거나 장애 조치 후보가 된다.
- 연결이 자주 끊기는 환경이면 백로그를 키워 전체 재동기화를 줄인다. 전체 재동기화는 fork와 대량 전송 때문에 주에 부담이 크다. RDB를 디스크에 쓰지 않고 소켓으로 바로 보내는 diskless 복제도 있다.
- 주의 영속성을 끄고 자동 재시작을 켜 두면 위험하다. 빈 상태로 다시 뜬 주를 복제본이 따라가 데이터가 전부 지워진다.

### 복제와 정합성

비동기 복제에서는 주가 응답한 쓰기가 복제본에 닿기 전에 주가 죽으면, 승격된 복제본에는 그 쓰기가 없다. 정합성을 높이는 장치와 한계는 다음과 같다.

| 방법 | 동작 | 한계 |
| --- | --- | --- |
| `WAIT numreplicas timeout` | 그 연결의 앞선 쓰기를 복제본 N개가 받을 때까지 기다린다(반동기처럼 쓴다) | 복제본이 받았다는 뜻이지 디스크에 썼다는 뜻은 아니다. 장애 조치가 그 복제본을 고른다는 보장도 없어 **강한 일관성이 되지는 않는다** |
| `WAITAOF`(7.2) | 로컬·복제본의 AOF fsync까지 기다린다 | 지연이 크게 늘어난다 |
| `min-replicas-to-write` + `min-replicas-max-lag` | 지연이 일정 초 이내인 복제본이 N개 미만이면 주가 쓰기를 거절한다 | 네트워크 분할로 고립된 옛 주가 쓰기를 받는 시간을 줄일 뿐 없애지는 못한다 |
| Lua·`MULTI`로 묶기 | 한 노드 안의 여러 키 갱신을 원자적으로 | 노드 사이·복제본과의 정합성과는 별개다 |
| 원본을 따로 두기 | 잃으면 안 되는 데이터는 RDB 같은 원본에 두고 Redis는 다시 만들 수 있는 사본으로 쓴다 | 캐시 무효화가 필요하다 |

동기 복제처럼 확인을 기다릴수록 잃는 쓰기는 줄고 지연은 늘어난다. Redis는 기본적으로 지연 쪽을 고른 설계이므로, 강한 일관성이 필요한 데이터는 Redis에만 두지 않는다.

### 센티널의 장애 조치

센티널은 주·복제본과 별개로 도는 감시 프로세스이고, 서로 다른 장애 영역에 **3개 이상(홀수)** 둔다.

```text
1. 센티널 하나가 down-after-milliseconds 동안 주의 응답을 못 받음 → 주관적 다운(SDOWN)
2. quorum 수 이상의 센티널이 동의 → 객관적 다운(ODOWN)
3. 센티널 과반의 투표로 장애 조치를 맡을 리더 센티널을 뽑는다
4. 리더가 복제본 하나를 고른다(replica-priority, 복제 offset이 앞선 것 순)
   → REPLICAOF NO ONE으로 승격, 나머지 복제본이 새 주를 따르게 한다
5. 클라이언트는 센티널에 새 주 주소를 묻는다 (SENTINEL get-master-addr-by-name)
```

quorum은 「장애로 판정하는 데 필요한 수」이고, 실제 장애 조치는 센티널 **과반**이 살아 있어야 진행된다. 그래서 소수 쪽으로 분할된 센티널은 장애 조치를 하지 못한다.

### 클러스터 리샤딩

노드를 더하거나 빼면 해시 슬롯을 옮긴다(`redis-cli --cluster reshard`, `--cluster rebalance`). 슬롯 하나는 다음 순서로 옮겨진다.

```text
1. 대상 노드: CLUSTER SETSLOT <slot> IMPORTING <원본 ID>
2. 원본 노드: CLUSTER SETSLOT <slot> MIGRATING <대상 ID>
3. 원본의 키를 CLUSTER GETKEYSINSLOT으로 꺼내 MIGRATE로 묶음 단위 이동
4. 모든 노드에 CLUSTER SETSLOT <slot> NODE <대상 ID> 로 소유권 확정
```

- 옮기는 도중 원본에 없는 키를 요청하면 원본이 **`ASK`** 로 대상 노드를 알려 준다. 클라이언트는 그 한 번만 `ASKING`을 붙여 대상에 묻는다. 이동이 끝나면 **`MOVED`** 를 받아 슬롯 지도를 갱신한다. 이 둘을 처리하는 클러스터 지원 클라이언트를 써야 한다.
- `MIGRATE`는 키 하나를 옮기는 동안 두 노드를 막는다. **큰 키**가 있으면 그 시간 동안 지연이 튄다. 미리 쪼개 둔다.
- 이동 중인 슬롯에 걸친 다중 키 명령은 `TRYAGAIN` 오류가 날 수 있다.
- 슬롯 이동은 네트워크와 CPU를 쓰므로 한가한 시간에, 메모리가 넉넉한 노드로 한다.

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

## 보안과 접근 제어

Redis는 신뢰할 수 있는 내부망에서 쓰도록 설계됐다. 인터넷에 열린 Redis는 데이터 탈취와 서버 장악(설정 명령으로 파일 쓰기)의 표적이 된다.

| 층 | 방법 |
| --- | --- |
| 네트워크 | `bind`로 내부 주소에만 열고 방화벽·보안 그룹으로 앱 서버만 허용한다. 비밀번호 없이 기본 설정으로 뜨면 `protected-mode`가 외부 접속을 거절한다 |
| 인증 | `requirepass`(기본 사용자 `default`의 비밀번호) 또는 ACL 사용자 |
| 권한 | **ACL**(6.0): 사용자마다 쓸 수 있는 명령과 키·채널 범위를 정한다 |
| 암호화 | TLS(6.0)로 클라이언트·복제·클러스터 버스 통신을 암호화한다 |
| 위험 명령 | `FLUSHALL`, `CONFIG`, `KEYS`, `DEBUG`는 ACL에서 뺀다. 옛 방식인 `rename-command`보다 ACL이 낫다 |

여러 서비스가 한 Redis를 나눠 쓸 때는 서비스마다 ACL 사용자를 두고 **키 접두사로 범위를 자른다.**

```text
ACL SETUSER order-svc on >비밀번호 ~order:* &order:* +@read +@write -@dangerous
ACL SETUSER report    on >비밀번호 %R~order:* +@read
ACL SETUSER default off
```

| 규칙 | 뜻 |
| --- | --- |
| `on` / `off` | 사용자 활성화 |
| `>비밀번호` | 비밀번호 추가(저장은 SHA-256 해시) |
| `~패턴` | 읽고 쓸 수 있는 키 패턴. `%R~`는 읽기만, `%W~`는 쓰기만(7.0) |
| `&패턴` | Pub/Sub 채널 패턴 |
| `+@범주`, `-명령` | 명령 범주(`@read`, `@write`, `@admin`, `@dangerous` 등)나 개별 명령 허용·금지 |

규칙은 `ACL SAVE`로 ACL 파일에 남겨 재시작 뒤에도 유지하고, `ACL LOG`로 거부된 시도를 본다. 7.0의 선택자(selector)로 「이 키 범위에는 이 명령만」 같은 조합 규칙도 만든다. 기본 사용자를 꺼 두면 비밀번호를 모르는 클라이언트가 붙지 못한다.

## 운영에서 조심할 것

| 주의점 | 이유와 대응 |
| --- | --- |
| 컬렉션 하나에 너무 많이 담지 않는다 | 원소가 많으면 조회·삭제 한 번이 길어져 다른 요청을 막는다. 수천 개 수준을 넘으면 키를 나눠 담는다 |
| 만료는 키 단위다 | 리스트·집합 안의 원소마다 TTL을 줄 수 없다. 원소별 만료가 필요하면 키를 나누거나 정렬 집합에 만료 시각을 점수로 넣고 주기적으로 지운다. Redis 7.4부터는 해시 필드에 한해 `HEXPIRE`로 필드 단위 만료를 줄 수 있다 |
| 정렬 집합의 점수는 실수(double) | 아주 큰 정수나 정밀한 소수는 정확히 표현되지 않는다. 점수에 넣을 값의 범위를 확인한다 |
| `maxmemory`만 믿지 않는다 | 단편화와 fork 중 COW 때문에 실제 RSS가 설정값보다 커질 수 있고, 물리 메모리를 넘으면 스왑으로 급격히 느려진다(위 「메모리 지표」). 큰 인스턴스 하나보다 작은 인스턴스 여러 개가 안전할 수 있다 |
| 복제는 비동기다 | 장애 조치 순간 마지막 쓰기가 사라질 수 있다. 전체 재동기화는 fork로 메모리를 더 쓰고, 여러 복제본이 한꺼번에 재동기화하면 마스터가 버티지 못하므로 재시도 시점을 흩는다 |
| 원자적 명령을 활용한다 | `INCR`, `SETNX`, 정렬 집합 갱신은 원자적이라 읽고-고치고-쓰는 경쟁 조건을 피한다. 여러 명령을 앱에서 조합하면 다시 경쟁이 생기므로 `MULTI`나 Lua 스크립트로 묶는다 |

### 모니터링과 장애 진단

| 무엇을 보나 | 명령·지표 |
| --- | --- |
| 처리량·연결 | `INFO stats`의 `instantaneous_ops_per_sec`, `INFO clients`의 `connected_clients`·`blocked_clients`, `rejected_connections` |
| 느린 명령 | `SLOWLOG GET`(실행 시간이 `slowlog-log-slower-than`, 기본 10ms를 넘은 명령), `INFO commandstats`(명령별 호출 수·평균 시간) |
| 지연 원인 | `LATENCY DOCTOR`(`latency-monitor-threshold`를 켜야 기록), `redis-cli --latency`, `--intrinsic-latency` |
| 메모리 | 위 「메모리 지표」 |
| 캐시 효율 | `keyspace_hits`, `keyspace_misses`, `evicted_keys`, `expired_keys` |
| 영속성·복제 | `INFO persistence`의 `latest_fork_usec`·`aof_delayed_fsync`, `INFO replication`의 복제 offset 차이 |

`MONITOR`는 모든 명령을 실시간으로 보여 주지만 처리량을 크게 떨어뜨리므로 운영에서는 잠깐만 쓴다. 지속 감시는 `redis_exporter` + Prometheus 같은 수집기로 한다. 성능에 영향이 큰 설정은 `maxmemory`와 교체 정책, `appendfsync`, `io-threads`, 지연 해제(`lazyfree-*`), 그리고 OS 쪽의 THP 끄기와 `vm.overcommit_memory`다. 앱 쪽에서는 파이프라이닝으로 왕복을 줄이고 `KEYS` 대신 `SCAN`을 쓴다.

**응답이 느린데 SLOWLOG가 비어 있다면**, SLOWLOG는 명령 **실행 시간만** 재고 대기열에서 기다린 시간, 네트워크 전송, 응답을 클라이언트로 쓰는 시간은 재지 않는다는 점을 떠올린다.

| 확인할 것 | 증상과 지표 |
| --- | --- |
| 네트워크·클라이언트 | 앱과 Redis 사이 왕복 지연, 큰 값 전송으로 대역폭 포화, 클라이언트 커넥션 풀 고갈. 앱 쪽 지연과 `redis-cli --latency`를 비교한다 |
| 대기열 | 명령 하나는 빨라도 초당 처리량이 한계에 가까우면 뒤 명령이 기다린다. `instantaneous_ops_per_sec`와 CPU 사용률 |
| fork | 백그라운드 저장·AOF 재작성 때 fork가 메인 스레드를 멈춘다. `latest_fork_usec` |
| 디스크 fsync | AOF fsync가 늦으면 쓰기가 막힌다. `aof_delayed_fsync` |
| 스왑·THP | `mem_fragmentation_ratio`가 1 미만이면 스왑. THP는 fork 뒤 지연을 키운다 |
| CPU 경합 | 같은 호스트의 다른 프로세스, 가상화 환경의 CPU steal. `--intrinsic-latency`로 호스트 자체의 지연을 잰다 |
| 대량 만료·삭제 | 같은 시각 만료되는 키가 많거나 큰 키를 `DEL`로 지울 때 |

**캐시 적중률이 떨어졌을 때** 메모리 부족인지 TTL 문제인지는 `INFO stats`로 구분한다.

| 지표 모양 | 판단 |
| --- | --- |
| `evicted_keys`가 늘고 `used_memory`가 `maxmemory`에 붙어 있다 | **메모리 부족**. 쓸 키를 밀어내고 있다. 메모리를 늘리거나, 큰 키·불필요한 키를 줄이거나, 교체 정책을 바꾼다 |
| `evicted_keys`는 거의 0인데 `expired_keys`가 늘었다 | **TTL이 너무 짧거나** 같은 시각에 몰려 만료된다. TTL을 늘리거나 지터를 준다 |
| 둘 다 그대로인데 미스가 늘었다 | 키 이름이 바뀐 배포, 새로운 키 패턴 유입, DB에도 없는 키 조회(캐시 관통)를 의심한다 |

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
- 만료는 접근 시 확인과 주기적 표본 검사로 처리되고, 메모리가 차면 `maxmemory-policy`(근사 LRU·LFU 등)로 내보낸다.
- `MULTI`/`EXEC`는 끼어들기 없이 실행되지만 롤백은 없다. 조건부 갱신은 `WATCH`(낙관적 잠금)나 Lua 스크립트로 묶는다.
- 여러 서비스가 나눠 쓰면 키 접두사와 ACL로 범위를 나눈다.

관련 노트: [[server-incident-diagnosis|서버 장애 진단 패턴]], [[realtime-websocket-server|실시간 웹소켓 서버 설계]], [[caching-strategies|캐시 전략]], [[cache-cluster-operations|캐시 클러스터 운영과 장애 대응]], [[database-models|데이터베이스 모델]], [[event-loop-server|이벤트 루프 서버]], [[database-sharding|데이터베이스 샤딩]], [[session-vs-token-auth|세션과 토큰 인증]]
