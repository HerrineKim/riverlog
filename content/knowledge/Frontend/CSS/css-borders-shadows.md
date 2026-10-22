---
title: "CSS 테두리와 그림자"
concept: "Borders and Shadows"
summary: "테두리는 style을 정해야 보이고, 색은 기본으로 currentColor를 따른다. border-radius의 타원 모서리와 아홉 조각으로 자르는 border-image, 그리고 상자에 붙는 box-shadow, 글자에 붙는 text-shadow, 투명 영역의 윤곽을 따르는 drop-shadow() 필터를 용도별로 비교한다."
tags: ["css", "frontend", "design"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/css/borders", "https://web.dev/learn/css/shadows"]
---

> web.dev의 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Borders·Shadows 모듈을 바탕으로 재구성한 노트다.

## 테두리

테두리는 박스 모델의 border 영역, 즉 그림의 액자다([[box-model|박스 모델과 display]]). 세 속성으로 이루어진다.

| 속성 | 초깃값 | 주의 |
| --- | --- | --- |
| `border-style` | `none` | **이 값을 정하지 않으면 너비·색을 줘도 보이지 않는다.** `solid`, `dashed`, `dotted`, `double`, `groove`, `ridge`, `inset`, `outset` |
| `border-width` | `medium` | `thin`·`medium`·`thick` 키워드나 길이 |
| `border-color` | `currentColor` | 지정하지 않으면 **글자색**을 따른다 |

```css
.box { color: blue; border: solid; }        /* 파란 medium 실선 */
.box { border: 1px solid red; }             /* 축약형 순서: 너비 스타일 색(순서는 자유롭지만 이 순서가 관례) */
.box { border: 2px dotted; border-inline-end: 2px solid red; }  /* 문장 끝 쪽만 빨간 실선 */
```

- `dotted`, `dashed`, 입체 스타일(`groove`, `ridge`, `inset`, `outset`)은 브라우저마다 점 간격과 음영 계산이 달라 모양이 조금씩 다르다. 픽셀 단위로 맞춰야 하면 여러 브라우저에서 확인한다.
- 변마다 `border-top-*`처럼 물리 속성으로, 또는 `border-block-start`, `border-inline-end`처럼 논리 속성으로 따로 줄 수 있다([[logical-properties|쓰기 모드와 논리적 속성]]).

### border-radius

```css
.a { border-radius: 1em; }                       /* 네 모서리 같게 */
.b { border-radius: 1em 2em 3em 4em; }           /* 왼위 → 오위 → 오아래 → 왼아래 */
.c { border-top-left-radius: 1em 2em; }          /* 가로 반지름 1em, 세로 반지름 2em: 타원 모서리 */
.blob { border-radius: 95px 155px 148px 103px / 48px 95px 130px 203px; }  /* / 앞은 가로, 뒤는 세로 */
.pill { border-radius: 999px; }                  /* 짧은 변의 절반을 넘는 값은 줄어들어 알약 모양 */
```

모서리마다 가로·세로 반지름이 따로 있다. 값 하나만 주면 두 반지름이 같은 원형 모서리가 된다. 논리 판은 `border-start-start-radius`(블록 시작·인라인 시작), `border-end-end-radius` 같은 이름이다.

### border-image

이미지나 그라디언트로 테두리를 그린다.

| 속성 | 하는 일 |
| --- | --- |
| `border-image-source` | 이미지 `url()` 또는 그라디언트 |
| `border-image-slice` | 위·오른쪽·아래·왼쪽에서 자를 거리. 이미지를 **모서리 4 + 변 4 + 가운데 1**의 아홉 조각으로 나눈다. `fill`을 붙이면 가운데 조각을 배경처럼 채운다 |
| `border-image-width` | 테두리 이미지가 그려질 두께 |
| `border-image-outset` | 테두리를 박스 바깥으로 밀어내는 거리 |
| `border-image-repeat` | 변 조각을 채우는 방식. `stretch`(기본), `repeat`, `round`, `space`: `background-repeat`와 같은 뜻 |

```css
.frame {
  border: 20px solid;          /* border-style이 있어야 그려진다 */
  border-image: url(frame.png) 61 58 51 48 / 20px round;
}
.gradient-border { border: 4px solid; border-image: linear-gradient(45deg, deeppink, orange) 1; }
```

`border-image`를 쓰면 `border-radius`가 테두리 이미지에 적용되지 않는다. 둥근 그라디언트 테두리는 배경 두 겹(`padding-box` 위 단색, `border-box` 위 그라디언트)으로 만드는 편이 낫다.

## 그림자 세 가지

| | `box-shadow` | `text-shadow` | `filter: drop-shadow()` |
| --- | --- | --- | --- |
| 무엇의 그림자 | 박스 모양(`border-radius` 반영) | 글자 | 그려진 픽셀의 **투명하지 않은 윤곽** |
| 값 | x y 흐림 **퍼짐** 색, `inset` | x y 흐림 색 | x y 흐림 색 |
| 퍼짐(spread)·`inset` | 있음 | 없음 | 없음 |
| 여러 개 | 쉼표로 | 쉼표로 | `drop-shadow()`를 여러 번 이어 쓴다 |
| 어울리는 곳 | 카드, 버튼의 높이감, 안쪽 그림자 | 글자 입체 효과, 이미지 위 글자 가독성 | 배경을 따낸 PNG·SVG, 말풍선 꼬리처럼 박스가 아닌 모양 |

```css
.card { box-shadow: 0 1px 2px rgb(0 0 0 / 10%), 0 8px 24px rgb(0 0 0 / 12%); }   /* 가까운 그림자 + 먼 그림자 */
.pressed { box-shadow: inset 0 2px 6px rgb(0 0 0 / 25%); }
.title { text-shadow: 1px 1px 0 white, 2px 2px 0 firebrick; }
.product-cutout { filter: drop-shadow(0 4px 10px rgb(0 0 0 / 30%)); }
```

- 값 순서: 가로 오프셋(양수면 오른쪽), 세로 오프셋(양수면 아래), 흐림 반경, 퍼짐 반경, 색. 색을 빼면 글자색(`currentColor`)을 쓴다.
- `box-shadow`와 `outline`은 margin 영역에 겹쳐 그려질 뿐 **박스 크기에 영향을 주지 않는다.**
- 부모에 `overflow: hidden`이 있으면 그림자도 잘린다.
- `box-shadow`는 박스 안쪽에서 잘려 반투명 박스 뒤로 그림자가 비치지 않는다. `text-shadow`는 잘리지 않아 반투명 글자 뒤로 그림자가 보인다.
- `drop-shadow()`를 여러 번 쓰면 앞 그림자까지 포함한 결과에 다음 그림자가 붙는다.
- 그림자는 Windows 고대비 모드에서 그려지지 않는다. **포커스 표시를 `box-shadow`로만 하지 않는다**([[keyboard-accessibility|키보드 접근성과 포커스 관리]]).
- 그림자 전환은 매 프레임 다시 그리므로 큰 영역에서는 무겁다. 그림자를 가진 가상 요소의 `opacity`를 전환하는 방법이 가볍다.

## 정리

- 테두리는 `border-style`이 있어야 보이고, 색은 기본으로 글자색이다.
- `border-radius`는 모서리마다 가로·세로 반지름을 가진다. `/`로 타원 모서리를 만든다.
- `border-image`는 이미지를 아홉 조각으로 잘라 모서리와 변에 붙인다.
- 상자에는 `box-shadow`, 글자에는 `text-shadow`, 투명 배경 이미지에는 `drop-shadow()`.

관련 노트: [[css-backgrounds-gradients|CSS 배경과 그라디언트]], [[box-model|박스 모델과 display]], [[css-visual-effects|CSS 시각 효과: 필터, 블렌드 모드, 클리핑, 마스킹]], [[logical-properties|쓰기 모드와 논리적 속성]]
