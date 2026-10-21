---
title: "Markdown 문법"
concept: "Markdown"
summary: "간단한 기호만으로 제목·목록·코드·링크·표 등을 표현하는 경량 마크업 언어의 기본 문법과 Mermaid 다이어그램, markdownlint."
tags: ["markdown", "writing", "documentation"]
source: mixed
date: "2026-10-21"
sources: ["https://80000coding.notion.site/85df6351e0bd4b0c88c07431df7515df", "https://daringfireball.net/projects/markdown/syntax", "https://guides.github.com/features/mastering-markdown/", "https://githubengineering.com/a-formal-spec-for-github-markdown/"]
---

> 「Mermaid」 부분은 팔만코딩경(42Seoul 커뮤니티 위키)의 「노션에서 다이어그램 만들기」를 바탕으로 보강했다. 설계 원칙과 표준은 「[Markdown: Syntax](https://daringfireball.net/projects/markdown/syntax)」와 GitHub의 「[Mastering Markdown](https://guides.github.com/features/mastering-markdown/)」을 바탕으로 보강했다. GFM 명세의 공개 배경은 「[A formal spec for GitHub Flavored Markdown](https://githubengineering.com/a-formal-spec-for-github-markdown/)」을 바탕으로 더했다.

Markdown은 `#`, `-`, `*` 같은 간단한 기호로 문서 구조를 표현하는 **경량 마크업 언어**다. README, TIL, 블로그, 기술 문서 대부분이 Markdown으로 쓰이고, 결국 HTML로 변환되어 보인다.

## 설계 원칙과 표준

**Markdown의 최우선 목표는 변환하지 않은 원문 그대로도 읽히는 것이다.** 기호는 이메일에서 사람들이 쓰던 관습(`*강조*`, `>` 인용, `-` 목록)에서 가져왔다. 그래서 렌더러 없이 터미널에서 열어도 문서 구조가 보인다.

| 규칙 | 내용 |
| --- | --- |
| HTML 섞어 쓰기 | Markdown에 없는 것은 HTML 태그를 그대로 쓴다. 단 `<div>`, `<table>` 같은 블록 태그 **안의** Markdown 문법은 원래 명세에서 처리되지 않는다(앞뒤에 빈 줄을 두면 처리하는 렌더러가 많다) |
| 문단과 줄바꿈 | 빈 줄이 문단을 나눈다. 줄 끝에서 Enter만 치면 같은 문단으로 이어진다. 강제 줄바꿈은 줄 끝 공백 두 칸이나 `<br>` |
| 특수 문자 | `&`, `<`는 자동으로 HTML 엔티티가 된다. 문법 기호를 글자로 쓰려면 백슬래시로 이스케이프한다: `` \* \_ \` \# \[ \] `` |

| 표준·방언 | 내용 |
| --- | --- |
| 원래 Markdown(2004) | John Gruber의 문법 문서와 Perl 스크립트. 모호한 경우가 많아 렌더러마다 결과가 달랐다 |
| **CommonMark** | 그 모호함을 없앤 명세와 테스트 모음. 대부분의 현대 렌더러가 기준으로 삼는다 |
| **GFM**(GitHub Flavored Markdown) | CommonMark에 표, 작업 목록(`- [ ]`), 취소선(`~~`), 자동 링크를 더한 GitHub의 명세. 2017년 형식 명세와 C 참조 구현(cmark-gfm)을 공개해, 다른 도구도 GitHub과 같은 결과로 미리 보기를 만들 수 있게 됐다. GitHub에서는 여기에 `@멘션`, `#이슈번호` 참조, 언어 지정 코드 블록 하이라이트, Mermaid, 경고 블록(`> [!NOTE]`)이 더해진다 |

표·취소선·작업 목록은 원래 Markdown에 없는 GFM 확장이라 다른 도구에서는 안 보일 수 있다.

## 제목 (Heading)

`#`의 개수로 h1~h6를 표현한다. `#` 뒤에는 공백이 필요하다.

```markdown
# 제목 1
## 제목 2
### 제목 3
###### 제목 6
```

## 목록

```markdown
- 딸기            <!-- 순서 없는 목록: *, -, + 모두 가능 -->
- 사과
  - 아오리 사과   <!-- 들여쓰기(Tab)로 하위 목록 -->

1. 세수          <!-- 순서 있는 목록 -->
2. 아침
3. 출근
```

## 코드

인라인 코드는 백틱 하나(`` `code` ``), 여러 줄 코드는 백틱 세 개로 감싸고 **언어 이름**을 적으면 문법 강조가 적용된다.

````markdown
```python
for i in range(5):
    print(i)
```
````

## 링크와 이미지

```markdown
[구글](https://google.com)
![대체 텍스트](images/photo.png)
```

이미지 크기를 조절하려면 HTML 태그를 직접 쓴다.

```html
<img src="images/photo.png" width="450" alt="설명">
```

> 로컬 에디터(Typora 등)에서 이미지를 붙여 넣을 때는 **상대 경로**로 저장되도록 설정하고, 이미지 폴더(`*.assets`)를 문서와 함께 올려야 다른 곳에서도 깨지지 않는다. `C:\Users\...` 같은 절대 경로는 내 컴퓨터에서만 보인다.

## 인용문

```markdown
> Life is short, you need Python!
>
> > 중첩 인용
> >
> > > 3단계 인용
```

## 표

```markdown
| 이름 | 나이 | 비고 |
| ---- | :--: | ---: |
| 포터 | 3    | 왼쪽/가운데/오른쪽 정렬 |
```

두 번째 줄의 `:` 위치로 정렬을 지정한다. (Typora에서는 `Ctrl + T`로 표를 삽입할 수 있다.)

## 텍스트 강조와 기타

| 문법 | 결과 |
| --- | --- |
| `*기울임*` 또는 `_기울임_` | *기울임* |
| `**굵게**` | **굵게** |
| `***굵은 기울임***` | ***굵은 기울임*** |
| `~~취소선~~` | ~~취소선~~ |
| `---` 또는 `***` (한 줄 단독) | 수평선 |

## 코드로 그리는 다이어그램: Mermaid

**Mermaid**는 텍스트 문법으로 순서도·시퀀스 다이어그램·간트 차트 등을 그리는 도구다. 코드 블록의 언어를 `mermaid`로 지정하면 GitHub, GitLab, Notion, Obsidian이 블록을 그림으로 바꿔 보여 준다. 그림 파일과 달리 텍스트라서 diff로 변경을 추적하고 고치기 쉽다.

```text
graph TD
    A(기상) --> B((샤워))
    B --> C{출근할까?}
    C -.->|Yes| D[나갈 준비]
    C -.->|No| E[다시 잠]
```

| 문법 | 뜻 |
| --- | --- |
| `graph TD` / `graph LR` | 위→아래 / 왼쪽→오른쪽 방향의 순서도 (`flowchart`도 같다) |
| `A[글]`, `A(글)`, `A{글}`, `A((글))` | 사각형, 둥근 사각형, 마름모(조건), 원 노드 |
| `-->`, `---`, `-.->` | 화살표, 선, 점선 화살표 |
| `-->|글|` | 화살표에 이름 붙이기 |
| `%% 주석` | 주석 |

`sequenceDiagram`, `classDiagram`, `erDiagram`, `gantt` 같은 다른 다이어그램 종류도 있다. [Mermaid Live Editor](https://mermaid.live)에서 미리 보며 작성할 수 있다.

## 문법 검사: markdownlint

Markdown은 문법이 틀려도 에러 없이 그냥 이상하게 렌더링될 뿐이라, 실수를 알아채기 어렵다. **markdownlint**(VS Code 확장, CLI)를 쓰면 다음을 얻을 수 있다.

1. **일관된 스타일**: "제목에 굵게(`**`)를 겹쳐 쓰지 않는다", "목록 기호를 통일한다", "제목 앞뒤에 빈 줄" 같은 규칙을 팀 전체에 적용한다.
2. **구문 오류 검출**: 맞춤법 검사기로는 못 잡는 깨진 표, 닫히지 않은 코드 블록, 잘못된 제목 단계 등을 찾아 준다.
3. 함께 쓰면 좋은 에디터 확장(Markdown All in One 등)은 단축키, 표 자동 정렬, 이미지·링크 경로 자동 완성 같은 편의 기능을 더해 준다.

규칙은 프로젝트 루트의 `.markdownlint.json`으로 켜고 끈다.

관련 노트: [[latex|LaTeX 시작하기]], [[vscode|VS Code 설정과 활용]]
