---
title: "CSS 그리드 레이아웃"
concept: "CSS Grid"
summary: "행과 열을 동시에 다루는 2차원 레이아웃 CSS 그리드의 용어, 핵심 속성, fr·minmax·auto-fill 같은 크기 도구와 명시적·묵시적 그리드, 서브그리드, 그리고 접근성과 플렉스박스와의 역할 분담 같은 실무 원칙."
tags: ["css", "layout", "grid", "frontend"]
source: other
date: "2026-10-13"
sources: ["https://webactually.com/2019/06/05/%ea%b7%b8%eb%a6%ac%eb%93%9c-%ec%99%84%eb%b2%bd-%ea%b0%80%ec%9d%b4%eb%93%9c/", "https://webactually.com/2018/07/02/css-%ea%b7%b8%eb%a6%ac%eb%93%9c-%eb%a0%88%ec%9d%b4%ec%95%84%ec%9b%83-%eb%aa%a8%eb%b2%94-%ec%82%ac%eb%a1%80/", "https://webactually.com/2018/08/06/css-%ea%b7%b8%eb%a6%ac%eb%93%9c-%eb%a0%88%eb%b2%a82-%ec%84%9c%eb%b8%8c%ea%b7%b8%eb%a6%ac%eb%93%9c-2/", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid", "https://web.dev/learn/css/grid"]
---

> CSS-Tricks의 「[그리드 완벽 가이드](https://webactually.com/2019/06/05/%ea%b7%b8%eb%a6%ac%eb%93%9c-%ec%99%84%eb%b2%bd-%ea%b0%80%ec%9d%b4%eb%93%9c/)」(2019.06)와 Rachel Andrew의 「CSS 그리드 레이아웃 모범 사례」(2018.07)·「CSS 그리드 레벨2: 서브그리드」(2018.08, 웹액츄얼리 번역)를 바탕으로 재구성하고, web.dev 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Grid 모듈로 보강한 노트다.

## 그리드란

CSS 그리드(Grid Layout)는 **행과 열을 동시에** 다루는 2차원 레이아웃 시스템이다. 부모(그리드 컨테이너)에 선을 긋고, 자식(그리드 아이템)을 그 선에 맞춰 놓는다. float·inline-block·테이블로 흉내 내던 격자를 처음으로 CSS가 직접 지원하게 됐다.

플렉스박스는 한 방향으로 흐르는 아이템을 내용 크기에 맞춰 늘이고 줄이는 데 강하다. 그리드는 **틀을 먼저 정하고 아이템을 그 틀에 넣는** 데 강하다. 둘은 경쟁 관계가 아니며 한 페이지에서 섞어 쓴다([[flexbox|Float와 Flexbox 레이아웃]]).

## 용어

| 용어 | 뜻 |
| --- | --- |
| 그리드 컨테이너 | `display: grid`를 준 요소. 직계 자식만 그리드 아이템이 된다 |
| 그리드 라인(line) | 트랙을 나누는 선. 1부터 번호가 붙고, 끝에서부터는 -1, -2… |
| 그리드 트랙(track) | 두 라인 사이의 행 또는 열 하나 |
| 그리드 셀(cell) | 행 트랙과 열 트랙이 겹치는 한 칸 |
| 그리드 영역(area) | 라인 네 개로 둘러싼 직사각형. 여러 셀을 묶을 수 있다 |
| 간격(gap) | 트랙 사이 여백. 예전 이름은 `grid-gap` |

## 핵심 속성

| 쪽 | 속성 | 하는 일 |
| --- | --- | --- |
| 컨테이너 | `grid-template-columns` / `-rows` | 트랙의 개수와 크기 정의 (명시적 그리드) |
| 컨테이너 | `grid-template-areas` | 영역에 이름을 붙여 아스키 아트처럼 배치 |
| 컨테이너 | `gap` (`row-gap`, `column-gap`) | 트랙 사이 간격 |
| 컨테이너 | `grid-auto-rows` / `-columns` | 자동으로 생기는 트랙의 크기 (묵시적 그리드) |
| 컨테이너 | `grid-auto-flow` | 자동 배치 방향. `row`(기본), `column`, `dense` |
| 컨테이너 | `justify-items` / `align-items` | 셀 안에서 아이템 정렬 (인라인축 / 블록축) |
| 컨테이너 | `justify-content` / `align-content` | 그리드 전체가 컨테이너보다 작을 때 트랙 묶음 정렬 |
| 아이템 | `grid-column` / `grid-row` | 시작·끝 라인 지정. `1 / 3`, `span 2` |
| 아이템 | `grid-area` | 영역 이름, 또는 `행시작 / 열시작 / 행끝 / 열끝` |
| 아이템 | `justify-self` / `align-self` | 이 아이템만 셀 안에서 정렬 |

`place-items`, `place-content`, `place-self`는 `align-*`과 `justify-*`를 한 줄로 쓰는 축약이다.

```css
.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "header header"
    "nav    main"
    "footer footer";
  gap: 16px;
}
.page > header { grid-area: header; }
.page > nav    { grid-area: nav; }
.page > main   { grid-area: main; }
.page > footer { grid-area: footer; }
```

`grid-area`의 네 값 순서가 `margin`의 위·오른쪽·아래·왼쪽과 다른 이유는 그리드가 물리 방향이 아니라 **시작 두 개, 끝 두 개**로 생각하기 때문이다([[logical-properties|쓰기 모드와 논리적 속성]]).

## 크기를 정하는 도구

| 도구 | 의미 | 쓰는 때 |
| --- | --- | --- |
| `fr` | 남은 공간을 비율로 나눈다 | 기본 선택. 고정 트랙·간격을 먼저 빼고 나머지를 나눈다 |
| `%` | 컨테이너 너비 기준 | float·flex 기반 기존 레이아웃 안에 그리드를 끼워 넣어 단위를 맞춰야 할 때 |
| `minmax(최소, 최대)` | 트랙 크기의 범위 | `minmax(200px, auto)`: 최소 200px, 내용이 많으면 늘어남 |
| `repeat(n, …)` | 패턴 반복 | `repeat(12, 1fr)` |
| `auto-fill` / `auto-fit` | 들어갈 수 있는 만큼 트랙 생성 | 미디어 쿼리 없이 열 개수가 바뀌는 카드 목록 |
| `min-content` / `max-content` | 내용의 최소(가장 긴 단어)·최대(한 줄로 늘인) 크기 | 내용에 딱 맞는 열 |
| `fit-content(한계)` | `max-content`처럼 굴다가 한계에 닿으면 줄바꿈 | `fit-content(20ch)`: 짧은 내용엔 좁게, 길어도 20ch까지 |
| `auto` | 내용 크기. 컨테이너에 공간이 남으면 **늘어난다** | 트랙의 기본값 |

```css
/* 열 너비 최소 240px, 화면이 넓어지면 열 개수가 자동으로 늘어난다 */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
```

`auto-fill`과 `auto-fit`은 트랙이 다 차기 전까지만 다르다. 아이템이 두 개뿐인 넓은 컨테이너에서 `auto-fill`은 **빈 트랙을 남겨 두고**, `auto-fit`은 빈 트랙을 0으로 접어 **있는 아이템이 남은 공간을 차지하게** 한다. 카드가 적을 때도 늘어나게 하려면 `auto-fit`, 칸 너비를 일정하게 지키려면 `auto-fill`이다.

`repeat()`는 패턴도 반복한다. `200px repeat(2, 1fr 2fr) 200px`는 트랙 6개다.

**함정**: `1fr`의 최솟값은 사실상 `auto`(내용의 최소 크기)다. 긴 단어나 넓은 이미지가 있으면 그 트랙만 넓어진다. 모든 트랙을 정확히 같은 너비로 만들려면 `minmax(0, 1fr)`을 쓴다. 대신 내용이 넘칠 수 있다. 플렉스박스의 `min-width: auto` 함정과 같은 원리다.

## 명시적 그리드와 묵시적 그리드

| | 명시적(explicit) | 묵시적(implicit) |
| --- | --- | --- |
| 만드는 방법 | `grid-template-*`로 직접 정의 | 정의한 칸보다 아이템이 많으면 브라우저가 자동 생성 |
| 크기 지정 | 트랙마다 정확히 | `grid-auto-rows` 한 가지로 일괄 |
| 라인 이름·`-1` | 쓸 수 있다 | `-1`은 명시적 그리드의 끝만 가리킨다 |
| 어울리는 상황 | 콘텐츠 양과 칸 수를 알 때 | 콘텐츠 양을 모를 때 |

둘을 섞는 것이 흔하다. 열은 명시적으로 정하고, 행은 `grid-auto-rows: minmax(300px, auto)`로 내용에 따라 늘어나게 둔다.

## 배치 더 알기

### 자동 배치 다듬기

- 기본은 소스 순서대로 **행을 따라** 한 칸씩 채운다. `grid-auto-flow: column`이면 열을 따라 채우는데, 행 트랙을 정의하지 않으면 모든 아이템이 한 줄로 늘어선다. 행·열 방향은 쓰기 모드를 따른다.
- `grid-column: auto / span 2`(= `grid-column-end: span 2`)는 자동 배치하면서 두 칸을 차지한다.
- 큰 아이템이 안 들어가면 그리드는 칸을 비워 두고 **앞으로만** 나아간다. `grid-auto-flow: dense`는 뒤 아이템으로 빈칸을 메우지만 화면 순서가 소스 순서와 어긋난다.

### 라인 번호, 이름, 영역

```css
.layout {
  display: grid;
  grid-template-columns: [full-start] 1fr [content-start] minmax(0, 60rem) [content-end] 1fr [full-end];
}
.layout > * { grid-column: content; }              /* content-start ~ content-end */
.layout > .bleed { grid-column: full-start / full-end; }
.banner { grid-column: 1 / -1; }                   /* 명시적 그리드 처음부터 끝까지 */
```

- 라인 번호는 1부터, 쓰기 모드와 방향을 따른다(RTL이면 1번 라인이 오른쪽).
- `[이름]`으로 라인에 이름을 붙이고 번호 대신 쓴다. 한 라인에 이름을 여러 개 줄 수 있다. `content-start`·`content-end`처럼 `-start`·`-end`로 끝나는 쌍은 `content`라는 영역 이름처럼도 쓸 수 있다.
- `grid-template-areas` 규칙: 모든 칸을 채워야 하고, 이름을 반복해 칸을 합치며, 합친 영역은 **직사각형이고 끊기지 않아야** 한다. 빈칸은 `.`(붙여 쓴 `...`도 하나의 빈칸)이다. 규칙을 어기면 선언 전체가 무효다. `auto`, `span`은 영역 이름으로 쓸 수 없다.
- 한 곳에 레이아웃이 다 보여, 미디어 쿼리에서 `grid-template-areas`만 바꿔 배치를 재구성하기 쉽다.

### 겹치기

라인으로 배치하면 여러 아이템을 **같은 칸**에 놓을 수 있다. 소스에서 뒤에 오는 아이템이 위에 그려지고, `position` 없이도 `z-index`로 순서를 바꾼다. 이미지 위 캡션을 `position: absolute` 없이 겹칠 때 쓴다.

```css
.figure { display: grid; }
.figure > * { grid-area: 1 / 1; }          /* 이미지와 캡션을 같은 칸에 */
.figure > figcaption { align-self: end; z-index: 1; }
```

### 축약형

| 축약형 | 묶는 속성 | 주의 |
| --- | --- | --- |
| `grid-template` | rows, columns, areas | `"a a" 행크기 "b c" 행크기 / 열크기들`처럼 행 정의 뒤 `/`로 열 |
| `grid` | 위 셋 + `grid-auto-rows`, `grid-auto-columns`, `grid-auto-flow` | 쓰지 않은 하위 속성을 **초깃값으로 되돌린다**. `grid: repeat(2, 80px) / auto-flow 120px`처럼 묵시적 그리드도 정한다 |

### 셀 안 정렬

`justify-*`는 인라인 축, `align-*`은 블록 축이다([[logical-properties|쓰기 모드와 논리적 속성]]). `justify-self`·`align-self`의 초깃값은 `stretch`라 배경이 있는 아이템이 칸을 꽉 채워 보인다. 다만 **이미지처럼 고유 비율이 있는 아이템은 늘어나 찌그러지지 않도록 `start`처럼** 놓인다. `justify-content`·`align-content`로 트랙 묶음을 정렬하면 `space-between`일 때 간격이 넓어지고, 두 트랙에 걸친 아이템은 넓어진 간격만큼 함께 커진다.

## 서브그리드

그리드 아이템을 다시 그리드 컨테이너로 만드는 중첩은 자유롭다. 하지만 일반 중첩 그리드는 **부모의 트랙과 무관한 새 그리드**다. 그래서 카드마다 제목 길이가 다르면 카드끼리 헤더·본문·푸터 줄이 어긋난다.

서브그리드(subgrid)는 자식 그리드가 부모의 트랙을 그대로 빌려 쓰게 한다. 그리드 레벨 2 명세의 기능이며 2023년 9월부터 모든 주요 브라우저가 지원한다(Baseline 2023).

```css
.cards { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: auto auto auto; }
.card {
  grid-row: span 3;                 /* 부모의 행 3개를 차지하고 */
  display: grid;
  grid-template-rows: subgrid;      /* 그 행 트랙을 그대로 쓴다 */
}
```

- 한 카드의 제목이 길어 부모 행이 늘면 다른 카드의 같은 행도 함께 늘어 **모든 카드의 헤더·푸터 줄이 맞는다**.
- 한 축만 서브그리드로 하고 다른 축은 자기 트랙을 정의할 수 있다.
- 라인 번호는 서브그리드 안에서 다시 1부터 센다. 부모의 라인 이름은 물려받는다.
- 간격은 부모 것을 물려받되 재정의할 수 있다. 서브그리드로 지정한 축에는 묵시적 트랙이 생기지 않는다.

## 실무 원칙

### 1. 보이는 순서와 소스 순서를 어긋나게 하지 않는다

그리드는 아이템을 어디든 놓을 수 있어 재배치가 너무 쉽다. 키보드 탐색과 스크린 리더는 **화면 순서가 아니라 소스 순서**를 따른다. 명세도 배치 속성은 시각적 재배치에만 쓰라고 한다. `order`, `grid-auto-flow: dense`, 플렉스의 `-reverse`도 같은 주의가 필요하다. 논리적 순서를 바꾸고 싶으면 HTML을 고친다.

### 2. 자동 배치와 직접 배치를 섞을 때는 조심한다

아이템 한두 개만 직접 놓고 나머지를 자동 배치에 맡기면, 나중에 누가 아이템을 추가했을 때 엉뚱한 칸에 끼어들 수 있다. 배치를 시작했다면 모두 직접 놓는 편이 안전하다. 그러면 새 아이템은 최소한 끝에 붙는다.

### 3. 그리드와 플렉스박스는 문제에 맞춰 고른다

| 신호 | 고를 것 |
| --- | --- |
| 아이템이 내용 크기대로 자연스럽게 자리를 나눠 가져야 한다 | 플렉스박스 |
| 행과 열이 모두 맞아야 한다, 틀이 먼저 있다 | 그리드 |
| 플렉스 아이템에 `%` 너비를 주고 `flex-grow: 0`을 쓰고 있다 | 그리드가 필요하다는 신호 |

### 4. 한 페이지에 그리드를 여러 개 써도 된다

그리드는 페이지 뼈대 전용이 아니다. 작은 컴포넌트에도 쓴다. 중첩도 문제없다.

### 5. 옛 습관을 버린다

float 시절의 행 래퍼(row wrapper)나 12열 클래스 시스템을 그리드 위에 다시 만들 필요가 없다. 명세가 정한 방식대로 쓰는 것이 모범 사례다.

### 6. 부모 너비에 반응해야 하면 컨테이너 쿼리

`auto-fill`로 부족하고 컴포넌트가 놓인 자리의 너비에 따라 배치를 바꿔야 하면 컨테이너 쿼리(`container-type: inline-size` + `@container`)를 함께 쓴다([[responsive-design|반응형 디자인과 다국어 타이포그래피]]).

## 정리

- 그리드는 2차원, 플렉스박스는 1차원. 틀이 먼저면 그리드, 내용이 먼저면 플렉스박스.
- 크기는 `fr`이 기본이고, `minmax()`와 `auto-fill`로 미디어 쿼리 없이도 유연한 격자를 만든다.
- 같은 너비 열이 필요하면 `1fr` 대신 `minmax(0, 1fr)`.
- 빈 트랙을 접어 아이템을 늘리려면 `auto-fit`, 칸 너비를 지키려면 `auto-fill`.
- 이름 붙인 라인과 `grid-template-areas`로 배치를 읽기 쉽게 하고, 같은 칸 배치로 겹침을 만든다.
- 카드 사이 줄 맞춤은 서브그리드로 해결한다.
- 재배치는 시각적 용도로만. 접근성은 소스 순서가 결정한다.

관련 노트: [[flexbox|Float와 Flexbox 레이아웃]], [[logical-properties|쓰기 모드와 논리적 속성]], [[css-progressive-enhancement|CSS 점진적 향상: 폴백과 피처 쿼리]], [[responsive-design|반응형 디자인과 다국어 타이포그래피]], [[box-model|박스 모델과 display]], [[devtools-elements-css|DevTools로 DOM과 CSS 다루기]]

더 읽을거리: 게임으로 익히기 — [Grid Garden](https://cssgridgarden.com/#ko)
