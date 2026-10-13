---
title: "HTTPS와 TLS"
concept: "HTTPS"
summary: "HTTP를 TLS로 감싸 도청·변조·위장을 막는 HTTPS. 대칭키·공개키를 섞어 쓰는 TLS 핸드셰이크, 첫 HTTP 요청의 빈틈을 막는 HSTS와 preload, HTTPS만으로는 부족한 경우를 정리한다."
tags: ["network", "security", "http", "web", "frontend"]
source: mixed
date: "2026-10-12"
sources: ["https://yozm.wishket.com/magazine/detail/1852/", "https://yozm.wishket.com/magazine/detail/1862/"]
---

> 핸드셰이크·HSTS 부분은 테크유람의 요즘IT 연재 「[안전한 웹을 위해 HTTPS 이해하기 ①HTTPS의 작동 원리](https://yozm.wishket.com/magazine/detail/1852/)」·「[②HTTPS를 강제하는 HSTS 기술](https://yozm.wishket.com/magazine/detail/1862/)」(2023.01)을 요약·재구성해 보강했습니다.

## HTTPS란

HTTPS는 **HTTP 메시지를 TLS(Transport Layer Security)로 암호화해 주고받는 방식**이다. HTTP 자체는 바뀌지 않는다. HTTP와 TCP 사이에 TLS 계층이 하나 끼어들 뿐이다. 기본 포트는 443이다.

평문 HTTP는 중간 경로(공용 와이파이, 프록시, ISP)에서 내용을 그대로 읽고 바꿀 수 있다. HTTPS는 이 문제를 세 가지로 막는다.

| 보장 | 막는 것 | 수단 |
| --- | --- | --- |
| 기밀성 | 도청 | 대칭키 암호화 (AES, ChaCha20) |
| 무결성 | 변조 | MAC·AEAD로 메시지 검증 |
| 인증 | 서버 위장 | 인증 기관(CA)이 서명한 인증서 |

TLS는 SSL(Secure Socket Layer)을 개선한 후속 규격이다. 지금 쓰는 인증서는 거의 TLS용이지만 관습적으로 "SSL 인증서"라고 부른다.

## 대칭키와 공개키

| 구분 | 대칭키 | 공개키(비대칭키) |
| --- | --- | --- |
| 키 | 하나로 암호화·복호화 | 공개키·개인키 한 쌍. 짝이 맞는 키로만 풀린다 |
| 장점 | 빠르고 가볍다 | 키를 미리 나눠 갖지 않아도 된다 |
| 약점 | 키를 안전하게 건네기 어렵다. 유출되면 끝 | 연산이 무거워 대량 데이터에 부적합 |

HTTPS는 둘을 섞는다. **공개키로 대칭키(세션 키)를 안전하게 나눠 갖고, 이후 데이터는 대칭키로 암호화한다.**

## 인증서와 CA

서버는 "이 공개키는 example.com의 것"이라는 내용에 **CA가 서명한 인증서**를 보낸다. 브라우저는 OS·브라우저에 미리 들어 있는 루트 CA 목록으로 서명 사슬을 따라가 검증한다. 도메인이 다르거나, 만료됐거나, 신뢰할 수 없는 CA면 경고 화면을 띄운다.

Let's Encrypt 같은 무료 CA와 Vercel·Netlify 같은 호스팅이 인증서를 자동 발급·갱신해 주므로, 요즘은 직접 다룰 일이 드물다.

## TLS 핸드셰이크 (TLS 1.3 기준)

```text
브라우저                                서버
  │ ClientHello (지원 암호, 키 교환 값) ─▶ │
  │ ◀─ ServerHello (키 교환 값) + 인증서 + Finished
  │   [양쪽이 같은 세션 키를 계산]           │
  │ Finished ─────────────────────────▶ │
  │ ◀═══════ 암호화된 HTTP 요청·응답 ══════▶ │
```

- **공개키 방식은 키를 나눠 갖는 데만 쓴다.** 실제 데이터는 빠른 대칭키로 암호화한다.
- 암호 묶음(cipher suite)은 키 교환·인증·암호화·무결성 검증에 쓸 알고리즘 조합이다. ClientHello에서 후보를 보내고 서버가 하나를 고른다.
- TLS 1.3은 1-RTT로 핸드셰이크를 끝낸다(1.2는 2-RTT). HTTP/3는 QUIC 안에 TLS 1.3을 내장해 연결 수립을 더 줄인다.

### 고전적인 흐름: RSA 키 교환 (TLS 1.2까지)

설명 자료에서 자주 보는 흐름이다. 세션 키가 어떻게 만들어지는지 보기 쉽다.

| 단계 | 하는 일 |
| --- | --- |
| 1. Client Hello | 지원 TLS 버전, cipher suite 목록, 클라이언트 난수, (재접속이면) 세션 ID |
| 2. Server Hello | 고른 cipher suite, 서버 난수, CA가 서명한 인증서(서버 공개키 포함) |
| 3. 인증서 검증 | 브라우저가 내장된 CA 공개키로 서명을 확인한다. 위조·미등록 CA면 경고 |
| 4. premaster secret | 두 난수로 premaster secret을 만들어 **서버 공개키로 암호화**해 보낸다 |
| 5. 세션 키 생성 | 서버가 개인키로 풀고, 양쪽이 master secret → 세션 키(대칭키)를 만든다 |
| 6. 통신 | 세션 키로 암호화해 주고받고, 끝나면 폐기한다. 세션이 살아 있으면 세션 ID로 핸드셰이크를 줄인다 |

TLS 1.3은 이 RSA 키 교환을 없애고 (EC)DHE 키 교환만 남겼다. 서버 개인키가 나중에 유출돼도 지난 통신을 풀 수 없게(전방 비밀성) 하기 위해서다.

## 프론트엔드가 신경 쓸 것

| 항목 | 내용 |
| --- | --- |
| Mixed Content | HTTPS 페이지에서 `http://` 스크립트·이미지를 부르면 브라우저가 막거나 경고한다. 리소스 URL을 모두 https로 쓴다 |
| HSTS | 아래 절 참고 |
| `Secure` 쿠키 | HTTPS 연결에서만 전송되는 쿠키. 인증 쿠키에는 필수다 |
| 보안 컨텍스트 | Service Worker, 위치·카메라, Clipboard 같은 API는 HTTPS(또는 localhost)에서만 동작한다 |

## HSTS: HTTPS를 강제하기

### 리다이렉트만으로는 빈틈이 있다

흔히 `http://`로 들어오면 301·302로 `https://`로 보낸다. 하지만 **리다이렉트를 받기 전 첫 요청은 평문**이다. 같은 네트워크의 공격자가 이 요청을 가로채면(중간자 공격, MITM) 쿠키·세션을 훔치거나 가짜 페이지로 보낼 수 있다.

### Strict-Transport-Security 헤더

HSTS(HTTP Strict Transport Security, RFC 6797)는 서버가 "이 도메인은 앞으로 HTTPS로만 접속하라"고 알리고 브라우저가 이를 기억해 지키는 방식이다.

| 지시어 | 뜻 |
| --- | --- |
| `max-age=<초>` | 이 기간 동안 HTTPS로만 접속 |
| `includeSubDomains` | 모든 하위 도메인에도 적용 |
| `preload` | 브라우저 preload 목록 등록을 희망 |

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

- 헤더는 **HTTPS 응답에만** 싣는다. 평문 HTTP 응답은 중간에서 바뀔 수 있어 브라우저가 무시한다.
- 헤더를 받은 뒤 사용자가 `http://`로 접속하면 브라우저가 네트워크에 나가지 않고 **`307 Internal Redirect`** 로 바로 HTTPS로 바꾼다. 평문 요청 자체가 생기지 않는다.
- 많은 CDN이 HSTS를 설정 하나로 켜 준다.

### preload 목록

HSTS 헤더도 **처음 한 번은 받아야** 효과가 있다. preload 목록은 이 첫 방문의 빈틈까지 막는다. 목록에 오른 도메인은 브라우저에 하드코딩되어 첫 방문부터 HTTPS로만 접속한다. Chrome 목록은 hstspreload.org에서 관리하고, 다른 브라우저도 이 목록을 바탕으로 한다.

**되돌리기 어렵다.** 등록 후 인증서가 만료되거나 HTTPS 설정이 깨지면 사용자가 아예 접속할 수 없고, 목록에서 빠지는 데도 오래 걸린다. 모든 하위 도메인까지 HTTPS가 확실할 때만 신청한다.

## HTTPS만으로 충분하지 않은 경우

| 위협 | 설명 | 대응 |
| --- | --- | --- |
| 서버 침해 | 서버 권한을 뺏기면 복호화된 데이터가 그대로 노출된다 | 서버 보안, 저장 데이터 암호화 |
| 전송 구간 취약점 | 가짜 인증서 설치·잘못된 설정을 노린 중간자 공격 | 인증서 검증, HSTS |
| 민감한 대화 | 서버(운영자)도 내용을 볼 수 있다 | **종단 간 암호화(E2EE)**: 보내는 기기에서 암호화해 받는 기기에서만 푼다 |

## 정리

- HTTPS = HTTP + TLS. 메시지 형식은 그대로고 전송 구간만 암호화된다.
- 인증서는 "이 서버가 진짜 그 도메인"이라는 CA의 보증이다.
- 비대칭키로 세션 키를 합의하고, 데이터는 대칭키로 암호화한다.
- 리다이렉트만으로는 첫 평문 요청이 남는다. HSTS로 막고, 첫 방문까지 막으려면 preload(되돌리기 어려움에 주의).
- **HTTPS는 전송 구간만 지킨다.** XSS·CSRF처럼 애플리케이션 단의 공격은 따로 막아야 한다.

관련 노트: [[Computer-Science/Network/http|HTTP 프로토콜]], [[security|정보 시스템 보안(공격 기법과 암호)]], [[web-security|웹 보안: CSRF와 XSS]], [[cookie-session|쿠키와 세션]], [[local-https-mkcert|로컬 개발 환경에 HTTPS 적용하기]], [[https-migration|HTTPS 전환: 인증서 고르기부터 리다이렉트까지]]
