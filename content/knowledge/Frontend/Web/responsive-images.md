---
title: "반응형 이미지: srcset·sizes와 picture"
concept: "Responsive Images"
summary: "같은 이미지를 크기만 바꿔 줄 때는 srcset·sizes로 브라우저에 선택을 맡기고, 자르기·형식 대체처럼 규칙을 강제할 때는 picture를 쓴다. 크기만 맞춰도 작은 화면의 이미지 용량이 70% 넘게 준다. sizes는 손으로 정확히 맞추기 어려우니 근삿값이나 도구·CMS에 맡긴다."
tags: ["frontend", "html", "performance", "web", "mobile"]
source: other
date: "2026-10-13"
sources: ["https://webactually.com/2020/07/13/html-%EB%B0%98%EC%9D%91%ED%98%95-%EC%9D%B4%EB%AF%B8%EC%A7%80-%EB%AC%B8%EB%B2%95-%EA%B0%80%EC%9D%B4%EB%93%9C/", "https://webactually.com/2013/11/04/%ec%9a%b0%eb%a6%ac%ec%97%90%ea%b2%8c-%eb%b0%98%ec%9d%91%ed%98%95-%ec%9d%b4%eb%af%b8%ec%a7%80%ea%b0%80-%ed%95%84%ec%9a%94%ed%95%9c-%ec%9d%b4%ec%9c%a0/", "https://webactually.com/2016/01/19/%ec%9b%8c%eb%93%9c%ed%94%84%eb%a0%88%ec%8a%a4-%ec%bd%94%ec%96%b4-4-4%ec%97%90-%ec%83%81%eb%a5%99%ed%95%9c-%eb%b0%98%ec%9d%91%ed%98%95-%ec%9d%b4%eb%af%b8%ec%a7%80/", "https://webactually.com/2014/08/18/%eb%b0%98%ec%9d%91%ed%98%95-%ec%9b%b9-%eb%94%94%ec%9e%90%ec%9d%b8%ec%9d%98-%ed%98%84%ec%9e%ac/", "https://www.frontendinterviewhandbook.com/kr/html-questions", "https://webactually.com/2016/02/23/%ed%8e%ad%ea%b7%84%eb%9e%9c%eb%8d%a4%ed%95%98%ec%9a%b0%ec%8a%a4-%eb%b0%98%ec%9d%91%ed%98%95-%ec%9b%b9%ec%82%ac%ec%9d%b4%ed%8a%b8%ec%97%90%ec%84%9c-%ec%9a%b0%eb%a6%ac%ea%b0%80-%eb%b0%b0%ec%9a%b8/"]
---

