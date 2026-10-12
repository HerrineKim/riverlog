---
title: "너비 우선 탐색 (BFS)"
concept: "BFS"
summary: "시작점에서 가까운 노드부터 큐를 이용해 차례로 방문하는 그래프 탐색으로, 가중치 없는 그래프의 최단 거리를 구한다."
tags: ["algorithm", "search", "graph", "bfs", "queue"]
source: til
---

BFS(Breadth-First Search, 너비 우선 탐색)는 그래프에서 **시작 노드와 가까운 노드부터** 차례로 탐색하는 알고리즘이다. 물결이 퍼지듯 거리 1인 노드를 모두 본 뒤 거리 2, 거리 3으로 넓혀 가므로, **모든 간선의 비용이 같은 그래프에서 최단 거리**를 구할 때 가장 먼저 떠올려야 할 방법이다. 미로 탈출 최단 경로, 감염·전파 범위 계산 등에 쓰인다.

## 동작 과정

가까운 노드부터 처리하려면 먼저 넣은 것을 먼저 꺼내는 **큐(Queue)**가 필요하다.

1. 시작 노드를 큐에 넣고 **방문 처리**한다.
2. 큐에서 노드를 하나 꺼내, 아직 방문하지 않은 인접 노드를 모두 큐에 넣고 방문 처리한다.
3. 큐가 빌 때까지 2를 반복한다.

**방문 처리**는 같은 노드를 큐에 두 번 넣지 않도록 표시하는 것이다. 꺼낼 때가 아니라 **넣을 때** 표시해야 중복 삽입이 생기지 않는다.

![예제 그래프](/images/til/Algorithm/%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%9C%EB%85%90/06-%EB%84%88%EB%B9%84-%EC%9A%B0%EC%84%A0-%ED%83%90%EC%83%89-BFS-Breadth-First-Search-.assets/img.png)

위 그래프에서 노드 1부터 시작하고, 인접 노드가 여러 개면 번호가 작은 것부터 처리한다고 하자.

| 단계 | 큐에서 꺼낸 노드 | 새로 넣은 노드 | 큐 상태 |
| --- | --- | --- | --- |
| 시작 | - | 1 | [1] |
| 1 | 1 | 2, 3 | [2, 3] |
| 2 | 2 | 8 | [3, 8] |
| 3 | 3 | 4, 5 | [8, 4, 5] |
| 4 | 8 | 6, 7 | [4, 5, 6, 7] |
| 5~ | 4, 5, 6, 7 | 없음 | [] |

탐색 순서는 **1 → 2 → 3 → 8 → 4 → 5 → 6 → 7**이다.

## 기본 구현

```python
from collections import deque

def bfs(graph, start, visited):
    queue = deque([start])
    visited[start] = True
    while queue:
        v = queue.popleft()
        print(v, end=' ')
        for nxt in graph[v]:
            if not visited[nxt]:
                visited[nxt] = True
                queue.append(nxt)

# 인덱스 = 노드 번호 (0번은 비워 둔다)
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
visited = [False] * 9
bfs(graph, 1, visited)  # 1 2 3 8 4 5 6 7
```

> 큐는 반드시 `collections.deque`를 쓴다. `list.pop(0)`은 꺼낼 때마다 나머지 원소를 앞으로 당기느라 O(n)이 걸려, 노드가 많으면 전체가 O(V²)로 느려진다.

노드 V개, 간선 E개일 때 인접 리스트 기준 시간 복잡도는 **O(V + E)**다. 메모리는 큐에 한 "층(level)"의 노드가 한꺼번에 들어가므로 그래프의 **너비**에 비례한다.

## BFS로 최단 거리 구하기

방문 여부 대신 **거리**를 기록하면 바로 최단 거리 표가 된다. 다음 칸의 거리 = 현재 칸의 거리 + 1이다.

## 격자(미로) BFS 패턴

코딩 테스트에서 가장 흔한 형태는 N×M 격자에서 상하좌우로 이동하는 문제다. 좌표를 노드로, 인접한 칸을 간선으로 본다.

### 패턴 1: 출발지에서 도착지까지의 최단 칸 수

> 예: 미로(0 통로, 1 벽)에서 출발 칸(2)부터 도착 칸(3)까지 지나야 하는 최소 칸 수를 구하고, 경로가 없으면 0 (SWEA 5105 미로의 거리)

```python
from collections import deque

def maze_distance(board, n):
    # 출발/도착 위치 찾기
    for i in range(n):
        for j in range(n):
            if board[i][j] == '2':
                si, sj = i, j
            elif board[i][j] == '3':
                ei, ej = i, j

    dist = [[-1] * n for _ in range(n)]   # -1 = 미방문
    dist[si][sj] = 0
    queue = deque([(si, sj)])
    while queue:
        ci, cj = queue.popleft()
        if (ci, cj) == (ei, ej):
            return dist[ci][cj] - 1        # 출발·도착 칸을 제외한 '지나는 칸' 수
        for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ni, nj = ci + di, cj + dj
            if 0 <= ni < n and 0 <= nj < n and dist[ni][nj] == -1 and board[ni][nj] != '1':
                dist[ni][nj] = dist[ci][cj] + 1
                queue.append((ni, nj))
    return 0
```

원래 풀이에는 방문 조건을 `visited[ni][nj]`(이미 방문한 칸만 통과)로 잘못 써서 탐색이 진행되지 않는 버그가 있었다. **방문하지 않은 칸**(`not visited`, 여기서는 `dist == -1`)이어야 한다.

### 패턴 2: 레벨 단위로 퍼지기 — 가장 마지막에 도달하는 노드

