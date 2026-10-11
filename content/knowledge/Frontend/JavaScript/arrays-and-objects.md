---
title: "배열·객체·문자열 다루기"
concept: "Array Methods"
summary: "문자열·배열의 주요 메서드, 콜백을 받는 배열 헬퍼 메서드, ES6 객체 문법과 구조 분해, 옵셔널 체이닝, JSON."
tags: ["javascript", "data-structure", "frontend"]
source: mixed
---

데이터를 가공하는 코드의 대부분은 배열과 객체를 다루는 코드다. 특히 `map`, `filter`, `reduce` 같은 **배열 헬퍼 메서드**와 ES6 객체 문법은 React 코드에서 매일 쓰인다.

## 문자열 메서드

| 메서드 | 설명 |
| --- | --- |
| `includes(value)` | 포함 여부를 true/false로 반환 |
| `split(sep)` | 구분자로 나눈 배열 반환 |
| `replace(from, to)` / `replaceAll` | 처음 하나 / 전부 교체 |
| `trim()` / `trimStart()` / `trimEnd()` | 양쪽 / 앞 / 뒤 공백(스페이스, 탭, 줄바꿈) 제거 |

```javascript
const str = 'a cup'
str.split()    // ['a cup'] — 인자가 없으면 통째로 배열에
str.split('')  // ['a', ' ', 'c', 'u', 'p'] — 한 글자씩
str.split(' ') // ['a', 'cup']

'a b c d'.replace(' ', '-')    // 'a-b c d'
'a b c d'.replaceAll(' ', '-') // 'a-b-c-d'

'    hello  '.trim() // 'hello'
```

## 배열

배열은 순서를 보장하는 특수한 객체로, 0부터 시작하는 인덱스를 키로 가지며 `length` 속성을 가진다. 마지막 원소는 `arr[arr.length - 1]`.

### 기본 조작 메서드

| 메서드 | 설명 | 원본 변경 |
| --- | --- | --- |
| `push` / `pop` | 맨 뒤에 추가 / 맨 뒤 제거 | O |
| `unshift` / `shift` | 맨 앞에 추가 / 맨 앞 제거 | O |
| `reverse` | 순서 뒤집기 | O |
| `includes(v)` | 포함 여부 | X |
| `indexOf(v)` | 처음 찾은 인덱스, 없으면 `-1` | X |
| `join(sep)` | 구분자로 이어 붙인 문자열(기본 `,`) | X |

```javascript
const numbers = [1, 2, 3, 4, 5]
numbers.push(100)    // [1, 2, 3, 4, 5, 100]
numbers.pop()        // [1, 2, 3, 4, 5]
numbers.unshift(100) // [100, 1, 2, 3, 4, 5]
numbers.shift()      // [1, 2, 3, 4, 5]
numbers.indexOf(3)   // 2
numbers.join('-')    // '1-2-3-4-5'
```

### 헬퍼 메서드 (콜백을 받는 메서드)

배열을 순회하며 인자로 받은 **콜백 함수**(다른 함수 안에서 실행되도록 넘기는 함수)를 각 요소에 실행한다. 콜백은 `(element, index, array)`를 받는다.

| 메서드 | 반환 | 용도 |
| --- | --- | --- |
| `forEach` | 없음(`undefined`) | 단순 반복 |
| `map` | 콜백 반환값으로 만든 **새 배열** | 모든 요소를 변환 |
| `filter` | 콜백이 참인 요소만 모은 **새 배열** | 걸러내기 |
| `reduce` | 누적된 **하나의 값** | 합계, 그룹핑 |
| `find` | 콜백이 참인 **첫 요소**(없으면 `undefined`) | 하나 찾기 |
| `some` | 하나라도 참이면 `true` (빈 배열은 `false`) | 존재 검사 |
| `every` | 모두 참이면 `true` (빈 배열은 `true`) | 전체 검사 |

