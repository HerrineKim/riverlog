---
title: "브라우저 렌더링 과정"
concept: "Critical Rendering Path"
summary: "브라우저의 구성 요소와, HTML을 DOM으로·CSS를 CSSOM으로 파싱해 렌더 트리로 레이아웃(리플로우)·페인팅·합성을 거쳐 화면을 그리는 과정. HTML 파서의 특성, 스크립트·스타일 시트의 차단, 더티 비트와 강제 동기 레이아웃, 변경마다 다시 도는 단계까지."
tags: ["frontend", "browser", "dom", "rendering", "performance"]
source: mixed
date: "2026-10-21"
sources: ["https://web.dev/articles/critical-rendering-path", "https://web.dev/articles/howbrowserswork", "https://developer.mozilla.org/ko/docs/Web/Performance/How_browsers_work", "https://webactually.com/2020/06/22/%EC%84%9C%EB%B2%84%EC%97%90%EC%84%9C-%ED%81%B4%EB%9D%BC%EC%9D%B4%EC%96%B8%ED%8A%B8%EB%A1%9C/", "https://d2.naver.com/helloworld/59361", "https://wormwlrm.github.io/2021/03/27/How-browsers-work.html", "https://web.dev/learn/performance/understanding-the-critical-path", "https://bytebytego.com/guides/how-does-the-browser-render-a-web-page", "https://dbaron.org/talks/2012-03-11-sxsw/master.xhtml", "https://web.dev/articles/rendering-performance", "https://www.phpied.com/css-and-the-critical-path/", "https://developer.chrome.com/blog/css-containment", "https://developer.mozilla.org/en-US/docs/Web/CSS/contain", "https://developer.chrome.com/docs/lighthouse/performance/critical-request-chains"]
---

> 브라우저 구조·파서·레이아웃 최적화 부분은 Tali Garsiel의 「[브라우저는 어떻게 동작하는가?](https://d2.naver.com/helloworld/59361)」(NAVER D2 번역, 2012.05)와 재그지그의 「[프론트엔드 개발자라면 알고 있어야 할 브라우저의 동작 과정](https://wormwlrm.github.io/2021/03/27/How-browsers-work.html)」(2021.03)을 바탕으로 재구성한 노트다. 첫 렌더링이 기다리는 자원은 web.dev의 「[Learn Performance](https://web.dev/learn/performance)」 강좌 중 「Understanding the critical path」 모듈로 보강했다. 전체 흐름 요약은 ByteByteGo의 System Design 101 가이드 「[How Browsers Render Web Pages](https://bytebytego.com/guides/how-does-the-browser-render-a-web-page)」도 참고했다. 속성별로 다시 도는 단계는 David Baron의 발표 「[Fast CSS: How Browsers Lay Out Web Pages](https://dbaron.org/talks/2012-03-11-sxsw/master.xhtml)」와 web.dev의 「[Rendering performance](https://web.dev/articles/rendering-performance)」, CSS가 곧 중요 경로라는 관점은 「[CSS and the critical path](https://www.phpied.com/css-and-the-critical-path/)」, containment는 「[CSS containment in Chrome 52](https://developer.chrome.com/blog/css-containment)」와 MDN으로 보강했다.

## 한눈에 보기

브라우저가 HTML 문서를 받아 화면에 픽셀을 찍기까지의 단계를 **중요 렌더링 경로(Critical Rendering Path)** 라고 한다.

| 단계 | 입력 | 결과 |
| --- | --- | --- |
| 1. DOM 생성 | HTML 바이트 | 노드 트리(DOM) |
| 2. CSSOM 생성 | CSS | 스타일 규칙 트리(CSSOM) |
| 3. 렌더 트리 생성 | DOM + CSSOM | 화면에 보일 노드와 계산된 스타일 |
| 4. 레이아웃 | 렌더 트리 + 뷰포트 크기 | 각 노드의 위치와 크기 |
| 5. 페인팅 | 레이아웃 결과 | 레이어별 그리기 명령·픽셀 |
| 6. 합성(composite) | 레이어들 | 레이어를 순서대로 겹친 최종 화면 |

## 브라우저의 구성 요소

| 구성 요소 | 하는 일 |
| --- | --- |
| 사용자 인터페이스 | 주소창, 뒤로·앞으로 가기, 북마크처럼 페이지 영역 밖의 모든 UI |
| 브라우저 엔진 | UI와 렌더링 엔진 사이에서 명령을 중개한다 (새로고침 버튼 → 다시 불러오기) |
| 렌더링 엔진 | HTML·CSS를 파싱해 화면에 그린다. 이 노트의 주제 |
| 네트워킹 | HTTP 요청 등 외부 자원을 가져온다 |
| JavaScript 엔진 | JS를 해석·실행한다. 자세한 내용은 [[js-engine-v8\|JS 엔진과 V8 파이프라인]] |
| UI 백엔드 | `<select>`, `alert` 같은 기본 위젯을 OS의 그리기 기능으로 그린다 |
| 자료 저장소 | 쿠키, localStorage·sessionStorage, IndexedDB 같은 로컬 저장 공간 |

| 브라우저 | 렌더링 엔진 | JS 엔진 |
| --- | --- | --- |
| Chrome, Edge, Opera, Samsung Internet | Blink | V8 |
| Safari | WebKit | JavaScriptCore |
| Firefox | Gecko | SpiderMonkey |

Edge는 2020년 자체 엔진(EdgeHTML)을 버리고 Chromium 기반으로 바뀌었고, Trident를 쓰던 Internet Explorer는 2022년 지원이 끝났다. Chrome은 탭(사이트)마다 **렌더러 프로세스**를 따로 띄우고, 그 안의 **메인 스레드 하나**가 JS 실행·스타일 계산·레이아웃·페인트를 모두 맡는다. 그래서 긴 JS 작업은 렌더링을 멈춘다. 메인 스레드가 일을 고르는 방식은 [[event-loop|이벤트 루프]]에 있다.

## 렌더링 전: 내비게이션

렌더링은 HTML이 도착해야 시작한다. 주소창 입력이나 링크 클릭이 만든 **내비게이션**은 네트워크에 나가기 전에 HSTS 목록, 서비스 워커, HTTP 캐시, 열린 연결을 차례로 확인하고, 응답이 HTML이면 파싱을 시작한다. 이 과정과 DNS·TCP·TLS는 [[url-to-page|브라우저에 URL을 입력하면 일어나는 일]]에, 서비스 워커 캐시 전략은 [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]]에 있다.

