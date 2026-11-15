---
title: "npm 스크립트로 작업 자동화하기"
concept: "npm scripts"
summary: "package.json의 scripts는 node_modules/.bin이 PATH에 들어간 셸에서 명령을 실행하는 가장 얇은 작업 실행기(task runner)다. pre/post 훅, -- 뒤 인자 전달, npm_ 환경 변수, 수명 주기 스크립트, 직렬·병렬 조합과 크로스 플랫폼 처리, 매니저별 차이(node --run 포함), 그리고 Grunt·Gulp 같은 태스크 러너가 밀려난 이유를 정리한다."
tags: ["javascript", "npm", "build", "automation", "tooling"]
source: other
date: "2026-10-21"
sources: ["https://www.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/", "https://medium.freecodecamp.com/why-i-left-gulp-and-grunt-for-npm-scripts-3d6853dd22b8", "https://medium.com/@contrahacks/gulp-3828e8126466", "http://blog.overzealous.com/post/74121048393/why-you-shouldnt-create-a-gulp-plugin-or-how-to", "https://medium.com/gulpjs/gulp-util-ca3b1f9f9ac5", "https://docs.npmjs.com/cli/v11/using-npm/scripts", "https://nodejs.org/api/cli.html#--run"]
---

> 「[How to Use npm as a Build Tool](https://www.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/)」과 「[Why I Left Gulp and Grunt for npm Scripts](https://medium.freecodecamp.com/why-i-left-gulp-and-grunt-for-npm-scripts-3d6853dd22b8)」을 뼈대로, 명령과 수명 주기는 npm 공식 문서 「[scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts)」와 Node.js 「[--run](https://nodejs.org/api/cli.html#--run)」 문서로 확인해 재구성한 노트다. 태스크 러너의 설계와 한계는 「[gulp: The vision, history, and future](https://medium.com/@contrahacks/gulp-3828e8126466)」, 「[Why you shouldn't create a gulp plugin](http://blog.overzealous.com/post/74121048393/why-you-shouldnt-create-a-gulp-plugin-or-how-to)」, 「[The Problem with gulp-util](https://medium.com/gulpjs/gulp-util-ca3b1f9f9ac5)」에서 뽑았다.

## npm 스크립트란

`package.json`의 `scripts`에 이름과 명령을 적어 두고 `npm run <이름>`으로 실행한다. 별도 도구 없이 **린트·테스트·빌드·배포 명령을 프로젝트에 붙박아 두는** 가장 얇은 작업 실행기다. 의존성을 설치하는 쪽 이야기는 [[package-managers|자바스크립트 패키지 매니저]]에 있다.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

| 성질 | 내용 |
| --- | --- |
| 셸에서 실행 | `npm run`은 셸을 띄워 명령을 실행한다. 기본은 POSIX에서 `sh`, Windows에서 `cmd.exe`다(`script-shell` 설정으로 바꾼다) |
| **`node_modules/.bin`이 PATH에** | 로컬에 설치한 도구를 `./node_modules/.bin/eslint` 대신 `eslint`로 부른다. 전역 설치가 필요 없고 팀 전체가 같은 버전을 쓴다 |
| 목록 보기 | `npm run`만 치면 정의된 스크립트를 보여 준다. 새로 온 사람이 할 수 있는 일을 한눈에 본다 |
| 줄임 명령 | `npm test`(`npm t`), `npm start`, `npm stop`, `npm restart`는 `run` 없이 된다. CI가 Node 프로젝트에서 기본으로 `npm test`를 부르는 것도 이 표준 인터페이스 덕분이다 |

## 기능

| 기능 | 쓰는 법 | 주의 |
| --- | --- | --- |
| pre/post 훅 | `prebuild`, `postbuild`를 정의하면 `npm run build` 앞뒤로 자동 실행된다. 이름은 아무것이나 된다(`prelint`) | 훅이 겹치면 숨은 순서가 생긴다. 명시적인 `&&` 조합이 읽기 쉽다 |
| 인자 전달 | `npm run test -- --grep parser` → `vitest run --grep parser`. `--` 뒤는 그대로 넘어간다 | `--` 없이 쓰면 npm 자신의 옵션으로 해석된다 |
| 환경 변수 | 스크립트 안에서 `npm_package_name`, `npm_package_version`, `npm_lifecycle_event`(지금 실행 중인 스크립트 이름)를 읽는다 | 셸 변수 문법(`$X`, `%X%`)이 OS마다 다르다. Node 스크립트 안에서 `process.env`로 읽으면 안전하다 |
| `config` 필드 | `"config": { "port": "8080" }` → `npm_package_config_port` | 잘 쓰이지 않는다. `.env`나 도구 자체 설정이 낫다 |
| 버전 올리기 | `npm version patch \| minor \| major`가 `package.json`을 고치고 커밋·태그까지 만든다. `--no-git-tag-version`으로 끈다 | 버전 규칙은 [[semantic-versioning\|유의적 버전(SemVer)]] |

### 수명 주기 스크립트

이름이 정해진 스크립트는 npm 명령이 알아서 부른다.

| 스크립트 | 언제 |
| --- | --- |
| `prepare` | `npm install`(인자 없이) 후, 그리고 패키징 전. Git 훅 설치(`husky`)에 쓴다. Git URL로 설치되는 패키지면 빌드 후 패키징 전에 돈다 |
| `prepublishOnly` | `npm publish` 때만. 배포 직전 마지막 테스트 |
| `prepack`·`postpack` | `npm pack`·`publish`로 tarball을 만들 때 |
| `preinstall`·`install`·`postinstall` | 패키지가 설치될 때. 네이티브 모듈 빌드에 쓰인다 |

`prepublish`는 `publish`와 `install` 양쪽에서 돌아 혼란을 일으켜 폐기됐고 `prepare`·`prepublishOnly`로 나뉘었다. 의존성의 설치 스크립트는 **공급망 공격 통로**이기도 해서 매니저마다 기본값으로 막는 추세다. 자세한 것은 [[package-managers|패키지 매니저]]의 공급망 보안 절에 있다.

## 작업 조합하기

| 하고 싶은 것 | 방법 |
| --- | --- |
| 차례로 실행 | `"build": "npm run build:css && npm run build:js"`. 하나가 실패(종료 코드 ≠ 0)하면 멈춘다 |
| 동시에 실행 | `&`는 셸마다 동작이 달라 피한다. `npm-run-all2`의 `run-p build:*`(직렬은 `run-s`)나 `concurrently "npm:watch:*"` |
| 파이프 | `autoprefixer < main.css \| cssmin > dist/main.css`. stdin·stdout을 지원하는 도구는 파일 없이 이어진다 |
| 감시(watch) | 도구 자체의 watch를 쓴다: `vite`, `vitest`, `tsc -w`, `node --watch server.js`. 없으면 `chokidar-cli`, `onchange` |
| 파일 지우기 | `rm -rf`는 Windows에 없다. `rimraf dist`나 `node -e "fs.rmSync('dist',{recursive:true,force:true})"` |
| 환경 변수 설정 | `NODE_ENV=production cmd`는 Windows `cmd.exe`에서 안 된다. `cross-env NODE_ENV=production cmd` 또는 도구의 `--mode` 옵션 |
| CLI가 없는 라이브러리 | `scripts/` 폴더에 Node 스크립트를 쓰고 `"favicons": "node scripts/favicons.js"`로 부른다 |

`&&`, `|`, `>`, `<`는 POSIX 셸과 `cmd.exe`에서 같게 동작한다. 이 넷만 쓰고 나머지는 npm 패키지나 Node 스크립트로 해결하면 OS를 가리지 않는다.

스크립트가 한 줄에 다 안 들어가기 시작하면 **Node 스크립트 파일로 뺀다.** JSON 문자열 안의 긴 셸 명령은 이스케이프가 지저분하고 주석도 달 수 없다.

## 실행기마다 다른 점

| 실행기 | 차이 |
| --- | --- |
| `npm run` | 임의 이름의 pre/post 훅을 실행한다 |
| `pnpm run` | `enablePrePostScripts` 설정으로 훅 실행 여부를 정한다. 워크스페이스 전체 실행은 `pnpm -r run build` |
| `yarn run`(Berry, 2 이상) | 임의 이름의 pre/post 훅을 **실행하지 않는다**(`postinstall` 같은 수명 주기만). 스크립트가 공유 셸 구현으로 돌아 Windows에서도 같은 문법을 쓴다 |
| `node --run`(Node 22+) | npm을 띄우지 않아 **시작이 빠르다.** 상위 폴더들의 `node_modules/.bin`을 PATH에 넣는다. 의도적으로 pre/post 훅을 실행하지 않고 `npm_*` 환경 변수도 만들지 않는다 |
| `bun run` | 빠른 실행. npm 스크립트 문법을 그대로 따른다 |

훅이나 `npm_package_*` 변수에 기대는 스크립트는 실행기를 바꾸면 조용히 다르게 동작한다. 팀이 쓰는 매니저를 `packageManager` 필드로 고정한다.

## 태스크 러너가 밀려난 이유

2010년대 중반까지 프런트엔드 빌드는 **Grunt**(2012, JSON 같은 설정으로 작업 정의, 단계마다 임시 파일을 디스크에 썼다)와 **Gulp**(2013, 코드로 작업 정의)가 맡았다.

Gulp의 설계는 이렇다.

| 구성 | 뜻 |
| --- | --- |
| Vinyl | 경로와 내용만 가진 **파일 객체**. 디스크가 아닌 S3·FTP의 파일도 같은 모양으로 다룬다 |
| 스트림 | `gulp.src(glob)` → `.pipe(플러그인)` → `.pipe(gulp.dest())`. 메모리에서 파일이 변환 단계를 차례로 흐른다 |
| 플러그인 | 스트림에 끼우는 **파일 변환기 하나**. 서버 실행처럼 파일 변환이 아닌 일은 플러그인으로 만들지 말고 Node 모듈을 바로 부르라는 것이 Gulp의 지침이었다 |
| 작업 순서 | Gulp 4부터 `series()`·`parallel()`로 명시한다 |

npm 스크립트로 옮겨 간 이유는 **추상화 한 겹의 비용**이었다.

1. **플러그인 작가에게 묶인다.** 도구(예: Babel 6)가 API를 바꾸면 `gulp-babel`이 따라올 때까지 새 버전을 못 쓴다. 플러그인이 원래 도구 API의 일부만 노출하기도 한다.
2. **디버깅 지점이 늘어난다.** 도구 문제인지, 플러그인 문제인지, 설정 문제인지, 버전 불일치인지 가려야 한다.
3. **문서가 둘로 갈린다.** `gulp-eslint` 문서와 ESLint 문서를 오가야 한다. 대부분의 도구는 CLI 문서가 가장 잘 정리돼 있다.
4. 스트림 속도가 필요하다는 생각은 셸 파이프로, 크로스 플랫폼 걱정은 rimraf·cross-env 같은 작은 패키지로 풀렸다.

생태계 쪽 교훈도 남았다. Gulp는 잡동사니 유틸을 모은 `gulp-util`을 폐기하며 플러그인들에게 `fancy-log`, `plugin-error`, `vinyl` 같은 **한 가지 일만 하는 작은 모듈**로 옮기라고 했다. 수천 개 플러그인이 낡은 공용 패키지에 묶여 있으면 코어를 바꿀 때 생태계 전체가 깨진다.

지금은 **번들러·개발 서버(Vite, webpack)가 변환·감시·새로고침을 맡고, npm 스크립트는 그 명령을 이름 붙여 묶는 역할**만 한다. Gulp는 5판(2024)까지 유지되지만 새 프로젝트의 기본 선택은 아니다. 모노레포에서 패키지 간 작업 순서와 캐시가 필요해지면 Turborepo·Nx 같은 작업 오케스트레이터를 npm 스크립트 위에 올린다([[monorepo-vs-polyrepo|모노레포와 폴리레포]]).

## 정리

- npm 스크립트는 `node_modules/.bin`이 PATH에 들어간 셸에서 명령을 실행한다. 도구는 전역이 아니라 devDependencies로 깐다.
- `--` 뒤 인자는 그대로 넘어가고, pre/post 훅과 수명 주기 스크립트(`prepare`, `prepublishOnly`)가 있다.
- 동시 실행·파일 삭제·환경 변수는 OS마다 달라서 `run-p`, `rimraf`, `cross-env`나 Node 스크립트로 푼다.
- `yarn`(Berry)과 `node --run`은 임의 pre/post 훅을 돌리지 않는다. 훅에 기대지 않는 스크립트가 이식성이 높다.
- 태스크 러너가 밀려난 핵심은 **도구를 플러그인으로 감싼 한 겹의 추상화**였다. 도구의 CLI를 바로 부른다.

관련 노트: [[package-managers|자바스크립트 패키지 매니저: npm, yarn, pnpm]], [[bundlers-and-vite|번들러의 역사와 Vite]], [[webpack|webpack 동작 원리]], [[eslint-prettier|ESLint와 Prettier 설정]], [[monorepo-vs-polyrepo|모노레포와 폴리레포]]
