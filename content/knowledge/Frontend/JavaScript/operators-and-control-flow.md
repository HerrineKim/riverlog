---
title: "연산자와 제어문"
concept: "Control Flow"
summary: "할당·비교·논리·삼항 연산자와 if·switch 조건문, while·for·for...in·for...of 반복문."
tags: ["javascript", "frontend"]
source: til
date: "2026-10-12"
sources: ["https://riverkim.kr/166", "https://riverkim.kr/104"]
---

연산자와 제어문은 대부분의 언어와 비슷하지만, JavaScript에는 **암묵적 타입 변환**을 하는 `==`, 객체용 `for...in`과 iterable용 `for...of`의 구분처럼 헷갈리기 쉬운 지점이 있다.

## 연산자

### 할당 연산자

```javascript
let x = 0

x += 10 // 10
x *= 10 // 100
x /= 10 // 10
x++     // 11 (x += 1과 같음)
x--     // 10
```

### 비교 연산자

결과를 Boolean으로 반환한다. 문자열은 유니코드 값 기준 사전 순으로 비교한다(뒤 알파벳이 더 크고, 소문자가 대문자보다 크다).

```javascript
console.log('a' > 'z') // false
```

### `==` vs `===`

| | 동등 비교 `==` | 일치 비교 `===` |
| --- | --- | --- |
| 타입 변환 | 암묵적으로 타입을 맞춘 뒤 비교 | 변환 없이 타입과 값 모두 비교 |
| 객체끼리 | 같은 객체(참조)인지 판별 | 같은 객체(참조)인지 판별 |
| 권장 | 특별한 경우가 아니면 쓰지 않음 | **기본으로 사용** |

```javascript
1004 == '1004' // true
1 == true      // true
1004 === '1004' // false
1 === true      // false

// 자동 형변환의 함정
1004 + '1004' // '10041004' (문자열 연결)
1 + true      // 2
```

### 논리 연산자

`&&`(and), `||`(or), `!`(not). **단축 평가**를 지원해 결과가 확정되면 나머지를 평가하지 않는다. React의 조건부 렌더링 `{cond && <A />}`도 이 성질을 이용한다.

```javascript
false && anything // false (anything은 평가되지 않음)
true || anything  // true
```

### 단축 평가(short-circuit evaluation)

`&&`와 `||`는 true/false가 아니라 **결과를 결정한 피연산자를 타입 변환 없이 그대로** 반환한다. 결과가 확정되는 순간 나머지는 평가하지 않는데, 이를 단축 평가라고 한다.

```javascript
'Cat' && 'Dog' // 'Dog' — 좌항이 truthy라 우항까지 봐야 결과가 정해진다
'Cat' || 'Dog' // 'Cat' — 좌항이 truthy면 바로 결정된다

true || anything  // true
false || anything // anything
true && anything  // anything
false && anything // false
```

| 쓰임 | 단축 평가 | 대신하는 코드 |
| --- | --- | --- |
| 조건이 truthy일 때만 값 | `message = done && '완료'` | `if (done) message = '완료'` |
| 조건이 falsy일 때 대체값 | `message = done \|\| '미완료'` | `if (!done) message = '미완료'` |
| null일 수 있는 객체의 속성 참조 | `const value = elem && elem.value` | `elem`이 null이면 `elem.value`에서 TypeError |
| 매개변수 기본값(ES6 이전) | `str = str \|\| ''` | 지금은 `function f(str = '')` |

### 옵셔널 체이닝 `?.`와 null 병합 `??` (ES2020)

`&&`와 `||`는 **falsy 전체**(`false`, `0`, `-0`, `NaN`, `''`, `null`, `undefined`)에 반응한다. `0`이나 `''`가 정상 값인 경우에는 의도와 다르게 동작한다. ES2020에서 들어온 두 연산자는 **`null`과 `undefined`에만** 반응한다.

| 연산자 | 동작 | 대체하던 코드 |
| --- | --- | --- |
| `a?.b` | `a`가 null/undefined면 `undefined`, 아니면 `a.b` | `a && a.b` |
| `a ?? b` | `a`가 null/undefined면 `b`, 아니면 `a` | `a \|\| b` |

```javascript
const str = ''
str && str.length // '' — 빈 문자열이 falsy라 길이를 못 읽는다
str?.length       // 0

'' || 'default'   // 'default' — 빈 문자열이 유효한 값이어도 덮어쓴다
'' ?? 'default'   // ''
null ?? 'default' // 'default'
```

기본값을 줄 때 `0`·`''`·`false`도 유효한 값이면 `??`를, 객체 속성에 안전하게 접근할 때는 `?.`를 쓴다.

### 삼항 연산자

```javascript
const result = Math.PI > 4 ? 'Yes' : 'No' // 'No'
```

조건이 참이면 `:` 앞, 거짓이면 `:` 뒤의 값을 반환한다. 값이므로 변수에 할당할 수 있고, 한 줄로 쓰는 것을 권장한다.

## 조건문

### if

```javascript
if (condition) {
  // ...
} else if (otherCondition) {
  // ...
} else {
  // ...
}
```

조건식의 결과를 Boolean으로 변환해 판단한다.

### switch

표현식의 결과가 어느 `case` 값과 **일치(`===`)** 하는지로 분기한다. 특정 변수 값에 따라 분기가 많을 때 if보다 읽기 좋다.

```javascript
const nation = 'Korea'

switch (nation) {
  case 'Korea': {
    console.log('안녕하세요!')
    break
  }
  case 'France': {
    console.log('Bonjour!')
    break
  }
  default: {
    console.log('Hello!')
  }
}
```

`break`를 빼면 일치한 case부터 아래 case들이 **모두 실행**된다(fall through). 위 예에서 break가 없으면 세 인사가 전부 출력된다.

## 반복문

| 문법 | 용도 |
| --- | --- |
| `while` | 조건이 참인 동안 반복 |
| `for` | 초기식·조건식·증감식으로 횟수 제어 |
| `for...in` | **객체의 키(속성 이름)** 순회 |
| `for...of` | **iterable 객체의 값** 순회 (Array, String, Map, Set 등) |

```javascript
// while
let i = 0
while (i < 6) {
  console.log(i) // 0 ~ 5
  i += 1
}

// for: 초기식은 처음 1회, 조건식은 매 반복 전, 증감식은 매 반복 후
for (let i = 0; i < 6; i++) {
  console.log(i)
}

// for...in: 키 순회
const capitals = { korea: 'seoul', france: 'paris' }
for (const key in capitals) {
  console.log(key) // korea, france
}

// for...of: 값 순회
const fruits = ['딸기', '바나나', '메론']
for (const fruit of fruits) {
  console.log(fruit)
}
```

- `for...in`으로 배열을 순회할 수도 있지만 인덱스 순서가 보장되지 않고 상속된 속성까지 돌 수 있어 **권장하지 않는다**.
- `for...of`에서 반복 변수를 바꿀 일이 없으면 `const`로 선언한다. 매 반복마다 새 바인딩이 만들어지므로 `const`도 가능하다.
- 조건문·반복문 모두 블록 스코프를 만든다.

## 핵심 정리

- 비교는 항상 `===`. `==`의 자동 형변환은 예측하기 어렵다.
- 논리 연산자는 단축 평가를 하고, 결정한 피연산자를 그대로 반환한다.
- null/undefined만 걸러야 하면 `&&`·`||` 대신 `?.`·`??`.
- switch는 break를 잊으면 fall through.
- 객체는 `for...in`(키), 배열·iterable은 `for...of`(값).

관련 노트: [[conditional-rendering|React 조건부 렌더링(&&·삼항 연산자 활용)]]
