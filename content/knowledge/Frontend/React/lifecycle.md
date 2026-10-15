---
title: "컴포넌트 생명주기"
concept: "Lifecycle"
summary: "컴포넌트가 화면에 나타나고(마운트) 바뀌고(업데이트) 사라지는(언마운트) 흐름. 함수 컴포넌트에서는 useEffect의 의존성 배열과 cleanup으로 다루고, 클래스 생명주기 메서드는 기존 코드를 읽기 위한 대응표로 정리한다."
tags: ["react", "lifecycle", "hooks", "frontend"]
source: til
date: "2026-10-13"
sources: ["https://react.dev/learn/lifecycle-of-reactive-effects", "https://react.dev/reference/react/Component"]
---

컴포넌트는 **마운트(화면에 나타남) → 업데이트(다시 렌더링) → 언마운트(화면에서 사라짐)** 의 생명주기를 가진다. 함수 컴포넌트가 표준인 지금은 이 흐름을 메서드가 아니라 **effect의 시작과 정리**로 다룬다. 클래스 컴포넌트의 생명주기 메서드는 새로 쓰지 않지만, 기존 코드와 에러 바운더리를 읽을 때 필요하다.

## 함수 컴포넌트의 생명주기: useEffect

```jsx
function Hello() {
  useEffect(() => {
    console.log('created :)')                 // 마운트 후
    return () => console.log('destroyed :(')  // 언마운트 직전 (cleanup)
  }, [])
  return <h1>Hello</h1>
}
```

`Hello`를 show/hide 버튼으로 토글하면, 보일 때마다 'created', 숨길 때마다 'destroyed'가 찍힌다. 화면에서 사라진 컴포넌트는 state까지 버려지고, 다시 보이면 처음부터 새로 만들어진다.

effect는 "마운트 때 할 일"보다 **"외부 시스템과 동기화를 시작하고 멈추는 일"** 로 생각하는 편이 정확하다. 구독·타이머·소켓 연결을 열었으면 cleanup에서 닫는다. 의존성 배열과 cleanup의 세부 규칙은 [[hooks|Hooks]]의 useEffect 절에 있다.

### StrictMode의 이중 실행

개발 모드에서 effect가 두 번 도는 것은 StrictMode 때문이다. `<StrictMode>` 아래에서는 개발 빌드가 컴포넌트를 **마운트 → 언마운트 → 다시 마운트**해 본다. cleanup을 빠뜨린 effect(리스너 중복 등록, 연결을 닫지 않음)를 일부러 드러내기 위해서다. 프로덕션 빌드에서는 한 번만 실행된다. effect가 두 번 돌아 문제가 생긴다면 고칠 곳은 StrictMode가 아니라 cleanup이다.

### 데이터 요청은 effect보다 전용 도구로

effect 안에서 `fetch`하는 방식은 여전히 동작하지만 경쟁 상태, 캐시 부재, 요청 워터폴을 직접 막아야 한다. 지금은 프레임워크의 데이터 로딩(Next.js 서버 컴포넌트, React Router loader), [[tanstack-query|TanStack Query]]·[[swr|SWR]] 같은 서버 상태 라이브러리, 또는 캐시된 Promise를 [[react-use-hook|use]]로 읽는 방식을 먼저 쓴다.

## 클래스 컴포넌트의 생명주기 메서드

전체 흐름 그림은 [React Lifecycle Methods diagram](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)에 있다.

| 단계 | 호출 순서 | 하는 일 |
| --- | --- | --- |
| 마운트 | `constructor` → `getDerivedStateFromProps` → `render` → `componentDidMount` | 생성자에서 state 초기화, DOM에 나타난 뒤 구독·DOM 측정 |
| 업데이트 | `getDerivedStateFromProps` → `shouldComponentUpdate` → `render` → `getSnapshotBeforeUpdate` → `componentDidUpdate` | `false`를 반환해 렌더링 건너뛰기, 반영 직전 DOM 정보 읽기, 반영 뒤 후속 작업 |
| 언마운트 | `componentWillUnmount` | 이벤트 제거, `clearInterval`, 소켓 해제 같은 정리 |
| 에러 | `getDerivedStateFromError`, `componentDidCatch` | 하위 트리의 렌더링 에러를 잡아 대체 UI 표시 |

- `static getDerivedStateFromProps(props, state)`는 props를 state에 동기화할 때 쓴다. 객체를 반환하면 state에 합쳐지고, `null`이면 아무 일도 없다. 대부분은 렌더링 중 계산이나 `key`로 리셋하는 편이 낫다.
- `shouldComponentUpdate(nextProps, nextState)`는 함수 컴포넌트의 `React.memo`, 클래스의 `PureComponent`와 같은 역할이다.
- 에러 바운더리는 **아직 클래스로만 만들 수 있다.** 직접 쓰기보다 `react-error-boundary` 패키지를 많이 쓴다.
- `componentWillMount`·`componentWillReceiveProps`·`componentWillUpdate`는 비동기 렌더링과 맞지 않아 `UNSAFE_` 접두사가 붙은 레거시 API가 됐다.

### getSnapshotBeforeUpdate: 스크롤 위치 유지

채팅·피드처럼 목록 **위쪽**에 새 항목이 붙으면 보던 위치가 아래로 밀린다. 업데이트 직전의 스크롤 높이를 기억했다가, 업데이트 뒤 늘어난 높이만큼 보정한다.

```jsx
getSnapshotBeforeUpdate(prevProps, prevState) {
  if (prevState.array !== this.state.array) {
    const { scrollTop, scrollHeight } = this.list
    return { scrollTop, scrollHeight } // componentDidUpdate의 세 번째 인자로 전달
  }
  return null
}

componentDidUpdate(prevProps, prevState, snapshot) {
  if (!snapshot) return
  if (this.list.scrollTop !== snapshot.scrollTop) return // 브라우저가 이미 보정했다면 건너뜀
  this.list.scrollTop += this.list.scrollHeight - snapshot.scrollHeight
}
```

Hooks에는 이 메서드에 딱 대응하는 API가 없다. 함수 컴포넌트에서는 항목을 추가하기 직전의 높이를 ref에 담아 두고, `useLayoutEffect`에서 늘어난 만큼 보정한다.

## 대응표

| 클래스 | 함수 컴포넌트 |
| --- | --- |
| `componentDidMount` | `useEffect(() => { ... }, [])` |
| `componentDidUpdate` (특정 값 변경 시) | `useEffect(() => { ... }, [value])` |
| `componentWillUnmount` | `useEffect`가 반환한 cleanup |
| `shouldComponentUpdate` | `React.memo` (React Compiler를 쓰면 대부분 자동) |
| 화면에 그리기 전 DOM 측정 | `useLayoutEffect` |
| `getSnapshotBeforeUpdate` | 직접 대응 없음. ref + `useLayoutEffect` |
| `componentDidCatch` | 직접 대응 없음. 클래스 에러 바운더리나 `react-error-boundary` |

## 정리

- 생명주기는 마운트 → 업데이트 → 언마운트다. 함수 컴포넌트에서는 effect의 시작과 cleanup으로 다룬다.
- 열었으면 닫는다. StrictMode의 이중 실행은 cleanup 누락을 찾아 주는 장치다.
- 데이터 요청은 effect보다 프레임워크·서버 상태 라이브러리·`use`로 한다.
- 클래스 메서드는 기존 코드와 에러 바운더리를 읽기 위한 지식이다.

관련 노트: [[hooks|Hooks]], [[state|State와 useState]], [[re-rendering|리렌더링 원인과 추적]]
