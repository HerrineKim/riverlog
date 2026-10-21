---
title: "WebRTC"
concept: "WebRTC"
summary: "브라우저와 앱이 서버를 거치지 않고 오디오·비디오·데이터를 실시간으로 주고받게 하는 WebRTC의 API, 시그널링, ICE/STUN/TURN, 연결 흐름."
tags: ["network", "webrtc", "javascript", "p2p", "realtime"]
source: mixed
date: "2026-10-21"
sources: ["https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API", "https://www.html5rocks.com/en/tutorials/webrtc/basics/", "https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/", "https://www.html5rocks.com/en/tutorials/webrtc/datachannels/"]
---

> TIL을 바탕으로, 「[Get started with WebRTC](https://web.dev/articles/webrtc-basics)」, 「[Build the backend services needed for a WebRTC app](https://web.dev/articles/webrtc-infrastructure)」, 「[Send data between browsers with WebRTC data channels](https://web.dev/articles/webrtc-datachannels)」, MDN 「[WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)」로 ICE 후보·JSEP·데이터 채널 모드·다자간 구조·보안을 보강했다.

WebRTC(Web Real-Time Communication)는 웹 브라우저와 네이티브 앱이 **P2P(peer-to-peer)** 로 오디오, 비디오, 임의의 데이터를 실시간으로 주고받게 해 주는 오픈 소스 기술이다. 플러그인 없이 화상 통화나 파일 공유를 구현할 수 있다. 다만 "P2P"라고 해도 연결을 맺기까지는 몇 가지 서버의 도움이 필요하다.

## 주요 JavaScript API

| API | 역할 |
| --- | --- |
| `navigator.mediaDevices.getUserMedia()` | 카메라·마이크에서 미디어 스트림 획득 |
| `MediaRecorder` | 스트림 녹화 |
| `RTCPeerConnection` | 피어 간 연결을 맺고 오디오·비디오 스트리밍 |
| `RTCDataChannel` | 피어 간 임의의 데이터(텍스트, 파일 등) 전송 |

보안상 모든 WebRTC 통신은 **암호화가 필수**이고, API는 **보안 컨텍스트(HTTPS 또는 localhost)** 에서만 동작한다.

## 연결에 필요한 것들

### 시그널링 (Signaling)

두 피어는 직접 통신을 시작하기 전에 서로에 대한 **메타데이터**를 교환해야 한다.

- **세션 정보(SDP, Session Description Protocol)**: 코덱, 해상도 등 미디어 설정
- **네트워크 정보(ICE candidate)**: 나에게 접속할 수 있는 IP·포트 후보

WebRTC 표준은 이 메타데이터를 **어떻게 전달할지 정하지 않는다**. 그래서 개발자가 WebSocket, Socket.IO 같은 수단으로 **시그널링 서버**를 직접 만든다. 시그널링 서버는 메시지를 중계할 뿐 실제 미디어는 거치지 않는다. Socket.IO로 실시간 이벤트를 주고받는 구조는 [[realtime-chat-app|실시간 채팅 앱]]에서도 볼 수 있다.

### ICE, STUN, TURN

현실의 기기는 대부분 **NAT와 방화벽** 뒤에 있어서 사설 IP만 알고 있다. 상대가 접속할 수 있는 경로를 찾기 위해 ICE(Interactive Connectivity Establishment) 프레임워크가 후보(candidate)를 모은다.

| 서버 | 역할 |
| --- | --- |
| STUN | "밖에서 보이는 내 공인 IP·포트가 무엇인지" 알려 줌. 대부분 이것으로 직접 연결 가능 |
| TURN | 직접 연결이 불가능할 때(대칭형 NAT, 엄격한 방화벽) 미디어를 **중계(relay)** 하는 서버 |

ICE는 지연이 가장 짧은 **UDP 직접 연결**을 먼저 시도하고, 안 되면 TCP, 그래도 안 되면 TURN 중계로 내려간다. 후보는 종류별로 이름이 있다.

| 후보 종류 | 주소 | 얻는 곳 |
| --- | --- | --- |
| `host` | 기기의 로컬 IP | 네트워크 인터페이스 |
| `srflx`(server reflexive) | NAT 바깥에서 보이는 공인 IP·포트 | STUN 응답 |
| `relay` | TURN 서버가 할당한 주소 | TURN 서버 |

STUN 서버는 요청마다 주소만 돌려주면 되므로 사양이 낮아도 많은 요청을 처리한다. 대부분의 통화는 STUN만으로 연결된다. TURN은 미디어 전체를 중계하므로 **대역폭 비용이 크다.** TURN 서버는 오픈 소스 coturn이 사실상 표준이고, 자격 증명은 REST API로 짧게 사는 것을 발급해 노출을 줄인다. 공개 STUN `stun.l.google.com:19302`는 시험용이다.

정리하면, 실서비스에는 **시그널링 서버 + STUN 서버 + (대비용) TURN 서버**가 필요하다. NAT가 왜 직접 연결을 막는지는 [[network-layer|네트워크 계층]]의 NAT 부분을 참고한다.

## 연결 흐름 (Offer / Answer)

Alice가 Bob에게 전화를 건다고 하자.

1. 양쪽이 `RTCPeerConnection`을 만들고, `getUserMedia()`로 얻은 트랙을 추가한다.
2. Alice가 **offer**(SDP)를 만들어 자신의 local description으로 설정하고, 시그널링 서버로 Bob에게 보낸다.
3. Bob은 받은 offer를 remote description으로 설정하고, **answer**를 만들어 local description으로 설정한 뒤 Alice에게 보낸다.
4. Alice는 answer를 remote description으로 설정한다.
5. 이 과정과 동시에 각자 `onicecandidate` 이벤트로 발견한 ICE 후보를 상대에게 보내고, 받은 쪽은 `addIceCandidate()`로 등록한다.
6. 연결 가능한 후보 쌍이 확인되면 미디어가 P2P로 흐르고, 상대 트랙은 `ontrack` 이벤트로 받는다.

```javascript
// 공통 준비
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
});

const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
localVideo.srcObject = localStream;
localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

// 내 ICE 후보를 시그널링 서버로 전달
pc.onicecandidate = ({ candidate }) => {
  if (candidate) signaling.send({ type: 'candidate', candidate });
};

// 상대 미디어 수신
pc.ontrack = ({ streams }) => {
  remoteVideo.srcObject = streams[0];
};

// 발신 측 (Alice)
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
signaling.send({ type: 'offer', sdp: pc.localDescription });

// 시그널링 메시지 처리 (양쪽 공통)
signaling.onmessage = async (msg) => {
  if (msg.type === 'offer') {
    await pc.setRemoteDescription(msg.sdp);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    signaling.send({ type: 'answer', sdp: pc.localDescription });
  } else if (msg.type === 'answer') {
    await pc.setRemoteDescription(msg.sdp);
  } else if (msg.type === 'candidate') {
    await pc.addIceCandidate(msg.candidate);
  }
};
```

이 offer/answer 구조를 **JSEP(JavaScript Session Establishment Protocol)** 라고 한다. 브라우저는 시그널링 상태를 저장하지 않고 SDP를 만들고 받는 일만 하며, 전달은 앱에 맡긴다.

- `setLocalDescription()`을 불러야 후보 수집이 시작된다.
- **트리클 ICE(Trickle ICE)**: 후보를 다 모을 때까지 기다리지 않고, 찾는 즉시 하나씩 보내고 받는 즉시 `addIceCandidate()`한다. 연결 시간이 크게 줄어든다.
- 양쪽이 동시에 offer를 보내 충돌하는 문제는 한쪽을 「양보하는(polite) 피어」로 정해 충돌 시 자기 offer를 되돌리는 **퍼펙트 협상(perfect negotiation)** 패턴으로 푼다. `setLocalDescription()`을 인자 없이 부르면 상태에 맞는 offer/answer를 알아서 만든다.

> 참고: 예전 튜토리얼에는 `navigator.getUserMedia`(벤더 접두사 포함), `video.src = URL.createObjectURL(stream)`, `pc.addStream()`이 자주 나오지만 모두 **deprecated**다. 지금은 `navigator.mediaDevices.getUserMedia()`(Promise 기반), `video.srcObject`, `addTrack()`/`ontrack`을 쓴다. 브라우저 차이를 메우는 shim으로 `adapter.js`가 있다.

## getUserMedia 제약 조건

`constraints` 객체로 어떤 미디어를 어떤 품질로 받을지 지정한다.

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: {
    width: { min: 300, max: 640 },
    height: { min: 200, max: 480 },
  },
});

