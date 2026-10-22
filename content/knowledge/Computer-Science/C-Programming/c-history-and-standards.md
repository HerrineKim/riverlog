---
title: "C의 역사와 표준"
concept: "C Standards"
summary: "C는 유닉스를 이식하기 위해 태어났고, K&R C에서 C89/C90, C99, C11, C17, C23으로 표준화되었다. 원형 없는 함수 호출과 암묵적 int 같은 옛 규칙이 memset(int c) 같은 흔적으로 남은 이유, 유닉스·BSD·리눅스와 POSIX의 관계를 정리한다."
tags: ["c", "history", "computer-science", "os", "unix"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/535cc7e502fe461da464145cd734abea", "https://80000coding.notion.site/31f3b39714834a759d88c99284e7f3ca", "https://80000coding.notion.site/4382416262554994a32b0393c8b01800", "https://80000coding.notion.site/30af7372f69240ec8eb8cd6813f4775f", "https://www.bell-labs.com/usr/dmr/www/chist.html", "https://www.iso.org/standard/82075.html"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「기초 중의 기초 - C언어의 유래, 표준화」, 「80년대 C언어는 어땠을까?」, 「어차피 char로 해석할건데 왜 int형 매개변수로 받을까? (ft. memset())」, 「Unix 연대기」를 바탕으로 재구성한 노트다.

## 유닉스를 위해 태어난 언어

1969년 벨 연구소의 켄 톰슨은 거대한 시분할 운영체제 Multics의 아이디어를 작은 미니컴퓨터에서 돌릴 수 있게 줄여 **유닉스**를 만들었다. 처음에는 어셈블리로 작성되어 기계가 바뀌면 다시 써야 했다. 톰슨은 BCPL을 줄인 **B 언어**를 만들었고, 데니스 리치가 B에 자료형을 더해 1972년 무렵 **C**로 발전시켰다. 1973년 유닉스 커널 대부분이 C로 다시 쓰이면서, 운영체제를 고급 언어로 작성해 다른 기계로 옮긴다는 **이식성(portability)**이 처음으로 현실이 되었다.

C가 지금까지 시스템 프로그래밍의 기본 언어로 남은 이유도 여기 있다. 하드웨어에 가까운 일(메모리 주소, 비트 조작)을 할 수 있으면서도, 어셈블리보다 훨씬 적은 코드로 여러 기계에서 컴파일된다.

## 표준의 변천

| 이름 | 연도 | 핵심 변화 |
| --- | --- | --- |
| K&R C | 1978 | 『The C Programming Language』 초판이 사실상의 표준. 컴파일러마다 해석이 달라 방언이 생김 |
| C89 / C90 (ANSI C) | 1989 ANSI, 1990 ISO | 첫 공식 표준. **함수 원형(prototype)** 도입, 표준 라이브러리 정리. 두 이름은 같은 내용 |
| C99 | 1999 | `//` 주석, 블록 중간 선언, `for (int i...)`, `<stdint.h>`, `<stdbool.h>`, `long long`, 가변 길이 배열, 지정 초기화자. **암묵적 int와 암묵적 함수 선언 제거** |
| C11 | 2011 | 멀티스레드(`<threads.h>`, `_Atomic`), `_Generic`, `_Static_assert`, 익명 구조체 |
| C17 (C18) | 2018 | 새 기능 없이 C11의 결함 수정 |
| C23 | 2024 (ISO/IEC 9899:2024) | `bool`·`true`·`false`·`nullptr`·`static_assert`가 키워드, `constexpr`, `typeof`, `[[attribute]]`, `#embed`, `<stdckdint.h>`, 2의 보수 표현 의무화, **K&R식 함수 정의 제거** |

현재 표준은 **C23**이고, 다음 개정판(C2y)이 작업 중이다. GCC는 15부터 기본 모드가 `-std=gnu23`(C23 + GNU 확장)이다. 표준을 지키지 않는 확장 기능은 컴파일러를 바꾸면 깨질 수 있으므로, 이식성이 중요한 코드는 `-std=c17 -pedantic`처럼 표준 모드로 확인한다.

## K&R 시절의 흔적

C89 이전 코드는 지금 보면 낯설다.

```c
/* K&R 스타일: 반환형 생략, 매개변수 타입은 괄호 밖에 */
func(a, b)
    int a;
    char *b;
{
    return a + 1;
}
```

| 옛 규칙 | 뜻 | 지금 |
| --- | --- | --- |
| 암묵적 int(implicit int) | 타입을 생략하면 `int` | C99에서 제거 |
| 암묵적 함수 선언 | 원형 없이 호출한 함수는 `int f()`로 간주 | C99에서 제거. 지금은 `implicit declaration of function` 오류(GCC 14부터 기본 오류) |
| 빈 괄호 `int f()` | "매개변수 정보 없음" | C23부터 `int f(void)`와 같은 뜻 |
| K&R식 정의 | 위 예시처럼 타입을 괄호 밖에 | C23에서 제거 |

### memset이 int를 받는 이유

`memset(void *s, int c, size_t n)`과 `isalpha(int c)`는 결국 바이트 하나를 다루면서 `int`를 받는다. 원형이 없던 시절의 호출 규칙 때문이다. 원형 없이 함수를 부르면 인자에 **기본 인자 승격(default argument promotion)**이 적용되었다.

1. `int`보다 작은 정수(`char`, `short`)는 `int`로 승격한다.
2. `float`는 `double`로 바꾼다.
3. 나머지는 그대로 넘긴다.

`char`를 넘겨도 실제로는 `int`가 전달되었으므로, 옛 라이브러리 함수는 매개변수를 `int`로 받아 내부에서 `unsigned char`로 해석했다. 원형이 도입된 뒤에도 이미 컴파일된 코드와의 호환 때문에 시그니처를 바꾸지 않았다. `isalpha` 계열에는 `EOF`(-1)도 받아야 한다는 이유가 더해진다. 같은 승격 규칙은 지금도 가변 인자 함수(`printf`)의 `...` 부분에 적용된다. 그래서 `printf("%f", x)`는 `float`든 `double`이든 똑같이 동작한다. 자세한 내용은 [[calling-convention|호출 규약과 스택 프레임]]에 있다.

## 유닉스 계열과 POSIX

C와 함께 퍼진 유닉스는 여러 갈래로 나뉘었다.

```text
Unix (벨 연구소, 1969)
├── System V (AT&T 상용) ── Solaris, AIX, HP-UX
└── BSD (UC 버클리) ─────── FreeBSD, NetBSD, OpenBSD
                         └─ NeXTSTEP → Darwin → macOS (Mach 커널 + BSD 계층)
Linux (1991, 리누스 토르발스): 유닉스 코드를 쓰지 않고 새로 작성한 커널
└── Debian, Ubuntu, Fedora, Android ...
```

BSD가 AT&T 측과 저작권 소송에 묶여 있던 1990년대 초, 자유롭게 쓸 수 있는 리눅스가 빠르게 퍼졌다. 리눅스는 유닉스의 후손이 아니라 유닉스를 **닮게** 만든 운영체제다.

갈래마다 시스템 인터페이스가 달라지자 IEEE가 **POSIX(Portable Operating System Interface)**를 정했다. 시스템 콜과 C 라이브러리 함수(`open`, `read`, `fork`, `pthread`), 셸과 기본 유틸리티, 환경 변수, 파일 경로 규칙을 규정한 표준이다. macOS는 공식 UNIX 인증(Single UNIX Specification)을 받았고, 리눅스는 인증을 받지 않았지만 대부분 POSIX를 따른다. 그래서 둘 다 "유닉스 계열"로 부르고, POSIX 함수만 쓴 C 코드는 양쪽에서 그대로 컴파일된다.

C 표준과 POSIX는 다른 층이다. `printf`, `malloc`, `fopen`은 C 표준 라이브러리이고, `read`, `write`, `fork`는 POSIX다. 윈도에서는 앞의 것만 기본으로 쓸 수 있다.

## 정리

- C는 유닉스를 이식하려고 만든 언어이고, 이식성이 지금까지 이어진 핵심 가치다.
- 표준은 C89 → C99 → C11 → C17 → C23으로 이어졌다. 원형과 명시적 타입이 점점 강제되었다.
- `memset`의 `int` 매개변수는 원형 없던 시절의 기본 인자 승격이 남긴 흔적이다.
- POSIX는 유닉스 계열 OS의 공통 인터페이스이고, C 표준 라이브러리와는 별개다.

관련 노트: [[c-integer-types|C의 정수 자료형과 형 변환]], [[gcc-compile-and-link|GCC 컴파일과 링크]], [[os-overview|운영체제 개요]], [[c-basics|C 기초: 컴파일, 자료형, 배열과 문자열]]
