---
title: "newspaper로 기사 본문 추출하기"
concept: "Article Extraction"
summary: "사이트별 파서 없이 뉴스·블로그 기사에서 제목·작성자·발행일·본문·이미지를 뽑는 파이썬 라이브러리 newspaper. 관리가 멈춘 newspaper3k 대신 같은 API의 newspaper4k를 쓰고, download → parse → nlp 순서, Source로 사이트 기사 URL 모으기, Configuration으로 언어·헤더·프록시 다루기를 정리한다."
tags: ["python", "scraping", "data-science", "nlp"]
source: other
date: "2026-10-16"
sources: ["https://scrapeops.io/python-web-scraping-playbook/newspaper3k/", "https://github.com/AndyTheFactory/newspaper4k", "https://newspaper4k.readthedocs.io/"]
---

> ScrapeOps의 「[Newspaper3k Guide: Scrape Articles Using AI](https://scrapeops.io/python-web-scraping-playbook/newspaper3k/)」를 바탕으로, newspaper4k 공식 문서로 최신화해 재구성한 노트다.

## 기사 본문 추출이란

기사 본문 추출(article extraction)은 HTML 페이지에서 메뉴·광고·댓글을 걷어내고 **기사 자체의 제목·본문·메타데이터만 골라내는 일**이다. BeautifulSoup으로 직접 하면 사이트마다 CSS 선택자를 따로 짜야 한다. newspaper는 메타 태그와 텍스트 밀도 휴리스틱으로 이를 자동으로 처리해서, **처음 보는 사이트도 파서 없이** 본문을 뽑는다.

뉴스 모니터링, 말뭉치 수집, RAG용 문서 적재처럼 여러 언론사·블로그 글을 대량으로 모을 때 쓴다.

## newspaper3k와 newspaper4k

| 항목 | newspaper3k | newspaper4k |
| --- | --- | --- |
| 상태 | 0.2.8(2018) 이후 릴리스 없음 | 활발히 관리되는 포크. 0.9.x |
| 파이썬 | 구버전 | 3.10 이상 |
| API | `Article`, `build` | 3k API를 그대로 유지하고 `newspaper.article()` 같은 단축 함수, CLI, Google News 소스를 추가 |
| 추출 정확도 | 기준 | 공개 벤치마크에서 F1이 더 높다 |

**새로 쓴다면 newspaper4k다.** 모듈 이름이 그대로 `newspaper`라서 3k 코드는 대부분 패키지만 바꾸면 돌아간다.

```bash
pip install newspaper4k                 # 기본
pip install "newspaper4k[nlp]"          # 키워드·요약(nltk)
pip install "newspaper4k[cloudflare]"   # Cloudflare 보호 사이트(cloudscraper)
pip install "newspaper4k[all]"          # 언어별 토크나이저까지 전부
```

`lxml`, `Pillow`를 빌드하므로 리눅스에서는 `libxml2-dev`, `libxslt1-dev`, `libjpeg-dev` 같은 시스템 패키지가 먼저 필요할 수 있다.

## 기사 하나 처리하기

처리는 **download → parse → nlp** 세 단계이고 순서를 바꿀 수 없다. `parse()` 전에 속성을 읽으면 비어 있고, `nlp()`는 파싱된 본문이 있어야 돈다.

```python
import newspaper

article = newspaper.article("https://example.com/news/123")   # download + parse를 한 번에

# 3k 방식도 그대로 된다
from newspaper import Article
article = Article("https://example.com/news/123", language="ko")
article.download()
article.parse()

article.nlp()                 # 선택. [nlp] extra 필요
```

| 속성 | 내용 | 채워지는 단계 |
| --- | --- | --- |
| `title`, `authors`, `publish_date` | 제목, 작성자 목록, 발행일(`datetime`) | parse |
| `text` | 본문 텍스트 | parse |
| `top_image`, `images`, `movies` | 대표 이미지, 본문 이미지·영상 URL | parse |
| `html` | 받은 원본 HTML | download |
| `keywords`, `summary` | 빈도 기반 키워드, 추출 요약 | nlp |

- `nlp()`의 요약은 본문 문장 몇 개를 골라 붙이는 **추출 요약**이다. 문장을 새로 쓰는 생성 요약이 필요하면 추출한 `text`를 LLM에 넘긴다.
- `nlp()`는 연산이 무겁다. 대량 수집에서는 꼭 필요할 때만 켠다.
- CLI로도 된다: `python -m newspaper --url=<URL> --language=ko --output-format=json`.

## HTML은 직접 받고 파싱만 맡기기

newspaper의 다운로드는 내부적으로 `requests`다. 차단이 잦은 사이트, 로그인·쿠키가 필요한 페이지, JavaScript로 그려지는 페이지는 **HTML을 다른 도구로 받아 `input_html`로 넘기고** newspaper는 파싱만 하게 한다.

```python
import requests
from newspaper import Article

url = "https://example.com/news/123"
html = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10).text
# JS 렌더링이 필요하면 Playwright의 page.content()를 넘긴다

article = Article(url)
article.download(input_html=html)
article.parse()
```

프록시 서비스나 헤드리스 브라우저를 앞단에 두는 구조도 같다. 수집과 추출을 나누면 재시도·캐시·속도 제한을 수집 쪽에서 따로 관리할 수 있다.

## 사이트 전체에서 기사 모으기: Source

`newspaper.build()`는 사이트 첫 화면을 읽어 **카테고리 링크, RSS 피드, 기사 URL 목록**을 만든다. 이 시점에는 기사를 아직 받지 않는다.

```python
import newspaper

source = newspaper.build("https://www.example-news.com", number_threads=3, memoize_articles=False)
print(source.category_urls())
print(source.feed_urls())
urls = [a.url for a in source.articles]

articles = source.download_articles()   # 멀티스레드로 받는다. 오래 걸린다
```

- **`memoize_articles` 기본값은 `True`다.** 한 번 본 기사 URL을 캐시해 두고 다음 `build()`에서 빼므로, 두 번째 실행에서 기사가 0개로 나와 당황하기 쉽다. 매번 전체가 필요하면 `False`로 둔다.
- 스레드를 많이 쓰면 IP가 차단되기 쉽다. `number_threads`를 낮추고, 필요하면 `honor_robots_txt=True`로 robots.txt를 따른다(`[robotstxt]` extra).
- Google News 결과를 소스로 쓰려면 `[gnews]` extra의 `GoogleNewsSource`를 쓴다.

## 설정: Configuration

`Article`과 `build()`에 키워드 인자로 넘기거나 `Config` 객체를 만들어 공유한다.

| 설정 | 기본값 | 용도 |
| --- | --- | --- |
| `language` | 메타 태그로 자동 감지, 실패 시 영어 | 언어가 틀리면 본문이 빈 채로 나온다. 한국어는 `"ko"`로 지정 |
| `browser_user_agent`, `headers` | 라이브러리 기본값 | 봇 차단 회피, 사이트 요구 헤더 |
| `request_timeout`, `proxies` | - | `requests`에 그대로 전달된다 |
| `number_threads` | 10 | `download_articles()` 동시 스레드 수 |
| `fetch_images` | `True` | 이미지 크기 확인을 끄면 빨라진다 |
| `memoize_articles` | `True` | 본 기사 URL 캐시 |
| `min_word_count` | 300 | 이보다 짧은 글은 기사로 보지 않는다. 짧은 블로그 글이 빠지면 낮춘다 |

```python
from newspaper import Config, Article

config = Config()
config.browser_user_agent = "Mozilla/5.0 ..."
config.request_timeout = 10
config.proxies = {"https": "http://user:pass@proxy:8080"}
config.fetch_images = False

article = Article(url, config=config, language="ko")
```

지원 언어는 80개 이상이고 한국어(`ko`)도 포함된다. 중국어·일본어·태국어처럼 띄어쓰기가 다른 언어는 `[zh]`·`[ja]`·`[th]` extra로 토크나이저를 설치해야 키워드·요약이 제대로 나온다.

## 한계

| 증상 | 원인 | 대응 |
| --- | --- | --- |
| `text`가 비어 있다 | JS 렌더링 페이지, 언어 오감지, 짧은 글 | 브라우저로 받은 HTML을 `input_html`로, `language` 지정, `min_word_count` 낮추기 |
| 403·차단 | 봇 탐지 | User-Agent·프록시 설정, `[cloudflare]` extra, 요청 속도 줄이기 |
| 작성자·날짜가 틀린다 | 사이트마다 메타데이터 품질이 다르다 | 중요한 필드는 사이트별 선택자로 검증한다 |
| 두 번째 `build()`가 0건 | `memoize_articles` 캐시 | `memoize_articles=False` |

휴리스틱 추출이라 **정확도는 100%가 아니다.** 특정 몇 개 사이트만 정밀하게 긁는다면 사이트별 선택자(BeautifulSoup, Scrapy)가 더 믿을 만하다. 같은 일을 하는 대안으로 trafilatura가 있다. 수집 대상 사이트의 이용 약관과 robots.txt, 저작권은 별개로 확인한다.

## 정리

- newspaper는 **처음 보는 사이트에서도 기사 본문·메타데이터를 파서 없이** 뽑는다.
- newspaper3k는 관리가 끝났다. 같은 API의 **newspaper4k**를 쓴다.
- 순서는 `download → parse → nlp`. 요약은 추출 요약이다.
- 차단·JS 페이지는 HTML을 따로 받아 `input_html`로 넘기고 파싱만 맡긴다.
- `build()`를 반복 실행할 때는 `memoize_articles` 캐시를 기억한다.

관련 노트: [[python-data-analysis|파이썬 데이터 분석 프로세스]], [[nlp-pipeline|자연어 처리 파이프라인]], [[text-similarity|문자열·문서 유사도]], [[naver-blog-crawling|네이버 블로그 크롤링]]
