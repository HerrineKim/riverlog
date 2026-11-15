---
title: "컴포넌트 생명주기"
concept: "Lifecycle"
summary: "컴포넌트가 화면에 나타나고(마운트) 바뀌고(업데이트) 사라지는(언마운트) 흐름. 함수 컴포넌트에서는 useEffect의 의존성 배열과 cleanup으로 다루고, 클래스 생명주기 메서드는 기존 코드를 읽기 위한 대응표로 정리한다."
tags: ["react", "lifecycle", "hooks", "frontend"]
source: til
date: "2026-10-21"
sources: ["https://react.dev/learn/lifecycle-of-reactive-effects", "https://react.dev/reference/react/Component", "https://react.vlpt.us/basic/16-useEffect.html", "https://react.vlpt.us/basic/24-class-component.html", "https://react.vlpt.us/basic/25-lifecycle.html"]
---

> 개인 TIL과 React 공식 문서를 바탕으로, 클래스 컴포넌트 기본형은 벨로퍼트의 「[벨로퍼트와 함께하는 모던 리액트](https://react.vlpt.us/)」 중 「[클래스형 컴포넌트](https://react.vlpt.us/basic/24-class-component.html)」·「[LifeCycle Method](https://react.vlpt.us/basic/25-lifecycle.html)」를 바탕으로 보강했다.

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

## 클래스 컴포넌트 읽기

생명주기 메서드를 읽으려면 클래스 컴포넌트의 기본 모양부터 알아야 한다.

```jsx
class Counter extends Component {
  state = { counter: 0, fixed: 1 }           // 클래스 필드. 생성자 안의 this.state = {...}와 같다
  static defaultProps = { step: 1 }           // 클래스에는 아직 defaultProps가 남아 있다

  handleIncrease = () => {                     // 화살표 함수 필드라 this가 인스턴스에 묶인다
    this.setState((state) => ({ counter: state.counter + this.props.step }))
  }

  render() {
    return <button onClick={this.handleIncrease}>{this.state.counter}</button>
  }
}
```

| 함수 컴포넌트 | 클래스 컴포넌트 |
| --- | --- |
| 함수 본문이 곧 렌더링 | `render()` 메서드가 JSX를 반환한다 (필수) |
| 매개변수 `props` | `this.props` |
| `useState`를 값마다 | `this.state` **객체 하나** |
| setter는 값을 통째로 바꾼다 | `this.setState({ counter })`는 넘긴 필드만 **얕게 병합**한다(`fixed`는 유지). 중첩 객체는 직접 불변으로 복사한다 |
| 핸들러는 그냥 함수 | 메서드를 이벤트에 넘기면 `this`가 끊긴다 → 생성자에서 `bind`, 화살표 함수 필드, 또는 JSX 안 화살표 함수(렌더링마다 새 함수) |

- `setState`는 즉시 바꾸는 함수가 아니라 **바꿔 달라는 요청**이다. 한 핸들러에서 `this.setState({ counter: this.state.counter + 1 })`을 두 번 불러도 1만 오른다. 이전 값 기반이면 `this.setState((state) => ...)` 함수형으로 쓴다. `useState`의 함수형 업데이트와 같은 이유다.
- 업데이트가 반영된 뒤 할 일은 `this.setState(next, callback)`의 두 번째 인자나 `componentDidUpdate`에 둔다.
- 생성자를 직접 쓰면 `super(props)`를 먼저 불러야 `this.props`가 잡힌다.

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
