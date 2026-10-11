---
title: "React Hooks"
concept: "Hooks"
summary: "함수 컴포넌트에서 state·생명주기·메모이제이션을 쓰게 해 주는 API와 그 규칙, 커스텀 훅."
tags: ["react", "hooks", "state", "lifecycle", "frontend"]
source: til
---

**Hook**은 함수 컴포넌트가 클래스 컴포넌트의 기능(state, 생명주기 등)을 쓸 수 있게 해 주는 함수다. React 16.8(2019)에 추가되었고, 지금은 함수 컴포넌트 + Hooks가 React의 표준 작성 방식이다. 기존 클래스 컴포넌트를 굳이 Hooks로 다시 쓸 필요는 없다.

## 왜 필요한가

함수 컴포넌트는 리렌더링될 때마다 **함수 전체가 다시 실행**된다. 안에서 선언한 변수는 매번 새로 만들어지고 초기화되므로, 그대로는 이전 값을 기억할 수 없다(그래서 예전에는 함수 컴포넌트를 stateless component라고 불렀다). 반면 클래스 컴포넌트는 인스턴스가 유지되어 `render()` 외의 메서드와 state가 보존된다.

Hook은 React가 컴포넌트별로 값을 따로 저장해 두고, 리렌더링 때 다시 꺼내 주는 방식으로 함수 컴포넌트가 값을 "기억"하게 한다. React 팀이 Hook을 만든 이유는 다음과 같다.

1. 컴포넌트 사이에서 **상태 로직을 재사용**하기 어려웠다(render props, HOC 같은 패턴은 컴포넌트 트리를 불필요하게 중첩시킨다).
2. 복잡한 클래스 컴포넌트는 관련 없는 로직이 여러 생명주기 메서드에 흩어져 이해하기 어려웠다.
3. 클래스 문법(`this`, 바인딩)이 사람과 도구 모두에게 어렵다.

## Hook의 규칙

1. **최상위에서만 호출한다.** 반복문, 조건문, 중첩 함수 안에서 호출하지 않는다.
2. **React 함수(컴포넌트, 커스텀 훅) 안에서만 호출한다.** 일반 JavaScript 함수에서는 안 된다.
3. 커스텀 훅 이름은 **`use`로 시작**한다. 그래야 규칙이 적용되는 함수인지 한눈에 알 수 있고 린터가 검사할 수 있다.

`eslint-plugin-react-hooks`가 이 규칙을 강제해 준다(CRA·Vite 템플릿에 포함).

### 왜 순서가 중요한가

React는 Hook을 **호출 순서**로 구분한다. 렌더링마다 같은 순서로 호출되어야 각 Hook에 맞는 state를 돌려줄 수 있다.

```jsx
function Form() {
  const [name, setName] = useState('Mary')            // 1번
  useEffect(() => { localStorage.setItem('formData', name) }) // 2번
  const [surname, setSurname] = useState('Poppins')   // 3번
  useEffect(() => { document.title = `${name} ${surname}` })   // 4번
}
```

조건문 안에서 2번 Hook을 건너뛰면, 그 다음 렌더링에서 3번 자리의 `useState`가 2번 effect의 데이터를 받아 버리는 식으로 모든 것이 한 칸씩 밀린다. 조건이 필요하면 Hook **안에서** 조건을 건다.

## 주요 Hooks

| Hook | 용도 |
| --- | --- |
| `useState` | 값이 바뀌면 리렌더링되는 상태 ([State](/knowledge/dictionary/frontend/react/state)) |
| `useEffect` | 렌더링 후 실행할 부수 효과(데이터 요청, 구독, 타이머, DOM 조작) |
| `useContext` | Context 값 읽기 ([Context](/knowledge/dictionary/frontend/react/context)) |
| `useReducer` | 복잡한 state 업데이트 로직을 reducer로 분리 |
| `useCallback` | 함수를 메모이제이션해 재사용 |
| `useMemo` | 계산 결과를 메모이제이션해 재사용 |
| `useRef` | DOM 요소 참조, 또는 리렌더링을 일으키지 않는 값 보관 |
| `useLayoutEffect` | DOM 변경 후 화면에 그리기 **전** 동기 실행(레이아웃 측정) |
| `useImperativeHandle`, `useDebugValue` | ref로 노출할 값 지정, DevTools 라벨 |

