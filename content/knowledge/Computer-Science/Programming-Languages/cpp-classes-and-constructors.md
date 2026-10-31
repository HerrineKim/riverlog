---
title: "C++ 클래스와 생성자·소멸자: 캡슐화, 초기화 리스트, static 멤버, RAII, 3·5·0의 규칙"
concept: "C++ Class"
summary: "C++ 클래스의 접근 지정과 캡슐화, 멤버 함수와 this, 생성자 오버로딩과 기본 생성자가 자동으로 생기는 조건, 멤버 초기화 리스트, static 멤버, 생성의 역순으로 불리는 소멸자를 정리한다. 자원을 소멸자에 묶는 RAII가 C++ 자원 관리의 기본이고, 복사 동작은 3·5·0의 규칙으로 정한다."
tags: ["cpp", "oop", "memory", "computer-science"]
source: other
date: "2026-10-31"
sources: ["고려사이버대학교 객체지향 프로그래밍(C++) 강의(장윤경 교수, 2024-2학기)"]
---

> 고려사이버대학교 「객체지향 프로그래밍(C++)」(2024-2학기) 강의 내용을 바탕으로 정리했다.

## 클래스와 객체

클래스는 데이터(멤버 변수)와 그 데이터를 다루는 함수(멤버 함수)를 묶은 사용자 정의 타입이다. 클래스로 선언한 변수가 객체(인스턴스)이고, `int`처럼 값으로 만들 수도(`Car c;`), `new`로 힙에 만들 수도(`Car* p = new Car;`) 있다. 멤버 접근은 객체면 `.`, 포인터면 `->`를 쓴다.

C의 [[c-struct-and-function-pointer|구조체와 함수 포인터]]로 흉내 내던 캡슐화와 다형성을 언어가 직접 지원하는 것이다.

## 접근 지정과 캡슐화

| 지정자 | 접근 가능한 곳 |
| --- | --- |
| `public` | 어디서나 |
| `protected` | 자기 클래스와 파생 클래스 ([[cpp-inheritance\|C++ 상속]]) |
| `private` | 자기 클래스(와 `friend`)만 |

- `class`와 `struct`의 차이는 **기본 접근 수준뿐**이다. `class`는 `private`, `struct`는 `public`이 기본이다. 관례상 불변 조건이 없는 단순 데이터 묶음은 `struct`, 불변 조건을 지켜야 하는 타입은 `class`로 쓴다.
- 캡슐화의 목적은 **불변 조건(invariant)을 지키는 것**이다. 멤버 변수를 `private`로 막고 값을 바꾸는 길을 멤버 함수 하나로 모으면, 그 함수에서 잘못된 값(음수 잔액, 범위 밖 연료량)을 거를 수 있다. 모든 필드에 검증 없는 getter·setter를 기계적으로 다는 것은 `public` 필드와 다를 바가 없다.

## 멤버 함수

```cpp
class Tank {
public:
    bool refuel(double liters);                 // 선언만
    double level() const { return level_; }     // 클래스 안에서 정의: 암묵적으로 inline
private:
    double level_ = 0;                          // 기본 멤버 초기화 (C++11)
    static constexpr double kCapacity = 60.0;
};

bool Tank::refuel(double liters) {              // 바깥 정의: 범위 결정 연산자 ::
    if (liters <= 0 || level_ + liters > kCapacity) return false;
    level_ += liters;
    return true;
}
```

- **클래스 안에서 정의한 멤버 함수는 암묵적으로 `inline`**이다. 오늘날 `inline`의 핵심 의미는 "호출부에 펼쳐라"가 아니라 "여러 번역 단위에 같은 정의가 있어도 된다"이다. 실제로 펼칠지는 컴파일러가 최적화 단계에서 정한다. 그래서 헤더에 정의를 둘 수 있다.
- 모든 비정적 멤버 함수는 호출한 객체를 가리키는 숨은 인자 **`this`**를 받는다. `tank.refuel(5)`는 개념상 `Tank::refuel(&tank, 5)`다.
- **`const` 멤버 함수**(`level() const`)는 `this`가 `const Tank*`가 되어 멤버를 바꿀 수 없다. `const` 객체나 `const&`로 받은 객체에서는 `const` 멤버 함수만 부를 수 있으므로, 상태를 바꾸지 않는 함수에는 꼭 붙인다.

## 생성자

생성자는 객체가 만들어질 때 자동으로 불려 멤버를 초기화하는 함수다. 이름이 클래스와 같고 반환 타입이 없으며, 매개변수 목록을 달리해 여러 개 둘 수 있다(오버로딩).

### 기본 생성자가 생기는 조건

| 클래스에 선언된 생성자 | 컴파일러가 만드는 기본 생성자 |
| --- | --- |
| 하나도 없음 | 인자 없는 기본 생성자를 만든다 |
| 하나라도 있음 | 만들지 않는다. 필요하면 `Point() = default;`로 요청한다 |

기본 생성자가 없으면 `Point arr[10];`처럼 **객체 배열**을 만들 수 없다. 원소마다 인자 없는 생성자를 불러야 하기 때문이다. `std::vector<Point>`에 `push_back`·`emplace_back`으로 넣으면 이 제약을 피할 수 있다.

### 멤버 초기화 리스트

```cpp
class Account {
public:
    Account(std::string owner, long balance)
        : owner_(std::move(owner)), balance_(balance) {}   // 초기화 리스트
    explicit Account(std::string owner) : Account(std::move(owner), 0) {}  // 위임 생성자
private:
    const std::string owner_;
    long balance_;
};
```

