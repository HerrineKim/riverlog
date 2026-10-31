---
title: "Packer와 머신 이미지 굽기"
concept: "Packer"
summary: "Packer는 템플릿 하나로 AMI·GCE 이미지·VM·컨테이너 이미지를 자동으로 만드는 HashiCorp의 이미지 빌더다. 소스(빌더)로 임시 머신을 띄우고 프로비저너로 설정한 뒤 스냅숏을 떠서 후처리기로 넘기는 흐름, HCL2 템플릿과 packer init·build, Dockerfile과의 차이, 골든 이미지와 불변 인프라에서의 쓰임을 정리한다."
tags: ["devops", "infra", "automation", "aws", "docker"]
source: other
date: "2026-10-31"
sources: ["https://github.com/remotty/documents.docker.co.kr", "https://developer.hashicorp.com/packer/docs/templates/hcl_templates", "https://developer.hashicorp.com/packer/docs/commands/init", "https://developer.hashicorp.com/packer/docs/templates/legacy_json_templates", "https://speakerdeck.com/nacyot/packerreul-tonghan-ami-jadong-bildeu-siseutem-gucug", "http://blog.nacyot.com/articles/2014-04-06-immutable-infrastructure/", "http://seapy.com/2084"]
---

> AppContainer Korea(오픈 컨테이너 코리아) 인프라스트럭처 스터디 자료 「[Hashicorp Packer](https://github.com/remotty/documents.docker.co.kr)」 발표 노트와 같은 저장소의 컨테이너 밋업 발표(컨테이너 베이스 이미지 관리)를 바탕으로, 템플릿 문법과 명령은 Packer 공식 문서로 확인해 재구성한 노트다. AMI 빌드 단계와 운영 패턴은 「[패커(Packer)를 통한 AMI 자동 빌드 시스템 구축](https://speakerdeck.com/nacyot/packerreul-tonghan-ami-jadong-bildeu-siseutem-gucug)」, 불변 인프라의 배경은 「[이미지 기반 어플리케이션 배포 패러다임 Immutable Infrastructure](http://blog.nacyot.com/articles/2014-04-06-immutable-infrastructure/)」, 「[Docker로 Ruby On Rails 쉽게 배포하기](http://seapy.com/2084)」로 보강했다.

## Packer란

**Packer는 설정 소스 하나로 여러 플랫폼용 머신 이미지와 컨테이너 이미지를 만드는 도구다.** AWS AMI, GCE 이미지, Azure 이미지, VMware·VirtualBox·QEMU 디스크, Vagrant 박스, Docker 이미지를 같은 템플릿에서 만들 수 있다(1:n). 사람이 서버에 접속해 패키지를 깔고 그 상태를 스냅숏으로 뜨던 일을 코드로 바꾼 것이다.

HashiCorp 도구 가운데 **이미지를 만드는(package) 단계**를 맡는다. Terraform이 그 이미지로 서버를 띄우고([[terraform-workflow|Terraform]]), Vault가 비밀을, Consul이 서비스 디스커버리를, Nomad가 배포를 맡는 식으로 이어진다.

## 구성 요소

| 구성 요소 | 역할 | 예 |
| --- | --- | --- |
| 템플릿(template) | 빌드 전체를 선언한 파일. 지금은 HCL2(`*.pkr.hcl`) | `ubuntu.pkr.hcl` |
| 소스(source, 빌더) | 대상 플랫폼에서 임시 머신을 띄우고 마지막에 이미지로 굳히는 플러그인 | `amazon-ebs`, `googlecompute`, `docker`, `qemu`, `vmware-iso` |
| 프로비저너(provisioner) | 임시 머신 안에서 설정 작업을 한다 | `shell`, `file`, `ansible`, `powershell`, `windows-restart` |
| 후처리기(post-processor) | 만들어진 결과물을 다듬거나 다른 곳에 넘긴다 | `docker-tag`·`docker-push`, `vagrant`, `manifest`, `checksum` |
| 빌드(build) | 소스 하나에서 이미지 하나를 만드는 작업 단위. 한 템플릿이 여러 빌드를 병렬로 돈다 | - |
| 아티팩트(artifact) | 빌드 결과. AMI ID, 이미지 파일, 컨테이너 이미지 | `ami-0abc...` |

## 빌드 흐름

```text
packer build
 ├─ 1. 소스: 기반 이미지로 임시 인스턴스(또는 컨테이너·VM) 실행
 ├─ 2. 프로비저너: SSH·WinRM 등으로 접속해 패키지 설치, 파일 복사, 설정
 ├─ 3. 인스턴스를 멈추고 스냅숏 → 아티팩트(이미지) 생성, 임시 자원 정리
 └─ 4. 후처리기: 태그, 레지스트리 푸시, 매니페스트 기록 등
```

빌드가 실패하면 임시 자원을 지운다. `-on-error=ask`로 실패 지점에서 멈춰 접속해 원인을 볼 수 있다.

`amazon-ebs` 소스의 실제 단계는 다음과 같다. 빌드 로그에도 이 순서로 찍힌다.

```text
소스 AMI 확인 → 임시 키 페어 생성 → 임시 보안 그룹 생성(SSH 허용)
→ 임시 인스턴스 기동 → SSH 준비 대기 → 프로비저너 실행
→ 인스턴스 정지 → AMI 생성(스냅숏) → 인스턴스 종료 → 임시 보안 그룹·키 페어 삭제
```

서버 상태를 손으로 만든 뒤 통째로 저장한 이미지는 어떻게 만들었는지 남지 않아 다시 만들 수 없고, 이미지 수가 늘수록 관리 비용도 그만큼 는다. Packer는 상태를 저장하는 대신 **이미지를 만드는 과정을 코드로 저장**한다.

## 템플릿 (HCL2)

```hcl
packer {
  required_plugins {
    amazon  = { source = "github.com/hashicorp/amazon",  version = ">= 1.3" }
    ansible = { source = "github.com/hashicorp/ansible", version = ">= 1.1" }
  }
}

locals {
  timestamp = regex_replace(timestamp(), "[- TZ:]", "")
}

source "amazon-ebs" "web" {
  region        = "ap-northeast-2"
  instance_type = "t3.micro"
  ssh_username  = "ubuntu"
  ami_name      = "web-${local.timestamp}"
  source_ami_filter {
    filters     = { name = "ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*" }
    owners      = ["099720109477"] # Canonical
    most_recent = true
  }
}

build {
  sources = ["source.amazon-ebs.web"]

  provisioner "shell" {
    inline = ["sudo apt-get update", "sudo apt-get install -y nginx"]
  }
  provisioner "ansible" {
    playbook_file = "ansible/playbook.yml"
  }
  post-processor "manifest" {}
}
```

- **자격 증명을 템플릿에 쓰지 않는다.** AWS 키는 환경 변수·프로필·IAM 역할로 넘긴다.
- 기반 이미지는 ID를 박지 않고 `source_ami_filter`로 최신 공식 이미지를 고른다.
- 이미지 이름에 타임스탬프나 Git 커밋을 넣어 빌드마다 새 이미지가 되게 한다.

### 명령

| 명령 | 하는 일 |
| --- | --- |
| `packer init .` | `required_plugins`에 적힌 플러그인을 내려받는다. 빌드 전에 먼저 돌린다 |
| `packer fmt .` | HCL 서식을 맞춘다 |
| `packer validate .` | 문법과 설정을 검사한다 |
| `packer inspect .` | 템플릿의 변수·소스·빌드 구성을 보여 준다 |
| `packer build .` | 빌드를 실행한다. `-only=amazon-ebs.web`으로 일부만, `-var`·`-var-file`로 변수를 넘긴다 |
| `packer hcl2_upgrade x.json` | 옛 JSON 템플릿을 HCL2로 바꾼다 |

과거에는 템플릿을 JSON(`builders`·`provisioners`·`post-processors` 배열)으로 썼고, 플러그인이 Packer 본체에 들어 있었다. 지금 JSON 템플릿은 레거시로만 남아 있고, 플러그인은 따로 배포되어 `packer init`으로 받는다.

## Dockerfile과 Packer의 차이

같은 "Ubuntu에 wget을 깐 이미지"도 두 방식으로 만들 수 있다.

```dockerfile
FROM ubuntu:24.04
RUN apt-get update && apt-get install -y wget
```

```hcl
source "docker" "ubuntu" {
  image  = "ubuntu:24.04"
  commit = true
}

build {
  sources = ["source.docker.ubuntu"]
  provisioner "shell" {
    inline = ["apt-get update", "apt-get install -y wget"]
  }
  post-processor "docker-tag" {
    repository = "myorg/ubuntu"
    tags       = ["wget"]
  }
}
```

| | Dockerfile (BuildKit) | Packer |
| --- | --- | --- |
| 결과물 | 컨테이너 이미지 | 머신 이미지(AMI·VM 디스크) 위주, 컨테이너 이미지도 가능 |
| 빌드 방식 | 명령마다 층(layer)을 쌓고, 바뀌지 않은 층은 캐시 | 임시 머신에서 프로비저너를 끝까지 돌린 뒤 통째로 스냅숏. 층 캐시가 없다 |
| 설정 수단 | `RUN` 셸 명령 | 셸, Ansible·Chef·Puppet 같은 구성 관리 도구를 그대로 재사용 |
| 대상 | 컨테이너 런타임 하나 | 한 템플릿에서 여러 클라우드·하이퍼바이저 동시 빌드 |
| 맞는 곳 | 애플리케이션 컨테이너 | VM 기반 서버, 쿠버네티스 노드 이미지, 온프레미스 VM |

컨테이너 이미지는 층 캐시와 생태계 때문에 Dockerfile이 표준이다([[dockerfile|Dockerfile]]). Packer는 **VM 이미지**를 코드로 만들 때 쓴다. 쿠버네티스 노드 이미지(EKS 최적화 AMI 등)도 Packer로 만든다.

## 골든 이미지와 불변 인프라

**골든 이미지(golden image)는 OS 패치, 보안 설정, 에이전트, 런타임을 미리 넣어 검증해 둔 표준 기반 이미지다.** Packer는 골든 이미지를 CI에서 정기적으로 다시 굽는 데 쓴다.

| 방식 | 서버가 뜰 때 하는 일 | 장단점 |
| --- | --- | --- |
| 굽기(bake) | 거의 없음. 이미지에 다 들어 있다 | 부팅이 빠르고 모든 서버가 같다. 변경마다 이미지를 다시 굽는다 |
| 볶기(fry) | 부팅 후 구성 관리 도구·스크립트가 설치·설정 | 이미지가 적다. 부팅이 느리고, 그 시점 저장소 상태에 따라 서버가 달라질 수 있다 |

보통은 OS·런타임처럼 느리게 바뀌는 것은 굽고, 환경별 설정과 비밀은 부팅 시 주입한다([[twelve-factor-app|12요소 앱]]). 이렇게 만든 이미지로 서버를 **고치지 않고 교체**하는 것이 **불변 인프라(immutable infrastructure)** 다. 배포는 "새 이미지로 새 인스턴스를 띄우고 옛것을 버린다"가 되어, 서버마다 설정이 어긋나는 구성 드리프트가 생기지 않는다([[terraform-workflow#드리프트와 불변 인프라|드리프트와 불변 인프라]]). 불변 인프라는 특정 제품이 아니라 서버를 계속 「관리」하는 대신 「잘 쓰고 버리는」 배포 방식이다. 오토 스케일링 그룹의 AMI, Heroku 같은 PaaS, 컨테이너 이미지 배포가 모두 이렇게 동작한다. Capistrano로 서버에 코드를 밀어 넣고 Chef로 설정을 맞추던 방식과 달리, 웹 서버·앱 서버·코드를 이미지 하나에 구워 `docker run` 한 줄로 배포하는 것도 같은 발상이다.

### 이미지 계층 관리

조직이 커지면 베이스 이미지를 계층으로 나눠 관리한다. 컨테이너 베이스 이미지에도 같은 구조를 쓴다.

```text
전사 플랫폼 팀: 전역 베이스 이미지 (OS, 커널 설정, 표준 런타임, 보안 에이전트)
   │  검증·서명 후 전역 레지스트리
   ├─ 팀 A: 팀 베이스 이미지 (팀 공통 패키지·설정) → 팀 레지스트리 → 서비스 이미지
   └─ 팀 B: 팀 베이스 이미지 → 팀 레지스트리 → 서비스 이미지
```

- 아래 계층은 위 계층을 상속만 하고, 전역 이미지가 패치되면 하위 이미지를 자동으로 다시 굽는다.
- Packer 템플릿과 프로비저닝 코드(Ansible 플레이북 등)를 같은 저장소에 두고, **베이스 이미지가 바뀌거나 프로비저닝 코드가 바뀌면** CI가 이미지를 다시 굽는다. 같은 플레이북을 개발용 Vagrant 박스에도 써서 개발 환경과 운영 이미지가 같은 코드에서 나오게 한다.
- 이미지마다 버전과 출처를 기록해 어떤 서버·컨테이너가 어떤 베이스 위에서 도는지 추적한다. HCP Packer 같은 이미지 레지스트리가 이 메타데이터를 관리하고, Terraform이 "최신 승인 이미지"를 조회해 쓰게 할 수 있다.
- 취약점 스캔과 서명을 통과한 이미지만 쓰게 한다([[docker-container-operations#이미지 공급망: 베이스 선택, 스캔, 서명|이미지 공급망]]).

## 정리

- Packer는 템플릿 하나로 여러 플랫폼의 이미지를 만든다. 소스 → 프로비저너 → 스냅숏 → 후처리기 순이다.
- 템플릿은 HCL2로 쓰고 `packer init`으로 플러그인을 받은 뒤 `validate`·`build`한다. 자격 증명은 템플릿 밖에 둔다.
- 컨테이너 이미지는 Dockerfile, VM 이미지는 Packer가 맞다.
- 느리게 바뀌는 것은 이미지에 굽고, 서버는 고치지 않고 새 이미지로 교체한다.

관련 노트: [[terraform-workflow|Terraform: 코드로 클라우드 인프라 만들기]], [[cloud-native|클라우드 네이티브와 코드형 인프라]], [[dockerfile|Dockerfile 작성과 컨테이너의 PID 1]], [[ci-cd|CI/CD]], [[deployment-strategies|배포 전략]]