stream.getVideoTracks()[0].stop(); // 비디오 트랙 중지
```

`video` 요소에는 CSS `filter`(blur, hue-rotate 등)를 그대로 적용할 수 있다.

## RTCDataChannel로 데이터 보내기

미디어 없이도 피어 간에 텍스트나 파일을 주고받을 수 있다. 데이터 채널은 SCTP 기반이며 기본값은 **신뢰성 있고 순서가 보장되는** 전송이다. 옵션으로 순서·재전송을 끄면 UDP처럼 빠르게 쓸 수도 있다. API는 WebSocket을 본떠 `send()`·`onmessage`로 쓰지만, 서버를 거치지 않으므로 TURN 중계가 끼어도 대개 더 빠르다.

| 모드 | 옵션 | 쓰임 |
| --- | --- | --- |
| 신뢰·순서 보장(TCP와 비슷) | 기본값 (`ordered: true`) | 채팅, 파일 전송 |
| 비신뢰·무순서(UDP와 비슷) | `ordered: false, maxRetransmits: 0` | 게임 상태, 커서 위치처럼 최신 값만 의미 있는 데이터 |
| 부분 신뢰 | `maxRetransmits: n` **또는** `maxPacketLifeTime: ms` (둘 중 하나만) | 일정 시간·횟수 안에서만 재전송 |

손실이 없으면 두 모드의 성능은 비슷하다. 손실이 생기면 순서 보장 모드는 잃은 패킷 뒤의 패킷이 모두 막힌다(head-of-line blocking). `negotiated: true`와 `id`를 주면 상대에게 자동으로 채널을 만들지 않고, 양쪽이 같은 `id`로 직접 만든다.

```javascript
// 보내는 쪽
const channel = pc.createDataChannel('chat');
channel.onopen = () => channel.send('hello');

