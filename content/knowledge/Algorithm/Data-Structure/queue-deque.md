---
title: "큐와 덱"
concept: "Queue"
summary: "먼저 넣은 것을 먼저 꺼내는 큐(FIFO)와 양쪽 끝에서 넣고 뺄 수 있는 덱, 스택 두 개로 큐·큐로 스택 만들기, 구현에 따라 달라지는 덱의 임의 접근 비용."
tags: ["data-structure", "queue", "deque", "python"]
source: mixed
date: "2026-10-14"
sources: ["https://80000coding.notion.site/6b362391f808445f8e5f1e1f017c1bfb", "https://bytebytego.com/guides/explaining-the-4-most-commonly-used-types-of-queues-in-a-single-diagram", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/ds.md", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/etc.md"]
---

> 원형 버퍼로 덱을 만드는 부분은 팔만코딩경(42Seoul 커뮤니티 위키)의 「[push_swap] Linked List 말고 Circular Queue를 이용하여 Stack을 구현해보자!」를 바탕으로 보강했다. 시스템에서 쓰는 큐의 네 가지 종류는 ByteByteGo의 System Design 101 가이드 「[Explaining the 4 Most Commonly Used Types of Queues](https://bytebytego.com/guides/explaining-the-4-most-commonly-used-types-of-queues-in-a-single-diagram)」로 보강했다.
> 스택·큐로 서로를 만드는 방법과 덱의 임의 접근 구조는 fru1tworld/cs-basic 모의 면접 질문 목록의 「[자료구조](https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/ds.md)」, 「[기타](https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/etc.md)」 질문이 묻는 개념으로 보강했다.

## 큐 (Queue)

![큐](/images/til/Algorithm/%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%9C%EB%85%90/09-%ED%81%90-%EB%8D%B1-queue-deque-.assets/images-2Fnnnyeong-2Fpost-2F3244e9fd-82e5-4c52-bef4-dee97640e246-2Fimage.png)

큐는 한쪽 끝(`rear`)에서 넣고 반대쪽 끝(`front`)에서 꺼내는 자료구조다. 줄 서기처럼 **먼저 들어온 것이 먼저 나가는(FIFO, First In First Out)** 구조다. 꺼내기 전에는 큐가 비어 있는지(empty), 넣기 전에는 가득 찼는지(full)를 확인해야 한다.

### 선형 큐와 원형 큐

배열로 큐를 만들 때는 두 가지 방식이 있다.

- **선형 큐**: `front`와 `rear`가 증가하기만 한다. 앞쪽 원소를 꺼내 공간이 비어도 `rear`가 배열 끝에 닿으면 더 넣을 수 없다. 빈 공간을 쓰려면 원소를 앞으로 옮겨야 한다.
- **원형 큐**: 배열의 끝과 처음을 이어 붙인 것처럼 인덱스를 `% MAX_SIZE`로 순환시킨다.
  - `front`: 첫 원소의 바로 앞, `rear`: 마지막 원소를 가리킨다.
  - 비어 있음: `front == rear`
  - 가득 참: `front == (rear + 1) % MAX_SIZE`
  - 두 상태를 구분하기 위해 한 칸을 비워 둔다.

### 시간 복잡도와 특징

- 삽입(enqueue)·삭제(dequeue)는 `front`, `rear` 위치에서 바로 이뤄지므로 O(1)
- 중간 원소에는 접근하지 않는다.

### 활용

- 들어온 순서대로 처리해야 하는 작업(대기열, 프린터 작업, 프로세스 스케줄링)
- **BFS**: 가까운 노드부터 차례로 방문

### 스택으로 큐, 큐로 스택 만들기

**스택 두 개로 큐**를 만들 수 있다. 넣을 때는 `in` 스택에 push한다. 꺼낼 때 `out` 스택이 비어 있으면 `in`의 원소를 모두 옮겨 담는다. 옮기면서 순서가 뒤집혀 가장 먼저 들어온 원소가 `out`의 top에 온다.

```python
class TwoStackQueue:
    def __init__(self):
        self.inbox, self.outbox = [], []

    def enqueue(self, x):
        self.inbox.append(x)

    def dequeue(self):
        if not self.outbox:                  # 비었을 때만 한꺼번에 옮긴다
            while self.inbox:
                self.outbox.append(self.inbox.pop())
        return self.outbox.pop()
```

옮기는 순간의 dequeue 한 번은 O(n)이지만, **원소 하나는 `in`에 한 번, `out`에 한 번만 들어간다.** 그래서 n번 연산의 총비용이 O(n)이고 연산당 **분할 상환 O(1)** 이다. `out`이 비지 않았는데 옮기면 순서가 섞이므로 「비었을 때만」이 핵심이다.

**큐로 스택**을 만들 때는 push와 pop 중 하나가 O(n)이 된다. 큐는 앞뒤를 뒤집는 연산이 없어 분할 상환으로도 둘 다 O(1)로 만들 수 없다.

| 방식 | push | pop |
| --- | --- | --- |
| push를 비싸게 | 새 원소를 빈 큐 q2에 넣고 q1의 원소를 모두 q2로 옮긴 뒤 q1·q2를 바꾼다. 큐 앞이 늘 최신 원소다. O(n) | 앞에서 꺼낸다. O(1) |
| pop을 비싸게 | q1 뒤에 넣는다. O(1) | 마지막 하나만 남기고 q1의 원소를 q2로 옮긴 뒤, 남은 것을 꺼내고 q1·q2를 바꾼다. O(n) |
| 큐 하나 | 뒤에 넣은 뒤 앞의 원소 n-1개를 꺼내 다시 뒤에 넣어(회전) 새 원소를 앞으로 보낸다. O(n) | 앞에서 꺼낸다. O(1) |

### 파이썬에서 큐 쓰기

리스트로도 큐를 흉내 낼 수 있지만, `list.pop(0)`은 뒤의 원소를 모두 한 칸씩 당기므로 **O(n)이다**. 원소가 많으면 매우 느려진다.

```python
queue = [4, 5, 6]
queue.append(7)
queue.pop(0)  # 4, 하지만 O(n)
```

그래서 파이썬에서는 `collections.deque`를 큐로 쓴다.

```python
from collections import deque

queue = deque([4, 5, 6])
queue.append(7)       # rear에 삽입, O(1)
print(queue.popleft())  # 4, front에서 삭제, O(1)
```

## 덱 (Deque)

![덱](/images/til/Algorithm/%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%9C%EB%85%90/09-%ED%81%90-%EB%8D%B1-queue-deque-.assets/images-2Fnnnyeong-2Fpost-2Fc412c1f6-9cf2-4fe2-b1c6-b166e2a58c99-2Fimage.png)

덱(Deque)은 **Double-Ended Queue**의 줄임말로, 앞(`front`)과 뒤(`rear`) **양쪽에서 모두** 삽입과 삭제가 가능한 자료구조다. 덱 하나로 스택(한쪽만 사용)과 큐(양쪽을 나눠 사용)를 모두 표현할 수 있다.

### 파이썬 `collections.deque`의 특성

파이썬의 `deque`는 고정 크기 블록들을 **양방향 연결 리스트**로 이어 붙인 구조다. 그래서

| 연산 | 시간 복잡도 |
| --- | --- |
| `append`, `appendleft`, `pop`, `popleft` | O(1) |
| 양 끝 근처 인덱스 접근 (`d[0]`, `d[-1]`) | O(1) |
| 중간 인덱스 접근·삽입·삭제 (`d[i]`, `insert`, `del`) | O(n) |

파이썬에서 임의 위치를 자주 읽어야 한다면 리스트가 낫고, 양 끝에서 넣고 빼는 일이 많다면 덱이 낫다.

### 덱의 임의 접근이 O(1)이 되는 구조

덱이라는 이름은 연산 목록일 뿐이라 **임의 접근(`d[i]`) 비용은 구현이 정한다.** 연결 리스트로만 이으면 O(n)이고, 원소 위치를 산술로 계산할 수 있는 배열 기반 구조면 O(1)이다.

| 구현 | 구조 | `d[i]` |
| --- | --- | --- |
| C++ `std::deque` | 고정 크기 블록 여러 개 + 블록 주소를 담은 포인터 배열(map) | O(1). 첫 원소가 블록 안 오프셋 s에 있고 블록 크기가 B면 `map[(s + i) / B][(s + i) % B]`로 두 번만 따라간다 |
| Rust `VecDeque`, 아래의 원형 버퍼 덱 | 배열 하나를 원형으로 쓴다 | O(1). `data[(front + i) % cap]` |
| Java `ArrayDeque` | 원형 배열 | 구조상 O(1)이지만 인덱스로 읽는 메서드를 두지 않는다 |
| Python `collections.deque` | 64칸 블록의 이중 연결 리스트 | 블록을 따라가야 해 양 끝에서 멀수록 느리다. 가운데는 O(n) |

C++ `std::deque`는 앞에 넣을 때 맨 앞 블록에 빈칸이 없으면 **새 블록 하나를 앞에 붙이고 map에 주소만 추가**한다. 기존 원소는 움직이지 않는다. map이 꽉 차면 map(포인터 배열)만 더 큰 배열로 옮긴다. 그래서 양 끝 삽입은 O(1)이고, `std::vector`와 달리 양 끝에 넣어도 기존 원소를 가리키는 참조가 무효화되지 않는다(반복자는 무효화된다). 블록이 흩어져 있어 연속 메모리인 `vector`보다 순회가 조금 느리다.

`deque(maxlen=n)`으로 만들면 크기가 n을 넘을 때 반대쪽 원소가 자동으로 밀려나서, 최근 n개만 유지하는 버퍼로도 쓸 수 있다.

### 사용 예

```python
from collections import deque

d = deque()

for i in range(10):
    d.append(i)          # 오른쪽에 삽입
print(d)  # deque([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

d.appendleft(10)         # 왼쪽에 삽입
print(d)  # deque([10, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

d.insert(5, 11)          # 중간 삽입 (O(n))
print(d)  # deque([10, 0, 1, 2, 3, 11, 4, 5, 6, 7, 8, 9])

d.extend([0, 0, 0])      # 오른쪽에 여러 개 이어 붙이기
d.extendleft([0, 0, 0])  # 왼쪽에 여러 개 (하나씩 appendleft하므로 순서가 뒤집힘)

for _ in range(10):
    d.pop()              # 오른쪽에서 삭제 (스택처럼)
for _ in range(3):
    d.popleft()          # 왼쪽에서 삭제 (큐처럼)
print(d)  # deque([10, 0, 1, 2, 3])

d.rotate(1)              # 오른쪽으로 한 칸 회전
print(list(d))  # [3, 10, 0, 1, 2]
```

### 원형 버퍼로 덱 직접 만들기

C처럼 표준 덱이 없는 환경에서는 양방향 연결 리스트 대신 **배열 하나를 원형으로 쓰는 덱(ring buffer)** 이 간단하다. 최대 원소 수를 미리 알 수 있다면(예: 입력 개수만큼만 담긴다) 노드 할당·해제가 없어 메모리 누수 걱정도 없다.

- 인덱스를 `% capacity`로 순환시킨다. 앞으로 한 칸은 `(i + capacity - 1) % capacity`, 뒤로 한 칸은 `(i + 1) % capacity`. `i - 1`을 그대로 쓰면 0에서 음수 인덱스가 된다.
- `front`·`rear`만으로는 비었을 때와 꽉 찼을 때가 같은 모양이 된다. 위의 원형 큐처럼 한 칸을 비워 두거나, **원소 수 `len`을 따로 들고 다니면** 구분이 쉽다.
- pop은 값을 지우지 않고 인덱스만 옮긴다. 남은 값은 다음 push가 덮어쓴다.

```c
typedef struct { int *data; int cap, front, len; } t_deque;

int  idx(t_deque *d, int k) { return (d->front + k) % d->cap; }  /* k번째 원소 위치 */

void push_front(t_deque *d, int v) { d->front = (d->front + d->cap - 1) % d->cap; d->data[d->front] = v; d->len++; }
void push_back(t_deque *d, int v)  { d->data[idx(d, d->len)] = v; d->len++; }
int  pop_front(t_deque *d) { int v = d->data[d->front]; d->front = (d->front + 1) % d->cap; d->len--; return v; }
int  pop_back(t_deque *d)  { d->len--; return d->data[idx(d, d->len)]; }
```

호출 전에 `len == 0`(비었음), `len == cap`(가득 참)을 확인한다. 모든 연산이 O(1)이고, k번째 원소도 `idx(d, k)`로 O(1)에 읽을 수 있다.

### 활용

- 앞뒤 양쪽에서 넣고 빼야 하는 경우 (회전, 슬라이딩 윈도우 최댓값, 0-1 BFS)
- 파이썬에서 큐가 필요할 때의 기본 선택

## 시스템에서 쓰는 큐 네 가지

| 종류 | 동작 | 시스템에서의 예 |
| --- | --- | --- |
| FIFO 큐 | 뒤에 넣고 앞에서 꺼낸다 | 결제 결과가 온 순서대로 알림 메일을 보낸다. 메시지 큐의 기본 모양이다 |
| 원형 큐(링 버퍼) | 고정 크기 배열의 끝과 처음을 잇는다. 메모리를 새로 할당하지 않는다 | 저지연 시스템의 스레드 간 통신. 금융 거래 시스템의 LMAX Disruptor가 링 버퍼로 컴포넌트끼리 메시지를 주고받는다. 오디오·네트워크 버퍼, 최근 N개 로그 보관 |
| 우선순위 큐 | 들어온 순서가 아니라 우선순위가 높은 것부터 꺼낸다. 보통 힙으로 구현한다 | 응급실 환자 분류, 작업 스케줄러, 다익스트라. [[heap-priority-queue\|힙과 우선순위 큐]] |
| 덱 | 양 끝에서 넣고 뺀다. FIFO와 LIFO를 모두 흉내 낸다 | 작업 훔치기(work stealing) 스케줄러, 슬라이딩 윈도 최댓값, 실행 취소 기록 |

여러 서비스 사이에서 메시지를 주고받는 분산 큐는 [[message-queue-kafka|메시지 큐와 Kafka]]에 있다.

## 핵심 정리

- 큐 = FIFO, 덱 = 양쪽 끝에서 삽입·삭제
- 파이썬에서 큐는 `list.pop(0)`(O(n)) 대신 `deque.popleft()`(O(1))를 쓴다.
- `deque`는 양 끝 연산이 O(1)이지만 중간 접근은 O(n)이다.

관련 노트: [[bfs|BFS]], [[stack|스택]], [[heap-priority-queue|힙과 우선순위 큐]], [[data-structures|기초 자료구조(CS50)]], [[virtual-waiting-room|대기열 시스템(가상 대기실) 설계]], [[abstract-data-type|추상 자료형 (ADT)]]
