---
title: "자료구조"
concept: "Data Structure"
summary: "알고리즘 문제에서 데이터를 담고 꺼내는 방식을 정하는 기본 자료구조 모음."
tags: ["algorithm", "data-structure"]
source: til
date: "2026-10-14"
---

어떤 자료구조를 고르느냐에 따라 같은 알고리즘의 속도가 크게 달라진다. 이 주제에는 코딩 테스트에서 가장 자주 쓰이는 자료구조와 파이썬에서의 구현 방법을 정리했다.

- [스택](Algorithm/Data-Structure/stack.md): 후입선출(LIFO), DFS·괄호 검사·되돌리기
- [큐와 덱](Algorithm/Data-Structure/queue-deque.md): 선입선출(FIFO) 큐와 양쪽에서 넣고 빼는 덱, BFS의 기반
- [힙과 우선순위 큐](Algorithm/Data-Structure/heap-priority-queue.md): 우선순위가 가장 높은 원소를 빠르게 꺼내는 힙
- [서로소 집합 (Union-Find)](Algorithm/Data-Structure/disjoint-set.md): 원소들을 서로소 집합으로 묶는 Union-Find, 크루스칼과 병목 경로
- [해시 테이블](Algorithm/Data-Structure/hash-table.md): 해시 함수, 개방 주소법과 분리 연결법, 적재율과 리사이즈, 언어별 구현
- [트리와 이진 탐색 트리](Algorithm/Data-Structure/tree.md): 트리 용어, 이진 트리의 종류와 배열 표현, 순회, BST와 AVL 회전
- [기초 자료구조: 배열에서 트라이까지](Algorithm/Data-Structure/data-structures.md): 배열·연결 리스트·이진 탐색 트리·해시 테이블·트라이의 구조와 C 구현 (CS50)
- [추상 자료형 (ADT)](Algorithm/Data-Structure/abstract-data-type.md): 자료와 연산을 동작으로만 정의하기, 인터페이스와 구현 분리, ADT와 자료구조의 차이
- [세그먼트 트리](Algorithm/Data-Structure/segment-tree.md): 값이 바뀌는 배열의 구간 질의·갱신을 O(log n)에, 지연 전파, 펜윅 트리 비교
