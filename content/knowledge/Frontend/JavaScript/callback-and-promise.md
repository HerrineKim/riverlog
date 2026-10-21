---
title: "비동기 처리: 콜백과 Promise"
concept: "Promise"
summary: "언제 끝날지 모르는 비동기 작업의 결과를 다루는 콜백 함수(오류 우선 콜백)와 Promise. 상태와 핸들러 규칙, 체이닝과 에러 전파(암시적 try...catch, 다시 던지기, thenable), 처리되지 않은 거부, 콜백 API를 Promise로 감싸는 프로미스화(wait, promisify), all·allSettled·race·any·resolve·try로 여러 Promise를 조합하는 법."
tags: ["javascript", "async", "promise", "frontend"]
source: til
date: "2026-10-12"
sources: ["https://riverkim.kr/220", "https://wesbos.com/javascript/12-advanced-flow-control/67-promises", "https://wesbos.com/javascript/12-advanced-flow-control/68-promises-error-handling", "https://wesbos.com/javascript/12-advanced-flow-control/69-refactoring-callback-hell-to-promise-land", "https://ko.javascript.info/callbacks", "https://ko.javascript.info/promise-basics", "https://ko.javascript.info/promise-chaining", "https://ko.javascript.info/promise-error-handling", "https://ko.javascript.info/promise-api", "https://ko.javascript.info/promisify", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try", "https://developers.google.com/web/fundamentals/primers/promises?hl=ko", "https://web.dev/articles/promises", "https://joshua1988.github.io/web-development/javascript/promise-for-beginners/"]
---

> riverkim.kr에 쓴 글을 바탕으로, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)와 javascript.info(모던 JavaScript 튜토리얼)의 「콜백」, 「프라미스」, 「프라미스 체이닝」, 「프라미스와 에러 핸들링」, 「프라미스 API」, 「프라미스화」 글을 함께 참고해 재구성한 노트다. `then`의 두 번째 인자와 `catch`의 차이, 동시에 시작해 순서대로 보여 주는 패턴은 web.dev의 「[JavaScript Promise 소개](https://web.dev/articles/promises)」와 「[자바스크립트 Promise 쉽게 이해하기](https://joshua1988.github.io/web-development/javascript/promise-for-beginners/)」를 바탕으로 더했다.

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

"작업이 끝나면 이 함수를 불러 줘"라고 **나중에 호출할 함수**를 인자로 넘긴다. 첫 인자는 에러(성공이면 `null`), 두 번째부터 결과를 받는 형태가 흔하며, 이것을 **오류 우선 콜백(error-first callback)** 이라고 한다. Node.js API의 관례다.

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
- 호출하기 **전에** 결과로 무엇을 할지(콜백)를 준비해 둬야 하고, 결과를 받을 함수는 하나뿐이다.

단계마다 `step1`·`step2`처럼 이름 붙인 최상위 함수로 떼어 내면 중첩은 사라진다. 하지만 흐름이 여러 함수에 흩어져 읽는 눈이 이리저리 옮겨 다녀야 하고, 이 함수들은 그 흐름 밖에서 재사용되지도 않는다. 근본 해결은 Promise다.

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

- 둘 중 **처음 호출된 하나만** 효력이 있다. 이미 정해진 뒤의 `resolve`·`reject`는 조용히 무시된다.
- `resolve`·`reject`는 인자를 **하나만** 받는다. 여러 값을 넘기려면 객체나 배열로 묶는다.
- `reject`에는 어떤 값이든 넘길 수 있지만 `Error`(또는 그 하위 클래스) 객체를 넘긴다. 스택 추적이 남고 `catch`에서 `instanceof`로 종류를 가를 수 있다.
- 결과를 이미 알고 있으면 executor 안에서 바로 `resolve(123)`을 불러도 된다.

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

- `then(onFulfilled, onRejected)`처럼 두 번째 인자로 실패도 처리할 수 있지만, 보통 `then`은 성공만, 실패는 `catch`로 처리한다. `catch(f)`는 `then(null, f)`의 줄임이다. 이유는 범위다. **`then(f1, f2)`의 `f2`는 같은 `then`의 `f1`이 던진 에러를 잡지 못한다.** `then(f1).catch(f2)`는 `f1`을 포함해 앞 단계 어디서 난 에러든 잡는다.

```javascript
p.then(parse, handleError)          // parse가 throw하면 handleError는 모른다
p.then(parse).catch(handleError)    // parse의 에러도 잡는다
```
- `finally` 핸들러는 인자를 받지 않아 성공인지 실패인지 모른다. 로딩 표시 해제처럼 "어쨌든 끝나면 할 일"에 쓴다. 결과값이나 에러는 `finally`를 **그대로 통과해** 다음 `then`·`catch`로 간다(`finally` 안에서 에러를 던지면 그 에러로 바뀐다).
- 이미 settled된 Promise에 `then`을 달아도 핸들러는 실행된다. 구독하기 전에 결과가 나왔어도 놓치지 않는다. 다만 핸들러는 늘 **비동기로**, 현재 코드가 끝난 뒤 마이크로태스크로 실행된다([[event-loop|이벤트 루프]]).
- 한 Promise에 `then`을 여러 번 달 수 있다. 콜백은 하나만 넘길 수 있었지만 Promise는 결과를 받을 쪽을 몇 개든 붙인다.

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
  .catch((error) => console.error(error))            // 위 어디서 실패해도(throw 포함) 여기로, 사이의 then은 건너뜀
```

- 체인 끝에 `catch`가 하나도 없으면 실패가 어디에서도 처리되지 않고 콘솔에 `Uncaught (in promise)`가 찍힌다. 단계마다 `catch`를 달 필요는 없고 **체인 끝에 하나**면 된다. 에러 처리 함수를 따로 만들어 `.catch(handleError)`처럼 참조로 넘기면 여러 곳에서 재사용할 수 있다.

**체이닝과 "한 Promise에 then 여러 개"는 다르다.**

| 형태 | 동작 |
| --- | --- |
| `p.then(a).then(b).then(c)` | 체이닝. `a`의 반환값이 `b`로, `b`의 반환값이 `c`로 흘러간다 |
| `p.then(a); p.then(b); p.then(c)` | 같은 Promise를 셋이 따로 구독한다. 셋 모두 `p`의 결과를 받고 서로 값을 주고받지 않는다 |

`then` 안에서 다음 비동기 작업을 `loadNext().then(...)`처럼 다시 중첩하면 콜백 지옥이 돌아온다. 다음 작업의 Promise를 **`return`해서** 체인을 한 단계 깊이로 유지한다. 바깥 변수 여러 개를 함께 써야 해서 중첩이 편할 때도 있지만, 그때는 async/await가 더 읽기 쉽다.

비동기 일을 하는 함수는 **지금 쓸 데가 없어도 Promise를 반환**하게 만든다. 예를 들어 아바타를 3초 보여 주고 지우는 함수가 `setTimeout`만 걸고 끝나면, 호출한 쪽은 "사라진 뒤에" 무언가를 이어 붙일 방법이 없다. 지운 시점에 `resolve`하는 Promise를 돌려주면 체인을 언제든 늘릴 수 있다.

### thenable

`then` 메서드가 있는 객체를 **thenable**이라고 한다. `then` 핸들러가 thenable을 반환하거나 `await`·`Promise.resolve`에 thenable을 넘기면, JavaScript는 그 `then(resolve, reject)`를 불러 Promise처럼 기다린다. 오래된 Promise 라이브러리나 jQuery Deferred가 네이티브 Promise와 섞여 쓰일 수 있는 이유다.

## 3. Promise의 에러 처리

### 암시적 try...catch

executor와 모든 `then`·`catch`·`finally` 핸들러는 **보이지 않는 try...catch**로 감싸여 있다. 안에서 `throw`하거나 `undefinedFn()`처럼 프로그래밍 에러가 나도 프로그램이 죽지 않고 그 Promise가 거부되어 가장 가까운 `catch`로 간다.

```javascript
new Promise(() => { throw new Error('실패') }).catch(console.error)  // reject(new Error('실패'))와 같다
Promise.resolve().then(() => blabla()).catch(console.error)          // ReferenceError도 잡힌다
```

단, 이 try...catch는 **동기적으로** 실행되는 부분만 감싼다. executor 안의 `setTimeout` 콜백에서 던진 에러는 executor가 이미 끝난 뒤에 나므로 Promise를 거부하지 못하고 그냥 전역 에러가 된다. 비동기 콜백 안에서는 `throw` 대신 `reject`를 부른다.

### 다시 던지기와 복구

`catch`는 동기 코드의 `catch` 블록처럼 동작한다.

| `catch` 핸들러에서 | 이어지는 흐름 |
| --- | --- |
| 정상적으로 끝남(값을 반환하거나 아무것도 반환하지 않음) | 에러가 **처리된 것**으로 보고 다음 `then`이 실행된다 |
| 다시 `throw` | 다음 `catch`로 건너뛴다 |

```javascript
fetchUser()
  .catch((error) => {
    if (error instanceof ValidationError) return guestUser // 아는 에러는 복구
    throw error                                             // 모르는 에러는 위로 넘긴다
  })
  .then(render)
  .catch(reportToServer)
```

처리 방법을 아는 에러만 잡고, 나머지(대개 프로그래밍 실수)는 다시 던진다. 회복할 방법이 없으면 그 자리에서 `catch`를 달지 않아도 된다.

### 처리되지 않은 거부

어디서도 잡지 않은 거부는 **unhandled rejection**이 된다. 브라우저는 `window`에 `unhandledrejection` 이벤트를 발생시키고, 이벤트 객체의 `promise`와 `reason`으로 어떤 Promise가 왜 실패했는지 알려 준다. 대개 회복할 수 없으므로 사용자에게 알리고 에러를 서버로 보내는 데 쓴다. Node.js는 기본 설정에서 처리되지 않은 거부가 생기면 프로세스를 종료한다.

```javascript
window.addEventListener('unhandledrejection', (event) => {
  report(event.reason) // event.preventDefault()로 콘솔 경고를 막을 수도 있다
})
```

"처리되지 않았다"는 판정은 **마이크로태스크 큐가 빈 시점**에 내려진다. 그래서 `setTimeout`으로 나중에 `catch`를 달면 그 `catch`도 실행되지만, 그 전에 이미 `unhandledrejection`이 발생한다([[event-loop|이벤트 루프]]).

## 4. 콜백 API를 Promise로 감싸기(프로미스화)

콜백·이벤트 기반 API는 `new Promise`로 한 번 감싸 두면 체이닝과 `await`로 다룰 수 있다. 이것을 **프로미스화(promisify)** 라고 한다. 가장 흔한 예는 타이머를 감싼 `wait`다.

```javascript
const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))

