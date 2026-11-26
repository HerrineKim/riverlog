---
title: "쿠버네티스"
concept: "Kubernetes"
summary: "클러스터 구조, 요청 경로, 워크로드, 네트워크, 저장소, 스케줄링, 보안, 운영."
tags: ["devops","kubernetes","container"]
source: mixed
date: "2026-11-26"
---

쿠버네티스 노트는 컨테이너를 여러 머신에서 선언적으로 돌리는 법을 나눈다. 클러스터 구조, 요청이 파드에 닿는 경로, 워크로드, 네트워크, 저장소와 설정, 스케줄링, 보안, 운영이 여기 있다.

## 하위 노트

- [쿠버네티스 구조와 핵심 개념](DevOps/Kubernetes/kubernetes-architecture.md): 컨트롤 플레인과 노드의 구성 요소, 파드·워크로드 리소스, 서비스 네 유형, 디자인 패턴, kubectl
- [쿠버네티스 위 웹 서비스의 요청 경로와 구성 요소](DevOps/Kubernetes/kubernetes-request-path.md): 로드 밸런서·게이트웨이·서비스 메시를 거쳐 파드에 닿는 요청 경로, Terraform·Helm·Istio·Prometheus·Grafana의 역할
- [쿠버네티스 워크로드와 파드 생명주기](DevOps/Kubernetes/kubernetes-workloads.md): 파드 단계와 컨테이너 상태, 재시작 정책, 프로브, 사이드카·앰버서더·어댑터·초기화 컨테이너, Deployment·StatefulSet·DaemonSet·Job·CronJob
- [쿠버네티스 네트워킹: 서비스, DNS, Ingress, NetworkPolicy](DevOps/Kubernetes/kubernetes-networking.md): CNI, kube-proxy 모드, 서비스 유형 세부, CoreDNS, 이그레스, Ingress·Gateway API, NetworkPolicy, Istio·Linkerd, 연결 문제 진단
- [쿠버네티스 저장소와 설정: PV·PVC, ConfigMap, Secret](DevOps/Kubernetes/kubernetes-storage-config.md): 볼륨 유형, 접근 모드·회수 정책, StorageClass·CSI, ConfigMap·Secret 주입과 보안 수준, 외부 비밀 저장소, 변경 반영 문제
- [쿠버네티스 스케줄링과 자원 관리, 오토스케일링](DevOps/Kubernetes/kubernetes-scheduling-resources.md): 어피니티·토폴로지 분산·테인트, requests·limits와 QoS, LimitRange·ResourceQuota·PriorityClass, HPA·VPA·Cluster Autoscaler
- [쿠버네티스 보안: 인증, RBAC, 서비스 계정, 파드 보안](DevOps/Kubernetes/kubernetes-security.md): 인증 방식과 kubeconfig, RBAC와 최소 권한, 서비스 계정 토큰, securityContext, Pod Security Standards·Admission
- [쿠버네티스 운영: Helm, 업그레이드, 관측, 장애 진단, 오퍼레이터, GitOps](DevOps/Kubernetes/kubernetes-operations.md): Helm 차트·훅, 버전 업그레이드·etcd 백업, drain·PDB, 로그·지표, CrashLoopBackOff·ImagePullBackOff·kubectl debug, CRD·오퍼레이터, Argo CD·Flux, 멀티 클러스터
