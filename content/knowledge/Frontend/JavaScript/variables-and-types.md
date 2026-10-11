---
title: "변수와 데이터 타입"
concept: "Variables"
summary: "let·const·var의 차이와 호이스팅, 원시 타입과 참조 타입, null과 undefined의 구분."
tags: ["javascript", "frontend"]
source: til
---

변수를 어떻게 선언하느냐는 스코프와 재할당 가능 여부를 결정하고, 값의 타입이 원시 타입이냐 참조 타입이냐는 복사·비교 방식을 결정한다. JavaScript 버그의 상당수가 이 두 가지를 헷갈려서 생긴다.

## 식별자 규칙

- 식별자(identifier)는 변수를 구분하는 이름이다.
- 문자, `$`, `_`로 시작해야 하고 대소문자를 구분한다.
- 예약어(`for`, `if`, `function` 등)는 쓸 수 없다.

| 스타일 | 용도 | 예 |
| --- | --- | --- |
| camelCase | 변수, 객체, 함수 | `userName` |
| PascalCase | 클래스, 생성자 | `UserService` |
| UPPER_SNAKE_CASE | 상수(개발자의 의도와 상관없이 바뀔 일이 없는 값) | `API_KEY` |

## 선언, 할당, 초기화

```javascript
let foo        // 선언: 변수를 생성
console.log(foo) // undefined

foo = 11       // 할당: 값을 저장
let bar = 0    // 선언 + 할당
```

- **선언(declaration)**: 변수를 만드는 행위
- **할당(assignment)**: 변수에 값을 저장하는 행위
- **초기화(initialization)**: 선언된 변수에 처음으로 값을 저장하는 행위

## let, const, var

| 키워드 | 재선언 | 재할당 | 스코프 | 비고 |
| --- | --- | --- | --- | --- |
| `let` | 불가 | 가능 | 블록 | 값이 바뀔 변수 |
| `const` | 불가 | **불가** | 블록 | 기본으로 사용 |
| `var` | 가능 | 가능 | 함수 | ES6 이전 방식, 사용 지양 |

- **블록 스코프**: `if`, `for`, 함수 등의 중괄호 `{}` 내부. 블록 밖에서는 접근할 수 없다.
- **함수 스코프**: 함수의 중괄호 내부. `var`는 `if`/`for` 블록을 무시하고 함수 단위로만 갇힌다.
- `const`로 선언한 객체·배열도 **내부 값은 바꿀 수 있다**. 막히는 것은 변수 자체의 재할당이다.

### 호이스팅(hoisting)

선언이 스코프의 맨 위로 끌어올려진 것처럼 동작하는 현상이다.

```javascript
console.log(a) // undefined — 에러가 아니다
var a = 1

console.log(b) // ReferenceError: Cannot access 'b' before initialization
let b = 2
```

`var`는 선언과 동시에 `undefined`로 초기화되어 선언 전에 접근해도 에러 없이 `undefined`가 나온다. 예기치 못한 버그의 원인이 되므로 ES6 이후로는 `const`와 `let`을 쓴다. (`let`/`const`도 호이스팅되지만 초기화 전까지 접근할 수 없는 구간(TDZ, Temporal Dead Zone)에 있어 에러가 난다.)

## 데이터 타입

### 원시 타입(Primitive type)

객체가 아닌 기본 타입. 변수에 **값 자체**가 담기고, 다른 변수에 복사하면 값이 복사된다.

| 타입 | 설명 |
| --- | --- |
| Number | 정수·실수 구분 없는 하나의 숫자 타입(부동소수점). 계산 불가 시 `NaN` (예: `'Angel' / 1004`) |
| String | 텍스트. 작은따옴표·큰따옴표 모두 가능. 백틱 템플릿 리터럴 `` `Hi ${name}` ``으로 표현식 삽입(ES6) |
| Boolean | `true` / `false` |
| undefined | 값이 할당되지 않음 |
| null | 값이 없음을 **의도적으로** 표현 |
| Symbol | 고유한 식별자 |
| BigInt | 아주 큰 정수 |

### 참조 타입(Reference type)

객체(Object)와 그 일종인 Array, Function 등. 변수에 **참조값(주소)** 이 담기고, 복사하면 같은 객체를 가리키는 참조가 복사된다.

```javascript
const a = { n: 1 }
const b = a
b.n = 2
console.log(a.n) // 2 — 같은 객체를 가리킨다
```

### undefined vs null

| | undefined | null |
| --- | --- | --- |
| 의미 | 값이 아직 없음 | 값이 없음을 의도적으로 표시 |
| 누가 넣나 | 선언만 하면 JavaScript가 자동 할당 | 개발자가 직접 할당 |
| `typeof` | `'undefined'` | `'object'` |

`typeof null`이 `'object'`인 것은 언어 초기 구현의 버그다. 초기 JavaScript는 값을 타입 태그와 값으로 표현했는데, 객체의 타입 태그가 0이었고 null은 널 포인터(0x00)로 표현되어 타입 태그가 0으로 읽혔다. 명세상 null은 원시 타입이다.

### 자동 형변환

조건문·반복문에서 Boolean이 아닌 값은 자동으로 true/false로 변환된다. `false`, `0`, `''`, `null`, `undefined`, `NaN`은 falsy, 나머지는 truthy다.

## 핵심 정리

- 기본은 `const`, 바뀌어야 하면 `let`, `var`는 쓰지 않는다.
- 원시 타입은 값이, 참조 타입은 주소가 복사된다.
- `undefined`는 "아직 없음", `null`은 "일부러 비움".
