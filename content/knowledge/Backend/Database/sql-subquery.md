---
title: "서브쿼리와 관계해석: IN, EXISTS, 상관 서브쿼리"
concept: "Subquery"
summary: "SQL 안의 SQL인 서브쿼리를 위치(WHERE·FROM·SELECT)와 반환 모양(단일 값·여러 행)으로 나누고, 상관 서브쿼리와 EXISTS, NOT IN이 NULL 때문에 빈 결과를 내는 함정, 조인으로 바꿔 쓰는 법을 정리했다. EXISTS의 뿌리인 관계해석도 함께 다룬다."
tags: ["sql", "database", "backend", "performance", "relational-algebra"]
source: other
date: "2026-10-31"
sources: ["고려사이버대학교 데이터베이스시스템 강의(나홍석 교수, 2024-1학기)"]
---

> 고려사이버대학교 「데이터베이스시스템」(2024-1학기) 강의 내용을 바탕으로 정리했다.

**서브쿼리(subquery)** 는 SQL 문 안에 괄호로 넣은 또 하나의 SELECT다. 관계형 연산은 결과가 다시 릴레이션(테이블)이므로, 한 질의의 결과를 다른 질의의 재료로 그대로 쓸 수 있다. 기본 SELECT·조인 문법은 [[sql-basics|SQL 기초]]에 있다.

## 위치에 따른 세 가지

| 위치 | 이름 | 돌려주는 것 | 예 |
| --- | --- | --- | --- |
| `WHERE`·`HAVING` | 중첩 서브쿼리 | 비교할 값이나 값 목록 | 평균보다 많이 받는 직원 |
| `FROM` | 인라인 뷰(파생 테이블) | 임시 테이블 | 부서별 집계를 먼저 내고 그걸 다시 조인 |
| `SELECT` 목록 | 스칼라 서브쿼리 | 행마다 값 하나 | 직원마다 부양가족 수 |

```sql
-- WHERE: 박현식과 같은 부서 사람
SELECT name, dept_id
FROM employee
WHERE dept_id = (SELECT dept_id FROM employee WHERE name = '박현식');

-- FROM: 부서 평균을 먼저 구한 뒤 조인
SELECT e.name, e.salary, d.avg_salary
FROM employee e
JOIN (SELECT dept_id, AVG(salary) AS avg_salary
      FROM employee GROUP BY dept_id) d
  ON d.dept_id = e.dept_id
WHERE e.salary > d.avg_salary;

-- SELECT: 직원마다 부양가족 수
SELECT e.name,
       (SELECT COUNT(*) FROM dependent d WHERE d.employee_id = e.id) AS dependents
FROM employee e;
```

## 반환 모양과 연산자

서브쿼리가 몇 행을 돌려주느냐에 따라 앞에 올 수 있는 연산자가 다르다.

| 반환 | 연산자 | 주의 |
| --- | --- | --- |
| 단일 행·단일 값 | `=`, `<`, `>` 등 | 두 행 이상이 나오면 실행 중에 에러가 난다. "박현식"이 동명이인이면 터진다 |
| 여러 행 | `IN`, `NOT IN` | 목록 중 하나라도 같으면 / 하나도 같지 않으면 |
| 여러 행 | `> ANY`, `> ALL` | 하나라도보다 크면(= 최솟값보다 크면) / 전부보다 크면(= 최댓값보다 크면) |
| 존재 여부 | `EXISTS`, `NOT EXISTS` | 한 행이라도 있으면 참. 무엇을 SELECT하는지는 상관없다 |

`> ALL (서브쿼리)`는 `> (SELECT MAX(...))`와 같다. 다만 서브쿼리가 0행이면 `ALL`은 참, `MAX` 비교는 NULL이라 결과가 달라진다. 의도가 분명한 쪽을 쓴다.

## 상관 서브쿼리

앞의 예 대부분은 서브쿼리가 바깥 질의와 상관없이 혼자 돌 수 있었다. **상관 서브쿼리(correlated subquery)** 는 바깥 행의 값을 참조해서, 개념적으로 바깥 행마다 한 번씩 다시 평가된다.

