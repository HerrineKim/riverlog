---
title: "웹 기초"
concept: "Web Basics"
summary: "HTTP와 API 스타일, 인증·보안, 인코딩, 웹 서버와 Nginx처럼 프레임워크 이전에 공통인 서버 지식."
tags: ["backend","http","api"]
source: mixed
date: "2026-11-26"
---

웹 기초 노트는 프레임워크를 고르기 전에 공통인 서버 지식을 다룬다. HTTP와 REST·GraphQL·gRPC, 인증과 보안, 인코딩, 웹 서버와 Nginx, 스프링에서 요청이 어떻게 도는지가 여기 있다.

## 하위 노트

- [웹 앱의 요청·응답 구조](Backend/Web-Basics/http-web-architecture.md): 브라우저·프론트 서버·API 서버·DB의 요청 흐름과 포트
- [REST API 설계](Backend/Web-Basics/rest-api.md): REST의 여섯 제약, URI 규칙, 멱등 키·버전·일괄 처리
- [API 아키텍처 스타일: SOAP·REST·GraphQL·gRPC·WebSocket·Webhook](Backend/Web-Basics/api-architectural-styles.md): 여섯 스타일의 통신 방식, REST·GraphQL·gRPC 축별 비교와 고르는 기준
- [GraphQL](Backend/Web-Basics/graphql.md): 타입 스키마, 쿼리·뮤테이션·구독, 리졸버와 N+1
- [gRPC: Protocol Buffers로 정의하는 RPC](Backend/Web-Basics/grpc.md): .proto 계약과 스텁, protobuf 직렬화, 네 가지 호출 방식, 브라우저 우회
- [웹훅과 폴링](Backend/Web-Basics/webhook.md): 변화를 묻는 쪽과 알리는 쪽, 서명 검증·재시도·멱등 처리
- [API 페이지네이션](Backend/Web-Basics/api-pagination.md): 오프셋·페이지 번호·커서·키셋·시간 기반·혼합 방식 비교
- [API 테스트의 종류](Backend/Web-Basics/api-testing.md): 스모크·기능·통합·회귀·부하·스트레스·보안·퍼즈 테스트
- [CORS](Backend/Web-Basics/cors.md): 다른 출처의 호출을 허용하는 브라우저 보안 정책
- [API 보안 체크리스트](Backend/Web-Basics/api-security.md): 전송·입력·인증과 인가·노출 범위·운영 단계별 점검 항목
- [API 키와 HMAC 요청 서명](Backend/Web-Basics/api-request-signing.md): 서버 간 호출의 발신자·무결성 증명, 타임스탬프와 재전송 방지
- [세션 기반 인증과 토큰 기반 인증](Backend/Web-Basics/session-vs-token-auth.md): 세션과 JWT 비교, 토큰 탈취 대책과 선택 기준
- [2단계 인증: TOTP와 패스키](Backend/Web-Basics/two-factor-totp-passkey.md): 공유 비밀 키와 시각으로 만드는 6자리 코드, 공개키 기반 패스키
- [비밀번호 저장과 비밀번호 관리자](Backend/Web-Basics/password-storage.md): 솔트와 느린 해시(Argon2id·bcrypt), 비밀번호 관리자
- [인코딩·암호화·해시·토큰화와 디지털 서명](Backend/Web-Basics/encoding-encryption-hashing.md): 목적별 데이터 변환 구분, 대칭·비대칭 암호화, 서명
- [Base64 인코딩](Backend/Web-Basics/base64-encoding.md): 6비트 변환 원리, 패딩, 33% 커지는 비용
- [텔레그램 미니앱 인증 흐름](Backend/Web-Basics/telegram-mini-app-auth.md): initData HMAC 검증 뒤 자체 세션·JWT 발급
- [웹 서버, WAS, 그리고 Nginx](Backend/Web-Basics/web-server-and-nginx.md): 웹 서버와 WAS의 역할 분담, 리버스 프록시, Nginx 마스터-워커 구조
- [스프링의 싱글톤 빈과 요청 스레드](Backend/Web-Basics/spring-singleton-thread-safety.md): 스레드 풀과 공유 빈, 상태 없는 빈
- [스프링 애플리케이션 설계: DI, 프록시 트랜잭션, 멀티모듈, WebFlux](Backend/Web-Basics/spring-application-design.md): 생성자 주입, @Transactional 프록시 함정, 멀티모듈, WebFlux
