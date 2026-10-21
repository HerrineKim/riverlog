---
title: "Backend"
concept: "Backend"
summary: "클라이언트의 요청을 받아 비즈니스 로직을 처리하고 데이터를 저장·제공하는 서버 쪽 개발 지식 모음."
tags: ["backend", "http", "api", "database"]
source: mixed
date: "2026-10-14"
---

백엔드는 프론트엔드가 보낸 HTTP 요청을 받아 인증·검증·비즈니스 로직을 수행하고, 데이터베이스에 저장하거나 조회한 결과를 응답으로 돌려주는 영역이다. 이 분야의 노트는 "웹 기초(HTTP·REST) → 프레임워크(Express → NestJS, Django) → 데이터베이스 → 아키텍처" 순서로 읽으면 자연스럽다. Express에서 미들웨어·라우터·서비스 분리를 직접 손으로 짜 보고, 같은 개념이 NestJS에서 데코레이터와 DI로 어떻게 구조화되는지 비교하면 이해가 빠르다.

## 하위 주제

먼저 전체 지도를 보려면 [백엔드 개발자가 알아야 할 것](Backend/backend-developer-roadmap.md): 인터넷·HTTP·DB·API 스타일·배포·보안까지 영역별 핵심 질문과 관련 노트.

테스트 전략은 [백엔드 테스트: 범위, 대역, 구조, 자동화](/knowledge/dictionary/backend/backend-testing): 프레임워크 없는 단위 테스트, Testcontainers·LocalStack, 테스트 구조와 CI 자동화.

### Web-Basics

- [웹 앱의 요청·응답 구조](/knowledge/dictionary/backend/web-basics/http-web-architecture): 브라우저·프론트 서버·API 서버·DB의 요청 흐름과 포트
- [REST API 설계](/knowledge/dictionary/backend/web-basics/rest-api): REST의 여섯 제약, URI 규칙, 멱등 키·버전·일괄 처리
- [API 아키텍처 스타일: SOAP·REST·GraphQL·gRPC·WebSocket·Webhook](/knowledge/dictionary/backend/web-basics/api-architectural-styles): 여섯 스타일의 통신 방식과 고르는 기준
- [GraphQL](/knowledge/dictionary/backend/web-basics/graphql): 타입 스키마, 쿼리·뮤테이션·구독, 리졸버와 N+1
- [gRPC](/knowledge/dictionary/backend/web-basics/grpc): .proto 계약과 스텁, 네 가지 호출 방식, REST와 비교
- [웹훅과 폴링](/knowledge/dictionary/backend/web-basics/webhook): 변화를 묻는 쪽과 알리는 쪽, 서명 검증·재시도·멱등 처리
- [API 페이지네이션](/knowledge/dictionary/backend/web-basics/api-pagination): 오프셋·페이지 번호·커서·키셋·시간 기반·혼합 방식 비교
- [API 테스트의 종류](/knowledge/dictionary/backend/web-basics/api-testing): 스모크·기능·통합·회귀·부하·스트레스·보안·퍼즈 테스트
- [CORS](/knowledge/dictionary/backend/web-basics/cors): 다른 출처의 호출을 허용하는 브라우저 보안 정책
- [API 보안 체크리스트](/knowledge/dictionary/backend/web-basics/api-security): 전송·입력·인증과 인가·노출 범위·운영 단계별 점검 항목
- [API 키와 HMAC 요청 서명](/knowledge/dictionary/backend/web-basics/api-request-signing): 서버 간 호출의 발신자·무결성 증명, 타임스탬프와 재전송 방지
- [세션 기반 인증과 토큰 기반 인증](/knowledge/dictionary/backend/web-basics/session-vs-token-auth): 세션과 JWT 비교, 토큰 탈취 대책과 선택 기준
- [2단계 인증: TOTP와 패스키](/knowledge/dictionary/backend/web-basics/two-factor-totp-passkey): 공유 비밀 키와 시각으로 만드는 6자리 코드, 공개키 기반 패스키
- [비밀번호 저장과 비밀번호 관리자](/knowledge/dictionary/backend/web-basics/password-storage): 솔트와 느린 해시(Argon2id·bcrypt), 비밀번호 관리자
- [인코딩·암호화·해시·토큰화와 디지털 서명](/knowledge/dictionary/backend/web-basics/encoding-encryption-hashing): 목적별 데이터 변환 구분, 대칭·비대칭 암호화, 서명
- [Base64 인코딩](/knowledge/dictionary/backend/web-basics/base64-encoding): 6비트 변환 원리, 패딩, 33% 커지는 비용
- [텔레그램 미니앱 인증 흐름](/knowledge/dictionary/backend/web-basics/telegram-mini-app-auth): initData HMAC 검증 뒤 자체 세션·JWT 발급
- [웹 서버, WAS, 그리고 Nginx](/knowledge/dictionary/backend/web-basics/web-server-and-nginx): 웹 서버와 WAS의 역할 분담, 리버스 프록시, Nginx 마스터-워커 구조
- [스프링의 싱글톤 빈과 요청 스레드](/knowledge/dictionary/backend/web-basics/spring-singleton-thread-safety): 스레드 풀과 공유 빈, 상태 없는 빈
- [스프링 애플리케이션 설계: DI, 프록시 트랜잭션, 멀티모듈, WebFlux](/knowledge/dictionary/backend/web-basics/spring-application-design): 생성자 주입, @Transactional 프록시 함정, 멀티모듈, WebFlux

