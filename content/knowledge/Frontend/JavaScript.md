---
title: "JavaScript"
concept: "JavaScript"
summary: "브라우저를 조작할 수 있는 유일한 언어이자, ECMAScript 표준을 따르는 동적 타입 언어."
tags: ["javascript", "frontend", "browser"]
source: mixed
---

JavaScript는 브라우저 화면을 **동적으로** 만들기 위한 언어이며, 브라우저(BOM)와 그 안의 문서(DOM)를 조작할 수 있는 유일한 언어다. 언어의 핵심 문법은 **ECMAScript** 표준으로 정의된다. ECMA International이 ECMA-262 규격으로 정의한 언어가 ECMAScript이고, 2015년에 발표된 6번째 판(ES6, ES2015)부터 `let`/`const`, 화살표 함수, Promise, 클래스 같은 현대적 문법이 대거 들어왔다.

## 노트

### 언어 기초
- [변수와 데이터 타입](/knowledge/dictionary/frontend/javascript/variables-and-types): 식별자 규칙, let·const·var, 호이스팅, 원시·참조 타입, null과 undefined
- [연산자와 제어문](/knowledge/dictionary/frontend/javascript/operators-and-control-flow): `==` vs `===`, 단축 평가와 `?.`·`??`, 삼항 연산자, if·switch, for·for...in·for...of
- [함수와 this](/knowledge/dictionary/frontend/javascript/functions): 선언식·표현식, 화살표 함수, rest·spread, this와 bind
- [배열·객체·문자열](/knowledge/dictionary/frontend/javascript/arrays-and-objects): 주요 메서드, map·filter·reduce, ES6 객체 문법, 구조 분해, 옵셔널 체이닝, JSON
- [템플릿 리터럴](/knowledge/dictionary/frontend/javascript/template-literals): 여러 줄·표현식 삽입·중첩, 태그드 템플릿과 styled-components의 원리
- [class 문법](/knowledge/dictionary/frontend/javascript/class): 생성자 함수와 new, constructor, static, extends, getter·setter, private 필드
- [모듈: export와 import](/knowledge/dictionary/frontend/javascript/es-modules): named export와 default export, export default 논쟁
- [JavaScript 디자인 패턴: 생성 패턴](/knowledge/dictionary/frontend/javascript/js-design-patterns): 생성자·모듈·싱글톤·프로토타입 패턴과 프로토타입 기반 언어의 차이
- [Date 객체](/knowledge/dictionary/frontend/javascript/date-object): 0부터 시작하는 getMonth()의 유래, 서버 시간대와 관계없이 한국 시간 구하기
- [TypeScript 코딩 컨벤션](/knowledge/dictionary/frontend/javascript/typescript-coding-convention): 이름 짓기, 타입, 클래스, 배열 메서드, 에러 처리, 모듈 규칙을 필수·권장 등급과 이유로 정리

### 브라우저와 함께
- [DOM 조작](/knowledge/dictionary/frontend/javascript/dom-manipulation): 선택·생성·삽입·삭제·속성 변경, innerText vs innerHTML
- [이벤트](/knowledge/dictionary/frontend/javascript/dom-events): addEventListener, 이벤트 객체, preventDefault
- [Debounce와 Throttle](/knowledge/dictionary/frontend/javascript/debounce-throttle): 연속 이벤트의 실행 횟수를 줄이는 두 기법과 직접 구현

### 비동기
- [이벤트 루프](/knowledge/dictionary/frontend/javascript/event-loop): 싱글 스레드, 콜 스택, Web APIs, 태스크·마이크로태스크 큐
- [콜백과 Promise](/knowledge/dictionary/frontend/javascript/callback-and-promise): 비동기의 문제, 콜백 지옥, Promise 상태와 체이닝, Promise.all
- [async/await](/knowledge/dictionary/frontend/javascript/async-await): 동기 코드처럼 쓰는 비동기, try/catch 에러 처리, 코드 리뷰에서 배운 점
- [AJAX와 HTTP 요청](/knowledge/dictionary/frontend/javascript/ajax): XMLHttpRequest, fetch, axios, CORS

### 라이브러리
- [날짜 라이브러리](/knowledge/dictionary/frontend/javascript/date-libraries): Moment.js 이후의 대안, date-fns와 Day.js 비교
- [패키지 매니저: npm, yarn, pnpm](/knowledge/dictionary/frontend/javascript/package-managers): lock 파일의 역할, 세 매니저 비교와 고르는 기준, npm EINTEGRITY 오류 해결
- [React와 Vue 말고: 다른 프론트엔드 프레임워크](/knowledge/dictionary/frontend/javascript/frontend-frameworks): Svelte, Angular, Preact, Alpine.js, HTMX의 성격과 쓰임

## 코딩 스타일

- 세미콜론은 선택 사항이다. 생략하면 ASI(Automatic Semicolon Insertion) 규칙에 따라 자동으로 삽입된다. 어느 쪽이든 팀 안에서 일관되게 쓰는 것이 중요하다.
- 코드 리뷰에서 반복해서 나온 스타일 지적(const, else, 기본값, 불리언 이름 등)은 [코드 리뷰에서 자주 나온 지적](/knowledge/dictionary/tools/code-review/review-patterns)에 모았다.
- 스타일의 핵심은 "합의된 원칙과 일관성"이다. 참고할 만한 가이드: [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript), [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html), [standardjs](https://standardjs.com/). 실무에서는 ESLint와 Prettier로 자동화한다.