## useEffect

state가 바뀔 때마다 컴포넌트의 **모든 코드가 다시 실행**된다. API 호출처럼 "처음 한 번만" 또는 "특정 값이 바뀔 때만" 실행해야 하는 코드를 그대로 두면 렌더링마다 반복된다. `useEffect`는 코드의 **실행 시점을 통제**하는 도구다.

```jsx
useEffect(effect, deps)
```

| deps | 실행 시점 |
| --- | --- |
| 생략 | 매 렌더링 후 |
| `[]` | 첫 렌더링(마운트) 후 한 번만 — 지켜볼 값이 없으니 다시 실행할 이유가 없다 |
| `[keyword]` | 마운트 후 + `keyword`가 바뀔 때마다 |
| `[keyword, counter]` | 둘 중 하나라도 바뀔 때마다 |

```jsx
function Search() {
  const [counter, setCounter] = useState(0)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    console.log('CALL THE API') // 한 번만
  }, [])

  useEffect(() => {
    if (keyword !== '' && keyword.length > 5) {
      console.log('SEARCH FOR', keyword) // 글자를 칠 때만, 버튼 클릭에는 반응하지 않음
    }
  }, [keyword])

  // ...
}
```

### cleanup 함수

effect에서 **함수를 반환**하면 React가 정리 시점에 그 함수를 호출한다.

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000)
  return () => clearInterval(id) // 정리
}, [])
```

정리 함수가 호출되는 시점은 두 가지다.

- 컴포넌트가 **언마운트**될 때
- deps가 바뀌어 effect가 **다시 실행되기 직전**(이전 effect를 먼저 정리)

즉 흐름은 **리렌더링 → 이전 effect의 cleanup → 새 effect 실행**이다. deps가 `[]`이면 다시 실행될 일이 없으므로 cleanup은 언마운트 때만 실행된다.

## 메모이제이션: React.memo, useCallback, useMemo

### React.memo

부모가 리렌더링되면 자식도 **전부** 리렌더링된다. props가 바뀌지 않은 자식까지 다시 그리는 낭비를 막으려면 컴포넌트를 `React.memo`로 감싼다. props가 이전과 같으면(얕은 비교) 리렌더링을 건너뛴다.

```jsx
function Btn({ buttonName, changeName }) {
  console.log(buttonName, 'rendered')
  return <button onClick={changeName}>{buttonName}</button>
}
const MemorizedBtn = React.memo(Btn)

