---
title: "힙과 우선순위 큐"
concept: "Heap"
summary: "우선순위가 가장 높은 원소를 O(log n)에 넣고 꺼낼 수 있게 해 주는 완전 이진 트리 기반 자료구조."
tags: ["data-structure", "heap", "priority-queue", "python"]
source: til
---

## 우선순위 큐

우선순위 큐(Priority Queue)는 큐처럼 원소를 넣고 꺼내지만, **들어온 순서가 아니라 우선순위가 높은 원소부터** 꺼내는 자료구조다. 최소한 두 연산을 지원해야 한다.

1. `push`: 원소를 우선순위와 함께 추가
2. `pop`: 우선순위가 가장 높은 원소를 제거하고 반환

리스트로 구현하면 삽입 O(1)·삭제 O(n)이거나(매번 최댓값 탐색), 삽입 O(n)·삭제 O(1)이다(정렬 상태 유지). **힙**을 쓰면 둘 다 O(log n)이 된다.

## 힙 (Heap)

힙은 **완전 이진 트리(Complete Binary Tree)** 이면서 다음 조건을 만족하는 자료구조다.

- **최대 힙(Max Heap)**: 모든 부모 노드의 값 ≥ 자식 노드의 값 → 루트가 최댓값
- **최소 힙(Min Heap)**: 모든 부모 노드의 값 ≤ 자식 노드의 값 → 루트가 최솟값

형제 노드끼리의 순서는 정해져 있지 않다. 완전 이진 트리라서 배열로 표현할 수 있는데, 0-based 인덱스에서 노드 k의 자식은 `2k+1`, `2k+2`, 부모는 `(k-1)//2`다.

![최대 힙과 최소 힙](/images/til/Algorithm/%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%9C%EB%85%90/14-%ED%9E%99-Heap-%EC%9A%B0%EC%84%A0%EC%88%9C%EC%9C%84-%ED%81%90.assets/oP565GF.png)

### 삽입 (push) — 아래에서 위로

1. 새 값을 트리의 맨 끝(배열의 마지막)에 넣는다.
2. 부모와 비교해 힙 조건을 어기면 자리를 바꾼다.
3. 조건을 만족하거나 루트에 닿을 때까지 반복한다.

![힙 삽입](/images/til/Algorithm/%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%9C%EB%85%90/14-%ED%9E%99-Heap-%EC%9A%B0%EC%84%A0%EC%88%9C%EC%9C%84-%ED%81%90.assets/VeuoJbK.png)

### 삭제 (pop) — 위에서 아래로

1. 루트(우선순위가 가장 높은 값)를 꺼낸다.
2. 맨 끝 노드를 비어 있는 루트 자리로 옮긴다.
3. 자식들과 비교해 더 우선순위가 높은 자식과 자리를 바꾼다.
4. 조건을 만족할 때까지 아래로 내려간다.

![힙 삭제](/images/til/Algorithm/%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%9C%EB%85%90/14-%ED%9E%99-Heap-%EC%9A%B0%EC%84%A0%EC%88%9C%EC%9C%84-%ED%81%90.assets/6dimHpq.png)

트리의 높이가 log n이므로 삽입·삭제 모두 O(log n), 최솟값(최댓값) 확인은 O(1)이다. 힙에서 원소를 하나씩 꺼내면 정렬이 되는데, 이것이 **힙 정렬**(O(n log n))이다.

## 파이썬의 `heapq`

`heapq` 모듈은 일반 리스트를 **최소 힙**으로 다룬다.

- 모든 k에 대해 `heap[k] <= heap[2*k+1]` **그리고** `heap[k] <= heap[2*k+2]`가 성립한다.
- 가장 작은 원소는 항상 `heap[0]`에 있다.

```python
import heapq

hq = []
heapq.heappush(hq, 4)
heapq.heappush(hq, 1)
heapq.heappush(hq, 3)
heapq.heappush(hq, 7)

print(hq[0])               # 1 (꺼내지 않고 확인)
print(heapq.heappop(hq))   # 1 (빈 힙에서 호출하면 IndexError)

x = [4, 3, 1, 2, 5, 6]
heapq.heapify(x)           # 리스트를 제자리에서 힙으로 변환, O(n)
print(x)  # [1, 2, 4, 3, 5, 6]
```

### 최대 힙과 (우선순위, 값) 쌍

`heapq`는 최소 힙만 제공하므로 최대 힙이 필요하면 **값의 부호를 뒤집어** 넣는다. 튜플은 첫 원소부터 비교되므로 `(우선순위, 값)` 형태로 넣으면 우선순위 큐가 된다.

```python
import heapq

# 최대 힙
max_heap = []
for v in [3, 10, 5]:
    heapq.heappush(max_heap, -v)
print(-heapq.heappop(max_heap))  # 10

# 우선순위 큐
tasks = []
heapq.heappush(tasks, (2, "write"))
heapq.heappush(tasks, (1, "read"))
print(heapq.heappop(tasks))  # (1, 'read')
```

> **Python 3.14부터**는 `heapq`에 최대 힙 함수(`heapify_max`, `heappush_max`, `heappop_max`, `heappushpop_max`, `heapreplace_max`)가 추가되어 부호를 뒤집지 않아도 된다. 다만 코딩 테스트 채점 환경은 대개 이보다 낮은 버전이라, 음수로 넣는 방법이 여전히 가장 안전하다. ([Python 문서: heapq](https://docs.python.org/3/library/heapq.html))
>
> ```python
> import heapq  # Python 3.14+
>
> max_heap = []
> for v in [3, 10, 5]:
>     heapq.heappush_max(max_heap, v)
> print(heapq.heappop_max(max_heap))  # 10
> ```

### `queue.PriorityQueue`

`queue.PriorityQueue`도 있지만, 스레드 간 동기화(락)를 위한 클래스라 단일 스레드인 코딩 테스트에서는 `heapq`보다 느리다.

```python
from queue import PriorityQueue

q = PriorityQueue(maxsize=10)  # maxsize로 크기 제한 가능
q.put((1, "apple"))
q.put((3, "banana"))
print(q.get()[1])  # apple
```

## 핵심 정리

- 우선순위 큐는 힙으로 구현하며 삽입·삭제 O(log n), 최솟값 확인 O(1)
- 파이썬 `heapq`는 기본이 최소 힙. 최대 힙은 음수로 바꿔 넣는다(3.14+는 `heappush_max` 등도 가능).
- 다익스트라 최단 경로, 상위 K개 구하기, 작업 스케줄링 등에 쓰인다.

관련 노트: [[dijkstra|다익스트라]], [[queue-deque|큐와 덱]], [[merge-quick-sort|정렬 알고리즘 비교(힙 정렬)]]
