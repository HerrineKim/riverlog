---
title: "JavaScript 알고리즘: 수학과 조합"
concept: "JS Math Set Algorithms"
summary: "수론·행렬·푸리에 변환부터 집합·순열·조합·최적 부분 구조까지 원본 알고리즘 32개."
tags: ["algorithm", "javascript", "math", "dynamic-programming"]
source: other
date: "2026-11-15"
sources: ["https://github.com/trekhleb/javascript-algorithms", "https://github.com/trekhleb/javascript-algorithms/blob/85293e3e2b88f4d2ce330d956b139cf628aa1e82/README.md"]
---

> Oleksii Trekhleb의 공개 저장소 「[JavaScript Algorithms and Data Structures](https://github.com/trekhleb/javascript-algorithms)」를 주제별로 재구성한 노트다.

## 수학과 집합 문제의 차이

수학 알고리즘은 수의 성질·계산식을 활용해 연산량을 줄인다. 집합과 조합 알고리즘은 **해를 표현하는 경우의 수가 커질 때 탐색 범위를 어떻게 줄일지**가 핵심이다.

| 패턴 | 적용 이유 |
| --- | --- |
| 나머지 연산·소수 판정 | 수론 문제의 계산 단축 |
| 빠른 거듭제곱 | 반복 제곱으로 지수 크기 비용을 감소 |
| 조합 생성 | 중복 허용 여부와 순서 제약 구분 |
| DP | 같은 부분 문제가 반복될 때 결과 재사용 |
| FFT/DFT | 신호·다항식 등을 주파수 영역에서 다루는 기반 |

## 항목별 요약과 구현

### Math

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Bit Manipulation | 기초 | 마스크와 비트 이동으로 상태를 조작 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/bits) |
| Binary Floating Point | 기초 | 부동소수점의 이진 표현과 근사 오차 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/binary-floating-point) |
| Factorial | 기초 | 계승과 조합의 기초 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/factorial) |
| Fibonacci Number | 기초 | 점화식·반복·근사식 비교 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/fibonacci) |
| Prime Factors | 기초 | 소인수분해 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/prime-factors) |
| Primality Test | 기초 | 수의 소수 여부 검사 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/primality-test) |
| Euclidean Algorithm | 기초 | 나머지를 반복해 최대공약수 계산 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/euclidean-algorithm) |
| Least Common Multiple | 기초 | 최소공배수 계산 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/least-common-multiple) |
| Sieve of Eratosthenes | 기초 | 범위 내 소수를 체로 걸러냄 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/sieve-of-eratosthenes) |
| Is Power of Two | 기초 | 2의 거듭제곱 판정 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/is-power-of-two) |
| Pascal's Triangle | 기초 | 이항계수의 삼각형 관계 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/pascal-triangle) |
| Complex Number | 기초 | 복소수의 표현과 연산 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/complex-number) |
| Radian & Degree | 기초 | 각도 단위 변환 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/radian) |
| Fast Powering | 기초 | 제곱을 재사용하는 빠른 거듭제곱 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/fast-powering) |
| Horner's method | 기초 | 다항식을 중첩해 계산량 축소 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/horner-method) |
| Matrices | 기초 | 행렬 표현과 기본 연산 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/matrix) |
| Euclidean Distance | 기초 | 점·벡터 사이 거리 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/euclidean-distance) |
| Integer Partition | 심화 | 정수를 양의 정수 합으로 분해하는 경우의 수 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/integer-partition) |
| Square Root | 심화 | 뉴턴 방법에 의한 제곱근 근사 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/square-root) |
| Liu Hui π Algorithm | 심화 | 내접 다각형으로 원주율 근사 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/liu-hui) |
| Discrete Fourier Transform | 심화 | 시계열을 주파수 성분으로 분해 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/math/fourier-transform) |

### Sets

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Cartesian Product | 기초 | 집합 원소의 순서쌍 생성 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/cartesian-product) |
| Fisher–Yates Shuffle | 기초 | 편향 없는 균등 무작위 섞기 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/fisher-yates) |
| Power Set | 심화 | 집합의 모든 부분집합 생성 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/power-set) |
| Permutations | 심화 | 순서 있는 배열 생성 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/permutations) |
| Combinations | 심화 | 순서 없는 원소 선택 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/combinations) |
| Longest Common Subsequence | 심화 | 연속하지 않아도 되는 최장 공통 부분수열 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/longest-common-subsequence) |
| Longest Increasing Subsequence | 심화 | 최장 증가 부분수열 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/longest-increasing-subsequence) |
| Shortest Common Supersequence | 심화 | 두 수열을 모두 부분수열로 포함하는 최단 수열 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/shortest-common-supersequence) |
| Knapsack Problem | 심화 | 용량 제약 속 최대 가치 선택 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/knapsack-problem) |
| Maximum Subarray | 심화 | 연속 부분 배열의 최대 합 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/maximum-subarray) |
| Combination Sum | 심화 | 목표 합을 만드는 조합 열거 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sets/combination-sum) |


관련 노트: [[bit-manipulation|비트 연산]], [[number-theory-basics|정수론]], [[permutation-combination|순열과 조합]], [[dynamic-programming|동적 계획법]], [[fourier-transform|푸리에 변환]]
