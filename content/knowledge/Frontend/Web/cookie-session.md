---
title: "쿠키와 세션"
concept: "Cookie"
summary: "상태가 없는 HTTP에서 브라우저와 서버가 사용자를 기억하기 위해 쓰는 쿠키와 세션."
tags: ["http", "web", "browser", "security"]
source: til
date: "2026-10-13"
sources: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies"]
---

HTTP는 요청 하나하나가 독립적인 **무상태(stateless)** 프로토콜이라, 그대로는 "방금 로그인한 그 사용자"를 기억하지 못한다. **쿠키(Cookie)** 는 서버가 브라우저에 보내 저장시키는 작은 데이터 조각으로, 이후 같은 서버에 요청할 때마다 함께 전송되어 상태를 유지하게 해 준다. **세션(Session)** 은 쿠키를 이용해 상태를 서버 쪽에 보관하는 방식이다.

## 쿠키의 동작

1. 서버가 응답 헤더(`Set-Cookie`)로 쿠키를 보낸다.
2. 브라우저는 쿠키를 key-value 형태로 로컬에 저장한다.
3. 같은 서버에 다시 요청할 때 브라우저가 저장된 쿠키를 자동으로 함께 보낸다(`Cookie` 헤더).

쿠키로 사용자를 추적할 수 있고, 쿠키를 탈취당하면 계정 권한을 빼앗길 수도 있어 보안에 주의해야 한다.

## 사용 목적

| 목적 | 예 |
| --- | --- |
| 세션 관리 | 로그인 유지, 아이디 자동 완성, "오늘 하루 보지 않기" 팝업, 장바구니 |
| 개인화 | 사용자 선호, 테마 설정 |
| 트래킹 | 사용자 행동 기록·분석 |

## 쿠키의 수명

| 종류 | 삭제 시점 |
| --- | --- |
| 세션 쿠키(Session cookie) | 현재 세션이 끝나면 삭제. 종료 시점은 브라우저가 정한다(세션 복원 기능이 있으면 더 오래 남기도 함) |
| 영속 쿠키(Persistent cookie) | `Expires` 속성의 날짜 또는 `Max-Age` 속성의 기간이 지나면 삭제 |

## 쿠키 속성

`Set-Cookie: sid=abc; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=3600`처럼 속성을 붙여 범위와 보안을 정한다.

| 속성 | 역할 |
| --- | --- |
| `Domain`·`Path` | 어느 도메인·경로로 가는 요청에 실을지. `Domain`을 생략하면 쿠키를 만든 호스트에만 간다 |
| `Secure` | HTTPS 요청에만 싣는다 |
| `HttpOnly` | JavaScript(`document.cookie`)로 읽지 못하게 한다. 세션 쿠키에는 필수다 |
| `SameSite` | 다른 사이트에서 시작된 요청에 실을지. `Strict`(안 실음), `Lax`(최상위 GET 이동에만 실음), `None`(항상 실음, `Secure` 필수). 값을 생략하면 크롬·엣지는 `Lax`로 다룬다 |
| `Partitioned` | 서드파티 쿠키를 최상위 사이트별로 따로 저장한다(CHIPS). 임베드된 위젯이 사이트를 넘나들며 추적하지 못하게 한다 |

### 퍼스트파티와 서드파티 쿠키

주소창의 사이트가 직접 심은 쿠키가 **퍼스트파티**, 페이지에 들어 있는 다른 도메인(광고, 임베드)이 심은 쿠키가 **서드파티**다. 사파리와 파이어폭스는 서드파티 쿠키를 기본으로 막는다. 크롬은 단계적으로 없애려던 계획을 2025년에 철회하고 기본 허용을 유지한다. 브라우저마다 다르므로 로그인·결제 흐름은 서드파티 쿠키에 기대지 않게 설계한다.

## 세션

세션 방식은 민감한 정보를 쿠키에 직접 담지 않는다. 서버가 세션 데이터를 저장하고, 브라우저에는 그 데이터를 찾을 **세션 ID**만 쿠키로 준다.

```text
브라우저 ── 로그인 ──▶ 서버: 세션 생성(DB/메모리), session id 발급
브라우저 ◀─ Set-Cookie: sessionid=abc ── 서버
브라우저 ── Cookie: sessionid=abc ──▶ 서버: id로 세션 조회 → 사용자 식별
```

세션 저장소 확장(Redis), 세션 고정 공격, 토큰(JWT) 방식과의 비교는 [[session-vs-token-auth|세션 기반 인증과 토큰 기반 인증]]에 있다.

### 예: Django의 세션

- 세션은 미들웨어로 구현된다. `SessionMiddleware`가 요청 전반의 세션을 관리하고, `AuthenticationMiddleware`가 세션을 이용해 사용자를 요청(`request.user`)에 연결한다.
- 세션 데이터는 DB의 `django_session` 테이블에 저장되고, 브라우저는 세션 ID가 담긴 쿠키만 가진다.

## 핵심 정리

- 쿠키 = 서버가 브라우저에 저장시키고, 브라우저가 매 요청에 자동으로 실어 보내는 작은 데이터.
- 세션 = 상태는 서버에, 식별자(세션 ID)만 쿠키에 두는 방식.
- 쿠키가 "자동으로 전송된다"는 성질 때문에 [CSRF](/knowledge/dictionary/frontend/web/web-security) 같은 공격이 가능해진다. `HttpOnly`·`Secure`·`SameSite`로 범위를 좁힌다.

관련 노트: [[Computer-Science/Network/http|HTTP 프로토콜]], [[auth-user|Django User와 인증]], [[auth-jwt-passport|NestJS JWT 인증(토큰 방식)]], [[auth-flow|React로 회원가입·로그인 구현하기]], [[oauth2|OAuth 2.0]]