```javascript
const numbers = [1, 2, 3, 4, 5]

numbers.forEach((num, index) => console.log(num, index))

const doubled = numbers.map((num) => num * 2)         // [2, 4, 6, 8, 10]
const odds = numbers.filter((num) => num % 2)         // [1, 3, 5]
const sum = numbers.reduce((acc, num) => acc + num, 0) // 15

const avengers = [
  { name: 'Tony Stark', age: 45 },
  { name: 'Thor', age: 40 },
]
avengers.find((a) => a.name === 'Tony Stark') // { name: 'Tony Stark', age: 45 }

const hasEven = [1, 3, 5].some((n) => n % 2 === 0)  // false
const allOdd = [1, 3, 5].every((n) => n % 2 === 1)  // true
```

`reduce`의 두 번째 인자 `initialValue`는 첫 호출 때 `acc`에 들어가는 값이다. 생략하면 첫 요소가 쓰이고, **빈 배열에 initialValue 없이 호출하면 에러**가 난다.

### 배열 spread

```javascript
const array = [1, 2, 3]
const newArray = [0, ...array, 4] // [0, 1, 2, 3, 4]
```

ES5의 `concat`을 대체하며, **얕은 복사**에 쓴다. React에서 state 배열을 불변으로 업데이트할 때(`[...prev, newItem]`) 핵심이 되는 문법이다.

## 객체

중괄호 안에 `key: value` 쌍으로 속성을 나열한다. key는 문자열(또는 Symbol)이고, 공백 등이 있으면 따옴표로 감싼다. value는 함수를 포함해 어떤 타입이든 된다. 접근은 `obj.key` 또는 `obj['key']`이며, key에 공백이 있으면 대괄호만 쓸 수 있다.

### ES6 객체 문법

```javascript
const name = 'jack'
const key = 'regions'

const obj = {
  name,                        // 속성명 축약: name: name
  greeting() {                 // 메서드 축약: function 키워드 생략
    console.log('Hi!')
  },
  [key]: ['서울', '대전'],      // 계산된 속성명: key 값이 속성 이름이 됨
}
obj.regions // ['서울', '대전']
```

### 구조 분해 할당(destructuring)

배열이나 객체를 분해해 속성을 변수에 바로 담는다.

```javascript
const [firstName, surname] = ['Bora', 'Lee']
console.log(firstName, surname) // 'Bora' 'Lee'

const { title, author = '작자 미상' } = { title: '데미안' } // 기본값 지정 가능

// 함수 매개변수에서도 자주 쓴다 (React props)
function Btn({ buttonName }) { /* ... */ }
```

### 객체 spread

```javascript
const obj = { b: 2, c: 3 }
const newObj = { a: 1, ...obj, d: 4 } // { a: 1, b: 2, c: 3, d: 4 }
```

ES5의 `Object.assign()`을 대체하며 얕은 복사에 쓴다.

### 옵셔널 체이닝 `?.`

중간 값이 `null`이나 `undefined`일 수 있을 때, 에러를 던지지 않고 `undefined`를 반환하며 안전하게 접근한다.

```javascript
const user = {}
user.profile.name   // TypeError
user.profile?.name  // undefined

// API 에러 응답처럼 구조가 확실하지 않을 때 유용
const code = error.response?.data?.code
```

## JSON

JSON(JavaScript Object Notation)은 key-value 형태로 데이터를 표기하는 **언어 독립적인 문자열 포맷**이다. 객체처럼 생겼지만 실제로는 문자열이므로, 객체로 다루려면 파싱해야 한다.

```javascript
const jsonText = JSON.stringify({ a: 1 }) // 객체 → JSON 문자열 '{"a":1}'
const data = JSON.parse(jsonText)         // JSON 문자열 → 객체
```

## 핵심 정리

- 변환은 `map`, 걸러내기는 `filter`, 누적은 `reduce`, 하나 찾기는 `find`.
- `push`/`pop`/`reverse` 등은 원본을 바꾸고, 헬퍼 메서드와 spread는 새 배열을 만든다.
- 구조 분해·spread·옵셔널 체이닝은 현대 JS(특히 React)의 기본 문법이다.
- JSON은 문자열이다. `JSON.parse` / `JSON.stringify`로 변환한다.
