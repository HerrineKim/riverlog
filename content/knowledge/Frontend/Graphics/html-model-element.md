---
title: "HTML model 요소: 브라우저가 직접 그리는 3D"
concept: "HTML Model Element"
summary: "model 요소는 3D 모델 파일을 img나 video처럼 HTML에 넣으면 브라우저가 직접 렌더링해 주는 요소다. 2026년 기준 Safari 27 이상(iOS·iPadOS·macOS·visionOS)만 지원하며, 표준은 아직 초안이라 img 대체 콘텐츠와 폴리필을 함께 쓴다."
tags: ["frontend", "graphics", "html", "webxr", "safari"]
source: other
date: "2026-11-25"
sources: ["https://webkit.org/blog/18325/webkit-features-for-safari-27-0/", "https://developer.apple.com/videos/play/wwdc2026/215/", "https://immersive-web.github.io/model-element/", "https://caniuse.com/mdn-html_elements_model"]
---

> WebKit 블로그의 「WebKit Features for Safari 27.0」, WWDC26 세션 「Get started with the HTML Model Element」, 표준 초안과 Can I use 지원표를 바탕으로 정리했다.

## 무엇인가

`model` 요소는 3D 모델을 `img`, `video`, `audio`처럼 선언적으로 페이지에 넣는 HTML 요소다. 모델은 독립된 리소스 파일로 제공하고, 렌더링은 브라우저(사용자 에이전트)가 맡는다. 회전·애니메이션 재생 같은 상호작용과 visionOS의 입체 표시도 지원한다.

```html
<model src="product.usdz"></model>
```

브라우저가 직접 그리므로 사용자의 시선·주변 조명 같은 민감한 정보를 JavaScript에 노출하지 않고도 쓸 수 있고, 접근성 컨트롤도 브라우저가 제공한다.

## 지원 현황 (2026년 11월 기준)

| 항목 | 내용 |
| --- | --- |
| visionOS | 2025년에 먼저 출시 |
| iOS·iPadOS·macOS | Safari 27.0부터 지원 (2026-09-17 공개) |
| 그 밖의 브라우저 | 미지원. 전 세계 사용률은 약 2.75% 수준이다 |
| 표준 | Immersive Web Community Group의 초안 보고서이며 작업 진행 중이다 |

## 쓰는 방법

| 요소 | 설명 |
| --- | --- |
| `src` 또는 `source` | 모델 파일. USDZ를 권장하고 GLB(`model/gltf-binary`) 등도 가능하다 |
| 대체 콘텐츠 | `model` 안에 `img`를 넣으면 미지원 브라우저가 이미지를 보여 준다 |
| `environmentmap` | 모델에 쓸 조명(환경 맵) 지정 |
| `stagemode` | 기본 상호작용 방식. `orbit`이면 좌우로 자유롭게 돌리고 위아래로 기울이면 원래 각도로 돌아온다 |
| `ready` 프로미스 | 모델 로딩 완료 시점. 용량이 수십 MB일 수 있으므로 스피너를 두고 완료되면 숨긴다 |

```html
<model>
  <source src="boot.usdz" type="model/vnd.usdz+zip">
  <source src="boot.glb" type="model/gltf-binary">
  <img src="boot.png" alt="가죽 워크부츠">
</model>
```

## 주의할 점

- 모델은 자체 가상 공간에 그려져 페이지 배경을 받지 않는다. 배경은 `model`에 `background-color`로 직접 지정하며, 투명도를 줘도 불투명으로 처리된다.
- 보안 컨텍스트(HTTPS)에서만 모델을 불러온다.
- 비지원 브라우저를 위해 표준 샘플처럼 `model`이 정의되지 않았을 때 폴리필을 불러온다. 입체 표시 같은 일부 기능은 폴리필로 만들 수 없다.
- iOS·iPadOS에서 제품을 실제 공간에 놓아 보게 하려면 모델을 AR 보기로 여는 링크로 감싼다.

## model-viewer와 비교

| 방식 | 특징 |
| --- | --- |
| `model` 요소 | 라이브러리 없이 플랫폼이 직접 렌더링한다. 지원 브라우저가 아직 좁다 |
| `<model-viewer>` 웹 컴포넌트 | JavaScript 라이브러리로 어느 브라우저에서나 쓰며, WebXR·AR Quick Look 분기를 대신한다 |
| [[threejs\|Three.js]] | 장면 전체를 직접 구성하는 범용 WebGL 라이브러리다 |

관련 노트: [[webxr|WebXR]], [[webgl-shaders|WebGL과 셰이더]]
