---
title: "Context와 전역 상태"
concept: "Context"
summary: "props를 일일이 내려주지 않고 컴포넌트 트리 전체에 값을 공유하는 Context API와, Context로 부족할 때 고르는 전역 상태 라이브러리(Redux Toolkit, Zustand, Jotai)."
tags: ["react", "state", "hooks", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://react.dev/reference/react/useContext", "https://github.com/facebookexperimental/Recoil", "https://pinia.vuejs.org/"]
---

**Context**는 props를 거치지 않고 컴포넌트 트리 깊숙한 곳까지 값을 전달하는 방법이다. 로그인 사용자, 테마, 언어 설정처럼 여러 컴포넌트가 함께 쓰는 값을 한곳에서 관리할 때 쓴다. 중간 컴포넌트들이 쓰지도 않는 props를 계속 넘기는 props drilling을 피할 수 있다.

## 무조건 Context를 쓸 필요는 없다

컴포넌트가 Context에 의존하면 그 Context가 없는 곳에서는 재사용하기 어려워진다. 단계가 몇 개 안 되면 그냥 props로 넘기고, 깊다면 먼저 [합성](/knowledge/dictionary/frontend/react/composition)으로 엘리먼트 자체를 내려 주는 방법을 검토한다. 그래도 여러 곳에서 같은 값이 필요할 때 Context를 쓴다.

## Context API

### 1. 생성

```jsx
import { createContext } from 'react'

const ThemeContext = createContext('light') // 기본값: Provider가 없을 때 쓰인다
```

### 2. 제공: Provider

```jsx
function App() {
  const [theme, setTheme] = useState('dark')
  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar />
    </ThemeContext.Provider>
  )
}
```

- React 19부터는 `.Provider` 없이 Context 자체를 Provider로 렌더링할 수 있다: `<ThemeContext value={theme}>...</ThemeContext>`. 공식 문서는 `<ThemeContext.Provider>`를 React 19 이전의 레거시 방식으로 소개한다(기존 코드에서는 계속 동작).
- Provider로 감싼 하위 트리 전체에서 `value`를 읽을 수 있다.
- `value`가 바뀌면 그 Context를 구독하는 **모든 컴포넌트가 리렌더링**된다. 변경 여부는 `Object.is`로 비교한다.
- 그래서 `value={{ theme, setTheme }}`처럼 렌더링마다 **새 객체**를 만들어 넘기면, 실제 값이 같아도 매번 모든 구독자가 리렌더링된다. 객체는 state로 두거나 `useMemo`로 감싼다.

### 3. 구독(사용)

| 방법 | 대상 | 비고 |
| --- | --- | --- |
| `useContext(ThemeContext)` | 함수 컴포넌트 | **권장** |
| `use(ThemeContext)` | 함수 컴포넌트 | React 19. 조건문·조기 return 뒤에서도 부를 수 있다 |
| `<ThemeContext.Consumer>{(value) => ...}</ThemeContext.Consumer>` | 함수·클래스 | render props 형태, 거의 쓰지 않음 |
| `static contextType = ThemeContext` | 클래스 컴포넌트 | 하나의 Context만 가능 |

```jsx
import { useContext } from 'react'

function ThemedButton() {
  const theme = useContext(ThemeContext) // Context 객체 자체를 넘긴다(Provider·Consumer가 아님)
  return <button className={`btn-${theme}`}>버튼</button>
}
```

## 전역 상태 관리와 Flux 패턴

Context는 값을 **전달**하는 도구이지 상태 관리 도구가 아니다. 값이 자주 바뀌고 구독자가 많으면 바뀔 때마다 모든 구독자가 다시 그려진다. 이럴 때는 필요한 조각만 구독하게 해 주는 전역 상태 라이브러리를 쓴다.

| 도구 | 성격 |
| --- | --- |
| Redux Toolkit | Flux 패턴(Action → Store → View의 단방향 흐름)의 표준 구현. 큰 팀·복잡한 상태 ([[redux\|Redux와 react-redux]]) |
| Zustand | 훅 하나로 쓰는 가벼운 스토어. selector로 필요한 값만 구독 |
| Jotai | atom 단위로 상태를 쪼개 조합 |
| `useReducer` + Context | 라이브러리 없이 만드는 작은 Flux |

과거에 쓰이던 Recoil은 2025년 1월 저장소가 보관(archived)되어 더 이상 관리되지 않는다. Vue에서는 Vuex 대신 Pinia가 공식 상태 관리 도구다. 서버에서 받아 온 데이터는 전역 state에 넣지 않고 [TanStack Query](/knowledge/dictionary/frontend/react/tanstack-query)·[SWR](/knowledge/dictionary/frontend/react/swr) 같은 서버 상태 라이브러리의 캐시에 맡긴다.

## 핵심 정리

- Context = `createContext` → `Provider value`(React 19+는 `<Ctx value>`) → `useContext`.
- Context 값 변경은 리렌더링의 주요 원인 중 하나다. 추적 방법은 [[re-rendering|리렌더링 원인 추적하기]] 참고.
- 값이 바뀌면 모든 구독자가 리렌더링된다. Provider value에 매번 새 객체를 넘기지 않는다.
- 얕은 전달은 props, 깊은 전달은 합성 먼저, 여러 곳이 공유하는 값은 Context.
- 자주 바뀌는 전역 상태는 Zustand·Redux Toolkit 같은 라이브러리로, 서버 데이터는 서버 상태 라이브러리로 나눈다.
