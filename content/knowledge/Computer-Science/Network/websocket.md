---
title: "WebSocket"
concept: "WebSocket"
summary: "한 번 맺은 연결로 서버와 브라우저가 양방향 실시간 통신을 하는 WebSocket. OS 소켓과의 차이, HTTP Upgrade 핸드셰이크와 버전, 프레임과 텍스트·바이너리, ping/pong, 압축 확장, 폴링·SSE·HTTP/2와의 비교, 보안과 인증, 로드 밸런싱·프록시·우아한 종료, 라이브러리 선택과 디버깅을 정리한다."
tags: ["network", "websocket", "realtime", "frontend", "http"]
source: mixed
date: "2026-10-12"
sources: ["https://bytebytego.com/guides/shortlong-polling-sse-websocket", "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers", "https://github.com/fru1tworld/cs-basic/blob/main/interview/etc/websocket.md", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/network.md"]
---

> 여러 자료를 종합한 노트에, 실시간 통신 방식 비교를 ByteByteGo의 System Design 101 가이드 「[Short/long polling, SSE, WebSocket](https://bytebytego.com/guides/shortlong-polling-sse-websocket)」으로 보강했다. 핸드셰이크 검증과 프레임 구조는 MDN의 「[Writing WebSocket servers](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)」를 바탕으로 보강했다.
> OS 소켓과의 차이, 버전, 텍스트·바이너리, ping/pong, 압축 확장, HTTP/2와의 비교, 보안·인증, 로드 밸런싱·프록시·우아한 종료, 라이브러리와 디버깅은 「[fru1tworld/cs-basic 모의 면접 질문 목록](https://github.com/fru1tworld/cs-basic/blob/main/interview/etc/websocket.md)」의 질문을 기준으로 빠진 개념을 보강했다.

## WebSocket이란

WebSocket은 **하나의 TCP 연결을 계속 열어 두고 서버와 클라이언트가 아무 때나 서로 메시지를 보내는 프로토콜**이다(RFC 6455). HTTP는 클라이언트가 요청해야만 서버가 응답할 수 있다. 채팅, 알림, 주식 시세, 협업 편집처럼 **서버가 먼저 보내야 하는** 기능에 쓴다.

주소는 `ws://`, 암호화된 연결은 `wss://`다. 실서비스에서는 항상 `wss://`를 쓴다.

| 구분 | 소켓(OS socket) | WebSocket |
| --- | --- | --- |
| 정체 | OS가 주는 통신 끝점 API. TCP·UDP 어느 쪽이든 연다 | TCP 소켓 위에서 도는 **응용 계층 프로토콜** |
| 데이터 단위 | 경계 없는 바이트 스트림(TCP). 메시지 구분은 응용이 직접 한다 | **메시지** 단위. 프레임에 길이가 있어 받는 쪽이 메시지 경계를 그대로 받는다 |
| 시작 | `connect()` 한 번 | HTTP 요청으로 시작해 `101`로 갈아탄다. 그래서 80·443 포트와 웹 인프라(프록시, TLS, 쿠키)를 그대로 쓴다 |
| 쓰는 곳 | 어떤 프로그램이든 | 브라우저가 쓸 수 있는 양방향 통신. 브라우저 JS는 OS 소켓을 직접 열 수 없다 |

소켓 자체의 동작은 [[transport-layer|전송 계층]]의 「소켓과 역다중화」에 있다.

**채팅·게임이 WebSocket을 고르는 이유**는 세 가지다. 서버가 사건이 생긴 즉시 밀어 줄 수 있고(폴링 지연 없음), 연결을 한 번 맺은 뒤에는 메시지마다 HTTP 헤더가 붙지 않아 프레임 오버헤드가 2~14바이트에 그치며, 양쪽이 동시에 보내는 전이중(full-duplex)이라 입력과 상태 갱신이 서로 기다리지 않는다. 다만 TCP 위라서 패킷 하나가 사라지면 뒤 메시지가 모두 기다린다. 위치처럼 최신 값만 의미 있는 빠른 액션 게임은 UDP 계열(WebRTC 데이터 채널, WebTransport)을 쓰기도 한다([[webrtc|WebRTC]]).

## 연결 과정: HTTP에서 갈아타기

처음에는 일반 HTTP 요청으로 시작해 프로토콜을 바꾼다.

```text
GET /chat HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

──── 이후 같은 TCP 연결에서 WebSocket 프레임을 양방향으로 주고받는다 ────
```

HTTP와 같은 80·443 포트를 쓰므로 방화벽을 통과하기 쉽다. 연결 후에는 HTTP 헤더가 붙지 않아 메시지당 오버헤드가 작다.

서버는 `Sec-WebSocket-Key` 값에 고정 GUID `258EAFA5-E914-47DA-95CA-C5AB0DC85B11`을 이어 붙여 SHA-1 해시를 구하고 Base64로 인코딩한 값을 `Sec-WebSocket-Accept`로 돌려준다. 보안 장치가 아니라 **상대가 정말 WebSocket을 이해하는 서버인지**(캐시된 HTTP 응답이 아닌지) 확인하는 절차다. 서버는 `Origin` 헤더를 검사해 허용한 사이트에서 온 연결만 받는다(아래 「보안과 인증」).

### 버전과 서브프로토콜

`Sec-WebSocket-Version: 13`은 RFC 6455의 프로토콜 버전이다. 표준이 되기 전 초안들(hixie-76, hybi 초안)은 핸드셰이크와 프레임 형식이 서로 호환되지 않았고, 13으로 확정된 뒤 브라우저가 모두 13만 쓴다. 서버가 모르는 버전이 오면 `426 Upgrade Required`와 함께 지원하는 버전 목록을 `Sec-WebSocket-Version`으로 돌려준다. 프로토콜 버전이 고정돼 있어도 **메시지 형식은 응용이 진화시켜야** 하므로, 그 버전은 서브프로토콜(`Sec-WebSocket-Protocol: chat.v2`)이나 메시지 안의 버전 필드로 관리한다. 서버를 바꿔도 옛 클라이언트가 한동안 붙어 있으므로, 두 형식을 함께 받다가 옛것을 내리는 식으로 옮긴다([[browser-realtime-apis|브라우저 실시간 통신]]의 「연결과 상태」).

### 프레임

연결 뒤 데이터는 프레임 단위로 오간다.

| 필드 | 뜻 |
| --- | --- |
| FIN | 메시지의 마지막 프레임인가. 큰 메시지는 여러 프레임으로 쪼개 보낸다 |
| RSV1~3 | 확장이 쓰는 비트. 협상한 확장이 없는데 켜져 있으면 연결을 끊는다. 압축 확장은 RSV1로 「압축된 메시지」를 표시한다 |
| opcode | `0x1` 텍스트(UTF-8), `0x2` 바이너리, `0x0` 이어지는 조각, `0x8` 종료, `0x9` ping, `0xA` pong |
| MASK + 마스킹 키 | **클라이언트 → 서버 프레임은 반드시 4바이트 키로 XOR 마스킹한다.** 서버는 마스킹되지 않은 클라이언트 프레임이 오면 연결을 끊는다. 중간 프록시가 프레임을 HTTP로 오해해 캐시를 오염시키는 공격을 막기 위한 장치다 |
| 페이로드 길이 | 7비트. 126이면 다음 16비트, 127이면 다음 64비트가 실제 길이다 |

종료는 양쪽이 close 프레임(상태 코드 `1000` 정상, `1001` 떠남 등)을 주고받은 뒤 TCP를 닫는다. 종료 코드 표는 [[browser-realtime-apis|브라우저 실시간 통신]]의 「종료 코드」에 있다. 직접 구현할 일은 드물고 Node.js의 `ws`, 각 언어의 검증된 라이브러리를 쓴다. Node.js 22부터는 클라이언트용 `WebSocket`이 전역으로 들어 있다.

**텍스트 프레임과 바이너리 프레임**은 페이로드를 해석하는 약속이 다르다.

| 구분 | 텍스트(`0x1`) | 바이너리(`0x2`) |
| --- | --- | --- |
| 내용 | 반드시 올바른 UTF-8. 깨진 UTF-8이 오면 받는 쪽이 `1007`로 끊는다 | 아무 바이트열 |
| 흔한 형식 | JSON | Protocol Buffers, MessagePack, 이미지·오디오 조각 |
| 장점 | 사람이 읽고 개발 도구에서 바로 보인다. 스키마 없이 바꾸기 쉽다 | 작고 파싱이 빠르다. 숫자·바이트를 변환 없이 담는다 |
| 단점 | 필드 이름이 매번 반복돼 크고, 숫자도 문자열로 바뀐다 | 디버깅 때 디코더가 필요하고, 양쪽이 스키마를 맞춰야 한다 |

메시지가 작고 드물면 JSON 텍스트가 무난하고, 초당 수십 번 상태를 보내는 게임·시세처럼 대역폭과 CPU가 병목이면 바이너리로 바꾼다.

### Ping/Pong과 연결 유지

ping(`0x9`)을 받은 쪽은 같은 데이터로 pong(`0xA`)을 **자동으로** 돌려줘야 한다. 이 왕복은 두 가지에 쓴다.

- **죽은 연결 감지**: 상대가 FIN 없이 사라진 반쯤 열린 TCP 연결은 보낼 데이터가 없으면 영원히 살아 있는 것처럼 보인다. 서버가 주기적으로(예: 30초) ping을 보내고, 정해진 시간 안에 pong이 오지 않으면 연결을 끊고 자원을 회수한다.
- **유휴 타임아웃 방지**: 로드 밸런서·프록시·NAT는 트래픽이 없는 연결을 일정 시간(흔히 60초) 뒤 끊는다. 그보다 짧은 주기로 ping을 보내면 연결이 「사용 중」으로 유지된다.

브라우저는 서버의 ping에 pong을 자동으로 답하지만, **JS에서 ping 프레임을 보낼 API는 없다.** 클라이언트 쪽에서 끊김을 빨리 알아야 하면 `{"type":"ping"}` 같은 응용 메시지로 하트비트를 따로 둔다([[browser-realtime-apis|브라우저 실시간 통신]]의 「재연결과 하트비트」). TCP keepalive와의 차이는 [[transport-layer|전송 계층]]의 「연결이 살아 있는지 확인하기」에 있다.

### 확장과 압축

**확장(extension)** 은 프레임 형식에 기능을 얹는 장치다. 클라이언트가 `Sec-WebSocket-Extensions`로 후보를 내고 서버가 받아들인 것만 응답에 담아 그 연결에서 쓴다. 확장은 RSV 비트와 새 opcode를 쓸 수 있다. 실제로 널리 쓰이는 것은 **`permessage-deflate`**(RFC 7692) 하나다. 브라우저는 이 확장을 자동으로 제안한다.

```text
요청: Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits
응답: Sec-WebSocket-Extensions: permessage-deflate; server_no_context_takeover
```

메시지 단위로 DEFLATE 압축을 하고, 압축한 메시지는 첫 프레임의 RSV1을 켠다. 텍스트 JSON은 크게 줄지만 공짜가 아니다.

| 고려할 점 | 내용 |
| --- | --- |
| 연결당 메모리 | 기본은 **컨텍스트 이월**(context takeover): 이전 메시지들로 만든 압축 사전(최대 32KB 창)과 zlib 상태를 연결마다 방향별로 들고 있어 압축률이 높다. 연결이 수십만 개면 이 메모리가 서버를 누른다. `server_no_context_takeover`·`client_no_context_takeover`로 매 메시지마다 사전을 비우거나 `*_max_window_bits`로 창을 줄여 메모리와 압축률을 바꾼다 |
| CPU | 메시지마다 압축·해제를 한다. 팬아웃이 큰 서버는 같은 메시지를 연결마다 다시 압축하게 되므로, 미리 한 번 압축해 두는 구조가 아니면 CPU가 먼저 바닥난다 |
| 작은 메시지 | 수십 바이트짜리는 줄어들 것이 없거나 오히려 커진다. 라이브러리는 보통 임계값(예: 1KB) 아래는 압축하지 않게 설정한다 |
| 이미 압축된 데이터 | 이미지·바이너리 프로토콜은 다시 압축해도 이득이 없다 |
| 보안 | 비밀값(토큰)과 공격자가 넣을 수 있는 값을 한 압축 컨텍스트에 섞으면 압축 길이로 비밀을 추측하는 공격(CRIME·BREACH 계열)이 가능하다. 비밀은 메시지에 싣지 않거나 컨텍스트 이월을 끈다 |

## 브라우저 API

```js
const ws = new WebSocket("wss://example.com/chat");

ws.addEventListener("open", () => ws.send(JSON.stringify({ type: "join", room: 1 })));
ws.addEventListener("message", (e) => console.log(JSON.parse(e.data)));
ws.addEventListener("close", (e) => console.log("closed", e.code));
ws.addEventListener("error", () => console.log("error"));
```

표준 API는 단순하다. 재연결, 방(room), 이벤트 이름, 응답 확인 같은 기능은 직접 만들거나 Socket.IO 같은 라이브러리를 쓴다. 상태 값, 바이너리 수신, `bufferedAmount`로 송신 속도 조절, 지수 백오프 재연결은 [[browser-realtime-apis|브라우저 실시간 통신]]에 정리했다.

## 실시간 통신 방식 비교

| 방식 | 방향 | 특징 | 어울리는 곳 |
| --- | --- | --- | --- |
| 폴링 | 클라 → 서버 | 주기적으로 요청. 단순하지만 빈 요청이 많다 | 갱신이 드문 대시보드 |
| 롱 폴링 | 클라 → 서버 | 새 데이터가 생길 때까지 응답을 붙잡아 둔다 | WebSocket을 못 쓰는 환경의 대안 |
| SSE (Server-Sent Events) | 서버 → 클라 | HTTP 위 단방향 스트림. `EventSource`, 자동 재연결 | 알림, 진행률, AI 토큰 스트리밍 |
| WebSocket | 양방향 | 연결 하나로 양쪽이 자유롭게 송신 | 채팅, 게임, 협업 편집 |
| WebRTC | P2P | 서버를 거치지 않고 브라우저끼리 | 화상 통화, 파일 전송 |

HTTP 서버는 브라우저에 먼저 연결을 걸 수 없다. 그래서 **누가 일을 하느냐**로 나눠 보면 정리가 쉽다. 폴링·롱 폴링은 **브라우저가 계속 물어서** 최신 데이터를 얻고, SSE·WebSocket은 **연결을 맺은 뒤 서버가 바로 밀어 준다.** 롱 폴링은 메시지를 하나 받을 때마다 요청을 새로 보내야 해서 메시지가 잦으면 헤더와 왕복이 쌓이고, 서버는 매달린 요청을 붙잡아 두는 비용이 든다. 서버끼리 이벤트를 알릴 때는 같은 고민이 폴링과 웹훅의 선택이 된다([[webhook|웹훅과 폴링]]).

**서버에서 받기만 하면 되면 SSE가 더 단순하다.** 양방향이 필요할 때 WebSocket을 고른다.

### HTTP/2와 무엇이 다른가

HTTP/2도 한 연결에서 여러 스트림을 동시에 주고받지만, 둘은 푸는 문제가 다르다.

| 구분 | HTTP/2 | WebSocket |
| --- | --- | --- |
| 모델 | 요청·응답. 서버는 요청에 대한 응답만 보낸다 | 메시지. 연결이 열린 동안 양쪽이 언제든 보낸다 |
| 다중화 | 요청마다 스트림을 열어 한 연결에 섞는다 | 연결 하나가 메시지 통로 하나다. 여러 채널은 응용이 메시지 안에서 구분한다 |
| 서버가 먼저 보내기 | 서버 푸시는 캐시용 자원 밀어 넣기였고 JS가 받을 수 없었으며, 지금은 브라우저가 지원을 뺐다. 실시간 알림은 응답 본문을 길게 흘리는 SSE로 한다 | 기본 기능 |
| 헤더 | 요청마다 붙지만 HPACK으로 압축 | 핸드셰이크 뒤에는 없다 |

둘을 겹쳐 쓸 수도 있다. RFC 8441은 HTTP/2 연결 안의 스트림 하나를 확장 `CONNECT`(`:protocol = websocket`)로 WebSocket 통로로 여는 방법을 정했고, RFC 9220은 HTTP/3에서 같은 일을 한다. 그러면 페이지 요청과 WebSocket이 TCP 연결 하나를 나눠 쓴다. 다만 서버·프록시 지원이 고르지 않아 대부분의 WebSocket은 여전히 HTTP/1.1 Upgrade로 열린다.

## 보안과 인증

| 항목 | 할 일 |
| --- | --- |
| 전송 암호화 | `wss://`만 쓴다. TLS는 HTTPS와 똑같이 핸드셰이크 단계에서 맺어지고, 그 위의 HTTP Upgrade와 모든 프레임이 암호화된다. 보통 로드 밸런서나 리버스 프록시가 TLS를 종료하고 내부는 `ws://`로 보낸다([[https\|HTTPS와 TLS]]). 평문 `ws://`는 중간 장비가 프레임을 변조·차단하기 쉬워 연결 성공률도 낮다 |
| 출처 검사 | **WebSocket에는 CORS가 적용되지 않는다.** 브라우저는 어느 출처로든 연결하고 `Origin`만 실어 보내며 쿠키도 함께 간다. 서버가 `Origin`을 허용 목록과 비교하지 않으면 다른 사이트가 사용자의 쿠키로 연결을 맺는다(교차 사이트 WebSocket 하이재킹, CSWSH). `Origin`은 브라우저 밖 클라이언트가 위조할 수 있으므로 인증을 대신하지 않는다 |
| 입력 검증 | 메시지도 사용자 입력이다. 스키마 검증, 최대 메시지 크기(넘으면 `1009`), 연결·메시지 속도 제한을 둔다. 메시지를 HTML에 넣을 때는 XSS처럼 다룬다 |
| 메시지 단위 인가 | 연결 때 인증했어도 「이 방에 들어갈 수 있나」, 「이 문서를 고칠 수 있나」는 메시지마다 확인한다 |

**인증은 핸드셰이크 때 한다.** 브라우저 `WebSocket` API는 `Authorization` 같은 커스텀 헤더를 붙일 수 없어서 방법이 정해져 있다.

| 방법 | 동작 | 주의 |
| --- | --- | --- |
| 쿠키 | 같은 사이트면 세션 쿠키가 Upgrade 요청에 자동으로 실린다 | `Origin` 검사가 필수다(CSWSH) |
| 일회용 티켓 | 로그인된 HTTP API로 수십 초짜리 일회용 티켓을 받고, `wss://…/ws?ticket=…`로 연결한다. 서버는 티켓을 쓰는 즉시 폐기한다 | 쿼리는 접근 로그에 남으므로 장기 토큰을 쿼리에 넣지 않는다 |
| 첫 메시지 인증 | 연결 직후 첫 메시지로 토큰을 보내고, 정해진 시간 안에 오지 않으면 끊는다 | 인증 전에도 연결 자원을 잡으므로 짧은 타임아웃을 둔다 |
| 서브프로토콜 헤더에 토큰 | `new WebSocket(url, ["v1", token])`으로 `Sec-WebSocket-Protocol`에 싣는다 | 헤더 용도에 맞지 않는 우회라 서버가 같은 값을 응답에 돌려줘야 하는 등 다루기 번거롭다 |

**연결이 길게 살아 있는 동안 세션도 관리한다.** 연결 시 확인한 사용자 ID를 연결 객체에 묶어 두고(`connectionId → userId, 구독한 방`), 서버가 여러 대면 「누가 어느 서버에 붙어 있나」를 Redis 같은 공용 저장소에 기록해 다른 서버가 그 사용자에게 보낼 수 있게 한다. 토큰은 연결보다 먼저 만료될 수 있으므로, 만료 시각에 서버가 `4001` 같은 응용 코드로 끊어 재인증을 유도하거나, 클라이언트가 새 토큰을 메시지로 보내 연장한다. 로그아웃·권한 회수 때는 해당 사용자의 연결을 서버가 찾아 끊는다. 세션·토큰 방식 자체는 [[session-vs-token-auth|세션 기반 인증과 토큰 기반 인증]]에 있다.

## 서버 여러 대로 늘리기

연결이 길게 이어지므로 일반 HTTP API와 확장 방식이 다르다. 설계 전체(브로커, 방 분할, 팬아웃, 부하 테스트)는 [[realtime-websocket-server|실시간 웹소켓 서버 설계]]에 있다.

| 문제 | 해법 |
| --- | --- |
| 다른 서버에 붙은 클라이언트에게 보내야 한다 | Redis Pub/Sub, Kafka·NATS 같은 브로커로 서버끼리 메시지를 전파한다. 각 서버는 자기 연결이 구독한 채널만 구독한다 |
| 로드 밸런서가 Upgrade를 통과시켜야 한다 | L4(TCP) 로드 밸런서는 바이트만 넘기므로 그대로 된다. L7은 WebSocket 지원을 켜야 한다(AWS ALB는 기본 지원). 경로·헤더로 WebSocket만 별도 서버 풀로 보낼 수 있다 |
| 연결이 서버마다 고르게 퍼지지 않는다 | 연결이 오래 머물러 라운드 로빈은 새 서버를 넣어도 기존 서버의 연결이 줄지 않는다. **최소 연결**(least connections) 알고리즘을 쓰고, 서버를 추가한 뒤 연결을 조금씩 끊어 재분배한다([[load-balancer\|로드 밸런서]]) |
| 스티키 세션이 필요한가 | 순수 WebSocket은 연결 하나가 한 서버에 고정되므로 필요 없다. Socket.IO처럼 HTTP 롱 폴링으로 시작했다가 갈아타는 라이브러리는 여러 요청이 같은 서버로 가야 하므로 스티키 세션이 필요하다 |
| 유휴 연결이 끊긴다 | 로드 밸런서·프록시의 유휴 타임아웃(Nginx `proxy_read_timeout` 기본 60초, AWS ALB 기본 60초)보다 짧게 ping을 보내거나 타임아웃을 늘린다 |
| 파일 디스크립터·메모리 | 연결 하나가 fd 하나와 버퍼·세션 객체다. `ulimit -n`을 올리고 연결당 메모리를 재서 서버당 목표 연결 수를 정한다 |

### 장애 조치와 우아한 종료

서버 한 대가 죽으면 그 서버의 연결은 모두 끊긴다. 연결 자체는 옮길 수 없으므로 **클라이언트가 다른 서버로 다시 붙고, 상태는 서버 밖에 둔다**가 장애 조치의 기본이다.

- 방 구독·읽은 위치·놓친 메시지는 공용 저장소(Redis, DB)나 브로커에 두어 어느 서버로 재접속해도 이어 받게 한다. 클라이언트는 마지막으로 받은 메시지 ID를 들고 재접속해 빈 구간을 받아 온다.
- 로드 밸런서가 헬스 체크로 죽은 서버를 풀에서 빼고, 클라이언트는 지수 백오프 + 무작위 지연으로 재연결해 남은 서버에 몰리지 않게 한다.

배포처럼 **계획된 종료**는 연결을 한꺼번에 끊지 않고 비운다(draining).

```text
1. 헬스 체크를 실패로 바꿔 로드 밸런서가 새 연결을 보내지 않게 한다
2. 붙어 있는 클라이언트에 close 프레임을 보낸다
   (1001 Going Away 또는 1012 Service Restart: 「곧 다시 붙으면 된다」는 뜻)
   한 번에 다 보내지 않고 나눠 보내 재접속이 다른 서버에 한꺼번에 몰리지 않게 한다
3. 클라이언트의 close 응답을 기다린다. 처리 중인 메시지는 마저 보낸다
4. 유예 시간(예: 30초)이 지나면 남은 연결을 강제로 닫고 프로세스를 끝낸다
```

쿠버네티스에서는 `preStop` 훅과 `terminationGracePeriodSeconds`를 이 유예 시간에 맞춘다([[kubernetes-workloads|쿠버네티스 워크로드]]).

### 프록시를 지날 때

| 문제 | 원인 | 대응 |
| --- | --- | --- |
| 핸드셰이크가 400·502로 실패 | `Upgrade`·`Connection`은 홉 단위 헤더라 리버스 프록시가 기본으로 다음 홉에 넘기지 않는다 | Nginx는 `proxy_http_version 1.1;`, `proxy_set_header Upgrade $http_upgrade;`, `proxy_set_header Connection "upgrade";`를 넣는다 |
| 일정 시간 뒤 조용히 끊김 | 프록시의 읽기·유휴 타임아웃 | 타임아웃을 늘리거나 그보다 짧은 ping |
| 메시지가 늦게 묶여서 도착 | 오래된 프록시·보안 장비가 응답을 버퍼링 | 해당 경로의 버퍼링을 끈다 |
| 회사망에서만 연결 실패 | 평문 `ws://`를 이해하지 못하는 포워드 프록시가 Upgrade를 막는다 | `wss://`를 쓰면 포워드 프록시는 `CONNECT` 터널로 암호화된 바이트만 넘기므로 통과율이 높다([[proxy\|프록시]]) |
| 서버가 클라이언트 IP를 모름 | TCP 연결 상대가 프록시다 | `X-Forwarded-For`를 핸드셰이크 요청에서 읽는다 |

## 라이브러리 고르기

| 라이브러리 | 성격 | 고르는 때 |
| --- | --- | --- |
| `ws` (Node.js) | RFC 6455를 그대로 구현한 가볍고 빠른 서버·클라이언트 | 표준 WebSocket 클라이언트(브라우저 API, 다른 언어)와 통신해야 할 때. 재연결·방은 직접 만든다 |
| Socket.IO | WebSocket 위에 자체 프로토콜(Engine.IO)을 얹은 프레임워크. 이벤트 이름, 방·네임스페이스, 응답 확인(ack), 자동 재연결, 롱 폴링 대체 경로, Redis 어댑터로 다중 서버 브로드캐스트 | 기능을 빨리 갖추고 싶고, 양쪽을 모두 Socket.IO로 쓸 수 있을 때. **순수 WebSocket 클라이언트와는 바로 통신하지 않는다** |
| uWebSockets.js | C++로 구현한 고성능 서버 | 서버 한 대에 연결을 아주 많이 받아야 할 때 |
| STOMP over WebSocket (Spring) | 구독(SUBSCRIBE)·발행(SEND) 개념을 얹은 텍스트 프로토콜 | Spring 생태계에서 메시지 브로커와 붙일 때 |

기준은 **상대 클라이언트가 누구인가(표준 준수가 필요한가), 필요한 기능을 직접 만들 여력이 있나, 연결 규모**다.

## 디버깅과 흔한 문제

브라우저 개발자 도구의 Network 패널에서 WebSocket 요청을 고르면 핸드셰이크 헤더와 101 응답, Messages 탭의 송수신 프레임(시각·크기·내용)이 보인다. 명령줄에서는 `websocat`이나 `wscat -c wss://…`로 직접 연결해 서버만 따로 시험한다. 연결이 안 되면 `curl -i`에 `Upgrade` 헤더를 붙여 핸드셰이크 응답 코드부터 본다.

| 증상 | 흔한 원인 | 대응 |
| --- | --- | --- |
| `close` 코드 `1006`, 이유 없음 | 종료 프레임 없이 TCP가 끊김: 네트워크 단절, 프록시·로드 밸런서 타임아웃, 서버 크래시 | 서버 로그와 중간 장비 타임아웃을 본다. 하트비트를 둔다 |
| 핸드셰이크가 403 | 서버의 `Origin` 검사, 인증 실패 | 허용 목록과 쿠키·티켓을 확인한다 |
| 핸드셰이크가 400·426·502 | 프록시가 Upgrade 헤더를 넘기지 않음, 버전 불일치 | 위 「프록시를 지날 때」 |
| 연결이 끊긴다(네트워크 전환, 서버 재시작) | 모바일 망 전환, 배포 | 지수 백오프로 재연결, 재연결 후 놓친 메시지 동기화 |
| 메모리가 계속 는다 | 느린 클라이언트의 송신 버퍼 누적, 끊긴 연결 정리 누락 | 연결별 송신 버퍼 상한을 두고 넘으면 끊는다. ping 무응답 연결을 정리한다 |
| 일부 사용자에게만 메시지가 안 간다 | 서버가 여러 대인데 서버 간 전파가 없음 | Pub/Sub 브로커로 전파한다 |

## 정리

- WebSocket은 OS 소켓이 아니라 TCP 위의 응용 계층 프로토콜이다. HTTP `101 Switching Protocols`로 시작해 하나의 연결로 양방향 메시지를 주고받는다.
- 프레임은 텍스트(UTF-8)와 바이너리로 나뉘고, ping/pong으로 죽은 연결과 유휴 타임아웃을 다룬다. 압축(`permessage-deflate`)은 연결당 메모리·CPU와 맞바꾼다.
- 서버 → 클라 단방향이면 SSE, 양방향이면 WebSocket, P2P면 WebRTC. HTTP/2는 요청·응답 다중화이지 양방향 메시지 채널이 아니다.
- CORS가 없으므로 `Origin`을 검사하고, 인증은 핸드셰이크 때 쿠키·일회용 티켓으로 한다.
- 다중 서버는 Pub/Sub 전파, 최소 연결 분산, 프록시 Upgrade 설정, 하트비트, 상태 외부화와 우아한 종료까지 함께 설계해야 버틴다.

관련 노트: [[realtime-chat-app|실시간 채팅 앱의 데이터 흐름]], [[webrtc|WebRTC]], [[transport-layer|전송 계층: 포트, TCP, UDP]], [[Computer-Science/Network/http|HTTP 프로토콜]], [[browser-realtime-apis|브라우저 실시간 통신: 롱 폴링, SSE, WebSocket 클라이언트]], [[webhook|웹훅과 폴링]], [[realtime-websocket-server|실시간 웹소켓 서버 설계]]
