---
title: "최소 신장 트리: 크루스칼과 프림"
concept: "Minimum Spanning Tree"
summary: "가중치 그래프의 모든 정점을 사이클 없이 가장 싸게 잇는 최소 신장 트리와, 간선을 고르는 크루스칼·정점을 넓혀 가는 프림 알고리즘의 동작·복잡도·선택 기준."
tags: ["algorithm", "graph", "greedy", "union-find", "heap"]
source: other
date: "2026-10-30"
sources: ["https://github.com/jbee37142/Interview_Question_for_Beginner/blob/main/DataStructure/README.md"]
---

> jbee의 「[Interview Question for Beginner](https://github.com/jbee37142/Interview_Question_for_Beginner)」 저장소 자료구조 문서의 Minimum Spanning Tree 절을 바탕으로 재구성한 노트다.

## 최소 신장 트리란

**신장 트리(spanning tree)** 는 연결 그래프의 **모든 정점을 사이클 없이 잇는 부분 그래프**다. 정점이 V개면 간선은 정확히 V-1개다. 그중 **간선 가중치의 합이 가장 작은 것**이 최소 신장 트리(Minimum Spanning Tree, MST)다.

도시를 모두 잇는 최소 비용 도로·전선·통신망, 클러스터링(가장 비싼 간선부터 끊기), 외판원 문제의 근사해가 대표 활용이다. 가중치가 모두 다르면 MST는 하나뿐이고, 같은 가중치가 있으면 여러 개일 수 있다.

두 알고리즘 모두 **그리디**다. 정당성은 **컷 성질(cut property)** 에서 나온다. 정점을 두 묶음으로 나눴을 때 그 사이를 건너는 간선 중 가장 가벼운 것은 반드시 어떤 MST에 들어간다.

## 크루스칼 (Kruskal): 간선을 고른다

1. 간선을 가중치 **오름차순**으로 정렬한다.
2. 가벼운 간선부터 보며, 양 끝이 **이미 같은 묶음이면 건너뛴다**(넣으면 사이클이 생긴다).
3. 다른 묶음이면 간선을 고르고 두 묶음을 합친다.
4. 고른 간선이 V-1개가 되면 끝난다. 끝까지 V-1개가 안 되면 그래프가 연결돼 있지 않은 것이다.

사이클 검사는 각 정점에 「속한 묶음 번호」를 두고 비교하는 방식이며, 실제로는 [[disjoint-set|Union-Find(서로소 집합)]]로 한다. 경로 압축과 union by rank·size를 쓰면 find·union이 거의 O(1)이다.

```python
def kruskal(n, edges):           # edges: [(w, u, v)]
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # 경로 절반 압축
            x = parent[x]
        return x
    total, picked = 0, 0
    for w, u, v in sorted(edges):
        ru, rv = find(u), find(v)
        if ru == rv:
            continue                 # 사이클
        parent[ru] = rv
        total += w
        picked += 1
        if picked == n - 1:
            break
    return total if picked == n - 1 else None
```

**복잡도는 정렬이 지배해 O(E log E)** 이고, E ≤ V²이므로 O(E log V)와 같다.

## 프림 (Prim): 정점을 넓혀 간다

1. 아무 정점 하나로 트리를 시작한다.
2. **트리 안 정점과 트리 밖 정점을 잇는 간선 중 가장 가벼운 것**을 골라 그 밖의 정점을 트리에 넣는다.
3. 모든 정점이 들어올 때까지 반복한다.

「가장 가벼운 경계 간선」을 매번 빨리 꺼내려고 [[heap-priority-queue|우선순위 큐]]를 쓴다. 구조가 [[dijkstra|다익스트라]]와 거의 같다. 다익스트라는 「출발점까지의 누적 거리」, 프림은 「트리까지의 간선 하나의 무게」를 키로 쓴다는 점만 다르다.

```python
import heapq
def prim(n, adj):                # adj[u] = [(w, v)]
    seen = [False] * n
    pq = [(0, 0)]
    total = 0
    while pq:
        w, u = heapq.heappop(pq)
        if seen[u]:
            continue             # 이미 트리에 들어온 정점
        seen[u] = True
        total += w
        for nw, v in adj[u]:
            if not seen[v]:
                heapq.heappush(pq, (nw, v))
    return total if all(seen) else None
```

| 구현 | 복잡도 |
| --- | --- |
| 인접 행렬 + 배열에서 최솟값 찾기 | O(V²) |
| 인접 리스트 + 이진 힙 | O(E log V) |
| 피보나치 힙 | O(E + V log V), 이론상 |

## 무엇을 고르나

| 기준 | 크루스칼 | 프림 |
| --- | --- | --- |
| 기본 단위 | 간선 | 정점 |
| 필요한 자료구조 | 정렬 + Union-Find | 인접 리스트 + 힙 |
| 유리한 그래프 | 간선이 적은 희소 그래프, 간선 목록으로 주어진 입력 | 간선이 많은 밀집 그래프(배열 O(V²) 버전) |
| 중간 상태 | 여러 조각(숲)이 점점 합쳐진다 | 트리 하나가 점점 자란다 |
| 덤 | 내림차순으로 돌리면 병목 경로 문제가 풀린다 | 시작 정점 주변부터 확정된다 |

코딩 테스트에서는 입력이 간선 목록으로 주어지는 경우가 많아 크루스칼이 짧고 실수가 적다.

## 정리

- MST = 모든 정점을 사이클 없이 잇는 V-1개 간선 중 가중치 합이 최소인 것
- 두 알고리즘 모두 컷 성질에 기댄 그리디다
- 크루스칼: 간선 정렬 + Union-Find로 사이클 검사, O(E log E)
- 프림: 트리에서 뻗는 가장 가벼운 간선을 힙으로 꺼낸다, O(E log V)
- 희소 그래프·간선 목록이면 크루스칼, 밀집 그래프면 프림

관련 노트: [[graph-basics|그래프의 기본과 표현 방법]], [[disjoint-set|서로소 집합 (Union-Find)]], [[greedy|그리디]], [[dijkstra|다익스트라 최단 경로]], [[heap-priority-queue|힙과 우선순위 큐]]
