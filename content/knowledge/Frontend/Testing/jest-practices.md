---
title: "JavaScript 테스트 원칙과 Jest 실행 팁"
concept: "Jest Practices"
summary: "Yoni Goldberg의 JavaScript Testing Best Practices에서 뽑은 테스트 작성 원칙과, 특정 파일만 커버리지를 재거나 특정 테스트 파일을 빼고 실행하는 Jest 옵션."
tags: ["testing", "jest", "javascript", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/284", "https://riverkim.kr/289", "https://riverkim.kr/307"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트입니다. 원칙 부분은 Yoni Goldberg의 「[JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices/blob/master/readme.kr.md)」(한국어판 있음)를 바탕으로 했습니다.

컴포넌트의 모든 요소를 테스트할 수는 없으므로 "무엇을, 어디까지 테스트하나"에는 판단 기준이 필요하다. 이 노트는 그 기준이 되는 원칙과, Jest로 테스트를 돌릴 때 자주 쓰는 실행 옵션을 모았다. 옵션 이름은 Jest 30 기준이고, Vitest도 같은 개념의 설정(`coverage.include`, `test.exclude`)을 둔다.

## 테스트 작성 원칙

모든 원칙의 출발점은 한 문장이다: **테스트는 단순하고 짧고 추상화 없이, 보자마자 의미를 알 수 있게 만든다.** 테스트 코드는 제품 코드보다 덜 고민하고 읽혀야 한다. 백엔드·프론트엔드 모두에 통한다.

| 원칙 | 내용 |
| --- | --- |
| 이름에 세 가지를 담는다 | 무엇을 테스트하는지, 어떤 상황에서, 기대 결과가 무엇인지 |
| AAA 패턴 | 준비(Arrange) → 실행(Act) → 검증(Assert)으로 나눠 쓴다 |
| 블랙박스로 테스트한다 | 내부 구현이 아니라 공개된 동작·결과를 검증한다. 구현을 바꿔도 깨지지 않아야 한다 |
| 현실적인 입력 데이터 | `"foo"` 같은 더미 대신 실제와 비슷한 데이터를 쓴다 |
| 테스트마다 자기 데이터 | 전역 픽스처를 공유하지 말고 테스트 안에서 필요한 데이터를 만든다 |
| 에러는 기대로 검증 | try/catch로 잡지 말고 `expect(...).toThrow()`처럼 단언한다 |

테스트 자체의 품질은 커버리지, 뮤테이션 테스트(코드를 일부러 바꿔도 테스트가 실패하는지 확인), 테스트용 린트 규칙(`eslint-plugin-jest`, `eslint-plugin-testing-library`)으로 점검한다.

## Jest 실행 팁

### 특정 파일의 커버리지만 보기

전체 커버리지(`npm run test:coverage`)는 숫자가 커서 "지금 쓴 테스트가 이 파일을 얼마나 덮는가"를 보기 어렵다. 테스트 하나만 실행하면서 **원하는 소스 파일의 커버리지만** 모을 수 있다.

```bash
npm test user.spec.js -- --coverage --collectCoverageFrom=src/js/user.js
```

- `--` 뒤의 인자는 npm 스크립트를 거쳐 Jest에 그대로 전달된다.
- 실행하는 테스트 파일과 커버리지를 모을 파일은 달라도 된다.
- 결과 표에서 덮이지 않은 줄 번호(Uncovered Line)를 보고 테스트를 보충한다.

### 특정 테스트 파일 빼고 실행하기

`jest.config.js`의 `testPathIgnorePatterns`에 제외할 경로 패턴을 넣는다. 여러 개를 넣을 수 있다.

```javascript
// jest.config.js
module.exports = {
  testPathIgnorePatterns: ['/node_modules/', 'date-format.test.tsx'],
}
```

- 테스트 **대상** 파일이 아니라 **테스트 파일**(`*.test.tsx` 등)의 이름·경로를 적는다.
- 기본값에 들어 있던 `/node_modules/`는 직접 덮어쓸 때 함께 적어 둔다.

### 환경에 따라 깨지는 테스트

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| 날짜·시간 테스트가 특정 컴퓨터·CI에서만 실패한다 | 테스트가 실행 환경의 타임존에 기대고 있다 | 타임존을 고정한다(`TZ=UTC jest` 또는 설정 파일에서 `process.env.TZ`). 날짜는 오프셋이 명시된 값으로 만들고, 현재 시각은 가짜 타이머(`jest.useFakeTimers().setSystemTime()`)로 고정한다 |

`testPathIgnorePatterns`로 그 파일을 빼는 것은 임시방편이다. 근본 해결은 **어느 환경에서 실행해도 같은 결과가 나오게** 만드는 것이다.

## 정리

- 테스트는 짧고 읽기 쉽게: 이름에 대상·상황·기대 결과, 본문은 AAA.
- 구현이 아니라 동작을 검증해야 리팩터링에 강하다.
- `--coverage --collectCoverageFrom=<파일>`로 한 파일의 커버리지만 본다.
- `testPathIgnorePatterns`로 테스트 파일을 뺄 수 있지만, 환경 의존 테스트는 결국 고쳐야 한다.

관련 노트: [[tdd|프론트엔드에서의 TDD]], [[principles|코드 리뷰 원칙과 체크리스트]], [[a11y-driven-testing|접근성 기반 UI 테스트 자동화]]
