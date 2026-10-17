---
title: "CSS"
concept: "CSS"
summary: "HTML 요소의 모양과 배치를 지정하는 스타일 언어."
tags: ["css", "layout", "frontend"]
source: til
date: "2026-10-13"
---

CSS(Cascading Style Sheets)는 HTML 요소를 **선택**해 **어떻게 보일지** 선언하는 언어다. CSS의 두 가지 기본 원칙만 기억하면 대부분의 레이아웃 문제를 설명할 수 있다.

1. 모든 요소는 네모(박스)이고, 위에서 아래로·왼쪽에서 오른쪽으로 쌓인다(Normal Flow).
2. `display`에 따라 크기와 배치 방식이 달라진다.

## 노트

- [CSS의 역사로 본 CSS가 어려워진 이유](/knowledge/dictionary/frontend/css/css-history): 전역 범위와 명시도, 시맨틱·Sass·BEM·CSS Modules·CSS-in-JS·유틸리티 CSS, @layer·@scope 같은 네이티브 해법
- [CSS 기초](/knowledge/dictionary/frontend/css/css-basics): 문법, 적용 방법 3가지, 크기·색상 단위, font-style, 속성 선언 순서, Safari 버튼 색
- [선택자와 우선순위](/knowledge/dictionary/frontend/css/selectors): 기본 선택자, 결합자, 가상 클래스·요소, :is()·:where()·:has(), @layer·특정성, 상속, 네이티브 중첩, 상속 키워드
- [박스 모델과 display](/knowledge/dictionary/frontend/css/box-model): margin·padding·border, margin collapse, box-sizing, display 값, 100% vs vh, 내재적 크기, 간격 도구
- [position](/knowledge/dictionary/frontend/css/position): static·relative·absolute·fixed·sticky, z-index와 쌓임 맥락, 앵커 위치 지정
- [Float와 Flexbox](/knowledge/dictionary/frontend/css/flexbox): Normal Flow를 벗어나는 배치와 `flow-root`, 1차원 레이아웃 모델과 속성 초깃값, `min-width: 0` 넘침 함정, 다단 레이아웃
- [반응형 디자인과 다국어 타이포그래피](/knowledge/dictionary/frontend/css/responsive-design): 뷰포트 메타 태그, 브레이크포인트, 모바일 퍼스트, 컨테이너 쿼리, clamp(), :lang()과 rem으로 언어별 글자 크기 조절, 컨테이너 쿼리 상세, 미디어 쿼리 없는 레이아웃, 유동 미디어, 반응형과 접근성
- [미디어 쿼리 문법과 미디어 기능](/knowledge/dictionary/frontend/css/media-features): 미디어 타입·and/or/not·범위 문법, 뷰포트·디스플레이·색·입력·사용자 설정·scripting 미디어 기능, pointer·hover 설계 원칙
- [노치와 폴더블 화면 대응: env()와 뷰포트 세그먼트](/knowledge/dictionary/frontend/css/safe-area-foldable): viewport-fit=cover와 safe-area-inset, 폴더블의 viewport-segments 미디어 기능과 env()
- [테마와 다크 모드 구현: theme-color, color-scheme, accent-color](/knowledge/dictionary/frontend/css/dark-mode-theming): 브라우저 UI·기본 컨트롤·강조색·아이콘·이미지까지 테마를 끝까지 적용하는 체크리스트, 사용자 선택 토글
- [transform](/knowledge/dictionary/frontend/css/transform): 이동·확대·회전·기울이기 함수와 translate(-50%, -50%) 가운데 정렬
- [CSS 애니메이션: transition과 @keyframes](/knowledge/dictionary/frontend/css/css-animation): transition과 animation의 차이와 속성, transform·opacity 원칙, 움직임 줄이기, Animate.css 등 라이브러리
- [CSS 그리드 레이아웃](/knowledge/dictionary/frontend/css/css-grid): 2차원 레이아웃의 용어와 속성, fr·minmax·auto-fill, 명시적·묵시적 그리드, 서브그리드, 실무 원칙
- [쓰기 모드와 논리적 속성](/knowledge/dictionary/frontend/css/logical-properties): 블록·인라인 축, inline-size·margin-block 같은 논리 속성, 그리드·플렉스박스가 start·end로 생각하는 이유
- [CSS 점진적 향상: 폴백과 피처 쿼리](/knowledge/dictionary/frontend/css/css-progressive-enhancement): 새 CSS를 옛 브라우저에 쓸 만하게 지원하는 법, 주요 기능의 Baseline 연도, @supports, 폴리필을 피하는 이유
- [CSS 커스텀 속성으로 색상 체계 짜기](/knowledge/dictionary/frontend/css/css-color-variables): 팔레트·기능 색상·컴포넌트 색상 3단계, oklch·color-mix, 테마와 다크 모드
- [Sass: 파일 구조, 믹스인과 @extend](/knowledge/dictionary/frontend/css/sass): 네이티브 CSS와의 역할 분담, 7-1 폴더 구조와 @use, 믹스인·@extend·플레이스홀더
- [객체 지향 CSS(OOCSS)](/knowledge/dictionary/frontend/css/oocss): 구조/겉모양·컨테이너/콘텐츠 분리, 미디어 객체, 특정도를 낮게 유지하는 규칙, 타이포그래피 전략과 흔한 오용, BEM·유틸리티 CSS로 이어진 흐름
- [웹 타이포그래피: 가독성, 글줄 길이, 웹폰트](/knowledge/dictionary/frontend/css/web-typography): 글줄 길이·글자 크기·줄 간격의 균형, font-size-adjust, 하이픈과 대비, @font-face와 WOFF2
- [CSS가 동작하는 방식](/knowledge/dictionary/frontend/css/how-css-works): 먼저 익힐 핵심 개념, 캐스케이드 비교 순서, 계산값, 레이아웃이 박스를 배치하는 방식
- [CSS 함수: calc()·clamp()와 수학 함수](/knowledge/dictionary/frontend/css/css-functions): var·attr·url, calc·min·max·clamp, 삼각·지수·반올림·부호 함수와 지원 범위
- [CSS 배경과 그라디언트](/knowledge/dictionary/frontend/css/css-backgrounds-gradients): background 속성과 여러 겹 배경, linear·radial·conic 그라디언트, in oklch 보간
- [CSS 테두리와 그림자](/knowledge/dictionary/frontend/css/css-borders-shadows): border-style·radius·border-image, box-shadow·text-shadow·drop-shadow 비교
- [CSS 시각 효과: 필터, 블렌드 모드, 클리핑, 마스킹](/knowledge/dictionary/frontend/css/css-visual-effects): filter·backdrop-filter, mix-blend-mode·isolation, clip-path 도형, mask, shape-outside
- [CSS 오버플로와 스크롤](/knowledge/dictionary/frontend/css/css-overflow-scroll): overflow 값과 말줄임, 스크롤 영역 접근성, 스크롤바·overscroll-behavior, 스크롤 스냅
- [팝오버와 앵커 위치 지정](/knowledge/dictionary/frontend/css/popover-anchor-positioning): popover auto·manual·hint, 등장 애니메이션, position-area·anchor()·position-try
- [View Transitions: 화면 전환 애니메이션](/knowledge/dictionary/frontend/css/view-transitions): startViewTransition, ::view-transition 가상 요소, view-transition-name, 전환 유형
- [CSS 목록과 카운터](/knowledge/dictionary/frontend/css/css-lists-counters): list-style, ::marker, @counter-style, counter-reset·counters()
- [커서와 포인터 입력](/knowledge/dictionary/frontend/css/css-cursor-pointer): cursor·caret-color, pointer·hover 미디어 쿼리, touch-action, pointer-events, 포커스 표시

## 참고

- [MDN Web Docs](https://developer.mozilla.org/ko/)
- [[devtools-elements-css|DevTools로 DOM과 CSS 다루기]]: Styles 탭은 요소에 선언된 모든 CSS, Computed 탭은 최종 계산된 값을 보여 준다.
- [Emmet 치트시트](https://docs.emmet.io/cheat-sheet/): HTML·CSS 약어 확장 도구
