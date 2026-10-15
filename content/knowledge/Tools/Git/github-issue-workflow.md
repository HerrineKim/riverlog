---
title: "GitHub 이슈·프로젝트로 진행 상황 관리하기"
concept: "Issue-Driven Development"
summary: "GitHub Issues를 작업 목록으로, Projects를 우선순위·상태 보드로 쓰고, 이슈를 브랜치·커밋·PR과 연결하면 저장소 하나에서 팀의 진행 상황이 투명하게 보인다. 이슈 크기 기준, 스크럼 대응, 팀 개발 흐름, 문서화 원칙을 정리했다."
tags: ["git", "github", "collaboration", "process", "agile"]
source: other
date: "2026-10-14"
sources: ["https://github.blog/changelog/2025-04-09-evolving-github-issues-and-projects/", "https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues"]
---

> 허광남의 발표 자료 「GitHub 기반의 개발 진행상황 관리법」을 바탕으로, 현재 GitHub Issues·Projects 기능에 맞춰 재구성한 노트다.

## 이슈 기반 진행 관리란

GitHub는 코드 저장소이면서 **작업 관리 도구**다. 할 일을 이슈로 적고, 이슈를 프로젝트 보드에 올려 우선순위와 상태를 관리하고, 코드 변경을 이슈에 연결한다. 그러면 "누가 무엇을 하고 있고 어디까지 왔는지"를 별도 보고 없이 저장소에서 바로 읽을 수 있다.

| 도구 | 역할 |
| --- | --- |
| Issues | 작업 목록. 할 일 하나가 이슈 하나 |
| Projects | 이슈를 모아 우선순위·상태·담당자·반복 주기로 정리하는 보드. 표·보드·로드맵 보기를 지원한다 |
| Pull Request | 이슈를 해결한 코드를 리뷰하고 합치는 단위 |
| Wiki·문서 | 작업 결과와 운영 지식을 공유하는 곳 |

## 이슈 쓰는 기준

| 원칙 | 이유 |
| --- | --- |
| **이슈 하나는 반나절~하루 분량**으로 쓴다 | 진척이 매일 보이고, 막힌 곳이 빨리 드러난다 |
| 하루를 넘길 것 같으면 쪼갠다 | 큰 이슈는 며칠씩 "진행 중"에 머물러 상태 정보가 의미를 잃는다 |
| 금방 끝나는 일이라도 중요하면 기록한다 | 나중에 "언제, 왜 바꿨나"를 추적할 근거가 된다 |
| 오래 묵은 이슈는 닫거나 다음 마일스톤으로 넘긴다 | 열린 이슈 목록이 실제 할 일을 반영해야 보드를 믿을 수 있다 |

큰 기능은 **하위 이슈(sub-issue)** 로 나눈다. 하위 이슈는 부모 이슈에 진행률로 표시되고, Projects에서 부모 이슈 기준으로 묶거나 걸러 볼 수 있다. 과거에는 체크리스트 속 작업이 보드에서 보이지 않아 별도 이슈로 등록하는 편이 나았지만, 지금은 하위 이슈도 각자 보드의 항목이 된다.

