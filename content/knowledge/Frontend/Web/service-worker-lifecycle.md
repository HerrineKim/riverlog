---
title: "서비스 워커 등록·스코프·생명주기와 업데이트"
concept: "Service Worker"
summary: "서비스 워커는 페이지와 서버 사이에서 스코프 안의 요청을 가로채는 별도 스레드의 스크립트다. 등록 → 설치 → 활성화 순서로 생명주기를 밟고, 파일이 한 바이트라도 바뀌면 새 버전이 설치되지만 옛 버전이 모든 창에서 물러날 때까지 대기한다. skipWaiting·clients.claim의 위험, 메모리 상태가 사라지는 수명, 브라우저별 디버깅 도구를 정리한다."
tags: ["frontend", "web", "pwa", "service-worker", "browser"]
source: other
date: "2026-10-21"
sources: ["https://web.dev/learn/pwa/service-workers", "https://web.dev/learn/pwa/update", "https://web.dev/learn/pwa/tools-and-debug", "https://web.dev/learn/pwa/assets-and-data", "https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API", "https://github.com/w3c/ServiceWorker/blob/master/explainer.md", "https://developers.google.com/web/fundamentals/getting-started/primers/service-workers", "https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/lifecycle"]
---

> web.dev의 「[Learn PWA](https://web.dev/learn/pwa)」 강좌의 서비스 워커·업데이트·도구와 디버깅 모듈을 바탕으로 재구성한 노트다. 「[Service workers explained](https://github.com/w3c/ServiceWorker/blob/main/explainer.md)」, 「[The service worker lifecycle](https://web.dev/articles/service-worker-lifecycle)」, MDN 「[Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)」로 설계 배경·업데이트 계기를 보강했다.

## 서비스 워커란

**서비스 워커**(Service Worker)는 PWA와 서버 사이에 끼는 미들웨어다. 자기 스코프 안에서 나가는 요청을 가로채, 오프라인일 때도 다음 셋 중 하나로 응답한다.

| 응답 방식 | 예 |
| --- | --- |
| 캐시에서 꺼내 준다 | Cache Storage에 저장한 응답 |
| 평소처럼 네트워크로 보낸다 | 가로채지 않거나 `fetch()`로 넘긴다 |
| 코드로 응답을 만든다 | `new Response(...)` |

파일만 등록해서는 아무 일도 하지 않는다. 캐시도 응답도 직접 코드로 짠다. 요청 프록시 외에 푸시 알림, 백그라운드 동기화, 결제 처리도 서비스 워커가 맡는다([[pwa-os-integration|PWA 기능과 OS 통합]]).

### 왜 이런 모양인가

오프라인 웹은 Google Gears, Dojo Offline, HTML5 AppCache 같은 **선언적** 방식으로 여러 번 시도됐지만 모두 같은 이유로 실패했다. 매니페스트에 적힌 규칙만으로는 앱마다 다른 요구를 다 표현할 수 없었다. AppCache는 폐기돼 모든 브라우저에서 제거됐다. 서비스 워커는 반대로 **개발자가 코드로 모든 것을 정하는 명령형** 설계를 택했다.

| 공유 워커와 같은 점 | 공유 워커와 다른 점 |
| --- | --- |
| 자기 전역 컨텍스트(보통 별도 스레드)에서 돈다 | 열린 페이지가 하나도 없어도 돌 수 있다 |
| 특정 페이지에 묶이지 않는다 | 이벤트가 올 때만 깨어나고 쉬면 종료된다 |
| DOM에 접근하지 못한다 | 정해진 업데이트 모델이 있다 |
| | HTTPS에서만 등록된다. 요청을 가로채고 응답을 바꾸는 힘이 있어, 중간자가 워커를 바꿔치지 못하게 하려는 것이다 |

**서비스 워커는 선택 사항으로 다룬다.** 지원하지 않는 브라우저가 있고, 지원해도 첫 방문과 활성화 대기 중에는 페이지를 제어하지 않는다. 핵심 기능이 서비스 워커에 기대면 안 된다.

## 등록

```javascript
// 페이지(메인 스레드) 쪽
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

- 첫 방문의 요청은 모두 서버로 바로 간다. 등록과 활성화가 끝난 뒤의 내비게이션부터 서비스 워커가 끼어든다.
- PWA 하나에 서비스 워커는 하나다. 코드는 여러 파일로 나눌 수 있다. `importScripts()`는 모든 브라우저에서, ES 모듈 `import`는 `register('/sw.js', { type: 'module' })`로 등록할 때 쓴다.
- HTTPS가 필요하다. 개발 중에는 `localhost`만 예외다.

## 스코프

**서비스 워커 파일이 놓인 폴더가 스코프다.** `example.com/my-pwa/sw.js`는 `/my-pwa/` 아래 내비게이션만 제어한다.

| 규칙 | 이유 |
| --- | --- |
| 파일은 앱 루트에 가깝게 둔다 | `/js/sw.js`에 두면 `/js/` 아래만 제어한다 |
| CDN에서 불러오지 않는다 | 서비스 워커는 같은 출처의 파일이어야 한다 |
| 스코프 하나에 서비스 워커 하나 | 같은 스코프에 다시 등록하면 기존 등록을 갱신한다 |

스코프는 브라우저 탭과 설치된 PWA 창 모두에 적용된다. 매니페스트의 `scope`는 앱의 내비게이션 범위이고 서비스 워커 스코프와는 별개다([[web-app-manifest|웹 앱 매니페스트]]).

## 생명주기

```text
register() 호출
  └─ 다운로드·파싱 ── 문법 오류나 첫 실행 중 예외 → 실패, 끝
       └─ install 이벤트 (버전마다 한 번) ── 프리캐시를 여기서
            └─ (옛 워커가 클라이언트를 쥐고 있으면) waiting
                 └─ activate 이벤트 ── 옛 캐시 정리를 여기서
                      └─ 다음 내비게이션부터 fetch·push 등 처리
```

```javascript
// sw.js: 별도 스레드에서 실행된다
self.addEventListener('install', (event) => {
  event.waitUntil(/* 프리캐시 Promise */);
});
self.addEventListener('activate', (event) => {
  event.waitUntil(/* 옛 캐시 삭제 Promise */);
});
```

- 설치는 조용히 일어나고 사용자 권한이 필요 없다. PWA 설치를 지원하지 않는 브라우저에서도 서비스 워커는 동작한다. **서비스 워커 설치와 PWA 설치는 다른 일이다.**
- 기본값에서는 활성화된 워커가 자신을 등록한 페이지를 바로 제어하지 않는다. 새로고침하거나 다음 페이지로 이동해야 제어가 시작된다.
- `event.waitUntil()`은 넘긴 Promise가 끝날 때까지 워커를 살려 둔다. 워커는 언제든 멈출 수 있어서 비동기 작업은 반드시 여기에 묶는다.

## 수명: 메모리는 믿지 않는다

서비스 워커는 브라우저가 켜고 끈다. 스코프 안 요청, 푸시 메시지, 주기적 동기화 같은 이벤트가 오면 깨어나고, 몇 초 놀거나 너무 오래 돌면 종료된다. 정확한 시간은 브라우저마다 다르다.

**전역 변수에 둔 상태는 다음 실행 때 사라질 수 있다.** 실행 사이에 남겨야 할 값은 IndexedDB 같은 영속 저장소에 쓴다([[pwa-offline-storage|PWA 오프라인 데이터와 저장소 관리]]).

## 업데이트

### 새 버전을 알아채는 법

브라우저는 서버의 서비스 워커 파일을 지금 쓰는 것과 **바이트 단위로 비교**한다. 한 바이트라도 다르면 새 워커를 설치한다. `importScripts()`로 불러온 파일이 바뀌어도 마찬가지다.

| 하지 말 것 | 결과 |
| --- | --- |
| 파일 이름에 해시를 붙여 바꾼다(`sw.3f9a.js`) | 브라우저는 등록된 옛 URL만 다시 확인하므로 새 버전을 영영 못 받는다. **이름은 고정한다** |
| 파일을 지우거나 이름을 바꿔 제거하려 한다 | 이미 설치된 클라이언트에서는 남는다. `getRegistrations()` 후 `unregister()`로 지운다 |

업데이트 확인이 일어나는 때는 정해져 있다.

| 계기 | 비고 |
| --- | --- |
| 스코프 안 페이지로 내비게이션 | 가장 흔한 경로 |
| `push`·`sync` 같은 기능 이벤트 | 최근 **24시간** 안에 확인한 적이 없을 때만 |
| `register()`를 다른 URL로 호출 | URL은 바꾸지 않는 것이 원칙이라 사실상 쓰지 않는다 |
| 페이지에서 `reg.update()` | 새로고침 없이 오래 켜 두는 앱은 한 시간마다 부르기도 한다 |

- 워커 스크립트를 확인할 때는 기본으로 **HTTP 캐시를 무시**한다(Chrome 68부터, 다른 브라우저도 같다). `importScripts()`로 부른 파일은 캐시 헤더를 따른다. `register(url, { updateViaCache: 'none' | 'imports' | 'all' })`로 바꾼다. 기본값은 `'imports'`다.
- 새 워커는 옛 워커와 **나란히** 떠서 자기 `install`을 받는다. 응답이 404 같은 오류이거나, 파싱·실행 중 오류가 나거나, `install`의 `waitUntil()`이 거부되면 새 워커는 버려지고(`redundant`) 옛 워커가 계속 일한다.

### 대기(waiting)

새 워커는 설치를 마쳐도 **옛 워커가 제어하는 창이 하나라도 남아 있으면 기다린다.** 새로고침으로는 부족하다. 브라우저는 현재 페이지를 내리기 전에 다음 페이지 요청을 보내므로, 새로고침 중에도 옛 워커가 제어하는 클라이언트가 0이 되는 순간이 없다. 그 스코프의 탭과 PWA 창을 모두 닫거나 떠났다가 돌아와야 교체된다. 옛 버전용으로 만들어진 페이지를 새 워커가 갑자기 맡지 않게 하려는 장치다.

### 즉시 교체: skipWaiting과 clients.claim

| API | 위치 | 하는 일 | 위험 |
| --- | --- | --- | --- |
| `self.skipWaiting()` | `install` | 대기를 건너뛰고 바로 활성화 | 열린 페이지의 요청 일부는 옛 워커가, 일부는 새 워커가 처리해 앱이 깨질 수 있다 |
| `self.clients.claim()` | `activate` | 열린 탭·PWA 창의 제어권을 바로 가져온다 | 페이지가 로드된 뒤에 컨트롤러가 바뀐다 |
| `controllerchange` | 페이지의 `navigator.serviceWorker` | 제어하는 워커가 바뀔 때 발생 | 여기서 새로고침하면 무한 새로고침을 막는 가드가 필요하다 |

흔한 안전한 흐름은 **사용자에게 묻고 교체**하는 것이다.

```javascript
// 페이지 쪽: 새 버전이 대기 중인지 감지
const reg = await navigator.serviceWorker.register('/sw.js');
reg.addEventListener('updatefound', () => {
  const worker = reg.installing;
  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      showUpdateBanner(() => worker.postMessage({ type: 'SKIP_WAITING' }));
    }
  });
});

