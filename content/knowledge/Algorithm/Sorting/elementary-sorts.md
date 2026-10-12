---
title: "기본 정렬: 버블·선택·삽입·계수 정렬"
concept: "Elementary Sorts"
summary: "구현이 단순한 O(n²) 비교 정렬 세 가지와, 값의 범위가 작을 때 쓰는 계수 정렬."
tags: ["algorithm", "sorting", "complexity", "python"]
source: til
---

정렬 알고리즘의 성능은 보통 **빅오 표기법**으로 최선·평균·최악의 경우를 나눠 비교한다. 이 노트의 버블·선택·삽입 정렬은 원리가 단순한 대신 평균 O(n²)이라 데이터가 많으면 느리다. 계수 정렬은 비교 없이 개수를 세서 O(n + k)에 정렬한다.

## 버블 정렬 (Bubble Sort)

**인접한 두 원소를 비교해 순서가 틀리면 자리를 바꾸는** 과정을 반복한다. 한 바퀴를 돌 때마다 가장 큰 값이 거품처럼 맨 뒤로 떠오른다.

```python
def bubble_sort(a):
    n = len(a)
    for i in range(n - 1, 0, -1):     # i: 이번 바퀴에서 확정될 마지막 위치
        swapped = False
        for j in range(i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:               # 한 번도 안 바꿨으면 이미 정렬됨
            break
```

- 시간 복잡도: O(n²) (조기 종료를 넣으면 이미 정렬된 경우 O(n))
- 안정 정렬

## 선택 정렬 (Selection Sort)

**남은 원소 중 가장 작은 값을 찾아 맨 앞으로 보내는** 과정을 반복한다.

```python
def selection_sort(arr):
    for i in range(len(arr) - 1):
        min_idx = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
```

- 시간 복잡도: 항상 O(n²) (입력 상태와 무관하게 최솟값을 끝까지 찾는다)
- 교환 횟수가 최대 n - 1번으로 적다.
- 불안정 정렬

## 삽입 정렬 (Insertion Sort)

두 번째 원소부터 시작해, **앞쪽의 이미 정렬된 부분에서 자기 자리를 찾아 끼워 넣는다.** 카드를 한 장씩 받아 손에 든 카드 사이에 끼워 넣는 방식과 같다.

```python
def insertion_sort(arr):
    for end in range(1, len(arr)):
        i = end
        while i > 0 and arr[i - 1] > arr[i]:
            arr[i - 1], arr[i] = arr[i], arr[i - 1]
            i -= 1
```

- 시간 복잡도: **평균·최악 O(n²)**, 최선 O(n)
  - 이미 거의 정렬된 데이터라면 원소마다 비교 한두 번으로 끝나 O(n)에 가깝게 동작한다. O(n)은 최선의 경우일 뿐, 일반적인 입력에서는 O(n²)이다.
- 안정 정렬. 데이터가 적거나 거의 정렬되어 있을 때 매우 효율적이라, 파이썬의 Timsort도 작은 구간에 삽입 정렬을 쓴다.

## 계수 정렬 (Counting Sort)

원소끼리 비교하지 않고, **각 값이 몇 번 등장했는지 세어** 그 개수만큼 출력한다. 값의 범위가 0 ~ k로 작은 정수일 때 쓴다.

```python
def counting_sort(arr, max_num):
    count = [0] * (max_num + 1)
    for x in arr:                 # 1) 등장 횟수 세기
        count[x] += 1

    result = []
    for value, c in enumerate(count):  # 2) 작은 값부터 개수만큼 출력
        result.extend([value] * c)
    return result

print(counting_sort([5, 2, 9, 2, 0, 7], 9))  # [0, 2, 2, 5, 7, 9]
```

원소에 다른 데이터가 딸려 있어 **안정성**을 지켜야 할 때는 누적합으로 각 값의 최종 위치를 계산한 뒤 뒤에서부터 배치한다.

```python
def counting_sort_stable(arr, max_num):
    count = [0] * (max_num + 1)
    for x in arr:
        count[x] += 1
    for i in range(1, max_num + 1):   # 누적합: count[v] = v 이하 원소의 개수
        count[i] += count[i - 1]

    result = [0] * len(arr)
    for x in reversed(arr):           # 뒤에서부터 넣어야 안정 정렬
        count[x] -= 1
        result[count[x]] = x
    return result
```

- 시간 복잡도: O(n + k) (k = 최댓값)
- 공간 복잡도: O(n + k). 값의 범위가 크면(예: 최댓값 10억) 쓸 수 없다.

## 한눈에 비교

| 정렬 | 최선 | 평균 | 최악 | 안정성 |
| --- | --- | --- | --- | --- |
| 버블 | O(n) | O(n²) | O(n²) | 안정 |
| 선택 | O(n²) | O(n²) | O(n²) | 불안정 |
| 삽입 | O(n) | O(n²) | O(n²) | 안정 |
| 계수 | O(n + k) | O(n + k) | O(n + k) | 안정(누적합 방식) |

**안정 정렬**이란 값이 같은 원소들의 원래 순서가 정렬 후에도 유지되는 정렬이다.

## 핵심 정리

- 버블·선택·삽입은 O(n²), 작은 입력이나 학습용
- 삽입 정렬은 거의 정렬된 데이터에서 O(n)에 가깝다.
- 값의 범위가 작은 정수라면 계수 정렬이 O(n + k)로 가장 빠르다.

관련 노트: [[big-o|빅오 표기법]], [[merge-quick-sort|병합 정렬과 퀵 정렬]]
