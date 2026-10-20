---
title: "DOM 조작"
concept: "DOM API"
summary: "JavaScript로 DOM 요소를 선택·탐색하고(live·static 컬렉션, 표 탐색 속성), 노드의 내용(innerHTML+=의 함정, outerHTML 대입, textContent)을 다루고, 속성(property)과 어트리뷰트(attribute)의 동기화 규칙, 클래스와 인라인 스타일·계산된 스타일을 읽고 쓰고, 요소를 만들어 원하는 위치에 넣고 지우는 방법. 문자열 HTML을 넣는 법과 위험, 리플로우를 줄이는 일괄 삽입까지 다룬다."
tags: ["javascript", "dom", "browser", "event", "frontend"]
source: mixed
date: "2026-10-20"
sources: ["https://ko.javascript.info/dom-navigation", "https://ko.javascript.info/searching-elements-dom", "https://ko.javascript.info/basic-dom-node-properties", "https://ko.javascript.info/dom-attributes-and-properties", "https://ko.javascript.info/modifying-document", "https://ko.javascript.info/styles-and-classes", "https://wesbos.com/javascript/04-the-dom/selecting-elements", "https://wesbos.com/javascript/04-the-dom/element-properties-and-methods", "https://wesbos.com/javascript/04-the-dom/working-with-classes", "https://wesbos.com/javascript/04-the-dom/built-in-and-custom-data-attributes", "https://wesbos.com/javascript/04-the-dom/creating-html", "https://wesbos.com/javascript/04-the-dom/html-from-strings-and-xss", "https://wesbos.com/javascript/04-the-dom/traversing-and-removing-nodes", "https://wesbos.com/javascript/05-events/event-listener"]
---

> TIL을 정리하고, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)를 함께 참고했다. 탐색·검색·노드 속성·어트리뷰트·문서 수정·스타일은 javascript.info(모던 JavaScript 튜토리얼)의 「DOM 탐색하기」, 「getElement*, querySelector*로 요소 검색하기」, 「주요 노드 프로퍼티」, 「속성과 프로퍼티」, 「문서 수정하기」, 「스타일과 클래스」 글로 보강했다.

DOM 조작은 항상 **① 선택(select) → ② 변경(manipulation)** 두 단계이고, 사용자의 행동에 반응하려면 여기에 **③ 이벤트 리스너**를 붙인다. DOM의 개념과 노드 구조는 [[dom|DOM과 BOM]], 이벤트 전파·위임은 [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]]에 있다.

## 선택

| 메서드 | 반환 |
| --- | --- |
| `querySelector(selector)` | CSS 선택자와 일치하는 **첫 번째** 요소(없으면 `null`) |
| `querySelectorAll(selector)` | 일치하는 모든 요소의 **NodeList**(static) |
| `getElementById(id)` | 단일 요소. `#` 없이 id만 넘긴다 |
| `getElementsByTagName`·`getElementsByClassName` | HTMLCollection(live) |

- `getElementById`는 **`document`에만** 있다. `id`는 문서에서 유일해야 하며, 겹치면 무엇이 반환될지 정해져 있지 않다.
- `id`가 있는 요소는 같은 이름의 전역 변수(`window.elem`)로도 접근된다. 하위 호환용 동작이라 같은 이름의 변수가 선언되면 가려지고, 코드만 봐서는 출처를 알 수 없다. 쓰지 않는다.
- `querySelector`는 찾는 즉시 멈추므로 `querySelectorAll(css)[0]`보다 빠르다.
- `:hover`·`:checked` 같은 가상 클래스도 된다. `querySelectorAll(':hover')`는 포인터 아래 요소들을 바깥(`html`)부터 준다.
- `getElementsBy*`는 이름의 `s`대로 **컬렉션**을 돌려준다. `getElementsByTagName('input').value = 5`는 아무 일도 하지 않는다. `[0]`이나 반복으로 요소를 꺼낸다. `getElementsByName`은 `document`에만 있고 거의 쓰지 않는다.

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

```javascript
const live = document.getElementsByTagName('div')    // 나중에 div가 추가되면 length가 늘어난다
const fixed = document.querySelectorAll('div')       // 호출한 순간의 목록에서 변하지 않는다
```

