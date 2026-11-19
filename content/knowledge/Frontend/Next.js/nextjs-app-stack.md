---
title: "Next.js 앱을 이루는 영역별 선택지"
concept: "Next.js App Stack"
summary: "라우팅 말고도 Next.js 앱 하나를 완성하려면 정해야 하는 영역들(개발 도구, 스타일링, API와 데이터, 자산·SEO, MDX 콘텐츠, 인증, 테스트·에러 추적, 배포)을 지금 기준의 선택지와 옛 방식의 대응 관계로 정리한 노트."
tags: ["nextjs", "frontend", "styling", "testing", "deployment", "auth"]
source: other
date: "2026-11-20"
sources: ["https://masteringnextjs.com/", "https://github.com/leerob/mastering-nextjs", "https://www.youtube.com/playlist?list=PL6bwFJ82M6FXjyBTVi6WSCWin8q_g_8RR", "https://nextjs.org/docs/app/api-reference/config/eslint", "https://nextjs.org/blog/next-15-5", "https://nextjs.org/docs/app/guides/css-in-js", "https://nextjs.org/docs/app/guides/mdx", "https://nextjs.org/docs/app/guides/testing", "https://nextjs.org/docs/app/getting-started/deploying", "https://better-auth.com/blog/authjs-joins-better-auth"]
---

