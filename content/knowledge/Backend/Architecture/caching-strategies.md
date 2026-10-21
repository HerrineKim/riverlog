---
title: "캐시 전략: 계층, 읽기·쓰기 패턴, 교체 정책, 장애 패턴"
concept: "Caching Strategies"
summary: "캐시는 요청 경로의 거의 모든 층에 있다. 캐시와 원본을 맞추는 읽기·쓰기 패턴(cache-aside, read-through, write-through, write-around, write-back), 꽉 찼을 때 무엇을 버릴지 정하는 교체 정책(LRU·LFU·FIFO·SLRU·TTL 등), 그리고 캐시가 오히려 DB를 무너뜨리는 네 가지 장애(동시 만료, 관통, 핫 키 만료, 캐시 다운)와 대응을 정리한다."
tags: ["backend", "cache", "architecture", "performance", "database"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/cache-systems-every-developer-should-know", "https://bytebytego.com/guides/learn-cache", "https://bytebytego.com/guides/things-to-consider-when-using-cache", "https://bytebytego.com/guides/top-5-caching-strategies", "https://bytebytego.com/guides/what-are-the-top-caching-strategies", "https://bytebytego.com/guides/most-popular-cache-eviction", "https://bytebytego.com/guides/top-8-cache-eviction-strategies", "https://bytebytego.com/guides/how-can-cache-systems-go-wrong", "https://bytebytego.com/guides/cache-miss-attack"]
---

> ByteByteGo의 System Design 101 가이드 「[Cache Systems Every Developer Should Know](https://bytebytego.com/guides/cache-systems-every-developer-should-know)」, 「[Things to Consider When Using Cache](https://bytebytego.com/guides/things-to-consider-when-using-cache)」, 「[Top 5 Caching Strategies](https://bytebytego.com/guides/top-5-caching-strategies)」, 「[Top 8 Cache Eviction Strategies](https://bytebytego.com/guides/top-8-cache-eviction-strategies)」, 「[How Can Cache Systems Go Wrong?](https://bytebytego.com/guides/how-can-cache-systems-go-wrong)」, 「[Cache Miss Attack](https://bytebytego.com/guides/cache-miss-attack)」 등을 바탕으로 재구성한 노트다.

## 캐시란

캐시(cache)는 **느린 원본 대신 빠른 저장소에 결과 사본을 두고 다시 쓰는 장치**다. 원본은 DB, 다른 서비스, 디스크, 멀리 있는 서버 등이다. 사본은 메모리나 사용자 가까운 곳에 둔다.

캐시는 공짜가 아니다. 사본을 두는 순간 **원본과 사본이 어긋날 수 있다**는 문제가 생긴다. 그래서 캐시 설계는 세 질문으로 정리된다.

| 질문 | 다루는 것 |
| --- | --- |
| 원본과 사본을 어떻게 맞추나 | 읽기·쓰기 패턴, TTL, 무효화 |
| 꽉 차면 무엇을 버리나 | 교체(eviction) 정책 |
| 캐시가 비거나 죽으면 어떻게 되나 | 동시 만료, 관통, 핫 키, 캐시 다운 |

## 언제 효과가 큰가

- **읽기가 쓰기보다 훨씬 많다.** 같은 결과를 여러 번 재사용할수록 이득이다.
- **데이터가 자주 바뀌지 않는다.** 자주 바뀌면 무효화 비용이 이득을 먹는다.
- **원본 접근이 비싸다.** 무거운 쿼리, 먼 네트워크, 외부 API.
- **약간 오래된 값을 허용한다.** 강한 일관성이 필요한 값(잔액, 재고 차감)은 캐시를 판단 근거로 쓰지 않는다.

## 캐시는 어디에나 있다

요청이 지나가는 거의 모든 층에 캐시가 있다.

```text
브라우저 ─▶ CDN ─▶ 로드 밸런서 ─▶ 서비스 ─▶ 분산 캐시 ─▶ DB
 HTTP 캐시   엣지 캐시   응답 캐시    로컬 메모리    Redis 등     버퍼 풀
                                    (+ 디스크)                 머티리얼라이즈드 뷰
           옆길: 메시지 브로커(디스크에 보존), 검색엔진(색인 = 질의용 사본)
```

| 층 | 캐시하는 것 | 자세히 |
| --- | --- | --- |
| 클라이언트 | HTTP 응답. 서버가 헤더로 신선도를 정하고 브라우저가 재사용한다 | [[http-cache\|HTTP 캐시]] |
| CDN | 이미지·CSS·JS 같은 정적 파일, 일부 동적 응답 | [[cdn\|CDN]] |
| 로드 밸런서·리버스 프록시 | 자주 요청되는 응답을 백엔드까지 가지 않고 돌려준다 | [[web-server-and-nginx\|웹 서버와 Nginx]] |
| 메시지 브로커 | Kafka처럼 보존 기간 동안 메시지를 디스크에 쌓아 두고, 소비자가 제 속도로 다시 읽게 한다 | |
| 서비스 | 프로세스 메모리(로컬 캐시), 큰 데이터는 로컬 디스크 | [[cache-cluster-operations\|캐시 클러스터 운영과 장애 대응]] |
| 분산 캐시 | 여러 서버가 함께 보는 키-값 저장소 | [[redis\|Redis]] |
| 검색엔진 | 역인덱스. 원본 DB를 검색하기 좋은 모양으로 바꾼 사본이다 | [[elasticsearch\|Elasticsearch와 ELK 스택]] |
| DB | 버퍼 풀(디스크 페이지의 메모리 사본), 머티리얼라이즈드 뷰(무거운 쿼리 결과를 미리 저장) | |

HTTP 캐시·객체 캐시의 종류와 위치는 [[web-scalability-components|웹 확장성의 구성 요소]]에서도 다룬다.

## 읽기·쓰기 패턴

캐시와 DB를 어떻게 맞추느냐에 따라 다섯 패턴이 있다. 읽기 둘, 쓰기 셋이다.

### 읽기

| 패턴 | 흐름 | 특징 |
| --- | --- | --- |
| **Cache-aside** (lazy loading) | 앱이 캐시를 본다 → 없으면 앱이 DB에서 읽고 캐시에 넣는다 | 가장 흔하다. 요청된 것만 캐시된다. 캐시가 죽어도 DB로 동작한다. 첫 요청은 항상 느리다 |
| **Read-through** | 앱은 캐시만 본다 → 없으면 **캐시가** DB에서 읽어 채운다 | 로딩 로직이 캐시 계층(라이브러리·프록시)에 있다. 앱 코드는 단순하지만 캐시 제품이 그 기능을 지원해야 한다 |

### 쓰기

| 패턴 | 흐름 | 일관성 | 쓰기 지연 | 위험 |
| --- | --- | --- | --- | --- |
| **Write-through** | 캐시에 쓰고 **동시에** DB에 쓴다. 둘 다 끝나야 완료 | 높다 | 크다(두 곳에 씀) | 한 번도 안 읽힐 데이터까지 캐시에 쌓인다 |
| **Write-around** | DB에만 쓰고 캐시는 건너뛴다(또는 해당 키를 지운다) | 다음 읽기에서 맞춰진다 | 작다 | 방금 쓴 값을 바로 읽으면 미스가 난다 |
| **Write-back** (write-behind) | 캐시에만 쓰고 완료. DB에는 나중에 모아서 쓴다 | 낮다 | 가장 작다 | DB 반영 전에 캐시가 죽으면 **데이터를 잃는다** |

```text
Write-through : 앱 ─▶ 캐시 ─▶ DB      (둘 다 끝나야 응답)
Write-around  : 앱 ─────────▶ DB      (캐시는 다음 읽기 때 채움)
Write-back    : 앱 ─▶ 캐시 ··▶ DB     (비동기·일괄 반영)
```

**패턴은 섞어 쓴다.** 가장 흔한 조합은 **cache-aside + write-around**다. 쓸 때 DB를 갱신하고 캐시 키를 지우면(invalidate), 다음 읽기가 최신 값을 다시 채운다. 키를 「갱신」하지 않고 「삭제」하는 이유는 동시에 들어온 두 쓰기가 캐시에 순서를 뒤바꿔 남기는 경쟁을 줄이기 위해서다.

Write-back은 조회수·좋아요처럼 **잃어도 치명적이지 않고 쓰기가 폭주하는 값**에 어울린다. 하드웨어의 CPU 캐시도 같은 쓰기 정책 구분을 쓴다([[cache-and-virtual-memory|캐시 메모리와 가상 메모리]]).

## 교체 정책

캐시가 꽉 차면 무언가를 내보내야(evict) 한다. 무엇을 내보내느냐가 **적중률(hit ratio)** 을 정한다.

| 정책 | 내보내는 것 | 어울리는 경우 | 비용·한계 |
| --- | --- | --- | --- |
| **LRU** (Least Recently Used) | 가장 오래 안 쓴 것 | 최근에 쓴 것을 곧 다시 쓰는 경우(시간 지역성). 기본값으로 가장 흔하다 | 한 번 훑고 지나가는 대량 조회(스캔)가 인기 항목을 밀어낸다 |
| **LFU** (Least Frequently Used) | 가장 적게 쓴 것 | 인기 항목이 뚜렷하고 오래 유지될 때 | 접근 횟수를 세야 한다. 예전 인기 항목이 계속 남는 문제가 있어 횟수를 감쇠시킨다 |
| **FIFO** | 가장 먼저 들어온 것 | 구현이 가장 단순하다 | 사용 패턴을 보지 않는다 |
| **RR** (Random Replacement) | 무작위 | 추적 비용 없이 그럭저럭 | 운에 맡긴다 |
| **MRU** (Most Recently Used) | 가장 최근에 쓴 것 | 한 번 쓴 데이터를 다시 안 쓰는 순차 스캔·배치·스트리밍 | 일반 웹 캐시에는 맞지 않는다 |
| **SLRU** (Segmented LRU) | 수습 구간의 LRU부터 | 스캔에 강한 LRU가 필요할 때 | 새 항목은 수습(probationary) 구간에 들어가고, 다시 쓰이면 보호(protected) 구간으로 승격된다. 한 번 쓰고 마는 항목이 인기 항목을 밀어내지 못한다 |
| **TTL** | 수명이 다한 것 | 세션, 토큰, 일정 시간만 유효한 값. 다른 정책의 안전망으로도 쓴다 | 엄밀히는 교체 정책이 아니라 만료 규칙이다. 자주 쓰는 값도 시간이 되면 사라진다 |

- **2계층 캐시**(two-tier caching)는 교체 정책이라기보다 배치 전략이다. 1차는 프로세스 메모리, 2차는 분산 캐시에 둔다. 1차는 빠르지만 서버마다 내용이 다르므로 TTL을 짧게 둔다.
- 실제 제품은 이론적 정책을 근사한다. Redis는 표본을 몇 개 뽑아 그중에서 LRU·LFU를 고르는 근사 알고리즘을 쓰고, 자바 Caffeine 같은 로컬 캐시는 빈도와 최근성을 섞은 W-TinyLFU를 쓴다.

## 캐시가 DB를 무너뜨리는 네 가지 경우

캐시가 있으면 DB는 **캐시가 막아 주는 만큼의 트래픽만 견디도록** 작게 설계되기 쉽다. 그래서 캐시가 제 역할을 못 하는 순간 DB가 한꺼번에 무너진다.

```text
평소         요청 100 ─▶ 캐시(적중 95) ─▶ DB 5
캐시 실패 시  요청 100 ─▶ 캐시(적중 0)  ─▶ DB 100   ← 20배
```

| 문제 | 원인 | 대응 |
| --- | --- | --- |
| **동시 만료** (thundering herd, cache avalanche) | 많은 키가 **같은 시각에 만료**되거나, 재시작 직후 캐시가 비어 있다(cold start) | TTL에 **무작위 지터**를 더해 만료를 흩는다. 배포 전에 캐시를 미리 채운다(warm-up). 복구 중에는 핵심 요청만 DB로 보내고 나머지는 막거나 늦춘다 |
| **캐시 관통** (cache penetration) | **DB에도 없는 키**를 계속 묻는다. 캐시에 채울 값이 없으니 매번 DB까지 간다. 악의적으로 없는 키를 대량 요청하면 공격(cache miss attack)이 된다 | 「없음」 자체를 **짧은 TTL로 캐시**한다(null caching). **블룸 필터**로 존재 가능성이 없는 키를 캐시·DB 앞에서 거른다. 키 형식을 입력 단계에서 검증한다 |
| **핫 키 만료** (cache breakdown) | 요청이 몰리는 **인기 키 하나**가 만료되는 순간 수많은 요청이 동시에 DB로 간다 | 핫 키는 만료를 두지 않거나 만료 전에 백그라운드에서 갱신한다. 미스가 나면 **한 요청만** DB를 읽게 하고 나머지는 그 결과를 기다리게 한다(뮤텍스·single-flight). 로컬 캐시로 핫 키를 흡수한다 |
| **캐시 다운** (cache crash) | 캐시 서버 자체가 죽는다 | 캐시를 클러스터·복제본으로 이중화한다. **서킷 브레이커**로 캐시 장애 시 DB에 몰려가지 않고 빠르게 실패하거나 기본값으로 응답한다 |

**블룸 필터**(Bloom filter)는 「확실히 없다」 또는 「아마 있다」만 답하는 작은 확률적 자료구조다. 「없다」는 틀리지 않으므로 없는 키를 DB 앞에서 버리기에 알맞다. 「있다」는 가끔 틀리므로 그 경우에는 캐시와 DB를 확인한다. 데이터가 추가될 때 필터도 함께 갱신해야 한다.

핫 키를 로컬 캐시로 흡수하고 장애 노드를 걸러 내는 운영 기법은 [[cache-cluster-operations|캐시 클러스터 운영과 장애 대응]]에 있다.

## 캐시 지표

| 지표 | 의미 |
| --- | --- |
| 적중률(hit ratio) | 전체 조회 중 캐시가 답한 비율. 가장 중요한 지표 |
| 지연 시간 | 캐시 조회 자체의 응답 시간(p99까지 본다) |
| 처리량 | 초당 처리하는 요청 수 |
| 무효화율 | 얼마나 자주 키가 지워지거나 갱신되나. 높으면 캐시할 데이터가 아니다 |
| 메모리 사용량 · 교체 횟수 | 용량이 모자라 쓸 만한 키를 버리고 있지 않나 |
| CPU · 네트워크 사용량 | 큰 값, 직렬화 비용, 노드 간 트래픽 |

## 정리

- 캐시는 요청 경로의 모든 층에 있고, 사본을 두는 순간 원본과의 일관성 문제가 따라온다.
- 읽기는 cache-aside가 기본이고, 쓰기는 **DB 갱신 + 캐시 키 삭제**(write-around 계열)가 가장 흔하다. Write-back은 빠르지만 잃을 수 있는 값에만 쓴다.
- 교체 정책은 LRU가 기본값이고, 스캔에 약한 점을 SLRU·LFU 계열이 보완한다. TTL은 정책이라기보다 안전망이다.
- 캐시 장애는 DB 장애로 번진다. TTL 지터, null 캐싱과 블룸 필터, single-flight, 이중화와 서킷 브레이커로 막는다.
- **캐시는 나중에 붙일 수 있다.** 측정해서 적중률이 나올 곳에만 넣는다.

관련 노트: [[redis|Redis]], [[cache-cluster-operations|캐시 클러스터 운영과 장애 대응]], [[web-scalability-components|웹 확장성의 구성 요소]], [[http-cache|HTTP 캐시]], [[cdn|CDN]], [[high-traffic-resilience|대규모 트래픽에서 서비스를 지키는 설계]], [[backend-latency-optimization|백엔드 지연 시간 줄이기]]
