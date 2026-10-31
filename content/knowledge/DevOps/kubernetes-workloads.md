---
title: "쿠버네티스 워크로드와 파드 생명주기"
concept: "Kubernetes Workloads"
summary: "파드의 단계(Pending·Running·Succeeded·Failed·Unknown)와 컨테이너 상태, 재시작 정책, 사이드카·앰버서더·어댑터·초기화 컨테이너 패턴, liveness·readiness·startup 프로브, 그리고 Deployment·ReplicaSet·StatefulSet·DaemonSet·Job·CronJob이 파드를 관리하는 방식과 주요 설정(maxSurge·maxUnavailable, 순차 배포, completions·parallelism, concurrencyPolicy)을 정리한다."
tags: ["devops", "kubernetes", "container", "infra"]
source: other
date: "2026-10-30"
sources: ["https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/kubernetes.md", "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/", "https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/", "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/", "https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/", "https://kubernetes.io/docs/concepts/workloads/controllers/job/", "https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/", "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/"]
---

> fru1tworld/cs-basic 모의 면접 질문 목록의 「[Kubernetes](https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/kubernetes.md)」 항목이 묻는 개념을 쿠버네티스 공식 문서로 확인해 정리한 노트다.

쿠버네티스 구조와 파드의 기본 개념은 [[kubernetes-architecture|쿠버네티스 구조와 핵심 개념]]에 있다. 이 노트는 파드 하나가 어떤 상태를 거치는지, 그리고 워크로드 리소스가 파드를 어떤 규칙으로 만들고 바꾸는지를 다룬다.

## 파드 생명주기

### 파드 단계(phase)

`status.phase`는 파드 전체가 생명주기의 어디쯤인지 보여 주는 요약값이다.

| 단계 | 뜻 | 흔한 상황 |
| --- | --- | --- |
| Pending | API 서버가 파드를 받았지만 컨테이너가 아직 다 실행되지 않았다 | 스케줄링 대기, 이미지 내려받는 중, 볼륨 연결 대기 |
| Running | 노드에 배정되어 컨테이너가 모두 만들어졌고, 하나 이상이 실행 중이거나 시작·재시작 중이다 | 정상 서비스. CrashLoopBackOff 중인 파드도 단계는 Running이다 |
| Succeeded | 모든 컨테이너가 성공(종료 코드 0)으로 끝났고 다시 시작하지 않는다 | Job이 끝난 파드 |
| Failed | 모든 컨테이너가 끝났고 하나 이상이 실패했다 | Job 실패, 축출(eviction)된 파드 |
| Unknown | 파드 상태를 얻을 수 없다 | 노드와 통신이 끊김 |

### 파드 단계와 컨테이너 상태

단계는 파드 단위의 거친 요약이고, **컨테이너 상태(state)** 는 컨테이너마다 따로 있는 세부 상태다. 장애 원인은 대개 컨테이너 상태의 `reason`에 있다.

| 컨테이너 상태 | 뜻 | reason 예 |
| --- | --- | --- |
| Waiting | 아직 실행 전이거나 다시 시작을 기다린다 | `ContainerCreating`, `ImagePullBackOff`, `CrashLoopBackOff`, `CreateContainerConfigError` |
| Running | 실행 중 | - |
| Terminated | 끝났다. 종료 코드·시각·이유가 남는다 | `Completed`, `Error`, `OOMKilled` |

이 밖에 파드에는 조건(conditions) 목록이 있다. `PodScheduled → Initialized → ContainersReady → Ready` 순으로 참이 되고, **`Ready`가 참인 파드만 서비스 트래픽을 받는다.** 그래서 「Running인데 트래픽이 안 온다」는 대개 readiness 프로브 실패다.

### 재시작 정책(restartPolicy)

restartPolicy는 파드 안 컨테이너가 끝났을 때 같은 노드의 kubelet이 다시 띄울지를 정한다. 파드를 다른 노드로 옮기는 것은 컨트롤러의 일이라 이 정책과 별개다.

| 값 | 동작 | 쓰임 |
| --- | --- | --- |
| `Always` (기본값) | 성공·실패와 상관없이 다시 띄운다 | 웹 서버처럼 계속 떠 있어야 하는 것. Deployment·StatefulSet·DaemonSet은 이 값만 허용한다 |
| `OnFailure` | 실패(0이 아닌 종료 코드)일 때만 다시 띄운다 | 실패하면 같은 파드에서 재시도할 배치 Job |
| `Never` | 다시 띄우지 않는다 | 실패 시 새 파드로 재시도하거나 실패 기록을 남겨야 하는 Job |

