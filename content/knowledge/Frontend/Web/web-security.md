---
title: "웹 보안: CSRF와 XSS"
concept: "CSRF"
summary: "사용자의 권한을 도용하는 CSRF와 악성 스크립트를 주입하는 XSS의 원리와 방어법."
tags: ["security", "web", "http", "django"]
source: til
date: "2026-10-13"
---

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

### 방어

- 사용자 입력을 HTML로 그대로 삽입하지 않는다. JavaScript에서는 `innerHTML` 대신 `textContent`/`innerText`를 쓴다([DOM 조작](/knowledge/dictionary/frontend/javascript/dom-manipulation) 참고).
- 출력 시 HTML 이스케이프 처리를 한다. React·Django 템플릿은 기본적으로 이스케이프한다(React의 `dangerouslySetInnerHTML`은 예외이므로 주의).
- 세션 쿠키에 `HttpOnly` 속성을 주어 스크립트에서 읽지 못하게 한다.
- **CSP(Content Security Policy)** 헤더로 실행할 수 있는 스크립트의 출처를 제한한다. 인라인 스크립트를 막고 nonce·hash가 맞는 스크립트만 허용하면, 주입된 스크립트가 있어도 실행되지 않는다.
- 사용자가 쓴 HTML(리치 텍스트)을 보여 줘야 하면 DOMPurify 같은 정제 라이브러리를 거친다.

## 비교

| 구분 | CSRF | XSS |
| --- | --- | --- |
| 공격 방식 | 사용자 권한으로 위조 요청을 보내게 함 | 페이지에 악성 스크립트를 삽입 |
| 악용하는 점 | 브라우저가 쿠키를 자동 전송 | 사이트가 입력을 검증 없이 출력 |
| 대표 방어 | CSRF 토큰, `SameSite` 쿠키, `Origin` 검사 | 출력 이스케이프, `innerHTML` 지양, CSP, `HttpOnly` 쿠키 |

## 핵심 정리

- CSRF는 "사용자가 원치 않은 요청"을, XSS는 "사이트가 원치 않은 스크립트"를 실행시킨다.
- CSRF는 서버가 발급한 토큰으로, XSS는 입력을 HTML로 해석하지 않는 것으로 막는다.

관련 노트: [[security|정보 시스템 보안(공격 기법과 암호)]], [[cookie-session|쿠키와 세션]], [[cors|CORS]], [[oauth2|OAuth 2.0]], [[https|HTTPS와 TLS]], [[api-security|API 보안 체크리스트]]