function App() {
  const [name, setName] = useState('Save Changes')
  const changeName = () => setName('Revert Changes')
  return (
    <div>
      <MemorizedBtn buttonName={name} changeName={changeName} />
      <MemorizedBtn buttonName="Confirm" /> {/* name이 바뀌어도 다시 그려지지 않음 */}
    </div>
  )
}
```

### useCallback

컴포넌트 안에서 선언한 함수는 렌더링마다 **새로 만들어진다.** 그래서 `React.memo`로 감싼 자식에 함수를 넘기면, 내용이 같아도 참조가 달라 자식이 매번 리렌더링된다. `useCallback`은 deps가 바뀌지 않는 한 같은 함수를 재사용한다.

```jsx
const memoizedCallback = useCallback(fn, deps)
```

```jsx
const onSave = useCallback(() => {
  console.log(name)
}, [name]) // name이 바뀔 때만 함수를 새로 만든다
```

**deps를 빠뜨리면 오래된 값에 갇힌다.** 위에서 deps를 `[]`로 두면 함수가 처음 만들어질 때의 `name`(빈 문자열)을 계속 기억해서, 몇 번을 호출해도 빈 문자열만 출력된다. 함수 안에서 참조하는 state·props는 모두 deps에 넣는다.

### useMemo

비용이 큰 **계산 결과**를 deps가 바뀔 때만 다시 계산한다.

```jsx
const sorted = useMemo(() => heavySort(items), [items])
```

| | 재사용하는 것 |
| --- | --- |
| `useMemo` | 값(계산 결과) |
| `useCallback` | 함수 자체 (`useCallback(fn, deps)` = `useMemo(() => fn, deps)`) |
| `React.memo` | 컴포넌트의 렌더링 결과 |

### 최적화를 언제 하나

Hook 자체는 가볍지만, 메모이제이션은 비교와 저장에 비용이 드므로 **무조건 남발하면 오히려 손해**다. 다음을 먼저 따져 본다.

1. 꼭 필요한 리렌더링만 일어나고 있는가?
2. 렌더링될 때 꼭 필요한 값·함수만 새로 만들어지는가?
3. 1·2를 지키지 않아도 될 만큼 렌더링이 드문가?

React DevTools의 Profiler로 실제로 느린 컴포넌트를 찾은 뒤 적용하는 것이 좋다(예: 채팅 목록의 각 `Chat` 항목에 `memo` 적용). 참고로 React 19와 함께 나온 React Compiler는 이런 메모이제이션을 자동으로 해 준다.

`React.memo`를 씌웠는데도 렌더링이 줄지 않는다면 렌더링을 일으키는 원인이 다른 곳에 있다는 뜻이다. 원인을 추적하는 과정은 [리렌더링 원인 추적하기](/knowledge/dictionary/frontend/react/re-rendering)에 정리했다.

## 커스텀 훅

여러 컴포넌트에서 반복되는 **상태 로직**을 `use`로 시작하는 함수로 뽑아낸 것이다. 훅 안에서 다른 훅을 호출할 수 있는 유일한 장소이며, HOC나 render props 없이 로직을 재사용할 수 있다.

### 예: useInput

폼마다 반복되는 "state + onChange 핸들러" 쌍을 하나로 묶는다.

```typescript
import { Dispatch, SetStateAction, useCallback, useState, ChangeEvent } from 'react'

type ReturnTypes<T> = [T, (e: ChangeEvent<HTMLInputElement>) => void, Dispatch<SetStateAction<T>>]

const useInput = <T,>(initialValue: T): ReturnTypes<T> => {
  const [value, setValue] = useState(initialValue)
  const handler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value as unknown as T)
  }, [])
  return [value, handler, setValue]
}

export default useInput
```

```tsx
const [email, onChangeEmail] = useInput('')
const [nickname, onChangeNickname] = useInput('')
// <input value={email} onChange={onChangeEmail} />
```

- **제네릭 `T`**: 초기값의 타입을 정하면 반환되는 값의 타입도 같이 결정된다. `any`를 쓰는 것보다 안전하다.
- `Dispatch<SetStateAction<T>>`는 `useState`가 반환하는 setter의 TypeScript 타입이다. setter도 함께 반환하면 값을 직접 초기화할 때 쓸 수 있다.
- TypeScript는 매개변수 타입을 잘 추론하지 못하므로(인라인 콜백 제외) 이벤트 매개변수에는 타입을 명시한다.
- 반환하는 함수에는 `useCallback`, 계산된 값에는 `useMemo`를 적용해 두면 사용하는 쪽에서 불필요한 리렌더링이 줄어든다.
- 중복이 두세 번 보인다고 성급히 추상화하지는 않는다. 정말 같은 로직인지 확인하고 뽑는다.

## 핵심 정리

- Hook은 최상위에서, React 함수 안에서만, 항상 같은 순서로 호출한다.
- `useEffect(fn, deps)`: deps가 없으면 매번, `[]`면 한 번, `[x]`면 x가 바뀔 때. 반환한 함수는 cleanup.
- `React.memo`(컴포넌트), `useCallback`(함수), `useMemo`(값)로 불필요한 재생성을 막되, 측정 후 필요한 곳에만.
- 반복되는 상태 로직은 커스텀 훅(`useXxx`)으로 뽑는다.
