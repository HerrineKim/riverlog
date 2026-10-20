---
title: "데이터베이스"
concept: "Database"
summary: "데이터 모델의 종류, 트랜잭션과 회복, 정규화, SQL과 관계대수에 관한 노트 모음."
tags: ["database", "sql", "transaction"]
source: notion
date: "2026-10-13"
---

데이터베이스는 의미 있게 구조화해 저장한 정보의 모음이고, 이를 관리하는 소프트웨어가 DBMS다. 어떤 모델로 데이터를 저장할지, 여러 사용자가 동시에 써도 데이터가 망가지지 않게 하려면 무엇이 필요한지가 이 분야의 핵심 질문이다.

- [데이터베이스 모델: RDB, NoSQL, NewSQL](Computer-Science/Database/database-models.md) — 관계형, NoSQL(문서·키-값·와이드 컬럼·그래프), NewSQL 비교
- [트랜잭션과 회복](Computer-Science/Database/transaction.md) — ACID, 병행 제어, 고립화 수준, 회복 기법
- [정규화와 반정규화](Computer-Science/Database/normalization.md) — 이상 현상, 함수 종속, 정규형 단계, 반정규화
- [관계대수와 DB 설계](Computer-Science/Database/sql-and-relational-algebra.md) — 관계대수 연산자와 카디널리티, DB 설계 단계, 스키마·인덱스
