---
title: "UI 모션 디자인: 애니메이션 원칙, 모션 커브, 안무"
concept: "Motion Design"
summary: "UI 애니메이션을 자연스럽게 만드는 원리. 디즈니의 애니메이션 12원칙을 웹에 옮기는 법, 속도는 모션 커브의 기울기라는 이해와 cubic-bezier 읽기, 축마다 다른 타이밍으로 곡선 경로를 만드는 겹친 애니메이션과 offset-path, 여러 요소를 시차로 움직이는 안무, 60fps를 지키는 구현 규칙을 정리한다."
tags: ["design", "animation", "css", "performance", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://www.smashingmagazine.com/2011/09/the-guide-to-css-animation-principles-and-examples/", "https://www.smashingmagazine.com/2016/08/css-animations-motion-curves/", "http://tobiasahlin.com/blog/curved-path-animations-in-css/", "https://blog.gyrosco.pe/smooth-css-animations-7d8ffc2c1d29", "https://developer.mozilla.org/en-US/docs/Web/CSS/offset-path", "https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style"]
---

> 「[The Guide To CSS Animation: Principles and Examples](https://www.smashingmagazine.com/2011/09/the-guide-to-css-animation-principles-and-examples/)」, 「[Upgrading CSS Animation With Motion Curves](https://www.smashingmagazine.com/2016/08/css-animations-motion-curves/)」, 「[Moving along a curved path in CSS with layered animation](http://tobiasahlin.com/blog/curved-path-animations-in-css/)」, 「[10 principles for smooth web animations](https://blog.gyrosco.pe/smooth-css-animations-7d8ffc2c1d29)」을 바탕으로, 지금의 CSS 기능은 MDN 문서로 확인해 재구성한 노트다.

## UI 모션이란

UI 애니메이션은 장식이 아니라 **상태 변화를 설명하는 수단**이다. 무엇이 어디서 와서 어디로 갔는지, 무엇을 눌러야 하는지를 움직임으로 알려 준다. 좋은 모션은 매끄럽고 **자연스럽다.** 기계적인 등속 운동은 로봇처럼 느껴진다. 문법(transition, `@keyframes`)은 [[css-animation|CSS 애니메이션]]에, 접근성 기준은 [[color-motion-accessibility|색과 움직임의 접근성]]에 있다.

## 애니메이션 12원칙을 UI에 옮기기

디즈니가 『The Illusion of Life』에 정리한 전통 애니메이션 12원칙은 매체와 상관없이 통한다. UI에 쓸모 있는 것을 골라 CSS로 옮기면 다음과 같다.

| 원칙 | 뜻 | UI·CSS에서 |
| --- | --- | --- |
| 찌그러짐과 늘어남(squash & stretch) | 충돌과 속도에 따라 형태가 변해 무게와 탄성을 준다 | 눌린 버튼 `scale(0.96)`, 튀는 공 `scaleY(0.8)` |
| 예비 동작(anticipation) | 큰 동작 전에 반대로 살짝 움츠린다 | 날아가기 전 뒤로 조금 당기기. `cubic-bezier`의 y가 0보다 작은 곡선 |
| 연출(staging) | 한 번에 하나에 시선을 모은다 | 모달이 열릴 때 배경을 어둡게, 다른 움직임 멈추기 |
| 동작의 연속과 겹침(follow-through & overlapping) | 몸이 멈춰도 딸린 부분은 조금 더 움직인다 | 카드가 멈춘 뒤 그림자·내용이 약간 늦게 자리 잡기, 오버슈트 |
| 천천히 시작·끝(slow in & out) | 물체는 갑자기 출발하거나 서지 않는다 | `ease-out`(등장), `ease-in`(퇴장). `linear`는 진행 표시처럼 기계적인 것에만 |
| 호(arcs) | 자연스러운 움직임은 직선이 아니라 곡선을 그린다 | 아래 「곡선 경로」 |
| 보조 동작(secondary action) | 주 동작을 강화하는 작은 동작 | 저장 후 체크 아이콘이 살짝 튀어나오기 |
| 타이밍(timing) | 프레임 수가 무게와 성격을 정한다 | 작은 요소는 짧게(100~200ms), 큰 이동은 길게(300~500ms) |
| 과장(exaggeration) | 현실보다 조금 크게 해 의도를 분명히 | 오류 입력란을 좌우로 흔들기 |

## 모션 커브: 속도는 기울기다

**모션 커브**는 움직이는 값(위치, 크기, 투명도)을 시간에 대해 그린 그래프다. 커브의 **기울기가 그 순간의 속도**다.

```text
값                          값
│        ╱                  │          ___
│      ╱                    │       _╱
│    ╱      linear          │     ╱       ease-out
│  ╱        기울기 일정        │   ╱         처음 가파르고(빠름)
│╱          = 등속           │ ╱           끝에 평평(느려짐)
└────── 시간                 └────── 시간
```

`linear`가 어색한 이유는 출발 순간 속도가 0에서 곧장 최대가 되고, 도착 순간 최대에서 곧장 0이 되기 때문이다. 현실의 물체는 가속하고 감속한다.

`cubic-bezier(x1, y1, x2, y2)`의 네 수는 곡선 시작점(0,0)과 끝점(1,1) 사이 두 조절점의 좌표다. x는 시간, y는 진행도다.

| 곡선 | 값 | 쓰임 |
| --- | --- | --- |
| ease-out 계열 | `cubic-bezier(0.2, 0, 0, 1)` | 들어오는 요소. 빨리 나타나 부드럽게 선다 |
| ease-in 계열 | `cubic-bezier(0.4, 0, 1, 1)` | 나가는 요소. 천천히 출발해 빠르게 사라진다 |
| 오버슈트 | `cubic-bezier(0.34, 1.56, 0.64, 1)` | y가 1을 넘어 목표를 지나쳤다 돌아온다. 경쾌한 등장 |
| 예비 동작 | `cubic-bezier(0.36, 0, 0.66, -0.56)` | y가 0 아래로 내려갔다 출발한다 |

두 점으로 표현할 수 없는 스프링·바운스는 여러 점을 잇는 `linear()` 함수로 근사한다. 곡선은 브라우저 개발자 도구의 곡선 편집기로 실시간 조절한다.

## 곡선 경로

transition과 animation은 A에서 B까지 **최단 직선**으로 움직인다. 이징을 아무리 휘어도 경로는 직선이고 속도만 바뀐다.

### 겹친 애니메이션: 축마다 다른 타이밍

경로를 휘게 하려면 **X축과 Y축의 속도를 어긋나게** 하면 된다. 같은 요소에 `transform` 애니메이션 두 개를 걸면 나중 것만 적용되므로, **요소를 둘로 나눠** 바깥은 X, 안쪽은 Y를 맡긴다.

```css
.track { animation: move-x 1s ease-in infinite alternate; }        /* X는 ease-in */
.track::after { content: ''; display: block;
  animation: move-y 1s ease-out infinite alternate; }                 /* Y는 ease-out */
@keyframes move-x { to { transform: translateX(200px); } }
@keyframes move-y { to { transform: translateY(-120px); } }
```

X가 천천히 출발할 때 Y는 빠르게 솟아, 합친 궤적이 호를 그린다. 오버슈트 곡선을 섞으면 튀는 경로가 된다. 지금은 개별 변형 속성 `translate`·`rotate`·`scale`이 따로 있어, 서로 다른 속성끼리는 한 요소에서도 따로 애니메이션할 수 있다([[transform|transform: 이동·회전·확대·기울이기]]).

### offset-path: 경로를 직접 그린다

정해진 곡선을 따라가야 하면 **모션 경로** 속성을 쓴다. 모든 주요 브라우저가 지원한다.

```css
.dot {
  offset-path: path('M 0 100 Q 100 0 200 100');   /* SVG 경로 문법 */
  offset-rotate: auto;                             /* 경로 방향으로 회전 */
  animation: follow 2s ease-in-out infinite;
}
@keyframes follow { to { offset-distance: 100%; } }
```

`offset-path`에는 `circle()`, `ray()`, `url(#svg-path)`도 쓸 수 있다. 과거에는 이 속성이 `motion-path`라는 이름의 Chrome 전용 실험 기능이었다.

## 안무: 여러 요소를 함께 움직이기

하나씩은 매끄러운 애니메이션도 한꺼번에 돌면 끊긴다. 동시에 움직이는 것은 **두세 개**로 줄이고, 시작 시점을 흩뜨린다. 이를 **안무(choreography)** 라고 한다. 요소가 들어오는 방향과 순서가 시선을 이끈다.

**코드는 단순하게**: 부모(대개 `body`)의 클래스 하나를 바꾸고, 자식마다 `transition-delay`를 조금씩 늘린다. 상태 변화는 한 번이고 순서는 지연으로 만든다.

```css
.list-item {
  opacity: 0; translate: 0 1rem;
  transition: opacity .3s, translate .3s;
  transition-delay: calc(var(--i) * 40ms);       /* style="--i: 3" */
}
.is-loaded .list-item { opacity: 1; translate: 0; }
```

항목 수가 많으면 `--i`를 JS로 넣는다. `sibling-index()` 함수로 순번을 CSS에서 바로 얻는 방법도 Chromium에 들어왔다.

## 60fps를 지키는 구현 규칙

60fps는 한 프레임을 약 **16ms** 안에 그려야 한다는 뜻이다.

| 규칙 | 이유와 방법 |
| --- | --- |
| `transform`과 `opacity`만 움직인다 | 레이아웃·페인트를 건너뛰고 합성만 다시 한다. 크기는 `scale`, 이동은 `translate`로 |
| 숨길 때 `display: none`을 바로 쓰지 않는다 | 과거에는 `opacity: 0` + `pointer-events: none`으로 숨겼다. 지금은 `transition-behavior: allow-discrete`와 `@starting-style`로 `display` 전환에도 애니메이션을 건다. 숨긴 영역은 `inert`로 포커스·클릭을 막는다 |
| 스크롤 이벤트에 직접 묶지 않는다 | 매 스크롤마다 JS가 돌며 끊긴다. 스크롤 기반 애니메이션(`animation-timeline: view()`)이나 IntersectionObserver를 쓴다([[intersection-observer\|Intersection Observer와 관찰자 API]]) |
| 큰 네트워크 요청과 겹치지 않게 | 이미지 수십 장이 로드되는 순간 애니메이션이 버벅인다. 미리 받거나 애니메이션 뒤로 미룬다 |
| 모바일·저사양 기기에서 자주 시험 | 화면 밀도, 창 크기, 하드웨어가 성능을 크게 바꾼다 |
| 화면을 녹화해 다시 본다 | 느린 재생으로 3인칭 시점에서 어색한 프레임을 찾는다 |

```css
.panel { transition: opacity .2s, display .2s allow-discrete; }
.panel[hidden] { display: none; opacity: 0; }
@starting-style { .panel { opacity: 0; } }   /* 처음 나타날 때의 시작값 */
```

움직임 줄이기 설정(`prefers-reduced-motion: reduce`)에서는 큰 이동·확대를 페이드로 바꾼다.

## 정리

- 모션은 상태 변화를 설명하는 도구다. 천천히 시작·끝, 예비 동작, 겹침, 호 같은 원칙이 자연스러움을 만든다.
- 속도는 모션 커브의 기울기다. 등장은 ease-out, 퇴장은 ease-in, 기계적인 진행만 linear.
- 곡선 경로는 축마다 다른 타이밍을 겹치거나 `offset-path`로 만든다.
- 동시에 움직이는 요소는 두세 개로 줄이고 지연으로 안무한다. `transform`·`opacity`만 움직인다.

관련 노트: [[css-animation|CSS 애니메이션: transition과 @keyframes]], [[color-motion-accessibility|색과 움직임의 접근성]], [[transform|transform: 이동·회전·확대·기울이기]], [[view-transitions|View Transitions: 화면 전환 애니메이션]], [[browser-rendering|브라우저 렌더링 과정]]
