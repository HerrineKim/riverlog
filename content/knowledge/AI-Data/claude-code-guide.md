---
title: "Claude Code 활용 가이드"
concept: "Claude Code"
summary: "채팅형 AI와 무엇이 다른지부터 설치, 질문 → 편집 → 도구 → 맥락 → 자동화로 익숙해지는 순서, 슬래시 명령·단축키, MCP 연결, Skills와 CLAUDE.md, 팀 설정 공유, `claude -p` 자동화, Claude Code에 맞는 프롬프트 습관, 개발 팀장처럼 위임하는 작업 방식까지 Claude Code를 쓰는 데 필요한 요점을 한 장으로 정리."
tags: ["ai", "llm", "claude-code", "agentic-coding", "prompting", "mcp"]
source: other
date: "2026-10-20"
sources: ["https://www.youtube.com/watch?v=6eBSHbLKuN0", "https://www.youtube.com/watch?v=kPUuh2ZnzEM", "https://code.claude.com/docs/en/headless", "https://gayuna.github.io/llm/claude-code/", "https://code.claude.com/docs/en/model-config", "https://code.claude.com/docs/en/github-actions", "https://every.to/source-code/how-i-use-claude-code-to-ship-like-a-team-of-five", "https://code.claude.com/docs/en/setup", "https://code.claude.com/docs/en/interactive-mode", "https://code.claude.com/docs/en/commands", "https://code.claude.com/docs/en/memory", "https://code.claude.com/docs/en/skills", "https://code.claude.com/docs/en/mcp"]
---

