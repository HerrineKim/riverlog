---
title: "React 개발 환경과 빌드 도구"
concept: "Build Tools"
summary: "CRA로 시작하는 법과, webpack·Babel·TypeScript·ESLint·Prettier로 React 개발 환경을 직접 구성하는 방법. ESLint·Prettier 에디터 연동과 Vite 환경 변수까지."
tags: ["react", "tooling", "typescript", "webpack", "frontend"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/45", "https://riverkim.kr/84", "https://riverkim.kr/157"]
---

React 코드는 그대로 브라우저에서 돌지 않는다. JSX와 최신 문법은 **Babel**이 변환하고, 흩어진 파일들은 **webpack** 같은 번들러가 하나로 합친다. Create React App(CRA)은 이 설정을 모두 숨겨 둔 도구이고, 직접 구성하면 각 도구의 역할을 이해할 수 있다.

## 가장 빠른 시작: CDN

설치 없이 HTML 파일 하나로 실습할 때는 CDN 스크립트를 쓴다.

```html
<div id="root"></div>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel">
  function App() {
    const [counter, setCounter] = React.useState(0)
    return <button onClick={() => setCounter((c) => c + 1)}>{counter}</button>
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<App />)
</script>
```

- 경고 메시지(PropTypes 등)를 보려면 `production.min.js` 대신 `development.js` 빌드를 써야 한다.
- 브라우저에서 Babel이 즉석 변환하므로 학습용으로만 쓴다. (참고: React 19부터 UMD 빌드가 제공되지 않아, 최신 버전은 ESM CDN(esm.sh 등)을 쓴다.)

## Create React App (CRA)

```bash
node --version && npm --version   # Node.js LTS 설치 확인
npx create-react-app my-app
cd my-app
npm start        # 개발 서버 (http://localhost:3000, 저장하면 자동 새로고침)
npm test         # 테스트 러너 (watch 모드)
npm run build    # 배포용 최적화 빌드 → build/ 폴더 (압축, 파일명에 해시)
npm run eject    # 숨겨진 설정을 프로젝트로 꺼냄 — 되돌릴 수 없음
```

- webpack, Babel, ESLint 설정이 내장된 스캐폴딩 도구다.
- 설정을 바꾸기 어려워(eject는 일방통행) 실무에서는 잘 쓰지 않았고, **CRA는 2025년 공식적으로 지원이 종료**되었다. 지금은 **Vite**(`npm create vite@latest`)나 Next.js 같은 프레임워크로 시작하는 것을 권장한다.

## 직접 구성하기: webpack + Babel + TypeScript

Slack 클론 프로젝트에서 구성한 순서. 각 도구가 무엇을 하는지가 핵심이다.

| 파일/도구 | 역할 |
| --- | --- |
| `package.json` | `npm init`으로 생성. `react`, `react-dom`, `typescript`, `@types/react` 등 설치 |
| `.eslintrc` | 코드 점검 도구. 스타일 규칙은 팀 내 충돌을 줄이기 위해 Prettier에 위임 |
| `.prettierrc` | 저장 시 코드 포맷을 자동 정리(`eslint-plugin-prettier`, `eslint-config-prettier`로 연동) |
| `tsconfig.json` | TypeScript 설정. `strict: true`를 켜야 타입 검사가 의미 있다 |
| `webpack.config.ts` | ts·css·json·최신 JS를 하나의 번들로 합침 |
| Babel 프리셋 | `@babel/preset-env`(최신 문법 → 구형 브라우저), `preset-react`(JSX), `preset-typescript`(TS) |

### webpack 핵심 개념

```text
entry(시작 파일) ──▶ module.rules(로더로 변환) ──▶ output(결과 번들)
                         plugins(빌드 중 부가 작업)
```

- `entry`: `{ app: './client' }` → `output.filename: '[name].js'`이면 `[name]`이 `app`으로 바뀌어 `dist/app.js`가 생성된다.
- loader: ts/tsx는 `babel-loader`, css는 `style-loader` + `css-loader`로 JS 안에 넣는다.
- `devServer`: 개발 서버(포트, `historyApiFallback`으로 SPA 라우팅 지원, `proxy`로 API 요청 전달 — [AJAX와 CORS](/knowledge/dictionary/frontend/javascript/ajax) 참고).
- Hot reloading: `@pmmmwh/react-refresh-webpack-plugin` + `react-refresh`로 저장 시 state를 유지한 채 화면만 갱신.
- `fork-ts-checker-webpack-plugin`: 타입 검사를 별도 프로세스에서 병렬로 돌려 빌드를 빠르게 한다.

### tsconfig 메모

- `lib: ["ES2020", "DOM"]`, `module: "esnext"`처럼 최신 문법으로 작성하되, `target`은 구형 브라우저까지 고려해 낮게 잡을 수 있다.
- `baseUrl`과 `paths`로 경로 별칭을 지정하면 `../../layouts/App` 대신 `@layouts/App`처럼 쓸 수 있다. webpack에도 `resolve.alias`를 같은 내용으로 맞춰 줘야 한다.
- `@types/xxx` 패키지는 원래 JavaScript로 작성된 라이브러리에 다른 사람이 타입 정의를 붙여 둔 것이다. 타입이 헷갈리면 에디터의 "Go to Type Definition"으로 정의를 직접 읽는다.

## 폴더 구조 예시

| 폴더 | 내용 |
| --- | --- |
| `pages` | 라우트 단위 페이지 |
| `layouts` | 페이지들이 공유하는 틀 |
| `components` | 개별 컴포넌트(폴더마다 `index.tsx` + `styles.tsx`) |
| `hooks` | 커스텀 훅 |
| `utils` | 기타 함수(fetcher 등) |
| `typings` | 공용 타입 정의 |

## ESLint와 Prettier 설정하기

**ESLint**는 코드를 분석해 문법 오류·안티 패턴을 찾아 주는 린터(linter)이고, **Prettier**는 줄바꿈·따옴표·들여쓰기 같은 모양만 일관되게 맞추는 포매터다. 둘의 규칙이 겹치면 서로 고치기를 반복하므로, 모양은 Prettier에 맡기고 ESLint는 코드 품질만 보게 연결한다. 확장 프로그램만 설치하고 설정 파일을 만들지 않으면 아무 규칙도 적용되지 않는다는 점에 주의한다. React·Vue·React Native 모두 절차가 같다.

1. 패키지 설치

   ```bash
   npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier
   ```

2. VS Code 확장 프로그램 **ESLint**(오류는 빨간 줄, 경고는 노란 줄로 표시)와 **Prettier - Code formatter**를 설치한다.

3. VS Code `settings.json`에서 저장할 때 자동으로 고치게 한다.

   ```json
   {
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
     "eslint.workingDirectories": [{ "mode": "auto" }]
   }
   ```

   `defaultFormatter`는 프로젝트에 `.prettierrc`가 없을 때도 Prettier를 기본 포매터로 쓰겠다는 뜻이다.

4. ESLint 설정 파일을 만든다(아래 표).

5. VS Code를 다시 시작한다. 이후에는 저장할 때마다 검사·수정된다.

| 설정 | 의미 |
| --- | --- |
| `root: true` | ESLint는 파일이 있는 폴더부터 상위로 올라가며 설정 파일을 찾는다. `root: true`를 만나면 거기서 멈춘다. 모노레포에서 저장소 공통 설정과 프로젝트별 설정을 나눌 때 쓴다 |
| `extends` | 공개된 규칙 묶음을 가져온다. 예: `eslint:recommended`, `plugin:vue/vue3-essential`, Prettier와 겹치는 규칙을 끄는 `prettier` |
| `rules` | `extends`로 가져온 규칙을 하나씩 덮어쓴다 |
| `env` | `browser`, `node`처럼 전역 변수가 정의된 실행 환경 |

```js
// .eslintrc.js (ESLint 8까지의 형식)
module.exports = {
  root: true,
  env: { browser: true, node: true },
  extends: ['eslint:recommended', 'plugin:vue/vue3-essential', 'prettier'],
  rules: {
    // 개발 중에는 console.log를 허용하고, 프로덕션 빌드에서만 막는다
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
}
```

> 참고: ESLint 9(2024)부터는 `.eslintrc.*` 대신 **flat config**(`eslint.config.js`, 설정 객체 배열을 export)가 기본이다. `root`·`env`는 없어지고 `languageOptions.globals`로 대신한다. Vite·Next.js 템플릿은 이미 flat config로 만들어 준다. 위 표의 개념(규칙 묶음 가져오기 → 덮어쓰기)은 그대로다.

## 라우팅과 코드 스플리팅

- `react-router-dom`으로 URL과 페이지 컴포넌트를 연결한다. 앱을 `BrowserRouter`로 감싸고 경로를 정의한다. (참고: v6부터 `Switch` → `Routes`, `Redirect` → `Navigate`, `component={X}` → `element={<X />}`로 바뀌었다. v7부터는 `react-router` 패키지 하나로 합쳐져 `react-router-dom`은 호환용으로만 남았다 — [react-router 레이아웃](/knowledge/dictionary/frontend/react/react-router-layout) 참고.)
- 코드 스플리팅: 페이지별로 번들을 나눠, 회원가입 페이지에 들어온 사람은 회원가입에 필요한 JS만 받게 한다. `React.lazy` + `Suspense` 또는 `@loadable/component`를 쓴다. 첫 화면이 3초 안에 떠야 사용자가 떠나지 않는다는 점을 기억하자.

## 환경 변수 트러블슈팅

- CRA에서는 `REACT_APP_` 접두사가 붙은 변수만 클라이언트 코드에 노출된다(Vite는 `VITE_`, Next.js는 `NEXT_PUBLIC_`). `.env`는 프로젝트 루트에 두고, 바꾼 뒤에는 개발 서버를 재시작한다.
- Vite는 `process.env` 대신 **`import.meta.env`** 객체로 환경 변수를 읽는다. `VITE_` 접두사가 없는 변수는 `import.meta.env`에 들어가지 않는다. 예를 들어 `.env`에 `VITE_API_URL`이 빠져 있으면 API 주소가 `undefined`가 되어 요청이 엉뚱한 경로로 가고 404가 난다.

  | 내장 변수 | 값 |
  | --- | --- |
  | `import.meta.env.MODE` | 현재 모드(`development`, `production` 등) |
  | `import.meta.env.BASE_URL` | 앱이 제공되는 기본 URL(`base` 설정) |
  | `import.meta.env.PROD` / `DEV` | 프로덕션 / 개발 환경 여부(항상 서로 반대) |
  | `import.meta.env.SSR` | 서버에서 실행 중인지 |

  모드별로 `.env.development`, `.env.production` 파일을 나눠 두면 `vite build --mode staging`처럼 모드에 맞는 파일(`.env.staging`)이 함께 로드된다.
- "환경 변수가 인식되지 않는다"는 문제의 상당수는 **값 자체를 잘못 넣은 경우**다. 예를 들어 Firebase 설정에서 `projectId` 자리에 스토리지 버킷 주소를 넣는 실수.
- 하이픈 같은 특수문자가 들어간 값은 따옴표로 감싸 본다.
- 클라이언트에 노출되는 환경 변수는 비밀이 아니다. 진짜 비밀 키는 서버에만 둔다.

## 핵심 정리

- Babel = 문법 변환(JSX, TS, 최신 JS), webpack = 파일들을 번들로 합치기.
- 새 프로젝트는 CRA 대신 Vite나 Next.js로 시작한다.
- ESLint(검사) + Prettier(포맷) + TypeScript `strict`가 기본 세트. 확장 프로그램만으로는 안 되고 설정 파일과 저장 시 자동 수정을 켜야 한다.
- 클라이언트 환경 변수는 도구별 접두사가 필요하고, 공개된다는 것을 전제로 쓴다.
