---
title: "ESLint와 Prettier 설정"
concept: "ESLint & Prettier"
summary: "코드 품질은 ESLint가, 모양은 Prettier가 맡도록 역할을 나누고 둘이 충돌하지 않게 연결하는 방법. VS Code 저장 시 자동 수정, flat config(eslint.config.js) 읽는 법과 ESLint 10에서 제거된 .eslintrc와의 대응, husky + lint-staged로 커밋 직전에 스테이징된 파일만 검사하는 법까지. React·Vue·React Native 어디서나 절차는 같다."
tags: ["javascript", "tooling", "eslint", "prettier", "frontend"]
source: mixed
date: "2026-10-21"
sources: ["https://riverkim.kr/157", "https://eslint.org/blog/2026/02/eslint-v10.0.0-released/", "https://eslint.org/docs/latest/use/configure/configuration-files", "https://eslint.org/docs/latest/use/configure/rules#disabling-rules", "https://wesbos.com/javascript/01-the-basics/code-quality-tooling-with-prettier-and-eslint", "https://react.vlpt.us/basic/27-useful-tools.html", "https://medium.com/@okonetchnikov/make-linting-great-again-f3890e1ad6b8", "https://github.com/grab/front-end-guide"]
---

> 직접 정리한 내용에 ESLint 공식 문서와 Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)를 함께 참고해 재구성한 노트다. lint-staged는 「[Make linting great again!](https://medium.com/@okonetchnikov/make-linting-great-again-f3890e1ad6b8)」(2016.06)을 바탕으로 보강했다.
> Grab의 「[Front End Guide](https://github.com/grab/front-end-guide)」를 바탕으로 보강했다.

ESLint는 코드를 분석해 문법 오류와 안티 패턴을 찾아 주는 린터(linter)다. Prettier는 줄바꿈·따옴표·들여쓰기 같은 **모양만** 일관되게 맞추는 포매터(formatter)다. 두 도구를 함께 쓰는 이유는 역할이 다르기 때문이다. 린터는 "이 코드가 버그를 낼 수 있다"를, 포매터는 "이 코드가 팀 규칙과 다르게 생겼다"를 말한다. 어느 프레임워크를 쓰든 설정 절차는 같다.

## 역할을 나누는 원칙

| 도구 | 보는 것 | 예 |
| --- | --- | --- |
| ESLint | 코드 품질, 잠재 버그, 쓰지 않는 변수 | `no-unused-vars`, `no-console`, `eqeqeq` |
| Prettier | 코드 모양 | 세미콜론, 따옴표, 줄 길이, 들여쓰기 |
| stylelint | CSS·SCSS 품질. ESLint처럼 규칙을 켜고 끄고 플러그인을 더한다 | `color-no-invalid-hex`, `declaration-block-no-duplicate-properties`, `selector-max-specificity`. 설정은 `stylelint-config-standard`(SCSS는 `-scss`)에서 시작한다 |

이 분업의 이득은 **리뷰에서 나온다**. 따옴표·들여쓰기 같은 지적을 도구가 대신 하니 리뷰어는 로직만 본다. stylelint도 16부터 모양 규칙을 없애고 Prettier에 맡겨, CSS 쪽 역할 분담도 JS와 같아졌다.

ESLint에도 모양을 보는 규칙이 있다. 그 규칙을 켜 두면 Prettier가 고친 것을 ESLint가 다시 지적하는 식으로 **서로 고치기를 반복**한다. 그래서 모양 규칙은 모두 Prettier에 맡기고, ESLint에서는 Prettier와 겹치는 규칙을 꺼야 한다. 이 일을 `eslint-config-prettier`가 한다.

```bash
npm install -D eslint prettier eslint-config-prettier
```

`eslint-plugin-prettier`는 Prettier 결과를 ESLint 오류로 보여 주는 플러그인이다. 에디터에서 저장 시 포맷을 돌린다면 굳이 필요하지 않고, CI에서 포맷 위반을 잡고 싶을 때 쓴다.

## 검사를 거는 세 지점

같은 규칙을 세 군데에서 건다. 뒤로 갈수록 느리지만 강제력이 세다.

| 지점 | 대상 | 성격 |
| --- | --- | --- |
| 에디터 | 지금 연 파일 | 저장할 때 바로 고친다. 개인 편의라 끄거나 무시할 수 있다 |
| 커밋 훅(lint-staged) | 이번 커밋에 스테이징된 파일 | 커밋 전에 막아 피드백 고리가 짧다. `--no-verify`로 건너뛸 수 있다 |
| CI | 저장소 전체 | 위반이 있으면 머지를 막는다. **유일하게 강제되는 곳**이다 |

에디터 경고를 무시하고 커밋하면 몇 분 뒤 다른 일을 하던 중에 CI 실패 알림을 받고, 문맥을 바꿔 세미콜론 하나를 고치러 돌아와야 한다. 커밋 훅은 그 사이의 틈을 메운다.

### 1. 에디터: 저장하면 고쳐지게

**확장 프로그램만 설치하면 아무 규칙도 적용되지 않는다.** 설정 파일이 있어야 린터가 동작하고, 에디터 설정이 있어야 저장할 때 자동으로 고친다.

1. VS Code 확장 **ESLint**(오류는 빨간 줄, 경고는 노란 줄)와 **Prettier - Code formatter**를 설치한다.
2. `settings.json`에서 저장 시 동작을 켠다.

   ```json
   {
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
     "eslint.workingDirectories": [{ "mode": "auto" }]
   }
   ```

   - `defaultFormatter`: 프로젝트에 `.prettierrc`가 없어도 Prettier를 기본 포매터로 쓴다.
   - `codeActionsOnSave`: 저장할 때 ESLint가 자동으로 고칠 수 있는 것(`--fix`)을 고친다.
   - `eslint.workingDirectories`: 모노레포처럼 하위 폴더마다 설정이 다를 때 각 폴더를 기준으로 ESLint를 돌린다.

3. 프로젝트에 ESLint 설정 파일(`eslint.config.js`)과 `.prettierrc`를 만든다.
4. VS Code를 다시 시작한다. 이후에는 저장할 때마다 검사·수정된다.

### 2. 커밋 직전: lint-staged

그냥 `pre-commit` 훅에서 `eslint .`을 돌리면 큰 프로젝트에서는 수 초가 걸리고, 이번 커밋과 상관없는 파일의 오류까지 쏟아진다. **lint-staged는 스테이징된(`git add`한) 파일에만** 명령을 돌린다. Git 훅은 저장소에 커밋되지 않아 팀이 공유하기 어려우므로 husky가 `prepare` 스크립트로 훅을 설치한다.

```bash
npm install -D husky lint-staged
npx husky init                              # .husky/pre-commit 생성, prepare 스크립트 추가
echo "npx lint-staged" > .husky/pre-commit
```

```json
{
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": "stylelint --fix",
    "*.{json,md}": "prettier --write"
  }
}
```

- 명령은 glob에 맞는 스테이징 파일 목록을 인자로 받는다. 하나라도 0이 아닌 코드로 끝나면 **커밋이 취소된다.**
- `--fix`·`--write`로 고친 내용은 자동으로 다시 스테이징된다. 작업 중이던 스테이징 안 된 변경은 lint-staged가 잠시 숨겼다가 되돌린다.
- 훅은 `git commit --no-verify`로 건너뛸 수 있다. 그래서 **CI 검사는 여전히 필요하다.** 훅은 빠른 피드백, CI는 강제다.
- 커밋 메시지 검사(commitlint)도 같은 husky 훅 구조를 쓴다. [[commit-convention|커밋 컨벤션]]에 있다.

### 3. 명령으로 돌리기: 스크립트와 CI

에디터와 훅은 건너뛸 수 있으므로, 팀 전체에 규칙을 지키게 하려면 같은 검사를 명령으로 만들어 CI에서 돌린다. 도구는 전역이 아니라 **프로젝트의 devDependencies로 설치**해야 팀원과 CI가 같은 버전을 쓴다.

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

CI에서는 `npm run lint`와 `npm run format:check`를 돌려 위반이 있으면 실패시킨다.

## 규칙을 끄는 법

규칙을 지킬 수 없는 줄은 그 자리에서만 끈다. 파일 전체나 설정에서 끄기보다 범위를 좁히고 이유를 남긴다.

```js
// eslint-disable-next-line no-console -- 배포 스크립트의 진행 로그
console.log('deploying...')
```

ESLint 오류 메시지의 규칙 이름은 공식 문서의 규칙 페이지로 이어진다. 왜 지적됐는지 모르겠으면 끄기 전에 규칙 설명부터 읽는다.

## ESLint 설정 파일 읽는 법

ESLint 설정은 **flat config**(`eslint.config.js`) 하나다. 설정 객체의 **배열**을 export하고, 뒤에 오는 객체가 앞을 덮어쓴다. Vite·Next.js 템플릿도 이 형식으로 만들어 준다.

```js
// eslint.config.js
import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    rules: {
      // 개발 중에는 console.log를 허용하고, 프로덕션 빌드에서만 막는다
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },
  { ignores: ['dist/'] },
  prettier, // 마지막에 두어 Prettier와 겹치는 모양 규칙을 끈다
])
```

| 항목 | 의미 |
| --- | --- |
| 배열 순서 | 공개된 규칙 묶음(`js.configs.recommended`, 프레임워크 플러그인)을 앞에, 내 설정을 뒤에, `eslint-config-prettier`를 **맨 뒤**에 둔다 |
| `rules` | 앞에서 가져온 규칙을 하나씩 덮어쓴다. 값은 `off`·`warn`·`error`(숫자 `0`·`1`·`2`도 같다). 오류까지는 아닌 규칙(`no-unused-vars` 등)은 `warn`으로 낮춘다 |
| `languageOptions.globals` | `window`, `process`처럼 실행 환경이 정의한 전역 변수. `globals` 패키지의 묶음을 펼쳐 쓴다 |
| `files` / `ignores` | 설정을 적용할 파일과 제외할 파일. `.eslintignore` 대신 쓴다 |

ESLint는 검사하는 파일의 폴더에서 위로 올라가며 가장 가까운 `eslint.config.*`를 찾는다. 모노레포에서는 패키지마다 설정 파일을 두면 된다.

### 역사: `.eslintrc`

ESLint 8까지는 `.eslintrc.*` 파일이 기본이었다. ESLint 9(2024)에서 flat config가 기본이 되고, **ESLint 10(2026.02)에서 `.eslintrc`와 `.eslintignore` 지원이 완전히 제거됐다.** 옛 설정은 `npx @eslint/migrate-config .eslintrc.json`으로 변환한다. 옛 파일을 읽을 때는 다음처럼 대응시키면 된다.

| `.eslintrc` | flat config |
| --- | --- |
| `extends: ['eslint:recommended', 'prettier']` | 배열에 `js.configs.recommended`, `prettier`를 넣는다 |
| `env: { browser: true }` | `languageOptions.globals: globals.browser` |
| `root: true` (상위 폴더 탐색 중단) | 필요 없다. 설정 파일이 직접 합쳐지지 않는다 |
| `.eslintignore` | `ignores` |

형식은 바뀌었지만 **"규칙 묶음을 가져오고 → 필요한 것만 덮어쓰고 → Prettier 충돌 규칙을 끈다"** 는 구조는 그대로다.

한때 React 프로젝트에서는 `eslint-config-airbnb` 같은 엄격한 공유 설정을 얹는 일이 흔했다. 규칙이 많아 `react/jsx-filename-extension`처럼 팀 상황과 맞지 않는 규칙을 하나씩 꺼야 했다. 이 공식 패키지는 ESLint 8까지만 지원해 flat config에서는 바로 쓸 수 없다([[typescript-coding-convention#공개 스타일 가이드가 갈리는 지점|공개 스타일 가이드 비교]]). 지금은 템플릿이 넣어 주는 `js.configs.recommended`, `typescript-eslint`, `eslint-plugin-react-hooks` 정도에서 시작해 필요한 규칙만 더하는 쪽이 보통이다. React 훅 규칙의 `exhaustive-deps` 경고는 에디터의 빠른 수정으로 빠진 의존성을 바로 채울 수 있다.

## 정리

- ESLint는 품질, Prettier는 모양. 겹치는 규칙은 `eslint-config-prettier`로 끈다.
- 확장 프로그램 설치만으로는 동작하지 않는다. 설정 파일 + `formatOnSave` + `codeActionsOnSave`가 세트다.
- 검사는 에디터(즉시) → 커밋 훅(lint-staged, 스테이징된 파일만) → CI(강제) 세 지점에 건다. 도구는 devDependencies로 설치한다.
- 규칙은 필요한 줄에서만, 이유를 달아 끈다.
- flat config는 "규칙 묶음 배열 + 덮어쓰기"다. `.eslintrc`는 ESLint 10에서 제거됐으니 옛 프로젝트는 변환한다.
- 규칙으로 자동화할 수 없는 이름 짓기·타입·에러 처리 같은 약속은 [[typescript-coding-convention|TypeScript 코딩 컨벤션]]처럼 문서로 합의한다.

관련 노트: [[typescript-coding-convention|TypeScript 코딩 컨벤션]], [[tooling|React 빌드 환경 직접 구성하기]], [[review-patterns|코드 리뷰에서 자주 나온 지적]], [[static-analysis|정적 분석: 실행하지 않고 검사하기]]