### Express

- [Express 라우팅과 CRUD API](/knowledge/dictionary/backend/express/routing-crud): 서버 띄우기, Router로 경로 분리, REST CRUD
- [Express 미들웨어](/knowledge/dictionary/backend/express/express-middleware): 로깅·파싱·에러 처리를 맡는 함수 체인
- [Express 싱글톤 패턴과 서비스 패턴](/knowledge/dictionary/backend/express/singleton-service-pattern): 서버 클래스와 서비스 파일 분리
- [Express 프로젝트 구조: 3계층, 이벤트, DI, 로더](/knowledge/dictionary/backend/express/express-project-architecture): 라우트·서비스·데이터 접근 계층, 이벤트 발행, 의존성 주입, 로더
- [Koa: 미들웨어만 남긴 Node.js 웹 프레임워크](/knowledge/dictionary/backend/express/koa): 미들웨어와 ctx만 둔 코어, await next()의 양파 모델, 라우터·바디 파서 붙이기, 컨트롤러 분리
- [Node.js 런타임과 OS 차이 다루기](/knowledge/dictionary/backend/express/nodejs-runtime): Node.js의 강점, Deno·Bun, cross-env·path
- [Node.js 스트림: 데이터를 조각으로 흘려 처리하기](/knowledge/dictionary/backend/express/node-streams): Readable·Writable·Duplex·Transform, 흐름·일시정지 모드, 백프레셔와 highWaterMark, pipeline, for await

### NestJS

- [NestJS](Backend/NestJS.md): TypeScript 기반 구조화 프레임워크. Controller·Provider·Module, 요청 생명주기(미들웨어·파이프·인터셉터·필터), DTO, Repository, JWT 인증, Swagger, 파일 업로드

### Django

- [Django](Backend/Django.md): Python 풀스택 프레임워크. MTV, URL·템플릿, Model·ORM, 관계, Form, 인증, Admin

### Database

RDB와 NoSQL 중 무엇을 고를지는 [데이터베이스 모델](/knowledge/dictionary/computer-science/database/database-models)에서 먼저 본다.

