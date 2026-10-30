---
title: "폼과 제어 컴포넌트"
concept: "Controlled Component"
summary: "입력값을 React state로 관리하는 제어 컴포넌트, 여러 입력 다루기, 파생 값 계산, 그리고 React 19의 폼 액션(useActionState·useFormStatus)."
tags: ["react", "form", "state", "frontend"]
source: til
date: "2026-10-21"
sources: ["https://react.dev/blog/2024/12/05/react-19", "https://react.dev/reference/react/useActionState", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/Controlled%20components.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/map%20function%20%EC%82%AC%EC%9A%A9%EC%8B%9C%2C%20radio%20input%20%EC%B2%AB%EB%B2%88%EC%A7%B8%20input%EC%9D%84%20default%20checked%20%EA%B0%92%EC%9C%BC%EB%A1%9C%20%ED%95%98%EB%8A%94%EB%B2%95.md", "https://prepare-frontend-interview.vercel.app/react"]
---

> 「[Frontend_TIL: Controlled components](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/Controlled%20components.md)」와 「[map function 사용시 radio input 첫번째를 default checked로 하는법](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/map%20function%20%EC%82%AC%EC%9A%A9%EC%8B%9C%2C%20radio%20input%20%EC%B2%AB%EB%B2%88%EC%A7%B8%20input%EC%9D%84%20default%20checked%20%EA%B0%92%EC%9C%BC%EB%A1%9C%20%ED%95%98%EB%8A%94%EB%B2%95.md)」을 바탕으로 보강했다.
> 「[프론트엔드 면접 준비: React](https://prepare-frontend-interview.vercel.app/react)」 정리로 제어·비제어의 장단점을 보강했다.

HTML의 `<input>`, `<textarea>`, `<select>`는 원래 스스로 값을 기억한다. React에서는 보통 이 값을 state로 옮겨, React가 값을 통제하게 만든다. 이렇게 값이 React의 통제를 받는 폼 요소를 **제어 컴포넌트(Controlled Component)** 라고 한다.

## 제어 컴포넌트

```jsx
function NameForm() {
  const [value, setValue] = useState('')

  const handleChange = (event) => {
    setValue(event.target.value.toUpperCase()) // 입력을 가로채 가공할 수 있다
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    alert(`입력한 이름: ${value}`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">이름</label>
      <input id="name" type="text" value={value} onChange={handleChange} />
      <button type="submit">제출</button>
    </form>
  )
}
```

- `value={state}`로 값을 내려 주고, `onChange`에서 state를 갱신한다.
- 값이 state에 있으므로 입력을 **직접 제어**할 수 있다: 대문자 변환, 길이 제한, 실시간 검증, 다른 곳에서 값 초기화(`setValue('')`) 등.
- `onChange` 없이 `value`만 주면 입력이 막힌다(읽기 전용 경고). 일부러 수정 가능하게 열어 두려면 `value`에 `undefined`나 `null`을 준다.
- React의 `onChange`는 DOM의 `change`(포커스가 떠날 때)가 아니라 **`input` 이벤트처럼 키를 칠 때마다** 발생한다. 그래서 매 입력이 state로 바로 들어간다.

### 비제어 컴포넌트: 초기값만 주기

값을 state로 옮기지 않고 DOM이 기억하게 두면 **비제어 컴포넌트(Uncontrolled Component)**다. 초기값은 `value`·`checked` 대신 `defaultValue`·`defaultChecked`로 준다. 한 번만 적용되고 이후 값은 사용자가 바꾼다. 값은 제출할 때 `FormData`나 `ref`로 읽는다.

```jsx
// map으로 만든 라디오 묶음에서 첫 번째만 처음에 선택
{types.map((type, i) => (
  <label key={type}>
    <input type="radio" name="md" value={type} defaultChecked={i === 0} />
    {type}
  </label>
))}
```

`checked={i === 0}`으로 쓰면 제어 컴포넌트가 되어 `onChange` 없이는 다른 항목을 고를 수 없다. 한 요소에 `value`와 `defaultValue`를 함께 주지 않는다.

| | 제어 | 비제어 |
| --- | --- | --- |
| 값의 주인 | React state | DOM |
| 값 읽기 | 렌더링 중 언제든 state로 | 제출할 때 `FormData`·`ref`로 |
| 리렌더링 | 키를 칠 때마다 | 입력 중에는 없다 |
| 잘 맞는 일 | 실시간 검증, 입력 가공, 값에 따라 바뀌는 UI(버튼 활성화, 다른 칸 채우기) | 제출 때 한 번만 값을 쓰는 폼, 파일 입력(`<input type="file">`은 늘 비제어), 입력이 많아 리렌더링이 부담인 폼 |

기본은 제어 컴포넌트다. 입력이 많은 폼은 비제어 방식을 바탕으로 한 [[react-hook-form|react-hook-form]]이 리렌더링을 줄여 주고, 아래 폼 액션도 `FormData`를 받으므로 비제어 입력과 잘 맞는다.

## 요소별·여러 입력 다루기

| 상황 | HTML | React |
| --- | --- | --- |
| `textarea` | 자식 텍스트가 값 | `<textarea value={text} onChange={...} />` |
| `select` | 선택할 `<option>`에 `selected` | `<select value={fruit} onChange={...}>`. `multiple`이면 `value`에 배열 |
| checkbox | `checked` 속성 | `checked={state}`, 값은 `e.target.checked` |
| `input type="file"` | - | 값이 읽기 전용이라 **비제어**. `ref`나 `e.target.files`로 꺼낸다 |
| 여러 입력 | - | 객체 state 하나 + 각 입력의 `name` + 계산된 속성명으로 핸들러 하나에서 처리 |

```jsx
const [form, setForm] = useState({ name: '', guests: 2, isGoing: true })

const handleChange = (e) => {
  const { name, type, value, checked } = e.target
  setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
}
// <input name="guests" type="number" value={form.guests} onChange={handleChange} />
```

입력마다 state·핸들러 쌍이 반복되면 [[hooks|커스텀 훅 useInput]]으로 뽑을 수 있다. 검증까지 필요한 실무 폼에서는 입력마다 리렌더링하지 않는 [[react-hook-form|react-hook-form]] 같은 라이브러리를 많이 쓴다.

## 폼 액션 (React 19)

React 19부터 `<form>`의 `action`에 **함수**를 넘길 수 있다. 제출하면 React가 `FormData`를 만들어 그 함수(Action)를 부르고, 대기 상태·에러·낙관적 업데이트를 훅으로 다룬다. 입력값을 state로 옮기지 않는 **비제어 방식**이라 제출 시점의 값만 필요할 때 코드가 짧다.

```jsx
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus() // 가장 가까운 부모 <form>의 제출 상태
  return <button disabled={pending}>{pending ? '저장 중…' : '저장'}</button>
}

function NameForm() {
  const [error, formAction, isPending] = useActionState(async (prevState, formData) => {
    const result = await updateName(formData.get('name'))
    return result.ok ? null : result.message // 반환값이 다음 state
  }, null)

  return (
    <form action={formAction}>
      <input name="name" />
      <SubmitButton />
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
```

| API | 역할 |
| --- | --- |
| `<form action={fn}>` | 제출 시 `fn(formData)` 실행. `preventDefault`가 필요 없고, 성공하면 비제어 입력을 자동으로 비운다 |
| `useActionState(fn, initial)` | `[state, formAction, isPending]`. Action의 반환값을 state로 관리 |
| `useFormStatus()` | 부모 폼의 `pending`·`data`를 props 전달 없이 읽는다. 버튼 같은 디자인 시스템 컴포넌트용 |
| `useOptimistic` | 요청이 끝나기 전에 화면에 먼저 반영하고, 끝나면 실제 값으로 돌아간다 |

- 입력마다 값을 가공·검증해야 하면 제어 컴포넌트, 제출할 때만 값이 필요하면 폼 액션이 맞다.
- Next.js 같은 프레임워크에서는 `action`에 서버 함수(`'use server'`)를 그대로 넘길 수 있다.

## 파생 값은 state로 두지 않는다

분·시간 변환기처럼 두 입력창이 같은 값을 다른 단위로 보여 줄 때, state는 하나만 두고 나머지는 **렌더링할 때 계산**한다. 파생 값을 별도 state로 두면 둘을 함께 갱신해야 하고 언젠가 어긋난다.

```jsx
const [minutes, setMinutes] = useState(0)
const hours = Math.round(minutes / 60) // state가 아니라 계산

<input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
<input type="number" value={hours} disabled />
```

## 정리

- 제어 컴포넌트 = `value`는 state에서, 변경은 `onChange`로 state에.
- `textarea`, `select`도 `value`로 통일해서 다룬다. 파일 입력만 비제어.
- 여러 입력은 객체 state + `name` + 계산된 속성명으로 한 핸들러에서 처리.
- 화면에 보이는 파생 값은 state로 따로 두지 말고 렌더링 중에 계산한다.
- 제출 시점의 값만 필요하면 React 19의 폼 액션(`action={fn}` + `useActionState`·`useFormStatus`)을 쓴다.

관련 노트: [[html-input-types|HTML 입력 요소 치트시트]], [[state|State]], [[react-hook-form|react-hook-form과 MUI Select]], [[constraint-validation|제약 검증: required·pattern·ValidityState]]
