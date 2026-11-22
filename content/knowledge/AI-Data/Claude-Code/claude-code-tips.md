---
title: "Claude Code 실전 팁: 만든 사람들의 사용법"
concept: "Claude Code Tips"
summary: "Claude Code를 만든 Anthropic 팀(Boris Cherny, Thariq, Cat Wu)과 Dex Horthy·Matt Pocock 같은 실무자의 팁을 주제별로 묶었다. 계획에 힘을 쏟아 한 번에 구현하기, 검증 수단 주기와 /go 패턴, worktree 병렬 세션, 맥락 관리 수치(context rot 30만~40만 토큰, dumb zone 40%)와 compact·clear·rewind·서브에이전트 선택법, 훅·권한·샌드박스, 모델과 추론 강도, Claude에게 도전하는 프롬프트, 모바일·원격 세션, /loop로 돌리는 실제 루프, squash와 작은 PR, 터미널 설정까지 정리했다."
tags: ["ai", "claude-code", "agentic-coding", "prompting", "productivity"]
source: other
date: "2026-11-18"
sources: ["https://github.com/shanraisshan/claude-code-best-practice/tree/main/tips", "https://github.com/shanraisshan/claude-code-best-practice/blob/main/README.md", "https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-spinner-verbs-and-tips.md", "https://github.com/shanraisshan/claude-code-best-practice/tree/main/videos", "https://github.com/alibaba/open-code-review"]
---

> shanraisshan의 「[claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice)」(MIT)가 모은 Boris Cherny의 팁 스레드(2026.01~04), Thariq의 스킬·세션 관리 글(2026.03·04), README의 팁 84개, 제작자 인터뷰 녹취를 주제별로 재구성한 노트다. 모델 이름은 각 팁의 시점 기준이다.

## 전제: 정답 설정은 없다

Claude Code 제작자의 설정은 놀랄 만큼 기본값에 가깝고, 팀원마다 쓰는 법이 다르다. 팁을 그대로 베끼기보다 실험해서 맞는 것을 찾는다. 설정 추천과 수정은 Claude Code에게 물어보면 된다. 기본 사용법은 [[claude-code-guide|Claude Code 활용 가이드]]에 있다.

## 1. 계획에 힘을 쏟는다

| 팁 | 방법 |
| --- | --- |
| **세션 대부분을 계획 모드로 시작** | `Shift+Tab` 두 번. 제작자는 세션의 약 80%를 계획 모드로 시작하고, 계획이 마음에 들면 편집 자동 수락으로 바꿔 대개 한 번에 끝낸다. 계획을 먼저 맞추면 성공률이 2~3배 오른다 |
| **계획을 다른 눈으로 리뷰** | 한 Claude가 계획을 쓰고 두 번째 Claude가 스태프 엔지니어 입장에서 리뷰한다. 다른 모델로 리뷰하면 더 좋다([[claude-code-workflows\|교차 모델 워크플로]]) |
| **꼬이면 즉시 다시 계획** | 밀어붙이지 말고 계획 모드로 돌아간다. 빌드뿐 아니라 **검증 단계도** 계획에 넣으라고 명시한다 |
| **인터뷰로 스펙 만들기** | 짧은 프롬프트로 시작해 Claude가 `AskUserQuestion`으로 나를 인터뷰하게 하고, 완성된 스펙은 **새 세션**에서 실행한다. Claude는 원래 질문을 잘 안 하므로 「모르는 게 있으면 물어봐」를 명시한다 |
| **버리는 구현으로 명세 다듬기** | 원하는 게 한 문장뿐이어도 일단 구현시켜 보고, 실수에서 「내가 뜻한 것」을 배운 뒤 지우고(`Esc` 두 번) 더 나은 명세를 쓴다 |
| **PRD보다 프로토타입** | 만드는 비용이 낮으니 스펙 대신 버전을 20~30개 만들어 본다 |

작업 크기에 따라 방식을 고른다.

| 작업 | 방식 |
| --- | --- |
| 프로토타입 | 모든 시스템을 관통하는 가장 단순한 것을 시키고, 어디서 틀리는지 본 뒤 버린다 |
| 한 번에 될 것 같은 일 | 자동 수락으로 맡기고 다른 탭으로 간다 |
| 몇 시간짜리 어려운 기능 | 계획 모드로 계획부터 맞춘다 |

## 2. 검증 수단을 준다

