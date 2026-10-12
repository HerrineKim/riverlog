---
title: "Git 브랜치 병합"
concept: "Merge"
summary: "갈라진 브랜치를 하나로 합치는 방법으로, Fast-Forward·3-Way Merge·Merge Conflict 세 가지 상황이 있다."
tags: ["git", "version-control", "branch", "merge"]
source: til
---

브랜치에서 작업을 마치면 그 결과를 기본 브랜치에 반영해야 합니다. 이를 **병합(merge)** 이라고 하며, 두 브랜치의 이력이 어떻게 갈라져 있는지에 따라 Git의 동작이 달라집니다.

## `git merge` 기본

```bash
$ git switch master      # 1. 결과를 받을(합쳐질) 브랜치로 먼저 이동
$ git merge feature      # 2. 가져올 브랜치를 지정
```

`git merge <브랜치>`는 **현재 브랜치(HEAD)에 지정한 브랜치를 합칩니다.** 따라서 병합 전에 결과를 받을 브랜치로 `switch` 하는 것이 먼저입니다.

## 1. Fast-Forward

`feature` 브랜치를 만든 뒤 `master`에 새 커밋이 없는 경우입니다. `feature`의 커밋이 `master` 커밋을 그대로 이어받았으므로, 새 커밋을 만들 필요 없이 **`master` 포인터를 앞으로 옮기기만** 하면 됩니다(빨리 감기).

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

브랜치를 만든 뒤 **양쪽 모두에 새 커밋이 생긴** 경우입니다. 포인터 이동만으로는 합칠 수 없으므로, Git은 **두 브랜치의 최신 커밋 2개 + 공통 조상 1개**를 비교해 결과를 계산하고, 이를 새로운 **Merge Commit**으로 남깁니다. Merge Commit은 부모가 둘입니다.

![3-way merge](/images/til/ETC/Git/md-images/way.png)

두 브랜치가 **서로 다른 파일** 또는 **같은 파일의 다른 부분**을 수정했다면 자동으로 병합됩니다.

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

> 참고: Git 2.33까지는 기본 전략이 `recursive`여서 `Merge made by the 'recursive' strategy.`로 표시됩니다. 2.34부터는 `ort`가 기본입니다.

## 3. Merge Conflict

두 브랜치가 **같은 파일의 같은 부분**을 다르게 수정하면, Git은 어느 쪽을 택할지 판단하지 못하고 충돌(conflict)을 알립니다. 이때는 사람이 직접 결과를 정해야 합니다.

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

병합을 포기하고 이전 상태로 돌아가고 싶다면 `git merge --abort` 를 사용합니다.

## 핵심 정리

| 상황 | 조건 | 결과 |
| --- | --- | --- |
| Fast-Forward | 대상 브랜치에 새 커밋이 없음 | 포인터만 이동, 새 커밋 없음 |
| 3-Way Merge | 양쪽에 커밋, 수정 부분이 겹치지 않음 | 부모가 둘인 Merge Commit 생성 |
| Merge Conflict | 같은 파일의 같은 부분을 양쪽에서 수정 | 수동 해결 → `add` → `commit` |

> 참고: 병합 외에 `git rebase`로 한 브랜치의 커밋들을 다른 브랜치 끝으로 옮겨 이력을 일직선으로 만드는 방법도 있습니다. 이력이 깔끔해지는 대신 커밋이 새로 만들어지므로, 이미 원격에 공유한 브랜치에는 쓰지 않는 것이 원칙입니다.

관련 노트: [[branch|Git 브랜치]], [[remote-github|원격 저장소와 GitHub]]
