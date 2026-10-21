---
title: "재사용 컴포넌트를 위한 리액트 패턴 5가지"
concept: "Advanced React Patterns"
summary: "Compound Components, Control Props, Custom Hook, Props Getters, State Reducer를 제어 역전(IoC) 정도와 구현 복잡도로 비교한다. 제어권을 많이 넘길수록 유연해지지만 쓰기 어려워지므로, 필요한 만큼만 고르는 것이 핵심이다."
tags: ["react", "frontend", "design-pattern", "component", "hooks"]
source: other
date: "2026-10-15"
sources: ["https://velog.io/@dnr6054/%EC%9C%A0%EC%9A%A9%ED%95%9C-%EB%A6%AC%EC%95%A1%ED%8A%B8-%ED%8C%A8%ED%84%B4-5%EA%B0%80%EC%A7%80"]
---

> Bard의 「[유용한 리액트 패턴 5가지](https://velog.io/@dnr6054/%EC%9C%A0%EC%9A%A9%ED%95%9C-%EB%A6%AC%EC%95%A1%ED%8A%B8-%ED%8C%A8%ED%84%B4-5%EA%B0%80%EC%A7%80)」(2021.05)를 바탕으로 재구성한 노트다. 원 자료는 Alexis Regnaud의 「5 Advanced React Patterns」다.

## 왜 패턴이 필요한가

재사용 컴포넌트는 요구가 늘수록 props가 불어난다. "이 경우엔 아이콘 위치를 바꿔 달라", "감소 단위를 2로 해 달라" 같은 요청을 props 하나씩으로 받으면 API가 무너진다. 아래 패턴들은 **제어 역전(Inversion of Control)**, 곧 동작·모양의 결정권을 컴포넌트를 쓰는 쪽에 넘겨서 props 폭증을 막는다.

**제어권을 많이 넘길수록 유연하지만, 쓰는 쪽이 내부를 더 많이 알아야 한다.** 그래서 "가장 강력한 패턴"이 아니라 "필요한 만큼의 패턴"을 고른다.

## 한눈에 비교

| 패턴 | 핵심 아이디어 | 제어 역전 | 구현·사용 복잡도 | 쓰는 라이브러리 |
| --- | --- | --- | --- | --- |
| Compound Components | 하위 컴포넌트가 Context로 상태 공유 | ★☆☆☆ | ★☆☆☆ | Radix UI, React Bootstrap |
| Control Props | 상태를 부모가 소유 (`value` + `onChange`) | ★★☆☆ | ★☆☆☆ | MUI, 대부분의 입력 컴포넌트 |
| Custom Hook | 로직을 훅으로 노출, 렌더링은 사용자 몫 | ★★☆☆ | ★★☆☆ | TanStack Table, React Hook Form |
| Props Getters | 훅이 요소에 펼칠 props 묶음을 함수로 반환 | ★★★☆ | ★★★☆ | Downshift, React Hook Form(`register`) |
| State Reducer | 사용자가 reducer로 내부 상태 전이를 가로챔 | ★★★★ | ★★★★ | Downshift |

아래 예시는 모두 `+`/`-` 버튼과 숫자가 있는 `Counter` 하나를 다섯 방식으로 만든다.

### 1. Compound Components

부모가 상태를 Context로 내려 주고, `Counter.Label`·`Counter.Increment` 같은 하위 컴포넌트가 그것을 읽는다. `<select>`와 `<option>`의 관계와 같다.

```jsx
const CounterContext = createContext(null)

function Counter({ children }) {
  const [count, setCount] = useState(0)
  return <CounterContext value={{ count, setCount }}>{children}</CounterContext>
}
Counter.Count = () => <span>{use(CounterContext).count}</span>
Counter.Increment = () => {
  const { setCount } = use(CounterContext)
  return <button onClick={() => setCount((c) => c + 1)}>+</button>
}

<Counter>
  <Counter.Increment />
  <Counter.Count />
</Counter>
```

- **장점**: props 대신 JSX 배치로 모양을 정해 API가 단순하다. 로직은 부모 안에 남는다.
- **단점**: 배치 자유도가 커서 잘못 조합하면 동작이 깨진다. JSX가 길어진다.
- React 19부터 `<Context.Provider>` 대신 `<Context value>`로 쓰고, 값은 `useContext` 대신 `use`로도 읽는다. 과거에는 `React.Children.map`과 `cloneElement`로 자식에 props를 주입했지만, 중간에 `div` 하나만 끼어도 깨져서 Context 방식으로 넘어갔다.

### 2. Control Props

컴포넌트를 [[forms|제어 컴포넌트]]로 만든다. `value`가 들어오면 그것을 진실의 원천으로 쓰고, 없으면 내부 상태를 쓴다.

```jsx
function Counter({ value, onChange, defaultValue = 0 }) {
  const [inner, setInner] = useState(defaultValue)
  const isControlled = value !== undefined
  const count = isControlled ? value : inner
  const set = (next) => { if (!isControlled) setInner(next); onChange?.(next) }
  return <button onClick={() => set(count + 1)}>{count}</button>
}

<Counter value={count} onChange={(n) => setCount(n <= 10 ? n : 10)} />
```

- **장점**: 상태가 바깥에 보여서 다른 UI와 동기화하거나 값을 제한하기 쉽다.
- **단점**: 쓰는 쪽이 `useState`와 핸들러를 직접 연결해야 한다.
- 렌더 도중 제어↔비제어가 바뀌면 React가 경고하므로 `value`를 `undefined`로 바꾸지 않는다.

### 3. Custom Hook

상태와 핸들러를 [[hooks|커스텀 훅]]으로 꺼내고, 마크업은 쓰는 쪽이 짠다. 훅과 JSX 사이에 사용자 로직을 끼워 넣을 수 있다.

```jsx
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial)
  return { count, increment: () => setCount((c) => c + 1), decrement: () => setCount((c) => c - 1) }
}

function MyCounter() {
  const { count, increment } = useCounter()
  const handleIncrement = () => { if (count < 10) increment() }  // 사용자 로직
  return <button onClick={handleIncrement}>{count}</button>
}
```

- **장점**: 로직과 표현이 분리되어 마크업을 마음대로 바꾼다. "헤드리스(headless) UI" 라이브러리의 기본 형태다.
- **단점**: 로직과 렌더링을 잇는 일이 사용자에게 넘어가므로, 접근성 속성 같은 세부를 빠뜨리기 쉽다.

### 4. Props Getters

Custom Hook이 노출하는 것이 너무 많을 때, 요소에 그대로 펼칠 props 묶음을 **함수**로 돌려준다. 함수인 이유는 사용자 props를 받아 내부 props와 **합칠** 수 있어서다.

```jsx
function useCounter() {
  const [count, setCount] = useState(0)
  const getIncrementProps = ({ onClick, ...rest } = {}) => ({
    'aria-label': 'increment',
    onClick: (e) => { onClick?.(e); setCount((c) => c + 1) },  // 사용자 핸들러와 합성
    ...rest,
  })
  return { count, getIncrementProps }
}

<button {...getIncrementProps({ onClick: logClick })}>+</button>
```

- **장점**: 접근성·이벤트 연결 같은 세부를 숨겨 쓰기 쉽고, 필요한 것만 덮어쓸 수 있다.
- **단점**: 무엇이 펼쳐지는지 안 보여서 "마법"처럼 느껴진다. 제대로 덮어쓰려면 반환되는 props 목록을 알아야 한다.
- React Hook Form의 `{...register('email')}`, Downshift의 `getInputProps()`가 이 형태다.

### 5. State Reducer

컴포넌트 내부는 `useReducer`로 상태를 바꾸고, 사용자가 넘긴 reducer가 **다음 상태를 최종 결정**하게 한다. 모든 내부 액션을 바깥에서 가로챌 수 있다.

```jsx
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 }
    case 'decrement': return { count: state.count - 1 }
  }
}

function useCounter({ reducer = (state, action) => counterReducer(state, action) } = {}) {
  const [{ count }, dispatch] = useReducer(reducer, { count: 0 })
  return { count, increment: () => dispatch({ type: 'increment' }), decrement: () => dispatch({ type: 'decrement' }) }
}

// 사용: 감소는 2씩, 나머지는 기본 동작
useCounter({
  reducer: (state, action) =>
    action.type === 'decrement' ? { count: state.count - 2 } : counterReducer(state, action),
})
```

- **장점**: 다섯 패턴 중 제어권이 가장 크다. 새 props 없이 어떤 동작이든 바꿀 수 있다.
- **단점**: 쓰는 쪽이 내부 액션 종류와 상태 모양을 알아야 하고, 라이브러리가 액션 이름을 바꾸면 깨진다. 그래서 액션 타입을 상수로 export해 공개 API로 관리한다.

## 고르는 기준

```text
모양만 자유롭게 바꾸고 싶다          → Compound Components
값을 바깥과 동기화·제한해야 한다      → Control Props
마크업을 통째로 직접 짜고 싶다        → Custom Hook
마크업은 직접, 세부 연결은 맡기고 싶다 → Props Getters
특정 상태 전이 규칙을 바꿔야 한다      → State Reducer
```

패턴은 섞어 쓴다. Radix UI는 Compound Components에 Control Props(`open`/`onOpenChange`)를 더하고, Downshift는 Props Getters와 State Reducer를 함께 제공한다.

## 역사

Hooks 이전에는 같은 목적을 HOC(고차 컴포넌트)와 render props로 풀었다. 둘 다 컴포넌트 트리를 깊게 감싸는 "wrapper hell"을 만들어, 지금은 대부분 Custom Hook 계열로 바뀌었다. Compound Components의 대표 예였던 Reach UI는 더 이상 관리되지 않고, Radix UI·React Aria가 그 자리를 이었다.

## 정리

- 다섯 패턴은 모두 **제어 역전**의 정도 차이다. 제어를 넘길수록 유연해지고, 쓰는 쪽 부담은 커진다.
- 상태 공유는 Context(Compound), 상태 소유권은 `value`/`onChange`(Control Props), 로직 재사용은 훅으로 한다.
- Props Getters는 사용자 핸들러를 덮어쓰지 말고 **합성**해야 한다.
- State Reducer의 액션 타입은 공개 API이므로 안정적으로 유지한다.
- 플러그 앤 플레이로 충분하면 패턴을 쓰지 않는 것이 가장 좋은 선택이다.

관련 노트: [[composition|합성: 상속 대신 Composition]], [[logic-reuse-patterns|로직 재사용 패턴: HOC, Render Props, 커스텀 훅]], [[hooks|Hooks]], [[context|Context]], [[component-splitting|컴포넌트를 분리하는 기준과 방법]]
