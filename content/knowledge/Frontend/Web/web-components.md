---
title: "웹 컴포넌트: template·slot·Shadow DOM"
concept: "Web Components"
summary: "라이브러리 없이 재사용 가능한 요소를 만드는 웹 표준. <template>은 렌더링되지 않는 HTML 조각, 커스텀 요소는 HTMLElement를 상속한 클래스와 라이프사이클 콜백, Shadow DOM은 마크업과 스타일을 캡슐화하는 별도 트리, <slot>은 바깥 내용을 끼울 자리다. :host·::slotted()·::part()·커스텀 속성으로 경계를 넘어 꾸미고, 이벤트는 리타게팅되며 composed 이벤트만 밖으로 나간다. 선언적 Shadow DOM으로 서버에서 그린다."
tags: ["html", "component", "dom", "javascript", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/html/template", "https://developer.mozilla.org/en-US/docs/Web/API/Web_components", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template", "https://ko.javascript.info/webcomponents-intro", "https://ko.javascript.info/custom-elements", "https://ko.javascript.info/shadow-dom", "https://ko.javascript.info/template-element", "https://ko.javascript.info/slots-composition", "https://ko.javascript.info/shadow-dom-style", "https://ko.javascript.info/shadow-dom-events", "https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements"]
---

> web.dev의 「[Learn HTML](https://web.dev/learn/html)」 강좌 중 「Template, slot, and shadow」 모듈을 바탕으로, 선언적 Shadow DOM과 브라우저 지원은 MDN으로 확인해 보강하고, javascript.info(모던 JavaScript 튜토리얼)의 「웹 컴포넌트」 장(커스텀 요소, 섀도 DOM, 템플릿 요소, 슬롯과 컴포지션, 섀도 DOM 스타일링, 섀도 DOM과 이벤트)으로 라이프사이클·슬롯 API·스타일 우선순위·이벤트를 더한 노트다.

## 웹 컴포넌트란

웹 컴포넌트(Web Components)는 UI 위젯을 한 번 만들어 **어디서든 일반 HTML 요소처럼** 다시 쓰게 하는 브라우저 표준이다. JavaScript는 필요하지만 프레임워크는 필요 없다. 세 기술이 합쳐져 하나를 이룬다.

| 기술 | 하는 일 |
| --- | --- |
| HTML 템플릿(`<template>`, `<slot>`) | 복제해서 쓸 마크업 틀과, 사용하는 쪽 내용을 끼울 자리 |
| 커스텀 요소(Custom Elements) | `customElements.define()`으로 새 태그 이름과 동작을 등록 |
| Shadow DOM | 요소 안에 바깥과 격리된 DOM 트리를 붙여 마크업·스타일을 캡슐화 |

셋 다 Baseline으로 모든 주요 브라우저가 지원한다. 잘 만든 컴포넌트는 **자기 클래스, 바깥에서 건드릴 수 없는 DOM, 자기에게만 적용되는 CSS, 다른 컴포넌트와 주고받는 API(속성·메서드·이벤트)** 를 갖춘다. 웹 컴포넌트는 이 넷을 브라우저 기능으로 준다. 프레임워크 컴포넌트와 비교한 위치는 [[frontend-frameworks|프론트엔드 프레임워크]]에 있다.

## template: 렌더링되지 않는 HTML 조각

```html
<template id="star-rating-template">
  <form>
    <fieldset>
      <slot name="legend"><legend>경험을 평가해 주세요</legend></slot>
      <rating>
        <input type="radio" name="rating" value="1" aria-label="별 1개" required>
        <input type="radio" name="rating" value="2" aria-label="별 2개">
        <input type="radio" name="rating" value="3" aria-label="별 3개">
      </rating>
    </fieldset>
    <button type="reset">초기화</button>
    <button type="submit">제출</button>
  </form>
</template>
```

- `<template>`의 내용은 **화면에 그려지지 않고**, 이미지도 받지 않고, 스크립트도 실행되지 않는다.
- 내용은 `<template>`의 DOM 자식이 아니라 `template.content`가 돌려주는 **`DocumentFragment`** 에 들어 있다.
- 쓰려면 복제해서 붙인다: `document.body.append(template.content.cloneNode(true))`. 이렇게만 하면 커스텀 요소가 아니라 그냥 일반 DOM에 내용이 들어간다. 프래그먼트를 붙이면 프래그먼트 자신이 아니라 자식들이 들어간다.
- 내용은 「문서 밖」에 있다가 **문서에 붙는 순간** 스타일이 적용되고 `<script>`가 실행되고 `<video autoplay>`가 재생된다.
- 부모가 정해진 태그(`<tr>`, `<li>`, `<option>`)도 그대로 담는다. `<div>` 안에 `<tr>`을 쓰면 파서가 구조를 고쳐 버리지만 `<template>`은 넣은 대로 보존한다.
- 데이터 바인딩·반복·변수 치환은 없다. 값 채우기는 복제 뒤 DOM 조작으로 직접 한다.

## 모르는 요소와 커스텀 요소

브라우저는 모르는 태그(`<rating>`)를 만나도 실패하지 않는다. 기본 스타일도 의미도 없는 **익명 인라인 요소**(`HTMLUnknownElement`)로 다룬다. `<span>`처럼 보인다고 생각하면 된다.

커스텀 요소는 이름에 **하이픈이 반드시** 들어가야 하고 소문자로 쓴다(`<star-rating>`). 하이픈 덕분에 앞으로 생길 표준 요소와 겹치지 않는다. 정의되기 전의 `<star-rating>`도 모르는 요소처럼 내용을 그대로 보여 주며, CSS `:defined` / `:not(:defined)`로 정의 전후를 구분해 꾸밀 수 있다.

```js
customElements.define('star-rating', class extends HTMLElement {
  constructor() {
    super();                                     // 생성자에서 가장 먼저
    const template = document.getElementById('star-rating-template').content;
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(template.cloneNode(true));
  }
});
```

정의되면 브라우저는 문서의 모든 `<star-rating>`을 **업그레이드**해 인스턴스로 만들고, 섀도 루트를 붙이고 템플릿 복제본을 넣는다. 정의 전에 있던 요소도 이때 업그레이드된다. `customElements.get(name)`은 등록된 클래스를, `customElements.whenDefined(name)`은 정의되면 이행하는 프로미스를 돌려준다.

### 라이프사이클 콜백

| 콜백 | 언제 | 할 일 |
| --- | --- | --- |
| `constructor()` | 인스턴스가 만들어질 때 | `super()`, 섀도 루트 붙이기, 상태 초기화. **속성·자식을 읽거나 추가하지 않는다** |
| `connectedCallback()` | 문서에 들어갈 때마다 | 렌더링, 리스너 등록. 옮기면 여러 번 불리므로 한 번만 할 일은 플래그로 막는다 |
| `disconnectedCallback()` | 문서에서 빠질 때 | 타이머·리스너·옵저버 정리. 안 하면 메모리가 샌다 |
| `attributeChangedCallback(name, old, new)` | `observedAttributes`에 든 속성이 바뀔 때 | 다시 그리기. 파싱 시 처음부터 있던 속성에도 한 번 불린다 |
| `adoptedCallback()` | 다른 문서(`<iframe>` 등)로 옮겨질 때 | 드물다 |
| `connectedMoveCallback()` | `moveBefore()`로 옮겨질 때 | 정의하면 빠짐·들어감 콜백 대신 불려 상태를 유지한다. `moveBefore()`는 아직 Baseline이 아니다 |

```js
class TimeFormatted extends HTMLElement {
  static observedAttributes = ['datetime', 'lang'];   // 이 목록만 감시한다
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    const date = new Date(this.getAttribute('datetime'));
    this.textContent = new Intl.DateTimeFormat(this.getAttribute('lang') ?? undefined).format(date);
  }
}
customElements.define('time-formatted', TimeFormatted);
```

### 파싱 순서 함정

HTML 파서는 **부모를 먼저, 자식을 나중에** 만든다. 문서에 이미 있는 `<user-info><b>Ann</b></user-info>`가 업그레이드되면 `connectedCallback` 시점에 자식이 아직 없을 수 있다.

- 데이터는 자식보다 **속성으로** 받는다. 속성은 콜백 전에 준비된다.
- 자식이 꼭 필요하면 `setTimeout(…, 0)`으로 미루거나, 슬롯과 `slotchange`로 받는다. 자식 준비를 알리는 내장 콜백은 없다.

### 커스텀 내장 요소

기존 요소를 상속해 확장하는 방식(`class extends HTMLButtonElement`, `define('hello-button', …, { extends: 'button' })`, `<button is="hello-button">`)도 표준에 있다. 버튼의 접근성과 폼 동작을 그대로 물려받는 장점이 있지만 **Safari가 지원하지 않기로 했다.** 실무에서는 자율 커스텀 요소 안에 진짜 `<button>`을 두거나 폴리필을 쓴다.

### 커스텀 상태

`attachInternals()`가 주는 `states`(`CustomStateSet`)에 문자열을 넣고 빼면 CSS `:state(이름)`으로 꾸밀 수 있다(Baseline 2024). 클래스·속성을 바깥에 노출하지 않고 내부 상태를 스타일에 연결한다.

```js
this._internals = this.attachInternals();
this._internals.states.add('open');        // my-menu:state(open) { … }
```

## slot: 바깥 내용을 끼울 자리

```html
<star-rating>
  <legend slot="legend">블렌던 스무스</legend>
</star-rating>
<star-rating>
  <legend slot="legend">토스티 맥토스트페이스</legend>
  <p>이 문단은 보일까?</p>
</star-rating>
<star-rating></star-rating>
```

| 경우 | 결과 |
| --- | --- |
| 자식의 `slot` 속성 값이 `<slot name>`과 같다 | 그 자식이 슬롯 자리에 그려진다. 어떤 요소든, 다른 커스텀 요소도 된다 |
| 맞는 자식이 없다 | 템플릿 안 `<slot>`의 기본 내용이 그려진다 |
| `slot` 속성이 없는 자식 | 이름 없는 기본 `<slot>`이 있으면 거기로, 없으면 **그려지지 않는다** |

`slot`은 전역 속성이다. 슬롯에 들어간 내용은 원래 자리(라이트 DOM)에 그대로 있고 **캡슐화되지 않는다.** 바깥 CSS가 그대로 적용된다.

- `slot` 속성은 **호스트의 직계 자식에만** 통한다. 더 깊은 자손에 붙이면 무시된다.
- 같은 이름의 자식이 여럿이면 순서대로 한 슬롯에 들어간다.
- 이름 없는 `<slot>`은 **첫 번째 하나만** 기본 슬롯이다.

### 평탄화된 DOM

브라우저는 슬롯 자리에 라이트 DOM 자식을 끼운 **평탄화된 DOM(flattened DOM)** 을 그린다. 노드가 실제로 옮겨지지는 않는다. `querySelector`는 원래 위치에서 찾고, 렌더링·CSS 상속·이벤트 버블링은 평탄화된 구조를 따른다.

| API | 방향 | 내용 |
| --- | --- | --- |
| `node.assignedSlot` | 노드 → 슬롯 | 들어가 있는 `<slot>` |
| `slot.assignedNodes({ flatten })` | 슬롯 → 노드 | 배정된 노드. `flatten: true`면 중첩된 슬롯까지 펼치고, 없으면 기본 내용을 준다 |
| `slot.assignedElements({ flatten })` | 슬롯 → 요소 | 요소 노드만 |
| `slotchange` 이벤트 | 슬롯에서 발생 | 배정된 노드가 처음 채워지거나 추가·제거·교체될 때. **배정된 요소 내부 변경에는 안 뜬다**(그건 `MutationObserver`) |

`assignedSlot`은 섀도 루트가 `open`일 때만 값을 준다.

## Shadow DOM: 캡슐화

```text
<star-rating>            ← 섀도 호스트(shadow host)
  #shadow-root (open)    ← 섀도 루트(shadow root)
    <style>…</style>     ← 섀도 트리(shadow tree): 바깥과 격리
    <form>…</form>
  <legend slot="legend"> ← 라이트 DOM 자식: 슬롯을 통해 그려진다
```

- **바깥 CSS는 섀도 트리에 들어오지 않고, 안의 CSS는 밖으로 새지 않는다.** 섀도 트리 안에 `<style>`을 두고 꾸민다.
- 범위가 좁으니 선택자 특정도를 낮게 써도 된다(`input[type="radio"]` 대신 `input`).
- 상속되는 속성(`color`, `font` 등)과 CSS 커스텀 속성은 경계를 넘어 내려온다. 테마는 커스텀 속성으로 넘기는 것이 기본이다.
- `mode: 'open'`이면 바깥 JavaScript가 `element.shadowRoot`로 접근할 수 있고, `closed`면 `null`이다. `closed`에서는 `attachShadow()`가 돌려준 참조를 직접 보관해야 한다. `<input type="range">` 같은 내장 요소의 섀도 트리도 닫혀 있다.
- 요소 하나에 섀도 루트는 **하나뿐**이다. 섀도 루트의 `host`가 호스트 요소다. 라이트 DOM 자식과 섀도 트리가 둘 다 있으면 섀도 트리만 그려지고, 자식은 슬롯을 통해서만 보인다.
- `document.querySelector()`는 섀도 트리 안을 찾지 못한다. `shadowRoot.querySelector()`로 찾는다. 같은 이유로 **`id`는 섀도 트리 안에서만 유일하면 된다.**
- 이벤트는 경계를 넘을 때 대상이 호스트로 바뀐다(retargeting). 자세한 규칙은 아래 「이벤트」에 있다.

### 경계를 넘어 꾸미기

| 선택자 | 어디서 | 무엇을 |
| --- | --- | --- |
| `:host` | 섀도 트리 안 | 호스트 요소 자신(`<star-rating>`) |
| `:host(.compact)` | 섀도 트리 안 | 조건에 맞는 호스트만 |
| `::slotted(legend)` | 섀도 트리 안 | 슬롯에 들어온 요소(최상위 요소만) |
| `star-rating::part(form)` | 바깥 CSS | 템플릿에서 `part="form"`을 단 요소 |

```html
<template id="star-rating-template">
  <form part="form">
    <fieldset part="fieldset">…</fieldset>
  </form>
</template>
```

`part`는 클래스처럼 쓴다. 한 요소에 여러 이름을 공백으로 줄 수 있고 여러 요소가 같은 이름을 가져도 된다.

### 우선순위와 제약

- 바깥 문서의 `star-rating { … }`는 안쪽 `:host` 규칙보다 **우선한다.** 그래서 `:host`는 사용자가 덮어쓸 수 있는 기본값 역할을 한다. 안쪽 선언에 `!important`를 붙이면 안쪽이 이긴다.
- 슬롯에 들어간 요소는 바깥 스타일을 받는다. 안에서는 `<slot>`에 스타일을 주고 상속에 기대거나 `::slotted()`로 꾸민다.
- `::slotted()`는 **슬롯된 최상위 요소만** 고른다. `::slotted(div span)`, `::slotted(div) p`처럼 안으로 내려갈 수 없고, `querySelector`에서는 못 쓴다.
- 커스텀 속성은 경계를 통과한다. 컴포넌트는 `color: var(--rating-color, gold)`처럼 노출하고, 노출한 커스텀 속성과 `part` 이름을 **공개 API로 문서화**한다.
- `:host-context(.dark)`(조상 기준 스타일)는 명세에서 빠졌다. 바깥 테마는 커스텀 속성이나 컨테이너 스타일 쿼리로 받는다.

### 스타일시트 공유

인스턴스마다 `<style>`을 복제하는 대신 **생성 가능한 스타일시트(constructable stylesheet)** 하나를 여러 섀도 루트가 공유할 수 있다(Baseline). 섀도 트리 안의 `<link rel="stylesheet">`도 HTTP 캐시 덕분에 다시 받지 않는다.

```js
const sheet = new CSSStyleSheet();
sheet.replaceSync(':host { display: inline-block; }');
shadowRoot.adoptedStyleSheets = [sheet];   // 시트를 고치면 쓰는 곳 모두 바뀐다
```

## 이벤트

섀도 트리 안에서 난 이벤트를 바깥에서 받으면 `event.target`이 **호스트로 바뀐다**(retargeting). 바깥 코드가 컴포넌트 내부 구조를 몰라도 되게 하려는 것이다.

| 상황 | 바깥에서 본 `target` |
| --- | --- |
| 섀도 트리 안의 요소를 클릭 | 호스트 |
| 슬롯에 들어간 라이트 DOM 요소를 클릭 | 그 요소 그대로(원래 바깥 요소이므로) |

- 버블링은 평탄화된 DOM을 따라 슬롯된 요소 → `<slot>` → 섀도 트리 → 호스트 순으로 올라간다.
- `event.composedPath()`는 섀도 트리를 포함한 전체 경로를 준다. `closed` 트리는 경로에서 숨겨지고 호스트부터 보인다.
- **`composed: true`인 이벤트만 경계 밖으로 나간다.** 사용자 입력 이벤트(`click`, `input`, `keydown`, `focus`·`blur`, 포인터·터치·`wheel`)는 대부분 composed다. `mouseenter`·`mouseleave`, `load`, `error`, `select`, `slotchange`는 아니다.
- 커스텀 이벤트를 컴포넌트 밖까지 보내려면 **`bubbles: true`와 `composed: true`를 둘 다** 준다. 바로 바깥에만 알리려면 호스트에서 `composed: false`로 dispatch한다(→ [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]]).

```js
this.dispatchEvent(new CustomEvent('rate', { detail: { value: 3 }, bubbles: true, composed: true }));
```

## 선언적 Shadow DOM

JavaScript 없이 HTML만으로 섀도 루트를 만들 수 있다. 서버 렌더링(SSR)한 컴포넌트를 스크립트 실행 전에 바로 그리려고 쓴다. 2024년부터 모든 주요 브라우저가 지원한다.

```html
<star-rating>
  <template shadowrootmode="open">
    <style>:host { display: inline-block; }</style>
    <slot name="legend"></slot>
  </template>
  <legend slot="legend">후버 숙딥</legend>
</star-rating>
```

파서가 `shadowrootmode`가 있는 `<template>`을 만나면 그 자리에서 부모의 섀도 루트로 바꾼다. 나중에 커스텀 요소가 정의되면 생성자에서 `this.shadowRoot`가 이미 있는지 확인하고 재사용한다. 포커스를 안쪽 첫 요소로 넘기는 `shadowrootdelegatesfocus`, 복제를 허용하는 `shadowrootclonable` 속성도 있다.

## 접근성 주의

- 표준 요소를 흉내 내는 커스텀 요소는 `role`, `tabindex`, 키보드 처리(Enter·Space)를 **모두 직접** 다시 만들어야 한다. 가능하면 섀도 트리 안에 진짜 `<button>`·`<input>`을 둔다(→ [[aria-basics|ARIA와 접근 가능한 이름]]).
- 섀도 경계를 넘어 `id`로 참조할 수 없다. 바깥 `<label for>`나 `aria-labelledby`가 섀도 트리 안 요소를 가리키지 못한다.
- 폼에 값을 제출하는 커스텀 요소는 `static formAssociated = true`와 `attachInternals()`로 폼 연결 요소(form-associated custom element)를 만든다.

## 이름 충돌과 범위 지정 레지스트리

`customElements`는 페이지 전역 레지스트리라 같은 이름을 두 번 `define()`하면 오류가 난다. 두 라이브러리가 같은 태그 이름을 쓰면 충돌한다. **범위 지정 레지스트리**(`new CustomElementRegistry()`를 `attachShadow({ customElementRegistry })`에 넘김)는 정의를 섀도 루트 안으로 한정하지만 아직 Baseline이 아니다. 지금은 태그 이름에 접두사(`acme-rating`)를 붙이는 것이 기본이다.

## 정리

- `<template>`은 그려지지 않는 틀이고, 내용은 `content`의 `DocumentFragment`에 있다.
- 커스텀 요소는 하이픈 든 이름 + `HTMLElement` 상속 클래스 + `customElements.define()`. 렌더링은 `connectedCallback`, 정리는 `disconnectedCallback`, 속성 반응은 `observedAttributes`.
- Shadow DOM은 스타일을 양방향으로 격리한다. 슬롯에 들어간 내용은 격리되지 않는다.
- 경계 넘어 꾸미기는 안에서 `:host`·`::slotted()`, 밖에서 `::part()`, 테마는 커스텀 속성. 바깥 규칙이 `:host`보다 이긴다.
- 이벤트는 호스트로 리타게팅되고, 커스텀 이벤트는 `bubbles`·`composed`를 둘 다 켜야 밖에서 받는다.
- SSR에는 `<template shadowrootmode>`로 선언적 Shadow DOM을 쓴다.

관련 노트: [[dom|DOM과 BOM]], [[dom-manipulation|DOM 조작과 이벤트]], [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]], [[frontend-frameworks|프론트엔드 프레임워크]], [[aria-basics|ARIA와 접근 가능한 이름]]
