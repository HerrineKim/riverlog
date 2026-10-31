---
title: "구간 합과 접두사 합"
concept: "Prefix Sum"
summary: "앞에서부터의 누적 합을 미리 구해 두고, 임의 구간의 합을 뺄셈 한 번으로 구하는 기법. 접미사·곱 변형과 해시를 곁들여 합이 k인 부분 배열을 세는 방법."
tags: ["algorithm", "prefix-sum", "array", "python"]
source: mixed
date: "2026-10-30"
sources: ["https://www.techinterviewhandbook.org/algorithms/array/"]
---

> 「변형: 접미사, 곱, 해시」는 Tech Interview Handbook의 「[Array cheatsheet](https://www.techinterviewhandbook.org/algorithms/array/)」 전처리 절을 바탕으로 보강했다.

**구간 합 문제**는 연속으로 나열된 N개의 수에서 특정 구간 [Left, Right]의 합을 구하는 문제다. 예를 들어 {10, 20, 30, 40, 50}에서 2번째부터 4번째 수의 합은 20 + 30 + 40 = 90이다.

## 왜 필요한가

쿼리가 M개 주어질 때 매번 구간을 직접 더하면 쿼리 하나에 O(N), 전체 O(NM)이 걸린다. N, M이 각각 10만이면 100억 번 연산이라 시간 안에 끝나지 않는다. 접두사 합을 쓰면 전처리 O(N) + 쿼리당 O(1), 전체 O(N + M)으로 줄어든다.

## 접두사 합 (Prefix Sum)

배열의 맨 앞부터 i번째 원소까지의 합을 미리 계산해 `P[i]`에 저장한다. 그러면

> 구간 [Left, Right]의 합 = `P[Right] - P[Left - 1]`

이다. `P[0] = 0`을 두면 Left가 1일 때도 같은 식으로 처리할 수 있다.

![접두사 합으로 구간 합 구하기](/images/til/Algorithm/%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%9C%EB%85%90/07-%EA%B5%AC%EA%B0%84-%ED%95%A9-Interval-Sum-.assets/img.png)

## 코드

```python
data = [10, 20, 30, 40, 50]

# 접두사 합 배열 (prefix_sum[0] = 0)
prefix_sum = [0]
for x in data:
    prefix_sum.append(prefix_sum[-1] + x)
# prefix_sum == [0, 10, 30, 60, 100, 150]

# 3번째 수부터 4번째 수까지의 합 (1-based)
left, right = 3, 4
print(prefix_sum[right] - prefix_sum[left - 1])  # 70
```

`itertools.accumulate`를 쓰면 더 짧게 만들 수 있다.

```python
from itertools import accumulate

prefix_sum = [0] + list(accumulate(data))
```

## 변형: 접미사, 곱, 해시

같은 「미리 누적해 두기」를 방향과 연산만 바꿔 쓴다.

| 변형 | 방법 | 예 |
| --- | --- | --- |
| 접미사 합·곱 | 뒤에서부터 누적한다. 왼쪽 정보와 오른쪽 정보가 모두 필요하면 접두사·접미사 배열을 하나씩 만든다 | 자기 자신을 뺀 나머지의 곱: `왼쪽 곱[i] × 오른쪽 곱[i]`. 나눗셈을 쓰지 않으므로 0이 섞여도 맞고 O(n)이다. 결과 배열에 왼쪽 곱을 채운 뒤 오른쪽 곱을 변수 하나로 곱해 가면 추가 공간 O(1) |
| 접두사 합 + 해시 | 지금까지의 접두사 합이 몇 번 나왔는지 해시에 센다. `P[j] - P[i] = k`이면 `(i, j]` 구간의 합이 k다 | 합이 k인 연속 부분 배열의 개수를 O(n)에. 값에 음수가 섞여 [[two-pointers\|슬라이딩 윈도우]]를 쓸 수 없을 때 쓴다 |

```python
from collections import defaultdict

def count_subarrays_with_sum(nums, k):
    seen = defaultdict(int)
    seen[0] = 1                    # 빈 접두사: 처음부터 시작하는 구간
    total = count = 0
    for x in nums:
        total += x
        count += seen[total - k]   # 앞에서 total - k였던 지점마다 합이 k인 구간 하나
        seen[total] += 1
    return count
```

## 핵심 정리

- 접두사 합 = 처음부터 i번째까지의 누적 합
- 구간 합 = `P[R] - P[L-1]`, 쿼리당 O(1)
- 배열 값이 바뀌지 않는(정적인) 경우에 적합하다. 값이 자주 바뀌면 펜윅 트리·세그먼트 트리 같은 자료구조가 필요하다.

관련 노트: [[dynamic-programming|동적 계획법]], [[two-pointers|투 포인터와 슬라이딩 윈도우]], [[coding-test|코딩 테스트 접근법]], [[segment-tree|세그먼트 트리]]
