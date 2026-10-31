---
title: "React 이벤트 처리"
concept: "React Event"
summary: "JSX 속성으로 핸들러 함수를 넘기는 React의 이벤트 처리 방식과 DOM 이벤트와의 차이."
tags: ["react", "event", "frontend"]
source: til
date: "2026-10-13"
---

**이벤트(Event)** 는 사용자의 클릭·입력 같은 사건이고, **이벤트 핸들러**는 그 사건이 일어났을 때 실행되는 함수다. React에서는 `addEventListener`를 직접 호출하는 대신, JSX 속성으로 핸들러 함수를 넘긴다.

## DOM과 React의 차이

```html
<!-- HTML: 소문자 속성, 문자열로 코드 -->
<button onclick="activate()">Activate</button>
```

```jsx
// React: camelCase 속성, 함수 자체를 전달
<button onClick={activate}>Activate</button>
```

| | HTML(DOM) | React |
| --- | --- | --- |
| 속성 이름 | 소문자 `onclick` | camelCase `onClick` |
| 값 | 실행할 코드 문자열 | **함수 참조** `{activate}` |
| 기본 동작 막기 | `return false` 가능 | 반드시 `e.preventDefault()` |

`onClick={activate()}`처럼 괄호를 붙이면 렌더링할 때 **즉시 호출**되고 그 반환값이 핸들러로 들어간다. 함수 자체를 넘겨야 한다.

## 함수 컴포넌트에서 핸들러 정의

```jsx
function Toggle() {
  const [isToggleOn, setIsToggleOn] = useState(true)

  // 방법 1: 컴포넌트 안에 함수 선언
  // function handleClick() {
  //   setIsToggleOn((current) => !current)
  // }

  // 방법 2: 화살표 함수
  const handleClick = () => {
    setIsToggleOn((current) => !current)
  }

  return <button onClick={handleClick}>{isToggleOn ? '켜짐' : '꺼짐'}</button>
}
```

두 방법 중 하나만 쓰면 된다(같은 이름으로 둘 다 선언하면 에러). 클래스 컴포넌트에서는 메서드의 `this`가 사라지는 문제 때문에 생성자에서 `this.handleClick = this.handleClick.bind(this)`를 해야 했지만, 함수 컴포넌트에서는 신경 쓸 필요가 없다.

## 인자 전달

```jsx
// 화살표 함수로 감싸기
<button onClick={(event) => deleteItem(id, event)}>삭제</button>

// bind로 앞쪽 인자 고정
<button onClick={deleteItem.bind(null, id)}>삭제</button>
```

## 이벤트 객체

핸들러는 브라우저 이벤트를 감싼 **SyntheticEvent**를 받는다. 브라우저마다 다른 이벤트를 같은 인터페이스로 다룰 수 있게 해 주며, `e.target`, `e.preventDefault()`, `e.stopPropagation()` 등 DOM 이벤트와 같은 API를 가진다.

React는 요소마다 리스너를 달지 않고 **루트에 위임**한다. React 17부터 위임 대상이 `document`에서 `createRoot`를 부른 루트 컨테이너로 바뀌어, 한 페이지에 여러 React 앱이나 다른 라이브러리가 섞여도 이벤트가 서로 간섭하지 않는다. 캡처 단계에서 받으려면 `onClickCapture`처럼 `Capture`를 붙인다([[dom-events|DOM 이벤트]]).

```jsx
function Form() {
  const handleSubmit = (e) => {
    e.preventDefault() // 폼 제출 시 새로고침 방지
    // ...
  }
  return <form onSubmit={handleSubmit}>...</form>
}
```

## 핵심 정리

- `onClick={handler}`: camelCase 속성에 **함수 참조**를 넘긴다(호출하지 않는다).
- 인자가 필요하면 화살표 함수로 감싸거나 bind.
- 기본 동작은 `e.preventDefault()`로 막는다.
