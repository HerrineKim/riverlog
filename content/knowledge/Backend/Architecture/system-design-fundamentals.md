---
title: "시스템 설계의 품질 속성과 트레이드오프"
concept: "System Design Fundamentals"
summary: "확장성·가용성·신뢰성·성능이라는 네 가지 품질 속성의 뜻과 달성 수단, 설계에서 늘 부딪치는 다섯 가지 트레이드오프, 시스템 설계를 이루는 빌딩 블록, 요구 사항에서 이전 계획까지 설계 논의의 체크리스트, 그리고 CAP·BASE·KISS 같은 약어를 한 곳에 정리했다."
tags: ["backend", "architecture", "scalability", "software-engineering", "design"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/who-are-the-fantastic-four-of-system-design", "https://bytebytego.com/guides/system-design-cheat-sheet", "https://bytebytego.com/guides/a-cheat-sheet-for-system-designs", "https://bytebytego.com/guides/system-design-blueprint-the-ultimate-guide", "https://bytebytego.com/guides/top-5-trade-offs-in-system-designs", "https://bytebytego.com/guides/must-know-system-design-building-blocks", "https://bytebytego.com/guides/cap-base-solid-kiss-what-do-these-acronyms-mean"]
---

> ByteByteGo의 System Design 101 가이드 「[The Fantastic Four of System Design](https://bytebytego.com/guides/who-are-the-fantastic-four-of-system-design)」, 「[System Design Cheat Sheet](https://bytebytego.com/guides/system-design-cheat-sheet)」, 「[A cheat sheet for system designs](https://bytebytego.com/guides/a-cheat-sheet-for-system-designs)」, 「[System Design Blueprint](https://bytebytego.com/guides/system-design-blueprint-the-ultimate-guide)」, 「[Top 5 Trade-offs in System Designs](https://bytebytego.com/guides/top-5-trade-offs-in-system-designs)」, 「[Must Know System Design Building Blocks](https://bytebytego.com/guides/must-know-system-design-building-blocks)」, 「[CAP, BASE, SOLID, KISS](https://bytebytego.com/guides/cap-base-solid-kiss-what-do-these-acronyms-mean)」를 바탕으로 재구성한 노트다.

## 시스템 설계란

시스템 설계는 **요구 사항을 만족하는 구성 요소와 그 사이의 데이터 흐름을 정하는 일**이다. 기능 요구 사항(무엇을 하나)은 출발점일 뿐이고, 설계의 대부분은 비기능 요구 사항(얼마나 많이, 얼마나 빨리, 얼마나 오래 멈추지 않고)을 맞추는 데 쓰인다. 그 비기능 요구 사항을 **품질 속성(quality attribute)** 이라 부른다.

## 네 가지 품질 속성

| 속성 | 뜻 | 재는 법 | 주요 수단 |
| --- | --- | --- | --- |
| 확장성(Scalability) | 부하가 늘어도 자원을 더해 성능을 유지하는 능력 | 부하를 늘렸을 때 응답 시간이 유지되는가 | 무상태 서비스, 수평 확장, 캐시, 샤딩, 비동기 처리 |
| 가용성(Availability) | 요청했을 때 응답을 받을 수 있는 시간의 비율 | 가동률(99.9%, 99.99% …) | 이중화, 페일오버, 다중 AZ·리전 |
| 신뢰성(Reliability) | 장애가 있어도 **올바른 결과**를 꾸준히 내는 능력 | 오류율, 장애 간 평균 시간(MTBF) | 복제, 검증, 멱등성, 재시도, 테스트 |
| 성능(Performance) | 주어진 자원으로 정해진 속도를 내는 능력 | 지연 시간(p50·p99), 처리량(QPS·TPS) | 캐시, 인덱스, 병렬화, 비동기 처리 |

가용성과 신뢰성은 다르다. **가용성은 응답이 오는지, 신뢰성은 그 응답이 맞는지**를 본다. 가용성을 높인 시스템도 오래된 데이터를 돌려줄 수 있다.

### 처리량을 높이는 법

처리량(throughput)은 단위 시간에 처리하는 요청 수다. 높이는 순서는 대개 이렇다.

1. **캐시**로 디스크·DB 같은 느린 I/O까지 가지 않게 한다.
2. 계산이 무거운 작업은 **스레드·워커 수**를 늘린다. 단, 너무 많으면 문맥 전환과 경합으로 오히려 느려진다.
3. 병목을 측정해 찾고, 무거운 작업은 **비동기 처리**로 요청 경로에서 떼어 낸다.

확장 전략의 세부는 [[web-scalability-components|웹 확장성의 구성 요소]], 가용성을 이중화로 높이는 구조는 [[high-availability-redundancy|고가용성 이중화 구조와 장애 감지]]에 있다.

## 다섯 가지 트레이드오프

**정답인 설계는 없고, 무엇을 얻으려고 무엇을 내주는지가 있을 뿐이다.**

| 트레이드오프 | 한쪽을 높이면 | 판단 기준 |
| --- | --- | --- |
| 비용 ↔ 성능 | 더 빠른 하드웨어·더 많은 복제본·캐시는 돈이 든다 | 목표 지연 시간을 먼저 정하고, 그 이상은 사지 않는다 |
| 신뢰성 ↔ 확장성 | 노드가 늘수록 고장 날 곳과 조율할 것이 늘어 정확성을 지키기 어렵다 | 일관성이 꼭 필요한 데이터와 아닌 데이터를 나눈다 |
| 성능 ↔ 일관성 | 모든 복제본이 같은 값을 갖게 기다리면 느려진다 | 최종 일관성(eventual consistency)으로 충분한 곳을 찾는다 |
| 보안 ↔ 유연성 | 인증·권한·감사 단계가 늘수록 통합과 변경이 번거롭다 | 데이터 민감도에 비례해 통제를 건다 |
| 개발 속도 ↔ 품질 | 빨리 내놓으면 테스트·설계가 얕아진다 | 되돌리기 어려운 결정(데이터 모델, 공개 API)에만 시간을 쓴다 |

SQL·NoSQL, 배치·스트림, 동기·비동기처럼 기술 선택에서 반복되는 양자택일과 흔한 문제의 처방은 [[system-design-choices|시스템 설계의 선택지와 흔한 문제의 해법]]에 있다.

## 빌딩 블록

대부분의 설계는 아래 부품의 조합이다.

| 분류 | 부품 | 하는 일 |
| --- | --- | --- |
| 네트워크·통신 | DNS | 도메인을 IP로 바꾼다. [[dns\|DNS]] |
| | 로드 밸런서 | 트래픽을 여러 서버에 나눈다. [[load-balancer\|로드 밸런서]] |
| | API 게이트웨이 | 여러 서비스 앞의 단일 진입점. 인증·라우팅·속도 제한. [[api-gateway\|API 게이트웨이]] |
| | CDN | 정적 콘텐츠를 사용자 가까이서 내준다. [[cdn\|CDN]] |
| 분산 처리 | 메시지 큐 | 서비스를 비동기로 잇고 결합을 끊는다. [[message-queue-kafka\|메시지 큐와 Kafka]] |
| | 분산 캐시 | 자주 읽는 데이터를 메모리에 둔다 |
| | 분산 작업 스케줄러 | 예약 작업을 여러 노드 중 한 곳에서만 실행하게 조율한다 |
| 서비스 관리 | 서비스 디스커버리 | 주소를 하드코딩하지 않고 서비스끼리 서로를 찾는다 |
| 데이터 | 데이터베이스 | 구조화된 데이터를 저장한다 |
| | 객체 스토리지 | 이미지·영상·문서 같은 큰 파일을 저장한다 |
| | 샤딩 | 데이터를 행 단위로 여러 노드에 나눈다. [[database-sharding\|데이터베이스 샤딩]] |
| | 복제 | 같은 데이터를 여러 노드에 복사해 읽기를 늘리고 장애에 대비한다 |
| | 일관된 해싱 | 노드가 늘거나 줄 때 다시 배치할 키를 최소로 줄인다 |
| | 고유 ID 생성기 | 여러 노드에서 겹치지 않는 ID를 만든다. [[distributed-unique-id\|분산 환경의 고유 ID 생성]] |
| 관측·복원력 | 메트릭·로그·트레이스 | 시스템 내부 상태를 밖에서 본다 |
| | 복원력 패턴 | 타임아웃·재시도·서킷 브레이커. [[resiliency-patterns\|장애 확산을 막는 복원력 패턴]] |

## 설계 논의 체크리스트

설계를 시작할 때 아래 순서로 빠진 것이 없는지 본다.

```text
1. 요구 사항     기능, 사용자 수, 읽기·쓰기 비율, 지연·가용성 목표
2. 용량 추정     QPS, 저장량, 대역폭 → 비용 추정
3. 아키텍처      구성 요소와 데이터 흐름, 동기·비동기 경계
4. 데이터 설계   데이터 모델, 저장소 선택, 분할·복제
5. 도메인 설계   서비스·모듈 경계, 책임 분리
6. 품질 속성     확장성, 가용성, 신뢰성, 성능, 보안
7. 운영          관측, 배포, 테스트, 유지보수성
8. 사람          사용자 경험, 문서화, 기존 시스템에서의 이전(migration) 계획
```

## 자주 나오는 약어

| 약어 | 뜻 | 핵심 |
| --- | --- | --- |
| CAP | Consistency, Availability, Partition tolerance | 네트워크 분할이 생기면 일관성과 가용성 중 하나를 포기한다. 분할은 분산 시스템에서 반드시 생기므로 실제 선택은 「분할 때 무엇을 내주나」다. DB를 CP·AP로 딱 잘라 분류하는 것은 거친 근사다. [[database-models\|데이터베이스 모델]] |
| BASE | Basically Available, Soft state, Eventually consistent | ACID보다 느슨한 모델. 가용성을 우선하고, 상태는 시간이 지나면 일관해진다. 많은 NoSQL이 택한다 |
| ACID | Atomicity, Consistency, Isolation, Durability | 트랜잭션의 네 성질. [[transaction\|트랜잭션과 회복]] |
| SOLID | 객체지향 설계 다섯 원칙 | 단일 책임, 개방·폐쇄, 리스코프 치환, 인터페이스 분리, 의존성 역전. [[frontend-solid\|프론트엔드와 SOLID 원칙]] |
| KISS | Keep It Simple, Stupid | 대부분의 시스템은 단순할 때 가장 잘 돈다. 복잡도는 필요가 증명될 때만 더한다 |

## 정리

- 설계의 대부분은 확장성·가용성·신뢰성·성능 같은 **비기능 요구 사항**을 맞추는 일이다.
- 가용성은 응답이 오는지, 신뢰성은 응답이 맞는지다. 둘을 따로 목표로 잡는다.
- 모든 선택은 트레이드오프다. 무엇을 얻고 무엇을 내주는지 말로 적어 둔다.
- 설계는 빌딩 블록의 조합이다. 부품 하나하나의 역할과 한계를 알면 처음 보는 문제도 조립할 수 있다.

관련 노트: [[system-design-choices|시스템 설계의 선택지와 흔한 문제의 해법]], [[software-architecture-patterns|소프트웨어 아키텍처 패턴]], [[web-scalability-components|웹 확장성의 구성 요소]], [[high-availability-redundancy|고가용성 이중화 구조와 장애 감지]], [[resiliency-patterns|장애 확산을 막는 복원력 패턴]], [[distributed-system-patterns|분산 시스템의 통신·데이터 흐름 패턴]], [[backend-developer-roadmap|백엔드 개발자가 알아야 할 것]]
