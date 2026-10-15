---
title: "C 디버깅 도구"
concept: "Debugger"
summary: "C 프로그램의 버그를 잡는 도구를 쓰임새별로 정리한다. GDB·LLDB로 멈춰서 들여다보기, AddressSanitizer·UBSan으로 메모리 오류와 미정의 동작 잡기, leaks·Valgrind로 누수 찾기, strace로 시스템 콜 추적하기, 그리고 Segmentation fault와 Bus error의 차이."
tags: ["c", "debugging", "memory", "tools", "linux"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/e2076b1b212448e9838c53686622db22", "https://80000coding.notion.site/457f637fb1014f79adc80ca72bd3c6f3", "https://80000coding.notion.site/107bc2ff145e427b9bd076b015908916", "https://80000coding.notion.site/a2810918ee9a472ea1cddae61ce7b6f6", "https://80000coding.notion.site/d2985f3d6c27469b85682f1e499e78e6", "https://80000coding.notion.site/5196284cbb1c4cf095aa6da1046840b3", "https://80000coding.notion.site/bac2c93a62794b3d8ad3b9a84a6ed709", "https://80000coding.notion.site/2dba73d25a2c4f81ba62452c15575272", "https://lldb.llvm.org/use/map.html", "https://clang.llvm.org/docs/AddressSanitizer.html"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「위기탈출 LLDB (꿀팁 포함)」, 「leaks 1.2배 더 유용하게 사용하기」, 「atexit을 활용해 누수 확인하기」, 「strace로 시스템콜 추적하기」, 「Bus error vs Segmentation fault?」, 「Make와 Sanitizer 더 잘 쓰기」, 「심플한 어셈블리 분석하기」를 바탕으로 재구성한 노트다.

## 어떤 도구를 언제 쓰나

C는 잘못된 메모리 접근을 런타임이 막아 주지 않는다. 버그가 난 지점과 증상이 나타나는 지점이 멀리 떨어지는 일이 흔해서, 증상에 맞는 도구를 고르는 것이 디버깅의 절반이다.

| 증상 | 먼저 쓸 도구 |
| --- | --- |
| 값이 이상하다, 흐름이 예상과 다르다 | 디버거(GDB, LLDB) |
| 가끔 죽는다, 실행할 때마다 결과가 다르다 | AddressSanitizer, UBSan |
| 오래 돌면 메모리가 늘어난다 | LeakSanitizer, `leaks`(macOS), Valgrind(리눅스) |
| 파일·파이프·프로세스 관련 동작이 이상하다 | `strace`(리눅스), `dtruss`(macOS) |
| 실행 파일만 있고 소스가 없다 | 디버거의 디스어셈블 기능 |

어느 도구든 **`-g`로 컴파일**해야 소스 줄 번호와 변수 이름이 보인다. 없으면 어셈블리 명령 단위로만 따라갈 수 있다. 최적화(`-O2`)를 켜면 변수가 레지스터로 사라지거나 줄 순서가 바뀌므로 디버깅할 때는 `-O0`을 쓴다.

## 디버거: GDB와 LLDB

GDB는 GNU 툴체인, LLDB는 LLVM 툴체인의 디버거다. 리눅스에서는 GDB, macOS에서는 Xcode와 함께 오는 LLDB가 기본이다. 명령은 대부분 대응된다.

| 하고 싶은 일 | GDB | LLDB |
| --- | --- | --- |
| 함수에 중단점 | `b main` | `b main` |
| 파일:줄에 중단점 | `b foo.c:42` | `b foo.c:42` |
| 중단점 목록 / 삭제 | `info b` / `delete 1` | `br l` / `br del 1` |
| 실행 / 다음 중단점까지 | `r` / `c` | `r` / `c` |
| 한 줄 실행(함수 건너뜀 / 들어감) | `n` / `s` | `n` / `s` |
| 현재 함수 끝까지 | `finish` | `finish` |
| 지역 변수 전부 | `info locals` | `fr v` |
| 전역 변수 | `p 변수명` | `ta v` |
| 식 평가 | `p *node` | `p *node` |
| 호출 스택 | `bt` | `bt` |
| 값이 바뀔 때 멈춤 | `watch x` | `w s v x` |
| 어셈블리 보기 | `disas`, `layout asm` | `di` |
| 메모리 보기 | `x/8wx $sp` | `x/8wx $sp` |

실전 요령:

- 실행만 하면 끝나 버린다면 `run` 전에 중단점을 건다.
- 루프에 갇혔으면 루프 다음 줄에 중단점을 걸고 `c`로 빠져나온다.
- 매 단계 지역 변수를 보고 싶으면 LLDB는 `target stop-hook add --one-liner "frame variable"`, GDB는 `display 변수`.
- 소스 주변 줄 수는 `~/.lldbinit`의 `settings set stop-line-count-before 10`처럼 설정 파일로 늘린다.
- GDB에서 `set disassembly-flavor intel`이면 AT&T 대신 인텔 문법으로 보인다.

소스 없이 어셈블리를 읽을 때는 한 줄씩 해석하기보다 **덩어리로 끊어 C로 되옮기는 것**이 요령이다. 함수 프롤로그·에필로그(스택 프레임 준비와 정리)를 떼어 내고, `call` 대상과 비교·분기(`cmp`, `jg`, `je`)를 찾아 `if`와 루프의 뼈대를 세운 다음 세부를 채운다. 스택 프레임의 모양은 [[calling-convention|호출 규약과 스택 프레임]]에 있다.

## Sanitizer: 런타임 검사

컴파일러가 코드에 검사 코드를 심어, 문제가 생긴 **바로 그 순간** 스택 트레이스와 함께 멈춘다. GCC와 Clang 모두 지원한다.

| 옵션 | 잡는 것 |
| --- | --- |
| `-fsanitize=address` (ASan) | 힙·스택·전역 버퍼 오버플로, 해제 후 사용(use-after-free), 이중 해제. 리눅스에서는 종료 시 누수(LeakSanitizer)도 보고 |
| `-fsanitize=undefined` (UBSan) | 부호 있는 정수 오버플로, 0으로 나누기, 잘못된 시프트, 정렬 안 된 포인터 접근 등 미정의 동작 |
| `-fsanitize=thread` (TSan) | 스레드 간 데이터 경쟁. ASan과 동시에 켤 수 없다 |
| `-fsanitize=memory` (MSan, Clang) | 초기화하지 않은 메모리 읽기 |

```bash
cc -g -O1 -fsanitize=address,undefined -fno-omit-frame-pointer main.c
```

Makefile에서는 `SANITIZER` 같은 변수로 켜고 끈다. 옵션을 바꾸면 기존 오브젝트를 다시 컴파일해야 하므로, 검사 모드를 바꿀 때는 전체를 다시 빌드한다. 실행 속도는 ASan 기준 대략 2배 느려지는 수준이라 개발 중에는 상시 켜 두기 좋다.

## 메모리 누수 찾기

| 환경 | 도구 | 사용법 |
| --- | --- | --- |
| 리눅스 | LeakSanitizer | ASan을 켜면 종료 시 자동 보고 |
| 리눅스 | Valgrind | `valgrind --leak-check=full ./app`. 재컴파일 없이 쓸 수 있지만 수십 배 느림 |
| macOS | `leaks` | `leaks --atExit -- ./app`로 종료 직전 누수 보고 |

macOS의 `leaks`는 실행 중인 프로세스를 검사하는 도구라, 예전에는 `main` 끝에 `system("leaks a.out")`을 넣곤 했다. 이 방식은 중간에 `exit()`하는 경로에서 호출되지 않는다. `atexit(check_leak)`으로 종료 핸들러를 등록하면 어느 경로로 끝나든 실행되지만, 지금은 `leaks --atExit --`가 같은 일을 코드 수정 없이 해 준다.

누수의 **위치**를 알려면 할당 시점의 스택을 기록해야 한다. 환경 변수 `MallocStackLogging=1`을 켜고 `leaks`를 돌리면 "어느 함수의 몇 번째 줄에서 `malloc`한 블록이 해제되지 않았는지"가 호출 스택과 함께 나온다. ASan/LSan과 Valgrind는 기본으로 할당 위치를 보여 준다.

## 시스템 콜 추적: strace

`strace`는 프로그램이 커널에 요청하는 시스템 콜(`openat`, `read`, `write`, `pipe`, `dup2`, `clone`, `execve` …)과 시그널을 순서대로 보여 준다. 셸이 파이프와 리다이렉션을 어떻게 처리하는지처럼, 코드 밖의 동작을 확인할 때 유용하다.

```bash
strace -ff -o out -tt -e trace=openat,close,pipe,dup2,clone,execve ./test.sh
```

| 옵션 | 뜻 |
| --- | --- |
| `-f` / `-ff` | 자식 프로세스도 추적 / 프로세스별 파일로 나눠 저장 |
| `-e trace=...` | 특정 시스템 콜만 (`!`로 제외) |
| `-tt`, `-r` | 마이크로초 타임스탬프, 직전 호출과의 시간 차 |
| `-o 파일` | 결과를 파일로 |
| `-p PID` | 실행 중인 프로세스에 붙기 |

최신 glibc는 `open` 대신 `openat`, `fork` 대신 `clone`을 호출하므로 추적 대상도 그 이름으로 적는다. `strace`는 리눅스 전용이다. macOS의 `dtruss`는 SIP를 꺼야 해서, 맥에서는 리눅스 컨테이너(`docker run --cap-add SYS_PTRACE ...`)에서 `strace`를 쓰는 편이 쉽다.

## Segmentation fault와 Bus error

둘 다 잘못된 메모리 접근으로 프로세스가 시그널을 받고 죽는 것이지만 원인이 다르다.

| | Segmentation fault (`SIGSEGV`) | Bus error (`SIGBUS`) |
| --- | --- | --- |
| 누가 거부하나 | 운영체제의 메모리 보호(MMU 권한 검사) | 주소 자체를 처리할 수 없는 하드웨어·OS |
| 대표 원인 | NULL 역참조, 해제된 메모리 접근, 읽기 전용 영역(문자열 리터럴)에 쓰기, 스택 오버플로 | 정렬되지 않은 주소 접근을 허용하지 않는 CPU, `mmap`한 파일이 잘려 존재하지 않는 페이지 접근 |
| 예 | `char *s = "abc"; s[0] = 'A';` (리눅스) | `*(int *)(buf + 1) = 1;` (엄격 정렬 CPU) |

x86-64는 정렬되지 않은 접근을 대부분 허용하므로 Bus error가 드물다. 같은 코드라도 OS에 따라 시그널이 달라서, macOS에서는 문자열 리터럴 수정이 Bus error로 보고되기도 한다. 어느 쪽이든 원인을 찾는 출발점은 ASan이나 디버거의 `bt`다.

## 정리

- 디버깅용 빌드는 `-g -O0 -fsanitize=address,undefined`로 따로 둔다.
- 흐름은 디버거, 메모리 오류는 ASan, 누수는 LSan·`leaks`·Valgrind, 커널과의 상호작용은 `strace`.
- Segfault는 권한 위반, Bus error는 처리할 수 없는 주소다. 둘 다 `bt`로 시작한다.

관련 노트: [[pointers-and-memory|포인터와 메모리]], [[c-pointer-pitfalls|C 포인터의 함정]], [[gcc-compile-and-link|GCC 컴파일과 링크]], [[calling-convention|호출 규약과 스택 프레임]]
