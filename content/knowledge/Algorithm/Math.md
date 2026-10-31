---
title: "알고리즘을 위한 수학"
concept: "Math for Algorithms"
summary: "점화식의 일반항, 벡터공간, 내적·외적과 거리처럼 알고리즘 분석과 계산 기하에 쓰이는 수학 노트 모음."
tags: ["algorithm", "math", "linear-algebra"]
source: other
date: "2026-10-14"
---

알고리즘을 분석하고 기하 문제를 풀다 보면 점화식, 선형대수, 벡터 연산이 계속 나온다. 이 주제에는 그 바탕이 되는 수학 개념을 모았다. 최대공약수(유클리드 호제법)는 [재귀 함수](Algorithm/Paradigm/recursion.md)에 있다.

- [선형 점화식의 일반항](Algorithm/Math/linear-recurrence.md): 생성함수·특성방정식·행렬 대각화로 일반항 구하기, 행렬 거듭제곱
- [벡터공간과 부분공간](Algorithm/Math/vector-space.md): 벡터공간의 공리, 부분공간 판정, 합공간·직합, 생성공간(span)
- [벡터 내적·외적과 거리](Algorithm/Math/vector-geometry.md): 법선 벡터와 점·초평면 거리, CCW와 계산 기하
- [정수론 기초: 소수·최대공약수·합동식](Algorithm/Math/number-theory-basics.md): 유클리드 호제법과 베주 항등식, 에라토스테네스의 체, 선형 합동식과 중국인의 나머지 정리, 오일러 피 함수와 페르마의 소정리
- [비트 연산 기법](Algorithm/Math/bit-manipulation.md): 비트 검사·설정·뒤집기 관용구, `n & (n - 1)`, XOR의 성질, 비트마스크 집합, 언어별 정수 폭
- [수학적 최적화와 정수 계획법](Algorithm/Math/integer-programming.md): 결정 변수·제약 조건·목적 함수로 적어 솔버에 맡기기, 정수 선형 계획법 모델링 예
- [푸리에 변환](Algorithm/Math/fourier-transform.md): 신호를 주파수 성분으로 분해, DFT와 FFT, 스펙트럼과 위상, 주파수 영역 필터링
- [순열과 조합](Algorithm/Math/permutation-combination.md): 공식 유도, 파스칼 점화식, 이항 정리, 중복 순열·중복 조합, 완전 탐색 가능성 가늠
- [미분과 적분 기초](Algorithm/Math/calculus-basics.md): 극한·연속, 도함수와 연쇄 법칙, 극값과 최적화, 미적분학의 기본 정리, 수치 미분·적분
