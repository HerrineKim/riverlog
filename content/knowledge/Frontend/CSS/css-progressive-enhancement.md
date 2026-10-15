---
title: "CSS 점진적 향상: 폴백과 피처 쿼리"
concept: "Progressive Enhancement"
summary: "새 CSS 기능을 지원하지 않는 브라우저를 '똑같이 보이게'가 아니라 '쓸 만하게' 지원하는 방식. 모르는 CSS는 무시된다는 규칙, 새 레이아웃이 옛 레이아웃을 덮어쓰는 규칙, @supports 피처 쿼리로 폴백을 정리하는 패턴, 무거운 폴리필을 피하는 이유, 실제 브라우저 테스트까지."
tags: ["css", "browser", "layout", "frontend"]
source: other
date: "2026-10-13"
sources: ["https://webactually.com/2018/01/19/css-%ea%b7%b8%eb%a6%ac%eb%93%9c%eb%a1%9c-%eb%af%b8%ec%a7%80%ec%9b%90-%eb%b8%8c%eb%9d%bc%ec%9a%b0%ec%a0%80-%ec%a7%80%ec%9b%90%ed%95%98%ea%b8%b0/", "https://webactually.com/2017/11/30/css-%ea%b7%b8%eb%a6%ac%eb%93%9c-%eb%a0%88%ec%9d%b4%ec%95%84%ec%9b%83%ec%9d%84-%ec%a7%80%ea%b8%88-%ec%82%ac%ec%9a%a9%ed%95%b4%eb%8f%84-%ec%a0%95%eb%a7%90-%ea%b4%9c%ec%b0%ae%ec%9d%84%ea%b9%8c%ec%9a%94/", "https://webactually.com/2020/01/29/ie%EC%97%90%EC%84%9C%EC%9D%98-css-%EA%B7%B8%EB%A6%AC%EB%93%9C-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-%EC%9D%BC%EB%B0%98%EC%A0%81%EC%9D%B8-ie-%EA%B7%B8%EB%A6%AC%EB%93%9C-%EC%98%A4%ED%95%B4%EB%A5%BC/", "https://webactually.com/2018/10/02/ie%ec%97%90%ec%84%9c-css-%ea%b7%b8%eb%a6%ac%eb%93%9c-%ec%82%ac%ec%9a%a9%ed%95%98%ea%b8%b0-css-%ea%b7%b8%eb%a6%ac%eb%93%9c%ec%99%80-autoprefixer/", "https://webactually.com/2018/11/13/ie%ec%97%90%ec%84%9c-css-%ea%b7%b8%eb%a6%ac%eb%93%9c-%ec%82%ac%ec%9a%a9%ed%95%98%ea%b8%b0-%ea%b0%84%ea%b2%a9%ec%9c%bc%eb%a1%9c-%ec%9e%90%eb%8f%99-%eb%b0%b0%ec%b9%98/", "https://webactually.com/2020/07/27/ie%ec%97%90%ec%84%9c-css-%ea%b7%b8%eb%a6%ac%eb%93%9c-%ec%82%ac%ec%9a%a9%ed%95%98%ea%b8%b0-%ec%a4%91%eb%b3%b5%eb%90%9c-%ea%b7%b8%eb%a6%ac%eb%93%9c-%ec%98%81%ec%97%ad-%ec%9d%b4%eb%a6%84/", "https://web.dev/baseline", "https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available", "https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-name"]
---

