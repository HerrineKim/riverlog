---
title: "TanStack Query(React Query)"
concept: "React Query"
summary: "서버에서 가져온 데이터의 캐싱·재요청·로딩/에러 상태를 훅 하나로 다루게 해 주는 서버 상태 라이브러리. QueryClientProvider 설정, query key 설계, 캐시의 fresh·stale·inactive 생명 주기와 isPending·isFetching, 다시 가져오는 시점(mount·focus·reconnect·interval), select·enabled·의존 쿼리·useQueries, 페이지네이션과 useInfiniteQuery, useMutation 뒤 무효화·setQueryData·낙관적 업데이트, SSR(dehydrate·HydrationBoundary)까지."
tags: ["react", "state", "cache", "api", "frontend"]
source: mixed
date: "2026-10-21"
sources: ["https://riverkim.kr/159", "https://riverkim.kr/151", "https://seogeurim.tistory.com/m/19", "https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr", "https://react.vlpt.us/integrate-api/", "https://react.vlpt.us/integrate-api/01-basic.html", "https://react.vlpt.us/integrate-api/02-useReducer.html", "https://react.vlpt.us/integrate-api/03-useAsync.html", "https://react.vlpt.us/integrate-api/04-react-async.html", "https://react.vlpt.us/integrate-api/05-using-with-context.html", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/React%20Query.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/React%20Query%20%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC%281%29%20-%20%ED%99%98%EA%B2%BD%20%EC%84%A4%EC%A0%95%2C%20useQuery%2C%20handle%20Error%2C%20devtools.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/React%20Query%20%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC%282%29%20-%20React%20Query%20%EC%BA%90%EC%8B%9C.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/React%20Query%20%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC%283%29%20-%20Background%20Refetch%20%EC%98%B5%EC%85%98.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/React%20Query%20%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC%284%29%20-%20%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EC%9A%94%EC%B2%AD%20%ED%95%A8%EC%88%98%20%EC%9D%B4%EB%B2%A4%ED%8A%B8%20%ED%95%B8%EB%93%A4%EB%9F%AC%20%EB%93%B1%EB%A1%9D%20%2C%20Success%20and%20Error%20Callback%2C%20UI%EB%A5%BC%20%EC%9C%84%ED%95%9C%20%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EA%B0%80%EA%B3%B5%20%EC%98%B5%EC%85%98%2C%20Custom%20Query%20Hook.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/React%20Query%20%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC%285%29%20-%20Query%20Id%2C%20useQuery%20%EC%97%AC%EB%9F%AC%EB%B2%88%20%ED%98%B8%EC%B6%9C.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/React%20Query%20%286%29%20-%20Dependent%20Queries%2C%20Initial%20Query%20Data.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/React%20Query%287%29%20-%20Infinite%20Queries.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/React%20Query%288%29.md", "https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults", "https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates"]
---

> riverkim.kr에 쓴 글들과 그리무의 「[React Query - SSR (Using Next.js) 번역](https://seogeurim.tistory.com/m/19)」(2022.08)을 바탕으로 재구성한 노트다. 코드는 TanStack Query v5 기준이다.
> 「라이브러리 없이 짜면」 부분은 벨로퍼트의 「[벨로퍼트와 함께하는 모던 리액트](https://react.vlpt.us/)」 중 「[API 연동하기](https://react.vlpt.us/integrate-api/)」 장을 바탕으로 보강했다.
> 캐시 생명 주기·재요청 옵션·쿼리 조합·무한 쿼리·낙관적 업데이트는 「[Frontend_TIL: React Query 튜토리얼](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/React%20Query.md)」 연재를 바탕으로 보강하고 [TanStack Query 공식 문서](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)로 v5 기준을 맞췄다.

**TanStack Query**(옛 이름 React Query)는 **서버 상태**, 즉 서버에서 가져와 화면에 보여 주는 데이터를 다루는 라이브러리다. 앱이 단순하면 `useState`와 Context만으로도 충분하지만, 같은 데이터를 여러 화면이 쓰고 언제 다시 가져올지 정해야 하는 순간부터 캐싱·중복 요청 제거·에러 처리 코드가 불어난다. TanStack Query는 이 일을 훅 하나로 처리하고, 데이터가 바뀐 컴포넌트만 다시 렌더링한다. Redux보다 진입 장벽이 낮고 훅 기반이라 쓰기 편하다.

## 라이브러리 없이 짜면: 요청 상태 셋과 useAsync

API 요청 하나에는 **결과(data), 로딩 여부(loading), 에러(error)** 세 가지 상태가 따라온다. `useState` 셋과 `useEffect`로 짜면 요청마다 같은 코드가 반복된다.

```jsx
useEffect(() => {
  // effect 함수 자체는 async일 수 없어서 안에서 async 함수를 만들어 부른다
  const fetchUsers = async () => {
    setError(null); setUsers(null); setLoading(true)
    try {
      const res = await axios.get('https://jsonplaceholder.typicode.com/users')
      setUsers(res.data)
    } catch (e) {
      setError(e)
    }
    setLoading(false)
  }
  fetchUsers()
}, [])
```

세 setter를 `useReducer`의 `LOADING`·`SUCCESS`·`ERROR` 액션으로 바꾸면 상태 전이가 한곳에 모이고, 그 reducer를 커스텀 훅으로 감싸면 재사용할 수 있다.

```js
function reducer(state, action) {
  switch (action.type) {
    case 'LOADING': return { loading: true, data: null, error: null }
    case 'SUCCESS': return { loading: false, data: action.data, error: null }
    case 'ERROR': return { loading: false, data: null, error: action.error }
    default: throw new Error(`Unhandled action type: ${action.type}`)
  }
}

// callback: Promise를 돌려주는 함수, deps: 다시 요청할 조건, skip: true면 처음엔 요청하지 않는다
function useAsync(callback, deps = [], skip = false) {
  const [state, dispatch] = useReducer(reducer, { loading: false, data: null, error: null })
  const fetchData = async () => {
    dispatch({ type: 'LOADING' })
    try {
      dispatch({ type: 'SUCCESS', data: await callback() })
    } catch (e) {
      dispatch({ type: 'ERROR', error: e })
    }
  }
  useEffect(() => {
    if (skip) return
    fetchData()
  }, deps)
  return [state, fetchData]   // fetchData로 다시 불러온다
}

// 파라미터가 있는 요청: id가 바뀔 때마다 다시 요청
const [state] = useAsync(() => getUser(id), [id])
```

여러 화면이 같은 데이터를 쓰면 이 상태를 Context로 올려, `{ users: {loading, data, error}, user: {...} }`를 Context + `useReducer`에 두고 `getUsers(dispatch)`처럼 dispatch를 받는 요청 함수를 만든다. 요청마다 액션 셋(`GET_USERS`·`_SUCCESS`·`_ERROR`)이 반복되므로 `createAsyncDispatcher(type, promiseFn)` 같은 유틸로 줄인다. Redux에서 같은 일을 하는 방법은 [[redux-middleware|Redux 미들웨어와 비동기 처리]]에 있다.

이렇게 직접 짠 훅에는 다음이 빠져 있다.

| 빠진 것 | 결과 |
| --- | --- |
| 캐시 | 다른 화면에 갔다 오면 「로딩 중」부터 다시 시작한다 |
| 경쟁 상태 처리 | `id`가 빨리 바뀌면 늦게 온 이전 응답이 최신 값을 덮는다([[hooks\|Hooks]]의 「늦게 온 응답이 최신 값을 덮는다」) |
| 중복 요청 제거, 재시도, 백그라운드 갱신 | 직접 다 짜야 한다 |
| deps 검사 | `deps`를 배열로 받아 넘기면 lint가 빠진 의존성을 잡지 못한다 |

동작 원리를 이해하는 데는 좋지만, 실제 앱에서는 아래 기능이 다 들어 있는 TanStack Query나 [[swr|SWR]]을 쓴다. 과거에는 이런 훅을 묶은 `react-async`(`promiseFn`·`deferFn`·`watch`) 라이브러리도 쓰였으나 유지보수가 멈췄다.

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

- 쿼리 함수가 실패로 인식되려면 **에러를 throw**해야 한다. `fetch`는 404·500에도 reject하지 않으므로 `if (!res.ok) throw new Error(...)`를 직접 넣는다(axios는 자동으로 throw한다).
- 실패하면 에러를 보여 주기 전에 **조용히 3번 재시도**한다(지수 백오프). 에러 화면이 늦게 뜨는 이유다. `retry`·`retryDelay`로 바꾼다.
- 상세 조회처럼 id로 가져오는 쿼리는 id를 key에 넣는다(`['hero', heroId]`). 쿼리 함수는 `({ queryKey }) => fetchHero(queryKey[1])`처럼 key를 인자로 받을 수도 있다.
- 공식 [React Query Devtools](https://tanstack.com/query/latest/docs/framework/react/devtools)(`@tanstack/react-query-devtools`)를 Provider 안에 두면 key별 캐시 상태(fresh·stale·inactive)와 데이터를 눈으로 본다.

## 캐시의 생명 주기

query key마다 캐시 항목이 하나 생기고, 항목은 아래 상태를 오간다.

```text
요청 성공 ─→ fresh ──(staleTime 지남)──→ stale ──(구독 컴포넌트가 모두 사라짐)──→ inactive ──(gcTime 지남)──→ 삭제
              │                           │
              └ 재요청 계기가 와도 그대로 씀   └ 캐시를 먼저 보여 주고 계기가 오면 백그라운드에서 다시 가져옴
```

| 옵션 | 기본값 | 의미 |
| --- | --- | --- |
| `staleTime` | `0` | 데이터를 신선하다고 볼 시간(ms). 기본값이 0이라 받자마자 stale이 되어, 재요청 계기마다 백그라운드에서 다시 확인한다. `Infinity`면 무효화하기 전까지 다시 가져오지 않는다 |
| `gcTime` | 5분 | 아무도 쓰지 않는(inactive) 캐시를 메모리에 남겨 둘 시간. v4까지는 `cacheTime` |

이 구조 덕분에 다른 화면에 갔다 돌아오면 **캐시를 즉시 보여 주고**(로딩 표시 없음), 그 뒤 새 데이터가 오면 화면만 바꾼다(stale-while-revalidate). 응답이 이전과 같으면 구조적 공유(structural sharing)로 **이전 객체 참조를 그대로 유지**해 불필요한 리렌더링도 막는다.

### isPending과 isFetching

| 값 | 참이 되는 때 |
| --- | --- |
| `isPending` (`status === 'pending'`) | 캐시에 **데이터가 아직 없다**. 첫 요청 중이거나 `enabled: false`로 아직 요청하지 않았다 |
| `isFetching` | **요청이 진행 중**이다. 캐시가 있어도 백그라운드 재요청 중이면 참 |
| `isLoading` | `isPending && isFetching`. 데이터 없이 첫 요청이 진행 중 |

첫 화면의 스켈레톤은 `isPending`으로, 「갱신 중」 작은 표시는 `isFetching`으로 그린다.

## 다시 가져오는 시점

stale 캐시는 아래 계기가 올 때 백그라운드에서 다시 가져온다. fresh 캐시는 계기가 와도 그대로 쓴다.

| 옵션 | 계기 | 값 |
| --- | --- | --- |
| `refetchOnMount` | 그 쿼리를 쓰는 컴포넌트가 새로 마운트될 때 | `true`(기본, stale일 때만) · `false`(안 함) · `'always'`(fresh여도 항상) |
| `refetchOnWindowFocus` | 다른 탭에 갔다가 창으로 돌아올 때 | 위와 같음. 새로고침 없이 최신 데이터가 보이는 이유 |
| `refetchOnReconnect` | 네트워크가 다시 연결될 때 | 위와 같음 |
| `refetchInterval` | 일정 간격(ms)마다. `staleTime`과 무관한 폴링 | 숫자 또는 `false` |
| `refetchIntervalInBackground` | 탭이 백그라운드여도 폴링을 계속할지 | 기본 `false` |

이 밖의 갱신은 직접 일으킨다. `refetch()`(그 쿼리 하나), `queryClient.invalidateQueries()`(키로 여러 개, 아래 「useMutation」).

## 쿼리 다루기

| 옵션·도구 | 쓰는 곳 | 예 |
| --- | --- | --- |
| `enabled` | `false`면 자동으로 요청하지 않는다. 버튼을 눌러야 가져올 때(`refetch()`로 실행), 다른 값이 준비된 뒤에 가져올 때 | `enabled: !!userId` |
| `select` | 받은 데이터를 **화면에 맞게 가공**한다. 캐시에는 원본이 남고 `data`만 가공된 값이 된다 | `select: (data) => data.map((h) => h.name)` |
| `placeholderData` | 진짜 데이터가 오기 전에 잠시 보여 줄 값. **캐시에 저장되지 않는다** | 목록에 있던 항목으로 상세 화면을 미리 채운다 |
| `initialData` | 캐시의 **초기값**으로 넣는다. 이미 있는 데이터로 취급하므로 `staleTime`을 따른다 | `initialData: () => queryClient.getQueryData(['heroes'])?.find((h) => h.id === id)` |
| `useQueries` | 개수가 바뀌는 쿼리 여러 개. 훅을 반복문에서 부르면 [[hooks\|Hook 규칙]] 위반이라 배열로 넘긴다 | `useQueries({ queries: ids.map((id) => ({ queryKey: ['hero', id], queryFn: ... })) })` |

### 의존 쿼리

앞 쿼리의 결과가 있어야 다음 쿼리를 보낼 수 있으면 `enabled`로 순서를 건다.

```tsx
const { data: user } = useQuery({ queryKey: ['user', email], queryFn: () => getUser(email) })
const channelId = user?.channelId

const { data: courses } = useQuery({
  queryKey: ['courses', channelId],
  queryFn: () => getCourses(channelId!),
  enabled: !!channelId,       // channelId가 생기기 전에는 pending 상태로 기다린다
})
```

순차 요청은 두 번의 왕복이 직렬로 쌓인다. 가능하면 서버 API를 하나로 합치거나 서버에서 미리 가져온다.

### 커스텀 쿼리 훅과 queryOptions

같은 key·함수·옵션을 여러 컴포넌트에서 쓰면 한곳에 모은다. v5의 `queryOptions`로 묶으면 `useQuery`·`prefetchQuery`·`getQueryData`에 같은 정의를 넘기고 타입도 key에서 추론된다.

```tsx
export const heroQuery = (id: string) =>
  queryOptions({ queryKey: ['hero', id], queryFn: () => fetchHero(id), staleTime: 30_000 })

export const useHero = (id: string) => useQuery(heroQuery(id))
// 다른 곳: queryClient.prefetchQuery(heroQuery(id)), queryClient.getQueryData(heroQuery(id).queryKey)
```

## 페이지네이션과 무한 스크롤

**페이지 번호형**은 page를 key에 넣는다. page가 바뀌면 새 key라 데이터가 비고 로딩이 깜박이므로, 새 페이지가 올 때까지 **이전 페이지를 계속 보여 준다**.

```tsx
import { keepPreviousData, useQuery } from '@tanstack/react-query'

const { data, isPlaceholderData, isFetching } = useQuery({
  queryKey: ['colors', page],
  queryFn: () => fetchColors(page),
  placeholderData: keepPreviousData,   // v4까지는 keepPreviousData: true 옵션
})
// isPlaceholderData가 참이면 「다음」 버튼을 막는다
```

**「더 보기」·무한 스크롤**은 `useInfiniteQuery`로 페이지를 이어 붙인다.

```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['colors'],
  queryFn: ({ pageParam }) => fetchColors(pageParam),
  initialPageParam: 1,                                   // v5부터 필수
  getNextPageParam: (lastPage, allPages, lastPageParam) =>
    lastPage.length === 0 ? undefined : lastPageParam + 1, // undefined·null이면 다음 페이지 없음
})

data?.pages.map((page) => page.map((c) => <li key={c.id}>{c.label}</li>))
<button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>더 보기</button>
```

- `data`는 `{ pages: [...], pageParams: [...] }`다. 페이지별 배열을 두 번 펼쳐 그린다.
- `getNextPageParam`의 반환값이 다음 `queryFn`의 `pageParam`이 된다. 반환값이 `undefined`·`null`이면 `hasNextPage`가 거짓이다. 거꾸로 가려면 `getPreviousPageParam`·`fetchPreviousPage`.
- 자동 무한 스크롤은 목록 끝 감시 요소를 [[intersection-observer|IntersectionObserver]]로 보고 있다가 보이면 `fetchNextPage()`를 부른다. 다시 가져올 때는 **모든 페이지를 처음부터 순서대로** 다시 요청하므로 `maxPages`로 캐시에 남길 페이지 수를 제한할 수 있다.

## useMutation: 데이터 바꾸기

생성·수정·삭제처럼 서버 데이터를 바꾸는 요청은 `useMutation`으로 보낸다. `useQuery`와 달리 자동으로 실행되지 않고 `mutate(variables)`를 불러야 보낸다. 반환값은 `mutate`·`mutateAsync`, `isPending`·`isError`·`isSuccess`, `data`·`error`, 보낸 값 `variables`다.

화면의 데이터를 맞추는 방법은 세 가지다.

| 방법 | 동작 | 맞는 경우 |
| --- | --- | --- |
| 무효화 | 성공 뒤 `invalidateQueries`로 관련 쿼리를 stale로 만들고, 화면에 있으면 다시 가져온다 | 기본. 서버가 정렬·집계를 바꾸는 경우도 맞게 따라간다 |
| 응답으로 갱신 | 서버가 바뀐 리소스를 돌려주면 `setQueryData`로 캐시에 바로 넣는다. 요청이 한 번 줄어든다 | 생성·수정 API가 결과 객체를 돌려줄 때 |
| 낙관적 업데이트 | 응답을 기다리지 않고 **화면을 먼저 바꾸고**, 실패하면 되돌린다 | 좋아요, 체크 같은 실패가 드문 조작 |

```tsx
const queryClient = useQueryClient()

// 1) 무효화
const { mutate } = useMutation({
  mutationFn: createNotice,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notice'] }),
})

// 2) 응답으로 갱신: setQueryData(key, 업데이트 함수)
useMutation({
  mutationFn: addHero,
  onSuccess: (newHero) =>
    queryClient.setQueryData(['heroes'], (old: Hero[] = []) => [...old, newHero]),
})
```

`['notice']`로 무효화하면 `['notice', 'list', ...]`처럼 **그 키로 시작하는 쿼리가 모두** 무효화된다. 키 앞부분을 종류별로 맞춰 두면 이런 일괄 처리가 쉽다. 정확히 그 키 하나만 무효화하려면 `{ queryKey: ['notice'], exact: true }`를 준다. `setQueryData`의 업데이트 함수 안에서는 기존 배열을 고치지 말고 새 배열을 돌려준다.

### 낙관적 업데이트

캐시를 직접 바꾸는 방법은 다섯 단계다.

```tsx
useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })        // 1. 진행 중인 재요청이 덮어쓰지 않게 취소
    const previousTodos = queryClient.getQueryData(['todos'])         // 2. 되돌릴 스냅숏
    queryClient.setQueryData(['todos'], (old: Todo[] = []) => [...old, newTodo]) // 3. 화면 먼저 반영
    return { previousTodos }                                          // 4. 이 값이 onError·onSettled로 넘어간다
  },
  onError: (err, newTodo, onMutateResult) =>
    queryClient.setQueryData(['todos'], onMutateResult?.previousTodos), // 실패하면 되돌림
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }), // 5. 성공·실패와 무관하게 서버와 맞춤
})
```

화면 한 곳에서만 보이는 변경이면 캐시를 건드리지 않는 더 간단한 길이 있다. 요청이 끝나기 전까지 `variables`(보낸 값)를 목록 끝에 반투명하게 그려 두고, 성공해 다시 가져오면 진짜 항목으로 바뀐다. 실패해도 `variables`가 남아 있어 「다시 시도」 버튼에서 `mutate(variables)`로 재전송한다. 다른 컴포넌트에서 진행 중인 값을 보려면 `mutationKey`를 주고 `useMutationState`로 읽는다.

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
| `keepPreviousData: true` | `placeholderData: keepPreviousData`, `isPreviousData` → `isPlaceholderData` |
| `useInfiniteQuery`의 첫 `pageParam`을 `queryFn` 기본 매개변수로 | `initialPageParam` 필수 |
| 패키지 `react-query` | `@tanstack/react-query` (v4부터) |

## 정리

- 서버 데이터는 전역 state에 넣지 말고 TanStack Query 캐시에 맡긴다.
- 앱 최상단에 `QueryClientProvider`를 두고, `useQuery`(읽기)와 `useMutation`(쓰기)으로 다룬다.
- query key가 곧 캐시 주소다. 요청을 바꾸는 값은 전부 key에 넣는다.
- 캐시는 fresh → stale → inactive → 삭제로 흐른다. `staleTime`(기본 0)이 재요청 빈도를, `gcTime`(기본 5분)이 메모리 보존을 정한다.
- 첫 로딩은 `isPending`, 백그라운드 갱신은 `isFetching`으로 구분해 그린다.
- 바꾼 뒤에는 `invalidateQueries`로 관련 캐시를 새로 고치고, 응답이 결과를 주면 `setQueryData`, 실패가 드문 조작은 낙관적 업데이트.
- 비슷한 도구로 [SWR](/knowledge/dictionary/frontend/react/swr)이 있다.

관련 노트: [[swr|SWR로 데이터 가져오기]], [[redux-middleware|Redux 미들웨어와 비동기 처리]], [[hooks|Hooks]], [[nextjs-app-router|Next.js App Router의 내비게이션과 데이터 가져오기]], [[frontend-error-handling|프런트엔드 에러 핸들링]], [[re-rendering|리렌더링 원인 추적하기]], [[redux|Redux와 react-redux]]
