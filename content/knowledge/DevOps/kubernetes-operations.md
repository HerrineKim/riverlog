---
title: "쿠버네티스 운영: Helm, 업그레이드, 관측, 장애 진단, 오퍼레이터, GitOps"
concept: "Kubernetes Operations"
summary: "쿠버네티스 클러스터와 앱을 운영하는 데 필요한 것들: Helm 차트·릴리스·훅, 버전 업그레이드 순서와 etcd 백업·복구, cordon·drain과 PodDisruptionBudget, 로그 구조와 kubectl logs, metrics-server와 Prometheus 모니터링, CrashLoopBackOff·ImagePullBackOff 진단과 kubectl debug, CRD와 오퍼레이터 패턴, Argo CD·Flux GitOps, 멀티 클러스터 관리."
tags: ["devops", "kubernetes", "infra", "monitoring", "ci-cd"]
source: other
date: "2026-10-30"
sources: ["https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/kubernetes.md", "https://helm.sh/docs/", "https://www.cncf.io/announcements/2025/11/12/helm-marks-10-years-with-release-of-version-4/", "https://kubernetes.io/releases/version-skew-policy/", "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/", "https://kubernetes.io/docs/tasks/run-application/configure-pdb/", "https://kubernetes.io/docs/concepts/cluster-administration/logging/", "https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/", "https://kubernetes.io/docs/concepts/extend-kubernetes/operator/", "https://opengitops.dev/"]
---

> fru1tworld/cs-basic 모의 면접 질문 목록의 「[Kubernetes](https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/kubernetes.md)」 항목이 묻는 개념을 쿠버네티스·Helm·etcd 공식 문서로 확인해 정리한 노트다.

쿠버네티스 구조와 kubectl 기본 명령은 [[kubernetes-architecture|쿠버네티스 구조와 핵심 개념]]에, 파드 상태와 프로브는 [[kubernetes-workloads|쿠버네티스 워크로드와 파드 생명주기]]에 있다. 이 노트는 그 위에서 앱을 배포하고, 클러스터를 유지보수하고, 문제를 찾는 방법을 다룬다.

## Helm: 쿠버네티스 패키지 관리

앱 하나를 배포하려 해도 Deployment, Service, Ingress, ConfigMap, HPA처럼 매니페스트가 여러 개 필요하고, 환경마다 이미지 태그·레플리카·도메인만 다르다. **Helm은 이 묶음을 템플릿과 값으로 나눠 패키지로 만들고, 설치한 결과를 버전으로 관리하는 쿠버네티스 패키지 관리자**다. 2025년 11월에 6년 만의 메이저 버전인 Helm 4가 나왔고(서버 사이드 적용, WebAssembly 플러그인), Helm 3용 차트는 그대로 쓸 수 있다.

| 개념 | 뜻 | 비유 |
| --- | --- | --- |
| 차트(Chart) | 템플릿과 기본값을 묶은 패키지 | npm 패키지 |
| 릴리스(Release) | 차트를 클러스터에 이름 붙여 설치한 인스턴스. 같은 차트를 여러 번 설치하면 릴리스가 여럿이다 | 설치된 앱 |
| 리비전(Revision) | 릴리스를 설치·업그레이드·롤백할 때마다 1씩 느는 버전 | 배포 기록 |
| 저장소(Repository) | 차트를 배포하는 곳. HTTP 서버의 `index.yaml` 또는 OCI 레지스트리 | npm 레지스트리 |

### 차트 구조

```text
mychart/
  Chart.yaml          # 차트 이름, 차트 버전(version), 앱 버전(appVersion), 의존 차트
  values.yaml         # 기본 설정값
  values.schema.json  # (선택) 값의 JSON 스키마 검증
  templates/          # 매니페스트 템플릿
    deployment.yaml
    service.yaml
    _helpers.tpl      # 재사용할 템플릿 조각(이름 규칙, 공통 라벨). 렌더링 결과가 없다
    NOTES.txt         # 설치 후 보여 줄 안내문
  charts/             # 의존 차트(서브차트)
  crds/               # 템플릿 없이 먼저 설치할 CRD
```

### 템플릿과 값 덮어쓰기

템플릿은 Go 템플릿 문법에 Sprig 함수 라이브러리를 더한 것이다.

```yaml
# templates/deployment.yaml
metadata:
  name: {{ include "mychart.fullname" . }}
  labels: {{- include "mychart.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount | default 2 }}
  template:
    spec:
      containers:
        - name: app
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          {{- with .Values.resources }}
          resources: {{- toYaml . | nindent 12 }}
          {{- end }}
          env:
            - name: DB_URL
              value: {{ required "db.url은 필수다" .Values.db.url | quote }}
```

