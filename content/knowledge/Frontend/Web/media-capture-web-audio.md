---
title: "미디어 캡처와 Web Audio API"
concept: "Media Capture & Web Audio"
summary: "브라우저에서 카메라·마이크·화면을 받아 다루는 Media Capture and Streams(MediaStream·MediaStreamTrack의 소스와 소비자, getUserMedia·getDisplayMedia, enumerateDevices)와, 소리를 노드 그래프로 만들고 가공하는 Web Audio API(AudioContext, 소스·효과·분석·출력 노드, 정밀한 예약 재생, 자동 재생 정책과 resume, AudioWorklet)를 정리한다."
tags: ["browser", "media", "api", "frontend", "javascript"]
source: other
date: "2026-10-21"
sources: ["https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API", "https://www.html5rocks.com/en/tutorials/getusermedia/intro/", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API"]
---

> MDN의 「[Media Capture and Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API)」, 「[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)」와 「[Capture audio and video in HTML5](https://www.html5rocks.com/en/tutorials/getusermedia/intro/)」를 바탕으로 재구성한 노트다.

## 두 API의 자리

| API | 다루는 것 | 대표 진입점 |
| --- | --- | --- |
| Media Capture and Streams | 카메라·마이크·화면에서 오는 **실시간 스트림** | `navigator.mediaDevices.getUserMedia()` |
| Web Audio | 소리를 만들고 섞고 가공하고 분석하는 **오디오 처리 그래프** | `new AudioContext()` |
| `<audio>`·`<video>` | 파일·스트림의 재생과 기본 컨트롤 | [[html-media-elements\|이미지·오디오·비디오 임베드]] |
| MediaRecorder | 스트림을 파일(Blob)로 녹음·녹화 | [[audio-recording\|React에서 음성 녹음하고 파일로 보내기]] |
| WebRTC | 스트림을 다른 피어와 주고받기 | [[webrtc\|WebRTC]] |

세 API는 MediaStream을 공통 통화로 이어진다. 카메라 스트림을 `<video>`에 보이고, Web Audio로 마이크 소리를 분석하고, WebRTC로 보내고, MediaRecorder로 녹화하는 일이 모두 같은 객체로 된다.

## MediaStream과 트랙

**MediaStream은 MediaStreamTrack 여러 개의 묶음**이다. 트랙 하나는 오디오나 비디오 한 줄기이고(`kind`), 오디오 트랙은 다시 채널(스테레오의 왼쪽·오른쪽)로 나뉜다.

```text
소스                                       소비자
getUserMedia (카메라·마이크) ─┐           ┌─ <video>.srcObject / <audio>.srcObject
getDisplayMedia (화면 공유)  ─┤           ├─ RTCPeerConnection.addTrack()
canvas.captureStream()       ─┼─ MediaStream ─┼─ MediaRecorder
video.captureStream()        ─┤  (트랙들)   ├─ Web Audio MediaStreamAudioSourceNode
RTCPeerConnection ontrack    ─┤           └─ ImageCapture (사진)
Web Audio MediaStreamAudioDestinationNode ─┘
```

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'user', width: { ideal: 1280 } },
  audio: true,
})
video.srcObject = stream                       // src에 URL을 넣지 않는다

// 다 쓰면 트랙을 멈춰야 카메라 표시등이 꺼진다
stream.getTracks().forEach((t) => t.stop())
```

- 보안 컨텍스트에서만 동작하고, 처음 부를 때 권한 프롬프트가 뜬다. 거절하면 `NotAllowedError`, 장치가 없으면 `NotFoundError`, 제약을 만족하는 장치가 없으면 `OverconstrainedError`다.
- 제약 조건(`ideal`·`exact`·`min`·`max`, `deviceId`, `facingMode`)과 해상도 지정은 [[webrtc|WebRTC]]의 「getUserMedia 제약 조건」에 있다.
- `navigator.mediaDevices.enumerateDevices()`로 카메라·마이크 목록을 얻는다. **권한을 받기 전에는 `label`이 빈 문자열**이라, 장치 선택 UI는 첫 허용 뒤에 채운다. 장치가 꽂히거나 빠지면 `devicechange`가 온다.
- 화면 공유는 `getDisplayMedia()`로 받는다. 사용자 동작 안에서만 부를 수 있고, 무엇을 공유할지는 사용자가 브라우저 대화상자에서 고른다.
- 사진 한 장, 녹화 파일 하나만 필요하면 스트림 없이 `<input type="file" accept="image/*" capture="environment">`로 모바일 카메라 앱을 바로 연다(`capture="user"`는 전면 카메라). 실시간 미리보기·필터가 필요할 때만 `getUserMedia`를 쓴다.

과거에는 Flash·Silverlight 플러그인으로 카메라를 썼다. 표준화 과정에서 `<input capture>`(HTML Media Capture), 출시되지 않은 `<device>` 요소, 벤더 접두사가 붙은 콜백식 `navigator.getUserMedia()`를 거쳐 지금의 프로미스 기반 `navigator.mediaDevices.getUserMedia()`가 됐다. 옛 예제의 `video.src = URL.createObjectURL(stream)`은 `video.srcObject`로 바뀌었다.

## Web Audio API: 오디오 라우팅 그래프

Web Audio는 **`AudioContext` 안에서 오디오 노드를 이어 붙여 만든 그래프**로 소리를 다룬다. 소스 노드에서 나온 샘플(초당 수만 개의 진폭 값)이 효과 노드를 지나 출력(`context.destination`, 스피커)으로 흐른다. 2021년 4월부터 모든 주요 브라우저에서 쓸 수 있다.

| 역할 | 노드 | 예 |
| --- | --- | --- |
| 소스 | `OscillatorNode`, `AudioBufferSourceNode`, `MediaElementAudioSourceNode`, `MediaStreamAudioSourceNode`, `ConstantSourceNode` | 합성음, 디코딩한 효과음, `<audio>` 요소, 마이크 |
| 음량·필터 | `GainNode`, `BiquadFilterNode`, `DynamicsCompressorNode`, `WaveShaperNode` | 볼륨, 저역·고역 통과, 압축, 왜곡 |
| 공간·잔향 | `PannerNode`, `StereoPannerNode`, `ConvolverNode`, `DelayNode` | 3D 위치(소스·청취자 모델, 거리 감쇠), 좌우 패닝, 리버브, 에코 |
| 분석 | `AnalyserNode` | 파형·주파수 데이터로 시각화, 음량 미터 |
| 출력 | `context.destination`, `MediaStreamAudioDestinationNode` | 스피커, 녹음·전송용 스트림 |
| 사용자 정의 | `AudioWorkletNode` | 오디오 렌더 스레드에서 도는 직접 만든 처리기 |

```javascript
const ctx = new AudioContext()
const buffer = await ctx.decodeAudioData(await (await fetch('/click.mp3')).arrayBuffer())

