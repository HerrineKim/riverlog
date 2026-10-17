---
title: "IndexedDB"
concept: "IndexedDB"
summary: "브라우저에 내장된 출처별 트랜잭션 키-값 데이터베이스의 API. 버전으로 스키마를 바꾸는 upgradeneeded, 객체 저장소·키·인덱스·키 범위·커서로 저장하고 찾는 법, 자동 커밋되는 트랜잭션의 함정과 오류 처리, 다른 탭과의 버전 충돌, 그리고 네이티브 개념이 idb 래퍼에서 어떻게 보이는지 정리한다."
tags: ["browser", "storage", "database", "javascript", "frontend", "pwa"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/indexeddb", "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API", "https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction/commit", "https://github.com/jakearchibald/idb"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「IndexedDB」 글을 바탕으로, 트랜잭션은 MDN, 래퍼 API는 idb 저장소 문서로 확인해 재구성한 노트다.

## IndexedDB란

**IndexedDB**는 브라우저에 들어 있는 **출처(origin)별 키-값 데이터베이스**다. [[web-storage|localStorage]]가 문자열만 담는 작은 동기 저장소라면, IndexedDB는 다음을 더 한다.

| | localStorage | IndexedDB |
| --- | --- | --- |
| 값 | 문자열만 | 구조화된 복제가 되는 거의 모든 값(객체, 배열, `Date`, `Map`·`Set`, `Blob`·`File`, `ArrayBuffer`) |
| API | 동기 — 메인 스레드를 막는다 | 비동기 — 요청을 보내고 이벤트로 결과를 받는다 |
| 검색 | 키 하나로만 | 키 범위 질의, 다른 필드의 인덱스, 커서 순회 |
| 신뢰성 | 없음 | 트랜잭션: 묶은 작업이 모두 성공하거나 모두 취소된다 |
| 용량 | 출처당 약 5MiB | 디스크 크기에 비례하는 큰 할당량 |
| 워커 | 쓸 수 없다 | 웹 워커·서비스 워커에서도 쓴다 |

서버와 매번 통신하는 평범한 앱에는 과하다. **오프라인 앱**, 서비스 워커와 함께 쓰는 [[pwa-service-worker|PWA]], 큰 데이터(메일함, 문서, 지도 타일, 업로드 대기 파일)를 브라우저에 쌓아 두는 앱에 쓴다. 다른 출처의 DB는 읽을 수 없다.

## 구조

```text
출처(https://app.com)
 └─ 데이터베이스 "mail" (version 3)
     ├─ 객체 저장소 "messages"  keyPath: "id"      ← 테이블에 해당
     │    ├─ 인덱스 "by_date"   keyPath: "date"
     │    └─ 인덱스 "by_label"  keyPath: "labels", multiEntry
     └─ 객체 저장소 "drafts"    autoIncrement
```

- **객체 저장소(object store)**: 값을 담는 곳. 이름과 달리 원시값도 담는다. 값마다 고유한 **키**가 있고, 저장소는 늘 **키 순으로 정렬**되어 있다.
- **키**: 숫자, 문자열, `Date`, 바이너리, 그리고 이것들의 배열. `keyPath`(값의 속성을 키로), `autoIncrement`(자동 증가 번호), 또는 넣을 때 직접 준다.
- **인덱스**: 다른 필드로 찾기 위한 보조 구조. 필드 값마다 해당 객체의 키 목록을 들고 있고 저장소가 바뀌면 자동으로 갱신된다.
- 값은 [[variables-and-types|구조화된 복제(structuredClone)]]로 저장한다. 함수, DOM 노드, 순환을 못 따라가는 것은 저장되지 않고, 클래스 인스턴스는 **프로토타입 없이 평범한 객체로** 돌아온다.

## 열기와 스키마 버전

서버 DB와 달리 개발자가 사용자 기기의 DB에 직접 들어가 마이그레이션할 수 없다. 그래서 IndexedDB는 **버전 번호**를 내장한다. 코드가 요구하는 버전이 기기에 있는 버전보다 높으면 `upgradeneeded`가 발생하고, 그 안에서만 스키마를 바꿀 수 있다.

```javascript
const req = indexedDB.open('mail', 3)          // (이름, 버전 — 양의 정수)

req.onupgradeneeded = (event) => {             // DB가 없으면(oldVersion 0) 처음에도 온다
  const db = req.result
  switch (event.oldVersion) {                  // break 없이 단계별로 흘러내린다
    case 0: db.createObjectStore('messages', { keyPath: 'id' })
    case 1: req.transaction.objectStore('messages').createIndex('by_date', 'date')
    case 2: db.createObjectStore('drafts', { autoIncrement: true })
  }
}
req.onsuccess = () => { const db = req.result /* 이제 쓴다 */ }
req.onerror = () => console.error(req.error)
```

| 규칙 | 이유·결과 |
| --- | --- |
| 저장소·인덱스 생성·삭제는 `upgradeneeded` 안에서만 | 그 안에서 자동으로 열리는 `versionchange` 트랜잭션만 스키마를 바꿀 수 있다 |
| 버전별 업그레이드를 순서대로 적는다 | 1에서 3으로 바로 오는 사용자도 있다. `oldVersion`부터 차례로 적용한다. 작은 DB는 `db.objectStoreNames.contains('x')`로 있는지 보고 만드는 방식도 된다 |
| 더 낮은 버전으로는 열 수 없다 | 기기 DB가 3인데 캐시된 옛 코드가 `open(…, 2)`를 하면 `error`. HTTP 캐시 설정으로 옛 코드가 남지 않게 한다 |
| 삭제 | `indexedDB.deleteDatabase(name)` |

### 다른 탭과의 버전 충돌

같은 출처의 탭들은 DB를 공유한다. 탭 A가 버전 2로 열어 둔 상태에서 새 코드가 배포되고 탭 B가 버전 3으로 열면, **A의 연결이 닫혀야 B의 업그레이드가 진행된다.**

```javascript
// 모든 탭의 코드에 둔다
db.onversionchange = () => {     // 다른 탭이 더 높은 버전으로 열려 할 때 옛 연결에 온다
  db.close()
  showBanner('새 버전이 있다. 새로고침한다.')
}
req.onblocked = () => {          // 옛 연결이 안 닫혀 업그레이드가 막혔을 때 새 쪽에 온다
  showBanner('다른 탭을 닫아 달라.')
}
```

`versionchange`를 처리하지 않으면 새 탭의 `open`은 `success` 대신 `blocked`에서 멈춰 아무 말 없이 동작하지 않는다.

## 트랜잭션

**모든 읽기·쓰기는 트랜잭션 안에서 한다.**

```javascript
const tx = db.transaction(['messages'], 'readwrite') // (다룰 저장소 목록, 모드)
const store = tx.objectStore('messages')
store.put({ id: 42, subject: '안녕', date: new Date() })
tx.oncomplete = () => console.log('디스크에 반영됨')
tx.onerror = () => console.error(tx.error)
```

| 모드 | 할 수 있는 일 | 동시성 |
| --- | --- | --- |
| `readonly` (기본) | 읽기 | 같은 저장소에 여럿이 동시에 |
| `readwrite` | 읽기·쓰기 (스키마 변경은 불가) | 저장소를 잠근다. 다음 `readwrite`는 앞이 끝날 때까지 기다린다 |
| `versionchange` | 전부 | 직접 만들 수 없다. `upgradeneeded`에서 자동 생성 |

읽기만 하면 `readonly`로 연다. 모드를 나누는 이유가 바로 동시 읽기 성능이다. 쓰기 성능이 더 중요하고 직후 정전에 약간의 손실을 감수할 수 있으면 `db.transaction(stores, 'readwrite', { durability: 'relaxed' })`로 디스크 동기화를 기다리지 않게 한다.

### 자동 커밋과 「비활성 트랜잭션」 함정

**트랜잭션은 남은 요청이 없고 현재 코드와 마이크로태스크가 끝나면 자동으로 커밋된다.** 그래서 트랜잭션 도중에 `fetch`, `setTimeout` 같은 매크로태스크를 기다리면 돌아왔을 때 트랜잭션이 이미 닫혀 있다.

```javascript
const tx = db.transaction('inventory', 'readwrite')
await tx.store.add(itemA)       // idb 래퍼 기준
await fetch('/price')           // 이 사이에 tx가 커밋된다 (이벤트 루프가 매크로태스크로 넘어감)
await tx.store.add(itemB)       // TransactionInactiveError
```

해결은 **네트워크 작업과 DB 작업을 분리**하는 것이다. 필요한 데이터를 먼저 다 받아 준비한 뒤, 트랜잭션을 열어 한 번에 쓴다. 이벤트 루프와 마이크로태스크의 관계는 [[event-loop|이벤트 루프]]에 있다.

- 더 보낼 요청이 없다는 것을 알면 `tx.commit()`으로 바로 커밋해 자동 커밋을 기다리지 않는다. 주요 브라우저가 모두 지원한다.
- `tx.abort()`는 그 트랜잭션의 변경을 모두 되돌리고 `abort` 이벤트를 낸다.
- **개별 요청의 `success`는 저장 완료가 아니다.** 마지막 디스크 쓰기가 실패할 수도 있으므로 「저장됐다」는 `complete`(래퍼에서는 `tx.done`)로 판단한다.

### 오류 처리

| 상황 | 동작 |
| --- | --- |
| 요청 하나가 실패 (`add`로 중복 키 → `ConstraintError`, 용량 초과 → `QuotaExceededError`) | 기본적으로 **트랜잭션 전체가 중단**되고 앞선 변경도 취소된다 |
| 그 실패를 처리하고 계속하고 싶다 | `request.onerror`에서 `event.preventDefault()` |
| 오류를 한곳에서 모으고 싶다 | 이벤트가 요청 → 트랜잭션 → DB로 **버블링**되므로 `db.onerror`에서 받는다. 이미 처리한 오류는 `event.stopPropagation()`으로 막는다 |

`put`과 `add`의 차이: `put`은 같은 키가 있으면 덮어쓰고, `add`는 같은 키가 있으면 `ConstraintError`로 실패한다. 결과(`request.result`)는 저장된 키다.

## 찾기: 키, 범위, 인덱스, 커서

검색 메서드는 정확한 키나 **키 범위(`IDBKeyRange`)** 를 받는다.

| 범위 | 의미 |
| --- | --- |
| `IDBKeyRange.lowerBound(x, open?)` | `≥ x` (`open`이 true면 `> x`) |
| `IDBKeyRange.upperBound(x, open?)` | `≤ x` |
| `IDBKeyRange.bound(a, b, aOpen?, bOpen?)` | `a`와 `b` 사이 |
| `IDBKeyRange.only(x)` | `x` 하나 |

| 메서드 | 돌려주는 것 |
| --- | --- |
| `get(query)` | 첫 번째 값 |
| `getAll(query?, count?)` | 값 배열 (키 순) |
| `getKey(query)` / `getAllKeys(query?, count?)` | 키 / 키 배열 |
| `count(query?)` | 개수 |
| `delete(query)` / `clear()` | 지우기 / 전부 지우기 |

```javascript
const store = db.transaction('books').objectStore('books')
store.getAll(IDBKeyRange.bound('css', 'html'))     // 키(id)가 'css'~'html'인 책

const byPrice = store.index('price_idx')           // 인덱스에도 같은 메서드를 쓴다
byPrice.getAll(IDBKeyRange.upperBound(5))          // 5 이하, 가격순으로 정렬돼 나온다
```

인덱스는 `upgradeneeded`에서 `store.createIndex(name, keyPath, { unique, multiEntry })`로 만든다. `unique`는 중복 값을 오류로 막고, `multiEntry`는 필드가 배열일 때 **배열 원소마다** 색인한다(태그 검색). 다른 필드로 지우려면 인덱스로 키를 찾은 뒤 저장소에서 `delete(key)`한다.

### 커서: 메모리에 다 올리지 않고 순회

`getAll`은 결과를 배열로 한 번에 만든다. 저장소가 메모리보다 크면 **커서**로 한 건씩 돈다.

```javascript
const req = store.index('price_idx').openCursor(IDBKeyRange.upperBound(5), 'prev') // 비싼 것부터
req.onsuccess = () => {
  const cursor = req.result
  if (!cursor) return                  // 끝
  console.log(cursor.key, cursor.primaryKey, cursor.value) // 인덱스 키(가격), 저장소 키(id), 값
  cursor.continue()                    // 다음 건 — onsuccess가 다시 불린다
}
```

- 방향: `next`(기본, 오름차순), `prev`, 인덱스에서 같은 키를 건너뛰는 `nextunique`·`prevunique`.
- `advance(n)`은 n건 건너뛰고, `continue(key)`는 그 키 다음으로 뛴다. 쓰기 트랜잭션의 커서에서는 `cursor.update(v)`·`cursor.delete()`도 된다.
- 페이지네이션은 마지막으로 본 키를 기억했다가 `lowerBound(lastKey, true)`로 다음 페이지를 연다.

## Promise 래퍼: idb

네이티브 API는 요청마다 `onsuccess`·`onerror`를 거는 이벤트 방식이라 장황하다. 실무에서는 얇은 Promise 래퍼 [idb](https://github.com/jakearchibald/idb)를 흔히 쓴다. 기본 사용 예(`openDB`·`upgrade`·`tx.done`·`getAllFromIndex`)는 [[pwa-offline-storage|PWA 오프라인 데이터와 저장소 관리]]에 있다. 여기서는 위의 네이티브 개념이 래퍼에서 어떻게 보이는지만 짝지어 둔다.

| 네이티브 | idb |
| --- | --- |
| `request.onsuccess`·`onerror` | `await` + `try/catch`. 잡지 않은 거부는 `window`의 `unhandledrejection`으로 간다 |
| `openRequest.onupgradeneeded` | `openDB(name, version, { upgrade(db, oldVersion, newVersion, tx) {…} })` |
| `db.onversionchange` / `openRequest.onblocked` | `blocking()` / `blocked()` 콜백 — 위 「다른 탭과의 버전 충돌」을 그대로 처리한다 |
| `transaction.oncomplete` | `await tx.done` |
| `db.transaction(s).objectStore(s).get(k)` | `db.get(s, k)` (트랜잭션 하나짜리 단축 메서드) |
| 네이티브 요청 객체가 필요할 때 | `idb`의 `unwrap(obj)` |

래퍼를 써도 **자동 커밋 규칙은 그대로**다. `await` 사이에 `fetch`를 끼우면 똑같이 `TransactionInactiveError`가 난다. 쿼리·동기화까지 필요하면 Dexie.js 같은 더 두꺼운 라이브러리를 쓴다.

## 할당량과 삭제

IndexedDB는 Cache Storage 등과 출처 단위 할당량을 나눠 쓰고, 기본은 브라우저가 지울 수 있는 최선 노력 저장이다. `navigator.storage.estimate()`·`persist()`와 브라우저별 삭제 정책은 [[pwa-offline-storage|PWA 오프라인 데이터와 저장소 관리]]에 있다. API 쪽에서 챙길 것은 두 가지다. 쓰기 요청이 `QuotaExceededError`로 실패할 수 있으므로 오류 경로를 만든다(DevTools에서 할당량을 작게 시뮬레이션해 확인한다, [[devtools-application|DevTools Application 패널]]). 그리고 **DB는 지워질 수 있으니 원본은 서버에 두거나 복구 경로를 둔다.**

## 정리

- IndexedDB는 구조화된 값을 키로 저장하는 **출처별 트랜잭션 DB**다. 오프라인·대용량에 쓰고, 작은 설정값은 localStorage로 충분하다.
- 스키마는 **버전을 올리고 `upgradeneeded`에서만** 바꾼다. 다른 탭을 위해 `versionchange`에서 연결을 닫는다.
- 트랜잭션은 **자동 커밋**된다. 중간에 `fetch`를 기다리지 말고, 데이터를 먼저 준비한 뒤 한 번에 쓴다. 완료는 `complete`(`tx.done`)로 확인한다.
- 키 범위·인덱스로 찾고, 큰 데이터는 커서로 돈다.
- 코드는 idb 같은 Promise 래퍼로 쓰되 자동 커밋 규칙은 똑같이 지킨다. 데이터는 지워질 수 있다는 전제로 설계한다.

관련 노트: [[pwa-offline-storage|PWA 오프라인 데이터와 저장소 관리]], [[web-storage|Web Storage: localStorage와 sessionStorage]], [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]], [[web-workers|웹 워커로 메인 스레드 비우기]], [[binary-data-and-files|바이너리 데이터와 파일]], [[devtools-application|DevTools Application 패널]]
