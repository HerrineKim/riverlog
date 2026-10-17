---
title: "노치와 폴더블 화면 대응: env()와 뷰포트 세그먼트"
concept: "Safe Area & Viewport Segments"
summary: "노치·둥근 모서리·홈 표시줄처럼 화면을 가리는 하드웨어는 viewport-fit=cover와 env(safe-area-inset-*)로 비켜 간다. 두 화면에 걸친 폴더블은 horizontal·vertical-viewport-segments 미디어 기능으로 감지하고 env(viewport-segment-*)로 경첩을 피해 칸을 나눈다. 세그먼트 기능은 아직 실험 단계라 점진적 향상으로만 쓴다."
tags: ["css", "frontend", "responsive", "mobile"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/design/screen-configurations", "https://developer.mozilla.org/en-US/docs/Web/CSS/env", "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/horizontal-viewport-segments"]
---

> web.dev의 「[Learn Responsive Design](https://web.dev/learn/design)」 강좌의 Screen configurations 모듈을 바탕으로, 지원 범위는 MDN으로 확인해 재구성한 노트다.

## 화면은 직사각형 하나가 아니다

반응형 디자인은 「화면 크기를 가정하지 않는다」에서 출발했다. 같은 태도가 화면 모양에도 필요하다.

| 상황 | 문제 | 도구 |
| --- | --- | --- |
| 노치·카메라 구멍·둥근 모서리·홈 표시줄 | 화면 끝까지 그리면 내용이 가려진다 | `viewport-fit=cover` + `env(safe-area-inset-*)` |
| 폴더블의 두 화면에 걸친 브라우저 | 경첩이 내용을 가로지른다 | `*-viewport-segments` 미디어 기능 + `env(viewport-segment-*)` |
| 화면이 없는 기기(음성 비서) | 화면 레이아웃이 의미가 없다 | 시맨틱 HTML([[semantic-html\|시맨틱 HTML과 문서 구조]]) |

## 안전 영역: env(safe-area-inset-*)

`env()`는 **브라우저·기기가 정해 주는 환경 변수**를 읽는 함수다. 커스텀 속성의 `var()`처럼 두 번째 인자로 대체값을 받는다.

먼저 뷰포트 메타 태그에 `viewport-fit=cover`를 더해 페이지가 화면 끝까지 그려지게 한다. 이것이 없으면 브라우저가 알아서 안전 영역 안쪽에만 그리고 inset 값은 0이다.

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

```css
body {
  padding-top: env(safe-area-inset-top, 1em);
  padding-right: env(safe-area-inset-right, 1em);
  padding-bottom: env(safe-area-inset-bottom, 1em);
  padding-left: env(safe-area-inset-left, 1em);
}

/* 하단 고정 바: 원래 여백 + 홈 표시줄 높이 */
.tab-bar {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
}
```

- 배경은 끝까지 깔고, **글과 버튼만** 안전 영역 안으로 들인다.
- 이 변수 이름은 `top`·`left`처럼 물리 방향이다. 하드웨어의 위치를 가리키므로 쓰기 모드와 상관없다. 논리 속성(`padding-inline-start` 등)에 넣을 때는 방향을 맞춰 짝지어야 한다([[logical-properties|쓰기 모드와 논리적 속성]]).
- 계산에 섞을 때는 대체값에 단위를 붙인다(`0px`). `calc()`에서 단위 없는 `0`은 길이로 쓰이지 않는다.

## 폴더블: 뷰포트 세그먼트

브라우저가 접는 기기의 두 화면에 걸쳐 열리면 뷰포트가 **세그먼트(segment)** 여러 개로 나뉜다. 두 미디어 기능이 세그먼트 수를 알려 준다.

| 쿼리 결과 | 경첩 방향 | 배치 |
| --- | --- | --- |
| `horizontal-viewport-segments: 2`, `vertical-viewport-segments: 1` | 위에서 아래로(세로 경첩) | 좌우 두 칸 |
| `vertical-viewport-segments: 2`, `horizontal-viewport-segments: 1` | 왼쪽에서 오른쪽으로(가로 경첩) | 위아래 두 칸 |
| 둘 다 `1` | 한 화면 | 쿼리가 없는 것과 같다 |

경첩의 위치와 크기는 환경 변수가 준다. `env(viewport-segment-width x y)`처럼 세그먼트의 열·행 번호를 함께 쓴다. `viewport-segment-width`, `-height`, `-top`, `-left`, `-bottom`, `-right`가 있다.

```css
@media (min-width: 45em) {
  main { display: flex; }
  main article { flex: 2; }
  main aside   { flex: 1; }
}

/* 세로 경첩: 첫 칸을 왼쪽 화면 폭에 맞춰 경첩을 피한다 */
@media (horizontal-viewport-segments: 2) and (vertical-viewport-segments: 1) {
  main article { flex: 0 0 env(viewport-segment-width 0 0); }
  main aside {
    flex: 1;
    margin-inline-start: calc(env(viewport-segment-left 1 0) - env(viewport-segment-right 0 0));
  }
}
```

두 화면은 기회이기도 하다. 한쪽은 스크롤되는 글, 다른 쪽은 지도·이미지처럼 고정된 요소를 둔다. 목록-상세 화면도 잘 맞는다.

**지원 범위**: 뷰포트 세그먼트 기능은 실험 단계이고 Baseline이 아니다. Chromium 계열 일부에서만 동작하고 이름도 처음 제안된 `spanning`에서 한 번 바뀌었다. 세그먼트가 없으면 평범한 레이아웃이 나오도록 **덧붙이는 규칙으로만** 쓴다([[css-progressive-enhancement|CSS 점진적 향상]]).

## 정리

- 화면 끝까지 그리려면 `viewport-fit=cover`를 켜고, 글과 조작 요소는 `env(safe-area-inset-*)`만큼 안으로 들인다.
- `env()`는 대체값을 받는다. 지원하지 않는 기기에서도 여백이 남게 한다.
- 폴더블은 `*-viewport-segments`로 감지하고 `env(viewport-segment-*)`로 경첩을 피한다. 실험 기능이라 없어도 되는 향상으로만 쓴다.

관련 노트: [[responsive-design|반응형 디자인과 다국어 타이포그래피]], [[media-features|미디어 쿼리 문법과 미디어 기능]], [[devtools-device-emulation|DevTools로 기기·환경 에뮬레이션하기]]