```sql
-- 자기 부서 평균보다 많이 받는 직원
SELECT e.name, e.salary
FROM employee e
WHERE e.salary > (SELECT AVG(x.salary)
                  FROM employee x
                  WHERE x.dept_id = e.dept_id);   -- 바깥의 e를 참조
```

위의 스칼라 서브쿼리(부양가족 수)도 상관 서브쿼리다. 직원이 100만 명이면 서브쿼리를 100만 번 도는 셈이라, 참조 컬럼(`d.employee_id`)에 인덱스가 없으면 아주 느리다. 옵티마이저가 조인으로 바꿔 주기도 하지만 늘 그렇지는 않으니 실행 계획을 본다([[index-design|인덱스 설계와 쿼리 튜닝]]).

## EXISTS와 IN

"20번 프로젝트에 참여하는 직원"은 두 가지로 쓸 수 있다.

```sql
SELECT name FROM employee
WHERE id IN (SELECT employee_id FROM works_on WHERE project_id = 20);

SELECT name FROM employee e
WHERE EXISTS (SELECT 1 FROM works_on w
              WHERE w.employee_id = e.id AND w.project_id = 20);
```

결과는 같다. `EXISTS`는 조건에 맞는 행을 **하나 찾는 순간 멈출 수 있어서**, 서브쿼리 쪽 결과가 클 때 유리했다. 지금의 주요 DBMS는 둘 다 세미 조인으로 바꿔 비슷한 계획을 만드는 경우가 많다. 성능 차이보다 더 중요한 건 부정형이다.

### NOT IN과 NULL

```sql
-- 관리자로 지정된 적 없는 직원을 찾고 싶다
SELECT name FROM employee
WHERE id NOT IN (SELECT manager_id FROM employee);
```

최고 경영자처럼 `manager_id`가 NULL인 행이 하나라도 있으면 이 질의는 **아무것도 돌려주지 않는다.** `id NOT IN (3, 7, NULL)`은 `id <> 3 AND id <> 7 AND id <> NULL`이고, `id <> NULL`은 참도 거짓도 아닌 UNKNOWN이라 전체가 절대 참이 될 수 없다(SQL의 3값 논리).

```sql
-- 안전한 쓰기 두 가지
SELECT name FROM employee e
WHERE NOT EXISTS (SELECT 1 FROM employee m WHERE m.manager_id = e.id);

SELECT name FROM employee
WHERE id NOT IN (SELECT manager_id FROM employee WHERE manager_id IS NOT NULL);
```

부정 조건에는 `NOT EXISTS`를 기본으로 쓴다. NULL이 섞여도 의도대로 동작한다.

## 조인으로 바꿔 쓰기

서브쿼리와 조인은 상당 부분 서로 바꿔 쓸 수 있다.

| 서브쿼리 | 조인으로 |
| --- | --- |
| `IN`/`EXISTS` (있는 것) | 내부 조인. 단, 한쪽에 여러 행이 맞으면 결과가 불어나므로 `DISTINCT`가 필요할 수 있다 |
| `NOT EXISTS` (없는 것) | `LEFT JOIN ... WHERE 오른쪽.키 IS NULL` (안티 조인) |
| 스칼라 서브쿼리 집계 | 미리 `GROUP BY`한 인라인 뷰와 `LEFT JOIN` |

```sql
-- 부양가족 수: 스칼라 서브쿼리 대신 한 번에 집계해서 붙이기
SELECT e.name, COALESCE(d.cnt, 0) AS dependents
FROM employee e
LEFT JOIN (SELECT employee_id, COUNT(*) AS cnt
           FROM dependent GROUP BY employee_id) d
  ON d.employee_id = e.id;
```

`LEFT JOIN`을 쓰는 이유는 부양가족이 없는 직원도 0으로 남기기 위해서다. 내부 조인이면 그 직원이 결과에서 사라진다. 여러 테이블을 먼저 조인하고 집계하면 행이 불어나 합계가 틀리는 문제가 있는데, 이때는 위처럼 **먼저 집계하고 나중에 조인**한다.

