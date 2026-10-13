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

- [프론트엔드에서의 TDD](/knowledge/dictionary/frontend/testing/tdd): TDD의 목표와 사이클, 관심사의 분리, Jest·React Testing Library 예제, 도입 전략
- [JavaScript 테스트 원칙과 Jest 실행 팁](/knowledge/dictionary/frontend/testing/jest-practices): 이름·AAA·블랙박스 등 테스트 작성 원칙, 파일별 커버리지와 테스트 제외 옵션
- [접근성 기반 UI 테스트 자동화](/knowledge/dictionary/frontend/testing/a11y-driven-testing): role·접근 가능한 이름으로 요소 찾기, aria 속성 활용, 헤드리스 컴포넌트, 인수·회귀 테스트
- [프론트엔드 테스트의 종류와 도구](/knowledge/dictionary/frontend/testing/frontend-test-types): 정적·단위·통합·E2E 층, 테스트 대역 구분, 행위 중심 검증, Vitest·Testing Library·MSW·Playwright
- [험블 객체 패턴](/knowledge/dictionary/frontend/testing/humble-object-pattern): 목의 비용 피라미드, 테스트하기 어려운 입출력을 얇은 객체로 떼어 내는 설계와 SOLID
