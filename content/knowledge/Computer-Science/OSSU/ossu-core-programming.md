---
title: "OSSU 핵심 프로그래밍"
concept: "Core Programming"
summary: "프로그램 설계·함수형·객체지향·언어 의미론·테스트·소프트웨어 구조를 연결하는 핵심 과정."
tags: ["computer-science", "curriculum", "programming", "software-design"]
source: other
date: "2026-11-15"
sources: ["https://github.com/ossu/computer-science", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/README.md"]
---

> OSSU의 공개 컴퓨터과학 커리큘럼과 관련 자료를 주제별로 재구성한 노트다.

## 무엇을 배우는가

같은 문제를 여러 언어와 설계 방식으로 풀어 보면서 **문제 명세에서 테스트 가능한 프로그램으로 만드는 과정**을 익힌다. 함수형·객체지향 설계는 서로 배척하는 구호가 아니라 상태와 의존성을 다루는 다른 도구다.

| 개념 | 확인할 질문 |
| --- | --- |
| 프로그램 명세 | 입력·출력·예외 조건이 충분히 정의됐는가 |
| 함수형 설계 | 부작용을 분리하고 데이터를 변환할 수 있는가 |
| 객체지향 설계 | 책임과 협력을 어떤 객체에 둘 것인가 |
| 타입 시스템 | 오류를 실행 전에 얼마나 드러낼 수 있는가 |
| 테스트 | 예제뿐 아니라 경계 조건을 검증하는가 |
| 소프트웨어 아키텍처 | 변경이 다른 부분에 퍼지는 범위를 줄였는가 |

## 강좌 목록과 선수 관계

### Core programming
| 강좌 | 기간 | 주당 학습량 | 선수 지식·참고 |
| --- | --- | --- | --- |
| [Systematic Program Design](https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/coursepages/spd/README.md) | 13 weeks | 8-10 hours/week | none |
| [Class-based Program Design](https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/coursepages/class-based/README.md) | 13 weeks | 5-10 hours/week | Systematic Program Design, High School Math |
| [Programming Languages](https://courses.cs.washington.edu/courses/cse341/19sp/#lectures) | 11 weeks | 4-8 hours/week | Systematic Program Design |
| [Object-Oriented Design](https://course.ccs.neu.edu/cs3500f19/) | 13 weeks | 5-10 hours/week | Class-based Program Design |
| [Software Architecture](https://www.coursera.org/learn/software-architecture) | 4 weeks | 2-5 hours/week | Object Oriented Design |


## 실습에서 남길 결과물

- 명세와 예제가 연결된 함수 및 자동 테스트
- 변경에 대응할 수 있는 객체 설계와 모듈 경계
- 정적·동적 타입, 함수형·객체지향 선택의 이유를 정리한 작은 비교


관련 노트: [[programming-paradigms|프로그래밍 패러다임]], [[type-systems|타입 시스템]], [[responsibility-driven-design|책임 주도 설계]]
