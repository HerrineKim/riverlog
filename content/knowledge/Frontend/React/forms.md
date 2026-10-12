---
title: "폼과 제어 컴포넌트"
concept: "Controlled Component"
summary: "입력값을 React state로 관리하는 제어 컴포넌트, 여러 입력 다루기, 단위 변환기 실습."
tags: ["react", "form", "state", "frontend"]
source: til
---

HTML의 `<input>`, `<textarea>`, `<select>`는 원래 **스스로** 값을 기억한다. React에서는 보통 이 값을 state로 옮겨, **React가 값을 통제**하게 만든다. 이렇게 값이 React의 통제를 받는 폼 요소를 **제어 컴포넌트(Controlled Component)** 라고 한다.

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

## 폼 요소별 차이

| 요소 | HTML | React |
| --- | --- | --- |
| `textarea` | 자식 텍스트가 값 | `value` 속성으로 값 지정 |
| `select` | 선택할 `<option>`에 `selected` | `<select value={...}>`로 선택값 지정 |
| `input type="file"` | — | 값이 읽기 전용이라 **비제어 컴포넌트**로 다룬다 |

```jsx
<textarea value={text} onChange={(e) => setText(e.target.value)} />

<select value={fruit} onChange={(e) => setFruit(e.target.value)}>
  <option value="apple">사과</option>
  <option value="banana">바나나</option>
</select>
```

`select`에 `multiple`을 주면 `value`에 배열을 넘길 수 있다. 파일 입력은 사용자가 고른 파일을 서버에 업로드하거나 File API로 읽을 때 쓰며, 값은 `ref`나 이벤트의 `e.target.files`로 꺼낸다.

## 여러 입력 다루기

입력마다 state를 따로 두거나, 하나의 객체 state에 `name` 속성으로 구분해 담는다.

```jsx
function Reservation() {
  const [form, setForm] = useState({ name: '', guests: 2, isGoing: true })

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value, // 계산된 속성명
    }))
  }

  return (
    <form>
      <input name="name" value={form.name} onChange={handleChange} />
      <input name="guests" type="number" value={form.guests} onChange={handleChange} />
      <input name="isGoing" type="checkbox" checked={form.isGoing} onChange={handleChange} />
    </form>
  )
}
```

입력이 많고 반복되면 [커스텀 훅 useInput](/knowledge/dictionary/frontend/react/hooks)으로 state와 핸들러 쌍을 뽑아내는 방법도 있다. 검증까지 필요한 실무 폼에서는 입력마다 리렌더링하지 않는 [react-hook-form](/knowledge/dictionary/frontend/react/react-hook-form) 같은 라이브러리를 많이 쓴다.

## 실습: 분·시간 변환기

state 하나로 두 입력창을 연동하고, 버튼으로 입력 방향을 뒤집는 예제.

```jsx
function MinutesToHours() {
  const [amount, setAmount] = useState(0)
  const [inverted, setInverted] = useState(false)

  const onChange = (event) => setAmount(event.target.value)
  const reset = () => setAmount(0)
  const onInvert = () => {
    reset()
    setInverted((current) => !current)
  }

  return (
    <div>
      <label htmlFor="minutes">Minutes</label>
      <input
        id="minutes"
        type="number"
        value={inverted ? amount * 60 : amount}
        onChange={onChange}
        disabled={inverted}
      />

      <label htmlFor="hours">Hours</label>
      <input
        id="hours"
        type="number"
        value={inverted ? amount : Math.round(amount / 60)}
        onChange={onChange}
        disabled={!inverted}
      />

      <button onClick={reset}>Reset</button>
      <button onClick={onInvert}>{inverted ? 'Turn back' : 'Invert'}</button>
    </div>
  )
}
```

- 실제로 저장하는 값은 `amount` 하나이고, 화면에 보이는 두 값은 **렌더링할 때 계산**한다. 파생 값을 별도 state로 두지 않는 것이 핵심이다.
- `<label for>`는 JSX에서 `htmlFor`, `class`는 `className`.
- 같은 구조로 `KmToMiles`를 만들고, 상위 `App`에서 `<select>` 값에 따라 둘 중 하나를 조건부 렌더링하면 "Super Converter"가 된다.

```jsx
function App() {
  const [index, setIndex] = useState('-1')
  return (
    <div>
      <h1>Super Converter</h1>
      <select value={index} onChange={(e) => setIndex(e.target.value)}>
        <option value="-1">Select Unit</option>
        <option value="0">Minutes & Hours</option>
        <option value="1">Km & Miles</option>
      </select>
      <hr />
      {index === '0' ? <MinutesToHours /> : index === '1' ? <KmToMiles /> : null}
    </div>
  )
}
```

## 핵심 정리

- 제어 컴포넌트 = `value`는 state에서, 변경은 `onChange`로 state에.
- `textarea`, `select`도 `value`로 통일해서 다룬다. 파일 입력만 비제어.
- 여러 입력은 객체 state + `name` + 계산된 속성명으로 한 핸들러에서 처리.
- 화면에 보이는 파생 값은 state로 따로 두지 말고 렌더링 중에 계산한다.

관련 노트: [[html-input-types|HTML 입력 요소 치트시트]]
