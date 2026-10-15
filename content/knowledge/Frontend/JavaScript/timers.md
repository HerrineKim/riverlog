---
title: "타이머: setTimeout과 setInterval"
concept: "Timers"
summary: "setTimeout은 한 번, setInterval은 반복해서 콜백을 예약한다. 예약은 비동기라 다음 줄이 먼저 돈다. 반환된 ID를 저장해야 clearTimeout·clearInterval로 취소할 수 있고, 지연 시간은 최소 대기일 뿐이다. 즉시 시작하는 interval, 재귀 setTimeout, Promise로 감싼 sleep, 애니메이션용 requestAnimationFrame, React에서의 정리까지."
tags: ["javascript", "frontend", "browser", "async"]
source: other
date: "2026-10-15"
sources: ["https://wesbos.com/javascript/07-logic-and-flow-control/intervals-and-timers", "https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout", "https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval", "https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers", "https://nodejs.org/api/timers.html"]
---

> Wes Bos의 「[Beginner JavaScript](https://wesbos.com/javascript)」 강의 노트를 바탕으로, MDN·HTML 표준·Node.js 문서로 확인해 재구성한 노트다.

## 두 가지 타이머

| 함수 | 하는 일 | 취소 |
| --- | --- | --- |
| `setTimeout(fn, ms, ...args)` | `ms` 밀리초 뒤에 `fn`을 **한 번** 실행 | `clearTimeout(id)` |
| `setInterval(fn, ms, ...args)` | `ms`마다 `fn`을 **반복** 실행 | `clearInterval(id)` |

둘 다 전역 함수다. 브라우저에서는 `window.setTimeout`이지만 `window.` 없이 쓰면 Node.js에서도 같은 코드가 돈다. 첫 인자는 **함수 자체**다. `setTimeout(buzzer, 500)`이지 `setTimeout(buzzer(), 500)`이 아니다. 후자는 지금 바로 호출하고, 그 반환값을 예약한다.

## 예약은 기다리지 않는다

```javascript
console.log('Starting')
setTimeout(() => console.log('Buzz'), 500)
console.log('Finishing')
// Starting → Finishing → (0.5초 뒤) Buzz
```

`setTimeout`은 "500ms 뒤에 이 함수를 불러 달라"고 맡겨 두고 곧바로 다음 줄로 넘어간다. 나중에 다시 불리기 때문에 이런 함수를 **콜백(callback)** 이라 한다. 타이머 콜백은 태스크 큐에 들어가므로 `setTimeout(fn, 0)`도 현재 코드가 모두 끝난 뒤에 돈다. 그 과정은 [[event-loop|이벤트 루프]]에 있다.

**지연 시간은 "최소" 대기 시간이다.** 메인 스레드가 다른 일로 바쁘면 그만큼 늦어진다. 브라우저는 타이머를 5단계 넘게 중첩하면 최소 4ms로 늘리고, 백그라운드 탭의 타이머는 1초 이상으로 늦추기도 한다. 정확한 시각이 필요하면 `Date.now()`나 `performance.now()`로 실제 경과 시간을 재서 계산한다.

## 취소하려면 ID를 저장한다

두 함수는 타이머를 가리키는 **ID**를 반환한다. 브라우저에서는 양의 정수, Node.js에서는 `Timeout` 객체다. 이 값을 변수에 담아 두지 않으면 나중에 취소할 방법이 없다.

```javascript
const bombTimer = setTimeout(destroy, 5000)
window.addEventListener('click', () => clearTimeout(bombTimer)) // 5초 안에 클릭하면 취소

const poll = setInterval(checkStatus, 100)
setTimeout(() => clearInterval(poll), 3000) // 100ms마다 돌다가 3초 뒤 멈춤
```

이미 실행됐거나 없는 ID를 `clear…`에 넘겨도 에러는 나지 않는다. [[debounce-throttle|Debounce와 Throttle]]은 이 "예약하고, 필요하면 취소하고 다시 예약"을 응용한 기법이다.

## setInterval의 함정

### 1. 첫 실행이 즉시가 아니다

`setInterval(fn, 2000)`은 **2초 뒤에 처음** 실행된다. 바로 한 번 돌고 이후 반복하려면 직접 감싼다.

```javascript
function setImmediateInterval(fn, ms) {
  fn()
  return setInterval(fn, ms) // ID를 돌려줘야 바깥에서 취소할 수 있다
}
```

### 2. 작업이 간격보다 길어도 다음 회차가 예약된다

`setInterval`은 콜백이 끝났는지 신경 쓰지 않는다. 콜백 안에서 `fetch`처럼 끝나는 시간이 일정하지 않은 일을 하면 요청이 겹칠 수 있다. 이럴 때는 **재귀 `setTimeout`** 으로 "끝나고 나서 다음을 예약"한다.

```javascript
async function poll() {
  await checkStatus()
  timer = setTimeout(poll, 5000) // 이전 작업이 끝난 뒤 5초를 센다
}
```

## 기다렸다가 다음 줄로: Promise로 감싸기

`setTimeout`은 콜백 방식이라 "1초 기다린 뒤 이어서"를 순서대로 쓰기 어렵다. Promise로 감싸면 `await`로 쓸 수 있다.

```javascript
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

await wait(1000)
console.log('1초 뒤')
```

Node.js에는 같은 기능이 `import { setTimeout as wait } from 'node:timers/promises'`로 내장돼 있다. Promise와 `async`/`await`는 [[callback-and-promise|콜백과 Promise]], [[async-await|async/await]]에 있다.

## 애니메이션에는 requestAnimationFrame

화면을 움직이는 반복 작업에 `setInterval(fn, 16)`을 쓰면 화면 주사율과 어긋나 끊기고, 탭이 보이지 않을 때도 계속 돈다. **`requestAnimationFrame(fn)`** 은 브라우저가 다음 화면을 그리기 직전에 `fn`을 한 번 호출하고, 숨은 탭에서는 멈춘다. 반복하려면 `fn` 안에서 다시 요청하고, 취소는 `cancelAnimationFrame(id)`다. 단순한 이동·전환은 CSS `transition`·`animation`이 더 가볍다.

## React에서 쓸 때

컴포넌트가 사라진 뒤에도 타이머가 남으면, 없는 컴포넌트의 상태를 바꾸려 하거나 interval이 계속 쌓인다. `useEffect` 안에서 만들고 **정리 함수에서 취소**한다.

```jsx
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000)
  return () => clearInterval(id)
}, [])
```

정리 함수가 도는 시점은 [[lifecycle|컴포넌트 생명주기]]에 있다.

## 정리

- 한 번은 `setTimeout`, 반복은 `setInterval`. 첫 인자는 호출이 아니라 함수 참조다.
- 예약은 비동기다. 다음 줄이 먼저 돌고, 지연 시간은 최소 대기일 뿐이다.
- 취소하려면 반환된 ID를 저장한다. React에서는 정리 함수에서 반드시 취소한다.
- interval은 즉시 시작하지 않고, 작업이 겹칠 수 있다. 끝난 뒤 다음을 예약하려면 재귀 `setTimeout`.
- 기다림은 `await wait(ms)`, 애니메이션은 `requestAnimationFrame`.

관련 노트: [[event-loop|이벤트 루프]], [[debounce-throttle|Debounce와 Throttle]], [[callback-and-promise|콜백과 Promise]], [[async-await|async/await]], [[lifecycle|컴포넌트 생명주기]]
