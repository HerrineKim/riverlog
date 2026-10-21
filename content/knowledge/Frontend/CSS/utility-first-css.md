---
title: "유틸리티 우선 CSS"
concept: "Utility-First CSS"
summary: "속성 하나짜리 클래스를 조합해 화면을 만들고, 반복이 보일 때만 컴포넌트로 뽑는 CSS 작성 방식. '관심사의 분리'를 의존 방향의 선택으로 다시 보는 관점, 시맨틱 클래스에서 유틸리티까지 넘어가는 단계, 정해진 값만 고르게 해 생기는 일관성, 인라인 스타일과의 차이, 장단점과 Tailwind CSS v4 기준의 현재 사용법을 정리한다."
tags: ["css", "architecture", "design-system", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://adamwathan.me/css-utility-classes-and-separation-of-concerns/", "https://css-irl.info/a-year-of-utility-classes/", "https://css-tricks.com/need-css-utility-library/", "https://tailwindcss.com/docs/styling-with-utility-classes", "https://tailwindcss.com/docs/theme", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Tailwindcss.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/tailwindcss%20Complex%20variants.md", "https://tailwindcss.com/docs/hover-focus-and-other-states"]
---

> 「[CSS Utility Classes and "Separation of Concerns"](https://adamwathan.me/css-utility-classes-and-separation-of-concerns/)」, 「[A Year of Utility Classes](https://css-irl.info/a-year-of-utility-classes/)」, 「[So you need a CSS utility library?](https://css-tricks.com/need-css-utility-library/)」을 바탕으로, 현재 사용법은 Tailwind CSS 공식 문서로 확인해 재구성한 노트다.
>
> 「변형으로 선택자 표현하기」는 「[Frontend_TIL: Tailwindcss](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Tailwindcss.md)」, 「[tailwindcss Complex variants](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/tailwindcss%20Complex%20variants.md)」를 바탕으로 보강했다.

## 유틸리티 우선이란

**유틸리티 클래스**는 한 가지 일만 하고 그 일로 이름 붙인 클래스다. `.text-center`는 `text-align: center` 하나다. 원자적 CSS(Atomic CSS), 함수형 CSS라고도 부른다.

**유틸리티 우선(utility-first)** 은 화면을 먼저 유틸리티 조합으로 만들고, **같은 조합이 반복될 때만** 컴포넌트로 뽑는 방식이다. 컴포넌트를 먼저 설계하고 예외에만 유틸리티를 쓰던 BEM·ITCSS의 순서를 뒤집는다.

```html
<div class="flex items-center gap-4 rounded-lg p-6 shadow-md">
  <img class="size-12 rounded-full" src="avatar.png" alt="">
  <p class="text-sm text-gray-600">새 메시지가 있다</p>
</div>
```

## 관심사의 분리를 다시 보기

"HTML에는 내용만, 스타일 결정은 CSS에만"이라는 원칙대로 `.author-bio` 같은 **내용 기반 이름**을 붙여도, CSS 선택자는 결국 마크업 구조를 거울처럼 따라간다. HTML은 스타일을 몰라도 CSS는 HTML을 알아야 한다. 분리됐다기보다 **의존 방향이 정해진 것**이다.

| 이름 짓는 방식 | 의존 방향 | 얻는 것 | 잃는 것 | 예 |
| --- | --- | --- | --- | --- |
| 내용 기반 (`.author-bio`) | CSS가 HTML에 의존 | HTML을 그대로 두고 스타일만 갈아 끼울 수 있다 | CSS를 재사용할 수 없다 | CSS Zen Garden |
| 내용 무관 (`.media-card`, `.text-sm`) | HTML이 CSS에 의존 | CSS를 재사용한다. 새 화면에 CSS를 안 써도 된다 | HTML을 고치지 않고는 모양을 못 바꾼다 | Bootstrap, Tailwind |

어느 쪽도 틀리지 않았다. **다시 꾸밀 수 있는 HTML과 재사용할 수 있는 CSS 중 무엇이 더 중요한가**의 선택이다. 한 디자인 시스템으로 앱을 만드는 경우 대개 재사용이 더 중요하다. 이 의존 방향 관점은 [[separation-of-concerns|프론트엔드에서 관심사의 분리]]와 같다.

## 유틸리티까지 가는 단계

재사용을 따라가면 유틸리티에 자연스럽게 닿는다.

| 단계 | 방식 | 부딪히는 문제 |
| --- | --- | --- |
| 1. 시맨틱 CSS | `.author-bio > h2` 같은 내용 이름 + 중첩 선택자 | CSS가 마크업 구조에 묶인다 |
| 2. 구조와 분리 | BEM으로 요소마다 클래스(`.author-bio__name`) | 모양이 같은 `.article-preview`가 생기면 복붙하거나 `@extend`한다 |
| 3. 내용 무관 컴포넌트 | 공통점으로 이름 짓는다(`.media-card`) | 하위 요소(`.stacked-form__button`)가 블록 밖에서 재사용되지 않는다 |
| 4. 컴포넌트 + 유틸리티 | 속성 하나짜리 modifier(`.actions-list--right`)를 `.align-right`로 | 속성 하나 때문에 컴포넌트를 만드는 일이 사라진다 |
| 5. 유틸리티 우선 | 여백·색·크기까지 유틸리티로 조합 | 반복되는 조합만 컴포넌트로 뽑는다 |

**하는 일이 많고 구체적인 컴포넌트일수록 재사용하기 어렵다.** 그래서 작은 단위로 쪼개 합성하는 쪽으로 간다.

## 일관성은 고르는 데서 나온다

새 CSS를 쓸 때마다 빈 캔버스다. 누구는 글자색을 `darken($text, 10%)`, 누구는 12%로 바꾸다 보면 스타일시트에 글자색이 수백 개 생긴다. 변수나 믹스인을 써도 새 CSS 한 줄은 새 복잡성의 기회다.

유틸리티는 **정해진 목록에서 고르게** 한다. `text-sm`인가 `text-xs`인가, `py-3`인가 `py-4`인가만 정하면 된다. 결과는 다음과 같다.

- 값이 디자인 토큰 범위 안에 머문다. 수백 가지 색이 열 몇 개로 줄어든다([[design-system#디자인 토큰|디자인 토큰]]).
- 프로젝트가 커져도 CSS 양이 선형으로 늘지 않는다.
- 이름을 지을 필요가 없다. `.news-card`를 뉴스가 아닌 곳에 쓰게 되는 문제도 없다.

### 인라인 스타일과 무엇이 다른가

| | 인라인 `style` | 유틸리티 클래스 |
| --- | --- | --- |
| 값 | 아무 값이나(`13px`, `.85em`, `.9rem`) | 정해진 단계에서 고른다 |
| 상태·반응형 | `:hover`, 미디어 쿼리를 쓸 수 없다 | `hover:`, `md:` 변형(variant)으로 쓴다 |
| 명시도 | 일반 규칙보다 항상 세다 | 클래스 하나로 평평하다 |

## 컴포넌트는 여전히 만든다

유틸리티만으로 모든 것을 만들 필요는 없다. 같은 조합이 여러 곳에 반복되면 추출한다. 추출 방법은 두 가지다.

1. **템플릿 컴포넌트로 추출한다.** React·Vue 컴포넌트 하나에 클래스 묶음을 가둔다. 컴포넌트 프레임워크를 쓰면 이쪽이 기본이다.
2. **CSS 클래스로 추출한다.** `@apply`로 유틸리티를 묶는다. 템플릿 시스템이 없거나 마크업을 바꿀 수 없을 때 쓴다.

```css
.btn-primary {
  @apply rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500;
}
```

**한 번만 쓰는 것은 추출하지 않는다.** 메인 내비게이션처럼 레이아웃 파일에 한 번 나오는 것을 컴포넌트 클래스로 만드는 것은 **섣부른 추상화**다.

## 단점과 주의점

| 단점 | 내용 | 대응 |
| --- | --- | --- |
| 긴 클래스 문자열 | 중복·충돌·오타가 눈에 띄지 않는다 | 에디터 자동완성·정렬 플러그인(Tailwind IntelliSense, Prettier 플러그인) |
| 변형 관리 | 여러 변형이 같은 패딩을 쓸 때 한 번에 바꾸려면 HTML 여러 곳을 고친다 | 템플릿 컴포넌트로 추출하거나 토큰을 바꾼다 |
| 세 가지 방식의 혼재 | 인라인 유틸리티 + `@apply` + 일반 CSS가 섞이면 무엇이 이기는지 헷갈린다 | 셋 중 기본을 정하고, 일반 CSS는 유틸리티로 표현하기 어려운 것만 |
| 표현의 한계 | 복잡한 그리드, 부모 호버에 따른 자식 변화 등 | 임의 값(`grid-cols-[1fr_2fr]`), `group-hover:`, 필요하면 일반 CSS |
| 섞어 쓰기 | 자체 클래스에 유틸리티를 "조금만" 뿌리면 스타일 정보가 CSS와 HTML 두 곳으로 흩어진다 | 전부 유틸리티이거나, 유틸리티를 아예 안 쓰거나 중 하나로 정한다 |

**유틸리티를 쓴다고 캐스케이드를 몰라도 되는 것은 아니다.** 예외를 처리하는 순간 다시 캐스케이드와 명시도를 다룬다.

## Tailwind CSS v4 기준 사용법

지금 유틸리티 우선의 사실상 표준은 Tailwind CSS다. v4(2025.01)에서 설정과 빌드 방식이 크게 바뀌었다.

| 항목 | 지금 | 과거 |
| --- | --- | --- |
| 설정 | CSS 파일 안의 `@theme`에 토큰을 CSS 변수로 선언 | `tailwind.config.js`(JS) |
| 불러오기 | `@import "tailwindcss";` 한 줄 | `@tailwind base; @tailwind components; @tailwind utilities;` |
| 안 쓰는 클래스 제거 | 소스를 스캔해 **쓴 클래스만 생성**(자동 감지) | 전체를 생성한 뒤 PurgeCSS로 제거. JS로 붙인 클래스가 지워지는 사고가 잦았다 |
| 사용자 유틸리티 | `@utility` 지시어 | JS 플러그인 |
| 사용자 변형(variant) | `@custom-variant` 지시어 | JS 플러그인의 `addVariant` |
| 우선순위 | 내부적으로 `@layer theme, base, components, utilities` | 생성 순서에 의존 |

```css
@import "tailwindcss";

@theme {
  --color-brand-500: oklch(0.62 0.19 260);
  --spacing: 0.25rem;          /* p-4 = calc(var(--spacing) * 4) = 1rem */
  --breakpoint-3xl: 120rem;
}
```

`@theme`에 선언한 값은 `bg-brand-500`, `3xl:` 같은 유틸리티와 일반 CSS 변수(`var(--color-brand-500)`)로 동시에 쓸 수 있다. 컨테이너 쿼리(`@container`, `@md:`)도 기본 변형으로 들어 있다.

### 변형으로 선택자 표현하기

클래스 이름은 `{변형:}*{속성}-{값}` 꼴이다. `p-4`는 `padding: calc(var(--spacing) * 4)`, `py-12`는 위아래, `pr-20`은 오른쪽만, `text-gray-500`은 회색 단계 500이다. 앞에 붙는 **변형(variant)** 이 선택자·미디어 쿼리를 맡는다: `hover:`, `focus:`, `md:`, `dark:`, `disabled:`.

형제·부모 상태에 따른 스타일도 기본 변형으로 된다. "포커스된 입력란 **다음** 요소"는 입력란에 `peer`를 붙이고 형제에 `peer-focus:`를 쓴다. 부모 기준은 `group`과 `group-hover:`다.

```html
<input class="peer" />
<p class="hidden peer-focus:block">입력란이 포커스되면 보인다</p>
```

기본 변형으로 안 되는 선택자는 임의 변형(`[&:nth-child(3)]:underline`)으로 한 번 쓰거나, 반복되면 `@custom-variant`로 이름을 붙인다.

```css
@custom-variant focused-sibling (:focus + &);   /* focused-sibling:bg-gray-200 */
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

v3까지는 `tailwind.config.js`의 플러그인에서 `addVariant('focused-sibling', ...)`로 만들었고, 그보다 앞서는 `variants.extend`에 변형을 쓸 속성을 일일이 등록해야 했다.

과거에는 Tachyons, Basscss 같은 미리 만든 유틸리티 라이브러리를 통째로 받아 썼다. 지금은 **쓴 클래스만 빌드 때 만드는 온디맨드 방식**(Tailwind, UnoCSS)이 기본이고, 런타임 CSS-in-JS 중에도 StyleX처럼 결과를 원자적 클래스로 뽑는 것이 있다([[css-in-js|CSS-in-JS와 CSS Modules]]).

## 정리

- 유틸리티 우선은 "관심사의 분리를 버린다"가 아니라 **CSS를 재사용 가능하게 두고 HTML이 CSS에 의존하게** 하는 선택이다.
- 정해진 값 목록에서 고르게 해 디자인 일관성을 강제하고, CSS가 프로젝트 크기에 비례해 자라지 않게 한다.
- 컴포넌트는 반복이 보일 때 추출한다. 한 번만 쓰는 것을 추상화하지 않는다.
- 섞어 쓰면 스타일이 흩어진다. 기본 방식을 하나로 정한다.

관련 노트: [[css-history|CSS의 역사로 본 CSS가 어려워진 이유]], [[css-methodologies|CSS 설계 방법론: BEM과 ITCSS]], [[oocss|객체 지향 CSS(OOCSS)]], [[css-in-js|CSS-in-JS와 CSS Modules]], [[separation-of-concerns|프론트엔드에서 관심사의 분리]]
