---
title: "기본 정렬: 버블·선택·삽입·셸·계수·기수 정렬"
concept: "Elementary Sorts"
summary: "구현이 단순한 O(n²) 비교 정렬 세 가지와 입력 상태에 따른 실제 속도 비교, 간격을 줄여 가며 삽입 정렬하는 셸 정렬, 비교 없이 정렬하는 계수 정렬·기수 정렬(LSD·MSD)."
tags: ["algorithm", "sorting", "complexity", "python"]
source: til
date: "2026-10-14"
sources: ["https://github.com/jbee37142/Interview_Question_for_Beginner/blob/main/Algorithm/README.md", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/ds.md", "고려사이버대학교 컴퓨터 알고리즘 강의(마채원 교수, 2024-2학기)"]
---

> 기수 정렬 절은 jbee의 「[Interview Question for Beginner](https://github.com/jbee37142/Interview_Question_for_Beginner)」 알고리즘 문서를 바탕으로 보강했다.
> 세 O(n²) 정렬의 실제 속도 비교는 fru1tworld/cs-basic 모의 면접 질문 목록의 「[자료구조](https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/ds.md)」 질문이 묻는 개념으로 보강했다.
> 셸 정렬 절은 고려사이버대학교 「컴퓨터 알고리즘」(2024-2학기) 강의 내용으로 보강했다.

정렬 알고리즘의 성능은 보통 빅오 표기법으로 최선·평균·최악의 경우를 나눠 비교한다. 이 노트의 버블·선택·삽입 정렬은 원리가 단순한 대신 평균 O(n²)이라 데이터가 많으면 느리다. 계수 정렬은 비교 없이 개수를 세서 O(n + k)에, 기수 정렬은 자릿수마다 계수 정렬을 반복해 O(d·(n + b))에 정렬한다.

## 버블 정렬 (Bubble Sort)

인접한 두 원소를 비교해 순서가 틀리면 자리를 바꾸는 과정을 반복한다. 한 바퀴를 돌 때마다 가장 큰 값이 거품처럼 맨 뒤로 떠오른다.

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

남은 원소 중 가장 작은 값을 찾아 맨 앞으로 보내는 과정을 반복한다.

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

두 번째 원소부터 시작해, 앞쪽의 이미 정렬된 부분에서 자기 자리를 찾아 끼워 넣는다. 카드를 한 장씩 받아 손에 든 카드 사이에 끼워 넣는 방식과 같다.

```python
def insertion_sort(arr):
    for end in range(1, len(arr)):
        i = end
        while i > 0 and arr[i - 1] > arr[i]:
            arr[i - 1], arr[i] = arr[i], arr[i - 1]
            i -= 1
```

- 시간 복잡도: 평균·최악 O(n²), 최선 O(n)
  - 이미 거의 정렬된 데이터라면 원소마다 비교 한두 번으로 끝나 O(n)에 가깝게 동작한다. O(n)은 최선의 경우일 뿐, 일반적인 입력에서는 O(n²)이다.
- 안정 정렬. 데이터가 적거나 거의 정렬되어 있을 때 매우 효율적이라, 파이썬의 Timsort도 작은 구간에 삽입 정렬을 쓴다.

## 셸 정렬 (Shell Sort)

삽입 정렬은 거의 정렬된 입력에서 빠르지만, 멀리 떨어진 원소는 **한 번에 한 칸씩만** 움직여 느리다. 셸 정렬은 이 약점을 고친 삽입 정렬이다. 간격 h만큼 떨어진 원소끼리 묶어 삽입 정렬하고, h를 줄여 가며 반복한 뒤 **마지막에 h = 1로 보통의 삽입 정렬**을 한다. 앞 단계에서 원소들이 이미 제자리 근처로 크게 옮겨져 있어 마지막 삽입 정렬이 빨리 끝난다.

```python
def shell_sort(arr):
    gap = 1
    while gap < len(arr) // 3:
        gap = 3 * gap + 1          # 1, 4, 13, 40, ... (Knuth 수열)
    while gap >= 1:
        for end in range(gap, len(arr)):
            item, i = arr[end], end
            while i >= gap and arr[i - gap] > item:
                arr[i] = arr[i - gap]
                i -= gap
            arr[i] = item
        gap //= 3
```

- 시간 복잡도는 **간격 수열에 달려 있다.** 반씩 줄이는 수열(n/2, n/4, …, 1)은 최악 O(n²), Knuth 수열(3h + 1)은 최악 O(n^1.5)이고, 실험으로 찾은 Ciura 수열(1, 4, 10, 23, 57, 132, …)이 실제로 가장 빠른 편으로 알려져 있다.
- 추가 공간 O(1)인 제자리 정렬이다. 멀리 떨어진 원소를 맞바꾸므로 **불안정 정렬**이다.
- 재귀도 보조 배열도 없어 코드가 짧다. 중간 크기 입력이나 메모리가 빠듯한 임베디드 환경에서 쓴다.

## 계수 정렬 (Counting Sort)

원소끼리 비교하지 않고, 각 값이 몇 번 등장했는지 세어 그 개수만큼 출력한다. 값의 범위가 0 ~ k로 작은 정수일 때 쓴다.

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

원소에 다른 데이터가 딸려 있어 안정성을 지켜야 할 때는 누적합으로 각 값의 최종 위치를 계산한 뒤 뒤에서부터 배치한다.

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

## 기수 정렬 (Radix Sort)

값 전체가 아니라 자릿수(기수, radix) 하나씩 안정 정렬을 반복한다. 자릿수마다 0~9 같은 작은 범위만 다루므로 각 단계는 계수 정렬로 O(n + b)에 끝난다(b = 기수의 종류 수). 자릿수가 d개면 전체는 O(d·(n + b))다.

| 방식 | 순서 | 특징 |
| --- | --- | --- |
| LSD(Least Significant Digit) | 일의 자리부터 위로 | 단계마다 **안정 정렬**이어야 앞 자리 결과가 유지된다. 모든 자리를 다 돌아야 결과가 나온다. 구현이 단순해 보통 기수 정렬이라 하면 LSD다 |
| MSD(Most Significant Digit) | 가장 높은 자리부터 아래로 | 버킷으로 나눈 뒤 버킷 안을 재귀로 정렬한다. 앞 자리만으로 갈리면 일찍 끝나 문자열 사전순 정렬에 맞지만 버킷 관리에 메모리가 더 든다 |

```python
def radix_sort_lsd(arr):          # 음이 아닌 정수
    exp = 1
    while max(arr) // exp > 0:
        buckets = [[] for _ in range(10)]
        for x in arr:             # 넣은 순서를 지키므로 안정적이다
            buckets[(x // exp) % 10].append(x)
        arr = [x for b in buckets for x in b]
        exp *= 10
    return arr

print(radix_sort_lsd([170, 45, 75, 90, 802, 24, 2, 66]))
# [2, 24, 45, 66, 75, 90, 170, 802]
```

- 비교 정렬의 하한 O(n log n)을 넘을 수 있지만, 자릿수 d가 작고 고정된 키(정수, 같은 길이 문자열)에서만 이득이다. 길이가 제각각이면 짧은 키를 채우는 처리가 필요하다.
- 음수는 부호를 따로 처리하고, 부동소수점은 비트 표현을 변환해야 한다.

## 한눈에 비교

버블·선택·삽입은 O(n²), 셸 정렬은 간격 수열에 따라 O(n^1.5) 안팎, 계수 정렬은 O(n + k), 기수 정렬은 O(d·(n + b))이고, 선택 정렬과 셸 정렬이 불안정 정렬이다.

세 O(n²) 정렬은 빅오가 같아도 실제 속도가 다르다. 차이는 비교 횟수, 원소를 옮기는(쓰는) 횟수, 입력의 정렬 정도에 반응하는가에서 나온다. 아래에서 역순쌍(inversion)은 `i < j`인데 `a[i] > a[j]`인 쌍의 수이고, 무작위 입력이면 평균 n²/4개다.

| | 버블 | 선택 | 삽입 |
| --- | --- | --- | --- |
| 비교 횟수 | 약 n²/2(조기 종료가 있으면 줄어든다) | 입력과 무관하게 항상 n(n-1)/2 | 평균 약 n²/4, 역순쌍 수 + n 정도 |
| 교환·이동 횟수 | 역순쌍 수만큼 교환. 교환 한 번이 쓰기 3번이다 | 최대 n-1번 | 역순쌍 수만큼 한 칸 밀기 |
| 이미 정렬된 입력 | 조기 종료가 있으면 한 바퀴, O(n) | O(n²) 그대로 | 원소마다 비교 한 번, O(n) |
| 거의 정렬된 입력 | 큰 값은 한 바퀴에 끝까지 가지만, 뒤쪽의 작은 값은 한 바퀴에 한 칸씩만 앞으로 와서 바퀴 수가 늘 수 있다 | O(n²) 그대로 | O(n + 역순쌍 수)로 가장 빠르다 |
| 실제 속도 | 셋 중 가장 느리다 | 비교가 많지만 쓰기가 가장 적어, 쓰기가 비싼 저장 매체에서만 이점이 있다 | 셋 중 가장 빠르다. 작은 구간에서 퀵·병합 정렬보다도 빨라 팀소트·인트로 정렬이 작은 구간을 맡긴다 |

정리하면 무작위 입력에서는 **삽입 > 선택 > 버블** 순으로 빠르고, 입력이 거의 정렬돼 있을수록 삽입 정렬의 이점이 커진다. 선택 정렬만 입력 상태에 전혀 반응하지 않는다. 병합·퀵 정렬까지 포함한 복잡도·안정성 비교표는 [[merge-quick-sort|병합 정렬과 퀵 정렬]]에 하나로 모았다.

**안정 정렬**이란 값이 같은 원소들의 원래 순서가 정렬 후에도 유지되는 정렬이다.

## 핵심 정리

- 버블·선택·삽입은 O(n²), 작은 입력이나 학습용
- 삽입 정렬은 거의 정렬된 데이터에서 O(n)에 가깝다.
- 셸 정렬은 간격을 줄여 가며 삽입 정렬을 반복해 멀리 있는 원소를 빨리 옮긴다. 성능은 간격 수열이 정한다.
- 값의 범위가 작은 정수라면 계수 정렬이 O(n + k)로 가장 빠르다.
- 자릿수가 고정된 키는 기수 정렬(LSD)로 자릿수마다 안정 정렬을 반복한다.

관련 노트: [[big-o|빅오 표기법]], [[merge-quick-sort|병합 정렬과 퀵 정렬]], [[merge-insertion-sort|병합 삽입 정렬(이진 삽입)]]
