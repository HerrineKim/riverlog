---
title: "쿠버네티스 보안: 인증, RBAC, 서비스 계정, 파드 보안"
concept: "Kubernetes Security"
summary: "쿠버네티스 API에 접근하는 주체를 확인하는 인증(X.509·토큰·OIDC)과 kubeconfig 구조, 권한을 주는 RBAC(Role·ClusterRole·바인딩, verb)와 최소 권한 적용법, 파드가 API를 부르는 서비스 계정과 토큰, 그리고 컨테이너 권한을 줄이는 Pod Security Standards·Pod Security Admission·securityContext를 정리한다."
tags: ["devops", "kubernetes", "security", "infra", "auth"]
source: other
date: "2026-10-30"
sources: ["https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/kubernetes.md", "https://kubernetes.io/docs/reference/access-authn-authz/authentication/", "https://kubernetes.io/docs/reference/access-authn-authz/rbac/", "https://kubernetes.io/docs/concepts/security/rbac-good-practices/", "https://kubernetes.io/docs/concepts/security/service-accounts/", "https://kubernetes.io/docs/concepts/security/pod-security-standards/", "https://kubernetes.io/docs/concepts/security/pod-security-admission/", "https://kubernetes.io/docs/tasks/configure-pod-container/security-context/", "https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/"]
---

> fru1tworld/cs-basic 모의 면접 질문 목록의 「[Kubernetes](https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/kubernetes.md)」 항목이 묻는 개념을 쿠버네티스 공식 문서로 확인해 정리한 노트다.

쿠버네티스 보안은 두 갈래다. 하나는 **API 서버에 누가 무엇을 할 수 있나**(인증·인가), 다른 하나는 **컨테이너가 노드에서 무엇을 할 수 있나**(파드 보안)다. 파드 사이 네트워크 접근은 NetworkPolicy가 맡으며 [[kubernetes-networking|쿠버네티스 네트워킹]]에 있다. Secret의 보안 수준은 [[kubernetes-storage-config|쿠버네티스 저장소와 설정]]에 있다.

```text
API 요청 → 인증(Authentication): 누구인가
        → 인가(Authorization): 이 동작을 해도 되나 (RBAC)
        → 어드미션(Admission): 내용이 정책에 맞나 (Pod Security Admission, 정책 엔진)
        → etcd 저장
```

## 인증: 누구인가

쿠버네티스에는 **사람 사용자 오브젝트가 없다.** 사용자는 외부(인증서, IdP)에서 확인된 이름과 그룹 문자열일 뿐이다. 프로그램용 신원인 서비스 계정만 쿠버네티스 오브젝트다.

| 방식 | 동작 | 특징 |
| --- | --- | --- |
| X.509 클라이언트 인증서 | 클러스터 CA가 서명한 인증서. CN이 사용자 이름, O가 그룹 | kubeadm 관리자 인증서가 이 방식이다. **개별 폐기가 어려워** 유출되면 만료까지 유효하다. 사람에게 장기 인증서를 주지 않는다 |
| 베어러 토큰 | `Authorization: Bearer <토큰>` | 서비스 계정 토큰이 대표적. 정적 토큰 파일은 권장하지 않는다 |
| OIDC | 외부 IdP(Google, Okta, Keycloak)가 발급한 ID 토큰(JWT)을 API 서버가 검증 | 사람 사용자의 표준. 회사 계정·MFA·그룹을 그대로 쓰고 퇴사 시 IdP에서 막는다 |
| 웹훅 토큰 인증 | API 서버가 토큰 검증을 외부 서비스에 묻는다 | 관리형 클러스터의 클라우드 IAM 연동(EKS의 IAM 인증 등) |
| 인증 프록시 | 앞단 프록시가 인증하고 헤더로 사용자를 넘긴다 | 기존 SSO 게이트웨이 재사용 |

어느 방식으로도 확인되지 않은 요청은 `system:anonymous`로 취급된다. 익명 요청에는 권한을 주지 않는다.

### kubeconfig

kubectl은 `~/.kube/config`(또는 `KUBECONFIG` 환경 변수의 파일들을 합친 것)를 읽어 어느 클러스터에 어떤 자격으로 접속할지 정한다.

```yaml
apiVersion: v1
kind: Config
clusters:                          # 어디에: API 서버 주소와 CA 인증서
  - name: prod
    cluster: { server: https://prod.example.com:6443, certificate-authority-data: <base64> }
users:                             # 누구로: 자격 증명
  - name: alice
    user:
      exec:                        # 실행할 때마다 짧은 토큰을 받아 오는 플러그인
        apiVersion: client.authentication.k8s.io/v1
        command: kubectl
        args: [oidc-login, get-token, --oidc-issuer-url=https://idp.example.com]
contexts:                          # 조합: 클러스터 + 사용자 + 기본 네임스페이스
  - name: prod-alice
    context: { cluster: prod, user: alice, namespace: shop }
current-context: prod-alice
```

