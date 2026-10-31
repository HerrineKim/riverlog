---
title: "쿠버네티스 저장소와 설정: PV·PVC, ConfigMap, Secret"
concept: "Kubernetes Storage"
summary: "파드가 죽어도 남는 저장소를 요청하는 PV·PVC와 접근 모드·회수 정책, StorageClass의 동적 프로비저닝과 CSI, emptyDir·hostPath 같은 볼륨 유형, 그리고 설정과 비밀 값을 이미지 밖에서 넣는 ConfigMap·Secret의 주입 방식, Secret의 실제 보안 수준, 외부 비밀 저장소 연동, 변경이 파드에 반영되지 않는 이유와 해결법을 정리한다."
tags: ["devops", "kubernetes", "infra", "storage", "security"]
source: other
date: "2026-10-30"
sources: ["https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/kubernetes.md", "https://kubernetes.io/docs/concepts/storage/persistent-volumes/", "https://kubernetes.io/docs/concepts/storage/storage-classes/", "https://kubernetes.io/docs/concepts/storage/volumes/", "https://kubernetes.io/docs/concepts/configuration/configmap/", "https://kubernetes.io/docs/concepts/configuration/secret/", "https://kubernetes.io/docs/concepts/security/secrets-good-practices/"]
---

> fru1tworld/cs-basic 모의 면접 질문 목록의 「[Kubernetes](https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/kubernetes.md)」 항목이 묻는 개념을 쿠버네티스 공식 문서로 확인해 정리한 노트다.

컨테이너의 파일 시스템은 컨테이너가 다시 시작되면 사라진다. 쿠버네티스는 남겨야 할 데이터는 **볼륨**으로, 환경마다 다른 설정과 비밀 값은 **ConfigMap·Secret**으로 이미지 밖에 둔다. 같은 이미지를 모든 환경에 쓰려는 [[twelve-factor-app|12요소 앱]]의 원칙과 같다.

## 볼륨 유형

| 유형 | 수명 | 쓰임 |
| --- | --- | --- |
| `emptyDir` | **파드와 함께** 생기고 사라진다. 컨테이너 재시작에는 남는다 | 같은 파드의 컨테이너끼리 파일 공유(사이드카가 읽는 로그), 캐시·임시 작업 공간. `medium: Memory`면 tmpfs, `sizeLimit`으로 크기 제한 |
| `hostPath` | 노드의 디렉터리를 그대로 연결 | 노드 로그·소켓을 읽는 DaemonSet 에이전트. 파드가 다른 노드로 가면 데이터가 따라가지 않고, 노드 파일 시스템을 노출해 **보안 위험**이 크다. 일반 앱에는 쓰지 않는다 |
| `configMap` · `secret` | 오브젝트 내용을 파일로 | 설정 파일, 인증서. Secret 볼륨은 노드 디스크가 아닌 tmpfs에 놓인다 |
| `projected` | 여러 소스(ConfigMap, Secret, 서비스 계정 토큰, downward API)를 한 디렉터리에 | 앱이 한 경로에서 설정·토큰을 읽게 할 때 |
| `downwardAPI` | 파드 자신의 정보(이름, 라벨, 자원 제한)를 파일·환경 변수로 | 앱이 자기 파드 이름을 로그에 남길 때 |
| `persistentVolumeClaim` | **파드와 무관하게** 남는다 | DB 데이터, 업로드 파일 |

## PV와 PVC

| | PersistentVolume (PV) | PersistentVolumeClaim (PVC) |
| --- | --- | --- |
| 정체 | 실제 저장소(EBS 볼륨, NFS 공유 등)를 클러스터 자원으로 나타낸 것 | 「10Gi, ReadWriteOnce, 이 StorageClass」라는 **사용 요청** |
| 범위 | 클러스터 전체 | 네임스페이스 |
| 누가 만드나 | 관리자(정적) 또는 StorageClass가 자동으로(동적) | 개발자, StatefulSet의 volumeClaimTemplates |

노드(자원)와 파드(요청)의 관계처럼, PVC는 조건에 맞는 PV와 **일대일로 묶인다(binding).** 파드는 PV를 직접 모르고 PVC 이름만 가리키므로, 저장소 종류가 바뀌어도 파드 명세는 그대로다.

