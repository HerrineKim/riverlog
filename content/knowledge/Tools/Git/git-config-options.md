---
title: "자주 쓰는 Git 설정 옵션"
concept: "Git Config"
summary: "개발자들이 실제로 켜 두는 git config 옵션을 pull·merge·rebase·diff·전역 설정별로 묶었다. 대부분 기본값의 불편함을 고치는 한 줄 설정이다."
tags: ["git", "version-control", "config", "tools"]
source: other
date: "2026-10-12"
sources: ["https://news.hada.io/topic?id=13405", "https://jvns.ca/blog/2024/02/16/popular-git-config-options/"]
---

> GeekNews의 「[인기 있는 Git 설정 옵션들](https://news.hada.io/topic?id=13405)」(2024.02)을 요약·재구성한 노트입니다. 원 자료는 Julia Evans의 「[Popular git config options](https://jvns.ca/blog/2024/02/16/popular-git-config-options/)」입니다. 옵션 이름과 기본값은 글 작성 시점 기준이라 Git 버전에 따라 다를 수 있습니다.

## Git 설정이란

Git의 동작 대부분은 `git config`로 바꿀 수 있다. 원 글은 여러 사람에게 즐겨 쓰는 설정을 물어 자주 언급된 것을 모은 목록이다. **기본값이 불편해서 생기는 실수**(의도치 않은 merge 커밋, 읽기 힘든 충돌 표시)를 한 줄로 막는 옵션이 많다.

```bash
git config --global <이름> <값>     # 설정 (~/.gitconfig에 저장)
git config --global --unset <이름>  # 해제
git config --list                   # 현재 설정 확인
```

## Pull과 Merge

| 옵션 | 효과 |
| --- | --- |
| `pull.ff only` | 원격과 갈라졌으면 pull을 멈춘다. `git pull --ff-only`와 같다 |
| `pull.rebase true` | 항상 `git pull --rebase`처럼 동작한다 |
| `merge.conflictstyle zdiff3` | 충돌 표시에 **양쪽이 갈라지기 전 원본**까지 보여 준다. `diff3`의 개선판이다 |
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

## 전역·환경별 설정

| 옵션 | 효과 |
| --- | --- |
| `core.excludesfile` | 모든 저장소에 적용할 전역 gitignore 파일 지정 |
| `includeIf` | 디렉터리별로 다른 설정 파일을 불러온다. 회사·개인 저장소의 이메일을 나눌 때 쓴다 |
| `user.useConfigOnly true` | 이메일을 명시하지 않은 저장소에서 커밋을 막는다. 여러 계정을 쓸 때 실수 방지 |
| `url."git@github.com:".insteadOf "https://github.com/"` | HTTPS 주소를 SSH 주소로 자동 치환한다 |
| `core.autocrlf false` | 줄바꿈(CRLF↔LF) 자동 변환을 끈다. 팀 규칙은 `.gitattributes`로 정하는 편이 낫다 |
| `transfer.fsckobjects true` | 주고받는 객체의 손상을 검사한다 |

```ini
# ~/.gitconfig — 회사 폴더에서만 회사 이메일 쓰기
[includeIf "gitdir:~/work/"]
  path = ~/.gitconfig-work
```

서브모듈을 쓰면 `submodule.recurse true`, `status.submoduleSummary true`, `diff.submodule log`도 자주 언급된다.

## 정리

- 처음 켤 만한 것: `pull.ff only`(또는 `pull.rebase true`), `merge.conflictstyle zdiff3`, `rebase.autosquash true`, `diff.algorithm histogram`.
- 여러 계정을 쓰면 `includeIf`와 `user.useConfigOnly`로 커밋 이메일 실수를 막는다.
- 원 글 작성자도 조사 후 `zdiff3`, `histogram`, `branch.sort -committerdate`를 새로 켰다고 한다.
- 설정은 기기마다 따로라서, `~/.gitconfig`를 dotfiles로 관리하면 여러 기기에서 같은 환경을 유지할 수 있다.

관련 노트: [[git-basics|기본 명령과 파일 상태]], [[merge|브랜치 병합]], [[git-undo-and-rewrite|되돌리기와 이력 다루기]]
