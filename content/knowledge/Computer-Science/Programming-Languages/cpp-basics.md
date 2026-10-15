---
title: "C++ 기초 문법과 참조자"
concept: "C++ Basics"
summary: "C++ 프로그램의 구조, 세 가지 초기화 문법, L-value와 R-value, 입출력 스트림, 헤더와 네임스페이스, 포인터와 참조자의 차이, switch의 fallthrough를 정리한다. 참조자는 다시 묶을 수 없고 null이 없는 별명이며, 없음을 표현해야 할 때만 포인터를 쓴다."
tags: ["cpp", "c", "pointer", "memory", "computer-science"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/23ed5ee6e09d4953af96a16a1463b635", "https://80000coding.notion.site/71480af963104c8cbaf82ea65b513ddb", "https://80000coding.notion.site/ddcdbb4d461a4a6497b85040fc49c7d6", "https://80000coding.notion.site/e570df1529ef464290454f72795785e9", "https://en.cppreference.com/w/cpp/language/attributes/fallthrough"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「C++의 기초적인 사용법」, 「참조 변수 (Reference Variable)」, 「참조자는 왜 쓰는걸까?」, 「switch case에서의 명시적 fallthrough」를 바탕으로 재구성한 노트다.

## C++란

C++는 C에 클래스·템플릿·예외·참조자를 더한 언어다. C 코드 대부분이 그대로 컴파일되므로 [[pointers-and-memory|포인터와 메모리]] 지식이 그대로 쓰인다. 컴파일된 바이너리는 CPU에 직접 넘어가지 않고, 운영체제가 자원(CPU·메모리·디스크) 접근을 대신 맡는다.

```cpp
#include <iostream>   // # 으로 시작하는 줄은 전처리기 지시문

int main()            // 진입점. 없으면 링크 단계에서 실패한다
{
    return 0;         // 0은 정상 종료, 그 밖의 정수는 오류
}
```

## 변수와 초기화

| 용어 | 뜻 |
| --- | --- |
| 객체(object) | 메모리에 자리를 차지한 모든 것. C++ 표준에서는 `int` 변수도 객체다 |
| 변수(variable) | 객체에 붙인 이름 |
| L-value | 이름과 주소가 있어 대입의 왼쪽에 올 수 있는 식 (`x`) |
| R-value | 식이 끝나면 사라지는 임시 값 (`123`, `x + 2`) |

**초기화**는 생성과 동시에 값을 주는 것이고, **대입**은 이미 있는 변수의 값을 바꾸는 것이다. 같은 `=` 기호를 써도 다른 연산이며, 클래스에서는 각각 생성자와 대입 연산자가 호출된다.

```cpp
int a = 1234;   // 복사 초기화
int b(1234);    // 직접 초기화
int c{1234};    // 중괄호(균일) 초기화, C++11. 축소 변환(narrowing)을 컴파일 오류로 막는다
int d;          // 지역 변수는 초기화하지 않으면 쓰레기 값
d = 6543;       // 대입
```

## 입출력 스트림

`<iostream>`의 `std::cout`은 표준 출력 버퍼로, `std::cin`은 표준 입력 버퍼에서 데이터를 흘려보낸다. 그래서 **스트림**이라 부른다.

| 도구 | 역할 |
| --- | --- |
| `<<`, `>>` | 스트림 삽입·추출 연산자 |
| `std::endl` | 줄바꿈 후 버퍼를 비운다(flush). 줄바꿈만 필요하면 `'\n'`이 더 싸다 |
| `cin.fail()` | 직전 입력이 형식에 맞지 않았는지 확인 |
| `cin.clear()` | 실패 플래그를 지운다 |
| `cin.ignore(n, '\n')` | 버퍼에 남은 잘못된 입력을 버린다 |

숫자를 기대하는 자리에 문자가 들어오면 `fail` 상태가 되어 이후 입력이 모두 무시된다. `clear()` → `ignore()` 순서로 복구한다.

## 헤더와 네임스페이스

- 선언은 헤더(`.h`, `.hpp`)에, 정의는 소스(`.cpp`)에 둔다. 함수는 호출 전에 선언만 보여도 되므로 전방 선언(forward declaration)으로 순서를 풀 수 있다.
- 같은 헤더가 여러 경로로 두 번 포함되면 중복 정의 오류가 난다. **헤더 가드**로 막는다.

```cpp
#ifndef ADD_H      // 전통적인 헤더 가드
#define ADD_H
int add(int a, int b);
#endif

#pragma once       // 같은 역할. 표준은 아니지만 주요 컴파일러가 모두 지원한다
```

- **네임스페이스**는 이름 충돌을 막는 이름 공간이다. `std::cout`처럼 범위 지정 연산자 `::`로 부르거나 `using`으로 끌어온다. 중첩할 수 있고 `namespace fs = std::filesystem;`처럼 별칭을 붙일 수 있다.
- 헤더 파일에 `using namespace std;`를 쓰면 그 헤더를 포함한 모든 파일로 이름이 새어 나가므로 피한다.

## 참조자(reference)

참조자는 **이미 있는 변수에 붙이는 또 다른 이름**이다. 타입 뒤에 `&`를 붙여 선언한다.

```cpp
int a = 2;
int& ref = a;   // 선언과 동시에 반드시 초기화
ref = 4;        // a도 4가 된다
int b = 10;
ref = b;        // ref가 b를 가리키게 되는 것이 아니라, a에 10이 대입된다
```

### 포인터와 무엇이 다른가

| 항목 | 포인터 | 참조자 |
| --- | --- | --- |
| 문법 | `*p`, `p->x`로 역참조 | 일반 변수처럼 사용 |
| 초기화 | 나중에 해도 된다 | 선언과 동시에 필수 |
| null | `nullptr`를 가질 수 있다 | 없다. 늘 유효한 대상이 있다고 가정한다 |
| 재지정 | 다른 대상을 가리킬 수 있다 | 한 번 묶이면 바꿀 수 없다 |
| 자체 메모리 | 주소를 담는 변수로 존재 | 컴파일러가 별명으로 처리하면 공간이 없을 수 있다 |

**내부 구현은 대개 포인터와 같다.** 함수 매개변수나 멤버로 쓰인 참조자는 디스어셈블해 보면 주소를 넘기는 코드와 똑같다. 차이는 컴파일러가 보장해 주는 제약에 있다.

### 언제 무엇을 쓰나

```cpp
void swap(int& a, int& b) { int t = a; a = b; b = t; }   // 호출: swap(x, y)
void print(const std::string& s);                        // 복사 없이 읽기 전용
```

| 상황 | 선택 |
| --- | --- |
| 큰 객체를 읽기만 한다 | `const T&` — 복사 비용이 없다 |
| 인자를 수정해야 하고 대상이 늘 있다 | `T&` |
| "없음"을 표현해야 한다 (선택 인자, 못 찾음) | 포인터 (또는 `std::optional`) |
| 가리키는 대상을 바꿔야 한다 | 포인터 |

함수 안의 지역 변수를 참조자로 반환하면 함수가 끝나는 순간 대상이 사라져 **댕글링 참조**가 된다. 참조 반환은 멤버나 인자처럼 호출보다 오래 사는 객체에만 쓴다.

## switch의 fallthrough

`case`는 진입 지점일 뿐이라, `break`가 없으면 아래 `case`까지 계속 실행된다. 이를 **fallthrough**라 한다. 실수로 빠뜨린 `break`는 흔한 버그라서 컴파일러가 경고한다.

| 컴파일러 | 경고 조건 |
| --- | --- |
| GCC | `-Wextra`에 `-Wimplicit-fallthrough=3`이 포함된다 |
| Clang | `-Wall -Wextra`에 없다. `-Wimplicit-fallthrough`를 따로 켜야 한다 |

의도한 fallthrough라면 경고를 끄지 말고 의도를 표시한다.

```cpp
switch (c) {
case 1:
    doA();
    [[fallthrough]];               // C++17 표준 속성. 가장 권장
case 2:
    doB();
    __attribute__((fallthrough));  // C++17 이전, GCC·Clang 확장
case 3:
    doC();
    // FALLTHROUGH                 // GCC만 인식하는 주석 표기
default:
    break;
}
```

표준 속성을 쓸 수 있으면 `[[fallthrough]]`가 컴파일러에 묶이지 않는다. C++98로 제한된 환경이면 `__attribute__((fallthrough))`나 GCC 주석 표기를 쓴다.

## 정리

- 초기화와 대입은 다른 연산이다. 중괄호 초기화는 축소 변환을 막아 준다.
- 헤더에는 선언과 헤더 가드를 두고, `using namespace`는 소스 파일 안에서만 쓴다.
- 참조자는 null이 없고 다시 묶을 수 없는 별명이다. 읽기 전용 인자는 `const T&`가 기본이다.
- "없음"이 가능한 자리에만 포인터를 쓴다.
- 의도한 fallthrough는 `[[fallthrough]]`로 표시하고 경고는 켜 둔다.

관련 노트: [[pointers-and-memory|포인터와 메모리]], [[c-basics|C 기초: 컴파일, 자료형, 배열과 문자열]], [[cpp-templates|C++ 템플릿]], [[abstract-class-vs-interface|추상 클래스와 인터페이스]]
