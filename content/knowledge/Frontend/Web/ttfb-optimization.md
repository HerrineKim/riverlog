---
title: "TTFB 줄이기: 리디렉션·HTML 캐시·압축·CDN"
concept: "TTFB Optimization"
summary: "페이지의 첫 요청인 HTML이 빨리 와야 FCP·LCP가 기준을 넘는다. 리디렉션 체인을 없애고, HTML은 짧게 캐시하거나 ETag로 재검증하고, Server-Timing으로 서버 시간을 재고, 텍스트 자원은 Brotli로 정적 압축하고, CDN 엣지에서 내려 준다."
tags: ["performance", "web", "frontend", "http", "cache", "network"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/performance/general-html-performance", "https://web.dev/articles/optimize-lcp"]
---

> web.dev의 「[Learn Performance](https://web.dev/learn/performance)」 강좌 중 「General HTML performance considerations」 모듈과 「[Optimize LCP](https://web.dev/articles/optimize-lcp)」의 TTFB 항목을 바탕으로 재구성한 노트다.

## 왜 HTML 응답부터인가

페이지를 열 때 첫 요청은 HTML이다. 브라우저는 HTML을 받아야 CSS·JS·이미지를 발견하므로, **HTML이 늦으면 뒤의 모든 것이 늦다.** TTFB(Time to First Byte)가 높으면 FCP·LCP를 「좋음」 기준 안에 넣기가 어렵다. 잘 최적화된 페이지에서도 LCP 시간의 40% 정도는 TTFB가 차지한다([[lcp-optimization|LCP 최적화]]).

TTFB는 다음 시간을 모두 포함한다.

```text
리디렉션 → 서비스 워커 시작 → DNS → TCP·TLS 연결 → 요청 → 서버 처리 → 첫 바이트 도착
```

연결 단계의 비용은 [[url-to-page|브라우저에 URL을 입력하면 일어나는 일]]에, 회선별 왕복 시간은 [[frontend-latency-numbers|지연 시간 숫자]]에 있다.

## 1. 리디렉션을 줄인다

리디렉션(`301 Moved Permanently`, `302 Found`) 하나는 HTTP 요청 하나를 더 만든다.

| 종류 | 통제 | 예 |
| --- | --- | --- |
| 같은 출처 리디렉션 | 내 서버 설정이라 **완전히 통제할 수 있다** | `/page` ↔ `/page/` 끝 슬래시 정리 |
| 다른 출처 리디렉션 | 대개 통제할 수 없다 | 광고 클릭 추적, 단축 URL, 서드파티 |

- 체인을 찾는다: `http://` 링크 → `https://`로 이동 → 다시 같은 출처 정리 리디렉션처럼 겹치는 경우가 흔하다.
- 내부 링크는 **리디렉션되지 않는 최종 URL**로 건다. 끝 슬래시 규칙을 정했으면 링크도 그 형태로 쓴다.
- 리디렉션 상태 코드의 SEO 의미는 [[seo-basics|SEO 기초]]에 있다.

## 2. HTML을 캐시한다

HTML 캐시는 까다롭다. HTML이 가리키는 CSS·JS는 보통 파일명에 해시가 붙어 배포마다 바뀌는데, 오래 캐시된 HTML은 **이미 사라진 옛 파일**을 가리킬 수 있다.

| 방법 | 동작 | 쓸 곳 |
| --- | --- | --- |
| 짧은 수명 캐시 | `Cache-Control: max-age=300`처럼 몇 분만. CDN이 원 서버 대신 응답하고, 브라우저는 재검증으로 끝낼 수 있다 | 누구에게나 같은 정적 HTML |
| `ETag` 재검증 | 내용 해시 같은 식별자를 준다. 브라우저가 `If-None-Match`로 보내고, 같으면 서버가 본문 없이 `304 Not Modified` | 바뀔 수 있는 HTML. 왕복 한 번은 여전히 든다 |
| `Last-Modified` 재검증 | 같은 방식이지만 마지막 수정 시각으로 비교(`If-Modified-Since`) | ETag를 만들기 어려울 때 |
| 캐시하지 않음 | `Cache-Control: no-store` 또는 `private` | 로그인 사용자용 개인화 HTML. 브라우저 캐시는 서버가 지울 수 없다 |

```http
HTTP/1.1 200 OK
Cache-Control: max-age=300
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

`ETag`는 자원이 바뀔 때 **반드시** 바뀌어야 한다. 캐시 헤더 전반은 [[http-cache|HTTP 캐시]]에 있다.

### 캐시를 깨는 URL 매개변수

광고·분석용으로 붙는 고유 쿼리(`?utm_source=…`, 클릭 ID)는 내용이 같아도 CDN 입장에서는 다른 URL이다. 엣지 캐시가 매번 빗나가 원 서버까지 간다. CDN에서 캐시 키에 넣을 매개변수를 정해 두면 막을 수 있다.

## 3. 서버 응답 시간을 잰다

캐시되지 않은 응답의 시간은 호스팅과 백엔드가 정한다. DB를 조회하는 페이지는 정적 페이지보다 TTFB가 높다.

`Server-Timing` 응답 헤더로 서버 안의 구간 시간을 내보내면 실제 사용자 환경에서도 원인을 나눠 볼 수 있다.

```http
Server-Timing: auth;dur=55.5, db;dur=220
```

```js
// 실제 사용자에게서 수집
const [nav] = performance.getEntriesByType('navigation')
console.log(nav.responseStart, nav.serverTiming) // [{ name: 'db', duration: 220 }, ...]
```

- 지표 여러 개를 이름과 ms 단위 `dur`로 한 헤더에 담을 수 있다. DevTools Network 패널의 Timing 탭에도 보인다.
- 공유 호스팅은 TTFB가 높은 편이다. 호스팅별 실제 사용자 TTFB는 CrUX 기반 비교 사이트(ismyhostfastyet.com)에서 볼 수 있다.
- 서버 시간이 늘어도 **SSR이나 SSG로 완성된 HTML을 주는 편**이 클라이언트에서 스피너를 돌리며 데이터를 받는 것보다 대개 낫다. 서버 시간은 통제할 수 있지만, 사용자 기기는 통제할 수 없다([[spa-csr-ssr|SPA와 CSR·SSR]], [[static-site-generator|정적 사이트 생성기]]).

## 4. 압축한다

HTML, CSS, JavaScript, SVG 같은 텍스트 자원은 전송 전에 압축한다.

| 원칙 | 내용 |
| --- | --- |
| Brotli를 먼저 | gzip보다 15~20% 정도 더 작다. Brotli를 못 받는 옛 클라이언트에는 gzip. 어떤 압축이든 안 하는 것보다 낫다 |
| 파일 크기를 본다 | 1KiB 미만은 거의 줄지 않는다. 압축이 잘 된다고 큰 파일을 보내도 되는 것은 아니다. 풀고 나면 파싱·실행 비용은 그대로다 |
| 정적 자원은 정적 압축 | 빌드 때 미리 압축해 두면 요청마다 압축하는 지연이 없다. JS·CSS·SVG |
| 동적 HTML은 동적 압축 | 요청마다 만들어지는 HTML(특히 로그인 사용자용)은 응답할 때 압축한다 |

호스팅이 기본으로 해 주는 경우가 많지만, `Content-Encoding` 응답 헤더로 실제로 적용됐는지 확인한다. CDN이 대신 처리해 주기도 한다.

## 5. CDN에서 내려 준다

[[cdn|CDN]]은 원 서버의 콘텐츠를 캐시해 사용자와 **물리적으로 가까운 엣지 서버**에서 응답한다.

- 거리가 짧아져 왕복 시간(RTT)이 준다.
- HTTP/2·HTTP/3, 압축, 캐시를 엣지에서 기본으로 처리한다.
- HTML을 짧게라도 캐시해 두면 엣지가 원 서버 대신 응답한다.

## 정리

- HTML이 늦으면 모든 것이 늦다. TTFB는 LCP의 큰 몫이다.
- 내가 통제할 수 있는 같은 출처 리디렉션부터 없애고, 링크는 최종 URL로 건다.
- 공용 HTML은 몇 분이라도 캐시하고 ETag로 재검증한다. 개인화 HTML은 캐시하지 않는다.
- `Server-Timing`으로 서버 안의 구간을 실제 사용자에게서 잰다.
- 텍스트는 Brotli로, 정적 자원은 빌드 때 압축하고, CDN 엣지에서 내려 준다.

관련 노트: [[web-vitals|웹 성능 지표와 Lighthouse]], [[lcp-optimization|LCP 최적화]], [[http-cache|HTTP 캐시]], [[cdn|CDN]], [[frontend-latency-numbers|프론트엔드 개발자가 알아야 할 지연 시간 숫자]]
