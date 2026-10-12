---
title: "RDBMS와 NoSQL"
concept: "RDBMS vs NoSQL"
summary: "데이터를 테이블과 SQL로 관리하는 관계형 DB와, 문서·키-값 등 다른 모델을 쓰는 NoSQL의 차이와 선택 기준."
tags: ["database", "sql", "nosql", "mongodb"]
source: til
date: "2026-10-12"
sources: ["https://riverkim.kr/175"]
---

데이터베이스는 데이터의 집합(저장소)이고, 이를 저장·관리하는 소프트웨어를 **DBMS(Database Management System)라고** 한다. DBMS는 데이터를 어떤 모델로 저장하고 다루느냐에 따라 크게 둘로 나뉜다.

## 비교

| | RDBMS (관계형) | NoSQL (Not Only SQL) |
| --- | --- | --- |
| 데이터 모델 | 행과 열로 된 **테이블**, 테이블 간 관계(외래 키) | **문서**(JSON/BSON), 키-값, 컬럼, 그래프 등 |
| 스키마 | 미리 정의된 고정 스키마 | 유연한 스키마(문서마다 구조가 달라도 됨) |
| 질의 언어 | SQL | DB마다 고유 API (MongoDB 쿼리 등) |
| 강점 | 정합성·트랜잭션, 복잡한 조인 | 스키마 변경이 잦은 데이터, 비정형·대용량, 수평 확장 |
| 예 | MySQL, PostgreSQL, SQLite | MongoDB(문서), Redis(키-값) |

## 무엇을 고를까

- 기준은 "**데이터가 테이블에 담기는 게 유리한가, 문서에 담기는 게 유리한가**"다.
- 스키마가 자주 바뀌거나 비정형 데이터를 많이 다루면 일반적으로 MongoDB 같은 문서형 DB가 유리하다.
- 데이터 간 관계가 많고 정합성이 중요하면(결제, 재고 등) RDBMS가 유리하다.
- 쇼핑몰·블로그처럼 특별한 요구가 없는 서비스는 어느 쪽으로도 만들 수 있다.
- "MongoDB가 쉽다"는 말은 문법이 JavaScript 객체와 비슷해 입문 장벽이 낮다는 뜻이지, 초보용/중급용의 구분은 아니다.

## PostgreSQL

PostgreSQL은 오픈소스 RDBMS로, 객체 지향 기능(사용자 정의 타입, 상속, 배열·JSON 컬럼 등)을 함께 갖춘 **객체관계형 DBMS(ORDBMS)로** 분류된다. 다만 지금은 대부분의 RDBMS가 객체 지향 기능을 받아들여 ORDBMS와 RDBMS를 굳이 구분하는 의미는 작다.

| | PostgreSQL | MySQL |
| --- | --- | --- |
| SQL 표준 지원 | 더 충실하다 | 상대적으로 덜 엄격하다 |
| 강점 | 복잡한 쿼리, 풍부한 기능·확장(JSONB, 전문 검색 등) | 단순한 CRUD가 빠르고 가볍다는 평가 |
| 인지도 | 북미·일본에서 특히 높다 | 국내 웹 서비스에서 오래 널리 쓰였다 |

글을 쓴 시점(2022) 기준의 일반적인 평가이고, 두 DB 모두 버전이 오르며 격차가 많이 줄었다. 기본 기능이 비슷해 서로 마이그레이션하기도 어렵지 않은 편이다. 로고의 코끼리 이름은 Slonik이다. GUI로 접속하는 방법은 [[dbeaver|DBeaver]] 노트에 있다.

## 접근 도구: ORM과 ODM

애플리케이션 코드에서는 DB를 직접 다루기보다 매핑 도구를 쓴다.

- **ORM**(Object-Relational Mapping): 테이블 ↔ 객체. 예: Django ORM, TypeORM, Prisma
- **ODM**(Object-Document Mapping): 문서 ↔ 객체. 예: Mongoose

## 핵심 정리

- RDBMS = 테이블 + SQL + 고정 스키마, NoSQL = 다양한 모델 + 유연한 스키마.
- 프로젝트의 데이터 구조와 정합성 요구에 맞춰 고른다.
- 이어서: [SQL 기초](Backend/Database/sql-basics), [MongoDB](Backend/Database/mongodb)

관련 노트: [[database-models|데이터베이스 모델: RDB, NoSQL, NewSQL]], [[transaction|트랜잭션과 회복]]
