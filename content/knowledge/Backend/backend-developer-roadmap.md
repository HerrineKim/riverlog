---
title: "백엔드 개발자가 알아야 할 것"
concept: "Backend Roadmap"
summary: "인터넷·DNS·HTTP부터 데이터베이스, 언어와 웹 프레임워크, API 스타일(REST·GraphQL·gRPC), 버전 관리, 인증, 리눅스, CI/CD·도커·클라우드, 보안, 아키텍처까지 백엔드 개발자의 지식 지도. 다 외우는 것이 아니라 필요할 때 찾아 쓸 수 있을 만큼 아는 것이 목표다."
tags: ["backend", "roadmap", "career", "api"]
source: other
date: "2026-10-16"
sources: ["https://www.slideshare.net/slideshow/pdf-81ec/262366350", "https://roadmap.sh/backend"]
---

> 박승규의 발표 자료 「삶이 편해지는 백엔드 개발 지식」(2023.10)을 바탕으로 재구성한 노트다.

## 지식 지도

백엔드 개발자가 다루는 영역은 넓다. **전부 외울 필요는 없다.** 각 영역이 무엇을 풀려고 존재하는지 알고, 필요할 때 찾아서 쓸 수 있으면 된다.

```text
요청이 도착하기까지   인터넷 → DNS → HTTP
요청을 처리하는 코드  언어 → 웹 프레임워크 → API 설계 → 인증·인가
데이터               데이터 표현(JSON 등) → 데이터베이스 → 배치 처리
코드를 내보내는 일    Git → CI/CD → 도커 → 클라우드 → 리눅스
전체를 받치는 것      보안 → 아키텍처
```

| 영역 | 핵심 질문 | 관련 노트 |
| --- | --- | --- |
| 인터넷 | 컴퓨터들은 라우터·ISP를 거쳐 어떻게 이어지는가 | [[network-basics\|네트워크 기초]], [[url-to-page\|URL 입력부터 화면까지]] |
| DNS | 도메인 이름을 IP 주소로 어떻게 바꾸는가 | [[dns\|DNS]] |
| HTTP | 요청(URL·메서드·헤더·바디)과 응답은 어떻게 생겼는가 | [[http\|HTTP]], [[http-web-architecture\|웹 앱의 요청·응답 구조]] |
| 데이터베이스 | RDB와 NoSQL 중 무엇을, 왜 고르는가 | [[database-models\|데이터베이스 모델]], [[sql-basics\|SQL 기초]] |
| 언어 | 무엇으로 서버를 짜는가 | 아래 「언어 고르기」 |
| 웹 프레임워크 | 라우팅·미들웨어·ORM을 얼마나 제공받는가 | 아래 「웹 프레임워크」 |
| API | 클라이언트와 어떤 약속으로 통신하는가 | [[rest-api\|REST API]], 아래 「API 스타일」 |
| 버전 관리 | 변경 이력을 어떻게 남기고 함께 작업하는가 | [[git-basics\|Git 기초]] |
| 인증·인가 | 누구인지 확인하고, 무엇을 허락하는가 | [[session-vs-token-auth\|세션 기반 인증과 토큰 기반 인증]] |
| 리눅스 | 서버에서 프로세스·로그·네트워크를 어떻게 다루는가 | [[daemon-and-systemd\|데몬과 systemd]] |
| CI/CD·도커 | 빌드·테스트·배포를 어떻게 자동화하고 환경을 고정하는가 | [[ci-cd\|CI/CD]], [[dockerfile\|Dockerfile]] |
| 클라우드 | 서버·DB·네트워크를 어떻게 빌려 쓰는가 | [[aws-cloud-basics\|AWS 클라우드 기초]] |
| 보안 | 입력 검증, 비밀 관리, 전송 암호화 | [[api-security\|API 보안 체크리스트]], [[https\|HTTPS]] |
| 아키텍처 | 서비스를 어떻게 나누고 데이터를 흘리는가 | [[web-scalability-components\|웹 확장성의 구성 요소]], [[bff\|BFF]] |

