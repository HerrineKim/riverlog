---
title: "재귀 함수"
concept: "Recursion"
summary: "자기 자신을 다시 호출해 문제를 더 작은 같은 문제로 줄여 가는 함수와 그 종료 조건."
tags: ["algorithm", "recursion", "python"]
source: til
---

재귀 함수(Recursive Function)는 **자기 자신을 다시 호출하는 함수**다. 큰 문제를 "같은 모양의 더 작은 문제"로 바꿔 표현할 수 있을 때 코드가 수학식처럼 간결해진다. DFS, 분할 정복, 백트래킹, 메모이제이션 DP의 기반이 된다.

## 종료 조건이 반드시 필요하다

```python
def recursive_function():
    print('재귀 함수를 호출합니다')
    recursive_function()

recursive_function()  # 끝없이 호출되다가 RecursionError 발생
```

멈추는 조건이 없으면 함수가 무한히 호출된다. 파이썬은 기본 재귀 깊이 한도(약 1000)를 넘으면 `RecursionError: maximum recursion depth exceeded`를 낸다. 그래서 재귀 함수에는 **종료 조건(base case)**을 반드시 명시한다.

```python
def recursive_function(i):
    if i == 100:      # 종료 조건
        return
    print(i, '번째 재귀 함수에서', i + 1, '번째 재귀 함수를 호출합니다')
    recursive_function(i + 1)
    print(i, '번째 재귀 함수를 종료합니다')

recursive_function(1)
```

출력을 보면 1 → 2 → … → 99 순으로 호출되고, **종료는 99 → 98 → … → 1의 역순**으로 일어난다. 함수 호출이 스택에 쌓였다가 위에서부터 빠지기 때문이다.

## 재귀와 스택

컴퓨터는 함수를 호출할 때마다 지역 변수와 돌아갈 위치를 **스택 프레임**에 쌓는다. 그래서 재귀는 본질적으로 스택을 쓰는 것과 같고, 스택이 필요한 알고리즘(DFS 등)을 구현할 때 스택 자료구조 대신 재귀를 쓰는 경우가 많다.

## 예제 1: 팩토리얼

n! = 1 × 2 × … × n이고, 0!과 1!은 1이다. `n! = n × (n-1)!`이라는 점화식을 그대로 코드로 옮긴다.

```python
def factorial_iterative(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

def factorial_recursive(n):
    if n <= 1:                     # 종료 조건
        return 1
    return n * factorial_recursive(n - 1)

print(factorial_iterative(5))  # 120
print(factorial_recursive(5))  # 120
```

## 예제 2: 최대공약수 — 유클리드 호제법

두 자연수 A, B(A > B)에 대해 A를 B로 나눈 나머지를 R이라 하면, **A와 B의 최대공약수는 B와 R의 최대공약수와 같다.** 이 성질을 그대로 재귀로 쓸 수 있다.

| 단계 | A | B |
| --- | --- | --- |
| 1 | 192 | 162 |
| 2 | 162 | 30 |
| 3 | 30 | 12 |
| 4 | 12 | 6 |

```python
def gcd(a, b):
    if a % b == 0:
        return b
    return gcd(b, a % b)

print(gcd(192, 162))  # 6
```

> 실무에서는 `math.gcd(192, 162)`를 쓰면 된다.

## 재귀를 쓸 때 주의할 점

- 모든 재귀는 반복문으로 바꿀 수 있고, 그 반대도 가능하다. 어느 쪽이 더 읽기 쉬운지로 고른다.
- 재귀는 간결하지만 남이 읽기 어려운 코드가 될 수도 있다.
- 호출마다 스택 프레임을 쌓으므로 반복문보다 느리고 메모리를 더 쓴다.
- 같은 인자로 여러 번 호출되면(예: 피보나치) 지수 시간이 걸린다 → 메모이제이션(동적 계획법)으로 해결한다.
- 깊은 재귀가 필요하면 `sys.setrecursionlimit()`으로 한도를 늘리되, 너무 깊으면 반복문으로 바꾼다.

## 핵심 정리

- 재귀 = 자기 자신 호출 + **종료 조건**
- 호출은 스택에 쌓이고 역순으로 끝난다.
- 점화식으로 표현되는 문제(팩토리얼, GCD, 트리 탐색)에 특히 잘 맞는다.

관련 노트: [[dfs|DFS]], [[stack|스택]], [[divide-and-conquer|분할 정복]], [[dynamic-programming|동적 계획법]]
