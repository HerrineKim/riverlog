---
title: "transform: 이동·회전·확대·기울이기"
concept: "CSS Transform"
summary: "요소를 문서 흐름에 영향 없이 이동·확대·회전·기울이는 transform 함수들과, top·left 50%에 translate(-50%, -50%)를 더하는 가운데 정렬 패턴."
tags: ["css", "layout", "frontend"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/233"]
---

> riverkim.kr에 쓴 글을 다시 정리한 노트입니다.

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

요소 크기를 몰라도 동작한다는 점이 장점이다. 부모 안에서 가운데 두려면 `position: absolute`와 부모의 `position: relative`를 쓴다([[position|position]]). 일반 레이아웃 안의 가운데 정렬은 Flexbox(`justify-content`·`align-items: center`)가 더 간단하다.

## 정리

- `transform`은 자리는 그대로, 보이는 모습만 바꾼다.
- `translate`의 `%`는 자기 크기 기준이다.
- 크기를 모르는 팝업의 정중앙 배치: `top·left: 50%` + `translate(-50%, -50%)`.

## 참고 자료

- [CSS3 Transform — PoiemaWeb](https://poiemaweb.com/css3-transform)

관련 노트: [[position|position]], [[flexbox|Float와 Flexbox]]
