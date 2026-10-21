---
title: "React Hooks"
concept: "Hooks"
summary: "함수 컴포넌트에서 state·생명주기·메모이제이션을 쓰게 해 주는 API와 그 규칙, 커스텀 훅. useEffect를 생명주기가 아니라 동기화로 보는 관점, deps를 줄이는 법, 요청 경쟁 상태 처리까지."
tags: ["react", "hooks", "state", "lifecycle", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://react.dev/reference/react/hooks", "https://react.dev/blog/2025/10/01/react-19-2", "https://react.dev/blog/2025/10/07/react-compiler-1", "https://rinae.dev/posts/a-complete-guide-to-useeffect-ko"]
---

> React 공식 문서를 바탕으로, effect를 동기화로 보는 관점과 deps를 줄이는 법은 Dan Abramov의 「A Complete Guide to useEffect」 번역 「[useEffect 완벽 가이드](https://rinae.dev/posts/a-complete-guide-to-useeffect-ko)」를 바탕으로 더한 노트다.

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

state가 바뀔 때마다 컴포넌트의 **모든 코드가 다시 실행**된다. API 호출처럼 "처음 한 번만" 또는 "특정 값이 바뀔 때만" 실행할 코드를 그대로 두면 렌더링마다 반복된다. `useEffect(effect, deps)`는 코드의 **실행 시점을 통제**하는 도구다.

| deps | 실행 시점 | cleanup 시점 |
| --- | --- | --- |
| 생략 | 매 렌더링 후 | 다음 effect 직전, 언마운트 |
| `[]` | 마운트 후 한 번 | 언마운트 때만 |
| `[a, b]` | 마운트 후 + `a`나 `b`가 바뀔 때마다 | 다시 실행되기 직전, 언마운트 |

effect에서 **함수를 반환**하면 그것이 cleanup이다. 흐름은 **리렌더링 → 이전 effect의 cleanup → 새 effect 실행**이다.

```jsx
useEffect(() => {
  const conn = createConnection(roomId)
  conn.connect()
  return () => conn.disconnect() // roomId가 바뀌면 이전 연결을 끊고 새로 연결한다
}, [roomId])
```

- effect 안에서 읽는 state·props는 모두 deps에 넣는다. 빠뜨리면 오래된 값에 갇힌다.
- 개발 모드의 StrictMode는 cleanup 누락을 찾으려고 마운트 직후 한 번 더 정리·실행해 본다. 자세한 내용은 [[lifecycle#StrictMode의 이중 실행|생명주기]]에 있다.

### 렌더마다 자기 값을 가진다

컴포넌트 함수는 렌더마다 다시 호출된다. 그 렌더의 props·state는 **그 렌더 안에서 바뀌지 않는 상수**이고, 그 안에서 만든 이벤트 핸들러·타이머 콜백·effect는 모두 그 상수를 클로저로 붙잡는다. 클릭하고 3초 뒤 `alert(count)`를 띄우면, 그사이 count가 올라도 클릭한 렌더의 값이 나온다. 버그가 아니라 정확한 동작이다.

그래서 effect는 「마운트 때 한 번」, 「업데이트 때」 같은 **생명주기 사건이 아니라 동기화**로 생각한다. 「지금 props·state에 맞춰 React 바깥(문서 제목, 구독, 타이머, 외부 위젯)을 맞춘다」는 선언이다. 몇 번째 렌더이든 같은 props면 같은 결과가 되어야 하고, 첫 렌더만 특별 취급하는 effect는 대개 설계가 어긋났다는 신호다. cleanup도 **자신이 만들어진 렌더의 값**으로 실행된다. `roomId`가 1에서 2로 바뀌면 cleanup은 1번 방 연결을 끊는다.

### deps에 거짓말하지 않는다

deps는 「effect가 쓰는 반응형 값의 목록」이다. 다시 돌기 싫어서 값을 빼면 effect가 첫 렌더의 값에 갇힌다. **deps를 줄이고 싶으면 목록이 아니라 코드를 바꿔 effect가 그 값을 쓰지 않게 만든다.** 누락은 `eslint-plugin-react-hooks`의 `exhaustive-deps` 규칙이 잡는다.

| 상황 | 바꾸는 법 |
| --- | --- |
| 이전 state로 다음 state를 계산한다 (`setCount(count + 1)`) | 함수형 업데이트 `setCount(c => c + 1)`. effect가 `count`를 읽지 않게 된다 |
| 여러 state가 얽혀 갱신된다 | `useReducer`로 바꾸고 effect는 `dispatch({ type: 'tick' })`만 한다. `dispatch`는 렌더마다 같아 deps에 넣어도 다시 돌지 않는다 |
| effect 안에서만 쓰는 함수 | 함수를 effect **안으로** 옮긴다 |
| 컴포넌트 값과 무관한 함수 | 컴포넌트 **밖으로** 뺀다 |
| 여러 곳에서 쓰는 함수·객체 | `useCallback`·`useMemo`로 필요한 값이 바뀔 때만 새로 만든다 |
| 읽기만 하고 반응하지 않을 값 | 아래 `useEffectEvent` |

### 늦게 온 응답이 최신 값을 덮는다

`id`가 1 → 2로 빠르게 바뀌면 두 요청이 겹치고, 1번 응답이 늦게 오면 화면이 1번 데이터로 덮인다(경쟁 상태). cleanup에서 이전 요청을 무효로 만든다.

```jsx
useEffect(() => {
  const controller = new AbortController()
  fetch(`/api/items/${id}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setItem)
    .catch((e) => { if (e.name !== 'AbortError') setError(e) })
  return () => controller.abort()   // id가 바뀌면 이전 요청 취소
}, [id])
```

취소할 수 없는 비동기 작업이면 `let ignore = false`를 두고 cleanup에서 `ignore = true`로 바꿔 늦은 결과를 버린다. effect 함수 자체를 `async`로 만들지 않는다. cleanup 대신 Promise를 돌려주게 되기 때문이다. 데이터 가져오기를 effect로 직접 짜면 캐시·재시도·중복 제거까지 손으로 해야 하므로 실무에서는 [[tanstack-query|TanStack Query]] 같은 라이브러리나 프레임워크의 데이터 로딩을 쓴다.

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

## 메모이제이션: useMemo, useCallback, memo

부모가 리렌더링되면 자식도 전부 리렌더링되고, 컴포넌트 안에서 만든 함수·객체는 렌더링마다 **새 참조**가 된다. 메모이제이션은 이 재계산·재생성을 건너뛰게 한다.

| 도구 | 재사용하는 것 | 쓸 때 | 예 |
| --- | --- | --- | --- |
| `useMemo(fn, deps)` | 계산 결과(값) | 비싼 계산, 자식·effect deps로 넘길 객체 | `useMemo(() => heavySort(items), [items])` |
| `useCallback(fn, deps)` | 함수 자체. `useMemo(() => fn, deps)`와 같다 | `memo`로 감싼 자식이나 effect deps에 함수를 넘길 때 | `useCallback(() => save(name), [name])` |
| `memo(Component)` | 컴포넌트의 렌더링 결과 | props가 같으면(얕은 비교) 리렌더링을 건너뛰고 싶을 때 | `const Row = memo(function Row(props) { ... })` |

- `memo`로 감싼 자식에 매번 새로 만든 함수·객체를 넘기면 얕은 비교가 실패해 효과가 없다. 그래서 `useCallback`·`useMemo`와 함께 쓴다.
- deps를 빠뜨리면 처음 만들어질 때의 값을 계속 기억한다(stale closure). 참조하는 값은 모두 deps에 넣는다.
- 메모이제이션도 비교와 저장에 비용이 든다. **Profiler로 실제로 느린 곳을 찾은 뒤** 적용한다. 원인 추적 순서는 [[re-rendering|리렌더링 원인 추적하기]]에 있다.

**React Compiler**는 빌드 단계에서 이런 메모이제이션을 자동으로 넣는다. 2025년 10월 1.0이 나왔고 React 17·18·19 코드베이스에서 쓸 수 있으며, Expo·Vite·Next.js 새 프로젝트에서 바로 켤 수 있다. 컴파일러를 쓰면 `useMemo`·`useCallback`·`memo`를 손으로 넣을 일이 크게 줄고, 남는 것은 effect deps로 값의 동일성을 정확히 제어해야 하는 경우 정도다.

## 커스텀 훅

여러 컴포넌트에서 반복되는 **상태 로직**을 `use`로 시작하는 함수로 뽑아낸 것이다. 훅 안에서 다른 훅을 부를 수 있고, HOC나 render props 없이 로직을 재사용한다. 예를 들어 폼마다 반복되는 "state + onChange" 쌍을 `useInput`으로 묶는다.

```typescript
function useInput<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue)
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value as T)
  }, [])
  return [value, onChange, setValue] as const
}

const [email, onChangeEmail] = useInput('') // <input value={email} onChange={onChangeEmail} />
```

- 커스텀 훅은 **로직**을 공유하지 state를 공유하지 않는다. 부르는 컴포넌트마다 독립된 state를 갖는다.
- 중복이 두세 번 보인다고 성급히 추상화하지 않는다. 정말 같은 이유로 바뀌는 로직인지 확인하고 뽑는다.

## 정리

- Hook은 최상위에서, React 함수 안에서만, 항상 같은 순서로 호출한다.
- `useEffect(fn, deps)`: deps가 없으면 매번, `[]`면 한 번, `[x]`면 x가 바뀔 때. 반환한 함수는 cleanup.
- `useMemo`(값), `useCallback`(함수), `memo`(컴포넌트)로 재생성을 막되 측정 후 필요한 곳에만. React Compiler가 있으면 대부분 자동이다.
- 반복되는 상태 로직은 커스텀 훅(`useXxx`)으로 뽑는다.

관련 노트: [[lifecycle|생명주기]], [[state|State]], [[re-rendering|리렌더링 원인 추적하기]], [[forms|폼]], [[react-use-hook|use 훅과 리액트 비동기 처리]]
