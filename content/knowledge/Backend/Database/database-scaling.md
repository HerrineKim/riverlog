---
title: "데이터베이스 확장과 성능 최적화"
concept: "Database Scaling"
summary: "DB가 느려지거나 한계에 닿을 때 싼 것부터 쓰는 수단을 순서대로 정리했다. 인덱스·쿼리 튜닝·커넥션 풀·캐시·구체화된 뷰·반정규화·수직 확장·읽기 복제본·파티셔닝·샤딩의 효과와 대가, 그리고 읽기 복제본 패턴의 복제 지연과 라우팅(애플리케이션 vs 미들웨어)을 다룬다."
tags: ["database", "backend", "performance", "scalability", "architecture"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/7-must-know-strategies-to-scale-your-database", "https://bytebytego.com/guides/a-cheatsheet-on-database-performance", "https://bytebytego.com/guides/read-replica-pattern", "https://bytebytego.com/guides/how-to-implement-read-replica-pattern", "https://bytebytego.com/guides/database-middleware", "https://www.postgresql.org/docs/current/rules-materializedviews.html"]
---

> ByteByteGo의 System Design 101 가이드 「[7 Must-Know Strategies to Scale Your Database](https://bytebytego.com/guides/7-must-know-strategies-to-scale-your-database)」, 「[A Cheatsheet on Database Performance](https://bytebytego.com/guides/a-cheatsheet-on-database-performance)」, 「[Read Replica Pattern](https://bytebytego.com/guides/read-replica-pattern)」, 「[How to Implement Read Replica Pattern](https://bytebytego.com/guides/how-to-implement-read-replica-pattern)」, 「[Database Middleware](https://bytebytego.com/guides/database-middleware)」을 바탕으로 재구성한 노트다.

## 순서가 중요하다

DB 성능 문제의 해법은 많지만 **비용과 복잡도가 크게 다르다.** 위에서부터 써 보고, 안 풀릴 때 아래로 내려간다.

| 단계 | 수단 | 효과 | 대가 |
| --- | --- | --- | --- |
| 0 | **모니터링** | 느린 쿼리, 응답 시간, CPU, 디스크 I/O, 커넥션 수를 본다. 무엇이 병목인지 모르고 고치지 않는다 | 거의 없다 |
| 1 | **인덱스** | 실제 쿼리 패턴(WHERE, JOIN, ORDER BY)에 맞는 인덱스로 읽기를 빠르게 한다 | 인덱스가 많으면 쓰기가 느려지고 공간을 먹는다. 안 쓰는 인덱스는 정기적으로 지운다 |
| 2 | **쿼리 튜닝** | `EXPLAIN`으로 실행 계획을 확인하고, `SELECT *`를 피하고, 인덱스를 탈 수 있는 WHERE 조건을 쓴다. N+1 쿼리를 없앤다 | 코드 수정 |
| 3 | **커넥션 풀** | 연결 수립 비용을 없애고, DB가 감당할 수 있는 동시 연결 수로 제한한다 | 풀 크기를 잘못 잡으면 대기나 DB 과부하 |
| 4 | **캐시** | 자주 읽는 결과를 Redis 같은 빠른 저장소에 둬 DB 부하를 줄인다 | 무효화와 정합성 관리. [[caching-strategies\|캐시 전략]] |
| 5 | **구체화된 뷰** | 무거운 집계·조인 결과를 미리 계산해 저장한다 | 갱신 주기만큼 데이터가 낡는다 |
| 6 | **반정규화** | 자주 함께 읽는 데이터를 한 테이블에 둬 조인을 줄인다 | 중복 데이터를 함께 갱신해야 한다. [[normalization\|정규화와 반정규화]] |
| 7 | **수직 확장** | CPU·RAM·빠른 SSD를 늘린다. 작업 데이터가 메모리에 다 들어가면 효과가 크다 | 비용이 가파르게 오르고 상한이 있다. 단일 장애점은 그대로다 |
| 8 | **읽기 복제본** | 쓰기는 원본, 읽기는 복제본으로 나눠 읽기를 늘린다. 장애 대비(고가용성)도 된다 | 복제 지연. 쓰기는 늘지 않는다 |
| 9 | **파티셔닝** | 한 서버 안에서 큰 테이블을 날짜·키 범위로 나눠, 쿼리가 필요한 조각만 보게 하고 오래된 조각은 통째로 지운다 | 파티션 키를 조건에 넣지 않는 쿼리는 이득이 없다 |
| 10 | **샤딩** | 여러 서버에 행을 나눠 **쓰기와 용량**까지 늘린다 | 샤드 간 조인·트랜잭션이 어렵고 운영이 복잡하다. [[database-sharding\|데이터베이스 샤딩]] |

복제와 샤딩을 고르는 기준은 간단하다. **읽기가 많으면 복제, 쓰기나 데이터 양이 한 서버를 넘으면 샤딩**이다.

### 구체화된 뷰

일반 뷰는 조회할 때마다 정의된 쿼리를 다시 실행한다. **구체화된 뷰(materialized view)** 는 결과를 실제로 디스크에 저장해 두고, 정해진 때에 다시 계산한다. 대시보드, 리포트처럼 무거운 집계를 자주 읽는 곳에 맞는다.

```sql
-- PostgreSQL
CREATE MATERIALIZED VIEW daily_sales AS
SELECT order_date, SUM(amount) AS total
FROM orders
GROUP BY order_date;

CREATE UNIQUE INDEX ON daily_sales (order_date);
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales;  -- 읽기를 막지 않고 갱신 (유니크 인덱스 필요)
```

MySQL에는 구체화된 뷰가 없어 요약 테이블을 만들고 배치나 이벤트로 갱신한다. 과거 MySQL이 제공하던 DB 수준 쿼리 캐시는 쓰기가 많으면 오히려 경합을 일으켜 8.0에서 제거되었다. 그래서 캐시는 애플리케이션 계층(Redis 등)에 둔다.

## 읽기 복제본 패턴

**읽기 복제본(read replica)** 패턴은 삽입·수정·삭제를 원본(primary) DB로 보내고, 조회는 복제본으로 보낸다. 대부분의 서비스는 읽기가 쓰기보다 훨씬 많아 효과가 크다.

```text
주문하기 (쓰기) ──▶ 주문 서비스 ──▶ Primary DB
                                     │ 비동기 복제
                          ┌──────────┴──────────┐
                          ▼                     ▼
                      Replica 1             Replica 2
주문 상세 보기 (읽기) ──────▲          주문 내역 보기 (읽기) ──▲
```

### 문제: 복제 지연

복제는 보통 비동기라서, 네트워크 지연이나 원본 과부하가 있으면 복제본이 몇 초에서 몇 분 늦을 수 있다. 주문 직후 상태를 조회했는데 복제본에 아직 없으면 **방금 한 주문이 안 보인다.** 내가 쓴 것은 바로 읽을 수 있어야 한다는 **쓴 뒤 읽기 일관성(read-after-write consistency)** 이 깨진 것이다.

| 대책 | 방법 |
| --- | --- |
| 지연에 민감한 읽기는 원본으로 | 결제 결과, 잔액처럼 최신 값이 꼭 필요한 조회 |
| 쓰기 직후의 읽기는 원본으로 | 사용자가 쓴 뒤 몇 초 동안은 그 사용자의 읽기를 원본으로 보낸다(세션·쿠키에 마지막 쓰기 시각 기록) |
| 복제본이 따라왔는지 확인 | 원본의 로그 위치(PostgreSQL LSN, MySQL GTID)를 기억해 두고, 복제본이 그 위치를 지났을 때만 읽는다. 아니면 원본에서 읽거나 실패시킨다 |
| 동기·반동기 복제 | 커밋 때 복제본 하나 이상의 확인을 기다린다. 지연은 줄지만 쓰기가 느려진다 |

### 누가 읽기·쓰기를 나누나

애플리케이션이 쓰기용·읽기용 연결을 따로 들고 쿼리마다 고르거나(ORM·프레임워크의 읽기/쓰기 분리 기능), DB 프로토콜을 그대로 말하는 미들웨어(ProxySQL, Pgpool-II, ShardingSphere-Proxy)에 맡긴다. 앞쪽은 한 홉이 적고 쿼리별로 세밀하게 고를 수 있고, 뒤쪽은 앱 코드가 DB 구성을 몰라도 되는 대신 미들웨어의 고가용성과 지연을 감당해야 한다. 클라우드 관리형 DB는 읽기 전용 엔드포인트를 따로 준다(Amazon Aurora의 reader endpoint 등).

| 비교 | 앱에서 라우팅 | DB 미들웨어 |
| --- | --- | --- |
| 앱 코드 | DB 구성(어디가 원본인지)을 알아야 한다 | DB 구성을 몰라도 된다. 연결 하나만 안다 |
| 라우팅 규칙 | 코드나 ORM 설정으로 구현 | 사용자·스키마·SQL 문장별 규칙을 설정으로 둔다 |
| 호환성 | 언어·프레임워크마다 따로 구현 | DB 표준 프로토콜을 쓰므로 호환 클라이언트면 무엇이든 붙고, DB 이전이 쉬워진다 |
| 비용 | 추가 홉이 없다 | 모든 쿼리가 지나는 계층이라 고가용성 구성과 높은 성능이 필요하고, 한 홉만큼 지연이 붙는다 |

어느 쪽이든 복제 지연은 같다. 쓰기 직후의 읽기는 원본으로 보낸다.

## 정리

- 모니터링으로 병목을 찾고, 인덱스·쿼리 튜닝·커넥션 풀처럼 싼 수단부터 쓴다.
- 캐시·구체화된 뷰·반정규화는 「미리 계산해 둔 결과」로 읽기를 줄이고, 대신 낡은 데이터를 관리해야 한다.
- 읽기가 많으면 복제본을, 쓰기와 데이터 양이 한 서버를 넘으면 샤딩을 쓴다.
- 읽기 복제본은 복제 지연 때문에 쓴 뒤 읽기 일관성이 깨질 수 있다. 중요한 읽기와 쓰기 직후 읽기는 원본으로 보낸다.

관련 노트: [[index-design|인덱스 설계와 쿼리 튜닝]], [[connection-pool|DB 커넥션 풀]], [[database-sharding|데이터베이스 샤딩]], [[database-internals|DB 내부 구조: 쿼리 실행과 인덱스 자료 구조]], [[db-fetching-patterns|빠르고 유지보수하기 좋은 DB 조회 패턴]], [[web-scalability-components|웹 확장성의 구성 요소: 한 장으로 보는 웹 아키텍처]], [[normalization|정규화와 반정규화]], [[distributed-data-patterns|데이터 관리 패턴: CDC, 이벤트 소싱, CQRS, 최종 일관성]]