재시작은 10초, 20초, 40초처럼 지연을 두 배씩 늘려 최대 5분까지 기다린다(백오프). 컨테이너가 10분 동안 문제없이 돌면 지연이 초기화된다. 이 기다림 상태가 `CrashLoopBackOff`다.

### Pending에 머무는 원인

| 원인 | 확인 | 해결 |
| --- | --- | --- |
| 자원 부족: requests를 받아 줄 노드가 없다 | `kubectl describe pod`의 이벤트 `FailedScheduling: 0/3 nodes are available: Insufficient cpu` | requests를 줄이거나 노드 추가(Cluster Autoscaler) |
| 배치 조건 불일치: nodeSelector·어피니티·테인트 | 같은 이벤트의 `node(s) didn't match`, `untolerated taint` | 라벨·톨러레이션 수정 |
| PVC가 바인딩되지 않음 | `kubectl get pvc`가 Pending | StorageClass 이름, 프로비저너, 접근 모드 확인 |
| 이미지 내려받는 중 | 컨테이너 상태 `ContainerCreating` | 큰 이미지면 기다리거나 이미지를 줄인다. 실패하면 ImagePullBackOff로 바뀐다 |

### 종료 과정

파드를 지우면 kubelet은 preStop 훅을 실행하고 컨테이너의 PID 1에 `SIGTERM`을 보낸 뒤, `terminationGracePeriodSeconds`(기본 30초)가 지나도 살아 있으면 `SIGKILL`로 끝낸다. 같은 시점에 파드는 서비스 엔드포인트에서 빠지는데, 두 일이 병렬로 일어나므로 빠지기 직전 잠깐 요청이 들어올 수 있다. 무중단 배포에서는 앱이 `SIGTERM`을 받은 뒤 진행 중 요청을 마치고 끝나게 만들고, 필요하면 preStop에 짧은 대기를 둔다. PID 1과 신호 문제는 [[dockerfile|Dockerfile 작성과 컨테이너의 PID 1]]에 있다.

## 헬스 체크: 프로브

kubelet은 프로브로 컨테이너의 상태를 주기적으로 검사한다.

| 프로브 | 실패하면 | 묻는 것 |
| --- | --- | --- |
| liveness | **컨테이너를 재시작**한다 | 프로세스가 회복 불가능하게 멈췄나(교착 상태 등) |
| readiness | **서비스 엔드포인트에서 뺀다.** 재시작하지 않는다 | 지금 요청을 받을 수 있나(워밍업 중, 일시 과부하) |
| startup | 성공할 때까지 liveness·readiness를 멈춘다. 기한 안에 성공하지 못하면 재시작 | 느리게 시작하는 앱이 다 떴나 |

검사 방식은 `httpGet`(응답 코드 200~399면 성공), `tcpSocket`(포트 연결), `exec`(명령 종료 코드 0), `grpc`(gRPC 헬스 체크 프로토콜) 네 가지다.

| 설정 | 기본값 | 뜻 |
| --- | --- | --- |
| `initialDelaySeconds` | 0 | 컨테이너 시작 후 첫 검사까지 대기 |
| `periodSeconds` | 10 | 검사 간격 |
| `timeoutSeconds` | 1 | 응답을 기다리는 시간 |
| `failureThreshold` | 3 | 연속 몇 번 실패해야 실패로 판정 |
| `successThreshold` | 1 | 실패 뒤 연속 몇 번 성공해야 회복으로 판정(liveness·startup은 1만 가능) |

느린 앱은 initialDelaySeconds를 크게 잡기보다 **startup 프로브**를 쓴다. `failureThreshold × periodSeconds`(예: 30 × 10초 = 5분)가 시작을 기다리는 최대 시간이 되고, 시작 뒤에는 liveness가 짧은 주기로 돈다.

```yaml
startupProbe:
  httpGet: { path: /healthz, port: 8080 }
  failureThreshold: 30
  periodSeconds: 10
livenessProbe:
  httpGet: { path: /healthz, port: 8080 }   # 프로세스 자체만 본다
  periodSeconds: 10
readinessProbe:
  httpGet: { path: /ready, port: 8080 }     # 의존성·워밍업까지 본다
  periodSeconds: 5
```

