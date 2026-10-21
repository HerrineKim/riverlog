---
title: "SQL 기초"
concept: "SQL"
summary: "SQL 명령어 분류(DDL·DML·DCL)와 테이블 구조 변경과 제약 조건(기본 키·외래 키·CASCADE, 자연 키와 대리 키), 뷰, 관계형 데이터베이스에서 데이터를 생성·조회·수정·삭제하고 조건·정렬·집계·그룹화하는 기본 문법, WHERE와 HAVING·DISTINCT·CROSS JOIN처럼 헷갈리기 쉬운 지점."
tags: ["sql", "database", "mysql", "sqlite", "certificate"]
source: mixed
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/what-is-the-best-way-to-learn-sql", "https://bytebytego.com/guides/how-do-sql-joins-work", "https://sql-joins.leopard.in.ua/", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EB%B2%A0%EC%9D%B4%EC%8A%A4/Constraint%20%EC%A0%9C%EC%95%BD%EC%A1%B0%EA%B1%B4.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EB%B2%A0%EC%9D%B4%EC%8A%A4/SQL%EB%AC%B8.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EB%B2%A0%EC%9D%B4%EC%8A%A4/CSV%20%ED%8C%8C%EC%9D%BC%EB%A1%9C%20%ED%85%8C%EC%9D%B4%EB%B8%94%20%EC%83%9D%EC%84%B1.md"]
---

