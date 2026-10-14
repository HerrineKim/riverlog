---
title: "리눅스 접근 제어: DAC, MAC, sudo"
concept: "Access Control"
summary: "리눅스가 누가 무엇을 할 수 있는지 정하는 방식. 소유자가 권한을 정하는 DAC(rwx·setuid), 커널 정책이 강제하는 MAC(AppArmor·SELinux), 관리자 권한을 빌려 쓰는 sudo와 sudoers 문법, 비밀번호 정책을 맡는 PAM을 정리한다."
tags: ["os", "linux", "security", "devops"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/475d966a41884db380adcb3755a995b6", "https://80000coding.notion.site/82ab87b33eec4ea097349c918ac29301", "https://80000coding.notion.site/54aafe0b4c2447dea6364de4dcc092b9", "https://80000coding.notion.site/369d9cf9c1a4418f8efb4943ea952da4", "https://www.sudo.ws/docs/man/sudoers.man/"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「AppArmor를 좀 더 알아보자!」, 「sudo를 비밀번호 없이 실행해보자」, 「서버 관리 맛보기」, 「여러분은 인터넷에 있는 파일을 의심해본 적이 있나요?!!」를 바탕으로 재구성한 노트입니다.

## 두 가지 접근 제어 모델

| 구분 | DAC (임의 접근 제어) | MAC (강제 접근 제어) |
| --- | --- | --- |
| 누가 정하나 | 파일 **소유자**가 마음대로 | 관리자가 정한 **시스템 정책** |
| 기준 | 사용자·그룹 ID | 프로그램·파일에 붙은 보안 레이블이나 경로 프로필 |
| root | 모든 검사를 통과 | **root도 정책을 어길 수 없다** |
| 리눅스 구현 | 파일 권한 비트, ACL | LSM(Linux Security Module): AppArmor, SELinux |

DAC만 있으면 root 권한을 탈취한 공격자가 시스템 전체를 갖는다. 웹 서버처럼 외부에 노출된 프로그램의 취약점 하나가 곧 전체 장악이 된다. MAC은 "이 프로그램은 이 파일만 읽을 수 있다"를 커널이 강제해 **피해 범위를 프로그램 단위로 가둔다.** 두 모델은 함께 동작한다. DAC와 MAC 검사를 모두 통과해야 접근이 허용된다.

## DAC: 파일 권한

```text
-rwxr-x---  1 alice dev  script.sh
 │└┬┘└┬┘└┬┘
 │ │  │  └ 기타 사용자: 권한 없음
 │ │  └ 그룹(dev): 읽기·실행
 │ └ 소유자(alice): 읽기·쓰기·실행
 └ 파일 종류 (- 일반, d 디렉터리, l 링크)
```

| 권한 | 파일 | 디렉터리 |
| --- | --- | --- |
| r (4) | 내용 읽기 | 목록 보기 |
| w (2) | 내용 쓰기 | 안의 파일 만들기·지우기·이름 바꾸기 |
| x (1) | 실행 | 들어가기(`cd`), 안의 파일에 접근 |

- `chmod 750 script.sh`, `chown alice:dev script.sh`로 바꾼다. 새 파일의 기본 권한은 `umask`가 빼는 비트로 정해진다.
- 특수 비트: **setuid**(실행하는 동안 파일 소유자의 권한으로 동작, 예: `passwd`), **setgid**(그룹 권한으로, 디렉터리에 붙이면 새 파일이 그 그룹을 상속), **sticky**(`/tmp`처럼 남의 파일을 지울 수 없게).
- setuid root 프로그램은 버그가 곧 권한 상승이므로 공격자가 가장 먼저 찾는 대상이다.
- 사용자·그룹마다 세밀하게 주려면 ACL(`setfacl`·`getfacl`)을 쓴다.

## MAC: AppArmor와 SELinux

| 구분 | AppArmor | SELinux |
| --- | --- | --- |
| 기본 탑재 | Ubuntu, Debian, SUSE | RHEL, Fedora, Rocky·AlmaLinux, Android |
| 대상 지정 | 실행 파일 **경로**별 프로필 | 모든 파일·프로세스에 붙은 **레이블(컨텍스트)** |
| 정책 작성 | 비교적 쉽다 | 강력하지만 복잡하다 |
| 상태 확인 | `aa-status` | `getenforce`, `sestatus` |

AppArmor 프로필은 `/etc/apparmor.d/`에 있고, 프로그램이 접근할 수 있는 파일 경로·권한, 네트워크, 기능(capability)을 나열한다. 모드는 둘이다.

| 모드 | 동작 |
| --- | --- |
| enforce | 프로필에 없는 접근을 **막고** 기록 |
| complain | 막지 않고 기록만. 새 프로필을 만들 때 쓴다 |

`aa-genprof`로 프로그램을 실제로 실행하며 접근 기록을 모아 허용·거부를 하나씩 정하면 프로필이 만들어진다. 프로필로 읽기를 막은 파일은 root로 실행해도 `Permission denied`가 난다. 정책은 프로그램 단위로 붙으므로, 스크립트 안에서 부르는 `cat` 같은 하위 프로그램의 동작까지 제한할 수 있다. 컨테이너 런타임도 컨테이너마다 기본 AppArmor·SELinux 프로필을 씌운다.

## sudo와 sudoers

root로 로그인해 일하는 것은 위험하다. 실수 한 번이 시스템 전체에 미치고, 누가 무엇을 했는지 남지 않는다. **sudo**는 일반 사용자가 필요한 명령만 다른 사용자(보통 root) 권한으로 실행하게 하고, 실행 기록을 남긴다.

정책은 `/etc/sudoers`와 `/etc/sudoers.d/*`에 있다. **반드시 `visudo`로 편집한다.** 문법 오류를 저장 전에 잡아 준다. 오류가 난 sudoers는 sudo 자체를 막아 버린다.

```text
# 누가   어느 호스트에서 = (누구로:어느 그룹으로)  무엇을
alice    ALL          = (ALL:ALL)            ALL
%dev     ALL          = (root)               /usr/bin/systemctl restart myapp
deploy   ALL          = (root) NOPASSWD:     /usr/bin/systemctl restart myapp
```

| 필드 | 뜻 |
| --- | --- |
| 사용자 / `%그룹` | 규칙이 적용될 대상. 그룹 앞에는 `%` |
| 호스트 | 같은 sudoers 파일을 여러 서버에 배포할 때 어느 호스트에서 유효한지. 보통 `ALL` |
| `(runas)` | 어떤 사용자·그룹으로 실행할 수 있나. 생략하면 root |
| 명령 | 허용할 명령의 **절대 경로**. `ALL`은 전부 |
| `NOPASSWD:` | 비밀번호 묻지 않기. 자동화 계정에 특정 명령만 열 때 쓴다 |

- 한 사용자에게 여러 규칙이 해당하면 **마지막으로 일치한 규칙**이 적용된다. 개인 규칙을 그룹 규칙보다 뒤에 둬야 의도대로 동작한다.
- 셸·편집기·`find`처럼 다른 명령을 실행할 수 있는 프로그램을 허용하면 사실상 root 전체를 주는 것과 같다.
- `Defaults` 줄로 로그 파일(`logfile`), 입출력 기록(`log_input`·`log_output`), 비밀번호 재시도 횟수(`passwd_tries`), 허용 경로(`secure_path`), TTY 요구(`requiretty`)를 정한다.
- Debian 계열은 `sudo` 그룹, RHEL 계열은 `wheel` 그룹에 사용자를 넣는 것이 관례다.

## PAM과 비밀번호 정책

로그인·`sudo`·`passwd`의 인증 방식은 각 프로그램이 직접 구현하지 않고 **PAM**(Pluggable Authentication Modules)에 맡긴다. `/etc/pam.d/`의 설정에 모듈을 쌓아 정책을 바꾼다.

| 설정 | 하는 일 |
| --- | --- |
| `/etc/login.defs` | 비밀번호 만료(`PASS_MAX_DAYS`), 변경 최소 간격, 만료 경고 일수. 새로 만드는 계정에 적용 |
| `pam_pwquality` (`/etc/security/pwquality.conf`) | 최소 길이, 문자 종류, 사용자 이름 포함 금지, 이전 비밀번호와 다른 글자 수 |
| `chage` | 기존 계정의 만료 설정 변경 |

## 정리

- DAC는 소유자가 정하고 root가 우회한다. MAC은 커널이 강제하고 root도 막는다.
- 외부에 노출된 데몬에는 AppArmor·SELinux 프로필로 접근 범위를 가둔다.
- 관리 작업은 root 로그인 대신 sudo로, sudoers는 `visudo`로 고친다.
- `NOPASSWD`는 특정 명령에만, 다른 명령을 띄울 수 있는 프로그램은 허용하지 않는다.
- **최소 권한 원칙**: 필요한 사용자에게, 필요한 명령만, 필요한 동안만.

관련 노트: [[file-system|파일 시스템]], [[virtualization|가상화와 하이퍼바이저]], [[security|정보 시스템 보안]], [[daemon-and-systemd|데몬과 systemd]]
