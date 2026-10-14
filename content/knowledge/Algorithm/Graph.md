---
title: "그래프"
concept: "Graph"
summary: "정점과 간선으로 관계를 표현하는 그래프의 기본 개념과 최단 경로 알고리즘."
tags: ["algorithm", "graph"]
source: til
date: "2026-10-14"
---

도로망, 친구 관계, 미로처럼 "무엇과 무엇이 연결되어 있다"는 정보는 대부분 그래프로 바꿔 풀 수 있다. 이 주제에는 그래프를 표현하는 방법과 최단 경로 알고리즘을 정리했다. 그래프를 훑는 BFS·DFS는 Search 주제에, 사이클 판별에 쓰는 Union-Find는 Data-Structure 주제에 있다.

- [그래프의 기본과 표현 방법](Algorithm/Graph/graph-basics.md) — 그래프 용어, 인접 행렬과 인접 리스트, 문제 유형
- [다익스트라 최단 경로](Algorithm/Graph/dijkstra.md) — 음이 아닌 가중치 그래프의 단일 출발점 최단 경로
- [단절점과 단절선](Algorithm/Graph/articulation-point.md) — 지우면 그래프가 끊어지는 정점·간선을 DFS 한 번으로 찾기
- [오일러 경로와 오일러 회로](Algorithm/Graph/euler-circuit.md) — 모든 간선을 한 번씩 지나는 경로의 존재 조건과 히어홀저 알고리즘
