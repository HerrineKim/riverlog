---
title: "C 공용체, 열거형, typedef"
concept: "Union & Enum"
summary: "구조체가 멤버마다 따로 메모리를 두는 반면 공용체(union)는 모든 멤버가 한 메모리를 공유해 크기가 가장 큰 멤버만큼이고 한 번에 한 멤버만 의미가 있다. 그래서 어떤 멤버가 유효한지 표시하는 태그와 함께 쓰는 태그 공용체가 기본 패턴이다. 열거형(enum)은 이름 붙은 정수 상수 묶음이고, typedef는 새 타입이 아니라 기존 타입의 별명이다."
tags: ["c", "memory", "type", "struct", "data-structure"]
source: other
date: "2026-10-31"
sources: ["고려사이버대학교 프로그래밍 기초와 실습(C언어) 강의(권오상 교수, 2024-2학기)"]
---

> 고려사이버대학교 「프로그래밍 기초와 실습(C언어)」(2024-2학기) 강의 내용을 바탕으로 정리했다.

## 사용자 정의 타입 네 가지

| 종류 | 키워드 | 하는 일 |
| --- | --- | --- |
| 구조체 | `struct` | 서로 다른 타입의 값을 **모두 함께** 묶는다 |
| 공용체 | `union` | 서로 다른 타입 중 **하나를** 같은 자리에 담는다 |
| 열거형 | `enum` | 가능한 값의 목록에 이름을 붙인다 |
| 별명 | `typedef` | 기존 타입에 다른 이름을 붙인다 |

구조체의 메모리 배치·패딩, 함수 포인터와 조합하는 법은 [[c-struct-and-function-pointer|구조체와 함수 포인터]]에 있다.

구조체와 공용체 변수끼리는 `=`로 통째로 대입할 수 있지만 `==`로 비교할 수는 없다. 멤버 사이의 패딩 바이트에 쓰레기 값이 있을 수 있어 `memcmp`로 비교하는 것도 위험하다. 멤버를 하나씩 비교하는 함수를 만든다.

## 공용체

```c
union number {
    int    i;
    double d;
    char   bytes[8];
};
```

| | 구조체 | 공용체 |
| --- | --- | --- |
| 멤버의 메모리 | 각자 다른 위치 | 모두 같은 시작 주소 |
| 크기 | 멤버 크기의 합 + 패딩 | 가장 큰 멤버 크기 + 정렬용 패딩 |
| 동시에 유효한 멤버 | 전부 | 마지막에 쓴 하나 |

공용체에 `d`를 쓰고 `i`를 읽으면 `double`의 바이트 일부를 `int`로 해석한 값이 나온다. 공용체 자체는 **지금 어느 멤버가 들어 있는지 기억하지 않는다.** 그것을 기억하는 것은 프로그래머의 몫이다.

### 태그 공용체

그래서 공용체는 보통 "어느 멤버가 유효한지"를 나타내는 열거형 태그와 함께 구조체로 감싸 쓴다. 이를 태그 공용체(tagged union) 또는 판별 공용체라 한다.

```c
enum shape_kind { SHAPE_CIRCLE, SHAPE_RECT };

struct shape {
    enum shape_kind kind;          /* 태그: 아래 union에서 어느 쪽이 유효한가 */
    union {
        struct { double r; } circle;
        struct { double w, h; } rect;
    };                              /* 이름 없는 공용체 (C11) */
};

double area(const struct shape *s) {
    switch (s->kind) {
    case SHAPE_CIRCLE: return 3.14159 * s->circle.r * s->circle.r;
    case SHAPE_RECT:   return s->rect.w * s->rect.h;
    }
    return 0;
}
```

- 여러 종류 중 하나인 값(도형, JSON 값, 토큰, 메시지)을 하나의 타입으로 표현하면서, 메모리는 가장 큰 경우만큼만 쓴다.
- 이것이 타입 이론의 **합 타입(sum type)**이다. Rust의 `enum`, Swift의 연관 값 `enum`, TypeScript의 판별 유니온, C++의 `std::variant`는 태그 확인을 언어나 라이브러리가 강제한다. C에서는 태그와 실제 내용이 어긋나도 아무도 막지 않는다. 자세한 비교는 [[type-systems|타입 시스템]]에 있다.

### 타입 퍼닝

공용체로 같은 바이트를 다른 타입으로 읽는 것을 타입 퍼닝(type punning)이라 한다. C는 이를 허용하고 "바이트를 새 타입으로 재해석한다"고 정한다. 바이트 순서 확인이 대표적인 예다.

```c
union { uint32_t word; uint8_t byte[4]; } probe = { .word = 1 };
int little_endian = (probe.byte[0] == 1);
```

