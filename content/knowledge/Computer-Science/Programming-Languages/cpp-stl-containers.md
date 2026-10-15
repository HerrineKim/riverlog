---
title: "C++ STL 컨테이너와 시간 복잡도"
concept: "STL Container"
summary: "C++ 표준 라이브러리의 vector·deque·list·set·map·unordered 컨테이너가 내부적으로 어떤 자료구조인지, 그래서 연산별 시간 복잡도가 어떻게 되는지 정리한다. vector 끝 삽입은 용량을 배수로 늘리기 때문에 분할 상환 O(1)이고, set·map은 레드-블랙 트리라 O(log n)이다."
tags: ["cpp", "data-structure", "algorithm", "performance"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/cf49e4717acb41308654fcfeed13bda5", "https://80000coding.notion.site/be1a0d0185214f76877b9e3b8f08305d", "https://en.cppreference.com/w/cpp/container"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[C++] vector STL method 시간복잡도」, 「[C++] set STL 을 알아보자.」를 바탕으로 재구성한 노트다.

## STL 컨테이너란

STL(Standard Template Library)은 C++ 표준 라이브러리 중 [[cpp-templates|템플릿]]으로 만든 컨테이너·반복자·알고리즘 묶음이다. 컨테이너마다 내부 자료구조가 다르므로 **어떤 연산을 자주 하느냐로 컨테이너를 고른다.** 앞에 계속 삽입하는 문제에 `vector`를 쓰면 매번 O(n)을 치르게 된다.

| 분류 | 컨테이너 | 내부 구조 |
| --- | --- | --- |
| 순차 | `vector` | 연속 메모리 동적 배열 |
| 순차 | `deque` | 고정 크기 블록들의 배열 |
| 순차 | `list` | 이중 연결 리스트 |
| 연관(정렬) | `set`, `map`, `multiset`, `multimap` | 레드-블랙 트리 |
| 비정렬 연관 | `unordered_set`, `unordered_map` | 해시 테이블 |
| 어댑터 | `stack`, `queue`, `priority_queue` | 기본은 `deque`·`deque`·`vector` 위에 얹은 인터페이스 |

## vector

`vector`는 힙에 연속 메모리를 잡는 **동적 배열**이다. 객체가 소멸할 때 원소 메모리도 함께 해제되므로 직접 `delete`할 필요가 없다. 내부에 시작 포인터, 원소 수(`size`), 확보한 칸 수(`capacity`)를 들고 있다.

| 연산 | 복잡도 | 이유 |
| --- | --- | --- |
| `v[i]`, `v.at(i)` | O(1) | 시작 주소 + 오프셋 계산 |
| `push_back`, `pop_back` | 분할 상환 O(1) | 뒤에 칸이 남아 있으면 그냥 쓴다 |
| `insert`, `erase` (중간) | O(n) | 뒤 원소를 한 칸씩 밀거나 당긴다 |
| `find` (정렬 안 됨) | O(n) | 처음부터 훑는다 |

### 분할 상환 O(1)

`capacity`가 꽉 찬 상태에서 `push_back`하면 더 큰 메모리를 새로 잡고 기존 원소를 모두 옮긴다. 이 한 번은 O(n)이다. 그러나 용량을 **일정 배수**(libstdc++·libc++는 2배, MSVC는 1.5배)로 늘리므로 재할당은 드물게 일어나고, n번 삽입의 총비용이 O(n)으로 묶인다. 그래서 한 번당 **분할 상환(amortized) O(1)**이라 쓴다.

```text
capacity: 1 → 2 → 4 → 8 → 16 ...
n번 push_back의 복사 횟수 ≤ 1 + 2 + 4 + ... + n < 2n  →  평균 O(1)
```

- 크기를 미리 알면 `reserve(n)`으로 한 번에 잡아 재할당과 복사를 없앤다.
- 재할당이 일어나면 **기존 반복자·포인터·참조가 모두 무효화**된다. 순회 중 `push_back`이 위험한 이유다.

## deque와 list

- `deque`는 블록 단위로 메모리를 잡아 **앞뒤 삽입·삭제가 모두 O(1)**이고 임의 접근도 O(1)이다. 다만 원소가 연속되지 않아 캐시 효율은 `vector`보다 떨어진다. 자세한 구조는 [[queue-deque|큐와 덱]] 노트에 있다.
- `list`는 위치(반복자)를 알면 어디서든 삽입·삭제가 O(1)이지만, 그 위치를 찾는 데 O(n)이 들고 노드가 흩어져 있어 실제로는 느린 경우가 많다.

## set과 map

`set`은 **중복 없이 늘 정렬된 상태**를 유지한다. 이진 탐색 트리로 만들면 정렬된 데이터가 들어올 때 한쪽으로 기울어 O(n)이 되므로, 표준 구현은 스스로 균형을 잡는 **레드-블랙 트리**를 쓴다. `map`은 같은 트리에 키-값 쌍을 담는다.

| 연산 | `set`/`map` | `unordered_set`/`unordered_map` |
| --- | --- | --- |
| 삽입 `insert` | O(log n) | 평균 O(1), 최악 O(n) |
| 탐색 `find`, `count` | O(log n) | 평균 O(1), 최악 O(n) |
| 삭제 `erase` | O(log n) | 평균 O(1) |
| 순회 순서 | 키 오름차순 | 순서 없음 |
| 범위 질의 `lower_bound` | 가능 | 불가능 |

```cpp
std::set<int> s;
s.insert(7);                       // O(log n)
if (s.find(7) != s.end()) { }      // 없으면 end() 반환
if (s.count(7)) { }                // set에서는 0 또는 1
if (s.contains(7)) { }             // C++20
```

"넣고 나서 있는지 자주 확인"하는 문제라면 `set`이, 순서가 필요 없으면 `unordered_set`이 맞다. 정렬 순회나 "k 이상인 첫 원소" 같은 범위 질의가 필요하면 트리 기반을 고른다.

## 정리

- 컨테이너는 자주 하는 연산의 복잡도로 고른다. 기본값은 `vector`다.
- `vector`의 끝 삽입은 배수 증가 덕분에 분할 상환 O(1)이고, 중간 삽입·삭제는 O(n)이다.
- 재할당은 반복자를 무효화한다. 크기를 알면 `reserve`를 먼저 부른다.
- 앞뒤 삽입이 잦으면 `deque`, 정렬 유지와 범위 질의가 필요하면 `set`/`map`, 순서 없는 빠른 조회는 `unordered_*`를 쓴다.

관련 노트: [[big-o|빅오 표기법과 시간 복잡도]], [[data-structures|기초 자료구조: 배열에서 트라이까지]], [[queue-deque|큐와 덱]], [[cpp-templates|C++ 템플릿]]
