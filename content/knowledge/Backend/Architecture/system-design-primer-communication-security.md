---
title: "HTTP·TCP·UDP·RPC·REST와 기본 보안"
concept: "Communication Security"
summary: "통신 계층의 보장과 API 방식의 차이, 전송·저장 암호화·입력 검증·인증·권한 검사를 정리한다."
tags: ["backend", "system-design", "network", "api", "security"]
source: other
date: "2026-11-15"
sources: ["https://github.com/donnemartin/system-design-primer", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/README.md"]
---

> Donne Martin의 「[The System Design Primer](https://github.com/donnemartin/system-design-primer)」에 제시된 개념과 사례를 주제별로 재구성한 노트다. 원본 라이선스는 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)이다.

## 네트워크 전송과 API 스타일은 다른 계층이다

| 항목 | 의미 | 주의할 점 |
| --- | --- | --- |
| TCP | 순서와 재전송을 다루는 신뢰성 있는 바이트 스트림 | 연결 상태·혼잡·지연 처리 |
| UDP | 연결 설정 없이 데이터그램을 전달 | 애플리케이션에서 손실·순서 보완 가능 |
| HTTP | 상태 코드와 헤더가 있는 요청·응답 의미론 | 캐시·멱등성·보안 정책 |
| REST | 자원 식별과 일관된 인터페이스 등 아키텍처 제약 | HTTP와 동의어가 아니며 설계 제약 준수 필요 |
| RPC | 원격 함수를 호출하듯 요청·응답 실행 | 호출 실패·재시도·타임아웃을 로컬 호출과 구분 |

RPC의 편리한 인터페이스가 네트워크 실패를 제거하지는 않는다. REST도 단순한 URL 규칙 이상의 제약을 요구한다.

## 설계 검토에서 필요한 보안 질문

- 데이터 전송에는 HTTPS/TLS를 사용하고, 저장 데이터에는 목적에 맞는 암호화·키 관리를 적용한다.
- 신뢰하지 않는 입력은 형식과 범위를 검증하고 SQL에는 바인딩 파라미터를 사용한다.
- **인증은 누구인지 확인**, **인가는 무엇을 할 수 있는지 확인**하는 과정이다.
- 공용 API는 요청 제한·오류 노출·감사 로그·비밀값 저장을 관리한다.
- XSS·SQL Injection·CSRF 같은 위험의 방어는 서로 대체되지 않는다.

## 비동기 이벤트와 API의 트레이드오프

요청/응답은 즉시 결과가 필요한 API에 적합하다. 큐와 이벤트는 작업을 분리하지만 중복·순서·지연을 관리해야 한다. 어떤 방식이든 타임아웃, 장애 전파, 재시도 폭주를 고려한다.

관련 노트: [[api-architectural-styles|API 아키텍처 방식]], [[api-security|API 보안]], [[web-server-and-nginx|웹 서버와 프록시]], [[secure-system-design|안전한 설계]]
