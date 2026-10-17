---
title: "리소스 힌트와 미리 불러오기: preconnect·preload·fetchpriority·Speculation Rules"
concept: "Resource Hints"
summary: "브라우저가 스스로 늦게 발견하는 자원을 앞당기는 힌트. 다른 출처 연결은 preconnect·dns-prefetch, 늦게 발견되는 중요한 자원은 preload, 우선순위는 fetchpriority로 조정한다. 다음 이동을 위해서는 prefetch, Speculation Rules의 prefetch·prerender, 서비스 워커 프리캐싱을 쓰되 확신이 있을 때만 쓴다."
tags: ["performance", "html", "web", "frontend", "network", "browser"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/performance/resource-hints", "https://web.dev/learn/performance/prefetching-prerendering-precaching", "https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/prefetch"]
---

> web.dev의 「[Learn Performance](https://web.dev/learn/performance)」 강좌 중 「Assist the browser with resource hints」, 「Prefetching, prerendering, and service worker precaching」 모듈을 바탕으로, 지원 범위는 MDN으로 확인해 재구성한 노트다.

## 리소스 힌트란

브라우저는 HTML 파서와 [[script-loading|프리로드 스캐너]]가 마크업에서 찾은 자원을 받는다. 그런데 CSS 안의 폰트, JS가 넣는 이미지처럼 **나중에야 발견되는 자원**이 있고, 다른 출처 서버와의 연결처럼 미리 해 두면 좋은 일이 있다. 리소스 힌트는 이것을 브라우저에 미리 알려 주는 선언이다.

- 보통 `<head>` 앞쪽의 `<link>`로 쓰고, `Link` HTTP 헤더로도 보낼 수 있다.
- **힌트일 뿐이다.** 브라우저는 네트워크 상태·설정에 따라 무시할 수 있다.
- 남용하면 오히려 느려진다. 모든 것을 앞당기면 아무것도 앞당겨지지 않는다.

| 힌트 | 하는 일 | 대상 | 비용 |
| --- | --- | --- | --- |
| `dns-prefetch` | DNS 조회만 미리 | 쓸지 확실하지 않은 다른 출처, 사용자가 누를 법한 외부 링크 | 매우 낮음 |
| `preconnect` | DNS + TCP + TLS 연결까지 미리 | 곧 쓸 게 확실한 중요한 다른 출처 1~2곳 | 중간 |
| `preload` | 지금 페이지에 필요한 자원을 **높은 우선순위로** 미리 받기 | 늦게 발견되는 중요한 자원 | 높음 |
| `fetchpriority` | 같은 종류 자원 사이의 우선순위 조정 | LCP 이미지(`high`), 숨겨진 이미지(`low`) | 거의 없음 |
| `prefetch` | **다음 이동**에 필요한 자원을 낮은 우선순위로 받아 캐시 | 다음 페이지의 CSS·JS | 낭비될 수 있음 |
| Speculation Rules | 다음 페이지를 미리 받거나(prefetch) 통째로 그려 두기(prerender) | 사용자가 갈 확률이 높은 같은 출처 페이지 | prerender는 매우 높음 |

## 지금 페이지를 위한 힌트

### preconnect와 dns-prefetch

다른 출처에서 자원을 받으려면 대기, DNS 조회, TCP 연결, TLS 협상을 거쳐야 한다. `preconnect`는 파서가 그 자원을 발견하기 전에 이 과정을 끝내 둔다.

```html
<!-- Google Fonts: CSS를 주는 곳과 폰트 파일을 주는 곳이 다르다 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- 쓸지 모르는 곳은 DNS만 -->
<link rel="dns-prefetch" href="https://cdn.example.com">
```

- **CORS로 받는 자원(폰트 등)에 연결할 때는 `crossorigin`을 붙인다.** 빠뜨리면 실제 폰트 요청이 미리 연 연결을 재사용하지 못하고 새 연결을 연다.
- 다른 출처가 많은 페이지라도 전부 `preconnect`하지 않는다. 열어 둔 연결은 비용이고, 쓰지 않으면 닫힌다.
- 가장 좋은 방법은 중요한 자원을 **HTML과 같은 출처**에 두는 것이다. `preconnect`는 비용을 줄일 뿐 없애지 못한다.

### preload: 늦게 발견되는 중요한 자원만

`preload`는 현재 페이지 렌더링에 필요한 자원을 일찍, 높은 우선순위로 요청한다. 대상은 **프리로드 스캐너가 첫 HTML에서 찾을 수 없는 중요한 자원**으로 한정한다.

| 늦게 발견되는 자원 | 이유 |
| --- | --- |
| 웹 폰트 | CSS를 받고 파싱한 뒤, 레이아웃이 그 폰트를 필요로 해야 요청한다 |
| `@import`로 가져오는 CSS | 바깥 CSS를 받아야 안쪽이 보인다 |
| LCP 후보인 CSS `background-image` | CSS가 적용돼야 요청한다 |
| JS가 넣는 LCP 이미지 | 스크립트가 실행돼야 요청한다 |

```html
<!-- LCP 이미지 -->
<link rel="preload" href="/lcp-image.jpg" as="image" fetchpriority="high">

<!-- 화면에 따라 다른 이미지: src 대신 imagesrcset·imagesizes -->
<link rel="preload" as="image" fetchpriority="high"
      imagesrcset="/hero-480.webp 480w, /hero-960.webp 960w"
      imagesizes="100vw">

<!-- 폰트: 같은 출처여도 crossorigin 필수 -->
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>
```

**두 번 받기를 부르는 실수**

| 실수 | 결과 |
| --- | --- |
| `as`를 빠뜨림 | 미리 받은 것을 쓰지 못하고 다시 받는다 |
| CORS 자원(폰트)에 `crossorigin`을 빠뜨림 | 다시 받는다 |
| CORS가 아닌 요청에 `crossorigin`을 붙임 | 다시 받는다 |
| 반응형 이미지 preload에 `src`(`href`)도 넣음 | 반응형 preload를 모르는 브라우저가 대체 이미지를 받는다. `imagesrcset`만 쓴다 |

- 이미지는 기본 우선순위가 낮고 `preload`는 그것을 바꾸지 않는다. 그래서 LCP 이미지 preload에는 `fetchpriority="high"`를 함께 준다.
- preload한 자원은 사실상 높은 우선순위라 많이 쓰면 다른 중요한 자원과 대역폭을 다툰다.
- 더 근본적인 해법은 늦게 발견되는 패턴 자체를 없애는 것이다(`<img>`를 HTML에 두기, `@import` 대신 `<link>`).
- 모듈 스크립트와 그 의존 트리는 `<link rel="modulepreload">`로 미리 받는다.

### fetchpriority: 우선순위 조정

`fetchpriority`는 `<img>`, `<link>`, `<script>`(그리고 `fetch()`의 `priority` 옵션)에 `high`·`low`·`auto`로 준다.

```html
<img src="/poster.jpg" fetchpriority="high" alt="">
<img src="/thumb-1.jpg" fetchpriority="low" alt="">
```

브라우저의 기본 동작을 알면 왜 필요한지 보인다.

- 이미지는 **낮은 우선순위로 시작**하고, 레이아웃 뒤 첫 화면 안에 있다고 판명되면 높아진다. 레이아웃은 CSS가 끝나야 하므로 이 승격은 늦다.
- 로딩은 대략 두 단계다. 첫 단계는 막는 스크립트를 모두 받고 실행할 때까지이고, 이 동안 낮은 우선순위 자원은 미뤄질 수 있다. `fetchpriority="high"`를 주면 첫 단계부터 받는다.
- **LCP 이미지 하나에만 `high`를 준다.** 여러 장에 주면 효과가 없다. 캐러셀의 숨은 슬라이드처럼 당장 안 보이는 이미지에는 `low`를 준다.

`loading`·`decoding`·`fetchpriority` 속성 요약은 [[html-lesser-known-attributes|잘 안 쓰지만 쓸모 있는 HTML 속성]]에 있다.

## 다음 이동을 위한 미리 불러오기

[[code-splitting|코드 분할]]과 [[lazy-loading|지연 로딩]]으로 첫 로딩을 가볍게 하면, 나중에 필요한 자원은 그때 받느라 기다리게 된다. 미리 불러오기는 그 기다림을 줄이는 대신 **쓰지 않을 수도 있는 데이터**를 쓴다. 그래서 분석 데이터로 사용자가 다음에 어디로 갈지 확신이 있을 때만 쓴다.

### link rel="prefetch"

```html
<link rel="prefetch" href="/date-picker.js" as="script">
<link rel="prefetch" href="/next-page.css" as="style">
```

- **가장 낮은 우선순위**로 받아 HTTP(디스크) 캐시에 넣는다. 현재 페이지의 자원과 다투지 않는다.
- Baseline이 아니다. 일부 주요 브라우저에서 동작하지 않으므로 점진적 향상으로만 쓴다.
- 캐시 분할(cache partitioning) 때문에 **다른 최상위 사이트**에서 쓸 자원을 미리 받는 용도로는 쓸모가 없다.
- 문서 자체를 미리 받는 용도라면 지원하는 브라우저에서는 Speculation Rules를 쓴다. 다른 출처 문서·개인화된 HTML을 prefetch하지 않는다.

### Speculation Rules: prefetch와 prerender

`<script type="speculationrules">` 안의 JSON으로 다음 페이지를 미리 받거나 미리 그린다. Chromium 계열에서 지원하며 MDN은 실험적 기능으로 분류한다. 지원하지 않는 브라우저는 그냥 무시한다.

```html
<script type="speculationrules">
{
  "prefetch": [{ "urls": ["/page-a", "/page-b"] }],
  "prerender": [{
    "where": {
      "and": [
        { "href_matches": "/*" },
        { "not": { "href_matches": "/logout" } },
        { "not": { "selector_matches": ".no-prerender" } }
      ]
    }
  }]
}
</script>
```

| | prefetch | prerender |
| --- | --- | --- |
| 받는 것 | 문서 응답 본문만. 하위 자원은 받지 않는다 | 하위 자원, JS 실행, 렌더링까지 보이지 않는 탭에서 |
| 비용 | 낮다 | 높다. iframe 하나를 그리는 것과 비슷하다 |
| 이동 속도 | 빨라진다 | 거의 즉시. 그려 둔 페이지를 앞으로 꺼낸다 |
| 캐시 | 문서별 메모리 캐시. 이동하면 버린다 | 같음 |
| 출처 | 다른 사이트는 그 사이트 쿠키가 없을 때만 | 기본은 같은 출처만 |

- `urls`로 목록을 주거나, `where`의 `href_matches`·`selector_matches`·`and`·`or`·`not`으로 페이지의 링크를 골라낸다.
- 로그아웃, 장바구니 담기처럼 **요청 자체가 부작용인 URL**은 반드시 제외한다.
- prerender된 페이지는 JS가 미리 실행된다. 분석 코드는 실제로 보였을 때(`document.prerendering`, `prerenderingchange`) 기록해야 한다. 성능 지표도 `activationStart`부터 잰다([[web-vitals|웹 성능 지표]]).
- 옛 `<link rel="prerender">`는 표준이 된 적 없는 Chrome 전용 기능이고, Speculation Rules가 대체한다.
- 화면에 들어온 링크만 골라 미리 받는 Quicklink 같은 라이브러리는 [[intersection-observer|IntersectionObserver]]로 링크가 보이는지 판단한다.

### 서비스 워커 프리캐싱

서비스 워커가 **설치될 때** 정해 둔 자원을 Cache API에 넣어 두고, 이후 그 자원은 네트워크 없이 캐시에서만 준다(cache-only). 서비스 워커가 제어하는 모든 페이지에서 쓸 수 있고 모든 현대 브라우저가 지원한다.

```js
// Workbox: 빌드 때 만든 프리캐시 매니페스트
import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute([
  { url: '/css/product-page.css', revision: '518747aa' }, // 버전 없는 파일은 빌드 때 revision 생성
  { url: '/js/product-page.a1b2c3.js', revision: null },  // 파일명에 해시가 있으면 null
])
```

- 직접 짜기보다 Workbox를 쓰는 편이 낫다. 버전을 추적하고, 서비스 워커가 갱신되면 만료된 항목을 지운다.
- 서비스 워커의 Cache API와 `Cache-Control`이 다루는 HTTP 캐시는 **다른 캐시**다.
- 프리캐시도 대역폭·저장 공간·CPU를 쓴다. 쓸 게 확실한 것만 넣고, 애매하면 런타임 캐시로 돌린다. 캐시 전략은 [[service-worker-caching|서비스 워커 캐싱과 응답 전략]]에 있다.

### 언제 미리 받지 않나

| 조건 | 처리 |
| --- | --- |
| 사용자가 데이터 절약을 켬 | `Save-Data` 요청 헤더나 `navigator.connection.saveData`가 켜져 있으면 미리 받지 않는다 |
| 느린 연결 | Network Information API(`navigator.connection.effectiveType`)로 빠른 연결에서만 한다. Chromium 계열 전용 API다 |
| 갈지 안 갈지 모르는 페이지 | 받지 않는다. 화면에 들어온 링크나 호버한 링크처럼 신호가 있을 때만 |

## 정리

- 리소스 힌트는 브라우저가 늦게 아는 것을 일찍 알려 주는 선언이고, 힌트라 무시될 수 있다.
- 다른 출처 연결은 `preconnect`(확실할 때)와 `dns-prefetch`(애매할 때). CORS 자원이면 `crossorigin`.
- `preload`는 늦게 발견되는 중요한 자원에만, `as`와 `crossorigin`을 정확히. LCP 이미지에는 `fetchpriority="high"` 하나.
- 다음 이동은 Speculation Rules·prefetch·프리캐싱으로 당기되, 데이터 절약·느린 연결·낮은 확신이면 하지 않는다.

**앞당길 것은 적게, 정확히 고른다.**

관련 노트: [[script-loading|스크립트·스타일 로딩 순서와 점진적 렌더링]], [[lcp-optimization|LCP 최적화]], [[web-font-performance|웹 폰트 성능 최적화]], [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]], [[html-lesser-known-attributes|잘 안 쓰지만 쓸모 있는 HTML 속성]], [[dns|DNS]]
