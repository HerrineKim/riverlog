---
title: "CSS 시각 효과: 필터, 블렌드 모드, 클리핑, 마스킹"
concept: "CSS Visual Effects"
summary: "그래픽 도구에서 하던 효과를 CSS로 실시간 적용한다. 요소 픽셀을 바꾸는 filter와 뒤 배경만 바꾸는 backdrop-filter, 겹친 층의 색을 섞는 블렌드 모드와 isolation, 도형으로 보이는 영역을 자르는 clip-path, 이미지 픽셀로 투명도를 정하는 mask, 글이 도형을 따라 흐르게 하는 shape-outside까지 정리한다. 같은 이미지 효과를 필터·블렌드·SVG·캔버스로 걸 때의 비용 차이와, 비표준 반사(-webkit-box-reflect)를 마스크로 대신하는 법도 다룬다."
tags: ["css", "frontend", "design", "graphics"]
source: other
date: "2026-10-21"
sources: ["https://web.dev/learn/css/filters", "https://web.dev/learn/css/blend-modes", "https://web.dev/learn/css/paths-shapes-clipping-masking", "https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path", "https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/shape", "https://www.smashingmagazine.com/2016/05/web-image-effects-performance-showdown/", "https://css-tricks.com/state-css-reflections/", "https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-box-reflect"]
---

