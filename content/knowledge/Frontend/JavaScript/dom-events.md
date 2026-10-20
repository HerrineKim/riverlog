---
title: "DOM 이벤트: 전파, 위임, 커스텀 이벤트"
concept: "DOM Events"
summary: "DOM 이벤트는 캡처 → 타깃 → 버블 순서로 트리를 오간다. 핸들러를 붙이는 세 방법(HTML 속성·on 속성·addEventListener)과 handleEvent 객체, target과 currentTarget의 차이, 전파·기본 동작 제어와 stopPropagation 대신 defaultPrevented로 알리기, 부모 하나로 자식 이벤트를 받는 이벤트 위임과 data 속성 행동 패턴, once·passive·signal 옵션, Event·CustomEvent 생성과 dispatchEvent의 동기 실행, 바깥 클릭 감지 패턴을 정리한다."
tags: ["javascript", "dom", "event", "browser", "frontend"]
source: other
date: "2026-10-20"
sources: ["https://ko.javascript.info/introduction-browser-events", "https://ko.javascript.info/bubbling-and-capturing", "https://ko.javascript.info/event-delegation", "https://ko.javascript.info/default-browser-action", "https://ko.javascript.info/dispatch-events", "https://wesbos.com/javascript/05-events/event-listener", "https://wesbos.com/javascript/05-events/targets-bubbling-propagation-and-capture", "https://wesbos.com/javascript/05-events/prevent-default-and-form-events", "https://wesbos.com/javascript/05-events/accessibility-gotchas-and-keyboard-codes", "https://wesbos.com/javascript/06-serious-practice-exercises/click-outside-modal", "https://wesbos.com/javascript/10-harder-practice-exercises/57-shopping-form-with-custom-events-delegation-and-localstorage", "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog"]
---

