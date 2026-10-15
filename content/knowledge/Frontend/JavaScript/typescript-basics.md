---
title: "TypeScript 문법 한눈에 보기"
concept: "TypeScript Syntax"
summary: "TypeScript 문법을 사전처럼 찾아보기 위한 요약. 실행 환경(tsc·Vite·Node.js 타입 제거), 기본 타입과 any·unknown·never의 차이, 추론·단언·가드·satisfies, type과 interface, 제네릭(제약·const 타입 매개변수·조건부 타입), 함수 오버로드와 this, 클래스 수식어, 모듈과 @types, 구분된 유니언, 표준 데코레이터, 유틸리티 타입을 표 중심으로 정리한다."
tags: ["typescript", "javascript", "frontend", "type-system"]
source: other
date: "2026-10-14"
sources: ["https://www.heropy.dev/p/WhqSC8", "https://www.typescriptlang.org/docs/handbook/utility-types.html"]
---

> HEROPY의 「[한눈에 보는 타입스크립트](https://www.heropy.dev/p/WhqSC8)」(2020.01 작성, 2026.08 갱신)를 바탕으로 재구성한 노트다.

## TypeScript란

JavaScript에 **정적 타입 시스템**을 얹은 언어다. `.ts` 파일로 쓰고, 타입 검사를 거친 뒤 타입 표기를 지운 JavaScript로 실행한다. 오류를 런타임이 아니라 **코드를 입력하는 동안** 잡는 것이 목적이다. 왜 배우고 어떤 순서로 익히는지는 [[typescript-learning|TypeScript 학습법]]에 있다.

| 실행 방법 | 설명 |
| --- | --- |
| `tsc` | 공식 컴파일러. `tsconfig.json`의 `compilerOptions`(`strict`, `target`, `module` 등)를 따른다 |
| Vite 등 번들러 | `.ts`를 바로 import한다. 번들러는 타입을 **지우기만** 하므로 검사는 `tsc --noEmit`을 따로 돌린다 |
| Node.js | 22.18·23.6부터 플래그 없이 `node main.ts`로 실행한다(타입 제거, type stripping). 24.12·25.2부터 안정 단계다. `enum`처럼 런타임 코드가 생기는 문법은 지원하지 않으므로 `erasableSyntaxOnly` 옵션으로 막아 둔다 |
| TypeScript Playground | 브라우저에서 바로 실험한다 |

## 타입 선언

```ts
let isDone: boolean = false;
let nums: number[] = [1, 2];            // Array<number>와 같다
let tuple: [string, number] = ['a', 1]; // 길이와 위치별 타입이 정해진 배열
let id: string | number;                // 유니언: 둘 중 하나
type Named = { name: string } & { age: number }; // 인터섹션: 둘 다
let dir: 'up' | 'down';                 // 리터럴 타입
let add: (a: number, b: number) => number;
```

| 타입 | 뜻 | 쓰는 곳 |
| --- | --- | --- |
| `any` | 검사를 **끈다**. 무엇이든 되고 무엇이든 할 수 있다 | 마이그레이션 중 임시로만 |
| `unknown` | 무엇이든 될 수 있지만, **좁히기 전에는 아무것도 못 한다** | 외부 입력, `catch (e)` |
| `never` | 값이 절대 없다 | 항상 throw하는 함수, 완전성 검사 |
| `void` | 반환값을 쓰지 않는다 | 반환 없는 함수 |
| `object` | 원시값이 아닌 것 | 거의 안 쓴다. 모양을 적는 편이 낫다 |
| `enum` | 이름 붙은 상수 집합. **런타임 객체가 생긴다** | 새 코드에서는 리터럴 유니언이나 `as const` 객체를 선호한다 |

`strict` 모드에서는 `null`·`undefined`가 다른 타입에 섞이지 않는다. 필요하면 `string | null`처럼 명시한다.

## 추론, 단언, 가드, satisfies

타입은 되도록 **추론에 맡긴다.** 초기값이 있는 변수, 기본값이 있는 매개변수, 반환값은 대부분 추론된다.

| 문법 | 역할 | 안전성 |
| --- | --- | --- |
| `const u: User = {...}` | 선언: 값이 타입에 맞는지 검사하고, 변수 타입을 `User`로 정한다 | 안전 |
| `{...} satisfies User` | 만족: 맞는지 **검사만** 하고, 추론된 구체적인 타입은 유지한다 | 안전 |
| `{...} as User` | 단언: "내가 안다"고 컴파일러를 설득한다. 속성이 빠져도 통과한다 | 위험 |
| `el!` | Non-null 단언: `null`·`undefined`가 아니라고 단언 | 위험 |
| `as const` | 리터럴·`readonly`로 가장 좁게 추론 | 안전 |

`satisfies`는 변수에 타입 표기를 붙일 수 없는 **객체 안쪽 속성**을 검사할 때, 그리고 검사는 하되 `'red'` 같은 리터럴 타입을 잃고 싶지 않을 때 쓴다.

```ts
const theme = {
  primary: '#3b82f6',
  spacing: 8,
} satisfies Record<string, string | number>;
theme.spacing.toFixed(); // spacing은 여전히 number
```

**타입 가드**는 조건문으로 타입을 좁힌다. `typeof x === 'string'`, `x instanceof Date`, `'swim' in animal`, 그리고 반환 타입이 `x is Fish`인 사용자 정의 가드 함수가 있다.

## type과 interface

| | `type` 별칭 | `interface` |
| --- | --- | --- |
| 표현 범위 | 유니언, 튜플, 원시값, 조건부·매핑 타입까지 무엇이든 | 객체 모양만 |
| 확장 | `&` 인터섹션 | `extends` |
| 같은 이름 재선언 | 오류 | **선언 병합**(라이브러리 타입 보강에 쓴다) |

둘 다 객체 모양을 적을 수 있고 대부분 바꿔 써도 된다. 팀 안에서 한 가지 기준을 정한다(→ [[typescript-coding-convention|TypeScript 코딩 컨벤션]]).

인터페이스에 쓰는 문법:

```ts
interface User {
  readonly id: number;        // 읽기 전용
  name: string;
  age?: number;               // 선택적 속성
  [key: string]: unknown;     // 인덱스 시그니처
  greet(msg: string): void;   // 메서드
}
type UserKey = keyof User;    // 속성 이름의 유니언
```

## 제네릭

타입을 **매개변수로 받아** 호출하는 쪽이 정하게 한다.

```ts
function first<T>(arr: T[]): T | undefined { return arr[0]; }
function len<T extends { length: number }>(x: T) { return x.length; } // 제약 조건
function list<const T extends readonly string[]>(items: T) { return items; }
list(['Apple', 'Banana']); // readonly ['Apple', 'Banana'] — 호출 쪽에서 as const를 안 써도 된다

type ElementOf<T> = T extends (infer U)[] ? U : never; // 조건부 타입 + infer
```

조건부 타입·템플릿 리터럴 타입·재귀를 조합한 실전 예는 [[typescript-advanced-types|TypeScript로 동적인 코드에 정적 타입 입히기]]에 있다.

## 함수와 클래스

- **명시적 this**: 첫 매개변수 자리에 `this: Window`처럼 쓰면 `this`의 타입을 정한다. 컴파일 결과에서는 사라진다.
- **오버로드**: 시그니처를 여러 개 선언하고 구현은 하나만 둔다. 유니언 매개변수로 충분하면 오버로드보다 유니언이 낫다.
- **선택적 매개변수** `b?: number`는 필수 매개변수 뒤에만 둔다.

| 클래스 수식어 | 접근 |
| --- | --- |
| `public`(기본) | 어디서나 |
| `protected` | 자신과 하위 클래스 |
| `private` | 자신만. **타입 검사에서만** 막는다. 런타임까지 숨기려면 JS의 `#field` |
| `readonly` | 초기화 후 변경 불가 |
| `abstract` | 추상 클래스·메서드. 하위 클래스가 구현해야 한다(→ [[abstract-class-vs-interface|추상 클래스와 인터페이스]]) |

생성자 매개변수에 수식어를 붙이면(`constructor(private name: string)`) 속성 선언과 할당이 한 번에 된다. 단, 이것도 런타임 코드가 생기는 문법이라 Node.js 타입 제거로는 실행되지 않는다.

## 모듈과 타입 선언

- `export type { User }`, `import type { User }`로 **타입만** 주고받으면 컴파일 결과에서 import가 지워진다.
- JS로 쓰인 라이브러리는 `.d.ts` 선언 파일이 있어야 타입이 붙는다. 패키지에 없으면 커뮤니티 저장소 **DefinitelyTyped**의 `@types/패키지명`을 설치한다(`npm i -D @types/lodash`). 없으면 직접 `declare module 'x'`를 쓴다.

## 구분된 유니언

공통 리터럴 속성(구분자, discriminant)으로 유니언의 각 경우를 가른다. `switch`로 좁히고, `never`로 빠진 경우를 컴파일 오류로 만든다.

```ts
type Shape =
  | { kind: 'circle'; r: number }
  | { kind: 'rect'; w: number; h: number };

function area(s: Shape) {
  switch (s.kind) {
    case 'circle': return Math.PI * s.r ** 2;
    case 'rect': return s.w * s.h;
    default: { const _exhaustive: never = s; return _exhaustive; } // 새 kind 추가 시 오류
  }
}
```

## 데코레이터

클래스와 멤버 위에 `@함수`로 붙여 동작을 바꾸거나 확장하는 함수다. TypeScript 5.0부터 **ECMAScript 표준 데코레이터**가 기본이고, 데코레이터는 `(value, context)`를 받는다. 인수가 필요하면 데코레이터를 반환하는 팩토리로 만들고, 여러 개를 겹치면 **아래에서 위로** 적용된다. NestJS·Angular 등이 쓰던 예전 방식은 `experimentalDecorators: true`가 필요하며 표준 방식과 섞어 쓸 수 없다.

## 유틸리티 타입

| 분류 | 타입 | 결과 |
| --- | --- | --- |
| 속성 변형 | `Partial<T>`, `Required<T>`, `Readonly<T>` | 모든 속성을 선택적·필수·읽기 전용으로 |
| 속성 고르기 | `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>` | 일부만 고르기, 빼기, 키·값으로 객체 타입 만들기 |
| 유니언 거르기 | `Exclude<T, U>`, `Extract<T, U>`, `NonNullable<T>` | 빼기, 공통만 남기기, `null`·`undefined` 제거 |
| 함수·클래스에서 뽑기 | `Parameters<F>`, `ReturnType<F>`, `ConstructorParameters<C>`, `InstanceType<C>`, `Awaited<P>` | 매개변수 튜플, 반환 타입, 생성자 인자, 인스턴스, Promise 결과 |
| this | `ThisParameterType<F>`, `OmitThisParameter<F>`, `ThisType<T>` | 명시적 this 다루기 |
| 추론 제어 | `NoInfer<T>` | 이 자리에서는 제네릭을 추론하지 않게 한다 |
| 문자열 | `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` | 문자열 리터럴 타입 변환 |

## 정리

- 타입은 추론에 맡기고, 경계(함수 인자, API 응답)에만 적는다.
- `any`보다 `unknown`, `as`보다 선언이나 `satisfies`를 쓴다.
- 유니언은 구분자로 좁히고 `never`로 완전성을 검사한다.
- `enum`, 생성자 매개변수 속성처럼 런타임 코드가 생기는 문법은 타입 제거 환경에서 동작하지 않는다.

**TypeScript의 문법은 결국 "값의 모양을 적고, 좁히고, 변형하는" 세 가지 일이다.**

관련 노트: [[typescript-learning|TypeScript 학습법]], [[typescript-advanced-types|TypeScript로 동적인 코드에 정적 타입 입히기]], [[typescript-coding-convention|TypeScript 코딩 컨벤션]], [[abstract-class-vs-interface|추상 클래스와 인터페이스]], [[class|class 문법]]
