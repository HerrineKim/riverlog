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

| 노트 | 내용 |
| --- | --- |
| [VM과 컨테이너](/knowledge/dictionary/devops/vm-vs-container) | VM과 Docker 컨테이너 비교, 오케스트레이션·오토 스케일링과 쿠버네티스가 표준이 된 이유 |
| [Dockerfile 작성과 컨테이너의 PID 1](/knowledge/dictionary/devops/dockerfile) | 이미지와 컨테이너, RUN·CMD·ENTRYPOINT, Alpine vs Debian, 컨테이너가 바로 꺼지는 이유와 tini |
| [Docker Compose](/knowledge/dictionary/devops/docker-compose) | compose.yaml의 주요 키, 네트워크 드라이버, named volume·bind mount, 점검 명령 |
| [CI/CD](/knowledge/dictionary/devops/ci-cd) | 지속적 통합·배포의 의미, Docker와 함께 쓰는 흐름, GitHub Actions 예시와 도구 |
| [AWS 클라우드 기초](/knowledge/dictionary/devops/aws-cloud-basics) | 클라우드의 이점, 리전·가용 영역, EC2 인스턴스와 요금 모델, ECS·EKS·Lambda, IaC |
| [AWS RDS 외부 접속 허용](/knowledge/dictionary/devops/rds-security-group) | 보안 그룹 인바운드 규칙으로 내 IP만 DB 포트에 접근 허용, 배스천 SSH 터널 접속 |
| [스타트업 인프라 결정: 지지와 후회](/knowledge/dictionary/devops/startup-infra-decisions) | AWS·EKS·Terraform·관측 도구 결정 사례와 거기서 뽑은 판단 기준 |
| [쿠버네티스 위 웹 서비스의 요청 경로](/knowledge/dictionary/devops/kubernetes-request-path) | 로드 밸런서·게이트웨이·서비스 메시를 거쳐 파드에 닿는 요청 경로, Terraform·Helm·Istio·Prometheus·Grafana의 역할 |

서비스 전체의 데이터 흐름 속에서 DevOps가 차지하는 자리는 [Data Flow 아키텍처](/knowledge/dictionary/backend/architecture/data-flow)에서 함께 볼 수 있다. 모바일 앱의 OTA 배포는 [CodePush](/knowledge/dictionary/frontend/mobile/codepush) 참고.
