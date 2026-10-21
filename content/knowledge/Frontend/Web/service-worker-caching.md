---
title: "서비스 워커 캐싱과 응답 전략"
concept: "Caching Strategy"
summary: "Cache Storage API로 요청·응답 쌍을 저장하고, fetch 이벤트의 respondWith()로 캐시 우선·네트워크 우선·stale-while-revalidate·네트워크 전용·캐시 전용 중 하나를 URL별로 골라 응답한다. 무엇을 언제 프리캐시할지, 불투명 응답과 addAll의 원자성 함정, 오프라인 대체 페이지, Workbox로 줄이는 코드, 페이지를 조각별로 캐시하는 서비스 워커 인클루드와 스트리밍까지 정리한다."
tags: ["frontend", "web", "pwa", "service-worker", "cache", "performance"]
source: other
date: "2026-10-21"
sources: ["https://web.dev/learn/pwa/caching", "https://web.dev/learn/pwa/serving", "https://web.dev/learn/pwa/workbox", "https://web.dev/learn/pwa/assets-and-data", "https://web.dev/learn/pwa/architecture", "https://web.dev/learn/pwa/update", "https://developer.mozilla.org/en-US/docs/Web/API/URLPattern", "https://jakearchibald.com/2014/offline-cookbook/", "https://developers.google.com/web/updates/2015/11/app-shell"]
---

> web.dev의 「[Learn PWA](https://web.dev/learn/pwa)」 강좌의 캐싱·서빙·Workbox·아키텍처 모듈을 바탕으로 재구성한 노트다. 「[The offline cookbook](https://jakearchibald.com/2014/offline-cookbook/)」으로 캐시 시점·응답 패턴을, 「[Instant Loading Web Apps with an Application Shell Architecture](https://developer.chrome.com/blog/app-shell)」로 앱 셸을 보강했다.

## 두 단계: 저장하고, 응답한다

```text
[저장] install 또는 런타임에 caches.open(name) → cache.add/addAll/put
[응답] fetch 이벤트 → event.respondWith( 캐시 / 네트워크 / 만든 응답 )
```

서비스 워커 자체의 등록·생명주기는 [[service-worker-lifecycle|서비스 워커 등록·스코프·생명주기와 업데이트]]에, 미디어를 중요도별로 나눠 캐시하고 캐시 크기를 제한하는 방법은 [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]]에 있다. HTTP 캐시와의 관계는 [[http-cache|HTTP 캐시]]를 본다.

## Cache Storage API

**Cache Storage는 요청과 응답 쌍을, 서버가 보낸 헤더와 본문 그대로 저장한다.** 요청 URL이나 `Request` 객체가 키다. 창(메인 스레드), 서비스 워커, 다른 워커 모두에서 `caches`로 접근하고, 대부분 HTTPS가 필요하다. 모든 주요 브라우저가 지원한다.

| 메서드 | 하는 일 | 주의 |
| --- | --- | --- |
| `caches.open(name)` | 이름 붙은 캐시를 열거나 만든다 | 캐시 이름은 출처(origin) 단위다. 한 출처에 앱이 여럿이면 접두어를 붙인다 |
| `cache.add(url)` | 받아서 하나 저장 | 2xx가 아니면 실패한다 |
| `cache.addAll(urls)` | 여러 개를 **한 트랜잭션으로** 저장 | 하나라도 실패하면 전부 저장하지 않는다 |
| `cache.put(req, res)` | 직접 만든·받은 응답을 저장·갱신 | 응답 본문은 한 번만 읽힌다. 저장과 반환을 함께 하려면 `res.clone()` |
| `cache.delete(req)` | 항목 삭제 | |
| `caches.match(req)` / `cache.match(req)` | 전체 캐시 / 한 캐시에서 찾기 | 없으면 `undefined`로 resolve한다. reject가 아니다 |
| `caches.keys()` / `caches.delete(name)` | 캐시 이름 목록 / 캐시 통째 삭제 | 버전 교체 때 옛 캐시 정리에 쓴다 |

**Cache Storage는 서버 쪽 변경을 알아채지도, 오래된 항목을 지우지도 않는다.** 둘 다 코드가 책임진다. URL도 하나하나 명시해야 한다. API가 필요한 파일을 추측해 주지 않는다.

## 무엇을 언제 캐시하나

