---
title: "TypeScript 오류 메시지 읽기와 흔한 오류"
concept: "TS Errors"
summary: "TypeScript 오류는 한 줄 요약과 「왜?」를 따라 내려가는 상세 사슬로 되어 있다. 사슬을 맨 아래부터 읽는 법, TS 코드로 검색하는 법, 자주 만나는 오류 코드(TS2322·2345·2339·2304·2307·7006·18048·2353·2741·2352·1196 등)의 원인과 해결, 리터럴 넓히기·빈 객체 초기화 같은 흔한 함정, 오류를 덮는 방법의 우선순위와 진단용 컴파일러 플래그를 정리한다."
tags: ["typescript", "debugging", "frontend", "type-system"]
source: other
date: "2026-10-30"
sources: ["https://basarat.gitbook.io/typescript/main/interpreting-errors", "https://basarat.gitbook.io/typescript/main/common-errors", "https://basarat.gitbook.io/typescript/type-system/literal-types", "https://basarat.gitbook.io/typescript/main-1/lazyobjectliteralinitialization", "https://www.typescriptlang.org/tsconfig/"]
---

> basarat의 「[TypeScript Deep Dive](https://basarat.gitbook.io/typescript)」의 Errors in TypeScript 장(Interpreting Errors, Common Errors)과 리터럴 타입·지연 객체 초기화 팁을 바탕으로, TypeScript 7.0.2로 오류 코드를 직접 확인해 재구성한 노트다.

## 오류 메시지의 구조

TypeScript 오류는 두 부분으로 되어 있다.

| 부분 | 모양 | 쓰는 곳 |
| --- | --- | --- |
| 요약(succinct) | `TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'.` | 오류 코드와 메시지로 **검색**한다 |
| 상세(detailed) | 요약 아래로 들여쓴 줄이 이어진다 | **원인**을 찾는다 |

상세 부분은 「왜?」에 대한 답의 사슬이다. 한 줄 내려갈 때마다 더 구체적인 원인이 나오고, **맨 아래 줄이 고칠 곳이다.**

```ts
type SomethingComplex = { foo: number; bar: string };
declare function take(arg: SomethingComplex): void;
declare function getBar(): string;

const fail = { foo: 123, bar: getBar };
take(fail);
```

```text
error TS2345: Argument of type '{ foo: number; bar: () => string; }'
              is not assignable to parameter of type 'SomethingComplex'.
  Types of property 'bar' are incompatible.               ← 왜? bar가 안 맞는다
    Type '() => string' is not assignable to type 'string'. ← 왜? 함수를 넣었다
```

맨 아래 줄을 보면 `getBar`를 호출하지 않고 함수 자체를 넣었다(`getBar()`를 써야 한다). 편집기 툴팁은 보통 상세 사슬을 먼저, 요약을 나중에 보여 준다.

**읽는 순서**: 맨 아래 줄 → 그 위 줄로 올라가며 어느 속성·인자에서 어긋났는지 확인 → 맨 위 줄로 어느 호출·대입인지 확인한다. 타입이 길어 `...`로 잘리면 `noErrorTruncation`을 켠다.

## 자주 만나는 오류 코드

| 코드 | 메시지 | 흔한 원인 | 해결 |
| --- | --- | --- | --- |
| TS2322 | Type 'A' is not assignable to type 'B' | 대입·반환값의 타입이 다르다 | 상세 사슬 맨 아래를 고친다. 리터럴 넓히기는 아래 「함정」 |
| TS2345 | Argument of type 'A' is not assignable to parameter of type 'B' | 인자 타입이 매개변수와 다르다 | 위와 같다. 호출 대상의 시그니처를 확인한다 |
| TS2741 | Property 'x' is missing in type 'A' but required in type 'B' | 필수 속성을 빠뜨렸다 | 속성을 채우거나 정의에서 `x?:`로 바꾼다 |
| TS2353 | Object literal may only specify known properties | 객체 리터럴에 정의에 없는 속성(대부분 오타)이 있다. 잉여 속성 검사([[typescript-type-compatibility#잉여 속성 검사\|타입 호환성]]) | 이름을 고친다. 추가 속성을 정말 허용하려면 인덱스 시그니처를 둔다 |
| TS2339 | Property 'x' does not exist on type 'A' | 타입에 없는 속성에 접근. `{}`로 시작한 객체에 나중에 속성을 붙인 경우가 많다 | 처음부터 모든 속성을 넣어 만들거나 인터페이스를 적는다. 유니언이면 먼저 좁힌다 |
| TS2304 / TS2552 | Cannot find name 'x' (Did you mean 'y'?) | 선언하지 않은 이름. 전역 스크립트(`<script>`로 들어온 `gtag`, `$`)이거나 타입 공간·값 공간을 헷갈렸다 | `declare`로 선언하거나 `@types`를 설치하고 `types`에 적는다([[typescript-project-config#바깥 코드를 설명하기: 앰비언트 선언\|앰비언트 선언]]) |
| TS2307 | Cannot find module 'x' or its corresponding type declarations | 패키지는 있는데 타입이 없거나, 경로 해석 규칙이 실행 환경과 다르다 | `@types/x` 설치, `declare module 'x'`, `moduleResolution`을 `bundler`·`nodenext`로 |
| TS7006 | Parameter 'a' implicitly has an 'any' type | `noImplicitAny`(strict)에서 매개변수 타입을 추론할 수 없다 | 타입을 적는다. 콜백이면 받는 쪽 함수 타입을 적어 문맥 추론을 받는다 |
| TS18048 / TS18047 | 'x' is possibly 'undefined' / 'null' | `strictNullChecks`에서 없을 수 있는 값에 접근 | `if`·`?.`·`??`로 좁힌다. `!`는 확실할 때만 |
| TS2564 | Property 'p' has no initializer and is not definitely assigned in the constructor | `strictPropertyInitialization`에서 생성자가 속성을 채우지 않았다 | 생성자에서 초기화, 기본값, `p?:`, 다른 곳에서 채운다면 `p!:` |
| TS2352 | Conversion of type 'A' to type 'B' may be a mistake | 서로 겹치지 않는 타입으로 `as` 단언 | 단언이 맞는지 다시 본다. 정말 의도했다면 `as unknown as B` |
| TS1196 | Catch clause variable type annotation must be 'any' or 'unknown' | `catch (e: Error)`처럼 구체 타입을 적었다. 무엇이든 던질 수 있어 보장할 수 없다 | `catch (e)`(strict면 `unknown`)로 받고 `e instanceof Error`로 좁힌다 |
| TS2769 | No overload matches this call | 오버로드 중 맞는 것이 없다. 상세에 오버로드별 실패 이유가 나온다 | 가장 가까워 보이는 오버로드의 실패 이유를 읽는다 |
| TS2589 | Type instantiation is excessively deep and possibly infinite | 재귀 조건부 타입이 너무 깊다 | 재귀를 꼬리 재귀 모양으로 바꾸거나 깊이를 제한한다 |
| TS5112 | tsconfig.json is present but will not be loaded if files are specified on commandline | 설정 파일이 있는 폴더에서 `tsc a.ts` | `tsc -p .` 또는 `tsc --ignoreConfig a.ts` |

설치 문제에서 오는 오류도 있다. `@types/react`가 `node_modules` 안에 두 벌 들어오면 「Interface 'X' cannot simultaneously extend types 'Component' and 'Component'」처럼 같은 이름의 타입이 서로 다르다는 오류가 난다. 잠금 파일을 지우고 다시 설치하거나, 패키지 관리자의 dedupe·overrides로 한 벌만 남긴다. 라이브러리는 `@types/react`를 `peerDependencies`로 둬야 이런 일이 없다.

## 흔한 함정

### 리터럴 넓히기

`const s = 'foo'`의 타입은 `'foo'`지만, **객체 속성과 `let`은 넓은 타입(`string`)으로 추론된다.** 나중에 바뀔 수 있기 때문이다.

```ts
declare function iTakeFoo(foo: 'foo'): void;

const test = { someProp: 'foo' };          // { someProp: string }
// iTakeFoo(test.someProp);                // TS2345: string은 'foo'가 아니다

const ok1 = { someProp: 'foo' } as const;  // readonly { someProp: 'foo' }
const ok2 = { someProp: 'foo' } satisfies { someProp: 'foo' };
iTakeFoo(ok1.someProp);
iTakeFoo(ok2.someProp);
```

해결은 `as const`, `satisfies`, 선언 타입 표기 중 하나다. `'foo' as 'foo'`처럼 값마다 단언하는 것은 옛 방식이다.

### 빈 객체로 시작해 속성 붙이기

JavaScript에서 흔한 `let foo = {}; foo.bar = 1`은 TS2339가 된다. `foo`의 타입이 `{}`로 정해졌기 때문이다.

| 방법 | 평가 |
| --- | --- |
| 처음부터 모든 속성을 넣어 만든다 | 가장 좋다. 빠뜨릴 수 없다 |
| `const foo: Foo = { ... }`로 타입을 적는다 | 좋다. 속성을 빠뜨리면 TS2741 |
| `let foo = {} as Foo` 후 하나씩 대입 | 중간. 타입은 검사되지만 **빠뜨린 속성은 잡지 못한다** |
| `let foo = {} as any` | 마이그레이션 중 임시로만 |

### 그 밖에

- **함수를 호출하지 않고 넘김**: 위 `bar: getBar` 예처럼 `() => T`와 `T`가 어긋난다는 메시지가 나오면 괄호를 빠뜨린 것이다.
- **콜백 매개변수의 `any`**: `const f = (a, b) => …`처럼 타입을 받을 곳이 없으면 TS7006. 변수에 함수 타입을 적으면 매개변수가 추론된다.
- **`any`가 퍼진다**: 타입 없는 JS 함수의 반환값이 `any`면 그 값을 쓴 식도 모두 `any`가 되어 오류가 사라진다. 오류가 「없어서」 이상할 때는 마우스를 올려 `any`인지 본다.

## 오류를 덮는 방법

고치는 것이 먼저다. 당장 고칠 수 없을 때는 **가장 좁은 범위로, 이유를 남기고** 덮는다.

| 방법 | 범위 | 비고 |
| --- | --- | --- |
| 타입을 바로잡는다 | - | 기본 |
| `x as unknown as T`, `x!` | 식 하나 | 단언은 컴파일러가 확인하지 않는다 |
| `// @ts-expect-error 사유` | 다음 줄 | 오류가 없어지면 이 주석이 오류가 되어 「이제 지워도 된다」고 알려 준다 |
| `// @ts-ignore` | 다음 줄 | 오류가 없어져도 조용하다. `@ts-expect-error`를 쓴다 |
| `// @ts-nocheck` | 파일 전체 | 마이그레이션 중인 JS 파일 정도에만 |

## 진단용 플래그

| 플래그 | 보여 주는 것 |
| --- | --- |
| `--noErrorTruncation` | 긴 타입을 `...`로 자르지 않는다 |
| `--explainFiles`, `--listFiles` | 어떤 파일이 왜 컴파일 컨텍스트에 들어왔는가 |
| `--traceResolution` | import 하나를 찾기 위해 어떤 경로를 어떤 순서로 봤는가. TS2307을 추적할 때 |
| `--showConfig` | `extends`까지 합쳐진 최종 설정 |
| `--extendedDiagnostics`, `--generateTrace <dir>` | 검사 시간·메모리, 느린 타입의 위치 |

## 정리

- 오류는 **맨 아래 줄부터** 읽는다. 위로 올라가며 어느 속성·인자인지 확인한다.
- 같은 오류는 `TS` 코드로 검색한다. 코드는 대입(2322·2345), 없는 속성(2339·2353·2741), 이름·모듈(2304·2307), strict 계열(7006·18048·2564)로 묶어 기억한다.
- 리터럴은 `as const`·`satisfies`로 지키고, 객체는 한 번에 만든다.
- 덮을 때는 `@ts-expect-error`에 사유를 남긴다.

**TypeScript 오류 메시지는 「무엇이 틀렸나」에서 시작해 「정확히 어디가 틀렸나」로 내려가는 설명이다.**

관련 노트: [[typescript-basics|TypeScript: 개념과 문법 한눈에 보기]], [[typescript-type-compatibility|TypeScript 타입 호환성]], [[typescript-project-config|TypeScript 프로젝트 설정]], [[typescript-compiler-internals|TypeScript 컴파일러 내부 구조]]
