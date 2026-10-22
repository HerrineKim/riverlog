---
title: "REST API 설계"
concept: "REST API"
summary: "자원을 URI로 표현하고 HTTP 메서드로 행위를 나타내는 API 설계 방식과 그 규칙. REST의 여섯 제약과 균일한 인터페이스(자기 서술적 메시지·HATEOAS), URI 규칙과 자원 원형, 상태 코드와 오류 응답(RFC 9457), 멱등 키·버전 관리 방식·비동기 요청·조건부 요청·응답 모양 같은 실무 설계 팁까지."
tags: ["http", "api", "rest", "backend"]
source: til
date: "2026-10-21"
sources: ["https://riverkim.kr/308", "https://bytebytego.com/guides/8-tips-for-efficient-api-design", "https://bytebytego.com/guides/how-do-we-design-effective-and-safe-apis", "https://bytebytego.com/guides/rest-api-cheatsheet", "https://bytebytego.com/guides/how-does-rest-api-work", "https://blog.npcode.com/2017/04/03/rest의-representation이란-무엇인가/", "https://sanghaklee.tistory.com/57", "https://evan-moon.github.io/2020/04/07/about-restful-api/", "https://1ambda.github.io/javascripts/rest-api-put-vs-post/", "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design", "https://github.com/microsoft/api-guidelines", "https://github.com/interagent/http-api-design", "https://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api", "https://blog.restcase.com/rest-api-error-codes-101/", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/REST%20API.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EC%9B%B9%20%EC%A7%80%EC%8B%9D/%ED%81%B4%EB%9D%BC%EC%9D%B4%EC%96%B8%ED%8A%B8%20-%20%EC%84%9C%EB%B2%84%20API%20URI%20%EC%84%A4%EA%B3%84%EB%B2%95.md"]
---

> 「실무 설계 팁」 섹션은 ByteByteGo의 System Design 101 가이드 「[8 Tips for Efficient API Design](https://bytebytego.com/guides/8-tips-for-efficient-api-design)」, 「[How to Design Effective and Safe APIs](https://bytebytego.com/guides/how-do-we-design-effective-and-safe-apis)」, 「[REST API Cheatsheet](https://bytebytego.com/guides/rest-api-cheatsheet)」, 「[How does REST API work?](https://bytebytego.com/guides/how-does-rest-api-work)」을 바탕으로 보강했다. 「리소스와 표현」은 「[REST의 representation이란 무엇인가](https://blog.npcode.com/2017/04/03/rest의-representation이란-무엇인가/)」와 「[프론트엔드와 백엔드가 소통하는 엔드포인트, RESTful API](https://evan-moon.github.io/2020/04/07/about-restful-api/)」, 오류 응답 규칙은 「[RESTful API 설계 가이드](https://sanghaklee.tistory.com/57)」, POST와 PUT의 위치 결정은 「[REST API에서 PUT과 POST의 차이](https://1ambda.github.io/javascripts/rest-api-put-vs-post/)」로 보강했다. 버전 관리·비동기 요청·조건부 요청·응답 모양·오류 형식·성숙도 모델은 Microsoft의 「[Best practices for RESTful web API design](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)」, 「[Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)」, Heroku의 「[HTTP API Design Guide](https://github.com/interagent/http-api-design)」, 「[Best Practices for Designing a Pragmatic RESTful API](https://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api)」, 「[REST API Error Codes 101](https://blog.restcase.com/rest-api-error-codes-101/)」을 바탕으로 보강했다.
> 균일한 인터페이스의 네 조건과 독립적 진화는 「[Frontend_TIL: REST API](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/REST%20API.md)」(이응준의 「그런 REST API로 괜찮은가」 강연 정리)를, URI 원형은 「[클라이언트 - 서버 API URI 설계법](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EC%9B%B9%20%EC%A7%80%EC%8B%9D/%ED%81%B4%EB%9D%BC%EC%9D%B4%EC%96%B8%ED%8A%B8%20-%20%EC%84%9C%EB%B2%84%20API%20URI%20%EC%84%A4%EA%B3%84%EB%B2%95.md)」을 바탕으로 보강했다.

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
| Create | `POST` | `POST /cats`: 고양이 생성 |
| Read | `GET` | `GET /cats`, `GET /cats/:id` |
| Update(전체) | `PUT` | `PUT /cats/:id`: 전체 교체 |
| Update(부분) | `PATCH` | `PATCH /cats/:id`: 일부 필드만 수정 |
| Delete | `DELETE` | `DELETE /cats/:id` |

### POST, PUT, PATCH의 차이와 멱등성

같은 요청을 여러 번(또는 동시에) 보내도 리소스가 손상되지 않고 결과가 항상 같으면 **멱등(idempotent)하다고** 한다. 재시도해도 안전한지가 여기서 갈린다.

| 메서드 | 할 수 있는 일 | URI | 멱등성 |
| --- | --- | --- | --- |
| POST | 리소스 생성, 또는 서버가 정의한 다양한 작업 | 컬렉션 URI면 된다 (`POST /cats`) | 보장되지 않음. 두 번 보내면 두 개가 생길 수 있다 |
| PUT | 리소스를 **통째로** 교체하거나, 없으면 그 URI로 생성 | 대상 URI를 정확히 알아야 한다 (`PUT /cats/3`) | 멱등. 같은 내용으로 몇 번을 덮어써도 결과가 같다 |
| PATCH | 리소스의 **일부**만 수정. 생성은 하지 않는다 | 대상 URI를 정확히 알아야 한다 | 보장되지 않음. "나이 +1"처럼 상대적 변경이면 보낼 때마다 결과가 달라진다 |

**리소스의 위치를 누가 정하느냐**로도 갈린다. POST는 서버가 새 리소스의 URI를 정해 `201 Created`와 `Location` 헤더로 알려 주고, PUT은 클라이언트가 URI를 지정한다. PUT으로 일부 필드만 보내면 빠진 필드가 비워질 수 있다. 필드 몇 개만 고치는 화면이라면 PATCH가 의도에 맞다. ([POST, PUT, PATCH의 차이점, 토스페이먼츠 개발자센터](https://docs.tosspayments.com/blog/rest-api-post-put-patch))

## REST의 제약 조건

REST는 Roy Fielding이 웹(분산 하이퍼미디어 시스템)을 위해 정리한 **아키텍처 스타일, 즉 제약 조건의 묶음**이다. HTTP를 확장하면서 이미 퍼진 웹을 깨지 않으려면 어떤 성질을 지켜야 하는지가 출발점이었다. 제약을 모두 지켜야 REST다.

1. **Client-Server**: 클라이언트와 서버의 역할을 분리한다.
2. **Stateless**: 서버는 요청 사이의 클라이언트 상태를 저장하지 않는다. 각 요청이 필요한 정보를 모두 담는다.
3. **Cacheable**: HTTP 캐시 기능을 그대로 활용할 수 있다.
4. **Layered System**: 클라이언트는 중간에 프록시·로드밸런서가 있어도 알 필요가 없다.
5. **Uniform Interface**: 자원을 다루는 일관된 인터페이스. 아래 네 가지로 이루어진다.
6. **Code on Demand** (선택): 서버가 실행 가능한 코드(스크립트)를 내려보내 클라이언트 기능을 넓힐 수 있다. 여섯 제약 중 유일하게 선택 사항이다.

HTTP를 쓰면 1~4는 거의 저절로 지켜진다. 어려운 것은 균일한 인터페이스다.

### 균일한 인터페이스의 네 조건

| 조건 | 뜻 | 실무 API |
| --- | --- | --- |
| 자원 식별 | 자원을 URI로 식별한다 | 대체로 지킨다 |
| 표현을 통한 조작 | 자원을 직접 건드리지 않고 표현(JSON 등)을 주고받아 만들고·고치고·지운다 | 대체로 지킨다 |
| 자기 서술적 메시지(self-descriptive) | 메시지만 보고 뜻을 **온전히** 해석할 수 있어야 한다 | 잘 안 지킨다 |
| HATEOAS | 애플리케이션 상태 전이를 하이퍼링크로 한다 | 잘 안 지킨다 |

**자기 서술적 메시지**는 문법뿐 아니라 의미까지 메시지에 담는다는 뜻이다. `Content-Type: application/json`은 「JSON으로 파싱하라」까지만 알려 주고, `op`·`path` 같은 키가 무슨 뜻인지는 알려 주지 않는다. `application/json-patch+json`처럼 명세가 있는 미디어 타입을 쓰면 클라이언트는 그 명세를 찾아 의미를 해석할 수 있다. 직접 만든 형식이라면 미디어 타입을 정의해 IANA에 등록하거나, `Link: <https://example.com/docs/todo>; rel="profile"`로 명세 문서를 걸어 준다.

**HATEOAS**는 응답이 「다음에 할 수 있는 일」의 링크를 담아, 클라이언트가 URI를 외우지 않고 링크를 따라 상태를 옮겨 가게 하는 것이다. HTML 페이지의 `<a>`가 그 예다. JSON API에서는 본문에 링크 필드를 두거나(HAL 같은 하이퍼미디어 형식), `Link`·`Location` 헤더를 쓴다.

```http
HTTP/1.1 200 OK
Content-Type: application/json
Link: </articles/1>; rel="previous", </articles/3>; rel="next"

{ "id": 2, "title": "..." }
```

클라이언트는 `/articles/3`을 코드에 박지 않고 `rel="next"`라는 **관계 이름만** 알면 된다. 서버가 URI 구조를 바꿔도 클라이언트를 고치지 않아도 된다.

### 왜 이렇게까지 하나: 독립적 진화

균일한 인터페이스의 목적은 **서버와 클라이언트가 서로 몰래 바뀔 수 있게** 하는 것이다. 웹이 그 예다. 사이트가 바뀌어도 브라우저를 업데이트할 필요가 없고, 브라우저가 바뀌어도 사이트가 깨지지 않으며, HTTP·HTML 명세가 바뀌어도 웹은 돌아간다. 반대로 서버 API가 바뀌었다고 모바일 앱을 강제 업데이트해야 한다면 독립적 진화가 안 되는 구조다.

그래서 오늘날 「REST API」라 불리는 JSON API 대부분은 엄밀히는 REST가 아니라 **HTTP API**다. 클라이언트와 서버를 같은 팀이 함께 배포하거나 오래 진화할 필요가 없다면 REST를 끝까지 지키지 않아도 된다. 대신 그렇게 부르는 것이 정확하다. 수많은 클라이언트가 오래 쓰는 공개 API일수록 자기 서술성과 하이퍼링크의 가치가 커진다.

API가 REST에 얼마나 다가갔는지는 리처드슨 성숙도 모델(Richardson Maturity Model)의 네 단계로 잰다.

| 수준 | 모습 |
| --- | --- |
| 0 | URI 하나에 POST로 모든 작업을 보낸다(RPC over HTTP) |
| 1 | 자원마다 URI가 있다 |
| 2 | HTTP 메서드와 상태 코드를 의미대로 쓴다. 대부분의 실무 「REST API」가 여기다 |
| 3 | 응답에 다음 행동의 링크를 담는다(HATEOAS). 여기까지 와야 REST다 |

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

URI가 가리키는 자원은 네 가지 원형(archetype)으로 나눈다.

| 원형 | 뜻 | 예 |
| --- | --- | --- |
| 문서(document) | 단일 자원. 파일 하나, 객체 인스턴스 하나 | `GET /members/100` |
| 컬렉션(collection) | **서버가 관리하는** 자원 묶음. 클라이언트는 묶음에 POST하고, 새 자원의 URI는 서버가 정해 `Location`으로 알려 준다 | `POST /members` |
| 스토어(store) | **클라이언트가 관리하는** 저장소. 클라이언트가 URI를 정해 PUT으로 넣는다 | `PUT /files/star.jpg` |
| 컨트롤러(control URI) | 메서드 몇 개로 표현하기 어려운 처리. 마지막 경로에 **동사**를 쓴다 | `POST /orders/7/cancel`, `POST /members/3/upgrade` |

대부분은 컬렉션으로 설계한다. 클라이언트가 새 자원의 위치를 미리 알기 어렵기 때문이다. 컨트롤러 URI는 동사 금지 규칙의 예외지만 「취소」, 「재발송」처럼 상태 전이 자체가 행위인 경우에만 쓴다. `GET /members/3/delete` 같은 컨트롤러로 CRUD를 대신하지 않는다.

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

Django에서 이 설계를 구현하는 방법은 [[drf-serializer|DRF Serializer와 관계 표현]]에서 다룬다.

## 상태 코드와 오류 응답

상태 코드는 먼저 **누구 잘못인가**를 알린다. `4xx`는 클라이언트가 요청을 고쳐야 하므로 그대로 다시 보내도 소용없다. `5xx`는 서버 문제라 같은 요청을 나중에 다시 보내면 성공할 수 있다([[resiliency-patterns\|재시도 규칙]]). 쓰는 코드 집합을 200·201·204·400·401·403·404·409·429·500 정도로 정해 두면 클라이언트 분기가 단순해진다.

자주 헷갈리는 경우는 다음과 같다.

| 상황 | 응답 |
| --- | --- |
| 생성 성공 | `201 Created` |
| 삭제 성공 | `204 No Content` (본문 없음. 메시지를 보내려면 `200 OK`) |
| 입력 검증 실패 | `400 Bad Request` |
| 대상 없음 | `404 Not Found` |
| 목록이 비어 있음 | `200 OK` + 빈 배열 `[]` (빈 목록은 정상 상태이므로 404로 처리하지 않는다) |
| 메서드를 지원하지 않음 | `405 Method Not Allowed` + `Allow` 헤더로 허용 메서드를 알린다 |
| 업무 규칙상 지금 처리할 수 없음 (이미 취소된 주문 결제 등) | `409 Conflict` |
| 읽은 뒤 그사이 바뀐 자원을 고치려 함 | `412 Precondition Failed` (아래 「조건부 요청」) |
| 요청이 너무 많음 | `429 Too Many Requests` + `Retry-After` |

오류 응답은 다음 규칙을 따른다.

- **실패를 `200 OK`로 보내고 본문으로 성공 여부를 알리지 않는다.** 캐시·모니터링·클라이언트 라이브러리가 모두 상태 코드를 보고 동작한다.
- 세부 오류는 상태 코드를 반복하지 말고 본문에 **프로그램이 분기할 오류 종류**와 사람이 읽을 설명을 나눠 담는다. 표준 형식은 `application/problem+json`(RFC 9457)이다.
- `400`에는 어느 필드가, 어떤 값 때문에, 왜 틀렸는지를 담는다. problem 형식에서는 확장 필드(`errors: [{field, message}]`)로 덧붙인다.
- `5xx`의 내부 정보(스택 트레이스, 쿼리)는 노출하지 않는다. 대신 요청 ID를 줘서 로그와 잇게 한다.

```json
{
  "type": "https://api.example.com/problems/insufficient-stock",
  "title": "재고가 부족합니다",
  "status": 409,
  "detail": "상품 42의 재고는 3개입니다",
  "instance": "/orders/7",
  "requestId": "req_8f2c"
}
```

`type`은 오류 종류를 가리키는 문서 URL이다. 프로그램은 `type`으로 분기하고 `title`·`detail`은 사람에게 보여 주므로, 메시지 문구를 바꿔도 클라이언트가 깨지지 않는다.

## 실무 설계 팁

**API 설계는 URL 경로 설계만이 아니다.** 자원 이름과 식별자, 경로 패턴을 고르는 일과 함께 헤더(인증, 멱등 키, 캐시), 게이트웨이의 레이트 리밋 규칙까지 계약의 일부로 설계한다.

| 팁 | 내용 | 예 |
| --- | --- | --- |
| 도메인 모델에서 경로를 뽑는다 | 경로 구조는 도메인의 엔티티와 소속 관계를 따른다 | 장바구니 → `/carts/{cartId}/items/{itemId}` |
| 메서드를 몇 개로 줄인다 | 팀이 쓰는 메서드와 의미를 정해 둔다. PATCH의 부분 수정 형식처럼 해석이 갈리는 부분은 미리 합의한다 | GET·POST·PUT·DELETE + 합의한 PATCH |
| 멱등성을 미리 설계한다 | GET·PUT·DELETE는 원래 멱등이다. POST는 클라이언트가 보낸 **멱등 키**로 같은 요청을 한 번만 처리하게 만든다 | `Idempotency-Key: 6f1c…` 헤더, 서버는 키별 결과를 저장해 재시도에 같은 응답 |
| 상태 코드를 몇 개로 정한다 | 쓰는 코드 집합을 정해 두면 클라이언트 분기가 단순해진다(위 「상태 코드와 오류 응답」) | 200·201·204·400·401·403·404·409·429·500 |
| 처음부터 버전을 둔다 | 호환이 깨지는 변경을 새 버전으로 낼 길을 열어 둔다([[semantic-versioning\|유의적 버전]]). 방식은 아래 표 | `/v1/orders`, 또는 `Accept` 헤더의 버전 |
| 의미가 드러나는 경로 | 문서에서 찾기 쉽고 이름만으로 뜻이 통한다 | `/users/{id}/orders` |
| 일괄 처리는 경로 끝에 키워드 | 여러 건을 한 번에 다루는 엔드포인트를 구분한다 | `POST /orders/batch` |
| 질의 규칙을 통일한다 | 페이지네이션·정렬·필터의 파라미터 이름과 형식을 모든 목록 API에서 같게 한다([[api-pagination\|API 페이지네이션]]) | `?status=paid&sort=-created_at&limit=20&cursor=…` |
| 인증 방식을 정한다 | Basic 인증은 피하고 토큰(JWT), OAuth, API 키, 요청 서명 중 소비자에 맞게 고른다([[api-request-signing\|HMAC 요청 서명]]) | `Authorization: Bearer …` |

### 버전 관리 방식

| 방식 | 예 | 장점 | 단점 |
| --- | --- | --- | --- |
| 버전 없음 | 필드 추가만 하고 깨는 변경은 하지 않는다 | 가장 단순하다 | 이름 변경·삭제 같은 깨는 변경을 할 길이 없다 |
| URI | `/v2/customers/3` | 눈에 잘 띄고 캐시·라우팅이 쉽다. 가장 흔하다 | 같은 자원이 버전마다 다른 URI를 가져 HATEOAS 링크가 복잡해진다 |
| 쿼리 문자열 | `/customers/3?api-version=2024-10-01` | 기본값을 둘 수 있다. Azure가 날짜형 버전으로 쓴다 | 쿼리를 무시하는 캐시가 있다 |
| 사용자 정의 헤더 | `Api-Version: 2` | URI가 깨끗하다 | 브라우저 주소창으로 시험하기 어렵고, 캐시가 헤더를 키에 넣어야 한다(`Vary`) |
| 미디어 타입 | `Accept: application/vnd.example.v2+json` | HTTP 콘텐츠 협상에 가장 맞는다 | 가장 번거롭다 |

어떤 방식이든 **필드 추가는 깨는 변경이 아니게** 설계한다. 클라이언트는 모르는 필드를 무시하고(관대한 읽기), 서버는 필드를 지우거나 의미를 바꿀 때만 새 버전을 낸다.

### 오래 걸리는 작업: 비동기 요청

처리에 수 초 이상 걸리면 요청을 붙잡지 않는다.

```text
POST /reports              → 202 Accepted
                             Location: /reports/status/42
GET  /reports/status/42    → 200 {"status": "running"}   (+ Retry-After: 5)
GET  /reports/status/42    → 303 See Other
                             Location: /reports/42        ← 끝나면 결과 자원으로
```

### 동시 수정 막기: 조건부 요청

두 사용자가 같은 자원을 읽고 각자 고치면 나중 쓰기가 앞 쓰기를 덮는다(lost update). **`ETag`를 버전으로 쓰는 낙관적 동시성 제어**로 막는다.

| 요청 | 의미 | 결과 |
| --- | --- | --- |
| `PUT /orders/7` + `If-Match: "v3"` | 내가 읽은 버전이 v3일 때만 바꿔라 | 그사이 바뀌었으면 `412 Precondition Failed`. 클라이언트는 다시 읽고 합친다 |
| `PUT /orders/7` + `If-None-Match: *` | 아직 없을 때만 만들어라 | 이미 있으면 `412` |
| `GET /orders/7` + `If-None-Match: "v3"` | 바뀌었을 때만 본문을 달라 | 안 바뀌었으면 `304` ([[http-cache\|HTTP 캐시]]) |

### 응답 모양

| 장치 | 예 | 목적 |
| --- | --- | --- |
| 부분 응답 | `GET /users/3?fields=id,name` | 필요한 필드만 받아 과다 조회를 줄인다. 더 나아가면 GraphQL이다 |
| 관련 자원 포함 | `GET /orders/7?embed=customer` | 왕복을 줄인다. 깊이를 제한한다 |
| 봉투(envelope) 최소화 | `{"data": …, "meta": …}`로 감싸지 않고 본문에 자원을 바로 둔다. 페이지 정보는 `Link` 헤더나 최상위 필드로 | HTTP가 이미 상태 코드·헤더를 주므로 겹치지 않게 한다. 헤더를 못 읽는 클라이언트(JSONP 시절)만 봉투가 필요했다 |
| 일관된 표기 | 필드는 `camelCase`(또는 팀이 정한 하나), 시각은 UTC ISO 8601(`2026-10-21T03:00:00Z`), ID는 문자열(UUID) | 언어마다 숫자 범위가 달라 큰 정수 ID가 깨지는 것을 막는다 |
| 요청 추적 | 응답마다 `Request-Id`를 주고, 서비스 사이에는 W3C `traceparent`를 넘긴다 | 오류 보고와 로그를 잇는다([[observability\|관측 가능성]]) |
| 속도 제한 알림 | `429` + `Retry-After`. 남은 한도는 `X-RateLimit-Limit`·`-Remaining`·`-Reset`(관례)이나 IETF 초안의 `RateLimit`·`RateLimit-Policy` 헤더로 알린다 | 클라이언트가 스스로 속도를 늦춘다 |

멀티테넌트 API는 테넌트를 서브도메인(`acme.api.example.com`), 헤더(`X-Tenant-ID`), 경로(`/tenants/acme/…`) 중 하나로 식별한다. 서브도메인은 DNS·TLS 단계에서 격리가 쉽고, 헤더는 URI를 깔끔하게 두지만 게이트웨이가 반드시 검증해야 한다.

API 계약은 OpenAPI 명세로 문서화하고, 명세에서 문서·클라이언트 코드·목 서버를 생성한다([[swagger|Swagger]]).

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
- 응답에는 적절한 상태 코드(200, 201, 400, 401, 404 …)를 함께 돌려준다. `4xx`는 고쳐서 보내야 하고 `5xx`는 다시 보내면 될 수 있다. 세부 오류는 `application/problem+json`으로 준다.
- 경로 다음으로 버전 방식, 오래 걸리는 작업(`202`), 동시 수정(`If-Match`), 응답 모양까지 계약으로 정한다.

관련 노트: [[api-architectural-styles|API 아키텍처 스타일]], [[graphql|GraphQL]], [[api-pagination|API 페이지네이션]], [[Computer-Science/Network/http|HTTP 프로토콜]], [[backend-developer-roadmap|백엔드 개발자가 알아야 할 것]], [[web-services-and-it-trends|웹 서비스와 IT 신기술 용어]], [[drf-serializer|DRF Serializer와 관계 표현]], [[grpc|gRPC]]

더 읽을거리: 「[그런 REST API로 괜찮은가](https://www.youtube.com/watch?v=RP_f5dMoHFc)」(DEVIEW 2017 영상)

참고: [Microsoft REST API 디자인 가이드](https://learn.microsoft.com/ko-kr/azure/architecture/best-practices/api-design)
