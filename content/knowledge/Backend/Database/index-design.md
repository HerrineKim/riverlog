---
title: "인덱스 설계와 쿼리 튜닝"
concept: "Index Design"
summary: "인덱스는 정렬이다. 카디널리티와 복합 인덱스 컬럼 순서, 인덱스를 못 타게 만드는 조건, EXPLAIN 접근 유형 읽는 법, ORDER BY·GROUP BY·커버링 인덱스, 빠른 쿼리를 위한 체크리스트, MongoDB의 ESR 규칙까지 정리했다."
tags: ["database", "mysql", "sql", "performance", "nosql"]
source: other
date: "2026-10-21"
sources: ["https://jojoldu.tistory.com/243", "https://engineering.linecorp.com/ko/blog/mysql-workbench-visual-explain-index/", "https://medium.com/watcha/%EC%BF%BC%EB%A6%AC-%EC%B5%9C%EC%A0%81%ED%99%94-%EC%B2%AB%EA%B1%B8%EC%9D%8C-%EB%B3%B4%EB%8B%A4-%EB%B9%A0%EB%A5%B8-%EC%BF%BC%EB%A6%AC%EB%A5%BC-%EC%9C%84%ED%95%9C-7%EA%B0%80%EC%A7%80-%EC%B2%B4%ED%81%AC-%EB%A6%AC%EC%8A%A4%ED%8A%B8-bafec9d2c073", "https://blog.ull.im/engineering/2019/04/05/mongodb-indexing-strategy.html", "https://engineering.linecorp.com/ko/blog/mysql-research-performance-schema-instruments/", "https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-guideline/", "https://dev.mysql.com/doc/refman/8.4/en/descending-indexes.html"]
---

