---
title: "VM과 컨테이너"
concept: "Container"
summary: "OS 전체를 가상화하는 VM과 애플리케이션 단위로 격리하는 Docker 컨테이너의 차이, 그리고 컨테이너가 많아질 때 필요한 오케스트레이션·오토 스케일링(Kubernetes). Docker의 핵심 개념 여덟 가지와 클라이언트·데몬·레지스트리 구조, docker run이 실행되는 순서도 다룬다."
tags: ["docker", "devops", "infra", "msa"]
source: notion
date: "2026-10-20"
sources: ["https://riverkim.kr/313", "https://80000coding.notion.site/95596b1b156b4451bd3e7d20d9e664eb", "https://bytebytego.com/guides/how-does-docker-work", "https://bytebytego.com/guides/top-8-must-know-docker-concepts", "https://www.44bits.io/ko/post/container-orchestration-101-with-docker-and-aws-elastic-container-service", "https://subicura.com/2017/01/19/docker-guide-for-beginners-1.html"]
---

> 쿠버네티스의 내력은 팔만코딩경(42Seoul 커뮤니티 위키)의 「쿠버네티스에 대한 흥미로운 사실들 24가지」를 바탕으로 보강한 노트다. 원 자료는 다큐멘터리 「Kubernetes: The Documentary」다. Docker의 핵심 개념과 구조는 ByteByteGo의 System Design 101 가이드 「[How does Docker work?](https://bytebytego.com/guides/how-does-docker-work)」, 「[Top 8 Must-Know Docker Concepts](https://bytebytego.com/guides/top-8-must-know-docker-concepts)」를 바탕으로 보강했다. ECS 용어는 「[AWS ECS로 시작하는 컨테이너 오케스트레이션](https://www.44bits.io/ko/post/container-orchestration-101-with-docker-and-aws-elastic-container-service)」, 컨테이너가 필요한 배경은 「[초보를 위한 도커 안내서 - 도커란 무엇인가?](https://subicura.com/2017/01/19/docker-guide-for-beginners-1.html)」로 보강했다.

서비스를 서버에 올리는 방식은 물리 서버 → 가상 머신(VM) → 컨테이너로 발전해 왔다. 한 서버에 여러 프로그램을 올리면 OS·라이브러리 버전이 충돌하고 포트가 겹치며, 피하려고 서버를 늘리면 자원이 남는다. 컨테이너는 실행 환경 전체를 이미지 하나로 묶어 어느 서버에서든 같은 방식으로 돌게 한다. 컨테이너는 가볍고 빠르게 늘리고 줄일 수 있어, MSA·오토 스케일링과 함께 쓰이는 현재의 기본 배포 단위가 되었다.

## VM vs 컨테이너

| | VM(가상 머신) | 컨테이너(Docker) |
| --- | --- | --- |
| 가상화 대상 | 하드웨어. VM마다 **게스트 OS + 앱** | OS 커널을 공유하고 **앱과 의존성만** 격리 |
| 크기 | 수~수십 GB | 수십~수백 MB |
| 시작 속도 | 분 단위 | 초 단위 |
| 비용·밀도 | 무겁고 비싸서 한 서버에 많이 못 올림 | 가벼워서 같은 자원에 훨씬 많이 실행 |
| 격리 수준 | 강함 (OS까지 분리) | 상대적으로 약함 (커널 공유) |

- 강한 격리가 필요할 때(믿을 수 없는 코드 실행, 보안 경계가 중요한 개발 환경)는 여전히 VM을 쓴다. 컨테이너가 커널을 공유하며 무엇으로 격리하는지(네임스페이스·cgroups)와 하이퍼바이저의 원리는 [[virtualization|가상화와 하이퍼바이저]]에 있다.
- 실무에서는 둘을 함께 쓴다. 클라우드 VM(예: AWS EC2) 위에 여러 컨테이너를 올리는 식이다.

## Docker

컨테이너를 직접 다루기는 어려우니 만들고 관리해 주는 도구가 **Docker**다. Dockerfile(설계도)을 빌드해 이미지를 만들고, 이미지를 실행한 것이 컨테이너다. 작성법은 [[dockerfile|Dockerfile 작성과 컨테이너의 PID 1]], 여러 컨테이너를 묶어 띄우는 방법은 [[docker-compose|Docker Compose: 여러 컨테이너 묶어 띄우기]]에 있다.

### 핵심 개념

| 개념 | 뜻 |
| --- | --- |
| Dockerfile | 베이스 이미지, 설치할 의존성, 실행 명령을 적은 이미지 설계도 |
| 이미지(image) | 코드·라이브러리·의존성을 층으로 쌓은 읽기 전용 패키지. 태그로 버전을 붙인다 |
| 컨테이너(container) | 이미지를 실행한 것. 다른 컨테이너·호스트와 격리되어 어디서나 같은 환경으로 돈다 |
| 레지스트리(registry) | 이미지를 저장하고 배포하는 저장소. Docker Hub가 기본 공개 레지스트리이고, 클라우드·사내 비공개 레지스트리를 둘 수 있다 |
| 볼륨(volume) | 컨테이너 파일 시스템 밖에 데이터를 남기는 장치. 여러 컨테이너가 함께 쓸 수 있다 |
| 네트워크(network) | 컨테이너끼리, 컨테이너와 호스트가 통신하는 경로. 사용자 정의 네트워크로 격리하거나 골라서 잇는다 |
| Compose | 여러 컨테이너로 된 앱을 파일 하나로 정의하고 함께 띄우는 도구 |
| CLI | `docker build`·`run`·`ps`·`logs`처럼 Docker를 다루는 기본 인터페이스 |

### 구조: 클라이언트, 데몬, 레지스트리

Docker는 클라이언트-서버 구조다. 터미널에서 치는 `docker` 명령은 클라이언트일 뿐이고, 실제 일은 호스트의 **데몬(dockerd)** 이 API 요청을 받아 한다.

```text
Docker 클라이언트 ──REST API──▶ Docker 호스트                  ◀──pull/push──▶ 레지스트리
  docker build                  dockerd (데몬)                                Docker Hub,
  docker pull                     ├ 이미지                                      비공개 레지스트리
  docker run                      ├ 컨테이너
                                  ├ 네트워크
                                  └ 볼륨
```

`docker run nginx` 한 줄은 다음 순서로 실행된다.

1. 로컬에 이미지가 없으면 레지스트리에서 pull한다.
2. 이미지로 새 컨테이너를 만든다.
3. 이미지의 읽기 전용 층 위에 컨테이너용 **읽기·쓰기 층**을 얹는다.
4. 네트워크 인터페이스를 만들어 기본 네트워크(bridge)에 연결하고 IP를 준다.
5. 컨테이너를 시작해 지정한 명령을 실행한다.

데몬은 그 아래에서 containerd 같은 컨테이너 런타임에 실제 실행을 맡긴다. 쿠버네티스도 같은 런타임을 직접 쓴다([[kubernetes-architecture|쿠버네티스 구조와 핵심 개념]]).

## 오케스트레이션과 오토 스케일링

관리할 컨테이너가 많아지면 사람이 일일이 배치·재시작·네트워크 연결을 할 수 없다. Docker가 서버 한 대의 컨테이너를 관리한다면, 오케스트레이션 도구는 **Docker가 깔린 여러 서버**를 묶어 배포, 장애 시 재시작, 서비스 디스커버리를 자동으로 관리한다. 대표적으로 Kubernetes, Docker Swarm, AWS ECS가 있다.

오토 스케일링도 오케스트레이션의 일이다. 트래픽에 맞춰 실행 단위를 자동으로 늘리고 줄이는데, 두 수준이 있다.

| 수준 | 늘리는 것 | 예 |
| --- | --- | --- |
| 컨테이너 | 같은 서버 안의 컨테이너(파드) 수 | Kubernetes HPA |
| 인스턴스 | 컨테이너를 올릴 VM 자체 | EC2 Auto Scaling Group, Cluster Autoscaler |

### AWS ECS로 보는 오케스트레이션 용어

오케스트레이터마다 이름은 달라도 개념은 비슷하다. ECS의 용어로 보면 다음과 같다.

| ECS | 뜻 | 쿠버네티스에 대응 |
| --- | --- | --- |
| 클러스터 | 컨테이너가 도는 논리적 공간 | 클러스터 |
| 태스크 정의 | 이미지, 실행 명령, CPU·메모리, 네트워크 모드, IAM 역할을 묶은 실행 명세. 고칠 때마다 리비전이 늘어난다 | 파드 템플릿 |
| 태스크 | 태스크 정의를 실행한 최소 단위. 컨테이너 하나 이상이 같은 호스트에서 함께 돈다 | 파드 |
| 서비스 | 태스크를 지정한 수만큼 유지하고, 죽으면 다시 띄우고, 로드 밸런서에 붙인다. 레플리카형과 호스트마다 하나씩인 데몬형이 있다 | Deployment, DaemonSet |
| 실행 기반 | EC2(인스턴스를 직접 관리, ecs-agent가 클러스터에 등록) 또는 Fargate(서버 관리 없이 태스크 단위 과금) | 노드 |

태스크를 직접 실행하면 죽어도 다시 뜨지 않는다. 웹 서버처럼 계속 떠 있어야 하는 것은 서비스로 띄운다. 스케줄러가 어느 호스트에 놓을지 정하므로 **어떤 호스트에서 돌아도 되게** 만든다(로컬 디스크·고정 IP에 기대지 않는다). 이미지는 ECR 같은 비공개 레지스트리에 두고 IAM으로 권한을 준다.

쿠버네티스는 구글이 사내 클러스터 관리 시스템 **Borg**를 운영한 경험을 바탕으로 2014년 오픈 소스로 공개했다. 이듬해 중립 재단 **CNCF**에 기증되면서 여러 기업이 기여했고, 기술보다 이 중립성과 거대한 생태계 덕분에 Swarm·Mesos를 제치고 표준이 됐다.

## MSA와의 관계

MSA는 기능을 독립적으로 배포 가능한 서비스들로 쪼갠 구조라서, 서비스마다 컨테이너로 포장해 따로 배포·확장하기에 알맞다. MSA의 구성 요소와 도입 시 주의점은 [[web-scalability-components|웹 확장성의 구성 요소]]의 「확장의 세 축」에 정리했다.

## 핵심 정리

- VM은 OS째로, 컨테이너는 앱 단위로 격리한다. 컨테이너가 훨씬 가볍고 빠르다.
- Docker는 실행 환경을 이미지로 통째로 포장해 어디서나 같은 환경을 띄우게 한다.
- 컨테이너가 많아지면 오케스트레이션 도구가 배치·재시작·오토 스케일링을 맡는다. 사실상 표준은 쿠버네티스다.

관련 노트: [[virtualization|가상화와 하이퍼바이저]], [[os-overview|운영체제 개요(커널의 구조)]], [[ci-cd|CI/CD]], [[startup-infra-decisions|스타트업 인프라 선택 원칙]], [[kubernetes-request-path|쿠버네티스 위 웹 서비스의 요청 경로와 구성 요소]], [[dockerfile|Dockerfile 작성]], [[docker-compose|Docker Compose]], [[kubernetes-architecture|쿠버네티스 구조와 핵심 개념]]
