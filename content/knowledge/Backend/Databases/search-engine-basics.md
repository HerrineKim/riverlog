---
title: "검색엔진의 원리: 역인덱스와 랭킹"
concept: "Search Engine"
summary: "검색엔진은 문서를 토큰으로 쪼개 단어 → 문서의 역인덱스를 만들고(색인), 질의어를 같은 방식으로 처리해 찾은 뒤 TF-IDF·BM25 같은 점수로 순서를 정한다(질의). 한국어는 형태소 분석이나 N-gram이 필요하다."
tags: ["backend", "search", "database", "algorithm", "data-structure"]
source: other
date: "2026-10-31"
sources: ["https://github.com/charsyam/simple_search_engine", "https://xo.dev/articles/how-search-engine-works", "https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-similarity.html", "https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-nori.html", "https://www.facebook.com/notes/facebook-engineering/under-the-hood-building-out-the-infrastructure-for-graph-search/10151347573598920", "https://www.facebook.com/notes/facebook-engineering/under-the-hood-indexing-and-ranking-in-graph-search/10151361720763920", "https://www.facebook.com/notes/facebook-engineering/under-the-hood-the-natural-language-interface-of-graph-search/10151432733048920", "http://www.ardendertat.com/2011/05/30/how-to-implement-a-search-engine-part-1-create-index/", "http://www.ardendertat.com/2011/05/31/how-to-implement-a-search-engine-part-2-query-index/", "http://www.ardendertat.com/2011/07/17/how-to-implement-a-search-engine-part-3-ranking-tf-idf/"]
---