| 요소 | 뜻 |
| --- | --- |
| `.Values`, `.Release`, `.Chart` | 값, 릴리스 정보(이름·네임스페이스·리비전), Chart.yaml 내용 |
| `include`, `toYaml`, `nindent` | 조각 불러오기, 객체를 YAML로, 줄바꿈 후 들여쓰기 |
| `default`, `required`, `quote` | 기본값, 값이 없으면 렌더링 실패, 따옴표 감싸기 |
| `if`, `range`, `with` | 조건, 반복, 범위 바꾸기 |

값의 우선순위는 **차트의 values.yaml < 부모 차트의 값 < `-f` 파일(뒤에 쓴 것이 우선) < `--set`** 이다.

```bash
helm upgrade --install api ./mychart -n shop \
  -f values.yaml -f values-prod.yaml \
  --set image.tag=1.4.2
helm template api ./mychart -f values-prod.yaml   # 클러스터에 적용하지 않고 렌더링 결과만 보기
```

### 릴리스 관리

```bash
helm install api ./mychart -n shop      # 리비전 1
helm upgrade api ./mychart -n shop      # 리비전 2
helm history api -n shop
helm rollback api 1 -n shop             # 리비전 1의 내용으로 새 리비전 3을 만든다
helm uninstall api -n shop              # --keep-history로 기록을 남길 수 있다
```

릴리스 기록은 릴리스 네임스페이스의 Secret(`sh.helm.release.v1.<이름>.v<리비전>`)에 저장된다. 롤백은 과거로 되감는 것이 아니라 **과거 내용으로 새 리비전을 만드는 것**이다. 업그레이드는 이전 매니페스트, 새 매니페스트, 클러스터의 실제 상태를 비교하는 3방향 병합으로 적용해, 누군가 직접 고친 필드도 차트 기준으로 되돌린다.

### Helm 훅

훅은 릴리스 생명주기의 특정 시점에 리소스(대개 Job)를 실행하는 장치다. 리소스에 어노테이션을 붙여 만든다.

```yaml
metadata:
  annotations:
    "helm.sh/hook": pre-upgrade,pre-install
    "helm.sh/hook-weight": "-5"                          # 작은 값부터 실행
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
```

| 훅 | 실행 시점 | 쓰임 |
| --- | --- | --- |
| `pre-install` · `pre-upgrade` | 템플릿 렌더링 뒤, 리소스를 적용하기 전 | DB 마이그레이션, 백업, 필요한 Secret 준비 |
| `post-install` · `post-upgrade` | 리소스 적용 뒤 | 캐시 워밍, 알림, 초기 데이터 넣기 |
| `pre-delete` · `post-delete` | 삭제 전·후 | 외부 자원 정리, 데이터 내보내기 |
| `pre-rollback` · `post-rollback` | 롤백 전·후 | 롤백용 마이그레이션 |
| `test` | `helm test` 실행 시 | 설치 뒤 스모크 테스트 |

Helm은 훅 Job이 끝날 때까지 기다리고, 실패하면 릴리스도 실패한다. 훅 리소스는 릴리스의 일부로 관리되지 않아 `helm uninstall`로 지워지지 않으므로 delete-policy를 준다.

## 클러스터 업그레이드

쿠버네티스는 1년에 세 번 정도 마이너 버전을 내고, 각 버전을 약 14개월 지원한다. 지원이 끝나기 전에 계속 따라가야 한다.

### 버전 차이 규칙

| 구성 요소 | API 서버 대비 허용 범위 |
| --- | --- |
| kube-apiserver (HA의 다른 인스턴스) | 마이너 1단계 차이 |
| kube-controller-manager · scheduler | 같거나 1단계 낮게. **API 서버보다 새로우면 안 된다** |
| kubelet · kube-proxy | 같거나 최대 3단계 낮게. 새로우면 안 된다 |
| kubectl | 위아래 1단계 |

그래서 순서가 정해진다. **컨트롤 플레인을 먼저, 노드를 나중에** 올리고, 마이너 버전은 **한 번에 하나씩**(1.34 → 1.35 → 1.36) 올린다. 건너뛸 수 없다.

### 절차

