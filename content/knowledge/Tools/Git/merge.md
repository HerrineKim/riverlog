---
title: "Git 브랜치 병합"
concept: "Merge"
summary: "갈라진 브랜치를 하나로 합치는 방법으로, Fast-Forward·3-Way Merge·Merge Conflict 세 가지 상황이 있다."
tags: ["git", "version-control", "branch", "merge"]
source: mixed
date: "2026-10-21"
sources: ["https://wizardzines.com/comics/merge-commits/", "https://github.com/arslanbilal/git-cheat-sheet", "https://github.com/mingrammer/git-tips"]
---

> 「충돌을 다루는 도구」는 arslanbilal의 「[Git and Git Flow Cheat Sheet](https://github.com/arslanbilal/git-cheat-sheet)」와 mingrammer의 「[Git Tips](https://github.com/mingrammer/git-tips)」를 바탕으로 보강했다.

브랜치에서 작업을 마치면 그 결과를 기본 브랜치에 반영해야 한다. 이를 **병합(merge)** 이라고 하며, 두 브랜치의 이력이 어떻게 갈라져 있는지에 따라 Git의 동작이 달라진다.

## `git merge` 기본

```bash
$ git switch master      # 1. 결과를 받을(합쳐질) 브랜치로 먼저 이동
$ git merge feature      # 2. 가져올 브랜치를 지정
```

`git merge <브랜치>`는 **현재 브랜치(HEAD)에 지정한 브랜치를 합친다.** 따라서 병합 전에 결과를 받을 브랜치로 `switch` 하는 것이 먼저다.

## 1. Fast-Forward

`feature` 브랜치를 만든 뒤 `master`에 새 커밋이 없는 경우이다. `feature`의 커밋이 `master` 커밋을 그대로 이어받았으므로, 새 커밋을 만들 필요 없이 **`master` 포인터를 앞으로 옮기기만** 하면 된다(빨리 감기).

![fast-forward](/images/til/ETC/Git/md-images/fast.png)

```bash
$ git switch -c login
$ touch login.txt && git add . && git commit -m "login test 1"
$ git switch master
$ git merge login
Updating 43fab3e..2fe539c
Fast-forward
 login.txt | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

$ git log --oneline --all --graph
* 2fe539c (HEAD -> master, login) login test 1
* 43fab3e master test 1

$ git branch -d login     # 병합이 끝난 브랜치는 삭제
```

## 2. 3-Way Merge (Merge Commit)

브랜치를 만든 뒤 **양쪽 모두에 새 커밋이 생긴** 경우이다. 포인터 이동만으로는 합칠 수 없으므로, Git은 **두 브랜치의 최신 커밋 2개 + 공통 조상 1개**를 비교해 결과를 계산하고, 이를 새로운 **Merge Commit**으로 남긴다. Merge Commit은 부모가 둘이다.

![3-way merge](/images/til/ETC/Git/md-images/way.png)

두 브랜치가 **서로 다른 파일** 또는 **같은 파일의 다른 부분**을 수정했다면 자동으로 병합된다.

```bash
$ git switch -c signout
$ touch signout.txt && git add . && git commit -m "signout test 1"
$ git switch master
$ touch master.txt && git add . && git commit -m "master test 2"

$ git merge signout
Merge made by the 'ort' strategy.
 signout.txt | 0
 1 file changed, 0 insertions(+), 0 deletions(-)

$ git log --oneline --all --graph
*   1170a02 (HEAD -> master) Merge branch 'signout'
|\
| * d9f33e2 (signout) signout test 1
* | 07fae72 master test 2
|/
* 2fe539c login test 1
* 43fab3e master test 1
```

> 참고: Git 2.33까지는 기본 전략이 `recursive`여서 `Merge made by the 'recursive' strategy.`로 표시된다. 2.34부터는 `ort`가 기본이다.

## 3. Merge Conflict

두 브랜치가 **같은 파일의 같은 부분**을 다르게 수정하면, Git은 어느 쪽을 택할지 판단하지 못하고 충돌(conflict)을 알린다. 이때는 사람이 직접 결과를 정해야 한다.

![conflict](/images/til/ETC/Git/md-images/conflict.png)

### 해결 순서

1. **충돌 발생**

   ```bash
   $ git merge hotfix
   Auto-merging test.txt
   CONFLICT (content): Merge conflict in test.txt
   Automatic merge failed; fix conflicts and then commit the result.
   ```

2. **어떤 파일이 충돌했는지 확인**

   ```bash
   $ git status
   On branch master
   You have unmerged paths.
     (fix conflicts and run "git commit")
     (use "git merge --abort" to abort the merge)

   Unmerged paths:
     (use "git add <file>..." to mark resolution)
           both modified:   test.txt
   ```

3. **파일을 열어 충돌 표시 정리**

   ```text
   master test 1
   <<<<<<< HEAD
   이건 master에서 작성한 문장
   =======
   이건 hotfix에서 작성한 문장
   >>>>>>> hotfix
   ```

   - `=======` 위는 현재 브랜치(HEAD, 여기서는 `master`), 아래는 병합하려는 브랜치(`hotfix`)의 내용이다.
   - 한쪽을 고르거나, 둘 다 남기거나, 새로 작성한 뒤 `<<<<<<<`, `=======`, `>>>>>>>` 줄을 모두 지운다.

   ```text
   master test 1
   충돌을 해결한 최종 문장
   ```

4. **add 후 commit으로 병합 완료**

   ```bash
   $ git add .
   $ git commit        # 에디터에 'Merge branch 'hotfix'' 메시지가 자동 작성됨 → Esc, :wq
   [master eec8da4] Merge branch 'hotfix'
   ```

병합을 포기하려면 `git merge --abort`를 쓴다([[git-undo-and-rewrite|Git 되돌리기와 이력 다루기]] 참고).

### 충돌을 다루는 도구

| 하고 싶은 일 | 명령 |
| --- | --- |
| 충돌 중인 파일만 나열 | `git diff --name-only --diff-filter=U` |
| 한쪽 버전을 통째로 고르기 | `git restore --ours <파일>` / `git restore --theirs <파일>` 후 `git add` (예전 형식은 `git checkout --ours`) |
| 그래픽 병합 도구로 풀기 | `git config --global merge.tool <도구>` 후 `git mergetool` (VS Code, meld, vimdiff 등) |
| 해결한 파일이 삭제된 쪽이 맞을 때 | `git rm <파일>` |
| 같은 충돌을 다시 풀지 않기 | `git config --global rerere.enabled true` ([[git-config-options\|자주 쓰는 Git 설정 옵션]]) |
| 갈라지기 전 원본까지 보며 풀기 | `git config --global merge.conflictstyle zdiff3` |

rebase 중의 충돌에서는 `--ours`와 `--theirs`의 뜻이 **반대**가 된다. rebase는 기준 브랜치 위에 내 커밋을 하나씩 다시 얹는 일이라, 그 순간 `ours`는 기준 브랜치 쪽이고 `theirs`는 내 커밋 쪽이다.

## Merge Commit의 함정

> Julia Evans의 만화 「[merge commits](https://wizardzines.com/comics/merge-commits/)」(wizard zines)를 요약·재구성한 부분이다.

Merge Commit에는 의외의 함정이 몇 가지 있다.

| 함정 | 내용 | 대처 |
| --- | --- | --- |
| 병합은 대칭이 아니다 | `main`에서 `merge mybranch`를 하든 `mybranch`에서 `merge main`을 하든 결과 코드는 같지만, **부모 순서가 다르다** | 보통은 `main`으로 이동해 `main`에 합친다 |
| 병합 중에도 코딩이 된다 | 병합 중인 걸 잊고 계속 작업하면, 상관없는 변경이 Merge Commit에 섞여 들어간다 | 프롬프트에 병합 중임을 표시한다 (예: `__git_ps1`의 `MERGING`) |
| `git show`가 다 보여 주지 않는다 | 한쪽 변경을 버리는 등 중요한 일을 했어도 Merge Commit이 "비어 있는" 것처럼 보일 수 있다 | `git show --remerge-diff`로 확인한다 |

### 부모 순서와 `HEAD^`

`HEAD^`는 **첫 번째 부모**를 가리킨다. 첫 번째 부모는 병합을 실행한 쪽, 즉 결과를 받은 브랜치의 커밋이다. 보통은 이것이 `main`의 커밋이기를 기대하므로, 거꾸로 병합하면 `HEAD^`·`git log --first-parent` 같은 명령이 예상과 다른 이력을 따라간다.

```text
git switch main; git merge mybranch   → 첫 번째 부모 = main  (일반적)
git switch mybranch; git merge main   → 첫 번째 부모 = mybranch (이상함)
```

### `git show --remerge-diff`

```bash
$ git show --remerge-diff <커밋 ID>
```

두 부모를 **다시 병합해 보고**, 그 결과와 실제 Merge Commit에 들어 있는 내용의 차이를 보여 준다. 충돌을 어떻게 풀었는지, 병합하면서 무엇을 버리거나 더했는지 확인할 때 쓴다. (Git 2.36부터 지원한다.)

## 핵심 정리

| 상황 | 조건 | 결과 |
| --- | --- | --- |
| Fast-Forward | 대상 브랜치에 새 커밋이 없음 | 포인터만 이동, 새 커밋 없음 |
| 3-Way Merge | 양쪽에 커밋, 수정 부분이 겹치지 않음 | 부모가 둘인 Merge Commit 생성 |
| Merge Conflict | 같은 파일의 같은 부분을 양쪽에서 수정 | 수동 해결 → `add` → `commit` |

- Merge Commit의 첫 번째 부모는 결과를 받은 브랜치다. `main`에서 병합해야 `HEAD^`가 `main`을 가리킨다.
- Merge Commit이 실제로 무엇을 했는지는 `git show --remerge-diff`로 본다.

> 참고: 병합 대신 `git rebase`로 이력을 일직선으로 만드는 방법은 [[merge-squash-rebase|merge·squash·rebase 언제 쓰나]]에 정리했다.

관련 노트: [[branch|Git 브랜치]], [[remote-github|원격 저장소와 GitHub]], [[git-config-options|자주 쓰는 Git 설정 옵션]], [[merge-squash-rebase|merge·squash·rebase 언제 쓰나]], [[branching-strategies|브랜치 전략]]
