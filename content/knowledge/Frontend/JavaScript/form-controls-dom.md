---
title: "폼 컨트롤과 포커스 이벤트"
concept: "Form Controls DOM"
summary: "JavaScript로 폼을 다루는 DOM API. document.forms와 form.elements로 컨트롤 찾기(라디오 묶음, fieldset, form.name 단축 표기의 함정), value·checked·select의 옵션 다루기, focus·blur와 버블링하는 focusin·focusout, change·input·beforeinput·클립보드 이벤트의 차이, submit 이벤트와 Enter 제출, submit()과 requestSubmit(), FormData를 정리한다."
tags: ["javascript", "dom", "form", "event", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/form-elements", "https://ko.javascript.info/focus-blur", "https://ko.javascript.info/events-change-input", "https://ko.javascript.info/forms-submit", "https://wesbos.com/javascript/05-events/prevent-default-and-form-events", "https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit", "https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「폼 프로퍼티와 메서드」, 「focus와 blur」, 「이벤트: change, input, cut, copy, paste」, 「submit 이벤트와 메서드」 글을 바탕으로, 최신 API는 MDN으로 확인해 재구성한 노트다. 제출 처리 예는 Wes Bos의 「[Beginner JavaScript](https://wesbos.com/javascript)」 강의 노트에서 옮겨 왔다.

폼을 어떤 요소로 짤지는 [[html-input-types|HTML 입력 요소 치트시트]]에, 사용자가 편한 폼의 원칙은 [[form-usability|더 나은 폼을 만드는 팁]]에, 포커스를 어디로 옮겨야 하는지는 [[keyboard-accessibility|키보드 접근성과 포커스 관리]]에 있다. 이 노트는 **JavaScript에서 폼 컨트롤을 찾고, 값을 읽고 쓰고, 그 이벤트를 받는 API**만 다룬다.

## 폼과 컨트롤 찾기

```html
<form name="signup">
  <input name="email">
  <input type="radio" name="plan" value="free" checked>
  <input type="radio" name="plan" value="pro">
  <fieldset name="address"><input name="city"></fieldset>
</form>
```

```javascript
const form = document.forms.signup        // 또는 document.forms[0]
form.elements.email                       // <input name="email">
form.elements.plan                        // 같은 name이 여럿이면 RadioNodeList
form.elements.plan.value                  // 'free' (선택된 라디오의 value)
form.elements.address.elements.city       // fieldset도 elements를 가진다
form.elements.email.form === form         // 컨트롤에서 폼으로 거꾸로
```

| API | 내용 |
| --- | --- |
| `document.forms` | 문서의 모든 폼. `name`과 순서로 꺼내는 이름 있는 컬렉션 |
| `form.elements` | 폼의 컨트롤 전부. **태그가 얼마나 깊이 중첩됐든** 한 단계로 접근한다 |
| `fieldset.elements` | 그 `fieldset` 안의 컨트롤. 폼 안의 작은 폼처럼 쓴다 |
| `control.form` | 컨트롤이 속한 폼. 폼 밖의 컨트롤도 `form="id"` 속성으로 연결할 수 있다 |

`form.email`처럼 `elements`를 빼고 써도 된다. 하지만 두 가지 함정이 있다.

- 컨트롤 이름이 `submit`·`action`·`name`처럼 **폼 자체의 속성·메서드와 겹치면 그것을 가린다.** `<input name="submit">`이 있으면 `form.submit()`이 함수가 아니게 된다.
- 컨트롤의 `name`을 바꿔도 `form.옛이름`으로 계속 접근된다. `form.elements`는 바뀐 이름만 안다.

그래서 `form.elements.이름`으로 쓴다.

## 값 읽고 쓰기

| 컨트롤 | 값 |
| --- | --- |
| `input`, `textarea` | `value`(문자열). 숫자·날짜 입력은 `valueAsNumber`·`valueAsDate`도 있다 |
| 체크박스, 라디오 | `checked`(불리언). 라디오 묶음은 `form.elements.이름.value` |
| `select` | `value`, `selectedIndex`, `options`(모든 `<option>`), `selectedOptions`(선택된 것들) |

- `textarea`의 값은 `textarea.value`로 읽는다. `innerHTML`은 처음 HTML에 적힌 내용일 뿐 입력을 반영하지 않는다.
- 사용자가 바꾼 값은 `value` **속성(property)** 에만 있다. `getAttribute('value')`는 처음 HTML 값을 그대로 준다. 이 차이는 [[dom-manipulation|DOM 조작]]의 속성·어트리뷰트 동기화에 있다.
- `select`를 고르는 방법은 셋이다. `select.value = 'pro'`, `select.selectedIndex = 1`, 해당 `option.selected = true`. `multiple`이면 마지막 방법으로 여러 개를 켜고 끈다.

```javascript
const chosen = Array.from(select.selectedOptions, (o) => o.value) // multiple의 선택값 배열

select.append(new Option('프로', 'pro'))             // <option value="pro">프로</option>
select.append(new Option('팀', 'team', true, true))  // defaultSelected, selected
```

`new Option(text, value, defaultSelected, selected)`의 셋째 인자는 HTML `selected` 속성(초기값)을, 넷째 인자는 실제 선택 상태를 정한다. 만든 option은 `selected`·`index`·`text` 속성을 가진다.

## 포커스 이벤트

| 이벤트 | 언제 | 버블링 |
| --- | --- | --- |
| `focus` | 포커스를 받을 때 | 안 함 |
| `blur` | 포커스를 잃을 때 | 안 함 |
| `focusin` | `focus`와 같은 때 | **함** |
| `focusout` | `blur`와 같은 때 | **함** |

포커스는 「여기에 입력할 준비」, 포커스 잃음은 「입력을 마쳤다」는 신호다. 그래서 `blur`에서 값을 검사하고 `focus`에서 오류 표시를 지우는 식으로 쓴다.

```javascript
email.addEventListener('blur', () => {
  if (!email.validity.valid) error.textContent = '이메일 형식을 확인해 주세요.'
})
email.addEventListener('focus', () => { error.textContent = '' })
```

- `blur`는 포커스를 **잃은 뒤에** 오므로 `preventDefault()`로 포커스 이동을 막을 수 없다. `blur`에서 `focus()`를 다시 불러 붙잡아 두는 방식은 사용자를 가두므로 피한다.
- 포커스는 스크립트 때문에도 사라진다. `alert()`가 뜨면 포커스가 경고창으로 갔다가(`blur`) 닫으면 돌아온다(`focus`). 포커스된 요소를 DOM에서 빼면 포커스가 사라지고 다시 넣어도 돌아오지 않는다. 사용자가 일으킨 포커스 변화만 잡으려면 스스로 이런 일을 만들지 않는다.
- `mousedown`의 기본 동작이 포커스 이동이다. 거기서 `preventDefault()`하면 클릭으로는 포커스되지 않는다(Tab으로는 된다).

### 메서드와 현재 포커스

```javascript
input.focus()                       // 포커스 주기
input.focus({ preventScroll: true }) // 포커스는 주되 화면은 스크롤하지 않기
input.blur()                        // 포커스 빼기
document.activeElement               // 지금 포커스된 요소(없으면 body)
form.matches(':focus-within')        // 폼 안 어딘가에 포커스가 있나
```

`div`·`span`처럼 상호작용 요소가 아닌 것은 기본으로 포커스되지 않는다. `tabindex="-1"`을 주면 스크립트로만 포커스할 수 있고, `tabindex="0"`이면 문서 순서대로 Tab 순서에 들어간다. 양수 `tabindex`는 순서를 뒤틀므로 쓰지 않는다. JavaScript에서는 `el.tabIndex` 속성으로 같은 일을 한다. 자세한 규칙은 [[keyboard-accessibility#tabindex|키보드 접근성]]에 있다.

### 폼 전체에서 포커스 받기

`focus`·`blur`는 버블링하지 않아 `form.onfocus`는 안쪽 입력이 포커스돼도 실행되지 않는다. 부모 하나로 받는 방법은 둘이다.

```javascript
form.addEventListener('focusin', () => form.classList.add('focused'))   // 1. 버블링하는 쌍
form.addEventListener('focusout', () => form.classList.remove('focused'))

form.addEventListener('focus', onFocus, true)                           // 2. 캡처 단계에서
```

`focusin`·`focusout`은 `on<event>` 속성으로는 받을 수 없어 `addEventListener`를 쓴다. 모양만 바꾸는 일이면 CSS `:focus-within`이 더 간단하다.

## change와 input

| 이벤트 | 언제 | 취소 |
| --- | --- | --- |
| `beforeinput` | 값이 바뀌기 **직전**. `inputType`(`insertText`, `deleteContentBackward`, `insertFromPaste` 등)과 `data`를 준다 | 대부분 `preventDefault()`로 막을 수 있다 |
| `input` | 값이 바뀔 때마다. 키보드·붙여넣기·음성 입력·자동 완성 등 **수단과 상관없이** | 이미 바뀐 뒤라 막을 수 없다 |
| `change` | 값 변경이 **확정**될 때. 텍스트 입력은 포커스를 잃을 때, 체크박스·라디오·`select`는 바꾸는 즉시 | |
| `cut`·`copy`·`paste` | 잘라내기·복사·붙여넣기 | `preventDefault()`로 막을 수 있다 |

- 입력할 때마다 반응(실시간 검색, 글자 수)은 `input`, 다 고친 뒤 한 번(저장, 서버 검증)은 `change`다. 실시간 요청은 [[debounce-throttle|디바운스]]로 줄인다.
- 방향키처럼 값을 바꾸지 않는 키는 `input`을 일으키지 않는다.
- 특정 문자를 거르려면 키 이벤트가 아니라 `beforeinput`에서 `event.data`를 보고 막는다. 붙여넣기까지 함께 걸러진다. 그래도 걸러지지 않은 값은 `input`에서 고친다.
- 한국어 IME 조합 중에는 `input`이 글자마다 여러 번 일어나고 `event.isComposing`이 `true`다. 조합이 끝난 값만 쓰려면 `compositionend`를 함께 본다.

### 클립보드 이벤트

```javascript
input.addEventListener('paste', (e) => {
  const text = e.clipboardData.getData('text/plain')
  if (/\s/.test(text)) {
    e.preventDefault()
    input.setRangeText(text.replace(/\s/g, ''), input.selectionStart, input.selectionEnd, 'end')
  }
})
```

- `event.clipboardData`로 붙여넣는 데이터를 읽거나, `copy`에서 `setData()`로 복사될 내용을 바꾼다. 텍스트뿐 아니라 파일도 담긴다.
- 클립보드는 운영체제 전역이라 브라우저는 사용자 동작 안에서만 읽기·쓰기를 허용한다. 스크립트로 만든(`dispatchEvent`) 클립보드 이벤트로는 실제 클립보드에 접근할 수 없다.
- 이벤트 밖에서 복사 버튼을 만들 때는 비동기 Clipboard API `navigator.clipboard.writeText()`·`readText()`를 쓴다. 보안 컨텍스트(HTTPS)와 사용자 동작·권한이 필요하다.
- 복사를 막아 콘텐츠를 지키려는 시도는 소스 보기로 쉽게 우회되고 정상 사용자만 불편하게 한다.

## 제출

폼은 **제출 버튼 클릭**이나 **입력란에서 Enter**로 제출되고, 둘 다 폼의 `submit` 이벤트를 일으킨다. 그래서 버튼의 `click`이 아니라 폼의 `submit`을 듣는다.

```javascript
form.addEventListener('submit', (event) => {
  event.preventDefault()                         // 페이지 이동(새로고침) 막기
  const data = new FormData(event.currentTarget) // name 속성 기준으로 값 수집
  const plan = data.get('plan')
  const agreed = event.currentTarget.elements.agree.checked
  console.log(event.submitter?.name)             // 어느 제출 버튼이었나
  event.currentTarget.reset()                    // 입력 비우기
})
```

- 입력란에서 Enter로 제출하면 그 폼의 첫 제출 버튼에 **`click` 이벤트가 만들어진다.** 클릭하지 않았는데 버튼의 `click` 리스너가 실행되는 이유다.
- `FormData`는 `name`이 있는 컨트롤만 모은다. `disabled` 컨트롤과 체크되지 않은 체크박스는 빠진다. `Object.fromEntries(data)`로 객체로 바꾸고, 같은 이름이 여럿이면 `data.getAll()`을 쓴다.
- 필수·형식 검사는 `required`·`type="email"`·`pattern` 같은 HTML 검증에 먼저 맡긴다. HTML 검증이 통과해야 `submit` 이벤트가 일어나므로, 그것으로 안 되는 규칙만 `submit`에서 검사해 `preventDefault()`로 막는다.

### 스크립트로 제출하기

| 메서드 | `submit` 이벤트 | HTML 검증 |
| --- | --- | --- |
| `form.requestSubmit(button?)` | 일어난다 | 한다 |
| `form.submit()` | **일어나지 않는다** | 하지 않는다 |

`submit()`은 스크립트가 할 일을 다 했다고 보고 곧바로 보낸다. 사용자가 제출한 것과 똑같이 동작해야 하면 `requestSubmit()`을 쓴다. 넘긴 버튼은 `event.submitter`가 된다.

```javascript
const f = document.createElement('form') // 페이지 밖으로 보내는 폼을 만들어 제출하기
f.action = 'https://example.com/search'
f.method = 'GET'
f.innerHTML = '<input name="q" value="테스트">'
document.body.append(f) // 제출하려면 문서 안에 있어야 한다
f.submit()
```

페이지 이동 없이 보내려면 `fetch(form.action, { method: 'POST', body: new FormData(form) })`를 쓴다([[ajax|AJAX와 HTTP 요청]]).

## 정리

- 컨트롤은 `form.elements.이름`으로 찾는다. 같은 이름의 라디오는 묶음이 되고 `.value`가 선택값이다.
- 사용자가 바꾼 값은 `value`·`checked`·`selectedOptions` 속성에 있다. 어트리뷰트는 초기값이다.
- `focus`·`blur`는 버블링하지 않는다. 부모에서는 `focusin`·`focusout`이나 캡처로, 모양만이면 `:focus-within`으로.
- 매번은 `input`, 확정은 `change`, 막아야 하면 `beforeinput`.
- 폼은 `submit`으로 받고, 스크립트 제출은 이벤트와 검증이 필요하면 `requestSubmit()`이다.

관련 노트: [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]], [[form-usability|더 나은 폼을 만드는 팁]], [[html-input-types|HTML 입력 요소 치트시트]], [[keyboard-accessibility|키보드 접근성과 포커스 관리]], [[ui-input-events|마우스·포인터·키보드 이벤트]], [[selection-and-range|Selection과 Range]], [[ajax|AJAX와 HTTP 요청]]