- 생성자 본문 `{}`에 들어가기 전에 멤버는 이미 만들어져 있다. 본문에서 `owner_ = owner;`라고 쓰면 기본 생성 후 대입하는 두 단계가 된다. 초기화 리스트는 처음부터 그 값으로 만든다.
- **`const` 멤버, 참조 멤버, 기본 생성자가 없는 멤버는 초기화 리스트에서만** 초기화할 수 있다.
- 멤버는 초기화 리스트에 적은 순서가 아니라 **클래스에 선언한 순서**로 초기화된다. 한 멤버로 다른 멤버를 초기화할 때 순서가 어긋나면 쓰레기 값을 읽는다. `-Wreorder` 경고가 잡아 준다.
- 인자가 하나인 생성자는 암묵적 형 변환에도 쓰인다. 의도하지 않았다면 `explicit`을 붙인다([[cpp-operator-overloading|연산자 오버로딩과 형 변환]]).

## static 멤버

`static` 멤버 변수는 객체마다가 아니라 **클래스에 하나만** 있는 변수다. 만들어진 객체 수 세기, 공용 설정 같은 데 쓴다.

```cpp
class Session {
public:
    Session()  { ++alive_; }
    ~Session() { --alive_; }
    static int alive() { return alive_; }   // this가 없다. 비정적 멤버에 접근 불가
private:
    inline static int alive_ = 0;           // C++17: 클래스 안에서 정의까지
};
```

C++17 이전에는 클래스 안에서는 선언만 하고 `.cpp` 파일에 `int Session::alive_ = 0;`으로 정의를 따로 둬야 했다. `static` 멤버 함수는 객체 없이 `Session::alive()`로 부른다. Java의 static과 비교는 [[java-language-basics|Java 언어 기본]]에 있다.

## 소멸자와 RAII

소멸자(`~Tank()`)는 객체가 사라질 때 자동으로 불린다. 지역 객체는 블록을 벗어날 때, `new`로 만든 객체는 `delete`할 때다. 인자도 반환값도 없고 하나만 둘 수 있다.

- 소멸 순서는 **생성의 정확한 역순**이다. 한 블록의 지역 객체는 선언의 역순으로, 한 객체 안에서는 본문 → 멤버(선언 역순) → 기반 클래스 순으로 정리된다.
- 기반 클래스 포인터로 파생 객체를 지우려면 기반의 소멸자가 `virtual`이어야 한다([[cpp-virtual-functions|가상 함수와 vtable]]).

이 성질을 이용해 **자원 획득을 생성자에, 해제를 소멸자에 묶는 기법이 RAII(Resource Acquisition Is Initialization)**다. 함수가 정상 반환하든 중간에 `return`하든 예외로 빠져나가든, 스택의 객체는 반드시 소멸되므로 자원이 새지 않는다([[cpp-exceptions|C++ 예외 처리의 내부 동작]]).

| 자원 | 직접 관리 | RAII 래퍼 |
| --- | --- | --- |
| 힙 메모리 | `new`/`delete` | `std::unique_ptr`, `std::vector`, `std::string` |
| 공유 소유 | 참조 카운트 직접 구현 | `std::shared_ptr` |
| 뮤텍스 | `lock()`/`unlock()` | `std::lock_guard`, `std::scoped_lock` |
| 파일 | `fopen`/`fclose` | `std::fstream` |

## 복사와 3·5·0의 규칙

클래스에 복사 생성자를 쓰지 않으면 컴파일러가 **멤버를 하나씩 복사하는** 복사 생성자와 복사 대입 연산자를 만든다. 멤버가 원시 포인터면 주소만 복사되는 얕은 복사가 되어 문제가 생긴다.

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
| 3의 규칙 | 소멸자, 복사 생성자, 복사 대입 연산자 중 하나를 직접 정의해야 한다면 셋 다 정의한다 |
| 5의 규칙 (C++11) | 여기에 이동 생성자, 이동 대입 연산자를 더한다. 소멸자나 복사 연산을 직접 선언하면 이동 연산은 자동으로 생기지 않고 복사로 대신된다 |
| 0의 규칙 | 자원은 RAII 멤버(`std::vector`, `std::unique_ptr`)에 맡기고 다섯 개 모두 직접 정의하지 않는다 |

**기본은 0의 규칙이다.** 위 `Buffer`는 `std::vector<char> data_;` 하나로 바꾸면 소멸자도 복사·이동도 컴파일러가 올바르게 만들어 준다. 복사를 금지하려면 `Buffer(const Buffer&) = delete;`로 막는다. 직접 자원을 다루는 저수준 클래스만 5의 규칙을 따라 모두 구현한다.

## 정리

- `class`와 `struct`는 기본 접근 수준만 다르다. 캡슐화는 불변 조건을 지키려고 한다
- 상태를 바꾸지 않는 멤버 함수에는 `const`를 붙인다
- 생성자를 하나라도 쓰면 기본 생성자는 사라진다. 멤버는 초기화 리스트로, 선언 순서대로 초기화된다
- 소멸자는 생성의 역순으로 불린다. 자원은 RAII로 소멸자에 묶는다
- 복사 동작은 0의 규칙이 기본, 직접 자원을 쥐면 5의 규칙

관련 노트: [[cpp-basics|C++ 기초 문법과 참조자]], [[cpp-inheritance|C++ 상속]], [[cpp-operator-overloading|C++ 연산자 오버로딩과 형 변환]], [[cpp-virtual-functions|가상 함수와 vtable]], [[cpp-exceptions|C++ 예외 처리의 내부 동작]], [[pointers-and-memory|포인터와 메모리]]
