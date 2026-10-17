---
title: "CSS 선택자와 우선순위"
concept: "Selector"
summary: "스타일을 적용할 요소를 고르는 선택자(속성 연산자, 결합자, 상태·위치·폼 가상 클래스, 가상 요소)와 네이티브 CSS 중첩, 스타일이 겹칠 때 무엇이 적용되는지 정하는 캐스케이딩·특정성, 그리고 상속과 inherit·initial·unset·revert·revert-layer 키워드."
tags: ["css", "selector", "frontend"]
source: mixed
sources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/:has", "https://developer.mozilla.org/en-US/docs/Web/CSS/@layer", "https://web.dev/learn/css/selectors", "https://web.dev/learn/css/pseudo-classes", "https://web.dev/learn/css/pseudo-elements", "https://web.dev/learn/css/nesting", "https://web.dev/learn/css/specificity", "https://web.dev/learn/css/inheritance"]
date: "2026-10-17"
---

> 직접 정리한 TIL에 web.dev 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Selectors·Pseudo-classes·Pseudo-elements·Nesting·Specificity·Inheritance 모듈을 더해 보강한 노트다.

선택자(Selector)는 스타일을 적용할 HTML 요소를 고르는 문법이다. 하나의 CSS 규칙은 **선택자 목록 + 선언 블록**이고, 선언은 속성과 값의 쌍이다. 한 요소에 여러 규칙이 겹치면 CSS는 **캐스케이딩(cascading)** 규칙에 따라 하나를 고른다. "왜 내 스타일이 안 먹지?"의 대부분은 이 우선순위 문제다.

## 기본 선택자

| 선택자 | 예 | 의미 |
| --- | --- | --- |
| 전체 | `*` | 모든 요소 |
| 요소(타입) | `p`, `div` | 해당 태그 전부 |
| 클래스 | `.box` | `class` 값 목록에 `box`가 **들어 있는** 요소(다른 클래스가 함께 있어도 된다) |
| 아이디 | `#header` | `id="header"`인 요소 |
| 속성 | `[lang]`, `[type="text"]` | 특정 속성을 가진 요소 |
| 목록 | `h1, h2, .title` | 쉼표로 묶은 것 중 하나라도 |

- 클래스와 ID는 숫자로 시작할 수 없다(`.1col`은 무효).
- ID가 문서에 중복돼도 규칙은 모두에 적용되지만, ID는 하나여야 하고 특정성이 너무 높아 재사용하기 어렵다. 스타일에는 클래스를 쓴다.
- 요소 선택자는 해당 태그 전부에 적용된다는 점이 장점이자 단점이다. 태그를 바꾸면 스타일도 사라진다.
- 선택자를 붙여 쓰면 복합 선택자(compound selector)다: `a.my-class`, `.button.on`(상태별 변형).

### 속성 선택자 연산자

```css
[href*="example.com"] {}   /* 값에 포함 */
[href^="https"] {}         /* 값이 ~로 시작 */
[href$=".pdf"] {}          /* 값이 ~로 끝남 → a[href$=".pdf"]::after { content: " (PDF)"; } */
[class~="card"] {}         /* 공백으로 나뉜 목록 중 하나가 정확히 일치 */
[lang|="en"] {}            /* en 또는 en-로 시작 */
[data-type="primary" i] {} /* 대소문자 무시 */
[data-type="primary" s] {} /* 대소문자 구분 */
```

## 결합자(Combinators)

| 결합자 | 문법 | 의미 |
| --- | --- | --- |
| 자손 | `A B` | A 안에 있는 **모든** B (깊이 무관) |
| 자식 | `A > B` | A **바로 아래** B |
| 다음 형제 | `A + B` | A **바로 뒤**의 형제 B 하나 |
| 뒤따르는 형제 | `A ~ B` | A 뒤에 오는 같은 부모의 형제 B 전부 |

