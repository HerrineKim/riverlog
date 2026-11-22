---
title: "System Design Primer 개념 지도"
concept: "System Design Primer"
summary: "System Design Primer의 주제(트레이드오프, DNS·CDN·로드 밸런서, DB, 캐시, 비동기, 통신, 보안, 설계 사례 8개, 객체 지향 설계 6개)가 창고의 어느 개념 노트에 있는지 잇는 지도."
tags: ["backend", "system-design", "architecture", "distributed-systems", "learning"]
source: other
date: "2026-11-15"
sources: ["https://github.com/donnemartin/system-design-primer", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/README.md"]
---

> Donne Martin의 「[The System Design Primer](https://github.com/donnemartin/system-design-primer)」의 목차를 창고의 개념 노트에 연결한 지도다. 원본 라이선스는 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)이고, 기준 커밋은 [`ae9bbd7b02d9`](https://github.com/donnemartin/system-design-primer/tree/ae9bbd7b02d90b9866215de185217d33f39ab733)다.

## System Design Primer란

System Design Primer는 대규모 시스템 설계의 핵심 개념, 해설이 붙은 설계 문제 8개, 객체 지향 설계 문제 6개, 읽을거리 목록을 한 저장소에 묶은 학습 자료다. 시스템 설계는 **요구 사항, 성능, 가용성, 일관성, 확장성, 운영 제약을 한꺼번에 비교하는 일**이고 정답 하나가 아니라 비용·복잡도·품질 목표 사이의 선택이 남는다. 개념 설명은 주제별 노트에 있고, 이 노트는 어느 주제가 어디에 있는지만 가리킨다.

## 주제 → 개념 노트

| Primer의 주제 | 다루는 것 | 창고의 노트 |
| --- | --- | --- |
| 성능과 확장성, 지연과 처리량, 가용성과 일관성(CAP) | 품질 속성과 트레이드오프, 설계 진행 순서 | [[system-design-fundamentals\|시스템 설계의 품질 속성과 트레이드오프]] |
| 일관성 패턴 | 약한·최종·강한 일관성 | [[distributed-data-patterns\|데이터 관리 패턴]], [[distributed-time-and-failure\|분산 시스템의 시간과 장애]] |
| 가용성 패턴 | 장애 조치(주-백업, 주-주), 복제, 가용성 숫자 | [[high-availability-redundancy\|고가용성 이중화 구조와 장애 감지]] |
| DNS | 이름 해석, TTL과 캐시, DNS 기반 라우팅 | [[dns\|DNS]] |
| CDN | 푸시 CDN과 풀 CDN, 캐시 무효화 | [[cdn\|CDN]] |
| 로드 밸런서 | L4와 L7, 분산 알고리즘, 헬스 체크, 수평 확장 | [[load-balancer\|로드 밸런서]] |
| 리버스 프록시 | 요청 대리, TLS 종료, 압축, 정적 파일 | [[proxy\|프록시]], [[web-server-and-nginx\|웹 서버, WAS, 그리고 Nginx]] |
| 애플리케이션 계층 | 웹 계층과 앱 계층 분리, 마이크로서비스, 서비스 디스커버리 | [[web-scalability-components\|웹 확장성의 구성 요소]], [[microservices-architecture\|마이크로서비스 아키텍처]] |
| 데이터베이스 | 복제, 페더레이션, 샤딩, 반정규화, SQL 튜닝, SQL과 NoSQL 고르기 | [[database-scaling\|데이터베이스 확장과 성능 최적화]], [[database-sharding\|데이터베이스 샤딩]], [[database-selection\|용도별 데이터베이스와 고르는 법]] |
| 캐시 | 캐시 위치, cache-aside·write-through·write-behind·refresh-ahead | [[caching-strategies\|캐시 전략]], [[cache-cluster-operations\|캐시 클러스터 운영과 장애 대응]] |
| 비동기 처리 | 메시지 큐, 작업 큐, 배압 | [[message-queue-kafka\|메시지 큐와 Kafka]], [[resiliency-patterns\|장애 확산을 막는 복원력 패턴]] |
| 통신 | TCP, UDP, HTTP, RPC, REST | [[transport-layer\|전송 계층: 포트, TCP, UDP]], [[http\|HTTP 프로토콜]], [[grpc\|gRPC]], [[rest-api\|REST API 설계]], [[api-architectural-styles\|API 아키텍처 스타일]] |
| 보안 | 전송·저장 암호화, 입력 검증, 인증과 인가, XSS·SQL 인젝션·CSRF | [[secure-system-design\|보안 시스템 설계]], [[api-security\|API 보안 체크리스트]], [[web-security\|웹 보안: CSRF와 XSS]] |
| 부록 | 2의 거듭제곱 표, 연산별 지연 시간 숫자 | [[system-design-fundamentals\|어림셈과 단위 환산]], [[backend-latency-optimization\|백엔드 지연 시간 줄이기]] |

## 설계 사례 8개

원본의 설계 문제는 정답 아키텍처가 아니라 **같은 설계 절차를 서로 다른 읽기·쓰기·처리량·정합성 조건에 적용해 보는 실습**이다. 절차는 사용 사례와 범위 정하기, 트래픽·데이터 양 어림하기, 기본 구성 그리기, 병목 찾아 대안 비교하기 순이다([[system-design-fundamentals|설계 진행 순서]]).

| 사례 | 기본 요구 사항 | 핵심 설계 선택 | 창고의 노트 | 원본 |
| --- | --- | --- | --- | --- |
| Pastebin(또는 Bit.ly) | 텍스트를 올리면 무작위 링크 발급, 만료, 조회, 분석 | 키 생성과 충돌, 저장 규모, 만료, 읽기 집중 | [[url-shortener-design\|URL 단축기 설계]] | [해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/pastebin/README.md) |
| Twitter 타임라인과 검색 | 게시물 쓰기, 홈·사용자 타임라인, 검색, 알림 | 팬아웃 방식, 팔로워가 많은 계정, 검색 색인 | [[news-feed-design\|뉴스 피드 설계]] | [해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/twitter/README.md) |
| 웹 크롤러 | URL 수집, 중복 방지, 역색인, 재방문 | 크롤링 속도, 중복 판정, 신선도 | [[web-crawler-at-scale\|대규모 웹 크롤러 설계]], [[web-search-engine\|웹 검색엔진의 동작]] | [해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/web_crawler/README.md) |
| Mint.com | 금융 계정 연결, 거래 수집·분류, 예산 추천 | 외부 데이터 동기화를 비동기로 처리, 보안, 분류 갱신 | - | [해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/mint/README.md) |
| 소셜 네트워크 그래프 | 친구 관계 저장, 두 사람 사이 최단 연결 경로 | 가중치 없는 그래프의 BFS, 여러 서버에 나뉜 그래프 탐색 | [[search-engine-basics\|검색엔진의 원리]]의 그래프 검색 | [해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/social_graph/README.md) |
| 검색엔진의 질의 캐시(키-값 저장소) | 인기 질의의 캐시 적중과 미스 처리, 캐시 확장 | 교체 정책(LRU), 갱신, 분산 캐시 | [[caching-strategies\|캐시 전략]] | [해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/query_cache/README.md) |
| 카테고리별 판매 순위 | 지난 기간의 카테고리별 인기 상품 | 로그 배치 집계(MapReduce), 정확성과 응답 지연 | [[trending-topics\|실시간 트렌딩과 Top-K 집계]](스트림 방식) | [해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/sales_rank/README.md) |
| AWS에서 수백만 사용자까지 | 서버 한 대에서 부하에 따라 단계적으로 확장 | 병목 측정, 정적 자산 분리, DB 분리·복제, 로드 밸런서, 오토스케일링 | [[web-scalability-components\|웹 확장성의 구성 요소]] | [해설](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/scaling_aws/README.md) |

원본이 풀이 없이 링크만 모아 둔 추가 질문 가운데 창고에 노트가 있는 것은 다음과 같다: 채팅([[chat-system-design|채팅 시스템 설계]]), 사진 공유([[photo-sharing-design|사진 공유 서비스 설계]]), 문서 공동 편집([[collaborative-editing|실시간 공동 편집]]), 트렌딩 토픽([[trending-topics|실시간 트렌딩과 Top-K 집계]]), 무작위 ID 생성([[distributed-unique-id|분산 환경의 고유 ID 생성]]), API 레이트 리미터([[api-security|API 보안 체크리스트]]), 온라인 멀티플레이 게임([[multiplayer-game-server|멀티플레이 게임 서버 설계]]), 키-값 저장소([[redis|Redis]]).

## 객체 지향 설계 6개

객체 지향 설계(OOD) 문제는 서비스의 네트워크 구조가 아니라 **도메인 객체가 어떤 책임과 협력을 갖는지**를 묻는다. 풀이 순서와 되풀이되는 설계 부품은 [[ood-interview-approach|객체 지향 설계 면접: 풀이 순서와 반복되는 설계 부품]]에 있다.

| 문제 | 설계 초점 | 원본 |
| --- | --- | --- |
| 해시 맵 | 키·버킷·충돌 처리를 숨기는 자료구조 인터페이스 | [노트북](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/object_oriented_design/hash_table/hash_map.ipynb) |
| LRU 캐시 | 조회와 최근 접근 순서를 함께 유지 | [노트북](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/object_oriented_design/lru_cache/lru_cache.ipynb) |
| 콜센터 | 직원 등급, 대기열, 상담 요청의 책임 분리 | [노트북](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/object_oriented_design/call_center/call_center.ipynb) |
| 카드 덱 | 카드, 덱, 게임 규칙의 분리 | [노트북](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/object_oriented_design/deck_of_cards/deck_of_cards.ipynb) |
| 주차장 | 차량, 층, 주차 자리의 제약 모델링 | [노트북](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/object_oriented_design/parking_lot/parking_lot.ipynb) |
| 온라인 채팅 | 사용자, 대화방, 메시지, 상태 관리 | [노트북](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/object_oriented_design/online_chat/online_chat.ipynb) |

## 원문의 읽을거리

- 풀이 없는 추가 설계 질문, 실전 시스템(MapReduce, Bigtable, Dynamo, Spanner 등)의 논문·발표 자료, 기업별 아키텍처 사례, 기업 엔지니어링 블로그 목록은 [원문 README](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/README.md#additional-system-design-interview-questions)의 「Additional system design interview questions」부터 「Company engineering blogs」까지에 있다.
- 복습용 [Anki 카드](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/README.md#anki-flashcards)도 원문 저장소에 있다.

## 학습 순서

1. 성능·지연·가용성과 네트워크·저장소·캐시의 정의를 먼저 이해한다.
2. 문제의 사용 사례, 데이터 크기, 읽기·쓰기 비율, 장애 목표를 숫자로 적는다.
3. 사례 8개를 직접 설계한 뒤 원본 해설과 비교한다. 답을 외우기보다 여러 사례에 공통된 병목과 트레이드오프를 비교한다.
4. 단위 계산, 상태 일관성, 병목, 재시도와 중복 처리, 보안, 운영 비용까지 검증한다.

관련 노트: [[system-design-fundamentals|시스템 설계의 품질 속성과 트레이드오프]], [[web-scalability-components|웹 확장성의 구성 요소]], [[distributed-system-patterns|분산 시스템 패턴]], [[system-design-choices|시스템 설계의 선택지와 흔한 문제의 해법]]
