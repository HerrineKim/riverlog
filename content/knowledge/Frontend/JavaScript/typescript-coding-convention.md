---
title: "TypeScript 코딩 컨벤션"
concept: "TS Convention"
summary: "TypeScript 팀 컨벤션 문서의 규칙을 주제별로 묶었다. 이름 짓기, 타입, 선언, 클래스, 표현식, 제어문, 함수, 에러 처리, 내장 객체, 모듈 규칙을 필수·권장과 이유까지 함께 정리하고, 중괄호·줄 길이·빈 줄·중첩 줄이기·헬퍼 함수 위치 같은 코드 모양과 유지보수를 괴롭히는 패턴(닌자 코드) 목록을 더했다. Airbnb JavaScript 스타일 가이드의 객체·함수·형 변환 규칙과, 공개 스타일 가이드끼리 갈리는 지점(export default, for...of, ++, getter, 약어 표기)도 비교했다."
tags: ["typescript", "javascript", "frontend", "collaboration"]
source: other
date: "2026-10-30"
sources: ["https://ko.javascript.info/coding-style", "https://ko.javascript.info/ninja-code", "https://github.com/wisedog/typescript-coding-guide", "https://typescript-eslint.io/getting-started/typed-linting", "https://basarat.gitbook.io/typescript/styleguide", "https://github.com/airbnb/javascript", "https://google.github.io/styleguide/jsguide.html"]
---

