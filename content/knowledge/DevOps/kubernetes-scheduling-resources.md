---
title: "쿠버네티스 스케줄링과 자원 관리, 오토스케일링"
concept: "Kubernetes Scheduling"
summary: "파드를 어느 노드에 둘지 정하는 nodeSelector·노드 어피니티·파드 (안티)어피니티·토폴로지 분산·테인트와 톨러레이션, CPU·메모리 requests와 limits의 의미와 초과 시 동작, QoS 클래스, LimitRange·ResourceQuota·PriorityClass, 그리고 HPA·VPA·Cluster Autoscaler의 동작 원리와 함께 쓸 때의 주의점을 정리한다."
tags: ["devops", "kubernetes", "infra", "scalability", "performance"]
source: other
date: "2026-10-30"
sources: ["https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/kubernetes.md", "https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/", "https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/", "https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/", "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/", "https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/", "https://kubernetes.io/docs/concepts/policy/resource-quotas/", "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/", "https://kubernetes.io/blog/2025/12/19/kubernetes-v1-35-in-place-pod-resize-ga/", "https://github.com/kubernetes/autoscaler"]
---

> fru1tworld/cs-basic 모의 면접 질문 목록의 「[Kubernetes](https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/kubernetes.md)」 항목이 묻는 개념을 쿠버네티스 공식 문서와 kubernetes/autoscaler 문서로 확인해 정리한 노트다.

스케줄러가 필터링과 점수 매기기로 노드를 고르는 과정은 [[kubernetes-architecture|쿠버네티스 구조와 핵심 개념]]에 있다. 이 노트는 그 판단에 쓰이는 **조건(어디에 둘까)** 과 **자원 선언(얼마나 쓸까)**, 그리고 수요에 따라 파드와 노드를 늘리고 줄이는 오토스케일러를 다룬다.

## 노드 고르기: 라벨로 끌어당기기

### nodeSelector

```yaml
spec:
  nodeSelector:
    disktype: ssd
    topology.kubernetes.io/zone: ap-northeast-2a
```

라벨이 **모두 정확히 일치하는** 노드에만 둔다. 가장 단순하지만 「a 또는 b」, 「x가 아닌」 같은 조건과 「되도록이면」 같은 선호를 표현하지 못한다.

### 노드 어피니티

노드 어피니티는 nodeSelector의 표현력 부족을 채운다. 연산자 `In`, `NotIn`, `Exists`, `DoesNotExist`, `Gt`, `Lt`를 쓰고, 강제 조건과 선호 조건을 나눈다.

| 종류 | 뜻 |
| --- | --- |
| `requiredDuringSchedulingIgnoredDuringExecution` | **반드시** 만족해야 한다. 맞는 노드가 없으면 Pending |
| `preferredDuringSchedulingIgnoredDuringExecution` | **되도록** 만족한다. 가중치(1~100)만큼 점수를 더하고, 없으면 다른 노드에 둔다 |

이름 끝의 `IgnoredDuringExecution`은 **이미 실행 중인 파드에는 다시 적용하지 않는다**는 뜻이다. 배치 뒤에 노드 라벨이 바뀌어도 파드는 쫓겨나지 않는다.

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:                     # 항목끼리는 OR
        - matchExpressions:                  # 항목 안 조건끼리는 AND
            - { key: kubernetes.io/arch, operator: In, values: [amd64, arm64] }
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 80
        preference:
          matchExpressions:
            - { key: node.kubernetes.io/instance-type, operator: In, values: [m7g.large] }
```

### 파드 어피니티와 안티어피니티

노드 라벨이 아니라 **이미 떠 있는 다른 파드의 라벨**을 기준으로, 「그 파드와 같은 영역에」(어피니티) 또는 「그 파드와 다른 영역에」(안티어피니티) 둔다.

| | 예 |
| --- | --- |
| 파드 어피니티 | 캐시 파드를 그것을 쓰는 웹 파드와 같은 노드에 두어 네트워크 지연을 줄인다 |
| 파드 안티어피니티 | 같은 Deployment의 레플리카를 서로 다른 노드·가용 영역에 흩어 노드 하나가 죽어도 전멸하지 않게 한다 |

여기서 「같은 영역」의 범위를 정하는 것이 **topologyKey**다. topologyKey는 노드 라벨 이름이고, 그 라벨 값이 같은 노드들을 한 도메인으로 본다. `kubernetes.io/hostname`이면 노드 단위, `topology.kubernetes.io/zone`이면 가용 영역 단위다.

```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector: { matchLabels: { app: api } }
        topologyKey: kubernetes.io/hostname    # 한 노드에 api 파드 하나만