function play(when = 0) {
  const src = new AudioBufferSourceNode(ctx, { buffer })  // 소스 노드는 한 번만 재생된다
  const gain = new GainNode(ctx, { gain: 0.5 })
  src.connect(gain).connect(ctx.destination)
  src.start(ctx.currentTime + when)                       // 오디오 시계 기준으로 예약
}

button.addEventListener('click', async () => {
  if (ctx.state === 'suspended') await ctx.resume()       // 자동 재생 정책
  for (let i = 0; i < 4; i++) play(i * 0.25)              // 0.25초 간격 정확한 4박
})
```

- **시간은 `ctx.currentTime`(오디오 하드웨어 시계, 초)** 으로 예약한다. `setTimeout`보다 훨씬 정밀해서 드럼 머신·시퀀서처럼 샘플 단위 타이밍이 필요한 것을 만들 수 있다. 값의 변화도 `gain.gain.linearRampToValueAtTime(0, t)`처럼 시각을 지정해 예약한다.
- **자동 재생 정책**: 사용자 동작 전에 만든 `AudioContext`는 `suspended` 상태로 시작한다. 클릭 같은 동작 안에서 `resume()`해야 소리가 난다.
- `AudioBufferSourceNode`·`OscillatorNode`는 일회용이다. 다시 재생하려면 노드를 새로 만든다. 가볍게 만들도록 설계됐다.
- 직접 샘플을 다루려면 `AudioWorklet`을 쓴다. 메인 스레드에서 돌던 `ScriptProcessorNode`는 deprecated다.
- `OfflineAudioContext`는 스피커 대신 버퍼로, 실시간보다 빠르게 렌더링한다. 파형 미리 계산, 효과를 입힌 파일 내보내기에 쓴다.

### 마이크 소리 분석

```javascript
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
const analyser = new AnalyserNode(ctx, { fftSize: 2048 })
ctx.createMediaStreamSource(stream).connect(analyser)   // destination에 잇지 않으면 하울링이 없다

const data = new Uint8Array(analyser.frequencyBinCount)
;(function draw() {
  analyser.getByteFrequencyData(data)                    // 0~255 주파수별 세기
  renderBars(data)                                       // canvas에 막대 그리기
  requestAnimationFrame(draw)
})()
```

출력에 연결하지 않아도 분석은 된다. 사용자가 들어야 할 때만 `destination`에 잇는다.

## 정리

- 실시간 미디어의 공통 단위는 MediaStream이고, 트랙을 `stop()`해야 장치가 풀린다.
- 장치 목록의 이름은 권한을 받은 뒤에 보인다. 사진 한 장이면 `<input capture>`로 충분하다.
- Web Audio는 소스 → 효과 → 분석 → 출력의 노드 그래프다. 시간은 `ctx.currentTime`으로 예약한다.
- `AudioContext`는 사용자 동작 안에서 `resume()`한다. 직접 처리는 `AudioWorklet`으로 한다.

관련 노트: [[webrtc|WebRTC]], [[html-media-elements|이미지·오디오·비디오 임베드]], [[audio-recording|React에서 음성 녹음하고 파일로 보내기]], [[device-permission-apis|권한 모델과 기기 API]], [[canvas-2d|Canvas 2D API]]
