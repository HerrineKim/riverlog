---
title: "자동 완성과 autocomplete 토큰"
concept: "Autofill"
summary: "브라우저는 name·id·type과 autocomplete 값으로 칸의 정체를 짐작해 저장된 주소·카드·비밀번호를 채운다. 짐작에 맡기지 말고 autocomplete 토큰을 명시하고, section-·shipping/billing·home/work·webauthn 순서 문법, 이름·주소·전화·카드·비밀번호 토큰표, autocomplete=\"off\"가 듣지 않는 경우, :autofill 스타일링, 자동 완성을 깨는 흔한 실수를 정리한다."
tags: ["frontend", "html", "form", "autocomplete", "ux", "accessibility"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/forms/auto", "https://web.dev/learn/forms/autofill", "https://web.dev/articles/payment-and-address-form-best-practices", "https://web.dev/articles/sign-in-form-best-practices", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete", "https://developer.mozilla.org/en-US/docs/Web/CSS/:autofill"]
---

> web.dev의 「[Learn Forms](https://web.dev/learn/forms)」 강좌 중 「Help users avoid re-entering data in forms」, 「Autofill」 모듈과 「[Payment and address form best practices](https://web.dev/articles/payment-and-address-form-best-practices)」 글을 바탕으로, 토큰 목록과 문법은 MDN으로 확인해 재구성한 노트다.

## 자동 완성이 하는 일

사용자가 한 번 입력한 이름·주소·전화번호·카드·비밀번호를 브라우저가 저장해 두었다가, 다른 사이트의 같은 종류 칸에 **한 칸 또는 폼 전체를 한 번에** 채워 준다. 가입 때는 강한 비밀번호를 만들어 저장하고, 로그인 때 다시 꺼낸다.

- 가입·로그인·결제·배송·주소 폼에서 효과가 가장 크다. 입력 시간과 오타가 함께 준다.
- 기억하고 다시 쓰는 부담을 덜어 인지 장애·운동 장애 사용자에게 특히 중요하다. WCAG 성공 기준 1.3.5(Identify Input Purpose)가 개인 정보 칸에 입력 목적을 기계가 읽을 수 있게 하라고 요구하는 이유다([[accessible-forms|접근 가능한 폼과 오류 처리]]).

## 브라우저가 칸을 알아보는 방법

```text
1. autocomplete 값이 있으면 그것을 믿는다      ← 가장 확실
2. 없으면 휴리스틱: name · id · type · label 글자 · 주변 문맥
3. 둘 다 애매하면 아무것도 제안하지 않는다
```

휴리스틱은 브라우저마다 다르고 보장되지 않는다. 그래서 **autocomplete를 명시하고, name·id·type도 같은 뜻으로 맞춘다.**

```html
<label for="email">이메일</label>
<input id="email" name="email" type="email" autocomplete="email">
```

- `name`·`id`는 **배포가 바뀌어도 그대로** 둔다. 빌드마다 바뀌는 해시 id는 자동 완성과 비밀번호 관리자를 헷갈리게 한다.
- 표준 요소(`<input>`, `<select>`, `<textarea>`)를 쓴다. `<div>`로 만든 커스텀 드롭다운은 채워지지 않는다. 카드 유효 기간도 커스텀 위젯이 아니라 표준 요소로 받는다.
- 하나의 값은 **한 칸**으로 받는다. 카드 번호·전화번호를 칸 4개로 쪼개면 자동 완성과 붙여넣기가 함께 깨진다.

## 토큰 문법

`autocomplete`는 공백으로 나눈 토큰 목록이고, **순서가 정해져 있다.**

```text
[section-이름]  [shipping | billing]  [home | work | mobile | fax | pager]  필드 토큰  [webauthn]
   묶음 이름        주소 용도              연락처 종류(tel·email·impp 앞에만)    필수       항상 맨 끝
```

```html
<!-- 배송지와 청구지가 한 페이지에 있을 때 -->
<input name="ship-zip" autocomplete="shipping postal-code">
<input name="bill-zip" autocomplete="billing postal-code">

<!-- 같은 페이지의 두 사람 정보 -->
<input name="guest1-name" autocomplete="section-guest1 name">
<input name="guest2-name" autocomplete="section-guest2 name">

<input name="work-phone" autocomplete="work tel">
<input name="username" autocomplete="username webauthn">  <!-- 패스키 자동 완성 -->
```

## 자주 쓰는 토큰

| 분류 | 토큰 | 메모 |
| --- | --- | --- |
| 이름 | `name` | **한 칸으로 받을 때. 대부분 이것이 낫다** |
| | `given-name`, `family-name`, `additional-name` | 이름을 나눠 받을 때 |
| | `honorific-prefix`, `honorific-suffix`, `nickname` | 호칭 칸은 두지 않는 편이 낫다 |
| 계정 | `username` | 아이디. 이메일로 로그인하는 칸에도 쓴다 |
| | `current-password` | 로그인, 비밀번호 변경의 「현재 비밀번호」 |
| | `new-password` | 가입, 재설정, 변경의 「새 비밀번호」. 브라우저가 강한 비밀번호를 제안한다 |
| | `one-time-code` | SMS·인증 앱의 일회용 코드 |
| 연락처 | `email`, `tel` | `tel`은 국가 번호 포함 전체 번호 |
| | `tel-country-code`, `tel-national`, `tel-extension` 등 | 나눠 받아야만 할 때 |
| 주소 | `street-address` | 여러 줄 주소 전체. `<textarea>`에 |
| | `address-line1`, `address-line2`, `address-line3` | 줄을 나눌 때. `street-address`와 함께 쓰지 않는다 |
| | `address-level1` | 시·도, 주(state) |
| | `address-level2` | 시·군·구, 도시 |
| | `postal-code` | 우편번호 |
| | `country` / `country-name` | 국가 코드(`<select>`의 option value) / 국가 이름(텍스트 칸) |
| 회사 | `organization`, `organization-title` | 회사 이름, 직함 |
| 카드 | `cc-name`, `cc-number`, `cc-csc` | 카드 명의자, 번호, 보안 코드 |
| | `cc-exp` 또는 `cc-exp-month` + `cc-exp-year` | 유효 기간 한 칸 또는 두 칸 |
| | `cc-type` | 카드 종류. 번호로 판별되므로 칸을 따로 두지 않는다 |
| 기타 | `bday`, `bday-day`, `bday-month`, `bday-year` | 생년월일 |
| | `sex`, `language`, `url`, `photo` | |
| | `transaction-amount`, `transaction-currency` | 결제 금액·통화 |

전체 목록과 정의는 [MDN의 autocomplete 문서](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete)에 있다. **맞는 토큰이 있으면 항상 단다.**

## 자동 완성을 끄는 경우

`autocomplete="off"`는 「이 칸에는 저장된 값을 채우지 말라」는 뜻이다. 폼 요소에 달면 안의 칸이 상속한다.

| 끄는 게 맞는 곳 | 이유 |
| --- | --- |
| 허니팟 칸 | 자동 완성이 채우면 진짜 사용자가 봇으로 판정된다 |
| 매번 새로 정해지는 값(삭제 확인용으로 입력하는 문구, 거래마다 다른 확인 값) | 지난 값이 오히려 틀린 답이다 |
| 다른 사람의 정보를 받는 칸(관리자가 회원 정보를 입력) | 내 정보가 섞여 들어간다 |

- **로그인 칸에서는 `off`가 대개 무시된다.** 대부분의 브라우저는 비밀번호 관리자를 위해 로그인 폼의 `off`를 따르지 않는다. 막으려 하지 말고 맞는 토큰을 준다.
- 확신이 없으면 끄지 않는다. 끄는 것은 **그것이 사용자에게 도움이 된다고 확신할 때만**이다.
- 일회용 코드 칸에는 `off`가 아니라 `one-time-code`를 준다. 그래야 SMS로 온 코드를 키보드가 제안한다([[sign-in-sign-up-forms|로그인·가입 폼과 인증 입력]]).

## 채워진 칸 스타일링: :autofill

```css
input:autofill,
input:-webkit-autofill {        /* 오래된 WebKit·Blink 코드용 별칭 */
  outline: 2px solid #2b6cb0;
}
```

- 사용자가 값을 고치면 더는 맞지 않는다.
- 브라우저 기본 스타일이 `!important`로 배경색·글자색을 정하므로, **포커스된 채운 칸의 `background-color`·`color`는 덮어쓸 수 없다.** 테두리·`outline`·`box-shadow`로 표시한다.
- 지원이 브라우저마다 고르지 않으므로 두 선택자를 함께 쓰고, 스타일이 없어도 문제없게 만든다.

## 자동 완성을 깨는 흔한 실수

| 실수 | 결과 | 고치기 |
| --- | --- | --- |
| placeholder만 있고 label·autocomplete 없음 | 휴리스틱이 칸을 못 알아본다 | `<label>` + `autocomplete` |
| 칸 이름을 `field_1`, `input-a8f3`처럼 | 같은 이유 | 뜻 있는 `name`·`id`, 배포마다 고정 |
| 커스텀 드롭다운·날짜 위젯 | 값이 채워지지 않는다 | 표준 `<select>`·`<input>`을 꾸민다 |
| 값 하나를 여러 칸으로 분할 | 첫 칸만 채워지거나 아예 실패 | 한 칸 |
| 배송지·청구지에 같은 토큰 | 한쪽 값이 다른 쪽을 덮는다 | `shipping`·`billing` 접두 |
| 비밀번호 칸 붙여넣기 차단 | 비밀번호 관리자가 무력해진다 | 막지 않는다 |
| 페이지 전체를 `<form>` 하나로 | 로그인·검색 칸이 뒤섞여 인식 실패 | 구성 요소마다 별도 폼 |

## 정리

- 자동 완성은 사용자가 가장 빨리 폼을 끝내는 길이다. 휴리스틱에 맡기지 말고 `autocomplete`로 명시한다.
- 토큰 순서는 `section-` → `shipping`/`billing` → 연락처 종류 → 필드 → `webauthn`.
- 이름은 `name` 한 칸, 주소는 `street-address` 또는 `address-line1/2`, 카드는 `cc-*`, 비밀번호는 `new-`/`current-password`.
- `off`는 허니팟처럼 확실한 경우에만. 로그인 칸에서는 어차피 무시된다.
- 표준 요소, 고정된 name·id, 한 값 한 칸이 자동 완성의 기본 조건이다.

관련 노트: [[html-input-types|HTML 입력 요소 치트시트]], [[sign-in-sign-up-forms|로그인·가입 폼과 인증 입력]], [[payment-address-forms|결제·주소 폼]], [[accessible-forms|접근 가능한 폼과 오류 처리]], [[form-usability|더 나은 폼을 만드는 팁]]