```text
Pod ──volumes: claimName──▶ PVC ──바인딩──▶ PV ──▶ 실제 디스크
                              └─ storageClassName ─▶ StorageClass (없으면 자동 생성)
```

### 접근 모드

| 모드 | 뜻 | 대표 저장소 |
| --- | --- | --- |
| `ReadWriteOnce` (RWO) | **노드 하나**가 읽고 쓰게 마운트. 같은 노드의 여러 파드는 함께 쓸 수 있다 | 블록 스토리지(EBS, GCE PD, Azure Disk) |
| `ReadOnlyMany` (ROX) | 여러 노드가 읽기 전용으로 | 미리 채운 데이터셋 |
| `ReadWriteMany` (RWX) | 여러 노드가 동시에 읽고 쓰게 | 파일 스토리지(NFS, EFS, CephFS) |
| `ReadWriteOncePod` (RWOP) | **파드 하나**만 읽고 쓰게 | 한 파드만 써야 하는 데이터를 강제할 때(1.29 정식) |

접근 모드는 드라이버가 지원해야 한다. 블록 볼륨은 RWX를 지원하지 않는다. RWO 볼륨을 쓰는 Deployment를 롤링 업데이트하면 새 파드가 다른 노드에 놓여 볼륨을 붙이지 못하고 멈출 수 있어, 그런 앱은 `Recreate` 전략이나 StatefulSet을 쓴다.

### 회수 정책(Reclaim Policy)

PVC를 지워 PV가 풀려났을 때 실제 저장소를 어떻게 할지 정한다.

| 정책 | 동작 | 쓰임 |
| --- | --- | --- |
| `Retain` | PV를 Released 상태로 두고 데이터를 남긴다. 다시 쓰려면 관리자가 정리하고 PV를 새로 만든다 | 운영 DB처럼 실수로 지우면 안 되는 데이터 |
| `Delete` | PV와 실제 디스크를 함께 지운다. 동적 프로비저닝의 기본값 | 다시 만들 수 있는 데이터, 개발 환경 |
| `Recycle` | 볼륨을 `rm -rf`로 비우고 재사용. **폐기 예정**이며 동적 프로비저닝으로 대신한다 | - |

## StorageClass와 동적 프로비저닝

**StorageClass는 「어떤 종류의 저장소를 어떻게 만들지」를 정의한 템플릿**이다. PVC가 StorageClass를 지정하면 해당 프로비저너가 그 자리에서 디스크를 만들고 PV를 생성해 묶는다. 관리자가 PV를 미리 만들어 둘 필요가 없다.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
  annotations: { storageclass.kubernetes.io/is-default-class: "true" }
provisioner: ebs.csi.aws.com
parameters: { type: gp3 }
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

- `volumeBindingMode: WaitForFirstConsumer`는 파드가 스케줄될 때까지 디스크 생성을 미룬다. `Immediate`면 디스크가 먼저 아무 가용 영역에 생겨, 파드가 다른 영역 노드에 놓이면 붙일 수 없다. 영역에 묶인 블록 스토리지는 WaitForFirstConsumer를 쓴다.
- `allowVolumeExpansion: true`면 PVC의 용량을 늘려 디스크를 키운다. 줄이기는 안 된다.
- 기본 StorageClass를 정해 두면 `storageClassName`을 생략한 PVC가 그것을 쓴다.

### CSI

**CSI(Container Storage Interface)는 스토리지 업체가 쿠버네티스 본체를 고치지 않고 드라이버를 붙이는 표준 인터페이스**다. 예전에는 클라우드 디스크 드라이버가 쿠버네티스 코드 안(in-tree)에 있어 업체가 고치려면 쿠버네티스 릴리스를 기다려야 했다. 지금 in-tree 드라이버는 CSI로 옮겨졌다.

| 구성 | 역할 |
| --- | --- |
| 컨트롤러 플러그인 (Deployment) | 디스크 생성·삭제, 노드에 연결(attach), 스냅숏, 확장. external-provisioner·attacher·resizer·snapshotter 사이드카가 쿠버네티스 오브젝트를 보고 드라이버를 부른다 |
| 노드 플러그인 (DaemonSet) | 노드에서 장치를 포맷하고 파드 경로에 마운트 |

