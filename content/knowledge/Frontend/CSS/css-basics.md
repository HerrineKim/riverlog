---
title: "CSS 기초: 문법, 적용 방법, 단위"
concept: "CSS Syntax"
summary: "선택자와 선언으로 이루어진 CSS 문법, 스타일 적용 방법 3가지, 크기와 색상 단위."
tags: ["css", "frontend"]
source: til
date: "2026-10-12"
sources: ["https://riverkim.kr/263", "https://riverkim.kr/271", "https://riverkim.kr/225"]
---

CSS는 "어떤 요소를(선택자) 어떻게 바꿀지(선언)"를 적는 언어다. 문법 자체는 단순하지만, 스타일을 **어디에** 작성하느냐와 **어떤 단위**를 쓰느냐에 따라 유지보수성과 반응형 대응이 크게 달라진다.

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

| 단위 | 기준 | 특징 |
| --- | --- | --- |
| `px` | 화면의 픽셀 | 고정 크기 |
| `%` | 부모 요소 | 가변 레이아웃에 자주 사용 |
| `em` | 부모(상속받은) 글꼴 크기의 배수 | 중첩될수록 누적되어 커지거나 작아진다 |
| `rem` | 최상위 요소(`html`)의 글꼴 크기의 배수 | 상속의 영향을 받지 않아 예측이 쉽다 |
| `vw`, `vh`, `vmin`, `vmax` | 뷰포트(사용자에게 보이는 화면 영역) | `100vh` = 화면 높이 전체 |

## 색상 표현

| 방식 | 예 |
| --- | --- |
| 색상 키워드(대소문자 무관) | `red`, `black` |
| 16진수(HEX) | `#ff0000`, 투명도 포함 `#ff000055` |
| RGB / RGBA | `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)` |
| HSL / HSLA (색상·채도·명도) | `hsl(120, 100%, 25%)`, `hsla(120, 100%, 50%, 0.3)` |
| `currentColor` | 현재 요소의 `color` 값을 그대로 사용 |

`a`(alpha)는 투명도를 뜻한다.

16진수 색은 `#RRGGBB` 꼴로 빨강·초록·파랑을 두 자리씩 `00`~`ff`(0~255)로 적는다. 두 자리가 같은 값이면 `#f00`(= `#ff0000`)처럼 세 자리로 줄일 수 있고, 뒤에 두 자리를 더 붙이면 투명도다(`#RRGGBBAA`, 네 자리 축약 `#RGBA`). 디자인 도구가 Hex로 색을 주는 경우가 많아 가장 흔히 쓰인다.

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

## 브라우저 기본 스타일 주의: Safari의 버튼 글자색

`<button>`에 `color`를 지정하지 않으면 iOS·macOS Safari는 버튼 글자를 파란색(`-apple-system-blue`)으로 표시한다. 다른 브라우저에서는 검은 글씨로 보여 Safari에서만 뒤늦게 발견되기 쉽다. `-apple-system-blue`는 Apple의 HIG(Human Interface Guidelines) 디자인 언어에 맞춘 시스템 색상 키워드다.

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| Safari에서만 버튼 텍스트가 파랗다 | `color`가 없는 버튼에 Safari가 시스템 색을 적용 | 버튼에 `color`를 명시한다(예: `color: inherit`) |

리셋 CSS에 `button { color: inherit; }`를 넣어 두면 같은 문제를 미리 막는다.

## 핵심 정리

- CSS = 선택자 + `{ 속성: 값; }` 선언의 묶음.
- 공통 스타일은 외부 파일, 컴포넌트 단위 스타일은 내부/CSS-in-JS, 동적인 개별 값은 인라인으로 나눠 쓴다.
- 반응형에는 `rem`, `%`, `vw/vh` 같은 상대 단위가 유리하다. 자세한 방법은 [[responsive-design|반응형 디자인]]에 있다.
- 속성은 레이아웃에 큰 영향을 주는 것부터 순서를 정해 쓴다.
- 브라우저마다 기본 스타일이 다르다. 색 같은 기본값은 명시한다.
