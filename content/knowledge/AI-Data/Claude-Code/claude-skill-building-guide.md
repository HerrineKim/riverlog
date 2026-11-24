---
title: "Claude 스킬 만들기 가이드"
concept: "Claude Skills"
summary: "Anthropic의 스킬 제작 가이드 요점: 3단계 프로그레시브 디스클로저, 트리거를 담은 description과 when_to_use, 폴더·이름 규칙, Claude Code 프론트매터 필드 전체, 모노레포에서 스킬을 찾는 규칙, 스킬의 아홉 가지 유형과 gotchas 중심 작성법, 테스트와 증상별 대응, 스킬 목록을 출처별로 재고 skillOverrides로 줄이는 법, 배포 방식과 팀 공용 스킬 패키지화·사내 마켓플레이스, 실전 패턴 5가지."
tags: ["ai", "llm", "claude-code", "skills", "mcp", "agent"]
source: other
date: "2026-11-24"
sources: ["https://riverkim.kr/328", "https://agentskills.io/specification", "https://code.claude.com/docs/en/skills", "https://code.claude.com/docs/en/mcp", "https://code.claude.com/docs/en/settings-reference", "https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-skills.md", "https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-skills-for-larger-mono-repos.md", "https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-17-mar-26.md"]
---

> baho.dev의 글 「[Anthropic의 스킬 가이드를 읽혔다: 챕터별 핵심 정리](https://baho.dev/blog/anthropic-skill-guide/)」(Jihye Song, 2026.02)를 요약·재구성한 노트다. 원 자료는 Anthropic이 공개한 PDF 「The Complete Guide to Building Skills for Claude」이고, 형식 규칙은 [Agent Skills 명세](https://agentskills.io/specification)와 [Claude Code 스킬 문서](https://code.claude.com/docs/en/skills)로 확인했다. 공식 예제는 [anthropics/skills](https://github.com/anthropics/skills) 저장소에 있다. 프론트매터 필드·모노레포 로딩·스킬 유형은 shanraisshan의 「[claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice)」(MIT, 2026-11 v2.1.325 기준)와 거기 정리된 Thariq(Anthropic)의 스킬 글(2026.03)로 보강했다. 스킬 목록 줄이기는 [MCP 문서](https://code.claude.com/docs/en/mcp)와 [설정 레퍼런스](https://code.claude.com/docs/en/settings-reference), 그리고 직접 확인한 동작으로 썼다.

## 스킬의 구조: 3단계 프로그레시브 디스클로저

스킬은 한 번에 다 읽히지 않고 필요한 만큼만 단계적으로 로딩된다. LLM 버전의 지연 로딩(lazy loading)이다.

| 단계 | 내용 | 언제 읽히나 |
| --- | --- | --- |
| 1 | YAML 프론트매터 (`name`, `description`), 스킬당 약 100토큰 | 항상 시스템 프롬프트에 들어간다. 스킬을 쓸지 판단하는 데만 쓰인다 |
| 2 | `SKILL.md` 본문 | 관련 있다고 판단될 때 |
| 3 | `references/` 등 링크된 파일 | 본문이 가리키고, 실제로 필요할 때 |

| 설계 원칙 | 뜻 |
| --- | --- |
| 합성성 | 여러 스킬이 동시에 로딩될 수 있다. 내 스킬만 단독으로 쓰인다고 가정하지 않는다 |
| 이식성 | Claude.ai, Claude Code, API에서 똑같이 동작한다. Agent Skills는 개방형 표준이라 같은 폴더를 다른 에이전트 도구도 읽는다 |

**MCP는 주방이고 스킬은 레시피다.** MCP는 도구에 접근하게 해 줄 뿐이라, MCP만 있으면 사용자가 매번 사용법을 설명해야 한다. 스킬이 그 사용법을 담으면 워크플로가 알아서 켜지고 결과도 일관된다. 그래서 스킬의 쓰임은 세 갈래로 나뉜다.

| 유즈케이스 | 내용 |
| --- | --- |
| 문서·에셋 생성 | 문서, 디자인, 코드. Claude 기본 능력만으로 충분한 경우 |
| 워크플로 자동화 | 여러 단계 프로세스에 검증 게이트를 넣는 경우 |
| MCP 강화 | MCP 도구 위에 "어떻게 쓰는지"라는 워크플로 지식을 얹는 경우 |

## description이 전부다

`description`은 Claude가 스킬을 불러올지 결정하는 **유일한 단서**다. 시스템 프롬프트에 그대로 들어가므로 명세상 1,024자 이내여야 하고, claude.ai·API에 올릴 때는 XML 태그를 쓸 수 없다. **무엇을 하는가(what)** 와 **언제 쓰는가(when, 사용자가 실제로 칠 법한 트리거 문구)** 를 반드시 담고, 핵심 쓰임을 맨 앞에 둔다. description은 요약이 아니라 **모델에게 언제 발동할지 알려 주는 필드**다.

```yaml
# 나쁜 예: 언제 써야 하는지 알 수 없음
description: 프로젝트 관리를 돕는다.

# 좋은 예: 하는 일 + 트리거 문구
description: 스프린트 계획을 세우고 태스크를 생성한다. "sprint", "스프린트 계획", "create tickets" 같은 요청에 사용.
```

Claude Code에서는 트리거 문구를 `when_to_use` 필드로 따로 적을 수 있다. 스킬 목록에는 `description` 뒤에 `when_to_use`가 붙어 **합쳐서 1,536자**(`skillListingMaxDescChars`)에서 잘린다. 스킬 목록 전체도 맥락의 일정 비율(`skillListingBudgetFraction`, 예 `0.01`) 안에 들어가야 해서, 넘치면 덜 쓰는 스킬은 이름만 남는다. `/context`에서 제외 경고를 보고, `/skills`에서 `t`로 토큰순 정렬하고, `/skill-doctor`로 안 쓰는 스킬과 맥락 비용을 확인한다. 항목 수를 줄이는 방법은 아래 「스킬 목록 줄이기」에 있다.

## 폴더와 지시문 규칙

```text
your-skill/
├── SKILL.md      ← 필수, 파일명 정확히
├── scripts/      ← 선택: 실행할 스크립트
├── references/   ← 선택: 필요할 때 읽을 상세 문서
└── assets/       ← 선택: 템플릿, 이미지 등
```

| 규칙 | 내용 |
| --- | --- |
| 이름 | **소문자·숫자·하이픈만**, 64자 이내, 폴더명과 같게 (`my-skill` O, `My_Skill` X). claude.ai·API에 올리는 스킬은 `claude`, `anthropic`을 쓸 수 없다 |
| 프론트매터 | 명세상 `name`과 `description`이 필수다. Claude Code는 `name`이 없으면 폴더명을 쓰고, 아래 표의 확장 필드를 더 받는다 |
| README | 스킬 폴더 안에 두지 않는다. 설명은 `SKILL.md`나 `references/`로 |
| 분량 | `SKILL.md`는 **500줄 이내**(본문 5,000토큰 안팎). 핵심 지시는 맨 위에, 상세는 `references/`로 빼고 참조는 한 단계 깊이까지만 건다 |
| 지시문 | "데이터를 검증하라" 같은 모호한 말 대신 **실행할 명령**(`python scripts/validate.py input.csv`)을 적고, 실패했을 때 어떻게 할지(에러 처리)를 반드시 쓴다 |

### Claude Code 프론트매터 필드

| 필드 | 하는 일 |
| --- | --- |
| `name` | 표시 이름이자 `/이름` 식별자. 없으면 폴더명 |
| `description`, `when_to_use` | 하는 일과 트리거. description이 없으면 본문 첫 줄을 쓴다 |
| `argument-hint`, `arguments` | 자동 완성 힌트(`[issue-number]`), 이름 붙은 위치 인자(본문에서 `$name`으로 치환). `$ARGUMENTS`, `$0`, `$1`도 쓴다 |
| `disable-model-invocation` | `true`면 Claude가 스스로 부르지 못한다. 배포처럼 파괴적인 스킬에 쓴다. 서브에이전트 프리로드나 예약 작업 프롬프트로도 실행되지 않는다 |
| `user-invocable` | `false`면 `/` 메뉴에서 숨긴다. 에이전트에 프리로드할 배경지식용 |
| `allowed-tools`, `disallowed-tools` | 스킬을 부른 턴 동안 묻지 않고 쓸 도구, 빼 둘 도구(예: 백그라운드 루프에서 `AskUserQuestion` 차단). 다음 메시지에서 풀린다 |
| `model`, `effort` | 이번 턴만 다른 모델·추론 강도로 |
| `context: fork`, `agent`, `background` | 격리된 서브에이전트에서 돌리고 메인 맥락은 최종 결과만 받는다. `agent`로 서브에이전트 종류(기본 `general-purpose`)를 정하고, `background: false`면 같은 턴에서 결과를 기다린다 |
| `hooks` | 스킬을 부를 때 등록되어 세션 끝까지 유지되는 훅 |
| `paths` | 글롭. 맞는 파일을 다룰 때만 자동 활성 |
| `shell` | `` !`명령` `` 블록을 돌릴 셸(`bash` 기본, `powershell`) |
| `metadata`, `license`, `compatibility` | 자체 도구용 자유 맵, 명세 필드. Claude Code는 받기만 한다 |

본문에 `` !`명령` ``을 넣으면 스킬을 부를 때 그 셸 출력이 프롬프트에 주입되고 모델은 결과만 본다. 명령·스킬·서브에이전트 중 무엇을 고를지는 [[claude-code-extensions|커맨드·스킬·서브에이전트 고르기]]에 정리했다.

## 모노레포에서 스킬 찾기

스킬은 네 곳에서 읽힌다: 조직(관리 설정), 개인 `~/.claude/skills/`, 프로젝트 `.claude/skills/`, 플러그인 `<plugin>/skills/`. 이름이 겹치면 조직 > 개인 > 프로젝트 순으로 이기고, 플러그인 스킬은 `플러그인:스킬` 이름공간이라 겹치지 않는다.

모노레포에서는 CLAUDE.md와 규칙이 다르다([[claude-code-memory|Claude Code 메모리]]).

| | CLAUDE.md | 스킬 |
| --- | --- | --- |
| 조상 폴더 | 시작할 때 즉시 읽는다 | 시작 폴더부터 저장소 루트까지 `.claude/skills/`를 시작할 때 읽는다(링크된 worktree는 worktree 루트까지) |
| 하위 폴더 | 그 폴더 파일을 읽을 때 | `packages/frontend/.claude/skills/`처럼 중첩된 폴더는 그 안의 파일을 처음 읽거나 편집할 때 찾는다. 그 전에는 `/` 메뉴에도 없고, 미리 쓰려면 `/add-dir` |
| 읽는 양 | 전체 | description만, 본문은 부를 때 |

예를 들어 루트에서 시작하면 루트 `.claude/skills/`의 `shared-conventions`만 보이고, `packages/frontend/src/App.tsx`를 편집한 뒤에야 `react-patterns`가 더해진다. 반대로 `packages/frontend`에서 시작하면 둘 다 처음부터 보인다. 그래서 공용 워크플로는 루트에, 패키지 전용 스킬은 패키지 폴더에 두고, 이름에 패키지 접두사(`frontend-review`, `backend-deploy`)를 붙인다.

## 스킬의 아홉 가지 유형

좋은 스킬은 한 유형에 깔끔히 들어가고, 헷갈리는 스킬은 여러 유형에 걸쳐 있다.

| 유형 | 담는 것 | 예 |
| --- | --- | --- |
| 라이브러리·API 레퍼런스 | 참조 코드 조각 폴더와 gotcha 목록 | billing-lib, internal-platform-cli, frontend-design |
| 제품 검증 | Playwright·tmux 같은 외부 도구와 짝지은 검증 절차 | signup-flow-driver, checkout-verifier |
| 데이터 조회·분석 | 자격 증명이 붙은 조회 라이브러리, 대시보드 ID | funnel-query, cohort-compare |
| 업무 프로세스 자동화 | 이전 결과를 로그로 남겨 일관성 유지 | standup-post, weekly-recap |
| 스캐폴딩·템플릿 | 코드로 다 못 담는 자연어 요구 | new-migration, create-app |
| 코드 품질·리뷰 | 결정적 스크립트. 훅이나 GitHub Action에서 자동 실행 | adversarial-review, code-style |
| CI/CD·배포 | PR 돌보기, 배포, 체리픽 | babysit-pr, deploy-서비스명 |
| 런북 | 증상(Slack 스레드, 알림, 에러 시그니처) → 여러 도구 조사 → 구조화된 보고서 | oncall-runner, log-correlator |
| 인프라 운영 | 파괴적 작업에 가드레일 | 리소스명-orphans, cost-investigation |

제품 검증 스킬은 엔지니어 한 명이 일주일을 들여도 아깝지 않을 만큼 효과가 크다.

### 쓰는 법

| 원칙 | 방법 |
| --- | --- |
| **뻔한 것은 쓰지 않는다** | Claude가 이미 아는 것 말고, 기본 사고를 밀어내는 정보에 집중한다. 예: 디자인 스킬은 Inter 폰트·보라 그라데이션 같은 전형을 피하게 한다 |
| **Gotchas 섹션이 가장 신호가 높다** | Claude가 실제로 실패한 지점을 계속 채운다. 대부분의 사내 스킬은 몇 줄과 gotcha 하나로 시작해 자란다 |
| **레일에 올리지 않는다** | 단계별 처방보다 목표와 제약을 준다. 재사용되므로 과하게 구체적이면 해롭다 |
| **스크립트·라이브러리를 넣는다** | Claude가 보일러플레이트를 다시 만드는 대신 조합에 턴을 쓴다 |
| **셋업은 `config.json`에** | 사용자 맥락이 필요하면 스킬 폴더의 `config.json`에 저장하고, 없으면 `AskUserQuestion`으로 객관식 질문을 한다 |
| **스킬 안의 메모리** | append-only 로그, JSON, SQLite까지 둘 수 있다. 스킬 폴더는 업그레이드 때 지워질 수 있으니 플러그인 전용 안정 폴더 `${CLAUDE_PLUGIN_DATA}`를 쓴다 |
| **온디맨드 훅** | 스킬을 부를 때만 켜지는 훅. `/careful`은 `rm -rf`·`DROP TABLE`·force push를 막고, `/freeze`는 특정 폴더 밖 편집을 막는다([[claude-code-hooks\|Claude Code 훅]]) |
| **사용량을 잰다** | `PreToolUse` 훅으로 스킬 호출을 로깅해 인기 스킬과 언더트리거 스킬을 찾는다 |

## 테스트와 증상별 대응

**처음부터 범용 스킬을 설계하지 않는다.** 어려운 작업 하나를 먼저 성공시키고 그 방법을 스킬로 뽑아낸다. 구체적인 성공을 일반화하는 순서가 반대보다 훨씬 잘 된다.

| 테스트 | 확인할 것 |
| --- | --- |
| 트리거 테스트 | 관련 질문에선 뜨고, 무관한 질문에선 안 뜨는가 |
| 기능 테스트 | 결과가 정확한가, 에러를 제대로 처리하는가 |
| 성능 비교 | 스킬 유무에 따른 대화 횟수·토큰·API 실패 수. 가이드의 예시에서는 대화 15회 → 2회, 토큰 12,000 → 6,000, API 실패 3회 → 0회 |

성공 기준은 정량(관련 질문의 약 90%에서 스킬이 뜬다, API 실패 0건)과 정성(사용자가 "다음엔 뭐 해요?"라고 묻지 않고, 교정 없이 끝까지 가고, 세션이 바뀌어도 결과가 같다)으로 나눠 잡는다.

| 증상 | 원인 | 대응 |
| --- | --- | --- |
| 언더트리거 (안 뜸) | description에 단서 부족 | 키워드·트리거 문구 추가 |
| 오버트리거 (엉뚱할 때 뜸) | 범위가 너무 넓음 | "이럴 땐 쓰지 마라" 네거티브 트리거 추가 |
| 지시를 안 따름, 결과가 들쭉날쭉 | 지시가 너무 길거나, 중요한 내용이 중간에 묻혔거나, 모호함 | 핵심 지시를 맨 위로 올리고 `## Critical` 같은 헤더로 강조한다. **중요한 검증은 자연어 대신 스크립트로** 만든다. 스크립트는 매번 같은 결과를 낸다 |
| 전반적으로 느려짐 | 동시에 켜진 스킬이 20~50개를 넘음 | 관련 스킬을 "팩"으로 묶는다 |

## 스킬 목록 줄이기

스킬 목록은 세션마다 맥락에 실린다. 목록 예산 설정(`skillListingBudgetFraction`, `skillListingMaxDescChars`)은 설명 길이만 줄이고 **이름은 항상 남긴다.** 그래서 항목 수를 줄이려면 설명을 다듬는 것으로는 안 되고, 항목이 들어오는 출처를 걷어야 한다. 목록을 부풀리는 것은 대개 개별 스킬이 아니라 묶음이다.

| 출처 | 목록에 보이는 이름 | 줄이는 법 |
| --- | --- | --- |
| 전역·프로젝트 스킬 폴더 | `이름` | 폴더(링크)를 뺀다. 한 번만 쓸 때는 `SKILL.md` 경로를 직접 읽히면 된다 |
| 플러그인 | `플러그인:스킬` | 플러그인을 끈다(`/plugin`, `enabledPlugins`) |
| claude.ai에서 동기화된 개인 스킬·플러그인 | `anthropic-skills:이름`, `플러그인:스킬` | claude.ai 설정에서 지우거나 끈다. 전역 스킬을 claude.ai에도 올려 두면 같은 스킬이 두 번 실리므로 사본 쪽을 `skillOverrides`로 숨긴다 |
| MCP 서버 | `서버:항목` | 서버를 지우거나, 항목별로 `skillOverrides`를 쓴다 |

### 재는 법

```bash
# 새 세션이 받는 스킬을 출처(접두사)별로 센다
claude -p "ok" --output-format stream-json --verbose \
  | jq -r 'select(.type=="system" and .subtype=="init") | .skills[] | if test(":") then split(":")[0] else "(전역)" end' \
  | sort | uniq -c | sort -rn

# 세션 기록에서 스킬별 호출 횟수를 센다
find ~/.claude/projects -name '*.jsonl' -print0 \
  | xargs -0 grep -ohE '"name":"Skill","input":\{"skill":"[^"]+"' | sort | uniq -c | sort -rn
```

MCP 서버가 올리는 항목은 헤드리스(`-p`) 세션의 init 목록에 잡히지 않는다. 대화형 세션의 `/skills`에서 확인한다.

### skillOverrides로 항목 숨기기

출처를 통째로 걷을 수 없을 때는 `settings.json`의 `skillOverrides`로 항목을 하나씩 뺀다.

```json
{
  "skillOverrides": {
    "front-end-checklist:404-page": "off",
    "some-long-skill": "name-only"
  }
}
```

- `"off"`는 목록에서 숨기고, `"name-only"`는 설명 없이 이름만 남기고, `"user-invocable-only"`는 `/이름`으로만 부를 수 있게 한다(값 전체는 [[claude-code-settings|Claude Code 설정과 권한 규칙]]). `/skills`에서 Space로 바꾸면 `.claude/settings.local.json`에 같은 형식으로 저장된다.
- 와일드카드와 접두사 매칭이 없다. 항목이 많으면 이름 목록에서 설정을 생성하는 스크립트를 둔다.
- claude.ai에서 동기화된 사본(`anthropic-skills:이름`)에도 적용된다. 전역 스킬을 claude.ai에도 올려 쓴다면 사본 쪽 이름을 `"off"`로 두어, claude.ai에서는 그대로 쓰면서 Claude Code 목록의 중복만 없앨 수 있다.
- MCP 서버가 올린 항목에도 적용된다(문서에는 없고 Claude Code 2.1.331에서 동작을 확인). 서버는 유지한 채 그 서버의 항목만 끄는 서버 단위 설정은 없다. 예를 들어 front-end-checklist MCP 서버는 규칙 386개를 리소스로 내려보내 목록에 `front-end-checklist:<규칙>`이 그만큼 실리는데, 규칙마다 `"off"`를 쓰면 MCP 도구는 그대로 쓰면서 목록에서만 뺄 수 있다.

### 줄일 때 주의할 점

| 함정 | 이유와 대응 |
| --- | --- |
| 호출 0회인 스킬을 바로 지운다 | 목록이 예산을 넘으면 설명이 잘려 자동으로 불릴 기회가 없었을 수 있다. 큰 묶음을 먼저 걷고, 2주쯤 뒤 `/skill-doctor`로 다시 판단한다 |
| 자주 쓰는 스킬에 `disable-model-invocation`을 단다 | "퇴근할게" 같은 자연어 요청으로 자동 호출되던 동작이 사라진다. `/이름`으로만 부르는 스킬에만 쓴다 |
| 외부에서 받아 오는 스킬의 프론트매터(`paths` 등)를 고친다 | 다시 받을 때 덮어써진다. 링크에서 빼거나 `skillOverrides`를 쓴다 |
| claude.ai 쪽 정리를 브라우저 자동화에 맡긴다 | Claude in Chrome은 claude.ai의 설정·플러그인 화면을 열지 못한다. 직접 지우거나 끈다 |

## 배포

| 범위 | 방법 |
| --- | --- |
| 개인 | 폴더를 zip으로 묶어 Claude.ai에 업로드, 또는 `~/.claude/skills/`(내 모든 프로젝트)·`.claude/skills/`(이 저장소)에 넣기 |
| 플러그인 | Claude Code 플러그인에 스킬을 담아 마켓플레이스로 배포. `/플러그인명:스킬명`으로 불린다 |
| 조직 | 관리자가 워크스페이스 전체에 배포 |
| API | `/v1/skills` 엔드포인트, `container.skills` 파라미터, Agent SDK 연동 |

규모에 따라 배포 방식이 바뀐다. 작은 팀·소수 저장소는 `.claude/skills`에 커밋하면 충분하다. 하지만 커밋된 스킬마다 description이 맥락을 조금씩 차지하므로, 규모가 커지면 **사내 플러그인 마켓플레이스**에 올려 각자 골라 설치하게 한다. 큐레이션은 중앙 팀 없이도 된다: GitHub 샌드박스 폴더에 올리고 Slack에 알린 뒤, 반응이 오면 소유자가 마켓플레이스로 옮기는 PR을 연다. 스킬 사이 의존성은 아직 네이티브로 관리되지 않는다. 다른 스킬을 이름으로 언급하면 설치돼 있을 때 모델이 부른다.

공개할 때는 GitHub 저장소에 올리고 설치 가이드를 붙인다. 소개할 땐 기능보다 결과를 말한다. "YAML 프론트매터와 마크다운이 담긴 폴더"보다 "팀 워크스페이스를 몇 초 만에 세팅"이 낫다.

### 팀 공용 스킬을 패키지로 배포하기

코딩 컨벤션, 커밋 규칙, 디자인 시스템 사용법처럼 **여러 저장소가 같이 지켜야 하는 규칙**을 저장소마다 `.claude/skills/`에 복사해 두면 금방 어긋난다. 디자인 시스템을 패키지로 배포하는 구조([[design-system|디자인 시스템: 구성, 도입, 구축과 배포]])를 스킬에도 적용한다. **중앙에서 한 번 수정하고, 각 저장소는 설치·업데이트만 한다.**

```text
skill-installer/
├── package.json
├── bin/install.js        # skills/ 아래 파일을 대상 저장소의 .claude/skills/로 복사
└── skills/team-dev-guide/SKILL.md

$ npx @my-org/skill-installer install team-dev-guide
```

| 요소 | 역할 |
| --- | --- |
| 중앙 스킬 저장소 | 스킬의 유일한 원본. 수정은 여기서만 한다 |
| npm 패키지 + 설치 명령 | 버전이 추적되고, 각 저장소는 명령 한 줄로 `.claude/skills/<skill-name>/SKILL.md`를 받는다 |
| 자동 업데이트 PR | Renovate, Dependabot, GitHub Actions 스케줄 작업이 새 버전을 감지해 PR을 만든다. 변경 내역은 PR 리뷰로 확인한다 |

### 지식을 원격 MCP로 제공하기

책이나 강의처럼 **내용 자체가 자산인 전문 지식**(보안 점검 기준, 클라우드 IaC 검수 규칙 등)은 로컬 스킬 파일 대신 원격 MCP 서버로 제공하는 방식도 있다. 코딩 에이전트는 코드 작성·리뷰·리팩터링 중에 그 서버를 도구로 불러 지식을 참고한다.

| 비교 | 로컬 스킬 | 원격 MCP |
| --- | --- | --- |
| 업데이트 | 사용자가 다시 설치·동기화한다 | 서버 쪽만 고치면 모두에게 바로 반영된다 |
| 여러 환경 | 기기마다 파일을 복사한다 | PC·모바일 등 MCP를 붙일 수 있는 곳이면 같은 지식을 쓴다 |
| 콘텐츠 보호 | 파일이 그대로 노출된다 | 필요한 부분만 응답으로 내준다 |
| 비용 | 로드된 만큼만 컨텍스트를 쓴다(프로그레시브 디스클로저) | 도구 정의가 매 요청에 실리고 네트워크 의존이 생긴다 |

절차·워크플로처럼 에이전트의 **행동**을 바꾸는 것은 스킬이, 자주 바뀌거나 여러 환경에서 공유할 **참고 지식**은 원격 MCP가 맞다.

## 실전 패턴 다섯 가지

| 패턴 | 핵심 | 예 |
| --- | --- | --- |
| 순차 워크플로 | 단계마다 검증 게이트를 두고, 단계 간 의존성과 실패 시 롤백 방법을 명시한다 | 고객 온보딩: 계정 생성 → 결제 설정 검증 → 구독 생성 → 환영 메일 |
| 다중 MCP 조율 | 여러 서비스 사이에서 데이터를 넘기고, 다음 단계 전에 검증한다 | 디자인 핸드오프: Figma 추출 → Drive 업로드 → Linear 태스크 → Slack 알림 |
| 반복 개선 | 초안 → 검증 스크립트 → 수정 → 재검증 루프. 품질 기준과 **언제 멈출지**를 미리 정한다 | 보고서 초안을 검사 통과까지 다듬기 |
| 상황별 도구 선택 | 목표가 같아도 상황에 따라 도구를 고르고, 판단 기준과 선택 이유를 드러낸다 | 큰 파일은 클라우드 스토리지, 협업 문서는 Notion, 코드는 GitHub |
| 도메인 전문 지식 | 도구 연결은 누구나 하므로, 차별점은 지식을 코드화하는 데 있다 | 결제 전 컴플라이언스: 제재 목록 확인 → 관할권 검증 → 리스크 평가 → 감사 기록 |

스킬이 늘어나 무엇을 부를지 기억하기 어려워지면 **오케스트레이션 스킬** 하나를 둔다. 이 스킬은 작업을 받아 스킬 목록에서 맞는 것을 고르고 순서대로 부르는 일만 한다. 사용자가 직접 부르는 진입점이 하나로 줄어든다. 무엇부터 스킬로 만들지 모르겠으면 **팀이 함께 쓰는 산출물**(문서 양식, 이슈 작성, 저장소별 코드 컨벤션)부터 시작한다. 형식이 사람마다 달라지는 문제가 바로 줄어든다.

## 정리

- 스킬은 프론트매터 → 본문 → 참조 파일 순으로 필요할 때만 읽힌다. 다른 스킬과 함께 로딩돼도 충돌하지 않게 쓴다.
- 트리거는 `description` 하나에 달렸다. what과 when을 담는다.
- 본문은 짧게, 지시는 실행 가능한 명령으로, 중요한 검증은 스크립트로 둔다.
- 어려운 작업 하나를 성공시킨 뒤 스킬로 뽑고, 증상에 따라 description과 지시문을 고친다.
- 스킬은 한 유형에 맞추고, Claude가 실패한 지점을 gotchas로 쌓아 키운다. 모노레포에서는 패키지 폴더에 두고 접두사를 붙인다.

관련 노트: [[claude-code-guide|Claude Code 활용 가이드]], [[claude-code-extensions|커맨드·스킬·서브에이전트 고르기]], [[design-system-agent-harness|디자인 시스템을 아는 화면 생성 에이전트 설계하기]], [[design-system|디자인 시스템: 구성, 도입, 구축과 배포]]
