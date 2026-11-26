---
title: "데이터 엔지니어링"
concept: "Data Engineering"
summary: "수집·적재·처리 파이프라인, 이벤트 로그, 분산 처리, 웹 크롤링."
tags: ["data-engineering","pipeline","data"]
source: mixed
date: "2026-11-26"
---

데이터 엔지니어링 노트는 데이터가 모여 쓰이기까지의 경로를 다룬다. 수집, 적재, 저장, 처리, 이벤트 로그 설계, 분산 처리, 웹에서 글을 거두는 크롤링이 여기 있다.

## 하위 노트

- [데이터 파이프라인과 저장소 용어](AI-Data/Data-Engineering/data-pipeline-basics.md): 수집 → 적재 → 저장 → 처리 → 활용, 단계별 도구 지도, 배치·스트림과 Lambda·Kappa, ETL·ELT, 웨어하우스·레이크·레이크하우스·데이터 메시
- [이벤트 로그 설계와 수집](AI-Data/Data-Engineering/event-log-design.md): 지표에서 거꾸로 설계, 기록 시점 기준·검증, 테이블 모양 로그, 스키마 공유, 에이전트 → 스트림 버퍼 → 원본·검색 인덱스, 수집 감시
- [분산 데이터 처리: MapReduce, Spark, SQL 엔진](AI-Data/Data-Engineering/distributed-data-processing.md): 빅데이터의 기준, RDD 계보·지연 실행·좁은/넓은 의존성, DataFrame·Spark SQL, Trino, Parquet
- [newspaper로 기사 본문 추출하기](AI-Data/Data-Engineering/newspaper-article-scraping.md): 사이트별 파서 없이 기사 제목·본문·메타데이터 추출, newspaper4k, Source로 기사 URL 모으기, 설정과 한계
- [네이버 블로그 크롤링](AI-Data/Data-Engineering/naver-blog-crawling.md): 검색 API로 글 목록, PostView 주소로 iframe 속 본문 받기, 선택자 변경·예외 처리 함정
- [웹 크롤링 전략: 정적·동적 판별과 수집 방식 고르기](AI-Data/Data-Engineering/web-scraping-strategy.md): 공식 API → 숨은 데이터 엔드포인트 → 헤드리스 브라우저 순으로 가벼운 방식 고르기
