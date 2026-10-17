---
title: "UNIX 파일 입출력과 파일 디스크립터"
concept: "File Descriptor"
summary: "프로세스가 파일·파이프·소켓을 정수 하나(파일 디스크립터)로 다루는 UNIX 입출력 모델. 커널의 세 테이블, open 플래그와 read 반환값 처리, dup2와 리다이렉션, stdio 버퍼링 모드와 페이지 캐시, I/O 멀티플렉싱, mmap과 그 한계를 정리한다."
tags: ["os", "file-system", "system-call", "c", "io"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/d45aa46eb8e44cb6b21bbf0e66b36cfb", "https://80000coding.notion.site/b2ce62a9502c408b9a76262263a3b8b6", "https://80000coding.notion.site/f50d12ceb3a84f2a83a611fae04a3e63", "https://80000coding.notion.site/f6cc395bb7834e8f9a117a7172a15bc6", "https://80000coding.notion.site/340d53d7bfb54f8b9df0d9acab3002a3", "https://80000coding.notion.site/44f89332af544b1e9fe25d9b6e76f1e2", "https://80000coding.notion.site/10981a9a178f440e98bfcba1d9c90bb6", "https://80000coding.notion.site/f217ea68a2da4e9da1f503e66f0b705e"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[운영체제] File I/O」, 「파일 디스크립터(file descriptor)」, 「exit() atexit() _exit() 뭐가 다른지 설명할 수 있어?」, 「DB구현에서 왜 Memory Mapped File을 안쓸까」, 「파일 입출력: read()」, 「리눅스가 파일을 다루는 방식」, 「아니 그래서 printf 버퍼 관리가 뭔데…!!」, 「libft, 깨고 나니 보이는 것들」을 바탕으로 재구성한 노트다.

## 파일 디스크립터란

UNIX는 일반 파일뿐 아니라 디렉터리, 터미널, 파이프, 소켓, 장치까지 **파일이라는 하나의 인터페이스**로 다룬다. 프로세스가 이런 대상을 열면 커널은 **파일 디스크립터(file descriptor, fd)** 라는 작은 음이 아닌 정수를 돌려준다. 이후 읽기·쓰기·닫기는 모두 이 정수로 한다.

- 새로 연 fd는 **비어 있는 가장 작은 번호**를 받는다.
- 셸이 프로그램을 실행할 때 0(표준 입력, 키보드)·1(표준 출력, 화면)·2(표준 오류, 화면)를 터미널에 연결해 미리 열어 둔다. 코드에서는 `STDIN_FILENO`·`STDOUT_FILENO`·`STDERR_FILENO` 상수를 쓴다.
- 프로세스당 열 수 있는 개수에는 한도가 있다(`ulimit -n`, `RLIMIT_NOFILE`).

## 커널의 세 테이블

fd는 커널 자료구조를 가리키는 인덱스일 뿐이다. 실제 상태는 세 단계 테이블에 나뉘어 있다.

```text
프로세스 A (PCB)            커널 전역                   파일마다 하나
fd 테이블                   열린 파일 테이블             v-node / i-node
 0 ─┐                      ┌───────────────────┐       ┌──────────────┐
 1 ─┼────────────────────▶ │ 플래그(O_RDONLY…)  │ ────▶ │ 소유자·권한   │
 3 ─┘          ┌─────────▶ │ 오프셋, refcnt     │       │ 크기·블록 위치 │
프로세스 B      │           └───────────────────┘       └──────────────┘
 3 ────────────┘ (fork·dup이면 같은 항목을 공유)
```

| 테이블 | 단위 | 담는 것 |
| --- | --- | --- |
| fd 테이블 | 프로세스마다 | fd 번호 → 열린 파일 항목 포인터, close-on-exec 플래그 |
| 열린 파일 테이블 | `open()` 호출마다 | 접근 모드, **현재 오프셋**, 참조 수(refcnt) |
| v-node·i-node | 파일마다 | 파일 종류, 소유자, 크기, 데이터 블록 위치 |

v-node는 여러 파일 시스템(로컬 디스크, NFS 등)을 한 인터페이스로 다루려고 i-node에서 파일 시스템 독립적인 부분을 떼어 낸 것이다. Linux는 v-node 대신 VFS의 inode 객체로 같은 역할을 한다. 디스크 위 i-node 구조는 [[file-system-implementation|파일 시스템 구현]]에서 다룬다.

- **오프셋이 열린 파일 항목에 있으므로** `fork()`한 부모·자식, `dup()`으로 복제한 fd는 같은 열린 파일 항목을 가리킨다. **오프셋을 공유**하므로 한쪽의 `read`·`lseek`가 다른 쪽에 영향을 준다. 항목은 refcnt가 0이 될 때 사라진다.
- 같은 파일을 `open()`을 두 번 하면 항목이 두 개 생겨 오프셋이 독립적이다.

## 기본 시스템 콜

| 함수 | 역할 | 주의할 점 |
| --- | --- | --- |
| `open(path, flags[, mode])` | 파일을 열고 fd 반환 | `O_RDONLY`·`O_WRONLY`·`O_RDWR` 중 하나 + 아래 플래그를 OR. `O_CREAT`면 권한 `mode` 필요 |
| `read(fd, buf, n)` | 최대 n바이트 읽기 | 반환값이 n보다 작을 수 있다. 0이면 EOF. 문자열 끝 `'\0'`을 붙여 주지 않는다 |
| `write(fd, buf, n)` | 최대 n바이트 쓰기 | 파이프·소켓에서는 일부만 쓰일 수 있어 반환값을 확인하고 반복한다 |
| `lseek(fd, off, whence)` | 오프셋 이동 | `SEEK_SET`·`SEEK_CUR`·`SEEK_END`. 파이프·소켓에서는 실패 |
| `pread`·`pwrite` | 지정한 위치에서 읽기·쓰기 | 오프셋을 바꾸지 않아 여러 스레드가 같은 fd를 써도 안전 |
| `close(fd)` | fd 반납 | 번호는 즉시 재사용된다. 쓴 데이터가 디스크에 갔다는 보장은 아니다 |

실패하면 `-1`을 반환하고 `errno`에 원인을 남긴다.

| open 플래그 | 뜻 |
| --- | --- |
| `O_CREAT` / `O_EXCL` | 없으면 만든다 / 이미 있으면 실패. 함께 쓰면 "새로 만들 때만" |
| `O_TRUNC` / `O_APPEND` | 열면서 내용을 비운다 / 쓰기가 항상 파일 끝에 붙는다 |
| `O_NONBLOCK` | 읽을 데이터가 없으면 기다리지 않고 바로 반환 |
| `O_CLOEXEC` | `exec`로 새 프로그램을 실행할 때 자동으로 닫힌다 |

### read의 반환값

**`read`는 요청한 만큼 읽는다는 보장이 없다.** 반환값으로 상황을 가른다.

| 반환값 | 뜻 | 대응 |
| --- | --- | --- |
| 1 ~ `n` | 읽은 바이트 수. 파일 끝 근처, 파이프·소켓·터미널, 시그널 때문에 `n`보다 작을 수 있다 | 모자라면 남은 만큼 다시 읽는다 |
| 0 | EOF. 오류가 아니다 | 종료 |
| -1, `EINTR` | 시그널이 막혀 있던 호출을 중단시킴 | 다시 호출 (`SA_RESTART`로 자동 재시작 가능) |
| -1, `EAGAIN` | `O_NONBLOCK`인데 지금 읽을 데이터가 없음 | 나중에 다시 |
| -1, 그 밖 | `EBADF`(잘못된 fd), `EFAULT`(잘못된 버퍼), `EIO` 등 진짜 오류 | 처리하고 중단 |

블로킹 모드에서 데이터가 아직 없으면(빈 파이프, 입력을 기다리는 터미널) `read`는 0이 아니라 **잠든다.** "데이터 없음"과 "끝"은 다르다. 정확히 `n`바이트가 필요하면 루프를 돈다. `write`도 같은 식으로 반환값을 보고 반복한다. 반환형이 `ssize_t`인 이유는 [[c-integer-types|C의 정수 자료형과 형 변환]]에 있다.

```c
ssize_t read_all(int fd, char *buf, size_t len)
{
    size_t done = 0;
    while (done < len) {
        ssize_t n = read(fd, buf + done, len - done);
        if (n == 0) break;                    /* EOF */
        if (n == -1 && errno == EINTR) continue;  /* 다시 시도 */
        if (n == -1) return -1;
        done += n;
    }
    return done;
}
```

## dup2와 리다이렉션

`dup2(oldfd, newfd)`는 newfd를 닫고 oldfd와 **같은 열린 파일 항목**을 가리키게 만든다. 셸의 리다이렉션은 모두 이 한 줄로 구현된다.

| 셸 문법 | 의미 | 셸이 하는 일 |
| --- | --- | --- |
| `cmd > f` | 표준 출력을 f로 덮어쓰기 | `fd = open(f, O_WRONLY\|O_CREAT\|O_TRUNC)` → `dup2(fd, 1)` |
| `cmd >> f` | 이어 쓰기 | `O_APPEND`로 열고 `dup2(fd, 1)` |
| `cmd 2> f` | 표준 오류만 f로 | `dup2(fd, 2)` |
| `cmd > f 2>&1` | 출력과 오류를 함께 f로 | `dup2(fd, 1)` 후 `dup2(1, 2)`. 순서가 바뀌면 오류는 터미널에 남는다 |
| `cmd < f` | f를 표준 입력으로 | `O_RDONLY`로 열고 `dup2(fd, 0)` |

프로그램은 자기 fd 1이 터미널인지 파일인지 모른 채 그냥 `write(1, …)`를 한다. 파이프와 결합한 전체 흐름은 [[shell-pipeline|셸이 명령을 실행하는 방식]]에 있다.

## 버퍼는 두 층이다

```text
printf ─▶ [stdio 사용자 버퍼] ─fflush─▶ write() ─▶ [커널 페이지 캐시] ─fsync─▶ 디스크
          (프로세스 메모리)                         (모든 프로세스 공유)
```

| 층 | 목적 | 비우는 방법 |
| --- | --- | --- |
| stdio 버퍼 (`FILE *`) | 시스템 콜 횟수 줄이기 | `fflush()`, `fclose()`, 줄바꿈(줄 버퍼일 때), `exit()` |
| 페이지 캐시 | 느린 디스크 쓰기를 모아 지연 | `fsync()`·`fdatasync()`, `O_SYNC`로 열기 |

- `write()`가 성공해도 **디스크에 기록됐다는 뜻은 아니다.** 데이터는 페이지 캐시에 있고 커널이 나중에 내려 쓴다. 정전에도 남아야 하는 데이터(DB 로그 등)는 `fsync()`까지 해야 한다.
- `close()`는 어느 버퍼도 디스크로 강제하지 않는다.

### stdio 버퍼링 모드

| 모드 | 내보내는 시점 | 기본으로 쓰이는 곳 |
| --- | --- | --- |
| 완전 버퍼링 | 버퍼가 찼을 때 | 파일, 파이프로 연결된 `stdout` |
| 줄 버퍼링 | 개행을 만났을 때 (또는 버퍼가 찼을 때) | 터미널에 연결된 `stdout` |
| 버퍼링 없음 | 즉시 | `stderr` |

- `printf("loading..."); sleep(2);`는 개행이 없어 2초 뒤에야 보인다. `fflush(stdout)`으로 즉시 내보낸다.
- `printf`와 `write(1, …)`를 섞으면 순서가 뒤바뀐다. `write`는 stdio 버퍼를 건너뛴다.
- `./app | cat`처럼 파이프로 연결하면 `stdout`이 완전 버퍼링으로 바뀌어 출력 시점이 달라진다.
- `fork` 전에 비우지 않은 버퍼는 자식에게 복사되어 같은 내용이 두 번 출력된다.
- 모드는 `setvbuf(stdout, NULL, _IONBF, 0)`처럼 바꾼다. 직접 출력 함수를 만들 때는 결과를 배열에 모았다가 `write`를 한 번 부르면 시스템 콜 횟수가 크게 준다.

### exit()와 _exit()

| 함수 | 종류 | 하는 일 |
| --- | --- | --- |
| `exit(status)` | 라이브러리 함수 (`man 3`) | `atexit()`로 등록한 함수를 역순 호출 → stdio 스트림을 flush하고 닫음 → `_exit()` 호출 |
| `_exit(status)` | 시스템 콜 (`man 2`) | 커널이 즉시 종료: 메모리 해제, fd 전부 닫기, 부모에게 `SIGCHLD`와 종료 상태 전달 |

`fork()` 뒤 `exec()`에 실패한 자식은 `_exit()`로 끝낸다. `exit()`를 부르면 부모에게서 복사해 온 stdio 버퍼가 한 번 더 flush되어 출력이 두 번 나올 수 있다. 반대로 `_exit()`나 크래시로 끝나면 버퍼에 남은 내용은 사라진다. 종료 상태를 거두는 과정과 좀비 프로세스는 [[process-and-thread|프로세스와 스레드]]를 본다.

## I/O 멀티플렉싱

블로킹 `read()`는 데이터가 올 때까지 프로세스를 재운다. 소켓 여러 개를 한 스레드로 다루려면 "준비된 fd가 생길 때까지 한꺼번에 기다리는" 호출이 필요하다.

| API | 방식 | 특징 |
| --- | --- | --- |
| `select` | fd 비트맵(`fd_set`)을 넘기고 매번 전부 검사 | POSIX 표준. fd 번호 상한(`FD_SETSIZE`, 보통 1024), 호출마다 집합을 다시 채워야 함 |
| `poll` | `pollfd` 배열 | 개수 제한은 없지만 여전히 O(n) 검사 |
| `epoll`(Linux)·`kqueue`(BSD·macOS) | 관심 fd를 커널에 등록해 두고 준비된 것만 받음 | 대규모 서버의 표준. Node.js의 libuv, Nginx가 쓴다 |
| `io_uring`(Linux) | 제출·완료 큐를 공유 메모리로 주고받는 비동기 I/O | 시스템 콜 자체를 줄인다 |

`pselect`·`ppoll`은 기다리는 동안 막을 시그널 마스크를 함께 받아, 검사와 대기 사이에 시그널이 끼어드는 경쟁을 없앤다.

## mmap: 파일을 메모리처럼

`mmap(addr, len, prot, flags, fd, offset)`은 파일 영역을 프로세스 주소 공간에 매핑한다. 이후 포인터로 읽고 쓰면 커널이 페이지 폴트를 받아 필요한 페이지를 올린다.

- `MAP_SHARED`: 변경이 파일과 다른 프로세스에 반영된다. `MAP_PRIVATE`: 쓰기 시 복사(copy-on-write)로 내 사본만 바뀐다.
- `offset`은 페이지 크기의 배수여야 하고, 작은 파일도 최소 한 페이지를 차지한다.
- 매핑은 열린 파일을 참조하므로 `mmap` 뒤 `close(fd)`를 해도 매핑은 유효하다. `munmap`으로 해제한다.
- 장점: `read`·`write`의 커널↔사용자 복사가 없고, 임의 위치 접근과 프로세스 간 공유가 쉽다.

### DBMS가 mmap을 피하는 이유

직관과 달리 PostgreSQL·MySQL 같은 DBMS는 버퍼 풀을 직접 관리하고 `pread`·`pwrite`로 블록 I/O를 한다.

| 문제 | 설명 |
| --- | --- |
| 쓰기 시점 통제 불가 | 더티 페이지가 언제 디스크로 나갈지 커널이 정한다. 로그를 먼저 쓰고 데이터를 나중에 쓰는 WAL 순서를 보장하기 어렵다 |
| 숨은 블로킹 | 포인터 접근 한 번이 페이지 폴트와 디스크 I/O가 될 수 있는데, 코드에서는 예측도 회피도 못 한다 |
| 멀티코어 확장성 | 페이지를 내보낼 때마다 모든 코어의 TLB 항목을 무효화해야 한다(TLB shootdown, 아래 링크 참고). 코어가 많을수록 비싸다 |
| 오류 처리 | I/O 오류가 반환값이 아니라 `SIGBUS` 시그널로 온다 |

단일 프로세스의 읽기 위주 작업(LMDB 같은 임베디드 DB, 실행 파일 로딩)에는 mmap이 여전히 좋은 선택이다. TLB shootdown의 비용은 [[cache-friendly-code|캐시를 고려한 코드]]에서 다룬다.

## 정리

- fd는 커널 테이블의 인덱스다. 오프셋은 열린 파일 항목에 있어 `fork`·`dup`한 fd끼리 공유된다.
- `read`·`write`는 일부만 처리할 수 있으니 0(EOF)과 -1(`errno`)을 구분하며 루프를 돈다.
- 리다이렉션은 `open` + `dup2`, 파이프는 `pipe` + `dup2`로 만든다.
- `write` 성공 ≠ 디스크 기록. 사용자 버퍼는 `fflush`, 커널 버퍼는 `fsync`로 비운다. stdout은 터미널이면 줄 단위, 파이프·파일이면 버퍼가 찰 때 나간다.
- 많은 연결은 `epoll`·`kqueue`로 기다린다.
- **mmap은 편하지만 쓰기 순서와 I/O 시점을 내줘야 한다.** 트랜잭션이 필요한 저장소는 직접 버퍼를 관리한다.

관련 노트: [[file-system|파일 시스템]], [[file-system-implementation|파일 시스템 구현]], [[shell-pipeline|셸이 명령을 실행하는 방식]], [[unix-signals|UNIX 시그널]], [[file-io|C 입력과 파일 입출력]], [[event-loop-server|비동기 서버의 이벤트 루프: 다중 접속 서버에서 Reactor 패턴까지]]
