---
title: "연산자와 제어문"
concept: "Control Flow"
summary: "할당·비교·논리·삼항 연산자와 if·switch 조건문, while·for·for...in·for...of 반복문."
tags: ["javascript", "frontend"]
source: til
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
- 논리 연산자는 단축 평가를 한다.
- switch는 break를 잊으면 fall through.
- 객체는 `for...in`(키), 배열·iterable은 `for...of`(값).