| 방식 | 대상 | 시점 |
| --- | --- | --- |
| **프리캐시(precache)** | UI를 그리는 최소한: `start_url`의 HTML, 핵심 CSS·JS, UI 이미지, 웹 폰트, 첫 화면 데이터, 오프라인 대체 페이지 | 서비스 워커 `install` |
| **런타임 캐시** | 앱 버전과 따로 바뀌는 콘텐츠·이미지 | 요청이 들어올 때 |
| **API 데이터** | 응답 자체를 Cache Storage에, 또는 데이터를 IndexedDB에 | 요청 때 또는 백그라운드 |

다른 시점도 된다. 첫 페이지 로드 직후, 사용자가 특정 섹션에 들어갈 때, 네트워크가 한가할 때다. **오프라인에 쓸 자산은 미리 캐시해 둬야 한다.** 오프라인이 된 뒤에는 받을 수 없다.

- 설치 때 전부 캐시하지 않는다. 대역폭과 저장 공간을 낭비하고 낡은 파일을 내보내게 된다.
- 항상 최신이어야 하는 리소스는 캐시하지 않는 편이 낫다.
- 모든 PWA가 완전한 오프라인을 지원할 필요는 없다(클라우드 게임, 실시간 시세 등). 대신 **브라우저 기본 오류 페이지는 절대 보이지 않게** 오프라인 안내 화면을 준다. Google Play에 올린 PWA가 HTTP 오류 페이지를 보이면 불이익을 받을 수 있다.

```javascript
// install 단계 프리캐시
const PRECACHE = 'app-v3';
const urls = ['/', '/app.js', '/styles.css', '/logo.svg', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PRECACHE).then((cache) => cache.addAll(urls)));
});

// activate 단계에서 현재 버전이 아닌 캐시를 지운다
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== PRECACHE).map((n) => caches.delete(n)))
    )
  );
});
```

새 서비스 워커를 설치해도 **옛 캐시는 저절로 지워지지 않는다.** 캐시 이름에 버전을 붙이고 `activate`에서 정리한다.

### 캐시에 넣는 시점: 세분한 패턴

| 시점 | 방법 | 어울리는 대상 |
| --- | --- | --- |
| install, **의존성으로** | `event.waitUntil(cache.addAll(…))`. 하나라도 실패하면 설치가 실패한다 | 그 버전의 정적 자산(CSS·JS·폰트·템플릿) |
| install, **의존성 아님** | `addAll()`을 `await`하지 않는다. 실패해도 설치는 끝난다 | 당장 필요 없는 큰 자산(게임의 뒷 레벨). 워커가 도중에 종료될 수 있어 없으면 다시 받는 코드가 필요하다 |
| activate | 옛 캐시 삭제, 데이터 마이그레이션 | 정리 |
| 사용자 동작 | 페이지에서 직접 `caches.open()`·`cache.add()` (「오프라인으로 저장」 버튼) | 사이트 전체를 오프라인화할 수 없을 때 사용자가 고른 글·영상 |
| 네트워크 응답 | fetch 핸들러에서 받은 응답을 `cache.put(request, response.clone())` | 받은편지함·기사처럼 자주 바뀌는 것 |
| 푸시 메시지 | `push` 이벤트에서 **알림을 띄우기 전에** 관련 데이터를 캐시 | 알림을 누를 때 오프라인일 수 있으므로 채팅·메일 본문 |
| 백그라운드 동기화 | `sync`(한 번)·`periodicsync`(주기) 이벤트에서 갱신 | 타임라인·뉴스처럼 급하지 않은 갱신. **Chromium 전용**이고 주기 동기화는 설치된 PWA만 |

Cache Storage도 출처의 공용 할당량을 나눠 쓰고, 저장 공간이 부족하면 지워질 수 있다. 지켜야 할 데이터는 `navigator.storage.persist()`로 영속 저장을 요청한다([[pwa-offline-storage|PWA 오프라인 데이터와 저장소 관리]]).

### 다른 출처의 응답: 불투명 응답

CDN처럼 다른 출처에서 CORS 없이 받은 응답은 **불투명 응답(opaque response)** 으로 저장된다.

