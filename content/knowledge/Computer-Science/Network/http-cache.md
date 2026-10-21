---
title: "HTTP 캐시"
concept: "HTTP Cache"
summary: "Cache-Control, ETag·Last-Modified로 브라우저와 CDN이 응답을 재사용하는 HTTP 캐시. 신선도와 재검증, 자주 쓰는 지시어, 자산별 캐시 전략을 정리한다."
tags: ["network", "http", "cache", "browser", "frontend"]
source: mixed
date: "2026-10-12"
sources: ["https://mingrammer.com/translation-the-hidden-components-of-web-caching/"]
---

> 캐시가 놓이는 위치는 「[웹 캐싱의 숨겨진 요소들](https://mingrammer.com/translation-the-hidden-components-of-web-caching/)」(번역)을 바탕으로 보강했다.

## HTTP 캐시란

HTTP 캐시는 **한 번 받은 응답을 저장해 두었다가 같은 요청에 재사용하는 것**이다. 네트워크 왕복을 아예 없애거나(신선한 캐시), 본문 전송만 생략한다(재검증). 캐시는 브라우저(private cache)와 CDN·프록시(shared cache) 두 곳에 생긴다.

### 캐시가 놓이는 곳

요청이 사용자에서 원본 서버까지 가는 길목마다 캐시가 있을 수 있다.

| 위치 | 예 | HTTP 헤더를 따르나 |
| --- | --- | --- |
| 브라우저 캐시 | 메모리·디스크 캐시, 서비스 워커 캐시 | 브라우저 HTTP 캐시는 따른다. 서비스 워커 캐시는 코드가 정한다 |
| 포워드 프록시 | 회사·ISP 프록시 | 공유 캐시라 `private` 응답은 저장하지 않는다 |
| 엣지(CDN) | 사용자 가까운 PoP | `s-maxage`, `CDN-Cache-Control` 같은 공유 캐시용 지시어와 CDN 설정 |
| 리버스 프록시·게이트웨이 | Nginx, Varnish | 서버 앞에서 응답을 저장. 설정이 헤더보다 우선할 수 있다 |
| 애플리케이션 응답 캐시 | 서버 메모리, Redis | HTTP와 무관. 애플리케이션이 직접 무효화한다 |

앞쪽 캐시가 맞을수록 왕복 시간(RTT), 서버 부하, 대역폭 비용이 함께 준다. 반대로 층이 많을수록 **무효화**가 어렵다. 배포 뒤 옛 응답이 남았다면 어느 층의 캐시인지부터 가린다. CDN은 [[cdn|CDN]], 프록시는 [[proxy|프록시]], 서버 쪽 캐시는 [[caching-strategies|캐싱 전략]]에 있다.

어떻게 캐시할지는 **서버가 응답 헤더로 정한다.** 프론트엔드 개발자는 이 헤더를 읽고 배포 설정에서 고칠 수 있어야 한다.

## 두 단계: 신선도와 재검증

```text
요청 ─▶ 캐시에 있음?
          ├─ 없음 ─────────────────────────▶ 서버에서 받기 (200)
          └─ 있음 ─▶ 아직 신선? (max-age 이내)
                      ├─ 예 ─▶ 서버에 묻지 않고 바로 사용
                      └─ 아니오 ─▶ 조건부 요청으로 재검증
                                   ├─ 안 바뀜 ─▶ 304 Not Modified (본문 없음)
                                   └─ 바뀜   ─▶ 200 + 새 본문
```

### 재검증 헤더

| 응답 헤더 | 다음 요청에 붙는 헤더 | 비교 기준 |
| --- | --- | --- |
| `ETag: "abc123"` | `If-None-Match: "abc123"` | 내용의 식별값 (정확) |
| `Last-Modified: <날짜>` | `If-Modified-Since: <날짜>` | 수정 시각 (초 단위) |

## Cache-Control 지시어

| 지시어 | 의미 |
| --- | --- |
| `max-age=N` | N초 동안 신선하다. 그동안은 서버에 묻지 않는다 |
| `s-maxage=N` | CDN 같은 공유 캐시에만 적용되는 max-age |
| `no-cache` | 저장은 하되, **쓸 때마다 재검증**하라 (캐시 금지가 아니다) |
| `no-store` | 아예 저장하지 마라. 민감한 데이터용 |
| `private` / `public` | 브라우저에만 / 공유 캐시에도 저장 가능 |
| `immutable` | 신선한 동안은 새로고침해도 재검증하지 마라 |
| `stale-while-revalidate=N` | 만료 후 N초 동안은 낡은 응답을 먼저 주고 뒤에서 갱신 |

**`no-cache`와 `no-store`를 헷갈리기 쉽다.** 이름과 달리 `no-cache`는 캐시한다.

## 자산별 전략

| 자산 | 권장 헤더 | 이유 |
| --- | --- | --- |
| 해시 붙은 JS·CSS·이미지 | `public, max-age=31536000, immutable` | 내용이 바뀌면 URL이 바뀌므로 영원히 캐시해도 된다 |
| HTML | `no-cache` (또는 짧은 max-age) | URL이 고정이라 새 배포를 바로 받아야 한다 |
| 공개 API 응답 | `s-maxage=60, stale-while-revalidate=300` | CDN에서 짧게 캐시해 부하를 줄인다 |
| 로그인 사용자 데이터 | `private, no-store` | 다른 사용자에게 섞이면 안 된다 |

## 흔한 문제

- **배포했는데 옛 화면이 보인다**: HTML이 길게 캐시되어 옛 번들을 가리키는 경우가 많다. HTML 캐시 헤더부터 확인한다.
- 캐시에서 왔는지, 헤더가 의도대로인지는 DevTools Network 패널로 확인한다: [[devtools-network|DevTools Network 패널]].

## 정리

- 신선하면 서버에 묻지 않고, 만료되면 ETag·Last-Modified로 재검증한다.
- 정책은 `Cache-Control` 하나에 거의 다 담긴다.
- `no-cache`는 "매번 확인", `no-store`는 "저장 금지"다.
- **해시 파일은 1년 + immutable, HTML은 매번 재검증**이 기본이다.

관련 노트: [[cdn|CDN]], [[Computer-Science/Network/http|HTTP 프로토콜]], [[swr|SWR]], [[cache-and-virtual-memory|캐시 메모리와 MMU]], [[cache-cluster-operations|캐시 클러스터 운영과 장애 대응]], [[image-cdn|이미지 CDN과 Accept 헤더 협상]], [[media-processing-pipeline|이미지·동영상 처리 서버 설계]]
