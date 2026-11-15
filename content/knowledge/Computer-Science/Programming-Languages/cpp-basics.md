---
title: "C++ 기초: 문법, 참조자, 클래스, 복사와 이동, 오버로딩"
concept: "C++ Basics"
summary: "C++ 프로그램의 구조, 초기화 문법과 L·R-value, 입출력 스트림, 헤더와 네임스페이스, 저장 지정자(static·extern·mutable), switch의 fallthrough, 포인터와 참조자의 차이, 그리고 클래스의 접근 지정·friend·this·생성자 종류·초기화 리스트·static 멤버·소멸자와 RAII·private 생성자와 소멸자, 복사 생성자와 복사 대입·얕은 복사와 깊은 복사·이동·3·5·0의 규칙, 함수 오버로딩과 연산자 오버로딩, explicit 형 변환을 정리한다. 참조자는 null이 없는 별명이고, 자원은 소멸자에 묶으며, 인자 하나짜리 생성자에는 기본으로 explicit을 붙인다."
tags: ["cpp", "oop", "pointer", "memory", "type", "computer-science"]
source: other
date: "2026-10-31"
sources: ["https://80000coding.notion.site/23ed5ee6e09d4953af96a16a1463b635", "https://80000coding.notion.site/71480af963104c8cbaf82ea65b513ddb", "https://80000coding.notion.site/ddcdbb4d461a4a6497b85040fc49c7d6", "https://80000coding.notion.site/e570df1529ef464290454f72795785e9", "https://en.cppreference.com/w/cpp/language/attributes/fallthrough", "고려사이버대학교 객체지향 프로그래밍(C++) 강의(장윤경 교수, 2024-2학기)", "https://github.com/avgspacelover/Subjective-studies_OS-CN-DBMS"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「C++의 기초적인 사용법」, 「참조 변수 (Reference Variable)」, 「참조자는 왜 쓰는걸까?」, 「switch case에서의 명시적 fallthrough」를 바탕으로 재구성한 노트다.
> 클래스와 생성자·소멸자, 연산자 오버로딩과 형 변환은 고려사이버대학교 「객체지향 프로그래밍(C++)」(2024-2학기) 강의 내용으로 보강했다.
> friend, this의 쓰임, 생성자 종류, private 생성자·소멸자, 복사 생성자와 복사 대입, 깊은 복사, 함수 오버로딩, 저장 지정자는 GitHub 자료 모음 「[Subjective-studies_OS-CN-DBMS](https://github.com/avgspacelover/Subjective-studies_OS-CN-DBMS)」의 OOP 면접 정리를 바탕으로 보강했다.

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

## 저장 지정자

변수 선언 앞의 몇몇 키워드는 값이 **얼마나 오래 사는지(저장 기간)**와 **어느 파일에서 보이는지(링크)**를 바꾼다. 옛 교재가 「저장 클래스(storage class)」로 묶어 소개하는 다섯 개 중 둘은 뜻이 바뀌었거나 사라졌다.

| 지정자 | 뜻 | 지금의 상태 |
| --- | --- | --- |
| `static` | 지역 변수면 프로그램 끝까지 살아 호출 사이에 값이 남는다. 전역이면 그 파일 안에서만 보인다. 클래스 멤버면 클래스에 하나다(아래 「static 멤버」) | 그대로 |
| `extern` | 다른 번역 단위에 **정의된** 전역 변수·함수를 쓰겠다는 선언. 메모리를 잡지 않는다 | 그대로. 헤더에 `extern int count;`, 한 `.cpp`에만 `int count = 0;` |
| `mutable` | `const` 객체·`const` 멤버 함수 안에서도 바꿀 수 있는 멤버 | 그대로. 캐시, 뮤텍스, 호출 횟수처럼 논리적 상태가 아닌 멤버에 쓴다 |
| `auto` | 원래는 "자동 저장 기간"(지역 변수 기본값)이라는 뜻 | **C++11부터 타입 추론 키워드**로 바뀌었다(`auto it = v.begin();`) |
| `register` | 레지스터에 두라는 힌트 | C++11에서 폐기 예정, **C++17에서 제거**. 레지스터 배치는 최적화기가 정한다 |

함수 안 `static` 변수와 파일 수준 `static`이 실행 파일의 어느 섹션에 놓이고 링커가 어떻게 다루는지는 [[java-language-basics#C·C++의 static|C·C++의 static]]에 있다. 파일 하나에만 보이게 하는 용도로는 `static` 대신 이름 없는 네임스페이스(`namespace { ... }`)를 쓰기도 한다.

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

```cpp
Student s1;                    // 스택에 객체. 블록을 벗어나면 소멸
Student* s2 = new Student;     // 힙에 객체, s2는 그 주소를 담은 스택 변수
(*s2).age = 1;                 // 역참조 후 멤버 접근
s2->age = 1;                   // 위와 같은 뜻
delete s2;                     // 힙 객체는 직접 해제(또는 스마트 포인터에 맡긴다)
```

클래스 정의 자체는 타입 정보일 뿐 메모리를 차지하지 않고, 객체를 만들 때 비정적 멤버 변수만큼 자리가 잡힌다. 멤버 함수 코드는 객체마다 복사되지 않고 모든 객체가 공유한다. 멤버가 없는 빈 클래스도 객체마다 주소가 달라야 하므로 `sizeof`가 최소 1이다.

### 접근 지정과 캡슐화

| 지정자 | 접근 가능한 곳 |
| --- | --- |
| `public` | 어디서나 |
| `protected` | 자기 클래스와 파생 클래스 ([[cpp-virtual-functions\|C++ 상속과 가상 함수]]) |
| `private` | 자기 클래스와 `friend`만 |

- `class`와 `struct`는 **기본 접근 수준만 다르다**(`class`는 `private`, `struct`는 `public`). 관례상 불변 조건이 없는 단순 데이터 묶음에 `struct`, 지켜야 할 불변 조건이 있는 타입에 `class`를 쓴다.
- 캡슐화의 목적은 **불변 조건(invariant)을 지키는 것**이다. 멤버를 `private`로 닫고 값을 바꾸는 길을 멤버 함수로 모으면 거기서 음수 잔액, 용량 초과 같은 잘못된 값을 걸러 낼 수 있다. 검증 없는 getter·setter를 모든 필드에 다는 것은 `public` 필드와 다를 바 없다.

### friend 함수와 friend 클래스

`friend` 선언은 **클래스가 특정 바깥 함수나 클래스에게 `private`·`protected` 접근을 허락**하는 것이다. 허락은 받는 쪽이 아니라 주는 쪽 클래스 안에 적는다.

```cpp
class Account {
    long balance_ = 0;
    friend long peek(const Account& a);   // 바깥 함수에 허락
    friend void Auditor::check();         // 다른 클래스의 멤버 함수 하나에 허락
    friend class Bank;                    // 클래스 전체에 허락
};

long peek(const Account& a) { return a.balance_; }   // 멤버가 아니라 Account::가 없다
```

| 특징 | 내용 |
| --- | --- |
| 멤버가 아니다 | `this`가 없다. 객체를 인자로 받아 `a.balance_`처럼 객체 이름으로 접근한다 |
| 접근 지정과 무관 | `public`·`private` 어느 구역에 적어도 같은 뜻이다 |
| 일방향 | `A`가 `B`를 friend로 선언해도 `B`가 `A`를 friend로 둔 것은 아니다 |
| 전이·상속되지 않는다 | friend의 friend는 friend가 아니고, `Bank`의 파생 클래스도 접근하지 못한다 |

캡슐화를 깨는 구멍이라 남용하지 않는다. 쓸 만한 자리는 왼쪽 피연산자가 내 클래스가 아닌 연산자(`operator<<`, `2 * v`, 아래 「연산자 오버로딩」)와, 함께 설계된 두 클래스(컨테이너와 그 반복자)처럼 한 단위로 보는 것이 자연스러운 경우다.

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
- 비정적 멤버 함수는 호출한 객체의 주소를 숨은 인자 **`this`**로 받는다. `tank.refuel(5)`는 개념상 `Tank::refuel(&tank, 5)`다. 직접 쓰는 자리는 셋이다. 매개변수가 멤버 이름을 가릴 때 `this->age = age;`로 구분하고, `return *this;`로 자기 자신을 돌려줘 `a.setX(1).setY(2)`처럼 호출을 잇고, 자기 자신을 다른 함수에 `registry.add(this)`로 넘긴다. `static` 멤버 함수와 `friend` 함수에는 `this`가 없다.
- **`const` 멤버 함수**는 `this`가 `const Tank*`가 되어 멤버를 바꾸지 못한다. `const` 객체나 `const&`로 받은 객체에서는 `const` 멤버 함수만 부를 수 있으므로, 상태를 바꾸지 않는 함수에는 빠짐없이 붙인다. 그래도 바꿔야 하는 캐시 같은 멤버는 `mutable`로 선언한다.

## 생성자

생성자는 객체가 만들어질 때 자동으로 불려 멤버를 초기화한다. 이름이 클래스와 같고 반환 타입이 없으며, 매개변수 목록을 달리해 여러 개 둘 수 있다(오버로딩).

| 종류 | 형태 | 불리는 때 |
| --- | --- | --- |
| 기본 생성자 | `Point()` | 인자 없이 만들 때 (`Point p;`, `Point arr[10];`) |
| 매개변수 생성자 | `Point(int x, int y)` | 값을 주며 만들 때 (`Point p(1, 2);`, `Point p{1, 2};`) |
| 복사 생성자 | `Point(const Point&)` | 같은 타입 객체로 **새 객체를 만들 때** (아래 「복사와 이동」) |
| 이동 생성자 (C++11) | `Point(Point&&) noexcept` | 곧 사라질 객체(R-value)로 새 객체를 만들 때 |
| 변환 생성자 | 인자 하나로 부를 수 있는 생성자 | 다른 타입 값에서 만들 때 (아래 「explicit」) |
| 위임 생성자 (C++11) | `: Point(0, 0)`처럼 같은 클래스의 다른 생성자를 부름 | 초기화 코드를 한 생성자로 모을 때 |

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

힙 객체를 맡는 `unique_ptr`·`shared_ptr`·`weak_ptr`의 차이와 넘기는 규칙은 [[cpp-smart-pointers|C++ 스마트 포인터]]에 있다.

### private 생성자와 소멸자

생성자나 소멸자를 `private`에 두면 **객체를 만들고 지우는 길을 클래스가 통제**한다.

| 무엇을 막나 | 효과 | 쓰임 |
| --- | --- | --- |
| `private` 생성자 | 바깥에서 `T t;`, `new T`가 안 된다. 클래스의 `static` 함수나 friend만 만든다 | 싱글턴([[singleton-pattern\|싱글턴 패턴]]), `T::create()` 같은 팩터리 함수로 생성 경로를 하나로 모으기, `static` 함수만 모은 유틸리티 클래스 |
| `private` 소멸자 | 스택·전역 객체를 만들 수 없다(블록 끝에서 소멸자를 부를 수 없으므로 컴파일 오류). `new`로만 만들 수 있고, `delete`도 바깥에서는 못 한다 | 힙에만 두고 `release()` 같은 멤버 함수가 `delete this`로 스스로 지우는 참조 카운트 객체 |

특정 연산을 아예 없애려면 C++11부터는 `private`에 숨기는 대신 `= delete`로 지운다. `T(const T&) = delete;`는 친구나 멤버 함수에서도 쓸 수 없고, 오류 메시지도 "삭제된 함수"로 분명하다.

## 복사와 이동

### 복사 생성자와 복사 대입 연산자

둘 다 객체의 값을 다른 객체로 옮기지만, **대상 객체가 이미 있느냐**로 갈린다. 복사 생성자는 초기화, 복사 대입은 대입이다.

```cpp
Student s1(10, 1001);
Student s2(s1);          // 복사 생성자: s2를 새로 만든다
Student s3 = s1;         // 복사 생성자. =가 있어도 "기본 생성 후 대입" 두 단계가 아니다
Student s4(20, 2001);
s4 = s1;                 // 복사 대입 연산자: 이미 있는 s4를 덮어쓴다. 생성자는 불리지 않는다
void enroll(Student s);  // 값으로 넘길 때도 복사 생성자가 불린다
```

| 항목 | 복사 생성자 | 복사 대입 연산자 |
| --- | --- | --- |
| 시그니처 | `T(const T& other)` | `T& operator=(const T& other)` |
| 불리는 때 | 선언과 동시에 초기화, 값으로 인자 전달·반환 | 이미 만든 객체에 `=` |
| 기존 자원 | 없다 | 덮어쓰기 전에 기존 자원을 정리해야 한다. 자기 대입(`a = a`)도 견뎌야 한다 |

복사 생성자의 인자는 **반드시 참조**다. 값으로 받으면 인자를 넘기는 데 복사 생성자가 또 필요해 끝없이 재귀하므로 컴파일러가 거부한다. `const`를 붙이는 것은 원본을 실수로 바꾸지 않고, `const` 객체와 임시 객체도 복사할 수 있게 하려는 것이다.

### 얕은 복사와 깊은 복사

복사 생성자와 복사 대입 연산자를 쓰지 않으면 컴파일러가 **멤버를 하나씩 복사하는** 버전을 만든다. 멤버가 원시 포인터면 주소만 복사되는 **얕은 복사(shallow copy)**가 된다.

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

**깊은 복사(deep copy)**는 포인터가 가리키는 내용까지 새 메모리에 복제해, 두 객체가 각자 자기 자원을 갖게 한다.

```cpp
class Name {
    char* s_;
public:
    explicit Name(const char* s) : s_(new char[std::strlen(s) + 1]) { std::strcpy(s_, s); }
    Name(const Name& o) : Name(o.s_) {}                 // 깊은 복사: 새 배열에 내용 복제
    Name& operator=(Name o) noexcept {                  // 복사 후 맞바꾸기(copy-and-swap)
        std::swap(s_, o.s_);                            // 자기 대입과 예외에도 안전하다
        return *this;
    }                                                   // o가 사라지며 옛 배열을 지운다
    ~Name() { delete[] s_; }
};
```

`strlen(s) + 1`의 `+1`은 문자열 끝의 `'\0'` 자리다. 대입 연산자를 값으로 받아 맞바꾸면 복사는 복사 생성자가 맡고, 옛 자원 정리는 임시 객체의 소멸자가 맡는다.

### 이동

곧 사라질 객체(함수가 돌려준 임시 객체, `std::move`로 표시한 객체)를 복사하는 것은 낭비다. **이동 생성자·이동 대입 연산자**는 내용을 복제하지 않고 자원의 소유권만 넘긴 뒤, 원본을 소멸해도 안전한 빈 상태로 둔다.

```cpp
Name(Name&& o) noexcept : s_(o.s_) { o.s_ = nullptr; }   // 포인터만 가져온다
```

`std::vector`는 재할당 때 원소의 이동 생성자가 `noexcept`여야 복사 대신 이동을 쓴다. 이동 연산에는 `noexcept`를 붙인다.

### 3·5·0의 규칙

| 규칙 | 내용 |
| --- | --- |
| 3의 규칙 | 소멸자, 복사 생성자, 복사 대입 연산자 중 하나를 직접 정의해야 하면 셋 다 정의한다 |
| 5의 규칙 (C++11) | 이동 생성자와 이동 대입 연산자를 더한다. 소멸자나 복사 연산을 직접 선언하면 이동 연산은 자동으로 생기지 않고 복사로 대신된다 |
| 0의 규칙 | 자원은 RAII 멤버(`std::vector`, `std::unique_ptr`)에 맡기고 다섯 개 모두 직접 쓰지 않는다 |

**기본은 0의 규칙이다.** 위 `Buffer`는 멤버를 `std::vector<char>` 하나로 바꾸면 소멸·복사·이동이 모두 올바르게 생성된다. 복사를 막으려면 `Buffer(const Buffer&) = delete;`로 지운다. 자원을 직접 쥐는 저수준 클래스만 5의 규칙대로 모두 구현한다.

## 함수 오버로딩

**같은 이름의 함수를 매개변수 목록(개수·타입·순서)만 달리해 여러 개 두는 것**이 함수 오버로딩이다. 어느 것을 부를지는 인자의 정적 타입을 보고 **컴파일러가 정한다**(정적 바인딩).

```cpp
int    add(int a, int b)        { return a + b; }
int    add(int a, int b, int c) { return a + b + c; }   // 개수가 다르다
double add(double a, double b)  { return a + b; }       // 타입이 다르다
// double add(int a, int b);    // 오류: 반환 타입만 다른 것은 오버로딩이 아니다
```

- **반환 타입만 달라서는 오버로딩할 수 없다.** 반환값을 쓰지 않는 호출 `add(1, 2);`에서 고를 근거가 없기 때문이다.
- 멤버 함수는 `const` 유무로도 오버로딩된다. `T& at(size_t)`와 `const T& at(size_t) const`가 한 쌍이다.
- 고르는 순서는 정확히 일치 → 승격(`char`·`short` → `int`, `float` → `double`) → 표준 변환(`int` → `double`) → 사용자 정의 변환이다. 같은 단계에 후보가 둘이면 모호하다는 오류가 난다. `void f(long); void f(double);`에 `f(1)`을 넘기면 둘 다 표준 변환이라 모호하다.
- 기본 인자와 섞으면 모호해지기 쉽다. `void g(int a, int b = 0);`과 `void g(int a);`가 함께 있으면 `g(1)`을 고를 수 없다.
- 링커는 이름이 같은 함수를 구분하지 못하므로, 컴파일러가 매개변수 타입을 심볼 이름에 섞어 넣는다(**이름 맹글링**, `add(int,int)` → `_Z3addii`). C에서 부를 함수에 `extern "C"`를 붙이는 이유가 이것이다.

### 다형성의 두 갈래

| 구분 | 정해지는 때 | C++ 수단 | 비용 |
| --- | --- | --- | --- |
| 컴파일 시점(정적) 다형성 | 컴파일할 때 인자 타입으로 | 함수 오버로딩, 연산자 오버로딩, [[cpp-templates\|템플릿]] | 호출 비용 없음, 인라인 가능 |
| 실행 시점(동적) 다형성 | 실행 중 실제 객체 타입으로 | 가상 함수 재정의(override) | vtable 간접 호출 ([[cpp-virtual-functions\|C++ 상속과 가상 함수]]) |

오버로딩은 **한 범위 안의 다른 시그니처**, 재정의는 **기반과 파생에 걸친 같은 시그니처**다. 파생 클래스에서 같은 이름을 쓰면 기반의 오버로드가 모두 가려지는 함정은 [[cpp-virtual-functions|C++ 상속과 가상 함수]]의 「가상 함수와 재정의」에, 다형성의 이론적 분류는 [[type-systems|타입 시스템]]에 있다.

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
- 헤더에는 선언과 헤더 가드를 두고, `using namespace`는 소스 파일 안에서만 쓴다. 의도한 fallthrough는 `[[fallthrough]]`로 표시한다. `auto`는 타입 추론으로 바뀌었고 `register`는 사라졌다.
- 참조자는 null이 없고 다시 묶을 수 없는 별명이다. 읽기 전용 인자는 `const T&`, "없음"이 가능한 자리만 포인터.
- `class`와 `struct`는 기본 접근 수준만 다르다. 캡슐화는 불변 조건을 지키려고 하고, 상태를 바꾸지 않는 멤버 함수에는 `const`를 붙인다. `friend`는 일방향·비전이 허락이라 연산자처럼 꼭 필요한 곳에만 쓴다.
- 생성자를 하나라도 쓰면 기본 생성자는 사라진다. 멤버는 초기화 리스트로, 선언 순서대로 초기화된다.
- 소멸자는 생성의 역순으로 불린다. 자원은 RAII로 소멸자에 묶는다. `private` 생성자는 생성 경로를, `private` 소멸자는 힙 전용 객체를 강제한다.
- 새 객체를 만들면 복사 생성자, 있는 객체에 `=`면 복사 대입이다. 기본 복사는 얕은 복사라 원시 포인터 멤버는 깊은 복사나 이동을 직접 구현해야 하지만, 기본은 0의 규칙이다.
- 함수 오버로딩은 매개변수 목록으로 구분하고 반환 타입만으로는 안 된다. 오버로딩·템플릿은 컴파일 시점, 가상 함수는 실행 시점 다형성이다.
- 연산자 오버로딩은 `operator기호` 함수다. `+=`는 멤버로 `*this`를 참조 반환, `+`는 `+=`로, 대칭 연산과 `<<`는 바깥 함수로 만든다.
- 인자 하나짜리 생성자와 변환 연산자에는 기본으로 `explicit`을 붙인다.

관련 노트: [[pointers-and-memory|포인터와 메모리]], [[c-basics|C 기초]], [[cpp-virtual-functions|C++ 상속과 가상 함수]], [[cpp-smart-pointers|C++ 스마트 포인터]], [[singleton-pattern|싱글턴 패턴]], [[cpp-templates|C++ 템플릿]], [[cpp-exceptions|C++ 예외 처리의 내부 동작]], [[c-struct-and-function-pointer|C 사용자 정의 타입과 함수 포인터]], [[type-systems|타입 시스템]]
