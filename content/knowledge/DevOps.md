---
title: "DevOps"
concept: "DevOps"
summary: "개발한 서비스를 안정적으로 빌드·배포·운영하기 위한 인프라와 자동화 지식 모음."
tags: ["devops", "ci-cd", "docker", "infra"]
source: notion
date: "2026-10-14"
---

DevOps는 개발(Development)과 운영(Operations) 사이의 벽을 줄여, 코드가 사용자에게 닿기까지의 과정을 빠르고 안전하게 만드는 문화이자 기술 묶음이다. 사람이 손으로 하던 빌드·테스트·배포를 파이프라인으로 자동화하고(CI/CD), 애플리케이션을 컨테이너로 포장해 어디서나 같은 방식으로 실행되게 하며, 트래픽에 따라 서버를 늘리고 줄이는 일이 여기에 속한다. 애자일로 배포 주기가 짧아지자 자주 배포하려는 개발 조직과 변경을 줄이려는 운영 조직의 갈등이 커졌고, 반복 작업을 기계가 매번 같은 방식으로 하게 만들어 잦은 배포와 안정성을 함께 얻으려는 데서 DevOps가 나왔다.

## 노트

### 컨테이너·쿠버네티스

| 노트 | 내용 |
| --- | --- |
| [VM과 컨테이너](/knowledge/dictionary/devops/vm-vs-container) | VM과 Docker 컨테이너 비교, 오케스트레이션·오토 스케일링과 쿠버네티스가 표준이 된 이유 |
| [Dockerfile 작성과 컨테이너의 PID 1](/knowledge/dictionary/devops/dockerfile) | 이미지와 컨테이너, RUN·CMD·ENTRYPOINT, Alpine vs Debian, 컨테이너가 바로 꺼지는 이유와 tini |
| [Docker Compose](/knowledge/dictionary/devops/docker-compose) | compose.yaml의 주요 키, 네트워크 드라이버, named volume·bind mount, 점검 명령 |
| [쿠버네티스 구조와 핵심 개념](/knowledge/dictionary/devops/kubernetes-architecture) | 컨트롤 플레인과 노드의 구성 요소, 파드·워크로드 리소스, 서비스 네 유형, 디자인 패턴, kubectl |
| [쿠버네티스 위 웹 서비스의 요청 경로](/knowledge/dictionary/devops/kubernetes-request-path) | 로드 밸런서·게이트웨이·서비스 메시를 거쳐 파드에 닿는 요청 경로, Terraform·Helm·Istio·Prometheus·Grafana의 역할 |

### 배포·운영

| 노트 | 내용 |
| --- | --- |
| [CI/CD](/knowledge/dictionary/devops/ci-cd) | 지속적 통합·배포의 의미, Docker와 함께 쓰는 흐름, GitHub Actions 예시와 도구 |
| [배포 전략: 롤링, 블루-그린, 카나리, 섀도, 피처 토글](/knowledge/dictionary/devops/deployment-strategies) | 다운타임·롤백 속도·비용·노출 범위로 비교한 배포 방식, 배포와 출시 분리 |
| [12요소 앱](/knowledge/dictionary/devops/twelve-factor-app) | 설정·백엔드 서비스·폐기 가능성·개발·운영 일치 같은 열두 원칙과 지금의 구현 |
| [관측 가능성: 로그, 트레이스, 메트릭](/knowledge/dictionary/devops/observability) | 세 기둥의 차이, OpenTelemetry, 풀·푸시 수집, 시계열 DB |
| [서버 장애 진단 패턴](/knowledge/dictionary/devops/server-incident-diagnosis) | load average·I/O 지표, 힙 덤프, 커넥션·DNS·쿼리·Redis 메모리 장애 유형 |
| [장애 대응과 포스트모템](/knowledge/dictionary/devops/incident-postmortem) | 탐지 → 전파 → 해결 → 보고 → 회고, 임시 조치, 비난 없는 포스트모템과 액션 아이템 |
| [고가용성과 재해 복구 설계](/knowledge/dictionary/devops/disaster-recovery) | HA와 DR의 차이, RTO·RPO, 백업·파일럿 라이트·웜 스탠바이·액티브-액티브, 운영 도구까지 포함한 전 계층 다중화와 전환 훈련 |

### 클라우드

| 노트 | 내용 |
| --- | --- |
| [AWS 클라우드 기초](/knowledge/dictionary/devops/aws-cloud-basics) | 클라우드의 이점, 리전·가용 영역, EC2 인스턴스와 요금 모델, ECS·EKS·Lambda, 보안 그룹과 RDS 접속(배스천 SSH 터널), IaC |
| [클라우드 서비스 지도: AWS·Azure·GCP 대응표](/knowledge/dictionary/devops/cloud-services-map) | 범주별 서비스 대응표, AWS 학습 순서, 클라우드 로드 밸런서, 모니터링 기능 |
| [클라우드 네이티브와 코드형 인프라](/knowledge/dictionary/devops/cloud-native) | 클라우드 네이티브의 네 축, IaaS·PaaS·컨테이너 변천, CNCF 랜드스케이프, IaC·GitOps |
| [AWS VPC 네트워크 구성](/knowledge/dictionary/devops/aws-vpc-networking) | 서브넷·라우팅, 인터넷 게이트웨이·NAT, VPN·Direct Connect, 피어링·Transit Gateway, PrivateLink |
| [AWS Lambda의 내부 구조](/knowledge/dictionary/devops/aws-lambda-internals) | 동기·비동기 호출 경로, 실행 환경 배정, Firecracker 마이크로VM, 청크 저장, SnapStart |
| [Terraform: 코드로 클라우드 인프라 만들기](/knowledge/dictionary/devops/terraform-workflow) | write → init → plan → apply, 상태 파일과 원격 백엔드·잠금, 모듈, 드리프트, CI 운영 |
| [클라우드 비용 최적화와 숨은 비용](/knowledge/dictionary/devops/cloud-cost-optimization) | 비용을 줄이는 여섯 방법, 공인 IPv4·유휴 자원·송신 전송 같은 숨은 비용 |
| [스타트업 인프라 선택 원칙](/knowledge/dictionary/devops/startup-infra-decisions) | 데이터는 관리형, 단순한 도구, 관측 표준·IdP·비용 추적은 처음부터 같은 인프라 결정 기준 |

### 조직·문화

| 노트 | 내용 |
| --- | --- |
| [DevOps, SRE, 플랫폼 엔지니어링, NoOps](/knowledge/dictionary/devops/devops-sre-platform-engineering) | 협업 문화, SLO·에러 버짓, 내부 플랫폼, 서버리스 지향의 차이 |
| [DevSecOps: 개발 흐름에 보안을 넣기](/knowledge/dictionary/devops/devsecops) | 위협 모델링, 코드·의존성·이미지·IaC 자동 검사, 비밀 관리, 취약점 관리 |

서비스 전체의 데이터 흐름 속에서 DevOps가 차지하는 자리는 [웹 확장성의 구성 요소](/knowledge/dictionary/backend/architecture/web-scalability-components)에서 함께 볼 수 있다. 모바일 앱의 OTA 배포는 [CodePush](/knowledge/dictionary/frontend/mobile/codepush) 참고.
