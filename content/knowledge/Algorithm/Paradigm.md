---
title: "알고리즘 설계 기법"
concept: "Algorithm Paradigm"
summary: "문제를 쪼개고, 기억하고, 매 순간 최선을 고르는 등 알고리즘을 설계하는 대표적인 사고방식."
tags: ["algorithm", "paradigm"]
source: til
date: "2026-10-14"
---

구체적인 알고리즘 하나하나보다 더 오래 쓰이는 것은 문제를 바라보는 방식이다. 이 주제에는 큰 문제를 작은 문제로 줄여 푸는 재귀를 출발점으로, 그 위에 쌓이는 분할 정복·동적 계획법·그리디를 정리했다. 세 기법은 "작은 문제가 서로 겹치는가, 독립적인가, 매 순간의 선택만으로 충분한가"로 구분된다.

- [재귀 함수](Algorithm/Paradigm/recursion.md): 자기 자신을 호출하는 함수, 종료 조건, 팩토리얼·유클리드 호제법(최대공약수·최소공배수)
- [분할 정복](Algorithm/Paradigm/divide-and-conquer.md): 독립적인 하위 문제로 나눠 풀고 합치기
- [동적 계획법 (DP)](Algorithm/Paradigm/dynamic-programming.md): 겹치는 하위 문제의 답을 저장해 재사용하기
- [그리디 알고리즘](Algorithm/Paradigm/greedy.md): 매 순간 가장 좋아 보이는 선택을 하기
- [스위핑 (Sweep Line)](Algorithm/Paradigm/sweep-line.md): 정렬한 뒤 한 번 훑으며 답을 갱신하기, 구간 겹침과 평면 분할
- [최장 증가 부분 수열 (LIS)](Algorithm/Paradigm/longest-increasing-subsequence.md): O(n²) DP와 이분 탐색을 쓰는 O(n log n) 풀이, 수열 복원
