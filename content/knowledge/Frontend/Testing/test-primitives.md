---
title: "테스트의 기본 요소: 테스트 케이스, 단언, 스위트, 수명 주기 훅"
concept: "Test Primitives"
summary: "거의 모든 테스트 프레임워크가 주는 공통 부품을 정리한다. 실패하면 던지는 단언(참·동등·깊은 동등), assert 스타일과 expect(BDD) 스타일, 스냅숏 단언, 테스트 케이스와 스위트(test·suite / it·describe), beforeEach·afterEach·beforeAll·afterAll, 비동기 코드를 기다리는 법(async·resolves/rejects·expect.assertions)과 가짜 타이머, 테스트 파일을 두는 위치. 이름은 도구마다 달라도 개념은 같다."
tags: ["testing", "javascript", "vitest", "jest"]
source: other
date: "2026-10-21"
sources: ["https://web.dev/learn/testing/get-started/what-testing-is", "https://web.dev/learn/testing/assertions/tools", "https://web.dev/learn/testing/appendix", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Jest%20%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Jest%20%EB%B9%84%EB%8F%99%EA%B8%B0%20%EC%BD%94%EB%93%9C%20%ED%85%8C%EC%8A%A4%ED%8A%B8.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Jest%20%EC%8A%A4%EB%83%85%EC%83%B7.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Jest%20UI%20testing.md", "https://jestjs.io/docs/asynchronous", "https://vitest.dev/guide/mocking/timers"]
---

> web.dev의 「[Learn Testing](https://web.dev/learn/testing)」 강좌의 「What testing is」, 「Tools of the trade」, 「Appendix」 모듈을 바탕으로 재구성한 노트다.
>
> 「스냅숏 단언」, 「비동기 코드 테스트」, 「시간을 가짜로」는 「[Frontend_TIL: Jest 사용하기](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Jest%20%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0.md)」, 「[Jest 비동기 코드 테스트](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Jest%20%EB%B9%84%EB%8F%99%EA%B8%B0%20%EC%BD%94%EB%93%9C%20%ED%85%8C%EC%8A%A4%ED%8A%B8.md)」, 「[Jest 스냅샷](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Jest%20%EC%8A%A4%EB%83%85%EC%83%B7.md)」, 「[Jest UI testing](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Jest%20UI%20testing.md)」를 바탕으로 보강했다.

## 테스트는 실패하면 던지는 코드다

자동화된 테스트의 본질은 한 줄이다. **소프트웨어를 실행하고, 기대와 다르면 `Error`를 던진다.** 라이브러리가 없어도 된다.

```js
import { fibonacci } from '../src/math.js'

const fib13 = fibonacci(13)
if (fib13 !== 233) {
  throw new Error(`13번째 피보나치가 틀렸다: ${fib13}, 기대값 233`)
}
```

손으로 `node`를 실행해도 이것은 자동화된 테스트다. 단계를 사람이 하나씩 밟지 않고 그대로 반복할 수 있기 때문이다. 프레임워크는 이 패턴을 편하게 만드는 두 가지 기본 요소를 준다.

| 기본 요소 | 하는 일 |
| --- | --- |
| **단언(assertion)** | 결과 확인과 실패 시 던지기를 한 번에 한다 |
| **테스트 케이스(test case)** | 독립적이고 이름으로 부를 수 있는 시나리오 하나. 묶으면 **스위트(suite)** |

테스트 코드를 파일 최상단에 두지 않고 `test()` 함수 안에 두는 이유가 여기 있다. 러너가 각 케이스를 따로 실행하고, 따로 결과를 기록하고, 골라서 돌릴 수 있다.

## 단언

### 프레임워크가 늘 주는 세 가지

| 종류 | 확인하는 것 | 예 (Chai `assert` / Vitest·Jest `expect`) |
| --- | --- | --- |
| 참(ok) | 조건이 참인가. `if`와 같다 | `assert.ok(user.isAdmin)` / `expect(user.isAdmin).toBeTruthy()` |
| 동등 | 원시값이 같은가, 같은 참조인가 (`==`·`===`) | `assert.strictEqual(n, 0)` / `expect(n).toBe(0)` |
| 깊은 동등 | 객체·배열의 **내용**이 같은가 | `assert.deepStrictEqual(a, [1, 2])` / `expect(a).toEqual([1, 2])` |

JavaScript에서 `[1, 2, 3] === [1, 2, 3]`은 언제나 거짓이다. 배열·객체를 비교할 때 동등 단언을 쓰면 항상 실패하므로 깊은 동등을 쓴다. Jest·Vitest의 `toStrictEqual`은 `undefined` 속성과 클래스 타입까지 따진다.

비교 단언은 보통 **(실제값, 기대값, 실패 메시지)** 순서다. 알파벳 순서(Actual → Expected)로 외운다. 순서를 바꾸면 실패 메시지의 「expected」와 「received」가 뒤바뀌어 읽는 사람을 헷갈리게 한다.

```js
test('JWT를 해석한다', () => {
  const json = decodeJwt(token)

  assert.ok(json.payload.admin, '관리자여야 한다')
  assert.deepEqual(json.payload.groups, ['role:Admin', 'role:Submitter'])
  assert.equal(json.header.alg, 'RS256')
  assert.isAbove(json.payload.exp, Date.now(), '만료 시각은 미래여야 한다')
})
```

### assert 스타일과 expect 스타일

| 스타일 | 모양 | 특징 |
| --- | --- | --- |
| assert (전통·TDD) | `assert.include(result, 42, '42를 포함해야 한다')` | 마지막 인자로 실패 메시지를 넘긴다 |
| expect (fluent·BDD) | `expect(result).to.be.an('array').that.includes(42)` (Chai) / `expect(result).toContain(42)` (Jest식) | 메서드 사슬이 곧 실패 메시지다. 그래서 메시지 인자를 받지 않는 경우가 많다 |

두 스타일은 동작이 같다. Chai의 `to.be`, `that` 같은 단어는 아무 일도 하지 않고 문장처럼 읽히게만 한다. **Vitest는 Chai의 `assert`·`expect`와 Jest 호환 `expect`를 모두 내보내고, Jest는 `expect`만 준다.** Node 내장 러너는 `node:assert`를 쓴다.

단언 도우미는 편의일 뿐이다. 테스트는 던지는 코드이므로 다른 단언 라이브러리, 직접 만든 함수, 평범한 `if` + `throw`를 섞어도 된다.

### 스냅숏 단언

**스냅숏(snapshot) 단언**은 기대값을 손으로 쓰지 않고, 첫 실행 결과를 파일로 저장해 두었다가 다음 실행 결과와 비교한다. 기대값을 직접 쓰기에는 출력이 큰 경우(렌더링된 마크업, 직렬화한 설정 객체, 오류 메시지 목록)에 쓴다.

```js
test('Count는 이름과 숫자를 그린다', () => {
  const { container } = render(<Count name="Alex" />)
  expect(container).toMatchSnapshot()                         // __snapshots__/Count.test.js.snap에 저장
  expect(format(42)).toMatchInlineSnapshot(`"42개"`)          // 테스트 파일 안에 바로 기록
})
```

- 결과가 바뀌면 실패한다. 의도한 변경이면 스냅숏을 갱신한다: `vitest -u`·`jest -u`, watch 모드에서는 `u` 키.
- **스냅숏은 무엇이 맞는지 말해 주지 않는다. 무엇이 바뀌었는지만 말한다.** 큰 스냅숏은 아무도 읽지 않고 갱신만 누르게 된다. 짧게, 가능하면 인라인으로 쓰고, 핵심 동작은 명시적 단언으로 검증한다([[js-testing-best-practices|JavaScript 테스트 모범 사례]]).
- 스냅숏 파일은 커밋한다. 리뷰 때 diff로 변경을 확인한다.

## 테스트 케이스와 스위트

```js
// 전통·TDD 이름
suite('수학 함수', () => {
  test('0이면 0을 돌려준다', () => {
    assert.equal(fibonacci(0), 0)
  })
  test('버그 #4141: 0에서 NaN을 돌려주지 않는다', () => {
    assert.isFinite(fibonacci(0))
  })
})

// BDD 이름
describe('수학 함수', () => {
  it('0이면 0을 돌려준다', () => {
    expect(fibonacci(0)).toBe(0)
  })
})
```

- `suite`↔`describe`, `test`↔`it`은 같은 역할이다. 차이는 이름보다 단언 스타일에 있다.
- 스위트는 구조일 뿐 그 자체로 테스트가 아니다.
- 과거 버그를 막는 회귀 테스트는 이름에 버그 번호를 남기면 추적하기 쉽다. 고치기 **전에** 실패하는 것부터 확인한다.
- 중첩 규칙은 도구마다 다르다. Node 내장 러너(`node:test`)는 `test()` 안에 `test()`를 넣어 계층을 만든다. Vitest·Jest는 `describe()`로만 중첩하고 `test()` 안의 `test()`는 실행하지 않는다.

각 케이스 안은 **준비(Arrange) → 실행(Act) → 검증(Assert)**으로 나눈다. 이름 짓기와 AAA의 세부 원칙은 [[js-testing-best-practices|JavaScript 테스트 모범 사례]]에 있다.

## 수명 주기 훅

| 훅 | 실행 시점 | 쓰임 |
| --- | --- | --- |
| `beforeEach` | 각 테스트 전 | 테스트마다 깨끗한 상태 만들기 |
| `afterEach` | 각 테스트 후 | 만든 데이터·목 정리 |
| `beforeAll` | 스위트 시작 전 한 번 | 비싼 준비(서버 띄우기, MSW `server.listen()`) |
| `afterAll` | 스위트 끝난 뒤 한 번 | 서버 닫기, 전역 복원 |

```js
describe('사용자', () => {
  beforeEach(() => insertFakeUser('bob@example.com', 'hunter2'))
  afterEach(() => clearAllUsers())

  test('bob은 로그인할 수 있다', async () => { /* ... */ })
  test('alice는 bob에게 메시지를 보낼 수 있다', async () => { /* ... */ })
})
```

- 훅은 반복되는 준비·정리를 줄인다. 다만 테스트를 읽을 때 훅까지 찾아봐야 하므로, **테스트의 의미에 필요한 데이터는 테스트 안에 둔다.**
- 준비·정리 훅 자체가 실패하면 테스트가 아니라 **구조의 문제**다. 테스트끼리 상태를 공유하고 있지 않은지 본다.
- 정리 코드가 길어지는 것은 비싼 목을 쓰고 있다는 신호다([[humble-object-pattern|험블 객체 패턴]]).

## 비동기 코드 테스트

러너는 테스트 함수가 **끝난 시점**을 알아야 결과를 판정한다. 비동기 작업을 기다리지 않으면 단언이 실행되기 전에 테스트가 통과로 끝나 버린다.

```js
// 잘못: Promise를 기다리지 않아 단언이 실행되기 전에 테스트가 끝난다
test('데이터를 받는다', () => {
  fetchData().then((data) => expect(data).toBe('peanut butter'))
})
```

| 방법 | 모양 | 비고 |
| --- | --- | --- |
| `async`/`await` | `const data = await fetchData(); expect(data).toBe(...)` | **기본.** 실패 경로는 `await expect(fetchData()).rejects.toThrow('error')` |
| Promise를 `return` | `return fetchData().then(...)` | 러너가 돌려받은 Promise를 기다린다. `return`을 빼먹기 쉽다 |
| `.resolves` / `.rejects` | `await expect(fetchData()).resolves.toBe(...)` | 값을 꺼내지 않고 바로 단언한다. **`await`(또는 `return`)를 꼭 붙인다** |
| `done` 콜백 | `test('...', (done) => { fetchData((d) => { expect(d)…; done() }) })` | 콜백 API용 옛 방식. 단언이 던지면 `done`이 불리지 않아 타임아웃으로 실패하므로 `try/catch`로 `done(error)`를 불러야 한다. Vitest는 지원하지 않으니 Promise로 감싼다 |

`catch` 블록 안에서만 단언하는 테스트는 예외가 **안** 나도 통과해 버린다. `expect.assertions(1)`로 단언이 정확히 몇 번 실행돼야 하는지 못 박거나, `rejects`를 쓴다.

```js
test('실패하면 오류를 던진다', async () => {
  expect.assertions(1)
  try {
    await fetchData()
  } catch (e) {
    expect(e).toMatch('error')
  }
})
```

### 시간을 가짜로: fake timer

`setTimeout`·`setInterval`·`Date`에 기대는 코드를 실제로 기다리면 테스트가 느리고 불안정해진다. **가짜 타이머**로 바꾸고 시간을 직접 흘린다.

```js
beforeEach(() => vi.useFakeTimers())        // Jest: jest.useFakeTimers()
afterEach(() => vi.useRealTimers())

test('3초 뒤 알림을 닫는다', () => {
  render(<Toast />)
  vi.advanceTimersByTime(3000)              // Jest: jest.advanceTimersByTime(3000)
  expect(screen.queryByRole('status')).toBeNull()
})
```

| 함수 (Vitest `vi.*` / Jest `jest.*`) | 하는 일 |
| --- | --- |
| `useFakeTimers()` / `useRealTimers()` | 타이머 함수를 가짜로 바꾸고 되돌린다 |
| `advanceTimersByTime(ms)` | 그만큼 시간을 흘리며 그 사이 예약된 콜백을 실행한다 |
| `runAllTimers()` · `runOnlyPendingTimers()` | 예약된 타이머를 모두 / 지금 걸린 것만 실행한다 |
| `clearAllTimers()` | 남은 타이머를 지운다 |
| `setSystemTime(date)` | 현재 시각(`Date.now()`)을 고정한다 |

React 컴포넌트에서 타이머가 상태를 바꾸면 갱신이 `act()` 안에서 일어나야 경고가 없다. Testing Library의 `render`·`fireEvent`·`user-event`는 이미 `act`로 감싸 주므로, 직접 타이머를 흘릴 때만 `act(() => vi.advanceTimersByTime(3000))`로 감싼다. user-event를 가짜 타이머와 함께 쓸 때는 `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`을 준다.

## 테스트 파일은 어디에 두나

러너는 이름 규칙으로 테스트 파일을 찾는다. Vitest·Jest는 기본으로 `*.test.*`·`*.spec.*`를 모은다.

| 테스트 | 흔한 위치 |
| --- | --- |
| 단위·컴포넌트 | 대상 옆의 짝 파일 (`UserList.tsx` ↔ `UserList.test.tsx`) |
| 통합 | 별도 폴더. 테스트 전용 도우미·픽스처를 함께 둔다 |
| E2E | 시나리오마다 파일 하나 (`e2e/checkout.spec.ts`) |

`globals: true`로 `test`·`expect`를 전역에 두는 설정도 있지만, **명시적으로 import하면** 에디터가 정의와 문서를 찾아 자동 완성해 준다. Chai `assert`만 해도 메서드가 100개가 넘는다.

```js
import { describe, test, expect } from 'vitest'
```

## 정리

- 테스트는 실패하면 던지는 코드다. 프레임워크는 단언과 테스트 케이스라는 두 부품을 준다.
- 단언은 참·동등·깊은 동등 세 가지가 기본이다. 객체·배열은 깊은 동등으로, 인자는 실제값 → 기대값 순서로.
- assert와 expect는 스타일 차이다. Vitest는 둘 다, Jest는 expect만.
- 스냅숏은 바뀐 것만 알려 준다. 짧게 쓰고 핵심은 명시적 단언으로.
- 스위트로 묶고 수명 주기 훅으로 준비·정리한다. 훅이 실패하면 구조를 의심한다.
- 비동기 테스트는 반드시 기다린다(`await`, `return`). 시간은 가짜 타이머로 흘린다.
- 이름은 도구마다 다르니 개념으로 이해하고 자기 도구에 대응시킨다.

관련 노트: [[js-testing-best-practices|JavaScript 테스트 모범 사례]], [[frontend-test-types|프론트엔드 테스트의 종류와 도구]], [[test-run-stages|테스트를 돌리는 시점]], [[tdd|프론트엔드에서의 TDD]]
