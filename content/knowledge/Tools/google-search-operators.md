---
title: "구글 검색 연산자"
concept: "Search Operators"
summary: "따옴표·OR·제외·와일드카드 같은 기본 연산자와 site:·intitle:·filetype: 같은 고급 연산자로 구글 검색 결과를 좁히는 법. 일부 연산자는 이미 사라졌으니 조합해 쓰기 전에 동작을 확인한다."
tags: ["tools", "search", "productivity", "tips"]
source: other
date: "2026-10-13"
sources: ["https://www.twinword.co.kr/blog/search-operator-complete-list/", "https://support.google.com/websearch/answer/2466433"]
---

> 트윈워드 블로그의 「[구글 검색을 200% 활용하게 해주는 검색 명령어 총정리](https://www.twinword.co.kr/blog/search-operator-complete-list/)」(Brian Yang)를 바탕으로, 구글 공식 도움말 「[Refine Google searches](https://support.google.com/websearch/answer/2466433)」와 대조해 재구성한 노트입니다.

## 검색 연산자란

검색 연산자(search operator)는 검색어에 붙여 결과를 걸러 내는 명령이다. 크게 검색어 자체를 다루는 **기본 연산자**와 페이지의 특정 부분을 지정하는 **고급 연산자**로 나뉜다. 구글이 공식 도움말에 올려 둔 것은 `" "`, `site:`, `-`, `before:`·`after:`, `filetype:` 정도이고, 나머지는 동작하지만 문서화되지 않은 연산자다. 연산자와 검색어 사이에는 공백을 두지 않는다(`site:github.com` O, `site: github.com` X). 아래 예시는 구글 기준이다.

## 기본 연산자

| 연산자 | 역할 | 예시 |
| --- | --- | --- |
| `" "` | 정확히 그 구문이 들어간 결과만 | `"검색 엔진 최적화"` |
| `OR`, `\|` | 둘 중 하나라도 있으면. `OR`는 대문자로 쓴다 | `구글 OR 네이버` |
| `( )` | 묶어서 계산 순서를 정한다 | `(구글 OR 네이버) 애널리틱스` |
| `-` | 해당 단어가 들어간 결과 제외 | `안드로이드 -구글` |
| `*` | 모르는 단어 자리를 채우는 와일드카드 | `구글 * 콘솔` |
| `before:` / `after:` | 그 날짜 이전·이후에 갱신된 문서. 함께 쓰면 기간이 된다 | `nextjs after:2025-01-01` |
| `..` | 숫자 범위. 비공식이라 정확도는 떨어진다 | `노트북 100..200만원` |
| `in` | 단위 변환. 한글 입력으로는 동작하지 않는다 | `1USD in KRW` |

## 고급 연산자

| 연산자 | 찾는 곳 | 예시 |
| --- | --- | --- |
| `site:` | 특정 사이트·경로 안에서만 | `site:github.com nextjs` |
| `intitle:` / `allintitle:` | 제목에 한 단어 / 모든 단어 | `allintitle: 리액트 테스트` |
| `inurl:` / `allinurl:` | URL에 한 단어 / 모든 단어 | `inurl:docs` |
| `intext:` / `allintext:` | 본문에 한 단어 / 모든 단어 | `allintext: 트윈워드 seo` |
| `filetype:` (= `ext:`) | 특정 파일 형식만 | `filetype:pdf 회계 기초` |
| `define:` | 단어의 사전 정의 | `define:seo` |
| `AROUND(n)` | 두 단어가 n단어 이내에 붙어 있는 문서 | `twinword AROUND(2) lsi` |

`all~:` 계열은 콜론 뒤의 **모든 단어**에 조건을 걸고, `in~:` 계열은 **바로 뒤 한 단어**에만 건다.

## 사라졌거나 불확실한 연산자

| 연산자 | 원래 역할 | 상태 |
| --- | --- | --- |
| `cache:` | 구글이 저장해 둔 페이지 사본 보기 | 2024년에 캐시 링크와 함께 폐지됐다. 대안은 인터넷 아카이브(Wayback Machine)다 |
| `+` | 단어를 반드시 포함 | 2011년에 폐지됐다. 대신 그 단어를 따옴표로 감싼다 |
| `related:` | 비슷한 사이트 찾기 | 공식 도움말에서 빠졌다. 결과가 나오지 않는 경우가 많다 |
| `AROUND(n)` | 근접 검색 | 공식 문서에 없는 비공식 연산자라 결과가 일정하지 않을 수 있다 |

## 조합 예시

```text
site:stackoverflow.com "hydration mismatch" -vue      특정 사이트에서 정확한 오류 문구, Vue 결과 제외
filetype:pdf intitle:"operating system" lecture        강의 자료 PDF 찾기
(nextjs OR next.js) "app router" after:2025-01-01     표기가 갈리는 이름 묶고 기간 지정
```

오류 메시지는 따옴표로 감싸고, 결과가 많으면 `-`로 덜어 내고, 믿을 만한 출처는 `site:`로 고정하는 순서가 가장 자주 쓰인다.

## 정리

- 기본 연산자 셋(`" "`, `-`, `OR`)만 익혀도 결과가 크게 좁혀진다.
- 출처를 고정할 때는 `site:`, 형식을 고정할 때는 `filetype:`, 기간을 고정할 때는 `before:`·`after:`를 쓴다.
- 연산자는 구글 업데이트로 사라지기도 한다. 결과가 이상하면 연산자가 아직 동작하는지부터 의심한다.

관련 노트: [[better-life-tips|더 나은 삶을 위한 100가지 팁]], [[everyday-tech-tips|생활 속 IT 팁]]
