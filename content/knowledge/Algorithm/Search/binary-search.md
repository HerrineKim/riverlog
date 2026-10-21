---
title: "이분 탐색"
concept: "Binary Search"
summary: "정렬된 데이터에서 탐색 범위를 절반씩 줄여 O(log n)에 원하는 값을 찾는 방법. 앞에서부터 하나씩 보는 순차 탐색과 어느 쪽을 고를지도 다룬다."
tags: ["algorithm", "search", "binary-search", "python"]
source: mixed
date: "2026-10-14"
sources: ["https://app.notion.com/p/5123d6bb8d37456c9a741fb74e8e87e0"]
---

> 순차 탐색과 고르는 기준은 하버드 CS50(부스트코스) 4강(알고리즘)과 고무오리 CS 스터디의 CS50 정리 노트를 바탕으로 보강했다.

![순차 탐색과 이분 탐색 비교](/images/til/Algorithm/%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%9C%EB%85%90/05-%EC%9D%B4%EB%B6%84-%ED%83%90%EC%83%89-Binary-Search-.assets/binary-and-linear-search-animations.gif)

이분 탐색(이진 탐색, Binary Search)은 **정렬되어 있는** 리스트에서 탐색 범위를 절반씩 좁혀 가며 데이터를 찾는 방법이다. 앞에서부터 하나씩 보는 순차 탐색이 O(n)인 데 비해, 이분 탐색은 매 단계 범위가 반으로 줄어 **O(log n)이다**. 100만 개 중에서도 약 20번 비교면 충분하다.

## 순차 탐색과 비교

**순차 탐색(선형 탐색, Linear Search)**은 첫 원소부터 끝까지 하나씩 비교한다. 정렬 여부와 상관없이 쓸 수 있고, 찾으면 바로 멈춘다.

```python
def linear_search(arr, target):
    for i, x in enumerate(arr):
        if x == target:
            return i
    return None
```

| | 순차 탐색 | 이분 탐색 |
| --- | --- | --- |
| 전제 | 없음 | 정렬되어 있어야 함 |
| 최악 (상한) | O(n) | O(log n) |
| 최선 (하한) | Ω(1), 첫 원소가 답 | Ω(1), 가운데 원소가 답 |
| 적합한 경우 | 정렬되지 않은 데이터, 한두 번만 찾을 때, 원소가 적을 때 | 같은 데이터에서 여러 번 찾을 때 |

정렬에 O(n log n)이 들기 때문에 **한 번만 찾는다면 정렬 후 이분 탐색보다 순차 탐색이 싸다.** 찾는 횟수가 많아지면 한 번 정렬해 두고 이분 탐색하는 쪽이 이긴다. 이름·전화번호처럼 여러 필드를 묶은 레코드는 구조체(또는 객체) 배열로 두고 키 필드를 비교해 찾는다.

## 동작 방식

`start`, `end`, `mid` 세 변수를 쓴다.

1. `mid = (start + end) // 2` 위치의 값을 찾는 값(target)과 비교한다.
2. 같으면 찾은 것이다.
3. `mid` 값이 target보다 크면 왼쪽 절반(`end = mid - 1`), 작으면 오른쪽 절반(`start = mid + 1`)만 남긴다.
4. `start > end`가 되면 값이 없는 것이다.

**전제 조건: 데이터가 정렬되어 있어야 한다.** 정렬되지 않았다면 먼저 정렬(O(n log n))해야 한다.

## 반복문 구현

```python
def binary_search(array, target):
    start, end = 0, len(array) - 1
    while start <= end:
        mid = (start + end) // 2
        if array[mid] == target:
            return mid
        elif array[mid] > target:
            end = mid - 1     # 왼쪽 절반 확인
        else:
            start = mid + 1   # 오른쪽 절반 확인
    return None


array = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
result = binary_search(array, 7)
print("원소가 없음" if result is None else result + 1)  # 4 (몇 번째인지)
```

## 재귀 구현

```python
def binary_search(array, target, start, end):
    if start > end:
        return None
    mid = (start + end) // 2
    if array[mid] == target:
        return mid
    if array[mid] > target:
        return binary_search(array, target, start, mid - 1)
    return binary_search(array, target, mid + 1, end)
```

## 파이썬 `bisect` 라이브러리

정렬된 리스트에서 값을 **삽입할 위치**를 이분 탐색으로 찾아 준다.

- `bisect_left(a, x)`: 정렬을 유지하며 x를 넣을 수 있는 **가장 왼쪽** 인덱스
- `bisect_right(a, x)`: 정렬을 유지하며 x를 넣을 수 있는 **가장 오른쪽** 인덱스

```python
from bisect import bisect_left, bisect_right

a = [1, 2, 4, 4, 8]
print(bisect_left(a, 4))   # 2
print(bisect_right(a, 4))  # 4

# 값이 [left, right] 범위에 있는 원소의 개수
def count_by_range(a, left, right):
    return bisect_right(a, right) - bisect_left(a, left)

print(count_by_range(a, 4, 4))  # 2
```

## 파라메트릭 서치 (Parametric Search)

"조건을 만족하는 값 중 최댓값/최솟값을 구하라" 같은 **최적화 문제를 예/아니오로 답하는 결정 문제로 바꿔** 이분 탐색으로 푸는 기법이다. 데이터 배열 자체가 아니라 **답의 범위**를 이분 탐색한다.

예: 떡을 높이 H로 잘랐을 때 잘린 떡의 합이 M 이상이 되는 가장 높은 H 구하기

```python
def max_cut_height(heights, m):
    start, end = 0, max(heights)
    result = 0
    while start <= end:
        mid = (start + end) // 2
        total = sum(h - mid for h in heights if h > mid)
        if total >= m:      # 조건 만족 → 더 높여 본다
            result = mid
            start = mid + 1
        else:               # 부족 → 낮춘다
            end = mid - 1
    return result

print(max_cut_height([19, 15, 10, 17], 6))  # 15
```

답의 범위가 10억처럼 커도 약 30번만 판정하면 된다.

## 핵심 정리

- 정렬된 데이터에서만 사용, 시간 복잡도 O(log n)
- 경계 조건(`start <= end`, `mid ± 1`)을 정확히 지키는 것이 핵심
- 파이썬에서는 `bisect`로 간단히 구현할 수 있다.
- 답의 범위를 이분 탐색하는 파라메트릭 서치로 최적화 문제도 풀 수 있다.

관련 노트: [[divide-and-conquer|분할 정복]], [[big-o|빅오 표기법]], [[longest-increasing-subsequence|최장 증가 부분 수열]], [[tree|이진 탐색 트리]]