C++에서는 마지막에 쓰지 않은 멤버를 읽는 것이 미정의 동작이다. C++에서는 `memcpy`나 C++20의 `std::bit_cast`를 쓴다. 바이트 순서 자체는 [[data-representation|데이터 표현]]을 참고한다.

## 열거형

```c
enum weekday { MON = 1, TUE, WED, THU, FRI, SAT, SUN };   /* TUE = 2, WED = 3, ... */
enum weekday today = WED;
```

- 값을 주지 않으면 0부터 시작하고, 이후 상수는 바로 앞 값 + 1이 된다. 중간에 값을 지정하면 거기서부터 다시 1씩 늘어난다.
- **열거 상수는 그냥 `int` 상수다.** C의 열거형은 타입 검사가 약해서 `enum weekday d = 42;`도 컴파일된다. 다른 열거형끼리 섞어도 막지 않는다.
- 그래도 정수를 바로 쓰는 것보다 낫다. 이름이 의미를 설명하고, 디버거가 이름을 보여 주며, `switch`에서 빠진 경우를 `-Wswitch`(`-Wall`에 포함)가 경고한다. `default`를 두면 이 경고가 꺼지므로, 모든 경우를 다루는 `switch`에는 `default`를 두지 않는 편이 낫다.
- C23부터 `enum color : uint8_t { ... }`처럼 바탕 타입을 정할 수 있다.
- C++의 `enum class`는 정수로 암묵 변환되지 않고 이름이 열거형 범위 안에 갇히는, 타입 안전한 열거형이다.

| 상수 정의 방법 | 장단점 |
| --- | --- |
| 정수 리터럴 직접 사용 | 의미를 알 수 없는 매직 넘버 |
| `#define LCD 1` | 전처리기 치환이라 컴파일러와 디버거가 이름을 모른다 |
| `enum tv { LCD, OLED };` | 관련 상수를 묶고 번호를 자동으로 매긴다. 정수 상수가 필요한 곳(배열 크기, `case`)에 쓸 수 있다 |

기호 상수를 고르는 기준은 [[c-scope-and-linkage|C의 스코프와 링키지]]에 더 있다.

## typedef

`typedef`는 **새 타입을 만들지 않고 기존 타입에 별명을 붙인다.** 별명과 원래 타입은 완전히 같은 타입이라 서로 섞어 써도 컴파일러가 구분하지 않는다.

```c
typedef unsigned char byte_t;
typedef struct point { double x, y; } point;        /* struct point를 point로 */
typedef int (*compare_fn)(const void *, const void *); /* 함수 포인터 타입 */
```

| 쓰임 | 이유 |
| --- | --- |
| 구조체·공용체 이름 줄이기 | `struct point p` 대신 `point p` |
| 함수 포인터 | 선언이 복잡한 타입을 읽기 쉽게 |
| 플랫폼 독립 타입 | `size_t`, `uint32_t`, `pid_t`처럼 플랫폼마다 실제 타입이 다른 것을 한 이름으로 |
| 불투명 타입 | 헤더에는 `typedef struct vec vec;`만 두고 정의는 숨긴다 |

- 포인터를 `typedef`로 숨기면(`typedef struct node *node_ptr;`) 변수가 포인터라는 사실이 보이지 않고 `const node_ptr`이 "가리키는 대상이 const"가 아니라 "포인터가 const"가 되는 혼란이 생긴다. 불투명 핸들이 아니라면 포인터는 `*`를 드러내 쓴다.
- `_t`로 끝나는 이름은 POSIX가 예약해 두었다. 이식성이 중요한 코드에서는 자기 타입 이름에 `_t`를 붙이지 않는 규칙을 쓰기도 한다.
- 진짜 다른 타입이 필요하면(미터와 피트를 섞지 못하게) 멤버 하나짜리 구조체로 감싼다. `typedef double meter;`로는 막을 수 없다.

## 정리

- 공용체는 멤버들이 한 메모리를 공유하고, 크기는 가장 큰 멤버만큼이다. 지금 어느 멤버인지는 스스로 기억하지 않는다
- 공용체는 태그 열거형과 함께 쓴다(태그 공용체, 합 타입)
- 열거 상수는 `int` 상수다. 타입 검사는 약하지만 이름과 `-Wswitch` 경고를 얻는다
- `typedef`는 별명일 뿐 새 타입이 아니다. 포인터는 숨기지 않는다
- 구조체·공용체는 대입은 되지만 `==` 비교는 안 된다. 패딩 때문에 `memcmp`도 피한다

관련 노트: [[c-struct-and-function-pointer|구조체와 함수 포인터]], [[c-scope-and-linkage|C의 스코프와 링키지]], [[c-integer-types|C의 정수 자료형과 형 변환]], [[type-systems|타입 시스템]], [[data-representation|데이터 표현]]
