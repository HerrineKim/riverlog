---
title: "Canvas 2D API"
concept: "Canvas API"
summary: "<canvas>에 JavaScript로 픽셀을 그리는 즉시 모드 그래픽 API. SVG와의 차이(비트맵 vs DOM), getContext의 종류, 상태 스택과 Path2D, 고해상도 화면에서 흐려지지 않게 devicePixelRatio로 키우는 법, 레이어 분리·오프스크린 미리 그리기·정수 좌표·alpha: false 같은 성능 요령, OffscreenCanvas로 워커에서 그리기, 접근성 한계를 정리한다."
tags: ["frontend", "graphics", "browser", "performance", "javascript"]
source: other
date: "2026-10-21"
sources: ["https://developer.mozilla.org/en-US/docs/HTML/Canvas", "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas", "https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas"]
---

> MDN의 「[Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)」, 「[Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)」를 바탕으로 재구성한 노트다.

## Canvas란

`<canvas>`는 **JavaScript로 픽셀을 칠하는 비트맵 영역**이다. 무엇을 그렸는지 기억하지 않는 즉시 모드(immediate mode)라, 한 번 칠한 도형은 객체가 아니라 픽셀일 뿐이다. 움직이려면 지우고 다시 그린다. 애니메이션, 게임, 데이터 시각화, 사진 편집, 실시간 영상 처리에 쓴다. 2015년 7월부터 모든 주요 브라우저에서 쓸 수 있다.

| | Canvas | SVG |
| --- | --- | --- |
| 모델 | 즉시 모드 비트맵 | 유지 모드(retained) DOM 트리 |
| 그린 것 | 픽셀. 개별 도형을 선택·이벤트 처리할 수 없다 | 요소. CSS·이벤트·접근성 트리가 그대로 적용된다 |
| 확대 | 픽셀이 커져 흐려진다 | 어떤 크기에서도 선명하다 |
| 강한 곳 | 수천~수만 개 객체, 매 프레임 바뀌는 장면, 픽셀 조작 | 도형 수가 적고 상호작용·스타일링·확대가 중요한 그림, 아이콘 |

SVG를 CSS로 다루는 법은 [[svg-icons|SVG 아이콘]]에, 3D와 GPU 셰이더는 [[webgl-shaders|WebGL과 셰이더]]에 있다.

## 컨텍스트와 기본 그리기

같은 `<canvas>`에서 `getContext()`의 인수로 그리는 방식을 고른다. 한 캔버스는 한 종류의 컨텍스트만 가진다.

| 인수 | 컨텍스트 | 용도 |
| --- | --- | --- |
| `'2d'` | `CanvasRenderingContext2D` | 2D 도형·이미지·글자 |
| `'webgl'` · `'webgl2'` | `WebGLRenderingContext` · `WebGL2RenderingContext` | GPU 가속 2D·3D |
| `'webgpu'` | `GPUCanvasContext` | WebGPU |
| `'bitmaprenderer'` | `ImageBitmapRenderingContext` | 다른 곳에서 만든 `ImageBitmap`을 그대로 표시 |

```javascript
const ctx = canvas.getContext('2d')
ctx.fillStyle = 'green'
ctx.fillRect(10, 10, 150, 100)          // 왼쪽 위 (10, 10)에서 150×100

ctx.save()                              // 현재 상태(색, 선, 변환, 클립)를 스택에 넣는다
ctx.translate(200, 60)
ctx.rotate(Math.PI / 4)
ctx.strokeRect(-20, -20, 40, 40)        // 회전된 좌표계에서 그린다
ctx.restore()                           // 변환 전 상태로 돌아온다

const heart = new Path2D('M10 30 A20 20 0 0 1 50 30 …') // SVG 경로 문자열로 재사용 가능한 경로
ctx.fill(heart)
ctx.isPointInPath(heart, x, y)          // 클릭이 경로 안인지 직접 판정한다
```

- 좌표의 원점은 왼쪽 위다. 이동·회전·확대는 좌표계 자체를 바꾸므로 `save()`·`restore()`로 감싼다. 행렬의 원리는 [[transformation-matrix|변환 행렬]]에 있다.
- 도형에 이벤트를 걸 수 없으므로 클릭 판정은 `isPointInPath()`나 직접 계산한 경계로 한다.
- 픽셀을 직접 읽고 쓰려면 `getImageData()`·`putImageData()`를 쓴다. 다른 출처 이미지를 CORS 없이 그리면 캔버스가 오염(tainted)돼 픽셀 읽기와 내보내기가 막힌다.
- 결과를 파일로 만드는 `toBlob()`은 [[binary-data-and-files|바이너리 데이터와 파일]]에 있다.

## 고해상도 화면에서 선명하게

캔버스는 `width`·`height` 속성이 **실제 픽셀 수**, CSS 크기는 **보이는 크기**다. 둘이 같으면 기기 픽셀 비율이 2인 화면에서 한 픽셀이 2×2로 늘어나 흐려진다.

