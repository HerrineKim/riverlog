---
title: "배열·객체·문자열 다루기"
concept: "Array Methods"
summary: "문자열·배열의 주요 메서드, Array.from 같은 정적 메서드, 원본을 바꾸는 메서드와 바꾸지 않는 메서드(slice·toSorted·with), sort 비교 함수, 콜백을 받는 헬퍼 메서드와 콜백을 만드는 함수, reduce로 세기·묶기, 객체 속성 접근과 Object.keys·entries, 구조 분해, JSON."
tags: ["javascript", "data-structure", "frontend"]
source: mixed
date: "2026-10-15"
sources: ["https://riverkim.kr/74", "https://riverkim.kr/164", "https://riverkim.kr/177", "https://riverkim.kr/183", "https://riverkim.kr/176", "https://riverkim.kr/104", "https://yozm.wishket.com/magazine/detail/1585/", "https://wesbos.com/javascript/08-data-types/objects", "https://wesbos.com/javascript/08-data-types/arrays", "https://wesbos.com/javascript/08-data-types/46-array-cardio-static-methods", "https://wesbos.com/javascript/08-data-types/47-array-cardio-instance-methods", "https://wesbos.com/javascript/08-data-types/48-array-cardio-callback-methods-and-function-generation", "https://wesbos.com/javascript/09-gettin-loopy/49-looping-and-iterating-array-foreach", "https://wesbos.com/javascript/09-gettin-loopy/50-looping-and-iterating-mapping", "https://wesbos.com/javascript/09-gettin-loopy/51-looping-and-iterating-filter-find-and-higher-order-functions", "https://wesbos.com/javascript/09-gettin-loopy/52-looping-and-iterating-reduce", "https://wesbos.com/javascript/09-gettin-loopy/53-looping-and-iterating-reduce-exercise"]
---

> 개인 TIL과 요즘IT 글을 바탕으로, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)를 함께 참고해 보강했다.

데이터를 가공하는 코드의 대부분은 배열과 객체를 다루는 코드다. 특히 `map`, `filter`, `reduce` 같은 **배열 헬퍼 메서드**와 ES6 객체 문법은 React 코드에서 매일 쓰인다.

## 문자열 메서드

| 메서드 | 설명 | 예 |
| --- | --- | --- |
| `includes(value)` | 포함 여부(대소문자 구분) | `'a cup'.includes('cup')` → `true` |
| `split(sep)` | 구분자로 나눈 배열. `''`면 한 글자씩 | `'a,b'.split(',')` → `['a', 'b']` |
| `replace(from, to)` / `replaceAll` | 처음 하나 / 전부 교체. 정규식도 받는다 | `'a b c'.replace(/\s/g, '-')` → `'a-b-c'` |
| `trim()` / `trimStart()` / `trimEnd()` | 양쪽 / 앞 / 뒤 공백 제거 | `'  hi '.trim()` → `'hi'` |
| `repeat(n)` | n번 반복한 문자열 | `'ab'.repeat(2)` → `'abab'` |
| `toUpperCase()` / `slice(start, end)` | 대문자 / 부분 문자열 | `` `${w[0].toUpperCase()}${w.slice(1)}` ``(첫 글자 대문자) |

`split('')`은 UTF-16 단위로 쪼개서 이모지가 깨진다. 글자 단위로 나누려면 `[...str]`이나 `Intl.Segmenter`를 쓴다.

## 배열

배열은 순서를 보장하는 특수한 객체로, 0부터 시작하는 인덱스를 키로 가지며 `length` 속성을 가진다. 마지막 원소는 `arr[arr.length - 1]` 또는 `arr.at(-1)`이고, `arr[arr.length]`는 `undefined`다. `typeof []`는 `'object'`라서 배열 판별은 `Array.isArray(x)`로 한다.

### 정적 메서드: 배열 만들기

개별 배열이 아니라 `Array` 자체에 달린 메서드를 정적 메서드라 한다. `Array.from`의 두 번째 인자는 각 칸을 채울 map 함수라서, `{ length: n }`을 넘기면 범위(range)를 한 줄로 만든다.

```javascript
Array.from({ length: 5 }, (_, i) => i + 1) // [1, 2, 3, 4, 5]
Array.from(document.querySelectorAll('p'))  // 유사 배열·iterable → 진짜 배열
Array(3).fill('x')                          // ['x', 'x', 'x']
```

