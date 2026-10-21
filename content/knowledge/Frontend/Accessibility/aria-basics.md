---
title: "ARIA와 접근 가능한 이름"
concept: "WAI-ARIA"
summary: "ARIA는 HTML로 표현할 수 없는 role·state·property를 접근성 트리에 더하지만 동작은 더하지 않는다. 다섯 가지 사용 규칙, 접근 가능한 이름과 설명이 계산되는 순서(aria-labelledby > aria-label > 네이티브 label·alt > 내용 > title > placeholder), Label in Name, 라이브 영역을 정리한다."
tags: ["frontend", "accessibility", "aria", "html", "javascript"]
source: other
date: "2026-10-17"
sources: ["https://webaim.org/techniques/aria/", "https://webaim.org/articles/label-name/", "https://www.w3.org/TR/html-aam-1.0/", "https://web.dev/learn/accessibility/aria-html", "https://web.dev/learn/accessibility/javascript", "https://www.w3.org/TR/html-aria/", "https://webaim.org/projects/million/", "https://webaim.org/presentations/2024/january/"]
---

> WebAIM의 「[Introduction to ARIA](https://webaim.org/techniques/aria/)」, 「[Decoding Label and Name for Accessibility](https://webaim.org/articles/label-name/)」을 바탕으로, 이름·설명 계산 순서는 W3C [HTML-AAM](https://www.w3.org/TR/html-aam-1.0/)으로 확인해 재구성한 노트다. HTML과 ARIA를 섞는 원칙과 프레임워크의 라이브 영역 처리는 web.dev 「[Learn Accessibility](https://web.dev/learn/accessibility)」의 ARIA·JavaScript 편과 W3C 「[ARIA in HTML](https://www.w3.org/TR/html-aria/)」로 보강했다.
> 네이티브 상태와의 충돌, 숨긴 참조 텍스트, 아이콘 이름 붙이기, `title` 중복 부분은 WebAIM의 교육 자료 「[Web Accessibility Training](https://webaim.org/presentations/2024/january/)」(Jon Whiting·Jared Smith, 2024.01)을 바탕으로 보강했다.

## ARIA란

WAI-ARIA(Accessible Rich Internet Applications)는 HTML만으로는 표현할 수 없는 의미를 접근성 트리에 더하는 W3C 명세다. 프로그래밍 언어가 아니라 HTML 요소에 붙이는 **속성 묶음**이다. 트리 메뉴·슬라이더·탭 같은 위젯의 정체와 상태, 동적으로 바뀌는 영역(라이브 영역), 이름과 설명의 연결을 브라우저의 접근성 API를 거쳐 보조 기술에 알린다. 접근성 트리가 만들어지는 과정은 [[Accessibility|웹 접근성]]에 있고, Chrome DevTools에서 트리 전체를 볼 수 있다.

**ARIA는 의미만 바꾸고 동작·모양은 하나도 바꾸지 않는다.** 효과를 느끼는 사람은 보조 기술 사용자뿐이다. `<div role="button">`은 스크린 리더가 「버튼」이라고 읽지만, Tab으로 닿지도 Enter로 눌리지도 않는다. 키보드 조작, 포커스, 스타일은 개발자가 JavaScript와 CSS로 직접 맞춰야 한다. 그래서 잘못 쓴 ARIA는 안 쓴 것보다 나쁘다. WebAIM Million에서도 ARIA를 쓴 홈페이지가 쓰지 않은 홈페이지보다 평균 오류가 약 17개 많았다(복잡한 페이지일수록 ARIA를 많이 쓴다는 점을 감안해도 경향은 같다).

HTML이 `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>` 같은 랜드마크 요소와 `hidden`, `required` 속성을 갖추면서 예전에 ARIA로만 하던 일 상당수가 HTML로 넘어왔다. 브라우저가 지원하는 HTML 요소의 암묵적 role이 ARIA role과 같다면 ARIA는 필요 없다. ARIA가 여전히 필요한 곳은 HTML에 없는 위젯 role과 상태다.

## ARIA 사용 다섯 규칙

| 규칙 | 뜻 | 예 |
| --- | --- | --- |
| 1. 네이티브 HTML이 있으면 그것을 쓴다 | HTML로 충분하면 ARIA를 쓰지 않는다 | `<div role="button">` 대신 `<button>` |
| 2. 네이티브 의미를 함부로 바꾸지 않는다 | role은 원래 의미를 **덮어쓴다** | `<ul role="navigation">`은 목록 의미(항목 수, 항목 이동)를 잃는다. `<nav><ul>…</ul></nav>`로 감싼다 |
| 3. 상호작용하는 ARIA 컨트롤은 키보드로 쓸 수 있어야 한다 | role이 약속한 키 조작을 구현한다 | `role="tab"`이면 방향키로 이동 ([[accessible-widgets\|접근 가능한 위젯]]) |
| 4. 포커스 가능한 요소는 의미를 갖고, 숨기지 않는다 | 포커스되는 요소에 `role="presentation"`·`aria-hidden="true"`를 주지 않는다 | 보이지 않는데 포커스가 들어가면 사용자가 길을 잃는다 |
| 5. 상호작용하는 요소에는 접근 가능한 이름이 있다 | 버튼·링크·입력에는 읽을 이름이 있어야 한다 | 아이콘 버튼에 `aria-label="검색"` |

기본 role을 ARIA로 되풀이하지도 않는다. `<button role="button">`, `<nav role="navigation">`은 허용되지만 군더더기이고 실수의 여지만 늘린다.

W3C의 「ARIA in HTML」은 HTML과 ARIA를 섞을 때 세 가지를 경계한다.

| 경계할 것 | 나쁜 예 | 바로잡기 |
| --- | --- | --- |
| 기본 role 덮어쓰기 | `<h2 role="tab">`: 제목 의미가 사라진다. `<a role="heading">`: 링크가 제목이 된다 | `<div role="tab"><h2>…</h2></div>`처럼 감싼다. 링크는 링크로 두고 이름을 구체적으로 준다 |
| 중복 | `<ul role="list">` | 보통 `<ul>`이면 된다. 예외: Safari는 `list-style: none`인 목록을 `<nav>` 밖에서 목록으로 노출하지 않으므로 이때만 `role="list"`를 덧붙인다([[accessible-page-structure\|접근 가능한 페이지 구조]]) |
| 네이티브 동작·상태와 충돌 | `<input type="checkbox" role="radio">`: 브라우저는 체크박스로 동작하는데 스크린 리더는 라디오로 알린다. `<input type="checkbox" aria-checked="false">`: HTML의 `checked`와 ARIA 상태가 어긋날 수 있다 | role은 브라우저 동작을 바꾸지 못하니 동작에 맞는 요소를 고른다. 네이티브 상태는 HTML 속성(`checked`, `disabled`, `required`)으로만 둔다 |
| 예상 못 한 부작용 | `<details>` 안의 `<summary role="button">` | `<summary>`에는 role을 주지 않는다(HTML이 허용하지 않는다) |

환경 제약 때문에 더 넓은 보조 기술 지원이 필요하거나, 아직 지원이 고르지 않은 HTML 기능의 대비책으로 ARIA를 함께 쓰는 것은 괜찮다. 그때도 실제 보조 기술로 확인한다.

## 세 가지 구성 요소

| 구성 요소 | 뜻 | 예 |
| --- | --- | --- |
| role | 요소가 **무엇인가** | `role="tab"`, `role="dialog"`, `role="region"`, `role="img"` |
| property | 잘 바뀌지 않는 추가 의미 | `aria-haspopup="dialog"`, `aria-controls`, `aria-labelledby`, `aria-required` |
| state | 상호작용에 따라 **바뀌는** 현재 상태 | `aria-expanded`, `aria-pressed`, `aria-selected`, `aria-invalid`, `aria-current` |

state·property 속성은 모두 `aria-`로 시작한다. 마크업에 적어 두거나 스크립트로 바꾼다. state는 **실제 상태와 늘 같은 값**이어야 하므로 클릭 핸들러에서 화면과 함께 갱신한다.

자주 쓰는 것만 추리면 다음과 같다.

| 속성 | 쓰임 |
| --- | --- |
| `aria-expanded="true\|false"` | 펼침 버튼이 연 상태인지 알린다 |
| `aria-pressed="true\|false"` | 토글 버튼이 눌린 상태인지 알린다 |
| `aria-haspopup="menu\|listbox\|tree\|grid\|dialog"` | 누르면 팝업이 뜬다고 알린다. `true`는 `menu`와 같다 |
| `aria-current="page\|step\|…"` | 묶음 안에서 현재 항목을 표시한다 |
| `aria-required`, `aria-invalid` | 필수 입력, 오류 상태 (폼은 [[accessible-forms\|접근 가능한 폼]]) |
| `role="presentation"`(= `none`) | 레이아웃용 표, 장식용 `<svg>`처럼 의미가 필요 없는 요소의 의미를 지운다 |
| `aria-hidden="true"` | 반복되거나 장식인 내용을 보조 기술에서 숨긴다. 포커스 가능한 요소나 그것을 품은 요소에는 쓰지 않는다 |

ARIA 속성은 CSS 선택자로도 쓴다. `[aria-pressed="true"] { … }`처럼 상태 속성에 스타일을 걸면 화면과 보조 기술이 같은 값을 본다.

```html
<!-- 의미 있는 SVG: img role + 이름 -->
<svg role="img" aria-labelledby="chart-title">
  <title id="chart-title">2021~2025년 매출이 매년 늘어 다섯 배가 됐다</title>
  …
</svg>

<!-- 장식용 SVG -->
<svg aria-hidden="true" focusable="false">…</svg>
```

랜드마크 role(`banner`, `navigation`, `main`, `complementary`, `contentinfo`, `search`, `region`)은 지금 모두 HTML 요소가 대응한다. 사이트 검색 영역도 `<search>` 요소가 있다(Chrome·Firefox 118, Safari 17부터). 랜드마크를 어떻게 나누는지는 [[accessible-page-structure|접근 가능한 페이지 구조]]에 있다.

## 레이블과 이름은 다르다

WCAG는 두 말을 구분한다.

| 용어 | 누구에게 | 예 |
| --- | --- | --- |
| 레이블(label) | **사람**에게 보이는 텍스트 | 버튼에 적힌 「다음」 |
| 이름(accessible name) | **소프트웨어**(스크린 리더, 음성 제어)에 전달되는 텍스트 | 접근성 트리의 name 값 |

대부분 둘은 같다. `<a href="/apply">지원하기</a>`의 레이블과 이름은 모두 「지원하기」다. 어긋나기 쉬운 경우는 세 가지다.

- 이미지: 눈에 보이는 글자와 `alt`가 다를 수 있다. 이름은 코드를 보거나 스크린 리더로 들어야 안다.
- 폼 컨트롤: `<label>`, `title`, `placeholder`, `aria-*`가 이름 자리를 두고 경쟁한다.
- ARIA 레이블: `aria-label`·`aria-labelledby`는 **다른 모든 후보를 덮어쓴다.**

HTML의 `<label>` 요소와 WCAG의 「레이블」, HTML의 `name` 속성과 「접근 가능한 이름」은 서로 다른 개념이다. 또 `<div>`, `<span>`, `<p>`처럼 이름을 가질 수 없는 요소가 있다. ARIA 1.2는 이런 generic role에 `aria-label`을 다는 것을 금지한다. 적당한 role을 줘야 이름이 붙는다.

## 이름이 계산되는 순서

요소는 이름을 **하나만** 가진다. 후보가 여럿이면 W3C의 「접근 가능한 이름과 설명 계산(Accessible Name and Description Computation)」 명세와 HTML-AAM이 정한 순서에서 **먼저 값이 나오는 하나**가 이긴다. 뒤 순위는 앞 순위가 비었을 때만 쓰인다.

| 순위 | 출처 | 해당 요소 | 비고 |
| --- | --- | --- | --- |
| 0 | `hidden`, `display: none`, `aria-hidden="true"` | 모든 요소 | 트리에서 빠져 이름 자체가 없다. 숨긴 `<label>`도 읽히지 않는다. 단 `aria-labelledby`·`aria-describedby`가 가리키는 숨은 요소의 텍스트는 이름·설명으로 **읽힌다** |
| 1 | `aria-labelledby` | 이름을 가질 수 있는 모든 요소 | id 여러 개를 적으면 그 순서로 이어 붙인다. 가리킨 요소의 링크·목록 같은 의미는 사라지고 글자만 남는다 |
| 2 | `aria-label` | 같음 | 화면에 보이지 않는 문자열 |
| 3 | 네이티브 레이블 | 입력 → 연결된 `<label>`, `<img>` → `alt`, `<fieldset>` → 첫 `<legend>`, `<table>` → `<caption>`, `<input type="submit">` → `value`, `<figure>` → `<figcaption>` | `<label>`이 여럿이면 DOM 순서로 이어 붙인다 |
| 4 | 내용(name from content) | 버튼, 링크, 제목, 탭, 셀, 옵션처럼 내용으로 이름을 받는 role | 자식 텍스트와 자식 이미지의 `alt`까지 모은다 |
| 5 | `title` | 대부분 | 툴팁 속성이다. 위에서 이름이 나왔다면 설명으로 쓰인다 |
| 6 | `placeholder`, `aria-placeholder` | 텍스트 입력 | 레이블 대용이 아니다. 입력하면 사라지고 대비도 낮다 |

입력 칸에 `<label>`과 `aria-label`이 함께 있으면 `<label>`은 읽히지 않는다. 링크 텍스트, 버튼 텍스트, 이미지 `alt`도 마찬가지다. **ARIA 레이블은 덧붙는 게 아니라 대체한다.**

```html
<!-- 나쁨: 링크 이름이 "PDF"만 남는다. "지원서"는 사라진다 -->
<a href="apply.pdf" class="pdf-icon" aria-label="PDF">지원서 내려받기</a>

<!-- 좋음: 보이는 텍스트를 살리고 정보를 덧붙인다 -->
<a href="apply.pdf">지원서 내려받기 <span class="visually-hidden">(PDF)</span></a>

<!-- 아이콘 span을 이미지로 만들어 이름을 준다 (span 그대로는 aria-label이 금지된다) -->
<a href="apply.pdf">지원서 내려받기 <span class="pdf-icon" role="img" aria-label="(PDF)"></span></a>
```

CSS `::before`/`::after`로 넣은 아이콘 폰트 글리프도 최신 스크린 리더는 읽으려 든다. 의미 있는 아이콘이면 `<i class="pdf" role="img" aria-label="PDF"></i>`처럼 이미지로 만들거나, 아이콘만 든 버튼이면 버튼에 `aria-label`을 준다.

`visually-hidden` 같은 화면 밖 텍스트 기법은 [[accessible-css-typography|접근성을 위한 CSS와 타이포그래피]]에 있다.

### aria-labelledby와 aria-label 고르기

| 상황 | 쓸 것 |
| --- | --- |
| 폼 컨트롤에 보이는 텍스트 레이블이 있다 | `<label>`. 지원이 가장 탄탄하고, 레이블을 누르면 칸에 포커스가 간다 |
| 화면에 이미 이름으로 쓸 텍스트(제목 등)가 있다 | `aria-labelledby`. 텍스트를 중복하지 않고, 제목이 바뀌면 이름도 따라 바뀐다 |
| 보이는 텍스트가 전혀 없다 (아이콘 버튼, 이름 없는 영역) | `aria-label` |
| 여러 조각을 합쳐 이름을 만들어야 한다 | `aria-labelledby="id1 id2"` |

```html
<section aria-labelledby="filters-heading">
  <h2 id="filters-heading">검색 필터</h2>
  …
</section>
```

ARIA 레이블과 설명은 스크린 리더가 **한 줄로 흘려 읽는다.** 본문 텍스트처럼 단어·글자 단위로 멈춰 살펴볼 수 없으니 짧게 쓴다. 가리킨 요소의 목록·링크 같은 구조도 사라지므로, 여러 줄짜리 입력 조건 목록 전체를 `aria-describedby`로 잇기보다 짧은 요약 한 줄을 잇고 목록은 본문으로 읽게 둔다. 또 `aria-label`의 문자열은 브라우저 자동 번역에서 빠지기 쉽다. 다국어 사용자가 많으면 보이는 텍스트를 가리키는 `aria-labelledby`나 시각적으로 숨긴 텍스트가 안전하다.

숨긴 요소도 참조되면 읽힌다는 점은 함정이 된다. 오류 문구를 `display: none`으로 미리 그려 두고 `aria-describedby`로 이어 두면, 오류가 없을 때도 스크린 리더는 「이미 쓰는 아이디다」를 설명으로 읽는다. 오류가 생길 때 참조를 붙이거나 문구를 넣는다.

## Label in Name: 보이는 글자가 이름에 들어가야 한다

WCAG 2.5.3 Label in Name(A)은 **글자가 보이는 컨트롤의 접근 가능한 이름이 그 글자를 포함**하도록 요구한다.

| 보이는 레이블 | 이름 | 판정 |
| --- | --- | --- |
| 다음 | 다음 | 통과 (가장 좋다) |
| 다음 | 다음 페이지 | 통과. 레이블을 포함한다 |
| 다음 | 계속 | **실패.** 뜻은 같아도 레이블을 포함하지 않는다 |
| 이름 (`<label>`) | 성함 (`aria-label`) | **실패.** `aria-label`이 `<label>`을 덮어썼다 |

이름이 어긋나면 음성 제어 사용자가 「다음 클릭」이라고 말해도 동작하지 않는다. 시력이 일부 남은 스크린 리더 사용자는 보이는 것과 들리는 것이 달라 헷갈리고, 동료가 「다음 버튼 눌러」라고 할 때 찾지 못한다. 이 기준은 글자나 글자 이미지가 있는 컨트롤에만 적용된다. 글자 없는 화살표 아이콘에는 해당하지 않는다.

## 접근 가능한 설명

이름과 별도로 **설명(accessible description)**이 있다. 이름을 대체하지 않고, 이름 다음에(때로는 맨 마지막에) 읽힌다. 입력 조건, 오류 메시지, 보조 안내를 붙일 때 쓴다.

| 순위 | 설명 출처 |
| --- | --- |
| 1 | `aria-describedby` (id 여러 개 가능), `aria-description` |
| 2 | 이름으로 쓰이지 않은 `<caption>`(표), `<summary>`, 버튼형 `<input>`의 `value` |
| 3 | 이름으로 쓰이지 않은 `title` |

```html
<label for="pw">비밀번호</label>
<input id="pw" type="password" aria-describedby="pw-rule">
<p id="pw-rule">8자 이상, 숫자를 하나 넣는다</p>
```

`aria-description`은 ARIA 1.3에 들어가는 속성이라 보이는 텍스트를 가리키는 `aria-describedby`가 우선이다. `title`은 이름이나 설명으로 자주 읽혀 내용이 중복되기 쉬우므로 아껴 쓴다. 마우스를 올려야 보이는 툴팁이라 키보드·터치 사용자는 볼 수 없고, 링크 텍스트나 `alt`를 되풀이한 `title`(「더 알아보기: ＜alt와 같은 문장＞」)은 스크린 리더가 같은 말을 두 번 읽게 만든다. 다른 이름 후보가 전혀 없을 때의 마지막 수단으로만 쓴다.

## 라이브 영역: 포커스 없이 바뀐 내용 알리기

화면이 부분적으로 바뀔 때 스크린 리더는 기본으로 아무 말도 하지 않는다. 사용자가 그 자리를 다시 읽기 전까지 바뀐 줄 모른다. **라이브 영역(live region)**은 해당 요소가 바뀌면 포커스를 옮기지 않고 읽어 주게 한다. 저장 완료, 검색 결과 수, 장바구니 개수 같은 **상태 메시지**가 대상이고, WCAG 4.1.3 Status Messages(AA)가 이를 요구한다.

| 값·role | 읽는 시점 | 쓰임 |
| --- | --- | --- |
| `aria-live="off"` | 알리지 않는다. 사용자가 그 자리에 오면 읽는다 | 덜 중요한 갱신, 스크립트로 polite·assertive와 바꿔 가며 쓸 때 |
| `aria-live="polite"` | 지금 읽던 것을 마친 뒤 | 대부분의 상태 알림, 채팅 메시지, 날씨·시세 |
| `aria-live="assertive"` | 즉시, 읽던 것을 끊고 | 치명적인 오류처럼 바로 알아야 하는 것만 |
| `role="status"` | polite + 통째로 읽기(`aria-atomic="true"`) | 「저장했다」, 「검색 결과 12건」 |
| `role="alert"` | assertive + 통째로 읽기 | 오류, 세션 만료 경고 |
| `role="log"` | polite, 새로 추가된 것만 | 채팅 기록, 활동 로그 |
| `role="timer"`, `role="marquee"` | off | 타이머, 흐르는 시세 |
| `<output>` | 암묵적으로 `role="status"` | 계산 결과 |

```html
<!-- 페이지를 처음 그릴 때부터 비어 있는 채로 둔다 -->
<div role="status" id="cart-status"></div>

<script>
  // 나중에 내용만 바꾼다
  document.getElementById('cart-status').textContent = '장바구니에 담았다. 총 3개';
</script>
```

| 주의 | 이유 |
| --- | --- |
| 라이브 영역은 **내용이 바뀌기 전에** DOM에 있어야 한다 | 영역과 내용을 한꺼번에 넣거나 속성을 나중에 붙이면 안정적으로 읽히지 않는다 |
| 한 화면에 여러 개를 두지 않는다 | 알림이 겹치면 사용자가 계속 끊긴다 |
| assertive는 아낀다 | 남용하면 사용자가 읽던 내용을 계속 놓친다 |
| 포커스를 옮겨야 하는 경우와 구분한다 | 대화 상자처럼 사용자가 바로 다뤄야 하는 내용은 라이브 영역이 아니라 포커스 이동이다 ([[keyboard-accessibility\|키보드 접근성과 포커스 관리]]) |

컴포넌트를 그때그때 그리는 프레임워크에서는 라이브 영역이 내용과 함께 새로 만들어져 알림이 빠지기 쉽다. 그래서 앱 최상단에 영역 하나를 늘 두고 텍스트만 바꿔 주는 **알림 도구(live announcer)**를 쓴다. Angular CDK의 `LiveAnnouncer`, React Aria의 `announce()` 같은 것이 이 역할을 한다.

## ARIA 위젯이 갖출 것

네이티브 요소가 없는 위젯을 직접 만든다면 세 가지를 모두 갖춘다.

| 조건 | 방법 |
| --- | --- |
| 키보드로 포커스가 가고 조작된다 | `tabindex`와 키 이벤트로 W3C [ARIA Authoring Practices Guide(APG)](https://www.w3.org/WAI/ARIA/apg/patterns/)의 키 조작을 따른다 |
| 이름이 있다 | 보이는 텍스트 → `<label>`, 없으면 `aria-labelledby`·`aria-label` |
| role·state·property가 맞다 | APG 패턴의 role과 상태 속성을 그대로 쓴다. 맞는 role이면 스크린 리더가 조작법까지 안내한다 |

탭·디스클로저·캐러셀의 구체적인 구현은 [[accessible-widgets|접근 가능한 위젯: 펼침·탭·캐러셀]]에, 콤보박스·날짜 선택기·메뉴·툴팁과 상황별 상태 알림은 [[aria-widget-patterns|복합 위젯의 ARIA 패턴]]에, `tabindex` 사용법은 [[keyboard-accessibility|키보드 접근성과 포커스 관리]]에 있다.

## 이름과 설명 확인하기

이름은 눈으로 봐서는 알 수 없다. 세 가지 도구로 확인한다.

| 도구 | 보는 것 |
| --- | --- |
| 페이지 전체를 훑는 검사 도구 (WAVE 등) | 폼 레이블, `alt`, `aria-label/labelledby/describedby`가 어디에 있는지 |
| 브라우저 개발자 도구의 접근성 패널 | 요소의 role·name·description. Chrome DevTools는 이름 후보들과 이긴 값을 함께 보여 준다 ([[devtools-elements-css\|DevTools로 DOM과 CSS 다루기]]) |
| 스크린 리더 (NVDA, VoiceOver) | 실제 사용자가 듣는 순서와 내용. ARIA를 썼다면 사실상 필수다 ([[screen-reader-testing\|스크린 리더로 테스트하기]]) |

role과 이름은 테스트 코드의 선택자로도 쓰인다. `getByRole('button', { name: '저장' })`이 요소를 못 찾으면 스크린 리더도 못 찾는다([[a11y-driven-testing|접근성 기반 UI 테스트 자동화]]).

## 정리

- ARIA는 의미만 더한다. 동작은 직접 만들어야 하니 **네이티브 요소가 먼저**다.
- 요소의 이름은 하나다. `aria-labelledby` > `aria-label` > 네이티브 레이블(`<label>`, `alt`, `<legend>`, `<caption>`) > 내용 > `title` > `placeholder` 순으로 처음 나온 값이 이긴다.
- ARIA 레이블은 덧붙지 않고 **덮어쓴다.** 보이는 텍스트는 이름 안에 그대로 들어가야 한다(2.5.3).
- 보조 설명은 `aria-describedby`로 이름과 따로 준다.
- 상태 메시지는 미리 둔 라이브 영역(`role="status"`, `role="alert"`)으로 알리고, assertive는 아낀다.

관련 노트: [[Accessibility|웹 접근성]], [[keyboard-accessibility|키보드 접근성과 포커스 관리]], [[accessible-widgets|접근 가능한 위젯: 펼침·탭·캐러셀]], [[accessible-forms|접근 가능한 폼과 오류 처리]], [[accessible-page-structure|접근 가능한 페이지 구조]], [[a11y-driven-testing|접근성 기반 UI 테스트 자동화]]
