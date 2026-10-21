---
title: "Float와 Flexbox 레이아웃"
concept: "Flexbox"
summary: "Normal Flow를 벗어나 요소를 배치하는 float와 flow-root로 float 담기, 축을 기준으로 아이템을 정렬하는 1차원 레이아웃 모델 Flexbox. 속성의 초깃값과 flex 키워드, 내용 기반 공간 분배, auto margin으로 그룹 나누기, 쓰기 모드에 따라 바뀌는 축, min-width: auto 함정, 그리고 글을 여러 단으로 흘리는 다단 레이아웃까지."
tags: ["css", "layout", "flexbox", "frontend"]
source: mixed
sources: ["https://heewon26.tistory.com/298", "https://webactually.com/2018/09/18/%ed%94%8c%eb%a0%89%ec%8a%a4%eb%b0%95%ec%8a%a4-%ed%94%8c%eb%a0%89%ec%8a%a4-%ec%bb%a8%ed%85%8c%ec%9d%b4%eb%84%88%eb%a5%bc-%eb%a7%8c%eb%93%a4-%eb%95%8c-%eb%ac%b4%ec%8a%a8-%ec%9d%bc%ec%9d%b4-%eb%b2%8c/", "https://developer.mozilla.org/en-US/docs/Web/CSS/gap", "https://developer.mozilla.org/en-US/docs/Web/CSS/display#flow-root", "https://web.dev/learn/css/flexbox", "https://web.dev/learn/css/layout", "https://developer.mozilla.org/en-US/docs/Web/CSS/align-content"]
date: "2026-10-13"
---

