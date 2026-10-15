---
title: "스타트업 인프라 결정: 지지와 후회"
concept: "Infra Decisions"
summary: "스타트업 인프라를 4년 운영한 사람이 매긴 결정별 지지·후회 목록을 주제별로 다시 묶었다. 데이터는 관리형에 돈을 쓰고, 단순한 도구를 고르고, 표준(OpenTelemetry·IdP)과 비용 추적은 처음부터 들인다."
tags: ["devops", "infra", "aws", "architecture", "tools"]
source: other
date: "2026-10-12"
sources: ["https://cep.dev/posts/every-infrastructure-decision-i-endorse-or-regret-after-4-years-running-infrastructure-at-a-startup/", "https://news.hada.io/topic?id=13564"]
---

> GeekNews의 요약 「[스타트업에서 4년간 인프라를 운영하며 좋았던/후회하는 (거의) 모든 인프라 결정들](https://news.hada.io/topic?id=13564)」(2024.02)을 요약·재구성한 노트다. 원 자료는 Jack Lindamood의 「[(Almost) Every infrastructure decision I endorse or regret after 4 years running infrastructure at a startup](https://cep.dev/posts/every-infrastructure-decision-i-endorse-or-regret-after-4-years-running-infrastructure-at-a-startup/)」(2024.02)다.

## 개요

빠르게 성장한 AI 스타트업이 4년 동안(2020~2024) 내린 인프라 결정을 **지지(Endorse)** 와 **후회(Regret)로** 나눈 사례 목록이다. 개별 도구 평가는 시점에 묶여 있으므로, 먼저 아래 판단 기준을 보고 영역별 표는 그 근거로 읽는다. 이후 바뀐 사실은 정리 앞에 따로 적었다.

## 판단 기준

| 기준 | 근거가 된 결정 |
| --- | --- |
| **데이터에는 돈을 아끼지 않는다** | RDS 지지. 데이터가 인프라에서 가장 중요하다 |
| **단순한 것이 낫다** | 서비스 메시·Pulumi/CDK 안 쓴 것 후회 없음. Jira → Linear 지지 |
| **커스터마이즈 여지를 남긴다** | EKS 관리형 애드온 후회 → Helm 차트로 옮긴 뒤 나아짐 |
| **표준은 처음부터** | OpenTelemetry 없이 Datadog API에 바로 붙인 것 후회 |
| **늦게 들이면 비싸지는 것** | IdP(Okta) 늦게 도입, 의존성 업데이트 봇 늦게 도입 후회 |
| **팀 효율에 투자** | 자동화·문서화에 쓴 시간은 후회한 적 없다 |

## 영역별 근거

판단 기준을 떠받치는 결정만 영역별로 남겼다.

| 영역 | 결정 | 평가 | 이유 |
| --- | --- | --- | --- |
| 데이터 | RDS | 지지 | 비싸도 값을 한다 |
| 데이터 | 여러 앱이 DB 하나 공유 | 후회 | 여러 문제의 원인이 됐다 |
| 컴퓨팅 | EKS 관리형 애드온 | 후회 | 커스터마이즈가 막혀 Helm 차트로 옮겼다 |
| 컴퓨팅 | FaaS를 더 쓰지 않음 | 후회 | CPU 작업 상당수는 Lambda로 됐고, 비용 추적도 쉬웠을 것이다 |
| IaC | Terraform, 코드형 IaC(Pulumi·CDK)는 안 씀 | 지지 | HCL의 제한이 오히려 복잡도를 막는다 |
| 네트워크 | 서비스 메시 안 씀 | 후회 없음 | 들이지 않아 단순함을 지켰다 |
| 시크릿 | SealedSecrets → ExternalSecrets | 후회 → 지지 | AWS 시크릿을 그대로 동기화하는 쪽이 이해하기 쉽다 |
| 관측 | Datadog API에 직접 연동 | 후회 | 비싸고, OpenTelemetry 없이 붙여 벗어나기 어렵다 |
| 비용 | 월간 비용 리뷰 | 지지 | 태그·계정별로 묶고 AWS뿐 아니라 모든 SaaS 지출을 본다 |
| 의존성 | 업데이트 봇(Renovate) 늦게 도입 | 후회 | 더 일찍 고민했어야 했다 |
| 협업 | Jira → Linear, IdP(Okta) 늦게 도입 | 지지 / 후회 | 단순한 도구가 낫고, IdP는 늦을수록 옮기기 비싸다 |

## 이후 바뀐 것 (2026년 10월 기준)

| 항목 | 변화 |
| --- | --- |
| 커뮤니티 Ingress NGINX | 2026년 3월 유지보수가 끝났다. 쿠버네티스는 후속으로 **Gateway API**를 권한다([[kubernetes-request-path\|요청 경로 노트]]) |
| Terraform | 2023년 라이선스가 BSL로 바뀌었고, 오픈소스 포크 **OpenTofu**가 리눅스 재단에서 이어진다. Terraform Cloud는 2024년 HCP Terraform으로 이름이 바뀌었다 |

## 정리

- 데이터 계층만큼은 관리형 서비스에 돈을 쓴다.
- 멋진 기술보다 단순하고 검증된 기술. 인프라에서는 **적을수록 좋다**.
- 관측 표준(OpenTelemetry), IdP, 의존성 업데이트, 비용 추적은 나중에 들일수록 비싸진다.
- 관리형 편의 기능은 커스터마이즈가 막히는지 먼저 본다.
- 도구 목록은 시간이 지나면 낡는다. 남는 것은 **무엇을 기준으로 골랐나**다.

관련 노트: [[ci-cd|CI/CD]], [[vm-vs-container|VM과 컨테이너]], [[rds-security-group|AWS RDS 외부 접속 허용]], [[kubernetes-request-path|쿠버네티스 위 웹 서비스의 요청 경로와 구성 요소]]
