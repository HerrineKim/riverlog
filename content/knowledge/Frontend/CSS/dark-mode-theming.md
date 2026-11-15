---
title: "테마와 다크 모드 구현: theme-color, color-scheme, accent-color"
concept: "Theming"
summary: "테마는 페이지 색만이 아니라 브라우저 UI(theme-color), 브라우저가 그리는 폼·스크롤바(color-scheme), 체크박스·라디오 강조색(accent-color), 아이콘과 사진까지 함께 바꿔야 완성된다. 색 값은 커스텀 속성에 모아 한 번만 재정의하고, 사진은 밝기를 낮추거나 picture로 바꿔 끼운다."
tags: ["css", "frontend", "design", "responsive", "pwa"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/design/theming", "https://web.dev/learn/design/media-features", "https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme", "https://developer.mozilla.org/en-US/docs/Web/CSS/accent-color"]
---

> web.dev의 「[Learn Responsive Design](https://web.dev/learn/design)」 강좌의 Theming 모듈을 바탕으로, 속성 이름과 지원 범위는 MDN으로 확인해 재구성한 노트다.

## 테마가 닿는 곳

반응형은 화면 크기뿐 아니라 **사용자 설정**에도 반응한다. 다크 모드가 대표적이다. 다크 모드가 왜 필요한지, 대비 기준은 무엇인지는 [[color-motion-accessibility|색과 움직임의 접근성]]에, 색 변수를 팔레트·기능·컴포넌트로 나누는 설계는 [[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]]에 있다. 이 노트는 테마를 끝까지 적용하는 체크리스트다.

| 대상 | 누가 그리나 | 도구 |
| --- | --- | --- |
| 주소창·상태 표시줄 | 브라우저 | `<meta name="theme-color">`, 매니페스트 `theme_color` |
| 본문 배경·글자·테두리 | 내 CSS | 커스텀 속성 + `prefers-color-scheme` 또는 `light-dark()` |
| 기본 폼 컨트롤·스크롤바 | 브라우저 | `color-scheme` |
| 체크박스·라디오·범위·진행 막대의 강조색 | 브라우저 | `accent-color` |
| 인라인 SVG 아이콘 | 내 CSS | `currentColor`, 커스텀 속성 |
| 사진·지도 | 이미지 파일 | `filter`, `<picture>`의 `media` |
| 파비콘 | 이미지 파일 | SVG 파비콘 안의 `@media (prefers-color-scheme)` |

## 1. 브라우저 UI: theme-color

```html
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#111111" media="(prefers-color-scheme: dark)">
```

- HTML에 두는 이유는 CSS를 기다리지 않고 페이지가 열리자마자 브라우저 UI를 칠하기 위해서다.
- JavaScript로 바꿀 수 있지만 자주 바꾸면 사용자를 피곤하게 한다. 바꾸더라도 은은하게 바꾼다.
- 홈 화면에 추가된 앱의 색은 웹 앱 매니페스트의 `theme_color`·`background_color`가 정한다. 어느 브라우저가 이 값을 쓰는지는 [[html-head-metadata|문서 head와 메타데이터]]에 있다.

## 2. 페이지 색: 커스텀 속성을 한 번만 재정의

선택자마다 다크 모드 규칙을 다시 쓰면 색이 바뀔 때마다 두 곳을 고친다. **색을 변수에 담고 미디어 쿼리 안에서는 변수만 바꾼다.**

```css
:root {
  color-scheme: light dark;
  --page: white;
  --ink: black;
  --accent: #c00;
}
@media (prefers-color-scheme: dark) {
  :root {
    --page: #111;
    --ink: #eee;
    --accent: pink;          /* 어두운 테마에서는 브랜드 색을 한 단계 누그러뜨린다 */
  }
}

body   { background-color: var(--page); color: var(--ink); }
button { background-color: var(--ink);  color: var(--page); }
:root  { accent-color: var(--accent); }
```

같은 일을 미디어 쿼리 없이 `color: light-dark(black, #eee)`로 쓸 수도 있다. 이 함수는 `color-scheme`이 선언돼 있어야 동작한다.

### 시스템 설정 + 사용자 선택

시스템 설정을 기본으로 따르되 사이트 안에서도 바꿀 수 있게 하려면, `color-scheme` 자체를 바꾼다. `light-dark()`로 쓴 색이 모두 따라온다.

```css
:root                     { color-scheme: light dark; }  /* 기본: 시스템을 따른다 */
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"]  { color-scheme: dark; }

body { background: light-dark(white, #111); color: light-dark(black, #eee); }
```

선택값은 저장해 두고 첫 렌더 전에 `data-theme`을 붙인다. 늦게 붙이면 밝은 화면이 한 번 번쩍인다.

## 3. 브라우저가 그리는 부분: color-scheme

`color-scheme`은 **이 요소가 어떤 색 체계로 그려져도 되는지** 브라우저에 알린다. `dark`가 들어 있으면 브라우저는 입력란·버튼·스크롤바·기본 배경을 어두운 기본 스타일로 그린다. 이것 없이 배경만 검게 칠하면 흰 입력란과 흰 스크롤바가 남는다.

| 값 | 뜻 |
| --- | --- |
| `normal` | 지정 안 함. 페이지 기본(대개 밝음) |
| `light` / `dark` | 그 체계만 |
| `light dark` | 둘 다 된다. 사용자 설정을 따른다 |
| `only light` | 브라우저가 자동으로 어둡게 바꾸는 기능도 막는다 |

CSS가 내려오기 전부터 적용하려면 meta로도 선언한다. 과거 초안의 `supported-color-schemes`가 아니라 `color-scheme`이 표준 이름이다.

```html
<meta name="color-scheme" content="light dark">
```

## 4. 폼 강조색: accent-color

```css
:root { accent-color: var(--accent); }
```

체크박스, 라디오 버튼, `<input type="range">`, `<progress>`의 강조색을 한 줄로 브랜드 색에 맞춘다. 컨트롤을 직접 다시 만들지 않아도 된다. 브라우저는 강조색에 맞춰 체크 표시 색을 대비가 나게 고른다. Baseline 2022다.

## 5. 아이콘과 이미지

| 대상 | 방법 |
| --- | --- |
| 인라인 SVG 아이콘 | `fill: currentColor` 또는 `stroke: var(--ink)`. 글자색이 바뀌면 함께 바뀐다([[svg-icons\|SVG 아이콘]]) |
| 사진 | 어두운 테마에서 `img { filter: brightness(.8) contrast(1.2); }`로 눈부심을 줄인다 |
| 지도·도표처럼 통째로 바꿔야 하는 이미지 | `<picture>`의 `<source media="(prefers-color-scheme: dark)">`로 어두운 판을 준다 |
| SVG 파비콘 | SVG 안 `<style>`에 `@media (prefers-color-scheme: dark)`를 넣는다. 브라우저마다 지원이 다르다 |

```html
<picture>
  <source srcset="map-dark.png" media="(prefers-color-scheme: dark)">
  <img src="map-light.png" alt="매장 위치 지도">
</picture>
```

`<picture>`의 다른 쓰임(아트 디렉션, 새 형식 대체)은 [[responsive-images|반응형 이미지]]에 있다.

## 정리

- 테마는 브라우저 UI(`theme-color`), 브라우저 기본 컨트롤(`color-scheme`), 강조색(`accent-color`), 내 CSS, 아이콘, 이미지까지 모두 바꿔야 끝난다.
- 색 값은 커스텀 속성에 모으고 미디어 쿼리에서는 변수만 바꾼다. 아니면 `light-dark()`로 한 줄에 둘 다 쓴다.
- 사용자 선택을 지원할 때는 `color-scheme`을 바꾸고, 첫 렌더 전에 적용해 깜빡임을 막는다.

관련 노트: [[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]], [[color-motion-accessibility|색과 움직임의 접근성]], [[media-features|미디어 쿼리 문법과 미디어 기능]], [[html-head-metadata|문서 head와 메타데이터]], [[svg-icons|SVG 아이콘]]
