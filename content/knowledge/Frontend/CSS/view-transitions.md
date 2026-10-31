---
title: "View Transitions: 화면 전환 애니메이션"
concept: "View Transitions"
summary: "SPA에서 DOM을 바꾸는 코드를 document.startViewTransition()으로 감싸면 브라우저가 옛 화면을 스냅숏으로 찍고 새 화면과 교차 페이드한다. ::view-transition-old·new·group 가상 요소로 애니메이션을 바꾸고, view-transition-name으로 특정 요소를 이어 움직이고, 전환 유형으로 방향을 나누고, 움직임 줄이기 설정을 존중하는 법을 정리한다."
tags: ["css", "frontend", "animation", "spa"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/css/view-transitions-spas", "https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API", "https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition"]
---

> web.dev의 「[Learn CSS](https://web.dev/learn/css)」 강좌의 View Transitions for SPAs 모듈을 바탕으로, 브라우저 지원은 MDN 호환성 데이터로 확인해 재구성한 노트다.

## View Transitions란

SPA는 페이지를 새로 받지 않고 JS로 DOM을 바꾼다([[spa-csr-ssr|SPA와 CSR·SSR]]). 그래서 새 내용이 그냥 툭 바뀐다. 옛 화면을 페이드아웃하면서 새 화면을 페이드인하려면 두 화면이 잠깐 동시에 있어야 하는데, 옛 DOM은 이미 교체돼 사라졌다. View Transitions API는 브라우저가 옛 화면의 **스냅숏**을 남겨 이 문제를 푼다.

| 종류 | 시작 방법 | 지원 |
| --- | --- | --- |
| 같은 문서 전환(SPA) | `document.startViewTransition(콜백)` | Firefox 144로 모든 주요 브라우저(Baseline 2025) |
| 문서 간 전환(MPA) | 양쪽 페이지 CSS에 `@view-transition { navigation: auto; }` | Chrome 126·Safari 18.2. Firefox는 미지원 |

## 기본 사용

```js
function navigate(update) {
  if (!document.startViewTransition) {   // 지원하지 않으면 그냥 바꾼다
    update();
    return;
  }
  document.startViewTransition(() => update());
}
```

1. 호출하면 브라우저가 현재 화면을 찍는다.
2. 콜백을 실행해 DOM을 새 화면으로 바꾼다(아직 보이지 않는다).
3. 콜백이 끝나면(Promise면 resolve된 뒤) 옛 스냅숏과 새 화면 사이를 애니메이션한다. 기본은 **교차 페이드**다.

지원하지 않는 브라우저에서도 화면은 바뀌어야 한다. 전환은 점진적 향상이다([[css-progressive-enhancement|CSS 점진적 향상]]). 프레임워크 라우터마다 이 콜백을 넣는 위치가 다르다.

## 애니메이션 바꾸기

전환 중에는 가상 요소 트리가 생긴다. 일반 CSS 애니메이션 속성으로 꾸민다.

```text
::view-transition
└─ ::view-transition-group(root)          위치·크기 변화
   └─ ::view-transition-image-pair(root)
      ├─ ::view-transition-old(root)      떠나는 화면 스냅숏
      └─ ::view-transition-new(root)      들어오는 화면
```

```css
::view-transition-group(root) { animation-duration: 200ms; }
::view-transition-old(root)   { animation-name: slide-out-to-left; }
::view-transition-new(root)   { animation-name: slide-in-from-right; }
```

`root`는 문서 루트 요소에 브라우저가 기본으로 붙인 `view-transition-name`이다.

## 방향마다 다른 전환: 전환 유형

앞으로 갈 때와 뒤로 갈 때 슬라이드 방향이 달라야 하면 유형(type)을 붙인다.

```js
document.startViewTransition({
  update: updateTheDOM,
  types: [next === 'home' ? 'backwards' : 'forwards'],
});
```

```css
html:active-view-transition-type(forwards) {
  &::view-transition-old(root) { animation-name: slide-out-to-left; }
  &::view-transition-new(root) { animation-name: slide-in-from-right; }
}
```

옵션 객체(`update`, `types`)와 `:active-view-transition-type()`은 2026년 1월 Firefox 147부터 모든 주요 브라우저가 지원한다. 그 전 브라우저는 콜백 함수 형태만 안다.

## 특정 요소 이어 움직이기

목록의 썸네일이 상세 화면의 큰 이미지로 날아가는 효과는 두 요소에 같은 `view-transition-name`을 준다. 브라우저가 옛 위치·크기에서 새 위치·크기로 그룹을 움직이고, 이름 없는 나머지는 교차 페이드한다.

```css
.album-art { view-transition-name: album-art; }
.song-title { view-transition-name: song-title; }
```

규칙: **한 이름에 요소가 정확히 하나**여야 한다. 전환 시작 전 옛 화면에 하나, 콜백이 끝난 뒤 새 화면에 하나. 목록처럼 같은 모양 요소가 여러 개면 두 가지 방법이 있다.

| 방법 | 내용 |
| --- | --- |
| 항목마다 고유 이름 | `style="view-transition-name: post-42"`처럼 ID로 만들고, 상세 화면에서도 같은 이름을 쓴다 |
| 클릭한 것에만 이름 | 클릭한 항목에만 일반 이름을 붙인 뒤 `startViewTransition()`을 부른다 |

자연스럽게 보이도록 다듬을 점:

- 줄바꿈 없는 제목은 `width: fit-content`를 줘 옛·새 요소의 너비 차이를 줄인다.
- 옛·새 이미지의 가로세로 비율이 다르면 `object-fit`과 그룹 애니메이션을 조정한다.

## 움직임 줄이기

화면 전체가 움직이는 전환은 전정 장애가 있는 사용자에게 어지러움을 준다. 끄거나 더 약한 효과로 바꾼다.

```css
@media (prefers-reduced-motion) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) { animation: none !important; }
}
```

기준은 [[color-motion-accessibility|색과 움직임의 접근성]]에 있다.

## 정리

- DOM 변경 코드를 `document.startViewTransition()`으로 감싸면 기본 교차 페이드가 생긴다. 미지원 브라우저용 분기를 둔다.
- 꾸미기는 `::view-transition-old/new/group()` 가상 요소에 애니메이션을 주는 것이다.
- 요소를 이어 움직이려면 옛·새 화면에 같은 `view-transition-name`을 하나씩 둔다.
- 방향별 전환은 `types`와 `:active-view-transition-type()`.
- `prefers-reduced-motion`이면 끄거나 약하게.

관련 노트: [[css-animation|CSS 애니메이션: transition과 @keyframes]], [[spa-csr-ssr|SPA와 CSR·SSR]], [[css-progressive-enhancement|CSS 점진적 향상: 폴백과 피처 쿼리]], [[color-motion-accessibility|색과 움직임의 접근성]]
