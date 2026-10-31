---
title: "Git 기본 명령과 파일 상태"
concept: "Git Basics"
summary: "Git이 분산 버전 관리 시스템으로서 중앙 집중식(SVN)과 다른 점, 저장소를 만들고 add·commit으로 버전을 기록하며, 파일이 untracked·modified·staged·committed 상태를 오가는 흐름, 작업 디렉터리·스테이징·로컬·원격 네 곳 사이에서 명령이 코드를 옮기는 방식. 커밋을 식별하는 해시도 함께 다룬다."
tags: ["git", "version-control", "cli"]
source: til
date: "2026-10-21"
sources: ["https://80000coding.notion.site/2ea16c6dc08341c1a13339e30fe8ac49", "https://bytebytego.com/guides/how-does-git-work", "https://bytebytego.com/guides/git-workflow", "https://bytebytego.com/guides/git-commands-cheat-sheet", "https://github.com/arslanbilal/git-cheat-sheet", "https://github.com/mingrammer/git-tips", "https://blog.outsider.ne.kr/1247", "https://github.com/k88hudson/git-flight-rules/blob/master/README_kr.md", "https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/etc.md"]
---

> 「git add -p」 부분은 팔만코딩경(42Seoul 커뮤니티 위키)의 「git 변경사항 잘게 쪼개서 add 하기」를 바탕으로 보강했다. 「원격까지 네 곳」은 ByteByteGo의 System Design 101 가이드 「[How Git Works](https://bytebytego.com/guides/how-does-git-work)」, 「[How does Git Work?](https://bytebytego.com/guides/git-workflow)」, 「[Git Commands Cheat Sheet](https://bytebytego.com/guides/git-commands-cheat-sheet)」를 바탕으로 보강했다.
> 「차이 보기」, 「파일 옮기기와 추적 그만하기」는 arslanbilal의 「[Git and Git Flow Cheat Sheet](https://github.com/arslanbilal/git-cheat-sheet)」와 mingrammer의 「[Git Tips](https://github.com/mingrammer/git-tips)」를 바탕으로 보강했다.
> 「git add -p」의 `a`·`d`와 `-N`, 「커밋 전에 diff 보기」는 「[git add -p 와 git commit -v 의 사용](https://blog.outsider.ne.kr/1247)」과 「[Git Flight Rules](https://github.com/k88hudson/git-flight-rules/blob/master/README_kr.md)」를 바탕으로 보강했다.
> 「Git이란: 분산 버전 관리」는 「[fru1tworld/cs-basic 모의 면접 질문 목록](https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/etc.md)」의 질문을 계기로 Pro Git의 「[About Version Control](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control)」을 바탕으로 보강했다.

Git으로 버전을 남기는 과정은 결국 **"작업한 파일을 골라서(add) 스냅숏으로 기록(commit)"** 하는 일의 반복이다. 이 흐름과 각 단계에서 파일이 어떤 상태인지 알면 대부분의 `git status` 메시지를 읽을 수 있다.

## Git이란: 분산 버전 관리

**버전 관리 시스템(VCS)** 은 파일의 변경 이력을 기록해 두고, 원하는 시점으로 되돌리거나 여러 사람의 변경을 합치게 해 주는 도구다. 이력을 어디에 두느냐로 세 가지로 나뉜다.

| 방식 | 이력이 있는 곳 | 예 | 특징 |
| --- | --- | --- | --- |
| 로컬 VCS | 내 컴퓨터의 데이터베이스 | RCS | 혼자 쓸 때만 맞다. 협업이 안 된다 |
| 중앙 집중식(CVCS) | 중앙 서버 하나. 클라이언트는 최신 파일만 받는다 | SVN, CVS, Perforce | 관리가 단순하고 권한 통제가 쉽다. 서버가 죽으면 커밋·이력 조회가 멈추고, 서버 디스크를 잃으면 이력도 잃는다 |
| 분산(DVCS) | **모든 클론이 전체 이력의 사본**을 가진다 | Git, Mercurial | 커밋·브랜치·로그·diff를 네트워크 없이 로컬에서 한다. 어느 클론으로든 저장소를 복원할 수 있다 |

Git은 분산 버전 관리 시스템이고, 다른 VCS와 구분되는 성질이 몇 가지 있다.

| 성질 | 뜻 | 자세히 |
| --- | --- | --- |
| 스냅숏 저장 | 커밋마다 변경분(delta)이 아니라 그 시점 전체 파일 구조를 가리킨다. 바뀌지 않은 파일은 이전 것을 재사용한다 | [[git-internals\|Git의 내부 구조]] |
| 내용 기반 해시 | 모든 객체를 내용의 해시(SHA-1, 새 저장소는 SHA-256도 선택 가능)로 식별해 몰래 바뀐 데이터를 알아챈다 | [[git-internals\|Git의 내부 구조]] |
| 가벼운 브랜치 | 브랜치는 커밋 하나를 가리키는 포인터라 만들고 바꾸는 비용이 거의 없다. 그래서 기능마다 브랜치를 따는 작업 방식이 가능하다 | [[branch\|Git 브랜치]] |
| 스테이징 영역 | 작업 디렉터리와 커밋 사이에 「다음 커밋에 넣을 것」을 고르는 단계가 하나 더 있다 | 아래 「세 개의 영역」 |
| 대부분 로컬 작업 | 원격과 통신하는 명령은 `clone`·`fetch`·`pull`·`push` 정도다 | [[remote-github\|원격 저장소와 GitHub]] |

Git은 도구이고 GitHub·GitLab은 Git 저장소를 호스팅하며 PR·이슈 같은 협업 기능을 얹은 서비스다.

## 세 개의 영역

| 영역 | 설명 |
| --- | --- |
| Working Directory | 실제로 파일을 편집하는 작업 공간 |
| Staging Area (Index) | 다음 커밋에 포함할 변경 사항을 모아 두는 곳 |
| Repository (`.git`) | 커밋(버전)이 영구히 기록되는 저장소 |

![Git의 세 영역](/images/til/ETC/Git/git.assets/image-20220113101851253.png)

Staging Area와 Repository는 `.git` 폴더 안에서 관리되는 논리적 공간이다. 즉 `.git` 폴더를 지우면 **모든 버전 기록이 사라지니** 주의해야 한다.

### 원격까지 네 곳: 명령은 코드를 옮기는 일

흔히 코드가 "내 컴퓨터"와 "GitHub" 두 곳에 있다고 생각하지만, 로컬에만 세 곳이 있어 **코드는 모두 네 곳**에 있다. Git 명령 대부분은 이 네 곳 사이에서 변경을 옮기는 일이다.

```text
 Working Directory ──add──▶ Staging Area ──commit──▶ Local Repo ──push──▶ Remote Repo
        ▲                        │                       ▲  │                  │
        │◀── restore --staged ───┘                       │  └──── fetch ◀──────┘
        │◀──────────── switch / checkout / merge ─────────┘
        │◀──────────────────── pull (= fetch + merge) ─────────────────────────┘
                           clone: Remote Repo 전체를 처음 복사해 와 네 곳을 만든다
```

| 명령 | 어디에서 어디로 |
| --- | --- |
| `git add` | 작업 디렉터리 → 스테이징 영역 |
| `git commit` | 스테이징 영역 → 로컬 저장소 |
| `git push` | 로컬 저장소 → 원격 저장소 |
| `git fetch` | 원격 저장소 → 로컬 저장소(원격 추적 브랜치만 갱신, 작업 디렉터리는 그대로) |
| `git pull` | 원격 → 로컬 저장소 → 작업 디렉터리(fetch 뒤 merge 또는 rebase) |
| `git switch`·`checkout` | 로컬 저장소의 특정 브랜치·커밋 → 작업 디렉터리 |
| `git restore --staged <파일>` | 스테이징을 취소(스테이징 영역 → 작업 디렉터리로 되돌림) |
| `git restore <파일>` | 작업 디렉터리의 변경을 버리고 마지막 스테이징·커밋 상태로 |
| `git diff` / `git diff --staged` | 작업 디렉터리 vs 스테이징 / 스테이징 vs 마지막 커밋 |

`git restore`와 `git switch`는 하는 일이 너무 많던 `git checkout`을 나눈 명령이다. 과거 자료의 `git checkout -- <파일>`, `git reset <파일>`은 각각 `git restore <파일>`, `git restore --staged <파일>`과 같다. 이미 만든 커밋을 되돌리는 `revert`·`reset`은 [[git-undo-and-rewrite|Git 되돌리기와 이력 다루기]]에 있다.

## 파일의 상태(라이프 사이클)

- **untracked**: 한 번도 커밋(또는 add)된 적 없는, Git이 추적하지 않는 파일
- **tracked**: Git이 추적하는 파일
  - **unmodified (committed)**: 마지막 커밋과 동일한 상태
  - **modified**: 마지막 커밋 이후 수정된 상태
  - **staged**: 수정 사항이 Staging Area에 올라가 다음 커밋을 기다리는 상태

![파일 상태 변화](/images/til/ETC/Git/git.assets/image-20220113101938077.png)

커밋된 내용은 언제든 되살릴 수 있지만, 한 번도 커밋되지 않은 변경은 Git이 복구해 줄 수 없다. (`git restore <file>`로 작업 내용을 되돌리면 그 변경은 영영 사라지니 주의한다.)

## 기본 명령어

### 저장소 만들기: `git init`

```bash
$ git init
Initialized empty Git repository in /Users/me/first/.git/
```

현재 폴더에 `.git` 디렉터리가 생기고, 터미널 프롬프트에 `(master)` 처럼 현재 브랜치가 표시된다.

> 참고: GitHub는 2020년 10월부터 새 저장소의 기본 브랜치를 `main`으로 만든다([GitHub Changelog](https://github.blog/changelog/2020-10-01-the-default-branch-for-newly-created-repositories-is-now-main/)). 반면 Git 2.x의 `git init`은 설정이 없으면 여전히 `master`를 만들고 힌트 메시지를 띄우며, 다음 메이저 버전인 Git 3.0부터 `main`이 기본이 될 예정이다(출시일 미정, [Git BreakingChanges](https://git-scm.com/docs/BreakingChanges)). 지금 바로 맞추려면 `git config --global init.defaultBranch main` (Git 2.28+)으로 설정한다. 이름이 바뀐 배경은 master/slave 같은 용어가 노예제를 떠올리게 한다는 문제 제기이다. GitHub는 이런 문화적 민감성(cultural sensitivity)을 고려해 기본값을 `main`으로 바꿨고, 저장소를 다른 서비스로 미러링할 계획이라면 양쪽의 기본 브랜치 이름을 맞춰 두는 편이 안전하다([[remote-github|원격 저장소와 GitHub]]의 미러링 참고). 이 노트의 예시는 `master`를 쓰므로, `main`을 쓰는 저장소라면 이름만 바꿔 읽으면 된다.

### 스테이징: `git add`

```bash
$ git add a.txt            # 파일 하나
$ git add a.txt b.txt      # 여러 파일
$ git add my_folder/       # 폴더 전체
$ git add .                # 현재 디렉터리의 모든 변경
```

#### 파일의 일부만 고르기: `git add -p`

한 파일에 성격이 다른 수정 두 개가 섞여 있으면 커밋을 나누기 어렵다. `-p`(`--patch`)를 붙이면 변경을 **헝크(hunk)** 라는 덩어리 단위로 하나씩 보여 주며 스테이징할지 묻는다.

| 입력 | 동작 |
| --- | --- |
| `y` / `n` | 이 헝크를 스테이징 / 건너뛰기 |
| `s` | 헝크가 크면 더 작게 쪼개기 |
| `e` | 헝크를 편집기로 열어 줄 단위로 고르기 |
| `a` / `d` | 이 파일의 남은 헝크를 모두 스테이징 / 모두 건너뛰기 |
| `q` | 나머지는 건너뛰고 끝내기 |
| `?` | 전체 도움말 |

`git restore -p`(되돌리기), `git reset -p`(스테이징 취소), `git stash -p`도 같은 방식으로 일부만 고른다.

`add -p`는 **추적 중인 파일의 변경만** 보여 준다. 새 파일의 일부만 담으려면 먼저 `git add -N <파일>`(intent-to-add)로 "빈 파일이 추가될 예정"이라고 알린 뒤 `git add -p <파일>`을 쓴다.

`git add .`이나 `git commit -am`은 무엇이 들어가는지 보지 않고 담는다. 디버그 코드나 다른 작업이 섞여 들어가는 가장 흔한 경로이므로, **`add -p`로 헝크를 확인하며 담고 `git commit -v`로 커밋 직전에 diff를 한 번 더 보는 습관**이 커밋을 논리적 단위로 나누는 데도 도움이 된다(항상 켜려면 `commit.verbose true`).

### 커밋: `git commit`

```bash
$ git commit -m "Add login form"
$ git commit -am "Fix typo"      # 추적 중인 파일의 수정을 add 없이 바로 커밋 (새 파일은 안 들어간다)
```

커밋 메시지는 **이 버전에서 무엇이 바뀌었는지** 드러나도록 쓴다. `-m` 없이 실행하면 에디터(기본 Vim)가 열리고, 메시지를 쓴 뒤 `Esc` → `:wq` 로 저장·종료한다.

### 상태 확인: `git status`

```bash
$ git status
On branch master
Changes to be committed:            # Staging Area에 있는 변경
  (use "git restore --staged <file>..." to unstage)
        deleted:    b.txt
        new file:   c.txt

Changes not staged for commit:      # 수정됐지만 아직 add 안 함
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   a.txt

Untracked files:                    # Git이 추적하지 않는 새 파일
  (use "git add <file>..." to include in what will be committed)
        d.txt
```

`git status -sb`는 같은 내용을 한 줄씩 짧게 보여 준다(앞 칸이 staged, 뒤 칸이 unstaged 상태). `status` 출력은 위의 세 영역과 그대로 대응한다. 안내 문구에 나오는 `git restore --staged`(스테이징 취소)와 `git restore`(작업 내용 되돌리기)도 함께 기억해 두면 좋다.

### 차이 보기: `git diff`

`git diff`는 **어느 두 영역을 비교하느냐**에 따라 결과가 다르다. "diff가 비어 있다"는 대부분 이미 add한 변경을 그냥 `git diff`로 봤기 때문이다.

| 명령 | 비교 대상 |
| --- | --- |
| `git diff` | Staging Area ↔ Working Directory (아직 add 안 한 변경) |
| `git diff --staged` (= `--cached`) | HEAD ↔ Staging Area (다음 커밋에 들어갈 변경) |
| `git diff HEAD` | HEAD ↔ Working Directory (둘 다) |
| `git diff main..feature` | 두 브랜치 끝 사이 |
| `git diff --word-diff` | 줄 대신 단어 단위로 (문서 수정에 편하다) |
| `git diff --name-only` / `--stat` | 바뀐 파일 이름만 / 파일별 변경량 |

### 이력 보기: `git log`

```bash
$ git log                       # 전체 이력
$ git log --oneline             # 한 줄 요약
$ git log --oneline --all --graph   # 모든 브랜치를 그래프로
```

이력을 조건으로 걸러 찾는 방법(작성자·기간·메시지·코드 검색, blame, bisect)은 [[git-history-search|Git 이력 검색]]에 있다.

#### 커밋 해시

로그의 각 커밋 앞에 붙는 40자리 16진수가 **커밋 해시(SHA-1)** 이다. 전 세계 어디서 만든 커밋이든 충돌 없이 구분할 만큼 큰 값이라서, 평소에는 `git log --oneline`에 보이는 앞 7자리 정도만 써도 충분하다. Git은 SHA-256 저장소도 지원하며, Git 3.0부터는 새 저장소의 기본 해시를 SHA-256(64자리)으로 바꿀 예정이다([Git BreakingChanges](https://git-scm.com/docs/BreakingChanges)).

### 파일 옮기기와 추적 그만하기

```bash
$ git mv old.txt new.txt          # 이름 바꾸기 = 옮기고 옛 경로 삭제를 한 번에 스테이징
$ git rm a.txt                    # 파일을 지우고 삭제를 스테이징
$ git rm --cached secret.env      # 파일은 남기고 Git 추적만 끊는다
```

Git은 파일만 추적하고 **빈 폴더는 추적하지 않는다.** 빈 폴더를 저장소에 남기려면 안에 `.gitkeep` 같은 빈 파일을 하나 둔다(이름은 관례일 뿐 Git이 특별히 다루지 않는다).

`.gitignore`는 **아직 추적하지 않는 파일**에만 적용된다. 이미 커밋한 파일을 나중에 `.gitignore`에 넣어도 계속 추적된다. 이때는 추적을 끊고 다시 커밋한다.

```bash
$ git rm -r --cached .            # 인덱스를 비우고 (파일은 그대로)
$ git add .                       # .gitignore를 반영해 다시 담는다
$ git commit -m "Stop tracking ignored files"
```

이력에 남은 내용은 그대로이므로, 비밀 값이었다면 [[git-undo-and-rewrite|되돌리기와 이력 다루기]]의 민감 정보 절차를 따른다. 어떤 규칙 때문에 무시되는지는 `git check-ignore -v <파일>`로 본다.

> 추적 중인 파일의 로컬 수정만 숨기려고 `git update-index --assume-unchanged`나 `--skip-worktree`를 쓰는 팁이 돌지만, 공식 문서는 이 용도로 쓰지 말라고 한다(원래 성능 힌트·희소 체크아웃용이라 pull·switch 때 예기치 않게 동작한다). 로컬 설정은 추적하지 않는 별도 파일(`config.local` 등)로 분리한다.

## 자주 쓰는 셸 명령

Git Bash/터미널에서 함께 쓰는 기본 명령이다.

```bash
$ pwd               # 현재 위치
$ ls                # 목록 보기
$ cd ..             # 상위 디렉터리로 이동
$ mkdir dir         # 폴더 생성
$ touch a.txt       # 빈 파일 생성
$ rm -rf dir        # 폴더와 하위 파일 모두 삭제 (주의)
```

## 핵심 정리

- Git은 모든 클론이 전체 이력을 가지는 분산 버전 관리 시스템이고, 변경분이 아니라 스냅숏을 기록한다.
- 버전 기록 = `add`로 고르고 `commit`으로 남긴다.
- `git status`의 세 구역(staged / not staged / untracked)은 Staging Area · Working Directory · 미추적 파일에 대응한다.
- `.git` 폴더가 곧 저장소다. 지우면 이력이 사라진다.
- `git diff`는 add 전, `git diff --staged`는 add 후의 변경이다.
- 코드는 작업 디렉터리·스테이징·로컬 저장소·원격 저장소 네 곳에 있고, 명령은 그 사이를 옮긴다.

관련 노트: [[branch|Git 브랜치]], [[remote-github|원격 저장소와 GitHub]], [[git-config-options|자주 쓰는 Git 설정 옵션]], [[git-internals|Git의 내부 구조]], [[git-history-search|Git 이력 검색]], [[stash-worktree-clean|stash, worktree, clean]], [[git-undo-and-rewrite|Git 되돌리기와 이력 다루기]]
