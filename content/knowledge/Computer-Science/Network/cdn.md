---
title: "CDN"
concept: "CDN"
summary: "전 세계 엣지 서버에 콘텐츠를 캐시해 사용자 가까운 곳에서 응답하는 CDN. 동작 방식, 얻는 것, 캐시 무효화와 프론트엔드 배포에서의 쓰임을 정리한다."
tags: ["network", "cdn", "cache", "web", "frontend"]
source: mixed
date: "2026-10-12"
sources: ["https://bytebytego.com/guides/what-is-cdn-content-delivery-network", "https://bytebytego.com/guides/how-does-cnd-work", "https://bytebytego.com/guides/why-are-content-delivery-networks-cdn-so-popular", "https://bytebytego.com/guides/a-beginner's-guide-to-cdn-content-delivery-network"]
---

> 여러 자료를 종합한 노트에, ByteByteGo의 System Design 101 가이드 「[What is CDN?](https://bytebytego.com/guides/what-is-cdn-content-delivery-network)」, 「[How Does CDN Work?](https://bytebytego.com/guides/how-does-cnd-work)」, 「[Why are CDNs so Popular?](https://bytebytego.com/guides/why-are-content-delivery-networks-cdn-so-popular)」, 「[A Beginner's Guide to CDN](https://bytebytego.com/guides/a-beginner's-guide-to-cdn-content-delivery-network)」의 DNS 라우팅·계층 구조·요청 라우팅 내용을 보강했다.

## CDN이란

CDN(Content Delivery Network)은 **여러 지역에 흩어진 엣지 서버(PoP)에 콘텐츠 사본을 두고, 사용자와 가장 가까운 서버가 대신 응답하게 하는 네트워크**다. 서울 사용자가 미국 서버의 이미지를 받으려면 태평양을 왕복해야 하지만, CDN이 있으면 서울 근처 엣지에서 바로 받는다.

원래 데이터를 가진 서버는 **오리진(origin)** 이라고 부른다.

## 동작 방식

```text
사용자 ─▶ DNS가 가까운 엣지로 안내 ─▶ 엣지 서버
                                      │
                    캐시 HIT  ─────────┴─▶ 바로 응답 (빠름)
                    캐시 MISS ─▶ 오리진에서 가져와 저장 후 응답
```

- 사용자를 가까운 엣지로 보내는 데 DNS 기반 라우팅이나 애니캐스트(Anycast)를 쓴다.
- 엣지가 얼마나 오래 보관할지는 오리진 응답의 `Cache-Control`(특히 `s-maxage`) 헤더로 정한다.

### DNS로 가까운 엣지 찾기

DNS 기반 CDN에서는 내 도메인을 CDN 도메인의 **별칭(CNAME)** 으로 걸어 둔다. 리졸버가 별칭을 따라가다 보면 CDN의 DNS(로드 밸런서)가 사용자에게 맞는 엣지 IP를 골라 준다.

```text
브라우저: shop.example.com?
  └─ 리졸버 ─▶ 루트 ─▶ TLD ─▶ example.com 권한 서버
                              "shop.example.com은 shop.example.cdn.net의 별칭(CNAME)"
       └─ 리졸버 ─▶ CDN의 권한 서버·로드 밸런서
                    사용자 IP·ISP·요청 콘텐츠·서버 부하를 보고 엣지를 고름
                    "203.0.113.7 (가까운 엣지)"
  └─ 브라우저 ─▶ 엣지 203.0.113.7 에 요청
```

조회 단계 자체는 [[dns|DNS]]의 재귀·반복 질의와 같다. CDN은 마지막 답을 「사용자마다 다르게」 돌려줄 뿐이다.

### 계층형 캐시

엣지에 없다고 바로 오리진으로 가지 않는다. 큰 CDN은 캐시를 여러 층으로 둔다.

```text
엣지 (사용자 근처, 많고 작다)
  └─ MISS ─▶ 지역(regional) 캐시
               └─ MISS ─▶ 중앙(shield) 캐시
                            └─ MISS ─▶ 오리진
```

위층으로 갈수록 수는 적고 용량은 크다. 여러 엣지의 미스가 한 곳으로 모이므로 **오리진까지 가는 요청이 크게 준다.** 오리진 앞에 중앙 캐시 하나를 두는 설정을 흔히 origin shield라고 부른다.

### 구성 요소와 요청 라우팅

| 구성 요소 | 역할 |
| --- | --- |
| 오리진 서버 | 콘텐츠의 원본 |
| 엣지 서버 | 전 세계에 흩어져 콘텐츠를 캐시하고 응답한다 |
| DNS | 도메인 이름을 가장 알맞은 엣지의 IP로 풀어 준다 |
| 컨트롤 플레인 | 엣지 서버의 설정·배포·캐시 퍼지를 관리한다 |

| 라우팅 방식 | 동작 |
| --- | --- |
| GSLB (Global Server Load Balancing) | 지리적 거리, 서버 부하, 네트워크 상태를 보고 DNS 응답을 고른다 |
| 애니캐스트(Anycast) | 여러 데이터센터가 **같은 IP**를 광고한다. 인터넷 라우팅(BGP)이 알아서 가장 가까운 곳으로 보낸다. DDoS 트래픽도 여러 곳으로 흩어진다 |
| IXP 입점 | 주요 인터넷 교환 지점(Internet Exchange Point)에 서버를 두고 ISP와 직접 트래픽을 주고받아 경로를 줄인다 |

### 정적 콘텐츠와 엣지 컴퓨팅

엣지는 정적 파일만 내려 주지 않는다. **엣지 컴퓨팅**은 코드를 엣지에서 실행해 개인화, A/B 테스트 분기, 인증 확인, 이미지 변환 같은 동적 처리를 중앙 데이터센터까지 가지 않고 끝낸다(Cloudflare Workers, Vercel Edge Functions 같은 형태). 실시간성이 중요한 영상 스트리밍·클라우드 게임도 엣지 가까이에서 처리해 지연을 줄인다.

## 얻는 것

| 효과 | 이유 |
| --- | --- |
| 지연 시간 감소 | 물리적 거리가 짧아져 RTT가 줄어든다 |
| 오리진 부하 감소 | 대부분의 요청을 엣지가 처리한다 |
| 대역폭 비용 절감 | 오리진에서 나가는 트래픽이 줄어든다 |
| 가용성 | 트래픽 폭증이나 DDoS를 분산해 흡수한다 |
| 부가 기능 | HTTPS 종료, 압축(gzip·Brotli), 이미지 변환, WAF |

## 무엇을 올리나

- **정적 자산**: JS 번들, CSS, 폰트, 이미지, 영상. 가장 효과가 크다.
- **정적 HTML**: SSG로 빌드한 페이지. Vercel·Netlify·Cloudflare Pages는 빌드 결과를 기본으로 CDN에 올린다.
- **동적 응답 일부**: 짧은 TTL이나 `stale-while-revalidate`로 API·SSR 결과도 캐시할 수 있다. 사용자별 응답은 캐시하면 안 된다.

## 캐시 무효화

엣지에 오래된 파일이 남는 것이 CDN의 대표 문제다.

| 방법 | 설명 |
| --- | --- |
| 파일 이름에 해시 | `app.3f9a2c.js`처럼 내용이 바뀌면 URL이 바뀐다. 1년짜리 캐시를 걸어도 안전하다 (번들러 기본 동작) |
| Purge | CDN 관리 화면이나 API로 특정 경로·태그의 캐시를 지운다 |
| 짧은 TTL | HTML처럼 URL이 고정된 파일은 짧게 캐시하거나 매번 재검증한다 |

## 정리

- CDN은 사용자 가까운 엣지에서 캐시된 사본을 내려 주는 서버망이다.
- HIT면 엣지가 바로 응답하고, MISS면 지역·중앙 캐시를 거쳐 오리진에서 가져와 저장한다.
- 사용자를 가까운 엣지로 보내는 길은 DNS(CNAME + GSLB)와 애니캐스트다.
- 보관 정책은 결국 HTTP 캐시 헤더로 정해진다.
- **해시 붙은 정적 파일은 길게, HTML은 짧게**가 기본 전략이다.

관련 노트: [[http-cache|HTTP 캐시]], [[dns|DNS]], [[nextjs|Next.js]], [[spa-csr-ssr|SPA와 CSR·SSR]], [[frontend-latency-numbers|프론트엔드 개발자가 알아야 할 지연 시간 숫자]], [[high-traffic-resilience|대규모 트래픽에서 서비스를 지키는 설계]], [[image-cdn|이미지 CDN과 Accept 헤더 협상]], [[caching-strategies|캐시 전략]]
