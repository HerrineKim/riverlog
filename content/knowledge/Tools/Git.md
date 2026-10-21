---
title: "Git"
concept: "Git"
summary: "코드의 변경 이력을 기록하고 여러 사람이 동시에 작업할 수 있게 해 주는 분산 버전 관리 시스템."
tags: ["git", "version-control", "collaboration"]
source: mixed
date: "2026-10-14"
---

Git은 **분산 버전 관리 시스템(DVCS)** 이다. 모든 작업자가 저장소의 전체 이력을 로컬에 갖고 있어서, 네트워크 없이도 커밋·브랜치·병합을 할 수 있고 필요할 때 원격 저장소(GitHub 등)와 동기화한다.

- **Git**: 버전을 기록하는 도구 (로컬에서 동작)
- **GitHub**: Git 저장소를 호스팅하는 원격 서비스. 협업 공간이자 포트폴리오 역할도 한다.

## 노트 안내

| 노트 | 내용 |
| --- | --- |
| [기본 명령과 파일 상태](/knowledge/dictionary/tools/git/git-basics) | `init`, `add`(`-p`로 일부만), `commit`, `status`, `log`, 커밋 해시와 Working Directory → Staging Area → Repository 흐름 |
| [내부 구조: 객체와 인덱스](/knowledge/dictionary/tools/git/git-internals) | `.git`의 index와 blob·tree·commit 객체, 내용 기반 해시, 스냅숏 저장 원리 |
| [브랜치](/knowledge/dictionary/tools/git/branch) | 브랜치·HEAD 개념, `git branch`, `git switch`, 브랜치 이동 시 주의점 |
| [브랜치 병합](/knowledge/dictionary/tools/git/merge) | Fast-Forward, 3-Way Merge, Merge Conflict 해결, Merge Commit의 함정(부모 순서, `--remerge-diff`) |
| [원격 저장소와 GitHub](/knowledge/dictionary/tools/git/remote-github) | `remote`(`set-url`, 원격 여러 개), `push`, `pull`, `fetch`, `clone`, `subtree`, 미러링(GitLab → GitHub) |
| [되돌리기와 이력 다루기](/knowledge/dictionary/tools/git/git-undo-and-rewrite) | `reflog`, 상황별 복구(amend, 잘못한 브랜치 커밋 옮기기, `restore`로 파일 되돌리기, 원격 상태로 초기화), `reset`(soft·mixed·hard), `revert`, `cherry-pick`, `--abort`, 푸시한 민감 정보·작성자 이메일 정리(filter-repo) |
| [작업 중인 변경 다루기: stash, worktree, clean](/knowledge/dictionary/tools/git/stash-worktree-clean) | 잠깐 치워 두는 `stash`, 다른 브랜치를 옆 폴더에 펼치는 `worktree`, 추적하지 않는 파일을 지우는 `clean` |
| [Git 이력 검색](/knowledge/dictionary/tools/git/git-history-search) | 범위 표기(`A..B`·`A...B`)와 `log` 필터, `git grep`, pickaxe(`-S`·`-G`)와 `log -L`, `blame`, `bisect` |
| [merge·squash·rebase 언제 쓰나](/knowledge/dictionary/tools/git/merge-squash-rebase) | PR 통합 전략 고르기: merge 커밋과 bisect, squash 메시지, rebase와 force push, 인터랙티브 rebase |
| [브랜치 전략](/knowledge/dictionary/tools/git/branching-strategies) | Git Flow·GitHub Flow·트렁크 기반 개발 비교와 고르는 기준, git-flow 도구의 현재 |
| [커밋 컨벤션과 자동 검사](/knowledge/dictionary/tools/git/commit-convention) | 좋은 커밋 메시지 7가지 규칙, 이슈 자동 닫기 키워드, `type(scope): subject` 형식, 커밋 템플릿, husky·commitlint, pre-commit 프레임워크 |
| [영어 커밋 메시지 동사 사전](/knowledge/dictionary/tools/git/commit-message-verbs) | Fix·Add·Update·Make·Ensure·Prevent 등 동사별 패턴과 예문, 헷갈리는 동사 구분, 간결하게 쓰는 규칙 |
| [GitHub 협업 저장소 설정](/knowledge/dictionary/tools/git/github-collaboration) | 브랜치 보호 규칙, CODEOWNERS, 이슈·PR 템플릿, 라벨, 알림 도구 |
| [GitHub 이슈·프로젝트로 진행 상황 관리하기](/knowledge/dictionary/tools/git/github-issue-workflow) | 이슈 크기 기준, 하위 이슈, 프로젝트 보드와 스크럼, 이슈 → 브랜치 → 커밋 → PR 연결, 개발 문서화 원칙 |
| [자주 쓰는 Git 설정 옵션](/knowledge/dictionary/tools/git/git-config-options) | `pull.ff`, `zdiff3`, `rebase.autosquash`, `diff.algorithm histogram`, `includeIf`, alias, 커밋 이메일과 기여 그래프 등 git config 추천 옵션 |
| [대형 저장소에서 Git 빠르게 쓰기](/knowledge/dictionary/tools/git/large-repo-git-performance) | 얕은 클론, 단일 브랜치·refspec, 부분 클론, 희소 체크아웃, 파일 감시, CI와 개발자 PC별 설정 |
| [모노레포와 폴리레포](/knowledge/dictionary/tools/git/monorepo-vs-polyrepo) | 구조·권한·의존성 버전·도구 비교, 버전 세트 기반 빌드 시스템 |

## 연습 도구

- [Learn Git Branching](https://learngitbranching.js.org/?locale=ko): 브랜치·병합을 시각적으로 연습할 수 있는 사이트
- 터미널에서 `git` 만 입력하면 주요 명령어 목록을 볼 수 있다.