- DOM 컬렉션과 탐색 속성은 **읽기 전용**이다. `childNodes[0] = …`로 바꿀 수 없고 삽입·삭제 메서드를 쓴다.
- 이터러블이라 `for...of`로 돈다. `for...in`은 `length`·`item` 같은 속성까지 열거하므로 쓰지 않는다.

## 탐색: 노드와 요소

`<p>나는 <em>정말</em> 좋다</p>`에서 `p`의 **요소(element)** 자식은 `em` 하나지만, **노드(node)** 자식은 텍스트·`em`·텍스트 셋이다. 태그로 감싼 것만 요소이고, 텍스트·주석까지 모두 노드다.

| 방향 | 요소만 | 텍스트 노드 포함 |
| --- | --- | --- |
| 자식 | `children`, `firstElementChild`, `lastElementChild` | `childNodes`, `firstChild`, `lastChild` |
| 형제 | `previousElementSibling`, `nextElementSibling` | `previousSibling`, `nextSibling` |
| 부모 | `parentElement` | `parentNode` |

트리 꼭대기는 `document`가 바로 준다. `document.documentElement`는 `<html>`, `document.head`는 `<head>`, `document.body`는 `<body>`다. `<head>` 안의 동기 스크립트가 실행될 때는 아직 `<body>`를 읽지 않아 `document.body`가 `null`이다. DOM에서 `null`은 「그런 노드가 없다」는 뜻이다.

`parentNode`와 `parentElement`는 거의 늘 같지만 `<html>`에서 다르다. `<html>`의 부모 `document`는 요소가 아니어서 `parentElement`는 `null`이다. 그래서 `while ((el = el.parentElement))`는 `<html>`까지만 올라간다. 자식 노드가 있는지는 `hasChildNodes()`로 본다.

대부분은 왼쪽(요소) 속성이 필요하다. 다만 `parentElement.parentElement.nextElementSibling`처럼 구조에 기대어 이동하면 감싸는 `div` 하나만 생겨도 깨진다. 위로는 **`closest(selector)`**, 아래로는 `querySelector`로 찾는다.

```javascript
const card = button.closest('.card')    // 자기 자신부터 위로 올라가며 첫 일치(없으면 null)
button.matches('.danger')               // 이 요소가 선택자와 일치하나(boolean)
card.contains(button)                   // 자손인가(boolean)
```

### 표 탐색 속성

표 요소는 편의 속성을 더 가진다.

| 요소 | 속성 |
| --- | --- |
| `<table>` | `rows`(모든 `<tr>`), `caption`·`tHead`·`tFoot`, `tBodies` |
| `<thead>`·`<tbody>`·`<tfoot>` | `rows` |
| `<tr>` | `cells`(`<td>`·`<th>`), `rowIndex`(표 전체에서 몇 번째 줄), `sectionRowIndex`(그 구역 안에서) |
| `<td>`·`<th>` | `cellIndex` |

`table.rows[0].cells[1]`처럼 쓴다. HTML에 `<tbody>`를 생략해도 파서가 DOM에 `<tbody>`를 넣는다는 점에 주의한다([[dom|DOM과 BOM]]). 폼에도 `form.elements` 같은 전용 탐색 속성이 있다([[form-controls-dom|폼 컨트롤과 포커스 이벤트]]).

## 속성(property)과 어트리뷰트(attribute)

요소는 객체다. `console.dir(el)`로 보면 `textContent`, `parentElement` 같은 속성이 보이고, 대부분 읽기(getter)와 쓰기(setter)가 모두 된다.

```javascript
img.alt = '웃는 강아지'                   // 표준 속성은 점 표기로
img.getAttribute('alt'); img.hasAttribute('alt'); img.setAttribute('alt', '…')
img.naturalWidth                         // 읽기 전용. 이미지가 받아지기 전에는 0
img.addEventListener('load', () => console.log(img.naturalWidth))
```

