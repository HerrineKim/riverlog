---
title: "Claude Code 명령어·플래그 레퍼런스"
concept: "Claude Code CLI"
summary: "Claude Code의 내장 슬래시 명령(세션·맥락·모델·설정·확장·원격·프로젝트), 번들 스킬, 시작 플래그와 하위 명령, 세션을 나누고 옮기는 명령(/branch, /fork, /subtask, /btw, --teleport, /remote-control), /powerup 강좌, 그리고 worktree·예약 작업·원격 제어·코드 리뷰 같은 기능이 어디에 있는지를 한 장의 지도로 정리했다. 명령 이름과 버전은 v2.1.325(2026-11) 기준이다."
tags: ["ai", "claude-code", "agentic-coding", "tools", "devtools"]
source: other
date: "2026-11-15"
sources: ["https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-commands.md", "https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-cli-startup-flags.md", "https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-power-ups.md", "https://github.com/shanraisshan/claude-code-best-practice/blob/main/README.md", "https://code.claude.com/docs/en/commands", "https://code.claude.com/docs/en/cli-reference"]
---

> shanraisshan의 「[claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice)」(MIT) 중 명령 문서(2026-11-14, v2.1.325), 시작 플래그 문서(2026-03), power-ups 문서와 README 기능표를 바탕으로 재구성한 노트다. 시작 플래그 문서는 원문이 오래돼 이후 추가된 플래그를 명령 문서·설정 문서로 보충했다.

## 이 노트의 자리

처음 익힐 필수 명령 13개와 단축키는 [[claude-code-guide|Claude Code 활용 가이드]]에 있다. 이 노트는 그 밖의 명령을 찾아보는 사전이다. `/`만 입력하면 지금 쓸 수 있는 명령과 스킬 목록이 뜨고, 내장 명령은 v2.1.325 기준 96개다.

## 슬래시 명령

### 세션

| 명령 | 하는 일 |
| --- | --- |
| `/clear [이름]` (`/reset`, `/new`) | 맥락 비우고 새 대화 |
| `/compact [지시]` | 요약해 맥락 확보. 지시로 무엇을 남길지 정한다 |
| `/resume` (`/continue`), `/rename` | 지난 대화 재개, 세션 이름 붙이기 |
| `/rewind` (`/checkpoint`, `/undo`) | 체크포인트로 대화·코드 되감기 |
| `/branch [이름]` | 대화를 분기하고 분기 쪽으로 옮겨 간다. 원본은 `claude -r <원본 세션 ID>`로 돌아간다 |
| `/fork [프롬프트]` | 대화를 새 백그라운드 세션으로 복사(자체 worktree) |
| `/subtask <작업>` | 대화 전체를 물려받은 포크 서브에이전트에 맡기고 결과만 받는다 |
| `/background [프롬프트]` (`/bg`) | 백그라운드 세션으로. `claude agents`로 지켜본다 |
| `/btw [질문]` | 작업을 끊지 않고 대화에 남지 않는 곁질문 |
| `/goal [조건\|clear]` | 조건이 충족될 때까지 턴을 넘어 계속 작업([[claude-code-workflows\|개발 워크플로]]) |
| `/recap`, `/focus` | 지금까지 한 일·다음 할 일 요약, 중간 과정을 숨기고 결과만 보기 |
| `/cd <경로>`, `/add-dir <경로>` | 세션 작업 폴더 이동, 다른 저장소를 보이게 하고 권한 주기 |
| `/list-agents` (`/peers`) | 함께 도는 세션·팀원 보기 |

### 맥락과 사용량

| 명령 | 하는 일 |
| --- | --- |
| `/context [all]` | 맥락 사용량. 빠진 스킬 경고도 여기 뜬다 |
| `/autocompact [auto\|토큰]` | 자동 압축 시점(예 `500k`) |
| `/usage` (`/cost`, `/stats`), `/status` | 비용·플랜 한도, 읽힌 설정 파일 |
| `/usage-credits` | 한도 초과 종량 과금 설정(옛 이름 `/extra-usage`) |
| `/rate-limit-options` | 막혔을 때 선택지: 기다리기, 크레딧 추가, 업그레이드 |
| `/insights` | 이 기기의 세션 사용 패턴을 분석한 HTML 리포트 |

