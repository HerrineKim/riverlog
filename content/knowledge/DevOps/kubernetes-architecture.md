---
title: "쿠버네티스 구조와 핵심 개념"
concept: "Kubernetes"
summary: "쿠버네티스는 원하는 상태를 선언하면 컨트롤 플레인이 노드의 컨테이너를 그 상태로 계속 맞추는 오케스트레이터다. 컨트롤 플레인(API 서버·etcd·스케줄러·컨트롤러 매니저)과 노드(kubelet·kube-proxy·런타임)의 역할, 파드와 워크로드 리소스, 서비스 네 가지 유형, 쿠버네티스 디자인 패턴, 자주 쓰는 kubectl 명령, 생태계 도구 지도를 정리한다."
tags: ["devops", "kubernetes", "infra", "container", "design-pattern"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/what-is-k8s-kubernetes", "https://bytebytego.com/guides/top-4-kubernetes-service-types-in-one-diagram", "https://bytebytego.com/guides/top-10-k8s-design-patterns", "https://bytebytego.com/guides/the-ultimate-kubernetes-command-cheatsheet", "https://bytebytego.com/guides/kubernetes-periodic-table", "https://bytebytego.com/guides/kubernetes-tools-ecosystem", "https://bytebytego.com/guides/kubernetes-tools-stack-wheel", "https://kubernetes.io/docs/concepts/overview/components/", "https://kubernetes.io/docs/concepts/services-networking/service/", "https://subicura.com/2019/05/19/kubernetes-basic-1.html", "https://coffeewhale.com/k8s/network/2019/04/19/k8s-network-01/", "https://buttondown.com/nelhage/archive/two-reasons-kubernetes-is-so-complex/"]
---

> ByteByteGo의 System Design 101 가이드 「[What is Kubernetes (k8s)?](https://bytebytego.com/guides/what-is-k8s-kubernetes)」, 「[Top 4 Kubernetes Service Types](https://bytebytego.com/guides/top-4-kubernetes-service-types-in-one-diagram)」, 「[Top 10 Kubernetes Design Patterns](https://bytebytego.com/guides/top-10-k8s-design-patterns)」, 「[Kubernetes Command Cheatsheet](https://bytebytego.com/guides/the-ultimate-kubernetes-command-cheatsheet)」, 「[Kubernetes Periodic Table](https://bytebytego.com/guides/kubernetes-periodic-table)」, 「[Kubernetes Tools Ecosystem](https://bytebytego.com/guides/kubernetes-tools-ecosystem)」, 「[Kubernetes Tools Stack Wheel](https://bytebytego.com/guides/kubernetes-tools-stack-wheel)」을 바탕으로, 구성 요소는 쿠버네티스 공식 문서로 확인해 재구성한 노트다. 파드 생성 흐름은 「[쿠버네티스 시작하기 - 쿠버네티스란 무엇인가?](https://subicura.com/2019/05/19/kubernetes-basic-1.html)」, 파드 네트워킹은 「[쿠버네티스 네트워킹 이해하기#1: Pods](https://coffeewhale.com/k8s/network/2019/04/19/k8s-network-01/)」, 복잡성의 이유는 「[Two reasons Kubernetes is so complex](https://buttondown.com/nelhage/archive/two-reasons-kubernetes-is-so-complex/)」로 보강했다.

## 쿠버네티스란

**쿠버네티스(Kubernetes, k8s)는 컨테이너의 배포·확장·복구를 자동화하는 오케스트레이터다.** 사용자는 "이 이미지로 파드 3개"처럼 **원하는 상태(desired state)** 를 선언하고, 쿠버네티스는 실제 상태가 그와 다르면 계속 맞춘다. 파드가 죽으면 다시 띄우고, 노드가 사라지면 다른 노드에 옮긴다. 구글의 사내 시스템 Borg에서 나왔고 지금은 CNCF가 관리한다. 컨테이너와 오케스트레이션이 왜 필요한지는 [[vm-vs-container|VM과 컨테이너]]에 있다.

## 클러스터 구조

```text
┌──────────────── 컨트롤 플레인 ────────────────┐
│  kube-apiserver ◀── kubectl, 다른 모든 구성 요소 │
│     │                                          │
│     ├── etcd (클러스터 상태 저장)               │
│     ├── kube-scheduler (파드 → 노드 배정)       │
│     └── kube-controller-manager (상태 맞추기)   │
└──────────────────────┬─────────────────────────┘
                       │ API 호출
     ┌─────────────────┼─────────────────┐
  [노드 1]          [노드 2]          [노드 N]
  kubelet           kubelet           ...
  kube-proxy        kube-proxy
  컨테이너 런타임    컨테이너 런타임
  파드 파드         파드
```

| 위치 | 구성 요소 | 역할 |
| --- | --- | --- |
| 컨트롤 플레인 | kube-apiserver | 클러스터의 유일한 관문. 모든 조회·변경은 API 서버를 거친다 |
| | etcd | 클러스터의 모든 상태를 저장하는 분산 키-값 저장소. 백업 대상 1순위 |
| | kube-scheduler | 아직 노드가 정해지지 않은 파드를 보고, 자원 요청·제약 조건에 맞는 노드를 고른다 |
| | kube-controller-manager | 노드·잡·EndpointSlice·서비스 계정 등 컨트롤러를 돌려 실제 상태를 원하는 상태로 맞춘다 |
| | cloud-controller-manager | 로드 밸런서·디스크처럼 클라우드 자원과 연결한다(클라우드에서만) |
| 노드 | kubelet | 노드마다 도는 에이전트. 배정된 파드의 컨테이너가 실제로 실행 중인지 확인한다 |
| | kube-proxy | 서비스 주소로 온 트래픽을 알맞은 파드로 보내는 네트워크 규칙을 관리한다 |
| | 컨테이너 런타임 | 컨테이너를 실제로 실행한다(containerd, CRI-O 등 CRI 구현체) |

운영 환경에서는 컨트롤 플레인을 여러 대에 나눠 두고 노드도 여러 대로 구성해 장애를 견딘다. 관리형 쿠버네티스(EKS·GKE·AKS)는 컨트롤 플레인을 클라우드가 맡는다.

### 조정 루프: 쿠버네티스의 기본 동작

```text
원하는 상태 (etcd에 저장된 선언)
        │ 비교
실제 상태 (노드가 보고)
        │ 다르면
컨트롤러가 행동 (파드 생성·삭제·재시작)
        └── 다시 비교 (무한 반복)
```

명령형으로 "파드를 하나 띄워라"가 아니라 선언형으로 "파드는 3개여야 한다"고 쓰는 이유가 이 루프다. 이 원리를 사용자 정의 리소스로 넓힌 것이 아래 디자인 패턴의 컨트롤러·오퍼레이터 패턴이다.

구성 요소끼리는 **서로 직접 부르지 않는다.** 모두 API 서버를 통해 etcd의 상태를 읽고 쓰며, 자기가 맡은 오브젝트만 지켜본다(watch). 파드 하나가 뜨는 과정도 그렇다.

```text
kubectl apply (Deployment) ─▶ API 서버 ─▶ etcd에 저장
  Deployment 컨트롤러: "ReplicaSet이 없네" → ReplicaSet 생성
  ReplicaSet 컨트롤러: "파드가 모자라네" → 노드 미지정 파드 생성
  스케줄러: "노드 미지정 파드가 있네" → 자원·조건에 맞는 노드를 적어 넣음
  그 노드의 kubelet: "내게 배정된 파드가 있네" → 런타임으로 컨테이너 실행, 상태 보고
```

새 기능을 넣어도 "상태를 지켜보고 맞추는 컨트롤러 하나"를 더하는 것으로 끝나는 구조라 확장이 쉽다.

### 왜 이렇게 복잡한가

쿠버네티스의 복잡함은 우연이 아니라 목표에서 나온다.

| 이유 | 결과 |
| --- | --- |
| **클러스터의 운영체제 커널**을 지향한다. OS가 한 컴퓨터의 하드웨어를 추상화하듯, 데이터 센터 전체를 어떤 앱이든 올릴 수 있게 추상화하려 한다 | 범용성·이식성을 위해 플러그인 지점과 설정 항목이 아주 많다. Heroku 같은 앱 플랫폼이 아니라 인프라 전체를 정의하는 도구에 가깝다 |
| **모든 것이 제어 루프**다 | 부분 실패에 강하고 스스로 복구된다. 대신 오류가 **늦게** 드러난다. 오브젝트 생성은 성공했는데 자원 부족·이미지 오타로 파드가 영영 뜨지 않는 식이라, 원인을 이벤트(`kubectl describe`, `kubectl get events`)에서 찾아야 한다. 상태 전이를 다 구현하지 않은 오퍼레이터는 변경이 영원히 반영되지 않을 수도 있다 |

그래서 서비스 몇 개를 띄우는 정도라면 관리형 컨테이너 서비스(ECS, Cloud Run 등)나 PaaS가 더 단순할 수 있다([[startup-infra-decisions|스타트업 인프라 선택 원칙]]).

## 파드와 워크로드 리소스

**파드(Pod)는 쿠버네티스가 다루는 가장 작은 단위다.** 컨테이너 하나 이상의 묶음으로, 파드 안 컨테이너들은 IP 하나와 네트워크 네임스페이스를 공유해 `localhost`로 통신하고 볼륨을 함께 쓴다. 파드는 언제든 죽고 새로 생기는 일회용이라, 직접 만들기보다 워크로드 리소스가 관리하게 한다.

**파드가 네트워크를 공유하는 방법**: 파드마다 아무 일도 하지 않는 **pause 컨테이너**가 먼저 떠서 네트워크 네임스페이스를 만들고 쥐고 있다. 앱 컨테이너들은 그 네임스페이스에 합류하므로 IP와 포트 공간을 공유한다. 그래서 같은 파드 안의 두 컨테이너는 `localhost`로 통신하지만, **같은 포트를 둘이 열 수는 없다.** 앱 컨테이너가 재시작돼도 파드 IP는 pause 컨테이너가 유지한다. 파드 네임스페이스는 veth 쌍으로 노드의 브리지에 연결되고, 노드마다 겹치지 않는 파드 대역을 받아 노드 사이 라우팅(또는 오버레이)으로 다른 노드의 파드와 통신한다. 이 배선은 CNI 플러그인(Calico, Cilium 등)이 맡는다. 네임스페이스와 veth의 원리는 [[linux-network-namespace|리눅스 네트워크 네임스페이스와 ip 명령]]에 있다.

| 리소스 | 언제 |
| --- | --- |
| Deployment | 상태 없는 웹 서버·API. 롤링 업데이트와 롤백([[deployment-strategies\|배포 전략]]) |
| StatefulSet | DB·메시지 브로커처럼 파드마다 고정된 이름과 저장소가 필요할 때 |
| DaemonSet | 로그 수집기·노드 모니터링처럼 노드마다 하나씩 |
| Job / CronJob | 한 번 또는 주기적으로 실행하고 끝나는 배치 작업 |
| ConfigMap / Secret | 설정과 비밀 값을 이미지 밖에서 주입 |
| PersistentVolumeClaim | 파드가 죽어도 남는 저장소 요청 |

요청 경로에서 Service·HPA·Helm이 맡는 역할은 [[kubernetes-request-path|쿠버네티스 위 웹 서비스의 요청 경로]]에 있다.

## 서비스: 파드를 네트워크에 노출하는 네 가지 방법

파드 IP는 파드가 바뀔 때마다 달라진다. **서비스(Service)는 라벨로 고른 파드 집합 앞에 고정된 이름과 주소를 붙인다.** `spec.type`이 노출 범위를 정한다.

| 유형 | 노출 범위 | 동작 | 쓰임 |
| --- | --- | --- | --- |
| ClusterIP (기본값) | 클러스터 안 | 클러스터 내부 가상 IP를 받는다 | 서비스 간 내부 통신 |
| NodePort | 클러스터 밖 | ClusterIP에 더해 모든 노드에 같은 포트(기본 30000–32767)를 연다. `노드IP:노드포트`로 접근 | 개발·온프레미스, 외부 로드 밸런서를 직접 붙일 때 |
| LoadBalancer | 클러스터 밖 | NodePort에 더해 클라우드 로드 밸런서를 만들어 붙인다 | 클라우드에서 외부 공개 |
| ExternalName | 클러스터 밖의 대상 | 프록시 없이 DNS CNAME으로 외부 도메인을 가리킨다 | 외부 DB를 클러스터 안 이름으로 부를 때 |

```text
ClusterIP ⊂ NodePort ⊂ LoadBalancer   (앞의 것을 포함하며 범위를 넓힌다)
```

- `clusterIP: None`으로 만든 **헤드리스 서비스**는 가상 IP 없이 DNS로 파드 주소를 직접 돌려준다. StatefulSet이 파드별 고정 이름을 얻는 방법이다.
- HTTP 호스트·경로 단위의 라우팅은 서비스가 아니라 Ingress나 Gateway API가 맡는다.

## 쿠버네티스 디자인 패턴

쿠버네티스 위에서 앱을 설계할 때 반복되는 해법을 네 묶음으로 나눈다. 『Kubernetes Patterns』(Bilgin Ibryam, Roland Huß)의 분류다.

| 묶음 | 패턴 | 핵심 |
| --- | --- | --- |
| 기초 | 헬스 프로브(Health Probe) | 컨테이너가 liveness·readiness·startup 프로브로 상태를 드러내야 플랫폼이 재시작·트래픽 차단을 판단한다 |
| | 예측 가능한 요구(Predictable Demands) | CPU·메모리 requests·limits와 의존성을 선언해야 스케줄러가 제대로 배치한다 |
| | 자동 배치(Automated Placement) | 스케줄러가 자원·어피니티·테인트/톨러레이션으로 노드를 고르는 원리 |
| 구조 | 초기화 컨테이너(Init Container) | 앱 컨테이너보다 먼저 끝까지 실행되는 준비 작업(마이그레이션, 설정 내려받기) |
| | 사이드카(Sidecar) | 앱을 고치지 않고 옆 컨테이너로 기능을 더한다(프록시, 로그 전달) |
| 행동 | 배치 잡(Batch Job) | 끝나는 작업을 Job으로 실행하고 재시도한다 |
| | 상태 있는 서비스(Stateful Service) | StatefulSet으로 고정 정체성과 저장소를 준다 |
| | 서비스 디스커버리(Service Discovery) | 클라이언트가 Service·DNS로 대상 파드를 찾는다 |
| 상위 | 컨트롤러(Controller) | 실제 상태를 지켜보다 선언된 상태로 맞추는 조정 루프 |
| | 오퍼레이터(Operator) | 커스텀 리소스(CRD)와 컨트롤러로 DB 백업·장애 조치 같은 운영 지식을 코드로 자동화한다 |

## 자주 쓰는 kubectl 명령

```bash
# 클러스터·컨텍스트
kubectl config get-contexts                 # 연결할 수 있는 클러스터 목록
kubectl config use-context <이름>           # 대상 클러스터 바꾸기
kubectl get nodes -o wide                   # 노드 상태

# 조회
kubectl get pods -n <네임스페이스>           # -A면 모든 네임스페이스
kubectl get deploy,svc,ingress
kubectl describe pod <파드>                 # 이벤트까지 보여 줘 장애 원인 찾기의 출발점
kubectl get pod <파드> -o yaml              # 실제 적용된 명세

# 배포
kubectl apply -f manifest.yaml              # 선언한 상태로 맞추기
kubectl rollout status deploy/<이름>
kubectl rollout undo deploy/<이름>          # 직전 리비전으로 되돌리기
kubectl scale deploy/<이름> --replicas=5

# 디버깅
kubectl logs <파드> -c <컨테이너> -f --previous   # 직전에 죽은 컨테이너 로그
kubectl exec -it <파드> -- sh
kubectl port-forward svc/<서비스> 8080:80   # 로컬에서 클러스터 서비스 접속
kubectl get events --sort-by=.metadata.creationTimestamp
kubectl top pod                             # metrics-server 필요

# 설정
kubectl create configmap app-config --from-file=config.yaml
kubectl create secret generic db --from-literal=password=...
```

## 생태계 지도

쿠버네티스 자체는 핵심 기능만 갖고, 나머지는 플러그인과 주변 도구가 채운다. 구성 요소가 100개가 넘어 원소 주기율표처럼 정리한 지도가 있을 정도다. 도구 이름은 자주 바뀌므로 **범주**로 기억하고, 범주마다 무엇이 필요한지에서 출발해 고른다.

| 범주 | 채우는 문제 | 대표 도구 |
| --- | --- | --- |
| 클러스터 프로비저닝 | 클러스터와 클라우드 자원을 코드로 만든다 | Terraform·OpenTofu, Cluster API, 관리형 서비스(EKS·GKE·AKS) |
| 컨테이너 런타임 | 노드에서 컨테이너 실행 | containerd, CRI-O |
| 네트워킹 | 파드 간 통신(CNI), 진입점, 서비스 간 트래픽 | Cilium·Calico, Gateway API 구현체, Istio·Linkerd |
| 패키징·배포 | 리소스 묶음 관리와 GitOps | Helm, Kustomize, Argo CD, Flux |
| 클러스터 관리 | 여러 클러스터 운영, 터미널 UI | Rancher, k9s, Lens |
| 관측 | 지표·로그·트레이스 | Prometheus, Grafana, OpenTelemetry, Loki, Jaeger |
| 보안 | 이미지 스캔, 정책 강제, 런타임 탐지 | Trivy, OPA Gatekeeper·Kyverno, Falco |
| 저장소 | 상태 있는 워크로드의 볼륨 | CSI 드라이버, Rook·Ceph, Longhorn |

## 정리

- 쿠버네티스는 원하는 상태를 선언받아 **조정 루프**로 계속 맞추는 시스템이다.
- 컨트롤 플레인은 API 서버를 중심으로 etcd·스케줄러·컨트롤러가 돌고, 노드에서는 kubelet·kube-proxy·런타임이 일한다.
- 파드는 일회용이다. 워크로드 리소스가 관리하고, 서비스가 고정 주소를 준다.
- 서비스 유형은 ClusterIP → NodePort → LoadBalancer 순으로 노출 범위를 넓히고, ExternalName은 외부 이름을 가리킨다.
- 설계는 프로브·자원 선언 같은 기초 패턴부터 지킨다. 그래야 플랫폼이 자동으로 관리할 수 있다.

관련 노트: [[vm-vs-container|VM과 컨테이너]], [[kubernetes-request-path|쿠버네티스 위 웹 서비스의 요청 경로와 구성 요소]], [[deployment-strategies|배포 전략]], [[observability|관측 가능성: 로그, 트레이스, 메트릭]], [[linux-network-namespace|리눅스 네트워크 네임스페이스와 ip 명령]]
