---
title: "제약 검증: required·pattern·ValidityState"
concept: "Constraint Validation"
summary: "브라우저 내장 검증은 HTML 속성(required·type·minlength·pattern·min·max·step)으로 켜고, CSS 의사 클래스(:invalid·:user-invalid)로 보여 주고, Constraint Validation API(ValidityState·setCustomValidity·checkValidity·reportValidity)로 넓힌다. pattern이 v 플래그로 컴파일되는 점, 빈 값은 pattern 검사를 하지 않는 점, 언제 오류를 띄울지, 서버 검증이 왜 따로 필요한지를 정리한다."
tags: ["frontend", "html", "form", "validation", "javascript", "css"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/forms/validation", "https://web.dev/learn/forms/javascript", "https://web.dev/learn/forms/attributes", "https://web.dev/articles/payment-and-address-form-best-practices", "https://web.dev/articles/sign-in-form-best-practices", "https://developer.mozilla.org/en-US/docs/Web/API/ValidityState", "https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity", "https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/pattern"]
---

> web.dev의 「[Learn Forms](https://web.dev/learn/forms)」 강좌 중 「Help users enter the right data in forms」, 「JavaScript」, 「Form attributes in depth」 모듈을 바탕으로, API 이름과 Baseline 상태는 MDN으로 확인해 재구성한 노트다.

## 제약 검증이란

**제약 검증(constraint validation)** 은 브라우저가 제출 직전에 각 컨트롤의 값을 속성으로 정한 규칙과 비교해, 어긋나면 제출을 멈추고 첫 오류 칸에 포커스와 메시지를 주는 기능이다. JavaScript 없이 켜지고, CSS와 JavaScript로 모양과 문구를 바꿀 수 있다.

```text
HTML 속성으로 규칙을 건다   required · type · minlength · pattern · min · max · step
CSS로 상태를 보여 준다      :required · :invalid · :user-invalid · :valid · :out-of-range
JS로 넓힌다                 element.validity · setCustomValidity() · reportValidity()
```

**프런트엔드 검증은 사용자를 돕는 장치이지 방어선이 아니다.** 요청은 브라우저를 거치지 않고도 보낼 수 있으므로, 서버는 저장·공유 전에 모든 값을 다시 검증한다.

## 규칙을 거는 속성

| 속성 | 실패하면 켜지는 `validity` 플래그 | 비고 |
| --- | --- | --- |
| `required` | `valueMissing` | 빈 값 금지. 라디오는 같은 `name` 묶음 중 하나에만 달아도 된다 |
| `type="email"`, `type="url"` | `typeMismatch` | `email`에 `multiple`을 주면 쉼표로 나눈 여러 주소를 각각 검사한다 |
| `minlength`, `maxlength` | `tooShort`, `tooLong` | 글자 수. `maxlength`는 대개 입력 자체를 막아 `tooLong`이 거의 켜지지 않는다 |
| `min`, `max` | `rangeUnderflow`, `rangeOverflow` | 숫자·날짜 type용 |
| `step` | `stepMismatch` | `step="0.01"`처럼 허용 간격 |
| `pattern` | `patternMismatch` | 정규식. 아래 절 참고 |
| (브라우저가 해석 불가) | `badInput` | `type="number"`에 숫자가 아닌 글자 등 |
| `setCustomValidity('…')` | `customError` | 스크립트로 정한 오류 |

모든 플래그가 거짓이면 `validity.valid`가 참이고 `:valid`가 맞는다. `ValidityState`는 모든 주요 브라우저에서 오래전부터 쓸 수 있다.

```html
<label for="password">비밀번호 (필수)</label>
<input id="password" name="password" type="password"
       required minlength="8" autocomplete="new-password"
       aria-describedby="password-rule">
<p id="password-rule">8자 이상 입력한다.</p>
```

**규칙은 제출 전에 보이게 쓴다.** 속성은 브라우저만 안다. 사람에게는 칸 아래 안내문으로 알리고 `aria-describedby`로 잇는다. 연결 방식과 필수 표시는 [[accessible-forms|접근 가능한 폼과 오류 처리]]에 있다.

### pattern의 규칙

- 값 **전체**가 맞아야 한다. 브라우저가 `^(?:` … `)$`로 감싼 것처럼 검사한다. 앞뒤에 `/`를 쓰지 않는다.
- 정규식은 **`v` 플래그**(unicodeSets)로 컴파일된다. 문자 클래스 안의 리터럴 `(` `)` `[` `{` `}` `/` `-` `|`는 백슬래시로 이스케이프해야 한다. 예전 `u` 플래그 기준으로 쓴 패턴이 조용히 무효가 될 수 있다.
- **빈 값에는 pattern 검사를 하지 않는다.** 꼭 채워야 하면 `required`를 함께 단다.
- `text`, `tel`, `email`, `url`, `password`, `search` type에만 적용된다.
- 이름처럼 세계 각국의 글자가 들어오는 칸은 라틴 문자만 허용하는 `[\w\-]+`가 아니라 `[\p{L} \-]+`처럼 유니코드 속성으로 쓴다. 그래도 이름은 되도록 제한하지 않는다([[payment-address-forms|결제·주소 폼]]).
- `title`은 일부 브라우저가 오류 풍선에 덧붙이지만 키보드·터치 사용자는 못 보는 경우가 많다. 요구 사항은 보이는 글로 쓴다.

```html
<!-- 카드 번호: 숫자와 공백, 공백은 서버에서 제거한다 -->
<input name="cc-number" autocomplete="cc-number" inputmode="numeric"
       pattern="[\d ]{12,30}" required>

<!-- 리터럴 하이픈은 이스케이프 -->
<input name="slug" pattern="[a-z0-9\-]{3,32}">
```

## CSS로 상태 보여 주기

| 의사 클래스 | 맞는 때 |
| --- | --- |
| `:required` / `:optional` | 필수 여부. 입력 전부터 필수 칸을 구분해 보여 줄 수 있다 |
| `:invalid` / `:valid` | 지금 값이 규칙에 맞는지. **페이지가 뜨자마자** 빈 필수 칸이 `:invalid`다 |
| `:user-invalid` / `:user-valid` | 사용자가 그 칸을 건드렸거나 제출을 시도한 **뒤에만**. 2023년 11월부터 모든 주요 브라우저가 지원한다(Baseline 널리 사용 가능) |
| `:out-of-range` / `:in-range` | `min`·`max` 범위 |
| `:placeholder-shown` | placeholder가 보이는 동안, 곧 비어 있는 동안 |

```css
/* 입력하기 전부터 빨간 칸이 뜨지 않게 */
input:user-invalid {
  border-color: crimson;
}
input:user-invalid + .hint::before {
  content: "오류: ";
  font-weight: bold;
}
```

`:user-invalid` 이전에는 `input:not(:placeholder-shown):invalid`로 「비어 있지 않을 때만」을 흉내 냈다. 색만으로 오류를 알리지 말고 아이콘이나 「오류:」 같은 글자를 함께 둔다.

## JavaScript로 넓히기: Constraint Validation API

| 멤버 | 하는 일 |
| --- | --- |
| `el.validity` | 위 표의 `ValidityState`. 어떤 규칙이 깨졌는지 플래그로 본다 |
| `el.validationMessage` | 브라우저가 띄울 메시지 문자열 |
| `el.checkValidity()` | 참/거짓만 돌려준다. 실패하면 `invalid` 이벤트를 쏘지만 풍선은 띄우지 않는다 |
| `el.reportValidity()` | 검사하고, 실패하면 풍선을 띄운다 |
| `el.setCustomValidity(msg)` | 빈 문자열이 아니면 **오류 상태로 만든다.** 빈 문자열을 넘겨야 풀린다 |
| `form.noValidate` / `novalidate` | 브라우저 풍선을 끄고 검증 UI를 직접 그릴 때. 제약과 `validity`는 그대로 쓸 수 있다 |

### 메시지 바꾸기

기본 문구는 브라우저와 브라우저 언어마다 다르다. 사이트 말투에 맞추거나 다국어로 옮기려면 `validity`를 보고 메시지를 고른다.

```js
const email = document.querySelector('#email');

function validateEmail() {
  const v = email.validity;
  if (v.valueMissing) {
    email.setCustomValidity('이메일을 입력한다.');
  } else if (v.typeMismatch) {
    email.setCustomValidity('이메일 형식이 아니다. 예: name@example.com');
  } else {
    email.setCustomValidity('');   // 반드시 비워야 다시 제출된다
  }
}

email.addEventListener('input', validateEmail);
email.addEventListener('invalid', validateEmail);
```

**`setCustomValidity()`로 넣은 메시지는 스스로 사라지지 않는다.** 값이 고쳐졌을 때 빈 문자열로 지우지 않으면 칸이 영원히 무효로 남아 폼이 제출되지 않는다. 그래서 `invalid`만이 아니라 `input`에서도 다시 판정한다.

### 「비밀번호 확인」처럼 칸끼리 비교하는 규칙

속성으로 표현할 수 없는 규칙은 `setCustomValidity()`로 같은 검증 흐름에 끼워 넣는다. 그러면 제출 차단, `:invalid` 스타일, 첫 오류 칸 포커스가 그대로 동작한다. 다만 비밀번호를 두 번 받는 것 자체가 좋은 설계는 아니다([[sign-in-sign-up-forms|로그인·가입 폼과 인증 입력]]).

## 언제 오류를 보여 주나

| 시점 | 판단 |
| --- | --- |
| 페이지 로드 직후 | 띄우지 않는다. `:invalid` 대신 `:user-invalid` |
| 타이핑 중 첫 입력 | 띄우지 않는다. 다 쓰기도 전에 「형식 오류」가 뜨면 불안을 준다 |
| 칸을 떠날 때(`blur`·`change`) | 처음 띄우기 좋은 때 |
| 한 번 오류가 뜬 뒤의 입력 | `input`마다 갱신해, 고치는 즉시 오류가 사라지게 한다 |
| 제출 시 | 모든 오류를 한꺼번에 표시하고 첫 오류 칸으로 포커스 |
| 서버가 거절했을 때 | 모든 문제를 한 번에 돌려주고 칸마다 표시한다. 서버 로그로 자주 나는 오류를 찾아 안내문을 고친다 |

비밀번호 강도처럼 규칙을 지키는 과정 자체가 정보인 칸은 입력 중 실시간 피드백이 도움이 된다. 오류 요약·`aria-invalid`·라이브 영역으로 스크린 리더에 알리는 법은 [[accessible-forms|접근 가능한 폼과 오류 처리]]에 있다.

## 정리

- 규칙은 먼저 HTML 속성으로 건다. `type`과 `required`만으로도 상당 부분이 끝난다.
- `pattern`은 전체 일치·`v` 플래그·빈 값 미검사라는 세 가지를 기억한다.
- 오류 스타일은 `:user-invalid`로, 색과 함께 글자·아이콘으로 보여 준다.
- 문구를 바꾸거나 칸 사이 규칙이 필요하면 `validity` + `setCustomValidity()`. 고쳐지면 빈 문자열로 꼭 푼다.
- 서버는 같은 규칙을 다시 검사한다.

관련 노트: [[accessible-forms|접근 가능한 폼과 오류 처리]], [[form-usability|더 나은 폼을 만드는 팁]], [[form-submission|폼 제출과 데이터 전송]], [[html-input-types|HTML 입력 요소 치트시트]], [[selectors|CSS 선택자와 우선순위]], [[react-hook-form|react-hook-form과 MUI Select]]
