---
title: "React 개발 환경과 빌드 도구"
concept: "Build Tools"
summary: "CRA로 시작하는 법과, webpack·Babel·TypeScript·ESLint·Prettier로 React 개발 환경을 직접 구성하는 방법."
tags: ["react", "tooling", "typescript", "webpack", "frontend"]
source: mixed
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

## 라우팅과 코드 스플리팅

- `react-router-dom`으로 URL과 페이지 컴포넌트를 연결한다. 앱을 `BrowserRouter`로 감싸고 경로를 정의한다. (참고: v6부터 `Switch` → `Routes`, `Redirect` → `Navigate`, `component={X}` → `element={<X />}`로 바뀌었다. v7부터는 `react-router` 패키지 하나로 합쳐져 `react-router-dom`은 호환용으로만 남았다 — [react-router 레이아웃](/knowledge/dictionary/frontend/react/react-router-layout) 참고.)
- 코드 스플리팅: 페이지별로 번들을 나눠, 회원가입 페이지에 들어온 사람은 회원가입에 필요한 JS만 받게 한다. `React.lazy` + `Suspense` 또는 `@loadable/component`를 쓴다. 첫 화면이 3초 안에 떠야 사용자가 떠나지 않는다는 점을 기억하자.

## 환경 변수 트러블슈팅

- CRA에서는 `REACT_APP_` 접두사가 붙은 변수만 클라이언트 코드에 노출된다(Vite는 `VITE_`, Next.js는 `NEXT_PUBLIC_`). `.env`는 프로젝트 루트에 두고, 바꾼 뒤에는 개발 서버를 재시작한다.
- "환경 변수가 인식되지 않는다"는 문제의 상당수는 **값 자체를 잘못 넣은 경우**다. 예를 들어 Firebase 설정에서 `projectId` 자리에 스토리지 버킷 주소를 넣는 실수.
- 하이픈 같은 특수문자가 들어간 값은 따옴표로 감싸 본다.
- 클라이언트에 노출되는 환경 변수는 비밀이 아니다. 진짜 비밀 키는 서버에만 둔다.

## 핵심 정리

- Babel = 문법 변환(JSX, TS, 최신 JS), webpack = 파일들을 번들로 합치기.
- 새 프로젝트는 CRA 대신 Vite나 Next.js로 시작한다.
- ESLint(검사) + Prettier(포맷) + TypeScript `strict`가 기본 세트.
- 클라이언트 환경 변수는 도구별 접두사가 필요하고, 공개된다는 것을 전제로 쓴다.
