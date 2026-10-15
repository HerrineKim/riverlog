---
title: "단절점과 단절선"
concept: "Articulation Point"
summary: "지우면 그래프가 끊어지는 정점(단절점)과 간선(단절선)을 DFS 방문 순서와 low 값으로 O(V + E)에 찾는 방법."
tags: ["algorithm", "graph", "dfs", "problem-solving"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/3885966ce5ca447998f0b3d5583789a9"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「너와 나의 연결 노드, 단절점.」을 바탕으로 재구성한 노트다.

## 단절점이란

무방향 그래프에서 **그 정점과 붙은 간선을 지우면 연결 요소(connected component)의 수가 늘어나는 정점**을 단절점(articulation point, cut vertex)이라 한다. 그래프의 약한 고리다. 네트워크의 단일 장애점(SPOF), 도로망에서 막히면 지역이 고립되는 교차로가 단절점이다.

같은 개념을 간선에 적용하면 **단절선(bridge, cut edge)** 이다. 그 간선 하나만 지워도 그래프가 둘로 갈린다.

정점마다 지워 보고 연결 요소를 세면 O(V × (V + E))다. **DFS 한 번으로 O(V + E)** 에 모두 찾을 수 있다(타잔의 방법).

## 핵심 아이디어: 방문 순서와 low 값

DFS로 그래프를 훑으면 DFS 트리가 생긴다. 이 트리 밖의 간선은 모두 **자손에서 조상으로 올라가는 역방향 간선(back edge)** 이다. 무방향 그래프에는 서로 다른 가지를 잇는 교차 간선이 없다.

| 값 | 정의 |
| --- | --- |
| `order[v]` | v를 처음 방문한 순서(발견 시각). 깊이 들어갈수록 커진다 |
| `low[v]` | v의 서브트리에서 **역방향 간선 하나를 타고** 닿을 수 있는 가장 작은 `order` |

`low[child]`가 작다는 것은 자식 쪽 서브트리가 v를 거치지 않고도 v의 조상과 이어져 있다는 뜻이다. 즉 **사이클의 일부**라 v가 사라져도 끊기지 않는다.

### 판정 규칙

| 대상 | 단절 조건 |
| --- | --- |
| DFS 루트가 아닌 정점 v | 자식 c 중 하나라도 `low[c] ≥ order[v]` — c의 서브트리가 v 위로 못 올라간다 |
| DFS 루트 | DFS 트리에서 **자식이 2개 이상** — 루트를 지우면 각 자식 서브트리가 따로 남는다 |
| 간선 (v, c) | `low[c] > order[v]` — 등호가 빠진다. c가 v에게조차 돌아올 수 없어야 한다 |

```text
1 ── 2 ── 3        order: 1→1, 2→2, 3→3, 4→4
     │    │        low:   3과 4는 역방향 간선 4-2로 order 2에 닿는다
     └─ 4 ┘        → 2-3-4는 사이클, 1과 2 사이만 약하다
                   정점 2: 자식 3의 low(2) ≥ order[2](2) → 단절점
                   간선 1-2: low[2](2) > order[1](1) → 단절선
```

## 구현

```python
import sys
sys.setrecursionlimit(10 ** 6)

def find_articulation_points(n, graph):
    order = [0] * (n + 1)          # 0이면 미방문
    is_cut = [False] * (n + 1)
    counter = 1

    def dfs(v, is_root):
        nonlocal counter
        order[v] = counter
        counter += 1
        low = order[v]
        children = 0
        for nxt in graph[v]:
            if order[nxt] == 0:            # 트리 간선
                children += 1
                child_low = dfs(nxt, False)
                if not is_root and child_low >= order[v]:
                    is_cut[v] = True
                low = min(low, child_low)
            else:                          # 이미 방문 → 역방향 간선
                low = min(low, order[nxt])
        if is_root and children >= 2:
            is_cut[v] = True
        return low

    for v in range(1, n + 1):              # 연결 요소마다 DFS 루트가 생긴다
        if order[v] == 0:
            dfs(v, True)
    return [v for v in range(1, n + 1) if is_cut[v]]
```

- 단절점 판정에서는 부모로 돌아가는 간선을 역방향 간선으로 쳐도 결과가 같다. 부모의 `order`로는 `low[c] ≥ order[v]` 판정이 바뀌지 않기 때문이다.
- **단절선**을 찾을 때는 부모로 가는 간선을 제외해야 한다. 다중 간선이 있으면 정점 대신 간선 번호로 부모 간선을 구분한다.
- 정점 수가 크면 재귀 깊이가 문제다. 파이썬에서는 재귀 한도를 늘리거나 명시적 스택으로 바꾼다.

## 응용

- **이중 연결 요소(biconnected component)**: 단절점을 기준으로 그래프를 쪼갠 조각. 어떤 정점 하나가 빠져도 연결이 유지되는 부분이다.
- **2-간선 연결 요소**: 단절선을 모두 지운 뒤 남은 연결 요소. 사이클로 묶인 덩어리다.
- 방향 그래프에서는 같은 `order`·`low` 기법이 **강한 연결 요소(SCC)** 를 찾는 타잔 알고리즘이 된다.

## 정리

- 단절점 = 지우면 연결 요소가 늘어나는 정점, 단절선 = 지우면 끊어지는 간선
- DFS 발견 순서 `order`와 역방향 간선으로 닿는 최소 순서 `low`를 함께 계산한다.
- 루트가 아닌 정점은 `low[c] ≥ order[v]`, 루트는 자식 2개 이상, 간선은 `low[c] > order[v]`
- DFS 한 번이므로 O(V + E)

관련 노트: [[dfs|DFS]], [[graph-basics|그래프의 기본]], [[disjoint-set|서로소 집합]]
