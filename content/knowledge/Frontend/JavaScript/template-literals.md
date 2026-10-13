---
title: "템플릿 리터럴과 태그드 템플릿"
concept: "Template Literal"
summary: "백틱 문자열로 여러 줄·표현식 삽입·중첩을 쓰는 템플릿 리터럴과, styled-components의 바탕이 되는 태그드 템플릿."
tags: ["javascript", "frontend", "styling"]
source: notion
date: "2026-10-13"
sources: ["https://opencollective.com/styled-components/updates"]
---

**템플릿 리터럴(template literal)** 은 따옴표 대신 백틱(`` ` ``)으로 감싸는 문자열로, 여러 줄 문자열과 표현식 삽입을 지원한다. ES2015 초안에서는 "template strings"라고 불렸다. 한 단계 더 나아간 **태그드 템플릿**은 문자열을 함수로 파싱할 수 있게 해 주며, styled-components 같은 CSS-in-JS 라이브러리가 이 문법 위에 만들어졌다.

## 여러 줄 문자열

```javascript
// 예전: 이스케이프 문자와 + 연결
'string text line 1\n' + 'string text line 2'

// 템플릿 리터럴: 줄바꿈이 그대로 들어간다
`string text line 1
string text line 2`
```

## 표현식 삽입

`${ }` 안에 변수, 연산, 함수 호출 등 **어떤 표현식이든** 넣을 수 있다.

```javascript
const a = 5
const b = 10

'Fifteen is ' + (a + b) + ' and\nnot ' + (2 * a + b) + '.'
`Fifteen is ${a + b} and
not ${2 * a + b}.`
```

## 중첩 템플릿

조건에 따라 문자열 일부가 달라질 때, 템플릿 안에 템플릿을 넣으면 읽기 쉬워진다.

```javascript
// 중첩 없이
const classes = `header ${
  isLargeScreen() ? '' : item.isCollapsed ? 'icon-expander' : 'icon-collapser'
}`

// 중첩 템플릿: 공통 접두사 'icon-'을 한 번만 쓴다
const classes2 = `header ${
  isLargeScreen() ? '' : `icon-${item.isCollapsed ? 'expander' : 'collapser'}`
}`
```

## 태그드 템플릿

템플릿 앞에 함수 이름을 붙이면, 그 함수가 템플릿을 받아 처리한다.

- 첫 번째 인자: 표현식 사이사이의 **문자열 조각 배열**(`TemplateStringsArray`)
- 나머지 인자: 각 `${}` 표현식의 **값**

```typescript
function describe(strings: TemplateStringsArray, person: string, age: number) {
  // strings = ['that ', ' is a ', ''] — 마지막 표현식 뒤에도 빈 문자열이 있어 길이는 3
  const ageWord = age > 99 ? 'centenarian' : 'youngster'
  return `${strings[0]}${person}${strings[1]}${ageWord}`
}

describe`that ${'Mike'} is a ${28}` // 'that Mike is a youngster'
```

문자열 조각 배열의 길이는 항상 **표현식 개수 + 1**이다.

### 응용: styled-components의 원리

표현식 자리에 **함수**를 넣고, 태그 함수가 props를 넣어 그 함수를 실행하게 하면 props에 따라 바뀌는 CSS를 만들 수 있다.

```typescript
const theme = {
  spacing: { min: '2px', max: '24px' },
  colors: { primary: 'coral', secondary: 'peachpuff' },
}
const props = { theme, primary: true, bigSpacing: true }
type Props = typeof props

function styled(css: TemplateStringsArray, ...interpolations: ((p: Props) => string)[]) {
  return css
    .map((chunk, i) => chunk + (interpolations[i] ? interpolations[i](props) : ''))
    .join('')
}

const buttonCss = styled`
  background: ${({ primary, theme }) => (primary ? theme.colors.primary : theme.colors.secondary)};
  margin-bottom: ${({ bigSpacing, theme }) => (bigSpacing ? theme.spacing.max : theme.spacing.min)};
`
// background: coral;
// margin-bottom: 24px;
```

실제 라이브러리는 이렇게 만든 CSS 문자열에 고유 클래스 이름을 붙여 `<style>` 태그로 삽입한다. 이렇게 런타임에 스타일을 만드는 방식은 서버 컴포넌트·스트리밍 SSR과 잘 맞지 않아, styled-components는 2025년 3월 유지보수 모드를 선언했고 새 프로젝트는 CSS Modules·Tailwind CSS나 빌드 타임 CSS-in-JS(vanilla-extract, Panda CSS)를 많이 쓴다. 사용법은 [React 스타일링](/knowledge/dictionary/frontend/react/styling) 참고.

## 핵심 정리

- 백틱 문자열: 여러 줄, `${표현식}` 삽입, 중첩 가능.
- 태그드 템플릿: `tag` 함수가 `(문자열 조각 배열, ...표현식 값)`을 받는다. 조각 수 = 표현식 수 + 1.
- styled-components·GraphQL `gql`·`String.raw` 같은 API가 태그드 템플릿을 활용한다.