- 사용자 항목에는 인증서·키, 토큰, exec 플러그인을 쓸 수 있다. 파일에 긴 수명의 비밀을 두지 않으려면 exec 플러그인(kubelogin, `aws eks get-token`, `gke-gcloud-auth-plugin`)이 낫다.
- `kubectl config get-contexts`, `use-context`로 클러스터를 바꾼다. 운영 클러스터 컨텍스트를 실수로 쓰지 않도록 프롬프트에 현재 컨텍스트를 띄우는 것이 흔한 습관이다.

## 인가: RBAC

**RBAC(Role-Based Access Control)는 「어떤 주체가 어떤 리소스에 어떤 동작(verb)을 할 수 있나」를 역할로 묶어 부여하는 방식**이다. 규칙은 허용만 있고 거부는 없으며, 여러 바인딩의 권한이 합쳐진다.

| 오브젝트 | 범위 | 역할 |
| --- | --- | --- |
| Role | 네임스페이스 | 한 네임스페이스 안의 권한 묶음 |
| ClusterRole | 클러스터 | 클러스터 범위 리소스(노드, PV, 네임스페이스), 리소스가 아닌 URL(`/healthz`), 또는 **여러 네임스페이스에서 재사용할** 권한 묶음 |
| RoleBinding | 네임스페이스 | Role 또는 ClusterRole을 주체에게 **그 네임스페이스 안에서만** 부여 |
| ClusterRoleBinding | 클러스터 | ClusterRole을 **모든 네임스페이스와 클러스터 범위**에 부여 |

주체(subject)는 User, Group, ServiceAccount다. ClusterRole을 RoleBinding으로 묶는 조합이 자주 쓰인다. 「파드 읽기」 ClusterRole을 하나 만들고 팀별 네임스페이스에서 RoleBinding하면, 정의는 하나로 두고 범위는 네임스페이스로 제한한다.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { name: deployer, namespace: shop }
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "update", "patch"]
  - apiGroups: [""]                       # 코어 그룹
    resources: ["pods", "pods/log"]
    verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { name: ci-deployer, namespace: shop }
