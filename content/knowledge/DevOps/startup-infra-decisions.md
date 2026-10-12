---
title: "스타트업 인프라 결정: 지지와 후회"
concept: "Infra Decisions"
summary: "스타트업 인프라를 4년 운영한 사람이 매긴 결정별 지지·후회 목록을 주제별로 다시 묶었다. 데이터는 관리형에 돈을 쓰고, 단순한 도구를 고르고, 표준(OpenTelemetry·IdP)과 비용 추적은 처음부터 들인다."
tags: ["devops", "infra", "aws", "architecture", "tools"]
source: other
date: "2026-10-12"
sources: ["https://cep.dev/posts/every-infrastructure-decision-i-endorse-or-regret-after-4-years-running-infrastructure-at-a-startup/", "https://news.hada.io/topic?id=13564"]
---

> GeekNews의 요약 「[스타트업에서 4년간 인프라를 운영하며 좋았던/후회하는 (거의) 모든 인프라 결정들](https://news.hada.io/topic?id=13564)」(2024.02)을 요약·재구성한 노트입니다. 원 자료는 Jack Lindamood의 「[(Almost) Every infrastructure decision I endorse or regret after 4 years running infrastructure at a startup](https://cep.dev/posts/every-infrastructure-decision-i-endorse-or-regret-after-4-years-running-infrastructure-at-a-startup/)」(2024.02)입니다. 도구 평가와 가격은 글 작성 시점 기준이라 지금은 바뀌었을 수 있습니다.

## 어떤 글인가

빠르게 커진 AI 스타트업에서 인프라를 4년 동안 맡은 사람이, 초기에 내린 결정 하나하나에 **지지(Endorse)** 또는 **후회(Regret)를** 매긴 목록이다. 개별 도구 평가보다 그 밑에 깔린 판단 기준이 더 쓸모 있다.

## 판단 기준

| 기준 | 근거가 된 결정 |
| --- | --- |
| **데이터에는 돈을 아끼지 않는다** | RDS 지지. 데이터가 인프라에서 가장 중요하다 |
| **단순한 것이 낫다** | 서비스 메시·Pulumi/CDK 안 쓴 것 후회 없음. Jira → Linear 지지 |
| **커스터마이즈 여지를 남긴다** | EKS 관리형 애드온 후회 → Helm 차트로 옮긴 뒤 나아짐 |
| **표준은 처음부터** | OpenTelemetry 없이 Datadog API에 바로 붙인 것 후회 |
| **늦게 들이면 비싸지는 것** | IdP(Okta) 늦게 도입, 의존성 업데이트 봇 늦게 도입 후회 |
| **팀 효율에 투자** | 자동화·문서화에 쓴 시간은 후회한 적 없다 |

## 영역별 평가

### 클라우드와 컴퓨팅

| 결정 | 평가 | 이유 |
| --- | --- | --- |
| AWS (vs GCP) | 지지 | 고객 지원이 사람 중심이다 |
| EKS · Kubernetes | 지지 | 오래 도는 서비스를 올릴 곳으로 검증됐고 AWS 통합이 깊다 |
| Karpenter | 지지 | 다른 오토스케일러보다 믿을 만하고 싸다 |
| Bottlerocket(EKS 노드 OS) | 후회 | 네트워킹 문제가 잦고 디버깅이 어렵다 |
| FaaS를 더 쓰지 않음 | 후회 | CPU 작업 상당수는 Lambda로 됐을 것이다. 비용 추적도 쉽다 |
| 서비스는 Go | 지지 | 새 엔지니어가 배우기 쉽다 |

### 데이터

| 결정 | 평가 | 이유 |
| --- | --- | --- |
| RDS | 지지 | 비싸도 값을 한다 |
| Redis(ElastiCache) | 지지 | 캐시와 범용 저장소로 두루 쓴다 |
| 여러 앱이 DB 하나 공유 | 후회 | 여러 문제의 원인이 됐다 |
| 스키마 diff 기반 마이그레이션 | 어느 정도 지지 | 마이그레이션은 위험하니 도구가 필요하다 |

### IaC · 배포

| 결정 | 평가 | 이유 |
| --- | --- | --- |
| Terraform (vs CloudFormation) | 지지 | 다른 SaaS로 넓히기 쉽고 읽기 쉽다 |
| 코드형 IaC(Pulumi·CDK) 안 씀 | 후회 없음 | HCL의 제한이 오히려 복잡도를 막는다 |
| Terraform Cloud 대신 Atlantis | 후회 없음 | 비용을 정당화하기 어려웠다 |
| GitOps · Flux | 지지 | 배포 상태를 보여 주는 도구는 따로 만들어야 했다 |
| Helm v3 · 차트는 ECR(OCI)에 | 지지 | 충분히 좋다. CRD 배포·교육은 번거롭다 |
| GitHub Actions | 어느 정도 지지 | 쉽지만 셀프 호스티드 지원이 약하다 |
| Bazel | 미확신 | Go 서비스에는 과하다 |
| Renovate | 후회 | 의존성 업데이트를 더 일찍 고민했어야 했다. Renovate는 설정이 복잡하다 |

### 시크릿 · 네트워크

| 결정 | 평가 | 이유 |
| --- | --- | --- |
| SealedSecrets | 후회 | 개발자에게 어렵고 AWS의 자동 교체를 잃는다 |
| ExternalSecrets | 지지 | AWS 시크릿을 k8s로 동기화. 이해하기 쉽다 |
| ExternalDNS · cert-manager | 지지 | 4년간 거의 문제없었다 |
| Nginx 인그레스 | 지지 | 오래됐지만 검증됐다 |
| AWS VPN + Okta | 지지 | 설정과 이해가 단순하다 |
| 자체 IP 블록 구매 | 지지 | 외부 파트너에게 화이트리스트를 주기 쉽다 |

### 운영 · 관측

| 결정 | 평가 | 이유 |
| --- | --- | --- |
| Datadog | 후회 | 매우 비싸고 k8s·AI 회사에 맞지 않는 과금 모델이다 |
| PagerDuty + 정기 알림 검토 | 지지 | 알림이 무시되지 않게 관리한다 |
| 사후 분석은 Slack 봇 + Notion | 지지 | 작성을 유도한다. Datadog·PagerDuty 내장 기능은 맞춤이 어렵다 |
| 월간 비용 리뷰 | 지지 | 태그·계정별로 묶고, AWS뿐 아니라 모든 SaaS 지출을 본다 |
| AWS 프리미엄 지원 | 후회 | 내부 지식이 있다면 비싼 값을 못 한다 |

### 협업 도구

Notion(문서), Slack, Linear, 사내 스크립트 배포용 Homebrew, 내부 도구용 AppSmith(셀프 호스팅)는 모두 지지했다. IdP는 Google Workspace로 버티다 Okta를 늦게 들인 것을 후회했다.

## 정리

- 데이터 계층만큼은 관리형 서비스에 돈을 쓴다.
- 멋진 기술보다 단순하고 검증된 기술. 인프라에서는 **적을수록 좋다**.
- 관측 표준(OpenTelemetry), IdP, 의존성 업데이트, 비용 추적은 나중에 들일수록 비싸진다.
- 관리형 편의 기능은 커스터마이즈가 막히는지 먼저 본다.
- 도구 목록은 시간이 지나면 낡는다. 남는 것은 **무엇을 기준으로 골랐나**다.

관련 노트: [[ci-cd|CI/CD]], [[vm-vs-container|VM과 컨테이너]], [[rds-security-group|AWS RDS 외부 접속 허용]]
