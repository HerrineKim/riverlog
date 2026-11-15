---
title: "요소 크기·스크롤·좌표"
concept: "Element Geometry"
summary: "JavaScript로 요소와 창의 크기·스크롤·위치를 읽고 바꾸는 법. offset·client·scroll 계열 기하 속성이 각각 무엇을 재는지, CSS width 대신 기하 속성을 읽는 이유, 창 크기와 문서 높이, scrollTo·scrollIntoView와 스크롤 막기, 창 기준(clientX·getBoundingClientRect)과 문서 기준(pageX) 좌표, elementFromPoint를 정리한다."
tags: ["javascript", "dom", "browser", "layout", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/size-and-scroll", "https://ko.javascript.info/size-and-scroll-window", "https://ko.javascript.info/coordinates", "https://ko.javascript.info/onscroll", "https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-gutter", "https://developer.mozilla.org/en-US/docs/Web/API/Element/checkVisibility"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「요소 사이즈와 스크롤」, 「브라우저 창 사이즈와 스크롤」, 「좌표」, 「Scrolling」 글을 바탕으로, 최신 API는 MDN으로 확인해 재구성한 노트다.

## 기하 속성이란

요소를 옮기거나 다른 요소 옆에 무언가를 띄우려면 **지금 그려진** 크기와 위치가 필요하다. DOM은 이 값을 `offsetWidth`, `clientHeight`, `scrollTop` 같은 기하 속성(geometry property)으로 준다.

- 값은 **단위 없는 숫자**이고 단위는 픽셀이다. `'180px'`이 아니라 `180`이다.
- 레이아웃이 끝난 결과라서, 읽으면 브라우저가 밀린 레이아웃을 그 자리에서 계산한다. 스타일 쓰기와 번갈아 읽으면 레이아웃 스래싱이 생긴다([[browser-rendering#강제 동기 레이아웃|강제 동기 레이아웃]]).
- `display: none`이거나 문서에 붙지 않은 요소는 모두 `0`이고 `offsetParent`는 `null`이다.
- `scrollLeft`·`scrollTop`만 쓸 수 있고 나머지는 읽기 전용이다.

## 요소 하나의 상자

```text
┌──────────── offsetWidth ────────────┐
│ border                               │
│  ┌──────── clientWidth ─────────┐ ┌┐ │
│  │ padding                      │ ││ │ ← 세로 스크롤바
│  │   content (보이는 부분)        │ ││ │
│  │   ↑ scrollTop만큼 위가 가려짐   │ ││ │
│  └──────────────────────────────┘ └┘ │
└──────────────────────────────────────┘
clientLeft·clientTop = 왼쪽·위 테두리 두께
scrollHeight = 가려진 부분까지 포함한 안쪽 전체 높이
```

| 속성 | 재는 것 | 포함 |
| --- | --- | --- |
| `offsetParent` | 좌표의 기준이 되는 조상 | `position`이 `static`이 아닌 가장 가까운 조상, 없으면 `td`·`th`·`table`, 그것도 없으면 `body`. `position: fixed` 요소와 `body`·`html`은 `null` |
| `offsetLeft`·`offsetTop` | `offsetParent`의 왼쪽 위에서 떨어진 거리 | |
| `offsetWidth`·`offsetHeight` | 바깥 크기 | 콘텐츠 + 패딩 + 스크롤바 + 테두리. 마진은 빠진다 |
| `clientLeft`·`clientTop` | 바깥 테두리에서 안쪽 영역까지 거리 | 보통 테두리 두께. 오른쪽에서 왼쪽으로 쓰는 언어(아랍어·히브리어)에서는 스크롤바가 왼쪽에 생겨 `clientLeft`에 스크롤바 폭이 더해진다 |
| `clientWidth`·`clientHeight` | 테두리 안쪽의 보이는 영역 | 콘텐츠 + 패딩. **스크롤바는 빠진다** |
| `scrollWidth`·`scrollHeight` | 스크롤로 가려진 부분까지 포함한 안쪽 전체 | 콘텐츠 + 패딩 |
| `scrollLeft`·`scrollTop` | 스크롤로 왼쪽·위에 가려진 길이 | 값을 쓰면 실제로 스크롤된다 |

알아 둘 함정:

- 스크롤바는 운영체제·브라우저에 따라 **콘텐츠 폭을 빌려** 자리를 잡는다. CSS `width: 300px`에 스크롤바가 16px이면 콘텐츠 폭은 284px이다. 패딩이 없으면 `clientWidth`가 곧 실제 콘텐츠 폭이다.
- 내용이 넘치면 `padding-bottom` 영역까지 글자가 그려지는 것이 정상이다.
- `el.style.height = el.scrollHeight + 'px'`는 요소를 내용 높이만큼 펼친다. 텍스트 영역 자동 늘리기에 쓴다.
- `scrollTop = 0`은 맨 위, `scrollTop = 1e9`처럼 큰 값은 맨 아래로 보낸다.
- 숨김 판정에 `!el.offsetWidth && !el.offsetHeight`를 쓰면 내용이 없는 빈 요소도 숨김으로 잡힌다. 지금은 `el.checkVisibility()`(Baseline 2024)가 `display: none`, `content-visibility: hidden`, 선택적으로 `opacity`·`visibility`까지 따져 준다.

### CSS width 대신 기하 속성을 읽는 이유

`getComputedStyle(el).width`로 크기를 얻으면 틀리기 쉽다.

| 문제 | 이유 |
| --- | --- |
| `box-sizing`에 따라 의미가 바뀐다 | `border-box`면 테두리·패딩을 포함한 값, `content-box`면 콘텐츠만이다 |
| `auto`가 나온다 | 인라인 요소의 `width`는 계산값이 `auto`라 숫자로 쓸 수 없다 |
| 스크롤바 처리가 브라우저마다 다르다 | 스크롤바를 뺀 실제 폭을 주는 브라우저와 CSS 값을 그대로 주는 브라우저가 있다 |

화면에 실제로 차지한 크기는 `offsetWidth`·`clientWidth`나 `getBoundingClientRect()`로 읽는다. 계산된 스타일을 읽는 법은 [[dom-manipulation#스타일 읽고 쓰기|DOM 조작]]에 있다.

## 창과 문서

| 알고 싶은 것 | 쓰는 값 |
| --- | --- |
| 보이는 창의 크기(스크롤바 제외) | `document.documentElement.clientWidth`·`clientHeight` |
| 창의 크기(스크롤바 포함) | `window.innerWidth`·`innerHeight` |
| 현재 문서 스크롤 위치 | `window.scrollX`·`scrollY` (옛 이름 `pageXOffset`·`pageYOffset`은 같은 값의 별칭) |
| 문서 전체 높이 | 아래 `Math.max` 공식 |

무언가를 창 안에 배치할 때는 스크롤바가 차지한 부분을 뺀 `documentElement.clientWidth`가 맞는 값이다. 문서 전체 높이는 `documentElement.scrollHeight` 하나로는 브라우저에 따라 `clientHeight`보다 작게 나오는 경우가 있어, 역사적으로 여섯 값의 최댓값을 쓴다.

```javascript
const docHeight = Math.max(
  document.body.scrollHeight, document.documentElement.scrollHeight,
  document.body.offsetHeight, document.documentElement.offsetHeight,
  document.body.clientHeight, document.documentElement.clientHeight,
)
```

`<!DOCTYPE html>`이 없으면 쿼크 모드로 렌더링되어 이 값들이 엉뚱하게 나온다. 문서 맨 앞에 항상 둔다.

## 스크롤 바꾸기

```javascript
window.scrollTo({ top: 0, behavior: 'smooth' }) // 문서 기준 절대 위치로
window.scrollBy(0, 100)                         // 현재 위치에서 상대적으로
el.scrollIntoView()                             // el의 위쪽을 창 위쪽에 맞춘다
el.scrollIntoView({ block: 'center', behavior: 'smooth' })
el.scrollTop += 10                              // 스크롤 상자 안에서
```

- `scrollIntoView(false)`는 요소 아래쪽을 창 아래쪽에 맞춘다. 옵션 객체의 `block`·`inline`은 `start`·`center`·`end`·`nearest`를 받는다.
- 페이지 스크롤은 DOM이 다 만들어진 뒤에야 뜻대로 움직인다. `<head>`의 동기 스크립트에서 부르면 동작하지 않을 수 있다.
- 과거에는 페이지 스크롤을 `documentElement`로 바꾸는지 `body`로 바꾸는지가 브라우저마다 달랐다. `window.scrollTo`·`scrollBy`는 어디서나 같게 동작한다.
- 부드러운 스크롤은 「동작 줄이기」 설정 사용자에게 끈다([[dom|DOM과 BOM]]의 `scrollTo` 예).

### scroll 이벤트와 스크롤 막기

`scroll`은 `window`와 스크롤되는 요소 모두에서 일어난다. 하지만 **스크롤이 이미 일어난 뒤에** 오므로 `preventDefault()`로 막을 수 없다.

| 막는 방법 | 한계 |
| --- | --- |
| 스크롤을 일으키는 이벤트(`wheel`, `keydown`의 PageDown·Space·방향키, `touchmove`)에서 `preventDefault()` | 스크롤을 일으키는 경로가 많아 빠뜨리기 쉽다. `wheel`·`touchmove`를 막으려면 `passive: false`가 필요하다 |
| CSS `overflow: hidden`(모달이 열릴 때 `body`에) | 가장 확실하다. 스크롤바가 사라지면서 콘텐츠가 그 폭만큼 옆으로 밀린다 |

스크롤바가 사라져 레이아웃이 밀리는 문제는 과거에는 잠그기 전후의 `clientWidth` 차이만큼 `body`에 `padding-right`를 줘서 보정했다. 지금은 CSS `scrollbar-gutter: stable`(Baseline 2024)로 스크롤바 자리를 늘 비워 두면 된다. 스크롤 상자 끝에서 바깥 페이지로 스크롤이 이어지는 것은 `overscroll-behavior: contain`으로 막는다.

스크롤 위치에 따라 무언가를 보이거나 더 불러오는 일은 `scroll` 이벤트에서 위치를 계산하기보다 `IntersectionObserver`에 맡긴다([[intersection-observer|Intersection Observer]]). `scroll` 리스너가 꼭 필요하면 [[debounce-throttle|쓰로틀]]이나 `requestAnimationFrame`으로 횟수를 줄인다.

## 좌표

| 좌표계 | 기준 | 이벤트 속성 | CSS에 대응 |
| --- | --- | --- | --- |
| 창 기준 | 보이는 창의 왼쪽 위 | `clientX`·`clientY` | `position: fixed` |
| 문서 기준 | 문서 맨 위 왼쪽 | `pageX`·`pageY` | 문서 최상위의 `position: absolute` |

스크롤하면 창 기준 좌표는 바뀌고 문서 기준 좌표는 그대로다. 둘의 관계는 `pageY = clientY + window.scrollY`다.

### getBoundingClientRect

`el.getBoundingClientRect()`는 요소를 감싸는 가장 작은 사각형을 **창 기준** `DOMRect`로 돌려준다.

| 속성 | 의미 |
| --- | --- |
| `x`·`y` | 사각형 시작점의 창 기준 좌표 |
| `width`·`height` | 크기. `transform: scale`이 적용된 실제 그려진 크기다 |
| `top`·`left` | 위·왼쪽 모서리 (`width`·`height`가 양수면 `y`·`x`와 같다) |
| `bottom`·`right` | `top + height`, `left + width` |

- 값은 소수일 수 있다. 반올림하지 않고 그대로 `style.left`에 써도 된다.
- 요소가 창 위로 스크롤돼 올라가면 `top`이 음수가 된다.
- `right`·`bottom`은 창의 **왼쪽·위에서 잰 좌표**다. 오른쪽·아래 모서리에서의 거리를 뜻하는 CSS `right`·`bottom`과 다르다.
- `offsetWidth`는 `transform`을 무시한 레이아웃 크기이고, `getBoundingClientRect().width`는 변형까지 반영한 크기라 값이 다를 수 있다.

### 요소 옆에 무언가 띄우기

```javascript
function getPageCoords(el) {
  const box = el.getBoundingClientRect()
  return {
    top: box.top + window.scrollY,
    left: box.left + window.scrollX,
    bottom: box.bottom + window.scrollY,
    right: box.right + window.scrollX,
  }
}

const tip = document.createElement('div')
tip.style.position = 'absolute'          // 문서 기준 좌표와 짝
const { left, bottom } = getPageCoords(button)
tip.style.left = `${left}px`
tip.style.top = `${bottom}px`
document.body.append(tip)
```

창 기준 좌표에 `position: fixed`를 쓰면 스크롤할 때 띄운 요소가 기준 요소에서 떨어진다. 스크롤해도 따라붙어야 하면 문서 기준 좌표와 `position: absolute`를 쓴다. 화면 밖으로 잘리지 않게 방향을 뒤집는 계산까지 직접 하는 일은 지금은 `popover` 속성과 CSS 앵커 위치 지정으로 많이 대신한다.

### elementFromPoint

`document.elementFromPoint(x, y)`는 창 기준 좌표에서 **가장 위에 그려진 가장 깊은 요소**를 돌려준다.

```javascript
const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2)
el?.classList.add('center') // 창 밖 좌표면 null이다
```

- 좌표가 음수이거나 창 크기를 벗어나면 `null`이다. `?.`이나 검사 없이 쓰면 오류가 난다.
- 겹친 요소 전부가 필요하면 `elementsFromPoint()`가 위에서부터 배열로 준다.
- 드래그 중인 요소 아래의 드롭 대상을 찾을 때 쓴다([[ui-input-events#드래그 앤 드롭 직접 구현|드래그 앤 드롭]]).

## 정리

- `offset*`은 테두리까지 포함한 바깥, `client*`는 스크롤바를 뺀 안쪽, `scroll*`은 가려진 부분까지 포함한 안쪽 전체다.
- 화면에 차지한 크기는 CSS `width`가 아니라 기하 속성이나 `getBoundingClientRect()`로 읽는다.
- 보이는 창 크기는 `documentElement.clientWidth`, 스크롤 위치는 `scrollX`·`scrollY`, 이동은 `scrollTo`·`scrollIntoView`다.
- 창 기준 좌표는 `fixed`와, 문서 기준 좌표(`+ scrollY`)는 `absolute`와 짝을 이룬다.
- 기하 속성 읽기는 레이아웃을 강제하므로 읽기를 모으고 쓰기를 모은다.

관련 노트: [[browser-rendering|브라우저 렌더링 과정]], [[dom-manipulation|DOM 조작]], [[intersection-observer|Intersection Observer와 관찰자 API]], [[ui-input-events|마우스·포인터·키보드 이벤트]], [[debounce-throttle|Debounce와 Throttle]], [[dom|DOM과 BOM]]
