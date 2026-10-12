---
title: "비동기 처리: 콜백과 Promise"
concept: "Promise"
summary: "언제 끝날지 모르는 비동기 작업의 결과를 다루는 방법으로서의 콜백 함수와 Promise."
tags: ["javascript", "async", "promise", "frontend"]
source: til
date: "2026-10-12"
sources: ["https://riverkim.kr/220"]
---

서버 요청, 타이머처럼 **언제 끝날지 모르는 작업**은 비동기로 실행된다. 비동기 작업을 기다리지 않고 다음 코드가 먼저 실행되기 때문에, 결과를 받아 쓰려면 별도의 방법이 필요하다. JavaScript는 이를 위해 **콜백 → Promise → async/await** 순서로 발전해 왔다. 이 노트는 앞의 두 가지를 다루고, async/await는 [다음 노트](/knowledge/dictionary/frontend/javascript/async-await)에서 다룬다.

## 문제: 비동기 결과는 바로 반환할 수 없다

```javascript
function getUser() {
  let value
  setTimeout(() => {
    value = { name: 'Kim', age: 18 } // 서버에서 데이터를 받는다고 가정
  }, 3000)
  return value
}

console.log(getUser()) // undefined
```

`setTimeout`의 콜백이 실행되기 전에 `return`이 먼저 일어나므로 `undefined`가 반환된다. 지연 시간이 0이어도 결과는 같다. 콜백은 현재 실행 중인 코드가 모두 끝난 뒤에야 실행되기 때문이다.

## 1. 콜백 함수

"작업이 끝나면 이 함수를 불러 줘"라고 **나중에 호출할 함수**를 인자로 넘긴다. Node.js 관례처럼 첫 인자로 에러, 두 번째로 결과를 받는 형태가 흔하다.

```javascript
function getUser(callback) {
  setTimeout(() => {
    callback(null, { name: 'Kim', age: 18 })
  }, 3000)
}

getUser((error, user) => {
  if (error) {
    // 요청은 언제든 실패할 수 있으므로 콜백마다 에러 처리가 필요하다
    return
  }
  console.log(user)
})
```

### 콜백 지옥(Callback Hell)

받아 온 결과로 또 비동기 작업을 하고, 그 결과로 또… 를 반복하면 들여쓰기가 계속 깊어진다.

```javascript
first((err, a) => {
  if (err) { /* 에러 처리 */ }
  second(a, (err, b) => {
    if (err) { /* 에러 처리 */ }
    third(b, (err, c) => {
      if (err) { /* 에러 처리 */ }
      console.log(c)
    })
  })
})
```

문제는 가독성만이 아니다.

- 에러 처리를 **단계마다** 반복해야 한다.
- 콜백을 넘기는 순간 **호출 시점의 제어권**이 넘겨받은 함수에 있다. 언제·몇 번 호출될지 우리가 통제할 수 없다.

## 2. Promise

**Promise**는 비동기 작업이 미래에 성공할지 실패할지, 그리고 그 결과값이 무엇인지를 나타내는 **객체**다(ES6). 결과를 "약속하는" 객체를 즉시 돌려받으므로, 그 객체를 변수에 담고 넘기고 조합할 수 있다.

### 생성

```javascript
const promise = new Promise((resolve, reject) => {
  // executor: new Promise 시점에 즉시 실행된다
  setTimeout(() => {
    const ok = true
    if (ok) resolve('Success')               // 성공 → 결과값 전달
    else reject(new Error('Request failed')) // 실패 → 사유 전달
  }, 3000)
})
```

`new Promise`에 넘기는 함수를 **executor**라고 하며, Promise가 만들어지는 즉시 실행된다. executor는 `resolve`와 `reject` 두 함수를 받아, 작업이 성공하면 `resolve(값)`, 실패하면 `reject(사유)`를 호출한다.

### 세 가지 상태

| 상태 | 의미 |
| --- | --- |
| pending(대기) | 아직 결과가 정해지지 않은 초기 상태 |
| fulfilled(이행) | 작업이 성공적으로 완료됨 |
| rejected(거부) | 작업이 실패함 |

한 번 fulfilled나 rejected가 되면(settled) **다시는 상태가 바뀌지 않는다.** 결과값은 Promise 내부에 있어 직접 꺼낼 수 없고, `then`/`catch`(또는 `await`)로만 접근한다.

### then, catch, finally

```javascript
promise
  .then((value) => console.log(value)) // fulfilled일 때, 결과값을 받음
  .catch((error) => console.log(error)) // rejected일 때, 사유를 받음
  .finally(() => console.log('끝'))     // 성공·실패와 관계없이 항상
```

