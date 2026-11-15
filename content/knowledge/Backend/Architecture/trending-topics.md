---
title: "실시간 트렌딩과 Top-K 집계"
concept: "Trending Topics"
summary: "최근 시간 창에서 가장 많이 언급된 상위 K개를 구하는 문제를 정리했다. 슬롯 링 버퍼로 만드는 슬라이딩 창 카운터, 키별 카운트 → 부분 순위 → 전역 순위의 3단 집계, 창이 밀릴 때 다시 계산하지 않는 최소 후보 집합(MinTopk), 키가 너무 많을 때의 근사 Top-K, 과거 패턴과의 거리로 트렌드를 일찍 잡는 비모수 방법까지 다룬다."
tags: ["backend", "architecture", "realtime", "big-data", "algorithm"]
source: other
date: "2026-10-31"
sources: ["https://github.com/checkcheckzz/system-design-interview", "http://www.michael-noll.com/blog/2013/01/18/implementing-real-time-trending-topics-in-storm/", "http://snikolov.wordpress.com/2012/11/14/early-detection-of-twitter-trends/", "http://davis.wpi.edu/xmdv/docs/EDBT11-diyang.pdf"]
---

> 「[checkcheckzz/system-design-interview](https://github.com/checkcheckzz/system-design-interview)」의 「지난 시간 구간의 상위 k개 요청」, 「트렌딩 토픽」 문항이 가리키는 자료인 Michael Noll의 「[Implementing Real-Time Trending Topics With a Distributed Rolling Count Algorithm in Storm](http://www.michael-noll.com/blog/2013/01/18/implementing-real-time-trending-topics-in-storm/)」(2013), Stanislav Nikolov의 「[Early detection of Twitter trends explained](http://snikolov.wordpress.com/2012/11/14/early-detection-of-twitter-trends/)」(2012), Yang 외의 「[An Optimal Strategy for Monitoring Top-k Queries in Streaming Windows](http://davis.wpi.edu/xmdv/docs/EDBT11-diyang.pdf)」(EDBT 2011)를 바탕으로 재구성한 노트다.

## 문제

**트렌딩(trending)** 은 「일정 시간 창 안에서 언급이 가장 많은 상위 N개」다. 「지금 뜨는 것」에는 늘 「최근 5분」, 「오늘」 같은 창이 붙는다. 그래서 단순 누적 카운트가 아니라 **창이 밀리면서 오래된 수는 빠지는** 카운트가 필요하고, 입력은 초당 수십만 건의 끝없는 스트림이다.

## 슬라이딩 창 카운터

창을 슬롯 m개로 나누고 슬롯 하나가 N분이면 창은 N × m분이다. N = 1, m = 5면 「최근 5분 합」을 1분마다 낸다.

| 구성 | 하는 일 |
| --- | --- |
| 슬롯 카운터 | `Map<키, long[m]>`. 키마다 슬롯 배열을 둔다. 가장 흔한 연산이 「한 키의 모든 슬롯 합」이라 한 키의 값을 붙여 두는 배열이 지역성에 유리하다 |
| 창 전진 | 시간을 직접 보지 않는 링 버퍼다. 「합을 내고 한 칸 전진」을 부를 때마다 가장 오래된 슬롯을 비우고 그 자리에 새 수를 센다 |
| 순위 | 고정 크기 상위 N 목록. 갱신할 때 N위 밖은 버린다 |

자료구조를 스트림 엔진과 분리해 두면 단위 테스트가 쉽다. 「증가」와 「합산 후 전진」을 한 스레드가 정해진 순서로만 부르게 하면 락 없이도 동시성 문제가 사라진다. 백그라운드 스레드가 시계를 보고 창을 밀던 구현은 카운트가 손상되는 경쟁 조건이 있었고, 엔진이 주기적으로 넣어 주는 **틱(tick) 메시지**로 시간을 주입하자 사라졌다. 틱은 일반 메시지 뒤에 줄을 서므로 주기는 최선 노력이다.

## 3단 분산 집계

```text
입력(병렬) → 키별 카운트 → 부분 순위 → 전역 순위(인스턴스 1개)
            키 기준 파티션   키 기준 파티션   전부 한곳으로
```

- **키별 카운트**: 같은 단어는 늘 같은 인스턴스로 보낸다(키 기준 그루핑). 인스턴스마다 자기 카운터만 만지므로 동시성 코드가 필요 없다.
- **부분 순위**: 각 인스턴스가 받은 키들의 상위 N만 추려 보낸다. MapReduce의 컴바이너처럼 마지막 단계로 가는 양을 줄인다.
- **전역 순위**: 단일 인스턴스가 부분 순위들을 합쳐 최종 상위 N을 낸다.

예시는 Storm 토폴로지(스파우트 → 롤링 카운트 볼트 → 중간 순위 볼트 → 전체 순위 볼트)지만, 지금은 Flink·Kafka Streams·Spark Structured Streaming의 **윈도 집계**로 같은 일을 한다. 텀블링·슬라이딩·세션 창을 기본 제공하고, 처리 시각 대신 **이벤트 시각**으로 창을 나누며 늦게 온 이벤트는 워터마크로 다룬다.

## 창이 밀릴 때 다시 계산하지 않기: MinTopk

점수가 정해진 객체들이 창에 들어오고 나갈 때 상위 K를 계속 유지하는 문제에서, 단순한 방법은 상위 K에 있던 객체가 창에서 빠질 때마다 창 안 전체에서 다시 계산한다. 이 재계산이 CPU와 메모리(창 안의 모든 객체를 들고 있어야 한다)의 병목이다.

**MinTopk** 는 현재와 미래의 창에서 상위 K가 될 가능성이 남은 객체만 들고 있으면 충분하다는 데서 출발한다. 어떤 객체보다 점수가 높고 **더 늦게 만료되는** 객체가 이미 K개 있으면, 그 객체는 앞으로 어떤 창에서도 상위 K에 들 수 없으므로 버린다. 이렇게 남긴 **최소 Top-K 후보 집합**만 갱신하면 재계산이 필요 없고, CPU와 메모리 모두 최적임이 증명된다.

## 키가 너무 많을 때: 근사 Top-K

모든 키의 정확한 카운트를 메모리에 둘 수 없을 만큼 키가 많으면(검색어, URL) 정확도를 조금 내주고 고정 메모리로 근사한다. **Count-Min Sketch** 로 키별 빈도를 과대 추정 쪽으로 근사하고 크기 K의 힙에 상위 후보를 유지하거나, 카운터 K개만 두고 새 키가 오면 가장 작은 카운터를 빼앗아 쓰는 Space-Saving 계열 알고리즘을 쓴다. 자료구조의 원리는 [[real-world-algorithms|현업에서 쓰는 알고리즘]]과 [[heap-priority-queue|힙과 우선순위 큐]]에 있다.

## 트렌드를 일찍 잡기

「많이 언급됨」은 늦은 신호다. 트렌드가 될 주제를 더 일찍 잡으려면 언급 수의 **모양**을 본다.

- 「평소 일정 + 가끔 점프」 같은 모형을 정해 점프 크기를 추정하는 **모수 방법**은, 실제 전조가 작은 점프 뒤 큰 점프, 점진 상승처럼 제각각이라 모형 선택 자체가 어렵다.
- **비모수 방법**은 과거에 트렌드가 된 주제와 안 된 주제의 활동 시계열을 예시로 두고, 새 주제의 최근 구간과 각 예시의 거리로 투표한다. 가중치는 `exp(−γ · 거리)`, 「트렌드」 표의 합 ÷ 「비트렌드」 표의 합이 1보다 크면 트렌드로 판정한다. 가중 k-최근접 이웃과 같다. 소셜 네트워크의 행동은 복잡도가 낮아 전조 패턴이 몇 가지로 뭉친다는 것이 근거다.
- 평가에서 트렌드의 79%를 Twitter 판정보다 평균 1.43시간 먼저 잡았고, 참양성률 95%, 거짓양성률 4%였다. γ와 관측 길이로 「빠르지만 오탐이 많은」 쪽과 「정확하지만 늦은」 쪽 사이를 고른다.
- 시계열로 검증할 때는 미래 데이터를 엿보지 않게 **시간순으로** 나눈다.

## 정리

- 트렌딩 = 슬라이딩 창 카운트 + 상위 N. 슬롯 링 버퍼로 창을 밀고, 오래된 슬롯은 비운다.
- 분산 집계는 키별 카운트 → 부분 순위 → 전역 순위의 3단으로, 마지막 단계로 가는 양을 줄인다.
- 시간은 엔진이 주는 틱이나 이벤트 시각 워터마크로 주입하고, 직접 시계를 보는 스레드를 두지 않는다.
- 키가 너무 많으면 근사 카운트로, 창 재계산이 문제면 최소 후보 집합으로 비용을 줄인다.
- 결론: Top-K 문제의 핵심은 「무엇을 버려도 되는가」를 정확히 아는 것이다.

관련 노트: [[message-queue-kafka|메시지 큐와 Kafka]], [[classic-distributed-systems|고전 분산 시스템 설계]], [[news-feed-design|뉴스 피드 설계]], [[real-world-algorithms|현업에서 쓰는 알고리즘]]
