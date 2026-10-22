---
title: "이터레이터와 제너레이터"
concept: "Iterator & Generator"
summary: "for...of·spread·구조 분해가 공통으로 쓰는 약속인 이터러블·이터레이터 프로토콜(Symbol.iterator와 next()의 { value, done }), 직접 iterable 만들기, 실행을 멈췄다 이어 가는 제너레이터 함수(function*, yield, next(값)으로 값 돌려보내기, return, yield*), 게으른 무한 수열, ES2025 이터레이터 헬퍼와 비동기 이터레이션을 정리한다."
tags: ["javascript", "frontend", "function", "async"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/javascript/control-flow", "https://web.dev/learn/javascript/data-types/symbol", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator", "https://ko.javascript.info/generators", "https://ko.javascript.info/async-iterators-generators", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync"]
---

> web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌의 「Control flow」 모듈 중 Iterators·Generator functions 절을 바탕으로, javascript.info(모던 JavaScript 튜토리얼)의 「제너레이터」, 「async 이터레이터와 제너레이터」 글을 더하고 MDN으로 확인해 재구성한 노트다.

## 이터러블과 이터레이터

`for...of`, spread `[...x]`, 배열 구조 분해, `Array.from`, `new Map(x)`, `Promise.all(x)`는 모두 **같은 약속 하나**에 기대어 값을 하나씩 꺼낸다. 그 약속이 이터레이션 프로토콜(iteration protocols)이다.

| 용어 | 조건 | 예 |
| --- | --- | --- |
| **이터러블(iterable)** | `[Symbol.iterator]()` 메서드가 있어, 부르면 이터레이터를 돌려준다 | Array, String, Map, Set, `arguments`, NodeList, 제너레이터 객체 |
| **이터레이터(iterator)** | `next()` 메서드가 있어, 부를 때마다 `{ value, done }`을 돌려준다 | `arr[Symbol.iterator]()`, `map.entries()`의 반환값 |

배열 자체는 이터레이터가 아니다. 부를 때마다 **새 이터레이터를 만들어 주는** 이터러블이다. 그래서 같은 배열을 여러 번 `for...of`로 돌 수 있다. 반면 이터레이터는 한 번 끝까지 가면 다시 처음으로 돌아가지 않는다.

```javascript
const it = [1, 2, 3][Symbol.iterator]()
it.next() // { value: 1, done: false }
it.next() // { value: 2, done: false }
it.next() // { value: 3, done: false }
it.next() // { value: undefined, done: true }: 마지막 값을 지나친 다음 호출에서 done이 true
```

일반 객체 `{}`는 이터러블이 아니다. `for...of`에 넣으면 `TypeError: obj is not iterable`이고, `Object.entries(obj)`로 배열을 만든 뒤 돈다([[operators-and-control-flow|연산자와 제어문]]).

### 직접 iterable 만들기

`[Symbol.iterator]`에 이터레이터를 돌려주는 메서드를 두면 내 객체도 `for...of`와 spread에 쓸 수 있다([[js-symbol|Symbol]]의 well-known symbol).

```javascript
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let current = this.from
    const last = this.to
    return {
      next: () => current <= last
        ? { value: current++, done: false }
        : { value: undefined, done: true },
    }
  },
}
console.log([...range]) // [1, 2, 3]
for (const n of range) console.log(n)
```

이렇게 손으로 상태를 관리하는 코드는 제너레이터로 훨씬 짧아진다.

## 제너레이터 함수

`function*`(별표)로 선언한 함수는 **호출해도 본문을 실행하지 않고 제너레이터 객체를 돌려준다.** 제너레이터 객체는 이터레이터이면서 이터러블이다. `next()`를 부를 때마다 본문이 다음 `yield`까지 실행되고, 거기서 **멈춘 채 상태를 보존한다.**

```javascript
function* steps() {
  console.log('시작')
  yield 'first'
  console.log('중간')
  yield 'second'
  return 'end'
}

const gen = steps()   // 아무것도 출력되지 않는다
gen.next()            // '시작' 출력 → { value: 'first', done: false }
gen.next()            // '중간' 출력 → { value: 'second', done: false }
gen.next()            // { value: 'end', done: true }: return 값은 done: true와 함께 온다
gen.next()            // { value: undefined, done: true }
```

- `next()`는 **제너레이터 객체**에 부른다. `steps().next()`를 두 번 쓰면 매번 새 제너레이터가 생겨 계속 `'first'`만 나온다.
- `return`한 값은 `done: true`인 결과에 실린다. 그래서 `for...of`와 spread는 `return` 값을 **버린다**(`[...steps()]`는 `['first', 'second']`).
- 메서드로는 `*name() {}`, 클래스에서는 `*[Symbol.iterator]() {}`로 쓴다. 화살표 함수로는 제너레이터를 만들 수 없다.

```javascript
const range = {
  from: 1, to: 3,
  *[Symbol.iterator]() {
    for (let n = this.from; n <= this.to; n++) yield n
  },
}
```

### next(값): 제너레이터에 값 돌려보내기

`yield`는 값을 내보내는 동시에 **식**이다. 다음 `next(x)`에 넘긴 `x`가 멈춰 있던 `yield` 식 전체의 결과가 된다.

```javascript
function* calc(start) {
  const a = yield start + 1 // 첫 next()는 여기까지 실행하고 start + 1을 내보낸다
  const b = yield a + 10    // 두 번째 next(5)의 5가 a가 된다
  yield b * 2
}
const g = calc(2)
g.next(99) // { value: 3 }: 첫 next의 인자는 받을 yield가 없어서 버려진다
g.next(5)  // { value: 15 }: a = 5
g.next(10) // { value: 20 }: b = 10. 앞에서 내보낸 a + 10과 상관없이 yield 식 전체가 10이 된다
```

바깥 코드는 `next(x)`를 바로 부르지 않아도 된다. 제너레이터는 멈춘 채 기다리므로 `setTimeout(() => g.next(5), 1000)`처럼 나중에 값을 넣어도 된다. 이 양방향 통신이 async/await 이전에 co 같은 라이브러리가 "Promise를 yield하고 결과를 next로 돌려받는" 방식으로 비동기를 동기처럼 쓰던 원리다. 지금은 [[async-await|async/await]]가 같은 일을 언어 차원에서 한다.

### return()과 throw(): 바깥에서 끝내거나 에러 넣기

| 메서드 | 동작 |
| --- | --- |
| `gen.next(x)` | 멈춘 `yield` 식의 값을 `x`로 하고 다음 `yield`까지 실행한다 |
| `gen.return(v)` | 멈춘 `yield` 자리에서 `return v`가 일어난 것처럼 끝낸다 → `{ value: v, done: true }`. `try...finally`가 있으면 `finally`는 실행된다 |
| `gen.throw(err)` | 멈춘 `yield` 자리에서 `err`가 던져진다. 제너레이터 안의 `try...catch`가 잡으면 계속 실행하고, 못 잡으면 `gen.throw()`를 부른 바깥으로 에러가 나온다 |

```javascript
function* ask() {
  try {
    const answer = yield '2 + 2 = ?'
  } catch (e) {
    console.log('제너레이터 안에서 잡음:', e.message)
  }
}
const g = ask()
g.next()                          // 첫 yield까지 실행
g.throw(new Error('답을 못 찾음')) // yield 줄에서 에러가 난다
```

`for...of`를 `break`·`return`·예외로 중간에 빠져나오면 이터레이터의 `return()`이 자동으로 불린다. 그래서 제너레이터 안의 `finally`에 둔 정리 코드(연결 닫기 등)가 실행된다.

### yield*: 다른 이터러블에 위임

`yield* iterable`은 그 이터러블의 값을 하나씩 대신 내보낸다. 이것을 제너레이터 컴포지션이라고 한다. 안쪽 결과를 배열에 모았다가 합치는 대신 흐름 그대로 이어 붙이므로 중간 결과용 메모리가 들지 않는다. 제너레이터를 조합하거나 트리를 재귀로 펼칠 때 쓰고, 안쪽 제너레이터가 `return`한 값은 `yield*` 식 자체의 값이 된다.

```javascript
function* inner() { yield 2; yield 3 }
function* outer() {
  yield 1
  yield* inner()   // 2, 3
  yield* [4, 5]    // 배열도 이터러블이다
}
[...outer()] // [1, 2, 3, 4, 5]
```

## 게으른 평가와 무한 수열

제너레이터는 값을 **요청받을 때 하나씩** 만든다(lazy). 그래서 끝이 없는 수열도 표현할 수 있고, 필요한 만큼만 꺼내면 된다. 무한 제너레이터를 spread나 `Array.from`에 그대로 넣으면 끝나지 않으니 개수를 제한한다.

```javascript
function* ids() {
  let id = 1
  while (true) yield id++
}
const nextId = ids()
nextId.next().value // 1
nextId.next().value // 2
```

### 이터레이터 헬퍼 (ES2025)

배열에만 있던 `map`·`filter` 같은 메서드를 **이터레이터에 직접** 쓸 수 있다. 중간 배열을 만들지 않고 게으르게 동작해 무한 수열에도 안전하다. Baseline 2025(2025년 3월부터 주요 브라우저 최신판에서 지원)라 오래된 브라우저를 지원해야 하면 폴리필을 넣는다.

| 메서드 | 반환 | 하는 일 |
| --- | --- | --- |
| `map`, `filter`, `flatMap` | 새 이터레이터(게으름) | 값 변환·거르기 |
| `take(n)`, `drop(n)` | 새 이터레이터(게으름) | 앞에서 n개만 / n개 건너뛰기 |
| `toArray()` | 배열 | 남은 값을 모두 꺼낸다 |
| `reduce`, `some`, `every`, `find`, `forEach` | 값 | 끝까지(또는 답이 정해질 때까지) 소비 |
| `Iterator.from(x)` | 이터레이터 | iterable이나 `next()`만 있는 객체를 헬퍼가 붙은 이터레이터로 감싼다 |

```javascript
ids().filter((n) => n % 2 === 0).map((n) => n * 10).take(3).toArray() // [20, 40, 60]
new Map([['a', 1], ['b', 2]]).values().reduce((a, b) => a + b)        // 3
```

## 비동기 이터레이션

`next()`가 `{ value, done }`의 **Promise**를 돌려주면 비동기 이터레이터다. 데이터가 네트워크로 조금씩, 시간 간격을 두고 들어올 때 쓴다.

| | 동기 | 비동기 |
| --- | --- | --- |
| 이터레이터를 주는 메서드 | `[Symbol.iterator]()` | `[Symbol.asyncIterator]()` |
| `next()`의 반환 | `{ value, done }` | `{ value, done }`을 감싼 Promise |
| 제너레이터 선언 | `function*`, 메서드는 `*name()` | `async function*`, 메서드는 `async *name()` |
| 소비 | `for...of`, spread, 구조 분해 | `for await...of` (async 함수 안이나 모듈 최상위), `await gen.next()` |

- `next()`가 꼭 `async` 메서드일 필요는 없다. Promise만 돌려주면 된다. `async`로 쓰면 안에서 `await`를 쓸 수 있어 편하다.
- spread `[...x]`와 그냥 `for...of`는 `Symbol.iterator`만 찾으므로 비동기 이터러블에 쓰면 `TypeError`다. 배열로 모으려면 `await Array.fromAsync(x)`(Baseline 2024)를 쓴다.
- `for await...of`는 동기 이터러블도 받는다. 원소가 Promise면 하나씩 기다리며 순서대로 꺼낸다.

페이지네이션 API를 끝까지 읽는 것이 대표적인 쓰임이다. 다음 페이지 URL을 따라가는 로직을 제너레이터 안에 숨기면 쓰는 쪽은 원소를 하나씩 받기만 한다.

```javascript
async function* pages(url) {
  while (url) {
    const res = await fetch(url)
    const { items, next } = await res.json()
    yield items
    url = next
  }
}
for await (const items of pages('/api/posts')) render(items)
```

중간에 `break`하면 더 이상 다음 페이지를 요청하지 않는다. 값을 요청받을 때만 만드는 게으른 성질이 비동기에서도 그대로다. 큰 파일 업로드·다운로드처럼 데이터를 변환하며 다른 곳으로 흘려보내야 하면 브라우저의 Streams API(`ReadableStream` 등)를 함께 쓴다.

## 정리

- 이터러블은 `[Symbol.iterator]()`로 이터레이터를 주고, 이터레이터는 `next()`로 `{ value, done }`을 준다. `for...of`·spread·구조 분해가 모두 이 약속을 쓴다.
- 배열·문자열·Map·Set은 이터러블이고 일반 객체는 아니다.
- 제너레이터 함수는 호출하면 멈춘 상태의 이터레이터를 돌려주고, `yield`마다 멈췄다 `next()`로 이어 간다.
- `next(x)`의 `x`는 멈춰 있던 `yield` 식의 값이 된다. 첫 `next`의 인자는 버려진다.
- 값을 요청할 때만 만드는 게으른 평가 덕분에 무한 수열을 다룰 수 있고, ES2025 이터레이터 헬퍼로 배열 없이 변환한다.
- 시간을 두고 들어오는 데이터는 `async function*`과 `for await...of`로 다룬다. spread는 비동기 이터러블에 쓸 수 없고 `Array.fromAsync`로 모은다.

관련 노트: [[js-symbol|Symbol]], [[operators-and-control-flow|연산자와 제어문]], [[arrays-and-objects|배열·객체·문자열 다루기]], [[map-and-set|Map과 Set]], [[async-await|async/await와 비동기 에러 처리]], [[reactive-programming|반응형 프로그래밍과 RxJS]], [[callback-and-promise|콜백과 Promise]]
