---
title: "C 저수준 최적화"
concept: "Low-level Optimization"
summary: "컴파일러가 이미 해 주는 최적화와 프로그래머가 힌트로 도울 수 있는 부분을 구분한다. switch를 룩업 테이블·점프 테이블로 바꾸는 원리, 분기 예측 힌트(__builtin_expect, [[likely]]), 도달 불가 힌트, SIMD 내장 함수, memset 같은 라이브러리 함수를 직접 최적화하지 말아야 하는 이유."
tags: ["c", "performance", "computer-architecture", "assembly", "compile"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/c4f3f1f21573477ebcc1a3f5caa960b6", "https://80000coding.notion.site/7c87e26aaaa545b5af38bd60968a2832", "https://80000coding.notion.site/4beea92ae6944b5c932db53258d40817", "https://80000coding.notion.site/3ba610f3ffdb4b16bb1c71a80c08525f", "https://80000coding.notion.site/cafa9acc2af849fd8e2a855d1b71b394", "https://gcc.gnu.org/onlinedocs/gcc/Other-Builtins.html"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「if-else문과 switch문의 차이 (LUT)」, 「정적 분기예측 컴파일러 힌트」, 「memset() 최적화」, 「SIMD로 행렬연산 10배이상 빠르게 구현하기(SSE, AVX)」, 「이해하기 쉬운 고정소수점 샘플」을 바탕으로 재구성한 노트입니다.

## 원칙: 측정하고, 컴파일러를 먼저 믿는다

현대 컴파일러는 `-O2`만 켜도 상수 나눗셈을 곱셈과 시프트로 바꾸고, 루프를 펼치고, 반복 연산을 SIMD로 벡터화하고, `if-else` 사슬을 테이블로 바꾼다. 손으로 하는 최적화는 대부분 이 결과보다 나쁘거나 같다. 순서는 이렇다.

1. 프로파일러(`perf`, Instruments)로 **실제로 느린 곳**을 찾는다.
2. 그 부분의 어셈블리를 확인한다(`-S` 또는 Compiler Explorer). 컴파일러가 이미 최적화했는지 본다.
3. 안 되었으면 컴파일러가 최적화할 수 있도록 **정보를 준다**(힌트, `restrict`, 정렬 보장).
4. 그래도 부족할 때만 내장 함수(intrinsics)나 어셈블리로 직접 쓴다.

최적화의 배경이 되는 CPU 파이프라인과 분기 예측은 [[pipeline-and-parallelism|파이프라인과 병렬 처리]]에 있다.

## switch는 테이블이 된다

분기 하나하나는 파이프라인을 멈출 위험이 있다. 입력 값이 촘촘한 범위의 정수라면, 비교를 반복하는 대신 값을 인덱스로 쓰는 **룩업 테이블(LUT)**로 바꿀 수 있다.

```c
int score(int n)
{
    switch (n) {
    case 0:                 return 5;
    case 1: case 2: case 3: return 10;
    case 5: case 7:         return 15;
    default:                return 0;
    }
}

/* 컴파일러가 만드는 것과 같은 모양 */
int score_lut(int n)
{
    static const int lut[8] = { 5, 10, 10, 10, 0, 15, 0, 15 };
    if ((unsigned)n > 7u)   /* 음수까지 한 번의 비교로 걸러냄 */
        return 0;
    return lut[n];
}
```

Clang과 GCC는 위 `switch`를 실제로 범위 검사 한 번과 테이블 읽기 한 번으로 컴파일한다. 각 `case`가 값이 아니라 코드를 실행해야 하면 테이블에 **점프할 주소**를 담는 **점프 테이블**을 만든다. 요즘 컴파일러는 같은 조건의 `if-else` 사슬도 똑같이 바꾸므로, `switch`와 `if-else`의 성능 차이를 걱정할 필요는 거의 없다.

### 도달 불가 힌트

입력이 항상 0~7이라는 것을 프로그래머는 알지만 컴파일러는 모른다. 알려 주면 범위 검사까지 사라진다.

```c
default:
    unreachable();   /* C23 <stddef.h>. GCC·Clang은 __builtin_unreachable(), MSVC는 __assume(0) */
```

정말 도달하면 미정의 동작이다. 디버그 빌드에서는 `assert(0)`로 확인하고 릴리스에서만 힌트로 바꾸는 식으로 쓴다.

## 분기 예측 힌트

CPU는 분기 결과를 기다리지 않고 한쪽을 **예측**해 미리 실행한다. 틀리면 파이프라인을 비우고 다시 시작한다(수십 사이클 손해). 예측기는 실행 이력을 학습하지만, 컴파일러가 코드를 배치할 때는 어느 쪽이 자주 실행되는지 모른다.

어느 쪽이 대부분인지 확실히 알면 힌트를 준다.

```c
/* GCC·Clang */
#define likely(x)   __builtin_expect(!!(x), 1)
#define unlikely(x) __builtin_expect(!!(x), 0)

if (unlikely(ptr == NULL))
    return handle_error();
```

C++20에는 `[[likely]]`·`[[unlikely]]` 속성이 있다(C23에는 아직 없다). 힌트를 받은 컴파일러는 자주 실행되는 쪽을 분기 명령 **바로 아래**에 배치한다. 그러면 예측 이력이 없는 첫 실행에서도 순서대로 흘러가고, 드문 경로가 중간에 끼지 않아 명령어 캐시 지역성이 좋아진다.

힌트가 틀리면 오히려 느려진다. 오류 처리처럼 확실한 경우에만 쓰고, 나머지는 **프로필 기반 최적화(PGO, `-fprofile-generate` → `-fprofile-use`)**로 실제 실행 데이터를 주는 편이 정확하다.

## SIMD: 한 명령으로 여러 데이터

**SIMD(Single Instruction, Multiple Data)** 명령은 128~512비트 레지스터에 값 여러 개를 담아 한 번에 계산한다. 4×4 행렬과 벡터의 곱처럼 같은 연산을 반복하는 그래픽·수치 코드에서 효과가 크다.

| 명령어 집합 | 레지스터 폭 | 환경 |
| --- | --- | --- |
| SSE ~ SSE4.2 | 128비트 (`xmm`) | 모든 x86-64 |
| AVX, AVX2 | 256비트 (`ymm`) | 최근 x86-64 대부분 |
| AVX-512 | 512비트 (`zmm`) | 서버·일부 데스크톱 CPU |
| NEON | 128비트 | ARM64(Apple Silicon 포함) |

쓰는 방법은 세 가지다.

| 방법 | 장단점 |
| --- | --- |
| 자동 벡터화 | `-O2`(GCC 12부터)·`-O3`에서 컴파일러가 루프를 벡터화. `-march=native`로 쓸 명령어 집합을 알려 준다. 가장 먼저 시도 |
| 내장 함수(intrinsics) | `<immintrin.h>`(x86), `<arm_neon.h>`(ARM)의 `_mm256_add_ps` 같은 함수. C 문법 안에서 레지스터 할당은 컴파일러가 맡는다. 직접 SIMD를 쓸 때의 표준 방법 |
| 인라인 어셈블리 | 완전한 통제. 이식성이 없고, MSVC는 x64에서 인라인 어셈블리를 지원하지 않는다 |

데이터를 SIMD 폭에 맞게 정렬(`alignas(32)`)하고, 구조체 배열(AoS)보다 배열 구조체(SoA)로 두면 벡터화가 쉬워진다.

## memset·memcpy는 건드리지 않는다

표준 라이브러리의 `memset`, `memcpy`는 CPU마다 가장 빠른 구현(SIMD, `rep stosb`, 캐시 우회 저장)이 이미 들어 있고, 컴파일러는 크기가 상수인 호출을 인라인 명령으로 바꾼다. 바이트 루프를 `long` 단위로 바꾸는 식의 직접 구현은 거의 언제나 더 느리다.

더 빨라질 여지는 **분기를 없애는 정보**에 있다. 범용 함수는 크기가 단위의 배수인지, 주소가 정렬되어 있는지 매번 검사한다. 크기와 정렬이 고정된 경우가 압도적으로 많다면 `memset_4096_aligned`처럼 전용 함수를 두어 검사를 없앨 수 있다. 그 전에 반드시 측정한다.

## 나눗셈을 곱셈으로

정수 나눗셈은 곱셈보다 몇 배 느리다. 제수가 상수면 컴파일러가 "역수를 고정소수점으로 곱하고 시프트"하는 코드로 바꿔 준다. 같은 제수로 여러 번 나누는데 그 값이 실행 중에 정해진다면, 역수를 한 번 계산해 두고 곱하는 방법을 직접 쓸 수 있다. 원리는 [[c-integer-types|C의 정수 자료형과 형 변환]]의 고정소수점 부분에 있다.

## 정리

- 먼저 측정하고, 어셈블리를 보고, 컴파일러가 못 한 부분만 손댄다.
- `switch`와 `if-else` 사슬은 테이블로 컴파일된다. `unreachable()`로 범위 검사까지 없앨 수 있다.
- 분기 힌트는 확실할 때만, 나머지는 PGO에 맡긴다.
- SIMD는 자동 벡터화 → 내장 함수 순서로 시도한다.
- 표준 메모리 함수는 이미 최적이다. 이길 수 있는 건 검사를 없애는 특수화뿐이다.

관련 노트: [[pipeline-and-parallelism|파이프라인과 병렬 처리]], [[memory-hierarchy|메모리 계층]], [[calling-convention|호출 규약과 스택 프레임]], [[gcc-compile-and-link|GCC 컴파일과 링크]]