> 여러 자료를 종합한 노트에, SQL 다섯 분류는 ByteByteGo의 System Design 101 가이드 「[What is the Best Way to Learn SQL?](https://bytebytego.com/guides/what-is-the-best-way-to-learn-sql)」를, JOIN은 「[How do SQL Joins Work?](https://bytebytego.com/guides/how-do-sql-joins-work)」를 바탕으로 보강했다.
> 제약 조건·자연 키와 대리 키, 구조 변경과 DELETE·TRUNCATE·DROP, 뷰, CSV 가져오기는 「[Frontend_TIL: Constraint 제약조건](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EB%B2%A0%EC%9D%B4%EC%8A%A4/Constraint%20%EC%A0%9C%EC%95%BD%EC%A1%B0%EA%B1%B4.md)」, 「[SQL문](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EB%B2%A0%EC%9D%B4%EC%8A%A4/SQL%EB%AC%B8.md)」, 「[CSV 파일로 테이블 생성](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EB%B2%A0%EC%9D%B4%EC%8A%A4/CSV%20%ED%8C%8C%EC%9D%BC%EB%A1%9C%20%ED%85%8C%EC%9D%B4%EB%B8%94%20%EC%83%9D%EC%84%B1.md)」을 바탕으로 보강했다.

SQL(Structured Query Language)은 RDBMS에서 데이터를 관리하기 위해 설계된 언어다. ORM을 쓰더라도 실제로 DB에 전달되는 것은 SQL이므로, 기본 문법을 알면 ORM이 만드는 쿼리를 이해하고 문제를 진단할 수 있다.

예시 테이블: `users_user(id, first_name, last_name, age, country, phone, balance)`

## SQL 명령어 분류

| 분류 | 의미 | 명령어 |
| --- | --- | --- |
| DDL (정의어) | 스키마·테이블·뷰·인덱스 등 구조 정의 | `CREATE`, `ALTER`, `DROP`, `TRUNCATE` |
| DML (조작어) | 데이터 조회·삽입·수정·삭제 | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| DCL (제어어) | 권한과 트랜잭션 제어 | `GRANT`, `REVOKE`, `COMMIT`, `ROLLBACK` |

분류를 더 잘게 나누면 다섯 가지다. 조회만 따로 **DQL**(질의어, `SELECT`), 트랜잭션 제어를 따로 **TCL**(`COMMIT`, `ROLLBACK`, `SAVEPOINT`)로 둔다.

| 5분류 | 명령어 | 주로 쓰는 사람 |
| --- | --- | --- |
| DDL | `CREATE`, `ALTER`, `DROP` | 백엔드 개발자, DBA |
| DQL | `SELECT` | 모두. 데이터 분석가는 이것이 대부분이다 |
| DML | `INSERT`, `UPDATE`, `DELETE` | 백엔드 개발자 |
| DCL | `GRANT`, `REVOKE` | DBA, 운영 |
| TCL | `COMMIT`, `ROLLBACK` | 백엔드 개발자 |

역할에 따라 필요한 범위가 다르므로, 분석이 목적이면 DQL(조회·집계·조인)부터 깊게 익힌다.

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

MySQL은 `SHOW TABLES;`(테이블 목록), `DESC persons;`(열 구조), `SELECT DATABASE();`(지금 선택한 DB)로 구조를 확인한다. SQLite CLI에서는 메타 명령을 쓴다.

```bash
sqlite3 db.sqlite3
sqlite> .tables                        -- 테이블 목록
sqlite> .mode csv
sqlite> .import users.csv users_user   -- CSV를 테이블로 로드
```

MySQL에서 CSV를 넣을 때는 `LOAD DATA LOCAL INFILE 'users.csv' INTO TABLE users_user FIELDS TERMINATED BY ',' IGNORE 1 LINES;`를 쓴다(서버와 클라이언트 모두 `local_infile`을 켜야 한다). MySQL Workbench의 Table Data Import Wizard는 같은 일을 GUI로 하며, 구분자와 열 타입을 지정해 새 테이블을 만들 수도 있다. 엑셀 데이터도 CSV로 내보내면 SQL로 분석할 수 있다.

### 구조 바꾸기

```sql
ALTER TABLE persons ADD memo TEXT;          -- 열 추가
ALTER TABLE persons MODIFY memo VARCHAR(100); -- 열 타입 변경 (MySQL)
ALTER TABLE persons DROP COLUMN memo;       -- 열 삭제
ALTER DATABASE cats CHARACTER SET utf8mb4;  -- 기본 문자 집합 변경
SHOW VARIABLES LIKE 'character_set_database';
```

MySQL의 `utf8`은 3바이트까지만 담는 옛 별칭이라 이모지가 깨진다. 문자 집합은 `utf8mb4`를 쓴다(MySQL 8.0부터 기본값).

| 지우는 대상 | 명령 | 특징 |
| --- | --- | --- |
| 조건에 맞는 행 | `DELETE FROM t WHERE ...` | DML. 행마다 지우고 로그를 남겨 롤백할 수 있다. `WHERE`가 없으면 전부 지운다 |
| 모든 행 (구조는 유지) | `TRUNCATE TABLE t` | DDL. 테이블을 비우고 새로 만드는 방식이라 빠르고, `AUTO_INCREMENT`도 처음으로 돌아간다. MySQL에서는 롤백되지 않는다 |
| 테이블 자체 | `DROP TABLE t` | 구조와 데이터를 모두 없앤다 |

### 제약 조건

제약 조건(constraint)은 열에 들어갈 값을 DB가 직접 검사하게 하는 규칙이다. 애플리케이션 코드가 빠뜨려도 잘못된 데이터가 들어가지 않는다.

| 제약 | 뜻 |
| --- | --- |
| `PRIMARY KEY` | 행을 하나로 식별한다. NULL과 중복을 허용하지 않는다. 테이블당 하나(여러 열을 묶은 복합 키도 하나로 친다) |
| `NOT NULL` | 빈 값(NULL)을 허용하지 않는다 |
| `UNIQUE` | 중복을 허용하지 않는다. NULL은 여러 개 들어갈 수 있다(DBMS마다 다름) |
| `DEFAULT 값` | 값을 주지 않으면 기본값을 넣는다 |
| `FOREIGN KEY ... REFERENCES` | 다른 테이블의 키만 값으로 허용한다(참조 무결성) |
| `CHECK (조건)` | 조건식을 만족하는 값만 허용한다. MySQL은 8.0.16부터 실제로 검사한다 |

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
```

**기본 키의 두 종류**: 이메일·주민번호처럼 원래 데이터에 있던 값을 키로 쓰면 **자연 키(natural key)**, 키로 쓰려고 따로 만든 일련번호를 쓰면 **대리 키(surrogate key)** 다. 자연 키는 바뀔 수 있고(이메일 변경) 개인정보가 섞이기 쉬워, 보통 대리 키를 기본 키로 두고 자연 키에는 `UNIQUE`를 건다. 대리 키는 `AUTO_INCREMENT`(PostgreSQL은 `GENERATED ... AS IDENTITY`)로 1씩 늘어나는 정수를 자동으로 넣는다. 여러 서버에서 ID를 만들어야 하면 UUID·Snowflake 같은 방식을 쓴다([[distributed-unique-id|분산 고유 ID]]).

**외래 키의 동작**: 부모 행을 지우거나 키를 바꿀 때 자식 행을 어떻게 할지 정한다. `CASCADE`는 자식도 함께 지우거나 바꾸고, `SET NULL`은 자식의 외래 키를 NULL로, 기본값인 `RESTRICT`(`NO ACTION`)는 자식이 있으면 부모 변경을 막는다. `CASCADE`는 편하지만 한 번의 삭제가 여러 테이블로 번지므로 범위를 알고 쓴다.

### 뷰

뷰(view)는 `SELECT` 결과에 이름을 붙인 **가상 테이블**이다. 데이터를 따로 저장하지 않고, 조회할 때마다 정의된 쿼리를 실행한다. 복잡한 조인을 숨기거나 일부 열만 보여 주는 권한 경계로 쓴다. 집계·`DISTINCT`·조인이 들어간 뷰는 갱신할 수 없고, 뷰에 직접 인덱스를 걸 수 없다.

```sql
CREATE VIEW active_users AS
SELECT id, first_name, country FROM users_user WHERE balance > 0;
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

## JOIN: 테이블 합치기

JOIN은 두 테이블을 공통 열(대개 외래 키)로 이어 붙인다. 종류는 **짝이 없는 행을 어느 쪽에서 살리느냐**로 갈린다.

```sql
SELECT o.id, c.name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;
```

| 종류 | 결과 | 짝이 없을 때 |
| --- | --- | --- |
| `INNER JOIN` | 양쪽 모두에 짝이 있는 행만 | 버린다 |
| `LEFT JOIN` | 왼쪽 테이블의 모든 행 + 오른쪽의 짝 | 오른쪽 열을 `NULL`로 채운다 |
| `RIGHT JOIN` | 오른쪽 테이블의 모든 행 + 왼쪽의 짝 | 왼쪽 열을 `NULL`로 채운다 |
| `FULL OUTER JOIN` | 어느 한쪽에라도 있는 모든 행 | 없는 쪽을 `NULL`로 채운다. MySQL은 지원하지 않아 `LEFT`와 `RIGHT`의 `UNION`으로 만든다 |

- `RIGHT JOIN`은 테이블 순서를 바꾼 `LEFT JOIN`과 같아서 실무에서는 `LEFT JOIN`으로 통일하는 경우가 많다.
- "짝이 없는 행만" 찾으려면 `LEFT JOIN` 후 `WHERE 오른쪽.id IS NULL`로 거른다(예: 주문이 없는 고객).
- 조건 없이 모든 조합을 만드는 `CROSS JOIN`, 같은 테이블끼리 잇는 셀프 조인도 있다. 관계대수의 조인 연산은 [[sql-and-relational-algebra|관계대수와 DB 설계]]에 있다.
- 조인 종류를 벤 다이어그램으로 고르고 해당 SQL을 바로 받아 보려면 「[SQL Joins Visualizer](https://sql-joins.leopard.in.ua/)」가 편하다.

## 핵심 정리

- `INSERT / SELECT / UPDATE / DELETE` + `WHERE`가 CRUD의 전부다.
- `ORDER BY … LIMIT … OFFSET`으로 정렬·페이지네이션, `GROUP BY` + 집계 함수로 요약.
- 같은 쿼리를 Django ORM으로 쓰는 법은 [[orm-queryset|Django ORM과 QuerySet]]에 대응표로 있다.

관련 노트: [[sql-and-relational-algebra|관계대수와 DB 설계]], [[transaction|트랜잭션과 회복]], [[dbeaver|DBeaver에서 SQL로 데이터 다루기]]

참고: [W3Schools SQL](https://www.w3schools.com/sql/)