```

강제 안티어피니티는 레플리카 수가 노드 수보다 많으면 남는 파드가 Pending이 된다. 파드 어피니티 계산은 클러스터가 크면 스케줄링을 느리게 한다.

### 토폴로지 분산 제약

「도메인마다 최대 하나」가 아니라 **도메인 사이에 고르게** 흩으려면 `topologySpreadConstraints`를 쓴다.

```yaml
topologySpreadConstraints:
  - maxSkew: 1                              # 도메인 간 파드 수 차이 상한
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: DoNotSchedule        # ScheduleAnyway면 선호 조건
    labelSelector: { matchLabels: { app: api } }
```

레플리카 6개, 영역 3개면 2·2·2로, 7개면 3·2·2로 놓인다. 영역 장애에 대비해 레플리카를 흩는 표준 방법이다.

## 노드가 밀어내기: 테인트와 톨러레이션

어피니티가 파드를 노드로 **끌어당긴다면**, 테인트(taint)는 노드가 파드를 **밀어낸다.** 노드에 `key=value:effect` 테인트를 붙이면, 그것을 견디는 톨러레이션(toleration)이 있는 파드만 놓인다.

```bash
kubectl taint nodes gpu-1 dedicated=gpu:NoSchedule        # 붙이기
kubectl taint nodes gpu-1 dedicated=gpu:NoSchedule-       # 떼기(끝의 -)
```

```yaml
tolerations:
  - { key: dedicated, operator: Equal, value: gpu, effect: NoSchedule }
