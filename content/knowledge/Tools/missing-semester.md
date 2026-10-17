---
title: "The Missing Semester: CS 교육에서 빠진 도구 학기"
concept: "Missing Semester"
summary: "MIT의 무학점 과정 The Missing Semester는 전공 수업이 가르치지 않는 셸, 편집기, Git, 디버깅, 패키징, 코드 품질 도구와 코딩 에이전트 활용을 9강으로 다룬다. 강의별 핵심 개념과 도구, 이 창고의 관련 노트를 지도처럼 묶었다."
tags: ["tools", "cli", "productivity", "git", "debugging", "learning"]
source: other
date: "2026-10-17"
sources: ["https://missing.csail.mit.edu/", "https://missing.csail.mit.edu/2026/course-shell/", "https://missing.csail.mit.edu/2026/command-line-environment/", "https://missing.csail.mit.edu/2026/development-environment/", "https://missing.csail.mit.edu/2026/debugging-profiling/", "https://missing.csail.mit.edu/2026/version-control/", "https://missing.csail.mit.edu/2026/shipping-code/", "https://missing.csail.mit.edu/2026/agentic-coding/", "https://missing.csail.mit.edu/2026/beyond-code/", "https://missing.csail.mit.edu/2026/code-quality/"]
---

> MIT CSAIL의 「[The Missing Semester of Your CS Education](https://missing.csail.mit.edu/)」 2026년판(2026.01, 9강) 강의 노트를 바탕으로 재구성한 노트다.

## The Missing Semester란

전공 수업은 운영체제, 컴파일러, 머신러닝을 가르친다. 그런데 그 과제를 하는 데 매일 쓰는 **도구의 사용법은 각자 알아서 익히라고 남겨 둔다.** 그래서 많은 사람이 명령어를 외우거나 검색 결과를 복사해 붙이는 수준에 머문다. The Missing Semester는 이 빈칸을 채우는 MIT의 무학점 과정이다.

- **왜 중요한가**: 컴퓨터는 반복 작업을 대신하는 기계인데, 정작 컴퓨터를 쓰는 사람의 작업은 손으로 반복되는 경우가 많다. 도구에 익숙해지면 작업의 마찰이 줄고, 엄두가 안 나던 문제를 풀 수 있게 된다.
- **형식**: 1시간 강의 9회. 강의 노트와 녹화본, 강의별 연습 문제가 무료로 공개된다. 강의마다 독립 주제지만 뒤로 갈수록 앞 내용을 전제한다.
- **깊이**: 도구 하나를 깊게 파지 않는다. 무엇이 있고 왜 쓰는지 보여 주고 더 읽을 자료를 건넨다. 그래서 **입문 지도**로 쓰기에 좋다.
- **AI의 위치**: AI 도구는 따로 떼지 않고 각 강의에 녹여 다룬다. 코딩 에이전트만 전용 강의가 있다.

## 강의 지도 (2026년판)

| 강의 | 핵심 개념 | 대표 도구 | 창고의 관련 노트 |
| --- | --- | --- | --- |
| 셸 입문 | 명령·인자·따옴표, `PATH`, 파이프와 리다이렉션, 엄격한 스크립트 | `grep` `sed` `find` `awk` `xargs` `jq` `shellcheck` | — |
| 명령줄 환경 | 표준 스트림, 반환 코드, 시그널, 작업 제어, SSH, dotfiles | `fzf` `rg` `fd` `tldr` `ssh` `rsync` `tmux` | [[tmux\|tmux: 터미널 멀티플렉서]] |
| 개발 환경과 도구 | 모달 편집, 언어 서버(LSP), 자동완성·인라인 채팅 | Vim, VS Code, Dev Containers, Remote SSH | [[vim-and-neovim\|Vim과 Neovim]], [[vscode\|VS Code 설정과 활용]] |
| 디버깅과 프로파일링 | 로그·디버거·시스템 콜 추적, CPU·메모리 프로파일링, 벤치마크 | `gdb`/`lldb`/`pdb`, `strace`, ASan, `perf`, FlameGraph, `hyperfine` | [[Chrome-DevTools\|Chrome DevTools]] |
| 버전 관리와 Git | 스냅샷·커밋 DAG·참조로 이루어진 데이터 모델 | `git add -p` `rebase -i` `bisect` `worktree` | [[git-internals\|Git의 내부 구조: 객체와 인덱스]] |
| 패키징과 배포 | 아티팩트와 환경 가정, 버전 지정과 락 파일, 컨테이너, 설정 분리 | `uv`, `pyproject.toml`, Docker, Compose, Nix | [[vm-vs-container\|VM과 컨테이너]], [[dockerfile\|Dockerfile 작성과 컨테이너의 PID 1]] |
| 에이전틱 코딩 | LLM과 에이전트 루프, 피드백 루프, 컨텍스트 관리 | 코딩 에이전트, `AGENTS.md`, MCP, 서브에이전트 | [[claude-code-guide\|Claude Code 활용 가이드]], [[ai-coding-guardrails\|AI 코딩 실무 가드레일]] |
| 코드 너머 | 이유를 남기는 글쓰기, 기여·리뷰 예절, 질문하는 법, AI 사용 공개 | README, 커밋 메시지, 최소 재현 예제 | [[review-communication\|리뷰 코멘트와 PR 소통]] |
| 코드 품질 | 포매터·린터·테스트·커버리지를 커밋 전과 CI에서 자동 실행 | Prettier, Ruff, semgrep, pre-commit, GitHub Actions, `just` | [[ci-cd\|CI/CD]], [[commit-convention\|커밋 컨벤션과 자동 검사]] |

## 강의별로 남는 원칙

### 1. 셸은 작은 프로그램을 잇는 언어다

`sort`, `uniq`, `grep`처럼 한 가지만 하는 프로그램을 **파이프로 이어** 큰 일을 한다. 스크립트는 `set -euo pipefail`로 실패를 숨기지 않게 만들고 `shellcheck`으로 흔한 실수를 잡는다. 셸이 실행 파일을 찾는 경로는 `PATH`이고, `which`로 무엇이 실행되는지 확인한다.

### 2. 편집기와 IDE: 이동과 편집을 조합한다

Vim은 이동 명령과 편집 명령을 조합하는 **모달 편집기**다. Vim 모드는 VS Code 확장, Zsh, 코딩 에이전트의 입력창에서도 쓸 수 있어 한 번 익히면 여러 곳에서 통한다. IDE의 자동완성, 정의로 이동, 참조 찾기, 실시간 타입 검사는 **언어 서버(Language Server Protocol)** 가 제공한다. 언어 서버가 패키지를 못 찾으면 인터프리터·가상 환경 지정부터 확인한다.

### 3. 디버깅은 가설을 좁히는 일이다

printf와 로그로 시작하고, 부족하면 디버거로 멈춰 보고, 그래도 안 보이면 시스템 콜(`strace`)·네트워크(`tcpdump`, Wireshark)·메모리(Sanitizer, Valgrind)를 들여다본다. 느린 코드는 **추측하지 말고 프로파일러로 잰다.** 두 구현을 비교할 때는 `hyperfine` 같은 벤치마크 도구로 여러 번 돌린다.

### 4. Git은 명령보다 데이터 모델로 이해한다

저장소는 **객체(blob·tree·commit)와 참조(브랜치, `HEAD`)의 집합**이다. 객체는 해시로 저장되어 바뀌지 않고, 모든 Git 명령은 이 그래프에 객체를 더하거나 참조를 옮긴다. 이 그림이 있으면 `reset`, `rebase`, `revert`의 차이가 명령 암기 없이 보인다.

### 5. 배포는 아티팩트의 가정을 드러내는 일이다

내 컴퓨터에서 돌던 코드가 다른 곳에서 안 도는 이유는 **아티팩트가 환경에 대해 말하지 않은 가정** 때문이다.

| 문제 | 도구와 원칙 |
| --- | --- |
| 의존성 충돌 | 프로젝트마다 가상 환경으로 격리한다 |
| 버전 지정 | 라이브러리는 느슨한 범위, 애플리케이션은 락 파일로 정확히 고정한다 |
| 버전 번호의 뜻 | SemVer(MAJOR.MINOR.PATCH) 또는 날짜 기반 CalVer |
| 환경 통째로 옮기기 | 컨테이너(이미지는 템플릿, 컨테이너는 실행 인스턴스). 더 엄격하면 Nix·Bazel 같은 밀폐 빌드 |
| 환경별 차이 | 같은 코드에 설정만 바꿔 배포한다. 비밀 값은 저장소에 넣지 않는다 |

### 6. 코딩 에이전트는 지도가 필요한 인턴처럼 다룬다

에이전트는 도구(파일 읽기·쓰기, 셸 실행, 검색)를 쓸 수 있는 LLM이고, 매 턴 전체 대화와 도구 결과를 다시 입력으로 넣는 **루프**로 동작한다.

- **피드백 루프를 준다.** 타입 검사·테스트를 에이전트가 직접 돌리게 하면 스스로 고친다. 테스트를 먼저 쓰고 검토한 뒤 구현을 맡기는 방식이 잘 맞는다.
- **컨텍스트를 관리한다.** 관계없는 작업은 새 대화로, 반복 지침은 `AGENTS.md`에, 필요할 때만 여는 지식은 스킬로, 큰 탐색은 서브에이전트로 나눈다.
- **검증 책임은 사람에게 있다.** 출력의 정확성과 보안 버그를 검토하고, 검증이 작성보다 어려운 핵심 코드는 직접 쓰는 것도 고려한다. 권한 확인을 끄는 자율 모드는 VM·컨테이너 같은 격리 환경에서만 쓴다.

### 7. 코드 너머: 미래의 독자에게 이유를 남긴다

코드는 **무엇을** 하는지 보여 주지만 **왜**는 시간이 지나면 사라진다. 주석에는 코드가 말할 수 없는 이유(상수의 근거, 택하지 않은 대안, 오래 걸린 디버깅의 교훈)를, 커밋 메시지에는 문제·대안·트레이드오프를 남긴다. 한 커밋에는 한 가지 변경만 담아 리뷰와 `git bisect`를 쉽게 한다. 오픈소스에 기여할 때는 기존 이슈를 먼저 찾고, 버그는 **최소 재현 예제**와 함께 올리며, 설명할 수 없는 AI 생성 코드는 제출하지 않는다. AI가 의미 있게 기여했으면 그 사실을 밝힌다.

### 8. 품질 검사는 사람 대신 기계가 반복한다

포매터는 스타일 논쟁을 없애고, 린터는 실행 없이 안티패턴을 찾고, 테스트와 커버리지는 동작을 지킨다. 이것들을 **pre-commit 훅으로 커밋 전에, CI로 푸시마다** 자동 실행한다. CI에서는 코드를 고치지 않고 검사만 한다. 긴 명령은 `just` 같은 명령 실행기나 npm `scripts`로 짧은 이름을 붙인다. 커버리지 수치는 지표일 뿐이고 목표는 테스트의 질이다.

## 역사

| 판 | 특징 |
| --- | --- |
| 2019 | 첫 개설. 백업, 자동화, 보안과 프라이버시, 웹과 브라우저 같은 특별 주제가 있었다 |
| 2020 | 셸·Vim·데이터 다루기·명령줄 환경·Git·디버깅·메타프로그래밍·보안과 암호학으로 정리된 판. 오랫동안 표준 판본으로 쓰였다 |
| 2026 | 패키징과 배포, 에이전틱 코딩, 코드 너머, 코드 품질이 새로 들어오고 AI 활용이 전 강의에 녹아들었다 |

2020년판에만 있는 데이터 다루기(Data Wrangling)와 보안·암호학 강의는 지금도 사이트에서 볼 수 있다.

## 정리

- 전공이 가르치지 않는 도구 숙련은 따로 시간을 들여 익혀야 하고, 그만큼 매일의 마찰이 줄어든다.
- 셸은 작은 프로그램을 잇는 언어, Git은 객체와 참조의 그래프, 배포는 환경 가정을 드러내는 일이다.
- 성능은 재고, 품질 검사는 훅과 CI로 자동화한다.
- 코딩 에이전트에는 피드백 루프와 정돈된 컨텍스트를 주고, 검증 책임은 사람이 진다.
- 코드에는 무엇을, 주석·커밋에는 왜를 남긴다.

관련 노트: [[tmux|tmux: 터미널 멀티플렉서]], [[vim-and-neovim|Vim과 Neovim]], [[git-internals|Git의 내부 구조: 객체와 인덱스]], [[claude-code-guide|Claude Code 활용 가이드]], [[sustainable-learning-loop|개발자의 지속 가능한 학습 루프]]
