---
title: "TypeScript 타입 호환성: 어떤 값을 어디에 대입할 수 있나"
concept: "Type Compatibility"
summary: "TypeScript의 타입은 값의 집합이고, 대입은 좁은 집합을 넓은 집합에 넣는 일이다. 구조적 타이핑과 잉여 속성 검사, 유니언·인터섹션의 넓이, 객체 인터섹션과 원시 인터섹션의 차이, 튜플·readonly 배열, 함수 대입의 공변·반공변·이변성, interface extends와 &의 충돌 처리, 유니언 객체가 섞이는 문제와 구분자를 정리한다."
tags: ["typescript", "type-system", "javascript", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://basarat.gitbook.io/typescript/type-system/freshness", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%284%29%20-%20%20%EB%A7%B5%EB%93%9C%20%ED%83%80%EC%9E%85%28Mapped%20Types%29%2C%20%ED%85%9C%ED%94%8C%EB%A6%BF%20%EB%A6%AC%ED%84%B0%EB%9F%B4%20%ED%83%80%EC%9E%85%28Template%20Literal%20Types%29.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%286%29%20-%20%ED%95%A8%EC%88%98%EB%81%BC%EB%A6%AC%20%EB%8C%80%EC%9E%85.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%287%29%20-%20satisfies%2C%20%ED%83%80%EC%9E%85%ED%99%95%EC%9E%A5.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%283%29%20-%20Union%2C%20Intersection%2C%20%EB%A6%AC%ED%84%B0%EB%9F%B4%20%ED%83%80%EC%9E%85%2C%20Enum%20%2C%20never%20%20%2CGenerics.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%288%29%20-%20%EC%9C%A0%ED%8B%B8%EB%A6%AC%ED%8B%B0%20%ED%83%80%EC%9E%85%2C%20%EC%BB%A4%EC%8A%A4%ED%85%80%20%EC%9C%A0%ED%8B%B8%EB%A6%AC%ED%8B%B0%20%ED%83%80%EC%9E%85.md", "https://www.typescriptlang.org/docs/handbook/type-compatibility.html", "https://www.typescriptlang.org/tsconfig/#strictFunctionTypes"]
---

> 「[Frontend_TIL: TypeScript(4)·(6)·(7)](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/tree/master/TypeScript)」의 객체·함수 대입, 타입 확장 부분을 바탕으로, [TypeScript 핸드북의 Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)로 확인해 재구성한 노트다. 신선도(freshness) 설명은 basarat의 「[TypeScript Deep Dive](https://basarat.gitbook.io/typescript)」의 Freshness 절로 보강했다. 문법 전반은 [[typescript-basics|TypeScript: 개념과 문법 한눈에 보기]]에, 타입을 변형하는 연산은 [[typescript-type-operators|TypeScript 타입 연산]]에 있다.

## 타입은 값의 집합이다

타입 하나는 **그 타입이 될 수 있는 값들의 집합**이다. `string`은 모든 문자열의 집합이고, `'a' | 'b'`는 그 부분집합이다. 대입 `target = source`가 허용되는 조건은 **source의 집합이 target의 집합 안에 들어가는가**다. 이 관계를 「source가 target에 할당 가능하다(assignable)」고 하고, 조건부 타입의 `A extends B`도 같은 관계를 묻는다.

```text
            unknown          ← 모든 값 (최상위)
         ┌────┴────┐
      string     object ...
       │            │
    'a' | 'b'    { name: string }
       │            │
      'a'      { name: string; age: number }
         └────┬────┘
            never            ← 값이 하나도 없음 (최하위)
```

- **좁은 타입은 넓은 타입에 대입할 수 있고, 반대는 안 된다.**
- `unknown`에는 무엇이든 대입되지만 `unknown`은 `any`·`unknown` 말고는 어디에도 대입되지 않는다.
- `never`는 어디에나 대입되지만 `never`에는 `never`만 대입된다. `any`도 `never`에는 대입되지 않는다.
- `any`는 집합 관계를 무시한다. 어디에든 대입되고 무엇이든 받는다.

## 객체: 구조적 타이핑

TypeScript는 이름이 아니라 **구조(모양)** 로 호환성을 판단한다(structural typing). 필요한 속성을 모두 가졌으면 다른 이름의 타입이어도 대입된다.

```ts
interface Person { name: string; age: number }
interface Employee { name: string; age: number; position: string }

let person: Person = { name: 'John', age: 30 }
let employee: Employee = { name: 'Alice', age: 25, position: 'Manager' }

person = employee   // OK: Employee는 Person의 속성을 모두 가진다
employee = person   // 오류: position이 없다
```

속성이 많은 `Employee`가 더 **좁은** 타입이다. 조건이 많을수록 만족하는 값이 적어진다. 코드가 길다고 넓은 타입이 아니다.

### 잉여 속성 검사

구조적 타이핑이라도 **객체 리터럴을 바로 대입할 때**는 대상에 없는 속성을 오류로 잡는다(excess property checking, 오류 코드 TS2353). 갓 만든 리터럴은 「신선(fresh)」하다고 보고, 변수에 담기거나 단언·확장되면 신선도가 사라져 검사도 하지 않는다. 그래서 신선도(freshness) 검사라고도 한다. 리터럴에만 이 검사를 하는 이유는, 그 자리에서 만든 객체의 남는 속성은 받는 쪽이 절대 읽지 않으므로 거의 언제나 오타나 API 오해이기 때문이다.

```ts
const p1: Person = { name: 'a', age: 1, position: 'x' } // 오류: position은 Person에 없다
const tmp = { name: 'a', age: 1, position: 'x' }
const p2: Person = tmp                                    // OK: 리터럴이 아니면 검사하지 않는다
```

- 선택적 속성만 있는 타입에서 특히 쓸모 있다. `{ name?: string }`에 `{ neme: 'x' }`를 넣으면 구조적으로는 통과하지만(모든 속성이 선택이라), 잉여 속성 검사가 오타를 잡는다. 일부 필드만 바꾸는 `setState`·`update(patch)` API를 「모든 속성 선택」으로 만들어도 안전한 이유다.
- 추가 속성을 정말 허용하려면 인덱스 시그니처를 둔다: `{ foo: number; [key: string]: unknown }`.

## 유니언과 인터섹션의 넓이

| 식 | 집합 연산 | 넓이 |
| --- | --- | --- |
| `A \| B` | 합집합 | A보다도, B보다도 넓다 |
| `A & B` | 교집합 | A보다도, B보다도 좁다 |

그래서 `A | B` 타입 값은 `A`·`B`·`A & B` 어디에도 그대로 대입할 수 없고, 좁히기를 거쳐야 한다. 유니언 값에서는 **모든 구성원이 공통으로 가진 속성**에만 접근할 수 있다.

### 객체 인터섹션과 원시 인터섹션

`&`는 늘 교집합이지만 결과가 직관과 달라 보이는 경우가 있다.

| 식 | 결과 | 이유 |
| --- | --- | --- |
| `{ yellow: true } & { red: true }` | `{ yellow: true; red: true }` | 두 조건을 **모두** 만족하는 객체의 집합이다. 속성이 합쳐진 모양이 된다 |
| `number & string` | `never` | 둘 다인 값은 없다 |
| `(number \| string) & (string \| boolean)` | `string` | 원시 유니언끼리는 공통 원소만 남는다 |
| `({ name: string } \| { hello: string }) & ({ age: number } \| { car: 'Kia' })` | 네 조합의 유니언 | 인터섹션이 유니언 위로 **분배**된다: `{name, age} \| {name, car} \| {hello, age} \| {hello, car}` |

### interface extends와 &의 차이

둘 다 기존 타입에 속성을 더하지만, **같은 속성의 타입이 충돌할 때** 다르게 처리한다.

```ts
interface Mango { red: false }
interface MangoApple extends Mango { red: true }  // 선언에서 바로 오류

type MangoApple2 = { red: false } & { red: true } // 선언은 통과. 쓸 수 있는 값이 없는 never가 된다
```

- `extends`는 확장한 타입이 원래 타입에 대입 가능한지 **선언 시점에** 검사한다.
- `&`는 속성 타입끼리 교집합을 낸다. `string & number`처럼 속성 하나가 `never`가 되고, 충돌한 속성이 리터럴 타입(판별 속성)이면 교차 타입 **전체가 `never`로 줄어든다**. 실수가 사용하는 곳에서야 드러난다.

### 확장은 「속성 추가」보다 안전하다

새 응답 필드(`isVIP`, `isVVIP`)를 기존 타입에 선택 속성으로 계속 붙이면 모든 배열이 같은 타입이 되어, VIP 목록에서 `isVVIP`를 읽는 실수를 잡지 못한다. 공통 타입을 두고 `interface VIPUserInfo extends UserInfo { isVIP: boolean }`처럼 **경우별로 확장한 타입**을 쓰면 잘못된 접근이 컴파일 오류가 된다.

## 배열과 튜플

| 대입 | 결과 | 이유 |
| --- | --- | --- |
| `[string, number]` → `(string \| number)[]` | OK | 튜플은 길이와 자리별 타입이 정해진, 배열보다 좁은 타입이다 |
| `(string \| number)[]` → `[string, number]` | 오류 | 길이와 순서를 보장할 수 없다 |
| `string[]` → `readonly string[]` | OK | 읽기 전용 배열이 더 넓다. 「변경 메서드가 없어도 된다」는 약한 조건이다 |
| `readonly string[]` → `string[]` | 오류 | 받은 쪽이 `push`할 수 있게 된다 |

## 함수끼리 대입

함수 타입 `(x: P) => R`의 호환성은 반환 타입과 매개변수 타입을 따로 본다.

| 자리 | 성질 | 규칙 |
| --- | --- | --- |
| 반환 타입 | **공변**(covariant) | 반환 타입이 더 좁은 함수를 넓은 함수 타입에 대입할 수 있다 |
| 매개변수 타입 | **반공변**(contravariant), `strictFunctionTypes` 켰을 때 | 매개변수 타입이 **더 넓은** 함수를 좁은 함수 타입에 대입할 수 있다 |
| 매개변수 타입, 옵션 끔 | **이변**(bivariant) | 넓은 쪽도, 좁은 쪽도 대입된다 |
| 매개변수 개수 | | **적게 받는 함수**는 많이 주는 자리에 대입된다. `arr.forEach((x) => ...)`가 되는 이유다 |

```ts
type Fn = (x: string) => string | number

const a = (x: string): string => x           // 반환이 더 좁다
const b = (x: string | number): number => 1   // 매개변수가 더 넓다
const c = (x: 'a'): number => 1               // 매개변수가 더 좁다

let f: Fn = a  // OK
f = b          // OK
f = c          // 오류: f('z')로 부르면 c가 감당하지 못한다
```

매개변수가 반공변인 이유는 대입받은 변수로 **어떤 인자가 들어올지**를 생각하면 보인다. `Fn`으로 부르는 쪽은 아무 `string`이나 넘기므로, 실제 함수는 그보다 넓게 받아야 안전하다. `strictFunctionTypes`는 `strict: true`에 포함된다.

### 메서드 단축 문법은 여전히 이변이다

`strictFunctionTypes`는 **함수 타입 속성**에만 적용된다. 메서드 단축 문법으로 선언한 멤버는 하위 호환을 위해 이변으로 검사한다.

```ts
interface SayMethod   { say(a: string | number): string }       // 메서드 단축 문법
interface SayProperty { say: (a: string | number) => string }    // 함수 타입 속성

const sayStr = (a: string) => 'hello'

const m: SayMethod = { say: sayStr }    // 통과 (이변)
const p: SayProperty = { say: sayStr }  // 오류 (반공변)
```

엄격한 검사를 받고 싶은 콜백·핸들러 멤버는 속성 문법(`say: (...) => ...`)으로 적는다.

### void를 반환하는 함수 타입

반환 타입이 `void`인 **함수 타입**에는 값을 반환하는 함수도 대입된다. 반환값을 쓰지 않겠다는 약속일 뿐이기 때문이다. `arr.forEach(v => list.push(v))`처럼 `push`의 반환값(`number`)이 있어도 `forEach` 콜백 자리에 들어가는 이유다. 반면 함수 선언에 직접 `: void`를 붙이면 값을 반환하는 순간 오류다.

```ts
type Callback = () => void
const cb: Callback = () => 1    // OK, 호출 결과의 타입은 void로 보인다

function log(): void { return 1 } // 오류
```

## 유니언 객체가 섞이는 문제

```ts
type Person1 = { name: string }
type Person2 = { city: string }
declare function compare(p: Person1 | Person2): void

compare({ name: 'alex', city: 'Bucheon' }) // 오류가 나지 않는다
```

유니언은 합집합이라 두 구성원의 속성을 다 가진 객체도 `Person1`이면서 `Person2`이므로 통과한다. 잉여 속성 검사도 유니언에서는 **어느 구성원에든 있는 속성**이면 허용한다. 「정확히 하나」를 강제하는 방법은 둘이다.

| 방법 | 모양 | 비용 |
| --- | --- | --- |
| 구분자(판별 속성, 브랜드) | 구성원마다 `__type: 'p1'`처럼 고유한 리터럴 속성을 둔다. `switch`로 좁히고 `never`로 완전성 검사까지 된다([[typescript-basics#구분된 유니언\|구분된 유니언]]) | 값마다 구분자를 넣어야 한다 |
| 나머지 속성을 `?: undefined`로 막기 | `{ name: string; city?: undefined } \| { name?: undefined; city: string }`. 매핑 타입으로 자동 생성할 수 있다([[typescript-type-operators#예: 정확히 하나만 허용하는 타입\|정확히 하나만 허용하는 타입]]) | 타입이 복잡해진다 |

## 정리

- 타입은 값의 집합이고, 대입은 좁은 집합을 넓은 집합에 넣는 일이다. `never`가 맨 아래, `unknown`이 맨 위다.
- 객체는 이름이 아니라 모양으로 비교하지만, 객체 리터럴을 바로 대입할 때만은 잉여 속성을 잡는다.
- `A | B`는 넓어지고 `A & B`는 좁아진다. 객체 인터섹션은 속성을 합치고, 원시 인터섹션은 공통 원소만 남긴다.
- 함수는 반환 타입이 공변, 매개변수가 반공변이다. 단 메서드 단축 문법은 이변이다.
- 유니언 객체를 「정확히 하나」로 쓰려면 구분자를 둔다.

관련 노트: [[typescript-basics|TypeScript: 개념과 문법 한눈에 보기]], [[typescript-type-operators|TypeScript 타입 연산]], [[typescript-advanced-types|TypeScript로 동적인 코드에 정적 타입 입히기]], [[react-typescript|React와 TypeScript]]
