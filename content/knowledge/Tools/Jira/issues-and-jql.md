---
title: "Jira 이슈 구성과 JQL"
concept: "JQL"
summary: "Jira 이슈의 주요 필드(Epic·Component·Label 등)를 구분해 쓰고, JQL로 이슈를 구조적으로 검색하는 방법."
tags: ["jira", "project-management", "query", "collaboration"]
source: notion
---

Jira에서 모든 업무는 **이슈(issue)** 단위로 관리됩니다. 이슈를 일관된 기준으로 분류해 두어야 나중에 **JQL**로 원하는 이슈를 뽑아 보고, 대시보드로 진행 상황을 읽을 수 있습니다.

## 이슈 생성 시 주요 필드

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

## Epic · Component · Label 구분

셋 다 "이슈를 묶는" 수단이라 헷갈리기 쉽습니다. 어떤 기준으로 쓸지는 팀이 미리 합의해야 합니다.

| 구분 | 언제 쓰나 | 특징 |
| --- | --- | --- |
| **Epic** | 여러 이슈를 아우르는 큰 단위의 일이 있을 때 | 그 자체가 하나의 이슈 타입. 에픽 → 스토리 → 서브태스크 계층 |
| **Component** | 담당자/팀이 정해진 기능 범위가 있을 때 | 미리 만들어 둔 목록에서 선택. **Default Assignee**(리드) 지정 가능 |
| **Label** | 가볍게 태그를 달고 싶을 때 | 즉석에서 자유롭게 생성. 단, 모든 프로젝트에 공유되어 보이고 대소문자·공백이 달라도 다른 라벨이 되므로 주의 |

## JQL (Jira Query Language)

JQL은 이슈를 구조적으로 검색하기 위한 SQL 비슷한 질의 언어입니다. 검색 화면에서 **Basic**(조건 클릭)과 **Advanced**(직접 입력) 모드를 전환할 수 있고, 저장한 필터는 대시보드 가젯·애자일 보드의 데이터 소스로 재활용됩니다.

### 연산자

| 종류 | 예 |
| --- | --- |
| 비교 | `=`, `!=`, `>`, `>=`, `<`, `<=` |
| 포함 | `in`, `not in` |
| 텍스트 포함 | `~` (contains), `!~` (not contains) |
| 빈 값 | `is EMPTY`, `is not EMPTY`, `is null`, `is not null` |

### 키워드와 함수

- 키워드: `AND`, `OR`, `NOT`, `EMPTY`, `NULL`, `ORDER BY`
- 함수: `currentUser()`, `startOfDay()`, `endOfDay()`, `startOfWeek()`, `endOfWeek()` 등

### 예시

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

> 문법을 전부 외우기보다, 필요한 조건을 검색해 가며 쓰는 편이 현실적입니다. Advanced 모드에서는 자동 완성도 지원됩니다.

## 기타

- Jira 이슈를 Git 저장소와 연결하면 커밋·브랜치·PR이 어떤 이슈와 관련 있는지 이슈 화면에서 확인할 수 있다 (커밋 메시지에 이슈 키 포함).
- 마켓플레이스 앱으로 폴더 정리 같은 추가 기능을 붙일 수 있다.

관련 노트: [Jira 워크플로와 팀 운영](workflow.md), [[commit-convention|커밋 컨벤션]]
