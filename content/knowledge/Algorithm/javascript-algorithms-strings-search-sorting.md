---
title: "JavaScript 알고리즘: 문자열·탐색·정렬"
concept: "JS String Search Sorting"
summary: "문자열 매칭 8개, 탐색 4개, 정렬 10개와 구현 선택의 기준."
tags: ["algorithm", "javascript", "string", "sorting", "search"]
source: other
date: "2026-11-15"
sources: ["https://github.com/trekhleb/javascript-algorithms", "https://github.com/trekhleb/javascript-algorithms/blob/85293e3e2b88f4d2ce330d956b139cf628aa1e82/README.md"]
---

> Oleksii Trekhleb의 공개 저장소 「[JavaScript Algorithms and Data Structures](https://github.com/trekhleb/javascript-algorithms)」를 주제별로 재구성한 노트다.

## 세 가지 문제를 구분한다

- **문자열**: 접두사·해시·편집 거리 등 문자열의 구조를 이용한다.
- **탐색**: 정렬 여부·분포·단조성에 따라 방문할 원소 수를 줄인다.
- **정렬**: 비교 기반인지, 입력 키의 범위를 활용하는지에 따라 비용이 달라진다.

## 원본 항목

### Strings

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Hamming Distance | 기초 | 같은 길이에서 서로 다른 위치 수 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/string/hamming-distance) |
| Palindrome | 기초 | 앞뒤가 같은 문자열 판별 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/string/palindrome) |
| Levenshtein Distance | 심화 | 삽입·삭제·치환의 최소 편집 횟수 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/string/levenshtein-distance) |
| Knuth–Morris–Pratt Algorithm | 심화 | 실패 함수를 활용하는 선형 시간 패턴 탐색 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/string/knuth-morris-pratt) |
| Z Algorithm | 심화 | 접두사 일치 길이를 재사용하는 문자열 탐색 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/string/z-algorithm) |
| Rabin Karp Algorithm | 심화 | 롤링 해시를 사용하는 문자열 탐색 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/string/rabin-karp) |
| Longest Common Substring | 심화 | 연속된 최장 공통 문자열 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/string/longest-common-substring) |
| Regular Expression Matching | 심화 | 정규 패턴 조건과 문자열의 일치 판정 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/string/regular-expression-matching) |

### Searches

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Linear Search | 기초 | 앞에서부터 순차 탐색 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/search/linear-search) |
| Jump Search | 기초 | 정렬 배열을 블록 단위로 건너뛰는 탐색 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/search/jump-search) |
| Binary Search | 기초 | 단조 조건 또는 정렬 구간을 반씩 줄이는 탐색 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/search/binary-search) |
| Interpolation Search | 기초 | 값의 분포를 이용해 예상 위치를 좁히는 탐색 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/search/interpolation-search) |

### Sorting

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Bubble Sort | 기초 | 이웃한 원소의 교환으로 정렬 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sorting/bubble-sort) |
| Selection Sort | 기초 | 선택한 최솟값을 앞쪽에 놓는 정렬 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sorting/selection-sort) |
| Insertion Sort | 기초 | 정렬된 접두 구간에 값을 삽입 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sorting/insertion-sort) |
| Heap Sort | 기초 | 힙의 최댓값·최솟값을 반복 추출 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sorting/heap-sort) |
| Merge Sort | 기초 | 분할해 정렬한 구간을 병합 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sorting/merge-sort) |
| Quicksort | 기초 | 피벗을 중심으로 분할하는 정렬 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sorting/quick-sort) |
| Shellsort | 기초 | 간격을 줄여 가며 수행하는 삽입 정렬 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sorting/shell-sort) |
| Counting Sort | 기초 | 원소 값의 발생 빈도로 정렬 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sorting/counting-sort) |
| Radix Sort | 기초 | 자리별 정렬을 반복 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sorting/radix-sort) |
| Bucket Sort | 기초 | 값 구간별 버킷을 나누어 정렬 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/algorithms/sorting/bucket-sort) |


## 정렬 알고리즘 비교의 기준

| 방법 | 일반적인 시간 | 특징 |
| --- | --- | --- |
| 삽입 정렬 | 평균·최악 O(n²) | 이미 거의 정렬된 소규모 입력에 유리 |
| 병합 정렬 | O(n log n) | 안정 정렬 가능, 배열 구현은 별도 작업 공간 필요 |
| 퀵 정렬 | 평균 O(n log n), 최악 O(n²) | 피벗·분할 방법에 따라 결과 달라짐 |
| 힙 정렬 | O(n log n) | 제자리 정렬 가능, 일반적으로 안정 정렬이 아님 |
| 계수 정렬 | O(n + k) | 키 범위 k에 비례하는 추가 공간 필요 |

기존 저장소 표에 등장하는 **Big O는 수학적 증가율 분류이지 모든 구현에서 동일한 실제 수행 시간을 보장하는 수치가 아니다.** 안정성·입력 분포·메모리를 함께 비교한다.

관련 노트: [[kmp-algorithm|KMP]], [[binary-search|이분 탐색]], [[elementary-sorts|기초 정렬]], [[merge-quick-sort|병합·퀵 정렬]], [[big-o|시간 복잡도]]
