---
title: "line-height와 vertical-align: 글꼴 지표와 인라인 서식 맥락"
concept: "Inline Formatting Context"
summary: "같은 font-size라도 글꼴마다 높이가 다른 이유(em 사각형과 ascent·descent 지표), 인라인 요소의 두 높이(content-area와 line-height가 만드는 가상 영역), 줄 상자(line box)의 높이가 정해지는 방식, line-height: normal의 실제 값, vertical-align이 줄 상자를 키우는 원리와 이미지 아래 틈 같은 증상의 원인."
tags: ["frontend", "css", "layout", "typography"]
source: other
date: "2026-10-21"
sources: ["https://wit.nts-corp.com/2017/09/25/4903", "https://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align", "https://developer.mozilla.org/en-US/docs/Web/CSS/text-box-trim", "https://caniuse.com/css-text-box-trim"]
---

> Vincent De Oliveira의 「[CSS에 대한 깊은 이해: 폰트 매트릭스, line-height와 vertical-align](https://wit.nts-corp.com/2017/09/25/4903)」(NTS 번역, 원문 「[Deep dive CSS: font metrics, line-height and vertical-align](https://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align)」)을 바탕으로 재구성한 노트다. 줄 간격을 얼마로 잡을지 같은 가독성 문제는 [[web-typography|웹 타이포그래피]]에 있다.

## font-size는 글자 높이가 아니다

`font-size: 100px`을 줘도 글꼴마다 요소 높이가 다르다. 높이는 **글꼴 파일의 지표(metrics)** 가 정한다.

| 지표 | 뜻 |
| --- | --- |
| em 사각형(UPM, units per em) | 글리프를 설계하는 기준 좌표계. 보통 1000, 2048 등. `font-size`가 이 1em에 대응한다 |
| ascent / descent | 기준선(baseline) 위·아래로 글꼴이 차지한다고 선언한 높이. em 사각형을 넘을 수 있다 |
| line gap | 줄 사이에 두라고 글꼴이 권하는 간격 |
| cap height / x-height | 대문자·소문자 x의 높이. `ex` 단위가 x-height다 |

예를 들어 UPM 1000에 ascent 1100, descent 540인 글꼴은 `font-size: 100px`일 때 높이가 164px이다. 이 높이가 **content-area**이고, 인라인 요소의 배경이 칠해지는 영역이다. `em` 단위는 content-area가 아니라 `font-size` 기준이라 100px 그대로다. 운영체제마다 읽는 ascent·descent 테이블(hhea, OS/2)이 달라 같은 글꼴도 OS에 따라 몇 픽셀 차이가 날 수 있다.

## 인라인 요소의 두 높이

한 문단은 줄마다 **줄 상자(line box)** 가 쌓인 것이고, 줄 상자 안에는 인라인 요소와 이름 없는 텍스트 조각(익명 인라인 상자)이 들어 있다.

| 높이 | 정하는 것 | 쓰임 |
| --- | --- | --- |
| content-area | 글꼴 지표 × `font-size` | 배경이 칠해지는 범위 |
| 가상 영역(인라인 상자 높이) | **`line-height`** | 줄 상자 높이 계산에 쓰인다 |

- 두 높이의 차이가 **행간(leading)** 이고, 반씩(half-leading) content-area 위아래에 붙는다. 그래서 글자는 줄 높이의 가운데에 놓인다.
- 즉 CSS의 `line-height`는 인쇄 용어처럼 「기준선 사이 거리」가 아니라 **각 인라인 상자의 높이**다.
- `line-height`가 content-area보다 작으면 행간이 음수가 되어 줄 상자가 글자보다 작아지고, 위아래 줄의 글자나 배경이 겹친다.
- 인라인 요소의 `padding`·`border`는 배경 영역만 넓힐 뿐 줄 상자 높이를 바꾸지 않는다. 세로 `margin`은 효과가 없다.

**줄 상자의 높이 = 그 줄의 인라인 상자들 중 가장 높은 꼭대기부터 가장 낮은 바닥까지.** 줄에 섞인 요소 하나가 줄 전체를 키울 수 있다.

### 대체 요소와 inline-block

`<img>`·`<input>`·`<svg>` 같은 대체 요소, `inline-block`·`inline-flex`, 그리고 플렉스·그리드 아이템처럼 블록화된 요소는 다르다. 높이가 `height`·`padding`·`border`·`margin`으로 정해지고, 그 **마진 상자 전체**가 줄 상자 높이에 반영된다.

## line-height: normal은 얼마인가

`normal`은 고정된 1.2가 아니다. **ascent + descent + line gap**을 UPM으로 나눈 값으로, 글꼴마다 다르다.

| 예 | 계산 | normal |
| --- | --- | --- |
| UPM 1000, ascent 1100, descent 540, gap 0 | 1640 / 1000 | 1.64 |
| UPM 2048, ascent 1854, descent 434, gap 67 | 2355 / 2048 | 약 1.15 |

대부분의 글꼴은 이 값이 1보다 크다. 그래서 **`line-height: 1`은 content-area보다 작은 줄을 만들기 쉽다.** 단위 없는 값은 `font-size`의 배수일 뿐 content-area와는 무관하다. 폴백 글꼴로 바뀌면 줄 높이가 달라지는 것도 같은 이유다. 웹 폰트와 폴백의 지표를 맞추는 `ascent-override`·`descent-override`·`line-gap-override`는 [[cls-optimization|CLS 최적화]]에 있다.

## vertical-align

`vertical-align`은 인라인 상자들을 줄 상자 안에서 어디에 맞출지 정한다. 기본값은 `baseline`이다.

| 값 | 맞추는 기준 |
| --- | --- |
| `baseline` | 부모의 기준선 |
| `middle` | 부모 기준선 + 부모 x-height의 절반. 「정확한 가운데」가 아니다 |
| `text-top` / `text-bottom` | 부모 content-area의 위·아래 |
| `top` / `bottom` | 줄 상자의 위·아래 |
| `sub`·`super`, 길이·% | 기준선에서 위아래로 이동 |

ascent와 descent의 비율이 글꼴마다 달라 기준선 위치도 다르다. 그래서 기준선 정렬만으로도 줄 상자가 예상보다 커진다.

- 같은 줄에 `font-size`가 더 **작은** 요소를 넣어도 기준선을 맞추느라 아래쪽으로 내려가 줄이 **높아질** 수 있다.
- 줄 상자는 부모 글꼴과 `line-height`를 가진 폭 0의 가상 글자(**strut**)에서 시작한다. 부모의 글꼴이 자식과 다르면 부모 기준선과 자식 기준선이 어긋나 줄이 커진다.

## 자주 만나는 증상

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| 이미지 아래 몇 픽셀 틈 | `<img>`가 인라인이라 기준선에 앉고, 아래에 descent 자리가 남는다 | `img { display: block; }` 또는 `vertical-align: middle`·`bottom` |
| 아이콘과 글자가 위아래로 어긋남 | 서로 다른 지표·기준선 | 부모를 `display: flex; align-items: center` |
| 같은 `line-height`인데 줄마다 높이가 다르다 | 줄에 섞인 다른 글꼴·크기·인라인 블록 | 섞이는 요소의 `line-height`·`vertical-align`을 맞추거나 블록화 |
| 버튼 안 글자가 수직 가운데처럼 안 보임 | 글꼴의 ascent·descent가 비대칭이라 위아래 여백이 다르다 | 글꼴 지표 보정, 또는 `text-box` 트리밍 |

### 글자 위아래 여백 깎기

`text-box-trim`·`text-box-edge`(축약 `text-box`)는 첫 줄 위와 마지막 줄 아래의 반 행간과 글꼴 여백을 잘라, 대문자 높이나 기준선에 딱 맞춰 정렬하게 한다. Chrome 133·Safari 18.2에 이어 2026년 Firefox 154가 지원하면서 모든 주요 브라우저에서 쓸 수 있다(Baseline 2026). 옛 브라우저에서는 무시되므로 점진적 향상으로 쓴다.

```css
h1, .button { text-box: trim-both cap alphabetic; }
```

## 정리

- `font-size`는 em 크기일 뿐이다. 실제 높이(content-area)는 글꼴의 ascent·descent가 정한다.
- `line-height`는 인라인 상자의 높이이고, 줄 상자는 그 줄에서 가장 높은 곳부터 가장 낮은 곳까지다.
- `line-height: normal`은 글꼴마다 다르다. `line-height: 1`은 대개 글자보다 좁다.
- `vertical-align`과 기준선 정렬이 줄을 예상보다 키운다. 레이아웃 정렬은 플렉스·그리드로 하고, 인라인 정렬은 문장 안의 요소에만 쓴다.

관련 노트: [[web-typography|웹 타이포그래피]], [[box-model|박스 모델]], [[how-css-works|CSS가 동작하는 방식]], [[css-basics|CSS 기초]], [[flexbox|Flexbox]]