### 잘못된 프로브가 만드는 장애

| 실수 | 결과 | 바로잡기 |
| --- | --- | --- |
| liveness가 DB·외부 API까지 검사한다 | DB가 잠깐 느려지면 모든 파드가 동시에 재시작해 장애가 커진다 | liveness는 프로세스 자신만 본다. 의존성은 readiness에서 본다 |
| 느린 시작에 liveness만 있다 | 다 뜨기 전에 죽여 CrashLoopBackOff에 빠진다 | startup 프로브를 더한다 |
| timeoutSeconds가 너무 짧다 | 부하가 몰리면 응답이 늦어 재시작되고, 남은 파드에 부하가 더 몰린다 | 실제 지연 분포에 맞춰 늘린다 |
| readiness가 없다 | 앱이 준비되기 전에 트래픽을 받아 배포 때마다 오류가 난다 | readiness를 둔다. 롤링 업데이트도 readiness를 기준으로 진행된다 |

## 파드 다중 컨테이너 패턴

한 파드 안의 컨테이너는 네트워크(`localhost`)와 볼륨을 공유한다. 이를 이용해 앱을 고치지 않고 기능을 더하는 패턴이 있다.

| 패턴 | 역할 | 예 |
| --- | --- | --- |
| 사이드카(Sidecar) | 앱 옆에서 **보조 기능을 더한다** | 로그 수집기(Fluent Bit)가 공유 볼륨의 로그 파일을 읽어 전송, 서비스 메시 프록시(Envoy), 설정 파일을 Git에서 주기적으로 당겨 오는 동기화기 |
| 앰버서더(Ambassador) | 앱이 **밖으로 나가는 연결을 대신 맡는 프록시** | 앱은 `localhost:5432`로만 접속하고 앰버서더가 인증·TLS·샤드 선택을 처리(Cloud SQL Auth Proxy), 로컬 Redis 프록시 |
| 어댑터(Adapter) | 앱의 **출력을 표준 형식으로 바꾼다** | 레거시 앱의 로그 형식을 JSON으로 변환, 앱 고유 지표를 Prometheus 형식으로 노출하는 익스포터 |
| 초기화 컨테이너(Init Container) | 앱 컨테이너보다 **먼저 실행되고 끝나는** 준비 작업 | DB 마이그레이션, 의존 서비스가 뜰 때까지 대기, 설정·인증서 내려받기, 볼륨 권한 조정 |

앰버서더와 어댑터는 사이드카의 특수한 형태로, 앰버서더는 나가는 방향, 어댑터는 밖에서 읽어 가는 방향을 다룬다.

### 초기화 컨테이너

| | 초기화 컨테이너 | 일반 컨테이너 |
| --- | --- | --- |
| 실행 | 정의한 순서대로 **하나씩**, 앞의 것이 성공해야 다음이 시작 | 초기화가 모두 끝난 뒤 함께 시작 |
| 수명 | 끝까지 실행되고 종료해야 한다 | 계속 실행 |
| 프로브 | 없다 | liveness·readiness·startup |
| 자원 | 초기화 컨테이너 중 가장 큰 requests가 파드의 실효 요청이 된다 | 합산 |

초기화 컨테이너가 실패하면 파드의 restartPolicy에 따라 다시 시도한다. `Always`·`OnFailure`면 성공할 때까지 처음부터 재시도하고(이때 파드는 `Init:CrashLoopBackOff`로 보인다), `Never`면 파드가 Failed가 된다. 여러 번 실행될 수 있으므로 **멱등하게** 만든다.

### 네이티브 사이드카

일반 컨테이너로 만든 사이드카는 시작 순서가 보장되지 않고, Job에서는 앱이 끝나도 사이드카가 남아 Job이 끝나지 않는 문제가 있었다. 쿠버네티스 1.33에서 정식 기능이 된 **네이티브 사이드카**는 `initContainers`에 `restartPolicy: Always`를 준 컨테이너다.

- 앱 컨테이너보다 먼저 시작해 준비된 뒤 앱이 뜨고, 앱 컨테이너가 모두 끝난 뒤에 종료된다.
- 파드가 사는 동안 계속 돌고, 죽으면 다시 시작되며, 프로브를 걸 수 있다.
- Job의 앱 컨테이너가 끝나면 사이드카가 남아 있어도 Job이 완료된다.

