---
title: "CSS 설계 방법론: BEM과 ITCSS"
concept: "BEM"
summary: "전역 범위와 명시도 문제를 규칙으로 다스리는 CSS 방법론. 이름으로 관계를 드러내는 BEM(.block__element--modifier), 파일을 일반→구체 순서의 일곱 층으로 쌓는 ITCSS와 BEMIT 접두사, OOCSS·SMACSS와의 차이를 비교하고, 지금은 @layer·@scope·CSS Modules가 같은 일을 어떻게 나눠 맡는지 정리한다."
tags: ["css", "architecture", "design-pattern", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://css-tricks.com/bem-101/", "https://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/", "https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/", "https://developer.mozilla.org/en-US/docs/Web/CSS/@layer", "https://developer.mozilla.org/en-US/docs/Web/CSS/@scope", "https://github.com/grab/front-end-guide"]
---

> 「[BEM 101](https://css-tricks.com/bem-101/)」, 「[MindBEMding – getting your head ’round BEM syntax](https://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/)」, 「[ITCSS: Scalable and Maintainable CSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)」을 바탕으로, 네이티브 대안은 MDN 문서로 확인해 재구성한 노트다.
> Grab의 「[Front End Guide](https://github.com/grab/front-end-guide)」를 바탕으로 보강했다.

## 방법론이 푸는 문제

CSS는 모든 규칙이 문서 전체에 걸리는 **전역 범위**와, 덮어쓰려면 더 센 선택자가 필요한 **명시도**를 갖는다. 규모가 커지면 고칠 때 무엇이 깨질지 몰라 **지우지 못하고 덧붙이기만 하는** 스타일시트가 된다. 대규모 CSS 문제의 대부분은 결국 **수정에 대한 확신이 없다**는 문제다. 배경은 [[css-history|CSS의 역사]]에 있다.

방법론은 도구 없이 **규칙**으로 이 문제를 다룬다. 축이 서로 다르므로 함께 쓴다.

| 방법론 | 다루는 축 | 핵심 규칙 |
| --- | --- | --- |
| [[oocss\|OOCSS]] | 재사용 단위 | 구조와 겉모양, 컨테이너와 콘텐츠를 분리한 「객체」 |
| SMACSS | 규칙 분류 | Base · Layout · Module · State · Theme 다섯 범주. 상태는 `.is-active`처럼 접두사 |
| **BEM** | 이름 짓기 | `.block__element--modifier`로 관계를 이름에 적는다 |
| **ITCSS** | 파일 순서 | 일반적인 것에서 구체적인 것 순으로 층을 쌓는다 |

## BEM

BEM(Block, Element, Modifier)은 Yandex가 만든 이름 규칙이다. 지금 흔히 쓰는 `__`·`--` 표기는 Nicolas Gallagher가 다듬은 변형이다.

| 부분 | 뜻 | 예 |
| --- | --- | --- |
| Block | 독립적으로 성립하는 컴포넌트 | `.site-search` |
| Element | 블록의 일부. 블록 밖에서는 의미가 없다 | `.site-search__field` |
| Modifier | 블록·요소의 다른 상태나 변형 | `.site-search--full`, `.btn--primary` |

이중 밑줄과 이중 하이픈을 쓰는 이유는 블록 이름 자체에 하이픈을 쓸 수 있게 하기 위해서다(`site-search`).

```html
<form class="site-search site-search--full">
  <input class="site-search__field" type="text">
  <button class="site-search__button">검색</button>
</form>
```

### 얻는 것

- **이름만 보고 관계를 안다.** `.hand`는 시계 바늘인지 사람 손인지 모르지만 `.person__hand`는 분명하다. 마크업을 읽는 사람이 CSS를 열지 않고도 무엇이 무엇에 딸렸는지 안다.
- **명시도가 클래스 하나로 평평하다.** 모든 선택자가 클래스 하나라 중첩·ID가 없고, 덮어쓰기 싸움이 생기지 않는다.
- **재사용할 것을 먼저 찾는다.** 새 변형이 필요하면 이미 있는 modifier부터 본다.

### 규칙 위반 패턴

| 하지 않는다 | 이유 |
| --- | --- |
| `.nav .btn--orange { … }` | 다른 블록이 블록·modifier를 덮어쓰면 마크업만 보고 결과를 알 수 없다 |
| `.block__elem1__elem2` | 요소는 DOM 깊이가 아니라 블록에만 딸린다. `.card__title`처럼 한 단계만 쓴다 |
| 필요 없는 부모 블록 만들기 | 요소가 혼자 성립하면 그 자체를 블록으로 만든다 |
| modifier만 단독으로 쓰기 | `class="btn btn--primary"`처럼 기본 클래스와 함께 쓴다 |

Sass에서는 `&__element`, `&--modifier`로 중첩해 써도 결과 선택자는 평평하게 나온다.

## ITCSS

ITCSS(Inverted Triangle CSS)는 Harry Roberts가 만든 **파일 배치** 방법이다. 스타일을 역삼각형 층으로 나눠, 위에서 아래로 갈수록 **영향 범위는 좁아지고 명시도는 높아지고 구체성은 커지게** 쌓는다. 그러면 뒤에 오는 규칙이 앞의 규칙을 자연스럽게 이긴다.

```text
▽ Settings    변수(색·글꼴). CSS를 출력하지 않는다
 ▽ Tools      전역 믹스인·함수. CSS를 출력하지 않는다
  ▽ Generic   리셋·노멀라이즈, box-sizing. 여기서부터 CSS가 나온다
   ▽ Elements  맨 태그(h1, a) 기본 스타일
    ▽ Objects   꾸밈 없는 구조 패턴(미디어 객체 등)
     ▽ Components 구체적인 UI 컴포넌트. 작업 대부분이 여기
      ▽ Utilities  앞의 모든 것을 이기는 도우미(.u-hidden)
```

![ITCSS 역삼각형 층](https://cdn.prod.website-files.com/6a43a37920abffc0916725ea/6a43a37920abffc091672c81_itcss-layers.avif)

### BEMIT: 층을 이름에 적는다

BEM에 층 접두사를 붙이면 클래스만 보고 어느 층인지 안다.

| 접두사 | 층 | 예 |
| --- | --- | --- |
| `o-` | Object | `.o-media`, `.o-layout` |
| `c-` | Component | `.c-user`, `.c-teaser__title` |
| `u-` | Utility | `.u-hidden` |
| `is-`, `has-` | 상태 | `.is-open` |
| `js-` | JS 훅. 스타일을 걸지 않는다 | `.js-toggle` |

### 쓰면서 생기는 문제와 처방

- **모든 층이 필요하지 않다.** 순서만 지키면 된다. 최소 구성은 Generic + Components다.
- **Objects를 남용하지 않는다.** `o-section o-section--dark c-banner c-banner--dark`처럼 한 요소에 객체와 컴포넌트 클래스가 쌓이면 스타일의 출처를 추적하기 어렵다. 객체를 아예 빼거나, HTML을 중첩해 한 요소의 클래스 수를 줄인다.
- **간격은 컴포넌트 밖으로 뺀다.** 컴포넌트에 바깥 `margin`을 넣으면 놓이는 자리마다 modifier가 생긴다. 래퍼·스페이서 객체나 간격 유틸리티로 분리한다([[utility-first-css|유틸리티 우선 CSS]]).
- **중첩은 두 단계까지.** 깊은 중첩은 과하게 구체적인 선택자를 만든다.
- **약간의 중복은 괜찮다.** 여러 객체로 추상화한 스타일 사슬을 추적하는 것보다, 몇 컴포넌트에 반복된 값을 고치는 편이 쉽다.

## 지금은 무엇이 대신하나

방법론의 캡슐화는 **관례로만 지켜진다**. 한 사람이 규칙을 어기는 순간 깨지고, 같은 스타일시트를 만지는 사람이 늘수록 어길 확률도 커진다. 그래서 큰 팀일수록 방법론이 규칙으로 지키던 것을 CSS 스펙과 도구가 강제하게 옮겨 갔다.

| 방법론이 하던 일 | 지금의 수단 |
| --- | --- |
| ITCSS의 층 순서 | `@layer settings, generic, elements, objects, components, utilities;` 층 순서가 명시도보다 먼저 비교된다 |
| BEM의 블록 이름으로 범위 흉내 | `@scope (.card) to (.card__body) { … }`로 하위 트리에 범위를 건다. 모든 주요 브라우저 지원(Firefox 146, 2025) |
| 이름 충돌 방지 | CSS Modules가 빌드 때 클래스 이름을 고유하게 바꾼다([[css-in-js\|CSS-in-JS와 CSS Modules]]) |
| 낮은 명시도 유지 | `:where()`로 명시도 0인 기본 스타일([[selectors\|선택자와 우선순위]]) |

```css
@layer reset, base, components, utilities;

@layer components {
  .card { padding: 1rem; }
  .card__title { font-size: 1.25rem; }
}
@layer utilities {
  .u-hidden { display: none; }   /* 명시도와 상관없이 components를 이긴다 */
}
```

그래도 BEM 이름 규칙은 CSS Modules 안에서도, 전역 CSS를 쓰는 워드프레스 같은 테마형 사이트에서도 여전히 쓸모가 있다.

## 정리

- 방법론은 전역 범위와 명시도 문제를 **규칙**으로 다스린다. 이름(BEM)과 파일 순서(ITCSS)는 서로 다른 축이라 함께 쓴다.
- BEM은 모든 선택자를 클래스 하나로 평평하게 두고, 관계는 이름에 적는다.
- ITCSS는 일반→구체 순서로 층을 쌓아 뒤의 규칙이 앞을 이기게 한다. 이 생각은 지금 `@layer`로 그대로 옮겨진다.
- 규칙은 지킬 때만 가치가 있다. 팀이 지킬 수 없다면 도구(CSS Modules, `@scope`)로 강제한다.

관련 노트: [[oocss|객체 지향 CSS(OOCSS)]], [[css-history|CSS의 역사로 본 CSS가 어려워진 이유]], [[utility-first-css|유틸리티 우선 CSS]], [[selectors|CSS 선택자와 우선순위]], [[sass|Sass: 파일 구조, 믹스인과 @extend]], [[css-basics#리셋과 노멀라이즈|CSS 기초: 리셋과 노멀라이즈]]
