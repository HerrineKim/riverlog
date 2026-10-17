---
title: "Map과 Set"
concept: "Map & Set"
summary: "Map은 어떤 값이든 키로 쓰고 넣은 순서를 지키는 키-값 컬렉션, Set은 중복 없는 값의 모음이다. 일반 객체와 비교해 언제 무엇을 쓸지, 주요 메서드와 순회, 객체와 서로 바꾸기, JSON으로 보낼 때의 제약, WeakMap·WeakSet, ES2025의 Set 집합 연산까지."
tags: ["javascript", "data-structure", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://wesbos.com/javascript/08-data-types/maps", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap", "https://web.dev/learn/javascript/collections/keyed", "https://ko.javascript.info/map-set", "https://ko.javascript.info/weakmap-weakset"]
---

> Wes Bos의 「[Beginner JavaScript](https://wesbos.com/javascript)」 강의 노트를 바탕으로, web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌의 「Keyed collections」 모듈, javascript.info(모던 JavaScript 튜토리얼)의 「맵과 셋」, 「위크맵과 위크셋」 글을 더하고 MDN으로 확인해 재구성한 노트다.

## Map이란

**Map은 키-값 쌍을 담는 컬렉션**이다. 객체와 비슷하지만 **어떤 타입의 값이든 키로 쓸 수 있고**, 넣은 순서대로 순회한다. 데이터를 담는 용도로만 설계되어, 객체처럼 프로토타입 속성과 키가 섞일 걱정이 없다.

```javascript
const prizes = new Map()
prizes.set(100, 'Bear').set(200, 'Duck') // set은 Map을 반환해 이어 쓸 수 있다
prizes.get(100)    // 'Bear' — 숫자 키 그대로
prizes.has(300)    // false
prizes.size        // 2
prizes.delete(200) // true
```

같은 키로 다시 `set`하면 새 항목이 생기지 않고 **값만 덮어쓴다**. 키 비교 규칙은 Set과 같아서 `NaN`도 키로 찾을 수 있다. 처음부터 채우려면 `[키, 값]` 쌍의 이터러블을 넘긴다: `new Map([['a', 1], [null, 0]])`. `const`로 선언한 Map도 내용은 바꿀 수 있다(변수만 고정된다).

`prizes['age'] = 1`이나 `prizes.age = 1`처럼 대괄호·점 표기로 넣으면 항목이 아니라 Map 객체의 속성이 될 뿐이다. 항목은 늘 `set`·`get`으로 다룬다.

### 객체를 키로: 사전(dictionary)

객체 자체를 키로 쓰면 원본 객체를 건드리지 않고 그 객체에 대한 **부가 정보**를 따로 저장할 수 있다. 키는 내용이 아니라 **참조**로 비교되므로 같은 객체를 넘겨야 찾는다.

```javascript
const person = { name: 'wes' }
const notes = new Map([[person, 'Really cool']])
notes.get(person)            // 'Really cool'
notes.get({ name: 'wes' })   // undefined — 다른 객체
```

## 객체 vs Map

| | 일반 객체 `{}` | `Map` |
| --- | --- | --- |
| 키 타입 | 문자열·Symbol (숫자는 문자열로 바뀜) | **아무 값**(객체, 함수, 숫자, NaN) |
| 순서 | 정수 키는 오름차순, 나머지는 넣은 순서 | **넣은 순서 그대로** |
| 크기 | `Object.keys(obj).length` | `map.size` |
| 순회 | `Object.entries(obj)`로 바꾼 뒤 | 바로 `for...of`, `forEach` |
| 리터럴 | `{ a: 1 }` | 없음. `new Map([['a', 1]])` |
| 메서드 저장 | 가능(this로 자기 데이터 접근) | 데이터 전용 |
| JSON | `JSON.stringify` 그대로 | 그대로는 `{}`가 된다 |
| 잦은 추가·삭제 | 보통 | 이 용도에 맞게 최적화 |

**고르는 기준**: 모양이 정해진 레코드(사용자, 설정, API 응답)는 객체다. 실행 중에 키가 계속 늘고 줄거나, 키가 문자열이 아니거나, 넣은 순서가 의미 있으면 Map이다.

## 순회와 변환

Map은 iterable이라 `for...of`로 돌면 `[키, 값]` 배열이 나온다. 구조 분해로 받는다.

```javascript
for (const [points, prize] of prizes) {
  ul.insertAdjacentHTML('beforeend', `<li>${points} - ${prize}</li>`)
}
prizes.forEach((prize, points) => {}) // forEach는 (값, 키) 순서
const allPoints = [...prizes.keys()]  // keys()·values()·entries()는 이터레이터
```

| 변환 | 코드 |
| --- | --- |
| 객체 → Map | `new Map(Object.entries(obj))` |
| Map → 객체 | `Object.fromEntries(map)` (키가 문자열로 바뀐다) |
| Map → JSON | `JSON.stringify(Object.fromEntries(map))` 또는 `JSON.stringify([...map])` |
| 배열 → 키별 Map | `Map.groupBy(items, (x) => x.type)` (ES2024) |

객체 키는 JSON으로 옮길 수 없다. Map만의 장점(객체 키, 숫자 키)을 쓰고 있다면 직렬화할 때 그 정보가 사라진다는 점을 감안한다.

## Set

**Set은 중복 없는 값의 모음**이다. 같은지는 `===`와 거의 같은 규칙(SameValueZero, `NaN`끼리는 같다고 본다)으로 판단한다.

```javascript
const tags = new Set(['js', 'css', 'js'])
tags.size            // 2
tags.add('html').has('html') // true
tags.delete('css')
const unique = [...new Set(arr)] // 배열 중복 제거
```

- `has`는 배열의 `includes`보다 빠르다. 많은 값에 대해 "이미 있나"를 반복해서 물을 때 Set으로 바꿔 둔다.
- 객체는 참조로 비교되므로 내용이 같은 객체 두 개는 둘 다 남는다.
- 인덱스가 없어 `set[0]`으로 꺼낼 수 없지만, 순회 순서는 **넣은 순서**다. 이미 있는 값을 다시 `add`하면 무시되고 원래 자리를 지킨다.
- 배열로 돌릴 때는 `[...set]`이나 `Array.from(set)`. `forEach((value, sameValue, set) => …)`의 둘째 인자는 Map과 모양을 맞추려고 값을 한 번 더 준 것이다.

ES2025부터 집합 연산 메서드가 표준이다. 모두 새 Set을 반환하거나 불리언을 답한다.

| 메서드 | 뜻 |
| --- | --- |
| `a.union(b)` / `a.intersection(b)` | 합집합 / 교집합 |
| `a.difference(b)` / `a.symmetricDifference(b)` | 차집합 / 대칭차 |
| `a.isSubsetOf(b)` / `a.isSupersetOf(b)` / `a.isDisjointFrom(b)` | 부분집합 / 상위집합 / 서로소 여부 |

## WeakMap과 WeakSet

키(WeakSet은 값)로 **객체, 또는 전역 레지스트리에 등록하지 않은 Symbol**(ES2023)만 받고, 그 대상을 약하게 참조한다. 숫자·문자열 같은 원시값이나 `Symbol.for()`로 만든 Symbol은 언제든 똑같이 다시 만들 수 있어 "더 이상 아무도 안 쓴다"를 판단할 수 없으므로 거부된다(`set`·`add`에서 `TypeError`, [[js-symbol|Symbol]]). 다른 곳에서 그 객체를 더 이상 쓰지 않으면 항목째 가비지 컬렉션된다. 그래서 크기를 알 수 없고 순회도 할 수 없다.

메서드는 `get`·`set`·`has`·`delete`(WeakSet은 `add`·`has`·`delete`)뿐이고 `size`·`keys()`·`forEach`가 없다. 가비지 컬렉션이 언제 항목을 치울지 엔진만 알기 때문이다.

DOM 요소나 외부 라이브러리 객체에 부가 데이터·캐시를 붙일 때 쓴다. 대표적인 쓰임은 둘이다. 남의 객체에 방문 횟수 같은 **부가 데이터** 붙이기, 그리고 입력 객체별 계산 결과를 담는 **캐시**. 둘 다 객체가 사라지면 항목도 저절로 사라져 손으로 청소할 필요가 없다. 예제 코드와 도달 가능성 규칙, WeakRef는 [[garbage-collection|가비지 컬렉션과 메모리 누수]]에 있다. WeakSet은 "이 객체를 이미 처리했나"처럼 객체에 표시만 해 두는 용도(방문 표시, 순환 참조 검사)에 맞다. 일반 Map에 담으면 요소가 페이지에서 사라져도 Map이 붙잡고 있어 메모리가 새지만, WeakMap은 함께 사라진다.

## 정리

- 정해진 모양의 레코드는 객체, 동적인 키-값 모음은 Map.
- Map은 아무 값이나 키로 쓰고, 넣은 순서를 지키고, `size`가 있다. 객체 키는 참조로 찾는다.
- Map은 JSON이 안 된다. `Object.fromEntries`로 바꿔서 보낸다.
- 중복 제거와 빠른 포함 검사는 Set. 집합 연산은 `union`·`intersection` 등 표준 메서드로.
- 객체에 데이터를 덧붙이되 수명을 같이하게 하려면 WeakMap.

관련 노트: [[arrays-and-objects|배열·객체·문자열 다루기]], [[iterators-and-generators|이터레이터와 제너레이터]], [[variables-and-types|변수와 데이터 타입]], [[data-structures|기초 자료구조]], [[ecmascript-tc39|ECMAScript 표준과 TC39 프로세스]], [[garbage-collection|가비지 컬렉션과 메모리 누수]], [[destructuring|구조 분해 할당]]
