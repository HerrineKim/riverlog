---
title: "AJAX와 HTTP 요청"
concept: "AJAX"
summary: "페이지를 새로고침하지 않고 서버와 비동기로 데이터를 주고받는 AJAX. fetch의 옵션·쿼리 파라미터·AbortController 취소, axios, 자주 만나는 오류, CORS와 프록시, 브라우저 코드가 공개된다는 전제의 API 키 관리."
tags: ["javascript", "http", "async", "frontend"]
source: til
date: "2026-10-13"
sources: ["https://vite.dev/config/server-options#server-proxy", "https://developer.mozilla.org/en-US/docs/Web/API/AbortController", "https://wesbos.com/javascript/13-ajax-and-fetching-data/74-ajax-and-apis", "https://wesbos.com/javascript/13-ajax-and-fetching-data/75-cors-and-recipes", "https://wesbos.com/javascript/13-ajax-and-fetching-data/76-dad-jokes", "https://wesbos.com/javascript/14-es-modules-and-structuring-larger-apps/83-security"]
---

> 직접 정리한 내용에 Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)를 함께 참고해 재구성한 노트다.

**AJAX(Asynchronous JavaScript And XML)** 는 페이지 전체를 새로 받지 않고, JavaScript로 서버와 **비동기 통신**해 필요한 데이터만 받아 화면 일부를 갱신하는 기법이다. SPA와 CSR의 기반이 되는 기술이다.

## 개요

- 원래 `XMLHttpRequest`(XHR) 객체로 서버와 통신했다.
- JSON, XML, HTML, 일반 텍스트 등 다양한 형식을 주고받을 수 있다.
- 이름의 X는 XML이지만, 지금은 더 가볍고 JavaScript 객체와 바로 호환되는 **JSON**을 주로 쓴다.

## 요청을 보내는 방법

### XMLHttpRequest (과거 방식)

```javascript
const xhr = new XMLHttpRequest()
xhr.open('GET', '/api/users')
xhr.onload = () => console.log(JSON.parse(xhr.responseText))
xhr.send()
```

콜백 기반이라 코드가 장황하다. 지금은 직접 쓸 일이 거의 없다.

### fetch (브라우저 내장, Promise 기반)

```javascript
async function getUsers() {
  const response = await fetch('/api/users')
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`) // fetch는 4xx/5xx에서 reject되지 않는다
  }
  return response.json()
}
```

`fetch`는 Promise를 **두 번** 기다린다. 첫 `await`는 헤더가 도착한 `Response` 객체를, 두 번째 `response.json()`(또는 `.text()`·`.blob()`)은 본문을 다 받아 변환한 값을 준다. fetch는 응답 형식을 짐작하지 않으므로 어떤 형식으로 읽을지 직접 고른다.

요청을 바꾸려면 두 번째 인자로 옵션 객체를 넘긴다.

```javascript
const params = new URLSearchParams({ q: 'pizza', page: 2 }) // 'q=pizza&page=2', 값은 자동 인코딩
const response = await fetch(`/api/recipes?${params}`, {
  method: 'POST',
  headers: {
    Accept: 'application/json',          // 이런 형식으로 응답해 달라
    'Content-Type': 'application/json',  // 보내는 본문의 형식
  },
  body: JSON.stringify({ title: '새 레시피' }), // 객체는 문자열로 바꿔 보낸다
})
```

- **쿼리 파라미터**는 `?` 뒤에 `키=값`을 `&`로 잇는다. 이름과 여러 값을 담는 방식(쉼표, 반복 키)은 API마다 다르니 문서를 본다. 문자열을 직접 이어 붙이기보다 `URLSearchParams`나 `URL` 객체를 쓰면 인코딩을 빠뜨리지 않는다.
- 같은 주소가 HTML·JSON·텍스트를 모두 줄 수 있는 API는 `Accept` 헤더로 형식을 고른다.

### axios (라이브러리)

```javascript
import axios from 'axios'

