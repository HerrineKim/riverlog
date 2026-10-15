---
title: "HTML 기초와 HTML5"
concept: "HTML"
summary: "웹 문서의 구조와 의미를 태그로 표현하는 마크업 언어와 그 핵심 문법."
tags: ["html", "web", "semantic", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/280", "https://riverkim.kr/282", "https://www.frontendinterviewhandbook.com/kr/html-questions"]
---

> 「DOCTYPE과 렌더링 모드」와 「HTML5와 웹 플랫폼」 부분은 Front End Interview Handbook의 「[HTML 질문](https://www.frontendinterviewhandbook.com/kr/html-questions)」을 HTML Living Standard·MDN으로 확인해 보강했습니다.

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

## DOCTYPE과 렌더링 모드

`<!DOCTYPE html>`은 문서 맨 앞에 두는 **문서 유형 선언**이다. 대소문자는 가리지 않는다. 예전 HTML 4·XHTML의 DOCTYPE은 문서가 따르는 DTD(Document Type Definition, 어떤 요소 안에 무엇이 올 수 있는지 정한 문법 정의)를 가리켰다. 지금 HTML은 SGML 기반이 아니라 DTD가 없고, DOCTYPE이 하는 일은 **브라우저의 렌더링 모드를 고르는 것** 하나다.

| 모드 | 언제 | 동작 |
| --- | --- | --- |
| 표준(no-quirks) | `<!DOCTYPE html>` | 현대 HTML·CSS 명세대로 그린다 |
| 제한된 쿼크(limited-quirks) | 일부 옛 Transitional DOCTYPE | 표 셀 안 이미지의 줄 높이 같은 극소수 차이만 남는다 |
| 쿼크(quirks) | DOCTYPE이 없거나 아주 옛 형식 | 1990년대 말 브라우저의 박스 모델·높이 계산 버그를 흉내 낸다 |

`document.compatMode`가 `"CSS1Compat"`이면 표준(또는 제한된 쿼크), `"BackCompat"`이면 쿼크 모드다. DOCTYPE 앞에 주석이나 공백 외의 내용이 오면 쿼크 모드로 떨어질 수 있으니 반드시 첫 줄에 둔다. `application/xhtml+xml`로 보내는 XHTML은 DOCTYPE 없이도 늘 표준 모드다.

## 요소와 속성

- **요소(element)** = 여는 태그 + 내용 + 닫는 태그. 예: `<h1>안녕하세요</h1>`
  - 내용이 없는 빈 요소: `br`, `hr`, `img`, `input`, `link`, `meta`
  - 요소는 중첩될 수 있다.
- **속성(attribute)** 은 시작 태그에 `이름="값"` 쌍으로 적어 부가 정보를 준다. 예: `<a href="https://google.com">`
  - 태그마다 사용할 수 있는 속성이 다르며, 공백·따옴표 등 작성 방식은 통일한다.

### 전역 속성(Global Attribute)

| 속성 | 설명 |
| --- | --- |
| `id` | 문서 전체에서 유일한 식별자 |
| `class` | 공백으로 구분된 클래스 목록. CSS·JS에서 요소를 선택할 때 사용 |
| `data-*` | 요소에 사용자 정의 데이터를 붙인다. JS에서는 `dataset`으로 읽는다([[html-lesser-known-attributes|잘 안 쓰지만 쓸모 있는 HTML 속성]]) |
| `lang`, `dir` | 내용의 언어와 글 방향([[multilingual-pages|다국어 페이지]]) |
| `style` | 인라인 스타일 |
| `title` | 요소에 대한 추가 정보(툴팁) |
| `tabindex` | 탭 키 이동 순서 |

## 시맨틱 태그

의미 없는 `div`로만 영역을 나누는 대신, 영역의 **의미**를 드러내는 태그를 쓴다. `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`가 대표적이다. 개발자, 검색 엔진, 스크린 리더 모두에게 의미 있는 구조를 전달하고 **SEO**와 접근성의 기본이 된다.

태그별 의미, 제목 계층, `<article>`과 `<section>`을 고르는 법은 [[semantic-html|시맨틱 HTML과 문서 구조]]에 정리했다.

## 자주 쓰는 태그

### 텍스트 요소

| 태그 | 설명 |
| --- | --- |
| `<a>` | `href`로 다른 URL에 연결하는 하이퍼링크 |
| `<b>` / `<strong>` | 굵은 글씨 / **중요한 내용**의 강조(의미론적 차이) |
| `<i>` / `<em>` | 기울임 글씨 / 강세를 둔 강조 |
| `<br>` | 줄 바꿈 |
| `<img>` | `src`로 이미지 표시 |
| `<span>` | 의미 없는 인라인 컨테이너 |

### 그룹 콘텐츠

| 태그 | 설명 |
| --- | --- |
| `<p>` | 하나의 문단 |
| `<hr>` | 주제의 분리(수평선으로 표현) |
| `<ol>` / `<ul>` | 순서 있는 / 순서 없는 목록 |
| `<pre>` | 작성한 내용을 공백까지 그대로 표현(보통 고정폭 글꼴) |
| `<blockquote>` | 긴 인용문 |
| `<div>` | 의미 없는 블록 컨테이너 |

### 표(table)

`<table>` 안을 `<thead>`, `<tbody>`, `<tfoot>`으로 나누고, 행은 `<tr>`, 제목 셀은 `<th>`, 데이터 셀은 `<td>`로 만든다. `<caption>`은 표 제목이다.

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

## form과 input

`<form>`은 사용자 입력 데이터를 서버로 제출하는 영역이다.

| form 속성 | 설명 |
| --- | --- |
| `action` | 데이터를 처리할 서버 URL |
| `method` | 제출할 때 사용할 HTTP 메서드(`GET` 또는 `POST`) |
| `enctype` | POST일 때 데이터 형식. 기본값 `application/x-www-form-urlencoded`, 파일 전송 시 `multipart/form-data` |

`<input>`은 `type`에 따라 동작이 완전히 달라진다.

- 공통 속성: `name`과 `value`가 이름/값 쌍으로 전송된다. `required`, `readonly`, `autofocus`, `autocomplete`, `disabled` 등.
- 일반 입력: `text`, `password`(입력값을 가림), `email`(형식이 아니면 제출 불가), `number`(`min`·`max`·`step`), `file`(`accept`로 파일 형식 지정)
- 항목 선택: `checkbox`(다중 선택), `radio`(단일 선택). 같은 그룹은 같은 `name`을 주고 항목마다 `value`를 지정한다.
- 기타: `color`, `date` 같은 picker, 사용자에게 보이지 않고 값만 전송하는 `hidden`
- type별 용도와 `select`·`textarea`·`fieldset`·`datalist`는 [[html-input-types|HTML 입력 요소 치트시트]]에 정리했다.

모든 input에는 `<label for>`를 연결해 터치 영역과 접근성을 확보한다. 연결 방법과 예시는 [[html-input-types|HTML 입력 요소 치트시트]]의 label 절에 있다.

## 링크의 target과 rel

`<a>`의 `target`은 링크한 URL을 **어느 브라우징 맥락**(탭, 창, `<iframe>`)에 띄울지 정한다.

| 값 | 동작 |
| --- | --- |
| `_self` | 현재 맥락에 연다(기본값) |
| `_blank` | 새 맥락에 연다. 보통 새 탭이고, 사용자 설정에 따라 새 창 |
| `_parent` | 현재 맥락의 부모에 연다. 부모가 없으면 `_self`처럼 동작 |
| `_top` | 가장 바깥(최상위) 맥락에 연다. 부모가 없으면 `_self`처럼 동작 |

`<iframe>`은 그 자체로 하나의 브라우징 맥락이다. iframe 안의 링크가 기본값 `_self`로 열리면 **iframe 안에서만** 페이지가 바뀐다. 전체 창을 이동시키려면 `target="_top"`을 쓴다.

새 탭으로 열 때는 `rel`도 함께 신경 쓴다. 새로 열린 페이지는 `window.opener`로 링크를 연 페이지에 접근할 수 있어, 악의적인 페이지가 원래 탭을 피싱 페이지로 바꿔치기할 수 있다.

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">외부 링크</a>
```

- `noopener`: 새 페이지에서 `window.opener`를 `null`로 만든다.
- `noreferrer`: `noopener` 효과에 더해 이전 페이지 주소(Referer 헤더)도 보내지 않는다.

주요 브라우저(크롬 88·파이어폭스 79·사파리 12.1 이후)는 `target="_blank"`에 `noopener`를 기본 적용한다. 그래서 `noopener`는 아주 오래된 브라우저를 위한 안전장치이고, 이전 페이지 주소까지 숨기려면 `noreferrer`를 명시한다.

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
| 오프라인·저장소 | Web Storage, IndexedDB, 서비스 워커와 Cache API([[pwa-service-worker|PWA]]) |
| 멀티미디어 | `<video>`, `<audio>`, Media Source Extensions |
| 그래픽·효과 | `<canvas>`, SVG, WebGL·WebGPU |
| 성능·통합 | Web Worker, `requestAnimationFrame`, WebAssembly |
| 장치 접근 | Geolocation, `getUserMedia`(카메라·마이크), 센서 |
| 스타일링 | CSS3 이후의 모듈들(전환·애니메이션·그리드·웹 폰트) |

지금은 「HTML5」라는 버전이 따로 없다. HTML 표준(HTML Living Standard)은 WHATWG가 계속 고쳐 가는 단일 문서이고, 2019년부터 W3C와 협력해 관리한다.

## 핵심 정리

- HTML은 **구조와 의미**, CSS는 표현, JavaScript는 동작을 담당한다.
- 영역을 나눌 때는 가능한 한 시맨틱 태그를 쓴다. SEO와 접근성의 기본이다.
- form 데이터는 input의 `name`/`value` 쌍으로 전송되고, `label` 연결로 사용성과 접근성을 챙긴다.

관련 노트: [[markdown|Markdown(또 하나의 마크업 언어)]], [[dom|DOM과 BOM]], [[semantic-html|시맨틱 HTML과 문서 구조]], [[web-glossary|프론트엔드 웹 개발 용어집]], [[html-lesser-known-attributes|잘 안 쓰지만 쓸모 있는 HTML 속성]], [[script-loading|스크립트·스타일 로딩 순서와 점진적 렌더링]], [[multilingual-pages|다국어 페이지]]