> web.dev의 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Filters·Blend Modes·Paths, shapes, clipping, and masking 모듈을 바탕으로, 도형 함수 지원 범위는 MDN으로 확인해 재구성한 노트다.
> 반사와 이미지 효과 방법 비교는 「[The State of CSS Reflections](https://css-tricks.com/state-css-reflections/)」와 「[Web Image Effects Performance Showdown](https://www.smashingmagazine.com/2016/05/web-image-effects-performance-showdown/)」을 바탕으로 보강했다.

## 한눈에 보기

| 기법 | 바꾸는 것 | 대표 용도 |
| --- | --- | --- |
| `filter` | 요소 전체(자식 포함)의 픽셀 | 흑백·흐림·밝기, 따낸 이미지의 그림자 |
| `backdrop-filter` | 요소 **뒤에 비치는** 배경만 | 반투명 유리(frosted glass) 패널 |
| `mix-blend-mode` | 요소와 그 아래 층의 색 섞기 | 듀오톤, 흰 배경 이미지를 배경에 녹이기 |
| `background-blend-mode` | 한 요소의 배경 겹끼리 섞기 | 사진 + 단색·그라디언트 합성 |
| `clip-path` | 도형 바깥을 잘라 숨김(완전히 보이거나 안 보이거나) | 원형 아바타, 사선 섹션, 도형 전환 애니메이션 |
| `mask-image` | 이미지·그라디언트 픽셀로 투명도 결정(**반투명 가능**) | 가장자리 페이드, 복잡한 실루엣 |
| `shape-outside` | float 주변 글이 흐르는 경계 | 원형 사진을 둘러싸는 본문 |
| `-webkit-box-reflect` (비표준) | 요소 아래·옆에 비친 상 | 로고·앨범 커버 반사. Firefox 미지원이라 `mask-image`로 대체 |

잘라 내거나 가려도 **박스 자체는 그대로**다. 레이아웃·클릭 영역은 원래 사각형을 기준으로 한다.

## filter

여러 함수를 공백으로 이어 쓰며, 하나라도 잘못 쓰면 **선언 전체가 무효**가 된다.

| 함수 | 인자 | 결과 |
| --- | --- | --- |
| `blur()` | 길이(`%` 불가) | 가우시안 흐림 |
| `brightness()` | 수·`%`, 1(100%)이 원본 | 0이면 검정, 1보다 크면 밝게 |
| `contrast()` | 수·`%` | 대비 |
| `grayscale()` | 0~1 | 흑백. 인자 없으면 완전 흑백 |
| `invert()` | 0~1 | 색 반전 |
| `opacity()` | 0~1 | `opacity` 속성과 같은 효과 |
| `saturate()` | 수·`%` | 채도 |
| `sepia()` | 0~1 | 갈색 톤 |
| `hue-rotate()` | 각도 | 모든 색의 색상을 돌린다 |
| `drop-shadow()` | x y 흐림 색 | 투명하지 않은 픽셀의 윤곽을 따르는 그림자([[css-borders-shadows\|CSS 테두리와 그림자]]) |
| `url()` | SVG `<filter>` 참조 | SVG 필터 적용 |

```css
.thumb:not(:hover) { filter: grayscale(1) brightness(.9); }
.glass {
  background: rgb(255 255 255 / 40%);
  backdrop-filter: blur(12px) saturate(1.4);
}
```

- `backdrop-filter`는 `filter`와 같은 함수를 받는다. 요소의 배경이 반투명해야 효과가 보인다.
- 효과가 지원되지 않아도 글자가 읽히도록 배경색 대비를 먼저 확보한다.
- `filter`와 `backdrop-filter`는 새 쌓임 맥락을 만들고, 조상에 `filter`가 있으면 `position: fixed` 자식의 기준이 바뀐다([[position|CSS position과 z-index]]).

## 블렌드 모드

디자인 도구의 레이어 혼합 모드와 같다. `mix-blend-mode`는 요소(가상 요소 포함)를 아래 층과 섞고, `background-blend-mode`는 한 요소의 여러 배경 겹끼리 섞는다.

| 묶음 | 모드 | 효과 |
| --- | --- | --- |
| 기본 | `normal` | 섞지 않는다 |
| 어둡게 | `multiply` | 투명 필름을 겹친 것처럼. 흰색은 사라지고 검정은 남는다 → 흰 배경 이미지를 배경에 녹일 때 |
| | `darken`, `color-burn` | 채널마다 더 어두운 값 / 대비를 높이며 어둡게 |
| 밝게 | `screen` | `multiply`의 반대. 검정이 사라진다 |
| | `lighten`, `color-dodge` | 채널마다 더 밝은 값 / 밝게 태운다 |
| 대비 | `overlay` | 어두운 곳은 더 어둡게, 밝은 곳은 더 밝게. 50% 회색은 그대로 |
| | `hard-light`, `soft-light` | 위 층 기준의 overlay / 부드러운 overlay |
| 차이 | `difference` | 같은 색은 검정, 다르면 반전. 사진 음화처럼 |
| | `exclusion` | `difference`보다 부드럽다. 같은 색은 50% 회색 |
| 성분(비분리형) | `hue`, `saturation`, `color`, `luminosity` | 위 층의 색상·채도·색·밝기 중 하나를 아래 층의 나머지 성분과 합친다 |

앞의 열두 가지는 R·G·B 채널을 **따로** 계산하는 분리형(separable), 마지막 네 가지는 색 성분을 함께 다루는 비분리형(non-separable)이다.

```css
/* 듀오톤: 흑백 사진 위에 가상 요소 두 장을 섞는다 */
.duotone { position: relative; isolation: isolate; }
.duotone img { filter: grayscale(1) contrast(1.2); }
.duotone::before { content: ""; position: absolute; inset: 0; background: #1d3557; mix-blend-mode: lighten; }
.duotone::after  { content: ""; position: absolute; inset: 0; background: #e63946; mix-blend-mode: multiply; }
```

`isolation: isolate`는 새 쌓임 맥락을 만들어 그 안의 요소가 바깥 배경과 섞이지 않게 한다. 안쪽 요소끼리는 계속 섞인다. 배경 겹은 이미 격리돼 있어 `background-blend-mode`에는 영향이 없다.

## 이미지 효과를 거는 방법과 비용

흑백 같은 이미지 효과는 여러 방법으로 걸 수 있다. 필터는 레이아웃과 첫 페인트 **뒤에** 렌즈처럼 덧씌워진다.

| 방법 | 예 | 성격 |
| --- | --- | --- |
| CSS `filter` | `filter: grayscale(1)` | 가장 간단하고 빠른 편. 상호작용(호버 시 해제)과 전환을 쉽게 붙인다 |
| CSS 블렌드 모드 | 이미지 + 회색 배경에 `background-blend-mode: luminosity` | 필터와 비슷한 속도. 여러 층을 섞는 복합 효과에 |
| SVG 필터 | `filter: url(#gray)` + `<feColorMatrix>` | 채널 단위 조작이 가능해 표현력이 크다. 속도는 CSS보다 조금 느리다 |
| `<canvas>` | `getImageData`로 픽셀마다 계산 | 가장 느리다. 픽셀마다 JS가 돌고, 다른 출처 이미지는 CORS 설정이 필요하다 |
| 미리 편집 | 이미지 자체를 흑백으로 저장 | 런타임 비용이 없다. 효과를 바꿀 수 없다 |

바뀌지 않는 효과는 이미지 자체에 굽고, 상호작용이 필요한 효과만 CSS로 건다. 많은 이미지에 무거운 `blur()`를 걸고 애니메이션하면 프레임마다 다시 그려 느려진다.

## 도형과 clip-path

`clip-path`는 도형 안쪽만 보이게 한다. 경계에서 완전히 보이거나 완전히 안 보인다.

| 도형 함수 | 정의 방법 | 크기 반응 |
| --- | --- | --- |
| `circle(반지름 at 위치)` | 반지름 하나. `50%`면 요소에 꽉 차는 원 | 반응형 |
| `ellipse(가로 세로 at 위치)` | 반지름 둘 | 반응형 |
| `inset(위 오 아래 왼 round 반경)` | 각 변에서 **안쪽으로 들어온 거리**. 요소와 함께 늘고 준다 | 반응형 |
| `rect(위 오 아래 왼 round 반경)` | 위·아래는 위쪽 가장자리, 왼·오는 왼쪽 가장자리에서 잰 위치 | 고정 크기 사각형에 맞다 |
| `polygon(채움규칙?, x y, …)` | 점 목록. 마지막 점은 첫 점과 자동으로 이어진다. 겹친 부분은 `nonzero`(기본, 채움) 또는 `evenodd`(번갈아 비움) | 반응형(`%` 사용 시) |
| `path("SVG 경로")` | SVG 경로 문법. 값은 **모두 px** | 반응형이 아니다 |
| `shape(from …, line to …, curve to …)` | CSS 명령 문법. `%`·`cqi` 같은 단위를 쓸 수 있다 | 반응형. 2026년 Firefox 148 지원으로 모든 주요 브라우저(Baseline 2026) |

```css
.avatar { clip-path: circle(50%); }
.section-slant { clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); }
.cut { clip-path: inset(10px 20px round 12px); }
.logo { clip-path: url(#logo-clip); }       /* SVG <clipPath> 참조. 외부 파일이면 url(shapes.svg#logo-clip) */
```

- 도형을 재는 기준 상자는 기본 `border-box`다. `clip-path: inset(10px) padding-box`처럼 `padding-box`, `content-box`, `margin-box`로 바꿀 수 있다.
- `clip-path`는 도형 **하나**만 받는다. 떨어진 여러 도형은 `path()`·`shape()`의 복합 경로, SVG `<clipPath>`, 또는 마스크로 만든다.
- 잘라도 안의 글은 도형을 따라 다시 흐르지 않는다.

### 도형 애니메이션

- `clip-path`는 애니메이션할 수 있다. **같은 도형 함수**를 써야 하고, `polygon()`·`shape()`는 **점 개수가 같아야** 부드럽게 바뀐다.
- `offset-path`에 같은 도형이나 `ray(각도)`를 주고 `offset-distance`를 0%→100%로 움직이면 요소가 경로를 따라 이동한다.

## 마스킹

마스크는 이미지·그라디언트·SVG `<mask>`의 **픽셀**로 보이는 정도를 정한다. 반투명이 가능하다는 점이 `clip-path`와 다르다.

```css
.fade-bottom { mask-image: linear-gradient(black 70%, transparent); }   /* 아래로 갈수록 사라짐 */
.multi {
  mask: url(star.svg) center / 40% no-repeat luminance,
        linear-gradient(90deg, black, transparent) alpha;
}
```

| 속성 | 초깃값 | 뜻 |
| --- | --- | --- |
| `mask-image` | `none` | 마스크 이미지들. 쉼표로 여러 장, 기본으로 **더해진다** |
| `mask-mode` | `match-source` | `alpha`(투명도만 봄) / `luminance`(밝을수록 보이고 어두울수록 숨김). 이미지·그라디언트는 alpha, SVG `<mask>`는 luminance가 기본 |
| `mask-composite` | `add` | 여러 마스크를 합치는 방식(`subtract`, `intersect`, `exclude`) |
| `mask-position`, `mask-size`, `mask-repeat` | | `background-*`와 같은 문법 |
| `mask-origin`, `mask-clip` | `border-box` | 기준 상자·적용 범위 |

값 목록이 마스크 개수보다 짧으면 반복해 채우고, 길면 남는 값은 버린다. 축약형 `mask`는 순서대로 image, mode, position / size, repeat, origin, clip, composite를 받고, 빠진 값은 초깃값으로 돌아간다.

### 마스크로 만드는 반사

요소 아래에 거울에 비친 듯한 상을 붙이는 표준 속성은 없다. `-webkit-box-reflect`는 Chromium·Safari만 지원하는 비표준 속성이고 Firefox는 지원하지 않는다.

```css
.logo { -webkit-box-reflect: below 4px linear-gradient(transparent 60%, rgb(0 0 0 / .3)); }
```

모든 브라우저에서 같게 보여야 하면 위의 마스크를 쓴다. 가상 요소에 같은 이미지를 배경으로 넣고 `scale: 1 -1`로 뒤집은 뒤 `mask-image` 그라디언트로 아래쪽을 흐리게 한다. 내용이 바뀌는 요소라면 반사를 포기하는 편이 낫다.

## shape-outside: 글이 도형을 따라 흐르게

`clip-path`로 원형을 만들어도 float 주변 글은 원래 사각형을 피해 흐른다. `shape-outside`로 흐름 경계를 따로 준다.

```css
.portrait {
  float: inline-start;
  width: 12rem; aspect-ratio: 1;
  clip-path: circle(50%);
  shape-outside: circle(50%);
  shape-margin: 1rem;
}
```

- 기본 도형 함수와 이미지·그라디언트를 받는다. 이미지일 때는 `shape-image-threshold`로 어느 투명도부터 도형 안으로 볼지 정한다.
- `path()`, `shape()`, SVG `<clipPath>`는 받지 않는다.
- float된 요소에만 효과가 있다.

## 정리

- 요소 전체는 `filter`, 뒤 배경만은 `backdrop-filter`.
- 색을 섞으면 블렌드 모드, 섞임을 가두려면 `isolation: isolate`.
- 딱 떨어지는 모양이면 `clip-path`, 반투명 경계면 `mask`.
- 반응형 복잡 도형은 `path()` 대신 `shape()`.
- 잘라도 박스와 흐름은 그대로다. 글이 도형을 따르게 하려면 `shape-outside`.
- 바뀌지 않는 이미지 효과는 이미지에 굽고, 상호작용이 필요한 것만 CSS로 건다. 캔버스 픽셀 처리가 가장 느리다.

관련 노트: [[css-borders-shadows|CSS 테두리와 그림자]], [[css-backgrounds-gradients|CSS 배경과 그라디언트]], [[css-functions|CSS 함수: calc()·clamp()와 수학 함수]], [[position|CSS position과 z-index]]
