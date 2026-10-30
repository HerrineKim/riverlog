---
title: "Elasticsearch와 ELK 스택"
concept: "Elasticsearch"
summary: "Elasticsearch는 Lucene 위에 만든 분산 검색·분석 엔진이다. JSON 문서를 역인덱스로 색인해 전문 검색과 집계를 거의 실시간으로 처리한다. 인덱스·샤드·세그먼트 구조, 상품 검색부터 로그 분석·SIEM까지의 쓰임, 로그를 모아 보는 ELK(Beats·Logstash·Elasticsearch·Kibana) 파이프라인을 정리한다."
tags: ["backend", "search", "database", "monitoring", "architecture"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/how-do-we-learn-elasticsearch", "https://bytebytego.com/guides/top-6-elasticsearch-use-cases", "https://bytebytego.com/guides/what-is-elk-stack-and-why-is-it-so-popular-for-log-management", "https://techcrunch.com/2024/09/16/aws-brings-opensearch-under-the-linux-foundation-umbrella", "https://lwn.net/Articles/990517"]
---

> ByteByteGo의 System Design 101 가이드 「[How to Learn Elasticsearch](https://bytebytego.com/guides/how-do-we-learn-elasticsearch)」, 「[Top 6 Elasticsearch Use Cases](https://bytebytego.com/guides/top-6-elasticsearch-use-cases)」, 「[What is ELK Stack and Why is it Popular?](https://bytebytego.com/guides/what-is-elk-stack-and-why-is-it-so-popular-for-log-management)」을 바탕으로 재구성한 노트다.

## Elasticsearch란

Elasticsearch는 **Apache Lucene 검색 라이브러리를 여러 서버에 나눠 돌리는 분산 검색·분석 엔진**이다. 스키마를 미리 정하지 않아도 되는 JSON 문서를 HTTP API로 넣고 꺼낸다. 하나의 클러스터를 여러 사용자·서비스가 나눠 쓰는 멀티 테넌시도 지원한다.

세 가지 성격을 함께 가진다.

| 성격 | 의미 |
| --- | --- |
| 전문 검색 엔진 | 문장을 단어로 쪼개 역인덱스로 찾고, 관련도 순으로 정렬한다 |
| 분석 엔진 | 집계(aggregation)로 그룹별 개수·평균·분포·시계열을 계산한다 |
| 분산 Lucene | 인덱스를 샤드로 나눠 여러 노드에 두고 복제본으로 가용성을 높인다 |

역인덱스·토큰화·BM25 같은 검색의 원리는 [[search-engine-basics|검색엔진의 원리: 역인덱스와 랭킹]]에 있다. 이 노트는 Elasticsearch가 그것을 어떻게 분산·운영하는지와 어디에 쓰는지를 다룬다.

## 구조

```text
클러스터
 └─ 인덱스 (RDB의 테이블에 해당)
     ├─ 주 샤드 0 ──복제──▶ 복제 샤드 0   (서로 다른 노드에 둔다)
     ├─ 주 샤드 1 ──복제──▶ 복제 샤드 1
     └─ ...
          └─ 샤드 하나 = Lucene 인덱스 하나
               └─ 세그먼트들 (불변 파일, 백그라운드에서 병합)
```

- **문서가 들어오면** 메모리 버퍼에 모였다가 주기적인 **refresh**(기본 1초)로 새 세그먼트가 되어 검색에 보인다. 그래서 「실시간」이 아니라 **거의 실시간**(near real-time)이다.
- **세그먼트는 한 번 쓰면 바꾸지 않는다.** 수정은 새 문서를 쓰고 옛 문서에 삭제 표시를 하는 방식이다. 작은 세그먼트는 백그라운드에서 큰 것으로 병합된다. 쓰기를 순차 추가로 바꾸고 나중에 합치는 발상은 LSM 트리와 같다.
- 각 세그먼트의 **용어 사전**(term dictionary)은 정렬된 용어 목록이고, 그 앞에 접두사를 압축한 FST(유한 상태 변환기) 색인을 둬서 메모리에 올린 채 빠르게 찾는다.
- 검색 요청은 모든 샤드에 흩어져 실행되고(scatter), 각 샤드의 상위 결과를 모아 다시 정렬한다(gather).

## 어디에 쓰나

| 쓰임 | 이유 |
| --- | --- |
| **전문 검색** | 상품 검색, 문서·위키·Q&A 사이트 검색. 오타 허용(fuzzy), 동의어, 형태소 분석, 관련도 정렬 |
| **자동 완성 · 맞춤법 제안** | 접두사 질의, n-gram, suggester |
| **실시간 분석 대시보드** | 사용자 활동, 거래, 센서 값 같은 시계열을 집계해 바로 그린다 |
| **로그·이벤트 분석** | 여러 서버의 로그를 한곳에 모아 검색하고 장애 원인을 찾는다. 아래 ELK 스택 |
| **보안 이벤트 분석 (SIEM)** | 보안 로그를 모아 실시간으로 위협 패턴을 찾는다 |
| **위치 기반 검색** | `geo_point` 필드로 반경·영역 안의 장소를 찾는다 |
| **이상 탐지 · 벡터 검색** | 머신 러닝 기능으로 시계열의 이상치를 찾고, 임베딩 벡터의 근접 이웃 검색(kNN)으로 의미 검색을 한다 |

**주 데이터베이스로 쓰지 않는다.** 트랜잭션이 없고, 색인이 거의 실시간이며, 매핑을 바꾸려면 재색인이 필요하다. 원본은 RDB 등에 두고 Elasticsearch에는 검색용 사본을 동기화하는 구성이 기본이다. 그래서 검색엔진의 색인은 캐시의 한 형태로 볼 수 있다([[caching-strategies|캐시 전략]]).

## ELK 스택: 로그 파이프라인

ELK는 **Elasticsearch, Logstash, Kibana**의 머리글자다. 수집기 Beats가 더해진 뒤로는 Elastic Stack이라고도 부른다.

| 구성 요소 | 역할 |
| --- | --- |
| **Beats** | 각 서버에 설치하는 가벼운 수집 에이전트. Filebeat(로그 파일), Winlogbeat(윈도 이벤트 로그), Metricbeat(지표), Packetbeat(네트워크 트래픽) |
| **Logstash** | 여러 입력을 받아 파싱·변환·보강하고 여러 목적지로 보낸다 |
| **Elasticsearch** | 로그를 색인·저장한다 |
| **Kibana** | 검색, 대시보드, 시각화 화면 |

```text
서버들의 Beats ─▶ (Kafka 등 메시지 큐) ─▶ Logstash ─▶ Elasticsearch ─▶ Kibana
  수집            생산·소비 속도 분리        파싱·변환     색인·저장        검색·대시보드
```

- 로그 양이 많으면 Beats와 Logstash 사이에 **메시지 큐를 끼워** 생산자와 소비자를 분리한다. Logstash가 잠시 밀려도 로그를 잃지 않는다.
- 변환이 단순하면 Logstash 없이 Beats(또는 Elastic Agent)가 Elasticsearch로 바로 보내고, 파싱은 Elasticsearch의 ingest pipeline에서 한다.
- 로그 데이터는 시간이 지날수록 덜 읽으므로, 날짜별 인덱스와 수명 주기 정책(ILM)으로 오래된 인덱스를 싼 저장소로 옮기거나 지운다.

**OpenSearch**(+ OpenSearch Dashboards)도 같은 구조로 쓴다. 2021년 Elastic이 라이선스를 비공개 쪽(SSPL·Elastic License)으로 바꾸자 AWS가 갈라낸 포크이고, 2024년 9월부터 리눅스 재단 산하 OpenSearch Software Foundation이 관리한다. Elasticsearch도 2024년 8월 AGPL을 라이선스 선택지에 다시 넣어 오픈소스로 돌아왔다. 지표·트레이스까지 묶은 관측성(observability) 도구로는 Grafana 계열(Loki·Prometheus) 같은 대안도 흔하다.

## 정리

- Elasticsearch는 Lucene을 샤드 단위로 분산한 검색·분석 엔진이다.
- 세그먼트는 불변이고 refresh로 거의 실시간에 검색된다. 쓰기는 추가·병합으로 처리한다.
- 전문 검색, 자동 완성, 실시간 집계, 로그·보안 분석, 위치·벡터 검색에 쓴다.
- 원본 저장소가 아니라 **검색용 사본**으로 둔다.
- ELK는 Beats(수집) → Logstash(변환) → Elasticsearch(색인) → Kibana(시각화)이고, 양이 많으면 중간에 메시지 큐를 둔다.

관련 노트: [[search-engine-basics|검색엔진의 원리: 역인덱스와 랭킹]], [[web-search-engine|웹 검색 엔진]], [[web-scalability-components|웹 확장성의 구성 요소]], [[caching-strategies|캐시 전략]], [[wide-column-database|와이드 컬럼 데이터베이스]]
