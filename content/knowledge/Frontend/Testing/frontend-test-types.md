---
title: "프론트엔드 테스트의 종류와 도구"
concept: "Frontend Testing"
summary: "정적·단위·통합·E2E 테스트가 각각 무엇을 확인하는지, 무엇부터 테스트할지, 피라미드·트로피 같은 전략의 모양과 스모크·회귀·시각 같은 목적별 테스트, 폴더 역할(apis·components·hooks·context·pages)별로 무엇을 검증할지, 테스트 대역(더미·스텁·스파이·페이크·목)의 차이, 구현이 아니라 사용자 행위를 검증하는 원칙과 테스트 작성 원칙(AAA, 블랙박스, 현실적인 데이터), 그리고 층마다 쓰는 도구(TypeScript·ESLint, Vitest·Jest, Testing Library, MSW, Playwright)."
tags: ["testing", "frontend", "javascript", "tdd"]
source: other
date: "2026-10-21"
sources: ["https://velog.io/@gyulog/%EB%82%B4%EA%B0%80-%EC%83%9D%EA%B0%81%ED%95%98%EB%8A%94-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EB%8B%A8%EC%9C%84", "https://velog.io/@leehyunho2001/%ED%85%8C%EC%8A%A4%ED%8A%B8%EB%A5%BC-%EC%B2%98%EC%9D%8C-%EA%B3%B5%EB%B6%80%ED%95%98%EB%8A%94-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EA%B0%9C%EB%85%90-%EB%8B%A4%EC%A7%80%EA%B8%B0", "https://jeonghwan-kim.github.io/tool/2017/03/28/jasmine.html", "https://web.dev/learn/testing/get-started/test-types", "https://web.dev/learn/testing/get-started/what-to-test", "https://web.dev/learn/testing/get-started/what-testing-is", "https://www.integer.blog/practical-test-pyramid/", "https://martinfowler.com/bliki/TestDouble.html", "https://dev.to/milipski/test-doubles---fakes-mocks-and-stubs", "https://semaphoreci.com/community/tutorials/best-practices-for-spies-stubs-and-mocks-in-sinon-js", "http://blog.testdouble.com/posts/2016-03-13-testdouble-vs-sinon.html", "http://airbnb.io/enzyme/", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Jest%20UI%20testing.md", "https://testing-library.com/docs/queries/about"]
---

> 이현호의 「[테스트를 처음 공부하는 프론트엔드 개발자의 개념 다지기](https://velog.io/@leehyunho2001/%ED%85%8C%EC%8A%A4%ED%8A%B8%EB%A5%BC-%EC%B2%98%EC%9D%8C-%EA%B3%B5%EB%B6%80%ED%95%98%EB%8A%94-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EA%B0%9C%EB%85%90-%EB%8B%A4%EC%A7%80%EA%B8%B0)」(2022.06)와 김정환의 「[자스민으로 프론트엔드 테스트 코드 작성하기](https://jeonghwan-kim.github.io/tool/2017/03/28/jasmine.html)」(2017.03)를 바탕으로 재구성한 노트다. 테스트 작성 원칙은 Yoni Goldberg의 「[JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices/blob/master/readme.kr.md)」에서, 폴더 역할별 테스트 단위는 김승규의 「[내가 생각하는 프론트엔드 테스트 단위](https://velog.io/@gyulog/%EB%82%B4%EA%B0%80-%EC%83%9D%EA%B0%81%ED%95%98%EB%8A%94-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EB%8B%A8%EC%9C%84)」(2023.06)에서 뽑았다. 테스트 우선순위, 전략의 모양, 목적별 테스트 종류는 web.dev의 「[Learn Testing](https://web.dev/learn/testing)」 강좌로 보강했다. 「[실용적인 테스트 피라미드](https://www.integer.blog/practical-test-pyramid/)」의 내용을 더해 보강했다. 테스트 대역은 「[Test Double](https://martinfowler.com/bliki/TestDouble.html)」, 「[Test Doubles - Fakes, Mocks and Stubs](https://dev.to/milipski/test-doubles---fakes-mocks-and-stubs)」, 「[Best Practices for Spies, Stubs and Mocks in Sinon.js](https://semaphoreci.com/community/tutorials/best-practices-for-spies-stubs-and-mocks-in-sinon-js)」, 「[testdouble.js vs. sinon.js](http://blog.testdouble.com/posts/2016-03-13-testdouble-vs-sinon.html)」을 바탕으로 보강했다. Testing Library 쿼리 접두어 표는 「[Frontend_TIL: Jest UI testing](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Jest%20UI%20testing.md)」을 바탕으로 보강했다.

## 프론트엔드 테스트란

화면을 띄워 눈으로 확인하고, 버튼을 눌러 보고, `console.log`로 값을 찍는 것도 테스트다. 문제는 **매번 손으로 반복해야 한다는 것**이다. 기능이 늘수록 수동 확인은 감당이 안 되고, 확인이 두려워 리팩터링을 미루면 기술 부채가 쌓인다. 테스트 코드는 이 확인을 자동화해 다음을 얻는다.

- 겁 없이 리팩터링할 수 있다.
- 요구 사항을 만족하는지 계속 검사한다.
- 테스트가 곧 동작 명세라 코드를 읽고 협업하기 쉬워진다.

모든 코드를 테스트할 필요는 없다. 작성 비용이 들기 때문에 **깨지면 아픈 곳부터** 테스트한다. 테스트는 소프트웨어를 만들기 위한 수단이지 목적이 아니다.

### 무엇부터 테스트하나

작은 단위 테스트를 잔뜩 써서 커버리지를 올리기는 쉽다. 하지만 그것이 프로젝트의 위험을 줄인다는 보장은 없다. 서랍 하나를 따로 열고 닫는 테스트가 통과해도, 옆 서랍 손잡이에 걸려 안 열리는 문제는 둘을 함께 놓아야 보인다.

| 우선순위 | 대상 | 이유 |
| --- | --- | --- |
| 1 | 앱·사이트·라이브러리의 **핵심 사용 사례** | 사용자 경험을 떠받치는 부분이 깨지면 가장 아프다 |
| 2 | **가장 많은 정보를 주는 코드**: 깨지기 쉬운 곳, 레거시, 엉망으로 짠 곳 | 테스트로 동작을 먼저 고정해 두면 리팩터링하거나 걷어 낼 때까지 버틴다 |

- 테스트마다 **목표를 하나** 분명히 둔다. 모든 것을 확인하는 거대한 테스트는 관리하기 어렵다.
- 테스트가 대상 코드와 깔끔하게 상호작용하지 못하면 그 코드의 추상화가 약하다는 신호다.
- 무엇이 중요한지는 제품이 정한다. 알고리즘이 핵심인 시스템은 정교한 단위 테스트가, 터치 입력이 많은 도구는 시각·E2E 테스트가 중심이 된다.

## 테스트의 층

| 층 | 확인하는 것 | 실행 비용 | 대표 도구 |
| --- | --- | --- | --- |
| 정적 검사 | 타입 오류, 잘못된 패턴, 컨벤션 | 거의 없음 (저장할 때마다) | TypeScript, ESLint, Biome |
| 단위 테스트 | 함수, 커스텀 훅, 컴포넌트 하나 | 낮음 | Vitest, Jest |
| 통합 테스트 | 여러 모듈이 함께 동작하는가. 상태 변화에 따른 UI, UI와 API의 상호작용 | 중간 | Testing Library + Vitest/Jest, MSW |
| E2E 테스트 | 실제 브라우저에서 사용자 흐름 전체 | 높음 (느리고 불안정할 수 있음) | Playwright, Cypress |

아래 층일수록 빠르고 많이 쓰고, 위 층일수록 느리지만 실제 사용자 경험에 가깝다. 프론트엔드에서는 **통합 테스트가 비용 대비 확신을 가장 많이 준다**는 「테스팅 트로피」 관점이 널리 쓰인다.

### 단위와 통합의 경계: 협력 객체를 진짜로 쓰나

| 방식 | 단위 테스트에서 | 통합 테스트에서 |
| --- | --- | --- |
| 진짜를 쓴다 | Sociable: 자식 컴포넌트까지 렌더링 | Broad: 의존 모듈을 모두 연결 |
| 대역으로 바꾼다 | Solitary: 자식 컴포넌트를 목으로 대체 | Narrow: 외부 API를 가짜 서버로 대체 |

단위·컴포넌트·통합·E2E라는 이름에는 엄격한 정의가 없다. 「컴포넌트」만 해도 React 컴포넌트일 수도, 의존성이 있는 클래스일 수도 있다. 팀이 자기 코드베이스에 맞게 뜻을 정한다. 컴포넌트의 의존성을 대역으로 바꾸는 실제 기법은 [[component-test-dependencies|의존성이 있는 컴포넌트 테스트하기]]에 있다.

### 테스트 전략의 모양

층마다 테스트를 얼마나 둘지는 도형으로 비유한다. 어느 모양이든 **아래는 빠르고 많게, 위는 느리지만 넓게**라는 원리는 같고, 차이는 어느 층에 무게를 두느냐다.

| 모양 | 무게 중심 | 언제 맞나 |
| --- | --- | --- |
| 피라미드(pyramid) | 단위 테스트를 가장 많이, E2E를 가장 적게 | 로직이 많은 라이브러리·백엔드 |
| 트로피(trophy) | 정적 검사를 바닥에 깔고 **통합 테스트**를 가장 두껍게 | 컴포넌트와 상태가 얽힌 프론트엔드 |
| 다이아몬드(diamond)·벌집(honeycomb) | 가운데(통합) 층이 가장 넓다 | 여러 서비스가 맞물리는 시스템, 마이크로서비스 |
| 아이스크림콘(ice cream cone) | 수동·E2E가 가장 많고 단위가 적다 | 피해야 할 **안티패턴**. 느리고 깨지기 쉽다 |

많은 모양에서 꼭대기는 **수동 테스트**다. 자동화하기에 너무 복잡한 상호작용이 남기 때문이다.

### 목적별 테스트

모양은 **범위**라는 한 차원만 그린다. 아래 테스트는 범위가 아니라 **목적·기법**으로 붙은 이름이라 어느 층에서든 쓸 수 있다. 예를 들어 스모크 테스트는 단위 테스트일 수도 E2E일 수도 있고, 시각 테스트는 컴포넌트 하나에도 사이트 전체에도 건다. 그래서 기능 하나에 여러 종류의 테스트가 필요할 때가 많다.

| 종류 | 확인하는 것 | 메모 |
| --- | --- | --- |
| 스모크(smoke) | 코드베이스가 쓸 만한 상태인가. 영향 범위가 넓은 곳(로그인·인증) 위주 | 큰 프로젝트의 기본 `test` 스크립트 후보. 배포 직후에도 돌린다 |
| 회귀(regression) | 기존 기능이 그대로이고 고친 버그가 돌아오지 않았나 | 버그를 재현하는 테스트를 먼저 쓰고 고친 뒤 남겨 두면 회귀 테스트가 된다([[tdd\|TDD]]) |
| 시각(visual) | 스크린숏을 기준 이미지와 비교 | 실제 브라우저가 필요하다. 컴포넌트를 여러 화면 폭으로 그리는 하네스를 둔다. 무관한 변경(새 기능, OS의 이모지 렌더링)에도 깨지므로 너무 엄격해지기 쉽다 |
| API | 내가 제공하는 API, 또는 내가 쓰는 외부 API의 계약 | 시스템을 통째로 붙이지 않고 경계만 본다. 실제 외부 서비스에 붙이면 불안정하다 |
| 계약(contract) | 서비스 사이의 요청·응답 형식이 서로의 기대와 맞나 | 소비자 주도 계약 테스트(CDC): 소비자가 기대하는 응답을 테스트로 적어 공급자에게 넘기고, 공급자는 이를 CI에서 계속 돌린다. Pact가 대표 도구다. 양쪽을 통째로 띄우는 E2E 없이 경계가 깨지는 것을 잡는다 |
| 탐색적(exploratory) | 자동화가 놓친 품질 문제 | 사람이 직접 써 보며 찾는다. 찾은 버그는 자동화 테스트로 옮겨 재발을 막는다 |
| 인수(acceptance) | 제품이 사용자 요구를 만족하는가 | 사람이 하거나 [[a11y-driven-testing\|접근성 기반 테스트]]처럼 기획서를 자동화한다 |
| 퍼즈(fuzz) | 무작위·잘못된 입력에도 죽지 않나 | 무작위 입력을 「카오스 테스트」라 부르기도 한다. 생성 입력은 프로퍼티 기반 테스트로([[js-testing-best-practices\|모범 사례]]) |
| 장애(failure) | 네트워크 끊김·의존 서비스 실패에 통제된 방식으로 반응하나 | MSW로 오류 응답, Playwright의 오프라인 모드 |
| 빌드 | 빌드 산출물이 생기고 기대한 내용이 들어 있나 | 정적 사이트·CMS 출력처럼 산출물이 복잡할 때 |
| 부하·스트레스(load·stress) | 운영 시스템이 큰 트래픽을 견디나 | 시스템 설계 쪽 관심사다 |

**같은 로직을 여러 층에서 반복 검증하지 않는다.** 아래 층에서 이미 확인한 분기는 위 층에서 다시 쓰지 않고, 위 층은 아래 층이 볼 수 없는 연결만 본다. 고유한 가치를 더하지 않는 테스트는 지운다.

E2E는 테스트용 사용자로 로그인해 핵심 동작을 하고 최종 상태를 확인하는 식으로 짠다. 범위를 줄이려면 테스트 환경 플래그로 로그인을 건너뛰는 식으로 일부를 가짜로 둔다. 테스트가 데이터베이스에 남긴 데이터가 다음 테스트를 흔들지 않도록 레코드는 테스트마다 만들고, 정리 시점(테스트마다 또는 전체가 끝난 뒤)을 정한다([[js-testing-best-practices|모범 사례]]).

## 폴더 역할별로 무엇을 테스트하나

층을 정했으면 "어느 파일을 어떤 단위로 테스트할까"가 남는다. 실용적인 기준은 **폴더(모듈)마다 맡은 책임을 하나씩 검증**하는 것이다. 정답이 정해진 분류는 아니고, 팀이 합의할 출발점이다.

| 폴더 | 책임 | 검증할 것 | 방법 |
| --- | --- | --- | --- |
| `apis` | 서버와 통신 | 올바른 요청을 보내고 응답을 원하는 모양으로 돌려주나 | MSW로 응답을 고정하고 함수를 호출한다. axios·fetch를 직접 목으로 바꾸면 구현에 묶인다 |
| `components` (공통 UI) | 받은 props대로 그리고 알린다 | 렌더링되나, 클릭하면 받은 `onClick`을 부르나 | 단위 테스트. 버튼이 어디에 쓰일지가 아니라 **받은 콜백을 부르는 것**까지가 책임이다 |
| `hooks` | 재사용 로직 | 입력·환경(예: 저장된 토큰 유무)에 따라 올바른 값을 돌려주나 | `renderHook` |
| `context`·스토어 | 도메인 상태 | 추가·수정·삭제 뒤 상태가 맞나, Provider 밖에서 쓰면 에러를 던지나 | Provider로 감싸 렌더링하거나 `renderHook`의 `wrapper` |
| `pages` | 기능 하나의 사용자 흐름 | 유효한 입력일 때만 버튼이 켜지나, 성공하면 이동하고 실패하면 알리나, 로그인 상태면 리다이렉트하나 | 페이지 통합 테스트(Testing Library + MSW + 메모리 라우터). 실제 브라우저가 필요한 핵심 흐름만 E2E |

```tsx
test('저장된 토큰이 있으면 로그인 상태다', () => {
  localStorage.setItem('token', 'abc')
  const { result } = renderHook(() => useAuth())
  expect(result.current).toEqual({ isLogin: true, token: 'abc' })
})
```

아래 폴더일수록 단위 테스트로 좁게, `pages`로 갈수록 통합 테스트로 넓게 검증한다. 같은 동작을 여러 층에서 반복해 확인하지 않는다.

## 테스트 대역(Test Double)

테스트 대상이 다른 객체에 의존할 때 그 자리를 대신하는 가짜 객체를 통틀어 테스트 대역이라 한다. 「목(mock)」이라고 뭉뚱그려 부르지만 역할이 다르다.

| 종류 | 하는 일 | 예 |
| --- | --- | --- |
| 더미(dummy) | 자리만 채운다. 실제로 쓰이지 않는다 | 필수 인자라서 넘기는 빈 객체 |
| 스텁(stub) | 정해진 값을 돌려준다 | 항상 `"World"`를 반환하는 `getName` |
| 스파이(spy) | 스텁처럼 동작하면서 **호출 기록**을 남긴다 | `vi.fn()`, `jest.fn()`, `vi.spyOn()` |
| 페이크(fake) | 간단하지만 실제로 동작하는 구현. 운영에는 못 쓴다 | 메모리 DB, 가짜 저장소 |
| 목(mock) | 기대한 호출이 일어났는지 **행위**를 검증한다 | "저장 메서드가 이 인자로 한 번 불렸다" |

**대역의 종류는 만드는 API가 아니라 쓰는 방식이 정한다.** `vi.fn()` 하나가 반환값을 정하면 스텁, 호출을 단언하면 스파이 역할을 한다. 과거 Sinon.js는 `spy`·`stub`·`mock`을 따로 만들게 했는데, testdouble.js는 함수 하나(`td.func()`)를 설정에 따라 쓰게 하고 전역 `td.reset()`으로 한 번에 복원하는 쪽을 택했다. Vitest·Jest의 `vi.fn`/`jest.fn`도 같은 방향이다.

### 언제, 어떤 대역을 쓰나

대역이 필요한 곳은 **부작용(side effect)이 있는 의존성**이다. 결과가 인자에만 달린 순수 함수(`toLowerCase`)는 진짜를 쓴다. 저장·네트워크·현재 시각·랜덤처럼 바깥 상태에 기대거나, 너무 느려 테스트를 늦추는 것만 바꾼다.

고르는 기준은 **명령-조회 분리(CQS)** 로 정리된다.

| 대상 메서드 | 검증 방법 | 대역 |
| --- | --- | --- |
| 조회(query): 값을 돌려주고 상태를 바꾸지 않는다 | 대상의 **반환값**을 단언한다 | 스텁. 계산에 필요한 만큼만 값을 정한다(`gradesFor` → `[8, 6, 10]`이면 평균 `8`) |
| 명령(command): 상태를 바꾸고 돌려주는 값이 없다 | 의존성이 **불렸는지**를 단언한다 | 스파이(또는 목). 메일을 실제로 보내지 않고 `send`가 이 인자로 한 번 불렸는지 본다 |
| 진짜를 쓰기엔 무겁지만 동작은 필요하다 | 결과 상태를 단언한다 | 페이크. 메모리 저장소로 DB 없이 서비스 통합 테스트를 돌린다. 프로토타입에서 DB 설계를 미루는 데도 쓴다 |

스텁은 이것 말고도 **평소엔 안 타는 경로를 강제로 탄다**(`mockRejectedValue(new Error('oops'))`로 에러 처리 검증). 비동기 콜백을 즉시 부르게 해 테스트를 동기로 만들 수도 있다.

네트워크는 함수를 목으로 바꾸기보다 **요청 단에서 가로채는 편**이 테스트를 덜 깨뜨린다. MSW(Mock Service Worker)는 같은 핸들러를 테스트, 브라우저 개발 환경, Storybook에서 함께 쓴다. 목을 많이 쓸수록 테스트가 비싸지는 이유와 줄이는 설계는 [[humble-object-pattern|험블 객체 패턴]]에 정리했다.

### 쓸 때의 함정

| 함정 | 내용 | 대응 |
| --- | --- | --- |
| 목의 과한 기대 | 목은 기대를 **먼저** 선언하고(`expects('save').once().withArgs(user)`) 마지막에 `verify()`한다. 조건을 늘리기 쉬워 구현 세부에 묶인 **깨지기 쉬운 테스트**가 된다. 준비-실행-단언(AAA) 순서도 거스른다 | 스텁 + 필요한 단언 한두 개로 쓴다. 단언이 여러 개 필요하면 테스트를 나눈다 |
| 부분 대역(partial double) | `vi.spyOn(obj, 'method')`은 기본적으로 **진짜 구현을 호출하면서** 기록만 한다. "호출을 검증"하려는지 "통합 동작을 확인"하려는지가 섞인다 | 의도를 하나로 정한다. 대체하려면 `.mockImplementation()`이나 `.mockReturnValue()`를 붙인다 |
| 복원 누락 | 바꿔 끼운 메서드를 되돌리지 않으면 **다음 테스트들이 연쇄로 실패**한다. 테스트가 중간에 던지면 끝의 `restore()`까지 가지 못한다 | `afterEach(() => vi.restoreAllMocks())` 또는 설정의 `restoreMocks: true`. 공유 스텁은 `beforeEach`에서 만든다 |
| 가짜 타이머와 비동기 | 가짜 타이머가 켜져 있으면 `setTimeout`에 기대는 비동기 테스트가 시간 초과로 실패한다 | 필요한 테스트에서만 `vi.useFakeTimers()`, 끝나면 `vi.useRealTimers()` |

## 구현이 아니라 행위를 검증한다

컴포넌트 테스트에는 두 접근이 있다.

| 접근 | 검증 대상 | 리팩터링 시 |
| --- | --- | --- |
| 구현 중심 | 컴포넌트 내부 state, props, 자식 구조 | 동작이 같아도 내부를 바꾸면 깨진다 |
| 행위 중심 | 사용자가 보는 텍스트, 역할(role), 상호작용 결과 | 사용자가 보는 동작이 같으면 통과한다 |

두 접근은 일반적인 용어로 **불투명 상자(opaque box, 블랙박스)**와 **투명 상자(clear box, 화이트박스)** 테스트다. 특별한 이유가 없으면 불투명 상자로 시작한다. 그래야 테스트가 실제 사용 방식을 반영하고, 내부를 고쳐도 회귀를 잡는다. 내부를 들여다봐야만 테스트할 수 있다면 의존성을 추상화해 주입받거나 상태를 알려 주는 콜백을 두어 코드를 불투명하게 바꾼다.

**행위 중심이 표준이다.** Testing Library는 state나 props에 접근하는 API를 아예 주지 않고, 사용자가 화면을 찾는 방식(텍스트, 역할, 레이블)으로만 요소를 찾게 한다. 역할과 접근 가능한 이름으로 요소를 찾는 방법은 [[a11y-driven-testing|접근성 기반 UI 테스트 자동화]]에 있다.

## 테스트 작성 원칙

모든 원칙의 출발점은 한 문장이다. **테스트는 단순하고 짧고 추상화 없이, 보자마자 의미를 알 수 있게 만든다.** 이름에 대상·상황·기대를 담고, AAA로 나누고, 공개된 동작만 검증하고, 데이터는 현실적으로 테스트마다 따로 만든다. 원칙 전체와 커버리지·뮤테이션 테스트·CI 운영은 [[js-testing-best-practices|JavaScript 테스트 모범 사례]]에 모았다.

## 도구 고르기

| 용도 | 기본 선택 | 대안·비고 |
| --- | --- | --- |
| 테스트 러너·단언 | **Vitest** (Vite 기반 프로젝트, ESM·TS 기본 지원) | Jest. 기존 프로젝트와 React Native에서 여전히 많이 쓴다. API가 거의 같아 옮기기 쉽다 |
| DOM 환경 | jsdom, happy-dom | 실제 브라우저가 필요하면 Vitest 브라우저 모드. 환경 고르는 기준은 [[test-environment\|테스트 실행 환경]] |
| 컴포넌트 | Testing Library (React·Vue·Svelte 등) | 사용자 이벤트는 `user-event`로 |
| 네트워크 | MSW | |
| E2E | **Playwright** (Chromium·Firefox·WebKit, 병렬 실행, 자동 대기) | Cypress는 대화형 디버깅 UI가 강점. Selenium은 여러 언어·레거시 브라우저 그리드가 필요할 때 |
| 시각 회귀 | Playwright 스크린샷 비교, Storybook + Chromatic | |

| 기본 API | 역할 |
| --- | --- |
| `describe` | 관련 테스트를 그룹으로 묶는다 |
| `test` / `it` | 테스트 하나 |
| `expect(...).matcher()` | 결과 검증. `toBe`, `toEqual`, `toHaveBeenCalledTimes`, `toThrow` 등 |
| `vi.fn()` / `jest.fn()` | 호출 여부·인자·횟수를 기록하는 스파이 함수 |
| `render`, `screen.getByRole` | Testing Library로 렌더링하고 역할로 요소를 찾는다 |
| `userEvent.setup()` → `await user.click()` | 실제 사용자 동작(포커스 이동, 키 입력 순서)을 흉내 낸다. `fireEvent`는 user-event가 지원하지 않을 때만 |

Testing Library 쿼리는 **접두어로 "없을 때 어떻게 하나"** 를, 접미어로 무엇으로 찾는지(`ByRole`·`ByLabelText`·`ByPlaceholderText`·`ByText`·`ByDisplayValue`·`ByAltText`·`ByTitle`·`ByTestId`, 앞쪽일수록 우선)를 정한다.

| 접두어 | 없으면 | 여러 개면 | 쓰는 때 |
| --- | --- | --- | --- |
| `getBy` | 즉시 에러 | 에러 | 있어야 하는 요소 |
| `queryBy` | `null` | 에러 | **없음을** 확인할 때: `expect(screen.queryByText('오류')).toBeNull()` |
| `findBy` | 기다리다(기본 1초) 거부 | 거부 | 비동기로 나타나는 요소. `await`한다 |
| `getAllBy`·`queryAllBy`·`findAllBy` | 위와 같음(`queryAllBy`는 `[]`) | 배열 | 목록 |

`toHaveTextContent`, `toBeInTheDocument` 같은 DOM 전용 matcher는 `@testing-library/jest-dom`을 설정해야 쓸 수 있다. 실행 옵션(한 파일 커버리지, 특정 테스트 빼기)은 [[test-run-stages|테스트를 돌리는 시점]]에, 단언·스위트·수명 주기 훅의 개념은 [[test-primitives|테스트의 기본 요소]]에 있다.

## 역사

- 2010년대 브라우저 테스트는 **Jasmine**(매처가 내장된 BDD 스타일 프레임워크)을 **Karma**(실제 브라우저를 띄워 테스트를 돌리는 러너)로 실행하는 조합이 표준이었다. 화면 없이 돌리려고 PhantomJS를 썼지만 ES6를 지원하지 못해 헤드리스 Chrome으로 넘어갔다. Karma는 2023년에 지원 종료가 발표됐고, Angular도 기본 러너를 바꿨다.
- Node 쪽은 러너인 Mocha에 단언 라이브러리(Chai)와 목 라이브러리(Sinon)를 따로 붙여 썼다. Jest가 러너·단언·목·스냅숏을 한 패키지로 묶으며 주류가 됐고, 이후 Vite 생태계와 함께 Vitest가 그 자리를 이어받고 있다.
- React 컴포넌트는 한때 Airbnb의 **Enzyme**으로 내부 state와 얕은 렌더링(shallow rendering)을 검사했다. 구현에 묶여 쉽게 깨지는 문제와 React 18 미지원으로 지금은 Testing Library로 대체됐다.

## 정리

- 정적 검사 → 단위 → 통합 → E2E 순으로 비용과 실제감이 함께 오른다. 프론트엔드는 통합 테스트의 효율이 가장 좋다.
- 핵심 사용 사례와 깨지기 쉬운 코드부터 테스트한다. 모양(피라미드·트로피)은 범위를, 스모크·회귀·시각은 목적을 말한다.
- 「목」은 더미·스텁·스파이·페이크·목을 구분해서 쓴다. 네트워크는 MSW로 요청 단에서 가로챈다.
- **사용자가 보는 행위를 검증한다.** 내부 구현을 검사하는 테스트는 리팩터링을 막는다.
- 테스트는 짧고 읽기 쉽게: 이름에 대상·상황·기대 결과, 본문은 AAA.
- 기본 조합은 TypeScript·ESLint + Vitest + Testing Library + MSW + Playwright다.

관련 노트: [[js-testing-best-practices|JavaScript 테스트 모범 사례]], [[tdd|프론트엔드에서의 TDD]], [[humble-object-pattern|험블 객체 패턴]], [[test-run-stages|테스트를 돌리는 시점]], [[a11y-driven-testing|접근성 기반 UI 테스트 자동화]], [[software-testing|소프트웨어 테스트]], [[test-environment|테스트 실행 환경]], [[component-test-dependencies|의존성이 있는 컴포넌트 테스트하기]], [[test-primitives|테스트의 기본 요소]], [[static-analysis|정적 분석]], [[backend-testing|백엔드 테스트]], [[api-mocking|API 모킹: MSW와 json-server]], [[storybook|Storybook]], [[test-design-techniques|테스트 설계 기법]]
