---
title: "CSS 선택자와 우선순위"
concept: "Selector"
summary: "스타일을 적용할 요소를 고르는 선택자와, 스타일이 겹칠 때 무엇이 적용되는지 정하는 캐스케이딩·특정성·상속."
tags: ["css", "selector", "frontend"]
source: til
---

선택자(Selector)는 스타일을 적용할 HTML 요소를 고르는 문법이다. 한 요소에 여러 규칙이 겹치면 CSS는 **캐스케이딩(cascading)** 규칙에 따라 하나를 고른다. "왜 내 스타일이 안 먹지?"의 대부분은 이 우선순위 문제다.

## 기본 선택자

| 선택자 | 예 | 의미 |
| --- | --- | --- |
| 전체 | `*` | 모든 요소 |
| 요소(타입) | `p`, `div` | 해당 태그 전부 |
| 클래스 | `.box` | `class="box"`인 요소 |
| 아이디 | `#header` | `id="header"`인 요소 |
| 속성 | `div[lang]`, `input[type="text"]` | 특정 속성을 가진 요소 |

요소 선택자는 해당 태그 전부에 적용된다는 점이 장점이자 단점이다. 태그를 바꾸면 스타일도 사라진다. 선택자는 붙여서 조합할 수 있다: `div.box`, `.box.area`, `.button.on`(상태별 변형, variants).

## 결합자(Combinators)

| 결합자 | 문법 | 의미 |
| --- | --- | --- |
| 자손 | `A B` | A 안에 있는 **모든** B |
| 자식 | `A > B` | A **바로 아래** B |
| 일반 형제 | `A ~ B` | A 뒤에 오는 형제 B 전부 |
| 인접 형제 | `A + B` | A **바로 뒤**의 형제 B 하나 |

```css
div span { color: red; }    /* div 안의 모든 span */
div > span { color: red; }  /* div의 직계 자식 span만 */
p ~ span { color: red; }    /* p 뒤에 오는 형제 span 모두 */
li + li { border-top: 1px solid #eee; } /* 첫 항목을 제외한 li 사이 구분선 */
```

조합에 이론상 제한은 없지만 `.box > div > h1 + p`처럼 깊어질수록 관리가 어려워진다. 실무에서는 3~4단계 이상 중첩하지 않는 편이 좋다.

## 가상 클래스와 가상 요소

### 가상 클래스(pseudo-class) — 요소의 **상태**

```css
a:hover {}    /* 마우스를 올린 상태(터치 스크린에서는 한 번 탭한 상태) */
a:active {}   /* 클릭하고 있는 상태 */
a:visited {}  /* 이미 방문한 링크 */
input:focus {} /* 포커스를 받은 상태 */
input:checked {} /* 체크된 radio/checkbox */
li:first-child {} li:last-child {} /* 부모 기준 첫/마지막 자식 */
```

### 가상 요소(pseudo-element) — 실제로는 없는 **요소**

의미상 필요 없지만 스타일(아이콘, 장식)을 위해 요소가 필요할 때, HTML을 건드리지 않고 가상의 요소를 만든다.

```css
div::before { content: ''; } /* div 콘텐츠의 맨 앞 */
div::after { content: ''; }  /* div 콘텐츠의 맨 뒤 */
input::placeholder { color: #999; }
```

- 가상 요소는 `::`를 쓰고, `::before`/`::after`는 `content` 속성이 필수다.
- 별도 `display`가 없으면 인라인(텍스트)으로 취급되고, 텍스트 복사 범위에 포함되지 않는다.

## 캐스케이딩: 무엇이 적용되는가

```html
<div class="box area">무슨 색일까?</div>
```

```css
.box { color: red; }
.area { color: blue; } /* 같은 특정성이면 나중에 선언된 것이 이긴다 → 파랑 */
```

적용 순서는 다음과 같이 판단한다.

1. **중요도**: `!important`가 붙은 선언이 가장 우선한다. 흐름을 깨뜨리므로 존재만 알고 되도록 쓰지 않는다.
2. **특정성(specificity)**: 선택자가 얼마나 구체적인가.
3. **선언 순서**: 특정성이 같으면 뒤에 선언된(나중에 로드된) 것이 적용된다.

### 특정성 계산

선택자를 `(a, b, c)`로 센다. 전체 선택자 `*`는 무시한다.

- a = ID 선택자 개수
- b = 클래스, 속성 선택자, 가상 클래스 개수
- c = 요소 선택자, 가상 요소 개수

```css
#box {}               /* (1,0,0) */
.box .area {}         /* (0,2,0) */
.box.area.container {}/* (0,3,0) */
div.box {}            /* (0,1,1) */
div {}                /* (0,0,1) */
```

인라인 스타일은 이 모든 선택자보다 우선한다. 요약하면 **인라인 > ID > 클래스·속성·가상 클래스 > 요소·가상 요소** 순이다.

## 상속

부모에 적용한 스타일 중 일부는 자손에게 그대로 전달된다.

| 상속됨 | 상속되지 않음 |
| --- | --- |
| 텍스트 관련(`color`, `font-*`, `line-height` 등), `visibility` | 박스 모델(`width`, `margin`, `padding`, `border`), `position` 관련 |

```css
body {
  font-size: 18px;
  line-height: 22px;
  color: #333;
}

/* input, button은 브라우저 기본 스타일이 있어 상속받지 않으므로 명시적으로 상속 */
input, button {
  font-size: inherit;
  color: inherit;
}
```

참고로 `opacity`는 상속되는 속성이 아니다. 부모를 반투명하게 하면 자식까지 함께 그려지기 때문에 상속처럼 보일 뿐이다.

## 핵심 정리

- 선택자는 기본 선택자 → 결합자 → 가상 클래스·요소 순으로 확장된다.
- 겹치는 스타일은 `!important` → 특정성 → 선언 순서로 결정된다.
- 글꼴·색상은 상속되고, 박스·위치 관련 속성은 상속되지 않는다.