```

| effect | 새 파드 | 이미 실행 중인 파드 |
| --- | --- | --- |
| `NoSchedule` | 톨러레이션 없으면 배치하지 않는다 | 그대로 둔다 |
| `PreferNoSchedule` | 되도록 피한다(선호 조건) | 그대로 둔다 |
| `NoExecute` | 배치하지 않는다 | **톨러레이션 없으면 축출한다.** `tolerationSeconds`만큼은 버티게 할 수 있다 |

톨러레이션은 「들어갈 수 있다」는 허가일 뿐 그 노드로 가라는 뜻이 아니다. GPU 노드를 GPU 작업 전용으로 쓰려면 **테인트(다른 파드 차단) + 톨러레이션 + 노드 어피니티(이 파드를 그리로 끌기)** 를 함께 쓴다.

### 컨트롤 플레인 노드와 자동 테인트

컨트롤 플레인 노드에는 `node-role.kubernetes.io/control-plane:NoSchedule` 테인트가 붙어 있어 일반 파드가 놓이지 않는다. API 서버·etcd의 자원과 안정성을 지키기 위해서다. 노드가 한 대뿐인 실습 클러스터에서는 이 테인트를 떼거나(`kubectl taint nodes --all node-role.kubernetes.io/control-plane-`), 필요한 파드에만 톨러레이션을 준다.

노드 상태가 나빠지면 노드 컨트롤러·kubelet이 테인트를 자동으로 붙인다.

| 테인트 | 붙는 때 | effect |
| --- | --- | --- |
| `node.kubernetes.io/not-ready` | 노드의 Ready 조건이 False | NoExecute |
| `node.kubernetes.io/unreachable` | 노드 하트비트가 끊겨 상태를 모름 | NoExecute |
| `node.kubernetes.io/memory-pressure` · `disk-pressure` · `pid-pressure` | 노드 자원 압박 | NoSchedule |
| `node.kubernetes.io/network-unavailable` | 노드 네트워크가 준비되지 않음 | NoSchedule |
| `node.kubernetes.io/unschedulable` | `kubectl cordon` | NoSchedule |

파드에는 not-ready·unreachable에 대한 300초 톨러레이션이 기본으로 붙는다. 그래서 노드가 죽어도 **약 5분 뒤에야** 다른 노드로 옮겨진다. 빨리 옮겨야 하는 서비스는 `tolerationSeconds`를 줄인다.

## 자원 선언: requests와 limits

| | requests | limits |
| --- | --- | --- |
| 뜻 | 이만큼은 **보장해 달라** | 이 이상은 **쓰지 못하게 하라** |
| 누가 보나 | 스케줄러: 노드의 할당 가능량에서 requests 합을 빼 남은 자리에만 둔다 | 노드의 커널(cgroup)이 강제 |
| CPU | 경합 시 requests 비율로 CPU 시간을 나눈다 | 넘으면 **스로틀링**: 주기(100ms)마다 할당량을 다 쓰면 다음 주기까지 멈춘다 |
| 메모리 | 노드 메모리 압박 시 축출 순서 판단 기준 | 넘으면 커널 OOM killer가 **컨테이너를 죽인다**(`OOMKilled`, 종료 코드 137) |

CPU는 압축 가능한 자원이라 넘쳐도 느려질 뿐이고, 메모리는 압축 불가능한 자원이라 넘치면 죽는다.

### 단위

| 자원 | 단위 | 예 |
| --- | --- | --- |
| CPU | 코어 수. `m`(밀리코어) = 1/1000 코어 | `500m` = 0.5코어, `2` = 2코어(클라우드의 vCPU 2개) |
| 메모리 | 바이트. `Ki`·`Mi`·`Gi`는 2의 거듭제곱, `k`·`M`·`G`는 10의 거듭제곱 | `256Mi` = 268,435,456바이트, `256M` = 256,000,000바이트 |

`m`과 `M`을 혼동하면 사고가 난다. 메모리에 `500m`이라고 쓰면 0.5바이트다.

### 한쪽만 설정했을 때

| 설정 | 동작 |
| --- | --- |
| requests만 | 스케줄링은 requests로 하고, 상한이 없어 노드의 남는 자원을 끝까지 쓴다. CPU는 이득이지만 메모리는 노드 압박 시 먼저 축출될 수 있다 |
| limits만 | requests가 limits와 같은 값으로 **자동 설정된다.** 생각보다 많은 자원을 예약해 노드가 빨리 찬다 |
| 둘 다 없음 | 스케줄러가 0으로 보고 아무 데나 둔다. 노드 압박 시 가장 먼저 축출된다 |

메모리는 requests와 limits를 같게(OOM 예측 가능), CPU는 requests만 두고 limits는 생략하거나 넉넉히(스로틀링 회피) 두는 운영이 흔하다.

## QoS 클래스

쿠버네티스는 requests·limits 설정으로 파드의 QoS 클래스를 정한다. 노드 메모리가 부족할 때 **누구를 먼저 축출하고 OOM에서 먼저 죽일지**의 기준이다.

| 클래스 | 조건 | 압박 시 |
| --- | --- | --- |
| Guaranteed | 모든 컨테이너가 CPU·메모리 requests와 limits를 **같은 값**으로 가진다 | 가장 마지막에 축출 |
| Burstable | Guaranteed는 아니지만 하나 이상의 requests나 limits가 있다 | requests를 넘게 쓰는 파드부터 축출 |
| BestEffort | 어떤 컨테이너에도 requests·limits가 없다 | 가장 먼저 축출 |

## 네임스페이스 단위 통제

### LimitRange

LimitRange는 네임스페이스 안 **컨테이너·파드 하나**의 자원 값을 정하거나 막는다. 파드가 만들어질 때 어드미션 단계에서 적용된다.

```yaml
apiVersion: v1
kind: LimitRange
metadata: { name: defaults, namespace: team-a }
spec:
  limits:
    - type: Container
      default:        { cpu: 500m, memory: 512Mi }   # limits를 안 쓰면 넣을 값
      defaultRequest: { cpu: 100m, memory: 256Mi }   # requests를 안 쓰면 넣을 값
      min:            { cpu: 50m,  memory: 64Mi }    # 이보다 작으면 거부
      max:            { cpu: "2",  memory: 2Gi }     # 이보다 크면 거부
