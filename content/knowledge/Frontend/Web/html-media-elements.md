---
title: "이미지·오디오·비디오 임베드"
concept: "HTML Media"
summary: "내용인 이미지는 HTML, 장식은 CSS다. <img>의 필수 src·alt, 레이아웃 이동을 막는 width·height, loading·fetchpriority, figure·figcaption, SVG의 role=\"img\"를 정리하고, <video>·<audio>의 source·type·codecs, poster, controls, autoplay와 muted, track의 다섯 kind, 배경 영상과 사용자 정의 컨트롤의 원칙을 다룬다."
tags: ["html", "media", "frontend", "performance", "accessibility"]
source: other
date: "2026-10-21"
sources: ["https://web.dev/learn/html/images", "https://web.dev/learn/html/audio-video", "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/img%20%ED%83%9C%EA%B7%B8%20%EC%9D%B4%EB%AF%B8%EC%A7%80%EA%B0%80%20%EC%97%86%EC%9D%84%EA%B2%BD%EC%9A%B0%20%EB%8C%80%EC%B2%B4%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EC%83%9D%EC%84%B1.md"]
---

> web.dev의 「[Learn HTML](https://web.dev/learn/html)」 강좌 중 「Images」와 「Audio and Video」 모듈을 바탕으로, 브라우저 지원은 MDN으로 확인해 재구성한 노트다.
> 깨진 이미지 대체는 「[Frontend_TIL: img 태그 이미지가 없을경우 대체이미지 생성](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/img%20%ED%83%9C%EA%B7%B8%20%EC%9D%B4%EB%AF%B8%EC%A7%80%EA%B0%80%20%EC%97%86%EC%9D%84%EA%B2%BD%EC%9A%B0%20%EB%8C%80%EC%B2%B4%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EC%83%9D%EC%84%B1.md)」를 바탕으로 보강했다.

## 내용인가, 장식인가

이미지가 **문서에 맥락을 더하면 내용**이므로 HTML로 넣는다. 버튼의 배경 그라데이션, 구역 배경 사진처럼 **장식이면 CSS**(`background-image`)로 넣는다. CSS 배경 이미지는 보조 기술에 전달되지 않는다. 영상도 같다. 내용을 전하는 영상은 사용자가 통제할 수 있어야 하고, 장식 영상은 의미 없는 요소로 표시한다.

## 이미지: img

```html
<img src="images/eve.png" alt="이브" width="400" height="300" loading="lazy">
```

| 속성 | 역할 |
| --- | --- |
| `src` | 필수. 없으면 그릴 것이 없다 |
| `alt` | 필수. 이미지를 볼 수 없는 사람·검색 엔진·음성 비서에게 전하는 내용. 이미지가 안 뜰 때나 메일 앱이 이미지를 막을 때 대신 보인다 |
| `width`, `height` | 단위 없는 정수. **가로세로 비율 힌트**다. CSS가 크기를 덮어써도 비율만큼 자리를 미리 잡아 레이아웃 이동(CLS)을 막는다 |
| `loading` | `lazy`면 뷰포트에 가까워질 때 받는다. 첫 화면의 큰 이미지에는 쓰지 않는다. JavaScript가 꺼진 브라우저는 모두 `eager`로 받는다 |
| `fetchpriority` | `high`·`low`·`auto`. 2024년 말부터 크롬·파이어폭스·사파리 모두 지원한다 |
| `decoding`, `crossorigin`, `referrerpolicy` | 디코딩 방식, CORS 요청, Referer 정책 |
| `srcset`, `sizes` | 해상도·뷰포트별 후보. 맞는 후보가 있으면 `src`보다 우선한다 |

`width`·`height`를 넣어도 이미지는 여전히 반응형이다. CSS의 `max-width: 100%; height: auto;`가 크기를 정하고, 속성은 비율만 알려 준다. 로딩 시간은 같지만 **그려질 때 화면이 튀지 않는다**(→ [[web-vitals|웹 성능 지표와 Lighthouse]]). `loading`은 [[lazy-loading|지연 로딩]], `fetchpriority`는 [[resource-hints|리소스 힌트]]에 있다.

### alt를 쓰는 요령

- 이미지라는 사실은 말하지 않는다. 「~의 사진」은 스크린 리더가 이미 알린다.
- **맥락이 정한다.** 같은 강아지 사진도 리뷰 옆 아바타면 `alt="플러피"`, 입양 페이지면 입양자에게 필요한, 본문에 없는 정보(털 길이, 색, 좋아하는 장난감)를 쓴다.
- 아이콘은 모양이 아니라 **기능**을 쓴다. 돋보기는 「검색」, 집은 「홈」.
- 스크린숏·그래프는 모양이 아니라 **알게 되는 것**을 쓴다.
- 주변 글이 이미 다 말하거나 순수 장식이면 `alt=""`. 속성 자체를 빼면 스크린 리더가 파일 이름을 읽는다.

판단 기준과 이미지 종류별 처리는 [[accessible-images-links-text|대체 텍스트, 링크, 쉬운 글]]에 정리했다.

### SVG 이미지

```html
<img src="switch.svg" alt="전등 스위치" role="img">   <!-- 의미 있는 SVG -->
<img src="magazine.svg" alt="" role="none">           <!-- 장식 SVG -->
```

`.svg` 파일을 `<img>`로 넣을 때 의미 있는 이미지는 `role="img"`를 덧붙인다. VoiceOver가 SVG를 이미지로 알리지 않는 버그를 피하는 관례다. `<svg>`를 문서에 직접 넣을 수도 있다. 이때는 CSS로 내부까지 꾸밀 수 있다.

### 반응형 이미지

같은 이미지의 크기 후보는 `srcset`·`sizes`로, 자르기·형식 대체는 `<picture>` + `<source>`로 한다. `<picture>`는 `<source>`를 차례로 보고 맞는 것이 없으면 안의 `<img>`를 쓰며, **접근 가능한 이름은 `<img>`의 `alt`에서 온다.** 문법은 [[responsive-images|반응형 이미지: srcset·sizes와 picture]]에 있다.

### figure와 figcaption

`<figure>`는 이미지, 코드, 인용, 표처럼 **본문에서 참조하는 한 덩어리**와 그 캡션을 묶는다. 이미지 전용이 아니다. `<figcaption>`은 첫째나 마지막 자식으로 둔다. 캡션은 모두가 보는 설명이고 `alt`는 이미지를 대신하는 글이라, 둘은 역할이 다르다.

### 그 밖의 이미지 기능

| 기능 | 내용 |
| --- | --- |
| 깨진 이미지 대체 | 주소가 틀리거나 파일이 없으면 `error` 이벤트가 난다. 핸들러에서 `src`를 대체 이미지로 바꾼다. React: `onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/img/fallback.png' }}`. 대체 이미지마저 없을 때 무한 반복되지 않게 핸들러를 먼저 떼거나, state로 한 번만 바꾼다 |
| `<input type="image">` | 이미지로 된 제출 버튼. 클릭 좌표가 `이름.x=169&이름.y=66`으로 함께 전송된다(이름이 없으면 `x`, `y`) |
| `ismap` | 서버 측 이미지 맵. 거의 쓰지 않고, 쓰면 포인터 없는 사용자를 위해 링크로 감싼다 |

## 오디오와 비디오

```html
<video controls poster="images/machine.jpg" width="640" height="360">
  <source src="videos/machines.webm" type="video/webm">
  <source src="videos/machines.mp4" type="video/mp4">
  <track kind="subtitles" src="vtt/ko.vtt" srclang="ko" label="한국어" default>
  <track kind="subtitles" src="vtt/en.vtt" srclang="en" label="English">
  <p><a href="https://example.com/video">영상 페이지에서 보기</a></p>
</video>
```

| 요소·속성 | 역할 |
| --- | --- |
| `src` 또는 `<source>` | 파일이 하나면 `src`, 형식 후보가 여럿이면 `<source>`를 나열한다. 브라우저가 위에서부터 재생 가능한 첫 후보를 고른다 |
| `type` | MIME 타입. 디코딩할 수 없는 파일을 **받지 않게** 한다. `video/webm; codecs="vp8, vorbis"`처럼 코덱까지 적으면 더 정확히 거른다 |
| 태그 사이의 내용 | `<video>`를 모르는 환경의 대체 콘텐츠. 닫는 태그는 필수다 |
| `controls` | 브라우저 기본 컨트롤(재생, 볼륨, 음소거, 전체 화면). **항상 넣는다** |
| `poster` | 영상을 받는 동안과 재생 전에 보일 이미지. 기본은 첫 프레임이고, 재생 후 멈추면 다시 나오지 않는다 |
| `width`, `height` | 포스터와 영상 비율이 다르면 로드 때 레이아웃이 다시 계산되니 비율을 정해 둔다 |
| `autoplay`, `muted`, `loop`, `preload` | 자동 재생, 음소거, 반복, 미리 받기 힌트 |
| `playsinline` | iOS에서 전체 화면으로 바뀌지 않고 그 자리에서 재생 |

소리만 있으면 `<video>`보다 `<audio>`를 쓴다. 대부분의 브라우저는 **`muted` 없는 자동 재생을 막는다.** 자동 재생은 음소거와 컨트롤이 있어도 좋은 경험이 아니다.

### track: 자막과 설명

`<track>`은 시간에 맞춘 텍스트를 붙인다. 파일은 WebVTT(`.vtt`)이고, 다른 출처에 두려면 미디어 요소에 `crossorigin`이 필요하다.

| `kind` | 내용 |
| --- | --- |
| `subtitles` | 대사의 받아쓰기·번역. `srclang` 필수, `label`이 선택 메뉴에 보인다 |
| `captions` | 대사에 **효과음·음악 같은 소리 정보**까지 담은 자막. 청각 장애인만이 아니라 시끄러운 곳, 이어폰 없는 사람에게도 필요하다 |
| `descriptions` | 화면에 보이는 장면을 글로 설명. 화면이 없는 기기나 시각 장애인용 |
| `chapters` | 장 제목과 시간. 탐색용 |
| `metadata` | 스크립트가 쓰는 데이터. 화면에 표시되지 않는다 |

자막 모양은 `::cue` 의사 요소로 꾸민다. 자막·대본·음성 해설을 언제, 어떤 품질로 제공해야 하는지는 [[captions-and-transcripts|자막, 대본, 음성 해설]]에 정리했다.

### 배경 영상

```html
<video autoplay muted loop playsinline poster="images/machine.jpg" role="none">
  <source src="videos/bg.webm" type="video/webm">
  <source src="videos/bg.mp4" type="video/mp4">
</video>
```

- 배경 영상은 접근할 수 없다. **내용을 배경 영상으로 전하지 않는다.**
- 순수 장식이니 `role="none"`을 주고 대체 콘텐츠를 뺀다. 늘 음소거라면 파일에서 오디오 트랙을 지워 용량을 줄인다.
- 5초 넘게 자동으로 움직이는 내용은 멈출 수 있어야 한다(WCAG 2.2.2). `loop`는 영원히 돌므로 **멈춤 수단을 반드시** 준다. `prefers-reduced-motion`도 존중한다(→ [[color-motion-accessibility|색과 움직임의 접근성]]).

### 사용자 정의 컨트롤

```html
<audio id="lesson" src="lesson.mp3" controls></audio>
<button id="play" aria-controls="lesson"
        data-play-text="오디오 재생" data-pause-text="오디오 일시 정지">오디오 재생</button>
```

```js
const button = document.getElementById('play');
const media = document.getElementById(button.getAttribute('aria-controls'));
media.removeAttribute('controls');            // 대체 버튼이 준비된 뒤에만 지운다

button.addEventListener('click', () => {
  if (media.paused) {
    media.play();
    button.textContent = button.dataset.pauseText;
  } else {
    media.pause();
    button.textContent = button.dataset.playText;
  }
});
```

- HTML에는 `controls`를 넣어 두고, JavaScript가 **대체 컨트롤을 만든 뒤에** 지운다. 스크립트가 실패해도 사용자는 재생을 멈출 수 있다.
- 버튼 문구를 상태에 맞게 바꾼다. 컨트롤이 콘텐츠에 가려지는 배경 영상에는 바깥에 컨트롤을 둔다.
- `<audio>`·`<video>`는 `HTMLMediaElement`의 `play()`, `pause()`, `paused`, `currentTime`, `duration`, `ended`를 공유한다. 녹음·화면 녹화는 Media Capture and Streams와 `MediaDevices`, 소리 가공은 Web Audio API가 맡는다(→ [[media-capture-web-audio|미디어 캡처와 Web Audio API]], [[audio-recording|React에서 음성 녹음하고 파일로 보내기]]).

## 정리

- 내용이면 HTML, 장식이면 CSS. 모든 `<img>`에는 `src`와 `alt`, 장식이면 `alt=""`.
- `width`·`height`는 비율 힌트다. 반응형을 해치지 않고 CLS를 막는다.
- 첫 화면 밖 이미지는 `loading="lazy"`, 중요한 이미지는 `fetchpriority="high"`.
- 영상은 `<source>`에 `type`을 달고, `controls`를 늘 넣고, 자동 재생은 `muted`와 멈춤 수단이 있을 때만.
- 자막은 `<track>`과 WebVTT. 대사만이면 `subtitles`, 소리 정보까지면 `captions`.

관련 노트: [[responsive-images|반응형 이미지: srcset·sizes와 picture]], [[accessible-images-links-text|대체 텍스트, 링크, 쉬운 글]], [[web-vitals|웹 성능 지표와 Lighthouse]], [[color-motion-accessibility|색과 움직임의 접근성]], [[captions-and-transcripts|자막, 대본, 음성 해설]], [[audio-recording|React에서 음성 녹음하고 파일로 보내기]], [[image-formats|웹 이미지 형식]], [[responsive-images|반응형 이미지]]