wait(2000)
  .then(() => el.classList.add('circle'))
  .then(() => wait(500))
  .then(() => el.classList.add('red')) // 중첩 없이 한 단계 깊이로 순서를 표현한다
```

사용자 입력처럼 **언제 끝날지 사용자가 정하는 일**도 같은 방식으로 감싼다. 모달을 띄우는 함수가 Promise를 반환하고, 폼의 `submit` 이벤트에서 `resolve(입력값)`, 취소 버튼에서 `resolve(null)`을 호출하면 호출하는 쪽은 `const answer = await ask(question)` 한 줄로 답을 받는다. `resolve`·`reject`를 executor 밖에서 호출해야 하면 `Promise.withResolvers()`(ES2024)가 `{ promise, resolve, reject }`를 한꺼번에 돌려준다.

오류 우선 콜백을 받는 함수가 많으면 감싸는 일을 헬퍼로 만든다. 콜백 자리에 "에러면 `reject`, 아니면 `resolve`"하는 콜백을 끼워 원래 함수를 부르는 래퍼를 돌려주면 된다.

```javascript
const promisify = (fn) => function (...args) {
  return new Promise((resolve, reject) => {
    fn.call(this, ...args, (err, result) => (err ? reject(err) : resolve(result)))
  })
}
const loadScriptAsync = promisify(loadScript) // loadScript(src, (err, script) => …)
await loadScriptAsync('/a.js')
```

- 콜백이 결과를 여러 개 넘기면(`cb(err, a, b)`) rest로 받아 배열로 `resolve`하는 옵션을 둔다. 에러 인자가 없는 콜백처럼 모양이 다르면 헬퍼를 쓰지 말고 직접 감싼다.
- Node.js에는 내장 `util.promisify`가 있고, 대부분의 Node API에는 이미 `fs/promises`처럼 Promise 판이 있다.
- **한 번만 호출되는 콜백에만** 쓴다. Promise는 결과를 하나만 가지므로, 여러 번 호출되는 콜백(이벤트 리스너, 진행률 콜백)을 감싸면 두 번째부터는 무시된다. 그런 흐름은 이벤트·스트림·비동기 이터레이터로 다룬다([[iterators-and-generators|이터레이터와 제너레이터]]).

## 여러 Promise 조합하기

여러 작업을 **동시에(concurrently)** 시작해 두고 결과를 하나의 Promise로 모으는 정적 메서드가 네 가지 있다.

| 메서드 | 이행 조건 | 거부 조건 | 쓰는 곳 |
| --- | --- | --- | --- |
| `Promise.all` | 모두 이행 → 결과 배열 | 하나라도 거부되면 **즉시** 그 사유로 | 모두 성공해야 의미 있는 요청 묶음 |
| `Promise.allSettled` (ES2020) | 모두 끝나면 항상 → `{ status, value \| reason }` 배열 | 거부되지 않음 | 일부가 실패해도 나머지 결과가 필요할 때 |
| `Promise.race` | 가장 먼저 **끝난** 것이 이행이면 | 가장 먼저 끝난 것이 거부면 | 타임아웃 경합 |
| `Promise.any` (ES2021) | 가장 먼저 **이행된** 것 | 모두 거부되면 `AggregateError` | 여러 미러 중 가장 빠른 응답 |

```javascript
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]) // 구조 분해로 바로 꺼낸다

