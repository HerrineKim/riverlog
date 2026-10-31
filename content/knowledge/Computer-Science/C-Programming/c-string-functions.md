---
title: "C 문자열 라이브러리: ctype.h, string.h, 안전한 대안과 숫자 변환"
concept: "C String Functions"
summary: "C 표준 라이브러리의 문자 처리(ctype.h)와 문자열 처리(string.h) 함수를 쓰임새별로 정리하고, 각 함수의 함정을 짚는다. strcpy·strcat은 길이를 검사하지 않고, strncpy는 널 문자를 붙이지 않을 수 있으며, strtok은 원본을 고치고 상태를 숨겨 둔다. 문자열 조립은 snprintf, 한 줄 입력은 fgets, 숫자 변환은 오류를 알려 주는 strtol·strtod를 쓴다."
tags: ["c", "string", "security", "memory"]
source: other
date: "2026-10-31"
sources: ["고려사이버대학교 프로그래밍 기초와 실습(C언어) 강의(권오상 교수, 2024-2학기)"]
---

> 고려사이버대학교 「프로그래밍 기초와 실습(C언어)」(2024-2학기) 강의 내용을 바탕으로 정리했다.

## 전제: C 문자열은 널 종단 char 배열

C에는 문자열 타입이 없다. 문자열은 끝에 널 문자 `'\0'`이 붙은 `char` 배열이고, 문자열 함수는 모두 `'\0'`을 만날 때까지 앞으로 나아간다. 길이 정보가 따로 없으므로 **함수는 목적지 배열이 얼마나 큰지 모른다.** 이 노트의 함정 대부분이 여기서 나온다.

배열과 문자열 리터럴의 차이, 리터럴이 읽기 전용인 이유는 [[pointers-and-memory|포인터와 메모리]]에, 기초 개념은 [[c-basics|C 기초]]에 있다. 여기서는 라이브러리 함수만 다룬다.

```c
char s[10] = "Hello";
s = "World";          /* 오류: 배열에는 대입할 수 없다 */
strcpy(s, "World");   /* 내용을 복사해야 한다 */
```

## 문자 처리: ctype.h

문자 하나를 검사하거나 바꾼다. 검사 함수는 참이면 0이 아닌 값, 거짓이면 0을 돌려준다(1이라는 보장은 없다).

| 함수 | 참이 되는 문자 |
| --- | --- |
| `isalpha` | 영문자 |
| `isdigit` | `0`~`9` |
| `isalnum` | 영문자 또는 숫자 |
| `isxdigit` | 16진수 숫자 (`0-9a-fA-F`) |
| `isupper`, `islower` | 대문자, 소문자 |
| `isspace` | 공백, `\t`, `\n`, `\v`, `\f`, `\r` |
| `ispunct` | 구두점 |
| `isprint`, `iscntrl` | 출력 가능 문자, 제어 문자 |
| `toupper`, `tolower` | 대·소문자로 바꾼 값을 돌려준다. 해당 없으면 그대로 |

- **인자는 `unsigned char`로 표현되는 값이나 `EOF`여야 한다.** `char`가 부호 있는 플랫폼에서 한글 UTF-8 바이트(0x80 이상)를 그대로 넘기면 음수가 되어 미정의 동작이다. `isalpha((unsigned char)c)`처럼 변환해서 넘긴다.
- 결과는 현재 로케일을 따른다. 기본 `"C"` 로케일에서는 ASCII만 판별한다. 유니코드 문자 분류가 필요하면 `<wctype.h>`나 ICU 같은 라이브러리를 쓴다.

## 문자열 처리: string.h

| 함수 | 하는 일 | 함정 |
| --- | --- | --- |
| `strlen(s)` | `'\0'` 앞까지의 길이 | 매번 끝까지 센다(O(n)). `for (i = 0; i < strlen(s); i++)`는 O(n²) |
| `strcpy(d, s)` | `s`를 `d`에 복사 | `d`의 크기를 검사하지 않아 버퍼 오버플로 |
| `strcat(d, s)` | `d` 끝에 `s`를 이어 붙임 | 같은 문제. 게다가 `d`의 끝을 찾느라 매번 처음부터 센다 |
| `strncpy(d, s, n)` | 최대 `n`바이트 복사 | `s`가 `n` 이상이면 **`'\0'`을 붙이지 않는다.** 짧으면 나머지를 `'\0'`으로 다 채운다 |
| `strncat(d, s, n)` | `s`에서 최대 `n`글자를 덧붙이고 `'\0'`을 붙임 | `n`은 `d`의 크기가 아니라 덧붙일 글자 수다 |
| `strcmp(a, b)` | 사전순 비교 | 같으면 0. 다르면 **음수·양수**를 돌려줄 뿐 -1·1이라는 보장은 없다 |
| `strncmp(a, b, n)` | 앞 `n`글자만 비교 | 접두사 검사에 쓴다 |
| `strchr(s, c)`, `strrchr` | 문자의 처음·마지막 위치 | 없으면 `NULL`. 역참조 전에 검사한다 |
| `strstr(s, sub)` | 부분 문자열 위치 | 없으면 `NULL` |
| `strtok(s, delim)` | 구분자로 토큰 분리 | 원본에 `'\0'`을 써 넣어 망가뜨리고, 내부 정적 상태를 써서 중첩·멀티스레드에서 깨진다. POSIX의 `strtok_r`을 쓴다 |
| `memcpy`, `memmove`, `memset` | 바이트 단위 복사·채우기 | 겹치는 영역은 `memmove` ([[pointers-and-memory\|포인터와 메모리]]) |

