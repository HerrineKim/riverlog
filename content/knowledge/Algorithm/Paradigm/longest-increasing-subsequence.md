---
title: "최장 증가 부분 수열 (LIS)"
concept: "LIS"
summary: "수열에서 순서를 지키며 고른 증가 부분 수열 중 가장 긴 것을 구하는 문제. O(n²) DP, 이분 탐색으로 길이를 구하는 O(n log n) 방법, 실제 수열까지 복원하는 방법."
tags: ["algorithm", "dp", "binary-search", "python"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/aaed48853f144848b41681d9ee59a60f"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「최장 증가 부분 수열(Longest Increasing Subsequence)」을 바탕으로 재구성한 노트다.

## LIS란

부분 수열(subsequence)은 원래 순서를 유지한 채 원소를 몇 개 골라 만든 수열이다. 연속할 필요는 없다. 그중 **값이 순증가하는 가장 긴 것**이 최장 증가 부분 수열(Longest Increasing Subsequence)이다.

```text
수열:  3  1  2  7  4  8  5  9
LIS:      1  2     4     5  9    → 길이 5  (1 2 7 8 9 도 길이 5)
```

LIS는 하나로 정해지지 않을 수 있다. 문제는 보통 **길이**를 묻거나, 그중 하나를 출력하라고 한다. [[dynamic-programming|동적 계획법]]의 대표 예제이자, [[binary-search|이분 탐색]]으로 최적화하는 고전 문제다.

## 방법 1: DP — O(n²)

`dp[i]` = **i번째 원소로 끝나는** 증가 부분 수열의 최대 길이로 정의한다.

```text
dp[i] = 1 + max(dp[j])   (j < i 이고 a[j] < a[i]인 모든 j, 없으면 0)
답    = max(dp)
```

```python
def lis_length_dp(a):
    dp = [1] * len(a)
    for i in range(len(a)):
        for j in range(i):
            if a[j] < a[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp, default=0)
```

"i로 끝나는"이라는 조건을 붙이는 것이 핵심이다. 그래야 다음 원소를 이어 붙일 수 있는지 마지막 값만 보고 판단할 수 있다. n이 수천 이하일 때 쓴다.

## 방법 2: 이분 탐색 — O(n log n)

`tails[k]` = **길이 k+1인 증가 부분 수열들의 마지막 값 중 가장 작은 것**을 유지한다. 끝 값이 작을수록 뒤에 더 많은 원소를 이어 붙일 수 있으므로, 같은 길이라면 끝이 작은 쪽만 기억하면 된다. `tails`는 항상 증가 상태라 이분 탐색이 가능하다.

각 원소 x에 대해

1. x가 `tails`의 마지막 값보다 크면 뒤에 붙인다. 가장 긴 수열이 1 늘어난다.
2. 아니면 `tails`에서 **x 이상인 첫 위치**(lower bound)를 x로 바꾼다. 그 길이의 끝 값을 더 작게 갱신하는 것이다.

```python
from bisect import bisect_left

def lis_length(a):
    tails = []
    for x in a:
        i = bisect_left(tails, x)   # x 이상인 첫 위치 (C++의 lower_bound)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)
```

```text
x:      3    1    2    7    4    8    5    9
tails: [3] [1] [1,2] [1,2,7] [1,2,4] [1,2,4,8] [1,2,4,5] [1,2,4,5,9]
```

**주의**: 최종 `tails`는 LIS가 아니다. 길이만 맞다. 위 예에서는 우연히 LIS와 같지만, `[2, 5, 1]`이면 `tails`는 `[1, 5]`가 되어 원래 순서를 어긴다.

- 순증가 대신 **비내림차순(같은 값 허용)** 부분 수열을 원하면 `bisect_left` 대신 `bisect_right`를 쓴다.
- 감소 부분 수열은 부호를 뒤집어 같은 함수를 쓴다.

## 방법 3: 실제 수열 복원 — O(n log n)

원소마다 **`tails`의 몇 번째 자리에 들어갔는지**(= 그 원소로 끝나는 LIS 길이 − 1)를 기록해 둔다. 끝에서부터 거꾸로 훑으며 필요한 자리 번호를 하나씩 줄여 가며 고르면 실제 LIS가 나온다.

```python
from bisect import bisect_left

def lis(a):
    tails, pos = [], []
    for x in a:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
        pos.append(i)               # x가 들어간 자리 기록

    need = len(tails) - 1
    result = []
    for x, p in zip(reversed(a), reversed(pos)):
        if p == need:               # 뒤에서부터 자리 번호가 맞는 원소를 고른다
            result.append(x)
            need -= 1
    return result[::-1]

print(lis([3, 1, 2, 7, 4, 8, 5, 9]))  # [1, 2, 4, 5, 9]
```

뒤에서부터 고르면 고른 원소의 값이 이전에 고른 것보다 항상 작다. 같은 자리 번호에 나중에 들어간 원소일수록 값이 작거나 같기 때문이다. 다른 방법으로, 원소마다 "직전 원소의 인덱스"를 `prev` 배열에 저장해 역추적해도 된다.

## 비교

| 방법 | 시간 | 얻는 것 | 쓰는 때 |
| --- | --- | --- | --- |
| DP | O(n²) | 길이, 역추적하면 수열 | n ≤ 수천, 조건이 복잡한 변형(가중치 합 최대 등) |
| 이분 탐색 | O(n log n) | 길이 | n이 10만 이상 |
| 이분 탐색 + 자리 기록 | O(n log n) | 길이와 수열 | 큰 n에서 수열 출력 |

## 정리

- LIS는 "i로 끝나는 최대 길이"로 정의하는 DP에서 출발한다: O(n²)
- 길이별 최소 끝 값 `tails`를 이분 탐색으로 갱신하면 O(n log n)이다.
- `tails` 자체는 LIS가 아니다. 수열이 필요하면 각 원소가 들어간 자리를 기록해 역추적한다.

관련 노트: [[dynamic-programming|동적 계획법]], [[binary-search|이분 탐색]], [[coding-test|코딩 테스트 접근법]]