```text
1. 준비: 릴리스 노트의 제거된 API·동작 변경 확인 (쓰는 매니페스트·차트에 제거될 apiVersion이 있는지 점검)
         etcd 백업, 애드온(CNI, CoreDNS, CSI, Ingress 컨트롤러)의 호환 버전 확인, 스테이징에서 먼저
2. 컨트롤 플레인: 첫 노드에서 kubeadm upgrade plan → kubeadm upgrade apply v1.36.x
                 나머지 컨트롤 플레인 노드에서 kubeadm upgrade node, kubelet·kubectl 올리기
3. 애드온: CNI 등 업그레이드
4. 워커 노드 (한 대씩, 또는 새 버전 노드를 추가하고 옛 노드를 빼는 방식)
   kubectl drain → kubeadm·kubelet 패키지 업그레이드 → kubelet 재시작 → kubectl uncordon
5. 확인: 노드 버전, 파드 상태, 지표·알림
```

관리형 쿠버네티스는 컨트롤 플레인 업그레이드를 버튼 하나로 해 주고, 노드는 노드 그룹을 새 버전 이미지로 롤링 교체한다. 그래도 제거된 API 점검과 애드온 호환성 확인은 사용자 몫이다. 노드를 제자리에서 고치지 않고 교체하는 방식이 되돌리기 쉽다.

## etcd 백업과 복구

etcd에는 클러스터의 모든 오브젝트가 있다([[kubernetes-architecture|구조 노트]]의 etcd). kubeadm으로 직접 운영하는 클러스터라면 스냅숏을 주기적으로 떠서 **클러스터 밖에** 보관한다.

```bash
# 백업: 실행 중인 etcd 멤버 하나에서 스냅숏
ETCDCTL_API=3 etcdctl snapshot save /backup/etcd-$(date +%F).db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key
etcdutl snapshot status /backup/etcd-2026-10-30.db -w table   # 검증

# 복구: 새 데이터 디렉터리로 풀고, etcd 스태틱 파드 매니페스트가 그 디렉터리를 보게 바꾼다
etcdutl snapshot restore /backup/etcd-2026-10-30.db --data-dir /var/lib/etcd-restored
```

- 복구는 클러스터 전체를 스냅숏 시점으로 되돌린다. 그 뒤에 만든 오브젝트는 사라진다. 다중 멤버면 모든 멤버를 같은 스냅숏에서 새 클러스터로 복구한다.
- 복구 전에는 API 서버를 멈춰 쓰기를 막는다. 복구 절차는 **실제로 연습해 봐야** 믿을 수 있다.
- 스냅숏은 Secret을 포함하므로 암호화해 보관한다.
- 관리형 쿠버네티스는 etcd를 클라우드가 백업하므로 직접 접근할 수 없다. 이때는 Velero처럼 쿠버네티스 리소스와 PV 스냅숏을 함께 백업하는 도구로 네임스페이스·앱 단위 복구를 준비한다. 복구 목표(RTO·RPO)는 [[disaster-recovery|고가용성과 재해 복구 설계]]에 있다.

## 노드 유지보수: cordon, drain, PodDisruptionBudget

| 명령 | 하는 일 |
| --- | --- |
| `kubectl cordon <노드>` | 노드를 스케줄 불가(`unschedulable`)로 표시한다. **이미 있는 파드는 그대로** 둔다 |
| `kubectl drain <노드>` | cordon한 뒤 파드를 **축출(eviction)** 해 다른 노드로 옮긴다 |
| `kubectl uncordon <노드>` | 다시 스케줄 가능하게 한다 |

```bash
kubectl drain node-3 --ignore-daemonsets --delete-emptydir-data --timeout=10m
```

- DaemonSet 파드는 어차피 그 노드에 다시 생기므로 `--ignore-daemonsets`로 건너뛴다.
- emptyDir 데이터는 축출하면 사라지므로 `--delete-emptydir-data`로 동의해야 한다.
- 컨트롤러 없이 직접 만든 파드는 옮겨 줄 주체가 없어 drain이 멈춘다(`--force`로 지울 수 있지만 다시 생기지 않는다).

**PodDisruptionBudget(PDB)** 은 drain처럼 **자발적인 중단**이 일어날 때 한 번에 내려갈 수 있는 파드 수를 제한한다.

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: api }
spec:
  minAvailable: 2                 # 또는 maxUnavailable: 1
  selector: { matchLabels: { app: api } }
```

- drain, Cluster Autoscaler의 노드 축소, 노드 업그레이드처럼 축출 API를 쓰는 작업은 PDB를 어기는 축출을 거부당하고 재시도한다. 그래서 레플리카가 하나씩 옮겨지며 서비스가 유지된다.
- 노드 장애, 커널 패닉, OOM 같은 **비자발적 중단은 막지 못한다.**
- `maxUnavailable: 0`이나 레플리카 수와 같은 `minAvailable`은 drain을 영원히 막는다. 레플리카가 1인 서비스에 PDB를 걸면 노드 유지보수가 멈춘다.
- 이미 비정상인 파드 때문에 막히지 않게 `unhealthyPodEvictionPolicy: AlwaysAllow`를 준다.

## 로그

### 로그 구조

```text
컨테이너 stdout/stderr
  → 컨테이너 런타임이 노드 파일로 기록 (/var/log/pods/<네임스페이스>_<파드>_<uid>/<컨테이너>/0.log)
  → kubelet이 크기 기준으로 회전 (기본 10Mi, 5개)
  → kubectl logs는 kubelet을 통해 이 파일을 읽는다
