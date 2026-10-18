---
title: "커서와 포인터 입력"
concept: "Pointer Input"
summary: "입력 장치에 맞춰 상호작용을 알리는 CSS. 상태를 알리는 cursor와 caret-color, 마우스·터치를 구분하는 pointer·any-pointer·hover 미디어 쿼리, 브라우저 기본 제스처를 고르는 touch-action, 상호작용을 끄는 pointer-events를 정리한다."
tags: ["css", "frontend", "accessibility", "mobile"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/css/cursors-and-pointers", "https://web.dev/learn/css/focus", "https://developer.mozilla.org/en-US/docs/Web/CSS/cursor", "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer"]
---

> web.dev의 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Cursors and pointers·Focus 모듈을 바탕으로 재구성한 노트다. 포커스 관리 전반은 [[keyboard-accessibility|키보드 접근성과 포커스 관리]]에 있다.

## 커서

커서는 마우스·트랙패드 사용자에게 **이 자리에서 무엇을 할 수 있는지** 알려 준다. 글 위에서는 텍스트 선택용 I자, 링크 위에서는 손가락, 나머지는 화살표가 브라우저 기본이다.

| 값 | 알리는 것 |
| --- | --- |
| `default`, `auto` | 기본 화살표 / 브라우저가 맥락으로 결정 |
| `pointer` | 링크처럼 누를 수 있다 |
| `text`, `vertical-text` | 글을 선택할 수 있다 |
| `move`, `grab`, `grabbing` | 옮길 수 있다 / 잡을 수 있다 / 잡고 있다 |
| `ew-resize`, `ns-resize`, `nwse-resize`, `col-resize` | 크기를 바꿀 수 있다 |
| `not-allowed`, `wait`, `progress`, `help` | 금지 / 기다림 / 백그라운드 진행 중 / 도움말 |
| `zoom-in`, `zoom-out`, `crosshair` | 확대·축소 / 정밀 선택 |
| `url(커서.svg) x y, 폴백` | 직접 만든 이미지. **폴백 키워드가 반드시 있어야** 한다 |

```css
.draggable { cursor: grab; }
.draggable:active { cursor: grabbing; }
.canvas { cursor: url(brush.svg) 4 28, crosshair; }   /* 4 28은 커서의 기준점 */
input { caret-color: var(--accent); }                 /* 입력 위치를 보여 주는 캐럿 색 */
```

캐럿(caret)은 편집 중인 글의 입력 위치를 보여 주는 세로선이다. 마우스를 따라다니는 커서와 다르다.

## 입력 장치에 맞추기

마우스는 정확하고 손가락은 둔하다. 장치에 따른 조정은 `pointer`·`any-pointer`·`hover`로 직접 묻고, 호버로만 드러나는 기능은 만들지 않는다. 표와 코드는 [[media-features#입력 장치|미디어 쿼리 문법과 미디어 기능]]에 있다.

## 터치 제스처: touch-action

터치 화면에서는 브라우저가 스크롤(팬)과 핀치 확대를 직접 처리한다. 지도·그림판·슬라이더처럼 그 제스처를 직접 처리하려면 `touch-action`에 **브라우저에게 맡길 동작만** 나열한다. 빠진 동작은 포인터 이벤트로 넘어온다.

| 값 | 브라우저가 처리하는 것 |
| --- | --- |
| `auto` (기본) | 전부 |
| `pan-x`, `pan-y` | 한 손가락 가로·세로 스크롤 |
| `pinch-zoom` | 두 손가락 확대·이동 |
| `manipulation` | `pan-x pan-y pinch-zoom`. 더블 탭 확대만 뺀다 |
| `none` | 아무것도. 모든 제스처를 직접 처리한다 |

```css
.slider { touch-action: pan-y; }    /* 세로 스크롤은 브라우저, 가로 드래그는 내가 */
.map    { touch-action: none; }
```

페이지 전체의 확대를 막으면 화면이 안정돼 보이지만 저시력 사용자가 내용을 키울 수 없다. 꼭 필요한 요소에만 좁게 쓴다.

## 상호작용 끄기: pointer-events

`pointer-events: none`인 요소는 클릭·호버를 받지 않고, 이벤트가 **아래 요소로 통과**한다. 장식용 오버레이가 아래 버튼을 가리지 않게 할 때 쓴다.

```css
.overlay-gradient { pointer-events: none; }
```

키보드 포커스와 스크린 리더에는 영향을 주지 않는다. 버튼을 비활성화하려면 `pointer-events` 대신 `disabled` 속성이나 `inert`를 쓴다.

## 포커스 표시

포커스 표시는 브라우저 기본 링을 지우지 않고 `:focus-visible`로 더 잘 보이게 바꾼다. 규칙은 [[keyboard-accessibility#CSS로 지키기|키보드 접근성과 포커스 관리]]에 있다. 플렉스·그리드로 화면 순서를 바꾸면 포커스 순서와 어긋난다([[css-grid#1. 보이는 순서와 소스 순서를 어긋나게 하지 않는다|그리드 실무 원칙]]).

## 정리

- 커서는 할 수 있는 일을 알린다. 이미지 커서에는 폴백 키워드를 둔다.
- 장치 차이는 `pointer`·`any-pointer`·`hover`로 묻는다. 호버 전용 기능을 만들지 않는다.
- 제스처를 직접 처리할 땐 `touch-action`에 맡길 동작만 남긴다. 확대는 막지 않는다.
- `pointer-events: none`은 마우스만 막는다. 비활성화는 `disabled`·`inert`로.
- 포커스 표시는 `:focus-visible` + `outline` + `outline-offset`.

관련 노트: [[keyboard-accessibility|키보드 접근성과 포커스 관리]], [[selectors|CSS 선택자와 우선순위]], [[css-overflow-scroll|CSS 오버플로와 스크롤: 넘침 처리와 스크롤 스냅]], [[gesture-interface|제스처 기반 인터페이스]], [[media-features|미디어 쿼리 문법과 미디어 기능]]
