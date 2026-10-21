---
title: "GitHub 이슈·프로젝트로 진행 상황 관리하기"
concept: "Issue-Driven Development"
summary: "GitHub Issues를 작업 목록으로, Projects를 우선순위·상태 보드로 쓰고, 이슈를 브랜치·커밋·PR과 연결하면 저장소 하나에서 팀의 진행 상황이 투명하게 보인다. 이슈 크기 기준, 마일스톤·하위 이슈·프로젝트 보드(Status 칸과 기본 워크플로)로 묶어 보는 법, 스크럼 대응, 팀 개발 흐름과 리뷰 제출 종류, 문서화 원칙을 정리했다."
tags: ["git", "github", "collaboration", "process", "agile"]
source: other
date: "2026-10-21"
sources: ["https://github.blog/changelog/2025-04-09-evolving-github-issues-and-projects/", "https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues", "https://github.com/cheese10yun/github-project-management", "https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-built-in-automations"]
---

> 허광남의 발표 자료 「GitHub 기반의 개발 진행상황 관리법」을 바탕으로, 현재 GitHub Issues·Projects 기능에 맞춰 재구성한 노트다.
>
> 「이슈를 묶고 보는 단위」와 리뷰 제출 종류는 cheese10yun의 「[github-project-management](https://github.com/cheese10yun/github-project-management)」을 바탕으로, ZenHub·Projects (classic) 내용을 지금의 Projects·하위 이슈 기준으로 바꿔 보강했다.

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

이슈 유형(issue type, 기본값 Task·Bug·Feature)과 라벨로 종류를 구분한다. 제목에 [gitmoji](https://gitmoji.dev)(✨ 기능, 🐛 버그, 🚑 핫픽스, 📝 문서)를 붙이면 목록에서 종류가 한눈에 보인다. 라벨 설계와 이슈·PR 템플릿(YAML 이슈 폼)은 [[github-collaboration|GitHub 협업 저장소 설정]]에 있다.

## 이슈를 묶고 보는 단위

이슈 하나에는 사이드바에서 정하는 속성이 붙는다. 무엇으로 묶느냐에 따라 보이는 진행 상황이 다르다.

| 속성 | 답하는 질문 | 범위 |
| --- | --- | --- |
| Assignees | 누가 하나 | 이슈 |
| 유형·Labels | 어떤 성격의 일인가 | 이슈 |
| **Milestone** | **어느 출시(버전·마감)에 들어가나** | 저장소 하나 |
| 부모 이슈(sub-issues) | 어느 큰 작업의 일부인가 | 여러 저장소 가능 |
| Projects | 우선순위·상태·반복 주기는 | 여러 저장소 가능 |

### 마일스톤: 출시 단위

**마일스톤**은 `v1.0.0`처럼 한 번에 내보낼 이슈 묶음에 마감일을 붙인 것이다. 새 기능·개선·버그 수정을 가리지 않고 그 버전에 들어갈 이슈를 모두 넣으면, 마일스톤 화면에 **닫힌 이슈 비율이 진행률 막대**로 보이고 남은 일과 마감까지의 시간을 맞대어 볼 수 있다. 출시가 끝나면 그 마일스톤의 닫힌 이슈 목록이 곧 변경 내역의 재료가 된다. 당장 하지 않을 아이디어가 아니면 이슈는 어느 마일스톤에든 둔다.

### 하위 이슈: 큰 작업 쪼개기

여러 사람이 나눠 하는 큰 기능은 부모 이슈 아래 **하위 이슈**로 나눈다. 부모에 진행률이 표시되고, 하위 이슈끼리 **blocked by / blocking** 의존 관계를 걸어 먼저 끝나야 할 작업을 드러낸다. 과거에는 이 일을 ZenHub 같은 확장의 에픽(Epic)이나 체크리스트로 했다.

### 프로젝트 보드: 상태와 우선순위

**Projects**는 이슈·PR을 담는 표(스프레드시트)다. `Status` 같은 단일 선택 필드로 칸을 나누면 칸반 보드가, 날짜·Iteration 필드로 펼치면 로드맵이 된다. 같은 데이터를 보기(view)만 바꿔 본다.

| Status 예 | 들어가는 것 |
| --- | --- |
| New | 막 생긴 이슈. 분류 전 |
| Icebox | 당장 하지 않을 낮은 우선순위 |
| Backlog | 다음에 할 높은 우선순위 |
| In Progress | 브랜치를 만들어 작업 중 |
| Review/QA | PR이 열려 리뷰·검증 중 |
| Done | 이슈가 닫힘 |

- **기본 워크플로**(Settings → Workflows)로 손을 덜 쓴다: 저장소의 새 이슈를 자동으로 추가(auto-add), 이슈가 닫히거나 PR이 머지되면 Done, 오래된 항목 보관.
- 프로젝트는 organization이나 사용자에 속해 **여러 저장소의 이슈를 한 보드에** 담는다. 프론트엔드·백엔드 저장소가 나뉜 팀도 보드 하나로 본다. 필터는 `label:bug assignee:@me milestone:"v1.0.0" repo:owner/api`처럼 쓴다.
- 과거에는 저장소 단위 칸반인 **Projects (classic)** 가 있었고, 여러 저장소를 묶거나 에픽을 쓰려면 ZenHub 같은 브라우저 확장을 썼다. classic은 2024~2025년에 종료되어 지금의 Projects로 옮겨졌다.

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

6. 동료가 리뷰하고 합치거나 닫는다. 리뷰는 **Comment**(의견만), **Approve**(승인), **Request changes**(고쳐야 머지 가능) 중 하나로 제출한다. CI가 실패한 PR은 고쳐서 빌드가 통과한 뒤에 리뷰를 받는다. 합친 브랜치는 지운다(저장소 설정의 *Automatically delete head branches*).
7. 개발 서버에 배포해 확인한다. 자동화된 테스트가 있으면 이 단계가 가벼워진다.

- 이슈와 PR은 **번호 체계를 공유한다.** 이슈 #1을 처리하는 PR은 #2가 된다. 그래서 `#번호` 하나로 이슈든 PR이든 가리킨다.
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
| 검색되게 | 팀이 고른 검색 가능한 위키(GitHub Wiki, Notion, Confluence 등)에 모은다. GitHub Wiki는 별도 Git 저장소(`<repo>.wiki.git`)라서 클론해 로컬 편집기로 쓰고 push할 수 있다 |
| API는 자동 생성 | OpenAPI 명세에서 Swagger UI 같은 문서를 만들어 코드와 어긋나지 않게 한다 |

## 정리

- 이슈는 하루 안에 끝날 크기로 쓰고, 크면 하위 이슈로 쪼갠다.
- 출시 단위는 마일스톤, 큰 작업은 하위 이슈, 우선순위·상태는 프로젝트 보드로 묶는다. 보드는 여러 저장소를 담고 기본 워크플로로 상태를 자동으로 옮긴다.
- 스프린트 중에는 범위를 고정한다.
- 이슈 → 브랜치 → 커밋 → PR을 번호로 이어 두면 진행 상황이 저장소에 저절로 기록된다.
- 이 연결은 도구가 아니라 팀의 습관이다. 리드가 먼저 지켜야 유지된다.

**이슈 관리가 곧 프로젝트 진행의 투명성이다.**

관련 노트: [[github-collaboration|GitHub 협업 저장소 설정]], [[commit-convention|커밋 컨벤션과 자동 검사]], [[agile-sprint|애자일과 스프린트]], [[project-process|새 서비스 개발 프로젝트 진행 순서]], [[jira|Jira: 이슈 구성, JQL, 워크플로]], [[scrum-framework|스크럼]]