> Wes Bos의 「[Beginner JavaScript](https://wesbos.com/javascript)」 강의 노트를 바탕으로, 옵션과 브라우저 지원은 MDN으로 확인해 재구성한 노트다. 핸들러 할당 방식, 기본 동작, 이벤트 생성은 javascript.info(모던 JavaScript 튜토리얼)의 「브라우저 이벤트 소개」, 「버블링과 캡처링」, 「이벤트 위임」, 「브라우저 기본 동작」, 「커스텀 이벤트 디스패치」 글로 보강했다.

## DOM 이벤트란

요소는 클릭·입력·스크롤처럼 무언가 일어날 때 **이벤트**를 내보낸다. 이벤트는 DOM 노드에만 있지 않다. `window`, `XMLHttpRequest`, `WebSocket`처럼 `EventTarget`을 상속한 객체는 모두 이벤트를 낸다. `addEventListener(type, listener)`로 함수를 넘겨 두면 브라우저가 그때 함수를 호출한다. 이 노트는 리스너를 붙이는 법과, 이벤트가 **트리를 어떻게 이동하고 그 흐름을 어떻게 다루는지**를 다룬다. 입력 장치별 이벤트는 [[ui-input-events|마우스·포인터·키보드 이벤트]]에, 폼 이벤트는 [[form-controls-dom|폼 컨트롤과 포커스 이벤트]]에, 문서 로딩 이벤트는 [[page-lifecycle-events|페이지 생명주기와 리소스 로딩 이벤트]]에 있다.

## 핸들러를 붙이는 세 가지 방법

| 방법 | 예 | 특징 |
| --- | --- | --- |
| HTML 속성 | `<button onclick="save()">` | 브라우저가 속성값을 **함수 본문**으로 삼아 `function (event) { save() }`를 만든다. 그래서 괄호가 필요하고 `event`를 쓸 수 있다. 긴 코드를 넣기 어렵고 HTML과 JS가 섞인다 |
| DOM `on<event>` 속성 | `btn.onclick = save` | 속성이 하나라 **핸들러를 하나만** 둘 수 있다. 다시 대입하면 앞의 것을 덮어쓴다. `null`을 넣으면 지워진다 |
| `addEventListener` | `btn.addEventListener('click', save)` | 여러 개를 붙일 수 있고 옵션을 받는다. 같은 요소·같은 단계의 리스너는 **붙인 순서대로** 실행된다 |

HTML 속성 방식은 결국 DOM 속성에 함수를 대입하는 것과 같다. 둘 다 `addEventListener`와는 별개로 공존한다.

- `btn.onclick = save()`라고 쓰면 등록 시점에 `save`를 호출하고 그 **반환값**(대개 `undefined`)을 넣는다. 함수 참조를 넘긴다.
- `setAttribute('onclick', fn)`은 함수를 문자열로 바꿔 버려 동작하지 않는다.
- DOM 속성은 대소문자를 가린다. `elem.onclick`은 되고 `elem.ONCLICK`은 안 된다(HTML 속성은 가리지 않는다).
- `on<event>` 속성이 **없는** 이벤트가 있다. `DOMContentLoaded`, `focusin`·`focusout`, 그리고 모든 커스텀 이벤트는 `addEventListener`로만 받는다.
- `querySelectorAll`이 돌려준 `NodeList`에는 리스너를 직접 붙일 수 없다. `forEach`로 하나씩 붙이거나 부모 하나에 위임한다(아래 「이벤트 위임」).
- React에서는 JSX 속성에 함수를 넘긴다(`onClick={handleClick}`) → [[react-events|React 이벤트 처리]].
- `document`나 `window`에 전역 리스너를 둘 때는 다른 코드의 핸들러를 덮어쓰지 않도록 항상 `addEventListener`를 쓴다.

### 핸들러 안의 this와 handleEvent 객체

일반 함수 핸들러의 `this`는 `event.currentTarget`(핸들러가 붙은 요소)이다. 화살표 함수나 `bind`한 함수는 `this`가 바뀌므로 `event.currentTarget`을 쓴다([[functions|함수와 this]]).

`addEventListener`에는 함수 대신 **`handleEvent` 메서드를 가진 객체**도 넘길 수 있다. 이벤트가 오면 `obj.handleEvent(event)`가 불리고 `this`는 그 객체다. 한 컴포넌트가 여러 이벤트를 받을 때 메서드로 나눠 보낼 수 있다.

```javascript
class Menu {
  handleEvent(event) {
    const method = `on${event.type[0].toUpperCase()}${event.type.slice(1)}` // 'onMousedown'
    this[method]?.(event)
  }
  onMousedown() { /* … */ }
  onMouseup() { /* … */ }
}
const menu = new Menu()
elem.addEventListener('mousedown', menu)
elem.addEventListener('mouseup', menu)
```

`bind` 없이 `this`가 인스턴스를 가리키고, 지울 때도 같은 객체를 넘기면 된다.

## 전파: 캡처 → 타깃 → 버블

버튼 안의 `<strong>`을 클릭하면 `strong`만 클릭된 것이 아니다. 버튼, `body`, `html`, `document`, `window`도 함께 클릭된 것으로 본다. 이벤트는 세 단계로 트리를 오간다.

```text
window → document → html → body → button → strong   ① 캡처: 위에서 아래로 내려간다
                                            strong   ② 타깃: 실제로 클릭된 요소
strong → button → body → html → document → window   ③ 버블: 아래에서 위로 올라간다
```

- 리스너는 기본적으로 **버블 단계**에서 실행된다. 그래서 안쪽 요소의 리스너가 먼저, 바깥 요소의 리스너가 나중에 실행된다.
- 세 번째 인자에 `{ capture: true }`를 주면 캡처 단계에서 실행된다. 바깥 요소가 안쪽보다 먼저 이벤트를 가로채야 할 때 쓴다. 과거에는 세 번째 인자로 불리언(`true`)을 넘겼다.
- 모든 이벤트가 버블링하지는 않는다. `focus`·`blur`, `mouseenter`·`mouseleave`, `load`는 올라가지 않는다. 부모에서 포커스 변화를 받으려면 버블링하는 `focusin`·`focusout`을 쓴다. 이벤트 종류가 버블링하는지는 `event.bubbles`로 알 수 있다.
- 타깃 요소 자신에서는 캡처 리스너와 버블 리스너가 모두 실행된다. 지금 어느 단계인지는 `event.eventPhase`(1 캡처, 2 타깃, 3 버블)로 알 수 있지만, 리스너를 어느 단계에 붙였는지로 이미 알기 때문에 잘 쓰지 않는다.
- 문서 안 노드의 이벤트 경로는 `document` 다음 `window`까지 이어진다. 예외는 `load`다. 이미지의 `load`가 `window`의 리스너에 닿지 않도록 경로에서 `window`가 빠진다.

캡처를 기본으로 쓰지 않는 데는 이유가 있다. 사건은 그 지역을 가장 잘 아는 곳이 먼저 처리하고, 필요할 때만 위로 넘긴다. `<td>`에 붙은 핸들러가 그 칸에 무엇을 해야 할지 가장 잘 알기 때문에 먼저 기회를 받는다.

### target과 currentTarget

| 속성 | 가리키는 것 | `<button><strong>1</strong></button>`의 `1`을 클릭하면 |
| --- | --- | --- |
| `event.target` | 실제로 이벤트가 시작된 가장 안쪽 요소 | `strong` |
| `event.currentTarget` | 지금 실행 중인 리스너가 붙은 요소 | `button` |

리스너를 붙인 요소의 `dataset`이나 `href`를 읽을 때는 `currentTarget`을 쓴다. `target`은 안쪽 자식일 수 있다. `currentTarget`은 리스너가 실행되는 동안에만 값이 있으므로, 비동기 코드에서 쓰려면 먼저 변수에 담는다.

### 전파와 기본 동작 막기

| 메서드 | 막는 것 | 쓰임 |
| --- | --- | --- |
| `event.preventDefault()` | 요소의 **기본 동작**. 전파는 그대로 | 링크 이동, 폼 제출 새로고침, 방향키 스크롤 |
| `event.stopPropagation()` | 다음 요소로의 **전파**. 기본 동작은 그대로 | 카드 안 버튼 클릭이 카드 클릭으로 번지지 않게 |
| `event.stopImmediatePropagation()` | 전파 + **같은 요소의 나머지 리스너** | 같은 요소에 붙은 다른 리스너까지 멈춰야 할 때 |

캡처 단계에서 `stopPropagation()`을 부르면 이벤트가 타깃까지 내려가지도 못한다. `stopPropagation()`은 쉽게 남용된다. 바깥에서 이벤트를 듣는 분석 도구, 바깥 클릭 감지, 이벤트 위임이 모두 조용히 깨지므로, 먼저 `event.target`을 검사해 분기할 수 없는지 본다.

## 브라우저 기본 동작

많은 이벤트에는 브라우저가 알아서 하는 **기본 동작**이 붙어 있다.

| 이벤트 | 기본 동작 |
| --- | --- |
| 링크 `click` | `href`로 이동 |
| `submit` | 폼을 서버로 보내고 페이지 이동 |
| 체크박스 `click` | 체크 상태 바꾸기 |
| `mousedown` | 텍스트 선택 시작, 포커스 이동 |
| `keydown` | 글자 입력, 스크롤, 브라우저 단축키 |
| `contextmenu` | 브라우저 컨텍스트 메뉴 |
| `wheel`·`touchmove` | 스크롤 |

막는 방법은 `event.preventDefault()`다. `on<event>` 속성으로 붙인 핸들러에서는 `return false`도 같은 효과다. 핸들러의 반환값은 원래 무시되며 이것만 예외다. `addEventListener` 리스너에서는 `return false`가 아무 일도 하지 않는다.

- **후속 이벤트도 함께 사라진다.** `mousedown`이 포커스를 일으키므로 `mousedown`의 기본 동작을 막으면 클릭으로는 입력란에 포커스되지 않는다.
- 이벤트가 일어난 **뒤에** 오는 이벤트는 막을 수 없다. `scroll`·`input`·`blur`는 이미 일이 끝난 뒤라 `preventDefault()`가 소용없다. 막으려면 원인 이벤트(`wheel`·`keydown`, `beforeinput`, `mousedown`)에서 막는다.
- 기본 동작을 막는다고 요소의 의미를 바꿔도 되는 것은 아니다. `<a>`는 이동, `<button>`은 동작에 쓴다. 링크처럼 보이게 꾸민 버튼에는 「새 탭에서 열기」 같은 링크 기능이 없다.

### stopPropagation 대신 defaultPrevented

`event.defaultPrevented`는 앞선 리스너가 `preventDefault()`를 불렀으면 `true`다. 「이 이벤트는 이미 처리됐다」는 신호로 쓰면 전파를 끊지 않고도 바깥 리스너가 물러서게 할 수 있다.

```javascript
button.addEventListener('contextmenu', (e) => {
  e.preventDefault()          // 브라우저 메뉴 대신
  showButtonMenu(e)           // 버튼 전용 메뉴
})
document.addEventListener('contextmenu', (e) => {
  if (e.defaultPrevented) return // 안쪽에서 이미 처리했으면 문서 메뉴는 띄우지 않는다
  e.preventDefault()
  showDocumentMenu(e)
})
```

`stopPropagation()`으로 막았다면 문서 수준의 클릭 분석 코드가 버튼 위에서 죽은 영역(dead zone)이 된다. `preventDefault()`와 `stopPropagation()`은 서로 관련이 없는 별개의 메서드다.

## 이벤트 위임

항목마다 리스너를 붙이는 대신 **공통 부모 하나에 리스너를 붙이고, 어느 자식에서 시작됐는지 `target`으로 가려내는** 방법이다. 버블링이 있어서 가능하다.

```javascript
list.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]')
  if (!button || !list.contains(button)) return // 다른 곳 클릭은 무시
  deleteItem(button.dataset.id)
})
```

| 장점 | 설명 |
| --- | --- |
| **나중에 생긴 요소도 동작한다** | `innerHTML`로 목록을 다시 그려도 부모의 리스너는 그대로다. 항목마다 다시 붙일 필요가 없다 |
| 리스너 수가 줄어든다 | 항목 1,000개에도 리스너는 하나다 |
| 정리가 쉽다 | 지울 리스너도 하나뿐이다 |

- `event.target.matches('button')`은 버튼 안 아이콘·`<strong>`을 클릭하면 실패한다. **`closest()`로 위로 올라가며 찾는 편이 안전하다.**
- 항목 식별자는 `data-*` 속성에 넣어 두고 `dataset`으로 읽는다([[html#data-* 속성|HTML 기초와 HTML5]]).
- 중첩된 같은 구조(표 안의 표) 바깥의 요소가 잡힐 수 있으므로 `container.contains(found)`로 범위를 확인한다.
- 버블링하지 않는 이벤트(`focus`·`blur`, `mouseenter`·`mouseleave`)는 위임할 수 없다. `focusin`·`focusout`, `mouseover`·`mouseout`이나 캡처 단계를 쓴다. 안쪽에서 `stopPropagation()`하면 위임도 끊긴다.

### data 속성으로 동작 선언하기

위임을 넓히면 HTML에 **동작을 선언**하는 패턴이 된다. 요소에 `data-action`·`data-toggle-id` 같은 속성을 달고, 그 속성을 해석하는 리스너를 컨테이너나 `document`에 하나 둔다.

```html
<div class="toolbar">
  <button data-action="save">저장</button>
  <button data-action="search">검색</button>
</div>
<button data-toggle-id="help">도움말 보기</button>
<div id="help" hidden>…</div>
```

```javascript
const actions = { save() { /* … */ }, search() { /* … */ } }
toolbar.addEventListener('click', (e) => {
  const action = e.target.closest('[data-action]')?.dataset.action
  actions[action]?.()
})

document.addEventListener('click', (e) => {
  const id = e.target.closest('[data-toggle-id]')?.dataset.toggleId
  if (!id) return
  const target = document.getElementById(id)
  target.hidden = !target.hidden
})
```

버튼을 추가할 때 JavaScript를 고치지 않고 HTML에 속성만 달면 된다. 클래스(`.action-save`)보다 `data-*`가 의도를 잘 드러내고 CSS 선택자로도 쓸 수 있다. 보였다 숨기는 패널처럼 흔한 동작은 지금 `popover` 속성과 `popovertarget` 버튼이 JavaScript 없이 선언적으로 한다.

## 리스너 옵션

```javascript
const controller = new AbortController()

el.addEventListener('click', onClick, { once: true })                       // 한 번 실행 후 자동 제거
window.addEventListener('touchmove', onMove, { passive: true })             // preventDefault를 부르지 않겠다고 약속
window.addEventListener('keyup', onKey, { signal: controller.signal })      // abort()로 한꺼번에 제거
next.addEventListener('click', showNext, { signal: controller.signal })

controller.abort() // 모달을 닫을 때 위 두 리스너를 함께 지운다
```

| 옵션 | 효과 |
| --- | --- |
| `capture` | 캡처 단계에서 실행 |
| `once` | 한 번 실행되면 자동 제거 |
| `passive` | 리스너 안에서 `preventDefault()`를 부르지 않겠다고 브라우저에 알린다. 브라우저가 리스너를 기다리지 않고 바로 스크롤해 버벅임이 줄어든다. 명세상 `window`·`document`·`html`·`body`의 `touchstart`·`touchmove`·`wheel` 리스너는 기본이 passive이므로, 여기서 스크롤을 막으려면 `passive: false`를 명시한다 |
| `signal` | `AbortController`의 `signal`을 넘겨 두면 `abort()` 한 번으로 그 신호에 묶인 리스너를 모두 지운다 |

`removeEventListener`는 등록할 때와 **같은 함수 참조와 같은 `capture` 값**을 넘겨야 지워진다. 익명 함수로 등록한 리스너는 지울 수 없다. 모달·갤러리처럼 열릴 때 `window`에 리스너를 붙이는 UI는 닫힐 때 반드시 지운다. 지우지 않으면 닫힌 뒤에도 키 입력에 반응하고, 열 때마다 리스너가 쌓인다. `signal`이 이 정리를 가장 간단하게 만든다.

## 커스텀 이벤트

`CustomEvent`로 직접 이벤트를 만들어 `dispatchEvent()`로 보낼 수 있다. 상태를 바꾸는 코드와 그 결과에 반응하는 코드(다시 그리기, 저장)를 떼어 놓을 때 쓴다.

```javascript
// 상태를 바꾸는 쪽: 누가 듣는지 모른다
items.push(item)
list.dispatchEvent(new CustomEvent('items-updated', { detail: { items }, bubbles: true }))

// 반응하는 쪽: 필요한 만큼 붙인다
list.addEventListener('items-updated', render)
list.addEventListener('items-updated', saveToStorage)
```

- 데이터는 `detail`에 담는다. 일반 `Event`에 속성을 직접 붙여도 되지만, `detail`은 표준 속성과 이름이 겹칠 걱정이 없고 「커스텀 이벤트」임을 코드로 드러낸다.
- 커스텀 이벤트는 기본으로 **버블링하지 않는다.** 부모나 `document`에서 받으려면 `bubbles: true`를 준다.
- 섀도 루트를 건너는 이벤트는 바깥에서 볼 때 `target`이 호스트 요소로 **다시 지정(retarget)** 된다. 커스텀 이벤트가 섀도 루트 밖으로 나가려면 `bubbles: true`와 `composed: true`가 **둘 다** 필요하다([[web-components|웹 컴포넌트: template·slot·Shadow DOM]]).
- 커스텀 이벤트에는 `on<event>` 속성이 없다. `document.onhello`는 동작하지 않으므로 `addEventListener`로 받는다.
- 코드로 보낸 이벤트는 `event.isTrusted`가 `false`다. 사용자의 실제 입력만 받아야 하는 곳(게임, 결제 확인)에서 구분할 수 있다.

### 이벤트 만들기 옵션

| 생성자 | 쓰는 곳 |
| --- | --- |
| `new Event(type, options)` | 데이터 없는 단순 신호 |
| `new CustomEvent(type, { detail, ...options })` | 데이터를 실어 보내는 내 이벤트 |
| `new MouseEvent('click', { clientX, button, ... })`, `KeyboardEvent`, `FocusEvent`, `PointerEvent` 등 | 내장 이벤트 흉내(테스트 자동화, 서드파티와의 연동). `Event`로 만들면 `clientX` 같은 고유 속성은 무시된다 |

| 옵션 | 기본값 | 의미 |
| --- | --- | --- |
| `bubbles` | `false` | 버블링 여부 |
| `cancelable` | `false` | `preventDefault()`가 먹는지. `false`면 불러도 무시된다 |
| `composed` | `false` | 섀도 루트 경계를 넘는지 |

### 기본 동작을 가진 커스텀 이벤트

내 이벤트에도 「기본 동작」을 줄 수 있다. 보내는 쪽이 `cancelable: true`로 보내고, `dispatchEvent()`가 **`false`를 돌려주면**(어떤 리스너가 `preventDefault()`를 불렀으면) 기본 동작을 건너뛴다.

```javascript
function hide() {
  const ok = panel.dispatchEvent(new CustomEvent('panel-hide', { cancelable: true }))
  if (ok) panel.hidden = true // 아무도 막지 않았을 때만 숨긴다
}
panel.addEventListener('panel-hide', (e) => {
  if (hasUnsavedChanges()) e.preventDefault()
})
```

### dispatchEvent는 동기다

브라우저 이벤트는 큐에 쌓였다가 하나씩 처리되지만, **`dispatchEvent()`는 그 자리에서 바로** 리스너를 모두 실행하고 돌아온다. 핸들러 안에서 다른 이벤트를 보내면 바깥 핸들러는 안쪽 이벤트 처리가 끝날 때까지 멈춘다. `focus()`·`click()`처럼 이벤트를 일으키는 메서드도 같다.

```javascript
menu.onclick = () => {
  console.log(1)
  menu.dispatchEvent(new CustomEvent('menu-open', { bubbles: true })) // 여기서 document 리스너가 먼저 실행
  console.log(2)
}
document.addEventListener('menu-open', () => console.log('중첩'))
// 1 → 중첩 → 2
```

현재 핸들러를 끝낸 뒤에 보내고 싶으면 핸들러 맨 끝으로 옮기거나 `setTimeout(() => menu.dispatchEvent(…))`으로 미룬다([[event-loop|이벤트 루프]]).

커스텀 이벤트 이름은 `click`·`keydown` 같은 **내장 이벤트 이름과 겹치지 않게** 짓는다. 다른 코드가 진짜 사용자 입력으로 착각한다. 내장 이벤트를 직접 만드는 것은 테스트 자동화나 다른 방법이 없는 서드파티 연동 때로 한정한다.

## 폼·키보드·로딩 이벤트

이벤트 종류별 세부는 따로 정리했다.

- 폼 제출(`submit` + `FormData`), `input`·`change`, `focus`·`blur`·`focusin`: [[form-controls-dom|폼 컨트롤과 포커스 이벤트]]
- 마우스·포인터·키보드(`key`와 `code`, IME 조합): [[ui-input-events|마우스·포인터·키보드 이벤트]]
- `DOMContentLoaded`·`load`·`visibilitychange`: [[page-lifecycle-events|페이지 생명주기와 리소스 로딩 이벤트]]

`div`나 `img`에 `click`만 붙이면 키보드로는 쓸 수 없다. 버튼과 링크를 가려 쓰는 법, 포커스·키보드 접근성은 [[keyboard-accessibility|키보드 접근성과 포커스 관리]]에 있다.

## 패턴: 바깥 클릭으로 닫기

모달·드롭다운·팝오버는 바깥을 클릭하거나 Esc를 누르면 닫혀야 한다.

```javascript
overlay.addEventListener('click', (event) => {
  const isOutside = !event.target.closest('.modal-inner')
  if (isOutside) close()
})
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') close()
}, { signal: controller.signal })
```

- 기준 요소를 알 때는 `!panel.contains(event.target)`도 같은 판정이다. Shadow DOM 안쪽까지 따져야 하면 `event.composedPath().includes(panel)`를 쓴다.
- 직접 구현하기 전에 플랫폼 기능을 먼저 본다. `popover` 속성(Baseline)은 바깥 클릭·Esc 닫기를 기본으로 한다. `<dialog>`를 `showModal()`로 열면 Esc 닫기와 포커스 가두기가 기본이고, `closedby="any"`를 주면 바깥 클릭으로도 닫힌다. `closedby`는 크롬 134·파이어폭스 141부터 지원하지만 2026년 10월 기준 사파리 정식판은 지원하지 않으므로, 사파리용 바깥 클릭 처리를 함께 둔다.

## 정리

- 이벤트는 캡처로 내려갔다가 버블로 올라온다. 리스너는 기본으로 버블 단계에서 실행된다.
- 리스너가 붙은 요소는 `currentTarget`, 실제 시작점은 `target`이다.
- 많은 자식·나중에 생길 자식은 부모 하나에서 `closest()`로 가려내는 **이벤트 위임**으로 받는다.
- 정리해야 할 리스너는 `signal`로 묶어 `abort()`로 지운다.
- 핸들러는 `addEventListener`로 붙인다. `on<event>` 속성은 하나만, `return false`는 그 속성에서만 통한다.
- 바깥 리스너를 물러서게 할 때는 전파를 끊지 말고 `defaultPrevented`로 알린다.
- 코드 사이의 알림은 `CustomEvent`로 하고, 막을 수 있게 하려면 `cancelable`과 `dispatchEvent()`의 반환값을 쓴다. `dispatchEvent()`는 동기로 실행된다.

관련 노트: [[dom-manipulation|DOM 조작]], [[dom|DOM과 BOM]], [[ui-input-events|마우스·포인터·키보드 이벤트]], [[form-controls-dom|폼 컨트롤과 포커스 이벤트]], [[page-lifecycle-events|페이지 생명주기와 리소스 로딩 이벤트]], [[react-events|React 이벤트 처리]], [[keyboard-accessibility|키보드 접근성과 포커스 관리]], [[web-components|웹 컴포넌트: template·slot·Shadow DOM]], [[Accessibility|웹 접근성]], [[debounce-throttle|Debounce와 Throttle]], [[intersection-observer|Intersection Observer와 관찰자 API]]
