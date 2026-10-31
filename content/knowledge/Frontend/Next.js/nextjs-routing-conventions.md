---
title: "Next.js App Router의 파일 규칙과 라우팅"
concept: "App Router File Conventions"
summary: "App Router는 폴더가 URL 세그먼트, 특수 파일이 그 세그먼트의 역할이 된다. page·layout·template·loading·error·not-found·route·default의 렌더링 계층, 동적 세그먼트([id]·[...slug]·[[...slug]])와 Promise인 params, URL에 안 나오는 라우트 그룹과 프라이빗 폴더, 병렬 라우트(@slot)와 가로채는 라우트((.)·(..))로 만드는 URL 있는 모달, Route Handler, Metadata 병합과 title 템플릿까지 Next.js 16 기준으로 정리한다."
tags: ["nextjs", "react", "routing", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Next.js%283%29%20-%20Routing%2C%20Custom%20Errors%2C%20%EC%9E%AC%EC%82%AC%EC%9A%A9%20%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%20Structure%2C%20Private%20folders.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Next.js%284%29%20-%20Route%20Groups%2C%20Layouts%2C%20Metadata.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Next.js%285%29%20-%20Navigation%2C%20template.js%2C%20error.js.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Next.js%286%29%20-%20Parallel%20Routes%2CUnmatched%20Routes%2CDefault.js%2C%20Conditional%20Routes.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Next.js%287%29%20-%20Route%20Handlers.md", "https://nextjs.org/docs/app/getting-started/project-structure", "https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes", "https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes", "https://nextjs.org/docs/app/api-reference/file-conventions/route", "https://nextjs.org/docs/app/api-reference/functions/generate-metadata", "https://nextjs.org/docs/app/guides/upgrading/version-16", "https://nextjs.org/docs/app/api-reference/file-conventions/error"]
---

> 「[Frontend_TIL: Next.js](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/tree/master/Tool)」 연재 3~7편(라우팅, 레이아웃·메타데이터, template·error, 병렬 라우트, Route Handler)을 바탕으로, Next.js 16 공식 문서로 확인해 재구성한 노트다.

## 폴더는 URL, 파일은 역할

App Router에서 `app/` 아래 **폴더 하나가 URL 세그먼트 하나**다. 폴더만으로는 공개되지 않고, 그 폴더에 **`page`(화면)나 `route`(API)가 있어야** URL로 접근할 수 있다. 그래서 컴포넌트·유틸 파일을 라우트 폴더 안에 함께 둬도(colocation) 실수로 공개되지 않는다.

```text
app/layout.tsx              루트 레이아웃 (필수, <html>·<body>)
app/page.tsx                /
app/blog/page.tsx           /blog
app/blog/[slug]/page.tsx    /blog/first-post
app/blog/_components/…      라우팅 안 됨
```

| 파일 | 역할 |
| --- | --- |
| `page` | 그 경로의 화면. 있어야 경로가 공개된다 |
| `layout` | 하위 경로를 감싸는 공통 UI. **이동해도 다시 마운트되지 않아** 상태가 유지된다 |
| `template` | layout처럼 감싸지만 이동할 때마다 **새 key로 다시 마운트**된다. 자식 상태가 초기화되고 `useEffect`가 다시 돈다 |
| `loading` | 그 세그먼트를 감싸는 `<Suspense>`의 fallback. 서버에서 내용을 받는 동안 보여 준다 |
| `error` | 그 세그먼트를 감싸는 에러 경계. **클라이언트 컴포넌트**여야 한다 |
| `not-found` | `notFound()`를 호출하거나 맞는 경로가 없을 때의 404 UI. 루트의 것이 전체 404 |
| `global-error` | 루트 레이아웃까지 실패했을 때. 자기 `<html>`·`<body>`를 직접 그린다 |
| `route` | API 엔드포인트(Route Handler). **같은 세그먼트에 `page`와 함께 둘 수 없다** |
| `default` | 병렬 라우트 슬롯이 현재 URL과 맞지 않을 때의 대체 화면 |

### 렌더링 계층

한 세그먼트의 특수 파일은 정해진 순서로 겹쳐 그려지고, 하위 세그먼트는 상위 세그먼트의 `page` 자리에 통째로 들어간다.

```text
<Layout>
  <Template>
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loading />}>
        <NotFoundBoundary fallback={<NotFound />}>
          <Page />  또는 하위 세그먼트의 <Layout>…
```

여기서 두 가지가 나온다.

- **`error`는 같은 세그먼트의 `layout`·`template`을 감싸지 않는다.** 레이아웃에서 난 에러는 한 단계 위의 `error`가 잡는다. 루트 레이아웃 에러는 `global-error`만 잡는다.
- 에러가 나도 경계 바깥의 레이아웃은 그대로 살아 있어, 내비게이션·입력 상태가 유지된 채 그 구획만 대체 UI로 바뀐다.

`error` 컴포넌트는 `error`와 복구 함수를 받는다. [공식 문서](https://nextjs.org/docs/app/api-reference/file-conventions/error)에 따르면 Next.js 16.3부터 안정화된 `retry()`로 데이터를 다시 가져와 다시 그리고, 다시 가져오지 않고 에러 상태만 지우는 `reset()`은 특별한 경우에만 쓴다(16.2에서는 `unstable_retry`). 이전 버전 예제에는 `reset()`만 나온다.

```tsx
'use client' // 에러 경계는 클라이언트 컴포넌트여야 한다

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div>
      <h2>문제가 생겼다</h2>
      <button onClick={() => retry()}>다시 시도</button>
    </div>
  )
}
```

React 에러 경계 자체는 [[frontend-error-handling|프론트엔드 에러 처리]]에, `loading`이 만드는 스트리밍은 [[streaming-ssr|스트리밍 SSR]]에 있다.

## 동적 세그먼트

| 폴더 | 맞는 URL | `params` |
| --- | --- | --- |
| `[id]` | `/products/1` | `{ id: '1' }` |
| `[...slug]` (catch-all) | `/shop/a`, `/shop/a/b` (`/shop`은 안 맞음) | `{ slug: ['a', 'b'] }` |
| `[[...slug]]` (optional catch-all) | `/docs`, `/docs/a/b` | `{ slug: undefined }` 또는 배열 |

중첩도 된다. `app/products/[productId]/reviews/[reviewId]/page.tsx`는 두 값을 함께 받는다.

```tsx
// Next.js 15부터 params는 Promise다
export default async function Page({ params }: { params: Promise<{ productId: string; reviewId: string }> }) {
  const { productId, reviewId } = await params
  return <h1>{productId}번 상품의 {reviewId}번 리뷰</h1>
}
```

Next.js 14까지는 `params`를 객체로 바로 읽었다. 15에서 Promise로 바뀌어 동기 접근은 경고만 냈고, 16에서는 동기 접근이 제거됐다. `searchParams`, `cookies()`, `headers()`도 같다. `npx next typegen`이 만드는 `PageProps<'/products/[productId]'>` 같은 전역 타입을 쓰면 경로 문자열로 타입을 얻는다. 빌드 때 미리 만들 값은 `generateStaticParams()`로 돌려준다.

## URL에 나오지 않는 폴더

| 이름 | 효과 | 쓰임 |
| --- | --- | --- |
| `(group)` 라우트 그룹 | 괄호 폴더는 URL에서 빠진다. `app/(auth)/login/page.tsx` → `/login` | 관련 경로를 묶어 찾기 쉽게 한다. **그룹마다 다른 레이아웃**을 준다 |
| `_folder` 프라이빗 폴더 | 그 폴더와 하위 전체가 라우팅에서 빠진다. 안에 `page`가 있어도 404 | 라우트 옆에 컴포넌트·유틸을 둔다(`_components`, `_lib`) |

라우트 그룹으로 **같은 층의 일부 페이지만** 레이아웃을 공유하게 할 수 있다. `product/user1`은 빼고 `user2`·`user3`만 묶으려면 `product/(members)/user2`, `product/(members)/user3`와 `product/(members)/layout.tsx`를 둔다. 서로 다른 그룹이 같은 URL로 풀리면 오류가 난다(`(a)/about`과 `(b)/about`).

여러 곳에서 쓰는 컴포넌트는 특정 라우트 폴더가 아니라 `app/` 밖(`src/components`)이나 최상위 프라이빗 폴더에 둔다. 폴더 나누는 기준은 [[frontend-folder-structure|프론트엔드 폴더 구조]]에 있다.

## 병렬 라우트: 한 레이아웃에 여러 페이지

**병렬 라우트(Parallel Routes)** 는 한 레이아웃 안에 **이름 붙은 슬롯 여러 개**를 두고 각각 독립된 페이지를 그린다. 대시보드처럼 구획마다 따로 로딩·에러를 처리하고 따로 이동하는 화면에 쓴다.

```text
app/dashboard/
├─ layout.tsx          ← children, user, revenue, notifications를 props로 받는다
├─ page.tsx            ← children (암묵적 슬롯)
├─ @user/page.tsx
├─ @revenue/page.tsx
└─ @notifications/
   ├─ page.tsx
   └─ archived/page.tsx   → /dashboard/archived
```

```tsx
export default function Layout({ children, user, revenue, notifications }: LayoutProps<'/dashboard'>) {
  return <>{children}{user}{revenue}{notifications}</>
}
```

- `@slot` 폴더는 **URL 세그먼트가 아니다.** `@notifications/archived`의 URL은 `/dashboard/archived`다.
- 슬롯마다 `loading`·`error`를 따로 둘 수 있다. 한 구획이 느리거나 실패해도 나머지는 그대로다.
- **조건부 라우트**: 레이아웃에서 로그인 여부 같은 조건으로 슬롯을 골라 그린다(`return isLoggedIn ? dashboard : login`).

### 맞지 않는 슬롯과 `default`

`/dashboard`에서 링크로 `/dashboard/archived`로 가면 `@notifications`만 바뀌고 `@user`·`@revenue`는 **이전 화면을 그대로 유지**한다(소프트 내비게이션). 그런데 그 URL에서 **새로고침**하면 Next.js는 `@user`·`@revenue`가 무엇을 보여 주고 있었는지 알 수 없다. 이때 각 슬롯의 `default`를 그린다.

| 이동 | 맞지 않는 슬롯 |
| --- | --- |
| 소프트(클라이언트 이동) | 이전에 보이던 하위 페이지를 유지한다 |
| 하드(새로고침, 직접 접속) | 그 슬롯의 `default`를 그린다 |

**Next.js 16부터 모든 슬롯에 `default`가 있어야 빌드된다.** 예전처럼 404로 두려면 `notFound()`를, 아무것도 안 그리려면 `null`을 돌려주는 `default`를 만든다. `children`도 암묵적 슬롯이라 필요하면 `default`를 둔다.

## 가로채는 라우트: URL이 있는 모달

**가로채는 라우트(Intercepting Routes)** 는 앱 안에서 링크로 이동할 때 **목적지 경로를 가로채 지금 레이아웃 위에** 다른 화면을 그린다. 같은 URL을 새로고침하거나 직접 열면 가로채지 않고 원래 페이지가 뜬다.

| 표기 | 기준 (파일 경로가 아니라 **라우트 세그먼트** 기준) |
| --- | --- |
| `(.)photo` | 같은 레벨 |
| `(..)photo` | 한 레벨 위 |
| `(..)(..)photo` | 두 레벨 위 |
| `(...)photo` | `app` 루트 |

`@slot`은 세그먼트가 아니므로 `@modal/(.)photo`는 `@modal`의 부모와 같은 레벨을 가리킨다.

병렬 라우트와 합치면 **모달**이 된다.

```text
app/
├─ layout.tsx               ← {children}{modal}
├─ @modal/
│  ├─ default.tsx           ← null (모달 닫힘)
│  └─ (.)photo/[id]/page.tsx ← 피드에서 클릭하면 모달로
├─ feed/page.tsx
└─ photo/[id]/page.tsx       ← 새로고침·직접 접속하면 전체 페이지로
```

| 모달의 흔한 문제 | URL이 있어서 생기는 해결 |
| --- | --- |
| 모달 내용을 공유할 수 없다 | 주소를 복사하면 그 사진이 열린다 |
| 새로고침하면 모달이 사라진다 | 새로고침하면 사진 전체 페이지가 뜬다 |
| 뒤로 가기가 이전 페이지로 가 버린다 | 뒤로 가기로 모달이 닫히고, 앞으로 가기로 다시 열린다 |

모달을 닫을 때는 `router.back()`을 부르고, 모달이 없어야 하는 다른 경로로 링크 이동할 때 슬롯이 비도록 `@modal/[...catchAll]/page.tsx`가 `null`을 돌려주게 한다. 클라이언트 이동에서는 맞지 않는 슬롯이 이전 화면을 유지하기 때문이다.

## Route Handler

`route.ts`에서 HTTP 메서드 이름으로 함수를 export하면 그 경로가 API가 된다. 웹 표준 `Request`·`Response`를 쓴다.

```ts
// app/api/comments/route.ts
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('query')   // /api/comments?query=hello
  return Response.json(await findComments(q))
}

export async function POST(request: Request) {
  const body = await request.json()
  return Response.json(await createComment(body), { status: 201 })
}
```

```ts
// app/api/comments/[id]/route.ts
export async function GET(_req: Request, ctx: RouteContext<'/api/comments/[id]'>) {
  const { id } = await ctx.params
  return Response.json(await getComment(id))
}
```

| 규칙 | 내용 |
| --- | --- |
| 지원 메서드 | `GET` `POST` `PUT` `PATCH` `DELETE` `HEAD` `OPTIONS`. 없는 메서드는 `405 Method Not Allowed` |
| 위치 | `page`와 같은 세그먼트에 둘 수 없다. 화면과 API를 같은 경로 아래 두려면 `app/user/page.tsx` + `app/user/api/route.ts`처럼 나누거나, 관례대로 `app/api/…`에 모은다 |
| 캐시 | 기본은 캐시하지 않는다. `GET`만 옵트인으로 캐시할 수 있다(`dynamic = 'force-static'`, Cache Components에서는 `'use cache'`) |
| 요청 정보 | `NextRequest.nextUrl`(파싱된 URL), `await cookies()`·`await headers()`(`next/headers`), `redirect()`(`next/navigation`) |

Pages Router의 `pages/api/*`가 하던 일이다. 같은 앱 안의 서버 컴포넌트는 자기 Route Handler를 `fetch`하지 말고 데이터 함수를 직접 부른다. 클라이언트에서 부르는 변경 작업은 Server Function으로도 할 수 있다([[server-client-components|서버·클라이언트 컴포넌트 조합 규칙]]).

## Metadata

`layout`·`page`에서 `metadata` 객체나 `generateMetadata()` 함수를 export하면 `<head>`의 `<title>`·`<meta>`가 만들어진다. 둘 다 서버 컴포넌트에서만 된다.

- **루트에서 페이지 쪽으로 차례로 평가**하고, 같은 경로의 metadata를 **얕게(shallow) 병합**한다. 같은 키는 **페이지에 가까운 쪽이 덮어쓴다.**
- 얕은 병합이라 `openGraph`처럼 중첩된 객체는 하위에서 일부만 써도 **통째로 바뀐다.** 공유할 필드는 변수로 빼서 펼쳐 넣는다.

`title`은 문자열 외에 객체로 하위 세그먼트용 규칙을 정할 수 있다.

| 키 | 효과 |
| --- | --- |
| `default` | title을 정하지 않은 하위 세그먼트의 기본 제목. `template`을 쓰면 **필수** |
| `template` | 하위 세그먼트의 title을 `%s`에 넣는다. `'%s \| Acme'` |
| `absolute` | 상위의 `template`을 무시한 제목 |

```ts
// app/layout.tsx
export const metadata = { title: { template: '%s | Acme', default: 'Acme' } }
// app/about/page.tsx → <title>About | Acme</title>
export const metadata = { title: 'About' }
```

`template`은 **자식 세그먼트에만** 적용된다. 같은 세그먼트의 `page`나, 자식이 없는 `page`에 둔 `template`은 효과가 없다. 아이콘·OG 이미지·`sitemap`·`robots`는 같은 이름의 파일(`icon.png`, `opengraph-image.tsx`, `sitemap.ts`)로도 만든다. 메타데이터 태그 자체는 [[html-head-metadata|HTML head와 메타데이터]]에 있다.

## 정리

- 폴더 = URL 세그먼트, 특수 파일 = 역할. `page`·`route`가 있어야 공개된다.
- `layout`은 유지, `template`은 매번 다시 마운트. `error`는 같은 층의 `layout`을 못 잡는다.
- 동적 세그먼트는 `[id]`·`[...slug]`·`[[...slug]]`, `params`는 `await`한다.
- `(group)`과 `_folder`는 URL에 나오지 않는다. 그룹으로 레이아웃 범위를 나눈다.
- `@slot`은 한 레이아웃 안의 독립 구획, 가로채는 라우트와 합치면 URL이 있는 모달. 슬롯마다 `default`가 필요하다.
- Route Handler는 웹 표준 `Request`·`Response`, metadata는 얕은 병합과 `title.template`.

관련 노트: [[nextjs|Next.js를 쓰는 이유]], [[nextjs-app-router|App Router의 내비게이션과 데이터 가져오기]], [[server-client-components|서버·클라이언트 컴포넌트 조합 규칙]], [[react-router-layout|React Router 레이아웃]], [[frontend-error-handling|프론트엔드 에러 처리]]
