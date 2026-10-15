---
title: "합성: 상속 대신 Composition"
concept: "Composition"
summary: "children과 props로 컴포넌트를 조합해 재사용하는 React의 방식. children, 이름 있는 슬롯 props, 특수화, as prop, 합성으로 props drilling 줄이기를 언제 쓰는지 정리하고, 상속을 권장하지 않는 이유를 덧붙인다."
tags: ["react", "component", "frontend"]
source: til
date: "2026-10-13"
sources: ["https://riverkim.kr/255"]
---

**합성(Composition)** 은 여러 컴포넌트를 조합해 새로운 컴포넌트를 만드는 것이다. React는 컴포넌트 사이의 코드 재사용을 **상속 대신 합성**으로 해결한다. React 엘리먼트는 그냥 객체라서 원시 값·함수처럼 props로 넘길 수 있고, 이것이 합성의 바탕이다.

## 합성 패턴

| 패턴 | 언제 | 한 줄 코드 |
| --- | --- | --- |
| `children` (containment) | 안에 무엇이 올지 모르는 박스(레이아웃, Sidebar, Dialog) | `<Border>{children}</Border>` |
| 이름 있는 슬롯 props | 구멍이 여러 개 필요할 때 | `<SplitPane left={<Contacts />} right={<Chat />} />` |
| 특수화 (specialization) | 범용 컴포넌트의 특수한 경우를 만들 때 | `const WelcomeDialog = () => <Dialog title="Welcome" />` |
| `as` prop (polymorphic) | 스타일·동작은 그대로 두고 그릴 요소만 바꿀 때 | `<Button as="a" href="/home">Home</Button>` |
| 합성으로 drilling 줄이기 | 중간 컴포넌트가 쓰지도 않는 props를 계속 넘길 때 | `<PageLayout userLink={<Avatar user={user} />} />` |

## 예: Dialog

특수화와 `children`을 함께 쓰는 전형적인 예다. `Dialog`는 제목·메시지를 props로 받아 특수화되고, 안쪽 입력 영역은 `children`으로 받는다.

```jsx
function Dialog({ title, message, children }) {
  return (
    <div className="dialog">
      <h2>{title}</h2>
      <p>{message}</p>
      {children}
    </div>
  )
}

function SignUpDialog() {
  const [login, setLogin] = useState('')
  return (
    <Dialog title="회원 가입" message="어떻게 불러 드릴까?">
      <input value={login} onChange={(e) => setLogin(e.target.value)} />
      <button onClick={() => signUp(login)}>가입</button>
    </Dialog>
  )
}
```

## as prop 직접 만들기

`as`는 JSX 문법이 아니라 라이브러리 관례다(styled-components·react-bootstrap·Chakra UI는 `as`, MUI는 `component`). 받은 값을 대문자 변수에 담아 렌더링하면 된다.

```tsx
type TextProps = { as?: React.ElementType; children: React.ReactNode }

function Text({ as: Component = 'p', children, ...rest }: TextProps) {
  return <Component className="text" {...rest}>{children}</Component>
}

<Text as="h2">제목</Text> // <h2 class="text">제목</h2>
```

- 같은 스타일을 시맨틱에 맞는 다른 태그(`h2`, `label`, `a`)에 쓸 수 있다.
- 직접 만든 컴포넌트를 넘기면(`<Form.Control as={StudentInput} />`) 받은 props가 그대로 전달된다. 복잡한 입력 부분을 별도 파일로 빼는 데에도 쓴다.

## 합성으로 props drilling 줄이기

깊은 곳에 값을 전달하려고 [[context|Context]]로 바로 가기 전에 합성을 먼저 고려한다. 값을 쓰는 컴포넌트를 상위에서 만들어 엘리먼트로 내리면, 중간의 `PageLayout`·`NavigationBar`는 `user`를 알 필요가 없다. 대신 상위 컴포넌트가 복잡해진다.

## 정리

- 내용을 모르는 박스는 `children`, 구멍이 여럿이면 이름 있는 props로 엘리먼트를 받는다.
- 특수한 컴포넌트는 범용 컴포넌트를 렌더링하며 props로 구체화한다.
- `as`(MUI는 `component`) prop은 스타일·동작을 유지한 채 그릴 요소만 바꾼다.
- 상속은 쓰지 않는다. props와 합성만으로 모양과 동작을 명시적으로 바꿀 수 있고, UI가 아닌 로직 재사용은 모듈이나 [[hooks|커스텀 훅]]으로 한다.

관련 노트: [[components-and-props|컴포넌트와 Props]], [[component-splitting|컴포넌트를 분리하는 기준과 방법]], [[context|Context]], [[advanced-react-patterns|재사용 컴포넌트를 위한 리액트 패턴 5가지]]