HTML 파서가 일하는 동안 **프리로드 스캐너**(예측 파싱, speculative parsing)가 문서 속 이미지·CSS·JS URL을 미리 찾아 다운로드를 시작한다. DOM은 건드리지 않고 자원 요청만 앞당긴다. 그래서 `<img>`의 `srcset`·`sizes`처럼 마크업에 정보를 적어 두는 것이 중요하다.

## 1. DOM 생성

HTML은 네 단계를 거쳐 [[dom|DOM]] 트리가 된다.

| 단계 | 하는 일 |
| --- | --- |
| 바이트 → 문자 | 네트워크·디스크에서 받은 원시 바이트를 지정된 인코딩(UTF-8 등)으로 해석한다 |
| 토큰화 | 상태 기계(state machine)인 토크나이저가 문자를 하나씩 읽으며 시작 태그·종료 태그·텍스트 토큰을 만든다 |
| 객체화 | 토큰을 속성을 가진 노드 객체로 만든다 |
| 트리 구성 | 태그의 포함 관계에 따라 부모-자식 트리로 엮는다 |

### HTML 파서가 일반 파서와 다른 점

대부분의 프로그래밍 언어와 CSS는 **문맥 자유 문법(context-free grammar)** 이라 파서 생성기로 만든 일반 파서로 처리된다. HTML은 그렇지 않다. 그래서 HTML 표준(WHATWG HTML Living Standard)이 토큰화와 트리 구축 알고리즘을 직접 정의한다. 과거 HTML4는 DTD로 문법을 정의했다.

| 특성 | 의미 |
| --- | --- |
| 오류에 관대함 | 문법 오류로 멈추지 않는다. 빠진 태그를 채우고, 닫히지 않은 태그를 닫고, `</br>`을 `<br>`로 고친다. 고치는 방법까지 표준에 정해져 있어 브라우저마다 결과가 같다 |
| 재진입(reentrant) | 파싱 도중 실행된 스크립트가 `document.write`로 입력 스트림에 마크업을 끼워 넣을 수 있다 |
| 점진적 | 받은 부분부터 바로 파싱하고, 화면에도 먼저 그릴 수 있다 |

