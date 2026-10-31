---
title: "C의 정수 자료형과 형 변환"
concept: "Integer Types"
summary: "C 표준은 자료형의 최소 크기만 정한다. 고정 폭 정수(stdint.h)와 size_t, 정수 승격과 일반 산술 변환, 부호 확장, 부호 있는 정수 오버플로가 미정의 동작인 이유, 부동소수점 비교와 고정소수점까지 C에서 숫자가 예상과 다르게 계산되는 지점을 정리한다."
tags: ["c", "computer-science", "memory", "type"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/2dfd43ab9e184c7a9056e6fde4848b77", "https://80000coding.notion.site/8051d71ed91d4fc8a49281d93c21ad74", "https://80000coding.notion.site/55f0f3945bac423286efc72b9e194e11", "https://80000coding.notion.site/1a5b31cb355741748a9af33adf497fc6", "https://80000coding.notion.site/2393bba5dab449ad93d4a221262a1e7e", "https://80000coding.notion.site/405b810d81b8452ea6f9b1282d816ba4", "https://80000coding.notion.site/fbebe8bd620e41bb86c4ab0f580e6f10", "https://80000coding.notion.site/cafa9acc2af849fd8e2a855d1b71b394", "https://80000coding.notion.site/bbe65c2efe264c5c91d62e1d74430114", "https://80000coding.notion.site/f217ea68a2da4e9da1f503e66f0b705e", "https://en.cppreference.com/w/c/language/conversion"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「기초중의 기초 - C언어 자료형」, 「Casting, Sign extension」, 「char는 char로 연산이 안된다고?」, 「오버플로우와 언더플로우」, 「int의 오버플로우가 위험한 이유」, 「size_t 란 ?」, 「메모리 주소는 왜 16진수로 표현할까?」, 「이해하기 쉬운 고정소수점 샘플」, 「isnan, isinf 구현하기」, 「libft, 깨고 나니 보이는 것들」을 바탕으로 재구성한 노트다.

## 크기는 최소만 정해져 있다

C 표준은 정수 자료형의 **정확한 크기를 정하지 않는다.** 최소 크기와 대소 관계만 정한다. 그래서 같은 코드가 플랫폼에 따라 다른 범위를 갖는다.

| 자료형 | 표준이 보장하는 최소 | LP64(리눅스·macOS 64비트) | LLP64(윈도 64비트) |
| --- | --- | --- | --- |
| `char` | 8비트 | 8 | 8 |
| `short` | 16비트 | 16 | 16 |
| `int` | 16비트 | 32 | 32 |
| `long` | 32비트 | **64** | **32** |
| `long long` | 64비트 | 64 | 64 |
| 포인터 | (규정 없음) | 64 | 64 |

`char`가 부호 있는지도 구현마다 다르다. x86에서는 보통 `signed char`, ARM 리눅스에서는 `unsigned char`처럼 동작한다. 바이트 값을 다룰 때는 `unsigned char`를 명시한다. 각 자료형의 실제 범위는 `<limits.h>`의 `INT_MAX`, `LONG_MIN` 등으로 확인한다.

## 크기가 중요하면 고정 폭 정수

C99부터 `<stdint.h>`가 크기를 이름에 박은 자료형을 제공한다.

| 자료형 | 뜻 |
| --- | --- |
| `int8_t` … `int64_t`, `uint8_t` … `uint64_t` | 정확히 그 폭 (파일 포맷, 네트워크 프로토콜, 비트 조작) |
| `int_least32_t`, `int_fast32_t` | 최소 그 폭 / 그 폭 이상 중 가장 빠른 것 |
| `intptr_t`, `uintptr_t` | 포인터를 담을 수 있는 정수 |
| `intmax_t` | 가장 큰 정수 |

`printf`로 출력할 때는 `<inttypes.h>`의 `PRId64`, `PRIu32` 매크로를 쓴다. `%lld`로 `int64_t`를 찍으면 `long`이 64비트인 플랫폼에서 경고가 난다.

## size_t와 ssize_t

**`size_t`**는 `sizeof` 연산의 결과 타입이며, 그 플랫폼에서 가능한 가장 큰 객체의 크기를 담을 수 있는 **부호 없는** 정수다. 64비트 환경에서는 64비트, 32비트 환경에서는 32비트가 된다. `strlen`의 반환값, `malloc`·`memset`의 크기 인자처럼 "크기·길이·인덱스"에 쓴다. 출력 서식은 `%zu`다.

**`ssize_t`**는 POSIX가 정의한 부호 있는 버전이다. `read`·`write`가 "읽은 바이트 수, 실패하면 -1"을 돌려주려고 쓴다.

부호 없는 타입은 0 아래로 내려가면 최댓값으로 감긴다. `for (size_t i = n - 1; i >= 0; i--)`는 영원히 끝나지 않는다. 거꾸로 도는 루프는 `for (size_t i = n; i-- > 0;)`처럼 쓴다.

## 정수 승격과 산술 변환

C는 연산 전에 피연산자의 타입을 **암묵적으로** 바꾼다. 이 규칙을 모르면 "분명 `unsigned char`끼리 뺐는데 음수가 나오는" 일을 겪는다.

1. **정수 승격(integer promotion)**: `int`보다 작은 타입(`char`, `short`, 비트 필드)은 연산에 쓰이기 전에 `int`로 바뀐다. `int`로 다 표현할 수 없으면 `unsigned int`로 바뀐다.
2. **일반 산술 변환(usual arithmetic conversions)**: 승격 후 두 피연산자의 타입이 다르면 더 큰 쪽으로 맞춘다. 같은 순위에서 하나가 부호 없으면 **부호 없는 쪽**으로 맞춘다.

```c
unsigned char a = 0, b = 1;
printf("%d\n", a - b);              /* -1: 둘 다 int로 승격된 뒤 계산 */
printf("%d\n", (unsigned char)(a - b)); /* 255: 결과를 다시 줄여야 감긴다 */

int i = -1;
unsigned int u = 1;
if (i < u) puts("never");           /* -1이 unsigned로 바뀌어 4294967295 < 1 → 거짓 */
```

부호 있는 값과 부호 없는 값을 비교하는 코드는 `-Wextra`의 `-Wsign-compare` 경고로 잡는다.

## 부호 확장

부호 있는 정수를 더 넓은 타입으로 바꿀 때는 **부호 비트를 복사해 채운다(sign extension)**. 부호 없는 정수는 0으로 채운다(zero extension). 음수가 2의 보수로 저장되기 때문에 값이 보존된다. 2의 보수 자체는 [[data-representation|데이터 표현]]에 있다.

```text
int8_t  -2  :                     1111 1110
int32_t -2  : 1111 1111 1111 1111 1111 1111 1111 1110   (부호 확장)
uint8_t 254 :                     1111 1110
uint32_t 254: 0000 0000 0000 0000 0000 0000 1111 1110   (0 확장)
```

**언제 넓히느냐**가 결과를 바꾼다. `INT_MIN`의 절댓값을 `long long`으로 구할 때:

```c
int n = INT_MIN;                 /* -2147483648 */
long long a = (long long)n * -1; /* 먼저 넓힌 뒤 곱함 → 2147483648 */
long long b = n * -1;            /* int끼리 곱해 오버플로(미정의 동작) → 넓혀도 늦음 */
```

## 오버플로: 부호 있는 쪽은 미정의 동작

| 타입 | 범위를 넘으면 |
| --- | --- |
| 부호 없는 정수 | 2ⁿ으로 나눈 나머지로 **감긴다**(wrap-around). 표준이 정의한 동작이다 |
| 부호 있는 정수 | **미정의 동작(undefined behavior)**. 감길 수도, 트랩될 수도, 컴파일러가 "일어나지 않는다"고 가정하고 코드를 지울 수도 있다 |

C23부터 부호 있는 정수는 2의 보수 표현이 표준으로 못 박혔지만, 오버플로가 미정의 동작인 점은 그대로다. 그래서 `if (x + 1 < x)` 같은 오버플로 검사는 최적화 과정에서 통째로 사라질 수 있다. 미리 범위를 확인하거나(`if (x > INT_MAX - 1)`), C23의 `<stdckdint.h>`에 있는 `ckd_add(&r, a, b)`(GCC·Clang의 `__builtin_add_overflow`)를 쓴다. `atoi`가 범위를 넘는 입력에 대해 동작이 정의되지 않는 것도 같은 이유라서, 문자열 변환은 `strtol`로 하고 `errno`와 범위를 확인한다.

## 주소를 16진수로 쓰는 이유

16진수 한 자리는 정확히 4비트다. 1바이트는 두 자리, 64비트 주소는 열여섯 자리로 깔끔하게 끊어져 비트 패턴을 읽기 쉽다. 주소는 `%p`로 출력하고, 정수로 다뤄야 하면 `int`가 아니라 `uintptr_t`로 바꾼다. 64비트 주소를 `%d`로 찍으면 하위 32비트만 잘려 음수처럼 보인다.

## 실수: 부동소수점과 고정소수점

`float`와 `double`은 IEEE 754 이진 부동소수점이라 0.1 같은 값을 정확히 담지 못한다. `0.1f`를 열 번 더해도 `1.0f`와 같지 않다. 비교는 `fabs(a - b) <= 허용 오차`로 하되, 허용 오차를 값의 크기에 비례하게 잡아야 한다(`FLT_EPSILON`은 1.0 근처의 간격이다). NaN은 자기 자신과도 같지 않으므로 판별은 `isnan()`, 무한대는 `isinf()`로 한다. 부동소수점 함정 전반은 [[developer-traps|개발자가 빠지는 함정 모음]]에 있다.

**고정소수점(fixed-point)**은 정수의 일부 비트를 소수부로 약속해 쓰는 방법이다. 예를 들어 64비트 정수의 하위 32비트를 소수부로 두면, 상수 `d`로 나누는 연산을 미리 계산한 역수 `(1 << 32) / d`를 곱하고 32비트 오른쪽 시프트하는 것으로 바꿀 수 있다. 정수 곱셈은 나눗셈보다 몇 배 빠르다. 컴파일러는 상수 나눗셈을 이미 이런 식으로 바꿔 주므로, 직접 쓸 일은 나눗셈 제수가 실행 중에 정해지지만 여러 번 재사용될 때나 FPU가 없는 임베디드 환경 정도다.

## 정리

- 정수 크기는 플랫폼마다 다르다. 크기가 의미 있으면 `<stdint.h>`, 크기·인덱스는 `size_t`.
- `int`보다 작은 타입은 연산 전에 `int`로 승격되고, 부호가 섞이면 부호 없는 쪽으로 맞춰진다.
- 넓히는 변환은 연산 **전에** 한다. 오버플로가 난 뒤에 넓히면 늦다.
- 부호 있는 정수 오버플로는 미정의 동작이다. 검사는 연산 전에, 또는 `ckd_add` 계열로 한다.

관련 노트: [[data-representation|데이터 표현]], [[computer-arithmetic|컴퓨터 산술]], [[c-basics|C 기초]], [[c-history-and-standards|C의 역사와 표준]]