```css
div span { color: red; }    /* div 안의 모든 span */
div > span { color: red; }  /* div의 직계 자식 span만 */
.stack > * + * { margin-block-start: 1em; }  /* 직계 자식 사이에만 간격(첫 항목 제외) */
input:checked ~ .switch { background: green; } /* 체크박스 뒤의 커스텀 스위치 */
```

`.top *`로 모든 자손에 여백을 주면 중첩된 요소에도 여백이 쌓인다. `> * + *`처럼 자식 결합자와 다음 형제 결합자를 섞으면 직계 자식 사이에만 준다. 조합에 이론상 제한은 없지만 `.box > div > h1 + p`처럼 깊어질수록 관리가 어려워진다. 실무에서는 3~4단계 이상 이어 쓰지 않는다.

## 가상 클래스: 요소의 상태

가상 클래스(pseudo-class)는 **클래스를 동적으로 붙인 것처럼** 요소의 상태·위치에 반응한다. 콜론 하나(`:`)를 쓴다.

| 묶음 | 가상 클래스 | 맞는 때 |
| --- | --- | --- |
| 상호작용 | `:hover` | 포인터를 올렸을 때(터치에서는 탭한 뒤) |
| | `:active` | 누르고 있는 동안 |
| | `:focus`, `:focus-visible`, `:focus-within` | 포커스됨 / 포커스 표시가 필요할 때만 / 자손이 포커스됨 |
| | `:target` | URL 해시(`#content`)와 `id`가 같은 요소. 스킵 링크 대상 강조 |
| 방문 기록 | `:link`, `:visited` | 방문 전·후 링크 |
| 폼 | `:disabled`, `:enabled` | 비활성·활성 |
| | `:checked`, `:indeterminate` | 체크됨 / 전체 선택 체크박스처럼 중간 상태, 값을 모르는 `<progress>` |
| | `:placeholder-shown` | placeholder가 보이는(값이 빈) 입력 |
| | `:valid`, `:invalid`, `:in-range`, `:out-of-range` | HTML 검증 결과(`pattern`, `min`·`max`) |
| | `:user-invalid`, `:user-valid` | 사용자가 건드린 **뒤에만** 검증 결과. 처음부터 빨간 테두리가 뜨는 문제를 막는다 |
| | `:required`, `:optional` | `required` 유무 |
| 위치 | `:first-child`, `:last-child`, `:only-child` | 형제 중 첫·마지막·유일 |
| | `:first-of-type`, `:last-of-type`, `:only-of-type` | 같은 태그 형제 중 |
| | `:nth-child(An+B)`, `:nth-last-child()`, `:nth-of-type()` | 위치 공식. 인덱스는 1부터 |
| 기타 | `:empty` | 자식이 전혀 없음(공백 텍스트도 자식이다) |
| | `:popover-open` | 열린 팝오버([[popover-anchor-positioning\|팝오버와 앵커 위치 지정]]) |

```css
li:nth-child(3n + 3) {}                       /* 3, 6, 9…번째 */
li:nth-child(even) {}                         /* 짝수 */
tr:nth-child(even of :not([hidden])) {}       /* 숨긴 행을 빼고 센 짝수 행: 필터링되는 표의 줄무늬 */
.post :empty { display: none; }               /* 에디터가 남긴 빈 <p> 숨기기 */
input:user-invalid { border-color: var(--danger); }
```