```javascript
const dpr = window.devicePixelRatio
const rect = canvas.getBoundingClientRect()
canvas.width = rect.width * dpr          // 실제 픽셀은 키우고
canvas.height = rect.height * dpr
canvas.style.width = `${rect.width}px`   // 보이는 크기는 그대로
canvas.style.height = `${rect.height}px`
ctx.scale(dpr, dpr)                      // 그리는 코드는 CSS 픽셀 단위 그대로 쓴다
```

## 성능 요령

| 요령 | 이유 |
| --- | --- |
| 반복되는 그림은 **오프스크린 캔버스에 미리 그려** `drawImage()`로 찍는다 | 매 프레임 같은 경로 계산을 되풀이하지 않는다 |
| 좌표는 **정수**로 반올림한다 | 소수 좌표는 안티앨리어싱 계산(서브픽셀 렌더링)을 부른다 |
| `drawImage()`에서 매번 크기를 바꾸지 않는다 | 크기별 이미지를 미리 캐시해 둔다 |
| 자주 바뀌는 것과 안 바뀌는 것을 **캔버스 여러 장으로 겹친다** | 배경·게임 장면·UI를 따로 두면 바뀐 층만 다시 그린다 |
| 고정된 큰 배경은 캔버스 대신 CSS `background`로 | 매 프레임 다시 그릴 필요가 없다 |
| 화면 맞춤 확대는 CSS `transform: scale()`로 | GPU가 처리한다. 작은 캔버스를 키우는 쪽이 큰 캔버스를 줄이는 쪽보다 낫다 |
| 투명 배경이 필요 없으면 `getContext('2d', { alpha: false })` | 브라우저가 합성을 최적화한다 |
| 그리기 호출을 묶고 상태 변경을 줄인다 | 선 여러 개보다 폴리라인 하나. `fillStyle`을 매번 바꾸지 않는다 |
| 바뀐 영역만 다시 그린다 | 전체를 지우고 다시 그리지 않는다 |
| `shadowBlur`, 글자 렌더링은 아낀다 | 비싼 연산이다 |
| 애니메이션은 `requestAnimationFrame`으로 | 화면 주사율에 맞추고 숨은 탭에서 멈춘다([[js-animation\|JavaScript 애니메이션]]) |

### OffscreenCanvas: 워커에서 그리기

무거운 그리기는 메인 스레드를 막는다. `OffscreenCanvas`는 DOM 없이 쓸 수 있는 캔버스라 **웹 워커에서 그릴 수 있다.** 화면의 캔버스 제어권을 워커로 넘기면 워커가 그린 결과가 바로 화면에 나온다.

```javascript
// main.js
const offscreen = canvas.transferControlToOffscreen()
worker.postMessage({ canvas: offscreen }, [offscreen])   // 전송(transfer)으로 넘긴다

// worker.js
onmessage = ({ data }) => {
  const ctx = data.canvas.getContext('2d')
  ;(function frame() { drawScene(ctx); requestAnimationFrame(frame) })()
}
```

워커를 쓰는 기준은 [[web-workers|웹 워커로 메인 스레드 비우기]]에 있다.

## 접근성

캔버스는 비트맵일 뿐이라 **그려진 내용이 접근성 트리에 나타나지 않는다.** 캔버스에 쓴 글자는 화면 확대 시 흐려지고 스크린 리더가 읽지 못한다.

- 캔버스는 이미지처럼 다룬다. 핵심 내용은 HTML로도 제공한다(차트라면 데이터 표, 그림이라면 대체 텍스트).
- `<canvas>` 태그 안의 내용은 캔버스를 지원하지 않을 때의 대체 콘텐츠이자 보조 기술이 읽는 설명이다. 조작 가능한 요소는 그 안에 실제 버튼·링크로 둔다.

## 라이브러리

직접 그리기가 번거로우면 장면 그래프와 이벤트를 얹어 주는 라이브러리를 쓴다. 2D 장면·편집기는 Konva·Fabric.js, 창작 코딩은 p5.js, 많은 스프라이트를 GPU로 그리는 2D 게임은 PixiJS(WebGL·WebGPU 사용), 차트는 Chart.js 같은 캔버스 기반 차트 라이브러리를 쓴다.

## 정리

- 캔버스는 기억하지 않는 비트맵이다. 움직임은 지우고 다시 그리기, 클릭 판정은 직접 계산한다.
- 고해상도 화면에서는 실제 픽셀 수를 `devicePixelRatio`배로 키우고 `ctx.scale()`한다.
- 미리 그리기, 레이어 분리, 정수 좌표, 바뀐 곳만 다시 그리기로 프레임을 지킨다. 무거우면 OffscreenCanvas로 워커에 넘긴다.
- 그린 내용은 보조 기술에 보이지 않으므로 핵심 정보는 HTML로도 준다.

**도형이 많고 매 프레임 바뀌면 Canvas, 적고 상호작용·확대가 중요하면 SVG.**

관련 노트: [[webgl-shaders|WebGL과 셰이더]], [[threejs|Three.js로 웹에서 3D 그리기]], [[svg-icons|SVG 아이콘]], [[web-workers|웹 워커로 메인 스레드 비우기]], [[media-capture-web-audio|미디어 캡처와 Web Audio API]]
