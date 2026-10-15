---
title: "TanStack Query(React Query)"
concept: "React Query"
summary: "서버에서 가져온 데이터의 캐싱·재요청·로딩/에러 상태를 훅 하나로 다루게 해 주는 서버 상태 라이브러리. QueryClientProvider 설정, useQuery의 query key와 옵션, useMutation, 서버에서 미리 가져와 넘기는 SSR(dehydrate·HydrationBoundary)까지."
tags: ["react", "state", "cache", "api", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/159", "https://riverkim.kr/151", "https://seogeurim.tistory.com/m/19", "https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr"]
---

> riverkim.kr에 쓴 글들과 그리무의 「[React Query - SSR (Using Next.js) 번역](https://seogeurim.tistory.com/m/19)」(2022.08)을 바탕으로 재구성한 노트다. 코드는 TanStack Query v5 기준이다.

**TanStack Query**(옛 이름 React Query)는 **서버 상태**, 즉 서버에서 가져와 화면에 보여 주는 데이터를 다루는 라이브러리다. 앱이 단순하면 `useState`와 Context만으로도 충분하지만, 같은 데이터를 여러 화면이 쓰고 언제 다시 가져올지 정해야 하는 순간부터 캐싱·중복 요청 제거·에러 처리 코드가 불어난다. TanStack Query는 이 일을 훅 하나로 처리하고, 데이터가 바뀐 컴포넌트만 다시 렌더링한다. Redux보다 진입 장벽이 낮고 훅 기반이라 쓰기 편하다.

## 해 주는 일

| 기능 | 설명 |
| --- | --- |
| 캐싱 | 같은 query key의 결과를 캐시해 두고 다른 컴포넌트에서도 재사용한다 |
| 중복 요청 제거 | 같은 데이터를 동시에 여러 번 요청하면 한 번만 보낸다 |
| stale 처리 | 일정 시간이 지난 데이터는 오래된(stale) 것으로 보고 다시 가져온다 |
| 자동 재요청 | 사용자가 다른 탭에 갔다가 돌아오면(window focus) 다시 가져온다 |
| 이전 데이터 유지 | 다시 가져오는 동안에는 기존 데이터를 계속 보여 주고, 로딩 상태를 따로 알려 준다 |
| 무효화 | 데이터를 바꾼 뒤 `invalidateQueries`로 관련 캐시를 버리고 새로 가져온다 |
| 무한 스크롤 | `useInfiniteQuery`로 페이지 단위 로딩 |

## 설정: QueryClient와 QueryClientProvider

캐시를 들고 있는 객체가 `QueryClient`이고, `QueryClientProvider`가 이를 컴포넌트 트리 전체에 제공한다. 앱 최상단에서 한 번 설정한다.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false }, // 모든 쿼리의 기본 옵션
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  )
}
```

## useQuery: 데이터 읽기

```tsx
const { data, isPending, isError, error, refetch } = useQuery({
  queryKey: ['notice', 'list', page, keyword],
  queryFn: () => getNoticeList({ page, keyword }),
})
```

- **queryKey**: 캐시를 구분하는 고유 키 배열이다. 첫 요소에는 데이터 종류(`'notice'`)를, 뒤에는 요청을 바꾸는 값(페이지, 검색어)을 넣는다. 키에 넣은 값이 바뀌면 새 쿼리로 보고 다시 가져온다.
- **queryFn**: Promise를 반환하는 API 호출 함수.
- 반환값에는 데이터와 함께 로딩·에러 여부가 들어 있어, 상태별 화면을 바로 그릴 수 있다.

```tsx
function Todos() {
  const { status, data, error } = useQuery({ queryKey: ['todos'], queryFn: fetchTodoList })

  if (status === 'pending') return <span>Loading...</span>
  if (status === 'error') return <span>Error: {error.message}</span>

  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

### 자주 쓰는 옵션

| 옵션 | 의미 |
| --- | --- |
| `staleTime` | 가져온 데이터를 신선하다고 볼 시간(ms). 기본 0이라 거의 매번 백그라운드에서 다시 확인한다 |
| `gcTime` | 쓰이지 않는 캐시를 메모리에 남겨 둘 시간. v4까지는 `cacheTime` |
| `refetchOnWindowFocus` | 창에 다시 포커스될 때 재요청할지 |
| `retry` | 실패 시 재시도 횟수 |
| `enabled` | `false`면 자동으로 요청하지 않는다(다른 값이 준비된 뒤 요청할 때) |

- 쿼리 함수가 실패로 인식되려면 **에러를 throw**해야 한다. `fetch`는 404·500에도 reject하지 않으므로 `if (!res.ok) throw new Error(...)`를 직접 넣는다(axios는 자동으로 throw한다).
- 여러 쿼리를 동시에 돌릴 때는 `useQueries`를 쓴다.

## useMutation: 데이터 바꾸기

생성·수정·삭제처럼 서버 데이터를 바꾸는 요청은 `useMutation`으로 보낸다. 성공한 뒤 관련 쿼리를 무효화하면 목록이 자동으로 새로 고쳐진다.

```tsx
const queryClient = useQueryClient()

const { mutate } = useMutation({
  mutationFn: createNotice,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notice'] }),
})
```

`['notice']`로 무효화하면 `['notice', 'list', ...]`처럼 그 키로 시작하는 쿼리가 모두 무효화된다. 키 앞부분을 종류별로 맞춰 두면 이런 일괄 처리가 쉽다.

## SSR: 서버에서 미리 가져와 넘기기

서버 렌더링에서는 서버가 데이터를 먼저 가져와 HTML을 만들고, 브라우저의 쿼리 캐시가 그 데이터로 시작해야 같은 요청을 다시 보내지 않는다. 방법은 두 가지다.

| 방법 | 어떻게 | 한계 |
| --- | --- | --- |
| `initialData` | 서버에서 가져온 값을 props로 내려 `useQuery({ ..., initialData })`에 넣는다 | 깊은 컴포넌트까지 props로 내려야 하고, 같은 쿼리를 쓰는 곳마다 넣어야 한다. 가져온 시각을 몰라 `dataUpdatedAt`이 페이지 로드 시각이 된다 |
| **dehydrate / hydrate** | 서버에서 `prefetchQuery`로 캐시를 채우고, 캐시를 직렬화(`dehydrate`)해 넘긴 뒤 브라우저가 캐시에 다시 넣는다(`HydrationBoundary`) | 설정이 조금 더 많다 |

보통은 두 번째가 낫다. 미리 가져온 쿼리는 트리 어디서든 `useQuery`로 바로 읽히고, 미리 가져오지 않은 쿼리는 평소처럼 브라우저에서 가져온다. 어떤 쿼리를 서버에서 채울지는 `prefetchQuery` 줄을 넣고 빼는 것만으로 정한다.

### Next.js App Router

```tsx
// app/get-query-client.ts
import { QueryClient, isServer } from '@tanstack/react-query'

function makeQueryClient() {
  // 0이면 하이드레이션 직후 바로 다시 가져온다
  return new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } })
}

let browserQueryClient: QueryClient | undefined
export function getQueryClient() {
  if (isServer) return makeQueryClient()            // 서버: 요청마다 새로
  return (browserQueryClient ??= makeQueryClient()) // 브라우저: 하나만
}
```

```tsx
// app/posts/page.tsx — 서버 컴포넌트
export default async function PostsPage() {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({ queryKey: ['posts'], queryFn: getPosts })
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Posts /> {/* 'use client'. useQuery({ queryKey: ['posts'] })가 바로 데이터를 가진다 */}
    </HydrationBoundary>
  )
}
```

- **서버의 `QueryClient`는 요청마다 새로 만든다.** 모듈 전역에 하나만 두면 사용자 사이에 데이터가 섞인다.
- 브라우저의 `QueryClientProvider`는 `'use client'` 파일로 분리해 루트 레이아웃에서 감싼다.
- `staleTime`을 0보다 크게 둬야 하이드레이션 직후의 중복 요청이 없다.
- Pages Router라면 `getServerSideProps`·`getStaticProps`에서 같은 일을 하고 `dehydratedState`를 props로 넘겨 `_app`의 `HydrationBoundary`에 준다.

서버 컴포넌트에서 바로 그리기만 하면 되는 데이터는 TanStack Query를 거칠 필요가 없다. 브라우저에서 다시 가져오거나 변경·무효화해야 하는 데이터에만 이 방식을 쓴다.

## 버전별로 바뀐 점

v3~v4 시절 코드를 읽을 때 알아 둘 차이다.

| v3~v4 | v5 |
| --- | --- |
| `useQuery('todos', fetchTodos, options)` 위치 인자 | `useQuery({ queryKey, queryFn, ... })` 객체 하나만 |
| `status === 'loading'`, `isLoading` | `status === 'pending'`, `isPending` |
| `cacheTime` | `gcTime` |
| `<Hydrate state>` | `<HydrationBoundary state>` |
| `useQuery`의 `onSuccess`·`onError` 콜백 | 제거됨. 렌더링 중 `data`·`error`로 처리하거나 `useEffect`를 쓴다(`useMutation`에는 남아 있다) |
| 패키지 `react-query` | `@tanstack/react-query` (v4부터) |

## 정리

- 서버 데이터는 전역 state에 넣지 말고 TanStack Query 캐시에 맡긴다.
- 앱 최상단에 `QueryClientProvider`를 두고, `useQuery`(읽기)와 `useMutation`(쓰기)으로 다룬다.
- query key가 곧 캐시 주소다. 요청을 바꾸는 값은 전부 key에 넣는다.
- 바꾼 뒤에는 `invalidateQueries`로 관련 캐시를 새로 고친다.
- 비슷한 도구로 [SWR](/knowledge/dictionary/frontend/react/swr)이 있다.

관련 노트: [[swr|SWR로 데이터 가져오기]], [[nextjs-app-router|Next.js App Router의 내비게이션과 데이터 가져오기]], [[frontend-error-handling|프런트엔드 에러 핸들링]], [[re-rendering|리렌더링 원인 추적하기]], [[redux|Redux와 react-redux]]
