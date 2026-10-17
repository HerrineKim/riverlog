---
title: "Git의 내부 구조: 객체와 인덱스"
concept: "Git Internals"
summary: ".git 폴더 안의 objects(blob·tree·commit)와 index가 add·commit 때 어떻게 만들어지는지, 내용 기반 해시(체크섬)로 데이터를 관리하고 변경분이 아닌 스냅숏을 저장하는 원리."
tags: ["git", "version-control", "computer-science"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/7267f19f53594799a7405d0f316fb589", "https://git-scm.com/book/ko/v2/Git%EC%9D%98-%EB%82%B4%EB%B6%80-Git-%EA%B0%9C%EC%B2%B4"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「그림으로 Git의 내부구조 파악하기」를 바탕으로 재구성한 노트다. 바탕 자료는 『팀 개발을 위한 Git, GitHub 시작하기』(한빛미디어)와 Pro Git의 「Git의 내부」 장이다.

## 왜 내부를 알아야 하나

`add`, `commit`만 쓸 때는 몰라도 되지만, reset·rebase·복구처럼 이력을 다루는 명령은 내부 구조를 알면 훨씬 덜 무섭다. Git의 핵심은 단순하다. **내용을 해시로 이름 붙인 객체를 쌓아 두고, 그 객체를 가리키는 포인터를 옮기는 것**이다.

## 작업 폴더의 세 부분

```text
my-project/                 ← 작업 폴더
├─ .git/                    ← Git 저장소(로컬 저장소). 모든 이력이 여기에
│  ├─ objects/              ← 객체 보관소 (blob, tree, commit, tag)
│  ├─ index                 ← 스테이지(Staging Area)의 실체
│  ├─ refs/heads/main       ← 브랜치: 커밋 해시 하나를 적은 파일
│  └─ HEAD                  ← 지금 체크아웃한 브랜치를 가리킴
└─ src/, README.md ...      ← 워킹 트리: .git을 뺀 나머지 작업 공간
```

- `git init`은 이 `.git` 폴더를 만드는 일이다. 이미 파일이 있는 폴더에서 해도 기존 파일은 건드리지 않는다. `ls -a`로 확인한다.
- 흔히 작업 폴더 전체를 "로컬 저장소"라고 부르지만, 정확히는 `.git`이 저장소이고 나머지는 **워킹 트리**다.
- 파일 상태와 세 영역의 흐름은 [[git-basics|Git 기본 명령과 파일 상태]]에 있다.

## 인덱스: 스테이지의 정체

"파일을 스테이지에 올린다"고 하지만 파일이 어디로 이동하는 것은 아니다. `.git/index`는 **다음 커밋에 들어갈 파일 목록표**다. 경로마다 그 순간 내용의 blob 해시가 적혀 있다. 처음 `git add`할 때 생기고, `add`할 때마다 해당 줄이 새 해시로 갱신된다.

## 객체 네 가지

`.git/objects`에는 모든 데이터가 객체로 저장된다. 객체의 이름은 내용을 해시한 값이다.

| 객체 | 언제 생기나 | 담는 것 |
| --- | --- | --- |
| **blob** | `git add` 할 때 파일마다 | 파일 **내용만**. 파일 이름은 없다 |
| **tree** | `git commit` 할 때 디렉터리마다 | 이름 → blob/하위 tree 해시 목록. 폴더 구조의 사진 |
| **commit** | `git commit` 할 때 | 최상위 tree 해시, 부모 커밋 해시, 작성자·커미터, 시각, 메시지 |
| tag | `git tag -a` 할 때 | 특정 커밋을 가리키는 주석 달린 이름표 |

`git commit`은 인덱스를 바탕으로 tree를 만들고, 그 tree를 가리키는 commit 객체를 만든 다음, 현재 브랜치 파일(`refs/heads/main`)의 해시를 새 커밋으로 바꾼다.

```text
main ──▶ commit c3 ──▶ tree ──┬─ README.md → blob a1
             │                └─ src/      → tree ── app.js → blob b7
             ▼ parent
         commit c2 ──▶ tree ...
```

## 체크섬: 내용으로 이름 짓기

`78981922613b2afb...` 같은 40자 16진수는 객체 내용의 **SHA-1 해시(체크섬)** 다. Git은 무엇이든 저장하기 전에 해시를 구하고, 그 해시를 키로 모든 데이터를 찾는다.

- 해시는 이름·시각이 아니라 **내용만으로** 결정된다. 내용이 같은 파일 세 개는 blob 하나를 공유하고, 바뀌지 않은 파일은 다음 커밋에서도 같은 blob을 다시 가리킨다.
- 내용이 1비트라도 바뀌면 해시가 달라지므로, 저장된 데이터가 손상되거나 몰래 바뀌면 바로 드러난다.
- 커밋 해시는 부모 해시를 포함해 계산되므로, 과거 커밋 하나를 고치면 그 뒤 모든 커밋의 해시가 바뀐다. rebase가 "커밋을 새로 만든다"고 하는 이유다.
- Git은 SHA-256 저장소도 지원하며, Git 3.0부터 새 저장소의 기본값을 SHA-256으로 바꿀 예정이다.

## 변경분이 아니라 스냅숏

Git은 커밋마다 "이전 대비 바뀐 줄"을 저장하지 않고, **그 시점 전체 파일 구조의 스냅숏(tree)** 을 가리킨다. 바뀌지 않은 파일은 같은 blob을 재사용하므로 공간을 낭비하지 않는다. 덕분에 열 커밋 전 상태도 변경분을 하나씩 거슬러 적용할 필요 없이 그 커밋의 tree를 바로 펼치면 된다. (용량을 줄이려고 나중에 pack 파일로 묶을 때는 내부적으로 델타 압축을 쓰지만, 이는 저장 최적화일 뿐 모델은 스냅숏이다.)

## 직접 들여다보기

```bash
git cat-file -t <hash>      # 객체 종류 (blob, tree, commit)
git cat-file -p <hash>      # 객체 내용 출력
git cat-file -p HEAD^{tree} # 현재 커밋의 최상위 tree
git ls-files --stage        # 인덱스에 적힌 경로와 blob 해시
git hash-object README.md   # 이 파일이 blob이 되면 받을 해시
```

## 정리

- `.git`이 저장소이고, 그 밖은 워킹 트리다. 스테이지의 실체는 `.git/index` 파일이다.
- add는 blob을, commit은 tree와 commit 객체를 만들고 브랜치 포인터를 옮긴다.
- 모든 객체는 내용의 해시로 이름 붙고, 같은 내용은 한 번만 저장된다.
- Git은 변경분이 아니라 스냅숏을 기록한다.

관련 노트: [[git-basics|Git 기본 명령과 파일 상태]], [[branch|Git 브랜치]], [[git-undo-and-rewrite|되돌리기와 이력 다루기]], [[missing-semester|The Missing Semester: CS 교육에서 빠진 도구 학기]]
