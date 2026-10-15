---
title: "SEO 기초: 크롤링부터 메타 태그까지"
concept: "SEO"
summary: "검색 엔진이 페이지를 크롤링·색인·순위 매기는 흐름과, 프론트엔드가 챙길 robots.txt·사이트맵·메타 태그·canonical·리다이렉트·렌더링 방식을 정리했다."
tags: ["seo", "web", "html", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://webactually.com/2015/04/09/%eb%b0%98%ec%9d%91%ed%98%95-%ec%9b%b9%ec%82%ac%ec%9d%b4%ed%8a%b8%eb%a5%bc-%ec%9c%84%ed%95%9c-%ea%b2%80%ec%83%89%ec%97%94%ec%a7%84-%ec%b5%9c%ec%a0%81%ed%99%94/", "https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing", "https://www.frontendinterviewhandbook.com/kr/html-questions"]
---

> 「모바일 우선 색인과 반응형 SEO」 부분은 Bryson Meunier의 「반응형 웹사이트를 위한 검색엔진 최적화」(웹액츄얼리 번역, 2015.04)를 바탕으로 보강한 노트입니다. hreflang 항목은 Front End Interview Handbook의 「[HTML 질문](https://www.frontendinterviewhandbook.com/kr/html-questions)」을 바탕으로 다국어 페이지 노트와 연결했습니다.

검색 엔진 최적화(SEO, Search Engine Optimization)는 검색 결과에서 페이지가 잘 발견되고 높은 순위에 오르도록 콘텐츠와 구조를 다듬는 일이다. 콘텐츠의 질이 가장 중요하지만, **검색 엔진이 페이지를 읽을 수 있게 만드는 것**은 프론트엔드의 몫이다. 관련 용어의 짧은 정의는 [[web-glossary|용어집]]에 있다.

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
| `<link rel="alternate" hreflang="en">` | 다국어 페이지의 언어별 버전을 연결한다. 양방향 연결·`x-default` 규칙은 [[multilingual-pages|다국어 페이지]]에 있다 |
| `<link rel="icon">` | 파비콘. 탭과 모바일 검색 결과에 표시된다 |

## 리다이렉트

주소가 바뀌었을 때 옛 URL로 온 방문자와 봇을 새 URL로 보내는 것이다. 상태 코드에 따라 검색 엔진이 다르게 받아들인다.

| 코드 | 뜻 | SEO 관점 |
| --- | --- | --- |
| 301 | 영구 이동 | 검색 엔진이 새 URL로 신호를 옮긴다. 주소 변경·도메인 이전에 쓴다 |
| 302 | 임시 이동 | 옛 URL을 계속 색인할 수 있다. 점검·A/B 테스트처럼 잠깐일 때만 |
| 307 / 308 | 임시 / 영구, **요청 메서드 유지** | POST가 GET으로 바뀌면 안 될 때 |

리다이렉트를 여러 번 잇는 체인은 느리고 봇이 중간에 멈출 수 있다. 한 번에 최종 주소로 보낸다. 페이지를 옮기거나 합칠 때는 옛 URL마다 새 URL로 가는 301을 남긴다.

## 렌더링 방식과 SEO

| 방식 | 봇이 처음 받는 HTML | SEO |
| --- | --- | --- |
| CSR | 거의 빈 `<div id="root">` | 구글은 JS를 실행해 읽지만 렌더링 대기열을 거쳐 늦어질 수 있다. SNS 미리보기 봇과 대부분의 AI 크롤러는 JS를 실행하지 않아 내용을 못 읽는다 |
| SSR / SSG | 본문이 채워진 HTML | 가장 안전하다 |

자세한 차이는 [[spa-csr-ssr|SPA와 CSR·SSR]]에 있다.

## 모바일 우선 색인과 반응형 SEO

구글은 모든 사이트를 **모바일 버전 기준으로** 크롤링·색인한다(모바일 우선 색인). 모바일 대응 방식은 셋인데, 구글이 권하는 것은 반응형이다.

| 방식 | 구조 | SEO 관점 |
| --- | --- | --- |
| 반응형 | 같은 URL, 같은 HTML, CSS로 배치만 바꾼다 | 관리할 URL이 하나라 가장 단순하다 |
| 동적 게재 | 같은 URL, User-Agent에 따라 다른 HTML | `Vary: User-Agent`가 필요하고 기기 판별 오류가 생긴다 |
| 별도 URL (`m.` 도메인) | 기기마다 다른 URL | 두 버전을 `rel="alternate"`·`canonical`로 서로 묶어야 한다 |

반응형으로 만들었다고 모바일 SEO가 끝나지는 않는다. 자주 놓치는 것:

| 점검 | 문제와 해결 |
| --- | --- |
| 모든 상태에 실제 URL이 있는가 | 클릭해도 URL이 바뀌지 않는 SPA나 해시뱅(`#!`) URL은 딥 링크가 색인되지 않는다. History API로 경로마다 진짜 URL을 준다 |
| 콘텐츠가 한 도메인에 모였는가 | 같은 콘텐츠가 여러 도메인·서브도메인에 흩어지면 신호가 나뉜다. 한 곳으로 모으고 나머지는 301과 canonical로 정리한다 |
| 글자가 텍스트인가 | 이미지 속 글자는 검색 엔진이 순위에 쓰지 않는다. 텍스트와 웹 폰트로 쓰고, 어쩔 수 없으면 `alt`에 적는다 |
| 모바일에서도 같은 콘텐츠인가 | 모바일에서 숨기거나 뺀 내용은 색인에서도 빠진다. 다만 인쇄용 PDF처럼 모바일에서 쓸 수 없는 기능을 크게 내세우지는 않는다 |
| 기기별 검색어를 담았는가 | 사용자는 「모바일 게임」, 「앱」처럼 기기 특화 검색어로도 찾는다. 해당 콘텐츠가 있다면 그 단어가 페이지에 있어야 한다 |
| 미디어가 모든 기기에서 재생되는가 | 표준 `<video>`·`<audio>`를 쓴다 |
| 앱 설치를 강요하지 않는가 | 콘텐츠를 가리는 전면 팝업(door slam, 침입형 전면 광고)은 모바일 검색 순위에 불리하다. 작은 배너로 알린다 |
| 빠른가 | 페이지 경험 신호에 Core Web Vitals가 들어간다([[web-vitals|웹 성능 지표]]) |
| 공유하기 쉬운 URL인가 | 사람이 읽고 기억할 수 있는 경로가 링크·공유를 부른다 |

사이트맵은 HTML 페이지용과 이미지·동영상용 확장을 구분해 정확히 쓴다. Search Console의 페이지 색인 보고서로 어떤 URL이 색인되고 빠졌는지 확인한다.

## 체크리스트

- 페이지마다 고유한 `<title>`과 description이 있는가
- 의미에 맞는 제목 계층과 시맨틱 태그를 썼는가 ([[semantic-html|시맨틱 HTML]])
- 이미지에 `alt`가 있는가. 검색 엔진은 이미지 내용을 alt로 이해한다
- 내부 이동이 `<a href>`인가
- 중복 URL에 canonical이, 옮긴 URL에 301이 있는가
- 모바일에서 읽을 수 있고 충분히 빠른가

관련 노트: [[semantic-html|시맨틱 HTML과 문서 구조]], [[spa-csr-ssr|SPA와 CSR·SSR]], [[web-vitals|웹 성능 지표와 Lighthouse]], [[http|HTTP 프로토콜]], [[structured-content|구조화된 콘텐츠와 기계가 읽는 웹]], [[search-engine-basics|검색엔진의 원리]], [[multilingual-pages|다국어 페이지: lang·hreflang과 국제화]]
