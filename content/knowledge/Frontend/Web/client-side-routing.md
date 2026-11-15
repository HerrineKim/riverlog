---
title: "클라이언트 사이드 라우팅: 해시, History API, Navigation API"
concept: "Client-side Routing"
summary: "SPA가 새로고침 없이 화면을 바꾸면서도 페이지마다 고유한 URL과 뒤로 가기를 유지하는 방법. 링크·AJAX·해시(hashchange)·History API(pushState·popstate) 방식의 차이, 새로고침 때 서버가 해야 할 일(index.html 폴백, Accept 헤더로 HTML·JSON 나눠 응답), 모든 이동을 한 이벤트로 받는 Navigation API를 정리한다."
tags: ["web", "spa", "routing", "history", "browser"]
source: other
date: "2026-10-21"
sources: ["https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/SPA.md", "https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API", "https://developer.mozilla.org/en-US/docs/Web/API/History_API"]
---

> 「[Frontend_TIL: SPA](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/SPA.md)」(poiemaweb 「SPA & Routing」 정리)를 바탕으로, MDN의 「[Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API)」, 「[History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)」 문서로 최신화해 재구성한 노트다.

## 라우팅이란

**라우팅(routing)은 사용자가 요청한 URL이나 이벤트를 해석해 그에 맞는 화면으로 바꾸는 일**이다. 브라우저가 기본으로 화면을 바꾸는 계기는 셋이다. 주소창에 URL 입력, 링크 클릭, 뒤로·앞으로 가기. 셋 모두 URL이 바뀌고 방문 기록(history)이 쌓인다.

SPA는 첫 HTML 하나를 받은 뒤 JavaScript로 화면 일부만 바꾼다([[spa-csr-ssr|SPA와 CSR·SSR]]). 이때 **URL이 바뀌지 않으면** 뒤로 가기·새로고침·북마크·공유·검색 노출이 모두 깨진다. 그래서 클라이언트 사이드 라우팅의 목표는 하나다. **서버에 새 페이지를 요청하지 않으면서도 화면마다 고유한 URL을 갖게 한다.**

## 방식 비교

| 방식 | URL 모양 | 화면 바꾸는 법 | 새로고침 없음 | 기록·고유 URL | 서버 준비 |
| --- | --- | --- | --- | --- | --- |
| 전통적 링크 | `/service.html` | 서버가 완성된 HTML을 응답(서버 렌더링) | ✗ 매번 전체 다시 그림 | ✓ | 페이지마다 HTML |
| AJAX만 | 늘 `/` | 클릭을 `preventDefault`하고 `fetch`로 받아 끼운다 | ✓ | ✗ 뒤로 가기·새로고침이 첫 화면으로 | 데이터 API |
| 해시 | `/#service` | `hashchange` 이벤트로 감지해 그린다 | ✓ | ✓ | 없음 (`#` 뒤는 서버로 가지 않는다) |
| History API | `/service` | `history.pushState`로 URL만 바꾸고 그린다. 뒤로 가기는 `popstate` | ✓ | ✓ | **모든 경로에 응답**해야 한다 |

옛 이름으로 History API 방식을 **PJAX**(pushState + AJAX)라고도 불렀다. React Router의 `createBrowserRouter`와 `createHashRouter`가 각각 History API 방식과 해시 방식이다([[react-router-layout|React Router: 라우팅 기초와 레이아웃]]).

## 해시 방식

URL의 `#` 뒤 조각(fragment identifier)은 원래 문서 안의 앵커로 이동하는 데 쓴다. **같은 문서에서 해시만 바뀌면 브라우저는 서버에 요청하지 않고**, 그래도 기록에는 새 항목을 남긴다. 이 성질을 라우팅에 쓴다.

```javascript
const routes = { '': '/data/home.json', service: '/data/service.json' }

async function render() {
  const key = location.hash.slice(1)       // '#service' → 'service'
  const url = routes[key]
  root.textContent = url ? (await (await fetch(url)).json()).title : `${key} Not Found`
}

window.addEventListener('hashchange', render) // 링크 클릭·뒤로 가기 모두 여기로
window.addEventListener('DOMContentLoaded', render) // 첫 로드·새로고침
```

- 서버 설정이 필요 없어 정적 호스팅(GitHub Pages 등)이나 파일로 여는 앱에 쓰기 쉽다.
- URL에 `#`이 붙어 지저분하다. 과거에는 크롤러에게 "이 해시는 라우트"라고 알리려 `#!`(해시뱅)을 썼고 Google이 이를 위한 별도 크롤링 규칙을 두었지만 2015년에 폐기했다.
- **검색 엔진은 `#` 뒤를 별개 페이지로 보지 않는다.** 모든 화면이 한 URL로 묶이므로 검색 노출이 필요한 앱에는 맞지 않는다.

## History API 방식

`history.pushState(state, '', url)`은 **주소창의 URL을 바꾸고 기록에 항목을 더하지만 요청은 보내지 않는다.** 화면은 직접 그려야 한다.

```javascript
const routes = { '/': '/data/home.json', '/service': '/data/service.json' }

async function render(path) { /* routes[path]를 fetch해 그린다 */ }

nav.addEventListener('click', (e) => {
  const a = e.target.closest('a')
  if (!a) return
  e.preventDefault()                         // 브라우저의 페이지 이동을 막고
  const path = a.getAttribute('href')
  history.pushState({ path }, '', path)      // URL과 기록만 바꾼 뒤
  render(path)                               // 직접 그린다
})

window.addEventListener('popstate', (e) => { // 뒤로·앞으로 가기, history.back()
  render(e.state?.path ?? location.pathname)
})

render(location.pathname)                    // 첫 로드·새로고침
```

