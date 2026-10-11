---
title: "async/await와 비동기 에러 처리"
concept: "Async Await"
summary: "Promise를 동기 코드처럼 읽히게 해 주는 async/await 문법과 try/catch 에러 처리, 실무에서 주의할 점."
tags: ["javascript", "async", "promise", "frontend"]
source: mixed
---

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

## await

- `await`는 `async` 함수 안에서만 쓸 수 있다(모듈 최상위의 top-level await는 예외). 일반 함수에서 쓰면 SyntaxError.
- Promise 앞에 `await`를 두면 그 Promise가 이행될 때까지 **함수 실행을 멈췄다가**, 이행값을 반환하고 다음 줄로 진행한다.
- 멈추는 것은 해당 async 함수뿐이고, 그동안 다른 코드(이벤트 처리 등)는 계속 실행된다.

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

## 에러 처리: try/catch

reject된 Promise를 `await`하면 그 자리에서 에러가 던져진다. 그래서 동기 코드와 똑같이 `try...catch`로 처리한다.

```javascript
async function load() {
  try {
    const user = await fetchUser()
    const posts = await fetchPosts(user.id) // 위에서 실패하면 실행되지 않음
    render(posts)
  } catch (error) {
    console.error(error) // try 블록 어디서 실패해도 여기로
  } finally {
    hideSpinner()
  }
}
```

## then 체이닝 vs async/await

같은 로직을 두 방식으로 쓰면 다음과 같다.

```javascript
// .then() 체이닝
fetchUser()
  .then((user) => fetchPosts(user.id))
  .then((posts) => render(posts))
  .catch((err) => console.error(err))

// async/await
async function load() {
  try {
    const user = await fetchUser()
    const posts = await fetchPosts(user.id)
    render(posts)
  } catch (err) {
    console.error(err)
  }
}
```

| | `.then()` / `.catch()` | `async` / `await` |
| --- | --- | --- |
| 가독성 | 단계가 많으면 체인이 길어지고 중첩되기 쉽다 | 위에서 아래로 동기 코드처럼 읽힌다 |
| 에러 처리 | `.catch()` | `try...catch` |
| 중간 값 재사용 | 스코프가 갈려 불편 | 변수로 자연스럽게 재사용 |

## 코드 리뷰에서 배운 것

- **둘 중 하나만 쓴다.** `await fetchX().then(...)`처럼 `then`을 써 놓고 앞에 `await`를 또 붙이면 동작은 하지만 의미 없이 섞인 코드다. 한 함수 안에서는 한 방식으로 통일한다.
- **에러를 콘솔에만 찍고 넘기지 않는다.** 개인 프로젝트에서는 `console.log(err)`로 충분할 수 있지만, 실제 서비스에서는 콘솔 로그는 아무도 보지 않고 지나간다. 에러를 다시 던지거나(`throw`), 사용자에게 메시지를 보여 주거나, 모니터링 도구로 보내서 빨리 발견하고 고칠 수 있게 한다. 로그를 남길 때도 `console.error`, 객체 구조를 보려면 `console.dir`처럼 목적에 맞는 메서드를 쓴다.
- **조건 비교는 명확하게.** 문자열 파라미터를 검사할 때 truthy/falsy에 기대기보다 의도를 드러내는 비교를 쓴다.

```javascript
if (newAccount !== '') {
  // 빈 문자열이 아닐 때만
}
```

## 핵심 정리

- `async` 함수는 항상 Promise를 반환하고, `await`는 Promise가 끝날 때까지 그 함수만 멈춘다.
- 독립적인 작업은 `Promise.all`로 병렬 실행한다. `await`를 줄줄이 쓰면 순차 실행이 된다.
- 에러는 `try...catch`로 잡고, 서비스 코드에서는 콘솔에만 남기지 않는다.
- `then`과 `await`를 한 흐름에 섞지 않는다.