- 본문과 헤더를 읽을 수 없고, 상태 코드도 알 수 없어 실패 응답이 캐시될 수 있다.
- 실제 크기를 드러내지 않으려고 브라우저가 항목마다 큰 고정 크기로 할당량을 계산한다. 작은 파일 몇 개로 할당량이 빠르게 찬다.
- `addAll()`에 서드 파티 URL을 섞으면, 그 CDN 하나가 2xx를 못 줄 때 같은 호출의 성공한 다운로드까지 전부 버려진다.

CORS를 지원하는 CDN이면 `crossorigin` 요청으로 받아 일반 응답으로 저장한다([[cors|CORS]]).

## 응답하기: fetch 이벤트

```javascript
self.addEventListener('fetch', (event) => {
  // event.request.url, method, mode, destination, headers를 보고 판단
  event.respondWith(responseOrPromise);
});
```

| 규칙 | 내용 |
| --- | --- |
| 범위 | 스코프 안 페이지가 보내는 모든 요청. 같은 출처와 다른 출처, 내비게이션과 자산 모두 |
| `respondWith()` 호출 시점 | **핸들러 안에서 동기적으로** 불러야 한다. `await` 뒤나 콜백 안에서 부르면 늦다. 비동기 작업은 넘기는 Promise 안에서 한다 |
| 무시하기 | `respondWith()`를 부르지 않으면 요청은 평소처럼 네트워크로 간다 |
| 핸들러 여러 개 | 등록 순서대로 실행되고, 처음 `respondWith()`를 부른 핸들러가 응답한다 |
| 응답 만들기 | `new Response(body, { status, headers })` |

**잘못된 응답 하나가 앱의 HTML 문서 로드를 막을 수 있다.** 내비게이션 요청 처리는 특히 조심하고, 막히면 Shift + 새로고침으로 서비스 워커를 우회해 고친다.

## 다섯 가지 캐시 전략

| 전략 | 순서 | 우선하는 것 | 어울리는 대상 |
| --- | --- | --- | --- |
| **캐시 우선(Cache first)** | 캐시 → 없으면 네트워크(받은 것을 캐시에 넣어도 된다) | 속도 | 해시가 붙은 CSS·JS, 폰트, 이미지 |
| **네트워크 우선(Network first)** | 네트워크 → 실패하면 캐시 | 신선도 | HTML 문서, 자주 바뀌는 API |
| **Stale-while-revalidate** | 캐시로 즉시 응답 + 뒤에서 네트워크로 받아 캐시 갱신 | 속도와 결국의 신선도 | 아바타, 부수 콘텐츠, 자주 바뀌는 CSS·JS |
| **네트워크 전용(Network only)** | 네트워크만, 실패하면 오류 | 정확성 | 결제, 실시간 데이터, 분석 요청 |
| **캐시 전용(Cache only)** | 캐시만, 네트워크를 건드리지 않음 | 확실성 | install에서 프리캐시한 앱 셸 |

```javascript
// 캐시 우선
event.respondWith(
  caches.match(event.request).then((cached) => cached || fetch(event.request))
);

// 네트워크 우선
event.respondWith(
  fetch(event.request).catch(() => caches.match(event.request))
);

// stale-while-revalidate
event.respondWith(
  caches.open('runtime').then(async (cache) => {
    const cached = await cache.match(event.request);
    const network = fetch(event.request).then((res) => {
      if (res.ok) cache.put(event.request, res.clone()); // 본문은 한 번만 읽히므로 clone
      return res;
    });
    return cached || network;
  })
);
```

- Stale-while-revalidate는 캐시가 맞아도 **항상 네트워크 요청을 보낸다.** 갱신된 내용은 다음 요청에서야 보인다.
- 전략은 URL 패턴별로 다르게 고른다. `event.request.url`을 정규식으로 보거나 `URLPattern`을 쓴다. `URLPattern`은 2025년 9월부터 Baseline이다.
- 직접 만든 전략도 된다. 예: 네트워크 우선이되 3초가 지나면 캐시로 응답하기, 캐시와 네트워크 응답을 합치기.
- 업데이트 확인 때문에 **렌더링을 막지 않는다.** Core Web Vitals를 해친다([[web-vitals|웹 성능 지표와 Lighthouse]]).

### 다섯 가지 밖의 패턴

