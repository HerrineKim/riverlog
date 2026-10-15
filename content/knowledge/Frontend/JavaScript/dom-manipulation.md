---
title: "DOM 조작과 이벤트"
concept: "DOM API"
summary: "JavaScript로 DOM 요소를 선택·탐색하고, 속성·클래스·data 속성을 다루고, 요소를 만들어 원하는 위치에 넣고 지우는 방법. 문자열 HTML을 넣는 법과 위험, 리플로우를 줄이는 일괄 삽입, addEventListener로 이벤트를 받는 기본까지 다룬다."
tags: ["javascript", "dom", "browser", "event", "frontend"]
source: mixed
date: "2026-10-15"
sources: ["https://wesbos.com/javascript/04-the-dom/selecting-elements", "https://wesbos.com/javascript/04-the-dom/element-properties-and-methods", "https://wesbos.com/javascript/04-the-dom/working-with-classes", "https://wesbos.com/javascript/04-the-dom/built-in-and-custom-data-attributes", "https://wesbos.com/javascript/04-the-dom/creating-html", "https://wesbos.com/javascript/04-the-dom/html-from-strings-and-xss", "https://wesbos.com/javascript/04-the-dom/traversing-and-removing-nodes", "https://wesbos.com/javascript/05-events/event-listener"]
---

> TIL을 정리하고, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)를 함께 참고했다.

DOM 조작은 항상 **① 선택(select) → ② 변경(manipulation)** 두 단계이고, 사용자의 행동에 반응하려면 여기에 **③ 이벤트 리스너**를 붙인다. DOM의 개념과 노드 구조는 [[dom|DOM과 BOM]], 이벤트 전파·위임은 [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]]에 있다.

## 선택

| 메서드 | 반환 |
| --- | --- |
| `querySelector(selector)` | CSS 선택자와 일치하는 **첫 번째** 요소(없으면 `null`) |
| `querySelectorAll(selector)` | 일치하는 모든 요소의 **NodeList**(static) |
| `getElementById(id)` | 단일 요소. `#` 없이 id만 넘긴다 |
| `getElementsByTagName`·`getElementsByClassName` | HTMLCollection(live) |

`querySelector`/`querySelectorAll`은 속성 선택자(`[name="signup"]`)·결합자(`.item img`)까지 **모든 CSS 선택자**를 쓸 수 있어 주로 이것을 쓴다. `document`뿐 아니라 **어느 요소에서나** 부를 수 있고, 그러면 그 요소 안에서만 찾는다. 컴포넌트 단위로 범위를 좁힐 때 쓴다.

```javascript
const card = document.querySelector('.card')
const img = card.querySelector('img')      // card 안에서만 찾는다
const form = document.querySelector('[name="signup"]')
```

스크립트가 `<head>`에서 바로 실행되면 아직 요소가 없어 `null`이 나온다. `defer`나 `type="module"`로 불러 HTML 파싱 뒤에 실행한다([[script-loading|스크립트·스타일 로딩 순서]]).

### HTMLCollection과 NodeList

둘 다 인덱스로 접근하는 **유사 배열**이다. `map`·`filter` 같은 배열 메서드는 없다.

| | HTMLCollection | NodeList |
| --- | --- | --- |
| `forEach` | 없음 | 있음 |
| 갱신 | **live**: DOM 변경이 실시간 반영 | `childNodes`는 live, **`querySelectorAll` 결과는 static** |

live collection은 반복 도중 DOM을 바꾸면 함께 바뀌어 예상치 못한 결과를 낸다. 배열 메서드가 필요하면 `Array.from(list)`나 `[...list]`로 바꾼다.

## 탐색: 노드와 요소

`<p>나는 <em>정말</em> 좋다</p>`에서 `p`의 **요소(element)** 자식은 `em` 하나지만, **노드(node)** 자식은 텍스트·`em`·텍스트 셋이다. 태그로 감싼 것만 요소이고, 텍스트·주석까지 모두 노드다.

