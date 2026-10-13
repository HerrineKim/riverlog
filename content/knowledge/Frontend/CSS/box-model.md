---
title: "박스 모델과 display"
concept: "Box Model"
summary: "모든 요소를 content·padding·border·margin의 네모로 다루는 박스 모델과, 배치 방식을 결정하는 display."
tags: ["css", "layout", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://mytory.net/archives/16246", "https://developer.mozilla.org/en-US/docs/Web/CSS/length"]
---

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

### shorthand

![margin·padding shorthand](/images/til/FRONTEND/CSS/CSS%EB%9E%80.assets/image-20220814220142594.png)

```css
margin: 10px;                /* 상하좌우 */
margin: 10px 20px;           /* 상하 | 좌우 */
margin: 10px 20px 30px;      /* 상 | 좌우 | 하 */
margin: 10px 20px 30px 40px; /* 상 | 우 | 하 | 좌 (시계 방향) */
```

### margin collapse

> margin collapse 규칙은 mytory 웹개발의 「[마진 병합 기능 이해하기](https://mytory.net/archives/16246)」(2024.04)를 참고해 보강했습니다.

Normal Flow에 있는 블록 요소의 **세로** margin은 더해지지 않고 **큰 쪽 하나로 합쳐진다**(margin collapsing). 가로 margin은 언제나 그대로 더해진다. `float`나 `position: absolute`로 흐름에서 빠진 요소의 margin도 합쳐지지 않는다.

병합은 다음 경우에 일어난다.

| 경우 | 무엇이 합쳐지나 | 막는 방법 |
| --- | --- | --- |
| 인접 형제 | 위 요소의 `margin-bottom`과 아래 요소의 `margin-top` | 대개 의도된 동작이라 막을 일이 드물다 |
| 부모와 첫 자식 | 자식의 `margin-top`이 부모 바깥으로 빠져나와 부모의 위 margin과 합쳐진다 | 부모에 `border`·`padding`·인라인 내용·BFC 생성·`clear` 중 하나 |
| 부모와 마지막 자식 | 자식의 `margin-bottom`이 부모 바깥으로 빠져나온다 | 부모에 `border`·`padding`·인라인 내용·`height`(`min-height`) 중 하나 |
| 빈 블록 | 자기 자신의 위·아래 margin끼리 | `border`·`padding`·인라인 내용·높이 중 하나 |

부모-자식 병합은 의도치 않게 자주 생긴다. 자식에게 준 `margin-top`이 부모 박스 안이 아니라 부모 위쪽 공백으로 나타나면 이 경우다.

```css
/* 자식 margin이 부모 밖으로 새지 않게 막는 흔한 방법 */
.parent { padding-top: 1px; }      /* 또는 border-top */
.parent { display: flow-root; }    /* 새 BFC를 만든다 */
```

### overflow

박스 안 내용이 넘칠 때의 처리. `visible`(기본, 넘쳐서 보임), `hidden`(잘라냄), `scroll`, `auto`(넘칠 때만 스크롤).

### box-sizing

기본값 `content-box`에서는 `width`가 content 영역만의 너비라 padding·border를 더하면 실제 크기가 커진다. `border-box`로 바꾸면 `width`가 border까지 포함한 크기가 되어 계산이 훨씬 쉽다.

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

요소마다 섞어 쓰면 크기 계산이 엉키므로, 위처럼 전체 선택자로 **모든 요소에 같은 방식**을 적용하는 것을 권장한다.

## display

CSS의 두 번째 원칙: **display에 따라 크기와 배치가 달라진다.**

| 값 | 줄 바꿈 | 너비 | width/height·상하 margin |
| --- | --- | --- | --- |
| `block` | 일어남(한 줄 전체 차지) | 기본적으로 부모 가로 폭 전체 | 지정 가능 |
| `inline` | 일어나지 않음(행의 일부) | 내용만큼 | **지정 불가**. 상하 여백은 `line-height`로 |
| `inline-block` | 일어나지 않음 | 내용만큼 또는 지정값 | 지정 가능 |
| `none` | — | 화면에서 제거되어 **공간도 차지하지 않음** | — |

- 블록 요소 안에는 인라인 요소가 들어갈 수 있다. (대표 블록: `div`, `p`, `ul`, `h1`… / 대표 인라인: `span`, `a`, `img`, `strong`…)
- `visibility: hidden`은 `display: none`과 달리 **공간은 차지하면서** 보이지만 않게 한다.
- `flex`, `grid` 등 레이아웃용 값은 [Flexbox](/knowledge/dictionary/frontend/css/flexbox) 노트 참고.
- 블록/인라인 구분은 HTML 4.01까지의 분류이고, HTML5부터는 콘텐츠 카테고리라는 다른 분류를 쓴다. CSS의 `display` 값으로 이해하면 된다.

## 팁: 100% vs 100vh

자식에게 `height: 100%`를 주면 **부모의 높이**를 기준으로 계산된다. 부모의 높이가 정해져 있지 않으면 기준이 없어 요소가 0 높이로 사라진 것처럼 보인다. 그래서 `html`, `body`부터 모든 조상에 `height: 100%`를 주어야 한다.

화면을 가득 채우는 게 목적이라면 뷰포트 단위를 쓰면 한 줄로 해결된다.

```css
.full-screen {
  width: 100%;          /* 100vw는 세로 스크롤바 폭까지 포함해 가로 스크롤이 생길 수 있다 */
  min-height: 100dvh;   /* 모바일 주소창이 늘고 줄어도 화면에 맞는 동적 뷰포트 높이 */
}
```

모바일 브라우저에서 `100vh`는 주소창이 접혔을 때의 높이라 화면보다 길어진다. `dvh`(동적), `svh`(가장 작을 때), `lvh`(가장 클 때) 단위로 의도를 고른다. 모든 주요 브라우저가 지원한다.

## 핵심 정리

- 박스 = content + padding + border + margin. 세로 margin은 형제·부모-자식·빈 블록에서 큰 쪽 하나로 합쳐지고, 가로 margin은 합쳐지지 않는다.
- `box-sizing: border-box`를 전역으로 적용하면 크기 계산이 단순해진다.
- `inline`은 width/height와 상하 margin을 무시한다. 필요하면 `inline-block`.
- `display: none`은 공간까지 제거, `visibility: hidden`은 공간은 유지.

관련 노트: [[how-css-works|CSS가 동작하는 방식: 핵심 개념과 픽셀이 되기까지]], [[logical-properties|쓰기 모드와 논리적 속성]], [[position|CSS position과 z-index]]
