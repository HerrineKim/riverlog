---
title: "GitHub 협업 저장소 설정"
concept: "Branch Protection"
summary: "팀 저장소를 처음 세팅할 때 할 일: 협업자·브랜치 보호 규칙·CODEOWNERS·이슈/PR 템플릿·라벨, 그리고 PR 알림 도구와 기능별 브랜치 습관."
tags: ["git", "github", "collaboration", "code-review"]
source: notion
---

여러 사람이 한 저장소에서 일하려면 "누가 무엇을 리뷰하고, 무엇이 통과해야 머지되는지"를 저장소 설정으로 정해 두는 것이 좋다. 사람의 기억 대신 규칙이 지켜 주기 때문이다. 코드 리뷰 스터디를 진행하며 쓴 저장소 세팅 순서를 정리했다.

## 저장소 세팅 체크리스트

1. **Settings → Collaborators**에 팀원 추가
2. `.github/`에 이슈·PR 템플릿 추가
3. `.husky/`, `commitlint.config.js`, `.gitmessage.txt`로 커밋 규칙 자동 검사 ([커밋 컨벤션](/knowledge/dictionary/tools/git/commit-convention))
4. 관련 패키지를 `devDependencies`에 추가해 `npm install`만으로 hook이 설치되게
5. `CODEOWNERS` 추가
6. 브랜치 보호 규칙과 라벨 설정

### 템플릿 저장소로 시작하기

스터디에서는 organization에 언어·프레임워크별 **템플릿 저장소**(vite react-ts, next-ts, nestjs 등)를 미리 만들어 두고, 각자 템플릿을 받아 시작했다. 템플릿에서 받은 저장소는 원격 주소를 자기 저장소로 바꿔 준다.

```bash
git remote remove origin
git remote add origin <내 원격 저장소 주소>
```

## 브랜치 보호 규칙 (Branch protection rules)

**Settings → Branches**에서 설정한다. 보호는 feature 브랜치가 아니라 **머지 대상 브랜치**(`main`, `develop` 등)에 건다.

- **Require a pull request before merging**: 직접 push 금지, PR로만 머지
- **Required approvals**: 지정한 수만큼 승인이 있어야 머지 가능
- **Require status checks**: CI(테스트·린트)가 통과해야 머지 가능
- 관리자는 기본적으로 규칙을 우회할 수 있다. **Do not allow bypassing the above settings**를 켜야 관리자도 보호 브랜치에 직접 push하지 못한다.

> 최근 GitHub에서는 같은 기능을 더 유연하게 설정하는 **Rulesets**도 제공한다.

## CODEOWNERS

`.github/CODEOWNERS` 파일에 경로별 담당자를 적어 두면, 해당 경로를 바꾸는 PR에 담당자가 자동으로 리뷰어로 지정된다. 브랜치 보호에서 "Require review from Code Owners"를 켜면 담당자 승인이 필수가 된다.

```text
# 경로 패턴      담당자
*.ts             @frontend-team
/api/            @alice @bob
```

## 라벨

이슈·PR을 분류하는 라벨을 팀에서 의미 있게 정한다. 예: 기능 추가, 기능 개선, 오류 수정, 리팩터링, 환경 설정, 질문, 클린업, 제안.

라벨 목록을 JSON 파일로 관리하면 여러 저장소에 한 번에 적용할 수 있다.

```bash
# 토큰은 GitHub Settings → Developer settings → Personal access tokens에서 발급
npx github-label-sync --access-token <TOKEN> --labels ./labels.json <owner>/<repo>
```

## 이슈로 질문하기

코드 관련 질문은 이슈로 남기면 기록이 남고 다른 사람도 검색할 수 있다. 코드 블록에는 ```` ```javascript ```` 처럼 언어를 지정한다.

## PR 알림 도구

- **Gitify**: 데스크톱에서 GitHub 알림(PR 리뷰 요청, 코멘트)을 받는 앱
- **Slack 연동 도구**: PR 링크를 공유하고 코멘트 알림을 받는 확장 프로그램·앱(예: WorkerB, GitHub 공식 Slack 앱)

## 템플릿 참고 저장소

규모 있는 오픈 소스의 `.github/` 폴더를 보면 이슈·PR 템플릿, 라벨, 자동화 설정을 배울 수 있다: [toss/slash](https://github.com/toss/slash), [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped), [nestjs/nest](https://github.com/nestjs/nest)(husky, CI hook), [dependabot](https://github.com/dependabot) 등.

## 브랜치 습관: 기능마다 처음부터 별도 브랜치

한 브랜치에서 여러 기능을 함께 작업하면, 그중 일부만 먼저 머지해야 할 때 `git reset` 후 변경을 손으로 다시 나누는 고생을 하게 된다. 기능 하나 = 브랜치 하나 = PR 하나로 시작한다([브랜치](/knowledge/dictionary/tools/git/branch)).

## 핵심 정리

- 보호 규칙은 머지 대상 브랜치에: PR 필수, 승인 수, CI 통과, 관리자 우회 금지.
- CODEOWNERS로 리뷰어 자동 지정, 템플릿·라벨로 이슈·PR 형식 통일.
- 기능마다 브랜치를 나눠야 부분 머지가 쉽다.
