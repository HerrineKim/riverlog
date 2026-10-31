---
title: "원격 저장소와 GitHub"
concept: "Remote Repository"
summary: "Git(버전 관리 도구)과 GitHub(호스팅·협업 서비스)의 차이, remote·push·pull·fetch·clone으로 로컬 저장소를 GitHub 같은 원격 저장소와 동기화하는 방법과, 이력을 유지한 채 다른 서비스로 옮기는 미러링."
tags: ["git", "github", "collaboration"]
source: til
date: "2026-10-21"
sources: ["https://riverkim.kr/94", "https://riverkim.kr/162", "https://80000coding.notion.site/19c283f564a6492d98945e4558a990d7", "https://bytebytego.com/guides/git-vs-github", "https://github.com/arslanbilal/git-cheat-sheet", "https://github.com/mingrammer/git-tips", "https://git-scm.com/docs/git-submodule", "https://git-scm.com/docs/git-push", "https://parksb.github.io/article/28.html", "https://github.com/k88hudson/git-flight-rules/blob/master/README_kr.md"]
---

> 「주소 바꾸기와 원격 여러 개 두기」, 「git subtree」 부분은 팔만코딩경(42Seoul 커뮤니티 위키)의 「git - 사소한 꿀팁」을 바탕으로 보강했다. 「Git과 GitHub」는 ByteByteGo의 System Design 101 가이드 「[Git vs GitHub](https://bytebytego.com/guides/git-vs-github)」를 바탕으로 보강했다.
> 「원격 관리 명령」, 「안전한 강제 push」, 「PR을 로컬로 받아 보기」, 「submodule」, 「네트워크 없이 넘기기」는 arslanbilal의 「[Git and Git Flow Cheat Sheet](https://github.com/arslanbilal/git-cheat-sheet)」와 mingrammer의 「[Git Tips](https://github.com/mingrammer/git-tips)」를 바탕으로, 명령은 Git 공식 문서로 확인해 보강했다.
> 「포크 저장소 최신으로 맞추기」, `set-head`, submodule 제거는 「[Git 사용 중 자주 만나는 이슈 정리](https://parksb.github.io/article/28.html)」와 「[Git Flight Rules](https://github.com/k88hudson/git-flight-rules/blob/master/README_kr.md)」를 바탕으로 보강했다.

로컬 저장소는 내 컴퓨터에만 있다. **원격 저장소(remote repository)** 를 연결하면 작업을 백업하고, 다른 사람과 같은 저장소를 공유하며 협업할 수 있다. 가장 널리 쓰이는 원격 저장소 서비스가 GitHub이다.

## Git과 GitHub

**Git은 버전 관리 도구이고, GitHub는 Git 저장소를 클라우드에 올려 두고 협업하는 서비스다.** Git 없이 GitHub를 쓸 수는 없지만, GitHub 없이 Git은 얼마든지 쓴다.

| | Git | GitHub |
| --- | --- | --- |
| 정체 | 무료 오픈소스 분산 버전 관리 도구 | Git 저장소 호스팅 서비스(무료·유료 요금제) |
| 위치 | 개발자 컴퓨터에 설치해 로컬에서 동작 | 클라우드 |
| 관리 주체 | 오픈소스 커뮤니티(리눅스 커널 개발에서 출발) | Microsoft |
| 하는 일 | 파일의 버전 기록, 브랜치, 병합 | 저장소 공유, PR·코드 리뷰, 이슈·프로젝트 관리, CI(GitHub Actions) |
| 확장 | 외부 도구 연동이 거의 없다 | 앱·액션 마켓플레이스로 다른 도구와 연동 |

GitLab, Bitbucket도 같은 자리의 서비스다. 어느 서비스로 옮겨도 Git 이력은 그대로 따라간다(아래 「미러링」).

## 원격 저장소 등록·조회·삭제

```bash
$ git remote add origin https://github.com/username/repository.git   # 등록
$ git remote -v                                                       # 조회
origin  https://github.com/username/repository.git (fetch)
origin  https://github.com/username/repository.git (push)
$ git remote remove origin                                            # 삭제 (rm 도 가능)
```

`origin`은 관례적으로 쓰는 원격 저장소 이름이다.

### 주소 바꾸기와 원격 여러 개 두기

원격 저장소가 새 주소로 옮겨졌거나 새로 받은 저장소에 같은 작업을 올려야 할 때는 다시 clone하지 말고 주소만 바꾼다. 이력과 로컬 브랜치가 그대로 남는다.

```bash
$ git remote set-url origin https://github.com/username/new-repo.git
```

원격은 이름만 다르면 여러 개 둘 수 있다. 제출용 저장소(`origin`)와 개인 GitHub 저장소(`github`)에 같은 이력을 올리는 식이다. 이때는 push할 때마다 **어느 원격에 올리는지 이름을 명시**해야 실수가 없다.

```bash
$ git remote add github https://github.com/username/my-copy.git
$ git push origin main     # 제출용
$ git push github main     # 개인 백업
```

### 원격 관리 명령

```bash
$ git remote rename origin upstream        # 원격 이름 바꾸기
$ git remote show origin                   # 원격 브랜치, 추적 관계, push·pull 대상 한눈에
$ git ls-remote origin                     # clone 없이 원격의 브랜치·태그 목록
$ git remote set-head origin --auto        # 원격의 기본 브랜치가 바뀌었을 때 origin/HEAD 다시 맞추기
$ git fetch --prune                        # 원격에서 지워진 브랜치의 origin/* 정리 (= git remote prune origin)
$ git push origin --delete <브랜치>         # 원격 브랜치 삭제 (옛 형식: git push origin :<브랜치>)
```

`git remote remove`는 **내 로컬의 연결 정보만** 지운다. 원격 저장소 자체는 그대로다.

## 올리기: `git push`

로컬 브랜치의 커밋을 원격 저장소에 반영한다.

```bash
$ git push origin master     # 기본 브랜치가 main이면 main
# 처음 한 번 -u 옵션으로 추적 관계를 만들어 두면 이후엔 git push 만으로 충분하다
$ git push -u origin master
```

### 안전한 강제 push

rebase나 amend로 이미 올린 커밋을 바꾸면 일반 push는 거절된다. 이때 `--force`(`-f`)는 원격을 무조건 덮어써서, 그사이 동료가 올린 커밋까지 지운다. **`--force-with-lease`를 기본으로 쓴다.**

```bash
$ git push --force-with-lease origin feature
```

| 옵션 | 동작 |
| --- | --- |
| `--force` | 원격 상태와 상관없이 덮어쓴다 |
| `--force-with-lease` | 원격 브랜치가 **내가 마지막으로 fetch한 상태 그대로일 때만** 덮어쓴다. 누가 새로 올렸으면 거절한다 |
| `--force-with-lease --force-if-includes` | 위에 더해, 백그라운드 fetch로 원격 추적 브랜치만 갱신되고 그 커밋을 내가 실제로 반영하지 않은 경우도 거절한다(Git 2.30+) |

공유 브랜치(`main` 등)에는 강제 push 자체를 하지 않는다. 브랜치 보호 규칙으로 막아 두는 것이 안전하다([[github-collaboration|GitHub 협업 저장소 설정]]).

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

병합 과정이므로 [Fast-Forward나 충돌](merge.md)이 똑같이 발생할 수 있다.

> 주의: 최신 Git의 `git pull`은 내 브랜치와 원격 브랜치가 갈라져 있으면 통합 방법을 정해 달라며 멈춘다. 그때마다 `--rebase`나 `--no-rebase`를 붙이거나, `pull.rebase`·`pull.ff` 설정으로 기본값을 정해 둔다([[git-config-options|자주 쓰는 Git 설정 옵션]]).

### 포크 저장소 최신으로 맞추기

포크한 저장소는 원본이 바뀌어도 자동으로 따라가지 않는다. 원본을 `upstream`이라는 이름으로 하나 더 등록해 두고 거기서 받는다.

```bash
$ git remote add upstream https://github.com/original/repo.git
$ git fetch upstream
$ git switch main
$ git merge --ff-only upstream/main     # 내 main에 커밋이 없으면 빨리 감기만
$ git push origin main                  # 내 포크(origin)에도 반영
```

GitHub 웹의 「Sync fork」 버튼이나 `gh repo sync`도 같은 일을 한다. 기여용 브랜치는 `upstream/main`에서 따야 PR에 엉뚱한 커밋이 섞이지 않는다.

### PR을 로컬로 받아 보기

GitHub는 모든 PR을 `refs/pull/<번호>/head`라는 참조로 노출한다. 포크에서 온 PR도 원격을 추가하지 않고 받을 수 있다.

```bash
$ git fetch origin pull/123/head:pr-123    # PR #123을 로컬 브랜치 pr-123으로
$ git switch pr-123
$ gh pr checkout 123                       # GitHub CLI를 쓰면 한 줄
```

## 복제: `git clone`

원격 저장소 전체(모든 커밋 이력 포함)를 새 폴더로 내려받는다. 저장소 이름과 같은 폴더가 생기고, `origin`도 자동으로 등록된다.

```bash
$ git clone https://github.com/username/repository.git
$ cd repository
$ git log      # 원격의 이력이 그대로 들어 있다
```

- 로컬 저장소를 시작하는 방법은 두 가지: **새로 만들거나(`init`) 복제하거나(`clone`)**.
- clone한 저장소에서 커밋은 자유롭게 할 수 있지만, push는 그 저장소에 **쓰기 권한(collaborator 초대 등)** 이 있어야 가능하다.
- 모든 사람이 전체 이력을 가진다는 점이 바로 분산 버전 관리의 의미다.
- 이력이나 파일이 너무 커서 clone이 느리면 얕은 클론(`--depth`), 단일 브랜치, 부분 클론(`--filter=blob:none`), 희소 체크아웃으로 받는 양을 줄인다([[large-repo-git-performance|대형 저장소에서 Git 빠르게 쓰기]]).

## 다른 서비스로 옮기기: 미러링

GitLab에서 GitHub로 저장소를 옮길 때처럼 **커밋 이력·브랜치·태그를 모두 유지한 채** 복사하려면 `--mirror` 옵션을 쓴다.

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

따로 관리하던 작은 저장소 여러 개를 한 저장소의 하위 폴더로 합치되 **각자의 커밋 이력도 함께 가져오려면** `git subtree add`를 쓴다.

```bash
$ git subtree add --prefix=fdf https://example.com/fdf.git master           # 이력까지 가져오기
$ git subtree add --prefix=fdf https://example.com/fdf.git master --squash  # 커밋 하나로 합쳐 가져오기
```

`--prefix`는 새로 만들 폴더 이름이다. 이후에도 원래 저장소와 주고받으려면 `git subtree pull`/`push`를 쓰고, 한 번 합치고 끝이면 `add`만으로 충분하다. 하위 폴더를 외부 저장소의 특정 커밋에 연결해 두는 방식인 `git submodule`과 달리, subtree는 파일을 저장소 안에 실제로 복사하므로 clone하는 사람이 추가 명령을 몰라도 된다. 하위 폴더만 다른 브랜치로 내보낼 때도 쓴다(`git subtree push --prefix=docs origin gh-pages`).

### 외부 저장소를 특정 커밋으로 연결하기: `git submodule`

submodule은 하위 폴더 자리에 **다른 저장소의 특정 커밋을 가리키는 포인터**만 둔다. 파일을 복사하지 않으므로 외부 저장소를 원래 이력 그대로 따로 관리할 수 있지만, clone하는 사람이 추가 명령을 알아야 한다.

```bash
$ git submodule add https://github.com/org/lib.git libs/lib   # .gitmodules와 포인터 커밋 생성
$ git clone --recurse-submodules <url>                        # 처음 받을 때 함께
$ git submodule update --init --recursive                     # 이미 clone했는데 폴더가 비어 있을 때
$ git submodule update --remote libs/lib                      # 외부 저장소의 최신 커밋으로 올리기
$ git add libs/lib && git commit -m "Bump lib"                # 바뀐 포인터를 커밋해야 팀에 반영된다
$ git submodule deinit libs/lib && git rm libs/lib            # submodule 제거 (.git/modules/libs/lib도 지운다)
```

| 항목 | subtree | submodule |
| --- | --- | --- |
| 저장 방식 | 파일과 이력을 실제로 복사 | 커밋 해시 포인터만 |
| clone하는 사람 | 추가 명령 불필요 | `--recurse-submodules` 또는 `update --init` 필요 |
| 외부 저장소 갱신 | `subtree pull` | `submodule update --remote` 후 포인터 커밋 |
| 맞는 경우 | 한 번 합치고 거의 안 바꾸는 코드 | 독립적으로 버전을 관리하는 공유 라이브러리 |

자주 쓴다면 `submodule.recurse true` 같은 설정으로 pull·switch 때 자동으로 따라오게 한다([[git-config-options|자주 쓰는 Git 설정 옵션]]).

## 네트워크 없이 넘기기: bundle, archive

| 명령 | 만드는 것 | 쓰임 |
| --- | --- | --- |
| `git bundle create repo.bundle main` | 이력을 담은 파일 하나. `git clone repo.bundle`로 저장소처럼 받는다 | 망 분리 환경, 오프라인 전달 |
| `git archive main --format=zip -o main.zip` | 그 시점의 파일만(이력·`.git` 없음) | 소스 배포본, 빌드 서버에 넘기기 |

대용량 저장소를 옮기는 전체 과정은 [GitLab → GitHub 대용량 프로젝트 이동 (lfs, bfg)](https://coding-nurse.tistory.com/431), 기본 흐름은 [Gitlab에서 Github으로 저장소 옮기기](https://jennnn.tistory.com/86)에 잘 정리되어 있다.

관련 노트: [[git-basics|Git 기본 명령과 파일 상태]], [[merge|브랜치 병합]], [[commit-convention|커밋 컨벤션과 자동 검사]], [[git-config-options|자주 쓰는 Git 설정 옵션]], [[large-repo-git-performance|대형 저장소에서 Git 빠르게 쓰기]]
