---
title: "PWA 앱 경험 설계와 창 관리"
concept: "App-like UX"
summary: "설치된 PWA는 브라우저 탭이 아니라 자기 창을 가진다. 200×100px 미니 모드까지 견디는 반응형·점진적 향상의 기초와 오프라인을 기본 상태로 보는 오프라인 우선 원칙(마지막 상태 지키기, 동작 큐, 충돌 해결) 위에, display-mode 미디어 쿼리, 창 제목, 선택·당겨서 새로고침·safe area 같은 앱다운 CSS를 더한다. 스코프 밖 링크가 여는 앱 안 브라우저와 OAuth 흐름, 창 이동·크기·새 창, 제목 표시줄 오버레이, 여러 화면 배치, 화면 꺼짐 방지, 가상 키보드 API까지 정리한다."
tags: ["frontend", "web", "pwa", "css", "ux", "mobile"]
source: other
date: "2026-10-21"
sources: ["https://web.dev/learn/pwa/foundations", "https://web.dev/learn/pwa/app-design", "https://web.dev/learn/pwa/windows", "https://web.dev/learn/pwa/getting-started", "https://web.dev/learn/pwa/enhancements", "https://design.google/library/offline-design/", "https://alistapart.com/article/offline-first", "http://hood.ie/blog/say-hello-to-offline-first.html"]
---

