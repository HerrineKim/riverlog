---
title: "React와 Vue 비교"
concept: "React vs Vue"
summary: "같은 범주(컴포넌트 기반 선언형 UI, 가상 DOM)에 속하는 React와 Vue의 차이를 정리한다. JSX와 템플릿, 불변 상태와 반응형 상태, 단방향 흐름과 v-model, 라이브러리와 공식 생태계의 범위를 비교하고, 흔한 오해와 고르는 기준을 다룬다."
tags: ["frontend", "react", "vue", "javascript"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/f27f6183052343e1ab908f8175bd4a88", "https://vuejs.org/guide/extras/rendering-mechanism", "https://react.dev/learn/start-a-new-react-project", "https://github.com/sudheerj/vuejs-interview-questions-korean/blob/master/README.md", "https://github.com/gyoogle/tech-interview-for-developer/blob/master/Web/Vue/Vue.js%20%EB%9D%BC%EC%9D%B4%ED%94%84%EC%82%AC%EC%9D%B4%ED%81%B4%20%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0.md"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「React와 Vue의 장단점 비교」를 바탕으로 재구성한 노트다.
> 생명 주기 행은 gyoogle의 「[tech-interview-for-developer](https://github.com/gyoogle/tech-interview-for-developer)」 Vue 라이프사이클 문서를 바탕으로, Vue 3 공식 문서로 확인해 보강했다.

**React**(Meta와 커뮤니티가 관리)와 **Vue**(Evan You와 커뮤니티가 관리)는 둘 다 **데이터로 컴포넌트를 렌더링하는 선언형 UI 도구**다. 상태를 바꾸면 화면은 도구가 알아서 갱신하고, 화면은 재사용 가능한 컴포넌트를 조립해 만든다. 같은 범주라 하나를 깊게 알면 다른 하나는 빨리 익힌다([[tech-stack-selection|기술 스택 고르기]]). 차이는 **상태 변화를 어떻게 감지하느냐**와 **UI를 무엇으로 쓰느냐**에서 갈린다.

## 공통점

- 컴포넌트 기반, 선언형 렌더링.
- 가상 DOM을 만들어 이전과 비교한 뒤 바뀐 부분만 실제 DOM에 반영한다([[browser-rendering|브라우저 렌더링]]).
- 코어는 뷰 계층에 집중하고, 라우팅·전역 상태는 동반 라이브러리가 맡는다.
- 부모에서 자식으로 props가 내려가는 **단방향 데이터 흐름**이 기본이다.

## 차이

| 기준 | React | Vue |
| --- | --- | --- |
| UI 작성 | **JSX**: JavaScript 안에 마크업을 쓴다. 조건·반복도 JS 문법(`&&`, `map`) | **템플릿**: HTML 안에 `v-if`, `v-for` 같은 디렉티브. 단일 파일 컴포넌트(`.vue`)에 템플릿·스크립트·스타일을 함께 둔다. JSX도 쓸 수 있다 |
| 상태와 변경 감지 | 상태는 **불변**으로 다룬다. `setState`로 새 값을 넘기면 그 컴포넌트를 다시 렌더링한다 | 상태는 **반응형 객체**(`ref`, `reactive`)다. 값을 바로 고치면 Proxy가 의존성을 추적해 그 값을 쓰는 곳만 갱신한다 |
| 불필요한 렌더링 | 부모가 렌더링되면 자식도 함께 렌더링된다. React Compiler(또는 `memo`·`useMemo`)로 줄인다 | 의존성 추적 덕분에 기본적으로 필요한 컴포넌트만 갱신된다 |
| 가상 DOM 비교 | 트리 전체를 비교 | 컴파일러가 템플릿의 정적 부분을 미리 표시해 동적인 곳만 비교한다 |
| 생명 주기 | `useEffect`의 실행과 정리 함수로 마운트·갱신·언마운트를 한꺼번에 다룬다([[lifecycle\|컴포넌트 생명주기]]) | 단계마다 훅이 따로 있다. Composition API는 `setup()`(옛 `beforeCreate`·`created` 자리) → `onBeforeMount` → `onMounted`(DOM 접근 가능) → `onBeforeUpdate` → `onUpdated` → `onBeforeUnmount` → `onUnmounted`. Vue 2의 `beforeDestroy`·`destroyed`는 Vue 3에서 `beforeUnmount`·`unmounted`로 이름이 바뀌었다 |
| 폼 입력 | 값과 `onChange`를 직접 연결하는 제어 컴포넌트 | `v-model`이 값 바인딩과 이벤트 처리를 한 번에 해 주는 문법 설탕 |
| 공식 범위 | 코어만. 라우터·상태 관리는 커뮤니티 선택. 새 앱은 Next.js나 React Router 같은 프레임워크로 시작하는 것을 공식 문서가 권한다 | 라우터(Vue Router)·상태 관리(Pinia)·빌드 도구(Vite)를 공식 팀이 함께 관리한다. 풀스택은 Nuxt |
| 모바일 | React Native로 네이티브 앱까지 같은 모델을 쓴다 | 공식 네이티브 솔루션은 없다. Capacitor·Ionic 같은 하이브리드나 NativeScript를 쓴다 |

React의 상태와 리렌더링은 [[state|State]], [[re-rendering|리렌더링]]에, Vue의 반응성이 속한 MVVM 계보는 [[frontend-mv-architecture|프론트엔드 MV* 아키텍처]]에 있다.

## 흔한 오해

| 오해 | 실제 |
| --- | --- |
| "Vue는 양방향 바인딩, React는 단방향" | Vue도 props는 단방향이다. `v-model`은 `value` 바인딩 + `input` 이벤트를 줄인 문법일 뿐이다. React도 같은 일을 제어 컴포넌트로 직접 쓴다 |
| "React는 앱이 커지면 느려진다" | 규모 자체보다 불필요한 리렌더링이 문제다. 상태를 쓰는 곳 가까이 두고, 컴파일러·메모이제이션으로 다룬다 |
| "Vue는 테스트가 어렵다" | Vitest + Vue Test Utils, Testing Library로 React와 같은 방식으로 테스트한다([[frontend-test-types\|프론트엔드 테스트의 종류]]) |
| "Vue는 작은 프로젝트용" | 대규모 서비스에도 쓰인다. 다만 생태계·채용 시장의 크기는 React가 훨씬 크다 |

## 어떻게 고르나

| 상황 | 기울어지는 쪽 |
| --- | --- |
| HTML·CSS에 익숙하고 빨리 결과물을 내고 싶다 | Vue. 템플릿이 HTML에 가깝고 공식 도구가 한 벌로 맞춰져 있다 |
| 팀마다 코드 모양이 달라지는 게 걱정이다 | Vue. 권장 방식이 정해져 있어 코드가 비슷해진다 |
| 라이브러리 선택지, 레퍼런스, 채용 풀이 중요하다 | React |
| 웹과 모바일 앱을 같은 모델로 만들고 싶다 | React (React Native) |
| JavaScript 표현력을 UI에서 그대로 쓰고 싶다 | React. JSX는 결국 JavaScript다 |

둘 다 성숙했고 어느 쪽으로도 대부분의 서비스를 만들 수 있다. 결정은 성능 수치보다 **팀이 이미 아는 것, 채용, 필요한 생태계**로 내리는 편이 맞다. 다른 선택지(Svelte, Angular, Solid 등)는 [[frontend-frameworks|React와 Vue 말고]]에 있다.

## 정리

- React와 Vue는 같은 범주다. 컴포넌트, 선언형 렌더링, 가상 DOM, 단방향 props.
- React = JSX + 불변 상태 + 다시 렌더링해서 비교. Vue = 템플릿 + 반응형 상태 + 의존성 추적.
- Vue의 `v-model`은 양방향 바인딩처럼 보이는 문법 설탕이다.
- 생태계 범위가 다르다. Vue는 공식 도구 한 벌, React는 코어 + 프레임워크·커뮤니티 선택.

Vue 개념을 질문으로 점검하려면 [Vue.js 면접 질문 모음(한국어)](https://github.com/sudheerj/vuejs-interview-questions-korean/blob/master/README.md)을 본다. Vue 2 시절 질문이 섞여 있으므로 Options API·필터·이벤트 버스 같은 항목은 Vue 3 문서와 대조한다.

관련 노트: [[frontend-frameworks|React와 Vue 말고: 다른 프론트엔드 프레임워크]], [[frontend-mv-architecture|프론트엔드 MV* 아키텍처]], [[vuex|Vue 상태 관리: Pinia(옛 Vuex)]], [[tech-stack-selection|기술 스택 고르기]]
