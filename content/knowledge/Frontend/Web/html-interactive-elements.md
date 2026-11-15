---
title: "포커스 속성과 details·dialog"
concept: "Focus, details, dialog"
summary: "HTML만으로 포커스를 다루는 속성(tabindex·contenteditable·autofocus·disabled·inert)과 JavaScript 없이 동작하는 두 인터랙티브 요소를 요소 사전처럼 정리한다. 포커스를 빼는 세 방법의 차이, <details>/<summary>의 open·name·마커·오류 처리, <dialog>의 show·showModal·close, method=\"dialog\"와 returnValue, ::backdrop, 열고 닫을 때의 포커스, commandfor로 스크립트 없이 여는 법까지 다룬다."
tags: ["html", "accessibility", "frontend", "dom", "browser"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/html/focus", "https://web.dev/learn/html/details", "https://web.dev/learn/html/dialog", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details"]
---

> web.dev의 「[Learn HTML](https://web.dev/learn/html)」 강좌 중 「Focus」, 「Details and summary」, 「Dialog」 모듈을 바탕으로, 새 속성과 브라우저 지원은 MDN으로 확인해 보강한 노트다.

이 노트는 **요소와 속성이 무엇을 하는지**를 다룬다. 키보드 사용자를 위한 설계 원칙(포커스 표시, 순서, 로빙 tabindex, 모달 패턴)은 [[keyboard-accessibility|키보드 접근성과 포커스 관리]], 펼침·아코디언·탭 위젯 패턴은 [[accessible-widgets|접근 가능한 위젯: 펼침·탭·캐러셀]]에 있다.

## 포커스: 세 가지 상태

| 상태 | 뜻 | 예 |
| --- | --- | --- |
| 탭 가능(tabbable) | 포커스를 받고, Tab 순서(순차 포커스 탐색 순서)에도 들어 있다 | 링크(`href` 있음), 버튼, 폼 컨트롤, `contenteditable` |
| 포커스 가능(focusable)만 | `focus()`나 클릭으로는 포커스되지만 Tab으로는 닿지 않는다 | `tabindex="-1"` |
| 비활성(inert) | 포커스도 클릭도 안 된다 | 일반 `<div>`, `<p>`, `inert` 영역 |

Tab 순서는 **소스 순서**다. CSS의 `flex-direction: row-reverse`, `order`, 그리드 배치, 위치 지정, 변형, 다단은 보이는 순서만 바꾸고 Tab 순서는 그대로 둔다. 그래서 보이는 순서와 탭 순서가 어긋나지 않게 마크업 순서를 맞춘다. 모든 화면 크기에서 Tab과 Shift+Tab으로 직접 확인한다.

### 포커스를 주는 속성

| 속성 | 효과 |
| --- | --- |
| `tabindex="0"` | 원래 포커스되지 않는 요소를 소스 순서대로 Tab 순서에 넣는다. 링크·버튼처럼 이미 탭 가능한 요소에는 필요 없다 |
| `tabindex="-1"` | 포커스 가능하지만 Tab 순서에서 뺀다. 이미 탭 가능한 요소에 주면 키보드로 닿지 못한다 |
| `tabindex` 양수 | 낮은 값부터 별도 순서로 먼저 돈 뒤 나머지를 돈다. 쓰지 않는다 |
| `contenteditable` | 편집 가능 + 탭 가능. `tabindex="0"`과 비슷하지만, **중첩된** `contenteditable`은 포커스만 되고 탭되지 않는다(필요하면 `tabindex="0"`을 더한다) |
| `autofocus` | 페이지가 열릴 때 그 요소에 포커스한다. 비활성 요소를 인터랙티브하게 만들지는 않는다 |

**`autofocus`는 쓰지 않는다.** 페이지가 그 요소로 스크롤되어 스크린 리더·작은 화면 사용자가 앞의 안내문과 레이블을 놓치고, 그 앞의 요소들은 건너뛰게 된다. 예외는 `<dialog>` 안이다(아래).

`tabindex="0"`과 `role="button"`으로 커스텀 요소를 버튼처럼 만들 수는 있지만 Enter·Space 처리, 상태 전달을 모두 다시 구현해야 한다. 가능하면 진짜 `<button>`을 쓴다.

### 포커스를 빼는 세 방법

| | `tabindex="-1"` | `disabled` | `inert` |
| --- | --- | --- | --- |
| 붙는 곳 | 모든 요소 | `<button>`, `<input>`, `<select>`, `<textarea>`, `<option>`, `<optgroup>`, `<fieldset>`, 폼 연결 커스텀 요소 | 모든 요소(전역) |
| 키보드 Tab | 빠진다 | 빠진다 | 빠진다(하위 전체) |
| 마우스 클릭·포커스 | **된다** | 안 된다. 클릭 이벤트도 없다 | 안 된다 |
| 폼 제출 | 제출된다 | **제출되지 않는다** | 제출된다 |
| 접근성 트리 | 남는다 | 남는다(비활성으로 안내) | **빠진다** |
| 기본 모양 | 없음 | 회색(사용자 에이전트 스타일) | 없음 |
| CSS로 고르기 | `[tabindex="-1"]` | `:disabled` / `:enabled` | `[inert]`(전용 의사 클래스 없음) |

- `disabled`는 불리언이라 `false`를 줄 수 없다. 다시 켜려면 `removeAttribute('disabled')`. `<fieldset disabled>`·`<optgroup disabled>`는 안의 컨트롤을 모두 끈다. 단, `<fieldset>`의 첫 `<legend>` 안 내용은 예외다.
- `disabled`는 `<form>`이나 `tabindex`·`contenteditable`로 포커스 가능해진 요소에는 통하지 않는다. 그런 영역은 `inert`로 막는다.
- `inert`는 화면 밖 메뉴, 숨겨 둔 패널처럼 **보이지 않거나 지금 쓰면 안 되는 영역**에 쓴다. 보이는 영역에 걸면 눈에는 보이는데 스크린 리더는 모르는 상태가 되니, 반드시 CSS로 비활성임을 드러낸다.
- 포커스가 **보이지 않는 곳으로 가면 안 된다.** 화면 밖에 있고 포커스를 받아도 화면에 들어오지 않는 내용은 `inert`로 만든다. 건너뛰기 링크처럼 포커스되면 나타나는 요소는 그럴 필요가 없다.

### JavaScript로 포커스 다루기

| API | 쓰임 |
| --- | --- |
| `element.focus()` | 포커스 가능한 요소에 포커스한다. 브라우저가 그 요소를 화면으로 스크롤한다 |
| `focus({ preventScroll: true })` | 스크롤을 막는다. 보이지 않는 요소에 포커스가 가게 되므로 피한다 |
| `document.activeElement` | 지금 포커스된 요소(읽기 전용) |
| `:focus`, `:focus-visible`, `:focus-within` | 포커스 스타일. 포커스 표시는 지우지 않는다 |

## details와 summary: 펼침 위젯

```html
<details name="faq" open>
  <summary>환불되나요?</summary>
  <p>구매 후 7일 안에 가능합니다.</p>
</details>
<details name="faq">
  <summary>배송은 얼마나 걸리나요?</summary>
  <p>영업일 기준 2~3일.</p>
</details>
```

| 기능 | 내용 |
| --- | --- |
| `open` | 불리언. 있으면 펼침. 사용자가 `<summary>`를 클릭하거나 포커스 후 Enter·Space를 누르면 브라우저가 붙였다 뗀다. 그래서 `details[open]`으로 상태별 CSS를 쓴다 |
| `name` | 같은 `name`의 `<details>` 중 **하나만 열린다**(배타적 아코디언). 2024년부터 모든 주요 브라우저가 지원한다 |
| `<summary>` | `<details>`의 첫 자식. 늘 보이며 토글 버튼 역할을 한다. 내용은 글, 문단 안에 올 수 있는 요소, 제목 |
| 마커 | 삼각형은 `summary::marker`다. `list-style-type`, `list-style-image`로 바꾸거나 `list-style: none`으로 지우고 `::before`로 직접 그린다. 지워도 **펼침 상태를 알리는 시각 표시는 남긴다** |
| `::details-content` | 펼쳐지는 내용 부분을 고르는 의사 요소. 열고 닫는 애니메이션에 쓴다. 2025년 9월부터 Baseline이다 |
| 페이지 내 찾기 | 접힌 내용 속 검색어를 찾으면 `<details>`가 자동으로 펼쳐진다. 크롬·사파리·파이어폭스 모두 지원한다 |
| `HTMLDetailsElement` | `open` 속성(property)과 `toggle` 이벤트를 더한다 |

### 오류를 브라우저가 처리하는 방식

| 마크업 | 결과 |
| --- | --- |
| `<summary>`가 없다 | 브라우저가 「Details」 같은 기본 요약을 만든다. 섀도 루트 안에 있어 작성자 CSS가 닿지 않는다 |
| `<summary>`가 첫 자식이 아니다 | 그래도 요약으로 보인다 |
| `<summary>` 안에 링크·`<label>`을 넣었다 | 깨지지는 않지만 브라우저마다 포커스·토글 동작이 다르다. 넣지 않는다 |

아코디언 하나만 열리게 하려고 JavaScript를 쓰던 일은 이제 `name`으로 끝난다. 그 밖의 용도(툴팁 등)로 변형할 때는 원래 의미와 어긋나지 않는지, 접근성이 유지되는지 확인한다.

## dialog: 대화 상자

```html
<button commandfor="signup" command="show-modal">등록하기</button>

<dialog id="signup" aria-labelledby="signup-title">
  <h2 id="signup-title">워크숍 등록</h2>
  <form method="dialog">
    <button formnovalidate aria-label="닫기">×</button>
  </form>
  <form method="post" action="/register">
    <label>이름 <input name="name" required></label>
    <button>등록</button>
  </form>
</dialog>
```

### 모달과 비모달

| | 모달 | 비모달 |
| --- | --- | --- |
| 여는 법 | `dialog.showModal()` | `dialog.show()` 또는 `open` 속성 |
| 나머지 페이지 | **inert**가 된다(클릭·포커스 불가). `inert` 속성을 직접 달지 않아도 된다 | 그대로 쓸 수 있다 |
| 배경 | `::backdrop`이 덮는다 | 없다 |
| Esc | 닫힌다(`cancel` → `close` 이벤트) | **닫히지 않는다**. 닫기 버튼이 꼭 있어야 한다 |
| 표시 계층 | 최상위 레이어(top layer). `z-index` 싸움이 없다 | 일반 흐름 |

`::backdrop`은 전체 화면 API의 배경에도 쓰이는 같은 의사 요소다.

### 닫는 법

| 방법 | 동작 |
| --- | --- |
| `<form method="dialog">` 제출, 또는 버튼에 `formmethod="dialog"` | **JavaScript 없이** 닫는다. 제출 이벤트는 생기지만 데이터는 서버로 가지도, 지워지지도 않는다. 제약 검증은 일어나므로 닫기 버튼에는 `formnovalidate`를 같이 단다 |
| `dialog.close(value)` | 닫고 `returnValue`를 정한다 |
| `dialog.requestClose()` | Esc처럼 `cancel` 이벤트를 거쳐 닫는다. 「저장하지 않고 닫을까요?」를 끼워 넣을 수 있다 |
| `closedby` 속성 | `any`(배경 클릭·Esc), `closerequest`(Esc), `none`. 크롬·파이어폭스는 지원하지만 사파리는 아직이라 점진적 향상으로만 쓴다 |

`method="dialog"`로 닫으면 `returnValue`가 **누른 제출 버튼의 `value`** 가 된다. 어느 버튼으로 닫았는지 `close` 이벤트에서 읽는다.

### 스크립트 없이 열기: 명령 버튼

`<button commandfor="대화상자id" command="show-modal">`은 클릭하면 대상 `<dialog>`를 모달로 연다. `command="close"`, `"request-close"`도 있다. 2025년 말부터 모든 주요 브라우저가 지원한다(Baseline 2025). 오래된 브라우저를 지원해야 하면 `showModal()`을 부르는 스크립트를 함께 둔다.

### 포커스

- 열면 포커스가 대화 상자 안 **첫 포커스 가능 요소**로 간다. 다른 요소에 `autofocus`를 주면 그 요소로 간다. 이것이 `autofocus`를 써도 되는 유일한 곳이다. 단, 그 앞의 요소들은 건너뛰니 신중하게 고른다.
- 대화 상자 안의 `autofocus`는 페이지 로드 때가 아니라 **대화 상자가 열릴 때** 동작한다.
- 닫으면 포커스가 **연 요소로 돌아간다.** 사용자 동작 없이 프로그램이 열었다면 포커스를 원래 자리로 되돌리는지 확인한다.
- `<dialog>` 자체는 인터랙티브 요소가 아니다. `tabindex`를 달지 않는다.

### 역할과 기본 스타일

- 암묵적 역할은 `dialog`. 확인을 요구하는 중요한 알림이면 `role="alertdialog"`.
- 접근 가능한 이름을 준다. 보이는 제목이 있으면 `aria-labelledby`.
- 사용자 에이전트 스타일이 `color: CanvasText; background-color: Canvas`를 준다. 글자색이 `<body>`가 아니라 `<dialog>`에서 상속되니 테마 색을 직접 지정한다.
- 대화 상자는 사용자를 멈춰 세운다. 열기 전에 정말 필요한지 따진다. 가벼운 메뉴·툴팁은 `popover` 속성이 맞다.

## 정리

- 탭 순서는 소스 순서다. 양수 `tabindex`, `autofocus`, CSS 재배치로 흐트러뜨리지 않는다.
- 빼는 방법은 셋이다. 키보드만 빼는 `tabindex="-1"`, 컨트롤을 끄고 제출에서도 빼는 `disabled`, 영역 전체를 접근성 트리까지 지우는 `inert`.
- 펼침은 `<details>`/`<summary>`, 하나만 열리는 아코디언은 `name`, 애니메이션은 `::details-content`.
- 모달은 `showModal()`이나 `command="show-modal"`. 나머지가 inert가 되고 Esc로 닫히며, 닫히면 포커스가 돌아온다.
- 닫기는 `<form method="dialog">` + `formnovalidate`면 스크립트가 필요 없다.

관련 노트: [[keyboard-accessibility|키보드 접근성과 포커스 관리]], [[accessible-widgets|접근 가능한 위젯: 펼침·탭·캐러셀]], [[aria-basics|ARIA와 접근 가능한 이름]], [[html-input-types|HTML 입력 요소 치트시트]], [[respect-browser-defaults|브라우저 기본 동작을 존중하기]]
