---
title: "webpack 동작 원리"
concept: "webpack"
summary: "webpack은 진입점에서 import를 정적으로 따라가 의존성 그래프를 만들고, 로더로 파일을 모듈로 바꾸고, 플러그인으로 빌드에 개입해 번들을 만든다. 로더 적용 순서, 빌드 시 코드 주입 플러그인(Define·Environment·Provide·Ignore), 모듈이 아닌 옛 코드를 다루는 shimming, 스코프 호이스팅, HMR의 동작, Rollup과의 차이를 정리한다."
tags: ["javascript", "webpack", "bundler", "build", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://webpack.js.org/concepts/", "https://survivejs.com/webpack/what-is-webpack/", "https://webpack.js.org/guides/shimming/", "https://webpack.js.org/loaders/exports-loader/", "https://webpack.js.org/plugins/define-plugin/", "https://webpack.js.org/plugins/environment-plugin/", "https://webpack.js.org/plugins/provide-plugin/", "https://webpack.js.org/plugins/ignore-plugin/", "https://webpack.js.org/plugins/watch-ignore-plugin/", "https://webpack.js.org/plugins/module-concatenation-plugin/", "https://webpack.js.org/concepts/hot-module-replacement/", "https://webpack.js.org/guides/hot-module-replacement/", "https://medium.com/webpack/webpack-and-rollup-the-same-but-different-a41ad427058c"]
---

> webpack 공식 문서의 「[Concepts](https://webpack.js.org/concepts/)」·「[Shimming](https://webpack.js.org/guides/shimming/)」·「[ModuleConcatenationPlugin](https://webpack.js.org/plugins/module-concatenation-plugin/)」·「[Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/)」과 SurviveJS의 「[What is Webpack](https://survivejs.com/webpack/what-is-webpack/)」을 바탕으로 재구성하고, Rollup과의 비교는 「[Webpack and Rollup: the same but different](https://medium.com/webpack/webpack-and-rollup-the-same-but-different-a41ad427058c)」(2017.04)에서 뼈대를 빌려 지금 기준으로 고쳐 썼다.

## webpack이란

webpack은 **정적 모듈 번들러**다. 진입점(entry)에서 시작해 `import`·`require`를 **실행하지 않고 정적으로** 따라가며 의존성 그래프(directed graph)를 만들고, 그래프의 모듈을 하나 이상의 번들로 묶는다. JavaScript만이 아니라 CSS, 이미지, 폰트도 그래프의 노드로 다룬다.

- 번들러가 왜 생겼는지, 계보와 Vite로의 흐름은 [[bundlers-and-vite|번들러의 역사와 Vite]]에 있다. 여기서는 webpack 자체의 동작을 다룬다.
- 설정 파일 없이도 돈다(4.0부터). 기본 entry는 `./src/index.js`, 기본 output은 `./dist/main.js`다.
- 지금 판은 **webpack 5**다. 최신 5.x는 CSS와 HTML을 내장 지원해 로더 없이도 이해한다.
- 같은 설정·플러그인 API를 Rust로 다시 구현한 **Rspack**이 있어, 큰 webpack 프로젝트는 설정을 거의 그대로 옮겨 빌드 속도를 얻는다.

## 빌드 과정

```text
entry ─▶ resolve(경로 찾기) ─▶ loader 체인(파일 → 모듈) ─▶ 그래프에 추가 ─▶ (모든 import에 반복)
                                                         │
plugins: 컴파일 단계마다 훅으로 개입 ───────────────────────┤
                                                         ▼
                      chunk로 나누기 ─▶ 최적화(트리 셰이킹·스코프 호이스팅·압축) ─▶ output(번들 + runtime + manifest)
```

| 단계 | 내용 |
| --- | --- |
| 해석(resolve) | `import 'lodash'`를 실제 파일로 찾는다. `resolve.alias`, `resolve.extensions`, 찾을 디렉터리를 설정한다. 못 찾으면 `Module not found`로 멈춘다 |
| 로더(loader) | **파일 단위 변환**이다. `module.rules`의 `test`(파일 패턴)에 맞는 로더를 적용해 JS가 아닌 파일을 모듈로 바꾼다 |
| 플러그인(plugin) | 컴파일러의 이벤트(훅)에 붙어 **번들 전체**에 개입한다. HTML 생성, CSS 추출(`MiniCssExtractPlugin`), 압축, 상수 주입 |
| 청크(chunk) | 번들을 이루는 코드 조각. 동적 `import()`나 `splitChunks` 설정이 분리 지점(split point)이 된다 |
| 출력 | 번들과 함께 모듈을 실행하는 작은 **runtime**, 어떤 청크를 불러올지 적은 **manifest**를 낸다. runtime은 별도 파일로 뺄 수 있다(`optimization.runtimeChunk`) |

**로더는 아래에서 위로, 오른쪽에서 왼쪽으로 적용된다.** `use: ['style-loader', 'css-loader']`는 `styleLoader(cssLoader(file))`이다. css-loader가 `@import`·`url()`을 모듈 의존성으로 바꾸고, style-loader가 결과를 `<style>`로 넣는다. 순서를 거꾸로 쓰면 깨진다.

`mode`(`development`·`production`)는 압축, 소스 맵, 최적화의 기본값을 한꺼번에 바꾼다. 스코프 호이스팅과 트리 셰이킹은 production에서 기본으로 켜진다.

## 빌드할 때 코드를 바꿔 넣는 플러그인

| 플러그인 | 하는 일 | 예 |
| --- | --- | --- |
| `DefinePlugin` | 코드 속 식별자를 **빌드 시점의 값(코드 조각)** 으로 바꾼다. 값은 문자열 그대로 코드로 들어가므로 `JSON.stringify`로 감싼다 | `__DEV__: JSON.stringify(false)` → `if (false) {...}`가 되어 압축기가 블록을 통째로 지운다 |
| `EnvironmentPlugin` | `process.env.KEY`에 대한 `DefinePlugin`의 줄임. 기본값을 줄 수 있다 | `new EnvironmentPlugin({ API_URL: 'http://localhost' })` |
| `ProvidePlugin` | 어떤 모듈에서 **그 이름의 전역 변수를 읽으면** 해당 패키지를 자동으로 import한다 | `{ $: 'jquery' }`, 일부만: `{ join: ['lodash', 'join'] }` |
| `IgnorePlugin` | 정규식에 맞는 `import`·`require`를 모듈로 만들지 않는다 | moment의 모든 로케일이 번들에 들어가는 것을 막는다: `{ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ }` |
| `WatchIgnorePlugin`·`watchOptions.ignored` | watch 모드가 특정 파일 변경을 무시한다 | 빌드 결과물이나 생성 파일을 감시에서 뺀다 |

`DefinePlugin`으로 넣는 값은 **번들에 문자열로 박힌다.** 비밀 키를 넣으면 누구나 볼 수 있다. 클라이언트 환경 변수 규칙은 [[tooling|React 빌드 환경 직접 구성하기]]의 환경 변수 절에 있다.

## 모듈이 아닌 코드 다루기: shimming

webpack은 ES 모듈, CommonJS, AMD를 이해한다. 그런데 오래된 라이브러리는 **전역 변수에 기대거나(`$`를 그냥 쓴다), 전역에 결과를 남기는(`window.helpers = ...`)** "깨진 모듈"이다. 이런 코드를 그래프에 끼워 넣는 일이 shimming이다. 전역은 숨은 의존성이므로 꼭 필요할 때만 쓴다.

| 문제 | 해결 |
| --- | --- |
| 전역 이름을 **읽는다** | `ProvidePlugin`. 소스를 고치지 않고 그 자리에 import를 묶는다 |
| `this`가 `window`라고 가정한다 | CommonJS로 실행되면 모듈의 `this`는 `module.exports`다. 스크립트를 전역 객체로 호출하는 함수로 감싼다. ES 모듈은 감쌀 수 없다(`import`·`export`는 최상위에만 올 수 있고, ES 모듈의 `this`는 `undefined`) |
| 아무것도 export하지 않고 전역에 남긴다 | 파일 끝에 `module.exports = { file, parse }`를 덧붙인다(과거 `exports-loader`). `export { ... }`를 덧붙이면 ES 모듈이 되어 트리 셰이킹까지 된다 |
| 파싱할 필요가 없는 미리 빌드된 파일 | `module.noParse`로 그대로 포함한다. 빌드가 빨라지지만 AST가 필요한 기능(ProvidePlugin 등)은 그 파일에 안 먹는다 |
| Node 내장 모듈(`buffer`, `process`) | webpack 5는 자동 폴리필을 하지 않는다. `ProvidePlugin`이나 `resolve.fallback`으로 직접 채운다 |

폴리필은 모든 사용자에게 보내지 않는다. **최신 브라우저용과 옛 브라우저용 빌드를 두 벌 만들고**(설정 배열 두 개, 옛 쪽은 `output.environment`에서 화살표 함수·`const`·동적 `import()` 등을 끈다), `<script type="module">`과 `nomodule`로 나눠 내려보내는 방식을 쓸 수 있다. 폴리필 고르는 법은 [[babel|Babel과 AST 변환]]에 있다.

## 스코프 호이스팅

webpack은 원래 **모듈마다 함수로 감싸** 번들에 넣고, 브라우저용 `require` 구현으로 하나씩 실행했다. 감싸는 함수가 많을수록 번들이 크고 실행이 느리다. Rollup과 Closure Compiler는 모듈들을 **하나의 스코프로 이어 붙여(concatenate)** 이 비용을 없앴다.

webpack도 `ModuleConcatenationPlugin`으로 같은 일을 한다. 이것이 **스코프 호이스팅(scope hoisting)** 이다. production 모드에서 기본으로 켜지고, `optimization.concatenateModules`로 조절한다.

**ES 모듈 문법이어야 가능하다.** import·export가 정적이라 무엇을 어디서 쓰는지 빌드 때 확정되기 때문이다. 그래서 Babel이 ESM을 CommonJS로 바꿔 버리면 효과가 사라진다(`preset-env`의 `modules: "auto"`가 이를 막는다). 합칠 수 없는 모듈은 따로 감싼다.

| 합치지 못하는 경우 | 이유 |
| --- | --- |
| ESM이 아닌 모듈, `export * from "cjs-module"` | 정적 분석이 안 된다 |
| `eval()` 사용, `module` 객체 사용, ProvidePlugin 대상 | 스코프를 합치면 의미가 바뀔 수 있다 |
| HMR을 쓰는 모듈(`module.hot`) | 모듈 단위로 교체해야 한다 |
| 동적 `import()`로 불리거나 다른 청크에 있는 모듈 | 그 모듈이 새 그룹의 뿌리가 된다 |

왜 안 합쳐졌는지는 `--stats-optimization-bailout` 또는 설정의 `stats.optimizationBailout: true`로 본다.

## HMR: 새로고침 없이 모듈 바꾸기

HMR(Hot Module Replacement)은 **앱이 실행 중인 채로 바뀐 모듈만 교체**한다. 새로고침하면 날아가는 앱 상태(폼 입력, 열린 모달)가 남고, CSS는 DevTools에서 고치는 것처럼 즉시 반영된다.

```text
파일 저장 → 컴파일러가 update 생성: [이전 해시].hot-update.json(manifest) + [청크].[이전 해시].hot-update.js
          → 브라우저의 HMR runtime이 check(manifest 요청) → 바뀐 청크 다운로드
          → apply: 바뀐 모듈을 invalid 표시 → 처리기를 찾아 위로 버블링
          → dispose 핸들러 실행 후 옛 모듈 제거 → accept 핸들러 호출
```

| 개념 | 내용 |
| --- | --- |
| 옵트인 | HMR 처리 코드가 있는 모듈만 교체된다. CSS는 webpack의 CSS 지원이 처리 코드를 대신 넣어 준다 |
| 버블링 | 바뀐 모듈에 처리기가 없으면 **자기를 import한 부모로 올라간다.** 진입점까지 처리기가 없으면 전체 새로고침으로 돌아간다 |
| 다시 실행되는 범위 | `top → middle → leaf`에서 `top`만 `./middle`을 accept할 때 `leaf`를 고치면 `leaf`와 `middle`은 다시 실행되고, 바뀌지 않은 다른 모듈은 캐시를 재사용하고, `top`은 다시 실행되지 않고 accept 콜백만 불린다. 그래서 **상태를 쥔 모듈이 accept하는 자리**가 된다 |
| API | `module.hot.accept('./middle', cb)`, ESM에서는 `import.meta.webpackHot`. `dispose`로 타이머·구독을 정리한다 |
| 파일 이름의 해시 | 업데이트 파일 이름에는 **이전 빌드의 해시**가 들어간다. 오래 쉬던 클라이언트도 자기가 가진 버전 다음의 업데이트를 정확히 요청한다 |

실무에서는 HMR 코드를 직접 쓰지 않는다. `webpack-dev-server`의 hot 모드와 프레임워크 통합(React Fast Refresh의 `react-refresh-webpack-plugin`, Vue Loader)이 컴포넌트 단위 accept를 대신 넣는다. Vite도 같은 개념을 `import.meta.hot`으로 제공한다.

## webpack과 Rollup

두 도구는 같은 일을 하지만 **출발점이 달랐다.**

| | webpack | Rollup |
| --- | --- | --- |
| 만든 목적 | 복잡한 **SPA** 빌드(2012) | **라이브러리**를 납작한 배포 파일로(2015) |
| 번들 방식 | 모듈마다 함수로 감싸고 runtime이 차례로 실행 (지금은 스코프 호이스팅으로 보완) | ES 모듈을 **한 스코프에 이어 붙여** 한 번에 평가. 결과가 작고 시작이 빠르다 |
| 강점 | 코드 스플리팅, 정적 에셋을 그래프 노드로, CommonJS 혼합 코드, HMR | 트리 셰이킹, 읽을 수 있는 출력, ESM·CJS 등 여러 형식 출력 |

경험칙은 **"앱은 webpack, 라이브러리는 Rollup"** 이었다. 지금은 Rollup도 코드 스플리팅을 지원하고, 앱 쪽은 Rollup 계열 위에 선 Vite(Vite 8부터 Rust 번들러 Rolldown)가 많이 쓰인다. 라이브러리 빌드는 Rollup이나 그 위의 도구(tsup·tsdown, Vite 라이브러리 모드)를 쓴다.

라이브러리 작가에게 남은 교훈은 **ESM 빌드를 함께 내라**는 것이다. 과거에는 `package.json`의 `"module"` 필드(pkg.module)로 ESM 파일을 알렸고, 지금은 조건부 `exports` 필드(`"import"`·`"require"`)가 표준이다. 그래야 쓰는 쪽 번들러가 트리 셰이킹을 할 수 있다.

## 정리

- webpack = entry에서 정적으로 그린 의존성 그래프 + 로더(파일 변환) + 플러그인(번들 개입) + 출력(번들·runtime·manifest).
- 로더는 오른쪽에서 왼쪽으로 적용된다. `DefinePlugin` 값은 번들에 그대로 박힌다.
- 전역에 기대는 옛 코드는 shimming(ProvidePlugin, export 덧붙이기, noParse)으로 그래프에 넣는다.
- 스코프 호이스팅과 트리 셰이킹은 **ES 모듈일 때만** 된다. 빌드 체인 어디서도 ESM을 CommonJS로 바꾸지 않는다.
- HMR은 바뀐 모듈에서 accept 처리기까지 버블링하며 교체하고, 처리기가 없으면 새로고침한다.

관련 노트: [[bundlers-and-vite|번들러의 역사와 Vite]], [[babel|Babel과 AST 변환]], [[es-modules|모듈: export와 import]], [[code-splitting|코드 스플리팅]], [[tooling|React 빌드 환경 직접 구성하기]], [[npm-scripts|npm 스크립트로 작업 자동화하기]]
