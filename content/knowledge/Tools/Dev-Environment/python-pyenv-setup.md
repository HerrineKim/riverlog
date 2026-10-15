---
title: "macOS에서 pyenv로 Python 환경 잡기"
concept: "pyenv"
summary: "macOS의 시스템 Python을 건드리지 않고 pyenv로 원하는 버전을 설치·지정하는 순서와, VSCode에서 그 인터프리터를 고르고 프로젝트별 venv로 패키지를 분리하는 방법. 버전·가상환경·패키지를 한 번에 다루는 uv도 함께 정리했다."
tags: ["tools", "python", "ide", "productivity"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/301", "https://leesh90.github.io/environment/2021/04/03/python-install/", "https://github.com/pyenv/pyenv", "https://docs.astral.sh/uv/"]
---

> riverkim.kr에 쓴 설정 글을 다시 정리하고, 명령은 [pyenv](https://github.com/pyenv/pyenv)·[uv](https://docs.astral.sh/uv/) 공식 문서로 확인한 노트다.

macOS에는 Xcode Command Line Tools와 함께 시스템용 `python3`가 깔리지만, 운영체제 도구들이 이 버전에 의존하므로 직접 업그레이드하거나 패키지를 섞어 깔지 않는 것이 좋다. 대신 **버전 관리자**를 두고 그 위에 필요한 버전을 설치한다. Node.js의 nvm이 하는 일을 Python에서는 **pyenv**가 맡는다.

## 설치 순서

```bash
brew install pyenv            # 1. 버전 관리자 설치
pyenv install 3.15            # 2. 3.15 계열 최신 패치 버전 설치 (앞자리만 써도 된다)
pyenv global 3.15             #    셸 어디서나 기본으로 쓸 버전 지정
```

| 명령 | 역할 |
| --- | --- |
| `pyenv install <버전>` | 해당 버전을 `~/.pyenv/versions/` 아래에 내려받아 빌드한다 |
| `pyenv global <버전>` | 전역 기본 버전을 바꾼다 |
| `pyenv local <버전>` | 현재 폴더에 `.python-version`을 만들어 프로젝트별 버전을 고정한다 |
| `pyenv versions` | 설치된 버전과 지금 선택된 버전을 보여 준다 |

`python`을 쳤을 때 pyenv가 고른 버전이 뜨지 않으면 셸 설정 파일(`~/.zshrc`)에 pyenv 초기화 줄이 있는지 확인한다.

```bash
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init - zsh)"
```

어떤 버전을 고를지는 [python.org의 지원 중인 버전 목록](https://devguide.python.org/versions/)을 본다. 보안 패치가 끝난 버전(EOL)은 새 프로젝트에 쓰지 않는다.

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

## 대안: uv로 한 번에

[uv](https://docs.astral.sh/uv/)는 Rust로 만든 파이썬 프로젝트 관리 도구다. **Python 버전 설치, 가상환경, 패키지 설치, 의존성 잠금**을 명령 하나로 처리하고 pip보다 훨씬 빠르다. pyenv + venv + pip 조합을 대신할 수 있어 새 프로젝트에서 많이 쓴다.

```bash
brew install uv
uv python install 3.15        # Python 버전 설치
uv init my-project            # pyproject.toml이 있는 프로젝트 생성
cd my-project
uv add pandas scipy           # 패키지 추가 (.venv와 uv.lock 자동 관리)
uv run main.py                # 프로젝트 가상환경에서 실행
```

| 하는 일 | pyenv + venv + pip | uv |
| --- | --- | --- |
| Python 버전 | `pyenv install` | `uv python install` |
| 가상환경 | `python -m venv .venv` + `activate` | 자동 (`.venv`) |
| 패키지 | `pip install -r requirements.txt` | `uv add`, `uv sync` |
| 잠금 파일 | 따로 도구 필요 | `uv.lock` |

## 정리

- 시스템 Python은 그대로 두고 pyenv로 버전을 설치·지정한다.
- VSCode에서는 pyenv 경로의 인터프리터를 명시적으로 고른다.
- 프로젝트마다 venv를 만들어 패키지를 분리하고, 그 인터프리터를 다시 선택한다.
- 새 프로젝트라면 버전·가상환경·패키지를 한 번에 다루는 uv도 고려한다.

관련 노트: [[java-build-tools|Java 빌드 도구와 IntelliJ 실행 오류]], [[windows-dev-environment|Windows 개발 환경: 터미널, Git 설치, 줄바꿈]]
