---
title: "고전 분산 시스템 설계: GFS, MapReduce, Bigtable, Chubby, Dynamo"
concept: "Classic Distributed Systems"
summary: "구글의 GFS·MapReduce·Bigtable·Chubby와 아마존의 Dynamo 논문이 남긴 설계 아이디어를 정리했다. 단일 마스터와 큰 청크, 계산을 데이터 쪽으로 보내기, 정렬된 맵과 LSM 저장, 굵은 락과 시퀀서, 일관된 해싱·벡터 시계·느슨한 정족수 같은 기법이 HDFS·Spark·HBase·Cassandra·ZooKeeper 같은 오픈소스로 어떻게 이어졌는지까지 다룬다."
tags: ["backend", "architecture", "distributed-system", "storage", "nosql", "big-data"]
source: other
date: "2026-10-31"
sources: ["https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf", "https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf", "https://static.googleusercontent.com/media/research.google.com/en//archive/bigtable-osdi06.pdf", "https://static.googleusercontent.com/media/research.google.com/en//archive/chubby-osdi06.pdf", "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf", "http://horicky.blogspot.com/2009/11/nosql-patterns.html", "http://horicky.blogspot.com/2010/10/scalable-system-design-patterns.html", "http://highscalability.com/google-architecture", "http://www.slideshare.net/alexbaranau/intro-to-hbase", "http://www.slideshare.net/planetcassandra/cassandra-introduction-features-30103666", "http://www.slideshare.net/sauravhaloi/introduction-to-apache-zookeeper", "http://www.slideshare.net/previa/storm-16094009", "http://www.slideshare.net/oemebamo/introduction-to-memcached", "http://www.slideshare.net/mdirolf/introduction-to-mongodb", "http://www.slideshare.net/dvirsky/introduction-to-redis", "http://www.slideshare.net/mumrah/kafka-talk-tri-hug", "https://github.com/checkcheckzz/system-design-interview"]
---

