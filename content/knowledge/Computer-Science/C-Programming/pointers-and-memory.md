---
title: "포인터와 메모리"
concept: "Pointer"
summary: "C에서 주소와 포인터로 메모리를 다루는 법: 문자열의 실체, 동적 할당과 해제, 스택과 힙."
tags: ["c", "memory", "pointer", "cs50"]
source: notion
date: "2026-10-14"
---

C의 변수는 메모리 어딘가에 놓인 바이트 묶음이고, **포인터**는 그 위치(주소)를 담는 변수다. 문자열 비교가 왜 실패하는지, swap 함수가 왜 동작하지 않는지 같은 C의 "이상한" 현상은 대부분 주소와 값을 구분하면 풀린다.

## 16진수와 메모리 주소

- 메모리는 바이트들이 한 줄로 늘어선 공간이고, 각 바이트에는 번호(주소)가 있다.
- 주소는 보통 **16진수**로 쓴다. 2진수 4비트 = 16진수 1자리이므로 **16진수 2자리 = 1바이트**로 딱 맞아떨어진다.
- `0x` 접두사는 뒤의 수가 16진수라는 표시다. 예: `0x7ffe00b3adbc`

## 주소 연산자 `&`와 역참조 연산자 `*`

```c
#include <stdio.h>

int main(void)
{
    int n = 50;              // int는 보통 4바이트
    printf("%p\n", &n);      // n의 주소, 예: 0x7ffe00b3adbc
    printf("%i\n", *&n);     // 그 주소에 있는 값: 50
}
```

- `&x`: x의 **주소**
- `*p`: 주소 p에 있는 **값** (역참조)
- 실행할 때마다 주소가 달라지는 것은 운영체제가 보안을 위해 주소 배치를 무작위화(ASLR)하기 때문이다.

## 포인터

```c
#include <stdio.h>

int main(void)
{
    int n = 50;
    int *p = &n;             // p는 int를 가리키는 포인터
    printf("%p\n", p);       // 주소
    printf("%i\n", *p);      // 50
}
```

- 포인터 타입은 "무엇을 가리키는지"를 함께 적는다: `int *`, `char *`, `float *` …
- 64비트 시스템에서 포인터 자체는 8바이트를 차지한다.
- 실제 주소 값보다는 "p가 n을 가리킨다"는 관계로 생각하면 된다. 포인터가 다른 데이터를 가리키고, 그 데이터가 또 다른 데이터를 가리키게 하면 연결 리스트나 트리 같은 자료구조를 만들 수 있다.

## 문자열의 정체: `char *`

```c
char *s = "EMMA";
```

- 메모리에는 `E`, `M`, `M`, `A`, `\0`(널 종단 문자) 5바이트가 연속으로 저장된다.
- `s`는 문자열 전체가 아니라 **첫 글자의 주소**를 담은 포인터다. 끝은 `\0`을 만날 때까지 읽어서 알아낸다.
- CS50 라이브러리의 `string`은 `typedef char *string;`으로 만든 별칭일 뿐, C에는 문자열 타입이 따로 없다.

```c
printf("%c\n", *s);        // E
printf("%c\n", *(s + 1));  // M  — s[1]과 같은 의미
```

`s[1]`은 `*(s + 1)`을 편하게 쓰는 문법(syntactic sugar)이다.

### 문자열 비교가 실패하는 이유

```c
#include <cs50.h>
#include <stdio.h>
#include <string.h>

int main(void)
{
    char *s = get_string("s: ");
    char *t = get_string("t: ");

    if (s == t)                  // 주소 비교 → 같은 내용이어도 Different
        printf("Same\n");

    if (strcmp(s, t) == 0)       // 내용 비교
        printf("Same content\n");
}
```

두 문자열은 서로 다른 위치에 저장되므로 `==`는 항상 다르다고 판단한다. 내용을 비교하려면 `strcmp`를 쓴다.

### 문자열 복사: 주소 복사 vs 내용 복사