> Rachel Andrew의 「[CSS 그리드로 미지원 브라우저 지원하기](https://webactually.com/2018/01/19/css-%ea%b7%b8%eb%a6%ac%eb%93%9c%eb%a1%9c-%eb%af%b8%ec%a7%80%ec%9b%90-%eb%b8%8c%eb%9d%bc%ec%9a%b0%ec%a0%80-%ec%a7%80%ec%9b%90%ed%95%98%ea%b8%b0/)」(2018.01)·「CSS 그리드 레이아웃을 지금 사용해도 정말 괜찮을까」(2017.11)와 Daniel Tonon의 「IE에서 CSS 그리드 사용하기」 시리즈(2018~2020, 웹액츄얼리 번역)를 바탕으로 재구성한 노트다.

## 점진적 향상이란

점진적 향상(Progressive Enhancement)은 **모든 브라우저에 쓸 만한 기본 경험을 주고, 새 기능을 지원하는 브라우저에는 더 나은 경험을 얹는** 방식이다. 출발점은 "지원"의 뜻을 정하는 것이다.

| "지원"의 뜻 | 결과 |
| --- | --- |
| 모든 브라우저에서 똑같이 보인다 | 새 기능은 가장 오래된 대상 브라우저가 지원할 때까지 못 쓴다 |
| 모든 브라우저에서 콘텐츠를 무리 없이 쓸 수 있다 | 새 기능을 지금 쓰고, 옛 브라우저에는 단순한 레이아웃을 준다 |

**모든 브라우저에서 똑같아야 한다면 그 기능을 쓰지 않는다.** 새 기능은 이전에 불가능했던 일을 하려고 쓰는 것이지, 옛 디자인을 똑같이 재현하려고 쓰는 것이 아니다.

CSS 그리드·플렉스박스는 이제 모든 주요 브라우저가 지원한다. 같은 원칙이 지금은 지원 시기가 엇갈린 새 기능에 그대로 적용된다. Baseline 연도는 Chrome·Edge·Firefox·Safari가 모두 지원하게 된 해다(Newly available). 그로부터 30개월이 지나면 Widely available이 된다.

| 기능 | Baseline |
| --- | --- |
| 캐스케이드 레이어 `@layer` | 2022 |
| 컨테이너 크기 쿼리 `@container`, 서브그리드, `:has()`, 네이티브 중첩, `oklch()`, `color-mix()` | 2023 |
| 상대 색상 문법(`oklch(from …)`), `light-dark()`, `font-size-adjust` | 2024 |
| 같은 문서 뷰 트랜지션(`document.startViewTransition()`), `@scope` | 2025 |
| 앵커 위치 지정(anchor positioning) | 2026 |
| `text-wrap: pretty` | 아직 아님 (2026년 10월 기준 Firefox 미지원) |

최신 상태는 [web.dev Baseline](https://web.dev/baseline)과 [Can I use](https://caniuse.com/)에서 확인한다.

## 지원 대상 정하기

- 추측하지 말고 **실제 방문자 분석 데이터**를 본다. 모바일에서 못 쓰는 사이트라면 모바일 방문이 적게 잡혀 데이터가 왜곡된다.
- 데이터가 없으면 Can I Use의 지역별 사용 통계나 Baseline(웹 플랫폼 기능이 모든 주요 브라우저에서 쓸 수 있는지 표시하는 기준)을 참고한다.
- 사이트의 대상 지역을 잊지 않는다. 저사양 기기와 데이터 절약형 브라우저가 많은 시장에서는 새 기능 지원이 늦다.

## CSS가 이미 가진 두 가지 장치

### 1. 모르는 CSS는 무시된다

브라우저는 이해하지 못하는 속성과 값을 건너뛴다. 그래서 옛 방식으로 먼저 쓰고 그 아래에 새 방식을 쓰면, 옛 브라우저는 앞부분만, 새 브라우저는 둘 다 읽는다. 같은 선언 안에서도 통한다.

```css
.card {
  background: #3a7;                       /* 폴백 */
  background: oklch(65% 0.15 160);        /* 지원하면 이 값이 이긴다 */
}
```

### 2. 새 레이아웃은 옛 레이아웃을 안다

명세에 "그리드·플렉스 아이템이 되면 무엇이 무효가 되는지"가 정의돼 있다. 대부분의 폴백이 자동으로 꺼진다.

| 폴백으로 쓴 것 | 부모가 `display: grid`가 되면 |
| --- | --- |
| `float`, `clear` | 무시된다 |
| `display: inline-block` | 아이템에 효과가 없다 |
| `display: table-cell` | 그리드 아이템이 되어 테이블처럼 동작하지 않는다 |
| `vertical-align` | 무시된다. 대신 박스 정렬(`align-self` 등)을 쓴다 |
| `flex`, `flex-grow` 등 | 무시된다 |
| 다단 `column-count`, `column-width` | 무시된다 |

## 피처 쿼리로 틈새 메우기

자동으로 꺼지지 않는 값도 있다. 대표적인 것이 **아이템에 준 너비**다. float 폴백에서 `width: 33%`를 줬다면, 그리드에서는 이 33%가 컨테이너가 아니라 **그리드 영역** 기준이 되어 아이템이 셀의 3분의 1만 차지한다.

피처 쿼리(`@supports`)는 미디어 쿼리처럼 동작하되, 화면 크기 대신 **브라우저가 특정 CSS를 지원하는지** 묻는다.

```css
/* 1. 폴백: 모든 브라우저가 읽는다 */
.item { float: left; width: 33.333%; }

/* 2. 새 레이아웃 */
.wrapper { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

/* 3. 틈새로 새는 폴백 값만 되돌린다 */
@supports (display: grid) {
  .item { width: auto; }
}

/* 선택자 지원 여부도 물을 수 있다 */
@supports selector(:has(> img)) {
  .card:has(> img) { grid-template-rows: auto 1fr; }
}
```

**피처 쿼리 안에는 새 코드 전체가 아니라 "되돌리거나 덧붙일 값"만 넣는다.** `@supports not (…)`으로 미지원 브라우저 전용 규칙을 쓸 수도 있다. 폴리필도 핵도 아닌, 명세에 정의된 CSS만으로 처리하는 방법이다.

## 무거운 폴리필을 피하는 이유

- 레이아웃 전체를 계산하는 기능을 자바스크립트로 흉내 내면 높이·위치를 다시 계산하느라 로딩이 불안정해진다.
- 미지원 브라우저는 대개 **오래되거나 느린 기기**다. 가장 약한 기기에 가장 무거운 스크립트를 얹는 셈이다.
- 줄어들 사용자층 때문에 개발·테스트 시간이 크게 는다.

동작 범위가 좁고 가벼운 폴리필은 예외가 될 수 있다.

## 변환 도구의 한계

PostCSS·Autoprefixer·Lightning CSS 같은 도구는 접두사를 붙이거나 새 문법을 옛 문법으로 바꿔 준다(예: 네이티브 중첩 → 펼친 선택자, 논리 속성 → 물리 속성). **도구는 문법을 옮길 뿐 동작까지 옮기지는 못한다.** 대응 문법이 없는 기능은 조용히 깨지므로 경고를 읽고 결과를 실제 브라우저에서 확인한다.

## 폴백 테스트

- 확실한 방법은 **기능을 지원하지 않는 실제 브라우저**로 보는 것이다. 구버전 브라우저(자동 업데이트를 끈 설치본)나 BrowserStack 같은 원격 테스트 서비스를 쓴다.
- `@supports (display: gridx)`처럼 일부러 틀린 값으로 미지원 상태를 흉내 내지 않는다. 피처 쿼리 밖의 새 코드는 여전히 적용돼 거짓 양성이 나기 쉽다.
- 테스트 대상은 "지원 / 미지원" 두 묶음이면 충분하다.

## 도입을 설득하는 근거

| 근거 | 내용 |
| --- | --- |
| 개발 시간 | 새 기능이 복잡도를 줄여 지금과 이후 유지보수 시간을 아낀다 |
| 디자인 | 새 기능 없이는 견고하게 만들 수 없는 디자인이다 |
| 성능 | 무거운 레이아웃 프레임워크나 스크립트를 걷어낼 수 있다 |
| 지원 추세 | 에버그린 브라우저는 자동 업데이트되어 미지원 비율이 빠르게 준다 |

## 역사

과거에는 IE10·11이 그리드 초기 명세를 `-ms-grid` 접두사로만 지원했다. 자동 배치·`gap`·`auto-fill`이 없어 아이템을 하나씩 배치하고 간격을 빈 트랙으로 흉내 냈으며, Autoprefixer의 그리드 변환 옵션으로 `grid-template-areas`를 옮기기도 했다. IE는 2022년 지원이 끝나 이런 우회법은 필요 없다. 피처 쿼리도 IE만 지원하지 않았다.

## 정리

- "지원"은 똑같이 보이는 것이 아니라 쓸 수 있는 것이다.
- 폴백을 먼저 쓰고 새 기능을 아래에 쓴다. 모르는 CSS는 무시되고, 새 레이아웃은 옛 레이아웃을 덮어쓴다.
- 새어 나오는 값만 `@supports` 안에서 되돌린다. 선택자 지원은 `@supports selector()`로 묻는다.
- 무거운 폴리필 대신 단순한 경험을 준다. 변환 도구 결과는 실제 브라우저로 확인한다.

관련 노트: [[css-grid|CSS 그리드 레이아웃]], [[flexbox|Float와 Flexbox 레이아웃]], [[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]], [[responsive-design|반응형 디자인과 다국어 타이포그래피]]
