---
title: "객체 지향 CSS(OOCSS)"
concept: "OOCSS"
summary: "구조와 겉모양을 분리하고, 컨테이너와 콘텐츠를 분리해 재사용 가능한 클래스 '객체'로 CSS를 짜는 방법론. 미디어 객체 같은 대표 패턴, 특정도 전쟁을 피하는 규칙, 시맨틱 클래스와의 긴장, BEM·유틸리티 CSS로 이어진 흐름까지."
tags: ["css", "architecture", "design-pattern", "frontend"]
source: other
date: "2026-10-13"
sources: ["https://webactually.com/2019/10/08/%ea%b0%9d%ec%b2%b4-%ec%a7%80%ed%96%a5-css-%ec%86%8c%ea%b0%9c/"]
---

> Louis Lazaris의 「[객체 지향 CSS 소개](https://webactually.com/2019/10/08/%ea%b0%9d%ec%b2%b4-%ec%a7%80%ed%96%a5-css-%ec%86%8c%ea%b0%9c/)」(An Introduction To Object Oriented CSS, 2019.10, 웹액츄얼리 번역)를 바탕으로 재구성한 노트입니다.

## OOCSS란

객체 지향 CSS(Object Oriented CSS, OOCSS)는 Nicole Sullivan이 2008년 무렵 제안한 CSS 작성 방법론이다. 페이지에서 반복되는 시각 패턴을 찾아 **클래스 하나로 표현되는 재사용 단위("객체")**로 만든다. 목표는 두 가지다.

- **작고 빠른 스타일시트**: 중복이 줄어 파일이 작아진다. 이미 있는 객체를 조합하면 새 CSS를 한 줄도 쓰지 않고 새 화면을 만들 수 있다.
- **유지보수하기 쉬운 스타일시트**: 덮어쓰기 위해 선택자를 계속 길게 만드는 특정도 전쟁(specificity war) 대신, 낮고 고른 특정도의 모듈이 캐스케이드를 따라 자연스럽게 겹친다.

## 두 가지 원칙

### 1. 구조와 겉모양을 분리한다

| 구분 | 무엇 | 예 |
| --- | --- | --- |
| 구조(structure) | 보이지 않는 골격 | 너비, 가운데 정렬, 위치 맥락, 안쪽 여백, float 해제 |
| 겉모양(skin) | 브랜드를 드러내는 시각 요소 | 색, 그러데이션, 테두리, 그림자 |

ID 선택자마다 같은 테두리·그림자를 반복해 쓰는 대신, 공통 겉모양을 `.skin` 같은 클래스로 뽑아 여러 요소에 붙인다. 골격도 마찬가지다. 헤더·본문·푸터 안쪽 영역이 모두 "고정 너비 + 가운데 정렬 + 좌우 패딩"이라면 그것을 `.globalwidth` 같은 구조 클래스 하나로 만든다.

```html
<div class="header-inside globalwidth">…</div>
<div class="main globalwidth">…</div>
<div class="footer-inside globalwidth">…</div>
```

### 2. 컨테이너와 콘텐츠를 분리한다

```css
/* 나쁨: 사이드바 안의 h3에서만 쓸 수 있다 */
#sidebar h3 { font-size: 1.5rem; color: #333; text-shadow: …; }

/* 좋음: 어디에 있든 같은 모양 */
.heading-section { font-size: 1.5rem; color: #333; }
.heading-section--shadow { text-shadow: …; }
```

자손 선택자로 쓴 스타일은 **그 컨테이너에 묶인다**. 같은 제목을 푸터에서 쓰려면 규칙을 복사하거나 선택자를 더 늘려야 한다. 클래스로 만든 객체는 문서 구조와 상관없이 어디서나 쓴다.

## 대표 패턴: 미디어 객체

미디어 객체(media object)는 **왼쪽에 이미지(미디어), 오른쪽에 텍스트**가 오는 블록이다. 댓글, 프로필, 알림, 상품 목록 등 웹 곳곳에 같은 뼈대가 반복된다. 이미지 크기와 텍스트 스타일은 바뀌어도 "미디어 옆에 본문이 흐른다"는 구조는 같으므로, 그 구조만 객체로 만들면 많은 코드를 줄인다.

```css
.media { display: flex; align-items: flex-start; gap: 1rem; }
.media__body { flex: 1; min-width: 0; }
```

## 실천 규칙

| 규칙 | 이유 |
| --- | --- |
| 자손 선택자를 피한다 (`.sidebar h3` ✗) | 스타일이 위치에 묶인다 |
| ID로 스타일을 주지 않는다 | 특정도가 너무 높아 덮어쓰기 어렵다. ID는 JS 훅과 앵커에만 쓴다 |
| 요소에 클래스를 붙인 선택자를 피한다 (`div.header` ✗) | 다른 요소에서 재사용할 수 없고 특정도만 오른다 |
| `!important`는 정말 드물게만 | 특정도 전쟁의 마지막 무기라 이후 모든 덮어쓰기가 힘들어진다 |
| 린터로 검사한다 | 과거에는 CSS Lint, 지금은 stylelint로 규칙을 자동 검사한다 |

특정도가 어떻게 계산되는지는 [[selectors|CSS 선택자와 우선순위]]에 있다. 지금은 `@layer`(캐스케이드 레이어)와 `:where()`(특정도 0)로 특정도를 의도적으로 낮게 관리할 수도 있다.

## 시맨틱 클래스와의 긴장

OOCSS는 HTML에 `globalwidth`, `skin` 같은 **겉모양을 설명하는 클래스**를 늘린다. "마크업과 표현을 분리하라"는 원칙과 충돌한다는 비판을 받는다.

| 관점 | 근거 |
| --- | --- |
| 겉모양 클래스를 HTML에 드러낸다 (OOCSS, 이후 유틸리티 CSS) | CSS가 작아지고, 공통 스타일을 한곳에서 추적·수정한다. 재사용이 쉽다 |
| HTML에는 의미만, 스타일 조합은 CSS 쪽에서 (시맨틱 클래스 + Sass `@extend`) | HTML이 콘텐츠를 설명한다. 프레임워크를 바꿔도 HTML을 고치지 않는다 |

후자의 구체적인 방법은 [[sass|Sass: 파일 구조, 믹스인과 @extend]]의 "@extend로 프레임워크 클래스를 숨기기"에 있다.

## 이어진 흐름

OOCSS의 "재사용 가능한 클래스 객체" 발상은 이후 방법론과 도구의 뿌리가 됐다.

```text
OOCSS (구조/겉모양 분리, 컨테이너/콘텐츠 분리)
 ├─ SMACSS   규칙을 base·layout·module·state·theme 범주로 나눔
 ├─ BEM      block__element--modifier 이름 규칙으로 객체 경계를 명시
 ├─ 유틸리티 CSS (Atomic CSS, Tailwind)  겉모양 분리를 속성 하나 단위까지 밀어붙임
 └─ 컴포넌트 스코프 (CSS Modules, CSS-in-JS)  이름 충돌을 도구가 막음
```

컴포넌트 단위로 스타일을 묶는 방식은 [[styling|React 스타일링: CSS Modules와 styled-components]], 컴포넌트를 크기별로 나누는 사고는 [[atomic-design|Atomic Design과 컴포넌트 폴더 구조]]와 이어진다.

## 한계

- 작은 사이트나 앱에는 과하다. 반복되는 패턴이 적으면 객체를 뽑아도 얻는 것이 적다.
- HTML의 클래스 목록이 길어지고, 어떤 클래스 조합이 맞는지 알아야 한다. 문서화된 패턴 라이브러리가 없으면 조합이 제각각이 된다.
- HTML 용량은 늘어난다. 대개 CSS 감소분이 더 크지만 항상 그렇지는 않다.

## 정리

- 반복되는 시각 패턴을 찾아 클래스 객체로 만든다.
- 구조와 겉모양을 나누고, 스타일이 컨테이너 위치에 묶이지 않게 한다.
- ID 선택자, 자손 선택자, 요소+클래스 선택자, `!important`를 피해 특정도를 낮고 고르게 유지한다.
- 규모가 클수록 이득이 크다. 작은 프로젝트에도 관점만큼은 유용하다.

관련 노트: [[selectors|CSS 선택자와 우선순위]], [[sass|Sass: 파일 구조, 믹스인과 @extend]], [[atomic-design|Atomic Design과 컴포넌트 폴더 구조]], [[styling|React 스타일링: CSS Modules와 styled-components]], [[css-history|CSS의 역사로 본 CSS가 어려워진 이유]]
