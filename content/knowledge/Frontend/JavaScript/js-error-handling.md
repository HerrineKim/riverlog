---
title: "에러 처리: try...catch와 커스텀 에러"
concept: "Error Handling"
summary: "JavaScript 언어 차원의 에러 처리. try...catch...finally가 잡는 것과 못 잡는 것(문법 에러, 예약된 콜백), 에러 객체의 name·message·stack·cause, 내장 에러 종류, throw와 다시 던지기, finally와 return의 우선순위, Error를 상속한 커스텀 에러와 계층, cause로 예외 감싸기, 전역 에러 이벤트, 에러를 삼키지 않고 클라이언트에서 수집해 보내는 법까지."
tags: ["javascript", "error-handling", "frontend", "debugging"]
source: other
date: "2026-10-21"
sources: ["https://ko.javascript.info/try-catch", "https://ko.javascript.info/custom-errors", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch", "https://www.sitepoint.com/proper-error-handling-javascript/", "https://www.thoughtworks.com/radar/techniques/capturing-client-side-javascript-errors"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「try..catch와 에러 핸들링」, 「커스텀 에러와 에러 확장」 글을 바탕으로, MDN으로 확인해 재구성한 노트다. 에러 수집은 「[A Guide to Proper Error Handling in JavaScript](https://www.sitepoint.com/proper-error-handling-javascript/)」와 Thoughtworks Technology Radar의 「[Capturing client-side JavaScript errors](https://www.thoughtworks.com/radar/techniques/capturing-client-side-javascript-errors)」를 바탕으로 보강했다.

## 에러 처리란

에러가 나면 스크립트는 그 자리에서 멈추고 콘솔에 에러를 찍는다. **`try...catch`는 에러를 잡아 스크립트가 죽지 않게 하고, 대신 할 일을 정하게 해 준다.** 다시 요청하기, 사용자에게 대안 보여 주기, 모니터링 서비스로 보내기 같은 일이다.

이 노트는 언어 차원의 도구를 다룬다. 비동기 코드에서 에러를 잡는 자리는 [[async-await|async/await와 비동기 에러 처리]]에, 화면에서 에러를 분류하고 React의 ErrorBoundary로 보여 주는 방법은 [[frontend-error-handling|프런트엔드 에러 핸들링]]에 있다.

## try...catch...finally

```javascript
try {
  // 먼저 실행한다
} catch (err) {
  // try에서 에러가 나면 그 줄에서 멈추고 여기로 온다. err는 에러 객체
} finally {
  // 에러가 났든 안 났든, 블록을 빠져나가기 전에 항상 실행한다
}
```

| 흐름 | 실행 순서 |
| --- | --- |
| 에러 없음 | `try` 끝까지 → `finally` |
| 에러 발생 | `try`의 에러 직전까지 → `catch` → `finally` |
| `catch` 없이 `try...finally` | `try` → `finally` → 에러는 바깥으로 계속 전파 |

- 에러 객체가 필요 없으면 `catch { … }`처럼 괄호를 생략한다(선택적 catch 바인딩, ES2019).
- 블록 안에서 선언한 변수는 그 블록의 지역 변수다. `finally`에서 쓸 값은 `try` 바깥에 먼저 선언한다.
- `try...finally`는 에러를 처리하진 않지만 **시작한 일을 반드시 마무리**할 때 쓴다. 측정 종료, 로딩 표시 끄기, 잠금 해제 같은 일이다.

### 잡지 못하는 것

| 상황 | 이유 | 해결 |
| --- | --- | --- |
| 문법 에러(`{{{`처럼 짝이 안 맞는 코드) | 엔진이 코드를 읽는 단계(parse time)에서 실패해 실행 자체가 시작되지 않는다. `try...catch`는 실행 중 에러(런타임 에러, 예외)만 잡는다 | 린터·빌드 단계에서 잡는다 |
| `setTimeout`·이벤트 리스너 안의 에러 | 콜백은 `try` 블록이 끝난 **뒤에** 실행된다. `try...catch`는 동기적으로 동작한다 | 콜백 **안에** `try...catch`를 둔다 |
| `await` 없이 부른 Promise의 거부 | 거부는 나중에 마이크로태스크로 전달된다 | `await`와 함께 감싸거나 `.catch()`를 단다 |

```javascript
try {
  setTimeout(() => noSuchVariable, 1000) // 여기서 나는 에러는 바깥 catch가 못 잡는다
} catch {}

setTimeout(() => {
  try { noSuchVariable } catch { /* 이건 잡힌다 */ }
}, 1000)
```

### finally와 return

`finally`는 `try`·`catch`에서 `return`으로 빠져나갈 때도 **반환 직전에** 실행된다. 그리고 **`finally` 안의 `return`·`throw`는 앞의 결과를 덮어쓴다.**

```javascript
function f() {
  try { return 'try' }
  finally { console.log('정리') }   // '정리'를 찍은 뒤 'try'를 반환
}

function g() {
  try { throw new Error('실패') }
  finally { return 'finally' }      // 에러가 사라지고 'finally'가 반환된다
}
```

에러를 조용히 삼키는 버그가 되므로 `finally`에는 정리 코드만 두고 `return`을 쓰지 않는다(ESLint `no-unsafe-finally`).

## 에러 객체

| 속성 | 내용 | 표준 여부 |
| --- | --- | --- |
| `name` | 에러 종류. `'ReferenceError'`, `'TypeError'` 등 생성자 이름 | 표준 |
| `message` | 사람이 읽는 설명 | 표준 |
| `cause` | 이 에러를 일으킨 원인(대개 먼저 잡은 다른 에러) | 표준(ES2022) |
| `stack` | 에러가 만들어진 순간의 호출 스택 문자열 | 비표준이지만 모든 주요 환경이 지원 |

에러 객체를 문자열로 바꾸면 `"name: message"`가 된다. 다만 `throw`는 문자열·숫자 등 **아무 값이나** 던질 수 있어서, `catch`의 `err`가 에러 객체라는 보장은 없다. TypeScript에서 `catch (err: unknown)`으로 받고 `instanceof Error`로 좁히는 이유다([[typescript-coding-convention|TypeScript 코딩 컨벤션]]).

### 내장 에러 종류

| 생성자 | 언제 |
| --- | --- |
| `Error` | 모든 에러의 기반 클래스 |
| `SyntaxError` | 문법 오류. `JSON.parse`가 잘못된 문자열을 받을 때도 던진다 |
| `ReferenceError` | 선언되지 않은 변수, TDZ 안의 `let`·`const` 접근 |
| `TypeError` | 값의 타입이 맞지 않는 연산. `undefined`의 속성 읽기, 함수가 아닌 값 호출, 읽기 전용 속성에 쓰기(strict mode) |
| `RangeError` | 허용 범위를 벗어난 값. 잘못된 배열 길이, 콜 스택 초과(`Maximum call stack size exceeded`) |
| `URIError` | `decodeURIComponent` 등에 잘못된 URI |
| `EvalError` | 이름만 남은 레거시. 지금 엔진은 던지지 않는다 |
| `AggregateError` | 여러 에러를 하나로 묶는다. `Promise.any`가 모두 실패할 때 `errors` 배열에 담아 던진다 |

## throw: 직접 던지기

문법은 맞지만 **우리 기준에 맞지 않는 데이터**도 에러로 다룰 수 있다. `throw`는 즉시 실행을 멈추고 가장 가까운 `catch`로 제어를 넘긴다.

```javascript
const user = JSON.parse('{ "age": 30 }') // 문법상 문제없다
if (!user.name) {
  throw new Error('불완전한 데이터: 이름 없음')
}
```

**`throw`에는 `Error`(또는 하위 클래스)만 넘긴다.** 문자열을 던지면 `stack`이 없어 어디서 났는지 추적할 수 없고, `instanceof`로 종류를 가릴 수도 없다.

## 다시 던지기: 아는 에러만 처리한다

`catch`는 `try` 안의 **모든** 에러를 받는다. JSON 파싱 실패를 처리하려고 만든 `catch`가 오타로 생긴 `ReferenceError`까지 "JSON 에러"로 보여 주면 디버깅이 어려워진다. 그래서 규칙은 하나다. **`catch`는 처리 방법을 아는 에러만 처리하고 나머지는 다시 던진다.**

```javascript
try {
  const user = JSON.parse(json)
  if (!user.name) throw new ValidationError('이름 없음')
  render(user)
} catch (err) {
  if (err instanceof ValidationError || err instanceof SyntaxError) {
    showMessage('데이터가 올바르지 않습니다')
  } else {
    throw err // 모르는 에러는 바깥으로
  }
}
```

다시 던진 에러는 바깥의 `try...catch`가 잡고, 아무도 잡지 않으면 아래의 전역 핸들러까지 간다.

가장 나쁜 것은 모든 에러를 받아 **삼키는** `catch`다.

```js
// 나쁜 예: 실패를 null로 바꿔 숨긴다
function safe(fn) {
  try { return fn() } catch { return null }
}
```

이렇게 **조용히 실패(fail-silent)** 하면 호출한 쪽은 왜 `null`인지 모른다. 증상을 몇 시간 쫓다가 원인인 `catch`를 놓치고, 최악에는 잘못된 값이 저장돼 데이터가 망가진다. 처리할 수 없는 에러는 다시 던져 스택을 풀게 두고, 감쌀 때는 `cause`로 원래 에러를 보존한다(아래 「예외 감싸기와 cause」).

## 커스텀 에러

`HttpError`, `ValidationError`, `NotFoundError`처럼 **도메인에 맞는 에러 클래스**를 만들면 `catch`에서 종류별로 가를 수 있다. `throw`에는 아무 객체나 던질 수 있지만, `Error`를 상속해야 `stack`이 생기고 `err instanceof Error`가 통한다.

```javascript
class ValidationError extends Error {
  constructor(message, options) {
    super(message, options) // message와 cause는 부모가 설정한다
    this.name = 'ValidationError'
  }
}

class PropertyRequiredError extends ValidationError {
  constructor(property) {
    super(`필수 속성 없음: ${property}`)
    this.name = 'PropertyRequiredError'
    this.property = property // 추가 정보는 속성으로
  }
}

const err = new PropertyRequiredError('name')
err instanceof PropertyRequiredError // true
err instanceof ValidationError       // true: 부모 클래스로도 잡힌다
err instanceof Error                 // true
```

| 지킬 것 | 이유 |
| --- | --- |
| constructor에서 `super(message, options)`를 먼저 부른다 | 파생 클래스는 `this`를 쓰기 전에 `super()`가 필수다([[class\|class 문법]]). `options`를 넘겨야 `cause`가 설치된다 |
| `name`을 직접 정한다 | 부모 생성자가 `name`을 `'Error'`로 두기 때문에 그대로면 로그에 종류가 안 보인다 |
| `this.name = this.constructor.name`에 기대지 않는다 | 기반 클래스 하나에 두면 편하지만, 압축기(minifier)가 클래스 이름을 줄이면 `'a'` 같은 이름이 찍힌다. 문자열로 박아 두거나 압축 설정에서 클래스 이름을 보존한다 |
| 종류 판별은 `name`보다 `instanceof` | `instanceof`는 하위 클래스까지 잡는다. 계층이 깊어져도 `catch`를 고칠 필요가 없다 |

`instanceof`는 같은 실행 환경(realm) 안에서만 믿을 수 있다. iframe이나 다른 realm에서 온 에러는 그 realm의 `Error`를 상속하므로 `instanceof Error`가 `false`일 수 있다. 진짜 에러인지만 확인할 때는 `Error.isError(value)`(ES2026)를, 서드파티 라이브러리의 에러는 `name`이나 라이브러리가 내보내는 판별 함수를 쓴다.

> 과거에는 Babel 등으로 ES5까지 내려 빌드하면 내장 클래스 상속이 제대로 안 돼, 인스턴스가 커스텀 클래스로 판별되지 않았다. constructor 끝에 `Object.setPrototypeOf(this, new.target.prototype)`을 넣어 우회했다. ES2015 이상을 대상으로 빌드하면 필요 없다.

## 예외 감싸기와 cause

`readUser()`처럼 한 가지 일을 하는 함수 안에서 파싱 에러, 검증 에러, 네트워크 에러가 다 날 수 있다. 호출하는 쪽이 이 모든 종류를 알아야 한다면, 함수가 바뀔 때마다 `catch`의 `if` 분기가 늘어난다.

**예외 감싸기(wrapping exceptions)** 는 함수 안에서 저수준 에러를 잡아 **그 일을 대표하는 추상 에러 하나**로 바꿔 던지고, 원래 에러는 `cause`에 담는다. 호출하는 쪽은 `ReadError` 하나만 확인하고, 자세한 원인이 필요할 때만 `cause`를 본다.

```javascript
class ReadError extends Error {
  constructor(message, options) {
    super(message, options)
    this.name = 'ReadError'
  }
}

function readUser(json) {
  try {
    const user = JSON.parse(json)
    validateUser(user)
    return user
  } catch (err) {
    if (err instanceof SyntaxError || err instanceof ValidationError) {
      throw new ReadError('사용자 데이터를 읽을 수 없음', { cause: err })
    }
    throw err
  }
}

try {
  readUser('{잘못된 json}')
} catch (err) {
  if (err instanceof ReadError) {
    console.error(err.message, '원인:', err.cause)
  } else {
    throw err
  }
}
```

> 과거에는 `cause` 표준이 없어서 커스텀 에러마다 `this.cause = cause`나 `originalError` 같은 속성을 직접 만들었다. ES2022부터 `new Error(message, { cause })`가 표준이고, 개발자 도구와 Node.js가 원인 체인을 함께 보여 준다.

## 전역 에러 핸들러

어떤 `try...catch`도 잡지 못한 에러는 호스트 환경의 전역 핸들러로 간다. 언어 명세가 아니라 브라우저·Node.js가 제공하는 기능이다.

| 환경 | 잡히지 않은 동기 에러 | 처리되지 않은 Promise 거부 |
| --- | --- | --- |
| 브라우저 | `window.addEventListener('error', (e) => e.error)` | `window.addEventListener('unhandledrejection', (e) => e.reason)` |
| Node.js | `process.on('uncaughtException', …)` | `process.on('unhandledRejection', …)` |

- 전역 핸들러는 **복구가 아니라 기록**용이다. 프로그래밍 에러로 망가진 상태를 여기서 되살리기는 사실상 불가능하다. 에러를 모니터링 서비스(Sentry 등)로 보내고 사용자에게 알린다.
- 다른 출처(origin)에서 불러온 스크립트의 에러는 보안상 `"Script error."`로만 보인다. `<script crossorigin>`과 그 서버의 CORS 응답 헤더가 있어야 메시지와 스택이 전달된다.
- `window.onerror = function (message, url, line, col, error) {}` 속성 방식도 동작하지만, 핸들러를 하나만 둘 수 있어 `addEventListener`를 쓴다.
- Node.js는 처리되지 않은 Promise 거부가 생기면 기본으로 프로세스를 종료한다.

### 브라우저 에러 수집

서버 에러는 로그에 남지만 **브라우저에서 난 에러는 사용자 기기에서 사라진다.** 특정 브라우저·확장 프로그램·기기 조합에서만 나는 문제는 수집하지 않으면 알 수 없다. 그래서 전역 핸들러에서 에러를 서버로 보낸다.

| 함께 보낼 것 | 이유 |
| --- | --- |
| 메시지, `error.stack`, `name` | 어디서 났나. 압축된 번들의 스택은 **소스 맵**으로 원래 위치로 되돌린다 |
| 페이지 URL, 사용자 에이전트, 앱 릴리스 버전 | 어떤 환경·배포에서 났나 |
| 직전 사용자 동작(브레드크럼) | 재현 경로 |

페이지를 떠나는 중에도 전송되도록 `navigator.sendBeacon()`이나 `fetch(url, { keepalive: true })`를 쓴다. 직접 만들기보다 Sentry 같은 에러 수집 서비스를 쓰고, 많을 때는 표본을 추린다. React에서 에러 경계·루트 훅과 수집 서비스를 잇는 법은 [[frontend-error-handling|프런트엔드 에러 핸들링]]에 있다.

## 정리

- `try...catch`는 실행 중(런타임) 에러를, 그것도 **동기적으로** 실행되는 코드의 에러만 잡는다. 예약된 콜백 안의 에러는 콜백 안에서 잡는다.
- `finally`는 어떤 경로로 빠져나가든 실행된다. 안에서 `return`하면 앞의 결과와 에러를 덮어쓰므로 정리 코드만 둔다.
- 던질 때는 `Error`나 그 하위 클래스만, 받을 때는 아는 에러만 처리하고 나머지는 다시 던진다. `null`로 바꿔 삼키지 않는다.
- 커스텀 에러는 `Error`를 상속하고 `super(message, options)`와 `name`을 챙긴다. 종류는 `instanceof`로 가린다.
- 저수준 에러는 추상 에러로 감싸 `cause`에 원인을 남긴다. 잡히지 않은 에러는 전역 핸들러에서 스택·URL·릴리스와 함께 수집 서버로 보낸다.

관련 노트: [[async-await|async/await와 비동기 에러 처리]], [[frontend-error-handling|프런트엔드 에러 핸들링]], [[class|class 문법]], [[typescript-coding-convention|TypeScript 코딩 컨벤션]], [[callback-and-promise|콜백과 Promise]], [[strict-mode|strict mode]]