subjects: [{ kind: ServiceAccount, name: ci, namespace: shop }]
roleRef: { kind: Role, name: deployer, apiGroup: rbac.authorization.k8s.io }
```

### verb

| verb | HTTP | 뜻 |
| --- | --- | --- |
| `get` | GET (단일) | 이름을 알고 하나 읽기 |
| `list` | GET (목록) | 전부 나열. **오브젝트 내용 전체를 돌려주므로** Secret의 list는 get과 같은 위험이다 |
| `watch` | GET (`?watch`) | 변경을 스트림으로 계속 받기. 컨트롤러가 쓴다 |
| `create` | POST | 새로 만들기 |
| `update` | PUT | 오브젝트 전체 교체 |
| `patch` | PATCH | 일부 필드만 수정. `kubectl apply`, `scale`이 쓴다 |
| `delete` · `deletecollection` | DELETE | 하나 / 여럿 삭제 |
| `escalate` · `bind` · `impersonate` | - | 자기보다 큰 권한의 역할 만들기 / 바인딩하기 / 다른 사용자인 척하기. 권한 상승 경로라 거의 주지 않는다 |

`pods/log`, `pods/exec`, `deployments/scale`처럼 하위 리소스는 따로 권한을 준다. `pods/exec`의 `create`는 컨테이너 안에서 명령을 실행하는 권한이다.

### 최소 권한 원칙 적용

| 실천 | 방법 |
| --- | --- |
| 범위를 좁힌다 | ClusterRoleBinding보다 네임스페이스의 RoleBinding을 쓴다 |
| 와일드카드를 피한다 | `resources: ["*"]`, `verbs: ["*"]`는 앞으로 생길 리소스까지 허용한다 |
| `cluster-admin` 바인딩을 최소화한다 | 사람은 평소 `view`·`edit` 수준으로 일하고, 관리 작업은 별도 그룹·절차로 |
| 앱마다 서비스 계정을 따로 만든다 | 기본(`default`) 서비스 계정에 권한을 붙이지 않는다 |
| 위험한 권한을 알아 둔다 | Secret의 get·list, **파드 생성**(아무 Secret이나 마운트하고 특권 컨테이너를 띄울 수 있다), `escalate`·`bind`·`impersonate`, `nodes/proxy`, 서비스 계정 토큰 생성 |
| 사람은 그룹으로 묶는다 | IdP 그룹을 바인딩해 입·퇴사를 IdP에서 처리한다 |
| 주기적으로 점검한다 | `kubectl auth can-i --list --as=system:serviceaccount:shop:ci`로 실제 권한을 확인한다 |

쿠버네티스는 `cluster-admin`, `admin`, `edit`, `view` 같은 기본 ClusterRole을 제공한다. 직접 만들기 전에 이것으로 충분한지 먼저 본다.

## 서비스 계정

**서비스 계정(ServiceAccount)은 파드 안에서 도는 프로세스의 신원**이다. 컨트롤러, CI 러너, 클러스터 정보를 읽는 앱처럼 API 서버를 부르는 프로그램이 이 신원으로 인증하고, RBAC로 권한을 받는다.

- 네임스페이스마다 `default` 서비스 계정이 자동으로 생기고, 지정하지 않은 파드는 이것을 쓴다. 앱별로 만들어 `spec.serviceAccountName`으로 지정한다.
- kubelet은 파드에 **투사된(projected) 토큰**을 `/var/run/secrets/kubernetes.io/serviceaccount/`(토큰, CA 인증서, 네임스페이스 파일)에 넣는다. 이 토큰은 대상(audience)과 만료 시간이 있고, kubelet이 만료 전에 갱신하며, 파드가 지워지면 무효가 된다.
- 쿠버네티스 1.24부터 서비스 계정마다 만료 없는 토큰 Secret을 자동으로 만들지 않는다. 클러스터 밖에서 쓸 토큰이 필요하면 `kubectl create token <서비스 계정> --duration=1h`로 짧게 발급한다.
- 같은 토큰을 클라우드 IAM과 연동해(EKS IRSA·Pod Identity, GKE Workload Identity) 파드에 클라우드 권한을 준다. 노드 IAM 역할에 권한을 몰아주지 않는다.

### 토큰 자동 마운트 끄기

대부분의 앱은 쿠버네티스 API를 부르지 않는데도 토큰이 마운트된다. 컨테이너가 뚫리면 공격자가 그 토큰으로 API를 탐색할 수 있다.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata: { name: web, namespace: shop }
automountServiceAccountToken: false        # 이 계정을 쓰는 파드 기본값
---
# 또는 파드 단위로 (파드 설정이 우선)
spec:
  serviceAccountName: web
  automountServiceAccountToken: false
```

## 파드 보안

### securityContext

securityContext는 컨테이너가 노드에서 가질 권한을 정한다. 파드 수준과 컨테이너 수준에 둘 수 있고 컨테이너 쪽이 우선한다.

```yaml
spec:
  securityContext:                       # 파드 수준
    runAsNonRoot: true
    runAsUser: 10001
    runAsGroup: 10001
    fsGroup: 10001                       # 마운트한 볼륨의 그룹 소유권
    seccompProfile: { type: RuntimeDefault }
  containers:
    - name: app
      image: app:1.2.0
      securityContext:                   # 컨테이너 수준
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities: { drop: ["ALL"] }
```

| 필드 | 효과 |
| --- | --- |
| `runAsUser` · `runAsGroup` | 프로세스의 UID·GID. 이미지의 `USER`를 덮어쓴다 |
| `runAsNonRoot: true` | UID 0으로 시작하려 하면 kubelet이 **컨테이너 실행을 거부**한다. 이미지가 숫자 UID를 지정해야 검증된다 |
| `fsGroup` | 볼륨 파일을 이 그룹 소유로 맞춰, 루트가 아닌 프로세스도 쓰게 한다 |
| `readOnlyRootFilesystem` | 컨테이너 파일 시스템을 읽기 전용으로. 공격자가 도구를 내려받거나 바이너리를 바꾸지 못한다. 쓸 곳은 emptyDir로 따로 준다 |
| `allowPrivilegeEscalation: false` | setuid 바이너리 등으로 부모보다 큰 권한을 얻지 못하게 한다(no_new_privs) |
| `privileged: true` | 호스트 장치와 거의 모든 커널 기능에 접근. 사실상 노드 루트이므로 CNI·스토리지 에이전트 외에는 쓰지 않는다 |
| `capabilities` | 루트 권한을 쪼갠 리눅스 capability를 더하거나 뺀다. `drop: ["ALL"]` 뒤 필요한 것(예: `NET_BIND_SERVICE`)만 더한다 |
| `seccompProfile` | 허용할 시스템 콜 목록. `RuntimeDefault`는 런타임의 기본 프로필 |
| `appArmorProfile` · `seLinuxOptions` | 리눅스 보안 모듈의 접근 제어 프로필 |

