---
title: "SEO 기초: 크롤링부터 메타 태그까지"
concept: "SEO"
summary: "검색 엔진이 페이지를 크롤링·색인·순위 매기는 흐름과, 프론트엔드가 챙길 robots.txt·사이트맵·메타 태그·canonical·리다이렉트·렌더링 방식을 정리했다."
tags: ["seo", "web", "html", "frontend"]
source: mixed
date: "2026-10-13"
---

검색 엔진 최적화(SEO, Search Engine Optimization)는 검색 결과에서 페이지가 잘 발견되고 높은 순위에 오르도록 콘텐츠와 구조를 다듬는 일이다. 콘텐츠의 질이 가장 중요하지만, **검색 엔진이 페이지를 읽을 수 있게 만드는 것**은 프론트엔드의 몫이다. 「61가지 프론트엔드 용어」([[web-glossary|용어집]])의 SEO·Crawl·Sitemap·Meta Tag·Redirects 항목을 한곳에 모아 보충했다.

## 검색 엔진이 일하는 순서

```text
크롤링(Crawl) → 렌더링 → 색인(Index) → 순위(Rank) → 검색 결과 노출
 봇이 링크를 따라   JS 실행 후   내용을 저장하고   질의마다 관련도와
 페이지를 내려받음   최종 DOM 확보   분류              품질로 정렬
```

| 단계 | 막히는 원인 | 프론트엔드가 할 일 |
| --- | --- | --- |
| 크롤링 | 링크가 `<a href>`가 아니라 `onClick` 이동, robots.txt 차단 | 실제 링크를 쓰고, 사이트맵을 제출한다 |
| 렌더링 | 본문이 JS 실행 뒤에야 생김 | SSR·SSG로 HTML에 본문을 담는다 |
| 색인 | 같은 내용이 여러 URL에 있음, `noindex` | canonical을 지정하고 메타 로봇을 확인한다 |
| 순위 | 느린 페이지, 모바일 미대응 | [[web-vitals|웹 성능 지표]]와 [[responsive-design|반응형]]을 챙긴다 |

## robots.txt와 사이트맵

- **robots.txt**: 사이트 루트에 두고 봇이 **들어가지 말아야 할 경로**를 알린다. 색인을 막는 장치는 아니다. 막힌 페이지도 다른 곳에서 링크되면 주소만 색인될 수 있다. 색인을 막으려면 `noindex` 메타 태그를 쓴다.
- **사이트맵(Sitemap)**: 사이트의 페이지 목록이다. 사람용 HTML 사이트맵과 검색 엔진용 `sitemap.xml`이 있다. XML 사이트맵에는 URL과 마지막 수정일을 적고, robots.txt에 위치를 적거나 구글 서치 콘솔에 제출한다.

```text
# robots.txt
User-agent: *
Disallow: /admin/
Sitemap: https://example.com/sitemap.xml
```

## 메타 태그

메타 태그(meta tag)는 `<head>` 안에서 페이지에 대한 정보를 주는 태그다. 화면에는 보이지 않는다.

| 태그 | 역할 |
| --- | --- |
| `<title>` | 검색 결과의 파란 제목. 페이지마다 다르게 쓴다 |
| `<meta name="description">` | 검색 결과의 요약문 후보. 순위보다 클릭률에 영향을 준다 |
| `<meta name="viewport">` | 모바일 화면 너비에 맞춘다. 없으면 모바일 친화성에서 감점된다 |
| `<meta name="robots" content="noindex">` | 색인하지 말라는 신호 |
| `<link rel="canonical">` | 같은 내용이 여러 URL에 있을 때 대표 URL을 지정한다 |
| `<meta property="og:*">` | 오픈 그래프. 메신저·SNS 공유 미리보기의 제목·이미지·설명 |
| `<link rel="alternate" hreflang="en">` | 다국어 페이지의 언어별 버전을 연결한다 |
| `<link rel="icon">` | 파비콘. 탭과 모바일 검색 결과에 표시된다 |

## 리다이렉트

주소가 바뀌었을 때 옛 URL로 온 방문자와 봇을 새 URL로 보내는 것이다. 상태 코드에 따라 검색 엔진이 다르게 받아들인다.

| 코드 | 뜻 | SEO 관점 |
| --- | --- | --- |
| 301 | 영구 이동 | 검색 엔진이 새 URL로 신호를 옮긴다. 주소 변경·도메인 이전에 쓴다 |
| 302 | 임시 이동 | 옛 URL을 계속 색인할 수 있다. 점검·A/B 테스트처럼 잠깐일 때만 |
| 307 / 308 | 임시 / 영구, **요청 메서드 유지** | POST가 GET으로 바뀌면 안 될 때 |

리다이렉트를 여러 번 잇는 체인은 느리고 봇이 중간에 멈출 수 있다. 한 번에 최종 주소로 보낸다. 이 사이트도 노트를 옮기면 옛 URL을 새 URL로 보내는 설정을 둔다.

## 렌더링 방식과 SEO

| 방식 | 봇이 처음 받는 HTML | SEO |
| --- | --- | --- |
| CSR | 거의 빈 `<div id="root">` | 구글은 JS를 실행해 읽지만 늦고 불안정하다. 다른 검색 엔진·SNS 미리보기는 못 읽을 수 있다 |
| SSR / SSG | 본문이 채워진 HTML | 가장 안전하다 |

자세한 차이는 [[spa-csr-ssr|SPA와 CSR·SSR]]에 있다.

## 체크리스트

- 페이지마다 고유한 `<title>`과 description이 있는가
- 의미에 맞는 제목 계층과 시맨틱 태그를 썼는가 ([[semantic-html|시맨틱 HTML]])
- 이미지에 `alt`가 있는가. 검색 엔진은 이미지 내용을 alt로 이해한다
- 내부 이동이 `<a href>`인가
- 중복 URL에 canonical이, 옮긴 URL에 301이 있는가
- 모바일에서 읽을 수 있고 충분히 빠른가

관련 노트: [[semantic-html|시맨틱 HTML과 문서 구조]], [[spa-csr-ssr|SPA와 CSR·SSR]], [[web-vitals|웹 성능 지표와 Lighthouse]], [[http|HTTP 프로토콜]]
