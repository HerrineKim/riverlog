---
title: "C 입력과 파일 입출력"
concept: "File IO"
summary: "scanf로 표준 입력을 받고, fopen·fprintf·fread·fclose로 파일을 읽고 쓰는 C의 기본 입출력."
tags: ["c", "io", "file", "cs50"]
source: notion
---

C에서 입력과 파일 처리는 모두 포인터를 기반으로 한다. `scanf`는 값을 저장할 **주소**를 받고, 파일은 `FILE *` 포인터로 다룬다.

## scanf로 입력받기

```c
#include <stdio.h>

int main(void)
{
    int x;
    printf("x: ");
    scanf("%i", &x);     // x의 주소를 넘겨야 그 위치에 값을 써 줄 수 있다
    printf("x: %i\n", x);
}
```

문자열은 문자 배열에 받는다.

```c
#include <stdio.h>

int main(void)
{
    char s[5];
    printf("s: ");
    scanf("%4s", s);     // 배열 이름은 첫 원소의 주소로 변환되므로 & 없이 넘긴다
    printf("s: %s\n", s);
}
```

- 배열 이름이 포인터처럼 쓰이는 것은 컴파일러 기능이 아니라 C 언어 규칙(배열→포인터 변환, array decay)이다.
- `scanf("%s", s)`처럼 폭을 지정하지 않으면 입력이 배열 크기를 넘을 때 **버퍼 오버플로우**가 발생한다. `\0` 자리를 남겨 `%4s`처럼 최대 길이를 지정하거나 `fgets`를 쓴다.

## 파일에 쓰기

```c
#include <cs50.h>
#include <stdio.h>

int main(void)
{
    FILE *file = fopen("phonebook.csv", "a");   // 덧붙이기 모드
    if (file == NULL)
    {
        return 1;
    }

    char *name = get_string("Name: ");
    char *number = get_string("Number: ");

    fprintf(file, "%s,%s\n", name, number);     // printf처럼, 단 파일에 출력
    fclose(file);
}
```

| 함수 | 역할 |
| --- | --- |
| `fopen(이름, 모드)` | 파일을 열고 `FILE *`를 반환. 실패하면 `NULL` |
| `fprintf(file, ...)` | 형식 문자열로 파일에 쓰기 |
| `fread(버퍼, 크기, 개수, file)` | 파일에서 바이트 읽기 |
| `fclose(file)` | 파일 닫기 (버퍼 내용 반영, 자원 반납) |

주요 모드: `"r"` 읽기, `"w"` 쓰기(기존 내용 삭제), `"a"` 덧붙이기. 바이너리 파일은 `"rb"`, `"wb"`처럼 `b`를 붙인다.

## 파일 읽기: JPEG 판별하기

JPEG 파일은 항상 `FF D8 FF` 세 바이트로 시작한다(매직 넘버). 이를 이용해 파일 형식을 추측할 수 있다.

```c
#include <stdio.h>

int main(int argc, char *argv[])
{
    if (argc != 2)                     // 파일명이 없거나 인자가 너무 많으면 오류
    {
        return 1;
    }

    FILE *file = fopen(argv[1], "rb");
    if (file == NULL)                  // fopen, malloc 등은 실패 시 NULL 반환
    {
        return 1;
    }

    unsigned char bytes[3];            // 0~255 범위로 다루기 위해 unsigned
    fread(bytes, 3, 1, file);          // 3바이트짜리 덩어리 1개 읽기

    if (bytes[0] == 0xff && bytes[1] == 0xd8 && bytes[2] == 0xff)
    {
        printf("Maybe\n");
    }
    else
    {
        printf("No\n");
    }
    fclose(file);
}
```

## 핵심 정리

- `scanf`에는 저장할 주소를 넘긴다. 문자열은 폭 제한(`%4s`)으로 오버플로우를 막는다.
- 파일은 `fopen` → 읽기/쓰기 → `fclose` 순서로 다루고, `NULL` 검사를 잊지 않는다.
- 바이너리 데이터는 `unsigned char` 배열과 `fread`로 읽는다.
