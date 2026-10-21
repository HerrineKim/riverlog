---
title: "분산 시스템의 통신·데이터 흐름 패턴"
concept: "Distributed System Patterns"
summary: "서비스끼리 주고받는 방식(요청-응답, 비동기 요청-응답, 발행-구독, 경쟁 소비자, 우선순위 큐, 클레임 체크), 데이터가 흐르는 방식(ETL, 배치, 스트림 처리, 이벤트 소싱, CQRS), 여러 서비스를 조율하는 방식(오케스트레이션, 사가, 리더 선출, 분산 락, 앰배서더)을 한 지도로 묶고 각 패턴이 푸는 문제와 대가를 정리했다."
tags: ["backend", "architecture", "msa", "async", "design-pattern"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/top-6-cloud-messaging-patterns", "https://bytebytego.com/guides/top-7-most-used-distributed-system-patterns", "https://bytebytego.com/guides/top-9-architectural-patterns-for-data-and-communication-flow", "https://bytebytego.com/guides/how-do-we-incorporate-event-sourcing-into-the-systems", "https://bytebytego.com/guides/why-do-we-need-to-use-a-distributed-lock", "https://techblog.woowahan.com/2631/"]
---

> ByteByteGo의 System Design 101 가이드 「[Top 6 Cloud Messaging Patterns](https://bytebytego.com/guides/top-6-cloud-messaging-patterns)」, 「[Top 7 Most-Used Distributed System Patterns](https://bytebytego.com/guides/top-7-most-used-distributed-system-patterns)」, 「[Top 9 Architectural Patterns for Data and Communication Flow](https://bytebytego.com/guides/top-9-architectural-patterns-for-data-and-communication-flow)」, 「[How do we incorporate Event Sourcing into systems?](https://bytebytego.com/guides/how-do-we-incorporate-event-sourcing-into-the-systems)」, 「[Why Use a Distributed Lock?](https://bytebytego.com/guides/why-do-we-need-to-use-a-distributed-lock)」, 「[MySQL을 이용한 분산락으로 여러 서버에 걸친 동시성 관리](https://techblog.woowahan.com/2631/)」를 바탕으로 재구성한 노트다.

## 패턴 지도

분산 시스템의 패턴은 세 가지 질문에 대한 답이다.

```text
1. 서비스끼리 어떻게 말하나?        → 통신 패턴
   요청-응답, 비동기 요청-응답, 발행-구독, 경쟁 소비자, 우선순위 큐, 클레임 체크, P2P, API 게이트웨이
2. 데이터는 어떻게 흘러 쌓이나?     → 데이터 흐름 패턴
   ETL, 배치, 스트림 처리, 이벤트 소싱, CQRS, 샤딩
3. 여럿이 함께 일할 때 누가 정하나? → 조율 패턴
   오케스트레이션, 사가, 리더 선출, 분산 락, 앰배서더·서킷 브레이커
```

## 통신 패턴

| 패턴 | 동작 | 푸는 문제 | 대가 |
| --- | --- | --- | --- |
| 요청-응답(request-response) | 클라이언트가 요청하고 응답을 기다린다 | 가장 단순하고 결과를 즉시 안다 | 호출자가 묶이고, 상대가 죽으면 같이 실패한다 |
| 비동기 요청-응답(async request-reply) | API가 작업을 접수만 하고 `202 Accepted`와 상태 조회 주소를 돌려준다. 클라이언트는 폴링하거나 콜백을 받는다 | 오래 걸리는 작업을 프론트엔드와 떼어 놓는다 | 상태 저장소와 조회 엔드포인트가 필요하다 |
| 발행-구독(pub-sub) | 발행자가 브로커의 토픽에 메시지를 내고, 구독자들이 각자 받는다 | 보내는 쪽이 받는 쪽을 몰라도 된다. 보내고 기다리지 않는다 | 누가 무엇을 받는지 추적하기 어렵다 |
| 경쟁 소비자(competing consumers) | 같은 큐를 여러 소비자가 나눠 꺼내 처리한다 | 소비자를 늘리는 것만으로 처리량이 는다. 소비자끼리 조율이 필요 없다 | **순서가 보장되지 않는다.** 순서가 필요하면 키별 파티션으로 나눈다 |
| 우선순위 큐(priority queue) | 우선순위가 높은 메시지를 먼저 처리한다. 우선순위별 큐를 따로 두는 방식이 흔하다 | 유료 사용자·긴급 작업을 먼저 처리한다 | 낮은 우선순위가 영영 밀리는 기아(starvation) |
| 클레임 체크(claim check) | 큰 페이로드는 저장소(객체 스토리지·DB)에 두고 메시지에는 참조만 담는다 | 메시지 크기 제한, 브로커 부하 | 저장소 정리와 접근 권한을 따로 관리한다 |
| P2P(peer-to-peer) | 중앙 조정자 없이 구성 요소끼리 직접 통신한다 | 중앙 병목·단일 장애점이 없다 | 발견·신뢰·일관성을 각자 처리한다 |
| API 게이트웨이 | 모든 클라이언트 요청이 들어오는 단일 진입점 | 인증·라우팅·속도 제한을 한 곳에서 처리한다 | 게이트웨이가 병목·장애점이 되지 않게 이중화한다 |

## 데이터 흐름 패턴

| 패턴 | 동작 | 맞는 곳 |
| --- | --- | --- |
| ETL | 여러 원천에서 추출(Extract)해 정해진 형태로 변환(Transform)한 뒤 목적지에 적재(Load)한다. 적재 후 변환하면 ELT | 데이터 웨어하우스 적재, 분석 |
| 배치(batching) | 일정 시간이나 양이 찰 때까지 모았다가 한꺼번에 처리한다 | 처리량이 지연보다 중요할 때. 정산, 일일 집계 |
| 스트림 처리(streaming) | 들어오는 데이터를 끊임없이 바로바로 처리한다 | 실시간 지표, 이상 탐지, 알림 |
| 이벤트 소싱(event sourcing) | 현재 상태 대신 **상태를 바꾼 이벤트를 차례로** 저장하고, 상태는 이벤트를 재생해 만든다 | 감사 이력이 중요한 도메인, 여러 뷰를 만들어야 하는 데이터 |
| CQRS | 쓰기 모델(명령)과 읽기 모델(조회)을 나눠 각각 최적화한다 | 읽기와 쓰기의 모양·부하가 크게 다를 때 |
| 샤딩 | 데이터를 키로 나눠 여러 노드에 둔다 | 한 노드에 담기지 않는 데이터. [[database-sharding\|데이터베이스 샤딩]] |

이벤트 소싱에서는 **이벤트 로그가 진실의 원천(source of truth)** 이고 상태는 파생 뷰다. 그래서 같은 로그로 검색용·조회용 뷰를 여러 개 만들 수 있고, 서비스 간 연결에도 쓴다. 장바구니 서비스가 「담기」「빼기」 이벤트를 Kafka 같은 로그에 내면, 사기 탐지·결제·이메일 서비스가 각자 구독해 **자기 도메인 모델을 스스로 만든다.** 이벤트 소싱·CQRS·CDC의 동작과 최종 일관성을 다루는 법은 [[distributed-data-patterns|데이터 관리 패턴: CDC, 이벤트 소싱, CQRS, 최종 일관성]], 배치·스트림·ETL의 차이와 파이프라인 단계는 [[data-pipeline-basics|데이터 파이프라인과 저장소 용어]]에 있다.

## 조율 패턴

| 패턴 | 동작 | 푸는 문제 |
| --- | --- | --- |
| 오케스트레이션(orchestration) | 중앙 조정자가 각 서비스를 순서대로 호출해 업무 흐름을 끝낸다. 반대는 각 서비스가 이벤트에 반응하는 코레오그래피(choreography). [[microservices-architecture\|마이크로서비스 아키텍처]] | 흐름이 한 곳에 보여 추적이 쉽다 |
| 사가(saga) | 여러 서비스에 걸친 작업을 로컬 트랜잭션의 연쇄로 쪼개고, 중간에 실패하면 이미 끝난 단계를 **보상 트랜잭션**으로 되돌린다 | 서비스마다 DB가 따로일 때 분산 트랜잭션(2PC) 없이 정합성을 맞춘다 |
| 리더 선출(leader election) | 노드 중 하나를 리더로 뽑아 조율을 맡긴다. 리더가 죽으면 다시 뽑는다 | 여러 노드가 같은 결정을 동시에 내리는 충돌 |
| 앰배서더(ambassador) | 앱 옆에 프록시(사이드카)를 붙여 재시도·모니터링·TLS 같은 네트워크 관심사를 맡긴다 | 언어·프레임워크마다 같은 기능을 다시 구현하는 일 |
| 서킷 브레이커 | 실패가 잦은 의존성 호출을 차단한다 | 연쇄 장애. [[resiliency-patterns\|장애 확산을 막는 복원력 패턴]] |

### 분산 락

**분산 락(distributed lock)** 은 여러 노드·프로세스 사이에서 상호 배제를 보장한다. 한 프로세스 안의 뮤텍스가 프로세스 경계를 넘지 못하므로, 공유 저장소(Redis, ZooKeeper, etcd, DB)에 락 상태를 둔다.

| 쓰임 | 막는 것 |
| --- | --- |
| 리더 선출 | 두 노드가 동시에 리더가 되는 것 |
| 분산 작업 스케줄링 | 예약 작업이 여러 워커에서 중복 실행되는 것 |
| 공유 자원 접근 | 파일·장치를 여러 프로세스가 동시에 쓰는 것 |
| 마이크로서비스 조율 | 서로 다른 DB의 관련 데이터를 순서 없이 갱신하는 것 |
| 재고 관리 | 마지막 하나 남은 재고를 두 사용자가 동시에 사는 것 |
| 세션 관리 | 한 세션을 두 서버가 동시에 고치는 것 |

락을 쥔 프로세스가 죽으면 락이 영원히 남으므로 **만료 시간(lease, TTL)** 을 둔다. 그런데 GC 멈춤이나 네트워크 지연으로 만료 뒤에도 자기가 락을 쥐었다고 믿고 쓰는 프로세스가 생길 수 있다. 그래서 락을 얻을 때마다 단조 증가하는 **펜싱 토큰(fencing token)** 을 받고, 저장소가 더 작은 토큰의 쓰기를 거부하게 한다. 정확성이 중요하면 합의 기반 저장소(ZooKeeper·etcd)를 쓰고, 단순한 중복 방지 수준이면 Redis로 충분하다.

이미 쓰는 RDB로도 분산 락을 걸 수 있다. MySQL의 **사용자 수준 잠금(user-level lock)** 은 이름 붙인 잠금을 세션 단위로 잡는다.

| 함수 | 동작 |
| --- | --- |
| `GET_LOCK(name, timeout)` | 잠금을 얻으면 1, 시간 초과면 0, 오류면 NULL. 음수 timeout은 무한 대기. 5.7부터 한 세션이 여러 잠금을 동시에 쥘 수 있고 이름은 64자까지 |
| `RELEASE_LOCK(name)` | 해제하면 1, 내 잠금이 아니면 0, 없는 잠금이면 NULL |
| `RELEASE_ALL_LOCKS()` | 이 세션의 잠금을 모두 푼다 |
| `IS_FREE_LOCK`, `IS_USED_LOCK` | 잠금 상태 조회 |

- 잠금은 **트랜잭션이 아니라 연결(세션)에 붙는다.** 커밋·롤백으로 풀리지 않고, 연결이 끊기면 풀린다.
- 그래서 획득과 해제가 **같은 연결**에서 일어나야 한다. 쿼리마다 풀에서 다른 연결을 받으면 해제가 엉뚱한 연결로 가거나, 그 연결을 받은 다른 스레드가 남의 잠금을 쥔 채 일하게 된다([[connection-pool|DB 커넥션 풀]]).
- 연결을 직접 받아 `GET_LOCK → 작업 → RELEASE_LOCK(finally)` 순서로 쓰는 `executeWithLock(name, timeout, 작업)` 같은 콜백 하나로 감싸면 호출부가 해제를 빠뜨리지 않는다. 잠금용 연결은 업무용 풀과 분리하는 편이 안전하다.
- 기다리는 요청 사이의 획득 순서는 보장되지 않는다.

락은 처리량을 줄이고 장애점이 된다. **DB의 조건부 갱신(낙관적 락), 유니크 제약, 멱등 키로 풀 수 있으면 그쪽이 먼저**다.

## 정리

- 동기 요청-응답은 단순하지만 결합이 강하다. 오래 걸리는 일은 비동기 요청-응답이나 큐로 뗀다.
- 큐에 소비자를 늘리면 처리량이 늘지만 순서는 사라진다. 순서가 필요하면 키별로 파티션한다.
- 이벤트 소싱은 이벤트 로그를 진실의 원천으로 두고, 상태는 파생 뷰로 만든다. 대가는 최종 일관성이다.
- 서비스를 넘는 트랜잭션은 사가와 보상 트랜잭션으로, 상호 배제는 분산 락과 펜싱 토큰으로 푼다.

관련 노트: [[distributed-data-patterns|데이터 관리 패턴: CDC, 이벤트 소싱, CQRS, 최종 일관성]], [[message-queue-kafka|메시지 큐와 Kafka]], [[microservices-architecture|마이크로서비스 아키텍처]], [[web-scalability-components|웹 확장성의 구성 요소]], [[resiliency-patterns|장애 확산을 막는 복원력 패턴]], [[high-availability-redundancy|고가용성 이중화 구조와 장애 감지]], [[bff|BFF]], [[system-design-fundamentals|시스템 설계의 품질 속성과 트레이드오프]]
