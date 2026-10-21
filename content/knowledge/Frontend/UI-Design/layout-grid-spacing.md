---
title: "레이아웃 그리드와 간격 체계: 12단 그리드, 8pt 그리드, 수직 리듬"
concept: "Layout Grid"
summary: "화면에 질서를 주는 세 가지 수치 체계. 단위·거터·칼럼·필드로 이뤄진 칼럼 그리드와 3·4·6단으로 나뉘는 12단 그리드, 모든 크기·간격을 8의 배수로 맞추는 8pt 그리드(하드·소프트 방식, 4pt 기준선), 본문 줄 높이를 기준으로 세로 간격을 맞추는 수직 리듬과 모듈러 스케일을 정리하고, CSS Grid·rlh·text-box-trim·디자인 토큰으로 구현하는 법을 붙였다."
tags: ["design", "layout", "typography", "design-system", "css"]
source: other
date: "2026-10-21"
sources: ["https://webdesign.tutsplus.com/articles/a-comprehensive-introduction-to-grids-in-web-design--cms-26521", "https://spec.fm/specifics/8-pt-grid", "https://zellwk.com/blog/why-vertical-rhythms/", "https://alistapart.com/article/more-meaningful-typography", "https://developer.mozilla.org/en-US/docs/Web/CSS/length#rlh", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/CSS/Grid%20System.md"]
---

> 「[A Comprehensive Introduction to Grids in Web Design](https://webdesign.tutsplus.com/articles/a-comprehensive-introduction-to-grids-in-web-design--cms-26521)」, 「[The 8-Point Grid](https://spec.fm/specifics/8-pt-grid)」, 「[Why is Vertical Rhythm an Important Typography Practice?](https://zellwk.com/blog/why-vertical-rhythms/)」, 「[More Meaningful Typography](https://alistapart.com/article/more-meaningful-typography)」, 「[Frontend_TIL: Grid System](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/CSS/Grid%20System.md)」을 바탕으로, CSS 구현은 MDN 문서로 확인해 재구성한 노트다.

## 왜 수치 체계를 쓰나

그리드와 간격 체계는 화면 요소를 보이지 않는 선과 정해진 수에 맞추는 규칙이다. 감으로 배치하면 화면이 늘어날수록 어긋남이 쌓이지만, 규칙이 있으면 **적은 노력으로 정렬과 일관성**이 생기고 선택지가 줄어 결정이 빨라진다. 잘된 정렬은 사용자 눈에 띄지 않는다.

| 체계 | 맞추는 축 | 무엇을 정하나 |
| --- | --- | --- |
| 칼럼 그리드 | 가로 | 콘텐츠 블록의 너비와 배치 |
| 8pt 그리드 | 가로·세로 | 모든 크기·여백의 단위 |
| 수직 리듬·기준선 그리드 | 세로 | 글줄과 블록 사이 간격 |
| 모듈러 스케일 | 크기 비율 | 글자 크기 단계 |

## 칼럼 그리드

| 용어 | 뜻 |
| --- | --- |
| 단위(unit) | 그리드를 이루는 가장 작은 세로 띠 |
| 거터(gutter) | 단위 사이 빈 공간. 작은 여백으로 숨 쉴 틈을 준다 |
| 칼럼(column) | 단위 여러 개와 거터를 묶은 콘텐츠 그릇 |
| 필드(field) | 칼럼들이 만드는 가로 띠. 높이를 맞추면 페이지가 정돈된다 |

![칼럼 그리드의 칼럼·거터·여백](https://raw.githubusercontent.com/AI-Dev-Lex-Kim/Frontend_TIL/master/Images/Grid%20System/Grid%20System-2.png)

### 12단 그리드

12는 2·3·4·6으로 나뉜다. 그래서 한 그리드 위에서 여러 배치를 섞을 수 있다.

| 배치 | 칼럼당 단위 | 성격 |
| --- | --- | --- |
| 4칼럼 | 3 | 단순하고 균형 잡혔지만 대칭이라 단조로울 수 있다 |
| 3칼럼 | 4 | 비대칭으로 쓰면 역동적이다. 균형을 더 신경 써야 한다 |
| 6칼럼 | 2 | 선택지가 많고 조합이 복잡하다 |
| 혼합 | — | 위 블록을 한 페이지에 섞는다. 12단의 가장 큰 장점 |

**강조하려면 그리드를 깬다.** 영상이나 대표 이미지를 칼럼 밖으로 꺼내면 시선이 모인다. 다만 이유 없이 깨면 그냥 어긋나 보인다. 삼분할 법칙이나 황금비는 참고 정도로 쓴다. 지각은 사람마다 달라 "마법의 비율"이 있다는 근거는 약하다.

CSS로는 칼럼 그리드를 그대로 선언한다. float로 칸 너비를 계산하던 그리드 프레임워크는 필요 없다([[css-grid|CSS 그리드 레이아웃]]).

```css
.page {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: var(--gutter, 1.5rem);
}
.main    { grid-column: span 8; }
.sidebar { grid-column: span 4; }
```

반응형 그리드에서 칼럼 수는 화면 너비에 따라 바뀐다. Material Design의 반응형 레이아웃 그리드는 좁은 화면 4칼럼, 중간 8칼럼, 넓은 화면 12칼럼을 쓴다. 웹 레이아웃이 인쇄와 어떻게 다른지는 [[web-layout-design|웹 레이아웃 디자인]]에 있다. 고정폭 시절에는 960px을 12칸이나 16칸으로 나눈 960 Grid System 같은 float 기반 프레임워크를 썼다.

## 8pt 그리드

**모든 요소의 크기·패딩·마진을 8의 배수로** 정한다. Material Design 같은 플랫폼 지침도 4·8 단위를 쓴다.

- **결정이 줄어든다.** 8개 중 7개의 선택지를 없애므로 1~2px을 만지작거리는 시간이 사라진다.
- **화면 크기와 맞는다.** 흔한 화면 크기는 대부분 한 축 이상이 8로 나뉜다. 375pt처럼 안 나뉘는 폭은 여백을 일정하게 두고 요소 크기를 늘리고 줄여 채운다. 요소 크기가 8의 배수가 아니어도 여백 체계가 일관되면 된다.
- **배율과 맞는다.** 디자인을 @1x(1pt = 1px)로 하면 @2x·@3x 자산을 깨끗하게 뽑는다. 1pt는 @2x에서 2×2px이다.

### 하드 그리드와 소프트 그리드

| 방식 | 하는 일 | 장점 | 단점 |
| --- | --- | --- | --- |
| 하드 그리드 | 투명 배경 박스로 요소를 감싸 8pt 격자에 벽돌처럼 붙인다 | 요소별 여백을 추적하기 쉽다 | 디자인 파일이 무겁다. 코드에는 그 격자가 없다 |
| 소프트 그리드 | 요소 **사이 간격**만 8의 배수로 잰다 | 빠르고 코드 구조(박스 모델)와 같다 | 정렬을 눈으로 더 챙겨야 한다 |

### 글자는 4pt 기준선

글자 크기와 줄 높이는 8에 딱 맞지 않는 경우가 많다. 그래서 **8pt UI 그리드에 4pt 기준선 그리드**를 겹쳐, 글줄의 기준선을 4의 배수 위치에 둔다. 글자만 담는 블록(버튼)은 글자 크기를 정한 뒤 **패딩으로 높이를 만든다.**

### 코드에서

간격 체계는 디자인 토큰으로 옮긴다([[design-system#디자인 토큰|디자인 토큰]]).

```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 1rem;     /* 16px */
  --space-4: 1.5rem;   /* 24px */
  --space-5: 2rem;     /* 32px */
}
```

간격을 `px`이 아닌 `rem`으로 두면 사용자가 글자 크기를 키울 때 간격도 함께 커진다. Tailwind CSS는 `--spacing: 0.25rem`(4px) 하나에 배수를 곱해 같은 체계를 만든다([[utility-first-css|유틸리티 우선 CSS]]).

## 수직 리듬

**수직 리듬(vertical rhythm)** 은 세로 간격을 하나의 기준값의 배수로 맞추는 것이다. 기준은 본문의 줄 높이다. 본문 `line-height`가 24px이면 규칙은 둘이다.

1. 모든 글 요소의 `line-height`를 24px의 배수로 한다.
2. 요소 사이 세로 여백을 24px의 배수로 한다.

```css
h1 { line-height: 48px; margin-block: 24px; }
p  { line-height: 24px; margin-block: 24px; }
```

이렇게만 해도 페이지가 차분하고 정돈돼 보인다. 이유는 디자인 원칙 중 **반복(repetition)** 이다. 같은 간격이 되풀이되면 요소들이 한 계획 아래 놓였다는 느낌을 준다. 웹의 기준선 그리드는 인쇄와 달리 글자 기준선이 아니라 줄 상자 단위로 맞는다. 줄 상자의 구조는 [[line-height-vertical-align|line-height와 vertical-align]]에 있다.

### 지금의 CSS로

과거에는 Sass 함수나 계산 도구로 글자 크기마다 줄 높이·여백을 px로 뽑았다. 지금은 줄 높이 단위와 글자 위아래 여백 깎기가 CSS에 있다.

```css
:root { line-height: 1.5; }
h2   { font-size: 1.75rem; line-height: 2rlh; margin-block: 1rlh; }   /* 루트 줄 높이의 배수 */
.icon { block-size: 1lh; }                                           /* 이 요소의 한 줄 높이 */
h1, p { text-box: trim-both cap alphabetic; }                        /* 글꼴 위아래 여유 깎기 */
```

| 도구 | 쓰임 | 지원 |
| --- | --- | --- |
| `lh`, `rlh` | 요소·루트의 줄 높이를 단위로 쓴다. 리듬을 계산 없이 표현한다 | 모든 주요 브라우저(Baseline 2023) |
| `text-box-trim` / `text-box` | 글꼴 지표의 위아래 여유를 잘라 시각적 여백을 기준선에 맞춘다 | Chrome 133, Safari 18.2, Firefox 154 |

## 모듈러 스케일

**모듈러 스케일(modular scale)** 은 한 비율로 곱하고 나눠 얻은 수열이다. 기준 글자 크기 16과 비율 1.25(장3도)면 16, 20, 25, 31.25…가 된다. 글자 크기 단계, 여백, 칼럼 너비를 이 수열에서 고르면 임의의 수보다 조화로운 관계가 생긴다.

| 비율 | 이름 | 느낌 |
| --- | --- | --- |
| 1.125 | 장2도 | 단계 차이가 작다. 정보가 많은 UI |
| 1.25 | 장3도 | 무난한 기본값 |
| 1.333 | 완전4도 | 제목이 또렷하다 |
| 1.618 | 황금비 | 차이가 크다. 짧은 글·랜딩 페이지 |

- **기준은 글에서 시작한다.** 본문 글꼴이 가장 또렷한 크기를 첫 수로 잡는다.
- 기준 수를 둘 쓰는 **이중 스케일**(예: 본문 크기 18, 광고 영역 너비 190)은 정해진 요소의 크기까지 체계에 넣을 때 쓴다.
- 스케일과 비율은 CSS 주석에 남겨, 다른 사람이 수치의 출처를 재현할 수 있게 한다.

```css
:root {
  --ratio: 1.25;
  --step-0: 1rem;
  --step-1: calc(var(--step-0) * var(--ratio));
  --step-2: calc(var(--step-1) * var(--ratio));
}
```

화면 크기마다 비율을 바꾸는 유동 스케일은 `clamp()`로 만든다([[css-functions|CSS 함수]]). 글자 크기·줄 높이·글줄 길이의 균형은 [[web-typography|웹 타이포그래피]]에 있다.

## 정리

- 칼럼 그리드는 가로, 8pt 그리드는 모든 크기, 수직 리듬은 세로, 모듈러 스케일은 크기 비율을 맞춘다.
- 12단 그리드는 3·4·6칼럼을 한 페이지에 섞을 수 있어 기본으로 좋다. 강조할 때만 그리드를 깬다.
- 8pt UI 그리드에 4pt 기준선을 겹치고, 글자 블록은 패딩으로 높이를 만든다.
- 체계는 디자인 토큰(간격·글자 단계)으로 코드에 옮기고, 세로 리듬은 `rlh`·`text-box-trim`으로 표현한다.

관련 노트: [[web-layout-design|웹 레이아웃 디자인: 인쇄와 다른 매체]], [[css-grid|CSS 그리드 레이아웃]], [[web-typography|웹 타이포그래피: 가독성, 글줄 길이, 웹폰트]], [[design-system|디자인 시스템: 구성, 도입, 구축과 배포]], [[visual-design-tips|개발자를 위한 시각 디자인 요령]]