// 받는 쪽
pc.ondatachannel = ({ channel }) => {
  channel.onmessage = (event) => console.log(event.data);
};
```

큰 데이터(예: 캔버스로 캡처한 사진의 픽셀 배열)는 한 번에 보내지 말고 **약 64KB 이하의 청크로 나눠** 보낸다. 먼저 전체 길이를 보내고, 받는 쪽은 그 길이만큼 버퍼를 만들어 청크를 이어 붙인 뒤 다 모이면 렌더링한다.

```javascript
const CHUNK_LEN = 64000;

function sendBytes(channel, bytes) {
  channel.send(String(bytes.byteLength)); // 전체 길이 먼저
  for (let start = 0; start < bytes.byteLength; start += CHUNK_LEN) {
    channel.send(bytes.subarray(start, start + CHUNK_LEN));
  }
}
```

## 시그널링 서버 예시 (Node.js + Socket.IO)

시그널링 서버는 두 가지 일만 하면 된다.

1. **메시지 중계**: 한 클라이언트의 offer/answer/candidate를 같은 방의 다른 클라이언트에게 전달
2. **방 관리**: 첫 번째 사람은 방을 만들고(initiator), 두 번째 사람은 참가, 그 이상은 거절

```javascript
io.on('connection', (socket) => {
  socket.on('message', (message) => {
    socket.broadcast.emit('message', message); // 상대에게 중계
  });

  socket.on('create or join', (room) => {
    const numClients = io.sockets.adapter.rooms.get(room)?.size ?? 0;
    if (numClients === 0) {
      socket.join(room);
      socket.emit('created', room);   // 방장 = offer를 보낼 쪽
    } else if (numClients === 1) {
      socket.join(room);
      socket.emit('joined', room);
      io.to(room).emit('ready');      // 둘 다 모이면 연결 시작
    } else {
      socket.emit('full', room);      // 1:1 예제이므로 최대 2명
    }
  });
});
```

## 다자간 통화 토폴로지

`RTCPeerConnection` 하나는 1:1 연결이다. 참가자가 늘면 구조를 고른다.

| 구조 | 방식 | 한계·쓰임 |
| --- | --- | --- |
| 풀 메시(mesh) | 모든 참가자가 서로 연결(n−1개 연결) | 서버가 필요 없지만 업로드가 참가자 수만큼 늘어 **4~5명 정도**가 한계. 모바일은 더 빨리 무너진다 |
| SFU(Selective Forwarding Unit) | 각자 서버에 한 번 올리고, 서버가 디코딩 없이 골라서 전달 | 지금의 주류. 사이멀캐스트(해상도별 여러 스트림)로 받는 쪽 대역폭에 맞춰 고른다. mediasoup, LiveKit, Janus, Jitsi |
| MCU(Multipoint Control Unit) | 서버가 받은 스트림을 디코딩·합성(믹싱)해 하나로 보냄 | 받는 쪽은 가볍지만 서버 CPU 비용이 크다. 녹화·레거시 회의 장비 연동 |

WebRTC는 표준 기술이라 게이트웨이를 두면 다른 망과도 통한다. SIP 기반 VoIP·화상 회의 장비와는 시그널링만 프록시를 거치고 미디어(SRTP)는 직접 흐르며, 일반 전화망(PSTN)은 PSTN 게이트웨이를 거친다(→ [[voip-sip-rtp|VoIP 전화망: SIP, SDP, RTP]]). 방송 송출에는 HTTP 한 번으로 시그널링하는 WHIP(송출)·WHEP(재생) 프로토콜이 쓰인다.

## 보안

모든 WebRTC 구성 요소에서 **암호화가 필수**다. 미디어는 SRTP, 데이터 채널은 DTLS(데이터그램용 TLS)로 암호화한다. 키 교환도 DTLS로 하므로 시그널링 서버가 미디어를 볼 수 없다. 단, SFU·MCU를 거치면 서버에서 복호화되므로, 서버까지 못 보게 하려면 프레임 단위 종단 간 암호화(Encoded Transform API)를 따로 쓴다.

## 디버깅

- Chrome의 `chrome://webrtc-internals`에서 연결 통계, ICE 후보, SDP를 확인할 수 있다.
- 콘솔에서 `pc.localDescription.sdp`를 출력해 SDP 형식을 직접 보는 것도 이해에 도움이 된다.

## 핵심 정리

- WebRTC = 미디어·데이터는 P2P, 하지만 **연결을 맺기 위한 시그널링은 직접 구현**해야 한다.
- 교환하는 것: SDP(offer/answer)와 ICE candidate.
- STUN으로 공인 주소를 알아내고, 안 되면 TURN으로 중계한다.
- 데이터 채널은 신뢰·순서를 옵션으로 고른다. 최신 값만 중요하면 `ordered: false, maxRetransmits: 0`.
- 3~4명을 넘는 통화는 메시 대신 SFU를 둔다.

관련 노트: [[voip-sip-rtp|VoIP 전화망: SIP, SDP, RTP]]
