---
title: "CSS 기초: 문법, 적용 방법, 단위"
concept: "CSS Syntax"
summary: "선택자와 선언으로 이루어진 CSS 문법, 스타일 적용 방법 3가지, 수·퍼센트·절대·상대 길이와 각도·해상도 단위, 그리고 hex·rgb·hsl부터 oklch·display-p3·color()·상대 색상 문법까지의 색 표현, 브라우저 기본 스타일을 맞추는 리셋과 노멀라이즈."
tags: ["css", "frontend"]
source: til
date: "2026-10-21"
sources: ["https://riverkim.kr/263", "https://riverkim.kr/271", "https://riverkim.kr/225", "https://developer.mozilla.org/en-US/docs/Web/CSS/color_value", "https://web.dev/learn/css/sizing", "https://web.dev/learn/css/color", "https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/css/reset-normalize.md", "http://nicolasgallagher.com/about-normalize-css/", "http://meyerweb.com/eric/tools/css/reset/", "https://css-tricks.com/rems-ems/"]
---

> riverkim.kr에 쓴 글을 정리한 노트에 web.dev 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Sizing Units·Color 모듈을 더해 보강했다.
> 「리셋과 노멀라이즈」는 「[Must-Know-About-Frontend: Reset.css vs Normalize.css](https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/css/reset-normalize.md)」를 바탕으로, 「[About normalize.css](http://nicolasgallagher.com/about-normalize-css/)」와 「[Reset CSS](http://meyerweb.com/eric/tools/css/reset/)」로 보강했다. rem과 em을 섞어 쓰는 법은 「[Font Size Idea: px at the Root, rem for Components, em for Text Elements](https://css-tricks.com/rems-ems/)」를 바탕으로 보강했다.

CSS는 "어떤 요소를(선택자) 어떻게 바꿀지(선언)"를 적는 언어다. 문법 자체는 단순하지만, 스타일을 어디에 작성하느냐와 어떤 단위를 쓰느냐에 따라 유지보수성과 반응형 대응이 크게 달라진다.

## 문법

```css
h1 {
  color: blue;
  font-size: 15px;
}
```

| 구성 | 예 | 의미 |
| --- | --- | --- |
| 선택자(Selector) | `h1` | 스타일을 적용할 HTML 요소 |
| 선언(Declaration) | `color: blue;` | 속성과 값의 한 쌍 |
| 속성(Property) | `font-size` | **어떤** 스타일 기능을 바꿀지 |
| 값(Value) | `15px` | **어떻게** 바꿀지 |

## 스타일 적용 방법 3가지

### 1. 인라인 스타일 (`style` 속성)

```html
<div style="color: red">Red</div>
```

- 장점: 해당 요소에만 적용되고 우선순위가 높다. JavaScript로 요소마다 다른 값(예: 배경 이미지 URL)을 넣을 때 유용하다.
- 단점: 재사용·확장이 어렵다.

### 2. 내부 참조 (`<style>` 요소)

```html
<head>
  <style>
    .box { color: red; }
  </style>
</head>
```

- 장점: 페이지별로 필요한 스타일만 지정하고, JavaScript(CSSOM)로 제어하기 쉽다. styled-components 같은 CSS-in-JS 라이브러리가 이 방식으로 동작한다.
- 단점: 여러 페이지가 공유하는 공통 스타일을 관리하기 어렵다.

### 3. 외부 참조 (`.css` 파일 + `<link>`)

```html
<head>
  <link rel="stylesheet" href="style.css" />
</head>
```

- 장점: 공통 스타일을 한 곳에서 관리할 수 있다.
- 단점: 파일을 받기 위한 HTTP 요청이 한 번 더 생긴다. CSS 구조를 잘 설계하지 않으면 공통 스타일이 서로 충돌하기 쉽다.

## 크기 단위

### 수와 퍼센트

| 종류 | 예 | 의미 |
| --- | --- | --- |
| 수(number) | `opacity: .5`, `line-height: 1.5`, `scale(1.2)`, `rgb(50 50 50)`, `sepia(.5)` | 단위 없는 정수·소수. 뜻은 속성마다 다르다 |
| 퍼센트 | `width: 50%` | **무엇의** 퍼센트인지는 속성이 정한다 |

| 속성 | `%`의 기준 |
| --- | --- |
| `width`, `inline-size` | 부모(컨테이닝 블록)의 너비 |
| `margin`, `padding` | 방향과 상관없이 컨테이닝 블록의 **너비** |
| `transform: translate()` | 요소 **자기 자신**의 크기 |
| `font-size` | 부모의 글자 크기 |
| `line-height` | 자기 글자 크기 |

`line-height`는 단위 없는 수로 쓴다. `line-height: 1.5`는 자식에게 비율이 상속돼 자식의 글자 크기마다 다시 계산되지만, `line-height: 24px`나 `150%`는 계산된 길이가 상속돼 큰 글자의 줄이 겹친다.

### 절대 길이

모두 같은 기준(1in = 96px)으로 풀린다. 화면의 물리 크기는 기기마다 달라 `cm`·`in`은 화면에서 실제 자와 맞지 않는다. **인쇄 스타일시트**에서 쓴다.

| 단위 | 크기 |
| --- | --- |
| `px` | 1/96in. CSS 픽셀이며 물리 픽셀이 아니다 |
| `cm`, `mm`, `Q` | 센티미터, 1/10cm, 1/40cm |
| `in`, `pc`, `pt` | 인치(96px), 1/6in, 1/72in |

### 상대 길이

| 기준 | 단위 | 의미 |
| --- | --- | --- |
| 글자 | `em` | 부모(상속받은) 글자 크기의 배수. `font-size` 외 속성에서는 자기 글자 크기. 중첩될수록 누적된다 |
| | `rem` | 루트(`html`) 글자 크기의 배수. 상속에 흔들리지 않아 예측이 쉽다 |
| | `ch` | 글꼴의 숫자 `0` 너비. 글줄 길이 제한(`max-inline-size: 65ch`) |
| | `ex`, `cap` | 소문자 x 높이, 대문자 높이 |
| | `ic` | 전각 글자 `水`의 너비. 한·중·일 글자 수 기준 |
| | `lh` | 요소의 줄 높이. 아이콘을 한 줄 높이에 맞출 때 |
| | `rex`, `rcap`, `rch`, `ric`, `rlh` | 위 단위의 루트 요소 기준 판 |
| 뷰포트 | `vw`, `vh` | 뷰포트 너비·높이의 1% |
| | `vi`, `vb` | 루트의 인라인·블록 축 방향 1%. 세로쓰기에서 축이 바뀐다 |
| | `vmin`, `vmax` | 짧은 쪽·긴 쪽의 1% |
| | `svh`, `lvh`, `dvh` (+`sv*`·`lv*`·`dv*` 전체) | 브라우저 UI가 모두 보일 때(작은 뷰포트)·모두 숨었을 때(큰 뷰포트)·지금 상태(동적). 기본 `vh`는 큰 뷰포트와 같다. 꽉 찬 화면에는 `100dvh`, 움직이지 않아야 하면 `100svh` |
| 컨테이너 | `cqw`, `cqh`, `cqi`, `cqb`, `cqmin`, `cqmax` | 컨테이너 쿼리의 컨테이너 크기 1%([[responsive-design#컨테이너 쿼리\|컨테이너 쿼리]]) |

뷰포트 단위도 상대 단위다. 기준은 기기 화면이 아니라 그 문서가 그려지는 창(iframe·웹뷰일 수 있다)이다.

**글자 크기는 `rem`·`em`으로 쓴다.** `html`에 `font-size`를 고정하지 않으면 사용자가 OS·브라우저에서 키운 기본 글자 크기가 상대 단위에 반영된다. `px`로 쓰면 그 설정을 무시한다.

`rem`과 `em`은 섞어 쓴다. 모든 글자를 `rem`으로 쓰고 루트 크기만 바꾸면 전체가 똑같은 비율로 커지고 줄어, 큰 제목은 너무 커지고 작은 글은 너무 작아진다. 대신 **모듈(카드·사이드바)의 뿌리에 `rem`, 그 안의 글 요소에 `em`** 을 쓰면 모듈 하나의 `font-size`만 바꿔 그 안의 비율을 유지한 채 모듈 단위로 키우고 줄일 수 있다.

```css
.sidebar-widget { font-size: 0.875rem; }   /* 모듈: 루트 기준 */
.sidebar-widget h3 { font-size: 1.25em; }  /* 글 요소: 모듈 기준 */
.sidebar { container-type: inline-size; }
@container (inline-size < 20rem) { .sidebar-widget { font-size: 0.8125rem; } }  /* 사이드바가 좁으면 모듈째 줄인다 */
```

과거에는 루트에 `html { font-size: 17px }`처럼 `px`을 박고 미디어 쿼리로 바꿨지만, 사용자 설정을 덮어쓰므로 지금은 루트를 비워 두거나 `%`로 쓴다. 크기 사이를 부드럽게 오가는 `clamp(최소, 선호, 최대)`와 다른 수학 함수는 [[css-functions|CSS 함수]]에 있다.

### 각도와 해상도

| 종류 | 단위 | 쓰임 |
| --- | --- | --- |
| 각도 | `deg`, `rad`, `grad`, `turn` (`1turn` = `360deg`) | `rotate()`, `hsl()`의 색상, 그라디언트 방향 |
| 해상도 | `dpi`, `dpcm`, `dppx`(`x`) | 고해상도 화면 미디어 쿼리 `@media (min-resolution: 2dppx)`, `image-set()` |

## 색상 표현

| 방식 | 예 |
| --- | --- |
| 색상 키워드(대소문자 무관) | `red`, `black` |
| 16진수(HEX) | `#ff0000`, 투명도 포함 `#ff000055` |
| RGB | `rgb(255 0 0)`, 투명도 `rgb(255 0 0 / 50%)` |
| HSL (색상·채도·명도) | `hsl(120 100% 25%)`, `hsl(120 100% 50% / 0.3)` |
| OKLCH (명도·채도·색상) | `oklch(62% 0.15 160)`. 사람 눈에 고른 밝기 단계를 만들기 쉽고 넓은 색역(Display P3)도 표현한다 |
| `color-mix()` | `color-mix(in oklch, red 40%, white)`. 두 색을 섞어 파생 색을 만든다 |
| `currentColor` | 현재 요소의 `color` 값을 그대로 사용 |

투명도(alpha)는 `/` 뒤에 쓴다. 쉼표로 구분하는 `rgba(255, 0, 0, 0.5)`·`hsla()`는 옛 문법이지만 여전히 동작하고, 지금은 `rgb()`·`hsl()` 하나로 투명도까지 쓴다. 색상 체계를 변수로 짜는 법은 [[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]]에 있다.

16진수 색은 `#RRGGBB` 꼴로 빨강·초록·파랑을 두 자리씩 `00`~`ff`(0~255)로 적는다. 두 자리가 같은 값이면 `#f00`(= `#ff0000`)처럼 세 자리로 줄일 수 있고, 뒤에 두 자리를 더 붙이면 투명도다(`#RRGGBBAA`, 네 자리 축약 `#RGBA`). 투명도도 16진수라 50%는 `80`, 75%는 `BF`(= 191 ≈ 255의 75%), 0%는 `00`이다. 디자인 도구가 Hex로 색을 주는 경우가 많아 가장 흔히 쓰인다.

### 넓은 색역과 색 공간

`rgb()`·`hsl()`·Hex는 모두 **sRGB 색역** 안의 색만 표현한다. 최신 화면은 그보다 넓은 색을 낸다.

| 함수 | 채널 | 쓰임 |
| --- | --- | --- |
| `color(srgb r g b)` | 0~1 | sRGB를 0~1로. `rgb(72% 8% 25%)` = `color(srgb .72 .08 .25)` |
| `color(display-p3 r g b)` | 0~1 | Display P3 색역(sRGB보다 약 50% 넓다). 같은 숫자라도 더 선명한 색 |
| `oklab(L a b)` | 밝기 0~1, a(초록↔빨강)·b(파랑↔노랑) -0.4~0.4 | 매끄러운 그라디언트, 색상·밝기를 유지한 채 채도 조절 |
| `oklch(L C H)` | 밝기, 채도(0~0.4 남짓), 색상 각도 | 지각적으로 균일하다. 색상을 바꿔도 밝기가 그대로라 팔레트 만들기에 좋다 |
| `lab()`, `lch()`, `hwb()` | | 다른 색 공간. 다 외울 필요는 없다 |

- OKLCH는 색역에 묶이지 않아 `oklch(80% 0.4 200)`처럼 **어떤 화면도 못 내는 색**도 적을 수 있다. 화면이 못 내는 색은 브라우저가 가까운 색으로 바꾼다(gamut mapping). 화면별로 직접 고르려면 `@media (color-gamut: p3)`를 쓴다.
- 실무에서는 Hex·`rgb()`를 읽을 줄 알고, 값을 손으로 조절할 때는 `oklch()`나 `hsl()`처럼 채널 뜻이 분명한 형식을 쓴다.

### 특수 키워드와 시스템 색

- `transparent`: 완전 투명. `background-color`의 초깃값이다.
- `currentColor`: 그 요소의 `color` 계산값. `border-color`·`box-shadow`·SVG `fill`의 기본값이 이것이라, 글자색만 바꾸면 테두리·아이콘이 따라 바뀐다.
- 시스템 색(`Canvas`, `CanvasText`, `ButtonBorder`, `Highlight` 등): OS 테마가 정한 색. 고대비 모드처럼 사용자가 색을 강제할 때 맞춰 쓴다. 대소문자는 구분하지 않는다.

### 색 조작

```css
.hover   { background: color-mix(in oklch, var(--brand), black 15%); }   /* 15% 어둡게 */
.dimmer  { color: oklch(from var(--brand) calc(l * .9) c h); }            /* 상대 색상 문법: 밝기만 90% */
.complement { color: oklch(from var(--brand) l c calc(h + 180)); }       /* 보색 */
```

- `color-mix(in 색공간 [방향], 색1 비율, 색2)`: 같은 두 색도 **어느 색 공간에서 섞느냐**에 따라 결과가 다르다. 색상이 있는 공간은 `shorter`(기본)·`longer`·`increasing`·`decreasing`으로 색상환을 도는 방향을 고른다.
- 상대 색상 문법 `함수(from 원래색 채널…)`: 원래 색을 그 함수의 채널(`l c h`, `r g b`)로 풀어 주고, `calc()`로 바꾸거나 다른 값으로 갈아 끼운다.
- 동적으로 만든 색은 대비가 부족해지기 쉽다. 파생 색도 대비를 확인한다([[color-motion-accessibility|색과 움직임의 접근성]]).

색은 `<color>` 타입을 받는 곳이면 어디든 같은 문법으로 쓴다: `color`, `background-color`, `border-color`, `outline-color`, `text-decoration-color`, `text-shadow`, `box-shadow`, 그라디언트([[css-backgrounds-gradients|CSS 배경과 그라디언트]]).

## 글꼴 기울이기: font-style

이탤릭체는 `font-style`로 지정한다. Tailwind 같은 유틸리티 클래스(`italic`) 없이 SCSS나 순수 CSS를 쓸 때 필요하다.

| 값 | 모양 |
| --- | --- |
| `normal` | 글꼴의 기본 모양 |
| `italic` | 이탤릭체. 글꼴에 이탤릭 서체가 있으면 그것을 쓴다(필기체처럼 보이기도 한다) |
| `oblique` | 기본 서체를 기울이기만 한다. 대부분의 글꼴에서 `italic`과 비슷하게 보인다 |
| `inherit` | 부모 요소의 값을 물려받는다 |

```css
.coming-soon { font-style: italic; }
```

## 속성 선언 순서

한 선택자 안에서 속성을 어떤 순서로 쓸지 정해 두면 코드를 훑기 쉽고 리뷰에서 빠진 속성이 잘 보인다. 네이버의 CSS 코딩 규칙을 참고한 순서는 다음과 같다. **레이아웃에 큰 영향을 주는 것부터** 쓰는 흐름이다.

| 순서 | 그룹 | 관련 속성 |
| --- | --- | --- |
| 1 | 표시 | `display`, `visibility` |
| 2 | 넘침 | `overflow` |
| 3 | 흐름 | `float`, `clear` |
| 4 | 위치 | `position`, `top`·`right`·`bottom`·`left`, `z-index` |
| 5 | 크기 | `width`, `height` |
| 6 | 간격 | `margin`, `padding` |
| 7 | 테두리 | `border` |
| 8 | 배경 | `background` |
| 9 | 폰트 | `font`, `color`, `letter-spacing`, `text-align`, `text-decoration`, `vertical-align`, `white-space` 등 |
| 10 | 동작 | `animation`, `transform`, `transition` |
| 11 | 기타 | 위에 없는 나머지. 순서 무관 |

Stylelint의 `stylelint-order` 같은 플러그인으로 순서를 자동으로 맞출 수 있다.

## 브라우저 기본 스타일

브라우저는 요소마다 기본 스타일(User Agent Stylesheet)을 갖고, 그 값이 브라우저마다 조금씩 다르다. 한 브라우저에서만 확인하면 다른 브라우저에서 뒤늦게 어긋남을 발견한다. 대응은 두 겹이다. 작성한 CSS를 같은 출발점에서 시작하도록 **기본 스타일을 먼저 정리하는 파일**을 두고, 그래도 브라우저마다 다른 값은 **명시**한다.

### 리셋과 노멀라이즈

| | 리셋(reset) | 노멀라이즈(normalize) |
| --- | --- | --- |
| 방식 | 기본 스타일을 **지운다**. `h1`~`h6`·`p`·`ul`의 margin, 글자 크기, 목록 기호까지 0·없음으로 | 쓸모 있는 기본값은 **남기고** 브라우저 사이의 차이·버그만 고친다 |
| 대표 | Eric Meyer의 Reset CSS(v2.0, 2011) | necolas의 normalize.css(마지막 릴리스 v8, 2018), 그 후속인 modern-normalize |
| 장점 | 출발점이 완전히 같다. 브라우저가 바뀌어도 고칠 게 거의 없다 | 제목·강조 같은 기본 표현이 살아 있어 다시 쓸 스타일이 적다. 주석에 고치는 이유가 적혀 있다 |
| 단점 | 모든 요소를 다시 꾸며야 한다. 목록 기호를 지우면 VoiceOver가 목록으로 읽지 않는 것처럼 접근성 단서도 같이 사라질 수 있다 | 브라우저가 바뀔 때마다 갱신이 필요하다 |

지금은 브라우저 간 차이가 많이 줄어 두 방식을 섞은 **짧은 현대식 리셋**을 쓰는 경우가 많다. Tailwind의 Preflight도 modern-normalize 위에 리셋을 얹은 형태다.

```css
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }
body { line-height: 1.5; -webkit-font-smoothing: antialiased; }
img, picture, video, canvas, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; color: inherit; }
p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }
h1, h2, h3 { text-wrap: balance; }
p { text-wrap: pretty; }
```

| 줄 | 이유 |
| --- | --- |
| `box-sizing: border-box` | 지정한 너비에 padding·border가 포함돼 계산이 쉽다([[box-model\|박스 모델]]) |
| `margin: 0` | 요소 기본 여백 대신 레이아웃(`gap`)이나 컴포넌트가 간격을 정한다 |
| `line-height: 1.5` | 기본 `normal`(약 1.2)은 본문에 좁다. 단위 없이 써야 상속이 안전하다 |
| 미디어 `display: block` | 인라인 이미지 아래 생기는 틈이 사라진다([[line-height-vertical-align\|line-height와 vertical-align]]) |
| 폼 요소 `font: inherit` | 버튼·입력은 글꼴을 상속하지 않고 시스템 글꼴을 쓴다 |
| `overflow-wrap: break-word` | 긴 URL·단어가 컨테이너를 뚫고 나가지 않는다 |
| `text-wrap: balance`·`pretty` | 제목 줄 길이를 고르게, 본문 마지막 줄의 외톨이 단어를 줄인다. `pretty`를 모르는 브라우저(Firefox)는 무시한다 |

리셋은 컴포넌트 스타일을 이기면 안 된다. 리셋 전체를 `@layer reset { … }`에 넣거나, 선택자를 `:where()`로 감싸 명시도를 0으로 두면 어떤 클래스로도 덮을 수 있다([[selectors|선택자와 우선순위]]). ITCSS에서는 이 자리가 Generic 층이다([[css-methodologies|CSS 설계 방법론]]). `:focus-visible` 윤곽선, `prefers-reduced-motion` 처리 같은 접근성 기본값은 지우지 않거나 다시 넣는다.

### 사례: Safari의 버튼 글자색

`<button>`에 `color`를 지정하지 않으면 iOS·macOS Safari는 버튼 글자를 파란색(`-apple-system-blue`)으로 표시한다. 다른 브라우저에서는 검은 글씨로 보여 Safari에서만 뒤늦게 발견되기 쉽다. `-apple-system-blue`는 Apple의 HIG(Human Interface Guidelines) 디자인 언어에 맞춘 시스템 색상 키워드다.

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| Safari에서만 버튼 텍스트가 파랗다 | `color`가 없는 버튼에 Safari가 시스템 색을 적용 | 버튼에 `color`를 명시한다(예: `color: inherit`) |

위 리셋의 `button { color: inherit; }` 한 줄이 이 문제를 미리 막는다. 폼 요소가 부모의 글꼴·색을 물려받지 않는 것도 같은 종류의 기본 스타일 차이다.

## 핵심 정리

- CSS = 선택자 + `{ 속성: 값; }` 선언의 묶음.
- 공통 스타일은 외부 파일, 컴포넌트 단위 스타일은 내부/CSS-in-JS, 동적인 개별 값은 인라인으로 나눠 쓴다.
- 반응형에는 `rem`, `%`, `vw/vh` 같은 상대 단위가 유리하다. 글자 크기는 사용자 설정을 존중하도록 `rem`·`em`으로. 자세한 방법은 [[responsive-design|반응형 디자인]]에 있다.
- 속성은 레이아웃에 큰 영향을 주는 것부터 순서를 정해 쓴다.
- 브라우저마다 기본 스타일이 다르다. 짧은 리셋으로 출발점을 맞추고, 버튼 글자색 같은 기본값은 명시한다.
- 색 값을 손으로 조절할 땐 `oklch()`, 파생 색은 `color-mix()`와 상대 색상 문법으로 만든다.

관련 노트: [[css-functions|CSS 함수: calc()·clamp()와 수학 함수]], [[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]], [[responsive-design|반응형 디자인과 다국어 타이포그래피]], [[selectors|CSS 선택자와 우선순위]]
