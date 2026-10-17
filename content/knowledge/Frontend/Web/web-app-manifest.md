---
title: "웹 앱 매니페스트"
concept: "Web App Manifest"
summary: "웹 앱 매니페스트는 설치된 PWA의 이름·아이콘·시작 URL·표시 방식·색·바로 가기를 정하는 JSON이다. 앱을 식별하는 id, 내비게이션 범위 scope, 마스크 가능 아이콘, display와 display_override의 대체 순서, 설치 화면을 키우는 description·screenshots, iOS가 따로 쓰는 link·meta, 그리고 바뀐 메타데이터가 플랫폼마다 언제 반영되는지 정리한다."
tags: ["frontend", "web", "pwa", "html", "mobile"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/pwa/web-app-manifest", "https://web.dev/learn/pwa/app-design", "https://web.dev/learn/pwa/enhancements", "https://web.dev/learn/pwa/update", "https://web.dev/articles/install-criteria", "https://webkit.org/blog/17333/webkit-features-in-safari-26-0/", "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest"]
---

> web.dev의 「[Learn PWA](https://web.dev/learn/pwa)」 강좌의 웹 앱 매니페스트·앱 디자인·향상 기능·업데이트 모듈을 바탕으로, 지원 범위는 WebKit·MDN 문서로 확인해 재구성한 노트다.

## 매니페스트란

**웹 앱 매니페스트(Web App Manifest)는 앱이 설치됐을 때 어떻게 보이고 동작할지를 브라우저에 알려 주는 JSON 파일이다.** head에서 `<link rel="manifest">`로 거는 방법과 meta 태그 대신 매니페스트를 쓰는 이유는 [[html-head-metadata|문서 head와 메타데이터]]에 있다.

- 앱 하나에 매니페스트 하나. 보통 루트에 두고, **설치할 수 있는 모든 HTML 페이지**에서 링크한다.
- 확장자는 `.webmanifest`를 권장한다. 이름은 자유지만 `application/manifest+json`(또는 JSON 계열 MIME)으로 서빙해야 한다. 옛 앱은 `manifest.json`을 많이 쓴다.
- 모르는 필드는 무시될 뿐 매니페스트가 무효가 되지 않는다.
- Chromium은 DevTools 애플리케이션 > 매니페스트, Firefox는 애플리케이션 탭에서 확인한다. Safari에는 디버깅 화면이 없어 실제로 설치해 본다. 매니페스트가 안 잡히면 파일이 로드되는지, 콘텐츠 유형이 맞는지부터 본다.

```json
{
  "id": "/",
  "name": "레시피 노트",
  "short_name": "레시피",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#1f6feb",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

## 기본 필드

| 필드 | 뜻 | 요점 |
| --- | --- | --- |
| `name` | 앱 전체 이름 | 홈 화면·런처·독·메뉴에 보인다 |
| `short_name` | 짧은 이름 | 12자 안쪽이면 잘리지 않는다 |
| `icons` | 아이콘 목록 | `src`, `type`, `sizes`, 선택 `purpose` |
| `start_url` | 설치된 앱을 켰을 때 여는 URL | 절대 경로 권장. 빠지면 설치한 페이지 URL. 실행 경로 추적용 쿼리를 붙여도 된다 |
| `display` | 표시 방식 | 대부분 `standalone` |
| `id` | 출처 안에서 앱을 식별하는 값 | 없으면 `start_url`이 대신한다 |
| `scope` | 앱의 내비게이션 범위 | 밖으로 나가는 링크는 앱 안 브라우저로 열린다. 서비스 워커 스코프와 별개다 |

### id와 start_url은 함부로 바꾸지 않는다

**브라우저는 `id`(없으면 `start_url`)로 "같은 앱"인지 판단한다.** `id` 없이 `start_url`의 쿼리 하나만 바꿔도 이미 설치된 앱을 다른 앱으로 볼 수 있다. 처음부터 `id`를 명시하고, 그다음에는 바꾸지 않는다. `id`를 바꾸면 새 앱으로 취급된다.

## 아이콘

| 규칙 | 이유 |
| --- | --- |
| 최소 192px와 512px를 준다 | Chrome 설치 기준이다. 1024px까지 주면 고해상도 화면에 좋다. 48·72·96 같은 옛 Android 크기는 필요 없다 |
| 정사각형, 불투명하게 | iOS·iPadOS와 Android 8 이상은 투명 영역을 통제할 수 없는 배경색으로 채운다 |
| 마스크 가능(maskable) 아이콘을 따로 | Android는 원·사각·둥근 사각으로 아이콘을 자른다. 없으면 흰 바탕 위에 작게 줄여 넣는다 |
| 플랫폼 중립적으로 | OS마다 자기 모양 마스크를 씌운다 |

- 마스크 가능 아이콘은 핵심 그림을 **중앙의 반지름 40% 원(safe zone)** 안에 두고, 512px 이상으로 만든다. `"purpose": "maskable"`. 결과가 어색하면 여백을 더 준다.
- 아이콘이 없거나 크기가 안 맞으면 플랫폼에 따라 설치 기준을 못 맞추거나, 화면 캡처나 일반 아이콘으로 대체된다.

## 색과 테마

| 필드 | 쓰이는 곳 | 주의 |
| --- | --- | --- |
| `theme_color` | 데스크톱 제목 표시줄, 모바일 상태 표시줄 | HTML의 `<meta name="theme-color">`가 덮어쓴다 |
| `background_color` | CSS가 로드되기 전 배경, Android 스플래시 | iOS Safari와 대부분의 데스크톱 브라우저는 무시한다 |

```html
<!-- 다크 모드용 테마 색은 meta로 나눈다 -->
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0d1117" media="(prefers-color-scheme: dark)">
```

**색은 단색만 쓴다.** 이름 있는 색, hex, 투명도 없는 `rgb()`·`hsl()`이다. 투명도(`rgba()`), CSS 변수, 그라디언트는 결과가 제각각이다. 폼 컨트롤 색은 매니페스트가 아니라 CSS `accent-color`가 맡는다([[pwa-app-experience|PWA 앱 경험 설계와 창 관리]]).

## 표시 방식: display와 display_override

| 값 | 모양 | 지원 |
| --- | --- | --- |
| `fullscreen` | 상태 표시줄·내비게이션 바까지 숨김. 게임·VR·AR용 | Android만 네이티브로. 데스크톱·iPadOS는 대신 Fullscreen API를 사용자 요청에 맞춰 쓴다 |
| `standalone` | OS 표준 창, 브라우저 UI 없음 | 가장 흔하다. 모든 설치 플랫폼 |
| `minimal-ui` | 뒤로·새로고침 같은 최소 UI | Android·데스크톱. **iOS·iPadOS는 지원하지 않는다** |
| `browser` | 설치한 브라우저의 일반 탭 | 별도 창이 아니다 |

```text
기본 대체 순서: fullscreen → standalone → minimal-ui → browser
display_override: ["window-controls-overlay", "tabbed", "minimal-ui"] 를 먼저 평가하고,
                  지원하는 값이 없으면 display로 내려간다
```

`window-controls-overlay`(제목 표시줄 영역을 앱이 그린다)와 `tabbed`(앱 창 안의 탭) 같은 새 값은 `display`가 아니라 `display_override`에 넣는다. 모르는 브라우저가 앱을 망가뜨리지 않게 하려는 구조다.

## 선택 필드

| 필드 | 용도 |
| --- | --- |
| `lang`, `dir` | 매니페스트 문자열의 언어와 방향. 매니페스트는 다국어를 지원하지 않아 언어별로 다른 파일을 서빙하는 식으로 직접 풀어야 한다 |
| `orientation` | `portrait`, `landscape` 등 원하는 방향 |
| `description`, `screenshots` | Android Chrome에서 둘 다 주면 작은 정보 표시줄 대신 **앱 스토어 같은 큰 설치 대화상자**가 뜬다 |
| `categories`, `iarc_rating_id` | 앱 목록용 분류 힌트와 연령 등급 |
| `shortcuts` | 앱 아이콘 메뉴의 바로 가기(아래) |
| `share_target`, `file_handlers`, `protocol_handlers`, `launch_handler` | OS 통합([[pwa-os-integration\|PWA 기능과 OS 통합]]) |
| `related_applications`, `prefer_related_applications` | 같은 서비스의 스토어 앱과 연결([[pwa-installation\|PWA 설치와 설치 유도]]) |

### 앱 바로 가기(shortcuts)

아이콘을 오른쪽 클릭하거나 길게 누르면 나오는 딥 링크 목록이다. 데스크톱 OS 대부분과 WebAPK로 설치된 Android에서 보인다.

```json
"shortcuts": [
  { "name": "새 레시피", "short_name": "새로", "url": "/new?source=shortcut",
    "icons": [{ "src": "/icons/new-96.png", "sizes": "96x96" }] },
  { "name": "즐겨찾기", "url": "/favorites" }
]
```

- `name`과 `url`(스코프 안)은 필수, `short_name`·`description`·`icons`는 선택이다.
- 몇 개를 보일지, 아이콘을 쓸지는 브라우저가 정한다. Android Chrome은 앞의 몇 개만 보이므로 **중요한 순서로** 넣는다.
- 설치 뒤에는 매니페스트 업데이트가 반영돼야 바뀐다.

## iOS·iPadOS가 따로 쓰는 것

| 대상 | 방법 |
| --- | --- |
| 홈 화면 아이콘 | 매니페스트 `icons`를 쓴다. `<link rel="apple-touch-icon" href="/icons/ios.png">`도 함께 두면 확실하다. Safari 26부터 SVG 아이콘도 된다 |
| 스플래시 화면 | 매니페스트로 만들지 않는다. `<link rel="apple-touch-startup-image" media="...">`로 화면 크기·방향마다 이미지를 따로 준다. 맞는 이미지가 없으면 흰 화면이다 |
| 상태 표시줄 뒤까지 쓰기 | `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`. 상태 표시줄 글자는 늘 흰색이고 테마 색은 무시된다. safe area로 내용을 보호한다 |
| 표시 방식 | `standalone`만 지원한다. `fullscreen`은 standalone으로, `minimal-ui`는 브라우저로 대체된다 |

`apple-mobile-web-app-capable` 같은 옛 meta 태그는 매니페스트 이전의 방식이다. `start_url`·`scope`를 무시하므로 새로 쓰지 않는다. iOS·iPadOS 26부터는 매니페스트가 없어도 홈 화면에 추가한 사이트가 기본으로 웹 앱으로 열리지만, 매니페스트가 있으면 이름·아이콘·시작 URL·범위가 그대로 반영된다.

## 바뀐 메타데이터가 반영되는 시점

| 플랫폼 | 반영 방식 |
| --- | --- |
| 데스크톱 Chrome·Edge | 앱을 켤 때, 브라우저 시작 후 처음이거나 마지막 확인 뒤 24시간이 지났으면 매니페스트를 다시 받는다. 일부 속성은 모든 창을 닫은 뒤 적용된다 |
| Android Chrome(WebAPK) | 앱을 열 때 업데이트 알고리즘이 검사한다. 매니페스트가 404를 주면 최소 30일 동안 다시 확인하지 않는다. `about:webapks`에서 상태 확인·업데이트 요청 |
| Android Samsung Internet(WebAPK) | 새 WebAPK가 만들어지면 Wi-Fi에서 24시간 안에 갱신된다 |
| iOS·iPadOS, 바로 가기형 Android 설치 | 다시 설치해야 바뀐다 |

## 정리

- 매니페스트 하나를 루트에 두고 설치 가능한 모든 페이지에서 링크한다.
- `id`를 처음부터 명시하고 바꾸지 않는다. `start_url`도 함부로 바꾸지 않는다.
- 아이콘은 불투명한 정사각형 192·512px + 마스크 가능 512px.
- 색은 단색만. 다크 모드 테마 색은 meta로 나눈다.
- 새 표시 방식은 `display_override`에, 큰 설치 화면을 원하면 `description`·`screenshots`를 넣는다.
- iOS 스플래시·상태 표시줄은 별도 link·meta로 다룬다.

관련 노트: [[html-head-metadata|문서 head와 메타데이터]], [[pwa-installation|PWA 설치와 설치 유도]], [[pwa-app-experience|PWA 앱 경험 설계와 창 관리]], [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]]
