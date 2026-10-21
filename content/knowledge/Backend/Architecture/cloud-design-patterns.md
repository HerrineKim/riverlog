---
title: "클라우드 설계 패턴"
concept: "Cloud Design Patterns"
summary: "클라우드 앱이 반복해서 만나는 문제(서버가 파일 전송을 떠안음, 순간 폭주, 설정 재배포, 여러 단계 작업의 실패, 인스턴스 상태 판단, 인증 위임)를 푸는 패턴을 모았다. 발레 키, 정적 콘텐츠 호스팅, 큐 기반 부하 평준화, 파이프와 필터, 계산 자원 통합, 외부 설정 저장소, 스케줄러·에이전트·감독자, 헬스 엔드포인트 모니터링, 연합 ID, 백그라운드 작업을 다루고, 다른 노트에 집이 있는 패턴은 지도로 잇는다."
tags: ["backend", "architecture", "cloud", "design-pattern", "async"]
source: other
date: "2026-10-21"
sources: ["https://learn.microsoft.com/en-us/azure/architecture/patterns/", "https://learn.microsoft.com/en-us/azure/architecture/patterns/valet-key", "https://learn.microsoft.com/en-us/azure/architecture/patterns/static-content-hosting", "https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling", "https://learn.microsoft.com/en-us/azure/architecture/patterns/pipes-and-filters", "https://learn.microsoft.com/en-us/azure/architecture/patterns/compute-resource-consolidation", "https://learn.microsoft.com/en-us/azure/architecture/patterns/external-configuration-store", "https://learn.microsoft.com/en-us/azure/architecture/patterns/scheduler-agent-supervisor", "https://learn.microsoft.com/en-us/azure/architecture/patterns/health-endpoint-monitoring", "https://learn.microsoft.com/en-us/azure/architecture/patterns/federated-identity", "https://learn.microsoft.com/en-us/azure/architecture/best-practices/background-jobs", "https://microservices.io/patterns/externalized-configuration.html"]
---

