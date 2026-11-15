---
title: "CLS 최적화: 자리를 먼저 잡기"
concept: "CLS Optimization"
summary: "레이아웃 이동은 늦게 도착한 것이 자리를 비집고 들어올 때 생긴다. 이미지·동영상에는 width·height나 aspect-ratio, 광고·임베드에는 min-height, 늦게 뜨는 배너는 자리 확보나 오버레이, 애니메이션은 transform, 웹 폰트는 font-display와 대체 폰트 지표 보정으로 막는다. 필드와 실험실 값의 차이로 로딩 중 이동인지 이후 이동인지 가른다."
tags: ["performance", "web", "frontend", "css", "html"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/articles/optimize-cls", "https://web.dev/articles/cls", "https://web.dev/learn/performance/understanding-the-critical-path", "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/size-adjust"]
---

> web.dev의 「[Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls)」를 바탕으로 재구성한 노트다. CLS의 점수 계산과 세션 창은 [[web-vitals|웹 성능 지표]]에 있다.

## 왜 이동이 생기나

브라우저는 자원이 다 오기를 기다리지 않고 받은 것부터 그린다([[script-loading|점진적 렌더링]]). 이미지·폰트·광고처럼 첫 렌더링 뒤에 도착하는 것이 **미리 잡아 두지 않은 자리**를 차지하면, 이미 그려진 콘텐츠가 밀린다. 그래서 CLS 최적화는 거의 모두 **늦게 올 것의 자리를 먼저 잡는 일**이다.

목표는 75번째 백분위에서 **0.1 이하**다. 0이 될 필요는 없다. 영향을 줄이기만 해도 기준 안에 든다.

## 이동 찾기

| 단서 | 해석 |
| --- | --- |
| PageSpeed Insights의 필드(CrUX) CLS와 실험실(Lighthouse) CLS가 비슷하다 | 로딩 중 이동이다. 실험실에서 재현된다 |
| 필드 값이 훨씬 크다 | 로딩 **뒤** 이동이다. 스크롤·상호작용·지연 로딩 콘텐츠·SPA 화면 전환 |
| 데이터 범위 | PageSpeed Insights가 URL이 아닌 출처 전체 값을 보여 줄 수 있으니 확인한다 |

- Lighthouse가 꼽는 요소는 대개 **밀린 쪽**이다. 그 위에 끼어든 요소가 진짜 원인인 경우가 많다.
- DevTools Performance 패널의 Layout shifts 트랙과 「Layout shift culprits」 인사이트가 원인 요소를 짚어 준다. 실시간 지표 화면은 상호작용으로 생기는 이동을 잡는다([[devtools-performance|DevTools로 성능 분석하기]]).
- 실제 사용자에게서는 `web-vitals`의 attribution 빌드가 이동한 요소를 알려 준다. iframe 안의 이동은 웹 API로 볼 수 없지만 CrUX에는 들어간다.

```js
// 콘솔에 붙여 넣고 페이지를 쓰며 이동을 기록
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) console.log(entry.value, entry.sources)
  }
}).observe({ type: 'layout-shift', buffered: true })
```

## 원인별 해결

### 1. 크기 없는 이미지·동영상

```html
<img src="/photo.jpg" width="640" height="360" alt="…">
```

```css
img { max-width: 100%; height: auto; } /* 반응형이어도 비율이 유지된다 */
.thumb { aspect-ratio: 16 / 9; width: 100%; }
```

- 브라우저는 `width`·`height` 속성으로 **비율을 계산해 받기 전에 자리를 잡는다.** CSS `height: auto`와 함께 쓰면 반응형으로 늘어나도 비율이 맞다.
- 속성 대신 CSS `aspect-ratio`로 잡아도 된다.
- `srcset` 후보는 모두 같은 비율로 맞춘다. `<picture>`로 화면마다 다른 비율의 이미지를 쓰면 각 `<source>`에도 `width`·`height`를 준다. 이미지 문법은 [[responsive-images|반응형 이미지]]에 있다.

### 2. 광고·임베드·iframe

| 방법 | 내용 |
| --- | --- |
| 자리 확보 | `min-height`나 `aspect-ratio`로 예상 크기를 잡는다 |
| 가장 작은 크기로 | 크기가 들쭉날쭉하면 가장 작은 예상 크기를 잡고, 더 큰 것이 올 때의 이동은 감수한다 |
| 화면별로 | 미디어 쿼리로 화면 폭마다 자리 크기를 다르게 |
| 비었을 때 | 광고가 안 와도 자리를 접지 말고 자리 표시를 둔다. 접는 것도 이동이다 |
| 지연 로딩한 iframe | Chrome은 자리 표시를 띄우지만 `width`·`height`는 직접 준다([[lazy-loading\|지연 로딩]]) |

### 3. 늦게 끼어드는 UI

쿠키 동의, 공지 배너, 구독 폼처럼 나중에 위쪽에 끼어드는 요소다.

- 스켈레톤이나 자리 표시로 **미리 공간을 잡는다.**
- 문서 흐름 밖에 띄운다(`position: fixed` 오버레이, 하단 시트).
- 꼭 흐름 안에 넣어야 하면 화면 아래쪽에 둔다. 아래쪽 이동은 영향 비율이 작다.

### 4. 동적으로 늘어나는 콘텐츠

| 상황 | 처리 |
| --- | --- |
| 「더 보기」, 피드 | 고정 크기 컨테이너 안에서 바꾸거나, 사용자가 버튼을 눌러 불러오게 한다. 누른 뒤 500ms 안의 이동은 세지 않으므로, 미리 받아 두면 바로 보인다 |
| 위쪽에 새 글 추가 | 화면 밖에 넣고 「새 글 보기」 알림을 띄운다 |
| 500ms 넘게 걸리는 요청 | 입력 직후 예외가 끝나므로 예상 공간을 미리 잡는다 |
| SPA 화면 전환 | 전환이 500ms를 넘으면 그 이동이 CLS에 들어간다 |

탭·클릭·키 입력 뒤 500ms 안의 이동은 빠지지만, **스크롤이나 호버 중의 이동은 빠지지 않는다.**

### 5. 애니메이션

`top`·`left`·`width`·`height`·`margin`을 바꾸는 애니메이션은 레이아웃을 다시 계산하고 주변을 민다. `transform`(`translate`, `scale`, `rotate`)으로 바꾸면 합성 단계만 다시 돌고 이동으로 세지 않는다([[transform|transform]], [[css-animation|CSS 애니메이션]]). 동작 줄이기 설정(`prefers-reduced-motion`)을 존중한다.

### 6. 웹 폰트 교체

폰트가 늦게 와서 대체 폰트로 그린 글자를 바꿔 끼우면 줄 높이·글자 폭이 달라져 문단이 밀린다.

| 방법 | 내용 |
| --- | --- |
| `font-display: optional` | 아주 짧은 시간 안에 안 오면 이번 방문은 대체 폰트를 쓴다. 교체가 없으니 이동도 없다 |
| 대체 폰트 지표 맞추기 | `@font-face`의 `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`로 대체 폰트 크기를 웹 폰트에 맞춘다 |
| 일찍 받기 | 중요한 폰트는 `<link rel="preload">` |

```css
@font-face {
  font-family: "Fallback for Inter";
  src: local("Arial");
  size-adjust: 107%;
  ascent-override: 90%;
}
body { font-family: "Inter", "Fallback for Inter", sans-serif; }
```

값은 폰트마다 다르다. 위 수치는 형태를 보여 주는 예다. `font-display` 값 비교는 [[web-font-performance|웹 폰트 성능 최적화]]에 있다.

### 7. 뒤로·앞으로 캐시

bfcache(back/forward cache)에 들어간 페이지는 뒤로 가기 때 그려진 상태 그대로 복원돼 이동이 없다. `unload` 핸들러, `Cache-Control: no-store` 같은 **bfcache 부적격 원인**을 없앤다. DevTools Application 패널의 「Back/forward cache」 검사로 이유를 볼 수 있다([[devtools-application|DevTools Application 패널]]).

## 정리

- CLS는 늦게 온 것이 자리를 비집을 때 생긴다. **자리를 먼저 잡는다.**
- 이미지·동영상은 `width`·`height`(+`height: auto`)나 `aspect-ratio`, 광고·임베드는 `min-height`.
- 늦게 뜨는 UI는 자리를 잡거나 흐름 밖에 띄우고, 애니메이션은 `transform`으로.
- 폰트는 `font-display: optional`이나 대체 폰트 지표 보정으로 교체 이동을 줄인다.
- 필드와 실험실 값의 차이로 로딩 중 이동인지, 이후 이동인지 먼저 가른다.

관련 노트: [[web-vitals|웹 성능 지표와 Lighthouse]], [[responsive-images|반응형 이미지: srcset·sizes와 picture]], [[web-font-performance|웹 폰트 성능 최적화]], [[lazy-loading|지연 로딩]], [[browser-rendering|브라우저 렌더링 과정]]
