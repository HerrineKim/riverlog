---
title: "웹 성능 지표와 Lighthouse"
concept: "Web Vitals"
summary: "FCP·LCP·INP·CLS·TTFB 같은 웹 성능 지표의 뜻과 기준값, 실험실 데이터와 필드 데이터의 차이, Lighthouse로 측정하고 압축·캐시·이미지 최적화로 개선하는 법을 정리했다."
tags: ["performance", "web", "frontend", "browser"]
source: mixed
date: "2026-10-13"
---

「빠르다」를 숫자로 말하기 위한 지표들이다. 「61가지 프론트엔드 용어」([[web-glossary|용어집]])의 FCP·LCP·Lighthouse·Minification 항목을 보충했다. 기준값은 구글 web.dev 기준이며 바뀔 수 있다.

## 지표

| 지표 | 무엇을 재나 | 좋음 기준 |
| --- | --- | --- |
| TTFB (Time to First Byte) | 요청 후 첫 바이트가 올 때까지. 서버·네트워크 속도 | 0.8초 이하 |
| FCP (First Contentful Paint) | 텍스트·이미지 같은 **첫 콘텐츠**가 그려질 때까지 | 1.8초 이하 |
| **LCP** (Largest Contentful Paint) | 화면에서 **가장 큰** 이미지·텍스트 블록이 그려질 때까지. 「주요 내용이 보였다」의 대리 지표 | 2.5초 이하 |
| **INP** (Interaction to Next Paint) | 클릭·입력 뒤 다음 화면이 그려질 때까지. 반응성 | 200ms 이하 |
| **CLS** (Cumulative Layout Shift) | 로딩 중 요소가 갑자기 밀리는 정도 | 0.1 이하 |

굵게 표시한 셋이 구글의 **Core Web Vitals**다. 2024년 3월에 INP가 FID(First Input Delay)를 대신했다. 실제 사용자의 75번째 백분위 값으로 판정하고 검색 순위 신호에도 쓰인다.

## 실험실 데이터와 필드 데이터

| | 실험실(lab) | 필드(field) |
| --- | --- | --- |
| 출처 | 정해진 기기·네트워크에서 한 번 측정 | 실제 사용자 크롬 브라우저에서 수집(CrUX) |
| 도구 | Lighthouse, DevTools Performance 패널 | PageSpeed Insights, 서치 콘솔, `web-vitals` 라이브러리 |
| 장점 | 바로 재현하고 원인을 찾기 좋다 | 진짜 체감이다. 순위에 쓰이는 것은 이쪽이다 |
| 한계 | 내 사용자 환경과 다르다 | 데이터가 쌓일 때까지 기다려야 한다 |

INP처럼 실제 상호작용이 필요한 지표는 실험실에서 재기 어렵다. Lighthouse는 대신 TBT(Total Blocking Time)를 보여 준다.

## Lighthouse

구글이 만든 오픈 소스 페이지 품질 검사 도구다. 크롬 DevTools의 Lighthouse 탭, PageSpeed Insights, CLI로 돌린다. **성능, 접근성, 권장사항, SEO** 네 영역을 점수로 매기고 개선 항목을 알려 준다.

- 점수는 실행할 때마다 흔들린다. 시크릿 창에서 확장 프로그램을 끄고 여러 번 재서 본다.
- 모바일 측정은 느린 기기와 네트워크를 흉내 내므로 데스크톱보다 점수가 낮다.
- 점수보다 항목별 진단(「렌더링 차단 리소스 제거」 등)이 실제 할 일이다.

## 지표별 개선 방법

| 지표 | 흔한 원인 | 개선 |
| --- | --- | --- |
| TTFB | 느린 서버, 먼 서버 | 캐시, [[cdn|CDN]], SSG |
| FCP | 렌더링을 막는 CSS·JS | 중요 CSS 인라인, 스크립트 `defer`, 폰트 `font-display: swap` |
| LCP | 큰 히어로 이미지 | 이미지 압축·WebP/AVIF, `fetchpriority="high"`, LCP 이미지는 지연 로딩하지 않기 |
| INP | 메인 스레드를 오래 잡는 JS | 긴 작업 쪼개기, [[debounce-throttle|디바운스]], 불필요한 리렌더링 줄이기 |
| CLS | 크기 없는 이미지·광고, 늦게 뜨는 배너 | `width`·`height`나 `aspect-ratio`로 자리 확보 |

**공통으로 쓰는 기법**

- **압축(Minification)**: 공백, 주석, 긴 변수명을 줄여 파일을 작게 만든다. 빌드 도구(webpack, Vite 등)가 배포 빌드에서 자동으로 한다. 전송할 때는 서버가 gzip·Brotli로 한 번 더 압축한다.
- **캐시**: 바뀌지 않는 파일은 파일명에 해시를 붙이고 오래 캐시한다 ([[http-cache|HTTP 캐시]]).
- **코드 분할**: 지금 화면에 필요한 JS만 먼저 보낸다.

## 정리

- 로딩은 LCP, 반응성은 INP, 안정성은 CLS로 본다.
- Lighthouse로 원인을 찾고, 필드 데이터로 효과를 확인한다.
- 숫자의 감각은 [[frontend-latency-numbers|프론트엔드 지연 시간 숫자]]와 함께 보면 좋다.

관련 노트: [[browser-rendering|브라우저 렌더링 과정]], [[frontend-latency-numbers|프론트엔드 개발자가 알아야 할 지연 시간 숫자]], [[seo-basics|SEO 기초]], [[responsible-javascript|책임감 있는 자바스크립트]], [[responsive-images|반응형 이미지: srcset·sizes와 picture]]