`if (strcmp(a, b))`는 "다르면"이라는 뜻이다. 읽는 사람이 헷갈리므로 `strcmp(a, b) == 0`처럼 비교를 명시한다.

### strncpy는 안전한 strcpy가 아니다

`strncpy`는 원래 고정 길이 레코드 필드를 채우려고 만든 함수라, 이름과 달리 문자열 복사용으로 맞지 않는다.

```c
char name[8];
strncpy(name, "Christopher", sizeof name);   /* 8바이트가 꽉 차고 '\0'이 없다 */
printf("%s\n", name);                         /* 배열 밖까지 읽는다 */
```

길이를 제한한 복사·이어 붙이기는 다음 중 하나를 쓴다.

| 방법 | 특징 |
| --- | --- |
| `snprintf(d, sizeof d, "%s", s)` | 표준 C99. 항상 `'\0'`으로 끝내고, 원래 필요했던 길이를 돌려주므로 잘림을 검사할 수 있다 |
| `strlcpy`, `strlcat` | BSD에서 시작. 항상 `'\0'`으로 끝내고 필요 길이를 돌려준다. glibc 2.38과 POSIX.1-2024에 들어갔다 |
| `strcpy_s` 등 (C11 부록 K) | 표준의 선택 사항이라 구현이 드물다. 사실상 MSVC 전용이다 |

```c
int need = snprintf(path, sizeof path, "%s/%s.txt", dir, name);
if (need < 0 || (size_t)need >= sizeof path) {
    /* 잘렸다: 오류 처리 */
}
```

## 한 줄 입력

`gets`는 목적지 크기를 받지 않아 입력이 길면 무조건 버퍼를 넘친다. C11에서 표준에서 삭제됐다. 대신 `fgets`를 쓴다.

```c
char line[128];
if (fgets(line, sizeof line, stdin) != NULL) {
    line[strcspn(line, "\n")] = '\0';   /* fgets가 남긴 줄바꿈 제거 */
}
```

- `fgets`는 최대 `size - 1`글자를 읽고 `'\0'`을 붙인다. 줄바꿈까지 읽혔다면 줄바꿈도 문자열에 들어 있다.
- 줄이 버퍼보다 길면 나머지는 다음 `fgets`가 읽는다. 문자열에 `'\n'`이 없으면 잘렸다는 뜻이다.
- `gets_s(buf, size)`는 C11 부록 K의 함수라 MSVC 밖에서는 쓸 수 없다.
- `scanf("%s")`의 폭 지정 문제는 [[file-io|C 입력과 파일 입출력]]에 있다.

## 문자열과 숫자 변환

문자열 `"36.5"`와 `double` 36.5는 메모리에서 전혀 다른 바이트다. 변환 함수가 따로 필요하다.

| 함수 | 방향 | 오류 감지 |
| --- | --- | --- |
| `atoi`, `atol`, `atof` | 문자열 → 숫자 | 없다. `"abc"`도 0을 돌려주고, 범위를 넘으면 미정의 동작 |
| `strtol`, `strtoul`, `strtod` | 문자열 → 숫자 | 변환이 멈춘 위치(`endptr`)와 범위 초과(`errno == ERANGE`)를 알려 준다 |
| `sscanf(s, "%d", &n)` | 문자열 → 여러 값 | 성공한 항목 수를 돌려준다. 범위 초과는 미정의 동작 |
| `snprintf(buf, n, "%d", x)` | 숫자 → 문자열 | 필요 길이를 돌려준다. `sprintf`는 크기 검사가 없다 |

```c
#include <errno.h>
#include <stdlib.h>

int parse_port(const char *s, long *out) {
    char *end;
    errno = 0;
    long v = strtol(s, &end, 10);
    if (end == s || *end != '\0') return -1;          /* 숫자가 아니거나 뒤에 쓰레기 */
    if (errno == ERANGE || v < 1 || v > 65535) return -1;
    *out = v;
    return 0;
}
```

사용자 입력이나 파일 내용처럼 믿을 수 없는 문자열은 `strtol` 계열로 바꾸고, `atoi`는 이미 검증된 값에만 쓴다.

## 정리

- 문자열 함수는 목적지 크기를 모른다. 크기를 받는 함수(`snprintf`, `fgets`, `strlcpy`)를 고른다
- `strncpy`는 `'\0'`을 보장하지 않는다. `gets`는 삭제됐다. `strtok`은 원본을 고치고 재진입하지 못한다
- `ctype.h` 함수에는 `(unsigned char)`로 변환해서 넘긴다
- `strcmp`는 0이면 같다. 결과의 크기가 아니라 부호만 본다
- 숫자 변환은 오류를 알려 주는 `strtol`·`strtod`로

관련 노트: [[c-basics|C 기초]], [[pointers-and-memory|포인터와 메모리]], [[file-io|C 입력과 파일 입출력]], [[c-debugging-tools|C 디버깅 도구]], [[c-history-and-standards|C의 역사와 표준]]
