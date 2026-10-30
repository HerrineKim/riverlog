---
title: "데이터베이스 모델: RDB, NoSQL, NewSQL"
concept: "Database Model"
summary: "관계형 DB의 특징과 한계, NoSQL 네 가지 유형과 CAP 정리, 둘의 장점을 합치려는 NewSQL을 비교하고, 프로젝트에서 무엇을 고를지와 PostgreSQL·MySQL의 차이를 정리. 평면·계층·네트워크 모델에서 관계형까지의 계보와 분석용 스타·스노플레이크 스키마도 다룬다."
tags: ["database", "rdbms", "nosql", "newsql", "sql", "mongodb"]
source: mixed
date: "2026-10-16"
sources: ["https://riverkim.kr/175", "https://www.slideshare.net/slideshow/pdf-81ec/262366350", "https://bytebytego.com/guides/top-6-database-models", "https://bytebytego.com/guides/cap-theorem-one-of-the-most-misunderstood-terms", "https://d2.naver.com/helloworld/227936", "http://woowabros.github.io/study/2018/02/26/mysql-char-comparison.html", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/db.md"]
---

> 노션 정리를 바탕으로, 데이터 모델의 계보와 CAP 정리의 오해는 ByteByteGo의 System Design 101 가이드 「[Top 6 Database Models](https://bytebytego.com/guides/top-6-database-models)」, 「[CAP Theorem: One of the Most Misunderstood Terms](https://bytebytego.com/guides/cap-theorem-one-of-the-most-misunderstood-terms)」로, PostgreSQL 구조와 문자열 비교 차이는 「[한 눈에 살펴보는 PostgreSQL](https://d2.naver.com/helloworld/227936)」, 「[MySQL 'a' = 'a '가 true인가?](http://woowabros.github.io/study/2018/02/26/mysql-char-comparison.html)」로 보강했다. RDB와 NoSQL의 비용 비교는 「[fru1tworld/cs-basic 모의 면접 질문 목록](https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/db.md)」의 질문을 실마리로 보강했다.

데이터베이스는 데이터의 집합이고, 이를 저장·관리하는 소프트웨어가 **DBMS(Database Management System)**다. 데이터를 어떤 구조로 저장하느냐에 따라 데이터베이스 모델이 나뉜다. 정해진 스키마와 강한 일관성을 원하면 관계형, 유연한 구조와 수평 확장을 원하면 NoSQL, 둘 다 원하면 NewSQL이라는 식으로 요구사항에 맞춰 고른다.

## 한눈에 비교

| 구분 | 관계형(RDB) | NoSQL | NewSQL |
| --- | --- | --- | --- |
| 데이터 구조 | 정해진 스키마의 테이블 | 스키마가 없거나 유연함 | 테이블 + SQL |
| 일관성 | ACID 트랜잭션 | 대체로 완화된 일관성 | ACID 지원 |
| 확장 | 주로 수직 확장(scale-up) | 수평 확장(scale-out) 용이 | 수평 확장 지원 |
| 질의 | 표준 SQL, JOIN | 제품별 API | SQL |
| 예 | MySQL, PostgreSQL, Oracle, SQL Server | MongoDB, Redis, Cassandra, Neo4j | Google Spanner, CockroachDB, TiDB, YugabyteDB |

## 데이터 모델의 계보

관계형 이전에도 데이터를 구조화하는 모델이 있었고, 관계형은 그 한계를 풀며 표준이 되었다.

| 모델 | 구조 | 강점 | 한계 |
| --- | --- | --- | --- |
| 평면(flat) | 표 하나. 행은 레코드, 열은 속성 | 스프레드시트처럼 단순하다 | 엔터티 간 관계를 표현하지 못하고 중복이 많다 |
| 계층(hierarchical) | 트리. 레코드마다 부모가 하나, 자식은 여럿 | 부모-자식 관계가 뚜렷한 데이터를 빨리 따라간다 | 다대다 관계를 표현하기 어렵고 구조가 경직된다 |
| 네트워크(network) | 그래프. 레코드가 부모를 여럿 가질 수 있다 | 다대다 관계를 직접 표현한다 | 레코드 사이 포인터를 따라가는 질의를 코드로 짜야 해 복잡하다 |
| **관계형(relational)** | 1970년 E. F. Codd가 제안. 테이블(릴레이션)과 키로 관계를 표현 | 정규화로 중복을 줄이고, SQL로 무엇을 원하는지만 선언한다. 다대다·복잡한 질의·트랜잭션 | 아래 「관계형 데이터베이스」 절 |

계층·네트워크 모델의 발상은 사라지지 않았다. 문서형 DB는 계층(트리) 모델을, 그래프 DB는 네트워크 모델을 현대적으로 되살린 셈이다.

### 분석용 모델: 스타 스키마와 스노플레이크 스키마

데이터 웨어하우스(OLAP)에서는 정규화보다 **집계 쿼리를 빨리 돌리는 것**이 중요해 테이블을 다르게 배치한다.

```text
스타 스키마                              스노플레이크 스키마
        [dim_날짜]                               [dim_날짜]
            │                                       │
[dim_상품]─[fact_매출]─[dim_매장]       [dim_카테고리]─[dim_상품]─[fact_매출]─[dim_매장]─[dim_지역]
            │                                       │
        [dim_고객]                               [dim_고객]
```

| 항목 | 스타 스키마 | 스노플레이크 스키마 |
| --- | --- | --- |
| 구조 | 가운데 **사실 테이블(fact)** 에 측정값(매출액, 수량)과 차원 키를 두고, 둘레에 **차원 테이블(dimension)** 을 하나씩 붙인다 | 차원 테이블을 정규화해 하위 차원 테이블로 더 쪼갠다 |
| 조인 | 적다. 질의가 단순하고 빠르다 | 많다. 질의가 복잡해진다 |
| 중복 | 차원 테이블에 중복이 있다 | 중복이 적고 저장 효율·정합성이 좋다 |
| 맞는 곳 | 대부분의 분석·BI | 차원 테이블이 크거나 자주 바뀔 때 |

어떤 질문에 어떤 DB를 쓰는지는 [[database-selection|용도별 데이터베이스와 고르는 법]]에 있다.

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

버전이 오르며 두 DB의 기능 격차는 많이 줄었고, 기본 기능이 비슷해 서로 옮기기도 어렵지 않다.

**PostgreSQL의 구조**: 클라이언트가 접속하면 postmaster(현재 이름은 postgres 서버 프로세스)가 **연결마다 백엔드 프로세스를 하나씩 띄운다.** 스레드가 아니라 프로세스라서 연결이 많아지면 메모리 부담이 크므로, 앞단에 PgBouncer 같은 커넥션 풀러를 두는 경우가 많다([[connection-pool|DB 커넥션 풀]]). 쿼리는 파싱 → 의미 분석 → **규칙(rule) 기반 재작성** → 실행 계획 선택 → 실행 순서로 처리된다. 타입·함수·인덱스 접근 방식까지 시스템 카탈로그에 정의할 수 있어 확장이 쉽고, PostGIS(공간), pgvector(벡터 검색), hstore(키-값) 같은 확장이 이 구조 위에 올라간다.

**옮길 때 걸리는 차이: 문자열 끝 공백.** SQL 표준의 **PAD SPACE** 비교는 길이가 다른 두 문자열의 짧은 쪽 뒤에 공백을 채운 뒤 비교한다. 그래서 `'a' = 'a '`의 결과가 DB와 설정마다 다르다.

| DB | 동작 |
| --- | --- |
| MySQL 5.7 이전·`PAD SPACE` 콜레이션 | 끝 공백을 무시해 참 |
| MySQL 8.0 기본 콜레이션(`utf8mb4_0900_ai_ci`) | `NO PAD`라서 VARCHAR끼리는 거짓. CHAR 컬럼은 읽을 때 끝 공백을 지운다 |
| PostgreSQL | CHAR(n)은 끝 공백을 무시하고, VARCHAR·TEXT는 공백까지 비교해 거짓 |

DB를 옮기거나 둘을 섞어 쓸 때는 컬럼 타입(CHAR·VARCHAR)과 콜레이션을 함께 확인하고, 입력 단계에서 공백을 정리해 두는 편이 안전하다. GUI 클라이언트로 접속하는 방법은 [[dbeaver|DBeaver]]에 있다.

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
- 예: Cassandra, ScyllaDB, HBase
- 파티션 키·클러스터링 키 설계, LSM 트리 저장 엔진, 핫 파티션 대응은 [[wide-column-database|와이드 컬럼 DB와 대규모 메시지 저장: Cassandra·ScyllaDB]]에 있다.

### 그래프형 (Graph)

- 데이터를 **노드**, 관계를 **엣지**로 저장한다. 관계 자체가 저장되어 있어 여러 단계의 관계를 따라가는 질의가 RDB의 다중 JOIN보다 빠르다.
- 소셜 네트워크, 추천 시스템 등에 적합.
- 예: Neo4j

### CAP 정리

분산 데이터베이스는 네트워크가 끊겨 노드끼리 연락이 안 되는 상황(분할)을 피할 수 없다. CAP 정리(CAP theorem)는 **분할이 생겼을 때 일관성과 가용성 중 하나를 포기해야 한다**는 뜻이다.

| 성질 | 뜻 |
| --- | --- |
| 일관성(Consistency) | 어느 노드에서 읽어도 가장 최근에 쓴 값을 본다 |
| 가용성(Availability) | 살아 있는 노드는 항상 응답한다 |
| 분할 내성(Partition tolerance) | 노드 사이 통신이 끊겨도 시스템이 동작한다 |

분할 내성은 분산 시스템에서 뺄 수 없으므로 실제 선택은 **CP**(분할 중에는 일부 요청을 거절하고 정확성을 지킨다)와 **AP**(일단 응답하고 나중에 맞춘다, 최종 일관성) 사이다. 분할이 없을 때도 지연 시간과 일관성을 맞바꾼다는 점까지 넣은 확장이 PACELC다. 많은 제품은 하나로 고정되지 않고 설정(복제 수, 읽기·쓰기 정족수)으로 조절한다.

CAP은 자주 오해된다.

- **「셋 중 둘을 고른다」는 표현은 거친 단순화다.** CAP이 금지하는 것은 「분할이 난 상황에서 완벽한 일관성과 완벽한 가용성을 동시에」뿐이다. 분할이 없을 때는 둘 다 가질 수 있다.
- CAP의 C와 A는 **100%** 를 뜻한다. 실제 설계 논의는 분할이 없는 평소에 지연과 일관성을 어떻게 맞바꾸느냐(PACELC의 ELC)가 더 자주 문제가 된다.
- **CAP만으로 DB를 고르지 않는다.** 채팅 메시지 저장에 Cassandra를 쓰는 이유는 AP라서가 아니라 쓰기 처리량, 파티션 단위 조회 같은 특성 때문이다. CAP은 트레이드오프를 따져 보게 하는 출발점이다.

## NewSQL

RDB의 **ACID와 SQL**을 유지하면서 NoSQL 수준의 **수평 확장성과 성능**을 얻으려는 데이터베이스.

- 파티셔닝/샤딩으로 데이터를 여러 노드에 분산
- 분산 환경에서의 동시성 제어
- 복제(replication)와 장애 복구(crash recovery)
- 예: Google Spanner, CockroachDB, TiDB, YugabyteDB. "분산 SQL(Distributed SQL)"이라고도 부른다. 초기 대표 제품이던 NuoDB는 2020년 다쏘시스템에 인수되었다.

## 무엇을 고를까

판단 기준은 **데이터가 테이블에 담기는 쪽이 유리한지, 문서에 담기는 쪽이 유리한지**다.

### RDB가 무거워지는 지점과 NoSQL이 치르는 대가

**NoSQL이 늘 빠른 것은 아니다.** NoSQL은 RDB가 기본으로 제공하는 기능 일부를 빼서 그 비용을 아낀다. 빠진 기능이 워크로드에 필요하면 결국 애플리케이션이 그 비용을 다시 치른다.

| RDB가 기본으로 치르는 비용 | 어디서 부하가 되나 | NoSQL의 선택 |
| --- | --- | --- |
| 정규화된 스키마와 JOIN | 화면 하나를 그리려고 여러 테이블을 조인한다. 데이터가 커지면 조인 비용과 실행 계획의 변동이 커진다 | 함께 읽는 데이터를 문서·파티션 하나에 모아 둔다(반정규화). 대신 중복 데이터를 함께 고쳐야 한다 |
| 다중 행 ACID 트랜잭션, 잠금, MVCC | 쓰기마다 WAL·undo 기록, 잠금 경합, 옛 버전 정리 비용 | 단일 문서·단일 키 원자성으로 제한하거나 최종 일관성을 택한다 |
| 스키마·제약 조건 검사 | 외래 키·유니크·CHECK를 쓰기마다 검사한다. 큰 테이블의 스키마 변경이 무겁다 | 스키마를 강제하지 않는다. 검증 책임이 애플리케이션으로 간다 |
| 범용 질의(임의 조건·집계) | 어떤 질의든 받기 위해 옵티마이저·인덱스를 갖춘다 | 키·파티션으로 접근하는 정해진 질의만 빠르다. 질의 패턴이 바뀌면 데이터를 다시 짜야 한다 |
| 단일 노드 중심 설계 | 쓰기와 용량이 한 서버의 한계에 묶인다 | 처음부터 파티셔닝·복제를 전제로 해 수평 확장이 쉽다 |

| NoSQL의 강점 | NoSQL의 약점 |
| --- | --- |
| 수평 확장과 대량 쓰기 처리량 | 여러 엔터티에 걸친 트랜잭션·조인이 약하거나 없다 |
| 스키마 변경 없이 필드를 더하는 유연함 | 데이터 정합성(중복 데이터 동기화, 참조 무결성)을 앱이 책임진다 |
| 키·파티션 단위 조회의 예측 가능한 지연 | 미리 정하지 않은 질의·집계가 비싸다 |
| 데이터 모양(문서·그래프·시계열)에 맞는 모델 | 제품마다 질의 언어와 일관성 모델이 달라 학습·이전 비용이 크다 |

그래서 NoSQL을 고르는 근거는 「빠르다」가 아니라 **워크로드의 모양**이다. 접근 패턴이 키 중심으로 정해져 있고, 쓰기량이나 데이터 양이 한 서버를 넘고, 다중 엔터티 트랜잭션이 거의 필요 없을 때 NoSQL이 이득이다. 반대로 질의가 다양하고 정합성이 중요한 데이터는 RDB가 싸다.

| 상황 | 유리한 쪽 |
| --- | --- |
| 데이터 간 관계가 많고 정합성이 중요하다 (결제, 재고) | RDB |
| 스키마가 자주 바뀌거나 비정형 데이터가 많다 | 문서형 NoSQL (MongoDB 등) |
| 특별한 요구가 없는 일반 서비스 (쇼핑몰, 블로그) | 어느 쪽으로도 만들 수 있다 |

흔히 "MongoDB는 쉽다"고 하는데, 이는 쿼리 문법이 JavaScript 객체와 닮아 입문 장벽이 낮다는 뜻이다. 초보용·숙련자용을 가르는 기준은 아니다.

검색·분석·시계열·벡터처럼 용도별로 DB를 고르는 순서와 결정 트리는 [[database-selection|용도별 데이터베이스와 고르는 법]]에 있다.

## 애플리케이션에서 접근하기: ORM과 ODM

애플리케이션 코드는 보통 DB를 직접 다루지 않고 매핑 도구를 거친다.

- **ORM**(Object-Relational Mapping): 테이블 행을 객체로 매핑한다. 예: Django ORM, TypeORM, Prisma
- **ODM**(Object-Document Mapping): 문서를 객체로 매핑한다. 예: Mongoose

관련 노트: [[sql-basics|SQL 기초]], [[mongodb|MongoDB 시작하기와 CRUD]], [[transaction|트랜잭션과 회복]], [[normalization|정규화와 반정규화]], [[backend-developer-roadmap|백엔드 개발자가 알아야 할 것]], [[database-sharding|데이터베이스 샤딩]], [[database-selection|용도별 데이터베이스와 고르는 법]]