> Lee Robinson의 무료 강의 「[Mastering Next.js](https://masteringnextjs.com/)」(2020, 유튜브 12강)를 뼈대로 삼고, 각 영역을 Next.js 16 공식 문서 기준으로 다시 쓴 노트다.

## 영역 지도

Next.js는 라우팅과 렌더링을 정해 주지만, 실제 서비스를 만들려면 그 주변 영역마다 도구를 골라야 한다. **각 영역의 "왜"는 그대로이고, 도구와 API 이름이 바뀌었다.**

| 영역 | 지금의 기본 | 과거 방식 (Pages Router 시절) |
| --- | --- | --- |
| 개발·빌드 | `next dev` · `next build` · `next start`, 번들러는 Turbopack | 같은 명령, webpack + Babel |
| 린트·포맷 | ESLint CLI + `eslint-config-next`(flat config) 또는 Biome, Prettier | `next lint`, `.eslintrc`, Standard |
| 스타일링 | 전역 CSS, CSS Modules, Tailwind CSS, Sass | 실험 플래그로 CSS import, `@zeit/next-sass` 플러그인 |
| CSS-in-JS | 클라이언트 컴포넌트에서만, 스타일 레지스트리 필요 | `_document`의 `getInitialProps`에서 스타일 수집 |
| 서버 API | Route Handler(`app/api/**/route.ts`), Server Function | API Route(`pages/api`), 커스텀 서버 |
| 클라이언트 데이터 | 서버 컴포넌트 `fetch` + 필요할 때 SWR·TanStack Query | `getInitialProps`, Apollo Client |
| 자산·SEO | `public/`, `metadata`·`generateMetadata`, 아이콘·OG 이미지 파일 규칙, `next/image` | `next/head`, 손으로 쓴 `<meta>` |
| 콘텐츠 | `@next/mdx` + `mdx-components.tsx`, 또는 헤드리스 CMS | `@next/mdx` + `pages/*.mdx` |
| 인증 | Better Auth(자체 호스팅) 또는 Clerk·Auth0(관리형) | NextAuth.js, Auth0 |
| 테스트 | Vitest·Jest + React Testing Library, Playwright·Cypress | Jest + RTL, Enzyme |
| 에러 | `error.tsx`·`global-error.tsx` + Sentry(`@sentry/nextjs`) | `pages/_error.js` + Sentry |
| 배포 | Vercel 등 어댑터, Node.js 서버, Docker(`standalone`), 정적 내보내기 | ZEIT Now(현 Vercel), `next export` |

## 1. 로컬 개발과 코드 품질

### 세 가지 스크립트

| 명령 | 하는 일 |
| --- | --- |
| `next dev` | 개발 서버(기본 3000번 포트). 저장하면 바로 반영된다(Fast Refresh) |
| `next build` | 프로덕션 빌드. 라우트마다 렌더링 방식을 기호로 보여 준다: `○` 정적(빌드 때 HTML 생성), `ƒ` 동적(요청마다 서버 렌더링) |
| `next start` | 빌드 결과를 프로덕션 모드로 띄운다. 배포 전 로컬 확인과 Node.js 자체 호스팅에 쓴다 |

빌드 결과의 `○`와 `ƒ` 기호는 "이 페이지가 의도대로 정적으로 나갔나"를 확인하는 가장 빠른 방법이다. Cache Components를 켜지 않은 기본 모델에서는 동적 API(`cookies()`, 캐시하지 않는 `fetch`)를 하나만 써도 그 라우트 전체가 `ƒ`가 된다. Cache Components를 켜면 **부분 사전 렌더링(Partial Prerendering)** 이 기본이라, 동적 API를 쓰는 부분을 `<Suspense>`로 감싸면 정적·캐시된 내용은 미리 만든 셸에 남고 그 부분만 요청 때 스트리밍된다.

### 린터와 포매터

- **린터(Linter)** 는 정적 분석으로 버그 가능성과 규칙 위반을 잡는다. **포매터(Formatter)** 는 동작은 건드리지 않고 모양만 맞춘다. 둘을 나눠 두면 코드 리뷰에서 탭·세미콜론 같은 스타일 논쟁이 사라진다([[static-analysis|정적 분석]]).
- Next.js 16에서 `next lint` 명령과 `next.config`의 `eslint` 옵션이 없어졌고, **`next build`도 더는 린트를 돌리지 않는다.** `package.json`의 `"lint": "eslint ."`처럼 ESLint CLI를 직접 부르고, CI에 린트 단계를 따로 둔다. 옮길 때는 `npx @next/codemod@canary next-lint-to-eslint-cli .`를 쓴다.
- `create-next-app`은 ESLint(규칙이 많다), Biome(린트와 포맷을 한 도구로, 빠르다), 없음 중에서 고르게 한다.
- 에디터의 format on save, 그리고 husky + lint-staged로 커밋 직전에 바뀐 파일만 포맷·린트하면 규칙이 저절로 지켜진다. 과거에는 설정 파일 없이 정해진 규칙을 쓰는 Standard(StandardJS)도 많이 썼다.

## 2. 스타일링

| 방법 | Next.js에서 쓰는 법 | 특징 |
| --- | --- | --- |
| 전역 CSS | 루트 레이아웃에서 `import './globals.css'` | 리셋·디자인 토큰 같은 진짜 전역만 둔다 |
| CSS Modules | `*.module.css`를 import | 클래스 이름이 파일마다 고유해져 충돌이 없다. 추가 설정 없음 |
| Tailwind CSS | `create-next-app`에서 선택 | 유틸리티 클래스 조합([[utility-first-css\|유틸리티 우선 CSS]]) |
| Sass | `sass` 패키지만 설치하면 `.scss`·`.module.scss`를 바로 import | 변수·중첩·믹스인([[sass\|Sass]]). 플러그인이 필요 없다 |
| styled-jsx | Next.js에 내장. `<style jsx>` | 컴포넌트 범위 CSS. App Router에서는 클라이언트 컴포넌트 + 레지스트리 |
| 런타임 CSS-in-JS (styled-components 등) | 클라이언트 컴포넌트에서만 | 테마·동적 스타일이 편하지만 서버 컴포넌트에서는 못 쓴다 |

**런타임 CSS-in-JS는 서버 컴포넌트에서 동작하지 않는다.** App Router에서 쓰려면 세 단계를 거친다.

1. 렌더링 중 생긴 CSS 규칙을 모으는 **스타일 레지스트리**를 만든다.
2. `next/navigation`의 `useServerInsertedHTML` 훅으로 모은 규칙을 그 스타일을 쓰는 콘텐츠보다 앞(`<head>`)에 넣는다.
3. 레지스트리를 감싼 클라이언트 컴포넌트로 루트 레이아웃의 `children`을 감싼다.

styled-components는 v6 이상과 `next.config`의 `compiler.styledComponents: true`가 필요하다. Next.js 컴파일러(SWC)가 예전 Babel 플러그인의 `displayName`·SSR 처리를 대신한다. 런타임 비용이 없는 빌드 타임 방식(vanilla-extract, Panda CSS, StyleX)이 늘어난 배경은 [[css-in-js|CSS 모듈과 CSS-in-JS]]에 있다.

스타일 방식과 별개로 **모바일 퍼스트**로 쓴다. 기본 스타일을 작은 화면 기준으로 쓰고 `@media (min-width: 768px)`처럼 `min-width`로 넓은 화면 규칙을 덧붙인다([[responsive-design|반응형 디자인]]). Chakra UI 같은 컴포넌트 라이브러리는 `fontSize={['sm', 'xl', '4xl']}`처럼 브레이크포인트별 값을 배열로 받아 미디어 쿼리를 대신 써 준다.

## 3. API와 데이터

### Route Handler: 별도 백엔드 없이 API 만들기

`app/api/users/route.ts`에서 `GET`·`POST` 같은 HTTP 메서드 이름의 함수를 내보내면 그 경로가 API가 된다. 동적 세그먼트도 페이지와 같다(`app/api/users/[id]/route.ts`). 서버에서만 도므로 DB 접근이나 비밀 키가 필요한 외부 API 호출(뉴스레터 구독, 결제 웹훅)을 여기서 한다. 자세한 규칙은 [[nextjs-routing-conventions|App Router의 파일 규칙과 라우팅]]의 Route Handler 절에 있다.

서버리스 플랫폼에 배포하면 **라우트마다 독립된 함수**로 나간다. 프런트엔드의 코드 스플리팅처럼 백엔드도 그 라우트에 필요한 코드만 싣는다.

### 커스텀 서버는 마지막 수단

Express 같은 서버로 Next.js의 요청 처리를 감싸는 **커스텀 서버**는 지금도 가능하지만 권장하지 않는다.

| 쓰는 이유 | 잃는 것 |
| --- | --- |
| 요청 처리 전체를 직접 제어, 기존 서버 인증 미들웨어 재사용, 상시 서버 하나가 서버리스보다 쌀 때 | Pages Router의 자동 정적 최적화, 서버리스 함수 단위 배포, Vercel 배포 |

대부분의 요구는 Route Handler, `proxy.ts`([[nextjs|Next.js를 쓰는 이유]]), `next start`로 충분하다.

### 페이지는 정적으로, 무거운 데이터는 클라이언트에서

대시보드처럼 데이터가 많고 사용자마다 다른 화면은 **뼈대는 정적으로 내보내고, 데이터는 브라우저에서 API를 불러 채운다.** 첫 화면이 빨리 뜨고, 서버 렌더링 비용도 줄어든다. 이때 쓰는 대표 도구가 [[swr|SWR]]이다. 캐시를 먼저 보여 주고 뒤에서 재검증하며, 탭에 다시 포커스하면 자동으로 새로 가져온다. App Router에서는 먼저 서버 컴포넌트에서 가져올 수 있는지 보고, 실시간 갱신이나 사용자 조작에 따른 재조회가 필요할 때 클라이언트 페칭을 쓴다.

### GraphQL과 관계형 데이터

[[graphql|GraphQL]]은 필요한 필드만 골라 한 번에 받는 API 질의 언어다. 조회는 쿼리(Query, REST의 GET), 변경은 뮤테이션(Mutation, POST·PUT)이다. GraphQL 서버를 직접 짓는 대신 **Hasura** 같은 엔진은 PostgreSQL 테이블과 관계를 정의하면 쿼리·필터·정렬과 CRUD 뮤테이션(`insert_<테이블>` 등)을 자동으로 만든다.

데이터 사이에 관계(가게 1 : N 할인 정보 1 : N 투표)가 많으면 문서형 NoSQL보다 관계형 DB가 조인과 무결성 면에서 다루기 쉽다. 클라이언트에서 GraphQL을 부를 때 Apollo Client처럼 큰 클라이언트 대신 SWR에 GraphQL 요청 함수를 fetcher로 넘기는 가벼운 방법도 있다.

## 4. 자산과 SEO

- **`public/`** 의 파일은 루트 경로로 그대로 서빙된다(`public/logo.png` → `/logo.png`).
- **파비콘과 공유 이미지는 파일 규칙으로 둔다.** `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png`, `app/opengraph-image.png`(또는 코드로 그리는 `opengraph-image.tsx`), `app/robots.ts`, `app/sitemap.ts`를 두면 Next.js가 알맞은 `<link>`·`<meta>`와 파일을 만든다.
- 제목·설명·Open Graph는 `metadata` 객체나 `generateMetadata()`로 쓴다. 태그 하나하나의 뜻은 [[html-head-metadata|HTML head와 메타데이터]], 검색 노출의 원리는 [[seo-basics|SEO 기초]]에 있다.
- 이미지는 `next/image`로 크기 조정·포맷 변환·지연 로딩을 맡긴다. 서버 렌더링 자체가 SEO의 핵심이다. 크롤러가 JS 실행을 기다리지 않아도 HTML에 콘텐츠가 있다.

## 5. MDX로 콘텐츠 쓰기

**MDX**는 마크다운 안에 JSX 컴포넌트를 넣을 수 있는 형식이다. 글은 마크다운으로 쓰고, 차트·뉴스레터 신청 폼 같은 인터랙티브 요소는 컴포넌트로 끼운다.

### MDX vs 헤드리스 CMS

| 기준 | MDX (저장소 안 파일) | 헤드리스 CMS (Contentful, Sanity 등) |
| --- | --- | --- |
| 누가 쓰나 | 개발자. Git과 마크다운에 익숙한 사람 | 마케터·에디터 등 비개발자도 GUI로 |
| 콘텐츠 위치 | 코드와 같은 저장소 | 별도 서비스. API로 가져온다 |
| 이미지 | 직접 관리(크기·압축·최적화) | 업로드하면 리사이즈·압축을 플랫폼이 처리 |
| 커스터마이징 | 글 안 어디에나 React 컴포넌트 | CMS가 정한 필드·블록 안에서 |
| 비용·의존 | 없음 | 서비스 요금, 벤더 의존 |

"헤드리스(Headless)"는 WordPress처럼 관리 화면과 사이트가 한 몸인 구조와 달리, **콘텐츠는 API로만 내보내고 화면은 마음대로 만든다**는 뜻이다. 어느 쪽이든 Next.js에서는 정적 생성으로 빌드 때 HTML을 만들어 두는 것이 기본이다([[static-site-generator|정적 사이트 생성기]]).

### `@next/mdx` 설정

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
npm install remark-gfm   # 아래 설정에서 쓰는 플러그인. 문자열로 적어도 설치는 따로 해야 한다
```

```js
// next.config.mjs
import createMDX from '@next/mdx'

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
  options: { remarkPlugins: ['remark-gfm'] }, // Turbopack에서는 플러그인을 문자열 이름으로
})