```yaml
initContainers:
  - name: log-shipper
    image: fluent/fluent-bit:4.0
    restartPolicy: Always        # 이 한 줄이 사이드카로 만든다
```

## Deployment와 ReplicaSet

```text
Deployment (원하는 버전·전략)
  └ ReplicaSet (파드 템플릿 하나의 복제 수 유지, 이름에 템플릿 해시)
      └ Pod × replicas
```

**ReplicaSet**은 라벨 셀렉터에 맞는 파드를 정해진 수만큼 유지하는 일만 한다. **Deployment**는 그 위에서 버전 교체를 맡는다. 파드 템플릿이 바뀌면 새 ReplicaSet을 만들어 늘리고 옛 ReplicaSet을 줄인다. 옛 ReplicaSet은 파드 0개로 남겨 두어 되돌릴 때 쓴다. ReplicaSet을 직접 만들 일은 거의 없다.

### 배포 전략

| 전략 | 동작 | 언제 |
| --- | --- | --- |
| `RollingUpdate` (기본값) | 새 파드를 조금씩 늘리고 옛 파드를 줄인다. 두 버전이 잠시 함께 돈다 | 무중단이 필요한 상태 없는 서비스 |
| `Recreate` | 옛 파드를 모두 내린 뒤 새 파드를 띄운다. 그 사이 다운타임이 생긴다 | 두 버전이 동시에 돌면 안 될 때(DB 스키마 비호환, 단일 쓰기 볼륨) |

블루-그린·카나리를 쿠버네티스에서 구현하는 방법과 전략 비교는 [[deployment-strategies|배포 전략]]에 있다.

### maxSurge와 maxUnavailable

| 설정 | 뜻 | 기본값 |
| --- | --- | --- |
| `maxSurge` | replicas보다 **더 띄울 수 있는** 파드 수(정수 또는 %, 올림) | 25% |
| `maxUnavailable` | 업데이트 중 **사용 불가로 둘 수 있는** 파드 수(정수 또는 %, 내림) | 25% |

replicas가 10이면 기본값에서 파드는 최대 13개(10 + 3), 최소 8개(10 − 2)가 준비 상태로 유지된다. 둘 다 0일 수는 없다.

| 조합 | 성격 |
| --- | --- |
| `maxSurge: 1`, `maxUnavailable: 0` | 용량이 줄지 않는 가장 안전한 방식. 느리고 여유 자원이 필요하다 |
| `maxSurge: 0`, `maxUnavailable: 1` | 추가 자원 없이 교체. 교체 중 용량이 하나 준다 |
| `maxSurge: 100%` | 새 버전을 한꺼번에 띄운 뒤 옛것을 내린다. 빠르지만 순간 자원이 두 배 |

새 파드는 readiness를 통과하고 `minReadySeconds` 동안 유지되어야 준비된 것으로 친다. `progressDeadlineSeconds`(기본 600초) 안에 진행이 없으면 배포가 실패 상태로 표시된다. 자동으로 되돌리지는 않는다.

### 롤백과 리비전 기록

```bash
kubectl rollout status deploy/api
kubectl rollout history deploy/api                 # 리비전 목록
kubectl rollout history deploy/api --revision=3    # 해당 리비전의 템플릿
kubectl rollout undo deploy/api                    # 직전 리비전으로
kubectl rollout undo deploy/api --to-revision=3
kubectl rollout pause deploy/api                   # 여러 변경을 모아 한 번에 배포
```

- 리비전은 파드 템플릿(`spec.template`)이 바뀔 때만 생긴다. replicas 변경은 리비전이 아니다.
- `revisionHistoryLimit`(기본 10)만큼 옛 ReplicaSet을 남긴다. 0이면 되돌릴 수 없다.
- 롤백도 「옛 템플릿으로의 새 롤아웃」이다. 이미지만 되돌리므로 DB 마이그레이션 같은 바깥 변경은 따로 되돌려야 한다.
- GitOps 환경에서는 `rollout undo` 대신 Git 커밋을 되돌린다. 그렇지 않으면 다음 동기화가 롤백을 덮어쓴다.

## StatefulSet

