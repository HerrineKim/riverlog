---
title: "목록과 표 마크업"
concept: "Lists & Tables"
summary: "ul·ol·dl의 허용 자식과 중첩 규칙, ol·li의 번호 속성, dl을 div로 묶는 법, 그리고 표의 자식 순서(caption → colgroup → thead → tbody → tfoot), th·scope·headers, colspan·rowspan, colgroup·col로 열 꾸미기, 표 CSS를 정리한다. 목록인지·용어 쌍인지·표인지 고르는 기준도 함께 둔다."
tags: ["html", "semantic", "frontend", "web", "accessibility"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/html/lists", "https://web.dev/learn/html/tables"]
---

> web.dev의 「[Learn HTML](https://web.dev/learn/html)」 강좌 중 「Lists」와 「Tables」 모듈을 바탕으로 재구성한 노트다.

## 무엇으로 묶나

| 내용 | 요소 | 예 |
| --- | --- | --- |
| 순서가 없는 항목 | `<ul>` | 재료, 메뉴, 강사 소개 카드 |
| 순서·번호가 의미인 항목 | `<ol>` | 조리 순서, 브레드크럼, 법 조항 |
| 이름–값 쌍 | `<dl>` | 용어집, 상품 사양, 발표 슬라이드처럼 항목마다 제목과 설명이 붙는 내용 |
| 행과 열을 **비교·정렬·계산·교차 참조**하는 데이터 | `<table>` | 성적표, 요금 비교 |
| 썸네일 격자, 여러 단 배치 | 목록 + CSS 그리드·다단 | 이미지 갤러리 |

**표는 데이터에만 쓴다.** 회의에서 스프레드시트로 보여 줄 내용이면 표, 슬라이드로 보여 줄 내용이면 대개 `<dl>`이다. 글머리표가 보이지 않는 내비게이션·체크리스트도 목록이 맞다. 스크린 리더가 항목 개수를 알려 주기 때문이다. 보조 기술이 목록과 표를 어떻게 읽는지는 [[accessible-page-structure|접근 가능한 페이지 구조]]의 「목록」·「표」에 있다.

## 목록

### ul과 ol

- `<ul>`·`<ol>`의 자식은 **`<li>`뿐**이다. 중첩 목록은 `<li>` 안에 넣는다.
- `<li>`는 `<ul>`, `<ol>`, `<menu>`의 자식으로만 쓴다.
- `<li>` 안에는 제목, 문단, 이미지, `<blockquote>` 등 본문에 올 수 있는 모든 내용(flow content)이 들어간다.
- `</ul>`, `</ol>`은 필수다. `</li>`는 생략할 수 있지만 늘 닫는다.

```html
<ul>
  <li>
    <a href="#elements">요소</a>
    <ul>
      <li><a href="#replaced">대체 요소</a></li>
    </ul>
  </li>
  <li><a href="#attributes">속성</a></li>
</ul>
```

### 번호 제어

| 속성 | 위치 | 뜻 |
| --- | --- | --- |
| `type` | `<ol>` | `1`, `a`, `A`, `i`, `I`. CSS `list-style-type`이 덮어쓰지만, 법률 문서처럼 번호 형식이 의미면 HTML에 둔다 |
| `start` | `<ol>` | 시작 번호 |
| `reversed` | `<ol>` | **번호만** 거꾸로 센다. 항목 순서는 그대로다 |
| `value` | `<li>` (`<ol>` 안에서만) | 그 항목의 번호. 다음 항목은 거기서 이어지고, `start`보다 우선한다 |

**번호가 의미면 HTML 속성, 장식이면 CSS 카운터와 `::marker`** 로 한다. 

```html
<ol reversed start="20" type="1">
  <li>…</li>
  <li value="100">…</li>  <!-- 이 항목부터 100, 99, … -->
</ol>
```

### 목록 모양을 지울 때

`list-style: none`이나 `display: grid`를 주면 사파리 VoiceOver가 목록 의미를 지울 수 있다. 개수를 아는 것이 중요하면 `<ul role="list">`를 덧붙인다. 그 밖에는 시맨틱 요소에 같은 `role`을 다시 적지 않는다.

### 설명 목록 dl

`<dl>`은 설명 용어 `<dt>`와 설명 `<dd>`의 묶음이다. 옛 이름은 정의 목록(definition list)이었지만 용어 정의 말고도 모든 이름–값 쌍에 쓰도록 이름이 바뀌었다.

```html
<dl>
  <div>
    <dt>블렌던 스무스</dt>
    <dd>전직 마르가리타 제조기</dd>
    <dd>로드 밸런서 지망</dd>
  </div>
  <div>
    <dt>후버 숙딥</dt>
    <dd>DDoS 경찰 지망</dd>
  </div>
</dl>
```

- `<dt>` 하나에 `<dd>` 여럿, 여러 `<dt>`에 `<dd>` 하나도 된다. 각 `<dt>`에는 `<dd>`가 하나 이상 있어야 한다.
- 쌍을 스타일링하려면 `<div>`로 묶는다. `<dl>`의 자식으로 `<div>`, `<template>`, `<script>`가 허용된다.
- 암묵적 역할은 `<dt>`가 `term`, `<dd>`가 `definition`이고, `<dl>` 자체는 역할이 없다(목록이 아닐 수도 있어서다).

## 표

### 구성 요소와 순서

```text
<table>
  ├─ <caption>        표의 이름. 있으면 반드시 첫 자식
  ├─ <colgroup>       열 묶음 (안에 <col>)
  ├─ <thead>          머리글 행 묶음
  ├─ <tbody>          본문 행 묶음 (여러 개 가능)
  └─ <tfoot>          꼬리말 행 묶음
       └─ <tr>        행
            ├─ <th>   머리글 셀
            └─ <td>   데이터 셀
```

| 요소 | 핵심 |
| --- | --- |
| `<table>` | 암묵적 역할 `table`. 셀 선택·2차원 키보드 이동·재배열이 되는 위젯이면 `role="grid"`, 행이 접히면 `treegrid` |
| `<caption>` | 표의 이름을 짓는 **기본 방법**이다. 모두에게 보이고 표와 코드로 연결된다. 대신 `aria-label`·`aria-labelledby`를 쓸 수도 있다. 위치는 옛 `align` 대신 CSS `caption-side` |
| `<thead>`·`<tbody>`·`<tfoot>` | 셋 다 역할은 `rowgroup`. 접근성보다 스타일링 훅이다(머리글 고정, 본문만 스크롤). 묶지 않은 `<tr>`은 브라우저가 `<tbody>`로 감싼다. 옛 코드에서 `<tfoot>`이 `<tbody>` 앞에 있는 것은 예전 명세의 흔적이다 |
| `<th>` | 역할 `columnheader`·`rowheader`. `scope`(`col`, `row`, `colgroup`, `rowgroup`)로 방향을 정한다. 간단한 표는 브라우저가 추측하지만 명시하는 편이 안전하다 |
| `<td>` | 데이터 셀. 모든 머리글과 연결되므로 머리글 행이 스크롤로 사라져도 관계가 남는다 |

### 표가 「요점」을 말할 때

표만 봐서 결론이 바로 나오지 않으면 짧은 요약을 준다. 짧으면 `<caption>` 안에, 길면 캡션은 짧게 두고 표 앞 문단에 쓴 뒤 `aria-describedby`로 잇는다. `<figure>`에 넣고 `<figcaption>`에 요약을 써도 된다.

### 셀 합치기

| 속성 | 동작 |
| --- | --- |
| `colspan="2"` | 같은 행에서 옆 칸과 합친다 |
| `rowspan="2"` | 아래 행의 같은 칸과 합친다. 아래 행은 그 칸을 비우고 나머지 셀만 쓴다 |
| `headers="id1 id2"` | `scope`만으로 머리글 관계가 풀리지 않는 복잡한 표에서, 각 셀이 연결된 머리글 `id`를 나열한다. `<td>`·`<th>` 모두 가능 |

머리글이 여러 단이거나 셀을 많이 합친 표는 스크린 리더 지원도, 사람의 이해도 떨어진다. **합친 셀이 적은 단순한 표가 모두에게 낫다.**

### 열 꾸미기: colgroup과 col

```html
<table>
  <caption>수강생</caption>
  <colgroup>
    <col>
    <col span="2" class="scores">
  </colgroup>
  <thead>…</thead>
</table>
```

- `<colgroup>`·`<col>`은 의미가 없는 **스타일링 전용**이다. `<caption>` 뒤, 데이터 앞에 둔다. 여러 열이면 `span`.
- 적용되는 속성은 `width`, `background`, `border`, `visibility` 정도로 적다. 셀은 `<col>`의 자손이 아니라 스타일을 **상속하지 않는다**.
- 배경은 표 → 열 묶음 → 열 → 행 묶음 → 행 → 셀 순으로 쌓인다. 셀 배경이 맨 위다.

### 표 CSS

| 하고 싶은 일 | CSS |
| --- | --- |
| 셀 테두리 겹치기 / 셀 간격 | `border-collapse: collapse` / `border-spacing` (`collapse`면 무시된다). 옛 `cellpadding`·`cellspacing` 속성 대신 |
| 빈 셀 숨기기 | `border-collapse: separate`일 때 `empty-cells: hide` |
| 줄무늬 | `tbody tr:nth-of-type(odd) { background: rgb(0 0 0 / 0.1) }`. 반투명이면 열 배경이 비친다 |
| 머리글 고정 | `thead th { position: sticky; top: 0 }` |

`colspan`이 있는 표에서 `tr > :nth-child(2)` 같은 선택자는 행마다 다른 열을 고를 수 있다. 표는 기본적으로 **내용에 맞춰 크기가 정해질 뿐 반응형이 아니다.** 좁은 화면을 위해 표 요소의 `display`를 바꾸면 일부 브라우저가 표 의미를 버리므로, 그때는 `role="table"`, `role="row"`, `role="cell"` 등을 명시한다.

### 레이아웃에 표를 쓰지 않는다

제목 + 목록이 필요하면 제목과 목록을, 여러 단이 필요하면 CSS 다단 레이아웃을, 격자가 필요하면 CSS 그리드를 쓴다. 폼 배치도 표가 필요 없다. 이미 레이아웃 표가 있다면 `role="none"`(또는 `presentation`)으로 표 의미를 지운다.

## 정리

- `<ul>`·`<ol>`의 자식은 `<li>`뿐, 중첩은 `<li>` 안에서. 번호가 의미면 `type`·`start`·`reversed`·`value`.
- 이름–값 쌍은 `<dl>`, 쌍을 묶을 때는 `<div>`.
- 표는 데이터에만. `<caption>` 첫 자식 → `<colgroup>` → `<thead>` → `<tbody>` → `<tfoot>` 순서다.
- 머리글은 `<th>`와 `scope`, 복잡하면 `headers`. 하지만 먼저 표를 단순하게 만든다.
- 열 스타일은 `<col>`로 일부만 되고, 나머지 표 모양은 CSS로 정한다.

관련 노트: [[html|HTML 기초와 HTML5]], [[accessible-page-structure|접근 가능한 페이지 구조]], [[html-links-navigation|링크와 내비게이션 마크업]], [[semantic-html|시맨틱 HTML과 문서 구조]]
