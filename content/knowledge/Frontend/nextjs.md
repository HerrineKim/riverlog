---
title: "Next.js를 쓰는 이유"
concept: "Next.js"
summary: "SSR·SSG·파일 기반 라우팅·자동 코드 스플리팅을 제공해 React 앱의 초기 로딩과 SEO를 개선하는 프레임워크."
tags: ["nextjs", "react", "rendering", "seo", "frontend"]
source: mixed
---

**Next.js**는 React 기반 웹 애플리케이션 **프레임워크**다. React가 UI 라이브러리라면, Next.js는 라우팅·렌더링 전략·빌드 최적화까지 정해진 틀을 제공한다. 가장 큰 장점은 React의 기본 방식인 CSR의 약점, 즉 **검색 엔진이 내용을 읽기 어렵다는 점**을 SSR·SSG로 보완해 준다는 것이다. Node.js(브라우저 밖에서 JavaScript를 실행하는 Chrome V8 기반 런타임) 위에서 동작한다.

## CSR의 한계

CSR 방식의 React는 빈 HTML을 먼저 받고, JavaScript가 로딩된 뒤에야 화면을 그린다. 검색 엔진 봇이 처음 받는 HTML에는 콘텐츠가 거의 없어 검색 노출에 불리하다. 개념은 [SPA와 CSR·SSR](/knowledge/dictionary/frontend/web/spa-csr-ssr) 참고.

## 주요 기능

### SSR (Server Side Rendering)

요청이 오면 서버에서 UI를 구성해 완성된 HTML로 응답한다.

1. 사용자가 접속하면 클라이언트가 서버에 요청한다.
2. 서버가 미리 렌더링한 HTML·CSS를 보낸다 — **Initial Load**: JS 동작 없이 화면부터 보여 준다.
3. 브라우저가 JS를 받아 이미 그려진 DOM에 이벤트 리스너를 연결한다 — **Hydration**.

화면이 보이는 시점(Time To View)과 조작 가능한 시점(Time To Interact) 사이에 시간차가 있지만, 첫 화면이 빠르고 HTML에 콘텐츠가 담겨 있어 **SEO에 유리**하다.

### SSG (Static Site Generation)

내용이 항상 같은 페이지는 **빌드 시점에 HTML을 미리 생성**해 두고 그대로 제공한다. 요청마다 렌더링하지 않으므로 가장 빠르고, CDN에 캐시하기도 좋다. 블로그·문서·개인 홈페이지처럼 데이터가 자주 바뀌지 않는 사이트에 적합하다. 일정 시간마다 다시 생성하는 ISR(Incremental Static Regeneration)도 있다.

### 파일 기반 라우팅

폴더·파일 구조가 그대로 URL이 된다. 라우터를 따로 설정하지 않아도 된다.

```text
pages/index.js        → /
pages/about.js        → /about
pages/posts/[id].js   → /posts/1, /posts/2 ...
```

참고: Next.js 13부터 도입된 **App Router**에서는 `app/` 디렉터리를 쓰고, `app/about/page.tsx`처럼 폴더가 경로, `page` 파일이 화면이 된다. 기본이 React Server Component이고 레이아웃(`layout.tsx`)을 중첩할 수 있다. 새 프로젝트는 App Router가 기본이다.

### App Router의 데이터 가져오기: 확장된 `fetch`

Next.js 13의 App Router에서는 Pages Router의 `getServerSideProps`·`getStaticProps` 같은 `get~` 데이터 함수가 없어졌다. 대신 **서버 컴포넌트를 `async` 함수로 만들고 그 안에서 바로 `fetch`** 한다. Next.js는 브라우저 표준 `fetch`를 확장해 캐싱·재검증 옵션을 붙였다.

```tsx
// app/posts/page.tsx — 서버 컴포넌트
export default async function PostsPage() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }, // 60초마다 다시 가져오기 (ISR과 비슷)
  })
  const posts = await res.json()
  return <PostList posts={posts} />
}
```

| 옵션 | 의미 |
| --- | --- |
| `cache: 'force-cache'` | 결과를 캐시해 재사용(SSG처럼) |
| `cache: 'no-store'` | 요청마다 새로 가져오기(SSR처럼) |
| `next: { revalidate: n }` | n초 동안 캐시 후 다시 가져오기 |

- 캐싱 기본값은 버전에 따라 바뀌었다. 13~14는 기본이 캐시였고, **15부터는 기본이 캐시하지 않음**이다. 원하는 동작을 옵션으로 명시하는 것이 안전하다.
- 데이터는 가능하면 서버 컴포넌트에서 가져오는 것이 권장된다. 클라이언트 컴포넌트에서도 `fetch`는 쓸 수 있지만 캐싱 확장은 적용되지 않으므로, 사용자 이벤트에 따라 가져오는 데이터는 [SWR](/knowledge/dictionary/frontend/react/swr)이나 TanStack Query 같은 라이브러리로 다룬다.

### 자동 코드 스플리팅

번들(여러 파일·모듈을 합쳐 요청 수를 줄인 결과물)을 페이지 단위로 자동으로 나눈다. 각 페이지는 자기에게 필요한 코드만 받으므로 첫 로딩 시간이 줄어든다.

## 언제 Next.js를 고르나

| 상황 | 이유 |
| --- | --- |
| 검색 노출이 중요한 서비스 | SSR·SSG로 HTML에 콘텐츠가 담긴다 |
| 데이터가 자주 바뀌지 않는 사이트(블로그, 포트폴리오) | SSG로 미리 만들어 두면 빠르고 저렴하다 |
| 초기 로딩 성능·접근성 점수 개선 | Lighthouse 성능 지표 개선에 유리 |
| 라우팅·빌드 설정을 직접 하기 싫을 때 | 파일 기반 라우팅, 최적화 기본 제공 |

개인 홈페이지를 만들며 Next.js를 고른 이유도 같았다. 데이터가 거의 바뀌지 않아 서버가 미리 렌더링해 두는 방식이 맞고, 블로그 노출(SEO)과 Lighthouse 성능·웹 접근성 점수를 직접 끌어올려 보고 싶었다. 콘텐츠와 사용자 데이터를 다뤄 본 경험을 살려, 개발뿐 아니라 SEO와 사용자 분석까지 함께 경험해 보려는 목적도 있었다.

## 핵심 정리

- Next.js = React + 라우팅 + 렌더링 전략(SSR·SSG·CSR) + 빌드 최적화.
- SSR은 요청마다 서버에서, SSG는 빌드 때 미리 HTML을 만든다. 둘 다 SEO에 유리하다.
- SSR 페이지도 브라우저에서 hydration을 거쳐야 상호작용이 가능해진다.
- 라우팅은 파일 구조 기반(`pages/` 또는 13+의 `app/`).
- App Router에서는 서버 컴포넌트에서 `fetch`하고, 캐시 동작은 `cache`/`revalidate` 옵션으로 명시한다.
