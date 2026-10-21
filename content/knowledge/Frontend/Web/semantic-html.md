---
title: "시맨틱 HTML과 문서 구조"
concept: "Semantic HTML"
summary: "태그로 모양이 아니라 의미를 표시하는 시맨틱 HTML. 랜드마크 태그, 제목 계층(h1~h6), <article>과 <section>을 언제 쓰는지, 요소의 암묵적 역할과 role 속성의 한계를 접근성 관점에서 정리했다. 아웃라인 알고리즘은 구현되지 않았으니 제목 수준은 직접 매긴다."
tags: ["html", "semantic", "a11y", "frontend", "seo"]
source: mixed
date: "2026-10-21"
sources: ["https://webactually.com/2020/03/03/%3Csection%3E%EC%9D%84-%EB%B2%84%EB%A6%AC%EA%B3%A0-HTML5-%3Carticle%3E%EC%9D%84-%EC%8D%A8%EC%95%BC-%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/", "https://developer.mozilla.org/en-US/blog/h1-element-styles/", "https://web.dev/learn/html/semantic-html", "https://web.dev/learn/html/headings-and-sections", "http://html5doctor.com/lets-talk-about-semantics/"]
---

> 「`<article>` 대 `<section>`」 부분은 브루스 로슨(Bruce Lawson)의 「Why You Should Choose HTML5 `<article>` Over `<section>`」(Smashing Magazine, 2020.01)을 웹액츄얼리 코리아가 번역한 글(2020.03)을 바탕으로 재구성했다. 「암묵적 역할과 접근성 트리」와 랜드마크가 되는 조건은 web.dev의 「[Learn HTML](https://web.dev/learn/html)」 강좌 중 「Semantic HTML」·「Headings and sections」 모듈을 바탕으로 보강했다. 「요소 이름은 어디서 왔나」는 HTML5 Doctor의 「[Let’s Talk about Semantics](http://html5doctor.com/lets-talk-about-semantics/)」를 바탕으로 보강했다.

## 시맨틱 HTML이란

시맨틱 HTML(Semantic HTML)은 태그를 **보이는 모양이 아니라 내용의 의미**에 맞게 고르는 것이다. `<div class="title">` 대신 `<h1>`, 클릭되는 `<div>` 대신 `<button>`을 쓴다. 겉모습은 CSS로 얼마든지 바꿀 수 있지만, 의미는 태그로만 전달된다.

| 누가 의미를 읽나 | 얻는 것 |
| --- | --- |
| 스크린 리더 사용자 | 제목 목록과 랜드마크로 페이지를 건너뛰며 탐색한다 |
| 검색 엔진 | 본문, 제목, 내비게이션을 구분해 색인한다 ([[seo-basics\|SEO 기초]]) |
| 브라우저·기기 | 읽기 모드, 워치의 읽기 화면이 본문을 찾는다 |
| 개발자 | 태그만 봐도 구조가 읽힌다 |

## 랜드마크 태그

| 태그 | 의미 | 스크린 리더에서 |
| --- | --- | --- |
| `<header>` | 페이지나 구역의 머리말. 사이트 제목·로고·주 메뉴 | `<article>`·`<aside>`·`<main>`·`<nav>`·`<section>` 밖에 있을 때만 배너(banner) 랜드마크 |
| `<nav>` | 내비게이션 링크 묶음. 사이트 머리말 안이면 주 메뉴, `<article>` 안이면 그 글의 목차 | 내비게이션 랜드마크. 여럿이면 이름을 붙인다 |
| `<main>` | 페이지의 주요 콘텐츠. 한 페이지에 하나 | 메인 랜드마크, 「본문으로 건너뛰기」의 목적지 |
| `<aside>` | 본문과 관련은 있지만 떼어 낼 수 있는 내용 | 보조(complementary) 랜드마크 |
| `<footer>` | 페이지나 구역의 꼬리말. 저작권, 연락처, 약관 링크 | `<header>`와 같은 조건에서만 정보(contentinfo) 랜드마크. 글마다 둔 `<footer>`는 랜드마크가 아니다 |
| `<article>` | 그 자체로 완결되어 따로 떼어 써도 되는 내용 | 글 단위 |
| `<section>` | 제목이 있는 일반적인 구역 | 이름(label)이 있을 때만 영역(region)으로 안내된다 |

랜드마크는 눈에 보이는 변화가 없다. 그래서 비용은 거의 없고 스크린 리더 사용자에게 효과가 크다. 다만 **많을수록 좋은 것은 아니다.** 랜드마크가 너무 많으면 페이지 구조가 오히려 소음이 된다. 큰 덩어리에만 쓰고, `<main>` 안의 중요한 하위 구역 두세 개 정도에만 이름 붙인 `<section>`을 둔다.

연락처는 `<address>`로 감싼다. 이름과 달리 우편 주소 전용이 아니라 **사람이나 조직의 연락 정보**를 뜻한다.

```html
<body>
  <header>
    <h1>머신러닝 워크숍</h1>
    <nav><a href="#reg">등록</a> <a href="#about">소개</a></nav>
  </header>
  <main>
    <article>
      <header><h2>첫 글</h2></header>   <!-- 랜드마크 아님 -->
      …
      <footer>작성자 정보</footer>     <!-- 랜드마크 아님 -->
    </article>
  </main>
  <aside>…</aside>
  <footer>
    <p>&copy; 2026 MLW</p>
    <address>강사: <a href="/hal">HAL</a>, <a href="/eve">EVE</a></address>
  </footer>
</body>
```

`<div>`로만 짜면 각 덩어리를 가리키려고 `id`·`class`를 붙이고 닫는 `</div>`마다 주석을 달게 된다. 시맨틱 요소로 짜면 태그 이름이 곧 훅이라 클래스 없이 `header nav a` 같은 낮은 특정도 선택자로 충분하다.

## 암묵적 역할과 접근성 트리

브라우저는 HTML을 파싱해 DOM과 CSSOM을 만들고, 그와 함께 **접근성 트리**(accessibility tree, 흔히 AOM이라 부르는 의미 중심의 DOM 사본)를 만든다. 스크린 리더는 이 트리를 읽는다. 시맨틱 요소는 저마다 **암묵적 역할(implicit role)** 을 가져 트리에 의미가 실린다.

| 요소 | 암묵적 역할 |
| --- | --- |
| `<main>` | `main` |
| `<nav>` | `navigation` |
| `<aside>` | `complementary` |
| 최상위 `<header>` / `<footer>` | `banner` / `contentinfo`. 구획 요소 안에서는 랜드마크가 아니다(크롬은 `FooterAsNonLandmark`, 파이어폭스는 `section`으로 표시) |
| 이름 있는 `<section>` | `region` |
| `<button>`, `<a href>`, `<input type="checkbox">` | `button`, `link`, `checkbox`. 인터랙티브 요소는 역할과 함께 **Tab 순서와 기본 키 동작**도 딸려 온다 |

`role` 속성(ARIA 명세)으로 어떤 요소에든 역할을 줄 수 있다. 하지만 `role`은 **의미만 바꾸고 동작은 더하지 않는다.** `<p role="button">`은 스크린 리더에 버튼이라고 알릴 뿐, 포커스도 Enter·Space 동작도 `HTMLButtonElement`의 메서드도 없다. 이미 역할이 있는 요소에 같은 역할을 다시 적지도 않는다(`<button role="button">`). 맞는 요소를 쓰는 것이 언제나 쉽다. ARIA를 쓰는 규칙은 [[aria-basics|ARIA와 접근 가능한 이름]]에 있다. 브라우저 개발자 도구의 접근성 패널에서 트리를 직접 확인할 수 있다.

## 제목은 h1~h6로 직접 매긴다

HTML5 명세에는 **아웃라인 알고리즘**이 있었다. `<section>`을 중첩하면 그 안의 `<h1>`이 자동으로 `<h2>`, `<h3>`처럼 계층을 갖는다는 구상이다. 하지만 이 기능은 **어떤 브라우저도 구현하지 않았다.**

- 브라우저는 중첩된 `<h1>`을 기본 스타일로 작게 그렸을 뿐, 접근성 트리에서는 여전히 1단계 제목으로 알렸다. 스크린 리더 JAWS도 지원을 시도했다가 접었다.
- 아웃라인 알고리즘은 2022년 HTML 명세에서 삭제됐다. 중첩된 `<h1>`을 작게 그리던 기본 스타일도 2025년 Firefox 140을 시작으로 주요 브라우저가 걷어 내, 지금은 어디에 있든 `<h1>`은 같은 크기로 그려진다.
- 제목 수준은 `<h1>`~`<h6>`로 직접 표시한다.

스크린 리더 사용자는 제목 구조에 크게 기댄다. WebAIM의 8차 스크린 리더 사용자 조사에서 응답자 86.1%가 제목 구조를 아는 것이 유용하다고 답했다.

```html
<!-- 나쁨: section 중첩을 믿고 모두 h1 -->
<section><h1>상품</h1><section><h1>상세</h1></section></section>

<!-- 좋음: 계층을 직접 표시 -->
<main>
  <h1>상품</h1>
  <section aria-labelledby="detail"><h2 id="detail">상세</h2></section>
</main>
```

**규칙**: 페이지의 주제목 `<h1>`은 하나, 그 아래로 `<h2>`, `<h3>`을 건너뛰지 않고 내려간다.

## `<article>`과 `<section>` 고르기

| | `<article>` | `<section>` |
| --- | --- | --- |
| 뜻 | 독립적으로 완결된 내용 | 제목으로 묶인 일반 구역 |
| 판단 기준 | 다른 페이지나 피드로 **떼어 가도 말이 되는가** | 문서 안의 한 장(chapter)인가 |
| 예 | 블로그 글, 뉴스 기사, 댓글, 상품 카드, 위젯 | 글 안의 「소개」, 「사용법」 같은 장 |
| 효과 | 애플 watchOS 읽기 모드가 본문으로 인식한다. 안의 `<header>`에 작성자·날짜를 두면 함께 표시된다 | 이름이 없으면 스크린 리더가 존재를 알리지 않는다 |

정리하면, 아웃라인 알고리즘이 없으니 `<section>`은 대부분 `<div>`와 다를 바 없다. 독립적인 내용이면 `<article>`을 쓴다. 스크린 리더 사용자가 **구역의 시작과 끝을 알아야 할 때만** 이름을 붙인 `<section>`을 쓴다.

```html
<section aria-label="간단 요약">…</section>   <!-- 들어가고 나올 때 안내되고, 건너뛸 수 있다 -->
<aside aria-label="간단 요약">…</aside>        <!-- 성격이 보조 정보라면 -->
<div role="region" aria-label="간단 요약">…</div> <!-- 차선. 네이티브 태그가 ARIA보다 낫다 -->
```

## 요소 이름은 어디서 왔나

`<nav>`, `<header>`, `<footer>`, `<article>` 같은 HTML5 요소 이름은 새로 지어낸 말이 아니다. Google·Opera 등이 실제 웹 페이지를 조사해 **개발자가 class·id로 가장 많이 쓰던 이름**을 골라 요소로 만들었다.

**요소의 의미는 이름이 아니라 명세의 정의가 정한다.** `<article>`의 정의는 「독립적으로 완결된 구성물」이다. 그래서 글뿐 아니라 댓글도 `<article>`이고, 댓글은 글 `<article>` 안에 중첩한 `<article>`로 표시한다. 별도의 `<comment>` 요소가 없는 이유다. 잡지 기사가 아니라 「옷 한 벌(article of clothing)」처럼 따로 떼어 놓아도 완결된 단위로 생각하면 된다.

새 요소가 명세에 들어가려면 세 가지를 보여야 한다.

1. 실제 사용 사례
2. 지금 개발자들이 그 빈자리를 어떻게 우회하고 있는지
3. 기존 요소로는 안 되는 이유

의미가 기존 요소와 조금만 다른 요소를 계속 더하면 브라우저도 작성자도 따라가기 어려워진다. 표준 요소로 담기지 않는 의미(상품, 리뷰, 이벤트)는 새 태그가 아니라 마이크로데이터·JSON-LD 같은 구조화 데이터로 덧붙인다([[structured-content|구조화된 콘텐츠]]).

어느 요소가 맞는지 오래 고민하게 된다면 `<div>`로 두고 나중에 고쳐도 된다. 마크업은 쉽게 바꿀 수 있다. 과거 IE 8 이하는 모르는 요소에 스타일을 적용하지 않아 html5shiv 스크립트가 필요했지만, 지금은 모든 브라우저가 HTML5 요소를 안다.

## 자주 하는 실수

| 실수 | 바꾸기 |
| --- | --- |
| 클릭되는 `<div onclick>` | `<button>`. 키보드 포커스와 Enter·Space가 저절로 된다 |
| 페이지 이동인데 `<button>` | `<a href>`. 새 탭 열기와 주소 복사가 된다 |
| 글자 크기 때문에 `<h3>` 선택 | 의미대로 고르고 크기는 CSS로 |
| 모든 구역을 `<section>`으로 | 이름 없는 구역이면 `<div>`로 충분하다 |
| `<b>`, `<i>`로 강조 | 의미상 중요하면 `<strong>`, 강세면 `<em>` |

## 정리

- 시맨틱 HTML은 접근성, 검색, 유지보수를 한 번에 챙기는 가장 싼 방법이다.
- 요소는 암묵적 역할을 가진다. `role`은 의미만 바꾸고 동작은 더하지 않으니 맞는 요소를 먼저 쓴다.
- `<header>`·`<footer>`는 최상위일 때만 랜드마크, `<section>`은 이름이 있을 때만 영역이다.
- 제목 계층은 브라우저가 대신 만들어 주지 않는다. `<h1>` 하나에서 차례로 내려간다.
- 떼어 가도 완결되면 `<article>`, 구역을 알려야 할 때만 이름 붙인 `<section>`이다.

관련 노트: [[html|HTML 기초와 HTML5]], [[html-text-elements|텍스트 의미 요소와 문자 참조]], [[accessible-page-structure|접근 가능한 페이지 구조]], [[aria-basics|ARIA와 접근 가능한 이름]], [[a11y-driven-testing|접근성 기반 UI 테스트 자동화]], [[seo-basics|SEO 기초]], [[Accessibility|웹 접근성]], [[structured-content|구조화된 콘텐츠와 기계가 읽는 웹]]
