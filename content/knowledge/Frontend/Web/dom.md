---
title: "DOM과 BOM"
concept: "DOM"
summary: "브라우저가 HTML 문서를 파싱해 메모리에 올린 객체 트리와, 이를 다루는 API."
tags: ["dom", "browser", "web", "javascript"]
source: til
---

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

## 브라우저에서 JavaScript로 할 수 있는 일

| 영역 | 예 |
| --- | --- |
| DOM 조작 | 문서(HTML) 요소 선택·생성·변경 — `document.title = 'Javascript'` |
| BOM 조작 | `location`, `history`, `navigator` 등 브라우저 제어 |
| JavaScript Core(ECMAScript) | 자료구조(Object, Array), 조건문, 반복문 등 언어 자체 |

DOM을 다루는 순서는 항상 같다. **① 조작할 요소를 선택(탐색)하고 → ② 내용이나 속성을 변경한다.** 구체적인 메서드는 [DOM 조작](/knowledge/dictionary/frontend/javascript/dom-manipulation) 노트에 정리했다.

## 핵심 정리

- DOM = 브라우저가 HTML을 파싱해 만든 **객체 트리**, DOM API = 그 트리를 다루는 인터페이스.
- 노드는 문서·요소·속성·텍스트 네 종류이며, 진입점은 `document`.
- BOM은 문서 바깥의 브라우저 자체를 다루며 최상위 객체는 `window`.
