---
title: "변수와 데이터 타입"
concept: "Variables"
summary: "let·const·var의 차이와 호이스팅, strict mode, 원시 타입과 참조 타입, typeof, null과 undefined의 구분, 값 복사와 참조 공유(비교·얕은 복사·structuredClone·함수 인자·const와 Object.freeze)."
tags: ["javascript", "frontend", "memory"]
source: mixed
date: "2026-10-15"
sources: ["https://riverkim.kr/118", "https://wesbos.com/javascript/01-the-basics/variables-and-statements", "https://wesbos.com/javascript/01-the-basics/types-introduction", "https://wesbos.com/javascript/01-the-basics/types-null-and-undefined", "https://wesbos.com/javascript/08-data-types/object-references-vs-values", "https://wesbos.com/javascript/08-data-types/objects"]
---

> 개인 TIL을 바탕으로, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)를 함께 참고해 보강했다.

변수를 어떻게 선언하느냐는 스코프와 재할당 가능 여부를 결정하고, 값의 타입이 원시 타입이냐 참조 타입이냐는 복사·비교 방식을 결정한다. JavaScript 버그의 상당수가 이 두 가지를 헷갈려서 생긴다.

## 식별자 규칙

- 식별자(identifier)는 변수를 구분하는 이름이다. 대소문자를 구분한다.
- 첫 글자는 문자, `$`, `_`만 된다. 숫자는 두 번째 글자부터 쓸 수 있다.
- 예약어(`for`, `if`, `function` 등)와 하이픈은 쓸 수 없다. `my-name`은 뺄셈으로 해석되므로 kebab-case는 불가능하다.

| 스타일 | 용도 | 예 |
| --- | --- | --- |
| camelCase | 변수, 객체, 함수 | `userName` |
| PascalCase | 클래스, 생성자, React 컴포넌트 | `UserService` |
| UPPER_SNAKE_CASE | 상수(개발자의 의도와 상관없이 바뀔 일이 없는 값) | `API_KEY` |

## 선언, 할당, 초기화

```javascript
let foo        // 선언: 변수를 생성
console.log(foo) // undefined

foo = 11       // 할당: 값을 저장 (다시 선언하지 않는다)
let bar = 0    // 선언 + 할당 = 초기화
```

- **선언(declaration)**: 변수를 만드는 행위
- **할당(assignment)**: 변수에 값을 저장하는 행위
- **초기화(initialization)**: 선언된 변수에 처음으로 값을 저장하는 행위. `const`는 선언과 동시에 초기화해야 한다.

## let, const, var

| 키워드 | 재선언 | 재할당 | 스코프 | 비고 |
| --- | --- | --- | --- | --- |
| `let` | 불가 | 가능 | 블록 | 값이 바뀔 변수 |
| `const` | 불가 | **불가** | 블록 | 기본으로 사용 |
| `var` | 가능 | 가능 | 함수 | ES6 이전 방식, 사용 지양 |

- **블록 스코프**: `if`, `for`, 함수 등의 중괄호 `{}` 내부. 블록 밖에서는 접근할 수 없다.
- **함수 스코프**: 함수의 중괄호 내부. `var`는 `if`/`for` 블록을 무시하고 함수 단위로만 갇힌다. 그래서 `for (var i …)`의 `i`는 반복문이 끝난 뒤에도 남는다.
- 기본은 `const`로 선언하고, 재할당이 필요해질 때만 `let`으로 바꾼다.

### 호이스팅(hoisting)

선언이 스코프의 맨 위로 끌어올려진 것처럼 동작하는 현상이다.

```javascript
console.log(a) // undefined — 에러가 아니다
var a = 1

console.log(b) // ReferenceError: Cannot access 'b' before initialization
let b = 2
```

`var`는 선언과 동시에 `undefined`로 초기화되어 선언 전에 접근해도 에러 없이 `undefined`가 나온다. `let`/`const`도 호이스팅되지만 초기화 전까지 접근할 수 없는 구간(TDZ, Temporal Dead Zone)에 있어 에러가 난다.

### strict mode

