---
title: "CSS 오버플로와 스크롤: 넘침 처리와 스크롤 스냅"
concept: "Overflow"
summary: "내용이 박스보다 클 때 보일지·자를지·스크롤할지를 정하는 overflow, 한 줄 말줄임을 만드는 text-overflow, 스크롤 영역의 키보드 접근성, 스크롤바 스타일, scroll-behavior와 overscroll-behavior, 갤러리처럼 칸마다 멈추는 스크롤 스냅까지 정리한다."
tags: ["css", "frontend", "layout", "accessibility"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/css/overflow", "https://developer.mozilla.org/en-US/docs/Web/CSS/overflow", "https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color"]
---

> web.dev의 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Overflow 모듈을 바탕으로, 스크롤바 속성의 브라우저 지원은 MDN으로 확인해 재구성한 노트다.

## 오버플로란

오버플로(overflow)는 **내용이 박스에 정해진 크기보다 클 때** 생긴다. 부모를 크기가 고정된 창문, 자식을 창 너머 풍경이라고 생각하면 된다. 지도처럼 의도한 넘침도 있고, 채팅 말풍선에 긴 URL이 들어오는 것처럼 의도하지 않은 넘침도 있다.

넘침 처리 도구는 두 가지다.

| 도구 | 대상 |
| --- | --- |
| `overflow` 계열 | 박스 전체의 넘침(주로 블록 방향) |
| `text-overflow` | 한 줄 텍스트의 넘침(인라인 방향) |

## overflow 값

| 값 | 넘친 내용 | 스크롤바 | 스크롤 가능 |
| --- | --- | --- | --- |
| `visible` (기본) | 박스 밖으로 보인다 | 없음 | - |
| `hidden` | 패딩 상자에서 잘린다 | 없음 | 스크립트로는 가능 |
| `clip` | 잘린다 | 없음 | **불가**(스크립트 포함) |
| `scroll` | 잘린다 | 넘치지 않아도 **항상** | 가능 |
| `auto` | 잘린다 | 넘칠 때만 | 가능 |

```css
.panel { overflow: hidden auto; }   /* 두 값이면 x → y 순 */
```

- 기본값이 `visible`인 이유는 **내용을 실수로 숨기지 않기 위해서다.** 잘리는 것보다 겹치는 것이 데이터 손실이 적다.
- 대부분은 `auto`가 맞다. 필요할 때만 스크롤바가 나타난다.
- `scroll`은 나중에 넘칠 수 있는 영역의 스크롤바 자리를 미리 잡아 레이아웃 이동을 막는다. 자리만 잡고 싶다면 `scrollbar-gutter: stable`도 있다.
- `visible`·`clip` 외의 값은 새 블록 서식 맥락(BFC)을 만든다. 안의 float를 품고 margin 병합을 막는다([[box-model|박스 모델과 display]]).
- `overflow: hidden`인 조상 안에서는 `position: sticky`가 그 조상을 스크롤 컨테이너로 삼아 기대대로 붙지 않는다. 넘침만 자르려면 스크롤 컨테이너를 만들지 않는 `clip`을 쓴다.
- 축별 속성은 물리(`overflow-x`, `overflow-y`)와 논리(`overflow-inline`, `overflow-block`) 둘 다 있다. 논리 판은 Chrome 135부터 들어가 모든 주요 브라우저가 지원한다.

## 한 줄 말줄임

```css
.ellipsis {
  overflow: hidden;
  white-space: nowrap;      /* 한 줄로 */
  text-overflow: ellipsis;  /* 잘린 자리에 … */
}
.clamp-3 {                  /* 여러 줄 말줄임 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
```

세 줄이 모두 있어야 한다. 말줄임이 안 되면 요소의 너비가 제한되지 않은 것이다. 플렉스 아이템 안이라면 `min-width: 0`이 빠졌을 가능성이 크다([[flexbox#함정: flex 아이템이 컨테이너를 넘칠 때|Flexbox의 넘침 함정]]). 긴 단어·URL이 박스를 뚫는 문제는 `overflow-wrap: anywhere`로 푼다([[web-typography|웹 타이포그래피]]).

## 스크롤 영역과 접근성

마우스 사용자는 휠로 스크롤하지만, 키보드 사용자는 **스크롤 영역에 포커스가 가야** 방향키로 움직일 수 있다. 포커스 가능한 자식이 없는 스크롤 영역은 이름과 역할을 붙여 포커스를 받게 한다.

```html
<div class="code-block" tabindex="0" role="region" aria-labelledby="code-caption">…</div>
```

```css
/* 속성이 다 갖춰졌을 때만 스크롤을 켠다: 접근성 회귀를 CSS로 막는 패턴 */
[role][aria-labelledby][tabindex] { overflow: auto; }
[role][aria-labelledby][tabindex]:focus-visible { outline: .15em solid; }
```

- 스크롤바는 **패딩 상자 안**에 자리를 차지한다. 화면 위에 겹치는 오버레이 스크롤바(모바일, macOS 기본)는 자리를 차지하지 않아 OS마다 레이아웃이 달라질 수 있다.
- 모바일의 당겨서 새로고침, 바운스 같은 특수 동작은 문서의 **루트 스크롤러**에만 붙는다. 페이지 전체를 감싼 `div`를 스크롤시키면 이 동작이 사라진다. 가능하면 문서 자체가 스크롤되게 둔다.

## 스크롤 동작 다루기

| 속성 | 하는 일 |
| --- | --- |
| `scrollbar-color: 손잡이 트랙` | 스크롤바 색. Safari는 26.2부터 지원 |
| `scrollbar-width` | `auto`, `thin`, `none`만 가능. 임의 길이는 안 된다. Safari 18.2부터 지원 |
| `scroll-behavior: smooth` | 앵커 링크·`scrollTo()` 이동을 부드럽게 |
| `overscroll-behavior: contain` | 끝까지 스크롤한 뒤 스크롤이 **부모로 이어지는 것(scroll chaining)** 을 막는다. 모달 끝에서 뒤 페이지가 움직이는 문제 |
| `scroll-padding` | 스크롤 컨테이너 쪽 여백. 고정 헤더에 앵커 대상이 가려질 때 |
| `scroll-margin` | 대상 요소 쪽 여백. 스크롤해 갔을 때 위에 남길 공간 |

```css
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }        /* 움직임을 줄이고 싶은 사용자에게는 즉시 이동 */
}
html { scroll-padding-top: 4rem; }         /* 4rem 높이 고정 헤더 */
.modal-body { overflow: auto; overscroll-behavior: contain; }
```

## 스크롤 스냅

갤러리·슬라이드처럼 스크롤이 칸마다 멈추게 한다. 컨테이너와 자식에 나눠 준다.

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: inline mandatory;   /* 축 + 엄격도 */
  scroll-padding-inline: 1rem;
}
.carousel > .slide {
  flex: 0 0 80%;
  scroll-snap-align: center;            /* start | center | end */
  scroll-snap-stop: always;             /* 빠르게 넘겨도 다음 칸에서 일단 멈춘다 */
}
```

| 속성 | 위치 | 값 |
| --- | --- | --- |
| `scroll-snap-type` | 컨테이너 | 축 `x`·`y`·`block`·`inline`·`both` + `proximity`(기본, 가까우면 붙음) 또는 `mandatory`(항상 붙음) |
| `scroll-snap-align` | 자식 | 자식의 어느 가장자리를 스크롤 영역에 맞출지. `both`면 두 값 |
| `scroll-snap-stop` | 자식 | `always`면 관성 스크롤도 다음 스냅 지점에서 멈춘다 |
| `scroll-padding` / `scroll-margin` | 컨테이너 / 자식 | 스냅 위치 보정 |

`mandatory`는 칸이 화면보다 클 때 칸 사이 내용에 **도달할 수 없게** 만들 수 있다. 다양한 화면 크기에서 시험한다.

## 정리

- 기본은 `visible`. 스크롤 영역에는 대개 `auto`, 스크롤 없이 자르기만 하려면 `clip`.
- 한 줄 말줄임은 `overflow: hidden` + `white-space: nowrap` + `text-overflow: ellipsis`.
- 포커스 가능한 자식이 없는 스크롤 영역은 `tabindex="0"`·`role`·이름을 준다.
- 부드러운 스크롤은 `prefers-reduced-motion`을 확인하고 켠다. 스크롤 체이닝은 `overscroll-behavior: contain`.
- 칸마다 멈추는 스크롤은 `scroll-snap-type` + `scroll-snap-align`. `mandatory`는 내용이 잘리지 않는지 확인한다.

관련 노트: [[box-model|박스 모델과 display]], [[flexbox|Float와 Flexbox 레이아웃]], [[web-typography|웹 타이포그래피: 가독성, 글줄 길이, 웹폰트]], [[css-cursor-pointer|커서와 포인터 입력]], [[accessible-css-typography|접근성을 위한 CSS와 타이포그래피]]
