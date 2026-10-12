---
title: "Data Flow로 보는 웹 아키텍처"
concept: "Data Flow"
summary: "데이터가 Presentation·Application·Data 티어를 거쳐 흐르는 방식을 기준으로 모놀리식 3-Tier, MSA, DevOps, 보안 요소를 정리한 아키텍처 개관."
tags: ["architecture", "backend", "msa", "security", "devops"]
source: notion
---

서비스를 설계하거나 회의에서 구조를 논의할 때, **데이터가 어디서 들어와 어디를 거쳐 어디에 저장되는지(Data Flow)**를 그릴 수 있으면 대화를 빠르게 이해하고 더 정확하게 설계·개발할 수 있다. 결과적으로 개발 기간도 줄어든다.

## 3-Tier 아키텍처 (모놀리식)

| 티어 | 역할 | 예 |
| --- | --- | --- |
| Presentation Tier | 사용자와 만나는 화면 | 웹·앱 프론트엔드 |
| Application Tier | 비즈니스 로직 처리 | API 서버 (NestJS, Django …) |
| Data Tier | 고객 데이터의 저장·사용 | RDBMS, NoSQL, 파일 스토리지 |

- 흔히 말하는 FE/BE 구분은 Presentation Tier와 "나머지 전부"로 양분하는 모델이다. 그래도 되지만, 3-Tier를 기억하고 역할을 더 세분화해 보는 편이 좋다.
- 팀 빌딩과 아키텍처는 프로젝트 성패를 가르는 가장 중요한 요소 중 하나다. 티어를 나누면 누가 무엇을 책임질지도 명확해진다.
- 모든 기능이 하나의 애플리케이션에 들어 있는 형태를 **모놀리식(Monolithic)**이라 한다.

## MSA(Micro Service Architecture)

기능을 독립적으로 배포 가능한 작은 서비스들로 쪼갠 구조다. 데이터 흐름 관점에서 새로 등장하는 요소는 다음과 같다.

1. **서비스별 DB**: 각 서비스가 자기 데이터를 소유한다.
2. **BFF(Backend For Frontend)**: 화면(웹·앱)별로 필요한 데이터를 여러 서비스에서 모아 주는 중간 서버.
3. **메시지 큐/브로커(RabbitMQ, Kafka)**: 서비스 사이의 데이터를 비동기로 전달해 결합도를 낮춘다.

> MSA는 장점만 있는 것이 아니라 운영 복잡도가 크게 늘어난다. 현업에서도 아직 과장되거나 불완전하게 도입되는 경우가 많으므로, 필요가 분명할 때 선택한다.

## DevOps와 탈중앙화

- **DevOps**도 이 흐름 안에 들어 있다. 빌드·배포·인프라 역시 각 티어를 떠받치는 구성 요소다. ([DevOps](DevOps))
- **Decentralization(블록체인)**: 데이터가 중앙 서버가 아니라 분산 원장에 저장되는, 또 다른 데이터 흐름 모델이다.

## 보안 관점에서 챙길 것

개발에 집중하다 보면 놓치기 쉽지만 현업에서는 보안을 매우 엄격하게 따진다.

- **전송 구간 암호화**: TLS(구 SSL)로 데이터 중간 탈취를 막는다. Let's Encrypt 인증서를 발급·갱신해 주는 **Certbot**이 대표 도구다.
- **포트**: 0~1023번은 운영체제가 관리하는 well-known 포트 영역이다. ([HTTP와 포트](Backend/Web-Basics/http-web-architecture))
- **저장 데이터 보호**: 비밀번호는 **bcrypt** 같은 단방향 해시로, 복호화가 필요한 민감 데이터는 **AES-256** 같은 대칭키 암호로 저장한다.
- **인증 방식의 변화**: 세션·DB 토큰 방식은 요청마다 서버가 DB·세션 저장소를 오가며 유효한 사용자인지 확인해야 해 부담이 컸다. Stateless한 REST가 확산되면서, 서명으로 자체 검증되는 **JWT**를 한 번 발급해 쓰는 방식이 널리 쓰이게 되었다. ([JWT 인증](Backend/NestJS/auth-jwt-passport))

## Web Architecture 101

3-Tier를 더 세밀하게 추상화한 그림으로, DNS → 로드밸런서 → 웹 서버 → 캐시·DB·검색 엔진·작업 큐 → CDN 등이 어떻게 연결되는지 보여 준다. 풀스택을 다 아는 것이 목표가 아니라, 이 지도를 머리에 두면 "지금 이걸 아니까 다음엔 저걸 배우면 되겠다"는 식으로 학습 방향을 스스로 정할 수 있다는 점이 중요하다.

## 부록: 아키텍트의 종류

| 구분 | 역할 |
| --- | --- |
| EA (Enterprise Architect) | 전사 IT 전략 수립 |
| CA/GA (Chief Architect) | 프로젝트 전체 아키텍처 총괄 |
| AA (Application Architect) | 애플리케이션 구조 설계. 현업에서 가장 자주 만난다 |
| DA (Data Architect) | 데이터 구조와 흐름 설계. Data Flow를 이야기하는 이유 |
| TA (Technical Architect) | 시스템·인프라 설계 |
| SA (Software Architect) | 오픈소스 등 소프트웨어 구성 |

## 핵심 정리

- Presentation → Application → Data 티어로 데이터 흐름을 그려 보는 습관을 들인다.
- MSA는 서비스별 DB, BFF, 메시지 큐로 흐름이 복잡해지는 대신 독립 배포가 가능해진다.
- 전송(TLS)·저장(해시·암호화)·인증(JWT) 각 구간의 보안을 함께 설계한다.

관련 노트: [[vm-vs-container|VM과 컨테이너]], [[security|정보 시스템 보안]], [[spa-csr-ssr|SPA와 CSR·SSR]]
