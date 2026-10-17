---
title: "CSS 커스텀 속성으로 색상 체계 짜기"
concept: "CSS Custom Properties"
summary: "색상 변수를 팔레트·기능 색상·컴포넌트 색상의 세 단계로 나누고 CSS 커스텀 속성으로 연결하면 테마, 다크 모드, 화이트 라벨, 대비 조정이 변수 몇 개만 바꾸는 일이 된다. 전처리기 변수와의 차이, 모든 변수를 :root에 두면 안 되는 이유까지."
tags: ["css", "design", "design-system", "frontend"]
source: other
date: "2026-10-13"
sources: ["https://webactually.com/2021/02/05/CSS-%EA%B0%9C%EB%B0%9C%EC%9E%90-%EC%A7%80%EC%A0%95-%EC%86%8D%EC%84%B1%EC%9C%BC%EB%A1%9C-%EC%83%89%EC%83%81-%EB%A7%8C%EB%93%A4%EA%B8%B0/", "https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark", "https://web.dev/articles/baseline-in-action-color-theme", "https://web.dev/learn/css/custom-properties", "https://developer.mozilla.org/en-US/docs/Web/CSS/@property"]
---

> Artur Basak의 「[CSS 개발자 지정 속성으로 색상 만들기](https://webactually.com/2021/02/05/CSS-%EA%B0%9C%EB%B0%9C%EC%9E%90-%EC%A7%80%EC%A0%95-%EC%86%8D%EC%84%B1%EC%9C%BC%EB%A1%9C-%EC%83%89%EC%83%81-%EB%A7%8C%EB%93%A4%EA%B8%B0/)」(2021.02, 웹액츄얼리 번역)를 바탕으로 재구성하고, 커스텀 속성의 동작은 web.dev 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Custom properties 모듈로 보강한 노트다.

## 커스텀 속성이란

CSS 커스텀 속성(Custom Properties, 흔히 CSS 변수)은 `--이름: 값`으로 선언하고 `var(--이름)`으로 꺼내 쓰는 값이다. "개발자 지정 속성"이라고도 번역한다.

```css
:root { --brand: hsl(150 60% 40%); }
.button { background: var(--brand); }
```

| | Sass 같은 전처리기 변수 | CSS 커스텀 속성 |
| --- | --- | --- |
| 값이 정해지는 때 | 컴파일할 때 한 번 | 브라우저가 실행 중에 |
| 캐스케이드·상속 | 없다. 컴파일 후 사라진다 | 있다. 하위 요소에서 재정의하면 그 아래만 바뀐다 |
| 자바스크립트로 바꾸기 | 불가 | `el.style.setProperty('--brand', …)` |
| 잘 맞는 일 | 팔레트처럼 거의 바뀌지 않는 값 계산 | 테마, 모드, 페이지·컴포넌트별 재정의 |

둘은 경쟁 관계가 아니다. 팔레트는 전처리기로 계산하고, 그 결과를 커스텀 속성에 담아도 된다.

### 커스텀 속성의 동작 규칙

| 규칙 | 내용 |
| --- | --- |
| 이름 | 반드시 `--`로 시작한다. 명세는 `--`로 시작하는 속성을 절대 추가하지 않으므로 표준 속성과 겹치지 않는다. **대소문자를 구분한다** |
| 캐스케이드·상속 | 일반 속성처럼 특정성으로 덮이고, 기본으로 **상속된다.** 요소에 다시 정하면 그 요소와 자손만 바뀐다 |
| 쓰는 곳 | 속성 **값** 안에서만. 미디어 쿼리 조건(`@media (min-width: var(--bp))`)이나 선택자에는 못 쓴다 |
| 폴백 | `var(--alert-bg, var(--primary-bg, white))`처럼 값이 없을 때 쓸 값을 두 번째 인자로. 폴백 안에 `var()`를 중첩할 수 있다 |
| 계산값 시점의 무효 | 값이 그 속성에 맞지 않으면(`background-color: var(--length)`인데 `--length: 2rem`) **같은 요소의 다른 유효한 선언으로 돌아가지 않는다.** 이미 캐스케이드가 끝난 뒤 알게 되므로, 상속 속성이면 부모 값, 아니면 초깃값(`transparent`)이 된다 |

```css
.content { background-color: blue; }
.content.invalid { --length: 2rem; background-color: var(--length); }  /* 파랑이 아니라 transparent */
```

#### @property로 타입 정하기

`@property`로 등록하면 타입·상속 여부·초깃값을 정할 수 있다. 모든 주요 브라우저가 지원한다(Baseline 2024).

```css
@property --brand {
  syntax: "<color>";       /* "*"는 아무 타입 */
  inherits: false;
  initial-value: oklch(62% 0.15 160);
}
```

- **타입이 맞지 않는 값은 무효**가 되고 초깃값(또는 상속값)을 쓴다. 위의 계산값 무효 문제를 예측 가능하게 만든다.
- `inherits: false`면 요소에 준 값이 자식에게 내려가지 않는다. 여러 선택자가 같은 요소를 겨눌 때 유용하다.
- `syntax`가 `"*"`가 아니면 `initial-value`가 필수다. 그래서 등록된 속성은 절대 정의되지 않은 상태가 되지 않는다.
- 타입을 아는 브라우저는 값을 **보간**할 수 있다. `--angle`을 `<angle>`로 등록하면 그라디언트 각도나 `sin(var(--angle))`을 `transition`·`@keyframes`로 움직일 수 있다. 등록하지 않은 커스텀 속성은 중간값 없이 뚝 바뀐다.

#### JavaScript에서 읽고 쓰기

```js
el.style.setProperty('--color', 'orange');                       // 인라인 style에 --color: orange
getComputedStyle(el).getPropertyValue('--color').trim();         // 캐스케이드가 끝난 값 읽기
```

`data-color` 같은 HTML 속성 값을 읽어 커스텀 속성에 넣으면, 버튼 클릭으로 테마를 바꾸는 일이 CSS 한 곳의 변수 교체로 끝난다.

## 색상을 세 단계로 나눈다

```text
팔레트 (값 그 자체)          --green-500, --gray-700, --red-500
   │  어떤 역할에 어떤 색을 쓸지 고른다
기능 색상 (역할)             --color-primary, --color-text, --color-danger
   │  컴포넌트가 상태별로 가져다 쓴다
컴포넌트 색상 (지역 변수)    --button-bg, --input-border
```

### 1. 팔레트

- 색상환에서 기본 색 몇 개를 고른다(단색, 보색, 삼원색, 사원색, 인접색 구성 등).
- 나머지 단계는 기본 색에서 **밝기만 바꿔 계산**한다. 기본 색만 고치면 나머지가 따라 바뀐다.
- 계산에는 `oklch()`가 맞다. HSL은 같은 명도 값이라도 색상마다 눈에 보이는 밝기가 달라 단계가 고르지 않다. OKLCH는 지각적으로 균일해 단계와 대비를 예측하기 쉽다.
- 상대 색상 문법(`oklch(from var(--x) …)`, Baseline 2024)과 `color-mix()`(Baseline 2023)로 기본 색에서 파생 색과 투명도를 바로 만든다. 알파 채널용 RGB 값을 따로 둘 필요가 없다. 상대 색상 문법에서 OKLCH의 `l`은 0~1 사이 숫자로 풀린다.
- **색 이름(`green`, `gray`)이 변수 이름에 들어가는 곳은 팔레트뿐이다.**

```css
:root {
  --primary-500: oklch(62% 0.15 160);
  --primary-300: oklch(from var(--primary-500) calc(l + 0.15) c h);
  --primary-700: oklch(from var(--primary-500) calc(l - 0.2) c h);
  --primary-a20: color-mix(in oklch, var(--primary-500) 20%, transparent);
}
```

### 2. 기능 색상

색의 값보다 **쓰임새**가 중요한 단계다. 브랜드 색, 본문 글자색, 배경색, 테두리, 링크와 링크 호버, 힌트 텍스트, 오류 색 등. 팔레트에서 골라 연결한다.

```css
:root {
  --color-primary: var(--primary-500);
  --color-bg: var(--gray-50);
  --color-text: var(--gray-900);
  --color-danger: var(--red-500);
}
[data-theme="dark"] {
  --color-bg: var(--gray-900);
  --color-text: var(--gray-50);
}
```

- 테마 전환, 다크 모드, 대비 높이기는 **기능 색상만 재정의**하면 된다.
- 시스템 설정을 따르는 다크 모드는 `color-scheme: light dark`를 선언하고 `light-dark(밝을 때, 어두울 때)` 함수(Baseline 2024)나 `@media (prefers-color-scheme: dark)`로 기능 색상을 나눈다. `light-dark()`는 `color-scheme`이 없으면 동작하지 않는다.
- 페이지마다 대표색이 다른 사이트는 공통 스타일에서 `--page-color`를 쓰고 페이지별 스타일에서 이 값만 바꾼다.

### 3. 컴포넌트 색상

컴포넌트 안에서만 쓰는 지역 변수다. 모든 컴포넌트에 만들 필요는 없다. 두 경우에 쓴다.

| 경우 | 예 |
| --- | --- |
| 용도별 변형이 있다 | 버튼의 primary, secondary, tertiary, destructive |
| 상태별 색이 있다 | 호버·활성·포커스, 입력 필드의 정상·오류 |

```css
.button {
  --button-bg: var(--color-primary);
  background: var(--button-bg);
}
.button--danger { --button-bg: var(--color-danger); }
```

화이트 라벨(고객사가 자기 브랜드 색을 입히는 기능)처럼 특정 컴포넌트만 따로 색을 바꿔야 할 때도 이 단계가 쓸모 있다.

## 어느 단계에 둘지 판단하기

**같은 색이 여러 곳에 쓰인다고 같은 변수로 묶으면 안 된다.** 기준은 "한쪽이 바뀌면 다른 쪽도 바뀌어야 하나?"다.

| 관찰 | 판단 |
| --- | --- |
| 입력창 테두리, 닫기 아이콘, 보조 버튼 배경이 우연히 같은 회색 | 서로 관계없다. 각자 **팔레트** 변수를 직접 쓴다 |
| 메인 버튼, 1단계 링크, 헤더가 같은 초록 | 브랜드 색이 바뀌면 다 바뀐다. **기능 색상** |
| 입력 오류, 오류 메시지, 삭제 버튼이 같은 빨강 | 앱 전체의 패턴이다. **기능 색상** |

이 판단은 디자인 팀의 패턴 언어(pattern language)를 이해해야 내릴 수 있다([[design-system|디자인 시스템: 구성, 도입, 구축과 배포]]).

## 모든 변수를 :root에 두지 않는다

모든 변수를 `:root` 한곳에 모으면 어디서든 재정의할 수 있어 편해 보인다. 과거에는 IE11용 후처리 도구가 루트 변수만 변환할 수 있어 이렇게 모으기도 했다. 하지만 두 가지 문제가 있다.

- **관심사 분리가 깨진다.** 버튼 컴포넌트를 지워도 공용 파일에 버튼 변수가 남는다.
- **성능**: 색 변경은 리플로 없이 리페인트만 일으키지만, 루트 값을 바꾸면 전체 트리를 다시 확인한다. 지역 변수를 바꾸면 범위가 좁다.

팔레트와 기능 색상만 루트에, 컴포넌트 색상은 컴포넌트에 둔다.

## 자바스크립트에 두면 안 되나

색 값을 JS에 두고 인라인 스타일로 바꿀 수도 있다. 하지만 요소마다 속성을 바꿔야 해서 비효율적이고, 캐스케이드 상속을 쓸 수 없다. CSS 변수는 **값 하나만 바꾸면** 그 아래 전체가 따라온다. JS는 `setProperty`로 변수 값만 바꾸는 역할이면 충분하다.

## 정리

- 팔레트(값) → 기능 색상(역할) → 컴포넌트 색상(지역)의 세 단계로 나눈다.
- 색 이름은 팔레트에만. 나머지는 역할로 이름 짓는다.
- 테마·다크 모드는 기능 색상 재정의, 변형·상태는 컴포넌트 변수 재정의로 처리한다.
- 같은 색이라도 함께 바뀌어야 할 때만 같은 변수로 묶는다.
- 루트에는 팔레트와 기능 색상만 둔다.

관련 노트: [[design-system|디자인 시스템: 구성, 도입, 구축과 배포]], [[sass|Sass: 파일 구조, 믹스인과 @extend]], [[css-functions|CSS 함수: calc()·clamp()와 수학 함수]], [[css-basics|CSS 기초: 문법, 적용 방법, 단위]], [[web-typography|웹 타이포그래피: 가독성, 글줄 길이, 웹폰트]], [[css-progressive-enhancement|CSS 점진적 향상: 폴백과 피처 쿼리]]
