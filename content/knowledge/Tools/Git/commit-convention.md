---
title: "커밋 컨벤션과 자동 검사"
concept: "Commit Convention"
summary: "좋은 커밋 메시지의 일반 원칙과 type(scope): subject 형식의 컨벤션, 커밋 템플릿 설정, husky와 commitlint로 규칙을 자동 검사하는 방법."
tags: ["git", "collaboration", "convention", "automation"]
source: notion
date: "2026-10-13"
sources: ["https://www.conventionalcommits.org/ko/v1.0.0/", "https://commitlint.js.org/"]
---

커밋 메시지는 나중에 변경 이력을 찾는 사람이 읽는 **문서**다. 팀원마다 형식이 다르면 이력을 훑어보기 어렵기 때문에, 형식을 정하고(컨벤션) 커밋할 때 자동으로 검사하게 만든다.

## 좋은 커밋 메시지의 일반 원칙

어떤 컨벤션을 고르든 밑바탕이 되는 규칙은 같다.

- 제목은 50자 안에서, 마침표 없이, 명령문으로 쓴다(`Add`, `Fix`, `Update` …).
- 제목과 본문 사이에 빈 줄을 둔다.
- 본문에는 **무엇을, 왜** 바꿨는지 쓴다. 어떻게 바꿨는지는 diff가 말해 준다.

참고 글: [좋은 git 커밋 메시지를 작성하기 위한 7가지 약속](https://meetup.toast.com/posts/106), [좋은 git commit 메시지를 위한 영어 사전](https://blog.ull.im/engineering/2019/03/10/logs-on-git.html)

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
- **footer**: 하위 호환이 깨지는 변경(BREAKING CHANGE)은 상세 설명과 함께 적고, 처리한 이슈는 `Closes #123, #124`처럼 표기하면 GitHub가 이슈를 자동으로 닫는다.
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

## 핵심 정리

- 형식: `type(scope): subject` + 빈 줄 + body + 빈 줄 + footer.
- 제목은 명령형 현재 시제, 이슈는 `Closes #번호`.
- 커밋 템플릿으로 안내하고, husky + commitlint로 강제한다.

관련 노트: [[remote-github|원격 저장소와 GitHub]], [[github-collaboration|GitHub 협업 저장소 설정]], [[principles|코드 리뷰 원칙]], [[ci-cd|CI/CD]]
