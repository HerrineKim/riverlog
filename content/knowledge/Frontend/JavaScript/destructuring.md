---
title: "구조 분해 할당"
concept: "Destructuring"
summary: "배열·이터러블은 순서로, 객체는 이름으로 값을 꺼내 변수에 담는 문법. 건너뛰기와 나머지(rest), undefined일 때만 쓰이고 필요할 때만 평가되는 기본값, 이름 바꾸기, 중첩 패턴, 이미 선언한 변수에 할당할 때의 괄호, 두 변수 교환, entries와 함께 도는 반복, 그리고 매개변수 객체를 분해하는 '똑똑한 함수 매개변수'와 = {} 기본값을 정리한다."
tags: ["javascript", "frontend", "data-structure"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/destructuring-assignment", "https://ko.javascript.info/keys-values-entries", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「구조 분해 할당」, 「Object.keys, values, entries」 글을 바탕으로, MDN으로 확인해 재구성한 노트다.

## 구조 분해란

**구조 분해 할당(destructuring assignment)은 배열이나 객체의 값을 꺼내 여러 변수에 한 번에 담는 문법이다.** 원본을 바꾸거나 부수지 않는다. "구조를 풀어 변수로 옮긴다"는 뜻이다. 왼쪽에 **꺼낼 모양(패턴)**을, 오른쪽에 대상 값을 둔다.

| 패턴 | 짝을 맞추는 기준 | 오른쪽에 올 수 있는 것 |
| --- | --- | --- |
| 배열 패턴 `[a, b]` | **순서** | 모든 이터러블(배열, 문자열, Set, Map, 제너레이터) |
| 객체 패턴 `{ a, b }` | **속성 이름**(적는 순서와 무관) | `null`·`undefined`를 뺀 아무 값 |

```javascript
const [first, last] = 'Bora Lee'.split(' ')
const [a, b, c] = 'abc'                 // 문자열도 이터러블
const [one, two] = new Set([1, 2, 3])
const { title, width } = { title: 'Menu', width: 100, height: 200 }

const [x] = { x: 1 }   // TypeError: not iterable — 일반 객체는 이터러블이 아니다
const { y } = null     // TypeError — null·undefined는 분해할 수 없다
```

## 배열 패턴

```javascript
const [name, , title] = ['Julius', 'Caesar', 'Consul', 'of Rome'] // 쉼표로 건너뛴다
const [head, ...rest] = [1, 2, 3, 4]        // rest는 [2, 3, 4] — 새 배열
const [p, q] = []                            // 둘 다 undefined, 에러 없음

const user = {}
;[user.name, user.surname] = 'Bora Lee'.split(' ') // 왼쪽은 대입 가능한 자리면 된다
```

- **나머지(rest)** 요소 `...rest`는 맨 끝에 하나만 쓸 수 있다.
- 왼쪽에는 변수뿐 아니라 객체 속성처럼 **대입할 수 있는 자리**가 다 온다.
- 줄이 `[`로 시작하면 앞 줄에 붙어 읽힐 수 있다. 세미콜론 없는 스타일에서는 앞에 `;`를 붙인다([[statements-vs-expressions|문과 식]]의 ASI).

### 두 변수 교환

```javascript
let guest = 'Jane', admin = 'Pete'
;[guest, admin] = [admin, guest] // 임시 변수 없이 맞바꾼다. 셋 이상도 된다
```

## 객체 패턴

```javascript
const options = { title: 'Menu', height: 200 }

const { width: w = 100, height: h = 200, title } = options // 이름 바꾸기 + 기본값
const { title: heading, ...others } = options              // others는 { height: 200 }
```

| 문법 | 뜻 |
| --- | --- |
| `{ title }` | `title` 속성을 `title` 변수에 |
| `{ width: w }` | `width` 속성을 `w` 변수에. **콜론 왼쪽이 원본, 오른쪽이 새 이름** |
| `{ width = 100 }` | 값이 없으면 기본값 |
| `{ width: w = 100 }` | 이름 바꾸기와 기본값을 함께 |
| `{ [key]: v }` | 계산된 이름으로 꺼내기 |
| `{ a, ...rest }` | 나머지 **자기 열거 가능 속성**을 새 객체로(얕은 복사) |

### 이미 선언한 변수에 할당할 때

문의 맨 앞에 오는 `{`는 블록으로 읽힌다. 선언 없이 객체 패턴으로 할당하려면 **문 전체를 괄호로 감싼다.**

```javascript
let title, width
{ title, width } = options     // SyntaxError — 블록으로 해석된다
;({ title, width } = options)  // 괄호로 식임을 알린다
```

## 기본값 규칙

| 규칙 | 예 | 결과 |
| --- | --- | --- |
| 값이 **`undefined`일 때만** 쓰인다 | `const [a = 1, b = 1] = [null, undefined]` | `a`는 `null`, `b`는 `1`. `0`·`''`·`false`도 그대로 받는다 |
| 필요할 때만 **평가**된다 | `const [s = prompt('성?'), n = prompt('이름?')] = ['김']` | `prompt`는 이름 쪽만 한 번 불린다 |
| 앞에서 꺼낸 변수를 쓸 수 있다 | `const { w = 100, h = w } = {}` | `h`는 `100` |

기본값 자리에 함수 호출이나 식을 둬도 값이 있으면 실행되지 않으므로, 비싼 계산이나 부수 효과가 있는 호출도 안전하게 기본값으로 쓸 수 있다.

## 중첩 패턴

패턴이 원본과 같은 모양이면 깊은 곳의 값도 바로 꺼낸다.

```javascript
const options = {
  size: { width: 100, height: 200 },
  items: ['Cake', 'Donut'],
}

const {
  size: { width, height },   // size 변수는 생기지 않는다. width·height만
  items: [item1, item2],
  title = 'Menu',             // 없는 속성은 기본값
} = options
```

`size: { … }`처럼 콜론 뒤에 패턴이 오면 `size`는 **변수가 아니라 경로**다. 중간 값이 `undefined`면 `TypeError`이므로, 없을 수 있는 중간 단계에는 기본값 `{ size: { width } = {} }`를 준다.

## 반복과 함께

```javascript
for (const [key, value] of Object.entries(user)) {}   // 객체
for (const [key, value] of map) {}                     // Map은 [키, 값]을 낸다
for (const [i, item] of items.entries()) {}            // 배열 인덱스가 필요할 때
users.map(({ id, name }) => `${id}:${name}`)           // 콜백 매개변수에서 바로
```

`Object.keys`·`values`·`entries`는 Map·Set·배열의 `.keys()` 같은 이터레이터가 아니라 **진짜 배열**을 돌려준다. 그래서 바로 `map`·`filter`를 이어 쓸 수 있다. `Object.entries` → 배열 메서드 → `Object.fromEntries`로 객체를 변환하는 패턴은 [[arrays-and-objects|배열·객체 다루기]]에 있다.

## 똑똑한 함수 매개변수

선택 인자가 많은 함수를 위치 인자로 만들면 순서를 외워야 하고, 중간 값을 비우려면 `undefined`를 줄줄이 넘겨야 한다.

```javascript
showMenu('My Menu', undefined, undefined, ['Item1']) // 무엇이 무엇인지 읽히지 않는다
```

**인자를 객체 하나로 받고 매개변수 자리에서 분해하면** 이름으로 넘기고, 순서와 상관없고, 빠진 값은 기본값이 채운다.

```javascript
function showMenu({ title = 'Untitled', width: w = 200, height = 100, items = [] } = {}) {
  // ...
}

showMenu({ title: 'My Menu', items: ['Item1'] })
showMenu() // 끝의 = {}가 없으면 undefined를 분해하려다 TypeError
```

**매개변수 패턴 끝에 `= {}`를 붙인다.** 인자를 하나도 넘기지 않아도 분해할 빈 객체가 생겨 모든 속성이 기본값을 쓴다. React 컴포넌트의 `function Button({ label, onClick })`도 같은 문법이다. 매개변수가 몇 개일 때 객체로 바꿀지에 대한 팀 규칙은 [[typescript-coding-convention|TypeScript 코딩 컨벤션]]에, 매개변수 기본값 일반은 [[functions|함수와 this]]에 있다.

## 정리

- 배열 패턴은 순서로, 객체 패턴은 이름으로 꺼낸다. 배열 패턴은 이터러블이 필요하다.
- `...rest`는 맨 끝에 하나. 배열은 새 배열, 객체는 얕게 복사한 새 객체가 된다.
- 기본값은 `undefined`일 때만, 필요할 때만 평가된다. `null`은 기본값을 부르지 않는다.
- `{ 원본: 새이름 = 기본값 }`. 선언 없이 객체 패턴으로 할당하면 괄호로 감싼다.
- 선택 인자가 많은 함수는 객체 하나를 분해해 받고, 패턴 끝에 `= {}`를 붙인다.

관련 노트: [[arrays-and-objects|배열·객체 다루기]], [[functions|함수와 this]], [[iterators-and-generators|이터레이터와 제너레이터]], [[map-and-set|Map과 Set]], [[statements-vs-expressions|문(Statement)과 식(Expression)]]
