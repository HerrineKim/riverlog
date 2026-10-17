---
title: "JavaScript 애니메이션: requestAnimationFrame과 Web Animations API"
concept: "JavaScript Animation"
summary: "CSS로 부족한 애니메이션을 JavaScript로 만드는 두 방법. requestAnimationFrame 위에 duration·timing·draw로 나눈 범용 animate 함수를 짜고, 타이밍 함수(power·back·bounce·elastic)와 easeOut·easeInOut 변환을 직접 만든다. 브라우저 엔진을 그대로 쓰는 element.animate()는 재생 제어, finished 프로미스, commitStyles, 스크롤 타임라인을 준다."
tags: ["javascript", "animation", "browser", "performance", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/js-animation", "https://ko.javascript.info/css-animations", "https://ko.javascript.info/bezier-curve", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API", "https://developer.mozilla.org/en-US/docs/Web/API/ScrollTimeline"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「자바스크립트 애니메이션」, 「CSS 애니메이션」 글을 바탕으로, Web Animations API는 MDN으로 확인해 재구성한 노트다.

## 언제 JavaScript로 움직이나

단순한 상태 전환은 CSS `transition`·`@keyframes`가 더 짧고 가볍다(→ [[css-animation|CSS 애니메이션: transition과 @keyframes]]). JavaScript가 필요한 경우는 다음과 같다.

| 필요 | 이유 |
| --- | --- |
| 베지어 곡선으로 못 그리는 진행 곡선 | 튀기(bounce), 탄성(elastic)처럼 여러 번 되돌아오는 곡선 |
| 재생 제어 | 일시 정지, 되감기, 속도 변경, 특정 시점으로 이동 |
| 스타일이 아닌 것을 그리기 | 캔버스, 텍스트 한 글자씩 출력, 요소 생성 |
| 입력에 반응 | 드래그, 스크롤 위치, 물리 시뮬레이션 |

방법은 두 갈래다. **프레임마다 직접 그리는 `requestAnimationFrame`**, 그리고 **브라우저 애니메이션 엔진을 쓰는 Web Animations API(`element.animate()`)** 다.

## requestAnimationFrame

```js
const id = requestAnimationFrame(function step(time) {
  // time: 페이지 로드 후 경과 ms (performance.now()와 같은 기준)
  // ...그리기...
  requestAnimationFrame(step);   // 다음 프레임 예약
});
cancelAnimationFrame(id);        // 취소
```

- 브라우저가 **다음 화면을 그리기 직전**에 콜백을 부른다. 여러 애니메이션의 변경이 한 번의 레이아웃·페인트로 묶인다.
- 숨은 탭에서는 호출되지 않는다. 자원을 아끼지만 애니메이션도 멈춘다.
- 호출 간격은 고정이 아니다. 주사율(60Hz, 120Hz)과 부하에 따라 달라진다.

과거에는 `setInterval(fn, 20)`으로 스타일을 조금씩 바꿨다. 주사율과 어긋나 끊기고, 애니메이션마다 따로 다시 그리며, 숨은 탭에서도 돈다. 타이머 일반은 [[timers|타이머: setTimeout과 setInterval]]에 있다.

## 범용 animate 함수

**진행률은 프레임 수가 아니라 경과 시간으로 계산한다.** 그래야 프레임이 빠지거나 주사율이 달라도 전체 길이가 같다. 애니메이션을 세 가지 관심사로 나눈다.

```js
function animate({ duration, timing, draw }) {
  const start = performance.now();
  requestAnimationFrame(function step(time) {
    let fraction = (time - start) / duration;  // 시간 진행: 0 → 1
    if (fraction > 1) fraction = 1;
    draw(timing(fraction));                      // 진행률을 그린다
    if (fraction < 1) requestAnimationFrame(step);
  });
}

animate({
  duration: 1000,
  timing: (t) => t * t,                          // 점점 빨라진다
  draw: (p) => { box.style.transform = `translateX(${p * 300}px)`; },
});
```

| 매개변수 | 받는 값 | 돌려주는 값 |
| --- | --- | --- |
| `duration` | 전체 길이(ms) | |
| `timing(t)` | 시간 진행 0~1 | 애니메이션 진행률. 0~1을 벗어나도 된다(튀어 나가기) |
| `draw(p)` | 진행률 | 화면을 그린다. CSS든 캔버스든 텍스트든 상관없다 |

`timing`이 CSS와 달리 **베지어 곡선에 묶이지 않는** 아무 함수라는 점이 핵심이다.

## 타이밍 함수 모음

| 이름 | 식 `timing(t)` | 모양 |
| --- | --- | --- |
| linear | `t` | 일정한 속도 |
| power (quad, cubic…) | `t ** n` | n이 클수록 끝에서 급가속 |
| circ | `1 - Math.sin(Math.acos(t))` | 원호. 마지막에 확 빨라진다 |
| back | `t ** 2 * ((x + 1) * t - x)` | 활시위처럼 뒤로 당겼다가 튀어 나간다. `x`는 당기는 정도 |
| bounce | 구간별 2차식 | 공이 바닥에서 튀다 멈춘다 |
| elastic | `2 ** (10 * (t - 1)) * Math.cos(20 * Math.PI * x / 3 * t)` | 고무줄처럼 떨린다 |

### easeIn을 easeOut·easeInOut으로 바꾸기

위 함수는 모두 효과가 **끝 쪽에** 몰리는 easeIn 형태다. 시간을 뒤집으면 효과를 반대쪽으로 옮길 수 있다.

```js
// easeOut: 앞에서 효과가 나고 끝에서 차분해진다 (뒤집은 시간, 뒤집은 결과)
const makeEaseOut = (timing) => (t) => 1 - timing(1 - t);

// easeInOut: 전반은 easeIn을 절반 크기로, 후반은 easeOut을 절반 크기로
const makeEaseInOut = (timing) => (t) =>
  t < 0.5 ? timing(2 * t) / 2 : (2 - timing(2 * (1 - t))) / 2;

const bounceEaseOut = makeEaseOut(bounce);   // 떨어진 공이 바닥에서 튀는 자연스러운 모양
```

`bounce`를 그대로 쓰면 튀기가 처음에 나와 어색하다. 등장에는 easeOut이 대개 자연스럽다.

## Web Animations API

브라우저는 CSS 애니메이션·트랜지션을 내부 엔진으로 돌린다. **Web Animations API는 그 엔진을 JavaScript에 연 것**이다. 매 프레임 코드를 돌리지 않아도 되고, 합성 단계에서 실행될 수 있어 `transform`·`opacity` 애니메이션은 메인 스레드가 바빠도 부드럽다.

```js
const anim = card.animate(
  [
    { opacity: 0, transform: 'translateY(16px)' },
    { opacity: 1, transform: 'none' },          // offset을 안 쓰면 균등 배치
  ],
  { duration: 400, easing: 'ease-out', fill: 'both' },
);

await anim.finished;          // 끝나면 resolve, cancel()이면 reject
anim.commitStyles();          // 마지막 값을 style 속성에 굳힌다
anim.cancel();                // 효과 제거 → 굳힌 스타일만 남는다
```

### CSS와 다른 기본값

| 항목 | CSS `animation` | `animate()` |
| --- | --- | --- |
| 길이 | `"400ms"`, `"0.4s"` | 숫자 ms(`400`). 두 번째 인수에 숫자만 줘도 된다 |
| 무한 반복 | `infinite` | `Infinity` |
| 기본 곡선 | `ease` | **`linear`** |
| 키프레임 | `@keyframes` 규칙 | 객체 배열, 또는 `{ opacity: [0, 1] }` 같은 속성별 배열 |

### 재생 제어

| 멤버 | 하는 일 |
| --- | --- |
| `play()` · `pause()` · `finish()` · `cancel()` | 재생, 일시 정지, 끝으로 건너뛰기, 중단(효과 제거) |
| `reverse()` | 거꾸로 재생 |
| `currentTime` | 재생 위치(ms). 대입하면 그 시점으로 이동한다 |
| `updatePlaybackRate(rate)` | 끊김 없이 속도 변경. `playbackRate` 직접 대입보다 권장 |
| `finished` · `onfinish` · `oncancel` | 끝남·취소 감지 |
| `element.getAnimations()` · `document.getAnimations()` | CSS로 시작한 애니메이션까지 모두 가져온다 |

```js
// 사용자가 움직임 줄이기를 원하면 페이지의 모든 애니메이션을 늦춘다
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.getAnimations().forEach((a) => a.updatePlaybackRate(a.playbackRate * 0.5));
}
```

### fill: 'forwards' 대신 commitStyles

끝난 상태를 유지하려고 `fill: 'forwards'`를 쓰면 애니메이션이 계속 살아 자원을 쓰고, 애니메이션 값이 캐스케이드에서 일반 스타일보다 앞서 나중에 스타일을 바꿔도 반영되지 않는다. **끝나면 `commitStyles()`로 값을 굳히고 `cancel()`한다.** 덮어써진 채 끝난 fill 애니메이션은 브라우저가 자동으로 지우며, 막으려면 `persist()`를 부른다.

### 스크롤 타임라인

`timeline` 옵션에 `ScrollTimeline`·`ViewTimeline`을 주면 시간 대신 스크롤 위치가 진행률이 된다. 아직 Baseline이 아니므로(일부 주요 브라우저 미지원) CSS `animation-timeline: scroll()`과 같이 점진적 향상으로 쓴다.

```js
el.animate({ rotate: ['0deg', '360deg'] },
  { timeline: new ScrollTimeline({ source: document.documentElement, axis: 'block' }) });
```

## CSS 애니메이션과 연결하기

| 이벤트 | 언제 | 쓸모 |
| --- | --- | --- |
| `transitionend` | 트랜지션 하나가 끝날 때. **속성마다 한 번씩** 발생 | `event.propertyName`으로 걸러서 다음 동작을 잇는다 |
| `animationstart` · `animationiteration` · `animationend` | `@keyframes` 애니메이션의 시작·반복·끝 | `event.animationName`, `elapsedTime` |

여러 단계를 이벤트로 이어 붙이기 시작하면 `animate()`의 `finished`를 `await`하는 쪽이 읽기 쉽다.

## 라이브러리를 고를 때

여러 요소의 타임라인, 스프링 물리, 레이아웃 전환(FLIP)이 필요하면 GSAP, Motion 같은 라이브러리를 쓴다. 이들도 내부에서 `requestAnimationFrame`이나 Web Animations API를 쓴다.

## 정리

- 단순 전환은 CSS, 재생 제어나 임의의 곡선이 필요하면 JavaScript.
- 직접 그릴 때는 `requestAnimationFrame` + **경과 시간 기반 진행률** + `timing`·`draw` 분리.
- easeIn 함수 하나로 `1 - f(1 - t)`(easeOut)와 easeInOut을 만든다.
- 요소 스타일 애니메이션은 `element.animate()`가 기본. 기본 곡선이 `linear`라는 점에 주의하고, 끝 상태는 `commitStyles()`로 굳힌다.
- `prefers-reduced-motion`은 JavaScript 애니메이션에도 적용한다.

**같은 움직임이라면 브라우저 엔진에 맡길수록 부드럽고, 직접 그릴수록 자유롭다.**

관련 노트: [[css-animation|CSS 애니메이션: transition과 @keyframes]], [[bezier-curve|베지어 곡선]], [[timers|타이머: setTimeout과 setInterval]], [[browser-rendering|브라우저 렌더링 과정]], [[color-motion-accessibility|색과 움직임의 접근성]]
