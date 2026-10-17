---
title: "웹 워커로 메인 스레드 비우기"
concept: "Web Workers"
summary: "웹 워커는 JS를 메인 스레드가 아닌 별도 스레드에서 돌린다. DOM과 window에는 접근할 수 없고 postMessage로만 메인 스레드와 대화한다. 가져오기·파싱·대용량 계산처럼 DOM이 필요 없는 무거운 일을 옮기면 긴 작업이 줄어 INP가 좋아지고, 그 일에 쓰는 라이브러리의 다운로드·컴파일 비용도 함께 빠진다."
tags: ["performance", "javascript", "browser", "frontend", "thread"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/performance/web-worker-overview", "https://web.dev/learn/performance/web-worker-demo"]
---

> web.dev의 「[Learn Performance](https://web.dev/learn/performance)」 강좌 중 「An overview of web workers」, 「A concrete web worker use case」 모듈을 바탕으로 재구성한 노트다.

## 메인 스레드와 워커

「JavaScript는 싱글 스레드다」라는 말은 **메인 스레드**를 가리킨다. 메인 스레드 하나가 스크립트 실행, HTML·CSS 파싱, 스타일·레이아웃·페인트 대부분, 입력 처리를 맡는다([[browser-rendering|브라우저 렌더링 과정]], [[event-loop|이벤트 루프]]). 브라우저 안에는 GPU 스레드 같은 다른 스레드도 있지만 개발자가 직접 쓸 수는 없다.

**웹 워커(Web Worker)** 는 개발자가 쓸 수 있는 추가 스레드다. 무거운 계산을 워커로 옮기면 메인 스레드에 긴 작업이 생기지 않아, 사용자 입력에 바로 반응할 수 있다([[inp-optimization|INP 최적화]]).

## 만들기와 메시지 주고받기

```js
// main.js — 메인 스레드
const worker = new Worker('/js/my-worker.js')            // 클래식 워커
// const worker = new Worker('/js/my-worker.js', { type: 'module' })  // 모듈 워커

worker.addEventListener('message', ({ data }) => {
  console.log(data) // "Hello, window!"
})
worker.postMessage('hi')
```

```js
// my-worker.js — 워커 스레드. 전역은 window가 아니라 self
self.addEventListener('message', () => {
  self.postMessage('Hello, window!')
})
```

| 항목 | 워커에서 |
| --- | --- |
| 전역 객체 | `self`(`WorkerGlobalScope`). `window`가 아니다 |
| DOM | **접근할 수 없다.** 화면을 바꾸려면 결과를 메인 스레드로 보낸다 |
| 쓸 수 있는 것 | 언어 기본 기능(배열·객체 등), `fetch`, IndexedDB, `FileReader`, 타이머 등 워커용 API |
| 대화 | `postMessage`와 `message` 이벤트. 데이터는 구조화된 복제로 **복사**된다 |
| 라이브러리 불러오기 | 클래식 워커는 `importScripts()`, 모듈 워커(`type: 'module'`)는 정적 `import` |

- 메시지 하나로 끝나는 단순한 일이면 원시 API로 충분하다. 함수 호출처럼 쓰고 싶으면 Comlink 같은 추상화가 `postMessage`를 감싸 준다.
- 큰 `ArrayBuffer`는 복사 대신 **이전(transfer)** 해서 비용을 없앨 수 있다. 스레드·복사 모델은 [[concurrency-models|동시성 모델]]에 있다.

## 예: 이미지 메타데이터 읽기

이미지 URL을 받아 Exif 메타데이터(카메라 기종, 색 깊이 등)를 화면에 보여 주는 기능을 생각해 보자.

```text
1. 이미지를 가져온다(fetch)
2. 응답을 ArrayBuffer로 바꾼다
3. Exif 파서 라이브러리로 메타데이터를 뽑는다
4. 메타데이터로 HTML 문자열을 만든다
5. 화면에 넣는다          ← 이것만 DOM이 필요하다
```

1~4를 워커가 하고, 메인 스레드는 URL을 보내고 받은 HTML을 넣기만 한다.

```js
// exif-worker.js
importScripts('/js/exifreader.js')

self.addEventListener('message', async ({ data: imageUrl }) => {
  // 메타데이터는 파일 앞부분에 있으니 64KiB만 받는다
  const res = await fetch(imageUrl, { headers: { Range: `bytes=0-${64 * 1024}` } })
  const buffer = await res.arrayBuffer()
  const tags = ExifReader.load(buffer, { expanded: true })
  self.postMessage(toMarkup(tags))
})
```

DevTools Performance 패널로 비교하면 차이가 보인다.

| | 메인 스레드에서 | 워커에서 |
| --- | --- | --- |
| 메인 스레드 긴 작업 | 가져오기·디코딩, 메타데이터 추출 두 덩이 | 크게 짧아진다. 메시지 주고받기와 DOM 갱신만 남는다 |
| 파서 라이브러리 | 메인 스레드에서 받고 컴파일 | **다운로드·파싱·컴파일까지 워커에서** |

- `Range` 요청 헤더로 필요한 앞부분만 받는 것도 같이 쓸 만한 기법이다. 서버가 범위 요청을 지원해야 한다.
- 실전 코드에서는 실패한 응답(`!res.ok`)과 예외를 메시지로 돌려보내 처리한다.

## 무엇을 워커로 보내나

| 맞는 일 | 맞지 않는 일 |
| --- | --- |
| 응답 가져오기와 큰 JSON·바이너리 파싱 | DOM을 읽고 쓰는 일 |
| 대용량 데이터 정렬·필터·집계 | 아주 짧은 계산(메시지 복사 비용이 더 크다) |
| 이미지·오디오 처리, 압축, 암호화 | 매 프레임 화면과 맞물려야 하는 일(OffscreenCanvas로 옮길 수 있는 그리기는 예외) |
| 문법 강조, 검색 색인 같은 백그라운드 작업 | |

워커로 옮길 수 없는 렌더링 관련 작업은 [[inp-optimization|INP 최적화]]의 양보(`scheduler.yield()`)로 쪼갠다. 서비스 워커는 이름이 비슷하지만 네트워크 프록시 역할의 다른 워커다([[pwa-service-worker|PWA와 서비스 워커]]).

## 정리

- 웹 워커는 메인 스레드 밖에서 JS를 돌리는 스레드다. DOM·`window`는 없고 `self`와 `postMessage`만 있다.
- DOM이 필요 없는 무거운 일(가져오기·파싱·계산)을 옮기면 메인 스레드의 긴 작업이 줄어 INP가 좋아진다.
- 그 일에 쓰는 라이브러리의 다운로드·컴파일 비용도 메인 스레드에서 빠진다.
- 메시지는 복사되므로 작은 일에는 오히려 손해다. 큰 버퍼는 이전한다.

관련 노트: [[inp-optimization|INP 최적화]], [[event-loop|이벤트 루프]], [[concurrency-models|동시성·병렬·비동기·논블로킹과 동시성 모델]], [[browser-rendering|브라우저 렌더링 과정]], [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]], [[pwa-offline-storage|PWA 오프라인 데이터와 저장소 관리]]
