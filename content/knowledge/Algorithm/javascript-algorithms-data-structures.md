---
title: "JavaScript 자료구조 구현 전체 지도"
concept: "JavaScript Data Structures"
summary: "연결 리스트부터 트리·그래프·Bloom Filter·LRU Cache까지 19개 구조와 선택 기준, 구현 링크."
tags: ["algorithm", "data-structure", "javascript", "implementation"]
source: other
date: "2026-11-15"
sources: ["https://github.com/trekhleb/javascript-algorithms", "https://github.com/trekhleb/javascript-algorithms/blob/85293e3e2b88f4d2ce330d956b139cf628aa1e82/README.md"]
---

> Oleksii Trekhleb의 공개 저장소 「[JavaScript Algorithms and Data Structures](https://github.com/trekhleb/javascript-algorithms)」를 주제별로 재구성한 노트다.

## 무엇을 배우는가

**자료구조는 데이터를 저장하는 방식과 연산의 비용을 함께 고르는 선택**이다. 배열은 인덱스로 접근하기 쉽고, 해시 테이블은 평균 조회 성능을 목표로 하며, 균형 트리는 정렬된 순서의 탐색을 지원한다. 같은 동작도 값의 개수·접근 패턴·메모리 제약에 따라 최적 구조가 달라진다.

## 저장소의 자료구조 전체 항목

| 항목 | 수준 | 핵심 개념 | 코드·설명 |
| --- | --- | --- | --- |
| Linked List | 기초 | 다음 노드 참조로 연결해 삽입 위치가 알려진 경우 연결 비용을 줄인다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/linked-list) |
| Doubly Linked List | 기초 | 이전·다음 참조를 유지해 양방향 이동과 노드 제거를 쉽게 한다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/doubly-linked-list) |
| Queue | 기초 | FIFO 순서로 요청을 처리한다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/queue) |
| Stack | 기초 | LIFO 구조로 되돌리기·재귀 호출 흐름을 다룬다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/stack) |
| Deque | 기초 | 양쪽 끝에서 삽입과 제거를 수행한다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/deque) |
| Hash Table | 기초 | 해시값으로 키를 배치해 평균 상수 시간 조회를 목표로 한다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/hash-table) |
| Heap | 기초 | 완전 이진 트리의 대소 관계를 유지해 우선 항목을 찾는다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/heap) |
| Priority Queue | 기초 | 우선순위가 가장 높은 원소를 먼저 처리하는 추상 자료형이다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/priority-queue) |
| Trie | 심화 | 문자열 공통 접두사를 공유해 저장·탐색한다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/trie) |
| Tree | 심화 | 계층적인 부모·자식 관계를 표현한다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/tree) |
| Binary Search Tree | 심화 | 왼쪽이 작고 오른쪽이 큰 비교 규칙으로 값을 탐색한다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/tree/binary-search-tree) |
| AVL Tree | 심화 | 높이 균형을 회전으로 복구한다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/tree/avl-tree) |
| Red-Black Tree | 심화 | 색 제약으로 트리 높이를 제한한다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/tree/red-black-tree) |
| Segment Tree | 심화 | 구간 집계와 점 갱신·구간 갱신을 처리한다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/tree/segment-tree) |
| Fenwick Tree | 심화 | 누적 합과 점 갱신을 간결한 비트 구조로 처리한다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/tree/fenwick-tree) |
| Graph | 심화 | 정점과 간선으로 관계·경로·연결성을 표현한다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/graph) |
| Disjoint Set | 심화 | 집합의 대표를 관리해 연결 요소를 빠르게 합친다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/disjoint-set) |
| Bloom Filter | 심화 | 비트 배열로 존재 가능성을 빠르게 검사하며 거짓 양성이 생길 수 있다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/bloom-filter) |
| LRU Cache | 심화 | 오랫동안 쓰지 않은 캐시 항목부터 제거한다 | [원본](https://github.com/trekhleb/javascript-algorithms/tree/85293e3e2b88f4d2ce330d956b139cf628aa1e82/src/data-structures/lru-cache) |


## 선택 기준과 대표 복잡도

| 구조 | 선택하기 좋은 상황 | 주의할 점 |
| --- | --- | --- |
| 연결 리스트 | 중간 노드를 이미 알고 자주 삽입·제거 | 임의 인덱스 접근 O(n) |
| 스택·큐·덱 | 처리 순서가 중요한 경우 | 내부 구현에 따라 연산 비용이 다름 |
| 해시 테이블 | 키 기반 동등 비교 조회 | 평균 O(1) 목표, 충돌과 최악 비용 고려 |
| 균형 이진 탐색 트리 | 정렬 상태와 범위 질의 유지 | 회전·균형 제약 유지 비용 |
| 세그먼트·펜윅 트리 | 업데이트가 있는 구간 집계 | O(log n) 연산과 인덱스 주의 |
| Bloom Filter | 메모리를 아끼며 존재 가능성 탐색 | 거짓 양성 가능, 일반 구현에서 삭제에 제약 |
| LRU 캐시 | 용량 초과 시 오래 안 쓴 항목 제거 | 해시맵과 이중 연결 리스트 결합이 일반적 |

관련 노트: [[data-structures|기초 자료구조]], [[hash-table|해시 테이블]], [[tree|트리]], [[segment-tree|세그먼트 트리]], [[disjoint-set|서로소 집합]]
