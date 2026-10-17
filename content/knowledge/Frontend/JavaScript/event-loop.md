---
title: "브라우저에서 JavaScript가 동작하는 원리: 이벤트 루프"
concept: "Event Loop"
summary: "싱글 스레드인 JavaScript가 콜 스택, Web API, 태스크·마이크로태스크 큐, 이벤트 루프의 협업으로 화면을 멈추지 않고 비동기 작업을 처리하는 방식."
tags: ["javascript", "async", "browser", "frontend"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/324", "https://riverkim.kr/114"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트다.

## 싱글 스레드와 블로킹

JavaScript 엔진(V8 등)은 **단일 스레드**로 코드를 실행한다. 한 순간에 실행 흐름이 하나뿐이고, 호출된 함수는 **콜 스택(Call Stack)** 에 쌓였다가 위에서부터 하나씩 처리된다.

이 구조에서 오래 걸리는 작업이 스택을 차지하면 그동안 다른 일을 할 수 없다. 브라우저에서는 렌더링과 클릭 처리 같은 UI 작업도 같은 흐름을 기다리므로 **화면이 멈춘다(blocking)**.

그래서 브라우저는 엔진 바깥에 시간이 걸리는 일을 대신 맡아 주는 실행 환경을 둔다. **JS가 직접 병렬로 일하는 것이 아니라, 브라우저에 일을 맡기고 자기는 다음 코드를 계속 실행한다.**

## 구성 요소

| 구성 요소 | 하는 일 | 예 |
| --- | --- | --- |
| 콜 스택 | 동기 코드를 쌓고 하나씩 실행 | 함수 호출 |
| Web APIs | 시간이 걸리거나 이벤트 기반인 작업을 브라우저가 처리 | `setTimeout`, `fetch`/XHR, DOM 이벤트 감지, 스토리지 |
| 큐(대기열) | 끝난 비동기 작업의 후속 콜백이 줄 서는 곳 | 타이머 콜백, `then` 콜백 |
| 이벤트 루프 | 스택이 비면 큐에서 작업을 꺼내 스택에 올리는 조율자 | — |

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
| 마이크로태스크 큐 | `Promise.then`/`catch`/`finally` 콜백, `await` 이후 코드 | 높음 — 스택이 빌 때마다 **전부** 비운다 |
| 태스크(매크로태스크) 큐 | `setTimeout`·`setInterval` 콜백, DOM 이벤트 콜백 | 낮음 — 마이크로태스크가 다 끝난 뒤 하나씩 |

그래서 실행 순서는 작성 순서가 아니라 **어느 큐에 들어갔는지**로 정해진다.

```javascript
console.log('1')
setTimeout(() => console.log('2'), 0)       // 태스크 큐
Promise.resolve().then(() => console.log('3')) // 마이크로태스크 큐
console.log('4')
// 1 → 4 → 3 → 2
```

## async/await와의 관계

`await`의 대상은 **Promise를 반환하는 작업**이어야 의도대로 기다린다. axios 호출처럼 Promise를 돌려주는 API 앞에 `await`를 붙이는 것이 일반적이다. `await`를 만나면 그 async 함수만 멈추고 나머지는 마이크로태스크로 넘어가므로, 콜 스택은 비워져 다른 코드와 렌더링이 계속 진행된다. 자세한 문법은 [[async-await|async/await]] 노트에 있다.

## 정리

- JavaScript 엔진은 싱글 스레드다. 오래 걸리는 동기 코드는 화면까지 멈춘다.
- 비동기 작업은 브라우저(Web APIs)가 처리하고, 결과 콜백은 큐에서 기다린다.
- 이벤트 루프는 "스택이 비었으면 큐에서 하나 꺼내기"를 반복한다.
- Promise 콜백(마이크로태스크)이 타이머 콜백(태스크)보다 먼저 실행된다.

## 참고 자료

- [콜 스택, 콜백 큐, 이벤트 루프](https://www.sungikchoi.com/blog/call-stack-callback-queue-event-loop/)
- [자바스크립트 Promise 쉽게 이해하기](https://joshua1988.github.io/web-development/javascript/promise-for-beginners/)

관련 노트: [[callback-and-promise|콜백과 Promise]], [[async-await|async/await]], [[debounce-throttle|Debounce와 Throttle]], [[js-engine-v8|JS 엔진과 V8 파이프라인]], [[browser-rendering|브라우저 렌더링 과정]], [[concurrency-models|동시성·병렬·비동기·논블로킹과 동시성 모델]], [[event-loop-server|비동기 서버의 이벤트 루프: 다중 접속 서버에서 Reactor 패턴까지]]
