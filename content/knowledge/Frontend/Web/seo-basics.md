---
title: "SEO 기초: 크롤링부터 메타 태그까지"
concept: "SEO"
summary: "검색 엔진이 페이지를 크롤링·색인·순위 매기는 흐름과, 프론트엔드가 챙길 robots.txt·사이트맵·메타 태그·canonical·리다이렉트·렌더링 방식, 링크와 버튼의 구분을 정리했다."
tags: ["seo", "web", "html", "frontend"]
source: mixed
date: "2026-10-13"
sources: ["https://x.com/azarchick/status/1757102271115166148", "https://developers.google.com/search/docs/crawling-indexing/links-crawlable", "https://webactually.com/2015/04/09/%eb%b0%98%ec%9d%91%ed%98%95-%ec%9b%b9%ec%82%ac%ec%9d%b4%ed%8a%b8%eb%a5%bc-%ec%9c%84%ed%95%9c-%ea%b2%80%ec%83%89%ec%97%94%ec%a7%84-%ec%b5%9c%ec%a0%81%ed%99%94/", "https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing", "https://www.frontendinterviewhandbook.com/kr/html-questions", "https://velog.io/@jiseung/Why-Site-Speed-Matters", "https://bytebytego.com/guides/making-sense-of-search-engine-optimization", "https://developers.google.com/search/docs/crawling-indexing/url-structure"]
---