> 「[Mysql 인덱스 정리 및 팁](https://jojoldu.tistory.com/243)」, 「[MySQL Workbench의 VISUAL EXPLAIN으로 인덱스 동작 확인하기](https://engineering.linecorp.com/ko/blog/mysql-workbench-visual-explain-index/)」, 「[쿼리 최적화: 빠른 쿼리를 위한 7가지 체크리스트](https://medium.com/watcha/%EC%BF%BC%EB%A6%AC-%EC%B5%9C%EC%A0%81%ED%99%94-%EC%B2%AB%EA%B1%B8%EC%9D%8C-%EB%B3%B4%EB%8B%A4-%EB%B9%A0%EB%A5%B8-%EC%BF%BC%EB%A6%AC%EB%A5%BC-%EC%9C%84%ED%95%9C-7%EA%B0%80%EC%A7%80-%EC%B2%B4%ED%81%AC-%EB%A6%AC%EC%8A%A4%ED%8A%B8-bafec9d2c073)」, 「[MongoDB Index 설계 전략](https://blog.ull.im/engineering/2019/04/05/mongodb-indexing-strategy.html)」, 「[MySQL performance-schema-instruments 사용에 따른 성능 영향 실험](https://engineering.linecorp.com/ko/blog/mysql-research-performance-schema-instruments/)」을 바탕으로, MySQL·MongoDB 공식 문서로 확인해 재구성한 노트다.

## 인덱스는 정렬이다

인덱스는 지정한 컬럼 값으로 **미리 정렬해 둔 목차**다. 관계형 DB의 기본 인덱스는 B+트리이고, 리프에는 정렬된 키와 실제 행의 위치(InnoDB는 기본 키)가 들어 있다. 자료 구조가 왜 B+트리인지는 [[database-internals|DB 내부 구조: 쿼리 실행과 인덱스 자료 구조]]에 있다.

| 작업 | 인덱스의 영향 |
| --- | --- |
| SELECT | 정렬된 목차로 범위를 좁혀 빨라진다 |
| INSERT | 인덱스마다 정렬 위치를 찾아 넣어야 하므로 느려진다 |
| UPDATE·DELETE | 대상 행을 **찾는** 단계는 빨라지고, 인덱스를 **고치는** 단계는 느려진다. 인덱스 없는 컬럼으로 대량 삭제하면 매우 느리다 |

인덱스가 많을수록 쓰기·저장 공간 비용이 늘고, 옵티마이저가 엉뚱한 인덱스를 고를 여지도 커진다. 테이블당 인덱스는 실제 쿼리 패턴에 필요한 만큼만 둔다.

## 무엇을 인덱스로 잡나

### 카디널리티

**카디널리티(cardinality)** 는 컬럼 값이 얼마나 다양한가다. 성별처럼 값 종류가 적으면 낮고, 주민등록번호처럼 거의 겹치지 않으면 높다. 인덱스는 많이 걸러 낼수록 효과가 크므로, 컬럼 하나만 잡는다면 카디널리티가 높은 컬럼을 고른다. 조회 결과가 테이블 대부분이면 인덱스로 하나씩 찾아가는 것보다 풀 테이블 스캔이 빠를 수 있고, 옵티마이저도 그렇게 판단한다.

### 복합 인덱스의 컬럼 순서

복합 인덱스 `(a, b, c)`는 a로 정렬하고, a가 같은 것끼리 b로, 다시 c로 정렬한다. 뒤 컬럼은 앞 컬럼 값이 같은 범위 안에서만 정렬돼 있다.

| 조건 | 인덱스 사용 |
| --- | --- |
| `a`, `a + b`, `a + b + c` | 쓴다 (왼쪽부터 이어지는 접두사) |
| `a + c` | a까지만 쓰고 c는 걸러 내기만 한다 |
| `b`, `b + c` | 원칙적으로 못 쓴다. 선행 컬럼이 없으면 정렬이 의미 없다 |

- MySQL 8.0.13부터는 **스킵 스캔(skip scan)** 으로 선행 컬럼의 고유값이 아주 적을 때 `b` 조건만으로도 인덱스를 쓸 수 있다. 예외적인 최적화이므로 설계는 선행 컬럼 기준으로 한다.
- WHERE 절에 조건을 쓰는 순서는 상관없다. 옵티마이저가 인덱스 순서에 맞춰 다시 배치한다. 중요한 것은 인덱스 컬럼이 조건에 **들어 있는가**다.
- 등호 조건 컬럼을 앞에, 범위 조건 컬럼을 뒤에 둔다. 범위 조건 뒤의 컬럼은 정렬을 이용하지 못한다.
- 키가 길면 한 페이지에 담기는 키가 줄어 트리가 높아진다. 긴 문자열은 접두사 인덱스나 해시 컬럼을 검토한다.

## 인덱스를 못 타게 만드는 조건

| 쓰는 방식 | 결과 | 대신 |
| --- | --- | --- |
| `BETWEEN`, `<`, `>`, `LIKE 'abc%'` 같은 범위 조건 | 그 컬럼까지만 인덱스를 쓰고, 뒤 컬럼은 못 쓴다 | 범위 컬럼을 복합 인덱스 뒤쪽에 둔다 |
| `=`, `IN` | 뒤 컬럼까지 인덱스를 쓴다 | `IN` 안에 서브쿼리는 실행 계획을 확인한다 |
| `LIKE '%abc'` (앞쪽 와일드카드) | 정렬을 이용할 수 없어 전체를 훑는다 | 값 목록(`IN`), 접두사 검색, 전문 검색 인덱스 |
| 컬럼을 가공 `salary * 10 > 150000`, `FLOOR(v/2) = 2`, `DATE(created_at) = ...` | 가공한 값은 인덱스에 없어 못 쓴다 | 상수 쪽을 계산한다 `salary > 15000`, 범위로 바꾼다 `created_at >= ... AND < ...`. 꼭 필요하면 함수 기반 인덱스 |
| 타입이 다른 값과 비교 (문자열 컬럼 = 숫자) | 암묵적 형 변환으로 못 쓴다 | 컬럼 타입에 맞춰 바인딩한다. JOIN 컬럼도 타입·크기를 맞춘다 |
| `OR`로 다른 컬럼 묶기 | 풀 스캔이 되기 쉽다 | `UNION ALL`로 나누거나 각 컬럼 인덱스 병합을 확인한다 |
| `IS NULL` | 인덱스 범위 스캔이 가능하다 | - |

## ORDER BY·GROUP BY와 커버링 인덱스

- **ORDER BY**: 인덱스 순서대로 읽으면 정렬 작업(filesort)이 사라진다. `LIMIT`이 작을 때 특히 유리하다. 반대로 WHERE에 맞는 행이 드물면 인덱스를 오래 훑어야 하므로, LIMIT이 크면 WHERE용 인덱스가 나을 수 있다.
- **GROUP BY**: 인덱스가 이미 정렬된 상태를 주므로 임시 테이블과 filesort가 사라진다.
- WHERE 조건과 ORDER BY를 함께 만족하도록 복합 인덱스 순서를 짜면 테이블 접근과 정렬을 모두 줄인다.
- **커버링 인덱스(covering index)**: 쿼리에 필요한 컬럼이 모두 인덱스에 있으면 테이블 행을 읽지 않는다. 오프셋 페이지네이션을 빠르게 하는 데도 쓴다([[api-pagination|API 페이지네이션]]).
- **정렬 방향**: MySQL 8.0부터 내림차순 인덱스(`INDEX (a ASC, b DESC)`)를 실제로 저장한다. 방향이 섞인 정렬(`ORDER BY a, b DESC`)도 정렬 없이 처리하고, 역방향 스캔보다 정방향 스캔이 빠르므로 자주 쓰는 정렬 방향으로 인덱스를 만든다.

## EXPLAIN으로 확인하기

설계가 맞는지는 실행 계획으로 확인한다. MySQL `EXPLAIN`의 `type`은 테이블에 접근하는 방식이고, 위에서 아래로 갈수록 비싸다.

| type | 뜻 |
| --- | --- |
| `const` | 기본 키·유니크 키로 한 행 |
| `eq_ref` | JOIN에서 유니크 키로 한 행씩 |
| `ref` | 유니크가 아닌 인덱스로 같은 값 조회 |
| `range` | 인덱스 범위 스캔 |
| `index` | 인덱스 전체를 훑는다 |
| `ALL` | 풀 테이블 스캔 |

- `index`와 `ALL`이 튜닝 대상이다. `Extra`의 `Using filesort`, `Using temporary`는 정렬·임시 테이블이 생겼다는 뜻이고, `Using index`는 커버링 인덱스다.
- `EXPLAIN FORMAT=JSON`의 `used_key_parts`로 복합 인덱스 중 실제로 쓴 컬럼을 본다. 일부만 쓰인다면 인덱스를 나누는 편이 낫다.
- `EXPLAIN ANALYZE`(MySQL 8.0.18+)는 실제로 실행해 예측 행 수와 실제 행 수를 함께 보여 준다. 예측이 크게 틀리면 `ANALYZE TABLE`로 통계를 갱신한다.
- 데이터가 특정 값에 몰려 있으면 옵티마이저가 인덱스를 버리고 풀 스캔을 고르기도 한다. 이론보다 실제 데이터 분포로 확인한다.
- JOIN은 대개 **중첩 루프 조인**이다. 바깥(드라이빙) 테이블의 행마다 안쪽 테이블을 찾으므로 **안쪽 테이블의 조인 컬럼에 인덱스**가 있어야 한다.
- PostgreSQL은 `EXPLAIN (ANALYZE, BUFFERS)`로 같은 확인을 한다.

## 빠른 쿼리 체크리스트

1. **필요한 컬럼만 가져온다.** `SELECT *`는 읽고 보내는 양을 늘리고 커버링 인덱스를 막는다.
2. **조건 컬럼을 가공하지 않는다.** 계산은 상수 쪽으로 옮긴다.
3. **앞쪽 와일드카드 `LIKE '%…'`를 피한다.**
4. **중복 제거(`DISTINCT`, `UNION`)를 줄인다.** 존재 여부만 필요하면 `EXISTS`, 중복이 없음을 안다면 `UNION ALL`.
5. **집계 전에 거른다.** 같은 조건이면 `HAVING`보다 `WHERE`로 먼저 줄인다. WHERE가 GROUP BY보다 먼저 실행된다.
6. **조인 순서는 옵티마이저에 맡기되, 테이블이 아주 많으면 확인한다.** 테이블 수가 늘면 순서 탐색 비용 때문에 옵티마이저가 차선의 순서를 고를 수 있다.
7. **자주 쓰는 집계는 미리 만들어 둔다.** 요약 테이블·구체화된 뷰는 실시간성을 포기하는 대신 조회를 가볍게 한다. 주로 분석계에서 쓴다([[database-scaling|데이터베이스 확장과 성능 최적화]]).

## 관측 도구의 비용

MySQL `performance_schema`는 서버 곳곳의 계측 지점(instrument)에서 호출 횟수·소요 시간을 모아 소비자(consumer) 테이블에 쌓는다. 자주 쓰는 항목은 기본으로 켜져 있다.

- `setup_instruments`, `setup_consumers` 테이블의 `ENABLED`·`TIMED`로 온라인에서 켜고 끈다.
- **계측 지점을 전부 켜면 처리량이 눈에 띄게 떨어진다.** 타이밍 수집(`TIMED`)까지 켜면 더 떨어진다. 필요한 항목만 골라 켠다.
- InnoDB 내부 지표(`information_schema.innodb_metrics`)는 상대적으로 부담이 작다.
- 느린 쿼리를 찾는 첫 단계는 보통 슬로 쿼리 로그와 `sys` 스키마의 요약 뷰다.

## MongoDB 인덱스

문서 DB도 원리는 같다. 인덱스는 정렬된 B-트리이고, 필드 순서와 접두사(prefix) 규칙이 그대로 적용된다.

- 복합 인덱스 `{ userid: 1, score: -1 }`은 `userid`, `userid + score` 조회에 쓰이고 `score` 단독 조회에는 못 쓴다.
- 정렬도 인덱스 접두사를 따라야 하고, 필드별 방향이 인덱스와 같거나 **모두 반대**여야 한다(`{a: 1, b: -1}` 인덱스는 `sort({a: 1, b: -1})`, `sort({a: -1, b: 1})`에 쓰인다). 단일 필드 인덱스는 방향과 상관없다.
- **ESR 규칙**: 복합 인덱스 필드를 **같음(Equality) → 정렬(Sort) → 범위(Range)** 순서로 둔다. 범위 필드가 정렬 필드보다 앞에 오면 메모리 정렬이 생긴다.
- 서로 다른 인덱스를 합쳐 쓰는 인덱스 교차는 복합 인덱스보다 느리다. 함께 조회하는 필드는 복합 인덱스로 만든다.
- 확인 도구: `explain("executionStats")`로 스캔한 문서 수와 반환 문서 수를 비교하고, `$indexStats`로 쓰이지 않는 인덱스를 찾고, `hint()`로 특정 인덱스를 강제해 비교한다.
- 인덱스는 메모리(working set)에 올라와 있어야 빠르다. 쓰기가 많은 컬렉션은 인덱스를 적게 유지한다.

## 정리

- 인덱스는 정렬이다. 복합 인덱스는 왼쪽부터 이어지는 접두사만 쓰이고, 범위 조건 뒤는 끊긴다.
- 카디널리티가 높은 컬럼, 등호 조건 컬럼을 앞에 둔다. MongoDB는 ESR 순서다.
- 컬럼 가공, 앞쪽 와일드카드, 타입 불일치는 인덱스를 무력화한다.
- 설계는 EXPLAIN과 실제 데이터 분포로 검증한다. 이론적으로 맞는 인덱스도 데이터에 따라 버려진다.

관련 노트: [[database-internals|DB 내부 구조: 쿼리 실행과 인덱스 자료 구조]], [[database-scaling|데이터베이스 확장과 성능 최적화]], [[sql-basics|SQL 기초]], [[mongodb|MongoDB 시작하기와 CRUD]], [[api-pagination|API 페이지네이션]], [[db-fetching-patterns|빠르고 유지보수하기 좋은 DB 조회 패턴]]