export default withMDX(nextConfig)
```

- 프로젝트 루트(또는 `src/`)에 **`mdx-components.tsx`가 반드시 있어야** App Router에서 동작한다. 여기서 `h1`·`img` 같은 요소를 내 컴포넌트로 바꿔 끼워 전체 글의 모양을 정한다.
- 쓰는 방법은 셋이다. `app/blog/page.mdx`처럼 MDX 자체를 페이지로, 일반 페이지에서 `.mdx`를 import해서, 또는 `[slug]` 동적 라우트에서 `await import(\`@/content/${slug}.mdx\`)`로 불러오고 `generateStaticParams`로 미리 생성한다. 없는 slug는 `notFound()`로 막는다.
- **frontmatter는 기본 지원하지 않는다.** `export const metadata = { ... }`로 내보내 목록 페이지에서 import하거나, `remark-frontmatter`·`gray-matter`를 쓴다.
- 기본은 `.mdx`만 컴파일한다. `.md`도 처리하려면 `createMDX({ extension: /\.(md|mdx)$/ })`.
- 원격 저장소·CMS에서 MDX 문자열을 받아 그리는 경우는 `next-mdx-remote` 같은 별도 패키지를 쓴다.

## 6. 인증

| 방식 | 예 | 고를 때 |
| --- | --- | --- |
| 관리형 서비스 | Clerk, Auth0 | 로그인 UI·소셜 로그인·MFA를 빨리 붙인다. 사용자 수에 따라 비용 |
| 자체 호스팅 라이브러리 | Better Auth | 사용자 데이터를 내 DB에 두고 비용 없이 |
| BaaS 내장 인증 | Supabase Auth, Firebase Auth | 이미 그 백엔드를 쓸 때 |

- 로그인 상태는 보통 **서명된 토큰(JWT)이나 세션 ID를 HttpOnly 쿠키**에 담아 유지한다. 서버 컴포넌트·Route Handler에서 `cookies()`로 읽어 검증하고, `proxy.ts`에서는 빠른 리다이렉트 정도만 한다. 인증 로직을 어느 층에 둘지는 [[auth-placement|인증은 어디에 두나]], 소셜 로그인의 흐름은 [[oauth2|OAuth 2.0]]에 있다.
- **NextAuth.js(Auth.js)는 2025년 9월 Better Auth 팀으로 관리가 넘어가 보안 패치 위주로 유지된다.** 새 프로젝트는 Better Auth를 쓰고, Auth.js는 기존 프로젝트 유지용이다.

## 7. 테스트와 에러 추적

### 무엇을 얼마나 테스트하나

> 테스트를 써라. 너무 많이는 말고. 주로 통합 테스트로. (Write tests. Not too many. Mostly integration.)

단위 테스트 100% 커버리지보다 **사용자가 실제로 쓰는 방식과 닮은 테스트**가 같은 시간 대비 확신을 더 준다. 로그인·결제처럼 가장 중요한 흐름의 스모크 테스트부터 쓴다. 테스트 층과 전략의 모양은 [[frontend-test-types|프론트엔드 테스트의 종류]]에 있다.

| 층 | 도구 | Next.js에서의 주의 |
| --- | --- | --- |
| 정적 검사 | TypeScript, ESLint | - |
| 단위·컴포넌트·통합 | Vitest 또는 Jest(`next/jest`로 설정) + React Testing Library | **async 서버 컴포넌트는 단위 테스트 도구가 아직 완전히 지원하지 않는다.** E2E로 검증한다 |
| E2E | Playwright, Cypress | `next build && next start`로 띄운 프로덕션 빌드에 돌린다 |
| 스냅숏 | Jest·Vitest의 `toMatchSnapshot` | 의도치 않은 마크업 변화 감지용. 남발하면 무의미하게 갱신된다 |

- React Testing Library는 화면에 보이는 것으로 요소를 찾는다. 우선순위는 역할(`getByRole`) → 레이블 → 텍스트 → 대체 텍스트 → `data-testid`(최후 수단)다([[a11y-driven-testing|접근성 기반 테스트]]).
- 쿼리 변형: `getBy`는 반드시 있어야 할 때, `queryBy`는 없을 수도 있을 때(빈 상태·에러 상태가 **없음**을 확인), `findBy`는 비동기로 나타날 때(await), `*AllBy`는 여러 개일 때.
- 레이아웃이 테마·다크 모드 Provider로 감싸져 있으면, 테스트마다 반복하지 않도록 **Provider로 감싼 `render`를 `test-utils`에 만들어** RTL의 `render` 대신 내보낸다.

### 에러 처리

- App Router는 세그먼트별 `error.tsx`(클라이언트 컴포넌트, `reset()`으로 재시도), `not-found.tsx`, 루트 레이아웃까지 실패할 때의 `global-error.tsx`로 에러 화면을 나눈다([[nextjs-routing-conventions|App Router의 파일 규칙과 라우팅]]).
- 화면에 보여 주는 것과 별개로 **에러를 수집**해야 고칠 수 있다. Sentry는 `npx @sentry/wizard@latest -i nextjs`로 서버·클라이언트·엣지 설정 파일과 `global-error.tsx` 연동을 만들어 준다. 프런트엔드 에러 처리 전반은 [[frontend-error-handling|프론트엔드 에러 처리]]에 있다.

## 8. TypeScript와 상태 관리

- **TypeScript는 설정 없이 지원된다.** `.ts`·`.tsx` 파일을 만들고 `next dev`를 돌리면 `tsconfig.json`과 `next-env.d.ts`가 생긴다([[react-typescript|React와 TypeScript]]).
- 상태는 종류부터 나눈다. 서버에서 온 데이터는 서버 컴포넌트나 SWR·TanStack Query의 캐시가 맡고, 폼 입력은 React Hook Form 같은 폼 라이브러리, 여러 화면이 함께 쓰는 UI 상태만 Context나 Zustand·Redux 같은 전역 스토어에 둔다. 서버 데이터를 Redux에 복사해 두던 방식은 서버 상태 도구로 대부분 대체됐다.

## 9. 배포

| 방식 | 지원 기능 | 방법 |
| --- | --- | --- |
| 어댑터 플랫폼 | 플랫폼별(검증된 어댑터: Vercel, Bun) | Git 저장소 연결. Vercel은 설정 파일(`vercel.json`) 없이 Next.js를 인식한다 |
| Node.js 서버 | 전부 | `next build` 후 `next start` |
| Docker | 전부 | `output: 'standalone'`으로 실행에 필요한 파일만 담은 작은 이미지 |
| 정적 내보내기 | 서버가 필요한 기능 제외 | `output: 'export'` → S3·Nginx·GitHub Pages 같은 정적 호스팅 |

정적 내보내기에서는 요청마다 도는 서버 렌더링, Route Handler의 동적 응답, `proxy.ts`, 기본 이미지 최적화 같은 서버 기능을 쓸 수 없다. 처음엔 정적 사이트로 시작하고, 서버 기능이 필요해질 때 Node.js 배포로 옮길 수 있다. ZEIT는 2020년에 Vercel로 이름을 바꿨다.

## 정리

- Next.js 앱의 영역은 개발 도구, 스타일링, API·데이터, 자산·SEO, 콘텐츠, 인증, 테스트·에러, 배포다. 영역마다 "왜"는 같고 도구가 바뀐다.
- Next.js 16 기준으로 린트는 `next lint`가 아니라 ESLint CLI·Biome를 직접 부르고, 빌드는 더 이상 린트하지 않는다.
- 스타일은 CSS Modules·Tailwind·Sass가 설정 없이 되고, 런타임 CSS-in-JS는 클라이언트 컴포넌트 + 스타일 레지스트리로만 쓴다.
- API는 Route Handler로, 커스텀 서버는 정말 필요할 때만. 무거운 사용자별 데이터는 정적 뼈대 위에 클라이언트에서 채운다.
- 콘텐츠를 개발자가 쓰면 MDX, 비개발자가 쓰면 헤드리스 CMS. 인증은 새로 시작하면 Better Auth나 관리형 서비스.
- **테스트는 사용자 행동을 닮게, 주로 통합 테스트로.** async 서버 컴포넌트는 E2E로 확인한다.

관련 노트: [[nextjs|Next.js를 쓰는 이유]], [[nextjs-routing-conventions|App Router의 파일 규칙과 라우팅]], [[swr|SWR]], [[css-in-js|CSS 모듈과 CSS-in-JS]], [[frontend-test-types|프론트엔드 테스트의 종류]], [[static-site-generator|정적 사이트 생성기]]
