---
title: "무한 캐러셀과 자동 슬라이드 구현"
concept: "Infinite Carousel"
summary: "끝에서 처음으로 자연스럽게 이어지는 캐러셀을 만드는 기법. 양끝에 복제 슬라이드를 붙이고 transitionend에서 전환 없이 제자리로 점프하는 버튼형 캐러셀, 애니메이션 중 연속 클릭 잠금, 페이지 단위 이동, 목록을 두 번 이어 붙여 translateX(-50%)로 흘리는 CSS 마키, @keyframes 퍼센트로 멈춤 구간을 만드는 자동 슬라이드, 가장자리 페이드와 움직임 줄이기까지."
tags: ["css", "animation", "ui", "javascript", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/%EB%AC%B4%ED%95%9C%20%EC%BA%90%EB%9F%AC%EC%85%80%20%EA%B5%AC%ED%98%84.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/%EC%97%AC%EB%9F%AC%20%EC%9D%B4%EB%AF%B8%EC%A7%80%EA%B0%80%20%EC%BA%90%EB%9F%AC%EC%85%80%20%ED%8E%98%EC%9D%B4%EC%A7%80%20%ED%95%98%EB%82%98%EC%97%90%20%EB%93%A4%EC%96%B4%EA%B0%80%EA%B2%8C%20%EA%B5%AC%ED%98%84%ED%95%9C%20%EC%BA%90%EB%9F%AC%EC%85%80.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/auto%20multiple%20slider%28carousel%29.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/%EB%AC%B4%ED%95%9C%20%EC%8A%AC%EB%9D%BC%EC%9D%B4%EB%93%9C%20%EC%A4%91%EA%B0%84%EC%97%90%20%EB%A9%88%EC%B6%94%EA%B3%A0%20%EC%A7%84%ED%96%89%ED%95%98%EB%8A%94%EB%B2%95%28Only%20CSS%20%7C%20%EB%8B%A4%EC%9D%8C%2C%EC%9D%B4%EC%A0%84%20%EB%B2%84%ED%8A%BCX%29.md.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/%EC%97%AC%EB%9F%AC%EB%B2%88%20%EB%B0%9C%EC%83%9D%ED%95%98%EB%8A%94%20%EC%9D%B4%EB%B2%A4%ED%8A%B8%20%ED%98%B8%EC%B6%9C%20%EB%B0%A9%EC%A7%80.md", "https://css-tricks.com/infinite-all-css-scrolling-slideshow/", "https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image"]
---

> 「[Frontend_TIL](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL)」의 「[무한 캐러셀 구현](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/%EB%AC%B4%ED%95%9C%20%EC%BA%90%EB%9F%AC%EC%85%80%20%EA%B5%AC%ED%98%84.md)」, 「[여러 이미지가 캐러셀 페이지 하나에 들어가게 구현한 캐러셀](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/%EC%97%AC%EB%9F%AC%20%EC%9D%B4%EB%AF%B8%EC%A7%80%EA%B0%80%20%EC%BA%90%EB%9F%AC%EC%85%80%20%ED%8E%98%EC%9D%B4%EC%A7%80%20%ED%95%98%EB%82%98%EC%97%90%20%EB%93%A4%EC%96%B4%EA%B0%80%EA%B2%8C%20%EA%B5%AC%ED%98%84%ED%95%9C%20%EC%BA%90%EB%9F%AC%EC%85%80.md)」, 「[auto multiple slider(carousel)](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/auto%20multiple%20slider%28carousel%29.md)」, 「[무한 슬라이드 중간에 멈추고 진행하는법](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/%EB%AC%B4%ED%95%9C%20%EC%8A%AC%EB%9D%BC%EC%9D%B4%EB%93%9C%20%EC%A4%91%EA%B0%84%EC%97%90%20%EB%A9%88%EC%B6%94%EA%B3%A0%20%EC%A7%84%ED%96%89%ED%95%98%EB%8A%94%EB%B2%95%28Only%20CSS%20%7C%20%EB%8B%A4%EC%9D%8C%2C%EC%9D%B4%EC%A0%84%20%EB%B2%84%ED%8A%BCX%29.md.md)」, 「[여러번 발생하는 이벤트 호출 방지](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/%EC%97%AC%EB%9F%AC%EB%B2%88%20%EB%B0%9C%EC%83%9D%ED%95%98%EB%8A%94%20%EC%9D%B4%EB%B2%A4%ED%8A%B8%20%ED%98%B8%EC%B6%9C%20%EB%B0%A9%EC%A7%80.md)」를 바탕으로 재구성한 노트다.

캐러셀을 **쓸지** 말지, 좁은 화면에서만 쓰는 혼합형은 [[responsive-ui-patterns|반응형 UI 패턴]]에, 정지 버튼 같은 접근성 요건은 [[accessible-widgets|접근 가능한 위젯]]에, 스크롤 스냅으로 만드는 스와이프형은 [[css-overflow-scroll#스크롤 스냅|CSS 오버플로와 스크롤]]에 있다. 이 노트는 「끝에서 처음으로 끊김 없이 이어지게」 만드는 구현 기법을 다룬다.

## 공통 구조

```text
뷰포트 (overflow: hidden; 보여 줄 크기)
└─ 트랙 (display: flex; transform: translateX(…); 슬라이드 전부를 가로로)
   └─ 슬라이드 × n
```

뷰포트는 창 역할만 하고, 트랙 전체를 `transform`으로 옮긴다. `left`가 아니라 `transform`을 쓰는 이유는 레이아웃을 다시 계산하지 않고 합성만으로 움직이기 때문이다([[css-animation|CSS 애니메이션]]).

## 버튼형 무한 캐러셀: 복제 슬라이드

마지막에서 「다음」을 누르면 첫 장으로 **되감기듯 거꾸로** 달려가면 어색하다. 그래서 양끝에 반대편 슬라이드를 하나씩 복제해 둔다.

```text
트랙: [5′] [1] [2] [3] [4] [5] [1′]
인덱스: 0    1   2   3   4   5   6      처음 위치는 1 (translateX(-100%))

5에서 다음 → 6(1′)으로 평소처럼 0.5초 이동
          → transitionend에서 전환을 끄고 1로 순간 이동 (화면은 똑같아 보인다)
1에서 이전 → 0(5′)으로 이동 → 끝나면 전환 없이 5로 점프
```

```tsx
function Carousel({ images }: { images: string[] }) {
  const slides = [images.at(-1)!, ...images, images[0]]
  const [index, setIndex] = useState(1)
  const [animate, setAnimate] = useState(true)
  const busy = useRef(false)              // 애니메이션 중 연속 클릭 잠금

  const move = (step: number) => {
    if (busy.current) return
    busy.current = true
    setAnimate(true)
    setIndex((i) => i + step)
  }

  const onTransitionEnd = () => {
    busy.current = false
    if (index === slides.length - 1) { setAnimate(false); setIndex(1) }          // 1′ → 1
    else if (index === 0) { setAnimate(false); setIndex(slides.length - 2) }    // 5′ → 5
  }

  return (
    <div className="viewport">
      <ul
        className="track"
        onTransitionEnd={onTransitionEnd}
        style={{
          transform: `translateX(-${index * 100}%)`,
          transition: animate ? 'transform 0.5s ease-in-out' : 'none',
        }}
      >
        {slides.map((src, i) => <li key={i}><img src={src} alt="" /></li>)}
      </ul>
      <button onClick={() => move(-1)} aria-label="이전 슬라이드">‹</button>
      <button onClick={() => move(1)} aria-label="다음 슬라이드">›</button>
    </div>
  )
}
```

- **점프 시점은 `transitionend`로 잡는다.** 전환 시간과 같은 `setTimeout`으로 맞추면 탭이 백그라운드이거나 프레임이 밀릴 때 어긋난다.
- 전환을 끈 채 위치를 옮긴 뒤 다음 이동에서 다시 켜야 한다. 끄고 켜기를 같은 프레임에 하면 브라우저가 둘을 합쳐 점프에도 애니메이션이 걸리므로, 위 코드처럼 다음 클릭 때 켜거나 `requestAnimationFrame`을 두 번 기다린 뒤 켠다.
- **잠금 변수는 `useRef`에 둔다.** 컴포넌트 함수 안의 `let busy = false`는 리렌더링마다 새로 만들어져 잠금이 풀린다. 이벤트를 일정 시간 한 번만 받는 일반 기법은 [[debounce-throttle|Debounce와 Throttle]]에 있다.

## 페이지 단위로 넘기는 캐러셀

한 화면에 상품 4개씩 보여 주고 4개 단위로 넘기는 경우다. 데이터를 페이지 단위 2차원 배열로 나누고, 페이지 하나를 뷰포트 너비로 잡는다.

```js
const pages = Array.from({ length: Math.ceil(items.length / 4) }, (_, p) => items.slice(p * 4, p * 4 + 4))
// translateX(-page * 100%), page는 0 ~ pages.length - 1
```

끝이 있는 캐러셀이면 첫 페이지에서 「이전」, 마지막 페이지에서 「다음」을 `disabled`로 막는다. 버튼을 `display: none`으로 숨기면 키보드 포커스가 갑자기 사라지므로, 보이되 비활성인 상태가 낫다. 버튼 상태도 DOM을 직접 고치지 말고 `page` state에서 계산한다.

## 자동으로 흐르는 마키: 목록을 두 번

로고 띠처럼 쉬지 않고 한 방향으로 흐르는 슬라이더는 JavaScript 없이 만든다. **같은 목록을 두 번 이어 붙이고**, 트랙을 정확히 절반(목록 하나 길이)만큼 옮긴 뒤 처음으로 되돌아가게 반복한다. 되돌아간 순간의 화면은 두 번째 목록의 시작과 같아서 이음매가 보이지 않는다.

```css
.marquee {
  overflow: hidden;
  /* 양 가장자리를 투명하게 녹인다 */
  mask-image: linear-gradient(to right, transparent, #000 15%, #000 85%, transparent);
}
.marquee-track {
  display: flex;
  width: max-content;                 /* 목록 두 벌의 길이 그대로 */
  animation: scroll 40s linear infinite;
}
@keyframes scroll {
  to { transform: translateX(-50%); } /* 목록 한 벌만큼 */
}
.marquee:hover .marquee-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; }
}
```

```html
<div class="marquee">
  <ul class="marquee-track">
    <li>A</li><li>B</li><li>C</li><li>D</li>
    <li aria-hidden="true">A</li><li aria-hidden="true">B</li><li aria-hidden="true">C</li><li aria-hidden="true">D</li>
  </ul>
</div>
```

- 항목 너비가 고정이면 `width: calc(250px * 8)`, 이동량 `calc(-250px * 4)`처럼 써도 된다. `max-content` + `-50%`는 너비가 달라도 맞는다. 단 항목 사이 간격이 있으면 마지막 항목 뒤에도 같은 간격(`padding-right`)을 둬야 절반이 정확하다.
- 복제 목록은 `aria-hidden`으로 스크린 리더가 두 번 읽지 않게 한다.
- 과거에는 `::before`·`::after`에 흰색 `linear-gradient`를 얹어 가장자리를 가렸다. 배경색이 바뀌면 같이 고쳐야 하므로 지금은 `mask-image`로 요소 자체를 투명하게 만든다.

## 멈췄다 넘어가는 자동 슬라이드: 퍼센트로 정지 구간

후기·공지처럼 한 장을 몇 초 보여 주고 다음 장으로 넘기는 슬라이드도 `@keyframes` 하나로 된다. **두 키프레임에 같은 값을 주면 그 사이 시간은 멈춰 있다.**

```text
슬라이드 3장 + 첫 장 복제 1장, 한 장당 5초 정지 + 2초 이동 → 한 바퀴 21초
키프레임 % = 시각(초) ÷ 21 × 100

  0%      (0s)  translateX(0)        ┐ 정지
 23.81%   (5s)  translateX(0)        ┘
 33.33%   (7s)  translateX(-100%)    ┐ 이동 후 정지
 57.14%  (12s)  translateX(-100%)    ┘
 66.67%  (14s)  translateX(-200%)
 90.48%  (19s)  translateX(-200%)
100%     (21s)  translateX(-300%)    ← 복제한 첫 장. 다음 반복의 0%와 화면이 같다
```

```css
.review-track {
  display: flex;
  animation: rotate 21s infinite;
  animation-timing-function: ease-in-out;   /* 키프레임 구간마다 적용된다 */
}
@keyframes rotate {
  0%, 23.81%   { transform: translateX(0); }
  33.33%, 57.14% { transform: translateX(-100%); }
  66.67%, 90.48% { transform: translateX(-200%); }
  100%         { transform: translateX(-300%); }
}
```

`translateX`의 `%`는 **움직이는 요소 자신의 너비** 기준이다. 트랙에 너비를 따로 주지 않으면 뷰포트와 같은 너비가 되고, 슬라이드를 `flex: 0 0 100%`로 넘치게 두면 `-100%`가 정확히 한 장이다. 고정 px(`-1200px`)로 쓰면 화면 크기가 바뀔 때 어긋난다. 반대로 트랙 너비를 슬라이드 전체(`width: max-content`)로 잡았다면 한 장은 `-100% / 장 수`다.

자동으로 움직이는 콘텐츠가 5초 넘게 이어지면 **멈출 방법**이 있어야 한다(WCAG 2.2.2). 호버·포커스 시 `animation-play-state: paused`, 정지 버튼, `prefers-reduced-motion` 대응을 함께 넣는다.

## 정리

- 트랙을 `overflow: hidden` 뷰포트 안에서 `transform`으로 옮기는 것이 모든 캐러셀의 뼈대다.
- 버튼형 무한 캐러셀은 양끝에 복제 슬라이드를 두고, `transitionend`에서 전환을 끈 채 진짜 위치로 점프한다. 연속 클릭 잠금은 `useRef`에.
- 끊김 없는 마키는 목록 두 벌 + `translateX(-50%)` 무한 반복. 복제본은 `aria-hidden`, 가장자리는 `mask-image`.
- 정지 구간은 이웃한 두 키프레임에 같은 값을 준다. 퍼센트는 시각 ÷ 전체 시간.
- 자동 재생에는 일시 정지와 `prefers-reduced-motion`을 반드시 붙인다.

관련 노트: [[css-animation|CSS 애니메이션]], [[transform|transform]], [[css-overflow-scroll|CSS 오버플로와 스크롤]], [[responsive-ui-patterns|반응형 UI 패턴: 내비게이션, 캐러셀, 데이터 표]], [[accessible-widgets|접근 가능한 위젯: 펼침·탭·캐러셀]], [[debounce-throttle|Debounce와 Throttle]]
