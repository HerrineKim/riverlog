---
title: "Web Storage: localStorage와 sessionStorage"
concept: "Web Storage"
summary: "브라우저에 키-값 문자열을 저장하는 localStorage·sessionStorage의 API, 객체를 JSON으로 직렬화해 저장하고 복원하는 법, 다른 탭과 동기화하는 storage 이벤트, 예외 처리와 보안상 넣지 말아야 할 것을 정리한다."
tags: ["browser", "web", "javascript", "frontend", "state"]
source: other
date: "2026-10-15"
sources: ["https://ko.javascript.info/localstorage", "https://wesbos.com/javascript/10-harder-practice-exercises/57-shopping-form-with-custom-events-delegation-and-localstorage", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API", "https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event", "https://web.dev/learn/privacy/third-parties", "https://webkit.org/tracking-prevention/"]
---

> Wes Bos의 「[Beginner JavaScript](https://wesbos.com/javascript)」 강의 노트를 바탕으로, API 세부는 MDN으로 확인해 재구성한 노트다. 브라우저의 저장소 삭제·분할 규칙은 web.dev의 「[Learn Privacy](https://web.dev/learn/privacy)」 강좌와 WebKit 문서로 보강했다.

## Web Storage란

**Web Storage**는 브라우저가 출처(origin)별로 제공하는 작은 키-값 저장소다. 서버로 보내지 않고 그 브라우저 안에만 남는다. 장바구니, 작성 중인 글, 테마·정렬 같은 화면 설정을 새로고침이나 재방문 뒤에도 이어 가게 할 때 쓴다.

| 저장소 | 수명 | 공유 범위 |
| --- | --- | --- |
| `localStorage` | 지울 때까지 남는다 | 같은 출처의 모든 탭 |
| `sessionStorage` | 탭을 닫으면 사라진다 | 그 탭 하나(탭을 복제하면 복사된다) |

쿠키와의 차이(자동 전송, 용량, `HttpOnly`)는 [[cookie-session#쿠키와 Web Storage 비교|쿠키와 세션]]의 비교표에 있다.

## API

```javascript
localStorage.setItem('theme', 'dark')   // 저장(덮어쓰기)
localStorage.getItem('theme')           // 'dark', 없으면 null
localStorage.removeItem('theme')        // 하나 삭제
localStorage.clear()                    // 이 출처의 전부 삭제
localStorage.length; localStorage.key(0) // 개수와 n번째 키
```

`sessionStorage`도 메서드가 똑같다. 동작은 **동기**다. 값을 읽고 쓰는 동안 메인 스레드가 멈추므로 큰 데이터를 자주 쓰는 용도에는 맞지 않는다.

## 값은 문자열만: JSON 직렬화

Web Storage는 **문자열만** 저장한다. 객체나 배열을 그대로 넣으면 `String()`으로 바뀌어 `"[object Object]"`가 저장된다. 숫자·불리언도 문자열로 돌아온다(`'true'`, `'3'`).

```javascript
const KEY = 'cart:v1'

function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

function restore() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [] // 없으면 null → 기본값
  } catch {
    return [] // 손상된 값, 접근 차단
  }
}
```

- `JSON.stringify`는 `Date`를 문자열로, `Map`·`Set`을 `{}`로, `undefined`와 함수를 없앤다. 복원할 때 다시 변환해야 한다([[arrays-and-objects|배열·객체·문자열]]의 JSON 참고).
- 키에 버전을 붙여 두면(`cart:v1`) 저장 형식을 바꿀 때 옛 값을 무시하거나 옮기기 쉽다.

### 상태와 저장소를 동기화하는 흐름

화면 상태의 원본은 JavaScript 변수(또는 프레임워크 상태)에 두고, 저장소는 그 **거울**로 쓴다.

```text
페이지 로드 → restore()로 상태 복원 → 화면 그리기
상태 변경 → 'items-updated' 이벤트 → ├─ 화면 다시 그리기
                                     └─ save()로 저장소에 반영
```

상태를 바꾸는 코드가 저장과 렌더링을 직접 부르지 않고 이벤트 하나만 보내면, 반응하는 쪽을 따로 늘릴 수 있다([[dom-events#커스텀 이벤트|DOM 이벤트의 커스텀 이벤트]]).

## 다른 탭과 동기화: storage 이벤트

같은 출처의 **다른 탭**에서 `localStorage`를 바꾸면 이 탭의 `window`에 `storage` 이벤트가 온다. 값을 바꾼 탭 자신에는 오지 않는다.

```javascript
window.addEventListener('storage', (event) => {
  if (event.key !== KEY) return
  items = JSON.parse(event.newValue ?? '[]') // oldValue, newValue, url도 있다
  render()
})
```

한 탭에서 로그아웃하거나 테마를 바꿨을 때 다른 탭에도 반영하는 데 쓴다. 저장 없이 탭끼리 메시지만 주고받으려면 `BroadcastChannel`이 더 맞다. 저장된 키를 순회할 때는 `for...in`을 쓰지 않는다. `length`·`getItem` 같은 내장 속성까지 나오므로 `Object.keys(localStorage)`나 `key(i)` 루프를 쓴다.

## 예외와 한계

| 상황 | 결과 | 대응 |
| --- | --- | --- |
| 용량 초과(출처당 보통 약 5MiB) | `setItem`이 `QuotaExceededError`를 던진다 | `try/catch`로 감싸고 오래된 항목을 지운다 |
| 사용자가 사이트 데이터를 막음, 일부 사생활 보호 모드 | 접근만 해도 예외가 나거나 저장이 탭 종료 후 사라진다 | 저장소 없이도 화면이 동작하게 만든다 |
| 사파리에서 7일간 방문하지 않음 | ITP가 스크립트로 쓴 저장소(localStorage·IndexedDB 등)를 지운다 | 잃어도 되는 값만 둔다. 지켜야 할 상태는 서버에 둔다 |
| 다른 사이트에 iframe으로 실림 | 서드파티 맥락의 저장소는 최상위 사이트별로 분할된다. 같은 위젯이라도 사이트마다 다른 `localStorage`를 본다 | 사이트를 넘는 공유가 필요하면 Storage Access API를 쓴다([[browser-tracking-protection\|브라우저 추적 방지]]) |
| 큰 데이터, 구조화된 데이터, 파일 | 동기 API라 느리고 문자열 변환 비용이 크다 | IndexedDB(비동기, 구조화 저장)를 쓴다 |

## 넣지 말아야 할 것

`localStorage`는 같은 출처의 **모든 스크립트가 읽을 수 있다.** XSS가 한 번 일어나면 그대로 털린다([[web-security|웹 보안]]).

- 액세스 토큰·리프레시 토큰 같은 인증 정보는 넣지 않는다. 인증은 `HttpOnly`·`Secure` 쿠키에 두는 편이 안전하다([[session-vs-token-auth|세션 기반 인증과 토큰 기반 인증]]).
- 개인정보는 공용 PC에 남을 수 있다는 점을 고려한다.
- 저장된 값은 사용자가 DevTools에서 얼마든지 고칠 수 있다. 가격·권한처럼 믿어야 하는 값의 근거로 쓰지 않는다([[devtools-application|DevTools Application 패널]]).

## 정리

- `localStorage`는 지울 때까지, `sessionStorage`는 탭이 닫힐 때까지 남는 출처별 문자열 저장소다.
- 객체는 `JSON.stringify`로 넣고 `JSON.parse`로 꺼내며, 없음(`null`)과 손상된 값을 대비한다.
- 상태의 원본은 코드에 두고 저장소는 거울로 쓴다.
- 다른 탭의 변경은 `storage` 이벤트로 받는다.
- 토큰처럼 민감한 값은 넣지 않는다. 큰 데이터는 IndexedDB로 간다.

관련 노트: [[cookie-session|쿠키와 세션]], [[browser-tracking-protection|서드파티 쿠키와 브라우저 추적 방지]], [[web-security|웹 보안: CSRF와 XSS]], [[devtools-application|DevTools Application 패널]], [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]], [[previous-url|이전 페이지 URL 알아내기]], [[pwa-offline-storage|PWA 오프라인 데이터와 저장소 관리]]
