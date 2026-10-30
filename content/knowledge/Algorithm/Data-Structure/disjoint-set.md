---
title: "서로소 집합 (Union-Find)"
concept: "Union Find"
summary: "원소들이 어떤 집합에 속하는지 관리하며, 두 집합을 합치고 대표를 찾는 연산을 빠르게 처리하는 자료구조."
tags: ["data-structure", "union-find", "graph", "python"]
source: mixed
date: "2026-10-14"
sources: ["https://80000coding.notion.site/9aa736605fcc44eda1eaa95229491751"]
---

> 크기 기반 합치기와 병목 경로 응용은 팔만코딩경(42Seoul 커뮤니티 위키)의 「유니온 파인드와 그 응용」을 바탕으로 보강했다.

수학에서 **서로소 집합**은 공통 원소가 없는 집합들을 말한다. 서로소 집합 자료구조는 원소들을 겹치지 않는 부분 집합으로 나눠 관리하며, 두 가지 연산으로 조작한다. 그래서 **Union-Find** 자료구조라고도 부른다.

- **Union(합치기)**: 두 원소가 속한 집합을 하나로 합친다.
- **Find(찾기)**: 특정 원소가 어느 집합에 속하는지(그 집합의 대표가 누구인지) 알려 준다.

## 트리로 표현하기

- 하나의 집합을 하나의 트리로 표현한다.
- **루트 노드가 그 집합의 대표자**다.
- 각 노드는 부모 노드를 가리키며, 이를 `parent` 배열에 저장한다.

연산은 다음 세 가지로 정리된다.

| 연산 | 설명 |
| --- | --- |
| Make-Set(x) | x 하나만 들어 있는 새 집합 생성 (`parent[x] = x`) |
| Find-Set(x) | x가 속한 집합의 루트 찾기 |
| Union(x, y) | x와 y가 속한 두 집합을 합치기 |

## 최적화

아무 생각 없이 합치면 트리가 한 줄로 길어져 Find가 O(n)까지 느려진다. 두 가지 기법으로 해결한다.

- **경로 압축(Path Compression)**: Find 중에 지나간 모든 노드가 루트를 직접 가리키도록 부모를 갱신한다. 다음 Find부터는 바로 루트에 닿는다.
- **랭크 기반 합치기(Union by Rank)**: 각 루트에 트리 높이(rank)를 저장해 두고, 합칠 때 **rank가 낮은 트리를 높은 트리 밑에** 붙인다. 트리가 불필요하게 깊어지지 않는다.

두 기법을 함께 쓰면 연산 하나의 평균 시간이 사실상 상수(역 아커만 함수 α(n))가 된다.

## 구현

```python
def find_parent(parent, x):
    # 루트가 아니면 루트를 찾을 때까지 재귀 호출하며 경로 압축
    if parent[x] != x:
        parent[x] = find_parent(parent, parent[x])
    return parent[x]


def union_parent(parent, rank, a, b):
    a = find_parent(parent, a)
    b = find_parent(parent, b)
    if a == b:
        return
    # rank가 낮은 쪽을 높은 쪽 밑에 붙인다
    if rank[a] < rank[b]:
        a, b = b, a
    parent[b] = a
    if rank[a] == rank[b]:
        rank[a] += 1


v, e = map(int, input().split())          # 노드 수, union 연산 수
parent = list(range(v + 1))               # 부모를 자기 자신으로 초기화
rank = [0] * (v + 1)

for _ in range(e):
    a, b = map(int, input().split())
    union_parent(parent, rank, a, b)

print("각 원소가 속한 집합:", *[find_parent(parent, i) for i in range(1, v + 1)])
```

간단한 문제에서는 rank 없이 "번호가 작은 쪽을 루트로" 정하는 방식도 자주 쓴다. 경로 압축만으로도 대부분 충분히 빠르다.

## 활용: 무방향 그래프의 사이클 판별

