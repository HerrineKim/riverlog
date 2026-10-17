---
title: "폼과 제어 컴포넌트"
concept: "Controlled Component"
summary: "입력값을 React state로 관리하는 제어 컴포넌트, 여러 입력 다루기, 파생 값 계산, 그리고 React 19의 폼 액션(useActionState·useFormStatus)."
tags: ["react", "form", "state", "frontend"]
source: til
date: "2026-10-13"
sources: ["https://react.dev/blog/2024/12/05/react-19", "https://react.dev/reference/react/useActionState"]
---

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

## 요소별·여러 입력 다루기

| 상황 | HTML | React |
| --- | --- | --- |
| `textarea` | 자식 텍스트가 값 | `<textarea value={text} onChange={...} />` |
| `select` | 선택할 `<option>`에 `selected` | `<select value={fruit} onChange={...}>`. `multiple`이면 `value`에 배열 |
| checkbox | `checked` 속성 | `checked={state}`, 값은 `e.target.checked` |
| `input type="file"` | — | 값이 읽기 전용이라 **비제어**. `ref`나 `e.target.files`로 꺼낸다 |
| 여러 입력 | — | 객체 state 하나 + 각 입력의 `name` + 계산된 속성명으로 핸들러 하나에서 처리 |

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
