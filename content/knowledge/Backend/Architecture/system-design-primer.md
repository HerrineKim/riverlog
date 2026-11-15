---
title: "System Design Primer 개념 지도"
concept: "System Design Primer"
summary: "요구사항·트레이드오프·전송·저장·캐시·보안·8개 설계 사례·6개 OOD 예제를 연결하는 시스템 설계 안내."
tags: ["backend", "system-design", "architecture", "distributed-systems", "learning"]
source: other
date: "2026-11-15"
sources: ["https://github.com/donnemartin/system-design-primer", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/README.md"]
---

> Donne Martin의 「[The System Design Primer](https://github.com/donnemartin/system-design-primer)」에 제시된 개념과 사례를 주제별로 재구성한 노트다. 원본 라이선스는 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)이다.

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

- [요구사항·설계 절차와 대략 계산](Backend/Architecture/system-design-primer-requirements.md): 가정, 데이터 흐름, 병목 분석
- [성능·확장·일관성·가용성](Backend/Architecture/system-design-primer-tradeoffs.md): 지연과 처리량, CAP, 장애조치와 복제
- [DNS·CDN·로드 밸런서와 앱 계층](Backend/Architecture/system-design-primer-edge-delivery.md): 클라이언트에서 서비스까지의 요청 전달
- [DB 확장 전략](Backend/Architecture/system-design-primer-database-scaling.md): 관계형·NoSQL, 복제·샤딩·비정규화
- [캐시·비동기·큐](Backend/Architecture/system-design-primer-caching-async.md): 캐시 갱신과 백프레셔
- [통신 계층과 보안](Backend/Architecture/system-design-primer-communication-security.md): HTTP·TCP·UDP·RPC·REST와 기본 보안
- [시스템 설계 사례 8개](Backend/Architecture/system-design-primer-case-studies.md): 링크 단축·피드·크롤러·거래 분류·소셜 그래프·캐시·랭킹·AWS
- [객체지향 설계 6개와 참고 자료](Backend/Architecture/system-design-primer-ood-resources.md): OOD 실습, 기술 읽을거리, 기업 아키텍처

## 학습 순서

1. 성능·지연·가용성과 네트워크·저장소·캐시의 정의를 먼저 이해한다.
2. 문제의 사용 사례·데이터 크기·읽기/쓰기 비율·장애 목표를 명시한다.
3. 원본 8개 사례를 각각 직접 설계한 뒤 제공된 해설과 비교한다.
4. 단위 계산, 상태 일관성, 병목·재시도·중복 처리·보안·운영 비용까지 검증한다.

## 출처의 성격

- 원본 기준 커밋: `ae9bbd7b02d9`. [원문 전체](https://github.com/donnemartin/system-design-primer/tree/ae9bbd7b02d90b9866215de185217d33f39ab733)
- 저작자: Donne Martin, 원문 README의 CC BY 4.0 안내에 따라 재구성·출처 표시.
- 과거에 작성된 기업 설계와 지연 시간 숫자는 현행 환경의 실측치가 아니다.
- 원본에서 작성 중이라고 표시한 항목은 완성된 내용으로 취급하지 않는다.

관련 노트: [[system-design-fundamentals|시스템 설계 기초]], [[distributed-system-patterns|분산 시스템 패턴]], [[system-design-primer-case-studies|시스템 설계 사례]]
