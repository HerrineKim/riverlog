---
title: "스트림 근사 집계: HyperLogLog, Count-Min, Lossy Counting, Frugal, AMS"
concept: "Streaming Sketch"
summary: "끝없이 들어오는 데이터를 한 번만 보고, 전체보다 훨씬 작은 메모리로 「몇 종류인가」, 「이 키는 몇 번 나왔나」, 「자주 나오는 것은 무엇인가」, 「중앙값은 얼마인가」, 「분포가 얼마나 쏠렸나」에 근사로 답하는 알고리즘을 정리한다. HyperLogLog(선행 0의 최댓값과 조화 평균, 오차 1.04/√m, Redis 12 KB), Count-Min Sketch(행마다 해시, 최솟값, 과대 추정만), Lossy Counting(버킷 경계마다 가지치기, 거짓 음성 없음), Frugal Streaming(메모리 한두 칸의 분위수 추정), AMS(±1 해시로 2차 빈도 모멘트), 그리고 오차의 성격과 병합 가능성으로 고르는 법."
tags: ["algorithm", "data-structure", "scalability", "streaming", "statistics"]
source: other
date: "2026-11-28"
sources: ["https://github.com/resumejob/system-design-algorithms", "https://www.cse.ust.hk/vldb2002/VLDB2002-proceedings/slides/S10P03slides.pdf", "https://cloud.google.com/datastore/docs/articles/fast-and-reliable-ranking-in-datastore", "https://blog.cloudflare.com/counting-things-a-lot-of-different-things/"]
---

