---
title: "Animated Icon — 영상을 투명 배경 아이콘으로 쓰기"
concept: "Animated Icon"
summary: "Airbnb 스타일 3D 아이콘을 영상으로 만든 뒤, Lava 같은 투명 배경(알파 채널) 애니메이션 포맷으로 바꾸면 앱·웹에서 움직이는 아이콘으로 쓸 수 있다. 포맷별 선택지와 제작 흐름을 정리했다."
tags: ["frontend", "design", "media", "mobile", "animation"]
source: mixed
date: "2026-10-13"
sources: ["https://github.com/AlexStrNik/OpenLava", "https://github.com/Mathvdias/lava_flutter", "https://www.richardrolfs.com/resources/airbnb-2025-lava-icons", "https://jakearchibald.com/2024/video-with-transparency/"]
---

> Airbnb의 Lava 아이콘과 이를 재구현한 공개 자료(OpenLava, lava_flutter README 등)를 바탕으로, AI로 만든 3D 아이콘 영상을 투명 배경 아이콘으로 쓰는 방법을 정리한 노트다. Lava는 Airbnb가 사양을 공개하지 않은 포맷이라 세부 구조는 커뮤니티 구현 기준이다.

## Animated Icon이란

정지 이미지 대신 짧게 움직이는 아이콘이다. 탭 전환, 빈 화면, 온보딩처럼 **눈길을 한 번 끌어야 하는 자리**에 쓴다.

**배경이 투명해야 한다.** 일반 MP4는 알파 채널이 없어서 흰 배경이 같이 찍힌다. 다크 모드나 색 있는 카드 위에 올리면 네모난 박스가 그대로 보인다. 그래서 투명 배경 영상(Transparent background video)을 지원하는 포맷이 필요하다.

## Airbnb의 Lava 포맷

Airbnb는 2025년 5월 앱 리디자인에서 3D 렌더 느낌의 아이콘을 움직이게 만들었고, 이때 쓴 자체 포맷이 **Lava**다. 공식 사양은 공개되지 않았다. 아래 구조는 이를 재구현한 오픈소스(OpenLava, Airbnb와 무관)에서 확인한 내용이다.

| 구성 | 역할 |
| --- | --- |
| `manifest.json` | 캔버스 크기, fps, 반복 구간, 프레임마다 쓸 타일 목록 |
| 키 프레임 이미지 | 첫 프레임 전체. 정지 상태의 완전한 아이콘 |
| 타일 아틀라스 | 이후 프레임에서 **바뀐 부분만** 잘라 모은 이미지 (AVIF·WebP) |

```text
frame 1  = 키 프레임 전체
frame N  = 직전 화면 + (바뀐 타일만 아틀라스에서 복사)
```

- 프레임이 RGBA라서 **어떤 배경 위에서도 매트 없이** 섞인다.
- 같은 타일은 한 번만 저장하므로 아이콘처럼 움직임이 작은 애니메이션에 유리하다. lava_flutter 기준 48프레임 아이콘이 60~250KB 정도다.
- 비디오 디코더 없이 이미지 복사(blit)만으로 그려서 가볍다.

## 투명 아이콘 포맷 비교

| 포맷 | 투명 | 장점 | 한계 |
| --- | --- | --- | --- |
| GIF | 1비트 | 어디서나 재생 | 가장자리 계단 현상, 용량 큼 |
| Lottie (JSON) | O | 벡터라 선명, 작음 | 3D 렌더·질감 표현은 어렵다 |
| WebM (VP9 알파) | O | `<video>`로 바로 재생 | Safari는 HEVC 알파(MOV)를 따로 준비해야 한다 |
| 애니메이티드 WebP·AVIF | O | `<img>`로 재생, 현대 브라우저 지원 | 긴 영상엔 비효율 |
| Lava (OpenLava) | O | 3D 질감 + 작은 용량 + 매끄러운 루프 | 전용 렌더러 필요 (Web·iOS·Flutter 구현 존재) |

**3D 렌더 같은 질감**이면 Lottie로는 안 되고 래스터 프레임 기반(WebM·WebP·Lava) 중에서 고른다.

## 제작 흐름

```text
1. 이미지 생성      Airbnb 아이콘 스타일 프롬프트로 정지 이미지 (예: 진저캣)
2. 영상화          이미지→영상 모델로 짧은 루프 애니메이션
3. 배경 제거        단색 배경을 키잉하거나 배경 제거 도구로 알파 채널 확보
4. 프레임 추출      투명 PNG 시퀀스 (예: 30fps, 48프레임)
5. 인코딩          Lava 인코더 / WebM VP9 / 애니메이티드 WebP
6. 삽입            전용 플레이어 또는 <video>·<img>
```

프레임 추출과 WebM 변환은 ffmpeg로 할 수 있다.

```bash
# 영상 → PNG 프레임
ffmpeg -i cat.mov -vf fps=30 frames/frame_%03d.png

# 투명 PNG 프레임 → 알파 채널 WebM
ffmpeg -framerate 30 -i frames/frame_%03d.png -c:v libvpx-vp9 -pix_fmt yuva420p cat.webm
```

웹에서는 브라우저별로 소스를 나눠 준다.

```html
<video autoplay loop muted playsinline width="96" height="96">
  <source src="cat-hevc.mov" type='video/mp4; codecs="hvc1"' />
  <source src="cat.webm" type="video/webm" />
</video>
```

## 주의할 점

- **루프 이음매**: 마지막 프레임이 첫 프레임으로 자연스럽게 이어져야 한다. AI 영상은 끝이 어긋나기 쉬워서 앞뒤를 잘라 맞춘다.
- **알파 보존**: MP4(H.264)로 한 번이라도 내보내면 알파가 사라진다. 중간 산출물은 PNG 시퀀스나 ProRes 4444로 둔다.
- **가장자리 테두리**: 흰 배경에서 키잉하면 털 끝에 흰 테두리(fringe)가 남는다. 단색 크로마 배경으로 생성하면 덜하다.
- **크기와 개수**: 아이콘 하나당 수백 KB 안쪽으로 맞추고, 한 화면에 여러 개를 동시에 재생하지 않는다.
- **접근성**: `prefers-reduced-motion`이면 첫 프레임 정지 이미지로 대체한다.

## 정리

- 영상을 아이콘으로 쓰려면 **투명 배경(알파 채널)** 이 먼저다.
- Airbnb의 Lava는 키 프레임 + 바뀐 타일만 저장하는 방식으로 3D 아이콘을 가볍게 돌린다.
- 웹에서 바로 쓰려면 WebM(VP9 알파) + Safari용 HEVC 알파가 현실적이고, 앱에서는 OpenLava 계열 렌더러를 쓸 수 있다.
- AI로 이미지 → 영상 → 배경 제거 → 인코딩까지 이으면 디자이너 없이도 움직이는 아이콘을 만들 수 있다.

**결국 Animated Icon은 예쁜 영상보다 투명하게, 가볍게, 끊김 없이 반복되는 영상을 만드는 문제다.**

관련 노트: [[design-system|디자인 시스템: 구성, 도입, 구축과 배포]], [[ai-frontend-design-prompting|AI 모델로 완성도 높은 프론트엔드 디자인 뽑기]]
