---
title: "CSS 함수: calc()·clamp()와 수학 함수"
concept: "CSS Functions"
summary: "CSS 함수는 인자를 받아 값을 돌려주는 내장 기능이다. 직접 정의할 수는 없지만 중첩해 쓸 수 있다. 값을 꺼내는 var()·attr()·url(), 단위를 섞어 계산하는 calc()·min()·max()·clamp(), 삼각·지수·부호 함수, 도형 함수, 변형 함수를 용도별로 묶고 브라우저 지원 범위를 정리한다."
tags: ["css", "frontend", "responsive"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/css/functions", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units/CSS_Value_Functions", "https://developer.mozilla.org/en-US/docs/Web/CSS/sign", "https://developer.mozilla.org/en-US/docs/Web/CSS/round"]
---

> web.dev의 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Functions 모듈을 바탕으로, 브라우저 지원은 MDN 호환성 데이터로 확인해 재구성한 노트다.

## CSS 함수란

CSS 함수는 `이름(인자)` 꼴로 값을 계산해 돌려주는 내장 기능이다. **개발자가 새 함수를 정의할 수는 없다.** 대신 `calc(var(--x) * 2)`처럼 함수끼리 중첩할 수 있다. 대부분 같은 인자면 같은 결과를 내는 순수 함수이고, 참조한 값(`var()`, `currentColor`, 뷰포트 크기)이 바뀌면 다시 계산된다.

| 분류 | 함수 | 자세히 |
| --- | --- | --- |
| 선택자 함수 | `:is()`, `:where()`, `:not()`, `:has()` | [[selectors\|CSS 선택자와 우선순위]] |
| 값을 꺼내는 함수 | `var()`, `attr()`, `url()` | 아래 |
| 색 함수 | `rgb()`, `hsl()`, `oklch()`, `color()`, `color-mix()` | [[css-basics\|CSS 기초]], [[css-color-variables\|CSS 커스텀 속성으로 색상 체계 짜기]] |
| 수학 함수 | `calc()`, `min()`, `max()`, `clamp()`, 삼각·지수·부호·반올림 | 아래 |
| 그리드 크기 함수 | `repeat()`, `minmax()`, `fit-content()` | [[css-grid\|CSS 그리드 레이아웃]] |
| 그라디언트 | `linear-gradient()` 등 | [[css-backgrounds-gradients\|CSS 배경과 그라디언트]] |
| 도형 함수 | `circle()`, `inset()`, `polygon()`, `path()`, `shape()` | [[css-visual-effects\|CSS 시각 효과]] |
| 변형 함수 | `translate()`, `rotate()`, `scale()`, `skew()` | [[transform\|transform: 이동·회전·확대·기울이기]] |
| 필터 함수 | `blur()`, `drop-shadow()` 등 | [[css-visual-effects\|CSS 시각 효과]] |
| 타이밍 함수 | `cubic-bezier()`, `steps()`, `linear()` | [[css-animation\|CSS 애니메이션]] |

## 값을 꺼내는 함수

| 함수 | 하는 일 | 예 |
| --- | --- | --- |
| `var(--이름, 폴백)` | 커스텀 속성 값을 꺼낸다. 값이 없으면 폴백을 쓴다. 폴백 안에 또 `var()`를 둘 수 있다 | `var(--gap, 1rem)` |
| `attr(속성명)` | HTML 속성 값을 문자열로 꺼낸다. 속성이 바뀌면 따라 바뀐다 | `a::after { content: " (" attr(href) ")"; }` |
| `url()` | 이미지·글꼴 같은 리소스를 불러온다. 찾지 못하면 아무것도 그리지 않는다 | `background-image: url(bg.webp)` |

