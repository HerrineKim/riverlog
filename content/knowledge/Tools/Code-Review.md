---
title: "코드 리뷰"
concept: "Code Review"
summary: "리뷰 원칙과 코멘트, 자주 나오는 지적, 리팩터링, 단순한 설계, 이름 짓기, 지우기 쉬운 코드."
tags: ["tools","code-review","collaboration"]
source: mixed
date: "2026-11-26"
---

코드 리뷰 노트는 변경을 읽고 남기는 기준을 다룬다. 무엇을 보는지, 코멘트를 어떻게 쓰는지, 자주 나오는 지적, 리팩터링과 단순한 설계, 이름과 삭제하기 쉬운 코드가 여기 있다.

## 하위 노트

- [코드 리뷰 원칙과 체크리스트](Tools/Code-Review/principles.md): 코드 리뷰를 왜 하는지(품질이 비용을 낮추는 이유, 리뷰의 다섯 가지 효과), 작성자와 리뷰어가 할 일, 자동화할 것과 사람이 볼 것을 나누는 원칙, 리뷰를 빠르게 돌리고 교착을 푸는 운영법, 가독성·부작용·경계 조건·보안·성능·테스트 체크리스트.
- [리뷰 코멘트와 PR 소통](Tools/Code-Review/review-communication.md): 의도가 정확히 전달되는 리뷰 코멘트 쓰는 법, PR에서 자주 쓰는 약어(LGTM·IMO·NIT·PTAL), 리뷰를 받는 쪽의 태도와 PR 템플릿.
- [코드 리뷰에서 자주 나온 지적](Tools/Code-Review/review-patterns.md): 코드 리뷰에서 자주 반복되는 JavaScript·React 코드 지적(const, else, 기본값, 불리언 이름, 빈 문자열 비교, 비동기 에러, 불변 업데이트, props 설계 등)을 고친 코드와 함께 정리.
- [리팩터링 원칙](Tools/Code-Review/refactoring-principles.md): 마틴 파울러 『리팩터링』(2판) 1·2장에서 뽑은 원칙. 리팩터링의 정의, 기능 추가와 리팩터링을 나누는 두 개의 모자, 테스트 먼저, 3의 법칙, 성능은 다듬은 뒤에 챙긴다는 태도를 정리한다.
- [Simple Design](Tools/Code-Review/simple-design.md): 코드 품질을 '가독성'·'깔끔함' 같은 느낌 대신 객관적 기준으로 다루기 위해 켄트 벡의 Simple Design을 '중복이 없으면서 최소한의 문법 요소로 구성된 코드'로 줄여 쓰는 방법. 중복 제거 시점, 비용과의 타협, 본질적 복잡성 다루기, DRY·KISS·YAGNI와의 관계까지 정리한다.
- [불리언 변수 이름 짓기](Tools/Code-Review/boolean-naming.md): 불리언 변수 이름을 영어 문법에 맞게 짓는 네 가지 형태(is, 조동사, has, 3인칭 단수 동사)와 흔한 실수(is + 동사원형)를 정리한다.
- [삭제하기 쉬운 코드](Tools/Code-Review/easy-to-delete-code.md): 코드는 쓰는 순간부터 유지 비용을 낳는다.
