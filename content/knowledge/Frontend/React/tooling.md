---
title: "React 빌드 환경 직접 구성하기: webpack·Babel·TypeScript"
concept: "Build Tools"
summary: "React 코드가 브라우저에서 돌기까지 Babel(문법 변환)과 webpack(번들링)이 무엇을 하는지, CDN 한 줄 실습부터 webpack+Babel+TypeScript 직접 구성, 라우팅·코드 스플리팅, 도구별 클라이언트 환경 변수 규칙까지 정리한다. CRA는 지원이 끝났다."
tags: ["react", "tooling", "typescript", "webpack", "frontend"]
source: mixed
date: "2026-10-21"
sources: ["https://riverkim.kr/45", "https://riverkim.kr/84", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Webpack.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Webpack%2C%20Babel%20%EC%82%AC%EC%9A%A9%ED%95%B4%EC%84%9C%20React%20%EA%B0%9C%EB%B0%9C%20%ED%99%98%EA%B2%BD%20%EA%B5%AC%EC%B6%95.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/webpack%20%EC%9D%B4%EB%AF%B8%EC%A7%80%2C%20%ED%8F%B0%ED%8A%B8%20loader.md", "https://webpack.js.org/guides/asset-modules/"]
---

> 「로더 규칙」과 entry·output 해시는 「[Frontend_TIL: Webpack](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Webpack.md)」, 「[Webpack, Babel 사용해서 React 개발 환경 구축](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Webpack%2C%20Babel%20%EC%82%AC%EC%9A%A9%ED%95%B4%EC%84%9C%20React%20%EA%B0%9C%EB%B0%9C%20%ED%99%98%EA%B2%BD%20%EA%B5%AC%EC%B6%95.md)」, 「[webpack 이미지, 폰트 loader](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/webpack%20%EC%9D%B4%EB%AF%B8%EC%A7%80%2C%20%ED%8F%B0%ED%8A%B8%20loader.md)」를 바탕으로 webpack 5 기준으로 보강했다.

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
| `eslint.config.js`(옛 `.eslintrc`)·`.prettierrc` | 코드 점검과 포맷. 설정 방법은 [[eslint-prettier\|ESLint와 Prettier 설정]] |

### webpack 핵심 개념

```text
entry(시작 파일) ──▶ module.rules(로더로 변환) ──▶ output(결과 번들)
                         plugins(빌드 중 부가 작업)
```

- `entry`: `{ app: './client' }` → `output.filename: '[name].js'`이면 `[name]`이 `app`으로 바뀌어 `dist/app.js`가 생성된다. 키를 여러 개 두면 결과 번들도 여러 개 나온다(페이지마다 번들이 따로 필요한 MPA). 값에 배열을 주면 여러 파일을 번들 하나로 합친다.
- `output.filename`의 자리표시자: `[name]`(entry 키), `[contenthash]`(**파일 내용**이 바뀔 때만 바뀌는 해시). 배포용은 `'[name].[contenthash].js'`로 두어, 바뀌지 않은 파일은 브라우저 캐시를 그대로 쓰게 한다. 빌드마다 바뀌는 `[fullhash]`(webpack 4의 `[hash]`)는 캐시를 매번 깨뜨린다.
- `devServer`: 개발 서버(포트, `historyApiFallback`으로 SPA 라우팅 지원, `proxy`로 API 요청 전달, [AJAX와 CORS](/knowledge/dictionary/frontend/javascript/ajax) 참고). 정적 파일 폴더는 `static`으로 지정한다(webpack-dev-server 3의 `contentBase`).
- Hot reloading: `@pmmmwh/react-refresh-webpack-plugin` + `react-refresh`로 저장 시 state를 유지한 채 화면만 갱신.
- `fork-ts-checker-webpack-plugin`: 타입 검사를 별도 프로세스에서 병렬로 돌려 빌드를 빠르게 한다.

### 로더 규칙: 무엇을 어떤 순서로 변환하나

webpack은 JavaScript와 JSON만 이해한다. 나머지 파일은 `module.rules`에서 `test`(정규식으로 파일 고르기)와 `use`(적용할 로더)로 변환한다. **`use` 배열은 뒤에서 앞으로(아래에서 위로) 실행된다.**

```js
module.exports = {
  module: {
    rules: [
      { test: /\.[jt]sx?$/, exclude: /node_modules/, use: 'babel-loader' },
      {
        test: /\.scss$/,
        // sass-loader(SCSS → CSS) → css-loader(@import·url() 해석, JS 모듈로) → 마지막 로더
        use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'sass-loader'],
      },
      { test: /\.(png|jpe?g|gif|svg|webp)$/i, type: 'asset' },
      { test: /\.(woff2?|ttf|otf)$/i, type: 'asset/resource', generator: { filename: 'fonts/[name].[contenthash][ext]' } },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: './public/index.html' }), new MiniCssExtractPlugin()],
}
```

| CSS 마지막 단계 | 결과 | 쓰는 때 |
| --- | --- | --- |
| `style-loader` | CSS를 JS 번들에 넣고 실행 시 `<style>` 태그로 삽입 | 개발. HMR이 빠르다 |
| `MiniCssExtractPlugin.loader` + 플러그인 | 별도 `.css` 파일로 뽑아 `<link>`로 건다 | 배포. JS와 병렬로 받고 따로 캐시된다 |

이미지·폰트는 webpack 5의 **에셋 모듈(asset modules)** 이 로더 없이 처리한다.

| `type` | 하는 일 | 옛 로더 |
| --- | --- | --- |
| `asset/resource` | 파일을 출력 폴더로 복사하고 URL을 돌려준다 | `file-loader` |
| `asset/inline` | base64 data URI로 번들에 넣는다. 요청이 하나 줄지만 크기가 약 33% 커지고 따로 캐시되지 않는다 | `url-loader` |
| `asset/source` | 파일 내용을 문자열로 | `raw-loader` |
| `asset` | 기본 8KB(`parser.dataUrlCondition.maxSize`)보다 작으면 inline, 크면 resource | `url-loader`의 `limit` |

에셋은 **코드에서 `import`하거나 CSS의 `url()`로 참조한 것만** 번들에 들어간다. 참조하지 않은 이미지는 출력되지 않는다. 경로를 문자열로 하드코딩하면 빌드 후 위치(`dist/fonts/…`)와 어긋나므로 `import logo from './logo.png'`처럼 모듈로 불러와 webpack이 최종 URL을 넣게 한다. 결과 URL 앞에 붙는 경로는 `output.publicPath`로 정한다. 과거 `file-loader`를 `require()`로 불러오면 ES 모듈 객체가 와서 `.default`를 붙여야 했는데, 에셋 모듈로는 그럴 일이 없다.

`HtmlWebpackPlugin`은 템플릿 HTML에 번들 `<script>`·`<link>`를 자동으로 넣어 출력 폴더에 쓴다. 폴리필은 `@babel/polyfill`(7.4에서 폐기)이 아니라 `@babel/preset-env`의 대상 브라우저 설정과 core-js로 넣는다([[babel|Babel]]).

### tsconfig 메모

- `lib: ["ES2020", "DOM"]`, `module: "esnext"`처럼 최신 문법으로 작성하되, `target`은 구형 브라우저까지 고려해 낮게 잡을 수 있다.
- `baseUrl`과 `paths`로 경로 별칭을 지정하면 `../../layouts/App` 대신 `@layouts/App`처럼 쓸 수 있다. webpack에도 `resolve.alias`를 같은 내용으로 맞춰 줘야 한다.
- `@types/xxx` 패키지는 원래 JavaScript로 작성된 라이브러리에 다른 사람이 타입 정의를 붙여 둔 것이다. 타입이 헷갈리면 에디터의 "Go to Type Definition"으로 정의를 직접 읽는다.

빌드 환경을 잡은 뒤 `pages`·`layouts`·`components`·`hooks` 같은 폴더를 어떻게 나누는지는 [[frontend-folder-structure|프론트엔드 폴더 구조의 진화]]에 있다.

## 라우팅과 코드 스플리팅

- `react-router`로 URL과 페이지 컴포넌트를 연결한다. 앱을 `BrowserRouter`로 감싸고 경로를 정의한다. (참고: v6부터 `Switch` → `Routes`, `Redirect` → `Navigate`, `component={X}` → `element={<X />}`로 바뀌었다. v7부터 `react-router` 패키지 하나로 합쳐졌고, v8에서는 호환용 `react-router-dom`도 빠졌다. [react-router 레이아웃](/knowledge/dictionary/frontend/react/react-router-layout) 참고.)
- 코드 스플리팅: 페이지별로 번들을 나눠, 회원가입 페이지에 들어온 사람은 회원가입에 필요한 JS만 받게 한다. `React.lazy` + `Suspense` 또는 `@loadable/component`를 쓴다. 첫 화면이 3초 안에 떠야 사용자가 떠나지 않는다는 점을 기억해 둔다.

## 환경 변수

클라이언트 코드에 노출되는 환경 변수는 도구별 접두사가 필요하다. `.env`는 프로젝트 루트에 두고, 바꾼 뒤에는 개발 서버를 재시작한다. 클라이언트에 노출되는 값은 비밀이 아니므로 진짜 비밀 키는 서버에만 둔다.

| 도구 | 접두사 | 읽는 법 |
| --- | --- | --- |
| Vite | `VITE_` | `import.meta.env.VITE_API_URL` |
| Next.js | `NEXT_PUBLIC_` | `process.env.NEXT_PUBLIC_API_URL` |
| CRA(종료) | `REACT_APP_` | `process.env.REACT_APP_API_URL` |

Vite가 기본으로 넣어 주는 값은 다음과 같다. 모드별로 `.env.development`, `.env.production`을 나눠 두면 `vite build --mode staging`처럼 모드에 맞는 파일(`.env.staging`)이 함께 로드된다.

| 내장 변수 | 값 |
| --- | --- |
| `import.meta.env.MODE` | 현재 모드(`development`, `production` 등) |
| `import.meta.env.BASE_URL` | 앱이 제공되는 기본 URL(`base` 설정) |
| `import.meta.env.PROD` / `DEV` | 프로덕션 / 개발 환경 여부(항상 서로 반대) |
| `import.meta.env.SSR` | 서버에서 실행 중인지 |

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| 환경 변수가 `undefined`라 API 요청이 엉뚱한 경로로 가 404가 난다 | 접두사가 없거나(`API_URL`), Vite에서 `process.env`로 읽었거나, `.env`를 바꾼 뒤 서버를 재시작하지 않았다 | 도구의 접두사를 붙이고 `import.meta.env`로 읽은 뒤 개발 서버를 재시작한다. 그래도 이상하면 값 자체가 맞는 자리에 들어갔는지, 특수문자가 있으면 따옴표로 감쌌는지 확인한다 |

## 핵심 정리

- Babel = 문법 변환(JSX, TS, 최신 JS), webpack = 파일들을 번들로 합치기.
- 새 프로젝트는 CRA 대신 Vite나 Next.js로 시작한다. 직접 구성은 도구의 역할을 이해하는 용도다.
- TypeScript는 `strict: true`, 경로 별칭은 tsconfig와 webpack 양쪽에 맞춘다.
- 페이지 단위 코드 스플리팅으로 첫 로딩에 필요한 JS만 보낸다.
- 클라이언트 환경 변수는 도구별 접두사가 필요하고, 공개된다는 것을 전제로 쓴다.

관련 노트: [[eslint-prettier|ESLint와 Prettier 설정]], [[frontend-folder-structure|프론트엔드 폴더 구조의 진화]], [[package-managers|패키지 매니저: npm, yarn, pnpm]], [[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]]
