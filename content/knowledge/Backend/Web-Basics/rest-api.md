---
title: "REST API 설계"
concept: "REST API"
summary: "자원을 URI로 표현하고 HTTP 메서드로 행위를 나타내는 API 설계 방식과 그 규칙. REST의 여섯 제약, URI 규칙, 멱등 키·버전·일괄 처리·질의 규칙 같은 실무 설계 팁까지."
tags: ["http", "api", "rest", "backend"]
source: til
date: "2026-10-12"
sources: ["https://riverkim.kr/308", "https://bytebytego.com/guides/8-tips-for-efficient-api-design", "https://bytebytego.com/guides/how-do-we-design-effective-and-safe-apis", "https://bytebytego.com/guides/rest-api-cheatsheet", "https://bytebytego.com/guides/how-does-rest-api-work", "https://blog.npcode.com/2017/04/03/rest의-representation이란-무엇인가/", "https://sanghaklee.tistory.com/57", "https://evan-moon.github.io/2020/04/07/about-restful-api/", "https://1ambda.github.io/javascripts/rest-api-put-vs-post/"]
---

> 「실무 설계 팁」 섹션은 ByteByteGo의 System Design 101 가이드 「[8 Tips for Efficient API Design](https://bytebytego.com/guides/8-tips-for-efficient-api-design)」, 「[How to Design Effective and Safe APIs](https://bytebytego.com/guides/how-do-we-design-effective-and-safe-apis)」, 「[REST API Cheatsheet](https://bytebytego.com/guides/rest-api-cheatsheet)」, 「[How does REST API work?](https://bytebytego.com/guides/how-does-rest-api-work)」을 바탕으로 보강했다. 「리소스와 표현」은 「[REST의 representation이란 무엇인가](https://blog.npcode.com/2017/04/03/rest의-representation이란-무엇인가/)」와 「[프론트엔드와 백엔드가 소통하는 엔드포인트, RESTful API](https://evan-moon.github.io/2020/04/07/about-restful-api/)」, 오류 응답 규칙은 「[RESTful API 설계 가이드](https://sanghaklee.tistory.com/57)」, POST와 PUT의 위치 결정은 「[REST API에서 PUT과 POST의 차이](https://1ambda.github.io/javascripts/rest-api-put-vs-post/)」로 보강했다.

REST(Representational State Transfer)는 **자원(Resource)을 이름(URI)으로 구분하고, 그 자원의 상태를 HTTP로 주고받는** 아키텍처 스타일이다. REST 원칙을 따르는 API를 REST API(또는 RESTful API)라 부른다. 프론트엔드와 백엔드가 같은 규칙으로 대화하므로 API를 보지 않고도 의도를 짐작할 수 있다는 것이 가장 큰 장점이다.

## REST의 구성 요소

| 요소 | 의미 | 예 |
| --- | --- | --- |
| 자원(Resource) | HTTP URI | `/cats/3` |
| 행위(Verb) | HTTP Method | `GET`, `POST`, `PATCH` … |
| 표현(Representation) | 요청/응답 바디(payload) | `{"name": "blue"}` (JSON) |

## HTTP 메서드와 CRUD

| CRUD | 메서드 | 예시 |
| --- | --- | --- |
| Create | `POST` | `POST /cats` — 고양이 생성 |
| Read | `GET` | `GET /cats`, `GET /cats/:id` |
| Update(전체) | `PUT` | `PUT /cats/:id` — 전체 교체 |
| Update(부분) | `PATCH` | `PATCH /cats/:id` — 일부 필드만 수정 |
| Delete | `DELETE` | `DELETE /cats/:id` |

### POST, PUT, PATCH의 차이와 멱등성

같은 요청을 여러 번(또는 동시에) 보내도 리소스가 손상되지 않고 결과가 항상 같으면 **멱등(idempotent)하다고** 한다. 재시도해도 안전한지가 여기서 갈린다.

| 메서드 | 할 수 있는 일 | URI | 멱등성 |
| --- | --- | --- | --- |
| POST | 리소스 생성, 또는 서버가 정의한 다양한 작업 | 컬렉션 URI면 된다 (`POST /cats`) | 보장되지 않음. 두 번 보내면 두 개가 생길 수 있다 |
| PUT | 리소스를 **통째로** 교체하거나, 없으면 그 URI로 생성 | 대상 URI를 정확히 알아야 한다 (`PUT /cats/3`) | 멱등. 같은 내용으로 몇 번을 덮어써도 결과가 같다 |
| PATCH | 리소스의 **일부**만 수정. 생성은 하지 않는다 | 대상 URI를 정확히 알아야 한다 | 보장되지 않음. "나이 +1"처럼 상대적 변경이면 보낼 때마다 결과가 달라진다 |

**리소스의 위치를 누가 정하느냐**로도 갈린다. POST는 서버가 새 리소스의 URI를 정해 `201 Created`와 `Location` 헤더로 알려 주고, PUT은 클라이언트가 URI를 지정한다. PUT으로 일부 필드만 보내면 빠진 필드가 비워질 수 있다. 필드 몇 개만 고치는 화면이라면 PATCH가 의도에 맞다. ([POST, PUT, PATCH의 차이점, 토스페이먼츠 개발자센터](https://docs.tosspayments.com/blog/rest-api-post-put-patch))

## REST의 특징

1. **Client-Server**: 클라이언트와 서버의 역할을 분리한다.
2. **Stateless**: 서버는 요청 사이의 클라이언트 상태를 저장하지 않는다. 각 요청이 필요한 정보를 모두 담는다.
3. **Cacheable**: HTTP 캐시 기능을 그대로 활용할 수 있다.
4. **Layered System**: 클라이언트는 중간에 프록시·로드밸런서가 있어도 알 필요가 없다.
5. **Uniform Interface**: URI와 메서드로 자원을 다루는 일관된 인터페이스.
6. **Code on Demand** (선택): 서버가 실행 가능한 코드(스크립트)를 내려보내 클라이언트 기능을 넓힐 수 있다. 여섯 제약 중 유일하게 선택 사항이다.

균일한 인터페이스에는 응답에 다음에 할 수 있는 행동의 링크를 담는 **HATEOAS**(Hypermedia as the Engine of Application State)도 포함된다. 엄밀한 REST는 이것까지 요구하지만, 실무의 JSON API 대부분은 링크 없이 문서로 대신한다.

## 리소스와 표현

REST에서 서버가 주고받는 것은 **리소스 자체가 아니라 리소스의 표현(representation)** 이다. 리소스는 「3번 고양이」나 「환영 문서」처럼 URI로 가리키는 개념이고, 표현은 그 리소스의 **특정 시점 상태**를 특정 형식으로 담은 것이다. REST의 이름도 여기서 왔다. 애플리케이션의 상태(State)를 표현(Representation)으로 전송(Transfer)한다는 뜻이다.

| 구성 | 뜻 | 예 |
| --- | --- | --- |
| 표현 데이터 | 실제로 전달되는 내용 | `{"name": "blue"}`, `hello` |
| 표현 메타데이터 | 그 데이터를 해석하는 정보 | `Content-Type: application/json`, `Content-Language: ko` |

한 리소스에 표현이 여러 개(JSON·XML, 한국어·영어)일 수 있다. 하나를 고르는 과정이 **내용 협상(content negotiation)** 이다.

| 방식 | 동작 |
| --- | --- |
| 사전 협상(proactive) | 클라이언트가 `Accept`, `Accept-Language` 같은 헤더로 선호를 밝히면 서버가 고른다. 대부분이 이 방식이다 |
| 사후 협상(reactive) | 서버가 선택지 목록(각각 다른 URI)을 주고 클라이언트가 고른다 |

요청·응답 본문은 성공이든 오류든 모두 어떤 리소스의 표현이다. 이 구분을 알면 URI에 `.json` 같은 확장자를 넣지 않고 헤더로 형식을 고르는 이유가 이해된다.

## URI 설계 규칙

1. 동사보다 **명사**, 대문자보다 **소문자**를 쓴다. 행위는 URI가 아니라 메서드로 표현한다.
   - 나쁜 예: `GET /getCats`, `POST /cats/delete/3`
   - 좋은 예: `GET /cats`, `DELETE /cats/3`
2. 마지막에 슬래시(`/`)를 붙이지 않는다.
3. 단어 구분은 언더바(`_`) 대신 **하이픈(`-`)을** 쓴다. (`/cat-profiles`)
4. 파일 확장자를 URI에 넣지 않는다. 형식은 `Accept`/`Content-Type` 헤더로 표현한다.
5. 컬렉션은 복수형, 계층 관계는 경로로 표현한다. (`/cats/3/friends`)

## 설계 예: 영화와 리뷰

영화(Movie) 1 : N 리뷰(Review), 영화 M : N 배우(Actor) 관계를 자원 중심으로 옮기면 다음과 같다. 상위 자원 아래에 하위 자원을 두는 경로(`/movies/:id/reviews`)로 소속 관계를 드러내고, 이미 존재하는 리뷰는 독립된 경로로도 다룬다.

| 메서드 | URL | 설명 |
| --- | --- | --- |
| GET | `/api/v1/movies` | 영화 목록 |
| GET | `/api/v1/movies/:movieId` | 영화 상세 (배우·리뷰 포함) |
| POST | `/api/v1/movies/:movieId/reviews` | 해당 영화에 리뷰 작성 |
| GET | `/api/v1/reviews` | 리뷰 목록 |
| GET / PUT / DELETE | `/api/v1/reviews/:reviewId` | 리뷰 상세·수정·삭제 |
| GET | `/api/v1/actors`, `/api/v1/actors/:actorId` | 배우 목록·상세 (출연작 포함) |

상태 코드 선택에서 자주 헷갈리는 부분은 다음과 같다.

| 상황 | 응답 |
| --- | --- |
| 생성 성공 | `201 Created` |
| 삭제 성공 | `204 No Content` (본문 없음. 메시지를 보내려면 `200 OK`) |
| 입력 검증 실패 | `400 Bad Request` |
| 대상 없음 | `404 Not Found` |
| 목록이 비어 있음 | `200 OK` + 빈 배열 `[]` (빈 목록은 정상 상태이므로 404로 처리하지 않는다) |

오류 응답은 다음 규칙을 따른다.

- **실패를 `200 OK`로 보내고 본문으로 성공 여부를 알리지 않는다.** 캐시·모니터링·클라이언트 라이브러리가 모두 상태 코드를 보고 동작한다.
- `400`에는 어느 필드가, 어떤 값 때문에, 왜 틀렸는지를 담는다.
- `405 Method Not Allowed`에는 `Allow` 헤더로 허용 메서드를 알린다. 업무 규칙상 지금 처리할 수 없는 요청(이미 취소된 주문 결제 등)은 `409 Conflict`, 요청이 너무 많으면 `429 Too Many Requests`와 `Retry-After`를 쓴다.
- 세부 오류는 상태 코드를 반복하지 말고 본문에 애플리케이션 오류 코드와 설명 링크로 준다. 표준 형식으로는 `application/problem+json`(RFC 9457)이 있다.
- `5xx`의 내부 정보(스택 트레이스, 쿼리)는 노출하지 않는다.

Django에서 이 설계를 구현하는 방법은 [[drf-serializer|DRF Serializer와 관계 표현]]에서 다룬다.

## 실무 설계 팁

**API 설계는 URL 경로 설계만이 아니다.** 자원 이름과 식별자, 경로 패턴을 고르는 일과 함께 헤더(인증, 멱등 키, 캐시), 게이트웨이의 레이트 리밋 규칙까지 계약의 일부로 설계한다.

| 팁 | 내용 | 예 |
| --- | --- | --- |
| 도메인 모델에서 경로를 뽑는다 | 경로 구조는 도메인의 엔티티와 소속 관계를 따른다 | 장바구니 → `/carts/{cartId}/items/{itemId}` |
| 메서드를 몇 개로 줄인다 | 팀이 쓰는 메서드와 의미를 정해 둔다. PATCH의 부분 수정 형식처럼 해석이 갈리는 부분은 미리 합의한다 | GET·POST·PUT·DELETE + 합의한 PATCH |
| 멱등성을 미리 설계한다 | GET·PUT·DELETE는 원래 멱등이다. POST는 클라이언트가 보낸 **멱등 키**로 같은 요청을 한 번만 처리하게 만든다 | `Idempotency-Key: 6f1c…` 헤더, 서버는 키별 결과를 저장해 재시도에 같은 응답 |
| 상태 코드를 몇 개로 정한다 | 쓰는 코드 집합을 정해 두면 클라이언트 분기가 단순해진다 | 200·201·204·400·401·403·404·409·429·500 |
| 처음부터 버전을 둔다 | 호환이 깨지는 변경을 새 버전으로 낼 길을 열어 둔다([[semantic-versioning\|유의적 버전]]) | `/v1/orders`, 또는 `Accept` 헤더의 버전 |
| 의미가 드러나는 경로 | 문서에서 찾기 쉽고 이름만으로 뜻이 통한다 | `/users/{id}/orders` |
| 일괄 처리는 경로 끝에 키워드 | 여러 건을 한 번에 다루는 엔드포인트를 구분한다 | `POST /orders/batch` |
| 질의 규칙을 통일한다 | 페이지네이션·정렬·필터의 파라미터 이름과 형식을 모든 목록 API에서 같게 한다([[api-pagination\|API 페이지네이션]]) | `?status=paid&sort=-created_at&limit=20&cursor=…` |
| 인증 방식을 정한다 | Basic 인증은 피하고 토큰(JWT), OAuth, API 키, 요청 서명 중 소비자에 맞게 고른다([[api-request-signing\|HMAC 요청 서명]]) | `Authorization: Bearer …` |

## REST 이전: SOAP

| 기술 | 역할 |
| --- | --- |
| SOAP | HTTP·HTTPS·SMTP 위에서 **XML 메시지**를 주고받는 통신 규약. Envelope(전체 정의), Header(선택), Body(실제 메시지)로 구성 |
| WSDL | 웹 서비스의 이름, 위치, 메시지 형식, 프로토콜을 **XML로 기술**한 문서. 클라이언트가 이를 읽고 사용할 수 있는 기능을 파악 |
| UDDI | WSDL로 기술된 웹 서비스를 등록·검색하는 저장소 |

REST 이전의 웹 서비스는 이 세 기술을 묶어 썼다. SOAP은 메시지가 무거워 공개 웹 API는 대부분 REST(JSON)로 만든다. SOAP은 금융·공공 같은 기존 기업 시스템 연계에 남아 있다.

## 장점과 한계

- **장점**: HTTP 인프라를 그대로 사용하므로 별도 인프라가 필요 없고, HTTP를 지원하는 어떤 플랫폼에서도 쓸 수 있으며, 서버·클라이언트 역할이 명확히 분리된다.
- **한계**: 공식 "표준"이 아니라 스타일이므로 팀마다 세부 규칙을 정해야 한다. 메서드만으로 표현하기 어려운 복잡한 행위(예: 검색, 일괄 처리)는 설계 판단이 필요하고, 화면마다 필요한 데이터가 다르면 과다·과소 조회(over/under-fetching)가 생기기도 한다. 이런 한계 때문에 GraphQL·BFF 같은 대안이 쓰이기도 한다.

## 핵심 정리

- URI는 **무엇을**(자원), 메서드는 **어떻게**(행위)를 나타낸다.
- PUT은 전체 교체(멱등), PATCH는 부분 수정(멱등 보장 안 됨), POST는 생성·기타 작업(멱등 아님)이다.
- 응답에는 적절한 상태 코드(200, 201, 400, 401, 404 …)를 함께 돌려준다.

관련 노트: [[api-architectural-styles|API 아키텍처 스타일]], [[graphql|GraphQL]], [[api-pagination|API 페이지네이션]], [[Computer-Science/Network/http|HTTP 프로토콜]], [[backend-developer-roadmap|백엔드 개발자가 알아야 할 것]], [[web-services-and-it-trends|웹 서비스와 IT 신기술 용어]], [[drf-serializer|DRF Serializer와 관계 표현]], [[grpc|gRPC]]

더 읽을거리: 「[그런 REST API로 괜찮은가](https://www.youtube.com/watch?v=RP_f5dMoHFc)」(DEVIEW 2017 영상)

참고: [Microsoft REST API 디자인 가이드](https://learn.microsoft.com/ko-kr/azure/architecture/best-practices/api-design)
