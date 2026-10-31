---
title: "KMP 문자열 검색 알고리즘"
concept: "KMP"
summary: "텍스트에서 패턴을 찾을 때 불일치가 나도 텍스트 포인터를 되돌리지 않는 KMP 알고리즘. 패턴의 접두사이자 접미사인 가장 긴 부분의 길이를 담은 실패 함수(pi 배열)로 점프할 위치를 정해 O(N + M)에 검색한다. 롤링 해시로 창을 비교하는 라빈-카프와 다른 문자열 검색 알고리즘도 비교한다."
tags: ["algorithm", "string", "coding-test", "python"]
source: other
date: "2026-10-21"
sources: ["https://bowbowbow.tistory.com/6", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/ds.md"]
---

> 「[KMP : 문자열 검색 알고리즘](https://bowbowbow.tistory.com/6)」을 바탕으로 재구성한 노트다.
> 라빈-카프 절은 fru1tworld/cs-basic 모의 면접 질문 목록의 「[자료구조](https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/ds.md)」 질문이 묻는 개념으로 보강했다.

## KMP란

KMP(Knuth-Morris-Pratt)는 길이 N인 텍스트에서 길이 M인 패턴이 나오는 모든 위치를 O(N + M)에 찾는 알고리즘이다.

단순 비교는 텍스트의 시작 위치마다 패턴을 처음부터 맞춰 보므로 최악 O(NM)이다. `AAAA…AB`에서 `AAAB`를 찾는 경우처럼 거의 다 맞다가 끝에서 틀리는 일이 반복되면 이 최악이 나온다.

## 핵심 아이디어

불일치가 났다는 것은 그 직전까지는 일치했다는 정보이기도 하다. 일치한 구간의 접두사와 접미사가 같다면, 패턴을 그 겹치는 길이만큼 당겨 놓고 이어서 비교하면 된다. 그래서 텍스트 포인터는 절대 뒤로 가지 않는다.

```text
텍스트  A B A B A B A C
패턴    A B A B A C         ← 6번째에서 불일치. 일치한 "ABABA"의 접두사=접미사 "ABA"(길이 3)
패턴        A B A B A C     ← 패턴을 당겨 4번째 글자부터 비교를 이어 간다
```

## 실패 함수 (pi 배열)

`pi[i]`는 **패턴의 `0..i` 부분에서 접두사이면서 접미사인 가장 긴 진부분 문자열의 길이**다. 자기 자신 전체는 제외한다.

| i | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 패턴 | A | B | A | B | A | B | A | C |
| pi | 0 | 0 | 1 | 2 | 3 | 4 | 5 | 0 |

pi 배열은 패턴을 자기 자신에게 KMP로 맞춰 보는 과정으로 O(M)에 만든다.

```python
def build_pi(p):
    pi = [0] * len(p)
    j = 0                          # 지금까지 일치한 접두사 길이
    for i in range(1, len(p)):
        while j > 0 and p[i] != p[j]:
            j = pi[j - 1]          # 더 짧은 접두사로 물러난다
        if p[i] == p[j]:
            j += 1
            pi[i] = j
    return pi
```

## 검색

```python
def kmp_search(text, p):
    pi, j, found = build_pi(p), 0, []
    for i, ch in enumerate(text):
        while j > 0 and ch != p[j]:
            j = pi[j - 1]          # 텍스트 i는 그대로, 패턴만 점프
        if ch == p[j]:
            if j == len(p) - 1:
                found.append(i - len(p) + 1)
                j = pi[j]          # 겹치는 다음 일치도 찾는다
            else:
                j += 1
    return found
```

`while`이 들어 있어도 전체가 선형인 이유는, `j`가 한 번에 최대 1씩만 늘고 `while`은 `j`를 줄이기만 하므로 줄어드는 총량이 늘어난 총량을 넘을 수 없기 때문이다(분할 상환 분석).

## 라빈-카프: 롤링 해시로 비교하기

라빈-카프(Rabin-Karp)는 글자를 하나씩 비교하는 대신 길이 M인 창의 해시값을 패턴의 해시값과 비교한다. 창을 한 칸 옮길 때 해시를 처음부터 다시 계산하지 않고, 빠지는 글자와 들어오는 글자만 반영해 O(1)에 갱신하는 것이 핵심이다(롤링 해시).

```text
H(s[i..i+M-1]) = s[i]·b^(M-1) + s[i+1]·b^(M-2) + … + s[i+M-1]   (mod q)
한 칸 이동:  H' = (H − s[i]·b^(M-1))·b + s[i+M]                  (mod q)
```

```python
def rabin_karp(t, p, b=256, q=1_000_000_007):
    n, m = len(t), len(p)
    if m > n:
        return []
    high = pow(b, m - 1, q)                 # 빠지는 글자에 곱할 b^(M-1)
    hp = ht = 0
    for i in range(m):
        hp = (hp * b + ord(p[i])) % q
        ht = (ht * b + ord(t[i])) % q
    found = []
    for i in range(n - m + 1):
        if hp == ht and t[i:i + m] == p:    # 해시가 같으면 글자로 한 번 더 확인
            found.append(i)
        if i + m < n:
            ht = ((ht - ord(t[i]) * high) * b + ord(t[i + m])) % q
    return found
```

- 해시가 같아도 다른 문자열일 수 있으므로(충돌) 일치 후보만 글자로 확인한다. 충돌이 드물면 평균 O(N + M), 충돌이 몰리면 최악 O(NM)이다. 모듈러 q를 큰 소수로 두고, 두 개의 서로 다른 (b, q)로 해시를 이중으로 쓰면 충돌이 사실상 사라진다.
- 패턴이 여러 개라도 길이가 같으면 패턴 해시들을 집합에 넣고 창 해시를 집합에서 찾아 한 번의 훑기로 모두 찾는다. 표절 검사, 중복 문서 탐지가 이 방식이다.
- 문자열 비교를 해시 비교로 바꾸는 발상이라 「길이 L인 부분 문자열 중 두 번 나오는 것이 있나」 같은 문제에서 이분 탐색과 함께 쓴다.

문자열 집합을 저장하고 접두사로 찾는 구조는 트라이([[data-structures|기초 자료구조]]), 여러 패턴을 길이와 무관하게 동시에 찾는 것은 트라이에 실패 함수를 붙인 아호-코라식이다.

## 다른 문자열 검색과 비교

| 알고리즘 | 시간 | 특징 |
| --- | --- | --- |
| 단순 비교 | 최악 O(NM) | 구현이 쉽다. 짧은 패턴·무작위 텍스트에서는 충분히 빠르다 |
| KMP | O(N + M) | 최악도 선형. pi 배열 자체가 문자열의 반복 구조(주기)를 구하는 문제에도 쓰인다 |
| 라빈-카프 | 평균 O(N + M) | 롤링 해시로 비교. 여러 패턴을 한꺼번에 찾을 때 유리 |
| 보이어-무어 | 평균 준선형 | 패턴 끝부터 비교해 크게 건너뛴다. 실무 텍스트 검색 도구가 변형을 많이 쓴다 |
| 아호-코라식 | O(N + M 합 + 매치 수) | KMP의 실패 함수를 트라이로 확장해 여러 패턴을 동시에 찾는다 |

## 정리

- 불일치 정보로 패턴을 당기고, 텍스트 포인터는 되돌리지 않는다.
- pi[i] = 패턴 앞부분 `0..i`의 「접두사 = 접미사」 최대 길이.
- pi 계산 O(M) + 검색 O(N). 실전 언어의 `find`·`in`은 대개 충분히 빠르므로, 코딩 테스트에서 최악 입력이 걸릴 때 KMP를 꺼낸다.

관련 노트: [[coding-test|코딩 테스트 접근법]], [[big-o|빅오 표기법과 시간 복잡도]], [[brute-force|완전 탐색과 백트래킹]], [[hash-table|해시 테이블]], [[data-structures|기초 자료구조(트라이)]]