```

| 수준 | 범위 | 한계 |
| --- | --- | --- |
| 노드 수준 | 노드 파일과 `kubectl logs` | 파드가 지워지거나 노드가 사라지면 로그도 사라진다. 회전으로 오래된 것은 없어진다. 여러 파드를 가로질러 검색할 수 없다 |
| 클러스터 수준 | 노드 밖의 저장소에 모은다 | 쿠버네티스가 기본 제공하지 않아 직접 구성한다 |

클러스터 수준 로깅 방식은 셋이다.

| 방식 | 구조 | 쓰임 |
| --- | --- | --- |
| 노드 에이전트 | DaemonSet(Fluent Bit, Vector, OpenTelemetry Collector)이 노드의 로그 파일을 읽어 Loki·Elasticsearch·클라우드 로깅으로 보낸다 | 표준. 앱은 stdout에만 쓴다 |
| 사이드카 | 파일에 로그를 쓰는 앱 옆에서 파일을 읽어 보내거나 stdout으로 다시 흘린다 | stdout으로 바꿀 수 없는 레거시 앱 |
| 앱이 직접 전송 | 앱이 로깅 백엔드로 바로 보낸다 | 특수한 경우. 앱이 백엔드에 묶인다 |

로그 형식과 수집 원칙은 [[observability|관측 가능성]]에 있다.

### kubectl logs 옵션

| 옵션 | 뜻 |
| --- | --- |
| `-f` | 새 로그를 계속 따라간다 |
| `--previous` (`-p`) | **직전에 종료된 컨테이너**의 로그. 재시작을 반복하는 파드의 원인은 대개 여기 있다 |
| `-c <컨테이너>` | 여러 컨테이너 중 하나. `--all-containers`면 전부 |
| `--since=1h` · `--since-time=<RFC3339>` | 그 시간 이후만 |
| `--tail=100` | 마지막 몇 줄 |
| `--timestamps` | 줄마다 시각 |
| `-l app=api` | 라벨로 여러 파드의 로그를 함께 |
| `deploy/api` | 워크로드를 지정하면 그 파드 하나를 골라 보여 준다 |

## 지표와 모니터링

### metrics-server와 애플리케이션 지표

| | metrics-server의 자원 지표 | 애플리케이션 지표 |
| --- | --- | --- |
| 내용 | 노드·파드·컨테이너의 **CPU·메모리 사용량** | 요청 수, 지연, 오류율, 큐 길이, 비즈니스 이벤트 |
| 출처 | kubelet이 cgroup에서 읽은 값을 metrics-server가 주기적으로 모은다 | 앱이 `/metrics` 같은 엔드포인트로 노출하고 Prometheus가 수집 |
| 저장 | **메모리에 최근 값만.** 이력이 없다 | 시계열 DB에 기간별로 |
| 쓰임 | `kubectl top`, HPA·VPA의 CPU·메모리 기준 | 대시보드, 알림, SLO, HPA 커스텀 지표 |

metrics-server는 오토스케일링용 파이프라인이지 모니터링 시스템이 아니다. 「파드 CPU가 높다」는 알 수 있어도 「사용자가 느리다」는 앱 지표로만 안다.

```bash
kubectl top nodes
kubectl top pods -n shop --containers --sort-by=memory
```

### Prometheus로 모니터링 구성

흔한 구성은 **kube-prometheus-stack** Helm 차트 하나로 다음을 설치하는 것이다.

| 구성 요소 | 역할 |
| --- | --- |
| Prometheus Operator | Prometheus·Alertmanager를 CRD로 관리하는 오퍼레이터 |
| Prometheus | 쿠버네티스 서비스 디스커버리로 대상을 찾아 지표를 긁어 온다 |
| node-exporter (DaemonSet) | 노드 OS 지표(CPU, 메모리, 디스크, 네트워크) |
| kube-state-metrics | 쿠버네티스 오브젝트 상태(Deployment의 원하는/가용 레플리카, 파드 단계, 재시작 횟수) |
| kubelet의 cAdvisor | 컨테이너별 CPU·메모리·스로틀링 |
| Alertmanager | 알림 묶기·라우팅(Slack, PagerDuty) |
| Grafana | 대시보드 |

앱 지표는 ServiceMonitor·PodMonitor 리소스로 수집 대상을 선언하고, 알림 규칙은 PrometheusRule로 둔다. 장기 보관과 여러 클러스터 통합은 Thanos·Mimir 같은 원격 저장소가 맡는다. 풀 방식 수집과 시계열 DB의 원리는 [[observability|관측 가능성]]에 있다.

### 수집해야 할 지표

| 수준 | 지표 | 알림 예 |
| --- | --- | --- |
| 노드 | CPU·메모리 사용률, 디스크 사용률·inode, 네트워크, Ready 조건, 압박 조건 | 노드 NotReady, 디스크 85% 이상 |
| 파드 | 단계, Ready 여부, 재시작 횟수, OOMKilled, Pending 시간 | 재시작 급증, 오래 Pending |
| 컨테이너 | CPU 사용량 대비 requests·limits, **CPU 스로틀링 비율**, 메모리 working set 대비 limit | limit의 90% 이상 메모리, 스로틀링 25% 이상 |
| 워크로드 | 원하는 레플리카 대비 가용 레플리카, HPA 현재·최대 레플리카 | 가용 레플리카 부족, HPA가 최대치에 고정 |
| 컨트롤 플레인 | API 서버 요청 지연·오류, etcd 지연·DB 크기·리더 변경 | API 서버 5xx 증가 |
| 앱 | 요청 수, 오류율, 지연 p95·p99(RED) | SLO 위반 |

## 장애 진단

### 기본 흐름

```bash
kubectl get pods -n shop -o wide            # 상태, 재시작 횟수, 노드
kubectl describe pod <파드>                 # 컨테이너 상태(Last State, Reason, Exit Code)와 이벤트
kubectl logs <파드> --previous              # 직전 컨테이너가 죽기 전 로그
kubectl get events -n shop --sort-by=.lastTimestamp
kubectl exec -it <파드> -- sh               # 실행 중이면 안에서 설정·연결 확인
```

`describe`는 무엇이 일어났는지(이벤트), `logs`는 앱이 왜 그랬는지, `exec`는 지금 안이 어떤지를 보여 준다.

### CrashLoopBackOff: 반복해서 재시작할 때

CrashLoopBackOff는 원인이 아니라 「컨테이너가 계속 죽어 재시작 대기 중」이라는 상태다. `describe`의 `Last State: Terminated`의 Reason과 종료 코드부터 본다.

| 단서 | 원인 | 해결 |
| --- | --- | --- |
| 종료 코드 1 등, 로그에 예외 | 앱 오류, 필요한 환경 변수·설정·Secret 누락, 의존 서비스 접속 실패 | `logs --previous`로 원인 확인, 설정 수정 |
| Reason `OOMKilled`, 종료 코드 137 | 메모리 limit 초과 | limit을 늘리거나 메모리 사용을 줄인다 |
| 이벤트 `Liveness probe failed` | liveness가 너무 엄격하거나 시작이 느림 | startup 프로브, 타임아웃 조정 |
| 종료 코드 126·127 | 명령을 실행할 수 없음·명령이 없음 | command·args, 이미지 안 경로 확인 |
| 종료 코드 0으로 계속 끝남 | 서버가 백그라운드로 빠지거나 할 일이 끝남 | 포그라운드 실행, Job으로 바꾸기 |
| 권한 오류 | `runAsNonRoot`·`readOnlyRootFilesystem`과 이미지가 맞지 않음 | 쓸 경로를 emptyDir로, 파일 소유권 수정 |

재시작이 아니라 파드가 사라지고 새로 생기는 것은 축출이다. `kubectl get pods`의 `Evicted`, 노드의 압박 조건을 본다.

### ImagePullBackOff: 이미지를 받지 못할 때

`ErrImagePull`이 반복되면 `ImagePullBackOff`가 된다. `describe`의 이벤트 메시지가 원인을 알려 준다.

| 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `not found`, `manifest unknown` | 이미지 이름·태그 오타, 아직 푸시되지 않음 | 레지스트리에서 태그 확인 |
| `unauthorized`, `authentication required` | 비공개 레지스트리 인증 없음·만료 | `kubernetes.io/dockerconfigjson` Secret을 만들고 `imagePullSecrets`나 서비스 계정에 연결. 클라우드는 노드 IAM 권한 |
| `toomanyrequests` | Docker Hub 내려받기 횟수 제한 | 인증해서 받기, 사내 미러·풀스루 캐시 |
| `no match for platform in manifest` | 노드 아키텍처(arm64·amd64)용 이미지가 없음 | 멀티 플랫폼으로 빌드 |
| 타임아웃, `no such host` | 노드에서 레지스트리로 나가는 네트워크·DNS·프록시 문제 | 이그레스·NAT·DNS 확인 |

### kubectl debug와 임시 컨테이너

distroless처럼 셸이 없는 이미지는 `exec`로 들어갈 수 없다. **임시 컨테이너(ephemeral container)** 는 실행 중인 파드에 디버깅 도구가 든 컨테이너를 잠시 더한다(1.25 정식).

```bash
# 실행 중인 파드에 busybox를 붙이고, app 컨테이너의 프로세스 네임스페이스를 공유
kubectl debug -it pod/api --image=busybox:1.37 --target=app

