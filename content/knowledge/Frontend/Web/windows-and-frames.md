---
title: "창과 프레임: 팝업, iframe, postMessage"
concept: "Cross-Window Communication"
summary: "다른 창(팝업)과 프레임(iframe)을 열고 서로 참조하는 법, 동일 출처 정책이 창 사이에서 허용하는 것과 막는 것, sandbox 속성, 출처가 달라도 안전하게 대화하는 postMessage와 같은 출처 탭끼리의 BroadcastChannel, 그리고 내 페이지가 남의 iframe에 갇혀 클릭을 빼앗기는 클릭재킹과 그 방어 헤더까지 정리한다."
tags: ["browser", "security", "javascript", "frontend", "iframe"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/popup-windows", "https://ko.javascript.info/cross-window-communication", "https://ko.javascript.info/clickjacking", "https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage", "https://developer.mozilla.org/en-US/docs/Web/API/Document/domain", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「팝업과 window 메서드」, 「크로스 윈도우 통신」, 「클릭재킹 공격」 글을 바탕으로, 바뀐 브라우저 정책은 MDN으로 확인해 재구성한 노트다.

## 창 사이의 관계

브라우저의 탭, 팝업, `<iframe>`은 각각 **자기 `window`와 `document`를 가진 별개의 브라우징 맥락**이다. 다른 창을 조작하려면 먼저 그 창의 `window` 참조를 얻어야 한다.

| 참조 | 얻는 방법 |
| --- | --- |
| 내가 연 팝업 | `const win = window.open(url, name, features)`의 반환값 |
| 나를 연 창 | 팝업 안에서 `window.opener` (팝업이 아니면 `null`) |
| iframe 안의 창 | `iframe.contentWindow`, `window.frames[0]`, `window.frames.<name>` |
| iframe 안의 문서 | `iframe.contentDocument` (= `contentWindow.document`, 같은 출처일 때만) |
| 나를 품은 창 | `window.parent`(바로 위), `window.top`(맨 위) |

`if (window === window.top)`이면 최상위 창이고, 아니면 어딘가의 프레임 안에서 실행 중이다.

## 동일 출처 정책과 창

**출처(origin)는 프로토콜 + 호스트 + 포트**다. `http://site.com`과 `https://site.com`, `site.com`과 `www.site.com`, `:8080`이 붙은 주소는 모두 다른 출처다. 출처 정의와 CORS는 [[cors|CORS]]에 있다.

| 두 창의 출처 | 할 수 있는 것 |
| --- | --- |
| 같다 | 서로의 변수, `document`, DOM을 **마음대로** 읽고 고친다 |
| 다르다 | 상대 창 참조(`contentWindow`)를 얻는 것, **`location`에 쓰기**(다른 주소로 보내기), `postMessage`, `close()` 정도만 된다. `location` 읽기, `document` 접근은 `SecurityError` |

위치를 바꾸는 건 되지만 읽는 건 안 되는 이유는, 읽기를 허용하면 사용자가 지금 어디를 보고 있는지 새어 나가기 때문이다.

과거에는 `a.site.com`과 `b.site.com`이 둘 다 `document.domain = 'site.com'`을 실행해 같은 출처로 취급받을 수 있었다. 이 setter는 **폐기 예정**이고, 크롬은 기본으로 출처 단위로 격리해 이 대입이 효과가 없다. 서브도메인끼리의 통신은 `postMessage`로 한다.

### iframe의 「잘못된 document」 함정

iframe은 만들어지는 순간 빈 `about:blank` 문서를 갖고 있다가, `src`가 로드되면 **다른 document 객체로 바뀐다.** 로드 전에 `iframe.contentDocument`에 건 핸들러나 DOM 변경은 사라진다. 같은 출처 iframe의 문서를 다룰 때는 `iframe.onload`(= 내부 창의 `load`) 이후에 접근한다. 출처가 다른 iframe은 `contentWindow.onload`에 접근할 수 없으므로 iframe 요소의 `load` 이벤트를 쓴다.

## 팝업: window.open

```javascript
const popup = window.open('/auth/start', 'auth', 'popup,width=500,height=600')
if (!popup) showMessage('팝업이 차단됐다') // 차단되면 null
```

| 인자 | 의미 |
| --- | --- |
| `url` | 열 주소. `about:blank`로 열고 내용을 써 넣을 수도 있다 |
| `name` | 창 이름. 같은 이름의 창이 있으면 새로 열지 않고 그 창에서 연다 |
| `features` | `width`, `height`, `left`, `top`, `popup`, `noopener`, `noreferrer`를 쉼표로(공백 없이) 잇는다. 생략하면 대부분 **새 탭**으로 열리고, 크기나 `popup`을 주면 별도 창이 된다 |

- **사용자 동작(클릭 등) 밖에서 부르면 차단된다.** 클릭 핸들러 안에서 바로 연다. `await` 뒤에 열면 사용자 활성화가 만료돼 막힐 수 있으므로, 비동기 작업이 필요하면 먼저 빈 창을 열고 나중에 `popup.location`을 바꾼다.
- 브라우저는 화면 밖 위치, 너무 작은 크기, 주소창 숨기기 같은 기능을 무시하거나 고친다. 메뉴·툴바 옵션은 대부분 효과가 없다.
- 열린 직후의 팝업은 아직 `about:blank`다. 같은 출처면 `popup.onload` 이후에 DOM을 고친다.
- 닫기는 `popup.close()`, 닫혔는지는 `popup.closed`. 사용자가 언제든 닫을 수 있으므로 코드는 늘 `closed`를 확인한다. `window.close()`는 스크립트가 연 창에서만 동작한다.
- `moveTo`·`resizeTo`·`focus()`·`blur()`는 남용 탓에 강하게 제한된다. 내가 연 팝업 창에서만 기대할 수 있고 모바일·탭에서는 대개 무시된다.

### 지금 팝업을 쓰는 곳

화면 안 모달과 `fetch`로 대신할 수 있어 팝업은 드물다. 지금 남은 대표 용도는 **소셜 로그인·결제 같은 제3자 인증 창**이다. 별도 창이라 제3자 페이지가 내 페이지의 JS 환경과 섞이지 않고, 사용자는 진짜 제공자의 주소창을 확인할 수 있다. 흐름은 [[oauth2|OAuth 2.0]]에 있다. 팝업이 끝나면 결과를 `opener.postMessage`로 돌려보내거나, 같은 출처로 리다이렉트된 팝업이 `BroadcastChannel`로 알린다.

### opener의 위험과 COOP

새로 열린 창은 `window.opener.location`을 바꿀 수 있어서, 악성 페이지가 원래 탭을 피싱 페이지로 바꿔치기할 수 있다(tabnabbing). 지금 브라우저는 `target="_blank"` 링크에 `noopener`를 기본 적용한다([[html|HTML 기초와 HTML5]]의 「링크의 target과 rel」).

서버는 **`Cross-Origin-Opener-Policy`(COOP)** 응답 헤더로 다른 출처 창과의 opener 관계를 끊는다. `same-origin`은 다른 출처 팝업과 서로 참조를 못 하게 하고, `same-origin-allow-popups`는 내가 연 팝업과의 관계만 남긴다. OAuth 팝업이 `opener`로 결과를 돌려줘야 한다면 `same-origin-allow-popups`를 쓴다. COOP는 `SharedArrayBuffer`를 쓰는 데 필요한 교차 출처 격리의 조건이기도 하다.

## sandbox 속성

`<iframe sandbox>`는 iframe 안의 콘텐츠에 **제한을 더한다.** 값 없이 쓰면 가장 엄격하고, 풀 제한만 공백으로 나열한다.

| 기본으로 막히는 것 | 푸는 토큰 |
| --- | --- |
| 같은 사이트 주소여도 **다른 출처로 취급** | `allow-same-origin` |
| 스크립트 실행 | `allow-scripts` |
| 폼 제출 | `allow-forms` |
| 팝업 열기 | `allow-popups` |
| 최상위 창(`top.location`) 이동 | `allow-top-navigation` (사용자 클릭 때만은 `allow-top-navigation-by-user-activation`) |

- sandbox는 제한을 **더할 뿐**, 다른 출처 iframe에 대한 동일 출처 제한을 풀 수는 없다.
- 사용자가 올린 HTML, 광고, 미리보기처럼 **믿을 수 없는 콘텐츠를 같은 사이트에서 보여 줄 때** 쓴다.
- `allow-scripts`와 `allow-same-origin`을 같은 출처 문서에 함께 주면 iframe 안의 스크립트가 sandbox 속성 자체를 지울 수 있어 의미가 없어진다.

## postMessage: 출처를 넘는 대화

`postMessage`는 **출처가 달라도 양쪽이 동의한 경우에만** 메시지를 주고받게 한다. 동일 출처 정책을 우회하지만 양쪽 코드가 모두 참여해야 하므로 안전하다.

```javascript
// 보내는 쪽: 받을 창의 출처를 꼭 지정한다
iframe.contentWindow.postMessage({ type: 'resize', height: 480 }, 'https://widget.example.com')

// 받는 쪽: 보낸 쪽 출처를 꼭 확인한다
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://app.example.com') return // 모르는 출처는 무시
  const { type, height } = event.data                     // 구조화된 복제로 받은 사본
  event.source.postMessage({ type: 'ack' }, event.origin) // 보낸 창에 답장
})
```

| 요소 | 의미 | 보안 규칙 |
| --- | --- | --- |
| `targetOrigin` (2번째 인자) | 받는 창이 이 출처일 때만 전달한다 | 받는 창은 그 사이 다른 사이트로 이동했을 수 있다. 민감한 데이터는 `'*'` 대신 **정확한 출처**를 준다 |
| `event.origin` | 보낸 창의 출처 | 아무 페이지나 내 창에 메시지를 보낼 수 있다. **항상 허용 목록과 비교**한다 |
| `event.data` | 보낸 값의 사본 | 객체·배열·`Map`·`Blob` 등 구조화된 복제가 되는 값. 함수·DOM 노드는 안 된다. 받은 값을 `innerHTML`에 넣지 않는다 |
| `event.source` | 보낸 창의 참조 | 답장할 때 쓴다 |

- 세 번째 인자로 `ArrayBuffer`·`MessagePort` 같은 Transferable을 넘기면 복사하지 않고 소유권을 옮긴다. 워커와의 `postMessage`도 같은 규칙이다([[web-workers|웹 워커]]).
- `MessageChannel`은 두 포트를 만들어 한 쌍의 창(또는 워커) 사이에 전용 통로를 연다. 매번 출처를 확인하지 않아도 된다.

### 같은 출처 탭끼리: BroadcastChannel

창 참조 없이 **같은 출처의 모든 탭·iframe·워커**에 알릴 때는 `BroadcastChannel`을 쓴다. 로그아웃을 모든 탭에 퍼뜨리거나 다른 탭의 장바구니 갱신을 알릴 때 쓴다. localStorage의 `storage` 이벤트와 달리 임의의 구조화된 값을 보낸다.

```javascript
const channel = new BroadcastChannel('auth')
channel.postMessage({ type: 'logout' })                 // 보낸 탭 자신에는 오지 않는다
channel.onmessage = ({ data }) => { if (data.type === 'logout') location.assign('/login') }
```

## 클릭재킹: 남의 iframe에 갇힌 내 페이지

**클릭재킹(clickjacking)** 은 악성 페이지가 내 사이트를 **투명한 iframe**으로 덮어 두고, 사용자가 미끼 버튼을 누른다고 믿게 해 실제로는 내 사이트의 버튼(좋아요, 팔로우, 결제, 권한 허용)을 누르게 하는 공격이다. 사용자가 내 사이트에 로그인돼 있으면 그 클릭은 정상 요청이 된다.

```text
악성 페이지
 ├─ <button>지금 받기!</button>            ← 사용자가 보는 것
 └─ <iframe src="victim.com/settings"      ← opacity: 0, z-index로 버튼 위에 정렬
           style="opacity:0">               ← 실제로 클릭을 받는 것
```

키보드 입력은 가로채기 어렵다(입력한 글자가 보이지 않으면 사용자가 멈춘다). 공격은 주로 **클릭 한 번**이 위험한 동작에 노린다.

### 방어

| 방법 | 효과 | 판단 |
| --- | --- | --- |
| `Content-Security-Policy: frame-ancestors 'none'` (또는 `'self'`, 허용 출처 목록) | 어떤 출처가 내 페이지를 프레임에 넣을 수 있는지 정한다 | **표준 방어.** 여러 출처를 허용 목록으로 줄 수 있다 |
| `X-Frame-Options: DENY` 또는 `SAMEORIGIN` | 프레임 표시를 막거나 같은 출처만 허용 | 옛 브라우저 호환용으로 함께 보낸다. `ALLOW-FROM`은 폐기됐고, 둘 다 있으면 브라우저는 `frame-ancestors`를 따른다 |
| `SameSite=Lax`/`Strict` 인증 쿠키 | 다른 사이트의 iframe 안에서는 쿠키가 안 실려 로그인 상태가 아니게 된다 | 쿠키 인증 사이트에 보조 방어. 쿠키를 안 쓰는 동작(IP로 중복 투표를 막는 설문 등)은 보호하지 못한다 |
| 프레임버스팅 JS (`if (top !== window) top.location = location`) | 프레임에서 빠져나오려 한다 | **약하다.** 공격 페이지가 `beforeunload`로 이동을 막거나 `sandbox`로 최상위 이동을 금지하면 무력화된다 |

두 헤더 모두 **HTTP 응답 헤더로만** 동작한다. `<meta http-equiv>`로 넣은 `X-Frame-Options`와 `frame-ancestors`는 무시된다. 다른 사이트의 임베드를 허용해야 하는 페이지(위젯 등)는 허용 출처만 `frame-ancestors`에 적고, 위험한 동작은 확인 단계를 두거나 새 창에서 하게 한다. 쿠키 속성은 [[cookie-session|쿠키와 세션]], 그 밖의 웹 공격은 [[web-security|웹 보안: CSRF와 XSS]]에 있다.

## 정리

- 창·프레임은 각자 `window`를 가진다. `open`의 반환값, `opener`, `contentWindow`, `parent`·`top`으로 서로를 잡는다.
- **같은 출처면 무엇이든, 다른 출처면 `location` 쓰기와 `postMessage`만** 된다. `document.domain` 우회는 끝났다.
- 팝업은 사용자 클릭 안에서 열고, `closed`를 확인한다. 주 용도는 제3자 인증 창이다. opener 관계는 COOP로 관리한다.
- `postMessage`는 보낼 때 `targetOrigin`, 받을 때 `event.origin`을 **반드시** 확인한다. 같은 출처 탭 방송은 `BroadcastChannel`.
- 내 페이지는 `frame-ancestors`(+ `X-Frame-Options`)로 남의 프레임에 갇히지 않게 한다. 남의 콘텐츠는 `sandbox` iframe에 가둔다.

관련 노트: [[cors|CORS]], [[web-security|웹 보안: CSRF와 XSS]], [[cookie-session|쿠키와 세션]], [[oauth2|OAuth 2.0]], [[html|HTML 기초와 HTML5]], [[web-workers|웹 워커로 메인 스레드 비우기]]
