---
title: "로그인·가입 폼과 인증 입력"
concept: "Sign-in Forms"
summary: "가장 좋은 가입 폼은 없는 가입 폼이다. 필요할 때만 계정을 요구하고, 로그인·가입 폼은 비밀번호 관리자가 알아보게 만든다(new/current-password, 다른 name·id, 성공 감지, 붙여넣기 허용). 비밀번호 보기 버튼, 두 단계 로그인, 모바일 키보드 가림, 패스키 자동 완성(username webauthn), 일회용 코드(one-time-code·WebOTP), NIST SP 800-63B-4의 비밀번호 규칙, 계정 설정과 /.well-known/change-password까지 정리한다."
tags: ["frontend", "form", "auth", "security", "ux", "html"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/forms/identity", "https://web.dev/learn/forms/javascript", "https://web.dev/learn/forms/security-privacy", "https://web.dev/articles/sign-in-form-best-practices", "https://web.dev/articles/sign-up-form-best-practices", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API", "https://developer.mozilla.org/en-US/docs/Web/API/WebOTP_API", "https://pages.nist.gov/800-63-4/sp800-63b.html"]
---

> web.dev의 「[Learn Forms](https://web.dev/learn/forms)」 강좌 중 「Identity」, 「JavaScript」, 「Security and privacy」 모듈과 「[Sign-in form best practices](https://web.dev/articles/sign-in-form-best-practices)」, 「[Sign-up form best practices](https://web.dev/articles/sign-up-form-best-practices)」 글을 바탕으로, 패스키·WebOTP는 MDN, 비밀번호 규칙은 NIST SP 800-63B-4로 확인해 재구성한 노트다.

## 계정은 꼭 필요할 때만

가장 좋은 가입 폼은 없는 가입 폼이다. 로그인 벽은 이탈의 큰 원인이다.

| 상황 | 대안 |
| --- | --- |
| 장바구니·설정을 다음 방문까지 기억 | 브라우저 저장소로 충분하다 |
| 쇼핑몰 구매 | **비회원 결제를 기본**으로 둔다. 가입은 결제 뒤에, 이미 받은 정보로 한 번에 권하고 그 주문을 새 계정에 잇는다 |
| 가입 자체가 필요 | 소셜 로그인(연합 로그인)을 이메일·비밀번호와 나란히 둔다. 비밀번호를 받지도 저장하지도 않게 되고, 확인된 이메일도 얻는다([[oauth2\|OAuth 2.0]]) |

- 인증 시스템을 직접 만들기보다 검증된 ID 제공자를 쓰는 편이 대개 안전하다.
- 가입 폼은 **필수 칸만** 둔다. 주소·카드는 쓸 때 묻는다.
- 아이디(username)는 꼭 필요할 때만 받는다. 이메일이나 전화번호로 가입·로그인하게 하고, 백엔드에는 개인 정보와 무관한 고유 ID를 따로 둔다. 아이디를 받는다면 유니코드 글자를 허용하고 나중에 바꿀 수 있게 한다.
- 이메일이 없는 사용자도 있으므로 전화번호를 식별자로 허용하는 것을 고려한다.
- 로그인·가입 진입점은 상단의 분명한 글자 버튼으로 둔다. 모호한 아이콘이나 메뉴 깊숙한 곳에 숨기지 않는다.

## 비밀번호 관리자가 알아보게

로그인 폼의 품질은 대부분 **브라우저와 비밀번호 관리자가 폼을 정확히 이해하느냐**에 달렸다.

```html
<!-- 로그인 -->
<form id="sign-in" method="post" action="/sign-in">
  <label for="email">이메일</label>
  <input id="email" name="email" type="email" autocomplete="username" required>

  <label for="current-password">비밀번호</label>
  <input id="current-password" name="current-password" type="password"
         autocomplete="current-password" required>

  <button>로그인</button>
</form>

<!-- 가입: name·id를 로그인 폼과 다르게 -->
<form id="sign-up" method="post" action="/sign-up">
  <label for="new-email">이메일</label>
  <input id="new-email" name="new-email" type="email" autocomplete="email" required>

  <label for="new-password">비밀번호</label>
  <input id="new-password" name="new-password" type="password"
         autocomplete="new-password" required minlength="15"
         aria-describedby="password-rule">
  <p id="password-rule">15자 이상. 문장처럼 길게 써도 된다.</p>

  <button>계정 만들기</button>
</form>
```

| 규칙 | 이유 |
| --- | --- |
| 로그인 폼은 별도 `<form>`, 검색 등 다른 폼과 섞지 않는다 | 비밀번호 관리자가 칸을 묶는 단위가 폼이다 |
| 가입과 로그인의 `form`·`input`의 `name`·`id`를 **다르게** | 「새로 저장할 칸」과 「채울 칸」을 구분한다 |
| `new-password` / `current-password`를 정확히 | 새 비밀번호에는 생성 제안, 현재 비밀번호에는 저장된 값을 띄운다. 비밀번호 변경 폼에는 둘 다 쓴다 |
| 이메일 로그인 칸에 `autocomplete="username"` | 관리자가 이 값을 계정 이름으로 저장한다 |
| **붙여넣기를 막지 않는다** | 관리자와 긴 비밀번호를 막으면 사용자는 짧고 재사용된 비밀번호로 간다. NIST도 관리자·자동 완성 허용을 의무로 둔다. 접근성 측면은 [[accessible-forms\|접근 가능한 폼과 오류 처리]]의 3.3.8 |
| 생성된 강한 비밀번호를 거절하는 규칙을 두지 않는다 | 이상한 구성 규칙이 관리자의 제안을 튕겨 낸다 |
| 이메일·비밀번호를 두 번 받지 않는다 | 확인은 인증 메일·코드로 한다 |

### 성공을 알아차리게 하기

비밀번호 관리자는 「제출 후 다른 페이지로 갔다」를 로그인 성공 신호로 본다.

- 일반 폼 제출이면 성공 후 다른 페이지로 이동시킨다.
- `fetch`로 보낸다면 성공 응답 뒤 `history.pushState()`나 `replaceState()`로 이동을 흉내 내고, **비밀번호 폼을 DOM에서 지운다.**
- 비밀번호 변경 후에도 폼을 지우거나 숨겨야 새 값이 저장된다.

## 비밀번호 보기 버튼

가려진 비밀번호는 오타를 부르고, 모바일에서 특히 그렇다. 브라우저가 기본 토글을 주지 않으므로 버튼을 직접 단다.

```html
<label for="password">비밀번호</label>
<button type="button" id="toggle-password"
        aria-controls="password"
        aria-label="비밀번호를 글자로 보이기. 화면에 비밀번호가 표시된다.">보이기</button>
<input id="password" name="password" type="password" autocomplete="current-password" required>
<span class="visually-hidden" aria-live="polite" id="password-status"></span>
```

```js
const input = document.querySelector('#password');
const toggle = document.querySelector('#toggle-password');
const status = document.querySelector('#password-status');

toggle.addEventListener('click', () => {
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  toggle.textContent = show ? '숨기기' : '보이기';
  toggle.setAttribute('aria-label', show
    ? '비밀번호 숨기기'
    : '비밀번호를 글자로 보이기. 화면에 비밀번호가 표시된다.');
  status.textContent = show ? '비밀번호가 보인다.' : '비밀번호가 가려졌다.';
});
```

- **`type="button"`이 없으면 이 버튼이 제출 버튼이 된다.** 칸 앞에 있으면 Enter가 이 버튼을 누른다([[form-submission|폼 제출과 데이터 전송]]).
- `aria-label`에 「화면에 비밀번호가 표시된다」는 경고를 넣어 남 앞에서 실수로 드러내지 않게 한다. `aria-controls`는 읽지 않는 스크린 리더가 있어 라이브 영역으로 상태를 한 번 더 알린다.
- Microsoft Edge는 비밀번호 칸에 자체 보기 버튼을 그린다. 직접 만든 버튼과 겹치면 `input::-ms-reveal { display: none; }`로 숨긴다.

## 모바일에서의 로그인 화면

- 첫 화면에는 **아이디(이메일·전화) 칸, 비밀번호 칸, 로그인 버튼만** 둔다. 나머지는 아래로 내린다. 가상 키보드가 올라와도 버튼이 가려지지 않게 하려는 것이다. 실제 기기로 확인한다.
- 이메일을 먼저 받고 다음 화면에서 비밀번호를 받는 **두 단계 로그인**은 하나의 `<form>` 안에서 스크립트로 칸을 바꿔 보이게 만드는 것이 좋다. 페이지를 나눠야 한다면 두 번째 페이지에 이메일 값을 담은 숨은 칸을 둬서 비밀번호 관리자가 올바른 계정에 저장하게 한다.
- 탭 영역·글자 크기·간격 기준은 [[form-usability|더 나은 폼을 만드는 팁]]과 [[form-styling|폼 스타일링]]에 있다.
- 로그인 화면의 주소가 본 사이트와 다르면 로고·이름·스타일을 맞춰 피싱처럼 보이지 않게 한다. 이용약관·개인정보 처리방침 링크와 눈에 띄는 「비밀번호를 잊었나」 링크를 둔다.

## 비밀번호 규칙: NIST SP 800-63B-4

| 할 것 | 하지 말 것 |
| --- | --- |
| 단독 인증 수단이면 **최소 15자**, 다중 인증의 한 요소로만 쓰면 최소 8자 | 대문자·숫자·특수문자 섞기 같은 **구성 규칙 강제** |
| 최대 길이는 64자 이상 허용, 공백과 유니코드 허용 | **주기적 변경 강제**. 유출 증거가 있을 때만 바꾸게 한다 |
| 새 비밀번호를 흔한·유출된 비밀번호 목록과 대조(Have I Been Pwned 같은 서비스 또는 자체 목록) | 입력값 잘라 내기(truncation) |
| 비밀번호 관리자·자동 완성 허용, 붙여넣기 허용 | 비밀번호 힌트, 「어머니 성함」 같은 보안 질문 |

- 거절할 때는 **바로, 이유를 구체적으로** 말한다. 「유출된 적 있는 비밀번호다」처럼.
- 서버는 평문으로 저장·전송하지 않고, 자격 증명마다 다른 솔트로 검증된 해시 알고리즘을 쓴다. 해시 알고리즘을 직접 만들지 않는다.
- 로그인 기록(언제, 어디서)을 보여 주고, 이상 징후를 감시한다.

## 비밀번호를 넘어서

### 패스키와 자동 완성 UI

**패스키(passkey)** 는 WebAuthn 기반의 공개 키 자격 증명이다. 개인 키는 기기(인증기)에 남고 서버는 공개 키만 갖는다. 서명이 출처(origin)에 묶여 피싱 사이트에서 재사용할 수 없다. WebAuthn은 주요 브라우저가 모두 지원하며 HTTPS가 필요하다.

**조건부 미디에이션(conditional mediation)** 을 쓰면 별도 「패스키로 로그인」 버튼 없이, 아이디 칸의 자동 완성 목록에 저장된 비밀번호와 함께 패스키가 뜬다.

```html
<input id="email" name="email" type="email" autocomplete="username webauthn">
```

```js
if (await PublicKeyCredential.isConditionalMediationAvailable?.()) {
  const credential = await navigator.credentials.get({
    mediation: 'conditional',
    publicKey: {
      challenge: challengeFromServer,   // 서버가 만든 무작위 값
      rpId: 'example.com',
      // allowCredentials를 비워 두면 이 사이트의 패스키를 모두 제안한다
    },
  });
  // credential을 서버로 보내 서명을 검증한다
}
```

- `webauthn` 토큰은 autocomplete 목록의 **맨 끝**에 둔다([[form-autofill|자동 완성과 autocomplete 토큰]]).
- 조건부 UI에는 **찾을 수 있는 자격 증명(discoverable credential)** 만 뜬다. 패스키는 항상 이 종류다. 만들 때 `authenticatorSelection.residentKey: 'required'`를 준다.

### 일회용 코드: one-time-code와 WebOTP

```html
<label for="otp">인증 코드</label>
<input id="otp" name="otp" inputmode="numeric" autocomplete="one-time-code" required>
```

SMS 마지막 줄을 아래 형식으로 보내면 브라우저가 코드를 출처와 맞춰 본다.

```text
인증 코드는 123456이다.

@www.example.com #123456
```

| 방법 | 동작 |
| --- | --- |
| `autocomplete="one-time-code"` | 키보드·자동 완성이 방금 받은 코드를 제안한다. Safari(iOS·macOS)가 대표적이다 |
| WebOTP API | `navigator.credentials.get({ otp: { transport: ['sms'] } })`로 코드를 읽어 칸을 채운다. 사용자 동의 창이 뜬다. 실험적이며 Chromium 계열 일부(주로 Android)만 지원한다 |

```js
const input = document.querySelector('#otp');

if ('OTPCredential' in window) {
  const ac = new AbortController();
  input.form?.addEventListener('submit', () => ac.abort()); // 직접 입력해 제출하면 중단
  navigator.credentials
    .get({ otp: { transport: ['sms'] }, signal: ac.signal })
    .then((otp) => { input.value = otp.code; })
    .catch(() => {});
}
```

- 코드 칸은 **한 칸**으로 둔다. 한 글자씩 나눈 칸은 붙여넣기·자동 완성을 깨기 쉽다.
- **SMS는 약한 2단계 인증이다.** 번호가 재할당되거나 탈취될 수 있다. 다중 인증은 인증 앱, 보안 키, 패스키를 우선한다. 개인·민감 정보를 다루는 서비스는 다중 인증을 제공하거나 강제한다.

## 계정 설정

| 항목 | 원칙 |
| --- | --- |
| 바꿀 수 있는 것 | 이메일, 비밀번호, 아이디를 모두 바꿀 수 있게 한다. 계정과 신원을 분리해 한 계정에 여러 로그인 방법(비밀번호 + 소셜)을 이을 수 있게 한다 |
| 민감한 변경 | 개인 정보를 보거나 바꾸기 전, 결제 전에 다시 인증한다. 비밀번호 변경에는 현재 비밀번호를 받는다 |
| 변경 알림 | 이메일이 바뀌면 옛 주소와 새 주소 모두에 알리고, 되돌리기·계정 잠금 링크를 준다 |
| 비밀번호 재설정 | 눈에 띄는 링크와 OWASP 기준의 재설정 흐름 |
| `/.well-known/change-password` | 비밀번호 변경 페이지로 리디렉션해 두면 비밀번호 관리자가 「이 사이트 비밀번호 바꾸기」로 바로 데려온다 |
| 데이터와 탈퇴 | 내 데이터 내려받기와 계정 삭제(관련 데이터 전부)를 쉽게 한다. 지역에 따라 법적 의무다 |

공유 기기 사용을 고려해 세션 길이를 정하고, 새 기기에서는 이메일 코드로 비밀번호 없이 로그인하게 하는 방법도 있다.

## 정리

- 계정은 꼭 필요할 때만 요구하고, 비회원 결제와 소셜 로그인을 기본 선택지로 둔다.
- 폼은 비밀번호 관리자를 위해 만든다. 별도 폼, 다른 name·id, `username`·`current-password`·`new-password`, 성공 후 이동, 붙여넣기 허용.
- 비밀번호 보기 버튼은 `type="button"` + 경고 담은 `aria-label` + 라이브 영역.
- 비밀번호 규칙은 길이와 유출 목록 검사로. 구성 규칙과 주기적 변경 강제는 하지 않는다.
- 패스키는 `autocomplete="username webauthn"` + 조건부 미디에이션, 일회용 코드는 `one-time-code` 한 칸. SMS는 마지막 수단이다.

관련 노트: [[form-autofill|자동 완성과 autocomplete 토큰]], [[form-submission|폼 제출과 데이터 전송]], [[accessible-forms|접근 가능한 폼과 오류 처리]], [[oauth2|OAuth 2.0]], [[cookie-session|쿠키와 세션]], [[web-security|웹 보안: CSRF와 XSS]]