대표 드라이버는 AWS EBS·EFS CSI, GCE Persistent Disk CSI, Azure Disk·File CSI, Ceph(Rook), Longhorn, NFS CSI다. CSI는 VolumeSnapshot으로 스냅숏·복원도 지원한다.

## ConfigMap

ConfigMap은 비밀이 아닌 설정을 키-값으로 저장한다. 크기는 1MiB까지다.

```bash
kubectl create configmap app --from-literal=LOG_LEVEL=info          # 키-값 직접
kubectl create configmap app --from-file=config.yaml                # 파일 하나: 키=파일 이름
kubectl create configmap app --from-file=conf/                      # 디렉터리: 파일마다 키
kubectl create configmap app --from-env-file=app.env                # KEY=VALUE 줄들을 각각 키로
```

### 주입 방식: 환경 변수 vs 볼륨

| | 환경 변수 (`env.valueFrom`, `envFrom`) | 볼륨 마운트 |
| --- | --- | --- |
| 형태 | `LOG_LEVEL=info` | `/etc/app/config.yaml` 파일 |
| 값이 바뀌면 | **반영되지 않는다.** 프로세스 시작 때 한 번 정해진다 | kubelet이 주기적으로 동기화해 **잠시 뒤 파일이 바뀐다**(수십 초~1분 남짓). `subPath`로 마운트한 파일은 바뀌지 않는다 |
| 맞는 것 | 짧은 값, 12요소 앱 스타일 | 설정 파일 통째, 인증서, 앱이 파일 변경을 감지해 다시 읽을 수 있을 때 |

## Secret

Secret은 비밀번호·토큰·인증서처럼 민감한 값을 담는다. 쓰는 방법(환경 변수, 볼륨)은 ConfigMap과 같지만 다루는 방식이 다르다.

| | ConfigMap | Secret |
| --- | --- | --- |
| 값 표현 | 평문 | base64 인코딩 |
| 노드에 놓이는 곳 | 디스크 | 메모리(tmpfs) |
| 배포 범위 | - | 그 Secret을 쓰는 파드가 있는 노드에만 |
| 권한 | 보통 넓게 열어도 된다 | RBAC로 좁게 묶는다 |

### Secret은 안전한가

**기본 상태의 Secret은 암호화가 아니다.** base64는 인코딩일 뿐 누구나 되돌린다.

| 위험 | 대책 |
| --- | --- |
| etcd에 평문으로 저장된다 | API 서버의 저장 시 암호화(EncryptionConfiguration)를 켠다. 키는 KMS v2 공급자로 클라우드 KMS에 둔다. 관리형 클러스터는 대개 이 옵션을 제공한다 |
| `get`·`list`·`watch` 권한이 있으면 값을 읽는다 | RBAC로 Secret 읽기 권한을 최소화한다. `list`도 내용을 돌려주므로 읽기 권한과 같다 |
| 네임스페이스에 **파드를 만들 수 있으면** 그 네임스페이스의 Secret을 마운트해 읽을 수 있다 | 파드 생성 권한도 Secret 접근 권한으로 보고 관리한다 |
| Git에 매니페스트로 커밋된다 | 평문 Secret을 커밋하지 않는다. Sealed Secrets·SOPS로 암호화하거나 외부 저장소를 쓴다 |
| 환경 변수는 로그·크래시 덤프·자식 프로세스로 새기 쉽다 | 가능하면 파일(볼륨)로 넣는다 |

### Secret 유형

| `type` | 내용 | 쓰임 |
| --- | --- | --- |
| `Opaque` (기본값) | 임의의 키-값 | DB 비밀번호, API 키 |
| `kubernetes.io/dockerconfigjson` | `.dockerconfigjson` 키에 레지스트리 인증 정보 | 파드의 `imagePullSecrets`로 비공개 레지스트리에서 이미지 받기 |
| `kubernetes.io/tls` | `tls.crt`, `tls.key` | Ingress·Gateway의 TLS 인증서. cert-manager가 만든다 |
| `kubernetes.io/basic-auth` · `ssh-auth` | 사용자 이름·비밀번호 / SSH 개인 키 | 형식을 검증하고 용도를 드러낸다 |
| `kubernetes.io/service-account-token` | 서비스 계정 토큰 | 과거 방식. 지금은 파드에 시간 제한이 있는 토큰을 투사(projected)한다([[kubernetes-security\|쿠버네티스 보안]]) |

