---
title: "CSS 실전 팁: 리셋과 작은 패턴"
concept: "CSS Tips"
summary: "프로젝트마다 반복해 쓰는 짧은 CSS 패턴 모음. 새 프로젝트의 출발점이 되는 최소 리셋(box-sizing·margin·line-height·미디어·폼 글꼴)과 all: unset으로 버튼 초기화하기, 쉼표 목록·빈 링크 주소 표시·깨진 이미지 꾸미기·연속 <br> 숨기기 같은 생성 콘텐츠·선택자 패턴, table-layout: fixed와 높이 펼치기 애니메이션, 그리고 다른 노트에 집이 있는 팁의 위치와 이제 쓰지 않는 옛 팁."
tags: ["css", "selector", "layout", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://github.com/AllThingsSmitty/css-protips", "https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout", "https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size", "https://developer.mozilla.org/en-US/docs/Web/CSS/all"]
---

> AllThingsSmitty의 「[CSS Protips](https://github.com/AllThingsSmitty/css-protips)」를 바탕으로 팁마다 현재 브라우저 지원을 MDN으로 확인해 재구성한 노트다. 다른 노트에 이미 설명이 있는 팁은 그 노트로 보내고, 지금은 필요 없는 우회법은 맨 아래에 이유만 남겼다.

팁 하나하나는 몇 줄짜리지만 **같은 원리**를 반복해 쓴다. 상속되는 값은 조상에 한 번만 주고, 예외를 지우는 대신 `:not()`으로 처음부터 빼고, HTML을 고칠 수 없을 때는 선택자와 생성 콘텐츠로 메운다. 각 팁의 지원 범위는 2026년 10월 기준이다.

## 출발점: 최소 리셋

브라우저 기본 스타일(UA 스타일시트)은 브라우저마다 조금씩 다르고, 앱 화면에는 맞지 않는 여백이 많다. 그래서 새 프로젝트는 몇 줄짜리 리셋으로 시작한다.

```css
@layer reset {
  html { box-sizing: border-box; }
  *, *::before, *::after { box-sizing: inherit; margin: 0; }

  body { line-height: 1.5; }
  img, picture, video, canvas, svg { display: block; max-inline-size: 100%; }
  input, button, textarea, select { font: inherit; }
  p, h1, h2, h3 { overflow-wrap: break-word; }
}
```

| 줄 | 하는 일 |
| --- | --- |
| `box-sizing: inherit` | `html`의 `border-box`를 물려받는다. 외부 위젯은 감싼 요소만 `content-box`로 바꾸면 된다([[box-model#box-sizing\|박스 모델의 box-sizing]]) |
| `margin: 0` | 제목·문단·목록의 기본 위아래 여백을 지운다. 간격은 컨테이너에서 `gap`이나 `.flow > * + *`로 다시 준다 |
| `body { line-height: 1.5 }` | `line-height`는 상속되므로 `p`·`h*`마다 줄 필요가 없다. 단위 없는 수로 줘야 자식의 글자 크기에 맞춰 다시 계산된다([[line-height-vertical-align\|line-height와 vertical-align]]) |
| 미디어 `display: block` | 인라인 이미지 아래의 틈을 없애고, `max-inline-size: 100%`로 부모를 넘지 않게 한다 |
| 폼 요소 `font: inherit` | 폼 컨트롤은 글꼴을 상속하지 않는 것이 기본이라 본문과 다른 글꼴·크기로 보인다 |
| 긴 단어 `overflow-wrap` | 긴 URL·영단어가 좁은 칸을 뚫고 나가지 않게 줄을 바꾼다 |

- `padding: 0`까지 전체에 주는 리셋도 흔하지만, 목록 들여쓰기·`<fieldset>`·`<button>` 안쪽 여백까지 지워 다시 채워야 할 곳이 많아진다. 필요한 요소에만 준다.
- `@layer reset`(또는 `:where()`)에 넣으면 리셋의 특정성이 뒤 레이어보다 늘 약해 덮어쓰기가 쉽다([[selectors#캐스케이딩: 무엇이 적용되는가|캐스케이딩]]).
- 리셋은 브라우저 차이를 지우는 것, 노멀라이즈(normalize.css)는 기본값을 살려 두고 차이만 맞추는 것이다. 지금은 브라우저 간 차이가 작아 위 정도의 짧은 리셋이 보통이다.

### all: unset으로 버튼 비우기

버튼을 링크처럼 보이게 하는 등 기본 모양을 통째로 지울 때는 속성을 하나씩 지우지 않고 `all`을 쓴다.

```css
.text-button {
  all: unset;              /* 상속 속성은 inherit, 나머지는 initial로 */
  cursor: pointer;
}
.text-button:focus-visible { outline: 2px solid; outline-offset: 2px; }
```

`all: unset`은 **포커스 링과 `display`까지 지운다.** `display`가 `inline`이 되고 포커스 표시가 사라지므로 포커스 스타일을 반드시 다시 준다. 브라우저 기본값으로 되돌리려면 `unset` 대신 `revert`를 쓴다(→ [[selectors#값을 되돌리는 전역 키워드|값을 되돌리는 전역 키워드]]). 모든 주요 브라우저가 지원한다.

## 생성 콘텐츠와 선택자 패턴

HTML을 직접 고칠 수 없는 CMS 글, 에디터가 만든 마크업을 다듬을 때 쓴다.

### 쉼표로 이어진 목록

```css
.tags { display: flex; flex-wrap: wrap; list-style: none; padding: 0; }
.tags > li:not(:last-child)::after { content: ","; margin-inline-end: .25em; }
```

마지막 항목만 빼려고 `:not(:last-child)`를 쓴다. `::after`의 쉼표는 복사·붙여넣기에 포함되지 않고, 스크린 리더마다 읽기도 다르다. 목록이라는 의미는 `<ul>`이 이미 전하므로 쉼표는 순수한 장식일 때만 CSS로 넣는다.

### 텍스트 없는 링크에 주소 보여 주기

```css
a[href^="http"]:empty::before { content: attr(href); }
```

에디터에 `<a href="https://…"></a>`처럼 텍스트 없이 남은 링크를 보이게 한다. 다만 화면에만 생길 뿐 링크의 접근 가능한 이름으로 믿을 수 없으므로, 근본 해결은 콘텐츠에 링크 텍스트를 넣는 것이다. `:empty`는 공백 한 칸만 있어도 맞지 않는다.

### 깨진 이미지 꾸미기

`<img>`는 대체 요소라 평소엔 `::before`·`::after`가 생기지 않지만, **이미지를 불러오지 못했을 때는** Chrome·Edge·Firefox가 가상 요소를 그린다. Safari는 그리지 않고 기본 깨진 이미지 표시를 보여 준다. 그래서 장식으로만 쓴다.

```css
img { display: block; inline-size: 100%; block-size: auto; position: relative;
      font-family: sans-serif; text-align: center; line-height: 2; }
img::before { content: "이미지를 불러오지 못했다"; display: block; }
img::after  { content: "(url: " attr(src) ")"; display: block; font-size: .75rem; }
```

### 연속된 `<br>` 숨기기

```css
br + br { display: none; }
```

CMS 사용자가 여백을 만들려고 줄바꿈을 여러 번 넣으면, 첫 `<br>`만 남기고 나머지를 지워 문단 간격을 CSS가 정한 대로 유지한다.

### 그 밖의 선택자 패턴

| 패턴 | 코드 | 설명이 있는 곳 |
| --- | --- | --- |
| 마지막을 뺀 항목 사이 구분선 | `.nav li:not(:last-child) { border-inline-end: 1px solid }` | [[selectors\|CSS 선택자와 우선순위]] |
| 처음 n개만 | `li:nth-child(-n + 3)` | 같은 노트의 위치 가상 클래스 |
| 클래스 없는 본문 링크 | `a[href]:not([class])` | 같은 노트의 논리 가상 클래스 |
| 긴 선택자 목록 묶기 | `:is(section, article) :is(h1, h2, h3)` | 같은 노트의 논리 가상 클래스 |
| 빈 요소 숨기기 | `.error-message:empty { display: none }` | 같은 노트. 전역 `:empty`는 쓰지 않는다 |
| 형제 사이 간격(올빼미 선택자) | `.flow > * + * { margin-block-start: 1em }` | 같은 노트의 결합자, [[box-model\|박스 모델]]의 간격 |

## 레이아웃 팁

### 표 칸 너비 고정: table-layout: fixed

```css
.calendar { table-layout: fixed; inline-size: 100%; }
```

기본 `auto`는 모든 셀의 내용을 읽은 뒤 열 너비를 정한다. `fixed`는 **첫 행(또는 `<col>`)의 너비만 보고** 열을 정하고, 너비가 없으면 균등하게 나눈다. 달력처럼 칸이 같은 폭이어야 할 때 맞고, 큰 표도 내용을 다 읽기 전에 그릴 수 있다. 넘치는 내용은 `overflow`·`text-overflow`로 처리한다([[css-overflow-scroll|CSS 오버플로와 스크롤]]). 모든 브라우저가 지원한다.

### 높이 펼치기 애니메이션

`height: auto`로는 전환이 일어나지 않아, 예전에는 `max-height`를 충분히 큰 값으로 전환하는 우회법을 썼다.

```css
.panel       { max-height: 200px; overflow-y: hidden; transition: max-height .3s; }
.panel.open  { max-height: 600px; overflow-y: auto; }   /* 실제 높이보다 커야 한다 */
```

`max-height`가 실제 높이보다 크면 그만큼 전환 시간이 헛돌아 닫힐 때 늦게 반응하고, 내용이 그보다 길면 잘린다. 지금은 `auto`로 직접 전환할 수 있다.

```css
:root { interpolate-size: allow-keywords; }   /* auto·min-content 같은 키워드로 전환 허용 */
.panel      { block-size: 0; overflow: hidden; transition: block-size .3s; }
.panel.open { block-size: auto; }
```

`interpolate-size`는 Chromium 129(2024)에서 먼저 들어왔다. 지원하지 않는 브라우저에서는 전환 없이 바로 펼쳐질 뿐이라 점진적 향상으로 쓴다([[css-progressive-enhancement|CSS 점진적 향상]]). `calc-size(auto, size)` 함수로 요소마다 켤 수도 있다. 움직임 줄이기 설정을 존중하는 법은 [[css-animation|CSS 애니메이션]]에 있다.

## 다른 노트에 있는 팁

| 팁 | 지금의 방법 | 노트 |
| --- | --- | --- |
| 가운데 정렬 | `display: grid; place-items: center` | [[transform#가운데 정렬 패턴\|transform의 가운데 정렬]] |
| 비율 유지 | `aspect-ratio: 16 / 9; object-fit: cover` | [[cls-optimization\|CLS 최적화]], [[responsive-design\|반응형 디자인]] |
| 아이콘은 SVG | 인라인 SVG나 `<use>` 스프라이트 | [[svg-icons\|SVG 아이콘]] |
| 폼 포커스 강조 | `:focus` 대신 `:focus-visible` + `outline-offset` | [[css-cursor-pointer#포커스 표시\|포커스 표시]] |
| 비활성 버튼 클릭 막기 | `pointer-events: none`보다 `disabled` 속성 | [[css-cursor-pointer#상호작용 끄기: pointer-events\|pointer-events]] |
| 모바일 폼 확대 막기 | 입력 글자 `font-size`를 16px(1rem) 이상 | [[form-styling\|폼 스타일링]] |
| 전역 크기는 rem, 지역 크기는 em | 컴포넌트 안 여백은 `em`으로 글자 크기를 따라가게 | [[css-basics\|CSS 기초의 크기 단위]] |
| 화면에 맞춰 변하는 글자 크기 | `clamp(1rem, 0.75rem + 1.5vw, 2rem)` | [[responsive-design\|반응형 디자인]], [[css-functions\|CSS 함수]] |
| `margin-left`·`right` 대신 | `margin-inline` | [[logical-properties\|쓰기 모드와 논리적 속성]] |
| 로컬 글꼴 먼저 찾기 | `src: local(…)` — 효과가 브라우저마다 다르다 | [[web-typography\|웹 타이포그래피]] |

## 이제 쓰지 않는 팁

| 옛 팁 | 대신 | 이유 |
| --- | --- | --- |
| `padding-bottom: 56.25%` + 절대 위치 자식으로 비율 상자 | `aspect-ratio` | 모든 주요 브라우저가 2021년부터 지원한다 |
| `justify-content: space-between` + `flex-basis: 23%`로 거터 만들기 | `gap` | 플렉스의 `gap`이 2021년부터 모든 주요 브라우저에 있다. 마지막 줄 항목 수가 모자라면 `space-between`은 간격이 벌어진다 |
| `:root { font-size: calc(1vw + 1vh + .5vmin) }` | `clamp()`에 `rem`을 섞기 | 뷰포트 단위만 쓰면 사용자가 브라우저를 확대해도 글자가 커지지 않는다(WCAG 1.4.4) |
| `video[autoplay]:not([muted]) { display: none }` | 브라우저 자동 재생 정책 | 소리 있는 자동 재생은 브라우저가 이미 막는다. 사용자 스타일시트용이던 팁이다 |
| `.no-svg` 클래스로 SVG 실패 대비 | 없음 | 모든 브라우저가 SVG를 지원한다. 아이콘 버튼의 이름은 `aria-label`로 준다 |

## 정리

- 새 프로젝트는 `box-sizing` 상속, `margin: 0`, `body`의 단위 없는 `line-height`, 미디어 `block`, 폼 `font: inherit` 정도의 짧은 리셋을 `@layer reset`에 두고 시작한다.
- `all: unset`은 포커스 링까지 지우므로 `:focus-visible` 스타일을 다시 준다.
- 「모두 주고 마지막만 지우기」 대신 `:not(:last-child)`처럼 처음부터 대상을 좁힌다.
- 생성 콘텐츠(`::before`·`::after`)는 복사되지 않고 스크린 리더가 다르게 읽으니 장식에만 쓴다.
- 옛 팁은 우회하던 문제가 표준(`aspect-ratio`, `gap`, `interpolate-size`)으로 풀렸는지 먼저 확인한다.

관련 노트: [[selectors|CSS 선택자와 우선순위]], [[box-model|박스 모델과 display]], [[css-basics|CSS 기초: 문법, 적용 방법, 단위]], [[css-progressive-enhancement|CSS 점진적 향상: 폴백과 피처 쿼리]], [[css-history|CSS의 역사로 본 CSS가 어려워진 이유]]
