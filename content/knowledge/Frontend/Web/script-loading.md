---
title: "스크립트·스타일 로딩 순서와 점진적 렌더링"
concept: "Script Loading"
summary: "<script>, async, defer, type=module이 HTML 파싱과 실행 순서에 주는 차이, 프리로드 스캐너가 못 보는 늦게 발견되는 자원, CSS는 <head>에 두고 스크립트는 defer로 미루는 이유와 예외, @import를 피하고 중요 CSS만 인라인하는 CSS 경량화, 콘텐츠를 받는 대로 먼저 보여 주는 점진적 렌더링 기법을 정리했다."
tags: ["html", "javascript", "performance", "web", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://www.frontendinterviewhandbook.com/kr/html-questions", "https://ko.javascript.info/script-async-defer", "https://html.spec.whatwg.org/multipage/scripting.html#the-script-element", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script", "https://web.dev/learn/performance/optimize-resource-loading", "https://web.dev/learn/performance/understanding-the-critical-path", "https://www.stevesouders.com/blog/2010/12/06/evolution-of-script-loading/", "https://www.stevesouders.com/blog/2010/02/07/browser-script-loading-roundup/", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EC%84%B1%EB%8A%A5%20%EC%B5%9C%EC%A0%81%ED%99%94/%EC%82%AC%EC%9A%A9%ED%95%98%EC%A7%80%20%EC%95%8A%EB%8A%94%20CSS%20%EC%A0%9C%EA%B1%B0.md"]
---

> Front End Interview Handbook의 「[HTML 질문](https://www.frontendinterviewhandbook.com/kr/html-questions)」 중 script·리소스 배치·프로그레시브 렌더링 문항을 바탕으로, HTML Living Standard와 MDN으로 확인해 재구성한 노트다. 프리로드 스캐너와 CSS 경량화는 web.dev의 「[Learn Performance](https://web.dev/learn/performance)」 강좌 중 「Optimize resource loading」 모듈로 보강했다. 동적 스크립트의 실행 순서는 javascript.info(모던 JavaScript 튜토리얼)의 「defer, async 스크립트」 글로 보강했다. 역사는 「[Evolution of Script Loading](https://www.stevesouders.com/blog/2010/12/06/evolution-of-script-loading/)」과 「[Browser script loading roundup](https://www.stevesouders.com/blog/2010/02/07/browser-script-loading-roundup/)」으로 보강했다. 안 쓰는 CSS를 빌드 때 지우는 방법은 「[Frontend_TIL: 사용하지 않는 CSS 제거](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EC%84%B1%EB%8A%A5%20%EC%B5%9C%EC%A0%81%ED%99%94/%EC%82%AC%EC%9A%A9%ED%95%98%EC%A7%80%20%EC%95%8A%EB%8A%94%20CSS%20%EC%A0%9C%EA%B1%B0.md)」을 바탕으로 보강했다.

## 왜 로딩 순서가 중요한가

브라우저는 HTML을 위에서 아래로 파싱하며 DOM을 만들고, 그 사이에 만난 CSS와 스크립트를 내려받는다. **CSS는 렌더링을, 일반 스크립트는 파싱을 막는다.** 어떤 자원을 어디에 어떤 속성으로 두느냐에 따라 첫 화면이 뜨는 시간과 스크립트가 DOM을 볼 수 있는 시점이 달라진다. 파서가 왜 멈추는지, DOM·CSSOM·렌더 트리가 어떻게 만들어지는지는 [[browser-rendering|브라우저 렌더링 과정]]에 있다.

## script, async, defer, module

```text
<script>          파싱 ──■ 받기 ■ 실행 ■── 파싱 계속
<script async>    파싱 ──────────■ 실행 ■── 파싱 계속
                  받기 ═════════╝            (받는 대로 바로 실행)
<script defer>    파싱 ─────────────────────── 파싱 끝 ■ 실행
                  받기 ═══════╝                (문서 순서대로)
```

| 방식 | 내려받기 | 실행 시점 | 실행 순서 | 쓰는 곳 |
| --- | --- | --- | --- | --- |
| `<script>` | 파싱을 멈추고 받는다 | 받자마자, 파싱을 멈춘 채 | 문서 순서 | 거의 없음. 꼭 동기로 돌아야 하는 짧은 인라인 코드 |
| `<script async>` | 파싱과 병렬 | 다 받는 즉시(파싱 도중일 수도 있다) | 보장 없음 | 다른 코드와 무관한 분석·광고 스크립트 |
| `<script defer>` | 파싱과 병렬 | 파싱이 끝난 뒤, `DOMContentLoaded` 직전 | 문서 순서 | DOM을 다루는 일반 앱 스크립트 |
| `<script type="module">` | 파싱과 병렬(의존 모듈까지) | 기본이 defer와 같다. `async`를 주면 async처럼 | defer와 같음 | 모듈 문법을 쓰는 현대 코드 |

알아 둘 규칙:

- `async`와 `defer`는 **`src`가 있는 클래식 스크립트에만** 효과가 있다. 인라인 클래식 스크립트에서는 무시된다. 모듈 스크립트는 인라인이어도 `async`가 먹는다.
- 둘 다 붙이면 `async`로 동작한다.
- `defer` 스크립트는 `DOMContentLoaded`를 늦춘다. `async` 스크립트는 그 이벤트와 순서가 정해져 있지 않다.
- 모듈은 `defer`가 기본이라 `defer`를 따로 붙여도 변화가 없다. 다른 출처의 모듈은 CORS 응답이 필요하다(→ [[es-modules|모듈: export와 import]]).
- 비동기 스크립트의 `document.write()`는 무시된다. `document.write()`는 동기 파싱을 전제로 한 옛 API라 쓰지 않는다.
- JS로 만들어 DOM에 넣은 `<script>`(`document.createElement('script')`)는 문서에 붙는 순간 받기 시작하고 `async`처럼 동작한다. 아무것도 기다리지 않고 아무도 기다리지 않으며, 먼저 받은 것부터 실행된다(load-first). 넣은 순서대로 실행해야 하면 붙이기 전에 `script.async = false`를 준다. 로딩 성공·실패는 `load`·`error` 이벤트로 안다([[page-lifecycle-events|페이지 생명주기와 리소스 로딩 이벤트]]).
- `defer` 스크립트끼리는 작은 파일이 먼저 받아져도 **문서 순서대로** 실행된다. `async`는 다운로드가 끝난 순서다.
- 파서를 막는 스크립트는 그보다 앞서 요청된 렌더링 차단 CSS가 도착해 파싱될 때까지 실행을 기다린다. 스크립트가 `getComputedStyle()`처럼 스타일을 읽을 수 있기 때문이다.

## 프리로드 스캐너가 못 보는 자원

파서가 스크립트나 CSS에 막혀 있는 동안에도 **프리로드 스캐너**(보조 파서)가 받은 HTML 원문을 훑어 이미지·CSS·JS를 미리 요청한다. 그래서 중요한 자원은 **서버가 보낸 HTML 마크업 안에** 있어야 한다. 아래 패턴은 스캐너가 발견하지 못해 늦게 요청된다.

| 늦게 발견되는 패턴 | 대신 |
| --- | --- |
| CSS `background-image`로 넣은 이미지 | 중요한 이미지는 `<img>`로, 아니면 `preload` |
| JS가 DOM에 넣는 스크립트, 동적 `import()` | 첫 화면에 필요하면 HTML의 `<script>`나 `modulepreload` |
| 클라이언트 렌더링으로 만든 HTML(JS 문자열 속 마크업) | SSR·SSG로 HTML에 넣는다 |
| CSS의 `@import` | HTML의 `<link rel="stylesheet">` 여러 개 |

피할 수 없을 때는 `preload`로 발견을 앞당긴다([[resource-hints|리소스 힌트와 미리 불러오기]]). LCP 이미지가 이 패턴에 걸리면 LCP가 크게 늦어진다([[lcp-optimization|LCP 최적화]]).

`defer`·`async`로 미루면 스크립트가 실행되기 **전에** 화면이 먼저 보인다. 그 스크립트가 붙이는 기능(버튼 동작, 위젯)은 준비될 때까지 로딩 표시를 두거나 `disabled`로 두어, 눌러도 반응 없는 상태를 숨기지 않는다. `DOMContentLoaded`·`load`가 각 스크립트를 기다리는지는 [[page-lifecycle-events|페이지 생명주기와 리소스 로딩 이벤트]]에 정리했다.

## CSS는 head에, 스크립트는 defer로

| 자원 | 둘 곳 | 이유 |
| --- | --- | --- |
| `<link rel="stylesheet">` | `<head>` | CSSOM이 있어야 첫 화면을 그릴 수 있다. 일찍 발견해야 일찍 받는다. 본문 뒤에 두면 스타일 없는 내용이 잠깐 보이는 **FOUC**(Flash of Unstyled Content)나, 다 받을 때까지 흰 화면이 생긴다 |
| 클래식 `<script>` | `<head>`에 `defer`를 붙여 둔다 | `</body>` 직전에 두는 옛 방식과 실행 시점은 비슷하지만, 파서가 스크립트를 **훨씬 일찍 발견해 미리 받는다** |

과거에는 「CSS는 위, JS는 `</body>` 직전」이 정석이었다. `defer`가 모든 브라우저에서 일관되게 동작하는 지금은 `<head>` + `defer`(또는 `type="module"`)가 기본이다. 스크립트를 본문 끝에 두면 HTML을 거의 다 받아 파싱한 뒤에야 발견되므로 내려받기가 그만큼 늦게 시작된다.

### 예외

| 상황 | 처리 |
| --- | --- |
| 첫 페인트 전에 꼭 돌아야 하는 작은 코드(다크 모드 클래스 붙이기, 폰트 로딩 클래스) | `<head>`에 짧은 인라인 동기 스크립트. 렌더링 전에 실행돼 깜빡임을 막는다 |
| 페이지와 무관한 서드파티(분석, 채팅 위젯) | `async`. 일부는 `load` 이후로 더 미룬다 |
| 첫 화면 밖에서만 쓰는 CSS(인쇄용, 큰 화면 전용) | `media` 속성을 맞게 주면 일치하지 않는 동안 렌더링을 막지 않는다 |
| 첫 화면에 꼭 필요한 최소 CSS | `<style>`로 인라인하고(critical CSS) 나머지는 비동기로 받는다 |
| 렌더링 전에 반드시 끝나야 하는 비동기 스크립트(A/B 테스트) | `<head>`의 스크립트에 `blocking="render"`. Chromium 계열만 지원하는 실험적 속성이다 |

내려받기 순서를 더 당기거나 미루는 힌트(`preload`, `fetchpriority`, `loading`)는 [[html#속성 하나로 끝나는 기능|HTML 기초와 HTML5]]과 [[resource-hints|리소스 힌트와 미리 불러오기]]에 있다.

## CSS를 가볍게

CSS가 렌더링을 막는 것은 FOUC를 막기 위해서라 나쁜 일이 아니다. 줄여야 할 것은 **막는 시간**이다.

| 방법 | 내용 | 주의 |
| --- | --- | --- |
| 최소화(minify) | 공백·주석을 지운다. 배포 빌드에서 번들러가 자동으로 한다. FCP, 때로 LCP가 좋아진다 | 규칙을 합치는 공격적인 최적화는 CSS 구조에 따라 깨질 수 있다 |
| 안 쓰는 CSS 제거 | 브라우저는 안 쓰는 규칙도 모두 받고 파싱한다. DevTools 커버리지나 Lighthouse로 찾고, 페이지별 파일로 나누거나 지운다. CSS 프레임워크를 통째로 쓴다면 빌드 때 PurgeCSS 같은 도구가 HTML·JS 소스에서 문자열을 뽑아 클래스 이름과 대조하고, 나오지 않는 선택자를 지운다 | 전부 없애기는 비현실적이다. 큰 것부터. 문자열 대조 방식이라 `hover:opacity-100`처럼 특수문자가 든 클래스는 추출기(`defaultExtractor` 정규식)를 맞춰야 하고, JS에서 조립하는 클래스(`'btn-' + size`)는 safelist에 두지 않으면 지워진다. Tailwind는 지금 쓴 클래스만 생성해 따로 지울 필요가 없다 |
| `@import` 피하기 | `@import`는 바깥 파일을 받아야 안쪽을 발견하는 **요청 체인**을 만들고, 프리로드 스캐너도 못 본다. HTML의 `<link>` 여러 개는 동시에 받는다 | 캐스케이드 레이어·서드파티 때문에 꼭 써야 하면 `preload`로 보완한다. Sass의 `@use`·`@import`는 빌드 때 한 파일로 합쳐지므로 해당하지 않는다 |
| 중요 CSS 인라인 | 첫 화면에 필요한 스타일만 `<head>`의 `<style>`에 넣어 요청 하나를 없앤다. 캐시가 빈 첫 방문의 FCP가 좋아진다 | 고를 범위·자동화·유지가 어렵다. 인라인한 CSS는 HTML에 붙어 **페이지 간 캐시가 안 된다.** 재 보고 결정한다 |

JS도 같은 원리로 최소화하고, 번들러는 배포 빌드에서 식별자 이름까지 줄인다(uglify, 예: Terser). 기본 설정이 크기와 정확성의 균형을 대개 잘 맞춘다.

## 점진적 렌더링

점진적 렌더링(progressive rendering)은 페이지 전체가 준비될 때까지 기다리지 않고 **받은 부분부터 먼저 화면에 보여 주는** 기법을 통틀어 부르는 말이다. 총 로딩 시간이 같아도 사용자가 느끼는 속도가 빨라지고, FCP·LCP 같은 [[web-vitals|웹 성능 지표]]가 좋아진다. 느리고 불안정한 모바일 네트워크에서 특히 효과가 크다.

| 기법 | 하는 일 |
| --- | --- |
| 첫 화면 우선 | 첫 화면에 필요한 최소한의 CSS·콘텐츠만 먼저 보내고, 나머지 스크립트는 `defer`·`async`나 `DOMContentLoaded`·`load` 이후로 미룬다 |
| HTML 스트리밍 | 서버가 HTML을 완성되는 조각부터 흘려보낸다. 브라우저는 받은 만큼 파싱하고 그린다. React의 [[streaming-ssr\|스트리밍 SSR]]이 대표적이다 |
| 이미지·iframe 지연 로딩 | 첫 화면 밖 이미지는 `loading="lazy"`로 스크롤해 다가올 때 받는다. 예전엔 스크롤 이벤트나 `IntersectionObserver`로 직접 구현했다([[lazy-loading\|지연 로딩]]) |
| 화면 밖 렌더링 건너뛰기 | CSS `content-visibility: auto`로 화면 밖 구역의 레이아웃·페인트를 미룬다 |
| 자리 표시 | 크기를 미리 잡은 스켈레톤으로 레이아웃 이동(CLS) 없이 빈자리를 채운다 |

점진적 렌더링은 「먼저 보여 줄 것」과 「나중에 해도 되는 것」을 나누는 일이다. CSS를 `<head>`에 두는 것도 받는 대로 그릴 수 있게 하려는 같은 원칙에서 나온다.

## 역사

지금의 「`<head>`에 두고 `defer`」 원칙은 브라우저가 스크립트를 다루는 방식이 바뀌며 자리 잡았다.

| 시기 | 브라우저 동작 | 당시 권장 |
| --- | --- | --- |
| ~2008 (IE7, Firefox 2) | 스크립트를 **하나씩 차례로** 받고 실행했다. 받는 동안 이미지·CSS 등 **다른 다운로드도 모두 막았다.** 실행 순서를 지키려는 동작이었다 | 스크립트를 `</body>` 직전으로 옮긴다 |
| 2009~2010 (IE8, Firefox 3.6, Chrome 2~4, Safari 4) | 스크립트끼리, 다른 자원과도 **병렬로 받기** 시작했다. 다만 일부 자원(iframe, IE8은 이미지도)은 여전히 막았다 | `document.createElement('script')`로 동적 삽입해 비동기로 받는다. LABjs·ControlJS 같은 로더가 순서를 관리했다 |
| 같은 시기 | 받은 스크립트를 파싱·실행하는 동안 UI가 멈춘다 | 첫 화면에 필요한 코드와 나중 코드를 나눠, 나머지는 `onload` 뒤에 불러온다. 지금의 [[code-splitting\|코드 분할]]이다 |
| HTML5 이후 | `async`·`defer`가 표준이 되고, 모든 브라우저에 프리로드 스캐너가 들어갔다 | `<head>` + `defer`, 모듈, `<link rel="preload">` |

다운로드와 실행 시점을 따로 제어하려던 당시의 꼼수(`<object>`나 가짜 `type`으로 받아 두기)는 지금 `preload`·`modulepreload`가 맡는다([[resource-hints|리소스 힌트]]).

## 정리

- 일반 `<script>`는 파싱을 멈춘다. 외부 스크립트에는 `defer`, 독립 스크립트에는 `async`, 모듈은 그 자체로 defer다.
- `defer`는 문서 순서를 지키고 `DOMContentLoaded` 전에 끝난다. `async`는 순서를 보장하지 않는다.
- CSS는 `<head>`에서 일찍 받고, 스크립트도 `<head>`에 두되 `defer`로 미룬다.
- 첫 페인트 전에 꼭 필요한 아주 작은 코드만 동기 인라인으로 남긴다.

**파서를 막지 말고, 첫 화면에 필요한 것부터 보낸다.**

관련 노트: [[browser-rendering|브라우저 렌더링 과정]], [[html|HTML 기초와 HTML5]], [[web-vitals|웹 성능 지표와 Lighthouse]], [[resource-hints|리소스 힌트와 미리 불러오기]], [[lcp-optimization|LCP 최적화]], [[lazy-loading|지연 로딩]], [[streaming-ssr|스트리밍 SSR]], [[es-modules|모듈: export와 import]], [[html-head-metadata|문서 head와 메타데이터]], [[page-lifecycle-events|페이지 생명주기와 리소스 로딩 이벤트]]