```html
<!-- 작성한 코드 -->
<body>
<p class=highlight>Front-end Developer
<span>Zero

<!-- 파서가 만든 구조 -->
<html>
  <head></head>
  <body>
    <p class="highlight">Front-end Developer <span>Zero</span></p>
  </body>
</html>
```

### 외부 자원과 파싱 차단

| 자원 | 파싱 중 만나면 |
| --- | --- |
| 이미지 등 | 요청만 보내고 파싱을 계속한다 |
| CSS (`<link rel="stylesheet">`) | 파싱은 계속하지만 **렌더링을 막는다(render-blocking)**. 뒤따르는 동기 스크립트도 CSSOM이 완성될 때까지 실행을 기다린다 |
| `<script>` (속성 없음) | **파싱을 멈추고** 스크립트를 받아 실행한 뒤 이어서 파싱한다 |
| `<script async>` / `<script defer>` | 받는 동안 파싱을 계속한다. async는 받는 즉시, defer는 파싱이 끝난 뒤 실행(`type="module"`은 기본이 defer). 배치 원칙은 [[script-loading\|스크립트 로딩 순서]] |

스크립트가 파싱을 막는 이유는 스크립트가 `document.write` 등으로 DOM 자체를 바꿀 수 있기 때문이다. 스크립트가 CSS를 기다리는 이유는 `getComputedStyle`처럼 스타일을 읽는 코드가 덜 만들어진 CSSOM에서 틀린 값을 받지 않게 하려는 것이다.

### 첫 렌더링이 기다리는 자원

중요 렌더링 경로는 **전체 렌더링이 아니라 첫 렌더링**에 필요한 최소한의 자원이다. 너무 일찍 그리면 깨진 화면이 크게 바뀌고, 다 기다리면 사용자가 필요 이상으로 기다린다. 렌더링 차단은 그 사이의 균형점이다.

| 첫 렌더링이 기다린다 | 기다리지 않는다 |
| --- | --- |
| HTML의 앞부분(스트리밍으로 받은 만큼) | HTML 전체 |
| `<head>`의 렌더링 차단 CSS(`<style>`, `<link rel="stylesheet">`) | `media`가 지금 조건과 맞지 않는 CSS(`media="print"` 등) |
| `<head>`의 파서 차단 스크립트(`async`·`defer`·`type="module"`이 없는 것) | 폰트, 이미지 |
| | `<body>` 끝의 스크립트, `<head>` 밖의 CSS |

- **CSS는 곧 중요 경로다.** HTML 다음으로 첫 화면이 반드시 기다리는 자원이 CSS이므로, 작게 줄이고 같은 출처에서 한 파일로 일찍 보내거나 첫 화면용만 인라인한다. `media`가 맞지 않는 스타일 시트(`print`, `(min-width: 4000px)`)도 **내려받기는 한다.** 다만 지금 브라우저는 가장 낮은 우선순위로 받고 렌더링을 막지 않는다. 과거에는 이런 스타일 시트까지 렌더링을 막는 브라우저가 많았다.
- 폰트·이미지는 나중의 다시 그리기에서 채워진다. 그래서 글자가 잠깐 숨거나 빈자리가 생기고, 크기를 잡아 두지 않으면 레이아웃 이동(CLS)이 생긴다([[cls-optimization|CLS 최적화]]).
- `<head>`는 메타데이터만 담으므로 거기서 막히면 페이지 전체가 막힌다. `<body>` 중간의 차단 자원은 현재 Chromium·Firefox에서 그 **아래쪽 콘텐츠**만 막는다.
- `blocking="render"` 속성을 `<link>`·`<script>`·`<style>`에 주면 파싱은 계속하되 처리될 때까지 렌더링을 막는다(Chromium 계열).
- 첫 페인트만 보면 이미지 문제가 안 보인다. 주요 콘텐츠가 그려질 때(LCP)까지를 경로로 보는 관점은 [[lcp-optimization|LCP 최적화]]에 있다.

| 도구 | 보여 주는 것 |
| --- | --- |
| WebPageTest 워터폴 | 렌더링 차단 자원에 주황색 표시, 렌더링 시작 시점에 진한 초록 세로선 |
| Lighthouse 「렌더링 차단 리소스 제거」 | 실제로 렌더링을 늦춘 자원만 꼽는다 |
| Lighthouse 「중요 요청 체인」 | 중첩된 중요 자원과 체인별 누적 지연. 폰트처럼 차단은 아니지만 우선순위가 높은 자원도 포함한다 |