> 「[checkcheckzz/system-design-interview](https://github.com/checkcheckzz/system-design-interview)」의 Products and Systems 목록에 실린 논문 「[The Google File System](https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf)」(2003), 「[MapReduce](https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf)」(2004), 「[Bigtable](https://static.googleusercontent.com/media/research.google.com/en//archive/bigtable-osdi06.pdf)」(2006), 「[The Chubby lock service](https://static.googleusercontent.com/media/research.google.com/en//archive/chubby-osdi06.pdf)」(2006), 「[Dynamo](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)」(2007)을 바탕으로 재구성한 노트다. 키-값 저장소 공통 기법은 Ricky Ho의 「[NOSQL Patterns](http://horicky.blogspot.com/2009/11/nosql-patterns.html)」, 「[Scalable System Design Patterns](http://horicky.blogspot.com/2010/10/scalable-system-design-patterns.html)」와 High Scalability의 「[Google Architecture](http://highscalability.com/google-architecture)」로, 오픈소스 후예는 소개 발표 「[Intro to HBase](http://www.slideshare.net/alexbaranau/intro-to-hbase)」, 「[Cassandra Introduction & Features](http://www.slideshare.net/planetcassandra/cassandra-introduction-features-30103666)」, 「[Introduction to Apache ZooKeeper](http://www.slideshare.net/sauravhaloi/introduction-to-apache-zookeeper)」, 「[Storm](http://www.slideshare.net/previa/storm-16094009)」, 「[Introduction to memcached](http://www.slideshare.net/oemebamo/introduction-to-memcached)」, 「[Introduction to MongoDB](http://www.slideshare.net/mdirolf/introduction-to-mongodb)」, 「[Introduction to Redis](http://www.slideshare.net/dvirsky/introduction-to-redis)」, 「[Kafka](http://www.slideshare.net/mumrah/kafka-talk-tri-hug)」로 보강했다.

## 왜 고전 논문을 보나

2000년대 중반 구글과 아마존은 값싼 범용 서버 수천 대로 웹 전체를 저장하고 처리해야 했다. 그때 나온 논문 다섯 편은 오늘날 분산 저장소와 데이터 처리의 거의 모든 기본 기법을 담고 있다. 제품은 바뀌었어도 **설계 판단의 근거**(장애는 일상이다, 네트워크가 귀하다, 단순한 쪽이 이긴다)는 그대로라서, 시스템 설계에서 「왜 이렇게 만드나」를 설명하는 가장 좋은 사례집이다.

구글은 인프라를 세 층으로 봤다.

```text
제품          검색, 광고, 메일, 지도, 동영상
분산 인프라    GFS(저장) · MapReduce(일괄 처리) · Bigtable(구조화 데이터) · Chubby(조율)
컴퓨팅 플랫폼  여러 데이터센터의 범용 서버 수십만 대
```

| 시스템 | 푸는 문제 | 핵심 아이디어 | 오픈소스 후예 |
| --- | --- | --- | --- |
| GFS | 수백 TB 파일을 값싼 디스크 위에 안전하게 | 단일 마스터 + 64MB 청크 3중 복제, 제어와 데이터 경로 분리 | HDFS |
| MapReduce | 수천 대로 일괄 처리를 쉽게 | 함수 두 개만 짜면 분산·장애·지역성은 라이브러리가 | Hadoop MapReduce → Spark |
| Bigtable | 수십억 행의 구조화 데이터 | 정렬된 희소 맵, 태블릿 분할, memtable + SSTable | HBase, (모델은) Cassandra |
| Chubby | 리더 선출, 설정, 이름 찾기 | Paxos 위의 굵은 락 + 작은 파일 서비스 | ZooKeeper, etcd |
| Dynamo | 장애 중에도 늘 쓰기를 받는 키-값 저장소 | 일관된 해싱, 벡터 시계, 느슨한 정족수, 머클 트리, 가십 | Cassandra, Riak, Voldemort |

## GFS: 큰 파일을 위한 분산 파일 시스템

**설계 가정이 일반 파일 시스템과 다르다.** 부품 고장은 예외가 아니라 상시 상태이고, 파일은 수백 MB~수 GB로 크며, 쓰기는 대부분 덮어쓰기가 아니라 **덧붙이기(append)** 이고, 지연보다 대역폭이 중요하다.

```text
클라이언트 --(파일 이름, 청크 번호)--> 마스터 : 청크 핸들과 복제본 위치를 알려 준다
클라이언트 --(청크 핸들, 바이트 범위)--> 청크 서버 : 데이터는 마스터를 거치지 않는다
마스터 <--하트비트--> 청크 서버 : 지시를 내리고 상태를 모은다
```

| 결정 | 내용 | 이유 |
| --- | --- | --- |
| 단일 마스터 | 네임스페이스, 파일 → 청크 매핑, 청크 위치를 마스터 한 대가 메모리에 든다. 64MB 청크 하나에 메타데이터 64바이트 미만 | 전역 정보로 배치·복제를 똑똑하게 결정한다. 데이터는 마스터를 거치지 않아 병목이 되지 않는다 |
| 64MB 청크, 기본 3중 복제 | 일반 블록보다 훨씬 크게 잡는다 | 마스터 질의와 메타데이터가 줄고, 한 청크에 오래 연결해 순차로 읽는다 |
| 작업 로그와 체크포인트 | 메타데이터 변경을 로그로 남기고 원격 복제한 뒤에야 클라이언트에 보인다. 로그가 커지면 B-트리 모양 체크포인트를 만든다 | 마스터 장애 때 체크포인트 + 이후 로그만 다시 적용해 복구한다 |
| 청크 위치는 저장하지 않음 | 시작할 때와 하트비트로 청크 서버에 묻는다 | 디스크 고장처럼 청크 서버 쪽에서 생기는 변화를 마스터가 따로 맞출 필요가 없다 |
| 리스와 주 복제본 | 마스터가 복제본 하나에 청크 리스를 주면 그 **주 복제본이 변경 순서를 정한다** | 마스터 부담 없이 모든 복제본에 같은 순서로 적용한다 |
| 제어와 데이터 흐름 분리 | 데이터는 가까운 청크 서버끼리 사슬처럼 파이프라인으로 밀고, 쓰기 명령은 주 복제본이 따로 보낸다 | 각 서버의 대역폭을 끝까지 쓴다 |
| 레코드 덧붙이기 | 여러 클라이언트가 같은 파일에 동시에 덧붙여도 각 레코드가 **최소 한 번** 원자적으로 들어간다. 위치는 GFS가 정한다 | 생산자-소비자 큐, 다중 병합 결과 파일을 락 없이 만든다 |
| 버전 번호 | 리스를 줄 때마다 청크 버전을 올린다 | 죽어 있던 동안 변경을 놓친 낡은 복제본을 가려내 지운다 |
| 지연 삭제 | 파일을 지우면 숨김 이름으로 바꾸고 나중에 배경에서 청크를 회수한다 | 실수 복구가 쉽고, 회수가 마스터의 일상 점검에 섞인다 |

**느슨한 일관성 모델**도 특징이다. 변경이 끝난 파일 영역은 「일관됨(어느 복제본을 읽어도 같다)」과 「정의됨(일관되고 한 변경이 쓴 내용이 온전히 보인다)」으로 나뉜다. 동시 쓰기가 성공하면 일관되지만 정의되지 않을 수 있고, 실패한 쓰기는 비일관 영역을 남긴다. 그래서 애플리케이션은 덮어쓰기 대신 덧붙이기를 쓰고, 다 쓴 뒤 이름을 원자적으로 바꾸거나 체크포인트까지만 읽고, 레코드마다 체크섬과 고유 ID를 넣어 중복·조각을 걸러 낸다. 청크 서버는 데이터 손상을 체크섬으로 스스로 검사한다.

구글은 2010년 무렵 마스터를 분산한 후속 시스템 Colossus로 옮겼다. 단일 마스터의 메모리가 파일 수의 상한이 되고 작은 파일이 많은 워크로드에 맞지 않았기 때문이다. 같은 설계를 따른 HDFS(NameNode + DataNode, 블록 기본 128MB)도 NameNode 고가용성과 연합(federation)을 덧붙였다.

## MapReduce: 계산을 데이터 쪽으로

**MapReduce** 는 개발자가 두 함수만 쓰면 병렬화·장애 처리·데이터 분배·부하 분산을 라이브러리가 맡는 프로그래밍 모델이다.

```text
map(k1, v1)          → list(k2, v2)     예: (문서 이름, 본문) → (단어, 1)들
reduce(k2, list(v2)) → list(v2)         예: (단어, [1,1,1]) → 3
```

```text
입력 → M개 조각(16~64MB) → 맵 워커들 → 중간 결과를 로컬 디스크에 R개 파티션(hash(key) mod R)으로
     → 리듀스 워커가 원격으로 읽어 키로 정렬 → reduce → GFS에 R개 출력 파일
```

- **지역성**: 마스터는 입력 청크의 복제본이 있는 서버(아니면 같은 랙)에 맵 작업을 배치한다. 네트워크가 가장 귀한 자원이라 대부분의 입력을 로컬 디스크에서 읽는다.
- **작업 크기**: M과 R을 워커 수보다 훨씬 크게 잡는다(예: 워커 2,000대에 M = 200,000, R = 5,000). 작업이 잘아야 부하가 고르게 퍼지고, 죽은 워커의 일을 여러 서버가 나눠 다시 한다.
- **워커 장애**: 마스터가 주기적으로 핑을 보내고, 응답 없는 워커의 작업을 다른 서버에서 다시 한다. 끝난 맵 작업도 다시 한다. 결과가 죽은 서버의 로컬 디스크에 있어서다. 네트워크 점검으로 80대씩 몇 분간 끊겨도 작업이 끝까지 간다.
- **결정적 함수면 결과도 결정적**: 작업마다 임시 파일에 쓰고, 끝나면 원자적 이름 바꾸기로 커밋한다. 같은 작업이 두 번 돌아도 최종 결과는 한 번 분이다.
- **백업 작업**: 거의 끝날 무렵 남은 작업을 다른 서버에서도 하나 더 돌려 먼저 끝난 쪽을 쓴다. 디스크가 느려진 서버 같은 **낙오자(straggler)** 하나가 전체를 붙잡는 것을 막는다. 끄면 정렬 작업이 44% 느려졌다.
- **보조 기능**: 맵 쪽에서 미리 합쳐 네트워크를 줄이는 **컴바이너**(reduce가 교환·결합 법칙을 따를 때), 파티션 안에서 키 순서 보장, 같은 레코드에서 반복해 죽으면 그 레코드를 건너뛰기, 중복 실행을 빼고 합산하는 카운터.

같은 계열의 병렬 패턴으로는 요청을 모든 워커에 뿌리고 결과를 모으는 **스캐터·개더**(검색 엔진의 색인 샤드 질의), 모든 워커가 단계마다 맞춰 계산하고 메시지를 주고받는 **BSP**(그래프 처리 Pregel, Apache Giraph), 의존 그래프에 따라 작업을 배치하는 **실행 오케스트레이터**(Dryad, 오늘날 Spark의 DAG 스케줄러)가 있다.

오늘날 일괄 처리는 중간 결과를 메모리에 두는 **Spark**가 Hadoop MapReduce를 대부분 대신하고, 구글 내부도 Flume·Dataflow(Apache Beam)로 옮겼다. 그래도 「셔플로 키를 모은다」, 「결정적 작업을 다시 돌려 장애를 숨긴다」, 「낙오자에 투기적 실행을 붙인다」는 Spark에 그대로 남아 있다.

## Bigtable: 정렬된 희소 맵

**Bigtable** 은 「희소하고, 분산되고, 영속적인 다차원 정렬 맵」이다.

```text
(행 키: string, 열 키: "패밀리:한정자", 타임스탬프: int64) → 값: 바이트열
예: 웹 테이블  행 "com.cnn.www"  열 "contents:" (t3, t5, t6 버전의 HTML)
                               열 "anchor:cnnsi.com" → "CNN"
```

- 행 키를 도메인을 뒤집은 URL로 잡아 같은 사이트의 페이지가 이웃 행이 된다. **행 키 설계가 곧 데이터 지역성이다.**
- **한 행의 읽기·쓰기는 원자적이다.** 여러 행을 묶는 트랜잭션은 없다. 열 패밀리는 테이블을 만들 때 정하고, 한정자는 자유롭게 늘린다.
- 테이블은 행 범위로 쪼갠 **태블릿**(기본 100~200MB)으로 나뉘고, 태블릿 서버 하나가 태블릿 수십~천여 개를 맡는다. 커지면 자동으로 쪼갠다.
- 태블릿 위치는 **3단계 계층**으로 찾는다. Chubby 파일 → 루트 태블릿 → METADATA 태블릿 → 사용자 태블릿. B+트리와 같은 모양이고, 클라이언트가 위치를 캐시해 마스터를 거의 거치지 않는다. 마스터는 태블릿 배치만 맡고, 태블릿 서버의 생존은 Chubby 락으로 확인한다.

저장 구조가 오늘날 **LSM 트리**의 원형이다.

```text
쓰기 → 커밋 로그(GFS) → memtable(메모리, 정렬)
memtable이 차면 → SSTable(불변, 정렬된 파일)로 내림        ← 마이너 컴팩션
SSTable 몇 개 + memtable → 새 SSTable 하나               ← 병합 컴팩션
모든 SSTable → 하나, 삭제 표시까지 정리                    ← 메이저 컴팩션
읽기 → memtable과 SSTable들을 합쳐 본다. 블룸 필터로 키가 없는 SSTable은 건너뛴다
```

- **불변성이 설계를 단순하게 한다.** SSTable은 한 번 쓰면 바뀌지 않으니 읽기에 락이 필요 없고, 영구 삭제는 낡은 SSTable을 회수하는 문제로 바뀌며, 태블릿을 쪼갤 때 자식이 부모의 SSTable을 공유한다.
- 커밋 로그는 태블릿마다가 아니라 **서버마다 하나**로 합쳐 GFS 쓰기 수를 줄인다(그룹 커밋). 서버가 죽으면 로그를 (테이블, 행, 순번)으로 정렬해 태블릿별로 나눠 다시 적용한다.
- 자주 함께 읽는 열 패밀리를 **지역성 그룹**으로 묶어 따로 저장하고, 그룹마다 압축이나 메모리 상주를 설정한다.
- 운영 교훈: 분산 시스템은 네트워크 분할·중단 장애 말고도 메모리·데이터 손상, 시계 어긋남, 멈춘 서버, 다른 시스템(Chubby) 버그 같은 온갖 장애를 겪는다. 새 기능은 쓰임이 분명해질 때까지 미루고, 시스템과 클라이언트를 함께 관측해야 한다.

HBase(HDFS 위의 Bigtable 구현)가 같은 모델을 그대로 따른다. 행 키는 바이트 배열, 행 단위 원자성, 셀마다 여러 버전(기본 설정으로 버전 수를 정한다), 시작·끝 키로 범위를 빠르게 훑는 Scan을 준다. SQL·조인·다중 행 트랜잭션·보조 인덱스는 기본으로 없다. Cassandra는 데이터 모델을 Bigtable에서, 분산 방식을 Dynamo에서 가져왔다([[wide-column-database|와이드 컬럼 DB]]). 구글 클라우드는 Bigtable을 관리형 서비스로 제공한다.

## Chubby: 합의를 서비스로

**Chubby** 는 Paxos를 라이브러리로 주는 대신 **락 서비스**로 감쌌다. 개발자는 합의 알고리즘을 몰라도 「락을 잡은 쪽이 리더」라는 익숙한 방식으로 리더를 뽑고, 작은 설정 파일을 같은 곳에 둘 수 있다. 서비스를 상태 기계로 다시 짜지 않아도 되고, 정족수에 필요한 서버 수를 클라이언트가 직접 갖출 필요도 없다.

| 요소 | 내용 |
| --- | --- |
| 셀 | 보통 복제본 5대. Paxos로 마스터를 뽑고, 마스터는 과반의 표와 「몇 초 동안 다른 마스터를 뽑지 않겠다」는 **마스터 리스**를 받는다. 읽기·쓰기 모두 마스터가 처리한다 |
| 인터페이스 | 파일 시스템처럼 생긴 경로(`/ls/셀/…`)와 작은 파일의 통째 읽기·쓰기, 그리고 각 노드가 읽기·쓰기 락 |
| 굵은 락 | 몇 시간~며칠 쥐는 락을 전제한다. 락 서버 부하가 작고, 잠깐 멈춰도 클라이언트가 덜 기다린다 |
| 권고 락 | 락은 다른 접근을 막지 않는다. 클라이언트가 스스로 확인한다 |
| 시퀀서 | 락을 쥔 쪽이 받는 토큰(락 이름, 모드, 세대 번호). 요청과 함께 보내면 받는 서버가 유효한지 검사해 **늦게 도착한 옛 리더의 요청을 거절한다** |
| 락 지연 | 시퀀서를 못 쓰는 서버를 위해, 쥔 쪽이 사라진 락은 일정 시간(최대 1분) 아무도 못 잡게 한다 |
| 캐시와 무효화 | 클라이언트가 파일·락 상태를 캐시하고, 바뀌면 마스터가 무효화를 보낸 뒤에야 변경을 끝낸다. 갱신은 보내지 않고 지우기만 한다 |
| 세션과 KeepAlive | 클라이언트 세션 리스를 KeepAlive로 늘린다. 리스가 끊기면 캐시를 비우고 **유예 기간(기본 45초)** 동안 새 마스터를 찾는다. 그사이 재연결하면 세션이 유지된다 |

가장 많이 쓰인 용도는 의외로 락보다 **이름 서비스**였다. DNS TTL처럼 캐시 시간을 고를 필요 없이 무효화로 최신을 유지하기 때문이다. 부하는 프록시와 셀 분할로 나눴다.

**ZooKeeper** 는 같은 문제를 오픈소스로 푼 조율 서비스다. 락 대신 더 낮은 수준의 기본 요소를 주고, 그 위에 레시피를 쌓는다.

- 데이터는 경로 트리의 **znode**(작은 바이트 데이터 + 자식)이고, 버전 번호가 있어 조건부 쓰기를 한다.
- **영속(persistent)** 노드는 지울 때까지, **임시(ephemeral)** 노드는 세션이 살아 있는 동안만 남는다. **순차(sequential)** 옵션은 이름 뒤에 단조 증가 번호를 붙인다.
- **워치(watch)** 는 노드 변경을 한 번 알려 주는 일회성 트리거다. 계속 보려면 매번 다시 건다.
- 읽기는 접속한 서버가 로컬에서 답하고, 쓰기는 리더로 가서 과반 합의(Zab)를 거친다. 그래서 쓰기는 순서대로 적용되지만 읽기는 약간 낡을 수 있다(필요하면 `sync`).

| 레시피 | 방법 |
| --- | --- |
| 그룹 멤버십 | 각 서버가 `/members/host-i`를 임시 노드로 만든다. 서버가 죽으면 노드가 사라지고 워치가 알린다 |
| 리더 선출 | 모두 `/election` 아래 임시·순차 노드를 만들고 번호가 가장 작은 쪽이 리더다. 각자 **바로 앞 번호만** 지켜본다 |
| 분산 락 | 같은 방식으로 락 노드 아래 임시·순차 노드를 만들고 가장 작은 번호가 락을 쥔다 |
| 서비스 디스커버리 | 서비스가 자신을 등록하고 클라이언트가 목록을 지켜본다 |

모두가 같은 노드를 지켜보면 변경 한 번에 알림이 한꺼번에 몰리는 **떼 효과(herd effect)** 가 생긴다. 바로 앞 노드만 지켜보는 이유다. GC 멈춤보다 세션 타임아웃을 길게 잡는 것도 운영 요점이다. 지금은 쿠버네티스의 etcd(Raft)가 같은 자리를 많이 차지했고, Kafka는 4.0부터 ZooKeeper 없이 KRaft만 쓴다. 분산 락의 함정과 펜싱 토큰은 [[distributed-system-patterns|분산 시스템의 통신·데이터 흐름 패턴]]에 있다. 시퀀서가 바로 펜싱 토큰이다.

## Dynamo: 늘 쓰기를 받는 키-값 저장소

**Dynamo** 는 장바구니처럼 「담기 요청은 장애 중에도 절대 거절하면 안 되는」 서비스를 위해 일관성을 늦추고 가용성을 택한 키-값 저장소다. 지연 목표도 평균이 아니라 **99.9백분위수**로 잡았다(예: 초당 500요청에서 요청의 99.9%를 300ms 안에). 그보다 높은 백분위수는 비용이 급격히 늘어서다.

| 문제 | 기법 | 얻는 것 |
| --- | --- | --- |
| 분할 | 일관된 해싱 + 가상 노드 | 노드를 더하고 빼도 이웃 구간만 옮긴다 |
| 쓰기 가용성 | 벡터 시계로 버전 관리, 충돌은 **읽을 때** 해소 | 버전 수와 갱신 속도가 분리된다 |
| 일시 장애 | 느슨한 정족수 + 힌트 전달 | 일부 복제본이 죽어도 읽기·쓰기가 실패하지 않는다 |
| 영구 장애 | 머클 트리로 안티 엔트로피 | 다른 구간만 찾아 배경에서 맞춘다 |
| 멤버십·장애 감지 | 가십 프로토콜 | 중앙 레지스트리 없이 모두가 링 구성을 안다 |

- 키는 링 위에서 시계 방향으로 이어지는 N개 노드(**선호 목록**)에 복제한다. 가상 노드가 서로 다른 물리 노드에 앉도록 고른다.
- 흔한 설정은 **(N, R, W) = (3, 2, 2)** 다. `R + W > N`이면 읽기 집합과 쓰기 집합이 겹친다. 전통 2PC는 `W = N, R = 1`인 특수한 경우이고, 복제본이 늘수록 하나만 죽어도 쓰기가 실패해 오히려 가용성을 깎는다.
- **느슨한 정족수**는 선호 목록의 앞 N개가 아니라 **살아 있는 앞 N개**에 쓴다. 대신 받아 준 노드는 「원래 주인」 힌트와 함께 따로 보관했다가 주인이 돌아오면 넘긴다. 이 동안은 `R + W > N`이어도 최신 값을 못 볼 수 있다.
- **충돌 해소는 애플리케이션 몫이다.** 장바구니는 갈라진 버전을 합집합으로 합친다. 담기는 절대 잃지 않지만, 지운 물건이 되살아날 수 있다. 단순한 서비스는 타임스탬프로 마지막 쓰기를 고른다(LWW). 실제로 요청의 99.94%는 버전 하나만 봤다.
- 벡터 시계가 끝없이 길어지지 않게, (노드, 카운터) 쌍마다 마지막 갱신 시각을 두고 쌍이 10개쯤 넘으면 가장 오래된 것을 버린다. 정확한 인과 관계를 잃을 수 있는 타협이다.
- 가십만으로는 서로 모르는 두 무리로 갈라질 수 있어, 모두가 아는 **시드 노드**와 주기적으로 맞춘다.
- 분할 방식은 「노드마다 무작위 토큰」에서 **「해시 공간을 같은 크기 Q개로 미리 나누고 노드에 고르게 배정」** 으로 바뀌었다. 부하가 더 고르고, 구간이 고정이라 구간 파일을 통째로 옮기고 백업할 수 있으며, 노드마다 들고 있을 멤버십 정보가 세 자릿수 줄었다. 오늘날 Kafka 파티션, Redis Cluster의 16,384 슬롯, Cassandra의 vnode가 같은 발상이다.
- 클라이언트가 멤버십을 받아 직접 조정 노드를 고르면(클라이언트 주도) 로드 밸런서 한 단계를 건너뛰어 지연이 준다.

키-값 저장소의 공통 기법을 한 번 더 정리하면 이렇다. 복제본에 갱신을 퍼뜨리는 방식은 최신 상태를 통째로 보내는 **상태 전달**(메시지를 잃어도 다음 상태가 오면 따라잡는다. 큰 객체는 해시 트리로 바뀐 조각만 보낸다)과 연산 목록을 보내는 **연산 전달**(데이터는 적지만 순서 보장 전달이 필요하다)이 있다. 삭제는 버전 정보를 잃지 않도록 바로 지우지 않고 **삭제 표시(tombstone)** 를 남겼다가 모든 복제본에 퍼진 뒤 회수한다. 정족수, 읽기 복구, 힌트 전달의 일반론은 [[database-scaling|데이터베이스 확장과 성능 최적화]]의 「리더 없음」에, 벡터 시계와 일관성 모델은 [[distributed-time-and-failure|분산 시스템의 시간과 장애]]에 있다.

아마존의 관리형 서비스 **DynamoDB** 는 이름만 이어받았을 뿐 설계가 다르다. 파티션마다 Multi-Paxos로 리더를 뽑아 쓰기를 받고, 벡터 시계 대신 강한 일관성 읽기를 선택지로 준다. 논문의 리더 없는 설계를 그대로 잇는 것은 Cassandra(조정 가능한 일관성 수준 `ONE`·`QUORUM`·`ALL`, 읽기 때 충돌 해소)와 Riak이다.

## 오픈소스로 이어진 계보

| 오픈소스 | 원형 | 남은 것 | 2026년 기준 위치 |
| --- | --- | --- | --- |
| HDFS + Hadoop MapReduce | GFS, MapReduce | 큰 블록 복제, 지역성 스케줄링 | 저장은 오브젝트 스토리지(S3 등)와 테이블 포맷(Iceberg)으로, 계산은 Spark로 많이 옮겼다 |
| HBase | Bigtable | 행 키 정렬, 리전 분할, LSM | Hadoop 생태계에서 계속 쓰인다 |
| Cassandra | Dynamo + Bigtable | 링, 조정 가능한 일관성, 와이드 컬럼 | 대규모 쓰기 워크로드의 대표 |
| ZooKeeper | Chubby | 임시 노드, 워치, 순차 노드 | etcd·KRaft가 많은 자리를 대신했다 |
| Memcached | 분산 해시 테이블 | 클라이언트 쪽 일관된 해싱, 복제 없는 단순한 캐시 | 단순 캐시로 여전히 쓰인다. 차이는 [[redis\|Redis]] |
| Redis | 자료구조 서버 | 메모리 자료구조, 원자 연산, RDB·AOF 영속성 | 캐시·큐·순위표의 기본값 |
| MongoDB | 문서 저장소 | 문서 모델, 복제 세트, 범위 샤딩 | [[mongodb\|MongoDB]] |
| Kafka | 분산 커밋 로그 | 디스크에 남기는 발행·구독, 소비자가 오프셋을 들고 끌어가기 | 이벤트 스트리밍 표준. [[message-queue-kafka\|메시지 큐와 Kafka]] |
| Storm | 실시간 계산 | 스파우트(스트림 원천)와 볼트(처리 단계)로 이은 토폴로지, 튜플 단위 처리 | Flink·Kafka Streams·Spark Structured Streaming이 주류가 됐다 |

## 정리

- 장애를 상시 상태로 두고, 복제와 재실행으로 장애를 사용자에게서 숨긴다.
- 제어 경로(마스터, 메타데이터)와 데이터 경로를 나누면 단일 마스터도 병목이 되지 않는다.
- 불변 파일 + 메모리 버퍼 + 컴팩션(LSM)은 쓰기 많은 저장소의 표준 구조가 됐다.
- 합의는 직접 짜지 말고 서비스(Chubby, ZooKeeper, etcd)로 쓴다. 굵은 락과 펜싱 토큰이 함께 가야 안전하다.
- 가용성을 택하면 충돌 해소를 누군가 맡아야 한다. Dynamo는 그 짐을 애플리케이션에 넘겼다.
- 결론: 제품 이름은 바뀌어도 이 다섯 설계가 고른 트레이드오프는 오늘의 분산 시스템을 읽는 문법이다.

관련 노트: [[distributed-time-and-failure|분산 시스템의 시간과 장애]], [[database-scaling|데이터베이스 확장과 성능 최적화]], [[wide-column-database|와이드 컬럼 DB와 대규모 메시지 저장]], [[database-internals|데이터베이스 내부 구조]], [[database-sharding|데이터베이스 샤딩]], [[big-tech-stack-anatomy|대규모 서비스 기술 스택 해부]]
