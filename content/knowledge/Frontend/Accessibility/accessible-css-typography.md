---
title: "접근성을 위한 CSS와 타이포그래피"
concept: "Accessible CSS"
summary: "CSS는 표현만 맡고 의미는 HTML이 진다. 소스 순서와 화면 순서를 맞추고, 숨김은 모두에게 숨길지(display:none·hidden) 화면에서만 숨길지(visually-hidden) 구분한다. 400% 확대에서도 가로 스크롤 없이 읽히게(1.4.10 Reflow), 사용자가 줄·글자 간격을 넓혀도 깨지지 않게(1.4.12 Text Spacing) 만들고, 글꼴·정렬·글줄 길이로 읽기 부담을 줄인다."
tags: ["accessibility", "frontend", "css", "typography", "responsive"]
source: other
date: "2026-10-17"
sources: ["https://webaim.org/techniques/css/", "https://webaim.org/techniques/css/invisiblecontent/", "https://webaim.org/techniques/reflow/", "https://webaim.org/techniques/fonts/", "https://webaim.org/techniques/textlayout/", "https://webaim.org/techniques/screenreader/", "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html", "https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html", "https://developer.mozilla.org/en-US/docs/Web/CSS/clip", "https://web.dev/learn/accessibility/typography"]
---

> WebAIM의 「[Accessible CSS](https://webaim.org/techniques/css/)」, 「[Invisible Content Just for Screen Reader Users](https://webaim.org/techniques/css/invisiblecontent/)」, 「[Responsive Design and Reflow](https://webaim.org/techniques/reflow/)」, 「[Typefaces and Fonts](https://webaim.org/techniques/fonts/)」, 「[Text/Typographical Layout](https://webaim.org/techniques/textlayout/)」, 「[Designing for Screen Reader Compatibility](https://webaim.org/techniques/screenreader/)」을 바탕으로, WCAG 2.2 기준과 숨김 패턴은 W3C·MDN 문서로 확인해 재구성하고, 글꼴 고르기와 글줄 폭은 web.dev 「[Learn Accessibility](https://web.dev/learn/accessibility)」의 타이포그래피 편으로 보강한 노트다.

## CSS와 접근성의 관계

CSS는 보이는 모습을 정한다. 대부분의 CSS는 스크린 리더가 읽는 내용에 영향을 주지 않지만, **몇 가지는 직접 바꾼다.**

| CSS | 스크린 리더에 미치는 영향 |
| --- | --- |
| `display: none`, `visibility: hidden` | 접근성 트리에서 빠져 읽히지 않는다 |
| `::before`, `::after`의 `content` | **읽힌다.** 장식 기호를 넣으면 그대로 소리 난다 |
| `display: grid`·`flex`의 `order`, 그리드 배치 | 화면 순서만 바꾸고 읽는 순서·Tab 순서는 소스 순서대로다 |
| `display: contents`, 목록의 `list-style: none` | 브라우저에 따라 요소의 의미(버튼·목록)가 빠질 수 있다. 바꾼 뒤 접근성 트리를 확인한다 |

또 하나의 전제가 있다. **사용자는 작성자의 CSS를 덮어쓴다.** 저시력 사용자는 글자를 키우고 고대비 색을 쓰고, 난독증 사용자는 글꼴과 간격을 바꾸고, 인지 장애 사용자는 단순한 레이아웃을 쓴다. 브라우저의 강제 색상 모드(`forced-colors`)도 작성자 색을 무시한다. 그래서 페이지는 **사용자의 스타일 변경을 견디도록** 만들어야 한다.

## 의미는 HTML에, 표현은 CSS에

CSS를 끄거나 사용자 스타일로 바꿔도 내용과 의미가 남아야 한다(성공 기준 1.3.1 Info and Relationships). CSS로만 만든 의미는 보조 기술에 전달되지 않는다.

| CSS로 흉내 낸 것 | 문제 | 바로잡기 |
| --- | --- | --- |
| 굵고 큰 `<p>`로 만든 가짜 제목 | 제목 탐색에 안 잡힌다 | `<h2>`를 쓰고 모양은 CSS로 |
| `font-weight: bold`인 `<span>` | 강조로 전달되지 않는다 | `<strong>`, `<em>` |
| 정보를 담은 CSS 배경 이미지 | 대체 텍스트를 줄 방법이 없다 | `<img alt="…">` |
| 색만으로 상태 구분 | 색을 못 보거나 덮어쓰면 사라진다 | 텍스트·아이콘 함께([[color-motion-accessibility\|색과 움직임의 접근성]]) |
| `text-decoration: line-through`로 만든 취소선 | 시각 표현일 뿐 전달되지 않는다 | `<del>`·`<s>`. 이것도 읽지 않는 스크린 리더가 많으므로 필요하면 숨긴 텍스트로 "삭제됨"을 덧붙인다 |

시맨틱 태그 선택은 [[semantic-html|시맨틱 HTML과 문서 구조]]에 있다.

### 소스 순서 = 화면 순서

스크린 리더는 내용을 **한 줄로 늘어놓아(linearization)** 처음부터 순서대로 읽는다. 화면을 보는 사람처럼 레이아웃 전체를 한눈에 훑을 수 없다. 그래서 소스 순서가 곧 듣는 순서이고 Tab 순서다(성공 기준 1.3.2 Meaningful Sequence, 2.4.3 Focus Order).

```css
/* 피한다: 화면에서는 사이드바가 먼저, 읽기와 Tab은 main이 먼저 */
.layout aside { order: -1; }

/* 소스 순서대로 배치한다 */
.layout { display: grid; grid-template-columns: 2fr 1fr; }
```

CSS의 `reading-flow` 속성은 그리드·플렉스의 시각 순서를 읽기·포커스 순서에 반영하려는 새 기능이다. 지원 브라우저가 제한적이므로, 지금은 **소스 순서를 바로 쓰는 것**이 기본이다.

## 숨기기: 누구에게서 숨기나

숨김 방법을 고르는 기준은 하나다. **화면을 보는 사람과 스크린 리더 사용자 모두에게 원하는 결과가 나오는가.**

| 의도 | 방법 | 비고 |
| --- | --- | --- |
| 모두에게 숨긴다 | `display: none`, `visibility: hidden`, `hidden` 속성 | 닫힌 메뉴, 비활성 탭 패널. 접근성 트리에서도 빠진다 |
| 화면에서만 숨기고 읽게 한다 | visually-hidden 클래스 | 아이콘 버튼 이름, 숨긴 label, "현재 위치:" 같은 짧은 맥락 |
| 읽지 않게만 한다 | `aria-hidden="true"` | 장식 아이콘. 포커스 가능한 요소에는 쓰지 않는다 |
| 쓰지 않는다 | `width: 0; height: 0`, `font-size: 0`, `line-height: 0` | 스크린 리더도 무시할 수 있고, 검색 엔진이 숨긴 텍스트 스팸으로 볼 수 있다 |
| 쓰지 않는다 | `text-indent: -10000px` | 읽히긴 하지만 포커스 가능한 요소에 쓰면 보이지 않는 곳에 포커스가 간다. RTL 문서에서도 깨진다 |

### visually-hidden 패턴

오래된 패턴은 `left: -10000px`로 화면 밖에 밀어냈다. 지금은 제자리에서 1px로 잘라 내는 방식이 표준이다. 위치를 옮기지 않으니 RTL 문서와 스크롤 위치 문제가 없다. `clip`은 폐기된 속성이라 `clip-path`를 쓴다.

```css
.visually-hidden:not(:focus):not(:active) {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap; /* 단어마다 줄바꿈되어 붙어 읽히는 문제를 막는다 */
}
```

`:not(:focus):not(:active)`를 붙이면 포커스를 받는 순간 보인다. Bootstrap의 `.visually-hidden`과 Tailwind의 `sr-only`가 이 계열이다.

```html
<button>
  <svg aria-hidden="true" focusable="false">…</svg>
  <span class="visually-hidden">검색</span>
</button>

<nav aria-label="이동 경로">
  <span class="visually-hidden">현재 위치:</span> 홈 › 문서
</nav>
```

- **아껴 쓴다.** 내용은 원래 두 사용자에게 같아야 한다. 숨긴 텍스트는 시각적으로만 전달되는 의미를 보충할 때만 쓴다.
- 링크·버튼처럼 **포커스 가능한 요소를 visually-hidden으로 숨기지 않는다.** 보이지 않는 곳에 포커스가 간다. 예외는 포커스 때 나타나는 경우다.
- 건너뛰기 링크(skip link)가 그 예외다. 평소에는 숨기고 포커스를 받으면 보이게 한다. 갑자기 나타나면 당황할 수 있으므로 전환 효과를 주기도 한다. 건너뛰기 링크의 역할은 [[accessible-page-structure|접근 가능한 페이지 구조]]에 있다.

```css
.skip-link { position: absolute; transform: translateY(-120%); }
.skip-link:focus { transform: translateY(0); }
```

## 확대와 리플로: 1.4.10 Reflow

저시력 사용자는 화면을 크게 확대한다. 난독증 같은 학습 장애가 있는 사람도 확대로 읽기 부담을 줄인다. 확대하면 CSS 뷰포트가 좁아지는데, 이때 레이아웃이 좁은 화면에 맞게 다시 배치되는 것이 **리플로(reflow)**다. 리플로가 안 되면 한 줄을 읽을 때마다 가로로 스크롤해야 한다. 이는 매우 읽기 힘들다.

| 기준 | 내용 |
| --- | --- |
| 1.4.4 Resize Text (AA) | 보조 기술 없이 글자를 200%까지 키워도 내용·기능이 사라지지 않는다 |
| **1.4.10 Reflow (AA)** | 세로로 스크롤하는 콘텐츠는 **폭 320 CSS px**, 가로로 스크롤하는 콘텐츠는 **높이 256 CSS px**에서 두 방향 스크롤 없이 정보와 기능을 잃지 않고 보여야 한다 |

320 CSS px는 1280px 폭 화면을 400% 확대한 크기와 같다.

**예외**: 2차원 배치가 의미의 일부인 콘텐츠다. 지도, 다이어그램, 동영상, 게임, 프레젠테이션, 데이터 표, 콘텐츠를 다루는 동안 툴바가 보여야 하는 인터페이스. 예외라도 **그 부분만** 가로로 스크롤되고 페이지 전체는 리플로돼야 한다.

```css
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr)); gap: 1rem; }
.table-wrap { overflow-x: auto; }       /* 표만 가로 스크롤 */
img, video { max-width: 100%; height: auto; }
pre { white-space: pre-wrap; }          /* 코드 블록이 페이지를 넓히지 않게 */
```

- 브레이크포인트는 `em`·`rem`으로 잡으면 글자 확대에도 반응한다. 브레이크포인트와 상대 단위는 [[responsive-design|반응형 디자인과 다국어 타이포그래피]]에 있다.
- 뷰포트 메타에 `user-scalable=no`나 `maximum-scale=1`을 넣어 확대를 막지 않는다.
- 고정 헤더·쿠키 배너는 확대하면 화면 대부분을 덮는다. 좁은 뷰포트에서는 고정을 풀거나 접는다.

**테스트**: 브라우저 창을 1280px 폭으로 맞추고 `Ctrl`/`Cmd` + `+`로 400%까지 키운다. 단계마다 내용과 기능이 그대로인지, 가로 스크롤이 생기지 않는지, 겹치는 요소가 없는지, 대화 상자·아코디언·툴팁·메뉴가 여전히 쓰이는지 본다. DevTools 기기 모드에서 폭 320px로 봐도 된다.

## 텍스트 간격: 1.4.12 Text Spacing

**1.4.12 Text Spacing (AA)**은 사용자가 아래 값까지 간격을 넓혀도 내용이나 기능이 사라지지 않을 것을 요구한다. 작성자가 이 값을 써야 한다는 뜻이 아니라, **사용자가 이렇게 바꿔도 견뎌야 한다**는 뜻이다.

| 속성 | 사용자가 넓힐 수 있는 값 |
| --- | --- |
| 줄 높이 `line-height` | 글자 크기의 1.5배 |
| 문단 뒤 간격 | 글자 크기의 2배 |
| 자간 `letter-spacing` | 글자 크기의 0.12배 |
| 단어 간격 `word-spacing` | 글자 크기의 0.16배 |

```css
/* 이 스타일을 북마클릿·확장 프로그램으로 주입해 테스트한다 */
* {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
p { margin-bottom: 2em !important; }
```

간격을 넓히면 텍스트가 길어진다. 깨지는 원인은 대부분 **고정 크기 상자**다.

| 깨지는 패턴 | 바로잡기 |
| --- | --- |
| 버튼·카드·배지에 고정 `height` + `overflow: hidden` | `min-height`와 패딩으로 높이를 내용에 맡긴다 |
| 고정 `width` 안의 한 줄 텍스트 | 줄바꿈을 허용하거나 `max-width`로 |
| 텍스트 위에 절대 위치로 겹친 요소 | 흐름 레이아웃으로 바꾼다 |
| `text-overflow: ellipsis`로 잘리는 핵심 라벨 | 잘리면 정보가 사라진다. 줄바꿈시키거나 전체 텍스트를 볼 방법을 준다 |

## 글꼴 고르기

사람은 글자를 하나씩 읽지 않고 6~9자 정도의 덩어리를 패턴으로 알아본다. **이 흐름을 끊고 글자를 해독하게 만드는 모든 것**이 가독성을 떨어뜨린다.

| 원칙 | 내용 |
| --- | --- |
| 단순하고 익숙한 글꼴 | 익숙한 글자 모양은 빨리 읽힌다. 장식적이거나 복잡한 글꼴은 긴 본문에 쓰지 않는다 |
| 최고의 글꼴은 없다 | "화면은 산세리프, 인쇄는 세리프"는 고해상도 화면에서 의미가 줄었다. 난독증 사용자 모두에게 맞는 단일 글꼴도 없다 |
| 헷갈리는 글자 확인 | 대문자 I·소문자 l·숫자 1, 대문자 O·숫자 0, 소문자 e·o처럼 닮은 글자가 구분되는지 본다. 코드·인증 코드·일련번호를 보여 줄 때 특히 중요하다 |
| 거울상 글자 | b/d, p/q처럼 뒤집으면 같은 모양이 되는 글꼴은 난독증 독자가 헷갈린다. 글자마다 모양이 조금씩 다른 글꼴이 낫다 |
| 자간(kerning) | 너무 좁으면 r과 n이 붙어 m처럼 보인다(「yarn」이 「yam」으로). 기본 자간을 좁히지 않는다 |
| 한 가지 대소문자뿐인 글꼴, 필기체 | 전부 대문자이거나 손글씨·필기체 글꼴은 단어 모양이 사라져 느리게 읽힌다 |
| 글꼴 수를 줄인다 | 글꼴·굵기·스타일이 하나 늘 때마다 인지 부담이 늘어난다. 제목용·본문용을 나누는 정도는 의도가 분명하면 괜찮다 |
| 너무 가는 굵기를 피한다 | 얇은 굵기는 대비 수치가 같아도 덜 보인다 |
| 긴 강조를 피한다 | 문단 전체를 굵게·기울임·대문자로 쓰면 읽기 어렵다. 기울임은 난독증 독자에게 특히 어렵다. 스크린 리더는 굵게·기울임을 대개 읽지 않으므로, 꼭 전해야 하는 강조는 글로 쓰거나 형광 표시처럼 기울임이 아닌 방식을 쓴다 |
| 어조와 맞춘다 | 은행 사이트의 만화 같은 글꼴은 신뢰를 깎는다 |

- **글자 크기**: WCAG에 최소 크기는 없다. 그래도 작은 글자는 사용성을 해친다. 사용자의 브라우저 글자 크기 설정을 따르도록 `rem`·`em`·`%`로 준다. 대비 기준과 큰 텍스트 정의는 [[color-motion-accessibility|색과 움직임의 접근성]]에 있다.
- **대비는 최대가 정답이 아니다.** 순수한 검정·흰색 조합은 눈이 쉽게 피로하고, 일부 난독증 독자에게 글자가 번지거나 겹쳐 보이는 효과를 준다. 기준을 넘는 범위에서 약간 부드러운 색이 낫다.
- **이미지 텍스트를 쓰지 않는다**(성공 기준 1.4.5 Images of Text). 실제 텍스트는 사용자가 크기·글꼴·색·간격을 바꾸고, 번역하고, 복사하고, 리플로할 수 있다. 이미지 속 글자는 이 모두를 잃고 확대하면 깨진다. 로고는 예외다.
- **웹폰트는 접근성 문제가 아니다.** 텍스트가 실제 텍스트로 남아 있으면 스크린 리더는 글꼴과 무관하게 읽는다. 문제는 가독성이 낮은 글꼴을 고르는 것이다. 웹폰트 선언과 로딩은 [[web-typography|웹 타이포그래피: 가독성, 글줄 길이, 웹폰트]]에 있다.

## 텍스트 배치

| 항목 | 원칙 |
| --- | --- |
| 정렬 | 왼쪽 정렬(오른쪽에서 왼쪽으로 쓰는 언어는 오른쪽)이 가장 읽기 쉽다. 긴 가운데 정렬은 줄마다 시작점이 달라 부담이 크다. 제목 가운데 정렬 정도는 예외로 괜찮다 |
| 양쪽 정렬 | 단어·글자 간격이 들쭉날쭉해져 흰 강(rivers of white)이 생긴다. 본문에는 피한다 |
| 글줄 길이 | 한 줄 50자 미만이나 120자 초과는 대개 읽기 힘들다. WCAG 1.4.8(AAA)은 80자(중국어·일본어처럼 한 글자가 큰 문자는 40자) 이하를 요구한다. `max-width`를 `ch` 단위로 잡는다. 세부는 [[web-typography\|웹 타이포그래피]] |
| 덩어리 나누기 | 복잡한 배치는 저시력·읽기 장애·ADHD가 있는 사람에게 장벽이다. 글을 먼저 개요(불릿)로 짜 보고 제목·소제목·목록·인용 블록으로 나누고, 관련 요소는 시각적으로도 묶는다 |
| 여백 | 텍스트가 화면 가장자리에 붙으면 답답하고 줄이 길어진다. 좁은 화면에서는 여백을 줄여 글줄 길이를 지킨다 |
| 문단 구분 | 웹에서는 첫 줄 들여쓰기보다 문단 사이 간격이 낫다 |
| 밑줄 | 웹에서 밑줄은 링크라는 관례다. 링크가 아닌 텍스트에 밑줄을 긋지 않는다 |
| 깜박임·흐르는 글자 | 주의력 장애가 있는 사람의 집중을 깨고, 움직이는 링크는 누르기 어렵다. 쓰지 않는다 |

## 스크린 리더를 고려한 설계

스크린 리더 사용자는 페이지를 처음부터 끝까지 듣지 않는다. 숙련자는 분당 300단어 넘는 속도로 듣고, 요소 단위로 건너뛴다.

| 탐색 방식 | 설계에 주는 요구 |
| --- | --- |
| 제목 목록으로 이동 | 제목이 내용의 개요가 되도록 계층을 맞춘다 |
| 링크 목록 | 링크 텍스트가 문맥 없이도 뜻이 통해야 한다 |
| 랜드마크 이동 | `<main>`, `<nav>`, `<header>` 같은 영역을 둔다 |
| 문단 첫 문장만 듣기 | 핵심을 문단 앞에 둔다 |
| 표 탐색 | 행·열 수를 읽고 셀마다 제목을 읽으므로 데이터 표를 바르게 마크업한다 |
| 폼 컨트롤 이동 | 모든 칸에 이름을 준다([[accessible-forms\|접근 가능한 폼과 오류 처리]]) |

- 문서 언어를 `<html lang="ko">`로 정하고, 다른 언어 구절에는 그 요소에 `lang`을 단다. 발음 엔진과 자동 번역이 이 값을 쓴다.
- 스크린 리더는 구두점과 문단 끝에서 쉬고, 발음할 수 있는 약어는 단어로, 아니면 한 글자씩 읽는다. 비밀번호 칸은 "별표"로 읽는다. 철자가 같고 발음이 다른 단어와 기호는 설정에 따라 다르게 읽힌다.
- 스크린 리더마다 단축키와 알림 방식이 다르다. 특정 제품에 맞춰 코딩하지 말고 **표준과 일반 기법**을 따른다.

페이지 구조(제목·랜드마크·표)는 [[accessible-page-structure|접근 가능한 페이지 구조]]에, 링크 텍스트는 [[accessible-images-links-text|대체 텍스트, 링크, 쉬운 글]]에, 실제 스크린 리더 조작은 [[screen-reader-testing|스크린 리더로 테스트하기]]에 있다.

## 정리

- 의미는 HTML이 지고 CSS는 표현만 맡는다. 소스 순서를 화면 순서와 맞춘다.
- 숨길 때는 **모두에게 숨길지, 화면에서만 숨길지** 먼저 정한다. 화면에서만 숨길 때는 `clip-path: inset(50%)` 기반 visually-hidden 패턴을 쓰고, 포커스 가능한 요소는 숨기지 않는다.
- 320 CSS px(400% 확대)에서 두 방향 스크롤 없이 읽혀야 하고, 사용자가 줄·문단·자간·단어 간격을 넓혀도 고정 크기 상자가 내용을 자르지 않아야 한다.
- 글꼴은 익숙하고 글자 구분이 쉬운 것으로 적게 쓰고, 텍스트는 이미지가 아닌 실제 텍스트로 둔다.
- **사용자가 스타일을 바꿔도 견디는 페이지**가 접근 가능한 페이지다.

관련 노트: [[web-typography|웹 타이포그래피: 가독성, 글줄 길이, 웹폰트]], [[responsive-design|반응형 디자인과 다국어 타이포그래피]], [[color-motion-accessibility|색과 움직임의 접근성]], [[semantic-html|시맨틱 HTML과 문서 구조]], [[accessible-forms|접근 가능한 폼과 오류 처리]], [[accessible-page-structure|접근 가능한 페이지 구조]], [[screen-reader-testing|스크린 리더로 테스트하기]]
