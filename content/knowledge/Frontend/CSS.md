---
title: "CSS"
concept: "CSS"
summary: "HTML 요소의 모양과 배치를 지정하는 스타일 언어."
tags: ["css", "layout", "frontend"]
source: til
---

CSS(Cascading Style Sheets)는 HTML 요소를 **선택**해 **어떻게 보일지** 선언하는 언어다. CSS의 두 가지 기본 원칙만 기억하면 대부분의 레이아웃 문제를 설명할 수 있다.

1. 모든 요소는 네모(박스)이고, 위에서 아래로·왼쪽에서 오른쪽으로 쌓인다(Normal Flow).
2. `display`에 따라 크기와 배치 방식이 달라진다.

## 노트

- [CSS의 역사로 본 CSS가 어려워진 이유](/knowledge/dictionary/frontend/css/css-history): 전역 범위와 명시도, 시맨틱·Sass·BEM·CSS Modules·CSS-in-JS·유틸리티 CSS, @layer·@scope 같은 네이티브 해법
- [CSS 기초](/knowledge/dictionary/frontend/css/css-basics): 문법, 적용 방법 3가지, 크기·색상 단위, font-style, 속성 선언 순서, Safari 버튼 색
- [선택자와 우선순위](/knowledge/dictionary/frontend/css/selectors): 기본 선택자, 결합자, 가상 클래스·요소, 캐스케이딩과 특정성, 상속
- [박스 모델과 display](/knowledge/dictionary/frontend/css/box-model): margin·padding·border, margin collapse, box-sizing, display 값, 100% vs vh
- [position](/knowledge/dictionary/frontend/css/position): static·relative·absolute·fixed·sticky와 z-index
- [Float와 Flexbox](/knowledge/dictionary/frontend/css/flexbox): Normal Flow를 벗어나는 배치와 1차원 레이아웃 모델, `min-width: 0` 넘침 함정
- [반응형 디자인과 다국어 타이포그래피](/knowledge/dictionary/frontend/css/responsive-design): 뷰포트 메타 태그, 브레이크포인트, 모바일 퍼스트, 기기 픽셀 비율, clamp(), :lang()과 rem으로 언어별 글자 크기 조절
- [transform](/knowledge/dictionary/frontend/css/transform): 이동·확대·회전·기울이기 함수와 translate(-50%, -50%) 가운데 정렬
- [CSS 그리드 레이아웃](/knowledge/dictionary/frontend/css/css-grid): 2차원 레이아웃의 용어와 속성, fr·minmax·auto-fill, 명시적·묵시적 그리드, 서브그리드, 실무 원칙
- [쓰기 모드와 논리적 속성](/knowledge/dictionary/frontend/css/logical-properties): 블록·인라인 축, inline-size·margin-block 같은 논리 속성, 그리드·플렉스박스가 start·end로 생각하는 이유
- [CSS 점진적 향상: 폴백과 피처 쿼리](/knowledge/dictionary/frontend/css/css-progressive-enhancement): 새 CSS를 옛 브라우저에 쓸 만하게 지원하는 법, @supports, 폴리필을 피하는 이유
- [CSS 커스텀 속성으로 색상 체계 짜기](/knowledge/dictionary/frontend/css/css-color-variables): 팔레트·기능 색상·컴포넌트 색상 3단계, oklch·color-mix, 테마와 다크 모드
- [Sass: 파일 구조, 믹스인과 @extend](/knowledge/dictionary/frontend/css/sass): 네이티브 CSS와의 역할 분담, 7-1 폴더 구조와 @use, 믹스인·@extend·플레이스홀더
- [객체 지향 CSS(OOCSS)](/knowledge/dictionary/frontend/css/oocss): 구조/겉모양·컨테이너/콘텐츠 분리, 미디어 객체, 특정도를 낮게 유지하는 규칙, BEM·유틸리티 CSS로 이어진 흐름

## 참고

- [MDN Web Docs](https://developer.mozilla.org/ko/)
- [Chrome 개발자 도구로 CSS 보기](https://developer.chrome.com/docs/devtools/css): Styles 탭은 요소에 선언된 모든 CSS, Computed 탭은 최종 계산된 값을 보여 준다.
- [Emmet 치트시트](https://docs.emmet.io/cheat-sheet/): HTML·CSS 약어 확장 도구
