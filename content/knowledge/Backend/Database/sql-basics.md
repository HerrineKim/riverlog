---
title: "SQL 기초"
concept: "SQL"
summary: "SQL 명령어 분류(DDL·DML·DCL)와 테이블 구조 변경과 제약 조건(기본 키·외래 키·CASCADE, 자연 키와 대리 키), 뷰·시퀀스·동의어, 데이터를 생성·조회·수정·삭제하고 조건·정렬·집계·그룹화하는 기본 문법, WHERE와 HAVING·DISTINCT·CROSS JOIN처럼 헷갈리기 쉬운 지점, 서브쿼리(상관 서브쿼리, EXISTS와 NOT IN의 NULL 함정), 저장 프로시저와 PL/SQL(블록, 예외, 커서, BULK COLLECT, 함수·패키지·트리거)."
tags: ["sql", "database", "mysql", "oracle", "certificate"]
source: mixed
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/what-is-the-best-way-to-learn-sql", "https://bytebytego.com/guides/how-do-sql-joins-work", "https://sql-joins.leopard.in.ua/", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EB%B2%A0%EC%9D%B4%EC%8A%A4/Constraint%20%EC%A0%9C%EC%95%BD%EC%A1%B0%EA%B1%B4.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EB%B2%A0%EC%9D%B4%EC%8A%A4/SQL%EB%AC%B8.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EB%B2%A0%EC%9D%B4%EC%8A%A4/CSV%20%ED%8C%8C%EC%9D%BC%EB%A1%9C%20%ED%85%8C%EC%9D%B4%EB%B8%94%20%EC%83%9D%EC%84%B1.md", "https://github.com/jbee37142/Interview_Question_for_Beginner/blob/main/Database/README.md", "https://github.com/gyoogle/tech-interview-for-developer/blob/master/Computer%20Science/Database/%5BDB%5D%20Key.md", "https://github.com/gyoogle/tech-interview-for-developer/blob/master/Computer%20Science/Database/%EC%A0%80%EC%9E%A5%20%ED%94%84%EB%A1%9C%EC%8B%9C%EC%A0%80%28Stored%20PROCEDURE%29.md", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/db.md", "고려사이버대학교 데이터베이스 설계구축 강의(나홍석 교수, 2023-2학기)", "고려사이버대학교 데이터베이스시스템 강의(나홍석 교수, 2024-1학기)"]
---

