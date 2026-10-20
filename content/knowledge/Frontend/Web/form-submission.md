---
title: "폼 제출과 데이터 전송"
concept: "Form Submission"
summary: "<form>은 Enter 제출·검증·자동 완성·보조 기술 지원을 공짜로 주므로 데이터를 보내는 곳에는 항상 쓴다. GET과 POST 고르기, 제출 버튼의 종류와 type=\"button\" 함정, 제출 버튼을 언제 막는가, FormData와 fetch로 새로 고침 없이 보내는 점진적 향상, 같은 엔드포인트에서 HTML·JSON 응답 나누기, HTTPS·데이터 최소화·허니팟 같은 보안·개인정보 원칙을 정리한다."
tags: ["frontend", "html", "form", "javascript", "security", "privacy"]
source: other
date: "2026-10-20"
sources: ["https://web.dev/learn/forms/form-element", "https://web.dev/learn/forms/form", "https://web.dev/learn/forms/javascript", "https://web.dev/learn/forms/security-privacy", "https://web.dev/learn/forms/attributes", "https://web.dev/articles/payment-and-address-form-best-practices", "https://web.dev/articles/sign-in-form-best-practices", "https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API"]
---

> web.dev의 「[Learn Forms](https://web.dev/learn/forms)」 강좌 중 「Use forms to get data from users」, 「The form element in depth」, 「JavaScript」, 「Security and privacy」 모듈과 「[Payment and address form best practices](https://web.dev/articles/payment-and-address-form-best-practices)」 글을 바탕으로, API 지원 범위는 MDN으로 확인해 재구성한 노트다.

## form 요소가 하는 일

`<form>`은 입력 컨트롤을 담는 그릇이자 **브라우저에 내장된 제출 기능**이다. 감싸기만 하면 다음이 따라온다.

| 공짜로 얻는 것 | 직접 만들면 |
| --- | --- |
| 아무 칸에서나 Enter로 제출(암묵적 제출) | 키 이벤트를 칸마다 붙여야 한다 |
| `required`·`type`·`pattern` 제약 검증과 오류 풍선 | 검증과 오류 UI를 모두 다시 만든다 |
| 비밀번호 관리자·자동 완성의 폼 인식 | 브라우저가 로그인 폼인지 모른다 |
| 스크린 리더의 폼 탐색 | 역할과 이름을 ARIA로 덧붙여야 한다 |
| JavaScript가 실패해도 동작하는 제출 | 스크립트가 깨지면 폼도 죽는다 |

- **값을 저장하거나 처리하는 곳에는 `<form>`을 쓴다.** 제출하지 않는 컨트롤(페이지 안에서 목록을 거르는 `<select>`)에는 필요 없다.
- `<div>`와 클릭 핸들러로만 만든 폼은 위 기능을 흉내 내도 덜 견고하다. 새로 고침 없이 보내고 싶으면 `<form>`을 두고 JavaScript로 **향상**한다(아래 「새로 고침 없이 보내기」).
- **UI 구성 요소마다 별도 `<form>`** 을 둔다. 검색과 로그인을 한 폼에 넣거나 페이지 전체를 폼 하나로 감싸면 비밀번호 관리자와 자동 완성이 헷갈린다.

`action`·`method`·`enctype` 속성표와 무엇이 전송되는지의 규칙은 [[html|HTML 기초와 HTML5]]의 form 절에 있다. 여기서는 제출의 동작과 판단 기준을 다룬다.

## 어디로, 어떻게 보내나

```text
제출(버튼 클릭 · Enter · requestSubmit())
  └─ 제약 검증 (novalidate·formnovalidate면 건너뜀)
       └─ submit 이벤트  ← 여기서 preventDefault()하면 페이지 이동 없음
            └─ method·action·enctype에 따라 요청 생성
                 ├─ GET  → action?name=value&...  (URL에 붙음)
                 └─ POST → 요청 본문에 실음
```

- `action`이 없으면 **현재 페이지 URL**로, `method`가 없으면 **GET**으로 보낸다.
- 파일을 보내려면 `method="post"`와 `enctype="multipart/form-data"`가 둘 다 있어야 한다. 기본 인코딩(`application/x-www-form-urlencoded`)으로는 파일 이름만 간다.
- 버튼의 `formaction`·`formmethod`·`formenctype`·`formnovalidate`는 그 버튼으로 제출할 때만 폼의 값을 덮어쓴다. 「임시 저장」과 「발행」처럼 한 폼에 목적지가 둘일 때 쓴다.
- 레이아웃 때문에 칸이나 버튼을 `<form>` 바깥에 둬야 하면 `form` 속성에 폼의 `id`를 준다. 그 폼과 함께 제출된다.

```html
<form id="order" action="/order">…</form>
<textarea name="memo" form="order"></textarea>
<button type="submit" form="order">주문</button>
```

### GET과 POST 고르기

| | GET | POST |
| --- | --- | --- |
| 데이터 위치 | URL 쿼리 문자열 | 요청 본문 |
| 남는 곳 | 방문 기록, 북마크, 서버·프록시 로그, 공유된 링크 | 처리하는 백엔드만 본다 |
| 맞는 곳 | 검색·필터처럼 **결과를 공유·북마크할 만한** 요청 | 로그인, 개인 정보, 결제, 상태를 바꾸는 모든 요청 |

HTTPS는 두 방식 모두 전송 구간을 암호화하지만, GET의 URL은 기록과 로그에 평문으로 남는다. **개인 정보나 민감 정보는 POST로 보낸다.**

## 제출 버튼

제출 수단은 세 가지다.

| 방법 | 비고 |
| --- | --- |
| `<button>` | 기본 type이 `submit`이다. 안에 아이콘·텍스트를 자유롭게 넣을 수 있어 가장 많이 쓴다 |
| `<input type="submit" value="저장">` | 글자는 `<label>`이 아니라 `value`로 준다 |
| `<input type="image" src alt>` | 이미지 버튼. CSS로 버튼을 꾸밀 수 있으니 쓸 이유가 거의 없다 |

### type="button" 함정

**폼 안의 `<button>`은 type을 안 쓰면 제출 버튼이다.** Enter를 누르면 브라우저는 **폼에서 첫 번째 제출 버튼**을 누른 것으로 친다. 그래서 「비밀번호 보기」 같은 보조 버튼이 진짜 제출 버튼보다 앞에 type 없이 있으면, Enter가 그 버튼을 누른다.

```html
<form method="post" action="/login">
  <label for="password">비밀번호</label>
  <input id="password" name="password" type="password" autocomplete="current-password" required>
  <button type="button" id="toggle-password">비밀번호 보기</button>  <!-- type 필수 -->
  <button>로그인</button>
</form>
```

### 버튼 문구와 비활성화

- 문구는 **누르면 무슨 일이 일어나는지** 쓴다. 「제출」, 「계속」보다 「로그인」, 「계정 만들기」, 「결제 단계로」, 「30,000원 결제」가 낫다. 결제 버튼에는 금액을 넣는다.
- **입력이 다 맞을 때까지 제출 버튼을 `disabled`로 막지 않는다.** 사용자는 버튼이 고장 났다고 여기고, 무엇이 틀렸는지 알려 줄 기회도 사라진다. 누르게 두고 오류를 보여 준다([[constraint-validation|제약 검증]]).
- **제출한 뒤에는 막는다.** 결제·로그인 버튼은 자주 두 번 눌린다. 첫 클릭 뒤 처리 중에는 비활성화해 중복 요청을 막는다.
- **시간 제한을 두지 않는다.** 입력 도중 세션이 끝나 데이터를 잃게 하지 않는다. 꼭 필요하면 미리 알리고 연장할 수 있게 한다.
- 모바일 키보드의 엔터 키에는 `enterkeyhint`로 다음 동작(`next`, `done`, `search`, `send`)을 적는다([[html-input-types#enterkeyhint: 엔터 키에 할 일을 적는다|HTML 입력 요소 치트시트]]).

## 새로 고침 없이 보내기: 점진적 향상

폼은 HTML만으로 먼저 동작하게 만들고, JavaScript는 그 위에 얹는다.

```js
const form = document.querySelector('#comment-form');
const status = document.querySelector('#comment-status'); // aria-live="polite"

form.addEventListener('submit', async (event) => {
  event.preventDefault();                 // 기본 페이지 이동을 막는다
  const button = event.submitter;         // 어떤 버튼으로 제출했나
  button.disabled = true;                 // 중복 제출 방지

  const res = await fetch(form.action, {
    method: form.method,
    body: new FormData(form),             // name/value 쌍, 파일 포함
    headers: { Accept: 'application/json' },
  });

  status.textContent = res.ok ? '댓글을 올렸다.' : '댓글을 올리지 못했다. 다시 시도한다.';
  button.disabled = false;
});
```

| 도구 | 쓰임 |
| --- | --- |
| `new FormData(form)` | 폼 제출과 같은 형식의 key/value 묶음. 버튼 값까지 넣으려면 `new FormData(form, event.submitter)` |
| `fetch()` | 본문이 `FormData`면 `multipart/form-data` 헤더를 알아서 붙인다. `Content-Type`을 직접 쓰지 않는다 |
| `form.requestSubmit()` | 스크립트에서 제출할 때. 검증과 `submit` 이벤트를 거친다. `form.submit()`은 둘 다 건너뛴다 |
| `aria-live="polite"` 영역 | 페이지 이동 없이 끝난 결과를 스크린 리더에 알린다 |

- 서버는 같은 엔드포인트에서 일반 폼 POST에는 HTML(리디렉션)을, `Accept: application/json` 요청에는 JSON을 돌려주면 스크립트 유무와 상관없이 동작한다.
- `FormData`는 `name`이 있는 컨트롤만 모은다. `disabled` 컨트롤과 체크되지 않은 체크박스는 빠진다. `Object.fromEntries(data)`로 객체로 바꾸고, 같은 이름이 여럿이면 `data.getAll()`을 쓴다.
- Enter로 암묵적 제출이 일어나면 첫 제출 버튼에 **`click` 이벤트가 만들어진다.** 누르지 않았는데 버튼의 `click` 리스너가 도는 이유다. 제출 처리는 버튼 `click`이 아니라 폼 `submit`에 둔다.
- 필수·형식 검사는 HTML 제약 검증에 먼저 맡긴다. 검증을 통과해야 `submit`이 일어나므로, 그것으로 안 되는 규칙만 `submit`에서 검사해 `preventDefault()`로 막는다.
- `form.submit()`은 문서 안에 붙은 폼에서만 동작한다. 스크립트로 만든 폼으로 다른 페이지에 GET/POST를 보내려면 `document.body.append(form)` 뒤에 부른다.
- `input.value`(프로퍼티)는 **지금 값**, `input.getAttribute('value')`는 **처음 값**이다. 「변경 사항이 있는가」 판단에 둘을 비교할 수 있다(`defaultValue`도 처음 값이다).
- 라디오에서 「기타」를 고르면 추가 칸을 보여 주는 식의 조건부 칸은, 숨긴 칸도 스크립트 없이 제출에 문제가 없게 만든다. 열림 상태를 스크린 리더에 알리려고 `aria-controls`·`aria-expanded`를 붙여도, 라디오의 `aria-expanded`는 읽어 주지 않는 스크린 리더가 있다.

## 보안과 개인정보

| 원칙 | 방법 |
| --- | --- |
| **필요한 것만 묻는다** | 칸마다 「정말 필요한가」를 따진다. 칸이 줄면 이탈률, 유출 위험, 법적 책임이 함께 준다. 저장은 필요한 것만, 동의를 받은 뒤에 한다 |
| 전송 암호화 | 폼이 없는 페이지까지 **모든 페이지를 HTTPS**로 두고 HTTP는 HTTPS로 리디렉션한다([[https-migration\|HTTPS 전환: 인증서 고르기부터 리다이렉트까지]]) |
| 민감 정보는 POST | 위 「GET과 POST 고르기」 |
| 브라우저 저장소에 개인 정보 금지 | `localStorage`는 그 브라우저를 쓰는 누구나 읽는다([[web-storage\|Web Storage: localStorage와 sessionStorage]]) |
| 서버 검증과 출력 이스케이프 | 클라이언트 검증은 편의다. 서버에서 다시 검증하고, 사용자 입력은 출력할 때 이스케이프해 XSS를 막는다([[web-security\|웹 보안: CSRF와 XSS]]). HTML을 넣어야 하면 HTML Sanitizer API(`setHTML()`)가 있지만 아직 Baseline이 아니므로 검증된 정화 라이브러리를 함께 고려한다 |
| 투명성 | 개인 정보를 다루는 폼마다 개인정보 처리방침 링크를 둔다. 사용자가 자기 데이터를 보고, 고치고, 내려받고, 계정과 함께 지울 수 있게 한다. GDPR처럼 이것이 법적 의무인 지역이 있다 |

### 스팸 막기

| 방법 | 원리 | 주의 |
| --- | --- | --- |
| 허니팟(honeypot) | 사람에게는 안 보이는 칸을 두고, 채워져 온 제출은 서버가 버린다 | `autocomplete="off"`를 달아 브라우저 자동 완성이 채우지 않게 하고, 스크린 리더·키보드로도 닿지 않게 숨긴다 |
| CAPTCHA | 사람만 풀 수 있는 과제를 낸다 | 글자 받아 적기·퍼즐은 접근성 기준에 걸린다([[accessible-forms\|접근 가능한 폼과 오류 처리]]의 3.3.8). 키보드·스크린 리더로 직접 확인한다 |
| 스팸 판별 서비스 | 여러 사이트의 스팸 정보를 모아 사용자 모르게 거른다 | 제출 내용이 외부로 나가므로 처리방침에 밝힌다 |

**진짜 사용자를 막는 스팸 방어는 스팸보다 나쁘다.**

## 정리

- 데이터를 보내는 곳에는 `<form>`을 두고, 구성 요소마다 폼을 나눈다. 스크립트는 그 위에 얹는 향상이다.
- 공유할 결과는 GET, 개인·민감 정보와 상태 변경은 POST. 파일은 `multipart/form-data`.
- 폼 안의 보조 버튼에는 `type="button"`. 제출 버튼은 할 일을 문구로 말하고, 제출 전이 아니라 **제출 후에** 막는다.
- 스크립트 제출은 `preventDefault()` + `FormData` + `fetch()`, 결과는 `aria-live`로 알린다.
- 묻는 칸을 줄이는 것이 가장 강한 개인정보 보호다.

관련 노트: [[html|HTML 기초와 HTML5]], [[constraint-validation|제약 검증: required·pattern·ValidityState]], [[sign-in-sign-up-forms|로그인·가입 폼과 인증 입력]], [[form-usability|더 나은 폼을 만드는 팁]], [[web-security|웹 보안: CSRF와 XSS]], [[forms|폼과 제어 컴포넌트]], [[form-controls-dom|폼 컨트롤과 포커스 이벤트]]
