---
title: "최소 공통 조상 (LCA)"
concept: "Lowest Common Ancestor"
summary: "트리에서 두 노드의 가장 가까운 공통 조상을 찾는 LCA. 깊이를 맞춰 함께 올라가는 O(N) 방법과, 2^k번째 조상 표(희소 테이블)로 질의마다 O(log N)에 답하는 이진 올리기(binary lifting), 두 노드 사이 거리 구하기까지."
tags: ["algorithm", "tree", "graph", "dynamic-programming"]
source: other
date: "2026-10-30"
sources: ["https://github.com/4z7l/tech_interview.zip/blob/main/%EC%A7%81%EB%AC%B4/Algorithm.md"]
---

> 4z7l의 「[tech_interview.zip](https://github.com/4z7l/tech_interview.zip)」 저장소 알고리즘 문서의 LCA 항목을 바탕으로 재구성한 노트다.

## LCA란

루트가 있는 트리에서 두 노드 u, v의 **최소 공통 조상(Lowest Common Ancestor, LCA)** 은 u와 v를 모두 자손으로 갖는 노드 중 **가장 깊은** 노드다. 한 노드가 다른 노드의 조상이면 그 노드 자신이 LCA다.

```text
        1
      /   \
     2     3
    / \     \
   4   5     6
  /
 7

LCA(7, 5) = 2    LCA(7, 6) = 1    LCA(4, 7) = 4
```

두 노드 사이의 거리, 트리 경로 위의 최댓값·합 같은 **경로 질의**가 모두 LCA를 거친다. `dist(u, v) = depth[u] + depth[v] - 2 × depth[LCA(u, v)]`다. 파일 시스템의 공통 상위 폴더, Git의 merge base(공통 조상 커밋), DOM의 공통 조상 노드도 같은 문제다.

## 1. 깊이를 맞춰 함께 올라가기: O(N)

1. DFS·BFS로 각 노드의 `parent`와 `depth`를 구한다.
2. 더 깊은 노드를 부모 쪽으로 올려 **두 노드의 깊이를 맞춘다.**
3. 두 노드가 같아질 때까지 **함께 한 칸씩** 올린다. 만나는 곳이 LCA다.

질의 하나에 최악 O(N)(한쪽으로 긴 트리)이라 질의가 적을 때만 쓴다.

## 2. 이진 올리기 (Binary Lifting): 질의당 O(log N)

한 칸씩 대신 **2^k칸씩** 점프한다. `up[k][v]` = v의 2^k번째 조상을 미리 표로 만든다. 2^k번째 조상은 「2^(k-1)번째 조상의 2^(k-1)번째 조상」이라 DP로 채운다.

```python
from collections import deque

def build(n, adj, root=1):
    LOG = max(1, n.bit_length())
    depth = [0] * (n + 1)
    up = [[0] * (n + 1) for _ in range(LOG)]
    seen = [False] * (n + 1)
    q = deque([root]); seen[root] = True; up[0][root] = root
    while q:                                   # BFS로 부모와 깊이
        u = q.popleft()
        for v in adj[u]:
            if not seen[v]:
                seen[v] = True
                depth[v] = depth[u] + 1
                up[0][v] = u
                q.append(v)
    for k in range(1, LOG):                    # up[k][v] = up[k-1][up[k-1][v]]
        for v in range(1, n + 1):
            up[k][v] = up[k - 1][up[k - 1][v]]
    return depth, up, LOG

def lca(u, v, depth, up, LOG):
    if depth[u] < depth[v]:
        u, v = v, u
    diff = depth[u] - depth[v]
    for k in range(LOG):                       # 깊이 차를 이진수로 쪼개 점프
        if diff >> k & 1:
            u = up[k][u]
    if u == v:
        return u
    for k in range(LOG - 1, -1, -1):           # 큰 점프부터, 조상이 달라질 때만 올라간다
        if up[k][u] != up[k][v]:
            u, v = up[k][u], up[k][v]
    return up[0][u]                            # 바로 위가 LCA
```

- 깊이를 맞출 때는 깊이 차를 **이진수로 분해**해 해당 비트만큼 점프한다.
- 그다음 큰 점프부터 시도하되 **두 조상이 서로 다를 때만** 올라간다. 끝나면 두 노드는 LCA 바로 아래에 있다.
- 전처리 O(N log N), 질의 O(log N), 메모리 O(N log N)다. 간선 가중치의 최댓값 같은 경로 정보도 같은 표에 함께 저장하면 경로 질의를 O(log N)에 답한다.

## 다른 방법

| 방법 | 전처리 | 질의 | 특징 |
| --- | --- | --- | --- |
| 한 칸씩 올리기 | O(N) | O(N) | 가장 단순 |
| 이진 올리기 | O(N log N) | O(log N) | 코딩 테스트의 표준. 경로 질의로 확장이 쉽다 |
| 오일러 투어 + 희소 테이블 RMQ | O(N log N) | O(1) | DFS 방문 순서에서 두 노드 사이 깊이 최솟값이 LCA |
| 타잔의 오프라인 LCA | O(N + Q) | 전체 한 번에 | 질의를 미리 모두 알 때. [[disjoint-set\|Union-Find]]를 쓴다 |

## 정리

- LCA = 두 노드를 모두 자손으로 갖는 가장 깊은 조상
- 기본은 깊이를 맞추고 함께 올라가기, 질의가 많으면 2^k 조상 표로 이진 올리기
- 두 노드 거리는 `depth[u] + depth[v] - 2·depth[lca]`

관련 노트: [[tree|트리와 이진 탐색 트리]], [[graph-basics|그래프의 기본과 표현 방법]], [[dynamic-programming|동적 계획법]], [[bfs|BFS]], [[disjoint-set|서로소 집합 (Union-Find)]]
