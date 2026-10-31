---
title: "문서 head와 메타데이터"
concept: "HTML head"
summary: "<head>는 화면에 보이지 않지만 인코딩·제목·뷰포트·스타일·스크립트·아이콘·대체 버전·대표 URL·검색과 SNS 미리보기 정보를 모두 담는다. 모든 페이지에 넣을 다섯 줄, 성능을 위한 요소 순서, link의 rel 종류, meta의 세 갈래(charset·http-equiv·name)와 이제 쓰지 않는 태그, Open Graph와 SEO의 관계, 미리보기가 안 나오는 이유, base의 함정, 웹 앱 매니페스트로 정리한다."
tags: ["html", "frontend", "web", "seo", "performance"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/html/document-structure", "https://web.dev/learn/html/metadata", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta", "https://www.youtube.com/watch?v=Bat8HyGzkU8", "https://ogp.me/", "https://developers.google.com/search/docs/crawling-indexing/special-tags", "https://developers.google.com/search/docs/appearance/site-names", "https://htmlhead.dev/", "https://rviscomi.github.io/capo.js/user/rules/"]
---

> web.dev의 「[Learn HTML](https://web.dev/learn/html)」 강좌 중 「Document structure」와 「Metadata」 모듈을 바탕으로, 브라우저 지원은 MDN으로 확인해 재구성한 노트다. 「Open Graph와 SEO」는 freeCodeCamp Concepts의 「[What is the role of the Open graph tags and how does it affect SEO?](https://www.youtube.com/watch?v=Bat8HyGzkU8)」(2025.04)를 바탕으로 [Open Graph 프로토콜](https://ogp.me/)과 Google 검색 센터 문서로 확인해 보강했다. 요소 순서와 meta·link 목록은 Josh Buchea의 「[HEAD: A Guide to HTML <head> Elements](https://htmlhead.dev/)」를 바탕으로, 순서 규칙은 [capo.js](https://rviscomi.github.io/capo.js/user/rules/)로 확인해 보강했다.

## head가 하는 일

`<head>`는 **문서에 대한 정보(메타데이터)** 를 담는 곳이다. 사용자 에이전트 스타일시트가 `display: none`으로 숨기므로 화면에는 나오지 않는다. 그래도 브라우저 탭, 검색 결과, SNS 공유 카드, 홈 화면 아이콘, 렌더링 방식이 모두 여기서 정해진다. `<title>`, `<link>`, `<style>`, `<script>`, `<base>`도 넓게 보면 모두 메타데이터이고, 이 요소들로 표현하지 못하는 나머지를 `<meta>`가 맡는다.

## 모든 페이지에 넣는 다섯 줄

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>페이지마다 다른 제목 - 사이트 이름</title>
  </head>
  <body>…</body>
</html>
```

| 줄 | 이유 |
| --- | --- |
| `<!DOCTYPE html>` | 표준 모드로 렌더링한다. 없으면 쿼크 모드다(→ [[html\|HTML 기초와 HTML5]]의 「DOCTYPE과 렌더링 모드」) |
| `<html lang>` | 문서의 기본 언어. 스크린 리더 발음, 번역, 검색, `<q>`의 따옴표 모양이 이 값을 따른다(→ [[multilingual-pages\|다국어 페이지]]) |
| `<meta charset="utf-8">` | **head의 맨 처음**에 둔다. 표준상 문서의 **첫 1024바이트 안**에 있어야 하고, 제목을 읽기 전에 인코딩이 정해져야 글자가 깨지지 않는다. 브라우저 기본값은 지역에 따라 `windows-1252` 등이라 생략하면 위험하다 |
| `<meta name="viewport">` | 모바일 브라우저가 데스크톱 폭으로 그린 뒤 축소하지 않게 한다. `maximum-scale=1`이나 `user-scalable=no`로 **확대를 막지 않는다**(Lighthouse 접근성 감사 항목) |
| `<title>` | 탭, 방문 기록, 북마크, 검색 결과의 제목. 페이지마다 다르게 쓴다 |

`<html>`, `<head>`, `<body>` 태그를 빼도 파서가 요소를 만들어 넣지만, `lang`을 달려면 `<html>`은 직접 써야 한다.

`<head>`에 올 수 있는 요소는 `meta`, `link`, `title`, `style`, `script`, `noscript`, `base`뿐이다. 그 밖의 요소가 나오면 파서는 head를 닫고 body를 시작한 것으로 본다.

## 요소 순서

검색·SNS용 meta는 어디에 두어도 결과가 같지만, **불러오기와 렌더링에 관여하는 요소는 순서가 성능을 바꾼다.** 브라우저는 head를 위에서부터 읽으며 자원 요청을 시작하므로, 먼저 필요한 것을 앞에 둔다.

| 순서 | 요소 | 이유 |
| --- | --- | --- |
| 1 | `<meta charset>`, `viewport`, `<base>`, CSP `http-equiv` | 문서를 어떻게 해석할지 정하는 지시. CSP meta는 **자기 뒤에 선언된 자원에만** 적용되므로 자원보다 앞에 둔다 |
| 2 | `<title>` | 인코딩이 정해진 뒤 바로. 탭에 제목이 빨리 뜬다 |
| 3 | `preconnect`, 중요한 `preload` | 핵심 자원의 연결·다운로드를 먼저 시작한다 |
| 4 | `<script async>` | 파싱을 막지 않으니 일찍 받기 시작한다 |
| 5 | 동기 `<script>` → `<link rel="stylesheet">`·`<style>` | 렌더링을 막는 자원. 스타일보다 동기 스크립트를 먼저 두어야 스타일시트를 기다리느라 스크립트 실행이 밀리지 않는다 |
| 6 | 나머지 `preload`, `<script defer>` | 지금 화면에 필요하지만 급하지 않은 것 |
| 7 | `prefetch`, `dns-prefetch`, Speculation Rules | 다음 페이지용. 현재 페이지 자원과 대역폭을 다투지 않게 뒤로 |
| 8 | `description`, Open Graph, 아이콘, `canonical`, 매니페스트 | 로딩·렌더링에 영향이 없다 |

이 순서는 Rick Viscomi의 [capo.js](https://rviscomi.github.io/capo.js/)가 정리한 규칙과 같다. capo.js는 실제 페이지의 head를 이 기준으로 검사해 순서가 어긋난 요소를 보여 준다. 스크립트와 스타일이 서로를 어떻게 막는지는 [[script-loading|스크립트·스타일 로딩 순서와 점진적 렌더링]]에 있다.

## link: 외부 자원과의 관계

`<link>`의 `rel`은 현재 문서와 연결한 자원의 **관계**를 뜻한다. `rel`이 없으면 아무 일도 일어나지 않는다.

| `rel` | 뜻 | 메모 |
| --- | --- | --- |
| `stylesheet` | 외부 CSS | 스타일을 넣는 기본 방법. 파일 하나에서 관리되고 캐시된다. `type="text/css"`는 필요 없다 |
| `icon` | 파비콘 | 없으면 브라우저가 사이트 루트의 `/favicon.ico`를 찾는다. `sizes`는 `16x16 32x32`나 SVG용 `any` |
| `apple-touch-icon` | iOS 홈 화면 아이콘 | 비표준이지만 사파리가 쓴다. 180×180px 이상으로 만든다 |
| `manifest` | 웹 앱 매니페스트 | 앱 이름, 아이콘, 테마 색, 표시 방식을 JSON 하나로 |
| `alternate` | 같은 내용의 다른 버전 | 번역본이면 `hreflang` 필수, RSS면 `type="application/rss+xml"` |
| `alternate stylesheet` | 대체 스타일시트 | `title` 필수. 사용자가 브라우저 메뉴에서 고르는데, **Firefox만** 메뉴(보기 → 페이지 스타일)를 주고 Chromium 계열은 지원하지 않는다. 고대비·다크 테마는 `prefers-color-scheme`·`prefers-contrast`와 사이트 안 테마 전환으로 한다(→ [[color-motion-accessibility\|색과 움직임의 접근성]]) |
| `canonical` | 대표 URL | 번역본·복제본·신디케이션된 글이 원본을 가리킨다(→ [[seo-basics\|SEO 기초]]) |
| `preload`, `preconnect` 등 | 성능 힌트 | 로딩 순서는 [[script-loading\|스크립트·스타일 로딩 순서와 점진적 렌더링]] |
| `prev`, `next` | 연재물·페이지네이션의 이전·다음 문서 | Google은 2019년부터 색인 신호로 쓰지 않는다. 각 페이지가 스스로 색인될 수 있게 만든다 |
| `me` | 이 페이지와 같은 사람의 다른 프로필 | Mastodon 같은 서비스가 양쪽에서 서로를 가리키는 `rel="me"`를 보고 프로필 링크를 인증한다 |
| `search` | 사이트 검색 설명 파일 | OpenSearch XML(`type="application/opensearchdescription+xml"`)을 걸면 브라우저 주소창에서 사이트 검색을 쓸 수 있다 |

```html
<link rel="stylesheet" href="/css/styles.css">
<link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml">
<link rel="alternate" href="https://example.com/fr/" hreflang="fr-FR">
<link rel="canonical" href="https://example.com/">
<link rel="manifest" href="/app.webmanifest">
```

### 스타일을 넣는 세 가지

| 방법 | 쓰는 곳 |
| --- | --- |
| `<link rel="stylesheet">` | 기본. 여러 페이지가 같은 파일을 캐시해 쓴다 |
| `<style>` | 페이지 전용 소량 CSS, 커스텀 속성 선언, 수정할 수 없는 외부 CSS를 `@import url(...) layer(이름)`으로 캐스케이드 레이어에 넣을 때. `@import`는 블록 맨 앞에 와야 한다 |
| `style` 속성 | 요소 하나에만 적용. 개발 중 실험용이고 실제 스타일은 파일로 옮긴다 |

스타일은 `<head>`에 둔다. 본문 뒤에서 스타일을 받으면 이미 그린 요소를 다시 그려야 한다.

### script

기본 `type`은 JavaScript이고, 모듈은 `type="module"`이다. 일반 `<script src>`는 파싱을 멈추므로 `defer`나 `async`를 붙이거나 `<body>` 끝에 둔다. `defer`·`async`는 외부 스크립트에만 의미가 있고, 모듈 스크립트는 기본으로 `defer`처럼 동작한다. 실행 순서의 차이는 [[script-loading|스크립트·스타일 로딩 순서와 점진적 렌더링]]에 정리했다. `async`와 `defer`를 함께 쓰면 `async`가 이긴다. CDN에서 받는 스크립트·스타일에는 `integrity`(해시)와 `crossorigin`을 달아 파일이 바뀌면 실행하지 않게 한다(하위 자원 무결성, SRI. → [[html|HTML 기초와 HTML5]]).

`<noscript>`는 JavaScript가 꺼졌을 때만 쓰인다. head 안에서는 `link`·`style`·`meta`만 담을 수 있다.

## meta의 세 갈래

| 형태 | 하는 일 | 예 |
| --- | --- | --- |
| `charset` | 문자 인코딩 | `<meta charset="utf-8">` |
| `http-equiv` + `content` | **HTTP 헤더를 흉내 내는** 지시어(pragma directive). 헤더를 직접 못 고칠 때 쓴다 | `content-security-policy`, `refresh` |
| `name` + `content` | 이름 붙은 메타데이터 | `viewport`, `description`, `robots`, `theme-color` |

`charset` 속성은 원래 `<meta http-equiv="Content-Type" content="text/html; charset=…">`였다. 이것을 잘못 쓴 사람이 많아 브라우저가 `charset` 속성을 받아 주기 시작했고, 그대로 표준이 됐다.

### http-equiv

| 값 | 판단 |
| --- | --- |
| `content-security-policy` | 가장 쓸모 있다. 허용할 스크립트·자원 출처를 정해 XSS를 막는다. 다만 `frame-ancestors`, 보고(`report-uri`) 같은 일부 지시어는 meta로는 동작하지 않아 HTTP 헤더가 우선이다(→ [[web-security\|웹 보안]]) |
| `refresh` | N초 뒤 새로 고침하거나 다른 URL로 보낸다. 읽던 중에 화면이 바뀌어 인지·시각 장애 사용자에게 특히 나쁘다. 쓰지 않는다. 꼭 필요하면 충분한 시간, 바로 가기 링크, 멈춤 버튼을 준다 |
| `content-language` | 쓰지 않는다. `<html lang>`이 맞는 방법이다 |

### name

| 이름 | 판단 |
| --- | --- |
| `description` | 검색 결과의 요약문 후보, 일부 브라우저의 북마크 설명. 페이지 내용을 짧고 정확하게 |
| `robots` | `noindex, nofollow`로 색인·링크 추적 거부를 **요청**한다. 강제력은 없다. 기본값이 `index, follow`라 허용은 적을 필요가 없다 |
| `theme-color` | 브라우저 UI(주소창, 상태 표시줄) 색 제안. `media` 속성으로 라이트·다크별 값을 줄 수 있는 유일한 meta다. 사파리와 안드로이드 크롬이 쓰고 데스크톱 크롬·파이어폭스는 대부분 무시한다 |
| `color-scheme` | `light dark`처럼 페이지가 지원하는 색 구성을 알린다. CSS가 도착하기 전에 브라우저가 배경·폼 컨트롤·스크롤바를 맞는 색으로 그려 다크 모드의 흰 화면 깜빡임을 줄인다(→ [[dark-mode-theming\|테마와 다크 모드 구현]]) |
| `referrer` | 이 페이지에서 나가는 요청에 `Referer`를 얼마나 보낼지. 값 종류와 고르는 법은 [[third-party-privacy\|서드파티와 프라이버시]]에 있다 |
| `format-detection` | `telephone=no`로 iOS 사파리가 숫자열을 전화 링크로 바꾸는 것을 막는다 |
| `google` | `content="notranslate"`로 Google 번역 제안을 끈다. 일부만 막을 때는 요소에 `translate="no"` |
| `google-site-verification` 등 | Search Console·Bing(`msvalidate.01`)·Pinterest(`p:domain_verify`)의 사이트 소유 확인. DNS TXT 레코드로 확인하면 태그가 필요 없다 |
| `keywords` | 넣지 않는다. 스팸에 남용되어 검색 엔진이 보지 않는다 |

같은 meta는 하나씩만 둔다(미디어별 `theme-color`는 예외).

### 쓸 일이 거의 없는 태그

| 태그 | 상태 |
| --- | --- |
| `<meta http-equiv="X-UA-Compatible">` | IE 호환 모드용. IE가 지원 종료돼 필요 없다 |
| `nositelinkssearchbox` | Google이 검색 결과의 사이트 링크 검색창을 2024년 말에 없애 의미가 없다 |
| 지리 정보(`geo.position`, `ICBM`), Dublin Core(`DC.*`) | 브라우저는 읽지 않는다. 위치·저작 정보는 구조화된 데이터(JSON-LD)로 준다 |
| `apple-mobile-web-app-*`, `mobile-web-app-capable` | 홈 화면 앱 설정. 매니페스트가 표준이고 이 태그들은 옛 iOS용 대체 수단이다(아래 「홈 화면과 웹 앱」) |
| 중국 브라우저 전용(`renderer`, `x5-*`, UC의 `screen-orientation` 등) | 해당 브라우저를 대상으로 할 때만 |

## SNS 미리보기: Open Graph

링크를 메신저나 SNS에 붙이면 카드가 생긴다. 아무것도 없으면 `<title>`과 `description`을 쓰고, **Open Graph** 메타 태그로 카드 내용을 직접 정할 수 있다. Open Graph는 HTML 표준이 아니라 별도 프로토콜이라 `name` 대신 `property` 속성을 쓴다. 표준 `name` 값과 겹치지 않게 하려는 장치다.

```html
<meta property="og:title" content="머신러닝 워크숍">
<meta property="og:description" content="세 문장 이내 요약">
<meta property="og:image" content="https://example.com/og.png">
<meta property="og:image:alt" content="이미지가 전하는 내용">
<meta property="og:url" content="https://example.com/">
```

프로토콜이 정한 필수 속성은 `og:title`, `og:type`, `og:image`, `og:url` 네 개다. `og:type`이 없으면 `website`로 본다. 글은 `article`, 사람은 `profile`처럼 고른다.

| 속성 | 쓰임 |
| --- | --- |
| `og:url` | 카드의 **대표 URL**. 파라미터가 붙은 주소로 공유돼도 좋아요·공유 수가 이 URL로 모인다. `<link rel="canonical">`과 같은 값을 쓴다 |
| `og:site_name` | 카드 위의 사이트 이름 |
| `og:locale` | `ko_KR`처럼 `언어_지역` 형식. 기본값은 `en_US` |
| `og:image:width`, `og:image:height` | 크기를 미리 알려 주면 처음 공유할 때도 이미지가 바로 그려진다. 가로 1200 × 세로 630(1.91:1)이 사실상 표준이다 |
| `og:image:alt` | 이미지 내용 설명(캡션이 아니다) |

- `og:image`는 프로토콜까지 넣은 **절대 URL**이다.
- 글이면 `article:author`, `article:published_time`을 더할 수 있다. Mastodon은 `<meta name="fediverse:creator" content="@이름@서버">`를 읽어 링크 카드에 작성자 계정을 붙인다.
- X(옛 Twitter)는 `twitter:card`, `twitter:title` 같은 `name="twitter:*"` 태그를 따로 읽고, 없으면 Open Graph 값으로 대신한다. 접두사로 표준 `name`과 충돌을 피한다.
- URL 파라미터마다 다른 카드를 내보내 공유 경로를 추적하거나 문구를 바꿀 수 있다.

### 미리보기가 안 나올 때

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| SPA에서 카드가 비거나 모든 페이지가 같은 카드 | SNS·메신저의 미리보기 봇은 대부분 **JavaScript를 실행하지 않고** 처음 받은 HTML만 읽는다. 클라이언트에서 넣은 태그는 보이지 않는다 | 서버 렌더링·정적 생성으로 HTML에 태그를 넣는다. Next.js는 `metadata`의 `openGraph` 필드와 `opengraph-image` 파일 규칙으로 페이지마다 태그·이미지를 만든다 |
| 태그를 고쳤는데 옛 카드가 나온다 | 플랫폼이 처음 긁어 간 결과를 캐시한다 | Meta의 Sharing Debugger, LinkedIn Post Inspector로 다시 긁게 한다. 이미지 파일 이름을 바꾸는 것도 방법이다 |
| 이미지가 안 나온다 | 상대 URL, 로그인·봇 차단 뒤의 이미지, 너무 큰 파일 | 공개된 절대 URL로, 적당한 크기로 둔다 |

### Open Graph와 SEO

**Open Graph는 검색 순위 요소가 아니다.** Google이 지원하는 meta 태그 목록에 `og:*`는 없고, 지원하지 않는 meta는 무시한다고 명시한다. 검색 결과의 제목과 요약은 `<title>`과 `description`, 본문에서 만든다. 예외로 사이트 이름을 정할 때는 `WebSite` 구조화된 데이터를 가장 중요하게 보고, `og:site_name`도 참고한다.

영향은 간접적이다. 잘 만든 카드는 SNS·메신저에서 클릭률과 공유를 늘려 방문과 링크를 만들고, 그 결과가 검색 노출로 이어질 수 있다. 반대로 카드가 깨지면 링크가 공유돼도 눌리지 않는다. 그래서 `og:*`는 검색 최적화가 아니라 **공유 최적화**로 다루고, 검색용 `<title>`·`description`은 따로 챙긴다. 검색 쪽 메타 태그는 [[seo-basics#메타 태그|SEO 기초]]에 있다.

## base: 기본 URL과 target

`<base href="…" target="…">`는 문서 안 **모든 상대 URL의 기준**과 링크의 기본 `target`을 바꾼다.

| 규칙 | 이유 |
| --- | --- |
| 문서에 하나만 둔다 | 둘째부터는 무시된다 |
| 상대 URL을 쓰는 어떤 요소보다 앞에 둔다 | 앞의 `<link>`·`<script>`는 이미 해석됐다 |
| 웬만하면 쓰지 않는다 | `<a href="#ref">`까지 `base` 기준으로 풀려 같은 페이지 앵커가 **base URL로 새 요청**을 보낸다 |

새 탭이 필요한 링크에만 각자 `target`을 다는 편이 낫다. `target` 값은 [[html|HTML 기초와 HTML5]]의 「링크의 target과 rel」에 있다.

## 홈 화면과 웹 앱

홈 화면에 추가했을 때의 짧은 이름, 아이콘, 시작 화면, 주소창 없는 표시 방식은 meta·link로 하나씩 적을 수도 있다(`apple-mobile-web-app-title`, `application-name`, `apple-touch-startup-image` 등). 하지만 대부분 비표준이라 head가 길어지기만 한다. **웹 앱 매니페스트**(`short_name`, `icons`, `theme_color`, `display`)에 모아 두고 `<link rel="manifest">` 한 줄로 거는 것이 표준이다(→ [[web-app-manifest|웹 앱 매니페스트]]). 주소창 없이 띄우는 설정은 정말 앱처럼 동작할 때만 켠다. 뒤로 가기 버튼이 사라진 웹사이트는 가장 열성적인 사용자를 곤란하게 만든다.

## 주석

`<!-- … -->` 사이는 화면에 보이지도, 파싱되지도 않는다. `<script>`·`<style>` 안에서는 각각 JavaScript·CSS 주석을 쓴다.

## 정리

- `charset`(맨 앞), `viewport`, `title`, `<html lang>`, DOCTYPE은 모든 페이지에 넣는다.
- 순서는 해석 지시 → 제목 → 핵심 자원 힌트 → 렌더링을 막는 자원 → 미룰 자원 → 다음 페이지 힌트 → 나머지 meta다.
- `<link rel>`은 관계다. 스타일·아이콘·매니페스트·번역본·대표 URL을 각각 다른 `rel`로 잇는다.
- meta는 `charset`·`http-equiv`·`name` 세 갈래이고, `refresh`와 `keywords`는 쓰지 않는다.
- SNS 카드는 Open Graph(`property="og:*"`)로 정하고 이미지에 alt를 준다. 태그는 서버가 내려 준 HTML에 있어야 하고, 검색 순위가 아니라 공유 클릭률에 영향을 준다.
- `<base>`는 같은 페이지 앵커까지 바꾸니 피한다. 앱 정보는 매니페스트에 모은다.

관련 노트: [[html|HTML 기초와 HTML5]], [[seo-basics|SEO 기초: 크롤링부터 메타 태그까지]], [[script-loading|스크립트·스타일 로딩 순서와 점진적 렌더링]], [[multilingual-pages|다국어 페이지: lang·hreflang과 국제화]], [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]], [[web-security|웹 보안]], [[web-app-manifest|웹 앱 매니페스트]], [[dark-mode-theming|테마와 다크 모드 구현]]
