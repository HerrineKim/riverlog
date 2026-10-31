---
title: "동시성·병렬·비동기·논블로킹과 동시성 모델"
concept: "Concurrency Models"
summary: "동시성(논리적으로 함께 진행)과 병렬(물리적으로 동시에 실행), 동기·비동기(완료를 누가 확인하나)와 블로킹·논블로킹(제어권을 바로 돌려받나)을 구분하고, 스레드보다 가벼운 실행 단위(파이버·코루틴·그린 스레드·가상 스레드), async/await와 CPS, Reactor·Proactor, 공유 메모리 대신 메시지를 쓰는 CSP·액터, Go·Tokio·BEAM 런타임의 스케줄링, GIL과 그 대안을 한 지도로 정리한다."
tags: ["computer-science", "os", "concurrency", "async", "process", "performance"]
source: other
date: "2026-10-20"
sources: ["https://black7375.tistory.com/90", "https://peps.python.org/pep-0703/", "https://openjdk.org/jeps/444", "https://bytebytego.com/guides/concurrency-is-not-parallelism", "https://homoefficio.github.io/2017/02/19/Blocking-NonBlocking-Synchronous-Asynchronous/", "http://homoefficio.github.io/2019/02/02/Back-to-the-Essence-Concurrency-vs-Parallelism/"]
---

