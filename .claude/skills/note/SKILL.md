---
name: note
description: riverlog 지식 창고(content/knowledge)에 새 지식 노트를 요약·재구성해 넣는다. "/note <붙여 넣은 글·URL·파일 경로·주제>" 형태로 쓰며, 원문을 번역·복사하지 않고 riverlog 노트 형식(frontmatter, 출처 인용, 표·소제목 중심 정리, 관련 노트 링크)으로 다시 쓰고, 상위 분야 인덱스의 하위 노트 목록까지 갱신한다. "지식 창고에 넣어 줘", "노트로 정리해 줘", "이거 요약해서 knowledge에" 요청에도 사용.
argument-hint: "<붙여 넣은 글 | URL | 파일 경로 | 주제> [→ 분야/주제 경로] [--draft]"
---

# /note — 지식 창고에 노트 넣기

`$ARGUMENTS`로 받은 자료를 riverlog 지식 창고의 노트 한 편(또는 기존 노트 보강)으로 만든다.
형식·문체의 세부 규칙은 [style.md](style.md)에 있다. 노트를 쓰기 전에 반드시 읽는다.

## 0. 입력 파악

`$ARGUMENTS`를 다음 중 하나 이상으로 해석한다. 섞여 있으면 모두 재료로 쓴다.

| 입력 | 처리 |
| --- | --- |
| 붙여 넣은 본문 | 그대로 재료로 쓴다 |
| URL | WebFetch로 본문을 가져온다. 못 가져오면 사용자에게 본문을 붙여 달라고 한다 |
| 로컬 파일 경로 (md, pdf, 이미지) | Read로 읽는다 |
| 짧은 주제어만 있음 | 재료가 없다는 뜻이다. 웹 검색으로 자료를 모을지 AskUserQuestion으로 묻는다 |
| `→ Career/Work` 같은 경로 힌트 | 저장 위치로 우선 사용한다 |
| `--draft` | frontmatter에 `publish: false`를 넣는다 |

재료가 비어 있으면 아무것도 만들지 말고 무엇을 넣을지 묻는다.

## 1. 기존 노트와 겹치는지 확인

새 파일부터 만들지 않는다. 같은 내용이 이미 있으면 **보강이 기본**이다.

```bash
ls content/knowledge content/knowledge/*/
grep -ril "<핵심 키워드>" content/knowledge --include=*.md
grep -rh "^concept:\|^title:" content/knowledge | grep -i "<키워드>"
```

- 같은 주제의 노트가 있다 → 그 노트에 섹션을 추가하거나 고친다. 출처 인용을 한 줄 더한다.
- 상위 개념만 겹친다 → 새 노트를 만들고 서로 관련 노트로 링크한다.
- 판단이 애매하다 → AskUserQuestion으로 "새 노트 / 기존 노트 보강" 중 고르게 한다.

## 2. 위치와 파일 이름 정하기

- 분야(1단계 폴더)는 `Frontend · Backend · Computer-Science · Algorithm · DevOps · AI-Data · Tools · Projects · Career · Life-and-Learning` 중 하나다. 새 분야 폴더는 만들지 않는다.
- 하위 주제 폴더는 기존 것을 먼저 쓴다. 같은 주제 노트가 3편 이상 쌓일 때만 새 폴더를 제안한다.
- 파일 이름은 영어 kebab-case 슬러그(`loop-engineering.md`). 위키링크가 파일 이름으로 풀리므로 **vault 전체에서 유일**해야 한다:
  `find content -name "<slug>.md"` 결과가 비어 있어야 한다.

## 3. 노트 쓰기

[style.md](style.md)를 따른다. 핵심만 요약하면:

1. **frontmatter**: `title`, `concept`, `summary`, `tags`, `source`, `date`(오늘), 필요하면 `sources`, `publish: false`.
2. **출처 인용 한 줄**: `> 누구의 「제목」(날짜)을 요약·재구성한 노트입니다.` 시점에 민감한 내용이면 "바뀌었을 수 있습니다"를 붙인다.
3. **본문은 번역이 아니라 재구성**이다. 원문 순서를 따르지 말고 "무엇인가 → 왜 → 어떻게 → 한계 → 정리"처럼 읽는 사람 기준으로 다시 묶는다. 나열된 항목은 표로, 흐름은 코드 블록 다이어그램으로.
4. **끝에 관련 노트**: `관련 노트: [[slug|제목]], ...` — 실제로 있는 노트만 건다.

### 넣지 않는 것

- 돈, 구직 진행 상황, 회사 내부 업무, 개인 생활 같은 사적인 정보 (사이트는 공개된다). 재료에 섞여 있으면 빼고, 뺐다고 보고한다.
- 원문 문단 통째 복사, 근거 없는 수치, 재료에 없는 내용을 사실처럼 덧붙이기.
- 시간에 민감한 사실(버전, 가격, 명령어)을 확인할 수 없으면 단정하지 말고 "글 작성 시점 기준"이라고 쓴다.

## 4. 연결하기

- 상위 인덱스 노트(`content/knowledge/<분야>.md` 또는 `<분야>/<주제>.md`)의 `## 하위 노트` 목록(없으면 표)에 한 줄 추가한다: `- [제목](분야/slug.md): 한 줄 설명`. 기존 줄의 형식을 그대로 따른다.
- 내용상 밀접한 기존 노트 1~3편의 `관련 노트` 줄에 새 노트를 역링크로 추가한다. 억지로 늘리지 않는다.

## 5. 검증

```bash
node .claude/skills/note/scripts/check-note.mjs content/knowledge/<경로>/<slug>.md
```

frontmatter 필수 필드, 파일 이름 중복, 위키링크·상대 링크 대상 존재 여부, 인덱스 등록 여부를 검사한다. 오류가 나오면 고치고 다시 돌린다. 통과 전에는 완료라고 말하지 않는다.

## 6. 보고

짧게 보고한다:

- 만든/고친 파일 경로와 사이트 URL(`/knowledge/dictionary/<분야>/<slug>` — 소문자)
- 노트 구성 한 줄 요약, 뺀 내용(사적 정보·불확실한 사실)이 있으면 그것
- 커밋 여부를 AskUserQuestion으로 묻는다. **푸시는 곧 배포**이므로 사용자가 원할 때만 한다.
  커밋 메시지 형식: `Add knowledge note: <제목>` (보강이면 `Update knowledge note: <제목>`)
