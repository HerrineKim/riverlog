---
title: "키보드 접근성과 포커스 관리"
concept: "Keyboard Accessibility"
summary: "모든 기능은 키보드만으로 쓸 수 있어야 한다. 표준 키 조작, :focus-visible로 지키는 포커스 표시와 WCAG 2.2의 Focus Not Obscured, 소스 순서와 tabindex, inert와 <dialog>로 만드는 안전한 모달, 장치 독립 이벤트와 동적 콘텐츠의 포커스 처리를 정리한다."
tags: ["frontend", "accessibility", "javascript", "css", "ux"]
source: other
date: "2026-10-17"
sources: ["https://webaim.org/techniques/keyboard/", "https://webaim.org/techniques/keyboard/tabindex", "https://webaim.org/techniques/keyboard/accesskey", "https://webaim.org/techniques/javascript/", "https://webaim.org/techniques/javascript/eventhandlers", "https://webaim.org/techniques/javascript/other", "https://webaim.org/techniques/javascript/alternatives", "https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html", "https://web.dev/learn/accessibility/focus", "https://web.dev/learn/accessibility/javascript", "https://wesbos.com/javascript/05-events/accessibility-gotchas-and-keyboard-codes"]
---

> WebAIM의 「[Keyboard Accessibility](https://webaim.org/techniques/keyboard/)」(tabindex, accesskey 포함)와 「[Accessible JavaScript](https://webaim.org/techniques/javascript/)」(이벤트 핸들러, 기타 문제, 대안 포함)를 바탕으로, 포커스 관련 기준은 W3C WCAG 2.2 해설서와 MDN으로 확인해 재구성한 노트다. 포커스 표시 디자인과 SPA의 포커스 처리는 web.dev 「[Learn Accessibility](https://web.dev/learn/accessibility)」의 키보드 포커스·JavaScript 편으로, 링크와 버튼을 가려 쓰는 실수는 Wes Bos의 「Beginner JavaScript」 강의 노트로 보강했다.

## 왜 키보드인가

**키보드만으로 모든 콘텐츠와 기능에 닿을 수 있어야 한다**(WCAG 2.1.1 Keyboard, A). 손 떨림이나 마비로 마우스를 정밀하게 못 쓰는 사람, 화면을 보지 않고 탐색하는 시각장애인, 스위치·음성 제어·한 손 키보드처럼 키보드 신호를 흉내 내는 장치 사용자가 모두 키보드 인터페이스에 기댄다. 효율 때문에 키보드를 쓰는 사람도 많다. 장애 유형별 사용 방식은 [[disability-and-web-use|장애 유형별 웹 사용]]에 있다.

휴대폰·태블릿에 외장 키보드를 연결해 쓰는 사용자도 있으니 모바일에서도 키보드로 확인한다. 마우스가 고장 났거나 손목을 다친 사람처럼 **일시적으로** 키보드에 기대는 사용자도 있다.

**포커스(focus)**는 지금 키보드 입력을 받는 화면 요소다. 링크·버튼·폼 컨트롤처럼 원래 포커스되는 요소는 Tab 이동과 기본 키 처리가 내장돼 있다.

## 표준 키 조작

키보드 테스트는 아래 표가 기준이다. 커스텀 위젯도 이 관례를 따라야 사용자가 새로 배우지 않는다. 위젯별 세부 키는 W3C [ARIA Authoring Practices Guide(APG)](https://www.w3.org/WAI/ARIA/apg/patterns/)에 있다.

| 대상 | 키 | 확인할 것 |
| --- | --- | --- |
| 상호작용 요소 사이 이동 | Tab / Shift+Tab | 포커스 표시가 보이고, 순서가 논리적이다 |
| 링크 | Enter | |
| 버튼 | Enter, Space | `role="button"`이면 두 키 모두 직접 처리해야 한다 |
| 체크박스 | Space | |
| 라디오 버튼 | 방향키로 이동·선택, Tab으로 그룹 밖 | 그룹 전체가 Tab 정지점 하나다 |
| 셀렉트 | ↑/↓로 옵션, Space·Alt+↓로 펼침, Enter·Esc로 닫기 | 글자를 치면 해당 옵션으로 건너뛴다 |
| 자동 완성 | 입력해 거르기, ↑/↓로 후보, Enter로 선택 | |
| 대화 상자 | Esc로 닫기 | 모달은 포커스를 안에 가두고, 닫히면 연 요소로 포커스를 돌려준다 |
| 슬라이더 | 방향키로 증감, Home/End로 끝, PageUp/PageDown으로 큰 단위 | 범위 슬라이더는 Tab으로 양 끝을 오간다 |
| 메뉴(앱 메뉴바) | ↑/↓로 항목, ←/→로 하위 메뉴, Enter로 실행 | 페이지 이동 링크 묶음은 메뉴가 아니다. Tab과 Enter로 다룬다 |
| 탭 | Tab으로 탭 목록 진입·이탈, ←/→로 탭 이동 | 다른 페이지로 가는 링크 묶음은 탭이 아니다 ([[accessible-widgets\|접근 가능한 위젯]]) |
| 트리 | ↑/↓로 항목, ←/→로 펼침·접힘 | |
| 스크롤 | 방향키, Space·Shift+Space로 한 화면 | 가로 스크롤은 최소화한다 |

## 포커스 표시

Tab으로 닿은 요소는 **키보드 포커스**를 갖는다. 앞이 보이는 키보드 사용자에게 포커스 표시는 마우스 커서와 같다. 없으면 지금 어디 있는지 모른다.

### 관련 WCAG 기준

| 기준 | 수준 | 요구 |
| --- | --- | --- |
| 2.4.7 Focus Visible | AA | 키보드로 조작할 수 있는 요소에는 보이는 포커스 표시가 있다 |
| 2.4.11 Focus Not Obscured (Minimum) | AA, 2.2 신설 | 포커스된 요소가 작성자가 만든 콘텐츠(고정 헤더·푸터, 쿠키 배너, 채팅 버튼)에 **완전히** 가려지지 않는다 |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA, 2.2 신설 | 포커스된 요소가 **조금도** 가려지지 않는다 |
| 2.4.13 Focus Appearance | AAA, 2.2 신설 | 포커스 표시가 요소 둘레에 2 CSS px 두께 테두리를 두른 면적 이상이고, 포커스 전후 같은 픽셀의 대비가 3:1 이상이다 |
| 1.4.11 Non-text Contrast | AA | 포커스 표시 같은 상태 표시는 인접 색과 3:1 이상 |

2.4.11에서 사용자가 옮길 수 있는 창은 처음 위치만 본다. 사용자가 직접 연 내용(펼친 메뉴 등)은 포커스를 옮기지 않고 닫을 수 있으면 가려도 된다.

### CSS로 지키기

`outline: none`(또는 `outline: 0`)으로 기본 표시를 지우지 않는다. 디자인 때문에 바꾸고 싶으면 **지우지 말고 더 잘 보이게 바꾼다.** 기준은 `:focus-visible`이다. 브라우저가 「지금 포커스를 보여 줘야 하는가」를 판단해, 키보드로 이동할 때와 텍스트 입력 칸에는 맞고 마우스로 버튼을 누를 때는 맞지 않는다. 주요 브라우저가 모두 지원한다(Chrome 86, Firefox 85, Safari 15.4부터).

```css
/* 기본 표시를 지우지 않고 바꾼다 */
:focus-visible {
  outline: 3px solid #1a5fff;
  outline-offset: 2px;
}

/* 마우스 클릭 때만 표시를 숨기고 싶다면 이렇게 좁힌다 */
:focus:not(:focus-visible) {
  outline: none;
}

/* 고정 헤더·푸터가 포커스를 가리지 않게 (2.4.11) */
html {
  scroll-padding-top: 72px;    /* 고정 헤더 높이 */
  scroll-padding-bottom: 56px; /* 고정 푸터 높이 */
}
```

- `outline`은 고대비 모드(`forced-colors`)에서도 남는다. `box-shadow`만으로 만든 포커스 표시는 고대비 모드에서 사라지니 투명 `outline`을 함께 둔다.
- `outline`은 박스 크기를 바꾸지 않고 margin 영역에 겹쳐 그려지며, 지금은 주요 브라우저에서 `border-radius`를 따라 둥글게 그려진다.
- 스킵 링크 대상 `<main tabindex="-1">`에 포커스 링이 보이는 것은 정상이다.
- 링크·버튼의 배경색을 바꾸는 식으로 표시를 더 키워도 좋다. 색만 바꾸지 말고 모양 변화를 함께 준다([[color-motion-accessibility|색과 움직임의 접근성]]).
- 포커스 표시는 **놓이는 배경에 맞춰** 보이게 한다. 흰 바탕에는 파란 표시, 파란 바탕에는 흰 표시처럼 영역마다 바꿔도 된다.
- 요소 종류마다 모양을 달리해도 된다(본문 링크는 점선 밑줄, 버튼은 둥근 테두리). 다만 종류가 너무 많으면 헷갈리니 몇 가지로 정리한다.

## 포커스 순서

포커스 순서와 스크린 리더의 읽는 순서는 **소스 코드 순서**가 정한다(2.4.3 Focus Order, A). 화면 흐름(보통 위→아래, 왼쪽→오른쪽)과 같아야 한다.

| 하지 않는다 | 대신 |
| --- | --- |
| `tabindex="1"` 이상으로 순서를 정한다 | 소스 순서를 바로 쓰고, 배치는 CSS로 한다 |
| CSS `order`, `flex-direction: row-reverse`, grid 배치로 화면 순서만 뒤집는다 | 화면 순서를 바꾸면 소스도 같이 바꾼다. 포커스가 화면에서 엉뚱하게 튄다 |
| 마우스로 상호작용하지 않는 요소(문단, 제목, 카드 껍데기)에 `tabindex="0"` | 포커스는 조작할 수 있는 요소에만 준다. 아무 일도 안 일어나는 정지점은 혼란만 준다 |
| `<a>`에 `href`를 빼거나 비운다 | `href`가 있어야 링크로 포커스되고 읽힌다. 동작이면 `<button>`이다 |

긴 내비게이션을 매번 Tab으로 지나야 하면 운동 장애 사용자에게 특히 힘들다. 건너뛰기 링크, 제목 구조, 랜드마크로 지름길을 준다([[accessible-page-structure|접근 가능한 페이지 구조]]).

## tabindex

| 값 | 효과 | 쓰는 곳 |
| --- | --- | --- |
| 없음 | 링크·버튼·폼 컨트롤만 기본으로 포커스된다 | 대부분 |
| `0` | 원래 포커스되지 않는 요소를 **문서 순서대로** Tab 순서에 넣는다 | 네이티브 요소로 만들 수 없는 커스텀 위젯 |
| `-1` | Tab 순서에는 없고 `focus()`나 링크 앵커로만 포커스된다 | 열린 대화 상자, 제출 후 오류 요약, 이동 후의 제목, 위젯 안의 비활성 항목 |
| `1` 이상 | 모든 기본 요소보다 먼저 포커스되는 인위적 순서 | **쓰지 않는다** |

- `tabindex="0"`을 줬다면 그 요소다운 키 조작을 함께 구현한다. 버튼처럼 보이면 Enter와 Space에 모두 반응해야 하고, `role`과 상태(`aria-expanded` 등)로 무엇인지 알려야 한다([[aria-basics|ARIA와 접근 가능한 이름]]).
- 링크·버튼처럼 원래 포커스되는 요소에 `-1`을 주면 키보드 사용자가 닿을 수 없다. 마우스로 누를 수 있는 것에는 주지 않는다.

### 위젯 안의 포커스: 로빙 tabindex

탭 목록, 툴바, 라디오 그룹, 메뉴처럼 항목이 여럿인 위젯은 **위젯 전체를 Tab 정지점 하나**로 두고 안에서는 방향키로 움직인다. 지금 항목만 `tabindex="0"`, 나머지는 `-1`로 두고 방향키를 누를 때마다 값을 옮기는 방식을 로빙 tabindex(roving tabindex)라 한다. 콤보박스·리스트박스처럼 포커스는 입력 칸에 두고 활성 항목만 가리키는 `aria-activedescendant` 방식도 있다. 탭 구현 예는 [[accessible-widgets|접근 가능한 위젯]]에 있다.

## 키보드 트랩과 모달

키보드로 들어간 곳에서는 키보드로 나올 수 있어야 한다(2.1.2 No Keyboard Trap, A). 화살표·Tab·Esc 같은 표준 방법이 아닌 키가 필요하면 그 방법을 알린다.

반대로 **모달 대화 상자는 의도적으로 포커스를 가둔다.** 뒤 페이지는 가려져 있으니 Tab이 그쪽으로 빠지면 안 된다. 그래도 Esc로 닫을 수 있어야 하고, 닫히면 연 버튼으로 포커스를 돌려준다.

| 방법 | 하는 일 |
| --- | --- |
| `<dialog>` + `showModal()` | 대화 상자 밖을 자동으로 비활성(inert)으로 만들고, 안으로 포커스를 옮기고, Esc로 닫힌다. 직접 만드는 것보다 이것을 먼저 쓴다 |
| `inert` 속성 | 그 요소와 하위 전체를 포커스·클릭·보조 기술·페이지 내 찾기(Chrome·Firefox)에서 뺀다. 주요 브라우저 지원(Chrome 102, Firefox 112, Safari 15.5부터) |
| 직접 구현 | `inert`로 나머지를 막고, 첫 요소에 `focus()`, Esc 처리, 닫을 때 포커스 복귀까지 모두 해야 한다 |

```html
<button id="open">설정 열기</button>

<dialog id="settings" aria-labelledby="settings-title">
  <h2 id="settings-title">설정</h2>
  …
  <button id="close">닫기</button>
</dialog>

<script>
  const dialog = document.getElementById('settings');
  const opener = document.getElementById('open');
  opener.addEventListener('click', () => dialog.showModal());
  document.getElementById('close').addEventListener('click', () => dialog.close());
  // Esc로 닫혀도 close 이벤트가 온다
  dialog.addEventListener('close', () => opener.focus());
</script>
```

`inert`는 오프캔버스 메뉴, 화면 밖으로 밀어 둔 패널, 로딩 중인 영역처럼 **보이지 않거나 지금 쓰면 안 되는 영역**에도 쓴다. 비모달 대화 상자는 포커스를 가두지 않고, 포커스를 잃으면 닫히는 편이 자연스럽다.

## 단축키

| 방법 | 판단 |
| --- | --- |
| `accesskey` 속성 | 피한다. 브라우저·OS마다 조합 키가 다르고(Windows는 Alt 또는 Shift+Alt, macOS는 Control+Option), 중복 값 처리와 동작(포커스만 vs 즉시 실행)이 제각각이며, 스크린 리더·브라우저 단축키와 충돌하고, 있는지 알릴 표준 방법도 없다 |
| JavaScript 단축키 | 웹 앱에서는 쓸모 있다. 다만 같은 충돌 문제가 있으니 단축키 목록을 알린다 |
| 한 글자 단축키 (S로 검색 열기 등) | WCAG 2.1.4 Character Key Shortcuts(A): **끌 수 있거나, 수정 키 조합으로 바꿀 수 있거나, 해당 컴포넌트에 포커스가 있을 때만** 동작해야 한다. 음성 제어 사용자가 말하는 단어가 단축키로 잘못 실행되기 쉽다 |

## 링크와 버튼을 가려 쓴다

마크업이 맞아도 스크립트가 **마우스로만 되는 동작**을 붙이면 키보드 사용자에게 기능이 사라진다. 가장 흔한 원인은 링크·버튼이 아닌 요소에 동작을 붙이는 것이다.

| 실수 | 바로잡기 |
| --- | --- |
| `<a href="#">저장</a>` + `preventDefault()` | 페이지(또는 페이지 안 위치)로 옮기면 링크, 동작을 하면 `<button>`이다. 링크의 `preventDefault()`는 로그인 안내처럼 이동을 조건부로 막을 때만 쓴다 |
| `<img>`·`<div>`에 `click`만 붙임 | 키보드로 닿지도 누르지도 못한다. **`<button>`으로 감싸는 것**이 가장 간단하다 |
| 어쩔 수 없이 `div`를 버튼으로 | `role="button"` + `tabindex="0"` + `keydown`에서 Enter·Space 처리까지 직접 해야 한다. 네이티브 버튼은 Enter·Space에 `click`을 알아서 보낸다. 이 키 처리를 빠뜨리는 실수가 매우 흔하다 |

```html
<!-- 나쁨: 포커스·키 처리·이름을 모두 직접 만들어야 한다 -->
<div role="button" tabindex="0" onclick="save()">저장</div>

<!-- 좋음 -->
<button type="button" onclick="save()">저장</button>
```

## 장치 독립 이벤트

요소를 맞게 골랐다면 이벤트도 장치 독립으로 고른다. 장치 독립 이벤트를 쓰거나, 장치 의존 이벤트를 쓸 때는 키보드 쪽도 함께 붙인다. 키 판정은 `event.key`로 한다([[dom-events|DOM 이벤트]]).

| 이벤트 | 장치 | 주의 |
| --- | --- | --- |
| `click` | 독립 (포커스 가능한 요소에서) | `<button>`·링크에서는 Enter·Space(링크는 Enter)로도 발생한다. `<div>`·`<span>`·표 셀에 `tabindex`만 준 경우에는 발생하지 않으니 키를 직접 처리한다 |
| `focus`/`blur`, `focusin`/`focusout` | 독립 | 포커스 때 다른 곳으로 포커스를 옮기거나, 칸을 떠나자마자 새 컨트롤을 끼워 넣지 않는다(3.2.1 On Focus, A) |
| `change`, `input` | 독립 | 셀렉트에서 옵션을 바꾸자마자 페이지를 이동하면 키보드로 옵션을 훑을 수 없다. 별도 이동 버튼을 둔다(3.2.2 On Input, A) |
| `mouseover`/`mouseenter`/`mouseout` | 포인터 전용 | 장식(그림자, 빛)만이면 괜찮다. 툴팁·메뉴처럼 **내용을 드러내면** `focus`에서도 같은 내용을 보여 준다 |
| `dblclick`, `mousedown`/`mouseup`, `pointerdown` 등 | 포인터 전용 | 유일한 수단으로 쓰지 않는다 |
| `keydown`/`keyup` | 키보드 전용 | 마우스·터치 경로를 따로 둔다 |

호버·포커스로 나타나는 내용은 WCAG 1.4.13 Content on Hover or Focus(AA)도 지킨다. Esc 등으로 **닫을 수 있고**, 포인터를 그 위로 옮겨도 **사라지지 않고**, 사용자가 치우기 전까지 **유지**돼야 한다.

깊은 드롭다운 메뉴는 키보드로 다 열 수 있게 만드는 대신, 상위 항목을 일반 링크로 두고 하위 목록이 있는 랜딩 페이지로 보내는 편이 더 쓰기 쉬울 때가 많다.

## 동적 콘텐츠와 포커스

| 상황 | 문제 | 처리 |
| --- | --- | --- |
| 포커스된 요소가 사라지거나 크게 바뀐다 | 포커스가 문서 처음(`<body>`)으로 튄다 | 지우기 전에 다음 자리로 포커스를 옮긴다 |
| 대화 상자·오류 요약이 나타난다 | 스크린 리더는 새 내용이 생긴 줄 모른다 | 나타나면 `focus()`로 옮긴다. 원래 포커스되지 않는 요소면 `tabindex="-1"` |
| 내용이 자동으로 계속 바뀐다 | 읽던 중에 바뀌어 위치를 잃는다 | 사용자 동작(버튼)으로 바뀌게 하고, 꼭 알려야 하면 라이브 영역을 쓴다([[aria-basics\|ARIA와 접근 가능한 이름]]) |
| SPA에서 화면이 바뀐다 | 페이지 이동인데 포커스와 제목이 그대로다 | 아래 「SPA의 라우트 전환」 |
| 자동 새로고침·리디렉션 | 보조 기술 사용자가 방향을 잃는다 | 미리 알리고 끄거나 미룰 수 있게 한다(2.2.1 Timing Adjustable). 가장 좋은 건 사용자가 직접 이동하게 하는 것이다 |

### SPA의 라우트 전환

SPA는 `index.html` 하나로 화면을 바꾸므로 브라우저가 새 페이지를 연 것처럼 처리해 주지 않는다. 스크린 리더 사용자는 페이지 제목이 바뀌는 것으로 이동을 알아채는데, 제목도 포커스도 그대로 남는다. 팀이 정해야 할 것은 두 가지다.

| 정할 것 | 선택지 |
| --- | --- |
| 제목 | `document.title`을 직접 바꾸거나 라우터의 제목 기능을 쓴다. 바뀐 제목이 저절로 읽히지는 않으므로 라이브 영역으로 「주문서 페이지」처럼 알리기도 한다 |
| 포커스 | ① 새 화면의 `<h1>`으로 옮긴다 ② 본문 컨테이너로 옮기고 라이브 영역으로 알린다 ③ 문서 맨 앞(건너뛰기 링크)으로 돌려 새 페이지를 연 것처럼 만든다 |

어느 쪽이 맞는지는 프레임워크와 화면 구성에 따라 다르다. 정했으면 사이트 전체에서 같게 한다. 라이브 영역 알림 도구는 [[aria-basics|ARIA와 접근 가능한 이름]]에 있다.

```js
// 화면 전환 뒤
const heading = document.querySelector('main h1');
heading.setAttribute('tabindex', '-1');
heading.focus();
```

CSS만으로도 드롭다운·애니메이션 같은 동적 표현을 만들 수 있지만, 스크린 리더는 CSS를 대부분 무시한다. CSS로 **내용이나 기능**을 전달했다면 보조 기술로 꼭 확인한다.

## JavaScript에 기대도 되나

WCAG 2는 JavaScript를 요구해도 된다. 대신 **스크립트로 만든 화면 자체가 접근 가능해야** 한다. 「장애인은 JavaScript를 끈다」는 오해다. 스크린 리더 사용자도 대부분 JavaScript를 켜 둔 채 쓴다.

| 방법 | 쓰임 |
| --- | --- |
| 서버 쪽 처리 | 폼 검증처럼 중요한 처리는 서버에서도 한다. 클라이언트 스크립트는 언제든 꺼지거나 바뀔 수 있다 |
| 점진적 향상(progressive enhancement) | 스크립트 없이도 동작하는 HTML 위에 스크립트로 편의를 더한다. 접근성에 가장 안전한 순서다 |
| `<noscript>` | 스크립트를 **끈** 사람용 대안이다. 접근성 문제의 해결책이 아니다. 스크립트를 켠 스크린 리더 사용자는 그 내용을 보지 못한다 |

스크립트 없이는 동작하지 않는데 **동작하는 것처럼 보이는** 버튼과 링크는 만들지 않는다.

스크립트로 화면을 바꿀 때 지킬 것도 있다.

| 하지 않는다 | 대신 |
| --- | --- |
| 의미 없는 `<div>` 덩어리를 `innerHTML`로 통째로 넣는다 | 시맨틱 HTML로 작은 단위만 그린다 |
| 포커스 때 스크립트로 `style` 속성을 바꾼다 | 스타일시트의 `:focus-visible` 규칙에 맡긴다 |
| 인라인 스타일을 주입한다 | CSS 클래스를 켜고 끈다. 인라인 스타일은 사용자 스타일시트와 고대비 설정을 덮어쓰기 쉽다 |
| 애니메이션·고정 내비게이션을 무거운 스크립트로 만든다 | CSS로 되는 것은 CSS로 한다. 스크립트가 줄면 보조 기술을 쓰는 저사양 기기에서도 빨라진다 |

## 키보드로 점검하기

1. 마우스를 치우고 Tab·Shift+Tab으로 페이지 끝까지 간다.
2. 포커스 표시가 늘 보이고, 고정 헤더·배너에 완전히 가려지는 곳이 없는지 본다.
3. 순서가 화면 흐름과 맞는지, 쓸모없는 정지점이 없는지 본다.
4. 마우스로 되는 모든 기능(메뉴, 툴팁, 드래그, 위젯)을 키보드로 해 본다.
5. 대화 상자를 열고 닫으며 포커스가 들어가고 돌아오는지, 갇히지 않는지 본다.

도구와 전체 평가 순서는 [[accessibility-evaluation|접근성 평가 방법과 도구]]에 있다.

## 정리

- 모든 기능은 키보드만으로 쓸 수 있고, 들어간 곳에서 나올 수 있어야 한다.
- 포커스 표시는 지우지 말고 `:focus-visible`로 바꾸며, 고정 요소에 가려지지 않게 `scroll-padding`을 둔다(2.4.11).
- 순서는 소스가 정한다. `tabindex`는 `0`과 `-1`만 쓰고, 위젯 안은 로빙 tabindex로 방향키 이동을 만든다.
- 모달은 `<dialog>`의 `showModal()`과 `inert`로 만들고, 닫으면 포커스를 돌려준다.
- 이벤트는 장치 독립으로, 화면이 바뀌면 포커스를 의도적으로 옮긴다.

관련 노트: [[aria-basics|ARIA와 접근 가능한 이름]], [[accessible-widgets|접근 가능한 위젯: 펼침·탭·캐러셀]], [[Accessibility|웹 접근성]], [[wcag-guidelines|WCAG와 POUR 원칙]], [[accessible-page-structure|접근 가능한 페이지 구조]], [[dom-events|DOM 이벤트]], [[html-interactive-elements|포커스 속성과 details·dialog]], [[css-cursor-pointer|커서와 포인터 입력]], [[ui-input-events|마우스·포인터·키보드 이벤트]]
