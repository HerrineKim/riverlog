---
title: "DOM 조작과 이벤트"
concept: "DOM API"
summary: "JavaScript로 DOM 요소를 선택하고, 만들고, 붙이고, 지우고, 속성을 바꾸는 방법과, addEventListener로 이벤트를 받아 preventDefault·stopPropagation으로 기본 동작과 전파를 제어하는 방법."
tags: ["javascript", "dom", "browser", "event", "frontend"]
source: til
date: "2026-10-11"
---

DOM 조작은 항상 **① 선택(select) → ② 변경(manipulation)** 두 단계이고, 사용자의 행동에 반응하려면 여기에 **③ 이벤트 리스너**를 붙인다. 먼저 바꿀 요소를 찾고, 그 요소의 내용·속성·자식을 바꾼다. DOM의 개념과 노드 구조는 [DOM과 BOM](/knowledge/dictionary/frontend/web/dom) 노트에 있다.

## 선택

| 메서드 | 반환 |
| --- | --- |
| `document.querySelector(selector)` | CSS 선택자와 일치하는 **첫 번째** 요소(없으면 `null`) |
| `document.querySelectorAll(selector)` | 일치하는 모든 요소의 **NodeList**(static) |
| `document.getElementById(id)` | 단일 요소 |
| `document.getElementsByTagName(name)` | HTMLCollection(live) |
| `document.getElementsByClassName(names)` | HTMLCollection(live) |

`querySelector`/`querySelectorAll`은 id·class·태그·속성·결합자 등 **모든 CSS 선택자**를 쓸 수 있어 더 구체적이고 유연하므로 주로 이것을 쓴다.

```html
<h1>Hello</h1>
<h2 id="location-header">Location</h2>
<ul>
  <li class="location">서울</li>
  <li class="location">대전</li>
  <li class="location">광주</li>
</ul>
```

```javascript
const h1 = document.querySelector('h1')
const header = document.querySelector('#location-header') // id로 선택하는 편이 더 명확
const liTags = document.querySelectorAll('li')            // NodeList(3)
const locations = document.querySelectorAll('.location')  // NodeList(3)
```

### HTMLCollection과 NodeList

둘 다 인덱스로 접근하는 **유사 배열**이다.

| | HTMLCollection | NodeList |
| --- | --- | --- |
| 접근 | name, id, index | index |
| `forEach` | 없음 | 있음 |
| 갱신 | **live**: DOM 변경이 실시간 반영 | `childNodes` 등은 live, **`querySelectorAll` 결과는 static** |

live collection은 반복문 도중 DOM을 바꾸면 컬렉션도 함께 바뀌어 예상치 못한 결과를 낼 수 있다. static한 `querySelectorAll` 결과를 쓰는 편이 안전하다. 진짜 배열 메서드가 필요하면 `Array.from(nodeList)`로 변환한다.

## 생성과 삽입

```javascript
const li = document.createElement('li') // 태그 이름으로 요소 생성
li.innerText = '부울경'

const ul = document.querySelector('ul')
ul.append(li)              // 마지막 자식 뒤에 추가
ul.append('텍스트', li2)    // 문자열과 여러 노드를 한 번에 추가 가능
ul.appendChild(li3)        // 노드 하나만, 추가한 노드를 반환
```

| | `Element.append()` | `Node.appendChild()` |
| --- | --- | --- |
| 추가 가능한 것 | Node와 문자열(DOMString) | Node만 |
| 개수 | 여러 개 | 하나 |
| 반환값 | 없음 | 추가된 Node |

이미 문서에 있는 노드를 다시 append하면 복사되지 않고 **새 위치로 이동**한다.

## 내용 변경: innerText vs innerHTML

| 속성 | 동작 |
| --- | --- |
| `innerText` | 사람이 읽을 수 있는 텍스트만 다룬다. 스타일이 적용된 최종 모습 기준(숨긴 요소 무시, 줄바꿈 인식) |
| `textContent` | 숨긴 요소까지 포함한 원본 텍스트 |
| `innerHTML` | 요소 안의 HTML 마크업을 문자열로 읽고 쓴다 |

