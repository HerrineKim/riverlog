---
title: "데이터베이스 샤딩"
concept: "Database Sharding"
summary: "한 DB에 담기 어려울 만큼 커진 데이터를 같은 스키마의 여러 DB로 행 단위로 나누는 샤딩을 정리했다. 샤드 키와 라우팅 방식(모듈러·범위·디렉터리·일관된 해싱·가상 버킷), 샤딩이 어렵게 만드는 것, ShardingSphere 같은 미들웨어, 기존 DB에서 옮겨 올 때의 동기화와 첫 요청 지연까지 다룬다."
tags: ["backend", "database", "architecture", "performance", "mysql"]
source: other
date: "2026-10-17"
sources: ["https://dev.gmarket.com/61", "https://shardingsphere.apache.org/document/current/en/overview/", "https://www.mongodb.com/docs/manual/core/sharding-choose-a-shard-key/", "https://debezium.io/documentation/reference/stable/architecture.html", "https://bytebytego.com/guides/100x-postgres-scaling-at-figma", "https://bytebytego.com/guides/a-crash-course-in-database-sharding", "https://bytebytego.com/guides/key-concepts-to-understand-database-sharding", "https://bytebytego.com/guides/top-4-data-sharding-algorithms-explained", "https://bytebytego.com/guides/consistent-hashing", "https://bytebytego.com/guides/vertical-partitioning-vs-horizontal-partitioning"]
---