```

### ResourceQuota

ResourceQuota는 네임스페이스 **전체의 합계**를 제한한다. 팀·환경마다 클러스터를 나눠 쓸 때 한쪽이 자원을 독차지하지 못하게 한다.

```yaml
apiVersion: v1
kind: ResourceQuota
metadata: { name: team-a, namespace: team-a }
spec:
  hard:
    requests.cpu: "20"
    requests.memory: 40Gi
    limits.memory: 60Gi
    pods: "100"
    persistentvolumeclaims: "20"
    count/deployments.apps: "30"
```

- 한도를 넘는 생성 요청은 **거부된다**(Pending이 아니다). Deployment라면 ReplicaSet이 파드를 만들지 못한 채 이벤트에 `exceeded quota`가 남는다.
- CPU·메모리 쿼터가 걸린 네임스페이스에서는 requests·limits가 없는 파드도 거부된다. 그래서 LimitRange로 기본값을 함께 둔다.

### PriorityClass와 선점

PriorityClass는 파드에 정수 우선순위를 준다.

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata: { name: critical-api }
value: 100000
globalDefault: false
preemptionPolicy: PreemptLowerPriority     # Never면 선점하지 않고 대기열 앞에만 선다
```

- 스케줄링 대기열에서 높은 우선순위 파드가 먼저 처리된다.
- 놓을 노드가 없으면 스케줄러가 **낮은 우선순위 파드를 축출(선점, preemption)** 해 자리를 만든다. PodDisruptionBudget은 되도록 지키지만 보장하지는 않는다.
- 노드 자원 압박 시 축출 순서에도 쓰인다. `system-cluster-critical`, `system-node-critical`은 CoreDNS·CNI 같은 시스템 구성 요소용으로 미리 있다.
- 우선순위가 낮은 「자리 맡기」 파드를 띄워 두고, 급히 필요할 때 선점되게 해서 노드 증설 시간을 숨기는 기법(오버프로비저닝)에도 쓴다.

## 오토스케일링

| 오토스케일러 | 늘리는 것 | 판단 근거 |
| --- | --- | --- |
| HPA (Horizontal Pod Autoscaler) | 파드 **개수** | CPU·메모리 사용률, 커스텀·외부 지표 |
| VPA (Vertical Pod Autoscaler) | 파드 **크기**(requests) | 과거 사용량 |
| Cluster Autoscaler · Karpenter | **노드** 개수 | 자원이 없어 Pending인 파드, 비어 가는 노드 |

### HPA

HPA 컨트롤러는 기본 15초마다 지표를 읽어 원하는 레플리카 수를 계산한다.

```text
원하는 레플리카 = ceil( 현재 레플리카 × 현재 지표값 / 목표 지표값 )
예: 파드 4개, 평균 CPU 사용률 90%, 목표 60% → ceil(4 × 90/60) = 6
```

- 비율이 1에서 허용 오차(기본 10%) 안이면 바꾸지 않는다.
- 지표가 여러 개면 각각 계산한 값 중 **가장 큰 값**을 쓴다.
- CPU 「사용률」은 requests 대비 비율이다. **requests가 없으면 HPA가 계산하지 못한다.**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: api }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }
  minReplicas: 3
  maxReplicas: 30
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 60 } }
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300      # 기본값. 지난 5분의 권고치 중 가장 큰 값으로만 줄인다
      policies: [{ type: Percent, value: 50, periodSeconds: 60 }]
    scaleUp:
      stabilizationWindowSeconds: 0        # 기본값. 늘릴 때는 바로
