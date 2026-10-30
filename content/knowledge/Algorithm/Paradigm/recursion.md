---
title: "재귀 함수"
concept: "Recursion"
summary: "자기 자신을 다시 호출해 문제를 더 작은 같은 문제로 줄여 가는 함수와 그 종료 조건. 예제로 팩토리얼과 유클리드 호제법(최대공약수·최소공배수)을 다룬다."
tags: ["algorithm", "recursion", "python"]
source: mixed
date: "2026-10-30"
sources: ["https://80000coding.notion.site/78fab30ae56449158565b4808ffb9c25", "https://www.techinterviewhandbook.org/algorithms/recursion/"]
---

> 유클리드 호제법의 복잡도와 최소공배수 부분은 팔만코딩경(42Seoul 커뮤니티 위키)의 「유클리드 호제법으로 최대 공약수(GCD) 최소 공배수(LCM) 구하기」를 바탕으로 보강했다.
> 기저 사례의 개수, 꼬리 호출 최적화, 경우 생성 주의점은 Tech Interview Handbook의 「[Recursion cheatsheet](https://www.techinterviewhandbook.org/algorithms/recursion/)」를 바탕으로 보강했다.

재귀 함수(Recursive Function)는 **자기 자신을 다시 호출하는 함수**다. 큰 문제를 "같은 모양의 더 작은 문제"로 바꿔 표현할 수 있을 때 코드가 수학식처럼 간결해진다. DFS, 분할 정복, 백트래킹, 메모이제이션 DP의 기반이 된다.

## 종료 조건이 반드시 필요하다

```python
def recursive_function():
    print('재귀 함수를 호출합니다')
    recursive_function()

recursive_function()  # 끝없이 호출되다가 RecursionError 발생
```

멈추는 조건이 없으면 함수가 무한히 호출된다. 파이썬은 기본 재귀 깊이 한도(약 1000)를 넘으면 `RecursionError: maximum recursion depth exceeded`를 낸다. 그래서 재귀 함수에는 **종료 조건(base case)을** 반드시 명시한다.

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

## 예제 2: 최대공약수: 유클리드 호제법

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

2부터 min(a, b)까지 모든 수로 나눠 보는 방법은 O(min(a, b))지만, 유클리드 호제법은 나머지가 두 단계마다 절반 아래로 줄어 **O(log min(a, b))** 다. 꼬리 재귀라 반복문으로 바꾸기도 쉽다.

```python
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a
```

**최소공배수**는 `a × b = gcd(a, b) × lcm(a, b)` 관계로 구한다. 곱을 먼저 하면 정수 범위가 넘칠 수 있는 언어(C, Java, JavaScript의 큰 수)에서는 `a // gcd(a, b) * b` 순서로 나눗셈을 먼저 한다.

```python
def lcm(a, b):
    return a // gcd(a, b) * b

print(lcm(192, 162))  # 5184
```

> 실무에서는 `math.gcd`, `math.lcm`(파이썬 3.9+, 인자 여러 개 가능)이나 C++17의 `std::gcd`·`std::lcm`을 쓰면 된다.

## 재귀를 쓸 때 주의할 점

- 모든 재귀는 반복문으로 바꿀 수 있고, 그 반대도 가능하다. 어느 쪽이 더 읽기 쉬운지로 고른다.
- 재귀는 간결하지만 남이 읽기 어려운 코드가 될 수도 있다.
- 호출마다 스택 프레임을 쌓으므로 반복문보다 느리고 메모리를 더 쓴다.
- 같은 인자로 여러 번 호출되면(예: 피보나치) 지수 시간이 걸린다 → 메모이제이션(동적 계획법)으로 해결한다.
- 깊은 재귀가 필요하면 `sys.setrecursionlimit()`으로 한도를 늘리되, 너무 깊으면 반복문으로 바꾼다.
- **기저 사례의 개수**는 재귀 호출이 얼마나 멀리 내려가는지로 정한다. `f(n-1)`만 부르면 하나로 충분하지만, 피보나치처럼 `f(n-2)`까지 부르면 `f(0)`과 `f(1)` 두 개가 있어야 입력 범위 전체가 기저 사례에 닿는다. n = 0, n = 1을 테스트 케이스에 넣는다.
- 재귀의 공간 복잡도는 호출 깊이만큼이라 **O(1)이 되지 않는다.** 예외는 꼬리 호출 최적화(TCO)다. 재귀 호출이 함수의 마지막 연산이면 현재 프레임을 재사용할 수 있는데, 이를 보장하는 언어는 Scheme 같은 일부뿐이다. Python과 Java는 하지 않고, JavaScript는 명세에 있지만 Safari(JavaScriptCore)만 구현했다. Kotlin `tailrec`, Scala `@tailrec`는 컴파일러가 반복문으로 바꾼다.
- 순열·부분집합처럼 **모든 경우를 만드는** 문제는 재귀가 가장 자연스럽다. 중복 원소가 있으면 정렬한 뒤 같은 깊이에서 같은 값을 건너뛰어 중복 결과를 막는다([[brute-force|완전 탐색과 백트래킹]]).

## 핵심 정리

- 재귀 = 자기 자신 호출 + **종료 조건**
- 호출은 스택에 쌓이고 역순으로 끝난다.
- 점화식으로 표현되는 문제(팩토리얼, GCD, 트리 탐색)에 특히 잘 맞는다.

관련 노트: [[dfs|DFS]], [[stack|스택]], [[divide-and-conquer|분할 정복]], [[dynamic-programming|동적 계획법]], [[functions|함수와 this]], [[number-theory-basics|정수론 기초: 소수·최대공약수·합동식]]
