---
title: "번들러의 역사와 Vite"
concept: "Bundler"
summary: "모듈 없이 태어난 JavaScript가 CommonJS·AMD·ES 모듈을 거쳐 번들러를 필요로 하게 된 이유, 번들러의 느린 빌드를 esbuild와 Snowpack의 '개발은 쪼개서, 배포는 합쳐서' 방식이 풀고, Vite가 그 개념을 모아 표준 빌드 도구가 되기까지를 정리했다."
tags: ["frontend", "javascript", "tools", "performance"]
source: other
date: "2026-10-13"
sources: ["https://velog.io/@teo/vite", "https://velog.io/@teo/Svelte-Rxjs-Vite-AdorableCSS"]
---

> 테오(teo)의 「[Vite 이야기 (feat. Svelte)](https://velog.io/@teo/vite)」(2022.07)와 「[Svelte Rxjs Vite AdorableCSS](https://velog.io/@teo/Svelte-Rxjs-Vite-AdorableCSS)」(2022.01)의 번들러 부분을 요약·재구성한 노트입니다. 도구별 기능과 내부 구현은 글 작성 시점 기준이라 지금은 바뀌었을 수 있습니다.

## 번들러가 필요한 이유

**JavaScript는 모듈 없이 태어났다.** 간단한 동작만 하려고 만든 언어라 파일을 여러 개로 나눠 개발할 방법이 없었다. 한 파일에 수만 줄을 쓸 수는 없으니 모듈이 없으면 프로그램의 덩치를 키울 수 없다.

| 단계 | 방식 | 한계 |
| --- | --- | --- |
| CommonJS | Node가 서버에서 `require`·`module.exports`로 모듈을 나눴다. npm으로 모두가 모듈을 공유하게 되면서 모듈이 본격화됐다 | 서버는 파일을 바로 읽지만, 브라우저는 매번 네트워크로 받아야 한다 |
| AMD (RequireJS) | 브라우저용 **비동기** 모듈 로딩. 로딩 순서는 모르는데 실행은 순서대로 해야 하는 문제를 풀었다 | 파일을 여러 번 요청하고 순서를 맞춰야 했다. 표준 `import`에 영향을 줬다 |
| ES 모듈 (`import`) | 브라우저 표준 모듈 | 잘게 나뉜 파일을 동시에 많이 요청하면 느리고, 하나가 늦으면 전체가 늦는다 |
| 번들러 | 개발은 모듈로 나눠서 하고, **배포할 때 하나의 파일(bundle)로 합친다** | 수정할 때마다 다시 번들링해야 해서 느리다 |

브라우저와 서버의 통신에는 데이터 양과 무관한 최소 왕복 시간이 있다. 그래서 파일을 쪼개 받으면 하나로 받는 것보다 오래 걸린다. 모듈 개발의 편리함과 한 파일 전송의 속도를 둘 다 얻으려고 생긴 것이 번들러다. 문법 쪽 이야기는 [[es-modules|모듈: export와 import]]에 있다.

## 번들러의 계보

```text
2012 Grunt ─ 2013 webpack ─ 2014 Gulp ─ 2015 Rollup ─ 2017 Parcel
   └ 2020 esbuild · Snowpack · swc ─ 2021 Vite
```

| 도구 | 들고 나온 개념 |
| --- | --- |
| webpack | 처음 크게 퍼진 번들러. 로더·플러그인으로 트랜스파일, 코드 스플리팅, HMR, CSS·에셋까지 다루는 **통합 개발 도구**로 커졌다. 설정이 복잡하다 |
| Parcel | webpack 설정이 불편하다는 반응에서 나온 **설정 없는(zero-config)** 번들러 |
| Rollup | 쓰지 않는 코드를 걷어 내는 **트리 셰이킹(tree-shaking)** 을 앞세웠다. Svelte를 만든 Rich Harris가 먼저 만든 도구다 |
| esbuild | JavaScript가 아니라 **Go로 작성**한 네이티브 빌드 도구. 기존 번들러보다 100배 가까이 빠르다고 알려졌다. 다만 순수 빌드 도구라 개발 서버·HMR 같은 통합 기능은 없었다 |
| Snowpack | esbuild의 속도를 실무에 쓰려는 시도 (아래) |
| Vite | Snowpack의 개념과 기존 번들러 기능을 한데 모은 프론트엔드 빌드 도구 |

## 느린 빌드를 푸는 두 가지 길

프로젝트가 커질수록 "고친 건 한 줄인데 전체를 다시 번들링하는" 시간이 늘어 개발 생산성이 떨어졌다. 해법은 둘이었다.

1. **더 빠른 언어로 만든다.** 번들러는 로컬에서 도는 프로그램이니 JavaScript일 필요가 없다. esbuild(Go), swc(Rust)가 이 길이다.
2. **개발할 때는 번들링하지 않는다.** 개발 중에는 완성된 결과보다 수정 반영 속도가 중요하다. 파일마다 따로 빌드해 브라우저 표준 모듈로 바로 불러오고, 고친 파일만 다시 빌드한다. 배포용 결과물만 기존 번들러로 만든다.

```text
개발 모드:  파일 A ─ esbuild ─┐
           파일 B ─ esbuild ─┼─ 브라우저가 ES 모듈로 직접 로드 (고친 파일만 다시 빌드 → HMR)
           파일 C ─ esbuild ─┘
배포 모드:  A + B + C ─ 번들러(Snowpack은 webpack, Vite는 Rollup) ─ bundle.js
```

Snowpack이 이 두 길을 합쳤다. esbuild로 개발 모드를 돌리고 실제 번들은 webpack으로 만들어, 새로고침 없이 고친 모듈만 바꾸는 **HMR(Hot Module Replacement)** 을 강력하게 제공했다. 하지만 webpack 연동에 버그가 있고 로더 호환이 불안정했다. Snowpack은 이후 개발이 중단됐다.

## Vite

Vue를 만든 Evan You가 Snowpack을 보고 같은 개념의 도구를 만들었다. 이름은 프랑스어로 "빠르다"는 뜻이고 "비트"라고 읽는다.

- **엄밀히는 번들러가 아니다.** 개발 모드는 esbuild와 브라우저 ES 모듈로, 배포 번들은 **Rollup**으로 만든다(글 작성 시점 기준). 그 위에 개발 서버, 프록시, HMR, 플러그인, 프로젝트 생성(`npm create vite`)을 묶은 **빌드 도구 생태계**다.
- Rollup 기반이라 Rollup 플러그인 생태계를 그대로 흡수했고, webpack보다 설정이 쉽다. TypeScript와 CSS 로더, 코드 스플리팅, SSR까지 기본으로 지원한다.
- Vue 전용으로 시작했지만 React, Svelte, Preact, Lit 등으로 넓어졌다. 2021년 개발자 만족도가 가장 높은 빌드 도구가 됐다.
- 최종 번들러로 Rollup을 고른 덕에 Rollup에서 출발한 Svelte가 Snowpack 대신 Vite를 공식 도구로 삼았다. 이후 SvelteKit도 Vite 위에 올라갔다.

새 React 프로젝트도 이제 CRA 대신 Vite로 시작하는 것이 일반적이다. webpack을 직접 구성하는 과정은 [[tooling|React 빌드 환경 직접 구성하기]]에 있다.

## 정리

- 번들러는 "모듈로 나눠 개발하고 싶다"와 "브라우저에는 파일 하나로 보내고 싶다" 사이의 타협이다.
- 번들러가 통합 개발 도구로 커지면서 느린 빌드라는 대가가 생겼다.
- 해법은 **네이티브 언어로 빠르게(esbuild)** 와 **개발 중엔 번들링하지 않기(Snowpack)** 였다.
- Vite는 두 해법을 모으고 Rollup 생태계와 좋은 문서로 안정성을 더해 표준 빌드 도구가 됐다.

관련 노트: [[es-modules|모듈: export와 import]], [[tooling|React 빌드 환경 직접 구성하기]], [[package-managers|패키지 매니저: npm, yarn, pnpm]], [[tech-stack-selection|기술 스택 고르기]]
