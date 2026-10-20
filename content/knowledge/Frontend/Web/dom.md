---
title: "DOM과 BOM"
concept: "DOM"
summary: "브라우저가 HTML 문서를 파싱해 메모리에 올린 객체 트리와, 이를 다루는 API. window의 두 역할과 DOM·CSSOM·HTML 명세의 구분, 공백·주석까지 노드가 되는 규칙과 파서의 자동 교정, 노드 클래스 계층과 확인 방법, 문자열 HTML 대신 DOM이 필요해진 이유와 프레임워크 시대에 DOM API를 익히는 법도 다룬다."
tags: ["dom", "browser", "web", "javascript"]
source: til
date: "2026-10-20"
sources: ["https://ko.javascript.info/browser-environment", "https://ko.javascript.info/dom-nodes", "https://ko.javascript.info/basic-dom-node-properties", "https://riverkim.kr/223", "https://riverkim.kr/185", "https://riverkim.kr/77", "https://velog.io/@teo/dom", "https://web.dev/learn/html/apis"]
---

> riverkim.kr에 쓴 TIL과 테오(teo)의 「[DOM은 다들 어떤식으로 공부하셨나요?](https://velog.io/@teo/dom)」(2022.01)를 바탕으로 재구성한 노트다. 「요소별 인터페이스」는 web.dev의 「[Learn HTML](https://web.dev/learn/html)」 강좌 중 「HTML APIs」 모듈을 바탕으로 보강했다. 브라우저 환경·노드 규칙·클래스 계층은 javascript.info(모던 JavaScript 튜토리얼)의 「브라우저 환경과 다양한 명세서」, 「DOM 트리」, 「주요 노드 프로퍼티」 글로 보강했다.

텍스트 파일인 HTML을 화면에 그리려면 브라우저가 이해할 수 있는 구조로 메모리에 올려야 한다. 브라우저의 렌더링 엔진은 문서를 **파싱(parsing)** 해 모든 요소·속성·텍스트를 객체로 만들고, 이 객체들을 부모-자식 관계의 트리로 구성한다. 이것이 **DOM(Document Object Model)** 이다. JavaScript로 DOM을 바꾸면 그 변경이 곧바로 화면에 반영된다.

![브라우저 동작 원리](/images/til/FRONTEND/Web/DOM.assets/client-server.png)

## 브라우저라는 호스트 환경

JavaScript가 돌아가는 플랫폼을 **호스트(host)** 라고 한다. 호스트는 언어 코어(ECMAScript) 위에 자기 객체와 함수를 더한다. Node.js는 파일·네트워크를, 브라우저는 문서와 창을 다루는 객체를 준다.

브라우저 환경의 뿌리는 `window`이고, 두 역할을 겸한다.

1. JavaScript의 **전역 객체**다. 전역 `function sayHi()`는 `window.sayHi`로도 불린다(모듈 스코프와 `let`·`const`는 예외).
2. **브라우저 창**을 나타내고 `innerHeight`, `scrollTo()`, `alert()` 같은 창 기능을 준다.

```text
window ─┬─ document (DOM)        문서 내용
        ├─ navigator, location, history, screen … (BOM)
        └─ Object, Array, Function … (JavaScript 코어)
```

| 명세 | 다루는 것 |
| --- | --- |
| [DOM Living Standard](https://dom.spec.whatwg.org) (WHATWG) | 문서 구조, 노드 조작, 이벤트 |
| [CSSOM](https://www.w3.org/TR/cssom-1/) (W3C) | 스타일시트와 규칙을 객체로 읽고 쓰기. 규칙을 스크립트로 추가·삭제할 일은 드물어 직접 다룰 일이 적다 |
| [HTML Living Standard](https://html.spec.whatwg.org) (WHATWG) | HTML 언어와 요소별 인터페이스, 그리고 `setTimeout`·`alert`·`location` 같은 **BOM**. BOM은 별도 명세가 없고 여기에 들어 있다 |

API 동작을 찾을 때는 MDN이 읽기 쉽고, 세부 규칙이 궁금하면 명세가 정확하다. 「mdn 용어」, 「whatwg 용어」로 검색하면 바로 찾는다. DOM은 브라우저 전용도 아니다. 서버에서 HTML을 받아 가공하는 도구(jsdom 등)도 DOM 명세 일부를 구현한다.

## DOM이 하는 일

DOM은 HTML·ECMAScript가 아닌 W3C/WHATWG의 별도 표준이며, 플랫폼·언어 중립적인 인터페이스다. 두 가지 역할을 한다.

1. **문서 모델 구성**: 문서를 로드해 객체 트리(DOM tree)를 메모리에 만든다.
2. **접근·수정 수단 제공**: 각 객체에 접근하고 수정하는 프로퍼티와 메서드를 제공한다. 이 집합을 **DOM API**라고 한다.

정적인 웹 페이지를 동적으로 바꾸는 유일한 방법은 메모리 위의 DOM을 변경하는 것이고, 그 도구가 DOM API다.

## DOM tree와 노드

![DOM tree](/images/til/FRONTEND/Web/DOM.assets/dom-tree.png)

DOM tree의 진입점(entry point)은 `document` 객체이고, 끝은 텍스트 노드다. 트리는 네 종류의 노드로 이루어진다.

| 노드 | 설명 |
| --- | --- |
| 문서 노드(Document) | 트리 최상위. 다른 모든 노드에 접근하는 시작점 |
| 요소 노드(Element) | HTML 요소. 중첩 관계로 문서 구조를 표현하며, `HTMLElement`를 상속한 객체 |
| 텍스트 노드(Text) | 요소의 텍스트. 자식을 가질 수 없는 트리의 말단 |
| 주석 노드(Comment) | `<!-- -->`. 화면에 보이지 않지만 트리에 있고 `data`로 읽을 수 있다 |

명세의 노드 타입은 12가지지만 실무에서는 이 넷을 다룬다. `<!DOCTYPE html>`도 `<html>` 바로 앞의 노드다. 어트리뷰트는 `Attr` 객체로 표현되지만 트리의 자식이 아니라 요소의 **일부**로, 요소를 통해 접근한다.

### 노드 종류 확인하기

| 속성 | 내용 |
| --- | --- |
| `nodeType` | 숫자. `1` 요소, `3` 텍스트, `8` 주석, `9` 문서. 읽기 전용인 옛 방식이며 지금은 `instanceof`(`node instanceof HTMLElement`)를 주로 쓴다 |
| `nodeName` | 모든 노드에 있다. 요소면 태그 이름, 아니면 `#text`·`#comment`·`#document` |
| `tagName` | **요소에만** 있다. 다른 노드에서는 `undefined` |

HTML 문서에서 `tagName`·`nodeName`은 항상 **대문자**(`'BODY'`)다. XML로 처리된 문서만 원래 대소문자를 지킨다. 그래서 비교는 `el.tagName === 'A'`나 `el.matches('a')`로 한다.

### 공백도, 주석도 노드다

**HTML 안의 모든 것은 DOM이 된다.** 태그 사이의 줄바꿈·들여쓰기도 문자이므로 텍스트 노드가 된다. 그래서 `childNodes`에는 공백만 든 텍스트 노드가 섞이고, `firstChild`가 기대한 요소가 아닐 수 있다. 예외는 둘이다.

- 역사적인 이유로 `<head>` 앞의 공백·줄바꿈은 무시된다.
- `</body>` 뒤에 쓴 내용은 모두 `<body>` 안으로 옮겨진다. 콘텐츠는 `body` 안에 있어야 하기 때문이다.

DevTools Elements 패널은 공백만 든 텍스트 노드를 숨겨 보여 준다. 실제 트리는 [Live DOM Viewer](https://software.hixie.ch/utilities/js/live-dom-viewer/)로 확인할 수 있다.

### 파서의 자동 교정

브라우저는 잘못된 HTML을 만나도 멈추지 않고 표준이 정한 방식으로 고쳐 DOM을 만든다.

| 작성한 HTML | 만들어지는 DOM |
| --- | --- |
| 「안녕하세요.」 한 줄뿐 | `<html>`, `<head>`, `<body>`가 자동으로 생기고 텍스트는 `body` 안으로 |
| `<p>안녕<li>하나<li>둘` | 닫는 태그가 채워진 `<p>`와 `<li>`들 |
| `<table><tr><td>1</td></tr></table>` | `<table>` 아래에 **`<tbody>`가 끼어든다.** DOM 기준으로 선택자를 쓸 때 놀라지 않는다 |

파서의 동작 방식은 [[browser-rendering|브라우저 렌더링 과정]]에 있다.

DOM 관련 객체는 다음과 같은 상속 구조를 가진다. 모든 노드가 `EventTarget`을 상속하므로 모든 노드는 이벤트를 받을 수 있다.

```text
EventTarget → Node → Element → HTMLElement
                   ↘ Document
```

- `EventTarget`: 이벤트 리스너를 가질 수 있는 최상위 추상 인터페이스
- `Node`: `parentNode`, `childNodes`, `nextSibling` 같은 트리 기능 제공
- `Element`: 문서 안 모든 요소가 상속하는 범용 인터페이스
- `Document`: 브라우저가 불러온 웹 페이지 자체, DOM 트리의 진입점. `document.body`, `document.links`, `document.styleSheets`, `location`, `lastModified`, `cookie` 같은 문서 단위 정보를 준다. HTML뿐 아니라 SVG·XML 문서도 이 인터페이스로 다룬다
- `Text`·`Comment`: 텍스트와 주석 노드. `Node`를 상속한다(사이에 `CharacterData`가 있다)
- `Element` 아래에는 `HTMLElement` 말고도 `SVGElement`·`MathMLElement`가 있다
- `DocumentFragment`: 문서에 붙지 않은 가벼운 노드 묶음. `<template>`의 `content`가 이것이다([[web-components|웹 컴포넌트]])

DOM 노드는 **프로토타입 상속을 하는 평범한 JavaScript 객체**다. `<input>` 객체는 `HTMLInputElement` → `HTMLElement` → `Element` → `Node` → `EventTarget` → `Object`의 메서드를 모두 갖는다. 노드가 무엇인지 확인하는 방법은 이렇다.

```javascript
document.body.constructor.name     // 'HTMLBodyElement'
String(document.body)              // '[object HTMLBodyElement]'
document.body instanceof HTMLElement // true (상위 클래스 모두 true)
```

- 콘솔에서 `console.log(el)`은 DOM 트리 모양으로, `console.dir(el)`은 **객체로** 보여 준다. 속성과 프로토타입 체인을 보려면 `console.dir`을 쓴다. Elements 패널의 Properties 탭도 같은 목록을 준다.
- Elements 패널에서 선택한 요소는 콘솔에서 `$0`(직전 선택은 `$1`)이고, 변수에 든 노드는 `inspect(node)`로 패널에서 찾는다([[devtools-elements-css|DevTools로 DOM과 CSS 다루기]]).
- 명세는 인터페이스를 IDL(Interface Description Language)로 적는다. `interface HTMLInputElement : HTMLElement`는 상속을, `attribute DOMString value`는 문자열 속성을, `boolean`은 불리언 속성을 뜻한다.

### 요소별 인터페이스

대부분의 HTML 요소는 `HTMLElement`를 상속한 **전용 인터페이스**를 가진다. 이름은 「HTML + 요소 이름(대문자 카멜) + Element」지만 규칙이 딱 맞지는 않으니 외우지 말고 필요할 때 찾는다.

| 인터페이스 | 요소 | 더하는 것의 예 |
| --- | --- | --- |
| `HTMLAnchorElement` | `<a>` | `href`, `protocol`, `hash` 등 URL 부분 |
| `HTMLImageElement` | `<img>` | `alt`, `naturalWidth`, `complete` |
| `HTMLMediaElement` → `HTMLVideoElement`·`HTMLAudioElement` | `<video>`, `<audio>` | `play()`, `pause()`, `currentTime`, `duration`, `ended` |
| `HTMLDialogElement` | `<dialog>` | `show()`, `showModal()`, `close()`, `returnValue` |
| `HTMLDetailsElement` | `<details>` | `open`, `toggle` 이벤트 |
| `HTMLFormElement`, `HTMLInputElement`, `HTMLSelectElement` | 폼 요소 | `elements`, `validity`, `options` |
| `HTMLTableCellElement` | `<td>`, `<th>` | `cellIndex`, `headers` |
| `HTMLModElement`, `HTMLQuoteElement` | `<ins>`·`<del>`, `<q>`·`<blockquote>` | `cite`, `dateTime` |

- `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`, `<aside>`, `<address>` 등 30여 개 요소는 전용 인터페이스 없이 `HTMLElement` 그대로다. 모르는 태그는 `HTMLUnknownElement`가 된다.
- 요소 속성(property)은 레이아웃·재생 상태 같은 **현재 상태**도 준다. `offsetHeight`는 화면 폭이 바뀌면 함께 바뀐다.
- 상속 사슬에서 같은 이름의 속성이 있으면 아래쪽(자식 인터페이스) 정의가 이긴다. 예를 들어 `HTMLCollection.length`는 읽기 전용이지만 `<select>`의 `options`가 돌려주는 `HTMLOptionsCollection.length`는 쓸 수 있어 목록 길이를 바꾼다.
- 컬렉션에는 `id`나 `name`으로 항목을 찾는 `namedItem()` 같은 메서드가 있다.

## BOM

**BOM(Browser Object Model)** 은 JavaScript가 문서 바깥의 **브라우저**와 소통하기 위한 모델이다. 브라우저 창·주소·히스토리 등을 객체로 추상화한다.

- 최상위 객체는 `window`(브라우저 탭)이며, 작성 시 생략할 수 있다. `document`도 사실 `window.document`다.
- `navigator`(브라우저 정보), `location`(URL), `history`(방문 기록), `screen`(화면 정보), `XMLHttpRequest` 등이 있다.

### 자주 쓰는 BOM 기능

**페이지 이동: `location.href`.** `location`은 현재 페이지의 URL을 나타내는 객체이고, `href`는 전체 주소 문자열이다. 읽으면 현재 주소, 값을 넣으면 그 주소로 이동한다. 프레임워크 없는 HTML에서 버튼으로 페이지를 옮길 때 간단히 쓴다.

```html
<button onclick="location.href='https://example.com'">메인으로</button>
```

단순 이동이라면 `<a href>`가 접근성과 SEO에 더 낫다. 버튼은 동작(제출, 열기)에, 링크는 이동에 쓰는 것이 원칙이다.

**스크롤 제어: `window.scrollTo()`.** 문서의 특정 좌표(px)로 스크롤한다. `behavior: 'smooth'`로 부드럽게 움직일 수 있다. 맨 위로 가기 버튼이 대표적인 예다.

```javascript
const scrollToTop = () => {
  if (!window.scrollY) return // 이미 맨 위면 무시
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

옵션 객체와 `smooth`는 모든 주요 브라우저가 지원한다(과거 IE는 지원하지 않았다). 운영체제에서 「동작 줄이기」를 켠 사용자에게는 `matchMedia('(prefers-reduced-motion: reduce)')`로 확인해 `smooth`를 끈다.

**디자인 모드: `document.designMode`.** 개발자 도구 콘솔에서 `document.designMode = 'on'`을 실행하면 페이지 전체를 문서 편집기처럼 클릭해 텍스트를 고칠 수 있다. 코드를 건드리지 않고 문구 길이나 줄바꿈이 레이아웃에 주는 영향을 빠르게 확인할 때 쓴다. `'off'`로 끄며, 새로고침하면 원래대로 돌아간다.

## 브라우저에서 JavaScript로 할 수 있는 일

| 영역 | 예 |
| --- | --- |
| DOM 조작 | 문서(HTML) 요소 선택·생성·변경 — `document.title = 'Javascript'` |
| BOM 조작 | `location`, `history`, `navigator` 등 브라우저 제어 |
| JavaScript Core(ECMAScript) | 자료구조(Object, Array), 조건문, 반복문 등 언어 자체 |

선택·변경을 다루는 구체적인 메서드는 [[dom-manipulation|DOM 조작]]에, 이벤트 전파·위임은 [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]]에 있다.

## DOM이 필요해진 이유

**HTML은 문자열이다.** 서버 언어(PHP 등)는 문자열을 이어 붙이기만 하면 HTML을 만들 수 있었다. 브라우저에서도 처음에는 `document.write()`로 문자열을 출력했다. 하지만 문자열 HTML을 파싱해 화면에 그릴 구조를 만드는 일은 비싸다. 일부만 바뀌었는데 매번 전체를 다시 파싱하면 낭비다. 그래서 **이미 만들어 둔 구조를 직접 조금씩 고치는 방법**이 필요했다. 문서(Document)를 JavaScript가 다룰 수 있는 객체(Object)로 모델링(Model)한 인터페이스가 DOM이다.

- 브라우저가 먼저 있었고, 서버 언어가 다음, JavaScript는 가장 나중에 나왔다. 브라우저 내부 구조는 JavaScript로 만든 것이 아니며, DOM은 그 구조에 접근하는 **언어 독립적인 표준 인터페이스**다. 실무에서는 DOM과 DOM API를 같은 말로 써도 된다.
- DOM은 HTML만이 아니다. `getBoundingClientRect()`·`offsetWidth`처럼 **이미 그려진 화면의 크기·위치**를 읽을 수 있고, 클릭·키 입력 같은 **이벤트**와 캡처링·버블링도 DOM의 일부다.
- DOM API는 안 되는 게 없도록 최소한으로 설계돼 쓰기 불편하다. jQuery가 다듬은 문법 일부(`querySelectorAll` 등)가 나중에 표준이 됐고, 지금의 프레임워크는 **HTML을 쓰는 감각으로 개발하게 하면서** 내부에서 DOM 조작을 최적화한다.

### 프레임워크 시대에 DOM 익히기

DOM의 본질은 "HTML을 이렇게 고쳐 달라"를 컴퓨터가 알아듣게 말하는 방법이다. 사람에게는 "h1 옆에 title 클래스 넣어 줘"면 되지만, 컴퓨터에게는 "h1 요소 중 0번째를 가져와 `classList`에 `title`을 add하라"고 말해야 한다. 그래서 API를 외우기보다 **바꾸고 싶은 HTML을 떠올리고 해당 API를 찾아 쓰는** 경험이 중요하다.

| 단계 | 익힐 것 |
| --- | --- |
| 기초 | 선택·생성 → 속성 접근 → 값 변경 → 노드 삭제·추가 |
| 고급 | 조건에 맞는 하위 요소 고르기, 기준 요소에서 상대 위치로 이동, `DocumentFragment`로 묶어서 한 번에 배치 |
| 프레임워크와 함께 | 레이아웃 측정(`getBoundingClientRect`), `scrollIntoView`, `element.animate()`, `MutationObserver` |

프레임워크를 쓰면 기본 조작은 거의 하지 않는다. DOM API가 깊게 필요한 경우는 **프레임워크에 묶이지 않는 UI 컴포넌트**를 배포하거나 라이브러리를 직접 만들 때다. 연습 과제로는 팝오버(버튼 근처에 위치를 자동 계산해 띄우고, 화면 밖으로 잘리지 않게 방향을 바꾸고, 바깥을 클릭하면 닫기), 캐러셀, 컬러 피커처럼 위치 계산과 이벤트가 얽힌 UI가 좋다. 작은 jQuery 같은 라이브러리를 직접 만들어 보는 것도 API를 몸에 익히는 방법이다.

## 핵심 정리

- DOM = 브라우저가 HTML을 파싱해 만든 **객체 트리**, DOM API = 그 트리를 다루는 인터페이스.
- 실무에서 다루는 노드는 문서·요소·텍스트·주석 네 종류이며, 진입점은 `document`. 종류는 `instanceof`나 `nodeName`으로 확인한다.
- BOM은 문서 바깥의 브라우저 자체를 다루며 최상위 객체는 `window`.
- DOM은 문자열 HTML을 매번 다시 파싱하는 비용을 피하려고, 이미 만든 구조를 부분 수정하기 위해 생겼다.

관련 노트: [[dom-manipulation|DOM 조작]], [[web-components|웹 컴포넌트: template·slot·Shadow DOM]], [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]], [[intersection-observer|Intersection Observer와 관찰자 API]], [[browser-rendering|브라우저 렌더링 과정]], [[frontend-history|프론트엔드의 등장 배경]], [[devtools-elements-css|DevTools로 DOM과 CSS 다루기]], [[dom-geometry|요소 크기·스크롤·좌표]], [[mutation-observer|MutationObserver]]