# 파드를 복제해 명령만 바꿔 띄우기 (바로 죽는 컨테이너를 셸로 살펴볼 때)
kubectl debug pod/api -it --copy-to=api-debug --container=app -- sh

# 노드 디버깅: 호스트 네임스페이스로 파드를 띄우고 노드 파일 시스템은 /host에
kubectl debug node/node-3 -it --image=ubuntu:24.04
```

- `--target`을 주면 대상 컨테이너의 프로세스를 `ps`로 보고 `/proc/<pid>/root`로 그 파일 시스템을 볼 수 있다.
- 임시 컨테이너는 포트·프로브·자원 설정이 없고, 한번 추가하면 파드에서 지울 수 없다. 파드가 다시 만들어지면 사라진다.
- `--profile=netadmin`·`sysadmin`처럼 필요한 권한 묶음을 고른다.

네트워크·DNS 문제 진단은 [[kubernetes-networking|쿠버네티스 네트워킹]]에, 지연 원인 찾기는 [[kubernetes-scheduling-resources|스케줄링과 자원 관리]]의 「파드를 늘려도 지연이 줄지 않을 때」에 있다.

## 확장: CRD와 오퍼레이터

### CRD와 커스텀 컨트롤러

**CRD(Custom Resource Definition)는 쿠버네티스 API에 새 리소스 종류를 추가하는 방법**이다. CRD를 등록하면 `kubectl get postgresclusters`처럼 내장 리소스와 똑같이 만들고 조회하고 RBAC를 걸 수 있으며, OpenAPI 스키마로 필드를 검증하고 여러 버전을 둘 수 있다. 데이터는 etcd에 저장된다.

| | 커스텀 리소스 (CR) | 커스텀 컨트롤러 |
| --- | --- | --- |
| 역할 | **원하는 상태**를 담은 데이터. 「PostgreSQL 3대, 버전 17, 매일 백업」 | CR을 watch하다가 실제 상태를 그에 맞추는 프로그램(조정 루프) |
| 혼자 있으면 | 저장만 되고 아무 일도 일어나지 않는다 | 지켜볼 대상이 없다 |

둘이 합쳐져야 내장 리소스처럼 동작한다. Deployment가 ReplicaSet 컨트롤러와 짝을 이루는 것과 같은 구조다.

### 오퍼레이터 패턴

**오퍼레이터(Operator)는 CRD와 커스텀 컨트롤러로 특정 소프트웨어의 운영 지식을 코드로 만든 것**이다. 사람 운영자가 하던 설치, 설정, 업그레이드 순서, 백업·복구, 장애 조치, 확장(day-2 운영)을 컨트롤러가 대신한다.

| 쓰는 상황 | 이유 |
| --- | --- |
| DB·메시지 브로커 같은 상태 있는 분산 시스템 | StatefulSet은 이름과 저장소만 주고, 리더 선출·복제·장애 조치 순서는 모른다 |
| 운영 절차가 복잡하고 반복된다 | 매번 같은 절차를 정확히 실행하고, 실패하면 계속 재시도한다 |
| 여러 팀에 같은 서비스를 셀프서비스로 | CR 하나로 표준화된 인스턴스를 만든다 |

간단한 상태 없는 앱에는 Helm이나 일반 매니페스트가 낫다. 오퍼레이터는 그 자체로 운영할 소프트웨어가 하나 늘어나는 것이다.

| 오퍼레이터 | 관리 대상 | 장점 |
| --- | --- | --- |
| Prometheus Operator | Prometheus, Alertmanager | ServiceMonitor·PrometheusRule CR로 수집 대상과 알림을 앱 옆에 선언한다 |
| CloudNativePG | PostgreSQL | 스트리밍 복제, 자동 장애 조치, 오브젝트 스토리지 백업과 시점 복구 |
| MySQL Operator for Kubernetes, Percona Operator | MySQL | InnoDB Cluster·그룹 복제 구성과 라우터, 백업 |
| Strimzi | Kafka | 브로커·토픽·사용자를 CR로 관리, 순차 재시작 업그레이드 |
| cert-manager | TLS 인증서 | Certificate CR로 발급·갱신 자동화 |

### 오퍼레이터 개발: Kubebuilder와 Operator SDK

| 도구 | 특징 |
| --- | --- |
| Kubebuilder | Go 프로젝트 골격 생성 도구. controller-runtime 라이브러리 위에서 동작하고, 코드 주석(마커)으로 CRD 스키마·RBAC 매니페스트를 생성한다 |
| Operator SDK | Go 오퍼레이터는 Kubebuilder를 그대로 쓰고, Helm·Ansible 기반 오퍼레이터와 OLM(Operator Lifecycle Manager) 배포 지원을 더한다 |

```text
kubebuilder init → kubebuilder create api (CR의 Go 타입 + 컨트롤러 골격)
  → 타입에 spec(원하는 상태)·status(관측한 상태) 정의
  → Reconcile 함수 구현: CR을 읽고 → 필요한 하위 리소스를 만들거나 고치고 → status 갱신
  → make manifests (CRD·RBAC 생성) → 클러스터에 배포
