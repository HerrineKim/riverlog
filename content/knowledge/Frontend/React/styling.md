---
title: "React 스타일링: Sass, CSS Modules, styled-components"
concept: "Styled Components"
summary: "React 컴포넌트에 스타일을 입히는 방법들. Sass와 clsx로 옵션이 많은 재사용 컴포넌트 만들기, CSS Modules의 고유 클래스 이름과 :global, CSS-in-JS 라이브러리 styled-components·emotion의 css 헬퍼·테마·transient props·퇴장 애니메이션까지."
tags: ["react", "css", "styling", "frontend"]
source: mixed
date: "2026-10-21"
sources: ["https://styled-components.com/docs/faqs", "https://github.com/styled-components/styled-components/releases", "https://react.vlpt.us/styling/", "https://react.vlpt.us/styling/01-sass.html", "https://react.vlpt.us/styling/02-css-module.html", "https://react.vlpt.us/styling/03-styled-components.html", "https://react.vlpt.us/mashup-todolist/01-create-components.html", "https://vite.dev/guide/features.html#css-pre-processors", "https://styled-components.com/docs/api#transient-props", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%20%EC%8A%A4%ED%83%80%EC%9D%BC%EB%A7%81.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/Styled%20Component.md"]
---

> 개인 TIL과 공식 문서를 바탕으로, Sass·CSS Module·styled-components 활용은 벨로퍼트의 「[벨로퍼트와 함께하는 모던 리액트](https://react.vlpt.us/)」 중 「[리액트 컴포넌트 스타일링하기](https://react.vlpt.us/styling/)」 장과 「[멋진 투두리스트 만들기 - 컴포넌트 만들기](https://react.vlpt.us/mashup-todolist/01-create-components.html)」를 바탕으로 보강했다.
> Sass 공통 파일 자동 불러오기와 `.attrs`·`as`는 「[Frontend_TIL: 컴포넌트 스타일링](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%20%EC%8A%A4%ED%83%80%EC%9D%BC%EB%A7%81.md)」·「[Styled Component](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/Styled%20Component.md)」를 바탕으로 보강했다.

React에서는 스타일을 **컴포넌트 단위**로 관리하려는 방법이 여럿 있다. 전역 CSS 파일 하나에 모든 클래스를 쌓으면 이름이 충돌하기 쉽기 때문이다. 충돌을 막는 길은 세 갈래다. **이름 규칙**을 지키거나(일반 CSS·Sass), **빌드 도구가 이름을 고유하게** 바꾸게 하거나(CSS Modules), **스타일을 컴포넌트에 붙여** JS에서 만들거나(CSS-in-JS). 여기에 인라인 스타일과 완성된 컴포넌트 라이브러리(MUI 등)가 더해진다.

## 방법 비교

| 방법 | 특징 | 적합한 경우 |
| --- | --- | --- |
| 인라인 `style={{}}` | 객체로 작성, camelCase 속성. 가상 클래스·미디어 쿼리 불가 | 동적으로 계산되는 개별 값 |
| 일반 CSS / Sass + 이름 규칙 | 파일을 import하면 전역에 적용된다. 충돌은 이름 규칙으로 막는다 | 작은 앱, 전역 스타일 |
| CSS Modules (`*.module.css`) | 빌드 시 클래스 이름을 고유하게 바꿔 충돌 방지 | 일반 CSS 문법을 유지하고 싶을 때, 기존 CSS가 있는 레거시 페이지에 React를 들일 때 |
| styled-components / emotion | JS 안에 CSS를 작성(CSS-in-JS), props로 동적 스타일 | 컴포넌트와 스타일을 한 파일에 둘 때 |
| UI 라이브러리(MUI 등) | 완성된 컴포넌트 제공 | 관리자 화면·빠른 프로토타입 |

## 일반 CSS와 Sass

컴포넌트에서 `import './Button.scss'`처럼 불러온 스타일은 **전역**에 적용된다. 그래서 충돌은 이름 규칙으로 막는다. 컴포넌트 이름은 서로 겹치지 않게 짓고, 컴포넌트 최상위 요소의 클래스를 컴포넌트 이름과 같게(`.Button`) 두고, 안쪽 요소는 그 아래 선택자(`.MyForm .my-input`)로 고른다. BEM처럼 더 엄격한 규칙도 있다. 규칙을 지키기 번거로우면 아래 CSS Modules로 넘어간다.

Vite·Next.js는 `.scss`를 바로 컴파일한다. 컴파일러만 설치한다.

```bash
npm install -D sass-embedded   # 또는 sass (둘 다 Dart Sass)
```

과거 Create React App 시절에는 `node-sass`를 설치했지만, node-sass(LibSass)는 지원이 끝났다. 변수·믹스인·`@use` 같은 Sass 문법 자체는 [[sass|Sass]]에 있다.

변수·믹스인 파일을 모든 `.scss`에서 쓰려면 `@use '../../../styles/utils'`처럼 상대 경로를 매번 적는 대신 빌드 설정에서 경로를 잡아 준다.

```js
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ['src/styles'],                   // @use 'utils' 만으로 찾는다
        additionalData: `@use 'utils' as *;\n`,      // 모든 scss 앞에 자동으로 붙인다
      },
    },
  },
}
```

과거 CRA에서는 `npm run eject`로 webpack 설정을 꺼내 sass-loader의 `includePaths`·`prependData`를 고쳤고, `node_modules`의 Sass는 `@import '~library/styles'`처럼 물결표로 불렀다. 지금 Vite·Dart Sass는 패키지 이름만으로(`@use 'library/styles'`) 찾는다.

### 옵션이 많은 컴포넌트: 옵션을 클래스로

크기·색·외곽선·전체 너비처럼 **옵션이 많은 버튼**은 버튼마다 컴포넌트를 만들지 않고, 옵션을 CSS 클래스로 바꿔 붙인다. 문자열을 손으로 이어 붙이는 대신 `clsx`(또는 더 오래된 `classnames`)로 조건부 클래스를 조합한다.

```jsx
import clsx from 'clsx'
import './Button.scss'

function Button({ size = 'medium', color = 'blue', outline, fullWidth, className, ...rest }) {
  return (
    <button
      className={clsx('Button', size, color, { outline, fullWidth }, className)}
      {...rest}
    />
  )
}
// clsx('Button', 'large', 'pink', { outline: true, fullWidth: false }) → "Button large pink outline"
```

```scss
@use 'sass:color';
$blue: #228be6;
$pink: #f06595;

@mixin button-color($c) {
  background: $c;
  &:hover { background: color.adjust($c, $lightness: 10%); }
  &.outline {
    color: $c;
    background: none;
    border: 1px solid $c;
    &:hover { background: $c; color: white; }
  }
}

.Button {
  display: inline-flex;
  &.large  { height: 3rem; font-size: 1.25rem; }   // .Button.large
  &.medium { height: 2.25rem; }
  &.blue { @include button-color($blue); }
  &.pink { @include button-color($pink); }
  &.fullWidth { width: 100%; justify-content: center; }
  & + & { margin-left: 1rem; }                     // .Button + .Button: 나란히 있을 때만 간격
}
```

- `&.large`는 「`.Button`이면서 `.large`」, `& + &`는 「바로 앞에 `.Button`이 있는 `.Button`」이다.
- 색상 변형이 반복되면 믹스인으로 묶는다. 옛 코드의 `lighten($c, 10%)`·`darken()` 전역 함수는 Dart Sass에서 deprecated되어 `sass:color` 모듈의 `color.adjust`·`color.scale`로 바꾼다.
- `...rest`로 `onClick` 같은 나머지 props를 `<button>`에 넘기는 이유는 [[components-and-props|컴포넌트와 Props]]에 있다.
- 같은 버튼을 CSS-in-JS로 만들 때는 클래스 대신 `css` 조각(`sizeStyles`, `colorStyles`)이 믹스인 역할을 한다(아래).

## CSS Modules

```css
/* Button.module.css */
.btn {
  color: white;
  background-color: tomato;
}
```

```jsx
import styles from './Button.module.css'

function Button({ text }) {
  return <button className={styles.btn}>{text}</button>
}
```

- 가져온 `styles` 객체의 속성을 `className`에 넘긴다.
- 빌드 과정에서 `Button_btn__x1y2z` 같은 **랜덤한 클래스 이름**이 생성되므로, 다른 파일과 같은 클래스 이름을 써도 충돌하지 않는다. 클래스 이름을 전역적으로 신경 쓸 필요 없이 "이 JSX 요소에 적용할 스타일"로 생각하면 된다.
- Vite, Next.js에서 별도 설정 없이 지원한다. `.module.scss`로 쓰면 Sass와 함께 쓸 수 있다.
- 이름이 고유해지므로 `.icon`, `.checkbox`처럼 짧고 흔한 이름을 써도 된다.

| 상황 | 쓰는 법 |
| --- | --- |
| 클래스 이름에 하이픈 | `styles['my-class']` (Vite는 `css.modules.localsConvention: 'camelCase'`로 `styles.myClass`도 허용) |
| 여러 클래스, 조건부 클래스 | `clsx(styles.checkbox, checked && styles.checked)`. 예전에는 `classnames/bind`로 `const cx = classNames.bind(styles)` 후 `cx('checkbox', { checked })`처럼 썼다 |
| 모듈 파일 안에서 전역 클래스 그대로 쓰기 | `:global .my-global-name { ... }` (Sass에서는 `:global { .a { } .b { } }`로 묶을 수 있다) |
## CSS-in-JS: styled-components와 emotion

**tagged template literal** 문법으로 CSS가 적용된 컴포넌트를 만든다. 스타일이 컴포넌트에 붙어 있어 이름 충돌이 없고, props로 스타일을 바꿀 수 있다. styled-components와 emotion(`@emotion/styled`)은 API가 거의 같아 아래 내용이 둘 다에 통한다.

### 기본 문법

```bash
npm install styled-components
```

```jsx
import styled from 'styled-components'

const Button = styled.button`
  color: ${(props) => (props.dark ? 'white' : 'black')};
  background: ${(props) => (props.dark ? 'black' : 'white')};
  border: 1px solid black;

  &:hover {
    opacity: 0.8;
  }
`

// 기존 styled-component 확장
const RoundedButton = styled(Button)`
  border-radius: 16px;
`

function Sample() {
  return (
    <div>
      <Button>Normal</Button>
      <Button dark>Dark</Button>
      <RoundedButton>Rounded</RoundedButton>
    </div>
  )
}
```

- `styled.태그명`으로 만들고, 템플릿 안에서 `${(props) => ...}`로 props에 따라 스타일을 바꾼다.
- `styled(컴포넌트)`로 기존 스타일을 확장한다.
- `&:hover`, `&:focus`, `& > span`처럼 SCSS 스타일의 중첩 선택자를 쓸 수 있다.
- 런타임에 `<style>` 태그를 만들어 삽입하는 방식이다([CSS 기초](/knowledge/dictionary/frontend/css/css-basics)의 내부 참조 방식). 원리는 [[js-strings#태그드 템플릿|태그드 템플릿]] 참고.

### 자주 쓰는 도구

| 도구 | 하는 일 | 예 |
| --- | --- | --- |
| `css` 헬퍼 | 여러 줄 스타일 묶음을 조건부로 넣는다. 안에서 다시 props 함수를 쓰려면 `css`로 감싸야 한다 | ``${(p) => p.$huge && css`width: 10rem;`}`` |
| transient props `$name` | `$`로 시작한 prop은 스타일 계산에만 쓰이고 DOM으로 내려가지 않는다. `huge` 같은 임의 prop이 `<div huge>`로 새는 경고를 막는다 | `<Circle $color="blue" $huge />` |
| `ThemeProvider` | 팔레트 같은 전역 값을 넣어 두면 모든 styled 컴포넌트가 `props.theme`으로 읽는다 | `<ThemeProvider theme={{ palette: { blue: '#228be6' } }}>` |
| `keyframes` | `@keyframes`를 만들고 이름을 돌려준다 | `animation: ${fadeIn} 0.25s ease-out;` |
| `createGlobalStyle` | `body` 배경처럼 전역 스타일을 컴포넌트로 만들어 한 번 렌더링한다 | ``createGlobalStyle`body { background: #e9ecef; }` `` |
| `.attrs` | 고정 속성이나 props에서 계산한 속성을 미리 붙인다 | ``styled.input.attrs({ type: 'password' })` ... ` `` |
| `as` prop | 스타일은 그대로 두고 렌더링할 태그·컴포넌트만 바꾼다 | `<Button as="a" href="/">` |
| 컴포넌트 선택자 | 다른 styled 컴포넌트를 선택자로 쓴다 | `&:hover ${Remove} { display: initial; }` (항목에 마우스를 올리면 삭제 아이콘 표시) |

- 색상 함수가 필요하면 `polished`(`lighten`, `darken`, `rgba` 등)를 쓴다. 지금은 CSS의 `color-mix()`와 상대 색상 문법으로도 할 수 있다([[css-color-variables|CSS 색상과 변수]]).
- 옵션별 스타일은 `sizeStyles`, `colorStyles`처럼 `css` 조각으로 떼어 두면 Sass의 믹스인처럼 관리할 수 있다.
- `styled(Button)`으로 다른 컴포넌트의 스타일을 덮어쓰려면 그 컴포넌트가 받은 `className`을 실제 요소에 넘겨야 한다. 넘기지 않으면 아무 일도 일어나지 않는다.

### 구역 단위로만 만든다

모든 태그를 styled-component로 만들면 변수 이름 짓기가 고역이 된다. **눈에 띄는 구역 단위**(헤더, 사이드바, 채팅 영역, 할 일 목록의 머리말)만 styled-component로 만들고, 그 안의 `h1`·`p`·`.profile` 같은 태그는 `&` 중첩 선택자나 클래스로 선택하면 변수 수를 크게 줄일 수 있다. 조건부 스타일이 필요 없고 기능상 중요하지 않은 요소일수록 선택자가 낫다. 컴포넌트 폴더마다 `index.tsx`(JSX)와 `styles.tsx`(스타일)를 나눠 두는 구조도 많이 쓴다.

### emotion

```bash
npm install @emotion/react @emotion/styled
npm install -D @emotion/babel-plugin   # 디버깅용 클래스 이름 등, 선택
```

```tsx
import styled from '@emotion/styled'

export const Header = styled.header`
  height: 38px;
  background: #350d36;

  & .profile {
    float: right;
  }
`
```

### 현재 위치

styled-components는 2025년 3월 **유지보수 모드**로 전환됐고, 새 프로젝트 도입은 권장되지 않는다. 기존 사용자를 위한 수정 릴리스는 계속 나온다. 6.3부터는 `'use client'` 없이 React 서버 컴포넌트에서도 동작하지만, 서버 컴포넌트에서는 Context가 없어 `ThemeProvider`가 효과가 없으므로 테마는 CSS 변수로 다룬다. emotion은 런타임 CSS-in-JS라서 서버 컴포넌트에서는 `'use client'` 경계 안에서만 쓴다. 새 프로젝트에서 무엇을 고를지, 런타임 CSS-in-JS가 빌드 타임 방식으로 옮겨 간 이유는 [[css-in-js|CSS-in-JS와 CSS Modules]]에 있다.

`:hover`, `:focus`, `:checked` 같은 상태 가상 클래스는 [[selectors|CSS 선택자와 우선순위]]에 정리했다.

## 퇴장 애니메이션: 언마운트를 늦추기

React는 `visible`이 `false`가 되면 컴포넌트를 바로 제거하므로, 사라지는 애니메이션이 재생될 시간이 없다. 화면에 남겨 둘 시간을 직접 만든다. 아래는 styled-components의 `keyframes`로 만든 대화상자 예다.

```jsx
function Dialog({ visible, children }) {
  const [rendered, setRendered] = useState(visible) // 실제로 DOM에 남아 있는가

  useEffect(() => {
    if (visible) {
      setRendered(true)
      return
    }
    const id = setTimeout(() => setRendered(false), 250) // 퇴장 애니메이션 길이만큼 기다린다
    return () => clearTimeout(id)                        // 그 사이 다시 열리면 제거를 취소
  }, [visible])

  if (!rendered) return null
  return (
    <DarkBackground $disappear={!visible}>          {/* fadeOut keyframes */}
      <DialogBlock $disappear={!visible}>{children}</DialogBlock> {/* slideDown keyframes */}
    </DarkBackground>
  )
}
```

지금은 이 타이밍을 손으로 맞추지 않아도 된다. 네이티브 `<dialog>`·`popover`는 CSS의 `@starting-style`과 `transition-behavior: allow-discrete`만으로 등장·퇴장 전환을 줄 수 있고([[css-animation|CSS 애니메이션]]), JS 쪽에서는 Motion(옛 Framer Motion)의 `<AnimatePresence>`가 퇴장 애니메이션이 끝날 때까지 언마운트를 미뤄 준다.

## MUI (Material UI)

```bash
npm install @mui/material @emotion/react @emotion/styled
```

버튼, 표(Data Grid), 다이얼로그 같은 완성된 컴포넌트를 import해 바로 쓸 수 있다. emotion을 스타일 엔진으로 쓰기 때문에 함께 설치한다. 필요한 컴포넌트를 문서에서 찾아 일단 적용해 보면서 익히는 것이 빠르다.

## 핵심 정리

- 클래스 충돌을 피하는 방법: 이름 규칙, CSS Modules(빌드 시 고유 이름), CSS-in-JS.
- 옵션이 많은 컴포넌트는 옵션을 클래스로 바꿔 `clsx`로 조합하고, 나머지 props는 `...rest`로 요소에 넘긴다.
- styled-components에서 조건부 여러 줄은 `css`, DOM에 내리지 않을 prop은 `$` 접두사, 전역 값은 `ThemeProvider`.
- 퇴장 애니메이션은 언마운트를 늦춰야 한다. 새 코드는 `@starting-style`이나 `AnimatePresence`에 맡긴다.
- styled-components/emotion: ``styled.tag`...` ``, props로 동적 스타일, `styled(Comp)`로 확장, `&`로 중첩.
- 구역 단위로만 styled-component를 만들고 내부는 선택자로 처리하면 관리가 쉽다.
