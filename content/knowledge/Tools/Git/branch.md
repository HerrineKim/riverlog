---
title: "Git 브랜치"
concept: "Branch"
summary: "원본에 영향을 주지 않고 독립적으로 작업할 수 있도록 커밋 흐름을 나누는 Git의 핵심 기능."
tags: ["git", "version-control", "branch"]
source: mixed
date: "2026-10-20"
---

브랜치(branch)는 나뭇가지처럼 작업 흐름을 여러 갈래로 나누어 **서로 독립적으로 개발**할 수 있게 해 주는 기능이다. Git의 브랜치는 특정 커밋을 가리키는 가벼운 포인터일 뿐이라서, 만들고 이동하는 비용이 거의 없다.

![브랜치 개념](/images/til/ETC/Git/md-images/branch.png)

## 왜 브랜치를 쓰는가

- 기본 브랜치(`master`/`main`)는 보통 **배포된 상용 코드**를 의미한다. 사용자가 쓰고 있는 코드를 직접 수정하거나 되돌리는 것은 위험하다.
- 브랜치를 따로 만들어 그곳에서 기능 개발·버그 수정·실험을 하면 원본은 안전하게 유지된다.
- 작업이 끝나면 그 결과만 원본에 [병합](merge.md)하면 된다.
- 하나의 작업 = 하나의 브랜치로 나누면 개발 과정이 체계적이 된다. 한 브랜치에서 여러 기능을 섞어 작업하면, 그중 일부만 먼저 머지해야 할 때 변경을 손으로 다시 나눠야 한다. 기능마다 **처음부터** 브랜치를 따로 만든다.

## HEAD

**HEAD**는 "지금 내가 있는 브랜치(커밋)"를 가리키는 포인터다. 브랜치를 이동한다는 것은 HEAD가 다른 브랜치를 가리키게 한다는 뜻이고, 그 결과 Working Directory도 그 브랜치의 최신 커밋 상태로 바뀐다.

## 브랜치 명령어

### `git branch`: 조회·생성·삭제

```bash
$ git branch                 # 로컬 브랜치 목록 (* 표시가 현재 브랜치)
$ git branch -r              # 원격 저장소의 브랜치 목록
$ git branch <이름>           # 새 브랜치 생성 (이동은 하지 않음)
$ git branch -d <이름>        # 병합이 끝난 브랜치 삭제
$ git branch -D <이름>        # 강제 삭제 (병합 안 된 브랜치도 삭제, 주의)
```

### `git switch`: 브랜치 이동

Git 2.23(2019)에서 추가된 명령으로, 예전에 `git checkout`이 하던 일 중 "브랜치 전환" 기능만 분리한 것이다. 파일을 되돌리는 기능은 `git restore`로 분리되었다.

```bash
$ git switch <브랜치>         # 다른 브랜치로 이동
$ git switch -c <브랜치>      # 새로 만들면서 바로 이동
$ git switch -               # 직전 브랜치로 돌아가기
```

| 예전 방식 (`checkout`) | 새 방식 |
| --- | --- |
| `git checkout <브랜치>` | `git switch <브랜치>` |
| `git checkout -b <브랜치>` | `git switch -c <브랜치>` |
| `git checkout -- <파일>` | `git restore <파일>` |
| `git reset HEAD <파일>` (스테이징 취소) | `git restore --staged <파일>` |

`git checkout`은 지금도 동작하고 Git 프로젝트도 없앨 계획이 없다고 밝혔지만([Git BreakingChanges](https://git-scm.com/docs/BreakingChanges)), 한 명령이 브랜치 이동과 파일 덮어쓰기를 함께 맡아 실수하기 쉽다. 새로 배운다면 `switch`/`restore`를 쓰고, 오래된 문서에서 `checkout`을 보면 위 표처럼 바꿔 읽으면 된다.

## 예시: 갈라지는 브랜치

`master`에서 커밋 3개를 만든 뒤 `login` 브랜치를 만들고, `master`에 커밋을 하나 더 쌓은 상황이다.

```bash
$ git branch login
$ # ... master에서 master-4 커밋 ...
$ git log --oneline
5ca7701 (HEAD -> master) master-4
0604dcd (login) master-3
9c22c89 master-2
3d71510 master-1
```

`login`으로 이동하면 `test.txt`에서 `master-4` 내용이 사라지고, `git log`에서도 `master` 브랜치가 보이지 않는다. 브랜치가 지워진 것이 아니라 **HEAD 기준으로 이력을 보여주기 때문**이다. `--all` 옵션을 주면 모든 브랜치를 볼 수 있다.

```bash
$ git switch login
$ git log --oneline --all
5ca7701 (master) master-4
0604dcd (HEAD -> login) master-3
...
```

`login`에서 새 커밋을 만들면 두 브랜치가 다른 갈래로 나뉜다.

```bash
$ git log --oneline --graph --all
* 3b0a091 (HEAD -> login) login-1
| * 5ca7701 (master) master-4
|/
* 0604dcd master-3
* 9c22c89 master-2
* 3d71510 master-1
```

![갈라진 브랜치](/images/til/ETC/Git/md-images/44.png)

## 주의: 추적되지 않는 파일은 브랜치를 따라다닌다

`feature` 브랜치에서 `test.txt`를 만들고 `git add` 하지 않은 채 `git switch master` 하면, `test.txt`가 `master`에도 그대로 남아 있다.

- 브랜치가 독립적인 것은 **Git이 관리하는 파일**에 한해서다.
- 한 번도 Staging Area에 올라간 적 없는(untracked) 파일은 버전 관리 대상이 아니므로 브랜치를 바꿔도 Working Directory에 계속 남는다.
- 따라서 브랜치를 옮기기 전에는 `git status`로 작업 중인 파일이 모두 커밋(또는 정리)됐는지 확인한다.

## 핵심 정리

- 브랜치 = 커밋을 가리키는 가벼운 포인터, HEAD = 현재 브랜치를 가리키는 포인터.
- `git switch -c`로 만들고 이동, 작업 후 병합, 병합한 브랜치는 `-d`로 삭제.
- 이동 전에는 untracked/modified 파일이 없는지 확인한다.

관련 노트: [[merge|브랜치 병합]], [[github-collaboration|GitHub 협업 저장소 설정]]