### 원본을 바꾸는 메서드와 바꾸지 않는 메서드

`numbers = [1, 2, 3]`에서 시작한다고 할 때:

| 메서드 | 설명 | 원본 변경 | 예 |
| --- | --- | --- | --- |
| `push` / `pop` | 맨 뒤에 추가 / 맨 뒤 제거. `push`는 새 길이, `pop`은 뺀 값을 반환 | O | `push(9)` → `[1, 2, 3, 9]` |
| `unshift` / `shift` | 맨 앞에 추가 / 맨 앞 제거 | O | `unshift(0)` → `[0, 1, 2, 3]` |
| `splice(start, count, ...items)` | start부터 **count개**를 잘라 내고 끼우기 | O | `splice(1, 1)` → 원본이 `[1, 3]` |
| `sort` / `reverse` | 정렬 / 뒤집기 | O | `reverse()` → `[3, 2, 1]` |
| `slice(start, end)` | start부터 **end 앞까지** 잘라 낸 새 배열. 인자가 없으면 복사 | X | `slice(0, 2)` → `[1, 2]` |
| `toSorted` / `toReversed` / `toSpliced` / `with(i, v)` | 정렬·뒤집기·자르기와 인덱스 대입의 **복사본 버전**(ES2023) | X | `with(0, 9)` → `[9, 2, 3]` |
| `concat` / `flat()` | 이어 붙인 새 배열 / 한 단계 펼친 새 배열 | X | `[[1], [2]].flat()` → `[1, 2]` |
| `includes(v)` / `indexOf(v)` / `lastIndexOf(v)` | 포함 여부 / 처음·마지막 인덱스(없으면 `-1`). `===`로 비교 | X | `indexOf(3)` → `2` |
| `join(sep)` | 구분자로 이어 붙인 문자열(기본 `,`) | X | `join(' or ')` → `'1 or 2 or 3'` |

`slice`와 `splice`는 이름이 비슷해 늘 헷갈린다. **`slice`는 복사, `splice`는 수술**이다. React state처럼 원본을 바꾸면 안 되는 곳에서는 복사본 버전을 쓴다.

```javascript
const added   = [...names, 'lux']                       // push 대신
const removed = comments.filter((c) => c.id !== id)     // id로 하나 빼기
const inserted = bikes.toSpliced(2, 0, 'benotto')       // 2번 자리에 끼우기
const sorted  = items.toSorted(byPrice)                 // [...items].sort(byPrice)와 같다
const unique  = [...new Set([...arr1, ...arr2])]        // 합치고 중복 제거
;[a, b] = [b, a]                                        // 임시 변수 없이 두 값 교환
```

spread(`[...arr]`)는 **얕은 복사**다. 깊은 복사와 참조 공유는 [[variables-and-types|변수와 데이터 타입]]의 「값과 참조」에, `Set`은 [[map-and-set|Map과 Set]]에 있다.

`includes`·`indexOf`는 `===`로 비교하므로 **내용이 같은 다른 객체는 찾지 못한다**(`[{ a: 1 }].includes({ a: 1 })`은 `false`). 객체 배열에서는 콜백으로 찾는 `find`·`findIndex`·`some`을 쓴다.

### sort와 비교 함수

`sort()`는 기본적으로 **요소를 문자열로 바꿔** 사전 순으로 정렬한다. 그래서 숫자 배열은 `[1, 100, 2]`처럼 정렬된다. 숫자나 객체는 비교 함수 `(a, b) => …`를 넘긴다. 반환값이 음수면 a가 앞, 양수면 b가 앞, 0이면 그대로다.

```javascript
[1, 100, 2].sort((a, b) => a - b)                   // [1, 2, 100] 오름차순 (b - a면 내림차순)
names.sort((a, b) => a.localeCompare(b, 'ko'))     // 문자열은 로케일 기준 비교
Object.entries(prices).sort(([, a], [, b]) => b - a) // 객체를 값 기준으로 정렬한 [키, 값] 배열
```

### 헬퍼 메서드 (콜백을 받는 메서드)

배열을 순회하며 인자로 받은 **콜백 함수**를 각 요소에 실행한다. 콜백은 `(element, index, array)`를 받는다. 원본은 바꾸지 않는다.

