---
title: "async/await와 비동기 에러 처리"
concept: "Async Await"
summary: "Promise를 동기 코드처럼 읽히게 해 주는 async/await 문법, 순차·동시 실행과 반복문 안의 await, try/catch·호출 시점 catch·고차 함수로 나누는 에러 처리, 실무에서 주의할 점."
tags: ["javascript", "async", "promise", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://wesbos.com/javascript/12-advanced-flow-control/70-async-await", "https://wesbos.com/javascript/12-advanced-flow-control/71-async-await-error-handling", "https://wesbos.com/javascript/12-advanced-flow-control/72-async-await-prompt-ui", "https://web.dev/learn/javascript/control-flow", "https://ko.javascript.info/async-await", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await", "https://joshua1988.github.io/web-development/javascript/js-async-await/"]
---

> 직접 정리한 내용에 Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)와 web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌의 「Control flow」 모듈, javascript.info(모던 JavaScript 튜토리얼)의 「async와 await」 글, 「[자바스크립트 async와 await](https://joshua1988.github.io/web-development/javascript/js-async-await/)」를 함께 참고해 재구성한 노트다.

`async`/`await`(ES2017)는 Promise 위에 얹은 문법이다. Promise의 결과를 `then`으로 받는 대신 **변수에 바로 담아** 동기 코드처럼 위에서 아래로 읽히게 작성할 수 있다. 원래 콜백이 만드는 깊은 들여쓰기(콜백 지옥)를 해결하려던 흐름의 마지막 단계다. Promise 자체는 [콜백과 Promise](/knowledge/dictionary/frontend/javascript/callback-and-promise) 노트 참고.

## async

함수 앞에 `async`를 붙이면 그 함수는 **항상 Promise를 반환**한다. 함수 안에서 `return`한 값은 그 Promise의 이행 값이 된다.

```javascript
async function getName() {
  return 'chan'
}

const result = getName()
console.log(result) // Promise {<fulfilled>: 'chan'}
result.then((name) => console.log(name)) // 'chan'
```

- Promise를 직접 `return`해도 결과는 같다. 함수 안에서 `throw`하면 그 에러로 **거부된** Promise가 된다.
- 함수 선언식뿐 아니라 함수 표현식(`async function () {}`), 화살표 함수(`async () => {}`), 객체·클래스 메서드(`async load() {}`)에도 붙인다.
- async가 아닌 일반 함수에서 async 함수의 결과가 필요하면 `await`를 쓸 수 없으므로 `load().then(...)`으로 받는다. async 함수도 결국 Promise를 돌려주는 평범한 함수다.

## await

- `await`는 `async` 함수 안에서만 쓸 수 있다. 일반 함수에서 쓰면 SyntaxError다. 예외는 **ES 모듈의 최상위**(top-level await)다([[es-modules|모듈]]). 일반 스크립트의 최상위에서는 여전히 안 되므로 `(async () => { … })()`처럼 즉시 실행 async 함수로 감싼다.
- Promise 앞에 `await`를 두면 그 Promise가 이행될 때까지 **함수 실행을 멈췄다가**, 이행값을 반환하고 다음 줄로 진행한다.
- 멈추는 것은 해당 async 함수뿐이고, 그동안 다른 코드(이벤트 처리 등)는 계속 실행된다.
- Promise가 **거부되면** `await` 식은 값을 돌려주지 않고 그 사유를 **예외로 던진다.** 그래서 아래 「에러 처리」처럼 `try/catch`로 받는다.
- Promise가 아닌 값을 `await`하면 이미 이행된 Promise로 감싼 것처럼 그 값이 그대로 나온다(`await 'text'`는 `'text'`). 다만 다음 줄은 마이크로태스크로 한 박자 늦게 실행된다.
- `then` 메서드만 있는 **thenable** 객체도 기다린다. `await`가 그 `then(resolve, reject)`를 불러 주고, 둘 중 하나가 호출될 때까지 기다린다([[callback-and-promise#thenable|thenable]]).

```javascript
const delay = (value, ms) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

async function run() {
  const result = await delay('Done!!', 2000) // 2초 기다림
  console.log(result)                         // 'Done!!'
}
run()
```

### 순차 실행 vs 병렬 실행

`await`를 줄마다 쓰면 앞 작업이 끝나야 다음 작업이 **시작**된다. 서로 의존하지 않는 작업이라면 먼저 모두 시작해 두고 나중에 기다려야 빠르다.

```javascript
async function sequential() {
  const a = await delay('a', 3000) // 3초
  const b = await delay('b', 1000) // 그 다음 1초 → 총 4초
}

async function parallel() {
  const pa = delay('a', 3000) // 둘 다 바로 시작
  const pb = delay('b', 1000)
  const a = await pa
  const b = await pb          // 총 약 3초
}

async function parallelAll() {
  const [a, b] = await Promise.all([delay('a', 3000), delay('b', 1000)]) // 약 3초
}
```

`Promise.all`을 쓰기 좋은 상황과 `allSettled`·`race`·`any`의 차이는 [[callback-and-promise#여러 Promise 조합하기|콜백과 Promise]]에 있다.

### 반복문 안의 await

배열을 돌며 비동기 작업을 할 때는 반복 방식에 따라 결과가 달라진다.

| 방식 | 동작 | 쓰는 곳 |
| --- | --- | --- |
| `for...of` + `await` | 하나가 끝나야 다음을 시작한다(**순차**) | 앞 결과가 다음에 필요하거나, 질문을 하나씩 띄우는 것처럼 순서가 중요할 때 |
| `await Promise.all(arr.map(async ...))` | 모두 한꺼번에 시작하고 함께 기다린다(**동시**) | 서로 독립적인 요청 |
| `arr.forEach(async ...)` | 콜백마다 Promise를 만들고 **아무도 기다리지 않는다** | 쓰지 않는다. 바깥 함수는 작업이 끝나기 전에 다음 줄로 넘어가고, 거부도 잡히지 않는다 |

```javascript
async function askMany(questions) {
  const answers = []
  for (const question of questions) {
    answers.push(await ask(question)) // 하나씩 차례로
  }
  return answers
}

const users = await Promise.all(ids.map((id) => fetchUser(id))) // 동시에
```

`forEach`·`map`·`filter`·`reduce`는 콜백이 반환한 Promise를 기다리지 않는다. 순차가 필요하면 `for...of`, 동시가 필요하면 `map` + `Promise.all`로 바꾼다. 요청 수가 많으면 동시에 너무 많이 보내지 않도록 몇 개씩 끊어서 보낸다.

## 에러 처리

reject된 Promise를 `await`하면 그 자리에서 에러가 던져진다. 잡는 위치에 따라 네 가지 방법이 있다.

| 방법 | 형태 | 어울리는 곳 |
| --- | --- | --- |
| `try...catch` | 함수 안에서 감싼다 | 여러 `await`를 한 번에 묶어 처리, `finally`로 정리 작업 |
| 선언하는 곳에서 `.catch` | `await fetchX().catch(handleError)` | 그 호출 하나만 따로 처리(예: 특정 모달 띄우기). 실패하면 `catch`의 반환값(여기서는 `undefined`)을 받고 계속 진행한다 |
| 호출하는 곳에서 `.catch` | `load().catch(handleError)` | 함수 본문은 성공 경로만 쓰고, 부르는 쪽이 처리를 정한다. async 함수는 항상 Promise를 반환하므로 가능하다 |
| 고차 함수로 감싸기 | `const safeLoad = withErrorHandler(load, handleError)` | 같은 처리를 수십 곳에서 반복할 때. Express 라우트 핸들러를 감싸는 패턴이 대표적이다 |

```javascript
async function load() {
  try {
    const user = await fetchUser()
    const posts = await fetchPosts(user.id) // 위에서 실패하면 실행되지 않음
    render(posts)
  } catch (error) {
    showError(error) // try 블록 어디서 실패해도 여기로
  } finally {
    hideSpinner()
  }
}

// 고차 함수: 원래 함수에 catch를 붙인 새 함수를 돌려준다
const withErrorHandler = (fn, onError) => (...args) => fn(...args).catch(onError)
```

`try...catch`를 피하려고 `[error, data]` 튜플을 돌려주는 패턴도 있다(`await-to-js` 같은 작은 라이브러리, Go 스타일). `const [err, user] = await to(fetchUser())`처럼 쓰고 `if (err)`로 분기한다.

`try` 안에서 Promise를 **`return`만 하면** 그 Promise의 거부는 이 `catch`에 잡히지 않는다. 함수가 이미 빠져나간 뒤에 거부되기 때문이다. 이 함수 안에서 잡으려면 `return await fetchUser()`처럼 기다린 뒤 반환한다. `try` 밖에서는 `return await`와 `return`의 결과가 같다.

```javascript
async function a() {
  try { return fetchUser() }       // 거부돼도 여기 catch로 오지 않는다
  catch { return guestUser }
}
async function b() {
  try { return await fetchUser() } // 거부되면 catch로 온다
  catch { return guestUser }
}
```

`await Promise.all([...])`이 거부되면(하나라도 실패하면) 그 사유가 예외로 던져지므로 같은 `try...catch`로 잡는다.

어느 방법도 쓰지 않은 거부는 **처리되지 않은 거부(unhandled rejection)** 가 된다. 브라우저는 콘솔에 `Uncaught (in promise)`를 찍고 `unhandledrejection` 이벤트를 발생시킨다. 에러 모니터링 도구는 이 이벤트를 받아 수집한다.

## then 체이닝 vs async/await

위 `load`를 `then` 체이닝으로 쓰면 `fetchUser().then((user) => fetchPosts(user.id)).then(render).catch(showError)`가 된다.

| | `.then()` / `.catch()` | `async` / `await` |
| --- | --- | --- |
| 가독성 | 단계가 많으면 체인이 길어지고 중첩되기 쉽다 | 위에서 아래로 동기 코드처럼 읽힌다 |
| 에러 처리 | `.catch()` | `try...catch` 또는 호출하는 곳의 `.catch()` |
| 중간 값 재사용 | 스코프가 갈려 불편 | 변수로 자연스럽게 재사용 |

## 실무에서 지킬 것

- **둘 중 하나만 쓴다.** `await fetchX().then(...)`처럼 `then`을 써 놓고 앞에 `await`를 또 붙이면 동작은 하지만 의미 없이 섞인 코드다. 한 함수 안에서는 한 방식으로 통일한다.
- **에러를 콘솔에만 찍고 넘기지 않는다.** 실제 서비스에서 콘솔 로그는 아무도 보지 않고 지나간다. 에러를 다시 던지거나(`throw`), 사용자에게 메시지를 보여 주거나, 모니터링 도구로 보내서 빨리 발견하고 고칠 수 있게 한다. 로그를 남길 때도 `console.error`, 객체 구조를 보려면 `console.dir`처럼 목적에 맞는 메서드를 쓴다.

## 핵심 정리

- `async` 함수는 항상 Promise를 반환하고, `await`는 Promise가 끝날 때까지 그 함수만 멈춘다.
- 독립적인 작업은 `Promise.all`로 병렬 실행한다. `await`를 줄줄이 쓰면 순차 실행이 된다.
- 반복문 안의 `await`는 `for...of`(순차) 또는 `map` + `Promise.all`(동시)로 쓴다. `forEach`는 기다리지 않는다.
- 에러는 `try...catch`, 호출하는 곳의 `.catch`, 고차 함수 중 하나로 잡고, 서비스 코드에서는 콘솔에만 남기지 않는다.
- `then`과 `await`를 한 흐름에 섞지 않는다.

관련 노트: [[callback-and-promise|콜백과 Promise]], [[event-loop|이벤트 루프]], [[dart-language|Dart의 Future와 Stream]], [[js-error-handling|에러 처리: try...catch와 커스텀 에러]]