- [SQL 기초](/knowledge/dictionary/backend/database/sql-basics): DDL·DML·DCL, 조회·집계·그룹화, 헷갈리는 문법
- [용도별 데이터베이스와 고르는 법](/knowledge/dictionary/backend/database/database-selection): OLTP·OLAP·검색·키-값·문서·그래프·시계열·벡터 DB와 선택 기준
- [DB 내부 구조: 쿼리 실행과 인덱스 자료 구조](/knowledge/dictionary/backend/database/database-internals): 파서·옵티마이저·실행기·버퍼 관리자, B+ 트리·LSM 트리
- [인덱스 설계와 쿼리 튜닝](/knowledge/dictionary/backend/database/index-design): 카디널리티, 복합 인덱스 순서, 인덱스를 못 타는 조건, EXPLAIN
- [DB 커넥션 풀](/knowledge/dictionary/backend/database/connection-pool): 풀 크기와 처리량, 대기 시간·타임아웃 설정
- [데이터베이스 확장과 성능 최적화](/knowledge/dictionary/backend/database/database-scaling): 인덱스·캐시·구체화된 뷰·복제·샤딩을 싼 것부터
- [데이터베이스 샤딩](/knowledge/dictionary/backend/database/database-sharding): 샤드 키와 라우팅 방식, 샤딩이 어렵게 만드는 것
- [분산 환경의 고유 ID 생성](/knowledge/dictionary/backend/database/distributed-unique-id): UUID, Snowflake, DB 자동 증가·세그먼트 방식 비교
- [JPA와 영속성 컨텍스트](/knowledge/dictionary/backend/database/jpa-persistence-context): 패러다임 불일치, 1차 캐시·변경 감지·쓰기 지연, 지연 로딩과 N+1
- [MongoDB 시작하기와 CRUD](/knowledge/dictionary/backend/database/mongodb): Atlas 설정, 기본 CRUD, Mongoose
- [Prisma: 커서로 이전·다음 항목 찾기와 CLI](/knowledge/dictionary/backend/database/prisma): cursor·skip·take, 자주 쓰는 CLI 명령
- [Flyway로 DB 마이그레이션 관리하기](/knowledge/dictionary/backend/database/flyway): 버전 붙은 SQL 파일로 스키마 변경 관리
- [Redis](/knowledge/dictionary/backend/database/redis): 캐시·세션·분산 락·랭킹·큐, 영속성(RDB·AOF)과 복제·센티널·클러스터
- [와이드 컬럼 DB와 대규모 메시지 저장](/knowledge/dictionary/backend/database/wide-column-database): 파티션 키·클러스터링 키, 조절 가능한 일관성, Cassandra·ScyllaDB
- [블록·파일·오브젝트 스토리지](/knowledge/dictionary/backend/database/block-file-object-storage): 세 저장 방식 비교, 오브젝트 스토리지와 이레이저 코딩
- [검색엔진의 원리: 역인덱스와 랭킹](/knowledge/dictionary/backend/database/search-engine-basics): 토큰화와 역인덱스, TF-IDF·BM25, 한국어 형태소 분석
- [Elasticsearch와 ELK 스택](/knowledge/dictionary/backend/database/elasticsearch): Lucene 기반 분산 검색·분석 엔진, 인덱스·샤드·세그먼트, ELK 로그 파이프라인
- [웹 검색엔진의 동작: 크롤링, 색인, 랭킹, 질의 처리](/knowledge/dictionary/backend/database/web-search-engine): URL 프런티어, PageRank, 샤딩된 역인덱스, 질의 처리

### Architecture

**기초·품질 속성**

- [웹 확장성의 구성 요소: 한 장으로 보는 웹 아키텍처](/knowledge/dictionary/backend/architecture/web-scalability-components): 3-Tier·MSA·확장의 세 축·캐시·메시지 큐
- [시스템 설계의 품질 속성과 트레이드오프](/knowledge/dictionary/backend/architecture/system-design-fundamentals): 확장성·가용성·신뢰성·성능과 다섯 가지 트레이드오프
- [시스템 설계의 선택지와 흔한 문제의 해법](/knowledge/dictionary/backend/architecture/system-design-choices): 수직·수평 확장, SQL·NoSQL, 배치·스트림, 일관성 수준 등 양자택일 모음
- [대규모 서비스 기술 스택 해부](/knowledge/dictionary/backend/architecture/big-tech-stack-anatomy): Netflix·Uber·Reddit·Twitter 스택을 계층별로 비교
- [개발자 머피의 법칙: 백엔드 방어 체크리스트](/knowledge/dictionary/backend/architecture/backend-murphys-law): 클라이언트 값 불신, 서버 재계산, 입력 범위 제한, 운영 권한 통제

