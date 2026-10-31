---
title: "권한 모델과 기기 API"
concept: "Device APIs"
summary: "브라우저가 기기 기능을 여는 방식. 보안 컨텍스트·Permissions-Policy·사용자 동작·권한 프롬프트를 묶어 보여 주는 Permissions API의 query()와 granted·denied·prompt 상태, 그리고 권한이 걸린 기기 API인 위치, 기기 방향·움직임(iOS의 requestPermission), 게임패드(폴링), 음성 합성·인식, 진동의 쓰임과 지원 범위를 정리한다."
tags: ["browser", "api", "mobile", "privacy", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API", "https://developer.mozilla.org/en-US/docs/Web/API/Detecting_device_orientation", "https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API", "https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API", "https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API"]
---

> MDN의 「[Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)」, 「[Detecting device orientation](https://developer.mozilla.org/en-US/docs/Web/API/Detecting_device_orientation)」, 「[Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API)」, 「[Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)」, 「[Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)」을 바탕으로, 브라우저 지원은 MDN 호환성 데이터로 확인해 재구성한 노트다.

## 기기 API가 열리는 조건

위치, 카메라, 알림, 센서처럼 사용자를 추적하거나 방해할 수 있는 기능은 **여러 겹의 조건**을 모두 통과해야 쓸 수 있다.

| 조건 | 내용 |
| --- | --- |
| 보안 컨텍스트 | HTTPS(또는 `localhost`)에서만 노출되는 API가 많다 |
| Permissions-Policy | 문서·iframe에 허용된 기능만 쓴다. 예: `Permissions-Policy: geolocation=(self)`, `<iframe allow="camera">` |
| 사용자 동작(user activation) | 클릭·키 입력 처리 안에서만 요청할 수 있는 API가 있다. 알림 권한, 포인터 락, 기기 방향 권한, 진동(Chrome) |
| 권한 프롬프트 | 사용자가 허용·차단을 고른다. 선택은 출처(origin)별로 저장되고 브라우저 설정에서 바꾼다 |

권한을 묻는 원칙(왜 필요한지 먼저 보여 주고, 사용자의 클릭에 맞춰 요청하고, 거절되면 대체 경로를 준다)은 [[pwa-os-integration|PWA 기능과 OS 통합]]에 있다.

## Permissions API: 권한 상태 확인

과거에는 API마다 권한을 다루는 방식이 제각각이었다. 알림은 `Notification.permission`과 `requestPermission()`이 있었지만 위치에는 상태를 확인하는 방법이 없었다. **Permissions API는 권한 상태를 한 가지 방법으로 확인하게 한다.** 2022년 9월부터 모든 주요 브라우저에서 쓸 수 있고, 워커 안에서도 된다.

```javascript
const status = await navigator.permissions.query({ name: 'geolocation' })
// status.state: 'granted' | 'denied' | 'prompt'
status.onchange = () => updateLocationButton(status.state) // 사용자가 설정에서 바꾸면 알린다
```

| 상태 | 뜻 | UI |
| --- | --- | --- |
| `granted` | 이미 허용됐다 | 바로 기능을 쓴다 |
| `prompt` | 쓰려고 하면 프롬프트가 뜬다 | 먼저 이유를 설명하는 버튼을 보여 준다 |
| `denied` | 거절됐거나 정책으로 막혔다 | 프롬프트가 다시 뜨지 않는다. 설정에서 바꾸는 법을 안내하거나 대체 경로를 준다 |

- `query()`가 돌려주는 상태는 보안 컨텍스트, Permissions-Policy, 사용자 동작 요구, 프롬프트 결과를 **모두 합친 값**이다. 정책으로 막혔으면 프롬프트 없이 `denied`다.
- **요청은 이 API가 하지 않는다.** 프롬프트는 각 기능을 실제로 부를 때(`getCurrentPosition()`, `getUserMedia()`, `Notification.requestPermission()`) 뜬다.
- 권한 회수도 API로 할 수 없다. 한때 있던 `permissions.revoke()`는 브라우저에서 제거됐다.
- 조회할 수 있는 이름(`geolocation`, `notifications`, `push`, `camera`, `microphone`, `persistent-storage` 등)은 브라우저마다 다르다. 모르는 이름이면 `TypeError`가 나므로 `try`로 감싼다.

## 위치: Geolocation

```javascript
navigator.geolocation.getCurrentPosition(
  ({ coords }) => show(coords.latitude, coords.longitude, coords.accuracy), // accuracy는 미터
  (err) => fallbackToAddressInput(err.code),  // 1 거절, 2 위치 불가, 3 시간 초과
  { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
)
const id = navigator.geolocation.watchPosition(onMove) // 계속 추적, clearWatch(id)로 멈춘다
```

`enableHighAccuracy: true`는 GPS를 깨워 배터리를 더 쓰고 느리다. 길 안내처럼 정밀도가 필요할 때만 켠다.

## 기기 방향과 움직임

| 이벤트 | 알려 주는 것 | 값 |
| --- | --- | --- |
| `deviceorientation` | 기기가 기울어진 **각도** | `alpha`(z축, 0~360°), `beta`(x축 앞뒤, -180~180°), `gamma`(y축 좌우, -90~90°), `absolute` |
| `devicemotion` | **가속도**와 회전 속도 | `acceleration`, `accelerationIncludingGravity`, `rotationRate`, `interval`(ms) |

```javascript
async function enableMotion() { // 버튼 클릭 핸들러에서 부른다
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    const state = await DeviceOrientationEvent.requestPermission() // iOS Safari: 'granted' | 'denied'
    if (state !== 'granted') return
  }
  addEventListener('deviceorientation', (e) => tilt(e.beta, e.gamma))
}
```

- **iOS Safari는 `requestPermission()`을 사용자 동작 안에서 불러야** 이벤트를 준다. 다른 브라우저에는 이 메서드가 없으므로 기능 감지로 나눈다.
- 보안 컨텍스트에서만 동작한다. 화면 회전 자체를 알고 싶으면 센서가 아니라 `screen.orientation`과 `orientation` 미디어 쿼리를 쓴다.
- 기기 간 값 차이가 커서, 정밀한 센서 값이 필요하면 Generic Sensor API(`Accelerometer`, `Gyroscope`, Chromium)를 쓴다.

## 게임패드

```javascript
addEventListener('gamepadconnected', (e) => console.log(e.gamepad.id, e.gamepad.mapping))

function loop() {
  for (const pad of navigator.getGamepads()) {   // 빈 슬롯은 null
    if (!pad) continue
    if (pad.buttons[0].pressed) jump()           // 'standard' 매핑에서 0번은 오른쪽 아래(A·×) 버튼
    move(pad.axes[0], pad.axes[1])               // 왼쪽 스틱, -1~1
  }
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
```

- **게임패드는 이벤트가 아니라 폴링이다.** 버튼·스틱 값은 매 프레임 `getGamepads()`로 새로 읽는다. 연결·해제만 이벤트로 온다.
- 사용자가 버튼을 한 번 누르기 전에는 연결된 패드가 노출되지 않는다(핑거프린팅 방지).
- `mapping === 'standard'`이면 버튼·축 배치가 표준 배열(버튼 17개, 축 4개)을 따른다. 아니면 기기별로 매핑해야 한다.
- 2017년 3월부터 모든 주요 브라우저가 지원한다. 진동(`vibrationActuator`)은 일부 브라우저만 된다.

## 음성: 합성과 인식

| 부분 | 인터페이스 | 하는 일 | 지원 |
| --- | --- | --- | --- |
| 음성 합성(TTS) | `speechSynthesis`, `SpeechSynthesisUtterance` | 글을 읽어 준다. 언어·목소리·속도·높이를 고른다 | 모든 주요 브라우저 |
| 음성 인식 | `SpeechRecognition` | 마이크 음성을 글로 바꾼다. 중간 결과(`interimResults`)와 연속 모드 | Chrome 139부터 접두사 없이, Safari 14.1부터 `webkitSpeechRecognition`. Firefox는 기본 지원하지 않는다 |

```javascript
const u = new SpeechSynthesisUtterance('주문이 접수됐다')
u.lang = 'ko-KR'
speechSynthesis.speak(u)
```

- 인식은 기본적으로 **플랫폼의 서버 음성 인식 서비스**로 소리를 보낸다. Chrome은 기기 안에서 처리하는 옵션(`processLocally`)을 더했다. 민감한 음성을 다루면 어디로 가는지 확인한다.
- 목소리 목록(`speechSynthesis.getVoices()`)은 비동기로 채워지므로 `voiceschanged` 이벤트 뒤에 읽는다.

## 진동

```javascript
navigator.vibrate(200)              // 200ms
navigator.vibrate([200, 100, 200])  // 진동·쉼·진동
navigator.vibrate(0)                // 진행 중인 진동 취소
```

- 숫자 배열은 진동과 쉼의 길이(ms)를 번갈아 뜻한다. 하드웨어가 없으면 아무 일도 하지 않는다.
- **Baseline이 아니다.** Android의 Chromium 계열만 동작한다. Safari는 지원한 적이 없고, Firefox는 129에서 제거했다. Chrome은 사용자 동작 없이는 `false`를 돌려주고, 다른 출처 iframe에서는 막는다.
- 진동은 보조 피드백으로만 쓴다. 중요한 정보를 진동만으로 전하지 않는다.

## 정리

- 기기 API는 보안 컨텍스트 → Permissions-Policy → 사용자 동작 → 프롬프트를 모두 통과해야 열린다.
- 상태 확인은 `navigator.permissions.query()`, 요청은 각 기능을 부를 때 한다. `denied`는 다시 묻지 못하니 첫 요청의 맥락이 중요하다.
- iOS의 기기 방향·움직임은 사용자 동작 안의 `requestPermission()`이 필요하다.
- 게임패드는 매 프레임 폴링, 음성 인식은 서버로 소리가 갈 수 있다는 점, 진동은 Android Chromium 전용이라는 점을 기억한다.

기기 기능은 감지하고, 이유를 보여 준 뒤 요청하고, 없거나 거절돼도 쓸 수 있게 만든다.

관련 노트: [[pwa-os-integration|PWA 기능과 OS 통합]], [[ui-input-events|마우스·포인터·키보드 이벤트]], [[media-capture-web-audio|미디어 캡처와 Web Audio API]], [[browser-fingerprinting|브라우저 핑거프린팅]], [[webxr|WebXR]]