> Microsoft Azure Architecture Center의 「[Cloud Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/)」 가운데 「[Valet Key](https://learn.microsoft.com/en-us/azure/architecture/patterns/valet-key)」, 「[Static Content Hosting](https://learn.microsoft.com/en-us/azure/architecture/patterns/static-content-hosting)」, 「[Queue-Based Load Leveling](https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling)」, 「[Pipes and Filters](https://learn.microsoft.com/en-us/azure/architecture/patterns/pipes-and-filters)」, 「[Compute Resource Consolidation](https://learn.microsoft.com/en-us/azure/architecture/patterns/compute-resource-consolidation)」, 「[External Configuration Store](https://learn.microsoft.com/en-us/azure/architecture/patterns/external-configuration-store)」, 「[Scheduler Agent Supervisor](https://learn.microsoft.com/en-us/azure/architecture/patterns/scheduler-agent-supervisor)」, 「[Health Endpoint Monitoring](https://learn.microsoft.com/en-us/azure/architecture/patterns/health-endpoint-monitoring)」, 「[Federated Identity](https://learn.microsoft.com/en-us/azure/architecture/patterns/federated-identity)」, 「[Best practices for background jobs](https://learn.microsoft.com/en-us/azure/architecture/best-practices/background-jobs)」과 microservices.io의 「[Externalized configuration](https://microservices.io/patterns/externalized-configuration.html)」을 바탕으로 재구성한 노트다.

## 클라우드 설계 패턴이란

**클라우드 설계 패턴은 여러 인스턴스·관리형 서비스·네트워크 호출로 이뤄진 앱이 반복해서 만나는 문제와 그 해법에 이름을 붙인 것이다.** 이름은 Azure 문서에서 왔지만 내용은 클라우드 제공자와 무관하다. 패턴마다 「무엇을 앱 밖으로 떼어 내나」가 핵심이다. 파일 전송은 스토리지로, 순간 폭주는 큐로, 설정은 설정 저장소로, 인증은 ID 제공자로 넘긴다.

## 패턴 지도

이 노트는 다른 노트에 집이 없는 패턴을 다룬다. 이미 설명한 패턴은 아래에서 찾는다.

| 문제 | 패턴 | 있는 곳 |
| --- | --- | --- |
| 서버가 파일 업로드·다운로드를 중계한다 | 발레 키, 정적 콘텐츠 호스팅 | 이 노트 |
| 순간 폭주가 하류 서비스를 쓰러뜨린다 | 큐 기반 부하 평준화 | 이 노트 |
| 큐 하나를 여러 소비자가 나눠 처리, 급한 일 먼저 | 경쟁 소비자, 우선순위 큐, 클레임 체크 | [[distributed-system-patterns\|분산 시스템의 통신·데이터 흐름 패턴]] |
| 처리 단계를 재사용·독립 확장하고 싶다 | 파이프와 필터 | 이 노트 |
| 작은 작업마다 인스턴스를 띄워 비용이 샌다 | 계산 자원 통합 | 이 노트 |
| 설정을 바꾸려고 재배포한다 | 외부 설정 저장소 | 이 노트 |
| 여러 원격 단계로 된 작업이 중간에 죽는다 | 스케줄러·에이전트·감독자, 보상 트랜잭션, 사가 | 이 노트, [[distributed-data-patterns\|데이터 관리 패턴]] |
| 인스턴스가 살아 있는지, 일할 수 있는지 | 헬스 엔드포인트 모니터링 | 이 노트 |
| 앱마다 따로 로그인한다 | 연합 ID | 이 노트, [[oauth2\|OAuth 2.0과 OIDC]] |
| 일시적 오류, 죽은 의존성 | 재시도, 서킷 브레이커, 벌크헤드 | [[resiliency-patterns\|장애 확산을 막는 복원력 패턴]] |
| 읽기가 DB를 누른다 | 캐시 어사이드 | [[caching-strategies\|캐시 전략]] |
| 쓰기 모델과 읽기 모델이 다르다 | CQRS, 이벤트 소싱, 구체화된 뷰, 인덱스 테이블 | [[distributed-data-patterns\|데이터 관리 패턴]] |
| 한 저장소에 데이터가 다 안 들어간다 | 샤딩 | [[database-sharding\|데이터베이스 샤딩]] |
| 여러 노드 중 하나만 조율해야 한다 | 리더 선출 | [[distributed-system-patterns\|분산 시스템의 통신·데이터 흐름 패턴]] |
| 클라이언트마다 백엔드 진입점을 둔다 | API 게이트웨이, BFF | [[api-gateway\|API 게이트웨이]], [[bff\|BFF]] |

## 데이터 전송을 앱에서 떼어 내기

### 발레 키(Valet Key)

**앱이 파일을 직접 중계하지 않고, 특정 리소스에 대한 짧은 수명의 제한된 토큰을 발급해 클라이언트가 스토리지와 직접 주고받게 하는 패턴이다.** 이름은 차 키 전체 대신 주차 요원에게 건네는 발레 키에서 왔다.

```text
1. 클라이언트 → 앱: "photo.jpg 올릴게요"
2. 앱: 권한 확인 → 토큰 생성 (대상: uploads/u42/photo.jpg, 권한: 쓰기만, 유효: 5분)
3. 앱 → 클라이언트: 토큰이 붙은 URL
4. 클라이언트 → 스토리지: 그 URL로 직접 PUT   ← 앱 서버는 바이트를 만지지 않는다
```

| 구현 | 예 |
| --- | --- |
| AWS | S3 presigned URL, presigned POST(크기·형식 조건을 정책에 넣을 수 있다) |
| Azure | SAS(Shared Access Signature). Entra ID 자격으로 서명하는 사용자 위임 SAS를 권장한다 |
| GCP | Cloud Storage signed URL |

- **범위·권한·수명을 최대한 좁힌다.** 컨테이너 전체가 아니라 객체 하나, 읽기·쓰기 중 필요한 것만, 수 분 단위로 준다. 새어 나가면 수명 동안은 누구나 쓸 수 있다.
- 토큰만으로는 **업로드 크기와 사용 횟수를 막기 어렵다.** 버그로 같은 파일을 반복 업로드해도 비용이 나간다. 업로드 완료를 앱에 알리게 하거나 스토리지 이벤트로 감시하고, 받은 파일은 검증(형식·크기·악성 코드)하기 전까지 격리 영역에 둔다.
- 필요하면 작업이 끝난 뒤 토큰을 폐기한다. 서명 키를 바꾸면 그 키로 만든 토큰이 모두 무효가 된다.

### 정적 콘텐츠 호스팅(Static Content Hosting)

**HTML·이미지·스크립트·문서 같은 정적 파일을 계산 인스턴스가 아니라 스토리지 서비스에서 바로 내보내는 패턴이다.** 스토리지는 계산 자원보다 훨씬 싸고, 앞에 [[cdn|CDN]]을 두면 전 세계 엣지에서 캐시한다. S3 + CloudFront, Azure Storage 정적 웹 사이트 + Front Door가 전형이다.

- 컨테이너는 **공개 읽기만** 열고 쓰기는 절대 열지 않는다. 비공개 파일은 발레 키로 내준다.
- 앱과 정적 파일을 따로 배포하므로 버전을 맞춰야 한다. 파일 이름에 해시를 붙이면 둘이 엇갈려도 깨지지 않는다([[http-cache|HTTP 캐시]]).
- 내보내기 전에 가공(타임스탬프 삽입, 개인화)이 필요하거나 정적 파일이 아주 적으면 이득이 없다.

## 부하와 처리 흐름

### 큐 기반 부하 평준화(Queue-Based Load Leveling)

**작업과 그 작업이 부르는 서비스 사이에 큐를 버퍼로 두어, 들쭉날쭉한 요청을 서비스가 감당할 수 있는 일정한 속도로 바꾸는 패턴이다.**

```text
요청 생성 속도:  ▁▇▁▁█▂▁▇   (폭주)
                   │
                 [ 큐 ]       ← 넘치는 만큼 쌓인다
                   │
서비스 처리 속도: ▄▄▄▄▄▄▄▄   (일정)
```

| 얻는 것 | 내용 |
| --- | --- |
| 가용성 | 서비스가 잠시 죽어도 생산자는 계속 큐에 넣는다 |
| 비용 | 최대 부하가 아니라 **평균 부하**에 맞춰 인스턴스를 둔다 |
| 확장성 | 큐와 소비자 수를 따로 늘린다 |

- **평균 생산 속도가 소비 속도를 넘으면 큐는 끝없이 자라고 지연이 늘 뿐이다.** 큐 깊이를 지표로 보고 소비자를 늘리거나 생산자 쪽에서 덜어낸다(부하 차단).
- 소비자를 자동 확장하면서 하류 DB로 가는 총 속도를 제한하지 않으면, 과부하가 큐 뒤의 의존성으로 옮겨 갈 뿐이다.
- 대부분의 큐는 **최소 한 번(at-least-once)** 전달이다. 소비자는 멱등하게 만든다. 계속 실패하는 메시지는 데드 레터 큐로 빼서 큐를 막지 않게 한다.
- 소비자가 여럿이면 순서가 보장되지 않는다. 순서가 필요하면 키별 파티션·세션을 쓴다.
- 큐는 단방향이다. 호출자가 즉시 응답을 받아야 하는 저지연 동기 요청에는 맞지 않는다. 결과는 `202 Accepted` + 상태 조회로 돌려준다([[rest-api|REST API 설계]]).

큐와 브로커 자체는 [[message-queue-kafka|메시지 큐와 Kafka]]에 있다.

### 파이프와 필터(Pipes and Filters)

**복잡한 처리를 한 가지 일만 하는 필터로 쪼개고, 필터를 파이프(대개 큐)로 이어 파이프라인을 만드는 패턴이다.** 필터는 서로를 모르고 입력·출력 형식만 안다. 그래서 순서를 바꾸거나, 다른 파이프라인에서 재사용하거나, 느린 필터만 인스턴스를 늘릴 수 있다.

```text
업로드 ─▶ [형식 검사] ─▶ [바이러스 검사] ─▶ [썸네일 생성] ─▶ [메타데이터 저장]
              │                                  └ CPU 많이 씀 → 이 필터만 GPU·여러 인스턴스
              └ 다른 파이프라인(문서 업로드)에서도 재사용
```

- 파이프라인 전체 속도는 **가장 느린 필터**가 정한다.
- 필터가 처리 중 죽으면 메시지가 다시 처리될 수 있으므로 필터는 멱등해야 한다. 큐의 가시성 타임아웃이 처리 시간보다 짧으면 같은 메시지를 두 필터 인스턴스가 동시에 잡는다.
- 단계가 많을수록 요청 하나의 지연은 늘고, 흐름을 추적하려면 상관관계 ID가 필요하다.
- 셸의 `|` 파이프([[shell-pipeline|셸 파이프라인]])와 이미지·동영상 처리 파이프라인([[media-processing-pipeline|이미지·동영상 처리 서버 설계]])이 같은 생각이다.

### 계산 자원 통합(Compute Resource Consolidation)

**작은 작업마다 인스턴스를 따로 두면 놀고 있어도 비용이 나가므로, 성격이 비슷한 작업을 한 계산 단위(컨테이너·VM·앱 서비스)에 모으는 패턴이다.** 마이크로서비스를 극단으로 쪼갠 데 대한 반대 방향의 조정이다. 쿠버네티스가 여러 파드를 한 노드에 빽빽이 채우는 것(bin packing)도 같은 목적이다.

같이 묶어도 되는지는 다섯 가지로 따진다.

| 기준 | 묶으면 안 되는 경우 |
| --- | --- |
| 확장 | 한 작업은 폭주 트래픽을 받아 수십 개로 늘어야 하고, 다른 작업은 드문 메시지를 폴링만 한다 |
| 수명 | 오래 도는 작업이 있어 인스턴스를 재활용할 수 없다(체크포인트가 없다면) |
| 배포 주기 | 한 작업만 자주 바뀌는데, 배포할 때마다 같은 단위의 다른 작업도 멈춘다 |
| 보안 | 같은 보안 컨텍스트를 공유하므로 가장 취약한 작업이 전체의 수준이 된다 |
| 장애 | 한 작업의 메모리 누수·크래시가 같은 단위의 다른 작업을 쓰러뜨린다 |

## 설정과 작업 조율

### 외부 설정 저장소(External Configuration Store)

**설정을 배포 패키지에서 꺼내 중앙 저장소에 두고, 앱이 시작할 때나 실행 중에 읽어 오게 하는 패턴이다.** 설정만 바꾸려고 재배포하지 않아도 되고, 여러 앱·인스턴스가 같은 설정을 공유한다. 가장 단순한 형태는 환경 변수로 받는 것이다([[twelve-factor-app|12요소 앱]]의 설정 원칙). 마이크로서비스 쪽에서는 같은 생각을 「외부화된 설정(externalized configuration)」이라 부른다.

| 수준 | 예 |
| --- | --- |
| 환경 변수·파일 주입 | 쿠버네티스 ConfigMap·Secret, `docker run -e` |
| 관리형 설정 서비스 | AWS AppConfig, Systems Manager Parameter Store, Azure App Configuration, Spring Cloud Config, Consul KV |
| 비밀 전용 | AWS Secrets Manager, Azure Key Vault, HashiCorp Vault. 설정과 비밀은 저장소를 나누고 접근 권한도 따로 준다 |

- 저장소가 죽으면 앱이 못 뜨므로 가용성이 높아야 하고, 앱은 마지막으로 읽은 값을 **로컬 캐시**에 둔다.
- 실행 중에 값을 바꾸면 인스턴스마다 반영 시점이 달라 잠시 섞인다. 바뀐 설정을 검증하고 단계적으로 퍼뜨린다(AppConfig는 배포 전략과 롤백을 갖고 있다).
- 개발·스테이징·운영 환경별, 앱·조직별 범위와 상속을 정해 둔다. 설정의 버전도 남긴다.
- 기능 토글은 이 저장소 위에 얹힌 특수한 설정이다([[deployment-strategies|배포 전략]]).

과거 Azure 문서에는 실행 중 설정 변경을 앱에 알려 재시작 없이 반영하는 「런타임 재구성(Runtime Reconfiguration)」 패턴이 따로 있었다. 지금은 설정 서비스가 변경 감지·푸시를 기본으로 제공해 외부 설정 저장소의 한 부분으로 다룬다.

### 스케줄러·에이전트·감독자(Scheduler Agent Supervisor)

**여러 원격 단계로 된 작업을 하나의 논리적 작업으로 묶어 전체가 성공하거나, 실패하면 복구·되돌리기를 하게 하는 패턴이다.** 세 역할과 상태 저장소로 이뤄진다.

| 역할 | 하는 일 |
| --- | --- |
| 스케줄러(Scheduler) | 단계를 순서대로 실행하고, 단계마다 상태(시작 전·실행 중·완료)와 **완료 기한(complete-by)** 을 상태 저장소에 기록한다 |
| 에이전트(Agent) | 원격 서비스 호출 하나를 감싼다. 재시도와 오류 처리를 맡고, 재시도마다 **같은 식별자**를 넘겨 하류가 중복을 걸러 내게 한다 |
| 감독자(Supervisor) | 주기적으로 상태 저장소를 훑어 기한을 넘기거나 실패한 단계를 찾고, 재시도나 보상(되돌리기)을 **요청**한다. 직접 실행하지는 않는다 |

```text
스케줄러 ──요청──▶ 에이전트 ──▶ 원격 서비스
   │                (재시도, 멱등 ID)
   └─ 단계 상태 기록 ─▶ [상태 저장소] ◀─ 주기적 점검 ─ 감독자
                                              │
                         재시도·보상 요청 ◀────┘
```

- 감독자도 죽을 수 있으므로 여러 개를 두되 한 번에 하나만 일하게 [[distributed-system-patterns|리더 선출]]을 쓴다.
- 되돌릴 수 없는 단계(메일 발송)는 보상 대신 「다음에 바로잡기」로 설계한다.
- 지금은 이 구조를 직접 짜기보다 **내구성 있는 워크플로 엔진**(Temporal, AWS Step Functions, Azure Durable Functions)을 쓰는 경우가 많다. 엔진이 단계 상태 저장, 타임아웃, 재시도, 재개를 대신한다. 서비스 간 정합성을 보상 트랜잭션으로 맞추는 사가는 [[distributed-data-patterns|데이터 관리 패턴]]에 있다.

### 백그라운드 작업

**사용자 요청과 떼어 따로 실행하는 작업이다.** 요청 스레드에서 오래 걸리는 일을 하면 응답이 늦고 타임아웃·재시작에 작업이 끊긴다.

| 분류 | 예 |
| --- | --- |
| 종류 | CPU 집약(계산·분석), I/O 집약(파일 색인), 배치(야간 집계), 긴 워크플로(주문 처리), 민감 데이터 처리(격리된 프로세스로 넘긴다) |
| 이벤트 트리거 | 큐 메시지, 저장소 변경 감지, 내부 API 호출. 이미지 처리·메일 발송·신규 테넌트 준비 |
| 일정 트리거 | 타이머·cron. 인덱스 갱신, 일일 보고서, 오래된 데이터 정리, 정합성 점검 |

- 같은 작업이 두 번 실행돼도 결과가 같게 **멱등**하게 만든다.
- 일정 작업이 인스턴스마다 동시에 돌면 안 될 때는 분산 락이나 리더 선출로 한 곳에서만 실행한다.
- 결과를 호출자에게 돌려줘야 하면 상태 저장소·응답 큐·콜백을 쓴다.
- 실행 위치는 서버리스 함수, 컨테이너 잡(쿠버네티스 Job·CronJob), 배치 서비스, 워커 프로세스 중에서 실행 시간과 자원 요구로 고른다([[serverless-architecture|서버리스 아키텍처]]).

## 운영과 신원

### 헬스 엔드포인트 모니터링(Health Endpoint Monitoring)

**앱이 `/health` 같은 엔드포인트로 자기 상태를 알리고, 외부 도구가 주기적으로 그것을 호출해 판단하는 패턴이다.** 로드 밸런서는 이 결과로 건강한 인스턴스에만 트래픽을 보내고, 오케스트레이터는 재시작 여부를 정한다.

| 깊이 | 확인하는 것 | 쓰는 곳 |
| --- | --- | --- |
| 얕은 검사(shallow) | 프로세스가 응답하는가. 의존성은 부르지 않는다 | **liveness**. 실패하면 재시작한다. DB가 죽었다고 앱을 재시작해 봐야 고쳐지지 않으므로 여기에 의존성을 넣지 않는다 |
| 깊은 검사(deep) | 요청을 처리하는 데 꼭 필요한 의존성(DB, 캐시)까지 되는가 | **readiness**. 실패하면 트래픽에서만 뺀다. 선택적 의존성은 판단에서 뺀다 |
| 시작 검사 | 초기화(캐시 예열, 마이그레이션)가 끝났나 | 쿠버네티스 **startup** 프로브. 느린 시작을 장애로 오판하지 않게 한다 |

- 깊은 검사를 매 프로브마다 하면 DB 연결과 CPU를 잡아먹는다. 결과를 몇 초 캐시하거나 간격을 늘린다.
- 공유 의존성 하나가 느려지면 **모든 인스턴스가 동시에 not ready**가 되어 전체가 트래픽에서 빠지는 연쇄 장애가 날 수 있다. 실패 임계치를 여러 번 연속 실패로 잡는다.
- 상태 코드만으로 부족하면 본문에 구성 요소별 상태와 응답 시간을 담는다. 내부 구조가 드러나므로 상세 정보는 인증하거나 내부 네트워크에만 연다.
- 운영 데이터를 바꾸는 검사는 하지 않는다. 바꿔야 하는 합성 트랜잭션은 테스트 계정으로 하고 뒷정리한다.
- gRPC는 표준 헬스 체크 프로토콜(`grpc.health.v1.Health`)이 있다. 사용자 위치에서 화면까지 확인하는 외부 검사는 [[observability|관측 가능성]]의 합성 모니터링이다.

### 연합 ID(Federated Identity)

**앱이 사용자 인증을 직접 하지 않고 신뢰하는 외부 ID 제공자(IdP)에게 맡기는 패턴이다.** 사용자는 앱마다 다른 계정을 만들지 않고, 퇴사자 계정은 IdP 한 곳에서 막으면 모든 앱에서 막힌다.

```text
1. 서비스는 IdP(또는 토큰 발급 서비스 STS)를 미리 신뢰한다
2. 사용자 → IdP: 로그인
3. IdP → 사용자: 클레임(누구인지, 역할, 권한)이 담긴 서명된 토큰
4. 사용자 → 서비스: 토큰 제시 → 서비스는 서명을 검증하고 클레임으로 인가
```

- 앱은 토큰 속 **클레임으로 인가**한다(클레임 기반 접근 제어). 인증과 인가가 분리된다.
- 프로토콜은 웹·모바일은 OpenID Connect, 기업 SSO는 SAML 2.0이 주류다. 흐름은 [[oauth2|OAuth 2.0과 OIDC]]에 있다.
- IdP가 여럿이면 사용자가 어느 IdP 소속인지 고르는 단계(홈 영역 탐색, home realm discovery)가 필요하다. 이메일 도메인으로 자동 판별하는 경우가 많다.
- IdP가 단일 장애점이 되고, IdP마다 주는 클레임이 달라 앱이 기대하는 형식으로 바꾸는 변환이 필요하다.

## 정리

- 클라우드 패턴의 공통 방향은 **앱이 직접 하던 일을 전문 구성 요소로 떼어 내는 것**이다. 파일은 스토리지로(발레 키·정적 호스팅), 폭주는 큐로, 설정은 설정 저장소로, 인증은 IdP로 보낸다.
- 큐를 넣으면 **멱등 소비자, 데드 레터 큐, 큐 깊이 감시**가 함께 따라온다.
- 쪼개기(파이프와 필터)와 모으기(계산 자원 통합)는 반대 방향이다. 확장·수명·배포 주기·보안·장애 범위가 같은 것끼리 묶는다.
- 여러 단계 작업의 실패 복구는 상태 저장소 + 감독자 구조이고, 지금은 워크플로 엔진이 이 역할을 맡는다.
- 헬스 체크는 **liveness는 얕게, readiness는 필요한 의존성까지**로 나눈다.

관련 노트: [[distributed-system-patterns|분산 시스템의 통신·데이터 흐름 패턴]], [[distributed-data-patterns|데이터 관리 패턴: CDC, 이벤트 소싱, CQRS, 최종 일관성]], [[resiliency-patterns|장애 확산을 막는 복원력 패턴]], [[microservices-architecture|마이크로서비스 아키텍처]], [[system-design-fundamentals|시스템 설계의 품질 속성과 트레이드오프]], [[serverless-architecture|서버리스 아키텍처]]
