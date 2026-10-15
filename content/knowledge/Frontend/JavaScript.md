---
title: "JavaScript"
concept: "JavaScript"
summary: "브라우저를 조작할 수 있는 유일한 언어이자, ECMAScript 표준을 따르는 동적 타입 언어."
tags: ["javascript", "frontend", "browser"]
source: mixed
date: "2026-10-13"
---

JavaScript는 브라우저 화면을 **동적으로** 만들기 위한 언어이며, 브라우저(BOM)와 그 안의 문서(DOM)를 조작할 수 있는 유일한 언어다. 언어의 핵심 문법은 **ECMAScript** 표준으로 정의된다. ECMA International이 ECMA-262 규격으로 정의한 언어가 ECMAScript이고, 2015년에 발표된 6번째 판(ES6, ES2015)부터 `let`/`const`, 화살표 함수, Promise, 클래스 같은 현대적 문법이 대거 들어왔고, 이후 해마다 새 판(ES2016, ES2017 …)이 나온다.

## 노트

### 언어 기초
- [변수와 데이터 타입](/knowledge/dictionary/frontend/javascript/variables-and-types): 식별자 규칙, let·const·var, 호이스팅, 원시·참조 타입과 복사(structuredClone), typeof, null과 undefined
- [연산자와 제어문](/knowledge/dictionary/frontend/javascript/operators-and-control-flow): 연산자 우선순위, 형변환과 truthy·falsy, `==` vs `===`, 단축 평가와 `?.`·`??`, 삼항 연산자, if·switch, for·for...in·for...of
- [문(Statement)과 식(Expression)](/knowledge/dictionary/frontend/javascript/statements-vs-expressions): 값을 만드는 식과 명령하는 문, 식 자리, `{}`·`function`의 문/식 해석 차이, JSX 중괄호가 식만 받는 이유
- [함수와 this](/knowledge/dictionary/frontend/javascript/functions): 선언식·표현식, 화살표 함수, rest·spread, this와 bind·call·apply, 매개변수 기본값
- [스코프와 클로저](/knowledge/dictionary/frontend/javascript/scope-and-closures): 전역·모듈·함수·블록 스코프, 렉시컬 스코프, 호이스팅과 TDZ, 클로저로 만드는 팩토리·비공개 상태
- [배열·객체·문자열](/knowledge/dictionary/frontend/javascript/arrays-and-objects): 주요 메서드, map·filter·reduce, 원본을 바꾸지 않는 toSorted·with, ES6 객체 문법, 구조 분해, JSON
- [Map과 Set](/knowledge/dictionary/frontend/javascript/map-and-set): 객체 대신 Map을 쓸 때, 키의 종류와 순서, Set으로 중복 제거, WeakMap
- [숫자와 Math](/knowledge/dictionary/frontend/javascript/js-numbers): 반올림 메서드, 난수 정수, Number vs parseInt, NaN, 0.1 + 0.2, 돈은 정수로, Intl.NumberFormat
- [JavaScript의 네 가지 주석](/knowledge/dictionary/frontend/javascript/js-comments): `//`·`/* */`의 동작, 해시뱅 `#!`, HTML 유사 주석 `<!--`의 유래
- [템플릿 리터럴](/knowledge/dictionary/frontend/javascript/template-literals): 여러 줄·표현식 삽입·중첩, 태그드 템플릿과 styled-components의 원리
- [class 문법](/knowledge/dictionary/frontend/javascript/class): 생성자 함수와 new, constructor, static, extends, getter·setter, private 필드
- [프로토타입과 상속](/knowledge/dictionary/frontend/javascript/prototype-and-inheritance): 클래스와 다른 철학(분류 대 원형), 프로토타입 체인, new가 하는 일, 인스턴스 데이터와 프로토타입 메서드, Object.create, class와의 대응
- [ECMAScript 표준과 TC39 프로세스](/knowledge/dictionary/frontend/javascript/ecmascript-tc39): ECMA-262와 TC39, Stage 0~4, ES6=ES2015 이름 규칙, ES2022 기능과 이후 판
- [모듈: export와 import](/knowledge/dictionary/frontend/javascript/es-modules): named export와 default export, export default 논쟁
- [JavaScript 디자인 패턴: 생성 패턴](/knowledge/dictionary/frontend/javascript/js-design-patterns): 생성자·모듈·싱글톤·프로토타입 패턴과 프로토타입 기반 언어의 차이
- [자바스크립트에서 타임존 다루기](/knowledge/dictionary/frontend/javascript/timezone): 타임존 ≠ 오프셋, 서머타임, IANA tz database, Date와 서버 간 시간 주고받기, 오프셋 계산의 한계
- [TypeScript 학습법](/knowledge/dictionary/frontend/javascript/typescript-learning): 슈퍼셋이라는 본질, JavaScript가 정적 타입을 얻기까지, 흔한 오해, 추론·스키마·좁히기·strict 순서의 로드맵
- [TypeScript 문법 한눈에 보기](/knowledge/dictionary/frontend/javascript/typescript-basics): 실행 환경, any·unknown·never, 단언·가드·satisfies, type vs interface, 제네릭, 구분된 유니언, 데코레이터, 유틸리티 타입
- [TypeScript 코딩 컨벤션](/knowledge/dictionary/frontend/javascript/typescript-coding-convention): 이름 짓기, 타입, 클래스, 배열 메서드, 에러 처리, 모듈 규칙을 필수·권장 등급과 이유로 정리
- [TypeScript로 동적인 코드에 정적 타입 입히기](/knowledge/dictionary/frontend/javascript/typescript-advanced-types): 리터럴 유니온, never, 제네릭, 템플릿 리터럴 타입, infer 재귀로 라우트 매개변수 추출
- [명확한 코드의 네 가지 원칙](/knowledge/dictionary/frontend/javascript/clear-code-principles): 단일 책임, 명령-질의 분리, 낮은 결합도, 높은 응집도
- [ESLint와 Prettier 설정](Frontend/JavaScript/eslint-prettier.md): 품질은 ESLint, 모양은 Prettier로 역할 나누기, 저장 시 자동 수정 에디터 설정, flat config 읽는 법과 ESLint 10에서 제거된 `.eslintrc`

