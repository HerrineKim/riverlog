---
title: "UI Design"
concept: "UI Design"
summary: "디자인 시스템 배포, 움직이는 아이콘, Three.js 3D처럼 화면의 생김새와 표현 기법을 다루는 노트 모음."
tags: ["frontend", "ui", "design-system", "graphics"]
source: mixed
---

UI 디자인 주제는 **화면이 어떻게 보이고 움직이는가**를 다룬다. 색·간격·타이포그래피를 토큰으로 묶어 여러 프로젝트에 같은 모양을 배포하는 디자인 시스템, 영상을 투명 배경 애니메이션 아이콘으로 바꾸는 제작 흐름, WebGL을 감싼 Three.js로 웹에 3D를 그리는 방법까지가 여기 속한다. AI로 디자인을 뽑는 프롬프트 기법은 [[ai-frontend-design-prompting|AI & Data]] 분야에 있다.

## 노트

- [디자인 시스템을 패키지로 배포하기](Frontend/UI-Design/design-system.md): 디자인 토큰과 UI 컴포넌트를 중앙 모노레포에서 패키지로 만들어 여러 프로젝트에 배포하고 Storybook으로 문서화하는 구조
- [Animated Icon — 영상을 투명 배경 아이콘으로 쓰기](Frontend/UI-Design/animated-icon.md): 3D 아이콘 영상을 알파 채널 애니메이션 포맷으로 바꿔 앱·웹에서 쓰는 흐름과 포맷별 선택지
- [Three.js로 웹에서 3D 그리기](Frontend/UI-Design/threejs.md): WebGL을 쉽게 쓰게 감싼 라이브러리의 구성 요소(Scene·Camera·Mesh·Renderer), 활용 사례, 장단점
- [웹 접근성: 표준 준수에서 실제 사용성까지](Frontend/UI-Design/web-accessibility.md): 장애의 사회적 정의, 접근성 트리, WCAG 2.2와 접근성 법, 장애인 참가자와 사용성 테스트, 바로 할 수 있는 다섯 가지
- [색과 움직임의 접근성](Frontend/UI-Design/color-motion-accessibility.md): 색각 결핍, 색만으로 정보 전달 금지, 대비 기준, prefers-color-scheme·prefers-reduced-motion, 5초 애니메이션 규칙
- [디자인 도구와 개발자 핸드오프](Frontend/UI-Design/design-tools-handoff.md): Figma 파일에서 개발자가 보는 것(변수·측정·애셋·프로토타입·댓글), 디자인 시스템을 도구에 담는 원칙, 도구 이전, 클릭되는 와이어프레임, 고해상도 대응