더 촘촘한 단계별 지도는 [roadmap.sh/backend](https://roadmap.sh/backend)에 있다.

## 언어 고르기

특별한 이유가 없으면 **오래 쓰여 안정적이고, 문제가 생겼을 때 답을 찾기 쉬운 언어**를 고른다. 생태계와 팀의 경험이 언어 자체의 우열보다 중요하다.

| 언어 | 강점 | 잘 맞는 곳 |
| --- | --- | --- |
| Python | 문법이 간결하고 배우기 쉽다 | 웹 백엔드, 데이터 분석, AI |
| JavaScript·TypeScript(Node.js) | 프론트엔드와 같은 언어, 비동기 I/O | 실시간 서비스, 풀스택 팀 |
| Java·Kotlin(JVM) | 대규모 시스템용 라이브러리와 운영 경험이 풍부하다 | 대형 서비스, 금융·엔터프라이즈 |
| C#(.NET) | 마이크로소프트 생태계와의 통합 | Azure, 윈도우 기반 조직 |
| Go | 간결하고 빠르다. 바이너리 하나로 배포된다 | 마이크로서비스, 인프라 도구 |

## 웹 프레임워크

| 구분 | 성격 | 예 |
| --- | --- | --- |
| 마이크로 프레임워크 | 라우팅 같은 최소 기능만 준다. 가볍고 빨리 시작하며, 나머지는 골라 붙인다 | Flask·FastAPI(Python), Express(Node.js), Gin(Go), Ktor(Kotlin) |
| 풀스택 프레임워크 | ORM·인증·관리 화면·프로젝트 구조까지 준다. 팀 전체가 같은 패턴을 따르게 된다 | Django(Python), NestJS(Node.js), Spring(Java) |

작은 서비스나 API 하나면 마이크로, 여러 사람이 오래 키울 서비스면 풀스택 쪽이 유지보수가 쉽다. 같은 개념이 프레임워크마다 어떻게 다른지는 [[routing-crud|Express 라우팅]]과 [[getting-started-mtv|Django MTV]]를 비교해 보면 보인다.

## API 스타일: REST · GraphQL · gRPC

백엔드가 외부에 내놓는 API는 대개 이 셋 중 하나다. 통신 단위·형식·강점과 약점, 고르는 기준을 SOAP·WebSocket·Webhook과 함께 비교한 표는 [[api-architectural-styles|API 아키텍처 스타일]]에 있다.

- **REST**는 표준 규격이 아니라 아키텍처 스타일이다. 상태 없음(stateless), 캐시 가능 여부 명시, 균일한 인터페이스가 핵심이다. 설계 규칙은 [[rest-api|REST API]]에 있다.
- **GraphQL**은 스키마로 타입을 정의하고 클라이언트가 원하는 필드를 질의한다. 구독(subscription)으로 실시간 갱신도 받는다.
- **gRPC**는 `.proto`로 서비스와 메시지를 정의해 여러 언어의 코드를 생성하는 RPC 방식이다. 자세한 내용은 [[grpc|gRPC: Protocol Buffers로 정의하는 RPC]]에 있다.

GraphQL의 도입 패턴은 [[graphql|GraphQL]]에 있다.

## 백엔드 개발자의 태도

| 대신 | 이렇게 |
| --- | --- |
| 정성적 판단: 「느린 것 같다」 | **정량적 판단**: 응답 시간 p95, 에러율, 처리량을 재고 숫자로 말한다 |
| 소비자: 도구를 쓰기만 한다 | **제작자**: 도구가 왜 그렇게 동작하는지 알고, 필요하면 만든다 |
| 혼자 잘하기 | **함께 자라기**: 리뷰·문서·공유로 팀 전체의 실력을 올린다 |

## 정리

- 백엔드 지식은 「요청이 도착하기까지 → 처리 → 데이터 → 배포 → 보안·아키텍처」로 묶으면 지도가 잡힌다.
- 다 외우지 않는다. **무엇을 풀려고 있는 기술인지** 알고 필요할 때 찾는다.
- 언어·프레임워크는 안정성과 생태계, 팀의 경험으로 고른다.
- API는 공개·일반 서비스는 REST, 다양한 화면은 GraphQL, 내부 서비스 간 통신은 gRPC가 기본 선택지다.
- 판단은 숫자로 한다.

관련 노트: [[frontend-roadmap|프론트엔드 학습 로드맵]], [[web-dev-study-guide|초보 웹 개발자의 공부 방향과 차별화]], [[database-models|데이터베이스 모델]], [[rest-api|REST API]]
