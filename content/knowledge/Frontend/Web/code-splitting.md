---
title: "자바스크립트 코드 분할"
concept: "Code Splitting"
summary: "시작할 때 받는 JS가 크면 파싱·컴파일·실행 동안 메인 스레드가 막혀 TBT와 INP가 나빠진다. 커버리지로 시작 때 안 쓰는 코드를 찾고, 동적 import()로 나중에 필요한 코드를 별도 청크로 떼어 상호작용할 때 불러온다. 청크 크기는 캐시·압축·평가 시간의 균형으로 정한다. 로딩 전략 전체는 PRPL(Preload·Render·Pre-cache·Lazy load)로 묶는다."
tags: ["performance", "javascript", "frontend", "web", "build"]
source: other
date: "2026-10-21"
sources: ["https://web.dev/learn/performance/code-split-javascript", "https://developers.google.com/web/fundamentals/performance/prpl-pattern/", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EC%84%B1%EB%8A%A5%20%EC%B5%9C%EC%A0%81%ED%99%94/code%20splitting%2C%20Lazy%20loading.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EC%84%B1%EB%8A%A5%20%EC%B5%9C%EC%A0%81%ED%99%94/%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%20Preloading.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EC%84%B1%EB%8A%A5%20%EC%B5%9C%EC%A0%81%ED%99%94/webpack%20bundle%20analyzer%2C%20cra-bundle-analyzer.md"]
---

> web.dev의 「[Learn Performance](https://web.dev/learn/performance)」 강좌 중 「Code-split JavaScript」 모듈을 바탕으로 재구성하고, 「[Apply instant loading with the PRPL pattern](https://web.dev/articles/apply-instant-loading-with-prpl)」으로 PRPL을 보강한 노트다. 번들 분석 도구와 분할한 컴포넌트를 미리 받는 시점은 「[Frontend_TIL: 컴포넌트 Preloading](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EC%84%B1%EB%8A%A5%20%EC%B5%9C%EC%A0%81%ED%99%94/%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%20Preloading.md)」 등을 바탕으로 보강했다. `import()` 문법은 [[es-modules|모듈: export와 import]]에, 번들러 일반은 [[bundlers-and-vite|번들러의 역사와 Vite]]에 있다.

## 왜 나누나

브라우저가 JS를 받고, 파싱하고, 컴파일하고, 실행하는 동안 **메인 스레드는 다른 일을 못 한다.** 화면이 보여도 누르면 반응이 없다. 사용자는 로딩 중에 자주 누르기 때문에 이 시간이 그대로 INP의 입력 지연이 된다. 로딩 중 메인 스레드 차단을 재는 TBT가 INP와 상관이 높은 이유다.

- Lighthouse는 JS 실행 시간이 2초를 넘으면 경고하고, 3.5초를 넘으면 실패로 본다.
- 파싱 비용의 감각: 고급 휴대폰에서도 JS 1MB 파싱에 150ms 정도 든다([[frontend-latency-numbers|지연 시간 숫자]]).

## 무엇을 떼어 낼까

| 도구 | 보는 것 |
| --- | --- |
| Lighthouse 「JavaScript 실행 시간 줄이기」 | 스크립트별 실행 시간. 큰 것부터 후보 |
| DevTools 커버리지(Coverage) | 페이지 로드 중 **실제로 실행되지 않은** 코드 비율([[devtools-performance\|DevTools로 성능 분석하기]]) |
| 번들 분석기(`webpack-bundle-analyzer`, Vite·Rollup은 `rollup-plugin-visualizer`) | 번들 안 모듈별 크기를 면적 지도(treemap)로 보여 준다. 가장 큰 의존성, 실수로 들어간 모듈, 여러 청크에 중복된 모듈을 찾는다 |

코드 분할은 번들을 둘로 나누는 일이다.

```text
시작에 꼭 필요한 JS   → 첫 번들 (미룰 수 없다)
나머지 JS            → 별도 청크, 필요할 때 (대개 사용자 상호작용 뒤)
```

## 동적 import()로 나누기

`<script>`는 시작할 때 요청된다. 정적 `import`는 부모 모듈이 실행되기 전에 의존 모듈을 모두 받고 실행한다. **동적 `import()`는 그 줄이 실행될 때 비로소 요청한다.**

```js
// 폼 검증 코드는 사용자가 처음 입력란을 벗어날 때 받는다
document.querySelectorAll('#myForm input').forEach((input) => {
  input.addEventListener('blur', async () => {
    const { validateForm } = await import('/validate-form.mjs')
    validateForm()
  }, { once: true })
})
```

| 번들러 | 동적 `import()`를 만나면 |
| --- | --- |
| webpack, Rollup, Parcel, Vite | 자동으로 별도 청크를 만든다 |
| esbuild | `splitting` 옵션을 켜야 한다(ESM 출력에서) |
| React `lazy()` | 안에서 동적 `import()`를 쓴다. 나누는 일은 여전히 번들러가 한다 |

```jsx
const Chart = lazy(() => import('./Chart'))
// <Suspense fallback={<Spinner />}><Chart /></Suspense>
```

`lazy`는 모듈의 **default export**만 컴포넌트로 받는다. named export라면 `lazy(() => import('./charts').then((m) => ({ default: m.LineChart })))`처럼 default로 바꿔 넘기거나, 다시 내보내는 작은 모듈을 둔다.

- 라우트 단위 분할은 대부분의 프레임워크 라우터가 기본으로 한다. 그 다음 후보는 모달·에디터·차트처럼 **누른 뒤에만 쓰는 큰 기능**이다.

### 미리 받기: 나눈 청크의 첫 클릭 비용

나눈 청크는 필요할 때 **받기(네트워크) → 평가(메인 스레드) → 실행**을 거친다. 첫 화면은 빨라지지만 그 기능을 처음 쓰는 순간 앞의 두 단계만큼 늦다. 곧 쓸 게 확실하면 실행 직전까지 미리 해 둔다. 같은 `import()`를 다시 부르면 모듈 캐시에서 바로 돌려주므로, 미리 한 번 불러 두기만 하면 된다.

| 시점 | 방법 | 맞는 경우 |
| --- | --- | --- |
| 버튼에 마우스를 올릴 때 | `onMouseEnter`·`onFocus`에서 `import()` 시작. 올리고 누르기까지 보통 수백 ms가 걸려 그동안 받는다 | 청크가 작아 그 사이에 받아지는 경우 |
| 첫 화면을 다 그린 뒤 | `useEffect`나 `requestIdleCallback`에서 `import()` | 청크가 커서 호버 시간으로는 모자란 경우 |
| 브라우저에 맡김 | `<link rel="modulepreload">`, [[resource-hints\|prefetch·Speculation Rules]] | 다음 페이지 이동, 프레임워크 라우터의 링크 미리 받기 |

```jsx
// lazy 컴포넌트에 preload를 붙이는 팩토리
function lazyWithPreload(factory) {
  const Component = lazy(factory)
  Component.preload = factory
  return Component
}

const ImageModal = lazyWithPreload(() => import('./ImageModal'))

<button onMouseEnter={ImageModal.preload} onClick={() => setOpen(true)}>사진 보기</button>
```

`react-lazy-with-preload` 패키지가 같은 모양을 제공한다. Next.js `<Link>`·React Router의 `prefetch` 옵션처럼 라우터가 화면 진입·호버 때 자동으로 해 주는 경우가 많다.

## 청크를 얼마나 잘게

| 큰 청크 | 작은 청크 |
| --- | --- |
| 압축이 잘 된다 | 압축률이 떨어진다 |
| 한 줄만 바뀌어도 통째로 캐시가 깨진다 | 바뀐 파일만 다시 받는다. 재방문에 유리 |
| 요청 수가 적다 | 캐시가 빈 첫 방문에 요청과 왕복이 늘 수 있다 |
| 한 번에 평가하느라 긴 작업이 생긴다 | 평가가 나뉘어 메인 스레드를 덜 막는다 |

정답은 없고 **캐시, 압축, 평가 시간의 균형**이다. 번들러는 이 균형을 맞추는 도구이기도 하다. 번들 없이 모듈 수백 개를 그대로 보내면 모듈마다 요청이 생겨 큰 모듈 트리에서 상호작용 가능 시점이 늦어진다. `modulepreload`로 트리를 일찍 받을 수는 있지만 로딩 성능은 번들 쪽이 낫다.

### webpack의 SplitChunksPlugin

| `chunks` | 대상 |
| --- | --- |
| `async`(기본) | 동적 `import()`로 불러오는 청크 |
| `initial` | 정적 `import`와 진입점 |
| `all` | 둘 다. 비동기·초기 청크가 모듈을 공유할 수 있다 |

- 기본 설정에서는 정적으로 가져온 모듈은 초기 청크에, 동적으로 가져온 모듈은 비동기 청크에 들어가고, 비동기 청크는 조건이 맞을 때만 받는다.
- `chunks: 'initial'`로 바꾸면 미루려던 코드가 시작 번들에 합쳐져 첫 로딩이 나빠진다.
- `maxSize`로 큰 청크를 더 쪼개면 평가가 나뉘어 긴 작업이 준다.
- `splitChunks: false`로 끄면 공유 모듈이 여러 청크에 **중복**으로 들어간다.

## PRPL 패턴

코드 분할을 로딩 전략 전체로 넓힌 이름이 **PRPL**이다. 네 단계는 서로 독립적으로도 쓸 수 있다.

| 글자 | 할 일 | 수단 |
| --- | --- | --- |
| **P**reload | 늦게 발견되는 핵심 리소스를 미리 요청 | `<link rel="preload" as="image" href="hero.jpg">`. CSS `background-image`처럼 프리로드 스캐너가 못 찾는 것에 쓴다. 우선순위는 `fetchpriority`로 따로 올린다(→ [[resource-hints\|리소스 힌트와 미리 불러오기]]) |
| **R**ender | 첫 경로를 최대한 빨리 그림 | 핵심 CSS·JS 인라인과 나머지 `async`·`defer`, 또는 서버 렌더링. 인라인은 따로 캐시되지 않고, SSR은 HTML이 커져 상호작용이 늦어질 수 있어 득실을 잰다 |
| **P**re-cache | 나머지 자산을 서비스 워커로 미리 캐시 | Workbox 프리캐시. 재방문이 빨라지고 오프라인에서도 뜬다(→ [[service-worker-caching\|서비스 워커 캐싱과 응답 전략]]) |
| **L**azy load | 다른 경로와 급하지 않은 자산을 나중에 | 경로별 동적 `import()`, 이미지 `loading="lazy"` |

2016년 Polymer 팀이 처음 낸 PRPL의 첫 P는 **Push**(HTTP/2 서버 푸시)였다. 서버 푸시는 이미 캐시된 리소스까지 밀어 넣는 문제로 거의 쓰이지 않았고 Chrome 106에서 제거됐다. 그래서 지금은 Preload로 읽는다. 서버가 먼저 힌트를 주고 싶으면 `103 Early Hints`를 쓴다.

## 정리

- 시작 때 받는 JS는 그만큼 메인 스레드를 막는다. 커버리지로 안 쓰는 코드부터 찾는다.
- 나중에 필요한 코드는 동적 `import()`로 떼어 내고, 번들러가 별도 청크로 만든다.
- 상호작용 뒤 받는 코드는 첫 클릭을 늦추니, 확실하면 미리 받아 둔다.
- 청크 크기는 캐시·압축·평가 시간의 균형이다. 너무 크지도, 너무 잘지도 않게.

관련 노트: [[es-modules|모듈: export와 import]], [[bundlers-and-vite|번들러의 역사와 Vite]], [[inp-optimization|INP 최적화]], [[responsible-javascript|책임감 있는 자바스크립트]], [[web-vitals|웹 성능 지표와 Lighthouse]]
