---
title: "메시지 큐와 Kafka"
concept: "Message Queue"
summary: "메시지 큐를 고르는 기준과 IBM MQ → RabbitMQ → Kafka → Pulsar로 이어진 구조 변화, Kafka의 토픽·파티션·컨슈머 그룹 구조와 빠른 이유(순차 I/O, 제로 카피), 전달 보장 수준(at-most/at-least/exactly once)과 메시지가 유실되는 지점별 대책을 정리했다."
tags: ["backend", "architecture", "queue", "streaming", "msa"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/types-of-message-queue", "https://bytebytego.com/guides/how-do-message-queue-architectures-evolve", "https://bytebytego.com/guides/the-ultimate-kafka-101-you-cannot-miss", "https://bytebytego.com/guides/why-is-kafka-fast", "https://bytebytego.com/guides/delivery-semantics", "https://bytebytego.com/guides/can-kafka-lose-messages", "https://bytebytego.com/guides/top-5-kafka-use-cases", "https://kafka.apache.org/documentation/", "https://godekdls.github.io/Apache%20Kafka/design/", "https://www.popit.kr/kafka-%EC%9A%B4%EC%98%81%EC%9E%90%EA%B0%80-%EB%A7%90%ED%95%98%EB%8A%94-%EC%B2%98%EC%9D%8C-%EC%A0%91%ED%95%98%EB%8A%94-kafka/", "https://engineering.linecorp.com/ko/blog/how-to-use-kafka-in-line-1/", "https://ryan-han.com/post/server/activemq_virtual_destinations/"]
---

> ByteByteGo의 System Design 101 가이드 「[Types of Message Queue](https://bytebytego.com/guides/types-of-message-queue)」, 「[Message Queue Evolution](https://bytebytego.com/guides/how-do-message-queue-architectures-evolve)」, 「[The Ultimate Kafka 101](https://bytebytego.com/guides/the-ultimate-kafka-101-you-cannot-miss)」, 「[Why is Kafka Fast](https://bytebytego.com/guides/why-is-kafka-fast)」, 「[Delivery Semantics](https://bytebytego.com/guides/delivery-semantics)」, 「[Can Kafka Lose Messages?](https://bytebytego.com/guides/can-kafka-lose-messages)」, 「[Top 5 Kafka Use Cases](https://bytebytego.com/guides/top-5-kafka-use-cases)」를 바탕으로, 설정 기본값은 Apache Kafka 공식 문서로 확인해 재구성한 노트다. 운영 설계와 구독 모델은 「[아파치 카프카 레퍼런스: 설계](https://godekdls.github.io/Apache%20Kafka/design/)」(공식 문서 번역), 「[Kafka 운영자가 말하는 처음 접하는 Kafka](https://www.popit.kr/kafka-%EC%9A%B4%EC%98%81%EC%9E%90%EA%B0%80-%EB%A7%90%ED%95%98%EB%8A%94-%EC%B2%98%EC%9D%8C-%EC%A0%91%ED%95%98%EB%8A%94-kafka/)」, 「[LINE에서 Kafka를 사용하는 방법](https://engineering.linecorp.com/ko/blog/how-to-use-kafka-in-line-1/)」, 「[ActiveMQ의 Virtual Destinations를 활용한 메세지 로드밸런싱](https://ryan-han.com/post/server/activemq_virtual_destinations/)」으로 보강했다.

## 메시지 큐란

**메시지 큐(message queue)** 는 생산자(producer)가 넣은 메시지를 보관했다가 소비자(consumer)에게 넘기는 중간 저장소다. 생산자와 소비자가 서로의 속도·가용성에 묶이지 않게 떼어 놓는 것이 핵심이다. 비동기 처리와 생산자·큐·소비자의 기본 구성은 [[web-scalability-components|웹 확장성의 구성 요소]]에 있다.

| 얻는 것 | 설명 |
| --- | --- |
| 결합도 감소 | 생산자는 누가 메시지를 읽는지 모른다. 소비자를 붙이고 떼도 생산자는 그대로다 |
| 부하 평탄화 | 트래픽이 몰리면 큐가 버퍼가 되고, 소비자는 자기 속도로 처리한다 |
| 장애 격리 | 소비자가 잠시 죽어도 메시지는 큐에 남는다 |
| 확장 | 소비자 수만 늘리면 처리량이 오른다 |

### 고를 때 보는 기준

| 기준 | 질문 |
| --- | --- |
| 처리량·지연 | 초당 몇 건을, 얼마나 빨리 넘겨야 하나 |
| 확장성 | 메시지·소비자가 늘 때 노드를 붙여 늘릴 수 있나 |
| 신뢰성·내구성 | 장애가 나도 메시지를 잃지 않나, 얼마나 오래 보관하나 |
| 재처리 | 이미 읽은 메시지를 다시 읽을 수 있나 |
| 라우팅 | 메시지 속성에 따라 다른 큐로 보낼 수 있나 |
| 프로토콜·생태계 | AMQP, MQTT, 자체 프로토콜 중 무엇을 쓰나. 커넥터·클라이언트가 충분한가 |
| 운영 부담 | 직접 운영하나, 관리형 서비스(SQS, 관리형 Kafka 등)를 쓰나 |

## 구조의 변화: 큐에서 로그로

```text
전통 메시지 큐 ──▶ 브로커 라우팅 큐 ──▶ 분산 로그 ──▶ 서빙·저장 분리
  (IBM MQ)         (RabbitMQ)          (Kafka)         (Pulsar)
```

| 세대 | 대표 | 구조 | 잘 맞는 곳 |
| --- | --- | --- | --- |
| 전통 엔터프라이즈 MQ | IBM MQ | 큐 단위로 메시지를 확실히 한 번 넘기는 데 집중. 트랜잭션 지원이 강하다 | 금융권 기간 시스템 |
| 라우팅 브로커 | RabbitMQ | 생산자는 **익스체인지(exchange)** 에 보내고, 익스체인지가 타입(direct, topic, fanout, headers)과 라우팅 키에 따라 큐로 나눠 넣는다. 소비자가 확인(ack)하면 메시지는 지워진다 | 작업 분배, 복잡한 라우팅 |
| 분산 로그 | Kafka | 메시지를 **지우지 않고 추가 전용 로그(append-only log)** 로 보관한다. 소비자는 자기 읽은 위치(offset)만 기억하고, 여러 소비자가 같은 데이터를 각자 읽거나 다시 읽는다 | 대용량 이벤트 스트리밍, 데이터 파이프라인 |
| 계층 분리 | Pulsar | 메시지를 받는 서빙 계층(broker)과 저장 계층(BookKeeper)을 나눴다. 브로커가 상태를 덜 가져 노드 증설과 파티션 이동이 쉽다 | 멀티 테넌트, 큐와 스트림을 한 플랫폼에서 |

오래된 메시지를 싼 오브젝트 스토리지로 내려 보관하는 **계층형 저장(tiered storage)** 은 Pulsar가 먼저 기본으로 내세웠고, Kafka도 3.6부터 정식 기능으로 들어왔다.

**큐(queue)와 로그(log)의 차이**가 고르는 기준이 된다. 큐는 「작업을 한 소비자에게 한 번 넘기고 지운다」, 로그는 「일어난 일을 순서대로 남기고 여러 소비자가 각자 읽는다」.

### 점대점과 발행·구독을 함께 쓰기

| 모델 | 전달 | 문제 |
| --- | --- | --- |
| 큐(점대점) | 메시지 하나를 소비자 하나가 받는다. 소비자를 늘리면 부하가 나뉜다 | 여러 시스템이 같은 메시지를 받아야 할 때 맞지 않는다 |
| 토픽(발행·구독) | 구독자 모두가 같은 메시지를 받는다 | 같은 역할의 서버 여러 대가 구독하면 서버마다 같은 메시지를 처리하는 중복이 생긴다 |

그래서 대부분의 시스템은 **구독 그룹 사이에는 토픽처럼, 그룹 안에서는 큐처럼** 동작하는 모델을 제공한다. Kafka의 컨슈머 그룹, ActiveMQ·Amazon MQ의 Virtual Topic(논리 토픽에 발행하면 브로커가 구독 그룹마다 물리 큐를 만든다), SNS 토픽 → 서비스별 SQS 큐 팬아웃이 같은 생각이다. 생산자를 고치지 않고 소비자를 늘리고 줄일 수 있다.

## Kafka의 구조

Kafka는 분산 이벤트 저장소이자 스트리밍 플랫폼이다. 원래 대규모 로그 처리를 위해 만들어져, 메시지를 보존 기간이 끝날 때까지 남겨 두고 소비자가 자기 속도로 끌어가게(pull) 한다.

```text
Producer ──▶ Topic "orders"
               ├─ Partition 0: [0][1][2][3][4] ...  ← 리더는 Broker 1, 복제본은 Broker 2·3
               ├─ Partition 1: [0][1][2] ...        ← 리더는 Broker 2
               └─ Partition 2: [0][1][2][3] ...     ← 리더는 Broker 3
                        │
                        ▼
          Consumer Group A: 컨슈머 a1(P0), a2(P1, P2)
          Consumer Group B: 컨슈머 b1(P0, P1, P2)    ← 같은 데이터를 독립적으로 읽는다
```

| 개념 | 뜻 |
| --- | --- |
| 메시지(record) | 데이터의 기본 단위. 키, 값, 헤더, 타임스탬프로 이뤄진다 |
| 토픽(topic) | 메시지를 담는 이름 붙은 분류. 폴더에 비유된다 |
| 파티션(partition) | 토픽을 나눈 순서 있는 로그. **순서는 파티션 안에서만 보장**된다. 같은 키는 같은 파티션으로 간다 |
| 오프셋(offset) | 파티션 안에서 메시지의 위치 번호. 소비자가 어디까지 읽었는지를 나타낸다 |
| 프로듀서 | 메시지를 모아(batch) 토픽으로 보내고, 키로 파티션을 고른다 |
| 컨슈머 그룹 | 함께 한 토픽을 나눠 읽는 컨슈머 묶음. 파티션 하나는 그룹 안의 컨슈머 하나에게만 배정된다. 그래서 **그룹의 병렬도 상한은 파티션 수**다 |
| 브로커·클러스터 | 파티션을 저장하는 서버. 파티션마다 리더 하나와 팔로워 복제본을 여러 브로커에 둔다 |
| ISR(in-sync replicas) | 리더를 제때 따라오는 복제본 집합. 리더가 죽으면 ISR 중에서 새 리더를 뽑는다 |

클러스터 메타데이터는 과거에 ZooKeeper가 관리했지만, Kafka 4.0부터는 Kafka 자체의 합의 프로토콜인 **KRaft** 만 지원한다.

### 왜 빠른가

| 설계 | 효과 |
| --- | --- |
| **순차 I/O** | 로그 끝에 이어 쓰고 순서대로 읽는다. 디스크도 순차 접근은 임의 접근보다 훨씬 빠르고, OS 페이지 캐시와 미리 읽기(read-ahead)가 그대로 먹힌다 |
| **제로 카피(zero copy)** | 디스크의 데이터를 애플리케이션 메모리로 올리지 않고 커널이 바로 네트워크 카드로 보낸다 |
| 배치·압축 | 여러 메시지를 묶어 보내고 묶음 단위로 압축해 요청 수와 바이트를 줄인다 |
| 파티션 병렬화 | 파티션 단위로 브로커·컨슈머에 나눠 수평 확장한다 |

```text
일반 전송 (복사 4번, 문맥 전환 여러 번)
  디스크 → OS 페이지 캐시 → 애플리케이션 버퍼 → 소켓 버퍼 → NIC

제로 카피 (sendfile)
  디스크 → OS 페이지 캐시 ─────────────────────────────▶ NIC
```

제로 카피는 브로커가 저장한 바이트를 그대로 내보낼 수 있을 때만 된다. TLS로 암호화해 보내면 사용자 공간에서 암호화해야 하므로 이 이점이 사라진다.

## 전달 보장 수준

메시지 시스템이 「몇 번 전달하느냐」에 대해 약속하는 수준이다.

| 수준 | 약속 | 대가 | 맞는 곳 |
| --- | --- | --- | --- |
| **at-most once** (최대 한 번) | 중복은 없지만 유실될 수 있다. 다시 보내지 않는다 | 가장 싸고 빠르다 | 지표 수집, 로그처럼 일부 유실이 괜찮은 데이터 |
| **at-least once** (최소 한 번) | 유실은 없지만 중복될 수 있다. 확인을 못 받으면 다시 보낸다 | 소비자가 중복을 걸러야 한다 | 대부분의 업무 이벤트. 메시지마다 고유 키를 두고 DB 유니크 제약이나 처리 기록으로 중복을 막는다 |
| **exactly once** (정확히 한 번) | 유실도 중복도 없다 | 구현이 가장 어렵고 성능 비용이 크다 | 결제·거래·회계처럼 중복이 허용되지 않고, 하위 시스템이 멱등성을 지원하지 않을 때 |

실무에서 정확히 한 번은 대개 **「최소 한 번 전달 + 멱등한 처리」** 로 만든다. Kafka는 멱등 프로듀서(브로커가 재전송 중복을 걸러 낸다)와 트랜잭션(여러 파티션 쓰기와 오프셋 커밋을 한 단위로 묶고, 소비자는 `isolation.level=read_committed`로 커밋된 것만 읽는다)으로 **Kafka 안에서의** 정확히 한 번을 지원한다. Kafka 밖의 DB나 외부 API까지 포함하면 그쪽 쓰기도 멱등하게 만들어야 한다. 멱등성을 적용하는 방법은 [[resiliency-patterns|장애 확산을 막는 복원력 패턴]]에 있다.

## 메시지는 어디서 유실되나

「Kafka는 메시지를 잃지 않는다」는 설정이 맞을 때의 이야기다. 유실은 세 구간에서 생긴다.

```text
[프로듀서]  send() → 레코드 누산기(버퍼) → 송신 스레드 → 
[브로커]    리더 페이지 캐시 → (비동기 flush) 디스크, 팔로워 복제 →
[컨슈머]    poll() → 처리 → 오프셋 커밋
```

| 구간 | 유실 원인 | 대책 |
| --- | --- | --- |
| 프로듀서 | `send()`는 비동기다. 메시지는 메모리 버퍼에 쌓였다가 송신 스레드가 보낸다. 실패 콜백을 무시하거나 확인 없이 보내면 모른 채 사라진다 | `acks=all`, 재시도, 멱등 프로듀서(`enable.idempotence=true`). Kafka 3.0부터 이 둘이 기본값이다. 전송 콜백에서 실패를 처리한다 |
| 브로커 | 디스크 기록은 성능을 위해 비동기로 flush된다. 복제본이 부족한 상태에서 리더가 죽으면 아직 복제되지 않은 메시지가 사라진다 | 복제 계수 3, `min.insync.replicas=2` 이상, `unclean.leader.election.enable=false`(기본값). 내구성은 fsync가 아니라 **복제**로 확보한다 |
| 컨슈머 | 자동 커밋은 처리 전에 오프셋을 커밋할 수 있다. 처리 도중 컨슈머가 죽으면 그 메시지는 다시 읽히지 않는다 | 자동 커밋을 끄고 **처리한 뒤 커밋**한다. 처리 루프에서는 비동기 커밋으로 처리량을 지키고, 종료·예외 처리에서는 동기 커밋으로 마지막 오프셋을 확실히 남긴다 |

처리한 뒤 커밋하면 커밋 직전에 죽었을 때 같은 메시지를 다시 처리한다. 즉 **유실을 막으면 중복이 생기므로** 소비자 처리를 멱등하게 만드는 것이 한 세트다.

## Kafka가 쓰이는 곳

| 용도 | 흐름 |
| --- | --- |
| 로그 수집·분석 | 여러 서비스의 로그를 Kafka로 모아 검색·분석 저장소(Elasticsearch 등)로 보낸다 |
| 스트림 처리·추천 | 클릭·조회 이벤트를 실시간으로 흘려 Flink 같은 스트림 처리기로 특징을 만들고 모델에 넣는다 |
| 모니터링·알림 | 지표를 모아 실시간 집계하고 임계값을 넘으면 알린다 |
| CDC(변경 데이터 캡처) | DB 변경 로그를 Kafka 토픽으로 흘려 캐시·검색 인덱스·데이터 웨어하우스를 맞춘다. [[distributed-data-patterns\|데이터 관리 패턴]] |
| 시스템 이전 | 옛 시스템과 새 시스템에 같은 이벤트를 흘려 결과를 비교하며 점진적으로 옮긴다 |

## 운영 설계: 공유 클러스터와 보존 정책

| 주제 | 내용 |
| --- | --- |
| 풀(pull) 방식 | 브로커가 밀어 넣지 않고 컨슈머가 자기 속도로 가져간다. 느린 컨슈머가 과부하에 빠지지 않고, 롱 폴링으로 빈 요청을 줄인다. 오프셋을 되돌리면 과거 데이터를 다시 처리할 수 있다 |
| 보존(retention) | 읽혀도 지우지 않고 기간·크기 기준으로 보관한다. 그래서 같은 토픽을 분산 작업 큐로도, 변경 이벤트를 여러 하위 서비스에 퍼뜨리는 데이터 허브로도 쓴다 |
| 로그 컴팩션(log compaction) | 키마다 **최신 값만 남기고** 옛 값을 정리한다. 상태 복원, DB 변경 구독, 이벤트 소싱의 스냅샷에 쓴다 |
| 공유 클러스터 | 서비스마다 클러스터를 따로 두면 운영 비용이 서비스 수만큼 는다. 하나의 큰 클러스터에 데이터를 모으면 탐색·접근 방식이 통일되고 운영 역량을 집중할 수 있다 |
| 멀티 테넌트 보호 | 악의가 없어도 설정 실수 하나가 공유 클러스터 전체를 느리게 한다. 요청마다 **클라이언트를 식별**할 수 있게 하고, 클라이언트별 **쿼터**(네트워크 대역폭, 브로커 요청 처리 시간)를 건다 |
| 요청 수가 비용이다 | 브로커 부하는 데이터 양보다 **요청 수**에 더 민감하다. 프로듀서 배치(`linger.ms`, `batch.size`)로 레코드를 묶어 요청당 오버헤드를 줄인다 |
| 파티션과 순서 | 토픽 전체 순서가 꼭 필요하면 파티션을 하나로 둬야 하지만 병렬성을 잃는다. 대개 순서가 필요한 단위(주문 ID 등)를 키로 써서 그 키 안에서만 순서를 지킨다 |
| 복제 계수 | 브로커 수에 맞춰 복제본이 고르게 흩어지게 정한다. 보통 3이다 |

## 정리

- 큐는 작업을 한 번 넘기고 지우고, 로그는 일어난 일을 남겨 여러 소비자가 다시 읽게 한다. Kafka는 로그 쪽이다.
- Kafka의 순서는 파티션 안에서만 보장되고, 컨슈머 그룹의 병렬도는 파티션 수가 상한이다.
- 속도는 순차 I/O, 페이지 캐시, 제로 카피, 배치에서 나온다.
- 유실을 막으려면 프로듀서 `acks=all`·멱등성, 브로커 복제·`min.insync.replicas`, 컨슈머 「처리 후 커밋」을 함께 맞춘다.
- 정확히 한 번은 최소 한 번 전달에 멱등한 처리를 더해 만든다.

더 읽을거리: 「[스케일아웃없이 순간 급증하는 주문 처리하기 (Microservice with Kafka)](https://tv.naver.com/v/11212897)」(영상)

관련 노트: [[event-driven-architecture|이벤트 기반 아키텍처 설계]], [[web-scalability-components|웹 확장성의 구성 요소: 한 장으로 보는 웹 아키텍처]], [[distributed-data-patterns|데이터 관리 패턴: CDC, 이벤트 소싱, CQRS, 최종 일관성]], [[realtime-recsys|실시간 추천과 실험: 밴딧, 피드백 지연, A/B 테스트]], [[virtual-waiting-room|대기열 시스템(가상 대기실) 설계]], [[queue-deque|큐와 덱]]
