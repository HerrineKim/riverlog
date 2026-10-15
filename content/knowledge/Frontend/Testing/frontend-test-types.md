---
title: "프론트엔드 테스트의 종류와 도구"
concept: "Frontend Testing"
summary: "정적·단위·통합·E2E 테스트가 각각 무엇을 확인하는지, 테스트 대역(더미·스텁·스파이·페이크·목)의 차이, 구현이 아니라 사용자 행위를 검증하는 원칙과 테스트 작성 원칙(AAA, 블랙박스, 현실적인 데이터), 그리고 층마다 쓰는 도구(TypeScript·ESLint, Vitest·Jest, Testing Library, MSW, Playwright)."
tags: ["testing", "frontend", "javascript", "tdd"]
source: other
date: "2026-10-13"
sources: ["https://velog.io/@leehyunho2001/%ED%85%8C%EC%8A%A4%ED%8A%B8%EB%A5%BC-%EC%B2%98%EC%9D%8C-%EA%B3%B5%EB%B6%80%ED%95%98%EB%8A%94-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EA%B0%9C%EB%85%90-%EB%8B%A4%EC%A7%80%EA%B8%B0", "https://jeonghwan-kim.github.io/tool/2017/03/28/jasmine.html"]
---

> 이현호의 「[테스트를 처음 공부하는 프론트엔드 개발자의 개념 다지기](https://velog.io/@leehyunho2001/%ED%85%8C%EC%8A%A4%ED%8A%B8%EB%A5%BC-%EC%B2%98%EC%9D%8C-%EA%B3%B5%EB%B6%80%ED%95%98%EB%8A%94-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EA%B0%9C%EB%85%90-%EB%8B%A4%EC%A7%80%EA%B8%B0)」(2022.06)와 김정환의 「[자스민으로 프론트엔드 테스트 코드 작성하기](https://jeonghwan-kim.github.io/tool/2017/03/28/jasmine.html)」(2017.03)를 바탕으로 재구성한 노트다. 테스트 작성 원칙은 Yoni Goldberg의 「[JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices/blob/master/readme.kr.md)」에서 뽑았다.

## 프론트엔드 테스트란

화면을 띄워 눈으로 확인하고, 버튼을 눌러 보고, `console.log`로 값을 찍는 것도 테스트다. 문제는 **매번 손으로 반복해야 한다는 것**이다. 기능이 늘수록 수동 확인은 감당이 안 되고, 확인이 두려워 리팩터링을 미루면 기술 부채가 쌓인다. 테스트 코드는 이 확인을 자동화해 다음을 얻는다.

- 겁 없이 리팩터링할 수 있다.
- 요구 사항을 만족하는지 계속 검사한다.
- 테스트가 곧 동작 명세라 코드를 읽고 협업하기 쉬워진다.

모든 코드를 테스트할 필요는 없다. 작성 비용이 들기 때문에 **깨지면 아픈 곳부터** 테스트한다.

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

## 테스트 대역(Test Double)

테스트 대상이 다른 객체에 의존할 때 그 자리를 대신하는 가짜 객체를 통틀어 테스트 대역이라 한다. 「목(mock)」이라고 뭉뚱그려 부르지만 역할이 다르다.

| 종류 | 하는 일 | 예 |
| --- | --- | --- |
| 더미(dummy) | 자리만 채운다. 실제로 쓰이지 않는다 | 필수 인자라서 넘기는 빈 객체 |
| 스텁(stub) | 정해진 값을 돌려준다 | 항상 `"World"`를 반환하는 `getName` |
| 스파이(spy) | 스텁처럼 동작하면서 **호출 기록**을 남긴다 | `vi.fn()`, `jest.fn()`, `vi.spyOn()` |
| 페이크(fake) | 간단하지만 실제로 동작하는 구현. 운영에는 못 쓴다 | 메모리 DB, 가짜 저장소 |
| 목(mock) | 기대한 호출이 일어났는지 **행위**를 검증한다 | "저장 메서드가 이 인자로 한 번 불렸다" |

네트워크는 함수를 목으로 바꾸기보다 **요청 단에서 가로채는 편**이 테스트를 덜 깨뜨린다. MSW(Mock Service Worker)는 같은 핸들러를 테스트, 브라우저 개발 환경, Storybook에서 함께 쓴다. 목을 많이 쓸수록 테스트가 비싸지는 이유와 줄이는 설계는 [[humble-object-pattern|험블 객체 패턴]]에 정리했다.

## 구현이 아니라 행위를 검증한다

컴포넌트 테스트에는 두 접근이 있다.

| 접근 | 검증 대상 | 리팩터링 시 |
| --- | --- | --- |
| 구현 중심 | 컴포넌트 내부 state, props, 자식 구조 | 동작이 같아도 내부를 바꾸면 깨진다 |
| 행위 중심 | 사용자가 보는 텍스트, 역할(role), 상호작용 결과 | 사용자가 보는 동작이 같으면 통과한다 |

**행위 중심이 표준이다.** Testing Library는 state나 props에 접근하는 API를 아예 주지 않고, 사용자가 화면을 찾는 방식(텍스트, 역할, 레이블)으로만 요소를 찾게 한다. 역할과 접근 가능한 이름으로 요소를 찾는 방법은 [[a11y-driven-testing|접근성 기반 UI 테스트 자동화]]에 있다.

## 테스트 작성 원칙

모든 원칙의 출발점은 한 문장이다. **테스트는 단순하고 짧고 추상화 없이, 보자마자 의미를 알 수 있게 만든다.** 이름에 대상·상황·기대를 담고, AAA로 나누고, 공개된 동작만 검증하고, 데이터는 현실적으로 테스트마다 따로 만든다. 원칙 전체와 커버리지·뮤테이션 테스트·CI 운영은 [[js-testing-best-practices|JavaScript 테스트 모범 사례]]에 모았다.

## 도구 고르기

| 용도 | 기본 선택 | 대안·비고 |
| --- | --- | --- |
| 테스트 러너·단언 | **Vitest** (Vite 기반 프로젝트, ESM·TS 기본 지원) | Jest. 기존 프로젝트와 React Native에서 여전히 많이 쓴다. API가 거의 같아 옮기기 쉽다 |
| DOM 환경 | jsdom, happy-dom | 실제 브라우저가 필요하면 Vitest 브라우저 모드 |
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

`toHaveTextContent`, `toBeInTheDocument` 같은 DOM 전용 matcher는 `@testing-library/jest-dom`을 설정해야 쓸 수 있다. 실행 옵션(한 파일 커버리지, 특정 테스트 빼기)은 [[jest-practices|Jest·Vitest 실행 팁]]에 있다.

## 역사

- 2010년대 브라우저 테스트는 **Jasmine**(매처가 내장된 BDD 스타일 프레임워크)을 **Karma**(실제 브라우저를 띄워 테스트를 돌리는 러너)로 실행하는 조합이 표준이었다. 화면 없이 돌리려고 PhantomJS를 썼지만 ES6를 지원하지 못해 헤드리스 Chrome으로 넘어갔다. Karma는 2023년에 지원 종료가 발표됐고, Angular도 기본 러너를 바꿨다.
- Node 쪽은 러너인 Mocha에 단언 라이브러리(Chai)와 목 라이브러리(Sinon)를 따로 붙여 썼다. Jest가 러너·단언·목·스냅숏을 한 패키지로 묶으며 주류가 됐고, 이후 Vite 생태계와 함께 Vitest가 그 자리를 이어받고 있다.
- React 컴포넌트는 한때 Airbnb의 **Enzyme**으로 내부 state와 얕은 렌더링(shallow rendering)을 검사했다. 구현에 묶여 쉽게 깨지는 문제와 React 18 미지원으로 지금은 Testing Library로 대체됐다.

## 정리

- 정적 검사 → 단위 → 통합 → E2E 순으로 비용과 실제감이 함께 오른다. 프론트엔드는 통합 테스트의 효율이 가장 좋다.
- 「목」은 더미·스텁·스파이·페이크·목을 구분해서 쓴다. 네트워크는 MSW로 요청 단에서 가로챈다.
- **사용자가 보는 행위를 검증한다.** 내부 구현을 검사하는 테스트는 리팩터링을 막는다.
- 테스트는 짧고 읽기 쉽게: 이름에 대상·상황·기대 결과, 본문은 AAA.
- 기본 조합은 TypeScript·ESLint + Vitest + Testing Library + MSW + Playwright다.

관련 노트: [[js-testing-best-practices|JavaScript 테스트 모범 사례]], [[tdd|프론트엔드에서의 TDD]], [[humble-object-pattern|험블 객체 패턴]], [[jest-practices|Jest·Vitest 실행 팁]], [[a11y-driven-testing|접근성 기반 UI 테스트 자동화]], [[software-testing|소프트웨어 테스트]]
