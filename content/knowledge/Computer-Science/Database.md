---
title: "데이터베이스"
concept: "Database"
summary: "DBMS의 역할과 데이터 모델의 종류, 트랜잭션과 병행 제어·회복, 정규화, 관계대수와 ER 모델·DB 설계에 관한 노트 모음."
tags: ["database", "sql", "transaction"]
source: notion
date: "2026-10-31"
---

데이터베이스는 의미 있게 구조화해 저장한 정보의 모음이고, 이를 관리하는 소프트웨어가 DBMS다. SQL 문법, 인덱스 설계, 확장·샤딩 같은 실무 주제는 [[Backend|백엔드]] 분야의 데이터베이스 노트에 있다. 어떤 모델로 데이터를 저장할지, 여러 사용자가 동시에 써도 데이터가 망가지지 않게 하려면 무엇이 필요한지가 이 분야의 핵심 질문이다.

- [데이터베이스 모델: RDB, NoSQL, NewSQL](Computer-Science/Database/database-models.md): 파일 처리 시스템 대비 DBMS의 장점과 1·2·3계층 구조, 관계형(코드의 규칙), NoSQL(문서·키-값·와이드 컬럼·그래프, BASE·CAP), NewSQL 비교
- [트랜잭션과 회복](Computer-Science/Database/transaction.md): ACID, 동시 실행 문제, 스케줄의 직렬 가능성과 회복 가능성, 2PL·타임스탬프 순서, 고립화 수준과 MVCC, 잠금과 교착 예방, 회복 기법
- [정규화와 반정규화](Computer-Science/Database/normalization.md): 이상 현상, 함수 종속과 암스트롱 공리·속성 폐포, 정규형 단계(1NF~5NF), 무손실 분해와 종속성 보존, 반정규화
- [관계대수·관계해석과 DB 설계](Computer-Science/Database/sql-and-relational-algebra.md): 관계대수 연산자와 카디널리티, 관계해석(∃·∀), DB 설계 단계, ER 모델(일반화·특수화·집단화 포함)과 ERD를 테이블로 바꾸는 규칙, 스키마와 인스턴스, 3단계 스키마와 데이터 독립성
