---
title: "작업 중인 변경 다루기: stash, worktree, clean"
concept: "Git Stash and Worktree"
summary: "커밋하기 애매한 작업을 잠시 치워 두는 stash, 브랜치를 바꾸지 않고 다른 브랜치를 옆 폴더에 펼치는 worktree, 추적하지 않는 파일을 지우는 clean을 정리했다. 잠깐 끼어든 일이면 stash, 오래 병행할 일이면 worktree가 기본이다."
tags: ["git", "version-control", "cli", "branch"]
source: other
date: "2026-10-21"
sources: ["https://github.com/arslanbilal/git-cheat-sheet", "https://github.com/mingrammer/git-tips", "https://git-scm.com/docs/git-stash", "https://git-scm.com/docs/git-worktree", "https://git-scm.com/docs/git-clean"]
---

> arslanbilal의 「[Git and Git Flow Cheat Sheet](https://github.com/arslanbilal/git-cheat-sheet)」와 mingrammer의 「[Git Tips](https://github.com/mingrammer/git-tips)」(git-tips/tips 한국어판)에서 stash·worktree·clean 항목을 모아, 명령은 Git 공식 문서로 확인해 재구성한 노트다.

## 왜 필요한가

기능을 만들다가 급한 버그 수정 요청이 오면 지금 작업을 커밋하기엔 덜 됐고, 그대로 브랜치를 바꾸기엔 변경이 따라오거나 충돌한다. 이때 고를 수 있는 길은 세 가지다.

| 방법 | 하는 일 | 맞는 상황 |
| --- | --- | --- |
| 임시 커밋(WIP) | 그냥 커밋하고 나중에 `reset --soft HEAD~`나 amend로 다듬는다 | 곧 돌아올 작업, 원격에 백업까지 하고 싶을 때 |
| `git stash` | 변경을 스택에 치워 두고 작업 트리를 깨끗하게 만든다 | 몇 분~몇 시간짜리 끼어든 일 |
| `git worktree` | 다른 브랜치를 **옆 폴더**에 따로 펼친다 | 리뷰·핫픽스·긴 빌드처럼 두 브랜치를 오래 나란히 둘 때 |

## stash: 변경을 잠시 치워 두기

`git stash`는 작업 트리와 스테이징 영역의 변경을 커밋과 비슷한 객체로 저장해 스택(`stash@{0}`, `stash@{1}` …)에 쌓고, 작업 트리를 HEAD 상태로 되돌린다.

### 저장하기

```bash
git stash                         # tracked 파일의 변경만 (= git stash push)
git stash push -m "로그인 폼 작업"   # 메시지를 붙여서
git stash -u                      # 추적하지 않는(untracked) 새 파일까지
git stash -a                      # .gitignore로 무시한 파일까지 전부
git stash -k                      # 스테이징한 것은 남기고 나머지만 (--keep-index)
git stash -p                      # 헝크 단위로 골라서
git stash push -- src/app.ts      # 특정 경로만
```

- 기본 `git stash`는 **새로 만든 파일(untracked)을 치우지 않는다.** 브랜치를 바꾸면 그 파일이 따라온다. 새 파일이 있으면 `-u`를 붙인다.
- `git stash save "메시지"`는 옛 형식이다. 지금은 `git stash push -m`을 쓴다.
- `-k`는 "스테이징한 부분만으로 테스트가 통과하는지" 확인할 때 쓴다.

### 꺼내기·보기·지우기

| 명령 | 동작 |
| --- | --- |
| `git stash list` | 쌓인 stash 목록 |
| `git stash show -p stash@{1}` | 그 stash의 diff 보기 |
| `git stash pop` | 가장 최근 stash를 적용하고 **목록에서 지운다** |
| `git stash apply stash@{1}` | 적용만 하고 목록에는 남긴다 |
| `git stash drop stash@{1}` | 하나 지우기 |
| `git stash clear` | 전부 지우기 |
| `git stash branch <새 브랜치> [stash]` | stash를 만든 커밋에서 새 브랜치를 따고 그 위에 적용한다. 적용 중 충돌이 날 때 가장 깔끔한 탈출구다 |
| `git restore --source=stash@{0} -- <파일>` | stash에서 파일 하나만 꺼낸다 |

- `pop` 중 충돌이 나면 stash는 **지워지지 않고 남는다.** 충돌을 풀고 직접 `drop`한다.
- 실수로 `drop`·`clear`한 stash도 객체는 한동안 남는다. `git fsck --no-reflog | awk '/dangling commit/ {print $3}'`로 해시를 찾아 `git stash apply <해시>`로 되살릴 수 있다.

### 자주 쓰는 흐름: 다른 브랜치로 작업 옮기기

```bash
git stash -u
git switch right-branch
git stash pop
```

rebase나 pull 직전에 매번 stash하는 일은 `git rebase --autostash`나 설정 `rebase.autostash true`([[git-config-options|자주 쓰는 Git 설정 옵션]])로 자동화한다.

### stash의 한계

stash는 이름 없는 스택이라 며칠 지나면 무엇이었는지 잊는다. 로컬에만 있어 원격 백업도 안 된다. 하루를 넘길 작업이면 WIP 커밋이나 브랜치가 낫다.

## worktree: 한 저장소, 여러 작업 폴더

`git worktree`는 하나의 `.git` 저장소에 **작업 트리를 여러 개** 연결한다. 폴더마다 다른 브랜치가 펼쳐져 있으므로 브랜치를 바꾸지 않고 폴더만 옮겨 다닌다. 저장소를 다시 clone하지 않으므로 이력·객체·설정을 공유하고 디스크도 덜 쓴다.

```bash
git worktree add ../app-hotfix -b hotfix/login main   # main에서 새 브랜치를 따서 옆 폴더에
git worktree add ../app-review feature/payment         # 이미 있는 브랜치를 펼치기
git worktree add --detach ../app-try HEAD              # 브랜치 없이 지금 커밋만 펼치기
git worktree list                                      # 연결된 작업 트리 목록
git worktree remove ../app-hotfix                      # 다 쓰면 정리
git worktree prune                                     # 손으로 지운 폴더의 기록 정리
```

| 쓰임 | 이점 |
| --- | --- |
| 기능 개발 중 핫픽스 | stash 없이 옆 폴더에서 고치고 돌아온다 |
| PR 리뷰 | 내 작업 트리를 건드리지 않고 동료 브랜치를 실행해 본다 |
| 긴 빌드·테스트 | 한 폴더에서 테스트를 돌리는 동안 다른 폴더에서 계속 작업한다 |
| 병렬 AI 에이전트 | 에이전트마다 폴더를 나눠 서로 파일을 밟지 않게 한다 |

주의할 점:

- **같은 브랜치는 두 작업 트리에서 동시에 펼칠 수 없다.** 한 브랜치가 두 곳에서 움직이면 HEAD가 어긋나기 때문이다.
- `node_modules`, `.env`, 빌드 결과물처럼 추적하지 않는 파일은 새 작업 트리에 없다. 의존성 설치를 다시 해야 한다.
- 이동식 디스크처럼 가끔 사라지는 경로에 둔 작업 트리는 `git worktree lock`으로 prune 대상에서 뺀다.

## clean: 추적하지 않는 파일 지우기

`git clean`은 Git이 추적하지 않는 파일을 작업 트리에서 지운다. **지운 파일은 Git으로 되살릴 수 없으므로** 항상 `-n`으로 먼저 본다.

```bash
git clean -n            # 무엇이 지워질지 미리 보기 (dry run)
git clean -f            # untracked 파일 삭제
git clean -fd           # untracked 폴더까지
git clean -fdx          # .gitignore로 무시한 파일까지 (빌드 결과물, node_modules 포함)
git clean -fX           # 무시한 파일만 (빌드 산출물만 치우고 새 소스는 남긴다)
git clean -i            # 하나씩 골라서
```

| 옵션 | 지우는 범위 |
| --- | --- |
| (없음) | untracked 파일 |
| `-d` | untracked 폴더도 |
| `-x` | 무시한 파일도 함께 |
| `-X` | 무시한 파일**만** |

`-x`와 `-X`의 차이가 가장 헷갈린다. 소문자는 "더해서", 대문자는 "그것만"이다. 원격 상태로 완전히 초기화하는 레시피는 [[git-undo-and-rewrite|되돌리기와 이력 다루기]]에 있다.

## 정리

- 잠깐 끼어든 일이면 `stash`, 새 파일까지 치우려면 `-u`, 꺼낼 때 충돌이 무서우면 `stash branch`.
- 하루를 넘길 일이면 stash 대신 WIP 커밋이나 브랜치로 남긴다.
- 두 브랜치를 오래 나란히 다룰 때는 `worktree`가 clone을 하나 더 하는 것보다 가볍다.
- `clean`은 되돌릴 수 없다. **항상 `-n`부터.**

관련 노트: [[branch|Git 브랜치]], [[git-basics|Git 기본 명령과 파일 상태]], [[git-undo-and-rewrite|Git 되돌리기와 이력 다루기]], [[git-config-options|자주 쓰는 Git 설정 옵션]], [[loop-engineering|루프 엔지니어링]]
