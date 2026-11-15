---
title: "C++ 코딩 표준과 clang-format"
concept: "C++ Coding Standard"
summary: "C++ 프로젝트의 코딩 표준이 무엇을 정하는지(사전·사후 조건, 유지보수, 서식, 이름, 클래스 배치, 문서화, 최적화 힌트)를 한 프로젝트 표준을 예로 정리하고, 서식은 사람이 지키지 말고 clang-format으로 자동화하는 방법을 다룬다."
tags: ["cpp", "clean-code", "code-review", "tools", "collaboration"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/48994d585d6846399982e7d31c61e66f", "https://80000coding.notion.site/bd5c80d792ce4387ae74b6d35ad77635", "https://clang.llvm.org/docs/ClangFormatStyleOptions.html"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「IRC를 위한 C++ 코딩 컨벤션」, 「VS Code에서 C++ 포매터 사용하기」를 바탕으로 재구성한 노트다.

## 코딩 표준이란

코딩 표준(coding standard)은 팀이 코드를 **같은 모양, 같은 가정**으로 쓰기 위한 합의다. 서식만 정하는 스타일 가이드보다 넓어서, 매개변수가 null일 수 있는지, 예외를 던져도 되는지 같은 **계약**까지 정한다. 정답은 없고 팀마다 다르지만, 정해야 할 항목은 비슷하다.

| 영역 | 정하는 것 | 예 |
| --- | --- | --- |
| 계약 | 입력·출력의 유효성 가정 | 내부 함수의 매개변수는 null 불가, 반환값은 null 가능 |
| 유지보수 | 버그를 줄이는 습관 | `const`를 최대한, 매직 넘버 금지, assert 적극 사용 |
| 서식 | 들여쓰기·중괄호·줄 길이 | 공백 4칸, 중괄호는 새 줄 |
| 이름 | 표기법과 접두사 | 클래스 PascalCase, 멤버 `m` 접두사 |
| 클래스 배치 | 멤버 선언 순서, 공개 범위 | public 메서드 → private 메서드 → 변수 |
| 문서화 | 주석 형식 | 외부 공개 API는 Doxygen |
| 최적화 | 컴파일러를 돕는 관례 | RVO를 위한 단일 반환, `reserve` 선호출 |

## 계약과 유지보수 규칙

- **사전 조건은 assert로 못 박는다.** 모듈 내부 함수는 "매개변수가 유효하다"고 가정하고, 그 가정을 `Assert(p != NULL)`로 코드에 남긴다. 컴파일 타임에 확인할 수 있는 것은 `static_assert`로 잡는다.
- 디버그 빌드의 assert를 릴리스 빌드에서 **`Assume`**(컴파일러 최적화 힌트, 예: `__builtin_assume`, C++23 `[[assume(expr)]]`)으로 바꾸면 검사 비용 없이 최적화 정보가 된다. 단, 가정이 틀리면 정의되지 않은 동작이 되므로 정말 불변인 조건에만 쓴다.
- 값을 바꾸지 않는 멤버 함수에는 모두 `const`를 붙인다.
- 매직 넘버 대신 이름 있는 상수나 `enum`을 쓰고, 복잡한 조건식은 이름 붙인 중간 변수로 쪼갠다.

```cpp
const int  AVX_ALIGN  = 32;
const bool bIsAligned = reinterpret_cast<uintptr_t>(ptr) % AVX_ALIGN == 0;
if (bIsAligned && !bIsMarked) { /* ... */ }
```

- 매개변수가 많아지면 구조체로 묶어 넘긴다.
- 지역 변수는 쓰기 직전에 선언한다.
- 오류 처리 방침을 정한다. 이 예의 표준은 `new` 실패를 검사하지 않고(어차피 복구할 수 없으니 바로 죽게 둔다), 특수한 경우가 아니면 예외를 던지지 않는다. 예외의 비용은 [[cpp-exceptions|C++ 예외 처리의 내부 동작]] 노트에 있다.

## 이름 규칙의 예

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| 클래스·구조체·enum | PascalCase | `HumanFactory` |
| 지역 변수·매개변수 | camelCase | `numArray` |
| 멤버 변수 | `m` 접두사 | `mServerPort` |
| bool | `b` 접두사 | `bIsEmpty`, `mbExpired` |
| 인터페이스 | `I` 접두사 | `ICharacter` |
| enum class | `E` 접두사 | `EState` |
| 핸들·파일 디스크립터 | `h` 접두사 | `hSocket` |
| null 허용 매개변수 | `Opt` 접미사 | `nameOpt` |
| 출력 매개변수 | `out`, `outPtr` 접두사 | `TryRead(int* outSize, void** outPtrData)` |
| 재귀 함수 | `Recursive` 접미사 | `VisitRecursive()` |
| 매크로 상수 | 대문자 + 밑줄 | `MESSAGE_LEN_MAX` |

접두사 규칙은 언리얼 엔진 같은 C++ 게임 코드에서 흔하고, Google C++ 스타일처럼 접두사를 쓰지 않는 표준도 많다. 어느 쪽이든 **한 저장소 안에서 하나로 통일**하는 것이 핵심이다. 이름 짓기의 일반 원칙은 [[clean-code-functions-naming|클린 코드: 함수와 이름]] 노트에 있다.

## 서식과 문서화

- 중괄호는 한 줄짜리 본문에도 쓴다. 나중에 줄을 추가할 때 생기는 버그를 막는다.
- 한 줄에 변수 하나만 선언하고, `*`·`&`는 타입 쪽에 붙인다(`int* p`).
- 생성자 초기화 리스트는 한 줄에 멤버 하나씩 쓴다.
- 반복자 증감은 전위 연산자(`++it`)를 쓴다. 후위는 이전 값을 복사해야 할 수 있다.
- 헤더 가드는 `#pragma once`로 통일한다.
- 외부에 노출되는 API는 Doxygen 주석(`/** @param ... @return ... */`)으로 쓰고, 구현 내부 설명은 `//`로 쓴다.

## 서식은 clang-format에 맡긴다

들여쓰기와 중괄호 위치를 사람이 리뷰에서 지적하는 것은 낭비다. **clang-format**은 정해 둔 스타일대로 C·C++ 코드를 자동 정렬한다.

```bash
clang-format -style=google -dump-config > .clang-format   # 기본 스타일에서 시작
clang-format -i src/*.cpp include/*.hpp                    # 파일을 제자리에서 정렬
```

| 기본 스타일 | 출처 |
| --- | --- |
| `LLVM` | LLVM 코딩 표준 |
| `Google` | Google C++ Style Guide |
| `Chromium` | Chromium 스타일 가이드 |
| `Mozilla` | Mozilla 스타일 가이드 |
| `WebKit` | WebKit 스타일 가이드 |
| `Microsoft` | Visual Studio 기본 |
| `GNU` | GNU 코딩 표준 |

- 저장소 루트에 `.clang-format` 파일을 두면 에디터·CI·팀원 모두가 같은 규칙을 쓴다. 기본 스타일 하나를 `BasedOnStyle`로 고르고 다른 부분만 덮어쓴다.
- VS Code에서는 Microsoft C/C++ 확장이나 clangd 확장 중 **하나만** 켠다. 둘 다 켜면 IntelliSense와 서식 기능이 충돌한다. `"editor.formatOnSave": true`로 저장할 때마다 정렬하고, `.clang-format`이 없을 때 쓸 스타일은 C/C++ 확장의 `C_Cpp.clang_format_fallbackStyle`로 정한다.
- CI에서 `clang-format --dry-run --Werror`를 돌리면 정렬되지 않은 코드가 병합되는 것을 막는다.

## 정리

- 코딩 표준은 서식뿐 아니라 null 허용, 예외 사용 같은 계약까지 정한다.
- 가정은 assert로 코드에 남기고, 바꾸지 않는 것은 모두 `const`로 표시한다.
- 이름 규칙은 무엇을 고르느냐보다 저장소 안에서 통일하는 것이 중요하다.
- 서식은 `.clang-format` 파일 하나와 저장 시 자동 정렬, CI 검사로 사람 손을 떠나게 한다.

관련 노트: [[clean-code-functions-naming|클린 코드: 함수와 이름]], [[cpp-basics|C++ 기초]], [[commit-convention|커밋 컨벤션과 자동 검사]]
