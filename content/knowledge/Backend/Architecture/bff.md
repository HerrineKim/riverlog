---
title: "BFF (Backend For Frontend)"
concept: "BFF"
summary: "프론트엔드 하나마다 그 화면에 맞춘 중간 서버를 두는 BFF 패턴. 여러 API를 묶고, 필요한 필드만 가공해 내려 주고, CORS·인증·MSA 엔드포인트 변경을 흡수한다. 카카오페이지 웹의 Next.js + GraphQL BFF 사례와 Apollo Client 정규화 캐시 문제, urql·Redux를 함께 쓴 이유를 정리한다."
tags: ["backend", "architecture", "frontend", "graphql", "nextjs"]
source: other
date: "2026-10-13"
sources: ["https://tech.kakaoent.com/front-end/2022/220310-kakaopage-bff/"]
---

> 카카오엔터테인먼트 박수빈(cheese)의 글 「[카카오페이지는 BFF(Backend For Frontend)를 어떻게 적용했을까?](https://tech.kakaoent.com/front-end/2022/220310-kakaopage-bff/)」(2022.03)를 요약·재구성한 노트입니다.

## 왜 필요한가

MSA 환경에서 Web·Android·iOS를 함께 지원하다 보면 프론트엔드가 이런 일을 떠안는다.

- 플랫폼마다 필요한 데이터가 다르다.
- 원하는 모양을 얻으려고 여러 API 응답을 섞고 맞춘다.
- 그 결과 복잡한 계산과 비즈니스 로직이 프론트엔드에 쌓인다. UI 스레드에서 렌더링과 경쟁해 화면이 느려지기도 한다.

API를 직접 의존하면 생기는 문제도 있다.

| 문제 | 내용 |
| --- | --- |
| 과다한 응답 | 백엔드가 모든 플랫폼을 만족시키려고 데이터를 다 내려 준다. 화면에 안 쓰는 필드가 섞인다 |
| 여러 번 호출 | 한 화면에서 API를 여러 번 부른다 |
| MSA 엔드포인트 변경 | 서비스가 쪼개질 때마다 프론트엔드가 따라가야 한다 |
| CORS | 브라우저에서 다른 출처 API를 부르는 숙명 |
| 커뮤니케이션 비용 | 여러 플랫폼 스펙을 API 하나에 맞추느라 드는 조율 |
| 인증 | 플랫폼마다 다를 수밖에 없는 인증을 억지로 통합 |
| 부분 응답 | "화면에 필요한 데이터만 받기"가 어렵다 |

## BFF란

**BFF(Backend For Frontend)는** 말 그대로 **프론트엔드를 위한 중간 서버**다. 위 문제들을 BFF가 받아 낸다.

```text
일반 구조                       BFF 구조
Web ─┐                          Web ─── Web BFF ─┐
iOS ─┼─▶ 공용 API들              iOS ─── iOS BFF ─┼─▶ 공용 API들
And ─┘                          And ─── And BFF ─┘
```

- **프론트엔드 하나에 BFF 하나.** 그 프론트엔드의 요구에 맞춰 만든다. 그래서 여러 플랫폼을 지원하지 않으면 BFF가 의미 없을 수 있다. 카카오페이지도 Web에만 BFF를 두었다.
- 데이터를 통합·가공해 프론트엔드를 백엔드에서 떼어 놓는다.
- 이상적으로는 **프론트엔드 개발자가 만든다.**

## 예시: 두 API를 하나로

화면에 프로필과 캐시 잔액이 필요하다. REST로는 `GET /user/get_profile`, `GET /store/view/cash`를 따로 부르고, 응답에는 `create_dt`, `user_id`, `response_time`처럼 화면에 안 쓰는 값이 섞여 온다. 받은 뒤 상태 관리에서 매번 가공해야 한다.

GraphQL BFF에서는 리졸버가 두 API를 부르고 **화면용 타입으로 가공해** 돌려준다.

```js
// user.resolver
const resolvers = {
  user: async () => {
    const response = await kakaopageApi.getProfile()
    return createUserWithUserVo(response.profile) // 필요한 필드만, camelCase로
  },
}
```

```graphql
query userAndCash {
  userAndCash {
    user { uid nickname email }
    cash { totalBalance }
  }
}
```

- 브라우저 요청은 하나로 준다.
- 불필요한 필드를 빼고, snake_case → camelCase, 날짜 포맷 변환 같은 처리를 BFF가 맡는다.
- 에러도 BFF에서 공통 에러 객체로 감싼다.

## 함정: Apollo Client의 정규화 캐시

Apollo Client는 응답 객체를 `__typename:id`를 키로 **정규화해 저장**하고, 같은 쿼리는 서버 대신 캐시에서 답한다. 같은 id인데 **인자에 따라 하위 데이터가 달라지는** 경우 문제가 생긴다.

```text
1. layout(categoryFilter: 1) → Layout:1 → Section:1 → groups [Group:1, Group:3]
2. layout(categoryFilter: 2) → Layout:1 → Section:1 → groups [Group:2]   ← Section:1을 덮어씀
3. layout(categoryFilter: 1) 다시 호출 → 캐시 히트 → Section:1 → [Group:2]  ✗
```

1번 카테고리를 요청했는데 2번 카테고리 작품이 나오고, 탭을 바꿔도 화면이 그대로다.

| 해결책 | 방법 |
| --- | --- |
| id 바꾸기 | 하위 응답이 달라지면 구분 가능한 별도 id를 준다 |
| `keyFields` | Apollo Client의 캐시 키 설정으로 식별 기준을 바꾼다 |
| 라이브러리 교체 | 카카오페이지는 **쿼리(문서) 단위로 캐시하는 urql**로 바꿨다 |

## 사례: 카카오페이지 웹의 구성(2022)

| 역할 | 도구 |
| --- | --- |
| 프레임워크 | Next.js |
| BFF (GraphQL 서버) | Apollo Server |
| 데이터 가져오기 | urql |
| 화면 상태 저장 | Redux |

GraphQL 캐시만으로 충분할 것 같지만, 그린 뒤 **중간 데이터를 비동기로 고치는 일**(클릭 시 추가 로딩, 무한 스크롤로 채우기)이 복잡해졌다. 그래서 GraphQL 응답을 정규화해 Redux에 넣었다. **가져오기(urql)와 저장·사용(Redux)은 목적이 다르다**는 판단이다.

## Next.js로 BFF 만들기

Next.js에는 BFF 역할을 하는 기본 기능이 있다. Next.js 16 문서는 "Backend for Frontend" 가이드에서 **Route Handler**(`app/**/route.ts`), Proxy, rewrites로 Next.js를 BFF로 쓰는 법을 안내하고, 완전한 백엔드 대체가 아니라 **공개된 API 계층**이라고 선을 긋는다. 서버 컴포넌트도 렌더링 중에 여러 API를 서버에서 불러 필요한 값만 클라이언트로 넘기므로, GraphQL 없이도 BFF의 상당 부분을 대신한다. 다만 여러 플랫폼이 같은 BFF 계층을 공유해야 하면 GraphQL BFF가 여전히 선택지다.

## 정리

- BFF는 **프론트엔드 하나를 위한 중간 서버**다. 여러 API를 묶고, 화면에 맞게 가공하고, CORS·인증·MSA 변화를 흡수한다.
- 핵심 이점은 **비즈니스 로직 구현과 화면용 데이터 가공을 분리**해 복잡도를 낮추는 것이다.
- 플랫폼이 하나뿐이면 굳이 둘 필요가 없을 수 있다.
- GraphQL 캐시를 쓸 땐 정규화 캐시가 인자별 결과를 덮어쓰는지 확인한다.

관련 노트: [[data-flow|Data Flow로 보는 웹 아키텍처]], [[db-fetching-patterns|빠르고 유지보수하기 좋은 DB 조회 패턴]], [[server-client-components|서버 컴포넌트와 클라이언트 컴포넌트 조합 규칙]], [[nextjs-app-router|Next.js App Router의 내비게이션과 데이터 가져오기]]
