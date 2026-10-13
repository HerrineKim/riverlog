---
title: "React 빌드 환경 직접 구성하기: webpack·Babel·TypeScript"
concept: "Build Tools"
summary: "React 코드가 브라우저에서 돌기까지 Babel(문법 변환)과 webpack(번들링)이 무엇을 하는지, CDN 한 줄 실습부터 webpack+Babel+TypeScript 직접 구성, 라우팅·코드 스플리팅, 도구별 클라이언트 환경 변수 규칙까지 정리한다. CRA는 지원이 끝났다."
tags: ["react", "tooling", "typescript", "webpack", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/45", "https://riverkim.kr/84"]
---

React 코드는 그대로 브라우저에서 돌지 않는다. JSX와 최신 문법은 **Babel**이 변환하고, 흩어진 파일들은 **webpack** 같은 번들러가 하나로 합친다. Vite나 Next.js 같은 도구는 이 설정을 숨겨 두는데, 한 번 직접 구성해 보면 각 도구가 어느 단계에서 무엇을 하는지 보인다.

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
- 브라우저에서 Babel이 즉석 변환하므로 학습용으로만 쓴다. React 19부터는 UMD 빌드가 제공되지 않아, 최신 버전은 ESM CDN(esm.sh 등)을 쓴다.

## Create React App은 역사가 되었다

**CRA**(`npx create-react-app`)는 webpack·Babel·ESLint 설정을 내장해 명령 하나로 React 프로젝트를 만들어 주던 스캐폴딩 도구였다. 설정을 바꾸려면 되돌릴 수 없는 `eject`를 해야 해서 실무에서는 잘 쓰이지 않았고, 2025년 공식적으로 지원이 종료되었다. 새 프로젝트는 Vite(`npm create vite@latest`)나 Next.js로 시작한다. CRA 시절 코드를 읽을 때 `npm start`·`npm run build`·`REACT_APP_` 접두사가 나오면 이 도구의 흔적이다.

## 직접 구성하기: webpack + Babel + TypeScript

각 도구가 무엇을 하는지가 핵심이다.

| 파일/도구 | 역할 |
| --- | --- |
| `package.json` | `npm init`으로 생성. `react`, `react-dom`, `typescript`, `@types/react` 등 설치 |
| `tsconfig.json` | TypeScript 설정. `strict: true`를 켜야 타입 검사가 의미 있다 |
| `webpack.config.ts` | ts·css·json·최신 JS를 하나의 번들로 합침 |
| Babel 프리셋 | `@babel/preset-env`(최신 문법 → 구형 브라우저), `preset-react`(JSX), `preset-typescript`(TS) |
| `eslint.config.js`(옛 `.eslintrc`)·`.prettierrc` | 코드 점검과 포맷. 설정 방법은 [[eslint-prettier|ESLint와 Prettier 설정]] |

### webpack 핵심 개념

```text
entry(시작 파일) ──▶ module.rules(로더로 변환) ──▶ output(결과 번들)
                         plugins(빌드 중 부가 작업)
```

- `entry`: `{ app: './client' }` → `output.filename: '[name].js'`이면 `[name]`이 `app`으로 바뀌어 `dist/app.js`가 생성된다.
- loader: ts/tsx는 `babel-loader`, css는 `style-loader` + `css-loader`로 JS 안에 넣는다.
- `devServer`: 개발 서버(포트, `historyApiFallback`으로 SPA 라우팅 지원, `proxy`로 API 요청 전달, [AJAX와 CORS](/knowledge/dictionary/frontend/javascript/ajax) 참고).
- Hot reloading: `@pmmmwh/react-refresh-webpack-plugin` + `react-refresh`로 저장 시 state를 유지한 채 화면만 갱신.
- `fork-ts-checker-webpack-plugin`: 타입 검사를 별도 프로세스에서 병렬로 돌려 빌드를 빠르게 한다.

### tsconfig 메모

- `lib: ["ES2020", "DOM"]`, `module: "esnext"`처럼 최신 문법으로 작성하되, `target`은 구형 브라우저까지 고려해 낮게 잡을 수 있다.
- `baseUrl`과 `paths`로 경로 별칭을 지정하면 `../../layouts/App` 대신 `@layouts/App`처럼 쓸 수 있다. webpack에도 `resolve.alias`를 같은 내용으로 맞춰 줘야 한다.
- `@types/xxx` 패키지는 원래 JavaScript로 작성된 라이브러리에 다른 사람이 타입 정의를 붙여 둔 것이다. 타입이 헷갈리면 에디터의 "Go to Type Definition"으로 정의를 직접 읽는다.

빌드 환경을 잡은 뒤 `pages`·`layouts`·`components`·`hooks` 같은 폴더를 어떻게 나누는지는 [[frontend-folder-structure|프론트엔드 폴더 구조의 진화]]에 있다.

## 라우팅과 코드 스플리팅

- `react-router`로 URL과 페이지 컴포넌트를 연결한다. 앱을 `BrowserRouter`로 감싸고 경로를 정의한다. (참고: v6부터 `Switch` → `Routes`, `Redirect` → `Navigate`, `component={X}` → `element={<X />}`로 바뀌었다. v7부터 `react-router` 패키지 하나로 합쳐졌고, v8에서는 호환용 `react-router-dom`도 빠졌다. [react-router 레이아웃](/knowledge/dictionary/frontend/react/react-router-layout) 참고.)
- 코드 스플리팅: 페이지별로 번들을 나눠, 회원가입 페이지에 들어온 사람은 회원가입에 필요한 JS만 받게 한다. `React.lazy` + `Suspense` 또는 `@loadable/component`를 쓴다. 첫 화면이 3초 안에 떠야 사용자가 떠나지 않는다는 점을 기억해 둔다.

## 환경 변수 트러블슈팅

- 클라이언트 코드에 노출되는 환경 변수는 도구별 접두사가 필요하다. CRA는 `REACT_APP_`, Vite는 `VITE_`, Next.js는 `NEXT_PUBLIC_`. `.env`는 프로젝트 루트에 두고, 바꾼 뒤에는 개발 서버를 재시작한다.
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
- 새 프로젝트는 CRA 대신 Vite나 Next.js로 시작한다. 직접 구성은 도구의 역할을 이해하는 용도다.
- TypeScript는 `strict: true`, 경로 별칭은 tsconfig와 webpack 양쪽에 맞춘다.
- 페이지 단위 코드 스플리팅으로 첫 로딩에 필요한 JS만 보낸다.
- 클라이언트 환경 변수는 도구별 접두사가 필요하고, 공개된다는 것을 전제로 쓴다.

관련 노트: [[eslint-prettier|ESLint와 Prettier 설정]], [[frontend-folder-structure|프론트엔드 폴더 구조의 진화]], [[package-managers|패키지 매니저: npm, yarn, pnpm]], [[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]]
