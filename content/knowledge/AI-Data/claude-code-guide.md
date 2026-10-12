---
title: "Claude Code 활용 가이드"
concept: "Claude Code"
summary: "채팅형 AI와 무엇이 다른지부터 설치, 슬래시 명령·단축키, MCP 연결, Skills와 CLAUDE.md, 프롬프트 기법, 요금제까지 Claude Code를 쓰는 데 필요한 요점을 한 장으로 정리."
tags: ["ai", "llm", "claude-code", "agentic-coding", "prompting", "mcp"]
source: other
date: "2026-10-12"
---

> Aakash Gupta의 인포그래픽 「Master Claude Code: The Complete Guide for Everyone」(v1.0, 2026년 1월)을 보고 요약·재구성한 노트입니다. 명령어·요금은 그 시점 기준이라 바뀌었을 수 있으니, 정확한 내용은 [공식 문서](https://code.claude.com/docs/en/setup)를 확인하세요.

## 채팅 도구가 아니라 "운영 체제"

브라우저에서 쓰는 채팅형 AI는 대화창 안에 갇혀 있다. Claude Code는 내 컴퓨터에서 직접 일하는 **에이전트**라서 제약의 성격이 다르다.

| 채팅형 AI | Claude Code |
| --- | --- |
| 대화창 안에서만 동작 | 시스템 전체에 접근 (파일, 터미널) |
| 업로드 용량 제한 | 모든 파일을 크기 제한 없이 직접 읽음 |
| 세션이 끝나면 맥락이 사라짐 | 몇 시간짜리 작업도 이어서 수행 |
| 실행은 결국 내가 함 | 서브에이전트까지 부리는 "AI 팀원" |

차이를 한 문장으로 줄이면, **누군가에게 도움을 청하는 것**과 **실제로 실행하는 유능한 팀원을 두는 것**의 차이다.

## 할 수 있는 일 네 가지

- **파일 시스템 전체 접근**: 컴퓨터의 어떤 파일이든 읽고, 쓰고, 정리하고, 분석한다. 업로드 없이 수천 개의 파일을 몇 분 만에 처리할 수 있다.
- **도구·명령 실행**: 셸 명령, 스크립트 실행, Git 관리, 패키지 설치를 자연어로 시킨다. 터미널 문법을 몰라도 된다.
- **MCP 연결**: GitHub, Notion, Slack, Jira, 데이터베이스 등 수백 개의 도구와 이어져 지금 쓰는 도구 체계 안에서 일한다.
- **멀티 에이전트 작업**: 서브에이전트가 병렬로 일하고, 체크포인트로 되감고, 백그라운드 작업이 내가 다른 일을 하는 동안 돌아간다. 주니어 엔지니어 다섯 명에게 일을 나눠 맡기는 것과 비슷하다.

## 작업 흐름: 조사 → 계획 → 실행 → 확장

| 단계 | 예시 |
| --- | --- |
| **Analyze & Research** | 고객 피드백 종합, 경쟁사 조사, 문서에서 인사이트 추출, 설문 파일 읽고 요약 |
| **Plan & Decide** | 메모로 PRD 초안 작성, 로드맵 우선순위 정하기, 전략 옵션 만들기, 의사결정 프레임워크 짜기 |
| **Create & Execute** | 발표 자료, 문서·코드·프로토타입, 리포트, 대시보드 만들기 |
| **Scale & Repeat** | 반복 워크플로 구성, MCP로 도구 연결, 재사용 스킬 만들기, 배치 작업 예약 |

PM이라면 이런 흐름을 통째로 맡길 수 있다: 회의록으로 PRD 작성 → Jira 티켓 자동 생성 → Slack에 요약 게시 → 대시보드 갱신.

## 설치와 준비물

추천 방식은 에디터(예: Cursor) 안의 터미널에서 쓰는 것이다. 프로젝트 폴더를 연 뒤 터미널(View → Terminal)에서 `claude`를 입력하고, 처음 한 번 브라우저 팝업으로 인증한다.

터미널에서 바로 설치할 수도 있다.

```bash
# macOS / Linux
curl -fsSL https://claude.ai/install.sh | bash

# Windows (PowerShell)
irm https://claude.ai/install.ps1 | iex

# 프로젝트 폴더로 이동해 실행
cd ~/your-project-folder
claude
```

- **OS**: macOS 13+, Ubuntu 20+, Windows 10+ (WSL 또는 Git Bash)
- **계정**: Claude Pro·Max 구독 또는 API 크레딧

## 필수 명령어

긴 지시문 대신 명령 하나로 정확하게 제어한다.

### 슬래시 명령

| 명령 | 하는 일 |
| --- | --- |
| `/help` | 사용할 수 있는 명령 전체 보기 |
| `/clear` | 대화 맥락 초기화 (작업이 바뀔 때마다) |
| `/compact` | 대화를 압축해 토큰 절약 |
| `/model` | Opus / Sonnet / Haiku 모델 전환 |
| `/mcp` | MCP 서버 연결 상태 확인 |
| `/doctor` | 설치 문제 진단 |
| `/config` | 설정 열기 |

### 파일 참조와 단축키

| 하고 싶은 것 | 방법 |
| --- | --- |
| 파일을 맥락에 넣기 | `@파일명` (예: `@report.csv`) |
| 폴더를 맥락에 넣기 | `@폴더/` (예: `@data/`) |
| 경로 자동 완성 | `Tab` |
| 실행 중단 | `Esc` |
| 체크포인트로 되감기 | `Esc` 두 번 |
| 이미지 붙여넣기 | `Ctrl+V` (Mac에서도 `Cmd+V`가 아님) |
| 셸 명령 바로 실행 | 입력을 `!`로 시작 |

## MCP로 도구 연결하기

**MCP(Model Context Protocol)** 는 Claude를 외부 도구와 잇는 개방형 표준이다. "AI용 USB-C"처럼, 프로토콜 하나로 수백 개의 연결을 만든다.

| 분야 | 연결할 수 있는 도구 예 |
| --- | --- |
| 개발 | GitHub, Sentry, Linear, GitLab |
| 생산성 | Notion, Slack, Atlassian, Jira Product Discovery |
| 데이터·리서치 | Perplexity, PostgreSQL, Brave Search, 파일 시스템 |
| 커뮤니케이션 | Gmail, Typefully, Buffer, Discord |

```bash
# 예: Notion을 HTTP MCP 서버로 추가
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

추가한 뒤 `/mcp`로 연결 상태를 확인한다.

## Skills와 CLAUDE.md

### Skills: 재사용하는 자동화

**스킬**은 작업별 지시를 묶은 패키지로, 관련 작업이 오면 Claude가 알아서 불러 쓴다. 폴더 하나에 `SKILL.md` 하나가 기본 단위다.

```text
~/.claude/skills/
├── linkedin-writer/
│   └── SKILL.md
├── prd-generator/
│   └── SKILL.md
└── data-cleaner/
    └── SKILL.md
```

기본 제공 스킬로 Word(`docx`), 스프레드시트(`xlsx`), 프레젠테이션(`pptx`), PDF(`pdf`) 처리가 있다.

### CLAUDE.md: 프로젝트 메모리

매 세션 처음에 읽히는 마크다운 파일이라, 한 번 적어 두면 같은 설명을 반복할 필요가 없다.

```markdown
# Project: Marketing Dashboard

## Key Commands
- npm run build
- npm test

## Style Guide
- Use TypeScript
- Follow existing patterns

## Important Context
- Main data source: /data/analytics.csv
- Deploy target: Vercel
```

| 범위 | 위치 |
| --- | --- |
| 모든 프로젝트 공통 | `~/.claude/CLAUDE.md` |
| 이 프로젝트만 | `./CLAUDE.md` (프로젝트 루트) |

## 프롬프트 기법

| 기법 | 언제 쓰나 | 예시 |
| --- | --- | --- |
| **구체적으로** | 항상 | "이 CSV 정리해 줘" 대신 "B열이 비어 있는 행을 지우고, 이메일 기준으로 중복 제거해 줘" |
| **예시 주기** | 출력 형식이 중요할 때 | 원하는 결과를 1~2개 보여 준다 |
| **단계 연결** | 복잡한 작업 | "먼저 분석하고, 그다음 요약하고, 그다음 실행 항목을 만들어 줘" |
| **제약 걸기** | 품질 관리 | "500단어 이내", "2024년 데이터만" |
| **역할 부여** | 전문성이 필요할 때 | "이 데이터셋을 검토하는 데이터 분석가처럼 행동해 줘" |
| **`/clear` 자주 쓰기** | 관련 없는 작업 사이 | 이전 맥락이 새 작업을 오염시키지 않게 한다 |

### 프로 패턴: 체크포인트 + 반복

1. 실행 전에 **계획부터** 세우게 한다.
2. 실행에 들어가기 전에 계획을 검토한다.
3. 실행하면서 체크포인트가 쌓이게 둔다.
4. 잘못되면 `Esc` 두 번으로 **되감는다**.
5. 피드백을 주며 반복한다.

에이전트에게 맡길 때 결과를 일관되게 만드는 방법은 [[design-system-agent-harness|디자인 시스템을 아는 화면 생성 에이전트 설계하기]]에서 더 깊이 다뤘다.

## 요금제 (2026년 1월 기준)

| 플랜 | 월 요금 | 적합한 경우 |
| --- | --- | --- |
| Pro | $20 | 가벼운 사용, 짧은 작업 |
| Max 5x | $100 | 매일 쓰는 경우, 큰 프로젝트 |
| Max 20x | $200 | 파워 유저, 많은 자동화 |
| API | 사용량 과금 | CI/CD, 기업 파이프라인 |

## 공식 문서

- [설치 가이드](https://code.claude.com/docs/en/setup)
- [MCP 레퍼런스](https://code.claude.com/docs/en/mcp)
- [Claude Code 베스트 프랙티스](https://www.anthropic.com/engineering/claude-code-best-practices)
