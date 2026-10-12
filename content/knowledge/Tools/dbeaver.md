---
title: "DBeaver에서 SQL로 데이터 다루기"
concept: "DBeaver"
summary: "여러 DBMS를 한 화면에서 다루는 무료 GUI 클라이언트 DBeaver의 특징, PostgreSQL 연결 방법, SQL 편집기로 데이터를 조회·수정하는 방법과 주의점."
tags: ["database", "sql", "tools"]
source: notion
date: "2026-10-12"
sources: ["https://riverkim.kr/189"]
---

**DBeaver**는 MySQL, PostgreSQL, Oracle, SQLite 등 여러 데이터베이스에 접속할 수 있는 무료 GUI 클라이언트다. 테이블을 표로 보며 직접 편집할 수도 있지만, 여러 행을 한 번에 바꾸거나 조건으로 수정할 때는 MySQL Workbench처럼 **SQL 편집기**에서 쿼리를 실행하는 편이 정확하다.

## 특징

- 무료 오픈소스(Apache License)이고 Windows·macOS·Linux에서 쓸 수 있다. 목표 자체가 "사용성"이라 UI가 잘 정리되어 있다.
- **JDBC 드라이버**(Java에서 DB에 접속하게 해 주는 API)가 있는 데이터베이스라면 대부분 연결할 수 있다. MySQL, PostgreSQL, SQLite, Oracle, DB2, SQL Server, Hive, Presto 등.
- ERD 보기, 데이터 내보내기·가져오기, DB 간 비교, 목(mock) 데이터 생성 같은 기능을 플러그인으로 더할 수 있다. 전체 기능은 [DBeaver Wiki](https://github.com/dbeaver/dbeaver/wiki)에 있다.

## PostgreSQL에 연결하기

1. [공식 사이트](https://dbeaver.io/)에서 OS에 맞는 설치 파일을 받아 설치한다.
2. 상단 메뉴 **데이터베이스 → 새 데이터베이스 연결**을 연다.
3. 목록에서 PostgreSQL을 고른다. 처음이면 드라이버를 내려받으라는 안내가 뜬다.
4. 접속 정보를 입력한다.

| 항목 | 넣을 값 |
| --- | --- |
| Host | DB 서버 주소. AWS RDS라면 콘솔의 엔드포인트 주소 |
| Port | PostgreSQL 기본값 5432 |
| Database | DB를 만들 때 정한 데이터베이스 이름 |
| Username / Password | DB를 만들 때 정한 계정. 팀 공용 DB라면 내부에서 공유받는다 |

5. **Test Connection**을 눌러 `Connected`와 서버 정보가 뜨면 성공이다. 저장하면 왼쪽 Database Navigator에 연결이 생긴다.

## SQL 편집기 열기

1. 왼쪽 **Database Navigator**에서 연결(Databases)을 펼친다.
2. 작업할 DB(또는 스키마)를 우클릭한다.
3. **SQL 편집기 → 새 SQL 편집기**(단축키 `Ctrl + ]`)를 연다.
4. 쿼리를 작성하고 실행한다.
   - `Ctrl + Enter`: 커서가 있는 문장 하나 실행
   - `Alt + X`: 스크립트 전체 실행

## 직접 수정할 때 주의할 점

- 기본 설정은 **자동 커밋(Auto-Commit)** 이라 `UPDATE`·`DELETE`가 실행 즉시 반영된다. 운영 DB에서는 툴바에서 수동 커밋 모드로 바꾸고, 결과를 확인한 뒤 커밋한다.
- 수정 전에 같은 `WHERE` 조건으로 `SELECT`를 먼저 실행해 대상 행 수를 확인한다.
- 접속 설정에서 연결 유형을 Production으로 지정해 두면 색으로 구분되고 실행 전 확인 창이 뜬다.

```sql
-- 1) 대상 확인
SELECT id, status FROM orders WHERE created_at < '2023-01-01' AND status = 'PENDING';
-- 2) 수정
UPDATE orders SET status = 'CANCELLED' WHERE created_at < '2023-01-01' AND status = 'PENDING';
```

외부 PC에서 클라우드 DB에 접속이 안 된다면 보안 그룹 설정을 확인한다: [AWS RDS 외부 접속 허용](/knowledge/dictionary/devops/rds-security-group). SQL 문법은 [SQL 기초](/knowledge/dictionary/backend/database/sql-basics) 참고.
