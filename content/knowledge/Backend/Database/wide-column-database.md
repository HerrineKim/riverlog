---
title: "와이드 컬럼 DB와 대규모 메시지 저장: Cassandra·ScyllaDB"
concept: "Wide Column Store"
summary: "Cassandra·ScyllaDB 같은 와이드 컬럼 DB는 파티션 키로 데이터를 노드에 나누고 파티션 안을 클러스터링 키로 정렬해 둔다. 파티션 키·클러스터링 키 모델, 조절 가능한 일관성, LSM 트리 저장 엔진, Cassandra와 ScyllaDB의 차이를 정리하고, 수조 건 메시지를 저장할 때 생기는 핫 파티션을 데이터 서비스 계층의 요청 병합으로 막는 방법과 로컬 SSD와 네트워크 디스크를 RAID로 묶어 디스크 지연을 줄이는 방법을 다룬다."
tags: ["backend", "database", "nosql", "performance", "storage", "raid"]
source: other
date: "2026-10-20"
sources: ["https://discord.com/blog/how-discord-stores-trillions-of-messages", "https://betterprogramming.pub/what-scylladb-is-and-why-you-should-care-58cb35af6cd7", "https://discord.com/blog/how-discord-supercharges-network-disks-for-extreme-low-latency", "https://www.scylladb.com/2024/12/18/license/", "https://www.scylladb.com/2025/04/08/announcing-scylladb-2025-1", "https://bytebytego.com/guides/how-discord-stores-trillions-of-messages"]
---

