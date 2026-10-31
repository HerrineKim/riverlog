---
title: "스택"
concept: "Stack"
summary: "한쪽 끝에서만 넣고 빼는 후입선출(LIFO) 자료구조와 언어별 구현, 다음 큰 원소를 O(n)에 구하는 단조 스택."
tags: ["data-structure", "stack", "python"]
source: mixed
date: "2026-10-30"
sources: ["https://www.techinterviewhandbook.org/algorithms/stack/", "https://www.techinterviewhandbook.org/algorithms/array/", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/ds.md", "고려사이버대학교 자료구조 강의(나홍석 교수, 2024-1학기)"]
---

> 언어별 구현과 단조 스택 절은 Tech Interview Handbook의 「[Stack cheatsheet](https://www.techinterviewhandbook.org/algorithms/stack/)」, 「[Array cheatsheet](https://www.techinterviewhandbook.org/algorithms/array/)」(오른쪽부터 훑기)를 바탕으로 보강했다.
> 수식 표기법과 스택 계산 절은 fru1tworld/cs-basic 모의 면접 질문 목록의 「[자료구조](https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/ds.md)」 질문이 묻는 개념으로 보강했다.
> 「배열 구현과 연결 리스트 구현」은 고려사이버대학교 「자료구조」(2024-1학기) 강의 내용으로 보강했다.

스택(Stack)은 **한쪽 끝(top)에서만 자료를 넣고 뺄 수 있는** 선형 자료구조다. 프링글스 통을 떠올리면 쉽다. 맨 위의 과자부터 꺼낼 수 있고, 새 과자는 그 위에 쌓인다. 나중에 들어간 것이 먼저 나오므로 **후입선출(LIFO, Last In First Out)** 구조라고 한다.

## 기본 연산

| 연산 | 설명 | 시간 복잡도 |
| --- | --- | --- |
| `push(x)` | top에 원소 추가 | O(1) |
| `pop()` | top 원소를 제거하고 반환 | O(1) |
| `peek()` | top 원소를 제거하지 않고 반환 | O(1) |
| `is_empty()` | 비어 있는지 확인 | O(1) |

비어 있는 스택에서 pop하면 **스택 언더플로우**, 정해진 크기를 넘게 push하면 **스택 오버플로우**가 된다.

## 배열 구현과 연결 리스트 구현

스택을 직접 만드는 방법은 두 가지다. 언어 내장 동적 배열(파이썬 리스트, `ArrayDeque`)은 앞의 방식에 자동 확장을 더한 것이다.

| | 고정 크기 배열 | 연결 리스트 |
| --- | --- | --- |
| top | 마지막 원소의 인덱스. 빈 스택은 `top = -1` | 맨 앞 노드를 가리키는 포인터. 빈 스택은 `top = NULL` |
| push | `top`을 1 올리고 `data[top]`에 넣는다 | 새 노드를 만들어 `next`가 옛 top을 가리키게 한 뒤 top을 새 노드로 바꾼다 |
| pop | `data[top]`을 꺼내고 `top`을 1 내린다 | top 노드의 값을 꺼내고 top을 `next`로 옮긴 뒤 노드 메모리를 해제한다 |
| 비었나 | `top < 0` | `top == NULL` |
| 찼나 | `top >= MAX - 1`. 넘으면 오버플로우 | 메모리가 남는 한 차지 않는다 |
| 크기 | `top + 1`로 O(1) | 개수를 따로 세지 않으면 끝까지 따라가야 해 O(n) |
| 장단점 | 연속 메모리라 빠르고 단순하다. 최대 크기를 미리 정해야 한다 | 크기 제한이 없다. 노드마다 포인터 공간과 할당 비용이 든다 |

배열 구현에서 오버플로우를 줄이려면 MAX를 넉넉히 잡거나, 찼을 때 배열을 2배로 키워 옮기는 동적 배열로 바꾼다.

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

다른 언어도 같다. JavaScript는 배열의 `push()`/`pop()`을 쓰고, C++는 `std::stack`을 쓴다. Java의 `java.util.Stack`은 동기화된 `Vector`를 상속한 옛 클래스라 공식 문서도 `Deque<Integer> stack = new ArrayDeque<>()`의 `push`/`pop`/`peek`을 권한다.

## 활용

- **DFS**: 방문할 노드를 스택에 쌓는다. 재귀 호출 자체가 시스템 스택을 쓰므로 재귀로 DFS를 짜는 경우가 많다.
- **괄호 짝 검사**: 여는 괄호는 push, 닫는 괄호가 나오면 pop해서 짝을 확인
- **되돌리기(Undo)**, 브라우저 뒤로 가기
- **후위 표기식 계산**, 함수 호출 스택
- **다음으로 큰(작은) 원소**: 아래 단조 스택
- **큐 흉내 내기**: 스택 두 개로 큐를 만든다([[queue-deque|큐와 덱]])

## 수식 표기법과 스택 계산

같은 수식도 연산자를 어디에 두느냐로 세 가지 표기가 있다.

| 표기 | `(3 + 4) * 2` | 특징 |
| --- | --- | --- |
| 중위(infix) | `(3 + 4) * 2` | 사람이 읽는 꼴. 우선순위·결합 방향·괄호가 있어야 뜻이 하나로 정해진다 |
| 전위(prefix, 폴란드 표기) | `* + 3 4 2` | 연산자가 피연산자 앞. 괄호가 필요 없다 |
| 후위(postfix, 역폴란드 표기 RPN) | `3 4 + 2 *` | 연산자가 피연산자 뒤. 괄호 없이 왼쪽부터 한 번 훑으며 계산된다 |

**후위 표기 계산**은 스택 하나로 O(n)에 끝난다. 피연산자는 push하고, 연산자를 만나면 두 개를 pop해 계산한 결과를 다시 push한다. 먼저 꺼낸 값이 **오른쪽** 피연산자다(`a b -`에서 b가 먼저 나온다). 끝나면 스택에 값 하나가 남는다. **전위 표기**는 오른쪽 끝부터 거꾸로 같은 방법으로 계산하고, 이때는 먼저 꺼낸 값이 왼쪽 피연산자다.

**중위 → 후위 변환**은 연산자 스택을 쓰는 **차량기지 알고리즘(shunting-yard, 다익스트라)** 이다.

| 토큰 | 처리 |
| --- | --- |
| 피연산자 | 바로 출력 |
| 연산자 `op` | 스택 top의 연산자가 `op`보다 우선순위가 높거나, 같으면서 `op`가 왼쪽 결합이면 pop해 출력하기를 반복한 뒤 `op`를 push |
| `(` | push |
| `)` | `(`가 나올 때까지 pop해 출력하고 `(`는 버린다 |
| 입력 끝 | 남은 연산자를 모두 pop해 출력 |

```python
PREC = {'+': 1, '-': 1, '*': 2, '/': 2}

def to_postfix(tokens):
    out, ops = [], []
    for t in tokens:
        if t == '(':
            ops.append(t)
        elif t == ')':
            while ops[-1] != '(':
                out.append(ops.pop())
            ops.pop()
        elif t in PREC:                      # 모두 왼쪽 결합으로 가정
            while ops and ops[-1] != '(' and PREC[ops[-1]] >= PREC[t]:
                out.append(ops.pop())
            ops.append(t)
        else:
            out.append(t)
    return out + ops[::-1]

def eval_postfix(tokens):
    st = []
    for t in tokens:
        if t in PREC:
            b, a = st.pop(), st.pop()        # 먼저 꺼낸 b가 오른쪽
            st.append({'+': a + b, '-': a - b, '*': a * b, '/': a / b}[t])
        else:
            st.append(float(t))
    return st.pop()

print(to_postfix("3 + 4 * 2".split()))   # ['3', '4', '2', '*', '+']
```

두 단계 모두 토큰마다 push·pop이 한 번씩이라 전체 O(n)이다. 변환 없이 중위식을 바로 트리로 만드는 방법은 [[pratt-parsing|파싱 알고리즘과 프랫 파서]]에 있다.

## 단조 스택 (Monotonic Stack)

스택 안의 값이 **항상 증가(또는 감소) 순서를 유지하도록**, 새 값을 넣기 전에 순서를 깨는 값을 모두 pop하는 기법이다. pop되는 순간이 곧 「그 원소보다 처음으로 큰(작은) 값을 만난 순간」이므로, 각 원소의 **다음 큰 원소(next greater element)** 를 한 번의 순회로 구한다.

```python
def days_until_warmer(temps):          # 각 날짜에서 더 따뜻한 날까지 며칠 남았나
    answer = [0] * len(temps)
    stack = []                         # 아직 더 따뜻한 날을 못 만난 날짜의 인덱스 (온도 내림차순)
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            answer[j] = i - j
        stack.append(i)
    return answer
```

안쪽 `while`이 있어도 각 인덱스는 한 번 push되고 많아야 한 번 pop되므로 전체가 **O(n)** 이다. 오른쪽 끝에서 왼쪽으로 훑으며 스택을 유지해도 같은 답을 얻는다. 히스토그램에서 가장 큰 직사각형, 주식 가격 스팬, 줄 선 사람이 볼 수 있는 사람 수 같은 문제가 이 모양이다.

## 핵심 정리

- 스택 = 후입선출, top에서만 삽입·삭제, 모두 O(1)
- 파이썬에서는 리스트의 `append()`와 `pop()`(맨 끝)을 사용
- 중간 원소에 직접 접근하는 용도로는 쓰지 않는다.
- 다음 큰(작은) 원소는 단조 스택으로 O(n)에 구한다.

관련 노트: [[dfs|DFS]], [[recursion|재귀 함수]], [[queue-deque|큐와 덱]], [[data-structures|기초 자료구조(CS50)]], [[abstract-data-type|추상 자료형 (ADT)]]
