---
title: "UI Design"
concept: "UI Design"
summary: "디자인 시스템과 핸드오프, 레이아웃, 전자상거래·제스처 UI 패턴, UX 라이팅까지 화면의 생김새와 쓰임새를 다루는 노트 모음."
tags: ["frontend", "ui", "design-system", "accessibility"]
source: mixed
date: "2026-10-15"
---

UI 디자인 주제는 **화면이 어떻게 보이고 쓰이는가**를 다룬다. 색·간격·타이포그래피를 토큰으로 묶어 여러 프로젝트에 같은 모양을 배포하는 디자인 시스템이 여기 속한다. 인쇄와 다른 웹 레이아웃, 전자상거래와 제스처 같은 UI 패턴, 디자이너와 개발자가 Figma로 주고받는 핸드오프도 함께 다룬다. 누구나 쓸 수 있게 만드는 웹 접근성은 [Accessibility](/knowledge/dictionary/frontend/accessibility) 주제에 있다. 사용자 리서치, 페르소나·시나리오, 휴리스틱 평가·사용성 테스트와 상세페이지 구성은 [[user-research|Career]] 분야의 Product 주제에 있다. AI로 디자인을 뽑는 프롬프트 기법은 [[ai-frontend-design-prompting|AI & Data]] 분야에, 움직이는 아이콘과 WebGL·Three.js 3D는 [Graphics](/knowledge/dictionary/frontend/graphics) 주제에 있다.

## 노트

