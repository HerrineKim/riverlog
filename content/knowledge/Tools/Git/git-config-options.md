---
title: "자주 쓰는 Git 설정 옵션"
concept: "Git Config"
summary: "개발자들이 실제로 켜 두는 git config 옵션을 pull·merge·rebase·diff·전역 설정별로 묶었다. 대부분 기본값의 불편함을 고치는 한 줄 설정이다."
tags: ["git", "version-control", "config", "tools"]
source: other
date: "2026-10-21"
sources: ["https://news.hada.io/topic?id=13405", "https://jvns.ca/blog/2024/02/16/popular-git-config-options/", "https://80000coding.notion.site/a290d188438f4ebfb6940a1033183340", "https://80000coding.notion.site/19c283f564a6492d98945e4558a990d7", "https://github.com/arslanbilal/git-cheat-sheet", "https://github.com/mingrammer/git-tips", "https://git-scm.com/docs/git-config", "https://johngrib.github.io/wiki/git-alias/", "https://github.com/k88hudson/git-flight-rules/blob/master/README_kr.md"]
---

> GeekNews의 「[인기 있는 Git 설정 옵션들](https://news.hada.io/topic?id=13405)」(2024.02)을 바탕으로 재구성한 노트다. 원 자료는 Julia Evans의 「[Popular git config options](https://jvns.ca/blog/2024/02/16/popular-git-config-options/)」다.
> 「커밋 작성자와 GitHub 기여 그래프」, 「alias」 부분은 팔만코딩경(42Seoul 커뮤니티 위키)의 「GitHub 이메일 교체 시 잔디가 사라지는 현상」, 「git - 사소한 꿀팁」을 바탕으로 보강했다.
> 「설정 범위」와 일부 옵션은 arslanbilal의 「[Git and Git Flow Cheat Sheet](https://github.com/arslanbilal/git-cheat-sheet)」와 mingrammer의 「[Git Tips](https://github.com/mingrammer/git-tips)」를 바탕으로 보강했다.
> 「셸 alias와 함수 패턴」은 「[git alias](https://johngrib.github.io/wiki/git-alias/)」를, `credential.helper`는 「[Git Flight Rules](https://github.com/k88hudson/git-flight-rules/blob/master/README_kr.md)」를 바탕으로 보강했다.

## Git 설정이란

Git의 동작 대부분은 `git config`로 바꿀 수 있다. 개발자들이 즐겨 켜 두는 옵션은 대부분 **기본값이 불편해서 생기는 실수**(의도치 않은 merge 커밋, 읽기 힘든 충돌 표시)를 한 줄로 막는 옵션이 많다.

```bash
git config --global <이름> <값>     # 설정 (~/.gitconfig에 저장)
git config --global --unset <이름>  # 해제
git config --list                   # 현재 설정 확인
git config --global --edit          # 설정 파일을 편집기로 열기
```

Git 2.46부터는 하위 명령 형식(`git config list`, `git config get <이름>`, `git config set <이름> <값>`, `git config unset <이름>`)도 쓸 수 있다. 위의 옛 형식도 그대로 동작한다.

### 설정 범위

같은 이름의 설정이 여러 곳에 있으면 **좁은 범위가 이긴다.**

| 범위 | 파일 | 옵션 | 적용 대상 |
| --- | --- | --- | --- |
| system | `/etc/gitconfig` (설치 위치에 따라 다름) | `--system` | 그 컴퓨터의 모든 사용자 |
| global | `~/.gitconfig` 또는 `~/.config/git/config` | `--global` | 내 모든 저장소 |
| local | `<저장소>/.git/config` | `--local` (저장소 안에서의 기본값) | 그 저장소 |
| worktree | `<저장소>/.git/config.worktree` | `--worktree` | 작업 트리 하나 (`extensions.worktreeConfig`를 켰을 때) |

`git config --list --show-origin --show-scope`로 각 값이 어느 파일·범위에서 왔는지 본다.

## Pull과 Merge

| 옵션 | 효과 |
| --- | --- |
| `pull.ff only` | 원격과 갈라졌으면 pull을 멈춘다. `git pull --ff-only`와 같다 |
| `pull.rebase true` | 항상 `git pull --rebase`처럼 동작한다 |
| `merge.conflictstyle zdiff3` | 충돌 표시에 **양쪽이 갈라지기 전 원본**까지 보여 준다. `diff3`의 개선판이다(Git 2.35+) |
| `rerere.enabled true` | 충돌 해결 방식을 기록했다가 같은 충돌이 다시 나면 자동으로 적용한다 |

`pull.ff only`와 `pull.rebase true`는 둘 다 의도치 않은 merge 커밋을 막는 용도다. **둘 중 하나만 쓴다.** 함께 켜면 `--ff-only`가 우선해 rebase 설정은 의미가 없다.

## Rebase

| 옵션 | 효과 |
| --- | --- |
| `rebase.autosquash true` | `git commit --fixup <커밋>`으로 만든 커밋을 rebase 때 대상 커밋에 자동으로 합친다 |
| `rebase.autostash true` | rebase 전에 작업 중인 변경을 stash하고 끝나면 되돌린다 |
| `rebase.updateRefs true` | 쌓인 브랜치(stacked branch)의 참조도 함께 옮긴다 |

옛 커밋을 고치는 흐름은 이렇게 짧아진다.

```bash
git commit --fixup a1b2c3d   # 고칠 내용을 fixup 커밋으로
git rebase -i main           # autosquash가 켜져 있으면 자동으로 제자리에 합쳐짐
```

## Push와 브랜치

| 옵션 | 효과 |
| --- | --- |
| `push.default simple` | 기본값. 추적 중인 원격 브랜치가 있을 때만 push한다 |
| `push.default current` | 원격에 같은 이름의 브랜치로 항상 push한다 |
| `push.followtags true` | push할 때 관련 태그도 함께 보낸다 |
| `init.defaultBranch main` | 새 저장소의 기본 브랜치를 `main`으로 |
| `branch.sort -committerdate` | `git branch` 목록을 최근 커밋 순으로. 최근 **사용한** 순서가 아니다 |
| `fetch.prune true` | fetch 때 원격에서 지워진 브랜치를 로컬 추적 목록에서도 지운다 |

## Diff와 커밋

| 옵션 | 효과 |
| --- | --- |
| `diff.algorithm histogram` | 함수 순서가 바뀐 변경을 기본 알고리즘보다 읽기 쉽게 보여 준다 |
| `diff.colorMoved default` | 옮겨진 줄을 추가·삭제와 다른 색으로 표시한다 |
| `core.pager delta` | diff·log·show를 [delta](https://github.com/dandavison/delta)로 문법 강조해서 본다 |
| `commit.verbose true` | 커밋 메시지 편집기에 전체 diff를 함께 띄운다 |
| `help.autocorrect 10` | 오타 명령을 1초(10 = 0.1초 단위) 뒤 자동 실행한다. `prompt`면 묻는다 |
| `core.editor "code --wait"` | 커밋 메시지·rebase 편집기 지정 (기본은 `$EDITOR` 또는 vi) |
| `merge.tool <도구>` | `git mergetool`이 띄울 병합 도구 |
| `color.ui auto` | 터미널일 때만 색을 입힌다(기본값). `false`면 끈다 |

## 전역·환경별 설정

| 옵션 | 효과 |
| --- | --- |
| `core.excludesfile` | 모든 저장소에 적용할 전역 gitignore 파일 지정 |
| `includeIf` | 디렉터리별로 다른 설정 파일을 불러온다. 회사·개인 저장소의 이메일을 나눌 때 쓴다 |
| `user.useConfigOnly true` | 이메일을 명시하지 않은 저장소에서 커밋을 막는다. 여러 계정을 쓸 때 실수 방지 |
| `url."git@github.com:".insteadOf "https://github.com/"` | HTTPS 주소를 SSH 주소로 자동 치환한다 |
| `core.autocrlf false` | 줄바꿈(CRLF↔LF) 자동 변환을 끈다. 팀 규칙은 `.gitattributes`로 정하는 편이 낫다 |
| `credential.helper` | HTTPS 인증 정보를 저장할 곳. macOS는 `osxkeychain`, Windows·Linux는 Git Credential Manager(`manager`)가 보통이고, `cache --timeout=3600`은 메모리에 잠시만 둔다. 평문 파일에 저장하는 `store`는 피한다 |
| `transfer.fsckobjects true` | 주고받는 객체의 손상을 검사한다 |
| `core.ignorecase false` | 대소문자를 구분하지 않는 파일 시스템(macOS·Windows 기본)에서 `File.ts` → `file.ts` 같은 이름 변경을 감지하게 한다. 파일 이름 대소문자만 바꿀 때는 설정보다 `git mv`가 안전하다 |
| `core.fileMode false` | 실행 권한 비트 변경을 무시한다. 권한을 제대로 다루지 못하는 파일 시스템에서 모든 파일이 수정됨으로 뜰 때 |

```ini
# ~/.gitconfig: 회사 폴더에서만 회사 이메일 쓰기
[includeIf "gitdir:~/work/"]
  path = ~/.gitconfig-work
```

### 커밋 작성자와 GitHub 기여 그래프

커밋에 찍히는 이름·이메일은 `user.name`, `user.email`에서 온다. `--global`은 `~/.gitconfig`에, 옵션 없이 저장소 안에서 실행하면 그 저장소의 `.git/config`에 저장되고 저장소 설정이 우선한다. 현재 값은 `git config --list --show-origin`으로 어느 파일에서 왔는지까지 본다.

GitHub 프로필의 기여 그래프(잔디)는 **커밋 작성자 이메일이 내 GitHub 계정에 등록된 이메일과 같을 때만** 집계된다. 그래서 계정에서 옛 이메일을 지우면 그 이메일로 쓴 과거 커밋이 그래프에서 사라진다.

- 이메일을 바꿀 때는 옛 이메일을 지우지 말고 **보조 이메일로 남겨 둔다.** 가장 안전하다.
- 주소를 공개하고 싶지 않으면 GitHub가 주는 `아이디@users.noreply.github.com` 주소를 `user.email`로 쓴다.
- 이미 지웠다면 과거 커밋의 작성자를 다시 써야 한다. 이력 재작성이므로 [[git-undo-and-rewrite|되돌리기와 이력 다루기]]의 `git filter-repo --mailmap`을 참고한다.

### 명령에 별명 붙이기: alias

길게 치는 명령은 `alias.<이름>`으로 줄인다. `~/.gitconfig`의 `[alias]` 절에 직접 적어도 된다.

```bash
git config --global alias.st status
git config --global alias.l "log --graph --abbrev-commit --pretty=format:'%C(red)%h%C(reset) -%C(yellow)%d%C(reset) %s %C(green)(%cr) %C(bold blue)<%an>%C(reset)'"
```

이제 `git l`이 브랜치 그래프와 해시·참조·메시지·상대 시각·작성자를 한 줄씩 색을 입혀 보여 준다.

#### 셸 alias와 함수 패턴

alias 값이 `!`로 시작하면 git 하위 명령이 아니라 **셸 명령**으로 실행된다. 파이프와 명령 치환을 쓸 수 있고, 저장소 최상위 폴더에서 실행된다.

```ini
[alias]
  s    = status -sb
  cur  = branch --show-current                         # 현재 브랜치 이름
  # 인자가 필요하면 함수를 선언하고 바로 부른다: git sync upstream
  sync = "!f() { git fetch \"$1\" && git reset --hard \"$1/$(git branch --show-current)\"; }; f"
  # fzf로 고르기: 브랜치를 골라 이동, 파일을 여러 개 골라 add
  sw   = "!git switch $(git branch | grep -v '^\\*' | fzf | awk '{print $1}')"
  a    = "!git add $(git status -s | fzf -m | awk '{print $2}')"
  aliases = "!git config --get-regexp '^alias\\.' | sed 's/^alias\\.//'"
```

| 형태 | 쓰임 |
| --- | --- |
| `이름 = 하위 명령` | 긴 옵션 줄이기 |
| `이름 = "!셸 명령"` | 파이프·명령 치환·다른 도구와 연결 |
| `이름 = "!f() { ...; }; f"` | `$1` 같은 인자 받기, 분기 |
| fzf와 연결 | 브랜치·파일·태그를 목록에서 골라 넘기기, `--preview`로 미리 보기 |

`reset --hard`나 브랜치 삭제처럼 되돌릴 수 없는 명령을 alias로 감싸면 실수가 한 단어로 줄어든다. 위험한 alias는 확인 단계를 넣거나 만들지 않는다.

서브모듈을 쓰면 `submodule.recurse true`, `status.submoduleSummary true`, `diff.submodule log`도 자주 언급된다.

## 정리

- 처음 켤 만한 것: `pull.ff only`(또는 `pull.rebase true`), `merge.conflictstyle zdiff3`, `rebase.autosquash true`, `diff.algorithm histogram`.
- 여러 계정을 쓰면 `includeIf`와 `user.useConfigOnly`로 커밋 이메일 실수를 막는다.
- 설정은 기기마다 따로라서, `~/.gitconfig`를 dotfiles로 관리하면 여러 기기에서 같은 환경을 유지할 수 있다.

관련 노트: [[git-basics|기본 명령과 파일 상태]], [[merge|브랜치 병합]], [[git-undo-and-rewrite|되돌리기와 이력 다루기]], [[stash-worktree-clean|stash, worktree, clean]]
