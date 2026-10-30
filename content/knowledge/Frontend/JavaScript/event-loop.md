---
title: "브라우저에서 JavaScript가 동작하는 원리: 이벤트 루프"
concept: "Event Loop"
summary: "싱글 스레드인 JavaScript가 렌더링과 나눠 쓰는 메인 스레드, 실행 컨텍스트가 쌓이는 콜 스택, Web API, 태스크·마이크로태스크 큐, 이벤트 루프의 협업으로 화면을 멈추지 않고 비동기 작업을 처리하는 방식. 태스크 하나 → 마이크로태스크 전부 → 렌더링 순서의 한 바퀴, queueMicrotask, 긴 작업 쪼개기·진행률 표시·이벤트 처리 뒤로 미루기, 무거운 일을 메인 스레드 밖으로 빼는 Web Worker."
tags: ["javascript", "async", "browser", "frontend"]
source: mixed
date: "2026-10-21"
sources: ["https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/event-loop.md", "https://riverkim.kr/324", "https://riverkim.kr/114", "https://web.dev/learn/javascript/appendix", "https://ko.javascript.info/event-loop", "https://ko.javascript.info/microtask-queue", "https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask", "https://engineering.linecorp.com/ko/blog/dont-block-the-event-loop/", "https://www.youtube.com/watch?v=8aGhZQkoFbQ", "http://latentflip.com/loupe/", "https://github.com/lydiahallie/javascript-questions"]
---