> Rachel Andrew의 「[플렉스박스 플렉스 컨테이너를 만들 때 무슨 일이 벌어질까?](https://webactually.com/2018/09/18/%ed%94%8c%eb%a0%89%ec%8a%a4%eb%b0%95%ec%8a%a4-%ed%94%8c%eb%a0%89%ec%8a%a4-%ec%bb%a8%ed%85%8c%ec%9d%b4%eb%84%88%eb%a5%bc-%eb%a7%8c%eb%93%a4-%eb%95%8c-%eb%ac%b4%ec%8a%a8-%ec%9d%bc%ec%9d%b4-%eb%b2%8c/)」(2018.09, 웹액츄얼리 번역)과 곽빵의 「[flexbox에서 가변요소의 자식 width가 부모 width를 넘을 때](https://heewon26.tistory.com/298)」(2021.09)를 바탕으로 재구성하고, web.dev 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Layout·Flexbox 모듈로 보강한 노트다.

블록은 위에서 아래로, 인라인은 왼쪽에서 오른쪽으로 쌓이는 Normal Flow만으로는 "옆으로 나란히", "가운데 정렬", "남은 공간 나눠 갖기" 같은 레이아웃을 만들기 어렵다. 예전에는 `float`로 이를 해결했고, 지금은 대부분 **Flexbox**와 **Grid**로 처리한다.

## Float

박스를 왼쪽 또는 오른쪽으로 띄워, 텍스트 같은 인라인 요소들이 그 주변을 감싸도록(wrapping) 한다. 원래 신문처럼 이미지 옆에 글이 흐르게 하려고 만든 속성이다.

![float 예시](/images/til/FRONTEND/CSS/CSS-Layout-float-flexbox-grid-.assets/image-20220824101847889.png)

```css
.left { float: left; } /* none(기본) | left | right */
```

### float를 부모 안에 담기

float된 요소는 Normal Flow에서 벗어나 떠 있기 때문에, 이후 요소가 그 밑으로 파고들거나 부모가 높이를 잃는다. **부모에 `display: flow-root`를 주면** 부모가 새 블록 서식 맥락(BFC)을 만들어 float를 안에 담는다. 높이가 float까지 늘어나고, 바깥 요소와도 섞이지 않는다.

```css
.media { display: flow-root; } /* 안의 float를 품는다 */
.after-float { clear: both; }   /* 특정 요소만 float 아래로 내릴 때 */
```

과거에는 `::after` 가상 요소에 `clear: both`를 주는 clearfix 핵으로 같은 일을 했다. Flexbox·Grid 등장 이후 float로 레이아웃을 짜는 일은 크게 줄었고, 지금은 본래 용도(글 감싸기)에 주로 쓴다.

## Flexbox

![Flexbox 구조](/images/til/FRONTEND/CSS/CSS-Layout-float-flexbox-grid-.assets/image-20220824102559063.png)

행 또는 열 **한 방향**으로 아이템을 배치하는 1차원 레이아웃 모델이다. 수동으로 값을 계산하지 않아도 정렬과 공간 분배를 해 준다.

- **Flex Container**(부모): `display: flex` 또는 `inline-flex`를 준 요소
- **Flex Item**(자식): 컨테이너 안의 박스들
- **main axis**(주축): 아이템이 나열되는 방향 / **cross axis**(교차축): 주축에 수직인 방향

`display: flex`는 `display: block flex`의 줄임이다. **바깥쪽**은 블록이라 컨테이너 자신은 일반 블록처럼 놓이고, **안쪽**은 flex라 자식이 플렉스 아이템이 된다. `inline-flex`는 `inline flex`다. 아무것도 더 쓰지 않으면 아래 표의 **초깃값**이 동작한다.

### 컨테이너 속성

| 분류 | 속성 | 초깃값 | 설명 |
| --- | --- | --- | --- |
| 배치 | `flex-direction` | `row` | 주축 방향: `row`, `row-reverse`, `column`, `column-reverse`. `row`는 인라인 방향이라 가로쓰기·왼→오면 왼쪽부터, RTL이면 오른쪽부터, 세로쓰기면 위부터 나열된다 |
| 배치 | `flex-wrap` | `nowrap` | 넘칠 때 줄바꿈 여부. `nowrap`은 한 줄에 욱여넣는다 |
| 배치 | `flex-flow` | | `flex-direction`과 `flex-wrap`의 축약. 예: `flex-flow: row wrap;` |
| 공간 나누기 | `justify-content` | `flex-start` | **주축** 방향 공간 분배. 남는 공간이 없으면 어떤 값이든 효과가 없다 |
| 공간 나누기 | `align-content` | `normal` | **교차축** 방향 공간 분배(여러 줄일 때만 의미 있음) |
| 정렬 | `align-items` | `stretch` | 모든 아이템을 교차축 기준으로 정렬. 기본은 가장 높은 아이템에 맞춰 모두 늘어난다 |
| 간격 | `gap` (`row-gap`, `column-gap`) | `normal`(0) | 아이템 사이 간격. 모든 주요 브라우저가 플렉스에서도 지원해, 아이템마다 margin을 주고 마지막 것만 빼는 우회가 필요 없다 |

![flex-direction](/images/til/FRONTEND/CSS/CSS-Layout-float-flexbox-grid-.assets/image-20220824103520725.png)

`row-reverse`, `column-reverse`는 순서를 바꾸는 것이 아니라 **주축의 시작점(main-start)을 반대편으로 옮길 뿐**이다. 화면 순서가 HTML 선언 순서와 달라져도 스크린 리더·키보드 탐색 순서는 소스 그대로라 어긋날 수 있다(접근성 주의). 행과 열이 쓰기 모드를 따르는 원리는 [[logical-properties|쓰기 모드와 논리적 속성]]에 있다.

#### justify-content / align-content 값

![justify-content](/images/til/FRONTEND/CSS/CSS-Layout-float-flexbox-grid-.assets/image-20220824104802744.png)

| 값 | 의미 |
| --- | --- |
| `flex-start` / `flex-end` | 축의 시작점 / 끝으로 모음 |
| `center` | 가운데로 모음 |
| `space-between` | 양 끝을 붙이고 아이템 **사이** 간격을 균등하게 |
| `space-around` | 각 아이템 **둘레**에 같은 여백(양 끝 여백은 사이 간격의 절반) |
| `space-evenly` | 양 끝을 포함한 **모든** 간격을 균등하게 |

#### align-items / align-self 값

![align-items](/images/til/FRONTEND/CSS/CSS-Layout-float-flexbox-grid-.assets/image-20221015143757312.png)

| 값 | 의미 |
| --- | --- |
| `stretch` | 교차축 방향으로 컨테이너를 가득 채움 |
| `flex-start` / `flex-end` | 교차축의 시작 / 끝 |
| `center` | 가운데 |
| `baseline` | 텍스트 기준선을 맞춤 |

### 아이템 속성

| 속성 | 초깃값 | 설명 |
| --- | --- | --- |
| `align-self` | `auto` | **개별 아이템**의 교차축 정렬. 컨테이너가 아니라 아이템에 준다 |
| `flex-grow` | `0` | 남은 공간을 나눠 받는 비율. 초깃값이면 공간이 남아도 커지지 않는다 |
| `flex-shrink` | `1` | 공간이 부족할 때 줄어드는 비율. 초깃값이면 모자랄 때 줄어든다 |
| `flex-basis` | `auto` | 늘거나 줄기 전의 기본 크기. 크기를 정하지 않았으면 `max-content`(한 줄로 늘였을 때 크기)에서 출발 |
| `flex` | `0 1 auto` | `grow shrink basis` 축약. 예: `flex: 1`(= `1 1 0%`) |
| `order` | `0` | 배치 순서(작을수록 앞). HTML 순서는 그대로다 |

`flex` 축약형에는 자주 쓰는 키워드가 있다.

| 값 | 풀어 쓰면 | 결과 |
| --- | --- | --- |
| `flex: initial` | `0 1 auto` | 초깃값. 늘지 않고, 모자라면 줄어든다 |
| `flex: auto` | `1 1 auto` | 내용 크기(`max-content`)로 먼저 놓은 뒤 **남는 공간**을 나눈다. 내용이 큰 아이템이 더 커진다 |
| `flex: 1` | `1 1 0%` | 기본 크기를 0으로 보고 **전체 공간**을 나눈다. 내용과 상관없이 같은 크기 |
| `flex: none` | `0 0 auto` | 늘지도 줄지도 않는다. 정렬 기능만 쓰고 싶을 때 |
| `flex: 2` | `2 1 0%` | 다른 아이템이 `flex: 1`이면 두 배를 받는다. 1·2·3이면 공간을 6으로 나눠 1:2:3 |

줄어들 때는 `flex-shrink` 값에 **기본 크기를 곱한 비율**로 줄어든다. 내용이 많은 아이템은 덜 줄고 짧은 아이템이 먼저 사라지지 않는다. 그래서 따로 크기를 주지 않아도 **내용에 비례해 공간을 나눠 갖는다.** 이것이 플렉스박스를 쓰는 핵심 이유다.

### 플렉스 줄과 정렬

- `flex-wrap: wrap`으로 줄이 여러 개가 되면 **각 줄이 독립된 플렉스 컨테이너처럼** 공간을 나눈다. 2번째 줄 아이템을 1번째 줄 아이템과 세로로 맞출 수 없다. 이것이 플렉스박스가 1차원인 이유이고, 행·열을 함께 맞추려면 그리드를 쓴다.
- 감싸기 전 아이템은 `min-content` 크기까지 줄어든 뒤에야 넘친다.
- `align-content`의 초깃값은 `normal`(플렉스에서는 `stretch`처럼 동작)이라 여러 줄이 컨테이너 높이를 나눠 갖는다. 남는 공간이 있어야 효과가 있으니 컨테이너에 `block-size`를 준다.
- `place-content: <align-content> <justify-content>`는 두 값을 한 줄로 쓴다. 값 하나면 둘 다 같다.
- `flex-direction: column`에서 `justify-content`가 동작하려면 컨테이너에 높이가 있어야 한다.
- **플렉스에는 `justify-self`가 없다.** 주축에서 아이템은 묶음으로 움직이기 때문이다. 그룹을 나누려면 auto margin을 쓴다. auto margin은 그 방향의 남는 공간을 모두 흡수한다.

```css
.toolbar { display: flex; gap: .5rem; }
.toolbar .spacer-start { margin-inline-start: auto; }   /* 이 아이템부터 오른쪽(인라인 끝)으로 밀린다 */
```

### 자주 쓰는 패턴: 가운데 정렬

```css
.center {
  display: flex;
  justify-content: center; /* 가로(주축) */
  align-items: center;     /* 세로(교차축) */
}
```

박스 정렬 속성은 플렉스 전용이 아니다. 블록 컨테이너에서도 `align-content: center`로 자식을 세로 가운데 놓을 수 있다. Chrome 123, Firefox 125, Safari 17.4부터 모든 주요 브라우저가 지원한다(Baseline 2024). 과거에는 정렬만 하려고 컨테이너를 플렉스로 바꿨다.

```css
.hero { min-block-size: 50vh; align-content: center; }   /* display: flex 없이 세로 가운데 */
```

## 함정: flex 아이템이 컨테이너를 넘칠 때

`flex: 1`인 아이템 안에 긴 한 줄 텍스트를 넣고 말줄임(`…`)을 걸었는데, 말줄임은 안 되고 텍스트가 컨테이너 밖으로 삐져나오는 경우가 있다.

```css
.container { display: flex; width: 540px; }
.col-1 { width: 200px; }
.col-2 {
  flex: 1;
  min-width: 0;                /* 이 줄이 없으면 아래 말줄임이 동작하지 않는다 */
}
.col-2 p {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| `overflow: hidden`·`text-overflow: ellipsis`가 안 먹고 아이템이 컨테이너보다 넓어진다 | flex 아이템의 `min-width` 기본값이 `0`이 아니라 **`auto`**다. `auto`는 "콘텐츠 최소 크기보다 작아지지 않는다"는 뜻이라, 줄바꿈 없는 긴 텍스트만큼 아이템이 늘어난다. 이 최소 크기 제약이 `flex-basis`보다 우선한다 | 아이템에 **`min-width: 0`** |

**말줄임이 안 된다 = 요소 너비가 제한되지 않았다**는 신호다. 다른 해법과 비교하면 다음과 같다.

| 방법 | 평가 |
| --- | --- |
| 아이템에 `min-width: 0` | 권장. 원인을 직접 고친다 |
| 컨테이너에 `overflow: hidden` | 넘친 부분을 잘라 숨길 뿐이라 의도와 다른 결과가 나올 수 있다 |
| 아이템에 `max-width: calc(100vw - 고정폭)` | 레이아웃 수치에 묶여 깨지기 쉽다. 비추천 |

`flex-direction: column`이면 같은 문제가 높이에서 생기므로 `min-height: 0`을 준다.

## 다단 레이아웃

국가 목록처럼 긴 목록이나 신문 기사처럼 **글이 한 단에서 다음 단으로 이어 흘러야** 하면 다단(multicolumn) 레이아웃을 쓴다. 플렉스·그리드로 만든 열은 서로 독립된 칸이라 내용이 이어 흐르지 않는다.

```css
.countries { column-count: 2; column-gap: 1em; }       /* 단 개수 고정 */
.articles  { column-width: 260px; column-gap: 1em; }   /* 최소 단 너비: 공간에 따라 단 수가 자동으로 바뀐다 */
.articles h2 { column-span: all; }                     /* 제목은 모든 단을 가로질러 */
.articles figure { break-inside: avoid; }              /* 그림이 단 사이에서 쪼개지지 않게 */
```

`column-width`만 주면 미디어 쿼리 없이 반응형이 된다. 단 높이가 화면보다 길면 독자가 위아래로 오가며 읽어야 하므로, 화면에서는 짧은 목록에 주로 쓴다.

## Flexbox와 Grid

Flexbox는 한 방향, Grid는 행과 열을 동시에 다룬다. 어느 쪽을 고를지는 [[css-grid#3. 그리드와 플렉스박스는 문제에 맞춰 고른다|CSS 그리드 레이아웃의 선택 기준표]]에 있다. React Native의 레이아웃도 Flexbox 기반이다([React Native 스타일링](/knowledge/dictionary/frontend/mobile/react-native-basics) 참고).

## 핵심 정리

- float는 Normal Flow를 벗어난다. 부모에 `display: flow-root`를 주면 float를 담는다. 레이아웃 용도로는 거의 쓰지 않는다.
- Flexbox: 부모에 `display: flex`, 주축은 `justify-content`, 교차축은 `align-items`.
- `align-self`, `flex-grow`, `order`는 **아이템**에 주는 속성이다.
- 초깃값만으로도 아이템은 내용에 비례해 공간을 나눠 갖는다. `-reverse`는 시작점만 옮긴다.
- 같은 크기로 나누려면 `flex: 1`, 내용 크기 기반이면 `flex: auto`, 고정이면 `flex: none`.
- 아이템 하나를 떼어 놓을 땐 `justify-self` 대신 auto margin.
- 글을 여러 단으로 이어 흘리려면 다단 레이아웃(`column-width`).
- flex 아이템의 `min-width` 기본값은 `auto`다. 긴 텍스트 때문에 아이템이 넘치면 `min-width: 0`을 준다.

관련 노트: [[css-grid|CSS 그리드 레이아웃]], [[logical-properties|쓰기 모드와 논리적 속성]], [[box-model|박스 모델과 display]], [[css-overflow-scroll|CSS 오버플로와 스크롤: 넘침 처리와 스크롤 스냅]], [[how-css-works|CSS가 동작하는 방식: 핵심 개념과 픽셀이 되기까지]], [[devtools-elements-css|DevTools로 DOM과 CSS 다루기]]

더 읽을거리: 게임과 실험 도구로 익히기 — [Flexbox Froggy](https://flexboxfroggy.com/#ko), [flexbox.help](https://flexbox.help/)(속성을 바꿔 보며 결과 확인)
