---
title: "DOM과 BOM"
concept: "DOM"
summary: "브라우저가 HTML 문서를 파싱해 메모리에 올린 객체 트리와, 이를 다루는 API. 문자열 HTML 대신 DOM이 필요해진 이유와 프레임워크 시대에 DOM API를 익히는 법도 다룬다."
tags: ["dom", "browser", "web", "javascript"]
source: til
date: "2026-10-13"
sources: ["https://riverkim.kr/223", "https://riverkim.kr/185", "https://riverkim.kr/77", "https://velog.io/@teo/dom"]
---

> riverkim.kr에 쓴 TIL과 테오(teo)의 「[DOM은 다들 어떤식으로 공부하셨나요?](https://velog.io/@teo/dom)」(2022.01)를 바탕으로 재구성한 노트입니다.

텍스트 파일인 HTML을 화면에 그리려면 브라우저가 이해할 수 있는 구조로 메모리에 올려야 한다. 브라우저의 렌더링 엔진은 문서를 **파싱(parsing)** 해 모든 요소·속성·텍스트를 객체로 만들고, 이 객체들을 부모-자식 관계의 트리로 구성한다. 이것이 **DOM(Document Object Model)** 이다. JavaScript로 DOM을 바꾸면 그 변경이 곧바로 화면에 반영된다.

![브라우저 동작 원리](/images/til/FRONTEND/Web/DOM.assets/client-server.png)

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
| 어트리뷰트 노드(Attribute) | 요소의 속성. 자식이 아니라 요소의 **일부**로 취급되어, 요소 노드를 통해 접근한다 |
| 텍스트 노드(Text) | 요소의 텍스트. 자식을 가질 수 없는 트리의 말단 |

DOM 관련 객체는 다음과 같은 상속 구조를 가진다. 모든 노드가 `EventTarget`을 상속하므로 모든 노드는 이벤트를 받을 수 있다.

```text
EventTarget → Node → Element → HTMLElement
                   ↘ Document
```

- `EventTarget`: 이벤트 리스너를 가질 수 있는 최상위 추상 인터페이스
- `Node`: `parentNode`, `childNodes`, `nextSibling` 같은 트리 기능 제공
- `Element`: 문서 안 모든 요소가 상속하는 범용 인터페이스
- `Document`: 브라우저가 불러온 웹 페이지 자체, DOM 트리의 진입점

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

DOM을 다루는 순서는 항상 같다. **① 조작할 요소를 선택(탐색)하고 → ② 내용이나 속성을 변경한다.** 구체적인 메서드는 [DOM 조작](/knowledge/dictionary/frontend/javascript/dom-manipulation) 노트에 정리했다.

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
- 노드는 문서·요소·속성·텍스트 네 종류이며, 진입점은 `document`.
- BOM은 문서 바깥의 브라우저 자체를 다루며 최상위 객체는 `window`.
- DOM은 문자열 HTML을 매번 다시 파싱하는 비용을 피하려고, 이미 만든 구조를 부분 수정하기 위해 생겼다.

관련 노트: [[dom-manipulation|DOM 조작]], [[dom-events|이벤트]], [[browser-rendering|브라우저 렌더링 과정]], [[frontend-history|프론트엔드의 등장 배경]], [[devtools-elements-css|DevTools로 DOM과 CSS 다루기]]
