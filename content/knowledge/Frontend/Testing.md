---
title: "Testing"
concept: "Testing"
summary: "프론트엔드 코드의 동작을 테스트로 보장하고, 테스트로 설계를 이끄는 방법."
tags: ["testing", "tdd", "frontend"]
source: til
date: "2026-10-13"
---

테스트 코드는 일정에 쫓기면 가장 먼저 밀려나지만, 프로젝트가 커질수록 "미래의 큰 버그를 지금의 작은 실패로" 앞당겨 주는 안전망이 된다. 프론트엔드에서도 Vitest·Jest와 Testing Library, MSW, Playwright로 컴포넌트와 상태 로직, 사용자 흐름까지 충분히 테스트할 수 있다.

## 노트

- [프론트엔드에서의 TDD](/knowledge/dictionary/frontend/testing/tdd): TDD의 목표와 사이클, 이점과 오해, 테스트하기 좋은 코드, user-event 예제, 도입 전략
- [접근성 기반 UI 테스트 자동화](/knowledge/dictionary/frontend/testing/a11y-driven-testing): role·접근 가능한 이름으로 요소 찾기, aria 속성 활용, 헤드리스 컴포넌트, 인수·회귀 테스트
- [프론트엔드 테스트의 종류와 도구](/knowledge/dictionary/frontend/testing/frontend-test-types): 정적·단위·통합·E2E 층, 폴더 역할별 테스트 단위, 테스트 대역 구분, 행위 중심 검증, Vitest·Testing Library·MSW·Playwright
- [험블 객체 패턴](/knowledge/dictionary/frontend/testing/humble-object-pattern): 목의 비용 피라미드, 테스트하기 어려운 입출력을 얇은 객체로 떼어 내는 설계와 SOLID
- [JavaScript 테스트 모범 사례](/knowledge/dictionary/frontend/testing/js-testing-best-practices): 황금률, 테스트 이름·AAA·블랙박스, 테스트 대역 고르기, 프로퍼티 기반 테스트·스냅숏, E2E 원칙, 백엔드 컴포넌트·계약 테스트, 커버리지와 뮤테이션 테스트, CI
- [테스트 실행 환경: Node, DOM 에뮬레이션, 실제 브라우저](/knowledge/dictionary/frontend/testing/test-environment): 런타임과 API, 로직 분리, jsdom·happy-dom의 한계, Playwright·Vitest 브라우저 모드
- [테스트를 돌리는 시점: 로컬, PR, CI](/knowledge/dictionary/frontend/testing/test-run-stages): test 스크립트, watch·only, 상태 검사, 플레이키 테스트, 되돌리기와 앞으로 고치기, 경보 피로, 파일별 커버리지·테스트 파일 제외·타임존 고정
- [테스트의 기본 요소](/knowledge/dictionary/frontend/testing/test-primitives): 단언 3종, assert와 expect, suite·describe, 수명 주기 훅, 테스트 파일 위치
- [의존성이 있는 컴포넌트 테스트하기](/knowledge/dictionary/frontend/testing/component-test-dependencies): vi.stubGlobal, vi.mock, Context 주입, MSW로 넘어갈 시점
- [정적 분석: 실행하지 않고 검사하기](/knowledge/dictionary/frontend/testing/static-analysis): ESLint 규칙, eslint-plugin-compat, TypeScript noImplicitAny, 런타임 데이터의 한계
