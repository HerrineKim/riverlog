---
title: "Git 기본 명령과 파일 상태"
concept: "Git Basics"
summary: "저장소를 만들고 add·commit으로 버전을 기록하며, 파일이 untracked·modified·staged·committed 상태를 오가는 흐름."
tags: ["git", "version-control", "cli"]
source: til
---

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

커밋된 내용은 언제든 되살릴 수 있지만, 한 번도 커밋되지 않은 변경은 Git이 복구해 줄 수 없습니다.

## 기본 명령어

### 저장소 만들기: `git init`

```bash
$ git init
Initialized empty Git repository in /Users/me/first/.git/
```

현재 폴더에 `.git` 디렉터리가 생기고, 터미널 프롬프트에 `(master)` 처럼 현재 브랜치가 표시됩니다.

> 참고: 최신 Git과 GitHub는 기본 브랜치 이름으로 `main`을 많이 사용합니다. `git config --global init.defaultBranch main` 으로 바꿀 수 있습니다.

### 스테이징: `git add`

```bash
$ git add a.txt            # 파일 하나
$ git add a.txt b.txt      # 여러 파일
$ git add my_folder/       # 폴더 전체
$ git add .                # 현재 디렉터리의 모든 변경
```

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
