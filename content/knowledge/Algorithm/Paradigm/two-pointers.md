---
title: "투 포인터와 슬라이딩 윈도우"
concept: "Two Pointers"
summary: "인덱스 두 개를 규칙에 따라 움직여 이중 반복문 O(n²)을 O(n)으로 줄이는 기법. 양 끝에서 좁히기, 같은 방향 윈도우, 두 배열 병합·교집합, 빠른·느린 포인터의 네 가지 모양과 회문 판정·중심 확장을 정리한다."
tags: ["algorithm", "array", "string", "coding-test", "python"]
source: other
date: "2026-10-30"
sources: ["https://www.techinterviewhandbook.org/algorithms/array/", "https://www.techinterviewhandbook.org/algorithms/string/", "https://www.techinterviewhandbook.org/algorithms/linked-list/", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/etc.md"]
---

> Tech Interview Handbook의 「[Array cheatsheet](https://www.techinterviewhandbook.org/algorithms/array/)」, 「[String cheatsheet](https://www.techinterviewhandbook.org/algorithms/string/)」, 「[Linked list cheatsheet](https://www.techinterviewhandbook.org/algorithms/linked-list/)」의 기법 절을 바탕으로 재구성한 노트다.
> 교집합 구하기는 fru1tworld/cs-basic 모의 면접 질문 목록의 「[기타](https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/etc.md)」(손코딩) 질문이 묻는 개념으로 보강했다.

## 투 포인터란

투 포인터(two pointers)는 배열·문자열·연결 리스트 위의 위치 두 개를 들고, 규칙에 따라 한쪽씩 옮기며 답을 찾는 기법이다. 모든 쌍 (i, j)를 보는 이중 반복문은 O(n²)이지만, 포인터가 뒤로 돌아가지 않으면 각 포인터가 최대 n번 움직이므로 전체가 O(n)이다.

관건은 「지금 상태에서 어느 포인터를 옮겨야 답을 놓치지 않는가」를 증명할 수 있느냐다. 그 근거는 대개 정렬된 순서나 구간 조건의 단조성(구간을 늘리면 합이 커지기만 한다 등)에서 나온다.

## 네 가지 모양

| 모양 | 움직임 | 전제 | 대표 문제 |
| --- | --- | --- | --- |
| 양 끝에서 좁히기 | `l = 0`, `r = n-1`에서 서로를 향해 이동 | 정렬된 배열, 대칭 구조 | 정렬된 배열의 두 수 합, 회문 판정, 물을 가장 많이 담는 용기 |
| 같은 방향 윈도우 | `l ≤ r`, 둘 다 오른쪽으로만 이동 | 구간 조건이 단조적이다 | 중복 없는 가장 긴 부분 문자열, 합이 S 이상인 가장 짧은 부분 배열 |
| 두 배열에 하나씩 | 각 배열에 포인터 하나, 작은 쪽을 전진 | 두 입력이 정렬돼 있다 | 정렬된 두 배열 병합, 교집합 |
| 빠른·느린 포인터 | 한쪽이 두 칸, 다른 쪽이 한 칸 | 연결 리스트처럼 앞으로만 갈 수 있다 | 사이클 판별, 가운데 노드, 뒤에서 k번째 노드 |

### 양 끝에서 좁히기

정렬된 배열에서 합이 `target`인 두 수를 찾을 때, 합이 작으면 `l`을, 크면 `r`을 옮긴다. 합이 작은데 `r`을 줄이면 합이 더 작아질 뿐이므로 버려지는 쌍에 답이 없다.

```python
def two_sum_sorted(a, target):
    l, r = 0, len(a) - 1
    while l < r:
        s = a[l] + a[r]
        if s == target:
            return l, r
        if s < target:
            l += 1
        else:
            r -= 1
    return None
```

배열을 세 구역으로 나누는 **네덜란드 국기 문제**(0·1·2 정렬)도 같은 계열이다. 왼쪽 경계, 오른쪽 경계, 훑는 포인터 세 개로 한 번에 정렬한다.

### 슬라이딩 윈도우

슬라이딩 윈도우(sliding window)는 같은 방향으로 움직이는 투 포인터가 연속 구간 `[l, r]`을 창처럼 다루는 경우다. 두 포인터가 서로를 앞지르지 않으므로 각 원소는 창에 한 번 들어오고 한 번 나간다.

| 종류 | 움직임 |
| --- | --- |
| 고정 길이 k | `r`이 한 칸 들어오면 `l`도 한 칸 나간다. 창의 합·개수를 들어온 값과 나간 값으로만 갱신한다 |
| 가변 길이 | `r`을 늘려 원소를 넣고, 조건이 깨지는 동안 `l`을 당긴다. 매 단계 창 크기로 답을 갱신한다 |

```python
def longest_unique_substring(s):
    last = {}                       # 문자 → 마지막으로 본 위치
    l = best = 0
    for r, c in enumerate(s):
        if c in last and last[c] >= l:
            l = last[c] + 1         # 중복 문자 바로 뒤로 창을 줄인다
        last[c] = r
        best = max(best, r - l + 1)
    return best
```

값에 음수가 섞이면 가변 윈도우가 깨진다. 창을 늘린다고 합이 커진다는 단조성이 사라지기 때문이다. 이때는 [[prefix-sum|접두사 합]]과 해시를 함께 쓴다.

### 두 배열에 하나씩

정렬된 두 배열을 합칠 때 두 포인터의 값을 비교해 작은 쪽을 결과에 넣고 그 포인터만 옮긴다. [[merge-quick-sort|병합 정렬]]의 병합 단계가 이 모양이다. 한쪽이 먼저 끝나면 남은 쪽을 그대로 붙인다. 정렬된 두 연결 리스트를 합칠 때도 같고, 더미 노드 뒤에 작은 쪽 노드를 이어 붙이면 새 노드 없이 O(n + m)에 끝난다.

교집합도 같은 모양이다. 해시 집합 같은 추가 자료구조를 쓰지 말라는 조건이면 두 배열을 각각 정렬한 뒤, 값이 같으면 결과에 넣고 둘 다 옮기고, 다르면 작은 쪽만 옮긴다. 정렬 O(n log n + m log m)에 훑기 O(n + m)이다. 한 배열이 훨씬 작으면 작은 배열의 원소마다 큰 배열을 이분 탐색하는 O(n log m)이 낫다.

```python
def intersect_sorted(a, b):
    a.sort(); b.sort()
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            if not out or out[-1] != a[i]:   # 중복을 한 번만 넣으려면
                out.append(a[i])
            i += 1; j += 1
        elif a[i] < b[j]:
            i += 1
        else:
            j += 1
    return out
```

### 빠른·느린 포인터

연결 리스트는 인덱스로 건너뛸 수 없으므로 속도가 다른 두 포인터로 위치를 잡는다.

| 목적 | 방법 |
| --- | --- |
| 사이클 판별 | 느린 포인터는 한 칸, 빠른 포인터는 두 칸씩 간다. 둘이 만나면 사이클이 있고, 빠른 포인터가 끝(`null`)에 닿으면 없다(플로이드의 토끼와 거북이) |
| 가운데 노드 | 같은 방식으로 빠른 포인터가 끝에 닿을 때 느린 포인터가 가운데에 있다 |
| 뒤에서 k번째 | 한 포인터를 k칸 먼저 보낸 뒤 둘을 같이 옮긴다. 앞선 포인터가 끝에 닿으면 뒤 포인터가 답이다 |

```python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False
```

공간 O(1)로 사이클을 찾는다는 점이 방문 집합을 쓰는 방법(공간 O(n))과 다르다. 연결 리스트의 다른 기법은 [[data-structures|기초 자료구조]]의 연결 리스트 절에 있다.

## 회문 판정과 중심 확장

회문(palindrome)은 앞뒤로 읽어도 같은 문자열이다(`madam`, `racecar`). 글자 순서가 중요하므로 해시 테이블로는 판정할 수 없고, 투 포인터가 기본 도구다.

| 질문 | 방법 | 복잡도 |
| --- | --- | --- |
| 이 문자열이 회문인가 | 양 끝에서 안쪽으로 좁히며 두 글자를 비교한다. 뒤집은 문자열과 비교해도 되지만 O(n) 공간이 더 든다 | O(n) |
| 가장 긴 회문 부분 문자열, 회문 부분 문자열의 개수 | 중심에서 바깥으로 확장한다. 중심이 글자 하나인 홀수 길이와, 두 글자 사이인 짝수 길이를 둘 다 시도한다. 양쪽 글자가 다르면 그 중심은 더 넓힐 필요가 없다 | O(n²), 공간 O(1) |
| 가장 긴 회문 부분 수열 | 연속이 아니므로 확장을 멈출 수 없다. 겹치는 하위 문제가 생겨 [[dynamic-programming\|동적 계획법]]으로 푼다 | O(n²) |

```python
def count_palindromes(s):
    def expand(l, r):
        cnt = 0
        while l >= 0 and r < len(s) and s[l] == s[r]:
            cnt += 1
            l, r = l - 1, r + 1
        return cnt
    return sum(expand(i, i) + expand(i, i + 1) for i in range(len(s)))
```

가장 긴 회문 부분 문자열을 O(n)에 구하는 매내처(Manacher) 알고리즘도 있지만, 중심 확장이 구현이 짧아 대부분의 문제에 충분하다.

## 언제 떠올리나

- 입력이 정렬돼 있거나 정렬해도 되는 배열에서 쌍·세 쌍을 찾는다.
- 「연속 부분 배열」, 「부분 문자열」, 「길이 k인 구간」이라는 말이 나온다.
- 배열을 제자리(in-place)에서 재배치하라고 한다(중복 제거, 0을 뒤로 보내기).
- 연결 리스트에서 위치를 찾거나 사이클을 판정하라고 하는데 추가 공간을 쓰지 말라고 한다.

## 정리

- 포인터가 뒤로 가지 않으면 각 포인터의 이동 횟수가 n 이하라 전체 O(n)이다.
- 어느 포인터를 옮길지는 정렬 순서나 구간 조건의 단조성으로 정당화한다.
- 슬라이딩 윈도우는 같은 방향 투 포인터다. 음수가 섞여 단조성이 깨지면 접두사 합 + 해시로 바꾼다.
- 회문은 양 끝 비교로 판정하고, 부분 문자열 개수·최장 길이는 홀수·짝수 중심 확장으로 구한다.

관련 노트: [[prefix-sum|구간 합과 접두사 합]], [[sweep-line|스위핑]], [[binary-search|이분 탐색]], [[data-structures|기초 자료구조: 배열에서 트라이까지]], [[coding-test|코딩 테스트 접근법]]
