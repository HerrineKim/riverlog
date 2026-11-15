---
title: "Claude Code 설정과 권한 규칙"
concept: "Claude Code Settings"
summary: "Claude Code의 settings.json 계층(관리 정책 > CLI > 로컬 > 프로젝트 > 사용자)과 목록 병합 규칙, 전역(~/.claude)과 프로젝트(.claude)에 두는 것, 저장소가 스스로 권한을 올리지 못하게 막는 예외, allow·ask·deny 규칙 문법(경로 접두사, Bash 와일드카드, 복합 명령 분해, 파라미터 매칭), 권한 모드별 세부 동작, 카테고리별 주요 설정 키와 환경변수, 샌드박스·상태줄·MCP·플러그인 거버넌스를 정리했다. 버전에 묶인 값은 v2.1.322(2026-11) 기준이다."
tags: ["ai", "claude-code", "agentic-coding", "security", "tools"]
source: other
date: "2026-11-15"
sources: ["https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-settings.md", "https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-global-vs-project-settings.md", "https://code.claude.com/docs/en/settings", "https://code.claude.com/docs/en/settings-reference", "https://code.claude.com/docs/en/permissions", "https://code.claude.com/docs/en/env-vars"]
---

> shanraisshan의 「[claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice)」(MIT) 중 설정 문서(2026-11-11, v2.1.322 기준)와 전역·프로젝트 설정 리포트를 바탕으로, 공식 [Settings](https://code.claude.com/docs/en/settings) 문서와 대조해 재구성한 노트다.

## 설정이란

Claude Code의 동작(시작 모델, 묻지 않고 실행할 것, 읽으면 안 되는 파일, 화면 표시, 조직이 강제하는 정책)은 JSON 설정 파일의 키로 정한다. **어느 파일에 적느냐가 곧 누구에게 적용되느냐**다. 지시문(CLAUDE.md)은 모델이 잊을 수 있지만, 설정은 하네스가 강제한다. 그래서 「Co-Authored-By를 절대 넣지 마」를 CLAUDE.md에 쓰기보다 `attribution.commit: ""`로 설정하는 편이 확실하다.

입문용 개요(권한 모드, 팀 공유 계층, 계정 분리)는 [[claude-code-guide|Claude Code 활용 가이드]]에 있다. 이 노트는 설정 파일 자체를 깊게 다룬다.

## 계층과 우선순위

높은 쪽이 같은 키를 덮어쓴다.

| 순위 | 위치 | 범위 | 용도 |
| --- | --- | --- | --- |
| 1 | 관리 설정(managed settings) | 조직 | 개인이 덮어쓸 수 없는 보안 정책. `--settings`도 못 이긴다 |
| 2 | 명령줄 `--settings <파일\|JSON>` | 이번 세션 | 파일을 바꾸지 않고 한 세션만 시험 |
| 3 | `.claude/settings.local.json` | 이 프로젝트, 나만 | 개인 덮어쓰기. Claude Code가 처음 쓸 때 전역 git excludes에 넣는다 |
| 4 | `.claude/settings.json` | 이 프로젝트, 팀 전원 | 커밋해서 공유하는 권한·훅·플러그인 |
| 5 | `~/.claude/settings.json` | 내 모든 프로젝트 | 개인 기본값 |

- `~/.claude.json`은 Claude Code가 스스로 쓰는 다섯 번째 파일이다. 계정 정보, 사용자 범위 MCP 서버, 프로젝트별 신뢰 결정, `/config`가 쓰는 전역 키(`autoConnectIde`, `diffTool`, `externalEditorContext` 등)가 들어 있다.
- **환경변수는 계층이 아니다.** 키와 변수가 짝을 이루면 짝마다 규칙이 따로 있다. 셸에서 export한 `ANTHROPIC_MODEL`은 어느 파일의 `model`보다 이기고, `ANTHROPIC_DEFAULT_MODEL`은 어느 파일에도 `model`이 없을 때만 쓰인다.
- `/status`의 `Setting sources` 줄로 실제로 읽힌 파일을 확인하고, 거부된 항목은 `claude doctor`로 본다. 파일은 엄격한 JSON이라 주석·끝 쉼표가 있으면 오류다.

### 목록은 합쳐진다

`permissions.allow` 같은 배열은 덮어쓰지 않고 **모든 계층을 이어 붙인다.** 그래서 각 파일은 항목을 더할 수만 있다. 예외는 모델 관련 넷이다.

| 키 | 규칙 |
| --- | --- |
| `fallbackModel` | 순서가 의미를 가지므로 가장 높은 파일의 값을 통째로 쓴다 |
| `modelPicker` | 관리·`--settings`·사용자 중 가장 높은 값만. 프로젝트·로컬에서는 무시 |
| `availableModels` | 관리 설정에 있으면 그대로 쓰고 하위 계층의 추가를 무시 |
| `modelSettings` | 모델별로 `effortLevel`과 함께 따로 해석 |

### 프로젝트 파일은 신뢰가 필요하다

커밋된 `.claude/settings.json`의 `permissions.allow`, `additionalDirectories`, `extraKnownMarketplaces`, 대부분의 `env`는 **각자 그 폴더를 신뢰한 뒤에야** 적용된다. `deny`·`ask`는 바로 적용된다. 추적되지 않는 `settings.local.json`의 allow는 신뢰 단계 없이 적용된다. 하위 폴더에서 시작해도 로컬 파일은 저장소 루트에 둔다(v2.1.211부터).

## 저장소가 스스로 권한을 올리지 못하게

악의적인 저장소가 커밋한 설정으로 권한을 넓히지 못하도록, 일부 키는 프로젝트·로컬 파일에서 **무시된다**.

| 무시되는 것 | 예 |
| --- | --- |
| 위험한 기본 모드 | `permissions.defaultMode`의 `"auto"`, `"bypassPermissions"`(v2.1.257부터). 사용자·관리 설정이나 `--permission-mode`로만 |
| 우회 확인 생략·분류기 조정 | `skipDangerousModePermissionPrompt`, `autoMode`, `useAutoModeDuringPlan`(프로젝트) |
| 실행 경로를 바꾸는 키 | `processWrapper`, `pluginConfigs`, `sshConfigs`, `modelPicker`, `askUserQuestionTimeout` |
| 샌드박스 완화 | `sandbox.filesystem.disabled`, `sandbox.network.strictAllowlist`, `sandbox.network.tlsTerminate` |
| `env`의 텔레메트리 내보내기 변수 | 끄는 값 몇 개만 예외 |

반대로 **더 엄격한 값은 낮은 계층에서도 이긴다**: `permissions.blockReadsOutsideWorkingDirectories: true`, `blockWritesOutsideWorkingDirectories: true`, `disableClaudeAiConnectors: true`, `maxEffortLevel`(가장 낮은 상한), `crossSessionInbound`(`accept` < `hold` < `refuse`), 프로젝트의 `remoteControlAtStartup: false`.

## 전역과 프로젝트에 두는 것

원칙은 **개인 상태와 프로젝트를 넘는 조율은 전역, 팀이 공유할 프로젝트 설정은 프로젝트**다.

| 전역에만 | 위치 | 이유 |
| --- | --- | --- |
| 작업 목록(Tasks) | `~/.claude/tasks/` | 세션·에이전트를 넘는 조율 상태 |
| 에이전트 팀 | `~/.claude/teams/{team}/config.json` | 조율 상태 |
| 자동 메모리 | `~/.claude/projects/<프로젝트>/memory/` | 개인 학습. 프로젝트에 관한 것이지만 공유하지 않는다 |
| 자격 증명 | 키체인 + `~/.claude.json` | 실수 커밋 방지 |
| 키 바인딩 | `~/.claude/keybindings.json` | 손에 익은 습관 |

| 양쪽에 다 있는 것 | 전역 | 프로젝트 | 관계 |
| --- | --- | --- | --- |
| CLAUDE.md, rules, agents | `~/.claude/…` | `.claude/…` | 이름이 같으면 프로젝트가 덮는다 |
| commands, skills, hooks | `~/.claude/…` | `.claude/…` | 둘 다 쓴다(훅은 둘 다 실행) |
| MCP 서버 | `~/.claude.json` | `.mcp.json` | 로컬 > 프로젝트 > 사용자 |

## 권한 규칙

```json
{ "permissions": {
  "allow": ["Edit(*)", "Bash(npm run *)", "Bash(git *)", "WebFetch(domain:*)", "mcp__memory__*"],
  "ask":   ["Bash(rm *)", "Bash(git push *)"],
  "deny":  ["Read(.env)", "Read(./secrets/**)", "Bash(curl *)"],
  "additionalDirectories": ["../shared-libs/"] } }
```

평가 순서는 **deny → ask → allow**이고 처음 맞는 규칙이 이긴다. 로컬 파일에 「Yes, and don't ask again」으로 쌓인 allow도 프로젝트·관리 파일의 ask를 이기지 못한다.

### 도구별 문법

| 도구 | 문법 | 비고 |
| --- | --- | --- |
| Bash | `Bash(npm run *)`, `Bash(* install)`, `Bash(git * main)` | 아래 「Bash 매칭」 |
| PowerShell | `PowerShell(cmd *)` | `gci`·`ls`·`dir`는 `Get-ChildItem`으로 정규화 |
| Read·Edit | `Read(.env)`, `Edit(src/**)` | gitignore식 경로 패턴 |
| Write·NotebookEdit·Glob | 경로 패턴 | **deny·ask에서만 유효.** allow에 쓰면 무시되고 경고. allow 평가는 `Read`·`Edit`만 본다 |
| WebFetch | `WebFetch(domain:example.com)` | |
| Agent(구 Task) | `Agent(Explore)`, `Agent(*)` | 띄울 수 있는 서브에이전트 제한 |
| MCP | `mcp__github__*`, `mcp__memory__create_entities` | |
| 파라미터 | `Agent(model:opus)`, `Bash(run_in_background:true)` | deny·ask 전용. `Bash(command:rm *)`처럼 본문 필드는 금지 |
| 전면 차단 | `"deny": ["*"]` | 이후 개별 allow로 허용 목록 방식을 만든다 |

- allow의 도구 이름 글롭은 `mcp__<서버>__` 뒤에서만 인정된다. `"*"`, `"mcp__*"`를 allow에 넣으면 경고 후 무시된다.
- 심링크는 allow면 링크와 대상이 **둘 다**, deny면 **둘 중 하나만** 맞아도 적용된다.

### Read·Edit 경로 접두사

| 접두사 | 기준 | 예 |
| --- | --- | --- |
| `//` | 파일시스템 루트 | `Read(//Users/alice/file)` |
| `~/` | 홈 | `Read(~/.zshrc)` |
| `/` | **프로젝트 루트**(세션의 주 작업 폴더) | `Edit(/src/**)` |
| `./` 또는 없음 | 현재 폴더 | `Read(*.ts)` |

샌드박스 `filesystem.*` 경로에서는 `/`가 절대 경로라 의미가 다르다.

### Bash 매칭

- `Bash(ls *)`(공백 있음)는 `ls -la`는 맞지만 `lsof`는 아니다. `Bash(ls*)`는 둘 다 맞는다. `Bash(npm:*)` 접미 문법도 끝에서만 인식된다.
- **복합 명령은 쪼개서 각각 검사한다.** `&&`, `||`, `;`, `|`, `&`, 줄바꿈으로 나누므로 `Bash(safe-cmd *)`가 `safe-cmd && other-cmd`를 허용하지 않는다.
- `timeout`, `time`, `nice`, `nohup`, `stdbuf`, 플래그 없는 `xargs` 같은 래퍼는 벗기고 검사한다. `watch`, `setsid`, `flock`, `find -exec`·`-delete`는 항상 묻는다.

## 권한 모드별 세부

모드의 개념과 자동 모드 분류기는 [[claude-code-guide|활용 가이드의 「권한 모드」]]에 있다. 여기서는 놓치기 쉬운 동작만 적는다.

| 모드 | 세부 |
| --- | --- |
| `default` | `manual`은 같은 뜻의 별칭(v2.1.200). 클라우드·원격 세션은 `acceptEdits`, `plan`, `default`, `auto`만 받는다 |
| `acceptEdits` | 코드 실행 경로가 되는 빌드 설정(`.npmrc`, `.yarnrc*`, `bunfig.toml`, `.bazelrc`, `.pre-commit-config.yaml`, `.devcontainer/`), 셸 시작 파일(`.zshenv` 등), `~/.config/git/`은 편집해도 항상 묻는다 |
| `plan` | `Edit(...)` allow 규칙이 있어도 쓰기를 막는다 |
| `auto` | `autoMode` 키로 분류기를 조정한다: `environment`, `allow`, `soft_deny`, `hard_deny`(예외로도 못 푸는 차단)는 산문 배열이다. `allow`·`soft_deny`를 쓰면 기본 목록을 **교체**하므로 `"$defaults"`를 넣어 기본 규칙을 유지한다. 기본 규칙은 `claude auto-mode defaults`로 본다. 끄려면 최상위 `disableAutoMode: "disable"` |
| `dontAsk` | allow해도 MCP 매니페스트의 `requiresUserInteraction` 도구와 조직이 ask로 지정한 커넥터는 거부한다 |
| `bypassPermissions` | 그래도 루트·홈 삭제(`rm -rf /`, `rm -rf ~`), `requiresUserInteraction` 도구, 명시적 `permissions.ask` 규칙은 묻는다 |

무인 실행용 키: `permissions.denyInsteadOfPrompting`(프롬프트가 뜰 호출을 바로 거부해 턴이 멈추지 않게, v2.1.319+), `permissions.blockWritesOutsideWorkingDirectories`(작업 폴더 밖 쓰기 차단).

## 주요 설정 키

키는 수백 개다(v2.1.322 기준 249개 이상, 환경변수 400개 이상). 전체 목록은 [공식 설정 레퍼런스](https://code.claude.com/docs/en/settings-reference)에서 찾고, 여기서는 자주 손대는 것만 묶는다.

| 분류 | 키 | 하는 일 |
| --- | --- | --- |
| 일반 | `$schema` | `https://json.schemastore.org/claude-code-settings.json`으로 편집기 자동 완성 |
| | `agent` | 메인 대화의 기본 에이전트(`--agent`와 같음) |
| | `language` | 응답 언어, 음성 받아쓰기, 세션 제목 언어 |
| | `claudeMdExcludes` | 건너뛸 CLAUDE.md 글롭(`["**/vendor/**/CLAUDE.md"]`) |
| | `cleanupPeriodDays` | 비활성 기록·고아 worktree 정리 기준(기본 30) |
| | `includeGitInstructions` | 커밋·PR 지침과 git status를 시스템 프롬프트에 넣을지 |
| 맥락 | `autoCompactEnabled`, `autoCompactWindow` | 자동 압축과 압축 시점 토큰(100,000~1,000,000) |
| | `plansDirectory` | 계획 모드 결과 저장 위치 |
| | `autoMemoryEnabled`, `fileCheckpointingEnabled` | 자동 메모리, `/rewind`용 스냅샷 |
| 스킬 | `skillOverrides` | 스킬별 `"on"`/`"name-only"`/`"user-invocable-only"`/`"off"` |
| | `disableSkillShellExecution` | 스킬·명령의 `` !`...` `` 셸 주입 금지 |
| 모델 | `model`, `availableModels`, `fallbackModel`, `effortLevel`, `maxEffortLevel` | 모델 선택과 비용 통제. `/effort`는 `modelSettings`에 모델별로 저장된다 |
| 커밋 | `attribution.commit`, `attribution.pr` | 커밋 트레일러·PR 문구. `""`이면 숨김(`includeCoAuthoredBy`는 폐기) |
| 워크트리 | `worktree.symlinkDirectories`, `worktree.baseRef` | worktree에 심링크할 폴더(`["node_modules"]`), 기준 브랜치 `"fresh"`/`"head"` |
| 훅 | `hooks`, `disableAllHooks`, `allowManagedHooksOnly` | [[claude-code-hooks\|Claude Code 훅]] |
| 표시 | `outputStyle`, `theme`, `tui`, `spinnerVerbs`, `preferredNotifChannel` | 출력 스타일(`"Explanatory"` 등), 전체 화면 TUI, 알림 채널 |
| 환경 | `env` | 세션에 넣을 환경변수. 래퍼 스크립트가 필요 없어진다 |

### 상태줄

```json
{ "statusLine": { "type": "command", "command": "~/.claude/statusline.sh", "padding": 2, "refreshInterval": 5 } }
```

스크립트는 stdin으로 JSON을 받는다. 자주 쓰는 필드는 `model.display_name`, `workspace.current_dir`, `context_window.used_percentage`, `cost.total_cost_usd`, `rate_limits.five_hour.*`, `effort.level`, `pr.number`다. 맥락 사용률을 늘 보이게 두면 압축·초기화 시점을 잡기 쉽다. `/statusline`에 원하는 모양을 말하면 Claude가 스크립트를 만든다.

### 샌드박스

`/sandbox`로 켜는 오픈소스 샌드박스 런타임은 bash의 파일·네트워크 접근을 OS 수준에서 가둔다. 안에서 도는 bash는 자동 승인되므로 권한 프롬프트가 크게 줄어든다.

| 키 | 하는 일 |
| --- | --- |
| `sandbox.enabled`, `sandbox.failIfUnavailable` | 켜기, 못 띄우면 종료 |
| `sandbox.autoAllowBashIfSandboxed` | 샌드박스 안 bash 자동 승인(기본 `true`) |
| `sandbox.excludedCommands` | 밖에서 돌릴 명령(`["git","docker","gh"]`) |
| `sandbox.network.allowedDomains`, `deniedDomains` | 도메인 허용·차단(`"*.example.com"`) |
| `sandbox.filesystem.allowWrite`, `denyRead` | 경로 목록. 권한 규칙의 `Edit`·`Read`와도 합쳐진다 |
| `sandbox.credentials.files[]`, `envVars[]` | 자격 증명을 `deny`하거나 가짜 값으로 `mask` |

### MCP와 플러그인 거버넌스

- `.mcp.json` 서버는 자동 승인되지 않는다(v2.1.196부터). `enableAllProjectMcpServers` 또는 `enabledMcpjsonServers`·`disabledMcpjsonServers`로 고른다.
- 조직은 `allowedMcpServers`·`deniedMcpServers`(이름·명령·URL 글롭), `allowManagedMcpServersOnly`로 통제한다. `disableClaudeAiConnectors`는 claude.ai 커넥터 자동 로드를 끈다.
- 플러그인은 `enabledPlugins`(`{"formatter@acme-tools": true}`)와 `extraKnownMarketplaces`로 팀에 배포한다. 관리 전용 `strictKnownMarketplaces`는 빈 배열이면 공식 마켓까지 막는다.

## 관리 설정

조직은 서버 관리 설정(claude.ai 콘솔), MDM(macOS plist `com.anthropic.claudecode`, Windows `HKLM\SOFTWARE\Policies\ClaudeCode`), 파일(`/Library/Application Support/ClaudeCode/`, `/etc/claude-code/`, `C:\Program Files\ClaudeCode\`의 `managed-settings.json`)로 정책을 내린다.

- `managed-settings.d/*.json` 드롭인 폴더는 systemd처럼 알파벳순으로 위에 합친다. `10-telemetry.json`, `20-security.json`처럼 숫자로 순서를 정한다.
- 관리 전용 키: `allowManagedPermissionRulesOnly`(사용자·프로젝트 규칙 무시), `requiredMinimumVersion`·`requiredMaximumVersion`(버전 범위 밖이면 시작 거부), `forceRemoteSettingsRefresh`(원격 정책을 받기 전까지 시작 차단), `claudeMd`(조직 메모리로 주입할 문구).

## 환경변수

`settings.json`의 `env`로 넣거나 셸에서 export한다. 인증 관련 변수(`CLAUDE_CONFIG_DIR`, `ANTHROPIC_API_KEY`, `CLAUDE_CODE_OAUTH_TOKEN`)는 [[claude-code-guide|활용 가이드의 「계정과 인증」]]에 있다.

| 분류 | 변수 | 의미 |
| --- | --- | --- |
| 제공자 | `CLAUDE_CODE_USE_BEDROCK`, `_VERTEX`, `_FOUNDRY` = `1` | 클라우드 제공자 전환 |
| 게이트웨이 | `ANTHROPIC_BASE_URL`, `ANTHROPIC_CUSTOM_HEADERS` | 프록시·게이트웨이 |
| 서브에이전트 | `CLAUDE_CODE_SUBAGENT_MODEL` | 서브에이전트 기본 모델(에이전트 정의의 `model`이 우선, 강제는 `_FORCE`) |
| | `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`(20), `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`(3) | 동시 실행 수, 중첩 깊이 |
| 추론 | `CLAUDE_CODE_EFFORT_LEVEL` | `/effort`와 `effortLevel`보다 우선 |
| | `MAX_THINKING_TOKENS` | `0`이면 thinking 끔 |
| 맥락 | `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 자동 압축 시점(기본 약 95%, 예 `50`) |
| | `CLAUDE_CODE_DISABLE_1M_CONTEXT`, `DISABLE_AUTO_COMPACT` | |
| MCP | `MCP_TIMEOUT`, `MCP_TOOL_TIMEOUT`, `MAX_MCP_OUTPUT_TOKENS`(25000) | 시작·실행 시간 제한, 출력 상한 |
| | `ENABLE_TOOL_SEARCH`(예 `auto:5`) | MCP 도구 지연 로딩 임계값(맥락 %) |
| Bash | `BASH_DEFAULT_TIMEOUT_MS`, `BASH_MAX_OUTPUT_LENGTH` | |
| | `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR=1` | 명령마다 원래 작업 폴더로 복귀 |
| 안전 | `CLAUDE_CODE_SAFE_MODE=1` | `--safe-mode`와 같음. CLAUDE.md·스킬·플러그인·훅·MCP를 읽지 않는다 |
| | `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` | 하위 프로세스 환경에서 자격 증명 제거 |
| 작업 목록 | `CLAUDE_CODE_TASK_LIST_ID` | 같은 ID 세션끼리 작업 목록 공유 |
| 트래픽 | `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | 자동 업데이트·피드백·오류 보고·텔레메트리 일괄 끄기 |
| 렌더링 | `CLAUDE_CODE_NO_FLICKER=1` | 깜빡임 없는 전체 화면 렌더링 |
| 감지용(주입됨) | `CLAUDECODE=1`, `CLAUDE_CODE_SESSION_ID`, `CLAUDE_EFFORT` | 스크립트가 「Claude가 띄웠나」를 안다 |

## 정리

- 설정은 **관리 > CLI > 로컬 > 프로젝트 > 사용자** 순으로 덮어쓰고, 배열은 합쳐진다. 팀 규칙은 `.claude/settings.json`에 커밋하고 개인 예외는 `settings.local.json`에 둔다.
- 저장소 파일은 권한을 넓히는 키를 쓸 수 없고, 더 엄격한 값은 어느 계층에서든 이긴다.
- 권한은 **deny → ask → allow** 순서다. Bash 복합 명령은 쪼개서 검사되고, `Write`·`Glob` 규칙은 allow에서 무시된다는 점을 기억한다.
- 모델이 지켜야 할 규칙 중 하네스가 강제할 수 있는 것(attribution, 권한, 모델, 샌드박스)은 CLAUDE.md가 아니라 설정으로 옮긴다.

관련 노트: [[claude-code-guide|Claude Code 활용 가이드]], [[claude-code-hooks|Claude Code 훅]], [[claude-code-commands|Claude Code 명령어·플래그 레퍼런스]], [[claude-code-memory|Claude Code 메모리]], [[agent-trust-environment|에이전트를 믿을 수 있는 환경 만들기]]