> riverkim.kr에 쓴 글들을 다시 정리하고, web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌 부록의 메인 스레드·콜 스택 설명과 javascript.info(모던 JavaScript 튜토리얼)의 「이벤트 루프와 매크로태스크, 마이크로태스크」, 「마이크로태스크」 글로 보강한 노트다. 작업 쪼개기와 취소는 LINE 엔지니어링 블로그의 「[매끄러운 경험을 위한 JavaScript 비동기 처리](https://engineering.linecorp.com/ko/blog/dont-block-the-event-loop/)」를 바탕으로 더했다. 「[Must-Know-About-Frontend: 이벤트 루프](https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/event-loop.md)」의 내용을 더해 보강했다.
> 헷갈리기 쉬운 출력 문제는 Lydia Hallie의 「[JavaScript Questions](https://github.com/lydiahallie/javascript-questions)」에서 개념별로 뽑아 보강했다.

## 싱글 스레드와 블로킹

JavaScript 엔진(V8 등)은 **단일 스레드**로 코드를 실행한다. 한 순간에 실행 흐름이 하나뿐이고, 호출된 함수는 **콜 스택(Call Stack)** 에 쌓였다가 위에서부터 하나씩 처리된다.

이 실행 흐름을 **메인 스레드(main thread)** 라고 한다. 브라우저에서 메인 스레드는 JavaScript만의 것이 아니다. HTML 파싱, 스타일 계산과 레이아웃, 화면 다시 그리기, 텍스트 선택이나 폼 입력 같은 사용자 상호작용 처리도 같은 스레드에서 차례를 기다린다.

이 구조에서 오래 걸리는 작업이 스택을 차지하면 그동안 다른 일을 할 수 없다. 렌더링과 클릭 처리도 같은 흐름을 기다리므로 **화면이 멈춘다(blocking)**.

### 콜 스택과 실행 컨텍스트

콜 스택에 쌓이는 단위는 **실행 컨텍스트(execution context)** 다. 실행 컨텍스트는 지금 실행 중인 코드가 쓸 수 있는 변수·함수(스코프)와 `this` 값을 담는다.

```text
스크립트 시작 → [전역 컨텍스트]
a() 호출      → [전역] [a]          ← 전역은 멈추고 a를 실행
a 안에서 b()  → [전역] [a] [b]      ← 맨 위만 실행된다
b 끝          → [전역] [a]          ← a가 멈춘 곳에서 이어서
a 끝          → [전역]
```

스택은 **나중에 들어온 것이 먼저 나간다(LIFO)**. 함수가 끝나면 그 컨텍스트가 빠지고 바로 아래 컨텍스트가 이어서 실행된다. 재귀가 끝나지 않으면 컨텍스트가 계속 쌓여 `RangeError: Maximum call stack size exceeded`가 난다. 스코프 체인이 정의 위치로, `this`가 호출 방식으로 정해지는 것도 컨텍스트를 만들 때의 규칙이다([[scope-and-closures|스코프와 클로저]], [[functions|함수와 this]]).

그래서 브라우저는 엔진 바깥에 시간이 걸리는 일을 대신 맡아 주는 실행 환경을 둔다. **JS가 직접 병렬로 일하는 것이 아니라, 브라우저에 일을 맡기고 자기는 다음 코드를 계속 실행한다.**

## 구성 요소

| 구성 요소 | 하는 일 | 예 |
| --- | --- | --- |
| 콜 스택 | 동기 코드를 쌓고 하나씩 실행 | 함수 호출 |
| Web APIs | 시간이 걸리거나 이벤트 기반인 작업을 브라우저가 처리 | `setTimeout`, `fetch`/XHR, DOM 이벤트 감지, 스토리지 |
| 큐(대기열) | 끝난 비동기 작업의 후속 콜백이 줄 서는 곳 | 타이머 콜백, `then` 콜백 |
| 이벤트 루프 | 스택이 비면 큐에서 작업을 꺼내 스택에 올리는 조율자 | - |

## 흐름

```text
JS 코드 실행 (콜 스택)
  └─ 비동기 API 호출 ──▶ Web APIs가 작업 진행 (타이머, 네트워크, 이벤트)
                              │ 완료
                              ▼
                        큐에 콜백 등록
                              │
이벤트 루프: ① 콜 스택이 비었나?  ② 비었으면 큐에서 하나 꺼내 콜 스택으로
```

이벤트 루프는 이 두 가지 확인을 계속 반복한다. 그래서 `setTimeout(fn, 0)`이라도 `fn`은 **현재 실행 중인 코드가 모두 끝난 뒤**에 실행된다.

## 큐는 하나가 아니다

| 큐 | 들어가는 작업 | 우선순위 |
| --- | --- | --- |
| 마이크로태스크 큐 | `Promise.then`/`catch`/`finally` 콜백, `await` 이후 코드, `queueMicrotask(fn)` | 높음: 스택이 빌 때마다 **전부** 비운다 |
| 태스크(매크로태스크) 큐 | `<script>` 실행 자체, `setTimeout`·`setInterval` 콜백, DOM 이벤트 핸들러(클릭·`mousemove` 등) | 낮음: 마이크로태스크가 다 끝난 뒤 하나씩 |

그래서 실행 순서는 작성 순서가 아니라 **어느 큐에 들어갔는지**로 정해진다.

```javascript
console.log('1')
setTimeout(() => console.log('2'), 0)       // 태스크 큐
Promise.resolve().then(() => console.log('3')) // 마이크로태스크 큐
console.log('4')
// 1 → 4 → 3 → 2
```

이미 이행된 Promise의 `then`도 즉시 실행되지 않는다. 핸들러는 **언제나** 마이크로태스크 큐를 거치므로 현재 코드가 끝난 뒤에 돈다. 어떤 코드를 핸들러 뒤에 실행하고 싶으면 체인에 `.then`을 하나 더 붙인다. 명세에서는 이 큐를 PromiseJobs라고 부르고, V8을 비롯한 엔진에서 마이크로태스크 큐라고 부른다.

`then` 체인은 **단계마다 마이크로태스크 하나**를 쓰고, `await` 뒤의 코드도 마이크로태스크 하나로 이어진다. 그래서 같은 Promise를 기다려도 체인이 긴 쪽이 늦게 끝나고, `await`가 풀린 뒤의 동기 코드는 그 자리에서 이어 실행된다.

```javascript
const p = Promise.resolve('P')

function viaThen() {
  setTimeout(() => console.log('timeout 1'))
  p.then((v) => v).then((v) => console.log(`${v} then`)) // 두 단계
  console.log('sync 1')
}
async function viaAwait() {
  const v = await p                                      // 한 단계
  console.log(`${v} await`)
  setTimeout(() => console.log('timeout 2'))
  console.log('sync 2')
}
viaThen()
viaAwait()
// sync 1 → P await → sync 2 → P then → timeout 1 → timeout 2
```

### 한 바퀴의 순서

```text
┌─▶ ① 태스크 큐에서 가장 오래된 태스크 하나를 꺼내 실행한다 (예: 스크립트, 클릭 핸들러)
│   ② 마이크로태스크 큐가 빌 때까지 전부 실행한다
│      (실행 중에 새로 추가된 마이크로태스크도 이번에 처리한다)
│   ③ 렌더링할 것이 있으면 화면을 그린다
│   ④ 태스크 큐가 비었으면 새 태스크가 올 때까지 잠든다 (CPU를 거의 쓰지 않는다)
└── 반복
```

여기서 두 가지가 나온다.

- **태스크 하나가 실행되는 동안에는 렌더링이 일어나지 않는다.** 함수 안에서 DOM을 백 번 바꿔도 사용자는 마지막 상태만 본다. 덕분에 중간 상태가 깜빡이지 않지만, 태스크가 길면 그동안 클릭도 화면도 멈춘다. 너무 길면 브라우저가 "페이지 응답 없음" 경고를 띄운다.
- **마이크로태스크는 렌더링과 다음 이벤트보다 먼저 전부 실행된다.** 그래서 모든 마이크로태스크는 마우스 좌표나 네트워크 응답이 바뀌지 않은 같은 환경에서 돈다. 반대로 마이크로태스크가 계속 새 마이크로태스크를 만들면 태스크도 렌더링도 영영 차례가 오지 않는다.

### 원하는 큐에 직접 넣기

| 목적 | 방법 |
| --- | --- |
| 현재 코드가 끝난 직후, 렌더링·다음 이벤트 **전에** 실행 | `queueMicrotask(fn)` (또는 `Promise.resolve().then(fn)`) |
| 다음 태스크로 미루기(사이에 렌더링·이벤트 처리가 끼어들 수 있게) | `setTimeout(fn)` (지연 0) |
| 다음 화면 그리기 직전에 실행 | `requestAnimationFrame(fn)` |

`queueMicrotask`는 상태를 다 바꾼 뒤 한 번에 알리는 식의 "같은 틱 안에서 비동기로" 처리에 맞다. 라이브러리가 동기·비동기 실행 시점을 일관되게 맞출 때도 쓴다.

### 태스크를 활용하는 세 가지 경우

| 경우 | 방법 | 이유 |
| --- | --- | --- |
| CPU를 오래 쓰는 계산(큰 목록 구문 강조, 대량 처리) | 일정량씩 처리하고 나머지는 `setTimeout`으로 다음 태스크에 넘긴다 | 조각 사이사이에 클릭 같은 이벤트가 처리되어 화면이 멈추지 않는다. 다음 조각의 예약을 **처리 전에** 걸어 두면, 중첩 타이머의 최소 지연(약 4ms)이 처리 시간과 겹쳐 전체 시간이 덜 늘어난다([[timers\|타이머]]) |
| 진행률 표시 | 같은 방식으로 쪼개고 조각마다 DOM을 갱신한다 | 태스크 사이에 렌더링이 일어나므로 진행 상태가 보인다. `queueMicrotask`로 쪼개면 렌더링 기회가 없어 끝난 뒤에야 한 번에 보인다 |
| 이벤트가 끝까지 처리된 뒤에 할 일 | 핸들러 안에서 `setTimeout(fn)` | 버블링이 모든 조상까지 끝난 뒤에 실행된다. 커스텀 이벤트를 원래 이벤트 처리 뒤에 발생시킬 때 쓴다 |

쪼갤 작업은 **제너레이터**로 쓰면 깔끔하다. 처리 로직은 한 덩어리로 두고 `yield`로 쉬어 갈 자리만 표시한 뒤, 바깥의 실행기가 태스크 단위로 `next()`를 부른다. 실행기가 손에 쥐고 있으니 **취소도 쉽다.** 검색어 입력처럼 새 입력이 오면 진행 중인 작업을 버리고 마지막 입력의 결과만 DOM에 반영한다.

```javascript
function runChunked(gen) {
  let cancelled = false
  const step = () => {
    if (cancelled) return
    const start = performance.now()
    while (performance.now() - start < 8) {      // 한 조각은 프레임 예산의 절반쯤
      if (gen.next().done) return
    }
    setTimeout(step)                              // 다음 태스크로 양보
  }
  step()
  return () => { cancelled = true }               // 취소 함수
}

let cancel = () => {}
input.addEventListener('input', () => {
  cancel()                                        // 이전 검색은 버린다
  cancel = runChunked(filterItems(input.value))   // filterItems는 항목마다 yield하는 제너레이터
})
```

**마이크로태스크로는 양보할 수 없다.** 마이크로태스크 큐는 빌 때까지 비우고서야 다음 태스크와 렌더링으로 넘어가므로, Promise 체인이 계속 새 마이크로태스크를 넣으면 클릭도 렌더링도 굶는다. 쪼개도 메인 스레드에 남는 계산이 크면 [[web-workers|Web Worker]]로 옮긴다. 다만 워커는 DOM을 못 만지므로, 비용이 DOM 갱신 쪽에 있으면 갱신량 자체를 줄여야 한다.

긴 작업을 쪼개는 기준과 `scheduler.yield()` 같은 양보 방법은 [[inp-optimization|INP 최적화]]에 있다.

### 처리되지 않은 거부의 판정 시점

`unhandledrejection`은 **마이크로태스크 큐가 빈 뒤** 판정된다. 자세한 동작은 [[callback-and-promise#처리되지 않은 거부|콜백과 Promise]]에 있다.

## 메인 스레드 밖으로: Web Worker

이벤트 루프는 "기다리는 일"을 비켜 갈 뿐, **계산 자체가 무거운 일**(큰 데이터 파싱, 이미지 처리, 암호화)은 결국 메인 스레드에서 돌아 화면을 멈춘다. 이런 일은 DOM에 접근하지 않는 별도 스레드인 Web Worker에 맡긴다. 만드는 법·제약·무엇을 옮길지는 [[web-workers|웹 워커로 메인 스레드 비우기]]에, 워커마다 자기 이벤트 루프를 가진 싱글 스레드라는 점은 [[concurrency-models|동시성·병렬·비동기·논블로킹과 동시성 모델]]에 있다.

## async/await와의 관계

`await`의 대상은 **Promise를 반환하는 작업**이어야 의도대로 기다린다. axios 호출처럼 Promise를 돌려주는 API 앞에 `await`를 붙이는 것이 일반적이다. `await`를 만나면 그 async 함수만 멈추고 나머지는 마이크로태스크로 넘어가므로, 콜 스택은 비워져 다른 코드와 렌더링이 계속 진행된다. 자세한 문법은 [[async-await|async/await]] 노트에 있다.

## 정리

- JavaScript 엔진은 싱글 스레드다. 메인 스레드는 렌더링·입력 처리와 공유하므로, 오래 걸리는 동기 코드는 화면까지 멈춘다.
- 콜 스택에는 실행 컨텍스트가 LIFO로 쌓이고, 맨 위의 것만 실행된다.
- 비동기 작업은 브라우저(Web APIs)가 처리하고, 결과 콜백은 큐에서 기다린다.
- 이벤트 루프는 "스택이 비었으면 큐에서 하나 꺼내기"를 반복한다.
- 한 바퀴는 태스크 하나 → 마이크로태스크 전부 → 렌더링이다. Promise 콜백(마이크로태스크)이 타이머 콜백(태스크)보다 먼저 실행되고, 태스크 도중에는 화면이 그려지지 않는다.
- 무거운 계산은 `setTimeout`으로 쪼개 사이에 이벤트와 렌더링이 끼어들게 하고, 같은 틱 안의 비동기 처리는 `queueMicrotask`로 한다.
- 기다림이 아니라 계산이 무거우면 Web Worker로 메인 스레드 밖에서 돌린다.

## 참고 자료

- [콜 스택, 콜백 큐, 이벤트 루프](https://www.sungikchoi.com/blog/call-stack-callback-queue-event-loop/)
- [자바스크립트 Promise 쉽게 이해하기](https://joshua1988.github.io/web-development/javascript/promise-for-beginners/)
- [What the heck is the event loop anyway?](https://www.youtube.com/watch?v=8aGhZQkoFbQ): 콜 스택·태스크 큐·렌더링을 그림으로 보여 주는 JSConf EU 2014 강연
- [Loupe](http://latentflip.com/loupe/): 코드를 넣으면 콜 스택과 콜백 큐의 움직임을 단계별로 보여 주는 시각화 도구
- [매끄러운 경험을 위한 JavaScript 비동기 처리](https://engineering.linecorp.com/ko/blog/dont-block-the-event-loop/): 제너레이터로 작업 쪼개기, 워커 위임

관련 노트: [[nodejs-runtime#Node.js의 이벤트 루프|Node.js의 이벤트 루프]], [[execution-context|실행 컨텍스트]], [[callback-and-promise|콜백과 Promise]], [[async-await|async/await]], [[debounce-throttle|Debounce와 Throttle]], [[js-engine-v8|JS 엔진과 V8 파이프라인]], [[browser-rendering|브라우저 렌더링 과정]], [[concurrency-models|동시성·병렬·비동기·논블로킹과 동시성 모델]], [[event-loop-server|비동기 서버의 이벤트 루프: 다중 접속 서버에서 Reactor 패턴까지]], [[inp-optimization|INP 최적화: 긴 작업 쪼개기와 양보]], [[timers|타이머]]
