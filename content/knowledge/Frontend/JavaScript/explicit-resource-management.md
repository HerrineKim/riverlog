---
title: "자바스크립트의 명시적 리소스 관리: using과 Symbol.dispose"
concept: "Explicit Resource Management"
summary: "가비지 컬렉션 시점과 무관하게 스코프가 끝나는 즉시 파일·락·스트림·구독을 해제하는 ECMAScript 표준이다. using·await using 선언, Symbol.dispose·Symbol.asyncDispose 규약, DisposableStack과 SuppressedError, 2026년 런타임 지원 현황을 정리한다."
tags: ["javascript", "typescript", "nodejs", "memory", "backend"]
source: other
date: "2026-11-25"
sources: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using", "https://ykss.netlify.app/translation/2026/explicit-resource-management-in-js/", "https://caniuse.com/wf-explicit-resource-management"]
---

> 유경상이 번역한 「[자바스크립트의 명시적 리소스 관리](https://ykss.netlify.app/translation/2026/explicit-resource-management-in-js/)」(2026.02)와 MDN 「[using](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using)」 문서를 바탕으로 재구성한 노트다.

## 명시적 리소스 관리란

**명시적 리소스 관리(Explicit Resource Management)** 는 파일 핸들, DB 연결, 락, 스트림, 이벤트 구독처럼 수동으로 닫아야 하는 리소스의 해제를 **변수의 어휘적 스코프(lexical scope)** 에 묶어 런타임이 자동으로 실행하도록 하는 ECMAScript 언어 기능이다.

기존 JavaScript에서는 `try...finally`로 정리를 직접 챙겨야 했다. 리소스가 둘 이상 겹치면 `finally` 블록 안에서 해제 순서를 역순으로 맞추고, 정리 도중 에러가 나도 나머지 리소스가 누수되지 않게 막는 코드가 빠르게 복잡해졌다. `using`과 `await using`은 C#의 `using`, Python의 `with`, C++의 RAII처럼 스코프 종료 시점에 해제를 보장한다.

## 핵심 문법: `using`과 `await using`

| 요소 | 동작 시점 | 요구하는 메서드 | 용도 |
| --- | --- | --- | --- |
| `using x = res` | 블록·함수·모듈 스코프 종료 시 동기 실행 | `[Symbol.dispose]()` | 동기 락, 타이머, 이벤트 구독, 메모리 버퍼 |
| `await using x = res` | 스코프 종료 시 비동기 완료까지 대기 | `[Symbol.asyncDispose]()` (없으면 `Symbol.dispose`) | 파일 핸들 닫기, DB 연결·트랜잭션, 네트워크 스트림 |
| `null` / `undefined` | 아무 작업 없이 통과 | - | 조건부로 획득한 선택적 리소스 허용 |

```js
class Subscription {
  constructor(target, event, handler) {
    this.target = target;
    this.event = event;
    this.handler = handler;
    target.addEventListener(event, handler);
  }

  [Symbol.dispose]() {
    this.target.removeEventListener(this.event, this.handler);
  }
}

function handleRequest(emitter) {
  using _sub = new Subscription(emitter, "data", console.log);
  // 정상 반환이든 예외 발생이든 함수가 끝날 때 removeEventListener가 호출된다.
}
```

한 스코프에 여러 `using`·`await using`이 있으면 **선언한 역순(LIFO)** 으로 정리된다. 뒤에 선언한 리소스가 앞의 리소스에 의존하는 경우(예: DB 연결 뒤 트랜잭션 열기)에도 안전한 순서로 닫힌다.

```js
{
  await using conn = await pool.connect();
  await using tx = await conn.beginTransaction();
  // tx 먼저 정리된 뒤 conn이 정리된다.
}
```

## 동적·조건부 리소스: `DisposableStack`과 `AsyncDisposableStack`

리소스를 조건문 안에서 획득하거나 블록 경계를 넘겨 관리해야 하면 `DisposableStack` 또는 `AsyncDisposableStack`을 사용한다.

```js
async function processBatch(useLock) {
  await using stack = new AsyncDisposableStack();

  const file = stack.use(await openFile("data.txt"));
  if (useLock) {
    stack.adopt(await acquireLock(), (lock) => lock.release());
  }
  stack.defer(() => metrics.flush());

  await file.write("done");
}
```

- `use(value)`: `Symbol.dispose` 또는 `Symbol.asyncDispose`를 구현한 객체를 스택에 등록한다.
- `adopt(value, onDispose)`: 표준 심볼이 없는 외부 라이브러리 객체에 정리 콜백을 붙여 등록한다.
- `defer(onDispose)`: 값 없이 정리 콜백만 등록한다(Go의 `defer`와 비슷하다).
- `move()`: 소유권을 새 스택으로 옮겨 현재 스코프 종료 시 해제되지 않게 한다(예외 발생 전까지 자원을 넘길 때 유용하다).

## 예외 처리: `SuppressedError`

본문에서 예외가 발생한 뒤 정리자(disposer)에서도 예외가 발생해도, 나머지 정리자는 모두 실행된다. 이때 본문 예외와 정리 예외를 모두 잃지 않기 위해 JavaScript는 `SuppressedError`로 감싸서 던진다.

- `err.error`: 가장 나중에 발생한 예외(정리자에서 난 예외)
- `err.suppressed`: 먼저 발생해 가려진 예외(본문 또는 직전 정리자에서 난 예외)

## 프론트엔드와 Node.js 활용 지점

- **브라우저·프론트엔드**: `addEventListener`/`removeEventListener` 쌍, `AbortController` 취소, `IntersectionObserver.disconnect()`, Web Locks(`navigator.locks`), Web Streams 리더/라이터 잠금 해제에 맞는다.
- **Node.js (v24.2.0부터 안정화)**: `fs/promises`의 `FileHandle`, `fs.Dir`, `Timeout`·`Immediate`, `ChildProcess`, `http.Server`, `stream.Readable`·`Writable`, `events.addAbortListener`가 `Symbol.dispose` 또는 `Symbol.asyncDispose`를 내장 구현한다.

## 2026년 지원 현황과 한계

| 환경 | 지원 상태 (2026년 11월 기준) | 비고 |
| --- | --- | --- |
| Chrome / Edge | 134+ 네이티브 지원 | - |
| Firefox | 141+ 네이티브 지원 | - |
| Safari / iOS Safari | 미지원 (Technology Preview만 지원) | 퍼블릭 웹 앱에서는 트랜스파일·폴리필 필요 |
| Node.js | 24+ 네이티브 지원 | Node 22는 `Symbol.dispose`만 있고 `using` 문법은 `SyntaxError` |
| TypeScript | 5.2+ 다운레벨 컴파일 지원 | `tsconfig.json` `lib`에 `esnext.disposable` 추가 필요 |

브라우저 전역을 대상으로 하는 퍼블릭 웹사이트는 Safari 지원이 완료될 때까지 TypeScript 트랜스파일(또는 `DisposableStack` 폴리필)이 필요하다. 또한 `using`은 변수 스코프를 기준으로 해제하므로, 이미 해제된 객체의 참조를 외부 변수나 클로저에 담아 스코프 밖에서 계속 쓰면 해제 후 사용(use-after-dispose) 오류가 날 수 있다.

## 정리

- `using`과 `await using`은 리소스 정리를 제어 흐름(`try...finally`)이 아니라 변수의 수명에 묶는다.
- 여러 리소스는 선언 역순으로 해제되며, 충돌하는 예외는 `SuppressedError`로 보존된다.
- Node.js 24+ 서버 코드에서는 바로 쓸 수 있고, Safari를 포함한 브라우저 대상 코드는 TypeScript 5.2+ 트랜스파일과 함께 점진적으로 도입한다.

관련 노트: [[js-error-handling|에러 처리: try...catch와 커스텀 에러]], [[scope-and-closures|스코프와 클로저]], [[ecmascript-tc39|ECMAScript와 TC39 표준화]]