**Claude가 자기 결과를 검증할 수단이 있으면 최종 품질이 2~3배 좋아진다.** 브라우저 없이 웹사이트를 만들라는 것은 눈을 가리고 그리라는 것과 같다.

| 작업 | 검증 수단 |
| --- | --- |
| 백엔드 | 서버·서비스를 직접 띄워 E2E 테스트 |
| 프런트엔드 | Chrome 확장(Claude in Chrome), Playwright, Chrome DevTools MCP로 콘솔까지 보게 한다 |
| 데스크톱 앱 | Computer Use. 데스크톱 앱은 웹 서버를 자동으로 띄우고 내장 브라우저로 테스트까지 한다 |

- **`/go` 패턴**: 프롬프트를 「… /go」로 끝낸다. `/go` 스킬은 (1) bash·브라우저·computer use로 E2E 자체 테스트 (2) `/simplify` (3) PR 올리기를 한다. 돌아왔을 때 코드가 동작한다는 확신이 생긴다.
- **긴 작업 검증**: 끝나면 백그라운드 에이전트로 검증하라고 프롬프트하거나, `Stop` 훅으로 더 결정적으로 하거나, Ralph Wiggum 플러그인으로 목표까지 반복시킨다.
- **디버깅 보조**: 막히면 스크린샷을 공유한다. 로그를 보고 싶은 프로세스는 Claude에게 백그라운드 작업으로 띄우게 해 Claude가 직접 읽게 한다. 설치·인증 문제는 `/doctor`.

## 3. 병렬로 돌린다

| 팁 | 방법 |
| --- | --- |
| **worktree 3~5개에 세션 하나씩** | 팀이 꼽은 가장 큰 생산성 향상이다. `claude -w`로 새 worktree에서 시작하고, 데스크톱 앱은 worktree 체크박스를 켠다. git이 아닌 VCS는 `WorktreeCreate` 훅으로 |
| **탭에 번호, 알림으로 대기 확인** | 터미널 탭 1~5에 번호를 붙이고 시스템 알림으로 입력 대기를 안다. 넘치면 claude.ai/code나 데스크톱 Code 탭에서 더 돌린다 |
| **worktree 이름과 별칭** | 셸 별칭(`2a`, `2b`)으로 한 번에 이동하고, 로그 읽기·데이터 조회 전용 「analysis」 worktree를 따로 둔다 |
| **세션 라벨** | `/rename`(예: `[TODO - refactor task]`)과 `/color`로 구분하고 나중에 `/resume` |
| **대규모 변경은 /batch** | 작업을 독립된 5~30개 단위로 쪼개 단위마다 worktree 서브에이전트로 퍼뜨린다 |

## 4. 맥락을 관리한다

| 수치 | 의미 |
| --- | --- |
| **context rot 약 30만~40만 토큰** | 1M 맥락 모델에서도 이쯤부터 흐려진다. 작업마다 다르지만 지능이 중요한 일은 그 너머로 끌지 않는다 |
| **dumb zone 약 40%** | 입문자는 40% 아래, 60%면 마무리를 고려한다. 숙련자는 30% 아래로 공격적으로 유지하고 단순 작업만 60%까지 간다 |

매 턴이 분기점이다. 다음 턴에 가져가는 맥락은 이 순서로 많아진다.

| 선택 | 가져가는 것 | 쓸 때 |
| --- | --- | --- |
| `/clear` + 브리프 | 내가 쓴 브리프만 | 10만 토큰 탐색 끝에 사실 하나를 찾은 고위험 다음 단계. 품이 들지만 무엇을 가져갈지 내가 정한다 |
| `/compact` | 손실 요약 | 작업 중간, 세부가 흐려져도 될 때 |
| 서브에이전트 | 전부 + 자식의 결론만 | 도구 출력은 필요 없고 결론만 필요할 때 |
| `/rewind` | 앞부분 유지, 꼬리 잘림 | 잘못 간 시도를 지울 때 |
| 계속 | 전부 | 같은 일의 다음 단계 |

