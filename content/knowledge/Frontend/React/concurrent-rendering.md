---
title: "동시성 렌더링: useTransition과 useDeferredValue"
concept: "Concurrent React"
summary: "React는 업데이트를 급한 것(입력)과 급하지 않은 것(전환)으로 나눠, 급하지 않은 렌더링은 중간에 끊고 급한 것을 먼저 처리한다. useTransition·startTransition은 상태 업데이트를 전환으로 표시하고(React 19부터 async 함수도 받아 Actions의 바탕이 된다), useDeferredValue는 값의 반영을 늦춘다. Suspense와 use는 기다리는 동안의 화면을 맡는다."
tags: ["react", "performance", "async", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/concurrent", "https://react.dev/reference/react/useTransition", "https://react.dev/reference/react/useDeferredValue"]
---

> [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)의 「[Concurrent React](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/concurrent)」를 바탕으로, react.dev의 [useTransition](https://react.dev/reference/react/useTransition)·[useDeferredValue](https://react.dev/reference/react/useDeferredValue) 문서로 보강한 노트다.

## 동시성 렌더링이란

React 18 이전의 렌더링은 한번 시작하면 끝까지 멈추지 않았다. 검색 결과 목록처럼 무거운 화면을 다시 그리는 동안에는 입력창에 글자가 늦게 찍혔다. **동시성 렌더링(concurrent rendering)**은 업데이트에 우선순위를 둔다.

| 업데이트 | 예 | 처리 |
| --- | --- | --- |
| 급한 업데이트 | 입력, 클릭, 호버에 대한 즉각 반응 | 바로 렌더링한다 |
| 전환(transition) | 탭 바꾸기, 필터 결과, 페이지 이동 | 백그라운드에서 렌더링하고, 그사이 급한 업데이트가 오면 **멈추고 버린 뒤** 다시 한다 |

전환 렌더링이 끝나기 전까지 화면은 이전 상태를 그대로 보여 준다. 반쯤 그려진 화면이 보이지 않는다. 이 반응성 문제를 재는 지표가 INP다([[ui-engineering-problems|UI 엔지니어링의 열두 가지 문제]]).

## API 한눈에 보기

| API | 하는 일 | 쓸 때 |
| --- | --- | --- |
| `useTransition()` | `[isPending, startTransition]`. 안에서 한 상태 업데이트를 전환으로 표시 | setter를 직접 부를 수 있을 때. 대기 표시가 필요할 때 |
| `startTransition(fn)` | 같은 일을 훅 없이. `isPending`이 없다 | 컴포넌트 밖(외부 스토어 구독, 라이브러리 코드) |
| `useDeferredValue(value, initialValue?)` | 값의 「늦게 따라오는 사본」 | setter가 내 손에 없을 때(props로 받은 값) |
| `<Suspense fallback>` | 자식이 기다리는 동안 대체 UI | 데이터·지연 로딩 컴포넌트 |
| `use(promise)` | Promise 값을 읽고, 끝나지 않았으면 Suspense로 넘긴다 | 부모가 만든 Promise를 자식이 읽을 때([[react-use-hook\|use 훅과 리액트 비동기 처리]]) |

## useTransition

```tsx
const [isPending, startTransition] = useTransition()
const [tab, setTab] = useState<'posts' | 'comments'>('posts')

function selectTab(next: 'posts' | 'comments') {
  startTransition(() => {
    setTab(next)          // 무거운 탭 렌더링을 전환으로
  })
}

return (
  <>
    <button onClick={() => selectTab('comments')}>댓글</button>
    {isPending && <Spinner />}
    {tab === 'posts' ? <Posts /> : <Comments />}
  </>
)
```

- 느린 탭을 누른 뒤 다른 탭을 누르면, 앞의 렌더링을 버리고 새 탭으로 간다.
- 이미 화면에 보이던 내용은 전환 중에 Suspense fallback으로 바뀌지 않는다. 이전 탭을 보여 주면서 `isPending`으로만 알린다.
- **입력창의 값은 전환으로 바꾸지 않는다.** 제어 입력의 state는 즉시 반영돼야 한다. 입력은 급하게, 그 값으로 계산하는 무거운 결과만 전환이나 `useDeferredValue`로 미룬다.

### async 전환과 Actions (React 19)

React 19부터 `startTransition`에 **async 함수**를 넘길 수 있다. `isPending`은 await한 작업까지 포함해 함수가 끝날 때까지 `true`다. 이 「비동기 전환」을 React 19는 **Action**이라 부르고, `useActionState`·`<form action>`·`useOptimistic`이 그 위에 만들어졌다([[forms|폼과 제어 컴포넌트]]의 「폼 액션」).

```tsx
const [isPending, startTransition] = useTransition()

function onSave() {
  startTransition(async () => {
    await saveDraft(content)
    startTransition(() => {      // await 뒤의 업데이트는 다시 감싸야 전환으로 표시된다
      setSavedAt(new Date())
    })
  })
}
```

`await` 뒤에 실행되는 setter는 바깥 전환의 범위를 벗어난다. React가 비동기 문맥을 추적하지 못하기 때문이라, 전환으로 처리하려면 한 번 더 `startTransition`으로 감싼다.

## useDeferredValue

```tsx
function SearchPage() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const isStale = query !== deferredQuery

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />  {/* 즉시 */}
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <SearchResults query={deferredQuery} />   {/* 뒤따라 렌더링 */}
      </div>
    </>
  )
}
```

- 먼저 이전 값으로 렌더링하고, 백그라운드에서 새 값으로 다시 렌더링한다. 새 입력이 오면 그 백그라운드 렌더링은 버려진다.
- 무거운 자식은 `memo`로 감싸야 효과가 있다. 그래야 이전 값으로 렌더링할 때 자식을 건너뛴다.
- 디바운스와 달리 고정 지연이 없다. 기기가 빠르면 거의 바로 따라오고, 느리면 그만큼 늦게 따라온다.
- React 19의 두 번째 인자 `initialValue`는 첫 렌더링에 쓸 값이다(`useDeferredValue(query, '')`). 서버 렌더링·스트리밍에서 첫 화면을 가벼운 값으로 먼저 보여 줄 때 쓴다.

## startTransition (훅 없이)

```ts
import { startTransition } from 'react'

store.subscribe(() => {
  startTransition(() => forceRender())
})
```

컴포넌트 밖에서도 부를 수 있지만 `isPending`이 없다. 대기 표시가 필요하면 훅을 쓴다.

## 타입

```ts
function useTransition(): [boolean, TransitionStartFunction]   // (callback: () => void | Promise<void>) => void
function useDeferredValue<T>(value: T, initialValue?: T): T
function use<T>(usable: Promise<T> | Context<T>): T
// SuspenseProps: { children?: ReactNode; fallback?: ReactNode }   fallback에는 null도 된다
```

## 정리

- 업데이트를 급한 것과 전환으로 나누면, React가 전환 렌더링을 끊고 입력을 먼저 처리한다.
- setter가 손에 있으면 `useTransition`, 값만 받으면 `useDeferredValue`, 컴포넌트 밖이면 `startTransition`.
- React 19의 async 전환이 Actions(`useActionState`, `<form action>`, `useOptimistic`)의 바탕이다. `await` 뒤 업데이트는 다시 감싼다.
- 입력값 자체는 전환으로 바꾸지 않는다. 미루는 것은 그 값으로 만드는 무거운 결과다.

관련 노트: [[hooks|React Hooks]], [[react-use-hook|use 훅과 리액트 비동기 처리]], [[forms|폼과 제어 컴포넌트]], [[re-rendering|리렌더링 원인과 추적]], [[ui-engineering-problems|UI 엔지니어링의 열두 가지 문제]], [[streaming-ssr|스트리밍 SSR]], [[react-typescript|React와 TypeScript]]