```

**stabilizationWindowSeconds**는 지표가 출렁일 때 레플리카가 늘었다 줄었다를 반복하는 플래핑(flapping)을 막는다. 줄일 때는 창 안의 권고치 중 최댓값을, 늘릴 때는 최솟값을 따른다. `policies`는 한 주기에 바꿀 수 있는 양(비율·개수)을 제한한다.

| 지표 종류 | 출처 | 예 |
| --- | --- | --- |
| Resource (CPU·메모리) | metrics-server의 `metrics.k8s.io` API | 평균 CPU 사용률 60% |
| Pods · Object (커스텀 지표) | `custom.metrics.k8s.io` API. Prometheus Adapter 등이 Prometheus 지표를 노출 | 파드당 초당 요청 수, Ingress의 RPS |
| External | `external.metrics.k8s.io` API | 메시지 큐 길이, 클라우드 모니터링 지표 |

CPU는 부하와 사용률이 비례하는 CPU 집약 서비스에 맞다. I/O 대기가 많은 서비스, 큐 소비자는 요청 수·큐 길이 같은 커스텀 지표가 수요를 더 잘 나타낸다. 이벤트 기반 확장과 0개까지 줄이기는 **KEDA**가 HPA를 만들어 관리하는 방식으로 한다.

| HPA 주의점 | 이유 |
| --- | --- |
| requests를 현실적으로 설정한다 | 사용률 계산의 분모다 |
| 메모리는 확장 지표로 부적합한 경우가 많다 | 많은 런타임이 메모리를 잘 돌려주지 않아 줄어들지 않는다 |
| GitOps·Helm 매니페스트에 `replicas`를 고정하지 않는다 | 배포 때마다 HPA가 정한 수를 덮어쓴다 |
| `minReplicas`를 2 이상, PodDisruptionBudget과 함께 | 하나뿐이면 재시작·노드 교체 때 서비스가 끊긴다 |
| 파드 시작 시간과 readiness를 고려한다 | 확장 효과는 새 파드가 Ready가 된 뒤에야 난다. 급증이 잦으면 여유를 두고 목표를 낮게 잡는다 |
| 노드가 모자라면 파드가 Pending이다 | Cluster Autoscaler와 함께 써야 한다 |

### VPA

VPA는 쿠버네티스 본체가 아닌 별도 애드온이다. Recommender가 사용량 기록으로 적정 requests를 계산하고, Updater가 적용하고, 어드미션 컨트롤러가 새 파드에 값을 넣는다. limits는 원래의 requests:limits 비율을 유지하며 함께 바뀐다.

| `updateMode` | 동작 |
| --- | --- |
| `Off` | 권고치만 계산해 상태에 보여 준다. 적용하지 않는다. 적정 requests를 찾는 용도로 가장 안전하다 |
| `Initial` | 파드가 **새로 만들어질 때만** 권고치를 넣는다. 실행 중인 파드는 건드리지 않는다 |
| `Recreate` | 권고치와 많이 다르면 파드를 **축출해 다시 만들며** 적용한다 |
| `InPlaceOrRecreate` | 실행 중인 파드의 자원을 **재시작 없이 바꾸고**, 안 되면 다시 만든다. 쿠버네티스 1.35에서 파드 자원의 제자리 변경(in-place resize)이 정식 기능이 되었고, 이 모드는 베타다 |
| `Auto` | 현재는 Recreate와 같게 동작한다. 의도를 드러내는 명시적 모드를 쓴다 |

| | HPA | VPA |
| --- | --- | --- |
| 조정 | 파드 수 | 파드 크기 |
| 맞는 워크로드 | 상태 없는, 수평 확장이 되는 서비스 | 수평 확장이 어려운 것(단일 인스턴스, 일부 상태 저장), 적정 크기를 모르는 서비스 |
| 반응 | 빠르다 | 느리다(사용 기록을 쌓아야 한다) |

### Cluster Autoscaler

| 방향 | 조건 |
| --- | --- |
| 늘리기 | 자원이 모자라 **Pending인 파드**가 있고, 노드 그룹에 노드를 하나 더하면 그 파드가 들어갈 수 있을 때. 사용률이 아니라 Pending 파드가 신호다 |
| 줄이기 | 노드의 requests 합이 할당 가능량의 일정 비율(기본 50%) 아래로 일정 시간(기본 10분) 머물고, 그 노드의 파드를 모두 다른 노드로 옮길 수 있을 때 |

줄이기를 막는 것: PodDisruptionBudget을 어기게 되는 파드, 컨트롤러 없이 직접 만든 파드, 로컬 저장소(emptyDir)를 쓰는 파드(설정에 따라), `cluster-autoscaler.kubernetes.io/safe-to-evict: "false"` 어노테이션.

AWS 등에서 쓰는 **Karpenter**는 미리 정한 노드 그룹 대신 Pending 파드의 요구에 맞는 인스턴스 유형을 골라 노드를 바로 만들고, 파드를 더 적은·싼 노드로 모으는 통합(consolidation)도 한다.

### 셋을 함께 쓸 때

```text
부하 증가 → HPA가 파드를 늘림 → 자리가 없어 Pending → Cluster Autoscaler가 노드 추가
         → 노드 준비(수 분) → 파드 배치 → Ready → 부하 분산
