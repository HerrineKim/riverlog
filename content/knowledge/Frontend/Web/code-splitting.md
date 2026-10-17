---
title: "자바스크립트 코드 분할"
concept: "Code Splitting"
summary: "시작할 때 받는 JS가 크면 파싱·컴파일·실행 동안 메인 스레드가 막혀 TBT와 INP가 나빠진다. 커버리지로 시작 때 안 쓰는 코드를 찾고, 동적 import()로 나중에 필요한 코드를 별도 청크로 떼어 상호작용할 때 불러온다. 청크 크기는 캐시·압축·평가 시간의 균형으로 정한다."
tags: ["performance", "javascript", "frontend", "web", "build"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/performance/code-split-javascript"]
---

> web.dev의 「[Learn Performance](https://web.dev/learn/performance)」 강좌 중 「Code-split JavaScript」 모듈을 바탕으로 재구성한 노트다. `import()` 문법은 [[es-modules|모듈: export와 import]]에, 번들러 일반은 [[bundlers-and-vite|번들러의 역사와 Vite]]에 있다.

## 왜 나누나

브라우저가 JS를 받고, 파싱하고, 컴파일하고, 실행하는 동안 **메인 스레드는 다른 일을 못 한다.** 화면이 보여도 누르면 반응이 없다. 사용자는 로딩 중에 자주 누르기 때문에 이 시간이 그대로 INP의 입력 지연이 된다. 로딩 중 메인 스레드 차단을 재는 TBT가 INP와 상관이 높은 이유다.

- Lighthouse는 JS 실행 시간이 2초를 넘으면 경고하고, 3.5초를 넘으면 실패로 본다.
- 파싱 비용의 감각: 고급 휴대폰에서도 JS 1MB 파싱에 150ms 정도 든다([[frontend-latency-numbers|지연 시간 숫자]]).

## 무엇을 떼어 낼까

| 도구 | 보는 것 |
| --- | --- |
| Lighthouse 「JavaScript 실행 시간 줄이기」 | 스크립트별 실행 시간. 큰 것부터 후보 |
| DevTools 커버리지(Coverage) | 페이지 로드 중 **실제로 실행되지 않은** 코드 비율([[devtools-performance\|DevTools로 성능 분석하기]]) |

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

- 상호작용 뒤에 받으면 첫 클릭이 그만큼 느려진다. 곧 쓸 게 확실하면 유휴 시간에 미리 받아 둔다(`<link rel="modulepreload">`, 호버 시 `import()` 시작, [[resource-hints|prefetch]]).
- 라우트 단위 분할은 대부분의 프레임워크 라우터가 기본으로 한다. 그 다음 후보는 모달·에디터·차트처럼 **누른 뒤에만 쓰는 큰 기능**이다.

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

## 정리

- 시작 때 받는 JS는 그만큼 메인 스레드를 막는다. 커버리지로 안 쓰는 코드부터 찾는다.
- 나중에 필요한 코드는 동적 `import()`로 떼어 내고, 번들러가 별도 청크로 만든다.
- 상호작용 뒤 받는 코드는 첫 클릭을 늦추니, 확실하면 미리 받아 둔다.
- 청크 크기는 캐시·압축·평가 시간의 균형이다. 너무 크지도, 너무 잘지도 않게.

관련 노트: [[es-modules|모듈: export와 import]], [[bundlers-and-vite|번들러의 역사와 Vite]], [[inp-optimization|INP 최적화]], [[responsible-javascript|책임감 있는 자바스크립트]], [[web-vitals|웹 성능 지표와 Lighthouse]]