> 「모바일 우선 색인과 반응형 SEO」 부분은 Bryson Meunier의 「반응형 웹사이트를 위한 검색엔진 최적화」(웹액츄얼리 번역, 2015.04)를 바탕으로 보강한 노트다. hreflang 항목은 Front End Interview Handbook의 「[HTML 질문](https://www.frontendinterviewhandbook.com/kr/html-questions)」을 바탕으로 다국어 페이지 노트와 연결했다. 「순위를 정하는 요소」는 jiseung의 「[Why Site Speed Matters](https://velog.io/@jiseung/Why-Site-Speed-Matters)」 부록으로 보강했다. 「링크와 버튼을 구분한다」는 Kristina Azarenko의 [X 타래](https://x.com/azarchick/status/1757102271115166148)(2024.02)를 Google 검색 센터 문서로 확인해 보강했다. 「색인 단계에서 일어나는 일」과 「크롤러가 읽기 쉬운 사이트 구조」는 ByteByteGo의 System Design 101 가이드 「[Making Sense of Search Engine Optimization](https://bytebytego.com/guides/making-sense-of-search-engine-optimization)」을 Google URL 구조 가이드로 확인해 보강했다.

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
| 순위 | 느린 페이지, 모바일 미대응 | [[web-vitals\|웹 성능 지표]]와 [[responsive-design\|반응형]]을 챙긴다 |

### 색인 단계에서 일어나는 일

크롤러가 가져온 HTML은 그대로 저장되지 않고 전처리를 거친다.

1. HTML 태그와 a·an·the 같은 **불용어(stop word)**, 면책 문구처럼 본문과 무관한 잡음을 걷어 낸다.
2. 남은 키워드로 문서 → 단어의 **정방향 색인**과 단어 → 문서의 **역색인**을 만든다([[search-engine-basics|검색엔진의 원리: 역인덱스와 랭킹]]).
3. 페이지에서 나가는 링크와 들어오는 링크를 세어 **링크 관계**를 계산한다. 들어오는 링크는 순위 신호가 된다.

사용자가 검색하면 이 색인과 순위 알고리즘으로 결과를 정렬한다.

### 크롤러가 읽기 쉬운 사이트 구조

- 크롤러가 읽지 못하는 요소(프레임, 플러그인 콘텐츠, 끝없이 파라미터가 붙는 동적 URL)를 줄인다.
- 사이트 계층을 얕게 둔다. 중요한 페이지는 홈에서 몇 번의 클릭 안에 닿아야 한다.
- URL은 짧고 내용을 설명하게 쓰고 키워드를 넣는다. 단어 구분은 밑줄(`_`) 대신 **하이픈(`-`)** 을 쓴다. 검색 엔진은 하이픈을 단어 경계로 보지만 밑줄로 이은 단어는 한 단어로 읽을 수 있다.
- 키워드는 사업과 관련 있고, **검색량은 많은데 경쟁 페이지는 적은** 것을 고른다.

## 순위를 정하는 요소

검색 결과 페이지(SERP)는 보통 한 쪽에 결과 열 개를 보여 주고, 질의에 답할 가능성이 높은 순서로 줄을 세운다. 그 순서를 정하는 요소는 넷으로 묶을 수 있다.

| 요소 | 무엇을 보나 | 할 일 |
| --- | --- | --- |
| 콘텐츠 품질 | 검색 의도(search intent)에 얼마나 잘 답하나 | 실제로 검색되는 키워드를 조사하고, 사용자가 이루려는 목표에 맞춰 빠짐없이, 읽기 쉽게 쓴다 |
| 페이지 안 요소(on-page) | 콘텐츠가 어떻게 짜였나 | 명확한 제목, 의미 있는 소제목, 설명적인 파일 이름과 대체 텍스트, 이해하기 쉬운 사이트 계층, 메타 정보의 핵심 키워드 |
| 페이지 밖 요소(off-page) | 다른 사이트가 이 페이지를 어떻게 평가하나 | 신뢰받는 사이트가 걸어 주는 링크가 가치의 신호가 된다 |
| 사용자 경험 | 빠르고 안정적으로 뜨나, 모바일에서 쓸 만한가 | [[web-vitals\|Core Web Vitals]], HTTPS, 콘텐츠를 가리는 전면 팝업 피하기 |

- 내부 링크는 사이트 안에서 어떤 페이지가 중요한지 검색 엔진에 알려 준다.
- **키워드 채우기(keyword stuffing)** 처럼 순위를 노리고 키워드를 부자연스럽게 반복하는 블랙햇 기법은 효과가 없고 오히려 불이익을 받는다.

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
| `<link rel="alternate" hreflang="en">` | 다국어 페이지의 언어별 버전을 연결한다. 양방향 연결·`x-default` 규칙은 [[multilingual-pages\|다국어 페이지]]에 있다 |
| `<link rel="icon">` | 파비콘. 탭과 모바일 검색 결과에 표시된다 |

## 리다이렉트

주소가 바뀌었을 때 옛 URL로 온 방문자와 봇을 새 URL로 보내는 것이다. 상태 코드에 따라 검색 엔진이 다르게 받아들인다.

| 코드 | 뜻 | SEO 관점 |
| --- | --- | --- |
| 301 | 영구 이동 | 검색 엔진이 새 URL로 신호를 옮긴다. 주소 변경·도메인 이전에 쓴다 |
| 302 | 임시 이동 | 옛 URL을 계속 색인할 수 있다. 점검·A/B 테스트처럼 잠깐일 때만 |
| 307 / 308 | 임시 / 영구, **요청 메서드 유지** | POST가 GET으로 바뀌면 안 될 때 |

리다이렉트를 여러 번 잇는 체인은 느리고 봇이 중간에 멈출 수 있다. 한 번에 최종 주소로 보낸다. 페이지를 옮기거나 합칠 때는 옛 URL마다 새 URL로 가는 301을 남긴다.

## 링크와 버튼을 구분한다

| | 링크 | 버튼 |
| --- | --- | --- |
| 하는 일 | 다른 페이지(또는 위치)로 **이동**한다 | 폼 제출, 장바구니 담기 같은 **동작**을 일으킨다 |
| 마크업 | `<a href="/products/42">` | `<button>`, 폼 안의 `<input type="submit">` |
| SEO | 검색 엔진이 따라가며 크롤링하고 내부 링크 구조로 읽는다 | 링크로 취급되지 않는다 |

검색 엔진은 `href`가 있는 `<a>`만 링크로 따라간다. `href` 없는 `<a>`, `<span onclick>`, `onclick`으로 `location`을 바꾸는 버튼은 사용자에게는 이동처럼 보여도 **크롤러에게는 링크가 없다.** 그래서 그 뒤의 페이지가 발견되지 않거나 내부 링크 신호를 잃는다([Google 검색 센터: 크롤링 가능한 링크](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)).

- 생김새와 역할을 혼동하지 않는다. 버튼처럼 **보이는** 링크는 문제없다. 마크업은 역할을 따른다.
- 반대로 "장바구니 담기"처럼 동작을 일으키는 버튼에 `<a href>`를 붙이지 않는다.
- SPA 라우터의 링크 컴포넌트(`<Link>` 등)는 실제 `<a href>`를 렌더링하므로 괜찮다. `router.push`만 부르는 버튼으로 페이지 이동을 만들지 않는다.

같은 구분은 접근성에도 그대로 적용된다. 스크린 리더는 링크와 버튼을 다르게 안내하고, 링크는 `Enter`, 버튼은 `Enter`·`Space`로 동작한다([[keyboard-accessibility|키보드 접근성과 포커스 관리]]).

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
| 빠른가 | 페이지 경험 신호에 Core Web Vitals가 들어간다([[web-vitals\|웹 성능 지표]]) |
| 공유하기 쉬운 URL인가 | 사람이 읽고 기억할 수 있는 경로가 링크·공유를 부른다 |

사이트맵은 HTML 페이지용과 이미지·동영상용 확장을 구분해 정확히 쓴다. Search Console의 페이지 색인 보고서로 어떤 URL이 색인되고 빠졌는지 확인한다.

## 체크리스트

- 페이지마다 고유한 `<title>`과 description이 있는가
- 의미에 맞는 제목 계층과 시맨틱 태그를 썼는가 ([[semantic-html|시맨틱 HTML]])
- 이미지에 `alt`가 있는가. 검색 엔진은 이미지 내용을 alt로 이해한다
- 내부 이동이 `<a href>`인가
- 중복 URL에 canonical이, 옮긴 URL에 301이 있는가
- 모바일에서 읽을 수 있고 충분히 빠른가

관련 노트: [[semantic-html|시맨틱 HTML과 문서 구조]], [[spa-csr-ssr|SPA와 CSR·SSR]], [[web-vitals|웹 성능 지표와 Lighthouse]], [[http|HTTP 프로토콜]], [[structured-content|구조화된 콘텐츠와 기계가 읽는 웹]], [[search-engine-basics|검색엔진의 원리]], [[multilingual-pages|다국어 페이지: lang·hreflang과 국제화]], [[web-search-engine|웹 검색엔진의 동작: 크롤링, 색인, 랭킹, 질의 처리]], [[html-head-metadata|문서 head와 메타데이터]]