### 프로그래밍 패러다임
- [객체 지향 프로그래밍과 JavaScript](Frontend/JavaScript/oop-and-javascript.md): 구조체에서 클래스로, 캡슐화·상속·추상화·다형성, 프로토타입·덕 타이핑·일급 함수로 푼 JavaScript의 OOP
- [함수형 프로그래밍](Frontend/JavaScript/functional-programming.md): 액션·계산·데이터, 카피 온 라이트와 방어적 복사, 계층형 설계와 추상화 벽, 입력→화면 파이프라인
- [반응형 프로그래밍과 RxJS](Frontend/JavaScript/reactive-programming.md): 변경 전파와 선언적 데이터 흐름, Pull→Push와 제어의 역전, Observable과 연산자, Hot·Cold

### 브라우저와 함께
- [DOM 조작과 이벤트](/knowledge/dictionary/frontend/javascript/dom-manipulation): 선택·탐색(closest), 속성과 dataset, classList, 생성·삽입(insertAdjacent*, DocumentFragment), 문자열 HTML, 삭제, addEventListener 기본
- [DOM 이벤트: 전파, 위임, 커스텀 이벤트](/knowledge/dictionary/frontend/javascript/dom-events): 캡처·버블과 target·currentTarget, 이벤트 위임, once·passive·signal 옵션, CustomEvent, 폼·키보드 이벤트, 바깥 클릭 감지
- [타이머: setTimeout과 setInterval](/knowledge/dictionary/frontend/javascript/timers): 최소 지연일 뿐인 delay, ID로 해제, 재귀 setTimeout, Promise 기반 wait, requestAnimationFrame
- [Debounce와 Throttle](/knowledge/dictionary/frontend/javascript/debounce-throttle): 연속 이벤트의 실행 횟수를 줄이는 두 기법과 직접 구현
- [책임감 있는 자바스크립트](/knowledge/dictionary/frontend/javascript/responsible-javascript): JS의 처리 비용, 저사양 Android·느린 4G·Baseline 기준선, 웹 플랫폼 우선, 번들 줄이기, 서드파티 관리

### 엔진과 실행
- [JavaScript는 인터프리터 언어일까, 컴파일 언어일까](/knowledge/dictionary/frontend/javascript/js-engine-v8): V8 파이프라인(Parser·Ignition·Sparkplug·Maglev·TurboFan), JIT, TSC·Babel과 비교

### 비동기
- [이벤트 루프](/knowledge/dictionary/frontend/javascript/event-loop): 싱글 스레드, 콜 스택, Web APIs, 태스크·마이크로태스크 큐
- [콜백과 Promise](/knowledge/dictionary/frontend/javascript/callback-and-promise): 비동기의 문제, 콜백 지옥, Promise 상태와 체이닝, 콜백 API를 Promise로 감싸기, all·allSettled·race·any
- [async/await](/knowledge/dictionary/frontend/javascript/async-await): 동기 코드처럼 쓰는 비동기, 반복문 안의 await, 에러를 처리하는 네 자리, 실무에서 지킬 것
- [AJAX와 HTTP 요청](/knowledge/dictionary/frontend/javascript/ajax): XMLHttpRequest, fetch 옵션, AbortController로 취소·타임아웃, CORS, 브라우저 코드에 비밀 키를 두지 않는 이유

### 라이브러리
- [날짜 라이브러리](/knowledge/dictionary/frontend/javascript/date-libraries): 0부터 시작하는 월 같은 기본 Date의 함정, Moment.js 이후의 대안, date-fns와 Day.js 비교, 표준 API Temporal의 지원 현황
- [패키지 매니저: npm, yarn, pnpm](/knowledge/dictionary/frontend/javascript/package-managers): lock 파일의 역할, 매니저 비교와 고르는 기준, packageManager와 Corepack, 설치 스크립트 차단, npm EINTEGRITY 오류 해결
- [번들러의 역사와 Vite](/knowledge/dictionary/frontend/javascript/bundlers-and-vite): CommonJS·AMD·ES 모듈에서 번들러로, esbuild와 Snowpack이 푼 느린 빌드, Vite의 개발·배포 이원 구조

## 코딩 스타일

- 세미콜론은 선택 사항이다. 생략하면 ASI(Automatic Semicolon Insertion) 규칙에 따라 자동으로 삽입된다. 어느 쪽이든 팀 안에서 일관되게 쓰는 것이 중요하다.
- 코드 리뷰에서 반복해서 나온 스타일 지적(const, else, 기본값, 불리언 이름 등)은 [코드 리뷰에서 자주 나온 지적](/knowledge/dictionary/tools/code-review/review-patterns)에 모았다.
- 스타일의 핵심은 "합의된 원칙과 일관성"이다. 참고할 만한 가이드: [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript), [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html), [standardjs](https://standardjs.com/). 실무에서는 ESLint와 Prettier로 자동화한다([ESLint와 Prettier 설정](Frontend/JavaScript/eslint-prettier.md)).