| 방향 | 요소만 | 텍스트 노드 포함 |
| --- | --- | --- |
| 자식 | `children`, `firstElementChild`, `lastElementChild` | `childNodes`, `firstChild`, `lastChild` |
| 형제 | `previousElementSibling`, `nextElementSibling` | `previousSibling`, `nextSibling` |
| 부모 | `parentElement` | `parentNode` |

대부분은 왼쪽(요소) 속성이 필요하다. 다만 `parentElement.parentElement.nextElementSibling`처럼 구조에 기대어 이동하면 감싸는 `div` 하나만 생겨도 깨진다. 위로는 **`closest(selector)`**, 아래로는 `querySelector`로 찾는다.

```javascript
const card = button.closest('.card')    // 자기 자신부터 위로 올라가며 첫 일치(없으면 null)
button.matches('.danger')               // 이 요소가 선택자와 일치하나(boolean)
card.contains(button)                   // 자손인가(boolean)
```

## 속성(property)과 어트리뷰트(attribute)

요소는 객체다. `console.dir(el)`로 보면 `textContent`, `parentElement` 같은 속성이 보이고, 대부분 읽기(getter)와 쓰기(setter)가 모두 된다.

```javascript
img.alt = '웃는 강아지'                   // 표준 속성은 점 표기로
img.getAttribute('alt'); img.hasAttribute('alt'); img.setAttribute('alt', '…')
img.naturalWidth                         // 읽기 전용. 이미지가 받아지기 전에는 0
img.addEventListener('load', () => console.log(img.naturalWidth))
```

- 이미지 크기처럼 **리소스가 받아진 뒤에야 정해지는 값**은 그 요소의 `load` 이벤트 뒤에 읽는다.
- 표준에 없는 어트리뷰트를 임의로 만들지 않는다. 나중에 같은 이름의 표준 속성이 생기면 충돌한다. 직접 정의할 데이터는 **`data-*`** 에 넣고 `dataset`으로 읽는다. `data-price="100"`은 `el.dataset.price`(문자열 `'100'`)가 되고, `data-user-id`는 `dataset.userId`로 camelCase가 된다. 숫자는 `Number()`로 바꾼다.

### classList

```javascript
el.classList.add('open', 'active')
el.classList.remove('active')
el.classList.toggle('round')              // 있으면 빼고 없으면 넣는다
el.classList.toggle('hidden', !isVisible) // 두 번째 인자로 강제
el.classList.contains('open')             // boolean
el.classList.replace('old', 'new')
```

인터랙션의 상당수는 **JavaScript가 클래스만 바꾸고, 모양과 전환 효과는 CSS가 맡는** 구조다. 스타일을 `el.style`로 하나씩 바꾸기보다 클래스를 토글한다.

## 내용 변경: textContent, innerText, innerHTML

| 속성 | 동작 |
| --- | --- |
| `textContent` | `<script>`·`<style>`·숨긴 요소까지 포함한 원본 텍스트. 레이아웃을 계산하지 않아 빠르다 |
| `innerText` | 화면에 보이는 텍스트만. 스타일을 반영하므로 읽을 때 레이아웃 계산을 일으킨다 |
| `innerHTML` / `outerHTML` | 요소 안(바깥 태그 포함)의 HTML을 문자열로 읽고 쓴다 |

텍스트를 넣을 때는 `textContent`를 쓴다. `innerHTML`에 사용자 입력을 그대로 넣으면 XSS가 된다([[web-security|웹 보안]]).

## 생성과 삽입

```javascript
const li = document.createElement('li') // 메모리에만 있다. 아직 화면에 없다
li.textContent = '부산'
li.classList.add('city')

ul.append(li, '텍스트')                  // 마지막 자식으로. 노드·문자열 여러 개
ul.prepend(li)                          // 첫 자식으로
ref.before(li); ref.after(li)           // 형제로
old.replaceWith(li)
const copy = li.cloneNode(true)         // true여야 자식(텍스트 포함)까지 복제
```

| 위치 지정 메서드 | 넣는 것 |
| --- | --- |
| `insertAdjacentElement(pos, el)` | 요소 |
| `insertAdjacentText(pos, text)` | 텍스트(전체를 다시 쓰지 않고 덧붙인다) |
| `insertAdjacentHTML(pos, html)` | HTML 문자열(XSS 주의) |

