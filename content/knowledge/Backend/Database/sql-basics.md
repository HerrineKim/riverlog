---
title: "SQL 기초"
concept: "SQL"
summary: "관계형 데이터베이스에서 데이터를 생성·조회·수정·삭제하고 조건·정렬·집계·그룹화하는 기본 SQL 문법."
tags: ["sql", "database", "mysql", "sqlite"]
source: til
---

SQL(Structured Query Language)은 RDBMS에서 데이터를 관리하기 위해 설계된 언어다. ORM을 쓰더라도 실제로 DB에 전달되는 것은 SQL이므로, 기본 문법을 알면 ORM이 만드는 쿼리를 이해하고 문제를 진단할 수 있다.

예시 테이블: `users_user(id, first_name, last_name, age, country, phone, balance)`

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

- 열 이름을 생략하고 `VALUES`만 쓰면 **모든 열의 값(id 포함)**을 순서대로 줘야 한다. 개수가 맞지 않으면 `table has 7 columns but 6 values were supplied` 에러가 난다. 열 이름을 명시하면 id는 자동 증가에 맡길 수 있다.
- 이미 존재하는 PK로 insert하면 `UNIQUE constraint failed`.
- `UPDATE`·`DELETE`에서 `WHERE`를 빠뜨리면 **모든 행**이 바뀌거나 지워진다.

## 조건: WHERE

```sql
SELECT COUNT(*) FROM users_user WHERE age >= 30;
SELECT COUNT(*) FROM users_user WHERE age = 30 AND last_name = '김';
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
SELECT AVG(age) FROM users_user;
SELECT AVG(age) FROM users_user WHERE last_name = '김';
SELECT MAX(balance), SUM(balance) FROM users_user;

SELECT country, COUNT(*) FROM users_user GROUP BY country;   -- 지역별 인원 수
```

`COUNT`, `SUM`, `AVG`, `MAX`, `MIN`은 여러 행을 하나의 값으로 요약한다. `GROUP BY`는 지정한 열 값이 같은 행끼리 묶어 그룹마다 집계한다. (그룹에 조건을 걸 때는 `WHERE`가 아니라 `HAVING`)

## 실습 환경 메모

- 로컬 학습에는 Django 기본 DB인 SQLite나 VSCode SQLite 확장이 가장 간단하다.
- 강의에서는 AWS Lightsail의 관리형 MySQL을 만들고 MySQL Workbench로 접속했다(Hostname = DB 엔드포인트, Username/Password 입력, DB를 Public 모드로 전환 후 Test Connection). 관리형 DB는 무료 기간이 끝나면 과금되므로 실습 후 반드시 삭제한다.

## 핵심 정리

- `INSERT / SELECT / UPDATE / DELETE` + `WHERE`가 CRUD의 전부다.
- `ORDER BY … LIMIT … OFFSET`으로 정렬·페이지네이션, `GROUP BY` + 집계 함수로 요약.
- 같은 쿼리를 Django ORM으로 쓰는 법은 [ORM과 QuerySet](Backend/Django/orm-queryset).

참고: [W3Schools SQL](https://www.w3schools.com/sql/)
