---
title: "Vim 편집 기술"
concept: "Vim Tips"
summary: "공백 문자 표시(listchars), 접기(fold), 연속된 숫자 입력, 조건부 키 매핑(<expr>), 복사한 영역 강조, 시스템 클립보드 복사처럼 Vim·Neovim에서 자주 쓰는 설정과 명령 모음."
tags: ["tools", "vim", "editor", "productivity"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/dd6588a1d7ef4b3aa0db79d7adc18166", "https://80000coding.notion.site/218c91e14b80407595157742bc83c876", "https://80000coding.notion.site/c4cf772432664fc1aa87c148509cbfec", "https://80000coding.notion.site/494c23d5d9464f13abdaca40f7eb5c2f", "https://80000coding.notion.site/3d0b8132613349cd9387a4ec8ebdb0e2", "https://80000coding.notion.site/6e7153c06a9941b2b318cc591a38d78f", "https://neovim.io/doc/user/lua.html#vim.hl.on_yank()"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「vim 잡기술 - listchars」, 「vim 잡기술 - fold」, 「vim에서 연속된 숫자 입력하기」, 「vim 잡기술 - 조건부 키맵핑?!」, 「neovim 간단 꿀팁 - 복사한부분 하이라이팅」, 「Vim에서 마우스 드래그로 텍스트 복붙하기」를 바탕으로 재구성한 노트다.

Vim의 설정은 `~/.vimrc`(Neovim은 `init.vim`/`init.lua`)에 적으면 매번 적용되고, 노멀 모드에서 `:set ...`으로 치면 그 세션에만 적용된다. 아래 예시는 Vimscript 기준이며 Neovim에서도 그대로 동작한다. 편집기 자체의 소개는 [[vim-and-neovim|Vim과 Neovim]]에 있다.

## 1. 공백 문자 보이기: list, listchars

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

## 2. 코드 접기: fold

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

## 3. 연속된 숫자 입력하기

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

## 4. 조건에 따라 다르게 동작하는 키 매핑: `<expr>`

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

## 5. 복사한 영역 잠깐 강조하기

`yy` 같은 복사(yank)는 화면에 아무 표시가 없어 제대로 복사됐는지 헷갈린다. Neovim은 복사 직후 그 영역을 잠깐 강조하는 함수를 내장한다.

```lua
-- init.lua
vim.api.nvim_create_autocmd('TextYankPost', {
  callback = function() vim.hl.on_yank({ higroup = 'IncSearch', timeout = 300 }) end,
})
```

`autocmd`는 특정 이벤트(여기서는 `TextYankPost`, 텍스트가 복사된 직후)가 일어날 때 명령을 자동으로 실행한다. `timeout` 기본값은 150ms이고, `on_visual`, `on_macro`로 비주얼 모드·매크로에서의 동작을 정한다. 옛 이름은 `vim.highlight.on_yank`이며, 오래된 설정 예시에서는 이 이름과 `autocmd TextYankPost * lua ...` 형태를 볼 수 있다. Vim에서는 vim-highlightedyank 플러그인으로 같은 효과를 낸다.

## 6. 시스템 클립보드로 복사하기

Vim의 복사는 기본적으로 Vim 내부 레지스터에만 들어가서 다른 앱에 붙여 넣을 수 없다. 터미널에서 마우스로 긁으면 줄 번호까지 같이 복사되기도 한다.

| 방법 | 쓰는 법 |
| --- | --- |
| `"+y` | 시스템 클립보드 레지스터(`+`)로 복사. `"+p`로 붙여 넣기 |
| `set clipboard=unnamedplus` | 모든 `y`/`p`가 시스템 클립보드를 쓰게 함 |
| `set mouse=a` | 마우스 선택을 Vim이 받아 비주얼 모드로 다룸 |

Vim은 `+clipboard` 기능을 넣고 빌드한 버전에서만 된다(`vim --version | grep clipboard`로 확인). Neovim은 macOS에서는 바로, Linux에서는 `xclip`·`wl-clipboard` 같은 도구가 있으면 된다.

## 정리

- 공백은 `list`·`listchars`로 드러내고, 긴 파일은 `foldmethod`로 접는다.
- 숫자 수열은 `g Ctrl-a`나 `:put=range()`로 한 번에 넣는다.
- `<expr>` 매핑으로 상황에 따라 다르게 동작하는 키를 만든다.
- 복사는 Neovim의 `vim.hl.on_yank`로 확인하고, 다른 앱과 주고받을 때는 `+` 레지스터를 쓴다.

관련 노트: [[vim-and-neovim|Vim과 Neovim]], [[tmux|tmux]]
