---
title: "원격 저장소와 GitHub"
concept: "Remote Repository"
summary: "remote·push·pull·fetch·clone으로 로컬 저장소를 GitHub 같은 원격 저장소와 동기화하는 방법."
tags: ["git", "github", "collaboration"]
source: til
---

로컬 저장소는 내 컴퓨터에만 있습니다. **원격 저장소(remote repository)** 를 연결하면 작업을 백업하고, 다른 사람과 같은 저장소를 공유하며 협업할 수 있습니다. 가장 널리 쓰이는 원격 저장소 서비스가 GitHub입니다.

## 원격 저장소 등록·조회·삭제

```bash
$ git remote add origin https://github.com/username/repository.git   # 등록
$ git remote -v                                                       # 조회
origin  https://github.com/username/repository.git (fetch)
origin  https://github.com/username/repository.git (push)
$ git remote remove origin                                            # 삭제 (rm 도 가능)
```

`origin`은 관례적으로 쓰는 원격 저장소 이름입니다.

## 올리기: `git push`

로컬 브랜치의 커밋을 원격 저장소에 반영합니다.

```bash
$ git push origin master     # 기본 브랜치가 main이면 main
# 처음 한 번 -u 옵션으로 추적 관계를 만들어 두면 이후엔 git push 만으로 충분하다
$ git push -u origin master
```

## 가져오기: `git fetch` vs `git pull`

| 명령 | 동작 |
| --- | --- |
| `git fetch` | 원격의 새 커밋을 **받아오기만** 한다. 내 브랜치는 그대로 (`origin/master`만 갱신) |
| `git pull` | `fetch` + 통합. 받아온 뒤 현재 브랜치에 **반영까지** 한다 |

```bash
$ git pull origin master
From https://github.com/username/repository
 * branch            master     -> FETCH_HEAD
   ee084e8..d58b853  master     -> origin/master
Updating ee084e8..d58b853
Fast-forward
 README.md | 0
 1 file changed, 0 insertions(+), 0 deletions(-)
```

병합 과정이므로 [Fast-Forward나 충돌](merge.md)이 똑같이 발생할 수 있습니다.

> 주의: 예전 Git의 `git pull`은 내 브랜치와 원격 브랜치가 갈라져 있으면 자동으로 merge 커밋을 만들었지만, 최신 Git은 통합 방법이 설정되어 있지 않으면 **fast-forward만 시도하고, 갈라진 경우에는 실패**합니다. 이때는 `git pull --rebase`(내 커밋을 원격 끝으로 옮김)나 `git pull --no-rebase`(merge 커밋 생성) 중 하나를 고르거나, `git config --global pull.rebase false`(또는 `true`)로 기본값을 정해 둡니다. ([git-pull 문서](https://git-scm.com/docs/git-pull))

## 복제: `git clone`

원격 저장소 전체(모든 커밋 이력 포함)를 새 폴더로 내려받습니다. 저장소 이름과 같은 폴더가 생기고, `origin`도 자동으로 등록됩니다.

```bash
$ git clone https://github.com/username/repository.git
$ cd repository
$ git log      # 원격의 이력이 그대로 들어 있다
```

- 로컬 저장소를 시작하는 방법은 두 가지: **새로 만들거나(`init`) 복제하거나(`clone`)**.
- clone한 저장소에서 커밋은 자유롭게 할 수 있지만, push는 그 저장소에 **쓰기 권한(collaborator 초대 등)** 이 있어야 가능하다.
- 모든 사람이 전체 이력을 가진다는 점이 바로 *분산* 버전 관리의 의미다.

## 커밋 해시

각 커밋은 SHA-1 해시(40자리 16진수)로 식별됩니다. (Git은 SHA-256 저장소도 지원하며, Git 3.0부터는 새 저장소의 기본 해시를 SHA-256(64자리)으로 바꿀 예정입니다. [Git BreakingChanges](https://git-scm.com/docs/BreakingChanges)) 충돌 가능성이 사실상 없을 만큼 큰 값이라 전 세계 어디서 만든 커밋이든 고유하게 구분할 수 있고, 평소에는 앞 7자리 정도(`git log --oneline`)만 써도 충분합니다.

## 좋은 커밋 메시지

협업에서는 커밋 메시지가 곧 문서입니다. 자주 언급되는 규칙은 다음과 같습니다.

- 제목은 50자 이내로, 마침표 없이, 명령문으로 (`Add`, `Fix`, `Update` …)
- 제목과 본문 사이에 빈 줄
- 본문에는 **무엇을, 왜** 바꿨는지

참고 글: [좋은 git 커밋 메시지를 작성하기 위한 7가지 약속](https://meetup.toast.com/posts/106), [좋은 git commit 메시지를 위한 영어 사전](https://blog.ull.im/engineering/2019/03/10/logs-on-git.html)

관련 노트: [[merge|브랜치 병합]], [[commit-convention|커밋 컨벤션]]
