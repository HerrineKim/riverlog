---
title: "SPA와 CSR·SSR"
concept: "SPA"
summary: "한 페이지에서 필요한 부분만 다시 그리는 SPA와, 렌더링 주체에 따른 CSR·SSR의 차이."
tags: ["web", "rendering", "spa", "seo"]
source: til
---

**SPA(Single Page Application)** 는 처음에 한 번만 페이지를 받아 오고, 이후에는 서버에서 새 페이지 전체를 받지 않고 **현재 페이지의 필요한 부분만 동적으로 다시 그리는** 웹 애플리케이션이다. 화면 전환이 매끄러워 네이티브 앱과 비슷한 사용자 경험을 준다. SPA는 주로 CSR 방식으로 동작하므로, CSR과 SSR의 차이를 함께 이해해야 한다.

## SPA의 등장 배경

1. 과거에는 요청마다 새 HTML 페이지를 응답하는 **MPA(Multi Page Application)** 방식이었다.
2. 스마트폰 보급으로 트래픽 절감, 빠른 반응성 같은 모바일 최적화가 중요해졌다.
3. React, Vue.js 같은 프론트엔드 프레임워크가 등장하며 CSR 기반의 SPA가 보편화되었다.

## CSR (Client Side Rendering)

![CSR](/images/til/FRONTEND/Web/SPA.assets/CSR.png)

- 최초 요청 시 데이터가 비어 있는 HTML 뼈대와 CSS·JS 리소스를 받는다.
- 이후 클라이언트가 필요한 **데이터만** 요청하고, JavaScript로 DOM을 그린다.

| 장점 | 단점 |
| --- | --- |
| 정적 리소스는 한 번만 받고 데이터만 갱신하므로 서버와의 트래픽이 줄어든다 | 첫 화면이 완성되기까지(초기 로딩)가 SSR보다 느리다 |
| 바뀌는 부분만 갱신해 화면 전환이 부드럽다(UX 향상) | 최초 HTML에 콘텐츠가 없어 **SEO(검색 엔진 최적화)** 에 불리하다 |

## SSR (Server Side Rendering)

![SSR](/images/til/FRONTEND/Web/SPA.assets/SSR.png)

- 서버가 데이터를 채운 완성된 HTML을 만들어 응답한다.
- JavaScript 웹 프레임워크 이전의 전통적인 방식이다(예: Django 템플릿 렌더링).

| 장점 | 단점 |
| --- | --- |
| 초기 화면이 빨리 보인다 | 요청마다 새 페이지를 만들어 전체 새로고침이 반복된다 |
| HTML에 콘텐츠가 이미 있어 SEO에 유리하다 | 트래픽이 상대적으로 많아 서버 부담이 크다 |

## 비교

| 구분 | CSR | SSR |
| --- | --- | --- |
| HTML을 만드는 주체 | 클라이언트(브라우저의 JS) | 서버 |
| 초기 로딩 | 느림 | 빠름 |
| 이후 화면 전환 | 빠르고 부드러움 | 매번 새로고침 |
| SEO | 불리 | 유리 |

두 방식은 "어느 쪽이 더 좋다"가 아니라 서비스 특성에 맞게 고르는 것이다. 예를 들어 Django 템플릿으로 페이지를 그리면서 좋아요·팔로우만 axios로 비동기 처리하는 구조는 SSR을 기본으로 일부만 CSR을 섞은 형태다. Next.js처럼 SSR·SSG와 CSR을 페이지 단위로 섞어 쓰는 프레임워크도 있다([Next.js](/knowledge/dictionary/frontend/nextjs) 참고).

## 핵심 정리

- SPA = 한 페이지에서 필요한 부분만 다시 그리는 앱, 보통 CSR로 동작한다.
- 렌더링 주체가 **서버면 SSR, 클라이언트면 CSR**.
- CSR은 UX와 트래픽에, SSR은 초기 로딩과 SEO에 강하다.