const results = await Promise.allSettled([p1, p2])
const ok = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
```

- 결과 배열의 순서는 **완료 순서가 아니라 전달한 순서**를 따른다. Promise가 아닌 값이 섞여 있어도 그대로 결과에 들어간다.
- 동시에 보내면 전체 시간이 가장 느린 요청 하나의 시간에 가까워지고, 실패도 가장 먼저 실패한 요청에서 바로 드러난다.
- `all`이 거부돼도 나머지 작업이 취소되는 것은 아니다. 결과만 버려진다. Promise에는 **취소라는 개념이 없다.** 실제로 요청을 멈추려면 `AbortController`를 쓴다([[ajax|AJAX와 HTTP 요청]]).
- **동시에 시작하고, 순서대로 보여 준다.** 글의 장(chapter)처럼 순서가 중요한 목록은 요청을 한꺼번에 보내 두고 결과를 순서대로 기다리며 붙이면, 전체 시간은 줄고 앞부분은 먼저 보인다.

  ```javascript
  const pending = urls.map((url) => fetch(url).then((r) => r.json())) // 모두 동시에 출발
  for (const p of pending) render(await p)                             // 도착 순서와 무관하게 순서대로 표시
  ```

  기다리는 동안 뒤쪽 요청이 먼저 실패하면 아직 아무도 그 Promise를 기다리지 않아 「처리되지 않은 거부」 경고가 날 수 있다. 실패를 확실히 다뤄야 하면 각 Promise에 `.catch`를 미리 달거나 `Promise.allSettled`로 모은다.

- 인자는 배열뿐 아니라 **이터러블**이면 된다. 데이터 배열을 `map`으로 Promise 배열로 바꿔 넘기는 `Promise.all(ids.map(fetchUser))`가 가장 흔한 형태다.

### 이미 정해진 Promise 만들기

| 메서드 | 하는 일 | 쓰는 곳 |
| --- | --- | --- |
| `Promise.resolve(value)` | `value`로 이행된 Promise. `value`가 Promise면 그대로, thenable이면 따라간다 | 캐시에 값이 있으면 `Promise.resolve(cached)`를 돌려줘 **반환 타입을 늘 Promise로** 맞출 때 |
| `Promise.reject(error)` | `error`로 거부된 Promise | 테스트, 조건 검사 후 바로 실패를 돌려줄 때 |
| `Promise.try(fn, ...args)` (ES2025) | `fn`을 바로 호출하고 결과를 Promise로 감싼다. `fn`이 **동기적으로 throw해도** 거부된 Promise가 된다 | 동기 함수일지 async 함수일지 모르는 콜백을 한 체인으로 다룰 때. Baseline 2025라 오래된 브라우저는 폴리필이 필요하다 |

async 함수 안에서는 `return cached`, `throw error`가 같은 일을 하므로 `Promise.resolve`·`reject`를 직접 쓸 일이 줄었다.

## Promise의 진짜 의미

Promise의 장점을 흔히 "콜백 지옥 해결"로만 설명하지만, 더 본질적인 것은 두 가지다.

1. **반환값을 다시 쓸 수 있다.** 콜백 방식에서는 `return`이 의미가 없었지만, Promise는 결과를 담은 객체를 돌려주므로 변수에 담고 다른 함수에 넘기고 조합할 수 있다(함수 합성).
2. **에러가 동기 코드처럼 전파된다.** 콜백마다 하던 에러 처리를 `catch` 하나로 모을 수 있어, 동기 코드의 `try...catch`와 흐름이 비슷해진다.

즉 Promise는 **비동기 흐름을 동기 코드처럼 다룰 수 있게** 해 준다. 이 아이디어를 문법 수준으로 완성한 것이 async/await다.

## 핵심 정리

- 비동기 결과는 바로 `return`할 수 없다 → 콜백 또는 Promise로 받는다.
- 콜백은 중첩이 깊어지고, 에러 처리가 반복되고, 제어권을 넘겨준다.
- Promise = pending → fulfilled/rejected, 한 번 정해지면 불변. `then`/`catch`/`finally`로 체이닝.
- 핸들러 안의 `throw`와 프로그래밍 에러는 거부로 바뀐다(암시적 try...catch). `catch`가 정상 종료하면 체인은 복구되고, 다시 던지면 다음 `catch`로 간다.
- 콜백·이벤트 API는 `new Promise`로 감싸 두면(`wait`, `promisify`처럼) 체이닝과 `await`로 다룰 수 있다. 단, 한 번만 호출되는 콜백만.
- 동시 실행은 `Promise.all`(하나라도 실패하면 실패), 전부의 결과가 필요하면 `allSettled`, 먼저 끝나는 하나는 `race`·`any`.

관련 노트: [[async-await|async/await와 비동기 에러 처리]], [[event-loop|이벤트 루프]], [[ajax|AJAX와 HTTP 요청]], [[iterators-and-generators|이터레이터와 제너레이터]]
