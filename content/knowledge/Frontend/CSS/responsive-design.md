---
title: "반응형 디자인과 다국어 타이포그래피"
concept: "Responsive Design"
summary: "유동 그리드·유동 미디어·미디어 쿼리라는 세 요소에서 출발해 뷰포트 메타 태그, 미디어 쿼리와 브레이크포인트, 부모 크기에 반응하는 컨테이너 쿼리와 미디어 쿼리 없는 레이아웃, 모바일 퍼스트, 해상도와 기기 픽셀 비율, 상대 단위로 화면 크기에 맞추는 법. rem과 :lang()으로 언어마다 글자 크기를 바꾸는 다국어 반응형 타이포그래피까지 다룬다."
tags: ["css", "frontend", "mobile", "typography"]
source: mixed
date: "2026-10-20"
sources: ["https://ethanmarcotte.com/wrote/responsive-design-at-15/", "https://spoqa.github.io/2016/06/03/localize-type-setting.html", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries", "https://web.dev/learn/css/container-queries", "https://caniuse.com/css-container-queries", "https://web.dev/learn/design", "https://web.dev/learn/design/intro", "https://web.dev/learn/design/media-queries", "https://web.dev/learn/design/macro-layouts", "https://web.dev/learn/design/micro-layouts", "https://web.dev/learn/design/typography", "https://web.dev/learn/design/responsive-images", "https://web.dev/learn/design/accessibility", "https://web.dev/learn/design/internationalization"]
---

반응형 디자인(Responsive Design)은 한 벌의 HTML·CSS가 휴대폰부터 큰 모니터까지 **어떤 화면에서도 읽기 좋게** 보이도록 만드는 방식이다. 브레이크포인트·모바일 퍼스트·해상도·폴드 같은 용어의 짧은 정의는 [[web-glossary|프론트엔드 용어집]]에 있다.

> 일부 절은 web.dev 「[Learn Responsive Design](https://web.dev/learn/design)」 강좌로, 이름의 유래는 Ethan Marcotte의 「[Responsive web design turns fifteen](https://ethanmarcotte.com/wrote/responsive-design-at-15/)」(2025.05)로 보강했다.

## 세 요소와 그 뒤

| 처음의 세 요소 | 지금의 도구 |
| --- | --- |
| 유동 그리드(fluid grid) | `fr`, `minmax()`, 플렉스의 `flex`, 그리고 컨테이너 쿼리 |
| 유동 미디어(fluid media) | `max-inline-size: 100%`, `srcset`·`sizes`, `<picture>` |
| 미디어 쿼리 | 뷰포트 크기 + 사용자 설정·입력 장치·디스플레이를 묻는 미디어 기능 |

고정폭·리퀴드·적응형 레이아웃에서 반응형으로 온 흐름은 [[web-layout-design|웹 레이아웃 디자인]]에 있다. 지금의 반응형은 화면 폭을 넘어 **사용자 설정**(다크 모드, 움직임 줄이기), **입력 장치**(터치·마우스), **화면 모양**(노치, 폴더블), **언어**에도 반응한다.

「반응형 웹 디자인」은 이선 마콧(Ethan Marcotte)이 2010년에 붙인 이름이다. 지금 반응형은 **특별한 기법이 아니라 당연한 기본값**이다. 휴대폰·데스크톱·그 밖의 기기에서 모두 동작하는 사이트를 만드는 것이 그냥 해야 할 일로 여겨진다. 관점도 바뀌었다. 웹의 유동성은 맞서 싸울 제약이 아니라 **함께, 그리고 그것을 위해 디자인하는 자산**이다. 남은 과제는 화면 폭이 아니라 기기 성능 격차(저사양 휴대폰에서의 성능)와 접근성 쪽에 있다([[responsible-javascript|책임감 있는 JavaScript]], 아래 「반응형과 접근성」).

## 출발점: 뷰포트 메타 태그

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

이 줄이 없으면 모바일 브라우저는 페이지를 약 980px 너비로 그린 뒤 축소한다. 미디어 쿼리도 기대대로 동작하지 않는다.

- `width=device-width`: 페이지 폭을 980px로 가정하지 말고 기기 폭으로 잡는다.
- `initial-scale=1`: 처음에 확대·축소하지 않는다.
- 노치까지 화면 끝을 채우려면 `viewport-fit=cover`를 더한다([[safe-area-foldable|노치와 폴더블 화면 대응]]).
- `user-scalable=no`나 `maximum-scale=1`로 확대를 막지 않는다. 확대가 필요한 사람이 페이지를 못 읽는다.

## 브레이크포인트와 미디어 쿼리

브레이크포인트(breakpoint)는 레이아웃이 바뀌는 화면 너비다. 미디어 쿼리로 구현한다.

```css
.cards { display: grid; grid-template-columns: 1fr; }          /* 기본: 모바일 */
@media (min-width: 768px)  { .cards { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .cards { grid-template-columns: repeat(3, 1fr); } }
```

- 기기 목록이 아니라 **콘텐츠가 깨지는 지점**에 브레이크포인트를 둔다. 기기는 계속 새로 나온다.
- 많이 쓰는 기준값은 Tailwind CSS 기본값(640·768·1024·1280·1536px)처럼 3~5개 정도다.
- 글 위주라면 `em`으로 둔다. 예: 글줄이 너무 길어지는 `50em`부터 `column-count: 2`. 사용자가 글자를 키우면 브레이크포인트도 따라 움직인다.
- 높이도 조건이 된다. 넓지만 낮은 창에서 다단을 쓰면 위아래로 오가며 읽어야 하므로 `(min-width: 50em) and (min-height: 30em)`처럼 함께 건다.
- 미디어 타입, `and`·`or`·`not`, 범위 문법(`width >= 40em`), 그 밖의 미디어 기능은 [[media-features|미디어 쿼리 문법과 미디어 기능]]에 있다.
- 화면 전체가 아니라 **부모 너비**에 반응해야 하는 카드 같은 컴포넌트는 컨테이너 쿼리가 낫다(아래).

## 컨테이너 쿼리

> 이 절은 web.dev 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Container queries 모듈을 바탕으로 보강했다.

미디어 쿼리는 뷰포트를 묻고, 컨테이너 쿼리(`@container`)는 **조상 요소의 크기**를 묻는다. 같은 가입 폼이 넓은 본문에서는 가로로, 좁은 사이드바에서는 세로로 놓이게 할 수 있다. 2023년 2월부터 모든 주요 브라우저가 지원하고(Baseline 2023), 30개월이 지난 2025년 8월 Widely available이 됐다. 폴백 없이 써도 된다.

두 단계다. 컨테이너를 정하고, 그 자손에 조건부 스타일을 쓴다.

```css
.card-slot { container: card / inline-size; }       /* container-name / container-type 축약 */

@container card (inline-size > 30em) {
  .card { display: grid; grid-template-columns: 120px 1fr; }
}
.card button { padding: 2cqi 5cqi; }                /* 컨테이너 너비에 비례하는 여백 */
```

| `container-type` | 물을 수 있는 것 | 대가 |
| --- | --- | --- |
| `inline-size` | 인라인 크기(가로쓰기면 너비) | 자손이 컨테이너의 **너비**에 영향을 주지 못한다 |
| `size` | 인라인·블록 크기 둘 다, `aspect-ratio`, `orientation` | 자손이 높이에도 영향을 주지 못해, 크기를 직접 주지 않으면 **높이가 0으로 접힌다** |

- 조건: `width`, `height`, `inline-size`, `block-size`, `aspect-ratio`, `orientation`. 범위 문법(`(10em <= width <= 500px)`)과 옛 문법(`(min-width: 300px)`) 모두 되고, `and`·`or`로 묶는다.
- 이름 없는 `@container`는 **가장 가까운** 컨테이너 조상을 묻는다. `container-name`으로 이름을 주면 더 먼 조상을 고를 수 있지만, 그 컨테이너도 조상이어야 한다.
- 컨테이너는 자기 자신을 쿼리할 수 없다. 스타일을 바꿀 요소를 감싸는 요소를 컨테이너로 둔다.
- 컨테이너 단위 `cqw`·`cqh`·`cqi`·`cqb`·`cqmin`·`cqmax`는 가장 가까운 컨테이너 크기의 1%다.
- `@container`는 선택자 안에 중첩하거나 `@layer` 안에 둘 수 있다.

### 페이지는 미디어 쿼리, 컴포넌트는 컨테이너 쿼리

둘은 경쟁하지 않는다. 페이지 전체의 열 나눔(매크로 레이아웃)은 뷰포트에, 그 안에 놓이는 컴포넌트(마이크로 레이아웃)는 자기 칸에 반응하게 한다.

```css
@media (min-width: 45em) {
  body { display: grid; grid-template-columns: 3fr 1fr; }   /* 본문 + 사이드바 */
}

main, aside { container-type: inline-size; }

.media-illustration { max-inline-size: 200px; margin: auto; }
@container (min-width: 25em) {
  .media { display: flex; align-items: center; gap: 1em; }
  .media-illustration { flex: 1; }
  .media-content { flex: 3; }
}
```

같은 `.media`가 넓은 본문에서는 가로로, 좁은 사이드바에서는 세로로 놓인다. 화면 폭은 상관없다.

## 미디어 쿼리가 필요 없을 때

브레이크포인트를 `30em`, `45em`, `60em`… 계속 늘리고 있다면 규칙을 바꿀 때다. **요소의 최소 크기만 정하고 몇 개가 들어갈지는 브라우저가 계산하게** 한다.

```css
/* 카드가 15em보다 좁아지지 않는 선에서 한 줄에 최대한 */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15em, 1fr));
  gap: 1em;
}
```

플렉스로 `flex: 1 1 15em` + `flex-wrap: wrap`을 써도 비슷하지만, 마지막 줄의 남은 카드가 늘어나 열이 맞지 않는다. 행과 열을 맞춰야 하면 그리드다. `auto-fill`과 `auto-fit`의 차이는 [[css-grid|CSS 그리드 레이아웃]]에 있다.

## 모바일 퍼스트

모바일 퍼스트(Mobile-first)는 작은 화면용 스타일을 기본으로 쓰고, `min-width` 미디어 쿼리로 큰 화면 스타일을 **덧붙이는** 방식이다.

| | 모바일 퍼스트 (`min-width`) | 데스크톱 퍼스트 (`max-width`) |
| --- | --- | --- |
| 기본 스타일 | 한 열, 단순한 배치 | 여러 열, 복잡한 배치 |
| 모바일 기기의 부담 | 필요한 규칙만 적용한다 | 큰 화면 규칙을 받은 뒤 덮어쓴다 |
| 설계 효과 | 핵심 콘텐츠부터 우선순위를 정하게 된다 | 나중에 모바일에서 덜어 낼 것을 고르게 된다 |

## 유동 미디어

글은 화면 끝에서 알아서 줄을 바꾸지만 이미지·영상·iframe은 고유 크기가 있어 화면보다 크면 넘친다. 기본 스타일에 한 줄 넣어 둔다.

```css
img, video, iframe {
  max-inline-size: 100%;   /* 부모보다 넓게 그려지지 않는다 */
  block-size: auto;        /* 비율을 지킨다 */
}
```

HTML에는 `width`·`height` 속성을 넣어 비율만큼 자리를 미리 잡게 한다([[cls-optimization|CLS 최적화]]). 비율을 바꿔 잘라야 하면 `aspect-ratio` + `object-fit: cover` + `object-position`을 쓴다. 화면에 맞는 파일을 고르는 `srcset`·`sizes`·`<picture>`와 `loading`·`fetchpriority`는 [[responsive-images|반응형 이미지]]에, 아이콘은 [[svg-icons|SVG 아이콘]]에 있다.

## 해상도와 기기 픽셀 비율

CSS의 `px`는 물리 픽셀이 아니라 CSS 픽셀이고, 기기 픽셀 비율(DPR)이 2인 화면은 CSS 1px을 물리 픽셀 2×2로 그린다. 화면에 맞는 이미지를 고르게 하는 `srcset`·`sizes`는 [[responsive-images|반응형 이미지]]에 있다.

## 폴드(Fold)

폴드는 스크롤하지 않고 처음 보이는 영역의 경계다. 신문 1면의 접힌 선에서 온 말이다. 기기마다 높이가 달라 고정된 픽셀 값은 없다. 핵심 메시지와 행동 유도(CTA) 버튼을 첫 화면에 두되, 「첫 화면에 다 넣어야 한다」는 강박은 버린다. 사람들은 스크롤한다. 첫 화면의 큰 이미지는 [[web-vitals|LCP]]에 직접 영향을 준다.

## 상대 단위로 유연하게

`rem`·`dvh`·`cqi` 같은 단위의 전체 표는 [[css-basics|CSS 기초]]에 있다. 반응형에서 특히 쓸모 있는 두 가지는 다음과 같다.

| 단위·함수 | 쓰임 |
| --- | --- |
| `clamp(최소, 선호, 최대)` | 미디어 쿼리 없이 크기를 부드럽게. 예: `font-size: clamp(1rem, 0.75rem + 1.5vw, 2rem)` |
| `max-width` + `width: 100%` | 큰 화면에서는 멈추고 작은 화면에서는 줄어드는 상자 |

**유동 글자 크기에 `vw`만 쓰지 않는다.** `font-size: 2.5vw`는 사용자가 확대해도 커지지 않는다. `rem`을 섞고(`0.75rem + 1.5vw`), 최솟값을 `1rem` 아래로 두지 않는다. 이유는 [[css-functions|CSS 함수]]에, 글줄 길이(`max-inline-size: 66ch`)와 단위 없는 `line-height`는 [[web-typography|웹 타이포그래피]]에, 웹폰트 로딩은 [[web-font-performance|웹 폰트 성능 최적화]]에 있다.

## 반응형과 접근성

반응형 레이아웃은 그 자체로 접근성 장치다.

- 데스크톱에서 글자를 400%로 키운 사람은 **작은 화면과 같은 레이아웃**을 받아야 한다. `em` 브레이크포인트와 `rem` 글자 크기를 쓰면 저절로 그렇게 된다(WCAG 1.4.10 Reflow, [[accessible-css-typography|접근성을 위한 CSS와 타이포그래피]]).
- 그리드·플렉스의 `order`로 화면 순서를 소스 순서와 다르게 바꾸면 키보드 탭 순서와 어긋난다([[keyboard-accessibility|키보드 접근성과 포커스 관리]]).
- 사용자 설정(다크 모드, 대비, 움직임 줄이기)에 반응하는 것도 반응형이다([[color-motion-accessibility|색과 움직임의 접근성]], [[dark-mode-theming|테마와 다크 모드 구현]]).
- 입력 장치는 화면 크기로 짐작하지 않는다([[media-features|미디어 쿼리 문법과 미디어 기능]]).

## 다국어 반응형 타이포그래피

> 스포카 강영화의 「[다국어 환경에 맞게 타이포그래피 세팅하기](https://spoqa.github.io/2016/06/03/localize-type-setting.html)」(2016.06)를 바탕으로 재구성한 내용이다.

반응형은 화면 크기만의 문제가 아니다. 같은 컴포넌트라도 **언어**에 따라 글자 너비가 다르다. 일본어 가나는 한글보다 넓은 경우가 많아, 좁은 버튼과 카드에서 일본어 문구만 어색하게 줄바꿈되기 쉽다.

해결책은 **해당 언어일 때만 루트 글자 크기를 낮추는 것**이다. 모든 글자 크기를 `rem`으로 써 두면 루트 하나만 바꿔도 전체가 함께 줄어든다.

```scss
@use "sass:math";

html { font-size: 100%; }
html:lang(ja) { font-size: 90%; }   // 1rem = 14.4px

// px로 쓰던 값을 rem으로 바꾸는 믹스인
@mixin font-size($size) { font-size: math.div($size, 16) * 1rem; }
.title { @include font-size(16); }   // 한국어 16px, 일본어 14.4px
```

1. `<html lang="ja">`처럼 문서에 언어를 표시해야 `:lang()` 선택자가 동작한다.
2. 픽셀로 쓴 글자 크기를 믹스인으로 한 번에 `rem`으로 바꾼다. 하나씩 고치다 빠뜨리는 일을 막는다. Dart Sass에서 `/` 나눗셈은 폐기 예고됐으므로 `math.div()`를 쓴다([[sass|Sass]]).
3. 한국어 본문에는 `body { word-break: keep-all; }`을 기본으로 둔다. 기본값 `normal`은 한글 단어 중간에서도 줄을 바꾼다.

독일어처럼 단어가 긴 언어는 줄바꿈보다 넘침이 문제다. `overflow-wrap: anywhere`나 `hyphens: auto`를 함께 검토한다. 아랍어·히브리어 같은 RTL 언어는 여백·테두리를 논리 속성으로 써 두면 따로 대응할 일이 거의 없다([[logical-properties|쓰기 모드와 논리적 속성]]). `<html dir="rtl">`로 바꿔 보면 미리 확인할 수 있다.

번역될 화면을 설계할 때 더 챙길 것:

| 항목 | 이유 |
| --- | --- |
| 좁은 칸을 만들지 않는다 | 독일어처럼 긴 낱말이 흔한 언어는 칸을 넘친다 |
| `line-height`를 넉넉히 | 악센트·발음 구별 기호가 위아래 줄과 겹치지 않게 |
| 웹폰트의 글리프 범위 확인 | 번역할 언어의 글자가 폰트에 없으면 시스템 글꼴로 섞여 나온다 |
| 이미지에 글자를 넣지 않는다 | 언어마다 이미지를 다시 만들어야 한다. 글은 CSS로 이미지 위에 얹는다 |

`lang`·`hreflang`으로 언어를 표시하는 법과 언어별 URL 구조는 [[multilingual-pages|다국어 페이지: lang·hreflang과 국제화]]에 있다.

## 정리

- 뷰포트 메타 태그, 모바일 퍼스트 `min-width` 쿼리, 상대 단위가 반응형의 세 기둥이다.
- 브레이크포인트는 기기가 아니라 콘텐츠가 깨지는 곳에 둔다.
- 글자 크기를 `rem`으로 통일해 두면 화면이나 언어에 따라 루트 하나로 조절할 수 있다.
- 페이지는 미디어 쿼리, 컴포넌트는 컨테이너 쿼리. 브레이크포인트가 늘어나면 `auto-fill` + `minmax()`로 계산을 브라우저에 맡긴다.
- 이미지는 `max-inline-size: 100%`로 넘치지 않게 한다.

관련 노트: [[css-basics|CSS 기초]], [[flexbox|Float와 Flexbox 레이아웃]], [[box-model|박스 모델과 display]], [[web-vitals|웹 성능 지표와 Lighthouse]], [[web-typography|웹 타이포그래피: 가독성, 글줄 길이, 웹폰트]], [[css-grid|CSS 그리드 레이아웃]], [[web-layout-design|웹 레이아웃 디자인: 인쇄와 다른 매체]], [[devtools-device-emulation|DevTools로 기기·환경 에뮬레이션하기]], [[media-features|미디어 쿼리 문법과 미디어 기능]], [[safe-area-foldable|노치와 폴더블 화면 대응]], [[dark-mode-theming|테마와 다크 모드 구현]], [[responsive-ui-patterns|반응형 UI 패턴]], [[multilingual-pages|다국어 페이지: lang·hreflang과 국제화]]
