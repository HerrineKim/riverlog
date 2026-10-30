---
title: "Algorithm"
concept: "Algorithm"
summary: "자료구조, 탐색, 그래프, 알고리즘 설계 패러다임, 정렬, 복잡도 분석과 코딩 테스트 전략을 모은 알고리즘 노트."
tags: ["algorithm", "data-structure", "coding-test", "python"]
source: mixed
date: "2026-10-13"
---

알고리즘은 입력을 원하는 출력으로 바꾸는 잘 정의된 계산 절차다. 이 분야는 자료구조·탐색·그래프·설계 기법·정렬을 파이썬 코드와 함께 다룬다. 먼저 복잡도 분석(빅오 표기법)으로 "얼마나 빠른가"를 재는 법을 익히고, 자료구조와 탐색, 설계 패러다임 순서로 보면 흐름이 자연스럽다.

- [빅오 표기법과 시간 복잡도](Algorithm/big-o.md): 알고리즘의 정의, 빅오(O)·빅오메가(Ω)·빅세타(Θ) 표기법, 시간·공간 복잡도
- [구간 합과 접두사 합](Algorithm/prefix-sum.md): 접두사 합으로 구간 합을 O(1)에 구하기
- [KMP 문자열 검색 알고리즘](Algorithm/kmp-algorithm.md): 실패 함수(pi 배열)로 텍스트 포인터를 되돌리지 않고 O(N + M)에 패턴 찾기
- [Data-Structure](Algorithm/Data-Structure.md): 스택, 큐·덱, 힙·우선순위 큐, 서로소 집합(Union-Find), 트리와 이진 탐색 트리
- [Search](Algorithm/Search.md): 완전 탐색과 백트래킹, 이분 탐색, BFS, DFS
- [Graph](Algorithm/Graph.md): 그래프 표현 방식, 위상 정렬, 다익스트라와 최단 경로 알고리즘 고르기, 단절점과 단절선, 오일러 회로
- [Paradigm](Algorithm/Paradigm.md): 재귀, 분할 정복, 동적 계획법, 그리디, 투 포인터와 슬라이딩 윈도우, 스위핑, 최장 증가 부분 수열
- [Sorting](Algorithm/Sorting.md): 기본 정렬(버블·선택·삽입·계수), 병합·퀵 정렬, 병합 삽입 정렬(Ford-Johnson)
- [Math](Algorithm/Math.md): 비트 연산 기법, 선형 점화식의 일반항, 벡터공간, 내적·외적과 거리
- [코딩 테스트 접근법](Algorithm/coding-test.md): 문제를 푸는 순서, 반례 찾기, 실전 팁
- [현실 시스템을 움직이는 알고리즘과 자료구조](Algorithm/real-world-algorithms.md): 일상 소프트웨어 속 자료구조, 일관된 해싱·블룸 필터·HyperLogLog·토큰 버킷·머클 트리 같은 시스템 설계 알고리즘
- [파싱 알고리즘과 프랫 파서](Algorithm/pratt-parsing.md): 연산자 우선순위와 바인딩 파워로 토큰을 구문 트리로 묶기
