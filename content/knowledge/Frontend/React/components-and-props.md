---
title: "컴포넌트와 Props"
concept: "Props"
summary: "UI를 재사용 가능한 조각으로 나누는 컴포넌트와, 부모가 자식에게 값을 넘기는 읽기 전용 입력값 props. 타입은 TypeScript로 정하고, React 19부터 ref도 일반 prop으로 받는다."
tags: ["react", "component", "frontend"]
source: til
date: "2026-10-13"
sources: ["https://riverkim.kr/102", "https://react.dev/blog/2024/04/25/react-19-upgrade-guide", "https://react.dev/blog/2024/12/05/react-19"]
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

## Props 타입: TypeScript

props의 타입은 **TypeScript로 정의**한다. 잘못된 props를 넘기면 실행 전에 에디터와 컴파일러가 알려 준다.

```tsx
type BtnProps = {
  buttonName: string
  fontSize?: number // 선택 prop
}

function Btn({ buttonName, fontSize = 14 }: BtnProps) {
  return <button style={{ fontSize }}>{buttonName}</button>
}
```

- 기본값은 구조 분해의 기본 매개변수로 준다. 함수 컴포넌트의 `defaultProps`는 React 19에서 제거됐다(클래스 컴포넌트에만 남았다).
- 과거에는 `prop-types` 패키지로 `Btn.propTypes = { buttonName: PropTypes.string.isRequired }`처럼 선언해 개발 모드에서 콘솔 경고를 받았다. React 19는 `propTypes` 검사를 하지 않고 조용히 무시한다.

## ref도 props다

React 19부터 함수 컴포넌트는 `ref`를 **일반 prop처럼** 받는다. 예전처럼 `forwardRef`로 감쌀 필요가 없다.

```tsx
function TextInput({ ref, ...rest }: React.ComponentProps<'input'>) {
  return <input ref={ref} {...rest} />
}

// 사용하는 쪽
const inputRef = useRef<HTMLInputElement>(null)
<TextInput ref={inputRef} placeholder="이름" />
```

`forwardRef`는 기존 코드에서 계속 동작하지만, React 19 발표 때 향후 deprecated·제거 대상으로 공지됐다. 새 컴포넌트는 `ref`를 prop으로 받는다. 클래스 컴포넌트에 준 `ref`는 여전히 props로 전달되지 않고 인스턴스를 가리킨다.

## setState 함수를 props로 넘길 때

자식이 부모의 state를 바꾸게 하려면 setter 함수를 props로 넘긴다. TypeScript에서 자식의 props 타입을 정하지 않으면 다음과 같은 에러가 난다.

```text
Type '{ setOpen: Dispatch<SetStateAction<boolean>>; }' is not assignable to type 'IntrinsicAttributes'.
```

"이 컴포넌트는 그런 prop을 받는다고 선언된 적이 없다"는 뜻이다. 자식의 props 타입에 setter의 타입 `Dispatch<SetStateAction<T>>`를 적어 주면 해결된다.

```tsx
// 부모
function CalendarPage() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>열기</button>
      {open && <CalendarDetail setOpen={setOpen} />}
    </>
  )
}

// 자식
type CalendarDetailProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function CalendarDetail({ setOpen }: CalendarDetailProps) {
  return <div onClick={() => setOpen(false)}>닫기</div>
}
```

setter를 그대로 넘기면 자식이 `setOpen(prev => !prev)`처럼 무엇이든 할 수 있다. 자식이 할 일이 "닫기" 하나뿐이라면 `onClose: () => void`처럼 **의도를 드러내는 콜백**을 넘기는 편이 타입도 단순하고 컴포넌트 재사용도 쉽다.

## 핵심 정리

- 컴포넌트 = props를 받아 엘리먼트를 반환하는 함수. 이름은 대문자로 시작.
- props는 부모 → 자식 단방향, 읽기 전용. 바뀌는 값은 state로.
- props 타입은 TypeScript로, 기본값은 기본 매개변수로 정한다. setter를 넘길 때 타입은 `Dispatch<SetStateAction<T>>`.
- `ref`도 일반 prop으로 받는다. 새 코드에는 `forwardRef`가 필요 없다.
