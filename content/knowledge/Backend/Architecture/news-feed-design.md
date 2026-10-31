---
title: "뉴스 피드 설계: 연결, 활동, 팬아웃"
concept: "News Feed Design"
summary: "뉴스 피드는 「누구와 연결됐나」와 「누가 무엇을 했나」 두 데이터를 합쳐 사용자마다 다른 목록을 만드는 문제다. 읽을 때 모으는 방식(스캐터·개더)과 쓸 때 받은편지함에 뿌리는 방식(팬아웃)의 차이, 활동 복제와 집계·중복 제거·점수 매기기, 비정규화와 캐시로 타임라인을 빠르게 만드는 법을 정리했다."
tags: ["backend", "architecture", "cache", "database", "realtime"]
source: other
date: "2026-10-31"
sources: ["https://github.com/checkcheckzz/system-design-interview", "http://www.slideshare.net/danmckinley/etsy-activity-feeds-architecture", "https://www.facebook.com/note.php?note_id=10150468255628920", "http://highscalability.com/blog/2012/1/23/facebook-timeline-brought-to-you-by-the-power-of-denormaliza.html", "http://highscalability.com/blog/2012/2/13/tumblr-architecture-15-billion-page-views-a-month-and-harder.html", "http://highscalability.com/scaling-twitter-making-twitter-10000-percent-faster", "http://highscalability.com/blog/2011/12/6/instagram-architecture-14-million-users-terabytes-of-photos.html", "http://lethain.com/introduction-to-architecting-systems-for-scale/"]
---