const { data } = await axios.get('/api/users')                    // JSON 자동 파싱
await axios.post('/api/users', { email, nickname, password })      // 객체를 JSON으로 자동 변환
await axios.get('/api/users', { withCredentials: true })           // 다른 출처에 쿠키 포함
```

| | fetch | axios |
| --- | --- | --- |
| 설치 | 불필요 | 필요 |
| JSON 처리 | `response.json()` 직접 호출 | 자동 |
| HTTP 에러(4xx/5xx) | reject되지 않음, `response.ok` 확인 필요 | reject됨 → `catch`에서 `error.response`로 확인 |
| 부가 기능 | — | 인터셉터, 기본 설정 인스턴스, 요청 취소 등 |

axios의 에러 객체에서 서버 응답은 `error.response?.data`처럼 옵셔널 체이닝으로 꺼내는 것이 안전하다(네트워크 오류면 `response`가 없다).

## 요청 취소와 타임아웃: AbortController

`fetch`는 기본 타임아웃이 없고, Promise는 한 번 시작하면 스스로 멈추지 않는다. 요청을 끊으려면 `AbortController`의 `signal`을 넘긴다.

```javascript
const controller = new AbortController()
fetch(`/api/search?q=${q}`, { signal: controller.signal })
controller.abort() // 진행 중인 요청을 끊는다 → fetch가 'AbortError'로 reject

await fetch('/api/slow', { signal: AbortSignal.timeout(5000) }) // 5초 뒤 'TimeoutError'로 reject
```

- 검색창처럼 입력할 때마다 요청을 보내면 앞 요청을 `abort()`해 늦게 도착한 옛 응답이 화면을 덮어쓰는 경합을 막는다. 요청 수 자체를 줄이는 것은 [[debounce-throttle|Debounce와 Throttle]]의 몫이다.
- 컴포넌트가 사라질 때(React `useEffect` 정리 함수 등) 진행 중인 요청을 끊는 데도 쓴다.
- 여러 신호를 합칠 때는 `AbortSignal.any([사용자 취소 신호, AbortSignal.timeout(5000)])`를 쓴다. axios도 같은 `signal` 옵션을 받는다.
- 취소로 생긴 거부는 실패가 아니므로 `error.name === 'AbortError'`면 사용자에게 에러를 보여 주지 않는다.

## 자주 만나는 오류

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| `SyntaxError: Unexpected token '<' … is not valid JSON` | JSON을 기대했는데 HTML(`<!DOCTYPE …`)이 왔다. 잘못된 주소의 404 페이지, 로그인 리다이렉트, `Accept` 헤더가 없어 HTML로 응답하는 API가 흔하다 | Network 패널에서 실제 응답 본문을 본다. 주소·`Accept` 헤더를 고치고, `response.ok`와 `Content-Type`을 확인한 뒤 `json()`을 호출한다 |
| `fetch`했는데 `Promise {<pending>}`이 찍힌다 | `fetch`나 `response.json()` 앞의 `await`(또는 `then`)를 빠뜨렸다 | 두 단계 모두 기다린다 |
| `from origin 'null' has been blocked by CORS policy` | HTML을 `file://`로 열어서 출처가 `null`이다 | 로컬 서버(Vite 개발 서버, VS Code Live Server 등)로 연다. ES 모듈도 같은 이유로 `file://`에서 막힌다 |
| `No 'Access-Control-Allow-Origin' header` (서버로 열었는데도) | 상대 API가 CORS 정책을 두지 않았다 | 아래 CORS 절의 프록시를 쓴다 |

## 예시: 새로고침 없는 폼 제출

폼의 기본 제출을 막고, JavaScript가 비동기 요청을 보내고, 서버가 돌려준 JSON으로 바뀐 부분만 DOM에서 고치는 구조다. 좋아요·팔로우 같은 토글 버튼의 기본형이다.

```javascript
form.addEventListener('submit', async (event) => {
  event.preventDefault()                        // 기본 제출(새로고침)을 막는다
  const response = await fetch(form.action, { method: 'POST', body: new FormData(form) })
  if (response.status === 401) return location.assign('/login')
  const { liked, count } = await response.json()
  countEl.textContent = `${count}명`
})
```

- 이벤트는 `click`이 아니라 **`submit`** 에 건다. 엔터 키 제출도 잡히고 `event.target`이 항상 폼이 된다.
- 비로그인일 때 서버가 로그인 페이지로 리다이렉트하면 클라이언트는 그 HTML을 성공 응답으로 받는다. 분기하려면 서버가 **`401` 상태 코드**를 돌려줘야 한다.
- 서버 응답의 키 이름과 구조 분해하는 이름이 어긋나면 오류 없이 화면만 안 바뀐다. 키 이름 규칙을 하나로 정한다.

## CORS

**CORS(Cross-Origin Resource Sharing)** 는 브라우저가 **다른 출처(origin: 프로토콜+도메인+포트)** 의 서버로 요청할 때 적용하는 보안 정책이다. 서버가 응답 헤더(`Access-Control-Allow-Origin` 등)로 허용하지 않으면 브라우저가 응답을 막는다.