- [디자인 시스템: 구성, 도입, 구축과 배포](Frontend/UI-Design/design-system.md): 구성 요소, 작은 팀도 필요한 이유와 도입 시점, 감사부터 QA까지 구축 절차와 이름 규칙, 토큰·컴포넌트를 모노레포 패키지로 배포하고 Storybook으로 문서화하는 구조
- [제품 언어로서의 디자인 시스템: 토큰, 기능과 형태, 컴포넌트 API](Frontend/UI-Design/product-language-design-system.md): 범용 시스템과 제품 언어, 값·의도·맥락으로 인코딩하는 토큰과 섣부른 시맨틱 토큰, 기능·형태 해부와 상태 압축, 디자인-개발 순환 참조 끊기, 사전 조합 + 조합 가능한 패키지
- [UI 요소 용어집: 입력·내비게이션·정보·컨테이너](Frontend/UI-Design/ui-elements-glossary.md): UI 요소 32가지를 네 범주로, 각각의 쓰임과 기댈 HTML 요소·ARIA 패턴, 햄버거·케밥·미트볼·벤토·도너 메뉴 구분, 헷갈리는 짝
- [디자인 도구와 개발자 핸드오프](Frontend/UI-Design/design-tools-handoff.md): Figma 파일에서 개발자가 보는 것(변수·측정·애셋·프로토타입·댓글), Auto Layout을 Flexbox로 옮기기, 디자인 시스템을 도구에 담는 원칙, 도구 이전, 실제 데이터로 디자인하기, 고해상도 대응
- [웹 레이아웃 디자인: 인쇄와 다른 매체](Frontend/UI-Design/web-layout-design.md): 인쇄와 웹의 매체 차이, 단락·문자 스타일과 CSS, 본질의 웹 디자인(그리드·컨테이너 쿼리), 이미지 위 텍스트 배치, 고정폭→반응형의 흐름, 매크로·마이크로 레이아웃
- [레이아웃 그리드와 간격 체계: 12단 그리드, 8pt 그리드, 수직 리듬](Frontend/UI-Design/layout-grid-spacing.md): 칼럼 그리드 구성, 8pt·4pt 기준, 수직 리듬과 모듈러 스케일, CSS Grid·rlh·text-box-trim·토큰 구현
- [UI 밀도: 시각·정보·디자인·시간·가치](Frontend/UI-Design/ui-density.md): 시각 밀도의 함정, 데이터-잉크 비율, 게슈탈트로 센 디자인 밀도, 대기 시간 구간별 로딩 표시, 가치 밀도와 긴 폼 나누기
- [개발자를 위한 시각 디자인 요령: 위계, 대비, 그림자, 구분선](Frontend/UI-Design/visual-design-tips.md): 색과 굵기로 위계, 배경색 계열 글자, 세로 오프셋 그림자, 테두리 대신 여백, 중요도로 버튼 스타일
- [로딩 UI: 스피너, 로딩 애니메이션, 스켈레톤, 프로그레스 바](Frontend/UI-Design/loading-ui.md): 네 가지 유형과 앱 예시, 스켈레톤 종류, 대기 시간별 선택, aria-busy·progressbar·움직임 줄이기
- [UI 모션 디자인: 애니메이션 원칙, 모션 커브, 안무](Frontend/UI-Design/ui-motion-principles.md): 애니메이션 12원칙의 웹 적용, cubic-bezier 읽기, 겹친 애니메이션과 offset-path, 시차 안무, 60fps 규칙
- [SVG 아이콘: 형식, 넣는 방법, 이름 붙이기, 스타일](Frontend/UI-Design/svg-icons.md): PNG 대신 SVG, img·배경·인라인 비교, symbol/use, 장식·단독 아이콘의 접근 가능한 이름, currentColor
- [나쁜 아이콘과 좋은 아이콘: 아이콘 사용성](Frontend/UI-Design/icon-usability.md): 나쁜 아이콘 다섯 유형, 아이콘의 비용과 이점, 좋은 아이콘의 조건, 여력이 없으면 텍스트 링크
- [인터페이스 심리학: 지각·인지·감정·사회적 반응](Frontend/UI-Design/interface-psychology.md): 밝기와 색상 인코딩, 청킹, 어포던스, 재인과 회상, 초보자·숙련자 경로, 감성 컴퓨팅, 시선과 자기 노출, 불쾌한 골짜기, 설계의 윤리
- [반응형 UI 패턴: 내비게이션, 캐러셀, 데이터 표](Frontend/UI-Design/responsive-ui-patterns.md): 숨기기 전에 다듬기 → 오버플로 패턴 → 점진적 공개, 캐러셀↔그리드 혼합형, 넘치는 표, 입력 장치를 가정하지 않기
- [전자상거래 UI 디자인](Frontend/UI-Design/ecommerce-ui.md): 구매 여정의 마찰 제거, 얕은 메뉴·필터·검색, 상품 페이지 첫 화면, 옵션별 선택 UI와 품절 표시, 재고 기반 가격 슬라이더
- [제스처 기반 인터페이스](Frontend/UI-Design/gesture-interface.md): 대표 제스처, 콘텐츠 중심 화면, 시간·애니메이션 설계, 점진적 힌트, 시스템 제스처 충돌과 버튼 대안
- [모바일 앱 UI 가이드라인: 한 손 조작, 내비게이션, 버튼, 입력](Frontend/UI-Design/mobile-app-ui-guidelines.md): 보는 영역과 조작 영역, 얕은 내비게이션, 버튼 위계와 레이블, 입력 피드백, 터치 크기
- [UX 라이팅: 원칙, 가이드라인, 체크리스트](Frontend/UI-Design/ux-writing.md): 원칙→가이드라인→체크리스트 문서 구조, 화면 문구를 검토하는 8가지 기준, 다크 패턴과 보이스 톤
- [디자이너는 어떻게 코드를 배우나](Frontend/UI-Design/designers-learning-code.md): 코드를 배우는 목적은 디자인 재료 이해, 터미널·Git·시맨틱 HTML·CSS 기초, 토큰·컴포넌트 같은 공학 개념
- [와이어프레임, 목업, 프로토타입: 충실도에 따른 화면 설계 산출물](Frontend/UI-Design/wireframe-mockup-prototype.md): IA에서 프로토타입까지, 와이어프레임 충실도, 프로토타입 유형과 충실도 고르기, 클릭되는 와이어프레임과 도구 기준