이슈 유형(issue type, 기본값 Task·Bug·Feature)과 라벨로 종류를 구분한다. 제목에 [gitmoji](https://gitmoji.dev)(✨ 기능, 🐛 버그, 🚑 핫픽스, 📝 문서)를 붙이면 목록에서 종류가 한눈에 보인다. 라벨 설계는 [[github-collaboration|GitHub 협업 저장소 설정]]에 있다.

## 스크럼에 대응시키기

| 스크럼 | GitHub |
| --- | --- |
| 제품 백로그(Product Backlog) | 프로젝트 보드의 전체 항목 |
| 스프린트 백로그(Sprint Backlog) | 이번 반복 주기(Iteration 필드)에 배정한 이슈 |
| 스프린트 목표 | 마일스톤 또는 Iteration 설명 |
| 데일리 스탠드업 | 보드를 띄워 놓고 이슈 단위로 이야기 |

- **스프린트 중에는 범위를 바꾸지 않는다.** 새 요구는 백로그에 이슈로 쌓아 두고 다음 스프린트 계획 때 고려한다.
- 스탠드업의 세 질문은 이슈로 답한다: 어제 작업한 이슈, 오늘 작업할 이슈, 막혀서 도움이 필요한 것. 보고가 아니라 **동료 앞에서 하는 약속**이다.

스프린트의 의미와 운영은 [[agile-sprint|애자일과 스프린트]]에서 다룬다.

## 이슈와 코드 연결: 팀 개발 흐름

```bash
git switch main && git pull              # 1. 작업 전 로컬을 최신으로
git switch -c feat/42-login              # 2. 이슈 하나에 브랜치 하나
git commit -m "feat: 로그인 폼 추가 #42"  # 3. 커밋 메시지에 #이슈번호
git push -u origin feat/42-login         # 4. 원격에 올린다
gh pr create --fill                      # 5. PR 생성, 본문에 "Closes #42"
```

6. 동료가 리뷰하고 합치거나 닫는다. 합친 브랜치는 지운다(저장소 설정의 *Automatically delete head branches*).
7. 개발 서버에 배포해 확인한다. 자동화된 테스트가 있으면 이 단계가 가벼워진다.

- 커밋·PR에 `#42`를 쓰면 이슈 타임라인에 연결이 남는다. `Closes #42` 같은 자동 닫기 키워드는 [[commit-convention|커밋 컨벤션과 자동 검사]]의 「커밋 메시지로 이슈 닫기」에 있다.
- 이슈 화면 사이드바의 **Development → Create a branch**로 이슈에 연결된 브랜치를 바로 만들 수도 있다.
- 브랜치 이름에 이슈 번호를 넣으면 브랜치만 보고도 무슨 작업인지 안다.
- 같은 저장소의 멤버는 **브랜치**로, 쓰기 권한이 없는 외부 기여자는 **포크(fork)** 로 PR을 보낸다.

커밋 메시지 형식은 [[commit-convention|커밋 컨벤션과 자동 검사]], PR 통합 방식은 [[merge-squash-rebase|merge·squash·rebase 언제 쓰나]]를 따른다.

## 개발 문서화

| 원칙 | 기준 |
| --- | --- |
| 짧게 | 1~2쪽 안에 핵심이 보인다 |
| 대신 처리할 수 있게 | 작성자가 자리에 없어도 동료가 문서만 보고 응급 대응할 수 있다 |
| 검색되게 | 팀이 고른 검색 가능한 위키(GitHub Wiki, Notion, Confluence 등)에 모은다 |
| API는 자동 생성 | OpenAPI 명세에서 Swagger UI 같은 문서를 만들어 코드와 어긋나지 않게 한다 |

## 정리

- 이슈는 하루 안에 끝날 크기로 쓰고, 크면 하위 이슈로 쪼갠다.
- 프로젝트 보드로 우선순위와 상태를 보이게 하고, 스프린트 중에는 범위를 고정한다.
- 이슈 → 브랜치 → 커밋 → PR을 번호로 이어 두면 진행 상황이 저장소에 저절로 기록된다.
- 이 연결은 도구가 아니라 팀의 습관이다. 리드가 먼저 지켜야 유지된다.

**이슈 관리가 곧 프로젝트 진행의 투명성이다.**

관련 노트: [[github-collaboration|GitHub 협업 저장소 설정]], [[commit-convention|커밋 컨벤션과 자동 검사]], [[agile-sprint|애자일과 스프린트]], [[project-process|새 서비스 개발 프로젝트 진행 순서]], [[jira|Jira: 이슈 구성, JQL, 워크플로]], [[scrum-framework|스크럼]]
