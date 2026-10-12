---
title: "병합 정렬과 퀵 정렬"
concept: "Merge Sort"
summary: "분할 정복으로 평균 O(n log n)에 정렬하는 두 대표 알고리즘과 정렬 알고리즘 비교."
tags: ["algorithm", "sorting", "divide-and-conquer", "python"]
source: til
---

병합 정렬과 퀵 정렬은 모두 **분할 정복**으로 리스트를 나눠 정렬한다. 차이는 실제 작업이 어디서 일어나느냐다. 병합 정렬은 **합치는 단계**에서, 퀵 정렬은 **나누는 단계**에서 정렬이 이뤄진다.

## 병합 정렬 (Merge Sort)

리스트를 **균등한 크기의 두 부분으로 나누고**, 각각을 재귀적으로 정렬한 뒤, 정렬된 두 리스트를 하나로 합친다.

```python
def merge_sort(arr):
    if len(arr) < 2:
        return arr

    mid = len(arr) // 2
    low = merge_sort(arr[:mid])
    high = merge_sort(arr[mid:])

    merged = []
    l = h = 0
    while l < len(low) and h < len(high):
        if low[l] <= high[h]:      # <= 로 비교해야 안정 정렬이 된다
            merged.append(low[l])
            l += 1
        else:
            merged.append(high[h])
            h += 1
    merged += low[l:]
    merged += high[h:]
    return merged

print(merge_sort([5, 3, 8, 1, 9, 2]))  # [1, 2, 3, 5, 8, 9]
```

- 리스트를 반씩 나누므로 깊이는 log n, 각 깊이에서 합치는 데 O(n) → **항상 O(n log n)**
- 합칠 때 추가 배열이 필요해 공간 복잡도 O(n)
- 안정 정렬. 연결 리스트 정렬이나 외부 정렬(디스크)에도 적합하다.

## 퀵 정렬 (Quick Sort)

**피벗(pivot)**을 하나 고르고, 피벗보다 작은 값과 큰 값으로 리스트를 나눈 뒤(크기가 같지 않을 수 있다), 각 부분을 재귀적으로 정렬해 이어 붙인다.

```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    lesser = [x for x in arr if x < pivot]
    equal = [x for x in arr if x == pivot]
    greater = [x for x in arr if x > pivot]
    return quick_sort(lesser) + equal + quick_sort(greater)
```

위 코드는 이해하기 쉬운 버전이라 새 리스트를 계속 만든다. 실제 구현은 배열 안에서 원소를 교환해 나누는 **제자리(in-place) 분할**을 쓴다.

```python
def quick_sort_inplace(arr, start=0, end=None):
    if end is None:
        end = len(arr) - 1
    if start >= end:
        return
    pivot = arr[start]
    left, right = start + 1, end
    while left <= right:
        while left <= end and arr[left] <= pivot:
            left += 1
        while right > start and arr[right] >= pivot:
            right -= 1
        if left > right:
            arr[right], arr[start] = arr[start], arr[right]  # 피벗을 제자리로
        else:
            arr[left], arr[right] = arr[right], arr[left]
    quick_sort_inplace(arr, start, right - 1)
    quick_sort_inplace(arr, right + 1, end)
```

- **평균 O(n log n)**: 피벗이 리스트를 대략 반씩 나눌 때
- **최악 O(n²)**: 피벗이 매번 최솟값이나 최댓값일 때(예: 이미 정렬된 데이터에서 첫 원소를 피벗으로 고르는 경우). 피벗을 무작위나 중간값으로 고르면 완화된다.
- 제자리 분할 시 추가 메모리가 적고, 캐시 효율이 좋아 실제로 매우 빠르다.
- 불안정 정렬

## 정렬 알고리즘 비교

| 정렬 | 최선 | 평균 | 최악 | 추가 공간 | 안정성 |
| --- | --- | --- | --- | --- | --- |
| 버블 | O(n) | O(n²) | O(n²) | O(1) | 안정 |
| 선택 | O(n²) | O(n²) | O(n²) | O(1) | 불안정 |
| 삽입 | O(n) | O(n²) | O(n²) | O(1) | 안정 |
| 병합 | O(n log n) | O(n log n) | O(n log n) | O(n) | 안정 |
| 퀵 | O(n log n) | O(n log n) | O(n²) | O(log n) | 불안정 |
| 힙 | O(n log n) | O(n log n) | O(n log n) | O(1) | 불안정 |
| 계수 | O(n + k) | O(n + k) | O(n + k) | O(n + k) | 안정 |

## 실전에서는

파이썬의 `sorted()`와 `list.sort()`는 병합 정렬과 삽입 정렬을 섞은 **Timsort** 계열 알고리즘으로, 최악에도 O(n log n)이고 안정 정렬이다. (Python 3.11부터는 run을 합치는 순서를 정하는 규칙만 Powersort 방식으로 바뀌었고, 기본 구조는 같다.) 코딩 테스트에서는 직접 구현하기보다 내장 정렬에 `key`를 주어 쓰는 경우가 대부분이다.

```python
students = [("kim", 90), ("lee", 85), ("park", 90)]
students.sort(key=lambda s: (-s[1], s[0]))  # 점수 내림차순, 이름 오름차순
```

## 핵심 정리

- 병합 정렬: 나누고 합치며 정렬, 항상 O(n log n), 추가 메모리 O(n), 안정
- 퀵 정렬: 피벗으로 나누며 정렬, 평균 O(n log n)·최악 O(n²), 불안정
- 실전은 내장 정렬(Timsort) + `key` 함수

관련 노트: [[divide-and-conquer|분할 정복]], [[heap-priority-queue|힙(힙 정렬)]], [[elementary-sorts|기본 정렬]], [[big-o|빅오 표기법]]
