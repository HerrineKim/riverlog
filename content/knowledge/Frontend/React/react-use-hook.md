---
title: "use 훅과 리액트 비동기 처리"
concept: "use Hook"
summary: "use는 컴포넌트가 Promise나 Context의 값을 직접 읽게 해 주는 React 19 API다. 조건문·반복문 안에서도 부를 수 있지만 컴포넌트·훅 밖과 try-catch 안에서는 안 되고, 클라이언트에서는 캐시된 Promise만 넘겨야 한다. 서버 컴포넌트에서 만든 Promise를 내려받아 읽는 것이 기본 패턴이다."
tags: ["react", "hooks", "frontend", "async", "promise"]
source: other
date: "2026-10-13"
sources: ["https://yozm.wishket.com/magazine/detail/2374/", "https://react.dev/reference/react/use", "https://react.dev/reference/react/cache"]
---

> 요즘IT에 실린 「[use 훅이 바꿀 리액트 비동기 처리의 미래 맛보기(2)](https://yozm.wishket.com/magazine/detail/2374/)」(2023.12, 원 자료는 FEConf 2023 발표)와 React 공식 문서를 바탕으로 재구성한 노트다.

## use란

`use`는 **Promise 또는 Context의 값을 컴포넌트 안에서 직접 꺼내는 API**다. React 19(2024.12)에 정식으로 들어왔다. Promise가 아직 끝나지 않았으면 컴포넌트는 가장 가까운 `Suspense`의 fallback을 보여 주며 기다리고, 끝나면 값을 받아 다시 렌더링한다. Promise가 reject되면 가장 가까운 에러 바운더리가 잡는다.

```tsx
<ErrorBoundary fallback={<p>불러오지 못했습니다.</p>}>
  <Suspense fallback={<Spinner />}>
    <Albums albumsPromise={albumsPromise} />
  </Suspense>
</ErrorBoundary>
```

`use` 이전에는 Promise를 `useSWR`·`useQuery` 같은 데이터 페칭 라이브러리의 훅을 거쳐서만 다룰 수 있었다. `use`는 Promise를 React가 직접 이해하는 값으로 만든다(Promise의 일급 지원).

## 일반 훅과 다른 호출 규칙

| 위치 | 일반 훅 | `use` |
| --- | --- | --- |
| 조건문·반복문 안 | ✗ | ✓ |
| 조기 `return` 뒤 | ✗ | ✓ |
| `try`-`catch` 안 | — | ✗ (에러 바운더리로 처리) |
| 이벤트 핸들러, `map`·`filter` 콜백, 일반 헬퍼 함수 | ✗ | ✗ |
| 클래스 컴포넌트 | ✗ | ✗ |

조건부로 부를 수 있으니 **데이터를 쓰는 바로 그 자리에서 읽을 수 있다.** 컴포넌트 맨 위에 훅을 몰아 선언할 필요가 없고, 실제로 필요할 때만 리소스를 기다린다.

```tsx
function ItemPanel({ showEvent, eventsPromise }: Props) {
  if (!showEvent) return <NormalItems />
  const events = use(eventsPromise) // 조건 뒤에서도 호출 가능
  return <EventList items={events} />
}
```

`use`는 함수지만 React가 **문법처럼** 다룬다. `await`가 `async` 함수 안에서만, `yield`가 제너레이터 안에서만 쓰이듯 `use`는 컴포넌트·훅 본문에서만 쓴다. 그래야 React Compiler와 린터(`eslint-plugin-react-hooks`)가 호출 위치를 분석하고 최적화할 수 있다. 그래서 `use`를 부르는 공용 로직은 일반 헬퍼가 아니라 커스텀 훅으로 뽑는다.

## Promise는 캐시해서 넘긴다

`use`는 저수준 API라서 페칭 라이브러리가 해 주던 **캐싱과 프리페치**가 없다.

| 문제 | 원인 | 해결 |
| --- | --- | --- |
| 중복 요청·무한 대기 | 렌더링 중 `use(fetch(...))`처럼 Promise를 만들면 렌더링마다 **새 Promise**가 생긴다. 끝나면 다시 렌더링 → 또 새 요청 | 같은 인자에 **같은 Promise 인스턴스**를 돌려주는 캐시를 둔다. React는 이 경우 "uncached promise" 경고를 낸다 |
| `.then()` 체인 | 캐시된 Promise에 렌더링 중 `.then()`을 붙여도 새 Promise가 된다 | 가공까지 캐시 안에서 끝낸다 |
| 요청 워터폴 | 반복문 안에서 서로 무관한 `use`가 하나씩 차례로 막힌다 | **프리페치**: 위쪽에서 요청만 먼저 시작해 두고, 쓰는 자리에서 진행 중인 Promise를 읽는다 |

```ts
// 같은 인자에는 같은 Promise를 돌려준다 → 리렌더해도 새 요청이 생기지 않는다
const cache = new Map<string, Promise<Item[]>>()
function fetchItems(userId: string) {
  if (!cache.has(userId)) {
    cache.set(userId, fetch(`/api/items?user=${userId}`).then((r) => r.json()))
  }
  return cache.get(userId)!
}
```

무엇을 미리 불러올지 런타임에 정하는 **동적 프리페치**도 같은 원리다. 페이지가 어떤 데이터를 썼는지 기록해 두었다가, 다음 진입 때 진입 이벤트에서 그 요청을 먼저 시작한다. 프리페치 로직은 한곳에 모이고, 데이터를 읽는 코드는 쓰는 자리에만 남는다.

## 서버 컴포넌트와 함께 쓰기

캐시를 직접 짜는 대신, **Promise를 서버 컴포넌트에서 만들어 클라이언트 컴포넌트로 내려 주는 것**이 기본 패턴이다.

```tsx
// 서버 컴포넌트: await하지 않고 Promise를 그대로 넘긴다
export default function Page() {
  const messagePromise = fetchMessage()
  return (
    <Suspense fallback={<p>불러오는 중…</p>}>
      <Message messagePromise={messagePromise} />
    </Suspense>
  )
}

// message.tsx
'use client'
export function Message({ messagePromise }: { messagePromise: Promise<string> }) {
  return <p>{use(messagePromise)}</p>
}
```

- 서버 컴포넌트는 `use` 대신 `await`로 바로 기다려도 된다. Promise를 넘기면 그 아래 하위 트리만 기다리고 나머지는 먼저 그려진다.
- 넘기는 Promise의 결과는 직렬화할 수 있는 값이어야 한다.
- 요청 단위 중복 제거는 서버 컴포넌트 전용 `cache()`로 한다. React 19.2의 `cacheSignal()`로 캐시 수명이 끝날 때 진행 중인 요청을 취소할 수 있다.

## 정리

- `use`는 Promise·Context를 읽는 React 19 API다. 조건문·반복문 안에서는 되고, 컴포넌트·훅 밖과 `try`-`catch` 안에서는 안 된다.
- 대기는 `Suspense`, 실패는 에러 바운더리가 맡는다.
- 클라이언트에서는 **캐시된 Promise**만 넘긴다. 렌더링 중 새 Promise를 만들면 요청이 반복된다.
- 기본 패턴은 서버 컴포넌트가 Promise를 만들고 클라이언트 컴포넌트가 `use`로 읽는 것이다.
- 캐싱·재요청·무효화까지 필요한 클라이언트 데이터는 여전히 [[tanstack-query|TanStack Query]]·[[swr|SWR]]가 실용적이다.

관련 노트: [[hooks|Hooks]], [[swr|SWR로 데이터 가져오기]], [[re-rendering|리렌더링 원인 추적하기]], [[frontend-latency-numbers|프론트엔드 개발자가 알아야 할 지연 시간 숫자]]
