---
title: "PWA 오프라인 데이터와 저장소 관리"
concept: "Offline Storage"
summary: "URL로 요청하는 자산은 Cache Storage에, 검색·조합할 구조화 데이터는 IndexedDB에 둔다. 저장소 할당량은 출처 단위로 묶이고 StorageManager.estimate()로 확인한다. 브라우저는 압박이 생기거나 오래 쓰지 않으면 데이터를 지우므로 persist()로 영속 저장을 요청하고, 지워진 뒤에도 앱이 온라인에서 다시 뜨게 만든다. 데이터를 뒤에서 최신으로 유지하는 백그라운드 동기화 계열 API도 정리한다."
tags: ["frontend", "web", "pwa", "storage", "browser", "service-worker"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/pwa/offline-data", "https://web.dev/learn/pwa/assets-and-data", "https://web.dev/learn/pwa/update", "https://web.dev/learn/pwa/architecture", "https://web.dev/learn/pwa/complexity"]
---

> web.dev의 「[Learn PWA](https://web.dev/learn/pwa)」 강좌의 자산과 데이터·오프라인 데이터·업데이트·아키텍처 모듈을 바탕으로 재구성한 노트다.

## 오프라인 경험의 단계

| 수준 | 사용자가 보는 것 |
| --- | --- |
| 최소 | 브라우저 오류 대신 「연결을 확인해 달라」는 브랜드 화면 |
| 부분 | 연결이 필요 없는 기능만 동작. 실시간 연결이 필요한 곳은 UI와 안내 메시지 |
| 이상적 | 전부 오프라인으로 동작하고, 연결이 돌아오면 바뀐 내용을 서버와 동기화 |

메모 앱이라면 오프라인에서 쓰고 나중에 동기화하는 식이다. 설치형 네이티브 앱은 패키지에 모든 자산이 들어 있지만, PWA는 필수만 먼저 받고 나머지는 필요할 때 받는다. 자산 캐싱은 PWA 설치와 별개라 브라우저 탭에서도 동작한다.

## 저장소 고르기

| 저장소 | 담는 것 | 특징 |
| --- | --- | --- |
| **Cache Storage** | URL로 요청하는 모든 것: HTML, CSS, JS, 이미지, 영상, 오디오, API 응답 | 요청·응답 쌍. 비동기. 창·워커·서비스 워커에서 쓴다([[service-worker-caching\|서비스 워커 캐싱과 응답 전략]]) |
| **IndexedDB** | 검색·조합해야 하는 구조화 데이터, URL에 묶이지 않는 사용자 데이터, Blob | NoSQL 객체 저장소. 비동기·트랜잭션. 전문 검색용은 아니다 |
| Web Storage | 작은 문자열 설정값 | **동기 API**라 메인 스레드를 막고, **서비스 워커에서 못 쓴다**([[web-storage\|Web Storage]]) |
| HTTP 캐시 | 브라우저가 알아서 | 개발자 통제가 약하다([[http-cache\|HTTP 캐시]]) |
| 파일 시스템 접근 API | 사용자가 허락한 로컬 파일 | 출처 할당량에 들어가지 않는다([[pwa-os-integration\|PWA 기능과 OS 통합]]) |

WebSQL과 AppCache는 폐기됐다. 쓰지 않는다.

## IndexedDB: idb로 쓰기

원본 API는 이벤트 콜백 기반이라 번거롭다. Promise로 감싼 작은 래퍼 `idb`가 흔히 쓰인다.

```javascript
import { openDB } from 'idb';

// 버전을 올릴 때마다 upgrade가 실행된다. 저장소·인덱스는 여기서만 만든다
const db = await openDB('cookbook', 2, {
  upgrade(db, oldVersion, newVersion, transaction) {
    switch (oldVersion) {   // break 없이 이어서 단계별로 마이그레이션
      case 0:
        db.createObjectStore('recipes', { keyPath: 'id', autoIncrement: true });
      case 1:
        transaction.objectStore('recipes').createIndex('type', 'type');
    }
  },
});

// 쓰기: 트랜잭션 안의 작업은 함께 성공하거나 함께 실패한다
const tx = db.transaction('recipes', 'readwrite');
await tx.store.add({ name: '초코칩 쿠키', type: 'dessert', minutes: 25 });
await tx.done;

// 읽기: 키로, 또는 인덱스로
const one = await db.get('recipes', 1);
const desserts = await db.getAllFromIndex('recipes', 'type', 'dessert');
```

| 요점 | 내용 |
| --- | --- |
| 스키마 변경 | DB 버전을 올리고 `upgrade`에서만 저장소·인덱스를 만든다 |
| `add` vs `put` | `add`는 같은 키가 있으면 실패, `put`은 덮어쓴다 |
| 저장 가능한 값 | 구조화된 복제(structured clone)가 되는 값. 함수·DOM 노드는 안 된다 |
| 트랜잭션 | 여러 탭이 동시에 써도 일관성을 지킨다 |

구조화된 복제는 워커 메시지에도 쓰이는 형식이다. 데이터 처리 함수의 입출력을 이 형식에 맞춰 두면 그 일을 워커로 옮기기 쉽다([[web-workers|웹 워커로 메인 스레드 비우기]]). 여러 창이 같은 DB를 쓰면 Shared Worker 하나가 IndexedDB 접근을 맡고 결과를 창들에 알리는 구성도 된다.

## 할당량: 출처 단위로 나눠 쓴다

**저장소는 PWA가 아니라 출처(origin)에 묶인다.** 프로토콜·호스트·포트가 모두 같아야 같은 출처다.

| 출처마다 공유되는 것 |
| --- |
| 저장소 할당량과 데이터: IndexedDB, Cache Storage, Web Storage, 쿠키, 서비스 워커 파일 |
| 서비스 워커 등록 |
| 권한: 푸시, 위치, 센서 등 |
| 웹 푸시 구독 |

- 한 출처에 PWA를 여럿 두면 할당량과 캐시 이름을 나눠 쓰게 된다. 권장하지 않는다.
- 반대로 `admin.example.com`처럼 서브도메인으로 쪼개면 저장소·서비스 워커·권한이 따로 놀고, 설치된 PWA에서 그쪽으로 가면 앱 안 브라우저가 뜬다. 한 앱은 한 출처에 둔다.

```javascript
if (navigator.storage?.estimate) {
  const { usage, quota } = await navigator.storage.estimate();
  console.log(`${((usage / quota) * 100).toFixed(1)}% 사용, ${quota - usage}바이트 남음`);
}
```

- `navigator.storage`는 `StorageManager`다. `localStorage`의 `Storage` 인터페이스와 헷갈리기 쉽다.
- 할당량은 브라우저마다 다르고 보통 기기 디스크 크기에 비례해 넉넉하다. 정확한 값은 `estimate()`로 확인한다. 불투명 응답은 실제보다 크게 계산된다.
- Chromium DevTools의 애플리케이션 > 저장소에서 사용량 분해와 할당량 시뮬레이션을 볼 수 있다. Firefox·Safari에는 요약 화면이 없다.

## 삭제(eviction)와 영속 저장

**브라우저 저장소는 기본적으로 "최선 노력(best effort)"이다.** 다음 경우 지워질 수 있다.

| 누가 | 언제 |
| --- | --- |
| 브라우저 | 저장 공간 압박이 생길 때, 또는 브라우저 탭에서 쓰던 사이트를 몇 주 방문하지 않았을 때 |
| 사용자 | 브라우저 설정에서 사이트 데이터를 지울 때. 영속 저장이어도 막지 못한다 |

일부 플랫폼은 설치된 PWA의 데이터를 자동으로 지우지 않는다. 그래도 지워질 수 있다고 가정한다. **지워진 뒤에도 설치된 PWA는 온라인에서 다시 떠야 한다.** 서비스 워커 생명주기가 처음부터 다시 돌고 네트워크에서 자산을 받는다.

```javascript
if (navigator.storage?.persist) {
  const already = await navigator.storage.persisted();
  const granted = already || (await navigator.storage.persist());
  console.log(`영속 저장: ${granted}`);
}
```

| 브라우저 | `persist()` 처리 |
| --- | --- |
| Firefox | 사용자에게 권한을 묻는다 |
| Chromium | 묻지 않고 사이트의 중요도(설치 여부, 방문 빈도, 알림 권한 등)로 판단한다 |

영속 저장이 허락되면 서비스 워커 등록, IndexedDB, Cache Storage를 브라우저가 자동으로 지우지 않는다. 오프라인 편집기처럼 사용자 데이터가 기기에만 있는 앱에서 요청한다.

## 데이터를 최신으로 유지하기

앱이 열려 있을 때는 Fetch, WebSocket, WebRTC로 IndexedDB를 갱신한다. 닫혀 있을 때는 서비스 워커가 깨어나는 API를 쓴다.

| API | 하는 일 | 지원 |
| --- | --- | --- |
| 백그라운드 동기화(Background Sync) | 오프라인에서 실패한 요청을 연결이 돌아오면 서비스 워커가 재시도 | Chromium 계열 |
| 주기적 백그라운드 동기화 | 앱이 닫혀 있어도 주기적으로 콘텐츠를 받는다. 설치·사용 빈도로 허용 여부가 정해진다 | Chromium 계열, 설치된 앱 |
| 백그라운드 가져오기(Background Fetch) | 큰 파일을 앱을 닫은 뒤에도 받는다. 진행 상황이 시스템 UI에 보인다 | Chromium 계열 |
| 웹 푸시 | 서버가 서비스 워커를 깨워 작은 페이로드를 전달하고 알림을 띄운다 | 주요 브라우저([[pwa-os-integration\|PWA 기능과 OS 통합]]) |

백그라운드 동기화가 없는 브라우저에서는 실패한 요청을 IndexedDB에 큐로 쌓아 두고, 다음 실행이나 `online` 이벤트 때 재시도하는 식으로 대체한다.

Chromium Android에는 오프라인으로 읽을 수 있는 콘텐츠를 브라우저의 다운로드 목록에 노출하는 실험적 콘텐츠 색인 API(Content Indexing)도 있다.

## 정리

- URL로 부르는 건 Cache Storage, 찾고 조합하는 데이터는 IndexedDB. localStorage는 서비스 워커에서 못 쓴다.
- IndexedDB 스키마는 버전을 올리고 `upgrade`에서만 바꾼다. 쓰기는 트랜잭션으로 묶는다.
- 저장소·권한·서비스 워커는 출처 단위다. 한 앱은 한 출처에.
- 데이터는 지워질 수 있다. 중요하면 `persist()`를 요청하고, 지워져도 온라인에서 복구되게 만든다.
- 닫힌 앱의 데이터 갱신은 백그라운드 동기화 계열이 맡지만 Chromium 전용이라 대체 경로를 함께 둔다.

관련 노트: [[service-worker-caching|서비스 워커 캐싱과 응답 전략]], [[service-worker-lifecycle|서비스 워커 등록·스코프·생명주기와 업데이트]], [[web-storage|Web Storage: localStorage와 sessionStorage]], [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]], [[web-workers|웹 워커로 메인 스레드 비우기]], [[indexeddb|IndexedDB]]
