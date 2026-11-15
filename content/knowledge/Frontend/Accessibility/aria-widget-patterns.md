---
title: "복합 위젯의 ARIA 패턴: 콤보박스·날짜 선택기·메뉴·상태 알림"
concept: "ARIA Widget Patterns"
summary: "네이티브 요소가 없는 복합 위젯을 스크린 리더가 이해하고 조작할 수 있게 만드는 패턴. 자동완성 콤보박스, 날짜 선택기(grid)와 날짜 직접 입력, 사이트 메뉴와 menubar의 구분, 수량 조절 버튼, 정렬 표, 페이지 번호, 툴팁, 좌석 배치 같은 2차원 선택, 그리고 로딩·토스트·글자 수·실시간 검증 같은 상태 알림을 정리한다."
tags: ["frontend", "accessibility", "aria", "html", "javascript"]
source: other
date: "2026-10-18"
sources: ["https://www.youtube.com/playlist?list=PLtaz5vK7MbK0wauPYD9VtgkwX2Bx_Ygo3", "https://www.w3.org/WAI/ARIA/apg/patterns/", "https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html", "https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html", "https://webaim.org/presentations/2024/january/"]
---

> AOA11Y(Academy Of Accessibility)의 강의 연재 「[항공사의 ARIA 적용 사례 살펴보기](https://www.youtube.com/playlist?list=PLtaz5vK7MbK0wauPYD9VtgkwX2Bx_Ygo3)」(2019~, 1~36탄)를 바탕으로 재구성하고, 현재 W3C ARIA Authoring Practices Guide(APG)에 맞춰 보강한 노트다.
> 토스트의 포커스와 알림 대기열 부분은 WebAIM의 교육 자료 「[Web Accessibility Training](https://webaim.org/presentations/2024/january/)」(Jon Whiting·Jared Smith, 2024.01)을 바탕으로 보강했다.

## 왜 복합 위젯이 문제인가

탭, 콤보박스, 날짜 선택기, 대화 상자처럼 직접 만든 위젯은 모양·위치·색으로 역할과 상태를 **눈에만** 보여 준다. 스크린 리더 사용자에게는 그 위젯이 무엇인지(role), 지금 어떤 상태인지(state), 어떻게 조작하는지가 전달되지 않아 **이해할 수도, 조작할 수도 없다.** WCAG 4.1.2 Name, Role, Value(A) 위반이다.

이 문제는 체크리스트형 점검에서 잘 드러나지 않는다. 대체 텍스트·제목·레이블처럼 네이티브 요소 중심의 항목은 통과해도, 예약·검색·결제 흐름의 핵심 위젯이 스크린 리더로는 전혀 쓰이지 않을 수 있다. 실제 스크린 리더로 핵심 과업을 끝까지 해 봐야 드러난다([[screen-reader-testing|스크린 리더로 테스트하기]]).

### 고르는 순서

```text
1. 네이티브 요소로 되나?      <select>, <input type="date">, <details>, <dialog>, <button>
2. 안 되면 APG 패턴을 따른다   role·state·property와 키 조작을 패턴 그대로
3. 지원이 고르지 않은 속성은   실제 스크린 리더·브라우저 조합으로 확인하고, 안 되면 더 넓게 지원되는 방법으로
```

- 접근성을 갖추지 않은 위젯 라이브러리를 고쳐 쓰는 비용이 클 때는 **걷어 내고 네이티브 요소로 바꾸는 편이 싸다.** 외부 라이브러리에 원래 있던 `aria-*` 속성을 커스터마이징하다 빠뜨리는 일도 흔하다.
- ARIA는 의미만 더하고 동작은 더하지 않는다. `<a role="button">`은 스크린 리더에 버튼으로 읽혀도 브라우저 문맥 메뉴에는 여전히 링크 항목이 뜨고, Space 키 동작은 직접 붙여야 한다. 처음부터 `<button>`을 쓴다([[aria-basics|ARIA와 접근 가능한 이름]], [[keyboard-accessibility|키보드 접근성과 포커스 관리]]).
- ARIA 명세, 스크린 리더, 브라우저는 서로 다른 속도로 바뀐다. 같은 마크업도 조합마다 다르게 읽히므로 **주요 조합(NVDA·JAWS + Chrome·Firefox, VoiceOver + Safari)으로 확인한 결과**를 기준으로 삼는다. APG 예제도 열린 이슈가 있으니 그대로 믿지 말고 확인한다.
- 지원 범위가 좁은 속성(예: `aria-errormessage`, 한때의 `aria-modal`)은 같은 결과를 내는 더 오래된 방법(`aria-describedby`, 배경에 `inert`)을 함께 쓰거나 대신 쓴다.

## 콤보박스: 자동완성

입력창과 목록 상자(listbox)를 합친 위젯이다. 출발지·도시 검색, 검색창 추천어에 쓴다. ARIA 1.2부터 **입력창 자체가 `role="combobox"`**다(1.1의 `aria-owns`로 감싸는 구조는 쓰지 않는다).

```html
<label for="from">출발지</label>
<input id="from" type="text" role="combobox"
       aria-autocomplete="list" aria-expanded="true"
       aria-controls="from-list" aria-activedescendant="opt-lax">
<ul id="from-list" role="listbox" aria-label="출발지 후보">
  <li id="opt-lax" role="option" aria-selected="true">로스앤젤레스 (LAX)</li>
  <li id="opt-las" role="option" aria-selected="false">라스베이거스 (LAS)</li>
</ul>
<div role="status" class="visually-hidden">검색 결과 6개</div>
```

| 요소 | 하는 일 |
| --- | --- |
| `aria-expanded` | 목록이 열렸는지. 「펼쳐짐/접힘」으로 읽힌다 |
| `aria-controls` | 입력창이 제어하는 목록 |
| `aria-activedescendant` | **포커스는 입력창에 둔 채** 방향키로 고른 옵션을 알린다. 타이핑을 이어 갈 수 있다 |
| `aria-selected` | 고른 옵션 |
| `role="status"` 영역 | 「검색 결과 6개」처럼 결과 수를 알린다. 입력할 때마다 내용을 바꾼다 |

| 키 | 동작 |
| --- | --- |
| 아래 방향키 (또는 Alt + 아래) | 목록을 열고 옵션으로 이동 |
| 위·아래 방향키 | 옵션 사이 이동 |
| Enter | 옵션을 확정하고 목록을 닫는다 |
| Esc | 목록을 닫는다. 한 번 더 누르면 입력값을 지우기도 한다 |
| 글자 입력 | 목록을 걸러 내고 결과 수를 알린다 |

구현이 가장 어려운 위젯 가운데 하나다. 후보가 적고 고정돼 있으면 `<select>`나 `<input list>` + `<datalist>`로 대신하는 것을 먼저 검토한다.

## 날짜 선택기와 날짜 입력

### 직접 입력을 먼저 유연하게

스크린 리더 사용자는 달력 위젯보다 **직접 입력을 선호한다.** 달력 위젯은 제대로 구현된 곳이 드물어 두려움의 대상이 되기 쉽다. 그래서 입력창을 먼저 잘 만든다.

- 구분자(`-`, `/`, `.`, 공백, 없음)와 순서를 가리지 않고 받아 코드가 정리한다. 형식을 사용자에게 강요하지 않는다.
- 형식 안내는 `YYYY-MM-DD` 같은 기호보다 **예시 날짜**(「예: 2026-12-01」)가 낫다. 같은 글자의 반복은 스크린 리더마다 다르게 읽는다.
- 안내는 placeholder에만 두지 않고 label이나 `aria-describedby`로 잇는다([[accessible-forms|접근 가능한 폼과 오류 처리]]).
- 생일처럼 연·월·일 칸을 나눴다면 칸마다 이름(「4자리 연도」)을 주고 전체를 `role="group"`(또는 `<fieldset>`)으로 묶어 그룹 이름을 준다.
- 브라우저 기본 `<input type="date">`는 키보드·스크린 리더 지원이 이미 들어 있다. 디자인 요구가 없다면 이것이 가장 싸다.

### 달력 위젯: 대화 상자 + grid

APG의 날짜 선택 대화 상자 패턴이 기준이다. 입력창 옆 「날짜 선택」 버튼이 대화 상자를 열고, 달력 표는 `role="grid"`다.

```html
<div role="dialog" aria-modal="true" aria-labelledby="dlg-title">
  <h2 id="dlg-title">출발일 선택</h2>
  <button aria-label="이전 달">‹</button>
  <h3 id="month" aria-live="polite">2026년 11월</h3>
  <button aria-label="다음 달">›</button>

  <table role="grid" aria-labelledby="month">
    <thead><tr><th scope="col" abbr="일요일">일</th>…</tr></thead>
    <tbody>
      <tr>
        <td tabindex="-1">1</td>
        <td tabindex="0" aria-selected="true">16</td>
        <td tabindex="-1" aria-disabled="true">…</td>
      </tr>
    </tbody>
  </table>
</div>
```

- 요일 머리글은 「S」, 「M」처럼 한 글자만 두지 않는다. `abbr`나 숨김 텍스트로 전체 요일을 준다.
- 날짜 셀은 로빙 tabindex로 하나만 `tabindex="0"`이다. 셀이 읽어야 할 정보(날짜, 요일, 오늘인지, 고를 수 있는지, 골랐는지)가 많으면 **셀의 `aria-label`에 한 문장으로 담는** 것이 조합별 차이가 가장 적다.
- 연·월은 날짜를 옮길 때마다 읽지 않고, **바뀔 때만** 라이브 영역으로 알린다.
- 고를 수 없는 날짜로 가려 하면 「이전 날짜는 선택할 수 없다」를 라이브 영역으로 알린다.
- `role="application"`은 스크린 리더의 읽기 모드를 꺼서 사용자가 익숙한 탐색을 못 하게 한다. grid로 충분한 곳에 쓰지 않는다.

| 키 | 동작 |
| --- | --- |
| 좌우 방향키 | 전날·다음 날 |
| 위아래 방향키 | 지난주·다음 주 같은 요일 |
| Home / End | 그 주의 첫날·마지막 날 |
| Page Up / Page Down | 지난달·다음 달 같은 날짜 (Shift를 함께 누르면 연 단위) |
| Enter, Space | 날짜를 고르고 대화 상자를 닫는다 |
| Esc | 고르지 않고 닫는다. 포커스는 여는 버튼으로 돌아간다 |

## 메뉴: 사이트 내비게이션과 menubar는 다르다

### 사이트 메뉴는 디스클로저 내비게이션

대메뉴에 포커스만 가도 하위 메뉴가 자동으로 펼쳐지면, 키보드 사용자는 원하는 대메뉴에 닿기까지 앞선 모든 하위 링크를 Tab으로 지나야 한다. 메뉴가 많은 사이트에서는 수십~백 번이 된다. **대메뉴를 버튼으로 두고 Enter로 열고 닫게** 하면 대메뉴 사이를 몇 번의 Tab으로 오간다.

```html
<nav aria-label="전체 메뉴">
  <ul>
    <li>
      <button aria-expanded="false" aria-controls="sub-booking">예매</button>
      <ul id="sub-booking" hidden>
        <li><a href="/booking">항공권 예매</a></li>
        <li><a href="/booking/check" aria-current="page">예약 조회</a></li>
      </ul>
    </li>
    …
  </ul>
</nav>
```

- 펼침 상태는 `aria-expanded`가 알린다. 버튼 이름에 「펼침」 같은 숨김 텍스트를 중복해 넣지 않는다.
- Esc로 닫고 포커스는 대메뉴 버튼에 둔다. 펼친 메뉴가 다른 내용을 가리면 포커스가 밖으로 나갈 때 닫는다.
- `aria-expanded`의 번역은 「접힘/펼침」이다. 「닫힘/열림」과 뜻이 다르다.

### menubar·menu는 앱 메뉴에만

`role="menubar"`·`role="menu"`·`role="menuitem"`은 데스크톱 프로그램의 메뉴(파일·편집·보기)처럼 **명령을 고르는 위젯**이다. 이 role을 쓰면 스크린 리더가 메뉴 조작 모드로 바뀌고, 방향키로만 움직이며, 안의 링크 목록을 평소처럼 훑을 수 없다. APG도 사이트 내비게이션에는 menu role 대신 위의 디스클로저 패턴을 권한다.

앱 메뉴를 만든다면 APG 메뉴 패턴을 그대로 따른다.

| 항목 | 내용 |
| --- | --- |
| 구조 | `menubar` > `menuitem`, 하위 메뉴가 있는 항목은 `aria-haspopup="menu"` + `aria-expanded`, 하위 목록은 `role="menu"`. 하위 메뉴가 없는 항목에는 이 속성들을 넣지 않는다 |
| 포커스 | 메뉴바 전체가 Tab 정지점 하나. 현재 항목만 `tabindex="0"`, 나머지는 `-1` |
| 키 | 메뉴바는 좌우, 하위 메뉴는 위아래, Enter·Space·아래 방향키로 하위 메뉴 열기, Esc로 닫고 부모로, Tab으로 메뉴 밖으로 |

## 수량 조절 버튼

`−` `+` 버튼으로 승객 수·상품 수량을 바꾸는 위젯이다. 브라우저 기본 `<input type="number">`나 `role="spinbutton"`도 있지만, 버튼 둘과 입력창 하나로 만드는 구성이 가장 널리 읽힌다.

```html
<div role="group" aria-labelledby="adult-label">
  <span id="adult-label">성인</span>
  <button type="button" aria-label="성인 1명 줄이기">−</button>
  <input id="adult" type="text" inputmode="numeric" value="2" aria-label="성인 수">
  <button type="button" aria-label="성인 1명 늘리기" aria-disabled="true">+</button>
</div>
<div role="status" class="visually-hidden">성인 2명으로 바뀜</div>
```

- 버튼 이름은 「−」 기호가 아니라 **무엇을 얼마나** 바꾸는지 쓴다. 묶음이 여럿이면(성인·소아·유아) 이름에 대상을 넣는다.
- 값이 바뀌면 라이브 영역으로 바뀐 값을 알린다. 포커스는 누른 버튼에 그대로 둔다.
- 최댓값·최솟값에 닿은 버튼은 `aria-disabled="true"`로 표시한다. 「사용 불가」는 스크린 리더가 이미 읽으므로 이름에 「더 늘릴 수 없음」을 덧붙이지 않는다. `disabled` 속성은 포커스를 빼 버려 버튼이 사라진 것처럼 느끼게 한다.
- 토글 버튼(`aria-pressed`)으로 만들지 않는다. 토글은 눌림·안 눌림 두 상태뿐이다.

## 정렬 표

정렬할 수 있는 열 머리글에는 `<th>` 안에 `<button>`을 두고, **지금 정렬된 열 하나에만** `aria-sort`를 단다.

```html
<th scope="col" aria-sort="descending">
  <button>예약 번호</button>
</th>
<th scope="col">
  <button>예약 별명</button>
</th>
```

| 값 | 뜻 |
| --- | --- |
| `ascending` / `descending` | 오름차순 / 내림차순으로 정렬됨 |
| `none` | 정렬되지 않음. 대부분의 스크린 리더는 아무것도 읽지 않으므로, 정렬되지 않은 열에는 속성을 아예 두지 않는다 |
| `other` | 그 밖의 정렬 |

정렬 방향을 바꿀 수 있다는 안내가 필요하면 버튼 이름이나 `aria-describedby`로 준다. 정렬 뒤 「예약 번호 내림차순으로 정렬됨」을 라이브 영역으로 알리면 확실하다. 표의 머리글·캡션 기본은 [[accessible-page-structure|접근 가능한 페이지 구조]]에 있다.

## 페이지 번호 내비게이션

```html
<nav aria-label="페이지 선택">
  <ul>
    <li><a href="?page=1" aria-current="page">1</a></li>
    <li><a href="?page=2" aria-label="2페이지">2</a></li>
    …
  </ul>
</nav>
```

- 현재 페이지는 숨김 텍스트 대신 `aria-current="page"`로 표시한다.
- 숫자만 있는 링크는 링크 목록에서 뜻이 약하므로 「2페이지」 같은 이름을 줄 수 있다. 이때 보이는 숫자가 이름에 들어가야 한다(Label in Name).
- 페이지를 바꾼 뒤 화면이 새로 그려지지 않는 방식이면, 포커스를 결과 제목으로 옮기고 제목에 「유실물 2 / 395페이지」처럼 위치를 넣는다.
- 수백 페이지짜리 목록은 페이지 번호보다 **검색·필터**가 훨씬 빠른 탐색 수단이다.

## 툴팁과 호버 콘텐츠

마우스를 올리거나 포커스할 때 나타나는 내용은 WCAG 1.4.13 Content on Hover or Focus(AA)의 세 조건을 지킨다.

| 조건 | 뜻 |
| --- | --- |
| 닫을 수 있다 | 포인터·포커스를 옮기지 않고 Esc 등으로 치울 수 있다 |
| 머물 수 있다 | 나타난 내용 위로 포인터를 옮겨도 사라지지 않는다 |
| 유지된다 | 사용자가 치우거나 호버·포커스가 빠지기 전까지 스스로 사라지지 않는다 |

`title` 속성은 세 조건을 모두 못 지킨다. 키보드 포커스로 뜨지 않고, 위로 포인터를 옮길 수 없고, 터치 기기에서는 나오지 않는다. **title로 툴팁을 대신하지 않는다.**

툴팁은 스크린 리더가 **들어야 하는 것**과 **들을 필요 없는 것**으로 나눠 처리한다.

| 경우 | 예 | 처리 |
| --- | --- | --- |
| 뜻을 보충한다 | 항공사 코드 「KE」 → 대한항공, 기내 콘센트 아이콘 → 「기내 전원 공급 장치」 | 보이는 약어·아이콘은 `aria-hidden="true"`, 뜻은 숨김 텍스트나 `aria-describedby`로 읽힌다. 아이콘 자체를 포커스 가능한 `<button>`으로 두고 툴팁 텍스트를 이름으로 준다 |
| 화면에서만 잘렸다 | 말줄임(…)으로 잘린 긴 공항 이름 | DOM에는 전체 글이 이미 있다. 툴팁 쪽을 `aria-hidden="true"`로 둬 두 번 읽히지 않게 한다. 키보드로 전체를 볼 수 있게 `tabindex="0"`을 준다 |

APG 툴팁 패턴은 트리거에 `aria-describedby`로 `role="tooltip"` 요소를 잇는다. 툴팁에는 상호작용 요소를 넣지 않는다. 링크·버튼이 필요하면 툴팁이 아니라 팝오버나 대화 상자다.

## 2차원 선택: 좌석 배치

비행기·공연장 좌석표처럼 행과 열로 된 선택 위젯이다.

- 표처럼 보여도 데이터 표가 아니다. 키보드로 칸 사이를 움직여야 하면 `role="grid"`, 아니면 좌석마다 버튼을 두고 행 단위 목록으로 만든다.
- 위젯 전체가 Tab 정지점 하나이고, 좌석 사이는 방향키, 고르기는 Enter, 다음 Tab은 위젯 밖으로 나간다.
- 좌석 버튼 이름은 「36D」, 좌석 속성(창가·복도, 비상구 열, 날개 위, 이미 선택됨)은 `aria-describedby`로 잇는다. 고를 수 없는 좌석은 `aria-disabled="true"`.
- 조작 방법은 **보이는 글로** 위젯 앞에 둔다. 키보드 사용자도 읽는다.

## 상태 알림 패턴

포커스를 옮기지 않고 바뀐 내용은 라이브 영역으로 알린다(WCAG 4.1.3 Status Messages). 속성의 동작은 [[aria-basics|ARIA와 접근 가능한 이름]]에 있고, 여기서는 자주 만나는 상황별 처리를 모은다.

| 상황 | 처리 |
| --- | --- |
| 로딩 | 시작과 끝을 둘 다 알린다(「정보를 불러오는 중」, 「불러오기 완료」). 알림이 없으면 오류로 멈춘 줄 알고 새로고침을 반복한다. 갱신 중인 영역에는 `aria-busy="true"`를 둔다. 아주 짧게 끝나는 로딩은 알리지 않아도 된다 |
| 부분 화면 전환 | 탭·메뉴로 본문만 바뀌면 새 내용의 제목에 `tabindex="-1"`을 주고 포커스를 옮긴다([[keyboard-accessibility\|키보드 접근성과 포커스 관리]]) |
| 글자 수 제한 | 제한은 label에 미리 쓴다(「배송 메시지, 50자 이내」). 남은 글자 수는 `aria-describedby`로 잇고, 라이브 영역 알림은 **10자 단위, 끝에 가까워지면 5자 단위**처럼 구간마다만 한다. 한 글자마다 알리면 입력을 방해한다. 한도에 닿으면 더 입력할 수 없다고 알린다 |
| 실시간 형식 검증 | 비밀번호 조건 목록을 색·아이콘(클래스)으로만 바꾸면 스크린 리더는 조건 문구만 읽는다. **충족 안 된 조건만** 라이브 영역으로 알리거나, 조건마다 「충족됨/충족 안 됨」 텍스트를 넣는다. 매 글자가 아니라 몇 글자 입력 뒤나 칸을 벗어날 때 알린다 |
| 서버 오류 | 「일치하는 회원 정보가 없다」처럼 특정 칸에 묶이지 않는 오류는 제목 아래에 두고 `tabindex="-1"`로 포커스를 옮기거나 `role="alert"`로 알린다. 고칠 칸으로 가는 링크를 함께 두면 더 낫다 |
| 상황 오류 | 지난 날짜로 이동하려는 시도처럼 조작이 막힌 이유는 `role="alert"` 또는 `aria-live`로 즉시 알린다 |

### 토스트·스낵바

화면 구석에 잠깐 떴다 사라지는 피드백이다(Material Design의 명칭이 스낵바).

- 시간이 지나면 사라지므로 **반드시 알아야 할 정보나 꼭 필요한 동작을 담지 않는다.** 시간 제한 콘텐츠는 WCAG 2.2.1 Timing Adjustable에 걸린다. 중요한 내용이면 사라지지 않게 하거나 사용자가 닫을 때까지 둔다.
- 저절로 사라지는 메시지에는 **포커스를 옮기지 않는다.** 사라지는 순간 포커스가 문서 처음으로 튄다.
- 메시지가 연달아 나오면 화면 밖에 둔 알림 영역 하나에 **차례로 넣어**(대기열) 앞 알림이 끝난 뒤 다음을 읽게 한다. 토스트마다 라이브 영역을 따로 만들면 서로 끊고 겹친다.
- 기본은 `role="status"`(polite)다. 읽던 것을 끊는 `role="alert"`는 즉시 알아야 할 때만 쓴다. 「30D 좌석이 선택됨」처럼 방금 한 행동의 확인은 polite면 충분하다.
- 라이브 영역 컨테이너는 미리 두고 내용만 넣는다. 안의 각 줄에 `role="alert"`를 또 다는 식으로 중복하지 않는다.
- 「실행 취소」 같은 동작 버튼은 진짜 `<button>`으로 만들고 이름을 준다. DOM에서 **트리거 버튼 바로 뒤**에 넣으면 Tab 한 번으로 닿는다. 아이콘뿐인 닫기 버튼에도 이름을 준다.

## 정리

- 직접 만든 위젯은 role·state·이름과 키 조작이 없으면 스크린 리더로는 쓸 수 없다(4.1.2). 네이티브 요소 → APG 패턴 → 조합별 확인 순서로 고른다.
- 콤보박스는 입력창이 `role="combobox"`이고, 포커스는 입력창에 둔 채 `aria-activedescendant`로 옵션을 알리며, 결과 수를 라이브 영역으로 알린다.
- 날짜는 직접 입력을 유연하게 받는 것이 먼저다. 달력은 대화 상자 + grid, 셀마다 날짜 정보를 한 문장으로.
- 사이트 메뉴는 버튼 + `aria-expanded`의 디스클로저로, `menubar`·`menu`는 앱 메뉴에만 쓴다.
- 수량 버튼은 무엇을 바꾸는지 이름을 주고, 한도에서는 `aria-disabled`, 바뀐 값은 라이브 영역으로.
- `aria-sort`는 정렬된 열 하나에만, 현재 페이지는 `aria-current`로.
- 툴팁은 1.4.13 세 조건을 지키고, 들어야 할 것과 중복인 것을 나눠 처리한다. `title`은 툴팁이 아니다.
- 상태 메시지는 알릴 때를 고른다. 로딩은 시작과 끝, 글자 수·실시간 검증은 구간마다, 토스트에는 중요한 정보를 담지 않는다.

관련 노트: [[aria-basics|ARIA와 접근 가능한 이름]], [[accessible-widgets|접근 가능한 위젯: 펼침·탭·캐러셀]], [[keyboard-accessibility|키보드 접근성과 포커스 관리]], [[accessible-forms|접근 가능한 폼과 오류 처리]], [[screen-reader-testing|스크린 리더로 테스트하기]], [[wcag-guidelines|WCAG와 POUR 원칙]]
