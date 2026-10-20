---
title: "Vim과 Neovim"
concept: "Vim"
summary: "ed에서 vi, Vim, Neovim으로 이어진 모드형 편집기의 계보와 두 편집기의 차이, 설정 파일과 플러그인 관리, 공백 표시·접기·연속 숫자·<expr> 매핑·복사 강조·시스템 클립보드 같은 편집 기술, 편집기 밖에서 Vim 키를 쓰는 방법(man 페이지, Vimium)."
tags: ["tools", "vim", "editor", "cli", "productivity"]
source: other
date: "2026-10-20"
sources: ["https://80000coding.notion.site/216dcb7b968742abbf4028ae8e6b8caa", "https://80000coding.notion.site/014aa6329e3e4e39bf1b8fe1688a9f84", "https://80000coding.notion.site/7cf061c6a49541a4a80a747a3a3fe2d8", "https://80000coding.notion.site/2a61bdb018be4efdaf5709ecc66df1cf", "https://neovim.io/doc/user/pack.html", "https://80000coding.notion.site/dd6588a1d7ef4b3aa0db79d7adc18166", "https://80000coding.notion.site/218c91e14b80407595157742bc83c876", "https://80000coding.notion.site/c4cf772432664fc1aa87c148509cbfec", "https://80000coding.notion.site/494c23d5d9464f13abdaca40f7eb5c2f", "https://80000coding.notion.site/3d0b8132613349cd9387a4ec8ebdb0e2", "https://80000coding.notion.site/6e7153c06a9941b2b318cc591a38d78f", "https://neovim.io/doc/user/lua.html#vim.hl.on_yank()"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「ed에서 vi/vim을 거쳐 neovim까지」, 「생산성 향상을 위한 Vim 커스터마이징」, 「man 페이지를 vim으로 열어보자!」, 「[Vimium] 웹브라우저를 Vim 처럼.」을 바탕으로 재구성한 노트다. 「편집 기술」은 같은 위키의 「vim 잡기술 - listchars」, 「vim 잡기술 - fold」, 「vim에서 연속된 숫자 입력하기」, 「vim 잡기술 - 조건부 키맵핑?!」, 「neovim 간단 꿀팁 - 복사한부분 하이라이팅」, 「Vim에서 마우스 드래그로 텍스트 복붙하기」를 바탕으로 보강했다.

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

## 편집 기술

설정은 `~/.vimrc`(Neovim은 `init.vim`/`init.lua`)에 적으면 매번 적용되고, 노멀 모드에서 `:set ...`으로 치면 그 세션에만 적용된다. 아래 예시는 Vimscript 기준이며 Neovim에서도 그대로 동작한다.

### 1. 공백 문자 보이기: list, listchars

탭과 스페이스, 줄 끝 공백은 눈에 안 보여서 들여쓰기 규칙 위반의 흔한 원인이 된다. `list`를 켜면 이들을 기호로 표시한다.

```vim
set list                               " :set list! 로 켜고 끄기
set listchars=tab:\|.,trail:-,eol:$
```

| 항목 | 뜻 | 위 설정의 표시 |
| --- | --- | --- |
| `tab:xy[z]` | x = 탭의 첫 글자, y = 탭 폭만큼 채우는 글자, z = 마지막 글자(선택) | `\|...` |
| `trail` | 줄 끝에 붙은 공백 | `-` |
| `eol` | 줄 끝 | `$` |
| `space`, `lead`, `nbsp` | 모든 공백, 줄 앞 공백, 줄바꿈 없는 공백 | 지정한 글자 |

`|`처럼 특별한 의미가 있는 글자는 `\`로 이스케이프한다. 색은 하이라이트 그룹으로 바꾼다. `eol`은 `NonText`, 탭·공백 계열은 Vim에서 `SpecialKey`, Neovim에서 `Whitespace` 그룹을 쓴다(`:highlight Whitespace guifg=#ddff00`).

### 2. 코드 접기: fold

```vim
set foldmethod=marker   " manual, indent, syntax, expr, marker 중 하나
set foldlevel=0         " 0이면 열 때 모두 접힘, 99면 모두 펼침
```

`marker` 방식은 주석 안에 `{{{`와 `}}}`를 넣어 접을 범위를 직접 표시한다. 코드에 영향을 주지 않도록 주석 줄에 쓴다. 표시 없이 들여쓰기 기준으로 접으려면 `indent`가 편하다.

| 명령 | 동작 |
| --- | --- |
| `zo` / `zc` | 커서 위치의 접기 열기 / 닫기 |
| `zO` / `zC` | 커서 위치를 재귀적으로 모두 열기 / 닫기 |
| `za` | 열기·닫기 토글 |
| `zR` / `zM` | 파일 전체 열기 / 닫기 |

### 3. 연속된 숫자 입력하기

| 방법 | 쓰는 법 |
| --- | --- |
| `Ctrl-a` / `Ctrl-x` | 커서 위치의 숫자를 1 늘리기 / 줄이기. 앞에 숫자를 붙이면 그만큼(`5 Ctrl-a`) |
| `g Ctrl-a` | `Ctrl-v`로 여러 줄의 숫자를 세로로 고른 뒤 누르면 1, 2, 3…처럼 **줄마다 누적해서** 증가 |
| `:put=range(a, b)` | a부터 b까지 정수를 한 줄씩 삽입 |
| `:put=map(range(...), 'printf(...)')` | 숫자를 서식 문자열에 끼워 여러 줄 생성 |

```vim
:put=range(1, 5)
:put=map(range(1, 9), 'printf(''%d * %d = %d'', v:val, v:val, v:val * v:val)')
```

`range(10, 0, -2)`처럼 세 번째 인자로 간격을 주면 감소하거나 건너뛰는 수열도 만든다.

### 4. 조건에 따라 다르게 동작하는 키 매핑: `<expr>`

보통의 매핑은 키를 다른 키 입력으로 바꾼다. `nnoremap`의 `nore`는 매핑 결과가 다시 매핑되는 재귀를 막는다.

```vim
nnoremap n nzzzv       " 다음 검색 결과로 가며 화면 가운데로 맞춤
```

`<expr>`을 붙이면 오른쪽을 **식으로 평가한 결과**를 키 입력으로 쓴다. 상태에 따라 토글하거나, 창이 있으면 그리로 가고 없으면 새로 여는 매핑을 만들 수 있다.

```vim
" 열린 터미널 버퍼가 있으면 그 버퍼를, 없으면 새 터미널을 오른쪽 분할 창에 연다
nnoremap <expr> <leader>tt ToggleTerm()
function! ToggleTerm()
  let terms = filter(getbufinfo(), 'getbufvar(v:val.bufnr, "&buftype") ==# "terminal"')
  return empty(terms) ? ":vsplit \| terminal\<CR>" : ":vsplit \| buffer " . terms[0].bufnr . "\<CR>"
endfunction
```

식이 길어지면 이렇게 함수로 빼야 읽기 쉽다. 자세한 규칙은 `:help map-<expr>`.

### 5. 복사한 영역 잠깐 강조하기

`yy` 같은 복사(yank)는 화면에 아무 표시가 없어 제대로 복사됐는지 헷갈린다. Neovim은 복사 직후 그 영역을 잠깐 강조하는 함수를 내장한다.

```lua
-- init.lua
vim.api.nvim_create_autocmd('TextYankPost', {
  callback = function() vim.hl.on_yank({ higroup = 'IncSearch', timeout = 300 }) end,
})
```

`autocmd`는 특정 이벤트(여기서는 `TextYankPost`, 텍스트가 복사된 직후)가 일어날 때 명령을 자동으로 실행한다. `timeout` 기본값은 150ms이고, `on_visual`, `on_macro`로 비주얼 모드·매크로에서의 동작을 정한다. 옛 이름은 `vim.highlight.on_yank`이며, 오래된 설정 예시에서는 이 이름과 `autocmd TextYankPost * lua ...` 형태를 볼 수 있다. Vim에서는 vim-highlightedyank 플러그인으로 같은 효과를 낸다.

### 6. 시스템 클립보드로 복사하기

Vim의 복사는 기본적으로 Vim 내부 레지스터에만 들어가서 다른 앱에 붙여 넣을 수 없다. 터미널에서 마우스로 긁으면 줄 번호까지 같이 복사되기도 한다.

| 방법 | 쓰는 법 |
| --- | --- |
| `"+y` | 시스템 클립보드 레지스터(`+`)로 복사. `"+p`로 붙여 넣기 |
| `set clipboard=unnamedplus` | 모든 `y`/`p`가 시스템 클립보드를 쓰게 함 |
| `set mouse=a` | 마우스 선택을 Vim이 받아 비주얼 모드로 다룸 |

Vim은 `+clipboard` 기능을 넣고 빌드한 버전에서만 된다(`vim --version | grep clipboard`로 확인). Neovim은 macOS에서는 바로, Linux에서는 `xclip`·`wl-clipboard` 같은 도구가 있으면 된다.

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
- 공백은 `listchars`로 드러내고, 긴 파일은 `foldmethod`로 접고, 숫자 수열은 `g Ctrl-a`나 `:put=range()`로 넣는다.
- `<expr>` 매핑으로 상황에 따라 다르게 동작하는 키를 만들고, 다른 앱과 주고받는 복사는 `+` 레지스터를 쓴다.
- `MANPAGER`와 Vimium으로 Vim 키를 매뉴얼과 브라우저까지 넓힐 수 있다.

관련 노트: [[tmux|tmux]], [[vscode|VS Code 설정과 활용]]
