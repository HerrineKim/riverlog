---
title: "폼 스타일링"
concept: "Form Styling"
summary: "폼 컨트롤은 기본 크기가 작고 브라우저마다 모양이 다르다. 글자 1rem 이상(iOS 확대 방지), 보이는 테두리, 48px 탭 영역, 한 열 배치로 기본을 잡고, appearance: none과 배경 화살표로 select를, 접근성 트리를 지키는 숨김 기법으로 체크박스·라디오를 꾸민다. accent-color, field-sizing: content, 실험 단계의 customizable select(appearance: base-select), pointer 미디어 쿼리와 env()까지 정리한다."
tags: ["frontend", "css", "form", "ux", "accessibility"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/forms/styling", "https://web.dev/learn/forms/styling-form-controls", "https://web.dev/learn/forms/design-basics", "https://web.dev/learn/forms/fields", "https://web.dev/learn/forms/cross-platform-testing", "https://web.dev/articles/sign-in-form-best-practices", "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/appearance", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select", "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/accent-color", "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing"]
---

> web.dev의 「[Learn Forms](https://web.dev/learn/forms)」 강좌 중 「Styling forms」, 「Styling form controls」, 「Design basics」, 「Test forms across devices and platforms」 모듈을 바탕으로, CSS 속성의 지원 상태는 MDN으로 확인해 재구성한 노트다.

## 출발점: 꾸미되 정체를 바꾸지 않는다

**체크박스는 체크박스처럼, 입력 칸은 입력 칸처럼, 버튼은 버튼처럼 보여야 한다.** 스타일은 알아보기 쉽게 하는 수단이지 다른 물건으로 바꾸는 수단이 아니다. 링크처럼 생긴 것은 이동하고, 버튼처럼 생긴 것은 동작한다.

언제나 표준 요소(`<input>`, `<select>`, `<textarea>`, `<button>`)를 꾸민다. `<div>`로 다시 만들면 키보드 조작, 폼 제출, 자동 완성, 스크린 리더 지원을 모두 잃는다. 순서는 **내용 → 시맨틱 HTML → CSS → JavaScript**다([[css-progressive-enhancement|CSS 점진적 향상: 폴백과 피처 쿼리]]).

## 기본 다듬기

| 항목 | 기준 | 이유 |
| --- | --- | --- |
| 글자 크기 | 컨트롤에 **1rem(대개 16px) 이상**. 모바일은 더 크게(약 20px) | 기본값이 작다. 16px 미만이면 iOS Safari가 포커스 때 화면을 확대한다 |
| 단위 | `font-size`는 `rem`·`em`, `line-height`는 단위 없는 수(`1.5`) | 사용자 글꼴 설정을 따르고, 글자 크기에 맞춰 줄 높이가 함께 커진다 |
| 테두리 | `border: 1px solid` 같은 분명한 선. 흰 배경이면 `#ccc`보다 진하게 | 기본 테두리는 특히 모바일에서 너무 옅다 |
| 안쪽 여백 | `padding`으로 칸을 키운다(모바일 약 15px, 데스크톱 약 10px) | 기본 크기는 손가락에 작다 |
| 칸 사이 | `margin`으로 손가락 하나 폭 정도 | 어느 라벨이 어느 칸 것인지 묶여 보이고, 잘못 누르지 않는다 |
| 탭 영역 | 버튼·컨트롤은 **48px 안팎**. WCAG 2.2의 최소 기준(2.5.8)은 24×24 CSS px다 | 여러 번 눌러야 선택된다면 너무 작다 |
| 배치 | **한 열**, 라벨은 칸 **위** | 여러 열은 읽는 순서를 흐리고 느리게 한다. 위 라벨은 화면 폭과 상관없이 같은 모양이다 |
| 순서 | 시각 순서 = DOM 순서 | CSS로 순서를 바꾸면 Tab 순서와 어긋난다 |

```css
input,
select,
textarea,
button {
  font: inherit;          /* 컨트롤은 부모 글꼴을 물려받지 않는다 */
  font-size: max(1rem, 16px);
  line-height: 1.4;
}

input,
select,
textarea {
  border: 1px solid #767676;
  border-radius: 4px;
  padding: 0.6em 0.75em;
}

textarea {
  resize: vertical;       /* 크기 조절을 없애지 말고 세로만 허용 */
}
```

### 입력 장치에 맞춘 크기

```css
@media (pointer: coarse) {          /* 터치처럼 정확도가 낮은 포인터 */
  input[type="checkbox"],
  input[type="radio"] {
    inline-size: 1.75rem;
    block-size: 1.75rem;
  }
}
```

`pointer: fine`은 마우스, `coarse`는 터치다. 한 기기가 둘 다 가질 수 있으므로 `any-pointer`도 있다.

### 포커스와 상태

- 포커스 표시는 지우지 말고 바꾼다. 키보드 사용자에게만 보이게 하려면 `:focus-visible`을 쓴다. 기준과 예시는 [[keyboard-accessibility|키보드 접근성과 포커스 관리]]에 있다.
- 오류 상태는 `:user-invalid`로, 색과 함께 글자·아이콘으로 보여 준다([[constraint-validation|제약 검증]]).
- 자동 완성된 칸의 스타일은 `:autofill`. 포커스 중에는 배경색을 덮어쓸 수 없다([[form-autofill|자동 완성과 autocomplete 토큰]]).

### 버튼

`<button>`은 다른 요소처럼 자유롭게 꾸밀 수 있다. 배경과 테두리를 사이트 스타일에 맞추되, 누를 수 있는 물건처럼 보이게 둔다. 가상 키보드나 브라우저 툴바가 하단 버튼을 가리는 기기가 있어 하단 고정 버튼에는 `env(safe-area-inset-bottom)` 여백을 더하고, 작은 화면에서 여백을 줄여 버튼이 화면 안에 들어오는지 실제 기기로 확인한다.

## select 꾸미기

```css
select {
  appearance: none;                       /* 운영체제 기본 모양과 화살표 제거 */
  background-color: #fff;
  background-image: url("arrow.svg");
  background-repeat: no-repeat;
  background-position: right 0.7em top 50%;
  background-size: 0.65em auto;
  padding-inline-end: 2em;                /* 화살표 자리 */
}
```

- `appearance`는 2022년부터 접두사 없이 모든 주요 브라우저가 지원한다. `-webkit-appearance` 같은 접두 버전은 오래된 브라우저용이다.
- 전통적인 `<select>`에서 펼쳐진 목록의 `<option>`은 운영체제가 그리는 부분이라 CSS로 거의 꾸밀 수 없다.

### customizable select: appearance: base-select

`<select>`와 펼침 목록을 모두 CSS로 꾸미는 새 방식이다. **지원 범위가 아직 제한적(Baseline 아님)** 이라, 지원하지 않는 브라우저에서는 일반 select로 돌아가게 점진적 향상으로 쓴다.

```css
select,
::picker(select) {
  appearance: base-select;     /* 둘 다 켜야 한다 */
}

::picker(select) {             /* 펼침 목록. 최상위 레이어의 팝오버로 그려진다 */
  border: none;
  border-radius: 8px;
}

select::picker-icon { transition: rotate 0.3s; }
select:open::picker-icon { rotate: 180deg; }
option::checkmark { content: "✓"; }
```

```html
<select name="pet">
  <button><selectedcontent></selectedcontent></button>  <!-- 닫힌 모양 -->
  <option value="cat"><span aria-hidden="true">🐱</span> 고양이</option>
  <option value="dog"><span aria-hidden="true">🐶</span> 강아지</option>
</select>
```

- `<option>` 안에 아이콘·여러 요소를 넣을 수 있다. 값은 option의 텍스트다. 장식 아이콘에는 `aria-hidden="true"`.
- 펼침 목록은 앵커 위치 지정으로 배치할 수 있다([[popover-anchor-positioning|팝오버와 앵커 위치 지정]]). 모바일 운영체제의 기본 선택 UI는 쓰지 않게 된다.

## 체크박스와 라디오

간단히 색만 맞추려면 `accent-color` 한 줄이면 된다. 체크박스·라디오·`range`·`<progress>`의 강조색을 바꾼다. 일부 브라우저·컨트롤에서 지원이 고르지 않으므로 기본색으로 보여도 문제없게 쓴다.

```css
:root { accent-color: #2b6cb0; }
```

모양을 완전히 바꾸려면 원래 컨트롤을 **보이지 않게만** 하고 그 위에 겹쳐 둔 채, 라벨의 의사 요소로 새 모양을 그린다.

```css
input[type="radio"] {
  position: absolute;
  opacity: 0;              /* display: none, visibility: hidden은 쓰지 않는다 */
}

input[type="radio"] + label::before {
  content: "";
  display: inline-block;
  inline-size: 1em;
  block-size: 1em;
  border: 1px solid currentColor;
  border-radius: 50%;
  margin-inline-end: 0.5em;
}

input[type="radio"]:checked + label::before {
  background: currentColor;
}

input[type="radio"]:focus-visible + label::before {
  outline: 2px solid #2b6cb0;
  outline-offset: 2px;
}
```

- `display: none`이나 `visibility: hidden`은 컨트롤을 **접근성 트리에서 지워** 스크린 리더와 키보드가 닿지 못한다. `opacity: 0`으로 숨기고 새 모양 위치에 겹쳐 두면 터치 탐색과 포커스가 그대로 동작한다.
- 숨긴 컨트롤의 포커스 표시를 새 모양에 꼭 옮긴다.
- 최신 브라우저에서는 `appearance: none`을 준 체크박스 자체에 `::before`를 그리는 방법도 쓴다.

## 내용에 맞춰 늘어나는 칸: field-sizing

```css
textarea,
input {
  field-sizing: content;   /* 입력한 만큼 늘고 줄어든다 */
  min-inline-size: 10ch;   /* 없으면 커서 폭까지 줄어든다 */
  max-inline-size: 40ch;
}
```

`field-sizing: content`는 텍스트 계열 `<input>`, `<textarea>`, `<select>`가 내용 크기를 따르게 한다. 고정 `width`·`height`를 주면 다시 고정되므로 `min-`·`max-` 크기로 범위만 정한다. `rows`·`cols`·`size` 속성은 무시된다. 2026년 6월부터 모든 주요 브라우저의 최신 버전이 지원한다(Baseline 2026, 새로 사용 가능). 지원하지 않는 브라우저에서는 고정 크기로 보일 뿐이다.

## 정리

- 표준 요소를 꾸민다. 컨트롤이 무엇인지 알아볼 수 있는 선을 넘지 않는다.
- 글자 1rem 이상, 진한 테두리, 넉넉한 padding·margin, 48px 안팎 탭 영역, 한 열, 위 라벨.
- `select`는 `appearance: none` + 배경 화살표. `base-select`는 점진적 향상으로만.
- 체크박스·라디오는 `accent-color`로 충분하면 그것을, 아니면 `opacity: 0`으로 숨기고 겹쳐 그린다. 포커스 표시를 옮긴다.
- 실제 기기에서 확대, 키보드 가림, 하단 버튼 가림을 확인한다.

관련 노트: [[form-usability|더 나은 폼을 만드는 팁]], [[keyboard-accessibility|키보드 접근성과 포커스 관리]], [[accessible-css-typography|접근성을 위한 CSS와 타이포그래피]], [[selectors|CSS 선택자와 우선순위]], [[popover-anchor-positioning|팝오버와 앵커 위치 지정]], [[logical-properties|쓰기 모드와 논리적 속성]]
