---
title: "DevOps"
concept: "DevOps"
summary: "개발한 서비스를 안정적으로 빌드·배포·운영하기 위한 인프라와 자동화 지식 모음."
tags: ["devops", "ci-cd", "docker", "infra"]
source: notion
---

DevOps는 개발(Development)과 운영(Operations) 사이의 벽을 줄여, 코드가 사용자에게 닿기까지의 과정을 빠르고 안전하게 만드는 문화이자 기술 묶음이다. 사람이 손으로 하던 빌드·테스트·배포를 파이프라인으로 자동화하고(CI/CD), 애플리케이션을 컨테이너로 포장해 어디서나 같은 방식으로 실행되게 하며, 트래픽에 따라 서버를 늘리고 줄이는 일이 여기에 속한다.

## 노트

| 노트 | 내용 |
| --- | --- |
| [VM과 컨테이너](/knowledge/dictionary/devops/vm-vs-container) | VM과 Docker 컨테이너 비교, 오토 스케일링, 컨테이너 오케스트레이션 |
| [CI/CD](/knowledge/dictionary/devops/ci-cd) | 지속적 통합·배포의 의미와 GitLab CI/CD 같은 도구 |
| [AWS RDS 외부 접속 허용](/knowledge/dictionary/devops/aws/rds-security-group) | 보안 그룹 인바운드 규칙으로 내 IP만 DB 포트에 접근 허용 |

서비스 전체의 데이터 흐름 속에서 DevOps가 차지하는 자리는 [Data Flow 아키텍처](/knowledge/dictionary/backend/architecture/data-flow)에서 함께 볼 수 있다. 모바일 앱의 OTA 배포는 [CodePush](/knowledge/dictionary/frontend/mobile/codepush) 참고.
