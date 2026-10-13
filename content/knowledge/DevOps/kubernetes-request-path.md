---
title: "쿠버네티스 위 웹 서비스의 요청 경로와 구성 요소"
concept: "Cloud Native Stack"
summary: "브라우저 요청이 로드 밸런서, 게이트웨이, 서비스 메시를 거쳐 파드의 컨테이너에 닿고, 그 트래픽이 Prometheus·Grafana로 관측되기까지의 경로와 각 구성 요소(Terraform, Kubernetes, Helm, Istio, API 게이트웨이)의 역할을 프론트엔드 개발자 관점에서 정리했다."
tags: ["devops", "infra", "kubernetes", "msa", "monitoring"]
source: other
date: "2026-10-13"
sources: ["https://blog.mathpresso.com/modern-frontend-infrastructure-overview-99b5a8c669df"]
---

> 여울(Team QANDA)의 「[Modern Frontend Infrastructure Overview](https://blog.mathpresso.com/modern-frontend-infrastructure-overview-99b5a8c669df)」(2023.02)를 바탕으로 재구성한 노트입니다.

## 프론트엔드 개발자가 인프라 경로를 알아야 하는 이유

서버 컴포넌트, 스트리밍 SSR, 엣지 렌더링이 보편화되면서 프론트엔드 코드가 **서버에서 도는 비중**이 커졌다. 그러면 「이 변경이 서버 요청을 늘리나」, 「어디서 캐시되나」, 「느린 건 앱인가 네트워크인가」를 답해야 한다. 그러려면 요청이 어떤 구성 요소를 지나 앱에 닿고, 각 지점의 트래픽을 어디서 보는지 알아야 한다.

## 요청 경로 한눈에

```text
브라우저
  │
External Load Balancer        ─ 클라우드가 만든 공인 IP
  │
Ingress / Gateway             ─ 클러스터 입구. TLS 종료, 호스트·경로 라우팅
  │                              (Istio Ingress Gateway, Kubernetes Gateway API 구현체)
API Gateway (선택)             ─ 인증, 레이트 리밋, L7 라우팅 (Kong 등)
  │
Service                       ─ 같은 앱의 여러 파드로 로드 밸런싱
  │
Pod ┬ 프록시 (사이드카 또는 노드 프록시) ─ 트래픽 관측·보안·재시도
    └ 앱 컨테이너 (예: Next.js 서버)
  │
응답은 같은 길을 거슬러 나간다

관측: 각 프록시의 지표 ──scrape──▶ Prometheus ──query──▶ Grafana 대시보드
```

## 구성 요소

| 구성 요소 | 한 줄 정의 | 익숙한 비유 |
| --- | --- | --- |
| Terraform / OpenTofu | 클라우드 자원(클러스터, 레지스트리, 권한)을 코드로 선언하면 그 상태를 만들어 주는 IaC 도구 | 인프라의 `package.json` + 설치 명령 |
| Kubernetes | 컨테이너의 배포·확장·재시작·롤백을 선언적으로 관리하는 오케스트레이터 | 컨테이너용 운영체제 |
| Helm | 쿠버네티스 리소스 묶음을 템플릿과 값(values)으로 나눠 버전 관리하는 패키지 관리자 | 쿠버네티스의 npm |
| 서비스 메시 (Istio, Linkerd) | 앱 코드를 고치지 않고 관측, 트래픽 관리, 서비스 간 mTLS를 붙이는 인프라 계층 | 모든 요청에 끼우는 미들웨어 |
| API 게이트웨이 (Kong 등) | 여러 백엔드 앞에서 인증과 경로 기반 라우팅을 맡는 관문 | 리버스 프록시 + 인증 미들웨어 |
| Prometheus | 대상에서 지표를 주기적으로 긁어(scrape) 시계열로 저장하는 모니터링 시스템 | 지표 DB |
| Grafana | 지표·로그·트레이스를 질의해 대시보드와 알림을 만드는 시각화 도구 | 지표 DB의 프론트엔드 |

이 생태계의 많은 프로젝트(Kubernetes, Helm, Istio, Prometheus, OpenTelemetry)는 리눅스 재단 산하 **CNCF**(Cloud Native Computing Foundation)에서 관리한다. Terraform은 HashiCorp 제품이고, 2023년 라이선스가 비오픈소스(BSL)로 바뀐 뒤 커뮤니티 포크인 OpenTofu가 리눅스 재단에서 이어지고 있다.

### Kubernetes 리소스와 Helm

컨테이너 하나를 서비스하려 해도 리소스가 여러 개 필요하다.

| 리소스 | 역할 |
| --- | --- |
| Pod | 컨테이너가 실제로 도는 가장 작은 단위 |
| Deployment | 파드를 몇 개, 어떤 이미지로 띄울지 선언. 롤링 업데이트와 롤백 |
| Service | 파드 집합 앞의 고정 주소와 로드 밸런싱 |
| HorizontalPodAutoscaler | 부하에 따라 파드 수를 조절 |
| Namespace, ServiceAccount | 격리 단위와 권한 |

리소스마다 이미지 태그, 이름, 네임스페이스가 반복된다. Helm 차트는 이를 **템플릿 + values.yaml**로 나눈다. 새 이미지를 배포할 때는 values의 태그만 바꾸고 `helm upgrade`하면 차트의 새 리비전이 생기고, 문제가 생기면 이전 리비전으로 되돌린다.

### 서비스 메시: 사이드카와 앰비언트

서비스 메시는 앱으로 들어오고 나가는 모든 트래픽을 프록시에 통과시켜, 앱을 고치지 않고 지연 시간, 응답 코드, 요청 수를 수집하고 보안·재시도 정책을 적용한다.

| 방식 | 구조 | 특징 |
| --- | --- | --- |
| 사이드카 | 파드마다 앱 컨테이너 옆에 프록시(Envoy) 컨테이너를 주입. 네임스페이스에 `istio-injection=enabled` 라벨을 붙이면 새 파드에 자동 주입된다 | 기능이 풍부하지만 파드마다 메모리·지연 비용이 든다 |
| 앰비언트 | 노드마다 공용 L4 프록시(ztunnel)를 두고, L7 기능이 필요한 곳에만 waypoint 프록시를 둔다 | 사이드카 비용이 없고 파드 재시작 없이 붙인다. Istio 1.24(2024.11)에서 정식 지원 |

Istio는 Prometheus용 지표 노출을 기본으로 켜 두기 때문에, Prometheus를 설치하면 별도 설정 없이 프록시 지표가 수집된다.

### 클러스터 입구: Ingress에서 Gateway API로

클러스터 밖 트래픽을 받는 방식은 **Kubernetes Gateway API**가 표준이 되고 있다. 기존 Ingress 리소스는 호스트·경로 라우팅만 표현할 수 있어 기능마다 구현체 전용 어노테이션이 필요했다. Gateway API는 역할별 리소스(GatewayClass, Gateway, HTTPRoute)로 나뉘고 가중치 분배, 헤더 매칭 같은 기능을 명세에 담았다. 2023년 v1.0이 나왔고, Istio·Envoy Gateway·Kong·Cilium 등이 구현한다. 널리 쓰이던 커뮤니티 Ingress NGINX 컨트롤러는 2026년 3월 유지보수가 끝났다.

## 관측: 무엇을 보면 되나

| 지표 | 보는 곳 | 프론트엔드에서의 의미 |
| --- | --- | --- |
| 요청 수(RPS) | 게이트웨이, 앱 프록시 | 서버 컴포넌트·SSR 변경이 서버 호출을 늘렸는가 |
| 지연 시간 p50·p95·p99 | 구간별 프록시 | 느린 구간이 게이트웨이인지 앱인지 |
| 응답 코드 비율 | 게이트웨이 | 배포 직후 5xx 증가 |
| 파드 수, CPU·메모리 | Kubernetes, HPA | 렌더링 부하로 오토스케일이 일어나는가 |

지표 외에 로그와 분산 트레이스까지 한 표준으로 모으려면 **OpenTelemetry**로 계측하고, Grafana에서 지표(Prometheus)·로그(Loki)·트레이스(Tempo)를 함께 본다.

## 학습용 구성 순서

```text
1. Terraform/OpenTofu로 관리형 클러스터 생성 (GKE·EKS·AKS)
   └ 비용이 크므로 쓰고 나면 destroy
2. 서비스 메시 설치 (Helm으로 istio base → istiod → gateway)
3. 앱을 컨테이너 이미지로 빌드해 레지스트리에 푸시
4. 앱 Helm 차트 설치 (Deployment·Service·HPA)
5. 게이트웨이 라우트로 외부에 노출
6. Prometheus·Grafana 설치 후 트래픽을 흘려 대시보드 확인
```

## 정리

- 요청은 로드 밸런서 → 게이트웨이 → (API 게이트웨이) → 서비스 → 파드의 프록시 → 앱 순으로 흐르고, 프록시마다 지표가 쌓인다.
- Terraform은 클라우드 자원을, Kubernetes는 컨테이너를, Helm은 리소스 묶음을, 서비스 메시는 서비스 간 트래픽을 맡는다.
- 클러스터 입구는 Ingress에서 **Gateway API**로, 서비스 메시는 사이드카에서 **앰비언트** 방식으로 옮겨 가고 있다.
- 서버에서 도는 프론트엔드 코드가 늘수록, 요청 경로와 지표를 직접 읽을 줄 아는 것이 성능 작업의 출발점이다.

관련 노트: [[vm-vs-container|VM과 컨테이너]], [[startup-infra-decisions|스타트업 인프라 결정: 지지와 후회]], [[ci-cd|CI/CD]]