```

Reconcile은 **멱등**해야 한다. 「무엇이 바뀌었나(이벤트)」가 아니라 「지금 원하는 상태와 실제 상태가 다른가」로 판단하고(레벨 기반), 실패하면 다시 큐에 넣는다. 하위 리소스에 ownerReference를 달아 CR이 지워질 때 함께 지워지게 하고, 외부 자원 정리가 필요하면 finalizer로 삭제를 잠시 막는다.

## GitOps: Argo CD와 Flux

**GitOps는 Git 저장소를 원하는 상태의 유일한 원천으로 두고, 클러스터 안의 에이전트가 그 상태를 끌어와(pull) 계속 맞추는 배포 방식**이다. OpenGitOps 원칙은 선언형, 버전 관리·불변, 자동으로 끌어오기, 지속적 조정 네 가지다. 개념과 IaC의 관계는 [[cloud-native|클라우드 네이티브와 코드형 인프라]]에 있다.

```text
개발자 PR → 리뷰·병합 (매니페스트 저장소)
CI: 이미지 빌드·푸시 → 매니페스트의 이미지 태그를 바꾸는 커밋
클러스터 안 Argo CD / Flux: 저장소 변경 감지 → 클러스터에 적용 → 드리프트 발견 시 되돌림
```

| | 푸시 방식 CD (CI가 kubectl apply) | GitOps (풀 방식) |
| --- | --- | --- |
| 클러스터 자격 증명 | CI가 가진다 | 클러스터 안에만 있다 |
| 드리프트 | 누가 직접 고치면 그대로 남는다 | 자동으로 감지하고 되돌린다 |
| 감사·롤백 | 파이프라인 기록 | Git 기록이 곧 배포 기록. 롤백은 `git revert` |

Argo CD에서는 **Application** 리소스가 「어느 저장소의 어느 경로를 어느 클러스터·네임스페이스에」를 선언한다.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata: { name: api, namespace: argocd }
spec:
  project: default
  source:
    repoURL: https://github.com/acme/deploy.git
    path: apps/api/overlays/prod          # Helm 차트나 Kustomize도 된다
    targetRevision: main
  destination: { server: https://kubernetes.default.svc, namespace: shop }
  syncPolicy:
    automated: { prune: true, selfHeal: true }   # 저장소에서 지운 리소스 삭제, 드리프트 자동 복구
```

