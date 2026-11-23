---
title: "AI 검색 시대의 SEO: 제로클릭, GEO·AEO, 스팸 정책, AI 크롤러"
concept: "AI Search Optimization"
summary: "검색 결과 위에 AI 요약이 뜨면 링크 클릭이 줄어든다(제로클릭). GEO·AEO는 AI 답변에 인용되려는 최적화를 부르는 말이지만, Google의 공식 입장은 생성형 AI 검색 최적화도 여전히 SEO이고 llms.txt나 청킹 같은 별도 기법은 필요 없다는 것이다. Search Console의 생성형 AI 실적 보고서, AI 답변 조작과 뒤로가기 가로채기를 다루는 스팸 정책, AI 크롤러의 robots.txt 토큰, 상품 구조화 데이터와 에이전틱 커머스 프로토콜을 정리했다."
tags: ["seo", "search", "ai", "web", "frontend"]
source: mixed
date: "2026-11-23"
sources: ["https://developers.google.com/search/docs/fundamentals/ai-optimization-guide", "https://developers.google.com/search/docs/appearance/ai-features", "https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports", "https://developers.google.com/search/docs/essentials/spam-policies", "https://developers.google.com/search/blog/2026/04/back-button-hijacking", "https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/", "https://arxiv.org/abs/2311.09735", "https://www.rfc-editor.org/rfc/rfc9309.html", "https://datatracker.ietf.org/wg/aipref/documents/", "https://developers.openai.com/api/docs/bots", "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler", "https://developers.google.com/search/docs/appearance/structured-data/product-snippet", "https://developers.google.com/search/docs/appearance/structured-data/merchant-listing", "https://ucp.dev/", "https://openai.com/index/buy-it-in-chatgpt/", "https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol"]
---

> Google 검색 센터의 「[Optimizing your website for generative AI features on Google Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)」(2026.05)와 「[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)」, 스팸 정책 문서, Pew Research Center의 [AI 요약 클릭 조사](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/)(2025.07), 각 AI 크롤러의 공식 문서를 바탕으로 종합한 노트다.

## 무엇이 달라졌나: 제로클릭

검색 엔진이 링크 목록 위에 **AI가 쓴 요약 답변**(Google의 AI 개요와 AI 모드 등)을 보여 주고, 사용자는 ChatGPT 같은 대화형 서비스에 바로 묻는다. 답을 그 자리에서 얻고 원문 사이트로 넘어가지 않는 검색을 **제로클릭**(zero-click)이라고 한다.

Pew Research Center가 미국 성인 900명의 2025년 3월 브라우징 기록(Google 검색 68,879건)을 분석한 결과는 다음과 같다.

| | AI 요약이 뜬 검색 | 뜨지 않은 검색 |
| --- | --- | --- |
| 일반 검색 결과 링크를 클릭한 비율 | 8% | 15% |
| AI 요약 안의 출처 링크를 클릭한 비율 | 1% | - |
| 검색 뒤 브라우징을 끝낸 비율 | 26% | 16% |

영향은 고르지 않다. 정의·방법·사실 확인처럼 **답 한 줄로 끝나는 정보형 콘텐츠**가 가장 크게 줄고, 구매·예약·도구 사용처럼 사이트에 가야 끝나는 일은 덜 줄어든다. 질문과 답이 쌓이던 Q&A 커뮤니티의 질문 수가 줄어드는 것도 같은 흐름이다.

## 용어: SEO, AEO, GEO

| 용어 | 뜻 |
| --- | --- |
| SEO (Search Engine Optimization) | 검색 엔진이 페이지를 찾고 이해하고 순위에 올리도록 하는 최적화. 기본은 [[seo-basics\|SEO 기초]]에 있다 |
| AEO (Answer Engine Optimization) | 답변 엔진의 답에 콘텐츠가 쓰이도록 하는 최적화 |
| GEO (Generative Engine Optimization) | 생성형 엔진의 응답에 콘텐츠가 인용되도록 하는 최적화. 2023년 논문 「GEO: Generative Engine Optimization」(KDD 2024)에서 나온 이름이고, 논문은 콘텐츠를 고쳐 쓰는 방법에 따라 응답 안의 노출이 최대 40% 늘었다고 보고했다 |

AEO와 GEO는 사실상 같은 일을 가리킨다. 성과를 순위와 클릭 대신 **AI 답변에 인용·언급되는 비중**으로 재려는 점이 SEO와 다르다.

## Google의 공식 입장: 여전히 SEO다

