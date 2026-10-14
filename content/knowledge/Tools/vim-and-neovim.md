---
title: "Vim과 Neovim"
concept: "Vim"
summary: "ed에서 vi, Vim, Neovim으로 이어진 모드형 편집기의 계보와 두 편집기의 차이, 설정 파일과 플러그인 관리, 편집기 밖에서 Vim 키를 쓰는 방법(man 페이지, Vimium)."
tags: ["tools", "vim", "editor", "cli", "productivity"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/216dcb7b968742abbf4028ae8e6b8caa", "https://80000coding.notion.site/014aa6329e3e4e39bf1b8fe1688a9f84", "https://80000coding.notion.site/7cf061c6a49541a4a80a747a3a3fe2d8", "https://80000coding.notion.site/2a61bdb018be4efdaf5709ecc66df1cf", "https://neovim.io/doc/user/pack.html"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「ed에서 vi/vim을 거쳐 neovim까지」, 「생산성 향상을 위한 Vim 커스터마이징」, 「man 페이지를 vim으로 열어보자!」, 「[Vimium] 웹브라우저를 Vim 처럼.」을 바탕으로 재구성한 노트입니다.

## Vim이란

Vim은 **모드(mode)를 나눠 키 입력의 의미를 바꾸는 터미널 텍스트 편집기**다. 입력 모드에서는 글자를 쓰고, 노멀 모드에서는 같은 키가 이동·삭제·복사 명령이 된다. 마우스 없이 손을 홈 row에 둔 채 편집할 수 있고, 거의 모든 유닉스 계열 서버에 `vi`가 깔려 있어 SSH로 접속한 환경에서도 바로 쓸 수 있다. Git 커밋 메시지의 기본 편집기도 대개 Vim이다.

## 계보: ed → vi → Vim → Neovim

| 편집기 | 등장 | 특징 |
| --- | --- | --- |
| ed | 1969, 유닉스 | 한 줄씩 다루는 라인 편집기. 줄을 찾고 고른 뒤 고치고 다시 출력해 확인해야 했다 |
| vi | 1976, Bill Joy | 화면 전체를 보며 편집하는 *visual* 편집기. 모드와 `hjkl` 이동이 이때 생겼다 |
| Vim | 1991, Bram Moolenaar | vi 호환 + 구문 강조, 다단계 실행 취소, 분할 창, 스크립트(Vimscript). 이름은 *Vi IMproved* |
| Neovim | 2014 | Vim을 포크해 코드를 정리하고 Lua 설정·비동기 작업·내장 LSP를 넣었다 |

- vi의 `hjkl` 이동과 `Esc` 모드 전환은 당시 터미널(ADM-3A) 키보드에서 나왔다. 그 키보드는 `hjkl`에 화살표가 그려져 있었고 `Esc`가 지금의 `Tab` 자리에 있었다.
- Bram Moolenaar가 2023년 세상을 떠난 뒤 Vim은 커뮤니티 메인테이너들이 이어 개발한다. 2026년 기준 최신 안정 버전은 9.2다.
- Neovim은 Vim 9의 Vim9 script를 받아들이지 않고 Lua 중심으로 따로 발전한다. 2026년 기준 0.12 계열이며, 0.12부터 **내장 플러그인 관리자 `vim.pack`** 을 제공한다.

## Vim과 Neovim, 무엇을 고를까

| | Vim | Neovim |
| --- | --- | --- |
| 설정 파일 | `~/.vimrc` | `~/.config/nvim/init.lua` (또는 `init.vim`) |
| 설정 언어 | Vimscript, Vim9 script | Lua (Vimscript도 동작) |
| LSP·자동 완성 | 플러그인(coc.nvim, vim-lsp 등) | 내장 LSP 클라이언트, 내장 자동 완성 |
| 기본값 | vi 호환에 가까움 | 구문 강조·검색 강조 등 쓸 만한 기본값이 켜져 있음 |
| 어디에나 있나 | 대부분의 서버에 기본 설치 | 직접 설치해야 함 (`brew install neovim`) |

서버에서 잠깐 파일을 고치는 용도면 Vim(또는 vi)으로 충분하다. 매일 쓰는 주 편집기로 IDE처럼 꾸밀 생각이면 Neovim이 설정이 쉽고 생태계가 활발하다. 노멀 모드 명령은 둘이 같으므로 어느 쪽을 익혀도 그대로 옮겨 간다.

## 플러그인 관리

Vim도 VS Code의 확장처럼 플러그인으로 기능을 더한다.

| 방법 | 쓰는 법 |
| --- | --- |
| Vim 내장 패키지 | `~/.vim/pack/plugins/start/` 아래에 플러그인 저장소를 clone하면 시작할 때 자동으로 읽는다 |
| vim-plug | `.vimrc`에 `Plug 'user/repo'`를 나열하고 `:PlugInstall` |
| Neovim `vim.pack` | `vim.pack.add({ 'https://github.com/user/repo' })` (0.12+) |
| lazy.nvim | Neovim용. 필요할 때만 플러그인을 불러와 시작이 빠르다 |

과거에는 Vundle(`Plugin 'user/repo'` + `:PluginInstall`)이 많이 쓰였지만 지금은 거의 관리되지 않는다. IDE처럼 꾸밀 때 자주 고르는 기능은 다음과 같다.

| 기능 | 대표 플러그인 |
| --- | --- |
| 하단 상태 줄(모드, 파일 경로, 줄 번호) | vim-airline, lightline (Neovim: lualine) |
| 파일 트리 | NERDTree, fern (Neovim: nvim-tree, neo-tree) |
| 파일 아이콘 | vim-devicons. 터미널 폰트를 **Nerd Font**로 바꿔야 아이콘이 보인다 |
| 퍼지 검색 | fzf.vim (Neovim: telescope.nvim) |

## 편집기 밖에서 Vim 쓰기

### man 페이지를 Vim으로 열기

셸 설정 파일(`~/.zshrc` 등)에 `MANPAGER`를 지정하면 `man printf`가 Vim으로 열린다.

```bash
export MANPAGER="nvim +Man!"                          # Neovim
export MANPAGER="vim +MANPAGER --not-a-term -"        # Vim
```

Vim의 검색·복사·색 구성을 그대로 쓸 수 있고, 본문의 다른 명령 이름 위에서 `K` 또는 `Ctrl-]`로 그 매뉴얼로 건너가고 `Ctrl-o`(또는 `Ctrl-t`)로 돌아온다. Vim 안에서는 `:Man 3 printf`로 바로 열 수 있다.

### 브라우저를 Vim 키로: Vimium

Vimium은 Chrome·Edge용 확장이다. `f`를 누르면 클릭할 수 있는 모든 링크에 글자 힌트가 붙어 키보드로 누를 수 있고, `j`/`k`로 스크롤, `H`/`L`로 뒤로·앞으로 간다. `?`로 전체 단축키를 본다. Firefox에는 같은 계열의 Vimium-FF, Tridactyl이 있다.

## 정리

- Vim은 모드를 나눠 같은 키로 입력과 명령을 오가는 편집기이고, vi의 후계다.
- Neovim은 Vim의 포크로 Lua 설정과 내장 LSP·플러그인 관리자를 갖췄다. 노멀 모드 명령은 같다.
- 플러그인은 내장 패키지·vim-plug·`vim.pack`·lazy.nvim으로 관리한다. Vundle은 옛 방식이다.
- `MANPAGER`와 Vimium으로 Vim 키를 매뉴얼과 브라우저까지 넓힐 수 있다.

관련 노트: [[vim-tips|Vim 편집 기술]], [[tmux|tmux]], [[vscode|VS Code 설정과 활용]]
