---
title: "C 입력과 파일 입출력"
concept: "File IO"
summary: "scanf로 표준 입력을 받고, fopen·fprintf·fread·fclose로 파일을 읽고 쓰는 C의 기본 입출력. 그 아래의 POSIX 저수준 입출력(open·read·write와 파일 디스크립터, read의 반환값 처리)과 stdio 버퍼링까지."
tags: ["c", "io", "file", "cs50", "os"]
source: notion
date: "2026-10-14"
sources: ["https://80000coding.notion.site/340d53d7bfb54f8b9df0d9acab3002a3", "https://80000coding.notion.site/44f89332af544b1e9fe25d9b6e76f1e2", "https://80000coding.notion.site/10981a9a178f440e98bfcba1d9c90bb6", "https://80000coding.notion.site/f217ea68a2da4e9da1f503e66f0b705e"]
---

> 저수준 입출력과 버퍼링 부분은 팔만코딩경(42Seoul 커뮤니티 위키)의 「파일 입출력: read()」, 「리눅스가 파일을 다루는 방식」, 「아니 그래서 printf 버퍼 관리가 뭔데…!!」, 「libft, 깨고 나니 보이는 것들」을 바탕으로 재구성했습니다.

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

## 저수준 입출력: open, read, write

`fopen`·`fread`는 C 표준 라이브러리(stdio)이고, 유닉스 계열에서는 그 아래에 POSIX 시스템 콜 `open`·`read`·`write`·`close`가 있다. 시스템 콜은 파일을 **파일 디스크립터(fd)**라는 작은 정수로 다룬다. 프로세스가 시작하면 0(표준 입력), 1(표준 출력), 2(표준 에러)가 이미 열려 있고, 새로 연 파일에는 비어 있는 가장 작은 번호가 붙는다. fd는 프로세스별 fd 테이블의 인덱스이고, 그 칸이 커널의 열린 파일 테이블과 inode를 가리킨다. 이 구조는 [[file-system|파일 시스템]]에 있다.

```c
#include <fcntl.h>
#include <unistd.h>

int fd = open("log.txt", O_WRONLY | O_CREAT | O_APPEND, 0644);  /* O_CREAT면 권한을 세 번째 인자로 */
if (fd == -1)
    return (perror("open"), 1);
write(fd, "hello\n", 6);
close(fd);
```

| 플래그 | 뜻 |
| --- | --- |
| `O_RDONLY` / `O_WRONLY` / `O_RDWR` | 읽기 / 쓰기 / 읽기·쓰기 (하나는 반드시) |
| `O_CREAT`, `O_EXCL` | 없으면 만든다, 이미 있으면 실패 (함께 쓰면 "새로 만들 때만") |
| `O_TRUNC` | 열면서 내용을 비운다 |
| `O_APPEND` | 쓰기가 항상 파일 끝에 붙는다 |
| `O_NONBLOCK` | 읽을 데이터가 없으면 기다리지 않고 바로 반환 |
| `O_CLOEXEC` | `exec`로 새 프로그램을 실행할 때 자동으로 닫힌다 |

### read의 반환값

`ssize_t read(int fd, void *buf, size_t len)`은 **요청한 만큼 읽는다는 보장이 없다.** 반환값으로 상황을 구분해야 한다.

| 반환값 | 뜻 | 대응 |
| --- | --- | --- |
| `len` | 요청한 만큼 읽음 | 계속 |
| 0 < n < `len` | 일부만 읽음 (파일 끝 근처, 파이프·소켓·터미널, 시그널) | 남은 만큼 다시 읽는다 |
| 0 | 파일 끝(EOF). 오류가 아니다 | 종료 |
| -1, `errno == EINTR` | 읽기 전에 시그널이 끼어듦 | 다시 호출 |
| -1, `errno == EAGAIN` | 논블록 모드에서 지금 읽을 데이터 없음 | 나중에 다시 |
| -1, 그 밖의 `errno` | `EBADF`(잘못된 fd), `EFAULT`(잘못된 버퍼), `EIO` 등 진짜 오류 | 처리하고 중단 |