```

- **HPA와 VPA를 같은 CPU·메모리 지표에 함께 걸지 않는다.** VPA가 requests를 키우면 사용률이 낮아져 HPA가 파드를 줄이고, 그러면 사용량이 다시 올라 서로 싸운다. HPA를 커스텀 지표로 걸거나, VPA는 `Off`로 권고치만 본다.
- 스케줄러와 Cluster Autoscaler는 **실제 사용량이 아니라 requests만 본다.** requests가 부풀면 노드가 낭비되고, 작으면 노드가 과밀해진다. VPA 권고치로 requests를 맞추는 것이 출발점이다.
- 확장 지연이 누적된다(지표 수집 + HPA 주기 + 노드 생성 + 이미지 다운로드 + 앱 시작). 오버프로비저닝 파드, 작은 이미지, 미리 받아 둔 이미지로 줄인다.

## 파드를 늘려도 지연이 줄지 않을 때

수평 확장은 병목이 **파드 안**에 있을 때만 효과가 있다.

| 확인할 것 | 지표 | 의미 |
| --- | --- | --- |
| 실제로 늘었나 | HPA 이벤트, Pending 파드 수 | 노드 부족으로 새 파드가 뜨지 않음 |
| CPU 스로틀링 | `container_cpu_cfs_throttled_periods_total` 비율 | 노드는 한가한데 limits에 막혀 느림. 파드를 늘려도 각 파드가 여전히 막힌다 |
| 하위 의존성 포화 | DB 커넥션 풀 대기, 쿼리 지연, 외부 API 지연·레이트 리밋 | 파드가 늘수록 DB 커넥션이 늘어 오히려 악화될 수 있다 |
| 부하가 고르게 가나 | 파드별 RPS | HTTP/2·gRPC·keep-alive 장기 연결은 기존 파드에 붙어 있어 새 파드가 놀 수 있다. L7 로드 밸런싱(메시, 게이트웨이)이 필요하다 |
| 파드 안 경합 | GC 시간, 락 대기, 스레드 풀 포화 | 코드·런타임 설정 문제 |
| 노드 수준 포화 | 노드 CPU·디스크 I/O·네트워크, 이웃 파드 | 한 노드에 몰린 파드끼리 자원 경쟁 |

지연은 평균이 아니라 p95·p99로 보고, 구간별(게이트웨이·앱·DB) 트레이스로 어디서 시간이 쓰이는지 먼저 찾는다([[observability|관측 가능성]], [[server-incident-diagnosis|서버 장애 진단 패턴]]).

## 정리

- nodeSelector는 정확 일치, 노드 어피니티는 연산자와 선호 조건, 파드 (안티)어피니티는 다른 파드 기준, topologyKey가 「같은 곳」의 범위를 정한다. 고르게 흩을 때는 토폴로지 분산 제약을 쓴다.
- 테인트는 노드가 밀어내고 톨러레이션은 허가할 뿐이다. 전용 노드는 테인트 + 톨러레이션 + 어피니티로 만든다.
- requests는 스케줄링과 보장, limits는 상한이다. CPU를 넘으면 스로틀링, 메모리를 넘으면 OOMKilled다.
- QoS는 requests·limits로 정해지고 압박 시 BestEffort부터 축출된다. LimitRange는 하나의 기본값과 범위, ResourceQuota는 네임스페이스 합계를 막는다.
- HPA는 비율 공식으로 파드 수를, VPA는 크기를, Cluster Autoscaler는 Pending 파드를 보고 노드를 조절한다. 셋 모두 정확한 requests에 기댄다.

관련 노트: [[kubernetes-architecture|쿠버네티스 구조와 핵심 개념]], [[kubernetes-workloads|쿠버네티스 워크로드와 파드 생명주기]], [[kubernetes-operations|쿠버네티스 운영]], [[docker-container-operations|Docker 컨테이너 운영]], [[observability|관측 가능성: 로그, 트레이스, 메트릭]], [[cloud-cost-optimization|클라우드 비용 최적화와 숨은 비용]]
