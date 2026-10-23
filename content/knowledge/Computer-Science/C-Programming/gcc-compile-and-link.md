---
title: "GCC 컴파일과 링크"
concept: "Compiler Toolchain"
summary: "gcc/clang으로 단계별 결과물(.i .s .o)을 뽑는 옵션, 경고·디버깅·최적화 플래그, 정적 라이브러리(.a)와 공유 라이브러리(.so/.dylib)를 만들고 링크하는 법, 링크 순서와 런타임 라이브러리 탐색, 헤더 중복 포함 방지를 정리한다."
tags: ["c", "compile", "build", "tools", "linux"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/d5fa7c87192f4c6895ebaa4af5b9dbf5", "https://80000coding.notion.site/a45f1a4841e9455081208ae9ca3b54a1", "https://80000coding.notion.site/4c67b8c953df4afa8f4f9fe0094a4a6e", "https://80000coding.notion.site/4ff0a20c0d144de293102d73d3a0eb6e", "https://80000coding.notion.site/9fc02b4a89ef4d83b862badad55949a6", "https://80000coding.notion.site/4f84a0f3f7f3424d83e88d1132664476", "https://gcc.gnu.org/onlinedocs/gcc/Option-Summary.html", "https://www.youtube.com/watch?v=MYKFLepF1UM"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「GCC 컴파일러 개념 정리」, 「Libft 과제에서 만든 라이브러리(libft.a)를 사용해보자」, 「공유 라이브러리를 링크하는 방법」, 「헤더 중복 방지 기법 세 가지(#pragma once)」, 「POSIX cc, C 컴파일러」, 「컴파일만하면 다 해주는게 아니다.?! (어셈블러 찍먹)」을 GCC 공식 문서와 함께 재구성한 노트다.
> 「단계별로 멈추기」 절의 목적 파일과 실행 파일의 차이는 강민철의 「혼자 공부하는 컴퓨터 구조+운영체제」 강의(한빛미디어)를 바탕으로 보강했다.

## 컴파일러 드라이버

`gcc`나 `clang`은 컴파일러 하나가 아니라 **드라이버**다. 전처리기, 컴파일러 본체, 어셈블러(`as`), 링커(`ld`)를 차례로 불러 소스를 실행 파일로 만든다. 4단계 흐름 자체는 [[c-basics|C 기초]]에 있고, 이 노트는 각 단계를 옵션으로 다루는 법을 정리한다.

**GCC**는 GNU Compiler Collection의 약자로, 자유 소프트웨어 운동을 이끈 GNU 프로젝트의 컴파일러 모음이다. macOS에서 `gcc`나 `cc`를 실행하면 실제로는 Apple Clang이 돈다. 옵션은 대부분 호환된다. POSIX는 표준 C 컴파일러 명령으로 `c99`/`c17` 유틸리티를 규정하고, 유닉스 계열에서 `cc`는 시스템 기본 C 컴파일러를 가리키는 관례적 이름이다.

## 단계별로 멈추기

| 옵션 | 멈추는 지점 | 결과 |
| --- | --- | --- |
| `-E` | 전처리 후 | 매크로가 펼쳐지고 헤더가 붙은 코드(표준 출력) |
| `-S` | 컴파일 후 | 어셈블리 `.s` |
| `-c` | 어셈블 후 | 오브젝트 `.o` (링크하지 않음) |
| (없음) | 링크까지 | 실행 파일 (`-o`로 이름 지정, 기본 `a.out`) |

`-c` 없이 `main`이 없는 파일을 컴파일하면 링커가 `undefined symbol: _main` 오류를 낸다. 여러 파일을 따로 `-c`로 컴파일한 뒤 오브젝트끼리 링크하는 것이 분할 컴파일이고, [[makefile|make]]는 바뀐 파일만 다시 `-c` 한다.

`-E` 결과를 열어 보면 `#include <stdio.h>` 한 줄이 헤더 전체(`printf` 선언 포함)로 펼쳐져 수백 줄이 된다. `-c`로 만든 `.o`는 이미 기계어라 문자열 리터럴(`"hello"`)도 바이트로 들어 있지만, **목적 파일은 실행 파일이 아니다.** `main.c`가 `helper.c`의 `add()`를 부르면 `main.o`에는 `add`의 주소가 비어 있는 **미해결 심볼**이 남는다(`nm main.o`에서 `U`로 표시). 링커가 `main.o`와 `helper.o`, 표준 라이브러리를 묶으며 이 자리를 채워야 비로소 실행할 수 있다.

`-S`로 뽑은 어셈블리를 고쳐 `cc main.s`로 다시 빌드할 수도 있다. 컴파일러가 만든 코드를 읽어 최적화가 어떻게 되었는지 확인할 때 주로 쓴다. 온라인 도구 Compiler Explorer(godbolt.org)가 같은 일을 브라우저에서 해 준다.

## 자주 쓰는 옵션

| 분류 | 옵션 | 뜻 |
| --- | --- | --- |
| 경고 | `-Wall -Wextra` | 흔한 실수 경고를 켠다 |
|  | `-Werror` | 경고를 오류로 취급 |
|  | `-pedantic` | 표준을 벗어난 확장 사용을 경고 |
| 표준 | `-std=c17`, `-std=c23` | 따를 C 표준. GCC 15부터 기본값은 `gnu23` |
| 전처리 | `-Idir` | 헤더 검색 경로 추가 |
|  | `-DNAME=value` | 매크로 정의 (`-DBUFFER_SIZE=42`) |
| 링크 | `-Ldir` | 라이브러리 검색 경로 추가 |
|  | `-lname` | `libname.a` 또는 `libname.so`를 링크 |
| 디버깅 | `-g` | 디버깅 심볼 포함 → [[c-debugging-tools\|C 디버깅 도구]] |
|  | `-fsanitize=address,undefined` | 런타임 메모리·UB 검사 |
| 최적화 | `-O0` `-O2` `-O3` `-Os` | 최적화 수준. 디버깅할 때는 `-O0` |
| 의존성 | `-MMD -MP` | Makefile용 헤더 의존성 파일 생성 |

## 라이브러리

라이브러리는 다른 프로그램에 링크되도록 미리 컴파일해 둔 함수 모음이다. 언제 실행 파일에 붙느냐에 따라 둘로 나뉜다.

| 구분 | 정적 라이브러리 | 공유(동적) 라이브러리 |
| --- | --- | --- |
| 확장자 | `.a`(유닉스), `.lib`(윈도) | `.so`(리눅스), `.dylib`(macOS), `.dll`(윈도) |
| 붙는 시점 | 링크할 때 필요한 오브젝트를 실행 파일에 **복사** | 실행할 때 로더가 메모리에 올려 **연결** |
| 장점 | 배포가 단순, 실행 환경에 의존하지 않음 | 실행 파일이 작고, 여러 프로세스가 메모리를 공유, 라이브러리만 교체해 업데이트 |
| 단점 | 실행 파일이 커지고 라이브러리 수정 시 다시 링크 | 실행 환경에 맞는 버전이 있어야 함 |

```bash
# 정적 라이브러리: 오브젝트를 아카이브로 묶는다
cc -c ft_strlen.c ft_memset.c
ar rcs libft.a ft_strlen.o ft_memset.o   # r: 추가/교체, c: 조용히 생성, s: 심볼 인덱스

# 공유 라이브러리: 위치 독립 코드로 컴파일
cc -fPIC -c ft_strlen.c ft_memset.c
cc -shared -o libft.so ft_strlen.o ft_memset.o

# 사용: 헤더는 -I, 라이브러리는 -L과 -l (앞의 lib와 확장자를 뗀 이름)
cc main.c -Iinclude -L. -lft -o app
```

### 링크 순서

정적 라이브러리를 링크할 때 링커는 명령줄을 **왼쪽에서 오른쪽으로 한 번** 훑는다. 아카이브를 만나는 순간 "지금까지 정의되지 않은 심볼"을 채울 오브젝트만 꺼낸다. 그래서 **쓰는 쪽이 앞, 제공하는 쪽이 뒤**여야 한다.

```bash
cc main.o -lftprintf -lft   # 성공: main → ftprintf → ft 순으로 의존
cc main.o -lft -lftprintf   # 실패: ft를 지나간 뒤에야 ftprintf가 ft의 함수를 찾음
```

### 공유 라이브러리를 실행할 때

링크에 성공해도 실행 시 로더가 라이브러리를 못 찾으면 `cannot open shared object file`(리눅스)이나 `Library not loaded`(macOS) 오류가 난다. 로더는 기본 경로(`/usr/lib` 등)와 실행 파일에 기록된 경로를 찾는다.

| 방법 | 설명 |
| --- | --- |
| rpath 기록 | `cc main.o -L. -lft -Wl,-rpath,'$ORIGIN'`(리눅스) 또는 `-Wl,-rpath,@executable_path`(macOS) |
| 환경 변수 | `LD_LIBRARY_PATH`(리눅스), `DYLD_LIBRARY_PATH`(macOS, SIP 보호 대상에선 무시됨). 임시 확인용 |
| 시스템 경로에 설치 | `/usr/local/lib`에 두고 리눅스는 `ldconfig` |

`ldd app`(리눅스)이나 `otool -L app`(macOS)으로 실행 파일이 어떤 공유 라이브러리를 요구하는지 확인한다. 동적 링킹된 함수는 호출 자리에 작은 **stub**(ELF에서는 PLT 항목)을 거친다. 처음 호출될 때 실제 주소를 찾아 GOT에 채우고, 이후 호출은 바로 간다(지연 바인딩). 라이브러리 코드 페이지는 물리 메모리에 한 벌만 올라가 여러 프로세스가 공유한다([[memory-management|메모리 관리]]).

## 헤더 중복 포함 방지

헤더가 다른 헤더를 포함하다 보면 같은 헤더가 한 번역 단위에 두 번 들어가 구조체 재정의 오류가 난다.

```c
/* include guard: 모든 컴파일러에서 동작하는 표준 방식 */
#ifndef LIBFT_H
# define LIBFT_H
/* 선언들 */
#endif

/* #pragma once: 한 줄로 같은 효과. 표준은 아니지만 GCC·Clang·MSVC 모두 지원 */
#pragma once
```

`#pragma once`는 매크로 이름 충돌 걱정이 없고 짧다. 다만 같은 파일이 심볼릭 링크나 복사본으로 다른 경로에 있으면 다른 파일로 볼 수 있다. 이식성이 가장 중요하면 include guard를 쓰고, 둘을 함께 쓰는 프로젝트도 있다.

## 정리

- `gcc`/`clang`은 드라이버다. `-E` `-S` `-c`로 단계마다 결과를 볼 수 있다.
- 개발할 때는 `-Wall -Wextra -g -fsanitize=address,undefined -O0`, 배포는 `-O2`가 기본 조합이다.
- 정적 라이브러리는 `ar rcs`, 공유 라이브러리는 `-fPIC -shared`로 만든다.
- 정적 링크는 **의존하는 쪽을 앞에** 둔다. 공유 라이브러리는 실행 시 탐색 경로까지 챙긴다.

관련 노트: [[makefile|Makefile과 make]], [[c-basics|C 기초: 컴파일, 자료형, 배열과 문자열]], [[c-scope-and-linkage|C의 스코프와 링키지]], [[c-history-and-standards|C의 역사와 표준]]