> G마켓 기술 블로그의 「[Sharded MySQL Cluster 도입 배경과 개발기](https://dev.gmarket.com/61)」(2022.12)를 바탕으로 재구성하고, ShardingSphere·MongoDB·Debezium 공식 문서로 최신화한 노트다. 단계별 확장 사례는 ByteByteGo의 System Design 101 가이드 「[100X Postgres Scaling at Figma](https://bytebytego.com/guides/100x-postgres-scaling-at-figma)」를 바탕으로 덧붙였다. 라우팅 알고리즘과 일관된 해싱은 같은 가이드의 「[A Crash Course on Database Sharding](https://bytebytego.com/guides/a-crash-course-in-database-sharding)」, 「[Key Concepts to Understand Database Sharding](https://bytebytego.com/guides/key-concepts-to-understand-database-sharding)」, 「[Top 4 Data Sharding Algorithms](https://bytebytego.com/guides/top-4-data-sharding-algorithms-explained)」, 「[Consistent Hashing Explained](https://bytebytego.com/guides/consistent-hashing)」, 「[Vertical vs Horizontal Partitioning](https://bytebytego.com/guides/vertical-partitioning-vs-horizontal-partitioning)」로 보강했다.

## 샤딩이란

**샤딩(sharding)** 은 하나의 큰 테이블을 **같은 스키마를 가진 여러 DB 서버에 행 단위로 나눠 저장**하는 수평 분할 기법이다. 나뉜 조각 하나를 **샤드(shard)** 라 한다.

한 DB에 데이터가 쌓이면 용량뿐 아니라 인덱스 크기, 잠금 경합, 쓰기 처리량이 함께 한계에 닿는다. 서버 사양을 올리는 수직 확장(scale-up)은 비싸고 끝이 있다. 샤딩은 서버를 늘리는 **수평 확장(scale-out)** 으로 데이터와 쓰기 부하를 나눈다.

| 용어 | 뜻 |
| --- | --- |
| 파티셔닝(partitioning) | 테이블을 나누는 일 전반. 보통 **한 DB 서버 안에서** 나누는 것을 가리킨다 |
| 샤딩 | 수평 파티셔닝을 **여러 DB 서버에 걸쳐** 하는 것 |
| 복제(replication) | 같은 데이터를 여러 서버에 복사한다. 읽기는 나눠지지만 쓰기와 용량은 그대로다 |

## 샤딩 전에 먼저 해 볼 것

**샤딩은 운영 복잡도를 크게 올리므로 마지막 수단이다.** 다음으로 풀리면 샤딩하지 않는다.

1. 쿼리·인덱스 튜닝, 오래된 데이터 보관용 DB로 옮기기
2. 캐시로 반복 조회 줄이기
3. **읽기·쓰기 분리**: 쓰기 DB와 읽기 전용 복제본을 나눈다. 명령과 조회 모델을 아예 분리하면 CQRS(Command Query Responsibility Segregation)가 된다. 조회 폭주가 쓰기 DB로 번지는 장애 전파도 막는다
4. 수직 분할: 컬럼이나 도메인 단위로 테이블을 다른 DB로 떼어 낸다

이래도 데이터 양이나 쓰기 처리량이 한 서버를 넘으면 샤딩을 고려한다. 상용 DB의 라이선스 비용이 서버 대수에 비례해 부담된다면, 오픈 소스 DB(MySQL 등)로 읽기 전용 샤드 클러스터를 따로 만드는 선택도 있다.

### 사례: 단일 PostgreSQL에서 수평 분할까지

트래픽이 백 배로 늘어난 협업 디자인 툴 사례(Figma)는 위 순서를 그대로 밟았다.

| 단계 | 한 일 | 다음 단계로 간 이유 |
| --- | --- | --- |
| 1. 수직 확장 + 복제 | 관리형 DB 인스턴스를 가장 큰 사양으로 올리고, 읽기 복제본을 늘리고, **커넥션 풀러(PgBouncer)** 로 늘어나는 연결 수를 제한했다 | 단일 DB의 한계 |
| 2. 수직 분할 | 트래픽이 큰 테이블(파일, 조직 등)을 도메인별로 **별도 DB로 떼어 냈다.** DB마다 커넥션 풀러를 따로 뒀다 | 일부 테이블이 수 TB·수십억 행이 되어 VACUUM이 부담되고, 인스턴스의 IOPS 한도에 닿았다 |
| 3. 수평 분할 | 큰 테이블을 여러 물리 DB로 나누고, 쿼리를 해석해 해당 샤드로 보내는 **자체 DB 프록시**를 만들었다 | |

PostgreSQL에서는 행이 많아질수록 VACUUM(죽은 튜플 정리) 비용이 커진다는 점이 수평 분할의 직접적인 계기가 된다.

## 수직 분할과 수평 분할

| 구분 | 나누는 단위 | 결과 |
| --- | --- | --- |
| 수직 분할 | 컬럼(또는 테이블·도메인) | 서로 다른 스키마의 테이블들이 생긴다. 자주 쓰는 컬럼과 큰 컬럼을 떼어 놓을 때 |
| 수평 분할 | 행 | 같은 스키마의 테이블이 여러 개 생기고, 각 행은 **샤드 키**에 따라 한 곳에 들어간다. 샤딩은 이쪽이다 |

수직 분할은 각 테이블의 행 수가 그대로이고 컬럼만 줄어든다. 수평 분할은 컬럼은 그대로이고 행만 줄어, 쿼리가 훑는 행이 적어지니 응답도 빨라진다.

## 샤드 키

**샤드 키(shard key)** 는 어느 행이 어느 샤드로 갈지 정하는 컬럼이다. 샤딩의 성패는 데이터와 요청이 샤드에 **고르게 퍼지느냐**에 달렸고, 그것을 샤드 키가 정한다.

| 기준 | 좋은 키 | 나쁜 키 |
| --- | --- | --- |
| 카디널리티(cardinality) | 서로 다른 값이 많다 (사용자 ID, 상품 번호) | 값 종류가 적다 (국가, 상태 코드). 샤드를 값 종류 수 이상으로 늘려도 소용없다 |
| 빈도(frequency) | 값마다 행 수가 비슷하다 | 일부 값에 행이 몰린다. 그 샤드만 커지고 바빠진다 |
| 단조성 | 증가 방향이 없거나 해시로 섞인다 | 시각, 자동 증가 ID를 범위 방식으로 쓰면 새 쓰기가 전부 마지막 샤드로 몰린다 |
| 쿼리 패턴 | 주요 조회가 키를 조건에 포함한다 | 조회마다 모든 샤드를 뒤져야 한다 |

카디널리티가 낮으면 다른 컬럼을 붙인 복합 키로 늘린다. **샤드 키는 나중에 바꾸기 매우 비싸다.** 처음에 주요 쿼리 패턴을 보고 정한다.

## 라우팅 방식

샤드 키 값으로 샤드를 고르는 규칙이다.

| 방식 | 규칙 | 장점 | 단점 |
| --- | --- | --- | --- |
| 모듈러(해시) | `hash(key) % 샤드 수` | 데이터가 고르게 퍼진다 | 샤드 수를 바꾸면 대부분의 행이 다른 샤드로 옮겨야 한다 |
| 범위(range) | 키 구간별로 샤드 지정 (1~1억 → A, 1억~2억 → B) | 증설할 때 새 구간만 새 샤드에 두면 돼 재배치가 적다. 범위 조회가 한 샤드에서 끝난다 | 최신 구간이나 인기 구간에 부하가 몰린다. 몰린 샤드는 쪼개고, 한산한 샤드는 합쳐야 한다 |
| 디렉터리(lookup) | 키 → 샤드 매핑 표를 따로 둔다 | 배치를 자유롭게 바꾼다 | 매핑 표가 병목·단일 장애점이 된다 |
| 일관된 해싱 | 서버와 키를 같은 해시 링 위에 놓고, 키에서 시계 방향으로 처음 만나는 서버에 둔다 | 서버를 더하거나 빼도 **인접 구간의 키만** 옮긴다 | 가상 노드 없이는 구간 크기가 고르지 않다 |
| 가상 버킷 | 키 → 고정 개수의 가상 버킷 → 물리 샤드의 2단 매핑 | 버킷 단위로 옮겨 재배치가 유연하다. 매핑 표가 작다 | 버킷 수를 처음에 넉넉히 정해야 한다 |

```text
모듈러, 샤드 2개:  상품번호 % 2 → 0,2,4,… → DB0 / 1,3,5,… → DB1
샤드 2→4로 배수 확장: % 4 결과 0,1은 제자리, 2,3인 행만 새 샤드로 이동
```

- 모듈러는 데이터 양이 크게 변하지 않거나, 오래된 데이터를 다른 곳으로 옮겨 일정 수준을 유지하는 데이터에 맞는다.
- 모듈러로 갈 때는 **샤드 수를 배수로만 늘리기로** 정해 두면 옮길 양이 절반으로 정해진다. 아래의 일관된 해싱이나 가상 버킷(「논리 샤드를 많이 만들어 물리 서버에 나눠 담기」)도 재배치를 줄이는 방법이다.

### 일관된 해싱

`hash(key) % N`은 서버 수 N이 고정일 때만 잘 동작한다. N이 하나만 바뀌어도 거의 모든 키의 자리가 바뀌어, 캐시라면 적중 실패가 폭주하고 DB라면 대량 이동이 일어난다. **일관된 해싱(consistent hashing)** 은 서버 수가 바뀌어도 대부분의 키가 제자리에 머물게 한다.

```text
          k0
     s4 ●     ● s0        1. 서버 이름·IP를 해시해 링 위에 놓는다
   ●              k1      2. 키도 같은 해시 함수로 링 위에 놓는다
  s3                ● s1  3. 키에서 시계 방향으로 처음 만나는 서버가 담당한다
    k3   ● s2   k2
새 서버 s4를 k0과 s0 사이에 넣으면 k0만 s0 → s4로 옮긴다. k1~k3은 그대로다.
```

- 서버 수를 N, 키 수를 K라 하면 서버 하나를 더하거나 뺄 때 평균 **K/N개만** 옮긴다.
- 서버가 적으면 링 위 구간이 들쭉날쭉해 일부 서버에 키가 몰린다. 서버마다 링 위에 여러 점(**가상 노드**)을 찍어 고르게 하고, 성능 좋은 서버에는 가상 노드를 더 준다.
- 쓰이는 곳: DynamoDB·Cassandra의 데이터 분산(재배치 최소화), Akamai 같은 CDN의 엣지 서버 콘텐츠 분배, 연결을 오래 유지하는 로드 밸런서의 백엔드 선택, 분산 캐시 클라이언트.

## 샤딩이 어렵게 만드는 것

| 문제 | 이유 | 대응 |
| --- | --- | --- |
| 샤드 간 조인 | 조인할 행이 다른 서버에 있다 | 같은 키로 함께 샤딩(co-location)하거나, 작은 참조 테이블은 모든 샤드에 복사(broadcast table) |
| 샤드 간 트랜잭션 | 한 서버의 ACID가 서버를 넘지 못한다 | 한 트랜잭션이 한 샤드 안에서 끝나게 키를 잡는다. 넘어가면 분산 트랜잭션(XA)이나 보상 처리(사가) |
| 전체 조회·정렬·페이지네이션 | 모든 샤드에 묻고 결과를 합쳐야 한다(scatter-gather) | 키 없는 조회는 검색 엔진·집계용 저장소로 돌린다 |
| 전역 고유 ID | 샤드마다 자동 증가하면 ID가 겹친다 | 분산 ID 생성기(Snowflake 방식 등), UUID |
| 운영 | 백업·스키마 변경·모니터링이 샤드 수만큼 늘어난다 | 자동화와 미들웨어 |
| 재샤딩(resharding) | 샤드 수나 키를 바꾸면 대량 이동이 필요하다 | 일관된 해싱·가상 버킷으로 이동량을 줄이고, CDC로 옮기는 동안 동기화한다 |

## 누가 라우팅하나: 샤딩 미들웨어

애플리케이션이 직접 「이 키는 DB1」을 계산할 수도 있지만, 코드 곳곳에 분기가 생긴다. 보통 미들웨어에 맡긴다.

| 계층 | 예 | 특징 |
| --- | --- | --- |
| 애플리케이션 코드 | 직접 구현 | 자유롭지만 복잡도와 실수가 앱에 쌓인다 |
| 드라이버·라이브러리 | ShardingSphere-JDBC | 앱 프로세스 안에서 SQL을 고쳐 각 샤드로 보낸다 |
| 프록시 | ShardingSphere-Proxy, Vitess(MySQL) | 앱은 DB 하나에 붙은 것처럼 쓴다. 언어 제약이 없다 |
| DB 자체 | MongoDB, 분산 SQL(CockroachDB, TiDB 등) | DB가 샤딩과 재배치를 직접 한다 |

### ShardingSphere

Apache ShardingSphere는 **나뉜 테이블을 하나의 논리 테이블처럼 쓰게** 해 주는 오픈 소스 미들웨어다. 샤딩 외에 읽기·쓰기 분리, 분산 트랜잭션, 데이터 암호화, 데이터 마이그레이션 기능도 있다. 제품은 두 가지다.

| 항목 | ShardingSphere-JDBC | ShardingSphere-Proxy |
| --- | --- | --- |
| 형태 | 자바 라이브러리(jar). JDBC 드라이버를 감싼다 | MySQL·PostgreSQL 프로토콜을 흉내 내는 독립 서버 |
| 지원 언어 | 자바(JPA, MyBatis 등 JDBC 기반 ORM 전부) | 아무 언어, DB 클라이언트 도구 |
| 성능 손실 | 적다 | 한 홉이 더해져 비교적 크다 |
| DB 연결 수 | 앱 인스턴스마다 모든 샤드에 연결해 많다 | 프록시가 모아 적다 |
| 잘 맞는 곳 | 자바 OLTP 서비스 | 운영·분석 쿼리, 다언어 환경 |

둘을 같은 레지스트리(설정 저장소)로 묶어 함께 쓸 수 있다. 운영에서는 여러 인스턴스가 메타데이터를 공유하는 클러스터 모드를 권장한다.

```yaml
# Spring Boot에서 쓰는 설정의 모양 (개념 예시)
rules:
  - !SHARDING
    tables:
      goods:
        actualDataNodes: ds_${0..3}.goods       # 실제 테이블 4곳
        databaseStrategy:
          standard:
            shardingColumn: goods_no              # 샤드 키
            shardingAlgorithmName: goods_mod
    shardingAlgorithms:
      goods_mod:
        type: MOD
        props:
          sharding-count: 4
  - !BROADCAST
    tables: [category]                            # 모든 샤드에 복사할 작은 테이블
```

## 기존 DB에서 샤드 클러스터로 옮기기

기존 DB를 원본(source)으로 두고 새 샤드 클러스터를 조회용으로 붙일 때는 두 가지가 필요하다.

### 1. 실시간 변경 동기화

**CDC(Change Data Capture)** 는 DB의 변경을 감지해 외부로 흘려보내는 기술이다. 대표인 Debezium은 Kafka Connect의 소스 커넥터로 돌리는 방식이 가장 흔하고, Kafka 없이 쓰는 Debezium Server와 앱에 넣는 Debezium Engine도 있다.

```text
원본 DB ──CDC──▶ 소스 커넥터 ──▶ Kafka 토픽 ──▶ 싱크 커넥터 ──샤드 키로 라우팅──▶ 샤드 DB들
```

원본 DB의 부하나 정책 때문에 CDC를 켤 수 없으면, 같은 구조를 앱으로 흉내 낸다. 변경분을 주기적으로 읽어 토픽에 넣는 앱과, 토픽을 읽어 샤드에 쓰는 앱을 따로 만든다. 다만 커넥터 생태계를 못 쓰는 만큼 개발·운영 부담은 팀이 진다.

### 2. 초기 적재와 동시 실행

대량 적재를 「내보내기 시점 이후 변경분만 나중에 따라잡기」로 계획해도, 적재 중 복제 지연 등으로 시간이 길어지면 틈이 생긴다. **적재 작업과 실시간 동기화를 동시에 돌려도 결과가 같도록 쓰기를 upsert(있으면 갱신, 없으면 삽입)로 만든다.** 같은 행이 두 경로로 와도 최종 상태가 맞는다(멱등성).

## 운영 함정: 첫 요청만 느리다

샤딩 미들웨어를 붙인 자바 서비스는 **인스턴스마다 첫 요청이 수 초씩 걸리는** 일이 흔하다. 원인은 게으른 초기화가 첫 요청에 몰리기 때문이다.

- JVM은 클래스를 처음 쓸 때 로드하고, JIT 컴파일도 실행하면서 한다.
- SQL 파서는 처음 받은 SQL을 구문 트리로 분석해 캐시에 넣는다.
- 각 샤드로의 커넥션 풀, APM 에이전트 계측도 첫 호출에서 준비된다.

파드 하나로 테스트하면 잘 안 보이고, 파드를 여러 개 띄우거나 배포할 때마다 드러난다. **애플리케이션이 준비된 직후 각 샤드를 한 번씩 건드리는 워밍업**으로 푼다.

```java
@Component
@RequiredArgsConstructor
class ShardWarmUp {
    private final GoodsService service;

    @EventListener(ApplicationReadyEvent.class)
    void warmUp() {
        // 샤드마다 하나씩 걸리는 키로 대표 조회를 한 번씩 실행
        List.of(0L, 1L, 2L, 3L).forEach(service::findByGoodsNo);
    }
}
```

워밍업이 끝난 뒤에 트래픽을 받도록 쿠버네티스 readiness probe를 워밍업 완료와 맞춘다.

## 정리

- 샤딩은 같은 스키마의 DB 여러 대에 행을 나눠 담는 수평 확장이다. 튜닝·캐시·읽기 분리로 안 될 때 쓴다.
- 샤드 키는 카디널리티가 높고, 값이 고르게 퍼지고, 주요 쿼리가 포함하는 컬럼으로 고른다. 나중에 바꾸기 어렵다.
- 모듈러는 고르게 퍼지지만 증설이 비싸고, 범위는 증설이 싸지만 쏠린다. 일관된 해싱과 가상 버킷은 증설 때 옮길 양을 줄인다.
- 샤드 간 조인·트랜잭션·전체 조회가 어려워지므로, 한 요청이 한 샤드에서 끝나게 설계한다.
- 이관할 때는 CDC로 변경을 따라가고 쓰기를 upsert로 만들며, 배포 후 첫 요청 지연은 워밍업으로 막는다.

관련 노트: [[database-models|데이터베이스 모델: RDB, NoSQL, NewSQL]], [[transaction|트랜잭션과 회복]], [[sql-basics|SQL 기초]], [[db-fetching-patterns|빠르고 유지보수하기 좋은 DB 조회 패턴]], [[mongodb|MongoDB 시작하기와 CRUD]], [[database-scaling|데이터베이스 확장과 성능 최적화]], [[distributed-data-patterns|데이터 관리 패턴: CDC, 이벤트 소싱, CQRS, 최종 일관성]]
