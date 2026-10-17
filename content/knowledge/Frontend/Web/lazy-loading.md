---
title: "지연 로딩: 이미지·iframe·퍼사드"
concept: "Lazy Loading"
summary: "화면 밖 이미지·iframe은 loading='lazy'로 미뤄 첫 화면 자원에 대역폭을 몰아 준다. 첫 화면 이미지와 LCP 후보에는 절대 쓰지 않는다. 무거운 서드파티 임베드는 가짜 UI(퍼사드)를 보여 주다 상호작용할 때 바꾸고, 네이티브로 미룰 수 없는 video·배경 이미지는 IntersectionObserver 기반 라이브러리로 미룬다."
tags: ["performance", "html", "web", "frontend", "browser"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/performance/lazy-load-images-and-iframe-elements", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img"]
---

> web.dev의 「[Learn Performance](https://web.dev/learn/performance)」 강좌 중 「Lazy load images and iframe elements」 모듈을 바탕으로 재구성한 노트다.

## 지연 로딩이란

지연 로딩(lazy loading)은 **지금 안 보이는 자원을 보일 즈음까지 미루는** 기법이다. 적은 노력으로 효과가 큰 편이다.

| 대상 | 얻는 것 |
| --- | --- |
| 이미지 | 화면 밖 이미지가 첫 화면 자원과 대역폭을 다투지 않는다. 느린 회선에서 LCP가 좋아진다. 끝까지 스크롤하지 않는 사용자의 데이터를 아낀다 |
| iframe | iframe은 자기 하위 자원과 JS를 가진 **독립 문서**다. 미루면 시작할 때 메인 스레드 작업이 줄어 INP가 좋아진다 |

## loading 속성

```html
<img src="/photo.jpg" loading="lazy" width="640" height="480" alt="…">
<iframe src="https://example.com/embed" loading="lazy" width="560" height="315" title="…"></iframe>

<!-- picture는 안쪽 img에 준다 -->
<picture>
  <source srcset="/photo.avif" type="image/avif">
  <img src="/photo.jpg" loading="lazy" width="640" height="480" alt="…">
</picture>
```

| 값 | 동작 |
| --- | --- |
| `eager` | 화면 밖이어도 바로 받는다. **기본값** |
| `lazy` | 뷰포트에서 일정 거리 안으로 들어올 때 받는다. 거리는 브라우저가 연결 종류·자원 종류를 보고 정하며, 대개 사용자가 닿기 전에 받아 둔다 |

- 모든 주요 브라우저가 지원한다. 이것을 위해 JS 라이브러리를 더하면 그 JS가 INP를 해친다.
- JS가 꺼져 있으면 미루지 않는다(추적 방지 목적).
- 지연된 이미지는 `load` 이벤트를 기다리게 하지 않는다.
- **크기를 꼭 준다.** 받기 전 이미지는 크기가 0이라 레이아웃 이동이 생기고, 0×0이면 「화면 안」으로 판정되지 않아 영영 안 받을 수도 있다. iframe은 Chrome이 자리 표시를 그려 주지만 `width`·`height`는 직접 준다.

### 첫 화면 이미지에는 쓰지 않는다

`loading="lazy"`는 **레이아웃이 끝나야** 화면 안인지 판단한다. 그래서 첫 화면 안의 지연 이미지는 모든 CSS를 받고 적용한 뒤에야 요청된다. 그냥 두면 프리로드 스캐너가 HTML을 보는 순간 요청했을 이미지다.

- 히어로 이미지, 위쪽 레이아웃의 이미지, **LCP 후보에는 절대 쓰지 않는다**([[lcp-optimization|LCP 최적화]]).
- 「화면 안」은 기기마다 다르다. 데스크톱은 휴대폰보다 세로로 많이 보이고, 세로 태블릿은 일부 데스크톱보다 더 보인다. 어느 기기에서든 첫 화면에 들 수 있는 이미지는 즉시 로드한다.
- `loading`은 네트워크 우선순위를 바꾸지 않는다. 우선순위는 `fetchpriority`의 일이다. `fetchpriority="high"`와 `loading="lazy"`를 함께 줘도 CSS를 기다린다([[resource-hints|리소스 힌트]]).

## iframe과 서드파티 임베드

동영상 플레이어, SNS 게시물, 지도 같은 임베드는 대부분 iframe이고 무겁다. 첫 화면 밖이고 처음부터 필요하지 않은 iframe은 거의 다 `loading="lazy"` 대상이다. YouTube 임베드 하나를 미루면 첫 로딩에서 500KiB 이상, Facebook 좋아요 버튼은 200KiB 이상(대부분 JS)을 아낀다.

## 퍼사드

퍼사드(facade)는 **진짜처럼 보이는 가벼운 대체 UI**를 먼저 보여 주고, 사용자가 상호작용할 때 진짜 임베드로 바꾸는 패턴이다. 사용자가 끝내 누르지 않으면 임베드의 자원은 한 번도 받지 않는다.

```text
처음:     [썸네일 이미지 + ▶ 버튼]        ← 이미지 한 장
클릭하면: <iframe src="youtube…?autoplay=1">  ← 이때 플레이어 JS 전부
```

| 대상 | 퍼사드 | 바꾸는 시점 |
| --- | --- | --- |
| 동영상 임베드 | 영상과 닮은 정적 썸네일 + 재생 버튼 | 클릭 |
| 채팅 위젯 | 가짜 「상담 시작」 버튼 | 클릭이나 충분히 긴 호버 |
| 지도 | 정적 지도 이미지 | 클릭 |

- 공개 구현: `lite-youtube-embed`, `lite-vimeo-embed`, 채팅용 React Live Chat Loader. 직접 만들어도 된다.
- **자원이 크고, 모든 사용자가 쓰지는 않는 임베드**일 때 쓴다. 정말 자동 재생이 필요하다면 예외다.
- 퍼사드는 진짜 버튼처럼 동작해야 한다. `<button>`으로 만들고 접근 가능한 이름을 준다.

## 네이티브로 미룰 수 없는 것: JS 라이브러리

| 대상 | 이유 |
| --- | --- |
| 자동 재생 `<video>` | `autoplay`는 화면 밖이어도 바로 받는다 |
| CSS `background-image` | `loading` 속성이 없다 |
| 그 밖에 `loading`을 지원하지 않는 요소 | |

lazysizes, yall.js 같은 라이브러리가 이것을 처리한다. 동작 원리는 같다.

1. [[intersection-observer|IntersectionObserver]]로 요소가 화면에 다가오는지 본다.
2. 처음 로드 뒤 HTML이 바뀌면 MutationObserver로 새 요소도 관찰한다.
3. 다가오면 자리 표시 속성(`data-src`)을 진짜 속성(`src`)으로 바꾼다.

```html
<!-- yall.js: class="lazy"를 관찰하고, 보이면 data-src → src -->
<video class="lazy" autoplay muted loop playsinline width="320" height="180" poster="/first-frame.jpg">
  <source data-src="/animation.webm" type="video/webm">
  <source data-src="/animation.mp4" type="video/mp4">
</video>
```

- `data-src`로 URL을 숨기는 방식은 **첫 화면 자원에는 쓰지 않는다.** 프리로드 스캐너가 못 본다.
- `<img>`·`<iframe>`처럼 `loading`을 지원하는 요소에는 라이브러리를 쓰지 않는다. `<video>`의 `loading="lazy"` 지원이 넓어지면 자동 재생이 아닌 영상도 네이티브로 미룰 수 있다([[video-performance|동영상 성능]]).

## 정리

- 화면 밖 이미지·iframe은 `loading="lazy"`, 크기는 꼭 준다.
- 첫 화면 이미지와 LCP 후보에는 절대 쓰지 않는다. 레이아웃까지 기다리기 때문이다.
- 무겁고 모두가 쓰지는 않는 임베드는 퍼사드로 바꾸고, 상호작용할 때 진짜를 불러온다.
- 네이티브로 미룰 수 없는 자동 재생 영상·배경 이미지만 IntersectionObserver 기반 라이브러리로 미룬다.

관련 노트: [[intersection-observer|Intersection Observer와 관찰자 API]], [[lcp-optimization|LCP 최적화]], [[video-performance|동영상 성능]], [[responsive-images|반응형 이미지: srcset·sizes와 picture]], [[script-loading|스크립트·스타일 로딩 순서와 점진적 렌더링]]
