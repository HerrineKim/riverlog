---
title: "System Design Primer 개념 지도"
concept: "System Design Primer"
summary: "요구사항·트레이드오프·전송·저장·캐시·보안·8개 설계 사례·6개 OOD 예제를 연결하는 시스템 설계 안내."
tags: ["backend", "system-design", "architecture", "distributed-systems", "learning"]
source: other
date: "2026-11-15"
sources: ["https://github.com/donnemartin/system-design-primer", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/README.md"]
---

> Donne Martin의 「[The System Design Primer](https://github.com/donnemartin/system-design-primer)」에 제시된 개념과 사례를 주제별로 재구성한 노트다. 원본 라이선스는 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)이고, 기준 커밋은 [`ae9bbd7b02d9`](https://github.com/donnemartin/system-design-primer/tree/ae9bbd7b02d90b9866215de185217d33f39ab733)다.

## System Design Primer의 목적

시스템 설계는 대규모 서비스를 만들 때 **요구사항, 성능, 가용성, 일관성, 확장성, 운영의 제약을 동시에 비교하는 작업**이다. 단일 정답이 있는 것이 아니라 비용·복잡도·품질 목표 사이의 선택이 남는다. 원본 자료는 이 핵심 개념과 8개 시스템 설계 사례, 6개 객체지향 설계 예시, 추가 참고 자료를 묶는다.

```mermaid
flowchart LR
 A["요구사항"] --> B["컴포넌트 경계"]
 B --> C["데이터·통신 경로"]
 C --> D["부하·장애 검증"]
 D --> E["복제·캐시·샤딩"]
 E --> F["운영·보안"]
```

## 주제별 노트

- [시스템 설계의 품질 속성과 트레이드오프](Backend/Architecture/system-design-fundamentals.md): 설계 진행 순서와 용량 어림셈, 성능·확장성·지연·처리량, CAP
- [고가용성 이중화 구조와 장애 감지](Backend/Architecture/high-availability-redundancy.md): 주-백업·주-주 구성, 장애 조치와 복제
- [DNS·CDN·로드 밸런서와 앱 계층](Backend/Architecture/system-design-primer-edge-delivery.md): 클라이언트에서 서비스까지의 요청 전달
- [데이터베이스 확장과 성능 최적화](Backend/Database/database-scaling.md): 저장소 선택을 먼저 따지는 순서, 인덱스·캐시·반정규화·복제·페더레이션·샤딩
- [캐시 전략: 계층, 읽기·쓰기 패턴, 교체 정책, 장애 패턴](Backend/Architecture/caching-strategies.md): 캐시 위치, cache-aside·write-through·write-back·refresh-ahead
- [메시지 큐와 Kafka](Backend/Architecture/message-queue-kafka.md): 메시지 큐와 작업 큐로 오래 걸리는 일을 요청에서 떼어 내기. 배압은 [복원력 패턴](Backend/Architecture/resiliency-patterns.md)
- [통신 계층과 보안](Backend/Architecture/system-design-primer-communication-security.md): HTTP·TCP·UDP·RPC·REST와 기본 보안
- [시스템 설계 사례 8개](Backend/Architecture/system-design-primer-case-studies.md): 링크 단축·피드·크롤러·거래 분류·소셜 그래프·캐시·랭킹·AWS
- [객체지향 설계 6개와 참고 자료](Backend/Architecture/system-design-primer-ood-resources.md): OOD 실습, 기술 읽을거리, 기업 아키텍처

## 학습 순서

1. 성능·지연·가용성과 네트워크·저장소·캐시의 정의를 먼저 이해한다.
2. 문제의 사용 사례·데이터 크기·읽기/쓰기 비율·장애 목표를 명시한다.
3. 원본 8개 사례를 각각 직접 설계한 뒤 제공된 해설과 비교한다.
4. 단위 계산, 상태 일관성, 병목·재시도·중복 처리·보안·운영 비용까지 검증한다.

관련 노트: [[system-design-fundamentals|시스템 설계 기초]], [[distributed-system-patterns|분산 시스템 패턴]], [[system-design-primer-case-studies|시스템 설계 사례]]