초기 JavaScript는 선언하지 않은 이름에 값을 넣으면(`dog = 'snickers'`) 전역 변수를 만들어 줬다. 오타 하나가 전역 변수가 되는 셈이다. 하위 호환 때문에 이 동작은 지금도 남아 있고, 파일·함수 맨 위에 `'use strict'`를 쓰면 **엄격 모드**가 되어 `ReferenceError`가 난다.

**ES 모듈(`type="module"`, `import`/`export`를 쓰는 파일)과 `class` 본문은 자동으로 엄격 모드다.** 번들러로 빌드하는 요즘 코드는 대부분 따로 적지 않아도 엄격 모드로 돈다.

## 데이터 타입

### 원시 타입(Primitive type)

객체가 아닌 기본 타입. 변수에 **값 자체**가 담기고, 다른 변수에 복사하면 값이 복사된다. 원시값은 바꿀 수 없다(immutable). 문자열 메서드도 원본을 고치지 않고 새 문자열을 돌려준다.

| 타입 | 설명 |
| --- | --- |
| Number | 정수·실수 구분 없는 하나의 숫자 타입(부동소수점). 자세한 함정은 [[js-numbers|숫자와 Math]] |
| String | 텍스트. 작은따옴표·큰따옴표는 완전히 같고, 백틱은 여러 줄과 `${}` 삽입을 지원한다([[template-literals|템플릿 리터럴]]) |
| Boolean | `true` / `false` |
| undefined | 값이 할당되지 않음 |
| null | 값이 없음을 **의도적으로** 표현 |
| Symbol | 다른 어떤 값과도 겹치지 않는 고유 식별자. 객체 속성 이름 충돌을 막을 때 쓴다 |
| BigInt | 2^53 − 1을 넘는 아주 큰 정수(`10n`) |

### 참조 타입(Reference type)

원시 타입이 아닌 모든 값은 객체(Object)다. Array, Function, Date, Map도 객체의 일종이다. 변수에는 **참조값(주소)** 이 담긴다.

### typeof

| 값 | `typeof` 결과 | 비고 |
| --- | --- | --- |
| `'a'`, `1`, `NaN`, `true`, `10n`, `Symbol()` | `'string'`, `'number'`, `'number'`, `'boolean'`, `'bigint'`, `'symbol'` | `NaN`도 number다 |
| `undefined` | `'undefined'` | 선언하지 않은 변수에 써도 에러 없이 `'undefined'` |
| `null` | `'object'` | 언어 초기의 버그(아래) |
| `{}`, `[]`, `new Date()` | `'object'` | 배열 판별은 `Array.isArray(x)` |
| `function () {}` | `'function'` | 함수만 따로 구분된다 |

### undefined vs null

| | undefined | null |
| --- | --- | --- |
| 의미 | 값이 아직 없음 | 값이 없음을 의도적으로 표시 |
| 누가 넣나 | 선언만 하면 JavaScript가 자동 할당 | 개발자가 직접 할당 |
| `typeof` | `'undefined'` | `'object'` |

| 상황 | undefined가 되는 예 |
| --- | --- |
| 값을 할당하지 않은 변수 | `let a; a // undefined` |
| 전달되지 않은 인자 | `function f(x) { return x }; f()` |
| 없는 속성에 접근 | `({}).foo` |
| `return`이 없는 함수의 반환값 | `(function () {})()` |

**선언하지 않은 변수**는 undefined가 아니라 `ReferenceError: x is not defined`다. 객체 속성에서는 "처음부터 없는 속성"(`undefined`)과 "있었는데 일부러 비운 속성"(`null`)을 구분할 수 있고, 속성 자체가 있는지는 `'last' in obj`나 `Object.hasOwn(obj, 'last')`로 확인한다.

```javascript
null === undefined // false — 타입이 다르다
null == undefined  // true — 동등 비교에서는 서로만 같다
1 + null           // 1 — null은 숫자 연산에서 0으로 변환
1 + undefined      // NaN
```

`typeof null`이 `'object'`인 것은 언어 초기 구현의 버그다. 초기 JavaScript는 값을 타입 태그와 값으로 표현했는데, 객체의 타입 태그가 0이었고 null은 널 포인터(0x00)로 표현되어 타입 태그가 0으로 읽혔다. 명세상 null은 원시 타입이다.

