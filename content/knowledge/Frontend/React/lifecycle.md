---
title: "컴포넌트 생명주기"
concept: "Lifecycle"
summary: "컴포넌트가 화면에 나타나고(마운트) 바뀌고(업데이트) 사라지는(언마운트) 흐름과, 클래스 생명주기 메서드·useEffect의 대응."
tags: ["react", "lifecycle", "hooks", "frontend"]
source: til
---

컴포넌트는 **생성(마운트) → 갱신(업데이트) → 제거(언마운트)** 의 생명주기를 가진다. 클래스 컴포넌트에서는 각 시점에 호출되는 **생명주기 메서드**로 데이터 요청, 구독, 정리 작업을 했다. 함수 컴포넌트에서는 같은 일을 `useEffect`로 한다. 클래스 컴포넌트를 새로 쓸 일은 거의 없지만, 생명주기 개념은 `useEffect`를 이해하는 바탕이 된다.

![생명주기 메서드 다이어그램](/images/til/FRONTEND/React/-inflearn-%EC%B2%98%EC%9D%8C-%EB%A7%8C%EB%82%98%EB%8A%94-%EB%A6%AC%EC%95%A1%ED%8A%B8/%EC%8B%A4%EC%8A%B5_%EC%A0%95%EB%A6%AC/6_State_and_LifeCycle.assets/cNfpEph.png)

(출처: [React Lifecycle Methods diagram](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/))

## 마운트

컴포넌트가 처음 만들어져 화면에 나타날 때. 호출 순서:

1. **`constructor(props)`**: 가장 먼저 실행되는 생성자. state 초기화.
2. **`static getDerivedStateFromProps(nextProps, prevState)`**: props로 받은 값을 state에 동기화할 때. `static`이라 `this`를 쓸 수 없고, 객체를 반환하면 state에 합쳐지고 `null`이면 아무 일도 없다. 첫 렌더링 전과 매 리렌더링 전에 호출된다.
3. **`render()`**: 엘리먼트를 반환.
4. **`componentDidMount()`**: 첫 렌더링이 끝나 DOM에 나타난 뒤. 데이터 요청(fetch, axios), 외부 라이브러리 연동(D3 등), DOM 측정·조작을 여기서 한다.

## 업데이트

props나 state가 바뀔 때. 호출 순서:

1. **`getDerivedStateFromProps`**
2. **`shouldComponentUpdate(nextProps, nextState)`**: `false`를 반환하면 리렌더링을 건너뛴다. 최적화용(함수 컴포넌트의 `React.memo`와 비슷한 역할).
3. **`render()`**
4. **`getSnapshotBeforeUpdate(prevProps, prevState)`**: 변경이 DOM에 반영되기 **직전**의 DOM 정보를 읽는다. 반환값은 다음 메서드의 세 번째 인자로 전달된다.
5. **`componentDidUpdate(prevProps, prevState, snapshot)`**: 리렌더링이 끝나 화면에 반영된 뒤.

```jsx
shouldComponentUpdate(nextProps, nextState) {
  return nextState.number % 10 !== 4 // 마지막 자리가 4면 리렌더링하지 않음
}
```

### getSnapshotBeforeUpdate 활용: 스크롤 위치 유지

채팅·피드처럼 목록 **위쪽**에 새 항목이 추가되면, 브라우저에 따라 사용자가 보던 위치가 아래로 밀린다. 업데이트 직전의 스크롤 높이를 기억했다가 업데이트 후 차이만큼 보정한다.

```jsx
getSnapshotBeforeUpdate(prevProps, prevState) {
  if (prevState.array !== this.state.array) {
    const { scrollTop, scrollHeight } = this.list
    return { scrollTop, scrollHeight } // componentDidUpdate의 snapshot으로 전달
  }
  return null
}

componentDidUpdate(prevProps, prevState, snapshot) {
  if (snapshot) {
    const { scrollTop } = this.list
    if (scrollTop !== snapshot.scrollTop) return // 브라우저가 이미 보정했다면 건너뜀
    const diff = this.list.scrollHeight - snapshot.scrollHeight
    this.list.scrollTop += diff
  }
}
```

![보정 전: 보던 위치가 밀림](/images/til/FRONTEND/React/-inflearn-%EC%B2%98%EC%9D%8C-%EB%A7%8C%EB%82%98%EB%8A%94-%EB%A6%AC%EC%95%A1%ED%8A%B8/%EC%8B%A4%EC%8A%B5_%EC%A0%95%EB%A6%AC/6_State_and_LifeCycle.assets/1POUOrQ.gif)

![보정 후: 위치 유지](/images/til/FRONTEND/React/-inflearn-%EC%B2%98%EC%9D%8C-%EB%A7%8C%EB%82%98%EB%8A%94-%EB%A6%AC%EC%95%A1%ED%8A%B8/%EC%8B%A4%EC%8A%B5_%EC%A0%95%EB%A6%AC/6_State_and_LifeCycle.assets/gS01iZ9.gif)

자주 쓰이지는 않으며, Hooks에는 이 메서드를 직접 대체하는 것이 아직 없다.

## 언마운트

**`componentWillUnmount()`**: 컴포넌트가 화면에서 사라지기 직전. 직접 등록한 DOM 이벤트 제거, `clearTimeout`/`clearInterval`, 소켓 연결 해제, 외부 라이브러리의 dispose 호출 등 **정리(cleanup)** 를 한다.

## 함수 컴포넌트에서는: useEffect

| 클래스 | 함수 컴포넌트 |
| --- | --- |
| `componentDidMount` | `useEffect(() => { ... }, [])` |
| `componentDidUpdate` (특정 값 변경 시) | `useEffect(() => { ... }, [value])` |
| `componentWillUnmount` | `useEffect(() => { return () => { /* cleanup */ } }, [])` |
| `shouldComponentUpdate` | `React.memo` |

```jsx
function Hello() {
  useEffect(() => {
    console.log('created :)')           // 마운트 시
    return () => console.log('destroyed :(') // 언마운트 시 (cleanup)
  }, [])
  return <h1>Hello</h1>
}
```

이 `Hello`를 show/hide 버튼으로 토글하면, 보일 때마다 'created', 숨길 때마다 'destroyed'가 찍힌다. 컴포넌트가 화면에서 사라지면 정말로 파괴되고, 다시 보이면 새로 만들어지기 때문이다. 자세한 내용은 [Hooks](/knowledge/dictionary/frontend/react/hooks)의 useEffect 절 참고.

## 핵심 정리

- 마운트: constructor → render → componentDidMount(데이터 요청)
- 업데이트: shouldComponentUpdate(건너뛰기 가능) → render → componentDidUpdate
- 언마운트: componentWillUnmount(정리)
- 함수 컴포넌트에서는 `useEffect`의 의존성 배열과 cleanup 함수로 같은 일을 한다.
