---
title: "OSSU 핵심 보안"
concept: "Core Security"
summary: "CIA, 안전한 코딩, 취약점 식별, 언어별 공격·방어를 다루는 필수 보안 학습."
tags: ["computer-science", "curriculum", "security", "secure-coding"]
source: other
date: "2026-11-15"
sources: ["https://github.com/ossu/computer-science", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/README.md"]
---

> OSSU의 공개 컴퓨터과학 커리큘럼과 관련 자료를 주제별로 재구성한 노트다.

## 핵심 원리

보안은 프로그램 완성 뒤에 추가하는 옵션이 아니라 **요구사항과 설계의 제약 조건**이다. 기밀성·무결성·가용성(CIA), 입력 검증, 권한 최소화, 위협 모델, 암호 기술이 함께 작동한다.

| 구분 | 질문 |
| --- | --- |
| 기밀성 | 허가되지 않은 주체에게 데이터가 노출되는가 |
| 무결성 | 의도하지 않은 변조를 탐지하거나 방지하는가 |
| 가용성 | 장애·공격에도 필요한 서비스를 유지하는가 |
| 안전한 개발 | 입력·상태·신뢰 경계가 검토됐는가 |
| 취약점 분석 | 실패하는 조건과 영향을 재현할 수 있는가 |

## 강좌와 언어별 선택

### Core security
| 강좌 | 기간 | 주당 학습량 | 선수 지식·참고 |
| --- | --- | --- | --- |
| [Cybersecurity Fundamentals](https://www.edx.org/learn/cybersecurity/rochester-institute-of-technology-cybersecurity-fundamentals) | 8 weeks | 10-12 hours/week | - |
| [Principles of Secure Coding](https://www.coursera.org/learn/secure-coding-principles) | 4 weeks | 4 hours/week | - |
| [Identifying Security Vulnerabilities](https://www.coursera.org/learn/identifying-security-vulnerabilities) | 4 weeks | 4 hours/week | - |
| [Identifying Security Vulnerabilities in C/C++ Programming](https://www.coursera.org/learn/identifying-security-vulnerabilities-c-programming) | 4 weeks | 5 hours/week | - |
| [Exploiting and Securing Vulnerabilities in Java Applications](https://www.coursera.org/learn/exploiting-securing-vulnerabilities-java-applications) | 4 weeks | 5 hours/week | - |


Core security의 마지막 언어별 취약점 강좌는 C/C++와 Java 중 **하나를 선택**하는 과정이다. 공통 필수 강좌와 선택 강좌를 구분하여 계획한다.

관련 노트: [[secure-system-design|안전한 시스템 설계]], [[api-security|API 보안 체크리스트]]