> 「[checkcheckzz/system-design-interview](https://github.com/checkcheckzz/system-design-interview)」의 「Facebook 뉴스 피드·타임라인 설계」 문항이 가리키는 자료, Etsy의 「[Activity Feeds Architecture](http://www.slideshare.net/danmckinley/etsy-activity-feeds-architecture)」, Facebook의 「[Building Timeline](https://www.facebook.com/note.php?note_id=10150468255628920)」(2012)과 그 요약 「[Facebook Timeline: Brought To You By The Power Of Denormalization](http://highscalability.com/blog/2012/1/23/facebook-timeline-brought-to-you-by-the-power-of-denormaliza.html)」, High Scalability의 「[Tumblr Architecture](http://highscalability.com/blog/2012/2/13/tumblr-architecture-15-billion-page-views-a-month-and-harder.html)」, 「[Scaling Twitter](http://highscalability.com/scaling-twitter-making-twitter-10000-percent-faster)」, 「[Instagram Architecture](http://highscalability.com/blog/2011/12/6/instagram-architecture-14-million-users-terabytes-of-photos.html)」, 「[Introduction to Architecting Systems for Scale](http://lethain.com/introduction-to-architecting-systems-for-scale/)」를 바탕으로 재구성한 노트다.

## 피드가 어려운 이유

뉴스 피드는 **사용자마다 다른 목록**이다. 내가 팔로우하는 수백 명의 최근 활동을 모아 시간·관련도순으로 보여 줘야 하고, 읽기가 쓰기보다 훨씬 많으며, 스크롤 첫 화면은 수백 ms 안에 떠야 한다. 반대로 팔로워가 수천만 명인 계정이 글 하나를 쓰면 그만큼의 피드가 바뀐다.

피드의 재료는 둘이다.

| 재료 | 뜻 | 저장 모양 |
| --- | --- | --- |
| 연결(connection) | 누가 누구(또는 어떤 가게·주제)를 따르나. 친구, 팔로우, 즐겨찾기, 구매 관계를 아우르는 방향 그래프 | 간선을 두 번 저장한다. 나가는 간선 표(내가 따르는 대상)와 들어오는 간선 표(나를 따르는 사람). 간선마다 친밀도(affinity) 가중치 |
| 활동(activity) | 누가 무엇을 했나. 주어·동사·목적어(SVO)로 줄인 사건 기록 | `[소유자, (주어, 동사, 목적어)]` |

## 두 가지 기본 전략

| 전략 | 동작 | 장점 | 단점 |
| --- | --- | --- | --- |
| 읽을 때 모으기(pull, 스캐터·개더) | 피드를 열 때 따르는 사람들의 최근 활동을 각각 가져와 합친다 | 쓰기가 싸다. 저장이 적다 | 따르는 수만큼 읽기가 퍼진다. 읽기가 많은 서비스에서 비싸다 |
| 쓸 때 뿌리기(push, 팬아웃·받은편지함) | 글이 써지면 팔로워마다의 받은편지함(inbox)에 미리 넣는다. 피드는 내 받은편지함을 읽기만 한다 | 읽기가 한 번에 끝난다 | 팔로워 수만큼 쓰기가 늘어난다. 팔로워가 매우 많은 계정에서 폭발한다 |

- Tumblr 대시보드는 스캐터·개더로 버티다 하루 5억 페이지 뷰의 70%가 대시보드가 되자 **받은편지함 모델**로 옮겼다. 초당 100만 쓰기, 5만 읽기를 목표로, 사용자 범위마다 HBase·서비스·Redis 캐시를 다 갖춘 **셀**에 받은편지함을 두고, 모든 셀이 사내 이벤트 버스(Kafka 위의 「파이어호스」)에서 모든 글을 받아 자기 사용자의 받은편지함에 넣는다. 파이어호스는 일주일 치를 보관해 원하는 시점부터 다시 읽을 수 있다.
- 실제 대형 서비스는 **혼합**한다. 보통 계정은 팬아웃으로 뿌리고, 팔로워가 매우 많은 계정의 글은 읽을 때 따로 끌어와 합친다.

## 쓰기 경로: 활동을 복제하고 나중에 퍼뜨린다

Etsy는 활동 하나를 **관심 가질 당사자 수만큼 복제**한다. 「스티브가 카일을 서클에 추가했다」는 스티브의 샤드에 `[스티브, (스티브, 연결, 카일)]`, 카일의 샤드에 `[카일, (스티브, 연결, 카일)]`로 두 번 쓴다. 「카일이 육포를 즐겨찾기했다」는 카일, 카일의 가게, 육포 상품 소유자 몫으로 세 번 쓴다. 각자의 샤드에서 자기 활동만 읽으면 되도록 데이터를 미리 흩어 두는 것이다. 쓰기가 많아지는 복제는 작업 큐(Gearman)로 뒤로 미룬다.

사용자 경험은 「**요청 안에서는 보이는 만큼만** 하고 나머지는 나중에」로 맞춘다. 글을 쓰면 내 타임라인에는 즉시 보이고, 팔로워 피드 갱신은 큐 워커가 뒤에서 한다. Instagram은 팬아웃을 Gearman 작업으로, Twitter 초기에는 친구 캐시 무효화를 메시지 큐로 백그라운드에 넘겼다.

## 읽기 경로: 집계와 표시

피드 생성은 **집계(aggregation)** 와 **표시(display)** 두 단계로 나뉜다. 집계는 DB의 활동을 사용자별 피드(캐시)로 바꾸는 일이고, 대개 오프라인 작업으로 돈다.

```text
1. 연결 고르기   따르는 대상 전부가 아니라 실제로 활동을 가져올 대상을 고른다
                 (친밀도를 확률로 써서 가까운 연결을 더 자주 고르는 식)
2. 활동 집합     고른 연결별로 최근 활동을 가져와 점수와 플래그를 붙인다
                 플래그는 피드 주인 관점이다(「내 가게에 관한 것」 등)
3. 중복 제거     같은 사건이 여러 경로(친구 A와 B가 모두 연결됨)로 들어온 것을 SVO로 지운다
4. 점수와 정렬   기본은 시간 감쇠(오래될수록 낮게), 여기에 관계·종류 가중치
5. 저장          결과를 Memcached 같은 캐시에 사용자별 피드로 둔다
표시            캐시의 피드를 읽어 비슷한 활동을 묶고(「카일 외 3명이 좋아합니다」) 렌더링한다
```

따르는 대상이 피드 하나에 담기 어려울 만큼 많으면 1단계에서 표본을 고르거나, 따를 수 있는 수에 상한을 둔다.

## 오래된 기록까지: 비정규화와 캐시 수명

Facebook 타임라인은 최근 며칠이 아니라 **평생의 기록**을 보여 줘야 했다. 정규화된 기존 데이터는 화면 하나에 DB 왕복이 많았고, 캐시에 없으면 디스크 여기저기를 무작위로 읽었다.

- **비정규화**: 각 행이 활동 정보와 랭킹 메타데이터를 함께 갖게 다시 써서, 행을 고르거나 버리는 데 추가 조회가 필요 없게 했다. 디스크에는 `(사용자, 시간)` 순으로 정렬해 InnoDB가 한 사용자의 기록을 몇 번의 순차 I/O로 읽는다. 수십 가지 옛 데이터 형식은 변환 규칙 언어와 컴파일러로 옮겼다.
- **계산을 데이터 옆에서**: 랭킹·체크인 묶기 같은 집계기를 DB 서버마다 돌려 디스크를 끝까지 쓰고, 화면에 보일 데이터만 네트워크로 보낸다.
- **캐시 수명을 데이터 성격에 맞춘다**: 「2010년 전체 활동 순위」처럼 큰 질의의 결과는 작고 거의 바뀌지 않아 Memcached에 오래 둔다. 「최근 활동」은 자주 무효화되지만 다시 만들기가 빨라, 결과 캐시 대신 DB 행 캐시(InnoDB 버퍼 풀, 플래시 캐시)로 받친다.
- 새 기반 기술을 만들기보다 사내에서 검증된 MySQL·Memcached·피드 집계기를 다시 써서 6개월 만에 출시했다.

캐시할 수 없는 큰 조인은 플래시 전용 DB 계층으로 모으고 여러 서버에 동시에 질의하는 프록시를 둬서 줄였다.

## 정리

- 피드 = 연결 그래프 + 활동 로그. 간선은 양방향으로, 활동은 관심 당사자별로 복제해 둔다.
- 읽기가 많으면 쓸 때 받은편지함에 뿌리고(팬아웃), 팔로워가 매우 많은 계정만 읽을 때 합친다.
- 무거운 팬아웃은 큐로 미루되, 쓴 사람 화면에는 즉시 보이게 한다.
- 집계는 연결 고르기 → 활동 모으기 → 중복 제거 → 점수 → 캐시 순서다.
- 결론: 피드는 「언제 일을 하느냐(쓸 때냐 읽을 때냐)」를 계정 규모에 따라 나눠 정하는 문제다.

관련 노트: [[message-queue-kafka|메시지 큐와 Kafka]], [[caching-strategies|캐시 전략]], [[redis|Redis]], [[database-sharding|데이터베이스 샤딩]], [[notification-system|알림 시스템 설계]], [[web-scalability-components|웹 확장성의 구성 요소]]