1. 각 간선 (a, b)에 대해 두 노드의 루트를 확인한다.
2. 루트가 다르면 Union한다.
3. **루트가 같으면** 이미 같은 집합에 연결되어 있다는 뜻이므로 사이클이 생긴 것이다.

```python
cycle = False
for _ in range(e):
    a, b = map(int, input().split())
    if find_parent(parent, a) == find_parent(parent, b):
        cycle = True
        break
    union_parent(parent, rank, a, b)

print("사이클 발생" if cycle else "사이클 없음")
```

간선 E개를 하나씩 확인하므로 거의 O(E)에 동작한다. 이 방법은 **무방향 그래프**에만 쓸 수 있고, 방향 그래프의 사이클은 DFS로 판별한다. 이 사이클 판별은 최소 신장 트리를 구하는 **크루스칼 알고리즘**의 핵심이기도 하다.

## 배열 하나로 크기까지 관리하기

`parent`와 `rank`를 따로 두지 않고 **배열 하나에 음수로 집합 크기를 저장**하는 관용 구현도 많이 쓴다. `parent[x] < 0`이면 x가 루트이고, `-parent[x]`가 그 집합의 원소 수다. 처음에는 모두 -1로 채운다.

```python
parent = [-1] * (n + 1)

def find(x):
    if parent[x] < 0:
        return x
    parent[x] = find(parent[x])        # 경로 압축
    return parent[x]

def union(a, b):
    a, b = find(a), find(b)
    if a == b:
        return False
    if parent[a] > parent[b]:          # 음수이므로 값이 클수록 작은 집합
        a, b = b, a
    parent[a] += parent[b]             # 큰 집합 a에 작은 집합 b를 붙인다 (union by size)
    parent[b] = a
    return True
```

높이 대신 **크기를 기준으로 합치는(union by size)** 방식이다. rank는 경로 압축 뒤 실제 높이보다 커질 수 있지만(높이의 상한으로만 쓰이므로 성능에는 문제없다), 크기는 압축과 무관하게 항상 정확하다. 성능 보장은 union by rank와 같고, "이 원소가 속한 집합의 크기"를 바로 답할 수 있다는 장점이 있다.

## 활용: 크루스칼과 병목 경로

크루스칼 알고리즘은 간선을 가중치 순으로 정렬하고, 양 끝이 다른 집합인 간선만 골라 Union한다. 고른 간선이 V-1개가 되면 최소 신장 트리(MST)가 완성된다. 정렬이 지배해 O(E log E)다. 프림과의 비교는 [[minimum-spanning-tree|최소 신장 트리]]에 있다.

같은 틀을 **내림차순**으로 돌리면 "두 정점 사이 경로 중 가장 약한 간선을 최대로 하는" 병목 경로(최대 용량 경로) 문제가 풀린다. 무게 제한이 있는 다리를 건너 출발지에서 도착지까지 옮길 수 있는 최대 중량을 묻는 문제가 대표적이다.

1. 간선을 가중치 **내림차순**으로 정렬한다.
2. 하나씩 Union하다가 `find(출발) == find(도착)`이 되는 순간 멈춘다.
3. 마지막으로 합친 간선의 가중치가 답이다. 그보다 무거운 간선만으로는 두 정점이 이어지지 않았기 때문이다.

이 문제는 "중량 w로 갈 수 있는가"를 BFS로 확인하며 w를 [[binary-search|파라메트릭 서치]]로 찾는 방법으로도 풀 수 있다.

## 핵심 정리

- Union-Find = 집합 합치기 + 대표 찾기
- 경로 압축과 랭크 기반 합치기로 거의 상수 시간에 동작
- 배열 하나에 음수로 크기를 저장하면 union by size와 집합 크기 조회를 함께 얻는다.
- 무방향 그래프 사이클 판별, 연결 요소 관리, 크루스칼 MST, 병목 경로에 사용

관련 노트: [[graph-basics|그래프의 기본]], [[dfs|DFS(방향 그래프 사이클)]], [[greedy|그리디(크루스칼)]], [[minimum-spanning-tree|최소 신장 트리]], [[articulation-point|단절점과 단절선]]
