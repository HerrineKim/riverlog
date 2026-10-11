---
title: "이전 페이지 URL 알아내기"
concept: "Referrer"
summary: "사용자가 어느 페이지에서 왔는지 알아내는 세 가지 방법(document.referrer, 직접 기록, 쿠키·sessionStorage)과 각각의 한계."
tags: ["javascript", "browser", "web", "frontend"]
source: notion
---

"특정 페이지에서 넘어온 사용자에게만 팝업을 띄우기"처럼 **직전 페이지**를 알아야 할 때가 있다. 브라우저는 보안상 방문 기록(history)의 URL 목록을 스크립트에 공개하지 않기 때문에, 쓸 수 있는 방법이 제한적이다.

## 1. `document.referrer`

```javascript
const previousUrl = document.referrer // 없으면 빈 문자열
```

- 링크를 클릭해 들어온 경우, 직전 페이지의 URL이 담긴다.
- **한계**: 주소창에 직접 입력·북마크로 들어오면 비어 있다. 또 기본 Referrer-Policy(`strict-origin-when-cross-origin`) 때문에 **다른 도메인에서 오면 origin만**(경로 없이) 담긴다.
- SPA에서 라우터로 화면을 바꾸는 것은 실제 페이지 이동이 아니므로 `referrer`가 갱신되지 않는다.

## 2. `window.history`로는 알 수 없다

`history.length`는 현재 탭의 기록 **개수**만 알려 주고, 이전 URL 자체는 읽을 수 없다. `history.state`는 앱이 `pushState`로 직접 넣어 둔 값일 뿐이다. 따라서 이전 URL이 필요하면 **이동할 때 직접 기록**해 두어야 한다.

```javascript
// SPA: 라우트가 바뀔 때마다 직전 경로를 state에 함께 넣어 둔다
history.pushState({ prevPath: location.pathname }, '', '/next')
console.log(history.state?.prevPath)
```

react-router라면 `navigate('/next', { state: { from: location.pathname } })`로 넘기고 `useLocation().state`로 꺼내는 방식을 많이 쓴다.

## 3. 쿠키나 sessionStorage에 저장하기

페이지를 떠날 때(또는 각 페이지에 들어올 때) 현재 경로를 저장해 두고, 다음 페이지에서 꺼낸다.

```javascript
// 저장
document.cookie = `prevPath=${encodeURIComponent(location.pathname)}; path=/`

// 읽기
const match = document.cookie.match(/(?:^|;\s*)prevPath=([^;]*)/)
const previousPath = match ? decodeURIComponent(match[1]) : null

// 다 썼으면 삭제: 만료일을 과거로
document.cookie = 'prevPath=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
```

- 쿠키를 지울 때는 **만들 때와 같은 이름·path**를 써야 지워진다.
- 서버에 보낼 필요가 없는 값이라면 요청마다 전송되는 쿠키보다 **`sessionStorage`** 가 더 알맞다. 탭 단위로 유지되고 탭을 닫으면 사라진다.

```javascript
sessionStorage.setItem('prevPath', location.pathname)
const previousPath = sessionStorage.getItem('prevPath')
sessionStorage.removeItem('prevPath')
```

쿠키 자체의 동작은 [쿠키와 세션](/knowledge/dictionary/frontend/web/cookie-session) 참고.

## 정리

| 방법 | 장점 | 한계 |
| --- | --- | --- |
| `document.referrer` | 코드 한 줄 | 직접 진입 시 빈 값, 교차 출처는 origin만, SPA 내부 이동 미반영 |
| `history.state`·라우터 state | SPA 내부 이동에 정확 | 외부에서 들어오거나 주소를 직접 입력하면 없음 |
| 쿠키 / sessionStorage | 페이지 이동·새로고침에도 유지 | 직접 저장·삭제 관리 필요 |
