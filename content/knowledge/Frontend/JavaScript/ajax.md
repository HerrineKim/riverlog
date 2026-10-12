---
title: "AJAX와 HTTP 요청"
concept: "AJAX"
summary: "페이지를 새로고침하지 않고 서버와 비동기로 데이터를 주고받는 AJAX와 fetch·axios, CORS."
tags: ["javascript", "http", "async", "frontend"]
source: til
---

**AJAX(Asynchronous JavaScript And XML)** 는 페이지 전체를 새로 받지 않고, JavaScript로 서버와 **비동기 통신**해 필요한 데이터만 받아 화면 일부를 갱신하는 기법이다. SPA와 CSR의 기반이 되는 기술이다.

## 개요

- 원래 `XMLHttpRequest`(XHR) 객체로 서버와 통신했다.
- JSON, XML, HTML, 일반 텍스트 등 다양한 형식을 주고받을 수 있다.
- 이름의 X는 XML이지만, 요즘은 더 가볍고 JavaScript 객체와 바로 호환되는 **JSON**을 주로 쓴다.

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

## CORS

**CORS(Cross-Origin Resource Sharing)** 는 브라우저가 **다른 출처(origin: 프로토콜+도메인+포트)** 의 서버로 요청할 때 적용하는 보안 정책이다. 서버가 응답 헤더(`Access-Control-Allow-Origin` 등)로 허용하지 않으면 브라우저가 응답을 막는다.

- 브라우저에서만 발생한다. 서버끼리의 요청이나 같은 출처로의 요청에는 적용되지 않는다.
- 근본적인 해결은 **서버에서 허용 출처를 설정**하는 것이다.
- 개발 환경에서는 프론트 개발 서버에 **프록시**를 두어 우회할 수 있다. 브라우저는 같은 출처(프론트 개발 서버)로 요청하고, 개발 서버가 백엔드로 대신 전달한다.

```typescript
// webpack.config.ts — /api/로 시작하는 요청을 백엔드(3095)로 전달
devServer: {
  port: 3090,
  proxy: {
    '/api/': {
      target: 'http://localhost:3095',
      changeOrigin: true,
    },
  },
},
```

이 방법은 프론트와 백엔드가 모두 로컬에서 돌 때 쓰는 개발용 우회다. Vite·CRA 등 다른 개발 서버도 같은 개념의 proxy 설정을 제공한다.

## 디버깅 팁

요청을 보낼 때는 브라우저 개발자 도구의 **Network 탭**에서 요청 URL, 메서드, 헤더(쿠키 포함 여부), 상태 코드, 응답 본문을 확인하는 습관을 들인다.

## 핵심 정리

- AJAX = 새로고침 없이 비동기로 데이터만 주고받기. 형식은 주로 JSON.
- 현대 코드에서는 `fetch` 또는 `axios`를 Promise/async-await와 함께 쓴다.
- fetch는 HTTP 에러에서 reject되지 않으니 `response.ok`를 확인한다.
- CORS는 브라우저 정책이다. 해결은 서버 설정, 개발 중 우회는 프록시.

관련 노트: [[cors|CORS(서버 설정 관점)]], [[rest-api|REST API]], [[recommendation-and-ajax|axios로 비동기 좋아요·팔로우 구현]]