> Discord 엔지니어링 블로그의 「[How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages)」(2023.03), 「[How Discord Supercharges Network Disks for Extreme Low Latency](https://discord.com/blog/how-discord-supercharges-network-disks-for-extreme-low-latency)」(2022.08)와 Mottakin Chowdhury의 「[What ScyllaDB Is and Why You Should Care](https://betterprogramming.pub/what-scylladb-is-and-why-you-should-care-58cb35af6cd7)」(2022.06)를 바탕으로 재구성하고, ScyllaDB의 라이선스와 데이터 분산 방식은 공식 발표로 최신화한 노트다. ByteByteGo의 System Design 101 가이드 「[How Discord Stores Trillions of Messages](https://bytebytego.com/guides/how-discord-stores-trillions-of-messages)」도 참고했다.

## 와이드 컬럼 DB란

**와이드 컬럼 DB(wide-column store)** 는 데이터를 「파티션 키 → 정렬된 행들」의 거대한 맵으로 저장하는 NoSQL이다. 대표 제품은 Apache Cassandra, ScyllaDB, HBase다. NoSQL 유형 전체의 비교와 CAP 정리는 [[database-models|데이터베이스 모델: RDB, NoSQL, NewSQL]]에 있다.

- 행마다 컬럼 구성이 달라도 된다. 하지만 실무에서 더 중요한 성질은 **같은 파티션의 행이 한 노드에 모여 정렬된 채 저장된다**는 점이다.
- JOIN이 없다. 테이블은 **질의 하나에 맞춰 설계**하고, 필요하면 같은 데이터를 다른 키로 한 번 더 저장(비정규화)한다.
- 쓰기가 싸고 수평 확장이 쉬워 로그, 시계열, 채팅 메시지처럼 **계속 쌓이고 최근 것부터 읽는 데이터**에 잘 맞는다.

## 데이터 모델: 파티션 키와 클러스터링 키

기본 키(primary key)는 두 부분으로 나뉜다.

| 부분 | 역할 | 메시지 예 |
| --- | --- | --- |
| 파티션 키(partition key) | 해시해서 어느 노드에 둘지 정한다. 같은 값이면 한 파티션 | `(channel_id, bucket)` |
| 클러스터링 키(clustering key) | 파티션 안의 정렬 순서를 정한다. 범위 조회가 빠르다 | `message_id` 내림차순 |

```sql
CREATE TABLE messages (
  channel_id bigint,
  bucket     int,        -- 고정 길이 시간 구간 번호
  message_id bigint,     -- Snowflake: 생성 시각순으로 정렬되는 ID
  author_id  bigint,
  content    text,
  PRIMARY KEY ((channel_id, bucket), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);
```

- **버킷(bucket)** 은 채널 하나가 파티션 하나를 무한히 키우지 않도록 시간 구간으로 자르는 장치다. 파티션이 너무 크면 읽기·컴팩션·복구가 모두 느려진다.
- ID 자체가 시각순으로 정렬되므로(Snowflake) 「이 채널의 최근 메시지 50개」가 파티션 하나의 앞부분 범위 읽기로 끝난다.
- 그래도 파티션 크기는 고르지 않다. 수십만 명이 모인 채널과 친구 몇 명의 채널은 쓰기량이 몇 자릿수 차이 난다. 이 차이가 아래의 **핫 파티션** 문제를 만든다.

## 분산과 복제

| 개념 | 설명 |
| --- | --- |
| 토큰 링 | 파티션 키의 해시값(토큰)으로 노드를 정한다. 일관된 해시(consistent hashing)라 노드를 넣고 빼도 일부 데이터만 옮긴다 |
| 복제 계수(RF) | 파티션 하나를 몇 개 노드에 둘지. 보통 3 |
| 조절 가능한 일관성 | 요청마다 `ONE`·`QUORUM`·`ALL` 등으로 몇 개 복제본의 응답을 기다릴지 고른다. 읽기 수 + 쓰기 수 > RF이면 최신 값을 읽는다 |
| 최종 일관성 | 기본 성격은 CAP의 AP다. 분할 중에도 응답하고, 복제본 차이는 나중에 맞춘다 |

데이터를 키로 나눠 여러 노드에 두는 일반적인 샤딩 전략(범위·해시·디렉터리 방식, 재분배)은 [[database-sharding|데이터베이스 샤딩]]에서 다룬다. 와이드 컬럼 DB는 이 해시 샤딩과 복제를 DB가 자동으로 해 준다.

## 저장 엔진: LSM 트리

Cassandra와 ScyllaDB는 **LSM 트리(Log-Structured Merge tree)** 계열 저장 엔진을 쓴다.

```text
쓰기 → 커밋 로그(순차 기록, 장애 대비) + 메모테이블(메모리)
         └─ 가득 차면 → SSTable(불변 파일)로 디스크에 내림
읽기 → 메모테이블 + 여러 SSTable을 모두 확인해 합침
컴팩션 → SSTable을 주기적으로 병합하고 지운 데이터(툼스톤)를 정리
```

- **쓰기는 싸고 읽기는 비싸다.** 읽기는 여러 SSTable을 뒤져야 한다.
- 컴팩션이 밀리면 SSTable이 쌓여 읽기가 점점 느려진다.
- 삭제는 즉시 지우지 않고 **툼스톤(tombstone)** 표시를 남긴다. 컴팩션 전까지는 툼스톤도 읽어야 하므로, 삭제가 많은 구간은 스캔이 매우 느려진다.

## Cassandra와 ScyllaDB

ScyllaDB는 Cassandra와 같은 데이터 모델과 CQL을 쓰는 호환 DB다. 드라이버와 스키마를 거의 그대로 옮길 수 있고, DynamoDB 호환 API(Alternator)도 제공한다.

| 구분 | Apache Cassandra | ScyllaDB |
| --- | --- | --- |
| 구현 언어 | Java (JVM) | C++ (Seastar 프레임워크) |
| 메모리 관리 | 가비지 컬렉터. GC 일시 정지가 지연 스파이크를 만든다 | GC가 없다 |
| 동시성 모델 | 스레드 풀. 스레드 간 문맥 전환과 잠금 비용이 있다 | **샤드-퍼-코어(shard-per-core)**: CPU 코어마다 데이터 조각과 메모리를 따로 맡고 코어끼리는 메시지로만 통신한다 |
| 데이터 분산 | 가상 노드(vnode) | 태블릿(tablet). 2025.1부터 기본값. 테이블별로 데이터를 잘게 나눠 노드 추가·제거 때 빠르게 재배치한다 |
| 라이선스 | Apache 2.0 | 2025.1부터 소스 공개(source-available) 라이선스. 마지막 오픈소스(AGPL) 버전은 6.2다 |

코어끼리 공유 상태가 없어 잠금과 문맥 전환이 거의 없고, 그래서 같은 하드웨어에서 더 적은 노드로 같은 부하를 처리하는 경우가 많다. 스레드·이벤트 루프 같은 동시성 모델 전반은 [[concurrency-models|동시성·병렬·비동기·논블로킹과 동시성 모델]]에 있다.

## 대규모 메시지 저장에서 생기는 문제

수조 건 규모의 메시지를 Cassandra 클러스터에 저장하면 다음 문제가 반복해서 나타난다.

| 증상 | 원인 | 대응 |
| --- | --- | --- |
| 한 노드가 느려지면 다른 채널 요청까지 느려진다 | **핫 파티션**: 인기 채널 하나에 읽기가 몰린다. 정족수(QUORUM) 읽기라 그 노드를 거치는 모든 질의가 기다린다 | 데이터베이스 앞에서 같은 요청을 합친다(아래) |
| 지연이 점점 늘고 연쇄적으로 번진다 | 컴팩션 지연으로 SSTable이 쌓여 읽기 비용이 커진다 | 노드를 빼서 컴팩션한 뒤 다시 넣는 수작업이 필요해진다. 근본적으로는 엔진 교체 |
| 예고 없는 지연 스파이크, 노드 재부팅 | JVM GC 일시 정지 | GC가 없는 ScyllaDB로 이전 |
| 이전 작업이 99.9999%에서 멈춘다 | 컴팩션되지 않은 툼스톤이 특정 토큰 범위에 대량으로 남아 있다 | 해당 범위를 먼저 컴팩션 |

## 데이터 서비스 계층: 요청 병합과 라우팅

DB를 바꿔도 핫 파티션은 남는다. 그래서 API 서버와 DB 사이에 **데이터 서비스(data service)** 라는 얇은 계층을 둔다. 질의마다 gRPC 엔드포인트 하나를 두고 비즈니스 로직은 넣지 않는다.

```text
API 서버들 ──(channel_id로 일관된 해시 라우팅)──▶ 데이터 서비스 인스턴스 A
                                                   │ 같은 행 요청 100개
                                                   ▼
                                           DB 질의 1번 → 결과를 100개에 나눠 줌
                                                   │
                                                   ▼
                                               ScyllaDB
```

| 기법 | 동작 | 효과 |
| --- | --- | --- |
| **요청 병합(request coalescing)** | 같은 키 요청이 동시에 오면 첫 요청만 DB에 보내고 나머지는 그 결과를 구독한다 | 핫 파티션에 가는 질의 수가 동시 요청 수와 무관해진다 |
| **일관된 해시 라우팅** | 요청에 라우팅 키(메시지는 `channel_id`)를 실어 같은 채널은 같은 인스턴스로 보낸다 | 병합이 한 인스턴스 안에서 일어나므로 적중률이 높아진다 |

요청 병합은 Go의 `singleflight`와 같은 패턴이다. 공지 하나에 수많은 사용자가 몰리는 순간처럼, 캐시가 비었을 때 같은 질의가 한꺼번에 DB로 가는 **캐시 스탬피드**를 막는 데도 쓴다.

## 무중단 DB 이전 패턴

| 단계 | 내용 |
| --- | --- |
| 이중 쓰기 | 새 데이터는 기존 DB와 새 DB에 함께 쓴다 |
| 과거 데이터 이관 | 토큰 범위 단위로 읽어 새 DB에 쓴다. 진행 상황을 로컬 저장소(SQLite)에 체크포인트로 남겨 중단돼도 이어 간다 |
| 검증 | 읽기의 일부를 두 DB에 모두 보내 결과를 비교한다 |
| 전환 | 새 DB를 기본으로 바꾼다 |

이관 도구는 데이터 서비스와 같은 고성능 언어·라이브러리로 만들면 범용 배치 엔진(Spark)보다 훨씬 빠르다. GC가 없는 ScyllaDB로 옮기면 같은 부하를 더 적은 노드로, 더 낮고 일정한 p99 지연으로 처리하는 경우가 많다.

## 클라우드 디스크 지연 줄이기: 로컬 SSD + 네트워크 디스크 RAID

DB 노드가 초당 수백만 건을 처리하면 **디스크 지연**이 병목이 된다. 디스크 작업 하나가 1~2ms씩 걸리면 질의가 대기열에 쌓이고, 심하면 시간 초과가 난다. 클라우드에는 성격이 반대인 두 디스크가 있다.

| 구분 | 네트워크 디스크 (GCP Persistent Disk 등) | 로컬 SSD (NVMe) |
| --- | --- | --- |
| 지연 | 약 1~2ms, 들쭉날쭉 | 약 0.5ms, 일정 |
| 내구성 | 스토리지 쪽에서 복제된다 | 호스트가 고장 나거나 서버가 옮겨지면 데이터가 사라진다 |
| 스냅샷 | 시점 스냅샷으로 백업 가능 | 디스크 단위 스냅샷이 없다 |
| 교체 | 자유롭다 | 고장 난 디스크만 교체할 수 없다 |

**리눅스 캐시 계층(dm-cache, lvm-cache, bcache)** 으로 로컬 SSD를 네트워크 디스크의 캐시로 쓰는 방법은 고장 처리에서 막힌다. 캐시 쪽에 배드 섹터가 생기면 읽기가 실패하고, DB는 데이터 보호를 위해 스스로 멈춘다.

대신 리눅스 소프트웨어 RAID(**md**)로 두 디스크를 묶는다. 이 구성을 **슈퍼 디스크(super-disk)** 라고 부른다.

```text
        md RAID 1 (미러)
        ├── md RAID 0: 로컬 SSD 여러 개를 스트라이핑 → 읽기 담당
        └── 네트워크 디스크 (write-mostly) → 쓰기만 받는 내구성 사본
```

- **RAID 0**으로 로컬 SSD를 묶는다. 고장 난 로컬 SSD만 교체할 수 없고 고장 시 서버째 옮겨져 로컬 데이터가 다 사라지므로, 패리티(RAID 5·6)로 복구할 의미가 없다.
- **RAID 1**로 그 배열과 네트워크 디스크를 미러링하고, 네트워크 디스크에 **write-mostly** 표시를 붙인다. 일반 RAID 1은 읽기를 두 장치에 나눠 절반이 느린 디스크로 가지만, write-mostly 장치는 다른 장치를 못 쓸 때만 읽는다.
- 쓰기는 양쪽에 모두 가므로 네트워크 디스크의 복제와 스냅샷을 그대로 쓴다. 로컬 SSD가 사라지면 네트워크 디스크 사본으로 복구한다.
- **읽기가 쓰기보다 훨씬 많은 부하**일수록 효과가 크다. 디스크 대기열과 iowait이 줄어 같은 서버에 더 많은 질의를 넣을 수 있다.

RAID 레벨 자체의 설명은 [[memory-hierarchy|메모리 계층 구조]]와 [[disk-scheduling|디스크 관리와 스케줄링]]에 있다.

## 한계

- **질의 패턴이 바뀌면 테이블을 새로 만들어야 한다.** 임의 조건 검색, JOIN, 집계는 약하다.
- 파티션 키를 잘못 고르면 핫 파티션이나 거대 파티션이 생긴다. DB가 자동으로 고쳐 주지 않는다.
- 최종 일관성이 기본이라 「방금 쓴 값을 바로 읽기」가 필요하면 일관성 수준을 올려야 하고, 그만큼 지연이 늘어난다. 트랜잭션은 경량 트랜잭션(LWT) 정도로 제한된다.
- 슈퍼 디스크는 쓰기 지연이 여전히 네트워크 디스크에 묶이고, md 설정 하나로 끝나지 않는다. 클라우드 환경의 고장 유형마다 따로 대응해야 한다.

## 정리

- 와이드 컬럼 DB의 설계는 **파티션 키(어디에 둘까)와 클러스터링 키(어떤 순서로 둘까)** 를 질의에 맞춰 고르는 일이다.
- 메시지처럼 끝없이 커지는 데이터는 **시간 버킷**으로 파티션 크기를 제한한다.
- LSM 트리는 쓰기가 싸지만 컴팩션과 툼스톤이 읽기 지연을 좌우한다.
- 핫 파티션은 DB 교체만으로 사라지지 않는다. **앞단에서 같은 요청을 합치고 같은 키를 같은 곳으로 보내는** 계층이 함께 필요하다.
- 읽기 위주 부하에서는 빠르지만 휘발성인 디스크와 느리지만 안전한 디스크를 **write-mostly 미러**로 묶어 둘의 장점만 취할 수 있다.

관련 노트: [[database-models|데이터베이스 모델: RDB, NoSQL, NewSQL]], [[high-traffic-resilience|대규모 트래픽에서 서비스를 지키는 설계]], [[concurrency-models|동시성·병렬·비동기·논블로킹과 동시성 모델]], [[disk-scheduling|디스크 관리와 스케줄링]], [[memory-hierarchy|메모리 계층 구조]], [[mongodb|MongoDB 시작하기와 CRUD]]
