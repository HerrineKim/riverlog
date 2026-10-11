---
title: "JSX와 엘리먼트 렌더링"
concept: "JSX"
summary: "JavaScript 안에서 HTML처럼 UI를 선언하는 JSX 문법과, 그 결과물인 불변 React 엘리먼트의 렌더링."
tags: ["react", "jsx", "javascript", "frontend"]
source: til
---

**JSX(JavaScript XML)** 는 JavaScript 안에 HTML과 비슷한 마크업을 쓸 수 있게 한 확장 문법이다. 공식 JavaScript 문법이 아니라서 브라우저가 직접 이해하지 못하고, **Babel**이 일반 JavaScript(`React.createElement` 호출)로 변환한다. 마크업과 로직을 한 파일에서 함께 다룰 수 있어 읽고 쓰기 쉽다.

```jsx
// 작성하는 JSX
function App() {
  return <h1>Hello, React!</h1>
}

// Babel이 변환한 결과 (고전 런타임 기준)
function App() {
  return React.createElement('h1', null, 'Hello, React!')
}
```

React 17부터는 새 JSX 변환(`react/jsx-runtime`)을 써서 파일마다 `import React`를 하지 않아도 된다.

## JSX 문법 규칙

### 1. 최상위 요소는 하나여야 한다

컴포넌트는 하나의 트리를 반환해야 한다. 형제 요소를 나란히 반환하면 컴파일 에러가 난다.

```jsx
// ✗ Adjacent JSX elements must be wrapped in an enclosing tag
function App() {
  return (
    <div>Hello</div>
    <div>React</div>
  )
}
```

감싸는 방법은 세 가지다.

```jsx
// ① div로 감싸기 — 실제 DOM에 div가 하나 더 생겨 스타일에 영향을 줄 수 있다
return (
  <div>
    <div>Hello</div>
    <div>React</div>
  </div>
)

// ② Fragment — DOM에 아무것도 추가하지 않는다
import { Fragment } from 'react'
return (
  <Fragment>
    <div>Hello</div>
    <div>React</div>
  </Fragment>
)

// ③ Fragment 축약형 <></> (key를 줄 수 없다는 점만 다르다)
return (
  <>
    <div>Hello</div>
    <div>React</div>
  </>
)
```

Fragment는 실제 DOM 노드를 만들지 않으므로 불필요한 래퍼 div가 싫을 때 쓴다. 리스트에서 key가 필요하면 축약형 대신 `<Fragment key={...}>`를 쓴다.

### 2. 중괄호 `{}` 안에는 JavaScript 표현식

```jsx
function App() {
  const name = 'Kim'
  return <div>Hello, {name}!</div>
}
```

값으로 평가되는 모든 **표현식**은 넣을 수 있지만, `if`문이나 `for`문 같은 **문(statement)** 은 넣을 수 없다. 조건에 따라 다르게 그리려면 JSX 밖에서 `if`를 쓰거나, 안에서 삼항 연산자 `? :`, `&&`를 쓴다([조건부 렌더링](/knowledge/dictionary/frontend/react/conditional-rendering)). 반복은 `map`을 쓴다([리스트와 Key](/knowledge/dictionary/frontend/react/lists-and-keys)).

### 3. 속성 이름은 camelCase, 예약어는 피한다

| HTML | JSX |
| --- | --- |
| `class` | `className` |
| `for` (label) | `htmlFor` |
| `onclick` | `onClick` |
| `style="font-size: 12px"` | `style={{ fontSize: '12px' }}` |

`class`, `for`는 JavaScript 예약어라서 다른 이름을 쓴다. 인라인 스타일은 문자열이 아니라 **camelCase 속성을 가진 객체**로 넘긴다.

```jsx
function App() {
  const style = { backgroundColor: 'green', fontSize: '12px' }
  return (
    <div className="greeting" style={style}>
      Hello!
    </div>
  )
}
```

### 4. 주석

```jsx
return (
  <>
    {/* JSX 안의 주석은 이렇게 */}
    <div
      // 여는 태그 안에서는 한 줄 주석도 가능
    >
      Hello
    </div>
  </>
)
```

## React 엘리먼트와 렌더링

JSX가 만들어 내는 결과물은 **React 엘리먼트** — 화면에 무엇을 그릴지 설명하는 가벼운 JavaScript 객체다. React 앱을 이루는 가장 작은 단위이며, 실제 DOM 요소보다 훨씬 가볍다.

```javascript
React.createElement(type, [props], [...children])
```

![React 엘리먼트](/images/til/FRONTEND/React/-inflearn-%EC%B2%98%EC%9D%8C-%EB%A7%8C%EB%82%98%EB%8A%94-%EB%A6%AC%EC%95%A1%ED%8A%B8/%EC%8B%A4%EC%8A%B5_%EC%A0%95%EB%A6%AC/4_Rendering_Elements.assets/image-20220626175848330.png)

### 불변성

엘리먼트는 한 번 만들면 children이나 속성을 바꿀 수 없다(immutable). 화면을 바꾸려면 **새 엘리먼트를 만들어 다시 렌더링**한다. React는 이전 엘리먼트와 새 엘리먼트를 비교(Virtual DOM diffing)해서 **바뀐 부분만** 실제 DOM에 반영한다.

![갱신된 엘리먼트만 다시 그림](/images/til/FRONTEND/React/-inflearn-%EC%B2%98%EC%9D%8C-%EB%A7%8C%EB%82%98%EB%8A%94-%EB%A6%AC%EC%95%A1%ED%8A%B8/%EC%8B%A4%EC%8A%B5_%EC%A0%95%EB%A6%AC/4_Rendering_Elements.assets/image-20220626180239800.png)

### 루트에 렌더링하기

HTML에는 React가 관리할 빈 컨테이너(root DOM node) 하나만 둔다. 모든 React 엘리먼트는 이 아래에 그려진다.

```html
<div id="root"></div>
```

```jsx
// React 18+
import { createRoot } from 'react-dom/client'

const root = createRoot(document.getElementById('root'))
root.render(<App />)
```

참고: React 17 이하에서 쓰던 `ReactDOM.render(<App />, document.getElementById('root'))`는 React 18에서 deprecated, React 19에서 제거되었다. 강의 자료에 이 형태가 나오면 위 방식으로 바꿔 쓴다.

## 핵심 정리

- JSX는 Babel이 `createElement` 호출로 바꿔 주는 문법이다.
- 최상위는 하나(필요하면 Fragment), `{}`에는 표현식만, 속성은 `className`·`htmlFor`·camelCase.
- 엘리먼트는 불변이다. React는 새 엘리먼트와 비교해 바뀐 부분만 DOM에 반영한다.