> 예: 방향 그래프 형태의 비상연락망에서 시작 당번으로부터 연락이 동시에 퍼질 때, 가장 늦게 연락받는 사람들 중 번호가 가장 큰 사람 찾기 (SWEA 1238 Contact)

BFS의 거리 = 연락을 받는 "시각"이다. 거리가 가장 크고, 같으면 번호가 큰 노드를 고른다.

```python
from collections import deque

def last_contact(edges, start):
    graph = [set() for _ in range(101)]        # 중복 간선은 set으로 제거
    for a, b in zip(edges[::2], edges[1::2]):
        graph[a].add(b)

    dist = [0] * 101
    dist[start] = 1
    queue = deque([start])
    best = start
    while queue:
        cur = queue.popleft()
        if (dist[cur], cur) > (dist[best], best):
            best = cur
        for nxt in graph[cur]:
            if not dist[nxt]:
                dist[nxt] = dist[cur] + 1
                queue.append(nxt)
    return best
```

### 패턴 3: 정해진 시간(단계) 안에 도달 가능한 칸 세기

> 예: 터널 지도에서 칸마다 연결된 방향이 정해져 있을 때, 맨홀 위치에서 L시간 안에 갈 수 있는 칸의 수 (SWEA 1953 탈주범 검거)

이동하려면 **현재 칸이 그 방향으로 열려 있고, 다음 칸도 반대 방향으로 열려 있어야** 한다. 거리가 L - 1 이하인 칸이 답이다.

```python
from collections import deque

UP, DOWN, LEFT, RIGHT = (-1, 0), (1, 0), (0, -1), (0, 1)
PIPES = {
    1: (UP, DOWN, LEFT, RIGHT),
    2: (UP, DOWN),
    3: (LEFT, RIGHT),
    4: (UP, RIGHT),
    5: (DOWN, RIGHT),
    6: (DOWN, LEFT),
    7: (UP, LEFT),
}

def reachable(tunnel, n, m, r, c, hours):
    dist = [[-1] * m for _ in range(n)]
    dist[r][c] = 1                      # 맨홀에 들어간 시점 = 1시간
    queue = deque([(r, c)])
    count = 1
    while queue:
        cr, cc = queue.popleft()
        if dist[cr][cc] == hours:       # 더 퍼질 시간이 없다
            continue
        for dr, dc in PIPES[tunnel[cr][cc]]:
            nr, nc = cr + dr, cc + dc
            if not (0 <= nr < n and 0 <= nc < m) or dist[nr][nc] != -1:
                continue
            nxt = tunnel[nr][nc]
            if nxt and (-dr, -dc) in PIPES[nxt]:   # 반대쪽도 뚫려 있어야 연결
                dist[nr][nc] = dist[cr][cc] + 1
                count += 1
                queue.append((nr, nc))
    return count
```

### 패턴 4: 연결 요소마다 BFS 돌리기

> 예: N×N 방마다 서로 다른 수가 적혀 있고, 정확히 1 큰 수가 적힌 인접 방으로만 이동할 수 있을 때, 가장 많은 방을 지나는 출발 방 번호와 그 개수 구하기 (SWEA 1861 정사각형 방)

모든 칸을 돌면서 아직 방문하지 않은 칸에서 BFS를 시작해 하나의 **연결 요소**(값 차이가 1인 인접 칸들의 묶음)를 통째로 구한다. 묶음의 최솟값이 출발 방, 크기가 이동 가능한 방 수다.

```python
from collections import deque

def best_room(arr, n):
    visited = [[False] * n for _ in range(n)]
    best_start, best_cnt = n * n + 1, 0
    for i in range(n):
        for j in range(n):
            if visited[i][j]:
                continue
            visited[i][j] = True
            queue = deque([(i, j)])
            values = [arr[i][j]]
            while queue:
                ci, cj = queue.popleft()
                for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    ni, nj = ci + di, cj + dj
                    if (0 <= ni < n and 0 <= nj < n and not visited[ni][nj]
                            and abs(arr[ci][cj] - arr[ni][nj]) == 1):
                        visited[ni][nj] = True
                        values.append(arr[ni][nj])
                        queue.append((ni, nj))
            start, cnt = min(values), len(values)
            if cnt > best_cnt or (cnt == best_cnt and start < best_start):
                best_start, best_cnt = start, cnt
    return best_start, best_cnt
```

## BFS와 DFS, 언제 무엇을 쓸까

| 상황 | 선택 |
| --- | --- |
| 가중치 없는 그래프의 최단 거리·최소 횟수 | **BFS** (처음 도달한 순간이 최단) |
| 레벨(시간) 단위로 퍼지는 시뮬레이션 | **BFS** |
| 모든 경로·조합을 다 봐야 하는 문제, 백트래킹 | DFS |
| 연결 요소 개수 세기 | 둘 다 가능 |

BFS는 한 레벨의 노드를 모두 큐에 담으므로 그래프가 넓을수록 메모리를 많이 쓰고, DFS는 현재 경로만 스택에 담으므로 깊이에 비례한다. 트리에서 BFS는 **레벨 순회(level order)**와 같다.

## 핵심 정리

- BFS = 큐 + 넣을 때 방문 처리, 시간 복잡도 O(V + E)
- 가중치가 모두 같으면 BFS가 곧 최단 거리 알고리즘이다. (가중치가 다르면 다익스트라)
- 격자 문제는 방향 배열 `(di, dj)`, 범위 검사, 방문(거리) 배열을 세트로 기억해 둔다.

관련 노트: [[queue-deque|큐와 덱]], [[dfs|DFS]], [[dijkstra|다익스트라]], [[graph-basics|그래프의 기본]]
