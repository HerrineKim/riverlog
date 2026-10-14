---
title: "원격 저장소와 GitHub"
concept: "Remote Repository"
summary: "remote·push·pull·fetch·clone으로 로컬 저장소를 GitHub 같은 원격 저장소와 동기화하는 방법과, 이력을 유지한 채 다른 서비스로 옮기는 미러링."
tags: ["git", "github", "collaboration"]
source: til
date: "2026-10-14"
sources: ["https://riverkim.kr/94", "https://riverkim.kr/162", "https://80000coding.notion.site/19c283f564a6492d98945e4558a990d7"]
---

> 「주소 바꾸기와 원격 여러 개 두기」, 「git subtree」 부분은 팔만코딩경(42Seoul 커뮤니티 위키)의 「git - 사소한 꿀팁」을 바탕으로 보강했습니다.

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

### 주소 바꾸기와 원격 여러 개 두기

원격 저장소가 새 주소로 옮겨졌거나 새로 받은 저장소에 같은 작업을 올려야 할 때는 다시 clone하지 말고 주소만 바꿉니다. 이력과 로컬 브랜치가 그대로 남습니다.

```bash
$ git remote set-url origin https://github.com/username/new-repo.git
```

원격은 이름만 다르면 여러 개 둘 수 있습니다. 제출용 저장소(`origin`)와 개인 GitHub 저장소(`github`)에 같은 이력을 올리는 식입니다. 이때는 push할 때마다 **어느 원격에 올리는지 이름을 명시**해야 실수가 없습니다.

```bash
$ git remote add github https://github.com/username/my-copy.git
$ git push origin main     # 제출용
$ git push github main     # 개인 백업
```

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

> 주의: 최신 Git의 `git pull`은 내 브랜치와 원격 브랜치가 갈라져 있으면 통합 방법을 정해 달라며 멈춥니다. 그때마다 `--rebase`나 `--no-rebase`를 붙이거나, `pull.rebase`·`pull.ff` 설정으로 기본값을 정해 둡니다([[git-config-options|자주 쓰는 Git 설정 옵션]]).

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

## 다른 서비스로 옮기기: 미러링

GitLab에서 GitHub로 저장소를 옮길 때처럼 **커밋 이력·브랜치·태그를 모두 유지한 채** 복사하려면 `--mirror` 옵션을 씁니다.

```bash
$ git clone --mirror https://gitlab.com/username/project.git   # 모든 ref를 담은 bare 저장소
$ cd project.git
$ git push --mirror https://github.com/username/project.git    # 빈 새 저장소에 그대로 올림
```

| 막히는 지점 | 원인 | 해결 |
| --- | --- | --- |
| push가 크기 제한으로 거절됨 | 이력 어딘가에 대용량 파일(빌드 결과물, 데이터 등)이 커밋되어 있음 | Git LFS로 옮기거나 `git filter-repo`(또는 BFG Repo-Cleaner)로 이력에서 큰 파일을 지운 뒤 push |
| 기본 브랜치가 엉뚱하게 잡힘 | 두 저장소의 기본 브랜치 이름이 다름(`master` vs `main`) | 옮기기 전에 이름을 맞추거나, 옮긴 뒤 저장소 설정에서 기본 브랜치를 바꿈 |

### 여러 저장소를 하나로 모으기: `git subtree`

따로 관리하던 작은 저장소 여러 개를 한 저장소의 하위 폴더로 합치되 **각자의 커밋 이력도 함께 가져오려면** `git subtree add`를 씁니다.

```bash
$ git subtree add --prefix=fdf https://example.com/fdf.git master           # 이력까지 가져오기
$ git subtree add --prefix=fdf https://example.com/fdf.git master --squash  # 커밋 하나로 합쳐 가져오기
```

`--prefix`는 새로 만들 폴더 이름입니다. 이후에도 원래 저장소와 주고받으려면 `git subtree pull`/`push`를 쓰고, 한 번 합치고 끝이면 `add`만으로 충분합니다. 하위 폴더를 외부 저장소의 특정 커밋에 *연결*해 두는 방식인 `git submodule`과 달리, subtree는 파일을 저장소 안에 실제로 복사하므로 clone하는 사람이 추가 명령을 몰라도 됩니다.

대용량 저장소를 옮기는 전체 과정은 [GitLab → GitHub 대용량 프로젝트 이동 (lfs, bfg)](https://coding-nurse.tistory.com/431), 기본 흐름은 [Gitlab에서 Github으로 저장소 옮기기](https://jennnn.tistory.com/86)에 잘 정리되어 있습니다.

관련 노트: [[git-basics|Git 기본 명령과 파일 상태]], [[merge|브랜치 병합]], [[commit-convention|커밋 컨벤션과 자동 검사]], [[git-config-options|자주 쓰는 Git 설정 옵션]]
