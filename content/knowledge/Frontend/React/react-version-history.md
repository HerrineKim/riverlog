---
title: "React 버전 변천사: 16부터 19.3까지"
concept: "React Versions"
summary: "React가 메이저 버전마다 무엇을 바꿨는지 한 장으로 본다. 16의 Fiber와 Hooks, 17의 새 JSX 변환과 루트 이벤트 위임, 18의 createRoot·자동 배칭·동시성 기능·스트리밍 SSR, 19의 Actions·use·ref as prop·서버 컴포넌트와 제거된 레거시 API, 19.2의 Activity·useEffectEvent, 19.3의 ViewTransition·Fragment ref, 그리고 React Compiler까지 버전별 변경점과 개념 노트를 잇는다."
tags: ["react", "frontend", "hooks", "javascript"]
source: other
date: "2026-10-30"
sources: ["https://react.dev/versions", "https://react.dev/blog/2024/12/05/react-19", "https://react.dev/blog/2025/10/01/react-19-2", "https://react.dev/blog/2026/09/09/react-19-3", "https://react.dev/blog/2025/10/07/react-compiler-1", "https://github.com/sudheerj/reactjs-interview-questions"]
---

> React 공식 문서의 「[Versions](https://react.dev/versions)」와 릴리스 블로그 글(React 19, 19.2, 19.3, React Compiler v1.0)을 바탕으로 재구성한 노트다. 「버전마다 무엇이 바뀌었나」를 묻는 면접 질문은 [sudheerj/reactjs-interview-questions](https://github.com/sudheerj/reactjs-interview-questions)를 참고해 골랐다.

## 이 노트의 역할

각 기능의 원리와 사용법은 개념 노트에 있다. 이 노트는 **언제 무엇이 들어오고 무엇이 빠졌는지**만 모은 연표다. 옛 코드를 읽을 때, 업그레이드할 때, 「React 18에서 바뀐 점은?」 같은 질문에 답할 때 쓴다.

React 버전의 흐름은 한 줄로 요약된다. **16에서 렌더링 엔진(Fiber)과 상태 모델(Hooks)을 바꾸고, 17에서 업그레이드 경로를 정비하고, 18에서 끊을 수 있는 렌더링을 열고, 19에서 서버와 비동기를 기본으로 만들었다.**

## 한눈에 보기

| 버전 | 출시 | 핵심 |
| --- | --- | --- |
| 16.0 | 2017.09 | Fiber 재조정자, 에러 바운더리, 포털, 배열·문자열 반환 |
| 16.3 | 2018.03 | 새 Context API, `createRef`·`forwardRef`, `getDerivedStateFromProps`, 옛 생명주기에 `UNSAFE_` |
| 16.6 | 2018.10 | `React.memo`, `React.lazy`, 코드 스플리팅용 `Suspense` |
| 16.8 | 2019.02 | **Hooks** |
| 17.0 | 2020.10 | 새 기능 없음. 새 JSX 변환, 루트 컨테이너 이벤트 위임, 점진적 업그레이드 |
| 18.0 | 2022.03 | `createRoot`, 자동 배칭, 동시성 기능(transition), 스트리밍 SSR과 선택적 hydration, `useId` 등 새 훅 |
| 19.0 | 2024.12 | Actions, `use`, ref as prop, 서버 컴포넌트·서버 함수 안정화, 레거시 API 제거 |
| 19.1 | 2025.03 | Owner Stack(에러의 컴포넌트 출처 추적) 등 디버깅 개선 |
| 19.2 | 2025.10 | `<Activity>`, `useEffectEvent`, `cacheSignal`, 부분 사전 렌더링, Performance Tracks |
| 19.3 | 2026.09 | `<ViewTransition>`·Fragment ref 안정화, `addTransitionType`, `browser()` |

React Compiler는 React 본체와 따로 배포된다. 2024.10 베타를 거쳐 **2025.10에 v1.0**이 나왔다.

## React 16: 엔진과 상태 모델을 바꾸다

| 변경 | 내용 | 개념 노트 |
| --- | --- | --- |
| Fiber | 재조정자를 다시 써서 렌더링을 작업 단위로 쪼개고 우선순위를 매길 수 있게 했다. 이후 동시성 기능의 바닥이 된다 | [[ui-change-detection#React Fiber: 렌더링을 쪼개 우선순위를 매긴다\|UI 변경 감지]] |
| 에러 바운더리 | 하위 트리의 렌더링 에러를 잡는 `componentDidCatch`. 잡히지 않은 에러는 트리 전체를 언마운트한다 | [[frontend-error-handling\|프런트엔드 에러 핸들링]] |
| 포털, Fragment | 다른 DOM 노드에 그리는 `createPortal`, 감싸는 요소 없이 묶는 `<Fragment>`(16.2에 `<>` 축약) | [[portals\|포털]], [[jsx\|JSX]] |
| 새 Context API (16.3) | `createContext`와 Provider·Consumer. 옛 `contextTypes` 방식을 대체 | [[context\|Context]] |
| ref (16.3) | `createRef`, `forwardRef`. 문자열 ref는 레거시가 됐다 | [[react-typescript#과거: forwardRef와 createRef\|React와 TypeScript]] |
| 생명주기 정리 (16.3) | 비동기 렌더링에서 안전하지 않은 `componentWillMount` 등에 `UNSAFE_`를 붙이고, `getDerivedStateFromProps`·`getSnapshotBeforeUpdate`를 추가 | [[lifecycle\|생명주기]] |
| memo, lazy (16.6) | 함수 컴포넌트용 `React.memo`, 동적 `import()`를 감싸는 `React.lazy`와 `Suspense` | [[code-splitting\|코드 스플리팅]] |
| **Hooks (16.8)** | 함수 컴포넌트에 state와 effect를 준다. HOC·render props·클래스로 하던 로직 재사용이 커스텀 훅으로 옮겨 갔다 | [[hooks\|Hooks]], [[logic-reuse-patterns\|로직 재사용 패턴]] |

## React 17: 디딤돌 릴리스

새 기능 없이 **다음 업그레이드를 쉽게 하는 것**이 목표였다.

- **새 JSX 변환**: 컴파일러가 `react/jsx-runtime`의 `jsx()`를 자동으로 불러온다. 파일마다 `import React`가 필요 없고, 이 변환은 16.14·15.7에도 백포트됐다([[jsx|JSX]]).
- **이벤트 위임 위치 변경**: 리스너를 `document`가 아니라 `ReactDOM.render`(지금은 `createRoot`)를 부른 **루트 컨테이너**에 단다. 한 페이지에 여러 버전의 React나 다른 라이브러리가 섞여도 이벤트가 꼬이지 않는다([[react-events|이벤트 처리]]).
- **이벤트 풀링 제거**: 핸들러가 끝난 뒤 이벤트 객체가 재사용되며 비워지던 동작이 사라져, 비동기 코드에서 `e.persist()`가 필요 없다.
- **effect cleanup 시점**: `useEffect`의 cleanup이 화면 갱신 뒤 비동기로 돈다.
- **점진적 업그레이드**: 앱의 일부만 새 버전으로 옮길 수 있게 됐다.

## React 18: 끊을 수 있는 렌더링

| 변경 | 내용 | 개념 노트 |
| --- | --- | --- |
| `createRoot` | `ReactDOM.render`를 대체하는 새 루트 API. 새 기능은 모두 이 루트에서만 켜진다 | [[jsx#루트에 렌더링하기\|JSX]] |
| 자동 배칭 | 이벤트 핸들러뿐 아니라 Promise·`setTimeout` 안의 여러 setState도 한 번에 렌더링한다. 바로 반영하려면 `flushSync` | [[state#일괄 처리(batching)\|State]] |
| 동시성 기능 | `startTransition`·`useTransition`·`useDeferredValue`로 급하지 않은 갱신을 끊을 수 있게 한다. 실험 단계의 「concurrent mode」는 모드가 아니라 기능 단위로 바뀌었다 | [[concurrent-rendering\|동시성 렌더링]] |
| 스트리밍 SSR | `renderToPipeableStream`으로 준비된 HTML부터 보내고, Suspense 경계별로 나머지를 끼워 넣는다. **선택적 hydration**으로 사용자가 누른 곳부터 살린다 | [[streaming-ssr\|스트리밍 SSR]] |
| 새 훅 | `useId`(서버·클라이언트 일치 id), `useSyncExternalStore`(외부 스토어 구독, tearing 방지), `useInsertionEffect`(CSS-in-JS 라이브러리용) | [[hooks#주요 Hooks\|Hooks]], [[react-state-management\|리액트 상태 관리]] |
| StrictMode 이중 실행 | 개발 모드에서 effect를 마운트 → 언마운트 → 마운트로 한 번 더 돌려 cleanup 누락을 드러낸다 | [[lifecycle#StrictMode의 이중 실행\|생명주기]] |

18.3(2024.04)은 19에서 사라질 API에 경고를 띄우는 업그레이드용 릴리스다.

## React 19: 서버와 비동기를 기본으로

### 들어온 것

| 변경 | 내용 | 개념 노트 |
| --- | --- | --- |
| Actions | 전환 안에서 async 함수를 쓰면 pending·에러·낙관적 갱신을 React가 관리한다. `<form action={fn}>`에 함수를 넘긴다 | [[forms#폼 액션 (React 19)\|폼]], [[concurrent-rendering#async 전환과 Actions (React 19)\|동시성 렌더링]] |
| 새 훅 | `useActionState`(카나리 시절 이름 `useFormState`), `useFormStatus`, `useOptimistic` | [[forms\|폼]] |
| `use` | 렌더링 중에 Promise나 Context를 읽는다. 조건문 안에서도 부를 수 있다 | [[react-use-hook\|use 훅]] |
| ref as prop | 함수 컴포넌트가 `ref`를 일반 prop으로 받는다. `forwardRef`가 필요 없고, ref 콜백이 cleanup 함수를 돌려줄 수 있다 | [[components-and-props#ref도 props다\|컴포넌트와 Props]] |
| `<Context>`를 Provider로 | `<ThemeContext value="dark">`처럼 `.Provider` 없이 쓴다 | [[context\|Context]] |
| 서버 컴포넌트·서버 함수 | 프레임워크가 쓰는 서버 컴포넌트와 `'use server'` 함수가 안정 API가 됐다 | [[react-server-components\|React Server Components]] |
| 문서 메타데이터·리소스 | 컴포넌트 안의 `<title>`·`<meta>`·`<link>`를 `<head>`로 올린다. 스타일시트 우선순위, `preload`·`preinit` 같은 리소스 API | [[html-head-metadata\|HTML head 메타데이터]] |
| 에러 보고 | hydration 불일치를 diff로 보여 주고, 잡힌 에러와 잡히지 않은 에러를 `createRoot`의 `onCaughtError`·`onUncaughtError`로 받는다 | [[frontend-error-handling\|프런트엔드 에러 핸들링]] |

### 빠진 것

| 제거된 API | 대신 쓰는 것 |
| --- | --- |
| `ReactDOM.render`, `ReactDOM.hydrate`, `unmountComponentAtNode` | `createRoot().render()`, `hydrateRoot`, `root.unmount()` |
| `ReactDOM.findDOMNode` | DOM ref |
| 문자열 ref (`ref="input"`) | `useRef`, ref 콜백 |
| 함수 컴포넌트의 `propTypes` 검사, `defaultProps` | TypeScript, 구조 분해 기본값([[react-typescript#기본값\|React와 TypeScript]]) |
| 옛 Context(`contextTypes`, `getChildContext`) | `createContext` |
| `renderToNodeStream` | `renderToPipeableStream` |
| `react-test-renderer/shallow`, `react-dom/test-utils`의 대부분 | Testing Library, `act`는 `react`에서 import |

## React 19.2와 19.3

- **19.2 (2025.10)**
  - `<Activity mode="visible|hidden">`: 화면에서 숨긴 부분의 state와 DOM을 유지한 채 effect를 멈추고, 렌더링 우선순위를 낮춘다. 탭·뒤로 가기에서 이전 화면을 보존하거나 다음 화면을 미리 렌더링할 때 쓴다.
  - `useEffectEvent`가 안정 API가 됐다. effect 안에서 최신 값을 읽되 그 값이 바뀌어도 effect를 다시 돌리지 않는다([[hooks#useEffectEvent: 반응하지 않을 값 분리|Hooks]]).
  - `cacheSignal`(서버 컴포넌트에서 `cache()` 수명이 끝나면 요청 취소), 정적 셸을 먼저 만들고 나중에 이어 렌더링하는 **부분 사전 렌더링**(`prerender` → `resume`), Chrome DevTools의 Scheduler·Components 트랙.
  - `useId` 접두사가 `_r_`로 바뀌었고, `eslint-plugin-react-hooks` v6은 flat config가 기본이다.
- **19.3 (2026.09)**
  - `<ViewTransition>`이 안정 API가 됐다. 브라우저 View Transition API로, 전환(transition) 안에서 일어난 요소의 등장·퇴장·이동·크기 변화를 애니메이션한다. Suspense 경계를 감싸면 fallback에서 내용으로 바뀌는 순간을 애니메이션한다. `addTransitionType`으로 앞으로·뒤로 이동처럼 같은 갱신에 다른 애니메이션을 고른다.
  - Fragment ref: `<Fragment ref>`가 자식 DOM들을 묶어 다루는 `FragmentInstance`(이벤트 리스너, `focus`, `scrollIntoView`, `observeUsing` 등)를 준다. 감싸는 `div` 없이 여러 요소에 한 번에 리스너를 단다.
  - `use(browser())`로 컴포넌트를 서버 렌더링에서 빼고 클라이언트에서만 그린다. 서버 컴포넌트가 `'use client'` 모듈의 Context를 래퍼 없이 바로 렌더링한다.
  - 느린 전환이 다른 전환을 막지 않고, StrictMode가 hydration 중에도 effect를 두 번 실행한다.

## React Compiler

빌드 단계에서 컴포넌트를 분석해 `useMemo`·`useCallback`·`React.memo`에 해당하는 메모이제이션을 자동으로 넣는다. React 17 이상에서 쓸 수 있고, v1.0(2025.10) 이후 Expo·Vite·Next.js 시작 템플릿에서 바로 켤 수 있다. 수동 메모이제이션은 컴파일러가 처리하지 못하는 경우의 탈출구로 남는다([[hooks#메모이제이션: useMemo, useCallback, memo|Hooks]]).

## 버전과 함께 바뀐 생태계

| 영역 | 과거 | 지금 |
| --- | --- | --- |
| 프로젝트 시작 | Create React App | CRA는 2025.02 지원 종료. Vite 또는 Next.js·React Router 같은 프레임워크([[tooling\|React 빌드 환경]]) |
| 컴포넌트 | 클래스와 생명주기 메서드 | 함수 컴포넌트와 Hooks. 클래스는 에러 바운더리에만 남았다 |
| 로직 재사용 | mixin → HOC·render props | 커스텀 훅 |
| 타입 | PropTypes, Flow | TypeScript |
| 데이터 요청 | `componentDidMount`·`useEffect`에서 fetch | TanStack Query·SWR, 서버 컴포넌트, `use` |
| 테스트 | Enzyme shallow 렌더링 | Testing Library |

## 정리

- 16은 Fiber와 Hooks로 엔진과 상태 모델을 바꿨다. 지금 쓰는 React의 모양은 16.8에서 정해졌다.
- 17은 새 기능 없이 JSX 변환과 이벤트 위임을 정비한 업그레이드용 릴리스다.
- 18은 `createRoot` 위에서 자동 배칭, transition, 스트리밍 SSR을 열었다.
- 19는 Actions·`use`·서버 컴포넌트로 비동기와 서버를 기본에 넣고, 클래스 시절의 레거시 API를 걷어 냈다. 19.2·19.3은 화면 보존(Activity)과 전환 애니메이션(ViewTransition)으로 이어진다.
- 옛 코드를 읽을 때는 이 표로 버전을 가늠하고, 원리는 링크한 개념 노트에서 확인한다.

관련 노트: [[ui-change-detection|UI 변경 감지]], [[hooks|Hooks]], [[concurrent-rendering|동시성 렌더링]], [[react-server-components|React Server Components]], [[frontend-interview|프론트엔드 면접 유형과 준비법]]