**확장·성능·캐시**

- [로드 밸런서](/knowledge/dictionary/backend/architecture/load-balancer): 분산·헬스 체크·TLS 종료·세션 고정, L4·L7, 분산 알고리즘
- [캐시 전략: 계층, 읽기·쓰기 패턴, 교체 정책, 장애 패턴](/knowledge/dictionary/backend/architecture/caching-strategies): cache-aside·write-through, LRU·LFU 교체 정책, 동시 만료·관통·핫 키 같은 장애
- [캐시 클러스터 운영과 장애 대응](/knowledge/dictionary/backend/architecture/cache-cluster-operations): 노드 장애 감지, 동기화 중 복제본 제외, 쏠림 방지
- [백엔드 지연 시간 줄이기: 숫자 감각과 기법](/knowledge/dictionary/backend/architecture/backend-latency-optimization): 연산별 지연 자릿수, 인덱스·캐시·풀·비동기·압축
- [빠르고 유지보수하기 좋은 DB 조회 패턴](/knowledge/dictionary/backend/architecture/db-fetching-patterns): 직렬 조회 → 배치 → 병렬 → 요청 단위 캐시
- [비동기 서버의 이벤트 루프와 Reactor 패턴](/knowledge/dictionary/backend/architecture/event-loop-server): I/O 멀티플렉싱, NIO Selector, 이벤트 루프
- [대기열 시스템(가상 대기실) 설계](/knowledge/dictionary/backend/architecture/virtual-waiting-room): Redis Sorted Set 순번, 유입량 조절

**분산·메시징·데이터**

- [분산 시스템의 시간과 장애: 8가지 착각부터 논리 시계까지](/knowledge/dictionary/backend/architecture/distributed-time-and-failure): 비동기와 부분 장애, 분산 컴퓨팅의 8가지 착각, happened-before와 논리 시계, 합의·CRDT
- [분산 시스템의 통신·데이터 흐름 패턴](/knowledge/dictionary/backend/architecture/distributed-system-patterns): 요청-응답·발행-구독·경쟁 소비자·클레임 체크, 데이터 흐름 패턴
- [메시지 큐와 Kafka](/knowledge/dictionary/backend/architecture/message-queue-kafka): 큐 선택 기준, MQ → RabbitMQ → Kafka → Pulsar, 토픽·파티션·컨슈머 그룹
- [이벤트 기반 아키텍처 설계](/knowledge/dictionary/backend/architecture/event-driven-architecture): 이벤트 발행·구독으로 결합 낮추기, 이벤트 설계와 순서·중복 처리
- [데이터 관리 패턴: CDC, 이벤트 소싱, CQRS, 최종 일관성](/knowledge/dictionary/backend/architecture/distributed-data-patterns): 흩어진 데이터를 맞추는 패턴, 사가와 아웃박스

**복원력·가용성**

- [대규모 트래픽에서 서비스를 지키는 설계](/knowledge/dictionary/backend/architecture/high-traffic-resilience): CDN·정적 응답·서킷 브레이커로 급증 트래픽 버티기
- [장애 확산을 막는 복원력 패턴](/knowledge/dictionary/backend/architecture/resiliency-patterns): 타임아웃·재시도·서킷 브레이커·속도 제한·부하 차단·벌크헤드
- [고가용성 이중화 구조와 장애 감지](/knowledge/dictionary/backend/architecture/high-availability-redundancy): 나인으로 재는 가용성, 직렬·병렬 계산, 주-백업·주-주 구성, 하트비트

**아키텍처 스타일**

