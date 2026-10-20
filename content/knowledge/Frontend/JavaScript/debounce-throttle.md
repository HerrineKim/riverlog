---
title: "Debounce와 Throttle"
concept: "Debounce Throttle"
summary: "연속으로 일어나는 이벤트의 실행 횟수를 줄이는 두 기법. 디바운스는 마지막 호출만, 쓰로틀은 일정 간격마다 한 번만 실행한다."
tags: ["javascript", "performance", "frontend"]
source: mixed
date: "2026-10-15"
sources: ["https://riverkim.kr/322", "https://wesbos.com/javascript/06-serious-practice-exercises/scroll-events-and-intersection-observer"]
---

> riverkim.kr에 쓴 글을 다시 정리하고, 대안 부분은 Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)를 함께 참고했다.

## 두 기법이란

입력, 스크롤, 리사이즈처럼 짧은 시간에 수십 번 일어나는 이벤트마다 무거운 함수를 실행하면 요청과 렌더링이 낭비된다. 디바운스와 쓰로틀은 둘 다 **실행을 의도적으로 늦춰 횟수를 줄인다**.

| | Debounce | Throttle |
| --- | --- | --- |
| 실행 시점 | 호출이 멈춘 뒤 `delay`가 지나면 **마지막 호출만** | 호출이 이어지는 동안 **`delay`마다 한 번** |
| 반응 느낌 | "멈춘 뒤 반응" | "하는 도중에도 주기적으로 반응" |
| 대표 사례 | 검색어 자동 완성, 입력 필드 자동 저장, 버튼 중복 클릭 방지 | 무한 스크롤, 스크롤 위치 추적 |

Throttle은 원래 장애물로 유체의 흐름을 늦춘다는 뜻이다. 입력을 막지 않고, 일정 시간 동안의 입력을 모아 한 번씩 내보낸다.

## Debounce 구현

```javascript
function debounce(callback, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)          // 이전 예약을 취소하고
    timer = setTimeout(() => {   // 새로 예약한다
      callback.apply(this, args)
    }, delay)
  }
}

const onInput = debounce((e) => search(e.target.value), 300)
input.addEventListener('input', onInput)
```

반환된 함수를 연달아 부르면 부를 때마다 이전 예약이 지워진다. 결국 **마지막 호출만 살아남아** `delay` 뒤에 실행된다.

## Throttle 구현

```javascript
function throttle(callback, delay) {
  let timer
  return function (...args) {
    if (timer) return            // 예약이 걸려 있으면 무시
    timer = setTimeout(() => {
      callback.apply(this, args)
      timer = null               // 실행 후 다음 예약을 받을 수 있게 비운다
    }, delay)
  }
}

window.addEventListener('scroll', throttle(loadMoreIfNeeded, 200))
```

처음 호출된 시점에만 실행을 예약하고, 그 뒤 `delay` 동안의 호출은 모두 무시한다. 그래서 callback은 **최대 `delay`마다 한 번** 실행된다. 실행이 끝나면 `timer`를 비워야 다음 주기에 다시 예약된다.

## 쓰로틀보다 나은 대안

- **요소가 화면에 들어왔는지**가 궁금한 것이라면(무한 스크롤, 지연 로딩) 스크롤 이벤트를 쓰로틀하기보다 `IntersectionObserver`가 낫다. 브라우저가 겹침을 계산해 기준을 넘을 때만 알려 준다([[intersection-observer|Intersection Observer와 관찰자 API]]).
- 화면 갱신이 목적이면 프레임에 맞춰 한 번 실행하는 `requestAnimationFrame`이 고정 `delay`보다 자연스럽다.
- `scroll`·`touchmove`·`wheel` 리스너에서 `preventDefault()`를 부르지 않는다면 `{ passive: true }`를 줘 스크롤을 막지 않게 한다([[dom-events|DOM 이벤트]]).

## 구현 포인트

- `callback.apply(this, args)`로 호출하는 이유: 반환된 함수를 **호출한 객체(this)** 와 인자를 원래 함수에 그대로 넘기기 위해서다.
- 화살표 함수 안에서 `this`를 쓰면 바깥 함수의 this를 그대로 쓰므로 위 코드가 동작한다([[functions|함수와 this]] 참고).
- React 컴포넌트 안에서 만들 때는 렌더링마다 새 함수가 생기지 않게 `useMemo`/`useRef`로 한 번만 만든다.

## 라이브러리 vs 직접 구현

lodash의 `debounce`·`throttle`이 오랫동안 표준처럼 쓰였다. 다만 유지보수 상태와 번들 무게 때문에 lodash 의존을 줄이는 추세라, 위처럼 짧게 직접 구현하는 경우가 늘었다. `leading`/`trailing` 옵션이나 취소(`cancel`)가 필요하면 라이브러리 구현이 더 안전하다.

## 정리

- 둘 다 이벤트 폭주를 줄이는 기법이다.
- 디바운스: 연속 호출이 끝난 뒤 마지막 한 번. 검색·자동 저장.
- 쓰로틀: 연속 호출 중 일정 간격마다 한 번. 스크롤·무한 스크롤.
- 핵심 구현은 `setTimeout` + 클로저에 갇힌 `timer` 변수 하나다.
- 둘 다 함수를 받아 감싼 함수를 돌려주는 데코레이터다. `callback.apply(this, args)`로 this와 인자를 넘기는 콜 포워딩의 원리는 [[function-decorators|데코레이터와 콜 포워딩]]에 있다.

관련 노트: [[event-loop|이벤트 루프]], [[dom-manipulation|DOM 조작]], [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]], [[intersection-observer|Intersection Observer와 관찰자 API]], [[function-decorators|데코레이터와 콜 포워딩]]
