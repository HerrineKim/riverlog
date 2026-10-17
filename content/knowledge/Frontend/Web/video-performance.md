---
title: "동영상 성능: 형식·poster·자동 재생·임베드"
concept: "Video Performance"
summary: "동영상은 컨테이너와 코덱을 고르고 FFmpeg로 줄여 여러 source로 준다. 움직이는 GIF는 muted·loop·playsinline 자동 재생 video로 바꾼다. 사용자가 누를 동영상은 preload='none'과 poster, 화면 밖은 지연 로딩, 무거운 서드파티 플레이어는 퍼사드로 늦춘다. poster와 첫 프레임은 LCP 후보다."
tags: ["performance", "html", "web", "frontend", "media"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/performance/video-performance", "https://web.dev/learn/performance/lazy-load-images-and-iframe-elements", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video"]
---

> web.dev의 「[Learn Performance](https://web.dev/learn/performance)」 강좌 중 「Video performance」 모듈을 바탕으로, `<video>` 속성은 MDN으로 확인해 재구성한 노트다.

## 컨테이너와 코덱

동영상 파일은 **컨테이너**(`.mp4`, `.webm`) 안에 영상·음성 **스트림**이 들어 있고, 각 스트림은 **코덱**으로 압축된다. 예를 들어 WebM 컨테이너에 VP9 영상과 Opus·Vorbis 음성을 담는다.

| 영상 코덱 | 컨테이너 | 압축 | 지원 |
| --- | --- | --- | --- |
| AV1 | WebM, MP4 | 가장 좋다 | 비교적 새롭다. 지원을 확인하고 쓴다 |
| VP9 | WebM | 중간 | AV1보다 넓다 |
| H.264 | MP4 | 가장 낮다 | 모든 현대 브라우저. 마지막 대체용 |

파일이 작을수록 대역폭과 로딩 시간이 줄고, 동영상이 LCP 요소라면 LCP도 좋아진다.

## FFmpeg로 줄이기

```bash
ffmpeg -i input.mov output.webm            # 기본값으로 변환만 해도 크게 준다
ffmpeg -i input.mov -an output.webm        # -an: 음성 스트림 제거
ffmpeg -i input.mov -c:v libvpx-vp9 -crf 32 -b:v 0 output.webm  # 품질 기준 압축
```

- **소리가 필요 없으면 음성 스트림을 뺀다.** 무음이어도 스트림이 있으면 용량을 차지한다. GIF 대체용 영상에 해당한다.
- `-crf`(Constant Rate Factor)는 정수로 품질과 압축 정도를 정한다. 값의 범위와 의미는 코덱마다 다르므로 FFmpeg 위키의 H.264·VP9 가이드를 따른다.

## 여러 형식을 순서대로

```html
<video controls width="1280" height="720" poster="/poster.jpg" preload="none">
  <source src="/video.av1.webm" type="video/webm; codecs=av01.0.05M.08">
  <source src="/video.webm" type="video/webm">
  <source src="/video.mp4" type="video/mp4">
</video>
```

`<picture>`처럼 **브라우저는 지원하는 첫 `<source>`를 쓴다.** MP4를 맨 앞에 두면 더 효율적인 형식을 지원해도 MP4를 받는다. 효율 좋은 것을 앞에, H.264 MP4를 맨 뒤에 둔다.

## poster와 LCP

`poster`는 재생 전에 보일 이미지다. 없으면 첫 프레임이 준비될 때까지 아무것도 안 보인다.

- `<video>`는 **poster 이미지나 첫 프레임 중 먼저 그려진 것**이 LCP 후보다([[web-vitals|웹 성능 지표]]).
- 자동 재생하지 않는 동영상에는 poster를 준다. poster를 안 쓰면 첫 프레임이 빨리 나오도록 영상을 최적화한다.
- poster가 LCP라면 미리 당긴다. 단, 동영상이 화면에서 가장 큰 요소가 아니면 이 preload가 더 중요한 자원과 대역폭을 다퉈 오히려 LCP를 늦춘다.

```html
<link rel="preload" as="image" href="/poster.jpg" fetchpriority="high">
```

## 자동 재생: GIF 대신 video

움직이는 GIF는 몇 MB가 되기 쉽고, 같은 화질이라면 영상이 몇 배 작다. 배경 영상이나 GIF 대체에는 자동 재생 영상을 쓴다.

```html
<video autoplay muted loop playsinline width="480" height="270" poster="/first-frame.jpg">
  <source src="/animation.webm" type="video/webm">
  <source src="/animation.mp4" type="video/mp4">
</video>
```

| 속성 | 이유 |
| --- | --- |
| `muted` | 대부분의 브라우저는 소리 없는 영상만 자동 재생을 허용한다 |
| `loop` | GIF처럼 반복 |
| `playsinline` | iOS에서 전체 화면으로 가지 않고 제자리에서 재생 |
| `width`·`height` | 자리를 잡아 레이아웃 이동을 막는다([[cls-optimization\|CLS 최적화]]) |

- **`autoplay` 영상은 화면 밖에 있어도 즉시 받는다.** `autoplay`는 `preload`보다 우선한다. 화면 아래쪽 자동 재생 영상은 poster만 두고, [[intersection-observer|IntersectionObserver]]로 화면에 다가올 때 `src`를 넣는다([[lazy-loading|지연 로딩]]의 yall.js 예). 재생 전에 poster가 잠깐 보이는 것은 감수한다.
- 소리 있는 자동 재생은 놀라게 한다. 사용자가 기대하는 곳에서만 쓰고, 브라우저의 자동 재생 정책을 따른다.

## 사용자가 눌러서 보는 영상

브라우저는 기본적으로 파서가 `<video>`를 만나면 내려받기를 시작할 수 있다. 기본값은 브라우저마다 다르다.

| `preload` 값 | 동작 |
| --- | --- |
| `none` | 아무것도 미리 받지 않는다. 사용자가 재생을 눌러야 하는 영상에 보통 가장 좋다 |
| `metadata` | 길이 같은 메타데이터만 받는다. 명세가 권하는 기본값이다 |
| `auto`(빈 문자열) | 쓰지 않을 수도 있는데 통째로 받을 수 있다 |

`preload`는 힌트라 브라우저·기기에 따라 무시될 수 있다. `preload="none"`에는 poster를 함께 줘 무슨 영상인지 보이게 한다.

### loading="lazy"

`<video>`에도 `loading="lazy"`가 생겼다. 화면에 다가올 때까지 **poster와 메타데이터까지** 받지 않는다. `preload="none"`·`metadata`로도 대부분을 막지만, 이것은 poster 요청까지 미룬다. 비교적 새 속성이라 지원하지 않는 브라우저에서는 그냥 즉시 로드되므로 점진적 향상으로 쓴다.

## 서드파티 임베드는 퍼사드로

YouTube·Vimeo 임베드는 영상 전달을 대신해 주지만 플레이어가 **많은 JS**를 함께 불러온다. HTTP Archive 기준 YouTube 임베드는 중간값 사이트에서 메인 스레드를 1.7초 넘게 막는다. 메인 스레드가 막히면 INP가 나빠진다.

해법은 **퍼사드(facade)** 다. 처음엔 썸네일과 재생 버튼만 보여 주고, 사용자가 누르면 그때 진짜 iframe으로 바꾼다. 패턴과 라이브러리는 [[lazy-loading|지연 로딩]]에 있다.

## 정리

- 효율 좋은 형식(AV1·VP9 WebM)을 앞에, H.264 MP4를 맨 뒤 `<source>`에 둔다.
- 소리가 필요 없으면 `-an`으로 음성을 빼고, `-crf`로 품질을 조절한다.
- GIF는 `autoplay muted loop playsinline` 영상으로 바꾸되, 화면 밖 자동 재생은 늦춰 받는다.
- 눌러서 보는 영상은 `preload="none"` + poster, 화면 밖이면 `loading="lazy"`.
- poster·첫 프레임은 LCP 후보다. 무거운 임베드는 퍼사드로 늦춘다.

관련 노트: [[lazy-loading|지연 로딩: 이미지·iframe·퍼사드]], [[responsive-images|반응형 이미지: srcset·sizes와 picture]], [[lcp-optimization|LCP 최적화]], [[cls-optimization|CLS 최적화]]