let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (refreshing) return;
  refreshing = true;
  location.reload();
});
```

```javascript
// sw.js: 사용자가 동의했을 때만 대기를 건너뛴다
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
```

### 사용자에게 알리기

| 방법 | 조건 |
| --- | --- |
| 페이지 안 배너·토스트 | 앱이 열려 있을 때 |
| 시스템 알림(Notifications API) | 알림 권한이 필요하다. 앱이 닫혀 있을 때 쓸 수 있는 유일한 방법 |
| 앱 아이콘 배지(`navigator.setAppBadge()`) | 설치된 앱에서 최선 노력(best effort)으로 표시된다 |

## 디버깅

| 브라우저 | 서비스 워커 | 캐시·저장소 | 매니페스트·설치 |
| --- | --- | --- | --- |
| Chromium | 애플리케이션 > 서비스 워커: 상태, 업데이트·등록 해제, 대기 건너뛰기, 테스트 푸시·동기화 | 저장소 용량, 할당량 시뮬레이션, 사이트 데이터 삭제 | 애플리케이션 > 매니페스트: 아이콘·id·설치 가능성 경고 |
| Firefox | 애플리케이션 > 서비스 워커: 등록 확인·해제 | 저장소 패널에서 IndexedDB·Cache Storage | 값과 아이콘 미리보기만 |
| Safari | 개발자용 메뉴 > Service Workers에서 실행 중인 워커에 연결 | 웹 속성 보기에 Cache Storage가 없다 | 디버깅 도구가 없다. 실제로 설치해 본다 |

Chromium의 패널 사용법은 [[devtools-application|DevTools Application 패널]]에 정리했다. 그 밖의 요령:

- **Shift + 새로고침**은 서비스 워커를 거치지 않고 불러온다(명세에 정해진 동작이라 모든 브라우저가 같다). 페이지는 컨트롤러 없이 열린다. 잘못된 응답으로 앱이 안 뜰 때 쓴다.
- Chromium의 **Update on reload** 옵션을 켜면 내비게이션마다 워커를 다시 받아, 바이트가 같아도 새 버전으로 설치하고 대기를 건너뛴다. 개발 중 탭을 닫았다 열 필요가 없어진다.
- 설치된 앱 목록: 데스크톱 Chromium은 `about:apps`, Android Chrome의 WebAPK는 `about:webapks`(업데이트 상태 확인·요청).
- **Android 실기기 테스트는 포트 포워딩**으로 한다. 기기의 `localhost`는 기기 자신이고, 개발 PC의 LAN IP로 접속하면 HTTPS가 아니어서 서비스 워커와 설치 기준이 모두 실패한다. Chrome 원격 디버깅의 포트 포워딩으로 기기 `localhost:포트`를 PC에 잇는다.
- iOS·iPadOS는 macOS의 Xcode Simulator가 실제 Safari와 설치된 웹 앱 엔진을 쓰므로 대표성이 높다. Simulator의 `localhost`는 Mac 자신이다. 원격 검사는 Mac Safari의 개발자용 메뉴로 한다.
- 단순 반응형 시뮬레이터(DevTools 기기 모드 등)는 `display-mode`, 앱 바로 가기, 공유 대상처럼 **설치해야 생기는 기능을 시험하지 못한다.**

## 정리

- 서비스 워커는 스코프 안 요청을 가로채는 프록시다. 기본으로는 아무것도 하지 않고, 없어도 앱이 돌아가야 한다.
- 파일은 루트 가까이, 같은 출처, **고정된 이름**으로 둔다.
- 생명주기는 등록 → 설치 → (대기) → 활성화다. 프리캐시는 `install`, 옛 캐시 정리는 `activate`에서 `waitUntil()`로 한다.
- 전역 변수는 언제든 사라진다. 상태는 IndexedDB에 둔다.
- 새 버전은 옛 버전이 모든 창에서 물러날 때까지 기다린다. `skipWaiting()`은 사용자 동의를 받은 뒤에만 쓴다.

관련 노트: [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]], [[service-worker-caching|서비스 워커 캐싱과 응답 전략]], [[pwa-offline-storage|PWA 오프라인 데이터와 저장소 관리]], [[devtools-application|DevTools Application 패널: 저장소·서비스 워커]], [[web-workers|웹 워커로 메인 스레드 비우기]]
