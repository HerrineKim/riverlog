---
title: "SharedArrayBuffer와 Atomics: JavaScript의 공유 메모리 병렬 처리"
concept: "Shared Memory"
summary: "워커끼리 메시지 복사 없이 같은 메모리를 읽고 쓰게 하는 SharedArrayBuffer와, 그 메모리를 경쟁 상태 없이 다루는 Atomics(load·store·add·compareExchange·wait·notify)를 정리한다. 메시지 전달·소유권 이전·공유 메모리의 차이, Spectre 이후 교차 출처 격리(COOP·COEP)가 필수가 된 이유, 메인 스레드에서 wait 대신 waitAsync를 쓰는 규칙, 언제 병렬화가 값을 하는지까지."
tags: ["javascript", "concurrency", "performance", "web-worker", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://hacks.mozilla.org/2017/06/a-cartoon-intro-to-arraybuffers-and-sharedarraybuffers/", "https://hacks.mozilla.org/2016/05/a-taste-of-javascripts-new-parallel-primitives/", "https://blog.mozilla.org/javascript/2015/02/26/the-path-to-parallel-javascript/", "https://webkit.org/blog/7846/concurrent-javascript-it-can-work/", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics", "https://web.dev/articles/coop-coep"]
---

> 「[A cartoon intro to ArrayBuffers and SharedArrayBuffers](https://hacks.mozilla.org/2017/06/a-cartoon-intro-to-arraybuffers-and-sharedarraybuffers/)」, 「[A Taste of JavaScript's New Parallel Primitives](https://hacks.mozilla.org/2016/05/a-taste-of-javascripts-new-parallel-primitives/)」, 「[The Path to Parallel JavaScript](https://blog.mozilla.org/javascript/2015/02/26/the-path-to-parallel-javascript/)」, 「[Concurrent JavaScript: It can work!](https://webkit.org/blog/7846/concurrent-javascript-it-can-work/)」을 바탕으로, MDN과 web.dev 문서로 지금의 API와 보안 요건을 확인해 재구성한 노트다.

## 공유 메모리란

JavaScript는 **실행 완료(run-to-completion)** 모델이다. 이벤트 핸들러가 도는 동안 상태를 바꾸는 코드는 지금 부른 함수들뿐이다. [[web-workers|Web Worker]]도 이 성질을 지키려고 메모리를 나누지 않고 `postMessage`로만 대화한다.

**SharedArrayBuffer(SAB)는 이 규칙에 낸 좁은 예외다.** 여러 에이전트(메인 스레드와 워커 각각)가 **같은 바이트 덩어리를 동시에** 읽고 쓴다. 복사 비용과 메시지 지연이 사라지는 대신, 다른 언어의 스레드와 같은 경쟁 상태(race condition)가 생긴다. 그래서 공유 메모리를 다루는 원자적 연산 묶음 **Atomics**가 함께 들어왔다(둘 다 ES2017).

## 워커와 데이터를 주고받는 세 가지 방법

| 방법 | 동작 | 비용 | 원래 쪽에서 계속 쓸 수 있나 |
| --- | --- | --- | --- |
| 구조화된 복제 `postMessage(obj)` | 직렬화 → 전송 → 역직렬화해 **사본**을 만든다 | 데이터 크기에 비례 | 쓸 수 있다(사본이므로) |
| 소유권 이전 `postMessage(buf, [buf])` | `ArrayBuffer`의 메모리를 상대에게 **넘긴다** | 거의 0 | 못 쓴다. 보낸 쪽의 버퍼는 길이 0으로 분리(detached)된다 |
| 공유 `postMessage(sab)` | 같은 메모리를 **함께 가리킨다** | 0. 이후 통신도 메모리 쓰기로 한다 | 양쪽 모두 쓴다 |

SAB는 전송 목록(두 번째 인자)에 넣지 않는다. 초기 구현은 넣어야 했지만 지금은 `w.postMessage(sab)`로 보낸다.

## 메모리를 읽는 법: 뷰를 씌운다

SAB도 [[binary-data-and-files#ArrayBuffer와 뷰|ArrayBuffer]]처럼 그 자체로는 0과 1의 나열이라, `Int32Array` 같은 형식화 배열 뷰를 씌워 읽는다. 같은 버퍼에 여러 뷰를 씌우면 같은 비트가 뷰마다 다른 값으로 읽힌다. 객체나 문자열은 넣을 수 없고, 복잡한 자료구조는 오프셋을 직접 계산해 평평한 정수 배열 위에 짜야 한다.

```javascript
// main.js
const sab = new SharedArrayBuffer(1024)
const worker = new Worker('worker.js')
worker.postMessage(sab)

// worker.js
onmessage = ({ data }) => {
  const ia = new Int32Array(data)
  ia[0] = 37 // 메인 스레드의 뷰에서도 37이 보인다: 다만 "언제" 보이는지는 보장되지 않는다
}
```

## 경쟁 상태와 Atomics

일반 대입 `ia[0]++`은 읽기·더하기·쓰기 세 단계라, 두 워커가 동시에 하면 한쪽의 증가가 사라진다. 또 엔진·CPU는 메모리 접근 순서를 바꿀 수 있어서, 한 워커가 쓴 값을 다른 워커가 언제 보게 될지 일반 접근만으로는 알 수 없다. **Atomics 연산은 중간에 끼어들 수 없고(원자성), 앞뒤 메모리 접근의 순서를 보장한다.**

| 연산 | 하는 일 |
| --- | --- |
| `Atomics.load(ta, i)` / `store(ta, i, v)` | 순서가 보장되는 읽기·쓰기 |
| `Atomics.add` · `sub` · `and` · `or` · `xor` · `exchange` | 읽고-바꾸고-쓰기를 한 번에. 바꾸기 **전** 값을 돌려준다 |
| `Atomics.compareExchange(ta, i, expected, v)` | 현재 값이 `expected`일 때만 `v`로 바꾼다(CAS). 락·락 없는 자료구조의 기본 부품 |
| `Atomics.wait(ta, i, v, timeout)` | 값이 `v`인 동안 **스레드를 재운다**. `'ok'`·`'not-equal'`·`'timed-out'`을 돌려준다 |
| `Atomics.notify(ta, i, count)` | 그 칸에서 자는 에이전트를 `count`개 깨운다. 초기 이름은 `wake`(Firefox 46·47에서는 `futexWake`)였다 |
| `Atomics.waitAsync(ta, i, v)` | 재우는 대신 Promise를 돌려준다(ES2024). 메인 스레드에서 쓴다 |
| `Atomics.pause()` | 스핀 대기 루프에서 CPU에 "잠깐 쉰다"는 힌트를 준다(Stage 4) |

```javascript
// 워커 A: 작업이 끝나면 플래그를 세우고 기다리는 쪽을 깨운다
Atomics.store(flags, 0, 1)
Atomics.notify(flags, 0)

// 워커 B: 플래그가 0인 동안 잔다(바쁜 대기 없이)
Atomics.wait(flags, 0, 0)
const result = Atomics.load(data, 0)
```

**메인 스레드는 `Atomics.wait`를 부를 수 없다.** 화면을 멈추게 하기 때문이다(브라우저에서 `TypeError`). 메인 스레드는 `Atomics.waitAsync`의 Promise를 기다리거나, 워커가 `postMessage`로 알려 주는 이벤트를 받는다. Node.js의 메인 스레드는 `wait`를 쓸 수 있다.

`wait`·`notify`는 리눅스 futex처럼 낮은 수준의 부품이다. 실제 동기화(뮤텍스, 세마포어, 채널)는 이 위에 `compareExchange`로 상태를 바꾸는 코드를 직접 짜거나 라이브러리를 쓴다.

## 쓰려면: 교차 출처 격리

2018년 1월 Spectre 공격이 공개되자 브라우저들은 SAB를 일제히 껐다. 공유 메모리에 값을 계속 쓰는 워커 하나만 있으면 **나노초 단위의 고정밀 타이머**를 만들 수 있고, 이것이 CPU 캐시 타이밍으로 같은 프로세스의 다른 출처 데이터를 읽는 공격에 쓰이기 때문이다.

지금은 **교차 출처 격리(cross-origin isolated)** 된 문서에서만 SAB를 만들 수 있다. 다른 출처의 리소스가 같은 프로세스에 몰래 들어오지 못하게 막아 두면 타이머가 있어도 훔칠 것이 없다는 논리다([[browser-architecture|브라우저 구조]]).

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

- COOP `same-origin`은 다른 출처 창과의 opener 관계를 끊는다([[windows-and-frames|창과 프레임]]).
- COEP `require-corp`는 CORS나 `Cross-Origin-Resource-Policy` 헤더로 허락받지 않은 다른 출처 리소스(이미지·스크립트·iframe)를 막는다. 외부 리소스가 많으면 `credentialless`(쿠키 없이 요청해 허락 없이도 싣는다)를 쓴다.
- 격리됐는지는 `self.crossOriginIsolated`로 확인한다. `false`면 `SharedArrayBuffer` 생성자 자체가 없다. DevTools Application 패널의 Frames에서도 보인다([[devtools-application|Application 패널]]).
- 같은 이유로 `performance.now()`의 정밀도도 격리 여부에 따라 다르다(격리 시 5µs, 아니면 100µs 단위로 거칠게 만든다).

## 언제 쓰나

| 쓸 만한 경우 | 이유 |
| --- | --- |
| 이미지·영상·오디오 처리, 물리 시뮬레이션, 압축 | 큰 버퍼를 여러 워커가 나눠 처리하고 결과를 복사 없이 메인에 넘긴다 |
| 멀티스레드 C/C++·Rust를 [[webassembly\|WebAssembly]]로 옮길 때 | Wasm 스레드는 공유 메모리(`WebAssembly.Memory({ shared: true })`) 위에서 돈다. Emscripten의 pthread가 이 조합이다 |
| 워커 간 신호가 매우 잦을 때 | `postMessage`의 왕복 지연보다 메모리 플래그가 훨씬 싸다 |

**병렬화는 느린 코드의 손쉬운 해결책이 아니다.** 만델브로 집합처럼 칸마다 독립인 계산은 코어 수만큼 거의 선형으로 빨라지지만(4코어에서 6.9 → 25.4 FPS), 그런 문제는 드물다. 일을 워커에 고르게 나누는 부하 분산, 교착 상태(deadlock), 조용히 쓰레기 값을 만드는 데이터 경쟁을 모두 직접 감당해야 한다. 대부분의 앱은 무거운 일을 워커 하나로 옮겨 **응답성**만 확보해도 충분하다([[web-workers|Web Worker]]).

## 역사: 선택된 설계와 버려진 설계

| 방향 | 내용 | 결과 |
| --- | --- | --- |
| 완전 멀티스레드 JS | 모든 객체를 여러 스레드가 공유한다(Nashorn 방식). WebKit은 객체마다 락을 거는 구현 전략까지 제안했다 | 기존 라이브러리 전부가 실행 완료를 전제로 쓰였기 때문에 채택되지 않았다 |
| 결정적 병렬 API(River Trail, PJS) | 경쟁 상태가 없는 고수준 병렬 배열 연산 | 일반화가 어려워 표준이 되지 못했다 |
| **저수준 부품(SAB + Atomics)** | 확장 가능한 웹(Extensible Web) 원칙대로 최소한의 부품만 표준화하고, 고수준 추상화는 라이브러리가 만든다 | 표준이 됐다. 공유는 **명시적으로 SAB를 쓴 데이터에만** 생기므로, SAB를 받지 않는 코드는 예전처럼 격리가 보장된다 |

객체 단위로 메모리를 나누려는 시도는 TC39의 Shared Structs 제안으로 이어지고 있다.

## 정리

- 워커 통신은 복제(사본) → 이전(소유권 넘김) → 공유(SAB) 순으로 비용이 줄고 위험이 커진다.
- 공유 메모리의 일반 읽기·쓰기는 순서와 원자성을 보장하지 않는다. 동기화가 필요한 칸은 반드시 `Atomics`로 다룬다.
- `wait`는 워커에서만, 메인 스레드는 `waitAsync`나 메시지로 기다린다.
- SAB는 COOP `same-origin` + COEP `require-corp`(또는 `credentialless`)로 교차 출처 격리된 페이지에서만 쓸 수 있다.
- 병렬화는 독립적인 계산에만 크게 이득이고, 대부분은 워커로 옮겨 메인 스레드를 비워 두는 것으로 충분하다.

관련 노트: [[web-workers|Web Worker]], [[binary-data-and-files|바이너리 데이터와 파일]], [[event-loop|이벤트 루프]], [[concurrency-models|동시성 모델]], [[webassembly|WebAssembly]], [[browser-architecture|브라우저 구조]]