## 2. CSSOM 생성

파싱 중 발견한 CSS도 비슷한 과정을 거쳐 CSSOM(CSS Object Model)이 된다. DOM 생성과는 **독립적으로** 진행된다.

- 브라우저 기본 스타일(User Agent Stylesheet)과 작성한 CSS를 함께 반영한다.
- 일반적인 규칙(`body`)에서 구체적인 규칙(`body p span`)으로 내려가며 스타일을 덧씌운다. 그래서 트리 구조다.
- HTML과 달리 **파일을 끝까지 받아야** 쓸 수 있다. 뒤쪽 규칙이 앞쪽 규칙을 덮어쓸 수 있기 때문이다. CSS가 렌더링을 막는 이유가 이것이다.
- 규칙이 겹칠 때 무엇이 이기는지는 출처·중요도 → 특정도(specificity) → 선언 순서로 정한다. 자세한 규칙은 [[selectors|CSS 선택자와 우선순위]]에 있다.

## 3. 렌더 트리 생성

DOM과 CSSOM을 합쳐 **화면에 실제로 그릴 것만** 담은 렌더 트리를 만든다. Gecko에서는 프레임 트리라고 부른다.

1. DOM 루트부터 노드를 순회한다.
2. 보이지 않는 노드는 뺀다: `<script>`, `<meta>`, `display: none`인 요소 등.
3. 남은 노드마다 [캐스케이드](https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade)로 결정된 스타일을 붙인다.

그래서 **DOM 트리와 렌더 트리는 1:1로 대응하지 않는다.** `visibility: hidden`은 공간을 차지하므로 렌더 트리에 남는다는 점이 `display: none`과 다르다. 반대로 `<select>`처럼 노드 하나가 렌더 객체 여러 개가 되기도 한다.

스타일 계산은 요소마다 모든 규칙을 맞춰 봐야 해서 비싸다. 엔진은 같은 스타일을 받는 형제 요소끼리 계산 결과를 공유하고, 선택자를 맨 오른쪽 부분(키 선택자)으로 분류해 둬 맞춰 볼 규칙 수를 줄인다.

## 4. 레이아웃 (리플로우)

렌더 트리에는 스타일만 있고, 뷰포트 안에서 **어디에 얼마나 크게** 놓일지는 아직 없다. 이것을 계산하는 단계가 레이아웃이고, 다시 일어날 때는 리플로우(reflow)라고 부른다. 루트에서 시작해 재귀적으로 내려가며, 부모가 자식의 너비를 정하고 자식의 높이를 모아 자기 높이를 정한다.

| 종류 | 언제 | 범위 |
| --- | --- | --- |
| 전역 레이아웃 | 글꼴 크기 등 전역 스타일 변경, 뷰포트 크기 변경 | 렌더 트리 전체를 다시 순회 |
| 증분 레이아웃 | 그 밖의 스타일 변경 | 바뀐 노드만, 비동기로 |

증분 레이아웃은 **더티 비트(dirty bit)** 로 동작한다. 바뀐 노드와 그 조상에 "다시 계산해야 함" 표시만 해 두고, 스케줄러가 나중에 표시된 노드들을 **한꺼번에** 계산한다. 그래서 스크립트가 스타일을 여러 번 바꿔도 레이아웃은 보통 한 번만 일어난다.

### 강제 동기 레이아웃

이 일괄 처리를 깨는 것이 **레이아웃 값 읽기**다. 더티 표시가 남은 상태에서 `offsetHeight`, `clientWidth`, `getBoundingClientRect()` 같은 값을 읽으면, 브라우저는 정확한 값을 주려고 그 자리에서 레이아웃을 강제로 수행한다. 읽기와 쓰기를 번갈아 하면 매번 레이아웃이 일어난다(레이아웃 스래싱, layout thrashing). `offset*`·`client*`·`scroll*` 계열 속성, `getBoundingClientRect()`, `getComputedStyle()`, `scrollTo()`·`scrollIntoView()`, `elementFromPoint()`가 모두 여기에 해당한다. 각 값이 무엇을 재는지는 [[dom-geometry|요소 크기·스크롤·좌표]]에 있다.

