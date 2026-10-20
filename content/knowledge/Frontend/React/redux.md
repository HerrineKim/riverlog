---
title: "Redux와 react-redux"
concept: "Redux"
summary: "앱 전체가 공유하는 state를 store 한 곳에 두고, reducer에 정의한 방식대로 dispatch로만 바꾸게 하는 상태 관리 라이브러리. 지금은 Redux Toolkit의 createSlice·configureStore로 쓰고, react-redux의 Provider·useSelector·useDispatch로 컴포넌트와 연결한다."
tags: ["react", "state", "redux", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/251", "https://riverkim.kr/252", "https://redux.js.org/introduction/why-rtk-is-redux-today"]
---

> riverkim.kr에 쓴 글들과 [Redux 공식 문서](https://redux.js.org/introduction/why-rtk-is-redux-today)를 바탕으로 다시 정리한 노트다.

**Redux**는 JavaScript 앱의 상태 관리 라이브러리다. 공유 state를 store 한 곳에 모으고, state를 바꾸는 방법을 reducer에 미리 정해 둔다. 컴포넌트는 store를 직접 고치지 못하고 "이렇게 바꿔 달라"는 요청(action)만 보낸다. 그래서 props를 여러 단계 내려보내지 않아도 되고, 누가 언제 state를 바꿨는지 추적하기 쉽다. **react-redux**는 store를 React 컴포넌트에 연결하는 바인딩 라이브러리다.

## Flux 패턴: 데이터는 한 방향으로만

Redux는 Facebook이 제안한 **Flux 패턴**의 대표 구현이다. 데이터가 한 방향으로만 흐르므로 상태 변화를 따라가기 쉽다.

| Flux 구성 | 역할 | Redux에서는 |
| --- | --- | --- |
| Action | "무엇이 일어났는지"를 담은 객체. `type`과 데이터 | action 객체 `{ type: 'counter/plus' }` |
| Dispatcher | Action 종류에 따라 Store를 업데이트 | `dispatch` + reducer |
| Store | 상태를 관리하는 곳 | store 하나(슬라이스로 나눔) |
| View | Store의 데이터를 UI로 보여 준다 | React 컴포넌트 |

```text
컴포넌트 ──dispatch(action)──▶ reducer(state, action) ──▶ 새 state ──▶ store
    ▲                                                                    │
    └──────────────────── useSelector로 읽기 ◀───────────────────────────┘
```

작은 규모라면 라이브러리 없이 `useReducer` + [[context|Context]]로 같은 흐름을 만들 수 있다.

## reducer는 순수 함수다

reducer는 `(현재 state, action) → 새 state`이고 state를 바꾸는 유일한 규칙이다. 기존 state를 고치지 않고 **새 객체를 반환**하며, 모르는 action이면 state를 그대로 돌려준다. 첫 인자의 기본값이 초기 state다.

```js
function counter(state = { number: 1 }, action) {
  if (action.type === 'counter/plus') return { ...state, number: state.number + 1 }
  return state
}
```

## Redux Toolkit으로 쓰기

Redux Toolkit(RTK)이 지금의 표준 작성법이다. `createSlice`가 reducer와 action 생성 함수를 한 번에 만들고, `configureStore`가 DevTools·미들웨어 기본 설정을 넣는다.

```js
// store.js
import { configureStore, createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { number: 1 },
  reducers: {
    plus: (state) => { state.number += 1 },               // Immer 덕분에 불변 업데이트가 된다
    add: (state, action) => { state.number += action.payload },
  },
})

export const { plus, add } = counterSlice.actions
export const store = configureStore({ reducer: { counter: counterSlice.reducer } })
```

- `createSlice`의 reducer 안에서는 state를 직접 바꾸는 것처럼 써도 된다. Immer가 새 객체를 만들어 준다. 직접 바꾸거나 새 값을 반환하거나 둘 중 하나만 한다.
- action type은 `슬라이스 이름/리듀서 이름`(`counter/plus`)으로 자동 생성된다.

과거에는 `createStore(reducer)`로 store를 만들고 `switch` 문 reducer와 action type 상수를 손으로 썼다. 지금 `createStore`는 deprecated 표시가 붙어 `legacy_createStore`로만 남았다.

## react-redux로 연결하기

| API | 역할 |
| --- | --- |
| `<Provider store={store}>` | 감싼 트리 안에서 store를 쓸 수 있게 한다. 보통 앱 최상단 |
| `useSelector(selector)` | state에서 필요한 값을 꺼낸다 |
| `useDispatch()` | `dispatch` 함수를 돌려준다 |

```jsx
root.render(<Provider store={store}><App /></Provider>)

function Counter() {
  const number = useSelector((state) => state.counter.number)
  const dispatch = useDispatch()
  return <button onClick={() => dispatch(plus())}>{number}</button>
}
```

- 읽는 컴포넌트와 바꾸는 컴포넌트가 트리에서 멀어도 props 전달이 필요 없다.
- `useSelector`로 고른 값이 바뀔 때만 다시 렌더링된다. state 전체(`(state) => state`)를 고르면 아무 값이 바뀌어도 리렌더링되므로 필요한 값만 고른다.

## 언제 Redux를 쓰나

| 상황 | 선택 |
| --- | --- |
| 몇 단계만 내려가는 값 | props |
| 테마·로그인 사용자처럼 드물게 바뀌는 전역 값 | [[context\|Context]] |
| 서버에서 받아 온 데이터(목록, 상세) | [[tanstack-query\|TanStack Query]]나 [[swr\|SWR]] 같은 서버 상태 라이브러리 |
| 여러 화면이 함께 쓰는 클라이언트 state, 작거나 중간 규모 | Zustand(스토어 하나를 훅으로, selector로 필요한 값만 구독) 또는 Jotai(atom 조합) |
| 여러 화면이 함께 고치는 복잡한 클라이언트 state, 액션 기록·미들웨어·DevTools 추적이 중요 | Redux Toolkit. 서버 데이터까지 한 도구로 다루려면 RTK Query |

라이브러리별 접근(스토어·atom·proxy) 비교는 [[react-state-management|리액트 상태 관리의 흐름과 고르는 기준]]에 있다.

## 정리

- store 하나에 공유 state를 두고, reducer가 정한 방식으로만 바꾼다. 데이터는 한 방향으로 흐른다.
- reducer는 순수 함수다. 기존 state를 고치지 않고 새 state를 반환한다.
- 새 코드는 Redux Toolkit의 `createSlice`·`configureStore`로 쓴다.
- 컴포넌트는 `useSelector`로 필요한 값만 읽고 `useDispatch`로 action을 보낸다.
- 서버 데이터는 Redux에 넣기보다 서버 상태 라이브러리에 맡기는 편이 단순하다.

관련 노트: [[context|Context]], [[state|State]], [[vuex|Vue 상태 관리: Pinia(옛 Vuex)]], [[frontend-mv-architecture|프론트엔드 MV* 아키텍처의 흐름]], [[react-state-management|리액트 상태 관리의 흐름과 고르는 기준]], [[functional-programming|함수형 프로그래밍]]
