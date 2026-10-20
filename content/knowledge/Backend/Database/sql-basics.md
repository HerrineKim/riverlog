---
title: "SQL 기초"
concept: "SQL"
summary: "SQL 명령어 분류(DDL·DML·DCL)와 관계형 데이터베이스에서 데이터를 생성·조회·수정·삭제하고 조건·정렬·집계·그룹화하는 기본 문법, WHERE와 HAVING·DISTINCT·CROSS JOIN처럼 헷갈리기 쉬운 지점."
tags: ["sql", "database", "mysql", "sqlite", "certificate"]
source: mixed
date: "2026-10-20"
---

SQL(Structured Query Language)은 RDBMS에서 데이터를 관리하기 위해 설계된 언어다. ORM을 쓰더라도 실제로 DB에 전달되는 것은 SQL이므로, 기본 문법을 알면 ORM이 만드는 쿼리를 이해하고 문제를 진단할 수 있다.

예시 테이블: `users_user(id, first_name, last_name, age, country, phone, balance)`

## SQL 명령어 분류

| 분류 | 의미 | 명령어 |
| --- | --- | --- |
| DDL (정의어) | 스키마·테이블·뷰·인덱스 등 구조 정의 | `CREATE`, `ALTER`, `DROP`, `TRUNCATE` |
| DML (조작어) | 데이터 조회·삽입·수정·삭제 | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| DCL (제어어) | 권한과 트랜잭션 제어 | `GRANT`, `REVOKE`, `COMMIT`, `ROLLBACK` |

`GRANT`는 사용자에게 권한을 부여하고 `REVOKE`는 회수한다. `COMMIT`·`ROLLBACK`·`SAVEPOINT`는 트랜잭션 제어어(TCL)로 따로 나누기도 한다([[transaction|트랜잭션과 회복]]). SQL은 「무엇을 원하는지」만 적는 비절차적 언어이고, 그 바탕인 관계대수는 「어떻게 구할지」를 연산 순서로 적는 절차적 언어다([[sql-and-relational-algebra|관계대수와 DB 설계]]).

## 데이터베이스·테이블 다루기

```sql
SHOW DATABASES;          -- (MySQL) DB 목록
CREATE DATABASE cats;    -- DB 생성
USE cats;                -- 사용할 DB 선택

CREATE TABLE persons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  last_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  city VARCHAR(255)
);
```

SQLite CLI에서는 메타 명령을 쓴다.

```bash
sqlite3 db.sqlite3
sqlite> .tables                        -- 테이블 목록
sqlite> .mode csv
sqlite> .import users.csv users_user   -- CSV를 테이블로 로드
```

## CRUD

```sql
-- Create
INSERT INTO users_user (first_name, last_name, age, country, phone, balance)
VALUES ('길동', '김', 100, '경상북도', '010-1234-1234', 100);

-- Read
SELECT * FROM users_user;
SELECT first_name FROM users_user WHERE id = 101;

-- Update
UPDATE users_user SET first_name = '철수' WHERE id = 101;

-- Delete
DELETE FROM users_user WHERE id = 102;
```

- 열 이름을 생략하고 `VALUES`만 쓰면 **모든 열의 값(id 포함)을** 순서대로 줘야 한다. 개수가 맞지 않으면 `table has 7 columns but 6 values were supplied` 에러가 난다. 열 이름을 명시하면 id는 자동 증가에 맡길 수 있다.
- 이미 존재하는 PK로 insert하면 `UNIQUE constraint failed`.
- `UPDATE`·`DELETE`에서 `WHERE`를 빠뜨리면 **모든 행**이 바뀌거나 지워진다.

## 조건: WHERE

```sql
SELECT COUNT(*) FROM users_user WHERE age >= 30 AND last_name = '김';
SELECT * FROM users_user WHERE age = 30 OR last_name = '김';
SELECT COUNT(*) FROM users_user WHERE phone LIKE '02-%';
```

`LIKE` 와일드카드: `%`는 **0개 이상의 임의 문자**, `_`는 **정확히 1개의 임의 문자**. (예: `'2_'` → 20~29 같은 두 글자 값)

## 정렬과 개수 제한

```sql
SELECT * FROM users_user ORDER BY age DESC LIMIT 10;
SELECT * FROM users_user ORDER BY balance ASC, age DESC LIMIT 10;  -- balance 우선, 같으면 age
SELECT * FROM users_user ORDER BY last_name DESC, first_name DESC LIMIT 1 OFFSET 4; -- 5번째
```

## 집계 함수와 GROUP BY

```sql
SELECT AVG(age), MAX(balance), SUM(balance) FROM users_user WHERE last_name = '김';

SELECT country, COUNT(*) FROM users_user GROUP BY country;   -- 지역별 인원 수
SELECT country, COUNT(*) FROM users_user GROUP BY country HAVING COUNT(*) >= 10;
```

`COUNT`, `SUM`, `AVG`, `MAX`, `MIN`은 여러 행을 하나의 값으로 요약한다. `GROUP BY`는 지정한 열 값이 같은 행끼리 묶어 그룹마다 집계한다. 그룹에 조건을 걸 때는 `WHERE`가 아니라 `HAVING`을 쓴다.

### 헷갈리기 쉬운 지점

- **행 조건은 `WHERE`, 집계 후 그룹 조건은 `HAVING`** 에 둔다. `WHERE`는 그룹을 만들기 전에 행을 거르고, `HAVING`은 집계가 끝난 그룹을 거른다. 그룹 기준이 여러 개면 `GROUP BY` 뒤에 나열한다.
- `SELECT 학과 FROM 학생`은 행 수만큼, `SELECT DISTINCT 학과`는 서로 다른 값의 수만큼 나온다.
- **CROSS JOIN**은 두 테이블의 모든 행 조합(카티션 곱)을 만든다. 행이 m개, n개면 결과는 m × n개다.

```sql
-- 편의점이 4곳 이상인 광역시에서, 판매액 100만 원 초과 편의점의 평균 판매액
SELECT 광역시, AVG(판매액)
FROM 편의점
WHERE 판매액 > 1000000      -- 행 조건: 그룹 만들기 전
GROUP BY 광역시
HAVING COUNT(*) >= 4;       -- 그룹 조건: 집계 후
```

## 핵심 정리

- `INSERT / SELECT / UPDATE / DELETE` + `WHERE`가 CRUD의 전부다.
- `ORDER BY … LIMIT … OFFSET`으로 정렬·페이지네이션, `GROUP BY` + 집계 함수로 요약.
- 같은 쿼리를 Django ORM으로 쓰는 법은 [[orm-queryset|Django ORM과 QuerySet]]에 대응표로 있다.

관련 노트: [[sql-and-relational-algebra|관계대수와 DB 설계]], [[transaction|트랜잭션과 회복]], [[dbeaver|DBeaver에서 SQL로 데이터 다루기]]

참고: [W3Schools SQL](https://www.w3schools.com/sql/)