Google 검색 센터의 가이드는 **생성형 AI 검색을 위한 최적화는 검색 경험을 위한 최적화이고, 따라서 여전히 SEO**라고 정리한다. AI 개요와 AI 모드에 나오기 위한 추가 요건이나 특별한 최적화는 없다.

| 필요하지 않은 것 | Google의 설명 |
| --- | --- |
| `llms.txt` 같은 AI용 파일, 전용 마크업, 마크다운 사본 | Google 검색은 이런 파일을 쓰지 않는다. 만들어도 이득도 손해도 없다 |
| 콘텐츠 청킹 | AI가 이해하기 쉽도록 글을 잘게 쪼갤 필요가 없다 |
| AI를 위한 문체로 다시 쓰기 | 생성형 AI 검색만을 위한 글쓰기 방식은 없다 |
| 인위적인 「언급」 늘리기 | 웹 곳곳에 진짜가 아닌 언급을 심는 것은 보이는 만큼 도움이 되지 않는다 |
| AI 전용 구조화 데이터 | 생성형 AI 검색에 필요한 특별한 schema.org 마크업은 없다. 구조화 데이터는 리치 결과 자격에는 여전히 쓸모가 있다 |

대신 지켜야 할 것은 기존 SEO와 같다.

- **자격**: 페이지가 색인돼 있고 검색 결과에 스니펫으로 보일 수 있어야 한다. Search Console 설정에서 사이트가 검색의 생성형 AI 기능에 포함돼 있어야 한다.
- **내용**: 사람들이 독창적이고 유용하다고 느끼는 콘텐츠. 직접 겪은 경험, 자체 데이터, 전문성이 담긴 글이 요약으로 대체되기 어렵다.
- **노출 조절**: AI 기능에 쓰이는 범위는 일반 스니펫과 같은 수단으로 줄인다: `nosnippet`, `data-nosnippet`, `max-snippet`, `noindex`.
- 순위를 보장한다거나 Google 내부 지표를 쓴다는 서드파티 도구는 경계한다.

다만 이것은 **Google 검색**의 입장이다. 다른 AI 서비스는 인용 출처와 수집 방식이 서로 다르므로, 어느 서비스가 어떤 채널(공식 문서, 커뮤니티, 블로그, 영상)을 인용하는지는 서비스별로 따로 확인한다. AI 답변에 노출된다고 방문이나 매출이 보장되지도 않는다.

## 성과를 재는 법

클릭 없이 끝나는 검색이 늘면 순위와 클릭 수만으로는 성과를 설명할 수 없다.

| 지표 | 보는 곳 |
| --- | --- |
| AI 기능에서의 노출 | Search Console의 **생성형 AI 실적 보고서**(Search Generative AI performance reports). 2026년 6월에 일부 사이트에서 시작해 8월 31일에 모든 사이트로 확대됐다. 생성형 AI 기능에서의 **노출수**를 페이지, 국가, 기기, 날짜별로 보여 준다. AI 개요와 AI 모드를 나눠 보여 주지는 않는다 |
| 브랜드 검색량 | 브랜드명·제품명이 들어간 검색어의 추이. AI 답변에서 이름을 보고 나중에 직접 찾아오는 수요가 여기에 잡힌다 |
| AI 답변의 인용·언급 | 주요 질문을 정해 두고 각 AI 서비스의 답에 우리 콘텐츠가 출처로 나오는지 주기적으로 확인한다 |
| 직접 유입과 구독 | 검색을 거치지 않는 방문, 뉴스레터·RSS 구독자, 커뮤니티 언급 |

검색 유입에 기대는 사이트는 트래픽이 줄어드는 것을 전제로 계획을 세운다. 유입 경로를 뉴스레터, 커뮤니티, 앱, 직접 방문으로 나누고, 요약으로 대체되지 않는 것(도구, 원본 데이터, 계정이 필요한 기능)을 늘린다.

## 스팸 정책: 하면 안 되는 것

### AI 답변 조작

Google은 2026년 5월에 스팸 정책이 생성형 AI 응답에도 적용된다고 명확히 했다. 스팸의 정의에 **검색의 생성형 AI 응답을 조작하려는 시도**가 포함된다. 순위 조작과 마찬가지로 수동 조치나 순위 하락, 검색 제외로 이어질 수 있다. 숨긴 텍스트나 대량 생성 콘텐츠처럼 원래 스팸이던 수법은 AI 답변을 노리고 써도 똑같이 스팸이다.

### 뒤로가기 가로채기

