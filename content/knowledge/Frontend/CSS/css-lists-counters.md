---
title: "CSS 목록과 카운터"
concept: "CSS Counters"
summary: "목록 항목은 display: list-item이라 ::marker를 가진다. list-style로 기호 종류·위치·이미지를 바꾸고, ::marker로 기호를 직접 꾸미고, @counter-style로 새 번호 체계를 만든다. counter-reset·counter-increment·counter()·counters()로 각주·절 번호·중첩 번호를 매기는 법과 reversed 목록까지 정리한다."
tags: ["css", "html", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/css/lists", "https://web.dev/learn/css/counters", "https://developer.mozilla.org/en-US/docs/Web/CSS/@counter-style"]
---

> web.dev의 「[Learn CSS](https://web.dev/learn/css)」 강좌의 Lists·Counters 모듈을 바탕으로, `@counter-style` 지원은 MDN으로 확인해 재구성한 노트다.

## 목록의 구조

| 목록 | 항목 | 기본 기호 |
| --- | --- | --- |
| `<ul>` 순서 없는 목록 | `<li>` | 점(disc) |
| `<ol>` 순서 있는 목록 | `<li>` | 숫자 |
| `<dl>` 설명 목록 | `<dt>` 용어 + `<dd>` 설명 | 없음 |

`<li>`가 기호를 갖는 이유는 브라우저 기본 스타일이 `display: list-item`을 주기 때문이다. list-item 박스는 **마커 박스(marker box)**를 하나 만들고, 그 안에 기호가 들어간다. 이 마커 박스가 `::marker` 가상 요소다.

## list-style

목록 전체(또는 항목)에 주는 세 속성과 축약형이다.

| 속성 | 값 | 비고 |
| --- | --- | --- |
| `list-style-type` | `disc`, `circle`, `square`, `decimal`, `lower-roman`, `hangul`, `korean-hangul-formal`, 문자열(`"→ "`), `@counter-style` 이름 | 수십 가지 언어별 번호 체계가 내장돼 있다 |
| `list-style-position` | `outside`(기본), `inside` | `outside`는 기호가 내용 바깥에 걸린다. `inside`는 기호가 첫 줄 내용의 일부가 된다 |
| `list-style-image` | `url()`, 그라디언트, `none` | 크기·위치 조절이 어렵다. 세밀하게 바꾸려면 `::marker`나 `::before`를 쓴다 |
| `list-style` | 세 값을 순서 무관하게 | 타입과 이미지를 함께 주면 이미지가 실패할 때 타입이 폴백이다 |

```css
ul.plain { list-style: none; padding-inline-start: 0; }   /* 리셋 */
ol.steps { list-style: upper-roman inside; }
```

`list-style: none`은 Safari에서 VoiceOver가 목록으로 읽지 않게 만든다. 의미상 목록이면 `<ul role="list">`를 함께 쓴다.

## ::marker

```css
li::marker { color: var(--accent); font-weight: 700; }
ul ::marker { font-size: 1.5em; }
summary::marker { content: "+ "; }
details[open] summary::marker { content: "− "; }
```

`::marker`에는 **일부 속성만** 쓸 수 있다.

| 쓸 수 있다 | 쓸 수 없다 |
| --- | --- |
| `color`, `content`, `font-*`, `white-space`, `direction`, `unicode-bidi`, `animation-*`, `transition-*` | `background`, `padding`, `margin`, `border`, `display` 등 박스 속성 |

배경이나 여백이 필요한 장식 기호는 `list-style: none` 뒤에 `li::before`로 만든다. 브라우저 기본 `::marker` 스타일에는 `font-variant-numeric: tabular-nums`(숫자 폭 고정)가 들어 있어 번호 정렬이 맞는다. `::marker`는 `::before`보다 앞에 놓인다.

### display: list-item

`<li>`가 아닌 요소도 `display: list-item`을 주면 마커를 가진다. 제목 앞에 매달린 기호처럼 순수한 장식에 쓴다. 하지만 **보조 기술은 여전히 원래 요소로 읽는다.** 내용이 목록이면 반드시 `<ul>`·`<ol>`과 `<li>`로 마크업한다.

## 번호 체계 만들기: @counter-style

내장 번호 체계로 부족하면 직접 정의한다. W3C의 「Ready-made Counter Styles」에 45개 문자 체계, 181개 스타일이 이미 정의돼 있어 복사해 쓸 수 있다. Safari 17부터 지원해 모든 주요 브라우저에서 쓸 수 있다.

```css
@counter-style thumbs {
  system: cyclic;          /* cyclic | numeric | alphabetic | symbolic | additive | fixed */
  symbols: "👍" "👌" "✌️";
  suffix: " ";
}
@counter-style circled-ko {
  system: fixed;
  symbols: "㉠" "㉡" "㉢" "㉣" "㉤";
  fallback: hangul-consonant;   /* 다 쓰면 넘어갈 체계 */
}
ul.fun { list-style-type: thumbs; }
```

`prefix`, `suffix`, `pad`(자릿수 채우기), `range`, `negative` 같은 설명자도 있다.

## 카운터

리스트 스타일이 **기호의 모양**을 정한다면, 카운터는 **표시할 값**을 정한다. 브라우저는 `<li>`마다 1씩 오르는 `list-item`이라는 카운터를 자동으로 만든다. 직접 만든 카운터는 목록이 아닌 요소도 셀 수 있다.

| 도구 | 하는 일 |
| --- | --- |
| `counter-reset: 이름 [시작값]` | 카운터를 **새로 만든다**(보통 세려는 요소들의 부모에) |
| `counter-increment: 이름 [증감]` | 이 요소가 그려질 때마다 값을 바꾼다. 기본 +1 |
| `counter-set: 이름 값` | **이미 있는** 카운터의 값만 바꾼다. 새로 만들지 않는다 |
| `counter(이름, 스타일?)` | 가장 안쪽 카운터 값을 `content`에 넣는다 |
| `counters(이름, "구분자", 스타일?)` | 중첩된 같은 이름 카운터를 전부 이어 붙인다 |

```css
/* 절·문단 번호가 붙은 각주 */
body { counter-reset: section note; }
h2   { counter-increment: section; counter-reset: paragraph; }
p    { counter-increment: paragraph; }
a.footnote { counter-increment: note; }
a.footnote::after {
  content: "(" counter(section) "-" counter(paragraph) " 주" counter(note) ")";
  font-size: small; vertical-align: super;
}

/* 중첩 목록을 1, 1.1, 1.1.1로 */
li::marker { content: counters(list-item, ".") ". "; }
```

`<ul>`·`<ol>`마다 `list-item` 카운터가 새로 생긴다. 그래서 중첩 목록에서 `counter()`는 가장 안쪽 번호만 주고, 전체 경로는 `counters()`로 얻는다.

### 거꾸로 세기

카운터는 0에서 시작해 첫 항목에서 1이 된다. 끝에서 1로 줄어드는 목록은 `<ol reversed>`를 쓴다. 기본 마커는 알아서 맞지만, **직접 만든 카운터**를 쓴다면 `counter-increment`에 음수를 주고 시작값(항목 수 + 1)을 직접 계산해야 한다. 내용이 바뀌는 목록이라면 기본 `list-item` 카운터를 쓰는 편이 안전하다.

## 정리

- `<li>`는 `display: list-item`이라 `::marker`를 가진다.
- 기호 종류·위치는 `list-style`, 기호 꾸미기는 `::marker`(색·글꼴·`content`만), 박스가 필요한 장식은 `::before`.
- 새 번호 체계는 `@counter-style`로 정의한다. 대부분 이미 만들어져 있다.
- 목록 밖의 번호는 `counter-reset` → `counter-increment` → `counter()`, 중첩 번호는 `counters()`.
- 모양을 바꿔도 의미는 HTML이 진다. 목록은 목록 요소로.

관련 노트: [[selectors|CSS 선택자와 우선순위]], [[semantic-html|시맨틱 HTML과 문서 구조]], [[css-functions|CSS 함수: calc()·clamp()와 수학 함수]]
