---
title: "쓰기 모드와 논리적 속성"
concept: "Logical Properties"
summary: "writing-mode가 정하는 블록·인라인 축, 그리고 top·left·width 같은 물리 속성 대신 block-start·inline-end·inline-size처럼 글의 흐름을 기준으로 쓰는 논리적 속성. 그리드와 플렉스박스가 왜 start·end로 생각하는지도 여기서 풀린다."
tags: ["css", "layout", "i18n", "frontend"]
source: other
date: "2026-10-13"
sources: ["https://webactually.com/2020/01/22/%ec%93%b0%ea%b8%b0-%eb%aa%a8%eb%93%9c%ec%99%80-css-%eb%a0%88%ec%9d%b4%ec%95%84%ec%9b%83/", "https://webactually.com/2018/06/28/%eb%85%bc%eb%a6%ac%ec%a0%81-css-%ec%86%8d%ec%84%b1%ea%b3%bc-%ea%b0%92-%ec%9d%b4%ed%95%b4%ed%95%98%ea%b8%b0/", "https://web.dev/learn/css/logical-properties"]
---

> Rachel Andrew의 「[쓰기 모드와 CSS 레이아웃](https://webactually.com/2020/01/22/%ec%93%b0%ea%b8%b0-%eb%aa%a8%eb%93%9c%ec%99%80-css-%eb%a0%88%ec%9d%b4%ec%95%84%ec%9b%83/)」(2020.01)과 「CSS 논리적 속성과 값 이해하기」(2018.06, 웹액츄얼리 번역)를 바탕으로 재구성하고, web.dev 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Logical Properties 모듈로 보강한 노트다.

## 왜 알아야 하나

세로쓰기를 할 일이 없어도 쓰기 모드는 알아 둘 가치가 있다. **플렉스박스와 그리드는 처음부터 쓰기 모드를 기준으로 설계됐다.** "왜 `grid-area` 순서가 margin과 다르지?", "왜 `justify-content: flex-end`가 아랍어 페이지에선 왼쪽으로 가지?" 같은 의문이 여기서 풀린다. 머릿속 모델을 화면의 네 귀퉁이(위·아래·왼쪽·오른쪽)에서 **블록·인라인, 시작·끝**으로 바꾼다.

## 쓰기 모드

`writing-mode`는 글줄이 놓이는 방향과 줄이 쌓이는 방향을 정한다. 문장 방향(왼→오, 오→왼)은 `direction`이나 HTML `dir` 속성이 정한다.

| 값 | 글줄 방향 | 줄이 쌓이는 방향 | 예 |
| --- | --- | --- | --- |
| `horizontal-tb` (기본) | 가로 | 위→아래 | 한국어·영어 가로쓰기, 아랍어(문장은 오른쪽에서 시작) |
| `vertical-rl` | 세로 | 오른쪽→왼쪽 | 한·중·일 세로쓰기 |
| `vertical-lr` | 세로 | 왼쪽→오른쪽 | 몽골어 |
| `sideways-rl` / `sideways-lr` | 세로, 글자를 옆으로 눕힘 | | 세로 제목 같은 장식 |

## 블록 축과 인라인 축

| 축 | 정의 | 가로쓰기에서 | 세로쓰기(`vertical-rl`)에서 |
| --- | --- | --- | --- |
| 인라인(inline) | 문장 속 단어가 이어지는 방향 | 가로 | 세로 |
| 블록(block) | 문단 같은 블록이 쌓이는 방향 | 세로 | 가로 (오른쪽→왼쪽) |

그래서 "너비"는 가로쓰기에서만 인라인 크기이고, "높이"는 가로쓰기에서만 블록 크기다.

## 물리 속성과 논리 속성 대응

| 물리 속성 | 논리 속성 (가로쓰기·왼→오일 때 같은 뜻) |
| --- | --- |
| `width` / `height` | `inline-size` / `block-size` |
| `min-width`, `max-height` 등 | `min-inline-size`, `max-block-size` 등 |
| `margin-top` / `margin-bottom` | `margin-block-start` / `margin-block-end` |
| `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end` |
| `padding-*` | `padding-block-*`, `padding-inline-*` |
| `border-top-color` 등 | `border-block-start-color` 등 |
| `top` / `right` / `bottom` / `left` | `inset-block-start` / `inset-inline-end` / `inset-block-end` / `inset-inline-start` |
| `float: left` / `right` | `float: inline-start` / `inline-end` |
| `text-align: left` / `right` | `text-align: start` / `end` |
| `border-top-left-radius` 등 | `border-start-start-radius` 등. 앞이 블록, 뒤가 인라인: `border-end-end-radius` = 블록 끝·인라인 끝 모서리 |
| `overflow-x` / `overflow-y` | `overflow-inline` / `overflow-block` |
| 단위 `vw` / `vh` | `vi` / `vb` (뷰포트의 인라인·블록 방향 1%) |

축약형도 있다. `margin-block: 1rem 2rem`(시작·끝), `padding-inline: 1rem`, `inset: 0` 등. 논리 속성은 모든 주요 브라우저가 지원한다. 과거에는 `offset-block-start` 같은 초안 이름과 PostCSS 변환 플러그인을 썼다.

```css
.callout {
  inline-size: 20rem;            /* 가로쓰기면 너비, 세로쓰기면 높이 */
  padding-block: 1rem;
  border-inline-start: 4px solid var(--accent);  /* 문장이 시작하는 쪽 테두리 */
}
```

`border-inline-start`를 쓰면 같은 컴포넌트가 아랍어(오→왼) 페이지에서는 자동으로 오른쪽에 테두리를 그린다. `border-left`로 썼다면 RTL용 스타일을 따로 만들어야 한다.

## 그리드와 플렉스박스는 이미 논리적이다

### 그리드

- `grid-area: 1 / 2 / 3 / 5`의 순서는 **블록 시작 / 인라인 시작 / 블록 끝 / 인라인 끝**이다. 시작 두 개를 먼저, 끝 두 개를 나중에 쓴다. margin의 위·오른쪽·아래·왼쪽 순서와 다른 이유다.
- 행(row)은 블록 축을 따라 쌓이고, 열(column)은 인라인 축을 따라 나열된다. 세로쓰기에서는 열 라인 1이 그리드 위쪽에 온다.
- 자동 배치도 쓰기 모드를 따른다.
- **`align-*`은 항상 블록 축, `justify-*`는 항상 인라인 축**을 정렬한다. 규칙이 하나라 플렉스박스보다 외우기 쉽다.

### 플렉스박스

- `flex-direction: row`는 "가로"가 아니라 **인라인 방향**이다. 세로쓰기 컨테이너에서 `row`는 세로로 나열된다.
- `column`은 블록 방향이다.
- `justify-content: flex-end`는 "오른쪽"이 아니라 **주축의 끝**이다. RTL이면 왼쪽, 세로쓰기면 아래다.
- 플렉스박스는 주축이 바뀔 수 있어서, `justify-*`는 주축, `align-*`은 교차축이라고 기억한다.

### 그 밖의 CSS

다단 레이아웃의 `column-width`도 실제로는 인라인 크기다. 세로쓰기에서는 물리적 너비가 아니다. 이렇듯 CSS 곳곳이 이미 쓰기 모드를 전제로 움직인다.

## 실전 예

글 앞에 아이콘을 둔 라벨에서 `margin-right`로 간격을 주면 아랍어 페이지에서는 아이콘이 오른쪽으로 가면서 간격이 반대편에 남아 글자에 달라붙는다. `margin-inline-end`로 쓰면 방향과 상관없이 아이콘과 글 사이에 간격이 생긴다.

```css
.label { display: inline-flex; align-items: center; }
.label svg { inline-size: 1.2em; block-size: 1.2em; margin-inline-end: .5em; flex: none; }
```

쓰기 모드는 다국어만의 도구가 아니다. 차트의 Y축 제목에 `writing-mode: vertical-rl`을 주면 X축 제목과 **같은** `margin-block-start`를 써도 각자 알맞은 쪽(X축은 위, Y축은 오른쪽)에 여백이 생긴다. 밑줄이 글자의 블록 끝 쪽에 그어지는 것도 같은 원리다.

## 언제 논리 속성을 쓰나

| 상황 | 권장 |
| --- | --- |
| RTL 언어(아랍어·히브리어)를 지원하거나 지원할 가능성이 있다 | 여백·테두리·정렬을 논리 속성으로. RTL 대응 코드가 거의 사라진다 |
| 세로쓰기 컴포넌트나 세로 제목 | 논리 속성 + `writing-mode` |
| 화면 자체에 묶인 배치(화면 오른쪽 아래 고정 버튼 등) | 물리 속성이 의도에 맞다 |

다국어 대응은 글자 크기 문제도 함께 따라온다([[responsive-design|반응형 디자인과 다국어 타이포그래피]]).

## 정리

- 블록 축은 블록이 쌓이는 방향, 인라인 축은 문장이 흐르는 방향이다. 가로·세로는 쓰기 모드가 정한다.
- 논리 속성은 `width`→`inline-size`, `top`→`inset-block-start`처럼 물리 방향 대신 흐름 기준으로 쓴다.
- 그리드·플렉스박스는 처음부터 start·end로 생각한다. 그리드는 `align`=블록, `justify`=인라인.
- 머릿속 모델을 위·아래·왼쪽·오른쪽에서 블록·인라인, 시작·끝으로 바꾸면 새 레이아웃이 훨씬 잘 이해된다.

관련 노트: [[css-grid|CSS 그리드 레이아웃]], [[flexbox|Float와 Flexbox 레이아웃]], [[box-model|박스 모델과 display]], [[responsive-design|반응형 디자인과 다국어 타이포그래피]]
