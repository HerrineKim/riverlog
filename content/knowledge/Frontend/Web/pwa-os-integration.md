---
title: "PWA 기능과 OS 통합"
concept: "Web Capabilities"
summary: "PWA가 운영 체제와 이어지는 기능을 지원 범위별로 정리한다. 웹 푸시와 알림(iOS는 16.4부터 홈 화면 웹 앱에서만, 18.4부터 선언적 웹 푸시), 앱 배지, 공유하기와 공유 대상, 파일 시스템 접근과 파일 핸들러, 프로토콜 핸들러, 링크 캡처, 연락처 선택기, 하드웨어 API, 그리고 Project Fugu·오리진 트라이얼로 새 기능을 시험하는 법과 기능 감지·권한 요청 원칙을 다룬다."
tags: ["frontend", "web", "pwa", "browser", "mobile"]
source: other
date: "2026-10-21"
sources: ["https://web.dev/learn/pwa/os-integration", "https://web.dev/learn/pwa/capabilities", "https://web.dev/learn/pwa/experimental", "https://web.dev/learn/pwa/update", "https://web.dev/learn/pwa/getting-started", "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/", "https://webkit.org/blog/16535/meet-declarative-web-push/", "https://developer.mozilla.org/en-US/docs/Web/API/Badging_API", "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/file_handlers", "https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API"]
---

