---
title: "쿠키와 세션"
concept: "Cookie"
summary: "상태가 없는 HTTP에서 브라우저와 서버가 사용자를 기억하기 위해 쓰는 쿠키와 세션."
tags: ["http", "web", "browser", "security"]
source: til
date: "2026-10-20"
sources: ["https://ko.javascript.info/cookie", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies", "https://web.dev/learn/privacy/third-parties", "https://privacysandbox.google.com/blog/privacy-sandbox-next-steps"]
---

> TIL을 정리하고, 서드파티 쿠키 부분은 web.dev의 「[Learn Privacy](https://web.dev/learn/privacy)」 강좌와 Privacy Sandbox 공식 발표로 보강했다.

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
| `Partitioned` | 서드파티 쿠키를 최상위 사이트별로 따로 저장한다(CHIPS). 임베드된 위젯이 사이트를 넘나들며 추적하지 못하게 한다. `Secure`가 필수다 |

### JavaScript로 쿠키 다루기

`HttpOnly`가 없는 쿠키는 `document.cookie`로 읽고 쓸 수 있다. 인터페이스가 특이하다.

| 동작 | 방법 | 주의 |
| --- | --- | --- |
| 읽기 | `document.cookie` | `name=value; name2=value2` 한 문자열이다. 직접 나눠 파싱한다 |
| 쓰기 | `document.cookie = "user=" + encodeURIComponent(v) + "; path=/; max-age=3600"` | 대입 한 번에 **쿠키 하나만** 바뀐다. 다른 쿠키는 지워지지 않는다 |
| 지우기 | 같은 이름·`path`·`domain`으로 `max-age=0` | path나 domain이 다르면 다른 쿠키로 취급돼 지워지지 않는다 |

이름과 값은 `encodeURIComponent`로 인코딩한다. 쿠키 하나는 약 4KB, 도메인당 개수도 제한이 있다. 비동기로 쿠키를 읽고 쓰며 변경 이벤트까지 받는 Cookie Store API(`cookieStore.get()`·`set()`, `change` 이벤트)가 2025년에 Baseline이 됐다.

### 퍼스트파티와 서드파티 쿠키

주소창의 사이트가 직접 심은 쿠키가 **퍼스트파티**, 페이지에 들어 있는 다른 도메인(광고, 임베드)이 심은 쿠키가 **서드파티**다. 같은 도메인의 쿠키라도 어느 페이지 맥락에서 실리느냐에 따라 퍼스트파티도, 서드파티도 된다.

| 브라우저 | 서드파티 쿠키 기본 동작 |
| --- | --- |
| 사파리 | 예외 없이 차단(ITP) |
| 파이어폭스 | 최상위 사이트별로 분할(Total Cookie Protection) |
| 크롬 | 단계적 폐지를 철회하고 일반 창은 사용자 설정에 맡긴다(기본 허용). 시크릿 창은 차단 |

브라우저마다 다르므로 로그인·결제 흐름은 서드파티 쿠키에 기대지 않게 설계한다. 임베드 안의 상태는 `Partitioned`(CHIPS)로, 분할되지 않은 쿠키가 꼭 필요하면 Storage Access API로 처리한다. 브라우저별 세부 규칙과 크롬의 Privacy Sandbox 정리는 [[browser-tracking-protection|서드파티 쿠키와 브라우저 추적 방지]]에 있다.

## 쿠키와 Web Storage 비교

| 항목 | 쿠키 | localStorage | sessionStorage |
| --- | --- | --- | --- |
| 만드는 쪽 | 서버(`Set-Cookie`) 또는 JS | JS | JS |
| 수명 | `Expires`·`Max-Age`, 없으면 브라우저 세션 동안 | 지울 때까지 | 탭을 닫을 때까지 |
| 요청마다 자동 전송 | O | X | X |
| 범위 | 도메인·경로 | 출처(origin) | 출처 + 탭 |
| 용량 | 쿠키당 약 4KB | 출처당 약 5MiB | 출처당 약 5MiB |
| JS 접근 | `HttpOnly`면 불가 | 가능 | 가능 |

- 셋 다 문자열만 저장한다. 구조화된 큰 데이터는 IndexedDB를 쓴다.
- 탭을 복제하면 sessionStorage도 복사된다.
- 실제로 저장된 값은 DevTools Application 패널에서 보고 고칠 수 있다([[devtools-application|DevTools Application 패널]]).

## 세션

세션 방식은 민감한 정보를 쿠키에 직접 담지 않는다. 서버가 세션 데이터를 저장하고, 브라우저에는 그 데이터를 찾을 **세션 ID**만 쿠키로 준다. 로그인부터 조회까지의 흐름은 [[session-vs-token-auth|세션 기반 인증과 토큰 기반 인증]]에 있다.

로그아웃할 때는 서버의 세션을 지우고, 응답에 `Clear-Site-Data: "cookies", "storage"`를 붙여 브라우저에 남은 쿠키·저장소까지 지운다([[privacy-data-minimization|데이터 최소화와 프라이버시 실천]]).

세션 저장소 확장(Redis), 세션 고정 공격, 토큰(JWT) 방식과의 비교도 같은 노트에 있다.

Django는 `SessionMiddleware`로 세션을 처리하고 세션 데이터를 DB에 둔다 → [[auth-user|Django User와 인증]].

## 핵심 정리

- 쿠키 = 서버가 브라우저에 저장시키고, 브라우저가 매 요청에 자동으로 실어 보내는 작은 데이터.
- 세션 = 상태는 서버에, 식별자(세션 ID)만 쿠키에 두는 방식.
- 쿠키가 "자동으로 전송된다"는 성질 때문에 [CSRF](/knowledge/dictionary/frontend/web/web-security) 같은 공격이 가능해진다. `HttpOnly`·`Secure`·`SameSite`로 범위를 좁힌다.

관련 노트: [[Computer-Science/Network/http|HTTP 프로토콜]], [[browser-tracking-protection|서드파티 쿠키와 브라우저 추적 방지]], [[auth-user|Django User와 인증]], [[auth-jwt-passport|NestJS JWT 인증(토큰 방식)]], [[swr|SWR로 서버 데이터 가져오기(로그인 상태 판단)]], [[oauth2|OAuth 2.0]], [[devtools-application|DevTools Application 패널: 저장소·서비스 워커]], [[devtools-network|DevTools Network 패널]]
