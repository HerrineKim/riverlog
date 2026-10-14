---
title: "데이터베이스 모델: RDB, NoSQL, NewSQL"
concept: "Database Model"
summary: "관계형 DB의 특징과 한계, NoSQL 네 가지 유형, 둘의 장점을 합치려는 NewSQL을 비교하고, 프로젝트에서 무엇을 고를지와 PostgreSQL·MySQL의 차이를 정리."
tags: ["database", "rdbms", "nosql", "newsql", "sql", "mongodb"]
source: notion
date: "2026-10-13"
sources: ["https://riverkim.kr/175"]
---

데이터베이스는 데이터의 집합이고, 이를 저장·관리하는 소프트웨어가 **DBMS(Database Management System)**다. 데이터를 어떤 구조로 저장하느냐에 따라 데이터베이스 모델이 나뉜다. 정해진 스키마와 강한 일관성을 원하면 관계형, 유연한 구조와 수평 확장을 원하면 NoSQL, 둘 다 원하면 NewSQL이라는 식으로 요구사항에 맞춰 고른다.

## 한눈에 비교

| 구분 | 관계형(RDB) | NoSQL | NewSQL |
| --- | --- | --- | --- |
| 데이터 구조 | 정해진 스키마의 테이블 | 스키마가 없거나 유연함 | 테이블 + SQL |
| 일관성 | ACID 트랜잭션 | 대체로 완화된 일관성 | ACID 지원 |
| 확장 | 주로 수직 확장(scale-up) | 수평 확장(scale-out) 용이 | 수평 확장 지원 |
| 질의 | 표준 SQL, JOIN | 제품별 API | SQL |
| 예 | MySQL, PostgreSQL, Oracle, SQL Server | MongoDB, Redis, Cassandra, Neo4j | Google Spanner, CockroachDB, TiDB, YugabyteDB |

## 관계형 데이터베이스 (RDB)

데이터를 행과 열로 이루어진 테이블(릴레이션)에 저장하고, 테이블 간 관계를 키로 표현한다.

- **ACID** 트랜잭션: 원자성, 일관성, 격리성, 지속성
- **정규화**(1NF, 2NF, 3NF …)로 중복과 이상 현상을 줄임
- ANSI 표준 SQL과 **JOIN**으로 복잡한 질의 가능
- 확장은 주로 더 좋은 서버로 바꾸는 **scale-up** 방식

한계: 스키마가 경직되어 있어 구조가 자주 바뀌거나 비정형인 대용량 데이터(빅데이터)를 다루기에는 불리하다.

대표 제품

- **MySQL**: 가장 널리 쓰이는 오픈소스 RDBMS 중 하나, 가볍고 다중 사용자 환경에 강함
- **PostgreSQL**: 표준 준수와 확장성이 뛰어난 오픈소스 RDBMS (아래 절 참고)
- **Oracle**: 대기업·금융권에서 많이 쓰는 상용 RDBMS
- **Microsoft SQL Server**

### PostgreSQL과 MySQL

PostgreSQL은 사용자 정의 타입, 테이블 상속, 배열·JSON 컬럼 같은 객체 지향 기능을 갖춰 **객체관계형 DBMS(ORDBMS)**로 분류된다. 다만 지금은 주요 RDBMS 대부분이 이런 기능을 받아들여, ORDBMS와 RDBMS를 나누는 의미는 작다. 로고의 코끼리 이름은 Slonik이다.

| 구분 | PostgreSQL | MySQL |
| --- | --- | --- |
| SQL 표준 | 충실하게 따른다 | 상대적으로 느슨하다 |
| 강점 | 복잡한 쿼리, 확장 기능(JSONB, 전문 검색 등) | 단순한 CRUD가 가볍고 빠르다 |
| 쓰임 | Stack Overflow 개발자 설문에서 2023년부터 사용률 1위. Supabase·Neon 같은 관리형 서비스의 기본 엔진 | 국내 웹 서비스에서 오래 쓰여 레거시가 많다 |

버전이 오르며 두 DB의 기능 격차는 많이 줄었고, 기본 기능이 비슷해 서로 옮기기도 어렵지 않다. GUI 클라이언트로 접속하는 방법은 [[dbeaver|DBeaver]]에 있다.

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
- 예: Google Spanner, CockroachDB, TiDB, YugabyteDB. "분산 SQL(Distributed SQL)"이라고도 부른다. 초기 대표 제품이던 NuoDB는 2020년 다쏘시스템에 인수되었다.

## 무엇을 고를까

판단 기준은 **데이터가 테이블에 담기는 쪽이 유리한지, 문서에 담기는 쪽이 유리한지**다.

| 상황 | 유리한 쪽 |
| --- | --- |
| 데이터 간 관계가 많고 정합성이 중요하다 (결제, 재고) | RDB |
| 스키마가 자주 바뀌거나 비정형 데이터가 많다 | 문서형 NoSQL (MongoDB 등) |
| 특별한 요구가 없는 일반 서비스 (쇼핑몰, 블로그) | 어느 쪽으로도 만들 수 있다 |

흔히 "MongoDB는 쉽다"고 하는데, 이는 쿼리 문법이 JavaScript 객체와 닮아 입문 장벽이 낮다는 뜻이다. 초보용·숙련자용을 가르는 기준은 아니다.

## 애플리케이션에서 접근하기: ORM과 ODM

애플리케이션 코드는 보통 DB를 직접 다루지 않고 매핑 도구를 거친다.

- **ORM**(Object-Relational Mapping): 테이블 행을 객체로 매핑한다. 예: Django ORM, TypeORM, Prisma
- **ODM**(Object-Document Mapping): 문서를 객체로 매핑한다. 예: Mongoose

관련 노트: [[sql-basics|SQL 기초]], [[mongodb|MongoDB 시작하기와 CRUD]], [[transaction|트랜잭션과 회복]], [[normalization|정규화와 반정규화]]
