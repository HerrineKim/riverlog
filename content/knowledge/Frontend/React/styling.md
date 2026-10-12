---
title: "React 스타일링: CSS Modules와 styled-components"
concept: "Styled Components"
summary: "React 컴포넌트에 스타일을 입히는 방법들과 CSS-in-JS 라이브러리 styled-components·emotion 사용법."
tags: ["react", "css", "styling", "frontend"]
source: mixed
---

React에서는 스타일을 **컴포넌트 단위**로 관리하려는 방법이 여럿 있다. 전역 CSS 파일 하나에 모든 클래스를 쌓으면 이름이 충돌하기 쉽기 때문이다. 대표적인 방법은 인라인 스타일, CSS Modules, CSS-in-JS(styled-components, emotion), 그리고 컴포넌트 라이브러리(MUI 등)다.

## 방법 비교

| 방법 | 특징 | 적합한 경우 |
| --- | --- | --- |
| 인라인 `style={{}}` | 객체로 작성, camelCase 속성. 가상 클래스·미디어 쿼리 불가 | 동적으로 계산되는 개별 값 |
| CSS Modules (`*.module.css`) | 빌드 시 클래스 이름을 고유하게 바꿔 충돌 방지 | 일반 CSS 문법을 유지하고 싶을 때 |
| styled-components / emotion | JS 안에 CSS를 작성(CSS-in-JS), props로 동적 스타일 | 컴포넌트와 스타일을 한 파일에 둘 때 |
| UI 라이브러리(MUI 등) | 완성된 컴포넌트 제공 | 관리자 화면·빠른 프로토타입 |

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
- CRA, Vite, Next.js에서 별도 설정 없이 지원한다.

## styled-components

**tagged template literal** 문법으로 CSS가 적용된 컴포넌트를 만든다.

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
- 런타임에 `<style>` 태그를 만들어 삽입하는 방식이다([CSS 기초](/knowledge/dictionary/frontend/css/css-basics)의 내부 참조 방식). 원리는 [[template-literals|태그드 템플릿]] 참고.

> 참고(2025~): styled-components 메인테이너는 2025년 3월 프로젝트를 **유지보수 모드**로 전환한다고 밝히며 새 프로젝트에는 권하지 않는다고 했다. 런타임 CSS-in-JS는 React Server Components에서 `'use client'` 없이 쓸 수 없다는 한계도 있다. 이후 RSC 대응 릴리스가 다시 나오고 있지만, 새 프로젝트라면 CSS Modules나 빌드 타임에 CSS를 뽑아내는 방식(Tailwind CSS 등)도 함께 검토한다. 기존 코드는 그대로 동작한다.

### 자주 쓰는 상태 가상 클래스

| 가상 클래스 | 의미 |
| --- | --- |
| `:hover` | 마우스 커서가 요소 위에 있을 때 |
| `:active` | 요소를 누르고 있을 때(주로 링크·버튼) |
| `:focus` | 요소가 포커스를 가졌을 때(주로 input) |
| `:checked` | radio·checkbox가 체크되었을 때 |
| `:first-child`, `:last-child` | 부모 기준 첫·마지막 자식 |

## emotion

styled-components와 거의 같은 API를 제공하면서 설정이 간단하다.

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

### 실무 팁: 스타일드 컴포넌트를 너무 잘게 만들지 않기

모든 태그를 styled-component로 만들면 변수 이름 짓기가 고역이 된다. **눈에 띄는 구역 단위**(헤더, 사이드바, 채팅 영역)만 styled-component로 만들고, 그 안의 태그들은 `&` 중첩 선택자나 클래스로 선택하면 변수 수를 크게 줄일 수 있다. 컴포넌트 폴더마다 `index.tsx`(JSX)와 `styles.tsx`(스타일)를 나눠 두는 구조도 많이 쓴다.

## MUI (Material UI)

```bash
npm install @mui/material @emotion/react @emotion/styled
```

버튼, 표(Data Grid), 다이얼로그 같은 완성된 컴포넌트를 import해 바로 쓸 수 있다. emotion을 스타일 엔진으로 쓰기 때문에 함께 설치한다. 필요한 컴포넌트를 문서에서 찾아 일단 적용해 보면서 익히는 것이 빠르다.

## 핵심 정리

- 클래스 충돌을 피하는 방법: CSS Modules(빌드 시 고유 이름) 또는 CSS-in-JS.
- styled-components/emotion: ``styled.tag`...` ``, props로 동적 스타일, `styled(Comp)`로 확장, `&`로 중첩.
- 구역 단위로만 styled-component를 만들고 내부는 선택자로 처리하면 관리가 쉽다.
