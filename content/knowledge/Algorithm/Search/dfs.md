---
title: "깊이 우선 탐색 (DFS)"
concept: "DFS"
summary: "한 갈래를 갈 수 있는 데까지 파고든 뒤 되돌아오는 그래프 탐색으로, 스택이나 재귀로 구현한다."
tags: ["algorithm", "search", "graph", "dfs", "recursion"]
source: til
---

DFS(Depth-First Search, 깊이 우선 탐색)는 그래프를 탐색할 때 **한 분기를 끝까지 탐색한 뒤에야 다음 분기로 넘어가는** 알고리즘이다. 미로에서 한 방향으로 계속 가다가 막히면 가장 가까운 갈림길로 돌아가 아직 안 가 본 길로 다시 들어가는 방식이다. "쭉 내려가고 → 막히면 한 칸 되돌아가고 → 다시 쭉 내려가는" 이 원리를 응용한 것이 **백트래킹**이다.

## 동작 과정

가장 최근에 들어간 곳에서 다시 출발하므로 **스택(Stack)**을 사용한다.

1. 시작 노드를 스택에 넣고 방문 처리한다.
2. 스택 최상단 노드에 방문하지 않은 인접 노드가 있으면 그중 하나를 스택에 넣고 방문 처리한다. 없으면 최상단 노드를 꺼낸다.
3. 더 이상 할 수 없을 때까지 2를 반복한다.

![예제 그래프](/images/til/Algorithm/%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%9C%EB%85%90/08-%EA%B9%8A%EC%9D%B4-%EC%9A%B0%EC%84%A0-%ED%83%90%EC%83%89-DFS-Depth-First-Search-.assets/img.png)

BFS 노트와 같은 그래프에서 노드 1부터, 번호가 작은 인접 노드부터 방문하면 다음과 같이 진행된다.

1. 1 → 인접한 2, 3 중 2로 내려간다.
2. 2 → 8 → 8의 인접 노드 6, 7 중 6 → 6에서 7로 내려간다.
3. 7, 6, 8, 2 모두 더 갈 곳이 없으므로 차례로 꺼내며 1까지 되돌아온다.
4. 1 → 아직 안 간 3 → 4 → 5.

탐색 순서는 **1 → 2 → 8 → 6 → 7 → 3 → 4 → 5**다.

## 재귀로 구현하기

함수 호출 자체가 시스템 스택에 쌓이므로, 재귀를 쓰면 스택을 직접 만들지 않아도 된다.

```python
def dfs(graph, v, visited):
    visited[v] = True
    print(v, end=' ')
    for nxt in graph[v]:
        if not visited[nxt]:
            dfs(graph, nxt, visited)

graph = [
    [],
    [2, 3],
    [1, 8],
    [1, 4, 5],
    [3, 5],
    [3, 4],
    [7, 8],
    [6, 8],
    [2, 6, 7],
]
visited = [False] * 9   # 인덱스와 노드 번호를 맞추려고 0번을 비워 둔다
dfs(graph, 1, visited)  # 1 2 8 6 7 3 4 5
```

방문 처리 덕분에 노드마다 한 번만 출력된다.

또 다른 그래프 예시로 확인해 보자.

```python
graph = [[], [2, 3, 8], [1, 7], [1, 4, 5], [3, 5], [3, 4], [7], [2, 6, 8], [1, 7]]
visited = [False] * 9
dfs(graph, 1, visited)  # 1 2 7 6 8 3 4 5
```

## 스택으로 구현하기

재귀 깊이가 깊어질 수 있는 문제(노드 수만 개 이상의 일자형 그래프 등)에서는 명시적 스택을 쓴다.

```python
def dfs_iterative(graph, start):
    visited = [False] * len(graph)
    stack = [start]
    order = []
    while stack:
        v = stack.pop()
        if visited[v]:
            continue
        visited[v] = True
        order.append(v)
        # 작은 번호부터 방문하려면 역순으로 넣는다
        for nxt in reversed(graph[v]):
            if not visited[nxt]:
                stack.append(nxt)
    return order
```

> 파이썬 재귀 깊이 기본 한도는 1000이다. 재귀 DFS를 쓸 때는 `sys.setrecursionlimit(10**6)`으로 늘리거나 반복문 버전을 쓴다.

시간 복잡도는 인접 리스트 기준 **O(V + E)**, 메모리는 현재 경로의 **깊이**에 비례한다. 트리에서 "방문 처리 후 자식으로 재귀"하는 위 형태의 DFS는 **전위 순회(preorder)** 순서와 같다.

## DFS가 잘 맞는 문제

- **모든 경우를 다 살펴야 하는 문제**: 부분집합, 순열, 조합 만들기
- **백트래킹**: 조건에 맞지 않으면 즉시 되돌아가 탐색 공간을 줄이는 문제
- **연결 요소 세기**, 영역(섬) 개수 구하기
- 방향 그래프의 사이클 판별, 위상 정렬
- 경로를 따라가며 상태(합계, 선택 목록 등)를 들고 다녀야 하는 문제

단, 가중치 없는 그래프의 **최단 거리**는 DFS로 구하면 모든 경로를 다 봐야 하므로 BFS를 쓴다.

## 예제: 부분집합 합 + 가지치기

> 예: N명(N ≤ 20)의 점원 키가 주어질 때, 몇 명을 골라 쌓은 탑의 높이가 B 이상이 되는 경우 중 B와의 차이가 가장 작은 값 구하기 (SWEA 1486 장훈이의 높은 선반)

각 점원을 "포함한다 / 포함하지 않는다"로 갈라지는 DFS다. 경우의 수는 2²⁰ ≈ 100만이지만, **이미 현재 최선보다 높아진 경로는 더 볼 필요가 없으므로** 잘라낸다.

```python
def min_over(heights, b):
    n = len(heights)
    best = float('inf')

    def dfs(i, total):
        nonlocal best
        if total - b >= best:      # 가지치기: 더 쌓아도 나아질 수 없다
            return
        if i == n:
            if total >= b:
                best = total - b
            return
        dfs(i + 1, total + heights[i])  # i번째 점원 포함
        dfs(i + 1, total)               # 포함하지 않음

    dfs(0, 0)
    return best

print(min_over([3, 1, 2, 3, 4], 10))  # 3 + 1 + 2 + 4 = 10 → 0
```

## 핵심 정리

- DFS = 스택(또는 재귀) + 방문 처리, O(V + E)
- 한 경로를 끝까지 파고드는 특성 덕분에 완전 탐색·백트래킹의 기반이 된다.
- 재귀 깊이 제한(`sys.setrecursionlimit`)을 항상 염두에 둔다.
- 최단 거리는 BFS, 모든 경우 탐색은 DFS가 기본 선택이다.

관련 노트: [[stack|스택]], [[recursion|재귀 함수]], [[bfs|BFS]], [[brute-force|완전 탐색과 백트래킹]], [[graph-basics|그래프의 기본]]
