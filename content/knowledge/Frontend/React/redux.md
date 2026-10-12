---
title: "Redux와 react-redux"
concept: "Redux"
summary: "앱 전체가 공유하는 state를 store 한 곳에 두고, reducer에 정의한 방식대로 dispatch로만 바꾸게 하는 상태 관리 라이브러리. react-redux의 Provider·useSelector·useDispatch로 컴포넌트와 연결한다."
tags: ["react", "state", "redux", "frontend"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/251", "https://riverkim.kr/252"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트입니다.

**Redux**는 JavaScript 앱의 상태 관리 라이브러리다. 여러 컴포넌트가 같은 state를 쓰면 props를 몇 단계씩 내려보내야 하고, 누가 언제 state를 바꿨는지 추적하기도 어렵다. Redux는 공유 state를 **store 한 곳**에 모으고, state를 바꾸는 방법을 **reducer**에 미리 정해 둔다. 컴포넌트는 store를 직접 고치지 못하고 "이렇게 바꿔 달라"는 **요청(action)** 만 보낼 수 있다.

**react-redux**는 Redux store를 React 컴포넌트에 연결해 주는 바인딩 라이브러리다.

## Flux 패턴: 데이터는 한 방향으로만

Redux는 Facebook이 제안한 **Flux 패턴**의 대표 구현이다. Flux의 핵심은 데이터가 **한 방향으로만** 흐른다는 것이다. 어디서 누가 상태를 바꿨는지 추적하기 쉬워진다.

```text
Action → Dispatcher → Store → View → (사용자 입력) → Action → ...
```

| 구성 | 역할 | Redux에서는 |
| --- | --- | --- |
| Action | "무엇이 일어났는지"를 담은 객체. 종류(type)와 데이터를 전달 | action 객체 |
| Dispatcher | Action 종류에 따라 Store를 업데이트 | `dispatch` + reducer |
| Store | 데이터(상태)를 관리하는 곳. 보통 비즈니스 도메인별로 나눈다 | store 하나(슬라이스로 나눔) |
| View | Store의 데이터를 UI로 보여 준다(MVC의 View) | React 컴포넌트 |

작은 규모라면 라이브러리 없이 `useReducer` + [Context](/knowledge/dictionary/frontend/react/context)로 같은 흐름을 만들 수 있다.

## 구성 요소

| 요소 | 역할 | 예시 |
| --- | --- | --- |
| store | 공유 state를 보관하는 곳. 앱에 하나 | `createStore(reducer)` |
| reducer | `(현재 state, action) → 새 state`. state를 바꾸는 유일한 규칙 | `if (action.type === 'PLUS') ...` |
| action | 무엇을 할지 담은 객체. `type`은 필수 | `{ type: 'PLUS' }` |
| dispatch | action을 store에 보내는 함수 | `dispatch({ type: 'PLUS' })` |

```text
컴포넌트 ──dispatch(action)──▶ reducer(state, action) ──▶ 새 state ──▶ store
    ▲                                                                    │
    └──────────────────── useSelector로 읽기 ◀───────────────────────────┘
```

## react-redux로 연결하기

| API | 역할 |
| --- | --- |
| `<Provider store={store}>` | 감싼 컴포넌트 트리 안에서 store를 쓸 수 있게 한다. 보통 앱 최상단을 감싼다 |
| `useSelector(selector)` | store의 state에서 필요한 값을 꺼낸다. 인자로 함수를 받는다 |
| `useDispatch()` | `dispatch` 함수를 돌려준다 |

### 1. store 만들고 제공하기

```jsx
// index.js
import { createStore } from 'redux'
import { Provider } from 'react-redux'

function reducer(state = { number: 1 }, action) {
  switch (action.type) {
    case 'PLUS':
      return { ...state, number: state.number + 1 }
    case 'MINUS':
      return { ...state, number: state.number - 1 }
    default:
      return state
  }
}

const store = createStore(reducer)

root.render(
  <Provider store={store}>
    <App />
  </Provider>
)
```

- reducer의 첫 인자 기본값이 **초기 state**다. 처음 호출될 때 state가 `undefined`이므로 기본값이 들어간다.
- reducer는 기존 state를 직접 고치지 않고 **새 객체를 반환**한다(`{ ...state }` 복사 후 변경). 알 수 없는 action이면 state를 그대로 돌려준다.

### 2. 읽기와 바꾸기

```jsx
import { useSelector, useDispatch } from 'react-redux'

function Counter() {
  const number = useSelector((state) => state.number)
  const dispatch = useDispatch()

  return (
    <div>
      <p>{number}</p>
      <button onClick={() => dispatch({ type: 'PLUS' })}>+</button>
      <button onClick={() => dispatch({ type: 'MINUS' })}>-</button>
    </div>
  )
}
```

- 값을 읽는 컴포넌트와 바꾸는 컴포넌트가 트리에서 멀리 떨어져 있어도 props 전달이 필요 없다.
- `useSelector`로 고른 값이 바뀔 때만 그 컴포넌트가 다시 렌더링된다. state 전체(`(state) => state`)를 고르면 아무 값이 바뀌어도 리렌더링되므로 필요한 값만 고른다.

## 지금 쓴다면: Redux Toolkit

위 코드는 원리를 보여 주는 기본형이다. 지금 Redux 공식 문서는 `createStore`를 **deprecated**로 표시하고, 보일러플레이트를 줄인 **Redux Toolkit(RTK)** 을 표준으로 권한다.

```js
import { configureStore, createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { number: 1 },
  reducers: {
    plus: (state) => { state.number += 1 }, // Immer 덕분에 직접 바꾸는 것처럼 써도 불변 업데이트가 된다
  },
})

export const { plus } = counterSlice.actions
export const store = configureStore({ reducer: { counter: counterSlice.reducer } })
// 컴포넌트에서: dispatch(plus()), useSelector((state) => state.counter.number)
```

## 언제 Redux를 쓰나

| 상황 | 선택 |
| --- | --- |
| 몇 단계만 내려가는 값 | props |
| 테마·로그인 사용자처럼 드물게 바뀌는 전역 값 | [Context](/knowledge/dictionary/frontend/react/context) |
| 서버에서 받아 온 데이터(목록, 상세) | [TanStack Query](/knowledge/dictionary/frontend/react/tanstack-query)나 [SWR](/knowledge/dictionary/frontend/react/swr) 같은 서버 상태 라이브러리 |
| 여러 화면이 함께 고치는 복잡한 클라이언트 state | Redux(RTK) 같은 전역 상태 라이브러리 |

## 정리

- store 하나에 공유 state를 두고, reducer가 정한 방식으로만 바꾼다.
- 컴포넌트는 `useSelector`로 읽고 `useDispatch`로 action을 보낸다. `Provider`가 둘을 연결한다.
- reducer는 순수 함수다. 기존 state를 고치지 않고 새 state를 반환한다.
- 새 코드는 `createStore` 대신 Redux Toolkit의 `configureStore`·`createSlice`를 쓴다.
- 서버 데이터는 Redux에 넣기보다 서버 상태 라이브러리에 맡기는 편이 단순하다.

관련 노트: [[context|Context]], [[state|State]], [[vuex|Vuex 상태 관리]]