| | Deployment | StatefulSet |
| --- | --- | --- |
| 파드 이름 | `api-7d9f8-x2k4p`처럼 무작위 | `db-0`, `db-1`처럼 **순번(ordinal)이 붙은 고정 이름** |
| 네트워크 ID | 파드가 바뀌면 이름·IP가 바뀐다 | 다시 만들어져도 같은 이름과 DNS 이름 |
| 저장소 | 보통 공유하거나 없음 | 파드마다 **자기 PVC**. 다시 만들어져도 같은 PVC에 붙는다 |
| 생성·삭제 순서 | 동시에 | 기본은 0부터 순서대로 생성, 역순으로 삭제 |
| 쓰임 | 상태 없는 서비스 | DB, Kafka, ZooKeeper, Elasticsearch처럼 멤버마다 정체성과 데이터가 있는 시스템 |

### 고정 정체성이 보장되는 방법

- **이름**: `<StatefulSet 이름>-<순번>`. `db-1`이 죽으면 컨트롤러는 같은 이름 `db-1`로 다시 만든다.
- **DNS**: StatefulSet은 `serviceName`에 **헤드리스 서비스**(`clusterIP: None`)를 지정해야 한다. 헤드리스 서비스는 가상 IP 대신 파드마다 DNS 레코드 `db-1.db.<네임스페이스>.svc.cluster.local`을 만든다. 파드 IP가 바뀌어도 이 이름은 그대로라, 「0번이 리더」처럼 멤버를 이름으로 가리키는 클러스터를 구성할 수 있다. 일반 서비스는 파드들을 가상 IP 하나 뒤로 숨겨 특정 멤버를 고를 수 없다.
- **저장소**: `volumeClaimTemplates`가 파드마다 `<템플릿 이름>-<StatefulSet 이름>-<순번>`(예: `data-db-1`) PVC를 만든다. 파드가 다른 노드로 옮겨 다시 만들어져도 같은 PVC에 붙어 데이터를 이어받는다. 스케일 다운하거나 StatefulSet을 지워도 PVC는 기본으로 **남는다.** 데이터를 실수로 잃지 않게 하기 위해서다. 지우게 하려면 `persistentVolumeClaimRetentionPolicy`(`whenDeleted`, `whenScaled`를 `Retain`·`Delete`로)를 쓴다.

### 순차 배포와 병렬 배포

| `podManagementPolicy` | 동작 |
| --- | --- |
| `OrderedReady` (기본값) | `db-0`이 Running·Ready가 된 뒤 `db-1`을 만든다. 줄일 때는 큰 순번부터 하나씩 지운다. 리더부터 떠야 하는 클러스터에 맞다 |
| `Parallel` | 순서를 기다리지 않고 동시에 만들고 지운다. 멤버끼리 순서 의존이 없을 때 빨리 뜬다 |

이 정책은 **늘리고 줄일 때만** 적용된다. 업데이트는 `updateStrategy`가 정한다. 기본 `RollingUpdate`는 가장 큰 순번부터 하나씩 교체하고, `partition: 2`를 주면 순번 2 이상만 바꿔 일부 멤버로 먼저 시험할 수 있다. `OnDelete`는 사람이 파드를 지울 때만 새 버전으로 바꾼다.

StatefulSet은 정체성과 저장소만 줄 뿐 복제·장애 조치는 해 주지 않는다. DB 클러스터를 제대로 운영하려면 그 지식을 담은 오퍼레이터를 쓴다([[kubernetes-operations|쿠버네티스 운영]]).

## DaemonSet

DaemonSet은 **조건에 맞는 노드마다 파드를 하나씩** 띄운다. 노드가 추가되면 파드가 자동으로 생기고, 노드가 빠지면 파드도 정리된다.

- 쓰임: 로그 수집기(Fluent Bit), 노드 지표 익스포터(node-exporter), CNI 에이전트(Cilium·Calico), kube-proxy, 스토리지 드라이버.
- 일부 노드에만 띄우기: 파드 템플릿에 `nodeSelector`(예: `gpu: "true"`)나 노드 어피니티를 준다. 테인트가 걸린 노드(컨트롤 플레인, 전용 노드)에도 띄우려면 톨러레이션을 더한다.
- `node.kubernetes.io/not-ready`, `unreachable` 같은 테인트에 대한 톨러레이션이 자동으로 붙어, 노드 상태가 나빠도 축출되지 않는다.
- 업데이트는 `RollingUpdate`(노드별 `maxUnavailable`) 또는 `OnDelete`다.

## Job과 CronJob

### Job

Job은 **끝나는 작업**을 정해진 횟수만큼 성공시킨다.

