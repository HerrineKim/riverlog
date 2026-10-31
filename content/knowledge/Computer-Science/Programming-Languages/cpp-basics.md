---
title: "C++ 기초: 문법, 참조자, 클래스, 연산자 오버로딩"
concept: "C++ Basics"
summary: "C++ 프로그램의 구조, 초기화 문법과 L·R-value, 입출력 스트림, 헤더와 네임스페이스, switch의 fallthrough, 포인터와 참조자의 차이, 그리고 클래스의 접근 지정·생성자·초기화 리스트·static 멤버·소멸자와 RAII·3·5·0의 규칙, 연산자 오버로딩과 explicit 형 변환을 정리한다. 참조자는 null이 없는 별명이고, 자원은 소멸자에 묶으며, 인자 하나짜리 생성자에는 기본으로 explicit을 붙인다."
tags: ["cpp", "oop", "pointer", "memory", "type", "computer-science"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/23ed5ee6e09d4953af96a16a1463b635", "https://80000coding.notion.site/71480af963104c8cbaf82ea65b513ddb", "https://80000coding.notion.site/ddcdbb4d461a4a6497b85040fc49c7d6", "https://80000coding.notion.site/e570df1529ef464290454f72795785e9", "https://en.cppreference.com/w/cpp/language/attributes/fallthrough", "고려사이버대학교 객체지향 프로그래밍(C++) 강의(장윤경 교수, 2024-2학기)"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「C++의 기초적인 사용법」, 「참조 변수 (Reference Variable)」, 「참조자는 왜 쓰는걸까?」, 「switch case에서의 명시적 fallthrough」를 바탕으로 재구성한 노트다.
> 클래스와 생성자·소멸자, 연산자 오버로딩과 형 변환은 고려사이버대학교 「객체지향 프로그래밍(C++)」(2024-2학기) 강의 내용으로 보강했다.

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
| `<<`, `>>` | 스트림 삽입·추출 연산자. 표준 라이브러리가 해 둔 연산자 오버로딩이다(아래 「연산자 오버로딩」) |
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
| 큰 객체를 읽기만 한다 | `const T&`: 복사 비용이 없다 |
| 인자를 수정해야 하고 대상이 늘 있다 | `T&` |
| "없음"을 표현해야 한다 (선택 인자, 못 찾음) | 포인터 (또는 `std::optional`) |
| 가리키는 대상을 바꿔야 한다 | 포인터 |

함수 안의 지역 변수를 참조자로 반환하면 함수가 끝나는 순간 대상이 사라져 **댕글링 참조**가 된다. 참조 반환은 멤버나 인자처럼 호출보다 오래 사는 객체에만 쓴다.

## 클래스와 객체

클래스는 데이터(멤버 변수)와 그 데이터를 다루는 함수(멤버 함수)를 한 타입으로 묶은 것이다. 클래스 타입의 변수가 객체(인스턴스)이고, 스택에 값으로(`Car c;`) 만들 수도, `new`로 힙에(`Car* p = new Car;`) 만들 수도 있다. 멤버에는 객체면 `.`, 포인터면 `->`로 접근한다. C에서 [[c-struct-and-function-pointer|C 사용자 정의 타입과 함수 포인터]]로 흉내 내던 캡슐화·다형성을 언어가 직접 지원하는 셈이다.

### 접근 지정과 캡슐화

| 지정자 | 접근 가능한 곳 |
| --- | --- |
| `public` | 어디서나 |
| `protected` | 자기 클래스와 파생 클래스 ([[cpp-virtual-functions\|C++ 상속과 가상 함수]]) |
| `private` | 자기 클래스와 `friend`만 |

- `class`와 `struct`는 **기본 접근 수준만 다르다**(`class`는 `private`, `struct`는 `public`). 관례상 불변 조건이 없는 단순 데이터 묶음에 `struct`, 지켜야 할 불변 조건이 있는 타입에 `class`를 쓴다.
- 캡슐화의 목적은 **불변 조건(invariant)을 지키는 것**이다. 멤버를 `private`로 닫고 값을 바꾸는 길을 멤버 함수로 모으면 거기서 음수 잔액, 용량 초과 같은 잘못된 값을 걸러 낼 수 있다. 검증 없는 getter·setter를 모든 필드에 다는 것은 `public` 필드와 다를 바 없다.

### 멤버 함수, this, const

```cpp
class Tank {
public:
    bool refuel(double liters);                 // 선언만
    double level() const { return level_; }     // 클래스 안 정의: 암묵적으로 inline
private:
    double level_ = 0;                          // 기본 멤버 초기화 (C++11)
    static constexpr double kCapacity = 60.0;
};

bool Tank::refuel(double liters) {              // 바깥 정의는 범위 결정 연산자 ::
    if (liters <= 0 || level_ + liters > kCapacity) return false;
    level_ += liters;
    return true;
}
```

- 클래스 안에서 정의한 멤버 함수는 **암묵적으로 `inline`**이다. 지금의 `inline`은 "호출부에 펼쳐라"가 아니라 "여러 번역 단위에 같은 정의가 있어도 된다"는 뜻이고, 실제로 펼칠지는 최적화기가 정한다. 그래서 헤더에 정의를 둘 수 있다.
- 비정적 멤버 함수는 호출한 객체의 주소를 숨은 인자 **`this`**로 받는다. `tank.refuel(5)`는 개념상 `Tank::refuel(&tank, 5)`다.
- **`const` 멤버 함수**는 `this`가 `const Tank*`가 되어 멤버를 바꾸지 못한다. `const` 객체나 `const&`로 받은 객체에서는 `const` 멤버 함수만 부를 수 있으므로, 상태를 바꾸지 않는 함수에는 빠짐없이 붙인다.

## 생성자

생성자는 객체가 만들어질 때 자동으로 불려 멤버를 초기화한다. 이름이 클래스와 같고 반환 타입이 없으며, 매개변수 목록을 달리해 여러 개 둘 수 있다.

| 클래스에 선언된 생성자 | 컴파일러가 만드는 기본 생성자 |
| --- | --- |
| 하나도 없다 | 인자 없는 기본 생성자를 만든다 |
| 하나라도 있다 | 만들지 않는다. 필요하면 `Point() = default;`로 요청한다 |

기본 생성자가 없으면 `Point arr[10];` 같은 객체 배열을 만들 수 없다. 원소마다 인자 없이 생성해야 하기 때문이다. `std::vector<Point>`에 `emplace_back`으로 넣으면 이 제약이 없다.

### 멤버 초기화 리스트

```cpp
class Account {
public:
    Account(std::string owner, long balance)
        : owner_(std::move(owner)), balance_(balance) {}                  // 초기화 리스트
    explicit Account(std::string owner) : Account(std::move(owner), 0) {}  // 위임 생성자
private:
    const std::string owner_;
    long balance_;
};
```

- 생성자 본문 `{}`에 들어갈 때 멤버는 이미 만들어져 있다. 본문에서 대입하면 "기본 생성 후 대입" 두 단계가 되고, 초기화 리스트는 처음부터 그 값으로 만든다. 앞 절의 초기화와 대입의 차이가 클래스에서 드러나는 자리다.
- **`const` 멤버, 참조 멤버, 기본 생성자가 없는 멤버는 초기화 리스트에서만** 초기화할 수 있다.
- 초기화 순서는 리스트에 적은 순서가 아니라 **클래스에 선언한 순서**다. 한 멤버로 다른 멤버를 초기화하는데 순서가 어긋나면 쓰레기 값을 읽는다. `-Wreorder`가 잡아 준다.

## static 멤버

`static` 멤버 변수는 객체마다가 아니라 **클래스에 하나** 있다. 살아 있는 객체 수, 공용 설정 같은 데 쓴다.

```cpp
class Session {
public:
    Session()  { ++alive_; }
    ~Session() { --alive_; }
    static int alive() { return alive_; }   // this가 없어 비정적 멤버에 접근할 수 없다
private:
    inline static int alive_ = 0;           // C++17: 클래스 안에서 정의까지
};
```

C++17 전에는 클래스 안에서 선언만 하고 `.cpp` 파일에 `int Session::alive_ = 0;`으로 정의를 따로 둬야 했다. `static` 멤버 함수는 객체 없이 `Session::alive()`로 부른다. Java의 static과 비교는 [[java-language-basics|Java 언어 기본]]에 있다.

## 소멸자와 RAII

소멸자(`~Tank()`)는 객체가 사라질 때 자동으로 불린다. 지역 객체는 블록을 벗어날 때, `new`로 만든 객체는 `delete`할 때다. 인자와 반환값이 없고 클래스에 하나뿐이다.

- 소멸 순서는 **생성의 정확한 역순**이다. 한 블록의 지역 객체는 선언의 역순, 한 객체 안에서는 소멸자 본문 → 멤버(선언 역순) → 기반 클래스 순이다.
- 기반 클래스 포인터로 파생 객체를 지우려면 기반의 소멸자가 `virtual`이어야 한다([[cpp-virtual-functions|C++ 상속과 가상 함수]]).

이 보장을 이용해 **자원 획득을 생성자에, 해제를 소멸자에 묶는 기법이 RAII(Resource Acquisition Is Initialization)**다. 정상 반환이든 중간 `return`이든 예외든, 스택의 객체는 반드시 소멸되므로 자원이 새지 않는다([[cpp-exceptions|C++ 예외 처리의 내부 동작]]).

| 자원 | 직접 관리 | RAII 래퍼 |
| --- | --- | --- |
| 힙 메모리 | `new`/`delete` | `std::unique_ptr`, `std::vector`, `std::string` |
| 공유 소유 | 참조 카운트 직접 구현 | `std::shared_ptr` |
| 뮤텍스 | `lock()`/`unlock()` | `std::lock_guard`, `std::scoped_lock` |
| 파일 | `fopen`/`fclose` | `std::fstream` |

### 복사와 3·5·0의 규칙

복사 생성자와 복사 대입 연산자를 쓰지 않으면 컴파일러가 **멤버를 하나씩 복사하는** 버전을 만든다. 멤버가 원시 포인터면 주소만 복사되는 얕은 복사가 된다.

```cpp
class Buffer {
    char* data_;
public:
    explicit Buffer(size_t n) : data_(new char[n]) {}
    ~Buffer() { delete[] data_; }
};

void f() {
    Buffer a(64);
    Buffer b = a;   // data_ 주소만 복사
}                   // b, a 순서로 소멸 → 같은 메모리를 두 번 delete[]
```

| 규칙 | 내용 |
| --- | --- |
| 3의 규칙 | 소멸자, 복사 생성자, 복사 대입 연산자 중 하나를 직접 정의해야 하면 셋 다 정의한다 |
| 5의 규칙 (C++11) | 이동 생성자와 이동 대입 연산자를 더한다. 소멸자나 복사 연산을 직접 선언하면 이동 연산은 자동으로 생기지 않고 복사로 대신된다 |
| 0의 규칙 | 자원은 RAII 멤버(`std::vector`, `std::unique_ptr`)에 맡기고 다섯 개 모두 직접 쓰지 않는다 |

**기본은 0의 규칙이다.** 위 `Buffer`는 멤버를 `std::vector<char>` 하나로 바꾸면 소멸·복사·이동이 모두 올바르게 생성된다. 복사를 막으려면 `Buffer(const Buffer&) = delete;`로 지운다. 자원을 직접 쥐는 저수준 클래스만 5의 규칙대로 모두 구현한다.

## 연산자 오버로딩

클래스는 새 타입이라 처음에는 `+`, `==`, `<<`를 쓸 수 없다. **`operator기호`라는 이름의 함수를 정의하면** 그 연산자가 내 타입에서 동작한다. 컴파일러는 연산식을 함수 호출로 바꾼다.

| 연산식 | 멤버 함수일 때 | 멤버가 아닌 함수일 때 |
| --- | --- | --- |
| `a + b` | `a.operator+(b)` | `operator+(a, b)` |
| `-a` | `a.operator-()` | `operator-(a)` |

`std::string`의 `+`, `std::cout`의 `<<`, 반복자의 `*`·`++`가 모두 표준 라이브러리의 연산자 오버로딩이다. 의미가 수학적·관례적으로 자연스러울 때만 쓴다.

### 멤버로 할까, 바깥 함수로 할까

멤버로 만들면 **왼쪽 피연산자가 반드시 그 클래스 객체**다. `v * 2`는 되지만 `2 * v`는 `int`에 멤버가 없어 안 된다. 이럴 때 바깥 함수로 만들고, `private`에 접근해야 하면 클래스 안에서 `friend`로 선언한다.

| 연산자 | 형태 | 이유 |
| --- | --- | --- |
| `=`, `[]`, `()`, `->`, 형 변환 | 멤버만 가능 | 언어 규칙 |
| `+=`, `-=`, `++`, `--` | 멤버 | 자기 상태를 바꾼다 |
| `+`, `*`, `==`, `<` 같은 대칭 이항 연산 | 바깥 함수(필요하면 `friend`) | 양쪽 피연산자가 똑같이 암묵적 변환을 받는다 |
| `<<`, `>>` (스트림) | 바깥 함수 | 왼쪽이 `std::ostream`이다 |

### 관례적인 구현

```cpp
class Vec2 {
public:
    Vec2(double x, double y) : x_(x), y_(y) {}

    Vec2& operator+=(const Vec2& o) { x_ += o.x_; y_ += o.y_; return *this; }
    Vec2 operator-() const { return {-x_, -y_}; }

    friend Vec2 operator+(Vec2 a, const Vec2& b) { return a += b; }        // +는 +=로
    friend Vec2 operator*(double k, const Vec2& v) { return {k * v.x_, k * v.y_}; }
    friend bool operator==(const Vec2&, const Vec2&) = default;            // C++20
    friend std::ostream& operator<<(std::ostream& os, const Vec2& v) {
        return os << '(' << v.x_ << ", " << v.y_ << ')';
    }
private:
    double x_, y_;
};
```

- **복합 대입을 먼저 만들고 이항 연산은 그것으로 구현한다.** 계산 로직이 한 곳에 모인다. `+=`는 자기 자신을 참조로, `+`는 새 값을 값으로 돌려준다.
- 대입·복합 대입이 `*this`를 참조로 돌려주는 것은 `a = b = c`, `(a += b) += c`를 내장 타입처럼 쓰게 하려는 것이다. `<<`가 `std::ostream&`을 돌려주는 것도 `cout << a << b`를 이어 가기 위해서다.
- C++20부터는 `operator<=>`(3방향 비교)와 `operator==`를 `= default`로 두면 `<`, `<=`, `!=` 등을 컴파일러가 만든다.
- 전위 `Counter& operator++()`는 증가 후 자기 자신을, 후위 `Counter operator++(int)`는 쓰이지 않는 `int` 인자로 구분되고 증가 전 복사본을 돌려준다. 후위가 복사 비용이 더 들어서, 결과를 쓰지 않는 반복문에서는 `++it`을 쓰는 습관이 생겼다.

### 바꿀 수 없는 것

- 새 연산자를 만들 수 없고, 우선순위·결합 방향·피연산자 수도 그대로다.
- `::`, `.`, `.*`, `?:`, `sizeof`, `typeid`는 오버로딩할 수 없다. 피연산자 중 하나는 사용자 정의 타입이어야 한다.
- `&&`, `||`, `,`는 오버로딩할 수는 있지만 하지 않는다. 일반 함수 호출이 되어 **단락 평가가 사라진다.**

## 클래스와 형 변환: explicit

| 방향 | 수단 | 예 |
| --- | --- | --- |
| 다른 타입 → 내 클래스 | 인자 하나로 부를 수 있는 생성자(변환 생성자) | `Meter(double)` |
| 내 클래스 → 다른 타입 | 변환 연산자 `operator 타입()` | `operator double() const` |

```cpp
class Meter {
public:
    explicit Meter(double v) : v_(v) {}
    explicit operator double() const { return v_; }
private:
    double v_;
};

Meter m{3.0};
double d = static_cast<double>(m);   // 명시적 변환만 허용
// Meter n = 3.0;                    // 오류: 암묵적 변환 금지
```

`explicit`이 없으면 컴파일러가 필요할 때마다 변환을 끼워 넣는다. `void send(Meter)`에 `send(3.0)`이 통과하고, 변환 연산자가 있으면 `m + 1`이 `double` 덧셈이 된다. 단위가 다른 값이 섞여도 컴파일되므로 **인자 하나짜리 생성자와 변환 연산자에는 기본으로 `explicit`을 붙이고**, `std::string`이 `const char*`를 받는 것처럼 정말 같은 값으로 봐도 될 때만 뺀다. `explicit operator bool()`은 `if (ptr)`, `while (stream)` 같은 조건식 안에서는 명시 없이 쓰여, 스마트 포인터와 스트림이 "유효한가"를 이 방식으로 표현한다.

## 정리

- 초기화와 대입은 다른 연산이다. 중괄호 초기화는 축소 변환을 막아 준다.
- 헤더에는 선언과 헤더 가드를 두고, `using namespace`는 소스 파일 안에서만 쓴다. 의도한 fallthrough는 `[[fallthrough]]`로 표시한다.
- 참조자는 null이 없고 다시 묶을 수 없는 별명이다. 읽기 전용 인자는 `const T&`, "없음"이 가능한 자리만 포인터.
- `class`와 `struct`는 기본 접근 수준만 다르다. 캡슐화는 불변 조건을 지키려고 하고, 상태를 바꾸지 않는 멤버 함수에는 `const`를 붙인다.
- 생성자를 하나라도 쓰면 기본 생성자는 사라진다. 멤버는 초기화 리스트로, 선언 순서대로 초기화된다.
- 소멸자는 생성의 역순으로 불린다. 자원은 RAII로 소멸자에 묶고, 복사 동작은 0의 규칙이 기본이다.
- 연산자 오버로딩은 `operator기호` 함수다. `+=`는 멤버로 `*this`를 참조 반환, `+`는 `+=`로, 대칭 연산과 `<<`는 바깥 함수로 만든다.
- 인자 하나짜리 생성자와 변환 연산자에는 기본으로 `explicit`을 붙인다.

관련 노트: [[pointers-and-memory|포인터와 메모리]], [[c-basics|C 기초]], [[cpp-virtual-functions|C++ 상속과 가상 함수]], [[cpp-templates|C++ 템플릿]], [[cpp-exceptions|C++ 예외 처리의 내부 동작]], [[c-struct-and-function-pointer|C 사용자 정의 타입과 함수 포인터]], [[type-systems|타입 시스템]]
