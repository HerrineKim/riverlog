---
title: "브라우저 실시간 통신: 롱 폴링, SSE, WebSocket 클라이언트"
concept: "Server-Sent Events"
summary: "서버가 먼저 보내는 데이터를 브라우저에서 받는 세 가지 방법의 클라이언트 쪽 구현을 정리한다. 재요청 루프로 만드는 롱 폴링, HTTP 위의 텍스트 스트림인 SSE(EventSource의 메시지 형식·자동 재연결·Last-Event-ID와 fetch로 직접 읽는 방법), 그리고 WebSocket API의 바이너리·버퍼·종료 코드·재연결까지."
tags: ["realtime", "network", "http", "browser", "javascript", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/long-polling", "https://ko.javascript.info/server-sent-events", "https://ko.javascript.info/websocket", "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events", "https://html.spec.whatwg.org/multipage/server-sent-events.html", "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close", "https://developer.mozilla.org/en-US/docs/Web/API/WebSocketStream"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「롱 폴링」, 「Server Sent Events」, 「웹소켓」 글을 바탕으로, 형식과 제약은 HTML 명세·MDN으로 확인해 재구성한 노트다.

## 무엇을 고르나

방식별 방향·특징 비교와 프로토콜 수준(HTTP Upgrade 핸드셰이크)은 [[websocket|WebSocket]]에 있다. 요약하면 **서버 → 클라이언트 한 방향이면 SSE, 양방향이면 WebSocket, 메시지가 드물거나 특별한 서버 기능을 못 쓰면 롱 폴링**이다. 이 노트는 브라우저 코드 쪽 세부를 다룬다.

## 롱 폴링

**일반 폴링**은 정해진 간격으로 「새 소식 있나?」를 묻는다. 단순하지만 간격만큼 늦고, 소식이 없어도 요청이 계속 서버를 두드린다.

**롱 폴링(long polling)** 은 요청을 보내면 서버가 **보낼 메시지가 생길 때까지 응답을 붙잡아 둔다.** 응답을 받으면 클라이언트가 즉시 다음 요청을 보낸다. 특별한 프로토콜 없이 평범한 HTTP로 지연 없이 받는다.

```javascript
async function subscribe(signal) {
  while (!signal.aborted) {                 // 재귀 대신 루프: 호출 스택·Promise 체인이 쌓이지 않는다
    try {
      const res = await fetch('/subscribe', { signal })
      if (res.status === 502 || res.status === 504) continue // 프록시가 오래 걸린 연결을 끊음 → 바로 재요청
      if (!res.ok) throw new Error(res.statusText)
      showMessage(await res.text())
    } catch (err) {
      if (err.name === 'AbortError') return
      await new Promise((r) => setTimeout(r, 1000))          // 오류면 잠깐 쉬고 다시
    }
  }
}
const controller = new AbortController()
subscribe(controller.signal)                // 화면을 떠날 때 controller.abort()
```

| 주의점 | 이유 |
| --- | --- |
| 서버가 **많은 대기 연결**을 버텨야 한다 | 연결마다 프로세스·스레드를 쓰는 구조면 메모리가 바닥난다. 이벤트 루프 기반이나 비동기 서버가 맞다 |
| 메시지가 **잦으면 맞지 않는다** | 메시지마다 요청 하나(헤더, 인증 오버헤드)라 요청-응답이 톱니 모양으로 반복된다. 이때는 SSE나 WebSocket |
| 응답과 재요청 사이 빈틈 | 그 사이에 생긴 메시지를 놓치지 않게 서버는 「마지막으로 받은 ID 이후」를 돌려주게 설계한다 |
| 캐시 | 응답에 `Cache-Control: no-store`를 둔다 |

## Server-Sent Events (SSE)

**SSE**는 서버가 HTTP 응답을 끝내지 않고 **텍스트 이벤트를 계속 흘려보내는** 방식이다. 브라우저는 `EventSource`로 받는다. 새 프로토콜이 아니라 그냥 HTTP라 기존 인증·프록시·HTTP/2와 잘 맞고, **자동 재연결과 이어 받기**가 내장돼 있다. 알림, 진행률, 로그 꼬리, LLM 토큰 스트리밍에 쓴다.

### 응답 형식

서버는 `Content-Type: text/event-stream`으로 응답하고 연결을 열어 둔 채 아래 형식을 쓴다. **빈 줄(`\n\n`)이 메시지 하나의 끝**이다.

```text
retry: 10000
                                     ← 재연결 대기 시간(ms)만 알리는 메시지
event: join
data: {"user":"보라"}
id: 41
                                     ← 커스텀 이벤트 'join'
data: 첫 줄
data: 둘째 줄
id: 42
                                     ← 'message' 이벤트, data = "첫 줄\n둘째 줄"
: keep-alive
                                     ← 콜론으로 시작하면 주석. 연결 유지용 하트비트
```

| 필드 | 의미 |
| --- | --- |
| `data:` | 본문. 연속된 `data:` 줄은 `\n`으로 이어 한 메시지가 된다. 실무에서는 JSON 한 줄로 보낸다 |
| `event:` | 이벤트 이름. 없으면 `message` |
| `id:` | 이 메시지의 ID. 브라우저가 `lastEventId`에 기억했다가 재연결 때 `Last-Event-ID` 요청 헤더로 보낸다. 관례상 메시지 끝에 둔다 |
| `retry:` | 재연결 전 대기 시간(ms) 권고. JS에서는 바꿀 수 없다 |

### EventSource API

```javascript
const es = new EventSource('/events', { withCredentials: true }) // 옵션은 이것 하나뿐(교차 출처 쿠키)

es.onmessage = (e) => render(JSON.parse(e.data))             // event: 가 없는 메시지
es.addEventListener('join', (e) => addUser(JSON.parse(e.data))) // 커스텀 이벤트는 addEventListener로만
es.onerror = () => {
  if (es.readyState === EventSource.CONNECTING) console.log('재연결 중')
  else console.log('끊김, 재연결 안 함')                     // CLOSED
}
es.close()                                                   // 다시 열 수 없다. 새 EventSource를 만든다
```

| 상황 | 동작 |
| --- | --- |
| 연결이 끊김 (네트워크, 서버가 응답을 끝냄) | `error` 후 `retry` 간격(기본 몇 초)만큼 기다려 **자동 재연결**, `Last-Event-ID` 포함. 오프라인이면 온라인이 될 때까지 기다린다 |
| 서버가 **204** 로 응답 | 재연결을 멈춘다. 서버가 「이제 그만」을 알리는 방법이다 |
| 상태 코드가 200이 아니거나(리다이렉트 후 포함) `Content-Type`이 틀림 | `error`를 내고 **재연결하지 않는다** (`readyState`가 `CLOSED`) |
| 클라이언트가 끊고 싶다 | `es.close()` |

교차 출처 요청은 `fetch`와 같은 CORS 규칙을 따른다. 서버는 `Access-Control-Allow-Origin`을, 쿠키를 보내면 `Access-Control-Allow-Credentials`도 줘야 한다.

### EventSource의 한계와 fetch로 직접 읽기

| 한계 | 대응 |
| --- | --- |
| **GET만** 되고 본문을 못 보낸다 | 프롬프트를 POST로 보내야 하는 LLM 응답 스트리밍은 `fetch`로 받는다 |
| **커스텀 헤더를 못 붙인다** (`Authorization` 등) | 쿠키 인증을 쓰거나, `fetch`로 받는다. 쿼리 문자열에 토큰을 넣으면 로그에 남는다 |
| 텍스트(UTF-8)만 | 바이너리는 base64로 싸거나 WebSocket |
| HTTP/1.1에서는 브라우저가 **도메인당 연결 약 6개**만 연다. 탭마다 SSE를 열면 다른 요청까지 막힌다 | 서버를 HTTP/2 이상으로 둔다(한 연결에 스트림 다중화). 아니면 `BroadcastChannel`로 탭 하나의 연결을 나눠 쓴다 |
| 프록시·서버가 응답을 버퍼링해 이벤트가 몰려 온다 | `Cache-Control: no-cache`, nginx면 `X-Accel-Buffering: no`, 압축 미들웨어의 플러시 설정을 확인한다 |

`fetch`의 `response.body`를 직접 읽으면 POST·헤더를 쓸 수 있다. 대신 재연결과 `Last-Event-ID`는 직접 만들어야 한다.

```javascript
const res = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ prompt }),
  signal: controller.signal,                // 「생성 중지」 버튼
})
const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
let buffer = ''
while (true) {
  const { value, done } = await reader.read()
  if (done) break
  buffer += value
  const events = buffer.split('\n\n')       // 빈 줄로 메시지를 자른다
  buffer = events.pop()                     // 아직 덜 온 마지막 조각은 남겨 둔다
  for (const ev of events) {
    const data = ev.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).replace(/^ /, '')).join('\n')
    if (data) appendToken(JSON.parse(data))
  }
}
```

청크 경계가 메시지 경계와 맞지 않으므로 **버퍼에 모았다가 빈 줄 단위로 자르는 것**이 핵심이다. 형식을 정확히 지키는 파서가 필요하면 eventsource-parser 같은 작은 라이브러리를 쓴다. 스트림 읽기와 진행률은 [[ajax#다운로드: 응답 본문을 스트림으로 읽기|AJAX와 HTTP 요청]]에 있다.

## WebSocket 클라이언트

연결 수립과 프로토콜, 기본 이벤트(`open`·`message`·`error`·`close`)는 [[websocket|WebSocket]]에 있다. 여기서는 그다음에 만나는 세부다.

### 연결과 상태

```javascript
const ws = new WebSocket('wss://example.com/chat', ['chat.v2', 'chat.v1']) // 2번째 인자: 서브프로토콜 후보
ws.addEventListener('open', () => console.log(ws.protocol))               // 서버가 고른 것: 'chat.v2'
```

| `readyState` | 의미 |
| --- | --- |
| `0` CONNECTING | 핸드셰이크 중. 이때 `send()`하면 `InvalidStateError`: `open`을 기다린다 |
| `1` OPEN | 주고받는 중 |
| `2` CLOSING | 종료 핸드셰이크 중 |
| `3` CLOSED | 닫힘. 다시 열 수 없고 새 객체를 만든다 |

- 서브프로토콜(`Sec-WebSocket-Protocol`)은 메시지 형식의 이름표다. 서버가 하나를 골라 응답하며, 버전 협상에 쓴다. 압축 같은 확장(`Sec-WebSocket-Extensions`)은 브라우저가 알아서 붙인다.
- **WebSocket에는 CORS가 없다.** 브라우저는 어느 출처로든 연결하고 `Origin` 헤더만 실어 보낸다. 쿠키도 함께 가므로, 서버가 `Origin`을 허용 목록과 비교하지 않으면 다른 사이트가 사용자의 쿠키로 소켓을 여는 **교차 사이트 WebSocket 하이재킹**이 가능하다.

### 데이터: 텍스트와 바이너리

`send()`는 문자열, `Blob`, `ArrayBuffer`, TypedArray를 받는다. 받을 때 텍스트는 늘 문자열이고, 바이너리는 `binaryType`이 정한다.

```javascript
ws.binaryType = 'arraybuffer'   // 기본값은 'blob'
ws.onmessage = (e) => {
  if (typeof e.data === 'string') handleJson(JSON.parse(e.data))
  else handleFrame(new DataView(e.data)) // 바이트 단위로 해석
}
```

Blob은 그대로 `<img>`나 다운로드에 넘기기 좋고, 바이트를 직접 읽으려면 `arraybuffer`가 편하다. 두 형식은 [[binary-data-and-files|바이너리 데이터와 파일]]에 있다.

### 보내는 속도 조절: bufferedAmount

`send()`는 즉시 반환하고 데이터는 브라우저 안에 쌓였다가 네트워크가 허락하는 만큼 나간다. 느린 회선에서 계속 보내면 메모리만 커진다. **`ws.bufferedAmount`(아직 안 나간 바이트 수)** 를 보고 보낼지 정한다.

```javascript
function sendWhenDrained(data) {
  if (ws.bufferedAmount < 64 * 1024) ws.send(data)
  else setTimeout(() => sendWhenDrained(data), 50)
}
```

받는 쪽 속도를 조절하는 방법은 표준 `WebSocket` API에 없다. 스트림으로 읽고 쓰며 역압(backpressure)을 자동으로 거는 `WebSocketStream`이 제안돼 있지만 크로미엄 계열만 지원한다.

### 종료 코드

`ws.close(code, reason)`으로 닫고, 상대는 `close` 이벤트의 `code`·`reason`·`wasClean`으로 받는다. HTTP 상태 코드와는 별개 체계다.

| 코드 | 의미 |
| --- | --- |
| `1000` | 정상 종료 (기본값) |
| `1001` | 떠남: 서버 종료, 페이지 이동 |
| `1006` | 비정상 종료: 종료 프레임 없이 연결이 끊김. 보내는 코드가 아니라 **브라우저가 붙이는 값**이다 |
| `1008` / `1009` / `1011` | 정책 위반 / 메시지가 너무 큼 / 서버 내부 오류 |
| `4000`–`4999` | 애플리케이션이 자유롭게 정의 (예: `4001` 인증 만료) |

브라우저 코드에서 `close()`에 줄 수 있는 코드는 **`1000` 또는 `3000`–`4999`** 뿐이다. 다른 값은 `InvalidAccessError`다. `reason`은 UTF-8로 123바이트 이하다.

### 재연결과 하트비트

표준 API에는 자동 재연결이 없다. 비정상 종료면 **지수 백오프 + 무작위 지연(jitter)** 으로 다시 연결한다. 모든 클라이언트가 같은 순간에 몰려 서버를 다시 쓰러뜨리지 않게 하기 위해서다.

```javascript
function connect(attempt = 0) {
  const ws = new WebSocket(URL)
  ws.onopen = () => { attempt = 0; resync() }          // 끊긴 동안 놓친 메시지를 다시 받는다
  ws.onclose = (e) => {
    if (e.code === 1000 || e.code === 4001) return     // 의도한 종료·인증 만료는 재연결하지 않는다
    const delay = Math.min(30_000, 1000 * 2 ** attempt) * (0.5 + Math.random() / 2)
    setTimeout(() => connect(attempt + 1), delay)
  }
}
```

- 프로토콜의 ping/pong 프레임은 브라우저 JS에서 보낼 수 없다. 프록시가 유휴 연결을 끊는 것을 막거나 죽은 연결을 빨리 알아채려면 `{"type":"ping"}` 같은 **애플리케이션 메시지**로 하트비트를 주고받는다.
- `navigator.onLine`과 `online` 이벤트, 탭이 다시 보일 때의 `visibilitychange`에서 연결 상태를 점검하면 복구가 빨라진다.
- 재연결·방·응답 확인까지 필요하면 Socket.IO 같은 라이브러리를 쓴다. 자체 프로토콜이라 순수 WebSocket 서버와는 호환되지 않는다.

## 정리

- 롱 폴링은 「응답을 붙잡아 두는 요청」을 루프로 반복한다. 메시지가 드물 때 맞다.
- SSE는 `text/event-stream` 위의 `data`·`event`·`id`·`retry` 메시지다. **자동 재연결과 `Last-Event-ID` 이어 받기**가 공짜이고, 멈추려면 서버가 204를 준다.
- `EventSource`는 GET·헤더 없음·텍스트 전용이다. POST나 토큰이 필요하면 `fetch` 스트림을 빈 줄 단위로 직접 파싱한다. HTTP/1.1의 연결 수 제한에 주의한다.
- WebSocket은 `open` 뒤에 보내고, 바이너리는 `binaryType`, 송신 속도는 `bufferedAmount`로 다룬다. 서버는 `Origin`을 검사한다.
- 재연결은 직접 만든다: 지수 백오프 + jitter, 정상·인증 종료는 제외, 재연결 후 재동기화.

관련 노트: [[websocket|WebSocket]], [[realtime-chat-app|실시간 채팅 앱의 데이터 흐름]], [[ajax|AJAX와 HTTP 요청]], [[Computer-Science/Network/http|HTTP 프로토콜]], [[windows-and-frames|창과 프레임]]