### 모델

| 명령 | 하는 일 |
| --- | --- |
| `/model` | 모델 전환. 피커에서 `s`를 누르면 이번 세션만 바꾼다 |
| `/effort [low…xhigh\|max\|auto]` | 추론 강도. `max`는 세션 한정 |
| `/fast [on\|off]` | 빠른 출력 모드. 항상 사용량 크레딧으로 과금된다 |
| `/advisor [모델\|off]` | 두 번째 모델에게 자문을 받는다 |
| `/plan [설명]` | 계획 모드로 들어가기 |

### 설정과 화면

| 명령 | 하는 일 |
| --- | --- |
| `/config [key=value]` (`/settings`) | 설정 열기 또는 한 키만 바꾸기(`/config model=sonnet`) |
| `/permissions` | 허용·거부 규칙, 자동 모드 거부 기록 |
| `/sandbox` | bash 샌드박스 켜기 |
| `/statusline`, `/theme`, `/output-style`, `/color` | 상태줄, 테마, 출력 스타일(Explanatory·Learning), 세션 색 |
| `/tui [classic\|fullscreen]` | 렌더러 고르기. `fullscreen`은 깜빡임 없는 전체 화면 렌더링과 마우스 지원, `classic`(v2.1.327 전에는 `default`)은 기존 렌더러 |
| `/keybindings`, `/terminal-setup` | 키 재매핑(라이브 리로드), Shift+Enter 줄바꿈 설정. Vim 모드는 `/config`의 Editor mode에서 켠다(`/vim` 명령은 v2.1.92에서 없어졌다) |
| `/voice` | 음성 입력(스페이스바를 누른 채 말하기) |
| `/import [codex\|gemini\|cursor]` | 다른 에이전트의 설정 가져오기 |
| `/powerup` | 놓치기 쉬운 기능을 가르치는 대화형 강좌 |

### 확장

| 명령 | 하는 일 |
| --- | --- |
| `/hooks`, `/skills` | 훅 설정 보기, 스킬 목록. `/skills`에서 `t`는 토큰순 정렬 |
| `/agents` | 서브에이전트는 Claude에게 만들어 달라고 하거나 `.claude/agents/`를 직접 고치라는 안내만 띄운다. 대화형 관리 화면은 v2.1.197까지 있었다 |
| `/mcp [reconnect\|enable\|disable]` | MCP 서버 상태와 재연결 |
| `/plugin`, `/reload-plugins`, `/reload-skills` | 플러그인 설치, 재시작 없이 다시 읽기 |
| `/chrome`, `/ide` | Chrome 확장·IDE 연결 |

### 프로젝트와 리뷰

| 명령 | 하는 일 |
| --- | --- |
| `/init` | CLAUDE.md 초안. `CLAUDE_CODE_NEW_INIT=1`이면 스킬·훅까지 대화형으로 |
| `/code-review [low…max\|ultra] [--fix] [--comment] [--max-findings n]` (`/review`) | diff·PR 리뷰. `ultra`는 클라우드 다중 에이전트 심층 리뷰(`/ultrareview`) |
| `/security-review` | 보안 리뷰 |
| `/diff` | 변경 보기 |
| `/team-onboarding` | 지난 30일 사용 기록으로 온보딩 가이드 생성 |

### 원격

| 명령 | 하는 일 |
| --- | --- |
| `/remote-control` (`/rc`) | 로컬 세션을 폰·웹에서 조종 |
| `/teleport` (`/tp`) | 클라우드 세션을 로컬 터미널로 끌어오기 |
| `/schedule` (`/routines`) | 클라우드 예약 작업. 기기가 꺼져도 돈다 |
| `/autofix-pr [프롬프트]` | 클라우드 세션이 PR의 CI 실패·리뷰 코멘트를 고쳐 푸시 |
| `/install-github-app`, `/install-slack-app` | PR에서 `@claude`, Slack에서 `@Claude` |
| `/desktop`, `/mobile` | 데스크톱·모바일 앱으로 넘기기 |

### 진단과 내보내기