> CSS-Tricks의 「HTML 반응형 이미지 문법 가이드」(웹액츄얼리 번역, 2020.07)를 중심으로 Tim Kadlec·Tim Evko·Stéphanie Walter·Benjie Moss의 반응형 이미지 관련 글(웹액츄얼리 번역, 2013~2016)을 더해 재구성한 노트다. 브라우저의 후보 선택 과정은 Front End Interview Handbook의 「[HTML 질문](https://www.frontendinterviewhandbook.com/kr/html-questions)」 문항으로 보강했다.

## 왜 필요한가

이미지는 페이지 무게의 가장 큰 몫이다. CSS로 `max-width: 100%`를 주면 이미지가 화면에 맞게 줄어 보이지만, **내려받는 파일은 그대로 크다.** 반응형 사이트 수백 곳을 측정한 결과, 360px 화면에서 이미지를 표시 크기에 맞게 줄이기만 해도 이미지 용량이 70% 넘게 줄었다. 무손실 최적화만으로는 5% 안팎이었다. 한 가지 기법으로 이만큼 줄어드는 경우는 드물다.

반응형 이미지는 목적이 둘이다.

| 목적 | 도구 | 누가 고르나 |
| --- | --- | --- |
| 성능: 같은 그림을 알맞은 크기로 | `<img srcset sizes>` | 브라우저가 상황을 보고 고른다 |
| 디자인 제어: 다른 그림·다른 형식 | `<picture>` + `<source>` | 개발자의 규칙을 브라우저가 따른다 |

## srcset: 크기만 다른 같은 이미지

### x 서술자: 픽셀 밀도

```html
<img src="cat.jpg" srcset="cat@2x.jpg 2x" alt="창가에 앉은 고양이">
```

이미지가 늘 같은 CSS 크기로 보일 때 쓴다. 기본 `src`는 가장 작고 빠른 1x 파일로 둔다.

### w 서술자 + sizes: 레이아웃에 따라 폭이 변할 때

반응형 이미지 사용의 대부분이 이 형태다.

```html
<img
  srcset="baby-s.jpg 300w, baby-m.jpg 600w, baby-l.jpg 1200w"
  sizes="(min-width: 1000px) 33vw, 96vw"
  src="baby-m.jpg"
  alt="잠든 아기">
```

- `300w`는 파일의 실제 가로 픽셀이다.
- `sizes`는 **이미지가 레이아웃에서 차지할 폭**이다. 뷰포트 폭이 아니다. 여백·사이드바·열 간격을 뺀 값이다.
- 브라우저는 `sizes` × 픽셀 밀도로 필요한 폭을 계산하고 `srcset`에서 가까운 후보를 고른다. 1200px 뷰포트, 2x 화면, `40vw`면 960px짜리를 찾는다.
- `sizes`를 빼면 `100vw`로 본다. 작은 칸에 들어가는 이미지인데 `sizes`가 없으면 필요 이상으로 큰 파일을 받는다.

선택 과정을 숫자로 보면, `sizes`가 `320px`이고 후보가 `500w`·`1000w`·`2000w`일 때 각 후보의 실효 밀도는 500/320 ≈ 1.6x, 1000/320 ≈ 3.1x, 2000/320 ≈ 6.3x다. 1x 화면이면 1 이상 중 가장 작은 500w를, 2x 화면이면 2 이상 중 가장 작은 1000w를 고르는 것이 보통이다. 명세는 이 선택을 브라우저 재량으로 남겨 둔다.

**왜 브라우저가 아는 폭을 굳이 알려 주나?** 브라우저는 CSS를 다 받기 전에, `<img>`를 보자마자 다운로드를 시작한다. `sizes`는 그 시점에 쓸 정보다.

### sizes를 맞추는 현실적인 방법

| 방법 | 설명 |
| --- | --- |
| 근삿값 | `96vw`, `(min-width: 1000px) 33vw, 96vw`처럼 "대략 이 정도"로 적는다. 가장 권할 만하다 |
| 도구로 계산 | RespImageLint 같은 도구가 실제 렌더링 폭을 재서 정확한 값을 만들어 준다. 손으로 유지보수하기는 어렵다 |
| 추상화 | 템플릿 변수·CMS 필터로 한 곳에서 정의해 모든 이미지에 쓴다. 레이아웃이 바뀌어도 한 곳만 고친다 |
| 자동 | `loading="lazy"` 이미지는 레이아웃이 끝난 뒤 로드되므로 `sizes="auto"`로 맡길 수 있다(지원 브라우저 한정) |

`srcset`의 후보는 반드시 **같은 그림**이어야 한다. 브라우저는 네트워크 상태나 캐시에 이미 있는 큰 파일을 이유로 계산과 다른 후보를 고를 수 있다. 그게 이 문법의 장점이다.

확대 보기처럼 이미지를 크게 띄울 때는 `src`를 바꾸지 말고 `sizes`를 `200vw`처럼 키우면 브라우저가 고해상도 후보를 받아 온다.

## picture: 규칙을 강제할 때

### 아트 디렉션

화면 크기마다 **다르게 자른 이미지**를 보여 준다. 큰 화면에선 전경, 작은 화면에선 인물만 확대한 사진 같은 경우다.

```html
<picture>
  <source media="(min-width: 1000px)" srcset="baby-wide.jpg">
  <source media="(min-width: 600px)" srcset="baby.jpg">
  <img src="baby-closeup.jpg" alt="잠든 아기">
</picture>
```

브라우저는 미디어 쿼리를 반드시 지킨다. 다크 모드용 이미지, `prefers-reduced-motion`일 때 GIF 대신 정지 이미지, 인쇄용 흑백 이미지도 같은 방식이다. 각 `<source>`에 `srcset` 밀도·폭 후보를 함께 넣을 수도 있다.

아트 디렉션이 없으면 넓은 배너에 넣은 인물 사진이 태블릿에선 귀 한쪽만, 모바일에선 배경만 남는 식으로 잘린다. CMS 입력자가 화면별 초점을 정할 수 없을 때 흔히 생긴다. **이미지의 초점은 마크업이나 CMS에서 화면별로 지정할 수 있어야 한다.**

### 새 형식의 대체(fallback)

```html
<picture>
  <source srcset="party.avif" type="image/avif">
  <source srcset="party.webp" type="image/webp">
  <img src="party.jpg" alt="케이크가 놓인 파티">
</picture>
```

브라우저는 `type`을 지원하는 **첫 번째** `<source>`를 쓴다. 효율 좋은 형식을 앞에 둔다. 주요 브라우저는 WebP와 AVIF를 모두 지원하므로 JPEG는 아주 오래된 브라우저를 위한 마지막 대체다. 과거에는 Safari용 JPEG 2000, IE용 JPEG XR까지 `<source>`로 늘어놓았다.

## 이미지 변형은 사람이 만들지 않는다

여러 크기·형식을 손으로 내보내는 것은 오래가지 못한다.

| 수단 | 예 |
| --- | --- |
| 이미지 CDN | Cloudinary, imgix, Cloudflare 등. URL 파라미터로 크기·자르기·형식을 바꾸고 `Accept` 헤더를 보고 AVIF·WebP를 준다 |
| 프레임워크 컴포넌트 | Next.js `<Image>`, Gatsby·Eleventy 이미지 플러그인 |
| CMS | WordPress는 4.4(2015)부터 업로드한 이미지마다 여러 크기를 만들어 `srcset`·`sizes`를 자동으로 붙인다 |

CMS가 자동으로 넣는 기본 `sizes`는 테마 레이아웃을 모른다. WordPress의 기본값 `(max-width: Npx) 100vw, Npx`는 "원본보다 큰 파일은 받지 않는다"는 보장만 한다. 테마 개발자가 필터 훅(`wp_calculate_image_sizes`)으로 실제 레이아웃에 맞는 값을 넣어야 제 효과가 난다.

## CSS 배경 이미지와 임베드

- 배경 이미지는 미디어 쿼리로 `background-image`를 바꾸면 조건에 맞는 하나만 받는다(`<picture>`의 CSS판). 밀도별 선택은 `image-set()`으로 한다.
- 박스 안에서 자르거나 채우는 것은 `object-fit`·`object-position`으로 한다.
- 동영상·지도 같은 `<iframe>` 임베드는 고정 폭·높이를 갖는다. 예전엔 `padding-top: 56.25%` 컨테이너로 비율을 지켰지만 지금은 `aspect-ratio: 16 / 9; width: 100%`면 된다.

## 함께 챙길 것

| 항목 | 내용 |
| --- | --- |
| 압축 품질 | 보기 좋음과 가벼움의 균형점을 찾는다. 2x 크기로 만들고 압축률을 높이면 1x보다 가벼우면서 고밀도 화면에서도 선명할 수 있다 |
| 크기 명시 | `width`·`height` 속성을 넣어 로딩 중 레이아웃 이동(CLS)을 막는다 |
| 지연 로딩 | 첫 화면 밖 이미지는 `loading="lazy"`. 첫 화면 큰 이미지(LCP)에는 쓰지 않는다 |
| 캐싱·CDN | `Cache-Control`로 재방문 요청을 없애고, 사용자 가까운 서버에서 보낸다 |

## 정리

- 크기만 다르면 `srcset` + `sizes`, 그림이나 형식이 다르면 `<picture>`.
- `sizes`는 뷰포트가 아니라 **레이아웃에서의 이미지 폭**이다. 근삿값으로 충분하다.
- 형식 대체는 효율 좋은 `<source>`를 먼저 둔다.
- 이미지 변형은 CDN·프레임워크·CMS에 맡기되, 자동 `sizes`는 레이아웃에 맞게 고친다.
- 크기만 맞춰도 작은 화면의 이미지 용량이 크게 준다. **반응형 레이아웃이면 반응형 이미지도 기본이다.**

관련 노트: [[responsive-design|반응형 디자인과 다국어 타이포그래피]], [[web-vitals|웹 성능 지표와 Lighthouse]], [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]], [[html|HTML 기초와 HTML5]]
