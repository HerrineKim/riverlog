---
title: "State와 useState"
concept: "State"
summary: "컴포넌트가 스스로 관리하는 변하는 데이터인 state, useState와 함수형 업데이트, 공통 부모로 state 끌어올리기."
tags: ["react", "state", "hooks", "frontend"]
source: til
---

**State**는 컴포넌트 안에서 관리되는, 시간에 따라 변하는 데이터다. props가 바깥에서 넘겨받는 값(함수의 매개변수)이라면, state는 컴포넌트 내부에 선언한 변수에 해당한다. 일반 변수와 달리 state를 바꾸면 **React가 컴포넌트를 다시 렌더링**해 화면에 반영한다. "데이터가 바뀔 때마다 직접 다시 그리는" 대신 "데이터를 React에 맡겨 두고 바뀌면 알아서 그리게" 하는 것이 React의 핵심이다.

## useState

```jsx
import { useState } from 'react'

function Counter() {
  const [counter, setCounter] = useState(0) // [현재 값, 변경 함수] = useState(초기값)

  const onClick = () => {
    setCounter(counter + 1) // 값을 바꾸고 리렌더링을 요청
  }

  return (
    <div>
      <h3>Total clicks: {counter}</h3>
      <button onClick={onClick}>Click me</button>
    </div>
  )
}
```

- 배열 구조 분해로 이름을 자유롭게 짓는다. 관례는 `[something, setSomething]`.
- state가 바뀌면 컴포넌트 함수가 **처음부터 다시 실행**된다. 그래서 렌더링마다 실행되면 안 되는 코드(API 호출 등)는 `useEffect`로 분리한다([Hooks](/knowledge/dictionary/frontend/react/hooks)).
- **직접 대입은 금지**: `counter = counter + 1`이나 `this.state.x = 1`처럼 바꾸면 React가 변경을 알지 못해 화면이 바뀌지 않는다. 반드시 setter를 쓴다.

### 함수형 업데이트

새 값이 **이전 값에 의존**할 때는 setter에 함수를 넘긴다. React는 업데이트를 모아서(batching) 처리하기 때문에, 렌더링 시점의 `counter`를 그대로 쓰면 최신 값이 아닐 수 있다.

```jsx
// 이전 값 기반 → 함수형 업데이트
setCounter((current) => current + 1)

// 토글
setFlipped((current) => !current)

// 배열에 추가 (원본을 바꾸지 않고 새 배열 생성)
setGoals((currentGoals) => [...currentGoals, newGoal])

// 배열에서 삭제
setGoals((currentGoals) => currentGoals.filter((goal) => goal.id !== id))
```

### 불변성

객체·배열 state는 **원본을 수정하지 않고 새 객체·배열을 만들어** setter에 넘긴다. React는 참조가 바뀌었는지로 변경을 감지하기 때문에, `push`로 원본을 바꾸고 같은 배열을 넘기면 변경을 알아채지 못한다. spread(`...`), `map`, `filter`가 이 용도의 기본 도구다.

## 클래스 컴포넌트의 state (참고)

Hooks 이전에는 state를 클래스 컴포넌트에서만 쓸 수 있었다. 지금은 거의 쓰지 않지만 기존 코드를 읽기 위해 형태만 알아 둔다.

```jsx
class App extends React.Component {
  constructor(props) {
    super(props) // super 호출 전에는 this를 쓸 수 없다
    this.state = { subject: { title: 'WEB', sub: 'World Wide Web!' } }
  }

  render() {
    return <Subject title={this.state.subject.title} sub={this.state.subject.sub} />
  }
}
```

- `constructor`에서 `this.state`를 초기화하고, 변경은 `this.setState({...})`로 한다.
- 사용자에게 보이는 부분에 값을 직접 적지 않고 state를 통해 참조하면, 내부 데이터를 숨기고(캡슐화) 쓰는 쪽과 구현하는 쪽을 분리할 수 있다.

## State 끌어올리기(Lifting State Up)

여러 컴포넌트가 **같은 데이터**를 보여 줘야 한다면, 각자 state를 가지지 말고 **가장 가까운 공통 부모**에 state를 하나만 두고 props로 내려 준다.

![공통 부모에 state 두기](/images/til/FRONTEND/React/-inflearn-%EC%B2%98%EC%9D%8C-%EB%A7%8C%EB%82%98%EB%8A%94-%EB%A6%AC%EC%95%A1%ED%8A%B8/%EC%8B%A4%EC%8A%B5_%EC%A0%95%EB%A6%AC/12_State.assets/image-20220627003509048.png)

### 예제: 섭씨·화씨 온도 계산기

섭씨와 화씨 입력창 중 어디에 입력해도 다른 쪽이 함께 바뀌고, 물이 끓는지 알려 주는 계산기.

```jsx
const scaleNames = { c: '섭씨', f: '화씨' }

function toCelsius(f) { return ((f - 32) * 5) / 9 }
function toFahrenheit(c) { return (c * 9) / 5 + 32 }

function tryConvert(temperature, convert) {
  const input = parseFloat(temperature) // 문자열 → 실수
  if (Number.isNaN(input)) return ''
  const rounded = Math.round(convert(input) * 1000) / 1000
  return rounded.toString()
}

function BoilingVerdict({ celsius }) {
  return <p>{celsius >= 100 ? '물이 끓습니다.' : '물이 끓지 않습니다.'}</p>
}

// 자식: 자기 state 없이 props로 값을 받고, 변경은 부모에게 알린다
function TemperatureInput({ scale, temperature, onTemperatureChange }) {
  return (
    <fieldset>
      <legend>온도를 입력해 주세요(단위: {scaleNames[scale]})</legend>
      <input
        value={temperature}
        onChange={(e) => onTemperatureChange(e.target.value)}
      />
    </fieldset>
  )
}

// 부모: 유일한 state를 소유
function Calculator() {
  const [temperature, setTemperature] = useState('')
  const [scale, setScale] = useState('c')

  const celsius = scale === 'f' ? tryConvert(temperature, toCelsius) : temperature
  const fahrenheit = scale === 'c' ? tryConvert(temperature, toFahrenheit) : temperature

  return (
    <div>
      <TemperatureInput
        scale="c"
        temperature={celsius}
        onTemperatureChange={(t) => { setScale('c'); setTemperature(t) }}
      />
      <TemperatureInput
        scale="f"
        temperature={fahrenheit}
        onTemperatureChange={(t) => { setScale('f'); setTemperature(t) }}
      />
      <BoilingVerdict celsius={parseFloat(celsius)} />
    </div>
  )
}
```

두 입력창이 각자 가지던 state를 **부모로 끌어올리고**, 자식은 `value`와 변경 함수만 props로 받는 구조로 바꿨다. 데이터의 출처(single source of truth)가 하나가 되어 두 값이 어긋날 수 없다.

## 핵심 정리

- state = 컴포넌트가 관리하는 변하는 값. 바꿀 때는 항상 setter.
- 이전 값에 의존하면 함수형 업데이트, 객체·배열은 새로 만들어서 넘긴다.
- 여러 컴포넌트가 공유하는 값은 가장 가까운 공통 부모로 끌어올린다. 더 멀리 공유해야 하면 [Context](/knowledge/dictionary/frontend/react/context).
