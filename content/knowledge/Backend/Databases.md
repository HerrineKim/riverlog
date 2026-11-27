---
title: "데이터베이스"
concept: "Databases"
summary: "SQL과 저장소 선택, 인덱스와 확장, Redis·MongoDB·검색 엔진처럼 용도별로 데이터를 두고 운영하는 법."
tags: ["backend","database","sql"]
source: mixed
date: "2026-11-26"
---

데이터베이스 노트는 서비스가 데이터를 어디에 두고 어떻게 빨리 읽고 쓰는지를 다룬다. SQL, 용도별 저장소 선택, 인덱스와 확장, Redis·MongoDB·검색 엔진이 여기 있다. 트랜잭션과 정규화 같은 이론은 [Computer Science의 Database](Computer-Science/Database.md)에 있다.

## 하위 노트

- [SQL 기초](Backend/Databases/sql-basics.md): DDL·DML·DCL, 데이터 타입·별칭·조회 결과로 테이블 만들기, 뷰·시퀀스, 조회·집계·그룹화, 서브쿼리와 NOT IN 함정, 저장 프로시저와 PL/SQL
- [용도별 데이터베이스와 고르는 법](Backend/Databases/database-selection.md): OLTP·OLAP·검색·키-값·문서·그래프·시계열·벡터 DB와 선택 기준
- [DB 내부 구조: 쿼리 실행과 인덱스 자료 구조](Backend/Databases/database-internals.md): 파서·옵티마이저·실행기·버퍼 관리자, Oracle의 SGA·PGA·백그라운드 프로세스와 테이블스페이스, B+ 트리·LSM 트리
- [인덱스 설계와 쿼리 튜닝](Backend/Databases/index-design.md): 카디널리티, 복합 인덱스 순서, 인덱스를 못 타는 조건, EXPLAIN
- [DB 커넥션 풀](Backend/Databases/connection-pool.md): 풀 크기와 처리량, 대기 시간·타임아웃 설정
- [데이터베이스 확장과 성능 최적화](Backend/Databases/database-scaling.md): 인덱스·캐시·구체화된 뷰·복제·파티셔닝·샤딩을 싼 것부터
- [데이터베이스 샤딩](Backend/Databases/database-sharding.md): 샤드 키와 라우팅 방식, 샤딩이 어렵게 만드는 것
- [분산 환경의 고유 ID 생성](Backend/Databases/distributed-unique-id.md): UUID, Snowflake, DB 자동 증가·세그먼트 방식 비교
- [JPA와 영속성 컨텍스트](Backend/Databases/jpa-persistence-context.md): 패러다임 불일치, 1차 캐시·변경 감지·쓰기 지연, 지연 로딩과 N+1
- [MongoDB 시작하기와 CRUD](Backend/Databases/mongodb.md): 스키마·콜레이션·CRUD·집계, Atlas와 자체 설치 보안, 쓰기 내구성, Mongoose, 샤딩
- [Prisma: 커서로 이전·다음 항목 찾기와 CLI](Backend/Databases/prisma.md): cursor·skip·take, 자주 쓰는 CLI 명령
- [Flyway로 DB 마이그레이션 관리하기](Backend/Databases/flyway.md): 버전 붙은 SQL 파일로 스키마 변경 관리
- [Redis](Backend/Databases/redis.md): 캐시·세션·분산 락·랭킹·큐, 영속성(RDB·AOF)과 복제·센티널·클러스터
- [와이드 컬럼 DB와 대규모 메시지 저장: Cassandra·ScyllaDB](Backend/Databases/wide-column-database.md): 파티션 키·클러스터링 키, 조절 가능한 일관성, Cassandra·ScyllaDB
- [블록·파일·오브젝트 스토리지](Backend/Databases/block-file-object-storage.md): 세 저장 방식 비교, 오브젝트 스토리지와 이레이저 코딩
- [검색엔진의 원리: 역인덱스와 랭킹](Backend/Databases/search-engine-basics.md): 토큰화와 역인덱스, TF-IDF·BM25, 한국어 형태소 분석
- [Elasticsearch와 ELK 스택](Backend/Databases/elasticsearch.md): Lucene 기반 분산 검색·분석 엔진, 인덱스·샤드·세그먼트, 노드 역할·복제·일관성, ILM·데이터 티어·스냅숏, 운영 진단(429·디스크 워터마크), ELK 로그 파이프라인
- [Elasticsearch 검색: 매핑·분석기·Query DSL](Backend/Databases/elasticsearch-search.md): 동적·명시적 매핑과 nested, 분석기, Query DSL(match·term·bool·multi_match), BM25·부스팅, 집계, search_after·PIT 페이지네이션
- [웹 검색엔진의 동작: 크롤링, 색인, 랭킹, 질의 처리](Backend/Databases/web-search-engine.md): URL 프런티어, PageRank, 샤딩된 역인덱스, 질의 처리
