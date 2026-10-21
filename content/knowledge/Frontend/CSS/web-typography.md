---
title: "웹 타이포그래피: 가독성, 글줄 길이, 웹폰트"
concept: "Web Typography"
summary: "사람이 화면의 글을 읽는 방식에서 출발해 글줄 길이(45~85자, ch 단위), 글자 크기와 줄 간격의 균형, x-height를 맞추는 font-size-adjust, 자간·단어 간격과 가변 폰트, 양쪽 정렬과 하이픈, 대비와 다크 모드, 그리고 @font-face로 웹폰트를 선언하는 법까지."
tags: ["css", "typography", "design", "a11y", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://webactually.com/2015/10/19/%eb%b0%98%ec%9d%91%ed%98%95-%ec%9b%b9-%eb%94%94%ec%9e%90%ec%9d%b8%ec%97%90%ec%84%9c-%ea%b8%80%ec%a4%84%ec%9d%98-%ea%b8%b8%ec%9d%b4%ec%99%80-%ea%b8%80%ec%9e%90-%ed%81%ac%ea%b8%b0-%ea%b7%a0%ed%98%95/", "https://webactually.com/2021/02/02/%ea%b0%80%eb%8f%85%ec%84%b1-%ea%b0%9c%ec%84%a0%ec%9d%84-%ec%9c%84%ed%95%9c-%ec%b5%9c%ec%8b%a0-css-%ed%85%8c%ed%81%ac%eb%8b%89/", "https://webactually.com/2017/12/05/16734/", "https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-style", "https://caniuse.com/mdn-css_properties_text-wrap-style_pretty", "https://web.dev/learn/css/typography", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/CSS/%EC%9B%B9%ED%8F%B0%ED%8A%B8%2C%20%EB%A1%9C%EC%BB%AC%ED%8F%B0%ED%8A%B8%20%EC%A0%81%EC%9A%A9.md", "https://github.com/AllThingsSmitty/css-protips"]
---

> Laura Franz의 「[반응형 웹 디자인에서 글줄의 길이와 글자 크기 균형 잡기](https://webactually.com/2015/10/19/%eb%b0%98%ec%9d%91%ed%98%95-%ec%9b%b9-%eb%94%94%ec%9e%90%ec%9d%b8%ec%97%90%ec%84%9c-%ea%b8%80%ec%a4%84%ec%9d%98-%ea%b8%b8%ec%9d%b4%ec%99%80-%ea%b8%80%ec%9e%90-%ed%81%ac%ea%b8%b0-%ea%b7%a0%ed%98%95/)」(2015.10), Edoardo Cavazza의 「가독성 개선을 위한 최신 CSS 테크닉」(2021.02), Bram Stein의 「웹폰트 사용하기」(2017.12, 웹액츄얼리 번역)를 바탕으로 재구성한 노트다. 텍스트 속성 참조는 web.dev 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Text and typography 모듈로 보강했다.
> `local()` 항목은 「[Frontend_TIL: 웹폰트, 로컬폰트 적용](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/CSS/%EC%9B%B9%ED%8F%B0%ED%8A%B8%2C%20%EB%A1%9C%EC%BB%AC%ED%8F%B0%ED%8A%B8%20%EC%A0%81%EC%9A%A9.md)」과 「[CSS Protips](https://github.com/AllThingsSmitty/css-protips)」의 로컬 글꼴 팁을 바탕으로 보강했다.

## 사람은 화면의 글을 어떻게 읽나

| 읽기 방식 | 모습 |
| --- | --- |
| 훑어보기 | 목적 없이 이미지, 첫 문장 몇 개, 목록을 본다 |
| 찾아 읽기 | 특정 정보를 찾아 덩어리에서 덩어리로 건너뛴다 |
| 몰입해 읽기 | 처음부터 끝까지 천천히 읽는다 |

서식 단서가 적은 글을 훑을 때 시선은 흔히 **F자 패턴**을 그린다(제목·굵은 글씨·목록 같은 단서가 많으면 다른 패턴이 나온다). 눈은 단어를 하나씩 읽지 않는다. 중심시(foveal vision)로 몇 글자에 초점을 맞추고, 주변시(peripheral vision)로 다음 지점을 찾아 도약(saccade)한다. 한 줄을 가로로 읽으면서 다음 줄의 시작을 예측하고, 지치면 왼쪽 가장자리를 따라 세로로 훑는다. **가로 이동과 세로 이동의 줄다리기**가 F자를 만든다. 그래서 왼쪽 정렬이 기본이다. 줄 시작점이 일정해야 눈이 돌아올 곳을 찾는다.

## 세 변수의 균형: 글줄 길이, 글자 크기, 줄 간격

### 글줄 길이

| 기준 | 값 |
| --- | --- |
| 인쇄물의 전통적 기준 | 한 줄 45~75자(공백·문장부호 포함), 이상값 65자 |
| 화면 | 45~85자까지 허용 |
| CSS | `max-inline-size: 65ch` (`ch` = 글꼴의 "0" 너비) |

줄이 너무 길면 줄 끝에서 다음 줄 시작을 찾다가 같은 줄을 다시 읽는다(doubling). 너무 짧으면 함께 읽혀야 할 구절이 끊긴다. `ch`는 숫자 0의 너비라 한글처럼 넓은 글자는 같은 `ch` 값에 더 적게 들어간다. 언어마다 실제 글자 수를 확인해 값을 조정한다.

### 글자 크기가 글줄 길이보다 먼저다

**이상적인 글줄 길이를 지키려고 글자 크기를 희생하지 않는다.**

| 화면 | 흔한 실수 | 더 나은 선택 |
| --- | --- | --- |
| 작은 화면 | 줄당 글자 수를 맞추려고 글자를 줄인다 | 편한 크기를 유지하고 줄을 짧게 둔다. 사람은 휴대폰을 눈에 가까이 든다 |
| 큰 화면 | 한 단짜리 레이아웃에서 줄 길이를 맞추려고 글자를 키운다(본문 20px 이상) | 편한 크기를 유지하고 **단의 너비를 좁힌다** |

글자가 지나치게 크면 한 번의 도약에 들어오는 단어가 줄어 읽기가 느려지고, 독자는 가로 읽기를 포기하고 세로로 훑기 시작한다. 반응형 브레이크포인트를 정할 때 글줄 길이는 좋은 출발점이지만, 결정은 실제 기기를 가까이 들고 확인해서 내린다([[responsive-design|반응형 디자인과 다국어 타이포그래피]]).

### 줄 간격

- 출발점은 **글자 크기의 약 1.5배**다. 브라우저 기본값 `normal`은 글꼴에 따라 1.2 안팎이라 본문에는 좁다.
- 너무 좁으면 가로 흐름이 약해져 같은 줄을 다시 읽고, 너무 넓으면 줄들이 각각 떠다녀 한 덩어리로 읽히지 않는다.
- **글자가 작을수록 줄 간격은 오히려 넓힌다.** 작은 단어 형태를 알아보기 쉬워진다.
- 제목처럼 큰 글자는 줄 간격 비율을 줄인다.
- `line-height`는 단위 없는 값(`1.5`)으로 쓴다. 자식이 자기 글자 크기에 맞춰 다시 계산한다.

```css
.prose {
  font-size: 1rem;              /* 사용자 브라우저 설정을 존중 */
  line-height: 1.5;
  max-inline-size: 65ch;
  margin-inline: auto;
}
.prose h1, .prose h2 { line-height: 1.2; text-wrap: balance; }
.prose p { text-wrap: pretty; }   /* 마지막 줄 외톨이 단어 방지 */
```

`text-wrap: balance`(제목 줄 길이 고르기)는 Baseline 2024다. `pretty`는 Chrome 130·Safari 26부터 지원하고 Firefox는 2026년 10월 기준 지원하지 않는다. 모르는 브라우저는 기본 줄바꿈으로 돌아가므로 점진적 향상으로 그냥 써도 된다.

## 글꼴 지표를 다루는 CSS

| 문제 | 도구 |
| --- | --- |
| 같은 `font-size`인데 글꼴마다 커 보이는 정도가 다르다 | `font-size-adjust`(Baseline 2024): 소문자 높이(x-height) 비율을 맞춘다. 폴백 글꼴로 바뀌어도 크기가 튀지 않는다 |
| 웹폰트 로딩 전후로 레이아웃이 흔들린다 | `@font-face`의 `size-adjust`, `ascent-override` 등으로 폴백 글꼴 지표를 웹폰트에 맞춘다 |
| 글자·단어 간격 | `letter-spacing`, `word-spacing`. 난독증 독자에게는 글꼴 모양보다 **간격을 넓히는 것**이 더 도움이 된다는 연구가 있다 |
| 굵기·폭·광학 크기를 연속적으로 조절 | 가변 폰트(variable font) + `font-variation-settings`, `font-optical-sizing` |

`letter-spacing`은 모든 글자 사이에 같은 값을 더해 글꼴 고유의 간격 리듬을 깰 수 있다. 가변 폰트는 디자이너가 축(axis)으로 설계한 범위 안에서 조절해 더 자연스럽다. 폰트 지표를 임의로 비트는 것은 피한다.

## 양쪽 정렬과 하이픈

양쪽 정렬(`text-align: justify`)을 하이픈 없이 쓰면 단어 사이에 큰 구멍(rivers)이 생겨 읽기를 방해한다. 하이픈을 쓰는 언어라면 `hyphens: auto`와 문서의 `lang` 속성을 함께 쓴다. 수동으로 끊을 위치는 소프트 하이픈(`&shy;`)으로 표시한다. 한국어 본문은 `word-break: keep-all`로 단어 중간 줄바꿈을 막는 것이 먼저다.

## 대비와 테마

- 글자와 배경의 대비는 가독성의 기본이다. WCAG AA 기준으로 본문은 4.5:1 이상이다. 자동 검사 도구는 참고용이고, 실제 화면에서도 확인한다.
- 사용자 선호를 따르려면 `prefers-color-scheme`(다크 모드), `prefers-contrast`를 쓴다. 세피아·밝은 회색·야간 모드 같은 읽기 테마는 커스텀 속성으로 색 몇 개만 바꿔 만든다([[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]]).

## 웹폰트 선언하기: @font-face

```css
@font-face {
  font-family: "Elena";
  src: url("elena-regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Elena";            /* 같은 패밀리 이름 */
  src: url("elena-bold.woff2") format("woff2");
  font-weight: 700;
}
body { font-family: "Elena", Georgia, serif; }   /* 폴백을 반드시 둔다 */
```

| 요소 | 규칙 |
| --- | --- |
| 한 패밀리의 여러 스타일 | 스타일마다 `@font-face`를 따로 쓰되 `font-family` 이름은 같게. `font-weight`·`font-style`·`font-stretch`로 구분 |
| 가변 폰트 | 파일 하나에 `font-weight: 100 900`처럼 범위를 준다 |
| 포맷 | WOFF2 하나면 된다. 모든 주요 브라우저가 지원하고 압축률이 가장 좋다 |
| `format()` 힌트 | 항상 쓴다. 브라우저가 내려받기 전에 지원 여부를 판단한다 |
| 폴백 글꼴 | 웹폰트가 실패하거나 늦을 때 쓸 글꼴을 `font-family` 목록 끝에 반드시 둔다 |
| `local()` | `src: local("Pretendard"), url(…woff2)`처럼 앞에 두면 설치된 글꼴이 있을 때 내려받지 않는다. 하지만 사용자 컴퓨터의 같은 이름 글꼴은 버전·글리프 범위가 다를 수 있고, Safari는 지문 수집을 막으려고 사용자가 직접 설치한 글꼴을 웹에 노출하지 않아 효과도 브라우저마다 다르다. 버전이 보장되는 시스템 글꼴이 아니면 쓰지 않는다 |
| `font-display` | `swap`은 폴백으로 먼저 보여 주고 교체한다. 레이아웃 흔들림은 지표 보정으로 줄인다 |
| 한글 웹폰트 | 글리프가 많아 파일이 크다. `unicode-range`로 나눈 서브셋 파일을 쓴다 |

과거에는 IE8용 EOT, 구형 iOS용 SVG 폰트까지 나열하는 "방탄 @font-face 구문"을 썼다. 지금은 WOFF2만으로 충분하다. 웹폰트 로딩 성능은 [[web-vitals|웹 성능 지표와 Lighthouse]]의 LCP·CLS와 직결된다.

## 텍스트 속성 빠른 참조

### 글꼴 고르기와 굵기

- `font-family`는 쉼표 목록이다. 브라우저는 목록을 **글자 하나하나마다** 앞에서부터 찾는다. 첫 글꼴에 한글이 없으면 한글만 다음 글꼴로 그린다.
- 목록 끝에는 **일반 글꼴군**(`serif`, `sans-serif`, `monospace`, `system-ui`, `cursive`, `fantasy` 등)을 둔다. 원하는 글꼴과 비슷한 군을 고른다. 특정 글꼴 이름은 따옴표로 감싼다.
- `@font-face`는 글꼴을 **선언하고 이름을 붙이는** 규칙이고, `font-family`는 그 이름을 요소에 **적용하는** 속성이다. `@font-face`는 선택자 블록 안에 쓸 수 없지만 조건부 그룹 규칙(`@supports` 등) 안에는 쓸 수 있다. 다른 출처의 글꼴 파일은 CORS 허용이 필요하다.
- `font-weight`: `normal` = `400`, `bold` = `700`. `lighter`·`bolder`는 부모 기준 상대값이다. 가변 글꼴이 아니면 100 단위 값만 의미가 있고, 대부분 글꼴은 400과 700만 가진다. `321` 같은 값은 가변 글꼴에서만 된다.
- `font-style`: `italic`은 따로 설계된 이탤릭 서체, `oblique`는 정체를 기울인 것이다.
- `font-size` 키워드: 절대 `xx-small`~`xx-large`, 상대 `smaller`·`larger`(부모 기준).
- `font` 축약형은 `font-style`, `font-variant`, `font-weight`, `font-stretch`, `font-size`/`line-height`, `font-family`를 한 줄에 쓴다. 크기와 글꼴군은 필수이고, 빠진 하위 속성은 초깃값으로 돌아간다.
- `font-variant`는 `font-variant-caps`(작은 대문자), `-numeric`(`tabular-nums` 고정폭 숫자, `slashed-zero`), `-ligatures`, `-east-asian`, `-alternates`의 축약형이다. 표의 숫자 열에는 `tabular-nums`를 준다.

### 꾸밈과 변형

| 속성 | 값 | 비고 |
| --- | --- | --- |
| `text-transform` | `uppercase`, `lowercase`, `capitalize` | HTML은 그대로 두고 대소문자만 바꾼다 |
| `text-decoration-line` | `underline`, `overline`, `line-through` (여러 개 가능) | `text-decoration`은 아래 넷의 축약형 |
| `text-decoration-style` | `solid`, `double`, `dotted`, `dashed`, `wavy` | |
| `text-decoration-color`, `-thickness` | 색, 두께 | |
| `text-underline-offset` | 길이 | 밑줄과 글자 사이 거리. `text-underline-position: under`는 글자 아래로 내린다 |
| `text-indent` | 길이, 컨테이닝 블록 너비의 `%` | 문단 첫 줄 들여쓰기 |
| `letter-spacing`, `word-spacing` | 길이 | 기본 간격에 **더하는** 값. `word-spacing: 0` = `normal` |
| `text-shadow` | x y 흐림 색 | [[css-borders-shadows\|CSS 테두리와 그림자]] |

### 공백과 줄바꿈

| 속성 | 값 | 쓰임 |
| --- | --- | --- |
| `white-space` | `normal`, `nowrap`, `pre`, `pre-wrap`, `pre-line` | `pre`는 공백·줄바꿈을 그대로(ASCII 아트, 코드) |
| `word-break` | `normal`, `break-all`, `keep-all` | `break-all`은 글자 단위로 끊는다. 한국어 본문은 `keep-all` |
| `overflow-wrap` | `normal`, `break-word`, `anywhere` | 긴 URL·단어가 박스를 뚫을 때. 둘 다 아무 데서나 끊지만 `anywhere`는 그 끊을 자리를 `min-content` 계산에 넣어 박스가 줄어들 수 있고, `break-word`는 넣지 않아 가장 긴 단어만큼 버틴다 |
| `text-wrap` | `wrap`(기본), `nowrap`, `balance`, `pretty`, `stable` | `balance`는 줄 길이를 고르게(제목). 비용이 커서 브라우저는 몇 줄 이하에만 적용한다. `stable`은 편집 중인 글(contenteditable)에서 윗줄이 출렁이지 않게 한다 |
| `text-overflow` | `clip`(기본), `ellipsis` | 한 줄 말줄임([[css-overflow-scroll\|CSS 오버플로와 스크롤]]) |
| `text-align` | `start`, `end`, `left`, `right`, `center`, `justify`, `match-parent` | `start`·`end`는 문장 방향을 따른다 |

### 방향과 쓰기 모드

- `direction: rtl`보다 HTML `dir="rtl"` 속성을 쓴다. 방향은 문서 내용의 의미라 CSS가 없어도 유지돼야 한다.
- `writing-mode`(`horizontal-tb`, `vertical-rl`, `vertical-lr`)와 세로쓰기 때 글자를 세울지 정하는 `text-orientation`(`mixed`, `upright`)은 [[logical-properties|쓰기 모드와 논리적 속성]]에 있다.
- 첫 글자·첫 줄·선택 영역은 `::first-letter`, `::first-line`, `::selection`으로 꾸민다([[selectors#가상 요소: 실제로는 없는 요소|가상 요소]]).

## 정리

- 글자 크기를 먼저 편하게 정하고, 글줄 길이는 단의 너비로 맞춘다. 본문은 `max-inline-size: 65ch` 안팎.
- 줄 간격은 1.5에서 출발하고, 작은 글자일수록 넓힌다.
- 폴백과 웹폰트의 크기 차이는 `font-size-adjust`와 지표 보정으로 줄인다.
- 하이픈 없는 양쪽 정렬은 피한다. 대비는 4.5:1 이상.
- 웹폰트는 WOFF2 + `format()` 힌트 + 폴백 글꼴 + `font-display`.
- 규칙보다 실제 기기에서 읽어 보는 것이 우선이다.

관련 노트: [[responsive-design|반응형 디자인과 다국어 타이포그래피]], [[accessible-css-typography|접근성을 위한 CSS와 타이포그래피]], [[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]], [[logical-properties|쓰기 모드와 논리적 속성]], [[web-vitals|웹 성능 지표와 Lighthouse]], [[web-font-performance|웹 폰트 성능 최적화]], [[line-height-vertical-align|line-height와 vertical-align]]
