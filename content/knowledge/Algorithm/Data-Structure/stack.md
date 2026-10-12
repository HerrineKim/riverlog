---
title: "스택"
concept: "Stack"
summary: "한쪽 끝에서만 넣고 빼는 후입선출(LIFO) 자료구조."
tags: ["data-structure", "stack", "python"]
source: til
---

스택(Stack)은 **한쪽 끝(top)에서만 자료를 넣고 뺄 수 있는** 선형 자료구조다. 프링글스 통을 떠올리면 쉽다. 맨 위의 과자부터 꺼낼 수 있고, 새 과자는 그 위에 쌓인다. 나중에 들어간 것이 먼저 나오므로 **후입선출(LIFO, Last In First Out)** 구조라고 한다.

## 기본 연산

| 연산 | 설명 | 시간 복잡도 |
| --- | --- | --- |
| `push(x)` | top에 원소 추가 | O(1) |
| `pop()` | top 원소를 제거하고 반환 | O(1) |
| `peek()` | top 원소를 제거하지 않고 반환 | O(1) |
| `is_empty()` | 비어 있는지 확인 | O(1) |

비어 있는 스택에서 pop하면 **스택 언더플로우**, 정해진 크기를 넘게 push하면 **스택 오버플로우**가 된다.

## 파이썬 리스트로 구현하기

파이썬에는 별도의 스택 타입이 없지만 리스트가 그대로 스택 역할을 한다.

- `S.append(x)`: 리스트 **맨 끝**에 추가, O(1)
- `S.pop()`: 리스트 **맨 끝**(마지막 원소)을 제거하고 반환, O(1). `S.pop(-1)`과 같다.
- `S[-1]`: 맨 끝 원소 확인(peek)

> 주의: `S.pop(0)`은 맨 앞 원소를 꺼내는데, 뒤의 원소들을 모두 한 칸씩 당겨야 해서 O(n)이다. 스택은 항상 리스트의 끝을 top으로 쓴다.

```python
class Stack:
    def __init__(self, limit=None):
        self._items = []
        self.limit = limit  # None이면 크기 제한 없음

    def __len__(self):
        return len(self._items)

    def is_empty(self):
        return not self._items

    def is_full(self):
        return self.limit is not None and len(self._items) >= self.limit

    def push(self, item):
        if self.is_full():
            raise OverflowError("stack overflow")
        self._items.append(item)

    def pop(self):
        if self.is_empty():
            raise IndexError("stack underflow")
        return self._items.pop()

    def peek(self):
        if self.is_empty():
            raise IndexError("stack is empty")
        return self._items[-1]

    def __contains__(self, item):
        return item in self._items


s = Stack(limit=3)
s.push(1)
s.push(2)
print(s.peek())  # 2
print(s.pop())   # 2
print(len(s))    # 1
```

실전에서는 클래스 없이 리스트를 바로 쓰는 경우가 대부분이다. `collections.deque`도 `append()`/`pop()`으로 스택처럼 쓸 수 있다.

## 활용

- **DFS**: 방문할 노드를 스택에 쌓는다. 재귀 호출 자체가 시스템 스택을 쓰므로 재귀로 DFS를 짜는 경우가 많다.
- **괄호 짝 검사**: 여는 괄호는 push, 닫는 괄호가 나오면 pop해서 짝을 확인
- **되돌리기(Undo)**, 브라우저 뒤로 가기
- **후위 표기식 계산**, 함수 호출 스택

## 핵심 정리

- 스택 = 후입선출, top에서만 삽입·삭제, 모두 O(1)
- 파이썬에서는 리스트의 `append()`와 `pop()`(맨 끝)을 사용
- 중간 원소에 직접 접근하는 용도로는 쓰지 않는다.

관련 노트: [[dfs|DFS]], [[recursion|재귀 함수]], [[queue-deque|큐와 덱]], [[data-structures|기초 자료구조(CS50)]]
