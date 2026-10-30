---
title: "UI 변경 감지: 상태가 바뀌면 화면은 어떻게 따라 바뀌나"
concept: "Change Detection"
summary: "UI 프레임워크의 핵심 문제는 상태를 화면으로 투영하고, 상태가 바뀌었을 때 최소한의 DOM만 고치는 것이다. 전부 새로 그리기, 수동 재렌더, 데이터 바인딩(관찰 가능한 모델·Proxy), 더티 체킹(AngularJS digest·zone.js), 가상 DOM 비교, 불변 데이터로 비교 건너뛰기, 시그널, 컴파일러까지 변경을 '언제·어떻게 아는가'로 나눠 비교하고, React Fiber가 렌더링을 쪼개 우선순위를 매기는 방식을 정리한다."
tags: ["frontend", "architecture", "rendering", "react", "state"]
source: other
date: "2026-10-21"
sources: ["http://teropa.info/blog/2015/03/02/change-and-its-detection-in-javascript-frameworks.html", "https://blog.risingstack.com/functional-ui-and-components-as-higher-order-functions/", "https://gist.github.com/duivvv/2ba00d413b8ff7bc1fa5a2e51c61ba43", "https://prepare-frontend-interview.vercel.app/react"]
---

> Tero Parviainen의 「[Change And Its Detection In JavaScript Frameworks](http://teropa.info/blog/2015/03/02/change-and-its-detection-in-javascript-frameworks.html)」(2015)를 뼈대로, 「[Functional UI and Components as Higher Order Functions](https://blog.risingstack.com/functional-ui-and-components-as-higher-order-functions/)」와 「[What is React Fiber?](https://gist.github.com/duivvv/2ba00d413b8ff7bc1fa5a2e51c61ba43)」를 더해 재구성한 노트다.
> 「[프론트엔드 면접 준비: React](https://prepare-frontend-interview.vercel.app/react)」 정리로 Fiber의 두 트리 구조을 보강했다.

## 문제: 상태를 화면에 투영하기

렌더링은 **앱 상태(객체·배열·문자열)를 DOM 트리로 투영하는 일**이다. 한 번 그리는 것은 단순한 함수다.

```text
UI = f(state)
```

어려운 것은 **상태가 시간에 따라 바뀔 때**다. 사용자 입력이나 서버 응답으로 상태가 바뀌면 화면도 따라 바뀌어야 하고, DOM 조작은 비싸므로 바뀐 곳만 고치고 싶다. 프레임워크마다 다른 것은 결국 두 질문의 답이다.

- **무엇이 바뀌었는지 언제 아는가**: 바뀌는 순간 / 나중에 비교해서 / 컴파일할 때
- **어디를 다시 그릴지 어떻게 정하는가**: 개발자가 / 바인딩이 / 비교 알고리즘이

`f`를 순수 함수로 만들면(같은 상태에서 같은 화면) 화면을 예측하고 테스트하기 쉬워진다. 컴포넌트가 함수라면 고차 함수로 감싸 기능을 더하고(`withAuth(Page)`처럼), 작은 함수를 합성해 큰 화면을 만든다. 이 관점은 [[functional-programming|함수형 프로그래밍]]에서 왔다.

## 방식 비교

| 방식 | 변경을 아는 법 | 대표 | 대가 |
| --- | --- | --- | --- |
| 전부 새로 그리기 | 알 필요 없다. 요청마다 서버가 새 페이지를 만든다 | 서버 렌더링 MPA | 상호작용마다 왕복과 전체 새로고침 |
| 수동 재렌더 | 모델이 change 이벤트만 낸다. 무엇을 다시 그릴지는 **개발자가** 정한다 | Backbone, 초기 Ext JS·Dojo | 크게 다시 그리면 느리고, 잘게 고치면 코드가 복잡하다 |
| 데이터 바인딩 (관찰) | 모델을 **특수 객체**로 감싸 값을 쓰는 순간 안다 | Ember(`set()`), Knockout(observable), Vue(`Proxy`), MobX | 데이터를 프레임워크가 아는 방식으로 다뤄야 한다 |
| 더티 체킹 | 모른다. 이벤트가 끝날 때마다 **모든 감시자(watcher)를 돌려** 이전 값과 비교한다 | AngularJS의 digest, Angular의 zone.js 기반 감지 | 감시 대상이 많으면 매번 전부 비교한다 |
| 가상 DOM 비교 | 모른다. **전부 다시 그린 가상 트리**를 이전 트리와 비교(diff)해 차이만 DOM에 반영한다 | React, Preact, Vue의 렌더 단계 | 컴포넌트 함수를 다시 실행하고 트리를 비교하는 비용 |
| 불변 데이터 + 참조 비교 | 참조가 같으면 **바뀌지 않았다**고 확신한다 | Om, `React.memo`·`PureComponent`, Redux 셀렉터 | 데이터를 항상 복사해서 바꿔야 한다 |
| 시그널 (세밀한 반응성) | 값을 **읽을 때 구독**하고 쓸 때 그 값을 읽은 곳에만 알린다 | Solid, Vue 반응성, Svelte 5 룬, Angular Signals, Preact Signals | 반응성 규칙(구조 분해하면 추적이 끊기는 등)을 알아야 한다 |
| 컴파일러 | **빌드할 때** 어느 값이 어느 노드에 쓰이는지 분석한다 | Svelte, React Compiler(메모이제이션 자동 삽입) | 컴파일러가 이해하는 문법 안에서 써야 한다 |

### 데이터 바인딩: 바뀌는 순간 안다

모델이 「바뀌었다」는 이벤트를 내고, 화면 쪽에 붙은 바인딩이 그 이벤트를 받아 해당 DOM만 고친다. 바인딩을 처음 걸 때 비용이 들지만 이후 갱신은 가장 적은 일만 한다. 과거 Ember는 `foo.x = 42` 대신 `foo.set('x', 42)`처럼 정해진 setter를 써야 했다. 지금은 ES2015 `Proxy`가 평범한 객체 대입을 가로채 주므로 Vue 3처럼 일반 문법으로 쓴다([[proxy-and-reflect|Proxy와 Reflect]]).

### 더티 체킹: 나중에 전부 비교한다

AngularJS는 템플릿의 `{{foo.x}}`마다 감시자를 만들고, 클릭 핸들러·HTTP 응답·타이머가 끝날 때마다 digest를 돌려 모든 감시자의 값을 이전 값과 비교했다. 모델에 제약이 없다는 장점이 있고, 비교는 DOM을 건드리지 않는 참조 비교라 생각보다 빠르다. 다만 화면이 크면 매번 전부를 훑는다. Angular 2+는 zone.js로 비동기 작업이 끝나는 시점을 잡아 컴포넌트 트리를 위에서 아래로 한 번 검사하는 방식으로 바꿨고, 이후 Signals를 들여와 Angular 21부터 새 프로젝트는 zone.js 없이(zoneless) 시작한다.

### 가상 DOM: 다시 그리고 비교한다

React는 서버 렌더링 시절처럼 **매번 전부 다시 그린다**는 단순한 모델로 돌아갔다. 다만 진짜 DOM이 아니라 가벼운 JavaScript 객체 트리(가상 DOM)에 그린다. 새 트리와 이전 트리를 비교해 바뀐 노드만 진짜 DOM에 패치한다. 첫 렌더와 갱신이 같은 코드 경로라 컴포넌트가 상태 동기화를 신경 쓰지 않는다.

트리가 크거나 초당 60번 그려야 하면 비교 자체가 병목이 된다. 이때 **불변 데이터**가 탈출구다. 상태를 바꿀 때마다 새 객체를 만들면, 다시 그릴 때 참조가 이전과 같은 하위 트리는 내용을 볼 필요 없이 이전 결과를 재사용한다. 불변 데이터의 더 큰 이득은 성능보다 **상태 변화를 추적하기 쉬운 구조**다. React에서 이 건너뛰기는 `React.memo`가 맡고, React Compiler는 이를 빌드할 때 자동으로 넣는다. 실제로 리렌더링을 줄이는 순서는 [[re-rendering|리렌더링 원인과 추적]]에 있다.

### 시그널과 컴파일러: 처음부터 어디를 고칠지 안다

시그널은 데이터 바인딩의 현대판이다. 계산이나 화면이 실행되면서 **읽은 시그널을 자동으로 의존성으로 기록**하고, 시그널에 쓰면 그 값을 읽은 곳만 다시 실행한다. 가상 DOM 비교 없이 바뀐 텍스트 노드 하나만 고칠 수 있다. 의존성 추적의 원리는 [[reactive-programming|반응형 프로그래밍과 RxJS]]에, Svelte가 이를 컴파일 결과로 만드는 방식은 [[frontend-frameworks|React와 Vue 말고: Svelte, Angular, Preact, Alpine.js, HTMX]]에 있다.

## React Fiber: 렌더링을 쪼개 우선순위를 매긴다

가상 DOM 비교는 원래 **한 번 시작하면 끝까지** 동기로 돌았다(스택 재조정자). 트리가 크면 그동안 메인 스레드가 막혀 입력과 애니메이션이 끊긴다. React 16(2017)은 재조정자를 **Fiber**로 다시 썼다.

| 개념 | 내용 |
| --- | --- |
| fiber | 컴포넌트 하나에 대응하는 작업 단위 객체. 호출 스택 대신 연결 리스트로 트리를 걸어, 중간에 멈췄다 이어 갈 수 있다 |
| 두 트리(더블 버퍼링) | 화면에 반영된 **current** 트리와 이번 갱신을 계산하는 **workInProgress** 트리를 둔다. 같은 자리의 두 fiber는 `alternate`로 서로를 가리켜 객체를 재사용한다. commit이 끝나면 루트의 `current` 포인터만 바꿔 두 트리의 역할을 맞바꾼다 |
| 점진적 렌더링 | 렌더 작업을 잘게 나눠 여러 프레임에 펼친다. 스케줄러가 짧은 간격(기본 5ms 안팎)마다 브라우저에 제어를 돌려준다 |
| 두 단계 | **render 단계**(무엇이 바뀌는지 계산)는 멈추고·버리고·다시 할 수 있다. **commit 단계**(DOM 반영)는 화면이 어긋나지 않게 한 번에 동기로 끝낸다 |
| 우선순위 | 입력 같은 급한 갱신이 화면 전환 같은 느린 갱신을 앞지른다. 새 갱신이 오면 진행 중인 낮은 우선순위 작업을 버리고 다시 시작한다 |

흔히 「가상 DOM」이라 부르는 것은 이 fiber 트리다. current 트리의 호스트 fiber는 `stateNode`로 실제 DOM 노드를 붙잡고 있어 화면과 1:1로 맞물린다. render 단계는 workInProgress 트리만 고치므로 계산 도중에 버려도 화면은 그대로다. 두 트리의 차이가 commit 단계의 DOM 변경 목록이 된다.

Fiber가 깐 바닥 위에 React 18(2022)이 **동시성 기능**을 열었다. `createRoot`로 만든 앱에서 `startTransition`·`useTransition`으로 감싼 갱신은 급하지 않은 갱신이 되어 입력을 막지 않고, `useDeferredValue`는 값의 갱신을 늦춘다. Suspense의 스트리밍 SSR과 선택적 hydration도 같은 기반이다. 긴 작업을 쪼개 메인 스레드를 비우는 일반 기법은 [[inp-optimization|INP 최적화: 긴 작업 쪼개기와 양보]]에 있다.

## 정리

- 변경 감지는 「바뀐 걸 언제 아는가」의 문제다. **쓰는 순간**(바인딩·시그널), **나중에 비교**(더티 체킹·가상 DOM), **빌드할 때**(컴파일러)로 나뉜다.
- 바뀌는 순간 알려면 데이터를 프레임워크가 감싸야 하고, 감싸지 않으려면 비교 비용을 낸다.
- 불변 데이터는 「바뀌지 않았다」를 참조 비교 한 번으로 알려 주는 탈출구다.
- 프레임워크는 시그널과 컴파일러 쪽으로 모이고 있다. React는 가상 DOM을 유지하면서 Fiber로 작업을 쪼개고 컴파일러로 비교를 줄인다.

관련 노트: [[reactive-programming|반응형 프로그래밍과 RxJS]], [[frontend-mv-architecture|프론트엔드 MV* 아키텍처의 흐름: MVC에서 MVI까지]], [[re-rendering|리렌더링 원인과 추적]], [[frontend-frameworks|React와 Vue 말고: Svelte, Angular, Preact, Alpine.js, HTMX]], [[browser-rendering|브라우저 렌더링 과정]]
