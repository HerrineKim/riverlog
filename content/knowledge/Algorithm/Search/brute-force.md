---
title: "완전 탐색과 백트래킹"
concept: "Brute Force"
summary: "가능한 모든 경우를 나열해 답을 찾는 방법과, 가망 없는 경로를 일찍 잘라내는 백트래킹."
tags: ["algorithm", "search", "brute-force", "backtracking", "python"]
source: til
---

완전 탐색(Brute Force)은 **가능한 경우의 수를 모두 조사해서** 정답을 찾는 방법이다. 컴퓨터의 빠른 계산 능력을 믿고 일일이 확인하는 방식이라 구현이 단순하고 항상 정답을 찾지만, 경우의 수가 많으면 시간이 폭발한다.

## 접근 순서

1. 문제의 **경우의 수가 대략 몇 개인지** 먼저 계산한다.
2. 그 수가 시간 제한 안에 다 볼 수 있는 크기인지 확인한다. (파이썬 기준 1초에 대략 10⁷~10⁸번 연산)
3. 가능하면 모든 경우를 만들어 조건을 검사한다.

예를 들어 네 자리 숫자 자물쇠는 10,000가지뿐이라 컴퓨터에게는 순식간이다. 반면 N개를 나열하는 순열은 N!이라 N이 10을 넘으면 금방 감당할 수 없다.

## 완전 탐색의 여러 방법

### 1) 단순 반복문

반복문과 조건문으로 모든 경우를 직접 돌린다. 경우를 만드는 축(변수)이 고정된 소수일 때 가장 간단하다.

```python
# 세 자리 수 중 각 자리 합이 10인 수
answer = [n for n in range(100, 1000) if sum(map(int, str(n))) == 10]
```

### 2) 순열과 조합

`itertools`를 쓰면 순서가 있는 나열(순열)과 순서 없는 선택(조합)을 간단히 만들 수 있다.

```python
from itertools import permutations, combinations, product

arr = [1, 2, 3]
print(list(permutations(arr, 2)))   # 순열 nPr: (1,2), (1,3), (2,1), ...
print(list(combinations(arr, 2)))   # 조합 nCr: (1,2), (1,3), (2,3)
print(list(product(arr, repeat=2))) # 중복 순열: (1,1), (1,2), ...
```

순열의 개수는 N!이므로 N이 한 자릿수(대략 10 이하)일 때만 완전 탐색이 현실적이다.

### 3) 비트마스크 (Bit Mask)

각 원소가 **포함되거나 포함되지 않는** 두 가지 선택으로 경우가 구성될 때 유용하다. 원소가 n개인 집합의 부분집합은 2ⁿ개이고, 0부터 2ⁿ - 1까지의 정수 하나가 부분집합 하나에 대응한다. i번째 비트가 1이면 i번째 원소를 포함한다는 뜻이다.

```python
arr = ['a', 'b', 'c']
n = len(arr)
for mask in range(1 << n):              # 0 ~ 2^n - 1
    subset = [arr[i] for i in range(n) if mask & (1 << i)]
    print(subset)
```

### 4) 재귀로 경우 만들기

같은 부분집합 문제를 재귀로 풀 수도 있다. 원소마다 "넣는 경우"와 "넣지 않는 경우"로 갈라져 재귀 호출한다.

```python
def subsets(i, picked):
    if i == len(arr):
        print(picked)
        return
    subsets(i + 1, picked + [arr[i]])  # i번째 원소 포함
    subsets(i + 1, picked)             # 포함하지 않음

subsets(0, [])
```

### 5) 백트래킹 (Backtracking)

재귀로 후보를 하나씩 골라 가며 가지를 뻗되, **이 경로로는 답이 될 수 없다고 판단되면 더 내려가지 않고 되돌아가는** 방법이다. 이 "가지치기(pruning)" 덕분에 실제로 탐색하는 경우의 수가 크게 줄어든다. DFS를 기반으로 한다.

![백트래킹 상태 공간 트리](https://velog.velcdn.com/images%2Fyesjjin99%2Fpost%2F95e4f926-7417-49b8-9c4d-09adb359a741%2F%EC%BA%A1%EC%B2%982.PNG)

```python
# N-Queen: 같은 행·열·대각선에 퀸이 겹치지 않게 놓는 경우의 수
def solve(row, n, cols, diag1, diag2):
    if row == n:
        return 1
    count = 0
    for c in range(n):
        if c in cols or (row - c) in diag1 or (row + c) in diag2:
            continue  # 가지치기: 이미 공격받는 자리
        cols.add(c); diag1.add(row - c); diag2.add(row + c)
        count += solve(row + 1, n, cols, diag1, diag2)
        cols.remove(c); diag1.remove(row - c); diag2.remove(row + c)  # 되돌리기
    return count

print(solve(0, 8, set(), set(), set()))  # 92
```

### 6) 완전 탐색 + BFS/DFS

조금 어려운 문제는 두 단계가 결합된 경우가 많다. 예를 들어 "벽 3개를 세울 수 있는 모든 위치(완전 탐색)마다 바이러스가 퍼지는 범위를 구하라(BFS)" 같은 문제다. 바깥은 조합으로 경우를 나열하고, 안쪽은 BFS/DFS로 결과를 계산한다.

## 핵심 정리

- 완전 탐색은 경우의 수를 먼저 세어 시간 안에 가능한지 판단하는 것이 출발점
- 순열·조합은 `itertools`, 포함/불포함 선택은 비트마스크나 재귀
- 백트래킹은 DFS + 가지치기로 불필요한 탐색을 줄인다.

관련 노트: [[dfs|DFS]], [[recursion|재귀 함수]], [[bfs|BFS]]
