---
title: "API 아키텍처 스타일: SOAP·REST·GraphQL·gRPC·WebSocket·Webhook"
concept: "API Styles"
summary: "API는 시스템끼리 기능과 데이터를 주고받는 약속이다. 대표적인 여섯 가지 스타일(SOAP, REST, GraphQL, gRPC, WebSocket, Webhook)을 통신 방향·데이터 형식·잘 맞는 곳으로 비교하고, API와 SDK의 차이, 공개 범위에 따른 API 종류, API를 배울 때 거치는 주제 지도를 정리했다."
tags: ["backend", "api", "http", "architecture", "rest", "graphql"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/a-cheatsheet-on-comparing-api-architectural-styles", "https://bytebytego.com/guides/soap-vs-rest-vs-graphql-vs-rpc", "https://bytebytego.com/guides/the-evolving-landscape-of-api-protocols-in-2023", "https://bytebytego.com/guides/api-vs-sdk", "https://bytebytego.com/guides/the-ultimate-api-learning-roadmap"]
---

> ByteByteGo의 System Design 101 가이드 「[A Cheatsheet on Comparing API Architectural Styles](https://bytebytego.com/guides/a-cheatsheet-on-comparing-api-architectural-styles)」, 「[SOAP vs REST vs GraphQL vs RPC](https://bytebytego.com/guides/soap-vs-rest-vs-graphql-vs-rpc)」, 「[The Evolving Landscape of API Protocols](https://bytebytego.com/guides/the-evolving-landscape-of-api-protocols-in-2023)」, 「[API vs SDK](https://bytebytego.com/guides/api-vs-sdk)」, 「[The Ultimate API Learning Roadmap](https://bytebytego.com/guides/the-ultimate-api-learning-roadmap)」을 바탕으로 재구성한 노트다.

## API란

API(Application Programming Interface)는 **한 소프트웨어가 다른 소프트웨어의 기능과 데이터를 쓰는 규칙**이다. 어떤 주소(엔드포인트)로, 어떤 형식의 요청을 보내면, 어떤 응답이 오는지를 정한다. 웹 개발에서 API라고 하면 보통 네트워크 너머 서버의 API를 말한다.

API 스타일은 이 약속을 **어떤 단위로 나누고, 어떤 형식으로 실어 나르고, 누가 먼저 말을 거는지**에 대한 선택이다. 한 시스템 안에서도 바깥 공개 API는 REST, 내부 서비스 간 통신은 gRPC, 실시간 알림은 WebSocket처럼 섞어 쓴다.

## 여섯 가지 스타일 한눈에

| 스타일 | 단위 | 데이터 형식 | 통신 방향 | 잘 맞는 곳 |
| --- | --- | --- | --- | --- |
| SOAP | 오퍼레이션(XML 메시지) | XML, WSDL로 계약 정의 | 요청·응답 | 금융·공공 같은 기존 기업 시스템 연계, 엄격한 계약과 트랜잭션 규격이 필요한 곳 |
| REST | 리소스(URI) + HTTP 메서드 | 주로 JSON | 요청·응답 | 공개 API, 일반 웹 서비스 |
| GraphQL | 스키마 위의 질의 | JSON | 요청·응답 + 구독 | 화면이 다양해 필요한 필드가 제각각인 앱, 여러 데이터 소스를 묶는 층 |
| gRPC | 서비스의 메서드(RPC) | Protocol Buffers(이진) | 요청·응답 + 스트리밍 | 내부 마이크로서비스 간 고성능 통신 |
| WebSocket | 메시지 | 텍스트·이진 프레임 | 연결 하나로 양방향 | 채팅, 협업 편집, 게임 같은 저지연 실시간 통신 |
| Webhook | 이벤트 | 주로 JSON(HTTP POST) | 서버 → 서버 콜백 | 결제 완료, 배송 상태 변경 같은 외부 서비스의 이벤트 알림 |

앞의 네 가지는 **클라이언트가 묻고 서버가 답하는** 모델이다. WebSocket은 연결을 열어 둔 뒤 양쪽이 아무 때나 말하고, Webhook은 **이벤트를 가진 쪽이 먼저 호출**한다는 점에서 방향이 다르다.

## 등장 순서와 흐름

```text
RPC(원격 함수 호출) 개념
  └─ SOAP (XML·WSDL, 엄격한 계약)
       └─ REST (HTTP 의미를 그대로 쓰는 가벼운 스타일)
            ├─ WebSocket (HTTP에서 갈아타는 양방향 연결)
            ├─ GraphQL (클라이언트가 필드를 고르는 질의)
            └─ gRPC (RPC의 재등장: protobuf + HTTP/2)
```

흐름을 보면 **계약의 엄격함과 단순함 사이를 오간다.** SOAP의 무거운 계약에 지친 쪽이 REST로 옮겼고, REST의 느슨함과 과다·과소 조회(over/under-fetching)를 메우려고 GraphQL과 gRPC가 다시 스키마를 앞세웠다.

## REST · GraphQL · gRPC의 강점과 약점

| 스타일 | 전송 | 강점 | 약점 |
| --- | --- | --- | --- |
| REST | HTTP/1.1·2 | 단순하고 HTTP 캐시가 쉽다. 도구와 생태계가 가장 넓다 | 화면마다 필요한 데이터가 다르면 요청이 늘거나 남는다(과소·과다 조회) |
| GraphQL | HTTP, 단일 엔드포인트(`/graphql`) | 클라이언트가 필요한 필드만 받는다 | HTTP 캐시가 어렵고 서버의 쿼리 비용을 통제해야 한다 |
| gRPC | HTTP/2. 연결 하나로 여러 요청을 동시에 | 이진 직렬화로 빠르고 스키마가 강하다. 양방향 스트리밍 | 브라우저에서 바로 쓰기 어렵다 |

## 고르는 기준

| 질문 | 기울어지는 쪽 |
| --- | --- |
| 외부 개발자나 브라우저가 직접 부르나 | REST (도구·캐시·문서화 생태계가 가장 넓다) |
| 화면마다 필요한 데이터 모양이 크게 다른가 | GraphQL, 또는 [[bff\|BFF]] |
| 내부 서비스끼리 많이, 빠르게 주고받나 | gRPC |
| 서버가 먼저 보내야 하나 (브라우저 대상) | WebSocket, 단방향이면 SSE([[websocket\|WebSocket]]) |
| 다른 회사 서비스의 상태 변화를 알아야 하나 | Webhook([[webhook\|웹훅과 폴링]]) |
| 기존 기업 시스템이 SOAP로만 열려 있나 | SOAP (선택이라기보다 제약) |

## API와 SDK

| 구분 | API | SDK (Software Development Kit) |
| --- | --- | --- |
| 정체 | 소프트웨어끼리 통신하는 **규칙** | 특정 플랫폼용 개발을 돕는 **도구 묶음** |
| 들어 있는 것 | 엔드포인트, 요청·응답 형식, 인증 방식 | 라이브러리, 타입, 예제 코드, 문서, 디버깅 도구 |
| 추상화 수준 | 낮다. HTTP 요청을 직접 만든다 | 높다. `client.payments.create()`처럼 함수로 부른다 |
| 언어·플랫폼 | 무관 | 특정 언어·플랫폼 전용 |

SDK는 보통 **API를 감싼 것**이다. 결제·지도·클라우드 서비스는 API를 공개하고, 언어별 SDK로 인증·재시도·직렬화를 대신 처리해 준다. SDK가 없는 언어에서도 API는 직접 부를 수 있다.

## 공개 범위에 따른 종류

| 종류 | 누가 쓰나 | 예 |
| --- | --- | --- |
| 공개(public) API | 누구나 (보통 API 키 발급 후) | 날씨·지도·결제 API |
| 파트너(partner) API | 계약한 회사만 | 제휴사 주문 연동 |
| 내부(private) API | 같은 조직의 서비스·앱 | 사내 마이크로서비스, 자사 앱의 백엔드 |

공개 범위가 넓을수록 하위 호환성, 문서, 레이트 리밋, 버전 관리의 무게가 커진다.

## API를 배울 때 거치는 주제

| 주제 | 다루는 것 | 상세 노트 |
| --- | --- | --- |
| 기반 용어 | HTTP 버전, 메서드, 상태 코드, 헤더, 쿠키, 캐시 | [[Computer-Science/Network/http\|HTTP 프로토콜]], [[http-cache\|HTTP 캐시]] |
| 스타일 | REST, SOAP, GraphQL, gRPC, WebSocket | [[rest-api\|REST API 설계]], [[graphql\|GraphQL]], [[grpc\|gRPC]] |
| 인증 | Basic, 세션, 토큰(JWT), OAuth, 요청 서명 | [[session-vs-token-auth\|세션과 토큰 인증]], [[oauth2\|OAuth 2.0]], [[api-request-signing\|API 키와 HMAC 요청 서명]] |
| 설계 기능 | 페이지네이션, 멱등성, 버전 관리, HATEOAS, 콘텐츠 협상 | [[api-pagination\|API 페이지네이션]] |
| 문서화 | OpenAPI(Swagger), Postman, Redoc | [[swagger\|NestJS Swagger]] |
| 성능 | 캐시, 레이트 리밋, 로드 밸런싱, DB 인덱스, 수평 확장 | [[load-balancer\|로드 밸런서]] |
| 입구 | API 게이트웨이 | [[api-gateway\|API 게이트웨이]] |
| 연동 패턴 | 게이트웨이, 이벤트 기반, 웹훅, 폴링, 배치 | [[webhook\|웹훅과 폴링]] |
| 품질 | 테스트, 보안 | [[api-testing\|API 테스트의 종류]], [[api-security\|API 보안 체크리스트]] |

## 정리

- API 스타일은 단위(리소스·질의·메서드·메시지·이벤트), 형식, 통신 방향으로 갈린다.
- 요청·응답형은 REST·GraphQL·gRPC·SOAP, 연결 유지형은 WebSocket, 이벤트 콜백형은 Webhook이다.
- 한 시스템에서도 **공개는 REST, 내부는 gRPC, 실시간은 WebSocket, 외부 이벤트는 Webhook**처럼 경계마다 다르게 쓴다.
- SDK는 API를 언어별로 감싼 도구 묶음이다.

관련 노트: [[rest-api|REST API 설계]], [[graphql|GraphQL]], [[grpc|gRPC: Protocol Buffers로 정의하는 RPC]], [[websocket|WebSocket]], [[webhook|웹훅과 폴링]], [[backend-developer-roadmap|백엔드 개발자가 알아야 할 것]]