### 외부 비밀 저장소 연동

비밀의 원본을 Vault, AWS Secrets Manager, GCP Secret Manager 같은 전용 저장소에 두면 교체·감사·접근 제어를 한곳에서 한다.

| 방식 | 동작 | 특징 |
| --- | --- | --- |
| External Secrets Operator | ExternalSecret·SecretStore 리소스를 보고 외부 값을 주기적으로 가져와 쿠버네티스 Secret으로 **동기화** | 앱은 평범한 Secret을 쓴다. 값이 etcd에도 놓인다 |
| Secrets Store CSI Driver | 파드가 뜰 때 외부 값을 **볼륨으로 직접 마운트** | etcd를 거치지 않는다. 선택적으로 Secret 동기화도 된다 |
| Vault Agent Injector | 사이드카·초기화 컨테이너가 Vault에서 값을 받아 파일로 쓰고 갱신 | 동적 비밀(짧게 사는 DB 계정)에 맞다 |

외부 저장소에 접근하는 권한은 노드 전체가 아니라 파드의 서비스 계정에 묶는다(EKS의 IRSA·Pod Identity, GKE Workload Identity). 비밀 관리 원칙은 [[devsecops|DevSecOps]]에 있다.

### 변경이 파드에 반영되지 않는 문제

ConfigMap·Secret을 고쳐도 환경 변수는 그대로고, 파일은 바뀌어도 앱이 시작할 때 한 번만 읽었다면 반영되지 않는다. 쿠버네티스는 설정이 바뀌었다고 파드를 다시 띄우지 않는다.

| 해결 | 방법 |
| --- | --- |
| 수동 재시작 | `kubectl rollout restart deploy/api`. 롤링으로 새 파드가 새 값을 읽는다 |
| 템플릿에 해시 넣기 | Helm에서 `annotations: checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . \| sha256sum }}`. 설정이 바뀌면 파드 템플릿이 바뀌어 자동 롤아웃된다 |
| 이름에 해시 붙이기 | Kustomize의 `configMapGenerator`가 `app-config-7f9b2` 같은 새 이름을 만들고 참조를 바꾼다. 옛 설정이 남아 롤백도 된다. `immutable: true`와 잘 맞는다 |
| 감시 컨트롤러 | Reloader 같은 컨트롤러가 ConfigMap·Secret 변경을 보고 관련 워크로드를 재시작한다 |
| 앱이 파일을 다시 읽기 | 볼륨 마운트(subPath 없이) + 파일 변경 감지. 재시작 없이 반영된다 |

`immutable: true`인 ConfigMap·Secret은 고칠 수 없는 대신 kubelet이 변경을 감시하지 않아 API 서버 부하가 준다.

## 정리

- 파드와 같이 사라져도 되면 emptyDir, 남겨야 하면 PVC다. hostPath는 노드 에이전트 전용이다.
- PVC는 요청, PV는 실제 저장소이고, StorageClass가 있으면 PV가 자동으로 만들어진다. 영역에 묶인 디스크는 WaitForFirstConsumer로 만든다.
- 접근 모드는 RWO(노드 하나)·ROX·RWX·RWOP(파드 하나)이고, 회수 정책은 지킬 데이터면 Retain이다.
- ConfigMap·Secret을 환경 변수로 넣으면 바뀌어도 반영되지 않는다. 롤아웃을 일으키는 해시 패턴을 쓴다.
- Secret은 기본적으로 base64일 뿐이다. 저장 시 암호화, 좁은 RBAC, 외부 비밀 저장소로 보완한다.

관련 노트: [[kubernetes-architecture|쿠버네티스 구조와 핵심 개념]], [[kubernetes-workloads|쿠버네티스 워크로드와 파드 생명주기]], [[kubernetes-security|쿠버네티스 보안]], [[docker-network-volume|Docker 네트워크와 볼륨]], [[devsecops|DevSecOps]], [[twelve-factor-app|12요소 앱]]