조건문에서 값이 true/false로 바뀌는 규칙(truthy·falsy)과 형변환은 [[operators-and-control-flow|연산자와 제어문]]에 있다.

## 값과 참조

원시값은 **값으로** 복사·비교되고, 객체는 **참조로** 복사·비교된다.

```javascript
let a = 'wes'
let b = a
b = 'scott'      // a는 그대로 'wes'

const p1 = { first: 'wes' }
const p2 = { first: 'wes' }
const p3 = p1     // 객체를 복사한 것이 아니라 같은 객체를 가리킨다
p3.first = 'Larry'
p1.first          // 'Larry'
p1 === p2         // false — 내용이 같아도 다른 객체
p1 === p3         // true — 같은 객체
```

| 상황 | 원시값 | 객체·배열 |
| --- | --- | --- |
| `===` 비교 | 값이 같으면 true | **같은 객체일 때만** true. `indexOf`·`includes`도 같은 규칙 |
| `b = a` 대입 | 값 복사 | 참조 복사. 한쪽을 고치면 다른 쪽도 바뀐다 |
| 함수 인자로 전달 | 함수 안에서 재할당해도 바깥은 그대로 | 함수 안에서 **속성을 고치면 바깥 객체가 바뀐다**. 매개변수 자체를 재할당하는 것은 바깥에 영향이 없다 |

### 복사하기

| 방법 | 깊이 | 비고 |
| --- | --- | --- |
| `{ ...obj }`, `[...arr]`, `Object.assign({}, obj)`, `arr.slice()` | 얕은 복사 | 한 단계만 복사. 중첩 객체는 참조를 공유한다 |
| `structuredClone(obj)` | 깊은 복사 | 브라우저·Node 표준 API. Map·Set·Date·순환 참조도 복사한다. 함수·DOM 노드는 복사하지 못해 에러가 나고, 클래스 인스턴스는 프로토타입을 잃어 평범한 객체가 된다 |
| `JSON.parse(JSON.stringify(obj))` | 깊은 복사(제한적) | Date는 문자열이 되고 `undefined`·함수·Map은 사라진다. 과거의 우회법 |

과거에는 깊은 복사에 Lodash의 `_.cloneDeep`을 주로 썼다. 지금은 대부분 `structuredClone`으로 충분하다. 얕은/깊은 복사의 일반 개념은 [[data-structures|기초 자료구조]]에 있다.

```javascript
const person = { name: 'wes', clothing: { shirts: 10 } }
const shallow = { ...person }
shallow.clothing.shirts = 100 // person.clothing.shirts도 100
const deep = structuredClone(person)
deep.clothing.shirts = 1      // person은 그대로
```

### const와 Object.freeze

`const`는 **변수와 값의 연결(binding)** 을 고정할 뿐, 객체 내용을 고정하지 않는다. `const` 객체의 속성은 바꿀 수 있다. 내용까지 막으려면 `Object.freeze(obj)`를 쓴다.

- `freeze`는 사본을 만들지 않고 **같은 객체를 얼린 뒤 돌려준다**.
- 얼린 객체를 고치면 일반 모드에서는 조용히 무시되고, strict mode에서는 `TypeError`가 난다.
- **얕게** 얼린다. 중첩 객체는 여전히 바꿀 수 있다.

## 핵심 정리

- 기본은 `const`, 바뀌어야 하면 `let`, `var`는 쓰지 않는다. 모듈은 자동으로 strict mode다.
- `undefined`는 "아직 없음", `null`은 "일부러 비움". 배열 판별은 `typeof`가 아니라 `Array.isArray`.
- 원시 타입은 값이, 참조 타입은 주소가 복사된다. 객체는 내용이 아니라 참조로 비교된다.
- spread는 얕은 복사, `structuredClone`은 깊은 복사. 함수에 넘긴 객체를 고치면 바깥도 바뀐다.
- `const`는 재할당을 막고, `Object.freeze`는 (한 단계) 변경을 막는다.

관련 노트: [[operators-and-control-flow|연산자와 제어문]], [[arrays-and-objects|배열·객체·문자열 다루기]], [[js-numbers|숫자와 Math]], [[map-and-set|Map과 Set]], [[functional-programming|함수형 프로그래밍]]
