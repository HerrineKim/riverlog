---
title: "LCP 최적화: 네 구간으로 나눠 줄이기"
concept: "LCP Optimization"
summary: "LCP는 TTFB, 자원 로드 지연, 자원 로드 시간, 요소 렌더 지연의 합이다. 두 「지연」 구간은 0에 가깝게, 나머지 둘은 40%씩이 목표다. LCP 자원을 HTML에서 바로 발견되게 하고, fetchpriority로 앞당기고, 지연 로딩하지 않고, 작게 만들고, 막는 CSS·JS와 긴 작업을 걷어 낸다."
tags: ["performance", "web", "frontend", "browser", "html"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/articles/optimize-lcp", "https://web.dev/articles/lcp", "https://web.dev/learn/performance/understanding-the-critical-path", "https://web.dev/learn/performance/optimize-resource-loading"]
---

> web.dev의 「[Optimize Largest Contentful Paint](https://web.dev/articles/optimize-lcp)」와 「[Learn Performance](https://web.dev/learn/performance)」 강좌의 중요 렌더링 경로·자원 로딩 모듈을 바탕으로 재구성한 노트다. LCP의 정의와 후보 요소는 [[web-vitals|웹 성능 지표]]에 있다.

## LCP를 네 구간으로 나눈다

LCP 요소가 이미지라면 시간은 네 구간으로 나뉜다. 텍스트라면 자원 구간이 없으므로(웹 폰트 제외) TTFB와 렌더 지연만 남는다.

```text
이동 시작
 ├─ ① TTFB ─────────┤ HTML 첫 바이트
 ├─ ② 자원 로드 지연 ─┤ LCP 자원 요청 시작
 ├─ ③ 자원 로드 시간 ─┤ LCP 자원 다 받음
 └─ ④ 요소 렌더 지연 ─┤ LCP 요소가 그려짐 = LCP
```

| 구간 | 무엇 | 잘 된 페이지의 비중 |
| --- | --- | --- |
| ① TTFB | HTML 첫 바이트가 올 때까지 | 약 40% |
| ② 자원 로드 지연(resource load delay) | TTFB 뒤 LCP 자원을 **요청하기 시작할 때까지** | 10% 미만 |
| ③ 자원 로드 시간(resource load duration) | LCP 자원을 받는 시간 | 약 40% |
| ④ 요소 렌더 지연(element render delay) | 자원을 다 받은 뒤 **실제로 그려질 때까지** | 10% 미만 |

- 비중은 목표이지 규칙이 아니다. 무엇보다 두 「지연」 구간을 0에 가깝게 만든다.
- 한 구간만 줄이면 시간이 다른 구간으로 옮겨 갈 뿐일 수 있다. 예를 들어 이미지를 작게 해도 막는 CSS가 더 늦게 오면 렌더 지연이 늘어난다. 네 구간을 다 본다.
- DevTools Performance 패널의 LCP 인사이트와 Lighthouse의 LCP 항목이 구간별 시간을 보여 준다([[devtools-performance|DevTools로 성능 분석하기]]).

## ① TTFB

[[ttfb-optimization|TTFB 줄이기]]에 따로 정리했다. 요약하면 리디렉션 없애기, 캐시 미스를 만드는 URL 매개변수 막기, CDN, 그리고 완성된 HTML을 주는 SSR·SSG다.

## ② 자원 로드 지연: 일찍 발견되게

목표는 **LCP 자원이 페이지의 첫 자원과 거의 동시에 요청되는 것**이다. 이 구간이 길어지는 이유는 거의 다 「브라우저가 늦게 알아서」다.

| 하지 말 것 | 이유 | 대신 |
| --- | --- | --- |
| JS로 LCP 이미지를 넣기, `data-src`에 URL 숨기기 | 스크립트를 받고 실행해야 요청한다 | `<img src>`·`srcset`를 서버가 준 HTML에 둔다 |
| 클라이언트 렌더링으로 첫 화면 만들기 | 프리로드 스캐너가 JS 문자열 속 마크업을 못 본다. 스크립트 → 실행 → 이미지 요청 체인이 생긴다 | SSR·SSG |
| LCP 이미지에 `loading="lazy"` | 레이아웃이 끝나야 요청한다. **반드시 생기는 지연**이다 | 첫 화면 이미지는 지연 로딩하지 않는다([[lazy-loading\|지연 로딩]]) |
| CSS `background-image`로 히어로 이미지 | CSS가 적용돼야 요청한다 | `<img>`로 바꾸거나 `preload` |
| 다른 출처 이미지 서버 | 새 연결이 필요하다 | 같은 출처(프록시) 또는 최소한 `preconnect` |

```html
<!-- 가장 좋은 형태: HTML에 있고 우선순위가 높다 -->
<img src="/hero.webp" fetchpriority="high" width="1200" height="600" alt="…">

<!-- 외부 CSS·JS에서만 참조되는 LCP 이미지라면 preload -->
<link rel="preload" as="image" href="/hero.webp" type="image/webp" fetchpriority="high">
```

- `fetchpriority="high"`는 **LCP가 될 이미지 한두 장에만** 준다. 이미지는 기본 우선순위가 낮아 첫 단계에서 밀린다. 반대로 캐러셀의 안 보이는 슬라이드에는 `low`를 준다. 우선순위를 바꾼 뒤에는 DevTools Network 패널의 Priority 열로 확인하고 다시 잰다.
- 텍스트가 LCP라면 그 텍스트의 웹 폰트를 `preload`한다([[web-font-performance|웹 폰트 성능 최적화]]).
- 힌트의 문법과 함정은 [[resource-hints|리소스 힌트]]에 있다.

## ③ 자원 로드 시간: 작게, 가깝게, 다투지 않게

| 방향 | 방법 |
| --- | --- |
| 크기를 줄인다 | 화면에 맞는 크기([[responsive-images\|반응형 이미지]]), AVIF·WebP, 압축, 폰트 서브셋 |
| 거리를 줄인다 | CDN, 이미지 CDN(크기·형식 변환도 자동) |
| 대역폭 경쟁을 줄인다 | 동시에 높은 우선순위 자원을 많이 받지 않는다. 화면 밖 이미지·iframe은 지연 로딩 |
| 네트워크를 없앤다 | 재방문은 긴 `Cache-Control`로 캐시에서. 아주 작은 자원은 data URL로 인라인할 수 있지만 캐시되지 않고 디코딩 비용이 생긴다 |

이 구간은 생각보다 병목이 아닌 경우가 많다. 필드 데이터로 어느 구간이 큰지 먼저 확인한다.

## ④ 요소 렌더 지연: 받자마자 그리게

이미지를 다 받았는데 아직 그려지지 않는 이유는 **렌더링을 막는 것**이 있거나 **메인 스레드가 바빠서**다.

| 원인 | 처리 |
| --- | --- |
| LCP 이미지보다 늦게 오는 스타일시트 | 안 쓰는 CSS 제거, 중요하지 않은 CSS 지연, 압축·최소화. 아주 작은 CSS만 인라인한다(인라인은 페이지 간 캐시가 안 된다) |
| `<head>`의 동기 스크립트 | `defer`·`async`·`type="module"`. 꼭 먼저 돌아야 하는 아주 작은 코드만 인라인 동기로 남긴다([[script-loading\|스크립트 로딩 순서]]) |
| 클라이언트 렌더링 | JS가 받아지고 실행돼야 요소가 생긴다. SSR로 HTML에 넣는다 |
| 긴 작업 | 이미지도 메인 스레드에서 그린다. 큰 스크립트가 메인 스레드를 잡으면 받은 이미지도 못 그린다. 작업을 쪼갠다([[inp-optimization\|INP 최적화]]) |
| 코드가 숨긴 요소 | A/B 테스트 도구가 실험이 정해질 때까지 콘텐츠를 숨기거나, 큰 스크립트가 끝나야 보이게 한 경우. 서버에서 결정하거나 숨기는 범위를 줄인다 |

## 중요 렌더링 경로와의 관계

첫 렌더링을 막는 것은 `<head>`의 렌더링 차단 CSS, 파서 차단 스크립트, 그리고 HTML 일부다. 폰트와 이미지는 첫 렌더링에서 기다리지 않는다. 그래서 「첫 페인트」만 보면 이미지 문제가 안 보인다. **사용자가 보려던 주요 콘텐츠(LCP)까지를 경로로 보는 관점**이 필요하다. 렌더링 단계 자체는 [[browser-rendering|브라우저 렌더링 과정]]에 있다.

## 정리

1. LCP 자원을 가능한 한 일찍 요청한다. HTML에 두고, `fetchpriority="high"`, 지연 로딩 금지.
2. 자원을 받자마자 바로 그려지게 한다. 막는 CSS·동기 스크립트·긴 작업을 걷어 낸다.
3. 품질을 지키며 자원 크기와 거리를 줄인다.
4. HTML을 빨리 보낸다.

관련 노트: [[web-vitals|웹 성능 지표와 Lighthouse]], [[ttfb-optimization|TTFB 줄이기]], [[resource-hints|리소스 힌트와 미리 불러오기]], [[responsive-images|반응형 이미지: srcset·sizes와 picture]], [[lazy-loading|지연 로딩]], [[script-loading|스크립트·스타일 로딩 순서와 점진적 렌더링]], [[image-compression|이미지 압축과 인코딩 자동화]], [[image-cdn|이미지 CDN과 Accept 헤더 협상]]
