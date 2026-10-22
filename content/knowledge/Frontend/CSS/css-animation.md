---
title: "CSS 애니메이션: transition과 @keyframes"
concept: "CSS Animation"
summary: "상태 변화를 부드럽게 잇는 transition과, 여러 단계를 스스로 재생하는 @keyframes 애니메이션의 차이와 속성. 부드러운 애니메이션을 위한 transform·opacity 원칙, 움직임 줄이기 설정 존중, Animate.css·Hover.css·Animista 같은 CSS 애니메이션 라이브러리와 JS 라이브러리로 넘어갈 시점을 정리한다."
tags: ["css", "frontend", "animation", "performance"]
source: other
date: "2026-10-21"
sources: ["https://nanati.me/css-animation-library/", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations", "https://web.dev/learn/css/transitions", "https://web.dev/learn/css/animations", "https://developer.mozilla.org/en-US/docs/Web/CSS/will-change", "https://dev.opera.com/articles/css-will-change-property/"]
---

> nanati의 「[CSS Animation을 간단하게 만들어주는 라이브러리 모음](https://nanati.me/css-animation-library/)」(2021.09)의 라이브러리 목록에 CSS 애니메이션 기본 개념을 더해 재구성한 노트다. 라이브러리 링크는 2026년 10월에 다시 확인했다. transition·animation 속성의 세부 동작은 web.dev 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Transitions·Animations 모듈로 보강했다. `will-change` 쓰는 법은 MDN과 「[Everything You Need to Know About the CSS will-change Property](https://dev.opera.com/articles/css-will-change-property/)」로 보강했다.

## 두 가지 방법

| | `transition` | `animation` + `@keyframes` |
| --- | --- | --- |
| 시작 조건 | 속성 값이 **바뀔 때**(`:hover`, 클래스 추가) | 적용되는 즉시 스스로 재생 |
| 단계 | 시작값 → 끝값 두 지점 | 0%~100% 사이 여러 지점 |
| 반복 | 없음(바뀔 때마다 한 번) | 횟수·무한 반복, 방향 전환 |
| 어울리는 곳 | 버튼 호버, 메뉴 열고 닫기, 상태 전환 | 로딩 스피너, 등장 효과, 주의 끌기 |

## transition

```css
.button {
  background: var(--color-primary);
  transition: background-color 200ms ease, transform 200ms ease;
}
.button:hover { background: var(--color-primary-dark); transform: translateY(-2px); }
```

| 속성 | 뜻 |
| --- | --- |
| `transition-property` | 어떤 속성을 이을지. `all`은 의도치 않은 속성까지 움직이므로 이름을 적는다 |
| `transition-duration` | 걸리는 시간 |
| `transition-timing-function` | 속도 곡선: `ease`, `linear`, `ease-in-out`, `cubic-bezier()`, `steps()` |
| `transition-delay` | 시작 전 대기 |

- `transition-timing-function`의 초깃값은 `ease`, `duration`·`delay`의 초깃값은 `0s`다. 축약형 순서는 `속성 길이 곡선 지연`(`transition: transform 300ms ease-in-out 0s`).
- **중간 상태가 있는 속성만** 부드럽게 이어진다. `font-size`(길이)는 되고 `font-family`(serif와 monospace의 중간은 없다)는 안 된다. 이어지지 않는 속성은 끝에서 한 번에 바뀐다(이산 전환).
- 전환은 값이 바뀌어야 시작한다. 흔한 계기는 `:hover`, `:focus`, `:focus-within`, `:target`, `:active`, JS로 클래스를 바꾸는 것이다.
- **들어갈 때와 나올 때를 다르게** 하려면 각 상태에 다른 `transition`을 준다. 목표 상태 쪽 규칙의 `transition`이 쓰인다.
- 형제마다 `transition-delay`를 조금씩 늘리면 차례로 움직이는 스태거(stagger) 효과가 된다. 음수 지연은 중간부터 시작한다.
- 색 전환은 위치가 움직이지 않으므로 움직임 줄이기 설정에서도 대개 그대로 둬도 된다.

```css
.menu { opacity: 0; transition: opacity 2s ease-in; }                 /* 나갈 때: 천천히 */
.menu.open { opacity: 1; transition: opacity 150ms ease; }            /* 들어올 때: 빠르게 */
```

`display: none`처럼 원래 이어지지 않던(이산) 속성도 `transition-behavior: allow-discrete`와 `@starting-style`로 등장·퇴장 효과를 줄 수 있다. 팝오버 예제는 [[popover-anchor-positioning#열고 닫기 애니메이션|팝오버 애니메이션]]에 있다. 실행 중인 전환 값은 캐스케이드에서 `!important`보다도 강하다([[how-css-works#캐스케이드|캐스케이드]]).

## @keyframes와 animation

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: none; }
}
.card { animation: fade-up 400ms ease-out both; }

@keyframes spin { to { transform: rotate(1turn); } }
.spinner { animation: spin 1s linear infinite; }
```

| 속성 | 뜻 |
| --- | --- |
| `animation-name` | 쓸 `@keyframes` 이름 |
| `animation-duration` · `-timing-function` · `-delay` | transition과 같다 |
| `animation-iteration-count` | 반복 횟수, `infinite` |
| `animation-direction` | `normal`, `reverse`, `alternate`(갔다가 돌아옴) |
| `animation-fill-mode` | 재생 전후에 첫·끝 프레임을 유지할지. `both`가 흔하다 |
| `animation-play-state` | `paused`로 멈춘다 |

- `from`·`to`는 `0%`·`100%`와 같다. 키프레임은 하나만 있어도 된다. 빠진 시작·끝은 요소의 현재 스타일로 채운다(위 `spin`).
- `@keyframes` 이름은 **대소문자를 구분하는** 사용자 정의 식별자다.
- `animation-duration` 초깃값은 `0s`다. 애니메이션은 실행되지만 보이지 않는다. 음수는 안 된다.
- `animation-delay`는 음수가 된다. 10초 애니메이션에 `-5s`면 중간부터 시작한다.
- `animation-fill-mode`: `none`(기본, 끝나면 키프레임 값을 버림), `forwards`(마지막 프레임 유지), `backwards`(지연 동안 첫 프레임 적용), `both`.
- `animation-iteration-count`의 초깃값은 `1`, 무한 반복은 `infinite`.
- 축약형 순서는 대체로 `이름 길이 곡선 지연 반복 방향 채우기 재생상태`다. 시간 값이 두 개면 **첫째가 길이, 둘째가 지연**이다.

### 타이밍 함수

| 함수 | 모양 |
| --- | --- |
| `linear` | 일정한 속도 |
| `ease`, `ease-in`, `ease-out`, `ease-in-out` | 미리 정의된 베지어 곡선. `ease`가 기본 |
| `cubic-bezier(x1, y1, x2, y2)` | 직접 곡선을 정한다. y가 0~1을 벗어나면 튀어 오르는(overshoot) 효과 |
| `steps(n, end)` | n개의 같은 간격으로 **뚝뚝 끊어** 움직인다. `end`(기본)는 각 구간 끝에서, `start`는 시작하자마자 첫 단계로 바뀐다. 스프라이트 애니메이션, 타자기 효과 |
| `linear(0, .25 75%, 1)` | 점들을 이은 꺾은선. 스프링·바운스를 흉내 낸다 |

실제 물체는 갑자기 서거나 출발하지 않는다. 등장은 `ease-out`, 퇴장은 `ease-in`이 자연스럽다. 개발자 도구의 곡선 편집기로 실시간 조절할 수 있다([[devtools-elements-css|DevTools로 DOM과 CSS 다루기]]). 곡선을 읽는 법, 애니메이션 12원칙, 곡선 경로와 안무는 [[ui-motion-principles|UI 모션 디자인]]에 있다.

스크롤 위치에 맞춰 재생하는 **스크롤 기반 애니메이션**(`animation-timeline: scroll()`/`view()`)과, 페이지·상태 전환을 잇는 **View Transitions API**도 CSS로 다룬다([[view-transitions|View Transitions: 화면 전환 애니메이션]]).

## 부드럽게 만드는 원칙

- **`transform`과 `opacity`만 움직인다.** 합성만 다시 돌기 때문이다([[browser-rendering#변경이 다시 도는 단계|변경이 다시 도는 단계]]). `width`·`top`·`margin`은 매 프레임 레이아웃을 다시 한다. 함수는 [[transform|transform: 이동·회전·확대·기울이기]]에 있다.
- `will-change`는 곧 움직일 요소에만 잠깐 쓴다. 아래 「will-change 쓰는 법」을 따른다.
- 짧게 쓴다. UI 피드백은 100~300ms 안팎이면 충분하다.
- **움직임 줄이기 설정을 존중한다.** 전정 장애가 있는 사용자는 큰 움직임에 어지러움을 느낀다.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

움직임 줄이기는 「애니메이션 금지」가 아니라 **덜, 특히 예상치 못한 움직임을 덜** 달라는 요청이다. 자동 재생 애니메이션은 `animation-play-state: paused`로 멈추고, 큰 이동은 페이드로 바꾸는 식으로 대체한다. 반대로 `@media (prefers-reduced-motion: no-preference)` 안에서만 움직임을 켜는 방식도 있다. 자세한 기준(5초 넘는 자동 애니메이션은 멈출 수 있게)은 [[color-motion-accessibility|색과 움직임의 접근성]]에 있다.

### will-change 쓰는 법

`will-change`는 「이 속성이 곧 바뀐다」는 **힌트**다. 브라우저는 미리 레이어를 만드는 식으로 준비한다. 성능 문제가 실제로 있을 때 쓰는 **최후의 수단**이고, 2020년부터 모든 주요 브라우저가 지원한다.

| 값 | 뜻 |
| --- | --- |
| `auto` | 특별한 준비 없음(기본값) |
| `transform`, `opacity` 등 속성 이름 | 그 속성이 바뀐다 |
| `scroll-position` | 스크롤 위치가 바뀐다. 보이는 영역 밖까지 미리 그린다 |
| `contents` | 내용이 자주 바뀐다. 렌더링 결과를 캐시하지 않는다 |

| 원칙 | 이유·방법 |
| --- | --- |
| 많은 요소에 걸지 않는다 | `* { will-change: transform }`처럼 쓰면 레이어마다 메모리를 잡아 오히려 느려진다. 레이어의 비용은 [[browser-architecture#레이어 승격의 비용\|레이어 승격의 비용]]에 있다 |
| 바뀌기 **조금 전에** 건다 | 변경 직전에 걸면 준비할 시간이 없다. 클릭에 움직일 요소라면 부모에 `:hover`할 때 건다 |
| 끝나면 지운다 | 스타일 시트에 고정해 두면 지울 수 없다. 스크립트로 걸고 `animationend`·`transitionend`에서 `el.style.willChange = 'auto'`로 되돌린다 |
| 계속 바뀌는 요소만 스타일 시트에 둔다 | 슬라이드 패널처럼 사용자가 반복해서 여닫는 요소 |
| 부수 효과를 안다 | 초깃값이 아닐 때 쌓임 맥락을 만드는 속성(`opacity`, `transform`, `clip-path` 등)을 적으면 `will-change`만으로 쌓임 맥락이 생긴다. `transform`을 적으면 `position: fixed` 자손의 기준 박스도 된다 |

## CSS 애니메이션 라이브러리

미리 만든 `@keyframes`를 클래스로 붙여 쓰는 라이브러리다. 통째로 넣어도 되고, **필요한 키프레임만 복사해** 쓰는 편이 가볍다.

| 이름 | 성격 |
| --- | --- |
| [Animate.css](https://animate.style/) | 가장 널리 쓰인다. 등장·퇴장·주의 끌기 효과 수십 가지. `animate__animated animate__bounce`처럼 클래스로 붙이고, 길이·지연은 CSS 변수(`--animate-duration`)로 조절한다. `prefers-reduced-motion`을 기본으로 존중한다 |
| [Hover.css](http://ianlunn.github.io/Hover/) | 링크·버튼의 호버 효과 모음. CSS·Sass·Less 버전 |
| [Animista](https://animista.net/) | 효과를 고르고 값을 조절한 뒤 **필요한 CSS만 생성**해 복사한다 |
| [Magic](https://www.minimamente.com/project/magic/) | 독특한 등장·퇴장 효과 |
| [Vivify](http://vivify.mkcreative.cz/), [Woah.css](http://www.joerezendes.com/projects/Woah.css/), [CSShake](https://elrumordelaluz.github.io/csshake/) | 과장된 효과, 흔들기 효과 |

이 라이브러리들은 대부분 몇 년째 큰 변화가 없다. 효과 자체는 안정적이지만, 새 CSS 기능(스크롤 기반, View Transitions)은 들어 있지 않다.

## JS 라이브러리로 넘어갈 때

다음이 필요하면 CSS만으로는 버겁다.

- 여러 요소의 순서·시점을 정밀하게 맞추는 타임라인
- 드래그, 스프링 물리처럼 사용자 입력에 반응하는 움직임
- 레이아웃이 바뀔 때 요소가 제자리를 찾아가는 효과
- 재생 중 일시 정지·되감기 같은 제어

이때는 브라우저 내장 **Web Animations API**(`element.animate()`)나 GSAP, Motion(옛 Framer Motion) 같은 라이브러리를 쓴다. 벡터 일러스트 애니메이션은 Lottie가 흔하다(→ [[animated-icon|Animated Icon: 영상을 투명 배경 아이콘으로 쓰기]]).

## 정리

- 상태 변화를 이으면 `transition`, 스스로 재생하는 여러 단계면 `@keyframes`.
- `transform`과 `opacity`만 움직이고, 짧게 쓴다.
- `prefers-reduced-motion`을 항상 처리한다.
- 라이브러리는 통째보다 필요한 키프레임만 가져다 쓴다.

**좋은 애니메이션은 눈에 띄지 않고, 상태가 바뀌었다는 사실만 알려 준다.**

관련 노트: [[transform|transform: 이동·회전·확대·기울이기]], [[view-transitions|View Transitions: 화면 전환 애니메이션]], [[browser-rendering|브라우저 렌더링 과정]], [[color-motion-accessibility|색과 움직임의 접근성]], [[animated-icon|Animated Icon: 영상을 투명 배경 아이콘으로 쓰기]], [[devtools-elements-css|DevTools로 DOM과 CSS 다루기]], [[js-animation|JavaScript 애니메이션]], [[ui-motion-principles|UI 모션 디자인: 애니메이션 원칙, 모션 커브, 안무]]
