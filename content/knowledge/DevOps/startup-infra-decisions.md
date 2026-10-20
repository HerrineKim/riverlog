---
title: "스타트업 인프라 선택 원칙"
concept: "Infra Decisions"
summary: "작은 팀이 인프라를 고를 때의 판단 기준. 데이터 계층에는 관리형 서비스에 돈을 쓰고, 단순한 도구를 고르고, 관리형 편의 기능은 커스터마이즈 여지를 먼저 보고, 관측 표준(OpenTelemetry)·IdP·의존성 업데이트·비용 추적처럼 늦을수록 비싸지는 것은 처음부터 들인다."
tags: ["devops", "infra", "aws", "architecture", "tools"]
source: other
date: "2026-10-20"
sources: ["https://cep.dev/posts/every-infrastructure-decision-i-endorse-or-regret-after-4-years-running-infrastructure-at-a-startup/", "https://news.hada.io/topic?id=13564"]
---

> GeekNews의 요약 「[스타트업에서 4년간 인프라를 운영하며 좋았던/후회하는 (거의) 모든 인프라 결정들](https://news.hada.io/topic?id=13564)」(2024.02)을 바탕으로 재구성한 노트다. 원 자료는 Jack Lindamood의 「[(Almost) Every infrastructure decision I endorse or regret after 4 years running infrastructure at a startup](https://cep.dev/posts/every-infrastructure-decision-i-endorse-or-regret-after-4-years-running-infrastructure-at-a-startup/)」(2024.02)다.

## 왜 기준이 필요한가

인프라 도구는 몇 년이면 바뀌지만, 사람이 적은 팀이 무엇을 직접 들고 무엇을 사서 쓸지 정하는 **기준**은 오래 간다. 도구 목록보다 기준으로 고르면 도구가 바뀌어도 같은 판단을 다시 할 수 있다.

## 판단 기준

| 기준 | 뜻 | 예 |
| --- | --- | --- |
| **데이터에는 돈을 아끼지 않는다** | 데이터는 잃으면 되돌릴 수 없는 유일한 자산이다. 백업·복제·장애 조치는 관리형 DB(RDS 등)에 맡긴다 | 앱마다 DB를 나누고, 여러 앱이 DB 하나를 공유하지 않는다 |
| **단순한 것이 낫다** | 들이지 않은 부품은 고장 나지 않는다. 필요가 분명해질 때까지 미룬다 | 서비스 메시를 기본으로 깔지 않는다. IaC는 표현력이 제한된 선언형(HCL)이 복잡도를 막는다 |
| **커스터마이즈 여지를 남긴다** | 관리형 편의 기능은 설정을 막아 나중에 벗어나기 어렵다 | 쿠버네티스 관리형 애드온 대신 Helm 차트로 직접 관리한다 |
| **표준에 먼저 붙는다** | 벤더 API에 바로 붙으면 비용이 커져도 옮기기 어렵다 | 관측은 OpenTelemetry로 수집하고 백엔드(Datadog 등)는 교체 가능하게 둔다 |
| **늦을수록 비싸지는 것은 처음부터** | 사람과 시스템이 늘수록 옮기는 비용이 커진다 | IdP(SSO), 의존성 업데이트 봇(Renovate), 태그·계정별 월간 비용 리뷰(SaaS 지출 포함) |
| **작은 일은 서버리스로** | 상태 없는 짧은 작업은 서버를 두지 않는 편이 운영과 비용 추적이 쉽다 | CPU 작업 일부를 Lambda로 뺀다 |
| **비밀은 원천에서 동기화** | 암호화한 비밀을 저장소에 두는 것보다 클라우드 비밀 저장소를 그대로 끌어오는 편이 이해하기 쉽다 | ExternalSecrets로 AWS Secrets Manager를 동기화한다 |
| **팀 효율에 투자** | 자동화와 문서화는 사람이 늘지 않게 해 준다 | 배포·온보딩 자동화, 단순한 이슈 트래커 |

## 도구 쪽에서 바뀐 것

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

관련 노트: [[ci-cd|CI/CD]], [[vm-vs-container|VM과 컨테이너]], [[aws-cloud-basics|AWS 클라우드 기초]], [[kubernetes-request-path|쿠버네티스 위 웹 서비스의 요청 경로와 구성 요소]]
