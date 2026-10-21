---
title: "Next.js를 쓰는 이유"
concept: "Why Next.js"
summary: "SSR·SSG·파일 기반 라우팅·자동 코드 스플리팅을 제공해 React 앱의 초기 로딩과 SEO를 개선하는 프레임워크. App Router의 fetch 캐싱과 재검증, Next.js 16의 'use cache'까지."
tags: ["nextjs", "react", "rendering", "seo", "cache", "frontend"]
source: mixed
date: "2026-10-21"
sources: ["https://riverkim.kr/214", "https://80000coding.notion.site/a688c09821014d51a01f37d773906165", "https://80000coding.notion.site/bc0ccbe2aabe4205aaa7e9233bb5ead6", "https://80000coding.notion.site/286aebc32d214857abe04c9a306aa02d", "https://nextjs.org/docs/app/getting-started/caching", "https://nextjs.org/docs/app/getting-started/proxy", "https://nextjs.org/docs/app/guides/upgrading/version-16", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Next.js%281%29%20-%20%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94%20%EC%9D%B4%EC%9C%A0%2C%20%ED%99%98%EA%B2%BD%EC%84%A4%EC%A0%95.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Next.js%288%29%20-%20Middleware.md"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「Next.js 공식 문서 읽기(1) - FOUNDATIONS」, 「Next.js 공식 문서 읽기(2) - CREATE YOUR FIRST APP」, 「Next.js (SSR) 공식문서 읽어보기 (12.0 버전)」에서 Pages Router 내용을 더한 노트다.
>
> `proxy.ts`의 matcher·쿠키는 「[Frontend_TIL: Next.js(8) - Middleware](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Next.js%288%29%20-%20Middleware.md)」를 바탕으로 보강했다.

**Next.js**는 React 기반 웹 애플리케이션 **프레임워크**다. React가 UI 라이브러리라면, Next.js는 라우팅·렌더링 전략·빌드 최적화까지 정해진 틀을 제공한다. 가장 큰 장점은 React의 기본 방식인 CSR의 약점, 즉 **검색 엔진이 내용을 읽기 어렵다는 점**을 SSR·SSG로 보완해 준다는 것이다. Node.js(브라우저 밖에서 JavaScript를 실행하는 Chrome V8 기반 런타임) 위에서 동작한다.

## CSR의 한계

CSR 방식의 React는 빈 HTML을 먼저 받고, JavaScript가 로딩된 뒤에야 화면을 그린다. 검색 엔진 봇이 처음 받는 HTML에는 콘텐츠가 거의 없어 검색 노출에 불리하다. 개념은 [[spa-csr-ssr|SPA와 CSR·SSR]] 참고.

## 주요 기능

### 렌더링 전략을 페이지 단위로 고른다

Next.js는 요청마다 서버에서 HTML을 만드는 **SSR**, 빌드 때 미리 만들어 두는 **SSG**, 재검증 시간마다 다시 만드는 **ISR**을 한 앱 안에서 페이지별로 섞어 쓸 수 있다. 어느 쪽이든 HTML에 콘텐츠가 담겨 SEO에 유리하고, 브라우저에서 hydration을 거친 뒤에 상호작용이 가능해진다. 각 방식의 동작과 장단점 비교표는 [[spa-csr-ssr|SPA와 CSR·SSR]]에 있다.

### 파일 기반 라우팅

폴더·파일 구조가 그대로 URL이 된다. 라우터를 따로 설정하지 않아도 된다. 새 프로젝트의 기본은 Next.js 13에서 도입된 **App Router**(`app/` 디렉터리)다. 폴더가 경로, `page` 파일이 화면이 되고, 컴포넌트는 기본이 React Server Component이며 레이아웃(`layout.tsx`)을 중첩할 수 있다.

```text
app/page.tsx               → /
app/about/page.tsx         → /about
app/posts/[id]/page.tsx    → /posts/1, /posts/2 ...
```

과거의 **Pages Router**(`pages/about.js` → `/about`)도 계속 지원되지만 새 기능은 App Router 기준으로 나온다. 특수 파일(`layout`·`loading`·`error`·`route`…), 동적 세그먼트, 라우트 그룹, 병렬·가로채는 라우트는 [[nextjs-routing-conventions|App Router의 파일 규칙과 라우팅]]에 있다.

### 자동 코드 스플리팅

번들(여러 파일·모듈을 합쳐 요청 수를 줄인 결과물)을 경로 단위로 자동으로 나눈다. 각 페이지는 자기에게 필요한 코드만 받으므로 첫 로딩 시간이 줄어든다. Next.js 16부터는 `next dev`와 `next build` 모두 **Turbopack**이 기본 번들러다(과거에는 webpack).

### 요청 앞단 처리: `proxy.ts`

프로젝트 루트(또는 `src/`)의 `proxy.ts`는 요청이 페이지에 닿기 전에 실행되어 리다이렉트·리라이트·헤더 수정·직접 응답을 한다. Next.js 15까지는 **Middleware**(`middleware.ts`)라 불렀고, 16에서 이름이 Proxy로 바뀌었다. Proxy는 Node.js 런타임에서 돈다.

```ts
// proxy.ts
import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

export const config = { matcher: '/about/:path*' }
```

- `matcher`는 Proxy를 돌릴 경로를 거른다. 배열로 여러 개(`['/about/:path*', '/dashboard/:path*']`)를 줄 수 있고, 없으면 모든 요청에 돈다.
- `new URL('/home', request.url)`은 현재 요청 URL을 기준으로 절대 URL을 만든다. 리다이렉트 대상은 절대 URL이어야 한다.
- 쿠키는 `request.cookies`(`get`·`getAll`·`has`·`set`·`delete`·`clear`)로 읽고, 응답에는 `NextResponse.next()`로 만든 응답의 `response.cookies.set('theme', 'dark')`로 `Set-Cookie`를 단다. `NextResponse.next()`는 요청을 그대로 다음 단계(라우트)로 넘긴다.

단순 리다이렉트는 `next.config.ts`의 `redirects`로 충분하다. Proxy는 쿠키를 보고 로그인 페이지로 보내는 낙관적 검사에 쓰고, **인가(authorization) 판단 자체는 데이터에 접근하는 서버 코드에서 다시 한다.**

## 데이터 캐싱과 재검증

### App Router의 데이터 가져오기: 확장된 `fetch`

Next.js 13의 App Router에서는 Pages Router의 `getServerSideProps`·`getStaticProps` 같은 `get~` 데이터 함수를 쓰지 않는다(Pages Router에서는 여전히 동작한다). 대신 **서버 컴포넌트를 `async` 함수로 만들고 그 안에서 바로 `fetch`** 한다. Next.js는 브라우저 표준 `fetch`를 확장해 캐싱·재검증 옵션을 붙였다.

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

- 캐싱 기본값은 버전에 따라 바뀌었다. 13~14는 기본이 캐시였고, **15부터는 기본이 캐시하지 않음**이다(캐시는 옵트인). 원하는 동작을 옵션으로 명시하는 것이 안전하다.
- 데이터는 가능하면 서버 컴포넌트에서 가져오는 것이 권장된다. 클라이언트 컴포넌트에서도 `fetch`는 쓸 수 있지만 캐싱 확장은 적용되지 않으므로, 사용자 이벤트에 따라 가져오는 데이터는 [[swr|SWR]]이나 TanStack Query 같은 라이브러리로 다룬다.
- 같은 렌더링 안에서 반복되는 요청의 중복 제거, 병렬·순차 요청, React `cache()`는 [[nextjs-app-router|App Router의 내비게이션과 데이터 가져오기]]에 있다.

### 정적 데이터와 동적 데이터

| 데이터 | 예 | 처리 |
| --- | --- | --- |
| 정적 | 블로그 글, 문서 | 빌드 때 가져와 캐시하고 재사용 |
| 동적 | 장바구니, 사용자별 데이터 | 요청마다 새로 가져옴. `cookies()`·`headers()`를 읽는 경로도 동적이 된다 |

### 재검증: 캐시를 언제 새로 고치나

캐시된 데이터를 새로 고치는 **재검증(revalidation)** 은 두 가지다.

| 방식 | 방법 | 쓸 때 |
| --- | --- | --- |
| 시간 기반 | `fetch`의 `next: { revalidate: 60 }`, 또는 구획 단위로 `export const revalidate = 60` | 조금 늦어도 되는 데이터. 뉴스 목록, 상품 가격 |
| 요청 기반(on-demand) | 데이터가 바뀐 시점에 `revalidateTag`·`revalidatePath`로 무효화. Server Action 안에서 자기가 쓴 변경을 바로 보여 줄 때는 `updateTag` | CMS 발행, 글 수정처럼 "바뀐 순간"을 알 수 있을 때 |

페이지·레이아웃·`fetch`에 서로 다른 시간을 주면 **가장 짧은 값**이 그 경로의 재검증 주기가 된다. 경로 단위(`revalidatePath`)보다 태그 단위(`cacheTag`/`fetch`의 `next.tags` + `revalidateTag`)가 더 정확해 권장된다. Next.js 16의 `revalidateTag(tag, 'max')`는 낡은 값을 먼저 보여 주고 뒤에서 갱신하는 stale-while-revalidate로 동작한다.

### Next.js 16: Cache Components와 `'use cache'`

위의 `fetch` 옵션 방식은 공식 문서에서 **"이전 모델(Previous Model)"** 로 분류된다. Next.js 16에서는 `next.config.ts`에 `cacheComponents: true`를 켜는 **Cache Components** 모델이 도입되었고, `create-next-app` 기본값으로 만든 새 App Router 앱에는 이미 켜져 있다. 이 모델에서는 `fetch` 옵션 대신 **`'use cache'` 지시어**로 함수나 컴포넌트의 결과를 캐시하고, `cacheLife`로 수명을 정한다.

```tsx
// app/lib/data.ts — 데이터 단위 캐시
import { cacheLife } from 'next/cache'

export async function getPosts() {
  'use cache'
  cacheLife('hours') // 캐시 수명 프로필
  const res = await fetch('https://api.example.com/posts')
  return res.json()
}
```

- 함수 인자와 바깥 스코프에서 캡처한 값이 자동으로 캐시 키가 된다.
- 컴포넌트·페이지 맨 위에 `'use cache'`를 쓰면 UI 단위로 캐시된다.
- 요청마다 새로 가져와야 하는 데이터는 캐시하지 않고 `<Suspense>`로 감싸, 미리 렌더링된 정적 껍데기(shell)를 먼저 보내고 데이터는 스트리밍한다([[streaming-ssr|스트리밍 SSR]]).
- `fetch`의 `cache`·`next.revalidate` 옵션도 계속 동작하므로, 기존 코드를 읽을 때는 위의 표가 그대로 유효하다.

## Pages Router 코드 읽기

Next.js 12까지의 튜토리얼과 오래된 프로젝트는 대부분 Pages Router로 쓰였다. 개념은 같고 이름과 위치가 다르다.

| 하는 일 | Pages Router (`pages/`) | App Router (`app/`) |
| --- | --- | --- |
| 공통 레이아웃·전역 CSS | `pages/_app.js`, `pages/_document.js` | `app/layout.tsx` (루트 레이아웃) |
| 빌드 때 데이터 가져오기(SSG) | `export async function getStaticProps()` | 서버 컴포넌트에서 캐시되는 `fetch`·`'use cache'` |
| 요청마다 가져오기(SSR) | `getServerSideProps(context)` | 캐시하지 않는 `fetch`, `cookies()` 같은 동적 API |
| 동적 경로 미리 만들기 | `getStaticPaths` → `{ paths: [{ params: { id } }], fallback }` | `generateStaticParams()` |
| `<head>` 수정 | `next/head`의 `<Head>` | `metadata` 객체, `generateMetadata()` |
| API 엔드포인트 | `pages/api/hello.js`의 `handler(req, res)` | `app/api/hello/route.ts`의 `GET`·`POST` (Route Handler) |
| 404 페이지 | `pages/404.js` | `app/not-found.tsx` |
| CMS 초안 미리보기 | Preview Mode | Draft Mode |

두 방식에 공통인 기능도 있다.

- **`<Link>`**: 클라이언트 측 내비게이션. 배포 빌드에서는 화면에 보이는 링크의 페이지 코드를 백그라운드에서 미리 받아(prefetch) 전환이 빠르다. Next.js 13부터는 자식에 `<a>`를 넣지 않는다.
- **`next/image`**: 크기 자동 조정, 최신 포맷 변환, 기본 지연 로딩. 크기를 알고 그려 레이아웃 이동(CLS)을 막는다.
- **`next/script`**: 서드파티 스크립트의 로드 시점을 `strategy`로 조절한다.
- **CSS Modules**: `*.module.css`로 import하면 클래스 이름이 파일마다 고유하게 바뀌어 충돌하지 않는다. 전역 CSS는 `_app`(Pages)이나 루트 레이아웃(App)에서만 import한다.
- `getStaticProps`처럼 서버에서만 도는 코드에서 **자기 앱의 API Route를 `fetch`하지 않는다.** 같은 서버 안이므로 DB나 라이브러리 함수를 직접 부른다.

미리 렌더링한 페이지(SSG·ISR)는 [[cdn|CDN]]에 캐시하기 좋아 Next.js와 궁합이 맞고, 요청 앞단의 가벼운 로직은 엣지에서 돌리기도 한다(Next.js 16의 `proxy.ts`는 Node.js 런타임).

## 언제 Next.js를 고르나

| 상황 | 이유 |
| --- | --- |
| 검색 노출이 중요한 서비스 | SSR·SSG로 HTML에 콘텐츠가 담긴다 |
| 데이터가 자주 바뀌지 않는 사이트(블로그, 포트폴리오) | SSG로 미리 만들어 두면 빠르고 저렴하다 |
| 초기 로딩 성능·접근성 점수 개선 | Lighthouse 성능 지표 개선에 유리 |
| 라우팅·빌드 설정을 직접 하기 싫을 때 | 파일 기반 라우팅, 최적화 기본 제공 |

## 핵심 정리

- Next.js = React + 라우팅 + 렌더링 전략(SSR·SSG·CSR) + 빌드 최적화.
- SSR·SSG·ISR을 페이지 단위로 섞어 쓴다. 모두 SEO에 유리하고, hydration을 거쳐야 상호작용이 가능해진다.
- 라우팅은 파일 구조 기반. 기본은 App Router(`app/`), 과거 방식은 Pages Router(`pages/`).
- App Router에서는 서버 컴포넌트에서 `fetch`한다. 캐시는 옵트인이며, 이전 모델은 `cache`/`revalidate` 옵션, Next.js 16의 Cache Components 모델은 `'use cache'` + `cacheLife`로 지정한다.
- 재검증은 시간 기반(`revalidate`·`cacheLife`)과 요청 기반(`revalidateTag`·`updateTag`·`revalidatePath`) 두 가지다. 여러 값이 겹치면 가장 짧은 값이 이긴다.
- 요청 앞단 처리는 `proxy.ts`(옛 이름 Middleware), 번들러는 Turbopack이 기본이다.

관련 노트: [[nextjs-app-router|App Router의 내비게이션과 데이터 가져오기]], [[nextjs-routing-conventions|App Router의 파일 규칙과 라우팅]], [[server-client-components|서버 컴포넌트와 클라이언트 컴포넌트 조합 규칙]], [[spa-csr-ssr|SPA와 CSR·SSR]], [[streaming-ssr|스트리밍 SSR]]
