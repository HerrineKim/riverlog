---
title: "시스템 설계의 선택지와 흔한 문제의 해법"
concept: "Design Choices"
summary: "수직·수평 확장, SQL·NoSQL, 배치·스트림, 정규화·비정규화, 강한·최종 일관성, REST·GraphQL, 상태 유지·무상태, 동기·비동기처럼 설계에서 반복되는 양자택일을 비교하고, 읽기 폭주·쓰기 폭주·단일 장애 지점·지연·대용량 파일·느린 쿼리 같은 흔한 문제를 해법과 짝지었다."
tags: ["backend", "architecture", "scalability", "database", "performance"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/10-system-design-tradeoffs-you-cannot-ignore", "https://bytebytego.com/guides/8-common-system-design-problems-and-solutions"]
---

> ByteByteGo의 System Design 101 가이드 「[10 System Design Tradeoffs You Cannot Ignore](https://bytebytego.com/guides/10-system-design-tradeoffs-you-cannot-ignore)」, 「[8 Common System Design Problems and Solutions](https://bytebytego.com/guides/8-common-system-design-problems-and-solutions)」를 바탕으로 재구성한 노트다.

## 이 노트의 자리

확장성·가용성 같은 품질 속성과 비용↔성능 같은 큰 트레이드오프는 [[system-design-fundamentals|시스템 설계의 품질 속성과 트레이드오프]]에 있다. 이 노트는 그보다 한 단계 구체적인 **"A냐 B냐" 선택지**와 **증상별 처방**을 모은다.

## 자주 마주치는 양자택일

| 선택지 | 왼쪽 | 오른쪽 | 고르는 기준 |
| --- | --- | --- | --- |
| 수직 vs 수평 확장 | 서버 한 대에 CPU·RAM을 더한다. 단순하지만 상한이 있고 그 서버가 단일 장애 지점이다 | 서버 대수를 늘린다. 상한이 사실상 없지만 상태 공유·부하 분산이 필요하다 | 처음엔 수직이 싸다. 한계나 가용성 요구가 오면 수평 |
| SQL vs NoSQL | 행과 열의 테이블, 스키마, 조인, 트랜잭션 | 유연한 스키마, 수평 확장이 쉬운 키-값·문서·와이드 컬럼 | 관계와 정합성이 중요하면 SQL, 스키마가 자주 바뀌거나 쓰기가 폭증하면 NoSQL([[database-models\|데이터베이스 모델]]) |
| 배치 vs 스트림 처리 | 모아 두었다가 한꺼번에 처리한다(일일 정산) | 들어오는 즉시 처리한다(이상 거래 탐지) | 결과가 언제 필요한지. 늦어도 되면 배치가 싸고 단순하다 |
| 정규화 vs 비정규화 | 정보를 한 곳에만 둬 갱신 이상을 막는다 | 테이블을 합쳐 조인 없이 빨리 읽는다 | 쓰기 정합성 vs 읽기 성능([[normalization\|정규화]]) |
| 일관성 vs 가용성 | 늘 최신 값을 준다. 장애 중엔 응답을 거절할 수 있다 | 일부가 고장 나도 응답한다. 옛 값일 수 있다 | 네트워크 분할 때 무엇을 내줄지(CAP) |
| 강한 vs 최종 일관성 | 갱신이 즉시 모든 노드에 보인다 | 갱신이 노드에 퍼지기까지 지연이 있다 | 잔액·재고는 강한 일관성, 좋아요 수·피드는 최종 일관성 |
| REST vs GraphQL | 자원별 엔드포인트 여러 개를 호출한다 | 쿼리 하나로 필요한 필드만 받는다. 스키마 설계·캐싱 비용이 크다 | 클라이언트가 다양하고 화면마다 필요한 데이터가 다르면 GraphQL([[rest-api\|REST API]]) |
| 상태 유지 vs 무상태 | 서버가 이전 상호작용을 기억한다 | 요청마다 필요한 정보를 다 담아 보낸다 | 수평 확장하려면 무상태. 상태는 DB·캐시로 뺀다 |
| 읽기 통과 vs 쓰기 통과 캐시 | 캐시 미스 때 캐시가 DB에서 읽어 채운다 | 쓰기를 캐시와 DB에 동시에 한다 | 읽기 지연 vs 쓰기 지연([[caching-strategies\|캐시 전략]]) |
| 동기 vs 비동기 처리 | 작업을 하나씩 끝내고 다음으로 간다 | 백그라운드로 넘기고 기다리지 않는다 | 사용자가 결과를 바로 봐야 하나. 아니면 큐로 넘긴다 |

## 증상별 처방

| 증상 | 처방 |
| --- | --- |
| 읽기가 몰린다 | **캐시**를 둔다. 그다음 읽기 복제본을 늘린다([[database-scaling\|데이터베이스 확장과 성능 최적화]]) |
| 쓰기가 몰린다 | 쓰기를 큐에 넣고 **비동기 워커**가 처리한다. 쓰기에 강한 **LSM 트리** 기반 저장소(Cassandra, RocksDB 등)를 쓴다([[wide-column-database\|와이드 컬럼 데이터베이스]]) |
| 단일 장애 지점 | DB처럼 중요한 구성 요소를 **이중화하고 장애 조치(failover)**를 둔다([[high-availability-redundancy\|고가용성 이중화 구조]]) |
| 가용성이 낮다 | **로드 밸런서**로 건강한 인스턴스에만 보내고, **DB 복제**로 내구성과 가용성을 높인다 |
| 지연이 크다 | 사용자 가까이 콘텐츠를 두는 **CDN**을 쓴다([[cdn\|CDN]]) |
| 큰 파일 | 파일은 DB가 아니라 **객체 스토리지·블록 스토리지**에 두고 DB엔 위치만 저장한다 |
| 무슨 일이 일어나는지 모른다 | **중앙 로그 수집**(ELK 등)과 지표·알림을 둔다 |
| 쿼리가 느리다 | 먼저 **인덱스**를 맞춘다. 데이터가 한 대에 안 들어가면 **샤딩**한다([[database-sharding\|데이터베이스 샤딩]]) |

## 로드 밸런싱 알고리즘

로드 밸런서가 요청을 나누는 규칙(라운드 로빈, 가중치, 해시, 최소 연결, 최소 응답 시간)은 [[load-balancer|로드 밸런서]]에 있다. 무상태 서비스는 단순한 정적 알고리즘으로 충분하고, 요청마다 처리 비용이 크게 다르면 동적 알고리즘을 쓴다.

## 정리

- 설계의 많은 결정은 양자택일이다. 각 선택이 무엇을 얻고 무엇을 내주는지 말로 설명할 수 있어야 한다.
- 증상마다 기본 처방이 있다: 읽기엔 캐시, 쓰기엔 비동기와 LSM, 단일 장애엔 이중화, 지연엔 CDN, 큰 파일엔 객체 스토리지, 느린 쿼리엔 인덱스와 샤딩.

관련 노트: [[system-design-fundamentals|시스템 설계의 품질 속성과 트레이드오프]], [[web-scalability-components|웹 확장성의 구성 요소]], [[high-availability-redundancy|고가용성 이중화 구조와 장애 감지]], [[caching-strategies|캐시 전략]], [[load-balancer|로드 밸런서]], [[database-sharding|데이터베이스 샤딩]], [[tech-interview-prep|기술 면접 준비: 유형별 대비와 시스템 디자인 7단계]]
