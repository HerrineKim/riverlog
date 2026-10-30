---
title: "TypeScript: 개념과 문법 한눈에 보기"
concept: "TypeScript"
summary: "TypeScript는 JavaScript에 타입 검사와 자동완성을 더한 슈퍼셋이다. JavaScript가 정적 타입을 얻기까지의 역사와 흔한 오해, 실행 환경(tsc·Go로 다시 쓴 TypeScript 7·Vite·Node.js 타입 제거), 기본 타입과 any·unknown·never, 추론·단언·가드·satisfies, type과 interface, 제네릭, 함수 오버로드와 클래스 수식어, 모듈과 @types, 구분된 유니언, 표준 데코레이터, 유틸리티 타입을 표 중심으로 정리하고, 추론 → API 스키마 → 좁히기 → strict 순으로 익히는 순서를 덧붙인다."
tags: ["typescript", "javascript", "frontend", "type-system", "tools"]
source: other
date: "2026-10-30"
sources: ["https://www.heropy.dev/p/WhqSC8", "https://velog.io/@teo/typescript", "https://www.typescriptlang.org/docs/handbook/intro.html", "https://www.typescriptlang.org/docs/handbook/utility-types.html", "https://basarat.gitbooks.io/typescript/content/", "https://basarat.gitbook.io/typescript/type-system/type-inference", "https://basarat.gitbook.io/typescript/type-system/type-assertion", "https://basarat.gitbook.io/typescript/type-system/index-signatures", "https://basarat.gitbook.io/typescript/type-system/readonly", "https://basarat.gitbook.io/typescript/type-system/never", "https://basarat.gitbook.io/typescript/type-system/callable", "https://ahnheejong.gitbook.io/ts-for-jsdev/", "https://www.typescriptlang.org/ko/docs/handbook/intro.html", "https://jameshenry.blog/typescript-the-missing-introduction/", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%281%29%20-%20%ED%99%98%EA%B2%BD%EC%84%A4%EC%A0%95%2C%20%20Annotaions.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%282%29%20-%20%ED%83%80%EC%9E%85%20%EC%B6%94%EB%A1%A0%2C%20%ED%83%80%EC%9E%85%20%EC%95%A8%EB%A6%AC%EC%96%B4%EC%8A%A4%2C%20%EC%9D%B8%ED%84%B0%ED%8E%98%EC%9D%B4%EC%8A%A4.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%283%29%20-%20Union%2C%20Intersection%2C%20%EB%A6%AC%ED%84%B0%EB%9F%B4%20%ED%83%80%EC%9E%85%2C%20Enum%20%2C%20never%20%20%2CGenerics.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%285%29%20-%20%EC%BB%A8%EB%94%94%EC%85%94%EB%84%90%20%ED%83%80%EC%9E%85%2C%ED%95%A8%EC%88%98%20%EB%A9%94%EC%84%9C%EB%93%9C%20%ED%83%80%EC%9D%B4%ED%95%91%2C%20%EC%98%A4%EB%B2%84%EB%A1%9C%EB%94%A9.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/TypeScript%287%29%20-%20satisfies%2C%20%ED%83%80%EC%9E%85%ED%99%95%EC%9E%A5.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/TypeScript/Typescript%289%29%20-%20%ED%83%80%EC%9E%85%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%20%EC%BB%B4%ED%8C%8C%EC%9D%BC.md", "https://medium.freecodecamp.com/why-use-static-types-in-javascript-part-1-8382da1e0adb", "https://flow.org/blog/2015/02/20/Flow-Comments/", "https://github.com/grab/front-end-guide"]
---

> HEROPY의 「[한눈에 보는 타입스크립트](https://www.heropy.dev/p/WhqSC8)」(2020.01 작성, 2026.08 갱신)를 바탕으로, 역사와 익히는 순서는 테오(teo)의 「[Typescript는 어떻게 공부해야 하나요?](https://velog.io/@teo/typescript)」(2022.02)로 보강해 재구성한 노트다. 컴파일 타임과 런타임 구분은 「[TypeScript: the missing introduction](https://jameshenry.blog/typescript-the-missing-introduction/)」을 바탕으로 보강했다. 튜플·인덱스 시그니처·enum·제네릭의 함정·좁히기 연산자·오버로드 순서는 「[Frontend_TIL: TypeScript 시리즈](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/tree/master/TypeScript)」를 바탕으로 보강했다. 정적 타입의 득실과 Flow는 「[Why use static types in JavaScript?](https://medium.freecodecamp.com/why-use-static-types-in-javascript-part-1-8382da1e0adb)」, 「[Flow Comments](https://flow.org/blog/2015/02/20/Flow-Comments/)」을 바탕으로 보강했다.
> Grab의 「[Front End Guide](https://github.com/grab/front-end-guide)」를 바탕으로 보강했다.
> 추론의 방향, 단언 규칙, 인덱스 시그니처, readonly, never, 호출 가능 타입은 basarat의 「[TypeScript Deep Dive](https://basarat.gitbook.io/typescript)」의 Type System 장을 바탕으로 보강했다.

## TypeScript란

TypeScript는 **JavaScript의 슈퍼셋(superset)** 이다. 모든 JavaScript 코드는 그대로 TypeScript 코드이고, 그 위에 **정적 타입 시스템**을 얹었다. `.ts` 파일로 쓰고, 타입 검사를 거친 뒤 타입 표기를 지운 JavaScript로 실행한다. 목적은 오류를 런타임이 아니라 **코드를 입력하는 동안** 잡고, 편집기 자동완성을 강하게 만드는 것이다. 타입이 틀려도 JavaScript로서는 돌아간다. 타입은 검증 도구일 뿐이다.

웹 프론트엔드에서는 사실상 기본 언어다. npm 주요 라이브러리 대부분이 TypeScript로 쓰였거나 타입 선언을 제공한다.

### JavaScript가 타입을 얻기까지

JavaScript는 짧은 스크립트용으로 만들어져 타입과 클래스를 빼고 단순하게 설계됐다. 그 결과 **프로토타입 객체 기반·일급 함수·동적 타입**이라는 조합이 됐다.

| 시도 | 결과 |
| --- | --- |
| ECMAScript 4 (1999~2008) | 클래스·정적 타입·인터페이스·제네릭을 넣으려 했으나 하위 호환과 이해관계 충돌로 폐기됐다. 그래서 ES3 다음이 ES5다. 이 초안을 이어받은 것이 Flash의 ActionScript 3다 |
| CoffeeScript | 간결한 문법을 내세웠다. 화살표 함수·구조 분해·템플릿 리터럴이 ES6에 들어가는 데 영향을 줬다 |
| Babel | 제안 단계 문법을 먼저 써 보게 했고, 호응을 얻은 문법(옵셔널 체이닝, `??` 등)이 표준이 됐다 |
| TypeScript (2012, Microsoft) | 언어를 갈아엎지 않고 **슈퍼셋**으로 정적 타입의 장점만 더했다. VS Code 자동완성과 함께 퍼졌다 |
| Flow (2014, Facebook) | 컴파일러가 아니라 **타입 검사기**다. 파일 맨 위에 `// @flow`를 단 파일만 검사하고, 타입 표기는 Babel이 지운다. 빌드 없이 쓰려고 `/*: number */` 같은 주석 문법도 지원했다. 2010년대 후반 React 생태계에서 TypeScript와 경쟁했지만, 지금은 Meta 내부 위주로 쓰이고 생태계는 TypeScript로 모였다 |

동적 타입은 작은 코드에서는 유연하지만, 큰 팀이 정해진 스키마 위에서 일할 때는 **오타 하나가 실행해 봐야 드러나는** 비용이 크다. State of JS 설문에서 "JavaScript에 가장 필요한 기능"으로 정적 타입이 해마다 1위에 오르고, 타입 문법을 주석처럼 무시하고 실행하게 하자는 TC39 제안(Type Annotations)도 이 흐름에 있다.

### 실행 환경

| 실행 방법 | 설명 |
| --- | --- |
| `tsc` | 공식 컴파일러. `tsconfig.json`의 `compilerOptions`(`strict`, `target`, `module` 등)를 따른다. TypeScript 7.0(2026.07)부터 컴파일러가 Go로 다시 쓰여 큰 프로젝트의 빌드가 8~12배 빨라졌다. Vue·Svelte·Angular 템플릿 검사처럼 컴파일러 API에 기대는 도구는 안정 API가 나올 때까지 TypeScript 6을 쓴다(API는 7.1 베타, 2026.10에 들어왔다) |
| Vite 등 번들러 | `.ts`를 바로 import한다. 번들러(Babel, esbuild 포함)는 타입을 **지우기만** 하므로 검사는 편집기와 `tsc --noEmit`이 따로 한다 |
| Node.js | 22.18·23.6부터 플래그 없이 `node main.ts`로 실행한다(타입 제거, type stripping). 24.12·25.2부터 안정 단계다. `enum`처럼 런타임 코드가 생기는 문법은 지원하지 않으므로 `erasableSyntaxOnly` 옵션으로 막아 둔다. Deno·Bun도 TypeScript를 기본 실행한다 |
| TypeScript Playground | 브라우저에서 바로 실험한다 |

과거의 단점(느린 `tsc`, 타입 없는 라이브러리의 `any` 범벅, 실행 전 빌드 필요)은 이렇게 대부분 사라졌다. 라이브러리 타입은 패키지 자체나 `@types/*`가 제공한다(아래 「모듈과 타입 선언」).

### 정적 타입과 동적 타입, 컴파일 타임과 런타임

**정적 타입 언어는 타입 검사를 실행 전(컴파일 시점)에, 동적 타입 언어는 실행 중에 한다.** 타입은 "이 함수는 언제나 문자열을 돌려준다" 같은 **불변 조건**을 코드에 적어 두는 수단이고, 타입 검사는 코드가 그 조건을 지키는지 확인한다.

| 용어 | JavaScript·TypeScript에서 |
| --- | --- |
| 동적 타입 | **값이 타입을 갖고, 변수는 아무 값이나 담는다.** `let name = 'James'; name = 3`이 문제없이 돈다. JavaScript가 이렇다 |
| 정적 타입 | 변수·매개변수에 타입을 묶어 의도를 적는다(`let name: string`). 어긋난 대입은 실행 전에 걸린다 |
| 컴파일 타임 | 코드를 실행할 형태로 바꾸는 시점. TypeScript의 타입 검사는 **여기서만** 일어나고, 결과물은 타입이 지워진 순수 JavaScript다 |
| 런타임 | 실제로 실행되는 시점. 타입 정보는 남아 있지 않다 |

JavaScript도 엄밀히는 엔진(V8 등)이 실행 직전에 컴파일한다. 선언보다 먼저 함수를 호출할 수 있는 것(호이스팅)이 한 줄씩 해석만 하는 언어가 아니라는 증거다. TypeScript는 그 앞에 **개발자가 직접 거치는 컴파일 단계**를 하나 더 둔 것이다.

컴파일러는 코드를 토큰으로 자르고 **AST(추상 구문 트리)** 로 바꾼 뒤 그 위에서 타입을 검사한다. Babel·esbuild에는 타입을 따지는 단계(바인더·체커)가 없어 타입을 지우기만 한다. 단계별 구조는 [[typescript-compiler-internals|TypeScript 컴파일러 내부 구조]]에 있다. 같은 AST가 편집기의 **언어 서버**(이름 일괄 바꾸기, 정의로 이동, 자동완성)와 린터·codemod의 바탕이다. 문자열 찾기·바꾸기와 달리 같은 이름의 다른 변수를 구별한다. AST 변환 원리는 [[babel|Babel과 AST 변환]]에 있다.

정적 타입을 얹을 때 얻는 것과 치르는 것은 이렇다.

| 얻는 것 | 치르는 것 |
| --- | --- |
| 오타·`undefined` 접근·잘못된 인자를 실행 전에 잡는다 | 문법과 타입 시스템을 배워야 한다 |
| 타입이 곧 문서다. 함수 시그니처만 보고 쓰는 법을 안다 | 표현하기 어려운 동적 패턴(믹스인, 메타프로그래밍)에 타입을 붙이는 시간이 든다 |
| 이름 바꾸기·구조 변경 같은 리팩터링을 도구가 안전하게 해 준다 | 타입이 통과해도 로직 버그는 남는다. 테스트를 대신하지 않는다 |
| 편집기 자동완성이 정확해진다 | **타입은 실행 중에 사라진다.** API 응답·폼 입력처럼 바깥에서 들어오는 값은 런타임 검증(Zod 같은 스키마)이 따로 필요하다 |

치르는 비용은 대부분 **처음 한 번** 내고 시간이 지나며 나뉜다. 얻는 것은 코드베이스가 커지고 사람이 바뀔수록 커진다. 몇 달 안 본 코드를 고칠 때 타입이 무엇을 하던 코드인지 알려 주고, 새 팀원은 객체가 무엇을 담고 함수가 무엇을 기대하는지 바로 읽는다. 그래서 오래 유지하고 담당자가 바뀌는 프로젝트일수록 타입은 남는 장사다.

`.ts`로 옮기지 않고도 타입 검사를 받을 수 있다. JS 파일 맨 위에 `// @ts-check`를 달고 JSDoc 주석(`/** @param {string} id */`, `@typedef`, `@template`)으로 타입을 적으면 TypeScript가 그대로 검사한다([[js-comments|JavaScript 주석]]). 빌드 단계 없이 타입을 얻는 방법이라, 작은 라이브러리나 점진적 전환에 쓴다.

### 흔한 오해

| 오해 | 실제 |
| --- | --- |
| 새 정적 타입 언어라 배우기 어렵다 | JavaScript에 문법이 조금 더해진 것이다. 필요할 때 필요한 만큼만 배우면 된다 |
| 클래스와 객체지향으로 짜야 한다 | JavaScript답게 함수와 객체로 짜고 **타입 검사 + 자동완성**만 얹는다 |
| 협업엔 좋지만 당장 생산성은 떨어진다 | 자동완성 덕에 오히려 빨라진다. 생산성을 떨어뜨리는 것은 억지로 붙인 타입과 `any` 남발이다 |

## 타입 선언

```ts
let isDone: boolean = false;
let nums: number[] = [1, 2];            // Array<number>와 같다
let tuple: [string, number] = ['a', 1]; // 길이와 위치별 타입이 정해진 배열
let opt: [string, boolean?] = ['a'];    // 선택 요소: ['a'], ['a', true]
let rest: [number, string, ...number[]] = [1, 'a', 2, 3]; // 앞 자리는 고정, 나머지는 개수 제한 없음
let id: string | number;                // 유니언: 둘 중 하나
type Named = { name: string } & { age: number }; // 인터섹션: 둘 다
let dir: 'up' | 'down';                 // 리터럴 타입
let add: (a: number, b: number) => number;
```

| 타입 | 뜻 | 쓰는 곳 |
| --- | --- | --- |
| `any` | 검사를 **끈다**. 무엇이든 되고 무엇이든 할 수 있다 | 마이그레이션 중 임시로만 |
| `unknown` | 무엇이든 될 수 있지만, **좁히기 전에는 아무것도 못 한다** | 외부 입력, `catch (e)` |
| `never` | 값이 절대 없다. 모든 타입의 하위 타입(bottom)이라 어디에나 대입되지만, `never`에는 `never`만 대입된다 | 항상 throw하는 함수, 완전성 검사. 단, 항상 throw하는 **함수 선언**의 반환 타입은 하위 호환 때문에 `void`로 추론되므로 `: never`를 적는다(함수 표현식은 `never`로 추론된다) |
| `void` | 반환값을 쓰지 않는다. 함수 **타입**의 `void`는 값을 반환하는 함수도 받아 준다([[typescript-type-compatibility#void를 반환하는 함수 타입\|타입 호환성]]) | 반환 없는 함수, 반환값을 안 쓰는 콜백 |
| `object` | 원시값이 아닌 것 | 거의 안 쓴다. 모양을 적는 편이 낫다 |
| `enum` | 이름 붙은 상수 집합. 숫자 enum은 0부터(첫 값을 주면 그 값부터) 1씩 자동 증가하고, 문자열 enum은 멤버마다 값을 적어야 한다. **런타임 객체가 생긴다** | 새 코드에서는 리터럴 유니언이나 `as const` 객체를 선호한다 |

`strict` 모드에서는 `null`·`undefined`가 다른 타입에 섞이지 않는다. 필요하면 `string | null`처럼 명시한다.

`readonly`는 `const`와 다르다. `const`는 **변수**를 다시 대입하지 못하게 하고, `readonly`는 **속성**을 이 타입을 통해서는 바꾸지 못하게 한다. 같은 객체를 `readonly`가 없는 타입으로 받은 함수는 그대로 고칠 수 있다(별칭, aliasing). 배열은 `readonly number[]`(= `ReadonlyArray<number>`)로 받으면 `push`·`sort` 같은 변경 메서드가 사라진다. getter만 있는 클래스 속성은 자동으로 `readonly`다.

## 추론, 단언, 가드, satisfies

타입은 되도록 **추론에 맡긴다.** 초기값이 있는 변수, 기본값이 있는 매개변수, 반환값은 대부분 추론된다. 타입이 흐르는 방향은 세 가지다.

| 방향 | 예 | 추론되는 것 |
| --- | --- | --- |
| 오른쪽 → 왼쪽 | `let n = 123`, `const { a } = obj` | 초기값·구조 분해에서 변수 타입 |
| 아래 → 위 | `function add(a: number, b: number) { return a + b }` | `return` 문에서 반환 타입 |
| 왼쪽 → 오른쪽 (문맥 타이핑) | `const f: (a: number) => void = (a) => {}`, `arr.map((x) => …)` | 함수 타입이 정해진 자리에서 콜백 매개변수 타입 |

받을 문맥이 없는 매개변수(`const f = (a, b) => …`)는 추론되지 않아 `any`가 되고, `strict`에서는 오류다. 반환 타입도 타입 없는 JS 함수를 거치면 `any`가 퍼질 수 있어, 공개 함수는 반환 타입을 적어 두는 편이 안전하다. 객체 속성과 `let`의 문자열은 `string`으로 **넓혀** 추론되는데, 이 때문에 나는 오류는 [[typescript-error-messages#리터럴 넓히기|리터럴 넓히기]]에 있다.

| 문법 | 역할 | 안전성 |
| --- | --- | --- |
| `const u: User = {...}` | 선언: 값이 타입에 맞는지 검사하고, 변수 타입을 `User`로 정한다 | 안전 |
| `{...} satisfies User` | 만족: 맞는지 **검사만** 하고, 추론된 구체적인 타입은 유지한다 | 안전 |
| `{...} as User` | 단언: "내가 안다"고 컴파일러를 설득한다. 속성이 빠져도 통과한다 | 위험 |
| `el!` | Non-null 단언: `null`·`undefined`가 아니라고 단언 | 위험 |
| `as const` | 리터럴·`readonly`로 가장 좁게 추론 | 안전 |

단언에도 규칙이 있다. `S as T`는 S와 T 중 한쪽이 다른 쪽의 하위 타입일 때만 허용된다(`Event as MouseEvent`는 되고 `Event as HTMLElement`는 TS2352). 정말 필요하면 `as unknown as T`로 두 번 단언한다. 옛 문법 `<T>x`는 JSX와 겹쳐 쓰지 않는다. 단언은 「캐스팅」이 아니다. 실행 중 값은 아무것도 바뀌지 않는다.

`satisfies`는 변수에 타입 표기를 붙일 수 없는 **객체 안쪽 속성**을 검사할 때, 그리고 검사는 하되 `'red'` 같은 리터럴 타입을 잃고 싶지 않을 때 쓴다.

```ts
const theme = {
  primary: '#3b82f6',
  spacing: 8,
} satisfies Record<string, string | number>;
theme.spacing.toFixed(); // spacing은 여전히 number
```

**타입 가드**는 조건문으로 타입을 좁힌다.

| 가드 | 좁히는 것 | 주의 |
| --- | --- | --- |
| `typeof x === 'string'` | 원시 타입 | `null`과 배열도 `'object'`라 객체 판별에는 약하다 |
| `x instanceof Date` | 클래스 인스턴스 | 프로토타입 체인을 본다 |
| `'swim' in animal` | 속성 유무로 구분되는 객체 유니언 | |
| `Array.isArray(x)` | 배열 | |
| `x.kind === 'circle'` | 구분자가 있는 유니언(아래 「구분된 유니언」) | |
| `function isFish(x): x is Fish` | 사용자 정의 가드(타입 서술어) | **본문이 맞는지 검사하지 않는다.** `typeof value === 'string'`을 반환하면서 `value is number`라고 적어도 통과해 좁히기가 거꾸로 된다 |

`catch (e)`의 `e`는 `unknown`이다. `if (e as Error)`처럼 조건 안에서 단언한 타입은 그 식에서만 유효하므로, `if (e instanceof Error) e.message`로 좁힌다.

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
type UserName = User['name']; // 인덱스 접근 타입: string
```

**인덱스 시그니처**(`[key: string]: T`)는 이름을 미리 모르는 키의 값 타입을 정한다.

- 키 타입은 `string`, `number`, `symbol`, 템플릿 리터럴 패턴(`` [key: `data-${string}`]: string ``)만 된다. 객체를 키로 쓰면 JavaScript가 `toString()`해 `'[object Object]'`가 되므로 TypeScript가 막는다.
- 이름을 적은 다른 속성도 그 값 타입을 따라야 한다. `[key: string]: number | boolean` 아래에 `name: string`을 두면 오류다. `obj[k]`로 읽든 `obj.name`으로 읽든 같은 타입이 나와야 하기 때문이다.
- `string`과 `number` 인덱서를 함께 두면 `number` 쪽 값 타입은 `string` 쪽의 하위 타입이어야 한다(숫자 키도 결국 문자열 키다).
- 시그니처는 없는 키를 읽어도 `T`라고 답한다. `noUncheckedIndexedAccess`를 켜면 `T | undefined`가 된다([[typescript-project-config#엄격도: 편의와 건전성 사이|tsconfig]]).
- 키가 정해진 집합이면 `Record<'a' | 'b', number>`나 매핑 타입이 낫다. 오타가 잉여 속성 오류로 잡힌다.
- 이름 있는 속성과 임의 키를 한 객체에 섞지 않는다. `{ color?: string; [selector: string]: … }`에서는 `colour` 오타가 「그냥 선택자」로 통과한다. 임의 키는 `nest: { [selector: string]: … }`처럼 속성 하나 아래로 옮긴다.

`keyof`·인덱스 접근·매핑 타입으로 타입에서 타입을 만드는 법은 [[typescript-type-operators|TypeScript 타입 연산]]에, `extends`와 `&`가 같은 속성의 충돌을 다르게 다루는 점은 [[typescript-type-compatibility|타입 호환성]]에 있다.

## 제네릭

타입을 **매개변수로 받아** 호출하는 쪽이 정하게 한다.

```ts
function first<T>(arr: T[]): T | undefined { return arr[0]; }
function len<T extends { length: number }>(x: T) { return x.length; } // 제약 조건
function list<const T extends readonly string[]>(items: T) { return items; }
list(['Apple', 'Banana']); // readonly ['Apple', 'Banana']: 호출 쪽에서 as const를 안 써도 된다

type ElementOf<T> = T extends (infer U)[] ? U : never; // 조건부 타입 + infer
```

**제네릭의 흔한 함정**

| 함정 | 이유와 처리 |
| --- | --- |
| 제약 없는 `T`의 속성(`arg.length`)을 읽는다 | `T`는 무엇이든 될 수 있다. `T extends { length: number }`로 제약한다 |
| `<T extends string>(arg: T): T[]`에서 `['1', '2']`를 반환한다 | `f('hello')`의 `T`는 리터럴 `'hello'`로 추론된다. `string[]`은 `'hello'[]`가 아니다. 반환 타입을 `string[]`으로 적는다 |
| `<T extends V>(): T`에서 `{ value: 'x' }`를 반환한다 | 제약은 하한이 아니다. 호출자가 속성이 더 많은 `T`를 고를 수 있다 |
| 타입 매개변수가 한 번만 쓰인다 | 입력과 출력을 잇지 않는 제네릭은 의미가 없다. `getName<T>(n: T): T`보다 `(n: string): string` |
| `.tsx`에서 `const f = <T>(x: T) => x` | JSX 태그로 읽힌다. `<T,>`로 쓰거나 `function` 선언을 쓴다 |

조건부 타입·템플릿 리터럴 타입·재귀를 조합한 실전 예는 [[typescript-advanced-types|TypeScript로 동적인 코드에 정적 타입 입히기]]에 있다.

## 함수와 클래스

- **명시적 this**: 첫 매개변수 자리에 `this: Window`처럼 쓰면 `this`의 타입을 정한다. 컴파일 결과에서는 사라진다.
- **오버로드**: 시그니처를 여러 개 선언하고 구현은 하나만 둔다. 구현 시그니처는 밖에서 보이지 않으므로 모든 오버로드를 받을 만큼 넓게 적는다. 호출 시 **위에서부터 처음 맞는 시그니처**를 고르므로 좁은 시그니처를 먼저 둔다. `add(x: number, y: number): number`와 `add(x: string, y: string): string`을 두면 `add(1, '2')`는 오류가 된다. 유니언 매개변수로 충분하면 오버로드보다 유니언이 낫다.
- **선택적 매개변수** `b?: number`는 필수 매개변수 뒤에만 둔다.
- **호출 가능 타입**: 화살표 표기 `(x: number) => string` 대신 객체 표기로 쓰면 시그니처를 여러 개 둘 수 있다. `{ (x: string): string; (x: number): number }`는 오버로드된 함수, `{ new (): Foo }`는 `new`로 부르는 생성자, 시그니처와 속성을 섞은 `{ (): void; version: string }`은 속성이 달린 함수다.

| 클래스 수식어 | 접근 |
| --- | --- |
| `public`(기본) | 어디서나 |
| `protected` | 자신과 하위 클래스 |
| `private` | 자신만. **타입 검사에서만** 막는다. 런타임까지 숨기려면 JS의 `#field` |
| `readonly` | 초기화 후 변경 불가 |
| `abstract` | 추상 클래스·메서드. 하위 클래스가 구현해야 한다(→ [[abstract-class-vs-interface\|추상 클래스와 인터페이스]]) |

생성자 매개변수에 수식어를 붙이면(`constructor(private name: string)`) 속성 선언과 할당이 한 번에 된다. 단, 이것도 런타임 코드가 생기는 문법이라 Node.js 타입 제거로는 실행되지 않는다.

## 모듈과 타입 선언

- `export type { User }`, `import type { User }`로 **타입만** 주고받으면 컴파일 결과에서 import가 지워진다.
- JS로 쓰인 라이브러리는 `.d.ts` 선언 파일이 있어야 타입이 붙는다. 패키지에 없으면 커뮤니티 저장소 **DefinitelyTyped**의 `@types/패키지명`을 설치한다(`npm i -D @types/lodash`). 없으면 직접 `declare module 'x'`를 쓴다.
- `tsconfig.json`의 모듈 해석(`bundler`·`nodenext`), `verbatimModuleSyntax`, 선언 공간, `declare global`과 `lib`·`types` 옵션은 [[typescript-project-config|TypeScript 프로젝트 설정]]에 있다.

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

## 익히는 순서

1. **세팅된 프로젝트로 시작한다.** `tsconfig.json` 옵션을 처음부터 다 이해하려 하지 말고 `npm create vite@latest`의 TypeScript 템플릿처럼 설정된 환경에서 시작한다. 라이브러리라면 tsdown 같은 번들 도구의 기본값을 쓴다. 빨간 줄이 너무 많으면 `any`로 덮지 말고 차라리 `strict`를 잠시 끈다.
2. **변수와 함수 인자부터.** 기본 타입과 배열을 붙이고, 구조 분해한 인자에 타입 주는 법을 익힌다.
3. **쓰기보다 추론에 맡긴다.** `let n: number = 10`은 중복이다. 추론되는 곳에 또 쓰면 바꿀 때 두 군데를 고쳐야 한다.
4. **백엔드 스키마를 `interface`로.** `Promise<User>`를 반환하게 하면 API 응답 필드가 자동완성되고, 제네릭과 유틸리티 타입을 자연스럽게 만난다. 길어지는 콜백 타입은 `type`으로 빼서 이름을 붙인다.
5. **유니언과 좁히기.** `User | null`을 조건문으로 좁히는 것이 중급의 관문이다. 핸드북의 Narrowing·Utility Types는 정독하지 말고 필요할 때 찾는다.
6. **`strict: true`로 에러 0.** `as`·`any`·복잡한 타입 곡예가 생겼다면, 원래 쓰려던 JavaScript에 **최소한으로만 덧붙인 타입**인지 되묻는다.


| 더 읽을거리 | 쓰는 때 |
| --- | --- |
| [TypeScript Handbook](https://www.typescriptlang.org/ko/docs/handbook/intro.html) | 공식 문서. 막히는 개념을 찾아 읽는다 |
| [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) | 컴파일러 옵션, 타입 시스템의 세부 동작, 흔한 함정 |
| [자바스크립트 개발자를 위한 타입스크립트](https://ahnheejong.gitbook.io/ts-for-jsdev/) | JavaScript를 아는 상태에서 한국어로 처음부터 읽는 입문서 |

## 정리

- TypeScript는 JavaScript의 슈퍼셋이고, 본질은 **타입 검사와 자동완성을 더해 주는 도구**다. 빌드할 때 타입은 지워진다.
- 타입은 추론에 맡기고, 경계(함수 인자, API 응답, 공개 인터페이스)에만 적는다.
- `any`보다 `unknown`, `as`보다 선언이나 `satisfies`를 쓴다.
- 유니언은 구분자로 좁히고 `never`로 완전성을 검사한다.
- `enum`, 생성자 매개변수 속성처럼 런타임 코드가 생기는 문법은 타입 제거 환경에서 동작하지 않는다.

**TypeScript의 문법은 결국 "값의 모양을 적고, 좁히고, 변형하는" 세 가지 일이다.**

관련 노트: [[typescript-type-compatibility|TypeScript 타입 호환성]], [[typescript-type-operators|TypeScript 타입 연산]], [[typescript-project-config|TypeScript 프로젝트 설정]], [[typescript-compiler-internals|TypeScript 컴파일러 내부 구조]], [[typescript-error-messages|TypeScript 오류 메시지 읽기와 흔한 오류]], [[typescript-practical-patterns|TypeScript 실용 패턴]], [[typescript-advanced-types|TypeScript로 동적인 코드에 정적 타입 입히기]], [[typescript-coding-convention|TypeScript 코딩 컨벤션]], [[abstract-class-vs-interface|추상 클래스와 인터페이스]], [[class|class 문법]], [[static-analysis|정적 분석: 실행하지 않고 검사하기]], [[bundlers-and-vite|번들러의 역사와 Vite]], [[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]]
