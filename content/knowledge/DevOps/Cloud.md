---
title: "클라우드"
concept: "Cloud"
summary: "AWS를 중심으로 한 서비스 모델과 네트워크, 서버리스, 정적 호스팅, Terraform·Packer, 비용과 계약."
tags: ["devops","cloud","aws"]
source: mixed
date: "2026-11-26"
---

클라우드 노트는 인프라를 빌려 쓰는 선택과 그 운영을 다룬다. AWS의 서비스 모델과 네트워크, 서버리스, 정적 사이트 호스팅, Terraform과 Packer, 비용·계약, 스타트업과 가정용 서버의 경계가 여기 있다.

## 하위 노트

- [클라우드 기초와 AWS: 서비스 모델, 인프라, 컴퓨팅, 보안 그룹](DevOps/Cloud/aws-cloud-basics.md): 클라우드의 이점과 NIST 다섯 특징, 배포 모델, IaaS·PaaS·SaaS와 공동 책임 모델, 받치는 기술(가상화·SDN·NFV), 리전·가용 영역, EC2 인스턴스와 요금 모델, ECS·EKS·Lambda, 보안 그룹과 RDS 접속(배스천 SSH 터널), IaC
- [클라우드 서비스 지도: AWS·Azure·GCP 대응표](DevOps/Cloud/cloud-services-map.md): 범주별 서비스 대응표, AWS 학습 순서, 클라우드 로드 밸런서, 빅데이터 파이프라인과 Hadoop·Spark, 모니터링 기능
- [클라우드 네이티브와 코드형 인프라](DevOps/Cloud/cloud-native.md): 클라우드 네이티브의 네 축, IaaS·PaaS·컨테이너 변천, CNCF 랜드스케이프, IaC·GitOps
- [AWS VPC 네트워크 구성](DevOps/Cloud/aws-vpc-networking.md): 서브넷·라우팅, 인터넷 게이트웨이·NAT, VPN·Direct Connect, 피어링·Transit Gateway, PrivateLink
- [AWS Lambda의 내부 구조](DevOps/Cloud/aws-lambda-internals.md): 동기·비동기 호출 경로, 실행 환경 배정, Firecracker 마이크로VM, 청크 저장, SnapStart
- [서버리스 아키텍처](DevOps/Cloud/serverless-architecture.md): IaaS·PaaS·컨테이너와 차이, FaaS·BaaS, 함수 호출 경로와 코드 구성 방식, 콜드 스타트 같은 제약과 맞는 곳
- [S3·CloudFront로 정적 사이트 배포하기](DevOps/Cloud/s3-cloudfront-static-hosting.md): 비공개 S3 + OAC, ACM·Route 53 도메인, SPA 라우팅, 캐시 헤더와 무효화, GitHub Actions OIDC 배포
- [Terraform: 코드로 클라우드 인프라 만들기](DevOps/Cloud/terraform-workflow.md): write → init → plan → apply, 상태 파일과 원격 백엔드·잠금, 모듈, 드리프트, CI 운영
- [Packer와 머신 이미지 굽기](DevOps/Cloud/packer-machine-image.md): 소스·프로비저너·후처리기 빌드 흐름, HCL2 템플릿과 packer init, Dockerfile과의 차이, 골든 이미지·굽기 vs 볶기·불변 인프라
- [클라우드 비용 최적화와 숨은 비용](DevOps/Cloud/cloud-cost-optimization.md): 비용을 줄이는 여섯 방법, 공인 IPv4·유휴 자원·송신 전송 같은 숨은 비용
- [스타트업 인프라 선택 원칙](DevOps/Cloud/startup-infra-decisions.md): 데이터는 관리형, 단순한 도구, 관측 표준·IdP·비용 추적은 처음부터 같은 인프라 결정 기준
- [가정용 장비로 서비스 호스팅하기: 한계와 무료 클라우드 대안](DevOps/Cloud/home-server-hosting.md): 노트북·가정용 PC 서버의 한계, 봇·캐싱·정적 파일·커널 한도 점검, 저가 VPS와 OCI Always Free 한도
- [클라우드 SLA·계약과 규제: 품질 지표, 도입 판단, 계약, 클라우드컴퓨팅법](DevOps/Cloud/cloud-sla-and-contract.md): 가용성·응답성 지표, 서비스 크레딧, 이전 대상 고르기, 출구 전략, 계약 체크리스트, 클라우드컴퓨팅법의 이용자 권리와 공공·금융·의료·교육 분야 규정
