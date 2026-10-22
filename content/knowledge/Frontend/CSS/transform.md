---
title: "transform: 이동·회전·확대·기울이기"
concept: "CSS Transform"
summary: "요소를 문서 흐름에 영향 없이 이동·확대·회전·기울이는 transform 함수들과, top·left 50%에 translate(-50%, -50%)를 더하는 가운데 정렬 패턴."
tags: ["css", "layout", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/233", "https://developer.mozilla.org/en-US/docs/Web/CSS/translate", "https://web.dev/learn/css/functions"]
---

> riverkim.kr에 쓴 글을 다시 정리하고, 3D 변형은 web.dev 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Functions 모듈로 보강한 노트다.

## transform이란

`transform`은 요소에 **이동(translate), 확대·축소(scale), 회전(rotate), 기울이기(skew)** 를 적용하는 속성이다. 요소가 차지하는 원래 자리는 그대로 두고 **그려지는 모습만** 바꾸므로 주변 요소의 배치에 영향을 주지 않는다. `transition`이나 `animation`과 함께 쓰면 움직임이 되고, 단독으로 쓰면 바로 적용된 상태로 렌더링된다.

## transform 함수

| 함수 | 설명 | 값 |
| --- | --- | --- |
| `translate(x, y)` | X축으로 x, Y축으로 y만큼 이동 | px, %, em 등 |
| `translateX(n)` / `translateY(n)` | 한 축으로만 이동 | px, %, em 등 |
| `scale(x, y)` | X축 x배, Y축 y배 확대·축소 | 0과 양수 |
| `scaleX(n)` / `scaleY(n)` | 한 축으로만 확대·축소 | 0과 양수 |
| `rotate(angle)` | angle만큼 회전 | ±deg |
| `skew(x-angle, y-angle)` | X축·Y축으로 기울임 | ±deg |
| `skewX(angle)` / `skewY(angle)` | 한 축으로만 기울임 | ±deg |

여러 함수를 공백으로 이어 쓸 수 있고, 적힌 순서대로 적용된다.

```css
.card:hover {
  transform: translateY(-4px) scale(1.02);
}
```

`translate`의 `%`는 부모가 아니라 **요소 자기 크기** 기준이다. 아래 가운데 정렬이 동작하는 이유다.

### 개별 변형 속성

`translate`, `rotate`, `scale`은 `transform` 함수일 뿐 아니라 **독립된 CSS 속성**이기도 하다. 모든 주요 브라우저가 2022년부터 지원한다.

```css
.card { translate: 0 0; scale: 1; transition: translate .2s, scale .2s; }
.card:hover { translate: 0 -4px; }        /* scale은 그대로 둔 채 이동만 바꾼다 */
.card:active { scale: .98; }
```

`transform` 한 줄에 함수를 몰아 쓰면 호버에서 이동만 바꾸려 해도 확대 값까지 다시 적어야 한다. 개별 속성은 서로 덮어쓰지 않아 상태별로 따로 바꾸기 쉽다. 적용 순서는 작성 순서와 상관없이 항상 `translate` → `rotate` → `scale` → `transform`이다.

### 3D 변형과 원근

| 함수·속성 | 하는 일 |
| --- | --- |
| `rotateX()`, `rotateY()`, `rotateZ()` | 한 축을 중심으로 회전. `rotate()`는 `rotateZ()`와 같다 |
| `rotate3d(x, y, z, 각도)` | 벡터 (x, y, z)를 축으로 회전 |
| `translateZ()`, `translate3d()` | 화면 앞뒤(Z축)로 이동 |
| `scaleZ()`, `scale3d()` | Z축 배율 |
| `perspective` 속성 / `perspective()` 함수 | 보는 사람과 Z=0 평면 사이의 거리. 작을수록 원근이 강하다. 속성은 **자식**에, 함수는 그 요소에 적용된다 |
| `perspective-origin` | 소실점 위치 |
| `transform-style: preserve-3d` | 자식도 같은 3D 공간에 놓는다(카드 뒤집기) |
| `backface-visibility: hidden` | 뒤집혔을 때 뒷면을 숨긴다 |

```css
.scene { perspective: 800px; }
.card  { transform-style: preserve-3d; transition: rotate .6s; }
.card.flipped { rotate: y 180deg; }
.card :is(.front, .back) { backface-visibility: hidden; }
.card .back { rotate: y 180deg; }   /* 앞뒤 면을 같은 칸에 겹쳐 둔다 */
```

`transform`·`opacity`만 바꾸면 합성만 다시 돌아 부드럽다([[browser-rendering#변경이 다시 도는 단계|변경이 다시 도는 단계]]). `transform`이 있는 요소는 새 쌓임 맥락을 만들고, 그 안의 `position: fixed` 자식의 기준이 된다([[position|CSS position과 z-index]]).

## 가운데 정렬 패턴

### 증상

팝업을 화면 가운데 두려고 `top: 50%; left: 50%`만 주면 몇십 픽셀 어긋난다. 위치가 요소의 **왼쪽 위 모서리** 기준으로 계산되기 때문이다. 모서리가 화면 중앙에 오고, 요소는 오른쪽 아래로 치우친다.

### 해결

자기 너비·높이의 절반만큼 되돌린다.

```css
.pop-up {
  position: fixed;   /* 뷰포트 기준 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
}
```

```text
top/left 50%만        translate(-50%, -50%) 추가
┌──────────────┐      ┌──────────────┐
│              │      │              │
│       ┌───┐  │      │     ┌───┐    │
│       │   │  │      │     │ ● │    │
│       └───┘  │      │     └───┘    │
└──────────────┘      └──────────────┘
 모서리가 중앙          요소의 중심이 중앙
```

요소 크기를 몰라도 동작한다는 점이 장점이다. 부모 안에서 가운데 두려면 `position: absolute`와 부모의 `position: relative`를 쓴다([[position|position]]).

지금은 변형 없이 가운데 정렬하는 방법이 더 간단하다.

| 상황 | 방법 |
| --- | --- |
| 일반 레이아웃 안 | 부모에 `display: grid; place-items: center` 또는 Flexbox(`justify-content`·`align-items: center`) |
| 고정·절대 위치 팝업 | `position: fixed; inset: 0; margin: auto; width: fit-content; height: fit-content` |
| 모달 대화 상자 | `<dialog>`의 `showModal()`. 브라우저가 화면 가운데·최상위 레이어에 띄운다 |

## 정리

- `transform`은 자리는 그대로, 보이는 모습만 바꾼다.
- `translate`의 `%`는 자기 크기 기준이다.
- 크기를 모르는 팝업의 정중앙 배치: `top·left: 50%` + `translate(-50%, -50%)`. 그리드 `place-items: center`, `inset: 0; margin: auto`, `<dialog>`도 같은 일을 한다.
- 상태마다 따로 바꿀 값은 `translate`·`rotate`·`scale` 개별 속성으로 쓴다.

## 참고 자료

- [CSS3 Transform (PoiemaWeb)](https://poiemaweb.com/css3-transform)

관련 노트: [[position|position]], [[flexbox|Float와 Flexbox]], [[css-animation|CSS 애니메이션: transition과 @keyframes]], [[css-functions|CSS 함수: calc()·clamp()와 수학 함수]]
