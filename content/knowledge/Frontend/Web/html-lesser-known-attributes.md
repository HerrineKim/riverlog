---
title: "잘 안 쓰지만 쓸모 있는 HTML 속성"
concept: "HTML Attributes"
summary: "JavaScript 없이 HTML 속성만으로 해결되는 일들. 가상 키보드의 엔터 키 문구(enterkeyhint), 번호 목록 제어(reversed·start·type·value), 내려받기 링크(download), 폼 밖의 입력(form), 이미지·iframe 로딩 힌트(decoding·loading·fetchpriority), 인용·수정 이력(cite·datetime), 옵션 묶기(optgroup), 사용자 정의 데이터(data-*), 대체 스타일시트(title)까지 정리한다."
tags: ["html", "frontend", "form", "performance", "web"]
source: other
date: "2026-10-14"
sources: ["https://www.smashingmagazine.com/2022/03/html-attributes-you-never-use/", "https://www.frontendinterviewhandbook.com/kr/html-questions"]
---

> Louis Lazaris의 「[Those HTML Attributes You Never Use](https://www.smashingmagazine.com/2022/03/html-attributes-you-never-use/)」(Smashing Magazine, 2022.03)를 바탕으로 재구성하고, 브라우저 지원은 2026년 기준으로 고친 노트다. 「data-* 속성」 부분은 Front End Interview Handbook의 「[HTML 질문](https://www.frontendinterviewhandbook.com/kr/html-questions)」을 바탕으로 보강했다.

## 왜 속성을 알아 두나

HTML 요소는 익숙해도 속성은 잊기 쉽다. 그런데 꽤 많은 기능이 **속성 하나로 끝난다.** JavaScript로 다시 만들기 전에 HTML에 이미 있는지부터 확인한다. 전역 속성과 기본 요소는 [[html|HTML 기초와 HTML5]], 입력 타입은 [[html-input-types|HTML 입력 요소 치트시트]]에 있다.

## 한눈에 보기

| 속성 | 붙는 곳 | 하는 일 |
| --- | --- | --- |
| `enterkeyhint` | 입력 요소, `contenteditable` | 가상 키보드 엔터 키의 문구·모양 |
| `reversed`, `start`, `type`, `value` | `<ol>`, `<li>` | 번호 매기기 방향·시작값·형식·개별 번호 |
| `download` | `<a>` | 이동 대신 내려받기, 파일 이름 제안 |
| `form` | 입력·버튼 | 부모가 아닌 `<form>`에 연결 |
| `decoding` | `<img>` | 이미지 디코딩 방식 힌트 |
| `loading` | `<img>`, `<iframe>` | 지연 로딩 |
| `fetchpriority` | `<img>`, `<link>`, `<script>` | 다운로드 우선순위 힌트 |
| `cite`, `datetime` | `<blockquote>`, `<q>`, `<del>`, `<ins>` | 출처 URL, 변경 일시 |
| `label`, `disabled` | `<optgroup>` | 옵션 묶음 제목, 묶음 전체 비활성화 |
| `title` + `rel="alternate stylesheet"` | `<link>` | 사용자가 고르는 대체 스타일시트 |
| `data-*` | 모든 요소 | 표준 속성이 없는 사용자 정의 데이터 |

## 입력과 폼

### enterkeyhint: 엔터 키에 할 일을 적는다

모바일 가상 키보드의 엔터 키 문구를 바꾼다. 값은 `enter`, `done`, `go`, `next`, `previous`, `search`, `send` 일곱 가지뿐이고, 그 밖의 값은 무시된다. 검색창은 `search`, 여러 단계 폼의 중간 칸은 `next`, 채팅 입력은 `send`처럼 **다음에 일어날 일**을 알린다. 키보드 종류를 정하는 `inputmode`와 함께 쓰면 좋다(→ [[form-usability|더 나은 폼을 만드는 팁]]).

```html
<input type="search" enterkeyhint="search">
<input type="text" inputmode="numeric" enterkeyhint="next">
```

### form: 폼 밖에 있는 입력을 연결한다

레이아웃 때문에 입력 칸을 `<form>` 바깥에 둬야 할 때, `form` 속성에 폼의 `id`를 주면 그 폼과 함께 제출된다. 제출 버튼도 같은 방식으로 연결된다.

```html
<form id="order" action="/order">…</form>
<textarea name="memo" form="order"></textarea>
<button type="submit" form="order">주문</button>
```

### optgroup: 긴 선택지를 묶는다

`<optgroup label="…">`은 `<select>`의 옵션을 제목 붙은 묶음으로 나눈다. 제목은 선택할 수 없고, `disabled`를 주면 묶음 전체가 비활성화된다. 여러 입력 칸을 한 번에 막을 때는 `<fieldset disabled>`가 같은 역할을 한다.

## 목록

`reversed`·`start`·`type`·`value`로 번호 매기기를 CSS 없이 바꾸는 법은 [[html-lists-tables#번호 제어|목록과 표]]에 정리했다.

## 링크와 내려받기

`download`가 있으면 링크를 열지 않고 내려받는다. 값을 주면 저장할 파일 이름을 제안한다. **같은 출처(same-origin) URL이나 `blob:`·`data:` URL에서만** 동작하고, 다른 출처의 파일은 그냥 열린다. 사용자가 만든 내용을 `Blob` → `URL.createObjectURL()`로 링크에 넣어 저장시키는 데 자주 쓴다([[audio-recording|React에서 음성 녹음하고 파일로 보내기]]의 녹음 파일 저장이 그 예다).

```html
<a href="/report.pdf" download="2026-보고서.pdf">보고서 받기</a>
```

## 이미지·iframe 로딩 힌트

| 속성 | 값 | 쓰는 법 |
| --- | --- | --- |
| `loading` | `lazy` · `eager`(기본) | 첫 화면 밖 이미지와 iframe(지도, 영상 임베드)은 `lazy`. 2026년 기준 iframe의 `loading`도 모든 주요 브라우저가 지원한다. **첫 화면의 큰 이미지(LCP)에는 쓰지 않는다** |
| `fetchpriority` | `high` · `low` · `auto` | 첫 화면 히어로 이미지는 `high`, 캐러셀의 뒤쪽 이미지는 `low` |
| `decoding` | `async` · `sync` · `auto`(기본) | 큰 이미지 디코딩이 다른 콘텐츠 표시를 막지 않게 `async`를 줄 수 있다. 브라우저가 이미 알아서 잘 처리해 효과는 작다 |

반응형 이미지를 미리 로드하는 `imagesrcset`·`imagesizes`는 [[resource-hints#preload: 늦게 발견되는 중요한 자원만|리소스 힌트]]에 있다.

## 인용과 수정 이력

- `<blockquote cite="URL">`, `<q cite="URL">`: 인용의 출처를 기계가 읽을 수 있게 남긴다. 화면에는 보이지 않으므로, 독자에게 보여 줄 출처는 `<cite>` 요소나 링크로 따로 적는다.
- `<del>`, `<ins>`: 지운 글과 새로 넣은 글을 표시한다. `cite`에는 변경 이유를 설명하는 URL(버그 리포트 등)을, `datetime`에는 변경 일시를 넣는다. 오래된 글의 내용을 고칠 때 이력을 남기기 좋다.

```html
<del datetime="2023-12-19">Firefox는 iframe의 loading 속성을 지원하지 않는다.</del>
<ins datetime="2023-12-19">Firefox 121부터 iframe의 loading 속성을 지원한다.</ins>
```

## data-* 속성

`data-`로 시작하는 속성은 **표준에 알맞은 속성이 없는 데이터를 요소에 붙이는** 공식 통로다. 이름은 `data-` 뒤에 한 글자 이상, 대문자 없이 쓴다. 값은 늘 문자열이다.

```html
<li data-review-id="42" data-state="open">…</li>
```

```js
el.dataset.reviewId   // "42" — data-review-id가 카멜케이스로 바뀐다
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

JavaScript 프레임워크 이전에는 DOM에 데이터를 두는 주된 방법이었고, 지금은 HTML과 JS·CSS 사이에 값을 넘기는 가벼운 통로로 쓴다. CSS `attr()`은 `content`에서는 모든 브라우저가 지원하고, 다른 속성 값에 타입을 지정해 쓰는 확장 문법은 아직 실험적이다.

## 대체 스타일시트

`<link>`에 `title`을 주고 `rel="alternate stylesheet"`로 대체 스타일시트를 걸면, 사용자가 브라우저 메뉴에서 고를 수 있다. **Firefox만** 메뉴(보기 → 페이지 스타일)를 제공하고 Chromium 계열은 지원하지 않는다. 고대비·다크 테마가 목적이라면 지금은 `prefers-color-scheme`, `prefers-contrast` 미디어 쿼리와 사이트 안 테마 전환을 쓴다(→ [[color-motion-accessibility|색과 움직임의 접근성]]).

## 함께 알아 둘 속성

| 속성 | 하는 일 |
| --- | --- |
| `crossorigin` | `<img>`·`<script>`·`<link>` 등을 CORS 모드로 요청한다 |
| `integrity` | CDN에서 받은 스크립트·스타일이 변조되지 않았는지 해시로 확인한다(SRI) |
| `title` (`<abbr>`, `<dfn>`) | 약어의 전체 이름, 정의하는 용어 |
| `multiple` | `type="email"`에 쉼표로 여러 주소, `type="file"`에 여러 파일 |
| `disablepictureinpicture` | `<video>`의 PIP 버튼을 숨긴다 |
| `inert` | 영역 전체를 클릭·포커스·보조 기술에서 제외한다(모달 뒤 배경 등) |
| `popover` | JavaScript 없이 팝오버를 열고 닫는다. 바깥 클릭·Esc 닫기가 기본이다 |

## 정리

- 기능을 JavaScript로 만들기 전에 HTML 속성이 있는지 먼저 찾는다.
- 모바일 폼은 `inputmode`(키보드 종류)와 `enterkeyhint`(엔터 키 문구)를 함께 맞춘다.
- 로딩 순서는 `loading`·`fetchpriority`·`preload`로 브라우저에 알려 준다. 첫 화면 이미지는 늦추지 말고 앞당긴다.
- `cite`·`datetime`·`integrity`처럼 화면에 안 보이는 속성은 기계와 미래의 나를 위한 정보다.

**HTML 속성은 브라우저가 이미 구현해 둔 기능의 스위치다.**

관련 노트: [[html|HTML 기초와 HTML5]], [[html-input-types|HTML 입력 요소 치트시트]], [[form-usability|더 나은 폼을 만드는 팁]], [[responsive-images|반응형 이미지: srcset·sizes와 picture]], [[respect-browser-defaults|브라우저 기본 동작을 존중하기]], [[html-media-elements|이미지·오디오·비디오 임베드]], [[html-text-elements|텍스트 의미 요소와 문자 참조]], [[html-lists-tables|목록과 표 마크업]], [[resource-hints|리소스 힌트와 미리 불러오기]], [[lazy-loading|지연 로딩: 이미지·iframe·퍼사드]], [[popover-anchor-positioning|팝오버와 앵커 위치 지정]], [[payment-address-forms|결제·주소 폼]]
