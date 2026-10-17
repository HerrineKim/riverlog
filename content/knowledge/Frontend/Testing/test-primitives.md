---
title: "테스트의 기본 요소: 테스트 케이스, 단언, 스위트, 수명 주기 훅"
concept: "Test Primitives"
summary: "거의 모든 테스트 프레임워크가 주는 공통 부품을 정리한다. 실패하면 던지는 단언(참·동등·깊은 동등), assert 스타일과 expect(BDD) 스타일, 테스트 케이스와 스위트(test·suite / it·describe), beforeEach·afterEach·beforeAll·afterAll, 테스트 파일을 두는 위치. 이름은 도구마다 달라도 개념은 같다."
tags: ["testing", "javascript", "vitest", "jest"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/testing/get-started/what-testing-is", "https://web.dev/learn/testing/assertions/tools", "https://web.dev/learn/testing/appendix"]
---

> web.dev의 「[Learn Testing](https://web.dev/learn/testing)」 강좌의 「What testing is」, 「Tools of the trade」, 「Appendix」 모듈을 바탕으로 재구성한 노트다.

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
- 스위트로 묶고 수명 주기 훅으로 준비·정리한다. 훅이 실패하면 구조를 의심한다.
- 이름은 도구마다 다르니 개념으로 이해하고 자기 도구에 대응시킨다.

관련 노트: [[js-testing-best-practices|JavaScript 테스트 모범 사례]], [[frontend-test-types|프론트엔드 테스트의 종류와 도구]], [[jest-practices|Jest·Vitest 실행 팁]], [[tdd|프론트엔드에서의 TDD]]