| 메서드 | 반환 | 용도 | `[1, 2, 3, 4, 5]`에서 |
| --- | --- | --- | --- |
| `forEach` | 없음(`undefined`) | 부수 효과(DOM 갱신, 로그, 이벤트 연결) | `forEach((n, i) => console.log(n, i))` |
| `map` | 콜백 반환값으로 만든 **같은 길이의 새 배열** | 모든 요소를 변환 | `map(n => n * 2)` → `[2, 4, 6, 8, 10]` |
| `filter` | 콜백이 참인 요소만 모은 **새 배열**(없으면 `[]`) | 걸러내기 | `filter(n => n % 2)` → `[1, 3, 5]` |
| `reduce` | 누적된 **하나의 값** | 합계, 세기, 묶기 | `reduce((acc, n) => acc + n, 0)` → `15` |
| `find` / `findIndex` | 콜백이 참인 **첫 요소** / 그 인덱스(없으면 `undefined` / `-1`) | 하나 찾기 | `find(n => n > 3)` → `4` |
| `some` | 하나라도 참이면 `true` (빈 배열은 `false`) | 존재 검사 | `some(n => n > 4)` → `true` |
| `every` | 모두 참이면 `true` (빈 배열은 `true`) | 전체 검사 | `every(n => n > 0)` → `true` |

- 콜백은 **호출하지 않고 함수 자체를 넘긴다**. `arr.map(capitalize)`이지 `arr.map(capitalize())`가 아니다.
- `map`·`filter`는 새 배열을 돌려주므로 한 줄에 하나씩 이어 쓸 수 있다: `text.split('').filter(isValidChar).map(toLower)`.
- `map` 안에서 DOM을 바꾸는 등 바깥을 건드리지 않는다. 그런 일은 `forEach`나 `for...of`가 맡는다. 반환값이 필요 없는데 `map`을 쓰면 버려지는 배열이 생긴다.

### 콜백을 만드는 함수

같은 모양의 콜백을 값만 바꿔 여러 번 쓴다면, **콜백을 반환하는 함수**(고차 함수)를 만든다. 반환된 함수는 바깥 함수의 인자를 클로저로 기억한다([[scope-and-closures|스코프와 클로저]]).

```javascript
const findByProp = (prop, value) => (item) => item[prop] === value

students.find(findByProp('id', '565a'))
students.filter(findByProp('grade', 3))
```

여기서 `findByProp(...)`는 지금 호출하는 것이 맞다. 호출 결과가 `find`에 넘길 콜백이기 때문이다. 속성 이름이 변수로 들어오므로 점 표기 대신 대괄호 `item[prop]`를 쓴다. 고차 함수의 일반 개념은 [[functional-programming|함수형 프로그래밍]]에 있다.

### reduce와 리듀서 함수

`arr.reduce(callback[, initialValue])`에 넘기는 콜백을 **리듀서(reducer)** 라고 한다. 콜백은 `(acc, cur, idx, src)`를 받는다. **리듀서가 반환한 값이 다음 호출의 `acc`가 된다.** 반환을 잊으면 다음 회차의 `acc`는 `undefined`다.

`initialValue`는 첫 호출 때 `acc`에 들어가는 값이다. 생략하면 첫 요소가 쓰이고, **빈 배열에 initialValue 없이 호출하면 에러**가 난다. 결과 타입이 드러나도록 늘 넘기는 편이 안전하다.

```javascript
const total = inventory.reduce((sum, item) => sum + item.price, 0)

// 종류별로 세기: 빈 객체에서 시작해 키가 없으면 0으로 보고 더한다
const counts = inventory.reduce((acc, item) => {
  acc[item.type] = (acc[item.type] ?? 0) + 1
  return acc
}, {})

// 종류별로 묶기는 ES2024 표준 메서드로 대신한다
const byType = Object.groupBy(inventory, (item) => item.type) // { shirt: [...], pants: [...] }
```

요소마다 결과가 하나씩 필요하면 `map`, 여러 조각을 **하나로 합쳐야** 하면 `reduce`를 쓴다. 바깥 변수를 두고 `forEach`로 더하는 방식은 함수 밖 상태를 바꾸는 부수 효과라 `reduce`보다 추적하기 어렵다.

## 객체

중괄호 안에 `key: value` 쌍으로 속성을 나열한다. key는 문자열(또는 Symbol)이고, value는 함수를 포함해 어떤 타입이든 된다. 함수인 속성을 메서드라 하며, 화살표 함수로 만든 메서드는 자기 `this`가 없다([[functions|함수와 this]]). 마지막 속성 뒤에도 쉼표(trailing comma)를 두면 다음 속성을 추가할 때 diff가 한 줄로 끝난다.

