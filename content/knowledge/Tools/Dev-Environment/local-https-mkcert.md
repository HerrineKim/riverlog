---
title: "로컬 개발 환경에 HTTPS 적용하기"
concept: "mkcert"
summary: "localhost는 대부분 보안 컨텍스트로 취급되지만 Secure 쿠키·HTTP/2·커스텀 호스트가 필요하면 로컬 HTTPS가 필요하다. mkcert로 내 기기만 믿는 로컬 CA를 만들어 인증서를 발급하고, 웹 서버·Node·프레임워크 개발 서버에 붙인다."
tags: ["security", "http", "network", "frontend", "tips"]
source: other
date: "2026-10-13"
sources: ["https://velog.io/@sejinkim/%EB%A1%9C%EC%BB%AC-%EA%B0%9C%EB%B0%9C%ED%99%98%EA%B2%BD%EC%97%90-HTTPS-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0"]
---

> sejin 님의 글 「[로컬 개발환경에 HTTPS 적용하기](https://velog.io/@sejinkim/%EB%A1%9C%EC%BB%AC-%EA%B0%9C%EB%B0%9C%ED%99%98%EA%B2%BD%EC%97%90-HTTPS-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0)」(2023.06)을 바탕으로, 프레임워크 설정은 각 공식 문서로 확인해 재구성한 노트입니다.

## 로컬에서도 HTTPS가 필요한 경우

브라우저는 `localhost`와 `*.localhost`를 **신뢰할 수 있는 출처**로 본다. 그래서 Service Worker, Web Authentication 같은 보안 컨텍스트 API는 로컬에서는 HTTP로도 돌아간다. 그래도 다음 경우엔 로컬 HTTPS가 필요하다.

| 상황 | 이유 |
| --- | --- |
| Mixed Content 디버깅 | 운영과 같은 조건(HTTPS 페이지)을 재현해야 한다 |
| `Secure` 쿠키 | HTTPS 연결에서만 전송된다 |
| HTTP/2 이상 | 브라우저는 HTTPS에서만 HTTP/2를 쓴다 |
| HTTPS를 요구하는 라이브러리·API | 외부 SDK, OAuth 콜백 등 |
| 커스텀 호스트 이름 (`example.dev`) | `localhost`가 아니면 보안 컨텍스트 예외를 받지 못한다 |

## 왜 mkcert인가

| 방법 | 문제 |
| --- | --- |
| 공인 CA 인증서 | `localhost`나 예약 도메인에는 발급되지 않는다 |
| 자체 서명(self-signed) 인증서 | 브라우저가 경고를 띄우고 일부 기능이 막힌다 |
| **mkcert** | 로컬 루트 CA를 만들어 내 기기·브라우저 신뢰 목록에 넣고, 그 CA로 인증서를 서명한다 → 경고 없음 |

Let's Encrypt도 로컬 개발에는 이 방식을 권한다.

## 설치와 인증서 발급

```bash
# macOS (nss는 Firefox를 쓸 때만)
brew install mkcert
brew install nss

# Windows
choco install mkcert

# Linux: 인증서 도구(libnss3-tools 등)를 먼저 설치하고 릴리스 바이너리를 받는다
```

```bash
mkcert -install        # 로컬 루트 CA 생성 + 시스템·브라우저 신뢰 목록에 등록
mkcert -CAROOT         # rootCA.pem 위치 (모바일 기기에 설치할 때)
mkcert "*.example.dev" localhost 127.0.0.1 ::1   # 인증서 발급 (와일드카드 가능)
# → 현재 폴더에 인증서(.pem)와 개인키(-key.pem) 파일이 생긴다
```

**루트 CA 파일(`rootCA-key.pem`)은 절대 공유하지 않는다.** 누군가 손에 넣으면 그 기기의 통신을 가로챌 수 있는 인증서를 마음대로 만들 수 있다. 팀원은 각자 `mkcert -install`을 실행한다.

## 서버에 붙이기

| 대상 | 방법 |
| --- | --- |
| Apache | `SSLEngine on`, `SSLCertificateFile`, `SSLCertificateKeyFile` |
| Nginx | `listen 443 ssl;`, `ssl_certificate`, `ssl_certificate_key` |
| Node.js | `https.createServer({ key, cert }, handler)` |
| http-server | `http-server -S -C cert.pem -K key.pem` |
| Next.js | `next dev --experimental-https` (아래) |
| Nuxt 3 | `devServer.https`에 key·cert 경로 |

```js
// Node.js
const https = require('https');
const fs = require('fs');

https
  .createServer(
    { key: fs.readFileSync('./example.dev-key.pem'), cert: fs.readFileSync('./example.dev.pem') },
    (req, res) => { /* ... */ },
  )
  .listen(3000);
```

### 프레임워크 개발 서버

Next.js는 개발 서버에 HTTPS 옵션이 있다. `--experimental-https`만 주면 내부적으로 mkcert를 써서 로컬에서 신뢰되는 인증서를 만들어 붙이고, 직접 만든 인증서를 넘길 수도 있다.

```bash
next dev --experimental-https
next dev --experimental-https \
  --experimental-https-key ./example.dev-key.pem \
  --experimental-https-cert ./example.dev.pem
```

- Vite는 `server.https`에 key·cert를 넘기거나 `@vitejs/plugin-basic-ssl`을 쓴다.
- 개발 서버가 HTTPS를 지원하지 않으면 앞에 HTTPS 리버스 프록시(`local-ssl-proxy`, Caddy 등)를 둔다. HMR은 WebSocket으로 동작하므로 **프록시가 WebSocket 업그레이드를 지원해야** 한다.
- Nuxt(Vite)에서 HMR 연결이 끊기면 `vite.server.hmr`에 `protocol: 'wss'`와 `host`를 지정한다.
- Next.js 커스텀 서버(`createServer`)로 HTTPS를 붙이는 방법은 자동 최적화를 잃으므로 쓰지 않는다.

## 정리

- localhost는 대부분 보안 컨텍스트라 HTTP로 충분하지만, Secure 쿠키·HTTP/2·커스텀 호스트가 필요하면 로컬 HTTPS를 쓴다.
- mkcert = 로컬 루트 CA 생성 + 신뢰 등록 + 인증서 발급. 경고 없는 인증서를 명령 세 줄로 얻는다.
- 루트 CA 개인키는 공유 금지. 팀원마다 따로 설치한다.
- 프레임워크 개발 서버는 내장 HTTPS 옵션을 먼저 쓰고, 없으면 프록시를 앞에 두되 WebSocket(HMR) 지원을 확인한다.

관련 노트: [[https|HTTPS와 TLS]], [[cookie-session|쿠키와 세션]], [[nextjs|Next.js]]
