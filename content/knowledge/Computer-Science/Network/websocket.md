---
title: "WebSocket"
concept: "WebSocket"
summary: "한 번 맺은 연결로 서버와 브라우저가 양방향 실시간 통신을 하는 WebSocket. HTTP Upgrade 핸드셰이크, 브라우저 API, 폴링·SSE와의 비교, 운영 시 주의점을 정리한다."
tags: ["network", "websocket", "realtime", "frontend", "http"]
source: mixed
date: "2026-10-12"
---

## WebSocket이란

WebSocket은 **하나의 TCP 연결을 계속 열어 두고 서버와 클라이언트가 아무 때나 서로 메시지를 보내는 프로토콜**이다. HTTP는 클라이언트가 요청해야만 서버가 응답할 수 있다. 채팅, 알림, 주식 시세, 협업 편집처럼 **서버가 먼저 보내야 하는** 기능에 쓴다.

주소는 `ws://`, 암호화된 연결은 `wss://`다. 실서비스에서는 항상 `wss://`를 쓴다.

## 연결 과정: HTTP에서 갈아타기

처음에는 일반 HTTP 요청으로 시작해 프로토콜을 바꾼다.

```text
GET /chat HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

──── 이후 같은 TCP 연결에서 WebSocket 프레임을 양방향으로 주고받는다 ────
```

HTTP와 같은 80·443 포트를 쓰므로 방화벽을 통과하기 쉽다. 연결 후에는 HTTP 헤더가 붙지 않아 메시지당 오버헤드가 작다.

## 브라우저 API

```js
const ws = new WebSocket("wss://example.com/chat");

ws.addEventListener("open", () => ws.send(JSON.stringify({ type: "join", room: 1 })));
ws.addEventListener("message", (e) => console.log(JSON.parse(e.data)));
ws.addEventListener("close", (e) => console.log("closed", e.code));
ws.addEventListener("error", () => console.log("error"));
```

표준 API는 단순하다. 재연결, 방(room), 이벤트 이름, 응답 확인 같은 기능은 직접 만들거나 Socket.IO 같은 라이브러리를 쓴다. **Socket.IO는 자체 프로토콜을 얹으므로 순수 WebSocket 서버와는 바로 통신하지 않는다.**

## 실시간 통신 방식 비교

| 방식 | 방향 | 특징 | 어울리는 곳 |
| --- | --- | --- | --- |
| 폴링 | 클라 → 서버 | 주기적으로 요청. 단순하지만 빈 요청이 많다 | 갱신이 드문 대시보드 |
| 롱 폴링 | 클라 → 서버 | 새 데이터가 생길 때까지 응답을 붙잡아 둔다 | WebSocket을 못 쓰는 환경의 대안 |
| SSE (Server-Sent Events) | 서버 → 클라 | HTTP 위 단방향 스트림. `EventSource`, 자동 재연결 | 알림, 진행률, AI 토큰 스트리밍 |
| WebSocket | 양방향 | 연결 하나로 양쪽이 자유롭게 송신 | 채팅, 게임, 협업 편집 |
| WebRTC | P2P | 서버를 거치지 않고 브라우저끼리 | 화상 통화, 파일 전송 |

**서버에서 받기만 하면 되면 SSE가 더 단순하다.** 양방향이 필요할 때 WebSocket을 고른다.

## 운영 시 주의점

| 문제 | 대응 |
| --- | --- |
| 연결이 끊긴다 (네트워크 전환, 서버 재시작) | 지수 백오프로 재연결, 재연결 후 놓친 메시지 동기화 |
| 프록시·로드밸런서가 유휴 연결을 끊는다 | 주기적인 ping/pong(하트비트) |
| 서버를 여러 대로 늘리면 다른 서버의 클라이언트에게 못 보낸다 | Redis Pub/Sub 같은 메시지 브로커로 서버 간 전달 |
| 인증 | 연결 시 쿠키나 토큰으로 확인한다. 브라우저 API는 커스텀 헤더를 못 붙이므로 쿼리·첫 메시지·쿠키를 쓴다 |

## 정리

- WebSocket은 HTTP `101 Switching Protocols`로 시작해 하나의 연결로 양방향 통신한다.
- 서버 → 클라 단방향이면 SSE, 양방향이면 WebSocket, P2P면 WebRTC.
- 재연결, 하트비트, 다중 서버 브로드캐스트를 함께 설계해야 실서비스에서 버틴다.

관련 노트: [[realtime-chat-app|실시간 채팅 앱의 데이터 흐름]], [[webrtc|WebRTC]], [[tcp|TCP]], [[Computer-Science/Network/http|HTTP 프로토콜]], [[browser-realtime-apis|브라우저 실시간 통신: 롱 폴링, SSE, WebSocket 클라이언트]]
