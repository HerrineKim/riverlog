---
title: "Oracle 스키마 객체: 파티션, 뷰, 시퀀스, 동의어"
concept: "Schema Objects"
summary: "테이블과 인덱스 말고도 큰 테이블을 나눠 담는 파티션, 저장된 질의인 뷰와 결과까지 저장하는 실체화된 뷰, 겹치지 않는 번호를 내주는 시퀀스, 객체의 별칭인 동의어가 무엇을 해결하고 어디서 함정이 생기는지 정리했다."
tags: ["database", "sql", "performance", "backend", "oracle"]
source: other
date: "2026-10-31"
sources: ["고려사이버대학교 데이터베이스 설계구축 강의(나홍석 교수, 2023-2학기)"]
---

> 고려사이버대학교 「데이터베이스 설계구축」(2023-2학기) 강의 내용을 바탕으로 정리했다.

Oracle은 한 사용자가 만든 객체를 묶어 스키마라 부르고, 그 안의 것들을 **스키마 객체**라고 한다. 예제는 Oracle 문법이지만 개념은 다른 RDBMS에도 거의 그대로 있다.

| 객체 | 한 줄 설명 | 자세히 |
| --- | --- | --- |
| 테이블 | 행 단위로 데이터를 저장 | [[sql-basics\|SQL 기초]] |
| 인덱스 | 컬럼 값을 정렬해 두고 행 주소를 가리킨다 | [[index-design\|인덱스 설계와 쿼리 튜닝]] |
| 파티션 | 큰 테이블·인덱스를 나눈 조각 | 이 노트 |
| 뷰 / 실체화된 뷰 | 저장된 질의 / 결과까지 저장된 질의 | 이 노트 |
| 시퀀스 | 겹치지 않는 번호 생성기 | 이 노트 |
| 동의어 | 객체의 별칭 | 이 노트 |
| 프로시저·함수·트리거·패키지 | DB에 저장된 PL/SQL 프로그램 | [[oracle-pl-sql\|PL/SQL]] |

## 파티션

수억 행짜리 주문 테이블에서 "지난달 주문"만 찾는다면, 인덱스를 쓰더라도 거대한 인덱스 하나를 탄다. **파티셔닝**은 테이블을 월별 같은 작은 조각으로 나눠 저장하는 방법이다. 애플리케이션 입장에서는 여전히 테이블 하나라 SQL을 고치지 않는다.

여러 DB 서버로 나누는 [[database-sharding|샤딩]]과 달리, 파티셔닝은 **한 DB 안에서** 나눈다. 확장 수단 전체에서의 위치는 [[database-scaling|데이터베이스 확장과 성능 최적화]]에 있다.

### 얻는 것

| 효과 | 이유 |
| --- | --- |
| 조회가 빨라진다 | 옵티마이저가 조건을 보고 볼 필요 없는 파티션을 건너뛴다(**파티션 프루닝**) |
| 오래된 데이터 삭제가 순식간 | 수천만 행 `DELETE` 대신 `DROP PARTITION`/`TRUNCATE PARTITION` 한 번. 언두·리두가 거의 안 생긴다 |
| 관리 단위가 작아진다 | 파티션별로 백업·재구성·압축하고, 오래된 파티션은 싼 디스크의 테이블스페이스로 옮긴다 |
| 장애 범위가 줄어든다 | 한 파티션의 디스크가 문제여도 나머지는 쓸 수 있다 |