- 이미지 크기처럼 **리소스가 받아진 뒤에야 정해지는 값**은 그 요소의 `load` 이벤트 뒤에 읽는다.
브라우저는 HTML을 파싱할 때 **그 요소의 표준 어트리뷰트만** 같은 이름의 DOM 속성으로 만든다. `<body something="x">`의 `body.something`은 `undefined`다. `type`은 `<input>`에서는 표준이지만 `<body>`에서는 아니다. 표준이 아닌 것은 `getAttribute`로만 읽힌다. `el.attributes`는 모든 어트리뷰트를 `name`·`value`를 가진 `Attr` 객체 컬렉션으로 준다.

| | DOM 속성(property) | 어트리뷰트(attribute) |
| --- | --- | --- |
| 사는 곳 | DOM 객체 | HTML |
| 값의 타입 | 무엇이든. 표준 속성은 명세가 정한 타입 | 항상 **문자열**(`setAttribute('n', 123)` → `'123'`) |
| 이름 | 대소문자를 가린다 | 가리지 않는다(`getAttribute('ID')` = `id`) |

대부분 한쪽을 바꾸면 다른 쪽도 바뀐다. 예외와 차이를 알아 둔다.

| 경우 | 동작 |
| --- | --- |
| `id`, `alt`, `title` 등 | 양방향으로 동기화된다 |
| `input.value` | 어트리뷰트 → 속성으로만. 사용자가 입력하거나 `input.value`를 바꿔도 `getAttribute('value')`는 **처음 값**을 그대로 준다. 원래 값으로 되돌릴 때 쓸 수 있다(`defaultValue`도 같은 값) |
| `checked` | 속성은 불리언 `true`, 어트리뷰트는 빈 문자열 `''`. 현재 체크 상태는 속성에만 있다 |
| `style` | 속성은 `CSSStyleDeclaration` 객체, 어트리뷰트는 문자열 |
| `href` | 속성은 **절대 URL**(`https://site.com/page#hello`), 어트리뷰트는 적힌 그대로(`#hello`) |

거의 언제나 DOM 속성을 쓴다. HTML에 **적힌 그대로의 값**이 필요할 때와 비표준 어트리뷰트를 읽을 때만 `getAttribute`를 쓴다. DOM 노드는 일반 객체라 `el.myData = {…}`처럼 아무 속성이나 붙일 수 있지만, 그건 HTML과 무관한 JavaScript 속성일 뿐이다.

- 표준에 없는 어트리뷰트를 임의로 만들지 않는다. 나중에 같은 이름의 표준 속성이 생기면 충돌한다. 직접 정의할 데이터는 **`data-*`** 에 넣고 `dataset`으로 읽는다. `data-price="100"`은 `el.dataset.price`(문자열 `'100'`)가 되고, `data-user-id`는 `dataset.userId`로 camelCase가 된다. 숫자는 `Number()`로 바꾼다. `dataset`에 쓰면 어트리뷰트도 바뀌어 `[data-state="pending"]` 같은 CSS 선택자가 바로 반응한다. 상태를 클래스 여러 개 대신 `data-state` 하나로 바꾸면 토글 코드가 단순해진다.

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

`className`은 `class` 어트리뷰트 문자열 전체다. 대입하면 모든 클래스가 바뀐다. 옛 JavaScript에서 `class` 같은 예약어를 속성 이름으로 쓸 수 없어 생긴 이름이다. 클래스 하나를 다룰 때는 `classList`를 쓰고, `classList`는 이터러블이라 `for...of`로 돈다.

## 스타일 읽고 쓰기

### 인라인 스타일 쓰기

`el.style`은 `style` 어트리뷰트에 대응하는 객체다. **런타임에 계산해야 하는 값**(드래그 좌표, 측정한 높이)만 여기에 쓰고, 나머지는 클래스로 한다.

```javascript
el.style.left = `${x}px`                // 단위를 붙인다. el.style.left = 10 은 무시된다
el.style.backgroundColor = 'tomato'      // background-color → camelCase
el.style.setProperty('--progress', '40%') // CSS 변수와 대시 이름은 setProperty로
el.style.display = ''                    // 빈 문자열: 인라인 값을 지워 CSS 규칙·기본값으로 되돌린다
el.style.cssText = 'color: red; width: 100px' // 인라인 스타일 전체를 통째로 바꾼다
```

