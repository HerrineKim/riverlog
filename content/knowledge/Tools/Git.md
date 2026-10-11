---
title: "Git"
concept: "Git"
summary: "코드의 변경 이력을 기록하고 여러 사람이 동시에 작업할 수 있게 해 주는 분산 버전 관리 시스템."
tags: ["git", "version-control", "collaboration"]
source: mixed
---

Git은 **분산 버전 관리 시스템(DVCS)** 입니다. 모든 작업자가 저장소의 전체 이력을 로컬에 갖고 있어서, 네트워크 없이도 커밋·브랜치·병합을 할 수 있고 필요할 때 원격 저장소(GitHub 등)와 동기화합니다.

- **Git**: 버전을 기록하는 도구 (로컬에서 동작)
- **GitHub**: Git 저장소를 호스팅하는 원격 서비스. 협업 공간이자 포트폴리오 역할도 한다.

## 노트 안내

| 노트 | 내용 |
| --- | --- |
| [기본 명령과 파일 상태](/knowledge/dictionary/tools/git/basics) | `init`, `add`, `commit`, `status`, `log` 와 Working Directory → Staging Area → Repository 흐름 |
| [브랜치](/knowledge/dictionary/tools/git/branch) | 브랜치·HEAD 개념, `git branch`, `git switch`, 브랜치 이동 시 주의점 |
| [브랜치 병합](/knowledge/dictionary/tools/git/merge) | Fast-Forward, 3-Way Merge, Merge Conflict 해결 |
| [원격 저장소와 GitHub](/knowledge/dictionary/tools/git/remote-github) | `remote`, `push`, `pull`, `fetch`, `clone`, 커밋 메시지 습관 |
| [커밋 컨벤션과 자동 검사](/knowledge/dictionary/tools/git/commit-convention) | `type(scope): subject` 형식, 커밋 템플릿, husky·commitlint |
| [GitHub 협업 저장소 설정](/knowledge/dictionary/tools/git/github-collaboration) | 브랜치 보호 규칙, CODEOWNERS, 이슈·PR 템플릿, 라벨, 알림 도구 |

## 연습 도구

- [Learn Git Branching](https://learngitbranching.js.org/?locale=ko): 브랜치·병합을 시각적으로 연습할 수 있는 사이트
- 터미널에서 `git` 만 입력하면 주요 명령어 목록을 볼 수 있다.
