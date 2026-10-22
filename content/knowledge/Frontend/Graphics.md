---
title: "Graphics"
concept: "Graphics"
summary: "브라우저가 GPU로 그리는 원리(WebGL·WebGPU·셰이더), Three.js로 그리는 웹 3D, 영상을 투명 배경 애니메이션 아이콘으로 쓰는 방법을 다루는 노트 모음."
tags: ["frontend", "graphics", "webgl", "animation"]
source: mixed
date: "2026-10-15"
---

그래픽스 주제는 **화면에 그림을 어떻게 그리는가**를 다룬다. WebGL과 셰이더가 GPU로 점과 픽셀을 그리는 원리, 이를 감싼 Three.js로 웹에 3D 장면을 만드는 방법, 3D 아이콘 영상을 알파 채널 애니메이션으로 바꿔 아이콘처럼 쓰는 제작 흐름이 여기 속한다. 좌표 변환의 수학은 [[transformation-matrix|변환 행렬]]에, CSS 애니메이션은 [CSS](/knowledge/dictionary/frontend/css) 주제에 있다.

## 노트

- [Canvas 2D API](Frontend/Graphics/canvas-2d.md): 즉시 모드 비트맵 그리기와 SVG 비교, 상태 스택·Path2D, devicePixelRatio 대응, 성능 요령, OffscreenCanvas, 접근성 한계
- [WebGL과 셰이더: 브라우저가 GPU로 그리는 방식](Frontend/Graphics/webgl-shaders.md): OpenGL·WebGL·WebGPU의 관계, 정점·프래그먼트 셰이더와 래스터화, GLSL ES·WGSL, 무엇부터 배울까
- [Three.js로 웹에서 3D 그리기](Frontend/Graphics/threejs.md): WebGL을 쉽게 쓰게 감싼 라이브러리의 구성 요소(Scene·Camera·Mesh·Renderer), 활용 사례, 장단점
- [WebXR: 브라우저의 VR·AR](Frontend/Graphics/webxr.md): 세션 종류와 기준 공간, XR 프레임 루프와 눈별 뷰, 입력 소스, 히트 테스트·앵커, 점진적 향상
- [Animated Icon: 영상을 투명 배경 아이콘으로 쓰기](Frontend/Graphics/animated-icon.md): 3D 아이콘 영상을 알파 채널 애니메이션 포맷으로 바꿔 앱·웹에서 쓰는 흐름과 포맷별 선택지