`/doctor`(설정 점검), `/bug`(버그 보고), `/release-notes`, `/tasks`(백그라운드 작업), `/copy [N]`, `/export [파일]`.

## 번들 스킬

메뉴에 함께 뜨지만 내장 명령이 아니라 Claude Code에 포함된 스킬이다.

| 스킬 | 하는 일 |
| --- | --- |
| `loop` | 프롬프트·명령을 주기 실행 |
| `batch` | 코드베이스를 조사해 작업을 독립된 5~30개 단위로 쪼갠 계획을 보여 주고, 승인하면 단위마다 worktree 백그라운드 서브에이전트를 띄운다. 대규모 마이그레이션용 |
| `simplify` | 리뷰 에이전트 4개를 병렬로 돌려 재사용·단순화·효율을 정리(버그 탐지는 안 함) |
| `debug` | 세션 디버그 로그를 켜고 그 로그를 읽어 Claude Code 자체의 문제를 진단 |
| `run`, `verify` | 실제 앱을 띄워 변경을 확인. 테스트·타입 검사로 대신하지 않는다 |
| `fewer-permission-prompts` | 기록에서 반복 승인한 읽기 전용 명령을 찾아 allowlist를 추천 |
| `skill-doctor` | 안 쓰는 스킬과 맥락 비용 보고 |
| `update-config` | `settings.json` 편집 대행 |
| `claude-api` | Claude API·SDK 코드 작성 |

## 시작 플래그

필수 몇 개(`-p`, `--continue`, `--resume`, `--permission-mode`)는 활용 가이드에 있다.

| 분류 | 플래그 | 하는 일 |
| --- | --- | --- |
| 세션 | `--from-pr <번호\|URL>` | PR에 연결된 세션 재개 |
| | `--fork-session` | 재개하면서 새 세션 ID로 분기 |
| | `--cloud`, `--teleport` | 클라우드 세션 만들기(`--remote`는 폐기 예정 별칭), 클라우드 세션을 로컬로 |
| | `-w, --worktree` | 새 worktree에서 시작 |
| 모델 | `--model`, `--effort`, `--fallback-model` | |
| 권한 | `--allowedTools`, `--disallowedTools`, `--tools ""` | 허용·제외, 내장 도구 전부 끄기 |
| | `--permission-prompt-tool` | 비대화형에서 MCP 도구가 승인을 처리 |
| 시스템 프롬프트 | `--system-prompt`, `--append-system-prompt` (`-file` 변형) | 통째 교체, 기본에 덧붙이기 |
| 에이전트 | `--agent <이름>`, `--agents <JSON>` | 커스텀 에이전트로 시작, 즉석 서브에이전트 정의 |
| 확장 | `--mcp-config`, `--strict-mcp-config`, `--plugin-dir` | 지정한 MCP만, 로컬 플러그인 |
| 출력 | `--output-format text\|json\|stream-json`, `--json-schema`, `--include-partial-messages` | print 모드 출력 |
| 예산 | `--max-budget-usd`, `--max-turns` | print 모드 상한 |
| 설정 | `--settings`, `--setting-sources user,project,local` | 한 세션만 덮어쓰기, 읽을 계층 고르기 |
| 깨끗한 실행 | `--bare` | 로컬 CLAUDE.md·설정·MCP를 찾지 않는다. `--system-prompt`, `--mcp-config`, `--settings`로 명시하면 시작이 최대 10배 빠르다 |
| | `--safe-mode` | CLAUDE.md·스킬·플러그인·훅·MCP 없이 시작(문제 격리용) |
| 기타 | `--add-dir`, `--chrome`, `--ide`, `--debug='api,hooks'`, `--bg` | |

```bash
claude -p "summarize this codebase" --output-format=stream-json --verbose --bare
```

### 하위 명령

`claude agents`(백그라운드 에이전트 보기), `claude auth`, `claude doctor`, `claude mcp add|remove|list|get`, `claude plugin`(`details <플러그인>`으로 맥락 토큰 비용 확인), `claude remote-control`, `claude setup-token`, `claude update`, `claude auto-mode defaults`, `claude ultrareview [대상]`.

## /powerup 강좌

