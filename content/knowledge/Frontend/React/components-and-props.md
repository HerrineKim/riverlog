---
title: "컴포넌트와 Props"
concept: "Props"
summary: "UI를 재사용 가능한 조각으로 나누는 컴포넌트와, 부모가 자식에게 값을 넘기는 읽기 전용 입력값 props."
tags: ["react", "component", "frontend"]
source: til
---

**컴포넌트**는 화면을 독립적이고 재사용 가능한 조각으로 나눈 단위다. 개념적으로는 함수와 같아서, **props**라는 입력을 받아 화면에 무엇을 그릴지(React 엘리먼트)를 반환한다. 컴포넌트 하나당 파일 하나를 두면 모듈화도 쉬워진다.

![컴포넌트는 props를 받아 엘리먼트를 반환한다](/images/til/FRONTEND/React/-inflearn-%EC%B2%98%EC%9D%8C-%EB%A7%8C%EB%82%98%EB%8A%94-%EB%A6%AC%EC%95%A1%ED%8A%B8/%EC%8B%A4%EC%8A%B5_%EC%A0%95%EB%A6%AC/5_Components_and_Props.assets/image-20220626224207253.png)

## 함수 컴포넌트

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>
}

function App() {
  return (
    <div>
      <Welcome name="Mike" />
      <Welcome name="Steve" />
      <Welcome name="Jane" />
    </div>
  )
}
```

- 컴포넌트 이름은 **반드시 대문자로 시작**한다. 소문자로 시작하면 React가 `<div>` 같은 HTML 태그로 해석한다.
- 위처럼 작은 컴포넌트를 조합해 큰 화면을 만드는 것을 **합성(composition)** 이라 한다([합성](/knowledge/dictionary/frontend/react/composition) 참고).
- 예전에는 state가 있으면 클래스, 없으면 함수 컴포넌트로 나눠 썼지만, Hooks 등장 이후로는 함수 컴포넌트가 표준이다.

## Props

부모가 자식 컴포넌트에 넘기는 값이다. HTML 속성처럼 쓰고, 자식에서는 함수의 인자처럼 받는다.

```jsx
// 구조 분해 할당으로 받으면 깔끔하다
function Btn({ buttonName, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: 'teal',
        color: 'white',
        padding: '10px 20px',
        border: 0,
        borderRadius: '10px',
      }}
    >
      {buttonName}
    </button>
  )
}

function App() {
  return (
    <div>
      <Btn buttonName="Save Changes" onClick={() => alert('saved')} />
      <Btn buttonName="Confirm" />
    </div>
  )
}
```

- 문자열은 `name="Mike"`, 그 외(숫자, 객체, 함수, JSX)는 `{}`로 넘긴다.
- 함수도 넘길 수 있다. 자식이 부모의 state를 바꾸게 하려면 부모가 **변경 함수를 props로** 내려 준다.
- `onClick`처럼 생겼어도 **커스텀 컴포넌트에 준 props는 그냥 값**이다. 자식이 실제 `<button onClick>`에 연결해 줘야 이벤트가 된다.

### Props는 읽기 전용

컴포넌트는 받은 props를 **절대 수정하지 않는다.** 같은 props를 받으면 항상 같은 결과를 그리는 순수 함수처럼 동작해야 한다. 바뀌어야 하는 값은 [State](/knowledge/dictionary/frontend/react/state)로 관리한다.

| | props | state |
| --- | --- | --- |
| 비유 | 함수의 매개변수 | 함수 안에서 선언한 변수 |
| 소유 | 부모가 넘겨줌 | 컴포넌트 자신이 관리 |
| 변경 | 읽기 전용 | setter로 변경 → 리렌더링 |

### 기본값

```jsx
function Btn({ buttonName, fontSize = 14 }) {
  return <button style={{ fontSize }}>{buttonName}</button>
}
```

## PropTypes

JavaScript는 타입이 없어서 잘못된 props를 넘겨도 React가 알려 주지 않는다. `prop-types` 패키지로 기대하는 타입과 필수 여부를 선언하면 개발 모드에서 콘솔 경고를 띄워 준다.

```jsx
import PropTypes from 'prop-types'

function Btn({ buttonName, fontSize = 14 }) {
  return <button style={{ fontSize }}>{buttonName}</button>
}

Btn.propTypes = {
  buttonName: PropTypes.string.isRequired,
  fontSize: PropTypes.number,
}
```

- 경고는 **개발 빌드**에서만 나온다(production 빌드에서는 검사하지 않는다).
- 참고: 최신 React(19)는 `propTypes` 검사를 더 이상 지원하지 않는다. 지금은 **TypeScript로 props 타입을 정의**하는 것이 표준이다.

```tsx
type BtnProps = {
  buttonName: string
  fontSize?: number
}

function Btn({ buttonName, fontSize = 14 }: BtnProps) {
  return <button style={{ fontSize }}>{buttonName}</button>
}
```

## 핵심 정리

- 컴포넌트 = props를 받아 엘리먼트를 반환하는 함수. 이름은 대문자로 시작.
- props는 부모 → 자식 단방향, 읽기 전용. 바뀌는 값은 state로.
- props 타입은 PropTypes 대신 TypeScript로 정의한다.