파티션들은 컬럼·타입·제약을 공유하고, 저장 위치(테이블스페이스) 같은 물리 속성만 따로 가질 수 있다. 파티션 하나하나가 독립된 세그먼트다([[oracle-architecture#논리 저장 구조|Oracle 저장 구조]]).

### 나누는 방식

행이 어느 파티션에 갈지는 **파티션 키** 컬럼으로 정한다.

| 방식 | 기준 | 맞는 데이터 |
| --- | --- | --- |
| 범위(range) | 키 값의 구간 | 날짜. 가장 흔하다 |
| 리스트(list) | 키 값의 목록 | 지역, 국가, 상태 코드처럼 값이 정해진 것 |
| 해시(hash) | 키의 해시 값 | 뚜렷한 구간이 없고 고르게 퍼뜨리고 싶을 때 |
| 복합(composite) | 위 둘을 겹쳐서 | 월별 범위 안을 다시 해시로 |

```sql
CREATE TABLE orders (
  id          NUMBER,
  ordered_at  DATE,
  region      VARCHAR2(10),
  amount      NUMBER
)
PARTITION BY RANGE (ordered_at)
INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))          -- 새 달 데이터가 오면 파티션 자동 생성
( PARTITION p_before_2026 VALUES LESS THAN (DATE '2026-01-01') );

-- 프루닝: 2026년 9월 파티션만 읽는다
SELECT SUM(amount) FROM orders
WHERE ordered_at >= DATE '2026-09-01' AND ordered_at < DATE '2026-10-01';
```

### 주의할 것

- **조건에 파티션 키가 없으면** 모든 파티션을 뒤진다. 날짜로 나눈 테이블을 고객 ID로만 찾으면 오히려 느려질 수 있다. 가장 자주 쓰는 조회 조건으로 키를 고른다.
- 파티션 키 컬럼에 함수를 씌우면(`TRUNC(ordered_at) = ...`) 프루닝이 안 될 수 있다. 인덱스가 함수 때문에 안 타는 것과 같은 이유다.
- 인덱스도 나눌지 정해야 한다. **로컬 인덱스**는 파티션마다 하나씩이라 파티션을 지워도 다른 인덱스가 멀쩡하다. **글로벌 인덱스**는 테이블 전체에 하나라 파티션 키가 없는 조회에 유리하지만, 파티션을 지우면 다시 만들거나 갱신해야 한다(`UPDATE GLOBAL INDEXES`).
- 파티션이 너무 잘면(일 단위로 10년치) 파티션 수가 많아져 계획 수립과 관리가 오히려 무거워진다.

## 뷰

**뷰(view)** 는 이름을 붙여 저장한 SELECT 문이다. 데이터는 없고, 뷰를 조회할 때마다 정의된 질의가 실행된다. 기본 문법과 쓰임은 [[sql-basics#뷰|SQL 기초]]에 있다.

쓰는 이유는 세 가지다.

1. **복잡한 질의를 숨긴다.** 조인 세 개짜리 질의를 뷰로 만들면 쓰는 쪽은 테이블 하나처럼 조회한다.
2. **보여 줄 것만 보여 준다.** 급여 컬럼을 뺀 뷰에만 권한을 주면 원본 테이블을 감출 수 있다.
3. **테이블 구조를 바꿔도 앱이 그대로다.** 테이블을 둘로 쪼개도 예전 모양의 뷰를 남기면 된다(논리적 데이터 독립성, [[sql-and-relational-algebra#3단계 스키마와 데이터 독립성|관계대수와 DB 설계]]).

```sql
CREATE OR REPLACE VIEW v_seoul_orders AS
SELECT o.id, o.ordered_at, o.amount, c.name AS customer_name
FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE o.region = 'SEOUL'
WITH READ ONLY;
```

| 모양 | 뜻 |
| --- | --- |
| 프로젝션 뷰 | 한 테이블에서 일부 컬럼만 |
| 조인 뷰 | 여러 테이블을 조인한 결과 |
| 인라인 뷰 | `FROM (SELECT ...)`처럼 SQL 안에 쓰는 이름 없는 뷰. 그 문장이 도는 동안만 존재한다([[sql-subquery\|서브쿼리]]) |

### 뷰로 데이터를 바꿀 때

뷰에 INSERT·UPDATE·DELETE를 하면 원본 테이블이 바뀐다. 다만 뷰의 한 행이 원본의 어느 한 행에 딱 대응해야 한다. 다음이 들어간 뷰는 수정할 수 없다.

- 집계 함수, `GROUP BY`, `DISTINCT`: 결과 한 행이 원본 여러 행에서 나온다
- 계산식 컬럼: `amount * 1.1`에 값을 넣으면 원본에 무엇을 넣을지 모른다
- 원본의 `NOT NULL`(기본값 없음) 컬럼을 뷰가 빠뜨렸다면 INSERT가 실패한다
- 조인 뷰는 한 번에 한 테이블만, 그것도 키가 보존되는 테이블만 고칠 수 있다

**`WITH CHECK OPTION`** 은 뷰의 `WHERE` 조건을 벗어나는 변경을 막는다. `region = 'SEOUL'` 뷰로 `region`을 `'BUSAN'`으로 바꾸면, 바꾼 순간 그 행이 뷰에서 사라진다. 이 옵션이 있으면 그런 UPDATE가 에러가 난다. 아예 수정을 막으려면 `WITH READ ONLY`.

### 실체화된 뷰

일반 뷰는 조회할 때마다 질의를 다시 돌린다. 무거운 집계를 매번 하기 싫으면 결과를 테이블처럼 저장해 두는 **실체화된 뷰(materialized view)** 를 쓴다. PostgreSQL도 같은 이름, SQL Server는 인덱싱된 뷰, Db2는 구체화 쿼리 테이블이라고 부른다.

```sql
CREATE MATERIALIZED VIEW mv_monthly_sales
REFRESH FAST ON DEMAND           -- 바뀐 부분만, 요청할 때 갱신
ENABLE QUERY REWRITE             -- 원본 집계 질의를 이 뷰로 자동 대체
AS
SELECT TRUNC(ordered_at, 'MM') AS month, region, SUM(amount) AS total
FROM orders
GROUP BY TRUNC(ordered_at, 'MM'), region;
```

| 갱신 방식 | 뜻 | 대가 |
| --- | --- | --- |
| `COMPLETE` | 처음부터 다시 계산 | 크면 오래 걸린다 |
| `FAST` | 원본의 변경분만 반영. 원본에 실체화된 뷰 로그가 필요하다 | 원본 쓰기마다 로그를 남긴다 |
| `ON COMMIT` | 원본이 커밋될 때마다 | 원본 트랜잭션이 느려진다 |
| `ON DEMAND` | 요청하거나 일정에 맞춰 | 그 사이에는 오래된 값을 보여 준다 |

결국 "얼마나 오래된 값까지 괜찮은가"를 정하는 일이다. 대시보드·리포트처럼 몇 분 늦어도 되는 곳에 맞고, 원거리 DB 테이블의 가까운 복사본으로도 쓴다.

## 시퀀스

주문 번호처럼 겹치지 않는 번호가 필요할 때 이렇게 하면 안 된다.

```sql
SELECT MAX(id) + 1 FROM orders;   -- 두 세션이 동시에 같은 값을 얻는다
```

두 트랜잭션이 동시에 `MAX`를 읽으면 같은 번호를 받아 한쪽이 기본 키 충돌로 실패한다. 테이블을 잠그면 막을 수 있지만 그러면 주문이 한 줄로 서야 한다. **시퀀스**는 테이블과 독립된 번호 생성기라 잠금 없이 동시에 번호를 내준다.

```sql
CREATE SEQUENCE orders_seq
  START WITH 1
  INCREMENT BY 1
  CACHE 100          -- 100개를 메모리에 미리 받아 둔다
  NOCYCLE;           -- 최댓값에 닿아도 처음으로 돌아가지 않는다

INSERT INTO orders (id, ...) VALUES (orders_seq.NEXTVAL, ...);
SELECT orders_seq.CURRVAL FROM dual;   -- 이 세션이 마지막으로 받은 값
```

| 옵션 | 뜻 |
| --- | --- |
| `INCREMENT BY` | 증가 폭. 음수면 감소 |
| `MAXVALUE`/`MINVALUE` | 범위 |
| `CYCLE`/`NOCYCLE` | 끝에 닿으면 처음으로 돌아갈지. 기본 키에 `CYCLE`을 쓰면 언젠가 충돌한다 |
| `CACHE n`/`NOCACHE` | 번호를 미리 n개 메모리에 받아 둘지. 기본 20 |
| `ORDER` | RAC에서 인스턴스 사이에도 요청 순서대로 번호를 줄지 |

**시퀀스 번호에는 구멍이 생긴다.** 이건 버그가 아니라 설계다.

- 트랜잭션이 롤백돼도 이미 받은 번호는 돌려주지 않는다. 돌려주려면 다른 세션들을 기다리게 해야 하기 때문이다.
- 캐시해 둔 번호는 인스턴스가 재시작되면 버려진다.
- RAC에서는 인스턴스마다 캐시를 따로 받으므로 번호가 시간 순서와 어긋날 수 있다.

그래서 "빠짐없는 연속 번호"가 법적으로 필요한 곳(세금계산서 번호 등)에는 시퀀스를 그대로 쓰지 않고 별도 채번 테이블과 잠금으로 처리한다. 12c부터는 컬럼에 `GENERATED AS IDENTITY`를 걸면 내부적으로 시퀀스를 만들어 준다(MySQL의 `AUTO_INCREMENT`와 같은 자리). 여러 서버에서 번호를 만들어야 하면 [[distributed-unique-id|분산 고유 ID]]의 방식들을 본다.

## 동의어

**동의어(synonym)** 는 객체의 별칭이다.

```sql
CREATE PUBLIC SYNONYM employees FOR hr.employees;
SELECT * FROM employees;     -- 누구든 hr. 없이 조회 (권한은 따로 필요)
```

- 스키마 이름을 숨겨 SQL을 짧게 한다.
- 원본 객체를 다른 스키마나 원격 DB(DB 링크)로 옮겨도 동의어만 고치면 SQL은 그대로다.
- 동의어는 권한을 주지 않는다. 원본에 대한 `GRANT`가 따로 있어야 한다.

## 정리

- 파티셔닝은 한 DB 안에서 테이블을 나눠, 조회는 프루닝으로 줄이고 삭제는 `DROP PARTITION`으로 끝낸다. 키는 가장 흔한 조회 조건으로 고른다.
- 뷰는 저장된 질의다. 집계·계산·다중 테이블 뷰는 수정이 제한되고, `WITH CHECK OPTION`이 범위를 벗어난 변경을 막는다.
- 실체화된 뷰는 결과를 저장한다. 갱신 방식은 신선도와 쓰기 비용 사이의 선택이다.
- 시퀀스는 `MAX+1`의 동시성 문제를 잠금 없이 푼다. 대신 구멍이 생긴다.

관련 노트: [[oracle-architecture|Oracle 데이터베이스 구조]], [[oracle-pl-sql|PL/SQL]], [[database-scaling|데이터베이스 확장과 성능 최적화]], [[database-sharding|데이터베이스 샤딩]], [[distributed-unique-id|분산 고유 ID]]