- 여러 단어 속성은 camelCase다(`z-index` → `zIndex`). 접두사 속성도 같다(`-webkit-x` → `WebkitX`).
- 인라인 값을 없앨 때 `delete el.style.display`가 아니라 **빈 문자열**을 넣는다.
- `el.style = '…'`처럼 객체에 문자열을 대입하지 않는다. 통째로 바꿀 때는 `cssText`나 `setAttribute('style', …)`를 쓰는데, 기존 인라인 스타일을 모두 지우므로 새로 만든 요소에만 쓴다.
- `el.style.margin = '20px'`처럼 단축 속성을 쓰면 `marginTop`·`marginLeft`도 채워진다.

### 계산된 스타일 읽기

`el.style`은 **인라인 `style` 어트리뷰트만** 읽는다. 스타일시트로 준 색·여백은 빈 문자열이다. 실제 적용된 값은 `getComputedStyle(el, pseudo?)`로 읽는다.

```javascript
const cs = getComputedStyle(document.body)
cs.marginTop                        // '5px'
cs.color                            // 'rgb(255, 0, 0)'
getComputedStyle(el, '::before').content // 가상 요소
```

- 돌려주는 것은 이름과 달리 **결정 값(resolved value)** 이다. `1em`·`125%` 같은 상대값이 `16px`처럼 절대 단위로 풀려 있고, 기하 값은 `50.5px`처럼 소수일 수 있다. 과거 명세는 상대값을 그대로 둔 계산 값(computed value)을 줬다가 쓰기 편한 결정 값으로 바뀌었다.
- `paddingLeft`·`marginTop`처럼 **개별 속성 이름**으로 읽는다. 단축 속성(`padding`, `margin`)을 읽는 결과는 브라우저마다 다를 수 있다.
- 읽기 전용이며, 읽으면 스타일 계산(때로 레이아웃)을 강제한다.
- `:visited` 링크의 색은 읽을 수 없다. 방문 기록을 캐내지 못하게 하려는 개인정보 보호 조치이고, CSS도 `:visited`에 크기를 바꾸는 스타일을 금지한다.
- 요소가 화면에서 차지한 크기는 CSS `width`가 아니라 `offsetWidth`·`getBoundingClientRect()`로 읽는다([[dom-geometry|요소 크기·스크롤·좌표]]).

## 내용 변경: textContent, innerText, innerHTML

| 속성 | 동작 |
| --- | --- |
| `textContent` | `<script>`·`<style>`·숨긴 요소까지 포함한 원본 텍스트. 레이아웃을 계산하지 않아 빠르다 |
| `innerText` | 화면에 보이는 텍스트만. 스타일을 반영하므로 읽을 때 레이아웃 계산을 일으킨다 |
| `innerHTML` / `outerHTML` | 요소 안(바깥 태그 포함)의 HTML을 문자열로 읽고 쓴다 |

텍스트를 넣을 때는 `textContent`를 쓴다. `innerHTML`에 사용자 입력을 그대로 넣으면 XSS가 된다([[web-security|웹 보안]]). `textContent`에 대입하면 `<`·`>`까지 글자 그대로 들어가므로 사용자 입력을 **안전하게 쓰는** 기본 방법이다.

- 틀린 HTML을 `innerHTML`에 넣으면 브라우저가 고쳐서 넣는다(`'<b>test'` → `<b>test</b>`).
- `innerHTML`로 넣은 `<script>`는 **실행되지 않는다.** 그렇다고 XSS가 막히는 것은 아니다. `<img onerror=…>` 같은 속성 핸들러는 실행된다.
- **`el.innerHTML += '…'`는 덧붙이기가 아니라 다시 쓰기**다. `el.innerHTML = el.innerHTML + '…'`와 같아서 기존 내용을 모두 지우고 새로 파싱한다. 이미지가 다시 로드되고, 선택이 풀리고, 입력란의 값과 붙여 둔 리스너가 사라진다. 덧붙일 때는 `insertAdjacentHTML('beforeend', …)`나 `append`를 쓴다.
- **`el.outerHTML = '…'`는 `el`을 바꾸지 않는다.** 문서에서 `el`을 빼고 그 자리에 새 HTML을 넣을 뿐이라, 변수 `el`은 여전히 옛 요소(이제 문서 밖)를 가리킨다. 새 요소가 필요하면 다시 찾는다. 대개 `replaceWith`가 더 명확하다.
- 텍스트·주석 노드에는 `innerHTML`이 없다. 내용은 `data`(또는 거의 같은 `nodeValue`)로 읽고 쓴다. 주석 노드의 `data`로 템플릿 지시(`<!-- if isAdmin -->`)를 읽는 데 쓰기도 한다.
- `hidden` 속성은 `display: none`과 같다(`el.hidden = true`). 단, CSS에서 `display`를 지정하면 그쪽이 이긴다.

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

