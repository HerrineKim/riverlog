---
title: "SWR로 서버 데이터 가져오기"
concept: "SWR"
summary: "캐시를 먼저 보여 주고 백그라운드에서 재검증하는 데이터 패칭 훅 SWR의 사용 패턴."
tags: ["react", "hooks", "http", "cache", "frontend"]
source: til
---

**SWR**은 Next.js를 만든 Vercel이 만든 데이터 패칭용 React Hooks 라이브러리다. 이름은 HTTP 캐시 전략인 **stale-while-revalidate**에서 왔다. 캐시된(stale) 데이터를 먼저 화면에 보여 주고, 그동안 백그라운드에서 서버에 다시 요청해(revalidate) 최신 데이터로 바꾼다. 같은 키로 요청하는 컴포넌트들이 캐시를 공유하므로, 서버 데이터를 **전역 상태처럼** 쓸 수 있다.

```bash
npm i swr
```

## 기본 사용법

### 1. fetcher 만들기

SWR은 요청 방법을 모른다. URL을 받아 데이터를 반환하는 함수(fetcher)를 직접 넘긴다.

```typescript
// utils/fetcher.ts
import axios from 'axios'

const fetcher = (url: string) =>
  axios.get(url, { withCredentials: true }).then((response) => response.data)

export default fetcher
```

`withCredentials: true`는 다른 출처의 백엔드에 요청할 때도 **쿠키를 함께 보내고, 응답의 쿠키를 저장**하게 한다. 세션 쿠키로 로그인을 증명하는 구조라면 빠뜨리면 안 된다.

### 2. useSWR

```tsx
import useSWR from 'swr'
import fetcher from '@utils/fetcher'

function Profile() {
  const { data, error, isLoading, mutate } = useSWR('/api/users', fetcher)

  if (error) return <div>불러오기 실패</div>
  if (isLoading) return <div>로딩 중...</div>
  return <div>{data.nickname}님 안녕하세요</div>
}
```

- 첫 번째 인자(key, 보통 URL)를 fetcher의 인자로 넘겨 호출하고, 그 반환값이 `data`가 된다.
- 같은 key를 쓰는 다른 컴포넌트는 요청을 중복으로 보내지 않고 캐시를 공유한다(deduplication).
- 창에 다시 포커스할 때, 네트워크가 재연결될 때 자동으로 재검증한다.
- key 자리에 `null`을 주면 요청하지 않는다(조건부 요청). 예: `useSWR(userData ? '/api/channels' : null, fetcher)`

GET 요청은 SWR로, POST/PUT/DELETE 같은 변경 요청은 axios로 직접 보내고 그 뒤에 `mutate`로 캐시를 갱신하는 조합이 일반적이다.

## mutate: 캐시 갱신

| 호출 | 동작 |
| --- | --- |
| `mutate()` | 서버에 **다시 요청**해 캐시를 최신 데이터로 갱신(재검증) |
| `mutate(newData, false)` | 서버 요청 **없이** 캐시만 `newData`로 즉시 변경 |
| `mutate(newData)` | 캐시를 먼저 바꾸고, 이어서 서버에 재검증 |

```tsx
// 로그인 성공 후: 서버에서 내 정보를 다시 가져와 화면 갱신
axios.post('/api/users/login', { email, password }, { withCredentials: true })
  .then(() => mutate())

// 로그아웃 후: 요청 없이 캐시를 false로
axios.post('/api/users/logout', null, { withCredentials: true })
  .then(() => mutate(false, false))
```

참고: 옛 버전(0.x)에는 재요청용 `revalidate()`가 따로 있었고, 1.0부터는 인자 없는 `mutate()`가 그 역할을 한다. 다른 컴포넌트의 캐시는 `import { mutate } from 'swr'`의 전역 `mutate(key)`로 갱신한다.

SWR 2.x 공식 문서는 두 번째 인자에 불리언 대신 **옵션 객체**를 넘기는 형태로 설명한다. 위의 `mutate(newData, false)`는 `mutate(newData, { revalidate: false })`와 같은 의미다.

| 옵션 | 기본값 | 의미 |
| --- | --- | --- |
| `revalidate` | `true` | 갱신이 끝난 뒤 서버에 재검증할지 |
| `populateCache` | `true` | 원격 변경 결과를 캐시에 쓸지 |
| `optimisticData` | — | 요청 결과를 기다리지 않고 캐시에 먼저 넣을 값(또는 함수) |
| `rollbackOnError` | `true` | 원격 변경이 실패하면 캐시를 되돌릴지 |

### Optimistic UI

서버 응답을 기다리지 않고 **화면을 먼저 바꾸는** 기법이다. 채팅 전송처럼 성공할 가능성이 높은 동작을 즉각적으로 느끼게 해 준다.

```tsx
const onSubmitForm = async (e) => {
  e.preventDefault()
  // 1. 캐시에 내 메시지를 먼저 추가 (요청 없이)
  mutate((prev) => [[newChat, ...prev[0]], ...prev.slice(1)], false)
  try {
    // 2. 서버에 실제 요청
    await axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`, { content: chat })
    // 3. 성공하면 서버 데이터로 재검증
    mutate()
  } catch {
    // 4. 실패하면 되돌리고 에러 표시
    mutate()
    toast.error('전송에 실패했습니다.')
  }
}
```

SWR 2.x에서는 이 "먼저 반영 → 요청 → 실패 시 되돌리기" 흐름을 옵션으로 줄여 쓸 수 있다.

```tsx
await mutate(sendChat(newChat), {           // 원격 변경을 일으키는 Promise
  optimisticData: (prev) => [[newChat, ...prev[0]], ...prev.slice(1)], // 먼저 화면에 반영
  rollbackOnError: true,                      // 실패하면 자동으로 되돌림
  populateCache: false,                       // 응답으로 캐시를 덮어쓰지 않고
  revalidate: true,                           // 끝나면 서버 데이터로 재검증
})
```

## useSWRInfinite: 페이지 단위 로딩

채팅 기록, 피드처럼 페이지를 계속 이어 붙이는 데이터에 쓴다.

```tsx
import useSWRInfinite from 'swr/infinite'

const PAGE_SIZE = 20

const { data: chatData, size, setSize, mutate } = useSWRInfinite(
  (index) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=${PAGE_SIZE}&page=${index + 1}`,
  fetcher,
)

const isEmpty = chatData?.[0]?.length === 0
const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < PAGE_SIZE)

// 스크롤이 맨 위에 닿으면 다음 페이지 로드
const onScroll = (values) => {
  if (values.scrollTop === 0 && !isReachingEnd) {
    setSize((prev) => prev + 1)
  }
}
```

- 첫 번째 인자가 **주소 문자열이 아니라, 페이지 인덱스를 받아 주소를 반환하는 함수**다.
- 결과 `data`는 페이지별 배열의 배열(**2차원 배열**)이다. 화면에 그릴 때는 `flat()`으로 펴거나 역순으로 합친다.
- `setSize`로 불러올 페이지 수를 늘린다.

## 핵심 정리

- SWR = 캐시 먼저 보여 주고(stale) 뒤에서 다시 가져오기(revalidate). 같은 key는 캐시를 공유한다.
- fetcher는 직접 만든다. 쿠키 기반 인증이면 `withCredentials: true`.
- `mutate()`는 재요청, `mutate(data, false)`는 요청 없이 캐시만 변경 → optimistic UI.
- 무한 스크롤은 `useSWRInfinite`(key 함수, 2차원 결과, `setSize`).
