---
title: "CSS-in-JS와 CSS Modules"
concept: "CSS-in-JS"
summary: "대규모 CSS의 일곱 가지 문제(전역 이름 공간, 의존성, 죽은 코드, 압축, 상수 공유, 비결정적 우선순위, 격리 깨짐)와 이를 빌드 도구로 푼 CSS Modules, JS로 푼 CSS-in-JS를 비교한다. 런타임 방식에서 빌드 타임(zero-runtime) 방식으로 옮겨 간 이유와 서버 컴포넌트 시대의 선택지까지 정리한다."
tags: ["css", "react", "architecture", "frontend", "build"]
source: other
date: "2026-10-21"
sources: ["https://speakerdeck.com/vjeux/react-css-in-js", "http://ryanogles.by/css/javascript/2017/05/25/the-state-of-css.html", "https://www.smashingmagazine.com/2017/01/styled-components-enforcing-best-practices-component-based-systems/", "https://github.com/css-modules/css-modules", "https://vite.dev/guide/features#css-modules", "https://stylexjs.com/docs/learn/"]
---

> 「[React: CSS in JS](https://speakerdeck.com/vjeux/react-css-in-js)」(2014) 발표, 「[The State of CSS](http://ryanogles.by/css/javascript/2017/05/25/the-state-of-css.html)」, 「[Styled Components: Enforcing Best Practices In Component-Based Systems](https://www.smashingmagazine.com/2017/01/styled-components-enforcing-best-practices-component-based-systems/)」을 바탕으로, 현재 도구는 CSS Modules·Vite·StyleX 문서로 확인해 재구성한 노트다.

## 대규모 CSS의 일곱 가지 문제

개발자 수백 명이 매일 커밋하는 코드베이스에서 CSS는 다음 문제를 낸다. CSS Modules와 CSS-in-JS는 모두 이 목록에 대한 답이다.

| 문제 | 내용 |
| --- | --- |
| 1. 전역 이름 공간 | 모든 클래스가 전역 변수다. JS는 오래전에 전역 변수를 버렸다 |
| 2. 의존성 | 컴포넌트가 필요한 CSS를 직접 불러오지 않아도, 다른 파일이 먼저 불러왔으면 우연히 동작한다. 그 파일이 빠지면 깨진다 |
| 3. 죽은 코드 제거 | 어떤 클래스를 아무도 안 쓰는지 알 수 없어 지우지 못한다 |
| 4. 압축 | 클래스 이름을 줄일 수 없다 |
| 5. 상수 공유 | JS와 CSS가 같은 값(브레이크포인트, 높이)을 주석으로만 맞춘다 |
| 6. 비결정적 우선순위 | 명시도가 같으면 **나중에 온 규칙**이 이긴다. CSS를 나눠 비동기로 불러오면 로드 순서가 페이지 방문 순서에 따라 달라져, 특정 경로로 들어올 때만 재현되는 버그가 생긴다 |
| 7. 격리 깨짐 | 컴포넌트를 쓰는 쪽이 선택자로 내부 요소를 덮어쓸 수 있다. 리뷰·린트로 잡기 어렵고, 컴포넌트 내부를 바꾸면 사용처가 깨진다 |

규칙으로 다스리는 방법론(BEM 등)은 1번을 이름 규칙으로 피할 뿐 풀지는 못한다([[css-methodologies|CSS 설계 방법론]]). 6·7번은 클래스 이름을 아무리 잘 지어도 남는다.

## CSS Modules: 빌드 도구로 푼다

CSS 파일을 모듈로 불러오면, 그 안의 클래스 이름이 **기본적으로 지역(local)** 이 되어 빌드 때 고유한 이름으로 바뀐다.

```css
/* Button.module.css */
.base { padding: 0.5rem 1rem; }
.primary {
  composes: base;               /* 다른 클래스를 합성 */
  background: var(--color-brand);
}
:global(.dark) .primary { background: var(--color-brand-dark); }  /* 전역은 명시적으로 */
```

```jsx
import styles from './Button.module.css'
<button className={styles.primary}>저장</button>
// 출력: class="Button_primary__x1y2z Button_base__a3b4c"
```

| 해결한 문제 | 방법 |
| --- | --- |
| 전역 이름 공간 | 클래스가 파일 지역. 전역은 `:global()`로 드러내야 한다 |
| 의존성 | 컴포넌트가 `import`로 자기 CSS를 직접 불러온다 |
| 죽은 코드 | `import`가 없으면 빌드에서 빠진다. `styles.x` 사용처를 검색할 수 있다 |
| 압축 | 빌드가 이름을 마음대로 줄인다 |

**문법은 그냥 CSS**라 미디어 쿼리·가상 클래스·`@layer`를 그대로 쓰고, 런타임 비용이 없다. Vite·Next.js는 `*.module.css`를 설정 없이 지원한다. 사용 예는 [[styling|React 스타일링]]에 있다. 남는 문제는 6번(같은 명시도의 로드 순서)과 7번(외부에서 내부 덮어쓰기)이다.

## CSS-in-JS: 스타일을 JS 값으로

CSS-in-JS는 스타일을 JS 안에 쓰고, 라이브러리가 고유 클래스를 만들어 `<style>`에 넣는다. 처음 제안은 스타일 객체를 인라인 스타일로 그리는 것이었고, 이후 클래스와 `<style>` 태그를 만드는 방식으로 발전했다.

```jsx
const Title = styled.h1`
  font-size: 1.5em;
  color: ${(p) => (p.$muted ? 'gray' : 'black')};
`
```

### 스타일과 마크업 사이의 매핑을 없앤다

일반 CSS는 클래스 이름이, 인라인 스타일은 `style` 객체가 스타일과 마크업을 잇는다. styled-components 계열은 이 **매핑을 없애고 스타일 자체를 컴포넌트로** 만든다. 그러면 컴포넌트 기반 개발의 모범 사례가 강제된다.

| 모범 사례 | 강제되는 방식 |
| --- | --- |
| 작고 집중된 컴포넌트 | 쓰는 쪽은 클래스가 아니라 `primary` 같은 prop만 안다. 스타일은 구현 세부다 |
| 컨테이너와 표현 컴포넌트 분리 | 스타일이 붙은 컴포넌트는 표현만 맡는다 |
| 클래스는 한 번만 쓴다 | 클래스 이름을 사람이 다루지 않으므로 재사용으로 인한 부작용이 없다 |

| 해결한 문제 | 방법 |
| --- | --- |
| 1~4 | CSS Modules와 같다. 컴포넌트를 지우면 스타일도 사라진다 |
| 5. 상수 공유 | 그냥 JS 변수·테마 객체다 |
| 6. 비결정적 우선순위 | 라이브러리가 삽입 순서를 관리한다 |
| 7. 격리 | 외부에서 덮으려면 prop을 거쳐야 한다 |
| 동적 스타일 | prop·테마로 값을 바꾼다 |

**CSS-in-JS는 인라인 스타일이 아니다.** 실제 CSS 클래스를 만들므로 `:hover`, 미디어 쿼리, 가상 요소를 다 쓴다.

## 런타임에서 빌드 타임으로

styled-components·emotion 같은 **런타임** CSS-in-JS는 렌더링할 때 JS로 CSS 문자열을 만들어 넣는다. 지금은 다음 이유로 새 프로젝트에서 잘 고르지 않는다.

- **비용**: 렌더마다 스타일 직렬화·삽입 비용이 들고, JS 번들에 라이브러리가 들어간다. 스타일이 JS 실행 뒤에야 준비된다.
- **서버 컴포넌트와 충돌**: React 서버 컴포넌트에는 Context가 없어 `ThemeProvider` 같은 런타임 테마가 동작하지 않는다. 런타임 라이브러리는 클라이언트 컴포넌트 경계 안에서만 쓴다.
- **유지보수 상태**: styled-components는 2025년 3월 유지보수 모드로 전환됐다([[styling|React 스타일링]]).

그래서 JS로 쓰되 **빌드 때 정적 CSS 파일로 뽑는 zero-runtime** 방식이 이어받았다.

| 방식 | 도구 | 특징 |
| --- | --- | --- |
| 런타임 | styled-components, emotion | 렌더 중 CSS 생성. prop으로 무엇이든 바꾼다 |
| 빌드 타임(파일) | vanilla-extract(`*.css.ts`), Linaria | 타입 있는 스타일을 빌드 때 CSS 파일로 |
| 빌드 타임(원자적) | StyleX(Meta), Panda CSS | 선언마다 원자적 클래스를 만들어 CSS 크기가 앱 크기에 비례하지 않는다. StyleX는 **나중에 적용한 스타일이 이긴다**는 규칙을 컴파일러가 보장해 6번을 푼다 |
| 빌드 타임(유틸리티) | Tailwind CSS | JS가 아니라 클래스 문자열. [[utility-first-css\|유틸리티 우선 CSS]] |

빌드 타임 방식에서 **동적인 값은 CSS 변수**로 넘긴다. JS가 값을 계산해 `style={{ '--progress': value }}`로 넣고, 정적 CSS가 `var(--progress)`를 읽는다.

## 지금의 선택

| 상황 | 고르는 것 |
| --- | --- |
| 일반 CSS 문법을 유지하고 싶다 | CSS Modules (+ `@layer`로 우선순위 고정) |
| 디자인 토큰을 강제하고 빠르게 만든다 | Tailwind CSS |
| 타입 안전한 스타일 API, 디자인 시스템 패키지 | vanilla-extract, StyleX, Panda CSS |
| 기존 styled-components 코드 | 유지하되 새 화면은 위 방식으로, 테마는 CSS 변수로 옮긴다 |

네이티브 CSS도 같은 문제를 직접 푼다. `@scope`는 1·7번(범위), `@layer`는 6번(우선순위), 커스텀 속성은 5번(상수 공유)을 다룬다([[css-history|CSS의 역사]]).

## 정리

- CSS Modules와 CSS-in-JS는 같은 일곱 문제에 대한 두 답이다. CSS Modules는 빌드 도구로, CSS-in-JS는 JS 모듈 체계로 푼다.
- 이름 규칙(BEM)은 전역 이름 공간만 피한다. 로드 순서와 격리 문제는 도구나 `@layer`가 필요하다.
- 런타임 CSS-in-JS는 비용과 서버 컴포넌트 비호환 때문에 빌드 타임 방식으로 옮겨 갔다. 동적 값은 CSS 변수로 넘긴다.

관련 노트: [[styling|React 스타일링: CSS Modules와 styled-components]], [[css-history|CSS의 역사로 본 CSS가 어려워진 이유]], [[css-methodologies|CSS 설계 방법론: BEM과 ITCSS]], [[utility-first-css|유틸리티 우선 CSS]], [[react-server-components|React Server Components의 동작 원리]]
