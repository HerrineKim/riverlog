---
title: "Windows 개발 환경: 터미널, Git 설치, 줄바꿈"
concept: "Windows Dev Setup"
summary: "터미널·셸의 뜻과 CMD·PowerShell·Git Bash의 차이, Windows용 Git 설치 때 고를 옵션, 그리고 Windows에서 자주 만나는 CRLF 줄바꿈 오류(Prettier의 Delete ␍)를 정리한 노트."
tags: ["tools", "cli", "git", "productivity"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/231", "https://riverkim.kr/142", "https://riverkim.kr/85"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트다.

Windows에서 웹 개발을 시작하면 macOS·Linux 중심으로 쓰인 문서와 어긋나는 부분이 몇 군데 생긴다. 어떤 터미널을 쓸지, Git을 어떻게 설치할지, 줄바꿈 문자가 왜 린트 오류를 내는지가 대표적이다.

## 터미널과 셸

| 용어 | 뜻 |
| --- | --- |
| 터미널(Terminal) | 원래는 여러 사용자가 한 대의 유닉스 컴퓨터에 접속하던 단말 장치. 지금은 **명령어를 입력해 컴퓨터를 제어하는 프로그램**을 가리킨다. 모든 운영체제에 기본 터미널이 있다 |
| 셸(Shell) | 터미널 안에서 입력한 명령을 해석해 운영체제에 전달하는 소프트웨어 |
| CLI(Command Line Interface) | 이렇게 명령어로 다루는 방식 자체 |

유닉스·리눅스 계열 셸에는 sh, ksh, csh, bash, zsh 등이 있다. Windows는 과거에는 CMD가 기본 셸이었고, 지금은 PowerShell이 기본 셸이며 Windows 11의 기본 터미널 앱인 **Windows Terminal**이 여러 셸을 탭으로 띄운다.

## CMD, PowerShell, Git Bash

VS Code 터미널 드롭다운에 보이는 셸들은 다음과 같이 다르다.

| 셸 | 특징 |
| --- | --- |
| Command Prompt(CMD) | Windows의 전통적인 셸. 복잡한 스크립트를 짜기 어렵다 |
| PowerShell | cmdlet이라는 별도 명령 집합을 쓰고, 파이프로 한 명령의 결과(객체)를 다음 명령에 넘길 수 있다. CMD로 하던 작업은 모두 할 수 있다 |
| Git Bash | Git for Windows에 함께 설치되는 **bash** 환경. Windows에서 Git 명령과 `ls`, `rm` 같은 유닉스 명령을 함께 쓸 수 있다 |
| Git CMD | CMD에서 Git 명령을 쓸 수 있게 한 것 |
| WSL(Windows Subsystem for Linux) | Windows 안에서 실제 리눅스 배포판(Ubuntu 등)을 돌린다. `wsl --install` 한 줄로 설치한다 |

bash는 GNU 프로젝트에서 Brian Fox가 만든 유닉스 셸로, 리눅스의 사실상 표준 셸이다. 튜토리얼 대부분이 bash 문법으로 쓰여 있으므로 Windows에서는 **Git Bash를 기본 터미널로 두면** 문서 속 명령을 거의 그대로 따라 할 수 있다. 리눅스 서버와 같은 환경(Docker, 네이티브 빌드 도구)이 필요하면 **WSL 2**에서 개발하는 편이 낫다. VS Code는 WSL 안의 폴더를 그대로 열 수 있다.

## Windows에 Git 설치하기

[git-scm.com](https://git-scm.com/)에서 Windows용 설치 파일을 받아 실행한다. 대부분 기본값으로 두되 두 가지는 직접 고른다.

| 설치 옵션 | 고를 것 |
| --- | --- |
| Default editor | 커밋 메시지 등을 쓸 때 Git이 여는 에디터. VS Code를 쓰면 VS Code를 고른다 |
| Initial branch name | `git init`이 만드는 기본 브랜치 이름. 팀 컨벤션이 없다면 `main`을 고른다(이름이 바뀐 배경과 `init.defaultBranch` 설정은 [[git-basics\|Git 기본 명령과 파일 상태]] 참고) |

설치 후에는 사용자 이름과 이메일을 먼저 등록한다.

```bash
git config --global user.name "이름"
git config --global user.email "메일 주소"
```

## 줄바꿈 문제: `Delete ␍` 오류

ESLint에 Prettier를 붙인 프로젝트를 Windows에서 열면 모든 줄 끝에 `Delete ␍ (prettier/prettier)` 오류가 뜨는 경우가 있다.

| 항목 | 내용 |
| --- | --- |
| 증상 | 파일의 거의 모든 줄에 `Delete ␍` 린트 오류 |
| 원인 | Windows의 줄바꿈은 CRLF(`\r\n`), macOS·Linux는 LF(`\n`)다. Prettier의 기본 줄바꿈 설정은 LF인데, Windows용 Git이 체크아웃할 때 LF를 CRLF로 바꿔 놓으면(`core.autocrlf=true`) 남는 `\r`(␍)을 지우라고 한다 |
| 해결 1 | Prettier 설정에 `"endOfLine": "auto"`를 넣어 기존 줄바꿈을 그대로 인정한다 |
| 해결 2 | 저장소 전체를 LF로 통일한다. `git config --global core.autocrlf false`로 변환을 끄거나 `.gitattributes`에 `* text=auto eol=lf`를 두고, 에디터의 줄바꿈도 LF로 맞춘다 |

팀에 Windows와 macOS 사용자가 섞여 있다면 **해결 2처럼 저장소 단위로 LF를 강제**해야 사람마다 diff가 통째로 바뀌는 일을 막을 수 있다. 관련 논의는 [Stack Overflow: Why do I keep getting Delete 'cr'](https://stackoverflow.com/questions/53516594/why-do-i-keep-getting-delete-cr-prettier-prettier)에 있다.

## 정리

- 터미널은 명령을 입력하는 창, 셸은 그 명령을 해석하는 프로그램이다.
- Windows에서는 Git Bash를 쓰면 bash 기반 문서를 그대로 따라 하기 쉽다. 리눅스와 같은 환경이 필요하면 WSL 2를 쓴다. PowerShell은 CMD를 대체하는 강력한 Windows 셸이다.
- Git 설치 때 에디터와 기본 브랜치 이름(`main`)만 직접 고른다.
- `Delete ␍`는 CRLF와 LF의 충돌이다. 혼자면 `endOfLine: "auto"`, 팀이면 저장소 단위로 LF 통일.

관련 노트: [[git-basics|Git 기본 명령과 파일 상태]], [[remote-github|원격 저장소와 GitHub]]
