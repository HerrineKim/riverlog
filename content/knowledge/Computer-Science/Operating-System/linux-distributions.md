---
title: "리눅스 배포판과 패키지 관리"
concept: "Linux Distribution"
summary: "리눅스 커널과 배포판의 관계, Debian·RHEL·Arch 계열의 차이와 패키지 관리자(apt·dnf·pacman), CentOS가 CentOS Stream으로 바뀐 과정과 Rocky Linux·AlmaLinux 같은 대안, 배포판·커널 버전 확인 방법을 정리한다."
tags: ["os", "linux", "devops", "infra"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/5d5246876b2d45ffb8416ac7e68aa746", "https://80000coding.notion.site/54aafe0b4c2447dea6364de4dcc092b9", "https://80000coding.notion.site/82228175c0df477992b7b23e8afb8f16", "https://www.redhat.com/en/topics/linux/what-is-centos-stream"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「CentOS의 현재」, 「서버 관리 맛보기」, 「write는 라이브러리 함수가 아니다? 커널과 시스템 콜에 대해」를 바탕으로 재구성한 노트입니다.

## 커널과 배포판

엄밀히 **리눅스(Linux)는 커널의 이름**이다. 하드웨어를 관리하고 시스템 콜을 제공하는 프로그램 하나이며, 보통 `/boot/vmlinuz-버전` 파일로 존재한다. 커널만으로는 셸도, 패키지 설치도 할 수 없다.

**배포판(distribution, distro)** 은 커널에 GNU 도구, init 시스템(systemd), 패키지 관리자, 설치 프로그램, 기본 소프트웨어를 묶고 보안 업데이트를 책임지는 운영체제 제품이다. "리눅스 운영체제"라고 할 때는 보통 배포판을 가리킨다. 같은 커널을 써도 배포판마다 패키지 형식, 설정 파일 위치, 업데이트 주기가 다르다.

## 주요 계열

| 계열 | 대표 배포판 | 패키지 형식·관리자 | 성격 |
| --- | --- | --- | --- |
| Debian | Debian, Ubuntu, Linux Mint | `.deb` / `dpkg` + `apt` | 커뮤니티 주도(Debian), 데스크톱·클라우드에서 가장 흔함(Ubuntu) |
| Red Hat | RHEL, Fedora, CentOS Stream, Rocky Linux, AlmaLinux | `.rpm` / `rpm` + `dnf`(과거 `yum`) | 기업용 장기 지원 |
| Arch | Arch Linux, Manjaro | `pacman` | 최소 설치에서 시작, 롤링 릴리스 |
| 경량·특수 | Alpine | `apk` | musl libc와 BusyBox로 아주 작음. 컨테이너 기본 이미지 |

- **LTS와 롤링**: Ubuntu LTS·RHEL은 버전을 고정하고 수년간 보안 패치만 한다. Arch는 버전 없이 계속 최신으로 갱신한다. 서버에는 예측 가능한 고정 릴리스를 쓴다.
- Debian 계열은 보안 모듈로 AppArmor를, Red Hat 계열은 SELinux를 기본으로 켠다([[linux-access-control|리눅스 접근 제어]]).

## 패키지 관리자

패키지 관리자는 **신뢰할 수 있는 저장소에서 소프트웨어를 받아 의존성까지 맞춰 설치·업데이트·삭제**한다. 저장소 패키지는 배포판의 서명으로 검증되므로 웹에서 받은 설치 파일보다 안전하다.

| 작업 | Debian 계열 | Red Hat 계열 |
| --- | --- | --- |
| 저장소 목록 갱신 | `apt update` | (`dnf`가 자동으로 확인) |
| 설치된 패키지 업그레이드 | `apt upgrade` | `dnf upgrade` |
| 설치 | `apt install 패키지` | `dnf install 패키지` |
| 삭제 | `apt remove 패키지` (`purge`는 설정까지) | `dnf remove 패키지` |
| 검색 | `apt search 키워드` | `dnf search 키워드` |
| 패키지 파일 직접 다루기 | `dpkg -i 파일.deb` | `rpm -i 파일.rpm` |

`apt update`는 패키지를 바꾸지 않는다. 저장소의 목록만 새로 받는다. 실제 업그레이드는 `apt upgrade`다. `aptitude`는 같은 `dpkg` 위에서 동작하는 대화형 프런트엔드다.

## CentOS에서 CentOS Stream으로

RHEL은 GPL 등 오픈소스 라이선스의 소프트웨어로 만들어지므로 소스 코드가 공개된다. 이 소스에서 Red Hat 상표만 빼고 다시 빌드한 **무료 클론**이 CentOS였다. 기능은 RHEL과 같고 공식 기술 지원만 없었기 때문에 오랫동안 웹 서버 배포판의 표준이었다.

| 시기 | 사건 |
| --- | --- |
| 2004 | CentOS 첫 릴리스 |
| 2014 | Red Hat이 CentOS 프로젝트와 상표를 인수 |
| 2019 | CentOS 8과 함께 CentOS Stream 발표 |
| 2020.12 | CentOS Linux를 끝내고 Stream에 집중한다고 발표 |
| 2021.12 | CentOS Linux 8 지원 종료 (예정보다 8년 앞당김) |
| 2024.06 | CentOS Linux 7 지원 종료. CentOS Linux 계열 완전 종료 |

**CentOS Stream은 RHEL의 클론이 아니다.** 다음 RHEL 마이너 버전에 들어갈 변경이 먼저 반영되는 **업스트림**이다. 즉 RHEL보다 조금 앞서 가는 개발 브랜치다. 그래서 "RHEL과 똑같은 무료 OS"를 원하던 사용자들이 대안으로 옮겨 갔다.

| 대안 | 특징 |
| --- | --- |
| Rocky Linux | CentOS 공동 창립자가 시작한 RHEL 호환 배포판. 버그까지 RHEL과 맞추는 1:1 호환을 목표로 함 |
| AlmaLinux | CloudLinux가 시작해 재단이 운영. 2023년 Red Hat이 RHEL 소스 공개 방식을 제한한 뒤로는 바이너리 호환(ABI 호환)을 목표로 함 |
| Oracle Linux | Oracle이 배포하는 RHEL 호환판 |
| RHEL 무료 개발자 구독 | 개인·소규모 운영(최대 16대)에 RHEL 자체를 무료로 제공 |

## 내 시스템 확인하기

| 알고 싶은 것 | 명령 |
| --- | --- |
| 배포판 이름·버전 | `cat /etc/os-release` (어디서나), `lsb_release -a` (설치된 경우), `hostnamectl` |
| 커널 버전 | `uname -r` (전체 정보는 `uname -a`), `cat /proc/version` |
| 아키텍처 | `uname -m` (`x86_64`, `aarch64`) |

`/etc/os-release`는 systemd 표준 파일이라 스크립트에서 배포판을 판별할 때 가장 믿을 만하다.

## 정리

- 리눅스는 커널, 배포판은 커널 + 도구 + 패키지 관리 + 업데이트 책임이다.
- Debian 계열은 `apt`, Red Hat 계열은 `dnf`, Alpine은 `apk`를 쓴다.
- CentOS Linux는 끝났고, CentOS Stream은 RHEL의 앞선 개발판이다.
- RHEL 호환이 필요하면 Rocky Linux·AlmaLinux를 고른다.
- **서버는 LTS 배포판으로 버전을 고정하고, 보안 업데이트는 자동으로 받는다.**

관련 노트: [[os-overview|운영체제 개요]], [[kernel-types|커널의 종류]], [[daemon-and-systemd|데몬과 systemd]], [[linux-access-control|리눅스 접근 제어]]
