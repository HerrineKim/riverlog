---
title: "시스템 설계 문제 8개: 요구사항과 핵심 선택"
concept: "System Design Cases"
summary: "Pastebin·피드·웹 크롤러·금융 데이터·소셜 그래프·캐시·상품 랭킹·AWS 확장 설계 예시."
tags: ["backend", "system-design", "architecture", "case-study", "scalability"]
source: other
date: "2026-11-15"
sources: ["https://github.com/donnemartin/system-design-primer", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/README.md", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/pastebin/README.md", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/twitter/README.md", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/web_crawler/README.md", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/mint/README.md", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/social_graph/README.md", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/query_cache/README.md", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/sales_rank/README.md", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/scaling_aws/README.md"]
---

> Donne Martin의 「[The System Design Primer](https://github.com/donnemartin/system-design-primer)」에 제시된 개념과 사례를 주제별로 재구성한 노트다. 원본 라이선스는 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)이다.

## 예시를 공부하는 목적

원본의 8개 설계 문제는 정답 아키텍처를 제공하는 것이 아니라 **같은 설계 절차를 서로 다른 읽기·쓰기·처리량·정합성 조건에 적용해 보는 실습**이다. 아래 링크는 각각의 요구사항·가정·구성도·스케일링 단계로 이어진다.

| 사례 | 기본 요구사항 | 핵심 설계 선택 | 원본 해설 |
| --- | --- | --- | --- |
| Pastebin / URL Shortener | 임의 링크 생성, 만료, 텍스트 저장, 조회, 분석 | 키 충돌·저장 규모·만료·읽기 집중 | [문제·해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/pastebin/README.md) |
| Twitter 피드와 검색 | 게시물 쓰기, 홈/사용자 타임라인, 검색, 알림 | 팬아웃 방식·핫 계정·검색 색인 | [문제·해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/twitter/README.md) |
| Web crawler | URL 수집·정규화, 중복 방지, 역색인, 재방문 | 크롤링 속도·로봇 정책·중복·신선도 | [문제·해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/web_crawler/README.md) |
| Mint.com | 금융 계정 연결, 거래 수집·분류, 예산 추천 | 외부 데이터 동기화·보안·분류 변경 | [문제·해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/mint/README.md) |
| Social network graph | 친구 관계의 저장과 사람 사이 최단 연결 경로 | 그래프 분할·비가중 BFS·연결성 | [문제·해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/social_graph/README.md) |
| Query cache / KV store | 검색 요청의 캐시 적중·미스와 캐시 확장 | 교체 정책·갱신·핫 쿼리·분산 캐시 | [문제·해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/query_cache/README.md) |
| Sales ranking by category | 카테고리별 지난 기간 상품 판매 순위 | 집계 배치·스트림·정확성·응답 지연 | [문제·해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/sales_rank/README.md) |
| Millions of users on AWS | 단일 서버에서 부하에 따라 단계적 확장 | 병목 측정, 정적 자산, DB 분리·복제, LB·오토스케일링 | [문제·해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/scaling_aws/README.md) |

## 문제를 풀 때의 공통 순서

1. 사용 사례를 정의하고 범위 밖 기능을 명확히 한다.
2. 트래픽·데이터 양·읽기/쓰기 비율 등 가정을 수치화한다.
3. 기본 구성에서 핵심 데이터 흐름을 검토한다.
4. 가장 먼저 커지는 병목을 예상하고 설계 대안을 비교한다.
5. 실패·재시도·중복 처리·보안·운영 관측성을 점검한다.

### 1. 링크 저장과 키 생성

짧은 링크나 붙여넣기 저장 서비스는 키 공간·충돌·만료·조회 편향이 주요 문제다. 유일성과 추측 가능성은 별도의 요구사항이다.

### 2. 피드·소셜 그래프

홈 피드와 사용자 피드는 읽기·쓰기 패턴이 다르다. 읽기 시 모으는 방식과 쓰기 시 배포하는 방식은 처리량·지연·팬아웃 비용을 바꾼다. 소셜 최단 연결은 그래프 탐색과 분산 저장의 문제로 연결된다.

### 3. 크롤러·검색

수집, 추출, 색인, 조회를 분리해 처리할 수 있다. URL 중복·페이지 갱신·도메인별 접근 속도와 실패 재시도를 명시한다.

### 4. 집계·금융·캐시

외부 계정 수집과 판매 순위 집계는 비동기 처리·정합성·갱신 주기를 결정한다. 캐시 설계에서는 적중률보다 **원본과의 정합성과 장애 시 동작**을 함께 점검한다.

### 5. 단계적 확장

단일 머신에서 시작해 정적 콘텐츠 분리, DB 분리, 읽기 복제, 부하 분산, 오토스케일링으로 확장할 수 있다. 매 단계는 **부하 테스트와 병목 측정**에 근거해 선택한다.

원문에 있는 사용자 수·QPS·용량 수치는 예제 시나리오의 가정이다. 실제 서비스나 클라우드 제품의 현재 성능으로 해석하지 않는다.

관련 노트: [[url-shortener-design|URL 단축 설계]], [[news-feed-design|피드 설계]], [[web-crawler-at-scale|웹 크롤러]], [[cache-cluster-operations|캐시 운영]]