**뒤로가기 가로채기**(back button hijacking)는 사이트가 브라우저 방문 기록을 조작해, 사용자가 뒤로가기를 눌러도 왔던 페이지로 바로 돌아가지 못하게 하는 것이다. 뒤로가기를 누르면 방문한 적 없는 페이지나 추천·광고 페이지가 나타나는 식이다.

- Google은 2026년 4월 13일에 이를 스팸 정책의 「악의적 관행」(malicious practices)에 명시했고, **2026년 6월 15일부터** 적용한다. 수동 조치나 자동 순위 하락 대상이다.
- 흔한 구현은 페이지에 들어오자마자 `history.pushState()`로 가짜 기록을 끼워 넣고 `popstate`에서 다른 페이지로 보내는 것이다. 이탈을 막아 체류 시간을 늘리려는 패턴은 모두 해당한다.
- 직접 넣지 않았어도 **포함한 라이브러리나 광고 플랫폼의 스크립트**가 원인일 수 있다. 서드파티 스크립트와 그 설정을 점검한다.
- 수동 조치를 받았으면 고친 뒤 Search Console에서 재검토를 요청한다.

SPA 라우팅이나 모달을 뒤로가기로 닫는 것처럼 사용자가 한 행동에 대응하는 기록 추가는 문제가 아니다. 기준은 사용자가 기대한 곳으로 돌아갈 수 있느냐다.

## AI 크롤러와 수집 거부

AI 회사의 크롤러는 목적에 따라 이름(user-agent 토큰)이 다르다. **학습용 수집과 검색·답변용 수집을 따로** 허용하거나 막을 수 있다.

| 회사 | 모델 학습용 | 검색·답변용 | 사용자 요청으로 가져오기 |
| --- | --- | --- | --- |
| OpenAI | `GPTBot` | `OAI-SearchBot` | `ChatGPT-User` |
| Anthropic | `ClaudeBot` | `Claude-SearchBot` | `Claude-User` |
| Perplexity | - | `PerplexityBot` | `Perplexity-User` |
| Google | `Google-Extended` (Gemini 학습과 그라운딩 제어용 토큰. 별도 크롤러는 아니다) | `Googlebot` (검색과 검색의 AI 기능이 함께 쓴다) | - |
| Apple | `Applebot-Extended` (학습 사용 거부용 토큰) | `Applebot` | - |
| Common Crawl | `CCBot` (공개 크롤 데이터셋. 여러 모델의 학습에 쓰인다) | - | - |

```text
# robots.txt: 학습용 수집은 막고 검색용 수집은 둔다
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /
```

- `Google-Extended`를 막아도 **Google 검색 노출과 순위에는 영향이 없다.** 반대로 AI 개요에 쓰이는 것을 막지도 못한다. AI 개요는 일반 검색 색인을 쓰기 때문에 위의 스니펫 제어나 Search Console의 생성형 AI 설정으로 조절한다.
- 사용자 요청으로 가져오는 에이전트는 사람이 시킨 요청으로 취급해 robots.txt를 그대로 따르지 않을 수 있다.
- **robots.txt는 접근 통제가 아니다.** 표준(RFC 9309)이 스스로 밝히듯 규칙은 크롤러에게 지켜 달라고 요청하는 것이고 강제 수단이 없다. 이름을 밝히지 않거나 규칙을 무시하는 크롤러는 막지 못한다. 실제로 막으려면 로그인 뒤에 두거나 CDN·WAF의 봇 차단을 쓴다.
- 「AI 학습에 쓰지 말라」를 크롤러 이름별이 아니라 **용도별로 한 번에** 표시하는 표준은 IETF의 AI Preferences(AIPREF) 워킹 그룹이 만들고 있다. 용도 어휘(`train-ai`, `search` 등)와 `Content-Usage` HTTP 헤더·robots.txt 규칙을 정의하는 초안이며, 2026년 11월 기준 아직 RFC로 확정되지 않았다. 확정돼도 준수는 크롤러의 자율에 달려 있다.

수집하는 쪽의 예의와 법적 주의점은 [[web-scraping-strategy|웹 크롤링 전략]]에, AI 학습과 저작권 판결은 [[ai-policy-and-regulation|AI 정책과 법]]에 있다.

## 상품 구조화 데이터

상품 페이지에 가격·재고·리뷰를 schema.org의 `Product`로 마크업하면 검색 엔진이 상품 정보를 정확히 읽어 검색 결과에 가격, 별점, 재고 상태를 함께 보여 줄 수 있다. 광고비 없이 검색 결과에서 눈에 띄는 방법이고, AI 에이전트가 상품을 비교할 때 읽는 데이터이기도 하다. Google은 두 유형으로 나눈다.

