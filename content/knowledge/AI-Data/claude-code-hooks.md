---
title: "Claude Code 훅: 도구 호출 앞뒤에 규칙 걸기"
concept: "Claude Code Hooks"
summary: "훅은 Claude Code의 특정 시점(도구 실행 전후, 응답 종료, 압축 전 등)에 내 명령을 자동으로 실행하는 장치다. 포맷터·타입 검사·민감 파일 차단처럼 모델에게 부탁하지 않고 반드시 지켜야 하는 규칙을 건다. 이벤트 종류, 설정 위치와 matcher, 표준 입력 JSON과 종료 코드 2의 의미, .env 읽기 차단 예제, 유용한 훅, 보안 주의점과 디버깅 방법을 정리했다."
tags: ["ai", "claude-code", "agentic-coding", "automation", "security"]
source: other
date: "2026-10-20"
sources: ["https://gayuna.github.io/llm/claude-code/", "https://anthropic.skilljar.com/claude-code-in-action", "https://code.claude.com/docs/en/hooks", "https://code.claude.com/docs/en/hooks-guide"]
---

> Anthropic 강의 「[Claude Code in Action](https://anthropic.skilljar.com/claude-code-in-action)」을 정리한 hello.gayuna의 「[Claude Code in Action](https://gayuna.github.io/llm/claude-code/)」(2025.09)을 바탕으로, 이벤트·설정·출력 형식은 [훅 공식 문서](https://code.claude.com/docs/en/hooks)로 2026년 기준에 맞춰 재구성한 노트다.

## 훅이란

**훅(hook)** 은 Claude Code가 일하는 특정 시점에 자동으로 실행되는 사용자 명령이다. CLAUDE.md에 「수정 후엔 포맷터를 돌려라」라고 적는 것은 부탁이라 모델이 잊을 수 있다. 훅은 **모델의 판단과 무관하게 항상 실행**된다. 반드시 지켜야 하는 규칙은 훅으로, 판단이 필요한 지침은 CLAUDE.md로 나눈다.

| 쓰임 | 예 |
| --- | --- |
| 코드 포맷 | Claude가 파일을 고친 뒤 자동으로 포맷터 실행 |
| 테스트·품질 | 파일이 바뀌면 테스트, 린터, 타입 검사를 돌리고 결과를 Claude에게 돌려준다 |
| 접근 통제 | 특정 파일을 읽거나 고치지 못하게 막는다 |
| 기록 | Claude가 어떤 파일을 읽고 고쳤는지 남긴다 |
| 검증 | 이름 규칙, 코딩 표준을 확인한다 |

## 주요 이벤트

| 묶음 | 이벤트 | 시점 |
| --- | --- | --- |
| 도구 | `PreToolUse` | 도구 실행 **전**. 호출을 막거나 입력을 바꿀 수 있다 |
| | `PostToolUse` / `PostToolUseFailure` | 도구가 성공한 뒤 / 실패한 뒤. 이미 실행됐으므로 막지는 못하고 피드백을 준다 |
| | `PermissionRequest` | 도구 호출에 권한 결정이 필요할 때 |
| 턴 | `UserPromptSubmit` | 사용자가 프롬프트를 보낸 직후, Claude가 처리하기 전 |
| | `Stop` | Claude가 응답을 마쳤을 때. 일을 계속하게 할 수도 있다 |
| 세션 | `SessionStart` / `SessionEnd` | 세션 시작·재개 / 종료 |
| 서브에이전트 | `SubagentStart` / `SubagentStop` | 서브에이전트 시작 / 종료 |
| 맥락 | `PreCompact` / `PostCompact` | 대화 압축 전후 |
| | `InstructionsLoaded` | CLAUDE.md나 규칙 파일이 읽힐 때 |
| 알림 | `Notification` | 권한 요청이 필요하거나 일정 시간 입력을 기다릴 때 |

이 밖에도 작업 디렉터리 변경, 파일 변경 감시, 워크트리 생성, 모델 전환 같은 이벤트가 있다. 전체 목록은 [공식 문서](https://code.claude.com/docs/en/hooks)에 있다.

## 설정

훅은 설정 파일의 `hooks` 아래에 **이벤트 → matcher 묶음 → 실행할 핸들러** 세 단계로 적는다. 직접 편집하거나 `/hooks` 명령으로 추가한다.

| 위치 | 범위 |
| --- | --- |
| `~/.claude/settings.json` | 내 모든 프로젝트 |
| `.claude/settings.json` | 이 프로젝트, git으로 팀과 공유 |
| `.claude/settings.local.json` | 이 프로젝트, 나만 (gitignore) |
| 조직 정책(managed settings) | 조직 전체, 관리자가 통제 |
| 플러그인 `hooks/hooks.json`, 스킬·서브에이전트 frontmatter | 해당 플러그인·스킬이 켜져 있는 동안 |

- **matcher**: 도구 이벤트에서는 도구 이름을 거른다. `Read|Grep`처럼 `|`로 여러 개, `mcp__playwright__.*`처럼 정규식, `*`나 생략이면 전부다.
- **핸들러 종류**: 셸 명령(`command`)이 기본이다. JSON을 URL로 보내는 `http`, MCP 도구를 부르는 `mcp_tool`, 모델에게 한 번 판단을 맡기는 `prompt`도 있다.
- 경로는 `${CLAUDE_PROJECT_DIR}`로 프로젝트 기준 절대 경로를 쓰고, 인자는 `args`로 넘기면 따옴표·공백 문제가 없다.

## 입력과 종료 코드

훅 명령은 **표준 입력으로 JSON**을 받는다. `PreToolUse`라면 어떤 도구를 어떤 인자로 부르려는지가 들어 있다.

```json
{
  "session_id": "2d6a1e4d-6...",
  "transcript_path": "/Users/sg/...",
  "hook_event_name": "PreToolUse",
  "tool_name": "Read",
  "tool_input": { "file_path": "/code/queries/.env" }
}
```

| 종료 코드 | 의미 |
| --- | --- |
| `0` | 성공. 표준 출력이 JSON 객체 하나면 결정·메시지로 해석한다 |
| `2` | **막는다.** 표준 오류(stderr)의 내용이 이유로 Claude에게 전달된다. 막을 수 없는 이벤트(`PostToolUse` 등)에서는 Claude에게 피드백만 준다 |
| 그 밖 | 막지 않는 오류. 작업은 계속되고 사용자에게 알림만 뜬다 |

더 세밀하게 제어하려면 종료 코드 0과 함께 JSON을 출력한다. 예를 들어 `PreToolUse`에서 `hookSpecificOutput.permissionDecision`을 `"deny"`로 주면 이유와 함께 막고, `additionalContext`로 Claude에게 참고 정보를 더할 수 있다.

## 예제: .env 파일 읽기 막기

Claude가 `.env`를 읽지 못하게 하려면 `PreToolUse`에서 `Read`와 `Grep`을 감시한다. 개인용이라면 `.claude/settings.local.json`에 둔다.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Grep",
        "hooks": [
          { "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/hooks/read_hook.js\"" }
        ]
      }
    ]
  }
}
```

```js
// hooks/read_hook.js
async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const toolArgs = JSON.parse(Buffer.concat(chunks).toString());

  // Claude가 읽으려는 경로
  const readPath = toolArgs.tool_input?.file_path || toolArgs.tool_input?.path || "";

  if (readPath.includes(".env")) {
    console.error("You cannot read the .env file");
    process.exit(2); // 막고, stderr를 이유로 전달
  }
}
main();
```

단순한 경로 차단은 훅 대신 권한 규칙(`permissions.deny`에 `Read(./.env)`)으로도 걸 수 있다. 공식 문서도 확실한 허용·차단은 권한 체계에 맡기고, 훅은 판단 로직이 필요한 곳에 쓰라고 권한다.

## 유용한 훅

| 훅 | 동작 |
| --- | --- |
| 타입 검사 | `.ts` 파일이 수정될 때마다(`PostToolUse`, matcher `Edit\|Write`) `tsc --noEmit`을 돌리고, 오류가 나면 종료 코드 2로 오류 내용을 Claude에게 돌려준다. Claude가 바로 고친다 |
| 쿼리 중복 방지 | 새 쿼리 파일을 만들려 할 때 별도의 Claude(`claude -p`)를 띄워 비슷한 쿼리가 이미 있는지 묻고, 있으면 막고 기존 것을 쓰게 한다 |
| 포맷터 | 편집 뒤 Prettier·Black 등을 자동 실행 |
| 알림 | `Notification`·`Stop`에서 데스크톱 알림을 띄워 자리를 비워도 끝난 것을 안다 |

## 주의점

### 보안

훅은 **내 사용자 권한 그대로** 실행된다. 남이 만든 저장소의 프로젝트 훅은 실행 전에 내용을 확인한다.

- 입력 JSON을 믿지 말고 검증한다.
- 셸 변수는 항상 따옴표로 감싼다(`$VAR`가 아니라 `"$VAR"`).
- 경로에 `..`가 있는지 확인해 경로 순회를 막는다.
- 스크립트는 **절대 경로**로 지정한다. 경로 가로채기·바이너리 심기 공격을 줄인다.
- `.env`, `.git/`, 키 파일 같은 민감한 파일은 건너뛴다.
- 훅이 시간 초과되면 기본적으로 작업이 그대로 진행된다(fail-open). 막는 용도라면 `onFailure: "block"`을 준다.

### 절대 경로와 공유의 충돌

절대 경로는 머신마다 달라 설정 파일을 공유하기 어렵다. `${CLAUDE_PROJECT_DIR}` 변수로 프로젝트 기준 절대 경로를 만들면 같은 설정을 팀이 그대로 쓴다. 과거에는 자리표시자를 넣은 예제 설정을 커밋하고 초기화 스크립트로 머신별 경로를 채워 넣었다.

### 입력 형식 확인하기

표준 입력의 모양은 이벤트마다, `tool_input`은 도구마다 다르다. 훅을 짜기 전에 실제 입력을 파일로 떨궈 본다.

```json
"PostToolUse": [
  { "matcher": "*", "hooks": [ { "type": "command", "command": "jq . > post-log.json" } ] }
]
```

## 정리

- 훅은 모델에게 부탁하는 대신 시스템이 항상 실행하는 규칙이다.
- `PreToolUse`는 막을 수 있고, `PostToolUse`는 결과를 보고 피드백을 준다.
- 표준 입력으로 JSON을 받고, 종료 코드 2와 stderr로 막고 이유를 전한다.
- 타입 검사·포맷터·민감 파일 차단처럼 확인 가능한 규칙에 쓴다. 단순 차단은 권한 규칙으로도 된다.
- 훅은 내 권한으로 돈다. 입력 검증, 절대 경로, 따옴표를 지킨다.

관련 노트: [[claude-code-guide|Claude Code 활용 가이드]], [[ai-coding-guardrails|AI 코딩 실무 가드레일]], [[harness-engineering|프롬프트에서 하네스로]], [[personal-agent-harness|내 일을 줄이는 하네스 만들기]]
