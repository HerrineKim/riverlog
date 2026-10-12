---
title: "Git 되돌리기와 이력 다루기"
concept: "Git Undo"
summary: "reset·revert로 커밋을 되돌리고, rebase·cherry-pick으로 이력을 옮기며, 진행 중인 merge·rebase를 --abort로 취소하는 방법. 공유된 이력이면 revert, 내 로컬 이력이면 reset이 기본이다."
tags: ["git", "version-control", "cli", "collaboration"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/61", "https://riverkim.kr/107", "https://riverkim.kr/305"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트입니다.

Git을 쓰다 보면 커밋을 되돌리거나, 다른 브랜치의 이력을 내 브랜치로 옮겨야 할 때가 생긴다. 기본 흐름(`add` → `commit` → `push`)은 [[git-basics|Git 기본 명령과 파일 상태]]와 [[remote-github|원격 저장소와 GitHub]]에 있고, 이 노트는 **이미 만든 이력을 고치는 명령**만 모았다.

## 한눈에 보기

| 하고 싶은 일 | 명령 | 이력을 바꾸는가 |
| --- | --- | --- |
| 특정 커밋으로 브랜치를 되감기 | `git reset <옵션> <커밋>` | 바꾼다 (커밋이 사라진 것처럼 보인다) |
| 특정 커밋을 취소하는 새 커밋 만들기 | `git revert <커밋>` | 바꾸지 않는다 (커밋이 하나 늘어난다) |
| 내 브랜치 시작점을 최신 기준 브랜치로 옮기기 | `git rebase <브랜치>` | 바꾼다 (내 커밋이 새로 만들어진다) |
| 다른 브랜치의 커밋 하나만 가져오기 | `git cherry-pick <커밋>` | 내 브랜치에 새 커밋이 추가된다 |
| 진행 중인 병합·리베이스 취소 | `git merge --abort`, `git rebase --abort` | 명령 전 상태로 돌아간다 |

## reset: 브랜치를 과거 커밋으로 되감기

`git reset`은 현재 브랜치가 가리키는 커밋을 지정한 커밋으로 옮긴다. 그 뒤의 커밋들은 브랜치에서 빠진다. 옵션은 **되감은 뒤 변경 내용을 어디에 남기느냐**의 차이다.

| 옵션 | 커밋 이력 | 변경 내용 | 쓰는 때 |
| --- | --- | --- | --- |
| `--soft` | 되감는다 | 남기고, **staged** 상태 | 커밋 몇 개를 하나로 다시 묶을 때 |
| `--mixed` (기본값) | 되감는다 | 남기고, **unstaged** 상태 | 커밋을 다시 나눠 담을 때 |
| `--hard` | 되감는다 | **모두 버린다** | 그 커밋 이후 작업을 완전히 지울 때 |

```bash
git reset --soft HEAD~1   # 마지막 커밋만 취소, 변경은 스테이징에 그대로
git reset --hard a1b2c3d  # a1b2c3d 시점으로 완전히 되돌림
```

force push로 원격 브랜치가 덮어써진 경우에도 **내 로컬에는 이전 커밋이 남아 있으므로** `reset`으로 그 시점에 돌아간 뒤 다시 올릴 수 있다. 되감은 커밋의 해시를 잊었다면 `git reflog`로 HEAD가 지나온 기록을 찾는다.

## revert: 취소 커밋을 새로 쌓기

`git revert <커밋>`은 그 커밋의 변경을 반대로 적용한 **새 커밋**을 만든다. 이력은 그대로 남고 "되돌렸다"는 기록이 더해진다.

- **이미 push해서 다른 사람이 받아 간 커밋**은 revert로 되돌린다. reset 후 force push하면 동료의 로컬 이력과 어긋난다.
- 아직 나만 가진 로컬 커밋이면 reset이 더 간단하다.

## rebase: 내 브랜치를 최신 기준 위로 옮기기

`git rebase main`은 내 브랜치가 **마치 최신 main에서 시작한 것처럼** 시작점을 옮긴다. merge가 기준 브랜치의 변경을 맨 끝에 merge 커밋으로 합치는 것과 달리, rebase는 내 커밋들을 최신 main 뒤에 하나씩 다시 쌓는다.

```text
merge:   main ─A─B─C──────M      (M = merge 커밋)
               └─X─Y─┘
rebase:  main ─A─B─C─X'─Y'       (X, Y가 새 커밋 X', Y'로 다시 만들어짐)
```

- 장점: 이력이 일직선이 되어 PR의 변경 범위가 잘 보이고 리뷰가 편하다.
- 주의: 커밋이 새로 만들어지므로 이미 push한 브랜치라면 force push가 필요하다. 여러 사람이 함께 쓰는 브랜치에서는 팀 규칙을 먼저 정한다.

## cherry-pick: 커밋 하나만 가져오기

```bash
git cherry-pick a1b2c3d
```

동료의 커밋이나 다른 브랜치에 있는 내 예전 커밋 **하나만** 현재 브랜치로 복사한다. 브랜치 전체를 합치지 않고 특정 수정만 필요할 때 쓴다.

## --abort: 진행 중인 작업 취소

merge나 rebase 도중 충돌이 너무 많거나 잘못된 쪽 코드를 골랐다면, 하나씩 고치기보다 **처음부터 다시 하는 편이 빠를 때**가 있다.

```bash
git merge --abort    # (MERGING) 상태에서 빠져나와 merge 전으로
git rebase --abort   # rebase 시작 전으로
```

명령을 치기 전 상태로 완전히 돌아간다. 이미 merge·rebase를 끝내고 push까지 했다면 abort로는 되돌릴 수 없고, reset이나 revert를 써야 한다.

## 정리

- 공유된 이력은 **revert**, 나만 가진 이력은 **reset**.
- reset 옵션은 변경 내용을 staged(`--soft`)·unstaged(`--mixed`)로 남기거나 버린다(`--hard`).
- rebase는 이력을 깔끔하게 하지만 커밋을 새로 만든다. force push가 따라온다.
- 꼬였으면 `--abort`로 처음부터. 그래도 가장 확실한 백업은 자주 commit·push 해 두는 것이다.

## 참고 자료

- [git 이전 commit으로 돌아가기](https://medium.com/@kwoncharles/git-%EC%9D%B4%EC%A0%84-commit%EC%9C%BC%EB%A1%9C-%EB%8F%8C%EC%95%84%EA%B0%80%EA%B8%B0-cf6caed43ed5)
- [Git 특정 버전으로 되돌렸다가 돌아오기](https://mintaku.tistory.com/12)
- [진행중이던 merge 작업 취소하기](https://nochoco-lee.tistory.com/83)

관련 노트: [[merge|Git 브랜치 병합]], [[branch|Git 브랜치]], [[remote-github|원격 저장소와 GitHub]]