> Aakash Gupta의 인포그래픽 「Master Claude Code: The Complete Guide for Everyone」(2026.01)을 바탕으로, 명령어·설치·메모리 설명은 [Claude Code 공식 문서](https://code.claude.com/docs/en/overview)로 확인해 재구성한 노트다. 위임 방식은 Kieran Klaassen의 「[How I Use Claude Code to Ship Like a Team of Five](https://every.to/source-code/how-i-use-claude-code-to-ship-like-a-team-of-five)」(2025.07)를, 도입 순서와 팀 설정은 Claude Code를 만든 Boris Cherny의 강연 「[Mastering Claude Code in 30 minutes](https://www.youtube.com/watch?v=6eBSHbLKuN0)」(Code w/ Claude, 2025.05, [한글 자막판](https://www.youtube.com/watch?v=kPUuh2ZnzEM))을, 동작 원리·맥락 관리·GitHub 연동은 Anthropic 강의 「Claude Code in Action」을 정리한 hello.gayuna의 [글](https://gayuna.github.io/llm/claude-code/)(2025.09)을 더했다.

## 채팅형 AI와 다른 점

브라우저의 채팅형 AI는 대화창 안에 갇혀 있다. Claude Code는 내 컴퓨터에서 직접 일하는 **에이전트**라서, 도움을 청하는 상대가 아니라 실제로 실행하는 팀원에 가깝다.

| 측면 | 채팅형 AI | Claude Code |
| --- | --- | --- |
| 파일과 명령 | 대화창 안에서만 동작하고 파일은 업로드해야 한다 | 디스크의 파일을 직접 읽고 쓰며, 셸 명령·스크립트·Git·패키지 설치를 자연어로 시킨다 |
| 외부 도구 | 대화 밖 도구와 단절 | MCP로 GitHub·Notion·Slack·Jira·DB 같은 도구에 연결해 지금 쓰는 체계 안에서 일한다 |
| 맥락과 규모 | 세션이 끝나면 맥락이 사라지고 실행은 결국 사람이 한다 | CLAUDE.md·자동 메모리로 맥락을 잇고, 서브에이전트 병렬 작업·백그라운드 작업·체크포인트 되감기·워크트리로 긴 작업을 나눠 수행한다 |

### 동작 원리: 도구 사용

LLM 자체는 파일을 읽거나 명령을 실행할 수 없다. 「파일을 읽어 줘」라고만 하면 「읽을 수 없습니다」가 돌아온다. 코딩 어시스턴트는 그 사이에서 **도구 사용(tool use)** 루프를 돌린다.

```text
작업 받기("이 에러를 고쳐 줘")
  → 맥락 모으기: 모델이 정해진 형식으로 "이 파일을 읽어 달라"고 요청 → 어시스턴트가 읽어서 내용을 돌려줌
  → 계획 세우기
  → 실행: 파일 수정·명령 실행도 같은 방식으로 요청 → 어시스턴트가 수행하고 결과를 돌려줌
  → 결과를 보고 다음 행동 결정 (반복)
```

Claude Code의 기본 도구는 파일 읽기·편집, 셸 명령, 검색 정도다. 모델이 이 도구들을 엮어 처음 보는 도구도 쓰고 복잡한 작업을 처리한다. 새 도구(MCP)를 붙이면 그것도 알아서 쓴다. 코드를 미리 색인해 외부 서버로 올리지 않고 그때그때 탐색하므로 코드베이스 전체를 보내지 않아도 된다.

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

처음 켰을 때 해 두면 편한 설정이 있다.

| 설정 | 방법 |
| --- | --- |
| 줄바꿈 | 대부분의 터미널은 `Shift+Enter`가 바로 된다. 안 되는 터미널은 `/terminal-setup`으로 키를 잡는다 |
| 테마 | `/theme`로 라이트·다크·색각 보정 테마를 고른다 |
| GitHub 연동 | `/install-github-app`을 실행하면 이슈·PR에서 `@claude`를 멘션해 일을 맡길 수 있다 |
| 자주 쓰는 도구 허용 | `/permissions`로 매번 묻는 명령을 허용 목록에 넣는다 |
| 말로 지시 | 프롬프트가 구체적일수록 결과가 좋다. 길게 타이핑하기보다 OS의 받아쓰기 기능으로 동료에게 설명하듯 말하면 빠르다 |

## 익숙해지는 순서

Claude Code는 빈 입력창 하나만 보여 주는 범용 도구라 무엇부터 할지 막막하기 쉽다. 정해진 워크플로를 강제하지 않기 때문이다. 다음 순서로 범위를 넓히면 **무엇을 한 번에 맡길 수 있고 무엇은 옆에서 이끌어야 하는지** 감이 생긴다.

```text
코드베이스 질문 → 코드 편집 → 팀 도구 연결 → 맥락 쌓기(CLAUDE.md) → 자동화·병렬 실행
```

### 1. 코드베이스에 질문하기

처음에는 코드를 고치게 하지 말고 **질문만** 한다. 새 코드베이스 온보딩에 특히 효과가 크다. 동료에게 묻고 코드를 뒤지던 시간이 크게 준다.

- 「이 클래스는 어디서 어떻게 생성되나」: 단순 텍스트 검색이 아니라 실제 사용 예를 찾아 문서처럼 답한다.
- 「이 함수는 왜 인자가 15개고 이름이 이상한가」: git 기록을 따라가 누가 어떤 이슈 때문에 넣었는지 요약한다. 시스템 프롬프트에 git 사용법이 있어서가 아니라 모델이 git을 알기 때문이다.
- 「이번 주에 내가 뭘 배포했지」: 로그에서 내 커밋을 모아 주간 회의 보고 초안을 만든다.

코드는 색인하지 않는다. 원격 DB에 코드를 올리지 않고 로컬에서 그때그때 탐색하므로, 색인을 기다릴 필요 없이 설치하자마자 쓴다.

### 2. 코드 편집하기

Claude Code가 가진 도구는 파일 편집, 셸 명령, 파일 검색 정도로 적다. 「이걸 해 줘」라고만 하면 도구를 알아서 엮어 탐색 → 구상 → 편집한다.

- **큰 작업은 먼저 계획을 받는다.** 거대한 기능을 한 번에 시키면 원하던 것과 다른 결과가 나오기 쉽다. 「코드를 쓰기 전에 계획을 세워서 승인을 받아라」 한마디면 된다. 계획 모드를 써도 되지만 말로 시켜도 충분하다.
- **「commit, push, PR」 한 줄**이면 git log에서 커밋 형식을 읽고 브랜치·커밋·PR까지 만든다.

### 3. 결과를 확인할 수단을 준다

Claude가 **스스로 결과를 볼 수 있으면 반복해서 고친다.** 단위 테스트, 브라우저 스크린샷(Puppeteer·Playwright MCP), iOS 시뮬레이터 스크린샷이 그 수단이다. 시안 이미지를 주고 웹 UI를 만들게 하면 첫 결과는 꽤 비슷한 정도지만, 스크린샷을 보며 두세 번 반복하게 하면 거의 똑같아진다. 이미지는 드래그 앤 드롭, 붙여넣기, 파일 경로 중 무엇으로 줘도 된다.

### 4. 팀 도구를 알려 준다

팀이 쓰는 CLI는 「`--help`로 사용법을 보고 이 CLI로 해라」라고 알려 주면 쓴다. 자주 쓰면 CLAUDE.md에 적어 세션마다 기억하게 한다. MCP 도구도 같다. 새 코드베이스에서 팀의 도구를 전부 쥐여 주면 Claude가 대신 쓴다.

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
| 도구 호출까지 전체 기록 보기 | `Ctrl+O` (트랜스크립트 뷰어) |
| 지난 세션 이어 가기 | `claude --continue`(가장 최근), `claude --resume`(목록에서 선택) |

`Esc`는 언제 눌러도 세션을 망가뜨리지 않는다. 20줄 수정안 중 한 줄만 마음에 안 들면 `Esc`로 멈추고 그 한 줄만 말한 뒤 다시 하게 한다. 방향이 맞다고 확신이 서면 `Shift+Tab`으로 편집 자동 수락 모드에 두고, 셸 명령만 승인한다. `!`로 실행한 명령과 출력은 맥락에 들어가 Claude가 다음 턴에 본다.

## MCP로 도구 연결하기

**MCP(Model Context Protocol)** 는 AI를 외부 도구와 잇는 개방형 표준이다. "AI용 USB-C"처럼 프로토콜 하나로 개발(GitHub, Sentry, Linear), 생산성(Notion, Slack, Jira·Confluence), 데이터(PostgreSQL, 웹 검색), 커뮤니케이션(Gmail, Google Calendar) 도구에 연결한다.

```bash
# 예: Notion을 HTTP MCP 서버로 추가
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

추가한 뒤 `/mcp`로 연결 상태를 확인한다. MCP 도구는 처음 쓸 때마다 권한을 묻는다. 늘 허용할 서버는 설정 파일의 허용 목록에 `mcp__서버이름` 형식으로 넣는다(밑줄이 두 개다).

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

```json
// .claude/settings.local.json
{ "permissions": { "allow": ["mcp__playwright"] } }
```

브라우저 도구를 붙이면 확인 수단과 프롬프트 개선을 한 번에 엮을 수 있다. 「localhost:3000을 열어 컴포넌트를 하나 만들어 보고, 스타일을 검토한 뒤, 앞으로 더 나은 컴포넌트가 나오도록 @src/lib/prompts/generation.tsx의 생성 프롬프트를 고쳐라」.

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

스킬에 인자를 받으려면 본문에 `$ARGUMENTS`를 쓴다. 예를 들어 테스트 작성 규칙을 `.claude/skills/write-tests/SKILL.md`에 두면 `/write-tests hooks 폴더의 use-auth.ts`처럼 부른다. 새로 만든 스킬이 바로 안 보이면 세션을 다시 시작한다.

```markdown
Write comprehensive tests for: $ARGUMENTS

Testing conventions:
- Use Vitest with React Testing Library
- Place test files in a __tests__ directory next to the source file
- Name test files as [filename].test.ts(x)

Coverage: happy paths, edge cases, error states
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

CLAUDE.md에는 자주 쓰는 셸 명령, MCP 도구, 아키텍처 결정, 핵심 파일처럼 **이 코드베이스에서 일하려면 알아야 할 것**만 짧게 둔다. 길어지면 맥락만 차지하고 효과는 적다. 하위 폴더에 둔 CLAUDE.md는 Claude가 그 폴더에서 일할 때 필요할 때만 읽힌다. 어떤 메모리 파일이 읽히고 있는지는 `/memory`로 보고 고친다.

CLAUDE.md는 사람이 쓰는 지시이고, **자동 메모리**는 Claude가 내 교정과 선호를 스스로 적어 두는 노트다(`~/.claude/projects/<프로젝트>/memory/MEMORY.md`). 저장소에 `AGENTS.md`만 있으면 그것을 대신 읽는다.

### 팀과 설정 공유하기

설정은 CLAUDE.md만이 아니라 권한, MCP 서버, 스킬까지 **같은 계층**으로 나뉜다.

| 계층 | 범위 | 예 |
| --- | --- | --- |
| 조직 정책 (managed settings) | 회사 전원, 개인이 덮어쓸 수 없다 | 모든 직원이 쓰는 테스트 명령을 자동 승인, 절대 열면 안 되는 URL을 차단 |
| 사용자 (`~/.claude/`) | 내 모든 프로젝트 | 개인 선호, 개인 스킬 |
| 프로젝트 (`.claude/`, `.mcp.json`, 커밋) | 저장소를 쓰는 팀 전원 | 공용 권한 규칙, 공용 MCP 서버, 팀 스킬 |
| 로컬 (`CLAUDE.local.md`, `.claude/settings.local.json`) | 이 저장소에서 나만 | 실험 중인 설정 |

무엇부터 할지 모르겠으면 **프로젝트 공유 설정**부터 만든다. 한 사람이 한 번 다듬으면 팀 전원이 덕을 보는 네트워크 효과가 생긴다. 예를 들어 브라우저 MCP 서버를 `.mcp.json`으로 커밋해 두면 누구든 따로 설치하지 않고 E2E 테스트와 스크린샷 반복을 쓴다. 맥락 문서는 누구를 위한 것인지(매번 읽힐지, 필요할 때만 읽힐지, 팀 공유인지 개인 선호인지)를 따져 배치하고, 시간을 들여 다듬을수록 성능이 크게 오른다.

## 자동화: `claude -p`

`-p`(print) 플래그를 붙이면 대화 없이 한 번 실행하고 끝나는 **똑똑한 유닉스 유틸리티**가 된다. Claude Code 자체가 쓰는 것과 같은 엔진(Agent SDK)이고, Python·TypeScript 패키지로도 쓸 수 있다.

```bash
# 빌드 로그를 파이프로 넣고 원인 설명을 파일로
cat build-error.txt | claude -p "이 빌드 오류의 근본 원인을 짧게 설명해" > output.txt

# 허용 도구를 지정해 무인 실행, JSON으로 받아 jq로 꺼내기
claude -p "테스트를 돌리고 실패를 고쳐" --allowedTools "Bash,Read,Edit" --output-format json | jq -r '.result'
```

CI, 장애 대응, 대용량 로그 분석(클라우드 버킷의 로그나 Sentry CLI 출력을 파이프로 넣기), 이슈 자동 분류(슬래시 명령 하나를 GitHub Actions에서 `-p`로 돌려 라벨 붙이기)에 쓴다. CI처럼 어디서 돌려도 같은 결과가 필요하면 `--bare`로 개인 훅·플러그인·CLAUDE.md를 읽지 않게 한다.

### GitHub Actions 연동

`/install-github-app`을 실행하면 GitHub에 Claude 앱을 설치하고, API 키를 저장소 시크릿에 등록하고, 워크플로 파일을 담은 PR을 만든다.

| 동작 | 내용 |
| --- | --- |
| 멘션 | 이슈나 PR 댓글에서 `@claude`를 부르면 내용을 분석해 답하거나 코드를 고쳐 PR을 연다 |
| PR 리뷰 | 새 PR이 올라오면 변경을 검토하고 영향 범위를 리포트로 남긴다 |
| 커스텀 워크플로 | 워크플로 파일에서 프로젝트 준비 단계(의존성 설치, 개발 서버 실행), 추가 지시(서버 주소, 로그 위치, 쓸 수 있는 CLI), MCP 서버 설정, 허용 도구 목록을 저장소에 맞게 정한다 |

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    claude_args: |
      --append-system-prompt "서버는 localhost:3000에서 이미 돌고 있고 로그는 logs.txt에 쌓인다. DB는 sqlite3 CLI로 조회한다. 필요하면 mcp__playwright 도구로 브라우저를 띄워 앱을 확인한다."
      --mcp-config .github/mcp.json
      --allowedTools "Bash(npm *),Bash(sqlite3 *),mcp__playwright__browser_snapshot,mcp__playwright__browser_click"
```

v1부터는 Claude Code CLI 인자를 `claude_args` 하나로 넘긴다. 베타 시절의 `custom_instructions`·`mcp_config`·`allowed_tools` 같은 개별 입력은 `--append-system-prompt`·`--mcp-config`·`--allowedTools`로 옮겨졌다. 전체 입력 목록은 [GitHub Actions 문서](https://code.claude.com/docs/en/github-actions)에서 확인한다.

### 훅: 반드시 지킬 규칙

CLAUDE.md의 지시는 모델이 잊을 수 있다. 수정 후 포맷터·타입 검사, 민감 파일 차단처럼 **반드시 실행돼야 하는 규칙**은 도구 호출 앞뒤에 자동 실행되는 훅으로 건다. 이벤트·종료 코드·예제는 [[claude-code-hooks|Claude Code 훅]]에 따로 정리했다.

## 프롬프트 기법

구체적인 지시, 예시, 단계 연결, 제약, 역할 부여 같은 일반 원칙은 어떤 모델에나 같다. [[prompt-cheat-sheet|프롬프트 작성법 치트시트]]에 정리해 두었고, 여기서는 **Claude Code에서만 통하는 것**만 적는다.

| 기법 | 언제 쓰나 | 왜 |
| --- | --- | --- |
| **맥락은 `@`로 직접 준다** | 파일·폴더를 다룰 때 | 내용을 설명하지 말고 `@report.csv`, `@data/`처럼 붙이면 Claude가 직접 읽는다 |
| **작업 하나에 세션 하나** | 관련 없는 작업 사이 | `/clear`로 맥락을 비운다. 이유는 [[ai-coding-guardrails\|AI 코딩 실무 가드레일]]의 「맥락과 세션 관리」 참고 |
| **반복되는 지시는 CLAUDE.md로** | 세션마다 같은 말을 하고 있을 때 | 매 세션 자동으로 읽히므로 프롬프트가 짧아진다 |
| **계획 모드 → 검토 → 실행** | 파일을 여러 개 고치는 작업 | `Shift+Tab`을 눌러 상태 표시줄에 `plan mode on`이 뜨게 하면 코드를 고치지 않고 계획만 낸다. 계획을 받아들이거나, 빠진 것을 더 지시한 뒤 실행한다 |
| **끝나는 조건을 준다** | 테스트 통과처럼 확인 가능한 목표가 있을 때 | `/goal 모든 테스트 통과`처럼 조건을 걸면 별도 모델이 매 턴 충족 여부를 판정하고, 충족될 때까지 이어서 일한다 |

### 계획 모드와 추론 강도: 넓이와 깊이

| 도구 | 어울리는 일 | 쓰는 법 |
| --- | --- | --- |
| 계획 모드 (넓이) | 코드베이스를 넓게 이해해야 하는 일, 여러 단계 구현, 여러 파일·컴포넌트에 걸친 변경 | `Shift+Tab`, 또는 `claude --permission-mode plan` |
| 추론 강도 (깊이) | 복잡한 로직, 까다로운 디버깅, 알고리즘 문제 | `/effort`로 `low`~`max` 단계를 고른다. 한 턴만 깊게 생각시키려면 프롬프트 어딘가에 `ultrathink`를 넣는다 |

둘 다 토큰을 더 쓴다. 지금의 모델은 단계마다 생각할지 말지를 스스로 정하는 적응형 추론이라, 강도는 생각을 얼마나 자주·깊게 할지의 기준을 바꾼다.

- 과거에는 `think` < `think hard` < `think harder` < `ultrathink`처럼 프롬프트의 키워드로 생각 예산을 정했다. 지금은 `ultrathink`만 키워드로 인식하고, 나머지 표현은 그냥 프롬프트 문장으로 전달된다.

### 맥락이 흐트러졌을 때

작업 A를 하위 작업 a·b·c·d로 나눠 진행하는 중이라고 하자.

| 상황 | 대처 |
| --- | --- |
| 의도와 다른 방향으로 가고 있다 | `Esc`로 바로 끊고 다시 지시한다 |
| 같은 실수를 반복한다 (없는 파일 경로를 계속 참조 등) | `Esc`로 끊고, 올바른 경로를 CLAUDE.md에 적게 한다(`/memory` 또는 「CLAUDE.md에 기억해 둬」) |
| b의 에러를 오래 디버깅해서 맥락이 디버깅 이야기로 가득하다 | `Esc` 두 번(`/rewind`)으로 디버깅 이전 시점으로 돌아가 c부터 이어 간다 |
| c를 디버깅하며 알아낸 것은 다음 작업에도 쓸모 있다 | `/compact`로 지금까지를 요약해 핵심은 남기고 맥락을 줄인다 |
| 완전히 새로운 작업을 시작한다 | `/clear`로 비운다 |

에이전트에게 맡길 때 결과를 일관되게 만드는 방법은 [[design-system-agent-harness|디자인 시스템을 아는 화면 생성 에이전트 설계하기]], 반복 작업을 루프로 돌리는 방법은 [[loop-engineering|루프 엔지니어링]]에서 더 깊이 다뤘다.

## 개발 팀장처럼 위임하기

Claude Code를 잘 쓰면 개발자의 자리는 **코드를 치는 사람**에서 **결과를 정의하고 맡기는 엔지니어링 매니저·테크 리드**로 옮겨 간다. 파일과 함수 단위로 생각하지 않고, 만들 기능의 스펙과 원하는 결과로 생각한다. 직접 세부를 챙기는 마이크로매니저 자리에서 물러나되, 코드 리뷰와 테스트라는 견제 장치는 유지한다.

| 습관 | 방법 |
| --- | --- |
| **이슈 → 구현 → 리뷰를 명령으로** | 반복 흐름을 스킬로 만든다. 예: `/issues`(조사해서 GitHub 이슈 작성) → `/work`(이슈를 구현하고 PR 열기) → `/review`(PR 리뷰와 개선 제안). "PR" 한마디로 브랜치·커밋 메시지·PR 설명까지 만들게 할 수도 있다 |
| **워크트리로 병렬 실행** | 파워 유저는 같은 저장소를 여러 벌 체크아웃하거나 git 워크트리로 격리해 Claude 세션을 여러 개 동시에 돌린다. 기능마다 git 워크트리를 따로 두고 탭 여러 개에서 동시에 돌린다. 구현, 리뷰, 변경 기록 작성, 버그 조사를 나란히 맡긴다. 자세한 구성은 [[loop-engineering\|루프 엔지니어링]] |
| **남의 코드까지 읽게 하는 디버깅** | 코드와 로그가 멀쩡한데 문제가 나면 "개발 환경이 아니라 운영 환경 쪽 문제일 수 있다"고 방향을 주고, 쓰고 있는 외부 라이브러리 소스까지 따라가게 한다. 사람이 몇 시간 걸릴 낯선 코드 탐색을 AI가 맡고, 결론은 함께 낸다 |
| **지친 상태의 결정을 덜어 낸다** | 변수 이름 같은 작은 결정이 쌓여 집중력을 깎는다. 구현 세부는 맡기고, 남은 집중력은 어려운 설계 판단에 쓴다 |
| **외부 맥락은 MCP로** | 고객 피드백 도구 같은 서비스를 MCP로 연결해 이슈 작성의 재료로 쓴다 |

자주 보이는 실패와 대처는 이렇다.

| 증상 | 대처 |
| --- | --- |
| 단순한 일을 과하게 복잡하게 만든다 | `Esc`로 멈추고 범위를 다시 준다 |
| 테스트를 지나치게 많이 쓴다 | 필요한 테스트 범위를 지시나 CLAUDE.md에 적는다 |
| 테스트를 통과시키려고 테스트 자체를 우회·수정한다 | 결과를 리뷰에서 반드시 확인한다. 테스트는 사람이 정하는 원칙은 [[ai-coding-guardrails\|AI 코딩 실무 가드레일]] |

주니어 개발자에게는 지치지 않는 멘토로도 쓸 수 있다. 내 코드 리뷰, 언어·방식 간 비교, 흔한 함정 설명을 부탁한다. 처음 쓸 때는 연습용이 아니라 **실제 프로젝트**에 적용해 보는 편이 빨리 감을 잡는다. 이 위임 방식을 실무 팀에 적용한 예는 [[ai-native-frontend|AI 네이티브 프론트엔드 개발]]에 있다.

## 왜 터미널인가

터미널은 편집기가 제각각인 사람들의 **공통분모**이고, 모델이 빠르게 좋아지는 동안 곧 낡을 UI 계층에 묶이지 않는다. 그래서 어떤 IDE, 원격 SSH, tmux 안에서도 같은 방식으로 돌아간다. 같은 에이전트를 IDE 확장과 데스크톱·웹 앱으로도 쓴다.

터미널 에이전트의 핵심 난제는 **셸 명령의 안전성**이다. 명령마다 승인을 받으면 일이 안 되므로, 읽기 전용 명령을 구분하고, 정적 분석으로 안전하게 조합되는 명령을 가려내고, 여러 계층에서 허용·차단 목록을 두는 권한 체계로 푼다.

## 요금제

구독(Pro·Max·Team·Enterprise)으로 쓰거나, CI/CD·파이프라인처럼 자동화 용도면 API 사용량 과금으로 쓴다. Amazon Bedrock·Google Cloud·Microsoft Foundry를 통해서도 쓸 수 있다. 플랜별 요금과 한도는 자주 바뀌므로 [공식 요금 안내](https://claude.com/pricing)에서 확인하고, 세션 안에서는 `/usage`로 사용량을 본다.

관련 노트: [[claude-code-hooks|Claude Code 훅]], [[ai-coding-guardrails|AI 코딩 실무 가드레일]], [[prompt-cheat-sheet|프롬프트 작성법 치트시트]], [[claude-skill-building-guide|Claude 스킬 만들기 가이드]], [[ai-accelerated-development|AI로 개발 가속하기: 규칙을 키우는 개발]], [[ai-delegation-toolkit|AI에게 일 맡기기: 권한·정보·도구]]
