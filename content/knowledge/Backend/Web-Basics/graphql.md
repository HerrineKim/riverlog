---
title: "GraphQL"
concept: "GraphQL"
summary: "GraphQL은 타입 스키마 위에서 클라이언트가 필요한 필드를 골라 질의하는 API 질의 언어이자 런타임이다. 쿼리·뮤테이션·구독, REST와의 비교, N+1·캐시·악성 쿼리 같은 약점과 대책, 클라이언트 래핑·BFF·모놀리식·페더레이션 네 가지 도입 패턴, 등록된 쿼리로 운영하는 방식을 정리했다."
tags: ["backend", "api", "graphql", "architecture", "http"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/what-is-graphql", "https://bytebytego.com/guides/rest-api-vs-graphql", "https://bytebytego.com/guides/graphql-adoption-patterns", "https://bytebytego.com/guides/how-does-graphql-work-in-the-real-world", "https://graphql.org/learn/", "https://graphql.org/learn/queries/", "https://tech.kakao.com/posts/364", "https://graphql.org/learn/schema/"]
---

> ByteByteGo의 System Design 101 가이드 「[What is GraphQL?](https://bytebytego.com/guides/what-is-graphql)」, 「[REST API vs. GraphQL](https://bytebytego.com/guides/rest-api-vs-graphql)」, 「[GraphQL Adoption Patterns](https://bytebytego.com/guides/graphql-adoption-patterns)」, 「[How GraphQL Works at LinkedIn](https://bytebytego.com/guides/how-does-graphql-work-in-the-real-world)」을 바탕으로 재구성한 노트다. 스키마·리졸버·연산 이름과 변수는 「[GraphQL 개념잡기](https://tech.kakao.com/posts/364)」로 보강했다. 타입 시스템은 graphql.org의 「[Schemas and Types](https://graphql.org/learn/schema/)」로, 별칭·프래그먼트·지시어는 「[Queries](https://graphql.org/learn/queries/)」로 보강했다.

## GraphQL이란

GraphQL은 **API를 위한 질의 언어이자, 그 질의를 실행하는 런타임**이다. 서버는 데이터의 모양을 타입 스키마로 정의하고, 클라이언트는 그 스키마 안에서 **필요한 필드만 골라** 한 번에 요청한다. Meta가 2012년 사내용으로 만들어 2015년에 공개했고, 지금은 GraphQL Foundation이 명세를 관리한다.

GraphQL 서버는 클라이언트와 여러 백엔드 사이에 서서 자원을 **그래프**로 엮는다. 사용자 → 주문 → 상품처럼 관계를 따라 내려가는 질의를 한 요청으로 처리하고, 각 필드 값은 리졸버(resolver) 함수가 DB나 다른 API에서 가져온다.

```graphql
type User { id: ID!, name: String!, orders(first: Int): [Order!]! }
type Order { id: ID!, total: Int!, items: [Item!]! }

query {
  user(id: "42") {
    name
    orders(first: 3) { total }
  }
}
```

응답은 질의와 같은 모양의 JSON이다. 요청하지 않은 필드는 오지 않는다.

## 세 가지 작업

| 작업 | 역할 | REST로 치면 |
| --- | --- | --- |
| 쿼리(query) | 데이터 읽기 | `GET` |
| 뮤테이션(mutation) | 데이터 생성·수정·삭제 | `POST`·`PATCH`·`DELETE` |
| 구독(subscription) | 이벤트가 생길 때 서버가 밀어 주는 실시간 갱신. 보통 WebSocket이나 SSE 위에서 동작 | 별도 실시간 채널 |

## 스키마, 리졸버, 연산 이름과 변수

**SQL과 이름이 닮았지만 쓰는 자리가 다르다.** SQL은 백엔드가 DB에서 데이터를 꺼내려고 쓰는 언어이고, GraphQL은 **클라이언트가 서버에서 데이터를 꺼내려고** 쓰는 언어다. 특정 DB나 전송 방식에 묶이지도 않는다. 보통 HTTP POST로 보내고 구독은 WebSocket을 쓰지만, 명세상 다른 전송 계층도 쓸 수 있다.

| 요소 | 내용 |
| --- | --- |
| 오브젝트 타입·필드 | `type Character { name: String! appearsIn: [Episode]! }`처럼 정의한다. 헤더 파일에 함수 시그니처를 적는 일과 비슷하다 |
| 스칼라 타입 | `String`, `Int`, `Float`, `Boolean`, `ID` |
| `!` / `[ ]` | 널 불가 / 목록. 위치에 따라 뜻이 다르다. `[String!]`은 목록은 null일 수 있지만 원소는 null이 아니고, `[String]!`은 목록은 항상 있지만 원소가 null일 수 있다 |
| 열거형(`enum`) | 허용 값이 정해진 스칼라. `enum Episode { NEWHOPE EMPIRE JEDI }` |
| 인터페이스(`interface`) | 여러 타입이 공유하는 필드 묶음. `type Human implements Character`. 질의에서 타입별 필드는 `... on Human { height }`(인라인 프래그먼트)로 고른다 |
| 유니온(`union`) | 공통 필드 없이 「이 중 하나」인 타입. `union SearchResult = Human \| Droid \| Starship`. 검색 결과처럼 모양이 제각각일 때 쓴다 |
| 입력 타입(`input`) | 뮤테이션 인자로 넘기는 객체. 출력용 `type`과 따로 정의한다. `input ReviewInput { stars: Int! commentary: String }` |
| 사용자 정의 스칼라 | `scalar DateTime`처럼 선언하고 직렬화·검증은 서버 구현이 맡는다 |
| 인자 | 필드마다 인자를 받는다. `height(unit: LengthUnit = METER): Float`처럼 기본값을 둔다 |
| 리졸버 | 필드 값을 실제로 가져오는 함수. 파싱·검증은 라이브러리가 하지만 **데이터를 어디서 어떻게 가져올지는 직접 구현**한다. 그래서 DB, 다른 REST API, 캐시 등 어떤 소스든 붙일 수 있다 |
| 연산 이름 | `query GetHero { … }`처럼 이름을 붙인 질의. 로그·모니터링에서 질의를 구분하고 등록된 쿼리의 키가 된다 |
| 변수 | `query GetHero($id: ID!) { hero(id: $id) { name } }`처럼 값을 질의 밖에서 넣는다. 문자열을 이어 붙여 질의를 만들지 않으므로 캐시와 보안에 유리하다 |
| 별칭(alias) | `empireHero: hero(episode: EMPIRE) { name }`처럼 결과 키 이름을 바꾼다. 같은 필드를 인자만 달리해 한 질의에서 두 번 부를 수 있다 |
| 프래그먼트(fragment) | `fragment comparisonFields on Character { name friends { name } }`로 필드 묶음을 정의하고 `...comparisonFields`로 재사용한다. 컴포넌트마다 자기가 쓰는 필드를 프래그먼트로 선언하는 방식(Relay, Apollo)의 기반이다 |
| `__typename` | 결과마다 실제 타입 이름을 받는다. 인터페이스·유니언 결과를 클라이언트가 구분하고 캐시 키를 만들 때 쓴다 |
| 지시어(directive) | `friends @include(if: $withFriends)`, `@skip(if: …)`처럼 변수로 필드를 넣고 뺀다. 질의 문자열을 조작하지 않고 모양을 바꾼다 |

쿼리와 뮤테이션은 내부 실행 방식이 거의 같고, 읽기와 쓰기를 나누는 규약이다. 차이는 뮤테이션의 최상위 필드가 **순서대로** 실행된다는 점이다(쿼리는 병렬로 실행될 수 있다).

REST에서는 프론트엔드가 백엔드가 정한 요청·응답 형식에 의존한다. GraphQL에서는 화면에 필요한 모양을 클라이언트가 질의로 정하므로 그 의존이 줄고, 협업의 접점이 **스키마**로 옮겨 간다.

## REST와 비교

| 항목 | REST | GraphQL |
| --- | --- | --- |
| 엔드포인트 | 리소스마다 여러 개 | 보통 하나(`/graphql`) |
| 응답 모양 | 서버가 정한다 | 클라이언트가 질의로 정한다 |
| 관련 데이터 조합 | 여러 엔드포인트를 차례로 불러 조립 (왕복이 늘어난다) | 한 질의로 중첩해 가져온다 |
| 타입·계약 | 느슨하다. OpenAPI로 보강 | 스키마가 곧 계약. 도구가 타입을 생성한다 |
| HTTP 캐시 | URL 단위라 쉽다 | 단일 엔드포인트·POST라 기본으로는 어렵다 |
| 복잡도의 위치 | 서버가 엔드포인트를 늘린다 | 클라이언트 질의와 서버 리졸버로 옮겨 간다 |
| 잘 맞는 곳 | 단순하고 일관된 계약, 공개 API | 화면이 자주 바뀌고 여러 소스의 데이터를 묶어야 하는 앱 |

**GraphQL은 REST의 대체재라기보다 다른 선택지다.** 계약이 단순하고 고정적이면 REST가 운영하기 쉽고, 프론트엔드 요구가 빠르게 바뀌고 다양하면 GraphQL이 이득이다.

## 약점과 대책

| 약점 | 왜 생기나 | 대책 |
| --- | --- | --- |
| N+1 조회 | 리졸버가 목록의 항목마다 따로 DB를 부른다 | DataLoader처럼 한 틱의 요청을 모아 일괄 조회(batching)한다 |
| 캐시가 어렵다 | 같은 URL에 서로 다른 질의가 POST로 온다 | 클라이언트 정규화 캐시, 등록된(persisted) 쿼리를 GET으로 보내 CDN에 캐시 |
| 악성·과도한 질의 | 클라이언트가 깊고 넓은 질의를 마음대로 만든다 | 깊이·복잡도 제한, 타임아웃, 등록된 쿼리만 허용 |
| 서버 복잡도 | 스키마·리졸버·권한을 필드 단위로 관리한다 | 스키마 소유권을 팀별로 나누고(페더레이션) 필드 단위 인가를 둔다 |
| 오류 표현 | 부분 성공이 있어 HTTP 상태 코드만으로 판단하기 어렵다 | 응답 `errors` 배열을 표준으로 다루고 모니터링한다 |

## 도입 패턴

```text
① 클라이언트 래핑        ② BFF                 ③ 모놀리식              ④ 페더레이션
[앱]                    [웹] [모바일]           [웹][모바일][파트너]     [클라이언트들]
 └ GraphQL 층(앱 안)      │     │                 └──────┬──────┘              │
    ├ REST A           [BFF] [BFF]             [GraphQL 서버 하나]      [페더레이션 게이트웨이]
    └ REST B              └──┬──┘                       │                ├ 서브그래프(사용자팀)
                       [백엔드 API들]             [백엔드 API들]          ├ 서브그래프(주문팀)
                                                                       └ 서브그래프(상품팀)
```

| 패턴 | 구조 | 장점 | 대가 |
| --- | --- | --- | --- |
| 클라이언트 래핑 | 클라이언트가 기존 REST API를 자기 안의 GraphQL 층으로 감싼다 | 백엔드를 안 바꾸고 개발 경험을 개선 | 데이터 조합 비용과 왕복은 여전히 클라이언트가 진다 |
| BFF | 클라이언트마다 전용 GraphQL 서버를 둔다 | 화면에 맞춘 응답, 클라이언트 성능 개선 | BFF를 여러 개 만들고 유지해야 한다([[bff\|BFF]]) |
| 모놀리식 | GraphQL 서버 하나를 여러 클라이언트가 쓰고 여러 팀이 한 코드베이스를 공유 | 단일 그래프로 일관성 | 한 코드베이스에 팀이 몰려 병목이 된다 |
| 페더레이션 | 팀마다 자기 도메인의 서브그래프를 소유하고, 게이트웨이가 이를 하나의 슈퍼그래프로 합쳐 라우팅 | 데이터 소유권은 도메인 팀에 두고 중복 작업은 줄인다 | 게이트웨이·스키마 합성 도구를 운영해야 한다 |

보통 클라이언트 하나가 GraphQL 서버 하나를 부르는 단순한 구조로 시작해, 팀과 클라이언트가 늘면 BFF나 페더레이션으로 옮겨 간다. 대형 서비스의 API 계층이 이렇게 바뀌어 온 흐름은 [[api-layer-evolution|아키텍처와 API 계층의 진화]]에 있다.

## 운영 예: 등록된 쿼리

대규모 서비스는 **클라이언트가 임의 질의를 보내게 두지 않고, 미리 등록한 질의만 실행**하는 방식을 쓰기도 한다. 링크드인이 이 방식의 예다.

```text
1. 개발: 클라이언트 개발자가 질의를 작성하고 백엔드와 테스트
2. 등록: 질의를 커밋하면 쿼리 레지스트리에 게시된다 (라우팅 메타데이터 포함)
3. 배포: 질의가 클라이언트 코드와 함께 배포된다
4. 실행: 요청은 질의 ID로 오고, 라우팅 계층이 메타데이터를 보고 맞는 서비스 클러스터로 보낸다
         서비스는 등록된 질의를 캐시해 두고 실행하며, 필요하면 여러 서비스(신원 → 조직)를 차례로 조회한다
```

이 구조에서는 별도의 GraphQL 게이트웨이를 두지 않을 수 있다. **네트워크 홉 하나와 단일 장애점을 없애기 위해서다.** 등록된 쿼리는 악성 질의 차단과 캐시라는 GraphQL의 두 약점도 함께 줄인다.

## 정리

- GraphQL은 스키마 위에서 클라이언트가 필드를 고르는 질의 언어다. 쿼리·뮤테이션·구독 세 작업이 있다.
- 강점은 한 번에 필요한 만큼 가져오기와 강한 타입 계약이다.
- 약점은 N+1, 캐시, 악성 질의, 서버 복잡도다. DataLoader, 등록된 쿼리, 복잡도 제한으로 다룬다.
- 조직이 커지면 클라이언트 래핑 → BFF → 페더레이션으로 구조를 옮긴다.

관련 노트: [[api-architectural-styles|API 아키텍처 스타일]], [[rest-api|REST API 설계]], [[bff|BFF (Backend For Frontend)]], [[grpc|gRPC]], [[api-gateway|API 게이트웨이]], [[api-layer-evolution|아키텍처와 API 계층의 진화]]