> 한국어로 쓰인 TypeScript 코딩 컨벤션 문서(예: 「[TypeScript 코딩 가이드 (규칙 80개)](https://github.com/wisedog/typescript-coding-guide)」)를 바탕으로 재구성하고, 코드 모양과 읽기 어려운 코드 패턴은 javascript.info(모던 JavaScript 튜토리얼)의 「코딩 스타일」, 「닌자 코드」 글로 보강한 노트다. 접두사 없는 인터페이스 이름, `null`·`undefined` 관례, 배열 표기, 따옴표는 basarat의 「[TypeScript Deep Dive](https://basarat.gitbook.io/typescript)」의 StyleGuide로, 객체·함수·형 변환 규칙과 가이드 비교는 「[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)」로 보강했다.

## 코딩 컨벤션이란

코딩 컨벤션(coding convention)은 팀이 합의한 코드 작성 규칙이다. 컨벤션의 목적은 **읽는 사람이 의도를 오해하지 않게 하는 것**이다. 규칙마다 등급을 붙이면 리뷰에서 무엇을 막고 무엇을 넘길지 분명해진다.

| 등급 | 뜻 |
| --- | --- |
| 필수 | 어기면 버그나 혼란으로 이어진다. 리뷰에서 막는다 |
| 권장 | 대부분 지키되 합의된 예외를 둔다 |
| 참고 | 알고 있으면 좋은 성능·설계 지식이다 |

## 1. 이름 짓기

| 대상 | 규칙 |
| --- | --- |
| 클래스, 인터페이스, type, enum, 데코레이터 | PascalCase |
| 변수, 매개변수, 함수, 메서드, 속성 | camelCase |
| 글로벌 상수, 클래스 내부 불변값 | `UPPER_SNAKE_CASE` (`ONE_HOUR_IN_MS`) |
| 타입 매개변수 | 대문자 한 글자(`T`, `U`) 또는 PascalCase |
| enum 멤버, `as const` 상수 객체의 키 | PascalCase (`Color.Red`, `SyntaxKind.StringLiteral`) |
| 파일 | camelCase(`utils.ts`) 또는 kebab-case 중 팀이 하나로. 컴포넌트를 내보내는 파일은 프레임워크 관례대로 PascalCase(`Accordion.tsx`) |
| 사용하지 않는 변수·매개변수 | 앞에 `_`를 붙인다. 그 외에는 앞뒤 `_`를 쓰지 않는다 |

- **인터페이스에 `I` 접두사를 붙이지 않는다**(권장). `IUser`가 아니라 `User`다. 표준 라이브러리도 `Window`, `Document`처럼 접두사 없이 쓴다. 타입과 인터페이스를 이름으로 구별할 이유가 없다.
- 식별자는 영문, 숫자, `_`만 쓰는 것이 원칙이다(권장). JS는 유니코드 식별자를 허용해서 `const 인사말 = '안녕'`도 동작한다. 다만 `미징수_보수_세금액`처럼 영어로 옮기면 오히려 읽기 어려운 도메인 용어라면 **한글 식별자도 팀 합의로 허용할 수 있다**.
- `$` 접두사(jQuery)와 `$` 접미사(Observable)는 팀이 합의하면 허용한다.
- 대문자 상수는 언어가 불변을 보장해서가 아니라 **"고치지 말라"는 신호**다. 객체 상수는 속성을 바꿀 수 있다.
- **`this`를 변수에 담지 않는다**(권장). `const self = this`, `that = this` 대신 화살표 함수나 `bind`로 `this`를 이어받는다.
- 이름에 의미를 담는다. `whId`, `nErr`, `pcCounter` 같은 사내·모호한 약어 대신 `warehouseId`, `errorCount`를 쓴다. `IP`처럼 누구나 아는 약어는 괜찮다. `n`, `i`는 10~15줄 정도의 좁은 범위에서만 허용한다.

## 2. 타입

### 원시 타입과 Object

- **래퍼 객체(`new String()`, `Number`, `Boolean`)를 쓰지 않는다**(필수). `typeof`가 `"object"`가 되고, `'hello' === new String('hello')`는 `false`다. `string` 매개변수에 `String`을 넘기면 컴파일 에러도 난다. 원시값도 메서드를 바로 호출할 수 있으니 래퍼가 필요 없다.
- **`Object` 타입과 `new Object()`를 쓰지 않는다**(필수). `Object`에는 문자열·숫자·함수까지 다 들어가서 사실상 `any`다. 객체만 받으려면 소문자 `object`를 쓰고, 빈 객체는 `{}`로 만든다.

### null과 undefined

| | `undefined` | `null` |
| --- | --- | --- |
| 의미 | 아직 값이 할당되지 않음 | 값이 없음을 명시 |
| 할당 주체 | JS 엔진 | 개발자 |
| `typeof` | `"undefined"` | `"object"` |

- 「없음」의 기본값은 `undefined`로 하고, `null`은 API나 관례가 요구할 때(JSON 값, DOM의 `getElementById`, Node.js 콜백의 `cb(null, data)`) 쓴다(권장). 아예 둘 다 피하고 `{ valid: boolean; value?: T }`처럼 상태를 담은 객체를 돌려주는 방법도 있다.
- 둘을 한 번에 거를 때는 `x == null`(또는 `x != null`)을 쓴다. `0`·`''`·`false`까지 걸러지는 `if (!x)`와 다르다. 객체라면 truthy 검사(`if (error)`)로 충분하다.
- 둘을 **구분해서 쓴다**(필수). 둘 다 falsy라 `if`로는 같아 보이지만, ORM 같은 라이브러리는 `undefined` 필드는 건너뛰고 `null` 필드는 컬럼을 `NULL`로 덮어쓴다.
- **타입 별칭에 `null`·`undefined`를 넣지 않는다**(필수). `type OS = 'Windows' | 'MacOS' | undefined`는 앱 전체에 "없을 수도 있음"을 퍼뜨린다. 필요한 곳에서 `name?: OS`처럼 국소적으로 붙인다.
- `| undefined` 대신 선택적 표시 `?`를 쓴다(필수).

- 배열 타입은 `Foo[]`로 쓴다(권장). `Array<Foo>`보다 짧고 `[]`가 눈에 바로 들어온다. 요소 타입이 복잡할 때만 `Array<{ id: string } | null>`처럼 쓴다(typescript-eslint `array-type`).

### any와 unknown

- **`any`를 쓰지 않는다**(필수). `any`는 검사를 끄는 것에 그치지 않고 **퍼진다.** `any`와 `number`를 더한 결과도 `any`가 되어, 그 값을 쓰는 코드 전체가 검사에서 빠진다. `any`는 JS에서 옮겨 오는 동안 쓰는 임시 장치다.
- 꼭 써야 하면 **린트 경고를 그 줄에서만 끄고 이유를 적는다**(필수). ESLint 주석은 `--` 뒤에 설명을 붙일 수 있다.

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 외부 SDK 타입이 잘못돼 있어 임시로 우회
let payload: any;
```

- **타입을 모르는 값은 `unknown`으로 받는다**(필수). API 응답, `JSON.parse` 결과처럼 모양을 확신할 수 없는 값은 `unknown`으로 두고 `typeof`·스키마 검증으로 좁힌 뒤 쓴다.
- 모양을 조금이라도 알면 전체 집합보다 좁힌다(권장). 배열인 것만 알면 `unknown[]`, 문자열 키 객체면 `Record<string, unknown>`이다. 자동완성과 최소한의 검사가 살아난다.

### type과 interface, class

- **객체 모양은 `interface`를 먼저 고려한다**(권장). `interface C extends A, B`는 같은 속성의 타입이 부딪히면 선언 자리에서 오류를 내지만, `type C = A & B`는 조용히 그 속성을 `never`로 만든다([[typescript-type-compatibility#interface extends와 &의 차이|타입 호환성]]). 컴파일러는 인터페이스 사이의 관계를 캐시하지만 인터섹션은 쓸 때마다 다시 계산하므로, 큰 코드베이스에서는 검사 속도에도 차이가 난다. 유니언·튜플·원시값·매핑 타입처럼 인터페이스로 못 쓰는 것은 `type`으로 쓴다. 예전에는 `type`이 `.d.ts`를 크게 부풀리는 문제도 있었지만 4.2에서 고쳐졌다.
- **모양만 필요하면 `class` 대신 `interface`·`type`**(권장). 클래스는 컴파일 결과에 코드로 남는다. `instanceof`, 데코레이터, 런타임 리플렉션이 필요할 때만 클래스를 쓴다.

### 추론에 맡길 것과 적을 것

- **초기값만 봐도 타입이 분명하면 적지 않는다**(권장). `const x: number = 42`, `const m: Map<string, number> = new Map()`은 중복이다. `const m = new Map<string, number>()`처럼 타입 인자를 생성 쪽에 둔다.
- **초기값에서 타입이 바로 보이지 않으면 적는다**(권장). `const sections: string[] = getDocuments().toSection().translate()`처럼 메서드 사슬을 다 따라가야 알 수 있는 경우다.
- 함수 반환 타입은 적는다(아래 「7. 함수」).

## 3. 선언

- **`var` 대신 `const`·`let`**(필수, ESLint `no-var`). `var`는 함수 범위라 블록 안에서 같은 이름을 다시 선언해도 조용히 덮어쓴다.
- **다시 대입하지 않는 변수는 `const`**(필수, ESLint `prefer-const`). 그러면 `let`이 「이 값은 바뀐다」는 신호가 된다.
- **대입을 사슬로 잇지 않는다**(필수, ESLint `no-multi-assign`). `let a = b = c = 1`에서 `let`은 `a`에만 붙고 `b`, `c`는 암묵적 전역 변수가 된다(엄격 모드에서는 `ReferenceError`).
- **선언하고 쓰지 않는 변수를 남기지 않는다**(필수, ESLint `no-unused-vars`). 리팩터링하다 남은 흔적이라 읽는 사람이 쓰임새를 찾아 헤맨다.
- **한 줄에 변수 하나**만 선언한다. `let x: number = 1, name = 'triangle'`은 타입 표기가 첫 변수에만 붙는다. 변수마다 주석을 달기도 어렵고, IDE 툴팁도 첫 변수에만 뜬다.

## 4. 클래스

| 규칙 | 등급 | 이유 |
| --- | --- | --- |
| 생성자 밖에서 바꾸지 않는 멤버는 `readonly` | 필수 | 재할당을 컴파일 단계에서 막는다. 객체 내부까지 불변은 아니다 |
| `public` 표기는 프로젝트 안에서 일관되게 | 권장 | 기본값이 public이라 붙이거나 안 붙이거나 둘 중 하나로 통일한다 |
| `toString()`은 되도록 재정의하지 않는다 | 필수 | 항상 성공해야 하고 부수 효과가 없어야 한다. JSON 모양을 바꾸려면 `toJSON()`을 재정의한다 |
| 빈 생성자, `super`만 호출하는 생성자는 생략 | 권장 | ES2015 기본 생성자가 같은 일을 한다 |
| `#` private 필드는 꼭 필요할 때만 | 권장 | `Object.keys`·`JSON.stringify`에 안 보여 디버깅이 어렵다. 컴파일 대상이 ES2022 미만이면 WeakMap 코드로 변환돼 무겁다. 타입 수준 은닉이면 충분할 때는 `private` 키워드를 쓴다 |
| 생성자 매개변수 프로퍼티 활용 | 권장 | `constructor(private readonly svc: Svc) {}`로 선언과 초기화를 한 번에 한다. 생성자 로직이 복잡하거나 기본값이 필요하면 예외다 |

## 5. 표현식

- **삼항 연산자는 한 단계까지만** 쓴다(권장, ESLint `no-nested-ternary`). 중첩되면 `if...else`로 푼다. `x ? true : false`, `a ? a : b`처럼 필요 없는 삼항은 `!!x`, `a || b`(또는 `a ?? b`)로 줄인다(`no-unneeded-ternary`).
- **연산자를 섞을 때는 괄호로 묶는다**(권장, ESLint `no-mixed-operators`). `a && b || c`, `a ** b - 5 % d`는 우선순위를 외워야 읽힌다. `+`·`-`·`*`·`/`처럼 산술 우선순위가 익숙한 조합은 예외다.
- **불리언은 줄여 쓰고, 문자열·숫자는 명시적으로 비교한다**(권장). `if (isValid === true)` 대신 `if (isValid)`지만, `if (name)`과 `if (collection.length)` 대신 `if (name !== '')`, `if (collection.length > 0)`로 쓴다. 빈 문자열과 `0`이 조건을 바꾸는 순간이 코드에 드러난다.
- **부동소수점을 `===`로 비교하지 않는다**(필수). `0.1 + 0.2 !== 0.3`이다. 차이가 허용 오차보다 작은지 비교한다. `Number.EPSILON`은 1 근처에서의 오차라서 큰 값을 비교할 때는 허용 오차도 그 크기에 맞춰 키운다.

```ts
const equal = (x: number, y: number, tolerance = Number.EPSILON) =>
  Math.abs(x - y) < tolerance;

equal(1000.1 + 1000.2, 2000.3, 2000 * Number.EPSILON); // true
```

- **단항 `+`로 숫자를 변환할 때 조심한다**(권장). `'123f'` 같은 입력은 조용히 `NaN`이 된다(아래 「형 변환」).
- 객체를 만들 때는 일관되게 `new`를 붙인다.
- **`==` 대신 `===`**(필수, ESLint `eqeqeq`). `==`는 형 변환 규칙을 외워야 읽힌다. 예외로 `x == null`은 `null`과 `undefined`를 한 번에 거르는 관용구라 허용하는 팀이 많다(`eqeqeq`의 `{ null: 'ignore' }`).
- **스프레드 피연산자는 순회 가능한 값**이어야 한다(필수). 배열 스프레드에 `false`·`null`·`undefined`가 오면 런타임 에러가 난다. 객체 스프레드는 이런 값을 그냥 무시한다. `?? []`로 기본값을 준다.
- **스프레드는 먼저 쓰고 덮어쓸 속성은 뒤에** 쓴다(필수). `{ a: 5, ...x }`는 `x.a`가 5를 덮어쓴다. `{ ...x, a: 5 }`가 의도에 맞다.
- **같은 종류끼리 펼친다**(필수). 객체 리터럴에 배열을 펼치면 `{ ...['a', 'b'] }`가 `{ 0: 'a', 1: 'b' }`가 된다. 배열은 배열에, 객체는 객체에 펼친다.
- **스프레드는 얕은 복사다**(필수). `[...matrix]`는 바깥 배열만 새로 만들고 안쪽 배열은 원본과 공유한다. 중첩된 값을 복사하려면 `structuredClone()`을 쓴다(권장). `JSON.parse(JSON.stringify(x))`는 결과가 `any`가 되고 `Date`·`Map`이 깨진다. `structuredClone`은 타입을 유지하고 `Date`·`Map`·`Set`도 복사하지만, 함수가 들어 있으면 `DataCloneError`를 던진다.
- **인스턴스를 만든 뒤 속성을 추가·삭제하지 않는다**(참고). V8은 같은 모양의 객체끼리 히든 클래스(Hidden Class)를 공유해 속성 위치를 빨리 찾는다. 나중에 속성을 붙이면 히든 클래스가 새로 생기고 JIT 최적화가 깨진다. 빈 객체를 해시맵처럼 쓰며 키를 계속 붙이는 경우가 대표적이다.

### 객체 리터럴

| 규칙 | 등급 | 예 |
| --- | --- | --- |
| 메서드·속성 축약형을 쓰고, 축약 속성은 객체 앞쪽에 모은다 | 권장 (`object-shorthand`) | `{ name, age, greet() {} }` |
| 키에 따옴표는 식별자로 쓸 수 없는 키에만 | 권장 (`quote-props`) | `{ foo: 1, 'data-blah': 2 }` |
| 동적 키는 만들 때 계산된 속성 이름으로 한 번에 | 권장 | `{ id, [getKey('enabled')]: true }` |
| `hasOwnProperty` 같은 `Object.prototype` 메서드를 객체에서 직접 부르지 않는다 | 필수 (`no-prototype-builtins`) | `obj.hasOwnProperty(k)` 대신 `Object.hasOwn(obj, k)`. `Object.create(null)`로 만든 객체나 같은 이름의 속성을 가진 객체에서 깨진다 |
| 얕은 복사는 `Object.assign` 대신 객체 스프레드, 속성 빼기는 나머지 문법 | 권장 (`prefer-object-spread`) | `const { a, ...rest } = copy`. `Object.assign(original, { c: 3 })`는 원본을 바꾼다 |
| 거듭제곱은 `Math.pow` 대신 `**` | 권장 (`prefer-exponentiation-operator`) | `2 ** 10` |
| 속성은 점 표기, 변수로 접근할 때만 대괄호 | 권장 (`dot-notation`) | `luke.jedi`, `luke[prop]` |

### 형 변환

형 변환은 **문장 첫머리에서 이름 있는 함수로** 한다. 뜻이 바로 보이고, `+`·`''`를 이용한 암묵 변환이 섞이지 않는다.

| 대상 | 쓸 것 | 피할 것 |
| --- | --- | --- |
| 문자열 | `String(x)` | `x + ''` (`valueOf`를 먼저 부른다), `x.toString()` (`null`·`undefined`에서 에러), `new String(x)` |
| 숫자 | `Number(x)`, 문자열 파싱은 `Number.parseInt(x, 10)` | 단항 `+x`, 진법 없는 `parseInt(x)`(ESLint `radix`), `new Number(x)` |
| 불리언 | `Boolean(x)` 또는 `!!x` | `new Boolean(x)` |

비트 연산(`x >> 0`)은 32비트 정수로 잘려서 `2147483648 >> 0`이 `-2147483648`이 된다. 성능 때문에 쓴다면 이유를 주석으로 남긴다.

## 6. 제어문

### 블록과 switch

- 반복문과 조건문 본문에는 중괄호를 쓴다. 한 줄짜리 `if`만 경우에 따라 허용한다.
- **`let`·`const`·`function`·`class`를 선언하는 `case`는 중괄호로 감싼다**(필수, ESLint `no-case-declarations`). 선언은 `switch` 블록 전체에 보이지만 초기화는 그 `case`에 들어왔을 때만 되어, 다른 `case`에서 접근하면 TDZ 에러가 난다.
- **`switch`에는 `default`를 반드시 쓴다**(필수, ESLint `default-case`). 예상 못한 값을 잡는다. 할 일이 없어도 `default: // pass`를 써 두면 누락이 아니라 의도임이 드러난다.
- **내용이 있는 `case`는 `break`·`return`·`throw`로 끝낸다**(권장, ESLint `no-fallthrough`, tsconfig `noFallthroughCasesInSwitch`). 비어 있는 `case`를 여러 개 겹쳐 같은 처리로 흘려보내는 것은 괜찮다.
- `case`가 두세 개뿐이면 `if...else`를 고려하고, 반대로 `else if`가 세 개 이상 이어지면 `switch`를 고려한다.
- `switch (true)` 패턴(참고)은 `case`에 조건식을 나열해 유효성 검사를 이어 쓰는 방식이다. 대부분 `if`로 충분하다. 다만 `||`로 묶인 긴 조건을 여러 `case`로 펼칠 때는 확실히 읽기 쉽다. 팀에서 정한다.

### 순회

| 상황 | 쓰지 말 것 | 쓸 것 |
| --- | --- | --- |
| 객체 키 순회 | 필터 없는 `for...in` (상속 속성까지 돈다) | `Object.hasOwn` 검사, 또는 `Object.keys`·`Object.entries` + `for...of` |
| 배열 순회 | `for...in` (키가 문자열이고 상속 속성까지 돈다) | `for...of`, `forEach` |
| 숫자 카운터 | 소수 증감 `i += 0.1` | 정수로 세고 필요할 때 나눈다 |
| 카운터 조작 | 본문에서 `i -= 1`처럼 카운터를 바꾼다 (무한 루프, 횟수 예측 불가) | 카운터는 `for` 머리에서만 바꾼다. 건너뛰기는 `continue` |

### 조건식

- **`if` 블록이 `return`으로 끝나면 `else`를 쓰지 않는다**(권장, ESLint `no-else-return`). 이어지는 코드가 곧 `else`다. 「중첩을 줄인다」의 이른 반환과 같은 원칙이다.
- **`&&`·`||`를 `if` 대신 쓰지 않는다**(권장, ESLint `no-unused-expressions`). `!isRunning && startRunning()`은 식이 아니라 문으로 쓴 것이라 의도가 흐려진다. `if (!isRunning) startRunning()`으로 쓴다.
- 조건이 세 개 이상 엮이면 `isYoungGiants(age, weight, height)`처럼 이름 있는 함수로 뽑는다.
- **부정 연산자와 부정형 이름을 줄인다**(권장). `!user.notAuthorized || !user.isNotAdmin`은 이중 부정이다. `user.authorized || user.isAdmin`이 바로 읽힌다.

## 7. 함수

- **매개변수가 3개 이상이면 객체 하나로 받는다**(권장). 인터페이스로 묶으면 순서 실수가 없고, 선택 인자와 확장도 쉽다. 위치 인자가 10개를 넘는 SDK 함수에서는 순서 실수가 그대로 버그가 된다. 2개 이하라면 타입 정의가 오히려 비용이다.

```ts
interface UserParams {
  id: number;
  name: string;
  age: number;
}

function createUser({ id, name, age }: Readonly<UserParams>) {
  return { id, name, age };
}
```

- **매개변수를 고치거나 다시 대입하지 않는다**(필수, ESLint `no-param-reassign`). 객체 인자를 고치면 호출한 쪽 원본까지 바뀌고, 다시 대입하면 `arguments`와 엔진 최적화가 어긋난다. 타입으로는 객체 매개변수를 `Readonly<T>`로 받아 막는다(권장).
- **`arguments` 대신 나머지 매개변수 `...args`**(필수, ESLint `prefer-rest-params`). `arguments`는 배열이 아니라 유사 배열이고 화살표 함수에는 없다. 가변 인자 호출도 `fn.apply(null, args)` 대신 `fn(...args)`다(`prefer-spread`).
- **기본값은 기본 매개변수 문법으로, 맨 뒤에 둔다**(권장, ESLint `default-param-last`). `opts = opts || {}`는 `0`·`''`를 걸러 버린다. 기본값 식에 `b = a++` 같은 부수 효과를 넣지 않는다.
- **콜백처럼 이름 없는 함수가 필요하면 화살표 함수**(권장, ESLint `prefer-arrow-callback`). 바깥 `this`를 그대로 쓴다. 본문이 식 하나면 중괄호와 `return`을 생략하고, 매개변수에는 늘 괄호를 친다(`arrow-parens`).
- **`if`·`while` 블록 안에서 함수를 선언하지 않는다**(필수, ESLint `no-inner-declarations`). 필요하면 `const fn = () => {}`처럼 변수에 담는다.
- 반환 타입을 명시한다. 의도가 드러나고, 구현이 바뀌어 반환 타입이 어긋나면 컴파일러가 바로 알려 준다. 복잡한 함수에서는 추론이 빗나가는 것도 막는다.

## 8. 에러 처리

- **`catch`를 비워 두지 않는다**(권장). 정말 무시해도 되면 왜 무시하는지 주석을 단다.
- **`throw`와 `reject`에는 `Error`(또는 하위 클래스)만** 넘긴다(필수). 문자열이나 숫자는 스택 추적이 없다.
- **`catch (err: unknown)`으로 받는다**(권장). JS는 아무 값이나 던질 수 있으니 `instanceof Error`로 좁힌 뒤 쓴다. `strict`이면 `useUnknownInCatchVariables`가 켜져 기본이 `unknown`이다.

```ts
try {
  callSomeFunc();
} catch (err: unknown) {
  if (err instanceof Error) console.error(err.message);
  else console.error('Unknown Error', err);
}
```

## 9. 표준 내장 객체

### 배열 메서드

| 규칙 | 등급 |
| --- | --- |
| `map` 콜백은 요소 변환만 한다. 바깥 변수 누적은 `reduce`로 따로 한다 | 필수 |
| `map`의 반환값을 버릴 거면 `forEach`나 `for...of`를 쓴다 | 필수 |
| 배열 메서드 콜백(`map`·`filter`·`reduce` 등)은 값을 반환한다. 본문이 식 하나면 생략해도 된다 | 필수 (`array-callback-return`) |
| 이터러블은 스프레드(`[...set]`)로, 유사 배열은 `Array.from(arrayLike)`로 배열로 바꾼다. 바꾸면서 매핑하면 중간 배열이 없는 `Array.from(x, fn)` | 권장 |
| `Array` 생성자를 쓰지 않는다. `new Array(2)`는 빈 칸 2개, `new Array(2, 3)`은 `[2, 3]`이다 | 필수 |
| `forEach` 콜백에서 값을 반환하지 않는다. 결과가 버려지고 반복을 멈추지도 않는다 | 필수 |
| `forEach`에 `async` 콜백을 넣지 않는다. Promise를 기다리지 않는다 | 필수 |
| 순회 메서드 콜백 안에서 대상 배열을 추가·삭제하지 않는다 | 필수 |
| `reverse`·`sort`·`splice` 대신 `toReversed`·`toSorted`·`toSpliced` | 권장 |

순회 메서드는 시작할 때 `length`를 읽어 두고 그 범위만 돈다. 그래서 콜백에서 `splice`로 요소를 넣으면 뒤쪽 요소를 건너뛰고, 빼면 일찍 끝난다. 결과를 예측하기 어렵다.

### 그 밖의 내장 객체

- 전역 `parseInt`·`parseFloat`·`isNaN`·`isFinite`·`Infinity` 대신 `Number.parseInt`, `Number.isNaN`, `Number.POSITIVE_INFINITY` 등 `Number`의 것을 쓴다(필수).
- `trimLeft`·`trimRight` 대신 `trimStart`·`trimEnd`를 쓴다(필수). 오른쪽에서 왼쪽으로 쓰는 언어에서도 뜻이 맞고 `padStart`·`padEnd`와 이름이 맞는다.
- 해시맵이 필요하면 객체 대신 `Record`나 `Map`을 쓴다(권장). 객체는 크기를 알려면 `Object.keys().length`가 필요하고, 키로 문자열과 Symbol만 쓸 수 있다.
- 현재 시각의 Unix 밀리초는 `new Date().getTime()` 대신 `Date.now()`로 구한다(권장). 객체를 만들 필요가 없다.
- **`eval()`과 `new Function(문자열)`을 쓰지 않는다**(필수, ESLint `no-eval`). 외부 문자열이 섞이면 코드 주입이 되고, 엔진 최적화와 정적 분석이 모두 막히며, 엄격한 CSP 아래에서는 실행조차 안 된다.
- `with` 같은 폐기된 기능과 아직 표준이 아닌 제안 기능은 쓰지 않는다(필수).

## 10. 주석과 모듈

- 한 줄 주석은 `//`, 여러 줄은 `/* */`로 쓴다(필수). 두세 줄까지는 `//`를 이어 써도 팀이 합의하면 된다.
- JSDoc(TSDoc) 태그를 활용한다: `@param`, `@return`, `@remarks`, `@example`, `@deprecated`, `@throws`, `@see`.
- **TypeScript 문법이 이미 표현하는 태그는 쓰지 않는다**(권장). `.ts` 파일에서 `@type`, `@typedef`, `@enum`, `@implements`, `@private`·`@protected`·`@public`은 타입 표기·키워드와 겹친다. 이 태그들은 `// @ts-check`를 단 JS 파일에서 타입을 적을 때 쓴다([[js-comments|JavaScript 주석]]).
- **문서 주석은 데코레이터 위에** 단다(권장). `@Injectable()`과 `class` 사이에 끼우면 도구가 주석을 클래스에 연결하지 못한다.
- **JSDoc 본문은 마크다운으로 렌더링된다**(참고). 줄바꿈만 하면 툴팁에서 한 줄로 붙는다. 목록은 `-`로 쓴다.
- **`namespace`를 쓰지 않는다**(필수). ES 모듈 이전의 기능이다. IIFE로 남아 트리 셰이킹이 안 된다.
- **`export default`를 쓰지 않는다**(필수). named export는 잘못된 이름으로 import하면 에러가 나고, default export는 아무 이름으로 받아도 통과해서 이름이 제각각이 된다.
- **같은 경로는 한 번만 import한다**(필수, ESLint `import/no-duplicates`). import 문은 모두 파일 맨 위에 둔다(`import/first`).
- **`export let`처럼 바뀌는 바인딩을 내보내지 않는다**(필수, ESLint `import/no-mutable-exports`). 가져간 쪽에서 값이 바뀌는 것을 예측할 수 없다. 상수나 함수만 내보낸다.
- **`// FIXME:`는 고쳐야 할 문제, `// TODO:`는 해야 할 해결책**에 단다(권장). 주석은 `//` 뒤에 한 칸 띄우고(`spaced-comment`), 대상 코드 위 줄에 쓴다.
- tsconfig에서 `strict`를 켠다(필수). 소스 파일은 UTF-8로 저장한다. `euc-kr`은 쓰지 않는다.

## 11. 코드 모양

포매터(Prettier)가 대부분 자동으로 맞추지만, 무엇을 왜 맞추는지 알아 두면 설정을 고르고 리뷰할 때 기준이 된다.

| 항목 | 관례 | 이유 |
| --- | --- | --- |
| 여는 중괄호 | 키워드와 같은 줄, 앞에 공백 하나(`if (x) {`) | JS 커뮤니티 대부분의 스타일. `return` 뒤 줄바꿈 같은 ASI 함정도 피한다 |
| 한 줄 `if` | 블록 `{}`을 쓴다. `if (cond) return null`처럼 아주 짧으면 한 줄도 허용 | 중괄호 없이 **다음 줄에** 쓰면 줄을 추가할 때 첫 줄만 조건에 묶인다. 이 모양은 금지 |
| 줄 길이 | 80~120자 중 팀이 정한다 | 긴 조건은 연산자 단위로 줄을 나누고, 긴 문자열은 템플릿 리터럴로 |
| 들여쓰기 | 스페이스 2칸(또는 4칸) | 탭과 섞지 않는다 |
| 빈 줄 | 선언·반복·반환처럼 논리 단위 사이에 한 줄 | 빈 줄 없이 아홉 줄 넘게 이어 쓰지 않는다 |
| 따옴표 | 작은따옴표(`'`), 따옴표가 섞이면 백틱 | 다수 JS 스타일 가이드의 관례. JSON을 자주 옮겨 붙이는 팀은 큰따옴표를 고르기도 한다 |
| 세미콜론 | 쓰거나 안 쓰거나 일관되게 | 안 쓰는 스타일(StandardJS)은 `(`·`[`로 시작하는 줄 앞에 `;`([[statements-vs-expressions\|문과 식]]) |

### 중첩을 줄인다

```typescript
// 예외 상황을 먼저 처리하고 빠져나가면 본 흐름이 한 단계 얕아진다
function pow(x: number, n: number): number {
  if (n < 0) throw new RangeError('n은 음수가 될 수 없다')

  let result = 1
  for (let i = 0; i < n; i++) result *= x
  return result
}

for (const item of items) {
  if (!item.visible) continue // if 블록으로 감싸는 대신 건너뛴다
  render(item)
}
```

### 헬퍼 함수는 사용하는 코드 아래에

함수 선언은 호이스팅되므로 위치를 고를 수 있다. **사용하는 코드를 먼저, 헬퍼 함수를 그 아래에** 두는 배치가 흔하다. 읽는 사람은 "무엇을 하는지"를 먼저 알고 싶어 하고, 헬퍼 이름이 잘 지어졌다면 본문을 열어 보지 않아도 된다. 모듈이라면 헬퍼를 파일로 분리하는 편이 더 낫다.

### 스타일 가이드와 린터

처음부터 규칙을 만들기보다 [Airbnb](https://github.com/airbnb/javascript), [Google](https://google.github.io/styleguide/jsguide.html), [StandardJS](https://standardjs.com/) 같은 공개 가이드에서 출발해 팀에 맞게 고친다. 지키는 일은 사람이 아니라 ESLint(품질)와 Prettier(모양)에 맡긴다. 과거에는 JSLint·JSHint를 썼고 ESLint 설정도 `.eslintrc`였지만, 지금은 flat config(`eslint.config.js`)다([[eslint-prettier|ESLint와 Prettier 설정]]). TypeScript 전용 린터였던 TSLint는 2019년에 폐기됐고, 지금은 **typescript-eslint**가 그 자리를 맡는다.

```js
// eslint.config.js
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,   // 타입 정보를 쓰는 규칙까지 (no-floating-promises 등)
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
);
```

이 노트의 규칙 상당수가 여기에 이미 들어 있다(`no-explicit-any`, `prefer-const`, `eqeqeq`, `no-namespace`, `switch-exhaustiveness-check`). 타입 정보를 쓰는 규칙은 TypeScript 컴파일러 API로 돌아가므로, 안정 API가 없는 TypeScript 7.0에서는 `typescript@6` 패키지를 함께 둔다. 스타일 논쟁의 기준은 늘 두 질문이다. **"더 읽기 쉬운가?", "실수를 더 줄이는가?"**

### 공개 스타일 가이드가 갈리는 지점

대부분의 규칙(`const`, `===`, `eval` 금지, 래퍼 객체 금지)은 가이드끼리 같다. 갈리는 것은 아래 같은 선택이고, 어느 쪽이든 **근거를 알고 하나로 정하면** 된다.

| 항목 | 이 노트의 기본값 | Airbnb | 그 밖의 가이드 |
| --- | --- | --- | --- |
| 세미콜론 | 일관되게 | 쓴다 | Google 쓴다, StandardJS 안 쓴다 |
| 줄 길이 | 80~120 중 하나 | 100자 | Google 80자 |
| 여러 줄 끝의 쉼표 | 포매터 기본값(Prettier는 `all`) | 붙인다. diff가 한 줄로 줄고 줄 순서를 바꾸기 쉽다 | Google도 줄바꿈이 있으면 붙인다 |
| 내보내기 | named export만 | 내보내는 것이 하나면 `export default`(`import/prefer-default-export`), 파일 이름도 그 이름과 같게 | Google JS는 default export 금지 |
| 반복문 | `for...of` 허용 | `for...of`·`for...in` 금지(`no-restricted-syntax`). 부수 효과 없는 `map`·`filter`·`reduce`와 `Object.keys`·`entries`로 돈다. 제너레이터도 쓰지 않는다 | Google은 `for...of`를 우선 쓰고 `for...in`은 사전형 객체에만 |
| `++`·`--` | 허용 | 금지(`no-plusplus`), `num += 1`. ASI로 앞 줄과 붙는 함정과 전위·후위 혼동을 막는다 | 대부분 허용 |
| 함수 정의 | 선언문(호이스팅으로 헬퍼를 아래에 둔다) | 이름 있는 함수 표현식 `const short = function longName() {}`(`func-style`). 정의 전에 쓰는 것을 막고 스택 추적에 이름을 남긴다 | |
| getter·setter | 허용 | 금지. 부수 효과가 숨어 테스트가 어렵다고 보고 `getAge()`·`setAge()` 메서드로 쓴다 | |
| `_` 접두사 | 쓰지 않는 변수에만 | 아예 금지(`no-underscore-dangle`). 비공개라는 뜻으로 써도 실제로는 공개다 | |
| 대문자 상수 | 전역 상수와 불변값 | 내보내는(`export const`) 불변값에만. 파일 안의 `const`는 camelCase | |
| 약어 | camelCase 단어처럼(`HttpRequest`) | 전부 대문자나 전부 소문자(`HTTPRequests`, `httpRequests`, `SMSContainer`) | Google은 단어처럼 소문자로 바꾼 뒤 첫 글자만 대문자(`xmlHttpRequest`, `supportsIpv6OnIos`) |
| 이벤트 데이터 | - | 값 하나가 아니라 객체로 넘긴다(`trigger('listingUpdated', { listingId })`). 나중에 필드를 더해도 핸들러를 고치지 않는다 | |

Airbnb 가이드의 공백 규칙(들여쓰기, 괄호·중괄호 안 공백, 줄 끝 공백 등 19장)은 ESLint가 v8.53에서 폐기한 서식 규칙이라 지금은 Prettier가 맡는다. 공식 공유 설정 `eslint-config-airbnb`(React 포함)·`eslint-config-airbnb-base`는 peer 의존성이 ESLint 7·8에 머물러 있어 flat config(ESLint 9 이후)에서는 바로 쓸 수 없다. Airbnb 규칙을 그대로 쓰려면 커뮤니티가 flat config로 옮긴 `eslint-config-airbnb-extended`를 쓰고, 아니면 이 노트처럼 필요한 규칙만 골라 `eslint.config.js`에 켠다.

## 12. 피할 코드: 닌자 코드 목록

똑똑해 보이지만 유지보수하는 사람을 괴롭히는 패턴들이다. 리뷰 체크리스트로 쓴다.

| 패턴 | 예 | 대신 |
| --- | --- | --- |
| 짧게 쓰기 경쟁 | `i = i ? i < 0 ? Math.max(0, len + i) : i : 0` | 중첩 삼항은 `if`로 푼다 |
| 한 글자·약어 이름 | `a`, `lst`, `brsr`, 반복문의 `i` 대신 `x` | 좁은 범위의 `i` 외에는 뜻이 보이는 이름(위 「1. 이름 짓기」) |
| 무엇이든 되는 이름 | `data`, `value`, `item`, `obj`, `str`, `data2` | 담긴 것의 의미를 이름에 |
| 철자가 비슷한 이름 | `date`와 `data` 섞어 쓰기 | 구분되는 단어 |
| 같은 동작에 다른 동사 | `displayMessage`, `showName`, `renderUser`, `paintList` | 동작마다 동사 하나로 통일한다. 반대로 다른 동작(`printPage`는 프린터, `printText`는 화면)에 같은 동사를 쓰지 않는다 |
| 변수 재사용 | 함수 중간에 `elem = clone(elem)` | 새 의미에는 새 변수 |
| 의미 없는 `_`·`__` 접두사 | `_name`, `__value`를 기분 따라 | 사용 안 하는 변수 표시(`_`) 같은 합의된 용도만 |
| 과장 형용사 | `superElement`, `megaFrame`, `niceItem` | 수식어를 빼거나 실제 차이를 이름에 |
| 바깥 변수 가리기 | 함수 안에서 바깥과 같은 이름 `user`를 다시 선언 | 다른 이름. ESLint `no-shadow` |
| 이름과 다른 부수 효과 | `isReady()`·`checkPermission()`·`findTags()`가 상태를 바꾸거나 불리언이 아닌 객체를 반환 | `is`·`check`·`find`는 확인만 하고 기대한 타입을 돌려준다 |
| 이름보다 많은 일 | `validateEmail()`이 검사하면서 에러 창까지 띄운다 | 함수 하나에 동작 하나. 그래야 재사용된다 |

함수 이름의 동사 관례(`get…` 값 반환, `calc…` 계산, `create…` 생성, `check…`·`is…` 확인 후 불리언)는 이 목록을 뒤집은 것이다. 동작 하나에 동사 하나를 팀 전체가 같은 뜻으로 쓴다. 이름을 고르는 원칙의 바탕은 [[clean-code-functions-naming|클린 코드: 함수와 이름]]에 있다.

## 정리

- 대부분의 규칙은 **"코드가 의도와 다르게 조용히 동작하는 경우"를 막는다.** 래퍼 객체 비교, 스프레드 덮어쓰기, `forEach` 안의 `await`가 그런 예다.
- 타입 규칙의 중심은 **느슨한 타입(`Object`, `any`성 `catch`, `null`이 섞인 별칭)을 줄이는 것**이다.
- `no-var`, `default-case`처럼 ESLint로 자동화할 수 있는 규칙은 사람이 리뷰할 것이 아니라 린터에 맡긴다. 린터와 포매터를 연결하는 방법은 [[eslint-prettier|ESLint와 Prettier 설정]]에 있다.
- 권장 규칙은 팀이 합의하면 예외를 둘 수 있다. 한글 식별자와 `switch (true)`가 그렇다.
- 코드 모양은 포매터에, 금지 패턴은 린터에 맡기고, 사람은 이름과 함수의 책임처럼 도구가 못 보는 것을 리뷰한다.
- 결국 컨벤션은 정답 목록이 아니라 **팀이 같은 코드를 같은 뜻으로 읽기 위한 합의**다.

관련 노트: [[variables-and-types|변수와 데이터 타입]], [[arrays-and-objects|배열·객체·문자열]], [[class|class 문법]], [[eslint-prettier|ESLint와 Prettier 설정]], [[review-patterns|코드 리뷰에서 자주 나온 지적]], [[typescript-basics|TypeScript: 개념과 문법 한눈에 보기]], [[typescript-advanced-types|TypeScript로 동적인 코드에 정적 타입 입히기]], [[clean-code-functions-naming|클린 코드: 함수와 이름]], [[js-comments|JavaScript 주석]], [[statements-vs-expressions|문(Statement)과 식(Expression)]]
