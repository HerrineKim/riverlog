---
title: "SPA와 CSR·SSR"
concept: "SPA"
summary: "한 페이지에서 필요한 부분만 다시 그리는 SPA와, 렌더링 주체·시점에 따른 CSR·SSR·SSG·ISR의 차이."
tags: ["web", "rendering", "spa", "seo"]
source: mixed
date: "2026-10-21"
sources: ["https://riverkim.kr/257", "https://riverkim.kr/321", "https://junilhwang.github.io/TIL/Javascript/Design/Vanilla-JS-Server-Side-Rendering/", "https://zuminternet.github.io/ZUM-Mobile-NodeJS/", "https://github.com/grab/front-end-guide"]
---

> 개인 TIL을 바탕으로, SSR의 뼈대는 「[프레임워크 없이 만드는 SSR](https://junilhwang.github.io/TIL/Javascript/Design/Vanilla-JS-Server-Side-Rendering/)」, 「[모바일 줌 SpringBoot → NodeJS 전환기 (feat. VueJS SSR)](https://zuminternet.github.io/ZUM-Mobile-NodeJS/)」를 바탕으로 더한 노트다.
> Grab의 「[Front End Guide](https://github.com/grab/front-end-guide)」를 바탕으로 보강했다.

**SPA(Single Page Application)** 는 처음에 한 번만 페이지를 받아 오고, 이후에는 서버에서 새 페이지 전체를 받지 않고 **현재 페이지의 필요한 부분만 동적으로 다시 그리는** 웹 애플리케이션이다. 화면 전환이 매끄러워 네이티브 앱과 비슷한 사용자 경험을 준다. SPA는 주로 CSR 방식으로 동작하므로, CSR과 SSR의 차이를 함께 이해해야 한다.

## SPA의 등장 배경

1. 과거에는 요청마다 새 HTML 페이지를 응답하는 **MPA(Multi Page Application)** 방식이었다.
2. 스마트폰 보급으로 트래픽 절감, 빠른 반응성 같은 모바일 최적화가 중요해졌다.
3. React, Vue.js 같은 프론트엔드 프레임워크가 등장하며 CSR 기반의 SPA가 보편화되었다.

페이지마다 jQuery 조각을 붙이는 방식은 앱이 커지면 버티지 못한다. jQuery는 DOM 조작 라이브러리일 뿐 앱의 구조를 정해 주지 않기 때문이다. 프레임워크는 상태를 DOM이 아니라 **메모리에** 두고 DOM 조작을 추상화하며, 정해진 구조를 준다. 그 프레임워크를 아는 새 팀원은 처음 보는 코드베이스도 빨리 읽는다.

MPA에서 SPA로, 다시 서버와 클라이언트가 역할을 나누는 구조로 이어지는 흐름은 [[webs-next-transition|웹 아키텍처의 다음 전환: MPA에서 PESPA까지]]에서 "코드가 어디에 사는지"로 설명한다.

## CSR (Client Side Rendering)

![CSR](/images/til/FRONTEND/Web/SPA.assets/CSR.png)

- 최초 요청 시 데이터가 비어 있는 HTML 뼈대와 CSS·JS 리소스를 받는다.
- 이후 클라이언트가 필요한 **데이터만** 요청하고, JavaScript로 DOM을 그린다.

| 장점 | 단점 |
| --- | --- |
| 정적 리소스는 한 번만 받고 데이터만 갱신하므로 서버와의 트래픽이 줄어든다 | 첫 화면이 완성되기까지(초기 로딩)가 SSR보다 느리다 |
| 바뀌는 부분만 갱신해 화면 전환이 부드럽다(UX 향상) | 최초 HTML에 콘텐츠가 없어 **SEO(검색 엔진 최적화)** 에 불리하다 |
| 클라이언트와 서버가 **API 계약으로만** 이어진다. 둘을 따로 개발·배포하고, 같은 API에 모바일 앱 같은 다른 클라이언트를 붙이기 쉽다. 팀이 클수록 이 분리가 이득이다 | 서버(또는 CDN)가 모든 경로 요청에 `index.html`을 돌려줘야 클라이언트 라우터가 받는다([[client-side-routing\|클라이언트 사이드 라우팅]]) |
| 정적 파일뿐이라 앱 서버 없이 스토리지 + CDN으로 호스팅한다([[s3-cloudfront-static-hosting\|S3·CloudFront]]) | 여러 페이지의 코드를 처음에 한꺼번에 받으면 무겁다. 경로별 [[code-splitting\|코드 스플리팅]]으로 나눈다 |

## SSR (Server Side Rendering)

![SSR](/images/til/FRONTEND/Web/SPA.assets/SSR.png)

- 서버가 데이터를 채운 완성된 HTML을 만들어 응답한다.
- JavaScript 웹 프레임워크 이전의 전통적인 방식이다(예: Django 템플릿 렌더링).

| 장점 | 단점 |
| --- | --- |
| 초기 화면이 빨리 보인다 | 요청마다 새 페이지를 만들어 전체 새로고침이 반복된다 |
| HTML에 콘텐츠가 이미 있어 SEO에 유리하다 | 트래픽이 상대적으로 많아 서버 부담이 크다 |

### Hydration

React·Next.js 같은 프레임워크의 SSR은 전통적인 SSR과 한 단계가 다르다. 서버가 그린 HTML은 아직 이벤트가 연결되지 않은 "보이기만 하는" 화면이다. 브라우저가 JS를 받아 이 HTML에 이벤트 핸들러와 상태를 붙여 살아 있는 앱으로 만드는 과정을 **hydration**이라고 한다. 그래서 첫 화면은 빠르게 보이지만, JS가 실행되기 전까지는 버튼이 반응하지 않을 수 있다.

### 프레임워크를 걷어 내면 보이는 SSR의 뼈대

SSR + hydration은 프레임워크 없이도 네 부품으로 만들 수 있다. 프레임워크는 이 부품을 자동화한 것이다.

| 부품 | 하는 일 | 지킬 것 |
| --- | --- | --- |
| 공유 코드(동형, isomorphic) | 모델(데이터와 변경 로직)과 컴포넌트(데이터 → HTML 문자열)를 서버와 브라우저가 **같이 쓴다** | `window`·`document`·`localStorage` 같은 브라우저 API를 넣지 않는다 |
| 서버 렌더링 | 요청 경로로 페이지 컴포넌트를 골라 HTML 문자열을 만든다. 404도 같은 방식으로 그린다 | 클라이언트 번들은 정적 파일로 함께 서빙한다 |
| 초기 상태 주입 | 서버가 쓴 데이터를 `<script>window.__INITIAL_STATE__ = …</script>`처럼 HTML에 직렬화해 싣는다 | 브라우저가 같은 데이터로 시작해야 같은 화면이 나온다. `</script>`가 끼지 않게 이스케이프한다 |
| hydration | 브라우저가 주입된 상태로 모델을 만들고 이벤트를 붙인다. 이후 이동은 `history.pushState`와 `popstate`로 클라이언트에서 처리한다 | **서버와 클라이언트가 같은 상태에서 같은 HTML을 그려야** 어긋남(hydration mismatch)이 없다 |

```text
요청 ─▶ 서버: 라우트 매칭 → 데이터 조회 → render(model) → HTML + 초기 상태
      ─▶ 브라우저: HTML 즉시 표시 → JS 로드 → 초기 상태로 모델 복원 → 이벤트 연결
      ─▶ 이후 이동: pushState + 클라이언트 렌더, 변경은 API로 서버에 반영
```

SSR 서버는 보통 API 서버 앞에 따로 둔다. 여러 API를 조합해 화면용으로 가공하고 응답을 캐시하는 이 층이 [[bff|BFF]]다. SSR의 체감 이득은 사용자 기기 성능에 따라 다르므로 서버 비용과 함께 따진다. 서버에서 렌더링하는 Node 프로세스는 요청마다 메모리를 쓰므로 힙 스냅샷으로 누수를 점검한다.

## SSG (Static Site Generation)

**빌드(배포) 시점에** 모든 페이지의 HTML을 미리 만들어 두고, CDN에 올려 요청이 오면 그대로 내준다. 브라우저에서 hydration하는 것은 SSR과 같지만, SSR은 **요청할 때마다** HTML을 만들고 SSG는 **빌드 때 한 번** 만든다는 점이 다르다.

| 장점 | 단점 |
| --- | --- |
| 이미 만들어진 파일을 내주므로 첫 로딩이 가장 빠르다 | 콘텐츠가 바뀔 때마다 다시 빌드·배포해야 한다 |
| HTML에 콘텐츠가 있어 SEO에 유리하다 | 사용자마다 다른 페이지에는 맞지 않는다 |
| 요청마다 렌더링하지 않아 서버 부담이 적다 | 페이지가 아주 많으면 빌드 시간이 길어진다 |

블로그, 문서, 포트폴리오처럼 자주 바뀌지 않는 사이트에 맞다.

## ISR (Incremental Static Regeneration)

SSG의 "바뀔 때마다 재배포" 문제를 줄이려고 Next.js가 만든 방식이다. 페이지를 SSG처럼 미리 만들어 두되, 개발자가 정한 **재검증 시간(revalidate)** 이 지나면 다음 요청 때 서버에서 HTML을 새로 만들어 교체한다. SSG와 SSR을 섞은 셈이다.

| 장점 | 단점 |
| --- | --- |
| SSG의 속도를 유지하면서 어느 정도 최신 데이터를 보여 준다 | 재검증 주기 사이에는 오래된 내용이 보일 수 있어 실시간은 아니다 |
| 콘텐츠가 바뀌어도 매번 빌드·배포할 필요가 없다 | 지원하는 프레임워크·호스팅이 제한적이다 |

## 비교

| 구분 | CSR | SSR | SSG | ISR |
| --- | --- | --- | --- | --- |
| HTML을 만드는 곳 | 클라이언트(브라우저의 JS) | 서버 | 서버(빌드 때) | 서버(빌드 때 + 주기적 재생성) |
| HTML을 만드는 시점 | 페이지를 연 뒤 | 요청마다 | 빌드할 때 한 번 | 빌드 때, 이후 재검증 시간마다 |
| 초기 로딩 | 느림 | 빠름 | 가장 빠름 | 가장 빠름 |
| 데이터 최신성 | 최신 | 최신 | 빌드 시점 | 재검증 주기만큼 늦을 수 있음 |
| 서버 부담 | 적음 | 큼 | 적음 | 적음 |
| SEO | 불리 | 유리 | 유리 | 유리 |

## 한 페이지 안에서 섞기: 서버 컴포넌트와 스트리밍

위 네 방식은 **페이지 단위**의 선택이다. React 18 이후 프레임워크는 한 페이지 안에서도 섞는다.

| 방식 | 섞는 단위 | 노트 |
| --- | --- | --- |
| 스트리밍 SSR | 빠른 부분을 먼저 보내고 느린 부분은 `<Suspense>` 경계 단위로 이어서 보낸다 | [[streaming-ssr\|스트리밍 SSR]] |
| React Server Components(RSC) | 컴포넌트마다 서버에서만 실행할지(코드가 번들에 안 들어감), 브라우저에서도 실행할지 고른다 | [[server-client-components\|서버·클라이언트 컴포넌트 조합 규칙]] |
| 부분 사전 렌더링 | 정적 껍데기는 빌드 때 만들어 CDN에서, 동적 부분은 요청 때 스트리밍한다(Next.js Cache Components) | [[nextjs\|Next.js를 쓰는 이유]] |

이 방식들은 "어느 쪽이 더 좋다"가 아니라 서비스 특성에 맞게 고르는 것이다. 예를 들어 Django 템플릿으로 페이지를 그리면서 좋아요·팔로우만 axios로 비동기 처리하는 구조는 SSR을 기본으로 일부만 CSR을 섞은 형태다. Next.js처럼 SSR·SSG와 CSR을 페이지 단위로 섞어 쓰는 프레임워크도 있다([Next.js](/knowledge/dictionary/frontend/next-js/nextjs) 참고).

## 핵심 정리

- SPA = 한 페이지에서 필요한 부분만 다시 그리는 앱, 보통 CSR로 동작한다.
- 렌더링 주체가 **서버면 SSR, 클라이언트면 CSR**.
- CSR은 UX와 트래픽에, SSR은 초기 로딩과 SEO에 강하다.
- SSG는 빌드 때 미리 만들어 가장 빠르지만 재배포가 필요하고, ISR은 재검증 시간마다 다시 만들어 이를 보완한다.
- 지금의 프레임워크는 스트리밍·서버 컴포넌트·부분 사전 렌더링으로 한 페이지 안에서 이 방식들을 섞는다.

관련 노트: [[client-side-routing|클라이언트 사이드 라우팅: 해시, History API, Navigation API]], [[nextjs|Next.js를 쓰는 이유]], [[templates-static|Django 템플릿(서버 렌더링)]], [[vuex|Vue 상태 관리: Pinia(옛 Vuex)]], [[webs-next-transition|웹 아키텍처의 다음 전환: MPA에서 PESPA까지]], [[streaming-ssr|스트리밍 SSR]], [[seo-basics|SEO 기초]], [[static-site-generator|정적 사이트 생성기와 Jamstack]], [[view-transitions|View Transitions: 화면 전환 애니메이션]], [[web-dev-myths|웹 개발에 대한 이상한 믿음들]]
