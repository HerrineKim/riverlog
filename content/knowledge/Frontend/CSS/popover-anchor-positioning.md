---
title: "팝오버와 앵커 위치 지정"
concept: "Anchor Positioning"
summary: "툴팁·드롭다운·토스트를 JS 위치 계산 없이 만드는 두 기능. popover 속성은 auto·manual·hint 세 종류의 열고 닫기 규칙과 최상위 레이어를 주고, CSS 앵커 위치 지정은 anchor-name·position-anchor·position-area·anchor()로 요소를 다른 요소 옆에 붙이며 position-try-fallbacks로 화면 밖으로 나갈 때의 대안 위치를 정한다."
tags: ["css", "html", "frontend", "layout"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/css/anchor-positioning", "https://web.dev/learn/css/popover-and-dialog", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning", "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/popover"]
---

> web.dev의 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Anchor positioning·Popover and dialog 모듈을 바탕으로, 브라우저 지원은 MDN 호환성 데이터로 확인해 재구성한 노트다.

## 두 기능의 분담

| 기능 | 해결하는 문제 | 지원 |
| --- | --- | --- |
| `popover` 속성 | 열고 닫기, 다른 팝오버와의 관계, Esc·바깥 클릭으로 닫기, **최상위 레이어**(z-index 경쟁 없음) | auto·manual은 Baseline 2024. `hint`는 Chrome 151·Firefox 153부터(Chrome 133~150·Firefox 149~152는 이전 명세를 부분 구현), Safari는 기술 미리 보기에만 있다 |
| 앵커 위치 지정 | 다른 요소 옆에 붙이기, 화면 밖으로 나가면 위치 바꾸기 | 2026년 1월 Firefox 147로 모든 주요 브라우저(Baseline 2026) |

과거에는 두 일을 Popper·Floating UI 같은 JS 라이브러리가 했다. 지금은 HTML 속성과 CSS만으로 된다.

## 팝오버

`popover` 속성을 가진 요소는 기본으로 숨겨지고(`display: none`), 열리면 **최상위 레이어(top layer)**에 올라간다. 모든 팝오버는 **모달이 아니다.** 열려 있어도 뒤 페이지를 클릭하고 탭으로 이동할 수 있다. 뒤를 막아야 하면 `<dialog>`의 `showModal()`을 쓴다.

```html
<button popovertarget="menu">메뉴</button>
<div id="menu" popover>…</div>

<button popovertarget="menu" popovertargetaction="hide">닫기</button>
```

JS로는 `el.showPopover()`, `hidePopover()`, `togglePopover()`를 부른다. `showPopover({ source: button })`처럼 출처 요소를 넘기면 앵커와 중첩 관계가 설정된다. `<dialog popover>`로 쓰면 비모달 대화상자의 의미까지 함께 얻는다.

### 세 가지 종류

| | `auto` (기본) | `hint` | `manual` |
| --- | --- | --- | --- |
| 가벼운 닫기(바깥 클릭·Esc) | 된다 | 된다 | 안 된다. 직접 닫아야 한다 |
| 열 때 닫히는 것 | 다른 auto와 hint | 다른 hint만 | 없음 |
| 여러 개 동시에 | 중첩일 때만 | 중첩일 때만 | 자유 |
| 어울리는 곳 | 드롭다운 메뉴, 선택 목록 | 호버·포커스로 뜨는 툴팁 | 토스트, 알림, 직접 관리하는 패널 |

- **중첩 스택**: 팝오버 안의 버튼으로 다른 팝오버를 열면 스택에 쌓인다. 바깥 메뉴를 닫으면 하위 메뉴도 함께 닫히고, 하위 메뉴 바깥을 클릭하면 그 위의 것만 닫힌다. auto 스택과 hint 스택은 따로지만, auto 안에서 연 hint는 auto 스택에 들어간다. hint에서 auto를 열 수는 없다.
- manual 팝오버는 다른 종류에 영향을 받지도 주지도 않는다. 다만 버튼 클릭으로 열면 그 클릭이 다른 auto·hint의 가벼운 닫기를 일으킨다.

### 팝오버 스타일링

```css
[popover]:popover-open { display: grid; }   /* [popover]에 display를 주면 닫힌 팝오버까지 보인다 */
[popover]::backdrop { background: rgb(0 0 0 / 10%); }
```

- `::backdrop`은 팝오버 아래 깔리는 가상 요소다. 뒤 페이지가 여전히 조작 가능하므로 진하게 가리거나 흐리게 만들지 않는다.
- 기본 위치는 `margin: auto`로 화면 가운데다. 앵커에 붙이려면 `margin: unset`(또는 0)으로 지운다.

### 열고 닫기 애니메이션

닫힌 팝오버는 `display: none`이라 원래는 전환할 수 없다. 세 상태를 나눠 쓴다.

```css
[popover] {                                   /* 3. 닫힐 때 돌아갈 상태 */
  opacity: 0; translate: 0 -8px;
  transition: opacity .2s, translate .2s, display .2s allow-discrete, overlay .2s allow-discrete;
}
[popover]:popover-open { opacity: 1; translate: 0 0; }   /* 2. 열린 상태 */
@starting-style {                             /* 1. 막 열렸을 때의 시작 상태. 2보다 뒤에 쓴다 */
  [popover]:popover-open { opacity: 0; translate: 0 -8px; }
}
```

`transition-behavior: allow-discrete`(축약형에서는 `allow-discrete` 키워드)로 `display`와 `overlay`를 전환 목록에 넣는다. `overlay`까지 넣어야 퇴장 애니메이션이 끝날 때까지 최상위 레이어에 머물고, 암묵적 앵커 관계도 유지된다. `@starting-style`과 `allow-discrete`는 모든 주요 브라우저가 지원한다(Baseline 2024).

## 앵커 위치 지정

세 단계다. 앵커에 이름을 주고, 붙을 요소를 흐름에서 빼고, 이름으로 연결한 뒤 위치를 정한다.

```css
.trigger { anchor-name: --menu; }          /* 이름은 --로 시작. 여러 개 줄 수 있다 */
.menu {
  position: absolute;                      /* 또는 fixed */
  position-anchor: --menu;
  position-area: block-end span-inline-end;
}
```

`popovertarget` 버튼으로 연 팝오버는 그 버튼이 **암묵적 앵커**가 된다. 팝오버는 이미 `position: fixed`라 `position-area`와 `margin: unset`만 주면 된다.

### position-area

`position-area`는 앵커의 네 변과 원래 컨테이닝 블록이 만드는 **3×3 격자**의 칸을 고른다. 고른 칸이 새 컨테이닝 블록이 되므로, 그 안에서 `margin`·`padding`의 `%`도 그 칸 기준이다.

```text
 start/start │ start/center │ start/end
─────────────┼──────────────┼───────────
 center/start│   [앵커]      │ center/end
─────────────┼──────────────┼───────────
 end/start   │ end/center   │ end/end
```

| 키워드 | 예 | 뜻 |
| --- | --- | --- |
| 물리 | `top`, `bottom right`, `x-start`, `y-end` | 화면 방향 |
| 논리 | `block-end inline-start`, `start end` | 쓰기 모드 기준. 축을 빼면 블록 → 인라인 순 |
| `self-` | `self-block-start` | 컨테이닝 블록 대신 **자기 자신**의 쓰기 모드 기준 |
| `span-` | `block-end span-inline-end` | 가운데 칸까지 이어서 차지. 드롭다운의 흔한 값 |
| `span-all` | `bottom span-all` | 그 축의 세 칸 전부 |
| 키워드 하나 | `bottom` = `bottom span-all`, `start` = `start start` | 축이 분명하면 반대 축은 `span-all`, 아니면 같은 값 반복 |

### anchor()와 anchor-size()

더 세밀하게 놓으려면 inset 속성에 `anchor()`를 쓴다. 결과가 길이라 `calc()`, `min()`과 섞을 수 있다. **inset 속성(`top`, `inset-block-start` 등)에만** 쓸 수 있다.

```css
.tooltip {
  position: absolute;
  position-anchor: --menu;
  inset-block-start: anchor(end);                    /* 앵커의 블록 끝 변에 붙인다 */
  inset-inline-start: anchor(--other start, 1rem);   /* 다른 앵커, 못 찾으면 폴백 길이 */
  inline-size: anchor-size(inline);                  /* 앵커와 같은 너비 */
}
```

| 앵커 변 값 | 뜻 |
| --- | --- |
| `top`, `left`, `bottom`, `right` | 물리 변. inset 속성과 **같은 축**에서만 쓸 수 있다(`left: anchor(top)`은 무효) |
| `inside`, `outside` | inset과 같은 쪽 변 / 반대쪽 변 |
| `start`, `end`, `self-start`, `self-end` | 논리 변 |
| `0%`~`100%`, `center` | 앵커의 시작 변에서 끝 변까지의 비율. `bottom`에 써도 뒤집히지 않는다 |

앵커를 찾지 못한 `anchor()`는 **선언 전체를 무효로** 만든다. 앵커가 조건부로만 존재하면 두 번째 인자로 폴백을 준다.

### 앵커 찾기 규칙과 anchor-scope

- 앵커는 붙을 요소보다 **먼저 배치가 끝나야** 한다. 더 높은 레이어(팝오버 안)의 요소나, 뒤에 오는 절대 위치 요소에는 붙을 수 없다.
- 같은 이름의 앵커가 여러 개면 **문서에서 마지막** 것이 이긴다.
- 반복되는 컴포넌트(카드마다 배지)에서는 컴포넌트 루트에 `anchor-scope: --image`(또는 `all`)를 줘 이름이 그 안에서만 찾아지게 한다.

### 넘칠 때의 대안 위치

```css
.menu {
  position-area: block-end span-inline-end;
  position-try-fallbacks: block-end span-inline-start, flip-block;
}
@position-try --below-gap {
  position-area: bottom span-right;
  margin-block-start: .5rem;
}
.menu-2 { position-try: most-block-size --below-gap, flip-inline --below-gap; }
```

- 기본 위치가 컨테이닝 블록을 넘치면 목록을 **순서대로** 시도하고, 다 넘치면 기본 위치로 돌아간다.
- `flip-block`, `flip-inline`(둘을 함께도), 대각선으로 뒤집는 `flip-start`가 흔한 경우를 처리한다.
- `@position-try`로 위치·여백·정렬·앵커까지 바꾼 이름 있는 대안을 만든다. `flip-*`와 조합할 수 있다.
- `position-try-order: most-block-size`(또는 `most-inline-size`, `most-height`, `most-width`)는 순서 대신 **공간이 가장 넓은** 대안을 고른다. `position-try`는 order와 fallbacks의 축약형이다.

### 스크롤

붙은 요소는 **기본 앵커**(`position-anchor` 또는 암묵적 앵커) 하나의 스크롤만 따라간다. 앵커가 스크롤로 사라져도 붙은 요소는 남아 있으므로, 함께 숨기려면 `position-visibility: anchors-visible`을 준다.

## 정리

- 열고 닫기·최상위 레이어는 `popover`, 다른 요소 옆에 붙이기는 앵커 위치 지정.
- 메뉴는 `auto`, 툴팁은 `hint`, 토스트는 `manual`. 어느 것도 모달이 아니다.
- `[popover]`에 `display`를 주지 말고 `:popover-open`에 준다. 앵커에 붙일 땐 `margin: unset`.
- 대부분의 배치는 `position-area` 한 줄, 세밀한 배치는 inset 속성의 `anchor()`.
- 넘칠 때는 `position-try-fallbacks`와 `flip-*`. 반복 컴포넌트는 `anchor-scope`.

관련 노트: [[position|CSS position과 z-index]], [[css-animation|CSS 애니메이션: transition과 @keyframes]], [[logical-properties|쓰기 모드와 논리적 속성]], [[html|HTML 기초와 HTML5]]
