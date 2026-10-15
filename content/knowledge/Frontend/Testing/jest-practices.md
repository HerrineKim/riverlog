---
title: "Jest·Vitest 실행 팁"
concept: "Jest Practices"
summary: "특정 파일만 커버리지를 재거나 특정 테스트 파일을 빼고 실행하는 Jest·Vitest 옵션과, 실행 환경(타임존)에 따라 깨지는 테스트를 고치는 법."
tags: ["testing", "jest", "javascript", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/284", "https://riverkim.kr/289", "https://riverkim.kr/307"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트다.

Jest·Vitest로 테스트를 돌릴 때 자주 쓰는 실행 옵션을 모았다. 옵션 이름은 Jest 30 기준이고, Vitest는 같은 개념을 `coverage.include`, `test.exclude`로 둔다. 무엇을 어떻게 테스트할지에 대한 원칙은 [[frontend-test-types#테스트 작성 원칙|프론트엔드 테스트의 종류와 도구]]에 있다.

## 특정 파일의 커버리지만 보기

전체 커버리지는 숫자가 커서 "지금 쓴 테스트가 이 파일을 얼마나 덮는가"를 보기 어렵다. 테스트 하나만 실행하면서 **원하는 소스 파일의 커버리지만** 모은다.

```bash
# Jest
npm test user.spec.js -- --coverage --collectCoverageFrom=src/js/user.js
# Vitest
npx vitest run user.spec.js --coverage --coverage.include=src/js/user.js
```

- `--` 뒤의 인자는 npm 스크립트를 거쳐 Jest에 그대로 전달된다.
- 실행하는 테스트 파일과 커버리지를 모을 파일은 달라도 된다.
- 결과 표에서 덮이지 않은 줄 번호(Uncovered Line)를 보고 테스트를 보충한다.

## 특정 테스트 파일 빼고 실행하기

| 도구 | 설정 | 주의 |
| --- | --- | --- |
| Jest | `jest.config.js`의 `testPathIgnorePatterns: ['/node_modules/', 'date-format.test.tsx']` | 기본값의 `/node_modules/`를 덮어쓰므로 함께 적는다 |
| Vitest | `vitest.config.ts`의 `test.exclude: [...configDefaults.exclude, '**/date-format.test.tsx']` | `configDefaults.exclude`를 펼쳐 기본 제외 목록을 유지한다 |

테스트 **대상** 파일이 아니라 **테스트 파일**(`*.test.tsx` 등)의 이름·경로를 적는다.

## 환경에 따라 깨지는 테스트

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| 날짜·시간 테스트가 특정 컴퓨터·CI에서만 실패한다 | 테스트가 실행 환경의 타임존에 기대고 있다 | 타임존을 고정한다(`TZ=UTC jest` 또는 설정 파일에서 `process.env.TZ`). 날짜는 오프셋이 명시된 값으로 만들고, 현재 시각은 가짜 타이머(`jest.useFakeTimers().setSystemTime()`, `vi.setSystemTime()`)로 고정한다 |

테스트 파일을 실행 목록에서 빼는 것은 임시방편이다. 근본 해결은 **어느 환경에서 실행해도 같은 결과가 나오게** 만드는 것이다.

## 정리

- 한 파일의 커버리지만 볼 때는 Jest `--collectCoverageFrom`, Vitest `--coverage.include`.
- 테스트 파일을 빼려면 Jest `testPathIgnorePatterns`, Vitest `test.exclude`. 기본 제외 목록을 지우지 않는다.
- 환경 의존 테스트는 빼지 말고 타임존·시각을 고정해 고친다.

관련 노트: [[frontend-test-types|프론트엔드 테스트의 종류와 도구]], [[tdd|프론트엔드에서의 TDD]], [[a11y-driven-testing|접근성 기반 UI 테스트 자동화]]
