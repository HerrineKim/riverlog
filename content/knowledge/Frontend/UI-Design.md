---
title: "UI Design"
concept: "UI Design"
summary: "디자인 시스템과 핸드오프, 접근성, 레이아웃, 전자상거래·제스처 UI 패턴, 움직이는 아이콘과 Three.js 3D까지 화면의 생김새와 쓰임새를 다루는 노트 모음."
tags: ["frontend", "ui", "design-system", "graphics"]
source: mixed
---

UI 디자인 주제는 **화면이 어떻게 보이고 움직이는가**를 다룬다. 색·간격·타이포그래피를 토큰으로 묶어 여러 프로젝트에 같은 모양을 배포하는 디자인 시스템, 영상을 투명 배경 애니메이션 아이콘으로 바꾸는 제작 흐름, WebGL과 셰이더가 GPU로 그리는 원리와 이를 감싼 Three.js로 웹에 3D를 그리는 방법이 여기 속한다. 누구나 쓸 수 있게 만드는 접근성, 인쇄와 다른 웹 레이아웃, 전자상거래와 제스처 같은 UI 패턴, 디자이너와 개발자가 Figma로 주고받는 핸드오프도 함께 다룬다. 사용자 리서치와 디자이너의 코드 학습은 [[user-research|Life & Learning]] 분야에 있다. AI로 디자인을 뽑는 프롬프트 기법은 [[ai-frontend-design-prompting|AI & Data]] 분야에 있다.

## 노트

- [디자인 시스템: 구성, 도입, 구축과 배포](Frontend/UI-Design/design-system.md): 구성 요소, 작은 팀도 필요한 이유와 도입 시점, 감사부터 QA까지 구축 절차와 이름 규칙, 토큰·컴포넌트를 모노레포 패키지로 배포하고 Storybook으로 문서화하는 구조
- [Animated Icon — 영상을 투명 배경 아이콘으로 쓰기](Frontend/UI-Design/animated-icon.md): 3D 아이콘 영상을 알파 채널 애니메이션 포맷으로 바꿔 앱·웹에서 쓰는 흐름과 포맷별 선택지
- [Three.js로 웹에서 3D 그리기](Frontend/UI-Design/threejs.md): WebGL을 쉽게 쓰게 감싼 라이브러리의 구성 요소(Scene·Camera·Mesh·Renderer), 활용 사례, 장단점
- [WebGL과 셰이더: 브라우저가 GPU로 그리는 방식](Frontend/UI-Design/webgl-shaders.md): OpenGL·WebGL·WebGPU의 관계, 정점·프래그먼트 셰이더와 래스터화, GLSL ES·WGSL, 무엇부터 배울까
- [웹 접근성: 표준 준수에서 실제 사용성까지](Frontend/UI-Design/web-accessibility.md): 장애의 사회적 정의, 접근성 트리, 대체 텍스트와 ARIA 사용 원칙, WCAG 2.2와 접근성 법, 장애인 참가자와 사용성 테스트, 바로 할 수 있는 다섯 가지
- [색과 움직임의 접근성](Frontend/UI-Design/color-motion-accessibility.md): 색각 결핍, 색만으로 정보 전달 금지, 대비 기준, prefers-color-scheme·prefers-reduced-motion, 5초 애니메이션 규칙
- [디자인 도구와 개발자 핸드오프](Frontend/UI-Design/design-tools-handoff.md): Figma 파일에서 개발자가 보는 것(변수·측정·애셋·프로토타입·댓글), 디자인 시스템을 도구에 담는 원칙, 도구 이전, 클릭되는 와이어프레임, 고해상도 대응
- [웹 레이아웃 디자인: 인쇄와 다른 매체](Frontend/UI-Design/web-layout-design.md): 인쇄와 웹의 매체 차이, 단락·문자 스타일과 CSS, 본질의 웹 디자인(그리드·컨테이너 쿼리), 이미지 위 텍스트 배치
- [전자상거래 UI 디자인](Frontend/UI-Design/ecommerce-ui.md): 구매 여정의 마찰 제거, 얕은 메뉴·필터·검색, 상품 페이지 첫 화면, 옵션별 선택 UI와 품절 표시, 재고 기반 가격 슬라이더
- [상세페이지 9단계 구조](Frontend/UI-Design/product-detail-page.md): 유입과 전환, 세일즈 퍼널, 판매 증거부터 상세 정보까지 고객의 의심을 푸는 순서, 표시·광고 규정과 접근성
- [제스처 기반 인터페이스](Frontend/UI-Design/gesture-interface.md): 대표 제스처, 콘텐츠 중심 화면, 시간·애니메이션 설계, 점진적 힌트, 시스템 제스처 충돌과 버튼 대안