- **교정보다 되감기**: 「그거 안 됐어, X 해」 대신 파일을 읽은 직후로 되감고 배운 것을 넣어 다시 프롬프트한다. 맥락이 「읽기 + 실패 2번 + 교정 2번」에서 「읽기 + 정보가 담긴 프롬프트 1개」로 준다. 되감기 전에 「summarize from here」로 배운 점을 미래의 Claude에게 쓰는 메모로 받아 둔다.
- **힌트를 준 수동 압축**이 자동 압축보다 낫다: `/compact focus on the auth refactor, drop the test debugging`. 자동 압축은 모델이 다음 방향을 모를 때 나빠진다. 긴 디버깅 뒤 자동 압축이 조사만 요약하면, 다음 요청 「bar.ts의 다른 경고도 고쳐」의 그 경고가 요약에서 빠진다. 게다가 압축 시점은 모델이 가장 덜 똑똑한 때다.
- **새 작업은 새 세션**. 다만 방금 만든 기능의 문서처럼 지능이 덜 필요하고 파일을 다시 읽는 비용이 큰 일은 맥락을 재사용한다.
- 작업 중 `Enter`로 메시지를 대기열에 넣어 실시간으로 조종하고, `/btw`로 곁가지를 묻고, `/focus`로 결과만 본다. 오래 자리를 비웠다 오면 recap이 한 일과 다음 할 일을 요약해 준다.
- 상태줄에 맥락 사용률을 띄워 두면 압축 시점을 놓치지 않는다([[claude-code-settings\|상태줄 설정]]).

## 5. CLAUDE.md·스킬·서브에이전트

자세한 것은 각 노트에 있고, 여기서는 습관만 적는다.

- 교정한 뒤 「다시는 그 실수를 하지 않게 CLAUDE.md를 고쳐」로 마무리하고, 동료 PR에서는 `@claude`로 규칙을 추가한다. 길이는 200줄 안쪽([[claude-code-memory\|Claude Code 메모리]]).
- **하루에 한 번 이상 하는 일은 스킬·명령으로**: 세션 끝마다 중복 코드를 찾는 `/techdebt`, Slack·드라이브·이슈 트래커·GitHub 7일치를 한 맥락으로 모으는 명령, 커밋·푸시·PR을 한 번에 하는 `/commit-push-pr`(셸 출력을 미리 주입하고 git 명령을 사전 허용해 Haiku로 빠르게) ([[claude-skill-building-guide\|스킬 가이드]]).
- 더 많은 계산을 원하면 요청 끝에 「use subagents」를 붙인다. 작업 뒤 단순화하는 `code-simplifier`, E2E 검증 절차를 담은 `verify-app` 같은 에이전트를 둔다([[claude-code-extensions\|커맨드·스킬·서브에이전트 고르기]]).
- 마이그레이션은 시작했으면 끝낸다. 반쯤 옮긴 프레임워크는 사람도 모델도 잘못된 쪽을 고르게 한다.

## 6. 훅·권한·샌드박스

| 팁 | 방법 |
| --- | --- |
| **포맷은 훅으로** | `PostToolUse` matcher `Write\|Edit`에 `bun run format \|\| true`. 모델이 놓치는 나머지 10%를 잡아 CI 포맷 오류를 막는다 |
| **권한 요청을 모델에게** | `PermissionRequest` 훅으로 요청을 강한 모델에게 넘겨 공격 여부를 보고 안전한 것은 자동 승인하거나, Slack·메신저로 보내 원격 승인 |
| **생명주기 활용** | `SessionStart`로 맥락 동적 로드(클라우드 세션 환경 구성), `PreToolUse`로 모든 bash 명령 로깅, `Stop`으로 계속하라고 찌르기 |
| **우회 대신 사전 허용** | `--dangerously-skip-permissions` 대신 `/permissions`로 안전한 명령(`Bash(bun run *)`, `Edit(/docs/**)`)을 허용하고 `.claude/settings.json`에 커밋 |
| **샌드박스** | `/sandbox`로 파일·네트워크를 격리하면 사내 권한 프롬프트가 84% 줄었다 |
| **반복 승인 정리** | `/fewer-permission-prompts`가 기록을 훑어 allowlist를 추천한다. 자동 모드를 쓰면 지켜볼 필요가 줄어 병렬 세션을 더 돌린다 |

훅 상세는 [[claude-code-hooks|Claude Code 훅]], 권한 규칙 문법은 [[claude-code-settings|Claude Code 설정과 권한 규칙]]에 있다.

## 7. 모델과 추론 강도