### 속성 접근

| 표기 | 언제 | 예 |
| --- | --- | --- |
| `obj.key` | 기본 | `person.age` |
| `obj['key']` | key에 공백·하이픈이 있거나 숫자로 시작 | `person['cool-dude']` |
| `obj[변수]` | key가 변수에 담겨 있을 때. `obj.변수`는 이름 그대로 `'변수'` 속성을 찾는다 | `person[propertyToCheck]` |

- 없는 속성은 `undefined`이고, **`undefined`의 속성을 읽으면 `TypeError`** 가 난다. 중첩 접근은 `obj.jobs?.side`로 쓴다.
- 속성 삭제는 `delete obj.key`다. `obj.key = undefined`는 속성을 남긴 채 값만 비운다.
- 속성 순서는 정해져 있다. **정수처럼 생긴 키는 오름차순으로 먼저, 나머지 문자열 키는 넣은 순서**대로다. 순서 자체가 데이터라면 배열이나 [[map-and-set|Map]]을 쓴다.

### Object.keys · values · entries

객체를 배열로 바꿔 배열 메서드를 쓰게 해 준다. 상속한 속성은 빼고 자기 속성만 담는다.

```javascript
const meats = { beyond: 10, beef: 5, pork: 7 }
Object.keys(meats)    // ['beyond', 'beef', 'pork']
Object.values(meats).some((qty) => qty >= 5) // true
Object.entries(meats).forEach(([meat, qty]) => console.log(meat, qty)) // 매개변수에서 바로 구조 분해
Object.fromEntries(Object.entries(meats).filter(([, qty]) => qty > 6)) // { beyond: 10, pork: 7 }
```

`entries`로 바꿔 `map`·`filter`·`sort`한 뒤 `Object.fromEntries`로 다시 객체로 돌리는 것이 객체를 변환하는 기본 패턴이다.

### ES6 객체 문법과 구조 분해

```javascript
const obj = {
  name,                        // 속성명 축약: name: name
  greeting() {},               // 메서드 축약: function 키워드 생략 (화살표 함수가 아니다)
  [key]: ['서울', '대전'],      // 계산된 속성명: key 값이 속성 이름이 됨
}
const merged = { ...meat, ...veggie, oyster: 10 } // 키가 겹치면 뒤에 쓴 값이 이긴다

const [first, , third] = ['a', 'b', 'c']                      // 배열은 순서로
const { title, author = '작자 미상', ...others } = book       // 객체는 이름으로, 기본값과 나머지
;({ x, y } = point)                                           // 이미 선언한 변수에 할당할 때는 괄호
function Btn({ buttonName }) {}                               // 매개변수에서 바로 (React props)
```

## JSON

JSON(JavaScript Object Notation)은 key-value 형태로 데이터를 표기하는 **언어 독립적인 문자열 포맷**이다. 객체처럼 생겼지만 실제로는 문자열이므로 `JSON.stringify(obj)`로 문자열로, `JSON.parse(text)`로 객체로 바꾼다. 키는 큰따옴표 문자열이어야 하고, 함수·`undefined`는 빠지며 Date는 문자열이 된다.

## 핵심 정리

- 변환은 `map`, 걸러내기는 `filter`, 누적·세기는 `reduce`, 하나 찾기는 `find`, 부수 효과는 `forEach`.
- `push`·`pop`·`splice`·`sort`·`reverse`는 원본을 바꾼다. 원본을 지켜야 하면 `slice`·`toSorted`·`toSpliced`·`with`.
- `sort()`는 문자열 기준이다. 숫자는 `(a, b) => a - b`.
- 반복되는 콜백은 콜백을 만드는 함수로 뽑는다. 변수 키는 대괄호로 접근한다.
- 객체는 `Object.entries` → 배열 메서드 → `Object.fromEntries`로 변환한다. JSON은 문자열이다.

관련 노트: [[functions|함수와 this]], [[operators-and-control-flow|연산자와 제어문]], [[variables-and-types|변수와 데이터 타입]], [[map-and-set|Map과 Set]], [[state|State와 불변 업데이트]], [[lists-and-keys|리스트와 Key(map으로 렌더링)]]
