---
title: "Data Flow로 보는 웹 아키텍처"
concept: "Data Flow"
summary: "데이터가 Presentation·Application·Data 티어를 거쳐 흐르는 방식을 기준으로 모놀리식 3-Tier, MSA, 보안 요소를 정리한 아키텍처 개관."
tags: ["architecture", "backend", "msa", "security", "devops"]
source: notion
date: "2026-10-13"
---

서비스를 설계하거나 회의에서 구조를 논의할 때, **데이터가 어디서 들어와 어디를 거쳐 어디에 저장되는지(Data Flow)를** 그릴 수 있으면 대화를 빠르게 이해하고 더 정확하게 설계·개발할 수 있다. 결과적으로 개발 기간도 줄어든다.

## 3-Tier 아키텍처 (모놀리식)

| 티어 | 역할 | 예 |
| --- | --- | --- |
| Presentation Tier | 사용자와 만나는 화면 | 웹·앱 프론트엔드 |
| Application Tier | 비즈니스 로직 처리 | API 서버 (NestJS, Django …) |
| Data Tier | 고객 데이터의 저장·사용 | RDBMS, NoSQL, 파일 스토리지 |

- 흔히 말하는 FE/BE 구분은 Presentation Tier와 "나머지 전부"로 양분하는 모델이다. 그래도 되지만, 3-Tier를 기억하고 역할을 더 세분화해 보는 편이 좋다.
- 팀 빌딩과 아키텍처는 프로젝트 성패를 가르는 가장 중요한 요소 중 하나다. 티어를 나누면 누가 무엇을 책임질지도 명확해진다.
- 모든 기능이 하나의 애플리케이션에 들어 있는 형태를 **모놀리식(Monolithic)이라** 한다.

## MSA(Micro Service Architecture)

기능을 독립적으로 배포 가능한 작은 서비스들로 쪼갠 구조다. 데이터 흐름 관점에서 새로 등장하는 요소는 다음과 같다.

1. **서비스별 DB**: 각 서비스가 자기 데이터를 소유한다.
2. **BFF(Backend For Frontend)**: 화면(웹·앱)별로 필요한 데이터를 여러 서비스에서 모아 주는 중간 서버([[bff|BFF]]).
3. **메시지 큐/브로커(RabbitMQ, Kafka)**: 서비스 사이의 데이터를 비동기로 전달해 결합도를 낮춘다.

> MSA는 배포·관측·데이터 정합성 등 운영 복잡도를 크게 늘린다. 팀과 트래픽 규모가 독립 배포를 필요로 할 때 선택하고, 그 전에는 모듈을 잘 나눈 모놀리식(모듈러 모놀리스)이 대개 더 싸다.

## 보안 관점에서 챙길 것

보안은 데이터가 지나는 구간마다 따로 설계한다.

- **전송 구간 암호화**: TLS(구 SSL)로 데이터 중간 탈취를 막는다. Let's Encrypt 인증서를 발급·갱신해 주는 **Certbot**이 대표 도구다.
- **저장 데이터 보호**: 비밀번호는 **bcrypt** 같은 단방향 해시로, 복호화가 필요한 민감 데이터는 **AES-256** 같은 대칭키 암호로 저장한다.
- **인증 상태 저장 위치**: 서버 세션(즉시 무효화)과 JWT(무상태, 취소 어려움) 중 고르는 기준은 [[session-vs-token-auth|세션 기반 인증과 토큰 기반 인증]]에 있다.

## 더 세밀한 그림

3-Tier를 DNS → 로드밸런서 → 웹 서버·WAS → 캐시·DB·작업 큐 → CDN으로 더 쪼개어 그리면 학습 지도가 된다. 빌드·배포·인프라([DevOps](DevOps.md))도 각 티어를 떠받치는 구성 요소로 이 그림에 들어간다. 웹 서버와 WAS를 나누는 기준은 [[web-server-and-nginx|웹 서버, WAS, 그리고 Nginx]]에 있다.

## 핵심 정리

- Presentation → Application → Data 티어로 데이터 흐름을 그려 보는 습관을 들인다.
- MSA는 서비스별 DB, BFF, 메시지 큐로 흐름이 복잡해지는 대신 독립 배포가 가능해진다. 배포 단위인 컨테이너와의 궁합은 [[vm-vs-container|VM과 컨테이너]] 참고.
- 전송(TLS)·저장(해시·암호화)·인증(세션·JWT) 각 구간의 보안을 함께 설계한다.

관련 노트: [[vm-vs-container|VM과 컨테이너]], [[security|정보 시스템 보안]], [[spa-csr-ssr|SPA와 CSR·SSR]], [[bff|BFF (Backend For Frontend)]], [[high-traffic-resilience|대규모 트래픽에서 서비스를 지키는 설계]], [[auth-placement|인증·인가 로직은 어디에 두나: 필터, 인터셉터, API 게이트웨이]], [[web-scalability-components|웹 확장성의 구성 요소]]