- 브라우저에서만 발생한다. 서버끼리의 요청이나 같은 출처로의 요청에는 적용되지 않는다.
- 근본적인 해결은 **서버에서 허용 출처를 설정**하는 것이다. 허용 헤더의 종류, preflight 요청, 자격 증명을 포함할 때의 조건은 [[cors|CORS]]에 정리했다.
- 개발 환경에서는 프론트 개발 서버에 **프록시**를 두어 우회할 수 있다. 브라우저는 같은 출처(프론트 개발 서버)로 요청하고, 개발 서버가 백엔드로 대신 전달한다.

```typescript
// vite.config.ts — /api로 시작하는 요청을 백엔드(3095)로 전달
export default defineConfig({
  server: {
    port: 3090,
    proxy: {
      '/api': {
        target: 'http://localhost:3095',
        changeOrigin: true,
      },
    },
  },
})
```

이 방법은 프론트와 백엔드가 모두 로컬에서 돌 때 쓰는 개발용 우회다. webpack-dev-server의 `devServer.proxy`, Next.js의 `rewrites`도 같은 개념이다.

CORS는 브라우저만 지키는 규칙이라 서버에서 보낸 요청에는 걸리지 않는다. 그래서 CORS를 허용하지 않는 외부 API를 배포 환경에서 써야 하면 **내 서버(또는 서버리스 함수)를 프록시로 두고** 그 서버가 대신 호출하게 한다. 인터넷에 공개된 CORS 프록시 서비스는 요청 내용이 제3자를 거치므로 데모에만 쓴다.

## 브라우저 코드는 공개된다

프런트엔드 JavaScript는 사용자의 브라우저로 내려가 실행되므로 **누구나 읽고 고칠 수 있다.** 난독화·압축은 숨기는 수단이 되지 못한다.

| 대상 | 원칙 |
| --- | --- |
| API 키 | 지도·결제 위젯처럼 **공개용(publishable) 키**는 브라우저에 둬도 된다. 대신 서비스 콘솔에서 허용 도메인(리퍼러)·사용량을 제한한다. **비밀(secret) 키**는 번들에 넣지 않고 서버나 서버리스 함수를 거쳐 호출한다 |
| 환경 변수 | Vite의 `VITE_`, Next.js의 `NEXT_PUBLIC_` 접두사가 붙은 값은 빌드할 때 번들에 그대로 박힌다. 접두사 규칙은 [[tooling|React 빌드 환경 직접 구성하기]]에 있다 |
| 가격·권한·검증 | 화면 표시용으로 클라이언트에서 계산해도, **결정은 서버가 다시 계산·검증**한다. 버튼의 가격이나 숨긴 비공개 다운로드 링크는 바꾸거나 찾아낼 수 있다 |
| 전송 | 데이터를 주고받는 API는 HTTPS만 쓴다. HTTP 요청은 같은 네트워크의 누구나 엿보고 바꿀 수 있다 |

받아 온 데이터나 사용자 입력을 `innerHTML`로 넣을 때 생기는 XSS는 [[web-security|웹 보안: CSRF와 XSS]]에 있다.

## 디버깅 팁

요청이 실제로 어떻게 나갔는지(URL, 메서드, 헤더, 쿠키, 상태 코드, 응답 본문)는 DevTools Network 패널에서 확인한다. 보는 법과 Edit and resend as fetch로 다시 보내는 법은 [[devtools-network|DevTools Network 패널]]에 있다.

## 핵심 정리

- AJAX = 새로고침 없이 비동기로 데이터만 주고받기. 형식은 주로 JSON.
- 현대 코드에서는 `fetch` 또는 `axios`를 Promise/async-await와 함께 쓴다.
- fetch는 HTTP 에러에서 reject되지 않으니 `response.ok`를 확인한다. 옵션 객체로 메서드·헤더·본문을, `URLSearchParams`로 쿼리를 만든다.
- 요청 취소와 타임아웃은 `AbortController`·`AbortSignal.timeout()`으로 한다.
- 비밀 키와 최종 검증은 서버에 둔다. 브라우저 코드는 공개된다.
- CORS는 브라우저 정책이다. 해결은 서버 설정, 개발 중 우회는 프록시.

관련 노트: [[cors|CORS(서버 설정 관점)]], [[rest-api|REST API]], [[vuex|Vue 상태 관리: Pinia(옛 Vuex)]] — axios로 받은 데이터를 스토어에 모으기