| 패턴 | 방식 | 어울리는 경우 |
| --- | --- | --- |
| 캐시·네트워크 경주 | `Promise.any([caches.match(req), fetch(req)])`로 먼저 성공한 쪽을 쓴다 | 디스크가 느린 기기의 작은 자산. 이미 가진 것을 또 받으니 데이터는 낭비된다 |
| 캐시 다음 네트워크(cache then network) | **페이지가** 캐시와 네트워크에 동시에 요청해 캐시로 먼저 그리고, 네트워크 응답이 오면 다시 그린다 | 타임라인·순위표. 네트워크 우선의 약점(느린 연결에서 실패할 때까지 기다림)을 피한다. 새 내용은 사용자가 읽던 것을 밀어내지 않게 위에 끼우고 스크롤 위치를 맞춘다 |
| 범용 대체 | 캐시·네트워크가 모두 실패하면 미리 캐시한 대체물 | 아바타 자리 표시 이미지, 실패한 POST, 「오프라인에서는 쓸 수 없음」 페이지 |
| 서비스 워커 템플릿 | 캐시한 HTML 템플릿 + JSON 데이터를 워커에서 합쳐 `new Response(html, { headers: { 'Content-Type': 'text/html' } })` | 「~로 로그인됨」처럼 사용자별 상태가 섞여 서버 HTML을 그대로 캐시할 수 없는 페이지 |

`Promise.race()`는 먼저 **거부된** Promise에도 끝나 버리므로 경주에는 `Promise.any()`(ES2021)를 쓴다.

## 오프라인 대체 페이지

```javascript
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match('/offline.html'))
  );
});
```

문서 요청(`mode: 'navigate'` 또는 `destination: 'document'`)이 실패하면 프리캐시한 `/offline.html`을, 이미지가 실패하면 대체 이미지를 준다. 나머지는 `Response.error()`로 둔다.

## Workbox

**Workbox는 서비스 워커의 라우팅·캐시 전략·프리캐시·만료를 감싼 Google의 라이브러리 묶음이다.** 서비스 워커 라이브러리 중 가장 많이 쓰이고, 여러 프레임워크의 PWA 플러그인이 내부에서 쓴다.

| 모듈 | 하는 일 |
| --- | --- |
| `workbox-routing` | `fetch` 핸들러를 대신 구현한다. 조건별로 전략에 연결하는 `registerRoute()`, 실패 시 대체 응답 `setCatchHandler()` |
| `workbox-strategies` | `CacheFirst`, `NetworkFirst`, `StaleWhileRevalidate`, `NetworkOnly`, `CacheOnly` |
| `workbox-precaching` | 빌드 때 만든 파일 목록(리비전 포함)을 install에서 캐시하고, 바뀐 파일만 갱신한다 |
| `workbox-expiration` | 개수·기간으로 캐시 항목을 지운다 |
| `workbox-cacheable-response` | 상태 코드로 캐시할 응답을 거른다(불투명 응답 대비) |
| `workbox-recipes` | 네트워크 우선 페이지, 오프라인 대체 같은 흔한 조합을 한 줄로 |
| `workbox-window` | 페이지 쪽 등록, 업데이트 감지, 서비스 워커와 메시지 주고받기 |
| `workbox-streams` | 여러 출처의 응답을 하나의 스트림으로 잇는다 |

```javascript
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

registerRoute(({ request }) => request.mode === 'navigate',
  new NetworkFirst({ cacheName: 'pages' }));

registerRoute(({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  }));
```

| 쓰는 방법 | 특징 |
| --- | --- |
| `workbox-cli` (`npx workbox-cli wizard`) | 서비스 워커 생성, 기존 파일에 프리캐시 목록 주입 |
| `workbox-build`, 번들러 플러그인 | 자체 빌드 과정에 통합 |
| `workbox-sw` | 빌드 없이 CDN에서 불러온다 |

npm 모듈을 `import`로 쓰면 배포 전에 번들링한다. 모듈 서비스 워커를 지원하지 않는 브라우저도 있어서다.

### 자산 업데이트 방식

| 방식 | 내용 |
| --- | --- |
| 전체 교체 | 하나라도 바뀌면 캐시 전체를 다시 받는다. 단순하지만 무겁다 |
| 바뀐 것만 교체 | 해시·리비전으로 바뀐 파일만 갱신한다. `workbox-precaching`이 하는 일 |
| 개별 갱신 | 요청 때마다 각자 갱신한다. stale-while-revalidate |