블로킹 모드에서 읽을 데이터가 아직 없으면(빈 파이프, 입력을 기다리는 터미널) `read`는 0을 돌려주지 않고 **잠든다.** "데이터 없음"과 "끝"은 다르다. 정확히 `len`바이트가 필요하면 루프를 돈다.

```c
#include <errno.h>

ssize_t read_all(int fd, char *buf, size_t len)
{
    size_t done = 0;
    while (done < len) {
        ssize_t n = read(fd, buf + done, len - done);
        if (n == 0) break;                    /* EOF */
        if (n == -1) {
            if (errno == EINTR) continue;     /* 다시 시도 */
            return -1;
        }
        done += n;
    }
    return done;
}
```

`write`도 파이프나 소켓에서는 일부만 쓸 수 있으므로 같은 방식으로 반환값을 확인한다. `read`가 반환형으로 `ssize_t`를 쓰는 이유는 [[c-integer-types|C의 정수 자료형과 형 변환]]에 있다.

## stdio 버퍼링

시스템 콜은 커널 모드로 전환해야 해서 비싸다. 그래서 `printf`·`fwrite`는 데이터를 사용자 공간의 **버퍼**에 모아 두었다가 한 번에 `write`한다. 언제 내보내는지는 스트림의 버퍼링 모드가 정한다.

| 모드 | 내보내는 시점 | 기본으로 쓰이는 곳 |
| --- | --- | --- |
| 완전 버퍼링 | 버퍼가 찼을 때 | 파일, 파이프로 리다이렉션된 `stdout` |
| 줄 버퍼링 | 개행을 만났을 때 (또는 버퍼가 찼을 때) | 터미널에 연결된 `stdout` |
| 버퍼링 없음 | 즉시 | `stderr` |

어느 모드든 `fflush()`, `fclose()`, 정상 종료(`exit`, `main`의 `return`) 때도 버퍼가 비워진다. 그래서 다음 같은 일이 생긴다.

- `printf("loading..."); sleep(2);`는 개행이 없어 2초 뒤에야 보인다. `fflush(stdout)`으로 즉시 내보낸다.
- `printf`와 `write(1, ...)`를 섞으면 순서가 뒤바뀐다. `write`는 버퍼를 거치지 않는다.
- `./app | cat`처럼 파이프로 연결하면 줄 버퍼링이 완전 버퍼링으로 바뀌어 출력 시점이 달라진다.
- `fork` 전에 버퍼를 비우지 않으면 부모와 자식이 같은 버퍼 내용을 두 번 출력한다.
- `_exit()`이나 크래시로 끝나면 버퍼에 남은 내용은 사라진다.

버퍼링 모드는 `setvbuf(stdout, NULL, _IONBF, 0)`처럼 바꿀 수 있다. 직접 출력 함수를 만들 때 버퍼 관리를 흉내 낼 필요는 없지만, 결과를 배열에 모았다가 `write`를 한 번 호출하면 시스템 콜 횟수를 크게 줄일 수 있다.

## 핵심 정리

- `scanf`에는 저장할 주소를 넘긴다. 문자열은 폭 제한(`%4s`)으로 오버플로우를 막는다.
- 파일은 `fopen` → 읽기/쓰기 → `fclose` 순서로 다루고, `NULL` 검사를 잊지 않는다.
- 바이너리 데이터는 `unsigned char` 배열과 `fread`로 읽는다.
- 시스템 콜은 fd로 파일을 다룬다. `read`는 일부만 읽을 수 있으니 0(EOF)과 -1(`errno`)을 구분하며 루프를 돈다.
- stdio는 버퍼를 거친다. 터미널은 줄 단위, 파일·파이프는 버퍼가 찰 때 내보내고, 필요하면 `fflush`한다.

`fopen`·`fread` 아래에서 운영체제가 `open()`·`read()` 시스템 콜과 파일 디스크립터로 파일을 다루는 방식은 [[file-system|파일 시스템]]에 정리했다.

관련 노트: [[file-system|파일 시스템]], [[c-debugging-tools|C 디버깅 도구]], [[c-integer-types|C의 정수 자료형과 형 변환]]
