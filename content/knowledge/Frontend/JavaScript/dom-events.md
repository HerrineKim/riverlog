---
title: "DOM 이벤트와 addEventListener"
concept: "Event"
summary: "사용자 행동이나 시스템 사건을 알리는 이벤트 객체와, 이를 처리하는 이벤트 리스너."
tags: ["javascript", "dom", "event", "frontend"]
source: til
---

**이벤트(Event)** 는 클릭, 키 입력, 네트워크 응답 같은 "사건이 일어났다"는 것을 알리는 객체다. 사용자의 행동으로 발생하기도 하고, `element.click()`처럼 코드로 발생시킬 수도 있다. 이벤트가 발생했을 때 실행할 함수를 **이벤트 핸들러(리스너)** 라고 한다.

## 이벤트 인터페이스

모든 이벤트는 `Event`를 상속한다. 자주 쓰는 것은 `UIEvent`를 부모로 하는 `MouseEvent`, `KeyboardEvent`, `InputEvent`, `FocusEvent`이며, 그 밖에 `AnimationEvent`, `ClipboardEvent`, `DragEvent` 등이 있다.

## addEventListener

```javascript
target.addEventListener(type, listener[, options])
```

- **target**: 이벤트를 지원하는 모든 객체(Element, Document, Window 등). 모든 DOM 노드는 `EventTarget`을 상속하므로 이벤트를 받을 수 있다.
- **type**: 반응할 이벤트 유형 문자열(대소문자 구분). 예: `'click'`, `'input'`, `'submit'`, `'keydown'`
- **listener**: 이벤트가 발생할 때 호출될 콜백 함수. 첫 번째 인자로 **이벤트 객체**를 받는다.

```html
<button type="button">버튼</button>

<script>
  const btn = document.querySelector('button')
  btn.addEventListener('click', function (event) {
    alert('버튼이 클릭되었습니다.')
    console.log(event.target) // 이벤트가 발생한 요소
  })
</script>
```

리스너를 제거하려면 같은 함수 참조를 `removeEventListener`에 넘겨야 하므로, 제거할 일이 있으면 익명 함수 대신 이름 있는 함수를 등록한다.

## 기본 동작 취소: preventDefault

일부 HTML 요소는 기본 동작이 있다. `<a>`는 클릭 시 링크로 이동하고, `<form>`은 제출 시 데이터를 전송하며 페이지를 새로고침한다. `event.preventDefault()`는 이 **기본 동작만** 막는다(이벤트 전파는 막지 않는다).

```javascript
const form = document.querySelector('form')
form.addEventListener('submit', (event) => {
  event.preventDefault() // 새로고침 없이
  // fetch/axios로 직접 전송
})
```

전파(부모로 이벤트가 올라가는 버블링)를 막으려면 `event.stopPropagation()`을 쓴다.

## React와의 비교

React에서는 `addEventListener` 대신 JSX 속성으로 핸들러를 넘긴다(`onClick={handleClick}`). 이름이 camelCase이고 문자열이 아닌 함수를 넘긴다는 점이 HTML의 `onclick="..."`과 다르다. 자세한 내용은 [React 이벤트 처리](/knowledge/dictionary/frontend/react/react-events) 참고.

## 핵심 정리

- `addEventListener(type, listener)`로 등록하고, 리스너는 이벤트 객체를 받는다.
- `preventDefault()`는 기본 동작(링크 이동, 폼 제출)만, `stopPropagation()`은 전파만 막는다.