`attr()`은 오랫동안 `content` 속성 안의 문자열로만 쓸 수 있었다. `attr(data-size type(<length>))`처럼 타입을 지정해 아무 속성에나 쓰는 확장 문법은 Chrome 133부터 들어갔고, 모든 주요 브라우저가 지원하지는 않는다. 커스텀 속성의 상속·무효 처리·`@property`는 [[css-color-variables#커스텀 속성이란|커스텀 속성이란]]에 있다.

## 산술: calc(), min(), max(), clamp()

| 함수 | 결과 | 쓰는 곳 |
| --- | --- | --- |
| `calc(식)` | 식의 결과. **단위를 섞을 수 있다**(`100% - 2rem`) | 고정 여백을 뺀 너비, 변수 배수 |
| `min(a, b, …)` | 가장 작은 값 | 상한이 있는 너비: `width: min(100%, 60rem)` |
| `max(a, b, …)` | 가장 큰 값 | 하한이 있는 크기: `height: max(20vh, 20rem)` |
| `clamp(최소, 선호, 최대)` | 선호값을 두 경계 사이로 묶는다 | 미디어 쿼리 없는 유동 글자 크기 |

```css
.page {
  width: min(100% - 2rem, 70rem);       /* min() 안에서는 calc() 없이 식을 쓸 수 있다 */
  margin-inline: auto;
}
h1 { font-size: clamp(2rem, 1rem + 3vw, 3rem); }
.card-title { font-size: calc(2 * var(--base-size)); }
```

`clamp()`의 선호값에 `vw`만 쓰지 않고 `rem`을 더하는 이유는 확대(zoom) 때문이다. `vw`는 확대해도 크기가 그대로라, 글자가 뷰포트에만 묶이면 사용자가 확대해도 커지지 않는다. `rem`을 섞으면 사용자 글꼴 설정과 확대가 반영된다.

## 고급 수학 함수

| 묶음 | 함수 | 하는 일 | 지원 |
| --- | --- | --- | --- |
| 삼각 | `sin()`, `cos()`, `tan()` | 각도(`deg`, `rad`, `turn`)를 받아 수를 돌려준다. `sin`·`cos`은 -1~1 | Baseline 2023 |
| 역삼각 | `asin()`, `acos()`, `atan()`, `atan2(y, x)` | 수를 받아 각도를 돌려준다. `atan2`는 원점에서 점 (x, y)를 향하는 각도 | Baseline 2023 |
| 지수 | `pow(밑, 지수)`, `sqrt()`, `hypot()`, `exp()`, `log(값, 밑?)` | `pow`·`sqrt`의 인자는 단위 없는 수. `hypot(3em, 4em)` = `5em` | Baseline 2023 |
| 반올림·나머지 | `round(전략?, 값, 간격)`, `mod()`, `rem()` | 값을 간격 단위로 맞춘다: `round(up, 37px, 10px)` = `40px` | Baseline 2024 |
| 부호 | `abs()`, `sign()` | 절댓값, 부호(1·0·-1) | Chrome 138부터 모든 주요 브라우저 (Baseline 2025) |
| 상수 | `pi`, `e`, `infinity` | 식 안에서 쓴다: `calc(1px * infinity)` | 위와 같다 |

```css
/* 원 위에 점을 놓는다: --angle만 애니메이션하면 궤도를 돈다 */
.dot {
  translate: calc(cos(var(--angle)) * 6rem) calc(sin(var(--angle)) * 6rem);
}
/* --value의 부호에 따라 위·아래로 25vh 이동 */
.marker { top: calc(50vh + 25vh * sign(var(--value))); }
```

## 도형과 변형 함수

- `circle()`, `ellipse()`, `inset()`, `rect()`, `polygon()`, `path()`, `shape()`는 `clip-path`, `shape-outside`, `offset-path`에 쓰는 도형이다([[css-visual-effects|CSS 시각 효과]]).
- `rotate()`·`scale()`·`translate()`·`skew()`와 3D 판(`rotate3d()`, `translateZ()`, `perspective()`)은 `transform`에 쓴다. `rotate`·`scale`·`translate`는 독립 속성으로도 있어 따로 전환할 수 있다([[transform|transform: 이동·회전·확대·기울이기]]).

## 정리

- CSS 함수는 내장된 것만 쓰지만 서로 중첩할 수 있다.
- 단위를 섞어야 하면 `calc()`, 상한·하한이면 `min()`·`max()`, 범위 안에서 유동적이면 `clamp()`.
- 유동 글자 크기에는 `vw`에 `rem`을 섞어 확대를 존중한다.
- 삼각·지수·반올림 함수는 모든 주요 브라우저가 지원한다. `abs()`·`sign()`도 2025년부터 쓸 수 있다.

관련 노트: [[css-basics|CSS 기초: 문법, 적용 방법, 단위]], [[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]], [[transform|transform: 이동·회전·확대·기울이기]], [[css-visual-effects|CSS 시각 효과: 필터, 블렌드 모드, 클리핑, 마스킹]]
