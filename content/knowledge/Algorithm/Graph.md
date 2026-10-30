---
title: "그래프"
concept: "Graph"
summary: "정점과 간선으로 관계를 표현하는 그래프의 기본 개념과 최단 경로 알고리즘."
tags: ["algorithm", "graph"]
source: til
date: "2026-10-14"
---

도로망, 친구 관계, 미로처럼 "무엇과 무엇이 연결되어 있다"는 정보는 대부분 그래프로 바꿔 풀 수 있다. 이 주제에는 그래프를 표현하는 방법과 최단 경로 알고리즘을 정리했다. 그래프를 훑는 BFS·DFS는 Search 주제에, 사이클 판별에 쓰는 Union-Find는 Data-Structure 주제에 있다.

- [그래프의 기본과 표현 방법](Algorithm/Graph/graph-basics.md): 그래프 용어, 인접 행렬과 인접 리스트, 문제 유형
- [위상 정렬](Algorithm/Graph/topological-sort.md): DAG의 정점을 의존 순서대로 나열하기, 칸 알고리즘과 DFS 후위 순서, 사이클 판별
- [다익스트라 최단 경로](Algorithm/Graph/dijkstra.md): 음이 아닌 가중치 그래프의 단일 출발점 최단 경로
- [최단 경로 알고리즘 고르기](Algorithm/Graph/shortest-path.md): 가중치·음수 간선·전체 쌍·목적지 여부로 BFS·다익스트라·벨만-포드·플로이드-워셜·A*를 고르는 기준
- [최소 신장 트리: 크루스칼과 프림](Algorithm/Graph/minimum-spanning-tree.md): 모든 정점을 가장 싸게 잇는 MST, 간선을 고르는 크루스칼과 정점을 넓히는 프림
- [최소 공통 조상 (LCA)](Algorithm/Graph/lowest-common-ancestor.md): 트리 두 노드의 가장 가까운 공통 조상, 이진 올리기로 질의당 O(log N)
- [단절점과 단절선](Algorithm/Graph/articulation-point.md): 지우면 그래프가 끊어지는 정점·간선을 DFS 한 번으로 찾기
- [오일러 경로와 오일러 회로](Algorithm/Graph/euler-circuit.md): 모든 간선을 한 번씩 지나는 경로의 존재 조건과 히어홀저 알고리즘
