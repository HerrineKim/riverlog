---
title: "Three.js로 웹에서 3D 그리기"
concept: "Three.js"
summary: "WebGL을 쉽게 쓰도록 감싼 JavaScript 3D 라이브러리 Three.js의 구성 요소(Scene·Camera·Mesh·Renderer)와 활용 사례, 장단점."
tags: ["3d", "javascript", "webgl", "frontend"]
source: notion
sources: ["https://webactually.com/2017/11/09/webgl%ec%9d%84-%ec%82%ac%ec%9a%a9%ed%95%9c-%ec%95%a0%eb%8b%88%eb%a9%94%ec%9d%b4%ec%85%98-%eb%b0%8f-%ec%9d%b8%ed%84%b0%eb%9e%99%ec%85%98-%ea%b8%b0%eb%b2%95/", "https://web.dev/blog/webgpu-supported-major-browsers"]
date: "2026-10-13"
---

> 「코드로 움직임 만들기」 부분은 Karim Maaloul의 「WebGL을 사용한 애니메이션 및 인터랙션 기법」(웹액츄얼리 번역, 2017.11)을 바탕으로 보강한 노트입니다.

**Three.js**는 웹 페이지에 3D 객체를 렌더링하게 해 주는 오픈 소스 JavaScript 라이브러리다. Three.js 자체가 렌더링 기술은 아니고, 저수준 그래픽 API인 **WebGL**을 쉽고 직관적으로 쓰게 감싼 래퍼다. 데모씬(컴퓨터 아트 커뮤니티) 출신 개발자 Ricardo Cabello(mrdoob)가 WebGL을 편하게 쓰려고 만들기 시작했다.

## WebGL 위의 라이브러리

WebGL은 브라우저가 GPU에 그리기를 시키는 저수준 API이고, 실제 그리기는 GPU에서 도는 **셰이더(shader)** 가 맡는다. 순수 WebGL로 큐브 하나를 그리려면 셰이더 작성부터 수십 줄이 필요하지만, Three.js는 열 몇 줄이면 된다. OpenGL·WebGL·WebGPU의 관계와 셰이더의 동작은 [[webgl-shaders|WebGL과 셰이더]]에 있다.

- 웹에서 화려한 3D 그래픽을 보면 개발자 도구에서 `<canvas>` 태그를 찾을 수 있다(영상이나 GIF가 아니라면).

## 구성 요소

영화 촬영에 비유하면 이해하기 쉽다.

| 요소 | 역할 |
| --- | --- |
| **Scene** | 무대. 모든 물체와 조명을 담는 공간 |
| **Camera** | 어떤 위치·각도에서 장면을 비출지. 주로 원근감 있는 `PerspectiveCamera` |
| **Mesh** | 장면에 놓이는 물체 = 형태(Geometry) + 재질(Material) |
| **Light** | 조명. Mesh처럼 생성해 장면에 추가한다 |
| **Renderer** | 장면을 카메라 시점으로 `<canvas>`에 그린다 |

## 예제: 회전하는 정육면체

```javascript
import * as THREE from 'three'

// 렌더러: 화면 크기에 맞추고 canvas를 body에 추가
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// 장면과 원근 카메라 (시야각, 화면 비율, near, far)
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 1, 5) // 살짝 위·뒤에서 바라보면 입체감이 생긴다

// Mesh = Geometry + Material
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x88ff44 })
)
scene.add(cube)

// 매 프레임 조금씩 회전
renderer.setAnimationLoop(() => {
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01
  renderer.render(scene, camera)
})
```

- 설치는 CDN 또는 `npm install three`.
- `MeshBasicMaterial`은 조명의 영향을 받지 않는다. 빛과 그림자를 표현하려면 `MeshStandardMaterial`과 조명을 함께 쓴다.
- lil-gui 같은 GUI 라이브러리를 붙이면 회전 속도·빛의 각도를 실시간으로 조절하는 패널을 만들 수 있다.
- React에서는 **react-three-fiber**로 Three.js 객체를 JSX 컴포넌트처럼 선언할 수 있다.
- 가방·자동차 같은 정교한 모델은 Three.js 코드로 만들지 않는다. [Blender](/knowledge/dictionary/tools/blender), Maya, Cinema 4D 등에서 모델링해 glTF로 내보낸 뒤 불러온다.

## 코드로 움직임 만들기: 삼각함수 사이클

