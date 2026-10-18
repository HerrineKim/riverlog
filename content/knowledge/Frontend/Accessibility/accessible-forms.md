---
title: "접근 가능한 폼과 오류 처리"
concept: "Accessible Forms"
summary: "모든 입력 칸에는 코드로 연결된 이름이 있어야 한다. label을 기본으로, 표처럼 일대일이 안 되는 곳은 aria-labelledby, 보조 설명은 aria-describedby로 잇고, 묶음은 fieldset·legend로 준다. 검증은 서버와 클라이언트를 함께 두고, 오류는 알리고·데려가고·다시 제출하게 하는 세 단계로 복구시킨다. WCAG 2.2의 중복 입력 금지와 인지 테스트 없는 인증까지 다룬다."
tags: ["accessibility", "frontend", "form", "validation", "aria", "html"]
source: other
date: "2026-10-17"
sources: ["https://webaim.org/techniques/forms/", "https://webaim.org/techniques/forms/controls", "https://webaim.org/techniques/forms/advanced", "https://webaim.org/techniques/formvalidation/", "https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html", "https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html", "https://web.dev/learn/accessibility/forms", "https://www.youtube.com/playlist?list=PLtaz5vK7MbK0wauPYD9VtgkwX2Bx_Ygo3"]
---

> WebAIM의 「[Creating Accessible Forms](https://webaim.org/techniques/forms/)」(3쪽: [Accessible Form Controls](https://webaim.org/techniques/forms/controls), [Advanced Form Labeling](https://webaim.org/techniques/forms/advanced)), 「[Usable and Accessible Form Validation and Error Recovery](https://webaim.org/techniques/formvalidation/)」을 바탕으로, WCAG 2.2 성공 기준은 W3C의 Understanding 문서로 확인해 재구성하고, web.dev 「[Learn Accessibility](https://web.dev/learn/accessibility)」의 폼 편으로 보강한 노트다.
> 힌트·오류 문구 중복과 묶음 오류 부분은 AOA11Y의 강의 연재 「[항공사의 ARIA 적용 사례 살펴보기](https://www.youtube.com/playlist?list=PLtaz5vK7MbK0wauPYD9VtgkwX2Bx_Ygo3)」를 바탕으로 보강했다.

## 접근 가능한 폼이란

**접근 가능한 폼은 이해하기 쉽고, 채우기 쉽고, 제출하기 쉬운 폼이다.** 지시 사항, 필수 항목, 형식 요구가 분명하고, 틀렸을 때 무엇을 어떻게 고칠지 알려 준다.

화면을 보는 사람은 칸 옆의 글자를 보고 그것이 이름표라는 것을 안다. 스크린 리더 사용자는 Tab으로 칸에서 칸으로 건너뛰기 때문에 **칸 사이의 일반 텍스트를 듣지 못하는 일이 많다.** 그래서 이름표와 설명은 위치가 아니라 **코드로** 칸에 이어져 있어야 한다. WebAIM Million에서 폼 라벨 누락이 매년 상위 오류에 드는 이유다.

일반 사용성(브라우저 기본 동작, `inputmode`, 커서를 빼앗지 않는 입력 처리, `:user-invalid`)은 [[form-usability|더 나은 폼을 만드는 팁]]에, 입력 요소별 문법은 [[html-input-types|HTML 입력 요소 치트시트]]에 있다. 여기서는 보조 기술이 폼을 읽고 고칠 수 있게 하는 부분만 다룬다.

| 기본 조건 | 확인 방법 |
| --- | --- |
| 읽는 순서·포커스 순서가 논리적이다 | 마우스 없이 Tab만으로 끝까지 채워 본다. 레이아웃 표나 CSS로 단을 나눈 폼에서 잘 깨진다 |
| 키보드만으로 조작된다 | 값을 바꾸거나 포커스를 옮기거나 제출하는 스크립트가 마우스 이벤트에만 붙어 있지 않은지 본다([[keyboard-accessibility\|키보드 접근성과 포커스 관리]]) |
| 모든 칸에 접근 가능한 이름이 있다 | DevTools 접근성 패널에서 계산된 이름(name)을 본다 |
| 네이티브 요소로 만들었다 | `<div role="form">`·커스텀 셀렉트 대신 `<form>`, `<input>`, `<select>`를 쓴다. 네이티브 컨트롤은 상태·속성·값이 내장돼 있고, 커스텀 컨트롤은 그것을 ARIA와 스크립트로 전부 다시 만들어야 한다 |
| 포커스·입력만으로 맥락이 바뀌지 않는다 | 칸에 들어가거나 값을 채우자마자 자동 제출·페이지 이동이 일어나지 않는다. 미리 알렸을 때만 예외다(3.2.1, 3.2.2) |

## 이름 붙이기: label이 기본이다

### label로 잇기

`for`와 `id`를 맞추거나 `<input>`을 `<label>` 안에 넣는다. 이렇게 이으면 스크린 리더가 칸에 들어갈 때 이름표를 읽고, **이름표를 클릭해도 칸에 포커스가 간다.** 작은 체크박스를 누르기 힘든 운동 장애 사용자와 모바일 사용자에게 클릭 영역이 넓어지는 효과가 있다.

```html
<label for="email">이메일</label>
<input id="email" type="email" autocomplete="email">

<label><input type="checkbox" name="agree"> 약관에 동의합니다</label>
```

| 컨트롤 | 주의할 점 |
| --- | --- |
| 텍스트·`textarea`·`password`·`date`·`number` 등 모든 input | type과 상관없이 `<label>`이 필요하다 |
| `<select>` | `<select>` 자체에 label을 준다. 긴 목록은 `<optgroup>`으로 나누되, 일부 스크린 리더가 optgroup을 읽지 않으므로 **필수 맥락을 optgroup에만 두지 않는다** |
| 다중 선택 `<select multiple>` | 키보드 지원이 들쭉날쭉하고 Ctrl·Shift 클릭 관례를 모르는 사용자가 많다. 체크박스 묶음이 낫다 |
| 버튼 | 버튼 텍스트(또는 `<input>`의 `value`)가 곧 이름이다. 비워 두지 않는다 |
| 이미지 버튼 `<input type="image">` | `alt`가 이름이다. 없으면 "버튼"으로만 들린다 |
| 초기화(reset) 버튼 | 실수로 눌러 입력을 날리기 쉬우므로 두지 않는다 |
| 선택 즉시 이동하는 점프 메뉴 | 방향키로 옵션을 훑기만 해도 페이지가 바뀐다. 일반 `<select>` + 별도 이동 버튼으로 만든다 |

### placeholder는 이름표가 아니다

`placeholder`는 입력을 시작하면 사라진다. 무엇을 쓰던 칸인지 잊기 쉽고, 고칠 때 다시 확인할 수 없고, 기본 색이 대비 기준에 못 미치는 경우가 많다. 성·이름·중간 이름처럼 칸이 여러 개인 곳에서 특히 문제가 된다. **보이는 label을 두고, placeholder는 예시가 꼭 필요할 때만** 쓴다.

```html
<!-- 나쁨 -->
<input placeholder="성"> <input placeholder="이름">

<!-- 좋음 -->
<label>성 <input autocomplete="family-name"></label>
<label>이름 <input autocomplete="given-name"></label>
```

### label로 안 되는 곳: aria-labelledby

`<label>`은 **칸 하나에 이름표 하나**만 잇는다. 표처럼 열 제목 하나가 여러 칸의 이름이거나, 칸 하나가 행 제목과 열 제목을 모두 이름으로 가져야 할 때는 `aria-labelledby`로 이름 텍스트의 `id`를 가리킨다. 공백으로 여러 id를 나열하면 **나열한 순서대로** 이어 읽는다.

```html
<table>
  <tr><td></td><th id="q1">1분기</th><th id="q2">2분기</th></tr>
  <tr>
    <th id="seoul">서울</th>
    <td><input aria-labelledby="seoul q1"></td>  <!-- "서울 1분기" -->
    <td><input aria-labelledby="seoul q2"></td>
  </tr>
</table>
```

- `aria-labelledby`는 클릭 시 포커스 이동을 주지 않는다. 일대일이면 `<label>`을 쓴다.
- `<label>`과 `aria-labelledby`가 함께 있으면 `aria-labelledby`가 이긴다. 이름이 계산되는 우선순위는 [[aria-basics|ARIA와 접근 가능한 이름]]에 있다.

### 보이는 이름표가 필요 없을 때

검색 버튼이 바로 옆에 있는 검색창처럼 시각적으로 맥락이 분명한 경우에만 숨긴 이름을 쓴다. **아래 셋 중 하나만** 쓴다. 겹치면 같은 이름을 두 번 읽을 수 있다.

| 방법 | 특징 |
| --- | --- |
| 화면에서만 숨긴 `<label>` | 스크린 리더 전용 클래스로 숨긴다([[accessible-css-typography\|접근성을 위한 CSS와 타이포그래피]]). 가장 무난하다 |
| `aria-label` | 다른 이름을 모두 덮어쓴다. 음성 인식 사용자는 화면에 보이는 단어로 칸을 부르므로, 보이는 글자가 있으면 그 글자를 이름에 포함한다(성공 기준 2.5.3 Label in Name) |
| `title` | 다른 이름이 없을 때 이름으로 쓰인다. 마우스를 올리면 툴팁도 뜨지만 키보드·터치 사용자는 보지 못한다 |

## 묶음과 설명

### fieldset과 legend

라디오 버튼과 체크박스 묶음은 각 칸의 이름("예", "아니요")만으로는 무엇을 묻는지 모른다. `<fieldset>`으로 묶고 `<legend>`에 질문을 쓰면, 스크린 리더가 묶음에 들어갈 때 질문을 함께 읽는다.

```html
<fieldset>
  <legend>배송 방법</legend>
  <label><input type="radio" name="ship" value="std"> 일반</label>
  <label><input type="radio" name="ship" value="exp"> 빠른 배송</label>
</fieldset>
```

- legend는 칸마다 반복해 읽힐 수 있으므로 **짧게** 쓴다.
- 라디오 묶음이라도 상위 질문이 필요 없으면 fieldset을 생략해도 된다.
- fieldset을 중첩하지 않는다. 스크린 리더마다 이상하게 읽는다.

### aria-describedby: 이름 뒤에 붙는 설명

비밀번호 규칙, 형식 안내처럼 이름은 아니지만 알아야 할 텍스트는 `aria-describedby`로 잇는다. 스크린 리더는 보통 **이름 → 컨트롤 종류·상태(필수 등) → 설명** 순서로 읽는다. 여러 설명은 공백으로 나열한다. 설명은 이름을 대신하지 못한다.

```html
<label for="pw">비밀번호</label>
<input id="pw" type="password" aria-describedby="pw-rule" autocomplete="new-password">
<p id="pw-rule">8자 이상, 숫자를 하나 이상 넣는다.</p>
```

이름·힌트·오류 문구가 같은 말을 되풀이하지 않게 한다. 「이름」 칸의 힌트도 「이름」, 오류도 「이름 필수」면 스크린 리더에는 「이름 필수 편집창 이름 이름 필수」로 들려 무엇이 이름이고 무엇이 오류인지 구분되지 않는다. 힌트는 예시(「예: 홍길동」)처럼 이름에 없는 정보를, 오류는 무엇이 문제인지(「이름을 입력해야 한다」)를 쓴다.

마우스를 올려야 보이는 툴팁형 설명이라면 **키보드 포커스 때도** 보여야 한다. 폼 전체에 대한 안내는 폼 맨 앞에 두거나 해당 칸에 `aria-describedby`로 잇는다. 칸 사이에 둔 안내문은 Tab 이동 중에 건너뛰어진다.

## 필수 항목과 형식 요구

| 방법 | 효과 |
| --- | --- |
| 별표(*)만 | 의미를 모르는 사람이 있고, 스크린 리더 설정에 따라 읽히지 않는다. 쓴다면 폼 앞에 "*는 필수"를 밝힌다 |
| 빨간색만 | 색만으로 정보를 전하면 안 된다([[color-motion-accessibility\|색과 움직임의 접근성]]) |
| `required` | 스크린 리더가 "필수"로 읽고, 브라우저 기본 검증도 켠다 |
| `aria-required="true"` | "필수"로 읽게만 한다. 브라우저 검증과 시각 변화는 없다. 직접 검증할 때 쓴다 |

- 필수 표시와 형식 요구는 **label 안에** 넣는 것이 가장 확실하다. 칸에 포커스가 가면 이름과 함께 바로 들린다. `<label for="name">이름 <span>(필수)</span></label>`
- 형식이 정해져 있으면 label이나 `aria-describedby`로 미리 알린다. 가능하면 사용자에게 형식을 맞추게 하지 말고 **코드가 받아서 정리한다**(하이픈·공백 제거 등).
- 알맞은 `type`(`email`, `tel`, `url`, `number`)을 쓰면 브라우저가 모바일 키보드와 기본 오류 메시지를 준다.
- 이름·이메일·주소·전화번호처럼 개인 정보를 받는 칸에는 `autocomplete` 값을 넣는다. 입력 목적이 기계적으로 식별돼(성공 기준 1.3.5 Identify Input Purpose) 브라우저 자동 완성과 보조 기술이 쓸 수 있다.

## 검증: 서버와 클라이언트를 함께

| 방식 | 장점 | 한계 |
| --- | --- | --- |
| 서버 검증 | 스크립트가 없어도 동작하고, 우회할 수 없다 | 제출 후 새 응답을 기다려야 한다 |
| 클라이언트 검증 | 즉시 피드백, 서버 왕복 없음 | 꺼지거나 조작될 수 있다 |

**둘 다 둔다.** 클라이언트 검증은 먼저 걸러 주는 편의이고, 최종 판단은 서버가 한다. 폼은 `action`에 실제 URL을 가진 `<form>`으로 만들어 스크립트 없이도 제출되게 하고, 검증은 마우스 클릭과 키보드 제출(Enter) 모두에서 실행되게 한다.

## 오류 복구: 알리고, 데려가고, 다시 받는다

```text
1. 알린다      오류가 있다는 사실을 보이게, 그리고 보조 기술에도 전달한다
2. 데려간다    고칠 칸으로 쉽게 갈 수 있게 한다
3. 다시 받는다  고친 뒤 다시 제출하고 다시 검증할 수 있게 한다
```

오류 메시지는 **무엇이 틀렸는지와 어떻게 고치는지**를 함께 말한다. 「과목 번호가 올바르지 않다」보다 「과목 번호는 숫자 3자리다」가 낫다(성공 기준 3.3.1 Error Identification, 3.3.3 Error Suggestion).

| 방식 | 하는 일 | 장점 | 단점 |
| --- | --- | --- | --- |
| 경고 후 포커스 | `alert()`로 알리고 해당 칸에 포커스 | `alert()`는 기본으로 접근 가능하다 | 오류를 하나씩만 보여 준다. 반복되면 포커스를 빼앗기는 느낌을 준다 |
| 맨 위 요약 | 폼 위에 오류 개수와 목록을 띄우고, 요약에 포커스를 옮긴다. 각 항목은 해당 칸으로 가는 링크 | 모든 오류를 한 번에 본다 | 많으면 어느 칸인지 추적이 힘들다 |
| 인라인 오류 | 칸 바로 옆에 메시지를 두고 `aria-describedby`로 잇는다. 첫 오류 칸에 포커스 | 맥락 안에서 고친다 | 오류를 다 찾으려면 폼 전체를 훑어야 한다 |
| 모달 대화 상자 | 오류 목록을 대화 상자로 띄운다 | 놓치기 어렵다 | 닫으면 목록이 사라진다. 포커스 가두기·복귀를 지켜야 한다 |

**맨 위 요약과 인라인 오류를 함께 쓰는 방식이 대개 가장 낫다.** 요약은 전체 상황을, 인라인은 칸별 고칠 내용을 준다.

```html
<div id="errors" tabindex="-1" role="alert">
  <h2>오류 2개를 고쳐야 한다</h2>
  <ul>
    <li><a href="#email">이메일 형식이 아니다. 예: name@example.com</a></li>
    <li><a href="#pw">비밀번호는 8자 이상이다</a></li>
  </ul>
</div>

<label for="email">이메일</label>
<input id="email" type="email" aria-invalid="true" aria-describedby="email-err">
<p id="email-err">이메일 형식이 아니다. 예: name@example.com</p>
```

- `aria-invalid="true"`를 오류 칸에 단다. 포커스가 가면 "유효하지 않음"이라고 읽는다. 시각 변화는 없으므로 아이콘·문구도 함께 둔다. 고쳐지면 값을 지운다.
- 요약으로 포커스를 옮길 때는 `tabindex="-1"`을 단 요소에 `focus()`를 부르거나, 서버가 다시 그린 페이지라면 URL 조각(`#errors`)으로 이동시킨다.
- 페이지 이동이나 포커스 이동 없이 상태만 바뀌는 메시지("저장했다", "3건 남음")는 라이브 영역(`role="status"`, `role="alert"`)으로 알린다(성공 기준 4.1.3 Status Messages). 라이브 영역 동작은 [[aria-basics|ARIA와 접근 가능한 이름]]에 있다.
- 라디오·체크박스 **묶음 전체의 오류**(「조회할 달을 선택하라」)는 칸 하나가 아니라 묶음에 단다. `<fieldset>`의 `<legend>` 안에 오류 문구를 넣거나, `role="group"` + `aria-labelledby`로 묶고 `aria-describedby`로 오류를 이은 뒤 묶음의 첫 칸으로 포커스를 옮긴다. 묶음에 단 `aria-describedby`는 스크린 리더 지원이 고르지 않아 fieldset·legend 쪽이 더 확실하다. 실시간 검증·글자 수 알림처럼 입력 중에 바뀌는 메시지는 [[aria-widget-patterns|복합 위젯의 ARIA 패턴]]의 상태 알림에 있다.
- `aria-errormessage`는 오류 메시지 전용 속성이지만 스크린 리더 지원이 아직 고르지 않다. 확실한 연결은 `aria-describedby`다.
- 법적·금전적 결과가 있는 제출(결제, 계약)은 되돌리기·확인·검토 단계 중 하나를 둔다(성공 기준 3.3.4 Error Prevention).

## WCAG 2.2에서 더해진 폼 기준

폼과 관련된 2.2 신설 기준은 넷이다. 2.5.8 대상 크기(최소, AA)는 작은 체크박스·라디오·아이콘 버튼을 24×24 CSS px 이상이거나 그만큼 떨어지게 하고, 3.2.6 일관된 도움말(A)은 도움말·연락처를 여러 페이지의 같은 자리에 둔다. 나머지 둘은 아래와 같다.

### 3.3.7 중복 입력(Redundant Entry), 수준 A

**같은 과정 안에서 이미 입력한 정보를 다시 입력하게 하지 않는다.** 앞 단계 값을 자동으로 채워 두거나, 선택할 수 있게 보여 준다. 인지·기억 장애, 운동 장애 사용자에게 재입력은 시간과 오류를 크게 늘린다.

| 상황 | 해결 |
| --- | --- |
| 결제 단계에서 배송지를 다시 묻는다 | "청구지 = 배송지" 체크박스, 또는 미리 채운 값 |
| 다단계 신청서의 3단계에서 1단계 이름을 다시 받는다 | 앞 단계 값을 보여 주고 확인만 받는다 |

예외는 다시 입력하는 것이 **꼭 필요한** 경우(비밀번호 확인처럼 재입력 자체가 목적), 보안상 필요한 경우, 앞의 정보가 더는 유효하지 않은 경우다. 같은 세션의 같은 과정이 대상이므로, 다른 날 다시 방문했을 때의 재입력은 이 기준 밖이다.

### 3.3.8 접근 가능한 인증(Accessible Authentication, Minimum), 수준 AA

**로그인의 어떤 단계도 인지 기능 테스트를 요구하지 않는다.** 인지 기능 테스트란 비밀번호를 기억하기, 글자를 받아 적기, 퍼즐 풀기, 계산하기처럼 기억·전사·문제 해결을 요구하는 일이다. 다음 중 하나가 있으면 통과한다.

| 허용되는 경로 | 예 |
| --- | --- |
| 대안 인증 수단 | 패스키, 이메일 매직 링크, OAuth 로그인 |
| 보조 메커니즘 | **비밀번호 관리자 자동 완성과 붙여넣기를 막지 않는다.** `autocomplete="current-password"`, 일회용 코드 칸에 `autocomplete="one-time-code"` |
| 사물 인식 | "자동차가 있는 사진을 고르세요" 같은 CAPTCHA는 최소 수준에서 허용된다 |
| 개인 콘텐츠 | 직접 올린 사진을 고르기 |

```html
<label for="user">아이디</label>
<input id="user" autocomplete="username">
<label for="pass">비밀번호</label>
<input id="pass" type="password" autocomplete="current-password">
<!-- onpaste로 붙여넣기를 막지 않는다 -->

<label for="otp">인증 코드</label>
<input id="otp" inputmode="numeric" autocomplete="one-time-code">
```

흔한 위반은 **비밀번호·인증 코드 칸의 붙여넣기 차단**, 한 칸에 한 글자씩 나뉘어 붙여넣기가 안 되는 코드 입력, 왜곡된 글자를 받아 적는 CAPTCHA다. AAA 수준인 3.3.9(Enhanced)는 사물 인식과 개인 콘텐츠 예외까지 없앤다.

## 정리

- 모든 칸에 **코드로 이어진 이름**을 준다. `<label>`이 기본, 일대일이 안 되면 `aria-labelledby`, 보조 설명은 `aria-describedby`.
- placeholder와 별표·색만으로 이름과 필수를 대신하지 않는다. 필수·형식은 label 안에 쓴다.
- 묶음은 `fieldset`·`legend`, 개인 정보 칸은 `autocomplete`.
- 검증은 서버와 클라이언트를 함께 두고, 오류는 요약 + 인라인 + `aria-invalid`로 알리고 고칠 칸으로 데려간다.
- WCAG 2.2 기준으로 이미 받은 정보는 다시 묻지 않고, 로그인에서 붙여넣기·자동 완성을 막지 않는다.

관련 노트: [[form-usability|더 나은 폼을 만드는 팁]], [[html-input-types|HTML 입력 요소 치트시트]], [[aria-basics|ARIA와 접근 가능한 이름]], [[keyboard-accessibility|키보드 접근성과 포커스 관리]], [[accessible-css-typography|접근성을 위한 CSS와 타이포그래피]], [[wcag-guidelines|WCAG와 POUR 원칙]], [[a11y-driven-testing|접근성 기반 UI 테스트 자동화]], [[constraint-validation|제약 검증]], [[form-autofill|자동 완성과 autocomplete 토큰]], [[sign-in-sign-up-forms|로그인·가입 폼과 인증 입력]]