| | Argo CD | Flux |
| --- | --- | --- |
| 구조 | 하나의 애플리케이션(서버, 저장소 서버, 컨트롤러)과 **웹 UI** | 역할별 컨트롤러 묶음(source, kustomize, helm, notification, image automation) |
| 단위 리소스 | Application, 여러 개를 생성하는 ApplicationSet | GitRepository·OCIRepository(소스) + Kustomization·HelmRelease(적용) |
| 멀티 클러스터 | 중앙 Argo CD 하나가 여러 클러스터에 배포하기 쉽다 | 클러스터마다 Flux를 두고 각자 끌어오는 방식이 기본 |
| 강점 | 시각화(리소스 트리, 동기화·헬스 상태), 개발자 셀프서비스, 프로젝트 단위 멀티 테넌시 | 가볍고 쿠버네티스 네이티브, 조합하기 쉬움, 이미지 태그 자동 갱신 |
| 맞는 곳 | 여러 팀이 UI로 배포 상태를 보고 조작하는 조직, 중앙에서 많은 클러스터 관리 | 플랫폼 팀이 코드로만 운영, 클러스터마다 자율적으로 |

둘 다 CNCF 졸업 프로젝트이고 Helm·Kustomize를 지원한다. 점진적 배포(카나리 분석)는 각각 Argo Rollouts, Flagger와 짝을 이룬다([[deployment-strategies|배포 전략]]).

