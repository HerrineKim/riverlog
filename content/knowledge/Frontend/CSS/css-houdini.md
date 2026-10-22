---
title: "CSS Houdini: 렌더링 엔진에 끼어드는 API"
concept: "CSS Houdini"
summary: "브라우저 CSS 엔진의 파싱·스타일·레이아웃·페인트·합성 단계에 개발자 코드를 걸 수 있게 하려는 저수준 API 묶음. CSS 폴리필이 왜 어려운지에서 출발해 워크릿, Properties and Values(@property), Typed OM, Paint·Layout·Animation Worklet의 역할과 2026년 기준 지원 상태를 정리한다. 모든 브라우저에 들어간 것은 @property와 일부 Typed OM뿐이다."
tags: ["css", "browser", "rendering", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://developer.chrome.com/docs/css-ui/houdini", "https://www.smashingmagazine.com/2016/03/houdini-maybe-the-most-exciting-development-in-css-youve-never-heard-of/", "https://developer.mozilla.org/en-US/docs/Web/API/Houdini_APIs", "https://developer.mozilla.org/en-US/docs/Web/CSS/@property", "https://developer.mozilla.org/en-US/docs/Web/API/CSS_Typed_OM_API"]
---

> 「[Houdini - Demystifying CSS](https://developer.chrome.com/docs/css-ui/houdini)」와 「[Houdini: Maybe The Most Exciting Development In CSS You've Never Heard Of](https://www.smashingmagazine.com/2016/03/houdini-maybe-the-most-exciting-development-in-css-youve-never-heard-of/)」을 바탕으로, 지원 상태는 MDN 문서와 browser-compat-data(2026.10)로 확인해 재구성한 노트다.

## Houdini란

Houdini는 W3C TAG와 CSS 작업 그룹의 합동 태스크포스, 그리고 그곳에서 만든 **저수준 API 묶음**의 이름이다. 목표는 지금까지 브라우저만 다루던 CSS 엔진 내부 단계를 개발자에게 열어, **CSS를 JS처럼 확장·폴리필할 수 있게** 하는 것이다.

## 왜 필요했나: CSS 폴리필이 어려운 이유

JS의 새 기능은 제안 단계에서도 Babel·폴리필로 바로 쓴다. CSS는 표준화와 모든 브라우저 구현을 기다려야 했다. CSS를 CSS로 폴리필하기 어렵고, JS로 하려면 렌더링 파이프라인에 손댈 곳이 거의 없기 때문이다.

```text
HTML 파싱 ─ CSS 파싱 ─ 캐스케이드 ─ 레이아웃 ─ 페인트 ─ 합성
   DOM ✓      CSSOM △     ✗          ✗         ✗        ✗
```

- 개발자가 온전히 다룰 수 있는 곳은 DOM뿐이다. CSSOM은 **모르는 규칙·선언을 버리고**, 다른 출처 스타일시트는 보여 주지 않는다.
- 그래서 CSS 폴리필은 `<style>`·`<link>`를 직접 받아 **자체 파서와 캐스케이드**를 돌린 뒤 DOM을 고친다. 크고 버그가 많다.
- DOM을 고치면 브라우저가 캐스케이드·레이아웃·페인트·합성을 처음부터 다시 한다. 스크롤·리사이즈마다 돌면 성능이 무너진다.

Houdini는 각 단계에 공식 훅을 달아, 폴리필과 새 기능 실험이 **엔진 안에서** 돌게 하려 했다. 렌더링 단계 자체는 [[browser-rendering|브라우저 렌더링 과정]]에 있다.

## 기반: 워크릿(Worklet)

Houdini 코드는 **워크릿**에서 돈다. 웹 워커와 비슷하지만 훨씬 가볍고 수명이 짧다. 매 프레임 불릴 수 있는 작은 함수를 렌더링 파이프라인 안에서 실행하기 위한 것이다. 메인 스레드와 분리돼 DOM에 접근할 수 없고, 정해진 모양의 클래스를 등록한다.

```js
CSS.paintWorklet.addModule('checkerboard.js')   // 워크릿 모듈 등록
```

같은 개념을 쓰는 Audio Worklet(Web Audio)은 모든 브라우저에 들어갔다.

## API 한눈에 보기 (2026년 기준)

| API | 끼어드는 단계 | 하는 일 | 지원 |
| --- | --- | --- | --- |
| **Properties and Values** (`@property`, `CSS.registerProperty()`) | 스타일 | 커스텀 속성에 타입·상속 여부·초깃값을 준다 | **모든 주요 브라우저**(Chrome 85, Safari 16.4, Firefox 128, Baseline 2024) |
| **Typed OM** | 스타일 | CSS 값을 문자열이 아니라 타입 있는 객체로 읽고 쓴다 | Chromium 66, Safari 16.4. Firefox는 미지원 |
| **Paint API** (`paint()`) | 페인트 | 배경·테두리·마스크 이미지를 캔버스 코드로 그린다 | Chromium 65만. Firefox·Safari 미지원 |
| Layout API (`display: layout(…)`) | 레이아웃 | 자식 배치를 직접 계산한다(예: 메이슨리) | 출시된 브라우저 없음(Chromium 실험 플래그) |
| Animation Worklet | 합성 | 스크롤·시간에 묶인 애니메이션을 합성 스레드에서 | 출시된 브라우저 없음 |
| Parser API, Font Metrics API | 파싱, 글꼴 | 새 문법 등록, 글꼴 지표 읽기 | 초안 수준에서 멈춤 |

### Properties and Values: 가장 성공한 조각

타입이 없는 커스텀 속성은 그냥 문자열이라 **전환·애니메이션이 되지 않는다.** 타입을 등록하면 브라우저가 중간값을 계산할 수 있다.

```css
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
.spinner {
  background: conic-gradient(from var(--angle), #08f, #f80);
  transition: --angle 1s;
}
.spinner:hover { --angle: 180deg; }   /* 그라디언트가 부드럽게 돈다 */
```

`body`에 테마 클래스를 붙일 때 `--primary`를 쓰는 모든 요소가 함께 색을 바꾸며 전환되는 것도 같은 원리다. 색상 체계에서의 쓰임은 [[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]]에 있다.

### Typed OM: 문자열 대신 값 객체

```js
el.attributeStyleMap.set('opacity', 0.5)
el.attributeStyleMap.get('width')          // CSSUnitValue { value: 100, unit: 'px' }
CSS.px(10).add(CSS.percent(50))            // calc(10px + 50%)
el.computedStyleMap().get('font-size').value
```

`element.style.width = x + 'px'`처럼 문자열을 이어 붙이고 다시 `parseFloat`하는 과정이 사라지고, 단위 오류가 줄며 파싱 비용이 준다.

### Paint API: 그리는 코드

```js
// checkerboard.js (워크릿)
registerPaint('checkerboard', class {
  static get inputProperties() { return ['--size'] }
  paint(ctx, geom, props) {
    const size = parseInt(props.get('--size'))
    for (let y = 0; y < geom.height / size; y++)
      for (let x = 0; x < geom.width / size; x++)
        if ((x + y) % 2) ctx.fillRect(x * size, y * size, size, size)
  }
})
```

```css
.box { --size: 16; background-image: paint(checkerboard); }
```

요소 크기가 바뀌면 브라우저가 알아서 다시 그린다. 지원하지 않는 브라우저를 위해 `background-image`를 일반 값으로 먼저 선언하고 `@supports (background: paint(id))`로 덮는다([[css-progressive-enhancement|CSS 점진적 향상]]).

## 결과적으로 무엇이 남았나

Houdini가 꿈꾼 "모든 단계를 개발자에게 연다"는 그대로 이뤄지지 않았다. 대신 Houdini가 풀려던 사용 사례 상당수는 **네이티브 CSS 기능**으로 들어왔다.

| Houdini로 하려던 일 | 지금의 네이티브 기능 |
| --- | --- |
| 스크롤에 묶인 합성 애니메이션(Animation Worklet) | 스크롤 기반 애니메이션 `animation-timeline: scroll()`·`view()`([[css-animation\|CSS 애니메이션]]) |
| 메이슨리 레이아웃(Layout API) | CSS 메이슨리 레이아웃 제안(`display: grid-lanes`). 아직 일부 브라우저 실험 단계 |
| 커스텀 속성 애니메이션 | `@property`(모든 브라우저) |
| 툴팁 위치 계산 | 앵커 위치 지정([[popover-anchor-positioning\|팝오버와 앵커 위치 지정]]) |

실무에서 쓸 수 있는 것은 **`@property`는 어디서나, Typed OM과 Paint API는 점진적 향상으로**다.

## 정리

- Houdini는 CSS 엔진의 각 단계에 훅을 달아, CSS도 JS처럼 폴리필·확장할 수 있게 하려는 API 묶음이다.
- 모든 주요 브라우저에 들어간 것은 `@property`(타입 있는 커스텀 속성)뿐이고, Typed OM은 Firefox가, Paint API는 Chromium만 지원한다.
- Layout·Animation Worklet이 노린 문제는 스크롤 기반 애니메이션·앵커 위치 지정 같은 네이티브 기능이 대신 풀고 있다.

관련 노트: [[browser-rendering|브라우저 렌더링 과정]], [[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]], [[css-progressive-enhancement|CSS 점진적 향상: 폴백과 피처 쿼리]], [[how-css-works|CSS가 동작하는 방식: 핵심 개념과 픽셀이 되기까지]]