새 자산은 보통 **다음 실행 때** 쓴다. 지금 세션에서 바로 바꾸는 라이브 업데이트는 복잡하다.

## 페이지를 조각으로 캐시하기

### 서비스 워커 인클루드

**페이지를 바뀌는 주기가 다른 조각으로 나누고, 조각마다 다른 전략으로 캐시한 뒤 서비스 워커에서 다시 조립한다.** 캐시가 작아지고 머리글·바닥글이 페이지마다 같은 버전으로 보인다.

| 조각 | 전략 |
| --- | --- |
| 전체 레이아웃 틀 | 프리캐시 |
| 머리글·바닥글 | 본문과 따로 프리캐시 |
| CSS·JS | stale-while-revalidate, 서비스 워커 설치 때 갱신 |
| 본문 | 갱신 빈도에 따라 네트워크 우선 또는 stale-while-revalidate |
| 본문 이미지 | 캐시 우선 |
| 사이드바 | stale-while-revalidate |

### 앱 셸과 스트리밍

SPA의 **앱 셸(app shell)** 모델은 껍데기 HTML을 캐시해 즉시 보여 주고 내용은 클라이언트가 채운다. 앱 셸은 UI를 띄우는 **최소한의 HTML·CSS·JS**로, 네이티브 앱이라면 스토어에 올릴 번들에 해당한다. 툴바·카드 틀 같은 의미 있는 화면을 네트워크 없이 그리고 내용은 점진적으로 채운다.

- 첫 방문은 서버가 내용까지 렌더링해 보내고, 그 페이지가 서비스 워커를 등록해 셸과 의존 자산을 캐시한다. 다음 방문부터는 셸을 캐시에서 띄우고 **데이터만** 요청한다.
- 셸의 핵심 CSS는 `<head>`에 인라인하고, 뷰별 JS는 비동기로 받는다. 파일 이름에 해시를 넣어 긴 HTTP 캐시와 버전 관리를 함께 한다.
- 서비스 워커를 쓰지 못하는 환경에는 서버 렌더링 페이지를 그대로 준다(점진적 향상).
- 동적인 앱일수록 이득이 크다. 작고 정적인 사이트는 셸 없이 install에서 사이트 전체를 캐시하면 된다.
- 과거에는 sw-precache·sw-toolbox로 셸을 캐시했고, 지금은 그 후속인 Workbox를 쓴다. 서비스 워커에서 Streams API로 **캐시한 셸 + 네트워크 본문을 하나의 응답 스트림으로 이어 보내면**, 브라우저가 첫 조각부터 점진적으로 그려 MPA처럼 빠르게 뜬다. Streams API는 저수준이라 `workbox-streams`를 쓰는 편이 쉽다. 서버 쪽 스트리밍은 [[streaming-ssr|스트리밍 SSR]]을 본다.

### SPA와 MPA

둘 다 PWA가 될 수 있고 섞어도 된다(상품 목록은 MPA, 결제 흐름은 SPA). 서비스 워커가 CSS·JS를 캐시하면 MPA의 약점인 페이지마다 다시 받는 비용이 줄어든다. 렌더링 방식 비교는 [[spa-csr-ssr|SPA와 CSR·SSR]]에 있다.

## 정리

- Cache Storage는 요청·응답 쌍 저장소다. 갱신과 삭제는 전부 코드가 한다.
- 프리캐시는 UI를 그리는 최소한과 오프라인 대체 페이지만. 나머지는 런타임 캐시로.
- `respondWith()`는 동기적으로 부르고, 응답을 저장하면서 돌려줄 때는 `clone()`한다.
- URL 종류마다 전략을 고른다: 문서는 네트워크 우선, 해시 붙은 정적 자산은 캐시 우선, 부수 콘텐츠는 stale-while-revalidate.
- 서드 파티 불투명 응답과 `addAll()`의 원자성을 조심한다. 코드가 길어지면 Workbox로 옮긴다.

관련 노트: [[service-worker-lifecycle|서비스 워커 등록·스코프·생명주기와 업데이트]], [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]], [[pwa-offline-storage|PWA 오프라인 데이터와 저장소 관리]], [[http-cache|HTTP 캐시]], [[resource-hints|리소스 힌트와 미리 불러오기]], [[streaming-ssr|스트리밍 SSR]]
