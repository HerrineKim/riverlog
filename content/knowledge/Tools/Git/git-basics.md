---
title: "Git 기본 명령과 파일 상태"
concept: "Git Basics"
summary: "저장소를 만들고 add·commit으로 버전을 기록하며, 파일이 untracked·modified·staged·committed 상태를 오가는 흐름. 커밋을 식별하는 해시도 함께 다룬다."
tags: ["git", "version-control", "cli"]
source: til
date: "2026-10-14"
sources: ["https://80000coding.notion.site/2ea16c6dc08341c1a13339e30fe8ac49"]
---

> 「git add -p」 부분은 팔만코딩경(42Seoul 커뮤니티 위키)의 「git 변경사항 잘게 쪼개서 add 하기」를 바탕으로 보강했습니다.

Git으로 버전을 남기는 과정은 결국 **"작업한 파일을 골라서(add) 스냅숏으로 기록(commit)"** 하는 일의 반복입니다. 이 흐름과 각 단계에서 파일이 어떤 상태인지 알면 대부분의 `git status` 메시지를 읽을 수 있습니다.

## 세 개의 영역

| 영역 | 설명 |
| --- | --- |
| Working Directory | 실제로 파일을 편집하는 작업 공간 |
| Staging Area (Index) | 다음 커밋에 포함할 변경 사항을 모아 두는 곳 |
| Repository (`.git`) | 커밋(버전)이 영구히 기록되는 저장소 |

![Git의 세 영역](/images/til/ETC/Git/git.assets/image-20220113101851253.png)

Staging Area와 Repository는 `.git` 폴더 안에서 관리되는 논리적 공간입니다. 즉 `.git` 폴더를 지우면 **모든 버전 기록이 사라지니** 주의해야 합니다.

## 파일의 상태(라이프 사이클)

- **untracked**: 한 번도 커밋(또는 add)된 적 없는, Git이 추적하지 않는 파일
- **tracked**: Git이 추적하는 파일
  - **unmodified (committed)**: 마지막 커밋과 동일한 상태
  - **modified**: 마지막 커밋 이후 수정된 상태
  - **staged**: 수정 사항이 Staging Area에 올라가 다음 커밋을 기다리는 상태

![파일 상태 변화](/images/til/ETC/Git/git.assets/image-20220113101938077.png)

커밋된 내용은 언제든 되살릴 수 있지만, 한 번도 커밋되지 않은 변경은 Git이 복구해 줄 수 없습니다. (`git restore <file>`로 작업 내용을 되돌리면 그 변경은 영영 사라지니 주의합니다.)

## 기본 명령어

### 저장소 만들기: `git init`

```bash
$ git init
Initialized empty Git repository in /Users/me/first/.git/
```

현재 폴더에 `.git` 디렉터리가 생기고, 터미널 프롬프트에 `(master)` 처럼 현재 브랜치가 표시됩니다.

> 참고: GitHub는 2020년 10월부터 새 저장소의 기본 브랜치를 `main`으로 만듭니다([GitHub Changelog](https://github.blog/changelog/2020-10-01-the-default-branch-for-newly-created-repositories-is-now-main/)). 반면 Git 2.x의 `git init`은 설정이 없으면 여전히 `master`를 만들고 힌트 메시지를 띄우며, 다음 메이저 버전인 Git 3.0부터 `main`이 기본이 될 예정입니다(출시일 미정, [Git BreakingChanges](https://git-scm.com/docs/BreakingChanges)). 지금 바로 맞추려면 `git config --global init.defaultBranch main` (Git 2.28+)으로 설정합니다. 이름이 바뀐 배경은 [[windows-dev-environment|Windows 개발 환경]]의 「왜 master 대신 main인가」에 있습니다. 이 노트의 예시는 `master`를 쓰므로, `main`을 쓰는 저장소라면 이름만 바꿔 읽으면 됩니다.

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
| `q` | 나머지는 건너뛰고 끝내기 |
| `?` | 전체 도움말 |

`git restore -p`(되돌리기), `git reset -p`(스테이징 취소), `git stash -p`도 같은 방식으로 일부만 고른다.

### 커밋: `git commit`

```bash
$ git commit -m "Add login form"
```

커밋 메시지는 **이 버전에서 무엇이 바뀌었는지** 드러나도록 씁니다. `-m` 없이 실행하면 에디터(기본 Vim)가 열리고, 메시지를 쓴 뒤 `Esc` → `:wq` 로 저장·종료합니다.

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

`status` 출력은 위의 세 영역과 그대로 대응합니다. 안내 문구에 나오는 `git restore --staged`(스테이징 취소)와 `git restore`(작업 내용 되돌리기)도 함께 기억해 두면 좋습니다.

### 이력 보기: `git log`

```bash
$ git log                       # 전체 이력
$ git log --oneline             # 한 줄 요약
$ git log --oneline --all --graph   # 모든 브랜치를 그래프로
```

#### 커밋 해시

로그의 각 커밋 앞에 붙는 40자리 16진수가 **커밋 해시(SHA-1)** 입니다. 전 세계 어디서 만든 커밋이든 충돌 없이 구분할 만큼 큰 값이라서, 평소에는 `git log --oneline`에 보이는 앞 7자리 정도만 써도 충분합니다. Git은 SHA-256 저장소도 지원하며, Git 3.0부터는 새 저장소의 기본 해시를 SHA-256(64자리)으로 바꿀 예정입니다([Git BreakingChanges](https://git-scm.com/docs/BreakingChanges)).

## 자주 쓰는 셸 명령

Git Bash/터미널에서 함께 쓰는 기본 명령입니다.

```bash
$ pwd               # 현재 위치
$ ls                # 목록 보기
$ cd ..             # 상위 디렉터리로 이동
$ mkdir dir         # 폴더 생성
$ touch a.txt       # 빈 파일 생성
$ rm -rf dir        # 폴더와 하위 파일 모두 삭제 (주의)
```

## 핵심 정리

- 버전 기록 = `add`로 고르고 `commit`으로 남긴다.
- `git status`의 세 구역(staged / not staged / untracked)은 Staging Area · Working Directory · 미추적 파일에 대응한다.
- `.git` 폴더가 곧 저장소다. 지우면 이력이 사라진다.

관련 노트: [[branch|Git 브랜치]], [[remote-github|원격 저장소와 GitHub]], [[git-config-options|자주 쓰는 Git 설정 옵션]], [[git-internals|Git의 내부 구조]]
