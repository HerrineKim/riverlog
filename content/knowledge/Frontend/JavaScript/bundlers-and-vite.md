---
title: "번들러의 역사와 Vite"
concept: "Bundler"
summary: "모듈 없이 태어난 JavaScript가 CommonJS·AMD·ES 모듈을 거쳐 번들러를 필요로 하게 된 이유, 번들러의 느린 빌드를 네이티브 언어 도구와 '개발은 쪼개서, 배포는 합쳐서' 방식이 풀고, Vite가 그 개념을 모아 Rust 번들러 Rolldown 기반의 표준 빌드 도구가 되기까지를 정리했다."
tags: ["frontend", "javascript", "tools", "performance"]
source: other
date: "2026-10-13"
sources: ["https://velog.io/@teo/vite", "https://velog.io/@teo/Svelte-Rxjs-Vite-AdorableCSS", "https://vite.dev/blog/announcing-vite8", "https://vite.dev/config/build-options#build-target", "https://wesbos.com/javascript/14-es-modules-and-structuring-larger-apps/81-bundling-and-building-with-parcel", "https://joshua1988.github.io/webpack-guide/"]
---

> 테오(teo)의 「[Vite 이야기 (feat. Svelte)](https://velog.io/@teo/vite)」(2022.07)를 바탕으로 재구성하고, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)를 함께 참고했다. webpack 설정의 뼈대는 「[웹팩 핸드북](https://joshua1988.github.io/webpack-guide/)」의 목차를 따라 더했다.

## 번들러가 필요한 이유

**JavaScript는 모듈 없이 태어났다.** 간단한 동작만 하려고 만든 언어라 파일을 여러 개로 나눠 개발할 방법이 없었다. 한 파일에 수만 줄을 쓸 수는 없으니 모듈이 없으면 프로그램의 덩치를 키울 수 없다.

| 단계 | 방식 | 한계 |
| --- | --- | --- |
| CommonJS | Node가 서버에서 `require`·`module.exports`로 모듈을 나눴다. npm으로 모두가 모듈을 공유하게 되면서 모듈이 본격화됐다 | 서버는 파일을 바로 읽지만, 브라우저는 매번 네트워크로 받아야 한다 |
| AMD (RequireJS) | 브라우저용 **비동기** 모듈 로딩. 로딩 순서는 모르는데 실행은 순서대로 해야 하는 문제를 풀었다 | 파일을 여러 번 요청하고 순서를 맞춰야 했다. 표준 `import`에 영향을 줬다 |
| ES 모듈 (`import`) | 브라우저 표준 모듈 | 잘게 나뉜 파일을 동시에 많이 요청하면 느리고, 하나가 늦으면 전체가 늦는다 |
| 번들러 | 개발은 모듈로 나눠서 하고, **배포할 때 하나의 파일(bundle)로 합친다** | 수정할 때마다 다시 번들링해야 해서 느리다 |

브라우저와 서버의 통신에는 데이터 양과 무관한 최소 왕복 시간이 있다. 그래서 파일을 쪼개 받으면 하나로 받는 것보다 오래 걸린다. 모듈 개발의 편리함과 한 파일 전송의 속도를 둘 다 얻으려고 생긴 것이 번들러다. 문법 쪽 이야기는 [[es-modules|모듈: export와 import]]에 있다.

### 빌드할 때 번들러가 하는 일

| 일 | 내용 |
| --- | --- |
| 모듈 해석 | `import 'date-fns'` 같은 패키지 이름을 `node_modules`의 실제 파일로 찾아 잇는다 |
| 변환 | TypeScript·JSX를 JavaScript로 바꾸고, 대상 브라우저가 모르는 최신 문법을 낮춘다. 대상은 설정으로 정한다(Vite의 `build.target`, 기본값은 Baseline 기준으로 널리 쓸 수 있는 브라우저). 과거에는 Babel과 `browserslist`가 이 일을 맡았다 |
| 압축(minify) | 공백·주석을 지우고 지역 변수 이름을 짧게 줄인다 |
| 트리 셰이킹 | 어디서도 쓰지 않는 export를 결과물에서 뺀다 |
| 코드 스플리팅 | 동적 `import()` 지점과 공통 의존성을 별도 파일(청크)로 나눈다 |
| 에셋 처리 | CSS·이미지를 함께 묶거나 최적화하고, 내용 해시를 붙인 파일 이름으로 내보내 오래 캐시해도 되게 한다 |

## 번들러의 계보

```text
2012 Grunt ─ 2013 webpack ─ 2014 Gulp ─ 2015 Rollup ─ 2017 Parcel
   └ 2020 esbuild · Snowpack · swc ─ 2021 Vite ─ 2026 Vite 8 + Rolldown
```

| 도구 | 들고 나온 개념 |
| --- | --- |
| webpack | 처음 크게 퍼진 번들러. 로더·플러그인으로 트랜스파일, 코드 스플리팅, HMR, CSS·에셋까지 다루는 **통합 개발 도구**로 커졌다. 설정이 복잡하다 |
| Parcel | webpack 설정이 불편하다는 반응에서 나온 **설정 없는(zero-config)** 번들러 |
| Rollup | 쓰지 않는 코드를 걷어 내는 **트리 셰이킹(tree-shaking)** 을 앞세웠다. Svelte를 만든 Rich Harris가 먼저 만든 도구다 |
| esbuild | JavaScript가 아니라 **Go로 작성**한 네이티브 빌드 도구. 기존 번들러보다 100배 가까이 빠르다고 알려졌다. 다만 순수 빌드 도구라 개발 서버·HMR 같은 통합 기능은 없었다 |
| Snowpack | esbuild의 속도를 실무에 쓰려는 시도 (아래) |
| Vite | Snowpack의 개념과 기존 번들러 기능을 한데 모은 프론트엔드 빌드 도구 |
| Rolldown | Rollup 호환 API를 가진 **Rust** 번들러. Vite 8부터 esbuild와 Rollup을 함께 대체한다 |

### webpack 설정의 뼈대

번들러 설정은 대부분 webpack이 정한 네 개념의 변형이다. Vite·Rollup 설정을 읽을 때도 같은 틀로 보면 된다.

| 개념 | 하는 일 | Vite·Rollup에서 |
| --- | --- | --- |
| entry | 의존성 그래프를 그리기 시작할 파일 | `index.html`의 `<script type="module">`, 번들러 옵션의 `input` |
| output | 결과 파일 이름·경로. `[contenthash]`로 캐시 무효화 | `build.outDir`, 번들러 옵션의 `output` |
| loader | JS가 아닌 파일(TS, CSS, 이미지)을 모듈로 바꾸는 **파일 단위 변환** | 플러그인의 `transform` 훅이 맡는다 |
| plugin | 번들 결과 전체에 개입한다(HTML 생성, 압축, 환경 변수 주입) | 플러그인 |
| mode | `development`·`production`에 따라 압축·소스 맵·최적화 기본값을 바꾼다 | `vite`(dev)와 `vite build` |

개발 서버, HMR(Hot Module Replacement: 새로고침 없이 바뀐 모듈만 교체), 소스 맵이 개발 편의를 맡는다. 로더 적용 순서, shimming, 스코프 호이스팅, HMR의 동작과 Rollup과의 차이는 [[webpack|webpack 동작 원리]]에, 변환을 맡던 Babel은 [[babel|Babel과 AST 변환]]에 있다. 소스 맵으로 번들을 원본 파일로 디버깅하는 법은 [[devtools-debugging|DevTools 디버깅]]에 있다.

## 느린 빌드를 푸는 두 가지 길

프로젝트가 커질수록 "고친 건 한 줄인데 전체를 다시 번들링하는" 시간이 늘어 개발 생산성이 떨어졌다. 해법은 둘이었다.

1. **더 빠른 언어로 만든다.** 번들러는 로컬에서 도는 프로그램이니 JavaScript일 필요가 없다. esbuild(Go), swc·Rspack·Rolldown(Rust)이 이 길이다. TypeScript 컴파일러도 7.0부터 Go로 다시 쓰였다.
2. **개발할 때는 번들링하지 않는다.** 개발 중에는 완성된 결과보다 수정 반영 속도가 중요하다. 파일마다 따로 빌드해 브라우저 표준 모듈로 바로 불러오고, 고친 파일만 다시 빌드한다. 배포용 결과물만 기존 번들러로 만든다.

```text
개발 모드:  파일 A ─ 변환 ─┐
           파일 B ─ 변환 ─┼─ 브라우저가 ES 모듈로 직접 로드 (고친 파일만 다시 빌드 → HMR)
           파일 C ─ 변환 ─┘
배포 모드:  A + B + C ─ 번들러(Snowpack은 webpack, Vite 7까지는 Rollup, Vite 8은 Rolldown) ─ bundle.js
```

Snowpack이 이 두 길을 합쳤다. esbuild로 개발 모드를 돌리고 실제 번들은 webpack으로 만들어, 새로고침 없이 고친 모듈만 바꾸는 **HMR(Hot Module Replacement)** 을 강력하게 제공했다. 하지만 webpack 연동에 버그가 있고 로더 호환이 불안정했다. Snowpack은 2022년 개발이 중단됐고 그 자리를 Vite가 이어받았다.

## Vite

Vue를 만든 Evan You가 Snowpack을 보고 같은 개념의 도구를 만들었다. 이름은 프랑스어로 "빠르다"는 뜻이고 "비트"라고 읽는다.

- **번들러라기보다 빌드 도구 생태계다.** 개발 서버, 프록시, HMR, 플러그인, 프로젝트 생성(`npm create vite@latest`)을 묶고, 실제 변환·번들링은 내부 도구에 맡긴다.
- 개발 모드는 브라우저 ES 모듈로 파일을 그대로 내려보내고 고친 모듈만 갱신한다. 배포 빌드는 하나로 묶는다.
- 변환·압축된 코드는 소스 맵으로 원본과 이어 디버깅한다. 브라우저에서 보는 법은 [[devtools-debugging|DevTools로 JavaScript 디버깅하기]]에 있다.
- Vite 8(2026.03)부터 내부 번들러가 **Rolldown** 하나로 통일됐다. 과거에는 개발 쪽 변환에 esbuild, 배포 번들에 Rollup을 따로 써서 두 도구의 동작 차이가 생기곤 했다. Rolldown은 Rollup 플러그인 API와 호환돼 기존 플러그인 생태계를 그대로 쓴다.
- TypeScript·CSS 전처리, 코드 스플리팅, SSR을 기본으로 지원하고 webpack보다 설정이 짧다.
- Vue 전용으로 시작했지만 React, Svelte, Preact, Lit, Solid로 넓어졌고, SvelteKit·Nuxt·React Router·Astro 같은 메타 프레임워크가 Vite 위에 올라가 있다. 테스트 러너 Vitest도 같은 설정을 공유한다.

새 React 프로젝트도 이제 CRA 대신 Vite로 시작하는 것이 일반적이다. webpack을 직접 구성하는 과정은 [[tooling|React 빌드 환경 직접 구성하기]]에 있다.

## 정리

- 번들러는 "모듈로 나눠 개발하고 싶다"와 "브라우저에는 파일 하나로 보내고 싶다" 사이의 타협이다.
- 번들러가 통합 개발 도구로 커지면서 느린 빌드라는 대가가 생겼다.
- 해법은 **네이티브 언어로 빠르게(esbuild)** 와 **개발 중엔 번들링하지 않기(Snowpack)** 였다.
- Vite는 두 해법을 모아 표준 빌드 도구가 됐고, 이제 Rust 번들러 Rolldown 하나로 개발과 배포를 처리한다.

관련 노트: [[es-modules|모듈: export와 import]], [[tooling|React 빌드 환경 직접 구성하기]], [[package-managers|패키지 매니저: npm, yarn, pnpm]], [[tech-stack-selection|기술 스택 고르기]], [[code-splitting|자바스크립트 코드 분할]]
