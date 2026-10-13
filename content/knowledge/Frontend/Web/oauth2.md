---
title: "OAuth 2.0"
concept: "OAuth2"
summary: "비밀번호를 넘기지 않고 다른 서비스의 자원 접근 권한을 위임하는 OAuth 2.0. 네 역할, Authorization Code + PKCE 흐름, 토큰 종류, OIDC와의 차이, 프론트엔드 보안 주의점을 정리한다."
tags: ["security", "web", "auth", "oauth", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/323", "https://www.rfc-editor.org/rfc/rfc9700"]
---

## OAuth 2.0이란

OAuth 2.0은 **사용자가 비밀번호를 넘기지 않고, 내 앱이 다른 서비스(구글·깃허브 등)의 자원에 접근할 권한을 위임받는 표준**이다. 「구글로 로그인」, 「깃허브 저장소 접근 허용」 버튼 뒤에서 동작한다.

핵심은 **인가(Authorization)**, 즉 "무엇을 할 수 있나"다. "누구인가"를 확인하는 **인증(Authentication)** 은 그 위에 얹은 OIDC가 맡는다.

OAuth는 2007년 오픈소스 개발자와 소셜 미디어 업계 사람들이 "비밀번호를 건네지 않고 다른 사이트의 내 정보에 접근 권한을 줄 공통 수단"이 필요하다는 논의에서 시작했고, 구글 등의 지원으로 공개 표준이 되었다. 첫 버전인 OAuth 1.0은 모바일을 제대로 지원하지 못하고 서명 방식이 복잡했으며 보안 문제도 있어, 이를 보완한 **OAuth 2.0**이 2012년에 나왔다. 소셜 로그인이 가장 흔한 예지만, 로그인이 아니라 "내 연락처를 이 앱이 읽어도 된다"처럼 **제한된 범위의 접근 위임**이면 모두 OAuth의 쓰임새다.

## 네 가지 역할

| 역할 | 의미 | 예 |
| --- | --- | --- |
| Resource Owner | 자원의 주인 | 사용자 |
| Client | 권한을 위임받으려는 앱 | 내 서비스 |
| Authorization Server | 로그인·동의를 받고 토큰을 발급 | accounts.google.com |
| Resource Server | 토큰을 확인하고 자원을 내준다 | Google Calendar API |

## Authorization Code + PKCE 흐름

브라우저 앱·모바일 앱·서버 앱 모두에 권장되는 방식이다. OAuth 2.0 보안 모범 사례(RFC 9700, 2025)와 이를 본문에 합친 OAuth 2.1 초안이 모든 클라이언트에 PKCE를 요구한다.

```text
1. 앱이 code_verifier(난수)를 만들고, 그 해시인 code_challenge를 준비
2. 브라우저를 인가 서버로 이동
   /authorize?response_type=code&client_id=..&redirect_uri=..
             &scope=calendar.read&state=<난수>&code_challenge=..
3. 사용자가 로그인하고 "허용"을 누름
4. 인가 서버가 redirect_uri?code=<인가 코드>&state=<난수>로 돌려보냄
5. 앱이 state를 확인한 뒤, code + code_verifier로 토큰 요청 (/token)
6. 인가 서버가 Access Token (+ Refresh Token) 발급
7. 앱이 Authorization: Bearer <access token>으로 API 호출
```

- **state**: 4단계 응답이 내가 시작한 요청인지 확인한다. OAuth판 CSRF 방어다.
- **PKCE**: 인가 코드를 중간에 가로채도 `code_verifier`가 없으면 토큰으로 바꿀 수 없다.
- 과거 SPA에 쓰던 Implicit 방식(토큰을 URL로 바로 받음)과 사용자 비밀번호를 앱이 직접 받는 Password 방식은 **쓰지 않는다.**

## 토큰

| 토큰 | 용도 | 특징 |
| --- | --- | --- |
| Access Token | API 호출 권한 | 수명이 짧다(분~시간). scope만큼만 허용 |
| Refresh Token | 새 Access Token 발급 | 수명이 길다. 유출되면 위험하므로 가장 조심해서 보관 |
| ID Token (OIDC) | 사용자가 누구인지 | JWT. 이름·이메일 같은 프로필 클레임을 담는다 |

## OAuth vs OIDC

| 구분 | OAuth 2.0 | OpenID Connect |
| --- | --- | --- |
| 목적 | 인가: 자원 접근 권한 위임 | 인증: 로그인한 사용자 확인 |
| 결과물 | Access Token | ID Token + Access Token |
| 예 | 내 앱이 사용자의 캘린더를 읽기 | 「구글로 로그인」 |

**Access Token으로 로그인을 판단하면 안 된다.** 로그인은 OIDC의 ID Token으로 확인한다.

## 프론트엔드 보안 주의점

- `client_secret`은 브라우저 코드에 넣지 않는다. 노출되는 클라이언트는 PKCE로 대신한다.
- 토큰을 `localStorage`에 두면 XSS 한 번에 털린다. 가능하면 **BFF(Backend for Frontend) 서버가 토큰을 보관**하고, 브라우저에는 `HttpOnly; Secure; SameSite` 세션 쿠키만 준다.
- `redirect_uri`는 인가 서버에 정확히 등록한 값만 허용되게 한다.
- scope는 필요한 최소한만 요청한다.
- 실제 구현은 직접 짜기보다 검증된 라이브러리(Auth.js, 각 IdP의 SDK)를 쓴다.

## 정리

- OAuth 2.0은 비밀번호 대신 토큰으로 권한을 위임하는 인가 표준이다.
- 지금의 기본 흐름은 Authorization Code + PKCE, 그리고 state 검증이다.
- 로그인(인증)은 OAuth 위의 OIDC가 맡는다.
- **토큰을 어디에 두느냐가 프론트엔드 보안의 핵심**이다.

관련 노트: [[cookie-session|쿠키와 세션]], [[web-security|웹 보안: CSRF와 XSS]], [[auth-jwt-passport|NestJS JWT 인증]], [[auth-flow|React로 회원가입·로그인 구현하기]], [[https|HTTPS와 TLS]]