```c
char *t = s;          // 주소만 복사 → t를 바꾸면 s도 바뀜
t[0] = toupper(t[0]); // s와 t 모두 "Emma"
```

실제로 다른 공간에 복사하려면 메모리를 새로 할당해야 한다.

```c
#include <cs50.h>
#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void)
{
    char *s = get_string("s: ");
    char *t = malloc(strlen(s) + 1);   // 문자 수 + '\0' 1바이트
    if (t == NULL)
    {
        return 1;
    }
    strcpy(t, s);
    t[0] = toupper(t[0]);

    printf("s: %s\n", s);   // emma
    printf("t: %s\n", t);   // Emma
    free(t);
}
```

## 동적 할당과 해제

- `malloc(n)`: n바이트를 힙에 할당하고 그 주소를 반환한다. 실패하면 `NULL`.
- `free(p)`: 할당받은 메모리를 반납한다. 반납하지 않으면 **메모리 누수**가 생긴다.

### valgrind로 메모리 오류 찾기

```c
#include <stdlib.h>

void f(void)
{
    int *x = malloc(10 * sizeof(int));  // 40바이트, 인덱스 0~9
    x[10] = 0;                          // 범위 밖 쓰기 → 버퍼 오버플로우
}                                       // free 없음 → 메모리 누수

int main(void)
{
    f();
    return 0;
}
```

```bash
valgrind ./program
```

valgrind는 잘못된 메모리 접근 위치와 누수된 바이트 수를 알려준다. 위 코드는 `x[9]`까지만 쓰고 마지막에 `free(x)`를 호출하면 고쳐진다.

## 값 전달과 swap

```c
void swap(int a, int b)   // x, y의 복사본을 받음
{
    int tmp = a;
    a = b;
    b = tmp;              // 복사본만 바뀌고 원본은 그대로
}
```

C는 인자를 **값으로 복사**해 전달한다. 원본을 바꾸려면 주소를 넘겨야 한다.

```c
#include <stdio.h>

void swap(int *a, int *b)
{
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void)
{
    int x = 1, y = 2;
    swap(&x, &y);
    printf("x is %i, y is %i\n", x, y);  // x is 2, y is 1
}
```

## 메모리 영역

| 영역 | 내용 |
| --- | --- |
| 코드(텍스트) | 컴파일된 기계어 |
| 전역(데이터) | 전역 변수, 정적 변수 |
| 힙 | `malloc`으로 할당한 데이터 |
| 스택 | 함수 호출 정보, 지역 변수, 매개변수 |

- 힙과 스택은 주소 공간의 양쪽에서 **서로를 향해** 자란다. `malloc`을 많이 하면 힙이, 함수 호출이 깊어지면 스택이 커진다.
- 할당량이 한계를 넘거나 서로의 영역을 침범하면 **힙 오버플로우 / 스택 오버플로우**가 생긴다. 끝없는 재귀([[recursion|재귀]])가 대표적인 스택 오버플로우 원인이다.

여기서 보는 주소는 실제 물리 주소가 아니라 프로세스마다 따로 갖는 **논리(가상) 주소**다. 운영체제와 MMU가 이를 물리 메모리에 어떻게 대응시키는지는 [[memory-management|메모리 관리]]와 [[virtual-memory|가상 메모리]]에서 다룬다.

## 핵심 정리

- `&`는 주소, `*`는 그 주소의 값. 포인터는 주소를 담는 변수다.
- 문자열은 `char *`이므로 `==`는 주소 비교, 내용 비교는 `strcmp`, 복사는 `malloc` + `strcpy`.
- `malloc`한 메모리는 반드시 `free`, 배열 범위 밖 접근은 버퍼 오버플로우.
- 함수에서 원본을 바꾸려면 포인터를 넘긴다.

관련 노트: [[c-pointer-pitfalls|C 포인터의 함정]], [[c-debugging-tools|C 디버깅 도구]]
