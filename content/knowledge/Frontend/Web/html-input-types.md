---
title: "HTML 입력 요소 치트시트"
concept: "Input Types"
summary: "input의 22가지 type과 label·select·textarea·fieldset·datalist까지, 폼에서 쓰는 입력 요소를 용도별로 정리."
tags: ["html", "form", "input", "frontend", "accessibility"]
source: other
date: "2026-10-12"
sources: ["https://webactually.com/2019/03/13/html5-%ec%9e%85%eb%a0%a5-%ec%96%91%ec%8b%9d-%ec%96%b4%eb%94%94%ec%af%a4-%ec%99%94%ec%9d%84%ea%b9%8c/"]
---

> 「type 고르기: 쓸 곳과 피할 곳」 부분은 Drew McLellan의 「HTML5 입력 양식: 어디쯤 왔을까?」(웹액츄얼리 번역, 2019.03)를 바탕으로 보강한 노트다.

`<input>`은 `type` 하나로 텍스트 칸, 체크박스, 날짜 선택기, 버튼까지 완전히 다른 컨트롤이 된다. 알맞은 type을 고르면 브라우저가 **형식 검증, 모바일 키보드, 선택 UI**를 공짜로 제공한다. 폼과 input의 기본 문법은 [[html|HTML 기초와 HTML5]] 노트에 있고, 여기서는 입력 요소를 용도별로 모았다.

## 텍스트 입력

| type | 용도 | 브라우저가 해 주는 것 |
| --- | --- | --- |
| `text` | 한 줄 텍스트 (기본값) | — |
| `email` | 이메일 주소 | 형식이 아니면 제출 불가, 모바일에서 `@` 키보드 |
| `password` | 비밀번호 | 입력값을 `•••`로 가림 |
| `tel` | 전화번호 | 숫자 키패드. 형식 검증은 하지 않으므로 필요하면 `pattern` 사용 |
| `url` | URL | `https://` 형식 검증, URL 키보드 |
| `search` | 검색어 | 입력값을 지우는 `×` 버튼, 검색 키보드 |
| `number` | 숫자 | 위아래 스핀 버튼, `min`·`max`·`step`으로 범위 제한 |

```html
<input type="email" name="email" placeholder="hello@world.com" required />
<input type="number" name="age" min="0" max="120" step="1" />
<input type="tel" name="phone" pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}" />
```

## 선택

| type | 용도 |
| --- | --- |
| `radio` | 그룹에서 **하나만** 선택. 같은 그룹은 같은 `name`을 준다 |
| `checkbox` | **여러 개** 선택 가능 |
| `range` | 슬라이더로 범위 안의 값 선택 (`min`·`max`·`step`) |
| `color` | 색상 선택기. 값은 `#rrggbb`, 기본값은 검정(`#000000`) |
| `file` | 파일 선택 버튼. `accept`로 형식 제한, `multiple`로 여러 개 |

```html
<input type="radio" name="flavor" value="chocolate" id="choco" />
<label for="choco">Chocolate</label>
<input type="radio" name="flavor" value="vanilla" id="vanilla" checked />
<label for="vanilla">Vanilla</label>

<input type="checkbox" name="fruit" value="apple" checked /> Apples
<input type="range" name="volume" min="0" max="100" value="65" />
<input type="file" name="avatar" accept="image/*" />
```

파일을 보내는 폼은 `<form method="post" enctype="multipart/form-data">`여야 한다.

## 날짜와 시간

| type | 선택 단위 | 값 형식 |
| --- | --- | --- |
| `date` | 연·월·일 | `2022-04-18` |
| `month` | 연·월 | `2022-04` |
| `week` | 연·주차 | `2022-W16` |
| `time` | 시·분 | `08:30` (24시간제) |
| `datetime-local` | 날짜 + 시간 | `2022-04-18T08:30` |

화면에 보이는 형식(`dd/mm/yyyy`, `AM/PM`)은 브라우저와 OS 언어 설정을 따르지만, **전송되는 값은 항상 위의 ISO 형식**이다. `min`·`max`로 선택 가능한 범위를 제한할 수 있다.

## 버튼

| type | 동작 |
| --- | --- |
| `submit` | 폼 값을 전송 |
| `reset` | 폼 값을 처음 상태로 되돌림 |
| `button` | 기본 동작 없음. JavaScript로 동작을 붙인다 |
| `image` | 이미지를 submit 버튼으로 사용 (`src`, `alt`). 클릭 좌표도 함께 전송 |

`<input type="submit">`보다 `<button type="submit">`이 아이콘 등 내용을 자유롭게 넣을 수 있어 더 많이 쓰인다. `<button>`의 기본 type이 `submit`이라서, 폼 안의 일반 버튼에는 `type="button"`을 꼭 적어야 의도치 않은 제출을 막는다.

## 숨김 값

`type="hidden"`은 화면에 보이지 않고 값만 폼과 함께 전송된다. 수정 중인 글의 ID, CSRF 토큰 같은 메타데이터를 실어 보낼 때 쓴다.

