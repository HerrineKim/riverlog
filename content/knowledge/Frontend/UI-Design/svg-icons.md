---
title: "SVG 아이콘: 형식, 넣는 방법, 이름 붙이기, 스타일"
concept: "SVG Icons"
summary: "아이콘은 콘텐츠가 아니라 인터페이스의 일부라 글자처럼 커지고 색이 바뀌어야 한다. 그래서 크기마다 파일이 필요한 PNG보다 한 파일로 모든 크기를 그리는 SVG가 맞다. 글과 함께 있는 아이콘은 장식이니 숨기고, 아이콘만 있는 버튼은 뜻을 이름으로 준다. 인라인 SVG는 currentColor로 글자색과 테마를 따라가게 한다. 프레젠테이션 속성의 낮은 우선순위, transform-box: fill-box, 선 그리기 효과, 넣는 방법별로 되는 CSS도 다룬다."
tags: ["design", "frontend", "accessibility", "media", "responsive"]
source: other
date: "2026-10-21"
sources: ["https://web.dev/learn/design/icons", "https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use", "https://www.smashingmagazine.com/2014/11/styling-and-animating-svgs-with-css/", "https://developer.mozilla.org/en-US/docs/Web/CSS/transform-box"]
---

> web.dev의 「[Learn Responsive Design](https://web.dev/learn/design)」 강좌의 Icons 모듈을 바탕으로 재구성한 노트다. CSS로 SVG를 꾸미고 움직이는 법은 「[Styling And Animating SVGs With CSS](https://www.smashingmagazine.com/2014/11/styling-and-animating-svgs-with-css/)」를 바탕으로, 브라우저 지원은 MDN으로 확인해 보강했다.

## 왜 SVG인가

사진은 콘텐츠지만 아이콘은 **인터페이스**다. 인터페이스의 글자가 커지고 색이 바뀌면 아이콘도 같이 따라가야 한다.

| | PNG (비트맵) | SVG (벡터) |
| --- | --- | --- |
| 저장 방식 | 픽셀 | 그리기 명령(XML) |
| 크기 대응 | 크기·밀도마다 파일을 만들고 `srcset`으로 고른다 | **한 파일**이 어떤 크기에서도 선명하다 |
| 투명 배경, 단색 면 | 된다 | 된다 |
| CSS로 색 바꾸기 | 안 된다 | 인라인이면 된다 |
| 맞는 곳 | 사진처럼 복잡한 그림 | 아이콘, 로고, 단순한 도형 |

사진 형식(JPEG·WebP·AVIF)은 [[image-formats|웹 이미지 형식]]에 있다. 디자인 도구에서 내보낸 SVG에는 쓸모없는 메타데이터가 많으니 SVGO(SVGOMG) 같은 도구로 줄인다.

## 넣는 세 가지 방법

| 방법 | 장점 | 한계 |
| --- | --- | --- |
| `<img src="icon.svg">` | 캐시된다. 마크업이 짧다 | CSS로 내부 색을 못 바꾼다 |
| CSS `background-image` | 순수 장식일 때 HTML을 깨끗하게 둔다 | 접근 가능한 이름을 줄 수 없다. 색을 못 바꾼다 |
| 인라인 `<svg>` | 요청이 없다. 부분마다 CSS로 칠하고 `:hover`·테마를 따른다 | HTML이 길어진다. 캐시되지 않는다 |

같은 아이콘을 여러 번 쓰면 매번 전체 마크업을 반복하지 말고, 한 곳에 `<symbol>`로 정의해 두고 `<use href="#icon-menu">`로 복제한다(스프라이트).

```html
<svg hidden>
  <symbol id="icon-menu" viewBox="0 0 100 80">
    <rect width="100" height="20"/><rect y="30" width="100" height="20"/><rect y="60" width="100" height="20"/>
  </symbol>
</svg>

<button><svg aria-hidden="true" width="16" height="16"><use href="#icon-menu"/></svg> 메뉴</button>
```

## 이름 붙이기: 장식인가, 단독인가

**버튼·링크의 뜻은 글자가 전한다.** 아이콘이 글 옆에 있으면 장식이고, 글 없이 혼자 있으면 그 아이콘이 뜻을 져야 한다.

| 경우 | `<img>` | 인라인 `<svg>` |
| --- | --- | --- |
| 글 + 아이콘 (장식) | `alt=""` (빈 값. `alt`를 **빼면 안 된다**) | `aria-hidden="true"` |
| 아이콘만 (단독) | `alt="메뉴"`: 모양(「가로줄 세 개」)이 아니라 **뜻**을 쓴다 | 버튼에 `aria-label="메뉴"`, 아이콘에 `aria-hidden="true"` |
| 아이콘만, 다른 방식 | 버튼에 `aria-label="메뉴"`, 이미지는 `alt=""` | - |

```html
<!-- 장식 -->
<button><img src="menu.svg" alt="" width="16" height="16"> 메뉴</button>

<!-- 단독 -->
<button aria-label="메뉴">
  <svg aria-hidden="true" viewBox="0 0 100 80" width="16" height="16">…</svg>
</button>
```

- 단독 아이콘은 CSS 배경 이미지로 넣지 않는다. 이름을 줄 수 없다.
- 아이콘의 뜻을 모두가 안다고 가정하지 않는다. 확신이 없으면 글을 붙이거나 실제 사용자로 시험한다. 이름 없는 아이콘 메뉴의 문제는 [[responsive-ui-patterns|반응형 UI 패턴]], `alt`를 쓰는 원칙과 링크 속 SVG의 보조 기술 지원은 [[accessible-images-links-text|대체 텍스트, 링크, 쉬운 글]]에 있다.

## 스타일: 글자색을 따라가게

인라인 SVG의 도형은 다른 요소처럼 선택자로 칠할 수 있다. 색을 직접 적기보다 `currentColor`로 부모의 글자색을 물려받게 하면, 호버·포커스·다크 모드에서 규칙을 따로 쓰지 않아도 된다.

```css
button { color: blue; }
button:is(:hover, :focus-visible) { color: red; }

button svg {
  fill: currentColor;    /* 버튼 글자색을 그대로 쓴다 */
  inline-size: 1em;      /* 글자 크기에 맞춰 커진다 */
  block-size: 1em;
}
```

- 크기를 `em`으로 주면 사용자가 글자를 키울 때 아이콘도 함께 커진다.
- 테마별 색은 커스텀 속성으로 받는다(`stroke: var(--ink)`). 자세한 것은 [[dark-mode-theming|테마와 다크 모드 구현]]에 있다.
- `<img>`나 배경으로 넣은 SVG는 내부를 칠할 수 없다. 색을 바꿔야 하면 인라인으로 넣거나 `mask-image`로 모양만 가져와 `background-color`로 칠한다.

## CSS로 SVG 꾸미고 움직이기

### 프레젠테이션 속성과 캐스케이드

`fill="blue"`, `stroke-width="5"` 같은 SVG 속성은 **프레젠테이션 속성**(presentation attribute)이다. CSS 속성을 정하는 단축 표기라 캐스케이드에 참여하지만, **우선순위가 가장 낮은 작성자 스타일**이다. 외부·문서 스타일시트, `style` 속성이 모두 이긴다.

```html
<circle cx="100" cy="100" r="75" fill="blue" style="fill: deeppink" />  <!-- 분홍이 된다 -->
```

- 그래서 편집기에서 내보낸 아이콘의 `fill`은 CSS 한 줄로 덮을 수 있다. 반대로 CSS로 칠하려는데 안 바뀌면 `style` 속성이 박혀 있는지 본다.
- SVG 2에서는 `cx`·`cy`·`r`·`x`·`y`·`width`·`height`도 CSS 속성이 됐다. 경로 모양 `d`도 CSS 속성이지만 Chrome·Firefox만 지원하고 Safari는 지원하지 않는다.
- 프레젠테이션 속성은 XML 속성이라 대소문자를 구분한다(`fill`, `Fill` 아님).
- 선택자와 `:hover`·`:focus` 같은 의사 클래스는 HTML처럼 쓰지만, `::before`·`::after`는 SVG 요소에 동작하지 않는다.

### transform-origin과 transform-box

SVG 요소에는 박스 모델이 없다. 그래서 회전·확대의 기준점이 HTML과 다르다.

| | HTML 요소 | SVG 요소 |
| --- | --- | --- |
| 기본 기준점 | 요소 중앙(`50% 50%`) | SVG 좌표계의 원점(`0 0`, 캔버스 왼쪽 위) |
| 퍼센트의 기준 | 테두리 상자 | 기본(`transform-box: view-box`)은 `viewBox` |

도형 자기 중심으로 돌리려면 **`transform-box: fill-box`** 로 기준을 도형의 경계 상자로 바꾼다. 모든 주요 브라우저가 지원한다.

```css
.wheel {
  transform-box: fill-box;
  transform-origin: center;
  animation: spin 4s linear infinite;
}
@keyframes spin { to { rotate: 1turn; } }
```

### 선 그리기 효과

`stroke-dasharray`와 `stroke-dashoffset`을 경로 길이만큼 주면 선이 숨고, 오프셋을 0으로 줄이면 선이 그려지는 것처럼 보인다.

```css
path { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 2s ease-out; }
svg:hover path { stroke-dashoffset: 0; }
```

```html
<path pathLength="1" d="…" />  <!-- 길이를 1로 정규화해서 실제 길이를 몰라도 된다 -->
```

`pathLength`를 쓰지 않으면 `path.getTotalLength()`로 실제 길이를 재서 같은 값을 넣는다. 한 경로를 다른 모양으로 바꾸는 **모핑**은 CSS `d` 전환이 Safari에서 안 되므로 GSAP 같은 라이브러리나 SMIL `<animate>`를 쓴다.

### 넣는 방법에 따라 되는 것

| 넣는 방법 | 페이지 CSS로 내부 스타일 | 내부 `<style>`의 CSS 애니메이션 | `:hover` 같은 상호작용 |
| --- | --- | --- | --- |
| `<img>`, CSS `background-image` | 안 된다 | 된다 | 안 된다 |
| `<object>`, `<iframe>` | 안 된다(SVG 파일 안에 스타일을 둬야 한다) | 된다 | 된다 |
| 인라인 `<svg>` | 된다 | 된다 | 된다 |

SMIL 애니메이션은 모든 방법에서 동작한다. 과거에는 `<embed>`로도 넣었지만 플러그인용 태그라 쓰지 않는다. 움직임은 `prefers-reduced-motion`을 따라 줄인다([[color-motion-accessibility|색과 움직임의 접근성]]).

## 정리

- 아이콘은 인터페이스이므로 글자처럼 확대·테마에 반응해야 하고, 그래서 SVG가 맞다.
- 반복되는 아이콘은 `<symbol>` + `<use>`로 한 번만 정의한다.
- 글 옆의 아이콘은 숨기고, 단독 아이콘은 모양이 아니라 뜻으로 이름을 준다.
- 인라인 SVG는 `currentColor`와 `em` 크기로 글자를 따라가게 한다.

관련 노트: [[ui-elements-glossary|UI 요소 용어집: 입력·내비게이션·정보·컨테이너]], [[accessible-images-links-text|대체 텍스트, 링크, 쉬운 글]], [[dark-mode-theming|테마와 다크 모드 구현]], [[image-formats|웹 이미지 형식]], [[icon-usability|아이콘 사용성]], [[css-animation|CSS 애니메이션: transition과 @keyframes]], [[canvas-2d|Canvas 2D API]]

더 읽을거리: 오픈소스 UI 아이콘 세트: [Eva Icons](https://akveo.github.io/eva-icons/#/)