```js
// 나쁨: 쓰기 뒤에 읽기 → 두 번째 읽기에서 강제 레이아웃
const width = div1.clientWidth;
div2.style.width = `${width}px`;
const height = div1.clientHeight;
div2.style.height = `${height}px`;

// 좋음: 읽기를 모으고, 쓰기를 모은다
const w = div1.clientWidth;
const h = div1.clientHeight;
div2.style.width = `${w}px`;
div2.style.height = `${h}px`;
```

DevTools Performance 패널에서는 보라색 Layout 이벤트에 강제 리플로우 경고가 붙고, 렌더링 탭의 페인트 플래싱·레이어 테두리로 다시 칠하는 영역과 레이어를 화면에서 볼 수 있다. 절차는 [[devtools-performance|DevTools로 성능·메모리 분석하기]]에 있다.

### 범위를 가두는 containment

레이아웃은 기본적으로 **문서 전체가 범위**다. 한 요소의 `left`만 바꿔도 이론상 DOM의 모든 요소를 다시 확인해야 할 수 있다. CSS `contain` 속성은 「이 요소 안의 변화는 밖에 영향을 주지 않는다」고 브라우저에 약속해 스타일·레이아웃·페인트 작업의 범위를 그 요소 하위 트리로 줄인다. 2022년부터 모든 주요 브라우저에서 쓸 수 있다(Baseline).

| 값 | 약속 | 부수 효과·주의 |
| --- | --- | --- |
| `layout` | 안의 레이아웃이 밖에 영향을 주지 않고, 밖도 안에 영향을 주지 않는다 | 독립된 서식 맥락, 쌓임 맥락, `absolute`·`fixed` 자식의 기준 박스가 된다 |
| `paint` | 자손이 박스 밖에 그려지지 않는다. 화면 밖이면 자손도 칠할 필요가 없다 | 박스 밖으로 넘친 부분이 잘린다. `layout`과 같은 부수 효과 |
| `size` | 자식을 보지 않고 크기를 정한다 | 크기를 지정하지 않으면 0×0이 된다 |
| `inline-size` | 인라인 방향 크기만 자식과 분리 | 컨테이너 쿼리(`container-type: inline-size`)가 내부적으로 쓴다 |
| `style` | 카운터·`quotes`처럼 하위 트리 밖까지 번지는 효과를 가둔다 | Shadow DOM 같은 스타일 격리가 아니다 |
| `content` | `layout paint style` | 크기를 몰라도 쓸 수 있어 기본으로 고르는 값 |
| `strict` | `size layout paint style` | 크기를 알 때만 |

`content-visibility: auto`는 여기에 「화면 밖이면 렌더링 자체를 건너뛴다」를 더한 속성이다. 건너뛴 영역의 높이는 `contain-intrinsic-size: auto 500px`처럼 추정치로 잡아 스크롤바가 튀지 않게 한다. 쓰는 법은 [[inp-optimization|INP 최적화]]에 있다.

## 5. 페인팅

레이아웃 결과를 바탕으로 노드를 실제 픽셀로 그린다. 페인팅도 전역·증분이 있고, 증분 페인팅은 바뀐 영역만 다시 그린다. 단색보다 그림자·흐림 효과가 그리기 비용이 크다.

한 블록은 CSS 명세가 정한 순서로 칠해진다.

```text
background-color → background-image → border → 자식 → outline
```

그래서 큰 배경 이미지를 지정하면 이미지가 도착하기 전까지 배경색이 먼저 보인다. 요소 사이의 순서는 `z-index`가 만드는 쌓임 맥락(stacking context)을 따라 낮은 것부터 그린다. 쌓임 맥락은 [[how-css-works|CSS가 동작하는 방식]]에 있다.

## 6. 합성

브라우저는 페이지를 여러 **레이어**로 나눠 그린 뒤, 컴포지터 스레드(대개 GPU)에서 순서대로 겹쳐 최종 화면을 만든다. `transform`·`opacity`만 바꾸는 애니메이션은 레이아웃과 페인팅을 건너뛰고 합성만 다시 하므로 메인 스레드가 바빠도 부드럽다. `will-change: transform`으로 레이어 분리를 미리 알릴 수 있지만, 레이어마다 메모리를 쓰므로 필요한 요소에만 쓴다.

