---
title: "DOM 이벤트: 전파, 위임, 커스텀 이벤트"
concept: "DOM Events"
summary: "DOM 이벤트는 캡처 → 타깃 → 버블 순서로 트리를 오간다. target과 currentTarget의 차이, 전파·기본 동작 제어, 부모 하나로 자식 이벤트를 받는 이벤트 위임, once·passive·signal 옵션, CustomEvent, 폼·키보드 이벤트와 바깥 클릭 감지 패턴을 정리한다."
tags: ["javascript", "dom", "event", "browser", "frontend"]
source: other
date: "2026-10-15"
sources: ["https://wesbos.com/javascript/05-events/event-listener", "https://wesbos.com/javascript/05-events/targets-bubbling-propagation-and-capture", "https://wesbos.com/javascript/05-events/prevent-default-and-form-events", "https://wesbos.com/javascript/05-events/accessibility-gotchas-and-keyboard-codes", "https://wesbos.com/javascript/06-serious-practice-exercises/click-outside-modal", "https://wesbos.com/javascript/10-harder-practice-exercises/57-shopping-form-with-custom-events-delegation-and-localstorage", "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog"]
---

> Wes Bos의 「[Beginner JavaScript](https://wesbos.com/javascript)」 강의 노트를 바탕으로, 옵션과 브라우저 지원은 MDN으로 확인해 재구성한 노트다.

## DOM 이벤트란

요소는 클릭·입력·스크롤처럼 무언가 일어날 때 **이벤트**를 내보낸다. `addEventListener(type, listener)`로 함수를 넘겨 두면 브라우저가 그때 함수를 호출한다. 리스너를 등록하고 지우는 기본 문법은 [[dom-manipulation|DOM 조작과 이벤트]]에 있다. 이 노트는 그다음, 이벤트가 **트리를 어떻게 이동하고 그 흐름을 어떻게 다루는지**를 다룬다.

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
- 항목 식별자는 `data-*` 속성에 넣어 두고 `dataset`으로 읽는다([[html-lesser-known-attributes|잘 안 쓰지만 쓸모 있는 HTML 속성]]).

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

- 데이터는 `detail`에 담는다.
- 커스텀 이벤트는 기본으로 **버블링하지 않는다.** 부모나 `document`에서 받으려면 `bubbles: true`를 준다.
- 코드로 보낸 이벤트는 `event.isTrusted`가 `false`다. 사용자의 실제 입력만 받아야 하는 곳(게임, 결제 확인)에서 구분할 수 있다.

## 폼 이벤트

| 이벤트 | 언제 |
| --- | --- |
| `submit` | 폼 제출. 버튼 `click`이 아니라 **폼의 `submit`** 을 들어야 Enter 키 제출까지 잡힌다 |
| `input` | 값이 바뀔 때마다 |
| `change` | 값이 확정될 때(텍스트는 포커스를 잃을 때, 체크박스·select는 바로) |
| `focus`·`blur` | 포커스가 들어오고 나갈 때(버블링하지 않음) |

```javascript
form.addEventListener('submit', (event) => {
  event.preventDefault()                         // 새로고침 막기
  const data = new FormData(event.currentTarget) // name 속성 기준으로 값 수집
  const name = data.get('name')
  const agreed = event.currentTarget.elements.agree.checked // name으로 접근, 체크박스는 checked
  event.currentTarget.reset()                    // 입력 비우기
})
```

입력에 `name` 속성을 주면 `form.elements.email`처럼 바로 꺼낼 수 있어 `querySelector`가 필요 없다. `form.email`도 되지만, 입력 이름이 `submit`·`name`처럼 폼 자체의 속성과 겹치면 그 속성을 가려 버리므로 `form.elements`를 거치는 편이 안전하다. 필수 입력·형식 검사는 `required`·`type="email"` 같은 HTML 검증에 먼저 맡기고, 그것으로 안 되는 규칙만 `submit`에서 `preventDefault()`로 막는다([[form-usability|더 나은 폼을 만드는 팁]]).

## 키보드 이벤트

| 속성 | 의미 | 예 |
| --- | --- | --- |
| `event.key` | 입력된 **문자·키 이름**. 자판 배열과 Shift를 반영한다 | `'a'`, `'A'`, `'Enter'`, `'Escape'`, `'ArrowLeft'` |
| `event.code` | 눌린 **물리 키 위치**. 배열과 무관하다 | `'KeyA'`, `'Space'` |
| `event.keyCode`·`which` | 숫자 코드. **폐기(deprecated)** 됐다 | `13` |

- 단축키·문자 판정은 `key`, 게임의 WASD처럼 자리가 중요한 조작은 `code`를 쓴다.
- 한국어처럼 IME로 조합하는 입력은 조합 중에도 `keydown`이 일어난다. Enter로 제출할 때는 `event.isComposing`이 `true`인 동안 무시해야 글자가 두 번 들어가지 않는다.
- 방향키로 무언가를 움직일 때는 그 키에서만 `preventDefault()`를 불러 페이지 스크롤을 막는다. 모든 키를 막으면 Tab 이동까지 깨진다.

`div`나 `img`에 `click`만 붙이면 키보드로는 쓸 수 없다. 버튼과 링크를 가려 쓰는 법, 포커스·키보드 접근성은 [[web-accessibility#키보드로 쓸 수 있는 인터랙션|웹 접근성]]에 있다.

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
- 코드 사이의 알림은 `CustomEvent`로, 폼은 `submit` + `FormData`로, 키는 `event.key`로 다룬다.

관련 노트: [[dom-manipulation|DOM 조작과 이벤트]], [[dom|DOM과 BOM]], [[react-events|React 이벤트 처리]], [[web-accessibility|웹 접근성]], [[debounce-throttle|Debounce와 Throttle]], [[intersection-observer|Intersection Observer와 관찰자 API]]
