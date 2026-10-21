---
title: "Intersection Observer와 관찰자 API"
concept: "Intersection Observer"
summary: "스크롤 이벤트로 위치를 계산하는 대신, 요소가 화면(또는 스크롤 영역)에 얼마나 보이는지 브라우저가 알려 주는 IntersectionObserver. root·rootMargin·threshold 옵션, 무한 스크롤·지연 로딩·끝까지 읽음 감지 패턴, 크기 변화를 보는 ResizeObserver와 DOM 변화를 보는 MutationObserver를 정리한다."
tags: ["browser", "web", "performance", "dom", "javascript"]
source: other
date: "2026-10-21"
sources: ["https://wesbos.com/javascript/06-serious-practice-exercises/scroll-events-and-intersection-observer", "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API", "https://developers.google.com/web/updates/2016/04/intersectionobserver", "https://developers.google.com/web/updates/2016/10/resizeobserver", "https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver", "https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver", "https://web.dev/learn/performance/lazy-load-images-and-iframe-elements"]
---

> Wes Bos의 「[Beginner JavaScript](https://wesbos.com/javascript)」 강의 노트를 바탕으로, API 세부는 MDN으로 확인해 재구성한 노트다. 「[IntersectionObserver's coming into view](https://web.dev/articles/intersectionobserver)」, 「[ResizeObserver: it's like document.onresize for elements](https://web.dev/articles/resize-observer)」로 콜백 성질·iframe·ResizeObserver 세부를 보강했다.

## 왜 스크롤 이벤트 대신인가

"이 요소가 화면에 들어왔나"를 스크롤 이벤트로 알아내려면 `scroll`마다 `scrollTop`·`scrollHeight`나 `getBoundingClientRect()`를 읽어 계산해야 한다.

| 문제 | 이유 |
| --- | --- |
| 너무 자주 실행된다 | `scroll`은 프레임마다 여러 번 일어날 수 있다. 그래서 [[debounce-throttle\|쓰로틀]]을 덧대야 한다 |
| 레이아웃을 강제한다 | 위치·크기를 읽으면 브라우저가 레이아웃을 바로 계산해야 한다([[browser-rendering\|강제 동기 레이아웃]]) |
| 계산이 깨지기 쉽다 | 화면 크기, 중첩된 스크롤 영역, 요소 높이에 따라 공식이 달라진다 |

**IntersectionObserver**는 질문을 바꾼다. "얼마나 스크롤했나"가 아니라 **"이 요소가 기준 영역과 얼마나 겹치나"** 를 브라우저가 계산해, 기준을 넘을 때만 콜백을 부른다. 겹침은 브라우저가 렌더링 과정에서 비동기로 계산하므로, 스크롤할 때마다 내 코드가 돌거나 레이아웃을 강제하지 않는다. 모든 주요 브라우저가 지원한다.

## 사용법

관찰자는 **만들기 → 관찰 대상 등록 → 콜백에서 처리** 순서로 쓴다. 클릭 리스너와 달리 관찰자는 만들기만 해서는 아무 일도 하지 않는다. `observe()`로 대상을 알려 줘야 한다.

```javascript
const observer = new IntersectionObserver((entries, observer) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue
    entry.target.classList.add('visible')
    observer.unobserve(entry.target) // 한 번만 필요하면 관찰을 끝낸다
  }
}, { root: null, rootMargin: '0px 0px 200px 0px', threshold: 0.5 })

document.querySelectorAll('.card').forEach((card) => observer.observe(card))
```

| 옵션 | 의미 | 기본값 |
| --- | --- | --- |
| `root` | 겹침을 재는 기준 영역. 스크롤되는 상자 요소를 줄 수 있다 | `null` = 브라우저 뷰포트 |
| `rootMargin` | 기준 영역을 CSS margin처럼 넓히거나 줄인다. 양수면 **화면에 닿기 전에 미리** 알린다 | `'0px'` |
| `threshold` | 콜백을 부를 보이는 비율. 숫자 하나 또는 배열(`[0, 0.5, 1]`) | `0` = 1px이라도 보이면 |

콜백은 `IntersectionObserverEntry` 배열을 받는다. 처음 `observe()`할 때도 현재 상태를 알리려고 한 번 호출된다.

| 속성 | 내용 |
| --- | --- |
| `isIntersecting` | 지금 기준 영역과 겹치는가 |
| `intersectionRatio` | 요소가 보이는 비율(0~1) |
| `target` | 관찰 중인 요소 |
| `boundingClientRect`, `rootBounds` | 요소와 기준 영역의 사각형. 레이아웃을 다시 강제하지 않고 위치를 얻는다 |

관찰을 끝낼 때는 `unobserve(el)`(하나) 또는 `disconnect()`(전부)를 부른다. 컴포넌트가 사라질 때 `disconnect()`하지 않으면 관찰자가 남는다.

- 요소마다 관찰자를 만들지 않는다. **관찰자 하나에 `observe()`를 여러 번** 부르는 편이 권장된다.
- `intersectionRect`는 `boundingClientRect`와 `rootBounds`가 겹친 사각형, 즉 실제로 보이는 부분이다.
- `root`로 지정한 요소는 관찰 대상 모두의 **조상**이어야 한다. `rootMargin`의 퍼센트 값은 `root`를 지정했을 때만 쓸 수 있다.
- 콜백은 메인 스레드에서 돌지만 **낮은 우선순위로 비동기 전달**된다. 의도적으로 픽셀 단위로 정확하지도, 지연이 짧지도 않다. 스크롤 위치에 맞춰 움직이는 애니메이션에는 맞지 않고, 그런 효과는 CSS 스크롤 기반 애니메이션(`animation-timeline: scroll()`·`view()`)으로 만든다.
- 다른 출처의 `<iframe>` 안에서도 자기 요소의 노출을 알 수 있다. 광고·소셜 위젯이 원래 주된 용도였다. 이때 `rootBounds`는 출처 간 정보 유출을 막으려고 `null`이 된다.
- **Intersection Observer v2**(Chromium 전용)는 `trackVisibility: true`, `delay` 옵션과 `entry.isVisible`로 요소가 다른 요소에 가려지거나 투명도·필터로 감춰졌는지까지 판정한다. 클릭재킹·광고 노출 조작 방지용이고 계산 비용이 커서 `delay`를 100ms 이상으로 둬야 한다.

### threshold 1의 함정

`threshold: 1`은 요소가 **100% 보일 때만** 알린다. 요소가 뷰포트보다 크면 결코 100%가 되지 않아 콜백이 오지 않는다. 긴 문단 전체가 아니라 **끝에 둔 작은 요소(센티널)** 를 관찰하거나 `threshold`를 낮춘다.

## 자주 쓰는 패턴

| 패턴 | 관찰 대상 | 처리 |
| --- | --- | --- |
| 무한 스크롤 | 목록 끝의 빈 센티널 요소 | 보이면 다음 페이지 요청. `rootMargin`을 크게 줘 미리 불러온다. 항목마다 관찰하지 말고 센티널 하나를 새 끝으로 옮겨 재사용하면 `observe()`를 다시 부를 필요가 없다 |
| 끝까지 읽음 확인 | 약관 스크롤 상자의 마지막 자식, `root`는 그 상자 | 보이면 「동의」 버튼을 활성화하고 `unobserve` |
| 지연 로딩 | 화면 밖 이미지·iframe·무거운 위젯 | 보이기 직전 `src`를 넣거나 모듈을 `import()` |
| 등장 애니메이션 | 섹션 | 보이면 클래스를 추가. 「동작 줄이기」 설정 사용자는 건너뛴다 |
| 노출 측정 | 광고·추천 카드 | 일정 비율 이상 보이면 노출로 기록 |
| 현재 섹션 표시 | 제목·섹션 | 보이는 섹션에 맞춰 목차 항목 강조 |

- 이미지·iframe 지연 로딩만 필요하면 관찰자 대신 HTML의 `loading="lazy"`를 쓴다. 관찰자는 `loading`을 지원하지 않는 자동 재생 `<video>`, CSS 배경 이미지 같은 대상에만 쓴다. lazysizes·yall.js 같은 라이브러리가 이 방식이다([[lazy-loading|지연 로딩]]).
- 화면에 들어온 링크만 골라 다음 페이지를 미리 받거나(Quicklink) 외부 링크의 DNS를 미리 조회하는 데도 쓴다([[resource-hints|리소스 힌트와 미리 불러오기]]).
- 무한 스크롤에는 키보드 사용자가 푸터에 닿지 못하는 접근성 문제가 있으므로 「더 보기」 버튼을 함께 두는 편이 낫다.

## 다른 관찰자 API

같은 **관찰자(Observer) 모양** — 생성자에 콜백, `observe()`로 등록, `disconnect()`로 해제 — 을 따르는 API가 더 있다.

| API | 알려 주는 것 | 쓰임 |
| --- | --- | --- |
| `IntersectionObserver` | 요소와 기준 영역의 겹침 | 무한 스크롤, 지연 로딩, 노출 측정 |
| `ResizeObserver` | **요소** 크기 변화 | 컨테이너 크기에 맞춘 차트 다시 그리기, 텍스트 넘침 감지 |
| `MutationObserver` | DOM 트리 변화(자식 추가·삭제, 속성, 텍스트) | 내 코드 밖에서 바뀌는 DOM에 반응(서드파티 위젯, 확장 기능). 스크롤·크기와 달리 **레이아웃이 아니라 트리 구조**를 본다 |
| `PerformanceObserver` | 성능 항목(LCP, long task 등) | [[web-vitals\|웹 성능 지표]] 측정 |

- `window`의 `resize` 이벤트는 창 크기만 알려 준다. 사이드바가 접혀 요소만 좁아진 경우는 `ResizeObserver`가 잡는다. 레이아웃만 바꾸면 되는 일은 CSS 컨테이너 쿼리가 먼저다.
- `MutationObserver`는 변경을 모아 마이크로태스크로 전달한다. 콜백에서 다시 DOM을 바꾸면 자기 자신을 또 깨울 수 있으니 조건을 둔다. 옵션과 쓰임은 [[mutation-observer|MutationObserver]]에 있다.

### ResizeObserver 세부

`resize` 이벤트 + `getBoundingClientRect()` 방식은 창 크기 변화만 잡고, 자식 추가·`display` 변경처럼 창은 그대로인데 요소 크기가 바뀌는 경우를 놓치며, 읽기·쓰기를 섞으면 레이아웃 스래싱을 일으킨다. `ResizeObserver`는 **원인과 상관없이 요소 크기 변화**를 알려 준다(Baseline 2020).

```js
const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { inlineSize, blockSize } = entry.contentBoxSize[0];
    entry.target.classList.toggle('narrow', inlineSize < 400);  // 요소 단위 브레이크포인트
  }
});
ro.observe(chart);
```

| 항목 | 내용 |
| --- | --- |
| 무엇을 보나 | 기본은 **콘텐츠 박스**(테두리 박스 − 패딩). `observe(el, { box: 'border-box' })`로 바꿀 수 있다. SVG는 바운딩 박스를 준다 |
| 무엇을 주나 | `contentRect`(옛 방식), `contentBoxSize`·`borderBoxSize`·`devicePixelContentBoxSize`(`inlineSize`·`blockSize`를 담은 배열. 다단 조각을 대비한 배열이라 지금은 원소가 하나) |
| 언제 부르나 | **레이아웃 뒤, 페인트 전.** 콜백에서 레이아웃을 바꾸면 레이아웃만 다시 하고 페인트는 한 번이다 |
| 무한 루프 방지 | 콜백 안에서 관찰 대상 크기를 바꾸면 같은 프레임에 다시 불리지만, 직전 처리한 요소보다 **DOM에서 더 깊은 요소**만 같은 프레임에 처리하고 나머지는 다음 프레임으로 미룬다. 이때 `ResizeObserver loop completed with undelivered notifications` 오류가 보고된다 |

- 채팅창을 맨 아래에 붙여 두려면 `document.scrollingElement`와 메시지 목록을 함께 관찰하고 콜백에서 `scrollTop = scrollHeight`를 넣는다. 화면 회전과 새 메시지 추가(목록이 커진다)가 한 코드로 처리된다.
- 콜백은 렌더링 직전에 돌기 때문에 무거운 작업은 다음 페인트를 늦춰 [[inp-optimization|INP]]를 나쁘게 한다. 콜백 안에서는 강제 리플로를 일으키는 읽기를 피하고 할 일을 최소로 둔다.

## 정리

- "보이는가"는 스크롤 이벤트 계산 대신 `IntersectionObserver`에 묻는다.
- `root`는 기준 영역, `rootMargin`은 미리 알림 거리, `threshold`는 보이는 비율이다.
- 큰 요소를 `threshold: 1`로 보면 콜백이 오지 않는다. 끝의 작은 센티널을 관찰한다.
- 한 번이면 `unobserve`, 끝나면 `disconnect`로 정리한다.
- 크기는 `ResizeObserver`, DOM 변화는 `MutationObserver`가 같은 모양으로 알려 준다.

관련 노트: [[debounce-throttle|Debounce와 Throttle]], [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]], [[browser-rendering|브라우저 렌더링 과정]], [[script-loading|스크립트·스타일 로딩 순서와 점진적 렌더링]], [[lazy-loading|지연 로딩: 이미지·iframe·퍼사드]], [[dom|DOM과 BOM]], [[mutation-observer|MutationObserver]], [[dom-geometry|요소 크기·스크롤·좌표]]
