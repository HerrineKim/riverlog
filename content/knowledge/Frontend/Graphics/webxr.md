---
title: "WebXR: 브라우저의 VR·AR"
concept: "WebXR"
summary: "브라우저에서 VR 헤드셋과 AR 기기에 3D 장면을 보여 주는 WebXR Device API. 세션 종류(inline·immersive-vr·immersive-ar), 기준 공간과 3DoF·6DoF, XR 전용 프레임 루프와 눈마다의 뷰, 입력 소스, AR 모듈(히트 테스트·앵커·DOM 오버레이)을 정리하고, 평면 화면·휴대폰 AR·헤드셋을 한 페이지로 지원하는 점진적 향상과 브라우저 지원 범위, 전신인 WebVR을 다룬다."
tags: ["frontend", "graphics", "3d", "webgl", "browser"]
source: other
date: "2026-10-21"
sources: ["https://developers.google.com/web/updates/2018/05/welcome-to-immersive", "https://blog.mozvr.com/progressive-webxr-ar-store/", "https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API", "https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API/Fundamentals"]
---

> 「[Welcome to the immersive web](https://developers.google.com/web/updates/2018/05/welcome-to-immersive)」, 「[Progressive WebXR](https://blog.mozvr.com/progressive-webxr-ar-store/)」을 바탕으로, API와 지원 범위는 MDN의 「[WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)」로 확인해 재구성한 노트다.

## WebXR이란

**WebXR Device API는 VR·AR 기기를 찾고, 그 기기에 맞는 주사율로 3D 장면을 보내고, 머리와 컨트롤러의 움직임을 읽는 브라우저 API**다. XR의 X는 「어떤 것이든」을 뜻하는 변수다. 완전한 현실부터 완전한 가상현실까지를 하나의 스펙트럼으로 보고, 그 사이의 AR까지 한 API로 다룬다.

WebXR은 **그리기를 하지 않는다.** 화면은 WebGL(또는 WebGPU)로 직접 그린다. WebXR은 「어느 위치에서 어느 방향을 보고 있나」와 「어느 버퍼에 그리면 되나」를 알려 준다. 그래서 실무에서는 Three.js(`renderer.xr`, `VRButton`·`ARButton`), Babylon.js, A-Frame 같은 엔진 위에서 쓴다.

```text
기기 탐색 → 세션 요청(사용자 동작) → 기준 공간 → XR 프레임 루프 ─┐
                                                     ↑        │ 매 프레임: 머리 자세 → 눈마다 뷰 → WebGL로 그리기
                                                     └────────┘
세션 종료(사용자·앱) → 페이지로 돌아온다
```

## 핵심 개념

| 개념 | 내용 |
| --- | --- |
| 세션 모드 | `inline`(페이지 안 일반 캔버스), `immersive-vr`(헤드셋이 시야를 덮는다), `immersive-ar`(현실 위에 겹친다) |
| 자유도(DoF) | 3DoF는 회전만(고개 돌리기), 6DoF는 회전 + 위치(걸어 다니기). 기기와 기준 공간에 따라 다르다 |
| 기준 공간 | `viewer`(머리 기준), `local`(시작 위치 기준, 앉은 경험), `local-floor`(바닥 높이 포함), `bounded-floor`(정해진 방 안), `unbounded`(넓은 공간 AR) |
| 프레임 루프 | `window.requestAnimationFrame`이 아니라 `session.requestAnimationFrame`. 헤드셋 주사율(72~120Hz)에 맞춘다 |
| 뷰 | `frame.getViewerPose(refSpace).views` — 눈마다 투영 행렬과 위치가 따로 온다. 같은 장면을 눈마다 한 번씩, 한 프레임버퍼의 왼쪽·오른쪽 절반에 그린다 |
| 입력 소스 | 컨트롤러, 손(hand tracking), 화면 탭, 시선. `select`·`squeeze` 이벤트와 `targetRaySpace`로 가리키는 방향을 준다 |

```javascript
if (await navigator.xr?.isSessionSupported('immersive-vr')) {
  enterButton.hidden = false
}

enterButton.addEventListener('click', async () => {      // 몰입형 세션은 사용자 동작이 필요하다
  const session = await navigator.xr.requestSession('immersive-vr', {
    optionalFeatures: ['local-floor', 'hand-tracking'],
  })
  const gl = canvas.getContext('webgl2', { xrCompatible: true })
  session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) })
  const refSpace = await session.requestReferenceSpace('local-floor')

  session.requestAnimationFrame(function onFrame(time, frame) {
    const pose = frame.getViewerPose(refSpace)
    if (pose) {
      const layer = session.renderState.baseLayer
      gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer)
      for (const view of pose.views) {
        const vp = layer.getViewport(view)
        gl.viewport(vp.x, vp.y, vp.width, vp.height)
        drawScene(view.projectionMatrix, view.transform.inverse.matrix)
      }
    }
    session.requestAnimationFrame(onFrame)
  })
})
```

- 보안 컨텍스트에서만 동작하고, iframe에서는 `Permissions-Policy: xr-spatial-tracking`이 허용돼야 한다.
- 필요한 기능은 `requiredFeatures`(없으면 세션 실패)와 `optionalFeatures`(있으면 사용)로 나눠 요청한다.

### AR 모듈

AR은 핵심 API 위의 모듈로 더해진다.

| 모듈 | 하는 일 |
| --- | --- |
| Augmented Reality | `immersive-ar` 세션. 카메라 화면은 브라우저가 합성하고 페이지는 접근하지 않는다 |
| Hit Test | 화면 속 현실 표면(바닥·벽)과 광선의 교차점을 찾아 물체를 놓는다 |
| Anchors | 현실의 한 지점에 물체를 고정해, 기기가 공간 이해를 갱신해도 제자리에 둔다 |
| DOM Overlay | AR 화면 위에 HTML UI(버튼, 설명)를 겹친다 |
| Depth Sensing · Lighting Estimation | 현실의 깊이로 가림 처리, 현실 조명에 맞춰 음영 |

## 점진적 향상: 한 페이지로 모든 화면 지원

XR 기기는 세 부류로 나뉜다. **한 기기에 맞춰 만들고 나머지에서 흉내 내지 말고, 기기마다 맞는 인터페이스를 준다.**

| 화면 | 예 | 줄 수 있는 경험 |
| --- | --- | --- |
| 평면 화면(XR 없음) | 데스크톱, XR 미지원 휴대폰 | 마우스·터치로 돌려 보는 3D 뷰어. 휴대폰은 기기 방향 센서로 시점을 바꾸는 「매직 윈도」 |
| 포털(휴대 AR) | ARCore가 있는 Android | 카메라 화면 속 내 방에 제품을 놓아 보기 |
| 몰입형 헤드셋 | Meta Quest, Apple Vision Pro | VR 공간 안에서 제품 보기, 손·컨트롤러로 조작 |

예를 들어 쇼핑몰 상품 페이지는 평소에는 일반 페이지와 3D 뷰어로 보이고, AR이 되는 휴대폰에서는 「내 방에 놓아 보기」, 헤드셋에서는 「VR로 보기」 버튼이 나타난다. 버튼은 `isSessionSupported()` 결과로만 보여 준다.

3D 모델 하나를 보여 주는 정도라면 `<model-viewer>` 웹 컴포넌트가 이 분기를 대신한다. WebXR이 되면 WebXR로, Android는 Scene Viewer, iOS는 AR Quick Look(USDZ)으로 넘긴다.

## 지원 범위 (2026년 기준)

| 환경 | 지원 |
| --- | --- |
| Chromium 계열 | Chrome 79부터. Android Chrome은 ARCore 기기에서 `immersive-ar`, Meta Quest Browser·PC 헤드셋은 `immersive-vr` |
| Safari | visionOS의 Safari에서 `immersive-vr`. iOS·macOS Safari는 지원하지 않는다 |
| Firefox | 지원하지 않는다 |

**Baseline이 아닌 실험적 기술**이므로 지원 감지와 평면 화면 대체 경로가 필수다. 기기가 없을 때는 Immersive Web Emulator 같은 브라우저 확장으로 개발한다.

## 역사

- 2016~2018년의 **WebVR 1.1**은 VR만 다뤘다. Chrome 62 오리진 트라이얼, Firefox, Edge가 구현했다. 메인 스레드에 묶인 설계, 잘못 설정하기 쉬운 구조, 매직 윈도가 의도가 아닌 부산물이었다는 문제 때문에 버려졌다.
- 2018년부터 AR까지 확장할 수 있게 다시 설계한 **WebXR Device API**로 대체됐다. WebVR은 브라우저에서 제거됐다.
- 과거의 3DoF 헤드셋(Google Daydream, Samsung Gear VR)과 스마트폰 거치형 Cardboard는 단종됐다. Mozilla의 iOS용 실험 브라우저 WebXR Viewer는 중단됐고, 헤드셋용 Firefox Reality는 Igalia의 Wolvic으로 넘어갔다.

## 정리

- WebXR은 기기 탐색, 자세 추적, 프레임 루프를 맡고 그리기는 WebGL·WebGPU가 맡는다. 실무에서는 Three.js 같은 엔진으로 쓴다.
- 몰입형 세션은 사용자 동작 안에서 요청하고, 루프는 `session.requestAnimationFrame`으로 돌며 눈마다 그린다.
- 기기는 평면·포털·몰입형 세 부류다. 기능 감지로 버튼을 고르고 평면 화면 경험을 기본으로 둔다.
- 지원이 Chromium과 visionOS Safari에 한정되므로 점진적 향상으로 설계한다.

**XR은 기본 경험 위에 얹는 향상이지, 그것만으로 서는 경험이 아니다.**

관련 노트: [[threejs|Three.js로 웹에서 3D 그리기]], [[webgl-shaders|WebGL과 셰이더]], [[device-permission-apis|권한 모델과 기기 API]], [[pwa-os-integration|PWA 기능과 OS 통합]]
