---
title: "Elasticsearch 검색: 매핑·분석기·Query DSL"
concept: "Elasticsearch Query DSL"
summary: "Elasticsearch로 무엇을 어떻게 찾는지 정리했다. 동적·명시적 매핑과 필드 타입, object와 nested, 분석기(문자 필터·토크나이저·토큰 필터), Query DSL의 질의·필터 문맥과 match·term·range·bool·multi_match, BM25 점수와 부스팅, 집계, 페이지네이션(from·search_after·PIT·scroll), suggester, Painless 스크립트, 벡터 검색과 ES|QL까지 다룬다."
tags: ["backend", "search", "database", "elasticsearch"]
source: other
date: "2026-10-30"
sources: ["https://github.com/fru1tworld/cs-basic/blob/main/interview/database/elasticsearch.md", "https://www.elastic.co/docs/reference/query-languages/querydsl", "https://www.elastic.co/docs/manage-data/data-store/mapping", "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results"]
---

> 「[fru1tworld/cs-basic 모의 면접 질문 목록](https://github.com/fru1tworld/cs-basic/blob/main/interview/database/elasticsearch.md)」의 질문을 실마리로, Elastic 공식 문서(Query DSL, 매핑, 검색 결과 페이지네이션)로 확인해 정리한 노트다.

## 검색 기능의 세 층

Elasticsearch에서 검색 품질과 성능은 세 가지가 정한다. **매핑**은 필드를 어떤 타입으로 저장할지, **분석기**는 텍스트를 어떤 토큰으로 쪼갤지, **Query DSL**은 그 토큰을 어떻게 찾고 점수를 매길지다. 색인할 때 정한 매핑·분석이 질의에서 할 수 있는 일을 제한하므로, 질의를 잘 짜려면 앞의 두 층부터 맞아야 한다.

클러스터·샤드·운영은 [[elasticsearch|Elasticsearch와 ELK 스택]]에, 역인덱스와 BM25의 원리는 [[search-engine-basics|검색엔진의 원리: 역인덱스와 랭킹]]에 있다.

## 매핑

**매핑(mapping)** 은 인덱스의 스키마다. 필드마다 타입, 분석기, 색인 여부, 집계용 저장(`doc_values`) 여부를 정한다.

### 동적 매핑과 명시적 매핑

| 구분 | 동적 매핑(dynamic) | 명시적 매핑(explicit) |
| --- | --- | --- |
| 방식 | 처음 보는 필드가 오면 값 모양을 보고 타입을 추측해 매핑에 더한다 | 미리 필드와 타입을 정의한다 |
| 문자열 처리 | `text`(전문 검색) + `keyword` 하위 필드(`ignore_above: 256`) 두 벌을 만든다 | 용도에 맞는 하나만 고른다 |
| 장점 | 바로 넣고 볼 수 있다. 탐색·프로토타입에 편하다 | 저장 공간이 작고 검색 의도가 정확하다 |
| 위험 | 숫자 문자열이 `text`로, 날짜가 문자열로 잡히는 오판. 키가 제각각인 JSON이 필드를 끝없이 만드는 **매핑 폭발**(`index.mapping.total_fields.limit`, 기본 1000) | 새 필드를 넣을 때마다 매핑을 고쳐야 한다 |

`dynamic` 설정으로 처리 방식을 고른다. `true`(추가), `runtime`(색인하지 않고 런타임 필드로), `false`(`_source`에만 남기고 검색 대상에서 뺀다), `strict`(모르는 필드면 문서를 거절). 운영 인덱스는 명시적 매핑 + `strict` 또는 `dynamic_templates`(「`_id`로 끝나는 문자열은 keyword」 같은 규칙)가 안전하다.

**이미 있는 필드의 타입은 바꿀 수 없다.** 색인된 데이터가 그 타입의 자료 구조로 저장돼 있기 때문이다. 필드 추가는 되지만 타입 변경·분석기 변경은 새 인덱스로 재색인한다.

| 타입 | 쓰임 |
| --- | --- |
| `text` | 분석해서 토큰으로 색인한다. 전문 검색. 정렬·집계에는 쓰지 않는다 |
| `keyword` | 통째로 하나의 값으로 색인한다. 정확히 일치, 정렬, 집계(상태 코드, 태그, ID) |
| `long`·`integer`·`double`·`date`·`boolean` | 범위 검색과 집계 |
| `object` | JSON 객체. 내부 필드가 점 표기(`user.name`)로 펼쳐진다 |
| `nested` | 배열 안 객체 하나하나를 독립된 문서처럼 색인한다 |
| `geo_point`·`geo_shape` | 좌표·영역 |
| `dense_vector` | 임베딩 벡터. kNN 검색 |
| `flattened` | 키가 많은 객체를 필드 하나로. 매핑 폭발을 막는다 |

한 값을 여러 방식으로 색인하는 **멀티 필드**(`title`은 `text`, `title.raw`는 `keyword`)로 검색과 정렬을 함께 지원한다.

### object와 nested

```json
{ "user": [ { "first": "John", "last": "Smith" }, { "first": "Alice", "last": "White" } ] }
```

| 구분 | object (기본) | nested |
| --- | --- | --- |
| 저장 | 배열을 필드별로 펼친다. `user.first: [John, Alice]`, `user.last: [Smith, White]` | 배열의 객체마다 숨은 문서를 따로 만든다 |
| `first=John AND last=White` | **맞는다고 나온다.** 객체 경계가 사라져 다른 객체의 값끼리 섞인다 | 맞지 않는다. 같은 객체 안에서만 비교한다 |
| 질의 | 일반 질의 | `nested` 질의로 감싸야 한다. 어느 객체가 맞았는지는 `inner_hits` |
| 비용 | 작다 | 숨은 문서만큼 문서 수가 늘고, 객체 하나를 고쳐도 문서 전체를 다시 색인한다. 필드 수(`index.mapping.nested_fields.limit`, 기본 50)·객체 수(`nested_objects.limit`, 기본 10,000) 한도가 있다 |

배열 안 객체의 **필드 조합**으로 검색해야 할 때만 nested를 쓴다. 객체 수가 많고 자주 바뀌면 부모-자식(`join` 필드)이나 반정규화로 따로 둔다.

### 인덱스 설정과의 차이

매핑은 **데이터의 모양**(필드·타입·분석기 연결)이고, 인덱스 설정은 **인덱스의 운영 방식**(샤드 수, 복제본 수, refresh 주기, 분석기 정의 자체)이다. 분석기는 설정의 `analysis`에서 정의하고, 매핑에서 필드에 연결한다. 설정 항목은 [[elasticsearch|Elasticsearch와 ELK 스택]]의 「인덱스 설정과 템플릿」에 있다.

## 분석기

**분석기(analyzer)** 는 `text` 필드 값을 토큰으로 바꾸는 파이프라인이다. 색인할 때와 검색할 때 같은 분석을 거쳐야 토큰이 맞는다.

```text
원문 "<b>Quick</b> Foxes 달렸다"
  │ 1. 문자 필터(char filter)    0개 이상: HTML 태그 제거, 문자 치환
  ▼   "Quick Foxes 달렸다"
  │ 2. 토크나이저(tokenizer)     정확히 1개: 문자열을 토큰으로 쪼갠다
  ▼   [Quick] [Foxes] [달렸다]
  │ 3. 토큰 필터(token filter)   0개 이상, 순서대로: 소문자화, 불용어 제거, 어간 추출, 동의어
  ▼   [quick] [fox] [달리]
```

| 단계 | 대표 구성 요소 |
| --- | --- |
| 문자 필터 | `html_strip`, `mapping`(문자 치환), `pattern_replace` |
| 토크나이저 | `standard`(유니코드 단어 경계, 기본), `whitespace`, `keyword`(통째로), `ngram`·`edge_ngram`, `nori_tokenizer`(한국어 형태소) |
| 토큰 필터 | `lowercase`, `stop`, `stemmer`, `synonym`·`synonym_graph`, `asciifolding`, `nori_part_of_speech`(품사 제거), `nori_readingform`(한자 → 한글) |

기본 분석기는 `standard`다. 한국어는 공백 단위로 쪼개면 조사가 붙어 검색이 안 되므로 형태소 분석기 Nori(`analysis-nori` 플러그인)를 쓴다. 한국어 분석의 원리는 [[search-engine-basics|검색엔진의 원리]]에 있다.

### 사용자 정의 분석기

```json
PUT products
{
  "settings": {
    "analysis": {
      "char_filter": { "strip_html": { "type": "html_strip" } },
      "tokenizer": { "ko": { "type": "nori_tokenizer", "decompound_mode": "mixed" } },
      "filter": {
        "ko_pos": { "type": "nori_part_of_speech" },
        "syn": { "type": "synonym_graph", "synonyms": ["노트북, 랩톱"] }
      },
      "analyzer": {
        "ko_index":  { "type": "custom", "char_filter": ["strip_html"], "tokenizer": "ko", "filter": ["ko_pos", "lowercase"] },
        "ko_search": { "type": "custom", "tokenizer": "ko", "filter": ["ko_pos", "lowercase", "syn"] }
      }
    }
  },
  "mappings": {
    "properties": { "name": { "type": "text", "analyzer": "ko_index", "search_analyzer": "ko_search" } }
  }
}
```

- 정의는 인덱스 설정의 `analysis`에, 적용은 매핑의 `analyzer`(색인용)·`search_analyzer`(검색용)에 한다. 동의어처럼 검색 때만 넓히고 싶은 처리는 검색 분석기에만 넣는다. 그러면 동의어 사전을 바꿔도 재색인이 필요 없다.
- `POST products/_analyze { "analyzer": "ko_index", "text": "..." }`로 실제 토큰을 확인하면서 맞춘다.
- 이미 있는 인덱스에 분석기를 더하려면 인덱스를 닫았다 연다. 기존 필드의 분석기를 바꾸려면 재색인한다.
- `keyword` 필드에도 소문자화 같은 정규화가 필요하면 토크나이저 없는 **노멀라이저(normalizer)** 를 쓴다.

## Query DSL

### 기본 구조

Query DSL은 JSON으로 쓰는 검색 언어다. 질의는 하나의 필드 조건인 **리프 질의**(`match`, `term`, `range`)와 다른 질의를 감싸는 **복합 질의**(`bool`, `function_score`)로 이루어진다.

```json
GET products/_search
{
  "query": {
    "bool": {
      "must":     [ { "match": { "name": "무선 키보드" } } ],
      "filter":   [ { "term": { "status": "on_sale" } }, { "range": { "price": { "lte": 100000 } } } ],
      "should":   [ { "term": { "brand": { "value": "logitech", "boost": 2 } } } ],
      "must_not": [ { "term": { "adult_only": true } } ]
    }
  },
  "sort": [ "_score", { "created_at": "desc" } ],
  "from": 0, "size": 20,
  "_source": ["name", "price"]
}
```

질의 조건은 두 문맥 중 하나에서 실행된다.

| 문맥 | 묻는 것 | 점수 | 캐시 |
| --- | --- | --- | --- |
| **질의 문맥**(query context) | 「얼마나 잘 맞나」 | 계산한다 | 안 된다 |
| **필터 문맥**(filter context) | 「맞나, 안 맞나」 | 계산하지 않는다 | 자주 쓰이는 필터는 비트셋으로 캐시된다 |

**점수가 필요 없는 조건은 모두 필터 문맥에 둔다.** 상태, 카테고리, 날짜 범위, 권한 조건이 그렇다. 빠르고 캐시된다.

### bool 질의

| 절 | 문맥 | 의미 |
| --- | --- | --- |
| `must` | 질의 | 반드시 맞아야 하고 점수에 더한다 |
| `filter` | 필터 | 반드시 맞아야 하고 점수에 영향이 없다 |
| `should` | 질의 | 맞으면 점수를 올린다. `must`·`filter`가 없는 `bool`에서는 하나 이상 맞아야 한다. `minimum_should_match`로 몇 개가 맞아야 하는지 정한다 |
| `must_not` | 필터 | 맞으면 제외한다. 점수에 영향이 없다 |

`bool`은 중첩할 수 있어 「(A 또는 B) 그리고 C, 단 D 제외」 같은 복잡한 조건을 표현한다. 이 구조가 복잡한 검색을 짜는 기본 틀이다. 상품 검색이라면 키워드는 `must`의 `multi_match`, 카테고리·가격·재고는 `filter`, 프로모션·브랜드 선호는 `should`로 가산점, 차단 상품은 `must_not`으로 둔다.

### match와 term

| 구분 | `match` | `term` |
| --- | --- | --- |
| 질의어 분석 | 필드의 분석기로 **질의어를 분석**한 뒤 토큰으로 찾는다 | 질의어를 **그대로** 하나의 토큰으로 찾는다 |
| 맞는 필드 | `text` | `keyword`, 숫자, 날짜, 불리언 |
| 예 | `"무선 키보드"` → [무선] OR [키보드] (`operator: and`로 둘 다) | `status: "on_sale"` |
| 흔한 실수 | - | `text` 필드에 `term`으로 `"Quick"`을 찾으면 색인된 토큰은 `quick`이라 **안 나온다** |

여러 값 중 하나는 `terms`, 단어 순서까지 맞춰야 하면 `match_phrase`(`slop`으로 사이 간격 허용), 오타 허용은 `match`의 `fuzziness: "AUTO"`다.

### range 질의

```json
{ "range": { "created_at": { "gte": "now-7d/d", "lt": "now/d", "time_zone": "+09:00" } } }
```

- 숫자·날짜·`keyword`(사전순)에 쓴다. `gt`, `gte`, `lt`, `lte`.
- 날짜 수식(date math): `now-7d`는 7일 전, `/d`는 일 단위로 내림. **반올림하지 않은 `now`는 매 요청 값이 달라 캐시되지 않는다.** 일·시 단위로 반올림해 캐시를 살린다.
- 날짜 경계는 시간대를 명시한다. 기본은 UTC다.
- `text` 필드의 범위 질의는 비싸서 기본 설정(`search.allow_expensive_queries`)에 따라 막힐 수 있다. 범위 조건은 대개 점수가 필요 없으므로 `filter`에 둔다.

### multi_match와 교차 필드 검색

여러 필드에서 같은 질의어를 찾는다. `fields: ["title^3", "description"]`처럼 필드별 가중치를 준다.

| `type` | 동작 | 맞는 경우 |
| --- | --- | --- |
| `best_fields` (기본) | 필드별로 점수를 내고 **가장 높은 필드**의 점수를 쓴다(`tie_breaker`로 나머지를 조금 더한다) | 한 필드에 질의어가 몰려 있을 때. 제목에 「무선 키보드」가 다 있는 문서를 위로 |
| `most_fields` | 맞은 필드의 점수를 **더한다** | 같은 내용을 여러 분석기로 색인한 멀티 필드(원형·어간·동의어)를 함께 볼 때 |
| `cross_fields` | 여러 필드를 **하나의 큰 필드처럼** 보고 토큰 단위로 찾는다 | 질의어가 필드에 흩어질 때. `first_name`·`last_name`에 「John Smith」, 주소 필드들 |
| `phrase`, `phrase_prefix`, `bool_prefix` | 필드마다 `match_phrase` 등을 돌린다 | 구절 검색, 입력 중 검색 |

`best_fields`·`most_fields`는 **필드 중심**이라 「John은 first_name에서, Smith는 last_name에서」 맞는 문서를 잘 못 올린다. `operator: and`를 걸면 필드 하나 안에 두 단어가 다 있어야 해서 아예 빠진다. `cross_fields`는 **토큰 중심**이라 각 토큰이 어느 필드에서든 맞으면 된다. 대신 같은 분석기를 쓰는 필드끼리만 묶인다.

## 관련도 점수와 부스팅

### BM25

기본 유사도는 **BM25**다. 토큰마다 세 요소로 점수를 내고 더한다.

| 요소 | 의미 | 조절 |
| --- | --- | --- |
| 단어 빈도(TF) | 문서에 많이 나올수록 높다. 하지만 **포화**한다 | `k1`(기본 1.2): 클수록 늦게 포화 |
| 역문서 빈도(IDF) | 드문 단어일수록 높다 | - |
| 필드 길이 정규화 | 짧은 필드에서 맞으면 높다 | `b`(기본 0.75): 0이면 길이를 무시 |

- IDF는 **샤드별 통계**로 계산된다. 문서가 적은 인덱스에서는 샤드마다 통계가 달라 같은 문서의 점수가 흔들린다. 테스트에서는 샤드를 하나로 두거나 `search_type=dfs_query_then_fetch`로 전체 통계를 먼저 모은다.
- 왜 이 점수가 나왔는지는 `"explain": true`나 `_explain` API로 본다.

점수를 개선하는 방법은 다음 순서로 따진다. 대부분은 분석과 필드 설계에서 풀린다.

1. **분석기**: 형태소·동의어·소문자화가 맞지 않으면 아무리 가중치를 줘도 안 나온다.
2. **필드 가중치**: 제목 `^3`, 태그 `^2`, 본문 `^1`.
3. **질의 구조**: `match_phrase`를 `should`에 더해 구절이 그대로 맞으면 가산점, `minimum_should_match`로 너무 느슨한 결과 제거.
4. **비즈니스 신호**: `function_score`로 인기도·최신성·평점을 섞는다.
5. **재정렬**: 상위 N개만 비싼 질의로 다시 점수 매기는 `rescore`, 학습 기반 랭킹(LTR), 벡터 검색과 섞는 하이브리드 검색.

### 부스팅

| 방법 | 동작 | 예 |
| --- | --- | --- |
| 필드 부스트 `^` | 필드 점수에 배수 | `"fields": ["title^3", "body"]` |
| 질의 `boost` | 특정 절의 점수에 배수 | `should`의 브랜드 일치에 `boost: 2` |
| `boosting` 질의 | `negative`에 맞는 문서를 빼지 않고 점수만 깎는다(`negative_boost: 0.2`) | 품절 상품을 아래로 |
| `function_score` | 점수에 함수 결과를 곱하거나 더한다. `field_value_factor`(판매량 같은 숫자 필드), `gauss`·`exp`·`linear` 감쇠(날짜·거리에서 멀수록 감소), `random_score`, `script_score` | 최근 글일수록, 가까운 매장일수록 위로 |
| `constant_score` | 점수를 고정값으로 | 필터만으로 고른 결과에 일정 점수 |

부스트는 **상대 배수**다. 값이 크다고 순서가 보장되지 않고, 결과는 BM25 점수의 크기와 함께 정해진다. 바꿀 때마다 평가 질의 묶음으로 전후를 비교한다(`_rank_eval` API).

## 집계

**집계(aggregation)** 는 검색 결과에 대해 그룹·통계를 계산한다. SQL의 `GROUP BY` + 집계 함수에 해당한다.

| 종류 | 하는 일 | 예 |
| --- | --- | --- |
| 버킷(bucket) | 문서를 기준에 따라 **묶음으로 나눈다** | `terms`(값별), `date_histogram`(시간 구간별), `range`, `histogram`, `filters` |
| 메트릭(metric) | 문서 묶음에서 **숫자를 계산한다** | `avg`, `sum`, `min`, `max`, `stats`, `cardinality`(고유값 수), `percentiles` |
| 파이프라인(pipeline) | 다른 집계의 결과로 다시 계산한다 | `derivative`, `moving_fn`, `bucket_sort` |

```json
GET logs-*/_search
{
  "size": 0,
  "query": { "range": { "@timestamp": { "gte": "now-1h" } } },
  "aggs": {
    "per_minute": {
      "date_histogram": { "field": "@timestamp", "fixed_interval": "1m" },
      "aggs": { "p95_latency": { "percentiles": { "field": "latency_ms", "percents": [95] } } }
    }
  }
}
```

- 버킷 안에 메트릭이나 다른 버킷을 중첩한다. 문서가 필요 없으면 `size: 0`.
- 집계·정렬은 열 단위 저장인 `doc_values`를 읽는다. `keyword`·숫자·날짜는 기본으로 있고, `text` 필드는 없으므로 집계하려면 `keyword` 하위 필드를 쓴다.
- `terms` 집계는 **근사**다. 샤드마다 상위 N개를 뽑아 합치므로 샤드 경계에서 순위가 틀릴 수 있다. `shard_size`를 키우면 정확해지고 비싸진다. `cardinality`는 HyperLogLog++ 기반 근사치이고, `percentiles`도 근사 알고리즘이다.

## 페이지네이션

| 방식 | 동작 | 맞는 곳 | 한계 |
| --- | --- | --- | --- |
| `from` + `size` | 앞에서 `from`개를 건너뛴다 | 사용자가 보는 앞쪽 몇 페이지 | 샤드마다 `from + size`개를 정렬해 모으므로 깊을수록 비싸다. `index.max_result_window`(기본 10,000)를 넘으면 거절된다 |
| `search_after` | 앞 페이지 마지막 문서의 정렬 값을 넘겨 그다음부터 받는다 | **깊은 페이지, 무한 스크롤** | 앞으로만 간다. 임의 페이지로 건너뛰지 못한다. 정렬에 동점을 깰 고유 값이 있어야 한다 |
| `search_after` + PIT | 시점(point in time)을 열어 그 시점의 데이터로 고정한 채 `search_after`로 넘긴다 | 전체를 일관되게 훑는 내보내기, 일관된 깊은 페이지 | PIT도 세그먼트를 붙잡으므로 `keep_alive`를 짧게 두고 끝나면 닫는다 |
| `scroll` | 첫 검색 시점의 스냅숏을 유지하며 묶음 단위로 계속 받는다 | 옛 방식의 대량 내보내기·재색인 | 열려 있는 동안 병합된 옛 세그먼트를 지우지 못해 자원을 잡아먹는다. **깊은 페이지네이션에는 더 이상 권하지 않고 `search_after` + PIT를 쓴다** |

```json
POST products/_pit?keep_alive=1m        → { "id": "<pit_id>" }

GET _search
{
  "size": 100,
  "pit": { "id": "<pit_id>", "keep_alive": "1m" },
  "sort": [ { "created_at": "desc" }, { "_shard_doc": "asc" } ],
  "search_after": [ 1730246400000, 4294967298 ]
}
```

PIT를 쓰면 `_shard_doc`이 동점을 깨는 정렬 값으로 쓰인다. RDB의 키셋 페이지네이션과 같은 발상이다([[api-pagination|API 페이지네이션]]).

## Suggester와 자동 완성

| 방법 | 동작 | 특징 |
| --- | --- | --- |
| `term` suggester | 질의어 토큰마다 편집 거리가 가까운 색인 토큰을 제안한다 | 「혹시 이것을 찾으셨나요?」 철자 교정 |
| `phrase` suggester | 문장 전체를 n-gram 언어 모델로 교정한다 | 여러 단어 교정 |
| `completion` suggester | `completion` 타입 필드를 **메모리의 FST**로 만들어 접두사로 찾는다 | 아주 빠르다. 접두사 일치만 되고, 문서 필터는 미리 정한 컨텍스트(카테고리·위치)로만 한다. 가중치(`weight`)로 순서를 정한다 |
| `search_as_you_type` 필드 | 싱글(shingle)·edge n-gram 하위 필드를 자동으로 만든다 | 단어 중간부터 입력해도 맞고 일반 질의·필터와 함께 쓴다 |
| `edge_ngram` 분석기 | 색인할 때 「키」, 「키보」, 「키보드」처럼 접두사를 모두 토큰으로 만든다 | 유연하지만 인덱스가 커진다 |

검색창 자동 완성은 응답 속도가 우선이면 `completion`, 일반 필터·점수와 섞어야 하면 `search_as_you_type`이나 edge n-gram을 쓴다.

## 스크립트

Elasticsearch의 기본 스크립트 언어는 **Painless**다(Java 비슷한 문법, 샌드박스로 안전하게 제한).

| 쓰임 | 예 |
| --- | --- |
| 점수 | `script_score`로 `_score * Math.log(2 + doc['sales'].value)` |
| 런타임 필드 | 색인하지 않고 질의할 때 계산하는 필드(`runtime_mappings`) |
| 갱신 | `_update`, `_update_by_query`에서 `ctx._source.count += params.n` |
| 수집 | 수집 파이프라인의 `script` 처리기 |

성능 영향이 크다.

- 스크립트는 **문서마다 실행**되고 인덱스 구조를 이용하지 못한다. 필터 문맥에서 걸러 대상 문서를 줄인 뒤에 쓴다.
- 스크립트 문자열이 바뀔 때마다 새로 컴파일된다. 값은 문자열에 박지 말고 `params`로 넘겨 한 번 컴파일한 것을 재사용한다. 컴파일 횟수에는 상한이 있어 초과하면 오류가 난다. 자주 쓰는 스크립트는 저장 스크립트(`_scripts`)로 둔다.
- 매번 같은 값을 계산한다면 색인할 때(수집 파이프라인) 미리 계산해 필드로 저장하는 편이 빠르다. 런타임 필드는 매핑을 바꾸지 않고 실험할 때 쓰고, 굳으면 색인 필드로 옮긴다.

## 벡터 검색과 ES|QL

### 벡터 검색

텍스트·이미지를 임베딩 벡터로 바꿔 `dense_vector` 필드에 넣고, 질의 벡터와 가까운 문서를 찾는다. 단어가 달라도 뜻이 비슷한 문서를 찾는 **의미 검색**이다.

- 근사 최근접 이웃(ANN) 검색은 **HNSW** 그래프 인덱스로 한다. `knn` 검색 옵션에 `k`(돌려받을 수)와 `num_candidates`(샤드마다 살펴볼 후보 수, 클수록 정확하고 느리다)를 준다.
- 벡터는 메모리를 많이 쓰므로 int8·int4 양자화나 BBQ(Better Binary Quantization)로 줄인다.
- `semantic_text` 필드는 임베딩 모델 호출(inference)과 청크 나누기를 Elasticsearch가 대신해 준다.
- **하이브리드 검색**: BM25 키워드 검색과 벡터 검색 결과를 RRF(Reciprocal Rank Fusion)처럼 순위 기반으로 합친다. 정확한 용어(모델명, 코드)는 키워드가, 뜻이 비슷한 표현은 벡터가 잡는다.

### ES|QL

**ES|QL**은 파이프(`|`)로 단계를 잇는 질의 언어다(8.14에서 정식 기능). JSON Query DSL보다 읽고 쓰기 쉽고, 집계·변환을 이어 붙이는 로그 분석에 맞는다.

```text
FROM logs-*
| WHERE http.response.status_code >= 500 AND @timestamp > NOW() - 1 hour
| STATS errors = COUNT(*) BY host.name
| SORT errors DESC
| LIMIT 10
```

Query DSL을 대체하기보다 분석·탐색용이다. 관련도 점수 기반의 전문 검색 튜닝은 여전히 Query DSL이 기본이다.

## 정리

- 검색 품질은 매핑과 분석기에서 먼저 정해진다. 운영 인덱스는 명시적 매핑으로, 타입·분석기 변경은 재색인으로 한다.
- 배열 안 객체의 필드 조합으로 찾을 때만 `nested`를 쓴다. object는 객체 경계가 사라진다.
- `text`는 `match`, `keyword`는 `term`이다. 점수가 필요 없는 조건은 `bool`의 `filter`에 둬서 빠르고 캐시되게 한다.
- 점수는 BM25이고, 필드 가중치·`function_score`·`boosting`으로 조정한다. 질의어가 여러 필드에 흩어지면 `cross_fields`다.
- 깊은 페이지는 `search_after` + PIT, 자동 완성은 `completion`이나 `search_as_you_type`, 스크립트는 `params`로 재사용하고 필터 뒤에 쓴다.

관련 노트: [[elasticsearch|Elasticsearch와 ELK 스택]], [[search-engine-basics|검색엔진의 원리: 역인덱스와 랭킹]], [[web-search-engine|웹 검색 엔진]], [[api-pagination|API 페이지네이션]]
