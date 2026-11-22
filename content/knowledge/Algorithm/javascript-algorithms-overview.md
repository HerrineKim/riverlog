---
title: "JavaScript Algorithms 학습 지도"
concept: "JavaScript Algorithms"
summary: "JavaScript로 구현한 자료구조 19개와 알고리즘 93개를 모은 공개 저장소를, 주제별로 창고의 개념 노트와 저장소의 구현 디렉터리에 이어 주는 학습 지도. 개념 노트가 따로 없는 항목은 한 줄 정의를 함께 둔다."
tags: ["algorithm", "data-structure", "javascript", "learning", "sorting", "dynamic-programming"]
source: other
date: "2026-11-15"
sources: ["https://github.com/trekhleb/javascript-algorithms", "https://github.com/trekhleb/javascript-algorithms/blob/85293e3e2b88f4d2ce330d956b139cf628aa1e82/README.md"]
---

> Oleksii Trekhleb의 공개 저장소 「[JavaScript Algorithms and Data Structures](https://github.com/trekhleb/javascript-algorithms)」를 주제별로 재구성한 노트다.

## 무엇을 모은 저장소인가

**알고리즘은 답을 계산하는 절차이고, 자료구조는 그 절차가 다루는 데이터를 담는 방식**이다. 이 저장소는 JavaScript로 구현한 자료구조 **19개**와 주제별 알고리즘 **93개**를 항목마다 설명(README)·코드·테스트 한 묶음으로 둔다. 학습용 예제이므로 실제 서비스에 쓰려면 요구사항에 맞는지 따로 검증한다.

| 읽는 법 | 내용 |
| --- | --- |
| 위치 | 자료구조는 [`src/data-structures/<항목>`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures), 알고리즘은 [`src/algorithms/<분류>/<항목>`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms)이다. 아래 표의 「구현」 칸은 분류 디렉터리로 이어지고, 항목은 그 아래 같은 이름의 하위 디렉터리다 |
| 난이도 | 원본 표기 `B`는 Beginner(기초), `A`는 Advanced(심화)다. 아래 표에서는 심화 항목에 (A)를 붙였다 |
| 기준 시점 | 링크와 항목 수는 커밋 `85293e3` 시점의 [README](https://github.com/trekhleb/javascript-algorithms/blob/85293e3e2b88f4d2ce330d956b139cf628aa1e82/README.md) 기준이다 |

정의와 원리는 창고의 개념 노트가 맡고, 이 노트는 「어느 개념 노트를 읽고 어느 구현을 열어 볼지」만 잇는다.

## 공부 순서

1. [[big-o|빅오 복잡도]]와 스택·큐·해시 테이블을 먼저 이해한다.
2. 탐색·정렬·재귀를 직접 구현하고 테스트한다.
3. 트리·그래프·DP와 더 복잡한 자료구조로 넓힌다.
4. 같은 문제를 두 가지 방식으로 풀어 수행 시간·메모리·반례를 비교한다.

문제 하나를 다룰 때는 요구사항 파악, 자료구조 선택, 알고리즘 설계, 복잡도 평가, 구현과 테스트, 경계 조건·반례 확인 순서로 간다.

## 자료구조 19개

구현은 모두 [`src/data-structures`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures) 아래에 있다. 트리 계열 다섯은 `tree/` 안에 있다.

| 주제 | 창고 노트 | 저장소 항목 |
| --- | --- | --- |
| 선형 구조 | [[data-structures\|기초 자료구조]], [[stack\|스택]], [[queue-deque\|큐와 덱]] | Linked List, Doubly Linked List, Queue, Stack, Deque |
| 해시 | [[hash-table\|해시 테이블]] | Hash Table |
| 힙 | [[heap-priority-queue\|힙과 우선순위 큐]] | Heap(최대·최소), Priority Queue |
| 트리 | [[tree\|트리와 이진 탐색 트리]] (BST, AVL, 레드-블랙), [[data-structures\|기초 자료구조]] (트라이) | Trie (A), Tree (A), Binary Search Tree (A), AVL Tree (A), Red-Black Tree (A) |
| 구간 질의 | [[segment-tree\|세그먼트 트리]] (펜윅 트리 비교 포함), [[prefix-sum\|구간 합과 접두사 합]] | Segment Tree (A), Fenwick Tree (A) |
| 그래프·집합 | [[graph-basics\|그래프의 기본과 표현 방법]], [[disjoint-set\|서로소 집합]] | Graph (A, 방향·무방향), Disjoint Set (A) |
| 확률적 구조·캐시 | [[real-world-algorithms\|현실 시스템의 알고리즘]] (블룸 필터), [[hash-table\|해시 테이블]] (해시 맵 + 이중 연결 리스트로 만드는 LRU 캐시) | Bloom Filter (A), LRU Cache (A) |

## 알고리즘 93개

### 수학과 집합 (32개)

구현: [`math`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math) 21개, [`sets`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets) 11개. 수학 알고리즘은 수의 성질과 계산식으로 연산량을 줄이고, 집합·조합 알고리즘은 경우의 수가 커질 때 탐색 범위를 줄이는 것이 핵심이다.

| 주제 | 창고 노트 | 저장소 항목 |
| --- | --- | --- |
| 비트·수 표현 | [[bit-manipulation\|비트 연산 기법]], [[floating-point-arithmetic\|부동소수점]] | Bit Manipulation, Is Power of Two, Binary Floating Point |
| 정수론 | [[number-theory-basics\|정수론 기초]] | Prime Factors, Primality Test(시행 나눗셈), Euclidean Algorithm, Least Common Multiple, Sieve of Eratosthenes |
| 점화식·거듭제곱 | [[linear-recurrence\|선형 점화식의 일반항]], [[divide-and-conquer\|분할 정복]] (빠른 거듭제곱), [[recursion\|재귀 함수]] | Factorial, Fibonacci Number(반복·닫힌 형식), Fast Powering |
| 순열·조합 | [[permutation-combination\|순열과 조합]], [[brute-force\|완전 탐색과 백트래킹]] | Pascal's Triangle, Cartesian Product, Power Set (A), Permutations (A), Combinations (A), Combination Sum (A) |
| 선형대수·기하 | [[vector-geometry\|벡터 내적·외적과 거리]], [[fourier-transform\|푸리에 변환]], [[data-structures\|기초 자료구조]] (행렬 다루기) | Matrices, Euclidean Distance, Complex Number, Radian & Degree, Discrete Fourier Transform (A) |
| 부분 수열·최적화 DP | [[dynamic-programming\|동적 계획법]], [[longest-increasing-subsequence\|LIS]], [[greedy\|그리디]] (배낭의 탐욕 풀이가 실패하는 예) | Longest Common Subsequence (A), Longest Increasing Subsequence (A), Shortest Common Supersequence (A), Knapsack Problem (A, 0/1과 Unbound), Maximum Subarray (A), Integer Partition (A) |
| 수치 계산·섞기 | 아래 「개념 노트가 따로 없는 항목」 | Horner's method, Square Root (A), Liu Hui π Algorithm (A), Fisher-Yates Shuffle |

### 문자열·탐색·정렬 (22개)

구현: [`string`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/string) 8개, [`search`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/search) 4개, [`sorting`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sorting) 10개. 문자열은 접두사·해시·편집 거리 같은 구조를 쓰고, 탐색은 정렬 여부·분포·단조성으로 볼 원소 수를 줄이며, 정렬은 비교 기반인지 키의 범위를 쓰는지에 따라 비용이 갈린다.

| 주제 | 창고 노트 | 저장소 항목 |
| --- | --- | --- |
| 패턴 검색 | [[kmp-algorithm\|KMP 문자열 검색]] (라빈-카프, 보이어-무어 비교 포함) | Knuth-Morris-Pratt (A), Rabin Karp (A), Z Algorithm (A), Regular Expression Matching (A) |
| 문자열 거리·비교 | [[text-similarity\|텍스트 유사도]] (편집 거리), [[dynamic-programming\|동적 계획법]], [[two-pointers\|투 포인터]] (팰린드롬) | Hamming Distance, Palindrome, Levenshtein Distance (A), Longest Common Substring (A) |
| 탐색 | [[binary-search\|이분 탐색]] (순차 탐색 비교 포함) | Linear Search, Binary Search, Jump Search, Interpolation Search |
| O(n²)·비비교 정렬 | [[elementary-sorts\|기본 정렬]] | Bubble Sort, Selection Sort, Insertion Sort, Shellsort, Counting Sort, Radix Sort, Bucket Sort |
| O(n log n) 정렬 | [[merge-quick-sort\|병합 정렬과 퀵 정렬]] (정렬 알고리즘 비교표), [[heap-priority-queue\|힙과 우선순위 큐]] (힙 정렬) | Merge Sort, Quicksort(제자리·비제자리), Heap Sort |

정렬별 시간·공간·안정성 비교는 [[merge-quick-sort|병합 정렬과 퀵 정렬]]의 비교표 한 곳에 있다. 저장소 README의 복잡도 표도 같은 내용이다. 빅오는 증가율의 분류이지 실제 수행 시간이 아니므로 안정성·입력 분포·메모리를 함께 본다.

### 순회와 그래프 (19개)

구현: [`linked-list`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/linked-list) 2개, [`tree`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/tree) 2개, [`graph`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/graph) 15개.

| 주제 | 창고 노트 | 저장소 항목 |
| --- | --- | --- |
| 순회 | [[dfs\|DFS]], [[bfs\|BFS]], [[tree\|트리 순회]], [[data-structures\|연결 리스트]] | 연결 리스트 Straight·Reverse Traversal, 트리 DFS·BFS, 그래프 DFS·BFS |
| 최단 경로 | [[shortest-path\|최단 경로 알고리즘 고르기]] (벨만-포드, 플로이드-워셜, 음수 사이클), [[dijkstra\|다익스트라]] | Dijkstra (A), Bellman-Ford (A), Floyd-Warshall (A) |
| 최소 신장 트리 | [[minimum-spanning-tree\|크루스칼과 프림]] | Kruskal, Prim (A) |
| 순서·사이클 | [[topological-sort\|위상 정렬]] (사이클 판별 포함), [[disjoint-set\|서로소 집합]] | Topological Sorting (A, DFS 방식), Detect Cycle (A, DFS 방식과 서로소 집합 방식) |
| 연결성 | [[articulation-point\|단절점과 단절선]] | Articulation Points (A, 타잔), Bridges (A), Strongly Connected Components (A, 코사라주) |
| 간선·정점 순회 | [[euler-circuit\|오일러 경로와 회로]], [[np-completeness\|NP-완전]] (해밀턴 회로, 외판원 문제) | Eulerian Path and Circuit (A, 플뢰리 알고리즘), Hamiltonian Cycle (A), Travelling Salesman Problem (A) |

같은 그래프라도 목표(모든 정점 방문, 가중치 유무에 따른 최단 경로, 최소 비용 연결, 선후 관계)에 따라 알고리즘이 달라진다. 고르는 기준은 [[shortest-path|최단 경로 알고리즘 고르기]]와 [[graph-basics|그래프의 기본]]에 있다.

### 응용 분야와 고전 문제 (20개)

| 분야 | 창고 노트 | 저장소 항목 |
| --- | --- | --- |
| 암호 ([`cryptography`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/cryptography), 4개) | [[kmp-algorithm\|라빈-카프의 롤링 해시]] (다항 해시), [[encoding-encryption-hashing\|인코딩·암호화·해싱]] (현대 암호) | Polynomial Hash, Rail Fence Cipher, Caesar Cipher, Hill Cipher |
| 머신러닝 ([`ml`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/ml), 3개) | [[machine-learning-basics\|머신러닝 기초]] | k-NN, k-Means, [NanoNeuron](https://github.com/trekhleb/nano-neuron)(별도 저장소, 순전파·역전파를 함수 7개로 보여 주는 예제) |
| 이미지·통계·진화 (각 1개) | 아래 「개념 노트가 따로 없는 항목」 | [Seam Carving](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/image-processing/seam-carving), [Weighted Random](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/statistics/weighted-random), [Genetic algorithm](https://github.com/trekhleb/self-parking-car-evolution) (A, 별도 저장소의 자율 주차 학습 예제) |
| 고전 문제 ([`uncategorized`](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/uncategorized), 10개) | [[recursion\|재귀 함수]], [[dynamic-programming\|동적 계획법]], [[brute-force\|백트래킹]], [[stack\|스택]] | Tower of Hanoi, Square Matrix Rotation, Jump Game, Unique Paths, Rain Terraces, Recursive Staircase, Best Time To Buy Sell Stocks, [Valid Parentheses](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/stack/valid-parentheses)(`stack/` 아래), N-Queens Problem (A), Knight's Tour (A) |

카이사르·레일 펜스·힐 암호는 **교육용 고전 암호**다. 실제 기밀성이 필요하면 검증된 현대 암호 표준과 라이브러리를 쓴다.

## 설계 패러다임으로 다시 묶기

저장소는 같은 구현을 설계 패러다임으로도 한 번 더 분류한다. 한 문제를 여러 패러다임으로 푼 항목(Jump Game, Maximum Subarray, Rain Terraces)이 비교 학습에 좋다.

| 패러다임 | 창고 노트 | 저장소가 이 패러다임으로 분류한 구현 |
| --- | --- | --- |
| 완전 탐색 | [[brute-force\|완전 탐색과 백트래킹]] | Linear Search, Rain Terraces, Recursive Staircase, Maximum Subarray, Travelling Salesman Problem, Discrete Fourier Transform |
| 그리디 | [[greedy\|그리디]] | Jump Game, Unbound Knapsack(최적을 보장하지 않는 휴리스틱), Dijkstra, Prim, Kruskal |
| 분할 정복 | [[divide-and-conquer\|분할 정복]] | Binary Search, Tower of Hanoi, Pascal's Triangle, Euclidean Algorithm, Merge Sort, Quicksort, 트리·그래프 DFS, Matrices, Jump Game, Fast Powering, Best Time To Buy Sell Stocks, Permutations, Combinations, Maximum Subarray (15개) |
| 동적 계획법 | [[dynamic-programming\|동적 계획법]] | Fibonacci Number, Jump Game, Unique Paths, Rain Terraces, Recursive Staircase, Seam Carving, Levenshtein Distance, Longest Common Subsequence, Longest Common Substring, Longest Increasing Subsequence, Shortest Common Supersequence, 0/1 Knapsack, Integer Partition, Maximum Subarray, Bellman-Ford, Floyd-Warshall, Regular Expression Matching (17개) |
| 백트래킹 | [[brute-force\|완전 탐색과 백트래킹]] | Jump Game, Unique Paths, Power Set, Hamiltonian Cycle, N-Queens Problem, Knight's Tour, Combination Sum |
| 분기 한정 | [[brute-force\|완전 탐색과 백트래킹]] | 연결된 예제 구현이 없다 |

## 개념 노트가 따로 없는 항목

창고에 독립된 개념 노트가 없는 항목은 한 줄 정의만 둔다. 자세한 설명은 저장소의 항목별 README에 있다.

| 항목 | 한 줄 정의 |
| --- | --- |
| Horner's method | 다항식을 `((aₙx + aₙ₋₁)x + …)x + a₀` 꼴로 중첩해 n차 다항식을 곱셈 n번, 덧셈 n번에 계산한다 |
| Square Root | 뉴턴 방법으로 `x ← (x + n/x) / 2`를 반복해 제곱근을 근사한다 |
| Liu Hui π Algorithm | 원에 내접하는 정다각형의 변 수를 두 배씩 늘려 가며 넓이로 원주율을 근사한다 |
| Integer Partition | 정수를 양의 정수의 합으로 나타내는 방법의 수를 센다(순서는 구분하지 않는다) |
| Fisher-Yates Shuffle | 뒤에서부터 각 자리와 그 앞쪽(자신 포함) 무작위 자리를 맞바꿔 모든 순열이 같은 확률로 나오게 섞는다. O(n) |
| Shortest Common Supersequence | 두 수열을 모두 부분 수열로 포함하는 가장 짧은 수열. 길이는 두 길이의 합에서 최장 공통 부분 수열(LCS) 길이를 뺀 값이다 |
| Maximum Subarray | 연속 부분 배열의 최대 합. 「여기서 끝나는 최대 합」만 들고 가는 카데인 알고리즘으로 O(n)에 구한다 |
| Cartesian Product | 여러 집합에서 원소를 하나씩 뽑아 만드는 모든 순서쌍의 집합 |
| Hamming Distance | 길이가 같은 두 문자열에서 글자가 서로 다른 위치의 수 |
| Longest Common Substring | 두 문자열에 공통으로 나타나는 가장 긴 **연속** 구간. 연속이 아니어도 되는 LCS와 구별한다 |
| Z Algorithm | 각 위치에서 시작하는 부분 문자열이 전체 접두사와 몇 글자 일치하는지(Z 배열)를 앞서 구한 값을 재사용해 선형 시간에 구하고, `패턴 + 구분자 + 텍스트`에 적용해 패턴을 찾는다 |
| Jump Search | 정렬된 배열을 √n 크기 블록으로 건너뛰다가 목표를 넘으면 그 블록만 순차 탐색한다. O(√n) |
| Interpolation Search | 정렬된 배열에서 값의 크기로 위치를 비례 추정한다. 값이 고르게 분포하면 평균 O(log log n), 치우치면 O(n)까지 느려진다 |
| Bucket Sort | 값의 구간별 버킷에 나눠 담고 버킷마다 정렬한 뒤 이어 붙인다. 값이 고르게 퍼져 있을 때 평균 O(n + k) |
| Strongly Connected Components | 방향 그래프에서 서로 오갈 수 있는 정점들의 최대 묶음. 저장소는 DFS를 두 번 도는 코사라주 알고리즘으로 구한다 |
| Caesar·Rail Fence·Hill Cipher | 차례로 알파벳을 일정 칸 미는 치환 암호, 글자를 지그재그 레일에 적어 순서를 바꾸는 전치 암호, 글자 벡터에 키 행렬을 곱하는(mod 26) 치환 암호 |
| k-NN·k-Means | k-NN은 가장 가까운 이웃 k개의 레이블 다수결로 분류하고, k-Means는 점을 가까운 중심에 배정하고 중심을 평균으로 옮기기를 되풀이해 k개 군집으로 나눈다 |
| Seam Carving | 에너지(주변과의 색 차이)가 가장 낮은 세로 경로(seam)를 DP로 찾아 지우기를 되풀이해, 중요한 내용은 남기고 이미지 폭을 줄인다 |
| Weighted Random | 가중치의 누적 합을 만들고 `[0, 총합)`의 난수가 떨어지는 구간의 항목을 고른다 |
| Genetic algorithm | 후보 해 집단에 선택·교차·돌연변이를 되풀이해 적합도가 높은 해를 찾는다 |
| Rain Terraces | 높이 배열의 각 칸에 고이는 물은 `min(왼쪽 최고, 오른쪽 최고) - 자기 높이`다. 양쪽 최고 높이를 미리 구해 두면 O(n) |
| Tower of Hanoi | 원판 n-1개를 보조 기둥으로 옮기고, 가장 큰 원판을 옮기고, n-1개를 다시 얹는 재귀. 이동 횟수는 2ⁿ - 1 |
| Jump Game | 각 칸의 값만큼 뛸 수 있을 때 끝에 닿을 수 있는지 판정한다. 백트래킹, 하향식·상향식 DP, 그리디 풀이를 나란히 둔 예제다 |
| Unique Paths·Recursive Staircase | 격자의 왼쪽 위에서 오른쪽 아래로 가는 경로 수, 한 번에 1~2칸씩 계단을 오르는 방법의 수. 둘 다 앞선 칸의 값을 더하는 DP다 |
| Best Time To Buy Sell Stocks | 가격 배열에서 사고팔아 얻는 최대 이익. 분할 정복 풀이와 한 번 훑는 풀이를 비교한다 |
| Knight's Tour | 체스 나이트가 모든 칸을 한 번씩 밟는 경로를 백트래킹으로 찾는다 |
| Square Matrix Rotation | 전치(대각선 뒤집기) 후 좌우 뒤집기처럼 뒤집기 두 번으로 정사각 행렬을 제자리에서 90도 돌린다 |

## 실행과 테스트

```bash
npm install
npm run lint
npm test
npm test -- 'LinkedList'
```

마지막 줄은 이름이 일치하는 테스트만 돌린다. 연습용 코드는 `src/playground/`에 두고 실행한다. 필요한 Node.js 버전은 받아 온 브랜치의 설정 파일로 확인한다. 저장소의 단위 테스트를 돌린 뒤에는 빈 입력, 중복 값, 음수, 경계 크기를 직접 더 넣어 본다.

## 정리

- 저장소는 자료구조 19개와 알고리즘 93개(수학·집합 32, 문자열·탐색·정렬 22, 순회·그래프 19, 응용·고전 문제 20)를 설명·코드·테스트로 묶은 학습용 구현 모음이다
- 원리는 창고의 개념 노트에서 읽고, 구현은 저장소의 해당 디렉터리에서 본다
- 같은 문제를 여러 패러다임으로 푼 항목으로 시간·공간 비용을 비교한다
- 복잡도는 평균과 최악, 증가율과 실제 수행 시간을 구분해 읽는다

관련 노트: [[big-o|빅오 표기법과 시간 복잡도]], [[data-structures|기초 자료구조]], [[real-world-algorithms|현실 시스템을 움직이는 알고리즘과 자료구조]], [[coding-test|코딩 테스트 접근법]], [[ossu-core-theory|OSSU 알고리즘 이론]]
