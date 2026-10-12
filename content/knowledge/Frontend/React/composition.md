---
title: "합성: 상속 대신 Composition"
concept: "Composition"
summary: "children과 props로 컴포넌트를 조합해 재사용하는 React의 방식과, 상속을 권장하지 않는 이유."
tags: ["react", "component", "frontend"]
source: til
date: "2026-10-12"
sources: ["https://riverkim.kr/255"]
---

**합성(Composition)** 은 여러 컴포넌트를 조합해 새로운 컴포넌트를 만드는 것이다. React는 강력한 합성 모델을 가지고 있어서, 컴포넌트 사이의 코드 재사용을 **상속 대신 합성**으로 해결하라고 권장한다.

## Containment: 무엇이 들어올지 모르는 박스

`Sidebar`, `Dialog`처럼 범용 "박스" 역할을 하는 컴포넌트는 안에 어떤 자식이 올지 미리 알 수 없다. 이때 특수한 prop인 **`children`** 으로 받은 것을 그대로 출력한다.

```jsx
function FancyBorder({ color, children }) {
  return <div className={`FancyBorder FancyBorder-${color}`}>{children}</div>
}

function WelcomeDialog() {
  return (
    <FancyBorder color="blue">
      <h1 className="Dialog-title">Welcome</h1>
      <p className="Dialog-message">Thank you for visiting!</p>
    </FancyBorder>
  )
}
```

`<FancyBorder>` 태그 사이에 넣은 JSX가 `children`으로 전달된다. 레이아웃 컴포넌트에서 자주 쓰는 패턴으로, 예를 들어 `<Workspace><div>로그인을 축하해요!</div></Workspace>`에서 `div`는 `Workspace`의 `children`이 된다.

### 여러 개의 구멍(slot)

구멍이 여러 개 필요하면 `children` 대신 이름 있는 props로 엘리먼트를 넘긴다. React 엘리먼트는 그냥 객체이므로 다른 데이터처럼 props로 넘길 수 있다.

```jsx
function SplitPane({ left, right }) {
  return (
    <div className="SplitPane">
      <div className="SplitPane-left">{left}</div>
      <div className="SplitPane-right">{right}</div>
    </div>
  )
}

function App() {
  return <SplitPane left={<Contacts />} right={<Chat />} />
}
```

## Specialization: 범용 컴포넌트의 특수한 경우

`WelcomeDialog`는 `Dialog`의 특수한 경우다. 더 구체적인 컴포넌트가 더 일반적인 컴포넌트를 렌더링하고, props로 내용을 채운다.

```jsx
function Dialog({ title, message, children }) {
  return (
    <FancyBorder color="blue">
      <h1 className="Dialog-title">{title}</h1>
      <p className="Dialog-message">{message}</p>
      {children}
    </FancyBorder>
  )
}

function WelcomeDialog() {
  return <Dialog title="Welcome" message="Thank you for visiting!" />
}
```

## 두 방식을 함께 쓰기

```jsx
function SignUpDialog() {
  const [login, setLogin] = useState('')

  return (
    <Dialog title="Mars Exploration Program" message="How should we refer to you?">
      <input value={login} onChange={(e) => setLogin(e.target.value)} />
      <button onClick={() => alert(`Welcome aboard, ${login}!`)}>Sign Me Up!</button>
    </Dialog>
  )
}
```

`Dialog`가 제목·메시지(특수화)를 받으면서, 안쪽 입력 영역은 `children`(containment)으로 받는다.

## 상속은?

Facebook(Meta)은 수천 개의 컴포넌트를 쓰면서도 상속 계층이 필요한 사례를 찾지 못했다고 한다. props와 합성만으로 컴포넌트의 모양과 동작을 명시적이고 안전하게 바꿀 수 있다. props로는 원시 값, 엘리먼트, 함수 등 무엇이든 넘길 수 있기 때문이다.

UI가 아닌 **로직**을 여러 컴포넌트에서 재사용하고 싶다면 별도 JavaScript 모듈(함수, 객체, 클래스)이나 [커스텀 훅](/knowledge/dictionary/frontend/react/hooks)으로 분리해 import한다.

## 합성으로 props drilling 줄이기

깊은 곳의 컴포넌트에 값을 전달하려고 중간 컴포넌트들이 쓰지도 않는 props를 계속 넘기는 것(props drilling)이 번거로울 때, 바로 [Context](/knowledge/dictionary/frontend/react/context)로 가기 전에 합성을 먼저 고려한다. 값을 쓰는 컴포넌트 자체를 상위에서 만들어 엘리먼트로 내려 주면, 중간 컴포넌트는 그 값을 알 필요가 없다.

```jsx
// 중간의 PageLayout, NavigationBar는 user를 몰라도 된다
function Page({ user }) {
  const userLink = <Avatar user={user} size="small" />
  return <PageLayout userLink={userLink} />
}
```

대신 상위 컴포넌트가 복잡해지는 단점이 있다.

## `as` prop: 렌더링할 요소를 바꾸는 컴포넌트

UI 라이브러리 컴포넌트 중에는 `as`(MUI는 `component`)라는 prop을 받는 것이 많다. **컴포넌트의 스타일과 동작은 그대로 두고, 실제로 그릴 HTML 요소나 컴포넌트만 바꾸는** 방법이다. 이런 컴포넌트를 다형(polymorphic) 컴포넌트라고 한다. JSX 기본 문법이 아니라 라이브러리가 정한 관례다(styled-components, react-bootstrap, Chakra UI 등은 `as`, MUI는 `component`).

```jsx
// react-bootstrap: Form.Control을 textarea로 그린다
<Form.Control as="textarea" rows={3} />

// 직접 만든 컴포넌트를 넘기면 Form.Control이 받은 props가 그대로 전달된다
<Form.Control name="studentName" placeholder="name" as={StudentInputText} />

// styled-components: Button 스타일을 유지한 채 <a>로 렌더링
<Button as="a" href="/home">Home</Button>
```

직접 만들 때는 `as`로 받은 값을 대문자 변수에 담아 렌더링하면 된다.

```tsx
type TextProps = { as?: React.ElementType; children: React.ReactNode }

function Text({ as: Component = 'p', children, ...rest }: TextProps) {
  return <Component className="text" {...rest}>{children}</Component>
}

<Text as="h2">제목</Text> // <h2 class="text">제목</h2>
```

- 같은 스타일을 시맨틱에 맞는 다른 태그(`h2`, `label`, `a`)에 쓸 수 있다.
- 조건이 많거나 내부 로직이 복잡한 입력 부분을 별도 파일의 컴포넌트로 빼서 `as`로 넘기면 부모 파일이 짧아진다.

## 핵심 정리

- 내용을 모르는 박스는 `children`, 구멍이 여럿이면 이름 있는 props로 엘리먼트를 받는다.
- 특수한 컴포넌트는 범용 컴포넌트를 렌더링하며 props로 구체화한다.
- React에서 상속은 쓰지 않는다. 로직 재사용은 모듈이나 커스텀 훅으로.
- `as`(MUI는 `component`) prop은 스타일·동작을 유지한 채 그릴 요소만 바꾼다.
