---
title: "Float와 Flexbox 레이아웃"
concept: "Flexbox"
summary: "Normal Flow를 벗어나 요소를 배치하는 float와, 축을 기준으로 아이템을 정렬하는 1차원 레이아웃 모델 Flexbox. display: flex를 선언하면 적용되는 초깃값과 내용 기반 공간 분배, 쓰기 모드에 따라 바뀌는 축까지."
tags: ["css", "layout", "flexbox", "frontend"]
source: mixed
sources: ["https://heewon26.tistory.com/298", "https://webactually.com/2018/09/18/%ed%94%8c%eb%a0%89%ec%8a%a4%eb%b0%95%ec%8a%a4-%ed%94%8c%eb%a0%89%ec%8a%a4-%ec%bb%a8%ed%85%8c%ec%9d%b4%eb%84%88%eb%a5%bc-%eb%a7%8c%eb%93%a4-%eb%95%8c-%eb%ac%b4%ec%8a%a8-%ec%9d%bc%ec%9d%b4-%eb%b2%8c/"]
date: "2026-10-12"
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

## display: flex를 선언하면 생기는 일

> Rachel Andrew의 「[플렉스박스 플렉스 컨테이너를 만들 때 무슨 일이 벌어질까?](https://webactually.com/2018/09/18/%ed%94%8c%eb%a0%89%ec%8a%a4%eb%b0%95%ec%8a%a4-%ed%94%8c%eb%a0%89%ec%8a%a4-%ec%bb%a8%ed%85%8c%ec%9d%b4%eb%84%88%eb%a5%bc-%eb%a7%8c%eb%93%a4-%eb%95%8c-%eb%ac%b4%ec%8a%a8-%ec%9d%bc%ec%9d%b4-%eb%b2%8c/)」(2018.09, 웹액츄얼리 번역)를 바탕으로 재구성한 내용입니다.

`display: flex`는 `display: block flex`의 줄임이다. **바깥쪽**은 블록이라 컨테이너 자신은 일반 블록처럼 놓이고, **안쪽**은 flex라 자식이 플렉스 아이템이 된다. `inline-flex`는 `inline flex`다. 아무것도 더 쓰지 않으면 다음 초깃값이 동작한다.

| 속성 | 초깃값 | 결과 |
| --- | --- | --- |
| `flex-direction` | `row` | 인라인 방향으로 나열. 가로쓰기·왼→오면 왼쪽부터, RTL이면 오른쪽부터, 세로쓰기면 위부터 |
| `justify-content` | `flex-start` | 주축 시작에 모인다. 남는 공간이 없으면 어떤 값이든 효과가 없다 |
| `align-items` | `stretch` | 가장 높은 아이템에 맞춰 모두 늘어난다 |
| `flex-grow` | `0` | 남는 공간이 있어도 커지지 않는다 |
| `flex-shrink` | `1` | 공간이 모자라면 줄어든다 |
| `flex-basis` | `auto` | 크기를 정하지 않았으면 `max-content`(한 줄로 늘였을 때 크기)에서 출발 |

줄어들 때는 `flex-shrink` 값에 **기본 크기를 곱한 비율**로 줄어든다. 내용이 많은 아이템은 덜 줄고 짧은 아이템이 먼저 사라지지 않는다. 그래서 따로 크기를 주지 않아도 **내용에 비례해 공간을 나눠 갖는다.** 이것이 플렉스박스를 쓰는 핵심 이유다.

`row-reverse`, `column-reverse`는 순서를 바꾸는 것이 아니라 **주축의 시작점(main-start)을 반대편으로 옮길 뿐**이다. 키보드·스크린 리더 순서는 소스 그대로다. 행과 열이 쓰기 모드를 따르는 원리는 [[logical-properties|쓰기 모드와 논리적 속성]]에 있다.

## 함정: flex 아이템이 컨테이너를 넘칠 때

> 곽빵의 「[flexbox에서 가변요소의 자식 width가 부모 width를 넘을 때](https://heewon26.tistory.com/298)」(2021.09)를 요약·재구성한 내용입니다.

`flex: 1`인 아이템 안에 긴 한 줄 텍스트를 넣고 말줄임(`…`)을 걸었는데, 말줄임은 안 되고 텍스트가 컨테이너 밖으로 삐져나오는 경우가 있다.

```css
.container { display: flex; width: 540px; }
.col-1 { width: 200px; }
.col-2 { flex: 1; }            /* 남은 340px을 차지해야 하는데… */
.col-2 p {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;     /* 동작하지 않는다 */
}
```

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| `overflow: hidden`·`text-overflow: ellipsis`가 안 먹고 아이템이 컨테이너보다 넓어진다 | flex 아이템의 `min-width` 기본값이 `0`이 아니라 **`auto`**다. `auto`는 "콘텐츠 최소 크기보다 작아지지 않는다"는 뜻이라, 줄바꿈 없는 긴 텍스트만큼 아이템이 늘어난다. 이 최소 크기 제약이 `flex-basis`보다 우선한다 | 아이템에 **`min-width: 0`** |

```css
.col-2 {
  flex: 1;
  min-width: 0; /* 콘텐츠 크기 대신 flex-basis 기준으로 줄어들 수 있게 */
}
```

**말줄임이 안 된다 = 요소 너비가 제한되지 않았다**는 신호다. 다른 해법과 비교하면 다음과 같다.

| 방법 | 평가 |
| --- | --- |
| 아이템에 `min-width: 0` | 권장. 원인을 직접 고친다 |
| 컨테이너에 `overflow: hidden` | 넘친 부분을 잘라 숨길 뿐이라 의도와 다른 결과가 나올 수 있다 |
| 아이템에 `max-width: calc(100vw - 고정폭)` | 레이아웃 수치에 묶여 깨지기 쉽다. 비추천 |

`flex-direction: column`이면 같은 문제가 높이에서 생기므로 `min-height: 0`을 준다.

## Flexbox와 Grid

Flexbox는 **한 방향**(행 또는 열)의 배치에, Grid는 행과 열을 **동시에** 다루는 2차원 배치에 적합하다. 두 가지로 대부분의 레이아웃을 구성할 수 있다. 아이템에 `%` 너비를 주고 `flex-grow: 0`으로 막고 있다면 2차원 배치가 필요하다는 신호다([[css-grid|CSS 그리드 레이아웃]]). React Native의 레이아웃도 Flexbox 기반이다([React Native 스타일링](/knowledge/dictionary/frontend/mobile/react-native-basics) 참고).

## 핵심 정리

- float는 Normal Flow를 벗어나므로 부모에 clearfix가 필요하다. 레이아웃 용도로는 거의 쓰지 않는다.
- Flexbox: 부모에 `display: flex`, 주축은 `justify-content`, 교차축은 `align-items`.
- `align-self`, `flex-grow`, `order`는 **아이템**에 주는 속성이다.
- flex 아이템의 `min-width` 기본값은 `auto`다. 긴 텍스트 때문에 아이템이 넘치면 `min-width: 0`을 준다.
- 초깃값만으로도 아이템은 내용에 비례해 공간을 나눠 갖는다. `-reverse`는 시작점만 옮긴다.

관련 노트: [[css-grid|CSS 그리드 레이아웃]], [[logical-properties|쓰기 모드와 논리적 속성]], [[box-model|박스 모델과 display]], [[how-css-works|CSS가 동작하는 방식: 핵심 개념과 픽셀이 되기까지]]