키프레임 타임라인 없이, 사용자 입력에 반응하는 캐릭터 움직임을 코드로 만들 수 있다. 원리는 자동 인형(오토마톤)과 같다. **하나의 회전 각도가 돌아가면 모든 부위가 그 주기에 맞춰 움직인다.**

```text
x = cos(angle) * distance
y = sin(angle) * distance     ← 원운동을 가로·세로 직선 운동으로 바꾼다
```

```javascript
// 매 프레임 각도를 조금씩 늘리고, 부위마다 위상(offset)과 진폭(amp)을 달리 준다
hero.run = function () {
  this.cycle += 0.03
  const t = this.cycle, amp = 4
  this.legR.position.x = Math.cos(t) * amp
  this.legR.position.y = Math.max(0, -Math.sin(t) * amp)   // 땅 아래로는 안 내려간다
  this.legL.position.x = Math.cos(t + Math.PI) * amp        // 반대 다리는 반 바퀴 늦게
  this.legL.position.y = Math.max(0, -Math.sin(t + Math.PI) * amp)
  this.torso.position.y = 8 - Math.cos(t * 2) * amp * 0.2  // 몸통은 두 배 빠르게 살짝 출렁
  this.head.rotation.x = Math.cos(t) * amp * 0.02
}
```

| 조절값 | 효과 |
| --- | --- |
| 각도 증가량 | 속도. 크게 하면 빨리 달린다 |
| 위상 차이 (`+ PI`) | 왼쪽·오른쪽처럼 번갈아 움직이는 부위 |
| 주파수 (`t * 2`) | 한 걸음에 두 번 출렁이는 몸통처럼 빠른 반복 |
| 진폭 | 움직임의 크기. 귀·혀 같은 작은 부위에도 작게 주면 생동감이 생긴다 |

- 먼저 **관찰**한다. 슬로 모션 영상에서 달릴 때 다리뿐 아니라 귀·입·몸통이 같은 주기로 움직이는 것을 본다.
- 부위는 `THREE.Group`으로 몸통에 묶어 함께 움직이게 한다.
- 정점 수와 부위 수를 일부러 적게 제한하면, 오히려 감정(편안함·기쁨·불안)을 움직임 하나로 또렷하게 표현할 수 있다.

## 활용 사례

- 인터랙티브 포트폴리오(예: 자동차를 운전하며 둘러보는 Bruno Simon의 포트폴리오)
- 브랜드 상품 소개 페이지: 마우스 커서에 반응하며 돌아가는 3D 상품
- 웹 게임: 물리 엔진(예: p2.js, cannon-es)과 결합한 핀볼 등
- 비주얼 저널리즘: 드래그로 대상을 돌려 보며 읽는 기사. 해외 언론사에서 자주 쓴다

## 장점과 한계

| 장점 | 한계 |
| --- | --- |
| 웹에서 몰입감 있는 인터랙티브 경험 구현 | 좋은 결과물은 결국 3D 모델링 역량에 달려 있다 |
| 진입 장벽이 낮은 편 | 게임 엔진급 기능(물리 엔진 등)은 별도 라이브러리가 필요 |
| 가장 오래되고 큰 커뮤니티, 활발한 업데이트 | 소스가 JavaScript라 타입은 `@types/three`에 의존 |
| React 등 생태계 라이브러리가 풍부 | |

## 함께 보면 좋은 기술

- **Babylon.js**: 물리 엔진 연동과 에디터를 갖춘 TypeScript 기반 3D 엔진. Microsoft가 후원한다.
- **WebGPU**: WebGL의 후속 웹 그래픽 API로, 렌더링뿐 아니라 컴퓨트 셰이더로 GPU 연산을 직접 쓸 수 있다. Chrome·Edge(113~), Safari 26, Firefox(141~, Windows부터)가 기본으로 지원한다. Three.js는 `three/webgpu`의 `WebGPURenderer`를 제공하고, WebGPU가 없는 환경에서는 WebGL 2로 자동 대체한다. 셰이더는 플랫폼 공통 노드 언어인 TSL(Three Shading Language)로 쓴다.

## 핵심 정리

- WebGL(저수준 GPU API) 위에 Scene·Camera·Mesh·Light·Renderer라는 고수준 개념을 얹은 것이 Three.js다.
- Mesh = Geometry + Material, 애니메이션은 `setAnimationLoop`로 매 프레임 렌더링한다.
- 복잡한 모델은 외부 툴에서 만들어 불러오고, React에서는 react-three-fiber를 쓴다.

관련 노트: [[webgl-shaders|WebGL과 셰이더]], [[transformation-matrix|변환 행렬]]