> 강대명의 「간단한 검색엔진의 원리」(BoB 보안개발트랙 강의 자료, 2022)를 바탕으로 재구성하고, 「DB 검색의 한계」는 blurfx의 「[검색 엔진은 어떻게 작동하는가](https://xo.dev/articles/how-search-engine-works)」(2023.04)로 보강한 노트다. 크롤러·PageRank·질의 의도 같은 웹 검색엔진 전체 흐름은 [[web-search-engine|웹 검색엔진의 동작: 크롤링, 색인, 랭킹, 질의 처리]]에 있다. 관계를 검색하는 그래프 검색은 Facebook Engineering의 「Under the Hood」 연재 「[Building out the infrastructure for Graph Search](https://www.facebook.com/notes/facebook-engineering/under-the-hood-building-out-the-infrastructure-for-graph-search/10151347573598920)」, 「[Indexing and ranking in Graph Search](https://www.facebook.com/notes/facebook-engineering/under-the-hood-indexing-and-ranking-in-graph-search/10151361720763920)」, 「[The natural language interface of Graph Search](https://www.facebook.com/notes/facebook-engineering/under-the-hood-the-natural-language-interface-of-graph-search/10151432733048920)」(2013)로 보강했다. 위치 포함 게시 목록과 구문 질의 알고리즘, TF 정규화와 벡터 공간 모델은 Arden Dertat의 「How to Implement a Search Engine」 3부작([색인](http://www.ardendertat.com/2011/05/30/how-to-implement-a-search-engine-part-1-create-index/), [질의](http://www.ardendertat.com/2011/05/31/how-to-implement-a-search-engine-part-2-query-index/), [TF-IDF](http://www.ardendertat.com/2011/07/17/how-to-implement-a-search-engine-part-3-ranking-tf-idf/))으로 보강했다.

## 검색엔진이란

검색엔진은 **어떤 단어가 들어간 문서를 빠르게 찾고, 관련도 순으로 정렬해 돌려주는 시스템**이다. DB의 `LIKE '%단어%'`는 인덱스를 타지 못해 전체 행을 훑고, 결과의 순서(랭킹)도 정해 주지 않는다. 이 두 가지가 필요해지면 검색엔진을 쓴다.

### DB 검색의 한계

| 방법 | 동작 | 한계 |
| --- | --- | --- |
| 문서마다 부분 문자열 비교 | 질의어가 본문에 있는지 하나씩 본다 | 문서 수 × 길이만큼 걸린다. `apple juice`를 단어로 나누면 단어 수만큼 더 느려진다 |
| `LIKE '%단어%'`, `REGEXP` | 패턴 일치 | 앞에 `%`가 붙으면 B-트리 인덱스를 못 탄다 |
| `FULLTEXT` 인덱스 (MySQL `MATCH … AGAINST`, PostgreSQL `tsvector`) | DB 안의 역인덱스 | 대부분의 경우 충분히 빠르지만, 오타 허용·랭킹 조정·한국어 분석·비정형 데이터 처리가 약하다 |

이 한계를 넘는 기능(퍼지 검색, 분석기, 점수 조정)을 갖춘 것이 Elasticsearch·OpenSearch·Solr 같은 전용 검색엔진이다.

**검색엔진은 직접 만들지 않는다.** 색인·질의·랭킹·분산·장애 처리를 모두 구현하는 비용이 크고, 직접 만든 것은 버그가 많다. 서비스에서는 Elasticsearch나 OpenSearch(둘 다 Apache Lucene 기반)를 쓰고, 원리는 튜닝과 문제 해결을 위해 이해한다.

## 두 과정: 색인과 질의

색인(Indexing)

```mermaid
flowchart LR
  src["데이터 소스(웹·파일·DB)"] --> crawl["수집(크롤링)"] --> raw["원본 저장"]
  crawl --> analyze["분석(토큰화·정규화)"] --> inv["역인덱스"]
```

질의(Query)

```mermaid
flowchart LR
  q["사용자 질의어"] --> an["같은 분석"] --> lookup["역인덱스 조회"] --> rank["랭킹(점수)"] --> res["결과"]
  log["클릭 로그 등으로 랭킹 평가·개선"] --> rank
```

**질의어도 색인과 똑같은 분석 과정을 거쳐야 한다.** 색인할 때 소문자로 바꿨다면 질의어도 소문자로 바꿔야 일치한다.

수집(크롤링)은 대부분 필요 없다. 서비스는 자기 DB를 색인하고, Elasticsearch도 크롤러를 포함하지 않는다. 외부 사이트를 수집할 때의 robots.txt 규칙은 [[seo-basics|SEO 기초: 크롤링부터 메타 태그까지]]에 있다.

## 역인덱스 만들기

일반 인덱스가 "문서 → 단어"라면, **역인덱스(Inverted Index)는 "단어 → 그 단어가 든 문서 목록"이다.** 책 뒤의 찾아보기와 같다.

세 문서로 만들어 보면 이렇다.

```text
DOC1: The bright blue butterfly hangs on the breeze.
DOC2: It's best to forget the great sky and to retire from every wind.
DOC3: Under blue sky, in bright sunlight, one need not search around.
```

| 단계 | 하는 일 | 예 |
| --- | --- | --- |
| 1. 토큰화(Tokenizing) | 문장을 단어로 쪼갠다 | `The`, `bright`, `blue`, … |
| 2. 정규화 | 특수문자 제거, 소문자 변환 | `breeze.` → `breeze`, `The` → `the` |
| 3. 불용어 제거 | 너무 흔해 검색 가치가 없는 단어를 뺀다 | `the`, `a`, `and`, `to`, `in` … |
| 4. 어간 추출(Stemming) | 어미를 떼고 어간만 남긴다 | `hangs` → `hang` |
| 5. 정렬·병합 | 단어순으로 정렬하고 같은 단어의 문서 목록을 합친다 | `blue: 1, 3` |

결과 역인덱스의 일부는 다음과 같다.

| 단어 | 문서 |
| --- | --- |
| blue | 1, 3 |
| bright | 1, 3 |
| hang | 1 |
| sky | 2, 3 |
| wind | 2 |

이제 질의는 목록 조회와 집합 연산이다. `sky`는 {2, 3}, `blue`는 {1, 3}이므로 `blue AND sky`는 교집합 {3}이다. 불용어로 검색하면 인덱스에 없으므로 결과가 나오지 않는다.

실제 역인덱스는 문서 번호와 함께 **단어의 위치(position)** 도 저장한다. `blue sky`처럼 구(phrase)로 검색할 때 두 단어가 붙어 있는 문서를 더 높게 칠 수 있다.

단어 사전은 해시 테이블이나 B+ 트리로도 담을 수 있지만, Lucene은 FST(Finite State Transducer)라는 압축 오토마타로 저장해 접두사 검색과 메모리 효율을 함께 얻는다.

위치를 담은 게시 목록은 `'web': [[1, [0, 2]], [2, [2]], [3, [1]]]`(1번 문서의 0·2번째, 2번 문서의 2번째 …)처럼 생겼다. **구문 질의**는 이렇게 푼다.

```text
"computer science department"
1. 세 단어의 문서 집합 교집합을 구한다 (작은 목록부터, 중간이 비면 즉시 중단)
2. 남은 문서마다 i번째 단어의 위치에서 (i−1)을 뺀다
   문서 1: [[2,5], [3], [4,6]] → [[2,5], [2], [2,4]]
3. 위치 목록들의 교집합이 비어 있지 않으면 단어가 순서대로 붙어 있다 → {2} 일치
```

빼기 + 해시 교집합은 O(N·K)(N: 단어 수, K: 위치 수)이고, 첫 목록의 위치마다 다른 목록을 이진 탐색하면 O(K·N·log K)다. 보통 단어 수는 적고 위치 수는 많아 빼기 방식이 유리하다. 질의에도 색인과 **똑같은 전처리**(소문자화, 불용어, 어간 추출)를 해야 맞는다. 어간 추출은 색인 시간을 몇 배로 늘리는 비싼 단계다.

## 한국어 색인

한국어는 띄어쓰기 단위(어절)에 조사·어미가 붙어 있어 공백 토큰화만으로는 같은 단어가 모이지 않는다. `보안개발트랙입니다`와 `보안개발트랙에서는`은 다른 토큰이 되고, 영어처럼 `-s`, `-ing`를 떼는 규칙으로는 어미를 걷어낼 수 없다.

| 방법 | 원리 | 장점 | 단점 |
| --- | --- | --- | --- |
| 형태소 분석 | 사전으로 명사·조사·어미를 나눈다 (`보안개발트랙` + `에서` + `는`) | 색인이 작고 정확하다 | 사전에 없는 신조어·복합어를 놓친다 |
| N-gram | 언어 지식 없이 N글자씩 자른다 (2-gram: 보안, 안개, 개발, 발트, 트랙) | `개발트랙`처럼 부분 문자열도 찾는다 | 색인이 커지고 `안개` 같은 엉뚱한 일치가 생긴다 |

- Elasticsearch·OpenSearch는 공식 한국어 분석기 **Nori**(mecab-ko-dic 사전 기반)를 제공한다. 사용자 사전으로 복합어를 등록하고 `decompound_mode`로 분해 수준을 정한다.
- 파이썬에서는 KoNLPy(Mecab·Komoran·Okt 래퍼)나 Kiwi(`kiwipiepy`)를 쓴다.
- 실무에서는 형태소 분석 필드와 N-gram 필드를 함께 두고 점수를 합치는 경우가 많다.

## 랭킹

`apple`처럼 수많은 문서에 들어 있는 단어는 결과가 너무 많다. 어떤 문서를 먼저 보여 줄지 정하는 것이 랭킹이다. 신호는 단어 중요도(TF-IDF, BM25) 외에도 단어 위치(검색어끼리 가까운가), 신선도, 링크 구조(PageRank) 등이 있다. 웹 검색의 랭킹 신호와 다단계 랭킹은 [[web-search-engine|웹 검색엔진의 동작]]에 있고, 여기서는 단어 중요도 점수만 다룬다.

### 랭킹 점수: TF-IDF에서 BM25로

기본 직관은 **한 문서에 자주 나오지만 전체 문서에서는 드문 단어가 그 문서의 핵심어**라는 것이다. TF-IDF가 이를 그대로 식으로 옮겼다.

```text
TF-IDF  w(i, j) = tf(i, j) × log(N / df(i))

BM25    score(D, Q) = Σ IDF(qᵢ) × f(qᵢ, D) × (k1 + 1)
                                 ─────────────────────────────────────────
                                 f(qᵢ, D) + k1 × (1 − b + b × |D| / avgdl)
        IDF(qᵢ) = ln(1 + (N − n(qᵢ) + 0.5) / (n(qᵢ) + 0.5))
```

| 요소 | 의미 | 효과 |
| --- | --- | --- |
| `tf`, `f(qᵢ, D)` | 문서 안의 단어 빈도 | TF-IDF는 선형으로 오르고, BM25는 **k1 근처에서 포화**한다 |
| `df`, `n(qᵢ)` | 그 단어가 나온 **문서 수**(전체 출현 횟수가 아니다) | 거의 모든 문서에 있는 단어는 IDF가 0에 가까워, 불용어를 따로 안 정해도 약해진다 |
| `k1` | tf 포화 속도 (기본 1.2) | 클수록 반복 횟수가 더 오래 점수에 반영된다 |
| `|D| / avgdl` | 문서 길이 ÷ 평균 문서 길이 | 평균보다 짧은 문서에서 일치할수록 점수가 높다 |
| `b` | 길이 보정 강도 (0~1, 기본 0.75) | 0이면 길이를 무시하고, 1이면 길이로 완전히 나눈다 |

예를 들어 문서 10개 중 `카드뉴스`가 3개, `오늘`이 9개에 있으면 IDF(log₁₀)는 0.52와 0.046이다. TF-IDF의 약점은 **tf가 선형으로 커진다**는 것이다. 같은 단어를 네 번 반복하면 점수가 네 배가 되고, 긴 문서가 유리하다. BM25(Okapi BM25)는 tf 포화와 문서 길이 보정으로 이 둘을 고쳤고, Elasticsearch·OpenSearch·Lucene의 기본 유사도다.

TF-IDF로 순위를 매길 때는 문서와 질의를 같은 단어 공간의 벡터로 놓는다(**벡터 공간 모델**). TF를 문서 벡터 길이(유클리드 노름)로 나눠 정규화해야, 같은 내용을 두 번 이어 붙인 긴 문서가 부당하게 유리해지지 않는다. IDF에 로그를 쓰는 이유는 df가 10인 단어와 100인 단어의 중요도를 10배가 아니라 완만하게 차이 내려는 것이고, 정보 이론의 놀람 정도 −log p와 같은 꼴이다. 질의 벡터와 문서 벡터의 **코사인 유사도**로 정렬한다. 단어 가방(bag of words)이라 「Bob likes Alice」와 「Alice likes Bob」을 구별하지 못한다.

## 관계를 검색하기: 그래프 위의 역인덱스

역인덱스의 「단어」 자리에 **관계**를 넣으면 소셜 그래프도 검색할 수 있다. Facebook 그래프 검색의 기반인 Unicorn이 이 방식이다. 사용자·페이지·장소·사진은 노드, 친구·좋아요·체크인·태그는 간선이고, 「간선 종류:노드 ID」가 색인어가 된다.

```text
색인어                → 게시 목록(posting list)
friend:10003         → [1234, 5678, …]   10003의 친구들
lives-in:111         → [1234, …]         111(뉴욕)에 사는 사람
like:222             → [1234, …]         222(어떤 드라마)를 좋아하는 사람

"뉴욕에 사는 내 친구" = AND(friend:10003, lives-in:111)
```

| 요소 | 하는 일 |
| --- | --- |
| AND·OR와 느슨한 연산 | 문서 검색처럼 교집합·합집합을 하되, 「몇 개는 빠져도 되는 AND」, 「일부는 반드시 맞아야 하는 OR」로 의미를 조절한다 |
| 다중 홉(apply) | 첫 질의 결과를 다음 질의의 입력으로 쓴다. 「페이스북 직원이 좋아한 식당」 = 직원 집합을 구한 뒤 그들의 `like`를 장소 쪽에서 찾는다 |
| 샤드와 집계기 | 메모리에 담기지 않는 색인은 샤드로 나눠 색인 서버에 두고, 집계기가 모든 샤드에 질의를 뿌린 뒤 결과를 모은다(스캐터·개더) |
| 버티컬과 상위 집계기 | 사용자·페이지·사진처럼 엔티티 종류마다 랭킹 요구가 달라 따로 색인(버티컬)하고, 상위 집계기가 버티컬별 점수를 정규화해 하나로 섞는다 |
| 질의 재작성 | 사용자의 말을 구조화된 검색 질의로 바꾼다. 의도 파악, 맞춤법 교정, 동의어, 그리고 검색하는 사람의 친구 관계로 질의를 사회적으로 치우치게 한다 |
| 정방향 색인으로 점수 매기기 | 역인덱스만으로는 점수에 필요한 정보가 부족해, 엔티티마다 메타데이터 덩어리를 함께 저장해 검색 직후 점수를 매긴다 |
| 결과 집합 점수 | 엔티티 하나씩 매긴 점수만 쓰면 결과가 한쪽으로 쏠린다(「직원들 사진」이 대표 한 명의 사진으로 가득 찬다). 결과를 묶어서 보고 다양성을 맞춘다 |

질의 입력을 자연어로 받으면 문법으로 해석하는 단계가 앞에 붙는다. 가중 문맥 자유 문법(WCFG)으로 「검색할 수 있는 문장」을 정의하고, 질의 조각을 엔티티로 인식·해소한 뒤 비용(규칙 비용, 엔티티 일치 비용, 삽입·삭제·치환 같은 어휘 일치 비용)이 가장 낮은 해석 N개를 고른다. 각 해석은 `intersect(friends(나), residents(도시))` 같은 의미 트리로 바뀌어 위의 검색 질의가 된다. 랭킹 변경은 CTR·NDCG·참여 지표를 대조군과 비교하는 실험으로 결정한다.

## 한계와 확장

- 역인덱스는 **글자가 일치해야** 찾는다. `자동차`로 `차량`을 찾으려면 동의어 사전이 필요하다.
- 의미가 비슷한 문서를 찾는 벡터 검색(임베딩 + kNN)이 이 빈틈을 메운다. Elasticsearch·OpenSearch도 벡터 필드를 지원하며, BM25 점수와 벡터 점수를 섞는 하이브리드 검색이 흔하다.
- 오타는 역인덱스에서 그대로 빗나간다. 편집 거리 기반 퍼지 검색으로 비슷한 단어까지 찾는다.
- 랭킹 공식은 출발점이다. 실서비스는 클릭 로그로 결과를 평가하고 가중치를 조정한다.

## 정리

- 검색엔진 = 색인(문서 → 역인덱스) + 질의(같은 분석 → 조회 → 랭킹).
- 역인덱스는 토큰화 → 정규화 → 불용어 제거 → 어간 추출 → 정렬·병합으로 만든다.
- 한국어는 형태소 분석(Nori 등)과 N-gram을 상황에 맞게 섞는다.
- 랭킹의 기본은 BM25다. TF-IDF에 tf 포화와 문서 길이 보정을 더한 것이다.
- 원리를 알고, 구현은 Elasticsearch·OpenSearch에 맡긴다.

관련 노트: [[web-search-engine|웹 검색엔진의 동작: 크롤링, 색인, 랭킹, 질의 처리]], [[text-similarity|문자열·문서 유사도: 편집 거리와 코사인 유사도]], [[seo-basics|SEO 기초: 크롤링부터 메타 태그까지]], [[database-models|데이터베이스 모델: RDB, NoSQL, NewSQL]], [[sql-basics|SQL 기초]], [[elasticsearch|Elasticsearch와 ELK 스택]]
