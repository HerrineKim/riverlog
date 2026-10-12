---
title: "Jira: 이슈 구성, JQL, 워크플로"
concept: "Jira"
summary: "Jira 이슈의 주요 필드와 Epic·Component·Label을 구분해 쓰는 기준, JQL로 이슈를 구조적으로 검색하는 방법, 워크플로·Board·Sprint·스토리 포인트로 팀 업무를 운영할 때의 원칙과 실무 팁."
tags: ["jira", "agile", "project-management", "query", "collaboration"]
source: notion
date: "2026-10-13"
---

Jira는 애자일 팀에서 널리 쓰는 이슈·프로젝트 관리 도구다. 모든 업무는 이슈(issue) 단위로 관리되고, 이슈를 일관된 기준으로 분류해 두어야 나중에 JQL로 원하는 이슈를 뽑아 보고 대시보드로 진행 상황을 읽을 수 있다. 도구 자체보다 중요한 것은 **팀이 일관된 기준으로 쓰는 것**이다.

좋은 Jira는 이렇게 보인다.

- 팀원들이 서로 무슨 일을 하고 있는지 한눈에 파악된다.
- 커밋·브랜치·PR이 어떤 이슈와 관련 있는지 추적된다(커밋 메시지에 이슈 키를 넣고 Git 저장소를 연결한다, [[commit-convention|커밋 컨벤션과 자동 검사]]).
- 이슈 분류와 스토리 포인트 같은 수치의 산정 기준이 일관적이다.
- 이해하기 쉽고 직관적인 용어를 쓴다.

## 이슈 필드

| 필드 | 의미 |
| --- | --- |
| Issue Type | Task, Story, Bug, Epic 등 이슈의 종류 |
| Summary | 이슈 제목 |
| Reporter | 이슈를 생성한 사람 |
| **Assignee** | 이슈 담당자 (가장 중요) |
| Priority | 중요도 |
| Component | 기능·모듈·화면 단위 분류 (예: UX, 사용자 관리, 인프라) |
| Labels | 해시태그처럼 자유롭게 붙이는 분류 |
| Fix Version | 이슈가 반영될 릴리스 버전 |
| Parent (구 Epic Link) | 이 이슈의 상위 이슈(에픽 등). Jira Cloud에서는 2024년 Epic Link·Parent Link 필드가 **Parent** 하나로 통합되었다. Server·Data Center에는 Epic Link가 남아 있다 |
| Linked Issues | 연관 이슈 |
| Sprint | 스크럼에서 이 이슈를 처리할 스프린트 |

### Epic · Component · Label 구분

셋 다 "이슈를 묶는" 수단이라 헷갈리기 쉽다. 어떤 기준으로 쓸지는 팀이 미리 합의해야 한다.

| 구분 | 언제 쓰나 | 특징 |
| --- | --- | --- |
| **Epic** | 여러 이슈를 아우르는 큰 단위의 일이 있을 때 | 그 자체가 하나의 이슈 타입. 에픽 → 스토리 → 서브태스크 계층 |
| **Component** | 담당자/팀이 정해진 기능 범위가 있을 때 | 미리 만들어 둔 목록에서 선택. **Default Assignee**(리드) 지정 가능 |
| **Label** | 가볍게 태그를 달고 싶을 때 | 즉석에서 자유롭게 생성. 대소문자·공백이 달라도 다른 라벨이 된다 |

**Label은 모든 프로젝트에 공유되어 다른 팀의 라벨까지 보인다.** 그래서 팀 내부 분류는 Component로 두는 편이 안전하고, 컴포넌트마다 리드 담당자도 지정할 수 있다.

## JQL (Jira Query Language)

JQL은 이슈를 구조적으로 검색하기 위한 SQL 비슷한 질의 언어다. 검색 화면에서 **Basic**(조건 클릭)과 **Advanced**(직접 입력) 모드를 전환할 수 있고, 저장한 필터는 대시보드 가젯·애자일 보드의 데이터 소스로 재활용된다.

