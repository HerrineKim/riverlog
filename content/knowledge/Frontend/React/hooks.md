---
title: "React Hooks"
concept: "Hooks"
summary: "함수 컴포넌트에서 state·생명주기·메모이제이션을 쓰게 해 주는 API와 그 규칙, 커스텀 훅."
tags: ["react", "hooks", "state", "lifecycle", "frontend"]
source: til
date: "2026-10-13"
sources: ["https://react.dev/reference/react/hooks", "https://react.dev/blog/2025/10/01/react-19-2", "https://react.dev/blog/2025/10/07/react-compiler-1"]
---

**Hook**은 함수 컴포넌트가 클래스 컴포넌트의 기능(state, 생명주기 등)을 쓸 수 있게 해 주는 함수다. React 16.8(2019)에 추가되었고, 지금은 함수 컴포넌트 + Hooks가 React의 표준 작성 방식이다. 기존 클래스 컴포넌트를 굳이 Hooks로 다시 쓸 필요는 없다.

## 왜 필요한가

함수 컴포넌트는 리렌더링될 때마다 **함수 전체가 다시 실행**된다. 안에서 선언한 변수는 매번 새로 만들어지고 초기화되므로, 그대로는 이전 값을 기억할 수 없다(그래서 예전에는 함수 컴포넌트를 stateless component라고 불렀다). 반면 클래스 컴포넌트는 인스턴스가 유지되어 `render()` 외의 메서드와 state가 보존된다.

Hook은 React가 컴포넌트별로 값을 따로 저장해 두고, 리렌더링 때 다시 꺼내 주는 방식으로 함수 컴포넌트가 값을 "기억"하게 한다. 그 덕에 상태 로직을 HOC·render props 같은 중첩 없이 재사용하고, 여러 생명주기 메서드에 흩어지던 관련 로직을 한곳에 모으고, `this` 바인딩 같은 클래스 문법의 함정을 피할 수 있게 됐다.

## Hook의 규칙

1. **최상위에서만 호출한다.** 반복문, 조건문, 중첩 함수 안에서 호출하지 않는다.
2. **React 함수(컴포넌트, 커스텀 훅) 안에서만 호출한다.** 일반 JavaScript 함수에서는 안 된다.
3. 커스텀 훅 이름은 **`use`로 시작**한다. 그래야 규칙이 적용되는 함수인지 한눈에 알 수 있고 린터가 검사할 수 있다.

`eslint-plugin-react-hooks`가 이 규칙을 강제한다. Vite·Next.js 템플릿에 기본으로 들어 있고, 최신 버전의 `recommended` 프리셋(flat config)에는 React Compiler가 쓰는 규칙 검사도 함께 들어 있다.

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
| `useTransition`, `useDeferredValue` | 급하지 않은 업데이트를 뒤로 미뤄 입력 반응성 유지 |
| `useId` | 서버·클라이언트에서 같은 고유 id 생성(접근성 속성 연결) |
| `useSyncExternalStore` | 외부 스토어 구독 (상태 관리 라이브러리가 내부에서 쓴다) |
| `useImperativeHandle`, `useDebugValue` | ref로 노출할 값 지정, DevTools 라벨 |
| `useActionState`, `useOptimistic`, `useFormStatus` (React 19) | 폼 액션의 결과·대기 상태, 요청 중 낙관적 UI, 부모 폼의 제출 상태 ([폼](/knowledge/dictionary/frontend/react/forms)) |
| `use` (React 19) | Promise·Context 읽기. 조건문 안에서도 호출 가능 ([use](/knowledge/dictionary/frontend/react/react-use-hook)) |
| `useEffectEvent` (React 19.2) | effect 안에서 최신 props·state를 읽되 effect를 다시 실행시키지 않는 함수 |

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

즉 흐름은 **리렌더링 → 이전 effect의 cleanup → 새 effect 실행**이다. deps가 `[]`이면 다시 실행될 일이 없으므로 cleanup은 언마운트 때만 실행된다. 개발 모드의 StrictMode는 cleanup 누락을 찾으려고 마운트 직후 한 번 더 정리·실행해 본다([생명주기](/knowledge/dictionary/frontend/react/lifecycle)).

### useEffectEvent: 반응하지 않을 값 분리

effect 안에서 읽기만 하고 **바뀌어도 effect를 다시 돌리고 싶지 않은 값**(테마, 로그용 값)이 있다. deps에 넣으면 연결이 불필요하게 끊겼다 다시 맺히고, 빼면 린터가 경고한다. React 19.2의 `useEffectEvent`로 그 부분을 떼어 낸다.

```jsx
const onConnected = useEffectEvent(() => {
  showNotification('연결됨', theme) // 항상 최신 theme을 읽는다
})

useEffect(() => {
  const conn = createConnection(roomId)
  conn.on('connected', () => onConnected())
  conn.connect()
  return () => conn.disconnect()
}, [roomId]) // theme이 바뀌어도 다시 연결하지 않는다. onConnected는 deps에 넣지 않는다
```

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

메모이제이션도 비교와 저장에 비용이 든다. **Profiler로 실제로 느린 컴포넌트를 찾은 뒤** 그곳에만 적용한다. 원인을 찾고 줄이는 순서는 [리렌더링 원인 추적하기](/knowledge/dictionary/frontend/react/re-rendering)에 있다.

**React Compiler**는 빌드 단계에서 이런 메모이제이션을 자동으로 넣는다. 2025년 10월 첫 안정 버전(1.0)이 나왔고 React 17·18·19 코드베이스에서 쓸 수 있으며, Expo·Vite·Next.js 새 프로젝트에서 바로 켤 수 있다. 컴파일러를 쓰는 프로젝트에서는 `useMemo`·`useCallback`·`React.memo`를 손으로 넣을 일이 크게 줄고, 남는 것은 effect의 deps로 값의 동일성을 정확히 제어해야 하는 경우 정도다.

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

- **제네릭 `T`**: 초기값의 타입이 반환값의 타입을 정한다. `Dispatch<SetStateAction<T>>`는 `useState` setter의 타입이다.
- 이벤트 매개변수에는 타입을 명시한다(인라인 콜백이 아니면 추론되지 않는다).
- 중복이 두세 번 보인다고 성급히 추상화하지 않는다. 정말 같은 로직인지 확인하고 뽑는다.

## 핵심 정리

- Hook은 최상위에서, React 함수 안에서만, 항상 같은 순서로 호출한다.
- `useEffect(fn, deps)`: deps가 없으면 매번, `[]`면 한 번, `[x]`면 x가 바뀔 때. 반환한 함수는 cleanup.
- `React.memo`(컴포넌트), `useCallback`(함수), `useMemo`(값)로 불필요한 재생성을 막되, 측정 후 필요한 곳에만.
- 반복되는 상태 로직은 커스텀 훅(`useXxx`)으로 뽑는다.
