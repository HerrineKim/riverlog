---
title: "대규모 서비스 기술 스택 해부"
concept: "Tech Stack Anatomy"
summary: "Netflix·Uber·Reddit·Twitter 같은 대규모 서비스의 기술 스택을 계층별로 겹쳐 보고 반복되는 설계 선택을 정리했다. 데이터 성격별로 DB를 고르는 폴리글랏 저장, 캐시를 조회 가속 이상으로 쓰는 네 가지 방식, 비싼 작업을 큐로 미루고 CDC로 캐시를 맞추는 패턴, 표준화된 이벤트 플랫폼, 카나리 배포 중심의 CI/CD, 자동 버그 수정과 전용 하드웨어까지 다룬다."
tags: ["backend", "architecture", "database", "cache", "devops", "msa"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/netflixs-overall-architecture", "https://bytebytego.com/guides/netflixs-tech-stack", "https://bytebytego.com/guides/netflix-tech-stack-databases", "https://bytebytego.com/guides/4-ways-netflix-uses-caching-to-hold-user-attention", "https://bytebytego.com/guides/netflix-tech-stack-cicd-pipeline", "https://bytebytego.com/guides/uber-tech-stack", "https://bytebytego.com/guides/uber-tech-stack-cicd", "https://bytebytego.com/guides/reddit's-core-architecture", "https://bytebytego.com/guides/twitter-10-tech-stack", "https://bytebytego.com/guides/twitter-architecture-2022-vs-2012", "https://bytebytego.com/guides/mcdonald's-event-driven-architecture", "https://bytebytego.com/guides/fixing-bugs-automatically-at-meta-scale", "https://bytebytego.com/guides/how-does-youtube-handle-massive-video-content-upload", "https://bytebytego.com/guides/top-9-engineering-blog-favorites"]
---

> ByteByteGo의 System Design 101 가이드 중 실제 사례(real-world case studies) 묶음, 「[Netflix's Overall Architecture](https://bytebytego.com/guides/netflixs-overall-architecture)」, 「[Netflix's Tech Stack](https://bytebytego.com/guides/netflixs-tech-stack)」, 「[Netflix Tech Stack - Databases](https://bytebytego.com/guides/netflix-tech-stack-databases)」, 「[4 Ways Netflix Uses Caching](https://bytebytego.com/guides/4-ways-netflix-uses-caching-to-hold-user-attention)」, 「[Netflix Tech Stack - CI/CD Pipeline](https://bytebytego.com/guides/netflix-tech-stack-cicd-pipeline)」, 「[Uber Tech Stack](https://bytebytego.com/guides/uber-tech-stack)」, 「[Uber Tech Stack - CI/CD](https://bytebytego.com/guides/uber-tech-stack-cicd)」, 「[Reddit's Core Architecture](https://bytebytego.com/guides/reddit's-core-architecture)」, 「[Twitter 1.0 Tech Stack](https://bytebytego.com/guides/twitter-10-tech-stack)」, 「[Twitter Architecture 2022 vs. 2012](https://bytebytego.com/guides/twitter-architecture-2022-vs-2012)」, 「[McDonald's Event-Driven Architecture](https://bytebytego.com/guides/mcdonald's-event-driven-architecture)」, 「[Fixing Bugs Automatically at Meta Scale](https://bytebytego.com/guides/fixing-bugs-automatically-at-meta-scale)」, 「[How YouTube Handles Massive Video Uploads](https://bytebytego.com/guides/how-does-youtube-handle-massive-video-content-upload)」, 「[Top 9 Engineering Blogs](https://bytebytego.com/guides/top-9-engineering-blog-favorites)」를 바탕으로 재구성한 노트다.

## 왜 남의 스택을 보나

큰 회사의 기술 스택은 그대로 따라 할 목록이 아니다. 여러 회사의 스택을 겹쳐 보면 **같은 문제에 비슷한 설계 원칙이 반복**되는데, 그 원칙이 쓸모 있다. 구체 제품은 자주 바뀌므로 제품명보다 「어느 층에 어떤 성질의 도구를 두었나」를 본다.

## 계층별로 겹쳐 보기

| 계층 | 반복되는 선택 | 사례 |
| --- | --- | --- |
| 클라이언트 | 모바일은 네이티브(Swift·Kotlin), 웹은 React. 플랫폼 공통 구조를 위해 자체 모바일 아키텍처를 만들기도 한다 | 모바일 크로스플랫폼 구조(Uber RIBs), React 기반 자체 웹 프레임워크 |
| 앞단 | CDN → 로드 밸런서 → 게이트웨이 | Reddit은 CDN을 앱 앞에 두고 로드 밸런서가 서비스로 라우팅한다 |
| 클라이언트-서버 통신 | 화면 단위 집계는 GraphQL(페더레이션), 서비스 간은 gRPC·Thrift | [[api-layer-evolution\|API 계층의 진화]] 참고 |
| 서비스 | JVM(Spring Boot) 또는 Go 마이크로서비스, 서비스 디스커버리, 동적 설정 저장소 | 모놀리스(Python, Rails)에서 Go·Java 서비스로 옮겨 간 경로가 흔하다. 초기 Twitter처럼 클러스터 스케줄러 위에 자체 RPC 프레임워크(Finagle)로 서비스를 묶고, 자체 캐시·분산 키-값 저장소를 만든 경우도 있다 |
| 비동기 | Kafka(스트림), RabbitMQ 등(작업 큐), 워크플로 엔진 | 오래 걸리는 비즈니스 흐름은 워크플로 오케스트레이션 엔진(Cadence, Temporal)에 맡긴다 |
| 데이터 | 데이터 성격별 여러 DB(아래 폴리글랏 저장) | |
| 빅데이터 | 객체 스토리지 + 테이블 포맷(Iceberg, Hudi) + Spark·Flink + 데이터 웨어하우스 | |
| 관측 | 자체 시계열 지표 저장소, 이상 탐지, 온콜 관리 | |
| 인프라 | 퍼블릭 클라우드 + Kubernetes, IaC(Terraform), 모노레포 + Bazel 같은 빌드 시스템 | |

## 폴리글랏 저장: 데이터마다 맞는 DB

**모든 데이터를 한 DB에 넣지 않는다.** 데이터의 일관성 요구, 접근 패턴, 크기에 따라 DB를 고른다.

| 데이터 성격 | DB 종류 | 예 |
| --- | --- | --- |
| 돈이 걸린 트랜잭션(결제, 구독, 세금) | 관계형 DB(MySQL, PostgreSQL) | 강한 일관성이 필요하다 |
| 여러 리전에 걸친 전역 트랜잭션 | 분산 SQL(CockroachDB 등) | 멀티 리전 액티브-액티브 |
| 대량 쓰기, 높은 가용성(시청 기록, 기기 정보, 메시지) | 와이드 컬럼 DB(Cassandra) | [[wide-column-database\|와이드 컬럼 DB]] 참고 |
| 홈 화면, 개인화 결과, 세션 | 키-값 캐시(Memcached 기반 EVCache, Redis) | 아래 캐시 활용 참고 |
| 지표 | 시계열 DB | 메모리 기반 자체 시계열 저장소 |
| 분석 | 컬럼형 DB·데이터 웨어하우스(Redshift, Druid, Pinot) | |
| 이미지·영상·로그 | 객체 스토리지(S3) + 테이블 포맷 | |

관계형 DB 앞에 캐시를 두고, 새 기능에는 가용성이 높은 와이드 컬럼 DB를 쓰는 조합(Reddit)이 전형적이다.

## 캐시의 네 가지 쓰임

분산 키-값 캐시는 조회 가속 외에도 쓰인다. 영상 스트리밍 사례(Netflix의 EVCache)는 하나의 캐시 플랫폼을 네 용도로 쓴다.

| 용도 | 방식 |
| --- | --- |
| 룩어사이드 캐시(look-aside) | 캐시에 없으면 서비스·DB에서 읽어 오고 캐시를 채운다. 가장 일반적인 캐시 어사이드 패턴이다 |
| 일시 데이터 저장소(transient store) | 재생 세션처럼 여러 서비스가 차례로 열고·갱신하고·닫는 짧은 수명의 상태를 둔다 |
| 기본 저장소(primary store) | 밤마다 배치로 모든 프로필의 홈 화면을 **미리 계산해 캐시에 써 두고**, 온라인 서비스는 캐시만 읽는다 |
| 대량 조회 데이터 | UI 문구·번역처럼 모든 요청이 읽는 데이터를 별도 프로세스가 비동기로 계산해 캐시에 게시한다 |

**미리 계산해 캐시에 넣어 두기(precompute)** 는 요청 시점의 계산을 없애 지연을 줄인다. 캐시 전략 일반은 [[caching-strategies|캐싱 전략]]에서 다룬다.

## 비싼 작업은 미루고, 캐시는 변경 로그로 맞춘다

소셜 커뮤니티 사례(Reddit)에서 볼 수 있는 패턴이다.

```mermaid
flowchart LR
  w["투표·글 제출 같은 비싼 쓰기"] --> q["작업 큐(RabbitMQ)"] --> wk["워커가 비동기 처리"]
  s["콘텐츠 안전 검사"] --> k["Kafka로 실시간 전달"] --> re["규칙 엔진이 검사"]
  d["DB 변경"] --> cdc["CDC(Debezium)로 변경 로그 추출"] --> rep["복제본·캐시 갱신"]
```

- **사용자 응답 경로에서 비싼 작업을 빼면** 요청이 빨라지고 부하 폭증을 큐가 흡수한다.
- 애플리케이션이 캐시와 DB에 이중 쓰기를 하면 둘이 어긋나기 쉽다. **DB의 변경 로그를 원천으로 삼아 캐시·복제본을 갱신**하면 일관성을 맞추기 쉽다.

## 이벤트 플랫폼 표준화

이벤트 기반 아키텍처를 여러 팀이 쓰기 시작하면 이벤트 형식과 오류 처리가 제각각이 된다. 패스트푸드 주문 플랫폼 사례(McDonald's)는 이벤트를 다음 요소로 표준화했다.

| 요소 | 역할 |
| --- | --- |
| 이벤트 레지스트리 | 이벤트 스키마를 한곳에 정의한다 |
| 공용 SDK | 이벤트 발행·소비와 오류 처리를 라이브러리로 통일한다 |
| 이벤트 게이트웨이 | 외부에서 들어오는 이벤트의 인증·인가를 맡는다 |
| 운영 도구 | 잘못된 이벤트 수정, 클러스터 상태 관리 |

확장은 **리전별 구성**으로 전역 가용성을 확보하고, 리전 안에서는 **도메인별로 이벤트를 나눠** 도메인마다 관리형 Kafka 클러스터가 처리하며, CPU 같은 지표로 자동 확장한다. Kafka 자체는 [[message-queue-kafka|메시지 큐와 Kafka]]에서 다룬다.

## CI/CD: 운영 환경에서 검증한다

대규모 서비스의 배포 파이프라인은 비슷한 단계로 이뤄진다.

| 단계 | 반복되는 선택 |
| --- | --- |
| 계획·문서 | 이슈 트래커, 위키 |
| 코드 품질 | 자체 정적 분석(널 안전성 검사기, 린터), **오래된 기능 플래그 자동 정리** |
| 저장소·빌드 | 모노레포 + 대규모 빌드 도구(Gradle, Bazel), 컨테이너·머신 이미지로 패키징 |
| 테스트 | 짧게 쓰고 버리는 테스트 환경, **운영 트래픽을 복제해 재생하는 부하 테스트**, 카오스 엔지니어링 |
| 배포 | 다중 클라우드 배포 도구(Spinnaker)로 **카나리 배포**, 지표 기반 자동 판정(Kayenta) |
| 관측·대응 | 중앙 지표 저장소, 이상 탐지, 우선순위별 장애 호출(PagerDuty) |

배포 전략은 [[deployment-strategies|배포 전략]], 파이프라인 일반은 [[ci-cd|CI/CD]]에서 다룬다.

### 자동 버그 수정

대규모 코드베이스에서는 크래시 수정까지 자동화한다. Meta의 SapFix가 대표 사례다.

```mermaid
flowchart TB
  a["개발자가 변경(diff) 제출"] --> b["자동 생성된 테스트로 변경을 실행 → 크래시 발견"]
  b --> c["수정 후보 생성: 템플릿 적용 / 코드 변이(mutation) /<br/>전체 되돌리기 / 부분 되돌리기"]
  c --> d["후보마다 패치된 빌드로 테스트 → 통과한 후보 선택"]
  d --> e["크래시를 일으킨 변경의 작성자에게 리뷰 요청"]
  e --> f["사람이 수락 또는 폐기"]
```

이 흐름은 **자동화가 고치고, 맥락을 가장 잘 아는 사람이 승인하는** 분업이다. 지금은 LLM 기반 코딩 에이전트가 같은 역할을 넓게 맡지만, 「테스트로 검증한 후보만 사람에게 올린다」는 원칙은 같다.

## 소프트웨어로 안 되면 전용 하드웨어

영상 플랫폼은 업로드된 원본을 기기별 해상도·압축률로 **트랜스코딩**해야 한다. 업로드 양이 늘면 범용 CPU의 소프트웨어 인코딩은 느리고 비싸다. YouTube는 영상 인코딩·디코딩만 하는 전용 가속기(VCU, Video transCoding Unit)를 만들어 클러스터 단위로 배치했다. GPU가 그래픽을, TPU가 머신 러닝을 맡는 것과 같은 발상이다. **특정 연산이 전체 비용을 지배하면 전용 하드웨어가 답이 된다.**

## 사례를 더 찾을 곳

설계 사례는 각 회사의 엔지니어링 블로그가 1차 자료다. Netflix TechBlog, Uber Engineering, Cloudflare Blog, Engineering at Meta, LinkedIn Engineering, Discord Blog, AWS Architecture Blog, Slack Engineering, Stripe Blog가 자주 인용된다.

## 정리

- 남의 스택에서는 제품명이 아니라 계층별로 반복되는 설계 원칙을 가져온다.
- 데이터 성격마다 DB를 따로 고르고(폴리글랏 저장), 캐시는 미리 계산한 결과를 담는 기본 저장소로도 쓴다.
- 비싼 쓰기는 큐로 미루고, 캐시·복제본은 CDC 변경 로그로 맞춘다.
- 이벤트는 레지스트리·공용 SDK·게이트웨이로 표준화하고 도메인별로 나눠 확장한다.
- 배포는 카나리와 지표 판정으로 운영 환경에서 검증하고, 반복되는 수정은 자동화하되 승인은 사람이 한다.

관련 노트: [[api-layer-evolution|아키텍처와 API 계층의 진화]], [[microservices-architecture|마이크로서비스 아키텍처]], [[wide-column-database|와이드 컬럼 DB]], [[caching-strategies|캐싱 전략]], [[message-queue-kafka|메시지 큐와 Kafka]], [[ci-cd|CI/CD]], [[deployment-strategies|배포 전략]]