- [소프트웨어 아키텍처 패턴](/knowledge/dictionary/backend/architecture/software-architecture-patterns): 계층형·클라이언트-서버·이벤트 기반·마이크로커널·헥사고날
- [도메인 주도 설계(DDD)](/knowledge/dictionary/backend/architecture/domain-driven-design): 유비쿼터스 언어, 바운디드 컨텍스트, 애그리거트
- [마이크로서비스 아키텍처](/knowledge/dictionary/backend/architecture/microservices-architecture): 기능 단위 서비스 분리, 서비스별 데이터·배포, 운영 구성 요소
- [클라우드 설계 패턴](/knowledge/dictionary/backend/architecture/cloud-design-patterns): 발레 키, 큐 기반 부하 평준화, 파이프와 필터, 외부 설정 저장소, 헬스 엔드포인트, 연합 ID, 백그라운드 작업
- [아키텍처와 API 계층의 진화: 모놀리스에서 페더레이션까지](/knowledge/dictionary/backend/architecture/api-layer-evolution): 모놀리스 → 마이크로서비스 → 매크로서비스, BFF·GraphQL 페더레이션
- [API 게이트웨이](/knowledge/dictionary/backend/architecture/api-gateway): 라우팅·인증·레이트 리밋·응답 조합, 리버스 프록시·로드 밸런서와 차이
- [BFF (Backend For Frontend)](/knowledge/dictionary/backend/architecture/bff): 화면별 중간 서버로 API 묶기·가공, Next.js BFF

**보안**

- [보안 시스템 설계: 원칙과 민감 데이터 관리](/knowledge/dictionary/backend/architecture/secure-system-design): CIA, 계층별 보안 설계, 민감 데이터 분류·암호화·마스킹
- [권한 시스템 설계: ACL, RBAC, ABAC](/knowledge/dictionary/backend/architecture/access-control-models): 권한 모델 비교와 고르는 기준
- [인증·인가 로직은 어디에 두나](/knowledge/dictionary/backend/architecture/auth-placement): 필터·인터셉터·메서드 보안, API 게이트웨이에서 토큰 검증

**사례별 설계**

- [결제 시스템 설계: 흐름, 멱등성, 대사, 핫스팟 계정](/knowledge/dictionary/backend/architecture/payment-system): PSP·지갑·원장, 멱등 키, 대사
- [카드 결제망과 간편결제](/knowledge/dictionary/backend/architecture/card-payment-network): 승인·매입·정산, 발급사·매입사·카드 네트워크·PG
- [자금 이동: 청산과 결제](/knowledge/dictionary/backend/architecture/money-movement): 정보 흐름과 자금 흐름, 청산과 결제(settlement)
- [알림 시스템 설계: 푸시·이메일·SMS와 실시간 메시지 전달](/knowledge/dictionary/backend/architecture/notification-system): 게이트웨이 → 분배 → 큐 → 채널 서비스, 재시도·중복 방지
- [채팅 시스템 설계: 연결, 접속 상태, 메시지 전달](/knowledge/dictionary/backend/architecture/chat-system-design): WebSocket 연결, 메시지 순서·저장, 접속 상태
- [실시간 웹소켓 서버 설계](/knowledge/dictionary/backend/architecture/realtime-websocket-server): 수만 연결 유지, 메시지 타입 설계, 부하 검증
- [위치 기반 서비스 설계: 지오해시, 쿼드트리, 지도](/knowledge/dictionary/backend/architecture/location-based-service): 격자 색인, 지오해시·쿼드트리, 지도 타일
- [라이브 스트리밍의 구조: 인코딩, 세그먼트, ABR, CDN](/knowledge/dictionary/backend/architecture/live-streaming): 인코딩·세그먼트·적응형 비트레이트·CDN 전송
- [이미지·동영상 처리 서버 설계](/knowledge/dictionary/backend/architecture/media-processing-pipeline): 사전 생성과 온디맨드 리사이징, 캐시·CDN, 트랜스코딩 파이프라인
- [실시간 공동 편집: OT와 CRDT](/knowledge/dictionary/backend/architecture/collaborative-editing): 연산 단위 전송, OT와 CRDT 비교
- [대규모 웹 크롤러 설계](/knowledge/dictionary/backend/architecture/web-crawler-at-scale): 예의 제약, 도메인 샤드 노드, 프런티어

배포·운영 자동화는 [DevOps](/knowledge/dictionary/devops)에서 다룬다. 이론적 배경은 [[Computer-Science/Network|네트워크]]와 [[Computer-Science/Database|데이터베이스]] 노트에 있다.
