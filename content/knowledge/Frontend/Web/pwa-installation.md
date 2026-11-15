---
title: "PWA 설치와 설치 유도"
concept: "PWA Installation"
summary: "설치 기준은 브라우저마다 다르다. Chrome은 HTTPS, name·아이콘(192·512px)·start_url·display를 갖춘 매니페스트와 최소한의 사용자 참여를 본다. 데스크톱 Chromium·Android(WebAPK와 바로 가기)·iOS 홈 화면·macOS Safari의 Dock 추가·Firefox의 Windows 작업 표시줄 웹 앱까지 플랫폼별 설치 방식, beforeinstallprompt로 직접 띄우는 설치 버튼, display-mode로 실행 방식을 알아내는 법, 앱 스토어 배포를 정리한다."
tags: ["frontend", "web", "pwa", "mobile", "browser"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/pwa/installation", "https://web.dev/learn/pwa/installation-prompt", "https://web.dev/learn/pwa/detection", "https://web.dev/learn/pwa/progressive-web-apps", "https://web.dev/learn/pwa/getting-started", "https://web.dev/articles/install-criteria", "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/", "https://webkit.org/blog/14445/webkit-features-in-safari-17-0/", "https://webkit.org/blog/17333/webkit-features-in-safari-26-0/", "https://www.firefox.com/en-US/firefox/143.0/releasenotes/", "https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getInstalledRelatedApps"]
---

> web.dev의 「[Learn PWA](https://web.dev/learn/pwa)」 강좌의 설치·설치 프롬프트·감지 모듈을 바탕으로, 설치 기준은 web.dev의 「Installation criteria」, Safari·Firefox 지원은 WebKit 블로그와 Firefox 릴리스 노트로 확인해 재구성한 노트다.

## 설치하면 달라지는 것

설치는 패키지나 실행 파일 없이 브라우저에서 끝난다. 설치된 PWA는 다음을 얻는다.

- 홈 화면·런처·시작 메뉴·Launchpad의 아이콘, OS 앱 검색(Spotlight, Windows 검색) 노출
- 브라우저 UI가 없는 자기 창, 앱 전환기·독·작업 표시줄 표시
- 설치해야 쓸 수 있는 기능: 배지, 앱 바로 가기, 링크 캡처, 공유 대상 등([[pwa-os-integration|PWA 기능과 OS 통합]])

설치는 선택이다. **설치하지 않아도 PWA는 웹사이트로 온전히 동작해야 한다.** 아이콘을 지워도 저장된 데이터가 남을 수 있다는 점도 기억한다.

## 설치 기준

**설치 가능 여부를 정하는 표준 규칙은 없다. 브라우저마다 기준이 있다.** 공통 바탕은 HTTPS와 웹 앱 매니페스트다([[web-app-manifest|웹 앱 매니페스트]]).

Chrome이 설치 안내와 `beforeinstallprompt`를 띄우는 조건:

| 조건 | 내용 |
| --- | --- |
| 설치 전 | 아직 설치하지 않은 앱 |
| 사용자 참여 | 페이지를 한 번 이상 클릭·탭했고(이전 방문 포함), 언젠가 30초 이상 봤다 |
| HTTPS | 보안 연결 |
| 매니페스트 | `name` 또는 `short_name`, 192px와 512px 아이콘, `start_url`, `display`가 `fullscreen`·`standalone`·`minimal-ui`·`window-controls-overlay` 중 하나, `prefer_related_applications`가 없거나 `false` |

- 오프라인 응답을 주는 서비스 워커는 Chrome 설치 기준에서 빠졌다. 그래도 오프라인 대체 화면은 PWA의 기본기로 갖춘다.
- 기준을 못 맞춰도 사용자는 브라우저 메뉴로 직접 설치할 수 있다.
- 검사에 몇 초가 걸릴 수 있어 페이지가 뜨자마자 설치 가능해지지는 않는다.
- Edge의 기준은 비슷하다. **Safari는 설치 조건이 아예 없다.** 어떤 사이트든 홈 화면이나 Dock에 추가할 수 있다.

## 플랫폼별 설치

| 플랫폼 | 브라우저 | 설치 방법 | 지원하는 표시 방식 |
| --- | --- | --- | --- |
| Windows·macOS·Linux·ChromeOS | Chrome, Edge 등 Chromium | 주소창의 설치 아이콘, 앱 내 안내 팝업, 메뉴의 「설치」 | `standalone`, `minimal-ui`, 실험적 값 |
| macOS Sonoma 이상 | Safari 17+ | 파일 > Dock에 추가. 매니페스트 유무와 상관없이 웹 앱으로 열린다 | 자기 창 |
| Windows | Firefox 143+ | 주소창의 작업 표시줄에 추가 버튼. 단순한 창에서 열리고 확장 프로그램이 유지된다. Microsoft Store판 Firefox는 제외 | 자기 창 |
| Android | Chrome, Samsung Internet, Firefox, Edge 등 | 메뉴의 「설치」·「홈 화면에 추가」, 설치 대화상자 | `fullscreen`, `standalone`, `minimal-ui` |
| iOS·iPadOS | Safari(11.3+), 16.4부터 서드 파티 브라우저도 | **공유 메뉴의 「홈 화면에 추가」만.** 설치 프롬프트가 없다 | `standalone`만 |

macOS·iOS Safari와 Firefox 데스크톱은 `beforeinstallprompt`를 지원하지 않는다. Facebook·Instagram·Gmail 같은 앱 안 브라우저는 대부분 PWA를 설치하지 못한다.

### Android: WebAPK, 바로 가기, QuickApp

| 형태 | 누가 만드나 | 특징 |
| --- | --- | --- |
| **WebAPK** | Google Play 서비스가 있는 기기의 Chrome, 삼성 기기의 Samsung Internet. 신뢰할 수 있는 민팅 서버가 APK를 만들어 서명하고 조용히 설치한다 | 런처와 설정 > 앱에 나온다. 배지·앱 바로 가기·링크 캡처를 쓸 수 있고 아이콘·메타데이터가 갱신된다. 두 번 설치되지 않는다 |
| **바로 가기** | 민팅 서버가 없는 Firefox·Edge·Opera·Brave, 비삼성 기기의 Samsung Internet. Chrome도 민팅에 실패하면 이렇게 대체한다 | 브라우저 배지가 붙은 홈 화면 아이콘뿐이다. 런처·설정에 없고, 설치 전용 기능을 못 쓰고, 메타데이터가 갱신되지 않는다. 여러 번 추가할 수 있고 모두 같은 저장소를 쓴다 |
| QuickApp | Huawei·ZTE 등 제조사 플랫폼 | Huawei 브라우저가 PWA를 QuickApp으로 감싼다. 바로 가기와 비슷하다 |

개발자가 APK를 직접 만들거나 서명할 필요는 없다.

### iOS·iPadOS: 홈 화면 웹 앱

- 사용자가 공유 메뉴에서 직접 추가하고, 이름을 고칠 수 있다.
- iOS·iPadOS 26부터 홈 화면에 추가한 사이트는 매니페스트가 없어도 **기본으로 웹 앱으로 열린다.** 사용자가 「웹 앱으로 열기」를 끄면 브라우저 북마크가 된다. 그 전에는 매니페스트(`display`)나 옛 meta 태그가 있어야 웹 앱으로 열렸다.
- 아이콘이 없으면 사이트 첫 글자와 색으로 모노그램을 만든다.
- 같은 앱을 여러 번 설치할 수 있고, **설치본마다 저장소가 따로**다. Safari에서 로그인한 세션이 웹 앱으로 넘어가지 않아 다시 로그인해야 한다.
- 설치된 앱은 브라우저가 아니라 별도 웹 앱 프로세스에서 돈다. 같은 WebKit이지만 동작·저장소가 Safari와 다를 수 있어 실제로 설치해 시험한다.
- 웹 푸시와 배지는 홈 화면 웹 앱에서만 쓸 수 있다([[pwa-os-integration|PWA 기능과 OS 통합]]).

## 설치 버튼 직접 만들기: beforeinstallprompt

Chromium은 설치 기준을 맞추면 `beforeinstallprompt`를 보낸다. 기본 안내를 막고 이벤트를 보관했다가, 사용자가 몰입한 순간에 내 버튼으로 띄운다.

```javascript
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();          // 기본 미니 정보 표시줄·대화상자를 막는다
  deferredPrompt = event;          // 나중에 쓰려고 보관
  installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();         // 이벤트 하나당 한 번만 부를 수 있다
  const { outcome } = await deferredPrompt.userChoice; // 'accepted' | 'dismissed'
  deferredPrompt = null;
  installButton.hidden = true;
});

window.addEventListener('appinstalled', () => {
  installButton.hidden = true;     // 앱 내 설치 홍보를 숨기고 기록
});
```

| 요점 | 내용 |
| --- | --- |
| 설치 확정 | `prompt()`는 브라우저의 설치 대화상자를 띄울 뿐, 확정은 사용자가 한다 |
| 한 번만 | 사용자가 닫으면 이벤트가 다시 올 때까지 기다린다 |
| `appinstalled` | 내 버튼이든 브라우저 UI든 설치를 수락하면 발생한다. Android WebAPK는 실제 설치 완료 전에 발생한다 |
| 이벤트가 오지 않는 경우 | 이미 설치됨(데스크톱·WebAPK), 기준 미달, 키오스크 모드 등 설치 불가 환경, 지원하지 않는 브라우저 |
| 표준 상태 | 매니페스트 사양에서 빠져 인큐베이션 사양에 있는 Chromium 기능이다 |

**좋은 시점**은 사이드 메뉴, 주문 완료 뒤, 가입 직후처럼 사용자가 가치를 느낀 순간이다. 첫 방문 즉시 띄우지 않는다. 메뉴 이름은 언어·브라우저마다 달라(「설치」, 「홈 화면에 추가」) 안내 문구를 현지화한다.

### 이벤트가 없는 플랫폼: 안내를 보여 준다

iOS처럼 직접 추가하는 플랫폼에서는 「공유 → 홈 화면에 추가」 안내를 보여 준다. **브라우저 모드일 때만** 보인다.

```css
.ios-install-hint { display: none; }
@media (display-mode: browser) {
  .ios-install-hint { display: block; }
}
```

iOS 여부를 알아야 하는 이 경우는 UA 판별이 불가피한 드문 예외다. 핵, 즉 임시 방편으로 다루고 브라우저가 새로 나올 때마다 다시 확인한다.

## 실행 방식 감지

```javascript
function getDisplayMode() {
  if (document.referrer.startsWith('android-app://')) return 'twa';
  for (const mode of ['fullscreen', 'standalone', 'minimal-ui', 'window-controls-overlay']) {
    if (matchMedia(`(display-mode: ${mode})`).matches) return mode;
  }
  return 'browser';
}

// 브라우저 탭에서 앱 창으로 옮겨졌는지(데스크톱 설치 직후 등)
matchMedia('(display-mode: standalone)').addEventListener('change', () => {
  console.log('display mode:', getDisplayMode());
});
```

- 실행 경로 분석은 `start_url`에 `?source=pwa` 같은 쿼리를 붙여 한다. 이때 `id`를 명시해 두지 않으면 앱 식별이 흔들린다.
- iOS·iPadOS에는 비표준 `navigator.standalone`도 있다. `undefined`는 iOS가 아님, `false`는 브라우저, `true`는 홈 화면 웹 앱이다.

### 브라우저에서 설치된 앱으로 넘기기

| 플랫폼 | 동작 |
| --- | --- |
| 데스크톱 | 설치하면 현재 탭이 닫히고 앱 창으로 이어진다. 이후에도 주소창 배지·메뉴로 앱에서 열 수 있다 |
| Android | 메뉴의 앱에서 열기로 현재 URL을 앱에서 새로 연다. 설치 직후에는 브라우저에 남는다 |
| iOS·iPadOS | 넘기기가 없다. 설치본마다 세션이 따로다 |

## 스토어 앱과 연결하기

```json
"related_applications": [
  { "platform": "play", "url": "https://play.google.com/store/apps/details?id=com.example.app", "id": "com.example.app" },
  { "platform": "webapp", "url": "https://example.com/app.webmanifest" }
],
"prefer_related_applications": false
```

- `prefer_related_applications: true`면 Android에서 PWA 대신 스토어 앱 설치로 보낸다. Chrome 설치 기준에서도 빠진다.
- `navigator.getInstalledRelatedApps()`는 관련 앱이 설치됐는지 알려 준다. 앱 쪽 메타데이터와 매니페스트가 서로를 가리켜야 한다. 실험적 Chromium API라 감지 후 사용한다. 설치돼 있으면 설치 홍보를 숨긴다.
- Safari는 `related_applications`를 지원하지 않는다. 대신 Smart App Banner meta를 쓴다.

### 앱 스토어에 올리기

PWA는 웹 엔진을 띄우는 얇은 패키지로 스토어에 올릴 수 있다. 자산은 서비스 워커가 캐시한다.

| 스토어 | 방식 |
| --- | --- |
| Google Play (Android·ChromeOS) | Trusted Web Activity(TWA) |
| Apple App Store | WKWebView + App-Bound Domains |
| Microsoft Store | 패키지된 PWA |
| Samsung Galaxy Store | Samsung WebAPK |

Bubblewrap CLI와 PWABuilder가 패키지를 만들어 준다. 기존 네이티브 앱을 스토어에 올린 PWA로 바꾸면 기존 사용자는 업데이트로 넘어오고, 앱 하나만 유지하면 된다. 스토어의 기술·사업 규정은 그대로 적용된다.

## 정리

- 설치 기준은 브라우저마다 다르다. Chrome은 HTTPS, 매니페스트(이름·192/512 아이콘·start_url·display), 사용자 참여를 본다. Safari는 조건이 없다.
- Android는 WebAPK여야 진짜 앱처럼 동작한다. 바로 가기 설치는 기능이 제한된다.
- iOS는 홈 화면에 추가하는 수동 설치뿐이고, 설치본마다 저장소가 따로다.
- `beforeinstallprompt`를 보관했다가 가치가 드러난 순간에 내 버튼으로 띄운다. 이벤트가 없는 곳에서는 `display-mode: browser`일 때만 안내를 보인다.
- 설치는 선택이다. 설치하지 않은 사용자에게도 같은 웹사이트가 온전해야 한다.

관련 노트: [[web-app-manifest|웹 앱 매니페스트]], [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]], [[pwa-app-experience|PWA 앱 경험 설계와 창 관리]], [[pwa-os-integration|PWA 기능과 OS 통합]]
