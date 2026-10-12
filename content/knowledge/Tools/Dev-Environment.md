---
title: "개발 환경"
concept: "Dev Environment"
summary: "운영체제별 터미널·Git 설치, 로컬 HTTPS, 빌드 도구와 IDE 오류, Python 버전 관리처럼 코드를 쓰기 전에 갖춰야 하는 개발 환경 설정 모음."
tags: ["tools", "productivity", "cli"]
source: mixed
date: "2026-10-13"
---

개발 환경은 한 번 제대로 잡아 두면 잊어버리지만, 새 기기나 새 팀에 들어갈 때마다 같은 문제를 다시 만나게 됩니다. 이 묶음에는 Windows와 macOS에서 터미널·Git·언어 런타임을 설치할 때 고를 옵션, 로컬에서 HTTPS를 쓰는 방법, 빌드 도구와 IDE가 말없이 죽을 때 원인을 찾는 법을 정리했습니다. 각 노트는 "왜 필요한지 → 설정 순서 → 자주 만나는 오류" 순서로 읽으면 됩니다.

## 노트

- [Windows 개발 환경: 터미널, Git 설치, 줄바꿈](Tools/Dev-Environment/windows-dev-environment.md): CMD·PowerShell·Git Bash의 차이, Windows용 Git 설치 옵션, CRLF 줄바꿈 오류(Prettier의 `Delete ␍`)
- [로컬 개발 환경에 HTTPS 적용하기](Tools/Dev-Environment/local-https-mkcert.md): mkcert로 로컬 CA·인증서 만들기, 웹 서버·Node·Next.js·Nuxt에 붙이기
- [Java 빌드 도구와 IntelliJ 실행 오류](Tools/Dev-Environment/java-build-tools.md): 빌드와 Ant·Maven·Gradle, JDK 설치, IntelliJ 힙 설정(-Xms > -Xmx) 오류
- [macOS에서 pyenv로 Python 환경 잡기](Tools/Dev-Environment/python-pyenv-setup.md): pyenv로 버전 설치·지정, VSCode 인터프리터 선택, venv로 패키지 분리

Git 자체의 사용법은 [[Tools/Git|Git]]에서 다룹니다.