## 멀티 클러스터

| 여러 클러스터를 두는 이유 | 설명 |
| --- | --- |
| 장애 범위 격리 | 클러스터 업그레이드 실패, 잘못된 전역 설정, 컨트롤 플레인 장애가 한 클러스터에 그친다 |
| 지역·지연 | 사용자 가까운 리전에서 서비스 |
| 규제·데이터 위치 | 데이터가 특정 국가 안에 머물러야 할 때 |
| 환경·테넌트 분리 | 개발·운영, 고객사별로 강하게 나눔 |
| 규모 한계 | 클러스터 하나가 감당하는 노드·오브젝트 수에 한계가 있다 |

| 고려 사항 | 방법 |
| --- | --- |
| 일관된 구성 | GitOps(ApplicationSet, 클러스터별 Flux)로 같은 기준을 모든 클러스터에 |
| 클러스터 생성·수명 관리 | Terraform, Cluster API, 관리형 서비스의 플릿(fleet) 기능 |
| 클러스터 간 서비스 디스커버리·통신 | Multi-Cluster Services API, Cilium ClusterMesh, Istio 멀티 클러스터 |
| 트래픽 분배 | 전역 로드 밸런서·DNS 기반 라우팅, 장애 시 다른 클러스터로 전환 |
| 신원·권한 | 클러스터마다 같은 IdP·RBAC 기준 |
| 관측 | 지표·로그를 한곳으로 모은다(Thanos·Mimir, 중앙 로깅) |
| 데이터 | 상태 있는 서비스의 리전 간 복제는 가장 어려운 부분이다([[disaster-recovery\|재해 복구]]) |

**페더레이션(Federation)** 은 여러 클러스터를 하나의 API로 묶어, 하나의 리소스 선언을 여러 클러스터에 나눠 배포하는 개념이다. 공식 프로젝트였던 KubeFed는 2023년에 보관(archived)됐고, 지금은 CNCF의 Karmada, Open Cluster Management 같은 프로젝트나 GitOps 도구의 멀티 클러스터 배포가 그 자리를 채운다. 배포 전략은 모든 클러스터에 같은 앱을 두는 액티브-액티브, 클러스터마다 다른 부분을 맡기는 분할, 그리고 한 클러스터씩 차례로 배포하며 문제를 일찍 잡는 점진적 배포가 흔하다.

## 정리

- Helm은 차트(템플릿 + 값)를 릴리스로 설치하고 리비전으로 업그레이드·롤백한다. 값은 values.yaml < `-f` < `--set` 순으로 덮이고, 훅으로 마이그레이션 같은 순서 작업을 끼운다.
- 업그레이드는 컨트롤 플레인 먼저, 마이너 한 단계씩, 노드는 drain 후 교체한다. 그 전에 etcd를 백업하고 제거된 API를 점검한다.
- cordon은 새 배치만 막고 drain은 파드를 옮긴다. PDB는 자발적 중단에서 동시에 내려가는 파드 수를 제한한다.
- `kubectl logs --previous`와 `describe`의 종료 코드·이벤트가 CrashLoopBackOff 진단의 출발점이다. 셸 없는 이미지는 `kubectl debug`의 임시 컨테이너로 본다.
- metrics-server는 오토스케일링용 현재값, Prometheus는 이력과 앱 지표를 맡는다.
- CRD는 새 리소스, 컨트롤러는 그 조정 루프, 오퍼레이터는 둘로 만든 운영 자동화다.
- GitOps는 Git을 원천으로 클러스터가 끌어와 맞추며, UI·중앙 관리는 Argo CD, 가벼운 조합은 Flux가 강하다.

관련 노트: [[kubernetes-architecture|쿠버네티스 구조와 핵심 개념]], [[kubernetes-workloads|쿠버네티스 워크로드와 파드 생명주기]], [[kubernetes-scheduling-resources|쿠버네티스 스케줄링과 자원 관리]], [[kubernetes-networking|쿠버네티스 네트워킹]], [[observability|관측 가능성: 로그, 트레이스, 메트릭]], [[cloud-native|클라우드 네이티브와 코드형 인프라]], [[ci-cd|CI/CD]], [[disaster-recovery|고가용성과 재해 복구 설계]]
