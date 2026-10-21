---
title: "ECMAScript 표준과 TC39 프로세스"
concept: "ECMAScript"
summary: "JavaScript의 표준 ECMA-262를 누가 어떻게 정하는지 정리한다. ECMA International과 TC39, 제안이 Stage 0부터 4까지 올라가 매년 새 판(ES2015, ES2016 …)에 실리는 과정, ES6와 ES2015 같은 이름 규칙, ES2022의 클래스 필드·top-level await·at()·Object.hasOwn부터 ES2026까지의 주요 추가 기능, Java와 무관한 이름과 실행 환경별 제약, 명세·MDN 같은 참고 자료, 새 기능을 옛 환경에서 쓰는 트랜스파일러와 폴리필을 다룬다."
tags: ["javascript", "frontend", "ecmascript", "history"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/intro", "https://ko.javascript.info/manuals-specifications", "https://ko.javascript.info/polyfills", "https://80000coding.notion.site/702242eb995e4cb2b7ca68cd66c64d7a", "https://80000coding.notion.site/d486a93b761940068431241a6c10cc45", "https://tc39.es/process-document/", "https://github.com/tc39/proposals/blob/main/finished-proposals.md", "https://auth0.com/blog/a-brief-history-of-javascript/"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「ECMAScript와 ECMAScript 2022의 제안 알아보기」, 「[JavaScript] JavaScript 는 어떤 언어인가?」를 바탕으로, javascript.info(모던 JavaScript 튜토리얼)의 「자바스크립트란?」, 「매뉴얼과 명세서」, 「폴리필」 글을 더해 재구성한 노트다. 초기 연표는 「[A Brief History of JavaScript](https://auth0.com/blog/a-brief-history-of-javascript/)」를 바탕으로 더했다.

**ECMAScript**는 JavaScript의 핵심 문법과 내장 객체를 정의한 언어 표준이다. 규격 문서의 번호는 **ECMA-262**이고, ECMA International의 기술 위원회 **TC39**가 관리한다. JavaScript는 이 표준을 구현한 언어이고, 브라우저의 DOM이나 Node.js의 `fs`처럼 실행 환경이 덧붙이는 API는 ECMAScript 바깥이다.

## 누가 정하나

| 주체 | 역할 |
| --- | --- |
| ECMA International | 정보통신·전자 제품 표준을 만드는 표준화 기구. ECMAScript 외에 C#(ECMA-334), Office Open XML, NFC 같은 표준도 냈다 |
| TC39 (Technical Committee 39) | ECMA-262와 국제화 API 표준(ECMA-402)을 관리하는 위원회. 브라우저 제조사, 기업, 개인 전문가가 참여하고 합의(consensus)로 결정한다 |
| 브라우저·런타임 엔진 | V8, SpiderMonkey, JavaScriptCore가 제안을 구현해 실제로 쓸 수 있게 만든다 |

표준이 먼저 있고 JavaScript가 나온 것이 아니다. 1995년 Netscape가 브라우저를 제어하는 스크립트 언어로 JavaScript를 만들었고, Microsoft의 JScript 같은 변종이 생기자 1996년 Netscape가 ECMA에 표준화를 맡겼다. 그 결과가 1997년의 ECMAScript 1판이다.

```text
1995.05 Mocha ─ Brendan Eich가 Netscape에서 짧은 기간에 만든 프로토타입 → LiveScript
1995.12 JavaScript로 개명 ─ Java는 큰 컴포넌트, JavaScript는 작은 브라우저 스크립트라는 역할 분담
1996    Microsoft JScript(IE 3) ─ 구현 차이로 오랜 브라우저 호환성 문제의 시작
1997    ES1 ─ 1998 ES2(ISO 표준과 맞춤) ─ 1999 ES3(정규식, try/catch)
2000년대 AJAX 확산 ─ ES4(클래스·모듈·정적 타입까지 넣은 대개편) 논쟁으로 정체
2008    오슬로 회의: ES4 폐기, 작은 개정 ES3.1과 장기 계획 Harmony로 정리
2009    ES3.1이 ES5로 ─ 2011 ES5.1 ─ 2015 Harmony의 성과가 ES2015로
```

ES4의 실패가 지금의 운영 방식을 만들었다. 큰 판을 한 번에 합의하려다 10년을 잃은 뒤로, **제안을 하나씩 단계별로 통과시키고 준비된 것만 매년 판에 싣는다.**

## TC39 프로세스: 제안이 표준이 되기까지

새 문법은 **제안(proposal)** 으로 시작해 단계를 거친다.

| 단계 | 의미 |
| --- | --- |
| Stage 0 | 아이디어. 아직 위원회가 검토하지 않았다 |
| Stage 1 | 다룰 가치가 있는 문제로 인정. 해결 방향을 탐색한다 |
| Stage 2 | 설계 초안 선택. 세부는 바뀔 수 있다 |
| Stage 2.7 | 명세 텍스트 완성·승인. 테스트(test262)와 시범 구현을 기다린다 (2024년에 추가된 단계) |
| Stage 3 | 구현 권장. 엔진들이 구현하고 실사용 피드백을 받는다 |
| Stage 4 | 완료. 두 개 이상의 호환 구현과 테스트가 갖춰져 다음 판에 실린다 |

Stage 4에 오른 제안은 그해 초 명세 초안에 합쳐지고, **매년 6월 ECMA 총회에서 새 판이 승인**된다. 그래서 많은 기능이 표준이 되기 전에 이미 브라우저에 들어가 있다. 진행 중인 제안 목록은 [tc39/proposals](https://github.com/tc39/proposals)에서 볼 수 있다.

## JavaScript라는 이름과 실행 환경

처음 이름은 LiveScript였다. 당시 인기 있던 Java의 동생처럼 홍보하려고 JavaScript로 바꿨을 뿐, **두 언어는 관계가 없다.** 상표 문제 때문에 표준의 이름은 ECMAScript가 됐다.

JavaScript는 **엔진**이 있는 곳이면 어디서든 돈다. 브라우저마다 엔진이 있고(Chrome·Edge·Opera의 V8, Firefox의 SpiderMonkey, Safari의 JavaScriptCore), 서버의 Node.js·Deno는 V8, Bun은 JavaScriptCore를 쓴다. 엔진의 동작은 [[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]]에 있다.

언어가 할 수 있는 일은 **실행 환경이 정한다.** 언어 자체에는 메모리·CPU를 직접 건드리는 기능이 없고, 파일·네트워크·화면은 환경이 주는 API로만 다룬다.

| 환경 | 할 수 있는 일 | 막혀 있는 일 |
| --- | --- | --- |
| 브라우저 | DOM 조작, 사용자 입력에 반응, 네트워크 요청, 쿠키·로컬 저장소 | 임의의 디스크 파일 읽기·쓰기(사용자가 고른 파일만), 허락 없는 카메라·마이크, **다른 출처(origin)의 페이지·응답 읽기**(동일 출처 정책. 허용은 서버가 [[cors\|CORS]] 헤더로 한다) |
| Node.js 등 서버 | 파일 시스템, 프로세스, 임의의 네트워크 | 브라우저 API(DOM)는 없다 |

TypeScript, 예전의 CoffeeScript·Flow처럼 **JavaScript로 변환(트랜스파일)되어 실행되는 언어**도 있다. 결국 JavaScript로 돌기 때문에 무엇이 일어나는지 이해하려면 JavaScript를 알아야 한다([[typescript-basics|TypeScript: 개념과 문법 한눈에 보기]]).

## 참고 자료

| 자료 | 쓰는 때 |
| --- | --- |
| [ECMA-262 최신 초안](https://tc39.es/ecma262/) | 동작의 최종 근거. 읽기 어려워 일상 참고용은 아니다 |
| [tc39/proposals](https://github.com/tc39/proposals) | 진행 중인 제안과 Stage |
| [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference) | 메서드·문법의 설명과 예제, 호환성 표, Baseline 표시. 검색 엔진에 `MDN 키워드`로 찾는다 |
| [Can I use](https://caniuse.com) | 브라우저 기능의 지원 표 |

## 이름 규칙: ES6와 ES2015

| 이름 | 연도 | 비고 |
| --- | --- | --- |
| ES3 | 1999 | 정규식, try/catch. 오랫동안 기준선이었다 |
| ES5 | 2009 | strict mode, JSON, 배열 고차 함수. ES4는 너무 큰 변경이라 폐기됐다 |
| **ES6 = ES2015** | 2015 | `let`/`const`, 화살표 함수, 클래스, 모듈, Promise, 구조 분해. 가장 큰 개정 |
| ES2016 (ES7) | 2016 | 이때부터 **매년 한 판**씩 작게 낸다 |
| ES2017 (ES8) | 2017 | async/await |

ES2015부터 공식 이름은 연도다. ES6·ES8 같은 판 번호는 관용적으로 남아 있을 뿐이고, 판 번호 = 연도 − 2009다.

## ES2022에 들어간 기능

| 기능 | 예 | 하는 일 |
| --- | --- | --- |
| 클래스 필드 | `class A { count = 0; #secret; static max = 10; }` | 생성자 밖에서 필드 선언, `#`으로 private, `static` 필드·private 메서드 |
| 정적 초기화 블록 | `class A { static { /* 초기화 */ } }` | 클래스 정의 안에서 여러 static 필드를 try/catch 등으로 한꺼번에 초기화 |
| private 필드 존재 확인 | `#brand in obj` | 접근하면 예외가 나는 private 필드를 try/catch 없이 확인 |
| top-level `await` | 모듈 최상단의 `await fetch(...)` | ES 모듈에서 `async` 함수로 감싸지 않고 바로 기다린다 |
| `.at()` | `arr.at(-1)`, `'abc'.at(-1)` | 음수 인덱스로 뒤에서부터 접근. `arr[-1]`은 `"-1"` 프로퍼티로 해석되어 안 된다 |
| `Object.hasOwn()` | `Object.hasOwn(obj, 'key')` | `Object.prototype.hasOwnProperty.call(obj, 'key')`의 짧고 안전한 대체. 객체가 `hasOwnProperty`를 덮어써도 정확하다 |
| 정규식 `d` 플래그 | `/a+/d.exec(s).indices` | 일치한 부분의 시작·끝 인덱스를 함께 돌려준다 |
| Error cause | `new Error('저장 실패', { cause: err })` | 다시 던지는 오류에 원인 오류를 연결해 디버깅 정보를 잃지 않는다 |

클래스 문법 전반은 [[class|class 문법]], 모듈은 [[es-modules|모듈: export와 import]]에 있다.

## 그 뒤의 판

| 판 | 주요 추가 |
| --- | --- |
| ES2023 | `findLast`·`findLastIndex`, 원본을 바꾸지 않는 `toSorted`·`toReversed`·`toSpliced`·`with`, 해시뱅(`#!`) 문법 |
| ES2024 | `Object.groupBy`·`Map.groupBy`, `Promise.withResolvers`, 정규식 `v` 플래그, 크기 조절 가능한 `ArrayBuffer` |
| ES2025 | 이터레이터 헬퍼(`iterator.map().filter().take()`), `Set`의 합집합·교집합 메서드, JSON 모듈과 import 속성(`with { type: 'json' }`), 정규식 패턴 수식자(`(?i:abc)`)와 중복 이름 캡처 그룹, `Promise.try`, `Float16Array`, `ArrayBuffer`의 `transfer` |
| ES2026 | `Array.fromAsync`, `Error.isError`, `Math.sumPrecise`, `Uint8Array`의 Base64·hex 변환, 이터레이터 이어 붙이기(`Iterator.concat`), `Map`·`WeakMap`의 `getOrInsert`(Upsert), `JSON.parse` 원문 접근([[json\|JSON]]), `RegExp.escape` |

날짜·시간 API **Temporal**과 `using` 선언(Explicit Resource Management), 이터레이터 `chunks`·`join`·`includes`, `Atomics.pause`는 Stage 4를 마쳐 ES2027에 실릴 예정이다. 정규식 기능 전반은 [[regular-expressions|정규 표현식: 문법·플래그·메서드]]에 있다.

새 기능을 실제 서비스에 쓸 때는 판 번호보다 **브라우저 지원 범위**가 기준이다. MDN의 호환성 표나 Baseline 표시로 대상 브라우저에서 되는지 확인한다([[responsible-javascript|책임감 있는 자바스크립트]]).

### 지원하지 않는 환경에서 쓰기: 트랜스파일러와 폴리필

엔진은 표준을 한꺼번에 구현하지 않는다. 명세에 오른 기능보다 Stage 3 제안을 먼저 넣기도 하고, 어떤 기능은 늦게 넣는다. 그 틈을 메우는 도구는 무엇이 없느냐에 따라 둘로 나뉜다.

| | 트랜스파일러 | 폴리필(polyfill) |
| --- | --- | --- |
| 메우는 것 | **새 문법**(`?.`, 클래스 필드, `async`) | **새 내장 함수·객체**(`Array.prototype.at`, `Promise.withResolvers`, `structuredClone`) |
| 방법 | 빌드할 때 소스를 옛 문법으로 다시 쓴다 | 실행할 때 그 기능이 없으면 같은 동작의 구현을 채워 넣는다 |
| 도구 | Babel, TypeScript, esbuild·SWC(번들러 안에서) | core-js(빌드 도구가 대상 브라우저에 필요한 것만 넣는다) |

문법은 실행 전에 파싱되므로 런타임에 채울 수 없다. 그래서 문법은 변환, API는 폴리필이다. 폴리필이 내장 프로토타입을 고치는 방식과 그 예외 규칙은 [[prototype-and-inheritance|프로토타입과 상속]]에 있다.

**과거에는** 요청한 브라우저에 맞는 폴리필을 골라 주는 CDN 서비스 polyfill.io를 `<script>`로 불러 쓰곤 했다. 2024년 도메인 소유권이 넘어간 뒤 그 주소로 악성 코드가 배포되는 공급망 공격이 일어났다. 폴리필은 빌드에 포함해 직접 배포하고, 남의 도메인에서 실행 코드를 불러오는 일은 서드파티 스크립트로 따로 관리한다.

## 정리

- ECMAScript(ECMA-262)는 JavaScript의 표준이고, ECMA International의 TC39가 관리한다.
- 제안은 Stage 0 → 1 → 2 → 2.7 → 3 → 4를 거치고, Stage 4가 되면 매년 6월 승인되는 새 판에 실린다.
- ES2015부터 이름은 연도다. ES6 = ES2015가 가장 큰 개정이었고 이후는 매년 작게 늘어난다.
- 쓸 수 있느냐는 판 번호가 아니라 대상 브라우저의 지원 여부로 판단한다.

관련 노트: [[class|class 문법]], [[js-engine-v8|JavaScript 엔진과 V8]], [[strict-mode|strict mode]], [[regular-expressions|정규 표현식: 문법·플래그·메서드]], [[typescript-basics|TypeScript: 개념과 문법 한눈에 보기]], [[variables-and-types|변수와 데이터 타입]]