`innerHTML`에 사용자 입력을 그대로 넣으면 그 안의 `<script>`나 이벤트 속성이 실행될 수 있어 **XSS 공격**에 취약하다. 텍스트를 넣을 때는 `innerText`/`textContent`를 쓴다([웹 보안](/knowledge/dictionary/frontend/web/web-security) 참고).

## 삭제

```javascript
li.remove()            // 자기 자신을 트리에서 제거
ul.removeChild(li)     // 부모가 자식을 제거하고, 제거된 노드를 반환
```

## 속성

```javascript
const a = document.querySelector('a')
a.setAttribute('href', 'https://example.com') // 있으면 갱신, 없으면 추가
a.getAttribute('href')                         // 'https://example.com'

a.classList.add('active')    // class 조작은 classList가 편하다
a.classList.toggle('hidden')
```

## 이벤트

**이벤트(Event)** 는 클릭, 키 입력, 네트워크 응답처럼 "사건이 일어났다"는 것을 알리는 객체다. 사용자 행동으로 생기기도 하고 `element.click()`처럼 코드로 일으킬 수도 있다. 모든 이벤트는 `Event`를 상속하며, 자주 쓰는 것은 `UIEvent`를 부모로 하는 `MouseEvent`, `KeyboardEvent`, `InputEvent`, `FocusEvent`다.

```javascript
target.addEventListener(type, listener[, options])
```

| 인자 | 의미 |
| --- | --- |
| `target` | 이벤트를 받는 객체(Element, Document, Window). 모든 DOM 노드는 `EventTarget`을 상속한다 |
| `type` | 이벤트 유형 문자열(대소문자 구분). `'click'`, `'input'`, `'submit'`, `'keydown'` |
| `listener` | 이벤트가 생길 때 호출할 함수. 첫 인자로 **이벤트 객체**를 받는다(`event.target`은 이벤트가 생긴 요소) |
| `options` | `{ once: true }`(한 번만), `{ passive: true }`(스크롤 성능), `{ capture: true }`(캡처 단계) |

```javascript
function handleClick(event) {
  console.log(event.target)
}
btn.addEventListener('click', handleClick)
btn.removeEventListener('click', handleClick) // 같은 함수 참조여야 지워진다
```

리스너를 지우려면 등록할 때와 **같은 함수 참조**를 넘겨야 한다. 익명 함수로 등록하면 지울 방법이 없으므로, 제거할 일이 있으면 이름 있는 함수로 등록한다.

### 기본 동작과 전파 막기

| 메서드 | 막는 것 | 예 |
| --- | --- | --- |
| `event.preventDefault()` | 요소의 **기본 동작**만. 전파는 그대로 | `<a>`의 페이지 이동, `<form>` 제출 시 새로고침 |
| `event.stopPropagation()` | 부모로 올라가는 **전파(버블링)** 만. 기본 동작은 그대로 | 카드 안 버튼 클릭이 카드 클릭으로 번지지 않게 |

```javascript
form.addEventListener('submit', (event) => {
  event.preventDefault() // 새로고침 없이
  // fetch로 직접 전송
})
```

React에서는 `addEventListener` 대신 JSX 속성에 함수를 넘긴다(`onClick={handleClick}`). 자세한 내용은 [[react-events|React 이벤트 처리]]에 있다.

## 핵심 정리

- 선택은 `querySelector`(하나) / `querySelectorAll`(여러 개, static NodeList).
- 만들기 `createElement` → 붙이기 `append` → 지우기 `remove`.
- 텍스트는 `innerText`/`textContent`, `innerHTML`은 XSS 위험을 알고 쓴다.
- 이벤트는 `addEventListener(type, listener)`로 받고, 지울 때는 같은 함수 참조를 넘긴다.
- `preventDefault()`는 기본 동작(링크 이동, 폼 제출)만, `stopPropagation()`은 전파만 막는다.

관련 노트: [[dom|DOM과 BOM]], [[react-events|React 이벤트 처리]], [[debounce-throttle|Debounce와 Throttle]], [[web-security|웹 보안]]
