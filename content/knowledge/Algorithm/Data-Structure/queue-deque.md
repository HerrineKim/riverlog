---
title: "큐와 덱"
concept: "Queue"
summary: "먼저 넣은 것을 먼저 꺼내는 큐(FIFO)와, 양쪽 끝에서 넣고 뺄 수 있는 덱."
tags: ["data-structure", "queue", "deque", "python"]
source: til
---

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

### 파이썬에서 큐 쓰기

리스트로도 큐를 흉내 낼 수 있지만, `list.pop(0)`은 뒤의 원소를 모두 한 칸씩 당기므로 **O(n)**이다. 원소가 많으면 매우 느려진다.

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

> 참고: C++의 `std::deque`는 인덱스 접근이 O(1)인 등 구현이 다르다. 파이썬에서 임의 위치를 자주 읽어야 한다면 리스트가 낫고, 양 끝에서 넣고 빼는 일이 많다면 덱이 낫다.

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

### 활용

- 앞뒤 양쪽에서 넣고 빼야 하는 경우 (회전, 슬라이딩 윈도우 최댓값, 0-1 BFS)
- 파이썬에서 큐가 필요할 때의 기본 선택

## 핵심 정리

- 큐 = FIFO, 덱 = 양쪽 끝에서 삽입·삭제
- 파이썬에서 큐는 `list.pop(0)`(O(n)) 대신 `deque.popleft()`(O(1))를 쓴다.
- `deque`는 양 끝 연산이 O(1)이지만 중간 접근은 O(n)이다.
