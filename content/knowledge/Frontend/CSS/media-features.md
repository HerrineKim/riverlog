---
title: "미디어 쿼리 문법과 미디어 기능"
concept: "Media Features"
summary: "미디어 쿼리는 미디어 타입(all·screen·print)과 미디어 기능으로 이루어진다. and·or·not과 범위 문법으로 조건을 묶고, 뷰포트 크기·화면 비율·해상도·갱신 속도·표시 모드·색 표현력·입력 장치·사용자 설정·스크립트 여부까지 묻는다. 입력 방식은 화면 크기로 짐작하지 않고 pointer·hover로 직접 묻는다."
tags: ["css", "frontend", "responsive", "media", "mobile"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/design/media-queries", "https://web.dev/learn/design/media-features", "https://web.dev/learn/design/interaction", "https://developer.mozilla.org/en-US/docs/Web/CSS/@media"]
---

> web.dev의 「[Learn Responsive Design](https://web.dev/learn/design)」 강좌의 Media queries·Media features·Interaction 모듈을 바탕으로, 지원 범위는 MDN으로 확인해 재구성한 노트다.

## 미디어 쿼리의 구조

미디어 쿼리(media query)는 **어떤 출력 환경일 때만** 스타일을 적용하는 조건이다. 미디어 타입과 미디어 기능(media feature)으로 이루어진다.

```css
@media screen and (min-width: 40em) { … }
/*     └ 타입    └ 기능(조건)          */
```

- 타입을 생략하면 `all`이다. `@media (orientation: landscape)`는 `@media all and (orientation: landscape)`와 같다.
- 쓸 수 있는 타입은 `all`, `screen`, `print` 셋이다. `speech`·`tv`·`handheld` 같은 나머지는 Media Queries Level 4에서 폐기됐다.
- 같은 조건을 `<link>`의 `media` 속성에도 쓸 수 있다. 조건이 맞지 않는 스타일시트도 내려받기는 하지만 렌더링을 막지 않는다.

```html
<link rel="stylesheet" href="print.css" media="print">
```

인쇄용처럼 성격이 아주 다른 스타일만 파일을 나누고, 크기별 조건은 한 파일 안의 `@media`로 쓴다.

```css
@media print {
  body { background-color: transparent; }   /* 인쇄할 때 잉크를 아낀다 */
}
```

## 조건 묶기

| 문법 | 뜻 | 예 |
| --- | --- | --- |
| `and` | 모두 참 | `(min-width: 50em) and (min-height: 30em)` |
| `,` 또는 `or` | 하나라도 참 | `(orientation: portrait), (max-width: 30em)` |
| `not` | 뒤집기 | `not ((width >= 30em) or (orientation: landscape))` |
| 범위 문법 | 비교 연산자로 쓰는 `min-`·`max-` | `(width <= 400px)`, `(50em <= width <= 60em)` |

- 범위 문법은 Baseline 2023이다. `min-width: 400px`는 400px을 **포함**하므로 `width >= 400px`와 같다.
- `not`·`or`가 섞이면 사람이 읽고 틀리기 쉽다. 실제로 창 크기를 바꿔 가며 확인한다.
- 단위는 아무 길이 단위나 된다. 글 위주 페이지는 `em`이 낫다. 사용자가 기본 글자 크기를 키우면 브레이크포인트도 함께 움직여, 큰 글자에서는 좁은 화면용 배치가 나온다.
- 미디어 쿼리에는 논리 속성이 없다. `inline-size` 같은 기능은 없고 `width`·`height`만 있다.

### min- 으로 덧붙이기

`min-width`로 쓰면 브레이크포인트마다 규칙을 **더하고**, `max-width`로 쓰면 앞서 준 규칙을 **되돌린다.** 덧붙이는 쪽이 읽기 쉽고 겹칠 일이 적다. 높이도 같다.

```css
@media (min-height: 30em) {
  header { position: sticky; top: 0; }   /* 세로 공간이 넉넉할 때만 고정 */
}
@media (min-width: 50em) and (min-height: 30em) {
  article { column-count: 2; }           /* 넓어도 낮으면 단을 나누지 않는다 */
}
```

넓지만 낮은 창에서 다단을 쓰면 한 단을 끝까지 내렸다가 다시 위로 올라가 다음 단을 읽어야 한다. 그래서 다단 조건에 높이를 함께 건다.

## 미디어 기능 분류

| 분류 | 기능 | 값과 쓰임 |
| --- | --- | --- |
| 뷰포트 | `width`, `height` | 가장 많이 쓴다. 레이아웃 전환 |
| | `aspect-ratio` | `16/9`처럼 비율. `min-`·`max-`·정확한 값 |
| | `orientation` | `portrait`(높이 ≥ 너비), `landscape`. 기기가 아니라 **뷰포트** 기준이라 데스크톱의 넓은 창도 `landscape`다 |
| 디스플레이 | `resolution` | `2dppx`, `300dpi`. 이미지 말고는 쓸 일이 드물고, 이미지는 [[responsive-images\|srcset]]이 해결한다 |
| | `update` | `fast`(애니메이션 가능), `slow`(전자잉크), `none`(인쇄물) |
| | `display-mode` | `browser`, `minimal-ui`, `standalone`, `fullscreen` 등. 웹 앱 매니페스트의 `display` 값에 대응한다 |
| 색 | `color`, `monochrome` | 컬러 화면인가, 흑백 화면인가 |
| | `color-gamut` | `srgb`, `p3`, `rec2020` 중 어디까지 표현하나 |
| | `dynamic-range` | `standard`, `high`(HDR급 밝기·대비) |
| 입력 | `pointer`, `any-pointer`, `hover`, `any-hover` | 아래 「입력 장치」 |
| 사용자 설정 | `prefers-color-scheme`, `prefers-contrast`, `prefers-reduced-motion`, `forced-colors` | 아래 「사용자 설정」 |
| 스크립트 | `scripting` | `enabled`, `initial-only`(첫 렌더만, 예: 인쇄), `none`. Baseline 2023 |

`device-width`·`device-height`·`device-aspect-ratio`는 폐기됐다. 기기 화면이 아니라 뷰포트를 묻는다. 접는 화면을 묻는 `horizontal-viewport-segments`는 [[safe-area-foldable|노치와 폴더블 화면 대응]]에 있다.

### 디스플레이와 색 예시

```css
/* 갱신이 빠른 화면에서만 움직임을 넣는다 */
@media (update: fast) {
  a { transition: transform 0.4s; }
  a:hover { transform: scale(1.5); }
}

/* 홈 화면에서 주소창 없이 열렸으면 자체 뒤로 가기 버튼을 보인다 */
button.back { display: none; }
@media (display-mode: standalone) {
  button.back { display: inline; }
}

/* 넓은 색역 화면에는 더 선명한 빨강 */
.neon { color: rgb(255 40 60); }
@media (color-gamut: p3) {
  .neon { color: color(display-p3 1 0 0); }
}
```

`display-mode`와 매니페스트는 [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]], 넓은 색역의 색 표기는 [[css-basics|CSS 기초]]에 있다.

## 입력 장치

작은 화면 = 터치, 큰 화면 = 마우스라는 짐작은 틀린다. 터치스크린 노트북이 있고, 태블릿에 키보드와 마우스를 붙이기도 한다. 입력 방식은 화면 크기로 짐작하지 말고 미디어 기능으로 직접 묻는다.

| 기능 | 묻는 것 | 값 |
| --- | --- | --- |
| `pointer` | **주** 입력 장치의 정밀도 | `fine`(마우스·스타일러스), `coarse`(손가락), `none`(키보드만) |
| `any-pointer` | 연결된 장치 **중 하나라도** | 같은 값. `fine`과 `coarse`가 동시에 참일 수 있어, 뒤에 쓴 규칙이 이긴다. 마우스를 연결한 터치스크린 노트북은 `pointer: coarse`, `any-pointer: coarse`, `any-pointer: fine`이 모두 맞는다 |
| `hover` | 주 입력 장치로 호버할 수 있나 | `hover`, `none` |
| `any-hover` | 하나라도 호버할 수 있나 | `hover`, `none` |

설계 원칙:

- **굵은 포인터에는 타깃을 키운다. 가는 포인터라고 줄이지는 않는다.** 피츠의 법칙(Fitts's law)대로 작은 타깃은 마우스로도 맞히기 어렵다. 큰 타깃은 모두에게 이롭다.
- **호버로만 정보를 드러내지 않는다.** 마우스가 붙은 데스크톱도 키보드로 탭 이동하면 `:hover`가 일어나지 않는다. 숨겼다 보이는 요소는 `:is(:hover, :focus-visible)`로 함께 연다. 중요한 정보와 조작은 애초에 숨기지 않는다.
- 기본을 「보이는 상태」로 두고, 호버가 되는 환경에서만 숨긴다. 호버가 안 되는 기기에서 기능이 사라지지 않는다.

```css
button .extra { visibility: visible; }
@media (hover: hover) {
  button .extra { visibility: hidden; }
  button:is(:hover, :focus-visible) .extra { visibility: visible; }
}
@media (pointer: coarse) {
  button { padding: 1em 2em; min-block-size: 44px; }   /* 손가락이 누를 만한 크기 */
}
```

커서 모양과 `touch-action`은 [[css-cursor-pointer|커서와 포인터 입력]]에 있다. 가상 키보드는 `type`·`inputmode`·`autocomplete`로 맞춘다([[html-input-types|HTML 입력 요소 치트시트]], [[form-usability|더 나은 폼을 만드는 팁]]).

## 사용자 설정

다크 모드, 대비, 움직임 줄이기, 강제 색상 모드를 묻는 기능의 의미와 접근성 기준은 [[color-motion-accessibility|색과 움직임의 접근성]]에, 다크 모드를 실제로 칠하는 방법은 [[dark-mode-theming|테마와 다크 모드 구현]]에 있다. 여기서는 기능끼리의 관계만 짚는다.

- `forced-colors: active`(Windows 대비 테마)이면 `prefers-contrast`도 함께 참이 된다. 고대비 테마는 `more`, 저대비는 `less`, 판단할 수 없으면 `custom`이다. 강제 색상 없이 대비만 높여 달라는 사람을 고르려면 `(prefers-contrast: more) and (forced-colors: none)`이다.
- 강제 색상 모드는 링크·버튼·입력란에 테마 색을 알아서 입힌다. 색 견본이나 범례처럼 색 자체가 내용인 요소만 `forced-color-adjust: none`으로 빼고, 그 뒤에도 내용이 읽히는지 확인한다.
- `inverted-colors`(색 반전)는 사파리만 지원한다. 색을 반전해도 그림자·사진이 어색해지지 않는지는 OS 설정을 켜 놓고 직접 본다.

## 정리

- 미디어 쿼리 = 타입(`all`·`screen`·`print`) + 기능. 타입은 대개 생략한다.
- `min-` 쪽으로 덧붙여 쓰고, 글 위주면 `em` 단위로 브레이크포인트를 둔다.
- 뷰포트 크기 말고도 비율·갱신 속도·표시 모드·색역·입력 장치·사용자 설정·스크립트 여부를 물을 수 있다.
- 입력 방식은 화면 크기로 추측하지 않는다. 타깃은 키우는 쪽으로만, 호버에만 기대지 않는다.

관련 노트: [[responsive-design|반응형 디자인과 다국어 타이포그래피]], [[css-cursor-pointer|커서와 포인터 입력]], [[color-motion-accessibility|색과 움직임의 접근성]], [[dark-mode-theming|테마와 다크 모드 구현]], [[safe-area-foldable|노치와 폴더블 화면 대응]], [[css-progressive-enhancement|CSS 점진적 향상: 폴백과 피처 쿼리]]
