---
title: "API 보안 체크리스트"
concept: "API Security"
summary: "API를 공개하기 전에 점검할 보안 항목을 전송·입력·인증과 인가·노출 범위·운영 단계로 묶었다. 한 가지 방어에 기대지 말고 여러 겹을 쌓는 게 핵심이다."
tags: ["backend", "security", "api", "http", "web"]
source: other
date: "2026-10-12"
sources: ["https://bytebytego.com/guides/a-cheatsheet-to-build-secure-apis", "https://bytebytego.com/guides/top-12-tips-for-api-security", "https://bytebytego.com/guides/a-cheat-sheet-for-api-designs", "https://owasp.org/API-Security/", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/network.md"]
---

> SNS에서 돌던 「API Security」 체크리스트 13가지를 정리한 노트다. 원문 번역이 아니라 요약·재구성했다. ByteByteGo의 System Design 101 가이드 「[A Cheatsheet to Build Secure APIs](https://bytebytego.com/guides/a-cheatsheet-to-build-secure-apis)」, 「[Top 12 Tips for API Security](https://bytebytego.com/guides/top-12-tips-for-api-security)」, 「[A cheat sheet for API designs](https://bytebytego.com/guides/a-cheat-sheet-for-api-designs)」로 보강했다. 레이트 리밋 알고리즘은 「[fru1tworld/cs-basic 모의 면접 질문 목록](https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/network.md)」의 질문을 기준으로 보강했다.

## API 보안이란

API는 서버의 데이터와 기능을 외부에 여는 문이다. 브라우저 화면과 달리 누구나 직접 호출할 수 있으므로 **클라이언트가 보낸 것은 모두 믿지 않는다**는 전제로 설계한다.

체크리스트 항목은 요청이 서버에 닿기까지의 흐름을 따라 다섯 단계로 묶을 수 있다.

```text
클라이언트
  │  ① 전송      HTTPS
  ▼
API 게이트웨이  ⑤ 운영   레이트 리밋 · 트래픽 관리
  │
  ▼
서버
  ├─ ② 입력      검증
  ├─ ③ 신원·권한  인증 → 인가 → 최소 권한 · 세션 · API 키
  ├─ ④ 노출      응답 데이터 최소화 · 보안 헤더
  └─ ⑤ 운영      로깅 · 취약점 스캔
```

## 체크리스트

### 1. 전송: 데이터를 암호화한다

| 항목 | 할 일 |
| --- | --- |
| HTTPS 강제 | 모든 트래픽을 HTTPS로만 받는다. 전송 중 도청·변조를 막는다 |

### 2. 입력: 들어오는 값을 검증한다

| 항목 | 할 일 |
| --- | --- |
| 엄격한 입력 검증 | 타입·길이·형식을 서버에서 검사해 인젝션 같은 공격을 막는다 |

클라이언트 검증은 사용성을 위한 것이고, 보안 검증은 **반드시 서버에서** 다시 한다.

### 3. 신원과 권한: 누구이고 무엇을 할 수 있나

| 항목 | 할 일 |
| --- | --- |
| 강한 인증(Authentication) | OAuth 2.0·OpenID Connect 같은 검증된 프로토콜을 쓴다. 인가 코드 흐름에는 PKCE를 붙이고 implicit·password 흐름은 쓰지 않는다. 사용자 로그인에는 패스키(WebAuthn)를 지원한다 |
| 엄격한 인가(Authorization) | 리소스에 접근하기 전에 매번 권한을 확인한다 |
| 최소 권한(Least Privilege) | 사용자에게 꼭 필요한 만큼만 권한을 준다 |
| 안전한 세션 쿠키 | 세션 쿠키에 `HttpOnly`와 `Secure` 플래그를 건다 |
| API 키 관리 | 키를 안전한 곳에 저장하고 주기적으로 교체(rotate)한다 |
| 등급별 API 키 | 읽기 전용·읽기 쓰기처럼 권한마다 키를 나눠 발급한다. 키가 새도 피해가 그 권한으로 한정된다. 서버 간 호출은 키 자체를 보내지 않는 요청 서명을 쓴다([[api-request-signing\|API 키와 HMAC 요청 서명]]) |
| 역할 기반 접근 제어(RBAC) | 사용자마다 권한을 따로 주지 않고 역할에 권한을 묶어 관리한다. 권한 누락·과다를 줄인다 |
| JWT 운용 | Basic 인증 대신 표준 토큰을 쓴다. 서명 비밀키는 추측할 수 없는 긴 무작위 값으로, 액세스 토큰 만료는 짧게 둔다 |

OAuth의 보안 권고는 RFC 9700(OAuth 2.0 Security Best Current Practice, 2025)에 모여 있고, 이를 본문에 반영한 OAuth 2.1은 2026년 10월 기준 아직 IETF 초안이다. ([RFC 9700](https://datatracker.ietf.org/doc/rfc9700/), [OAuth 2.1 초안](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/))

**인증은 "누구인가", 인가는 "이걸 해도 되는가"다**. 로그인만 확인하고 리소스 소유자를 확인하지 않으면 남의 데이터를 ID만 바꿔 조회할 수 있다.

### 4. 노출: 내보내는 것을 줄인다

| 항목 | 할 일 |
| --- | --- |
| 데이터 노출 최소화 | 클라이언트에 필요한 필드만 응답한다 |
| 보안 헤더 설정 | `Content-Security-Policy` 같은 헤더로 브라우저 쪽 공격을 줄인다 |
| 오류 응답 다듬기 | 스택 트레이스·SQL 오류·내부 경로를 응답에 싣지 않는다. 클라이언트에는 일반화한 메시지와 오류 코드만 주고 상세는 서버 로그에 남긴다 |
| 허용 목록(allowlist) | 관리용·내부용 API는 허용한 IP·클라이언트에서만 받는다 |
| 버전 관리 | 낡은 버전을 계속 열어 두면 고치지 않은 취약점이 남는다. 버전 목록을 관리하고 폐기 일정을 정한다 |

DB 모델을 그대로 직렬화해 보내면 비밀번호 해시나 내부 필드가 새기 쉽다. 응답 전용 DTO·시리얼라이저를 두는 이유다.

### 5. 운영: 남용을 막고 이상을 찾는다

| 항목 | 할 일 |
| --- | --- |
| 레이트 리밋(Rate Limiting) | IP·사용자·액션 그룹 단위로 호출 횟수를 제한해 남용을 막는다 |
| API 게이트웨이 | 관리·스로틀링·보안을 한곳에서 처리한다([[api-gateway\|API 게이트웨이]]) |
| 상세 로깅 | 접근과 에러를 기록해 의심스러운 활동을 감시한다 |
| 정기 취약점 스캔 | 자동화 도구로 API를 주기적으로 검사한다 |
| 민감 정보 로그 금지 | 카드 번호, 비밀번호, 토큰, 개인 식별 정보는 로그에 남기지 않거나 가린다 |
| OWASP API Security Top 10 점검 | 객체 수준 인가 누락(BOLA), 인증 결함, 과도한 데이터 노출, 자원 소비 제한 부재 같은 API 특유의 위험 목록으로 설계를 검토한다 |

#### 레이트 리밋 알고리즘

레이트 리밋은 「키(IP, 사용자, API 키)마다 일정 시간에 허용할 요청 수」를 세는 문제다. 세는 방법에 따라 순간 폭주(버스트)를 다루는 방식과 저장 비용이 다르다.

| 알고리즘 | 동작 | 버스트 | 저장 | 약점 |
| --- | --- | --- | --- | --- |
| 토큰 버킷(token bucket) | 버킷에 초당 r개씩 토큰이 차고(최대 b개), 요청마다 토큰 하나를 쓴다. 토큰이 없으면 거절 | **허용**: 쉬던 클라이언트는 최대 b개까지 한꺼번에 보낼 수 있다 | 키마다 토큰 수와 마지막 충전 시각 2개 | r과 b 두 값을 함께 튜닝해야 한다 |
| 리키 버킷(leaky bucket) | 요청을 큐(버킷)에 넣고 **일정한 속도로 하나씩 내보낸다**. 큐가 차면 거절 | **평탄화**: 들어온 폭주를 고른 출력으로 바꾼다 | 큐 길이 | 대기 지연이 생기고, 폭주 때 오래된 요청이 큐를 차지해 새 요청이 밀린다 |
| 고정 윈도 카운터(fixed window) | `12:00:00~12:00:59`처럼 시간 칸마다 카운터를 두고 한도를 넘으면 거절 | 경계에서 2배: 59초에 100개, 다음 칸 0초에 100개가 통과한다 | 키마다 카운터 1개(Redis `INCR` + `EXPIRE`) | 윈도 경계의 몰림 |
| 슬라이딩 윈도 로그(sliding window log) | 요청 시각을 모두 기록하고, 지금부터 지난 60초 안의 기록 수를 센다 | 정확하게 제한 | 요청마다 시각 1개(Redis 정렬 집합). 한도가 크면 메모리가 많이 든다 | 저장·계산 비용 |
| 슬라이딩 윈도 카운터(sliding window counter) | 현재 칸과 직전 칸의 카운터를 시간 비율로 섞어 추정한다. 예: 현재 칸이 30% 지났으면 `현재 + 직전 × 0.7` | 근사적으로 매끄럽다 | 키마다 카운터 2개 | 요청이 칸 안에 고르게 왔다고 가정한 근사값이다 |

- **고르는 기준**: API 호출 한도처럼 「평균은 지키되 잠깐의 몰림은 봐준다」면 토큰 버킷, 뒤쪽 시스템에 일정한 속도로만 넘겨야 하면 리키 버킷, 단순함이 우선이면 고정 윈도, 경계 몰림을 싸게 줄이려면 슬라이딩 윈도 카운터를 쓴다.
- **분산 환경**: 서버가 여러 대면 카운터를 Redis 같은 공용 저장소에 두고, 「읽고 비교하고 쓰기」를 Lua 스크립트나 원자 연산 하나로 묶어 경쟁 상태를 막는다. 저장소 왕복이 부담이면 서버마다 로컬로 세고 한도를 서버 수로 나누는 근사를 쓴다.
- **응답**: 넘으면 `429 Too Many Requests`와 `Retry-After`를 돌려주고, 남은 한도를 `X-RateLimit-Remaining` 같은 헤더(IETF에서 `RateLimit`·`RateLimit-Policy` 헤더로 표준화 중)로 알려 클라이언트가 스스로 속도를 줄이게 한다.
- **어디서 거나**: 보통 API 게이트웨이·리버스 프록시(Nginx `limit_req`는 리키 버킷 방식)에서 먼저 걸고, 사용자·요금제별 세밀한 한도는 애플리케이션에서 건다.

## 정리

- 체크리스트 항목은 **전송 → 입력 → 신원·권한 → 노출 → 운영** 순서로 보면 빠짐없이 점검하기 쉽다.
- 인증과 인가는 다른 단계다. 둘 다 서버에서 매 요청마다 확인한다.
- 응답은 필요한 만큼만, 권한도 필요한 만큼만 준다는 **최소화 원칙**이 여러 항목에 걸쳐 반복된다.
- 어느 하나로 완벽히 막을 수는 없다. 여러 겹을 쌓아 하나가 뚫려도 다음 겹이 막게 한다.

관련 노트: [[web-security|웹 보안: CSRF와 XSS]], [[oauth2|OAuth 2.0]], [[session-vs-token-auth|세션 기반 인증과 토큰 기반 인증]], [[https|HTTPS와 TLS]], [[cors|CORS]], [[rest-api|REST API 설계]], [[auth-placement|인증·인가 로직은 어디에 두나: 필터, 인터셉터, API 게이트웨이]], [[virtual-waiting-room|대기열 시스템(가상 대기실) 설계]], [[api-request-signing|API 키와 HMAC 요청 서명]], [[api-testing|API 테스트의 종류]]
