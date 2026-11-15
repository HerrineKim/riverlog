---
title: "DNS·CDN·로드 밸런서·리버스 프록시"
concept: "Web Delivery Layer"
summary: "DNS와 에지 캐시, L4/L7 부하 분산, 리버스 프록시, 앱 계층과 서비스 발견의 역할 비교."
tags: ["backend", "system-design", "cdn", "network", "load-balancing"]
source: other
date: "2026-11-15"
sources: ["https://github.com/donnemartin/system-design-primer", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/README.md"]
---

> Donne Martin의 「[The System Design Primer](https://github.com/donnemartin/system-design-primer)」에 제시된 개념과 사례를 주제별로 재구성한 노트다. 원본 라이선스는 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)이다.

## 요청이 애플리케이션에 도착하는 경로

```mermaid
flowchart LR
 A["클라이언트"] --> B["DNS"]
 B --> C["CDN/Edge"]
 C --> D["L4 또는 L7 LB"]
 D --> E["리버스 프록시·API"]
 E --> F["서비스 인스턴스"]
 F --> G["저장소·캐시"]
```

이 구조는 가능한 구성의 한 예이며, 모든 서비스가 모든 계층을 별도 배치해야 하는 것은 아니다.

| 요소 | 역할 | 설계상 확인할 한계 |
| --- | --- | --- |
| DNS | 도메인을 주소에 연결, 지역·장애 대응에 활용 | 캐시된 응답의 TTL 때문에 즉시 전환되지 않을 수 있음 |
| CDN | 사용자 가까이 정적·일부 동적 콘텐츠를 제공 | 캐시 적중·무효화와 오래된 콘텐츠 |
| L4 로드 밸런서 | 전송 계층 연결을 기준으로 분산 | HTTP 헤더나 경로를 직접 판단하지 않는 유형이 많음 |
| L7 로드 밸런서 | HTTP 경로·호스트·헤더에 따른 라우팅 | TLS 종료·복호화·처리량 비용 |
| 리버스 프록시 | 백엔드를 대신해 요청 전달·접근 통제·압축 | 프록시 자체가 병목·장애 지점이 될 수 있음 |
| 애플리케이션 계층 | 비즈니스 로직 처리, 독립 확장 | 서비스 간 호출·관측·배포 복잡성 |
| 서비스 디스커버리 | 동적으로 변하는 서비스 주소 탐색 | 등록 정보 신선도·헬스 체크 |

## CDN 운영 방식

- **Push**: 콘텐츠를 사전에 에지에 배치한다. 배포 경로와 무효화 정책을 관리한다.
- **Pull**: 캐시 미스 때 원본 서버에서 가져온다. 최초 요청 지연과 원본 부하를 고려한다.

## 수평 확장 전에 확인할 원칙

1. 가능한 한 무상태 애플리케이션으로 만들고 세션·공유 데이터를 외부화한다.
2. 오토스케일링 조건은 CPU만 아니라 큐 길이·동시 처리량·에러율 등으로 검증한다.
3. 단일 LB·캐시·서비스 디스커버리의 장애를 포함한 전체 경로를 분석한다.

관련 노트: [[load-balancer|로드 밸런서]], [[web-scalability-components|웹 확장 구성요소]], [[microservices-architecture|마이크로서비스]]