> 여러 자료를 종합한 노트에, SQL 다섯 분류는 ByteByteGo의 System Design 101 가이드 「[What is the Best Way to Learn SQL?](https://bytebytego.com/guides/what-is-the-best-way-to-learn-sql)」를, JOIN은 「[How do SQL Joins Work?](https://bytebytego.com/guides/how-do-sql-joins-work)」를 바탕으로 보강했다.
> 제약 조건·자연 키와 대리 키, 구조 변경과 DELETE·TRUNCATE·DROP, 뷰, CSV 가져오기는 「[Frontend_TIL: Constraint 제약조건](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EB%B2%A0%EC%9D%B4%EC%8A%A4/Constraint%20%EC%A0%9C%EC%95%BD%EC%A1%B0%EA%B1%B4.md)」, 「[SQL문](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EB%B2%A0%EC%9D%B4%EC%8A%A4/SQL%EB%AC%B8.md)」, 「[CSV 파일로 테이블 생성](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EB%B2%A0%EC%9D%B4%EC%8A%A4/CSV%20%ED%8C%8C%EC%9D%BC%EB%A1%9C%20%ED%85%8C%EC%9D%B4%EB%B8%94%20%EC%83%9D%EC%84%B1.md)」을 바탕으로 보강했다.
> 「파라미터 바인딩과 Prepared Statement」는 jbee의 「[Interview Question for Beginner](https://github.com/jbee37142/Interview_Question_for_Beginner)」 데이터베이스 문서를 바탕으로 보강했다.
> 키의 종류와 저장 프로시저는 gyoogle의 「[tech-interview-for-developer](https://github.com/gyoogle/tech-interview-for-developer)」 저장소의 Database 문서를 바탕으로 보강했다.
> 기본 키 변경, 외래 키의 NULL, 갱신 가능한 뷰, COUNT의 동작은 「[fru1tworld/cs-basic 모의 면접 질문 목록](https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/db.md)」의 질문을 실마리로 보강했다.
> 무결성의 종류와 강화 방법, 컬럼·테이블 제약과 컬럼 추가 규칙은 고려사이버대학교 「데이터베이스 설계구축」(2023-2학기)과 「데이터베이스시스템」(2024-1학기) 강의 내용으로 보강했다.
> 뷰를 쓰는 이유와 `WITH CHECK OPTION`, 시퀀스·동의어, PL/SQL은 「데이터베이스 설계구축」(2023-2학기), 서브쿼리는 「데이터베이스시스템」(2024-1학기) 강의 내용으로 보강했다.

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

이미 행이 있는 테이블의 구조를 바꿀 때는 기존 행이 새 규칙을 만족해야 한다.

- **`NOT NULL` 열을 기본값 없이 추가할 수 없다.** 기존 행에 넣을 값이 없기 때문이다. `DEFAULT`를 함께 주거나, NULL 허용으로 추가해 값을 채운 뒤 `NOT NULL`로 바꾼다. PostgreSQL·Oracle은 오류를 내고, MySQL은 타입의 암묵적 기본값(0, 빈 문자열)으로 채운다.
- **타입을 좁히면 실패할 수 있다.** 이미 들어 있는 가장 긴 문자열보다 짧은 길이, 기존 값이 넘치는 숫자 크기로는 바꿀 수 없다.
- 열 삭제는 되돌릴 수 없으므로 백업 뒤에 한다.

| 지우는 대상 | 명령 | 특징 |
| --- | --- | --- |
| 조건에 맞는 행 | `DELETE FROM t WHERE ...` | DML. 행마다 지우고 로그를 남겨 롤백할 수 있다. `WHERE`가 없으면 전부 지운다 |
| 모든 행 (구조는 유지) | `TRUNCATE TABLE t` | DDL. 테이블을 비우고 새로 만드는 방식이라 빠르고, `AUTO_INCREMENT`도 처음으로 돌아간다. MySQL에서는 롤백되지 않는다 |
| 테이블 자체 | `DROP TABLE t` | 구조와 데이터를 모두 없앤다 |

### 제약 조건

제약 조건(constraint)은 열에 들어갈 값을 DB가 직접 검사하게 하는 규칙이다. 애플리케이션 코드가 빠뜨려도 잘못된 데이터가 들어가지 않는다.

제약 조건은 **데이터 무결성(integrity)**, 곧 저장된 값이 현실과 맞고 서로 모순되지 않는 상태를 지키는 도구다. 무결성은 지키려는 대상에 따라 네 가지로 나눈다.

| 무결성 | 지키는 것 | 구현 |
| --- | --- | --- |
| 개체 무결성(entity) | 모든 행을 하나로 구별할 수 있다. 기본 키는 NULL일 수 없다 | `PRIMARY KEY`, `UNIQUE` |
| 영역(도메인) 무결성(domain) | 열 값이 그 열이 가질 수 있는 값의 범위 안에 있다. 2월 30일, 정의되지 않은 상태 코드 `4`는 안 된다 | 데이터 타입·크기, `NOT NULL`, `CHECK`, `DEFAULT` |
| 참조 무결성(referential) | 외래 키 값은 부모 테이블에 있는 키이거나 NULL이다 | `FOREIGN KEY` |
| 사용자 정의 무결성 | 업무 규칙(잔액은 한도를 넘지 않는다 등) | `CHECK`, 트리거, 애플리케이션 |

데이터 타입은 도메인 무결성의 가장 기초다. 날짜를 `DATE`로 두면 없는 날짜가 들어올 수 없고, 숫자를 숫자 타입으로 두면 연산과 형식 검사를 DB가 해 준다. 같은 값을 더 적은 바이트로 담는 타입을 고르면(`'100000'`은 문자열 6바이트, 정수 4바이트) 한 페이지에 행이 더 들어가 읽는 페이지 수가 준다.

무결성을 어디서 강제하느냐에 따라 장단점이 갈린다.

| 방법 | 장점 | 단점 |
| --- | --- | --- |
| 선언적 제약 조건 | 선언 한 줄로 끝나고, 어떤 경로로 들어오는 데이터든 원천적으로 막는다. 켜고 끄기 쉽다 | 복잡한 규칙과 예외 처리는 표현할 수 없다 |
| 트리거 | 여러 테이블에 걸친 복잡한 규칙도 DB 한 곳에서 관리한다 | 동작이 눈에 잘 띄지 않아 디버깅이 어렵고 성능에 영향을 준다 |
| 애플리케이션 코드 | 가장 복잡한 규칙과 사용자 친화적인 오류 처리가 된다 | 규칙이 코드 곳곳에 흩어지고, 다른 경로(배치, 직접 SQL)로 들어온 데이터는 못 막는다 |

데이터가 쌓인 뒤에 정제하는 비용이 훨씬 크므로, 단순한 규칙은 설계 단계에서 제약 조건으로 선언하고 복잡한 규칙만 애플리케이션이나 트리거로 보탠다.

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

- **열 제약과 테이블 제약**: 열 정의 옆에 쓰는 열 제약(`email VARCHAR(100) UNIQUE`)과 열 목록 뒤에 따로 쓰는 테이블 제약(`CONSTRAINT uk_name UNIQUE (col3, col4)`)이 있다. 여러 열에 걸친 기본 키·유니크·`CHECK`는 테이블 제약으로만 쓸 수 있다. `NOT NULL`은 열 제약으로만 쓴다.
- **제약에 이름을 붙인다.** `CONSTRAINT 이름`을 주지 않으면 DBMS가 임의 이름(`SYS_C0012345` 등)을 붙여, 나중에 `ALTER TABLE ... DROP CONSTRAINT`로 지우거나 오류 메시지에서 원인을 찾기 어렵다. 테이블을 만든 뒤에도 `ALTER TABLE t ADD CONSTRAINT ...`로 추가할 수 있다.
- `PRIMARY KEY`와 `UNIQUE`를 걸면 DB가 중복 검사를 위해 유니크 인덱스를 자동으로 만든다([[index-design#유니크 인덱스|인덱스 설계]]).

**키의 종류**: 관계형 모델에서 행을 구분하는 기준을 키라고 한다.

| 키 | 뜻 |
| --- | --- |
| 슈퍼키(super key) | 행을 **유일하게** 식별하는 속성 집합. 군더더기 속성이 섞여도 된다 |
| 후보키(candidate key) | 유일성에 **최소성**까지 갖춘 슈퍼키. 속성 하나라도 빼면 유일하지 않다 |
| 기본 키(primary key) | 후보키 중 대표로 고른 하나. NULL·중복 불가 |
| 대체키(alternate key) | 기본 키로 고르지 않은 나머지 후보키. 보통 `UNIQUE`를 건다 |
| 복합 키(composite key) | 속성 두 개 이상이 합쳐져야 유일해지는 키. 수강(학번, 과목번호)처럼 M:N 연결 테이블에 흔하다 |
| 외래 키(foreign key) | 다른 테이블의 기본 키(또는 후보키)를 참조하는 속성 |

**기본 키의 두 종류**: 이메일·주민번호처럼 원래 데이터에 있던 값을 키로 쓰면 **자연 키(natural key)**, 키로 쓰려고 따로 만든 일련번호를 쓰면 **대리 키(surrogate key)** 다. 자연 키는 바뀔 수 있고(이메일 변경) 개인정보가 섞이기 쉬워, 보통 대리 키를 기본 키로 두고 자연 키에는 `UNIQUE`를 건다. 대리 키는 `AUTO_INCREMENT`(PostgreSQL은 `GENERATED ... AS IDENTITY`)로 1씩 늘어나는 정수를 자동으로 넣는다. 여러 서버에서 ID를 만들어야 하면 UUID·Snowflake 같은 방식을 쓴다([[distributed-unique-id|분산 고유 ID]]).

**기본 키도 바꿀 수는 있다.** `UPDATE ... SET id = ...`는 문법상 허용되고, 새 값이 유일하고 NULL이 아니면 성공한다. 하지만 바꾸지 않는 것이 원칙이다.

| 바꿀 때 생기는 일 | 이유 |
| --- | --- |
| 참조하는 자식 행이 있으면 막히거나 함께 바뀐다 | 외래 키의 `ON UPDATE` 규칙을 따른다(기본은 막는다) |
| 비용이 크다 | InnoDB처럼 기본 키가 클러스터드 인덱스인 엔진에서는 행을 지우고 새 위치에 다시 넣는 것과 같고, 기본 키를 담은 모든 보조 인덱스도 고친다 |
| DB 밖의 참조가 깨진다 | URL, 캐시 키, 로그, 다른 서비스에 퍼진 ID는 `CASCADE`로 따라오지 않는다 |

그래서 기본 키는 의미 없는 대리 키로 두고, 바뀔 수 있는 값은 일반 컬럼에 둔다.

**외래 키의 동작**: 부모 행을 지우거나 키를 바꿀 때 자식 행을 어떻게 할지 정한다. `CASCADE`는 자식도 함께 지우거나 바꾸고, `SET NULL`은 자식의 외래 키를 NULL로, 기본값인 `RESTRICT`(`NO ACTION`)는 자식이 있으면 부모 변경을 막는다. `CASCADE`는 편하지만 한 번의 삭제가 여러 테이블로 번지므로 범위를 알고 쓴다. 기본 동작(`RESTRICT`)에서는 순서가 정해진다. 만들 때는 부모 테이블과 부모 행을 먼저, 지울 때는 자식 행을 먼저 지운다. 초기 데이터를 스크립트로 넣을 때 이 순서를 어기면 외래 키 오류가 난다.

**외래 키 컬럼은 NULL을 가질 수 있다.** NULL은 「참조하는 부모가 없음」을 뜻하고, 참조 무결성 검사를 하지 않는다. 담당자가 아직 배정되지 않은 주문처럼 **선택적 관계**를 표현하는 방법이다. 관계가 필수라면 외래 키 컬럼에 `NOT NULL`을 함께 건다. 여러 컬럼으로 된 외래 키는 한 컬럼이라도 NULL이면 기본 매칭 방식(`MATCH SIMPLE`)에서 검사를 건너뛴다.

### 뷰

뷰(view)는 `SELECT` 결과에 이름을 붙인 **가상 테이블**이다. 데이터를 따로 저장하지 않고, 조회할 때마다 정의된 쿼리를 실행한다. 뷰에 직접 인덱스를 걸 수 없다. 쓰는 이유는 셋이다.

1. **복잡한 질의를 숨긴다.** 조인 세 개짜리 질의도 쓰는 쪽에서는 테이블 하나처럼 조회한다.
2. **권한 경계가 된다.** 급여 열을 뺀 뷰에만 권한을 주면 원본 테이블을 감출 수 있다.
3. **구조가 바뀌어도 앱은 그대로다.** 테이블을 둘로 쪼개도 예전 모양의 뷰를 남기면 된다(논리적 데이터 독립성, [[sql-and-relational-algebra#3단계 스키마와 데이터 독립성|관계대수와 DB 설계]]).

한 테이블의 일부 열만 고른 뷰, 여러 테이블을 조인한 뷰가 흔하고, `FROM (SELECT ...)`처럼 문장 안에 이름 없이 쓰고 그 문장이 끝나면 사라지는 것을 **인라인 뷰**라 한다(아래 「서브쿼리」).

**뷰를 고치면 원본 테이블이 바뀐다.** 뷰에는 데이터가 없으므로, 뷰에 대한 `INSERT`·`UPDATE`·`DELETE`는 밑에 있는 테이블의 행에 적용된다. 다만 뷰의 행 하나가 원본 테이블의 행 하나로 정확히 대응할 때만 가능하다.

| 갱신 가능한 뷰 | 갱신할 수 없는 뷰 |
| --- | --- |
| 테이블 하나에서 행을 거르고 열을 고른 단순한 뷰 | 집계 함수, `GROUP BY`, `DISTINCT`, `UNION`이 들어간 뷰 |
| - | 계산된 열(그 열만 못 고친다), 원본의 `NOT NULL` 열을 빼서 `INSERT`할 값이 없는 뷰 |

조인 뷰는 DBMS마다 다르다. MySQL은 한 테이블에만 영향을 주는 조인 뷰 갱신을 일부 허용하고, Oracle은 한 번에 한 테이블, 그것도 키가 보존되는(조인 뒤에도 그 테이블의 키가 결과에서 유일한) 테이블만 고치게 한다. PostgreSQL은 단순 뷰만 자동으로 갱신하며 나머지는 `INSTEAD OF` 트리거로 직접 정의한다.

**`WITH CHECK OPTION`** 은 뷰의 `WHERE` 조건을 벗어나는 변경을 막는다. `country = '서울'` 뷰로 `country`를 `'부산'`으로 바꾸면 그 행은 고친 순간 뷰에서 사라지는데, 이 옵션이 있으면 그런 `UPDATE`가 오류가 난다. 아예 고치지 못하게 하려면 Oracle에서는 `WITH READ ONLY`를 붙인다. 결과를 실제로 저장하는 구체화된 뷰는 [[database-scaling#구체화된 뷰|데이터베이스 확장과 성능 최적화]]에 있다.

```sql
CREATE VIEW active_users AS
SELECT id, first_name, country FROM users_user WHERE balance > 0
WITH CHECK OPTION;   -- balance를 0 이하로 만드는 UPDATE는 거부된다
```

### 시퀀스

겹치지 않는 번호를 `SELECT MAX(id) + 1`로 만들면 두 트랜잭션이 동시에 같은 값을 읽어 한쪽이 기본 키 충돌로 실패한다. 테이블을 잠그면 막을 수 있지만 그러면 모든 삽입이 한 줄로 선다. **시퀀스(sequence)** 는 테이블과 독립된 번호 생성기라 잠금 없이 동시에 번호를 내준다. Oracle·PostgreSQL에 있고, 컬럼에 `GENERATED ... AS IDENTITY`를 걸면 내부적으로 시퀀스가 만들어진다(MySQL `AUTO_INCREMENT`와 같은 자리).

```sql
CREATE SEQUENCE orders_seq
  START WITH 1 INCREMENT BY 1
  CACHE 100      -- 100개를 메모리에 미리 받아 둔다
  NOCYCLE;       -- 최댓값에 닿아도 처음으로 돌아가지 않는다

INSERT INTO orders (id, ...) VALUES (orders_seq.NEXTVAL, ...);
SELECT orders_seq.CURRVAL FROM dual;   -- 이 세션이 마지막으로 받은 값 (PostgreSQL은 nextval()·currval())
```

| 옵션 | 뜻 |
| --- | --- |
| `INCREMENT BY` | 증가 폭. 음수면 줄어든다 |
| `MINVALUE`·`MAXVALUE` | 범위 |
| `CYCLE`·`NOCYCLE` | 끝에 닿으면 처음으로 돌아갈지. 기본 키에 `CYCLE`을 쓰면 언젠가 충돌한다 |
| `CACHE n`·`NOCACHE` | 번호를 n개 미리 메모리에 받아 둘지. Oracle 기본값 20 |
| `ORDER` | Oracle RAC에서 인스턴스 사이에도 요청 순서대로 줄지 |

**시퀀스 번호에는 구멍이 생기고, 이것은 설계다.** 롤백된 트랜잭션이 받은 번호는 돌려주지 않고(돌려주려면 다른 세션을 기다리게 해야 한다), 캐시해 둔 번호는 재시작 때 버려지고, 인스턴스마다 캐시를 따로 받는 클러스터에서는 번호가 시간 순서와 어긋난다. 그래서 세금계산서 번호처럼 빠짐없는 연속 번호가 필요한 곳은 별도 채번 테이블과 잠금으로 처리한다. 여러 서버에서 번호를 만들어야 하면 [[distributed-unique-id|분산 고유 ID]]를 본다.

### 동의어

Oracle의 **동의어(synonym)** 는 객체의 별칭이다. 스키마 접두어를 숨겨 SQL을 짧게 하고, 원본을 다른 스키마나 원격 DB(DB 링크)로 옮겨도 동의어만 고치면 SQL은 그대로다. 동의어는 권한을 주지 않으므로 원본에 대한 `GRANT`가 따로 있어야 한다.

```sql
CREATE PUBLIC SYNONYM employees FOR hr.employees;
SELECT * FROM employees;     -- 누구나 hr. 없이 조회 (권한은 별도)
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

`COUNT`, `SUM`, `AVG`, `MAX`, `MIN`은 여러 행을 하나의 값으로 요약한다. 집계 함수는 NULL을 건너뛴다.

| 형태 | 세는 것 |
| --- | --- |
| `COUNT(*)` | 행 수. 값은 보지 않는다 |
| `COUNT(1)` | `COUNT(*)`와 같다. 모든 행에 대해 상수 1이 NULL이 아니므로 결과도 실행 계획도 같다 |
| `COUNT(col)` | `col`이 NULL이 아닌 행 수. 결과가 다를 수 있다 |
| `COUNT(DISTINCT col)` | NULL이 아닌 서로 다른 값의 수. 정렬이나 해시로 중복을 지워야 해 비싸다 |

`COUNT(*)`가 느린 이유는 행 수를 따로 저장하지 않기 때문이다. MVCC에서는 트랜잭션마다 보이는 행이 달라 「현재 행 수」가 하나로 정해지지 않으므로, InnoDB와 PostgreSQL은 실제로 행을 센다. InnoDB는 가장 작은 보조 인덱스를 훑어 세고, PostgreSQL은 가시성 맵이 깨끗하면 인덱스 전용 스캔으로 센다. 행 수를 테이블 메타데이터에 두는 MyISAM은 조건 없는 `COUNT(*)`가 즉시 끝난다. 정확한 값이 필요 없으면 통계의 추정치(`information_schema.TABLES.TABLE_ROWS`, `pg_class.reltuples`)나 별도 카운터 테이블을 쓴다. `GROUP BY`는 지정한 열 값이 같은 행끼리 묶어 그룹마다 집계한다. 그룹에 조건을 걸 때는 `WHERE`가 아니라 `HAVING`을 쓴다.

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

## 서브쿼리

**서브쿼리(subquery)** 는 SQL 문 안에 괄호로 넣은 또 하나의 `SELECT`다. 관계 연산의 결과는 다시 테이블이므로, 한 질의의 결과를 다른 질의의 재료로 쓸 수 있다.

| 위치 | 이름 | 돌려주는 것 | 예 |
| --- | --- | --- | --- |
| `WHERE`·`HAVING` | 중첩 서브쿼리 | 비교할 값이나 값 목록 | 평균보다 많이 받는 직원 |
| `FROM` | 인라인 뷰(파생 테이블) | 임시 테이블 | 부서별 평균을 먼저 내고 다시 조인 |
| `SELECT` 목록 | 스칼라 서브쿼리 | 행마다 값 하나 | 직원마다 부양가족 수 |

```sql
-- FROM: 부서 평균을 먼저 구한 뒤 조인
SELECT e.name, e.salary, d.avg_salary
FROM employee e
JOIN (SELECT dept_id, AVG(salary) AS avg_salary
      FROM employee GROUP BY dept_id) d ON d.dept_id = e.dept_id
WHERE e.salary > d.avg_salary;
```

서브쿼리가 몇 행을 돌려주느냐에 따라 앞에 올 연산자가 정해진다.

| 반환 | 연산자 | 주의 |
| --- | --- | --- |
| 한 행, 값 하나 | `=`, `<`, `>` 등 | 두 행 이상이 나오면 실행 중 오류다. 이름으로 찾았는데 동명이인이 있으면 터진다 |
| 여러 행 | `IN`, `NOT IN` | 목록 중 하나라도 같으면 / 하나도 같지 않으면 |
| 여러 행 | `> ANY`, `> ALL` | 최솟값보다 크면 / 최댓값보다 크면. 서브쿼리가 0행이면 `ALL`은 참이지만 `> (SELECT MAX(...))`는 NULL이라 결과가 다르다 |
| 존재 여부 | `EXISTS`, `NOT EXISTS` | 한 행이라도 있으면 참. 무엇을 `SELECT`하는지는 상관없다 |

**상관 서브쿼리(correlated subquery)** 는 바깥 행의 값을 참조해서, 개념적으로 바깥 행마다 다시 평가된다. 바깥 행이 100만 개면 100만 번 도는 셈이라 참조 컬럼에 인덱스가 없으면 아주 느리다. 옵티마이저가 조인으로 바꿔 주기도 하지만 늘 그렇지는 않으므로 실행 계획을 본다([[index-design|인덱스 설계와 쿼리 튜닝]]).

```sql
-- 자기 부서 평균보다 많이 받는 직원
SELECT e.name, e.salary
FROM employee e
WHERE e.salary > (SELECT AVG(x.salary) FROM employee x
                  WHERE x.dept_id = e.dept_id);   -- 바깥의 e를 참조
```

### EXISTS와 NOT IN의 NULL 함정

「20번 프로젝트에 참여하는 직원」은 `IN (SELECT employee_id ...)`로도, `EXISTS (SELECT 1 ... WHERE w.employee_id = e.id ...)`로도 쓴다. `EXISTS`는 맞는 행을 하나 찾으면 멈출 수 있어 예전에는 서브쿼리 결과가 클 때 유리했지만, 지금의 주요 DBMS는 둘 다 세미 조인으로 바꿔 비슷한 계획을 만드는 경우가 많다. 차이가 정말 나는 곳은 부정형이다.

```sql
-- 관리자로 지정된 적 없는 직원
SELECT name FROM employee
WHERE id NOT IN (SELECT manager_id FROM employee);   -- manager_id에 NULL이 하나라도 있으면 0행
```

`id NOT IN (3, 7, NULL)`은 `id <> 3 AND id <> 7 AND id <> NULL`이고, `id <> NULL`은 참도 거짓도 아닌 UNKNOWN이라 전체가 참이 될 수 없다(SQL의 3값 논리). 최고 경영자처럼 관리자가 없는 행 하나 때문에 결과가 텅 빈다. **부정 조건은 `NOT EXISTS`로 쓴다.** `NOT IN`을 꼭 쓰려면 서브쿼리에 `WHERE manager_id IS NOT NULL`을 붙인다.

```sql
SELECT name FROM employee e
WHERE NOT EXISTS (SELECT 1 FROM employee m WHERE m.manager_id = e.id);
```

「모든 프로젝트에 참여한 직원」처럼 「모두」를 묻는 질의는 SQL에 바로 대응하는 연산자가 없어 「참여하지 않은 프로젝트가 없다」는 이중 `NOT EXISTS`로 쓴다. 관계대수의 디비전(÷), 관계해석의 전칭 한정자(∀)에 해당한다([[sql-and-relational-algebra#관계해석|관계해석]]).

### 조인으로 바꿔 쓰기

| 서브쿼리 | 조인으로 |
| --- | --- |
| `IN`·`EXISTS` (있는 것) | 내부 조인. 한쪽에 여러 행이 맞으면 결과가 불어나 `DISTINCT`가 필요할 수 있다 |
| `NOT EXISTS` (없는 것) | `LEFT JOIN ... WHERE 오른쪽.키 IS NULL` (안티 조인) |
| 스칼라 서브쿼리 집계 | 미리 `GROUP BY`한 인라인 뷰를 `LEFT JOIN` |

```sql
-- 부양가족 수: 스칼라 서브쿼리 대신 먼저 집계하고 붙인다
SELECT e.name, COALESCE(d.cnt, 0) AS dependents
FROM employee e
LEFT JOIN (SELECT employee_id, COUNT(*) AS cnt
           FROM dependent GROUP BY employee_id) d ON d.employee_id = e.id;
```

`LEFT JOIN`이라야 부양가족이 없는 직원도 0으로 남는다. 여러 테이블을 먼저 조인하고 집계하면 행이 불어나 합계가 틀리므로 **먼저 집계하고 나중에 조인**한다. 어느 쪽이 정답인지는 없다. 읽기 쉬운 쪽으로 쓰고 느리면 실행 계획을 보고 바꾼다. 존재 여부만 필요하면 조인 뒤 `DISTINCT`보다 `EXISTS`가 의도가 분명하다.

## 저장 프로시저와 PL/SQL

**저장 프로시저(stored procedure)** 는 여러 SQL 문과 변수·조건문·반복문을 묶어 DB 안에 이름을 붙여 저장한 프로그램이다. 애플리케이션은 이름과 인자만 보내 호출한다.

```sql
-- MySQL
CREATE PROCEDURE transfer(IN from_id INT, IN to_id INT, IN amount INT)
BEGIN
  START TRANSACTION;
  UPDATE account SET balance = balance - amount WHERE id = from_id;
  UPDATE account SET balance = balance + amount WHERE id = to_id;
  COMMIT;
END;

CALL transfer(1, 2, 10000);
```

| 장점 | 단점 |
| --- | --- |
| 여러 쿼리를 한 번의 호출로 보내 네트워크 왕복이 준다 | 비즈니스 로직이 DB에 흩어져 버전 관리·코드 리뷰·테스트가 어렵다 |
| 실행 권한만 주고 테이블 직접 접근을 막을 수 있다 | 문법(PL/SQL, T-SQL, PL/pgSQL)이 DBMS마다 달라 이식성이 낮다 |
| 데이터 가까이에서 대량 처리를 한다 | 디버깅 도구가 빈약하고, DB 서버의 CPU를 쓰므로 확장이 어렵다 |

그래서 일반 웹 서비스는 로직을 애플리케이션에 두고, 프로시저는 대량 배치·정산처럼 데이터 가까이에서 돌아야 이득인 곳에 제한적으로 쓰는 경우가 많다.

DB 안의 절차형 언어는 DBMS마다 다르다. Oracle은 **PL/SQL**(Procedural Language extension to SQL), PostgreSQL은 PL/pgSQL, SQL Server는 T-SQL이다. 아래는 PL/SQL 기준이지만 구조는 서로 비슷하다.

### 블록과 변수

PL/SQL 코드는 모두 블록이다. `DECLARE`(선언, 선택) → `BEGIN`(실행, 필수) → `EXCEPTION`(예외 처리, 선택) → `END;` 순서다. 이름 없이 한 번 돌리는 것을 **익명 블록**, 이름을 붙여 DB에 저장한 것을 **서브프로그램**(프로시저·함수 등)이라 한다.

```sql
DECLARE
  v_total  orders.amount%TYPE;      -- 컬럼 타입을 그대로 따른다
  c_vat    CONSTANT NUMBER := 0.1;  -- 상수는 선언할 때 값을 준다
BEGIN
  SELECT SUM(amount) INTO v_total FROM orders WHERE customer_id = 42;
  DBMS_OUTPUT.PUT_LINE('부가세 포함: ' || v_total * (1 + c_vat));
EXCEPTION
  WHEN NO_DATA_FOUND THEN DBMS_OUTPUT.PUT_LINE('주문 없음');
END;
/
```

- `%TYPE`은 컬럼과 같은 타입, `%ROWTYPE`은 테이블 한 행 전체를 담는 레코드다. 테이블 정의가 바뀌어도 코드를 고치지 않는다.
- `SELECT ... INTO`는 결과가 **정확히 한 행**이어야 한다. 0행이면 `NO_DATA_FOUND`, 2행 이상이면 `TOO_MANY_ROWS`다. 여러 행은 커서나 `BULK COLLECT`로 받는다.
- SQL*Plus·SQL Developer에서 `DBMS_OUTPUT`을 보려면 `SET SERVEROUTPUT ON`을 먼저 켠다.

여러 값을 묶는 타입은 레코드(`RECORD`, 이름 붙은 필드 묶음), 최대 크기가 정해진 촘촘한 배열 `VARRAY`, 크기 제한이 없고 중간 원소를 지울 수 있는 중첩 테이블(`TABLE OF`), 문자열·정수 키로 찾는 메모리 안의 맵인 연관 배열(`TABLE OF ... INDEX BY VARCHAR2(20)`)이 있다.

### 제어문과 예외

```sql
IF v_total >= 100000 THEN v_grade := 'VIP';
ELSIF v_total >= 30000 THEN v_grade := 'GOLD';
ELSE v_grade := 'BASIC';
END IF;

CASE v_grade WHEN 'VIP' THEN v_rate := 0.1; WHEN 'GOLD' THEN v_rate := 0.05; ELSE v_rate := 0; END CASE;

LOOP v_i := v_i + 1; EXIT WHEN v_i > 10; END LOOP;
WHILE v_i <= 10 LOOP v_i := v_i + 1; END LOOP;
FOR i IN 1..10 LOOP NULL; END LOOP;   -- 거꾸로는 REVERSE 1..10. 3..1처럼 쓰면 한 번도 안 돈다
```

예외 처리부는 다른 언어의 `try ... catch`다. 처리하지 못한 예외는 바깥 블록을 거쳐 호출한 쪽으로 올라간다. 미리 정의된 예외로 `NO_DATA_FOUND`, `TOO_MANY_ROWS`, `DUP_VAL_ON_INDEX`(유니크 위반), `ZERO_DIVIDE`, `INVALID_NUMBER`(숫자 변환 실패), `CURSOR_ALREADY_OPEN`이 있다. 업무 규칙 위반은 `RAISE_APPLICATION_ERROR`로 -20000~-20999 번호와 메시지를 호출한 애플리케이션까지 보낸다.

```sql
IF v_stock < p_qty THEN
  RAISE_APPLICATION_ERROR(-20001, '재고 부족: ' || p_product_id);
END IF;
...
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;   -- 로그를 남기고 다시 던진다
```

`WHEN OTHERS THEN NULL;`처럼 모든 오류를 조용히 삼키면 장애가 숨는다.

### 커서

**커서(cursor)** 는 결과 집합 위를 움직이는 포인터로, 한 행씩 꺼내 행마다 다른 처리를 하게 해 준다.

| 종류 | 누가 여나 | 쓰는 법 |
| --- | --- | --- |
| 묵시적 커서 | Oracle이 DML과 `SELECT INTO`마다 자동으로 | 직전 문장 결과를 `SQL%ROWCOUNT`, `SQL%FOUND`, `SQL%NOTFOUND`로 본다 |
| 명시적 커서 | 개발자가 선언 | 선언 → `OPEN` → `FETCH` 반복(`EXIT WHEN c%NOTFOUND`) → `CLOSE`. 속성은 `%FOUND`, `%NOTFOUND`, `%ROWCOUNT`, `%ISOPEN` |

보통은 **커서 FOR 루프**를 쓴다. `OPEN`·`FETCH`·`CLOSE`와 변수 선언을 대신 해 주고 예외가 나도 커서를 닫는다.

```sql
BEGIN
  UPDATE orders SET status = 'CANCELLED'
  WHERE status = 'PENDING' AND created_at < SYSDATE - 7;
  DBMS_OUTPUT.PUT_LINE(SQL%ROWCOUNT || '건 취소');          -- 묵시적 커서

  FOR r IN (SELECT id, customer_id FROM orders WHERE status = 'LATE') LOOP
    notify_customer(r.customer_id, r.id);                    -- 커서 FOR 루프
  END LOOP;
END;
/
```

루프 안에서 SQL을 한 행씩 실행하면 PL/SQL 엔진과 SQL 엔진 사이를 행마다 오가서(문맥 전환) 수만 행이면 눈에 띄게 느리다. **한 문장 SQL(`UPDATE ... WHERE`, `INSERT ... SELECT`, `MERGE`)로 되면 그게 가장 빠르고**, 행마다 계산이 필요하면 `BULK COLLECT`로 묶어 받고 `FORALL`로 묶어 쓴다. 아주 큰 결과는 `FETCH ... BULK COLLECT INTO ... LIMIT 1000`으로 나눠 받아 PGA 메모리가 넘치지 않게 한다.

```sql
DECLARE
  TYPE id_list IS TABLE OF orders.id%TYPE;
  ids id_list;
BEGIN
  SELECT id BULK COLLECT INTO ids FROM orders WHERE status = 'LATE';
  FORALL i IN 1..ids.COUNT
    UPDATE orders SET status = 'NOTIFIED' WHERE id = ids(i);
END;
/
```

### 프로시저·함수·패키지·트리거

| 종류 | 무엇 | 호출 |
| --- | --- | --- |
| 프로시저(`PROCEDURE`) | 작업을 한다. 반환값은 없고 `OUT` 매개변수로 돌려줄 수 있다 | `EXEC 이름(...)`, 다른 블록에서 |
| 함수(`FUNCTION`) | 값 하나를 `RETURN`한다 | 식 안에서. 부작용이 없으면 `SELECT` 안에서도 |
| 패키지(`PACKAGE`) | 관련 프로시저·함수·변수를 묶는다. 명세(공개 인터페이스)와 본문(구현)을 나눈다 | `패키지.이름(...)` |
| 트리거(`TRIGGER`) | 테이블에 `INSERT`·`UPDATE`·`DELETE`가 일어나면 자동으로 돈다 | 직접 호출하지 않는다 |

매개변수 모드는 `IN`(기본, 호출자 → 서브프로그램, 안에서 못 바꾼다), `OUT`(서브프로그램 → 호출자), `IN OUT`(양쪽)이다.

```sql
CREATE OR REPLACE PROCEDURE place_order (
  p_product_id IN  products.id%TYPE,
  p_qty        IN  NUMBER,
  p_order_id   OUT orders.id%TYPE
) AS
  v_stock products.stock%TYPE;
BEGIN
  SELECT stock INTO v_stock FROM products
  WHERE id = p_product_id FOR UPDATE;          -- 재고 행을 잠근다
  IF v_stock < p_qty THEN
    RAISE_APPLICATION_ERROR(-20001, '재고 부족');
  END IF;
  UPDATE products SET stock = stock - p_qty WHERE id = p_product_id;
  INSERT INTO orders (id, product_id, qty)
  VALUES (orders_seq.NEXTVAL, p_product_id, p_qty)
  RETURNING id INTO p_order_id;
END;
/

CREATE OR REPLACE FUNCTION price_with_vat (p_price NUMBER)
RETURN NUMBER DETERMINISTIC AS
BEGIN
  RETURN ROUND(p_price * 1.1);
END;
/
SELECT name, price_with_vat(price) FROM products;
```

행 단위 트리거(`FOR EACH ROW`)는 바뀌기 전후 값을 `:OLD`, `:NEW`로 본다. 감사 로그나 파생 컬럼 유지에 쓴다.

```sql
CREATE OR REPLACE TRIGGER trg_price_history
AFTER UPDATE OF price ON products
FOR EACH ROW
BEGIN
  INSERT INTO price_history (product_id, old_price, new_price, changed_at)
  VALUES (:OLD.id, :OLD.price, :NEW.price, SYSTIMESTAMP);
END;
/
```

트리거는 코드를 읽어서는 보이지 않는 곳에서 돈다. 많아지면 「`UPDATE` 한 줄이 왜 느리지」, 「이 값은 누가 바꿨지」를 추적하기 어려우므로 꼭 DB 안에서 보장해야 하는 규칙에만 쓴다.

## 파라미터 바인딩과 Prepared Statement

애플리케이션에서 사용자 입력을 SQL 문자열에 이어 붙이면 **SQL 인젝션**이 생긴다. 입력이 `' OR '1'='1`이면 조건이 항상 참이 된다. 해결책은 SQL 틀과 값을 분리해 보내는 **파라미터 바인딩**이다.

```java
// 위험: 문자열 연결 (Statement)
stmt.executeQuery("SELECT * FROM users WHERE email = '" + email + "'");

// 안전: 자리표시자 + 바인딩 (PreparedStatement)
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE email = ?");
ps.setString(1, email);
ps.executeQuery();
```

| 구분 | Statement | Prepared Statement |
| --- | --- | --- |
| SQL과 값 | 하나의 문자열로 합친다 | 틀(`?`, `$1`, `:name`)을 먼저 보내고 값은 따로 보낸다 |
| 인젝션 | 직접 이스케이프하지 않으면 취약하다 | 값이 SQL 문법으로 해석되지 않아 안전하다 |
| 반복 실행 | 매번 파싱·계획 | 파싱(드라이버·DB에 따라 실행 계획까지)을 재사용할 수 있다 |

- 성능 이득은 부차적이다. 쿼리 시간은 대부분 행을 읽는 데 들고 파싱은 작은 몫이다. **인젝션 방어가 Prepared Statement를 쓰는 주된 이유**다.
- 바인딩할 수 있는 것은 **값**뿐이다. 테이블·컬럼 이름, `ORDER BY` 방향은 자리표시자로 못 넣으므로 허용 목록(allowlist)으로 검사한다.
- JPA·Prisma·Django ORM 같은 ORM과 쿼리 빌더는 기본적으로 바인딩을 쓴다. 원시 SQL 기능(`raw`, `$queryRawUnsafe`, 문자열 포매팅)에서 다시 위험해진다.

## 핵심 정리

- `INSERT / SELECT / UPDATE / DELETE` + `WHERE`가 CRUD의 전부다.
- `ORDER BY … LIMIT … OFFSET`으로 정렬·페이지네이션, `GROUP BY` + 집계 함수로 요약.
- 서브쿼리는 `WHERE`(값·목록)·`FROM`(인라인 뷰)·`SELECT`(스칼라)에 들어간다. 부정 조건은 `NOT IN` 대신 `NOT EXISTS`로 쓴다.
- 절차형 로직은 PL/SQL 같은 블록으로 쓰되, 행 단위 루프보다 한 문장 SQL과 `BULK COLLECT`·`FORALL`을 먼저 고려한다.
- 같은 쿼리를 Django ORM으로 쓰는 법은 [[orm-queryset|Django ORM과 QuerySet]]에 대응표로 있다.

관련 노트: [[sql-and-relational-algebra|관계대수와 DB 설계]], [[transaction|트랜잭션과 회복]], [[dbeaver|DBeaver에서 SQL로 데이터 다루기]], [[database-internals|DB 내부 구조]], [[index-design|인덱스 설계와 쿼리 튜닝]], [[distributed-unique-id|분산 고유 ID]]

참고: [W3Schools SQL](https://www.w3schools.com/sql/)