> web.dev의 「[Learn PWA](https://web.dev/learn/pwa)」 강좌의 OS 통합·기능·실험적 기능 모듈을 바탕으로, iOS 지원은 WebKit 블로그, 상태는 MDN으로 확인해 재구성한 노트다. 알림의 두 종류는 MDN의 「[Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)」로 보강했다.

## 원칙: 감지하고, 맥락을 주고, 대체한다

**기능은 브라우저·플랫폼마다 지원이 다르다.** 그래서 세 가지를 지킨다.

1. **기능 감지**: `if ('share' in navigator)`처럼 API가 있는지 확인하고 쓴다. UA로 추측하지 않는다.
2. **맥락 있는 권한 요청**: 알림·위치·연락처 권한은 왜 필요한지 화면에서 설명한 뒤, 사용자의 클릭에 맞춰 요청한다. 첫 방문에 바로 띄우지 않는다.
3. **대체 경로**: 지원하지 않으면 링크 복사, 파일 다운로드, 다음 방문 때 재시도 같은 평범한 웹 방식으로 같은 일을 하게 한다.

여러 기능은 **설치해야만** 생긴다(배지, 바로 가기, 공유 대상, 파일 핸들러 등). 설치는 [[pwa-installation|PWA 설치와 설치 유도]]에 있다.

## 웹 푸시와 알림

| 구성 | 역할 |
| --- | --- |
| Push API | 서버가 푸시 서비스를 거쳐 서비스 워커를 깨우고 작은 페이로드를 보낸다. 앱이 닫혀 있어도 된다 |
| Notifications API | 시스템 알림을 띄운다. 사용자 권한이 필요하다 |
| VAPID 키 | 푸시를 보내는 서버를 식별하는 키 쌍. 구독 때 공개 키를 넘긴다 |

알림은 OS의 알림 시스템이 그리므로 탭을 바꾸거나 다른 앱으로 가도 보인다. 만드는 곳에 따라 두 가지다.

| 종류 | 만드는 법 | 수명 |
| --- | --- | --- |
| 비지속(non-persistent) | 페이지에서 `new Notification(title, options)` | 페이지가 닫히면 더는 반응하지 않는다. 클릭은 그 인스턴스의 `click` 이벤트로 받는다 |
| 지속(persistent) | 서비스 워커에서 `registration.showNotification()` | 페이지보다 오래 산다. 클릭은 서비스 워커의 `notificationclick`으로 받는다 |

**모바일에서는 지속 알림만 된다.** 대부분의 모바일 브라우저에서 `Notification()` 생성자는 `TypeError`를 던진다. 권한은 `Notification.requestPermission()`으로, 클릭 같은 사용자 동작 안에서만 요청한다. 권한 상태를 일관되게 확인하는 방법은 [[device-permission-apis|권한 모델과 기기 API]]에 있다.

```javascript
// 사용자가 「알림 받기」를 눌렀을 때
const reg = await navigator.serviceWorker.ready;
const sub = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: VAPID_PUBLIC_KEY,
});
await fetch('/api/push-subscriptions', { method: 'POST', body: JSON.stringify(sub) });

// sw.js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body }));
});
```

### iOS·iPadOS 조건

- **iOS·iPadOS 16.4부터, 홈 화면에 추가한 웹 앱에서만** 웹 푸시를 쓸 수 있다. Safari 탭에서는 안 된다.
- 권한은 구독 버튼 같은 **사용자의 직접 동작에 응답해서만** 요청할 수 있다.
- W3C 표준 Web Push 그대로이고 Apple 개발자 계정이 필요 없다. 서버 방화벽이 `*.push.apple.com`을 막지 않아야 한다.
- 알림은 잠금 화면·알림 센터·Apple Watch에 뜨고 집중 모드를 따른다. 권한은 설정 > 알림에서 웹 앱마다 관리한다.
- iOS·iPadOS 18.4부터는 **선언적 웹 푸시(Declarative Web Push)** 도 된다. 푸시 메시지 자체에 알림 내용을 담아 보내, 서비스 워커 없이도 알림을 띄운다. 서비스 워커가 있으면 내용을 고칠 수 있고, 그 스크립트가 실패해도 선언된 알림이 대체로 뜬다. 기존 웹 푸시와 호환된다.

## 앱 배지

```javascript
if ('setAppBadge' in navigator) {
  navigator.setAppBadge(unreadCount); // 숫자 없이 부르면 점(flag)만
  navigator.clearAppBadge();          // setAppBadge(0)도 지운다
}
```

- 설치된 앱의 아이콘(독·작업 표시줄·홈 화면)에 붙는다. 서비스 워커에서도 부를 수 있어 푸시를 받을 때 갱신한다.
- 표시는 최선 노력이다. 4000을 99+로 줄이거나, Android 일부 기기처럼 숫자 대신 점만 보일 수 있다.
- iOS·iPadOS는 16.4부터 홈 화면 웹 앱에서 지원하고, 배지를 보이려면 알림 권한이 필요하다. Android 바로 가기형 설치에서는 쓸 수 없다.
- Baseline이 아니므로 감지하고 쓴다.

## 공유: 보내기와 받기

### 보내기: Web Share API

```javascript
const data = { title: document.title, url: location.href };
if (navigator.canShare?.(data)) {
  await navigator.share(data);      // 사용자가 취소하면 reject
} else {
  await navigator.clipboard.writeText(location.href);
}
```

텍스트(`title`, `text`), URL, 파일(`files`, `canShare()`로 먼저 확인)을 OS 공유 시트로 보낸다. Chromium과 Safari가 지원하지만 Baseline이 아니라 대체 경로를 둔다. 메신저·SNS로 보낼 때는 앱마다 다른 전용 URL 스킴보다 이것을 쓴다. `tel:`, `mailto:`, `sms:`는 어디서나 된다.

### 받기: Web Share Target

설치된 PWA를 OS 공유 시트의 대상으로 등록한다. **Android(WebAPK)와 ChromeOS에서, 설치한 뒤에만** 동작한다.

```json
"share_target": {
  "action": "/receive-share/",
  "method": "GET",
  "params": { "title": "shared_title", "text": "shared_text", "url": "shared_url" }
}
```

- GET이면 action URL에 쿼리로 붙어 열린다. `new URL(location).searchParams`로 읽는다.
- 파일을 받으려면 `method: "POST"`, `enctype: "multipart/form-data"`, `params.files`를 쓰고 서버나 서비스 워커에서 처리한다.
- 공유 시트의 이름·아이콘은 매니페스트의 것을 쓴다. 받는 페이지는 오프라인에서도 열리게 프리캐시한다.

## 파일

### 파일 시스템 접근 API

```javascript
const [handle] = await window.showOpenFilePicker();   // 사용자 동작이 필요하다
const text = await (await handle.getFile()).text();

const writable = await handle.createWritable();        // 임시 파일에 쓰고
await writable.write(newText);
await writable.close();                                 // 닫을 때 확정
```

- 사용자 파일을 직접 열고 저장하는 피커는 Chromium 데스크톱 중심이다. 없으면 `<input type="file">`과 다운로드 링크로 대체한다.
- 모든 주요 브라우저는 사이트 전용 가상 파일 시스템인 **OPFS(Origin Private File System)** 를 `navigator.storage.getDirectory()`로 지원한다. 사용자에게 보이지 않는 대신 빠르다.
- 사용자가 고른 실제 파일은 출처 할당량에 들어가지 않는다([[pwa-offline-storage|PWA 오프라인 데이터와 저장소 관리]]).

### 파일 핸들러: OS에서 파일을 앱으로 열기

```json
"file_handlers": [
  { "action": "/open-file", "accept": { "text/markdown": [".md"] } }
]
```

```javascript
// action 페이지의 메인 스레드에서
if ('launchQueue' in window) {
  launchQueue.setConsumer(async ({ files }) => {
    for (const handle of files) openEditor(await handle.getFile());
  });
}
```

설치된 앱을 확장자·MIME 유형의 처리기로 등록한다. MDN 기준 실험적이고 Chromium 데스크톱에서 쓴다. 이미 열린 창을 재사용할지 새 창을 열지는 매니페스트 `launch_handler`로 정한다.

## 링크와 프로토콜

| 기능 | 동작 | 지원 |
| --- | --- | --- |
| 링크 캡처 | 스코프 안 URL을 누르면 브라우저 대신 설치된 앱이 연다 | Android WebAPK는 자동(intent filter). 다른 출처를 더 잡을 수는 없다. iOS Safari는 링크를 잡지 못하고, App Store에 올린 PWA만 가능하다 |
| 프로토콜 핸들러 | `web+recipe://123` 같은 스킴을 앱이 처리 | 데스크톱. 모바일은 스토어 배포로만 |

```json
"protocol_handlers": [
  { "protocol": "web+recipe", "url": "/from-protocol?value=%s" }
]
```

스킴은 허용 목록에 있거나 `web+` 접두어여야 한다. `%s`에 이스케이프된 원래 URL이 들어간다. 런타임에는 `navigator.registerProtocolHandler()`로도 등록한다.

## 그 밖의 기능

| 분류 | 기능 | 지원 정도 |
| --- | --- | --- |
| 어디서나 | 위치, 카메라·마이크, 게임패드, WebAuthn(생체 인증), 클립보드, Credential Management, 전체 화면, PiP, 화면 꺼짐 방지 | 주요 브라우저 |
| 일부 브라우저에서 성숙 | Web Bluetooth, WebUSB, Web Serial, WebHID, WebNFC, Payment Request, Media Session, Screen Capture, WebXR | 대체로 Chromium. WebNFC는 Android Chrome |
| 연락처 선택기 | `navigator.contacts.select(['name', 'tel'], { multiple: true })`로 네이티브 연락처 대화상자 | 모바일 일부. 요청한 속성이 빠져 올 수 있어 확인한다 |
| 결제 | Payment Request API(Apple Pay JS도 그 위에 있다), TWA로 Google Play에 올린 PWA의 Digital Goods API | |
| 백그라운드 | 백그라운드 동기화·주기적 동기화·백그라운드 가져오기 | Chromium([[pwa-offline-storage\|PWA 오프라인 데이터와 저장소 관리]]) |
| 센서 | Generic Sensor API, 옛 `DeviceMotionEvent`·`DeviceOrientationEvent`([[device-permission-apis\|권한 모델과 기기 API]]) | Safari는 비표준 권한 요청이 필요하다 |

정확한 지원은 기능마다 MDN의 Baseline 표시와 호환성 표로 확인한다.

## 새 기능을 시험하는 법

**Project Fugu(Capabilities project)** 는 네이티브 앱만 하던 일을 웹에서 안전하게 하려는 여러 회사의 공동 작업이다. 공개 추적기에서 API별 상태를 볼 수 있고, 필요한 기능은 Chromium 버그 트래커나 webwewant.fyi로 요청한다.

| 단계 | 방법 | 누가 쓰나 |
| --- | --- | --- |
| 개발자 시험(developer trial) | 플래그 뒤에 숨어 있다. Chromium은 `about://flags`, Safari는 macOS 개발자용 메뉴나 iOS 설정 > Safari > 고급 > 기능 플래그, Firefox는 `about:config` | 내 브라우저에서만. **사용자에게 플래그를 켜라고 안내하지 않는다** |
| 오리진 트라이얼(origin trial) | 출처에 토큰을 등록해 실사용자에게 켠다. 사용량 상한이 있고 API가 바뀔 수 있다 | 실사용자 일부. Chrome·Edge의 트라이얼은 그 브라우저에서만 동작한다 |

Safari에는 오리진 트라이얼이 없다. 트라이얼 기능은 언제든 사라질 수 있으므로 기능 감지와 우아한 저하(graceful degradation)를 반드시 둔다.

## 정리

- 기능은 감지하고 쓰고, 권한은 맥락을 설명한 뒤 사용자 동작에 맞춰 요청하고, 지원하지 않는 곳의 대체 경로를 둔다.
- 웹 푸시는 iOS에서 홈 화면 웹 앱 + 사용자 동작이 조건이다. 18.4부터 선언적 웹 푸시도 된다.
- 배지·공유 대상·파일 핸들러·링크 캡처는 설치해야 생기고 플랫폼 편차가 크다.
- 공유는 Web Share, 파일은 파일 시스템 접근 API(없으면 input·다운로드), 다른 앱 호출은 표준 스킴.
- 실험 기능은 오리진 트라이얼로 시험하되, 사라져도 앱이 동작하게 만든다.

관련 노트: [[pwa-installation|PWA 설치와 설치 유도]], [[web-app-manifest|웹 앱 매니페스트]], [[service-worker-lifecycle|서비스 워커 등록·스코프·생명주기와 업데이트]], [[pwa-offline-storage|PWA 오프라인 데이터와 저장소 관리]], [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]], [[device-permission-apis|권한 모델과 기기 API]]