## 변경이 다시 도는 단계

브라우저는 변경에 대해 가능한 한 적은 단계만 다시 수행한다. 최적화는 세 가지다: **단계를 통째로 건너뛰기**(어떤 선택자도 `data-rating` 속성을 보지 않으면 그 속성을 바꿔도 스타일 계산조차 하지 않는다), **단계의 일부만 하기**(바뀐 하위 트리만), **변경 모으기**(다시 그릴 때나 스크립트가 값을 물을 때까지 미룬다). 어떤 최적화를 하는지는 엔진과 버전마다 다르다. 속성별 비용은 대략 `width`·`height`·`margin`·`padding`·`border-width`·`font-*`·`line-height`는 레이아웃, `color`·`background-*`·`border-color`는 페인트다.

| 변경 | 다시 도는 단계 |
| --- | --- |
| 색·배경·그림자 | 페인팅 → 합성 (해당 요소만) |
| `:hover`로 배경색만 바꿈 | 히트 테스트(hit testing)로 포인터 아래 박스를 찾고 → 그 박스의 스타일 재계산 → 레이아웃은 건너뛰고 페인팅 → 합성 |
| 크기·위치·여백, 텍스트 내용 | 레이아웃 → 페인팅 → 합성 (요소와 자식, 영향받는 형제) |
| DOM 노드 추가·삭제 | 그 노드 주변의 레이아웃과 페인팅 |
| `html`의 글꼴 크기, 뷰포트 크기 | 캐시를 버리고 트리 전체를 레이아웃·페인팅 |
| `display`, `position`, `float`·`transform`을 `none`과 다른 값 사이로 바꿈 | 렌더 트리(박스) 재구성부터 전부 |
| `transform`·`opacity` | 합성만 |

화면은 디스플레이 주사율에 맞춰 갱신된다. 60Hz면 프레임당 약 16.7ms 안에 JS, 스타일, 레이아웃, 페인트를 모두 끝내야 끊김이 없다. 시각적 변경은 `requestAnimationFrame` 안에서 하면 다음 프레임 직전에 모아 처리된다. React·Vue의 **가상 DOM**은 변경을 메모리에서 먼저 비교해 바뀐 부분만 한 번에 DOM에 적용한다. DOM 변경을 직접 모아 실행하는 일을 자동화한 것이다. Svelte·Solid는 컴파일러와 시그널로 바뀐 노드만 직접 갱신한다.

## 정리

- 브라우저는 UI·브라우저 엔진·렌더링 엔진·네트워킹·JS 엔진·UI 백엔드·저장소로 나뉜다. 렌더링과 JS는 같은 메인 스레드를 쓴다.
- HTML → DOM, CSS → CSSOM, 둘을 합쳐 렌더 트리 → 레이아웃 → 페인팅 → 합성. 위치·크기가 바뀌면 레이아웃부터, 색만 바뀌면 페인팅부터, `transform`·`opacity`만 바뀌면 합성만 다시 한다.
- HTML 파서는 오류를 표준대로 고치며 점진적으로 파싱한다. CSS는 끝까지 받아야 해서 렌더링을 막고, 속성 없는 `<script>`는 파싱을 막는다.
- 브라우저는 더티 비트로 레이아웃을 모아 처리한다. **레이아웃 값 읽기와 스타일 쓰기를 섞지 않는 것**이 이 최적화를 살리는 방법이다.

관련 노트: [[dom|DOM]], [[html|HTML]], [[event-loop|이벤트 루프]], [[js-engine-v8|JS 엔진과 V8 파이프라인]], [[spa-csr-ssr|SPA와 CSR·SSR]], [[frontend-latency-numbers|프론트엔드 개발자가 알아야 할 지연 시간 숫자]], [[re-rendering|리렌더링 원인 추적하기]], [[web-vitals|웹 성능 지표와 Lighthouse]], [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]], [[how-css-works|CSS가 동작하는 방식: 핵심 개념과 픽셀이 되기까지]], [[devtools-performance|DevTools로 성능·메모리 분석하기]], [[script-loading|스크립트·스타일 로딩 순서와 점진적 렌더링]], [[lcp-optimization|LCP 최적화]], [[inp-optimization|INP 최적화]], [[dom-geometry|요소 크기·스크롤·좌표]], [[browser-architecture|브라우저 아키텍처]]
