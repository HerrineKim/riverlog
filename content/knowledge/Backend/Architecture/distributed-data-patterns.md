---
title: "데이터 관리 패턴: CDC, 이벤트 소싱, CQRS, 최종 일관성"
concept: "Data Management Patterns"
summary: "데이터가 여러 서비스·저장소에 흩어질 때 쓰는 패턴을 모았다. DB 변경을 로그에서 읽어 퍼뜨리는 CDC, 상태 대신 이벤트를 저장하는 이벤트 소싱, 읽기·쓰기 모델을 나누는 CQRS, 인덱스 테이블, 최종 일관성을 만드는 네 가지 방법(이벤트·백그라운드 동기화·사가·CQRS), 데이터 이전 때의 스키마 진화(Avro)까지 다룬다."
tags: ["backend", "architecture", "database", "event", "msa"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/how-do-we-manage-data", "https://bytebytego.com/guides/change-data-capture-key-to-leverage-real-time-data", "https://bytebytego.com/guides/differences-in-event-sourcing-system-design", "https://bytebytego.com/guides/top-eventual-consistency-patterns-you-must-know", "https://bytebytego.com/guides/smooth-data-migration-with-avro", "https://debezium.io/documentation/reference/stable/architecture.html", "https://avro.apache.org/docs/"]
---

> ByteByteGo의 System Design 101 가이드 「[How Do We Manage Data?](https://bytebytego.com/guides/how-do-we-manage-data)」, 「[Change Data Capture](https://bytebytego.com/guides/change-data-capture-key-to-leverage-real-time-data)」, 「[Differences in Event Sourcing System Design](https://bytebytego.com/guides/differences-in-event-sourcing-system-design)」, 「[Top Eventual Consistency Patterns](https://bytebytego.com/guides/top-eventual-consistency-patterns-you-must-know)」, 「[Smooth Data Migration with Avro](https://bytebytego.com/guides/smooth-data-migration-with-avro)」를 바탕으로, Debezium·Avro 공식 문서로 확인해 재구성한 노트다.

## 왜 패턴이 필요한가

서비스가 하나의 DB를 쓸 때는 트랜잭션 하나로 정합성을 지킨다. 서비스가 나뉘고 캐시·검색 엔진·데이터 웨어하우스가 붙으면 **같은 사실이 여러 저장소에 복사**된다. 이때 문제는 둘이다.

1. 한 곳의 변경을 다른 곳에 **어떻게 빠짐없이 전달하나**
2. 전달되는 동안 저장소끼리 어긋나는 것을 **어떻게 다루나**

| 패턴 | 푸는 문제 | 한 줄 요약 |
| --- | --- | --- |
| 캐시 어사이드(cache-aside) | 반복 조회 부하 | 캐시에 없으면 DB에서 읽어 캐시에 넣는다. 읽기가 많고 쓰기가 적을 때. [[caching-strategies\|캐시 전략]] |
| 구체화된 뷰(materialized view) | 무거운 집계 쿼리 | 쿼리 결과를 미리 계산해 저장한다. [[database-scaling\|데이터베이스 확장과 성능 최적화]] |
| 인덱스 테이블(index table) | 기본 키가 아닌 조건의 조회 | 자주 쓰는 조회 조건을 키로 하는 테이블을 따로 둔다. 보조 인덱스를 지원하지 않는 NoSQL에서 특히 쓴다 |
| 샤딩 | 한 서버를 넘는 데이터·쓰기 | [[database-sharding\|데이터베이스 샤딩]] |
| CDC | 변경 전달 | DB 트랜잭션 로그를 읽어 다른 시스템으로 흘린다 |
| 이벤트 소싱 | 변경 이력·감사·재현 | 현재 상태 대신 일어난 이벤트를 저장한다 |
| CQRS | 읽기·쓰기 요구가 다를 때 | 쓰기 모델과 읽기 모델을 나눈다 |

## CDC: 변경 데이터 캡처

**CDC(Change Data Capture)** 는 DB에서 일어난 삽입·수정·삭제를 잡아 다른 시스템으로 실시간 전달하는 기법이다. 애플리케이션은 평소처럼 DB에 쓰기만 하고, 나머지는 CDC가 맡는다.

```text
앱 ──INSERT/UPDATE/DELETE──▶ 원본 DB
                               │ 트랜잭션 로그 (MySQL binlog, PostgreSQL WAL)
                               ▼
                         소스 커넥터 (Debezium)
                               │ 변경 이벤트 (before / after / op)
                               ▼
                         Kafka 토픽
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
       싱크: 검색 인덱스    싱크: 캐시(Redis)    싱크: 데이터 웨어하우스
```

| 방식 | 동작 | 특징 |
| --- | --- | --- |
| **로그 기반** | DB의 트랜잭션 로그를 읽는다 | 원본 DB 부하가 적고 삭제까지 정확히 잡는다. 표준이다 |
| 쿼리 기반(polling) | `updated_at`으로 주기적으로 조회한다 | 단순하지만 삭제를 놓치고 지연이 길다 |
| 트리거 기반 | DB 트리거가 변경을 별도 테이블에 쓴다 | 원본 쓰기마다 비용이 붙는다 |

대표 도구 Debezium은 MySQL, PostgreSQL, Oracle, SQL Server, MongoDB 등의 커넥터를 제공하고, 보통 Kafka Connect 위에서 돌린다. Kafka 없이 쓰는 Debezium Server도 있다. 샤드 클러스터로 데이터를 옮길 때 CDC를 쓰는 흐름은 [[database-sharding|데이터베이스 샤딩]]에 있다.

### 이중 쓰기 대신 아웃박스

「DB에 쓰고, 이어서 메시지 큐에도 발행」하는 **이중 쓰기(dual write)** 는 둘 중 하나만 성공하면 어긋난다. **트랜잭셔널 아웃박스(transactional outbox)** 는 업무 데이터와 함께 같은 트랜잭션으로 `outbox` 테이블에 이벤트를 쓰고, CDC가 그 테이블을 읽어 발행한다. DB 트랜잭션 하나로 「상태 변경」과 「발행할 이벤트」가 함께 확정된다.

## 이벤트 소싱

일반적인 CRUD 설계는 **현재 상태**를 저장하고 덮어쓴다. **이벤트 소싱(event sourcing)** 은 상태를 바꾼 **이벤트를 추가 전용으로 저장**하고, 현재 상태는 이벤트를 처음부터 차례로 적용해 계산한다.

```text
CRUD                         이벤트 소싱
orders 테이블                 order_events (추가만 한다)
┌────┬────────┐               1. OrderPlaced   {id: 7, amount: 30000}
│ id │ status │               2. PaymentDone   {id: 7}
│  7 │ PAID   │ ← 덮어씀       3. OrderShipped  {id: 7}
└────┴────────┘               현재 상태 = fold(이벤트들) → SHIPPED
```

| 항목 | CRUD | 이벤트 소싱 |
| --- | --- | --- |
| 저장 대상 | 현재 상태 | 상태를 바꾼 사건의 순서 |
| 과거 상태 | 별도 이력 테이블이 없으면 잃는다 | 어느 시점이든 이벤트를 다시 적용해 재현한다 |
| 감사 추적 | 따로 만든다 | 이벤트 로그 자체가 감사 기록이다 |
| 버그 수정 후 | 이미 망가진 상태를 고쳐야 한다 | 로직을 고친 뒤 이벤트를 다시 재생해 상태를 다시 만든다 |
| 조회 | 테이블을 바로 읽는다 | 이벤트를 읽기용 모델로 투영(projection)해야 한다. 그래서 보통 CQRS와 함께 쓴다 |

이벤트 소싱의 핵심은 **결정성(determinism)** 이다. 같은 이벤트를 같은 순서로 적용하면 언제나 같은 상태가 나와야 한다. 그래서 이벤트 적용 로직 안에서 현재 시각·난수·외부 호출을 쓰지 않고, 필요한 값은 이벤트에 담는다.

| 다루어야 할 것 | 방법 |
| --- | --- |
| 이벤트가 많아 재생이 느리다 | 주기적으로 **스냅숏**을 저장하고 그 뒤 이벤트만 적용한다 |
| 이벤트 형식이 바뀐다 | 이벤트는 고치지 않는다. 버전을 붙이고 읽을 때 변환(upcasting)한다 |
| 개인 정보 삭제 요구 | 지울 수 없는 로그와 충돌한다. 개인 정보는 암호화해 두고 키를 버리는 방식(crypto-shredding)을 쓴다 |

## CQRS

**CQRS(Command Query Responsibility Segregation)** 는 데이터를 바꾸는 명령(command) 모델과 읽는 조회(query) 모델을 분리한다. 쓰기 쪽은 정규화와 불변식 검증에, 읽기 쪽은 화면에 맞춘 비정규화 뷰에 최적화한다.

```text
명령 ──▶ 쓰기 모델 (정규화 DB / 이벤트 저장소)
              │ 변경 이벤트 (CDC 또는 이벤트 발행)
              ▼
         투영기(projector)
              │
              ▼
조회 ◀── 읽기 모델 (비정규화 테이블, 검색 인덱스, 캐시)
```

읽기·쓰기 부하와 형태가 크게 다를 때 이점이 크다. 대신 두 모델 사이에 **지연이 생기므로** 읽기 모델은 최종 일관성을 갖는다. 단순한 CRUD 서비스에 넣으면 복잡도만 늘어난다. ETL·스트림 처리와 함께 본 데이터 흐름 패턴 지도와, 이벤트 저장소를 진실의 원천으로 두고 여러 뷰를 만드는 쓰임새는 [[distributed-system-patterns|분산 시스템의 통신·데이터 흐름 패턴]]에 있다.

## 최종 일관성을 만드는 네 가지 방법

**최종 일관성(eventual consistency)** 은 새 쓰기가 없으면 모든 복제본이 결국 같은 값에 수렴한다는 약속이다. 그 사이에는 저장소마다 다른 값이 보일 수 있다. 비동기 복제가 대표적인 예다.

| 패턴 | 동작 | 장점 | 단점 |
| --- | --- | --- | --- |
| 이벤트 기반 | 서비스가 이벤트를 발행하고, 다른 서비스가 구독해 자기 DB를 갱신한다 | 서비스끼리 느슨하게 결합된다 | 이벤트 전파만큼 일관성이 늦어진다. 유실·중복 처리가 필요하다 |
| 백그라운드 동기화 | 배치 작업이 주기적으로 저장소를 비교해 맞춘다 | 단순하다. 다른 패턴의 누락을 보정하는 안전망이 된다 | 실행 주기만큼 늦다 |
| 사가(saga) | 긴 업무를 서비스별 로컬 트랜잭션의 연쇄로 나누고, 중간에 실패하면 앞 단계를 **보상 트랜잭션**으로 되돌린다 | 분산 트랜잭션(2PC) 없이 여러 서비스에 걸친 작업을 끝낸다 | 중간 상태가 외부에 보인다. 보상 로직을 따로 설계해야 한다 |
| CQRS | 읽기·쓰기 저장소를 나누고 비동기로 맞춘다 | 각 모델을 따로 최적화한다 | 쓰고 바로 읽으면 옛 값이 보일 수 있다 |

사가는 중앙 조정자가 단계를 지시하는 **오케스트레이션(orchestration)** 과, 각 서비스가 이벤트에 반응해 다음 단계를 이어 가는 **코레오그래피(choreography)** 로 구현한다.

이벤트를 전달받는 쪽은 같은 이벤트를 두 번 받을 수 있다고 가정한다. 메시지 시스템의 전달 보장 수준과 유실 대책은 [[message-queue-kafka|메시지 큐와 Kafka]]에 있다.

## 데이터 이전과 스키마 진화: Avro

데이터를 다른 저장소로 옮기거나 이벤트를 오래 보관하면, 그 사이에 **스키마가 바뀐다.** 옛 데이터와 새 데이터를 함께 읽을 수 있어야 한다.

**Apache Avro** 는 데이터 직렬화와 RPC를 위한 형식으로, Hadoop 생태계에서 시작했다. 스키마를 JSON으로 정의하고 데이터는 압축된 바이너리로 쓴다.

| 특징 | 이전에 주는 이점 |
| --- | --- |
| 객체 컨테이너 파일에 **스키마를 데이터와 함께** 저장한다 | 파일을 받은 쪽이 별도 정의 없이도 읽는 법을 안다 |
| 읽을 때 **쓴 쪽 스키마(writer schema)** 와 **읽는 쪽 스키마(reader schema)** 를 맞춰 본다 | 필드가 추가·삭제돼도 기본값 규칙에 따라 옛 데이터와 새 데이터를 모두 읽는다 |
| 코드 생성 없이 스키마만으로 동적으로 읽을 수 있다 | 컬럼이 바뀐 테이블을 내보낼 때 새 스키마를 만들어 새 데이터와 함께 쓰면 된다 |

Protobuf·Thrift는 필드 번호를 붙인 스키마로 코드를 미리 생성하는 쪽이라 RPC에 강하고, Avro는 스키마를 데이터와 함께 다니게 해 대량 이전과 파이프라인에 강하다. Kafka에서는 스키마를 **스키마 레지스트리(schema registry)** 에 등록하고 메시지에는 스키마 ID만 실어, 호환성 규칙(backward, forward, full)을 어기는 스키마 변경을 등록 단계에서 막는다. Protobuf 쪽은 [[grpc|gRPC: Protocol Buffers로 정의하는 RPC]]에 있다.

## 정리

- 저장소가 여럿이면 「변경을 빠짐없이 전달」과 「전달 중 어긋남」을 함께 설계한다.
- 변경 전달은 로그 기반 CDC가 표준이고, 이중 쓰기 대신 아웃박스로 상태 변경과 이벤트 발행을 한 트랜잭션에 묶는다.
- 이벤트 소싱은 상태 대신 사건을 저장해 재현과 감사를 얻고, 그 대가로 투영·스냅숏·스키마 버전을 관리한다.
- CQRS와 이벤트·사가 기반 연동은 최종 일관성을 받아들이는 대신 확장성과 결합도를 얻는다.
- 오래 사는 데이터는 스키마 진화 규칙(Avro, 스키마 레지스트리)을 처음부터 정해 둔다.

관련 노트: [[message-queue-kafka|메시지 큐와 Kafka]], [[database-sharding|데이터베이스 샤딩]], [[database-scaling|데이터베이스 확장과 성능 최적화]], [[web-scalability-components|웹 확장성의 구성 요소: 한 장으로 보는 웹 아키텍처]], [[transaction|트랜잭션과 회복]], [[distributed-system-patterns|분산 시스템의 통신·데이터 흐름 패턴]], [[caching-strategies|캐시 전략: 계층, 읽기·쓰기 패턴, 교체 정책, 장애 패턴]], [[event-driven-architecture|이벤트 기반 아키텍처 설계]]