| 메서드·이벤트 | 동작 |
| --- | --- |
| `pushState(state, '', url)` | 새 기록 항목을 추가한다. 같은 출처 URL만 된다 |
| `replaceState(state, '', url)` | 현재 항목을 바꾼다. 리다이렉트처럼 기록을 남기지 않을 때 |
| `popstate` | 기록 사이를 이동할 때 발생한다. **`pushState`·`replaceState` 호출로는 발생하지 않는다.** `e.state`는 그 항목에 넣어 둔 값이다 |
| `history.state` | 현재 항목의 state. 이전 URL은 읽을 수 없으므로 필요하면 직접 넣어 둔다([[previous-url\|이전 페이지 URL 알아내기]]) |

### 새로고침하면 서버로 간다

`/service`에서 새로고침하거나 그 주소를 직접 열면 **브라우저는 서버에 `/service`를 요청한다.** 서버가 그 경로를 모르면 404다. 그래서 서버가 둘 중 하나를 해야 한다.

| 방법 | 내용 |
| --- | --- |
| SPA 폴백 | 정적 파일이 아닌 모든 경로에 `index.html`을 돌려준다. 그러면 앱이 `location.pathname`을 읽어 그린다. Vite 개발 서버는 기본으로 이렇게 하고, 배포 시에는 호스팅의 rewrite 설정(Nginx `try_files $uri /index.html`, Netlify `_redirects` 등)으로 맞춘다 |
| 같은 URL, 다른 표현 | 서버가 요청의 `Accept` 헤더를 보고, 주소창 요청(`text/html`)에는 완성된 HTML을, 앱의 `fetch`(`application/json`)에는 데이터만 준다. 첫 화면은 서버 렌더링, 이후 이동은 클라이언트 렌더링이 되어 검색 노출에도 유리하다. 오늘날 SSR 프레임워크가 하는 일의 원형이다([[spa-csr-ssr\|SPA와 CSR·SSR]]) |

```javascript
// Express: 같은 경로를 Accept에 따라 다르게 응답
app.get('/service', (req, res) => {
  res.format({
    'text/html': () => res.sendFile(path.join(__dirname, 'public/service.html')),
    'application/json': () => res.json(serviceData),
    default: () => res.status(406).send('Not Acceptable'),
  })
})
```

## Navigation API: History API의 후속

History API는 SPA를 위해 설계된 것이 아니라서, 링크 클릭을 하나하나 가로채야 하고 폼 제출·주소창 입력·`location.href` 대입 같은 다른 이동은 놓치기 쉽다. **Navigation API는 모든 종류의 이동을 `navigation`의 `navigate` 이벤트 하나로 받는다.** 2026년 1월 Baseline(Newly available)이 됐다.

```javascript
navigation.addEventListener('navigate', (event) => {
  if (!event.canIntercept || event.hashChange || event.downloadRequest !== null) return
  const url = new URL(event.destination.url)
  if (!url.pathname.startsWith('/articles/')) return

  event.intercept({
    async handler() {                     // 이동을 같은 문서 안의 렌더링으로 바꾼다
      renderPlaceholder()
      renderArticle(await getArticle(url.pathname))
    },
  })
})
```

- 클릭 리스너·`preventDefault`·`pushState`를 따로 쓸 필요가 없다. `intercept()`가 URL 갱신과 기록 추가를 맡고, 뒤로·앞으로 가기도 같은 `navigate` 이벤트로 온다.
- 핸들러의 Promise가 끝나면 `navigatesuccess`, 실패하면 `navigateerror`가 발생한다. 이동 후 포커스·스크롤 복원도 옵션으로 브라우저에 맡길 수 있다.
- 기록 조작은 `navigation.navigate(url, { state })`, `back()`, `forward()`, `traverseTo(key)`, `reload()`로 하고 각각 `{ committed, finished }` Promise를 돌려준다. 항목별 state는 `navigation.currentEntry.getState()`로 읽는다.
- 최상위 문서나 iframe 하나의 기록만 다루므로, 다른 프레임 기록이 섞이는 History API의 함정이 없다.

새로 짜는 바닐라 라우터는 Navigation API로 쓰고, 오래된 브라우저 지원이 필요하면 History API로 대체한다. 서버 쪽 폴백은 어느 방식이든 똑같이 필요하다.

## 정리

- 클라이언트 라우팅은 **요청 없이 URL을 바꾸고, URL을 보고 화면을 그리는 것**이다.
- 해시 방식은 서버 설정이 필요 없지만 URL이 하나로 묶여 검색 노출에 불리하다.
- History API 방식은 깨끗한 URL을 주지만, 새로고침에 대비해 서버가 모든 경로에 응답해야 한다(`index.html` 폴백이나 SSR).
- `popstate`는 기록 이동에만 발생하고 `pushState` 호출로는 발생하지 않는다.
- Navigation API는 모든 이동을 `navigate` 이벤트 하나로 받아 `intercept()`로 처리하는 History API의 후속이다.

관련 노트: [[spa-csr-ssr|SPA와 CSR·SSR]], [[react-router-layout|React Router: 라우팅 기초와 레이아웃]], [[previous-url|이전 페이지 URL 알아내기]], [[ajax|AJAX와 HTTP 요청]], [[seo-basics|SEO 기초: 크롤링부터 메타 태그까지]]
