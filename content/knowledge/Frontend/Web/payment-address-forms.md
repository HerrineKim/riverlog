---
title: "결제·주소 폼"
concept: "Checkout Forms"
summary: "결제 흐름은 비회원 결제를 기본으로, 단계와 다음 행동을 드러내고, 방해 요소를 걷어 낸다. 카드 칸은 한 칸·inputmode=\"numeric\"·cc-* 토큰·카드 종류 선택 없음, 이름은 한 칸과 유니코드 허용, 주소는 street-address 한 칸이나 address-line1/2, 우편번호는 선택 항목으로 둔다. 나라마다 다른 이름·주소·용어를 받아들이는 국제화 원칙과 enterkeyhint로 단계를 안내하는 법까지 정리한다."
tags: ["frontend", "form", "ux", "ecommerce", "i18n", "autocomplete"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/forms/payment", "https://web.dev/learn/forms/address", "https://web.dev/learn/forms/internationalization", "https://web.dev/articles/payment-and-address-form-best-practices", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/enterkeyhint"]
---

> web.dev의 「[Learn Forms](https://web.dev/learn/forms)」 강좌 중 「Payment forms」, 「Address forms」, 「Internationalization and localization」 모듈과 「[Payment and address form best practices](https://web.dev/articles/payment-and-address-form-best-practices)」 글을 바탕으로, 토큰과 속성 값은 MDN으로 확인해 재구성한 노트다.

## 결제 폼의 목표

결제 폼은 사이트에서 **가장 비싼 폼**이다. 여기서 막힌 사용자는 매출로 이어지지 않는다. 작은 화면은 입력이 고되므로 모바일에서 이탈이 특히 크다. 원칙은 하나다. **묻는 것을 줄이고, 브라우저가 채우게 하고, 무엇이 남았는지 보이게 한다.**

이 노트는 폼 설계만 다룬다. 실제 결제 처리는 결제 대행사(PG)나 Web Payments(Payment Request API)가 맡는다. 상품 탐색·옵션 선택 같은 쇼핑몰 UI는 [[ecommerce-ui|전자상거래 UI 디자인]]에 있다.

## 결제 흐름

| 원칙 | 방법 |
| --- | --- |
| **비회원 결제가 기본** | 결제 전에 가입을 요구하지 않는다. 가입은 결제 뒤에, 이미 입력한 정보로 권한다([[sign-in-sign-up-forms\|로그인·가입 폼과 인증 입력]]) |
| 진행 상황 보이기 | 단계 표시와 단계별 제목. 버튼 문구로 다음 단계를 말한다(「배송 정보 입력」 → 「결제 단계로」 → 「30,000원 결제」) |
| 주문 내용 고칠 수 있게 | 결제 페이지에서도 주문 상세를 보여 주고 수량을 바꿀 수 있게 한다. 이전 단계로 쉽게 돌아간다 |
| 방해 요소 걷기 | 결제 단계에서는 전체 내비게이션·검색·프로모션을 뺀다. 나갈 문을 줄인다 |
| 재방문 사용자 | 저장된 배송지·결제 수단·청구지를 입력 폼이 아니라 **글 + 「변경」 링크**로 보여 준다 |
| 다시 묻지 않기 | 「청구지 = 배송지」 체크박스. 같은 과정에서 받은 정보를 재입력시키지 않는다(WCAG 3.3.7, [[accessible-forms\|접근 가능한 폼과 오류 처리]]) |
| 두 번 결제 막기 | 결제 버튼은 **첫 클릭 뒤** 비활성화한다. 입력이 다 맞기 전에 막지는 않는다([[form-submission\|폼 제출과 데이터 전송]]) |

모바일 가상 키보드의 엔터 키로 흐름을 안내한다. 마지막 칸이 아닌 곳은 `enterkeyhint="next"`, 마지막 칸은 `done`, 단계를 오가는 폼은 `previous`도 쓸 수 있다.

## 카드 칸

```html
<label for="cc-name">카드에 적힌 이름</label>
<input id="cc-name" name="cc-name" autocomplete="cc-name" required enterkeyhint="next">

<label for="cc-number">카드 번호</label>
<input id="cc-number" name="cc-number" autocomplete="cc-number"
       inputmode="numeric" pattern="[\d ]{12,30}" required enterkeyhint="next">

<label for="cc-exp-month">유효 기간 월</label>
<select id="cc-exp-month" name="cc-exp-month" autocomplete="cc-exp-month" required>…</select>
<label for="cc-exp-year">유효 기간 연도</label>
<select id="cc-exp-year" name="cc-exp-year" autocomplete="cc-exp-year" required>…</select>

<label for="cc-csc">보안 코드</label>
<input id="cc-csc" name="cc-csc" autocomplete="cc-csc"
       inputmode="numeric" pattern="\d{3,4}" required enterkeyhint="done">

<button>30,000원 결제</button>
```

| 규칙 | 이유 |
| --- | --- |
| **카드 종류 선택 칸을 두지 않는다** | 결제 처리기가 번호로 판별한다. 필요하면 번호 앞자리를 보고 카드사 로고만 띄운다 |
| 번호는 **한 칸** | 4칸으로 나누면 칸 사이를 오가야 하고 자동 완성·붙여넣기가 깨진다 |
| `type="number"` 금지, `inputmode="numeric"` | `number`는 증감 화살표가 붙고 앞자리 0·긴 자릿수를 망친다. 크기를 비교하는 수(수량)에만 쓴다 |
| 공백 허용, 서버에서 제거 | 카드 앞면에 공백이 찍혀 있어 그대로 옮겨 적는다. 길이는 브랜드마다 달라 12~19자리 이상을 받아 준다 |
| 보안 코드는 3~4자리 | 브랜드마다 다르다. 「CVV」 같은 특정 브랜드 약어 대신 「보안 코드」 |
| 유효 기간은 표준 요소 | 커스텀 날짜 위젯은 자동 완성을 깨고 오래된 브라우저에서 실패한다. 한 칸으로 받는다면 `cc-exp`, 입력 마스크를 쓰면 키보드·스크린 리더로 반드시 확인한다 |
| 모든 칸 `required` | 결제 칸은 모두 필수다 |

지원하는 모든 카드 브랜드로 번호·보안 코드 검증 규칙을 시험한다. 검증 속성의 동작은 [[constraint-validation|제약 검증]]에 있다.

## 이름

| 원칙 | 방법 |
| --- | --- |
| **한 칸으로 받는다** | `autocomplete="name"`. 성이 없는 사람, 이름이 한 단어인 사람, 성과 이름 순서가 다른 문화가 있다 |
| 호칭 칸을 두지 않는다 | `honorific-prefix`는 대부분 브라우저가 채우지 않는다 |
| 모든 글자를 허용 | 라틴 문자만 받는 `pattern`을 걸지 않는다. 꼭 걸어야 하면 `[\p{L} \-]+`처럼 유니코드 글자로. 서버도 유니코드를 안전하게 처리해야 한다 |
| 나눠야 한다면 | `given-name`, `family-name`, `additional-name`. 일본어처럼 읽는 법이 필요한 언어는 발음 칸을 따로 둔다 |

## 주소

```html
<label for="name">이름</label>
<input id="name" name="name" autocomplete="name" enterkeyhint="next">

<label for="address">주소</label>
<textarea id="address" name="address" autocomplete="street-address" rows="3"></textarea>

<label for="postal-code">우편번호 (선택)</label>
<input id="postal-code" name="postal-code" autocomplete="postal-code" enterkeyhint="next">

<label for="country">국가/지역</label>
<select id="country" name="country" autocomplete="country">
  <option value="KR">대한민국</option>
  <option value="JP">일본</option>
</select>
```

| 원칙 | 방법 |
| --- | --- |
| 나라마다 형식이 다르다 | 미국식 「번지 / 도로명 / 시 / 주 / ZIP」 구조를 강제하지 않는다. 번지가 없는 주소도 있다 |
| 가장 유연한 방법 | 주소 전체를 `<textarea>` 하나에 `street-address`로. 어떤 형식이든 받고 붙여넣기도 쉽다. 단, 줄 단위로 저장한 자동 완성 데이터와는 덜 맞는다 |
| 줄을 나눈다면 | `address-line1`·`address-line2`. 「주소 2」는 사용자를 헷갈리게 하므로 「주소 2 (선택)」로 밝히거나 「주소 추가」 버튼 뒤에 숨긴다 |
| 많은 주소에 없는 칸은 선택 항목 | 우편번호, 영국의 county처럼 없는 나라·주소가 있는 칸에 `required`를 걸지 않는다 |
| 행정 구역 | `address-level1`(시·도, 주), `address-level2`(시·군·구, 도시) |
| 국가 | 코드를 값으로 쓰는 `<select>`에는 `country`, 이름을 입력받는 칸에는 `country-name` |
| 배송지와 청구지 | 같은 페이지에 둘 다 있으면 `shipping address-line1`, `billing postal-code`처럼 접두를 붙인다([[form-autofill\|자동 완성과 autocomplete 토큰]]) |

### 우편번호 검색은 보조 수단으로

우편번호를 넣으면 주소 목록을 띄우는 검색은 편해 보이지만, 데이터가 모든 주소를 담지 못하고, 우편번호 하나에 주소가 수십 개라 모바일에서 고르기 힘들다. **자동 완성으로 주소 전체를 채우는 쪽이 대개 더 빠르다.** 주소 검색 서비스를 쓰더라도 직접 입력을 막지 않는 추가 선택지로 둔다.

## 국제화

| 대상 | 원칙 |
| --- | --- |
| 용어 | 같은 칸도 이름이 다르다. 우편번호는 ZIP(미국), Postcode(영국), Postal code(캐나다), Eircode(아일랜드), PIN(인도). 「우편번호」, 「국가/지역」처럼 포괄적인 라벨을 쓴다 |
| 오류 문구 | 브라우저 기본 메시지는 브라우저 언어를 따른다. `setCustomValidity()`로 바꿨다면 그 문구도 번역한다 |
| 문서 언어 | `<html lang>`로 스크린 리더 발음과 번역 제안을 맞춘다. 번역본은 `hreflang`으로 잇는다([[multilingual-pages\|다국어 페이지: lang·hreflang과 국제화]]) |
| 번역 도구 | 보이는 텍스트는 HTML에 둔다. 스크립트로만 넣은 글자와 `aria-label`은 번역되지 않는 경우가 많다. 번역기로 폼 URL을 직접 돌려 본다 |
| 쓰기 방향 | 오른쪽에서 왼쪽으로 쓰는 언어는 `dir="rtl"`. 여백·테두리는 `margin-inline-start` 같은 논리적 속성으로 쓰면 방향이 바뀌어도 맞는다([[logical-properties\|쓰기 모드와 논리적 속성]]) |
| 테스트 데이터 | 다른 나라 주소, 비라틴 이름, 긴 이름으로 직접 채워 본다 |

## 정리

- 결제는 비회원 기본, 단계 표시, 방해 요소 제거, 금액이 적힌 버튼, 제출 후 비활성화.
- 카드는 한 칸 + `inputmode="numeric"` + `cc-*` 토큰. 카드 종류 칸과 `type="number"`는 쓰지 않는다.
- 이름은 `name` 한 칸, 모든 글자 허용.
- 주소는 `street-address` 한 칸 또는 `address-line1/2`, 우편번호처럼 없는 주소가 있는 칸은 선택 항목.
- 나라마다 다른 형식과 용어를 기본값으로 가정하고, 직접 다른 나라 데이터로 시험한다.

관련 노트: [[form-autofill|자동 완성과 autocomplete 토큰]], [[ecommerce-ui|전자상거래 UI 디자인]], [[constraint-validation|제약 검증: required·pattern·ValidityState]], [[multilingual-pages|다국어 페이지: lang·hreflang과 국제화]], [[form-usability|더 나은 폼을 만드는 팁]]
