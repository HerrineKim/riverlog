---
title: "페이지 생명주기와 리소스 로딩 이벤트"
concept: "Page Lifecycle Events"
summary: "문서가 열리고 닫히는 동안 일어나는 이벤트. DOMContentLoaded가 기다리는 것과 기다리지 않는 것, load와 readyState, 떠날 때의 beforeunload·pagehide·visibilitychange와 피해야 할 unload, sendBeacon·keepalive로 마지막 데이터 보내기, 스크립트·이미지의 load·error 이벤트와 crossorigin 속성으로 다른 출처 스크립트의 오류 정보 얻기를 정리한다."
tags: ["javascript", "browser", "event", "performance", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/onload-ondomcontentloaded", "https://ko.javascript.info/onload-onerror", "https://developer.mozilla.org/en-US/docs/Web/API/Window/unload_event", "https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event", "https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「DOMContentLoaded, load, beforeunload, unload 이벤트」, 「Resource loading: onload and onerror」 글을 바탕으로, 페이지를 떠날 때의 권장 방식은 MDN으로 확인해 재구성한 노트다.

## 한눈에 보기

```text
document.readyState: loading
  HTML 파싱 ─ 동기 스크립트 실행 ─ defer·module 스크립트 실행
document.readyState: interactive
  DOMContentLoaded (document)          ← DOM 완성. 이미지·iframe은 아직일 수 있다
  이미지·iframe·스타일시트 등 load
document.readyState: complete
  load (window)                        ← 모든 리소스 완료

  …사용 중…  visibilitychange(hidden/visible) 탭 전환마다

떠날 때: beforeunload → pagehide → visibilitychange(hidden) → (unload)
```

| 이벤트 | 대상 | 쓰는 곳 |
| --- | --- | --- |
| `DOMContentLoaded` | `document` | DOM을 찾아 리스너를 붙이고 UI를 초기화한다 |
| `load` | `window` | 이미지 크기처럼 모든 리소스가 있어야 아는 값이 필요할 때. 기다림이 길어 잘 안 쓴다 |
| `beforeunload` | `window` | 저장하지 않은 변경이 있을 때 떠나기 전 확인 |
| `visibilitychange` | `document` | 숨겨질 때 상태 저장·분석 데이터 전송. **마지막으로 확실히 일어나는 이벤트** |
| `pagehide`·`pageshow` | `window` | 다른 페이지로 갈 때와 돌아올 때. bfcache 복원 감지 |

## DOMContentLoaded

`DOMContentLoaded`는 `document`에서 일어나고 **`addEventListener`로만** 받는다. `document.onDOMContentLoaded = …`는 동작하지 않는다.

| DOMContentLoaded가 기다린다 | 기다리지 않는다 |
| --- | --- |
| 속성 없는 `<script>`(인라인·외부)의 다운로드와 실행 | `async` 스크립트 |
| `defer`·`type="module"` 스크립트 | `document.createElement('script')`로 넣은 동적 스크립트 |
| 스크립트 **앞의** 스타일시트(스크립트가 스타일을 읽을 수 있어서) | 이미지, iframe, 폰트 |
| | 스크립트가 뒤따르지 않는 스타일시트 |

- 스타일시트 자체는 DOM을 바꾸지 않아 `DOMContentLoaded`가 기다리지 않는다. 하지만 바로 뒤에 동기 스크립트가 있으면 그 스크립트가 `getComputedStyle` 같은 값을 읽을 수 있어 CSS를 기다리고, `DOMContentLoaded`는 그 스크립트를 기다린다. 결국 CSS를 기다리게 된다.
- 브라우저의 아이디·비밀번호 자동 완성은 `DOMContentLoaded` 시점에 채워진다. 동기 스크립트가 길어 이 이벤트가 늦어지면 자동 완성도 늦다.
- 스크립트 배치(`async`·`defer`·`module`)가 이 시점에 주는 영향은 [[script-loading|스크립트·스타일 로딩 순서]]에 있다.

### 이미 지나갔을 수 있다

문서가 다 로드된 뒤에 붙인 `DOMContentLoaded` 리스너는 영원히 실행되지 않는다. 언제 실행될지 모르는 코드(나중에 불러온 라이브러리)는 `document.readyState`를 먼저 본다.

| `readyState` | 상태 |
| --- | --- |
| `'loading'` | 문서를 파싱하는 중 |
| `'interactive'` | 파싱 끝. `DOMContentLoaded` 직전에 이 값이 된다 |
| `'complete'` | 리소스까지 모두 로드됨. `window`의 `load` 직전에 이 값이 된다 |

```javascript
function init() { /* … */ }

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init() // 이미 DOM이 있다
}
```

상태가 바뀔 때마다 `readystatechange` 이벤트도 일어나지만, 위 분기로 충분해 거의 쓰지 않는다.

## 페이지를 떠날 때

### 확인 창: beforeunload

저장하지 않은 변경이 있을 때만 리스너를 붙이고, 저장하면 뗀다.

```javascript
const confirmLeave = (event) => {
  event.preventDefault()   // 확인 창을 띄우는 표준 방법
  event.returnValue = true // 옛 브라우저용
}

editor.addEventListener('input', () => window.addEventListener('beforeunload', confirmLeave))
saveButton.addEventListener('click', () => window.removeEventListener('beforeunload', confirmLeave))
```

- 확인 창의 문구는 브라우저가 정한 일반 문구다. 과거에는 반환한 문자열을 보여 줬지만 남용 때문에 지금은 바꿀 수 없다.
- 사용자가 페이지와 한 번도 상호작용하지 않았으면(스티키 활성화가 없으면) 창이 뜨지 않는다.
- `beforeunload` 리스너가 있으면 일부 브라우저가 페이지를 bfcache에 넣지 않는다. 늘 붙여 두지 않는 이유다.
- `onbeforeunload`에서 문자열이나 `false`를 반환하는 방식은 옛 방식이다.

### 마지막 데이터 보내기: visibilitychange

`unload`는 **쓰지 않는다.** 모바일에서는 앱을 전환한 뒤 앱 관리자로 브라우저를 닫으면 일어나지 않고, bfcache와 호환되지 않아 뒤로 가기를 느리게 만든다. 크롬은 기본으로 `unload`를 더는 실행하지 않는다.

| 대신 | 언제 | 쓰임 |
| --- | --- | --- |
| `visibilitychange`에서 `document.visibilityState === 'hidden'` | 탭 전환, 다른 앱으로 전환, 페이지 이동, 닫기 | 분석 데이터 전송, 상태 저장. 가장 확실하다 |
| `pagehide` | 세션 기록의 다른 페이지로 갈 때. `event.persisted`면 bfcache에 들어간다 | 이동 감지. 모바일에서는 `visibilitychange`보다 덜 확실하다 |
| `pageshow` | 페이지가 보일 때. `event.persisted`면 bfcache에서 복원됐다 | 복원 시 오래된 데이터 갱신 |

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    navigator.sendBeacon('/analytics', JSON.stringify(analyticsData))
  }
})
```

- `navigator.sendBeacon(url, data)`는 페이지가 사라져도 브라우저가 백그라운드에서 **POST**로 끝까지 보낸다. 응답은 받을 수 없고, 보낼 수 있는 크기에 제한(보통 64KB 안팎)이 있다.
- 헤더나 메서드를 정해야 하면 `fetch(url, { method: 'POST', body, keepalive: true })`를 쓴다. `keepalive` 요청도 크기 제한이 같다.
- 웹 바이탈 지표를 보고할 때도 같은 방식을 쓴다([[web-vitals|웹 성능 지표와 Lighthouse]]). bfcache를 막는 원인 확인은 [[devtools-application|DevTools Application 패널]]에 있다.

## 리소스의 load와 error

외부 `src`를 가진 요소(스크립트, 이미지, iframe, `<link>` 스타일시트 등)는 로딩 결과를 `load`·`error` 이벤트로 알린다.

```javascript
const script = document.createElement('script')
script.src = 'https://cdn.example.com/lib.js'
script.onload = () => lib.init()           // 받아서 **실행까지** 끝난 뒤
script.onerror = () => showFallback()      // 404·네트워크 오류. 어떤 HTTP 오류인지는 알 수 없다
document.head.append(script)
```

| 주의 | 내용 |
| --- | --- |
| `load`·`error`는 **로딩만** 본다 | 스크립트가 받아졌으면 안에 실행 오류가 있어도 `load`다. 실행 오류는 `window`의 `error` 이벤트(`window.onerror`)가 받는다 |
| 이미지는 `src`를 넣는 순간 받는다 | 다른 리소스는 문서에 붙어야 받기 시작하지만, `<img>`는 문서 밖에서도 `src`가 생기면 바로 받는다. 미리 받아 두기에 쓰인다 |
| `<iframe>`은 늘 `load`다 | 역사적인 이유로 페이지를 찾지 못해도 `load`가 일어난다 |
| 이미 끝났을 수 있다 | 캐시된 이미지는 리스너를 붙이기 전에 끝날 수 있다. `img.complete`를 먼저 보거나 `await img.decode()`를 쓴다 |

내 코드의 의존성이라면 동적 `<script>` 대신 동적 `import()`가 Promise로 결과를 주어 더 간단하다([[es-modules|모듈: export와 import]]).

### 다른 출처 스크립트의 오류 정보

같은 출처 정책 때문에 다른 출처(도메인·포트·프로토콜 중 하나라도 다름)에서 받은 스크립트의 실행 오류는 `window.onerror`에 `"Script error."`와 `0:0`만 온다. 메시지·줄 번호·스택이 숨겨진다. 오류 수집 서비스가 정보를 얻으려면 CORS로 허락받는다.

| `crossorigin` 속성 | 요청 | 서버가 보내야 할 헤더 |
| --- | --- | --- |
| 없음 | 일반 요청. 오류 상세는 숨겨진다 | 없음 |
| `anonymous` | 쿠키·인증 정보 없이 CORS 요청 | `Access-Control-Allow-Origin: *` 또는 내 출처 |
| `use-credentials` | 쿠키·인증 정보를 실어 CORS 요청 | `Access-Control-Allow-Origin: 내 출처` + `Access-Control-Allow-Credentials: true` |

```html
<script crossorigin="anonymous" src="https://cdn.example.com/app.js"></script>
```

같은 속성은 다른 출처 이미지를 `<canvas>`에 그린 뒤 픽셀을 읽을 때, `integrity`(하위 리소스 무결성)를 검사할 때도 필요하다. CORS 자체는 [[ajax|AJAX와 HTTP 요청]]에 있다.

## 정리

- DOM을 다루는 초기화는 `DOMContentLoaded`(또는 `defer`·모듈 스크립트)에서, 이미 지났을 수 있으면 `readyState`로 분기한다.
- `load`는 모든 리소스를 기다리므로 꼭 필요할 때만 쓴다.
- 떠나기 전 확인은 변경이 있을 때만 `beforeunload` + `preventDefault()`.
- 마지막 전송은 `unload`가 아니라 `visibilitychange`(hidden) + `sendBeacon`·`keepalive`.
- 스크립트 `onload`는 실행 후, `onerror`는 로딩 실패만 알린다. 다른 출처 스크립트의 오류를 보려면 `crossorigin`과 CORS 헤더가 필요하다.

관련 노트: [[script-loading|스크립트·스타일 로딩 순서와 점진적 렌더링]], [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]], [[web-vitals|웹 성능 지표와 Lighthouse]], [[devtools-application|DevTools Application 패널]], [[es-modules|모듈: export와 import]], [[event-loop|이벤트 루프]]