| # | 주제 | 다루는 것 |
| --- | --- | --- |
| 1 | 코드베이스와 대화 | `@` 파일·줄 참조 |
| 2 | 모드로 조종 | `Shift+Tab`, 계획, 자동 |
| 3 | 무엇이든 되돌리기 | `/rewind`, `Esc` 두 번 |
| 4 | 백그라운드 실행 | `/tasks` |
| 5 | 규칙 가르치기 | CLAUDE.md, `/memory` |
| 6 | 도구 확장 | MCP, `/mcp` |
| 7 | 워크플로 자동화 | 스킬, 훅 |
| 8 | 나를 여럿으로 | 서브에이전트, `/agents` |
| 9 | 어디서나 코딩 | `/remote-control`, `/teleport` |
| 10 | 모델 다이얼 | `/model`, `/effort` |

## 기능 지도

| 기능 | 어디에 | 하는 일 |
| --- | --- | --- |
| Git worktree | `-w`, `.worktreeinclude`, `isolation: "worktree"`, `WorktreeCreate` 훅 | 격리된 작업 사본에서 병렬 세션. git이 아닌 VCS는 훅으로 생성 로직을 넣는다 |
| 체크포인트 | 자동(파일 편집 추적) | `/rewind`로 되감기 |
| 작업 목록(Tasks) | `/tasks`, `~/.claude/tasks/` | 의존성 그래프가 있는 파일 기반 할 일 목록. 같은 `CLAUDE_CODE_TASK_LIST_ID` 세션끼리 공유 |
| 예약 작업 | `/loop`, `/schedule` | 세션 안 주기 실행, 클라우드 예약 실행 |
| 에이전트 뷰 | `claude agents`, `--bg`, `/bg` | 백그라운드 에이전트 관리 |
| 세션 간 메시지 | `SendMessage`, `/list-agents` | 다른 세션에 메시지 보내기 |
| 에이전트 팀(베타) | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` | 독립 세션 여럿이 공유 작업 목록으로 협업 |
| 동적 워크플로 | `/workflows`, `ultracode` 키워드, `.claude/workflows/` | 다중 에이전트 워크플로를 작성·실행 |
| 원격 제어 | `/remote-control` | 폰·웹에서 로컬 세션 조종 |
| 웹·데스크톱·모바일 | `claude.ai/code`, 데스크톱 Code 탭, iOS·Android Code 탭 | 같은 에이전트를 다른 화면에서 |
| 코드 리뷰 | GitHub App, `/code-review` | PR이 열리면 에이전트 팀이 버그를 찾는 심층 리뷰 |
| GitHub Actions | `.github/workflows/` | CI 안에서 `@claude` |
| Chrome | `--chrome`, 확장 | 로그인된 실제 브라우저 조작 |
| 딥 링크 | `claude-cli://open?repo=…&q=…` | 외부에서 프롬프트를 채워 세션 열기 |
| 아티팩트 | Artifact 도구, `/artifacts` | 결과를 비공개 웹 페이지로 게시하고, 내 아티팩트 목록에서 다시 찾는다 |
| 플러그인 | `/plugin`, 마켓플레이스 | 스킬·에이전트·훅·MCP·LSP를 묶어 배포 |
| Agent SDK | npm·pip 패키지 | 같은 엔진으로 커스텀 에이전트 |

## 정리

- 세션은 나누고(`/branch`, `/fork`, `/subtask`), 곁가지는 따로 묻고(`/btw`), 옮긴다(`/teleport`, `/remote-control`).
- 맥락은 `/context`로 보고 `/compact [지시]`나 `/clear`로 관리한다. 비용은 `/usage`, 초과 과금은 `/usage-credits`.
- 비대화형 실행은 `--bare`와 명시적 플래그로 빠르고 재현 가능하게 만든다.
- 명령 이름은 자주 바뀐다. `/help`와 `/release-notes`로 확인한다.

관련 노트: [[claude-code-guide|Claude Code 활용 가이드]], [[claude-code-settings|Claude Code 설정과 권한 규칙]], [[claude-code-tips|Claude Code 실전 팁]], [[claude-code-workflows|Claude Code 개발 워크플로]]
