---
title: "CSS 조건부 값과 사용자 정의 함수: if(), @function, 스타일 쿼리"
concept: "CSS if() and @function"
summary: "CSS에 조건과 함수가 들어왔다. if()는 한 속성 값 안에서 style()·media()·supports() 조건으로 값을 고르고, @function은 매개변수·타입·기본값·result를 가진 재사용 함수를 정의하며, 컨테이너 스타일 쿼리는 부모의 커스텀 속성에 따라 규칙 묶음을 적용한다. 2026년 11월 기준 if()·@function은 Chromium만 정식 지원(Safari는 Technology Preview)이라 폴백 선언을 앞에 두는 점진적 향상으로만 쓴다."
tags: ["css", "frontend", "browser", "design-system"]
source: other
date: "2026-11-25"
sources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/if", "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@function", "https://caniuse.com/css-if", "https://caniuse.com/css-container-queries-style", "https://webkit.org/blog/18182/release-notes-for-safari-technology-preview-249/", "https://velog.io/@typo/4-css-features-every-front-end-developer-should-know-in-2026", "https://devowen.com/525"]
---

> Korean FE Article 뉴스레터가 소개한 「[2026년 프런트엔드 개발자라면 알아야 할 4가지 CSS 기능](https://velog.io/@typo/4-css-features-every-front-end-developer-should-know-in-2026)」(2026.02)과 「[CSS in 2026: 프런트엔드 개발을 바꾸는 새로운 기능들](https://devowen.com/525)」(2026.04)에서 조건·함수 기능을 골라, 문법은 MDN, 브라우저 지원은 Can I Use와 WebKit 릴리스 노트로 확인해 재구성한 노트다.

## CSS에 생긴 조건과 함수

지금까지 CSS에서 「상황에 따라 다른 값」은 선택자나 `@media`·`@supports` 규칙 블록으로만 표현했다. 같은 조건이 여러 속성에 걸리면 블록을 따로 만들고 선택자를 반복해야 했고, 「색에 투명도를 입힌다」 같은 계산은 Sass 함수나 커스텀 속성 조합으로 흉내 냈다.

세 기능이 이 빈자리를 채운다.

| 기능 | 하는 일 | 단위 |
| --- | --- | --- |
| `if()` | 조건에 따라 **속성 값 하나**를 고른다 | 값 |
| `@function` | 인자를 받아 값을 돌려주는 **재사용 함수**를 정의한다 | 값 |
| 컨테이너 스타일 쿼리 `@container style()` | 조상의 커스텀 속성 값에 따라 **규칙 묶음**을 적용한다 | 규칙 블록 |

내장 함수(`calc()`, `clamp()`, 색 함수 등)는 [[css-functions|CSS 함수]]에 있다.

## if(): 값 안의 조건문

```css
if(<조건>: <값>; <조건>: <값>; else: <값>)
```

조건을 앞에서부터 검사해 **처음 참인 조건의 값**을 쓴다. `조건: 값` 쌍은 세미콜론으로 나누고, 마지막 세미콜론은 생략해도 된다. `if`와 `(` 사이에 공백이 있으면 선언 전체가 무효다.

| 조건 | 검사하는 것 | 예 |
| --- | --- | --- |
| `style()` | **같은 요소**의 커스텀 속성 값 | `style(--scheme: dark)` |
| `media()` | 미디어 특성 | `media(width < 700px)` |
| `supports()` | 선언·선택자 지원 여부 | `supports(color: lch(75% 0 0))` |
| `else` | 항상 참. 맨 끝에 둔다 | `else: none` |

각 조건 안에서 `and`·`or`·`not`을 쓸 수 있다.

```css
.button {
  /* 지원하지 않는 브라우저를 위한 폴백을 먼저 쓴다 */
  padding: 0.5em 1em;
  padding: if(
    style(--size: small): 0.25em 0.5em;
    style(--size: large): 0.75em 1.5em;
    else: 0.5em 1em;
  );

  background-color: if(
    style((--variant: danger) and (--emphasis: strong)): crimson;
    style(--variant: danger): mistyrose;
    else: royalblue;
  );

  margin-block: if(media(width < 700px): 0.5rem; else: 1rem);
}
```

```html
<button class="button" style="--size: large; --variant: danger">삭제</button>
```

- 속성 값 어디에나 들어간다. 단축 속성의 일부, `calc()` 안, 다른 `if()` 안, 커스텀 속성 값에도 쓸 수 있다.
- 조건이 하나도 맞지 않고 `else`도 없으면 값이 무효가 된다. **항상 `else`를 둔다.**
- `else`를 중간에 두면 그 뒤 조건은 영영 검사되지 않는다.
- 같은 조건을 `@media` 블록으로 쓰면 선택자를 반복해야 하지만, `if()`는 속성 옆에 조건을 붙여 한곳에서 읽힌다. 반대로 한 조건에 속성 여러 개가 걸리면 여전히 `@media`·`@container` 블록이 낫다.

## @function: 사용자 정의 함수

```css
@function --함수이름(--매개변수 <타입>: 기본값, ...) returns <타입> {
  --지역변수: ...;
  result: ...;
}
```

이름은 `--`로 시작하고(대소문자 구분), 호출도 `--이름(인자)`로 한다.

```css
@function --transparent(--color <color>, --alpha <number>: 0.8) returns <color> {
  result: oklch(from var(--color) l c h / var(--alpha));
}

.card {
  --brand: #faa6ff;
  background-color: --transparent(var(--brand));       /* alpha 0.8 */
  border-color: --transparent(var(--brand), 0.3);
}
```

| 요소 | 규칙 |
| --- | --- |
| 매개변수 타입 | `<color>`, `<length>`, `<number>`처럼 적는다. 생략하면 아무 값이나 받는다. 둘 이상 허용은 `type(<number> \| <percentage>)` |
| 기본값 | `--alpha <number>: 0.8`. 인자를 생략하거나 타입이 맞지 않으면 기본값을 쓴다 |
| `result` | 돌려줄 값. 여러 번 적으면 **나중 것이 이긴다**(조기 반환이 없다) |
| `returns` | 돌려줄 타입. `result`가 맞지 않으면 함수 결과가 무효가 된다 |
| 지역 변수 | 본문 안의 커스텀 속성은 함수 안에서만 보이는 상수다 |
| 쉼표가 든 인자 | 목록 하나를 인자로 넘기려면 중괄호로 감싼다: `--max-plus-x({1px, 7px, 2px}, 3px)` |
| 바깥 값 읽기 | 호출한 요소의 커스텀 속성도 읽는다. 이름이 겹치면 지역 변수 > 매개변수 > 요소의 속성 순이다 |

본문 안에서 `@media`를 쓰거나 `if()`로 조건부 결과를 낼 수 있다.

```css
@function --narrow-wide(--narrow, --wide) {
  result: if(media(width < 700px): var(--narrow); else: var(--wide));
}

.layout {
  gap: --narrow-wide(0.5rem, 2rem);
}
```

타입이 맞지 않는 값이 들어오면 **계산 시점에 무효**가 되어, 앞에 써 둔 폴백 선언이 아니라 속성의 기본값(상속 속성은 상속값, 아니면 초기값)이 된다. 기본값을 지정해 두면 이런 경우를 줄인다.

Sass 함수와의 차이: Sass 함수는 빌드 때 한 번 계산돼 고정된 값이 되지만, `@function`은 브라우저에서 요소마다 계산되므로 **커스텀 속성·미디어 조건처럼 런타임에 바뀌는 값**에 반응한다([[sass|Sass]]).

## 컨테이너 스타일 쿼리

`if()`의 `style()`이 **같은 요소**의 커스텀 속성을 본다면, `@container style()`은 **조상(컨테이너)** 의 커스텀 속성을 보고 그 안의 요소들에 규칙 묶음을 적용한다. 크기 쿼리와 달리 `container-type`을 선언하지 않아도 모든 요소가 스타일 컨테이너다.

```css
.card-list { --layout: compact; }

@container style(--layout: compact) {
  .card { padding: 0.5rem; }
  .card img { display: none; }
}
```

지금은 **커스텀 속성만** 질의할 수 있다(`color` 같은 일반 속성은 안 된다). 크기 컨테이너 쿼리는 [[responsive-design|반응형 디자인]]에 있다.

## 언제 무엇을 쓰나

| 상황 | 고를 것 |
| --- | --- |
| 컴포넌트 변형(`--size`, `--variant`)에 따라 속성 몇 개만 바뀐다 | `if(style(...))` |
| 부모가 정한 모드에 따라 자식 여러 요소의 규칙이 통째로 바뀐다 | `@container style(...)` |
| 같은 계산식(투명도 입히기, 유동 크기)을 여러 곳에서 반복한다 | `@function` |
| 화면 너비에 따라 여러 속성이 함께 바뀐다 | `@media` 블록 |
| 형제 사이 순번에 따른 지연·색 변화 | `sibling-index()`·`sibling-count()` ([[ui-motion-principles\|UI 모션 디자인]]) |

디자인 시스템에서는 토큰을 커스텀 속성으로 두고, 변형은 `if()`로, 반복 계산은 `@function`으로 표현하면 클래스 조합 없이 `style="--variant: danger"` 하나로 컴포넌트를 바꿀 수 있다([[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]]).

## 브라우저 지원 (2026년 11월)

| 기능 | Chrome·Edge | Safari | Firefox |
| --- | --- | --- | --- |
| `if()` | 137 | 정식 미지원 (Technology Preview 249에 구현) | 미지원 |
| `@function` | 139 | 정식 미지원 (Technology Preview 249에 구현) | 미지원 |
| 컨테이너 스타일 쿼리(커스텀 속성) | 111 | 18 | 151 |

`if()`와 `@function`은 Baseline이 아니다(MDN: Limited availability). 지원하지 않는 브라우저는 `if(`나 `--이름(` 호출을 해석하지 못해 **선언을 통째로 버리므로**, 바로 앞에 일반 값을 한 번 더 써 두는 폴백 패턴이 그대로 통한다. 폴백만으로도 쓸 만한 화면이 나오는 곳에만 쓴다([[css-progressive-enhancement|CSS 점진적 향상]]). 컨테이너 스타일 쿼리는 세 엔진이 모두 지원해 커스텀 속성 범위에서는 바로 쓸 수 있다.

## 정리

- `if()`는 값 하나의 조건문이다. `style()`은 같은 요소의 커스텀 속성, `media()`·`supports()`는 환경을 본다. `else`를 꼭 둔다.
- `@function`은 타입·기본값·지역 변수를 가진 런타임 함수다. `result`는 마지막 것이 이기고, 타입이 틀리면 계산 시점에 무효가 된다.
- 조상의 모드에 따라 규칙 묶음을 바꾸려면 컨테이너 스타일 쿼리를 쓴다. 커스텀 속성만 질의할 수 있다.
- `if()`·`@function`은 아직 Chromium만 정식 지원한다. 폴백 선언을 앞에 두는 점진적 향상으로만 쓴다.

관련 노트: [[css-functions|CSS 함수]], [[css-progressive-enhancement|CSS 점진적 향상]], [[responsive-design|반응형 디자인과 다국어 타이포그래피]], [[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]], [[sass|Sass]], [[ui-motion-principles|UI 모션 디자인]]
