---
title: "시스템 아키텍처"
concept: "System Architecture"
summary: "품질 속성과 트레이드오프, 확장·캐시, 분산 시스템, 복원력, 아키텍처 스타일, 보안, 사례별 설계."
tags: ["backend","architecture","system-design"]
source: mixed
date: "2026-11-26"
---

시스템 아키텍처 노트는 서버 한 대의 코드를 넘어, 서비스를 어떻게 나누고 얼마나 버티게 할지를 다룬다. 품질 속성과 트레이드오프에서 시작해 확장·캐시, 분산 시스템, 복원력, 아키텍처 스타일, 보안, 사례별 설계로 이어진다. 프론트엔드 코드 구조는 [Frontend의 Architecture](Frontend/Architecture.md)에 있다.

## 하위 노트

- [웹 확장성의 구성 요소: 한 장으로 보는 웹 아키텍처](Backend/System-Architecture/web-scalability-components.md): 3-Tier·MSA·확장의 세 축·캐시·메시지 큐
- [System Design Primer 개념 지도](Backend/System-Architecture/system-design-primer.md): Primer의 주제(트레이드오프·DNS·CDN·LB·DB·캐시·비동기·통신·보안)와 설계 사례 8개, 객체 지향 설계 6개를 창고의 개념 노트로 잇는 지도
- [시스템 설계의 품질 속성과 트레이드오프](Backend/System-Architecture/system-design-fundamentals.md): 확장성·가용성·신뢰성·성능과 다섯 가지 트레이드오프
- [시스템 설계의 선택지와 흔한 문제의 해법](Backend/System-Architecture/system-design-choices.md): 수직·수평 확장, SQL·NoSQL, 배치·스트림, 일관성 수준 등 양자택일 모음
- [대규모 서비스 기술 스택 해부](Backend/System-Architecture/big-tech-stack-anatomy.md): Netflix·Uber·Reddit·Twitter 스택을 계층별로 비교
- [개발자 머피의 법칙: 백엔드 방어 체크리스트](Backend/System-Architecture/backend-murphys-law.md): 클라이언트 값 불신, 서버 재계산, 입력 범위 제한, 운영 권한 통제
- [로드 밸런서](Backend/System-Architecture/load-balancer.md): 분산·헬스 체크·TLS 종료·세션 고정, L4·L7, 분산 알고리즘
- [캐시 전략: 계층, 읽기·쓰기 패턴, 교체 정책, 장애 패턴](Backend/System-Architecture/caching-strategies.md): cache-aside·write-through, LRU·LFU 교체 정책, 동시 만료·관통·핫 키 같은 장애
- [캐시 클러스터 운영과 장애 대응](Backend/System-Architecture/cache-cluster-operations.md): 노드 장애 감지, 동기화 중 복제본 제외, 쏠림 방지
- [백엔드 지연 시간 줄이기: 숫자 감각과 기법](Backend/System-Architecture/backend-latency-optimization.md): 연산별 지연 자릿수, 인덱스·캐시·풀·비동기·압축
- [빠르고 유지보수하기 좋은 DB 조회 패턴](Backend/System-Architecture/db-fetching-patterns.md): 직렬 조회 → 배치 → 병렬 → 요청 단위 캐시
- [비동기 서버의 이벤트 루프: 다중 접속 서버에서 Reactor 패턴까지](Backend/System-Architecture/event-loop-server.md): I/O 멀티플렉싱, NIO Selector, 이벤트 루프
- [대기열 시스템(가상 대기실) 설계](Backend/System-Architecture/virtual-waiting-room.md): Redis Sorted Set 순번, 유입량 조절
- [분산 시스템의 시간과 장애: 8가지 착각부터 논리 시계까지](Backend/System-Architecture/distributed-time-and-failure.md): 비동기와 부분 장애, 분산 컴퓨팅의 8가지 착각, happened-before와 논리 시계, 합의·CRDT
- [고전 분산 시스템 설계: GFS, MapReduce, Bigtable, Chubby, Dynamo](Backend/System-Architecture/classic-distributed-systems.md): 단일 마스터·청크 복제, 계산을 데이터로, LSM·태블릿, 굵은 락·시퀀서·ZooKeeper 레시피, Dynamo 기법, 오픈소스 계보
- [분산 시스템의 통신·데이터 흐름 패턴](Backend/System-Architecture/distributed-system-patterns.md): 요청-응답·발행-구독·경쟁 소비자·클레임 체크, 데이터 흐름 패턴
- [메시지 큐와 Kafka](Backend/System-Architecture/message-queue-kafka.md): 큐 선택 기준, MQ → RabbitMQ → Kafka → Pulsar, 토픽·파티션·컨슈머 그룹
- [Kafka 운영: 복제, 컨슈머 그룹, 튜닝, 모니터링](Backend/System-Architecture/kafka-operations.md): ISR·acks·min.insync, KRaft, 리밸런스·오프셋·랙, 컴팩션, 보안, 지표와 병목 진단
- [분산 트랜잭션: 2PC와 사가](Backend/System-Architecture/distributed-transaction.md): 2PC의 블로킹, 보상 트랜잭션 설계, 중간 상태와 시맨틱 락
- [이벤트 기반 아키텍처 설계](Backend/System-Architecture/event-driven-architecture.md): 이벤트 발행·구독으로 결합 낮추기, 이벤트 설계와 순서·중복 처리
- [데이터 관리 패턴: CDC, 이벤트 소싱, CQRS, 최종 일관성](Backend/System-Architecture/distributed-data-patterns.md): 흩어진 데이터를 맞추는 패턴, 사가와 아웃박스
- [대규모 트래픽에서 서비스를 지키는 설계](Backend/System-Architecture/high-traffic-resilience.md): CDN·정적 응답·서킷 브레이커로 급증 트래픽 버티기
- [장애 확산을 막는 복원력 패턴](Backend/System-Architecture/resiliency-patterns.md): 타임아웃·재시도·서킷 브레이커·속도 제한·부하 차단·벌크헤드
- [고가용성 이중화 구조와 장애 감지](Backend/System-Architecture/high-availability-redundancy.md): 나인으로 재는 가용성, 직렬·병렬 계산, 주-백업·주-주 구성, 하트비트
- [소프트웨어 아키텍처 패턴](Backend/System-Architecture/software-architecture-patterns.md): 계층형·클라이언트-서버·이벤트 기반·마이크로커널·헥사고날
- [도메인 주도 설계(DDD)](Backend/System-Architecture/domain-driven-design.md): 유비쿼터스 언어, 바운디드 컨텍스트, 애그리거트
- [마이크로서비스 아키텍처](Backend/System-Architecture/microservices-architecture.md): 기능 단위 서비스 분리, 서비스별 데이터·배포, 운영 구성 요소
- [클라우드 설계 패턴](Backend/System-Architecture/cloud-design-patterns.md): 발레 키, 큐 기반 부하 평준화, 파이프와 필터, 외부 설정 저장소, 헬스 엔드포인트, 연합 ID, 백그라운드 작업
- [아키텍처와 API 계층의 진화: 모놀리스에서 페더레이션까지](Backend/System-Architecture/api-layer-evolution.md): 모놀리스 → 마이크로서비스 → 매크로서비스, BFF·GraphQL 페더레이션
- [API 게이트웨이](Backend/System-Architecture/api-gateway.md): 라우팅·인증·레이트 리밋·응답 조합, 리버스 프록시·로드 밸런서와 차이
- [BFF (Backend For Frontend)](Backend/System-Architecture/bff.md): 화면별 중간 서버로 API 묶기·가공, Next.js BFF
- [보안 시스템 설계: 원칙과 민감 데이터 관리](Backend/System-Architecture/secure-system-design.md): CIA, 계층별 보안 설계, 민감 데이터 분류·암호화·마스킹
- [권한 시스템 설계: ACL, RBAC, ABAC](Backend/System-Architecture/access-control-models.md): 권한 모델 비교와 고르는 기준
- [인증·인가 로직은 어디에 두나: 필터, 인터셉터, API 게이트웨이](Backend/System-Architecture/auth-placement.md): 필터·인터셉터·메서드 보안, API 게이트웨이에서 토큰 검증
- [결제 시스템 설계: 흐름, 멱등성, 대사, 핫스팟 계정](Backend/System-Architecture/payment-system.md): PSP·지갑·원장, 멱등 키, 대사
- [카드 결제망과 간편결제](Backend/System-Architecture/card-payment-network.md): 승인·매입·정산, 발급사·매입사·카드 네트워크·PG
- [자금 이동: 청산과 결제](Backend/System-Architecture/money-movement.md): 정보 흐름과 자금 흐름, 청산과 결제(settlement)
- [알림 시스템 설계: 푸시·이메일·SMS와 실시간 메시지 전달](Backend/System-Architecture/notification-system.md): 게이트웨이 → 분배 → 큐 → 채널 서비스, 재시도·중복 방지
- [채팅 시스템 설계: 연결, 접속 상태, 메시지 전달](Backend/System-Architecture/chat-system-design.md): WebSocket 연결, 메시지 순서·저장, 접속 상태
- [뉴스 피드 설계: 연결, 활동, 팬아웃](Backend/System-Architecture/news-feed-design.md): 스캐터·개더와 받은편지함 팬아웃, 활동 복제, 집계·중복 제거·점수, 비정규화와 캐시 수명
- [사진 공유 서비스 설계: 메타데이터, 저장, 샤딩](Backend/System-Architecture/photo-sharing-design.md): 파일과 메타데이터 분리, 테이블 크기 추정, 업로드·읽기 분리, PhotoID 샤딩과 홀짝 티켓 서버
- [실시간 웹소켓 서버 설계](Backend/System-Architecture/realtime-websocket-server.md): 수만 연결 유지, 메시지 타입 설계, 부하 검증
- [위치 기반 서비스 설계: 지오해시, 쿼드트리, 지도](Backend/System-Architecture/location-based-service.md): 격자 색인, 지오해시·쿼드트리·S2, 레이 캐스팅, 지도 타일
- [라이브 스트리밍의 구조: 인코딩, 세그먼트, ABR, CDN](Backend/System-Architecture/live-streaming.md): 인코딩·세그먼트·적응형 비트레이트·CDN 전송
- [이미지·동영상 처리 서버 설계](Backend/System-Architecture/media-processing-pipeline.md): 사전 생성과 온디맨드 리사이징, 캐시·CDN, 트랜스코딩 파이프라인
- [동영상 스트리밍 서비스 설계: Netflix·YouTube](Backend/System-Architecture/video-streaming-design.md): 업로드 처리 파이프라인(장면 청크·콘텐츠 검사·트랜스코딩), Open Connect와 ABR, 지역 차단·추천
- [실시간 공동 편집: OT와 CRDT](Backend/System-Architecture/collaborative-editing.md): 연산 단위 전송, OT와 CRDT 비교
- [Cloudflare Durable Objects와 액터 모델](Backend/System-Architecture/durable-objects.md): 전역 유일 이름·전용 SQLite·싱글 스레드 액터, 입력·출력 게이트, WebSocket 하이버네이션, 알람, 한도와 쓰임새
- [대규모 웹 크롤러 설계](Backend/System-Architecture/web-crawler-at-scale.md): 예의 제약, 도메인 샤드 노드, 프런티어
- [URL 단축기 설계](Backend/System-Architecture/url-shortener-design.md): 301·302, 고유 ID+Base62, 캐시 중심 읽기 경로
- [실시간 트렌딩과 Top-K 집계](Backend/System-Architecture/trending-topics.md): 슬라이딩 창 카운터, 3단 분산 집계, MinTopk 최소 후보 집합, 근사 Top-K, 비모수 조기 탐지
- [멀티플레이 게임 서버 설계: 턴제 비동기와 실시간](Backend/System-Architecture/multiplayer-game-server.md): 상태 저장(격자·명령 로그), 비동기 매치메이킹, 서버 권위·예측·보정·보간
