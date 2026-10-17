---
title: "CSS 배경과 그라디언트"
concept: "CSS Backgrounds"
summary: "모든 박스 뒤에는 배경 레이어가 있다. background-color 위에 이미지·그라디언트를 여러 겹 쌓고, repeat·position·size·attachment·origin·clip으로 각 겹을 조절한다. linear·radial·conic 그라디언트와 반복형, 색 공간을 고르는 보간(in oklch)까지 정리한다."
tags: ["css", "frontend", "design"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/css/backgrounds", "https://web.dev/learn/css/gradients", "https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip"]
---

> web.dev의 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Backgrounds·Gradients 모듈을 바탕으로 재구성한 노트다.

## 배경 레이어

배경은 박스의 내용 **뒤**에 그려지는 층이다. 맨 아래에 `background-color`가 있고, 그 위에 `background-image`로 이미지나 그라디언트를 여러 겹 쌓는다. `background-color`의 초깃값은 `transparent`라 부모의 배경이 비쳐 보인다.

| 속성 | 초깃값 | 하는 일 |
| --- | --- | --- |
| `background-color` | `transparent` | 배경색. 여러 겹 중 **맨 아래 겹에만** 줄 수 있다 |
| `background-image` | `none` | `url()` 이미지나 그라디언트 함수. 쉼표로 여러 개 |
| `background-repeat` | `repeat` | 반복 방식. 두 값이면 가로·세로 순 |
| `background-position` | `0% 0%`(왼쪽 위) | 이미지 위치 |
| `background-size` | `auto` | 이미지 크기. `cover`, `contain`, 길이 |
| `background-attachment` | `scroll` | 스크롤할 때 이미지가 따라 움직이는 기준 |
| `background-origin` | `padding-box` | 위치·크기를 재는 기준 상자 |
| `background-clip` | `border-box` | 배경을 칠하는 범위. 넘는 부분은 잘린다 |

기준 상자(origin)는 패딩 상자지만 칠하는 범위(clip)는 테두리 상자까지라, 점선 테두리 틈으로 배경이 보인다. 테두리 밑으로 배경이 깔리지 않게 하려면 `background-clip: padding-box`를 준다.

### repeat

| 값 | 동작 |
| --- | --- |
| `repeat` | 바둑판처럼 반복하고, 가장자리에서 넘치는 부분은 자른다 |
| `space` | 자르지 않을 만큼만 반복하고, 남는 공간을 이미지 사이에 고르게 나눈다 |
| `round` | 자르지 않도록 이미지를 늘리거나 줄여 개수를 맞춘다 |
| `no-repeat` | 한 번만 그린다 |
| `repeat-x` / `repeat-y` | 한 축만 반복. `repeat-x` = `repeat no-repeat` |

### position

```css
background-position: right bottom;      /* 키워드끼리는 순서 무관 */
background-position: 20% 50%;           /* 숫자는 가로 → 세로 순 */
background-position: left;              /* 한 값만 주면 나머지 축은 50%(가운데) */
background-position: right 30% bottom 20%;  /* 3~4값: 키워드 뒤의 값은 그 가장자리에서 떨어진 거리 */
```

키워드와 숫자를 섞으면 순서가 중요하다. `50% left`처럼 가로 자리에 세로 값을 쓰거나 `left right`처럼 같은 축 키워드를 함께 쓰면 무효다. 값이 세 개 이상이면 모든 길이 앞에 `top`·`right`·`bottom`·`left` 중 하나가 와야 한다.

### size

| 값 | 결과 |
| --- | --- |
| `auto` | 이미지 원래 크기와 비율. 한쪽만 길이를 주면 다른 쪽은 비율대로 |
| `cover` | 영역을 빈틈없이 덮는다. 넘치는 부분은 잘린다 |
| `contain` | 잘리지 않게 영역 안에 다 넣는다. 남는 공간에서 반복될 수 있으니 `no-repeat`와 쓴다 |

### attachment

| 값 | 이미지가 고정되는 기준 |
| --- | --- |
| `scroll` | 요소 자체. 페이지를 스크롤하면 요소와 함께 움직이지만, 요소 안을 스크롤해도 움직이지 않는다 |
| `fixed` | 뷰포트. 패럴랙스처럼 보인다 |
| `local` | 요소의 **내용**. 요소 안을 스크롤하면 배경도 함께 스크롤된다 |

### clip: text

`background-clip: text`는 배경을 글자 모양으로 잘라 그라디언트 글씨를 만든다. 글자색을 투명하게 해야 배경이 보인다. Chrome 120부터 접두어 없이 동작해 모든 주요 브라우저가 지원한다.

```css
.gradient-text {
  background: linear-gradient(90deg, deeppink, orange);
  background-clip: text;
  color: transparent;
}
```

## 여러 겹 배경과 축약형

쉼표로 나열하면 **먼저 쓴 것이 사용자에게 가장 가깝다**(위에 그려진다). 다른 배경 속성도 쉼표로 겹마다 값을 준다.

```css
.hero {
  background:
    url(logo.svg) center / 8rem no-repeat,           /* 맨 위 */
    linear-gradient(to bottom, transparent, rgb(0 0 0 / 60%)),
    url(photo.webp) center / cover no-repeat
    #223;                                             /* 배경색은 마지막 겹에만 */
}
```

- 축약형에서 위치와 크기는 `위치 / 크기`로 슬래시를 사이에 둔다.
- 상자 키워드를 하나만 쓰면 origin과 clip에 함께, 두 개 쓰면 origin → clip 순으로 들어간다.
- **축약형에서 빠뜨린 속성은 초깃값으로 돌아간다.** 앞서 준 `background-size`가 축약형 한 줄로 지워질 수 있다.
- 이미지가 실패해도 글자가 읽히도록 마지막 겹에 배경색을 둔다.

## 그라디언트

그라디언트는 CSS가 만든 **이미지**다. 이미지가 들어가는 곳(`background-image`, `border-image-source`, `mask-image`, `list-style-image`)이면 어디든 쓸 수 있고, 따로 크기를 주지 않으면 영역 크기에 맞춰진다.

| 함수 | 모양 | 주요 인자 |
| --- | --- | --- |
| `linear-gradient()` | 직선 방향 | 각도(`45deg`) 또는 `to right`·`to top left` 같은 방향. 기본은 위→아래 |
| `radial-gradient()` | 중심에서 퍼지는 원·타원 | 모양(`circle`·`ellipse`), 크기(`closest-side`, `closest-corner`, `farthest-side`, `farthest-corner`(기본)), `at 위치` |
| `conic-gradient()` | 중심을 축으로 도는 부채꼴 | `from 각도`(기본 0deg = 위쪽), `at 위치`. 파이 차트에 쓴다 |
| `repeating-*-gradient()` | 위 세 가지의 반복형 | 색 정지점에 **길이를 줘야** 반복된다 |

```css
.a { background: linear-gradient(45deg, darkred 30%, crimson); }   /* 30%까지 darkred, 이후 섞임 */
.b { background: radial-gradient(circle at top left, white, black); }
.pie { background: conic-gradient(tomato 0 40%, gold 0 70%, teal 0); border-radius: 50%; }
.stripes { background: repeating-linear-gradient(45deg, red 0 30px, white 30px 60px); }
```

- 색 정지점(color stop)은 그 색이 놓이는 위치다. 한 색에 위치 두 개(`gold 0 70%`)를 주면 경계가 딱 끊긴다.
- 색 하나만 줘도 유효하지만 단색이 된다.
- 그라디언트는 쉼표로 겹칠 수 있다. 서로 다른 종류를 섞어도 된다.

### 보간 색 공간

그라디언트 중간색은 기본적으로 sRGB에서 섞이고, 보색끼리 섞으면 가운데가 칙칙한 회색이 되기 쉽다. `in <색 공간>`으로 섞는 공간을 고른다.

```css
.vivid { background: linear-gradient(in oklch, deeppink, yellow); }
.long  { background: linear-gradient(in oklch longer hue, deeppink, yellow); }  /* 색상환을 먼 쪽으로 */
```

- `oklab`·`oklch`는 사람 눈에 고르게 섞여 중간이 탁해지지 않는다.
- 색상(hue)이 있는 원통형 공간(`hsl`, `hwb`, `lch`, `oklch`)은 색상환을 어느 쪽으로 돌지 고른다. `shorter`(기본), `longer`, 항상 증가하는 `increasing`, 감소하는 `decreasing`.
- 같은 규칙이 `color-mix(in oklch, …)`에도 적용된다([[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]]).

## 정리

- 배경은 색 한 겹 + 이미지 여러 겹. 먼저 쓴 겹이 위에 온다.
- 위치·크기 기준은 패딩 상자(origin), 칠하는 범위는 테두리 상자(clip)가 기본이다.
- 축약형은 빠진 속성을 초깃값으로 되돌린다.
- 그라디언트는 이미지다. 반복형은 색 정지점에 길이가 있어야 반복된다.
- 선명한 그라디언트가 필요하면 `in oklch`로 보간한다.

관련 노트: [[css-borders-shadows|CSS 테두리와 그림자]], [[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]], [[css-visual-effects|CSS 시각 효과: 필터, 블렌드 모드, 클리핑, 마스킹]], [[box-model|박스 모델과 display]]
