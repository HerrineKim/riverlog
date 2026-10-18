---
title: "Accessibility"
concept: "Web Accessibility"
summary: "장애가 있는 사람도 웹을 인지하고 조작하고 이해할 수 있게 만드는 일. 사용자 관점과 WCAG, 시맨틱 구조·대체 텍스트·폼·ARIA·키보드·위젯·CSS 기법, 자동·수동 평가와 스크린 리더 테스트를 다루는 노트 모음."
tags: ["frontend", "accessibility", "html", "aria"]
source: mixed
date: "2026-10-17"
---

웹 접근성 주제는 **누구나 같은 정보와 기능에 닿을 수 있게** 만드는 방법을 다룬다. 장애 유형별로 웹을 어떻게 쓰는지에서 출발해, WCAG라는 기준선, 마크업·스크립트·스타일 단계의 기법, 그리고 결과를 확인하는 평가 방법 순으로 읽으면 이어진다. 시맨틱 태그 자체는 [[semantic-html|Web]] 주제에, role과 접근 가능한 이름으로 테스트를 짜는 법은 [[a11y-driven-testing|Testing]] 주제에 있다.

## 노트

- [웹 접근성: 표준 준수에서 실제 사용성까지](Frontend/Accessibility/web-accessibility.md): 장애의 사회적 정의와 접근성이 사람·비즈니스·법에 주는 영향, 접근성 트리와 보조 기술의 역사, 장애인과 하는 사용성 테스트, 조직 차원의 접근성, 기법별 하위 노트로 가는 개요
- [장애 유형별 웹 사용](Frontend/Accessibility/disability-and-web-use.md): 시각·청각·운동·인지·발작과 전정 장애 사용자가 웹을 쓰는 방식, 쓰는 보조 기술, 각각이 부딪히는 장벽
- [WCAG와 POUR 원칙](Frontend/Accessibility/wcag-guidelines.md): 인지·운용·이해·견고 네 원칙, 성공 기준과 A·AA·AAA 수준, WCAG 2.2에서 바뀐 것, 체크리스트로 쓰는 법
- [디자인 단계의 접근성](Frontend/Accessibility/accessible-design-process.md): 포용적 디자인 원칙, 장애를 담은 페르소나, 접근성 휴리스틱 리뷰, 핸드오프 전 접근성 주석, 접근 가능한 컴포넌트·디자인 시스템 고르기
- [접근 가능한 페이지 구조](Frontend/Accessibility/accessible-page-structure.md): 페이지 제목, 문서 언어, 제목 계층, 랜드마크 영역, 목록, 건너뛰기 링크, iframe, 데이터 표
- [대체 텍스트, 링크, 쉬운 글](Frontend/Accessibility/accessible-images-links-text.md): 이미지 종류별 alt 쓰는 법, 링크 텍스트와 새 창, 명확하고 쉬운 글쓰기
- [자막, 대본, 음성 해설](Frontend/Accessibility/captions-and-transcripts.md): 동영상·오디오에 필요한 대체 수단, 자막 품질 기준, 실시간 자막
- [접근 가능한 폼과 오류 처리](Frontend/Accessibility/accessible-forms.md): label과 접근 가능한 이름, 그룹과 설명, 필수 항목, 인라인 검증과 오류 복구
- [ARIA와 접근 가능한 이름](Frontend/Accessibility/aria-basics.md): ARIA 다섯 규칙, role·state·property, 이름과 설명이 계산되는 순서, 라이브 영역
- [키보드 접근성과 포커스 관리](Frontend/Accessibility/keyboard-accessibility.md): 포커스 순서와 표시, tabindex, 키보드 트랩, 스크립트 이벤트와 동적 콘텐츠
- [접근 가능한 위젯: 펼침·탭·캐러셀](Frontend/Accessibility/accessible-widgets.md): 디스클로저와 아코디언, 탭 인터페이스, 자동 재생 캐러셀과 애니메이션 제어
- [복합 위젯의 ARIA 패턴: 콤보박스·날짜 선택기·메뉴·상태 알림](Frontend/Accessibility/aria-widget-patterns.md): 자동완성 콤보박스, 날짜 선택기와 날짜 직접 입력, 사이트 메뉴와 menubar, 수량 버튼, 정렬 표, 툴팁, 로딩·토스트·글자 수 같은 상태 알림
- [접근성을 위한 CSS와 타이포그래피](Frontend/Accessibility/accessible-css-typography.md): 스크린 리더 전용 텍스트, 리플로와 확대, 글꼴과 텍스트 간격, 스크린 리더 호환을 위한 설계
- [색과 움직임의 접근성](Frontend/Accessibility/color-motion-accessibility.md): 색각 결핍, 색만으로 정보 전달 금지, 대비 기준, prefers-color-scheme·prefers-reduced-motion, 5초 애니메이션 규칙
- [접근성 평가 방법과 도구](Frontend/Accessibility/accessibility-evaluation.md): 자동 검사의 한계, WAVE·DevTools로 하는 점검 순서, 수동 평가 체크포인트, 오버레이 제품을 쓰지 않는 이유
- [스크린 리더로 테스트하기](Frontend/Accessibility/screen-reader-testing.md): NVDA·JAWS·VoiceOver·TalkBack·Narrator의 기본 조작, 브라우저 조합, 테스트할 때 볼 것, 사용자 설문으로 본 실제 사용 방식

관련 주제: 시맨틱 HTML과 폼 사용성은 [Web](/knowledge/dictionary/frontend/web), 접근성 기반 테스트는 [Testing](/knowledge/dictionary/frontend/testing) 주제에 있다.