- 제작자는 늘 가장 강한 모델과 높은 추론 강도를 쓴다. 싼 모델은 교정과 손잡기가 늘어 결국 토큰을 더 쓰는 경우가 많아 꼭 싸지 않다.
- 계획은 Opus, 코드는 Sonnet으로 나누는 방식(`opusplan` 별칭)도 있다.
- **구독 한도가 빠듯하면 역할별로 모델을 내린다.** 계획·설계는 상위 모델이 맡고, 구현은 한 단계 낮은 모델의 서브에이전트로 병렬 실행하고, 문서·코드를 읽기만 하는 탐색 서브에이전트는 가장 가벼운 모델로 돌린다. CLAUDE.md에 적은 지침은 가끔 무시되므로 서브에이전트 정의의 `model` 필드나 스킬로 고정하는 편이 안정적이다.
- 서브에이전트는 저마다 맥락 창을 새로 채우므로 **띄운 수만큼 토큰이 곱으로 든다.** 검사·조사처럼 양이 많아 병렬화가 필요한 일에만 쓰고, 나머지는 역할별 세션을 따로 열어 두고 필요할 때 그 세션에 직접 요청한다.
- 높은 추론 강도는 정밀도가 필요한 계획·설계에 쓰고, 단순 구현까지 최고 단계로 돌리지 않는다. 최상위 모델을 높은 추론 강도로 계속 돌리면 고가 플랜의 한도도 몇 시간 만에 바닥날 수 있다.
- **모델을 바꾸기 전에 사용량을 추산하게 한다.** 최근 며칠의 사용량을 근거로 「다른 모델로 바꾸면 남은 기간에 몇 시간쯤 쓸 수 있나」를 물으면 대략적인 숫자가 나온다. 정확하지는 않지만 모델 간 차이가 클 때 판단 근거가 된다. 프로젝트 한두 개에만 집중하고 worktree를 대량으로 병렬 실행하지 않으면 기본 모델만으로 한도가 빨리 녹지는 않는다.
- 낯선 코드베이스에서는 `/config`에서 thinking 표시를 켜고 출력 스타일을 Explanatory(프레임워크·패턴 설명) 또는 Learning(변경을 코칭)으로 둔다. 신규 합류자에게 특히 좋다.

## 8. 프롬프트 습관

| 팁 | 예 |
| --- | --- |
| **Claude에게 도전하라** | 「Grill me on these changes and don't make a PR until I pass your test」, 「Prove to me this works」(main과 기능 브랜치 동작 차이를 diff) |
| **어설픈 수정 뒤 다시** | 「Knowing everything you know now, scrap this and implement the elegant solution」 |
| **방법은 지시하지 않는다** | Slack MCP를 켜고 버그 스레드를 붙여 「fix」만, 「Go fix the failing CI tests」. 분산 시스템은 docker 로그를 가리키면 의외로 잘 푼다 |
| **장황하면 한마디** | 「simplify it」 |
| **음성으로** | 말이 타이핑보다 3배 빠르고 프롬프트가 훨씬 자세해진다. `/voice`(스페이스바를 누른 채 말하기), macOS `fn` 두 번 |

## 9. 어디서나: 모바일·원격·여러 저장소

- 모바일 Claude 앱의 **Code** 탭에서 변경을 리뷰하고 PR을 승인하고 코드를 쓴다. 아침에 휴대폰으로 클라우드 에이전트 몇 개를 띄워 하루를 시작하기도 한다.
- `claude --teleport`(`/teleport`)로 클라우드 세션을 로컬 터미널로 끌어오고, `/remote-control`로 로컬 세션을 폰·웹에서 조종한다. `/config`에서 모든 세션의 원격 제어를 켜 둘 수 있다.
- 여러 저장소는 한 곳에서 시작해 `--add-dir`(`/add-dir`)로 다른 저장소를 보이게 하고, 늘 쓰면 팀 설정 `"additionalDirectories"`에 넣는다.
- `claude -p`와 SDK는 기본으로 로컬 CLAUDE.md·설정·MCP를 찾는다. 비대화형이면 `--bare`로 끄고 필요한 것을 명시하면 시작이 최대 10배 빠르다.

## 10. 루프로 돌리기

`/loop`(세션 안)와 `/schedule`(클라우드)로 워크플로를 스킬 + 루프로 만든다. 실제로 돌리는 예:

| 루프 | 하는 일 |
| --- | --- |
| `/loop 5m /babysit` | 코드 리뷰 대응, 자동 rebase, PR을 프로덕션까지 몰고 간다 |
| `/loop 30m /slack-feedback` | Slack 피드백마다 PR을 올린다 |
| `/loop /post-merge-sweeper` | 놓친 리뷰 코멘트를 처리하는 PR |
| `/loop 1h /pr-pruner` | 오래되거나 불필요한 PR 정리 |

