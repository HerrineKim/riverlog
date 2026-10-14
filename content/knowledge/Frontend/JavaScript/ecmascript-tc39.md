---
title: "ECMAScript 표준과 TC39 프로세스"
concept: "ECMAScript"
summary: "JavaScript의 표준 ECMA-262를 누가 어떻게 정하는지 정리한다. ECMA International과 TC39, 제안이 Stage 0부터 4까지 올라가 매년 새 판(ES2015, ES2016 …)에 실리는 과정, ES6와 ES2015 같은 이름 규칙, ES2022의 클래스 필드·top-level await·at()·Object.hasOwn부터 ES2026까지의 주요 추가 기능을 다룬다."
tags: ["javascript", "frontend", "ecmascript", "history"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/702242eb995e4cb2b7ca68cd66c64d7a", "https://80000coding.notion.site/d486a93b761940068431241a6c10cc45", "https://tc39.es/process-document/", "https://github.com/tc39/proposals/blob/main/finished-proposals.md"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「ECMAScript와 ECMAScript 2022의 제안 알아보기」, 「[JavaScript] JavaScript 는 어떤 언어인가?」를 바탕으로 재구성한 노트입니다.

**ECMAScript**는 JavaScript의 핵심 문법과 내장 객체를 정의한 언어 표준이다. 규격 문서의 번호는 **ECMA-262**이고, ECMA International의 기술 위원회 **TC39**가 관리한다. JavaScript는 이 표준을 구현한 언어이고, 브라우저의 DOM이나 Node.js의 `fs`처럼 실행 환경이 덧붙이는 API는 ECMAScript 바깥이다.

## 누가 정하나

| 주체 | 역할 |
| --- | --- |
| ECMA International | 정보통신·전자 제품 표준을 만드는 표준화 기구. ECMAScript 외에 C#(ECMA-334), Office Open XML, NFC 같은 표준도 냈다 |
| TC39 (Technical Committee 39) | ECMA-262와 국제화 API 표준(ECMA-402)을 관리하는 위원회. 브라우저 제조사, 기업, 개인 전문가가 참여하고 합의(consensus)로 결정한다 |
| 브라우저·런타임 엔진 | V8, SpiderMonkey, JavaScriptCore가 제안을 구현해 실제로 쓸 수 있게 만든다 |

표준이 먼저 있고 JavaScript가 나온 것이 아니다. 1995년 Netscape가 브라우저를 제어하는 스크립트 언어로 JavaScript를 만들었고, Microsoft의 JScript 같은 변종이 생기자 1996년 Netscape가 ECMA에 표준화를 맡겼다. 그 결과가 1997년의 ECMAScript 1판이다.

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
| ES2025 | 이터레이터 헬퍼(`iterator.map().filter().take()`), `Set`의 합집합·교집합 메서드, JSON 모듈과 import 속성(`with { type: 'json' }`), `RegExp.escape`, `Promise.try`, `Float16Array` |
| ES2026 | `Array.fromAsync`, `Error.isError`, `Math.sumPrecise`, `Uint8Array`의 Base64·hex 변환, 이터레이터 이어 붙이기(`Iterator.concat`), `Map`·`WeakMap`의 `getOrInsert`(Upsert), `JSON.parse` 원문 접근 |

날짜·시간 API **Temporal**과 `using` 선언(Explicit Resource Management)은 Stage 4를 마쳐 ES2027에 실릴 예정이다.

새 기능을 실제 서비스에 쓸 때는 판 번호보다 **브라우저 지원 범위**가 기준이다. MDN의 호환성 표나 Baseline 표시로 대상 브라우저에서 되는지 확인하고, 안 되면 Babel·TypeScript로 변환하거나 폴리필을 넣는다([[responsible-javascript|책임감 있는 자바스크립트]]).

## 정리

- ECMAScript(ECMA-262)는 JavaScript의 표준이고, ECMA International의 TC39가 관리한다.
- 제안은 Stage 0 → 1 → 2 → 2.7 → 3 → 4를 거치고, Stage 4가 되면 매년 6월 승인되는 새 판에 실린다.
- ES2015부터 이름은 연도다. ES6 = ES2015가 가장 큰 개정이었고 이후는 매년 작게 늘어난다.
- 쓸 수 있느냐는 판 번호가 아니라 대상 브라우저의 지원 여부로 판단한다.

관련 노트: [[class|class 문법]], [[js-engine-v8|JavaScript 엔진과 V8]], [[typescript-learning|TypeScript 학습법]], [[variables-and-types|변수와 데이터 타입]]
