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

- [CSS 기초](/knowledge/dictionary/frontend/css/css-basics): 문법, 적용 방법 3가지, 크기·색상 단위, font-style, 속성 선언 순서, Safari 버튼 색
- [선택자와 우선순위](/knowledge/dictionary/frontend/css/selectors): 기본 선택자, 결합자, 가상 클래스·요소, 캐스케이딩과 특정성, 상속
- [박스 모델과 display](/knowledge/dictionary/frontend/css/box-model): margin·padding·border, margin collapse, box-sizing, display 값, 100% vs vh
- [position](/knowledge/dictionary/frontend/css/position): static·relative·absolute·fixed·sticky와 z-index
- [Float와 Flexbox](/knowledge/dictionary/frontend/css/flexbox): Normal Flow를 벗어나는 배치와 1차원 레이아웃 모델, `min-width: 0` 넘침 함정
- [transform](/knowledge/dictionary/frontend/css/transform): 이동·확대·회전·기울이기 함수와 translate(-50%, -50%) 가운데 정렬

## 참고

- [MDN Web Docs](https://developer.mozilla.org/ko/)
- [Chrome 개발자 도구로 CSS 보기](https://developer.chrome.com/docs/devtools/css): Styles 탭은 요소에 선언된 모든 CSS, Computed 탭은 최종 계산된 값을 보여 준다.
- [Emmet 치트시트](https://docs.emmet.io/cheat-sheet/): HTML·CSS 약어 확장 도구