파드 명세의 `hostUsers: false`는 파드에 **사용자 네임스페이스**를 줘서, 컨테이너 안의 root(UID 0)를 노드에서는 권한 없는 UID로 대응시킨다. 컨테이너 탈출이 일어나도 노드 root가 되지 않는다. 쿠버네티스 1.36에서 정식 기능이 됐다. 이 필드들이 기대는 리눅스 기능(capability, seccomp, LSM, 네임스페이스)은 [[docker-container-operations|Docker 컨테이너 운영]]과 [[linux-access-control|리눅스 접근 제어]]에 있다.

### Pod Security Standards

Pod Security Standards는 securityContext 등 파드 설정을 기준으로 정한 **세 단계의 보안 수준 정의**다.

| 수준 | 성격 | 막는 것 |
| --- | --- | --- |
| Privileged | 제한 없음 | 없음. CNI·스토리지 드라이버 같은 시스템 구성 요소용 |
| Baseline | 알려진 권한 상승만 막는 최소 기준. 대부분의 앱이 수정 없이 통과 | 특권 컨테이너, hostNetwork·hostPID·hostIPC, hostPath 볼륨, 기본값을 넘는 capability 추가, hostPort |
| Restricted | 강화 기준. 앱이 맞춰야 할 수 있다 | Baseline에 더해 루트 실행 금지(`runAsNonRoot`), `allowPrivilegeEscalation: false`, capability `ALL` 제거(`NET_BIND_SERVICE`만 추가 허용), seccomp 프로필 필수, 허용된 볼륨 유형만 |

### Pod Security Admission

**Pod Security Admission은 Pod Security Standards를 네임스페이스 단위로 강제하는 내장 어드미션 컨트롤러**다. 쿠버네티스 1.25에서 정식이 됐고, 같은 버전에서 이전의 PodSecurityPolicy가 제거됐다. 네임스페이스 라벨로 설정한다.

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: shop
  labels:
    pod-security.kubernetes.io/enforce: baseline     # 어기면 거부
    pod-security.kubernetes.io/warn: restricted      # 어기면 경고만
    pod-security.kubernetes.io/audit: restricted     # 어기면 감사 로그에 기록
    pod-security.kubernetes.io/enforce-version: latest
```

| 모드 | 어기면 | 쓰임 |
| --- | --- | --- |
| `enforce` | 파드 생성을 **거부**한다 | 실제 강제 |
| `audit` | 허용하되 API 서버 감사 로그에 기록한다 | 운영 중인 위반을 조용히 파악 |
| `warn` | 허용하되 요청한 사용자(kubectl)에게 경고를 돌려준다 | 개발자에게 미리 알림 |

`enforce`는 파드에만 적용되므로, Deployment를 만들 때는 성공하고 ReplicaSet이 파드를 만들 때 실패한다. `warn`·`audit`은 워크로드 리소스의 파드 템플릿에도 적용되어 Deployment 단계에서 경고가 보인다. 그래서 흔한 도입 순서는 warn·audit으로 restricted를 걸어 위반을 모으고 → 고친 뒤 enforce를 올리는 것이다.

세 단계보다 세밀한 규칙(허용 레지스트리, 필수 라벨, `latest` 태그 금지)은 CEL로 쓰는 ValidatingAdmissionPolicy나 Kyverno·OPA Gatekeeper 같은 정책 엔진이 맡는다.

## 정리

- 요청은 인증 → 인가(RBAC) → 어드미션을 거친다. 사람은 OIDC 같은 외부 IdP로, 프로그램은 서비스 계정으로 인증한다.
- kubeconfig는 clusters(어디) · users(누구) · contexts(조합)로 짜인다.
- RBAC는 허용만 있다. Role·RoleBinding은 네임스페이스, ClusterRole·ClusterRoleBinding은 클러스터 범위이고, ClusterRole을 RoleBinding으로 좁혀 재사용할 수 있다. list와 파드 생성도 강한 권한이다.
- 서비스 계정 토큰은 만료와 파드 결속이 있는 투사 토큰이다. API를 부르지 않는 앱은 자동 마운트를 끈다.
- securityContext로 루트 실행·권한 상승·쓰기 가능한 루트 파일 시스템·capability를 없애고, Pod Security Admission으로 네임스페이스에 Baseline·Restricted를 강제한다.

관련 노트: [[kubernetes-architecture|쿠버네티스 구조와 핵심 개념]], [[kubernetes-networking|쿠버네티스 네트워킹]], [[kubernetes-storage-config|쿠버네티스 저장소와 설정]], [[docker-container-operations|Docker 컨테이너 운영]], [[devsecops|DevSecOps]], [[linux-access-control|리눅스 접근 제어]]
