---
title: "프론트엔드 개발자가 알아야 할 지연 시간 숫자"
concept: "Latency Numbers"
summary: "네트워크 왕복, 파싱, 프레임 예산, 사람의 체감 한계를 밀리초 단위로 정리한 표. 지연은 워터폴로 곱해지므로 요청 체인을 서버로 옮기고, JS를 줄이고, 사용자 가까이 배포한다."
tags: ["frontend", "performance", "network", "browser", "web"]
source: other
date: "2026-10-13"
sources: ["https://vercel.com/blog/latency-numbers-every-web-developer-should-know"]
---

> Malte Ubl(Vercel)의 글 「[Latency Numbers Every Frontend Developer Should Know](https://vercel.com/blog/latency-numbers-every-web-developer-should-know)」(2024.04)를 요약·재구성한 노트다. Jeff Dean의 「Latency Numbers Every Programmer Should Know」를 프론트엔드 관점으로 옮긴 글이다.

## 왜 숫자를 외워 두나

페이지 로딩 속도와 사용자 입력에 대한 반응성은 만족도를 좌우한다. 그리고 둘 다 대개 **네트워크 지연(latency)** 이 지배한다.

지연은 세 가지로 정해진다.

- 사용자의 연결 방식 (Wi-Fi, LTE, 5G)
- 서버까지의 물리적 거리
- 그 사이 네트워크의 품질

하나하나는 작아도 **지연은 쌓인다.** 앞 요청이 끝나야 다음 요청을 보내는 깊이 3의 워터폴(waterfall)이라면, 왕복 300ms 회선에서 900ms가 된다. 대략의 숫자를 알고 있으면 설계 단계에서 이런 비용을 어림할 수 있다.

## 지연 시간 표

영향 지표: TTFB(첫 바이트까지 시간), FCP(첫 콘텐츠 표시), LCP(가장 큰 콘텐츠 표시), INP(입력 후 다음 화면까지).

| 항목 | 추정치 | 영향 지표 |
| --- | --- | --- |
| Wi-Fi → 인터넷 | 1–4ms | TTFB, FCP, LCP |
| 5G 고대역(밀리미터파) → 인터넷 | 1–5ms | TTFB, FCP, LCP |
| 60fps에서 한 프레임 안 내 코드 예산 | 5–10ms | 부드러운 프레임 |
| 같은 클라우드 리전 안 서비스·DB 왕복 | 10ms | TTFB, FCP, LCP |
| 5G 중대역 → 인터넷 | 10–30ms | TTFB, FCP, LCP |
| LTE(4G) → 인터넷 | 15–50ms | TTFB, FCP, LCP |
| 60fps 한 프레임 길이 | 16ms | 부드러운 프레임 |
| 같은 대륙 다른 도시 왕복 (약 5,000km) | 33ms | TTFB, FCP, LCP |
| 사람이 "시간이 흘렀다"고 느끼는 최소 시간 | 40–80ms | INP |
| CSS 1MB 파싱 | 100ms | FCP, LCP |
| HTML 1MB 파싱 | 120ms | FCP, LCP |
| 3G → 인터넷 | 150ms | TTFB, FCP, LCP |
| 지구 반대편 왕복, 좋은 망 (cold potato routing) | 150ms | TTFB, FCP, LCP |
| JS 1MB 파싱 | 150ms | FCP, LCP, INP |
| 사람이 "느리다"고 느끼는 시간 | 200ms | INP |
| 지구 반대편 왕복, 전용 광케이블 없음 (hot potato routing) | 300ms | TTFB, FCP, LCP |

수치는 자릿수를 어림하기 위한 값이다. 파싱처럼 기기에 따라 달라지는 수치는 고급 안드로이드 폰 기준이며, 노트북과 아이폰은 대체로 더 빠르고, 보급형 기기는 몇 배 느리다.

## 표를 읽는 법

### 네트워크

- **Wi-Fi**는 신호가 약하거나 장비가 오래되면 느려진다.
- **5G 고대역**은 가장 빠르지만 기지국이 눈에 보이는 도심에서만 현실적이다. 중대역은 신호·기지국 부하에 따라 들쭉날쭉하다.
- **3G**는 표에서 가장 느린 셀룰러 연결이다. 신호가 나쁜 곳의 느린 회선을 어림하는 기준으로 쓴다.
- 같은 대륙 왕복 33ms는 5,000km 기준 계산값이라 실제로는 다를 수 있다.

### 라우팅: cold potato vs hot potato

| 방식 | 경로 | 지구 반대편 왕복 |
| --- | --- | --- |
| cold potato | 사업자의 품질 좋은 망 안에서 최대한 멀리 운반 | 150ms — 단일 리전에 배포했을 때의 최악값 |
| hot potato | 가장 싼 경로로 최대한 빨리 넘김 | 300ms — 먼 서버에 직접 붙거나 저가 CDN을 쓸 때 |

**바이트가 가장 싼 길로 다니면 지연이 두 배가 될 수 있다.** 배포 위치만큼 경로 품질도 중요하다.

### 렌더링과 체감

- 60fps면 16ms마다 한 프레임을 그린다. 브라우저 몫을 빼면 **내 코드에 남는 시간은 5–10ms**다.
- **40–80ms 안에 반응하면 즉각적**으로 느낀다.
- **200ms를 넘으면 느리다**고 느낀다. 이 값은 INP의 "개선 필요(Needs improvement)" 경계이기도 하다.
- 파싱 비용은 CSS < HTML < JS 순이다. **JS는 CSS보다 빨리 불어나는 경향**이 있어 가장 큰 변수가 된다.

## 무엇을 할까

| 원칙 | 방법 |
| --- | --- |
| 네트워크 워터폴을 줄인다 | 요청 체인을 서버로 옮긴다. 예: React Server Components. 같은 리전의 서버 간 요청은 사용자 회선보다 100배쯤 빠를 수 있다. 체인과 단계별 시간은 [[devtools-network|DevTools Network 패널]]의 워터폴로 확인한다 |
| JS 크기를 줄인다 | 코드 분할(code-splitting)이 1순위 |
| 입력 반응을 200ms 아래로 | 무거운 일은 메인 스레드 밖으로 빼서 INP를 지킨다 |
| 사용자 가까이 배포한다 | 거리와 라우팅 품질이 지연을 크게 더한다. 싼 CDN 경로는 지연을 두 배로 만들 수 있다 |

```text
사용자 ──(LTE 15–50ms)── 인터넷 ──(대륙 간 150–300ms)── 서버
                                                       └─(같은 리전 10ms)── DB
→ 워터폴은 오른쪽 짧은 구간에서 돌게 하고, 왼쪽 긴 구간은 한 번만 건넌다
```

## 정리

- 지연은 더해지는 게 아니라 **워터폴 깊이만큼 곱해진다.**
- 사용자 회선 왕복은 수십~수백 ms, 같은 리전 안 왕복은 10ms다. 요청 체인은 서버 쪽에 둔다.
- 사람은 40–80ms 안이면 즉각, 200ms를 넘으면 느리다고 느낀다.
- 한 프레임 안 내 코드 예산은 5–10ms뿐이고, JS 1MB 파싱만 150ms다.
- 같은 거리라도 라우팅 품질에 따라 지연이 두 배까지 벌어진다.

더 많은 어림 숫자는 Napkin Math 같은 자료가 정리해 두었다.

관련 노트: [[cdn|CDN]], [[spa-csr-ssr|SPA와 CSR·SSR]], [[webs-next-transition|웹 아키텍처의 다음 전환]], [[memory-hierarchy|메모리 계층]], [[web-vitals|웹 성능 지표와 Lighthouse]]