- `:nth-child(An+B of S)`는 선택자 S에 맞는 형제만 세고 그중 위치를 고른다. `li:nth-of-type(even)` = `:nth-child(even of li)`지만 `of S`는 태그가 아닌 아무 선택자나 받는다.
- `.parent div:first-child`는 첫 자식이 `<p>`면 아무것도 고르지 않는다. "div 중 첫째"는 `:first-of-type`이다.
- `<div> </div>`처럼 공백이 있으면 `:empty`가 맞지 않는다.
- **링크는 LVHA 순서로**: `:link` → `:visited` → `:hover` → `:active`. 특정성이 같으면 뒤 규칙이 이기므로 순서가 바뀌면 호버가 방문 스타일에 묻힌다. `:visited`는 개인정보 보호 때문에 `color`, `background-color`, `border-color`, `outline-color`, SVG `fill`·`stroke` 색만 바꿀 수 있다.
- 상태를 색만으로 알리지 않는다. 빨강·초록만으로 오류·성공을 표시하면 색각 결핍 사용자가 놓친다. 아이콘과 글을 함께 쓴다([[color-motion-accessibility|색과 움직임의 접근성]]).
- `:focus { outline: none }`만 쓰면 키보드 사용자가 위치를 잃는다. 포커스 표시는 [[css-cursor-pointer#포커스 표시|포커스 표시]]와 [[keyboard-accessibility|키보드 접근성과 포커스 관리]]에 있다.

### 논리 가상 클래스

| 선택자 | 뜻 | 특정성 | 잘못된 인자가 있을 때 |
| --- | --- | --- | --- |
| `:is(A, B)` | A나 B 중 하나와 일치. 긴 선택자 목록을 묶는다 | 인자 중 가장 높은 값 | 관대함: 잘못된 것만 무시 |
| `:where(A, B)` | `:is()`와 같지만 덮어쓰기 쉽게 | 항상 0 | 관대함 |
| `:not(A)` | A가 아닌 것 | 인자 중 가장 높은 값 | 엄격함 |
| `:has(A)` | A를 자손(또는 `+`, `~`로 형제)으로 가진 요소. 자식 상태로 부모를 고른다 | 인자 중 가장 높은 값 | 엄격함: 하나라도 틀리면 규칙 전체 무효 |

```css
.post :is(h2, li, img) {}                        /* .post h2, .post li, .post img 의 축약 */
a:not([class]) { color: blue; }                  /* 클래스 없는 본문 링크 */
img:not([alt]) { outline: 10px solid red; }      /* alt 빠진 이미지 찾기 */
.card:has(img) { grid-template-rows: auto 1fr; } /* 이미지가 있는 카드만 */
form:has(input:valid) label::after { content: "✅"; }
:where(.prose) h2 { margin-top: 2em; }           /* 특정성 (0,0,1)이라 덮어쓰기 쉽다 */
```

- 일반 선택자 목록은 하나만 틀려도 규칙 전체가 버려진다. `:is()`·`:where()` 안에서는 틀린 것만 무시된다.
- `:has()`는 다른 `:has()` 안에 중첩할 수 없고, 인자에 가상 요소를 쓸 수 없다(`:has(::before)`는 규칙 전체가 무효).
- 네 가지 모두 모든 주요 브라우저가 지원한다(`:has()`는 2023년부터).

## 가상 요소: 실제로는 없는 요소

가상 요소(pseudo-element)는 HTML을 건드리지 않고 **요소를 하나 끼워 넣거나 요소의 일부를 겨눈다.** 콜론 두 개(`::`)를 쓴다. `:before`처럼 콜론 하나도 옛 호환을 위해 동작하지만 새 코드는 `::`로 쓴다. 개발자 도구에는 보이지만 HTML에는 없다.

| 가상 요소 | 겨누는 것 | 쓸 수 있는 속성 |
| --- | --- | --- |
| `::before`, `::after` | 요소 내용의 맨 앞·맨 뒤에 만든 자식. **`content`가 있어야** 생긴다 | 모든 속성 |
| `::first-letter` | 첫 글자. 블록 컨테이너에서만(인라인 요소엔 안 됨) | 색, 배경, 테두리, `float`, 글꼴, 텍스트 속성 |
| `::first-line` | 첫 줄. `block`·`inline-block`·`list-item`·`table-cell`·`table-caption`에서만 | 색, 배경, 글꼴, 텍스트 속성 |
| `::marker` | 목록 기호, `<summary>` 화살표 | 색, `content`, 글꼴, `white-space`, 애니메이션·전환([[css-lists-counters\|CSS 목록과 카운터]]) |
| `::selection` | 사용자가 선택한 글 | 색, `background-color`(이미지는 불가), 텍스트 장식·그림자 |
| `::placeholder` | 입력의 placeholder 글 | 색, 배경, 글꼴, 텍스트 속성 |
| `::backdrop` | 전체 화면·모달·팝오버 아래 깔리는 층 | 모든 속성 |
| `::cue`, `::cue(b)` | `<video>` 자막(WebVTT) 전체·자막 속 요소 | 색, 배경, 글꼴 등 |
| `::view-transition-*` | 화면 전환 스냅숏([[view-transitions\|View Transitions]]) | 애니메이션 속성 |

```css
p::first-letter { float: inline-start; font-size: 2.6em; line-height: 1; margin-inline-end: .2rem; }  /* 드롭캡 */
a[href$=".pdf"]::after { content: " (PDF)"; }
::selection { background: black; color: white; }
```

- `::before`·`::after`는 자식을 가질 수 있는 요소에만 붙는다. `<img>`, `<input>`, `<video>` 같은 대체 요소에는 생기지 않는다(체크박스는 예외적으로 된다).
- `content`가 빈 문자열이 아니면 스크린 리더가 읽을 수 있다. 장식은 `content: ""`로 두고, `url()` 이미지는 원래 크기로만 들어간다.
- 별도 `display`가 없으면 인라인으로 취급되고, 텍스트 복사 범위에 포함되지 않는다.
- `::placeholder`는 `<label>`을 대신하지 않는다([[accessible-forms|접근 가능한 폼과 오류 처리]]).

## 중첩(Nesting)

CSS는 Sass처럼 규칙 안에 규칙을 쓸 수 있다. 모든 주요 브라우저가 2023년 말부터 지원한다(Baseline 2023).

```css
.feature {
  button { color: blue; }          /* = .feature button (기본은 자손 관계) */
  > p { font-size: 1.3em; }        /* = .feature > p */
  + .heading { color: blue; }      /* = .feature + .heading */

  &:last-child {}                  /* = .feature:last-child  (& 붙여 씀 → 복합 선택자) */
  & :last-child {}                 /* = .feature :last-child (공백 → 자손) */
  &.highlight {}                   /* = .feature.highlight */
  .theme-dark & {}                 /* = .theme-dark .feature (&를 뒤에) */

  @media (min-width: 40em) { padding: 2rem; }
  @container (inline-size > 900px) {}
  @supports (display: grid) {}
  @layer components { h2 {} }
}
button { & + & { margin-inline-start: .5rem; } }   /* 버튼 바로 뒤 버튼 */
```

| 규칙 | 내용 |
| --- | --- |
| `&` | 부모 선택자를 뜻한다. **복합 선택자를 만들 때는 필수**(`&:hover`, `&.active`) |
| 타입 선택자와 붙일 때 | 타입이 앞: `p&`는 유효, `&p`는 무효. Sass에서 `&p`가 `.featurep`로 이어 붙는 문법과 충돌하지 않게 하려는 규칙이다 |
| 특정성 | `&`는 `:is(부모 목록)`처럼 계산된다. `#main-header, .intro { & a {} }`는 `:is(#main-header, .intro) a`라 (1,0,1)이다. `.intro a`(0,1,1)로 덮어쓸 수 없다 |
| 가상 요소 | `&`는 가상 요소를 나타낼 수 없다. `blockquote::before { & {} }` 안의 선언은 `blockquote`에만 적용된다 |
| 중첩 가능한 at 규칙 | `@media`, `@container`, `@supports`, `@layer` 등 조건부 그룹 규칙. `@import`는 안 된다 |
| 깊이 | 제한은 없지만 2~3단계를 넘으면 특정성과 가독성이 나빠진다 |

## 캐스케이딩: 무엇이 적용되는가

```html
<div class="box area">무슨 색일까?</div>
```

```css
.box { color: red; }
.area { color: blue; } /* 같은 특정성이면 나중에 선언된 것이 이긴다 → 파랑 */
```

적용 순서는 **출처·중요도(`!important`) → 인라인 스타일 → `@layer` 순서 → 특정성 → 선언 순서**다. 출처(브라우저·사용자·작성자)와 섀도 DOM, 애니메이션·전환까지 포함한 전체 표는 [[how-css-works|CSS가 동작하는 방식]]에 있다. 레이어 순서는 특정성보다 먼저라, 뒤 레이어의 단순한 선택자가 앞 레이어의 복잡한 선택자를 이긴다.

```css
@layer reset, base, components, utilities;  /* 뒤로 갈수록 강하다 */
@layer components { #nav .link { color: gray; } }
@layer utilities  { .text-red { color: red; } }  /* 특정성이 낮아도 이긴다 */
```

선언 순서는 마지막 결정 기준이다. 같은 규칙 안에서 같은 속성을 두 번 쓰면 뒤가 이기고, 브라우저는 이해하지 못한 값을 **오류 없이 무시**한다. 이것으로 폴백을 만든다.

```css
.title {
  font-size: 1.5rem;                          /* clamp()를 모르는 브라우저용 */
  font-size: clamp(1.5rem, 1rem + 3vw, 2rem);
}
```

### 특정성 계산

선택자를 `(A, B, C)` 세 자리로 센다. 십진수가 아니라 **앞자리부터 비교**한다. `(1,0,0)`은 `(0,4,3)`보다 높다.

| 자리 | 세는 것 | 0인 것 |
| --- | --- | --- |
| A (ID급) | `#id` | `[id="x"]`는 속성이라 B다 |
| B (클래스급) | 클래스, 속성, 가상 클래스 | `:where()`, `:is()`·`:not()`·`:has()` 자신(인자 값으로 대체) |
| C (요소급) | 요소, 가상 요소 | `*`, 결합자 |

```css
#box {}                          /* (1,0,0) */
.box .area {}                    /* (0,2,0) */
a.my-class.another-class[href]:hover {}  /* (0,4,1) */
article:hover a[href] {}         /* (0,2,2) */
div:not(.my-class) {}            /* (0,1,1) */
:is(h1, h2, #title) {}           /* (1,0,0): 인자 중 가장 높은 값 */
:where(#content) {}              /* (0,0,0): 뒤의 p {} 가 이긴다 */
```

특정성에 영향을 **주지 않는** 것:

- **인라인 `style`**: 특정성이 아니라 그보다 앞 단계(요소에 붙은 스타일)에서 이긴다. 스타일시트로 덮으려면 `!important`가 필요하다.
- **`!important`**: 특정성을 올리는 게 아니라 선언을 다른 출처(작성자 important)로 옮긴다. 둘 다 `!important`면 다시 특정성으로 비교한다.

특정성 관리 원칙:

- 특정성은 **필요한 만큼만** 높인다. 높게 쌓아 두면 나중에 정말 중요한 스타일을 덮기 어렵다.
- 불가피하게 올려야 하면 `.my-button.my-button`처럼 같은 클래스를 반복해 (0,2,0)을 만들 수 있다. 자주 필요하다면 다른 선택자가 너무 구체적이라는 신호다.
- 리셋·기본 스타일은 `:where()`로 0으로 두고, 라이브러리는 `@layer`에 넣어 순서로 다스린다.

## 상속

부모에 적용한 스타일 중 일부는 자손에게 그대로 전달된다. 상속은 **아래로만** 흐른다.

| 상속됨(기본) | 상속되지 않음 |
| --- | --- |
| `color`, `font`와 `font-*`, `line-height`, `letter-spacing`, `word-spacing`, `text-align`, `text-indent`, `text-transform`, `white-space`, `direction`, `visibility`, `cursor`, `list-style-*`, `border-collapse`, `border-spacing`, `caption-side`, `empty-cells`, `quotes`, `orphans`, `widows` | 박스 모델(`width`, `margin`, `padding`, `border`), `background`, `position`·`display` 관련, `animation`, `opacity` 등 나머지 |

모든 속성은 **초깃값(initial value)**을 가진다. 캐스케이드로 정해진 값이 없을 때, 상속되는 속성은 부모의 계산값을, 상속되지 않는 속성은 초깃값을 쓴다. 상속되는 속성이라도 브라우저 기본 스타일이 값을 주면 그 값이 이긴다. `<strong>`이 굵은 이유, `<input>`·`<button>`이 글꼴을 물려받지 않는 이유다.

```css
body { font-size: 18px; line-height: 1.5; color: #333; }
input, button, select, textarea { font: inherit; color: inherit; }  /* 폼 요소도 물려받게 */
```

`opacity`는 상속되는 속성이 아니다. 부모를 반투명하게 하면 자식까지 함께 그려지기 때문에 상속처럼 보일 뿐이다.

### 값을 되돌리는 전역 키워드

모든 속성에 쓸 수 있다.

| 키워드 | 결과 | 쓰는 때 |
| --- | --- | --- |
| `inherit` | 부모의 계산값 | 예외 만들기: `.my-component strong { font-weight: inherit; }` — 컴포넌트 굵기가 바뀌어도 따라간다 |
| `initial` | 속성의 **명세상 초깃값**(브라우저 기본 스타일 아님) | `aside strong { font-weight: initial; }` — `display: initial`은 `inline`이라 주의 |
| `unset` | 상속되는 속성이면 `inherit`, 아니면 `initial` | 어느 쪽인지 외우지 않고 지울 때: `margin: unset; color: unset;` |
| `revert` | 작성자 스타일을 모두 취소하고 **사용자·브라우저 기본 스타일**로 | `aside p { padding: revert; }` — 브라우저 기본값으로 |
| `revert-layer` | **현재 레이어**의 값만 취소하고 이전 레이어 값으로 | 라이브러리를 낮은 레이어에 넣고 덮어쓴 값을 해제할 때 |

`all` 속성은 거의 모든 속성을 한 번에 되돌린다. `aside p { all: unset; }`은 나중에 전역 `p` 규칙에 속성이 늘어나도 계속 지운다.

## 핵심 정리

- 선택자는 기본 선택자 → 결합자 → 가상 클래스·요소 순으로 확장된다. 위로(부모) 고르는 것은 `:has()`만 한다.
- 겹치는 스타일은 출처·`!important` → 인라인 스타일 → `@layer` 순서 → 특정성 → 선언 순서로 결정된다.
- 특정성은 (ID, 클래스, 요소) 세 자리를 앞에서부터 비교한다. 인라인 스타일과 `!important`는 특정성이 아니라 앞 단계에서 이긴다.
- `:is()`·`:where()`·`:has()`로 선택자를 묶고, `:where()`로 특정성을 0으로 낮춘다.
- 네이티브 중첩에서 `&`는 `:is(부모)`처럼 계산된다. 2~3단계 이상 중첩하지 않는다.
- 글꼴·색상은 상속되고 박스·위치 관련 속성은 상속되지 않는다. `inherit`·`initial`·`unset`·`revert`·`revert-layer`로 되돌린다.

관련 노트: [[how-css-works|CSS가 동작하는 방식: 핵심 개념과 픽셀이 되기까지]], [[oocss|객체 지향 CSS(OOCSS)]], [[sass|Sass: 파일 구조, 믹스인과 @extend]], [[css-lists-counters|CSS 목록과 카운터]], [[devtools-elements-css|DevTools로 DOM과 CSS 다루기]], [[constraint-validation|제약 검증: required·pattern·ValidityState]]
