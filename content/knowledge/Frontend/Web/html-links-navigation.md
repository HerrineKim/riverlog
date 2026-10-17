---
title: "링크와 내비게이션 마크업"
concept: "Links & Navigation"
summary: "<a href>가 가리킬 수 있는 곳(절대·상대 URL, 프래그먼트, mailto·tel, blob·data), 이름 붙은 브라우징 맥락으로 탭 폭증 막기, rel·hreflang·type·ping, 그리고 링크 목록을 <nav>로 묶는 건너뛰기 링크·목차·브레드크럼·로컬·전역 내비게이션 패턴을 정리한다."
tags: ["html", "navigation", "frontend", "web", "accessibility"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/html/links", "https://web.dev/learn/html/navigation"]
---

> web.dev의 「[Learn HTML](https://web.dev/learn/html)」 강좌 중 「Links」와 「Navigation」 모듈을 바탕으로 재구성한 노트다.

## 링크란

링크는 **현재 문서와 다른 자원 사이의 연결**이다. `<a>`, `<area>`, `<form>`, `<link>`가 링크를 만든다. 이 노트는 사용자가 따라가는 `<a>`와 그 묶음인 내비게이션을 다룬다. `<link>`는 [[html-head-metadata|문서 head와 메타데이터]], 링크 텍스트를 접근 가능하게 쓰는 법은 [[accessible-images-links-text|대체 텍스트, 링크, 쉬운 글]]에 있다.

`<a>`는 `href`가 있어야 링크가 된다. `href`가 없으면 포커스도 받지 않는 자리 표시자일 뿐이다.

## href가 가리킬 수 있는 곳

```html
<a href="https://example.com">절대 URL</a>
<a href="../attributes/">상대 URL</a>
<a href="#teachers">같은 페이지의 id="teachers"</a>
<a href="https://example.com#teachers">다른 페이지의 특정 위치</a>
<a href="mailto:hal@example.com?subject=%EB%AC%B8%EC%9D%98">메일 보내기</a>
<a href="tel:+82212345678">전화 걸기</a>
```

| 형식 | 동작 |
| --- | --- |
| 절대 URL | 프로토콜과 도메인을 포함한다. `//example.com`은 지금 페이지의 프로토콜을 따른다 |
| 상대 URL | 현재 파일 위치 기준(`<base>`가 있으면 그 기준) |
| `#id` | 같은 문서에서 그 `id`의 요소로 스크롤한다. **프래그먼트는 서버로 보내지 않는다** |
| `#top`, `#` | `id="top"`인 요소가 없으면 페이지 맨 위로 간다 |
| `mailto:` | 메일 앱을 연다. `?` 뒤에 `cc`·`bcc`·`subject`·`body`를 `&`로 잇고 퍼센트 인코딩한다. 주소 없이 제목·본문만 채워 친구에게 보내게 할 수도 있다 |
| `tel:` | 기기·OS·설치된 앱에 따라 전화, FaceTime, 연락처 등이 열린다 |
| `blob:`, `data:` | 페이지가 만든 파일을 `download`와 함께 내려받게 한다(→ [[html-lesser-known-attributes\|잘 안 쓰지만 쓸모 있는 HTML 속성]]의 「링크와 내려받기」) |

다른 앱을 여는 링크는 텍스트로 미리 알린다(「메일 보내기」, 「PDF, 2MB」). CSS의 `[href^="mailto:"]`, `[href$=".pdf"]` 같은 속성 선택자로 아이콘을 붙여도 좋다.

## 어디에 여나: target과 브라우징 맥락

`target`의 `_self`·`_blank`·`_parent`·`_top`과 `rel="noopener noreferrer"`는 [[html|HTML 기초와 HTML5]]의 「링크의 target과 rel」에 있다. 여기서는 **이름 붙은 맥락**만 더한다.

`target`에는 밑줄로 시작하지 않는 아무 이름이나 줄 수 있다. 모든 탭(브라우징 맥락)은 이름을 가지며 기본값은 빈 문자열이다.

| 마크업 | 15번 클릭하면 |
| --- | --- |
| `<a href="/register" target="_blank">` | 이름 없는 새 탭이 15개 열린다 |
| `<a href="/register" target="reg">` | 첫 클릭에 `reg`라는 탭이 열리고, 이후엔 **그 탭에서 다시 연다** |

사용자는 가운데 클릭이나 「새 탭에서 열기」로 언제든 새 탭을 고를 수 있다. `_blank`로 강제하는 일은 그 선택을 대신하는 것이니 꼭 필요한 링크에만 쓴다(→ [[respect-browser-defaults|브라우저 기본 동작을 존중하기]]).

## rel과 함께 쓰는 속성

| 속성·값 | 뜻 |
| --- | --- |
| `rel="nofollow"` | 검색 로봇에게 이 링크를 따라가지 말라고 요청한다 |
| `rel="external"` | 다른 사이트로 가는 링크 |
| `rel="help"` | 문맥 도움말. 커서 모양 때문에 쓰지 않는다(→ CSS `cursor`) |
| `rel="prev"`, `rel="next"` | 연재물의 이전·다음 문서 |
| `rel="alternate"` + `hreflang` | 다른 언어 버전. 링크 텍스트가 다른 언어면 `lang`도 단다 |
| `type` | 목적지의 MIME 타입(`application/pdf`). 참고용일 뿐이지만 형식을 알리는 것은 좋다 |
| `ping` | 클릭하면 나열한 HTTPS URL로 `POST` 요청(본문 `PING`)을 보낸다. 링크 클릭 추적용 |

```html
<a href="/fr" hreflang="fr-FR" rel="alternate" lang="fr-FR">atelier d'apprentissage</a>
```

## 링크를 쓸 때 지킬 것

| 원칙 | 이유 |
| --- | --- |
| 링크 텍스트가 목적지를 말한다. 「여기를 클릭」 금지 | `<a>`의 내용이 **접근 가능한 이름**이다. 이미지 링크면 `alt`가 이름이다 |
| 본문 속 링크는 색 **말고도** 밑줄 같은 표시를 준다 | 색만으로는 구분 못 하는 사용자가 있다 |
| 포커스 스타일을 지우지 않는다 | 키보드 사용자가 위치를 잃는다(→ [[keyboard-accessibility\|키보드 접근성과 포커스 관리]]) |
| 링크 안에 `<button>`·`<input>`을, `<button>`·`<label>` 안에 링크를 넣지 않는다 | 클릭 가능한 것 안의 클릭 가능한 것은 브라우저마다 동작이 다르고 혼란스럽다 |
| 페이지 이동은 `<a>`, 동작은 `<button>` | `<a href>`는 Enter로 실행되고 새 탭 열기·주소 복사가 된다. `<button>`은 Space로도 실행된다 |

JavaScript에서는 `document.links`가 `href`가 있는 모든 `<a>`·`<area>`를 담은 `HTMLCollection`이고, `HTMLAnchorElement`의 `href`, `protocol`, `hash` 같은 속성으로 URL 부분을 읽고 고칠 수 있다. SVG 안에서도 `<a href>`로 링크를 만든다.

## 내비게이션: 링크를 묶는 법

여러 링크의 묶음이 내비게이션이다. 어떤 모양이어야 한다는 규칙은 없지만 **가장 적은 클릭으로 어디든 갈 수 있고, 직관적이며, 부담스럽지 않아야** 한다.

| 종류 | 무엇 | 범위 |
| --- | --- | --- |
| 전역(global) | 사이트 최상위 페이지로 가는 링크. **모든 페이지에서 같다** | 사이트 |
| 로컬(local) | 섹션 안의 하위 페이지 링크(사이드바) | 섹션 |
| 목차(table of contents) | 현재 페이지의 소제목으로 가는 링크 | 페이지 |
| 브레드크럼(breadcrumb) | 사이트 구조에서 현재 페이지의 위치 | 페이지 |
| 사이트맵 | 모든 페이지의 계층 목록 | 사이트 |

### 공통 마크업

```html
<nav aria-labelledby="toc-title">
  <h2 id="toc-title">이 페이지의 내용</h2>
  <ul role="list">
    <li><a href="#skip">건너뛰기 링크</a></li>
    <li><a href="#breadcrumb">브레드크럼</a></li>
  </ul>
</nav>
```

| 규칙 | 이유 |
| --- | --- |
| 묶음은 `<nav>` | `navigation` 랜드마크가 되어 스크린 리더가 바로 가거나 건너뛴다 |
| 링크는 목록(`<ul>`·`<ol>`)에 넣는다 | 스크린 리더가 링크 개수를 알려 준다 |
| `<nav>`가 둘 이상이면 이름을 붙인다 | 보이는 제목이 있으면 `aria-labelledby`, 없으면 `aria-label`. 보이는 글은 자동 번역되지만 속성 값은 안 될 수 있다 |
| 이름에 「내비게이션」을 넣지 않는다 | 스크린 리더가 역할을 이미 말한다. 「주 메뉴 내비게이션 내비게이션」이 된다 |
| 현재 페이지 링크에 `aria-current="page"` | 보조 기술이 현재 위치를 알린다. 시각적 구분은 CSS로 따로 준다 |
| 화면 크기에 따라 같은 메뉴를 두 벌 만들지 않는다 | 하나를 CSS로 옮긴다. 레이아웃은 바뀌어도 **탭 순서는 바뀌면 안 된다** |

`list-style: none`이나 `display: grid`를 준 목록은 사파리 VoiceOver가 목록 의미를 빼는 경우가 있어 `role="list"`를 덧붙이곤 한다. 목록이라는 사실이 사용자에게 쓸모 있을 때만 붙인다.

### 건너뛰기 링크

```html
<a href="#main" class="skip-link">본문으로 건너뛰기</a>
…
<main id="main">
```

포커스 순서의 **맨 앞**에 두어 키보드 사용자가 매 페이지 반복되는 머리말·메뉴를 건너뛰게 한다. 평소엔 숨겨도 되지만 **포커스를 받으면 반드시 보여야** 한다(`.visually-hidden:not(:focus):not(:active)`). 자세한 구현은 [[accessible-page-structure|접근 가능한 페이지 구조]]의 「건너뛰기 링크」에 있다.

### 브레드크럼

```html
<nav aria-label="Breadcrumb">
  <ol role="list">
    <li><a href="/">홈</a></li>
    <li><a href="/learn">Learn</a></li>
    <li><a href="/learn/html">HTML</a></li>
    <li aria-current="page">내비게이션</li>
  </ol>
</nav>
```

- 순서가 의미이므로 `<ol>`을 쓴다.
- 첫 항목은 사이트 이름이나 로고보다 「홈」이 낫다.
- 현재 페이지는 넣지 않아도 되고, 넣으면 링크로 만들지 않고 `aria-current="page"`를 단다.
- 사이 구분자(›, /)는 CSS `li + li::before`로 그려 스크린 리더가 읽지 않게 한다. 대비는 다른 글자와 같이 지킨다.
- 브레드크럼은 **사이트 구조**를 보여 준다. 서버의 파일 구조와 같을 필요도, 사용자가 실제로 지나온 경로와 같을 필요도 없다. 지나온 경로를 보여 주려면 `<nav>`에 담되 「브레드크럼」이라 부르지 않는다.

### 전역 내비게이션과 푸터

전역 내비게이션은 탭, 드롭다운, 플라이아웃, 검색창 등 모양이 어떻든 **모든 페이지에 똑같이** 있어야 한다. 현재 섹션 표시는 색 대비가 충분해야 한다. 사이트 푸터도 모든 페이지에서 같지만 요구 사항은 없고, 보통 회사 정보·약관·채용·SNS 링크를 둔다.

## 정리

- `href`는 URL, 프래그먼트, `mailto:`·`tel:`, `blob:`·`data:`까지 가리킨다. 프래그먼트는 서버에 가지 않는다.
- `target="_blank"`를 반복하면 탭이 쌓인다. 이름 붙은 `target`은 같은 탭을 재사용한다.
- 링크 텍스트는 목적지를 말하고, 링크 안에 다른 인터랙티브 요소를 넣지 않는다.
- 링크 묶음은 `<nav>` + 목록, 둘 이상이면 이름을 주고, 현재 위치는 `aria-current="page"`.
- 건너뛰기 링크는 맨 앞에, 포커스되면 보이게. 브레드크럼은 `<ol>`과 CSS 구분자.

관련 노트: [[html|HTML 기초와 HTML5]], [[accessible-images-links-text|대체 텍스트, 링크, 쉬운 글]], [[accessible-page-structure|접근 가능한 페이지 구조]], [[semantic-html|시맨틱 HTML과 문서 구조]], [[html-lists-tables|목록과 표 마크업]], [[respect-browser-defaults|브라우저 기본 동작을 존중하기]]
