---
title: "SWR로 서버 데이터 가져오기"
concept: "SWR"
summary: "캐시를 먼저 보여 주고 백그라운드에서 재검증하는 데이터 패칭 훅 SWR의 사용 패턴. mutate 옵션 객체와 optimisticData로 캐시를 갱신하고, SWR 캐시로 로그인 상태를 판단해 보호된 페이지를 만든다."
tags: ["react", "hooks", "http", "cache", "frontend", "auth"]
source: til
date: "2026-10-21"
sources: ["https://swr.vercel.app/docs/mutation", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/SWR.md"]
---

> 커스텀 훅으로 데이터를 나눠 쓰는 패턴은 「[Frontend_TIL: SWR](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/SWR.md)」을 바탕으로 보강했다.

**SWR**은 Vercel이 만든 데이터 패칭용 React Hooks 라이브러리다. 이름은 HTTP 캐시 전략 **stale-while-revalidate**에서 왔다. 캐시된(stale) 데이터를 먼저 보여 주고, 백그라운드에서 다시 요청해(revalidate) 최신 데이터로 바꾼다. 같은 key로 요청하는 컴포넌트들이 캐시를 공유하므로 서버 데이터를 **전역 상태처럼** 쓸 수 있다.

## 기본 사용법

SWR은 요청 방법을 모른다. URL을 받아 데이터를 돌려주는 fetcher를 직접 넘긴다.

```tsx
import useSWR from 'swr'

const fetcher = (url: string) =>
  axios.get(url, { withCredentials: true }).then((res) => res.data)

function Profile() {
  const { data, error, isLoading } = useSWR('/api/users', fetcher)

  if (error) return <div>불러오기 실패</div>
  if (isLoading) return <div>로딩 중...</div>
  return <div>{data.nickname}님 안녕하세요</div>
}
```

| 동작 | 설명 |
| --- | --- |
| 호출 | 첫 인자(key, 보통 URL)를 fetcher에 넘기고 반환값이 `data`가 된다 |
| 중복 제거 | 같은 key를 쓰는 다른 컴포넌트는 요청을 다시 보내지 않고 캐시를 공유한다 |
| 자동 재검증 | 창에 다시 포커스하거나 네트워크가 재연결되면 다시 요청한다 |
| 조건부 요청 | key 자리에 `null`을 주면 요청하지 않는다. `useSWR(user ? '/api/channels' : null, fetcher)` |
| 쿠키 | 세션 쿠키로 로그인을 증명한다면 fetcher에 `withCredentials: true`가 필수다. 빠뜨리면 다른 출처 서버의 쿠키가 저장·전송되지 않는다 |

GET은 SWR로, POST/PUT/DELETE 같은 변경 요청은 axios로 직접 보내고 그 뒤에 `mutate`로 캐시를 갱신하는 조합이 일반적이다.

중복 제거 덕분에 **데이터를 props로 내려보내지 않아도 된다.** key와 fetcher를 커스텀 훅으로 감싸 두고, 데이터가 필요한 컴포넌트가 각자 호출한다. 여러 곳에서 불러도 요청은 한 번이다. 부모는 데이터를 몰라도 되고, 컴포넌트를 옮겨도 props 연결을 다시 하지 않는다.

```tsx
function useNews() {
  const { data, error, isLoading } = useSWR('/api/news', fetcher)
  return { news: data, error, isLoading }
}

function Headline() { const { news } = useNews(); return <h2>{news?.[0].title}</h2> }
function NewsList() { const { news } = useNews(); return <ul>{news?.map((n) => <li key={n.id}>{n.title}</li>)}</ul> }
```

## mutate: 캐시 갱신

`useSWR`이 돌려주는 `mutate`는 그 key의 캐시를 바꾼다. 다른 컴포넌트의 캐시는 `useSWRConfig()`의 전역 `mutate(key)`로 갱신한다.

| 호출 | 동작 |
| --- | --- |
| `mutate()` | 서버에 **다시 요청**해 캐시를 갱신한다(재검증) |
| `mutate(newData, { revalidate: false })` | 요청 **없이** 캐시만 `newData`로 바꾼다 |
| `mutate(promise, { optimisticData, ... })` | 원격 변경을 일으키고, 결과를 기다리는 동안 화면을 먼저 바꾼다 |

| 옵션 | 기본값 | 의미 |
| --- | --- | --- |
| `revalidate` | `true` | 갱신이 끝난 뒤 서버에 재검증할지 |
| `populateCache` | `true` | 원격 변경 결과를 캐시에 쓸지 |
| `optimisticData` | — | 요청 결과를 기다리지 않고 캐시에 먼저 넣을 값(또는 함수) |
| `rollbackOnError` | `true` | 원격 변경이 실패하면 캐시를 되돌릴지 |

### Optimistic UI

서버 응답을 기다리지 않고 **화면을 먼저 바꾸는** 기법이다. 채팅 전송처럼 성공할 가능성이 높은 동작을 즉각적으로 느끼게 한다. "먼저 반영 → 요청 → 실패하면 되돌리기 → 끝나면 재검증"을 옵션 하나로 쓴다.

```tsx
await mutate(sendChat(newChat), {
  optimisticData: (prev) => [newChat, ...prev], // 먼저 화면에 반영
  rollbackOnError: true,                        // 실패하면 자동으로 되돌림
  populateCache: false,                         // 응답으로 캐시를 덮어쓰지 않고
  revalidate: true,                             // 끝나면 서버 데이터로 재검증
})
```

과거에는(SWR 1.x 이전) 두 번째 인자에 불리언을 넘겨 `mutate(data, false)`로 썼고, optimistic UI는 캐시 변경 → 요청 → `catch`에서 다시 `mutate()`로 되돌리는 코드를 직접 짰다. 0.x에는 재요청용 `revalidate()`가 따로 있었다.

## SWR 캐시로 로그인 상태 판단

"지금 로그인되어 있는가"는 `GET /api/users`(비로그인이면 `false` 반환)를 SWR로 가져와 판단한다. **SWR 캐시가 곧 전역 로그인 상태다.**

| `data` 값 | 뜻 | 화면 |
| --- | --- | --- |
| `undefined` | 아직 로딩 중 | 로딩 표시. 로그인 폼이 잠깐 깜빡이는 것을 막는다 |
| `false` | 비로그인 | 로그인 페이지로 보낸다 |
| 사용자 객체 | 로그인됨 | 로그인·회원가입 페이지에 왔다면 앱 안으로 돌려보낸다 |

```text
로그인  POST /api/users/login (쿠키 발급) → mutate()        → 내 정보 재요청, data 채워짐
로그아웃 POST /api/users/logout            → mutate(false, { revalidate: false }) → 즉시 비로그인
```

```tsx
function Workspace({ children }) {
  const { data: user, mutate } = useSWR('/api/users', fetcher)

  const onLogout = useCallback(() => {
    axios.post('/api/users/logout', null, { withCredentials: true })
      .then(() => mutate(false, { revalidate: false }))
  }, [mutate])

  // 조건부 return은 모든 Hook 호출 뒤에 둔다
  if (user === undefined) return <div>로딩 중...</div>
  if (user === false) return <Navigate to="/login" />

  return (
    <div>
      <button onClick={onLogout}>로그아웃</button>
      {children}
    </div>
  )
}
```

- **조건부 `return`은 Hook 호출보다 아래**에 둔다. 위에 있으면 렌더링마다 Hook 개수가 달라져 Hooks 규칙 위반이다.
- 로그인 여부 확인은 **레이아웃 컴포넌트**에서 한다. 각 페이지가 `children`으로 들어오므로 하위 페이지 전체가 보호된다.
- 리다이렉트는 react-router의 `<Navigate to=... />`로 한다. 과거 v5에서는 `<Redirect>`였다.
- 회원가입·로그인 폼 자체는 [[forms|React 폼]]의 폼 액션(`useActionState`)으로 결과 메시지와 대기 상태를 함께 다룰 수 있다.

## useSWRInfinite: 페이지 단위 로딩

채팅 기록, 피드처럼 페이지를 계속 이어 붙이는 데이터에 쓴다.

```tsx
import useSWRInfinite from 'swr/infinite'

const { data, size, setSize } = useSWRInfinite(
  (index) => `/api/dms/${id}/chats?perPage=20&page=${index + 1}`,
  fetcher,
)
const isReachingEnd = data?.[0]?.length === 0 || (data && data[data.length - 1]?.length < 20)
// 스크롤이 맨 위에 닿고 끝이 아니면 setSize((n) => n + 1)
```

- 첫 인자는 **페이지 인덱스를 받아 key를 돌려주는 함수**다.
- `data`는 페이지별 배열의 배열(2차원)이다. 그릴 때 `flat()`으로 편다.

## 정리

- SWR = 캐시 먼저 보여 주고(stale) 뒤에서 다시 가져오기(revalidate). 같은 key는 캐시를 공유한다.
- `mutate()`는 재요청, `mutate(data, { revalidate: false })`는 요청 없이 캐시만 변경, `optimisticData`로 optimistic UI.
- 로그인 상태는 SWR 캐시로 판단하고 `undefined`(로딩)와 `false`(비로그인)를 구분한다.
- 무한 스크롤은 `useSWRInfinite`(key 함수, 2차원 결과, `setSize`).

관련 노트: [[tanstack-query|TanStack Query(React Query)]], [[cookie-session|쿠키와 세션]], [[oauth2|OAuth 2.0]], [[auth-jwt-passport|NestJS JWT 인증(토큰 기반 백엔드)]]
