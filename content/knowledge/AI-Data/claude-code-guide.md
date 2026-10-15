---
title: "Claude Code 활용 가이드"
concept: "Claude Code"
summary: "채팅형 AI와 무엇이 다른지부터 설치, 슬래시 명령·단축키, MCP 연결, Skills와 CLAUDE.md, Claude Code에 맞는 프롬프트 습관까지 Claude Code를 쓰는 데 필요한 요점을 한 장으로 정리."
tags: ["ai", "llm", "claude-code", "agentic-coding", "prompting", "mcp"]
source: other
date: "2026-10-13"
sources: ["https://code.claude.com/docs/en/setup", "https://code.claude.com/docs/en/interactive-mode", "https://code.claude.com/docs/en/commands", "https://code.claude.com/docs/en/memory", "https://code.claude.com/docs/en/skills", "https://code.claude.com/docs/en/mcp"]
---

> Aakash Gupta의 인포그래픽 「Master Claude Code: The Complete Guide for Everyone」(2026.01)을 바탕으로, 명령어·설치·메모리 설명은 [Claude Code 공식 문서](https://code.claude.com/docs/en/overview)로 확인해 재구성한 노트다.

## 채팅형 AI와 다른 점

브라우저의 채팅형 AI는 대화창 안에 갇혀 있다. Claude Code는 내 컴퓨터에서 직접 일하는 **에이전트**라서, 도움을 청하는 상대가 아니라 실제로 실행하는 팀원에 가깝다.

| 측면 | 채팅형 AI | Claude Code |
| --- | --- | --- |
| 파일과 명령 | 대화창 안에서만 동작하고 파일은 업로드해야 한다 | 디스크의 파일을 직접 읽고 쓰며, 셸 명령·스크립트·Git·패키지 설치를 자연어로 시킨다 |
| 외부 도구 | 대화 밖 도구와 단절 | MCP로 GitHub·Notion·Slack·Jira·DB 같은 도구에 연결해 지금 쓰는 체계 안에서 일한다 |
| 맥락과 규모 | 세션이 끝나면 맥락이 사라지고 실행은 결국 사람이 한다 | CLAUDE.md·자동 메모리로 맥락을 잇고, 서브에이전트 병렬 작업·백그라운드 작업·체크포인트 되감기·워크트리로 긴 작업을 나눠 수행한다 |

## 설치와 준비물

터미널에서 네이티브 설치 스크립트를 실행한다. 네이티브 설치는 백그라운드에서 자동 업데이트된다.

```bash
# macOS / Linux / WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows (PowerShell)
irm https://claude.ai/install.ps1 | iex

# 패키지 관리자 (자동 업데이트 안 됨)
brew install --cask claude-code        # macOS
winget install Anthropic.ClaudeCode    # Windows

# 프로젝트 폴더로 이동해 실행, 처음 한 번 브라우저로 로그인
cd ~/your-project-folder
claude
```

- **OS**: macOS 13+, Windows 10 1809+, Ubuntu 20.04+, Debian 10+, Alpine 3.19+. RAM 4GB 이상.
- **Windows**: PowerShell·CMD에서 바로 설치된다. Git for Windows가 있으면 Git Bash로 셸 명령을 돌리고, 없으면 PowerShell을 쓴다. 샌드박스가 필요하면 WSL 2에 설치한다.
- **계정**: Pro·Max·Team·Enterprise 구독 또는 Console(API) 계정. 무료 플랜에는 포함되지 않는다.
- 터미널이 낯설면 데스크톱 앱이나 VS Code·JetBrains 확장으로도 같은 에이전트를 쓴다.

## 필수 명령어

긴 지시문 대신 명령 하나로 정확하게 제어한다. `/`만 입력하면 쓸 수 있는 명령과 스킬 목록이 뜬다.

### 슬래시 명령

| 명령 | 하는 일 |
| --- | --- |
| `/help` | 사용할 수 있는 명령 전체 보기 |
| `/init` | 코드베이스를 분석해 `CLAUDE.md` 초안 만들기 |
| `/clear` | 새 대화로 맥락 비우기 (작업이 바뀔 때마다) |
| `/compact` | 지금까지의 대화를 요약해 맥락 확보 |
| `/context` | 맥락 사용량 보기 |
| `/model` | 모델과 추론 강도(effort) 전환 |
| `/resume` | 이전 대화 이어 가기 |
| `/rewind` | 체크포인트로 대화·코드 되감기. 계획 → 실행 → 잘못되면 되감기 → 피드백 반복 |
| `/memory` | CLAUDE.md 편집, 자동 메모리 켜기·끄기 |
| `/mcp` | MCP 서버 연결 상태 확인·재연결 |
| `/permissions` | 도구 허용·거부 규칙 관리 |
| `/usage` | 비용과 플랜 사용 한도 확인 |
| `/config` | 설정 열기 |

설치 문제는 터미널에서 `claude doctor`로 진단한다.

### 파일 참조와 단축키

| 하고 싶은 것 | 방법 |
| --- | --- |
| 파일·폴더를 맥락에 넣기 | `@파일명`, `@폴더/` (입력하면 경로가 자동 완성된다) |
| 자동 완성 받기 | `Tab` |
| 실행 중단 | `Esc` |
| 체크포인트로 되감기 | 입력창이 빈 상태에서 `Esc` 두 번, 또는 `/rewind` |
| 권한 모드 전환 (계획 모드 포함) | `Shift+Tab` |
| 실행 중인 명령을 백그라운드로 | `Ctrl+B` |
| 이미지 붙여넣기 | `Ctrl+V` (iTerm2는 `Cmd+V`, Windows·WSL은 `Alt+V`도 가능) |
| 셸 명령 바로 실행 | 입력을 `!`로 시작 |
| 지난 입력 검색 | `Ctrl+R` |

## MCP로 도구 연결하기

**MCP(Model Context Protocol)** 는 AI를 외부 도구와 잇는 개방형 표준이다. "AI용 USB-C"처럼 프로토콜 하나로 개발(GitHub, Sentry, Linear), 생산성(Notion, Slack, Jira·Confluence), 데이터(PostgreSQL, 웹 검색), 커뮤니케이션(Gmail, Google Calendar) 도구에 연결한다.

```bash
# 예: Notion을 HTTP MCP 서버로 추가
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

추가한 뒤 `/mcp`로 연결 상태를 확인한다.

프런트엔드 작업이라면 Chrome DevTools MCP를 붙여 Claude Code가 실제 브라우저를 열고 성능 트레이스·Lighthouse·콘솔로 결과를 직접 확인하게 할 수 있다. 설치와 플래그는 [[devtools-ai-agents|DevTools의 AI 지원과 에이전트용 DevTools(MCP)]]에 있다.

## Skills와 CLAUDE.md

### Skills: 재사용하는 자동화

**스킬**은 작업별 지시를 묶은 패키지로, 관련 작업이 오면 Claude가 알아서 불러 쓰고 `/스킬이름`으로 직접 부를 수도 있다. 폴더 하나에 `SKILL.md` 하나가 기본 단위이고, 예전의 커스텀 슬래시 명령(`.claude/commands/`)도 스킬로 합쳐졌다.

```text
~/.claude/skills/          ← 내 모든 프로젝트
.claude/skills/            ← 이 저장소 (팀과 공유)
├── prd-generator/
│   └── SKILL.md
└── data-cleaner/
    ├── SKILL.md
    └── scripts/clean.py
```

Claude Code에는 `/loop`(주기 실행), `/batch`(대규모 병렬 변경), `/simplify`, `/code-review` 같은 번들 스킬이 들어 있다. claude.ai와 API에서는 Anthropic이 만든 문서 스킬(Word `docx`, 스프레드시트 `xlsx`, 프레젠테이션 `pptx`, `pdf`)을 쓸 수 있다. 스킬을 직접 만드는 방법은 [[claude-skill-building-guide|Claude 스킬 만들기 가이드]]에 따로 정리했다.

### CLAUDE.md: 프로젝트 메모리

매 세션 처음에 읽히는 마크다운 파일이라, 한 번 적어 두면 같은 설명을 반복할 필요가 없다. `/init`으로 초안을 만들고, 200줄 안쪽으로 유지한다.

```markdown
## Key Commands
- npm run build / npm test

## Style Guide
- Use TypeScript, follow existing patterns

## Important Context
- Deploy target: Vercel
```

| 범위 | 위치 |
| --- | --- |
| 모든 프로젝트 공통 | `~/.claude/CLAUDE.md` |
| 이 프로젝트 (팀 공유) | `./CLAUDE.md` 또는 `./.claude/CLAUDE.md` |
| 이 프로젝트, 나만 | `./CLAUDE.local.md` (`.gitignore`에 추가) |
| 특정 파일 유형에만 | `.claude/rules/*.md` |

CLAUDE.md는 사람이 쓰는 지시이고, **자동 메모리**는 Claude가 내 교정과 선호를 스스로 적어 두는 노트다(`~/.claude/projects/<프로젝트>/memory/MEMORY.md`). 저장소에 `AGENTS.md`만 있으면 그것을 대신 읽는다.

## 프롬프트 기법

구체적인 지시, 예시, 단계 연결, 제약, 역할 부여 같은 일반 원칙은 어떤 모델에나 같다. [[prompt-cheat-sheet|프롬프트 작성법 치트시트]]에 정리해 두었고, 여기서는 **Claude Code에서만 통하는 것**만 적는다.

| 기법 | 언제 쓰나 | 왜 |
| --- | --- | --- |
| **맥락은 `@`로 직접 준다** | 파일·폴더를 다룰 때 | 내용을 설명하지 말고 `@report.csv`, `@data/`처럼 붙이면 Claude가 직접 읽는다 |
| **작업 하나에 세션 하나** | 관련 없는 작업 사이 | `/clear`로 맥락을 비운다. 이유는 [[ai-coding-guardrails\|AI 코딩 실무 가드레일]]의 「맥락과 세션 관리」 참고 |
| **반복되는 지시는 CLAUDE.md로** | 세션마다 같은 말을 하고 있을 때 | 매 세션 자동으로 읽히므로 프롬프트가 짧아진다 |
| **계획 모드 → 검토 → 실행** | 파일을 여러 개 고치는 작업 | `Shift+Tab`으로 계획 모드에 두면 코드를 고치지 않고 계획만 낸다. 실행 전에 계획을 보면 되돌릴 일이 줄어든다 |
| **끝나는 조건을 준다** | 테스트 통과처럼 확인 가능한 목표가 있을 때 | `/goal 모든 테스트 통과`처럼 조건을 걸면 별도 모델이 매 턴 충족 여부를 판정하고, 충족될 때까지 이어서 일한다 |

에이전트에게 맡길 때 결과를 일관되게 만드는 방법은 [[design-system-agent-harness|디자인 시스템을 아는 화면 생성 에이전트 설계하기]], 반복 작업을 루프로 돌리는 방법은 [[loop-engineering|루프 엔지니어링]]에서 더 깊이 다뤘다.

## 요금제

구독(Pro·Max·Team·Enterprise)으로 쓰거나, CI/CD·파이프라인처럼 자동화 용도면 API 사용량 과금으로 쓴다. Amazon Bedrock·Google Cloud·Microsoft Foundry를 통해서도 쓸 수 있다. 플랜별 요금과 한도는 자주 바뀌므로 [공식 요금 안내](https://claude.com/pricing)에서 확인하고, 세션 안에서는 `/usage`로 사용량을 본다.

관련 노트: [[ai-coding-guardrails|AI 코딩 실무 가드레일]], [[prompt-cheat-sheet|프롬프트 작성법 치트시트]], [[claude-skill-building-guide|Claude 스킬 만들기 가이드]]
