---
title: "배열·객체·문자열 다루기"
concept: "Array Methods"
summary: "문자열·배열의 주요 메서드, 콜백을 받는 배열 헬퍼 메서드와 원본을 바꾸지 않는 toSorted·with, 구조 분해로 값 교환·Set으로 중복 제거 같은 관용구, ES6 객체 문법, JSON."
tags: ["javascript", "data-structure", "frontend"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/74", "https://riverkim.kr/164", "https://riverkim.kr/177", "https://riverkim.kr/183", "https://riverkim.kr/176", "https://riverkim.kr/104", "https://yozm.wishket.com/magazine/detail/1585/"]
---

데이터를 가공하는 코드의 대부분은 배열과 객체를 다루는 코드다. 특히 `map`, `filter`, `reduce` 같은 **배열 헬퍼 메서드**와 ES6 객체 문법은 React 코드에서 매일 쓰인다.

## 문자열 메서드

| 메서드 | 설명 | 예 |
| --- | --- | --- |
| `includes(value)` | 포함 여부를 true/false로 반환 | `'a cup'.includes('cup')` → `true` |
| `split(sep)` | 구분자로 나눈 배열 반환. 인자가 없으면 통째로, `''`면 한 글자씩 | `'a cup'.split(' ')` → `['a', 'cup']` |
| `replace(from, to)` / `replaceAll` | 처음 하나 / 전부 교체 | `'a b c'.replaceAll(' ', '-')` → `'a-b-c'` |
| `trim()` / `trimStart()` / `trimEnd()` | 양쪽 / 앞 / 뒤 공백(스페이스, 탭, 줄바꿈) 제거 | `'  hi '.trim()` → `'hi'` |

## 배열

배열은 순서를 보장하는 특수한 객체로, 0부터 시작하는 인덱스를 키로 가지며 `length` 속성을 가진다. 마지막 원소는 `arr[arr.length - 1]`(또는 `arr.at(-1)`).

### 기본 조작 메서드

`numbers = [1, 2, 3]`에서 시작한다고 할 때:

| 메서드 | 설명 | 원본 변경 | 예 |
| --- | --- | --- | --- |
| `push` / `pop` | 맨 뒤에 추가 / 맨 뒤 제거 | O | `push(9)` → `[1, 2, 3, 9]` |
| `unshift` / `shift` | 맨 앞에 추가 / 맨 앞 제거 | O | `unshift(0)` → `[0, 1, 2, 3]` |
| `sort` / `reverse` / `splice` | 정렬 / 뒤집기 / 잘라 내고 끼우기 | O | `reverse()` → `[3, 2, 1]` |
| `toSorted` / `toReversed` / `toSpliced` / `with(i, v)` | 위 세 메서드와 인덱스 대입의 **복사본 버전**(ES2023) | X | `with(0, 9)` → `[9, 2, 3]`, 원본은 그대로 |
| `includes(v)` | 포함 여부 | X | `includes(2)` → `true` |
| `indexOf(v)` | 처음 찾은 인덱스, 없으면 `-1` | X | `indexOf(3)` → `2` |
| `join(sep)` | 구분자로 이어 붙인 문자열(기본 `,`) | X | `join('-')` → `'1-2-3'` |

React state처럼 원본을 바꾸면 안 되는 곳에서는 `[...arr].sort()` 대신 `arr.toSorted()`를 쓴다.

### 헬퍼 메서드 (콜백을 받는 메서드)

배열을 순회하며 인자로 받은 **콜백 함수**를 각 요소에 실행한다. 콜백은 `(element, index, array)`를 받는다. 원본은 바꾸지 않는다.

| 메서드 | 반환 | 용도 | `[1, 2, 3, 4, 5]`에서 |
| --- | --- | --- | --- |
| `forEach` | 없음(`undefined`) | 단순 반복 | `forEach((n, i) => console.log(n, i))` |
| `map` | 콜백 반환값으로 만든 **새 배열** | 모든 요소를 변환 | `map(n => n * 2)` → `[2, 4, 6, 8, 10]` |
| `filter` | 콜백이 참인 요소만 모은 **새 배열** | 걸러내기 | `filter(n => n % 2)` → `[1, 3, 5]` |
| `reduce` | 누적된 **하나의 값** | 합계, 그룹핑 | `reduce((acc, n) => acc + n, 0)` → `15` |
| `find` | 콜백이 참인 **첫 요소**(없으면 `undefined`) | 하나 찾기 | `find(n => n > 3)` → `4` |
| `some` | 하나라도 참이면 `true` (빈 배열은 `false`) | 존재 검사 | `some(n => n > 4)` → `true` |
| `every` | 모두 참이면 `true` (빈 배열은 `true`) | 전체 검사 | `every(n => n > 0)` → `true` |

```javascript
const avengers = [
  { name: 'Tony Stark', age: 45 },
  { name: 'Thor', age: 40 },
]
avengers.find((a) => a.name === 'Thor')       // { name: 'Thor', age: 40 }
avengers.filter((a) => a.age > 42).map((a) => a.name) // ['Tony Stark']
```

### reduce와 리듀서 함수

`arr.reduce(callback[, initialValue])`에 넘기는 콜백을 **리듀서(reducer)** 라고 한다.

| 인자 | 의미 |
| --- | --- |
| `acc` (누산기) | 지금까지 누적된 값. 리듀서의 반환값이 다음 호출의 `acc`가 된다 |
| `cur` / `idx` / `src` | 현재 요소 / 현재 인덱스 / 원본 배열 |

누산기가 순회 내내 유지되므로 결과는 하나의 값이 된다. 요소마다 결과가 하나씩 필요하면 `map`, 여러 조각을 **하나로 합쳐야** 하면 `reduce`를 쓴다.

```javascript
const parts = ['https://example.com', 'users', '42']
parts.reduce((acc, cur) => `${acc}/${cur}`) // 'https://example.com/users/42'
```

`initialValue`는 첫 호출 때 `acc`에 들어가는 값이다. 생략하면 첫 요소가 쓰이고, **빈 배열에 initialValue 없이 호출하면 에러**가 난다.

### 자주 쓰는 한 줄 관용구

```javascript
const copy = [0, ...array, 4]        // spread: 얕은 복사·이어 붙이기 (concat 대체)
const unique = [...new Set([...arr1, ...arr2])] // 합치고 중복 제거
;[a, b] = [b, a]                     // 임시 변수 없이 두 값 교환
```

- spread는 **얕은 복사**다. 중첩된 객체·배열은 같은 참조를 공유한다. 문법 자체는 [[functions|함수와 this]]의 rest·spread에 있다.
- `Set`은 원시값 기준으로 중복을 없앤다. 객체는 참조가 달라서 내용이 같아도 남는다.

## 객체

중괄호 안에 `key: value` 쌍으로 속성을 나열한다. key는 문자열(또는 Symbol)이고, value는 함수를 포함해 어떤 타입이든 된다. 접근은 `obj.key` 또는 `obj['key']`이며, key에 공백이 있으면 대괄호만 쓸 수 있다.

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

const merged = { a: 1, ...obj, d: 4 } // 객체 spread: Object.assign() 대체, 얕은 복사
```

### 구조 분해 할당(destructuring)

배열이나 객체를 분해해 속성을 변수에 바로 담는다.

```javascript
const [firstName, surname] = ['Bora', 'Lee']
const { title, author = '작자 미상' } = { title: '데미안' } // 기본값 지정 가능

// 나머지(rest)를 한 변수에 모으기
const [a, b, ...rest] = [10, 20, 30, 40, 50] // rest: [30, 40, 50]
const { p, ...others } = { p: 1, q: 2, r: 3 } // others: { q: 2, r: 3 }

// 이미 선언한 변수에 객체 구조 분해로 할당할 때는 괄호로 감싼다
let x, y
;({ x, y } = { x: 1, y: 2 })

// 함수 매개변수에서도 자주 쓴다 (React props)
function Btn({ buttonName }) { /* ... */ }
```

중간 값이 없을 수 있는 객체에 안전하게 접근하는 `?.`(옵셔널 체이닝)는 [[operators-and-control-flow|연산자와 제어문]]에 있다.

## JSON

JSON(JavaScript Object Notation)은 key-value 형태로 데이터를 표기하는 **언어 독립적인 문자열 포맷**이다. 객체처럼 생겼지만 실제로는 문자열이므로, 객체로 다루려면 파싱해야 한다.

```javascript
const jsonText = JSON.stringify({ a: 1 }) // 객체 → JSON 문자열 '{"a":1}'
const data = JSON.parse(jsonText)         // JSON 문자열 → 객체
```

## 핵심 정리

- 변환은 `map`, 걸러내기는 `filter`, 누적은 `reduce`, 하나 찾기는 `find`.
- `push`/`pop`/`sort`/`reverse`는 원본을 바꾼다. 원본을 지켜야 하면 `toSorted`·`toReversed`·`with`를 쓴다.
- spread는 얕은 복사다. `[...new Set(arr)]`로 중복을 없애고, `[a, b] = [b, a]`로 교환한다.
- JSON은 문자열이다. `JSON.parse` / `JSON.stringify`로 변환한다.

관련 노트: [[functions|함수와 this]], [[operators-and-control-flow|연산자와 제어문]], [[state|State와 불변 업데이트]], [[lists-and-keys|리스트와 Key(map으로 렌더링)]]