- `then(onFulfilled, onRejected)`처럼 두 번째 인자로 실패도 처리할 수 있지만, 보통 `then`은 성공만, 실패는 `catch`로 처리한다.
- `finally`는 결과를 알 수 없다. 로딩 표시 해제처럼 "어쨌든 끝나면 할 일"에 쓴다.

### 체이닝

`then`과 `catch`는 **새 Promise를 반환**하므로 이어 붙일 수 있다.

- `then`에서 일반 값을 반환하면 그 값으로 이행된 Promise가 된다.
- `then`에서 Promise를 반환하면 그 Promise가 끝날 때까지 기다렸다가 결과를 다음 `then`에 넘긴다.
- 체인 어디서든 에러가 나면(reject 또는 `throw`) 중간 `then`들을 건너뛰고 가장 가까운 `catch`로 간다.
- `catch` 이후에도 체이닝을 이어 갈 수 있다.

```javascript
const delay = (value, ms) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

delay('Success', 3000)
  .then((value) => `${value} is`)                    // 값 반환
  .then((value) => delay(`${value} not`, 1000))      // Promise 반환 → 기다림
  .then((value) => console.log(`${value} impossible`)) // 약 4초 후 'Success is not impossible'
  .catch((error) => console.error(error))            // 위 어디서 실패해도 여기로
```

```javascript
delay('Success', 1000)
  .then(() => { throw new Error('Error!!') }) // 에러 발생
  .then(() => console.log('실행되지 않음'))      // 건너뜀
  .catch((error) => console.log(error.message)) // 'Error!!'
  .finally(() => console.log('chain end'))
```

### Promise.all

여러 비동기 작업을 **병렬로** 실행하고 모두 끝나기를 기다린다.

```javascript
const one = delay('one', 3000)
const two = delay('two', 2000)
const three = delay('three', 1000)

Promise.all([one, two, three]).then((values) => console.log(values))
// 약 3초 후 ['one', 'two', 'three']
```

- 결과 배열의 순서는 **완료 순서가 아니라 전달한 순서**를 따른다.
- 배열에 Promise가 아닌 값이 섞여 있어도 된다(그대로 결과에 들어감).
- 하나라도 reject되면 **즉시** 그 사유로 reject된다. 일부 실패해도 나머지 결과가 필요하면 `Promise.allSettled`를 쓴다.

언제 쓰면 좋은가:

| 상황 | 이유 |
| --- | --- |
| 여러 요청 중 하나라도 실패하면 전체가 의미 없을 때 | 하나가 실패하면 전체가 reject된다. 코드만 봐도 "이 요청들은 함께 성공해야 한다"는 의도가 드러난다 |
| 서로 의존하지 않는 요청을 빨리 끝내고 싶을 때 | 요청을 한꺼번에 보내 병렬로 처리하므로, 전체 시간이 가장 느린 요청 하나의 시간에 가까워진다 |
| 실패를 빨리 알고 싶을 때 | 순서대로 보내면 뒤쪽 요청의 실패는 앞 요청이 끝나야 드러난다. 동시에 보내면 가장 먼저 실패한 요청의 에러를 바로 받는다 |

## Promise의 진짜 의미

Promise의 장점을 흔히 "콜백 지옥 해결"로만 설명하지만, 더 본질적인 것은 두 가지다.

1. **반환값을 다시 쓸 수 있다.** 콜백 방식에서는 `return`이 의미가 없었지만, Promise는 결과를 담은 객체를 돌려주므로 변수에 담고 다른 함수에 넘기고 조합할 수 있다(함수 합성).
2. **에러가 동기 코드처럼 전파된다.** 콜백마다 하던 에러 처리를 `catch` 하나로 모을 수 있어, 동기 코드의 `try...catch`와 흐름이 비슷해진다.

즉 Promise는 **비동기 흐름을 동기 코드처럼 다룰 수 있게** 해 준다. 이 아이디어를 문법 수준으로 완성한 것이 async/await다.

## 핵심 정리

- 비동기 결과는 바로 `return`할 수 없다 → 콜백 또는 Promise로 받는다.
- 콜백은 중첩이 깊어지고, 에러 처리가 반복되고, 제어권을 넘겨준다.
- Promise = pending → fulfilled/rejected, 한 번 정해지면 불변. `then`/`catch`/`finally`로 체이닝.
- 병렬 실행은 `Promise.all`(하나라도 실패하면 실패), 전부의 결과가 필요하면 `Promise.allSettled`.
