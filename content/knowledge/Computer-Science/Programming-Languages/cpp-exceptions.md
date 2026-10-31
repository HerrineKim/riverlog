---
title: "C++ 예외 처리의 내부 동작"
concept: "C++ Exception"
summary: "C++의 throw가 실제로 하는 일을 정리한다. 예외 객체는 힙에 할당되어 참조 카운트로 해제되고, 스택 되감기는 컴파일러가 만든 테이블(.eh_frame, LSDA)을 보고 함수와 call site를 찾아 소멸자를 부른다. 현대 컴파일러의 zero-cost 방식은 try 자체에는 비용이 없지만 throw가 매우 비싸므로, 예외는 진짜 예외 상황에만 쓰고 일상적인 실패는 오류 코드나 std::expected로 돌려준다."
tags: ["cpp", "memory", "performance", "computer-science"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/c622fed6d55849af83f4d03b0314a58c", "https://80000coding.notion.site/9baff667c62d42e69e948fe2a55dbeca", "https://80000coding.notion.site/1b6c77742039492f9744eeb81f44825f", "https://en.cppreference.com/w/cpp/utility/expected", "https://itanium-cxx-abi.github.io/cxx-abi/abi-eh.html", "https://llvm.org/docs/ExceptionHandling.html"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「std::exception 동작원리」, 「exception은 스택과 힙 어디에 할당될까」, 「C++ 에러 코드와 에러 메시지 관리」를 바탕으로 재구성한 노트다. 구현 세부는 Itanium C++ ABI 예외 처리 문서를 기준으로 맞췄다.

## throw가 하는 일

`throw`는 단순한 점프가 아니다. 맞는 `catch`를 찾을 때까지 호출 스택을 한 단계씩 거슬러 오르며, 지나치는 함수마다 지역 객체의 소멸자를 불러야 한다. 이를 **스택 되감기**(stack unwinding)라 한다.

```text
throw 발생
 └─ ① 지금 함수에 이 타입을 받는 catch가 있나?
     ├─ 있다 → catch 블록으로 이동
     └─ 없다 → ② 이 함수의 살아 있는 지역 객체 소멸자 호출
               ③ 호출자 프레임으로 복귀 (return을 대신 수행)
               → ①부터 반복. 끝까지 없으면 std::terminate()
```

③은 프레임 포인터와 복귀 주소만 있으면 된다. 그러나 ①과 ②는 스택만 봐서는 알 수 없다. 스택에는 "이 프레임이 어떤 함수인지", "어느 지점까지 실행되어 어떤 객체가 살아 있는지", "catch가 있는지"가 적혀 있지 않기 때문이다. 그래서 이 정보를 **어딘가에 따로 기록**해야 하고, 그 방식에 따라 구현이 갈린다.

## 두 가지 구현 방식

C++ 표준은 예외의 내부 구현을 정하지 않는다. 컴파일러와 플랫폼마다 다르며 크게 두 계열이 있다.

| 방식 | 원리 | 비용 | 사용처 |
| --- | --- | --- | --- |
| 동적 등록(dynamic registration) | 함수에 들어갈 때마다 예외 처리 정보를 런타임 체인에 등록하고 나갈 때 해제 | **try만 써도** 매 호출마다 비용 | 32비트 MSVC(SEH 프레임), 예전 GCC(setjmp/longjmp 방식) |
| 테이블 기반(table-driven, zero-cost) | 컴파일할 때 함수·구간별 정보를 테이블로 만들어 두고, throw가 나면 그때 테이블을 조회 | 정상 경로 비용 없음, **throw 시 큰 비용** + 테이블만큼 바이너리 증가 | x86-64·ARM64의 GCC·Clang(Itanium ABI), 64비트 MSVC |

현대 64비트 환경은 거의 모두 테이블 기반이다. "zero-cost"는 예외가 **나지 않을 때** 비용이 없다는 뜻이지 예외가 싸다는 뜻이 아니다.

## 테이블 기반 되감기의 구조

ELF 바이너리(GCC·Clang) 기준으로 두 종류의 테이블이 쓰인다.

| 테이블 | 위치 | 담는 정보 |
| --- | --- | --- |
| 함수 범위 테이블 | `.eh_frame` | 각 함수의 시작 주소와 크기, 프레임을 복원하는 방법 |
| LSDA(언어별 데이터) | `.gcc_except_table` | 함수 안 **call site** 구간들, 구간별 정리 코드 주소(landing pad), catch할 타입 정보 |

**call site**가 필요한 이유는 같은 함수라도 throw 지점에 따라 정리할 객체가 다르기 때문이다.

```cpp
void f2() {
    D d1;
    f1();      // call site #1: 여기서 던지면 d1만 소멸
    D d2;
    f1();      // call site #2: 여기서 던지면 d2, d1 소멸
}
```

되감기 루틴은 현재 명령어 주소(IP)로 `.eh_frame`에서 함수를 찾고, LSDA에서 IP가 속한 call site를 찾아 그 구간의 landing pad로 점프한다. landing pad는 해당 지점에 살아 있는 객체의 소멸자를 부르는 코드다. 실제로 컴파일 결과를 보면 call site #1의 landing pad는 `D`의 소멸자를 한 번, #2는 두 번 호출한다. catch 후보를 만나면 LSDA의 타입 테이블로 던진 예외의 타입과 맞는지 비교한다.

## 예외 객체는 어디에 있나

`throw MyError();`의 예외 객체는 **스택이 아니라 힙에 있다.** 되감기 중에 스택 프레임이 차례로 사라지므로 스택에 둘 수 없다. Itanium ABI의 처리 순서는 다음과 같다.

| 단계 | 런타임 함수 | 하는 일 |
| --- | --- | --- |
| 할당 | `__cxa_allocate_exception` | 예외 객체 + 헤더 크기만큼 `malloc`. 메모리가 없으면 비상 버퍼(emergency pool)를 쓴다 |
| 던지기 | `__cxa_throw` | 객체 타입 정보를 넘기고 되감기 시작 |
| 잡기 | `__cxa_begin_catch` | 처리 중인 예외 목록(스레드별)에 올리고 참조 카운트 증가 |
| 끝 | `__cxa_end_catch` | rethrow가 아니면 카운트를 줄이고, 0이면 소멸자 호출 후 `__cxa_free_exception`으로 해제 |

참조 카운트는 원자적으로 관리된다. `std::exception_ptr`로 예외를 다른 스레드에 넘겨도 마지막 참조가 사라질 때 해제되는 이유다.

## 그래서 어떻게 쓰나

- **예외는 진짜 예외 상황에만 쓴다.** 입력 검증 실패처럼 자주 일어나는 분기를 `try/catch`로 처리하면 throw마다 테이블 조회와 되감기 비용을 치른다. 일상적인 실패는 반환값(`std::optional`, `std::expected`(C++23), 오류 코드)으로 표현한다.
- 소멸자에서 예외를 던지지 않는다. 되감기 중 소멸자에서 또 예외가 나면 즉시 `std::terminate()`다. C++11부터 소멸자는 기본적으로 `noexcept`다.
- 던지지 않는 함수는 `noexcept`로 표시한다. 컴파일러가 정리 코드를 줄일 수 있고, `std::vector`는 이동 생성자가 `noexcept`일 때만 재할당에서 이동을 쓴다.
- 자원은 RAII 객체(스마트 포인터, `std::lock_guard`)에 맡긴다. 되감기가 소멸자를 불러 주므로 예외가 나도 자원이 새지 않는다.
- 게임 엔진, 임베디드, 일부 대형 코드베이스는 `-fno-exceptions`로 예외를 끄고 오류 코드만 쓴다. 이 경우 표준 라이브러리의 throw는 `abort`로 바뀐다는 점을 감안한다.

## 예외 대신 오류 코드

예외를 끄거나 아끼는 코드베이스는 실패를 **반환값**으로 알린다. 외부 인터페이스는 오류 코드를 돌려주고, 호출자가 코드를 검사해 메시지를 출력하거나 복구한다.

| 방식 | 형태 | 특징 |
| --- | --- | --- |
| 정수·enum 오류 코드 | `ErrorCode open(const char* path, File* outFile)` | C와 호환되고 비용이 없다. 검사를 빼먹어도 컴파일러가 모른다(`[[nodiscard]]`로 경고) |
| `std::error_code` (C++11) | 값 + 범주(category) 쌍 | OS 오류(`errno`)와 라이브러리 오류를 한 타입으로 다룬다. `message()`로 문자열을 얻는다. `<filesystem>`, Asio가 쓴다 |
| `std::expected<T, E>` (C++23) | 성공 값 `T` 또는 오류 `E` | 결과와 오류를 한 반환값에 담는다. `and_then`·`transform`으로 이어 붙인다 |

```cpp
std::expected<int, ErrorCode> parsePort(std::string_view s);

if (auto port = parsePort(arg)) use(*port);
else std::cerr << getErrorMessage(port.error());
```

### 코드와 메시지를 한 곳에서 관리: X-macro

오류 코드 enum과 `switch`로 짠 메시지 함수를 따로 두면, 코드를 하나 추가할 때 두 곳을 고쳐야 하고 둘이 어긋나기 쉽다. **X-macro**는 목록을 한 번만 쓰고 전처리기로 enum과 메시지 표를 둘 다 생성한다.

```cpp
#define ERROR_LIST(X)                       \
    X(SUCCESS,        "Success")            \
    X(FAILED_TO_OPEN, "Failed to open")     \
    X(FAILED_TO_BIND, "Failed to bind")

enum class ErrorCode {
#define X(name, msg) name,
    ERROR_LIST(X)
#undef X
};

inline const char* getErrorMessage(ErrorCode code) {
    switch (code) {
#define X(name, msg) case ErrorCode::name: return msg;
        ERROR_LIST(X)
#undef X
    }
    return "Unknown error";
}
```

새 오류는 `ERROR_LIST`에 한 줄만 더하면 enum 값과 메시지가 함께 생긴다. 같은 목록으로 문자열 이름 표나 `std::error_category` 구현까지 생성할 수 있다.

## 정리

- throw는 catch를 찾아 스택을 거슬러 오르며 지역 객체 소멸자를 부르는 과정이다.
- 현대 컴파일러는 컴파일 타임 테이블(`.eh_frame`, LSDA)로 함수와 call site를 찾아 되감는다.
- zero-cost는 정상 경로 이야기이고, throw 자체는 매우 비싸며 테이블만큼 바이너리가 커진다.
- 예외 객체는 힙에 할당되고 참조 카운트로 해제된다.
- 예외를 `if` 대신 쓰지 않는다. 자주 일어나는 실패는 오류 코드, `std::error_code`, `std::expected`로 표현한다.
- 오류 코드와 메시지는 X-macro로 한 목록에서 생성해 어긋나지 않게 한다.

관련 노트: [[cpp-virtual-functions|가상 함수와 vtable]], [[memory-pool|메모리 풀]], [[pointers-and-memory|포인터와 메모리]], [[cpp-classes-and-constructors|C++ 클래스와 생성자·소멸자]]
