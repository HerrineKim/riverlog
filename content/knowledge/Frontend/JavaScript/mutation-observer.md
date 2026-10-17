---
title: "MutationObserver"
concept: "MutationObserver"
summary: "DOM 트리의 변화(자식 추가·삭제, 속성, 텍스트)를 지켜보다 모아서 알려 주는 MutationObserver. observe 옵션(childList·subtree·attributes·characterData·attributeFilter·oldValue), MutationRecord의 내용, 서드파티 스크립트가 넣는 DOM에 반응하기와 동적으로 들어온 콘텐츠를 한곳에서 처리하는 쓰임, takeRecords·disconnect, 마이크로태스크로 전달되는 특성과 무한 루프 주의, 폐기된 뮤테이션 이벤트를 정리한다."
tags: ["javascript", "dom", "browser", "event", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/mutation-observer", "https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver", "https://developer.mozilla.org/en-US/docs/Web/API/MutationEvent"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「뮤테이션 옵저버」 글을 바탕으로, 세부 동작은 MDN으로 확인해 재구성한 노트다.

## MutationObserver란

`MutationObserver`는 지정한 DOM 노드를 지켜보다가 **트리가 바뀌면** 콜백을 부르는 내장 객체다. 내 코드가 직접 DOM을 바꿀 때는 필요 없다. 바꾼 곳에서 바로 처리하면 된다. 쓸모는 **내가 통제하지 못하는 코드가 DOM을 바꿀 때**, 또는 바꾸는 곳이 너무 많아 한곳에서 반응하고 싶을 때다.

같은 관찰자 모양(생성자에 콜백, `observe()`, `disconnect()`)을 따르는 `IntersectionObserver`·`ResizeObserver`와의 비교는 [[intersection-observer#다른 관찰자 API|Intersection Observer와 관찰자 API]]에 있다.

## 사용법

```javascript
const observer = new MutationObserver((records, observer) => {
  for (const r of records) {
    if (r.type === 'childList') r.addedNodes.forEach(handleAdded)
    if (r.type === 'attributes') console.log(r.attributeName, r.oldValue, '→', r.target.getAttribute(r.attributeName))
  }
})

observer.observe(container, {
  childList: true,          // 직계 자식 추가·삭제
  subtree: true,            // 모든 자손까지
  attributes: true,         // 속성 변경
  attributeFilter: ['class', 'data-state'], // 이 속성만
  attributeOldValue: true,  // 이전 값도 함께
})
```

| 옵션 | 지켜보는 것 |
| --- | --- |
| `childList` | 노드의 직계 자식이 추가·삭제됨 |
| `subtree` | 위 변화를 모든 자손에서. 다른 옵션과 함께 쓴다 |
| `attributes` | 속성 변경 |
| `attributeFilter` | 지켜볼 속성 이름 배열(주면 `attributes`가 자동으로 켜진다) |
| `characterData` | 텍스트 노드의 `data` 변경 |
| `attributeOldValue`·`characterDataOldValue` | 이전 값을 `oldValue`에 담는다 |

`childList`·`attributes`·`characterData` 중 하나는 켜야 한다. 옵션은 **필요 없는 콜백을 줄이는 최적화**다. 넓게 잡을수록 콜백이 자주, 많이 온다.

### MutationRecord

콜백의 첫 인자는 `MutationRecord` 배열, 둘째 인자는 관찰자 자신이다.

| 속성 | 내용 |
| --- | --- |
| `type` | `'childList'`·`'attributes'`·`'characterData'` |
| `target` | 바뀐 곳. 속성·자식 변경은 그 요소, 텍스트 변경은 텍스트 노드 |
| `addedNodes`·`removedNodes` | 추가·삭제된 노드(텍스트 노드 포함) |
| `previousSibling`·`nextSibling` | 추가·삭제된 노드의 앞뒤 형제 |
| `attributeName`·`attributeNamespace` | 바뀐 속성 |
| `oldValue` | 이전 값. `…OldValue` 옵션을 켰을 때만 |

`contenteditable` 안에서 굵은 글씨 하나를 지우는 것처럼 사용자 동작 하나가 레코드 여러 개(텍스트 변경, 자식 삭제)를 만들기도 한다.

## 언제 쓰나

| 상황 | 처리 |
| --- | --- |
| 서드파티 위젯이 원치 않는 요소(광고 배너 등)를 넣는다 | 들어오는 순간 감지해 숨기거나 지운다 |
| 서드파티 스크립트가 무언가를 넣은 뒤 레이아웃을 맞춰야 한다 | 추가를 감지해 크기·위치를 조정한다 |
| 여러 곳에서 HTML을 동적으로 넣는다(게시글, 퀴즈, 댓글) | 코드 하이라이트·지연 로딩·툴팁 초기화를 관찰자 한곳에서 한다 |
| 확장 프로그램처럼 남의 페이지에 반응해야 한다 | 페이지의 DOM 변화를 지켜본다 |

```javascript
// 어디서 넣었든, 새로 들어온 코드 예제에 하이라이트를 입힌다
new MutationObserver((records) => {
  for (const r of records) {
    for (const node of r.addedNodes) {
      if (!(node instanceof HTMLElement)) continue        // 텍스트 노드 등은 건너뛴다
      if (node.matches('pre[class*="language-"]')) Prism.highlightElement(node)
      node.querySelectorAll('pre[class*="language-"]').forEach((el) => Prism.highlightElement(el))
    }
  }
}).observe(document.body, { childList: true, subtree: true })
```

새로 들어온 노드 **자신**과 그 **안쪽** 둘 다 검사해야 한다. `innerHTML`로 덩어리를 넣으면 레코드에는 바깥 노드만 있다.

먼저 다른 방법이 없는지 본다. 내 코드가 넣는 콘텐츠라면 넣는 함수에서 처리하는 것이 더 명확하고, 웹 컴포넌트라면 `connectedCallback`이 이 역할을 한다([[web-components|웹 컴포넌트]]). 크기 변화는 `ResizeObserver`, 화면에 보이는지는 `IntersectionObserver`가 맞다.

## 동작 특성

- **모아서, 나중에** 알린다. 변경마다 바로 부르지 않고 레코드를 쌓았다가 **마이크로태스크**로 한 번에 전달한다. 그래서 루프에서 자식 100개를 넣어도 콜백은 보통 한 번이다. 마이크로태스크가 언제 도는지는 [[event-loop|이벤트 루프]]에 있다.
- **콜백 안에서 지켜보는 DOM을 또 바꾸면** 다시 레코드가 생겨 콜백이 또 불린다. 조건 없이 바꾸면 무한히 돈다. 이미 처리한 노드는 표시(`data-processed`)하거나, 바꾸기 전에 `disconnect()`했다가 다시 `observe()`한다.
- 관찰자는 노드를 **약하게** 참조한다. 지켜보는 노드가 DOM에서 빠져 도달할 수 없게 되면 가비지 컬렉션된다.

### 끝내기

```javascript
const pending = observer.takeRecords() // 아직 콜백으로 전달되지 않은 레코드를 꺼낸다
observer.disconnect()                   // 모든 관찰 중단
handle(pending)                         // 꺼낸 레코드는 콜백으로 오지 않는다
```

`disconnect()` 직전에 일어난 변경은 아직 콜백에 전달되지 않았을 수 있다. 빠짐없이 처리하려면 먼저 `takeRecords()`로 꺼낸다. 컴포넌트가 사라질 때는 `disconnect()`를 부른다.

## 역사: 뮤테이션 이벤트

과거에는 `DOMNodeInserted`, `DOMSubtreeModified`, `DOMAttrModified` 같은 **뮤테이션 이벤트**로 DOM 변화를 받았다. 변경마다 동기로 이벤트를 쏘고 버블링까지 해서 DOM 조작을 크게 느리게 했다. 폐기됐고 브라우저에서 제거되는 중이다. `MutationObserver`가 그 대체다.

## 정리

- DOM 변화를 내 코드 밖에서 감지해야 할 때 `MutationObserver`를 쓴다.
- `childList`·`attributes`·`characterData`로 종류를, `subtree`로 범위를, `attributeFilter`로 대상을 좁힌다.
- 변경은 모아서 마이크로태스크로 온다. 콜백에서 같은 DOM을 바꿀 때는 재귀를 막는다.
- 추가된 노드는 자신과 그 안쪽을 모두 검사한다.
- 끝낼 때는 `takeRecords()` → `disconnect()`.

관련 노트: [[intersection-observer|Intersection Observer와 관찰자 API]], [[dom-manipulation|DOM 조작과 이벤트]], [[web-components|웹 컴포넌트: template·slot·Shadow DOM]], [[event-loop|이벤트 루프]], [[dom|DOM과 BOM]]
