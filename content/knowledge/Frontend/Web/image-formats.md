---
title: "웹 이미지 형식: 벡터·래스터와 GIF·PNG·JPEG·WebP·AVIF·JPEG XL"
concept: "Image Formats"
summary: "도형으로 된 그림은 SVG, 사진처럼 실제 세계의 디테일이 있는 그림은 래스터다. 래스터는 손실 압축이 가능한 형식을 고르되, 사진은 AVIF·WebP를 먼저 주고 JPEG로 받친다. PNG는 반투명이 필요한 단순 그림과 원본 보관용, GIF는 거의 쓸 곳이 없다. JPEG XL은 크롬·파이어폭스·사파리가 지원하지만 엣지가 빠져 있어 picture로 대체를 둔다."
tags: ["frontend", "performance", "web", "media", "graphics"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/images/history", "https://web.dev/learn/images/performance-issues", "https://web.dev/learn/images/vector-images", "https://web.dev/learn/images/raster-images", "https://web.dev/learn/images/gif", "https://web.dev/learn/images/png", "https://web.dev/learn/images/jpeg", "https://web.dev/learn/images/webp", "https://web.dev/learn/images/avif", "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types"]
---

> web.dev의 「[Learn Images](https://web.dev/learn/images)」 강좌 중 이미지 형식 모듈(벡터, 래스터, GIF, PNG, JPEG, WebP, AVIF)을 바탕으로, 브라우저 지원은 MDN의 「[Image file type and format guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types)」와 browser-compat-data로 확인해 재구성한 노트다.

## 왜 형식이 중요한가

이미지는 웹 페이지에서 **전송량과 요청 수 모두 가장 큰 자산**이다. 같은 사진이 JPEG로는 수백 KB, PNG로는 수 MB가 될 수 있고, 사람 눈에는 차이가 거의 없다. 그래서 이미지 최적화는 형식 고르기, 압축 수준 정하기, 화면에 맞는 크기 주기의 세 가지로 이뤄진다. 이 노트는 첫째를, [[image-compression|이미지 압축과 인코딩 자동화]]는 둘째를, [[responsive-images|반응형 이미지]]는 셋째를 다룬다.

## 벡터와 래스터

| | 벡터(vector) | 래스터(raster) |
| --- | --- | --- |
| 담는 것 | 도형·좌표·경로를 그리는 **명령** | 픽셀 격자 하나하나의 **값** |
| 확대·축소 | 새 크기로 다시 그리므로 늘 선명하다 | 원래 크기보다 키우면 흐리거나 계단이 진다. 줄이는 것은 티가 안 난다 |
| 크기를 키우는 요인 | 도형이 복잡할수록 명령이 길어진다 | 픽셀 수와 색의 복잡도 |
| 렌더링 비용 | 브라우저가 명령을 해석해야 해서 복잡한 그림은 무겁다 | 디코딩만 하면 된다 |
| 웹 형식 | SVG | GIF, PNG, JPEG, WebP, AVIF, JPEG XL |
| 맞는 그림 | 아이콘, 로고, 선이 뚜렷하고 단색인 일러스트, 다이어그램 | 사진, 실제 세계 수준의 디테일과 그라데이션 |

**SVG**는 W3C가 만든 XML 기반 마크업이다. 텍스트라 편집기로 고칠 수 있고, CSS로 꾸미고, 스크립트로 상호작용을 넣을 수 있다. "빨간 1px 선을 그어라" 한 줄이 그 선 위의 빨간 픽셀 목록보다 훨씬 짧은 것처럼, 단순한 도형은 SVG가 압도적으로 작다. **UI 아이콘은 거의 항상 SVG가 맞다.** 사진 같은 그림을 SVG로 만들면 명령이 끝없이 길어져 오히려 커진다.

## 래스터의 압축: 무손실과 손실

서버는 "이미지"를 보내는 것이 아니라 **픽셀 격자를 설명하는 바이트**를 보내고, 브라우저가 그 설명으로 그림을 다시 그린다. 압축은 그 설명을 짧게 만드는 일이다.

| 방식 | 원리 | 결과 |
| --- | --- | --- |
| 무손실(lossless) | "1행 1~3열은 파랑, 4열은 빨강"처럼 반복을 묶어 적는다(런 렝스 부호화, LZW, DEFLATE 류) | 원본과 픽셀 단위로 같다. 줄어드는 폭이 작다 |
| 손실(lossy) | 사람 눈이 알아채기 어려운 정보를 버린다 | 훨씬 작아진다. 지나치면 뭉개짐·블록 경계 같은 아티팩트가 보인다 |
| 양자화(quantization) | 넓은 범위의 값을 더 적은 대표값으로 줄인다 | 손실 압축의 핵심 단계. GIF의 팔레트 축소도 양자화다 |

손실 압축이 통하는 이유는 사람의 눈이 완벽하지 않기 때문이다. 목표는 **보는 사람이 느끼는 품질과 보내는 데이터 양의 균형점**이고, 그 지점은 그림 내용마다 다르다. JPEG·WebP가 실제로 무엇을 버리는지는 [[image-compression|이미지 압축과 인코딩 자동화]]에 있다.

## 형식별 특징

| 형식 | 압축 | 투명 | 애니메이션 | 특징 | 웹에서 쓸 곳 |
| --- | --- | --- | --- | --- | --- |
| **GIF** | 무손실(LZW) | 켜고 끄기만(인덱스 투명) | O | 프레임당 **최대 256색**. 그라데이션이 얼룩지고 압축률도 낮다 | 사실상 없다. 아이콘은 SVG, 정지 그림은 PNG, 움직임은 동영상이나 애니메이션 WebP·AVIF |
| **PNG** | 무손실(DEFLATE) | 알파 채널(0~255 단계 반투명) | APNG로 가능 | GIF 대체로 나왔다. 인덱스(256색)와 트루컬러(약 1,600만 색) 모드 | 반투명 그림자가 있는 로고 같은 단순 그림, 스크린숏·선화, **원본 보관용** |
| **JPEG** | 손실(8×8 블록 DCT) | X | X | 1992년 표준. 사진의 부드러운 그라데이션에 강하다. 확장자는 보통 `.jpg` | 사진의 기본값이자 **가장 안전한 대체** |
| **WebP** | 손실(VP8 기반)·무손실 | 알파 | O | 블록 예측과 영역별 양자화로 같은 품질의 JPEG보다 작다 | 사진·그림 모두. AVIF의 다음 대체 |
| **AVIF** | 손실·무손실(AV1 기반) | 알파 | O | Alliance for Open Media의 AV1 코덱 기반. JPEG·WebP보다 작은 크기에서 지각 품질이 좋다 | 사진의 1순위 |
| **JPEG XL** | 손실·무손실 | 알파 | O(사파리는 정지 이미지만) | 고해상도 사진에 강하다. 이름만 JPEG일 뿐 JPEG과 호환되는 형식이 아니다 | 지원 브라우저가 넓어지는 중. 반드시 대체와 함께 |
| **SVG** | (텍스트) | O | CSS·SMIL로 가능 | 벡터 | 아이콘·로고·다이어그램 |

과거에는 PNG가 반투명을 지원하는 유일한 래스터 형식이라 많이 쓰였다. 지금은 WebP·AVIF가 알파 채널을 가지므로 반투명 그림도 WebP와 먼저 비교해 본다. PNG 인코더는 도구마다 효율 차이가 커서, 배포 전에 Squoosh나 ImageOptim 같은 최적화 도구를 한 번 거친다.

## 브라우저 지원 (2026년 10월 기준)

| 형식 | MIME 타입 | 크롬 | 엣지 | 파이어폭스 | 사파리 |
| --- | --- | --- | --- | --- | --- |
| JPEG·PNG·GIF·SVG | `image/jpeg`·`image/png`·`image/gif`·`image/svg+xml` | 모든 버전 | 모든 버전 | 모든 버전 | 모든 버전 |
| APNG | `image/apng` | 59 | 12 | 3 | 8 |
| WebP | `image/webp` | 17 | 18 | 65 | 14 |
| AVIF | `image/avif` | 85 | 121 | 93 | 16.4(16.1~16.3은 macOS Ventura에서만) |
| JPEG XL | `image/jxl` | 155 | 미지원 | 158 | 17 |

- WebP와 AVIF는 주요 브라우저가 모두 지원한다. 오래된 브라우저까지 생각하면 JPEG·PNG 대체를 함께 둔다.
- JPEG XL은 사파리가 먼저 지원했고, 크롬 155(2026.10)와 파이어폭스 158(2026.10)이 이어서 지원했다. 엣지는 아직 지원하지 않는다. **`<picture>`의 `type="image/jxl"` 뒤에 다른 형식을 받쳐야** 쓸 수 있다.
- 과거에는 사파리만 JPEG 2000을, IE·구 엣지만 JPEG XR을 지원해서 형식별로 `<source>`를 늘어놓았다. 지금은 쓰지 않는다.

### 지원하지 않는 형식을 주면

브라우저는 파일을 **다 받은 뒤** 해석에 실패하고 아무것도 그리지 않는다. 깨진 이미지에 대역폭까지 버린다. 예전에는 `<img onerror>`로 대체 파일로 바꿨지만, 첫 요청이 이미 낭비된 뒤다. 그래서 새 형식은 **요청 전에 지원 여부를 판단하는 방법**으로만 준다.

| 방법 | 어디서 판단하나 | 노트 |
| --- | --- | --- |
| `<picture>` + `<source type="image/avif">` | 브라우저가 마크업을 보고 | [[responsive-images\|반응형 이미지]] |
| `Accept` 헤더 협상 | 서버·이미지 CDN이 요청 헤더를 보고 | [[image-cdn\|이미지 CDN과 Accept 헤더 협상]] |

## 무엇을 고르나

```text
아이콘·로고·다이어그램처럼 도형으로 그릴 수 있나?
 ├─ 예 → SVG (SVG가 없으면 WebP + PNG 대체)
 └─ 아니오(래스터)
     ├─ 사진·그라데이션 → AVIF → WebP → JPEG 순으로 대체
     ├─ 스크린숏·선화·글자가 든 그림 → 무손실(WebP 무손실 또는 PNG). 손실 압축은 글자 주변에 번짐이 보인다
     ├─ 반투명이 필요 → AVIF·WebP, 대체는 PNG (JPEG는 알파 채널이 없다)
     └─ 움직이는 그림 → 동영상(<video>) 또는 애니메이션 AVIF·WebP. GIF는 피한다
```

- **원본은 무손실로 보관한다.** 저장소나 CMS에는 큰 PNG 같은 정본을 두고, 배포용 AVIF·WebP·JPEG는 도구가 그때그때 만든다. 손실 형식을 다시 손실 압축하면 아티팩트가 쌓인다.
- 형식을 바꿔도 크기가 크면 소용없다. 화면 크기에 맞는 후보를 함께 준다([[responsive-images|반응형 이미지]]).
- 움직이는 GIF를 동영상으로 바꾸는 방법은 [[video-performance|동영상 성능: 형식·poster·자동 재생·임베드]]에 있다.

## 정리

- 도형은 SVG, 디테일은 래스터. 아이콘에 래스터를, 사진에 SVG를 쓰지 않는다.
- 사진은 AVIF → WebP → JPEG 순서로 주고, 판단은 `<picture type>`이나 `Accept` 협상에 맡긴다.
- PNG는 반투명 단순 그림과 원본 보관용, GIF는 쓸 곳이 거의 없다.
- JPEG XL은 지원이 빠르게 넓어지고 있지만 엣지가 빠져 있어 대체 없이 쓰지 않는다.
- **형식은 출발점이다.** 압축 수준과 크기까지 맞춰야 이미지가 가벼워진다.

관련 노트: [[image-compression|이미지 압축과 인코딩 자동화]], [[image-cdn|이미지 CDN과 Accept 헤더 협상]], [[responsive-images|반응형 이미지: srcset·sizes와 picture]], [[html-media-elements|이미지·오디오·비디오 임베드]], [[video-performance|동영상 성능: 형식·poster·자동 재생·임베드]], [[animated-icon|Animated Icon — 영상을 투명 배경 아이콘으로 쓰기]]
