---
title: "JavaScript 알고리즘: 응용과 설계 패러다임"
concept: "JS Algorithm Paradigms"
summary: "암호·ML·이미지·통계·진화 알고리즘·고전 문제와 완전탐색·그리디·DP·백트래킹을 연결한다."
tags: ["algorithm", "javascript", "dynamic-programming", "backtracking", "applications"]
source: other
date: "2026-11-15"
sources: ["https://github.com/trekhleb/javascript-algorithms", "https://github.com/trekhleb/javascript-algorithms/blob/85293e3e2b88f4d2ce330d956b139cf628aa1e82/README.md"]
---

> Oleksii Trekhleb의 공개 저장소 「[JavaScript Algorithms and Data Structures](https://github.com/trekhleb/javascript-algorithms)」를 주제별로 재구성한 노트다.

## 알고리즘 설계 패러다임

개별 구현을 외우기보다 **완전탐색, 분할 정복, 그리디, 동적 계획법, 백트래킹이 어떤 입력 성질을 이용하는지** 이해한다. 같은 문제도 여러 방법으로 풀어 시간·공간 비용을 비교할 수 있다.

### Brute Force

가능한 후보를 모두 확인하는 방식이다.

대표 예제: [Linear Search](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/search/linear-search), [Rain Terraces](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/rain-terraces), [Recursive Staircase](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/recursive-staircase), [Maximum Subarray](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/maximum-subarray), [Travelling Salesman Problem](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/travelling-salesman), [Discrete Fourier Transform](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/fourier-transform).

### Greedy

각 단계에서 현재 최선의 선택을 확정한다. 그 선택의 정당성이 필요하다.

대표 예제: [Jump Game](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/jump-game), [Unbound Knapsack Problem](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/knapsack-problem), [Dijkstra Algorithm](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/dijkstra), [Prim’s Algorithm](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/prim), [Kruskal’s Algorithm](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/kruskal).

### Divide and Conquer

문제를 작은 부분으로 나누고 답을 결합한다.

대표 예제: [Binary Search](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/search/binary-search), [Tower of Hanoi](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/hanoi-tower), [Pascal's Triangle](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/pascal-triangle), [Euclidean Algorithm](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/euclidean-algorithm), [Merge Sort](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sorting/merge-sort), [Quicksort](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sorting/quick-sort), [Tree Depth-First Search](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/tree/depth-first-search), [Graph Depth-First Search](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/depth-first-search) 외 7개.

### Dynamic Programming

겹치는 부분 문제를 저장하고 재사용한다.

대표 예제: [Fibonacci Number](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/fibonacci), [Jump Game](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/jump-game), [Unique Paths](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/unique-paths), [Rain Terraces](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/rain-terraces), [Recursive Staircase](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/recursive-staircase), [Seam Carving](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/image-processing/seam-carving), [Levenshtein Distance](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/string/levenshtein-distance), [Longest Common Subsequence](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/longest-common-subsequence) 외 9개.

### Backtracking

조건에 맞지 않는 탐색 가지를 조기에 버린다.

대표 예제: [Jump Game](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/jump-game), [Unique Paths](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/unique-paths), [Power Set](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/power-set), [Hamiltonian Cycle](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph/hamiltonian-cycle), [N-Queens Problem](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/n-queens), [Knight's Tour](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/knight-tour), [Combination Sum](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/combination-sum).

### Branch & Bound

현재 최선값과 하한·상한을 이용해 후보를 가지치기한다.

대표 예제: .


## 분야별 기타 구현 전체 목록

### Cryptography

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Polynomial Hash | 기초 | 다항식 기반 문자열 해싱 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/cryptography/polynomial-hash) |
| Rail Fence Cipher | 기초 | 문자 순서를 재배열하는 고전 암호 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/cryptography/rail-fence-cipher) |
| Caesar Cipher | 기초 | 알파벳 이동에 기반한 고전 치환 암호 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/cryptography/caesar-cipher) |
| Hill Cipher | 기초 | 행렬 연산 기반 고전 암호 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/cryptography/hill-cipher) |

### Machine Learning

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| NanoNeuron | 기초 | 순전파·역전파의 아주 작은 신경망 학습 예제 | [원본](https://github.com/trekhleb/nano-neuron) |
| k-NN | 기초 | 가까운 이웃의 레이블로 분류 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/ml/knn) |
| k-Means | 기초 | 대표 중심을 갱신하는 군집화 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/ml/k-means) |

### Image Processing

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Seam Carving | 기초 | 낮은 에너지 경로를 줄여 내용 인식 이미지 크기 조정 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/image-processing/seam-carving) |

### Statistics

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Weighted Random | 기초 | 가중치에 비례하여 무작위 추출 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/statistics/weighted-random) |

### Evolutionary algorithms

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Genetic algorithm | 심화 | 선택·돌연변이·교배로 후보 해 탐색 | [원본](https://github.com/trekhleb/self-parking-car-evolution) |

### Uncategorized

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Tower of Hanoi | 기초 | 재귀 분할로 원판 이동 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/hanoi-tower) |
| Square Matrix Rotation | 기초 | 정사각 행렬의 제자리 회전 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/square-matrix-rotation) |
| Jump Game | 기초 | 도달 가능성의 그리디·DP 비교 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/jump-game) |
| Unique Paths | 기초 | 격자 경로 수를 DP로 계산 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/unique-paths) |
| Rain Terraces | 기초 | 막대 사이에 고이는 물의 양 계산 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/rain-terraces) |
| Recursive Staircase | 기초 | 계단을 오르는 경우의 수 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/recursive-staircase) |
| Best Time To Buy Sell Stocks | 기초 | 최저 매수 시점과 최대 이익 계산 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/best-time-to-buy-sell-stocks) |
| Valid Parentheses | 기초 | 스택으로 괄호의 짝 검사 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/stack/valid-parentheses) |
| N-Queens Problem | 심화 | 체스 퀸의 제약을 지키는 배치 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/n-queens) |
| Knight's Tour | 심화 | 나이트가 모든 칸을 순회하는 경로 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized/knight-tour) |


암호 예제의 Caesar·Rail Fence·Hill 등은 **교육용 고전 암호**다. 현대 보안 시스템의 기밀성 보장에는 검증된 현대 암호 표준과 라이브러리를 사용한다.

## 코드 실행과 테스트

```bash
npm install
npm run lint
npm test
npm test -- 'LinkedList'
```

저장소는 각 자료구조·알고리즘에 개별 구현과 테스트를 둔다. 단위 테스트를 먼저 실행한 다음 경계 입력·중복·빈 데이터·음수 여부를 추가로 점검한다. Node.js 버전 요구사항은 실행할 브랜치의 설정 파일을 기준으로 확인한다. 예제 학습용 공간은 `src/playground/`다.

## 복잡도를 읽는 원칙

해시 기반 구조는 평균·최악 복잡도를 구분하고, 비교 정렬은 일반적으로 Ω(n log n) 하한과 개별 알고리즘의 최악 비용을 분리한다. 문제의 실제 비용에는 메모리 접근과 입력 분포도 포함된다.

관련 노트: [[greedy|그리디]], [[dynamic-programming|동적 계획법]], [[divide-and-conquer|분할 정복]], [[brute-force|완전탐색]], [[real-world-algorithms|실전 알고리즘]]
