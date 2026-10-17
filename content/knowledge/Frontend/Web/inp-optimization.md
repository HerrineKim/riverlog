---
title: "INP 최적화: 긴 작업 쪼개기와 양보"
concept: "INP Optimization"
summary: "INP는 입력 지연, 처리 시간, 표시 지연의 합이다. 필드 데이터로 느린 상호작용을 찾고, 시작할 때의 스크립트 평가를 줄여 입력 지연을, 핸들러를 가볍게 하고 메인 스레드에 양보해 처리 시간을, DOM 크기·content-visibility·클라이언트 HTML 렌더링을 손봐 표시 지연을 줄인다."
tags: ["performance", "web", "frontend", "javascript", "browser"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/articles/optimize-inp", "https://web.dev/articles/inp", "https://web.dev/learn/performance/code-split-javascript", "https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield", "https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility"]
---

> web.dev의 「[Optimize Interaction to Next Paint](https://web.dev/articles/optimize-inp)」를 바탕으로, `scheduler.yield()`·`content-visibility`의 지원 범위는 MDN으로 확인해 재구성한 노트다. INP의 정의와 세 구간은 [[web-vitals|웹 성능 지표]]에 있다.

## 목표와 원인

INP는 75번째 백분위에서 **200ms 이하**가 목표다. 상호작용 하나의 지연은 입력 지연 + 처리 시간 + 표시 지연이고, 세 구간 모두 결국 **메인 스레드가 바쁜 것**이 원인이다. 브라우저의 메인 스레드 하나가 JS 실행, 스타일, 레이아웃, 페인트를 모두 맡기 때문이다([[browser-rendering|브라우저 렌더링 과정]], [[event-loop|이벤트 루프]]).

**긴 작업(long task)** 은 메인 스레드를 50ms 넘게 잡는 작업이다. 긴 작업이 도는 동안 들어온 입력은 그것이 끝날 때까지 기다린다. Lighthouse의 TBT(Total Blocking Time)는 로딩 중 긴 작업이 50ms를 넘긴 부분의 합이고, 실험실에서 INP를 어림하는 보조 지표다.

## 1. 느린 상호작용을 찾는다

| 단계 | 방법 |
| --- | --- |
| 필드에서 찾기 | RUM이 가장 좋다. `web-vitals`의 attribution 빌드는 **어떤 요소의 어떤 상호작용이, 페이지 로딩 중이었나 후였나, 어느 구간이 길었나**를 알려 준다. CrUX는 요약만 준다 |
| 실험실에서 재현 | 필드에서 찾은 흐름을 DevTools Performance 패널에서 직접 조작하며 녹화한다. 특히 **페이지가 로딩되는 중에** 눌러 본다. 메인 스레드가 가장 바쁜 때다 |
| 구간 나누기 | 같은 프레임의 이벤트(`pointerup`, `mouseup`, `click`)를 하나로 묶어 본다. iframe은 자기 메인 스레드가 따로 있으니 어느 프레임에서 일어났는지 확인한다 |

느린 상호작용 하나를 고치면 다음 것이 드러난다. INP 최적화는 반복 작업이다.

## 2. 입력 지연을 줄인다

입력이 들어왔는데 핸들러가 시작되지 못하는 시간이다.

| 원인 | 처리 |
| --- | --- |
| 시작할 때의 스크립트 평가 | 큰 번들을 받고 파싱·컴파일·실행하는 동안 입력은 기다린다. 첫 화면에 필요 없는 JS는 [[code-splitting\|코드 분할]]로 미룬다 |
| 타이머·`fetch` 응답 처리 | `setInterval`, 응답 파싱 같은 반복 작업이 입력 시점과 겹친다. 작게 나누거나 [[web-workers\|웹 워커]]로 옮긴다 |
| 겹치는 상호작용 | 빠르게 타이핑할 때 앞 입력의 처리가 다음 입력을 막는다. 무거운 반응은 [[debounce-throttle\|디바운스]]하거나 이전 작업을 취소한다 |
| 서드파티 스크립트 | 광고·분석·채팅 위젯. 늦게 불러오거나 [[lazy-loading\|퍼사드]]로 바꾼다 |

## 3. 처리 시간을 줄인다

### 핸들러는 다음 화면에 필요한 일만

핸들러에서 **다음 프레임에 보여야 할 것만 먼저** 하고 나머지는 미룬다. 텍스트 편집기라면 입력한 글자를 그리는 일이 먼저고, 글자 수 세기·맞춤법 검사·저장은 뒤로 미뤄도 된다.

```js
textarea.addEventListener('input', (event) => {
  updateTextbox(event)              // 다음 프레임에 필요한 일

  requestAnimationFrame(() => {     // 다음 프레임이 그려진 뒤로
    setTimeout(() => {
      updateWordCount()
      checkSpelling()
      saveChanges()
    }, 0)
  })
})
```

### 메인 스레드에 양보한다

긴 작업을 여러 작은 작업으로 나눠 그 사이에 브라우저가 입력·렌더링을 처리하게 하는 것을 **양보(yield)** 라고 한다.

```js
function yieldToMain() {
  if (globalThis.scheduler?.yield) {
    return scheduler.yield()        // 이어지는 작업이 큐의 앞쪽으로 들어간다
  }
  return new Promise((resolve) => setTimeout(resolve, 0))
}

async function processAll(items) {
  for (const item of items) {
    process(item)
    await yieldToMain()
  }
}
```

| 방법 | 특징 |
| --- | --- |
| `setTimeout(fn, 0)` | 어디서나 된다. 이어지는 작업이 **태스크 큐 맨 뒤**로 가서 다른 작업에 밀릴 수 있다 |
| `scheduler.yield()` | 이어지는 작업을 우선순위가 높은 큐에 넣어, 양보한 뒤 **먼저 이어서** 실행한다. Baseline이 아니므로 기능 감지 후 `setTimeout`으로 대체한다 |
| `requestAnimationFrame` + `setTimeout` | 화면을 먼저 그리고 나서 나머지를 한다 |

- 매 반복마다 양보하면 오버헤드가 생긴다. 일정 시간(예: 50ms)이 지났을 때만 양보하는 식으로 조절할 수 있다. 그래도 **아무 데서나 양보하는 것이 전혀 안 하는 것보다 낫다.**
- 렌더링과 무관한 계산 자체가 무겁다면 쪼개기보다 [[web-workers|웹 워커]]로 메인 스레드 밖에 둔다.

### 레이아웃 스래싱을 피한다

스타일을 바꾼 직후 `offsetHeight`·`getBoundingClientRect()` 같은 레이아웃 값을 읽으면 브라우저가 그 자리에서 레이아웃을 계산한다(강제 동기 레이아웃). 읽기를 모으고 쓰기를 모은다. 예시는 [[browser-rendering|브라우저 렌더링 과정]]에 있다.

## 4. 표시 지연을 줄인다

핸들러가 끝난 뒤 다음 프레임이 그려지기까지의 시간이다. 렌더링 작업의 양이 정한다.

| 원인 | 처리 |
| --- | --- |
| 큰 DOM | 스타일·레이아웃 비용은 DOM 크기에 비례해 커진다. 중첩을 줄이고, 처음부터 다 만들지 말고 필요할 때 추가한다. 긴 목록은 가상화한다 |
| 화면 밖 콘텐츠까지 렌더링 | `content-visibility: auto`로 화면 밖 구역의 레이아웃·페인트를 건너뛴다. 크기 자리를 잡도록 `contain-intrinsic-size`를 함께 준다 |
| JS로 큰 HTML을 한 번에 넣기 | `innerHTML` 등으로 넣은 큰 마크업은 **다 파싱하고 그릴 때까지 양보하지 않는다.** 서버가 스트리밍한 HTML은 받는 대로 조금씩 파싱된다. SPA에서 흔한 문제다 |
| 프레임워크 리렌더링 | 상태 변경 하나에 넓은 트리가 다시 렌더링된다([[re-rendering\|리렌더링 원인과 추적]]) |

```css
.article-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px; /* 그려진 적 있으면 그 크기를 기억한다 */
}
```

`content-visibility`는 2024년 9월 Baseline(새로 사용 가능)이 됐다. 건너뛴 내용도 페이지 내 검색·탭 이동·선택은 된다.

## 정리

- INP는 메인 스레드가 얼마나 비어 있느냐의 문제다. 필드 데이터로 느린 상호작용과 구간을 먼저 찾는다.
- 입력 지연은 시작 시 JS를 줄여서, 처리 시간은 다음 화면에 필요한 일만 하고 양보해서, 표시 지연은 렌더링할 양을 줄여서 줄인다.
- 양보는 `scheduler.yield()`를 쓰고, 없으면 `setTimeout`으로 대체한다.
- 무거운 계산은 쪼개기보다 웹 워커로 옮긴다.

관련 노트: [[web-vitals|웹 성능 지표와 Lighthouse]], [[web-workers|웹 워커로 메인 스레드 비우기]], [[code-splitting|자바스크립트 코드 분할]], [[event-loop|이벤트 루프]], [[browser-rendering|브라우저 렌더링 과정]], [[devtools-performance|DevTools로 성능·메모리 분석하기]]
