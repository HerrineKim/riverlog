---
title: "DevOps"
concept: "DevOps"
summary: "개발한 서비스를 안정적으로 빌드·배포·운영하기 위한 인프라와 자동화 지식 모음."
tags: ["devops", "ci-cd", "docker", "infra"]
source: notion
date: "2026-11-26"
readingOrder:
  - { label: "컨테이너", topics: ["Docker", "Kubernetes"] }
  - { label: "클라우드", topics: ["Cloud"] }
  - { label: "배포", topics: ["Delivery"] }
  - { label: "운영", topics: ["Operations"] }
---

DevOps는 개발(Development)과 운영(Operations) 사이의 벽을 줄여, 코드가 사용자에게 닿기까지의 과정을 빠르고 안전하게 만드는 문화이자 기술 묶음이다. 사람이 손으로 하던 빌드·테스트·배포를 파이프라인으로 자동화하고(CI/CD), 애플리케이션을 컨테이너로 포장해 어디서나 같은 방식으로 실행되게 하며, 트래픽에 따라 서버를 늘리고 줄이는 일이 여기에 속한다. 애자일로 배포 주기가 짧아지자 자주 배포하려는 개발 조직과 변경을 줄이려는 운영 조직의 갈등이 커졌고, 반복 작업을 기계가 매번 같은 방식으로 하게 만들어 잦은 배포와 안정성을 함께 얻으려는 데서 DevOps가 나왔다.

## 하위 주제

| 주제 | 내용 |
| --- | --- |
| [Docker](DevOps/Docker.md) | VM과 컨테이너, Dockerfile, Compose, 네트워크·볼륨, 운영 |
| [쿠버네티스](DevOps/Kubernetes.md) | 클러스터 구조, 요청 경로, 워크로드, 네트워크, 저장소, 스케줄링, 보안, 운영 |
| [클라우드](DevOps/Cloud.md) | AWS와 서비스 지도, VPC, Lambda, 서버리스, Terraform·Packer, 비용과 계약 |
| [배포 자동화](DevOps/Delivery.md) | CI/CD, 배포 전략, 12요소 앱, Temporal 내구성 워크플로 |
| [운영](DevOps/Operations.md) | 관측, 장애 진단과 포스트모템, 출시 체크리스트, 재해 복구, 시크릿, 플랫폼 엔지니어링, ChatOps |

서비스 전체의 데이터 흐름 속에서 DevOps가 차지하는 자리는 [웹 확장성의 구성 요소](/knowledge/dictionary/backend/system-architecture/web-scalability-components)에서 함께 볼 수 있다. 모바일 앱의 OTA 배포는 [CodePush](/knowledge/dictionary/frontend/mobile/codepush) 참고.