| 종류 | 예 |
| --- | --- |
| 비교 | `=`, `!=`, `>`, `>=`, `<`, `<=` |
| 포함 | `in`, `not in` |
| 텍스트 포함 | `~` (contains), `!~` (not contains) |
| 빈 값 | `is EMPTY`, `is not EMPTY`, `is null`, `is not null` |
| 키워드 | `AND`, `OR`, `NOT`, `EMPTY`, `NULL`, `ORDER BY` |
| 함수 | `currentUser()`, `startOfDay()`, `endOfDay()`, `startOfWeek()`, `endOfWeek()` 등 |

```sql
-- DP 프로젝트의 에픽 목록
project = DP AND issuetype = Epic

-- 에픽 DP-12에 속한 이슈 (Jira Cloud. 예전 문법은 "Epic Link" = DP-12)
parent = DP-12

-- 오늘 업데이트된 내 이슈
project = DP AND assignee = currentUser() AND updated > startOfDay()

-- 아직 담당자가 없는 버그를 우선순위순으로
project = DP AND issuetype = Bug AND assignee is EMPTY ORDER BY priority DESC
```

문법을 전부 외우기보다, 필요한 조건을 검색해 가며 쓰는 편이 현실적이다. Advanced 모드에서는 자동 완성도 지원된다.

## 워크플로 · Board · Sprint

- **워크플로**는 이슈의 상태 흐름(To Do → In Progress → Done 등)이다. 팀의 업무 파이프라인에 맞춰 설계하며 정답은 없다.
- **Board와 Sprint는 Project에 종속되지 않는다.** 하나의 보드가 여러 프로젝트의 이슈를 보여 줄 수도 있다. 그래서 이슈에서 Sprint나 Parent(에픽)를 고를 때 다른 프로젝트의 것을 잘못 선택하지 않도록 주의한다.

## 스토리 포인트

- 스토리 포인트는 **난이도(작업량) 추정치**다. 1, 2, 3, 5, 8 … 처럼 피보나치 수열을 쓰는 팀이 많고, 문자(S/M/L)로 쓰기도 한다.
- 같은 일도 담당자의 경험에 따라 체감 난이도가 다르다. 담당자가 난이도를 함께 인지하도록 추정 과정에 참여시킨다.

## 실무 팁

| 상황 | 방법 |
| --- | --- |
| 여러 이슈를 한 번에 수정 (지난 스프린트의 미완료 이슈 옮기기 등) | 상단 Tools(또는 검색 결과의 `…` 메뉴) → **Bulk Change**. 설정 단계에서 **알림 메일 보내기를 해제**하지 않으면 팀 전체에 메일이 쏟아진다. 마지막 확인 화면에서 컨펌한 뒤 작업이 끝날 때까지 기다린다 |
| 보드에서 담당자별·유형별로 빠르게 걸러 보기 | 보드에 **Quick Filter**를 만들어 둔다 |
| 진행 상황을 한 화면에서 읽기 | JQL 필터를 기반으로 **대시보드**를 구성한다. 현업에서는 Rich Filter 같은 마켓플레이스 앱도 많이 쓴다 |
| 릴리스 관리 | 버전(Fix Version)을 만들고 그 버전에 포함될 이슈를 지정한다. 배포 후 버전 화면에서 전체 상태를 확인하고, 완료되면 Release 처리한다 |

## 핵심 정리

- 이슈를 묶는 수단은 Epic(큰 일), Component(팀 내부 기능 범위), Label(가벼운 태그) 셋이고, 팀 내부 분류는 Component가 안전하다.
- JQL은 저장해 두면 보드와 대시보드의 데이터 소스가 된다.
- 워크플로는 팀에 맞게 설계하고, Board·Sprint는 프로젝트에 종속되지 않음을 기억한다.
- Bulk Change를 할 때는 알림 메일을 끈다.

관련 노트: [[commit-convention|커밋 컨벤션과 자동 검사]], [[github-collaboration|GitHub 협업 저장소 설정]]
