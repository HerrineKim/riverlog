---
title: "브라우저 렌더링 과정"
concept: "Critical Rendering Path"
summary: "HTML을 DOM으로, CSS를 CSSOM으로 파싱하고, 둘을 합친 렌더 트리로 레이아웃(리플로우)과 페인팅을 거쳐 화면을 그린다. 레이아웃·페인팅은 비싸서 자주 일어나면 성능이 떨어진다."
tags: ["frontend", "browser", "dom", "rendering", "performance"]
source: mixed
date: "2026-10-12"
sources: ["https://web.dev/articles/critical-rendering-path", "https://web.dev/articles/howbrowserswork", "https://developer.mozilla.org/ko/docs/Web/Performance/How_browsers_work"]
---

## 한눈에 보기

브라우저가 HTML 문서를 받아 화면에 픽셀을 찍기까지의 단계를 **중요 렌더링 경로(Critical Rendering Path)** 라고 한다.

```text
HTML ──파싱──> DOM ─┐
                    ├──> 렌더 트리 ──> 레이아웃(리플로우) ──> 페인팅
CSS  ──파싱──> CSSOM ┘
```

| 단계 | 입력 | 결과 |
| --- | --- | --- |
| 1. DOM 생성 | HTML 바이트 | 노드 트리(DOM) |
| 2. CSSOM 생성 | CSS | 스타일 규칙 트리(CSSOM) |
| 3. 렌더 트리 생성 | DOM + CSSOM | 화면에 보일 노드와 계산된 스타일 |
| 4. 레이아웃 | 렌더 트리 + 뷰포트 크기 | 각 노드의 위치와 크기 |
| 5. 페인팅 | 레이아웃 결과 | 화면의 픽셀 |

## 1. DOM 생성

HTML은 네 단계를 거쳐 [[dom|DOM]] 트리가 된다.

| 단계 | 하는 일 |
| --- | --- |
| 바이트 → 문자 | 네트워크·디스크에서 받은 원시 바이트를 지정된 인코딩(UTF-8 등)으로 해석한다 |
| 토큰화 | HTML 표준 규칙에 따라 `<html>`, `<head>` 같은 토큰으로 쪼갠다 |
| 객체화 | 토큰을 속성을 가진 노드 객체로 만든다 |
| 트리 구성 | 태그의 포함 관계에 따라 부모-자식 트리로 엮는다 |

### 파서는 틀린 HTML도 고친다

HTML 파서는 문법 오류로 멈추지 않는다. 빠진 태그를 채우고 닫히지 않은 태그를 닫는다.

```html
<!-- 작성한 코드 -->
<body>
<p>Front-end Developer
<span>Zero

<!-- 파서가 만든 구조 -->
<html>
  <head></head>
  <body>
    <p>Front-end Developer <span>Zero</span></p>
  </body>
</html>
```

### 외부 자원과 파싱 차단

| 자원 | 파싱 중 만나면 |
| --- | --- |
| 이미지·CSS 등 | 요청만 보내고 파싱을 계속한다 |
| `<script>` (속성 없음) | **파싱을 멈추고** 스크립트를 받아 실행한 뒤 이어서 파싱한다 |
| `<script async>` / `<script defer>` | 받는 동안 파싱을 계속한다. async는 받는 즉시, defer는 파싱이 끝난 뒤 실행 |

스크립트가 파싱을 막는 이유는 스크립트가 `document.write` 등으로 DOM 자체를 바꿀 수 있기 때문이다.

## 2. CSSOM 생성

파싱 중 발견한 CSS도 비슷한 과정을 거쳐 CSSOM(CSS Object Model)이 된다. DOM 생성과는 **독립적으로** 진행된다.

- 브라우저 기본 스타일(User Agent Stylesheet)과 작성한 CSS를 함께 반영한다.
- 일반적인 규칙(`body`)에서 구체적인 규칙(`body p span`)으로 내려가며 스타일을 덧씌운다. 그래서 트리 구조다.

## 3. 렌더 트리 생성

DOM과 CSSOM을 합쳐 **화면에 실제로 그릴 것만** 담은 렌더 트리를 만든다.

1. DOM 루트부터 노드를 순회한다.
2. 보이지 않는 노드는 뺀다: `<script>`, `<meta>`, `display: none`인 요소 등.
3. 남은 노드마다 [캐스케이드](https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade)로 결정된 스타일을 붙인다.

그래서 **DOM 트리와 렌더 트리는 1:1로 대응하지 않는다.** `visibility: hidden`은 공간을 차지하므로 렌더 트리에 남는다는 점이 `display: none`과 다르다.

## 4. 레이아웃 (리플로우)

렌더 트리에는 스타일만 있고, 뷰포트 안에서 **어디에 얼마나 크게** 놓일지는 아직 없다. 이것을 계산하는 단계가 레이아웃이고, 다시 일어날 때는 리플로우(reflow)라고 부른다.

| 종류 | 언제 | 범위 |
| --- | --- | --- |
| 전역 레이아웃 | 글꼴 크기 등 전역 스타일 변경, 뷰포트 크기 변경 | 렌더 트리 전체를 다시 순회 |
| 증분 레이아웃 | 그 밖의 스타일 변경 | 바뀐 노드만, 비동기로 |

## 5. 페인팅

레이아웃 결과를 바탕으로 노드를 실제 픽셀로 그린다. 페인팅도 전역·증분이 있고, 증분 페인팅은 바뀐 노드만 다시 그린다.

## 리렌더링과 성능

렌더링의 모든 단계는 비용이 들고, 특히 **레이아웃과 페인팅이 자주 일어나면 성능 문제**가 된다.

DOM을 직접 자주 조작하면 리렌더링이 잦아지기 쉽다. React·Vue 같은 라이브러리는 변경을 먼저 **가상 DOM**에 반영하고, 이전 상태와 비교해 실제로 바뀐 부분만 DOM에 적용해 이를 줄인다.

## 정리

- HTML → DOM, CSS → CSSOM, 둘을 합쳐 렌더 트리 → 레이아웃 → 페인팅.
- 속성 없는 `<script>`는 HTML 파싱을 멈춘다. `defer`·`async`로 막지 않게 한다.
- 렌더 트리에는 보이는 노드만 들어가므로 DOM과 1:1이 아니다.
- 위치·크기가 바뀌면 레이아웃부터, 색만 바뀌면 페인팅부터 다시 한다. 레이아웃을 건드리는 변경이 더 비싸다.
- 보충: 브라우저는 보통 여러 DOM 변경을 모아 한 번에 레이아웃한다. 다만 변경 사이에 `offsetHeight` 같은 레이아웃 값을 읽으면 그때마다 강제로 레이아웃이 일어나므로, 읽기와 쓰기를 섞지 않는다.

관련 노트: [[dom|DOM]], [[html|HTML]], [[spa-csr-ssr|SPA와 CSR·SSR]], [[frontend-latency-numbers|프론트엔드 개발자가 알아야 할 지연 시간 숫자]], [[re-rendering|리렌더링 원인 추적하기]]
