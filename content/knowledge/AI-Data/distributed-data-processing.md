---
title: "분산 데이터 처리: MapReduce, Spark, SQL 엔진"
concept: "Distributed Data Processing"
summary: "한 서버로 감당할 수 없는 데이터를 클러스터로 처리하는 기술의 계보(GFS·MapReduce·Hadoop → Spark → Trino)와 핵심 원리를 정리했다. MapReduce의 한계, Spark RDD의 계보(lineage)·지연 실행·좁은/넓은 의존성, 지금의 표준인 DataFrame·Spark SQL, 객체 저장소 위 클러스터 운영 팁, 대화형 SQL 엔진이 빠른 이유, 열 지향 포맷 Parquet의 컬럼 선택·조건 푸시다운을 다룬다."
tags: ["data", "big-data", "architecture", "database", "data-science"]
source: other
date: "2026-10-31"
sources: ["https://www.slideshare.net/yongho/rdd-paper-review", "https://zzsza.github.io/data/2018/05/26/bigdata-preprocessing-skills/", "https://www.slideshare.net/awskr/spark-s3-r3", "https://www.slideshare.net/JPark0426/kaist-2018", "https://www.slideshare.net/zhenxiao/real-time-analytics-at-uber-strata-data-2019", "https://github.com/andkret/Cookbook", "https://docs.google.com/presentation/d/11C_BKio0DZIop_ZjJk7ogxQtWV5qHIr-hHjw277z64k/edit", "https://spark.apache.org/docs/latest/sql-programming-guide.html"]
---

