---
title: "CSS 애니메이션: transition과 @keyframes"
concept: "CSS Animation"
summary: "상태 변화를 부드럽게 잇는 transition과, 여러 단계를 스스로 재생하는 @keyframes 애니메이션의 차이와 속성. 부드러운 애니메이션을 위한 transform·opacity 원칙, 움직임 줄이기 설정 존중, Animate.css·Hover.css·Animista 같은 CSS 애니메이션 라이브러리와 JS 라이브러리로 넘어갈 시점을 정리한다."
tags: ["css", "frontend", "animation", "performance"]
source: other
date: "2026-10-14"
sources: ["https://nanati.me/css-animation-library/", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations"]
---

> nanati의 「[CSS Animation을 간단하게 만들어주는 라이브러리 모음](https://nanati.me/css-animation-library/)」(2021.09)의 라이브러리 목록에 CSS 애니메이션 기본 개념을 더해 재구성한 노트입니다. 라이브러리 링크는 2026년 10월에 다시 확인했습니다.

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

`display: none`처럼 원래 이어지지 않던(이산) 속성도 `transition-behavior: allow-discrete`와 `@starting-style`로 등장·퇴장 효과를 줄 수 있다.

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

스크롤 위치에 맞춰 재생하는 **스크롤 기반 애니메이션**(`animation-timeline: scroll()`/`view()`)과, 페이지·상태 전환을 잇는 **View Transitions API**도 CSS로 다룬다.

## 부드럽게 만드는 원칙

- **`transform`과 `opacity`만 움직인다.** 이 둘은 레이아웃·페인트를 다시 하지 않고 합성(composite) 단계에서 처리된다. `width`, `top`, `margin`을 움직이면 매 프레임 레이아웃을 다시 계산해 끊긴다. 이유는 [[browser-rendering|브라우저 렌더링 과정]], 함수는 [[transform|transform: 이동·회전·확대·기울이기]]에 있다.
- `will-change: transform`은 곧 움직일 요소에만 잠깐 쓴다. 남발하면 메모리를 낭비한다.
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

자세한 기준(5초 넘는 자동 애니메이션은 멈출 수 있게)은 [[color-motion-accessibility|색과 움직임의 접근성]]에 있다.

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

이때는 브라우저 내장 **Web Animations API**(`element.animate()`)나 GSAP, Motion(옛 Framer Motion) 같은 라이브러리를 쓴다. 벡터 일러스트 애니메이션은 Lottie가 흔하다(→ [[animated-icon|Animated Icon — 영상을 투명 배경 아이콘으로 쓰기]]).

## 정리

- 상태 변화를 이으면 `transition`, 스스로 재생하는 여러 단계면 `@keyframes`.
- `transform`과 `opacity`만 움직이고, 짧게 쓴다.
- `prefers-reduced-motion`을 항상 처리한다.
- 라이브러리는 통째보다 필요한 키프레임만 가져다 쓴다.

**좋은 애니메이션은 눈에 띄지 않고, 상태가 바뀌었다는 사실만 알려 준다.**

관련 노트: [[transform|transform: 이동·회전·확대·기울이기]], [[browser-rendering|브라우저 렌더링 과정]], [[color-motion-accessibility|색과 움직임의 접근성]], [[animated-icon|Animated Icon — 영상을 투명 배경 아이콘으로 쓰기]]
