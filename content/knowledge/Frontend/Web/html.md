---
title: "HTML 기초와 HTML5"
concept: "HTML"
summary: "웹 문서의 구조와 의미를 태그로 표현하는 마크업 언어와 그 핵심 문법. 요소와 태그, 대체·빈 요소, 생략 가능한 태그, 불리언·열거형·전역 속성, data-* 속성, 속성 하나로 끝나는 기능(enterkeyhint·form·download·loading·fetchpriority·integrity·popover 등), DOCTYPE, form 데이터 규칙, HTML5까지 다룬다."
tags: ["html", "web", "semantic", "frontend", "form"]
source: mixed
date: "2026-10-21"
sources: ["https://riverkim.kr/280", "https://riverkim.kr/282", "https://www.frontendinterviewhandbook.com/kr/html-questions", "https://web.dev/learn/html/overview", "https://web.dev/learn/html/attributes", "https://web.dev/learn/html/forms", "https://www.smashingmagazine.com/2022/03/html-attributes-you-never-use/", "https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/html/data.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/HTML/XML%EA%B3%BC%20XHTML.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/HTML/XHTML%EC%9D%98%20%ED%95%9C%EA%B3%84%EC%A0%90.md", "http://diveintohtml5.info/past.html"]
---

> 「DOCTYPE과 렌더링 모드」와 「HTML5와 웹 플랫폼」 부분은 Front End Interview Handbook의 「[HTML 질문](https://www.frontendinterviewhandbook.com/kr/html-questions)」을 HTML Living Standard·MDN으로 확인해 보강한 노트다. 「요소의 종류」와 「속성 문법」은 web.dev의 「[Learn HTML](https://web.dev/learn/html)」 강좌 중 「Overview of HTML」·「Attributes」 모듈을 바탕으로 보강했다. 「data-* 속성」은 같은 Front End Interview Handbook으로, 「속성 하나로 끝나는 기능」은 Louis Lazaris의 「[Those HTML Attributes You Never Use](https://www.smashingmagazine.com/2022/03/html-attributes-you-never-use/)」(Smashing Magazine, 2022.03)를 바탕으로 브라우저 지원을 2026년 기준으로 고쳐 보강했다.
> 「XML·XHTML에서 HTML5로」는 「[Frontend_TIL: XML과 XHTML](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/HTML/XML%EA%B3%BC%20XHTML.md)」·「[XHTML의 한계점](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/HTML/XHTML%EC%9D%98%20%ED%95%9C%EA%B3%84%EC%A0%90.md)」을 W3C·WHATWG 기록으로 확인해 보강했다. 「HTML이 자라 온 방식」과 MIME 타입 문단은 Dive Into HTML5의 「[A Quite Biased History of HTML5](http://diveintohtml5.info/past.html)」를 바탕으로 보강했다.
> 「data-* 속성」의 용도 범위는 「[Must-Know-About-Frontend: data- 속성](https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/html/data.md)」을 바탕으로 보강했다.

HTML(HyperText Markup Language)은 웹 페이지의 **구조**를 정의하는 마크업 언어다. 마크업 언어란 태그 등을 이용해 문서나 데이터의 구조를 명시하는 언어로, HTML과 Markdown이 대표적이다. 스타일은 CSS가, 동작은 JavaScript가 맡고 HTML은 "무엇이 어떤 의미의 내용인가"를 표현한다.

## 기본 구조

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
  </head>
  <body>
    <!-- 실제 화면에 보이는 내용 -->
  </body>
</html>
```

| 요소 | 역할 |
| --- | --- |
| `<html>` | 문서의 최상위(root) 요소 |
| `<head>` | 문서 메타데이터(제목, 인코딩, 스타일, 외부 파일 로딩 등). 보통 화면에 나타나지 않는다 |
| `<body>` | 문서 본문. 실제 화면 구성과 관련된 내용 |

`<head>`에 넣는 인코딩·뷰포트·`<link rel>`·meta·Open Graph·`<base>`는 [[html-head-metadata|문서 head와 메타데이터]]에 정리했다.

## DOCTYPE과 렌더링 모드

`<!DOCTYPE html>`은 문서 맨 앞에 두는 **문서 유형 선언**이다. 대소문자는 가리지 않는다. 예전 HTML 4·XHTML의 DOCTYPE은 문서가 따르는 DTD(Document Type Definition, 어떤 요소 안에 무엇이 올 수 있는지 정한 문법 정의)를 가리켰다. 지금 HTML은 SGML 기반이 아니라 DTD가 없고, DOCTYPE이 하는 일은 **브라우저의 렌더링 모드를 고르는 것** 하나다.

| 모드 | 언제 | 동작 |
| --- | --- | --- |
| 표준(no-quirks) | `<!DOCTYPE html>` | 현대 HTML·CSS 명세대로 그린다 |
| 제한된 쿼크(limited-quirks) | 일부 옛 Transitional DOCTYPE | 표 셀 안 이미지의 줄 높이 같은 극소수 차이만 남는다 |
| 쿼크(quirks) | DOCTYPE이 없거나 아주 옛 형식 | 1990년대 말 브라우저의 박스 모델·높이 계산 버그를 흉내 낸다 |

`document.compatMode`가 `"CSS1Compat"`이면 표준(또는 제한된 쿼크), `"BackCompat"`이면 쿼크 모드다. DOCTYPE 앞에 주석이나 공백 외의 내용이 오면 쿼크 모드로 떨어질 수 있으니 반드시 첫 줄에 둔다. `application/xhtml+xml`로 보내는 XHTML은 DOCTYPE 없이도 늘 표준 모드다.

## 요소와 속성

**요소(element)** 는 여는 태그 + 내용 + 닫는 태그(`<h1>안녕하세요</h1>`)이고 서로 중첩된다. **태그(tag)** 는 꺾쇠괄호를 포함한 `<h1>` 자체를 말한다. 둘을 섞어 부르지만, 요소는 그 안의 내용과 중첩 요소까지 포함한다. 브라우저는 태그를 보여 주지 않고 내용을 해석하는 데만 쓴다. **속성(attribute)** 은 시작 태그에 `이름="값"` 쌍으로 적는 부가 정보(`<a href="https://google.com">`)이며, 태그마다 쓸 수 있는 속성이 다르다.

### 요소의 종류

| 구분 | 뜻 | 예 |
| --- | --- | --- |
| 비대체 요소(non-replaced) | 태그가 감싼 글과 요소를 그대로 그린다 | `<p>`, `<h1>`, `<ul>`, `<a>` |
| 대체 요소(replaced) | 내용이 바깥 객체(이미지, 폼 위젯)로 **바뀌어** 그려진다. 기본 모양이 있고 CSS로 꾸밀 수 있는 범위가 좁다 | `<img>`, `<input>`, `<video>`, `<iframe>` |
| 빈 요소(void) | 내용을 가질 수 없어 **닫는 태그가 없다** | `<br>`, `<hr>`, `<img>`, `<input>`, `<link>`, `<meta>`, `<source>`, `<track>`, `<wbr>`, `<col>`, `<embed>` |

대체 요소와 빈 요소는 다른 개념이다. `<video>`, `<picture>`, `<iframe>`은 대체 요소지만 대체 콘텐츠를 담으므로 닫는 태그가 있다. `<link>`, `<meta>`, `<base>`는 빈 요소지만 아무것도 그리지 않고 속성으로 정보만 준다. 빈 요소 끝의 `/`(`<img />`)는 XML(XHTML·SVG)의 습관이다. HTML 파서는 무시하고 검사기는 경고를 낸다. 일관되게 쓰기만 하면 된다. 다만 따옴표 없는 속성 값 바로 뒤에 붙이면 `/`가 값에 들어간다.

### 브라우저는 관대하다, 그래도 닫는다

HTML 파서는 틀린 마크업에도 실패하지 않는다. 생략한 `</li>`, `</p>`는 다음 태그에서 닫힌 것으로 보고, `<body>`나 표의 `<tbody>`는 쓰지 않아도 만들어 넣는다. 명세는 요소마다 태그를 생략할 수 있는지 정해 두었다. 하지만 **모든 요소를 닫고 순서대로 중첩한다.** 닫지 않은 `</ul>` 뒤의 `<h1>`은 목록의 일부로 해석되어 스타일까지 물려받고, `<script>`, `<style>`, `<template>`, `<textarea>`, `<title>`을 닫지 않으면 뒤의 내용 전체가 그 안으로 빨려 들어가 페이지가 망가진다. 어떤 태그가 생략 가능한지 외우는 것보다 전부 닫는 편이 쉽다.

### 속성 문법

- 속성은 **여는 태그에만** 쓴다. 요소 이름 뒤에 공백으로 구분한다.
- 값에 공백이나 특수 문자가 있으면 따옴표가 필수다. 그러니 늘 따옴표를 쓴다.
- HTML 요소·속성 이름은 대소문자를 가리지 않는다. 명세가 정한 키워드 값(`type="TeXt"`)도 가리지 않는다. 하지만 **`id`·`class`처럼 작성자가 정한 문자열은 가린다.** HTML에서 대소문자를 가리는 값은 CSS 속성 선택자와 JavaScript에서도 가린다.
- 요소·속성 이름은 소문자로, 값은 따옴표로 감싸는 습관이 흔히 말하는 「XHTML 스타일」이다.

| 속성 유형 | 규칙 | 예 |
| --- | --- | --- |
| 불리언(boolean) | **있으면 참, 없으면 거짓.** 값은 생략하거나 빈 문자열이나 속성 이름. `"false"`를 써도 참이다 | `required`, `disabled`, `checked`, `inert`, `muted`, `autoplay`, `open` |
| 열거형(enumerated) | 정해진 값 중 하나. **빠졌을 때와 잘못된 값일 때의 기본값이 속성마다 다르다** | `contenteditable`(없거나 틀리면 `inherit`, `"contenteditable"`도 틀린 값), `<input type>`(없거나 틀리면 `text`) |
| 일반 | 문자열·숫자·URL 등 | `href`, `src`, `alt` |

불리언 속성은 값을 바꾸지 말고 **속성 자체를 넣고 뺀다**(`el.toggleAttribute('muted')`, `removeAttribute('disabled')`). 열거형과 헷갈리지 않으려면 값이 필요 없는 속성은 값을 비워 쓰고, 나머지는 명세를 찾아본다.

### 전역 속성(Global Attribute)

모든 요소에 쓸 수 있는 속성이다. 30개가 넘고, `<meta hidden>`처럼 붙여도 효과가 없는 조합도 있다.

| 속성 | 설명 |
| --- | --- |
| `id` | 문서 전체에서 유일한 식별자. 링크 프래그먼트(`#id`)의 목적지, `getElementById()`, `<label for>`, `aria-labelledby`·`aria-describedby`의 참조 대상이다. 중복되면 화면은 멀쩡해도 링크·스크립트·레이블이 틀어진다. 공백 없이 글자로 시작하고 ASCII 글자·숫자·`_`·`-`만 쓰는 규칙을 정해 지킨다 |
| `class` | 공백으로 구분된 클래스 목록. CSS·JS에서 요소를 선택하는 것 말고는 HTML에서 하는 일이 없다. 시맨틱 구조만으로도 `header nav a` 같은 선택자가 충분할 때가 많다 |
| `data-*` | 요소에 사용자 정의 데이터를 붙인다(아래 「data-* 속성」) |
| `lang`, `dir` | 내용의 언어와 글 방향([[multilingual-pages\|다국어 페이지]]) |
| `style` | 인라인 스타일. 그 요소에만 적용되고 `@keyframes` 같은 규칙은 못 쓴다. 개발 중 실험용으로만 쓰고 파일로 옮긴다 |
| `title` | 요소에 대한 추가 정보(툴팁). 키보드·터치 사용자는 보기 어렵다 |
| `tabindex`, `contenteditable`, `inert`, `autofocus`, `hidden` | 포커스·편집·비활성·숨김([[html-interactive-elements\|포커스 속성과 details·dialog]]) |
| `role`, `aria-*` | HTML 명세가 아니라 ARIA 명세의 속성. 의미만 바꾸고 동작은 더하지 않는다([[aria-basics\|ARIA와 접근 가능한 이름]]) |
| `slot`, `part` | 웹 컴포넌트의 슬롯 지정과 섀도 트리 꾸미기([[web-components\|웹 컴포넌트]]) |

`getElementsByClassName()`은 DOM이 바뀌면 함께 바뀌는 살아 있는 `HTMLCollection`을, `querySelectorAll()`은 호출 시점의 정적 `NodeList`를 돌려준다.

### data-* 속성

`data-`로 시작하는 속성은 **표준에 알맞은 속성이 없는 데이터를 요소에 붙이는** 공식 통로다. 표준에 없는 속성을 아무렇게나 만들지 않고 `data-`를 붙이는 이유는 앞으로 생길 표준 속성과 겹치지 않기 때문이다. 이름은 `data-` 뒤에 한 글자 이상, 대문자 없이 쓴다. 값은 늘 문자열이다.

```html
<li data-review-id="42" data-state="open">…</li>
```

```js
el.dataset.reviewId   // "42": data-review-id가 카멜케이스로 바뀐다
el.dataset.state = 'closed'
```

```css
li[data-state="open"] { font-weight: bold; }
li::after { content: attr(data-state); }
```

| 쓰기 좋은 곳 | 피할 곳 |
| --- | --- |
| 서버가 렌더링한 HTML에서 JS로 ID·설정값 넘기기, 이벤트 위임에서 대상 구분([[ajax\|AJAX]]의 리뷰 ID 예) | 앱 상태의 원본 저장소. 상태는 JS(프레임워크 상태)에 두고 DOM은 그 결과로 그린다 |
| CSS 선택자로 상태 표현(`[data-state]`), 테스트 훅(`data-testid`) | 비밀값·권한 정보. 개발자 도구로 누구나 보고 고칠 수 있다 |
| 분석 이벤트 이름 같은 부가 정보 | 이미 표준 속성이 있는 의미(`hidden`, `disabled`, `aria-*`, `value`) |

`data-*`는 **그 사이트 자신의 스크립트·스타일을 위한 비공개 값**이다. 명세는 사이트와 무관한 외부 소프트웨어(검색 엔진, 다른 사이트의 크롤러·확장)가 이 값을 읽어 쓰는 것을 의도하지 않는다. 음악 목록에 `data-length="2m11s"`를 붙여 자체 정렬 스크립트가 쓰는 것은 맞는 용도이고, 외부에 기계가 읽을 정보를 알리려면 Microdata·JSON-LD 같은 구조화 데이터를 쓴다([[seo-basics|SEO 기초]]).

JavaScript 프레임워크 이전에는 DOM에 데이터를 두는 주된 방법이었고, 지금은 HTML과 JS·CSS 사이에 값을 넘기는 가벼운 통로로 쓴다. CSS `attr()`은 `content`에서는 모든 브라우저가 지원하고, 다른 속성 값에 타입을 지정해 쓰는 확장 문법은 아직 실험적이다.

### 속성 하나로 끝나는 기능

꽤 많은 기능이 속성 하나로 끝난다. JavaScript로 다시 만들기 전에 HTML에 이미 있는지부터 확인한다. HTML 속성은 브라우저가 이미 구현해 둔 기능의 스위치다.

| 속성 | 붙는 곳 | 하는 일 | 자세히 |
| --- | --- | --- | --- |
| `enterkeyhint` | 입력 요소, `contenteditable` | 가상 키보드 엔터 키의 문구(`next`, `done`, `search`, `send` 등) | [[html-input-types\|HTML 입력 요소 치트시트]] |
| `form` | 입력·버튼 | 부모가 아닌 `<form>`(그 `id`)에 연결해 함께 제출 | [[form-submission\|폼 제출과 데이터 전송]] |
| `label`, `disabled` | `<optgroup>` | 옵션 묶음 제목, 묶음 전체 비활성화 | [[html-input-types\|HTML 입력 요소 치트시트]] |
| `reversed`, `start`, `type`, `value` | `<ol>`, `<li>` | 번호 방향·시작값·형식·개별 번호 | [[html-lists-tables\|목록과 표 마크업]] |
| `download` | `<a>` | 이동 대신 내려받기, 파일 이름 제안 | [[html-links-navigation\|링크와 내비게이션 마크업]] |
| `loading` | `<img>`, `<iframe>` | 화면 밖 자원 지연 로딩. 첫 화면 큰 이미지에는 쓰지 않는다 | [[lazy-loading\|지연 로딩]] |
| `fetchpriority` | `<img>`, `<link>`, `<script>` | 다운로드 우선순위 힌트. 히어로 이미지는 `high`, 캐러셀 뒤쪽은 `low` | [[resource-hints\|리소스 힌트]] |
| `decoding` | `<img>` | 디코딩을 기다렸다 그릴지(`sync`), 나중에 붙일지(`async`) 힌트 | [[responsive-images\|반응형 이미지]] |
| `cite`, `datetime` | `<blockquote>`, `<q>`, `<del>`, `<ins>`, `<time>` | 출처 URL, 변경·날짜 일시를 기계용으로 남긴다 | [[html-text-elements\|텍스트 의미 요소]] |
| `rel="alternate stylesheet"` + `title` | `<link>` | 사용자가 고르는 대체 스타일시트(Firefox만 메뉴 제공) | [[html-head-metadata\|문서 head와 메타데이터]] |
| `crossorigin` | `<img>`·`<script>`·`<link>` 등 | CORS 모드로 요청한다 | |
| `integrity` | `<script>`, `<link>` | CDN에서 받은 파일이 변조되지 않았는지 해시로 확인한다(SRI) | |
| `multiple` | `type="email"`, `type="file"` | 쉼표로 여러 주소, 여러 파일 | |
| `disablepictureinpicture` | `<video>` | PIP 버튼을 숨긴다 | |
| `popover` | 모든 요소 | JavaScript 없이 팝오버를 열고 닫는다. 바깥 클릭·Esc 닫기가 기본이다 | [[popover-anchor-positioning\|팝오버와 앵커 위치 지정]] |

## 시맨틱 태그

의미 없는 `div`로만 영역을 나누는 대신, 영역의 **의미**를 드러내는 태그를 쓴다. `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`가 대표적이다. 개발자, 검색 엔진, 스크린 리더 모두에게 의미 있는 구조를 전달하고 SEO와 접근성의 기본이 된다. 태그별 의미, 제목 계층, `<article>`과 `<section>`을 고르는 법은 [[semantic-html|시맨틱 HTML과 문서 구조]]에 정리했다.

## 자주 쓰는 태그

### 텍스트와 그룹 요소

| 태그 | 종류 | 설명 |
| --- | --- | --- |
| `<a>` | 텍스트 | `href`로 다른 URL에 연결하는 하이퍼링크 |
| `<b>` / `<strong>` | 텍스트 | 굵은 글씨 / **중요한 내용**의 강조(의미론적 차이) |
| `<i>` / `<em>` | 텍스트 | 기울임 글씨 / 강세를 둔 강조 |
| `<br>` / `<img>` | 텍스트 | 줄 바꿈 / `src`로 이미지 표시 |
| `<p>` | 그룹 | 하나의 문단 |
| `<hr>` | 그룹 | 주제의 분리(수평선으로 표현) |
| `<ol>` / `<ul>` | 그룹 | 순서 있는 / 순서 없는 목록 |
| `<pre>` / `<blockquote>` | 그룹 | 공백까지 그대로 표현 / 긴 인용문 |
| `<span>` / `<div>` | 컨테이너 | 의미 없는 인라인 / 블록 컨테이너 |

인용·강조·코드·약어 요소를 어떤 의미로 고르는지는 [[html-text-elements|텍스트 의미 요소와 문자 참조]]에 있다.

### 표(table)

`<table>` 안을 `<thead>`, `<tbody>`, `<tfoot>`으로 나누고, 행은 `<tr>`, 제목 셀은 `<th>`, 데이터 셀은 `<td>`로 만든다. `<caption>`은 표 제목이다. 자식 순서, `scope`·`headers`, 셀 합치기, `<colgroup>`은 [[html-lists-tables|목록과 표 마크업]]에 정리했다.

```html
<table>
  <caption>방과 후 종목별 신청자 수</caption>
  <thead><tr><th>종목</th><th>축구</th><th>배드민턴</th></tr></thead>
  <tbody>
    <tr><td>1학년</td><td>15명</td><td>30명</td></tr>
    <tr><td>2학년</td><td>15명</td><td>11명</td></tr>
  </tbody>
  <tfoot><tr><td>합계</td><td>30명</td><td>41명</td></tr></tfoot>
</table>
```

## form

`<form>`은 사용자 입력 데이터를 서버로 제출하는 영역이다. 안에 든 입력 요소의 `name`과 `value`가 이름/값 쌍으로 전송된다.

| form 속성 | 설명 |
| --- | --- |
| `action` | 데이터를 처리할 서버 URL |
| `method` | 제출할 때 사용할 HTTP 메서드(`GET` 또는 `POST`) |
| `enctype` | POST일 때 데이터 형식. 기본값 `application/x-www-form-urlencoded`, 파일 전송 시 `multipart/form-data` |

제출되는 데이터에는 몇 가지 규칙이 있다.

- `name`이 없는 컨트롤, 선택되지 않은 체크박스·라디오, 제출에 쓰지 않은 버튼은 보내지 않는다. 값이 비어 있어도 `name`이 있으면 빈 값으로 간다.
- `value` 없는 `<option>`은 글자가 값이 되고, `value` 없는 체크박스는 `on`이 된다.
- 같은 `name`의 라디오끼리 하나만 선택된다. 버튼에 `name`을 주면 어느 버튼으로 제출했는지 알 수 있다.
- 버튼의 `formaction`·`formmethod`·`formnovalidate` 등은 `<form>`의 값보다 우선한다. `required`·`pattern`·`min` 같은 속성은 JavaScript 없이 제출 전 제약 검증을 한다.
- 비밀번호·카드 번호는 URL에 남는 `GET` 대신 `POST`로 보낸다. 클라이언트 검증은 서버 검증을 대신하지 않는다.

`<input>`의 type별 동작, `select`·`textarea`·`fieldset`·`datalist`, 모든 입력에 `<label for>`를 잇는 법은 [[html-input-types|HTML 입력 요소 치트시트]]에, 폼 사용성은 [[form-usability|더 나은 폼을 만드는 팁]]과 [[accessible-forms|접근 가능한 폼과 오류 처리]]에 있다.

## 링크의 target과 rel

`<a>`의 `target`(`_self`·`_blank`·`_parent`·`_top`), iframe 안 링크, `rel="noopener noreferrer"`, `download`와 내비게이션 마크업은 [[html-links-navigation|링크와 내비게이션 마크업]]에 있다.

## `&nbsp;`: 줄 바꿈 없는 공백

`&nbsp;`(non-breaking space)는 공백을 표시하면서 **그 자리에서는 줄이 바뀌지 않게** 하는 HTML 특수 문자다. 줄 바꿈은 앞이나 뒤의 일반 공백에서 일어난다. 극단적으로 문단의 모든 공백을 `&nbsp;`로 바꾸면 텍스트가 한 줄로 이어져 부모 영역 밖으로 뚫고 나간다.

| 쓸 때 | 쓰지 않을 때 |
| --- | --- |
| 함께 붙어 있어야 하는 단어 사이(`10&nbsp;km`) | 줄 바꿈에 영향을 주면 안 되는 일반 공백 |
| HTML이 무시하는 연속 공백·문장 앞 공백을 보여야 할 때 | 레이아웃 간격 조절(→ CSS `margin`, `gap`) |

JSX에서 줄을 나눠 쓴 요소 사이에 일반 공백이 필요하면 `{' '}`를 쓴다.

## HTML5와 웹 플랫폼

HTML5는 마크업 문법만이 아니라 **새 요소와 DOM API를 함께 묶은 웹 플랫폼**을 가리키는 이름이었다. 예전에는 플러그인이나 긴 JavaScript로 우회하던 기능이 정식 요소·API가 되었다. 문법 쪽 변화는 DOCTYPE 한 줄 간소화, 시맨틱 태그 추가, `<center>`·`<font>` 같은 표현용 태그 폐기(→ CSS)다. 플랫폼은 흔히 다음 영역으로 나눈다.

| 영역 | 대표 기술 (지금 기준) |
| --- | --- |
| 의미(Semantics) | `header`·`main`·`article` 등 시맨틱 태그, 새 폼 입력 타입 |
| 연결(Connectivity) | `fetch`, WebSocket, Server-Sent Events, WebRTC |
| 오프라인·저장소 | Web Storage, IndexedDB, 서비스 워커와 Cache API([[pwa-service-worker\|PWA]]) |
| 멀티미디어 | `<video>`, `<audio>`, Media Source Extensions |
| 그래픽·효과 | `<canvas>`, SVG, WebGL·WebGPU |
| 성능·통합 | Web Worker, `requestAnimationFrame`, WebAssembly |
| 장치 접근 | Geolocation, `getUserMedia`(카메라·마이크), 센서 |
| 스타일링 | CSS3 이후의 모듈들(전환·애니메이션·그리드·웹 폰트) |

지금은 「HTML5」라는 버전이 따로 없다. HTML 표준(HTML Living Standard)은 WHATWG가 계속 고쳐 가는 단일 문서이고, 2019년부터 W3C와 협력해 관리한다.

### XML·XHTML에서 HTML5로

| | XML | XHTML | HTML |
| --- | --- | --- | --- |
| 목적 | 데이터를 **설명·교환**하는 범용 마크업. 태그를 사용자가 정의한다 | HTML 요소를 XML 문법으로 쓴 것 | 문서를 **표시**하는 정해진 어휘 |
| 문법 | 모든 태그를 닫고, 소문자, 속성 값은 따옴표 | XML과 같다 | 관대하다. 생략 가능한 태그, 따옴표 없는 값도 허용 |
| 오류 처리 | 형식이 하나라도 틀리면 처리를 멈춘다(draconian) | `application/xhtml+xml`로 보내면 XML처럼 멈추고 오류 화면을 띄운다 | 명세에 정해진 복구 규칙으로 끝까지 그린다 |

W3C는 HTML 4.01(1999) 뒤 표준의 방향을 XHTML 1.0으로 돌렸고, 하위 호환을 버린 XHTML 2.0을 준비했다. 하지만 오류 하나에 페이지 전체가 멈추는 문법은 현실의 웹과 맞지 않았고, 대부분의 「XHTML」 페이지는 `text/html`로 보내져 실제로는 HTML 파서로 읽혔다. 2004년 브라우저 제조사들이 WHATWG를 세워 하위 호환과 웹 애플리케이션 기능을 앞세운 HTML5를 만들었고, W3C는 2009년 XHTML 2.0을 접었다. 지금 XML 문법은 HTML 명세 안의 한 표기법(XML 직렬화)으로 남아 있다. 모두 닫고 소문자로 쓰는 습관만 「XHTML 스타일」로 이어진다.

**어떤 파서가 읽는지는 DOCTYPE이 아니라 MIME 타입이 정한다.** XHTML 1.0 부록 C는 XHTML 문법으로 쓰되 `text/html`로 보내도 된다는 길을 열어 두었고, 대부분의 페이지가 이 길을 택했다. XHTML 1.1은 `application/xhtml+xml`만 허용해 이 길을 닫았고, 그래서 거의 쓰이지 않았다. 웹 페이지의 대다수가 마크업 오류를 하나 이상 품고 있다는 현실에서, 오류 하나에 화면이 멈추는 처리 방식은 받아들여질 수 없었다.

### HTML이 자라 온 방식

| 사건 | 개념 |
| --- | --- |
| 1993년 Mosaic이 `<img src>`를 먼저 구현했다. `<include>`, `<icon>`, `<a rel="embed">` 같은 대안 제안은 구현되지 않았다 | **구현해서 내보낸 쪽이 표준이 된다.** 다만 `<img>`는 공통 이미지 포맷도 대체 텍스트도 없이 출발해, `alt`는 나중에 덧붙었고 콘텐츠 스니핑 문제는 지금도 남아 있다 |
| HTML 2.0(1995)과 3.2(1997)는 이미 널리 쓰이던 기능(표, 이미지 둘레 글 흐름 등)을 문서로 정리했다. 앞서 나간 HTML+·HTML 3.0은 구현되지 않았다 | **역명세(retro-spec)**: 성공한 HTML 버전 대부분은 현실을 뒤따라 정리하면서 조금씩 방향을 이끈 문서다 |
| 2004년 W3C 워크숍에서 Mozilla와 Opera가 HTML 4를 진화시키자는 안을 냈다. 하위 호환, 명세로 정한 오류 복구, 실제 사용 사례로 정당화된 기능, 공개된 절차가 원칙이었다. 투표에서 11 대 8로 부결되자 같은 해 WHATWG가 출범했다 | 오류 처리까지 명세에 적어 두어야 브라우저들이 서로를 역공학하지 않는다. 지금 HTML 파싱 알고리즘이 오류 복구 규칙을 모두 정의하는 이유다 |

1990년에 만든 페이지도 지금 브라우저에서 열린다. HTML은 버전이 갈아엎힌 적 없이 하위 호환을 지키며 이어졌다.

## 핵심 정리

- HTML은 **구조와 의미**, CSS는 표현, JavaScript는 동작을 담당한다.
- 파서는 관대하지만 모든 요소를 닫고, 속성 값은 따옴표로 감싼다. 불리언 속성은 있으면 참이다.
- 영역을 나눌 때는 가능한 한 시맨틱 태그를 쓴다. SEO와 접근성의 기본이다.
- form 데이터는 input의 `name`/`value` 쌍으로 전송되고, `label` 연결로 사용성과 접근성을 챙긴다.

관련 노트: [[markdown|Markdown(또 하나의 마크업 언어)]], [[dom|DOM과 BOM]], [[html-head-metadata|문서 head와 메타데이터]], [[html-text-elements|텍스트 의미 요소와 문자 참조]], [[html-lists-tables|목록과 표 마크업]], [[html-links-navigation|링크와 내비게이션 마크업]], [[semantic-html|시맨틱 HTML과 문서 구조]], [[web-glossary|프론트엔드 웹 개발 용어집]], [[script-loading|스크립트·스타일 로딩 순서와 점진적 렌더링]], [[multilingual-pages|다국어 페이지]], [[form-submission|폼 제출과 데이터 전송]], [[constraint-validation|제약 검증: required·pattern·ValidityState]], [[windows-and-frames|창과 프레임: 팝업, iframe, postMessage]]
