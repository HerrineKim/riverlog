---
title: "웹 폰트 성능 최적화: 발견·내려받기·렌더링"
concept: "Web Font Performance"
summary: "웹 폰트는 레이아웃이 필요로 할 때에야 요청되는 늦게 발견되는 자원이다. preload나 인라인 @font-face로 일찍 발견되게 하고, 자체 호스팅·WOFF2·서브셋으로 빨리 받고, font-display로 글자가 숨거나 밀리는 방식을 고른다."
tags: ["performance", "css", "web", "frontend", "typography"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/performance/optimize-web-fonts", "https://web.dev/articles/optimize-cls", "https://web.dev/articles/optimize-lcp"]
---

> web.dev의 「[Learn Performance](https://web.dev/learn/performance)」 강좌 중 「Optimize web fonts」 모듈을 바탕으로 재구성한 노트다. `@font-face` 선언 문법과 타이포그래피는 [[web-typography|웹 타이포그래피]]에 있다.

## 웹 폰트가 성능에 주는 영향

| 단계 | 문제 | 영향 지표 |
| --- | --- | --- |
| 발견 | CSS를 받고 레이아웃을 해야 폰트가 필요한지 안다 | FCP, LCP(텍스트가 LCP일 때) |
| 내려받기 | 파일이 크다. 다른 출처면 연결부터 연다 | FCP, LCP |
| 렌더링 | 폰트를 기다리며 글자를 숨기거나, 대체 폰트로 그렸다가 바꿔 끼우며 문단이 밀린다 | FCP, CLS |

## 1. 발견: 일찍 알게 한다

브라우저는 `@font-face`를 읽었다고 폰트를 받지 않는다. **CSSOM이 완성되고 레이아웃이 어떤 요소에 그 폰트가 필요하다고 판단할 때** 요청한다. 외부 스타일시트에 선언했다면 스타일시트를 받고, 파싱하고, 레이아웃까지 해야 하므로 늦다.

| 방법 | 장점 | 주의 |
| --- | --- | --- |
| `<link rel="preload" as="font">` | 스타일시트를 기다리지 않고 바로 받는다 | 같은 출처여도 **`crossorigin` 필수**(폰트는 CORS 자원). 남용하면 다른 중요한 자원의 대역폭을 뺏고, 이 페이지에서 안 쓰는 폰트를 받을 수 있다 |
| `@font-face`를 `<head>`의 `<style>`에 인라인 | 이 페이지가 실제로 쓰는 폰트만 받는다 | 나머지 CSS가 외부 파일이면 결국 그 렌더링 차단 CSS를 기다린 뒤 받는다 |

```html
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
```

- 폰트 파일 자체를 base64로 CSS에 넣지 않는다. 용량이 커지고, 큰 CSS가 프리로드 스캐너가 다른 자원을 찾는 것을 늦춘다.
- preload는 가장 중요한 폰트 한두 개(본문, LCP 제목)에만 쓴다. `preload` 함정은 [[resource-hints|리소스 힌트]]에 있다.

## 2. 내려받기: 작게, 가깝게

### 자체 호스팅

Google Fonts 같은 서비스는 CSS를 주는 곳(`fonts.googleapis.com`)과 파일을 주는 곳(`fonts.gstatic.com`)이 달라 **연결을 두 번 더** 열어야 한다. `preconnect`로 줄일 수는 있지만, 폰트를 내 출처에서 주면 연결 자체가 없어 대개 더 빠르다. 직접 호스팅한다면 CDN, HTTP/2·HTTP/3, 긴 캐시 헤더를 확인한다.

```html
<!-- 서비스를 쓸 때 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### WOFF2만

WOFF2는 모든 현대 브라우저가 지원하고 WOFF보다 최대 30% 작다. WOFF·EOT·TTF는 옛 브라우저용이라 지금은 WOFF2 하나면 된다.

### 서브셋

서브셋(subsetting)은 폰트에서 **페이지가 쓰는 글리프만 남겨** 파일을 줄인다. 글리프는 유니코드 코드 포인트로 고른다.

| 상황 | 방법 |
| --- | --- |
| 자체 호스팅 | glyphhanger, subfont, fonttools(`pyftsubset`) 같은 도구로 서브셋 파일을 만든다 |
| 언어별 분할 | 서브셋 파일마다 `@font-face`의 `unicode-range`를 주면 브라우저가 **실제로 쓰인 범위의 파일만** 받는다. 글리프가 많은 한글 폰트에 특히 효과가 크다 |
| 몇 글자만 쓰는 장식 폰트 | Google Fonts는 `text=` 매개변수로 그 글자만 담은 파일을 준다. 예: `…/css2?family=Monoton&text=Welcome` |

```css
@font-face {
  font-family: "Pretendard";
  src: url("/fonts/pretendard-kr.woff2") format("woff2");
  unicode-range: U+AC00-D7A3; /* 한글 음절 */
}
@font-face {
  font-family: "Pretendard";
  src: url("/fonts/pretendard-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF;
}
```

## 3. 렌더링: font-display 고르기

웹 폰트를 쓰는 글자는 기본적으로 폰트가 올 때까지 **숨겨진다.** `font-display`가 이 동작을 정한다.

| 값 | 동작 | 맞는 곳 |
| --- | --- | --- |
| `block` | 글자를 숨긴다. Chromium·Firefox는 최대 3초 뒤 대체 폰트로, Safari는 폰트가 올 때까지 숨긴다. `auto`는 대개 이와 같다 | 아이콘 폰트처럼 대체 폰트로 보이면 안 되는 것 |
| `swap` | 대체 폰트로 바로 보여 주고, 오면 바꾼다. 가장 많이 쓰인다. 지표가 다르면 교체 때 문단이 밀린다 | 브랜드 폰트를 꼭 보여야 하는 본문·제목 |
| `fallback` | 아주 짧게 숨겼다가 대체 폰트를 보여 주고, 제한 시간 안에 오면 바꾼다. 늦게 오면 이번엔 대체 폰트를 쓴다 | 빠른 회선이 대부분일 때의 절충 |
| `optional` | 아주 짧은 시간(약 100ms) 안에 오면 쓰고, 아니면 이번 방문은 대체 폰트로 끝내고 다음 방문을 위해 캐시만 한다 | **레이아웃 이동을 가장 싫어할 때.** 첫 방문자 일부는 웹 폰트를 못 본다 |

- 텍스트가 LCP라면 `block`·`auto`는 LCP를 폰트 도착까지 미룬다. 그 밖의 값을 쓴다([[lcp-optimization|LCP 최적화]]).
- `swap`의 교체 이동은 대체 폰트의 `size-adjust`·`ascent-override` 등으로 지표를 맞춰 줄인다. 예시는 [[cls-optimization|CLS 최적화]]에 있다.

## 정리

- 폰트는 레이아웃이 필요로 할 때에야 요청되는 **늦게 발견되는 자원**이다. 중요한 폰트만 `preload`(+`crossorigin`)한다.
- 가능하면 자체 호스팅하고, WOFF2 하나로, 쓰는 글자만 서브셋한다. 한글은 `unicode-range` 분할이 효과가 크다.
- `font-display`는 「숨김」과 「밀림」 중 무엇을 감수할지 고르는 일이다. 이동이 싫으면 `optional`, 꼭 보여야 하면 `swap` + 지표 보정.

관련 노트: [[web-typography|웹 타이포그래피: 가독성, 글줄 길이, 웹폰트]], [[resource-hints|리소스 힌트와 미리 불러오기]], [[cls-optimization|CLS 최적화]], [[lcp-optimization|LCP 최적화]]
