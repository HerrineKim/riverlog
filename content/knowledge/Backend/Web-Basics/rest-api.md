---
title: "REST API 설계"
concept: "REST API"
summary: "자원을 URI로 표현하고 HTTP 메서드로 행위를 나타내는 API 설계 방식과 그 규칙."
tags: ["http", "api", "rest", "backend"]
source: til
---

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

## REST의 특징

1. **Client-Server**: 클라이언트와 서버의 역할을 분리한다.
2. **Stateless**: 서버는 요청 사이의 클라이언트 상태를 저장하지 않는다. 각 요청이 필요한 정보를 모두 담는다.
3. **Cacheable**: HTTP 캐시 기능을 그대로 활용할 수 있다.
4. **Layered System**: 클라이언트는 중간에 프록시·로드밸런서가 있어도 알 필요가 없다.
5. **Uniform Interface**: URI와 메서드로 자원을 다루는 일관된 인터페이스.

## URI 설계 규칙

1. 동사보다 **명사**, 대문자보다 **소문자**를 쓴다. 행위는 URI가 아니라 메서드로 표현한다.
   - 나쁜 예: `GET /getCats`, `POST /cats/delete/3`
   - 좋은 예: `GET /cats`, `DELETE /cats/3`
2. 마지막에 슬래시(`/`)를 붙이지 않는다.
3. 단어 구분은 언더바(`_`) 대신 **하이픈(`-`)**을 쓴다. (`/cat-profiles`)
4. 파일 확장자를 URI에 넣지 않는다. 형식은 `Accept`/`Content-Type` 헤더로 표현한다.
5. 컬렉션은 복수형, 계층 관계는 경로로 표현한다. (`/cats/3/friends`)

## 장점과 한계

- **장점**: HTTP 인프라를 그대로 사용하므로 별도 인프라가 필요 없고, HTTP를 지원하는 어떤 플랫폼에서도 쓸 수 있으며, 서버·클라이언트 역할이 명확히 분리된다.
- **한계**: 공식 "표준"이 아니라 스타일이므로 팀마다 세부 규칙을 정해야 한다. 메서드만으로 표현하기 어려운 복잡한 행위(예: 검색, 일괄 처리)는 설계 판단이 필요하고, 화면마다 필요한 데이터가 다르면 과다·과소 조회(over/under-fetching)가 생기기도 한다. 이런 한계 때문에 GraphQL·BFF 같은 대안이 쓰이기도 한다.

## 핵심 정리

- URI는 **무엇을**(자원), 메서드는 **어떻게**(행위)를 나타낸다.
- PUT은 전체 교체, PATCH는 부분 수정이다.
- 응답에는 적절한 상태 코드(200, 201, 400, 401, 404 …)를 함께 돌려준다.

참고: [Microsoft REST API 디자인 가이드](https://learn.microsoft.com/ko-kr/azure/architecture/best-practices/api-design)