> GitHub 저장소 「[system-design-algorithms](https://github.com/resumejob/system-design-algorithms)」가 시스템 설계용으로 꼽은 목록 중 스트림 알고리즘(Lossy Counting, Frugal Streaming, HyperLogLog, Count-Min Sketch, AMS)을 원 논문의 정의로 정리한 노트다. Lossy Counting은 Manku·Motwani의 「[Approximate Frequency Counts over Data Streams](https://www.cse.ust.hk/vldb2002/VLDB2002-proceedings/slides/S10P03slides.pdf)」(VLDB 2002) 발표 자료로 확인했다. 예제 코드는 Python 3로 돌려 확인했다.

## 스트림 알고리즘이란

조회 로그, 패킷, 클릭처럼 끝없이 흘러 들어오는 데이터를 **스트림(stream)**이라 한다. 전부 저장해 두고 나중에 정확히 세면 좋겠지만, 키가 수억 개이거나 데이터를 다시 읽을 수 없으면 그럴 수 없다. 스트림 알고리즘은 다음 제약 안에서 답한다.

- 원소를 **한 번만**, 들어온 순서대로 본다.
- 메모리는 원소 수보다 훨씬 작다. 보통 원소 수의 로그나 상수 크기다.
- 대신 답은 **근사**다. 오차의 크기와, 그 오차를 넘을 확률을 미리 정할 수 있다.

이렇게 스트림을 작게 요약한 자료구조를 **스케치(sketch)**라 부른다.

| 질문 | 알고리즘 | 메모리 | 오차의 성격 | 여러 서버의 스케치 합치기 |
| --- | --- | --- | --- | --- |
| 이 원소가 있었나? | 블룸 필터 | 비트 m개 | 거짓 양성만 있다 | 비트 OR |
| 서로 다른 원소가 몇 개인가? | HyperLogLog | 레지스터 m개 | 상대 오차 약 1.04/√m | 레지스터별 최댓값 |
| 이 키는 몇 번 나왔나? | Count-Min Sketch | 카운터 w × d개 | 과대 추정만, εN 이내(확률 1−δ) | 카운터끼리 덧셈 |
| 자주 나온 것은 무엇인가? | Lossy Counting | 항목 (1/ε)·log(εN)개 이하 | 과소 추정만, εN 이내(확정) | 단순하지 않다 |
| 중앙값·분위수는? | Frugal Streaming | 그룹마다 한두 칸 | 보장된 오차 한계 없음. 분포가 바뀌면 따라간다 | 단순하지 않다 |
| 분포가 얼마나 쏠렸나(F2)? | AMS | 카운터 O((1/ε²)·log(1/δ))개 | (1±ε)배 이내(확률 1−δ) | 카운터끼리 덧셈 |

블룸 필터의 구조와 거짓 양성률은 [[real-world-algorithms|현실 시스템을 움직이는 알고리즘과 자료구조]]에 있다.

## HyperLogLog: 서로 다른 원소 세기

「오늘 방문한 고유 사용자 수」처럼 **서로 다른 원소의 개수(cardinality)**를 센다. 정확히 세려면 본 원소를 모두 기억해야 하지만, HyperLogLog(Flajolet 등, 2007)는 수 KB로 수십억 개를 센다.

**직관**: 원소를 해시하면 고른 난수처럼 된다. 해시값이 `0001…`처럼 0이 k번 연달아 나온 뒤 1이 나올 확률은 1/2^(k+1)이다. 그런 해시를 봤다면 서로 다른 원소를 대략 2^(k+1)개쯤 봤다고 짐작할 수 있다. 이 짐작은 운에 크게 흔들리므로 여러 번 나눠 재서 평균을 낸다.

| 단계 | 하는 일 |
| --- | --- |
| 1. 나누기 | 해시값의 앞 p비트로 레지스터 m = 2^p개 중 하나를 고른다 |
| 2. 기록 | 나머지 비트에서 처음 1이 나오는 위치(앞쪽 0의 개수 + 1)를 구해, 그 레지스터에 지금까지의 **최댓값**만 남긴다 |
| 3. 추정 | 레지스터 값 M[j]의 **조화 평균**으로 추정한다: E = α_m · m² / Σ 2^(−M[j]). α_m은 편향을 바로잡는 상수다. 개수가 아주 적을 때는 빈 레지스터 수로 세는 선형 계수(linear counting)로 바꾼다 |

- 표준 오차는 약 **1.04/√m**이다. 레지스터를 4배로 늘려야 오차가 절반이 된다.
- 같은 원소는 몇 번 들어와도 같은 레지스터에 같은 값을 쓰므로 결과가 바뀌지 않는다.
- 두 스케치는 레지스터별 최댓값을 취하면 합쳐진다. 서버마다 따로 세고 나중에 합쳐 「전체 고유 사용자」를 구할 수 있다. 단, 합집합만 정확하고 교집합은 포함·배제로 계산하면 오차가 커진다.
- Redis의 HyperLogLog는 레지스터 16384개(p = 14)를 써서 최대 12 KB에 표준 오차 0.81%다. `PFADD`, `PFCOUNT`, `PFMERGE` 명령을 쓴다([[redis|Redis]]). Google의 HyperLogLog++는 64비트 해시, 작은 개수 구간의 편향 보정, 개수가 적을 때의 희소 표현을 더한 개량판이다.

## Count-Min Sketch: 키별 빈도

「이 검색어는 몇 번 나왔나」를 키 전체를 저장하지 않고 답한다(Cormode·Muthukrishnan, 2005).

| 구성 | 내용 |
| --- | --- |
| 표 | 행 d개 × 열 w개의 카운터 |
| 해시 | 행마다 다른 해시 함수 h_1 … h_d |
| 갱신 | 원소 x가 c번 오면 모든 행 i에서 `M[i][h_i(x)] += c` |
| 질의 | 모든 행의 `M[i][h_i(x)]` 중 **최솟값** |

- 다른 키와 칸을 나눠 쓰는 충돌은 카운터를 키우기만 하므로, 빼는 갱신이 없는 한 **과소 추정은 없고 과대 추정만** 있다. 행이 여럿이면 그중 가장 덜 오염된 칸을 고르는 셈이다.
- w = ⌈e/ε⌉, d = ⌈ln(1/δ)⌉로 잡으면, 추정값은 확률 1−δ 이상으로 「실제 빈도 + εN」 이하다(N은 전체 개수). 오차가 전체 개수에 비례하므로 **자주 나오는 키에는 정확하고 드문 키에는 부정확하다.**
- 갱신 때 최솟값보다 큰 칸은 올리지 않는 보수적 갱신(conservative update)을 쓰면 과대 추정이 줄어든다.
- 상위 K개를 구할 때는 Count-Min Sketch로 빈도를 추정하고 크기 K의 힙에 후보를 둔다([[trending-topics|실시간 트렌딩과 Top-K 집계]]). Redis 8의 기본 배포판에는 Count-Min Sketch와 Top-K가 확률적 자료구조로 들어 있다.

## Lossy Counting: 자주 나온 것 찾기

전체의 1% 이상을 차지하는 검색어처럼 **빈도가 임계값을 넘는 원소(heavy hitter)**를 찾는다(Manku·Motwani, 2002). 확률이 아니라 **확정적인** 보장을 준다.

매개변수는 두 개다. 찾고 싶은 비율 s(예: 1%)와 허용 오차 ε(예: 0.1%, s보다 훨씬 작게)이다.

1. 스트림을 너비 w = ⌈1/ε⌉의 버킷으로 나눈다. 지금까지 N개를 봤다면 현재 버킷 번호는 b = ⌈N/w⌉다.
2. 표에는 (원소, 센 횟수 f, 놓쳤을 수 있는 최대 횟수 Δ)를 둔다. 원소가 표에 있으면 f를 1 올리고, 없으면 (원소, 1, b − 1)로 새로 넣는다. 지금 처음 들어왔지만 앞선 b − 1개 버킷에서 이미 그만큼 나왔다가 지워졌을 수 있다는 뜻이다.
3. 버킷 경계에서 f + Δ ≤ b인 항목을 지운다. 버킷마다 한 번도 안 나온 것과 다름없는 드문 원소가 걸러진다.
4. 질의할 때는 f ≥ (s − ε)N인 원소를 내놓는다.

```python
import math

class LossyCounter:
    def __init__(self, epsilon):
        self.w = math.ceil(1 / epsilon)   # 버킷 너비
        self.n = 0                        # 지금까지 본 원소 수
        self.table = {}                   # 원소 -> [f, delta]

    def add(self, x):
        self.n += 1
        b = math.ceil(self.n / self.w)    # 현재 버킷 번호
        if x in self.table:
            self.table[x][0] += 1
        else:
            self.table[x] = [1, b - 1]
        if self.n % self.w == 0:          # 버킷 경계에서 정리
            self.table = {k: v for k, v in self.table.items() if v[0] + v[1] > b}

    def frequent(self, s, epsilon):
        return {k: v[0] for k, v in self.table.items() if v[0] >= (s - epsilon) * self.n}
```

| 보장 | 내용 |
| --- | --- |
| 거짓 음성 없음 | 실제 빈도가 sN 이상인 원소는 반드시 나온다 |
| 거짓 양성 한계 | 실제 빈도가 (s − ε)N 미만인 원소는 나오지 않는다 |
| 빈도 오차 | 센 횟수 f는 실제보다 작을 수 있지만 그 차이는 εN 이하다 |
| 메모리 | 표의 항목은 (1/ε)·log(εN)개를 넘지 않는다 |

드문 원소 100만 종류 사이에 세 원소가 각각 2%씩 섞인 20만 개 스트림에 s = 1%, ε = 0.1%로 돌리면, 표에는 끝에 4개 항목만 남고 세 원소가 정확한 횟수로 나온다. 같은 논문의 Sticky Sampling은 같은 문제를 확률적으로 푼다. 카운터 K개만 두는 Misra-Gries(카운터가 꽉 찬 채 새 원소가 오면 모든 카운터를 1씩 줄이고 0이 된 것을 지운다)와 Space-Saving(가장 작은 카운터를 새 원소가 넘겨받고 그 값에 1을 더한다)도 같은 문제를 푸는 대표 알고리즘이다.

## Frugal Streaming: 메모리 한 칸으로 분위수 추정

「사용자마다 응답 시간의 중앙값」처럼 그룹이 수백만 개라 그룹마다 표본이나 큰 스케치를 둘 수 없을 때 쓴다(Ma·Muthukrishnan·Sandler, 2013). Frugal-1U는 그룹마다 **추정값 하나**만 들고 있다.

```python
import random

def frugal_1u(stream, q=0.5):
    """q 분위수를 메모리 한 칸으로 추정한다 (q=0.5면 중앙값)."""
    m = 0
    for x in stream:
        r = random.random()
        if x > m and r < q:
            m += 1
        elif x < m and r < 1 - q:
            m -= 1
    return m
```

새 값이 추정값보다 크면 확률 q로 한 칸 올리고, 작으면 확률 1 − q로 한 칸 내린다. 추정값 위아래로 오는 값의 비율이 (1 − q) : q가 되는 지점, 곧 q 분위수에서 오르내림이 균형을 이룬다. Frugal-2U는 이동 폭과 방향을 한 칸 더 기억해 큰 값으로 더 빨리 다가간다.

- 장점은 메모리와 계산이 극히 작고, 분포가 서서히 바뀌어도 따라간다는 것이다.
- 한계도 분명하다. 한 번에 1씩 움직이므로 값의 단위가 크면 수렴이 느리고, 오차 한계를 보장하지 않는다. 정규분포 20만 개(평균 500, 표준편차 100)에 돌리면 중앙값을 499 대신 517 근처로 낸다. 오차 보장이 필요하면 t-digest나 KLL 같은 분위수 스케치를 쓴다. Apache DataSketches가 KLL·HyperLogLog 등을 구현해 둔 대표 라이브러리다.

## AMS: 분포가 얼마나 쏠렸나

원소 i가 f_i번 나왔을 때 k차 **빈도 모멘트**는 F_k = Σ f_i^k다. F_0은 서로 다른 원소 수, F_1은 전체 개수이고, **F_2**는 빈도의 제곱합이라 분포가 소수 원소에 쏠릴수록 커진다. 두 테이블을 조인할 때 결과 크기를 가늠하는 데도 쓰인다(자기 조인 크기). Alon·Matias·Szegedy의 1996년 논문은 F_2를 로그 크기의 메모리로 근사하는 방법과, 차수가 높으면(논문에서는 k > 5) 원소 종류 수의 거듭제곱만큼 메모리가 필요하다는 하한을 함께 보였다. k > 2 전체에 대한 빡빡한 하한은 2002~2003년의 후속 연구가 보였다. 이 연구로 세 사람은 2005년 괴델상을 받았다.

AMS 스케치는 원소마다 +1 또는 −1을 고르게 주는 해시 s를 하나 정하고 합계 Z 하나만 유지한다.

1. 원소 x가 오면 `Z += s(x)`. 결국 Z = Σ s(i)·f_i가 된다.
2. Z²의 기댓값은 F_2다. 서로 다른 원소의 곱 s(i)·s(j)는 평균이 0이라 사라지고 f_i²만 남기 때문이다.
3. 하나만으로는 흔들림이 크므로 독립된 Z를 여러 개 두고, 몇 개씩 묶어 평균을 낸 뒤 그 평균들의 **중앙값**을 답으로 한다(median of means). O(1/ε²)개씩 평균하고 O(log(1/δ))개의 중앙값을 취하면 확률 1−δ로 (1±ε)배 이내다.

Z는 덧셈으로만 쌓이므로 원소를 빼는 갱신(`Z -= s(x)`)과 서버별 스케치의 합산이 그대로 된다. 이렇게 갱신이 선형인 스케치를 **선형 스케치**라 하고, Count-Min Sketch도 같은 성질을 갖는다.

## 고르는 법

- **정확도가 꼭 필요한가부터 묻는다.** 결제 금액, 재고처럼 틀리면 안 되는 수는 스케치로 세지 않는다. 대시보드의 고유 방문자, 인기 검색어처럼 1% 안팎의 오차를 받아들일 수 있는 지표에 쓴다.
- **오차의 방향을 본다.** Count-Min은 많이 세고 Lossy Counting은 적게 센다. 「한도 초과 의심 키를 놓치면 안 되는」 속도 제한에는 과대 추정 쪽이 안전하다.
- **합칠 수 있는지 본다.** 서버·시간대별로 세어 나중에 합칠 거라면 HyperLogLog(최댓값), Count-Min과 AMS(덧셈)처럼 병합 규칙이 단순한 스케치가 편하다.
- **메모리는 오차와 맞바꾼다.** HyperLogLog는 오차를 절반으로 줄이려면 메모리가 4배, Count-Min은 ε을 절반으로 줄이려면 열이 2배 필요하다.

## 정리

- 스트림 알고리즘은 원소를 한 번만 보고 아주 작은 메모리로 근사한다. 오차 크기와 그 오차를 넘을 확률을 미리 정한다.
- HyperLogLog는 해시의 선행 0 길이를 레지스터마다 최댓값으로 남기고 조화 평균으로 서로 다른 원소 수를 추정한다. 오차는 1.04/√m이고 최댓값으로 합쳐진다.
- Count-Min Sketch는 행마다 다른 해시로 카운터를 올리고 최솟값을 답한다. 과대 추정만 있고 오차는 전체 개수의 ε배 이내다.
- Lossy Counting은 버킷 경계마다 드문 원소를 지워 heavy hitter를 확정적으로 찾는다. 거짓 음성이 없다.
- Frugal Streaming은 그룹마다 한두 칸으로 분위수를 따라가고, AMS는 ±1 해시의 합으로 빈도 제곱합을 추정한다.

관련 노트: [[real-world-algorithms|현실 시스템을 움직이는 알고리즘과 자료구조]], [[trending-topics|실시간 트렌딩과 Top-K 집계]], [[redis|Redis]], [[hash-table|해시 테이블]], [[heap-priority-queue|힙과 우선순위 큐]]