```html
<input type="hidden" name="postId" value="42" />
```

사용자에게 안 보일 뿐 개발자 도구로 얼마든지 볼 수 있고 바꿀 수도 있다. 서버는 hidden 값을 믿지 말고 검증해야 한다. (CSRF 토큰은 [[web-security|웹 보안: CSRF와 XSS]] 참고)

## input이 아닌 입력 요소

### label

`for`와 input의 `id`를 연결하면 label을 눌러도 input이 선택되고, 스크린 리더가 label을 읽어 준다. input을 label 안에 넣어도 같은 효과다.

```html
<label for="name">이름</label>
<input id="name" name="name" />

<label><input type="checkbox" name="dm" /> Open DM</label>
```

### select와 option: 드롭다운

```html
<select name="option">
  <option value="1">Option 1</option>
  <option value="2" selected>Option 2</option>
  <option value="3">Option 3</option>
</select>
```

`multiple`을 주면 여러 개를 고를 수 있고, `<optgroup label="...">`로 옵션을 묶을 수 있다.

### textarea: 여러 줄 입력

```html
<textarea name="bio" rows="4" cols="40">hello,
follow @reactive_dude</textarea>
```

기본값은 `value` 속성이 아니라 **태그 사이의 내용**이다.

### fieldset과 legend: 관련 입력 묶기

```html
<fieldset>
  <legend>User Profile</legend>
  <input name="username" placeholder="username" />
  <input name="bio" placeholder="bio" />
  <label><input type="checkbox" name="dm" /> Open DM</label>
</fieldset>
```

`legend`가 그룹의 제목이 되어 스크린 리더가 함께 읽어 준다. `fieldset`에 `disabled`를 주면 안의 입력이 한꺼번에 비활성화된다.

### datalist: 입력 추천 목록

input의 `list` 속성과 datalist의 `id`를 연결하면, 자유롭게 입력할 수 있으면서도 미리 정한 후보를 추천해 준다. select와 달리 **목록에 없는 값도 입력 가능**하다.

```html
<input list="browsers" name="browser" />
<datalist id="browsers">
  <option value="Chrome"></option>
  <option value="Firefox"></option>
  <option value="Safari"></option>
</datalist>
```

## type 고르기: 쓸 곳과 피할 곳

지원하지 않는 type은 `text`로 대체되므로 써서 손해 볼 일은 거의 없다. 다만 type마다 맞는 쓰임이 있다.

| type | 쓸 곳 | 피할 곳·주의 |
| --- | --- | --- |
| `tel` | 모든 전화번호. 숫자 키패드와 연락처 자동 완성이 붙는다 | 형식 검증은 없다. 국가마다 형식이 달라 `pattern`은 꼭 필요할 때만 |
| `email` | 모든 이메일. 브라우저 검증이 손으로 짠 정규식보다 정확하다 | 여러 주소를 받을 때는 `multiple` |
| `url` | 완전한 절대 URL(`https://…`)을 받을 때 | 도메인만, 경로만 받는 칸에는 맞지 않는다 |
| `number` | 수량·나이처럼 **크기를 비교하는 수** | 우편번호·카드 번호·인증 코드처럼 숫자로 된 문자열에는 `type="text" inputmode="numeric"` |
| `range` | 정확한 값이 필요 없는 정도 표시(추천 의향 등) | 정확한 값이 필요하면 `number` |
| `search` | OS 검색창 모양과 지우기 버튼을 그대로 쓸 때 | 의미 차이는 없다. 검색 영역 자체는 `<search>` 요소로 감싼다 |
| `color` | 테마·CMS 색 고르기. 주요 브라우저 모두 색 선택기를 띄운다 | 일반 사용자에게 16진수 값을 보여 주지 않도록 미리보기를 함께 둔다 |
| `date` 등 | 가까운 날짜 고르기(예약일). 주요 브라우저 모두 선택기를 띄운다 | 생년월일처럼 먼 날짜는 달력 선택이 번거롭다. 연·월·일 세 칸이나 형식을 밝힌 텍스트 입력이 낫다. 선택기 모양과 접근성이 브라우저마다 다르다 |

입력 type과 함께 `autocomplete`(예: `email`, `tel`, `bday`, `one-time-code`)를 지정하면 브라우저 자동 완성이 정확해진다.

## 핵심 정리

- 값의 성격에 맞는 type을 고르면 검증, 모바일 키보드, 선택 UI를 브라우저가 대신 해 준다.
- radio는 같은 `name`으로 묶어야 하나만 선택된다.
- 날짜·시간 값은 화면 표시와 상관없이 ISO 형식으로 전송된다.
- `<button>`의 기본 type은 `submit`이다.
- hidden 값은 숨겨질 뿐 안전하지 않다.
- 모든 입력에는 `label`을 연결하고, 관련 입력은 `fieldset`으로 묶는다.

관련 노트: [[form-usability|더 나은 폼을 만드는 팁]], [[html|HTML 기초와 HTML5]], [[respect-browser-defaults|브라우저 기본 동작을 존중하기]]
