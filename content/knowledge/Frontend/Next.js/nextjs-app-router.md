---
title: "Next.js App Router의 내비게이션과 데이터 가져오기"
concept: "App Router"
summary: "App Router는 서버가 라우팅하고 클라이언트가 내비게이션한다. Link·useRouter, prefetch와 클라이언트 캐시, 서버 컴포넌트의 병렬·순차 fetch, 요청 중복 제거, React cache()와 preload 패턴을 정리한다."
tags: ["nextjs", "react", "rendering", "cache", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/207", "https://riverkim.kr/214", "https://nextjs.org/docs/app/getting-started/linking-and-navigating", "https://nextjs.org/docs/app/api-reference/config/next-config-js/staleTimes"]
---

> riverkim.kr에 쓴 글들을 바탕으로 Next.js 16 공식 문서와 대조해 재구성한 노트입니다.

Next.js 13에서 도입된 **App Router**(`app/` 디렉터리)는 Pages Router와 사고방식이 다르다. **라우팅은 서버 중심이고, 내비게이션은 클라이언트 사이드다.** 데이터는 `getServerSideProps` 같은 페이지 단위 함수 대신 서버 컴포넌트 안에서 바로 `fetch`한다. 렌더링 방식(SSR·SSG)과 `fetch` 캐시 옵션은 [Next.js를 쓰는 이유](/knowledge/dictionary/frontend/next-js/nextjs)에 정리했다.

## 서버 컴포넌트가 기본

`app/` 아래 컴포넌트는 기본이 **React Server Component(RSC)** 다. 상호작용이 필요한 곳만 `'use client'`로 클라이언트 컴포넌트를 만들고, 서버가 경로를 해석해 그 결과(RSC payload)를 내려보내므로 클라이언트가 라우터 지도 전체를 받을 필요가 없다. 두 종류의 컴포넌트를 어떻게 섞을 수 있고 무엇이 안 되는지는 [[server-client-components|서버 컴포넌트와 클라이언트 컴포넌트 조합 규칙]]에 정리했다.

![[riverkim/207-1.jpg]]

## 내비게이션

### 두 가지 방법

| 방법 | 쓰는 곳 | 특징 |
| --- | --- | --- |
| `<Link href="/dashboard">` | 서버·클라이언트 컴포넌트 | `<a>`를 확장한 컴포넌트. prefetch와 클라이언트 사이드 이동을 지원하는 기본 수단 |
| `useRouter()` (`next/navigation`) | 클라이언트 컴포넌트 | `router.push()`, `router.replace()`, `router.refresh()`로 코드에서 이동 |

```tsx
'use client'
import { useRouter } from 'next/navigation' // Pages Router의 next/router가 아니다

export default function GoDashboard() {
  const router = useRouter()
  return <button onClick={() => router.push('/dashboard')}>Dashboard</button>
}
```

### Prefetch

`<Link>`가 화면(뷰포트)에 들어오거나 마우스가 올라가면 Next.js가 **이동하기 전에** 그 경로를 백그라운드에서 미리 받아 클라이언트 캐시에 넣는다. 그래서 실제로 클릭했을 때 SPA처럼 빠르게 전환된다. prefetch는 프로덕션 빌드에서만 동작한다.

| 경로 | 미리 받는 범위 |
| --- | --- |
| 정적 경로 | 경로 전체 |
| 동적 경로 | 건너뛰거나, `loading.tsx`가 있으면 공유 레이아웃과 로딩 UI까지만(부분 prefetch) |

### 이동이 일어나는 순서

```text
<Link> 클릭 또는 router.push()
  └─ 주소창 URL 갱신
      └─ 클라이언트 캐시에 쓸 수 있는 결과가 있나?
          ├─ 있음 → 캐시를 재사용, 바뀐 구획(segment)만 렌더링
          └─ 없음 → 서버에서 바뀐 구획의 RSC Payload를 받아 옴
                     (받는 동안 loading UI 표시)
```

- **부분 렌더링(partial rendering)**: 공유 레이아웃은 이동해도 다시 받거나 다시 렌더링하지 않는다. 바뀐 페이지 구획만 교체하므로 레이아웃의 **클라이언트 상태가 유지**된다.
- **클라이언트 캐시(Client Cache)**: 방문하거나 prefetch한 경로의 RSC Payload를 브라우저 메모리에 둔다. 레이아웃과 로딩 UI는 재사용하지만 **동적 페이지는 기본으로 캐시하지 않는다**(Next.js 15부터 `staleTimes.dynamic` 기본값 0초, 정적 페이지는 5분). 뒤로·앞으로 가기는 예외로 캐시를 재사용해 스크롤 위치를 지킨다.
- 캐시를 버리는 방법: `router.refresh()`, `revalidatePath`·`revalidateTag`·`updateTag`, `cookies.set`·`cookies.delete`. 새로 고침하면 캐시가 모두 사라진다.
- 유지 시간은 경로별로 `cacheLife`의 `stale` 값으로 정하는 것이 권장 방식이다. 전역 설정 `staleTimes`는 실험 기능이다.

## 데이터 가져오기

### 원칙

1. 가능하면 **서버 컴포넌트에서** 가져온다.
2. 독립적인 요청은 **병렬로** 시작해 대기 시간을 줄인다.
3. 데이터는 **쓰는 곳에서 직접** 가져온다. 같은 요청이 여러 번 나와도 Next.js·React가 중복을 없앤다.
4. `loading.js`와 `<Suspense>`로 준비된 부분부터 보여 준다(스트리밍).

### 서버에서 가져오면 좋은 점

- 백엔드 데이터 소스(DB 등)에 직접 접근할 수 있다.
- API 키·액세스 토큰이 브라우저에 노출되지 않는다.
- 렌더링과 데이터 가져오기가 같은 곳에서 일어나 클라이언트↔서버 왕복이 줄어든다.
- 클라이언트에서 요청을 여러 번 보내는 대신 서버에서 한 번에 모은다.

클라이언트에서 가져와야 한다면(사용자 입력에 따라 바뀌는 데이터 등) [SWR](/knowledge/dictionary/frontend/react/swr)이나 [TanStack Query](/knowledge/dictionary/frontend/react/tanstack-query)를 쓴다.

### async 서버 컴포넌트

```tsx
// app/page.tsx
async function getData() {
  const res = await fetch('https://api.example.com/posts')
  if (!res.ok) throw new Error('Failed to fetch data') // 가장 가까운 error.js가 받는다
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <main>{/* ... */}</main>
}
```

- 서버 컴포넌트는 그대로 `async`/`await`를 쓴다. 결과를 직렬화하지 않으므로 `Date`·`Map` 같은 값도 반환할 수 있다.
- 서버 컴포넌트에서 `cookies()`, `headers()`로 요청의 쿠키·헤더를 읽을 수 있다. 이 함수를 쓰면 그 경로는 **동적 렌더링**이 된다.
- 클라이언트 컴포넌트에서는 `async` 컴포넌트를 쓸 수 없다. 대신 React의 `use(promise)`로 Promise 결과를 읽는다(React 19에서 정식 기능). `use`는 다른 훅과 달리 조건문·반복문 안에서도 호출할 수 있다. 자세한 내용은 [[react-use-hook|use 훅과 리액트 비동기 처리]] 참고.

### 병렬 vs 순차

| 패턴 | 방법 | 쓸 때 |
| --- | --- | --- |
| 병렬(parallel) | 요청을 먼저 모두 시작하고 `Promise.all`로 기다린다 | 서로 의존하지 않는 데이터 |
| 순차(sequential) | 앞의 결과를 받은 뒤 다음 요청을 시작한다 | 다음 요청에 앞의 결과가 필요할 때 |

순차 요청은 앞 요청이 끝나야 다음이 시작되는 **폭포(waterfall)** 를 만든다. 의도한 게 아니라면 로딩만 길어진다.

![[riverkim/214-1.jpg]]

```tsx
// app/artist/[username]/page.tsx
export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const artistData = getArtist(username) // await 없이 둘 다 먼저 시작
  const albumsData = getArtistAlbums(username)

  const artist = await artistData // 아티스트 정보 먼저 표시
  return (
    <>
      <h1>{artist.name}</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Albums promise={albumsData} />
      </Suspense>
    </>
  )
}

async function Albums({ promise }: { promise: Promise<Album[]> }) {
  const albums = await promise
  return <ul>{albums.map((a) => <li key={a.id}>{a.name}</li>)}</ul>
}
```

`Promise.all`로 둘 다 기다리면 둘 다 끝날 때까지 아무것도 안 보인다. 위처럼 한쪽을 `<Suspense>`로 감싸면 준비된 부분을 먼저 보여 줄 수 있다. (`params`가 Promise인 것은 Next.js 15부터다. 13~14에서는 `{ params: { username } }`로 바로 꺼냈다.)

### 렌더링을 막는 위치

레이아웃에서 데이터를 기다리면 그 아래 모든 구획이 데이터가 올 때까지 렌더링되지 않는다. Pages Router의 `getServerSideProps`도 끝날 때까지 페이지 전체를 막는 "전부 아니면 전무" 방식이었다. App Router에서는 두 가지로 피한다.

- `loading.js`를 두어 기다리는 동안 그 구획의 로딩 UI를 스트리밍한다.
- 데이터 요청을 트리의 **아래쪽**(실제로 쓰는 컴포넌트)으로 내려, 막히는 범위를 줄인다.

HTML을 Suspense 경계 단위로 나눠 보내는 원리와 상태 코드·버퍼링 같은 제약은 [[streaming-ssr|스트리밍 SSR]]에 있다.

## 중복 제거와 캐시

### 요청 중복 제거

같은 렌더링 중에 여러 컴포넌트가 **같은 URL·옵션의 GET `fetch`** 를 부르면 실제 요청은 한 번만 나간다(request memoization). 그래서 현재 사용자 정보처럼 여러 곳에서 필요한 데이터를 props로 내려보내지 않고 각자 가져와도 된다. POST 요청은 중복 제거되지 않는다.

![[riverkim/214-2.jpg]]

### React `cache()`

ORM·DB 클라이언트처럼 `fetch`가 아닌 방법으로 가져올 때는 React의 `cache()`로 감싸 같은 효과를 낸다. 한 요청 안에서 같은 인자로 다시 부르면 이전 결과를 재사용한다.

```ts
// utils/get-user.ts
import { cache } from 'react'
import 'server-only' // 이 모듈을 클라이언트에서 import하면 빌드 에러

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } })
})

export const preload = (id: string) => {
  void getUser(id) // 결과를 기다리지 않고 요청만 먼저 시작
}
```

- 레이아웃과 페이지가 모두 `getUser(id)`를 불러도 DB 쿼리는 한 번이다.
- `cache()`의 인자는 원시 값이어야 비교가 정확하다. 깊은 객체는 매번 다른 값으로 본다.
- `server-only` 패키지는 서버용 데이터 함수가 실수로 클라이언트 번들에 들어가는 것을 막는다.

### preload 패턴

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  preload(id) // 사용자 데이터 요청을 지금 시작
  const condition = await fetchCondition()
  return condition ? <User id={id} /> : null // User 안의 getUser(id)는 캐시를 받는다
}
```

조건을 확인하는 동안 필요할 것 같은 데이터를 미리 요청해 둔다. `preload`는 API가 아니라 이름 붙인 패턴일 뿐이다.

### 데이터 캐시와 재검증

여기까지는 **한 번의 렌더링 안에서** 요청을 아끼는 이야기다. 렌더링을 넘어 결과를 보관하는 데이터 캐시, 시간·요청 기반 재검증(`revalidate`, `revalidatePath`·`revalidateTag`), 버전별 기본값 변화와 Next.js 16의 `'use cache'`는 [[nextjs|Next.js를 쓰는 이유]]의 「데이터 캐싱과 재검증」 절에 모았다.

## 정리

- App Router는 서버 컴포넌트가 기본이고, 상호작용이 필요한 곳만 `'use client'`로 만든다.
- 이동은 `<Link>`(prefetch 포함)나 `next/navigation`의 `useRouter`로 한다. 공유 레이아웃은 유지하고 바뀐 구획만 그린다.
- 데이터는 서버 컴포넌트에서, 쓰는 곳 가까이에서, 가능하면 병렬로 가져온다. 느린 부분은 `<Suspense>`로 감싼다.
- 같은 GET `fetch`는 자동으로 중복 제거되고, `fetch`가 아닌 데이터는 `cache()`로 감싼다.
- 캐싱 기본값은 버전마다 바뀌었으므로 원하는 동작은 옵션으로 명시한다([[nextjs|Next.js를 쓰는 이유]]의 캐싱 절 참고).

관련 노트: [[nextjs|Next.js를 쓰는 이유]], [[spa-csr-ssr|SPA와 CSR·SSR]], [[tanstack-query|TanStack Query]], [[streaming-ssr|스트리밍 SSR]], [[server-client-components|서버 컴포넌트와 클라이언트 컴포넌트 조합 규칙]]
