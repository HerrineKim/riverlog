---
title: "박스 모델과 display"
concept: "Box Model"
summary: "모든 요소를 content·padding·border·margin의 네모로 다루는 박스 모델, 내용이 크기를 정하는 내재적 크기와 바깥이 정하는 외재적 크기, margin·padding·gap으로 간격을 주는 방법과 margin 병합, 병합과 float를 안에 가두는 블록 서식 맥락(BFC), 배치 방식을 결정하는 display."
tags: ["css", "layout", "frontend"]
source: mixed
date: "2026-10-21"
sources: ["https://mytory.net/archives/16246", "https://developer.mozilla.org/en-US/docs/Web/CSS/length", "https://web.dev/learn/css/box-model", "https://web.dev/learn/css/spacing", "https://web.dev/learn/css/layout", "https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/css/bfc.md", "https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/css/margin-collapsing.md", "https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/css/block-inline-inline-block.md", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Block_formatting_context", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/CSS/margin%20negative.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/CSS/box-sizing%3A%20border-box%EB%A5%BC%20%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94%20%EC%9D%B4%EC%9C%A0.md", "https://github.com/AllThingsSmitty/css-protips", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/CSS/%ED%99%94%EB%A9%B4%20%EC%A0%84%EC%B2%B4%EB%A5%BC%20%EC%8A%A4%ED%81%AC%EB%A1%A4%EC%97%86%EC%9D%B4%20%EB%86%92%EC%9D%B4%EB%A5%BC%20%EC%B0%A8%EC%A7%80%ED%95%98%EA%B2%8C%20%ED%95%98%EB%8A%94%EB%B0%A9%EB%B2%95.md"]
---

> 직접 정리한 TIL에 web.dev 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Box Model·Spacing·Layout 모듈을 더해 보강한 노트다.
> 「블록 서식 맥락(BFC)」은 「[Must-Know-About-Frontend: Block Formatting Context](https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/css/bfc.md)」를 MDN으로 확인해 보강했다.
> 음수 margin과 box-sizing 계산은 「[Frontend_TIL: margin negative](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/CSS/margin%20negative.md)」·「[box-sizing: border-box를 사용하는 이유](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/CSS/box-sizing%3A%20border-box%EB%A5%BC%20%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94%20%EC%9D%B4%EC%9C%A0.md)」, box-sizing 상속 패턴과 블록 방향 `auto` margin은 「[AllThingsSmitty의 css-protips](https://github.com/AllThingsSmitty/css-protips)」를 바탕으로 보강했다.

CSS의 첫 번째 원칙은 **모든 요소는 네모(박스)** 라는 것이다. 요소의 실제 크기와 요소 사이 간격은 박스 모델로 계산되고, 그 박스가 한 줄을 차지할지 옆으로 나란히 놓일지는 `display`가 결정한다.

## 박스 모델

![박스 모델](/images/til/FRONTEND/CSS/CSS%EB%9E%80.assets/image-20220814215927750.png)

하나의 박스는 안쪽부터 네 영역으로 이루어진다.

| 영역 | 설명 |
| --- | --- |
| content | 글이나 이미지 등 실제 내용 |
| padding | 테두리 안쪽 여백(배경색이 칠해짐) |
| border | 테두리 |
| margin | 테두리 바깥 여백, 박스와 박스 사이 간격 |

액자에 비유하면 content는 그림, padding은 그림과 액자 사이의 흰 대지, border는 액자 틀, margin은 액자와 액자 사이 벽이다. `border-radius`로 원처럼 보여도 박스는 여전히 네모다.

- **스크롤바**는 padding 영역 안에 자리를 차지한다(`overflow: auto`·`scroll`일 때). 배경도 padding 영역까지 칠해진다.
- **`outline`과 `box-shadow`**는 margin 영역 위에 겹쳐 그려질 뿐 박스 크기를 바꾸지 않는다. `outline-width: 200px`을 줘도 레이아웃은 그대로다.
- 개발자 도구의 박스 모델 그림(Computed 탭)에서 네 영역의 실제 값을 확인한다([[devtools-elements-css|DevTools로 DOM과 CSS 다루기]]).

### 내재적 크기와 외재적 크기

| | 외재적 크기(extrinsic) | 내재적 크기(intrinsic) |
| --- | --- | --- |
| 누가 정하나 | 바깥: `width: 400px`, `%` | 안의 내용 |
| 장점 | 크기를 정확히 통제한다 | 내용이 늘어도 넘치지 않는다 |
| 위험 | 내용이 크면 박스 밖으로 넘친다(overflow) | 내용에 따라 레이아웃이 흔들린다 |
| 키워드 | 길이, `%` | `auto`(기본), `min-content`(가장 긴 단어만큼), `max-content`(한 줄로 늘였을 때), `fit-content` |

**브라우저 기본은 내재적 크기**이고 대부분 이쪽이 더 유연하다. 고정 크기 박스에 긴 단어가 들어가 넘치면 `width: min-content`나 크기 지정 제거로 내용이 박스를 정하게 한다. 넘친 내용의 처리는 [[css-overflow-scroll|CSS 오버플로와 스크롤]]에 있다.

### shorthand

![margin·padding shorthand](/images/til/FRONTEND/CSS/CSS%EB%9E%80.assets/image-20220814220142594.png)

```css
margin: 10px;                /* 상하좌우 */
margin: 10px 20px;           /* 상하 | 좌우 */
margin: 10px 20px 30px;      /* 상 | 좌우 | 하 */
margin: 10px 20px 30px 40px; /* 상 | 우 | 하 | 좌 (시계 방향, TRouBLe로 외운다) */
```

- `margin`·`padding`의 `%`는 방향과 상관없이 **컨테이닝 블록의 너비**(가로쓰기 기준 인라인 크기)를 기준으로 한다. `margin-top: 50%`도 부모 너비의 절반이다.
- `margin: auto`는 남은 공간을 그 방향으로 다 가져간다. 너비가 정해진 블록에 `margin-inline: auto`를 주면 가운데 정렬되고, 플렉스 아이템에 `margin-inline-start: auto`를 주면 그 아이템부터 끝으로 밀려난다.
- 블록 방향의 `auto`는 다르다. 일반 흐름의 블록에서 `margin-block: auto`(위·아래 `auto`)는 **0으로 계산**되어 세로 가운데 정렬이 되지 않는다. 블록 방향 `auto`가 남은 공간을 가져가는 것은 플렉스·그리드 아이템과 절대 위치 요소뿐이고, 일반 블록은 부모 쪽 정렬로 푼다.

| 맥락 | 세로 가운데 정렬 |
| --- | --- |
| 플렉스·그리드 아이템 | `margin: auto` 하나로 두 축 모두 가운데. 부모의 `align-items`보다 우선한다 |
| 절대·고정 위치 요소 | `inset: 0; margin: auto`에 크기(`block-size` 또는 `fit-content`)를 정해 줘야 한다 |
| 일반 블록 컨테이너 | margin 대신 부모에 `align-content: center`. 블록 레이아웃의 `align-content`는 2024년부터 모든 주요 브라우저가 지원한다 |

- 음수 margin은 방향에 따라 하는 일이 다르다. **위·왼쪽(시작쪽)** 음수는 요소 자신을 그 방향으로 끌어 옮기고, **아래·오른쪽(끝쪽)** 음수는 자신은 그대로 두고 **뒤따르는 요소를 끌어당겨** 겹치게 한다. 공간보다 크면 요소가 겹친다.

```css
.box1 { margin-left: -40px; }    /* box1이 왼쪽으로 40px 이동 */
.box1 { margin-bottom: -20px; }  /* box1은 그대로, 다음 형제가 20px 올라와 겹친다 */
```
- 논리 판(`margin-block`, `padding-inline` 등)은 [[logical-properties|쓰기 모드와 논리적 속성]]에 있다.

```css
.wrapper { max-inline-size: 60rem; margin-inline: auto; }  /* 가운데 정렬되는 본문 칼럼 */
```

### margin collapse

> margin collapse 규칙은 mytory 웹개발의 「[마진 병합 기능 이해하기](https://mytory.net/archives/16246)」(2024.04)를 참고해 보강했다.

Normal Flow에 있는 블록 요소의 **세로** margin은 더해지지 않고 **큰 쪽 하나로 합쳐진다**(margin collapsing). 가로 margin은 언제나 그대로 더해진다. `float`나 `position: absolute`로 흐름에서 빠진 요소의 margin도 합쳐지지 않는다.

병합은 다음 경우에 일어난다.

| 경우 | 무엇이 합쳐지나 | 막는 방법 |
| --- | --- | --- |
| 인접 형제 | 위 요소의 `margin-bottom`과 아래 요소의 `margin-top` | 대개 의도된 동작이라 막을 일이 드물다 |
| 부모와 첫 자식 | 자식의 `margin-top`이 부모 바깥으로 빠져나와 부모의 위 margin과 합쳐진다 | 부모에 `border`·`padding`·인라인 내용·BFC 생성(아래 「블록 서식 맥락」)·`clear` 중 하나 |
| 부모와 마지막 자식 | 자식의 `margin-bottom`이 부모 바깥으로 빠져나온다 | 부모에 `border`·`padding`·인라인 내용·`height`(`min-height`) 중 하나 |
| 빈 블록 | 자기 자신의 위·아래 margin끼리 | `border`·`padding`·인라인 내용·높이 중 하나 |

부모-자식 병합은 의도치 않게 자주 생긴다. 자식에게 준 `margin-top`이 부모 박스 안이 아니라 부모 위쪽 공백으로 나타나면 이 경우다.

```css
/* 자식 margin이 부모 밖으로 새지 않게 막는 흔한 방법 */
.parent { padding-top: 1px; }      /* 또는 border-top */
.parent { display: flow-root; }    /* 새 BFC를 만든다: float 높이 문제도 함께 막는다 */
```

- 합쳐지는 값은 부호에 따라 다르다. 둘 다 양수면 큰 값, 하나가 음수면 **둘을 더한 값**(`20px`과 `-5px` → `15px`), 둘 다 음수면 절댓값이 큰 값이다.
- 형제 사이에 margin 없는 요소가 끼면 두 margin은 더 이상 인접하지 않아 합쳐지지 않는다.
- **플렉스·그리드 아이템의 margin은 합쳐지지 않고 더해진다.** 레이아웃을 예측 가능하게 하려는 설계다. 제목의 `margin-bottom: 2rem`과 문단의 `margin-top: 3rem`은 일반 흐름에서 `3rem`이지만, `flex-direction: column` 컨테이너 안에서는 `5rem`이 된다.
- 병합은 문서 시절의 유산이다. 제목·문단마다 위아래 margin을 줘도 간격이 두 배로 벌어지지 않게 한다.

### 블록 서식 맥락(BFC)

**블록 서식 맥락(Block Formatting Context)** 은 블록 박스들이 위에서 아래로 쌓이고 float와 상호작용하는 **독립된 배치 구역**이다. margin 병합과 float의 영향은 한 BFC 안에서만 일어나고 경계를 넘지 않는다. 그래서 「부모가 새 BFC를 만든다」는 것은 「안쪽 배치가 바깥과 섞이지 않게 벽을 친다」는 뜻이다.

| 새 BFC를 만드는 것 | 부작용 |
| --- | --- |
| `display: flow-root` | **없다.** BFC만 만들려고 생긴 값이라 지금의 기본 선택이다 |
| `overflow`가 `visible`·`clip`이 아닌 값(`hidden`, `auto`) | 넘친 내용이 잘리거나 스크롤바가 생긴다 |
| `float`가 `none`이 아님, `position: absolute`·`fixed` | 요소가 흐름에서 빠지고 너비가 내용만큼 줄어든다 |
| `display: inline-block`, `table-cell`, `table-caption` | 인라인처럼 놓이거나 표처럼 동작한다 |
| `contain: layout`·`content`·`paint`, 다단(`column-count`) 컨테이너 | 레이아웃 격리 같은 다른 효과가 함께 붙는다 |
| 플렉스·그리드 **아이템** | 아이템 안쪽이 독립된 맥락이 된다 |
| 문서 루트(`<html>`) | - |

`display: flex`·`grid` 컨테이너 자체는 BFC가 아니라 플렉스·그리드 서식 맥락을 만든다. 그래도 바깥과 분리되는 효과는 같아서, 자식의 margin이 컨테이너 밖으로 새지 않고 안의 float도 무시된다.

BFC로 푸는 문제는 세 가지다.

| 문제 | BFC를 만들 곳 | 결과 |
| --- | --- | --- |
| 자식 margin이 부모 밖으로 새거나 형제끼리 병합됨 | 부모, 또는 한쪽 형제를 감싼 래퍼 | BFC 경계를 넘는 margin은 합쳐지지 않는다 |
| float만 담은 부모의 높이가 0이 됨 | 부모 | 부모가 float까지 포함해 높이를 잡는다 |
| float 옆 문단의 줄이 float 아래로 감겨 들어감 | 문단 | 문단 박스가 float을 피해 옆에 한 덩어리로 선다(2단처럼 보인다) |

```css
.media-body { display: flow-root; }  /* float된 썸네일 옆에서 글이 감기지 않는다 */
```

과거에는 같은 목적으로 `overflow: hidden`을 썼는데, 그림자·드롭다운처럼 박스 밖으로 나가야 하는 내용까지 잘리는 부작용이 있었다. float를 담는 다른 옛 방법(clearfix)은 [[flexbox|Float와 Flexbox]]에 있다.

### overflow

박스 안 내용이 넘칠 때의 처리. `visible`(기본, 넘쳐서 보임), `hidden`(잘라냄), `scroll`, `auto`(넘칠 때만 스크롤). 말줄임·스크롤 접근성·스크롤 스냅은 [[css-overflow-scroll|CSS 오버플로와 스크롤]]에 있다.

### box-sizing

기본값 `content-box`에서는 `width`가 content 영역만의 너비라 padding·border를 더하면 실제 크기가 커진다. `width: 350px; padding: 25px; border: 5px`인 박스는 화면에서 `350 + 25×2 + 5×2 = 410px`을 차지한다. `border-box`로 바꾸면 `width`가 border까지 포함한 크기가 되어 박스는 350px 그대로이고, content 영역이 `350 − 60 = 290px`로 줄어든다.

```css
html { box-sizing: border-box; }
*, *::before, *::after { box-sizing: inherit; }
```

요소마다 섞어 쓰면 크기 계산이 엉키므로 **모든 요소에 같은 방식**을 적용한다. `*`에 `border-box`를 직접 주는 대신 위처럼 `html`에서 `inherit`으로 물려받게 하면, `content-box`를 전제로 만든 외부 위젯을 감싼 요소에 `box-sizing: content-box` 한 줄만 주어도 그 안이 통째로 바뀐다. 이 규칙은 보통 CSS 리셋에 들어간다([[css-practical-tips|CSS 실전 팁]]).

## 간격 주는 방법 고르기

| 도구 | 만드는 공간 | 어울리는 곳 |
| --- | --- | --- |
| `padding` | 박스 **안쪽** 여백(배경이 칠해짐) | 버튼·카드 내부 |
| `margin` | 박스 **바깥** 여백 | 흐름 레이아웃의 블록 사이, `auto`로 밀어내기 |
| `gap` (`row-gap`, `column-gap`) | 플렉스·그리드·다단의 **아이템 사이**에만 | 목록·카드 사이. 첫·마지막 항목 여백을 지울 필요가 없다 |
| 플렉스·그리드 정렬 | `justify-content: space-between` 등으로 남는 공간 분배 | 양 끝 정렬 |
| `inset`·`top` 등 | 위치 지정 요소의 오프셋 | [[position\|CSS position과 z-index]] |
| HTML `<br>`, `<hr>`, `&nbsp;` | 줄바꿈, 주제 구분선, 줄바꿈 없는 공백 | **문서의 의미일 때만.** 장식용 선은 `border`, 여백은 CSS로. `&nbsp;`는 양옆 단어를 붙여 버려 예기치 않은 줄바꿈을 만든다 |

`gap`은 값 하나면 행·열 모두, 두 값이면 `row-gap column-gap` 순이다.

간격은 **일관된 척도**를 정하고 지킨다. 거터(gutter)는 늘 `20px`, 흐름 콘텐츠 사이는 `1em`처럼 정해 커스텀 속성으로 토큰화하면 한 곳에서 바꿀 수 있다([[design-system|디자인 시스템: 구성, 도입, 구축과 배포]]).

```css
:root { --gutter: 1.25rem; --flow-space: 1em; }
.flow > * + * { margin-block-start: var(--flow-space); }
.grid { display: grid; gap: var(--gutter); }
```

## display

CSS의 두 번째 원칙: **display에 따라 크기와 배치가 달라진다.**

| 값 | 줄 바꿈 | 너비 | width/height·상하 margin |
| --- | --- | --- | --- |
| `block` | 일어남(한 줄 전체 차지) | 기본적으로 부모 가로 폭 전체 | 지정 가능 |
| `inline` | 일어나지 않음(행의 일부) | 내용만큼 | **지정 불가**. 상하 여백은 `line-height`로 |
| `inline-block` | 일어나지 않음 | 내용만큼 또는 지정값 | 지정 가능 |
| `none` | - | 화면에서 제거되어 **공간도 차지하지 않음** | - |

- `display`는 두 가지를 정한다. **바깥**: 형제와 블록처럼 줄을 바꾸며 놓일지, 인라인처럼 문장 속에 놓일지. **안쪽**: 자식을 일반 흐름·플렉스·그리드 중 무엇으로 배치할지. `display: flex`는 바깥은 블록, 자식은 플렉스 아이템이다.
- 인라인 요소의 위아래 margin·padding은 그려지지만 주변 줄이 **자리를 비켜 주지 않는다.** `inline-block`은 문장 속에 놓이면서도 위아래 여백을 존중받는다.
- `inline`·`inline-block` 요소 사이에는 HTML 소스의 줄바꿈·들여쓰기가 **공백 한 칸**(약 4px)으로 그려진다. `inline-block`으로 메뉴를 나란히 놓으면 생기는 틈의 원인이다. 블록은 공백을 무시한다. 간격을 정확히 통제하려면 부모를 플렉스로 만들고 `gap`을 쓴다.
- 블록 요소 안에는 인라인 요소가 들어갈 수 있다. (대표 블록: `div`, `p`, `ul`, `h1`… / 대표 인라인: `span`, `a`, `img`, `strong`…)
- `visibility: hidden`은 `display: none`과 달리 **공간은 차지하면서** 보이지만 않게 한다.
- `flex`, `grid` 등 레이아웃용 값은 [Flexbox](/knowledge/dictionary/frontend/css/flexbox) 노트 참고.
- 블록/인라인 구분은 HTML 4.01까지의 분류이고, HTML5부터는 콘텐츠 카테고리라는 다른 분류를 쓴다. CSS의 `display` 값으로 이해하면 된다.

## 팁: 100% vs 100vh

자식에게 `height: 100%`를 주면 **부모의 높이**를 기준으로 계산된다. 부모의 높이가 정해져 있지 않으면 기준이 없어 요소가 0 높이로 사라진 것처럼 보인다. 그래서 `html`, `body`부터 모든 조상에 `height: 100%`를 주어야 한다.

화면을 가득 채우는 게 목적이라면 `min-height: 100dvh`처럼 뷰포트 단위를 쓴다. 모바일에서 `100vh`는 주소창 때문에 화면보다 길어지므로 `dvh`를 쓰고, 단위별 차이는 [[css-basics|CSS 기초의 크기 단위 표]]에 있다.

흐름과 상관없이 화면을 덮는 층(배경 흐림, 오버레이)은 높이 계산 없이 네 변을 붙인다. `inset: 0`은 `top·right·bottom·left: 0`의 축약이고, `fixed`면 뷰포트, `absolute`면 위치 지정 조상을 꽉 채운다. 스크롤바도 생기지 않는다.

```css
.backdrop { position: fixed; inset: 0; backdrop-filter: blur(8px); }
```

## 핵심 정리

- 기본은 내재적 크기다. 고정 크기는 넘침을 각오하고 쓴다.
- 간격은 안쪽 `padding`, 바깥 `margin`, 아이템 사이 `gap`. 척도를 정해 토큰으로 쓴다.
- 박스 = content + padding + border + margin. 세로 margin은 형제·부모-자식·빈 블록에서 큰 쪽 하나로 합쳐지고, 가로 margin은 합쳐지지 않는다.
- margin 누수·float 높이 문제는 부모에 새 BFC를 만들어 푼다. 부작용 없는 값은 `display: flow-root`다.
- `box-sizing: border-box`를 전역으로 적용하면 크기 계산이 단순해진다.
- `inline`은 width/height와 상하 margin을 무시한다. 필요하면 `inline-block`.
- `display: none`은 공간까지 제거, `visibility: hidden`은 공간은 유지.

관련 노트: [[how-css-works|CSS가 동작하는 방식: 핵심 개념과 픽셀이 되기까지]], [[logical-properties|쓰기 모드와 논리적 속성]], [[position|CSS position과 z-index]], [[css-overflow-scroll|CSS 오버플로와 스크롤: 넘침 처리와 스크롤 스냅]], [[css-borders-shadows|CSS 테두리와 그림자]]
