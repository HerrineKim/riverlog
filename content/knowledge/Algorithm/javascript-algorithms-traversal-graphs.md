---
title: "JavaScript 알고리즘: 순회와 그래프"
concept: "JS Graph Algorithms"
summary: "리스트 순회·트리 탐색·그래프 15개를 연결성·경로·최단 경로·MST로 구분한다."
tags: ["algorithm", "javascript", "graph", "tree", "search"]
source: other
date: "2026-11-15"
sources: ["https://github.com/trekhleb/javascript-algorithms", "https://github.com/trekhleb/javascript-algorithms/blob/85293e3e2b88f4d2ce330d956b139cf628aa1e82/README.md"]
---

> Oleksii Trekhleb의 공개 저장소 「[JavaScript Algorithms and Data Structures](https://github.com/trekhleb/javascript-algorithms)」를 주제별로 재구성한 노트다.

## 그래프를 이해하는 문제 유형

그래프의 노드와 간선은 물리적 도로뿐 아니라 작업의 의존성·통신망·친구 관계를 표현한다. 어떤 문제인지에 따라 같은 그래프도 다른 알고리즘이 필요하다.

| 목표 | 주요 접근 |
| --- | --- |
| 모든 정점 방문 | DFS·BFS |
| 비가중치 최단 경로 | BFS |
| 비음수 가중치 최단 경로 | 다익스트라 |
| 음수 간선이 있는 최단 경로 | 벨만-포드, 음수 사이클 처리 |
| 모든 정점 쌍 최단 경로 | 플로이드-워셜 |
| 최소 비용 연결망 | 크루스칼·프림 |
| DAG 선후 관계 | 위상 정렬 |
| 연결성 취약 지점 | 단절점·단절선 |
| 모든 간선/정점 순회 | 오일러/해밀턴 문제를 별도로 판정 |

## 순회 구현과 그래프 알고리즘 목록

### Linked Lists

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Straight Traversal | 기초 | 연결 리스트의 순방향 순회 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/linked-list/traversal) |
| Reverse Traversal | 기초 | 연결 리스트의 역방향 순회 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/linked-list/reverse-traversal) |

### Trees

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Depth-First Search | 기초 | 한 경로를 깊게 방문하는 순회 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/tree/depth-first-search) |
| Breadth-First Search | 기초 | 가까운 정점부터 층별로 방문하는 순회 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/tree/breadth-first-search) |

### Graphs

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Depth-First Search | 기초 | 한 경로를 깊게 방문하는 순회 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/depth-first-search) |
| Breadth-First Search | 기초 | 가까운 정점부터 층별로 방문하는 순회 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/breadth-first-search) |
| Kruskal’s Algorithm | 기초 | 가중치순 간선 선택과 Union-Find로 MST 계산 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/kruskal) |
| Dijkstra Algorithm | 심화 | 음수 가중치가 없는 그래프의 최단 경로 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/dijkstra) |
| Bellman-Ford Algorithm | 심화 | 음수 간선을 허용하는 최단 경로와 음수 사이클 검사 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/bellman-ford) |
| Floyd-Warshall Algorithm | 심화 | 모든 정점 쌍의 최단 경로 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/floyd-warshall) |
| Detect Cycle | 심화 | 유향·무향 그래프의 순환 존재 여부 판정 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/detect-cycle) |
| Prim’s Algorithm | 심화 | 하나의 연결 트리를 확장하여 MST 계산 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/prim) |
| Topological Sorting | 심화 | 선후 관계를 만족하는 DAG 정점 배열 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/topological-sorting) |
| Articulation Points | 심화 | 제거하면 연결 성분이 증가하는 정점 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/articulation-points) |
| Bridges | 심화 | 제거하면 연결 성분이 증가하는 간선 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/bridges) |
| Eulerian Path and Eulerian Circuit | 심화 | 각 간선을 정확히 한 번 통과하는 경로 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/eulerian-path) |
| Hamiltonian Cycle | 심화 | 각 정점을 정확히 한 번 방문하고 시작점으로 돌아오는 경로 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/hamiltonian-cycle) |
| Strongly Connected Components | 심화 | 양방향 도달 가능한 정점 집합 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/strongly-connected-components) |
| Travelling Salesman Problem | 심화 | 모든 도시를 방문하는 최소 순회 경로 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/travelling-salesman) |


## 구현 시 주의

- 탐색에서 재방문 방지용 visited가 필요한지 명시한다.
- 음수 간선의 존재와 음수 사이클을 구분한다.
- 오일러 경로는 **간선**을 한 번씩, 해밀턴 경로는 **정점**을 한 번씩 방문한다.
- MST는 모든 정점을 연결하는 가중치 최소 신장 트리로, 최단 경로 트리와 다르다.

관련 노트: [[dfs|DFS]], [[bfs|BFS]], [[dijkstra|다익스트라]], [[shortest-path|최단 경로]], [[minimum-spanning-tree|최소 신장 트리]], [[topological-sort|위상 정렬]]