어느 쪽이 나은지는 정답이 없다. 읽기 쉬운 쪽으로 쓰고, 느리면 실행 계획을 보고 바꾼다. 존재 여부만 필요한데 조인 후 `DISTINCT`를 쓰는 것보다는 `EXISTS`가 의도가 분명하다.

## 뿌리: 관계해석

SQL의 이론적 바탕은 두 가지다. [[sql-and-relational-algebra|관계대수]]는 "어떤 연산을 어떤 순서로" 적용할지 쓰는 **절차적** 언어이고, **관계해석(relational calculus)** 은 원하는 결과가 만족할 조건만 쓰는 **비절차적** 언어다. 수학의 술어 논리에 기반한다.

| 종류 | 변수가 가리키는 것 | 표기 예 |
| --- | --- | --- |
| 튜플 관계해석 | 행(튜플) | `{ t.name | EMPLOYEE(t) ∧ t.salary > 5000 }` |
| 도메인 관계해석 | 컬럼 값(도메인 원소) | `{ n | ∃s ∃d (EMPLOYEE(n, s, d) ∧ s > 5000) }` |

두 한정자가 핵심이다.

- **∃ (존재 한정자)**: "조건을 만족하는 것이 적어도 하나 있다" → SQL의 `EXISTS`
- **∀ (전칭 한정자)**: "모든 것이 조건을 만족한다" → SQL에는 직접 대응이 없어서 "만족하지 않는 것이 없다", 즉 `NOT EXISTS ... NOT EXISTS`로 쓴다

"20번 프로젝트에 참여하는 직원"을 튜플 관계해석으로 쓰면 위의 `EXISTS` 질의와 모양이 거의 같다.

```text
{ e.name | EMPLOYEE(e) ∧ ∃w ( WORKS_ON(w) ∧ w.employee_id = e.id ∧ w.project_id = 20 ) }
```

∀가 필요한 대표 질의가 "모든 프로젝트에 참여한 직원"이다. 관계대수로는 디비전(÷) 연산이고, SQL로는 이중 부정으로 쓴다.

```sql
-- 참여하지 않은 프로젝트가 하나도 없는 직원
SELECT e.name
FROM employee e
WHERE NOT EXISTS (
  SELECT 1 FROM project p
  WHERE NOT EXISTS (
    SELECT 1 FROM works_on w
    WHERE w.employee_id = e.id AND w.project_id = p.id
  )
);
```

관계대수와 관계해석은 표현력이 같다고 증명되어 있다(코드의 정리). 어떤 질의 언어가 관계대수로 표현되는 모든 질의를 표현할 수 있으면 **관계적으로 완전하다**고 한다. SQL은 이 둘을 섞은 언어다. `SELECT ... FROM ... WHERE`는 튜플 관계해석처럼 조건을 선언하고, DBMS는 그것을 관계대수 연산 트리로 바꿔 최적화한 뒤 실행한다.

## 정리

- 서브쿼리는 `WHERE`(값·목록), `FROM`(인라인 뷰), `SELECT`(스칼라 값)에 들어간다.
- 단일 값 비교에 여러 행이 오면 에러다. 여러 행은 `IN`·`ANY`·`ALL`·`EXISTS`로 받는다.
- 상관 서브쿼리는 바깥 행마다 평가된다. 참조 컬럼의 인덱스와 실행 계획을 확인한다.
- `NOT IN`은 NULL 하나에 결과가 텅 빈다. 부정은 `NOT EXISTS`로 쓴다.
- `EXISTS`는 관계해석의 ∃이고, "모두"는 `NOT EXISTS`를 두 번 겹쳐 표현한다.

관련 노트: [[sql-basics|SQL 기초]], [[sql-and-relational-algebra|관계대수와 DB 설계]], [[index-design|인덱스 설계와 쿼리 튜닝]], [[er-modeling|ER 모델링]], [[developer-traps|개발자가 빠지는 함정 모음]]
