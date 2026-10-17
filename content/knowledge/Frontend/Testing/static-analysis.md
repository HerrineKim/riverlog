---
title: "정적 분석: 실행하지 않고 검사하기"
concept: "Static Analysis"
summary: "코드를 실행하지도, 테스트를 쓰지도 않고 자동으로 검사하는 정적 분석을 테스트의 맨 아래 층으로 본다. ESLint 규칙(no-unsafe-finally 같은 올바르지만 틀린 코드, eslint-plugin-compat 같은 브라우저 지원 검사)과 TypeScript 타입 검사(noImplicitAny, 검사 대상 포함 확인)가 무엇을 잡고, 무엇은 여전히 테스트로 확인해야 하는지 정리한다."
tags: ["testing", "typescript", "eslint", "javascript", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/testing/get-started/static-analysis", "https://eslint.org/docs/latest/rules/no-unsafe-finally", "https://www.typescriptlang.org/tsconfig/#noImplicitAny"]
---

> web.dev의 「[Learn Testing](https://web.dev/learn/testing)」 강좌의 「Static analysis」 모듈을 바탕으로 재구성한 노트다.

## 정적 분석이란

**정적 분석(static analysis)은 코드를 실행하지 않고, 테스트를 따로 쓰지 않고 자동으로 문제를 찾는 검사다.** 에디터에서 TypeScript가 그어 주는 빨간 밑줄이 대표적이다. 엄밀한 의미의 테스트는 아니지만, 저장할 때마다 돌고 비용이 거의 없어 테스트의 가장 아래 층 역할을 한다([[frontend-test-types|프론트엔드 테스트의 종류와 도구]]).

| 도구 | 잡는 것 |
| --- | --- |
| ESLint (또는 Biome) | 문법은 맞지만 버그일 가능성이 큰 코드, 팀 규칙 위반, 대상 브라우저가 지원하지 않는 API |
| TypeScript | 값과 타입이 맞지 않는 호출, 빠진 속성, `null` 가능성 |

설정 방법과 에디터·CI 연동은 [[eslint-prettier|ESLint와 Prettier 설정]], 타입 문법은 [[typescript-basics|TypeScript 문법 한눈에 보기]]에 있다. 이 노트는 「테스트 대신 무엇을 잡아 주나」에 집중한다.

## ESLint: 올바르지만 틀린 코드

```js
try {
  const result = await fetchFromNetwork()
  if (!result.ok) throw new Error('failed to fetch')
} finally {
  return false   // no-unsafe-finally: 위에서 던진 예외를 삼켜 버린다
}
```

`finally` 안의 `return`·`throw`·`break`는 앞선 예외나 반환값을 덮어쓴다. 실행은 되지만 의도와 다르다. `no-unsafe-finally`는 ESLint의 추천(recommended) 규칙 집합에 들어 있다. 코드 리뷰로도 잡을 수 있지만 사람은 놓친다.

| 원칙 | 이유 |
| --- | --- |
| 규칙을 일부러 어길 때는 그 줄에만 표시한다 (`// eslint-disable-next-line no-unsafe-finally`) | 예외가 코드에 드러나 리뷰어가 볼 수 있다 |
| 늘 어기는 규칙은 끈다 | 팀에 다른 관례가 있다는 뜻이다. 무시되는 경고는 소음이다 |
| 프로젝트 초기에 켠다 | 큰 기존 코드베이스에 켜면 경고가 쏟아져 리팩터링 부담이 크다 |
| 리뷰·스타일 가이드를 대신하지 않는다 | 모든 이상한 접근을 규칙으로 잡을 수는 없다 |

### 브라우저 지원 검사

`eslint-plugin-compat`는 `browserslist`에 적은 대상 브라우저가 지원하지 않는 웹 API를 쓰면 경고한다. 어떤 API를 널리 쓸 수 있는지는 MDN 문서의 Baseline 표시로도 확인한다.

## TypeScript: 타입 검사

JavaScript는 변수에 아무 타입이나 다시 넣을 수 있다. 시작은 쉽지만, 문자열을 기대하는 곳에 숫자가 들어가도 여러 라이브러리를 거친 뒤에야 엉뚱한 `TypeError`로 터진다. 타입 검사는 이것을 **실행 전에** 잡는다. 다른 종류의 테스트로는 잡기 어려운 오류다.

```ts
declare function onBirthday(cb: (name: string, age: number) => void): void

const callback = (name: string, age: string) => console.info(name, age)
onBirthday(callback)
// error TS2345: Argument of type '(name: string, age: string) => void'
//   is not assignable to parameter of type '(name: string, age: number) => void'.
```

### `noImplicitAny`

타입을 적지 않은 매개변수는 `any`가 되어 무엇이든 받는다. `noImplicitAny`는 이를 오류로 만든다. 가장 효과가 큰 옵션이지만 큰 코드베이스에서 켜기 가장 어렵다. `strict: true`에 포함돼 있다.

```ts
export function fibonacci(n) { /* ... */ }        // 오류: 'n'은 암시적으로 any
export function fibonacci(n: number): number { /* ... */ }
```

`noImplicitAny`는 **명시적인** `any`까지 막지는 않는다. 모든 값에 타입이 있게만 강제한다.

### 함께 지킬 것

| 점검 | 이유 |
| --- | --- |
| 소스 파일이 실제로 검사 대상인가 (`tsconfig.json`의 `include`, `tsc --listFiles`) | 「오류 없음」이 사실은 「검사 안 함」일 수 있다 |
| 타입·인터페이스를 명시적으로 선언한다 | 경계가 분명하면 목과 페이크를 만들기 쉬워 테스트도 쉬워진다 |
| `tsconfig.json`은 검증된 기본 설정에서 시작한다 (`@tsconfig/bases`의 `@tsconfig/strictest` 등) | 옵션이 수백 개라 처음부터 고르기 어렵다 |

`tsconfig.json`은 `tsc`뿐 아니라 에디터, 빌드 도구, Vitest도 읽는다.

## 정적 분석이 잡지 못하는 것

**타입은 런타임에 들어오는 데이터를 막지 못한다.** 사용자 입력, 네트워크 응답, `localStorage` 값은 선언한 타입과 다를 수 있다. 그래서 다음은 여전히 테스트한다.

- 시스템 경계(API 응답, 폼 입력)에서 잘못된 데이터를 어떻게 다루는가. 경계에서는 Zod 같은 스키마 검증으로 타입을 실제 값과 맞춘다.
- 로직이 올바른 **값**을 내는가. 타입이 맞아도 계산은 틀릴 수 있다.

완전히 내가 통제하는 내부 코드라면 타입 검사가 잘못된 입력 테스트를 상당 부분 대신한다.

## 정리

- 정적 분석은 실행 없이 도는 가장 싼 검사이고, 테스트의 맨 아래 층이다.
- ESLint는 올바르지만 틀린 코드와 지원되지 않는 API를, TypeScript는 타입 불일치를 잡는다.
- `noImplicitAny`(`strict`)를 켜고, 파일이 실제로 검사되는지 확인한다.
- 예외는 줄 단위로 드러내고, 늘 어기는 규칙은 끈다. 초기에 켤수록 싸다.
- 런타임 데이터와 값의 정확성은 여전히 테스트가 맡는다.

관련 노트: [[eslint-prettier|ESLint와 Prettier 설정]], [[typescript-basics|TypeScript 문법 한눈에 보기]], [[frontend-test-types|프론트엔드 테스트의 종류와 도구]], [[js-testing-best-practices|JavaScript 테스트 모범 사례]]
