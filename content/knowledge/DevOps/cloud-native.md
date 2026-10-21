---
title: "클라우드 네이티브와 코드형 인프라"
concept: "Cloud Native"
summary: "클라우드 네이티브를 개발 프로세스·애플리케이션 구조·배포 단위·인프라의 네 축으로 정의하고, 가상화에서 IaaS·PaaS·컨테이너로 이어진 클라우드의 변천, 전환 로드맵(CNCF 랜드스케이프의 여섯 영역), 전통적 구성 관리와 코드형 인프라(IaC)·GitOps의 차이와 대표 도구를 정리했다."
tags: ["devops", "infra", "cloud", "docker", "automation"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/what-is-cloud-native", "https://bytebytego.com/guides/how-do-we-transform-a-system-to-be-cloud-native", "https://bytebytego.com/guides/2-decades-of-cloud-evolution", "https://bytebytego.com/guides/a-cheatsheet-on-infrastructure-as-code-landscape", "https://bytebytego.com/guides/how-do-we-manage-configurations-in-a-system", "https://github.com/cncf/toc/blob/main/DEFINITION.md"]
---

> ByteByteGo의 System Design 101 가이드 「[What is Cloud Native?](https://bytebytego.com/guides/what-is-cloud-native)」, 「[How to Transform a System to be Cloud Native](https://bytebytego.com/guides/how-do-we-transform-a-system-to-be-cloud-native)」, 「[2 Decades of Cloud Evolution](https://bytebytego.com/guides/2-decades-of-cloud-evolution)」, 「[Infrastructure as Code Landscape Cheatsheet](https://bytebytego.com/guides/a-cheatsheet-on-infrastructure-as-code-landscape)」, 「[How do we manage configurations in a system?](https://bytebytego.com/guides/how-do-we-manage-configurations-in-a-system)」를 바탕으로, 정의는 [CNCF의 Cloud Native 정의](https://github.com/cncf/toc/blob/main/DEFINITION.md)로 확인해 재구성한 노트다.

## 클라우드 네이티브란

클라우드 네이티브(cloud native)는 **퍼블릭·프라이빗·하이브리드 클라우드의 특성을 처음부터 전제로 삼아 확장 가능하고 회복력 있는 애플리케이션을 만들고 운영하는 방식**이다. 서버를 클라우드로 옮기기만 한 것(lift and shift)은 클라우드 네이티브가 아니다. CNCF는 그 대표 기술로 컨테이너, 서비스 메시, 마이크로서비스, 불변 인프라(immutable infrastructure), 선언형 API를 꼽는다.

## 네 가지 축

| 축 | 과거 | 클라우드 네이티브 |
| --- | --- | --- |
| 개발 프로세스 | 폭포수(waterfall) → 애자일 | DevOps. 개발과 운영이 한 흐름에서 자주 배포한다. [[ci-cd\|CI/CD]] |
| 애플리케이션 구조 | 모놀리식 | 작은 서비스로 나눈 마이크로서비스. 각 서비스는 컨테이너의 제한된 자원에 맞게 작다 |
| 배포·패키징 | 물리 서버 → 가상 서버 | 컨테이너 이미지로 포장해 컨테이너로 배포한다. [[vm-vs-container\|VM과 컨테이너]] |
| 애플리케이션 인프라 | 자체 운영 서버 | 클라우드 인프라에 대규모로 배포하고 오케스트레이터가 관리한다 |

클라우드 네이티브 앱이 지켜야 할 애플리케이션 쪽 규칙은 [[twelve-factor-app|12요소 앱]]에 있다.

## 전환 로드맵

조직이 클라우드 네이티브로 옮겨 갈 때 다뤄야 할 영역은 CNCF 랜드스케이프의 분류와 겹친다. 대체로 위에서 아래 순서로 도입한다.

| 영역 | 하는 일 | 대표 기술 |
| --- | --- | --- |
| 애플리케이션 정의·개발 | 앱과 이미지를 정의하고 빌드·배포 파이프라인을 만든다 | Dockerfile, Helm, CI/CD |
| 프로비저닝 | 인프라를 코드로 만들고 보안·키·이미지 저장소를 갖춘다 | Terraform, 컨테이너 레지스트리, 비밀 관리 |
| 런타임 | 컨테이너 실행, 스토리지, 네트워크 | containerd, CSI, CNI |
| 오케스트레이션·관리 | 스케줄링, 서비스 디스커버리, 서비스 메시, API 게이트웨이 | Kubernetes, Istio·Linkerd, Envoy |
| 관측(observability) | 메트릭·로그·트레이스를 모으고 분석한다 | Prometheus, Grafana, OpenTelemetry |
| 서버리스 | 서버를 의식하지 않고 함수·컨테이너 단위로 실행한다 | AWS Lambda, Knative. [[aws-lambda-internals\|AWS Lambda의 내부 구조]] |

Kubernetes에서 요청 하나가 흐르는 경로는 [[kubernetes-request-path|쿠버네티스 위 웹 서비스의 요청 경로]]에 있다.

## 코드형 인프라

### 구성 관리와 IaC

| 비교 | 전통적 구성 관리 | 코드형 인프라(IaC) |
| --- | --- | --- |
| 관심사 | 이미 만들어진 서버·네트워크 장비·앱의 설정을 원하는 상태로 **유지** | 인프라 자체를 **만들고** 바꾸고 없애는 것까지 |
| 시작 | 운영자가 처음 환경을 손으로 세팅한다 | 처음부터 코드로 프로비저닝한다 |
| 변경 방식 | 단계별 명령(절차형)이 많다 | 원하는 최종 상태를 선언하고(선언형) 도구가 차이를 맞춘다 |
| 관리 | 문서와 사람의 기억 | 버전 관리, 코드 리뷰, 테스트, 재사용 |

IaC는 **인프라에 소프트웨어 개발 관행을 적용한 것**이다. 같은 코드로 개발·스테이징·운영 환경을 똑같이 만들 수 있고, 변경 이력이 커밋으로 남으며, 장애 때 다른 리전에 환경을 다시 세우는 시간이 줄어든다.

### 도구 지형

| 범주 | 하는 일 | 대표 도구 |
| --- | --- | --- |
| 컨테이너화 | 앱과 의존성을 이미지 하나로 묶어 어디서나 같게 돈다 | Docker. [[dockerfile\|Dockerfile 작성]] |
| 오케스트레이션 | 많은 컨테이너의 배치·확장·복구를 자동화한다 | Kubernetes |
| 프로비저닝(IaC) | 클라우드 자원을 선언형 코드로 만든다 | Terraform·OpenTofu, AWS CloudFormation·CDK, Pulumi |
| 구성 관리 | 서버 안의 패키지·설정을 원하는 상태로 맞춘다 | Ansible, Chef, Puppet |
| GitOps | Git 저장소를 원하는 상태의 원천으로 두고, 클러스터가 그 상태를 끌어와 맞춘다 | Argo CD, Flux |

Terraform은 2023년 라이선스를 BSL로 바꿨고, 이를 계기로 오픈소스 포크인 OpenTofu가 리눅스 재단 아래 생겼다. 둘은 문법이 거의 같다. write → plan → apply 흐름과 상태 파일은 [[terraform-workflow|Terraform: 코드로 클라우드 인프라 만들기]]에 있다.

**GitOps**는 IaC를 한 단계 더 밀어붙인다. 사람이 `kubectl apply`나 `terraform apply`를 직접 치지 않고, Git에 병합하면 에이전트가 실제 상태를 Git의 선언에 맞춘다. 실제 상태가 선언과 달라지는 드리프트(drift)도 같은 방식으로 되돌린다.

## 역사

| 시기 | 사건 | 의미 |
| --- | --- | --- |
| 2001 | VMware의 하이퍼바이저 기반 서버 가상화 | 물리 서버 한 대를 여러 VM으로 나눈다. [[virtualization\|가상화와 하이퍼바이저]] |
| 2006 | AWS의 IaaS(S3, EC2) | 인프라를 API로 빌려 쓴다 |
| 2009 | Heroku의 PaaS | 코드만 올리면 플랫폼이 실행한다 |
| 2010~2011 | OpenStack(오픈소스 IaaS), Cloud Foundry(오픈소스 PaaS) | 자체 데이터센터에서도 클라우드 방식을 쓴다 |
| 2013 | Docker | 컨테이너가 배포 단위가 된다 |
| 2014~2015 | Kubernetes 공개, CNCF 설립 | 컨테이너 오케스트레이션과 클라우드 네이티브 생태계가 표준화된다 |

## 정리

- 클라우드 네이티브는 위치가 아니라 방식이다. DevOps·마이크로서비스·컨테이너·클라우드 인프라가 함께 간다.
- 인프라는 손으로 만들지 않고 선언형 코드로 만든다. 같은 코드로 어느 환경이든 다시 세운다.
- 구성 관리는 「있는 서버를 맞추는 것」, IaC는 「서버를 만드는 것」까지다.
- GitOps는 Git을 원하는 상태의 원천으로 두고 실제 상태를 끌어와 맞춘다.

관련 노트: [[twelve-factor-app|12요소 앱]], [[terraform-workflow|Terraform: 코드로 클라우드 인프라 만들기]], [[observability|관측 가능성: 로그, 트레이스, 메트릭]], [[vm-vs-container|VM과 컨테이너]], [[kubernetes-request-path|쿠버네티스 위 웹 서비스의 요청 경로]], [[ci-cd|CI/CD]], [[aws-cloud-basics|AWS 클라우드 기초]], [[startup-infra-decisions|스타트업 인프라 선택 원칙]], [[serverless-architecture|서버리스 아키텍처]]
