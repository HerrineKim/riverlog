---
title: "데이터베이스 모델: RDB, NoSQL, NewSQL"
concept: "Database Model"
summary: "관계형 DB의 특징과 한계, NoSQL 네 가지 유형, 둘의 장점을 합치려는 NewSQL을 비교."
tags: ["database", "rdbms", "nosql", "newsql"]
source: notion
---

데이터를 어떤 구조로 저장하느냐에 따라 데이터베이스 모델이 나뉜다. 정해진 스키마와 강한 일관성을 원하면 관계형, 유연한 구조와 수평 확장을 원하면 NoSQL, 둘 다 원하면 NewSQL이라는 식으로 요구사항에 맞춰 고른다.

## 한눈에 비교

| 구분 | 관계형(RDB) | NoSQL | NewSQL |
| --- | --- | --- | --- |
| 데이터 구조 | 정해진 스키마의 테이블 | 스키마가 없거나 유연함 | 테이블 + SQL |
| 일관성 | ACID 트랜잭션 | 대체로 완화된 일관성 | ACID 지원 |
| 확장 | 주로 수직 확장(scale-up) | 수평 확장(scale-out) 용이 | 수평 확장 지원 |
| 질의 | 표준 SQL, JOIN | 제품별 API | SQL |
| 예 | MySQL, PostgreSQL, Oracle, SQL Server | MongoDB, Redis, Cassandra, Neo4j | CockroachDB, NuoDB |

## 관계형 데이터베이스 (RDB)

데이터를 행과 열로 이루어진 테이블(릴레이션)에 저장하고, 테이블 간 관계를 키로 표현한다.

- **ACID** 트랜잭션: 원자성, 일관성, 격리성, 지속성
- **정규화**(1NF, 2NF, 3NF …)로 중복과 이상 현상을 줄임
- ANSI 표준 SQL과 **JOIN**으로 복잡한 질의 가능
- 확장은 주로 더 좋은 서버로 바꾸는 **scale-up** 방식

한계: 스키마가 경직되어 있어 구조가 자주 바뀌거나 비정형인 대용량 데이터(빅데이터)를 다루기에는 불리하다.

대표 제품

- **MySQL**: 가장 널리 쓰이는 오픈소스 RDBMS 중 하나, 가볍고 다중 사용자 환경에 강함
- **PostgreSQL**: 표준 준수와 확장성이 뛰어난 오픈소스 RDBMS
- **Oracle**: 대기업·금융권에서 많이 쓰는 상용 RDBMS
- **Microsoft SQL Server**

## NoSQL

"Not only SQL". 비정형 데이터를 다루며 고정 스키마가 없고, 애플리케이션의 도움 없이도 여러 서버에 데이터를 나눠 저장(자동 분산·밸런싱)하는 경우가 많다. 캐싱이 통합된 제품도 있다.

### 문서형 (Document)

- JSON(BSON) 같은 트리 구조 문서를 저장. 문서마다 구조가 달라도 된다.
- 문서 내부 필드로 검색하기 쉽다.
- 예: MongoDB, Couchbase

### 키-값형 (Key-Value)

- 하나의 키에 하나의 값을 매핑하는 가장 단순한 구조. 매우 빠르다.
- 주로 메모리에 두고 세션, 캐시, 실시간 순위·시세 같은 상태 저장에 쓴다.
- 예: Redis

### 와이드 컬럼형 (Wide Column)

- 행마다 서로 다른 컬럼 집합을 가질 수 있는 거대한 2차원 맵 구조.
- 대규모 분산 저장과 대량 쓰기·조회에 강하다.
- 예: Cassandra, HBase

### 그래프형 (Graph)

- 데이터를 **노드**, 관계를 **엣지**로 저장한다. 관계 자체가 저장되어 있어 여러 단계의 관계를 따라가는 질의가 RDB의 다중 JOIN보다 빠르다.
- 소셜 네트워크, 추천 시스템 등에 적합.
- 예: Neo4j

## NewSQL

RDB의 **ACID와 SQL**을 유지하면서 NoSQL 수준의 **수평 확장성과 성능**을 얻으려는 데이터베이스.

- 파티셔닝/샤딩으로 데이터를 여러 노드에 분산
- 분산 환경에서의 동시성 제어
- 복제(replication)와 장애 복구(crash recovery)
- 예: CockroachDB, NuoDB (Google Spanner도 이 계열로 분류된다)
