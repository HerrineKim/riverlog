---
title: "웹 보안: CSRF와 XSS"
concept: "CSRF"
summary: "사용자의 권한을 도용하는 CSRF와 악성 스크립트를 주입하는 XSS의 원리와 방어법."
tags: ["security", "web", "http", "django"]
source: til
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
- 쿠키의 `SameSite` 속성으로 다른 사이트에서 시작된 요청에 쿠키가 실리지 않게 하는 방법도 함께 쓴다.

### 예: Django

Django는 CSRF 방어를 위해 미들웨어(`CsrfViewMiddleware`)와 템플릿 태그를 제공한다.

```django
<form method="POST">
  {% csrf_token %}
  ...
</form>
```

- `{% csrf_token %}`은 `<input type="hidden">`으로 렌더링되며, value에 Django가 생성한 토큰 값이 들어간다.
- 토큰 없이 POST 요청을 보내면 서버는 `403 Forbidden`을 응답한다.

참고로 **미들웨어(middleware)** 는 HTTP 요청과 응답 처리 중간에서 동작하는 계층이다. Django에서는 요청이 미들웨어를 거쳐 URL에 연결된 view로 가고, 응답도 미들웨어를 거쳐 나간다. 프로젝트를 만들면 `settings.py`에 기본 미들웨어들이 등록되어 있다.

## XSS (Cross-Site Scripting)

공격자가 입력창(`<input>`, 게시글 등)을 통해 웹 페이지에 **악성 스크립트를 삽입**하는 공격이다. 다른 사용자의 브라우저가 그 스크립트를 실행하면서 쿠키 탈취, 사용자 사칭, 접근 제어 우회 등이 일어난다.

### 방어

- 사용자 입력을 HTML로 그대로 삽입하지 않는다. JavaScript에서는 `innerHTML` 대신 `textContent`/`innerText`를 쓴다([DOM 조작](/knowledge/dictionary/frontend/javascript/dom-manipulation) 참고).
- 출력 시 HTML 이스케이프 처리를 한다. React·Django 템플릿은 기본적으로 이스케이프한다(React의 `dangerouslySetInnerHTML`은 예외이므로 주의).
- 세션 쿠키에 `HttpOnly` 속성을 주어 스크립트에서 읽지 못하게 한다.

## 비교

| 구분 | CSRF | XSS |
| --- | --- | --- |
| 공격 방식 | 사용자 권한으로 위조 요청을 보내게 함 | 페이지에 악성 스크립트를 삽입 |
| 악용하는 점 | 브라우저가 쿠키를 자동 전송 | 사이트가 입력을 검증 없이 출력 |
| 대표 방어 | CSRF 토큰, `SameSite` 쿠키 | 출력 이스케이프, `innerHTML` 지양, `HttpOnly` 쿠키 |

## 핵심 정리

- CSRF는 "사용자가 원치 않은 요청"을, XSS는 "사이트가 원치 않은 스크립트"를 실행시킨다.
- CSRF는 서버가 발급한 토큰으로, XSS는 입력을 HTML로 해석하지 않는 것으로 막는다.

관련 노트: [[security|정보 시스템 보안(공격 기법과 암호)]], [[cookie-session|쿠키와 세션]], [[cors|CORS]], [[oauth2|OAuth 2.0]], [[https|HTTPS와 TLS]]
