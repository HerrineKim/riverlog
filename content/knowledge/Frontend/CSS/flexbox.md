---
title: "Float와 Flexbox 레이아웃"
concept: "Flexbox"
summary: "Normal Flow를 벗어나 요소를 배치하는 float와, 축을 기준으로 아이템을 정렬하는 1차원 레이아웃 모델 Flexbox."
tags: ["css", "layout", "flexbox", "frontend"]
source: til
---

블록은 위에서 아래로, 인라인은 왼쪽에서 오른쪽으로 쌓이는 Normal Flow만으로는 "옆으로 나란히", "가운데 정렬", "남은 공간 나눠 갖기" 같은 레이아웃을 만들기 어렵다. 예전에는 `float`로 이를 해결했고, 지금은 대부분 **Flexbox**와 **Grid**로 처리한다.

## Float

박스를 왼쪽 또는 오른쪽으로 띄워, 텍스트 같은 인라인 요소들이 그 주변을 감싸도록(wrapping) 한다. 원래 신문처럼 이미지 옆에 글이 흐르게 하려고 만든 속성이다.

![float 예시](/images/til/FRONTEND/CSS/CSS-Layout-float-flexbox-grid-.assets/image-20220824101847889.png)

```css
.box {
  width: 150px;
  height: 150px;
  border: 1px solid black;
  margin-right: 30px;
}

.left { float: left; } /* none(기본) | left | right */
```

### Clearing Float

float된 요소는 Normal Flow에서 벗어나 떠 있기 때문에, 이후 요소들이 그 밑으로 파고들거나 부모가 높이를 잃는다. 그래서 **부모에 clearfix**를 적용해 float의 영향을 끊는다.

```css
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}
```

`::after`로 부모의 마지막 자식 자리에 가상 요소를 만들고 `clear: both`를 주는 방식이다. Flexbox·Grid 등장 이후 float로 레이아웃을 짜는 일은 크게 줄었고, 지금은 본래 용도(글 감싸기)에 주로 쓴다.

## Flexbox

![Flexbox 구조](/images/til/FRONTEND/CSS/CSS-Layout-float-flexbox-grid-.assets/image-20220824102559063.png)

행 또는 열 **한 방향**으로 아이템을 배치하는 1차원 레이아웃 모델이다. 수동으로 값을 계산하지 않아도 정렬과 공간 분배를 해 준다.

- **Flex Container**(부모): `display: flex` 또는 `inline-flex`를 준 요소
- **Flex Item**(자식): 컨테이너 안의 박스들
- **main axis**(주축): 아이템이 나열되는 방향 / **cross axis**(교차축): 주축에 수직인 방향

```css
.flex-container {
  display: flex;
}
```

### 컨테이너 속성

| 분류 | 속성 | 설명 |
| --- | --- | --- |
| 배치 | `flex-direction` | 주축 방향: `row`(기본), `row-reverse`, `column`, `column-reverse` |
| 배치 | `flex-wrap` | 넘칠 때 줄바꿈 여부: `nowrap`(기본, 한 줄에 욱여넣음), `wrap` |
| 배치 | `flex-flow` | `flex-direction`과 `flex-wrap`의 축약. 예: `flex-flow: row nowrap;` |
| 공간 나누기 | `justify-content` | **주축** 방향 공간 분배 |
| 공간 나누기 | `align-content` | **교차축** 방향 공간 분배(여러 줄일 때만 의미 있음) |
| 정렬 | `align-items` | 모든 아이템을 교차축 기준으로 정렬 |

![flex-direction](/images/til/FRONTEND/CSS/CSS-Layout-float-flexbox-grid-.assets/image-20220824103520725.png)

`-reverse` 방향은 화면 순서가 HTML 선언 순서와 달라져, 스크린 리더·키보드 탐색 순서와 어긋날 수 있다(접근성 주의).

#### justify-content / align-content 값

![justify-content](/images/til/FRONTEND/CSS/CSS-Layout-float-flexbox-grid-.assets/image-20220824104802744.png)

| 값 | 의미 |
| --- | --- |
| `flex-start` | 축의 시작점으로 모음(기본값) |
| `flex-end` | 축의 끝으로 모음 |
| `center` | 가운데로 모음 |
| `space-between` | 양 끝을 붙이고 아이템 **사이** 간격을 균등하게 |
| `space-around` | 각 아이템 **둘레**에 같은 여백(양 끝 여백은 사이 간격의 절반) |
| `space-evenly` | 양 끝을 포함한 **모든** 간격을 균등하게 |

#### align-items / align-self 값

![align-items](/images/til/FRONTEND/CSS/CSS-Layout-float-flexbox-grid-.assets/image-20221015143757312.png)

| 값 | 의미 |
| --- | --- |
| `stretch` | 교차축 방향으로 컨테이너를 가득 채움(기본값) |
| `flex-start` / `flex-end` | 교차축의 시작 / 끝 |
| `center` | 가운데 |
| `baseline` | 텍스트 기준선을 맞춤 |

### 아이템 속성

| 속성 | 설명 |
| --- | --- |
| `align-self` | **개별 아이템**의 교차축 정렬. 컨테이너가 아니라 아이템에 준다 |
| `flex-grow` | 남은 공간을 아이템에 나눠 주는 비율 |
| `flex-shrink` | 공간이 부족할 때 줄어드는 비율 |
| `flex-basis` | 늘거나 줄기 전의 기본 크기 |
| `flex` | `grow shrink basis` 축약. 예: `flex: 1` |
| `order` | 배치 순서(작을수록 앞). HTML 순서는 그대로다 |

```css
.item-1 { flex-grow: 1; order: 3; }
.item-2 { flex-grow: 1; }
.item-3 { order: 1; }
```

### 자주 쓰는 패턴: 가운데 정렬

```css
.center {
  display: flex;
  justify-content: center; /* 가로(주축) */
  align-items: center;     /* 세로(교차축) */
}
```

## Flexbox와 Grid

Flexbox는 **한 방향**(행 또는 열)의 배치에, Grid는 행과 열을 **동시에** 다루는 2차원 배치에 적합하다. 두 가지로 대부분의 레이아웃을 구성할 수 있다. React Native의 레이아웃도 Flexbox 기반이다([React Native 스타일링](/knowledge/dictionary/frontend/mobile/react-native-basics) 참고).

## 핵심 정리

- float는 Normal Flow를 벗어나므로 부모에 clearfix가 필요하다. 레이아웃 용도로는 거의 쓰지 않는다.
- Flexbox: 부모에 `display: flex`, 주축은 `justify-content`, 교차축은 `align-items`.
- `align-self`, `flex-grow`, `order`는 **아이템**에 주는 속성이다.
