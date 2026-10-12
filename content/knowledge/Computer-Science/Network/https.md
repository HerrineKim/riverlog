---
title: "HTTPS와 TLS"
concept: "HTTPS"
summary: "HTTP를 TLS로 감싸 도청·변조·위장을 막는 HTTPS. 인증서와 TLS 핸드셰이크의 흐름, 프론트엔드가 신경 써야 할 Mixed Content·HSTS를 정리한다."
tags: ["network", "security", "http", "web", "frontend"]
source: mixed
date: "2026-10-12"
---

## HTTPS란

HTTPS는 **HTTP 메시지를 TLS(Transport Layer Security)로 암호화해 주고받는 방식**이다. HTTP 자체는 바뀌지 않는다. HTTP와 TCP 사이에 TLS 계층이 하나 끼어들 뿐이다. 기본 포트는 443이다.

평문 HTTP는 중간 경로(공용 와이파이, 프록시, ISP)에서 내용을 그대로 읽고 바꿀 수 있다. HTTPS는 이 문제를 세 가지로 막는다.

| 보장 | 막는 것 | 수단 |
| --- | --- | --- |
| 기밀성 | 도청 | 대칭키 암호화 (AES, ChaCha20) |
| 무결성 | 변조 | MAC·AEAD로 메시지 검증 |
| 인증 | 서버 위장 | 인증 기관(CA)이 서명한 인증서 |

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
- TLS 1.3은 1-RTT로 핸드셰이크를 끝낸다(1.2는 2-RTT). HTTP/3는 QUIC 안에 TLS 1.3을 내장해 연결 수립을 더 줄인다.

## 프론트엔드가 신경 쓸 것

| 항목 | 내용 |
| --- | --- |
| Mixed Content | HTTPS 페이지에서 `http://` 스크립트·이미지를 부르면 브라우저가 막거나 경고한다. 리소스 URL을 모두 https로 쓴다 |
| HSTS | `Strict-Transport-Security` 헤더로 "이 도메인은 앞으로 HTTPS로만 접속하라"고 브라우저에 기억시킨다 |
| `Secure` 쿠키 | HTTPS 연결에서만 전송되는 쿠키. 인증 쿠키에는 필수다 |
| 보안 컨텍스트 | Service Worker, 위치·카메라, Clipboard 같은 API는 HTTPS(또는 localhost)에서만 동작한다 |

## 정리

- HTTPS = HTTP + TLS. 메시지 형식은 그대로고 전송 구간만 암호화된다.
- 인증서는 "이 서버가 진짜 그 도메인"이라는 CA의 보증이다.
- 비대칭키로 세션 키를 합의하고, 데이터는 대칭키로 암호화한다.
- **HTTPS는 전송 구간만 지킨다.** XSS·CSRF처럼 애플리케이션 단의 공격은 따로 막아야 한다.

관련 노트: [[Computer-Science/Network/http|HTTP 프로토콜]], [[security|정보 시스템 보안(공격 기법과 암호)]], [[web-security|웹 보안: CSRF와 XSS]], [[cookie-session|쿠키와 세션]]