`pos`는 `beforebegin`(앞 형제) · `afterbegin`(첫 자식) · `beforeend`(마지막 자식) · `afterend`(뒤 형제)다. `appendChild`는 노드 하나만 받고 그 노드를 반환하는 옛 API다. 이미 문서에 있는 노드를 다시 넣으면 복사가 아니라 **이동**한다.

### 한 번에 넣기

문서에 붙은 요소를 여러 번 고치면 브라우저가 매번 레이아웃을 다시 계산할 수 있다([[browser-rendering|브라우저 렌더링 과정]]). **문서 밖에서 다 만든 뒤 한 번에 붙인다.**

```javascript
const fragment = document.createDocumentFragment()
for (const city of cities) {
  const li = document.createElement('li')
  li.textContent = city
  fragment.append(li)
}
ul.append(fragment) // 삽입은 한 번
```

### 문자열에서 요소 만들기

템플릿 리터럴로 HTML을 쓰면 짧고 값을 끼워 넣기 쉽다. 하지만 문자열은 요소가 아니어서 `classList`·리스너를 붙일 수 없다. 문서에 넣기 전에 요소로 다루려면 파싱한다.

```javascript
const fragment = document.createRange().createContextualFragment(html)
fragment.querySelector('img').addEventListener('load', onLoad)
container.append(fragment)
```

반복되는 마크업은 HTML의 `<template>`에 두고 `template.content.cloneNode(true)`로 복제하는 방법도 있다. 문자열에 사용자 입력이 섞이면 어느 방법이든 XSS 위험이 같다.

## 삭제

```javascript
li.remove()          // 자기 자신을 트리에서 뺀다
ul.replaceChildren() // 자식 전부 비우기
```

뺀 노드도 변수가 참조하고 있으면 메모리에 남아 있어 다시 붙일 수 있다. 반대로, 지운 노드를 계속 참조하면 가비지 컬렉션되지 않는다.

## 이벤트 받기

```javascript
target.addEventListener(type, listener[, options])

function handleClick(event) {
  console.log(event.currentTarget) // 리스너가 붙은 요소
}
btn.addEventListener('click', handleClick)    // 함수를 호출하지 말고 참조를 넘긴다
btn.removeEventListener('click', handleClick) // 같은 함수 참조여야 지워진다

buttons.forEach((b) => b.addEventListener('click', handleClick)) // NodeList에는 직접 못 붙인다
```

- 모든 노드는 `EventTarget`을 상속하므로 요소·`document`·`window` 모두 리스너를 받는다.
- `handleClick()`처럼 괄호를 붙이면 등록 시점에 바로 실행된다.
- 익명 함수로 등록한 리스너는 지울 수 없다. 지울 일이 있으면 이름 있는 함수나 `signal` 옵션을 쓴다.
- 리스너는 첫 인자로 **이벤트 객체**를 받는다. `target`·`currentTarget`의 차이, 버블링·캡처, `preventDefault`·`stopPropagation`, 이벤트 위임, `once`·`passive`·`signal` 옵션, 커스텀 이벤트는 [[dom-events|DOM 이벤트]]에서 다룬다.

React에서는 JSX 속성에 함수를 넘긴다(`onClick={handleClick}`) → [[react-events|React 이벤트 처리]].

## 핵심 정리

- 선택은 `querySelector`/`querySelectorAll`. 어느 요소에서나 불러 범위를 좁힐 수 있다.
- 탐색은 구조에 기대지 말고 `closest`(위)·`querySelector`(아래)로.
- 사용자 정의 데이터는 `data-*`와 `dataset`, 클래스는 `classList`.
- `createElement` → 문서 밖에서 조립 → `append`·`insertAdjacentElement`로 한 번에 삽입 → `remove`.
- 텍스트는 `textContent`, HTML 문자열은 XSS를 알고 쓴다.

관련 노트: [[dom|DOM과 BOM]], [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]], [[react-events|React 이벤트 처리]], [[debounce-throttle|Debounce와 Throttle]], [[web-security|웹 보안]]
