---
title: "JSX와 엘리먼트 렌더링"
concept: "JSX"
summary: "JavaScript 안에서 HTML처럼 UI를 선언하는 JSX 문법과, 그 결과물인 불변 React 엘리먼트의 렌더링."
tags: ["react", "jsx", "javascript", "frontend"]
source: til
date: "2026-10-21"
sources: ["https://riverkim.kr/134", "https://riverkim.kr/299", "https://react.vlpt.us/basic/01-concept.html", "https://react.vlpt.us/basic/03-first-component.html", "https://react.vlpt.us/basic/04-jsx.html", "https://prepare-frontend-interview.vercel.app/react", "https://react.dev/learn/creating-a-react-app"]
---

> 개인 TIL을 바탕으로, 벨로퍼트의 「[벨로퍼트와 함께하는 모던 리액트](https://react.vlpt.us/)」 중 「[리액트는 어쩌다 만들어졌을까?](https://react.vlpt.us/basic/01-concept.html)」·「[JSX의 기본 규칙](https://react.vlpt.us/basic/04-jsx.html)」을 바탕으로 보강했다.
> 「[프론트엔드 면접 준비: React](https://prepare-frontend-interview.vercel.app/react)」 정리로 라이브러리와 프레임워크의 차이를 보강했다.

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

지금의 JSX 변환(React 17에서 도입된 `react/jsx-runtime`)은 `createElement` 대신 `jsx()` 호출을 만들고, 이 함수를 자동으로 import하므로 파일마다 `import React`를 쓰지 않는다.

## 왜 React인가: 갱신 규칙 대신 다시 그리기

DOM을 직접 다루면 「어떤 이벤트가 나면 어떤 노드의 어떤 속성을 어떻게 바꾼다」는 **갱신 규칙**을 하나하나 써야 한다.

```javascript
const number = document.getElementById('number')
document.getElementById('increase').onclick = () => {
  number.innerText = parseInt(number.innerText, 10) + 1 // 규칙 1
}
document.getElementById('decrease').onclick = () => {
  number.innerText = parseInt(number.innerText, 10) - 1 // 규칙 2
}
```

이벤트·상태·DOM이 늘면 규칙이 곱으로 늘어 관리하기 어려워진다. Backbone·AngularJS 같은 이전 세대 프레임워크는 값과 DOM 속성을 연결(바인딩)해 이 규칙을 줄였다. React는 발상을 바꿨다. **상태가 바뀌면 화면 전체를 처음부터 다시 그린다고 생각하고 코드를 쓴다.** 그러면 "어떻게 갱신할지"는 고민하지 않고 "이 상태일 때 화면은 이렇다"만 선언하면 된다(선언형 UI).

실제 DOM을 매번 다시 만들면 느리므로, React는 메모리 속 JavaScript 객체 트리인 **가상 DOM(Virtual DOM)** 에 먼저 그린 뒤 이전 트리와 비교해 **달라진 곳만 실제 DOM에 반영**한다.

![상태 변경 → 가상 DOM 렌더링 → 비교 → 바뀐 부분만 실제 DOM에 패치](https://i.imgur.com/u6YnxUS.png)

부모가 리렌더링되면 자식도 함께 다시 렌더링(가상 DOM 계산)되지만, 실제 DOM이 바뀌는 곳은 결과가 달라진 노드뿐이다. 다시 렌더링 자체를 줄이는 방법은 [[re-rendering|리렌더링 원인과 추적]]에, 두 트리를 비교하는 규칙과 그에 따라 state가 유지·초기화되는 원리는 [[reconciliation|재조정과 state 보존]]에 있다.

### 라이브러리인가, 프레임워크인가

React는 스스로를 **UI 라이브러리**라 부른다. 앱의 흐름은 내 코드가 쥐고, 화면을 그릴 때 React를 부른다. 라우팅·데이터 가져오기·빌드는 React가 정하지 않아 따로 고른다. 프레임워크는 반대로 뼈대와 규칙을 정해 두고 **내 코드를 호출한다**(제어의 역전, [[web-glossary|웹 용어 사전]]). 그래서 React 공식 문서는 새 앱을 Next.js·React Router 같은 프레임워크 위에서 시작하도록 권하고, 프레임워크 없이 쓰려면 Vite 같은 빌드 도구로 직접 구성한다([[tooling|React 빌드 환경 직접 구성하기]]).

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

| 방법 | DOM 노드 | key 가능 | 쓸 때 |
| --- | --- | --- | --- |
| `<div>` | 생긴다 | 가능 | 감싼 요소에 스타일·레이아웃이 실제로 필요할 때 |
| `<Fragment>` | 안 생긴다 | 가능 | 리스트에서 여러 요소를 묶고 key를 줘야 할 때 `<Fragment key={id}>` |
| `<>...</>` (축약형) | 안 생긴다 | 불가 | 대부분의 경우. 래퍼 없이 형제를 반환할 때 |

의미 없는 `div`는 노드를 늘릴 뿐 아니라 **HTML 구조 규칙을 깨기도 한다.** `<td>` 여러 개를 돌려주는 `Columns`를 `div`로 감싸면 `<tr><div><td>`가 되어 `table > tr > td` 구조가 무너진다. `ul > li`도 마찬가지다.

```jsx
function Columns() {
  return (
    <>
      <td>Hello</td>
      <td>World</td>
    </>
  )
}
```

또 **모든 태그는 닫아야 한다.** HTML에서 닫지 않고 쓰던 `<input>`, `<br>`도 `<input />`, `<br />`처럼 self-closing 태그로 쓴다. 내용이 없는 컴포넌트도 `<Hello />`로 닫는다.

### 2. 중괄호 `{}` 안에는 JavaScript 표현식

```jsx
function App() {
  const name = 'Kim'
  return <div>Hello, {name}!</div>
}
```

값으로 평가되는 모든 **표현식**은 넣을 수 있지만, `if`문이나 `for`문 같은 **문(statement)** 은 넣을 수 없다(이유는 [[statements-vs-expressions|문과 식]]). 조건에 따라 다르게 그리려면 JSX 밖에서 `if`를 쓰거나, 안에서 삼항 연산자 `? :`, `&&`를 쓴다([조건부 렌더링](/knowledge/dictionary/frontend/react/conditional-rendering)). 반복은 `map`을 쓴다([리스트와 Key](/knowledge/dictionary/frontend/react/lists-and-keys)).

### 3. 속성 이름은 camelCase, 예약어는 피한다

| HTML·SVG | JSX | 이유 |
| --- | --- | --- |
| `class` | `className` | JavaScript 예약어 |
| `for` (label) | `htmlFor` | JavaScript 예약어 |
| `onclick` | `onClick` | 이벤트는 camelCase |
| `style="font-size: 12px"` | `style={{ fontSize: '12px' }}` | 문자열이 아니라 camelCase 속성의 객체 |
| SVG `stroke-width`, `fill-rule` | `strokeWidth`, `fillRule` | 하이픈 속성은 camelCase |
| SVG `xmlns:xlink`, `xml:space` | `xmlnsXlink`, `xmlSpace` | JSX는 속성 이름의 콜론(네임스페이스)을 허용하지 않는다 |
| SVG `xlink:href` | `href` (또는 `xlinkHref`) | SVG 2에서는 `xlink:` 없이 쓴다 |

Figma 등에서 내보낸 SVG를 그대로 붙이면 `Namespace tags are not supported by default` 에러가 난다. 인라인 SVG에는 네임스페이스 선언이 사실상 필요 없으므로 [SVGO](https://github.com/svg/svgo)로 정리하거나, SVG 파일을 SVGR(`*.svg?react` 등)로 불러와 변환을 도구에 맡긴다.

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

JSX가 만들어 내는 결과물은 **React 엘리먼트**로, 화면에 무엇을 그릴지 설명하는 가벼운 JavaScript 객체다. React 앱을 이루는 가장 작은 단위이며, 실제 DOM 요소보다 훨씬 가볍다.

```javascript
React.createElement(type, [props], [...children])
```

### 불변성

엘리먼트는 한 번 만들면 children이나 속성을 바꿀 수 없다(immutable). 화면을 바꾸려면 **새 엘리먼트를 만들어 다시 렌더링**한다. React는 이전 엘리먼트와 새 엘리먼트를 비교(Virtual DOM diffing)해서 **바뀐 부분만** 실제 DOM에 반영한다.

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

과거에는 `ReactDOM.render(<App />, document.getElementById('root'))`를 썼다. React 18에서 deprecated, React 19에서 제거됐으므로 옛 코드에서 이 형태를 보면 `createRoot`로 바꾼다.

## 정리

- JSX는 Babel이 `createElement` 호출로 바꿔 주는 문법이다.
- 최상위는 하나(필요하면 Fragment), `{}`에는 표현식만, 속성은 `className`·`htmlFor`·camelCase.
- 표 행·리스트 항목을 묶을 때는 `div` 대신 Fragment를 써야 HTML 구조가 깨지지 않는다.
- SVG의 `xmlns:xlink` 같은 콜론 속성은 JSX에서 `xmlnsXlink`처럼 camelCase로 바꾼다.
- 엘리먼트는 불변이다. React는 새 엘리먼트와 비교해 바뀐 부분만 DOM에 반영한다.

관련 노트: [[components-and-props|컴포넌트와 Props]], [[conditional-rendering|조건부 렌더링]], [[lists-and-keys|리스트와 Key]], [[statements-vs-expressions|문과 식]]