> web.dev의 「[Learn PWA](https://web.dev/learn/pwa)」 강좌의 기초·앱 디자인·창 관리 모듈을 바탕으로 재구성한 노트다. 오프라인 상태 UI는 Google Design의 「[Designing for Offline](https://design.google/library/offline-design/)」으로, 오프라인 우선 원칙은 A List Apart의 「[Designing Offline-First Web Apps](https://alistapart.com/article/offline-first)」(2013)와 Hoodie의 「[Say Hello to Offline First](http://hood.ie/blog/say-hello-to-offline-first.html)」(2013)로 보강했다.

## 기초: 모든 맥락을 먼저 생각한다

PWA는 결국 웹사이트라서 기초가 같다. 다만 **설치되면 창 크기와 맥락을 앱이 통제하지 못한다**는 점이 더 두드러진다.

| 원칙 | PWA에서의 의미 |
| --- | --- |
| 모바일은 집중하게 만드는 제약 | 화면마다 핵심 콘텐츠와 동작만 둔다. 화면이 넓다고 기능을 더 얹지 않는다 |
| 콘텐츠 우선 | 주식 시세 앱의 핵심은 「종목과 가격 표 + 새로고침 링크」다. 실시간 갱신·그래프는 그 위에 얹는다 |
| 점진적 향상 | 표준 HTML·CSS·JS로 핵심을 만들고, 기능 감지(`@supports`, `'x' in navigator`)로 층을 더한다. UA로 기기를 추측하지 않는다([[css-progressive-enhancement\|CSS 점진적 향상]]) |
| 내재적 디자인 | 픽셀이 아니라 콘텐츠 크기·글자 크기·남은 공간에 따른 규칙을 Grid·Flexbox로 쓴다 |
| 빠르고 좋은 경험 | 실사용자 데이터로 LCP·INP·CLS를 잰다([[web-vitals\|웹 성능 지표와 Lighthouse]]) |

**화면 크기로 사용자를 추측하지 않는다.** 320px라고 터치폰이 아니고, 데스크톱 PWA는 다른 작업 옆 좁은 창에 떠 있을 수 있다. 설치된 데스크톱 PWA는 **200×100 CSS 픽셀**까지 줄어든다. 어떤 모바일 뷰포트보다 작다. 이 **미니 모드**를 새 브레이크포인트로 보고 재생 컨트롤, 요약 수치, 빠른 동작만 보여 준다. 폴더블, 태블릿이 된 노트북, 독에 꽂은 휴대폰까지 하나의 디자인이 흘러가야 한다. 반응형 기법은 [[responsive-design|반응형 디자인]]에 있다.

## 오프라인 우선 설계와 상태 UI

모바일에서 연결이 끊기는 것은 예외가 아니라 일상적인 상태다(지하철, 비행기, 붐비는 행사장, 로밍). 통신비가 소득에서 큰 비중을 차지하거나 연결이 자주 끊기는 지역에서는 더 그렇다. 모바일 우선처럼 오프라인을 기본 상태로 놓고 설계하는 접근을 **오프라인 우선(Offline First)** 이라 한다. 데이터를 브라우저 저장소에 먼저 쓰고 서버와는 뒤에서 동기화한다. 그래서 오프라인 지원은 캐시 전략만으로 끝나지 않는다. 연결이 끊기거나 느린 상황을 사용자가 알고, 기다리고, 미리 대비할 수 있게 화면이 알려 줘야 한다. 연결 문제가 생기는 지점은 두 곳이다. 클라이언트가 보내는 쪽(push)과 서버에서 받는 쪽(pull 또는 server push)이다.

### 원칙

| 원칙 | 하지 않는다 | 한다 |
| --- | --- | --- |
| 마지막 상태를 지킨다 | 새 피드를 받으려고 옛 데이터를 먼저 비웠다가, 실패해 빈 화면을 띄운다 | 옛 데이터를 그대로 두고 「최신이 아닐 수 있다」고 알린다. 수정은 못 해도 읽기·복사는 되게 둔다 |
| 끊김을 오류로 다루지 않는다 | 검색·전송·업로드를 「실패」로 끝낸다. 오프라인 화면을 오류 페이지로만 둔다 | 동작을 **큐에 넣고** 「연결되면 보낼게요」 같은 한 줄 알림(스낵바)을 띄우고, 연결이 돌아오면 완료를 알린다. 버튼 문구도 상태에 맞게 바꾼다(「저장」 → 「기기에 저장」). 오프라인 화면에는 받아 둔 콘텐츠나 간단한 놀거리를 둬 기다림을 가치 있게 만든다 |
| 안 되는 기능만 막는다 | 앱 전체를 오버레이로 덮는다 | 오프라인에서 못 하는 기능만 비활성화하거나 숨기고, 나머지는 쓰게 한다 |
| 충돌을 사람이 풀 수 있게 한다 | 두 판을 이어 붙여 사용자가 직접 정리하게 한다 | 두 판의 차이를 나란히 보여 주고 바뀐 곳마다 받아들일지 고르게 한다 |
| 늦게 온 데이터의 자리를 알린다 | 동기화된 순서대로 끼워 넣어 시간 순서를 흐트러뜨리거나, 눈에 띄지 않는 과거 위치에 조용히 넣는다 | 시간 순서를 지키되 새로 도착한 항목이 어디에 들어갔는지 표시한다 |
| 미리 받아 둔다 | 필요할 때마다 받는다 | 와이파이일 때 다음에 쓸 가능성이 큰 작은 데이터를 미리 캐시한다. 큰 것은 사용자가 고르게 한다 |

이메일의 받은편지함·보낸편지함이 오래된 모범이다. 오프라인에서 쓴 메일은 보낼 편지함에 쌓였다가 연결되면 나가고, 받은 메일은 로컬 사본으로 늘 볼 수 있다. 메일은 수정되지 않는 항목이라 충돌이 없어 쉬운 경우다. 함께 고치는 문서나 지도 마커처럼 바뀌는 데이터는 충돌 해결이 설계의 중심이 된다([[collaborative-editing|협업 편집]]). 기술적으로 막을 수 없는 충돌은 위험을 알리는 것으로 대신한다. 재고가 적고 기기가 오프라인이면 「확인해 보겠다」고 답하게 안내하는 식이다.

### 상황별로 화면이 할 일

| 상황 | 화면이 할 일 |
| --- | --- |
| 기기가 오프라인 | 「인터넷 연결 없음」처럼 **글로** 알린다. 아이콘만으로는 부족하다 |
| 콘텐츠를 오프라인용으로 받아 둠 | 그 항목에 오프라인 표시(아이콘 + 「오프라인」 레이블)를 단다. 받아 둔 것만 모아 보는 곳을 홈 탭처럼 찾기 쉬운 자리에 둔다 |
| 내려받기 전 | 파일 크기를 보여 줘 데이터 비용을 판단하게 한다 |
| 내려받는 중 | 남은 시간을 보여 주고 일시 정지·취소를 허용한다. 끝나면 완료를 분명히 알린다 |
| 저장 공간 | 받아 둔 항목을 쉽게 지우게 하고, 지우면 얼마나 비는지 보여 준다 |

연결 상태는 `navigator.onLine`과 `online`·`offline` 이벤트로 감지하되, `true`가 실제 인터넷 연결을 보장하지는 않으므로 요청 실패도 함께 처리한다. 동작을 큐에 넣었다가 보내는 구현은 [[pwa-offline-storage|PWA 오프라인 저장]]의 Background Sync에 있다.

## 창과 아이콘

| 플랫폼 | 창 |
| --- | --- |
| iPhone | 늘 화면 전체 |
| Android, iPad | 보통 전체 화면, 분할 화면 가능. 앱 인스턴스는 하나 |
| 데스크톱 | 여러 창을 열고, 크기를 바꾸고, 겹칠 수 있다 |

아이콘은 홈 화면, 런처, 시작 메뉴, 독·작업 표시줄·멀티태스킹 화면에 보인다. OS마다 모양 마스크를 씌우므로 플랫폼 중립적으로 그린다. 이름·아이콘·색·표시 방식은 [[web-app-manifest|웹 앱 매니페스트]]가 정한다. CSS는 창 안의 내용만 꾸민다.

## display-mode로 맥락에 맞추기

```css
/* 브라우저 탭에서만: 설치 안내 */
@media (display-mode: browser) { .install-hint { display: block; } }

/* 설치된 앱 창에서만: 브라우저 뒤로 가기 버튼이 없으니 앱 안에 둔다 */
@media (display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui) {
  .app-back-button { display: inline-flex; }
}
```

`prefers-color-scheme`로 다크·라이트 모드를, `prefers-reduced-motion`으로 전환·애니메이션 줄이기를 함께 지원한다. 앱 창에서는 OS 설정과 어긋난 화면이 더 눈에 띈다.

## 창 제목은 UI다

`<title>`은 데스크톱 PWA의 제목 표시줄, Alt-Tab 같은 창 전환기, 작업 관리자에 그대로 보인다. SPA는 라우트가 바뀔 때마다 `document.title`을 갱신한다. 피싱 방지를 위해 일부 브라우저는 제목에 앱 이름이 없으면 앞에 붙이고, 제목이 바뀌면 잠깐 출처를 보여 준다.

## 앱다운 CSS

| 웹 기본 동작 | 앱에서의 문제 | 처리 |
| --- | --- | --- |
| 모든 글자가 선택된다 | 메뉴·버튼을 길게 누르면 선택 표시가 뜬다 | UI 요소에만 `user-select: none`(필요하면 `-webkit-` 접두어). 콘텐츠의 선택은 접근성 때문에 남긴다 |
| 폼 컨트롤 기본색 | 브랜드와 어긋난다 | `accent-color: <브랜드색>` |
| 웹 폰트 | 시스템 대화상자·알림 문구가 OS와 다르게 보인다 | `font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| 당겨서 새로고침 | Android Chrome은 standalone 앱에서도 동작해 실수로 새로고침된다 | 앱이 자체 새로고침을 줄 때 `body { overscroll-behavior-y: contain; }` |
| 사각형이 아닌 화면 | 노치·둥근 모서리에 내용이 가려진다 | 아래 safe area |

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

```css
header {
  padding-top: env(safe-area-inset-top);
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}
```

`viewport-fit=cover`는 화면 전체를 쓰게 하는 대신 노치 뒤까지 내용을 깐다. **중요한 내용과 누를 수 있는 요소는 `safe-area-inset-*` 안쪽에 둔다.** 브라우저 기본 동작을 덮어쓸 때의 원칙은 [[respect-browser-defaults|브라우저 기본 동작을 존중하기]], 스크롤 연쇄는 [[css-overflow-scroll|CSS 오버플로와 스크롤]]을 본다.

## 스코프 밖으로 나가는 링크

매니페스트 `scope` 밖의 URL로 가면 PWA 창 위에 **앱 안 브라우저(in-app browser)** 가 뜬다.

- 출처를 보여 주는 고정 주소 표시줄, 제목, 메뉴가 있고 보통 `theme_color`로 칠해진다.
- 메뉴로 시스템 브라우저에서 열 수 있고, 닫거나 뒤로 가면 앱으로 돌아온다.
- iOS·iPadOS에서는 `SFSafariViewController`를 쓴다. PWA의 저장소와 분리돼 있다.
- 다른 출처는 저장소·권한이 따로라 같은 앱의 서브도메인도 이렇게 열린다([[pwa-offline-storage|PWA 오프라인 데이터와 저장소 관리]]).

### OAuth 같은 로그인 흐름

```text
PWA에서 로그인 클릭
  └─ 스코프 밖 인증 서버로 이동 → 앱 안 브라우저가 열린다 (사용자는 언제든 취소 가능)
       └─ 로그인 성공 → 인증 서버가 PWA 출처의 콜백 URL로 리다이렉트
            └─ 스코프 안 URL에 닿으면 앱 안 브라우저가 닫힌다
                 └─ 메인 PWA 창이 그 URL로 이동해 토큰을 저장하고 렌더링
```

OAuth 자체의 흐름은 [[oauth2|OAuth 2.0]]에 있다. 시스템 브라우저로 강제로 여는 `target="_blank"`나 `window.open(url, '_blank')`는 데스크톱 PWA에서만 기대대로 동작한다.

## 창 다루기 (데스크톱)

| API | 하는 일 | 주의 |
| --- | --- | --- |
| `window.moveTo(x, y)`, `resizeTo(w, h)`, `moveBy`, `resizeBy` | 창 위치·크기 변경 | 브라우저 탭에서는 막힌다. `display-mode: browser`가 아닐 때만 부른다. 모바일에서는 효과가 없다 |
| `resize` 이벤트, `window.screenX/Y` | 크기 변화 감지, 위치 읽기 | 창 이동 이벤트는 없어 위치는 폴링한다 |
| `window.open('/', name, 'width=600,height=600')` | 같은 PWA의 새 창 | 이름이 같으면 그 창을 재사용한다. iOS·iPadOS는 `null`을 돌려주고 아무것도 열지 않는다. Android는 스코프 안 URL도 앱 안 브라우저로 연다 |

- 설치 후 첫 실행 창은 화면의 일정 비율(최대 1920×1080)로 왼쪽 위에 뜨고, 이후에는 사용자가 마지막으로 둔 크기·위치를 기억한다. **매니페스트로 창 크기를 정할 수는 없다.**
- 사용자는 파일 > 새 창으로 여러 창을 열 수 있다. 각 창은 탭처럼 따로 이동한다.

| 기능 | 하는 일 | 상태 |
| --- | --- | --- |
| 제목 표시줄 오버레이(Window Controls Overlay) | 창 조작 버튼 옆 제목 표시줄 영역을 HTML·CSS로 그린다. `display_override`에 `window-controls-overlay` | 데스크톱 Chromium |
| 탭 모드(`tabbed`) | 한 앱 창 안에 브라우저 같은 탭 | 실험적, 데스크톱 Chromium |
| 창 관리 API(`getScreenDetails()`) | 연결된 화면 목록·주 화면 여부·라벨을 읽어 화면별로 창 배치. 권한이 필요하다. `screenschange`, `currentscreenchange` 이벤트 | Chromium. 발표 도구(발표자 노트와 슬라이드 분리), 트레이딩 화면에 쓴다 |
| 화면 꺼짐 방지(`navigator.wakeLock.request()`) | 레시피를 따라 할 때처럼 화면이 꺼지지 않게 한다. `release` 이벤트로 해제 감지 | 주요 브라우저 |
| 가상 키보드 API(`navigator.virtualKeyboard`) | `overlaysContent = true`로 키보드가 내용을 밀지 않게 하고, `geometrychange` 이벤트와 CSS `env(keyboard-inset-height)`로 레이아웃을 맞춘다. 편집 요소의 `virtualkeyboardpolicy="manual"`과 `show()`·`hide()` | Chromium |

## 정리

- 화면 크기로 기기를 추측하지 않는다. 200×100px 미니 모드부터 큰 화면까지 콘텐츠 규칙으로 흐르게 한다.
- 오프라인은 오류가 아니라 기본 상태다. 마지막 데이터를 지키고, 동작은 큐에 넣고, 못 하는 기능만 막고, 충돌과 늦게 온 데이터를 사람이 알아보게 한다.
- `display-mode` 미디어 쿼리로 탭과 앱 창의 UI를 나눈다. 앱 창에는 뒤로 가기를 직접 둔다.
- 창 제목, UI 요소의 선택 막기, `accent-color`, 당겨서 새로고침, safe area를 챙겨 앱답게 만든다. 콘텐츠의 기본 동작은 남긴다.
- 스코프 밖 링크는 앱 안 브라우저로 열린다. 로그인은 콜백 URL이 스코프 안으로 돌아오게 설계한다.
- 창 이동·새 창·제목 표시줄·여러 화면 API는 데스크톱 중심이고, 모바일·iOS에서는 동작하지 않는다고 가정한다.

관련 노트: [[web-app-manifest|웹 앱 매니페스트]], [[pwa-installation|PWA 설치와 설치 유도]], [[respect-browser-defaults|브라우저 기본 동작을 존중하기]], [[responsive-design|반응형 디자인과 다국어 타이포그래피]], [[oauth2|OAuth 2.0]]
