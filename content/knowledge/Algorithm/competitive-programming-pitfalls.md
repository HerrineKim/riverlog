---
title: "대회에서 자주 틀리는 구현"
concept: "Contest Pitfalls"
summary: "C++ 대회 코드에서 틀리는 제출과 시간 초과가 나는 구현 실수. 곱셈 전에 형을 넓히기, 부호 없는 크기, memset과 pow, 컨테이너를 값으로 넘기거나 순회 중에 고치기, 모듈러 연산의 음수·오버플로, 해시 충돌을 모으는 입력."
tags: ["algorithm", "coding-test", "cpp", "implementation"]
source: other
date: "2026-11-27"
sources: ["https://shahjalalshohag.com/blog/common-mistakes-in-cp", "https://codeforces.com/blog/entry/111217", "https://shahjalalshohag.com/blog/comeback", "https://shahjalalshohag.com/blog/code-library", "https://github.com/ShahjalalShohag/code-library"]
---

> Shahjalal Shohag의 「[Common Mistakes in Competitive Programming and How to Avoid Them](https://codeforces.com/blog/entry/111217)」(2023.01)을 바탕으로 재구성한 노트다. 같은 글의 소개가 [개인 사이트](https://shahjalalshohag.com/blog/common-mistakes-in-cp)에 있다. 64비트를 넘는 곱은 「[From Out of Top 30 to the ICPC World Finals](https://shahjalalshohag.com/blog/comeback)」(2022.02)의 사례로 보강했다.

대회 코드의 오답은 알고리즘이 아니라 **식이 평가되는 순서와 자료형의 폭**에서 나는 경우가 많다. 아래는 C++ 기준으로, 틀린 제출(WA)과 시간 초과(TLE)로 자주 이어지는 구현이다. 부호 있는 오버플로가 미정의 동작인 이유는 [[c-integer-types|C의 정수 자료형]]에 있다.

## 정수 폭

| 증상 | 원인 | 고치는 법 |
| --- | --- | --- |
| `long long`에 담았는데 곱이 음수이거나 잘림 | `a * b`가 대입 전에 `int`로 계산된다. `10^9 * 10^9`는 64비트에 들어가도 곱하는 순간 32비트를 넘는다 | `(long long) a * b`. 시프트도 같다. `1 << 40`은 `1`이 `int`라서 `long long x = 1 << 40`도 넘친다. `1LL << 40` |
| 두 `long long`의 곱이 2^63을 넘음 | 64비트끼리의 곱은 64비트에 안 들어간다 | GCC·Clang 확장 `__int128`. 표준 C++ 타입은 아니다. 출력은 직접 나눠 찍거나 상위·하위를 나눈다 |
| `accumulate`의 합이 잘림 | 세 번째 인자의 타입이 누적 타입이다. `0`은 `int`, `0.0`이 아니면 `double` 합도 `int`로 잘린다 | `accumulate(v.begin(), v.end(), 0LL)`, 실수는 `0.0` |
| 초기 최솟값이 실제 답보다 작음 | `INF = 1e6`인데 비교하는 값이 `x * x`이고 x가 10^4면 답이 10^8까지 간다 | 초기값은 가능한 답의 바깥에 둔다. `1e6`처럼 적으면 그 값이 그대로 답이 된다 |
| `pow(2, 29)`를 `int`로 바꾸면 1 작음 | `pow`는 `double`을 돌려준다. 2^53 근처부터 정수를 정확히 못 담고, 그보다 작은 거듭제곱도 `29.999...`처럼 나와 버림 시 1이 빠진다 | 정수는 반복 제곱이나 비트 시프트. `std::pow`는 실수 전용 |
| `sqrt`로 정수 제곱근이 1 어긋남 | `sqrt`·`sqrtl`도 부동소수점이다 | `long double`로 근삿값을 구한 뒤, 곱은 `__int128`로 비교해 한 칸씩 맞춘다. `k * k`를 `long long`으로 하면 10^18 근처에서 그 비교가 다시 넘친다 |
| 나눗셈의 올림이 틀림 | `ceil(1.0 * a / b)`는 큰 정수에서 가수부가 부족하다 | 양의 정수면 올림 `(a + b - 1) / b`, 내림은 `a / b` |

```cpp
long long isqrt(long long x) {
    long long k = sqrtl((long double) x);
    while ((__int128) k * k > x) --k;
    while ((__int128) (k + 1) * (k + 1) <= x) ++k;
    return k;
}
```

`memset(a, 1, sizeof a)`는 각 **바이트**를 1로 채운다. `int` 하나는 `0x01010101`(16843009)이 된다. 정수 배열에 안전한 값은 0과, 모든 비트가 1인 −1뿐이다.

## 부호 없는 크기와 연산자 우선순위

`vector::size()`와 `string::size()`는 `size_t`(부호 없음)다. 빈 벡터에서 `v.size() - 1`은 −1이 아니라 아주 큰 수가 되고, `for (int i = 0; i < v.size() - 1; i++)`는 끝나지 않는다. 빼기 전에 `(int) v.size()` 또는 `ssize`(C++20)로 바꾼다.

`+`가 `&`보다 먼저 묶인다. `a + b & 3`은 `(a + b) & 3`이다. 의도가 `a + (b & 3)`이면 괄호를 친다. 비트 관용구는 [[bit-manipulation|비트 연산 기법]]에 있다.

## 입출력

- `endl`은 개행 뒤에 버퍼를 비운다. 출력이 수십만 줄이면 `'\n'`보다 훨씬 느리다.
- `ios_base::sync_with_stdio(false); cin.tie(nullptr);`로 C 표준 입출력과의 동기화를 끄면 `cin`/`cout`이 빨라진다. 그 상태에서 `scanf`/`printf`를 섞으면 버퍼가 따로 놀아 출력 순서가 뒤바뀐다. 한 방식만 쓴다.
- 제출 전에 `cerr`를 포함한 디버그 출력을 지운다. 표준 에러도 출력량이라 시간 초과가 된다.
- 실수 출력은 `cout << fixed << setprecision(10)`. 비교는 `abs(a - b) < 1e-9`처럼 허용 오차로 한다. `a == b`는 이진 부동소수점에서 실패한다.
- `rand()`는 쓰지 않는다. C 표준은 `RAND_MAX`가 32767 **이상**이기만 요구해서, 32767로 고정된 값이 아니다(glibc는 2^31−1). 품질도 낮다. C++11 `<random>`의 `mt19937_64`를 쓴다.

## 여러 테스트와 입력 소비

전역 카운트 배열은 테스트 사이에 0으로 되돌린다. 안 그러면 이전 테스트의 빈도가 남는다.

`n == 1`처럼 짧은 경우라고 `continue`하기 전에, 그 테스트의 입력을 끝까지 읽는다. 읽지 않은 수가 다음 테스트의 `n`이 된다.

테스트마다 길이를 `n`으로 둔다. 합이 10^5 이하라는 보장이 있어도, 테스트마다 길이 10^5짜리 벡터를 만들면 테스트 수만큼 다시 초기화한다.

## 컨테이너

| 실수 | 실제로 일어나는 일 | 대신 |
| --- | --- | --- |
| `vector`를 값으로 넘김 | 호출마다 O(n) 복사. 루프 안이면 O(n²) | `const vector<int>&` |
| `s = s + 'a'`를 n번 | 매번 새 문자열을 복사해 O(n²) | `s += 'a'` 또는 `push_back`. 분할 상환 O(n) |
| `multiset::erase(x)` | 값으로 지우면 **같은 값이 전부** 지워진다 | 하나만 지우려면 `se.erase(se.find(x))`. `find`가 `end`면 지우지 않는다 |
| `multiset::count`를 n번 | 같은 값이 k개면 한 번이 O(log n + k). 전부 같으면 한 번이 O(n) | 있는지 볼 때는 `find` |
| `std::lower_bound(se.begin(), se.end(), x)` | `set` 반복자는 임의 접근이 아니라서 거리가 O(n) | `se.lower_bound(x)`. `upper_bound`도 멤버 함수 |
| `if (mp[i])`로 존재 확인 | `map`·`unordered_map`의 `operator[]`는 없는 키를 0으로 **넣는다**. 크기가 늘고, 없는 키를 많이 보면 메모리가 터진다 | `mp.find(i) != mp.end()` 또는 `mp.contains(i)`(C++20) |
| 범위 기반 for 도중 `insert`/`erase` | 반복자가 무효가 된다 | 순회가 끝난 뒤 고치거나, 지울 반복자를 따로 모아 둔다 |
| 비교 함수가 `a <= b` | 같은 원소에 대해 양쪽 다 거짓이어야 하는 엄밀 약순서(strict weak ordering)를 어긴다. `sort`·`set`이 런타임 에러를 낸다 | 같을 때는 반드시 `false`. `a < b` |

`unordered_map`의 기본 해시는 정수 키에서 예측할 수 있다. 충돌이 한 버킷으로 모이도록 만든 입력에서 연산이 O(n)이 되어, 평균 O(1)로 보였던 빈도 세기가 시간 초과가 난다. 키에 실행마다 다른 시드를 섞는 해시를 넘기거나, 최악에도 O(log n)인 `map`을 쓴다. 해시의 최악 복잡도는 [[hash-table|해시 테이블]]에 있다.

1비트를 셀 때 64비트 값은 `__builtin_popcountll`(또는 C++20 `std::popcount`)을 쓴다. `__builtin_popcount`는 `unsigned int`라 상위 비트를 버린다.

## 모듈러 연산

`mod`가 10^9+7처럼 `int`에 들어가도, 더하고 곱하는 중간이 `int`를 넘는다. 밑과 지수가 서로소일 때의 지수 줄이기는 [[number-theory-basics|정수론 기초]]에 있다.

```cpp
const int mod = 1'000'000'007;
int add(int a, int b) { return a + b >= mod ? a + b - mod : a + b; }
int sub(int a, int b) { return a >= b ? a - b : a - b + mod; }
int mul(int a, int b) { return (long long) a * b % mod; }
```

- `(a + b + c) % mod`는 합이 먼저 `int`를 넘친다. 두 개씩 모듈러를 취한다.
- `(a - b) % mod`는 `a < b`이면 음수다. C++에서 음수의 `%`는 음수 쪽이 될 수 있다. `sub`처럼 `mod`를 더한 뒤 나눈다.
- 매 연산 뒤 값을 `[0, mod)`에 둔다.

## 배열과 스택

지역 배열을 제약보다 작게 잡으면 범위를 넘는 접근이 난다. 채점기에서는 런타임 에러 대신 틀린 답이 나오기도 한다. 제약의 최댓값으로 잡고, 큰 배열은 스택이 아니라 전역이나 `vector`에 둔다.

## 제출 전에 설계하기

바로 코딩하면 틀린 제출이 늘어난다. 식을 주석으로 적고, 경계(n = 1, 빈 컨테이너, 최댓값)를 먼저 적는 순서는 [[coding-test|코딩 테스트 접근법]]과 같다. `#define int long long`으로 통과시켜도, 어느 곱이 32비트를 넘겼는지는 따로 남긴다. 64비트 나눗셈은 32비트보다 느릴 수 있고, `long long` 2차원 배열은 메모리를 두 배로 쓴다.

자주 쓰는 자료구조 구현을 한곳에 모아 둔 예가 [code-library](https://github.com/ShahjalalShohag/code-library)다. 템플릿은 위에서 말한 형 변환과 모듈러 규칙을 이미 지켜 두었는지 보고 쓴다.

## 정리

- 곱·시프트의 왼쪽을 결과 타입으로 먼저 바꾼다. `pow`와 `sqrt`로 정수를 계산하지 않는다.
- `size()`는 부호가 없다. 빼기 전에 부호 있는 형으로 바꾼다.
- 테스트마다 전역 상태를 지우고, 그 테스트의 입력을 끝까지 읽은 뒤에 건너뛴다.
- `erase(값)`과 `operator[]`와 `std::lower_bound(set)`은 이름과 비용이 다르다.
- 모듈러 뺄셈은 음수가 되고, 곱은 `int`를 넘는다. 해시 맵은 충돌을 모으면 O(n)이다.

관련 노트: [[c-integer-types|C의 정수 자료형과 형 변환]], [[bit-manipulation|비트 연산 기법]], [[hash-table|해시 테이블]], [[number-theory-basics|정수론 기초]], [[coding-test|코딩 테스트 접근법]], [[contest-math-identities|대회에 쓰는 수학 항등식]]