장치별 차이(조건 기반 `/goal`, 시간 기반 `/loop`)는 [[claude-code-workflows|Claude Code 개발 워크플로]]에 있다.

## 11. PR과 리뷰

- **항상 squash merge**: PR 하나 = 커밋 하나로 이력이 선형이 되고 `git revert`·`git bisect`가 쉬워진다. 브랜치 안의 「fix lint」 커밋은 잡음이다.
- **PR은 작게**: 하루 PR 141개를 낸 날의 크기 분포가 p50 118줄, p90 498줄이었다. 최소 한 시간에 한 번, 작업이 끝나는 즉시 커밋한다.
- **리뷰 계층**: CI에서 `claude -p`가 모든 PR을 1차 리뷰해 버그의 약 80%를 잡고, 사람이 반드시 2차 리뷰한다. 여러 에이전트 + 오탐을 거르는 에이전트(best-of-N)로 LLM 리뷰의 비결정성을 줄인다. 코드 산출량이 늘수록 리뷰가 병목이 되므로 리뷰도 자동화한다(`/code-review`).
- **같은 기준**: 모델이 쓴 코드에도 사람 코드와 같은 머지 기준을 둔다. 나쁘면 머지하지 말고 고치게 한다.
- **외부 리뷰 도구도 같은 계층에 붙인다**: Alibaba의 [open-code-review](https://github.com/alibaba/open-code-review)(`ocr`, Apache-2.0)는 Git diff를 읽어 설정한 LLM으로 줄 단위 리뷰 코멘트를 남기는 CLI다. NPE·스레드 안전성·XSS·SQL 인젝션 같은 내장 규칙이 있고, GitHub Actions·GitLab CI에 붙이거나 Claude Code 같은 에이전트 안에서 스킬로 부를 수 있다(이때는 호스트 에이전트의 모델을 쓴다).
- **반복 지적은 자동화로**: 같은 리뷰 지적이 2~3번 나오면 PR에서 Claude에게 린트 규칙을 쓰게 한다.

## 12. 데이터와 학습

- `bq` 같은 CLI로 지표를 즉석 조회한다. 팀이 BigQuery 스킬을 커밋해 두면 SQL을 직접 쓸 일이 거의 없다. Sentry·Slack도 MCP로(`.mcp.json` 커밋).
- 낯선 코드를 설명하는 HTML 발표 자료, 새 프로토콜의 다이어그램을 만들게 한다. 간격 반복 학습 스킬(내가 이해한 것을 설명 → Claude가 빈틈을 질문 → 결과 저장)도 쓸 만하다.

## 13. 터미널과 환경

- 터미널은 동기화 렌더링·24비트 색·유니코드를 지원하는 Ghostty를 선호한다. 작업·worktree마다 탭 하나, 색과 이름으로 구분한다.
- `/statusline`(모델·폴더·남은 맥락·비용·브랜치), `/terminal-setup`(Shift+Enter 줄바꿈), `/keybindings`(키 재매핑), `/tui fullscreen`(깜빡임 없는 렌더링 + 마우스), `spinnerVerbs`를 팀과 공유한다.
- 래퍼 스크립트 대신 `settings.json`의 `"env"`를 쓴다.
- Claude Code는 매일 업데이트된다. changelog를 읽고 `/release-notes`를 확인하는 습관이 기능을 놓치지 않게 한다.

## 정리

- 계획에 힘을 쏟고, 검증 수단을 주고, worktree로 병렬로 돌린다. 이 셋이 가장 큰 차이를 만든다.
- 맥락은 40% 아래로, 교정보다 되감기, 자동 압축보다 힌트를 준 수동 압축이나 clear + 브리프.
- 반복되는 일은 스킬·명령·루프로, 반드시 지킬 규칙은 훅·설정으로 옮긴다.
- PR은 작게 squash하고, 리뷰는 AI 1차 + 사람 2차로 같은 기준을 적용한다.

관련 노트: [[claude-code-guide|Claude Code 활용 가이드]], [[claude-code-workflows|Claude Code 개발 워크플로]], [[claude-code-commands|Claude Code 명령어·플래그 레퍼런스]], [[claude-code-design-philosophy|Claude Code의 설계 원칙]], [[loop-engineering|루프 엔지니어링]], [[ai-coding-guardrails|AI 코딩 실무 가드레일]]
