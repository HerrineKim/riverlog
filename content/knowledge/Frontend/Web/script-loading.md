---
title: "스크립트·스타일 로딩 순서와 점진적 렌더링"
concept: "Script Loading"
summary: "<script>, async, defer, type=module이 HTML 파싱과 실행 순서에 주는 차이, CSS는 <head>에 두고 스크립트는 defer로 미루는 이유와 예외, 콘텐츠를 받는 대로 먼저 보여 주는 점진적 렌더링 기법을 정리했다."
tags: ["html", "javascript", "performance", "web", "frontend"]
source: other
date: "2026-10-15"
sources: ["https://www.frontendinterviewhandbook.com/kr/html-questions", "https://html.spec.whatwg.org/multipage/scripting.html#the-script-element", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script"]
---

> Front End Interview Handbook의 「[HTML 질문](https://www.frontendinterviewhandbook.com/kr/html-questions)」 중 script·리소스 배치·프로그레시브 렌더링 문항을 바탕으로, HTML Living Standard와 MDN으로 확인해 재구성한 노트입니다.

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

내려받기 순서를 더 당기거나 미루는 힌트(`preload`, `fetchpriority`, `loading`)는 [[html-lesser-known-attributes|잘 안 쓰지만 쓸모 있는 HTML 속성]]에 있다.

## 점진적 렌더링

점진적 렌더링(progressive rendering)은 페이지 전체가 준비될 때까지 기다리지 않고 **받은 부분부터 먼저 화면에 보여 주는** 기법을 통틀어 부르는 말이다. 총 로딩 시간이 같아도 사용자가 느끼는 속도가 빨라지고, FCP·LCP 같은 [[web-vitals|웹 성능 지표]]가 좋아진다. 느리고 불안정한 모바일 네트워크에서 특히 효과가 크다.

| 기법 | 하는 일 |
| --- | --- |
| 첫 화면 우선 | 첫 화면에 필요한 최소한의 CSS·콘텐츠만 먼저 보내고, 나머지 스크립트는 `defer`·`async`나 `DOMContentLoaded`·`load` 이후로 미룬다 |
| HTML 스트리밍 | 서버가 HTML을 완성되는 조각부터 흘려보낸다. 브라우저는 받은 만큼 파싱하고 그린다. React의 [[streaming-ssr|스트리밍 SSR]]이 대표적이다 |
| 이미지·iframe 지연 로딩 | 첫 화면 밖 이미지는 `loading="lazy"`로 스크롤해 다가올 때 받는다. 예전엔 스크롤 이벤트나 `IntersectionObserver`로 직접 구현했다 |
| 화면 밖 렌더링 건너뛰기 | CSS `content-visibility: auto`로 화면 밖 구역의 레이아웃·페인트를 미룬다 |
| 자리 표시 | 크기를 미리 잡은 스켈레톤으로 레이아웃 이동(CLS) 없이 빈자리를 채운다 |

점진적 렌더링은 「먼저 보여 줄 것」과 「나중에 해도 되는 것」을 나누는 일이다. CSS를 `<head>`에 두는 것도 받는 대로 그릴 수 있게 하려는 같은 원칙에서 나온다.

## 정리

- 일반 `<script>`는 파싱을 멈춘다. 외부 스크립트에는 `defer`, 독립 스크립트에는 `async`, 모듈은 그 자체로 defer다.
- `defer`는 문서 순서를 지키고 `DOMContentLoaded` 전에 끝난다. `async`는 순서를 보장하지 않는다.
- CSS는 `<head>`에서 일찍 받고, 스크립트도 `<head>`에 두되 `defer`로 미룬다.
- 첫 페인트 전에 꼭 필요한 아주 작은 코드만 동기 인라인으로 남긴다.

**파서를 막지 말고, 첫 화면에 필요한 것부터 보낸다.**

관련 노트: [[browser-rendering|브라우저 렌더링 과정]], [[html|HTML 기초와 HTML5]], [[web-vitals|웹 성능 지표와 Lighthouse]], [[streaming-ssr|스트리밍 SSR]], [[es-modules|모듈: export와 import]]
