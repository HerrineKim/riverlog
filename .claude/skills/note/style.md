# riverlog 지식 노트 스타일

기준 예시: `content/knowledge/AI-Data/loop-engineering.md`, `AI-Data/vibe-coding-beautiful-ui.md`, `AI-Data/claude-skill-building-guide.md`. 애매하면 이 세 편을 열어 보고 맞춘다.

## frontmatter

```yaml
---
title: "루프 엔지니어링"            # 한국어 제목. 고유명사·용어는 원어 유지 가능
concept: "Loop Engineering"        # 지도에 뜨는 짧은 개념어 (1~3단어, 보통 영어)
summary: "한두 문장. 무엇을 다루고 핵심 결론이 뭔지. 목록·카드에 그대로 보인다."
tags: ["ai", "llm", "agent"]       # 3~6개, 소문자 kebab-case
source: other                      # til | notion | mixed | other — 외부 글·자료 정리는 other
date: "2026-10-12"                 # 오늘 날짜
sources: ["https://..."]           # 선택. 원문 URL (http/https만 표시됨)
publish: false                     # --draft일 때만
---
```

### 태그

태그가 2개 이상 겹치는 노트끼리 지도에서 연결된다. **새 태그를 만들기 전에 기존 태그를 먼저 쓴다.**

```bash
grep -rhoE '^tags: .*' content/knowledge | tr -d '[]"' | sed 's/tags: //' | tr ',' '\n' | sed 's/^ //' | sort | uniq -c | sort -rn | head -60
```

분야 대표 태그(frontend, backend, ai, career, algorithm, database …) 1개 + 구체 태그 2~5개가 보통이다.

## 문체

- 노트 본문은 **평서체 "~다"**. (분야 인덱스 노트 머리말만 "~습니다")
- 출처 인용 블록만 "~노트입니다."로 끝낸다.
- 한 문장에 한 주장. 짧게 끊는다. 핵심 문장은 **굵게**.
- 원문 표현을 옮기지 말고 내 말로 다시 쓴다. 영어 원문의 핵심 용어는 `한국어(English)`로 한 번 병기.
- 원문 주장과 내 판단을 섞지 않는다. 덧붙이는 의견은 `정리` 섹션에서 분명히 내 말로 쓴다.

## 본문 구성

```markdown
> 글쓴이의 「[원제](URL)」(YYYY.MM)를 요약·재구성한 노트입니다. [시점 경고 필요 시]

## <개념>이란          ← 한 문단 정의 + 왜 중요한지

## 구성 요소 / 핵심 원칙  ← 항목이 3개 이상이면 표 (| 항목 | 역할 | 예시 |)

### 1. 소제목         ← 팁·단계형 자료는 번호 붙인 h3

## 예시 / 흐름         ← 절차·구조는 ```text 블록의 트리 다이어그램

## 한계와 위험 (있으면)

## 정리               ← 3~5개 불릿, 마지막에 한 줄 결론

관련 노트: [[slug|제목]], [[slug|제목]]
```

- h1(`#`)은 쓰지 않는다. 제목은 frontmatter의 title이 맡는다.
- 분량은 대략 50~190줄. 원문이 길어도 줄이고, 짧은 팁 모음이면 50줄 안팎이면 충분하다.
- 코드·명령어는 언어 표시를 단 코드 블록으로.
- 이미지가 필요하면 `content/attachments/`에 넣고 `![[파일.png]]`.

## 링크

- 지식 노트끼리: `[[slug|보일 제목]]` (slug = 확장자 뺀 파일 이름)
- 인덱스 노트의 하위 목록: `- [제목](AI-Data/slug.md): 한 줄 설명` — content/knowledge 기준 상대 경로
- 책·블로그: `[[books/파일명]]`, `[[blog/파일명]]`
- 외부: 일반 마크다운 링크

## 출처 표기 패턴

| 재료 | 인용 문장 |
| --- | --- |
| 블로그 글 | `> Addy Osmani의 글 「[Loop Engineering](URL)」(2026.06)을 요약·재구성한 노트입니다.` |
| SNS 팁 | `> SNS에서 돌던 「제목」 팁 7가지를 정리한 노트입니다. 원문 번역이 아니라 요약·재구성했습니다.` |
| 2차 자료 + 원자료 | 2차 자료를 먼저 밝히고, "원 자료는 …"으로 1차 자료를 덧붙인다 |
| 강의·영상 | `> <강연자>의 「제목」(행사, YYYY) 강연을 정리한 노트입니다.` |
| 직접 겪은 것·여러 자료 종합 | 인용 블록 생략 가능. `source: mixed` |
