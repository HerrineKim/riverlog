---
title: "Selection과 Range"
concept: "Selection API"
summary: "문서의 일부를 가리키는 Range(시작·끝 경계점)와 사용자의 현재 선택을 나타내는 Selection(anchor·focus). Range를 만들고 내용 지우기·복제·감싸기, 선택 읽기와 바꾸기, selectionchange 이벤트, input·textarea 전용 선택 API(selectionStart·setSelectionRange·setRangeText)로 커서 위치 다루기, 선택 막기, DOM을 바꾸지 않고 칠하는 CSS Custom Highlight API를 정리한다."
tags: ["javascript", "dom", "browser", "form", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/selection-range", "https://developer.mozilla.org/en-US/docs/Web/API/Selection", "https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API", "https://taegon.kim/archives/9658"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「Selection and Range」 글을 바탕으로, 최신 API는 MDN으로 확인해 재구성한 노트다. 입력란 커서의 화면 좌표 구하기는 「[SVG, JS, CSS로 만드는 라이언 로그인 폼](https://taegon.kim/archives/9658)」으로 보강했다.

## 두 가지 선택 API

| 대상 | API | 다루는 것 |
| --- | --- | --- |
| 문서(HTML) | `Range`, `Selection` | 노드와 오프셋으로 정한 경계. 요소 경계를 넘나들 수 있다 |
| `<input>`, `<textarea>` | `selectionStart`, `setSelectionRange()`, `setRangeText()` | 값은 그냥 문자열이라 문자 위치 두 개면 된다 |

선택 강조, 「선택한 글 공유」, 서식 버튼이 있는 편집기, 입력란의 커서 위치에 글자 넣기가 이 API로 만들어진다.

## Range

**Range는 경계점 두 개(시작과 끝)** 로 문서의 한 구간을 가리킨다. 경계점은 「부모 노드 + 그 안의 오프셋」이다.

| 경계의 노드 | 오프셋의 뜻 |
| --- | --- |
| 요소 노드 | **자식 노드 번호**(텍스트 노드도 센다) |
| 텍스트 노드 | **문자 위치** |

```html
<p id="p">Example: <i>italic</i> and <b>bold</b></p>
<!-- p의 자식: 0 "Example: ", 1 <i>, 2 " and ", 3 <b> -->
```

```javascript
const r1 = new Range()
r1.setStart(p, 0)
r1.setEnd(p, 2)                 // 2번 자식 직전까지 → "Example: <i>italic</i>"

const r2 = new Range()
r2.setStart(p.firstChild, 2)    // "Example: "의 3번째 문자부터
r2.setEnd(p.querySelector('b').firstChild, 3) // "bold"의 앞 세 글자까지
String(r2)                      // "ample: italic and bol"
```

시작과 끝이 같은 노드일 필요는 없다. 끝이 시작보다 뒤이기만 하면 서로 관계없는 노드에 걸쳐도 된다. Range 자체는 화면에 아무것도 선택하지 않는다. 보이게 하려면 Selection에 넣는다.

| 속성 | 내용 |
| --- | --- |
| `startContainer`·`startOffset` | 시작 경계 |
| `endContainer`·`endOffset` | 끝 경계 |
| `collapsed` | 시작과 끝이 같아 내용이 없으면 `true` |
| `commonAncestorContainer` | 구간 안 모든 노드의 가장 가까운 공통 조상 |

### 메서드

| 분류 | 메서드 |
| --- | --- |
| 경계 정하기 | `setStart(node, offset)`·`setEnd(node, offset)`, `setStartBefore/After(node)`·`setEndBefore/After(node)` |
| 한 번에 고르기 | `selectNode(node)`(노드 자체), `selectNodeContents(node)`(노드의 안쪽 전부) |
| 접기·복사 | `collapse(toStart)`(한쪽 끝으로 접기), `cloneRange()` |
| 내용 바꾸기 | `deleteContents()`, `extractContents()`(잘라 내어 `DocumentFragment`로), `cloneContents()`(복제해 `DocumentFragment`로), `insertNode(node)`(시작 위치에 넣기), `surroundContents(node)`(구간을 `node`로 감싸기) |
| 위치 | `getBoundingClientRect()`, `getClientRects()`: 선택 영역 옆에 툴바를 띄울 때 |

`surroundContents`는 구간이 요소를 **반만 걸치면**(`<i>ita`처럼 여는 태그만 포함) 오류가 난다. 그럴 때는 `extractContents()`로 꺼내 감싼 뒤 `insertNode()`로 다시 넣는다.

## Selection

사용자가 마우스·키보드·탭으로 만든 문서의 선택은 `document.getSelection()`(= `window.getSelection()`)이 주는 **Selection** 객체다. Selection은 Range를 0개 이상 가질 수 있다고 명세에 있지만, 실제로 여러 구간(Ctrl+클릭)을 허용하는 것은 Firefox뿐이고 다른 브라우저는 최대 1개다.

| 속성 | 내용 |
| --- | --- |
| `anchorNode`·`anchorOffset` | 선택을 **시작한** 곳 |
| `focusNode`·`focusOffset` | 선택을 **끝낸** 곳 |
| `isCollapsed` | 선택이 비었거나 없으면 `true`(커서만 있는 상태) |
| `rangeCount` | Range 개수 |
| `type` | `'None'`·`'Caret'`·`'Range'` |

마우스는 오른쪽에서 왼쪽으로도 끌 수 있어서 **focus가 anchor보다 앞에 올 수 있다**(역방향 선택). Range는 늘 시작이 끝보다 앞이라는 점이 다르다.

### 읽기와 바꾸기

```javascript
const sel = document.getSelection()

sel.toString()                              // 선택된 텍스트
const frag = sel.rangeCount ? sel.getRangeAt(0).cloneContents() : null // 선택된 DOM

sel.setBaseAndExtent(p, 0, p, p.childNodes.length) // 기존 선택을 바꿔 p 안쪽 전부 선택

const range = new Range()
range.selectNodeContents(p)
sel.removeAllRanges()                       // 먼저 비워야 한다
sel.addRange(range)
```

| 메서드 | 하는 일 |
| --- | --- |
| `getRangeAt(i)` | i번째 Range(대개 0만) |
| `addRange(r)`·`removeRange(r)`·`removeAllRanges()`(= `empty()`) | Range 넣고 빼기. 선택이 이미 있으면 Firefox 외에는 `addRange`가 무시된다 |
| `setBaseAndExtent(aNode, aOff, fNode, fOff)` | 선택을 통째로 바꾸기 |
| `collapse(node, offset)`(= `setPosition`), `collapseToStart()`·`collapseToEnd()` | 커서로 접기 |
| `extend(node, offset)` | focus만 옮겨 선택 늘리기 |
| `selectAllChildren(node)` | 노드의 자식 전부 선택 |
| `deleteFromDocument()` | 선택한 내용을 문서에서 지우기 |
| `containsNode(node, partial)` | 노드가 선택에 들어 있나 |

### 선택 이벤트

| 이벤트 | 대상 | 내용 |
| --- | --- | --- |
| `selectstart` | 선택이 시작되는 요소 | `preventDefault()`하면 그 요소에서 선택이 시작되지 않는다 |
| `selectionchange` | `document` | 선택이 바뀔 때마다. 어디서 바뀌었는지는 `getSelection()`으로 다시 읽는다 |

## 입력란의 선택과 커서

`<input>`·`<textarea>`의 값은 HTML이 아니라 문자열이라 Range 없이 문자 위치로 다룬다.

| API | 내용 |
| --- | --- |
| `selectionStart`·`selectionEnd` | 선택의 시작·끝 위치. 쓸 수 있다. **둘이 같으면 그 자리가 커서**다 |
| `selectionDirection` | `'forward'`·`'backward'`·`'none'` |
| `select()` | 전부 선택 |
| `setSelectionRange(start, end, direction?)` | 선택 바꾸기 |
| `setRangeText(text, start?, end?, mode?)` | 구간을 `text`로 바꾸기. 위치를 생략하면 현재 선택. `mode`는 바꾼 뒤 선택을 `'select'`(새 글자 선택)·`'start'`(앞에 커서)·`'end'`(뒤에 커서)·`'preserve'`(기본) 중 어떻게 둘지 |
| `select` 이벤트 | 입력란 안에서 무언가 선택됐을 때. 선택이 풀릴 때는 오지 않는다 |

```javascript
// 커서 위치에 글자 넣고 커서를 그 뒤로
button.addEventListener('click', () => {
  input.setRangeText('😀', input.selectionStart, input.selectionEnd, 'end')
  input.focus()
})

// 선택한 글자를 **로 감싸기
input.setRangeText(`**${input.value.slice(input.selectionStart, input.selectionEnd)}**`)
```

입력란 안의 선택은 문서의 Selection과 별개다. 명세상 `document`의 `selectionchange`는 입력란 안의 선택에 일어나지 않아야 하므로 기대지 않는다. `value`를 통째로 바꾸면 커서가 끝으로 튀므로, 입력 중에 값을 고칠 때는 `setRangeText`나 위치를 저장했다가 되돌리는 방식을 쓴다([[form-usability|더 나은 폼을 만드는 팁]]의 커서 빼앗지 않기).

### 커서의 화면 좌표 구하기

`selectionStart`는 **몇 번째 글자**인지만 알려 준다. 커서가 화면의 어느 픽셀에 있는지는 API가 없어서 **거울 요소(mirror div)** 로 잰다. 입력란을 따라가는 눈동자, 커서 옆에 뜨는 자동완성·멘션 팝업이 이 방법을 쓴다.

```javascript
function caretOffset(input) {
  const mirror = document.createElement('div')
  const style = getComputedStyle(input)
  // 글자 폭에 영향을 주는 스타일을 복사한다
  for (const prop of ['font', 'letterSpacing', 'padding', 'border', 'boxSizing', 'width', 'whiteSpace']) {
    mirror.style[prop] = style[prop]
  }
  Object.assign(mirror.style, { position: 'absolute', visibility: 'hidden', top: '0', left: '0' })
  mirror.textContent = input.value.slice(0, input.selectionStart)
  const marker = document.createElement('span')
  marker.textContent = '\u200b' // 폭 0 문자로 커서 자리를 표시
  mirror.append(marker)
  document.body.append(mirror)
  const x = marker.offsetLeft - input.scrollLeft
  mirror.remove()
  return x // 입력란 왼쪽 기준 픽셀
}
```

입력란 자체의 위치는 `getBoundingClientRect()`로 더한다. 두 점(예: 캐릭터 얼굴 중심과 커서) 사이 각도는 `Math.atan2(dy, dx)`로 구해 `transform: rotate()`에 넣는다.

## 선택 막기

| 방법 | 효과 | 한계 |
| --- | --- | --- |
| CSS `user-select: none` | 그 요소에서 선택이 시작되지 않는다 | 다른 곳에서 시작한 선택에는 포함될 수 있다(복사할 때는 보통 빠진다) |
| `selectstart`나 `mousedown`에서 `preventDefault()` | 그 요소에서 선택이 시작되지 않는다 | 다른 곳에서 시작해 넓히는 것은 막지 못한다. 같은 동작에 다른 핸들러(더블 클릭, 드래그)가 있을 때 충돌을 피하는 데 알맞다 |
| 선택된 뒤 `getSelection().empty()` | 선택을 지운다 | 선택이 나타났다 사라지며 깜빡여 잘 쓰지 않는다 |

글을 읽는 사람이 복사·인용하는 것은 정상적인 사용이다. 버튼·드래그 손잡이처럼 선택이 방해되는 조작 요소에만 쓴다.

## DOM을 바꾸지 않고 칠하기: CSS Custom Highlight API

검색어 강조, 맞춤법 밑줄, 협업 편집의 다른 사람 커서처럼 **구간에 색만 칠하려고** `<mark>`로 감싸면 DOM이 바뀌어 편집기·프레임워크와 충돌한다. CSS Custom Highlight API(Baseline 2025)는 Range를 등록해 두고 CSS로만 칠한다.

```javascript
const ranges = findMatches(article, query) // Range 배열
CSS.highlights.set('search', new Highlight(...ranges))
// 지우기: CSS.highlights.delete('search') 또는 CSS.highlights.clear()
```

```css
::highlight(search) { background-color: yellow; color: black; }
```

## 정리

- Range는 「노드 + 오프셋」 경계 두 개다. 요소의 오프셋은 자식 번호, 텍스트의 오프셋은 문자 위치다.
- 사용자 선택은 `document.getSelection()`. 바꾸기 전에 `removeAllRanges()`하거나 `setBaseAndExtent`를 쓴다.
- 선택된 글은 `toString()`, 선택된 DOM은 `getRangeAt(0).cloneContents()`.
- 입력란은 `selectionStart`·`selectionEnd`로 커서를, `setRangeText`로 그 자리 글자를 바꾼다.
- 칠하기만 할 때는 DOM을 감싸지 말고 Highlight API를 쓴다.

관련 노트: [[dom-manipulation|DOM 조작]], [[form-controls-dom|폼 컨트롤과 포커스 이벤트]], [[ui-input-events|마우스·포인터·키보드 이벤트]], [[form-usability|더 나은 폼을 만드는 팁]], [[dom|DOM과 BOM]]
