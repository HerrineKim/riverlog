---
title: "커밋 컨벤션과 자동 검사"
concept: "Commit Convention"
summary: "좋은 커밋 메시지의 7가지 규칙(빈 줄, 50/72자, 명령문 제목, 무엇·왜 본문)과 type(scope): subject 형식의 컨벤션, 커밋 템플릿 설정, husky와 commitlint로 규칙을 자동 검사하는 방법."
tags: ["git", "collaboration", "convention", "automation"]
source: notion
date: "2026-10-14"
sources: ["https://meetup.nhncloud.com/posts/106", "https://cbea.ms/git-commit/", "https://www.conventionalcommits.org/ko/v1.0.0/", "https://commitlint.js.org/", "https://80000coding.notion.site/00bcbffd6fbb4be481abef0925efd267", "https://80000coding.notion.site/eed9ae12cbf24ee58256821ca5c5947c", "https://pre-commit.com/"]
---

> NHN Cloud Meetup의 「[좋은 git 커밋 메시지를 작성하기 위한 7가지 약속](https://meetup.nhncloud.com/posts/106)」(2017.03)을 바탕으로 원칙 부분을 보강한 노트다. 원 자료는 Chris Beams의 「[How to Write a Git Commit Message](https://cbea.ms/git-commit/)」다.
> 팔만코딩경(42Seoul 커뮤니티 위키)의 「Git 커밋 메시지 컨벤션」, 「Git 커밋할 때 코드 스타일 검사하기」도 함께 반영했다.

커밋 메시지는 나중에 변경 이력을 찾는 사람이 읽는 **문서**다. 팀원마다 형식이 다르면 이력을 훑어보기 어렵기 때문에, 형식을 정하고(컨벤션) 커밋할 때 자동으로 검사하게 만든다.

## 좋은 커밋 메시지의 일반 원칙

어떤 컨벤션을 고르든 밑바탕이 되는 규칙은 같다. 영어 메시지 기준이며, 한국어로 쓸 때는 1·2·7번만 지켜도 충분하다.

| # | 규칙 | 이유 |
| --- | --- | --- |
| 1 | 제목과 본문 사이에 빈 줄 | Git은 첫 빈 줄 앞까지를 제목으로 본다 |
| 2 | 제목은 50자 안팎(넘어도 72자 이내) | `--oneline`, GitHub 목록에서 잘리지 않는다 |
| 3 | 제목 첫 글자는 대문자 | 영어 문장 관례 |
| 4 | 제목 끝에 마침표 없음 | 제목은 문장이 아니라 헤드라인이다 |
| 5 | 제목은 명령문(동사원형으로 시작) | Git이 스스로 만드는 메시지와 형식이 같다 |
| 6 | 본문은 72자에서 줄 바꿈 | Git은 메시지를 자동으로 줄 바꾸지 않는다 |
| 7 | 본문은 **무엇을, 왜**를 쓴다 | 어떻게 바꿨는지는 diff가 말해 준다 |

### 제목과 본문을 빈 줄로 나누는 이유

Git의 여러 명령이 첫 빈 줄 앞을 제목으로 다룬다. `git log --oneline`, `git shortlog`, `git format-patch`(메일 제목)가 모두 그렇다. 빈 줄이 없으면 본문 전체가 한 줄로 붙어 나온다.

```text
$ git log --oneline
42e769 Derezz the master control program                  ← 빈 줄 있음
42e769 Derezz the master control program MCP turned out…  ← 빈 줄 없음
```

오타 수정처럼 사소한 변경은 본문 없이 제목 한 줄이면 된다.

### 제목을 명령문으로 쓰는 이유

`git merge`, `git revert`, GitHub의 PR 머지 버튼이 만드는 메시지가 모두 명령문이다(`Merge branch 'x'`, `Revert "…"`, `Merge pull request #123 …`). 직접 쓴 커밋도 같은 형식이면 자동 커밋 사이에서 어색하지 않다.

헷갈리면 **"If applied, this commit will ___"** 빈칸에 제목을 넣어 본다.

| 문장이 된다 ✓ | 안 된다 ✗ |
| --- | --- |
| Refactor subsystem X for readability | Fixed bug with Y |
| Remove deprecated methods | Changing behavior of X |
| Release version 1.0.0 | More fixes for broken stuff |

명령문 규칙은 제목에만 적용한다. 본문은 평서문으로 쓴다.

### 본문 예시

```text
Simplify serialize.h's exception handling

Remove the 'state' and 'exceptmask' from serialize.h's stream
implementations, as well as related methods.

As exceptmask always included 'failbit', and setstate was always
called with bits = failbit, all it did was immediately raise an
exception. Get rid of those variables, and replace the setstate
with direct exception throwing (which also removes some dead
code).
```

첫 문단이 무엇을 바꿨는지, 둘째 문단이 왜 그래도 되는지를 말한다. 줄은 72자 안에서 끊었다.

### 커밋 메시지로 이슈 닫기

GitHub는 커밋 메시지나 PR 본문에 `키워드 #이슈번호`가 있으면 이슈를 자동으로 닫는다. 키워드는 `close`·`closes`·`closed`, `fix`·`fixes`·`fixed`, `resolve`·`resolves`·`resolved`이며 기능 차이는 없다. 다른 저장소 이슈는 `Fixes owner/repo#10`처럼 쓴다.

- 커밋 메시지의 키워드는 그 커밋이 **기본 브랜치에 들어갈 때** 동작한다. `develop`에 푸시한 커밋은 기본 브랜치로 머지될 때 이슈를 닫는다.
- 여러 이슈를 닫으려면 키워드를 이슈마다 붙인다: `Closes #128, closes #129, fixes #78`.

영어 제목에 쓸 동사와 패턴은 [[commit-message-verbs|영어 커밋 메시지 동사 사전]]에 있다.

## 메시지 형식: Conventional Commits

가장 널리 쓰는 형식은 Angular 커밋 규칙에서 나온 **[Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/)** 표준이다. Udacity 컨벤션도 같은 세 부분 구조다. 이 형식을 지키면 변경 로그 생성과 시맨틱 버전 결정(`feat` → minor, `BREAKING CHANGE` → major)을 도구가 자동으로 해 준다.

```text
<type>(<scope>): <subject>      ← 제목: 무엇을 바꿨는지 짧게
<빈 줄>
<body>                           ← 본문: 왜 바꿨는지, 전후 비교
<빈 줄>
<footer>                         ← 꼬리말: 큰 변경 사항, 관련 이슈
```

- **subject**: 변경 내용을 짧게. 위 일반 원칙대로 명령형 현재 시제(`changed` ✗ → `change` ✓).
- **body**: 수정 이유와 전후 비교.
- **footer**: 하위 호환이 깨지는 변경(BREAKING CHANGE)은 상세 설명과 함께 적는다. 이슈 번호는 꼬리말에 쓴다(키워드는 위 「커밋 메시지로 이슈 닫기」 참고).
- scope는 선택. 이슈 번호를 제목에 붙이는 팀도 있다: `feat(login): #42 - 소셜 로그인 추가`

### type 목록

`@commitlint/config-conventional`이 허용하는 type은 다음과 같다.

| type | 의미 |
| --- | --- |
| `feat` | 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서만 변경 |
| `style` | 코드 동작 변경 없는 포맷팅 |
| `refactor` | 동작은 그대로, 구조 개선 |
| `perf` | 성능 개선 |
| `test` | 테스트 추가·수정 |
| `build` · `ci` | 빌드 시스템·CI 설정 |
| `chore` | 그 밖의 잡무(패키지 정리 등) |
| `revert` | 이전 커밋 되돌리기 |

팀에 따라 type 앞에 이모지를 붙이거나(🐛 `fix`) `cleanup` 같은 고유 type을 더한다. 그런 규칙을 정규식으로 쓰면 이런 모양이다.

```javascript
/^(🎨|🐛|💄|♻️|🗑️|🚧|🧪)(feat|fix|style|refactor|cleanup|chore|test)\s:\s.+/
```

## 커밋 템플릿

`git commit`을 실행했을 때 에디터에 미리 채워질 안내문을 지정할 수 있다.

```bash
git config --global core.editor "code --wait"            # 커밋 에디터를 VS Code로
git config --global commit.template ~/.gitmessage.txt     # 템플릿 파일 지정
```

`.gitmessage.txt`에는 type 목록과 형식을 `#` 주석으로 적어 두면, 커밋할 때마다 규칙을 보면서 쓸 수 있다(주석 줄은 메시지에 포함되지 않는다).

## 자동 검사: husky + commitlint

- **husky**: Git hook(커밋·푸시 같은 이벤트 전후에 실행되는 스크립트)을 `package.json` 프로젝트에서 쉽게 관리하게 해 주는 도구. `npm install` 후 자동으로 hook이 설치된다.
- **commitlint**: 커밋 메시지가 규칙에 맞는지 검사한다. `commit-msg` hook에서 실행해, 규칙에 어긋나면 커밋을 막는다.
- 같은 방식으로 `pre-commit` hook에서 lint·테스트를 돌리면(lint-staged 등) 리뷰 전에 기본적인 문제를 걸러 낼 수 있다.

```bash
npm install -D husky @commitlint/cli @commitlint/config-conventional
npx husky init
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

```javascript
// commitlint.config.js
export default { extends: ['@commitlint/config-conventional'] }
```

팀 고유 type(이모지 등)을 쓴다면 `rules`에서 `type-enum`이나 정규식 파서를 직접 지정한다.

### Git hook과 언어 무관한 `pre-commit` 프레임워크

Git hook은 저장소의 `.git/hooks/`에 이벤트 이름(`pre-commit`, `commit-msg`, `pre-push` 등)으로 둔 실행 파일이다. `git init`하면 `*.sample` 예제가 들어 있다. 다만 `.git/` 안은 커밋되지 않아 팀원에게 그대로 공유되지 않으므로, 설정 파일을 저장소에 두고 hook을 설치해 주는 도구를 쓴다. Node 프로젝트는 husky, 언어와 무관하게는 Python으로 만든 **pre-commit**이 대표적이다.

```yaml
# .pre-commit-config.yaml: C/C++ 코드를 clang-format으로 검사
repos:
  - repo: https://github.com/pre-commit/mirrors-clang-format
    rev: v21.1.0          # 고정된 태그. pre-commit autoupdate로 갱신
    hooks:
      - id: clang-format
        args: [--style=Google]
```

```bash
pip install pre-commit      # 또는 brew install pre-commit
pre-commit install          # .git/hooks/pre-commit 설치
pre-commit run --all-files  # 전체 파일에 한 번 실행
```

이후 커밋할 때마다 스테이징된 파일에 hook이 돌고, 포매팅이 어긋난 파일이 있으면 고쳐 놓고 커밋을 실패시킨다. 고쳐진 파일을 다시 `add`해 커밋하면 된다. 설정 파일은 팀이 같은 검사를 받도록 **저장소에 커밋하는 것이 원칙**이다. 로컬 hook은 `--no-verify`로 건너뛸 수 있으므로, 반드시 지켜야 할 검사는 CI에서도 한 번 더 돌린다.

## 핵심 정리

- 형식: `type(scope): subject` + 빈 줄 + body + 빈 줄 + footer.
- 제목은 50자 안팎의 명령문, 본문은 72자 줄 바꿈으로 무엇·왜를 쓴다.
- 이슈는 `Closes #번호`로 닫는다(기본 브랜치에 들어갈 때 동작).
- 커밋 템플릿으로 안내하고, husky + commitlint(또는 pre-commit)로 강제한다. 필수 검사는 CI에서도 돌린다.

관련 노트: [[remote-github|원격 저장소와 GitHub]], [[github-collaboration|GitHub 협업 저장소 설정]], [[principles|코드 리뷰 원칙]], [[ci-cd|CI/CD]], [[commit-message-verbs|영어 커밋 메시지 동사 사전]]
