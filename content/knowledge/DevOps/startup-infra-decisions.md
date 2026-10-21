---
title: "스타트업 인프라 선택 원칙"
concept: "Infra Decisions"
summary: "작은 팀이 인프라를 고를 때의 판단 기준. 데이터 계층에는 관리형 서비스에 돈을 쓰고, 단순한 도구를 고르고, 관리형 편의 기능은 커스터마이즈 여지를 먼저 보고, 관측 표준(OpenTelemetry)·IdP·의존성 업데이트·비용 추적처럼 늦을수록 비싸지는 것은 처음부터 들인다. 가변 인프라·비대한 이미지·공유 DB 같은 클라우드 네이티브 안티패턴도 함께 정리한다."
tags: ["devops", "infra", "aws", "architecture", "tools"]
source: other
date: "2026-10-20"
sources: ["https://cep.dev/posts/every-infrastructure-decision-i-endorse-or-regret-after-4-years-running-infrastructure-at-a-startup/", "https://news.hada.io/topic?id=13564", "https://bytebytego.com/guides/cloud-native-anti-patterns", "https://blog-tech.tadatada.com/2019-01-28-tada-system-architecture"]
---

> GeekNews의 요약 「[스타트업에서 4년간 인프라를 운영하며 좋았던/후회하는 (거의) 모든 인프라 결정들](https://news.hada.io/topic?id=13564)」(2024.02)을 바탕으로 재구성한 노트다. 원 자료는 Jack Lindamood의 「[(Almost) Every infrastructure decision I endorse or regret after 4 years running infrastructure at a startup](https://cep.dev/posts/every-infrastructure-decision-i-endorse-or-regret-after-4-years-running-infrastructure-at-a-startup/)」(2024.02)다. 「클라우드 네이티브 안티패턴」은 ByteByteGo의 System Design 101 가이드 「[Cloud Native Anti-Patterns](https://bytebytego.com/guides/cloud-native-anti-patterns)」를 바탕으로 보강했다. 출시 속도·팀 숙련도·RDB 우선 기준은 「[타다 시스템 아키텍처](https://blog-tech.tadatada.com/2019-01-28-tada-system-architecture)」로 보강했다.

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
| **불확실할수록 출시 속도로 고른다** | 수요가 검증되지 않은 서비스는 통제력보다 출시까지의 시간(time to market)이 중요하다. 직접 만든 솔루션은 통제력을 주는 대신 개발·운영 부담을 키운다 | 완성도 높은 프레임워크와 관리형 서비스(관리형 쿠버네티스, 관리형 메시지 브로커)부터 쓴다 |
| **팀이 익숙한 것을 고른다** | 기술적 우위보다 팀의 숙련도와 기존 관례가 운영 부담을 더 크게 좌우한다 | CI/CD·브로커는 팀이 이미 운영해 본 것을 우선한다 |
| **규모가 작으면 RDB부터** | 트래픽이 작을 때는 트랜잭션을 지원하는 RDB가 NoSQL보다 단순하고 개발하기 편하다 | 쓰기가 유난히 많은 워크로드(위치 갱신 등)만 별도 DB 인스턴스로 떼어 다른 기능에 영향을 주지 않게 한다 |
| **스키마를 API 명세로 쓴다** | 명세 문서와 코드가 어긋나는 것을 막는다 | Protocol Buffers 스키마를 공유해 gRPC 명세로 쓰고, 실시간 이벤트는 서버 스트리밍 RPC로 민다 |

## 클라우드 네이티브 안티패턴

기준을 뒤집으면 피해야 할 패턴이 된다. 클라우드에 올렸다고 클라우드 네이티브가 되지는 않는다.

| 안티패턴 | 문제 | 대신 |
| --- | --- | --- |
| 거대한 단일 앱 | 강하게 결합된 앱 하나를 그대로 클라우드에 올려 부분 확장도, 독립 배포도 못 한다 | 경계가 분명한 부분부터 떼어 내고, 쪼갤 이유가 생길 때 쪼갠다 |
| 비용 최적화 무시 | 쓰지 않는 자원과 과한 사양이 예산을 넘긴다 | 태그·계정별 비용 리뷰, 오토 스케일링, 사양 재조정 |
| 가변 인프라 | 서버에 들어가 설정을 고치다 구성 드리프트가 생기고 재현이 안 된다 | 인프라를 일회용으로 보고 교체한다([[terraform-workflow\|불변 인프라]]) |
| 비효율적인 DB 접근 | 과하게 복잡한 쿼리, 빠진 인덱스가 DB를 병목으로 만든다 | 접근 패턴에 맞춘 인덱스와 쿼리, 캐시 |
| 비대한 이미지 | 큰 컨테이너 이미지가 배포와 확장을 느리게 하고 자원을 먹는다 | 멀티 스테이지 빌드, 작은 베이스 이미지([[dockerfile\|Dockerfile]]) |
| CI/CD 없음 | 수동 배포는 실수가 잦고 배포 빈도를 떨어뜨린다 | 파이프라인 자동화([[ci-cd\|CI/CD]]) |
| 공유 자원 의존 | 여러 앱이 DB 하나를 함께 써 경합과 병목이 생기고 장애가 번진다 | 앱마다 데이터 저장소를 나눈다 |
| 전략 없는 서비스 남용 | 관리형 서비스를 이것저것 붙여 전체 구조를 아무도 모르게 된다 | 쓰는 서비스를 정하고 이유를 기록한다 |
| 상태를 품은 구성 요소 | 앱 서버가 세션·파일을 로컬에 들고 있어 확장과 장애 조치가 어렵다 | 상태는 DB·캐시·오브젝트 저장소로 빼고 앱은 무상태로 둔다 |

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

관련 노트: [[ci-cd|CI/CD]], [[vm-vs-container|VM과 컨테이너]], [[aws-cloud-basics|AWS 클라우드 기초]], [[kubernetes-request-path|쿠버네티스 위 웹 서비스의 요청 경로와 구성 요소]], [[terraform-workflow|Terraform: 코드로 클라우드 인프라 만들기]], [[observability|관측 가능성: 로그, 트레이스, 메트릭]]
