---
title: "tmux: 터미널 멀티플렉서"
concept: "tmux"
summary: "터미널 하나에서 여러 세션·창·분할 화면을 다루고, SSH 연결이 끊겨도 작업을 서버에 살려 두는 터미널 멀티플렉서 tmux의 개념과 기본 키."
tags: ["tools", "cli", "terminal", "productivity"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/513a28227b7d4b9ba680d8236f8fb21d", "https://missing.csail.mit.edu/2020/command-line/", "https://github.com/tmux/tmux/wiki/Getting-Started"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「Terminal Multiplexer(tmux) 짧은 소개」를 바탕으로 재구성한 노트입니다. 원 자료는 MIT 「[The Missing Semester](https://missing.csail.mit.edu/2020/command-line/)」의 Command-line Environment 강의입니다.

## 터미널 멀티플렉서란

**터미널 멀티플렉서(terminal multiplexer)** 는 터미널 창 하나 안에서 여러 개의 셸을 띄우고, 그 셸들을 터미널과 떼어 백그라운드에 살려 두는 프로그램이다. 대표가 **tmux**이고, 더 오래된 GNU screen, 설정이 쉬운 Zellij가 있다.

| 쓰는 상황 | tmux 없이 | tmux로 |
| --- | --- | --- |
| SSH로 서버에 붙어 여러 작업을 동시에 | 접속을 여러 번 연다 | 접속 하나에서 창·분할 화면을 나눈다 |
| 오래 걸리는 작업을 돌려 두고 다른 일 | `&`, `nohup`으로 백그라운드 실행 | 그 창은 두고 다른 창으로 간다 |
| 작업 중 연결이 끊김 | 셸과 함께 작업이 죽는다(`nohup` 제외) | 세션이 서버에 남아 다시 붙으면 그대로다 |
| 한 화면에서 에디터·서버 로그·셸을 같이 | 터미널 앱의 탭·분할 기능 | 어느 터미널에서든 같은 배치를 재현 |

`nohup`은 프로그램 하나를 끊김에서 살려 줄 뿐이고, 화면 출력이나 대화형 프로그램(에디터, REPL)은 다시 볼 수 없다. tmux는 셸 자체를 살려 두므로 다시 붙으면 화면까지 그대로다.

## 구성: 세션 › 창 › 패인

```text
tmux 서버
└─ 세션(session)      "work", "blog" 처럼 작업 단위. detach해도 남는다
   └─ 창(window)      브라우저 탭처럼 전환하는 전체 화면
      └─ 패인(pane)   한 창을 가로·세로로 나눈 각각의 셸
```

## 기본 사용법

tmux의 단축키는 모두 **프리픽스 키**(기본 `Ctrl-b`)를 먼저 누른 뒤 다음 키를 누른다. 아래 표의 `<p>`가 프리픽스다.

| 동작 | 명령 · 키 |
| --- | --- |
| 새 세션 시작 | `tmux new -s work` |
| 세션 목록 | `tmux ls` |
| 세션에 다시 붙기 | `tmux attach -t work` (`tmux a`는 마지막 세션) |
| 세션에서 떼기(detach) | `<p> d` |
| 새 창 / 다음·이전 창 | `<p> c` / `<p> n`, `<p> p` |
| 창 번호로 이동 | `<p> 0`~`<p> 9` |
| 세로 분할 / 가로 분할 | `<p> %` / `<p> "` |
| 패인 이동 | `<p> 방향키` |
| 현재 패인 확대 토글 | `<p> z` |
| 스크롤·복사 모드 | `<p> [` (빠져나오기 `q`) |
| 패인 닫기 | `exit` 또는 `<p> x` |

설정은 `~/.tmux.conf`에 둔다. 프리픽스를 `Ctrl-a`로 바꾸거나 마우스 스크롤을 켜는 정도로 시작하는 경우가 많다.

```bash
# ~/.tmux.conf
set -g mouse on            # 마우스로 패인 선택·크기 조절·스크롤
set -g base-index 1        # 창 번호를 1부터
```

## 정리

- tmux는 터미널 하나에서 세션·창·패인을 나누고, 세션을 터미널과 떼어 살려 둔다.
- 원격 서버 작업의 핵심 이점은 **연결이 끊겨도 작업과 화면이 남는다**는 것이다.
- 모든 키는 프리픽스(`Ctrl-b`) 다음에 누른다. `d`로 떼고 `tmux attach`로 다시 붙는다.

관련 노트: [[vim-and-neovim|Vim과 Neovim]], [[vim-tips|Vim 편집 기술]]