> 「[Spark의 핵심은 무엇일까? RDD 논문 리뷰](https://www.slideshare.net/yongho/rdd-paper-review)」(2014), 「[대용량 데이터 처리 기술(GFS, HDFS, MapReduce, Spark)](https://zzsza.github.io/data/2018/05/26/bigdata-preprocessing-skills/)」, AWSKRUG 「[Spark + S3 + R3를 이용한 데이터 분석 시스템 만들기](https://www.slideshare.net/awskr/spark-s3-r3)」(2014), 「[데이터 엔지니어는 무슨 일을 하나요?](https://www.slideshare.net/JPark0426/kaist-2018)」(2018), Strata 2019 「[Real Time Analytics at Uber](https://www.slideshare.net/zhenxiao/real-time-analytics-at-uber-strata-data-2019)」, 「[The Data Engineering Cookbook](https://github.com/andkret/Cookbook)」, 「[그들이 AWS 위에서 데이터 파이프 라인을 운영하는 법](https://docs.google.com/presentation/d/11C_BKio0DZIop_ZjJk7ogxQtWV5qHIr-hHjw277z64k/edit)」를 바탕으로, 지금의 Spark API는 [Spark SQL 공식 문서](https://spark.apache.org/docs/latest/sql-programming-guide.html)로 확인해 재구성한 노트다.

## 빅데이터 처리란

실무에서 빅데이터는 **서버 한 대로 감당할 수 없는 데이터**다. 메모리가 모자라 작업이 죽고(out of memory), 디스크가 가득 찬다. 그래서 여러 서버를 묶은 클러스터로 처리하고, 그 과정에서 생기는 클러스터 관리·병렬 처리·부하 분산 문제를 푸는 것이 데이터 엔지니어링의 큰 축이다.

크기(volume)만 문제가 아니다. 흔히 4V로 정리한다.

| V | 뜻 | 예 |
| --- | --- | --- |
| Volume | 양 | 하루 수십억 건 이벤트 |
| Velocity | 들어오는 속도 | 실시간 스트림 |
| Variety | 형식의 다양함 | CSV, JSON 로그, XML, 키-값 저장소를 한데 조인 |
| Veracity | 믿을 수 있는 정도 | 센서 오측정, 사람이 손으로 넣은 오타 |

커지는 데이터에 대응하는 길은 둘이다. 더 큰 장비로 바꾸는 **스케일 업**은 쉽지만 곧 한계와 비용에 부딪힌다. 여러 대에 나누는 **스케일 아웃**은 관리가 복잡하다. 그래서 스스로 데이터를 나누고 장애가 나면 복구하는 분산 처리 시스템이 나왔다. 반대로 **한 서버로 되면 분산 도구를 쓰지 않는다.** 클러스터는 최소 몇 대가 필요하고 개발·운영비가 든다.

## 계보

| 시기 | 기술 | 핵심 |
| --- | --- | --- |
| 2003~2004 | GFS, MapReduce 논문(구글) | 수정하지 않고 덧붙이기만 하는 분산 파일 시스템, Map과 Reduce로 표현하는 분산 계산 |
| 2006~ | Hadoop(HDFS + MapReduce) | 두 논문의 오픈소스 구현. 파일을 블록(지금 기본 128MB)으로 쪼개 3벌 복제한다. 네임노드가 위치를 알고 데이터노드가 데이터를 가진다 |
| 2010~ | Hive, HBase | Hive는 SQL을 MapReduce 작업으로 바꿔 준다. HBase는 BigTable을 본뜬 와이드 컬럼 DB다 |
| 2012~ | YARN, Spark | YARN이 클러스터 자원 관리를 떼어 맡았다. Spark는 중간 결과를 메모리에 두는 RDD로 반복 계산을 빠르게 했다 |
| 2013~ | Presto(→ Trino), Impala | 디스크 기반 MapReduce 대신 메모리 파이프라인으로 SQL을 대화형 속도로 돌린다 |
| 지금 | 객체 저장소 + Spark·Flink·Trino + 테이블 포맷 | HDFS 대신 S3·GCS에 저장하고 계산 클러스터는 필요할 때 띄운다 |

## MapReduce와 그 한계

MapReduce는 입력을 나눠 각 워커가 **Map**(키-값 쌍 만들기)을 하고, 같은 키끼리 모으는 **셔플**(SQL의 `GROUP BY`와 비슷하다)을 거쳐 **Reduce**(키별 집계)로 결과를 낸다. 단순한 두 함수로 거의 모든 일괄 집계를 표현한다.

한계는 **단계마다 결과를 HDFS(디스크)에 쓰고 다음 단계가 다시 읽는다**는 점이다. 같은 데이터를 수십 번 도는 머신 러닝·그래프 알고리즘과, 같은 데이터에 질의를 연달아 던지는 대화형 분석에서 특히 느리다.

논문이 설계한 지역성·장애 처리·낙오자 대응 같은 세부 기법은 [[classic-distributed-systems#MapReduce: 계산을 데이터 쪽으로|고전 분산 시스템 설계]]에 있다.

## Spark와 RDD

### RDD: 메모리를 읽기 전용으로 쓰기

중간 결과를 메모리에 두면 빠르지만, 노드가 죽으면 메모리 데이터도 사라진다. 기존 메모리 기반 시스템은 값을 세밀하게 고칠 수 있게 하는 대신 복제나 디스크 체크포인트로 장애에 대비했고, 그동안 작업이 멈춰 느렸다. RDD(Resilient Distributed Dataset)는 GFS가 「수정 불가」로 시스템을 단순하게 만든 것처럼 **메모리 데이터를 읽기 전용으로** 만들어 이 문제를 풀었다.

| 성질 | 의미 |
| --- | --- |
| 불변·분할된 레코드 모음 | 저장소 → RDD, RDD → RDD 변환으로만 만든다. 한번 만들면 고치지 않는다 |
| 계보(lineage) | 부모에서 어떤 변환으로 만들어졌는지만 기록한다. 파티션이 사라지면 계보대로 다시 계산한다. 복제할 필요가 없다 |
| 변환과 액션 | `map`, `filter`, `join` 같은 **변환**(transformation)은 계보만 쌓고, `count`, `collect`, 저장 같은 **액션**(action)이 불릴 때 실제로 계산한다 |
| 지연 실행 | 액션 시점에 전체 실행 계획(DAG)이 보이므로 자원 배치를 고려해 최적의 순서로 돈다. 일을 하나씩 시키는 것보다 목록을 한 번에 주는 편이 효율적인 것과 같다 |
| 메모리 부족 시 | 캐시처럼 LRU로 안 쓰는 파티션을 내쫓는다. 원본에서 다시 만들 수 있기 때문이다 |

### 좁은 의존성과 넓은 의존성

| | 좁은 의존성(narrow) | 넓은 의존성(wide) |
| --- | --- | --- |
| 뜻 | 자식 파티션이 부모 파티션 하나에만 기댄다 | 자식 파티션이 여러 부모 파티션의 데이터를 모은다 |
| 예 | `map`, `filter` | `groupByKey`, `reduceByKey`, `join` |
| 비용 | 한 노드 안에서 메모리 속도로 끝난다. 장애가 나도 그 노드에서 복구한다 | **셔플**이 일어나 네트워크 속도로 돈다. 잃으면 모든 부모를 다시 훑어야 해 비싸다 |

그래서 셔플을 줄이는 것이 성능 최적화의 핵심이고, 셔플을 여러 번 거친 결과(반복 조인)는 체크포인트로 저장해 두는 편이 낫다. 읽기 전용이라 쓰는 동안 바뀔 걱정이 없어 체크포인트를 멈춤 없이 백그라운드로 남길 수 있다. 스케줄러는 이미 계산된 파티션은 건너뛰고, 데이터가 있는 노드에서 작업을 돌리도록(data locality) 배치한다.

### 지금의 Spark: DataFrame과 Spark SQL

지금은 RDD를 직접 다루기보다 **DataFrame·Dataset API와 Spark SQL**을 쓴다. 컬럼 구조를 아는 API라 Catalyst 최적화기가 실행 계획을 다시 짜고(필요한 컬럼만 읽기, 조건을 저장소로 내리기), 런타임 통계로 셔플 파티션 수와 조인 방식을 바꾸는 적응형 질의 실행(AQE)이 기본으로 켜져 있다. RDD는 그 아래 실행 모델로 남아 있다. 같은 DataFrame API로 스트림을 다루는 Structured Streaming도 있다.

```python
# 하루치 로그에서 메시지를 보낸 사용자 수
logs = spark.read.json("s3://my-logs/2026-10-30/*")
logs.filter(logs.action == "ADD_MSG").select("userId").distinct().count()
```

과거에는 Scala RDD API(`sc.textFile(...).filter(...).map(...).distinct.count`)로 같은 일을 했다. 하둡 MapReduce로 10시간 걸리던 하루치 분석이 Spark로 옮기며 1시간 안팎으로 줄어든 사례처럼, 반복·다단계 분석일수록 차이가 크다.

### 클라우드에서 Spark 클러스터 운영

| 팁 | 이유 |
| --- | --- |
| **저장은 객체 저장소, 계산은 필요할 때 띄우는 클러스터** | HDFS를 따로 운영하지 않아도 된다. 같은 리전의 S3 ↔ EC2 전송은 무료이고, 여러 클러스터가 동시에 읽어도 저장소 병목을 걱정할 일이 적다 |
| 분석마다 클러스터를 따로 | 매일 도는 분석을 멈추지 않고 1년치 같은 긴 분석을 동시에 돌린다. 같은 작업에 인스턴스를 더 많이 쓰면 시간은 줄고 비용은 같다 |
| 파일 크기를 고르게 | 100·100·100·20·20 크기 파일보다 10짜리 32개가 모든 코어를 고르게 쓴다. 너무 작은 파일이 많아도 느리다 |
| 셔플 공간 | 메모리가 크고 로컬 SSD가 있는 인스턴스가 셔플 임시 파일에 유리하다. 임시 파일이 아주 많이 생겨 디스크는 남는데 inode가 모자랄 수 있다 |
| 노드 배치 | 같은 배치 그룹에 두면 노드 간 지연이 줄어 넓은 의존성 셔플에 유리하다 |
| 비용 | 마스터·코어 노드는 온디맨드, 작업(task) 노드는 스팟으로 둔다 |
| 드라이버 위치 | 클라이언트 모드는 드라이버가 제출한 쪽에서 돌아 디버깅이 편하고, 클러스터 모드는 드라이버도 클러스터 자원을 써 운영 배치에 맞다 |

## 대화형 SQL 엔진: Trino(Presto)

Hive는 SQL을 MapReduce로 바꿔 디스크를 오가므로 느리다. Presto(지금 커뮤니티 버전 이름은 Trino)는 페이스북이 만든 분산 SQL 엔진으로, 페타바이트급 데이터에 대화형 속도로 질의한다.

| 빠른 이유 | 내용 |
| --- | --- |
| 메모리 파이프라인 | 단계 사이 결과를 디스크에 쓰지 않고 스트리밍으로 넘긴다 |
| 열 단위 저장·실행 | 필요한 컬럼만 읽고 열 단위로 계산한다 |
| 바이트코드 생성 | 질의마다 실행 코드를 만들어 해석 비용을 줄인다 |
| 자체 자원 관리 | 짧은 질의에 우선순위를 주고, 노드당 질의 메모리 한도를 넘으면 그 질의만 실패시켜 프로세스 전체가 죽지 않는다 |

**커넥터**가 또 하나의 장점이다. Hive 카탈로그(S3의 Parquet), MySQL, Elasticsearch, Pinot, Cassandra 등을 데이터 복사 없이 한 SQL로 조인한다(federated query). 커넥터는 메타데이터(스키마·테이블·컬럼), 데이터를 작업 단위로 나누는 split, 조건·LIMIT를 원천으로 내려보내는 푸시다운을 구현한다. Elasticsearch를 붙일 때는 인덱스 하나를 테이블 파티션으로, 같은 접두사를 가진 인덱스들을 논리 테이블 하나로 본다.

## 열 지향 포맷: Parquet

분석 질의는 `SELECT *`보다 몇 개 컬럼만 고르는 경우가 많다. Parquet은 **같은 컬럼 값을 디스크에 모아 두는 열 지향(columnar) 파일 포맷**이다.

```text
Parquet 파일
├─ 로우 그룹 1
│   ├─ 컬럼 청크: user_id
│   ├─ 컬럼 청크: status     ← LOGIN/LOGOUT처럼 종류가 적으면 사전 인코딩
│   └─ 컬럼 청크: city_id
├─ 로우 그룹 2 ...
└─ 푸터: 스키마, 로우 그룹별 컬럼 통계(최솟값·최댓값·사전)
```

- **필요한 컬럼만 읽는다**(column pruning). 중첩 구조(`base.city_id`)도 필요한 하위 필드만 읽는다.
- **조건을 저장소로 내린다**(predicate pushdown). `city_id = 12`인데 푸터 통계나 사전에 12가 없는 로우 그룹은 통째로 건너뛴다. 기본 리더가 모든 중첩 필드를 읽던 것을 필요한 필드만 읽고 조건을 바로 평가하게 바꿔 수 배~10배 빨라진 사례가 있다.
- **같은 종류 값이 모여 압축이 잘 된다.** 종류가 적은 값은 값 대신 사전 인덱스만 저장한다. 코덱은 Snappy·ZSTD·GZIP 등을 고른다.

같은 열 지향 원리를 쓰는 분석 DB(ClickHouse, BigQuery, Redshift)는 [[database-selection|데이터베이스 고르기]]의 OLAP 항목에 있다.

## 정리

- 서버 한 대로 안 될 때 분산 처리를 쓴다. 그 전에는 운영비가 이득보다 크다.
- MapReduce는 단계마다 디스크를 거쳐 반복·대화형 작업에 느렸고, Spark는 읽기 전용 메모리 데이터(RDD)와 계보로 장애 복구를 해결해 이를 넘었다.
- 성능은 셔플(넓은 의존성)을 줄이는 데서 나온다. 지금은 DataFrame·SQL API를 써서 최적화기에 맡긴다.
- 저장은 객체 저장소 + Parquet, 계산은 필요할 때 띄우는 클러스터, 대화형 질의는 Trino 같은 SQL 엔진이 지금의 기본 조합이다.

관련 노트: [[data-pipeline-basics|데이터 파이프라인과 저장소 용어]], [[database-selection|데이터베이스 고르기]], [[wide-column-database|와이드 컬럼 데이터베이스]], [[block-file-object-storage|블록·파일·객체 스토리지]], [[message-queue-kafka|메시지 큐와 Kafka]]