`pos`는 `beforebegin`(앞 형제) · `afterbegin`(첫 자식) · `beforeend`(마지막 자식) · `afterend`(뒤 형제)다. 이미 문서에 있는 노드를 다시 넣으면 복사가 아니라 **이동**한다. 옮기기 전에 `remove()`할 필요가 없다(`second.after(first)`).

- `append`·`prepend`·`before`·`after`·`replaceWith`에 **문자열을 넘기면 텍스트 노드**가 된다. `div.before('<p>안녕</p>')`는 태그가 아니라 글자 `<p>안녕</p>`를 넣는다. HTML로 해석시키려면 `insertAdjacentHTML`을 쓴다. 실무에서 `insertAdjacentText`·`insertAdjacentElement`는 `append` 계열로 대신할 수 있어 거의 `insertAdjacentHTML`만 쓴다.
- 함수가 노드 배열을 돌려주면 `ul.append(...nodes)`로 펼쳐 넣는다. `DocumentFragment`를 꼭 쓰지 않아도 된다.

| 옛 메서드 | 지금 쓰는 것 |
| --- | --- |
| `parent.appendChild(node)` | `parent.append(node)` |
| `parent.insertBefore(node, next)` (`next`가 `null`이면 끝에) | `next.before(node)` |
| `parent.replaceChild(newNode, old)` | `old.replaceWith(newNode)` |
| `parent.removeChild(node)` | `node.remove()` |

옛 메서드는 노드 하나만 받고 넣거나 뺀 노드를 반환한다. 오래된 코드에서 만난다.

**`document.write(html)`** 는 DOM 표준 이전부터 있던 메서드로, 파싱 중인 그 자리에 HTML을 끼워 넣는다. 페이지 로딩이 끝난 뒤 부르면 **문서 전체를 지우고** 새로 쓴다. 비동기 스크립트에서는 무시되고 파서를 막아 느리므로 쓰지 않는다.

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

요소에 리스너를 붙이는 `addEventListener`와 지우는 법, 전파·위임·옵션은 [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]]에 있다. 노드가 어떤 종류인지(`nodeType`·`nodeName`·`tagName`) 확인하는 법은 [[dom|DOM과 BOM]]에 있다.

## 핵심 정리

- 선택은 `querySelector`/`querySelectorAll`. 어느 요소에서나 불러 범위를 좁힐 수 있다.
- 탐색은 구조에 기대지 말고 `closest`(위)·`querySelector`(아래)로.
- 사용자 정의 데이터는 `data-*`와 `dataset`, 클래스는 `classList`.
- `createElement` → 문서 밖에서 조립 → `append`·`insertAdjacentElement`로 한 번에 삽입 → `remove`.
- 텍스트는 `textContent`, HTML 문자열은 XSS를 알고 쓴다. `innerHTML +=`는 전체를 다시 쓴다.
- 거의 언제나 DOM 속성을 쓰고, 적힌 원래 값·비표준 어트리뷰트만 `getAttribute`로 읽는다. `input.value`는 어트리뷰트로 되돌아가지 않는다.
- 스타일은 클래스로 바꾸고, 계산이 필요한 값만 `style`에 단위와 함께 쓴다. 적용된 값은 `getComputedStyle`로 읽는다.

관련 노트: [[dom|DOM과 BOM]], [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]], [[dom-geometry|요소 크기·스크롤·좌표]], [[mutation-observer|MutationObserver]], [[selection-and-range|Selection과 Range]], [[react-events|React 이벤트 처리]], [[debounce-throttle|Debounce와 Throttle]], [[web-security|웹 보안]]