> black7375의 「[동시성, 병렬, 비동기, 논블럭킹과 컨셉들](https://black7375.tistory.com/90)」(2022.06)을 바탕으로 재구성하고, 언어별 현황은 공식 문서로 최신화한 노트다. 동시성과 병렬의 구분은 ByteByteGo의 System Design 101 가이드 「[Concurrency vs Parallelism](https://bytebytego.com/guides/concurrency-is-not-parallelism)」으로 보강했다. 네 조합의 함정과 I/O 다중화의 분류는 「[Blocking-NonBlocking-Synchronous-Asynchronous](https://homoefficio.github.io/2017/02/19/Blocking-NonBlocking-Synchronous-Asynchronous/)」와 「[Back to the Essence - Concurrency vs Parallelism](http://homoefficio.github.io/2019/02/02/Back-to-the-Essence-Concurrency-vs-Parallelism/)」으로 보강했다.

## 네 가지 용어 구분

빠르게 실행하거나 빠르게 **느끼게** 만드는 기법을 말할 때 네 단어가 섞여 쓰인다. 축이 서로 다르다.

| 축 | 용어 | 뜻 |
| --- | --- | --- |
| 실행 | 동시성(concurrency) | 여러 작업이 **함께 진행되는 것처럼 보인다**. 논리적 개념 |
| | 병렬(parallelism) | 여러 작업이 **실제로 같은 순간에 실행된다**. 물리적 개념 |
| 완료 확인 | 동기(synchronous) | 호출한 쪽이 결과를 직접 받아 확인한다 |
| | 비동기(asynchronous) | 작업이 끝나면 콜백·이벤트·Promise로 **알려 준다** |
| 제어권 | 블로킹(blocking) | 호출한 함수가 끝날 때까지 제어권을 돌려주지 않는다 |
| | 논블로킹(non-blocking) | 호출하자마자 제어권을 돌려준다(준비 안 됐으면 "아직"이라고) |

- 싱글 코어에서 시분할로 번갈아 실행해도 **동시성**은 있다. 반대로 싱글 코어라도 SIMD 명령은 데이터 여러 개를 **병렬**로 처리한다([[pipeline-and-parallelism|파이프라인과 병렬 처리]]).
- **동시성은 구조(설계)의 문제이고, 병렬은 실행의 문제다.** 「동시성은 여러 일을 한꺼번에 *다루는* 것, 병렬은 여러 일을 한꺼번에 *하는* 것」이라는 Go 언어 설계자 롭 파이크의 구분이 이를 요약한다. 동시성으로 짜 둔 프로그램은 코어가 여럿이면 병렬로도 돌 수 있다.
- 쓰임새도 갈린다. 동시성은 파일·네트워크·사용자 입력을 기다리는 **I/O 바운드** 작업에서 응답성을 지키는 데 이득이 크고, 병렬은 수치 계산·데이터 분석·이미지 처리 같은 **CPU 바운드** 작업의 처리량을 높인다.
- 동기·비동기와 블로킹·논블로킹은 독립 축이라 네 조합이 모두 있다.

| 조합 | 예 |
| --- | --- |
| 동기 + 블로킹 | 일반 `read()`. 데이터가 올 때까지 멈춰 있다가 결과를 받는다 |
| 동기 + 논블로킹 | `O_NONBLOCK` 소켓을 루프로 계속 확인(polling)한다 |
| 비동기 + 논블로킹 | `fetch().then(...)`, `io_uring`. 바로 돌아오고 완료는 통지받는다 |
| 비동기 + 블로킹 | 비동기 API를 호출해 놓고 바로 결과를 기다리며 멈춘다. 대개 실수다 |

- **비동기 + 블로킹은 의도하지 않게 생긴다.** 이벤트 루프 위에 비동기로 짠 서버라도 경로 중간에 블로킹 드라이버(전통적인 JDBC, 동기 DB 클라이언트) 하나가 섞이면 그 구간에서 스레드가 멈춰 전체가 블로킹처럼 동작한다. 그래서 리액티브 스택은 R2DBC 같은 논블로킹 드라이버를 따로 쓰거나 블로킹 호출을 별도 스레드 풀로 격리한다.
- `Future`를 받아 `isDone()`을 반복 확인하는 것은 동기 + 논블로킹(폴링)이다. 완료 콜백을 거는 `CompletableFuture`·Promise 체인이 비동기 + 논블로킹이다.
- `select`·`epoll` 같은 I/O 다중화는 준비된 소켓이 생길 때까지 기다린다는 점에서 동기이고, 그 뒤의 소켓 읽기는 논블로킹이다. 그래서 보통 동기 + 논블로킹으로 분류한다(분류 방식은 문헌마다 갈린다).

비동기가 늘 낫지는 않다. 순서대로 흘러가는 작업은 동기가 단순하고 효율적이다. 비동기는 작업이 **서로 독립적이거나 지연이 클 때** 이득이고, 순서 보장이 없고 오버헤드가 조금 있다.

## 선점과 협력

| 방식 | 전환 시점 | 예 |
| --- | --- | --- |
| 선점형(preemptive) | 스케줄러가 실행 중인 작업을 **강제로** 끊고 바꾼다 | OS 스레드 스케줄링 |
| 협력형(cooperative, 비선점) | 작업이 **스스로 양보**(`yield`, `await`)해야 바뀐다 | 파이버, 코루틴, JS 이벤트 루프 |

협력형은 전환 비용이 작고 경쟁 상태가 적지만, 양보하지 않는 작업 하나가 전체를 멈춘다. JS에서 긴 동기 루프가 화면을 얼리는 이유다. 스케줄링 알고리즘 자체는 [[process-scheduling|프로세스 상태와 CPU 스케줄링]]에 있다.

## 스레드보다 가벼운 실행 단위

OS 스레드는 커널이 관리하므로 만들고 바꿀 때마다 시스템 콜과 커널 모드 전환 비용이 든다. 그래서 **사용자 공간에서 전환하는 가벼운 단위**가 여럿 나왔다.

| 단위 | 정의 | 전환 |
| --- | --- | --- |
| 파이버(fiber) | 경량 스레드. 사용자 공간에서 협력적으로 전환 | 스케줄러가 순서를 정할 수 있다 |
| 코루틴(coroutine) | 일시 중단(suspend)했다가 재개(resume)할 수 있는 함수 | 호출자와 피호출자 사이에서 전환 |
| 그린 스레드 | 런타임이 사용자 공간에서 관리하는 스레드 | 런타임 스케줄러 |
| 가상 스레드 | 그린 스레드를 OS 스레드 여러 개 위에 M:N으로 올린 것 | 런타임이 블로킹 지점에서 자동 전환 |

### 코루틴의 종류

| 구분 | 특징 |
| --- | --- |
| 스택리스(stackless) | 중단 지점의 지역 변수만 상태 객체에 담는다. 가볍지만 **코루틴 함수 본문에서만** 중단할 수 있다. JS·Python·Rust·C#의 `async`/제너레이터 |
| 스택풀(stackful) | 호출 스택 전체를 보관한다. 깊이 호출된 하위 함수에서도 중단할 수 있지만 메모리를 더 쓴다. Go 고루틴, Lua 코루틴, Java 가상 스레드 |
| 비대칭(asymmetric, semi) | `yield`하면 제어권이 항상 호출자에게 돌아간다. 제너레이터가 대표적이다 |
| 대칭(symmetric) | 중단하면서 제어권을 넘길 다른 코루틴을 직접 지정한다 |

### async/await는 코루틴 + Promise

`async` 함수는 `await`에서 멈추고 호출자에게 제어권을 돌려준다. 기다리던 Promise가 끝나면 그 지점부터 재개된다. 그래서 `async` 함수는 늘 Promise를 반환한다. JS에서의 실행 순서는 [[event-loop|브라우저에서 JavaScript가 동작하는 원리: 이벤트 루프]]와 [[async-await|async/await]]에 있다.

### 컨티뉴에이션과 CPS

**컨티뉴에이션(continuation)**은 "이 지점 이후에 남은 계산"을 값으로 다룬 것이다. 이를 함수로 받아 직접 호출하는 방식이 **CPS(Continuation-Passing Style)**다. 반환하는 대신 "다음에 할 일" 함수를 인자로 넘긴다.

```js
// 일반
const square = (x) => x * x;
console.log(square(3));

// CPS: 결과를 돌려주지 않고 다음 할 일(k)에 넘긴다
const squareK = (x, k) => k(x * x);
squareK(3, (r) => console.log(r));
```

사람이 직접 쓰면 콜백 지옥이 되지만, 컴파일러의 중간 표현으로는 유용하다. Kotlin 컴파일러는 `suspend` 함수를 CPS로 바꿔 상태 기계로 만든다. Scheme의 `call/cc`처럼 컨티뉴에이션을 일급 값으로 주면 예외, 제너레이터, 조기 탈출 같은 제어 흐름을 모두 만들 수 있다.

## 이벤트 루프: Reactor와 Proactor

스레드를 연결 수만큼 만들지 않고, 적은 스레드가 I/O 멀티플렉싱(`epoll`·`kqueue`, [[unix-file-io|UNIX 파일 입출력]] 참고)으로 많은 연결을 처리하는 구조다.

| 패턴 | 통지 내용 | 흐름 | 예 |
| --- | --- | --- | --- |
| Reactor | "**읽을 준비가 됐다**" | 이벤트를 받은 핸들러가 직접 `read`한다(동기 I/O) | Node.js(libuv), Netty, Vert.x, Nginx |
| Proactor | "**읽기가 끝났다**" | OS가 I/O를 끝내고 결과를 넘긴다(비동기 I/O) | Windows IOCP, Boost.Asio, `io_uring` 기반 런타임 |

Node.js의 JS 코드는 싱글 스레드지만 런타임은 아니다. libuv는 네트워크·파이프는 `epoll`·`kqueue`로 처리하고, OS가 논블로킹을 지원하지 않는 파일 I/O, DNS 조회(`getaddrinfo`), 압축·암호화는 **스레드 풀**(기본 4개, `UV_THREADPOOL_SIZE`로 조절)에서 돌린다. Reactor는 스레드 수를 늘린 변형(멀티 리액터, 리액터당 핸들러 스레드 풀)으로 확장된다.

## 공유 메모리 대신 메시지: CSP와 액터

락으로 공유 메모리를 지키는 방식([[process-synchronization|프로세스 동기화]])은 실수하기 쉽다. 그래서 **메모리를 공유하지 않고 메시지를 주고받는** 모델이 널리 쓰인다.

| 구분 | CSP(Communicating Sequential Processes) | 액터(Actor) |
| --- | --- | --- |
| 통신 수단 | **채널**. 프로세스는 익명이고 채널이 이름을 갖는다 | **메일박스**. 액터마다 주소(ID)가 있다 |
| 전송 | 기본은 동기: 보내는 쪽과 받는 쪽이 만나야 전달된다(버퍼 채널은 예외) | 비동기: 보내고 바로 다음 일을 한다 |
| 순서 | 한 채널 안에서는 보낸 순서대로 | 보장이 약하다. 메시지에 다른 액터의 주소를 담아 보낼 수 있다 |
| 대표 | Go 고루틴 + 채널, Rust 채널, Kotlin `Channel` | Erlang/Elixir(BEAM), Akka, Swift `actor` |

## 런타임은 이것들을 어떻게 조합하나

### Go와 Tokio: M:N 스케줄러와 작업 훔치기

고루틴(Go)과 태스크(Rust Tokio)는 **논리 코어 수만큼의 OS 스레드 위에 수많은 가벼운 작업을 올리는** M:N 구조다.

```text
작업(G) 수십만 개
  └→ 프로세서(P)마다 로컬 실행 큐(LRQ)  + 전역 실행 큐(GRQ)
        └→ OS 스레드(M) = 논리 코어 수
```

- **작업 훔치기(work stealing)**: 큐가 하나면 경합이 생기고, 프로세서마다 따로 두면 놀고 있는 코어가 생긴다. 그래서 각자 로컬 큐를 쓰다가 비면 다른 프로세서의 큐에서 훔쳐 온다.
- **LIFO 슬롯**: 방금 만든 작업을 다음에 바로 실행해 CPU 캐시를 재활용한다. 한 작업이 독점하지 않게 일정 시간 뒤에는 공정하게 넘긴다.
- **공정성**: Go는 10ms 넘게 실행되는 고루틴을 강제로 선점한다. Tokio는 선점하지 않는 대신 작업마다 **예산(budget)**을 줘서 다 쓰면 양보하게 한다.
- **블로킹 작업 분리**: 오래 걸리는 블로킹 호출이나 CPU 바운드 작업은 전용 스레드 풀로 보낸다(Tokio `spawn_blocking`). 그렇지 않으면 그 OS 스레드에 올라간 다른 작업이 모두 멈춘다.

Go 채널은 내부적으로 링 버퍼 + 뮤텍스이고, 보내기·받기 인덱스가 버퍼를 돌며 움직인다.

### BEAM(Erlang VM): 격리된 프로세스

- 각 프로세스(액터)는 **자기만의 힙과 스택**을 가진다. 처음 크기는 수백 워드 수준이라 수백만 개를 띄울 수 있다.
- 메모리가 격리돼 있어 GC가 프로세스 단위로 일어나 **전체가 멈추는(stop-the-world) 일이 없다.** 무한 루프에 빠진 프로세스만 골라 죽이기도 쉽다.
- 스케줄러는 코어마다 하나이고, 프로세스는 정해진 **실행 횟수(reduction)**를 다 쓰면 양보한다. 언어 수준에서는 선점형처럼 보인다.
- 이 격리와 감독 트리(OTP) 덕분에 장애가 나도 서비스가 이어지는 고가용성 시스템에 쓰인다.

### JVM: 가상 스레드

과거 JVM의 그린 스레드는 OS 스레드 하나에 여러 스레드를 올리는 N:1 구조라 멀티코어를 못 써서 버려졌다. Java 21(2023)에 정식 도입된 **가상 스레드(Project Loom)**는 M:N으로 돌아왔다. 블로킹 I/O를 만나면 런타임이 가상 스레드를 OS 스레드에서 내리고 다른 것을 올린다. 그래서 **블로킹 스타일로 짠 코드가 논블로킹 서버처럼 확장**되고, 리액티브 스타일을 쓰지 않아도 된다. 이벤트 루프 서버와 무엇을 언제 고를지, pinning 같은 제약은 [[event-loop-server|비동기 서버의 이벤트 루프]]의 「가상 스레드와의 관계」에 있다.

## GIL과 스크립트 언어의 선택

**GIL(Global Interpreter Lock)**은 인터프리터 전체에 락 하나를 걸어 **한 번에 한 스레드만 바이트코드를 실행**하게 한다. CPython은 참조 카운팅으로 메모리를 관리하는데, 여러 스레드가 동시에 카운트를 바꾸면 경쟁 상태가 생긴다. 객체마다 락을 걸면 너무 느려서 전역 락을 택했다. I/O 바운드 작업은 기다리는 동안 GIL을 놓으므로 괜찮지만, **CPU 바운드 작업은 스레드를 늘려도 빨라지지 않는다.**

| 언어 | 멀티코어를 쓰는 방법 |
| --- | --- |
| Python | ① `multiprocessing`(프로세스 분리) ② C 확장에서 GIL 해제(NumPy 등) ③ **free-threaded 빌드**(PEP 703): 3.13에서 실험적으로 나왔고 3.14부터 공식 지원 빌드가 됐다. 기본 빌드는 아직 GIL이 있다 ④ 서브인터프리터: 3.14에 `concurrent.interpreters` 모듈이 들어왔다. 인터프리터마다 GIL을 따로 가진다 |
| Ruby | Ractor: 액터 모델. Ractor끼리는 메시지로 객체를 복사·이동한다 |
| JavaScript | Web Worker·Node.js `worker_threads`: 각 워커가 자기 이벤트 루프를 가진 싱글 스레드다. `postMessage`는 구조화된 복제(직렬화→복사)를 거치고, `ArrayBuffer` 이전이나 `SharedArrayBuffer`로 복사를 피한다. 워커는 DOM에 접근할 수 없다 |

JS가 언어 차원에서 공유 메모리 스레드를 두지 않는 이유도 같다. DOM과 객체를 여러 스레드가 동시에 건드리면 안전하게 동기화하기 어렵다.

## 정리

- 동시성은 논리, 병렬은 물리다. 동기·비동기(완료 확인)와 블로킹·논블로킹(제어권)은 다른 축이다.
- 파이버·코루틴·그린 스레드·가상 스레드는 모두 **사용자 공간에서 싸게 전환하는 실행 단위**다. 스택리스는 가볍고, 스택풀은 어디서든 멈출 수 있다.
- async/await는 코루틴 위에 Promise를 얹은 것이고, 컴파일러는 이를 CPS·상태 기계로 바꾼다.
- 이벤트 루프는 준비를 통지받는 Reactor, 완료를 통지받는 Proactor로 나뉜다.
- 공유 메모리와 락 대신 메시지를 쓰는 CSP(채널)와 액터(메일박스)가 현대 런타임의 주류이고, Go·Tokio는 M:N 스케줄러와 작업 훔치기로, BEAM은 프로세스 격리로 성능과 안정성을 얻는다.

**동시성 모델을 고를 때는 "무엇을 공유하고, 누가 전환을 결정하는가"부터 본다.**

관련 노트: [[process-and-thread|프로세스와 스레드]], [[process-synchronization|프로세스 동기화]], [[pthread-sync-api|POSIX 스레드와 동기화 API]], [[unix-file-io|UNIX 파일 입출력과 파일 디스크립터]], [[event-loop|브라우저에서 JavaScript가 동작하는 원리: 이벤트 루프]], [[async-await|async/await]], [[pipeline-and-parallelism|파이프라인과 병렬 처리]], [[event-loop-server|비동기 서버의 이벤트 루프: 다중 접속 서버에서 Reactor 패턴까지]], [[web-workers|웹 워커로 메인 스레드 비우기]], [[multithreading-patterns|멀티스레딩 디자인 패턴과 논블로킹 알고리즘]], [[go-language|Go 언어]], [[structured-concurrency|구조적 동시성]]
