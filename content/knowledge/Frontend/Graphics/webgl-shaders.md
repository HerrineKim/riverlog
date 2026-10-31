---
title: "WebGL과 셰이더: 브라우저가 GPU로 그리는 방식"
concept: "WebGL Shader"
summary: "브라우저가 GPU에 그림을 그리게 하는 API인 WebGL·WebGPU와, GPU에서 도는 작은 프로그램인 정점 셰이더·프래그먼트 셰이더, 셰이더 언어 GLSL ES·WGSL의 관계를 정리했다. 프론트엔드 개발자는 대개 Three.js 같은 라이브러리로 충분하고, 셰이더는 특수 효과가 필요할 때 배운다."
tags: ["frontend", "webgl", "3d", "graphics"]
source: other
date: "2026-10-21"
sources: ["https://www.youtube.com/watch?v=6AHpdQCrf_Q", "https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API", "https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API", "https://notes.underscorediscovery.com/shaders-a-primer/", "https://aerotwist.com/tutorials/an-introduction-to-shaders-part-1/", "https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial"]
---

> Wael Yasmina의 「[WebGL, Shaders, Vertex Shader, Fragment Shader, GLSL ES, and WebGPU In A Nutshell](https://www.youtube.com/watch?v=6AHpdQCrf_Q)」 영상을 바탕으로 재구성한 노트다. 셰이더 변수와 비용은 「[Primer: Shaders](https://notes.underscorediscovery.com/shaders-a-primer/)」, 「[An Introduction to Shaders](https://aerotwist.com/tutorials/an-introduction-to-shaders-part-1/)」, WebGL 2와 컨텍스트 손실은 MDN의 「[WebGL API](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)」로 보강했다.

## 웹 3D를 이루는 층

브라우저가 3D를 그릴 때는 **API(통로)** 를 거쳐 **셰이더(명령)** 를 GPU에 보낸다. 라이브러리는 그 위에서 코드를 줄여 준다.

| 층 | 이름 | 역할 |
| --- | --- | --- |
| 라이브러리 | Three.js, Babylon.js | 장면·카메라·재질 같은 고수준 개념으로 WebGL·WebGPU 호출을 감싼다 |
| 웹 그래픽 API | WebGL, WebGPU | 브라우저의 JavaScript가 GPU와 대화하는 통로. `<canvas>`에 그린다 |
| 셰이더 언어 | GLSL ES(WebGL), WGSL(WebGPU) | GPU에서 실행할 프로그램을 쓰는 C 비슷한 언어 |
| 네이티브 API | OpenGL, OpenGL ES, Vulkan, Metal, Direct3D | 운영체제·드라이버 수준에서 그래픽 카드를 다루는 API |

## OpenGL에서 WebGL로

- **OpenGL**: 애플리케이션이 그래픽 카드에 그리기를 시키는 크로스 플랫폼 API 규격이다.
- **OpenGL ES**: 모바일·임베디드 기기용으로 줄인 OpenGL이다.
- **WebGL**: OpenGL ES를 브라우저의 JavaScript 함수 집합으로 옮긴 것이다. WebGL 1.0은 2011년 3월, OpenGL ES 3.0 기반의 WebGL 2.0은 2017년에 나왔다. 지금은 모든 주요 브라우저가 WebGL 2를 지원한다.
- WebGL 2는 `canvas.getContext('webgl2')`로 얻는다. WebGL 1에서 확장이던 정점 배열 객체(VAO), 인스턴싱, 다중 렌더 타깃이 기본 기능이 되고 3D 텍스처, 유니폼 버퍼, 트랜스폼 피드백이 더해졌다.
- GPU는 공유 자원이라 드라이버 재시작이나 다른 탭의 과사용으로 **컨텍스트를 잃을 수 있다.** `webglcontextlost`에서 `preventDefault()`하고, `webglcontextrestored`에서 버퍼·텍스처·셰이더를 다시 만든다.

## 셰이더란

WebGL이 통로라면 **셰이더(shader)는 그 통로로 보내는 명령**이다. GPU에서 수많은 점과 픽셀에 대해 **병렬로** 실행되는 작은 프로그램이다. 셰이더 코드는 JavaScript 안에 문자열로 넣거나 별도 파일·`<script type="x-shader/...">`로 두고, 실행 중에 컴파일해 GPU에 올린다.

```text
정점 데이터(위치·색·UV)
  → 정점 셰이더   점마다 한 번: 화면상의 위치를 정한다
  → 래스터화      삼각형이 덮는 픽셀 후보(프래그먼트)를 고르고, 정점 값을 보간한다
  → 프래그먼트 셰이더  프래그먼트마다 한 번: 색을 정한다
  → 화면(canvas)
```

| 셰이더 | 실행 단위 | 하는 일 | 대표 출력 |
| --- | --- | --- | --- |
| 정점 셰이더(vertex shader) | 정점(vertex = 점)마다 | 모델·뷰·투영 행렬을 곱해 점을 화면 좌표로 옮긴다. 물결처럼 형태를 바꾸는 효과도 여기서 한다 | `gl_Position` |
| 프래그먼트 셰이더(fragment shader) | 픽셀 후보마다 | 색·텍스처·조명을 계산해 최종 색을 정한다 | 출력 색(`out vec4`) |

- 정점 셰이더는 메시를 이루는 **점의 위치**를, 프래그먼트 셰이더는 그 사이를 채우는 **픽셀의 색**을 맡는다.
- 두 셰이더 사이의 래스터화는 GPU가 고정 기능으로 처리한다. 정점에서 넘긴 값(varying)은 픽셀 위치에 맞게 보간되어 프래그먼트 셰이더에 들어간다.
- 위치 계산에 쓰는 행렬은 [[transformation-matrix|변환 행렬]]과 같은 원리다.

**WebGL에는 고정 파이프라인이 없다.** 옛 OpenGL처럼 「조명을 켜고 삼각형을 넘기면 알아서 그려 주는」 기본 경로 없이, 단색 삼각형 하나도 두 셰이더를 직접 써야 그려진다. 이것을 프로그래머블 파이프라인이라 한다.

### 셰이더로 넘기는 값

| 종류 | GLSL ES 3.0 표기 (1.0 표기) | 값이 바뀌는 단위 | 예 |
| --- | --- | --- | --- |
| 유니폼(uniform) | `uniform` | 그리기 호출 한 번 동안 모든 정점·프래그먼트에 같다 | 변환 행렬, 시간, 광원 위치, 텍스처 |
| 정점 속성(attribute) | 정점 셰이더의 `in` (`attribute`) | 정점마다. 정점 셰이더만 읽는다 | 위치, 법선, 정점 색, UV |
| 베어링(varying) | 정점 셰이더 `out` → 프래그먼트 셰이더 `in` (`varying`) | 정점에서 내보내 삼각형 안에서 **보간**된다 | 조명 계산용 법선, 텍스처 좌표 |

네 꼭짓점을 빨강·초록·파랑·흰색으로 주면 사각형 안이 저절로 섞인 색이 되는 것이 베어링 보간이다.

### 프래그먼트 셰이더가 비싼 이유

1920×1080 화면은 한 프레임에 약 207만 픽셀이고, 60fps면 **초당 약 1억 2천만 번** 프래그먼트 셰이더가 돈다. 후처리용 버퍼가 여러 장이면 그 배수다. 그래서 프래그먼트 셰이더의 한 줄이 성능을 좌우한다. 무거운 계산은 정점 셰이더(정점 수만큼만 돈다)나 미리 구운 텍스처로 옮긴다. 흐림 효과는 가로·세로 두 번으로 나눠 계산량을 줄인다.

## GLSL ES 예시

GLSL ES(OpenGL ES Shading Language)는 WebGL용 셰이더 언어다. 문법은 C와 비슷하고 `vec3`, `mat4` 같은 벡터·행렬 타입이 기본이다.

```glsl
#version 300 es
// 정점 셰이더: 점을 화면 좌표로 옮긴다
in vec3 position;
uniform mat4 mvp;          // 모델·뷰·투영 행렬을 곱한 값
void main() {
  gl_Position = mvp * vec4(position, 1.0);
}
```

```glsl
#version 300 es
precision mediump float;
// 프래그먼트 셰이더: 모든 픽셀을 주황색으로 칠한다
out vec4 color;
void main() {
  color = vec4(1.0, 0.5, 0.0, 1.0);
}
```

순수 WebGL로 큐브 하나를 띄우려면 셰이더 작성·컴파일, 버퍼 생성, 행렬 계산까지 수십 줄이 필요하다. Three.js 같은 라이브러리는 같은 결과를 열 몇 줄로 만든다.

## WebGPU

**WebGPU**는 WebGL의 후속 웹 그래픽 API다. Vulkan·Metal·Direct3D 12 같은 현대 GPU API 구조를 따라 오버헤드가 적고, 렌더링 외에 **컴퓨트 셰이더**로 일반 연산(머신러닝 추론, 물리 시뮬레이션)도 GPU에 맡길 수 있다. 셰이더 언어는 GLSL 대신 **WGSL**(WebGPU Shading Language)이다.

| | WebGL 2 | WebGPU |
| --- | --- | --- |
| 기반 | OpenGL ES 3.0 | Vulkan·Metal·Direct3D 12 |
| 셰이더 언어 | GLSL ES | WGSL |
| 컴퓨트 셰이더 | 없음 | 있음 |
| 지원 | 사실상 모든 브라우저 | Chrome·Edge 113, Safari 26, Firefox 141(Windows부터, 다른 플랫폼은 순차 확대)부터 기본 지원 |

Three.js는 `three/webgpu`의 `WebGPURenderer`로 WebGPU를 쓰고, 지원하지 않는 환경에서는 WebGL 2로 자동 대체한다. 셰이더는 두 백엔드에 공통인 노드 언어 TSL(Three Shading Language)로 쓴다. 자세한 내용은 [[threejs|Three.js로 웹에서 3D 그리기]]에 있다.

## 무엇부터 배울까

- 웹에 3D 장면을 올리는 것이 목적이면 **라이브러리부터** 익힌다. 실무 코드는 대부분 Three.js·Babylon.js·react-three-fiber를 다룬다.
- WebGL·WebGPU API를 직접 다루는 일은 엔진·라이브러리를 만들거나 성능을 극한까지 짜낼 때다.
- 셰이더는 라이브러리를 쓰더라도 쓸모가 있다. 물결·노이즈·그라디언트 배경·후처리 같은 효과는 결국 커스텀 셰이더(Three.js의 `ShaderMaterial`, TSL)로 만든다.
- 프래그먼트 셰이더는 Shadertoy 같은 브라우저 놀이터에서 바로 고쳐 보며 익힌다. WebGL API 자체는 MDN의 「WebGL tutorial」(컨텍스트 → 도형 → 색 → 애니메이션 → 3D 큐브 → 텍스처 → 조명 순)을 따라가면 한 번에 훑을 수 있다.

## 정리

- WebGL·WebGPU는 브라우저와 GPU 사이의 통로, 셰이더는 그 통로로 보내는 GPU 프로그램이다.
- 정점 셰이더는 점의 위치를, 프래그먼트 셰이더는 픽셀의 색을 정하고, 그 사이를 래스터화가 잇는다.
- WebGL은 GLSL ES, WebGPU는 WGSL로 셰이더를 쓴다.
- WebGPU는 더 빠르고 컴퓨트 셰이더를 지원하는 후속 API다.
- 프론트엔드 개발자에게 API 자체는 선택이고, 라이브러리와 기본 셰이더 개념이 실용적인 출발점이다.

관련 노트: [[threejs|Three.js로 웹에서 3D 그리기]], [[transformation-matrix|변환 행렬: 이동·크기·회전과 동차 좌표]], [[client-side-web-ai|클라이언트 사이드 웹 AI]], [[canvas-2d|Canvas 2D API]], [[webxr|WebXR: 브라우저의 VR·AR]], [[graphics-rendering-basics|컴퓨터 그래픽스 렌더링 기초]]
