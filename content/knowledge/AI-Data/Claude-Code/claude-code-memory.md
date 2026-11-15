---
title: "Claude Code 메모리: CLAUDE.md·rules·자동 메모리"
concept: "Claude Code Memory"
summary: "Claude Code가 세션을 넘어 기억하는 네 가지 장치(사람이 쓰는 CLAUDE.md와 .claude/rules, Claude가 쓰는 자동 메모리, 서브에이전트별 에이전트 메모리)를 비교하고, 모노레포에서 CLAUDE.md가 조상은 즉시·하위는 필요할 때·형제는 읽히지 않는 로딩 규칙, paths로 지연 로드하는 rules, 에이전트 메모리의 user·project·local 범위와 MEMORY.md 200줄 규칙, 그리고 CLAUDE.md를 짧고 살아 있게 유지하는 운영법을 정리했다."
tags: ["ai", "claude-code", "agentic-coding", "context-engineering", "llm"]
source: other
date: "2026-11-15"
sources: ["https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-memory.md", "https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-agent-memory.md", "https://github.com/shanraisshan/claude-code-best-practice/tree/main/tips", "https://code.claude.com/docs/en/memory", "https://code.claude.com/docs/en/sub-agents"]
---

> shanraisshan의 「[claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice)」(MIT) 중 메모리 문서, 에이전트 메모리 리포트, Boris Cherny·Dex Horthy의 팁 모음을 바탕으로 공식 [Memory](https://code.claude.com/docs/en/memory) 문서와 대조해 재구성한 노트다.

## 메모리란

모델은 세션이 끝나면 모든 것을 잊는다. Claude Code는 **세션 시작 때 정해진 파일을 시스템 프롬프트에 다시 넣는 방식**으로 기억을 흉내 낸다. 누가 쓰고 누가 읽느냐에 따라 네 가지로 나뉜다.

| 장치 | 누가 쓰나 | 누가 읽나 | 위치 | 범위 |
| --- | --- | --- | --- | --- |
| CLAUDE.md | 사람(또는 사람이 시킨 Claude) | 메인 + 모든 서브에이전트 | `~/.claude/CLAUDE.md`, `./CLAUDE.md`, `./CLAUDE.local.md` | 전역·프로젝트·개인 |
| `.claude/rules/*.md` | 사람 | 메인 + 서브에이전트 | `~/.claude/rules/`, `.claude/rules/` | 파일 패턴별로 쪼갠 지시 |
| 자동 메모리(auto memory) | 메인 Claude가 스스로 | 메인 Claude만 | `~/.claude/projects/<프로젝트>/memory/MEMORY.md` | 프로젝트별·사용자별 |
| 에이전트 메모리 | 그 서브에이전트가 스스로 | 그 서브에이전트만 | 범위에 따라 다름(아래) | 에이전트별 |

`/memory`로 지금 읽히는 메모리 파일을 열어 고치고, 자동 메모리를 켜고 끈다. 저장소에 `AGENTS.md`만 있으면 그것을 읽는다.

## CLAUDE.md 로딩 규칙

모노레포에서는 CLAUDE.md가 여러 개 생긴다. 어느 것이 언제 읽히는지가 핵심이다.

| 방향 | 언제 읽히나 |
| --- | --- |
| **조상**(시작 폴더에서 루트 쪽) | 시작할 때 전부 즉시 |
| **자손**(시작 폴더 아래) | 시작할 때는 안 읽고, 그 폴더의 파일을 읽을 때 지연 로드 |
| **형제** | 읽히지 않는다 |

```text
/mymonorepo/CLAUDE.md          ← 공용 규약
/mymonorepo/frontend/CLAUDE.md ← 프레임워크·테스트 규약
/mymonorepo/backend/CLAUDE.md
```

- `/mymonorepo`에서 시작하면 루트만 읽고, `frontend/` 파일을 만질 때 `frontend/CLAUDE.md`가 붙는다.
- `/mymonorepo/frontend`에서 시작하면 루트(조상)와 `frontend`(시작 폴더)가 즉시 읽히고, `backend`는 끝까지 읽히지 않는다.
- 그래서 **공용 규약(코딩 표준, 커밋 형식, PR 템플릿)은 루트에, 컴포넌트 전용 규약은 그 폴더에** 둔다.
- 서드파티 폴더의 CLAUDE.md를 빼려면 설정의 `claudeMdExcludes`(`["**/vendor/**/CLAUDE.md"]`)를 쓴다.

스킬도 비슷하다. 시작 폴더부터 저장소 루트까지 조상의 `.claude/skills/`는 시작할 때 읽고, 중첩된 하위 `.claude/skills/`는 그 폴더 파일을 처음 읽거나 편집할 때 찾는다. 다만 스킬은 description만 먼저 올라온다. 자세한 것은 [[claude-skill-building-guide#모노레포에서 스킬 찾기|스킬 가이드의 모노레포 절]]에 있다.

## rules: 조건부 지시

`.claude/rules/*.md`는 CLAUDE.md처럼 세션마다 읽히지만, YAML frontmatter에 `paths:` 글롭을 넣으면 **그 파일을 만질 때만** 지연 로드된다. 「테스트 파일을 쓸 때만 필요한 규칙」을 CLAUDE.md에서 덜어 내는 장치다. 프롬프트는 정적이라 이런 조건부 로딩을 흉내 낼 수 없다는 점이 하네스의 존재 이유 중 하나다([[harness-engineering|하네스 엔지니어링]]).

## 에이전트 메모리

서브에이전트 frontmatter의 `memory:` 필드(v2.1.33 도입)는 그 에이전트 전용 기억 폴더를 준다.

| 범위 | 저장 위치 | 버전 관리 | 쓰는 곳 |
| --- | --- | --- | --- |
| `user` | `~/.claude/agent-memory/<에이전트>/` | 아니오 | 프로젝트를 넘는 지식(권장 기본값) |
| `project` | `.claude/agent-memory/<에이전트>/` | 예, 팀 공유 | 팀이 공유할 프로젝트 지식 |
| `local` | `.claude/agent-memory-local/<에이전트>/` | 아니오(gitignore) | 개인 프로젝트 지식 |

- 시작할 때 `MEMORY.md`의 **첫 200줄**이 시스템 프롬프트에 들어가고, 메모리 폴더에 대한 `Read`·`Write`·`Edit`가 자동으로 켜진다. 200줄을 넘기면 에이전트가 주제별 파일(`react-patterns.md` 등)로 나누고 `MEMORY.md`는 목차가 된다.
- 에이전트 본문에 「시작 전에 메모리를 검토하고, 끝나면 배운 것을 갱신하라」를 적어 두어야 꾸준히 쓴다.
- **스킬은 정적 지식, 메모리는 쌓이는 지식**이다. 둘을 함께 준다: `skills: [api-conventions, error-handling-patterns]` + `memory: project`.

## CLAUDE.md 운영법

| 원칙 | 방법 |
| --- | --- |
| **짧게** | 파일당 200줄 안쪽이 목표다. 60줄로 유지하는 팀도 있다. 길어지면 Claude가 도메인 규칙을 무시하기 시작한다 |
| **넣을 것만 넣는다** | 이 코드베이스에서 일하려면 알아야 할 것: 설치·빌드·테스트 명령, 아키텍처 결정, 핵심 파일. 누구든 Claude를 켜고 「테스트 돌려」라고 했을 때 첫 시도에 돼야 한다. 안 되면 명령이 빠진 것이다 |
| **틀릴 때마다 고친다** | 교정한 뒤 「다시는 그 실수를 하지 않게 CLAUDE.md를 고쳐」로 마무리한다. Claude는 자기 규칙을 쓰는 데 능하다 |
| **리뷰에서 바로 새긴다** | 동료 PR에서 막을 수 있던 실수를 보면 PR에 `@claude`를 태그해 「이걸 CLAUDE.md에 추가해」라고 단다(GitHub Action). 린트로 잡을 수 있으면 린트 규칙을 쓰게 한다 |
| **비대해지면 지우고 다시** | 커졌다는 경고가 뜨면 통째로 지우고, 모델이 엇나갈 때마다 조금씩 다시 넣는다. 모델이 좋아질수록 넣을 것이 줄어든다 |
| **중요한 조건부 규칙은 태그로** | 길어진 파일에서 꼭 지켜야 할 규칙은 `<important if="...">`로 감싼다 |
| **강제할 수 있는 건 설정으로** | attribution, 권한, 모델처럼 하네스가 강제할 수 있는 것은 [[claude-code-settings\|settings.json]]으로 옮긴다 |
| **작업 노트는 밖으로** | 작업·프로젝트마다 Claude가 노트 폴더를 관리하게 하고 CLAUDE.md는 그 폴더를 가리키게 한다 |

개인 CLAUDE.md는 아주 짧아도 된다. 예를 들어 「PR을 올리면 auto-merge를 켠다」, 「PR을 올리면 팀 리뷰 채널에 올린다」 두 줄만 두고 나머지는 팀 공용 파일에 맡긴다. CLAUDE.md는 **같은 말을 반복하지 않으려는 지름길**이지 모든 걸 넣는 곳이 아니다.

### 한 번의 대화보다 여러 기록에서

대화 하나에서 기억을 뽑으면 그 지시가 앞으로의 모든 일에 해당하는지 알 수 없다. 「이 버튼을 분홍으로」가 「모든 버튼을 분홍으로」가 되면 안 된다. 그래서 작업마다 무엇을 했고 무엇을 시도했고 왜 안 됐는지 정해진 형식으로 일지를 쓰게 하고, 별도 에이전트가 **쌓인 일지에서 패턴을 종합**해 규칙으로 올리는 방식이 더 일관적이다.

## 정리

- 사람이 쓰는 지시는 CLAUDE.md와 rules, Claude가 쓰는 기억은 자동 메모리와 에이전트 메모리다. 에이전트는 CLAUDE.md와 자기 메모리를 둘 다 읽는다.
- CLAUDE.md는 조상은 즉시, 자손은 필요할 때, 형제는 안 읽힌다. 공용은 루트, 전용은 폴더에 둔다.
- rules의 `paths:`로 조건부 지시를 CLAUDE.md에서 덜어 낸다.
- CLAUDE.md는 200줄 안쪽으로, 틀릴 때마다 고치고, 커지면 지우고 다시 쌓는다.

관련 노트: [[claude-code-guide|Claude Code 활용 가이드]], [[claude-code-extensions|커맨드·스킬·서브에이전트 고르기]], [[claude-code-settings|Claude Code 설정과 권한 규칙]], [[personal-agent-harness|내 일을 줄이는 하네스 만들기]], [[llm-wiki|LLM 위키]]