| 설정 | 뜻 |
| --- | --- |
| `completions` | 성공으로 끝나야 하는 파드 수. 기본 1 |
| `parallelism` | 동시에 실행할 파드 수. 기본 1 |
| `completionMode: Indexed` | 파드마다 0~completions−1 인덱스를 준다. 데이터를 인덱스별로 나눠 처리할 때 |
| `backoffLimit` | Job 전체를 실패로 판정하기 전까지 허용하는 재시도 횟수. 기본 6. 재시도 사이 대기는 10초부터 두 배씩, 최대 6분 |
| `activeDeadlineSeconds` | Job 전체의 실행 시간 상한. 넘으면 남은 파드를 모두 끝내고 실패로 판정한다. backoffLimit보다 우선한다 |
| `ttlSecondsAfterFinished` | 끝난 Job과 파드를 몇 초 뒤 자동 삭제할지 |
| `podFailurePolicy` | 종료 코드·조건별로 즉시 실패, 재시도 횟수에서 제외 같은 규칙. 축출된 파드를 실패로 세지 않을 때 쓴다 |

| 패턴 | 설정 |
| --- | --- |
| 한 번 실행 | completions 1, parallelism 1 |
| 고정 횟수 병렬 | completions 10, parallelism 3: 10번 성공할 때까지 3개씩 |
| 작업 큐 | completions 생략, parallelism N: 파드들이 큐에서 일을 꺼내다 큐가 비면 끝낸다 |

Job 파드의 restartPolicy는 `OnFailure` 또는 `Never`만 된다. `OnFailure`는 같은 파드 안에서 컨테이너를 다시 띄우고, `Never`는 새 파드를 만든다. 실패한 파드의 로그를 남겨 보려면 `Never`가 낫다.

### CronJob

CronJob은 cron 일정에 따라 Job을 만든다.

```yaml
apiVersion: batch/v1
kind: CronJob
metadata: { name: report }
spec:
  schedule: "0 3 * * *"          # 분 시 일 월 요일
  timeZone: "Asia/Seoul"         # 생략하면 kube-controller-manager의 시간대
  concurrencyPolicy: Forbid
  startingDeadlineSeconds: 300
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers: [{ name: report, image: report:1.4.2 }]
```

| `concurrencyPolicy` | 이전 Job이 아직 돌 때 새 일정이 오면 |
| --- | --- |
| `Allow` (기본값) | 함께 실행한다 |
| `Forbid` | 이번 실행을 건너뛴다 |
| `Replace` | 이전 Job을 지우고 새 Job으로 바꾼다 |

- `startingDeadlineSeconds`: 컨트롤러 장애 등으로 예정 시각을 놓쳤을 때 이 시간 안이면 늦게라도 실행하고, 넘으면 건너뛴다.
- CronJob은 드물게 한 일정에 Job을 두 번 만들거나 건너뛸 수 있다. 작업은 **멱등하게** 만든다.
- `suspend: true`로 일정을 잠시 멈춘다.

## 정리

- 파드 단계는 거친 요약이고, 원인은 컨테이너 상태의 reason과 `kubectl describe`의 이벤트에 있다. Ready 조건이 참인 파드만 트래픽을 받는다.
- liveness는 재시작, readiness는 트래픽 차단, startup은 느린 시작 보호다. liveness에 의존성 검사를 넣지 않는다.
- 사이드카·앰버서더·어댑터는 파드 안 공유 네트워크·볼륨으로 앱을 고치지 않고 기능을 더한다. 사이드카는 `restartPolicy: Always` 초기화 컨테이너로 만든다.
- Deployment는 ReplicaSet을 갈아 끼우며 롤링 업데이트하고, maxSurge·maxUnavailable로 속도와 용량을 맞바꾼다.
- 고정 이름·DNS·저장소가 필요하면 StatefulSet(헤드리스 서비스 필수), 노드마다 하나면 DaemonSet, 끝나는 작업은 Job, 주기 작업은 CronJob이다.

관련 노트: [[kubernetes-architecture|쿠버네티스 구조와 핵심 개념]], [[deployment-strategies|배포 전략]], [[kubernetes-storage-config|쿠버네티스 저장소와 설정]], [[kubernetes-scheduling-resources|쿠버네티스 스케줄링과 자원 관리]], [[kubernetes-operations|쿠버네티스 운영]], [[dockerfile|Dockerfile 작성과 컨테이너의 PID 1]]
