---
title: "TypeScript 타입 연산: 타입으로 타입 만들기"
concept: "Type Operators"
summary: "기존 타입에서 새 타입을 계산하는 TypeScript의 연산을 정리한다. keyof·typeof·인덱스 접근으로 타입을 꺼내고, 매핑 타입으로 속성을 순회하며 수식어를 붙이거나 떼고 키를 바꾸고, 조건부 타입과 infer로 분기·추출하며, 유니언을 만나면 분배된다는 규칙과 [T]로 막는 법, 템플릿 리터럴 타입의 조합, 유틸리티 타입을 직접 구현하는 법까지."
tags: ["typescript", "type-system", "javascript", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%284%29%20-%20%20%EB%A7%B5%EB%93%9C%20%ED%83%80%EC%9E%85%28Mapped%20Types%29%2C%20%ED%85%9C%ED%94%8C%EB%A6%BF%20%EB%A6%AC%ED%84%B0%EB%9F%B4%20%ED%83%80%EC%9E%85%28Template%20Literal%20Types%29.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%285%29%20-%20%EC%BB%A8%EB%94%94%EC%85%94%EB%84%90%20%ED%83%80%EC%9E%85%2C%ED%95%A8%EC%88%98%20%EB%A9%94%EC%84%9C%EB%93%9C%20%ED%83%80%EC%9D%B4%ED%95%91%2C%20%EC%98%A4%EB%B2%84%EB%A1%9C%EB%94%A9.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%286%29%20-%20%ED%95%A8%EC%88%98%EB%81%BC%EB%A6%AC%20%EB%8C%80%EC%9E%85.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%288%29%20-%20%EC%9C%A0%ED%8B%B8%EB%A6%AC%ED%8B%B0%20%ED%83%80%EC%9E%85%2C%20%EC%BB%A4%EC%8A%A4%ED%85%80%20%EC%9C%A0%ED%8B%B8%EB%A6%AC%ED%8B%B0%20%ED%83%80%EC%9E%85.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%282%29%20-%20%ED%83%80%EC%9E%85%20%EC%B6%94%EB%A1%A0%2C%20%ED%83%80%EC%9E%85%20%EC%95%A8%EB%A6%AC%EC%96%B4%EC%8A%A4%2C%20%EC%9D%B8%ED%84%B0%ED%8E%98%EC%9D%B4%EC%8A%A4.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%283%29%20-%20Union%2C%20Intersection%2C%20%EB%A6%AC%ED%84%B0%EB%9F%B4%20%ED%83%80%EC%9E%85%2C%20Enum%20%2C%20never%20%20%2CGenerics.md", "https://www.typescriptlang.org/docs/handbook/2/types-from-types.html", "https://www.typescriptlang.org/docs/handbook/2/mapped-types.html", "https://www.typescriptlang.org/docs/handbook/2/conditional-types.html"]
---

> 「[Frontend_TIL: TypeScript(2)·(4)·(5)·(6)·(8)](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/tree/master/TypeScript)」의 인덱스 접근·맵드·조건부 타입·infer·커스텀 유틸리티 타입 부분을 바탕으로, [TypeScript 핸드북의 Creating Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)로 확인해 재구성한 노트다. 이 연산들을 조합해 라우트 문자열에서 매개변수 타입을 뽑는 실전 예는 [[typescript-advanced-types|TypeScript로 동적인 코드에 정적 타입 입히기]]에 있다.

## 타입 연산이란

TypeScript의 타입 문법은 그 자체로 작은 언어다. 값을 계산하듯 **기존 타입을 입력으로 새 타입을 계산**할 수 있다. 같은 모양을 두 번 적지 않고 원본 하나에서 파생시키면, 원본이 바뀔 때 파생 타입이 따라 바뀐다.

| 연산 | 문법 | 하는 일 |
| --- | --- | --- |
| 키 꺼내기 | `keyof T` | 속성 이름의 유니언 |
| 값의 타입 | `typeof value` | 변수·객체의 타입(값 → 타입) |
| 인덱스 접근 | `T['key']`, `T[number]` | 속성·원소의 타입 |
| 매핑 | `{ [K in Keys]: ... }` | 키를 순회하며 객체 타입 생성 |
| 조건 | `A extends B ? X : Y` | 타입 수준의 삼항 연산자 |
| 추출 | `infer U` | 조건부 타입 안에서 일부를 꺼내 이름 붙이기 |
| 문자열 조합 | `` `${A}-${B}` `` | 문자열 리터럴 타입 생성 |

## keyof, typeof, 인덱스 접근

```ts
type Animal = { name: string; size: number; isLazy: boolean }

type A1 = Animal['name']            // string
type A2 = Animal['name' | 'size']   // string | number
type A3 = Animal[keyof Animal]      // string | number | boolean
// Animal.name 같은 점 표기는 타입에서 쓸 수 없다

const obj = { hello: 'world', age: 28 }
type Keys = keyof typeof obj        // 'hello' | 'age'
type Values = (typeof obj)[Keys]    // string | number

const roles = ['admin', 'user'] as const
type Role = (typeof roles)[number]  // 'admin' | 'user'  (배열 원소 타입은 [number])
```

- `keyof any`는 `string | number | symbol`이다. 객체 키가 될 수 있는 타입 전부라, 「키로 쓸 수 있는 타입」 제약에 `K extends keyof any`(또는 내장 별칭 `PropertyKey`)를 쓴다.
- 값으로 정의한 상수 객체·배열에서 타입을 뽑을 때는 `as const`로 리터럴을 지켜 두고 `typeof`로 꺼낸다.

## 매핑 타입

`in`으로 키 유니언을 순회하며 속성을 만든다. `keyof T`를 순회하면 T의 모든 속성을 변형한다.

```ts
type Person = { readonly name: string; age?: number; email: string }

type PartialPerson = { [K in keyof Person]?: Person[K] }           // 모두 선택적
type Mutable = { -readonly [K in keyof Person]-?: Person[K] }       // readonly·? 제거
// { name: string; age: number; email: string }
```

| 수식어 | 뜻 |
| --- | --- |
| `?`, `+?` | 선택적으로 만든다 |
| `-?` | 선택성을 뗀다(`Required`) |
| `readonly`, `+readonly` | 읽기 전용으로 만든다 |
| `-readonly` | 읽기 전용을 뗀다 |

### 키 다시 짓기와 거르기: as

`as` 절로 순회하는 키를 다른 이름으로 바꾼다. 결과가 `never`인 키는 **사라진다.**

```ts
type ForModal<T> = { [K in keyof T as `${K & string}ForModal`]: T[K] }
type M = ForModal<{ name: string; age: number }>
// { nameForModal: string; ageForModal: number }

// 값 타입이 U인 속성만 빼기
type OmitByValue<O, U> = { [K in keyof O as O[K] extends U ? never : K]: O[K] }
type R = OmitByValue<{ name: string; age: number; married: boolean }, boolean>
// { name: string; age: number }
```

`K & string`은 `keyof`에 `number`·`symbol` 키가 섞여 있을 수 있어서 템플릿 리터럴에 넣기 전에 문자열만 남기는 처리다.

### 객체 키를 제네릭으로 받을 때

`type Rec<K, V> = { K: V }`는 이름이 `'K'`인 속성 하나를 만들 뿐이다. 키를 동적으로 만들려면 매핑 문법을 쓰고, K를 키가 될 수 있는 타입으로 제한한다. 내장 `Record`가 이 모양이다.

```ts
type MyRecord<K extends keyof any, V> = { [P in K]: V }
type Test = MyRecord<'hello', string> // { hello: string }
```

## 조건부 타입

`A extends B ? X : Y`는 **A가 B에 할당 가능하면** X, 아니면 Y다. 할당 가능성은 집합의 포함 관계다([[typescript-type-compatibility|타입 호환성]]).

```ts
type T1 = 'hi' extends string ? true : false                // true
type T2 = string extends 'hi' ? true : false                // false
type T3 = { x: number; y: number } extends { x: number } ? 1 : 0 // 1, 속성이 많은 쪽이 좁다
type T4 = string | number extends string ? true : false     // false, 유니언 전체가 string에 들어가지 않는다
```

### 분배 법칙

검사 대상이 **제네릭 타입 매개변수 그대로**(naked)이고 거기에 유니언이 들어오면, 조건부 타입은 **구성원마다 따로 계산한 뒤 유니언으로 합친다**(distributive conditional type).

```ts
type ToArray<T> = T extends string ? T[] : never

type A = ToArray<string | number>          // string[] | never → string[]
type B = ToArray<string | number | boolean> // boolean은 true | false라서 따로 계산된다
// T extends string | boolean 이었다면 string[] | false[] | true[] (boolean[]이 아니다)
```

| 상황 | 결과 |
| --- | --- |
| 제네릭 없이 `Start extends string ? ...` | 분배되지 않는다. 유니언 전체를 한 번에 검사한다 |
| `T`에 `never`를 넣음 | 빈 유니언을 분배하므로 결과도 **`never`** 다(`true`도 `false`도 아니다) |
| `[T] extends [U]`로 감쌈 | 분배를 막는다. 유니언 전체를 한 번에 검사하고, `[never] extends [string]`은 `true`다 |

```ts
type IsString<T> = [T] extends [string] ? true : false
type R1 = IsString<'hi' | 3>  // false (분배됐다면 boolean)
type R2 = IsString<never>     // true
```

내장 `Exclude<T, U> = T extends U ? never : T`가 분배를 이용한 대표 예다. 구성원 중 U에 속한 것만 `never`가 되어 사라진다.

### infer: 패턴에서 타입 꺼내기

조건부 타입의 `extends` 오른쪽 패턴 안에 `infer X`를 두면, 매칭된 부분이 X로 잡힌다. **X는 참 분기에서만** 쓸 수 있다.

```ts
type ElementOf<T> = T extends (infer E)[] ? E : never
type MyParameters<T> = T extends (...args: infer P) => any ? P : never
type MyReturnType<T> = T extends (...args: any) => infer R ? R : never
type MyInstanceType<T> = T extends abstract new (...args: any) => infer I ? I : never
type MyAwaited<T> = T extends PromiseLike<infer U> ? MyAwaited<U> : T  // 재귀

type PR<T> = T extends (...args: infer P) => infer R ? [P, R] : never  // 여러 개 동시에
type Same<T> = T extends { a: infer U; b: infer U } ? U : never
type S = Same<{ a: 1 | 2; b: 2 | 3 }>  // 1 | 2 | 3
```

같은 이름의 `infer`가 여러 자리에서 잡히면, 속성·반환값 같은 **공변 자리에서는 유니언**, 함수 매개변수 같은 반공변 자리에서는 인터섹션으로 합쳐진다.

## 템플릿 리터럴 타입

문자열 리터럴 타입을 템플릿으로 조합한다. 자리에 유니언이 들어가면 **모든 조합의 유니언**이 된다.

```ts
type City = 'seoul' | 'suwon' | 'busan'
type Vehicle = 'car' | 'bike' | 'walk'
type Route = `${City}:${Vehicle}`        // 9가지 조합

type Template = `template ${string}`
const ok: Template = 'template hello'
const ng: Template = 'template'           // 오류: 공백 뒤 문자열이 있어야 한다
```

`Uppercase`·`Capitalize` 같은 내장 문자열 타입과 함께 이벤트 이름(`on${Capitalize<K>}`), CSS 값 패턴, 키 이름 변환에 쓴다. `infer`와 묶으면 문자열을 파싱할 수도 있다([[typescript-advanced-types|라우트 매개변수 추출 예]]).

## 유틸리티 타입은 이 연산들로 만들어져 있다

| 내장 타입 | 구현 |
| --- | --- |
| `Partial<T>` | `{ [K in keyof T]?: T[K] }` |
| `Required<T>` | `{ [K in keyof T]-?: T[K] }` |
| `Readonly<T>` | `{ readonly [K in keyof T]: T[K] }` |
| `Pick<T, K extends keyof T>` | `{ [P in K]: T[P] }` |
| `Record<K extends keyof any, V>` | `{ [P in K]: V }` |
| `Exclude<T, U>` | `T extends U ? never : T` (분배) |
| `Extract<T, U>` | `T extends U ? T : never` |
| `Omit<T, K>` | `Pick<T, Exclude<keyof T, K>>` |
| `NonNullable<T>` | `T & {}` |
| `ReturnType<F>`, `Parameters<F>` | `infer`로 반환·매개변수를 꺼낸다 |

내장 목록은 [[typescript-basics#유틸리티 타입|유틸리티 타입]]에 있다. 내장으로 안 되는 것만 직접 만든다.

### 예: 정확히 하나만 허용하는 타입

유니언 객체는 여러 구성원의 속성을 섞은 값도 통과시킨다([[typescript-type-compatibility#유니언 객체가 섞이는 문제|유니언 객체가 섞이는 문제]]). 속성 중 **정확히 하나**만 받게 하려면, 각 속성마다 「그 속성만 있고 나머지는 `?: undefined`」인 객체를 만들어 유니언으로 묶는다.

```ts
// 속성마다 { 그 속성 } 하나씩: {a: A} | {b: B} | ...
type One<T> = { [K in keyof T]: Record<K, T[K]> }[keyof T]

// 속성마다 { 나머지 속성?: undefined }
type ExcludeOne<T> = { [K in keyof T]: Partial<Record<Exclude<keyof T, K>, undefined>> }[keyof T]

type PickOne<T> = One<T> & ExcludeOne<T>

type Contact = PickOne<{ email: string; phone: string }>
// { email: string; phone?: undefined } | { phone: string; email?: undefined }
const c1: Contact = { email: 'a@b.c' }                 // OK
const c2: Contact = { email: 'a@b.c', phone: '010' }   // 오류
```

`{ [K in keyof T]: X<K> }[keyof T]`는 **매핑한 뒤 값만 유니언으로 꺼내는** 관용구다. 속성마다 다른 타입을 만들어 합칠 때 쓴다. `One<T> & ExcludeOne<T>`의 인터섹션은 유니언 위로 분배되므로, 구성원끼리 맞지 않는 조합(`{ email: string } & { email?: undefined }` 등)은 속성 타입이 `never`가 되어 어떤 값도 만족하지 못하므로, 실제로 통과하는 것은 위의 두 경우뿐이다.

## 정리

- `keyof`·`typeof`·`T[K]`로 기존 타입·값에서 타입을 꺼낸다. 배열 원소는 `T[number]`.
- 매핑 타입은 키를 순회하며 `?`·`readonly`를 붙이거나(`+`) 떼고(`-`), `as`로 키를 바꾸거나 `never`로 거른다.
- 조건부 타입은 할당 가능성을 묻는다. 맨몸의 제네릭에 유니언이 오면 분배되고, `[T]`로 감싸면 분배가 멈춘다.
- `infer`는 패턴에서 타입을 꺼내며 참 분기에서만 쓴다.
- 내장 유틸리티 타입도 이 연산들의 조합이다. **원본 타입 하나에서 파생시켜 같은 모양을 두 번 적지 않는다.**

관련 노트: [[typescript-basics|TypeScript: 개념과 문법 한눈에 보기]], [[typescript-type-compatibility|TypeScript 타입 호환성]], [[typescript-advanced-types|TypeScript로 동적인 코드에 정적 타입 입히기]], [[react-typescript|React와 TypeScript]]
