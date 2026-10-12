---
title: "macOS에서 pyenv로 Python 환경 잡기"
concept: "pyenv"
summary: "macOS의 시스템 Python을 건드리지 않고 pyenv로 원하는 버전을 설치·지정하는 순서와, VSCode에서 그 인터프리터를 고르고 프로젝트별 venv로 패키지를 분리하는 방법."
tags: ["tools", "python", "ide", "productivity"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/301", "https://leesh90.github.io/environment/2021/04/03/python-install/"]
---

> riverkim.kr에 쓴 설정 글을 다시 정리한 노트입니다. 명령어와 버전은 글을 쓴 시점 기준입니다.

macOS에는 시스템용 Python이 미리 깔려 있지만, 운영체제 도구들이 이 버전에 의존하므로 직접 업그레이드하거나 패키지를 섞어 깔지 않는 것이 좋다. 대신 **버전 관리자**를 두고 그 위에 필요한 버전을 설치한다. Node.js의 nvm이 하는 일을 Python에서는 **pyenv**가 맡는다.

## 설치 순서

```bash
brew install pyenv            # 1. 버전 관리자 설치
pyenv install 3.12.4          # 2. 원하는 버전 설치 (예시 버전)
pyenv global 3.12.4           #    셸 어디서나 기본으로 쓸 버전 지정
pip3 install pandas scipy     # 3. 패키지 설치 (Python 3에는 pip3가 함께 들어 있다)
```

| 명령 | 역할 |
| --- | --- |
| `pyenv install <버전>` | 해당 버전을 `~/.pyenv/versions/` 아래에 내려받아 빌드한다 |
| `pyenv global <버전>` | 전역 기본 버전을 바꾼다 |
| `pyenv local <버전>` | 현재 폴더에 `.python-version`을 만들어 프로젝트별 버전을 고정한다 |
| `pyenv versions` | 설치된 버전과 지금 선택된 버전을 보여 준다 |

`python`을 쳤을 때 pyenv가 고른 버전이 뜨지 않으면, 셸 설정 파일(`~/.zshrc`)에 `eval "$(pyenv init -)"`가 들어 있는지 확인한다.

## VSCode에서 인터프리터 고르기

VSCode 쪽은 GUI로 설정한다.

1. 확장 프로그램에서 **Python**(Microsoft)을 설치한다.
2. 하단 상태 표시줄의 Python 버전 영역(또는 명령 팔레트의 `Python: Select Interpreter`)을 눌러 인터프리터를 고른다. 시스템 Python과 실수로 전역에 깐 버전들도 함께 보이므로 **pyenv로 설치한 경로**(`~/.pyenv/versions/...`)를 선택한다.
3. 편집기 오른쪽 위의 실행 버튼(Run Python File in Terminal)으로 현재 터미널에서 실행한다.

## 프로젝트별 패키지 분리: venv

pyenv는 **Python 버전**을, venv는 **프로젝트의 패키지**를 분리한다. 둘은 겹치지 않고 함께 쓴다.

```bash
python -m venv .venv          # 프로젝트 폴더 안에 가상환경 생성
source .venv/bin/activate     # 활성화 (프롬프트 앞에 (.venv)가 붙는다)
pip install -r requirements.txt
```

가상환경을 만든 뒤에는 VSCode 인터프리터도 `.venv/bin/python`으로 바꾼다. Django 프로젝트를 시작할 때도 이 순서를 그대로 따른다([[getting-started-mtv|Django 시작하기와 MTV 패턴]]).

## 정리

- 시스템 Python은 그대로 두고 pyenv로 버전을 설치·지정한다.
- VSCode에서는 pyenv 경로의 인터프리터를 명시적으로 고른다.
- 프로젝트마다 venv를 만들어 패키지를 분리하고, 그 인터프리터를 다시 선택한다.

관련 노트: [[java-build-tools|Java 빌드 도구와 IntelliJ 실행 오류]], [[windows-dev-environment|Windows 개발 환경: 터미널, Git 설치, 줄바꿈]]
