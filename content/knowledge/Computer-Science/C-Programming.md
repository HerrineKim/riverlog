---
title: "C 프로그래밍"
concept: "C Language"
summary: "C 언어의 컴파일 과정과 자료형, 포인터와 메모리, 구조체와 함수 포인터, 스코프와 링키지, 입출력, 빌드 도구(gcc·make)와 디버깅 도구, 호출 규약과 저수준 최적화, 역사와 표준."
tags: ["c", "memory", "pointer", "cs50", "data-structure", "build"]
source: notion
date: "2026-10-14"
---

C는 메모리를 직접 다루는 언어라서, 주소와 포인터를 이해하면 컴퓨터가 데이터를 실제로 어떻게 저장하는지가 보인다. 기초는 하버드 CS50의 C 파트를 뼈대로 삼고, 그 위에 언어 규칙, 빌드·디버깅 도구, 기계어 수준의 동작을 차례로 쌓았다.

### 언어 기초

- [C 기초: 컴파일, 자료형, 배열과 문자열](Computer-Science/C-Programming/c-basics.md) — 정보의 표현, 4단계 컴파일 과정, 자료형 크기, 배열과 널 종단 문자열, 명령행 인자
- [포인터와 메모리](Computer-Science/C-Programming/pointers-and-memory.md) — 16진수와 주소, 포인터, 문자열의 정체, malloc/free, 메모리 영역(스택·힙)
- [C 포인터의 함정](Computer-Science/C-Programming/c-pointer-pitfalls.md) — 배열과 포인터의 차이, 읽기 전용 리터럴, const 위치, 이중 포인터, 댕글링 포인터, memmove, new/delete 짝
- [C의 정수 자료형과 형 변환](Computer-Science/C-Programming/c-integer-types.md) — 플랫폼별 크기, stdint.h와 size_t, 정수 승격, 부호 확장, 오버플로 미정의 동작, 고정소수점
- [구조체와 함수 포인터](Computer-Science/C-Programming/c-struct-and-function-pointer.md) — 구조체 패딩, 함수 포인터와 콜백, 불투명 포인터와 가상 함수 테이블로 객체 흉내 내기
- [C의 스코프와 링키지](Computer-Science/C-Programming/c-scope-and-linkage.md) — 스코프와 이름 가림, 네 가지 이름 공간, 저장 기간, static과 내부 링키지, 기호 상수
- [C 입력과 파일 입출력](Computer-Science/C-Programming/file-io.md) — scanf, fopen·fprintf·fread·fclose, 매직 넘버로 바이너리 판별, stdio 아래의 fd와 시스템 콜

### 빌드와 디버깅

- [GCC 컴파일과 링크](Computer-Science/C-Programming/gcc-compile-and-link.md) — 단계별 옵션, 경고·최적화 플래그, 정적·공유 라이브러리, 링크 순서, 헤더 가드
- [Makefile과 make](Computer-Science/C-Programming/makefile.md) — 규칙·변수·패턴 규칙, -MMD -MP 헤더 의존성, .PHONY, 리링크와 병렬 빌드 함정
- [C 디버깅 도구](Computer-Science/C-Programming/c-debugging-tools.md) — GDB·LLDB, AddressSanitizer·UBSan, leaks·Valgrind, strace, Segfault와 Bus error

### 기계와 가까운 곳

- [호출 규약과 스택 프레임](Computer-Science/C-Programming/calling-convention.md) — 프롤로그·에필로그, 스택 방향, cdecl·System V AMD64, 가변 인자, 꼬리 호출
- [C 저수준 최적화](Computer-Science/C-Programming/c-low-level-optimization.md) — switch의 테이블 변환, 분기 예측 힌트, unreachable, SIMD, 메모리 함수
- [C로 하는 2D 그래픽 기초](Computer-Science/C-Programming/c-2d-graphics.md) — SDL·MiniLibX의 이벤트 루프와 이미지 버퍼, 브레젠험·보간·회전·등각 투영, SDL3

### 배경

- [C의 역사와 표준](Computer-Science/C-Programming/c-history-and-standards.md) — 유닉스와 C의 탄생, K&R부터 C23까지, memset이 int를 받는 이유, POSIX

자료구조(연결 리스트·트리·해시 테이블)의 C 구현은 [[data-structures|기초 자료구조]] 노트(Algorithm › 자료구조)에 있다.
