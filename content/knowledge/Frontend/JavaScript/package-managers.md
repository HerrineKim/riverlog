---
title: "자바스크립트 패키지 매니저: npm, yarn, pnpm"
concept: "Package Manager"
summary: "패키지 설치·업데이트·의존성 관리를 맡는 패키지 매니저의 기본(dependencies와 devDependencies, npm 스크립트, 패키지 고르는 법), npm·yarn·pnpm(그리고 Bun)의 차이와 고르는 기준, packageManager 필드와 Corepack, 설치 스크립트 차단 같은 공급망 보안 기본값, npm EINTEGRITY 오류의 원인과 해결."
tags: ["javascript", "nodejs", "frontend", "tools"]
source: mixed
date: "2026-10-21"
sources: ["https://riverkim.kr/91", "https://riverkim.kr/265", "https://nodejs.org/api/corepack.html", "https://pnpm.io/settings", "https://yarnpkg.com/blog", "https://wesbos.com/javascript/14-es-modules-and-structuring-larger-apps/82-using-open-source-npm-packages", "https://wesbos.com/javascript/01-the-basics/code-quality-tooling-with-prettier-and-eslint", "http://jeonghwan-kim.github.io/series/2019/12/09/frontend-dev-env-npm.html", "https://yarnpkg.com/en/docs/yarn-lock", "http://stackoverflow.com/questions/18875674/whats-the-difference-between-dependencies-devdependencies-and-peerdependencies", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/nvm.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/npm.md", "https://github.com/nvm-sh/nvm", "https://github.com/grab/front-end-guide"]
---

> riverkim.kr에 쓴 글들을 바탕으로, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)를 함께 참고해 재구성한 노트다. 설치 방식 비교와 `package.json` 필드는 「[프론트엔드 개발 환경의 이해: NPM](https://jeonghwan-kim.github.io/series/2019/12/09/frontend-dev-env-npm.html)」을 바탕으로 더했다. 의존성 종류와 lock 파일의 동작은 Yarn 문서 「[yarn.lock](https://yarnpkg.com/en/docs/yarn-lock)」과 Stack Overflow 문답 「[What's the difference between dependencies, devDependencies and peerDependencies](http://stackoverflow.com/questions/18875674/whats-the-difference-between-dependencies-devdependencies-and-peerdependencies)」을 바탕으로 보강했다. 「Node.js 버전 고정」은 「[Frontend_TIL: nvm](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/nvm.md)」, 「[npm](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/npm.md)」을 바탕으로 nvm 공식 README로 확인해 보강했다.
> Grab의 「[Front End Guide](https://github.com/grab/front-end-guide)」를 바탕으로 보강했다.

## 패키지 매니저란

패키지 매니저는 프로젝트에 필요한 외부 패키지를 **설치·업데이트·삭제하고, 패키지끼리의 의존성을 관리**하는 도구다. 설치 한 번이 컴퓨터와 앱에 무엇을 바꾸는지는 [[what-npm-install-does|npm install이 하는 일]]에 있다. 자바스크립트 프로젝트는 수십~수백 개의 패키지에 기대기 때문에, 어떤 버전이 설치됐는지 기록하고 누구의 컴퓨터에서든 같은 의존성을 재현하는 일이 중요하다.

| 파일 | 역할 |
| --- | --- |
| `package.json` | 필요한 패키지와 허용 버전 범위(`^1.2.0` 등)를 적는다 |
| lock 파일 (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) | 실제로 설치된 **정확한 버전과 무결성 해시**를 기록한다. 커밋해서 팀이 공유한다 |
| `node_modules/` | 설치된 패키지가 들어가는 폴더. 커밋하지 않는다 |

lock 파일은 `package.json`의 범위(`^4.0.0`, `^4.5.0`)를 실제 버전 하나(`4.6.3`)와 내려받을 주소·해시로 풀어 둔 기록이다. 범위가 겹치면 한 버전으로 합쳐 적는다. 매니저가 자동으로 고치는 파일이라 손으로 편집하지 않는다. lock 파일이 없으면 설치할 때마다 범위 안의 최신 버전을 새로 고른다. 그래서 어떤 의존성이 MINOR 업데이트에 깨지는 변경을 실수로 넣으면(유의적 버전을 어기면) **로컬에서 통과한 코드가 CI에서만 깨진다**. lock 파일은 「언제 어디서 설치해도 같은 `node_modules`」를 보장해 이 비결정성을 없앤다. **설치할 때는 최상위 프로젝트의 lock 파일만 쓰고**, 의존 패키지 안에 든 lock 파일은 무시한다. 그래서 라이브러리 작성자도 개발 재현을 위해 lock 파일을 커밋하지만, 그것이 사용자 설치 버전을 고정하지는 않는다.

## 의존성 추가와 npm 스크립트

```bash
npm install axios date-fns     # dependencies: 실행 코드가 import하는 패키지
npm install -D vite eslint     # devDependencies: 빌드·검사·테스트에만 쓰는 도구
npx eslint .                   # 전역 설치 없이 프로젝트(또는 임시로 받은) 패키지의 명령 실행
```

| 구분 | 넣는 것 | 차이가 드러나는 곳 |
| --- | --- | --- |
| `dependencies` | 앱이 실행될 때 필요한 라이브러리 | 라이브러리를 배포하면 쓰는 쪽에 함께 설치된다. 서버 배포에서 `npm ci --omit=dev`가 남기는 것 |
| `devDependencies` | 번들러, 린터, 테스트 러너, 타입 정의 | 번들러를 거치는 프런트엔드 앱은 결과물에 쓰인 코드만 담기므로 구분이 관례에 가깝다. **전이되지 않는다**: 내가 쓰는 라이브러리의 devDependencies는 내 프로젝트에 설치되지 않는다 |
| `peerDependencies` | 플러그인이 기대하는 **호스트** 패키지(React 컴포넌트 라이브러리의 `react`, ESLint 플러그인의 `eslint`) | 플러그인이 자기 사본을 따로 갖지 않고 앱이 설치한 호스트 하나를 함께 쓴다. React가 두 벌 설치되면 훅이 깨지는 것 같은 사고를 막는다. npm 7+는 빠진 peer를 자동 설치하고, 버전 범위가 충돌하면 `ERESOLVE` 오류를 낸다(`--legacy-peer-deps`는 검사를 끄는 우회일 뿐이다) |
| `optionalDependencies` | 없어도 동작하는 패키지(특정 OS용 네이티브 바이너리) | 설치에 실패해도 전체 설치가 실패하지 않는다. esbuild·SWC가 플랫폼별 바이너리를 이 방식으로 나눠 받는다 |
| `bundleDependencies` | 패키지와 함께 tarball에 넣어 배포할 의존성 | 레지스트리에서 다시 받지 않는다. 드물게 쓴다 |

- 의존성이 많으면 업데이트를 대화형으로 고른다. `pnpm update -i --latest`, `yarn upgrade-interactive`가 낡은 패키지 목록을 보여 주고 올릴 것만 체크하게 한다. npm은 `npm outdated`로 목록만 보여 주므로 `npx npm-check-updates -i`를 쓴다.
- `node_modules` 안의 파일은 **직접 고치지 않는다.** 다음 설치 때 덮어써진다. 폴더는 언제 지워도 `npm install`로 다시 만들 수 있다. 패키지를 꼭 고쳐야 하면 `pnpm patch`나 `patch-package`로 패치 파일을 남긴다.
- `package.json`의 `scripts`에 명령을 적어 두면 `npm run dev`처럼 실행한다. `start`·`test`는 `run` 없이 `npm start`·`npm test`로 줄여 쓴다. 스크립트 안에서는 `node_modules/.bin`의 명령을 경로 없이 쓸 수 있어 도구를 전역 설치할 필요가 없다. 훅·인자 전달·조합법은 [[npm-scripts|npm 스크립트로 작업 자동화하기]]에 있다.
- 패키지를 고를 때는 관리 상태(최근 릴리스, 이슈 대응), 번들 크기, **필요한 함수만 가져올 수 있는지**(`import { format } from 'date-fns'`처럼 named import로 트리 셰이킹되는지)를 본다. `fetch`, `structuredClone`, `Intl` 같은 내장 API로 충분하면 패키지를 더하지 않는다. 날짜 라이브러리의 예는 [[date-libraries|날짜 라이브러리]]에 있다.

### 왜 CDN이나 직접 내려받기 대신 매니저인가

| 방식 | 장점 | 단점 |
| --- | --- | --- |
| CDN `<script>` | 설치 없이 바로 쓴다 | CDN 장애·변조에 그대로 노출된다. 버전 관리가 HTML에 흩어진다 |
| 파일 직접 내려받기 | 외부 서버와 무관하다 | 업데이트와 호환성 확인이 전부 수작업이다 |
| 패키지 매니저 | 이름·버전 범위가 `package.json`에, 정확한 버전이 lock 파일에 남는다 | 레지스트리와 공급망을 신뢰해야 한다(아래 보안 기본값) |

`package.json`은 프로젝트 이름(`name`)·버전(`version`), 실행 명령(`scripts`), 의존성(`dependencies`, `devDependencies`)을 적는 매니페스트다. `main`·`exports`는 패키지를 **라이브러리로 배포할 때** 진입점을 알리는 필드라 앱 프로젝트에서는 보통 비워 둔다. `npm init -y`로 기본값 파일을 만든다.

`npm install react`가 `"react": "^19.2.0"`처럼 **캐럿(`^`) 범위**로 기록하는 것은 npm의 기본값이다. `^`는 같은 MAJOR 안, `~`는 같은 MINOR 안의 업데이트를 허용한다. 범위 규칙과 0.x의 예외는 [[semantic-versioning|유의적 버전]]에 있다.

## 세 가지 매니저 비교

| | npm | yarn | pnpm |
| --- | --- | --- | --- |
| 출발 | 최초의 Node.js 패키지 매니저 | Facebook이 주도해 npm의 속도·일관성·보안 문제를 보완하려고 만듦 | "performant npm". 디스크 효율을 목표로 만든 매니저 |
| 설치 | Node.js에 기본 포함 | 별도 설치 | 별도 설치 |
| 특징 | 가장 오래되어 생태계·자료가 가장 많다 | Yarn 2 이후(berry, 현재 4.x)는 Plug'n'Play·제로 인스톨 같은 새 방식을 지원한다. Rust로 다시 쓴 Yarn 6이 프리뷰 단계다([Yarn 6 Preview](https://yarnpkg.dev/blog/2026-01-28-yarn-6-preview/)). 1.x(classic)는 유지보수만 한다 | 패키지를 **전역 저장소에 한 번만 저장**하고 프로젝트에서는 링크로 연결해 디스크와 설치 시간을 아낀다. 모노레포 workspace 지원이 강하다 |
| lock 파일 | `package-lock.json` | `yarn.lock` | `pnpm-lock.yaml` |

런타임 **Bun**도 npm 호환 패키지 매니저(`bun install`, lock 파일 `bun.lock`)를 내장하고 있어 설치 속도를 앞세운 네 번째 선택지가 됐다.

pnpm의 `node_modules`는 `package.json`에 적지 않은 패키지에 접근할 수 없도록 엄격하게 구성된다. 다른 패키지의 의존성을 우연히 가져다 쓰는 "유령 의존성" 문제를 막아 주지만, 그런 패키지에 기대던 프로젝트는 옮길 때 오류가 날 수 있다.

## 어떤 것을 고를까

- 세 도구 모두 실무에서 쓰기에 충분히 안정적이다. 초기에는 yarn이 npm의 보안·속도 문제의 대안으로 꼽혔지만, npm도 lock 파일 도입 등으로 꾸준히 개선해 격차가 줄었다.
- **프로젝트 하나에는 매니저 하나만** 쓴다. lock 파일이 두 종류 섞이면 팀원마다 다른 버전이 설치된다.
- 디스크를 많이 쓰는 모노레포나 패키지가 많은 프로젝트라면 pnpm의 이점이 커진다.
- 결국은 팀 컨벤션과 배포 환경 지원 여부를 보고, 필요하면 직접 설치 속도와 방식을 비교해 정한다.

## 매니저와 버전 고정: packageManager와 Corepack

`package.json`의 `packageManager` 필드(`"packageManager": "pnpm@10.x.x"`)에 프로젝트가 쓰는 매니저와 정확한 버전을 적는다. **Corepack**은 이 필드를 읽어 맞는 yarn·pnpm을 자동으로 내려받아 실행하는 도구다. Node.js 16.9~24에는 Corepack이 함께 배포됐지만 **Node.js 25부터는 빠졌다.** 필요하면 `npm install -g corepack`으로 따로 설치하고, CI·Docker 이미지에도 설치 단계를 넣는다.

### Node.js 버전 고정: nvm과 `.nvmrc`

매니저보다 아래층인 **Node.js 버전**도 프로젝트마다 다르다. 시스템에 Node를 하나만 깔지 않고 **버전 관리자**로 여러 버전을 두고 바꿔 쓴다. 대표가 **nvm**(Node Version Manager, macOS·Linux 셸 스크립트)이고, 더 빠른 Rust 구현인 **fnm**, 여러 언어를 함께 다루는 **mise**·asdf도 같은 일을 한다. Windows는 별도 프로젝트인 nvm-windows를 쓴다.

```bash
nvm install --lts      # 최신 LTS 설치 (nvm install node 는 최신 Current)
nvm install 22         # 메이저 버전으로 설치
nvm use 22             # 이 셸에서 쓸 버전
nvm ls                 # 설치된 버전, nvm ls-remote 는 설치 가능한 버전
nvm alias default 22   # 새 셸의 기본값
echo "22" > .nvmrc     # 프로젝트 버전 기록 → 이 폴더에서 nvm use / nvm install
```

- 프로젝트 루트의 `.nvmrc`(fnm·mise도 읽는다)와 `package.json`의 `engines.node`에 버전을 적어 팀과 CI가 같은 Node를 쓰게 한다. GitHub Actions의 `actions/setup-node`도 `node-version-file: .nvmrc`로 읽는다.
- 운영에는 짝수 메이저의 **LTS**를 쓴다. 홀수 버전은 6개월만 지원된다.
- 버전 관리자로 깐 Node에서는 `npm install -g`가 그 버전 폴더 안에 들어가 `sudo`가 필요 없다. 대신 Node 버전을 바꾸면 전역 패키지도 따로다. 도구는 전역 설치보다 `devDependencies` + `npx`를 쓴다.

## 공급망 보안 기본값

npm 패키지 탈취·악성 배포 사고가 잦아지면서, 설치 중에 의존성의 `postinstall` 같은 **라이프사이클 스크립트를 실행하지 않는 것**이 기본값이 되고 있다.

| 매니저 | 동작 |
| --- | --- |
| pnpm 10+ | 의존성 빌드 스크립트를 기본으로 실행하지 않는다. 허용할 패키지만 `onlyBuiltDependencies`에 적는다 |
| Yarn 4 (4.14+) | `enableScripts` 기본값이 `false`다([4.14 발표](https://bsky.app/profile/yarnpkg.dev/post/3mjoarxwb6k2u), 2026.04) |
| npm | 기본으로 실행한다. `--ignore-scripts`나 `.npmrc`의 `ignore-scripts=true`로 끈다 |

lock 파일을 커밋하고 CI에서는 `npm ci`·`pnpm install --frozen-lockfile`처럼 lock 파일을 바꾸지 않는 명령을 쓰는 것도 같은 맥락이다.

## 트러블슈팅: `npm ERR! code EINTEGRITY`

Vercel 같은 배포 환경에서 `npm install` 단계가 다음처럼 실패할 때가 있다.

```text
npm ERR! code EINTEGRITY
npm ERR! sha512-... integrity checksum failed when using sha512: wanted sha512-... but got sha512-...
Error: Command "npm install" exited with 1
```

| 항목 | 내용 |
| --- | --- |
| 증상 | 설치 중 무결성(integrity) 검사 실패로 빌드가 멈춘다 |
| 원인 | 내려받은 패키지의 해시가 lock 파일에 기록된 해시와 다르다. 손상된 npm 캐시나 어긋난 lock 파일이 흔한 원인이다 |
| 해결 | 캐시를 비우고 lock 파일을 새로 만들어 설치한다 |

Vercel이라면 프로젝트 설정의 **Install Command**를 다음처럼 덮어쓴다.

```bash
npm cache verify && npm cache clean --force && rm -rf package-lock.json && npm install
```

다만 `package-lock.json`을 지우면 버전 범위 안에서 새 버전이 설치될 수 있다. 급한 불을 끈 뒤에는 **로컬에서 lock 파일을 다시 생성해 커밋**하고 Install Command를 원래대로 돌려 두는 편이 안전하다.

## 정리

- 패키지 매니저는 의존성 설치와 버전 재현을 맡고, 그 핵심은 lock 파일이다.
- 실행 코드는 `dependencies`, 도구는 `devDependencies`. 도구는 전역 설치 대신 npm 스크립트와 `npx`로 돌린다.
- npm은 기본 포함과 생태계, yarn은 PnP 같은 새 설치 방식, pnpm은 디스크 효율과 엄격한 의존성, Bun은 속도가 강점이다.
- 매니저 버전은 `packageManager` 필드로 고정한다. Corepack은 Node.js 25부터 따로 설치한다.
- 한 프로젝트에는 한 매니저, lock 파일은 커밋한다.
- EINTEGRITY는 해시 불일치다. 캐시를 비우고 lock 파일을 다시 만든다.

관련 노트: [[what-npm-install-does|npm install이 하는 일]], [[small-modules|작은 모듈 철학과 npm 의존성]], [[bundlers-and-vite|번들러의 역사와 Vite]], [[eslint-prettier|ESLint와 Prettier 설정]], [[ci-cd|CI/CD]], [[windows-dev-environment|Windows 개발 환경]]
