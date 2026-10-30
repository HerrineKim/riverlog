---
title: "React 면접 질문: 주제별 단골 질문과 답의 핵심"
concept: "React Interview"
summary: "React 면접에서 반복해서 나오는 질문을 렌더링 원리, 컴포넌트와 state, Hooks, 이벤트·폼, 성능, 에러, React 18·19와 서버 렌더링, 상태 관리, 라우팅 주제로 묶고, 각 질문에 지금 기준의 짧은 답과 깊게 설명한 개념 노트를 잇는다. 클래스 컴포넌트·PropTypes·CRA처럼 낡은 질문에 지금은 어떻게 답하는지도 정리한다."
tags: ["career", "interview", "frontend", "react", "hooks"]
source: other
date: "2026-10-30"
sources: ["https://github.com/sudheerj/reactjs-interview-questions"]
---

> Sudheer Jonna의 「[React Interview Questions & Answers](https://github.com/sudheerj/reactjs-interview-questions)」(GitHub, 2026.10 확인)를 바탕으로 재구성한 노트다. 원문의 질문 목록을 주제별로 다시 묶고, 답은 React 19 기준으로 고쳐 썼다.

## 이 노트를 쓰는 법

React 면접 질문은 수백 개로 보이지만 **몇 가지 원리의 변형**이다. 「key는 왜 필요한가」, 「인덱스를 key로 쓰면?」, 「key는 전역에서 유일해야 하나?」는 모두 재조정 규칙 하나로 답한다. 그래서 질문을 외우기보다 원리별로 묶어 두고, 각 원리를 개념 노트로 이해하는 편이 빠르다.

- 표의 **답의 핵심**은 면접에서 첫 문장으로 말할 분량이다. 후속 질문에 대비한 설명은 오른쪽 개념 노트에 있다.
- 면접 유형 전반(JS 코딩, UI 코딩, 시스템 디자인)과 준비 순서는 [[frontend-interview|프론트엔드 면접 유형과 준비법]]에 있다. 이 노트는 그중 React 퀴즈를 맡는다.
- 원문에는 React 15~16 시절 질문이 많다. 그런 질문은 맨 아래 「낡은 질문에 지금 답하기」로 모았다.

## 렌더링 원리

| 질문 | 답의 핵심 | 개념 노트 |
| --- | --- | --- |
| React란? 장점과 한계는? | 상태를 넣으면 화면이 나오는 **선언형** UI 라이브러리다. 장점은 컴포넌트 재사용과 단방향 데이터 흐름, 한계는 라우팅·데이터 요청을 직접 고르거나 프레임워크(Next.js 등)에 기대야 한다는 점이다 | [[jsx\|JSX와 엘리먼트 렌더링]], [[react-vs-vue\|React와 Vue]] |
| 명령형과 선언형의 차이는? | 명령형은 DOM을 「어떻게」 바꿀지 순서대로 쓴다. 선언형은 「어떤 모습이어야 하는지」만 쓰고 바꾸는 일은 React가 맡는다 | [[jsx#왜 React인가: 갱신 규칙 대신 다시 그리기\|JSX]] |
| 엘리먼트와 컴포넌트의 차이는? | 엘리먼트는 화면에 무엇을 그릴지 적은 **불변 객체**(`{ type, props }`)다. 컴포넌트는 props를 받아 엘리먼트를 돌려주는 **함수**다 | [[jsx#React 엘리먼트와 렌더링\|JSX]], [[components-and-props\|컴포넌트와 Props]] |
| 브라우저가 JSX를 이해하나? | 못 한다. 빌드 도구가 `jsx()` 호출로 바꾼다. React 17의 새 JSX 변환부터는 `react/jsx-runtime`을 자동으로 불러와 파일마다 `import React`가 필요 없다 | [[jsx\|JSX]], [[babel\|Babel]] |
| 가상 DOM이란? 실제 DOM과 무엇이 다른가? | 화면을 JS 객체 트리로 표현한 것이다. 새 트리와 이전 트리를 비교해 **바뀐 부분만** 실제 DOM에 반영한다. 가상 DOM 자체가 빠른 것이 아니라, 매번 다시 그리듯 코드를 써도 DOM 조작을 최소로 줄여 주는 것이 가치다 | [[ui-change-detection\|UI 변경 감지]] |
| Shadow DOM과 가상 DOM의 차이는? | 이름만 비슷하고 목적이 다르다. Shadow DOM은 웹 컴포넌트의 DOM·스타일을 **캡슐화**하는 브라우저 표준이고, 가상 DOM은 **갱신을 줄이는** 라이브러리 기법이다 | [[web-components\|웹 컴포넌트]] |
| 재조정(reconciliation)과 diffing 규칙은? | 타입이 다르면 하위 트리를 버리고 새로 만든다. 타입이 같으면 props만 고친다. 자식 목록은 key로 짝을 찾는다. 이 가정 덕에 O(n³) 트리 비교가 O(n)이 된다 | [[reconciliation\|재조정과 state 보존]] |
| React Fiber란? 무엇을 풀었나? | React 16에서 다시 쓴 재조정 엔진이다. 렌더링을 작은 작업 단위로 쪼개 **멈추고 이어 갈 수 있게** 했고, 갱신마다 우선순위를 매긴다. 동시성 렌더링의 바닥이다 | [[ui-change-detection#React Fiber: 렌더링을 쪼개 우선순위를 매긴다\|UI 변경 감지]] |
| React는 화면을 어떻게 갱신하나? | 트리거(state 변경) → 렌더(컴포넌트 호출, 비교) → 커밋(DOM 반영) 세 단계다. 렌더는 순수해야 하고, DOM은 커밋에서만 바뀐다 | [[reconciliation#렌더링의 세 단계\|재조정]] |
| key의 역할은? 인덱스를 key로 쓰면? | key는 형제 사이에서 항목의 **정체성**이다. 형제 안에서만 유일하면 된다. 순서가 바뀌거나 중간 삽입이 있는 목록에 인덱스를 쓰면 state가 엉뚱한 항목에 붙는다. 목록이 정적이고 재정렬이 없을 때만 인덱스가 안전하다 | [[lists-and-keys\|리스트와 Key]] |
| 목록이 아닌 곳에도 key를 쓰나? | 쓴다. key를 바꾸면 같은 자리의 컴포넌트를 **새로 마운트**해 state를 초기화한다. 프로필 전환 때 폼 초기화 같은 데 쓴다 | [[reconciliation#state는 트리의 위치에 묶인다\|재조정]] |

## 컴포넌트, props, state

| 질문 | 답의 핵심 | 개념 노트 |
| --- | --- | --- |
| state와 props의 차이는? | props는 부모가 주는 **읽기 전용** 입력, state는 컴포넌트가 스스로 갖는 **바뀌는 기억**이다. props를 바꾸고 싶으면 부모의 state를 바꾸는 함수를 props로 받는다 | [[components-and-props\|컴포넌트와 Props]], [[state\|State]] |
| 컴포넌트 이름은 왜 대문자로 시작하나? | JSX는 소문자를 HTML 태그 문자열로, 대문자를 변수(컴포넌트)로 해석한다 | [[jsx\|JSX]] |
| 왜 `class` 대신 `className`인가? | JSX는 JavaScript이고 `class`는 예약어다. DOM 프로퍼티 이름(`className`, `htmlFor`)을 따른다 | [[jsx#3. 속성 이름은 camelCase, 예약어는 피한다\|JSX]] |
| Fragment는 왜 쓰나? | 여러 요소를 감싸는 불필요한 `div` 없이 하나로 묶는다. 표·Flex 레이아웃이 깨지지 않는다. 목록에서 key가 필요하면 `<Fragment key>`로 쓴다 | [[jsx#1. 최상위 요소는 하나여야 한다\|JSX]] |
| state를 직접 바꾸면 왜 안 되나? | React는 **참조가 바뀌었는지**로 변화를 안다. 객체를 직접 고치면 참조가 같아 리렌더링이 안 되고, 이전 값과 비교하는 기능(memo, 시간 여행 디버깅)도 깨진다. 객체·배열은 복사해서 새로 만들고, 깊으면 Immer를 쓴다 | [[state#불변성\|State]] |
| `setState`는 동기인가 비동기인가? | 호출 즉시 값이 바뀌지 않는다. 다음 렌더링을 **예약**할 뿐이고, 같은 이벤트 안의 호출은 묶어서(batching) 한 번 렌더링한다. 지금 렌더의 변수는 그 렌더의 스냅숏이다 | [[state#일괄 처리(batching)\|State]] |
| 업데이터 함수(`setCount(c => c + 1)`)는 언제 쓰나? | 이전 값에 기대어 계산할 때, 한 번에 여러 번 갱신할 때 쓴다. 이전 값과 무관한 값을 넣을 때는 필요 없다 | [[state#함수형 업데이트\|State]] |
| `useState`에 함수를 넘기면? | 첫 렌더링에서만 실행되는 **지연 초기화**다. `useState(heavy())`는 매 렌더마다 `heavy`를 부르지만 `useState(heavy)`는 한 번만 부른다 | [[state#지연 초기화\|State]] |
| State 끌어올리기란? | 형제가 같은 값을 써야 하면 가장 가까운 공통 부모로 state를 옮기고 값과 setter를 props로 내린다 | [[state#State 끌어올리기(Lifting State Up)\|State]] |
| prop drilling이란? 어떻게 푸나? | 쓰지 않는 중간 컴포넌트가 props를 계속 넘기는 것이다. 먼저 합성(children)으로 계층을 줄이고, 그래도 깊으면 Context나 상태 관리 라이브러리를 쓴다 | [[composition\|합성]], [[context\|Context]] |
| 컴포넌트 안에 컴포넌트를 정의하면? | 부모가 렌더링될 때마다 **새 함수 = 새 타입**이 되어 자식이 매번 언마운트·재마운트되고 state가 사라진다. 컴포넌트는 항상 최상위에 정의한다 | [[reconciliation\|재조정]] |
| 상속 대신 합성을 쓰는 이유는? | children과 props로 필요한 조합을 다 만들 수 있다. 상속 계층은 재사용보다 결합을 늘린다 | [[composition\|합성]] |
| HOC, render props, 커스텀 훅의 차이는? | 셋 다 로직 재사용 방법이다. HOC와 render props는 래퍼가 쌓이고 props 이름이 충돌한다. 대부분은 커스텀 훅으로 대체되고, HOC는 인증 가드 같은 횡단 관심사에 남는다 | [[logic-reuse-patterns\|로직 재사용 패턴]] |
| 제어 컴포넌트와 비제어 컴포넌트의 차이는? | 제어는 input 값의 출처가 React state, 비제어는 DOM 자신이다. 비제어의 초기값은 `defaultValue`로 주고 값은 ref나 `FormData`로 읽는다 | [[forms\|폼]] |
| 포털은 언제 쓰나? | 모달·툴팁처럼 부모의 `overflow`·`z-index`에 갇히면 안 되는 UI다. DOM 위치는 바뀌어도 이벤트 버블링과 Context는 React 트리를 따른다 | [[portals\|포털]] |

## Hooks

| 질문 | 답의 핵심 | 개념 노트 |
| --- | --- | --- |
| Hook의 규칙은? 왜 있나? | 최상위에서만, React 함수 안에서만 부른다. React는 훅을 **호출 순서**로 구분해 저장하므로, 조건문 안에서 부르면 순서가 밀려 다른 칸의 값을 읽는다. `eslint-plugin-react-hooks`가 검사한다 | [[hooks#Hook의 규칙\|Hooks]] |
| `useState`는 내부에서 어떻게 동작하나? | 컴포넌트(Fiber)마다 훅 연결 리스트가 있고, 렌더링 때 순서대로 꺼내 읽는다 | [[hooks#왜 순서가 중요한가\|Hooks]] |
| `useEffect`의 deps는 어떻게 동작하나? setup과 cleanup은 언제 도나? | 커밋 뒤 화면을 그린 다음 실행된다. deps 중 하나라도 `Object.is`로 달라지면 이전 cleanup → 새 setup 순서로 돈다. 언마운트 때 마지막 cleanup이 돈다 | [[hooks#useEffect\|Hooks]], [[lifecycle\|생명주기]] |
| `useEffect`에 async 함수를 넘기면? | async 함수는 Promise를 돌려주는데 React는 cleanup **함수**를 기대한다. effect 안에 async 함수를 정의해 부르고, 늦게 온 응답은 플래그로 무시한다 | [[hooks#늦게 온 응답이 최신 값을 덮는다\|Hooks]] |
| effect의 무한 루프는 왜 생기나? | effect 안에서 바꾼 state가 deps에 있거나, 매 렌더 새로 만들어지는 객체·함수가 deps에 있을 때다. 함수형 업데이트, 의존값을 effect 안으로 옮기기, 파생 값은 렌더 중 계산하기로 푼다 | [[hooks#deps에 거짓말하지 않는다\|Hooks]] |
| StrictMode에서 effect가 왜 두 번 도나? | 개발 모드에서만 마운트 → 언마운트 → 마운트를 일부러 해서 **cleanup 누락**을 드러낸다. 프로덕션에서는 한 번 돈다 | [[lifecycle#StrictMode의 이중 실행\|생명주기]] |
| `useEffect`와 `useLayoutEffect`의 차이는? | `useLayoutEffect`는 DOM 반영 직후, **화면을 그리기 전**에 동기로 돈다. 레이아웃을 측정해 깜빡임 없이 위치를 고칠 때만 쓴다. 남용하면 그리기가 막히고, 서버 렌더링에서는 실행되지 않는다 | [[hooks#주요 Hooks\|Hooks]] |
| `useState`와 `useRef`의 차이는? | 둘 다 렌더 사이에 값을 기억한다. state는 바꾸면 리렌더링되고, ref는 `.current`를 바꿔도 리렌더링되지 않는다. ref는 DOM 참조, 타이머 id, 이전 값 저장에 쓰고 렌더 중에는 읽거나 쓰지 않는다 | [[hooks#useRef: DOM 참조와 리렌더링 없는 변수\|Hooks]] |
| `useReducer`는 언제 쓰나? | 다음 state가 여러 값에 걸쳐 있거나 갱신 규칙이 복잡할 때 쓴다. 갱신 로직을 컴포넌트 밖 순수 함수로 빼서 테스트하기 쉽다. Context와 묶으면 작은 전역 스토어가 된다 | [[hooks#useReducer: 업데이트 로직을 컴포넌트 밖으로\|Hooks]], [[context#useReducer와 묶기: Provider 컴포넌트 패턴\|Context]] |
| `useMemo`와 `useCallback`의 차이는? 자식 리렌더링을 막나? | `useMemo`는 계산 **결과**를, `useCallback`은 **함수**를 기억한다. 그것만으로는 자식 리렌더링을 막지 못하고, 자식이 `memo`로 감싸져 있어야 의미가 있다. React Compiler를 쓰면 대부분 자동으로 들어간다 | [[hooks#메모이제이션: useMemo, useCallback, memo\|Hooks]] |
| `useImperativeHandle`은 언제 쓰나? | 부모에게 DOM 전체 대신 `focus()`, `scrollTo()` 같은 메서드만 노출할 때다. React 19부터 ref가 일반 prop이라 `forwardRef` 없이 쓴다 | [[react-typescript#useImperativeHandle: DOM 대신 메서드를 노출\|React와 TypeScript]] |
| `useId`는 왜 필요한가? | 서버와 클라이언트에서 **같은** 고유 id를 만들어 `label`과 `input`, `aria-*`를 잇는다. `Math.random()`은 hydration 불일치를 낳는다 | [[hooks#주요 Hooks\|Hooks]] |
| `useSyncExternalStore`는 무엇인가? | React 밖의 스토어(브라우저 API, 전역 상태 라이브러리)를 동시성 렌더링에서도 찢어짐(tearing) 없이 구독하는 훅이다. 주로 라이브러리 작성자가 쓴다 | [[react-state-management\|리액트 상태 관리]] |
| 커스텀 훅은 state를 공유하나? | 공유하지 않는다. **로직**을 공유한다. 훅을 부르는 컴포넌트마다 독립된 state가 생긴다 | [[hooks#커스텀 훅\|Hooks]] |
| `useEffectEvent`(구 `useEvent`)는 무엇인가? | effect 안에서 최신 값을 읽되 그 값이 바뀌어도 effect를 다시 돌리지 않게 하는 함수다 | [[hooks#useEffectEvent: 반응하지 않을 값 분리\|Hooks]] |

## 이벤트, 폼, 스타일

| 질문 | 답의 핵심 | 개념 노트 |
| --- | --- | --- |
| HTML 이벤트와 React 이벤트의 차이는? | 이름이 camelCase이고 문자열이 아닌 함수를 넘긴다. 기본 동작은 `return false`가 아니라 `e.preventDefault()`로 막는다 | [[react-events\|이벤트 처리]] |
| 합성 이벤트(SyntheticEvent)란? | 브라우저마다 다른 이벤트를 같은 인터페이스로 감싼 객체다. React 17부터 document가 아니라 **루트 컨테이너**에 위임해 리스너를 단다. 캡처 단계는 `onClickCapture`로 받는다 | [[react-events\|이벤트 처리]], [[dom-events\|DOM 이벤트]] |
| 핸들러에 인자는 어떻게 넘기나? 렌더마다 호출되는 실수는? | `onClick={() => remove(id)}`로 감싼다. `onClick={remove(id)}`는 렌더링 중에 바로 실행된다 | [[react-events#인자 전달\|이벤트 처리]] |
| JSX는 XSS를 어떻게 막나? | `{}`에 넣은 문자열은 렌더링 전에 **이스케이프**된다. HTML을 그대로 넣는 `dangerouslySetInnerHTML`과 `javascript:` URL만 예외라 정제(sanitize)가 필요하다 | [[web-security\|웹 보안: CSRF와 XSS]] |
| 폼은 무엇으로 다루나? | 단순하면 제어 컴포넌트나 React 19 폼 액션, 필드가 많으면 React Hook Form을 쓴다 | [[forms\|폼]], [[react-hook-form\|react-hook-form]] |
| 스타일은 어떻게 입히나? CSS-in-JS를 권하나? | CSS Modules, Tailwind, CSS-in-JS 중 고른다. 런타임 CSS-in-JS는 서버 컴포넌트·스트리밍과 맞지 않아, 새 프로젝트는 CSS Modules·Tailwind나 빌드 타임 방식으로 기운다 | [[styling\|스타일링]] |

## 성능

| 질문 | 답의 핵심 | 개념 노트 |
| --- | --- | --- |
| 무엇이 리렌더링을 일으키나? | 자기 state 변경, 부모의 리렌더링, 구독한 Context 값 변경이다. props가 바뀌어서가 아니라 **부모가 다시 렌더링되어서** 자식이 렌더링된다 | [[re-rendering\|리렌더링 원인 추적하기]] |
| `React.memo`는 언제 효과가 없나? Context 구독자도 막나? | props로 매번 새 객체·함수를 넘기면 얕은 비교가 실패한다. `memo`는 props만 보므로 Context 값이 바뀌면 그 Context를 읽는 컴포넌트는 **막지 못한다** | [[re-rendering#React.memo가 효과 없는 경우\|리렌더링]], [[context\|Context]] |
| Context 값이 객체일 때 흔한 함정은? | Provider가 렌더링될 때마다 `{ user, setUser }`가 새 객체라 모든 구독자가 리렌더링된다. 값을 `useMemo`로 묶거나 Context를 나눈다 | [[context\|Context]] |
| 자동 배칭(automatic batching)이란? 막을 수 있나? | React 18부터 이벤트 핸들러뿐 아니라 Promise, `setTimeout` 안의 여러 setState도 한 번에 렌더링한다. 꼭 바로 반영해야 하면 `flushSync`로 감싼다 | [[state#일괄 처리(batching)\|State]] |
| 코드 스플리팅은 어떻게 하나? | `React.lazy(() => import('./Page'))`와 `Suspense`로 라우트 단위로 쪼갠다. `lazy`는 default export만 받으므로 named export는 다시 내보내는 모듈을 하나 둔다 | [[code-splitting\|코드 스플리팅]] |
| 긴 목록은 어떻게 그리나? | 보이는 항목만 DOM에 두는 가상화(windowing)를 쓴다 | [[list-virtualization\|리스트 가상화]] |
| React Compiler란? | 빌드 단계에서 컴포넌트를 분석해 `useMemo`·`useCallback`·`memo`에 해당하는 메모이제이션을 **자동으로** 넣는 도구다. 수동 메모이제이션 질문의 답이 「대부분 컴파일러에 맡긴다」로 바뀌었다 | [[hooks#메모이제이션: useMemo, useCallback, memo\|Hooks]] |

## 에러 처리

| 질문 | 답의 핵심 | 개념 노트 |
| --- | --- | --- |
| 에러 바운더리란? 어디에 두나? | 하위 트리의 **렌더링 중** 에러를 잡아 대체 UI를 보여 주는 컴포넌트다. 화면 전체 하나보다 기능 영역마다 둬야 한 곳의 에러가 앱 전체를 하얗게 만들지 않는다 | [[frontend-error-handling\|프런트엔드 에러 핸들링]] |
| 에러 바운더리가 못 잡는 에러는? | 이벤트 핸들러, 비동기 코드(`setTimeout`, Promise), 서버 렌더링, 바운더리 자신의 에러다. 이벤트 핸들러는 `try/catch`로 잡는다 | [[frontend-error-handling#이벤트 핸들러와 비동기 코드의 에러\|프런트엔드 에러 핸들링]] |
| 함수 컴포넌트로 에러 바운더리를 만들 수 있나? | 아직 클래스(`getDerivedStateFromError`, `componentDidCatch`)로만 만든다. 실무에서는 `react-error-boundary`를 쓴다 | [[frontend-error-handling\|프런트엔드 에러 핸들링]] |

## React 18·19와 서버 렌더링

| 질문 | 답의 핵심 | 개념 노트 |
| --- | --- | --- |
| 동시성 렌더링이란? | 급한 갱신(입력)이 급하지 않은 갱신(목록 필터링)을 **끊고 먼저** 처리되게 하는 것이다. `useTransition`은 갱신 함수를, `useDeferredValue`는 값을 덜 급하게 표시한다 | [[concurrent-rendering\|동시성 렌더링]] |
| Suspense는 무엇을 하나? | 자식이 준비되지 않았을 때(코드 로딩, 데이터 대기) fallback을 보여 주는 **선언적 로딩 경계**다 | [[concurrent-rendering\|동시성 렌더링]], [[frontend-error-handling#선언적 처리: Suspense + ErrorBoundary\|에러 핸들링]] |
| hydration이란? | 서버가 보낸 HTML에 클라이언트 React가 이벤트 핸들러와 state를 **붙이는** 과정이다. 서버와 클라이언트의 첫 렌더 결과가 다르면 불일치 에러가 난다 | [[spa-csr-ssr\|SPA와 CSR·SSR]] |
| 스트리밍 SSR과 `renderToPipeableStream`은? | `renderToString`은 전체 HTML이 다 될 때까지 기다린다. 스트리밍은 준비된 부분부터 보내고 Suspense 경계의 나머지를 나중에 끼워 넣으며, 선택적 hydration으로 사용자가 누른 곳부터 살린다 | [[streaming-ssr\|스트리밍 SSR]] |
| React Server Components란? SSR과 다른가? | 서버에서만 실행되어 번들에 포함되지 않는 컴포넌트다. SSR은 첫 HTML을 만드는 **시점**의 문제이고, RSC는 컴포넌트가 **어디서 실행되는가**의 문제다. 둘은 함께 쓴다 | [[react-server-components\|React Server Components]] |
| 서버 컴포넌트와 클라이언트 컴포넌트는 언제 나누나? | 데이터 읽기·무거운 라이브러리는 서버, state·이벤트·브라우저 API가 필요하면 `'use client'`다. 클라이언트 경계는 트리의 잎 쪽으로 내린다 | [[server-client-components\|서버·클라이언트 컴포넌트]] |
| Server Actions(Server Functions)란? | `'use server'`로 표시한 서버 함수를 클라이언트에서 부르거나 폼 `action`에 넘기는 기능이다. API 라우트 없이 변경을 처리한다 | [[forms#폼 액션 (React 19)\|폼]] |
| React 19에 무엇이 들어왔나? | Actions와 `useActionState`(옛 `useFormState`)·`useFormStatus`·`useOptimistic`, Promise·Context를 읽는 `use`, ref as prop, `<title>`·`<link>` 같은 문서 메타데이터 렌더링 | [[forms\|폼]], [[react-use-hook\|use 훅]], [[concurrent-rendering\|동시성 렌더링]] |
| `useOptimistic`은? | 서버 응답 전에 결과를 미리 화면에 보여 주고, 요청이 끝나면 실제 state로 돌아가는 훅이다 | [[forms\|폼]] |
| Next.js의 Pages Router와 App Router 차이는? | App Router는 서버 컴포넌트가 기본이고, 레이아웃 중첩·스트리밍·서버 액션을 쓴다. Pages Router는 `getServerSideProps` 같은 페이지 단위 데이터 함수를 쓴다 | [[nextjs-app-router\|Next.js App Router]] |

## 상태 관리

| 질문 | 답의 핵심 | 개념 노트 |
| --- | --- | --- |
| 클라이언트 상태와 서버 상태의 차이는? | 서버 상태는 서버가 원본이고 캐시·재요청·무효화가 필요하다. TanStack Query·SWR에 맡기고, 전역 스토어에는 순수 UI 상태만 둔다. 「API 데이터를 전부 Redux에 넣나?」의 답도 이것이다 | [[react-state-management\|리액트 상태 관리]], [[tanstack-query\|TanStack Query]] |
| Context와 Redux의 차이는? | Context는 값을 **전달**하는 도구이고 상태 관리 도구가 아니다. 값이 바뀌면 구독자 전체가 리렌더링된다. 자주 바뀌는 전역 상태에는 선택적 구독이 되는 스토어(Redux Toolkit, Zustand)가 낫다 | [[context#Context는 전달 도구이지 상태 관리 도구가 아니다\|Context]] |
| Flux와 Redux, 세 가지 원칙은? | 데이터가 한 방향으로만 흐른다. Redux는 store 하나, 읽기 전용 state, 순수 함수 reducer라는 규칙을 더했다 | [[redux\|Redux]] |
| 왜 Redux Toolkit을 쓰나? | 보일러플레이트(상수, 액션 생성자, 불변 갱신)를 `createSlice`와 내장 Immer가 없앤다. 지금 Redux 공식 권장 방식이다 | [[redux#Redux Toolkit으로 쓰기\|Redux]] |
| selector와 `createSelector`는? 불필요한 리렌더링을 어떻게 막나? | `useSelector`는 반환값을 참조로 비교한다. 필요한 조각만 고르고, 새 배열·객체를 만드는 계산은 `createSelector`로 메모이즈한다. 파생 값은 store에 넣지 않고 selector로 계산한다 | [[redux#useSelector 리렌더링 최적화\|Redux]] |
| Redux 미들웨어와 비동기 처리는? thunk와 saga의 차이는? | 미들웨어는 `store => next => action` 체인이다. thunk는 함수를 dispatch하는 단순한 방식, saga는 제너레이터로 복잡한 흐름(취소, 경쟁)을 다룬다. 데이터 요청은 RTK Query가 기본이다 | [[redux-middleware\|Redux 미들웨어]] |

## 라우팅과 테스트

| 질문 | 답의 핵심 | 개념 노트 |
| --- | --- | --- |
| `BrowserRouter`, `HashRouter`, `MemoryRouter`의 차이는? | History API로 깨끗한 URL(서버 설정 필요), `#` 뒤에 경로(서버 설정 불필요), 메모리 안에서만(테스트·임베드)이다 | [[client-side-routing\|클라이언트 사이드 라우팅]] |
| 프로그래밍 방식 이동, 보호 라우트, 404는? | `useNavigate()`로 이동한다. 보호 라우트는 인증을 확인해 `<Navigate replace>`로 보내는 레이아웃 라우트, 404는 `path="*"` 라우트다 | [[react-router-layout\|react-router 레이아웃]] |
| `Link`, `NavLink`, `<a>`의 차이는? | `<a>`는 페이지를 새로 불러온다. `Link`는 History API로 이동해 앱 상태를 유지하고, `NavLink`는 현재 경로면 활성 스타일을 준다 | [[react-router-layout#이동: Link, NavLink, useNavigate\|react-router 레이아웃]] |
| React 컴포넌트는 어떻게 테스트하나? | Testing Library로 사용자가 보는 역할·텍스트를 찾아 상호작용하고, 구현 세부(state, 내부 메서드)는 검사하지 않는다. 러너는 Vitest나 Jest다 | [[test-primitives\|테스트 기본 도구]], [[a11y-driven-testing\|접근성 기반 테스트]] |

## 낡은 질문에 지금 답하기

원문 질문의 상당수는 React 15~16 시절 것이다. 이런 질문이 나오면 **옛 방식을 짧게 설명하고 지금 무엇으로 바뀌었는지**까지 말한다.

| 옛 질문 | 지금의 답 |
| --- | --- |
| 클래스 컴포넌트를 언제 쓰나? 생명주기 메서드 순서는? | 새 코드는 함수 컴포넌트와 Hooks로 쓴다. 클래스는 에러 바운더리와 레거시 코드 읽기에만 필요하다([[lifecycle\|생명주기]]의 대응표) |
| `super(props)`, 메서드 바인딩, `setState` 콜백 | 클래스 전용 문법이다. 함수 컴포넌트에는 `this`가 없다 |
| PureComponent, `shouldComponentUpdate` | 함수 컴포넌트에서는 `React.memo`이고, React Compiler가 대부분 대신한다 |
| PropTypes, `defaultProps`, Flow | React 19는 함수 컴포넌트의 `propTypes` 검사와 `defaultProps`를 없앴다. 타입은 TypeScript로, 기본값은 매개변수 구조 분해의 기본값으로 준다([[react-typescript\|React와 TypeScript]]) |
| 문자열 ref, `findDOMNode`, `forwardRef` | 문자열 ref와 `findDOMNode`는 React 19에서 제거됐다. `useRef`를 쓰고, ref는 일반 prop으로 넘긴다 |
| `ReactDOM.render`, `renderToNodeStream` | React 19에서 제거됐다. `createRoot().render()`와 `renderToPipeableStream`을 쓴다 |
| Mixins, `createReactClass` | 커스텀 훅으로 대체됐다 |
| Create React App의 장점은? | CRA는 2025년 지원이 끝났다. Vite로 시작하거나 Next.js·React Router 같은 프레임워크를 쓴다([[tooling\|React 빌드 환경]]) |
| React Router v4의 `history.push`, `withRouter` | `useNavigate`, `useParams`, `useSearchParams` 훅으로 바뀌었다. v7은 Remix와 합쳐져 `loader`·`action` 데이터 API를 갖는다 |
| Redux Form, `connect`, `mapStateToProps` | 폼은 React Hook Form, Redux 연결은 `useSelector`·`useDispatch` 훅으로 한다 |
| Enzyme의 shallow 렌더링, `ReactTestUtils` | Testing Library로 실제처럼 렌더링해 사용자 관점으로 검사한다 |
| async mode와 concurrent mode의 차이 | 같은 실험 기능의 옛 이름이다. React 18부터 「모드」가 아니라 `startTransition` 같은 **동시성 기능**을 골라 쓴다 |

## 정리

- React 질문은 **재조정 규칙, 렌더 스냅숏과 불변성, 훅의 호출 순서, 리렌더링 원인** 네 원리에서 대부분 나온다. 원리로 답하면 변형 질문에도 버틴다.
- 답은 한 문장 정의로 시작하고, 「왜 그렇게 설계됐나」와 「실무에서 생기는 함정」을 한 가지씩 덧붙인다.
- React 18·19 질문(동시성, 서버 컴포넌트, Actions, Compiler)은 시니어 면접일수록 비중이 크다.
- 낡은 질문에는 옛 방식과 지금의 대체재를 함께 말해 최신 생태계를 따라가고 있음을 보인다.

관련 노트: [[frontend-interview|프론트엔드 면접 유형과 준비법]], [[tech-interview-prep|기술 면접 준비]], [[hooks|Hooks]], [[reconciliation|재조정과 state 보존]], [[ui-change-detection|UI 변경 감지]]
