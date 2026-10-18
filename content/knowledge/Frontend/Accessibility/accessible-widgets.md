---
title: "접근 가능한 위젯: 펼침·탭·캐러셀"
concept: "Accessible Widgets"
summary: "펼침(디스클로저)·아코디언은 <details>/<summary>와 name 속성으로 먼저 만들고, 직접 만들면 button + aria-expanded + hidden을 쓴다. 탭은 APG 패턴대로 tablist·tab·tabpanel과 로빙 tabindex, 방향키를 갖추고, 캐러셀은 정지 버튼·포커스 시 정지·숨은 슬라이드 차단·라이브 영역을 갖춘다."
tags: ["frontend", "accessibility", "aria", "html", "javascript", "ux"]
source: other
date: "2026-10-17"
sources: ["https://webaim.org/techniques/disclosures/", "https://webaim.org/techniques/tabs/", "https://webaim.org/techniques/carousels/", "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/", "https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/", "https://www.w3.org/WAI/ARIA/apg/patterns/carousel/", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary"]
---

> WebAIM의 「[Disclosures and Accordions](https://webaim.org/techniques/disclosures/)」, 「[Tabbed Interfaces](https://webaim.org/techniques/tabs/)」, 「[Animation and Carousels](https://webaim.org/techniques/carousels/)」을 바탕으로, W3C ARIA Authoring Practices Guide(APG)의 [탭](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)·[디스클로저](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)·[캐러셀](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) 패턴과 MDN으로 최신화해 재구성한 노트다.

## 위젯에 공통으로 생기는 문제

펼침, 탭, 캐러셀은 공간을 아끼는 대신 복잡도를 늘린다. 잘못 만들면 키보드·스크린 리더 사용자는 내용에 아예 닿지 못한다. 문제는 대부분 같은 다섯 가지다.

| 문제 | 증상 | 처리 |
| --- | --- | --- |
| 트리거가 포커스되지 않는다 | `<div onclick>`, `href` 없는 `<a>`라서 Tab으로 닿지 않는다 | `<button>`을 쓴다 |
| 트리거가 링크다 | 링크는 「이동」이라 혼란스럽고, Space로 눌리지 않는다 | 기능은 `<button>`, 이동만 `<a href>` |
| 상태를 알리지 않는다 | 열렸는지 닫혔는지, 어느 탭이 선택됐는지 모른다 | `aria-expanded`, `aria-selected` 같은 상태 속성을 실제 상태와 함께 갱신한다 |
| 숨긴 내용에 포커스가 들어간다 | 접힌 패널·안 보이는 슬라이드의 링크로 포커스가 사라진다 | `hidden` 속성이나 `display: none`, 또는 `inert`로 진짜로 숨긴다 |
| 이름이 없다 | 아이콘 버튼이 「버튼」으로만 읽힌다 | 보이는 텍스트나 `aria-label`로 이름을 준다 ([[aria-basics\|ARIA와 접근 가능한 이름]]) |

`aria-hidden="true"`나 `opacity: 0`, 화면 밖 위치만으로 숨기면 안의 링크에 포커스가 여전히 들어간다. 포커스 관리 전반은 [[keyboard-accessibility|키보드 접근성과 포커스 관리]]에 있다.

## 디스클로저: 펼쳐 보기

디스클로저(disclosure)는 「더 보기」, 「자세히」처럼 **버튼 하나가 내용 영역 하나를 열고 닫는** 위젯이다.

### 먼저 `<details>`/`<summary>`

```html
<details>
  <summary>배송은 얼마나 걸리나</summary>
  <p>결제 후 영업일 기준 2~3일 걸린다.</p>
</details>

<details open>  <!-- 처음부터 펼쳐 둔다 -->
  <summary>교환·환불</summary>
  …
</details>
```

`<summary>`는 버튼처럼 Tab으로 닿고 Enter·Space로 토글되며, 펼침 상태가 보조 기술에 전달된다. **스크립트도 ARIA도 필요 없다.** 상태가 바뀌면 `toggle` 이벤트가 오고, 접힌 `<details>` 안의 글자도 브라우저 페이지 내 찾기(Ctrl/Cmd+F)로 찾으면 자동으로 펼쳐진다(Chrome 97, Safari 26.2, Firefox 148부터).

| 주의 | 이유 |
| --- | --- |
| `<summary>` 안에 링크·버튼을 넣지 않는다 | 버튼 안에 또 상호작용 요소가 들어가 조작이 꼬인다 |
| `<summary>` 안의 제목 태그를 믿지 않는다 | HTML은 `<summary>` 안에 제목 요소를 허용하지만, MDN에 따르면 일부 브라우저가 `<summary>`에 `button` role을 줘서 자식의 role을 모두 지운다. 그러면 안의 `<h3>`가 제목으로 안내되지 않는다. 제목 탐색이 중요하면 ARIA 방식(제목 안에 버튼)을 쓰거나 여러 환경에서 시험한다 |
| `<summary>`에 role을 주지 않는다 | `<summary role="button">`처럼 덧붙이는 role은 HTML이 허용하지 않고 부작용만 낳는다 |
| 펼침 표시 모양은 CSS로 | `summary::marker`나 `list-style: none` 뒤 직접 그린 아이콘. 열림 상태는 `details[open]` 선택자로 |

### 직접 만들 때: button + aria-expanded

디자인·애니메이션 때문에 `<details>`를 못 쓰면 APG 디스클로저 패턴을 따른다.

| 요소 | 필요한 것 |
| --- | --- |
| 트리거 | `<button>`, `aria-expanded="true\|false"`. `aria-controls`로 내용 id를 가리키는 것은 선택이다 |
| 내용 | 닫혔을 때 `hidden` 속성 |
| 키 | Enter, Space로 토글 (`<button>`이면 저절로 된다) |

```html
<button type="button" aria-expanded="false" aria-controls="more">자세히</button>
<div id="more" hidden>…</div>

<script>
  const btn = document.querySelector('[aria-controls="more"]');
  const panel = document.getElementById('more');
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
  });
</script>
```

스크린 리더는 버튼에 포커스가 가면 「자세히, 버튼, 접힘」처럼 상태를 읽고, 누르면 「펼침」을 알린다. 상태가 실제 화면과 어긋나면 안 읽는 것보다 나쁘므로 **한 핸들러에서 속성과 화면을 함께 바꾼다.** 회전하는 화살표 같은 스타일도 `[aria-expanded="true"]` 선택자에 걸면 상태가 한 곳에 모인다.

### hidden="until-found": 찾을 수 있게 숨기기

`hidden`으로 숨긴 내용은 페이지 내 찾기와 `#id` 링크로도 찾을 수 없다. FAQ 답변처럼 **접혀 있어도 검색되어야 하는 내용**은 `hidden="until-found"`로 숨긴다.

| 값 | 화면 | 페이지 내 찾기·`#id` 이동 |
| --- | --- | --- |
| `hidden` | 숨김 (`display: none`) | 찾지 못한다 |
| `hidden="until-found"` | 숨김 (`content-visibility: hidden`) | 찾으면 `beforematch` 이벤트 → `hidden` 제거 → 스크롤 |

```html
<button type="button" aria-expanded="false" aria-controls="faq-1">반품 기간은?</button>
<div id="faq-1" hidden="until-found">수령 후 7일 안에 신청한다.</div>

<script>
  const panel = document.getElementById('faq-1');
  const btn = document.querySelector('[aria-controls="faq-1"]');
  // 브라우저가 찾아서 열 때 버튼 상태도 맞춘다
  panel.addEventListener('beforematch', () => btn.setAttribute('aria-expanded', 'true'));
</script>
```

- 열 때 버튼 핸들러는 `panel.hidden = false`, 닫을 때는 `panel.hidden = 'until-found'`로 되돌린다.
- 요소의 `display`가 `none`, `contents`, `inline`이면 찾아도 펼쳐지지 않는다. 블록 요소로 둔다.
- `beforematch`는 Chrome 102, Firefox 139, Safari 26.2부터 지원한다. 지원하지 않는 브라우저에서는 일반 `hidden`처럼 동작하므로 점진적 향상으로 쓸 수 있다.

## 아코디언

아코디언(accordion)은 디스클로저를 여러 개 쌓은 것이다. 한 번에 하나만 열리게 하는 경우가 많다.

### `<details name>`으로 만드는 배타적 아코디언

같은 `name` 값을 가진 `<details>`들은 **하나를 열면 나머지가 닫힌다.** 주요 브라우저가 모두 지원한다(Chrome 120, Safari 17.2, Firefox 130부터).

```html
<details name="branch">
  <summary>입법부</summary>
  <p>법을 만든다.</p>
</details>
<details name="branch">
  <summary>행정부</summary>
  <p>법을 집행한다.</p>
</details>
<details name="branch">
  <summary>사법부</summary>
  <p>법을 해석한다.</p>
</details>
```

### APG 아코디언 패턴

| 요소 | 필요한 것 |
| --- | --- |
| 머리글 | 제목 요소(`<h3>` 등) **안에** `<button aria-expanded aria-controls>`. 제목 탐색으로 각 항목에 닿는다 |
| 패널 | 닫히면 `hidden`. 필요하면 `role="region"` + `aria-labelledby`(버튼 id). 패널이 많으면(대략 6개 넘게) region을 빼서 랜드마크가 넘치지 않게 한다 |
| 키 | Enter·Space로 토글. ↑/↓·Home/End로 머리글 사이 이동은 선택 |

```html
<h3>
  <button type="button" id="acc-1-btn" aria-expanded="true" aria-controls="acc-1">배송</button>
</h3>
<div id="acc-1" role="region" aria-labelledby="acc-1-btn">…</div>
```

한 번에 하나만 열리게 할지, 여러 개를 동시에 열 수 있게 할지는 내용에 따라 정한다. 사용자가 항목을 비교해야 하면 동시에 열리는 편이 낫다.

## 탭 인터페이스

탭(tabs)은 겹친 패널 중 하나만 보여 주고, 패널마다 탭이 하나씩 붙는다. 탭들은 탭 목록(tablist)으로 묶여 패널의 한쪽 가장자리(보통 위)에 놓인다.

**페이지를 이동하는 링크 묶음은 탭이 아니다.** 겉모양이 탭이어도 `<nav>` 안의 링크로 만들고 현재 페이지에 `aria-current="page"`를 준다. Tab과 Enter로 다룬다.

### 자동 활성화와 수동 활성화

| 방식 | 패널이 바뀌는 때 | 맞는 경우 |
| --- | --- | --- |
| 자동(automatic) | 방향키로 탭에 **포커스만 가도** | 모든 패널 내용이 이미 DOM에 있어 즉시 바뀔 때 |
| 수동(manual) | 탭에 포커스한 뒤 Enter·Space를 눌러야 | 탭을 고르면 요청을 보내 내용을 불러올 때. 자동이면 지나가는 탭마다 로딩을 기다려야 한다 |

APG는 지연 없이 패널을 보여 줄 수 있을 때만 자동 활성화를 권한다.

### 키 조작

| 키 | 동작 |
| --- | --- |
| Tab | 탭 목록에 들어오면 **선택된 탭**에 포커스. 한 번 더 누르면 탭 목록을 떠나 패널로 간다. 탭 사이는 Tab으로 움직이지 않는다 |
| ←/→ (가로 목록) | 이전·다음 탭으로. 끝에서는 반대쪽 끝으로 순환 |
| ↑/↓ (세로 목록, `aria-orientation="vertical"`) | 이전·다음 탭으로. 가로 목록에서는 이 키를 가로채지 않아 페이지 스크롤이 그대로 된다 |
| Enter, Space | 수동 방식에서 포커스된 탭을 활성화 |
| Home / End | 첫 탭 / 마지막 탭 (선택이지만 탭이 많으면 큰 도움이 된다) |
| Shift+F10 | 탭에 팝업 메뉴가 있으면 연다 |
| Delete | 탭을 닫을 수 있는 UI라면 닫는다 (선택) |

### role과 속성

| 요소 | 필요한 것 |
| --- | --- |
| 탭 목록 | `role="tablist"`. 보이는 제목이 있으면 `aria-labelledby`, 없으면 `aria-label`. 세로면 `aria-orientation="vertical"` |
| 탭 | `<button role="tab">`, `aria-selected="true\|false"`(선택된 탭 하나만 true), `aria-controls`(패널 id). 선택된 탭만 `tabindex="0"`, 나머지는 `-1` |
| 패널 | `role="tabpanel"`, `aria-labelledby`(탭 id). 선택되지 않은 패널은 `hidden`. 패널 안 첫 내용이 포커스되지 않으면 `tabindex="0"`을 줘서 Tab으로 패널에 닿게 한다 |
| 팝업 메뉴가 있는 탭 | `aria-haspopup="menu"`, 메뉴는 `role="menu"` |

role이 맞으면 스크린 리더가 「탭, 3개 중 2번째」처럼 개수와 위치를 알아서 알린다. `aria-setsize`·`aria-posinset`은 탭을 동적으로 끼워 넣을 때가 아니면 쓰지 않는다.

### 구현 예 (자동 활성화)

```html
<h2 id="lang-heading">예제 언어</h2>
<div role="tablist" aria-labelledby="lang-heading">
  <button role="tab" id="tab-js" aria-selected="true" aria-controls="panel-js">JavaScript</button>
  <button role="tab" id="tab-py" aria-selected="false" aria-controls="panel-py" tabindex="-1">Python</button>
  <button role="tab" id="tab-go" aria-selected="false" aria-controls="panel-go" tabindex="-1">Go</button>
</div>
<div role="tabpanel" id="panel-js" aria-labelledby="tab-js" tabindex="0">…</div>
<div role="tabpanel" id="panel-py" aria-labelledby="tab-py" tabindex="0" hidden>…</div>
<div role="tabpanel" id="panel-go" aria-labelledby="tab-go" tabindex="0" hidden>…</div>
```

```js
const tablist = document.querySelector('[role="tablist"]');
const tabs = [...tablist.querySelectorAll('[role="tab"]')];

function select(tab) {
  for (const t of tabs) {
    const selected = t === tab;
    t.setAttribute('aria-selected', String(selected));
    t.tabIndex = selected ? 0 : -1;               // 로빙 tabindex
    document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
  }
  tab.focus();
}

tablist.addEventListener('click', (e) => {
  const tab = e.target.closest('[role="tab"]');
  if (tab) select(tab);
});

tablist.addEventListener('keydown', (e) => {
  const i = tabs.indexOf(document.activeElement);
  if (i < 0) return;
  const next = {
    ArrowRight: tabs[(i + 1) % tabs.length],
    ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length],
    Home: tabs[0],
    End: tabs[tabs.length - 1],
  }[e.key];
  if (!next) return;
  e.preventDefault();
  select(next);   // 수동 방식이면 여기서는 next.focus()만 하고, click(Enter·Space)에서 select한다
});
```

스타일은 `[role="tab"][aria-selected="true"]`에 건다. 선택 상태를 클래스로 따로 관리하지 않으면 화면과 보조 기술이 어긋날 일이 없다. 탭·콤보박스처럼 복잡한 위젯은 Radix UI·React Aria 같은 헤드리스 라이브러리를 쓰는 것도 방법이다([[a11y-driven-testing|접근성 기반 UI 테스트 자동화]]).

## 애니메이션과 캐러셀

### 움직임은 멈출 수 있어야 한다

스스로 움직이거나 깜박이거나 스크롤되거나 갱신되는 것(자동 캐러셀, 흐르는 뉴스, 토스트, 흔들리는 아이콘)은 모두에게 방해지만, ADHD 같은 주의력 장애·인지 장애가 있는 사람에게는 과제를 끝내지 못하게 만들고, 읽는 데 시간이 더 필요한 사람에게는 내용을 놓치게 한다.

WCAG 2.2.2 Pause, Stop, Hide(A)는 **자동으로 시작해 5초 넘게 이어지고 다른 내용과 함께 보이는** 움직임·자동 갱신을 일시정지·정지·숨김할 수 있게 요구한다. 5초 규칙과 `prefers-reduced-motion`은 [[color-motion-accessibility|색과 움직임의 접근성]]에 있다. 위젯 쪽에서 덧붙일 것은 이렇다.

- 제어는 움직이는 내용 **바로 옆의 `<button>`**으로 둔다. 키보드와 마우스로 모두 누를 수 있어야 한다.
- 한 번 멈추면 사용자가 다시 누를 때까지 멈춰 있고, 다시 누르면 멈춘 자리에서 이어 간다.
- **기본값은 멈춤**이 좋다. 자동 재생이면 사용자가 페이지를 열 때마다 찾아가서 멈춰야 한다.

### 캐러셀은 되도록 쓰지 않는다

캐러셀(carousel, 슬라이더)은 공간을 아끼고 보기 좋지만, 사용자는 대부분 무시하거나 피해 가서 그 안의 내용을 놓친다. 접근성 장벽도 많다. 꼭 써야 하면 **자동 회전보다 수동 캐러셀**(이전·다음 버튼으로만 넘김)이 단순하고 접근성이 좋다.

### 캐러셀이 갖출 것

| 요구 | 방법 |
| --- | --- |
| 모든 기능을 키보드로 | 정지/재생, 이전/다음, 슬라이드 선택을 모두 `<button>`으로. 슬라이드 안 링크에도 잘 보이는 포커스 표시 |
| 컨트롤에 정확한 이름 | 「이전 슬라이드」, 「다음 슬라이드」. 아이콘만 있으면 `aria-label`. 여러 캐러셀이 있으면 「추천 상품 슬라이드 자동 재생 멈추기」처럼 대상을 밝힌다 |
| 정지/재생 버튼의 이름이 상태를 따라간다 | 재생 중이면 「멈추기」, 멈췄으면 「재생」. 이름·보이는 아이콘·실제 상태를 한 번에 바꾼다. APG는 이 버튼에 `aria-pressed`를 쓰지 않고 이름을 바꾸게 한다 |
| 포커스·호버하면 회전이 멈춘다 | 캐러셀 안 어디든 키보드 포커스가 들어가거나 마우스가 올라가면 멈추고, 사용자가 재생 버튼을 누를 때만 다시 돈다 |
| 포커스를 잃지 않는다 | 포커스된 슬라이드가 넘어가 사라지면 포커스가 문서 처음으로 튄다. 회전을 멈추거나 다음 슬라이드로 포커스를 먼저 옮긴다 |
| 숨은 슬라이드에 포커스가 가지 않는다 | 보이지 않는 슬라이드는 `hidden`·`display: none`, 또는 전환 애니메이션 중이면 `inert` |
| 수동으로 넘기면 새 슬라이드를 읽어 준다 | 슬라이드 묶음에 라이브 영역. **회전 중에는 `aria-live="off"`, 멈췄을 때는 `"polite"`** — 자동 회전마다 읽으면 다른 내용을 들을 수 없다 |
| 버튼을 눌러도 포커스는 그대로 | 「다음」을 연달아 누를 수 있게 포커스를 옮기지 않는다 |
| 이미지와 컨트롤의 대체 텍스트·대비 | 슬라이드 이미지에 `alt`, 컨트롤은 색만으로 상태를 구분하지 않는다 |

### APG 캐러셀 마크업

```html
<section aria-roledescription="carousel" aria-label="이번 주 추천">
  <!-- 회전 제어가 캐러셀 안 Tab 순서의 맨 앞 -->
  <button type="button" class="rotate" aria-label="슬라이드 자동 재생 멈추기">⏸</button>
  <button type="button" aria-controls="slides" aria-label="이전 슬라이드">‹</button>
  <button type="button" aria-controls="slides" aria-label="다음 슬라이드">›</button>

  <div id="slides" aria-live="off" aria-atomic="false">
    <div role="group" aria-roledescription="slide" aria-label="3개 중 1">…</div>
    <div role="group" aria-roledescription="slide" aria-label="3개 중 2" hidden>…</div>
    <div role="group" aria-roledescription="slide" aria-label="3개 중 3" hidden>…</div>
  </div>
</section>
```

| 요소 | 규칙 |
| --- | --- |
| 컨테이너 | `region`(`<section>` + 이름) 또는 `group`, `aria-roledescription="carousel"`. 이름에 「캐러셀」을 넣지 않는다(역할 설명과 겹쳐 두 번 읽힌다) |
| 슬라이드 | `role="group"`, `aria-roledescription="slide"`, 이름에 「슬라이드」를 넣지 않는다 |
| 점(dot) 형태의 슬라이드 선택 | 탭처럼 동작하면 탭 패턴(슬라이드는 `tabpanel`, 점은 `tab`, 이름은 「슬라이드 3」), 버튼 묶음이면 이름 붙인 `group` 안의 버튼. 현재 슬라이드 버튼은 Tab 순서에 남도록 `disabled` 대신 `aria-disabled="true"` |

```js
// 회전 시작/정지 때 라이브 영역 정책을 바꾼다
function setRotating(on) {
  slides.setAttribute('aria-live', on ? 'off' : 'polite');
  rotateBtn.setAttribute('aria-label', on ? '슬라이드 자동 재생 멈추기' : '슬라이드 자동 재생 시작');
}
carousel.addEventListener('focusin', () => stop());
carousel.addEventListener('mouseenter', () => stop());
```

## 테스트

1. 키보드만으로 위젯을 끝까지 조작한다. 숨은 내용에 포커스가 들어가지 않는지, 포커스 표시가 늘 보이는지 본다.
2. 스크린 리더(NVDA, VoiceOver)로 트리거의 이름과 상태(「접힘/펼침」, 「선택됨, 3개 중 2」)가 읽히는지 듣는다.
3. 개발자 도구에서 버튼을 누를 때마다 `aria-expanded`·`aria-selected` 값이 실제 화면과 같이 바뀌는지 본다.
4. 캐러셀은 포커스를 넣었을 때 회전이 멈추는지, 「다음」을 눌렀을 때 새 슬라이드가 읽히는지 확인한다.

## 정리

- 펼침과 배타적 아코디언은 **`<details>`/`<summary>`, `<details name>`이 먼저**다. 직접 만들면 `<button>` + `aria-expanded` + `hidden`.
- 검색되어야 하는 접힌 내용은 `hidden="until-found"`와 `beforematch`로 숨긴다.
- 탭은 APG 패턴 그대로: `tablist`·`tab`·`tabpanel`, 선택된 탭만 `tabindex="0"`, 방향키 이동, 지연이 있으면 수동 활성화.
- 캐러셀은 피하는 게 최선이다. 쓰면 정지 버튼, 포커스·호버 시 정지, 숨은 슬라이드 차단, 회전 중 `aria-live="off"`를 갖춘다.
- 상태 속성은 화면과 같은 핸들러에서 갱신하고, 스타일도 그 속성에 건다.

관련 노트: [[aria-basics|ARIA와 접근 가능한 이름]], [[accessible-design-process|디자인 단계의 접근성]], [[keyboard-accessibility|키보드 접근성과 포커스 관리]], [[color-motion-accessibility|색과 움직임의 접근성]], [[web-accessibility|웹 접근성: 표준 준수에서 실제 사용성까지]], [[a11y-driven-testing|접근성 기반 UI 테스트 자동화]], [[html-lesser-known-attributes|잘 안 쓰지만 쓸모 있는 HTML 속성]], [[html-interactive-elements|포커스 속성과 details·dialog]], [[aria-widget-patterns|복합 위젯의 ARIA 패턴: 콤보박스·날짜 선택기·메뉴·상태 알림]]
