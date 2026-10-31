---
title: "Compressor로 영상 용량 줄이기"
concept: "Compressor"
summary: "Apple 실리콘(M1 이상) Mac에서 Compressor로 MPEG-4 프리셋을 만들어 하드웨어 인코딩하면 빠르다. 비트레이트를 4,500Kbps로 지정해 보관·공유용으로 용량을 줄이는 설정을 정리했다."
tags: ["tools", "macos", "video", "encoding"]
source: mixed
date: "2026-10-18"
sources: ["https://support.apple.com/guide/compressor/mpeg-4-cpsrf4de2b70/4.6.1/mac/11.5.1"]
---

Compressor는 Apple의 영상 변환·인코딩 앱이다. Final Cut Pro와 함께 쓰는 경우가 많지만 단독으로도 쓸 수 있다. Apple 실리콘(M1 이상) Mac에서는 칩에 내장된 미디어 엔진이 H.264·HEVC 인코딩을 하드웨어로 처리하므로, 소프트웨어 인코더보다 빠르게 mp4를 뽑는다. Apple 문서도 소프트웨어 인코딩은 하드웨어 인코딩보다 크게 느릴 수 있다고 적는다([Compressor 사용 설명서: MPEG-4 설정](https://support.apple.com/guide/compressor/mpeg-4-cpsrf4de2b70/4.6.1/mac/11.5.1)).

## 빠르게 mp4로 줄이는 설정

1. Compressor에서 **새 프리셋**을 만든다 (설정 패널 하단 `+` → New Setting).
2. 포맷으로 **MPEG-4**를 고른다. 결과물이 `.mp4` 컨테이너로 나온다.
3. 비디오 탭에서 데이터 레이트(비트레이트)를 **4,500Kbps**로 지정한다.
4. 원본 영상을 끌어다 놓고 이 프리셋을 적용해 내보낸다.

| 항목 | 값 | 이유 |
| --- | --- | --- |
| 포맷 | MPEG-4 | 어디서나 재생되는 `.mp4` 결과물, 하드웨어 인코딩으로 빠름 |
| 비트레이트 | 4,500Kbps | 1080p 영상을 보관·공유용으로 줄일 때의 출발점 |

## 왜 4,500Kbps인가

- 카메라·화면 녹화 원본은 수십 Mbps로 저장되는 경우가 많다. 4,500Kbps로 다시 인코딩하면 용량이 몇 분의 일로 줄어든다.
- 데이터 레이트를 지정하면 코덱의 다른 화질 설정보다 이 값이 우선한다. 코덱은 이 한도에 맞춰 압축한다.
- 4K나 움직임이 많은 영상(스포츠, 게임)은 같은 비트레이트에서 뭉개짐이 보일 수 있으므로 값을 올린다.

## 정리

- M1 이상 Mac이면 Compressor의 MPEG-4 프리셋으로 하드웨어 인코딩해 mp4를 빠르게 만든다.
- 보관·공유용으로 용량만 줄이려면 비트레이트 4,500Kbps에서 시작해 결과를 확인한다.
- 고해상도·고움직임 영상은 비트레이트를 높여 결과를 확인한다.
