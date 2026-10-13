---
title: "CSS position과 z-index"
concept: "Position"
summary: "요소를 문서 흐름 안팎에서 원하는 위치로 옮기는 position 속성, 쌓임 순서를 정하는 z-index와 쌓임 맥락, 다른 요소에 붙여 배치하는 앵커 위치 지정."
tags: ["css", "layout", "frontend"]
source: til
sources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioning/Stacking_context", "https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-name"]
date: "2026-10-13"
---

`position`은 요소가 **무엇을 기준으로** 배치될지 정하는 속성이다. `static`이 아닌 값을 주면 좌표 속성(`top`, `right`, `bottom`, `left`)으로 위치를 옮길 수 있고, 일부 값은 요소를 Normal Flow 밖으로 꺼낸다.

## position 값

| 값 | 기준 | Normal Flow | 주 용도 |
| --- | --- | --- | --- |
| `static` | 문서 흐름(기본값) | 유지 | 일반 배치. 좌표 속성이 적용되지 않는다 |
| `relative` | **자기 자신의 원래(static) 위치** | 유지 — 원래 자리를 그대로 차지 | 살짝 이동, `absolute` 자식의 기준점 |
| `absolute` | `static`이 아닌 **가장 가까운 조상**(없으면 초기 컨테이닝 블록, 사실상 문서 최상단) | 벗어남 — 공간 차지 안 함 | 아이콘·배지·레이어를 특정 위치에 고정 |
| `fixed` | **뷰포트** | 벗어남 | 스크롤해도 같은 자리에 있는 헤더·플로팅 버튼 |
| `sticky` | 스크롤 컨테이너 | 유지하다가 조건 충족 시 고정 | 스크롤하다 특정 위치에 닿으면 붙는 헤더 |

### absolute 사용 패턴

`absolute` 요소는 문서 흐름을 벗어나므로 부모는 이 요소의 크기를 알지 못한다. 그래서 보통 **부모(기준이 될 조상)에 `position: relative`** 를 주고, 그 안에서 위치를 잡는다.

```css
.card {
  position: relative; /* 기준점 */
}

.card .badge {
  position: absolute; /* .card 기준으로 배치 */
  top: 8px;
  right: 8px;
}
```

"좌표 시스템을 쓴다" = `position`이 `static`이 아니다. `absolute`는 그런 조상 중 가장 가까운 것을 기준으로 삼는다.

### sticky

`top: 0` 같은 임계값과 함께 쓰며, 스크롤 위치가 그 값에 도달하기 전까지는 `relative`처럼, 도달한 뒤에는 `fixed`처럼 동작한다.

```css
.section-header {
  position: sticky;
  top: 0;
}
```

## 좌표와 z-index

- X축: `left`, `right`
- Y축: `top`, `bottom`
- Z축: `z-index`. 값이 클수록 위에 쌓인다. `position`이 `static`이 아닌 요소(또는 flex/grid 아이템)에서 동작한다.

z-index는 관리하지 않으면 어느새 엉뚱한 요소가 위로 올라와 있다. 팀 안에서 규칙을 정해 두는 것이 좋다.

| 상황 | 증가 단위 예시 |
| --- | --- |
| 일반적인 겹침 | 5씩 |
| 큰 레이아웃(헤더, 사이드바) | 100씩 |
| 반드시 최상단(모달, 토스트) | 10000 단위 |

### 쌓임 맥락: z-index가 안 먹는 이유

`z-index`는 문서 전체에서 비교되지 않는다. **같은 쌓임 맥락(stacking context) 안에서만** 비교된다. 부모가 쌓임 맥락을 만들면 자식의 `z-index: 9999`도 부모 바깥의 요소를 넘지 못한다.

| 쌓임 맥락을 만드는 것 | 예 |
| --- | --- |
| 위치 지정 + `z-index` 값 | `position: relative; z-index: 1` |
| `position: fixed`, `sticky` | 값과 상관없이 |
| 1 미만 투명도 | `opacity: .99` |
| 변형·효과 | `transform`, `filter`, `backdrop-filter`, `mix-blend-mode` |
| 기타 | `isolation: isolate`, `will-change`, `contain: paint` |

컴포넌트 안의 겹침을 바깥과 분리하려면 `isolation: isolate`로 일부러 쌓임 맥락을 만든다. 모달·토스트·드롭다운은 `<dialog>`의 `showModal()`이나 `popover` 속성을 쓰면 **최상위 레이어(top layer)**에 올라가 `z-index` 경쟁에서 벗어난다.

### fixed가 뷰포트를 기준으로 하지 않을 때

조상에 `transform`, `filter`, `perspective`, `contain: paint`, `will-change: transform`이 있으면 `position: fixed`는 뷰포트가 아니라 **그 조상**을 기준으로 배치된다. 애니메이션 래퍼 안의 고정 헤더가 스크롤에 따라 움직이면 이 경우다.

## 앵커 위치 지정

툴팁·드롭다운처럼 **다른 요소 옆에 붙어야 하는 요소**는 예전에는 JS(Popper, Floating UI)로 좌표를 계산했다. CSS 앵커 위치 지정(anchor positioning)은 이를 CSS만으로 한다. 2026년 1월 Firefox 147이 지원하면서 모든 주요 브라우저에서 쓸 수 있다(Baseline 2026).

```css
.trigger { anchor-name: --menu; }
.menu {
  position: absolute;
  position-anchor: --menu;
  position-area: bottom span-right;          /* 기준 요소 아래, 오른쪽으로 펼침 */
  position-try-fallbacks: flip-block;        /* 화면 아래가 모자라면 위로 뒤집기 */
}
```

`anchor()` 함수로 `top: anchor(bottom)`처럼 기준 요소의 가장자리를 좌표로 쓸 수도 있다. `popover`와 함께 쓰면 최상위 레이어 + 앵커 배치로 JS 없이 메뉴를 만든다.

## 핵심 정리

- `relative`는 자기 자리 기준 이동(공간 유지), `absolute`는 가장 가까운 positioned 조상 기준(공간 제거).
- `absolute`를 쓸 때는 기준이 될 부모에 `relative`를 준다.
- `fixed`는 뷰포트 기준, `sticky`는 스크롤 조건에 따라 `relative`↔`fixed`.
- z-index는 같은 쌓임 맥락 안에서만 비교된다. `transform`·`opacity` 등이 새 맥락을 만든다.
- 다른 요소에 붙는 툴팁·메뉴는 앵커 위치 지정, 맨 위에 떠야 하는 것은 `popover`·`<dialog>`의 최상위 레이어로.

관련 노트: [[how-css-works|CSS가 동작하는 방식: 핵심 개념과 픽셀이 되기까지]], [[transform|transform: 이동·회전·확대·기울이기]], [[box-model|박스 모델과 display]]