| 유형 | 대상 페이지 | 필수 속성 |
| --- | --- | --- |
| 제품 스니펫 (product snippet) | 직접 살 수는 없는 상품 페이지(리뷰, 소개) | `name`, 그리고 `review`·`aggregateRating`·`offers` 가운데 하나 이상 |
| 판매자 등록정보 (merchant listing) | 고객이 직접 구매할 수 있는 페이지 | `name`, `image`, `offers`. `offers`는 `Offer` 타입이어야 하고 0보다 큰 `price`와 `priceCurrency`가 있어야 한다 |

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "스테인리스 텀블러 500ml",
  "image": ["https://example.com/img/tumbler.jpg"],
  "offers": {
    "@type": "Offer",
    "price": 18900,
    "priceCurrency": "KRW",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/products/tumbler-500"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.6,
    "reviewCount": 128
  }
}
</script>
```

- 마크업한 값은 **화면에 보이는 값과 같아야** 한다. 가격과 재고가 바뀌면 마크업도 함께 바뀌도록 템플릿에서 출력한다.
- 리치 결과 테스트(Rich Results Test)로 검증한다. 마크업이 맞아도 리치 결과 노출이 보장되지는 않는다.
- JSON-LD의 일반 원리와 schema.org는 [[structured-content|구조화된 콘텐츠와 기계가 읽는 웹]]에 있다.

## 에이전틱 커머스

**에이전틱 커머스**(agentic commerce)는 AI 에이전트가 상품 탐색, 비교, 장바구니 구성, 결제까지 사용자를 대신해 진행하는 쇼핑이다. 출발점이 검색어가 아니라 「이런 조건으로 골라 줘」 같은 의도가 되고, 결제는 사용자가 확인하는 단계로 남기는 설계가 일반적이다.

에이전트와 판매자 시스템이 서로 통하려면 공통 규약이 필요해서 개방형 프로토콜이 나왔다.

| 프로토콜 | 공개 | 다루는 범위 |
| --- | --- | --- |
| AP2 (Agent Payments Protocol) | Google, 2025년 9월 | 에이전트가 대신하는 결제의 위임과 증명. 사용자의 의도와 장바구니에 대한 서명된 위임장으로 「누가 무엇을 승인했나」를 남긴다 |
| ACP (Agentic Commerce Protocol) | OpenAI와 Stripe, 2025년 9월 | 대화 안에서 끝내는 결제. ChatGPT의 즉시 결제 기능과 함께 나왔다 |
| UCP (Universal Commerce Protocol) | Google과 유통·결제사들, 2026년 1월 | 카탈로그, 장바구니, 결제, 계정 연결, 주문 관리까지 쇼핑 흐름 전체. 결제는 AP2 위에 얹는다 |

판매자에게 뜻하는 바는 **상품 데이터를 기계가 읽을 수 있게 정확히 유지하는 일**이 더 중요해진다는 것이다. 사람이 상세 페이지를 보고 고르던 자리를 에이전트가 구조화된 가격·재고·배송 조건을 읽고 고르는 일이 대신한다.

## 정리

- AI 요약이 뜨면 링크 클릭은 줄어든다. 답 한 줄로 끝나는 정보형 콘텐츠가 가장 크게 영향받는다.
- GEO·AEO라는 이름이 붙었지만 Google 검색에서는 별도 기법이 필요 없다. 색인·스니펫 자격과 독창적인 콘텐츠가 그대로 기준이다.
- 성과는 클릭만이 아니라 AI 기능 노출, 브랜드 검색량, 인용 여부로 함께 본다.
- AI 답변 조작과 뒤로가기 가로채기는 스팸 정책 위반이다.
- AI 수집은 학습용과 검색용 토큰을 나눠 robots.txt로 의사를 표시하되, 강제력이 없다는 점을 전제로 한다.
- 상품 정보는 구조화 데이터로 정확히 유지한다. 검색 리치 결과와 쇼핑 에이전트가 같은 데이터를 읽는다.

관련 노트: [[seo-basics|SEO 기초: 크롤링부터 메타 태그까지]], [[structured-content|구조화된 콘텐츠와 기계가 읽는 웹]], [[web-search-engine|웹 검색엔진의 동작]], [[web-scraping-strategy|웹 크롤링 전략]], [[ai-policy-and-regulation|AI 정책과 법]], [[tech-blogging|개발자 기술 블로그]]
