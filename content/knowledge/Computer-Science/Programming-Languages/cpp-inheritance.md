---
title: "C++ 상속: 접근 지정, 생성·소멸 순서, 이름 가림, 슬라이싱, 다중 상속"
concept: "C++ Inheritance"
summary: "C++ 상속에서 protected와 상속 접근 지정(public·protected·private 상속)이 멤버 접근을 어떻게 바꾸는지, 기반에서 파생으로 생성되고 역순으로 소멸되는 순서, 같은 이름의 함수가 기반의 오버로드를 모두 가리는 문제, 값으로 넘길 때 생기는 객체 슬라이싱, 다중 상속의 모호성과 다이아몬드 문제를 푸는 가상 상속을 정리한다."
tags: ["cpp", "oop", "design-pattern", "computer-science"]
source: other
date: "2026-10-31"
sources: ["고려사이버대학교 객체지향 프로그래밍(C++) 강의(장윤경 교수, 2024-2학기)"]
---

> 고려사이버대학교 「객체지향 프로그래밍(C++)」(2024-2학기) 강의 내용을 바탕으로 정리했다.

## 상속이란

상속은 기존 클래스(기반 클래스, base)의 멤버를 물려받아 새 클래스(파생 클래스, derived)를 만드는 것이다. 파생 클래스는 기반의 멤버를 그대로 쓰고, 멤버를 더하거나, 가상 함수를 재정의해 동작을 바꾼다. 파생 객체는 기반 객체로도 쓸 수 있어야 하므로(is-a), 단지 코드를 재사용하려는 목적이면 상속보다 멤버로 들고 쓰는 컴포지션이 낫다.

```cpp
class Vehicle {
public:
    explicit Vehicle(int wheels) : wheels_(wheels) {}
    virtual ~Vehicle() = default;
protected:
    int wheels_;            // 파생 클래스는 접근 가능, 바깥은 불가
private:
    int serial_ = 0;        // 파생 클래스도 직접 접근 불가
};

class Truck : public Vehicle {
public:
    Truck() : Vehicle(6) {}  // 기반 생성자는 초기화 리스트에서 부른다
};
```

## 접근 지정과 상속 방식

`private` 멤버는 파생 클래스에도 물려지지만(메모리에 있다) 직접 접근할 수는 없다. 파생 클래스에는 열고 바깥에는 닫고 싶을 때 `protected`를 쓴다.

`class Truck : public Vehicle`의 `public`은 **상속 접근 지정**이다. 물려받은 멤버가 파생 클래스에서 어떤 접근 수준이 되는지 정한다. 결과는 둘 중 더 좁은 쪽이다.

| 기반 멤버 \ 상속 방식 | `public` 상속 | `protected` 상속 | `private` 상속 |
| --- | --- | --- | --- |
| `public` | public | protected | private |
| `protected` | protected | protected | private |
| `private` | 접근 불가 | 접근 불가 | 접근 불가 |

- 상속 방식을 생략하면 `class`는 `private` 상속, `struct`는 `public` 상속이 된다. `class D : B`라고 쓰면 의도치 않게 private 상속이 되니 항상 명시한다.
- **is-a 관계는 `public` 상속뿐이다.** `private` 상속은 "구현에 사용한다"는 뜻이라 `Base*`로 받을 수 없다. 대부분 컴포지션으로 바꾸는 편이 읽기 쉽다.

생성자, 소멸자, 대입 연산자, `friend` 관계는 물려받지 않는다. 기반의 생성자를 그대로 쓰려면 `using Vehicle::Vehicle;`로 끌어온다(C++11).

## 생성과 소멸 순서

```text
생성:  기반 클래스 → 멤버(선언 순서) → 파생 클래스 생성자 본문
소멸:  파생 클래스 소멸자 본문 → 멤버(선언 역순) → 기반 클래스
```

- 파생 클래스 생성자가 기반 생성자를 명시하지 않으면 기반의 **기본 생성자**가 불린다. 기반에 기본 생성자가 없으면 컴파일 오류이므로 초기화 리스트에서 `Vehicle(6)`처럼 골라 부른다.
- 기반 포인터로 파생 객체를 `delete`할 때 기반 소멸자가 `virtual`이 아니면 파생 소멸자가 불리지 않는다. 다형적으로 쓸 기반 클래스의 소멸자는 `virtual`로 둔다.
- 생성자·소멸자 안에서 가상 함수를 부르면 파생 쪽이 아니라 그 단계 클래스의 구현이 불린다. 이유는 [[cpp-virtual-functions|가상 함수와 vtable]]에 있다.

## 재정의와 이름 가림

파생 클래스에 기반과 같은 이름의 함수를 만들면 두 가지 경우가 있다.

| 기반 함수 | 결과 | 호출 대상 결정 |
| --- | --- | --- |
| `virtual` | 재정의(override). 기반 포인터·참조로 불러도 파생 구현이 불린다 | 실행 시점, 실제 객체 타입 |
| 비가상 | 가림(hide). 포인터·참조의 정적 타입에 따라 달라진다 | 컴파일 시점, 선언된 타입 |

비가상 함수를 같은 이름으로 다시 쓰면 `Base* p = &derived; p->f();`는 `Base::f`를 부른다. 다형성을 기대했다면 버그다. 재정의 의도는 `override`로 밝혀 두면 기반이 비가상이거나 시그니처가 틀렸을 때 컴파일러가 잡는다.

이름 가림은 오버로드 전체에 적용된다. 파생 클래스에 `f(int)` 하나만 있어도 기반의 `f(double)`, `f(std::string)`이 모두 가려진다.

```cpp
struct Base    { void log(int); void log(const std::string&); };
struct Derived : Base {
    using Base::log;   // 이 줄이 없으면 아래 d.log("hi")가 컴파일 오류
    void log(int);
};
```

## 객체 슬라이싱

파생 객체를 기반 타입 **값**으로 복사하면 기반 부분만 잘려 복사되고, 파생에서 더한 멤버와 재정의한 동작이 사라진다. 이를 객체 슬라이싱(object slicing)이라 한다.

```cpp
void draw(Shape s);        // 값으로 받음 → Circle을 넘겨도 Shape만 남는다
void draw(const Shape& s); // 참조로 받음 → 가상 함수가 Circle 구현으로 불린다
```

다형적으로 쓰는 객체는 참조나 포인터(스마트 포인터)로 넘기고, 컨테이너에도 `std::vector<std::unique_ptr<Shape>>`처럼 담는다. 기반 클래스의 복사를 `= delete`로 막아 두면 실수로 슬라이싱되는 것을 컴파일 단계에서 잡는다.

## 추상 클래스

순수 가상 함수(`virtual double area() const = 0;`)가 하나라도 있으면 추상 클래스가 되어 직접 객체를 만들 수 없다. 파생 클래스가 모두 구현해야 객체를 만들 수 있다. 공통 인터페이스를 강제하는 수단이며, Java의 추상 클래스·인터페이스와 비교는 [[abstract-class-vs-interface|추상 클래스와 인터페이스]]에 있다. 더 이상 상속을 허용하지 않으려면 클래스나 가상 함수에 `final`을 붙인다.

## 다중 상속

C++은 기반 클래스를 여럿 둘 수 있다(`class C : public A, public B`).

### 이름 모호성

두 기반에 같은 이름의 멤버가 있으면 `c.f()`는 어느 쪽인지 정할 수 없어 컴파일 오류가 난다. `c.A::f()`처럼 범위 결정 연산자로 고르거나, 파생 클래스에서 `f`를 재정의해 한쪽으로 넘긴다.

### 다이아몬드 문제

```text
        Device
       /      \
  Scanner    Printer
       \      /
     MultiFunction
```

`Scanner`와 `Printer`가 둘 다 `Device`를 상속하면 `MultiFunction` 안에 `Device`가 **두 벌** 생긴다. `Device`의 멤버를 부르면 어느 쪽인지 모호하고, 상태도 둘로 갈라진다.

```cpp
class Scanner : public virtual Device { /* ... */ };
class Printer : public virtual Device { /* ... */ };
class MultiFunction : public Scanner, public Printer {
public:
    MultiFunction() : Device("mfp"), Scanner(), Printer() {}  // 가상 기반은 최종 파생이 직접 초기화
};
```

**가상 상속**(`virtual`)으로 받으면 공통 기반이 한 벌만 생긴다. 대신 가상 기반의 생성자는 중간 클래스가 아니라 **가장 마지막 파생 클래스가 직접 부르고**, 객체 배치가 복잡해져 접근에 간접 단계가 더해진다.

Java·C#·Kotlin은 이 복잡함을 피하려고 클래스 다중 상속을 막고 상태 없는 인터페이스만 여럿 구현하게 했다. C++에서도 상태가 있는 클래스는 하나만 상속하고, 나머지는 순수 가상 함수만 있는 인터페이스 클래스로 두는 방식이 안전하다.

## 정리

- `protected`는 파생 클래스에만 연다. is-a 관계는 `public` 상속만이고, 상속 방식은 항상 명시한다
- 생성은 기반 → 멤버 → 파생, 소멸은 그 역순. 다형적 기반의 소멸자는 `virtual`
- 같은 이름은 기반의 오버로드를 모두 가린다. `override`와 `using Base::f`로 의도를 밝힌다
- 다형적 객체는 참조·포인터로 다뤄 슬라이싱을 피한다
- 다이아몬드는 가상 상속으로 풀지만, 상태 있는 기반은 하나만 두는 설계가 먼저다

관련 노트: [[cpp-classes-and-constructors|C++ 클래스와 생성자·소멸자]], [[cpp-virtual-functions|가상 함수와 vtable]], [[abstract-class-vs-interface|추상 클래스와 인터페이스]], [[kotlin-delegation|위임 패턴과 Kotlin by]], [[oop-messaging|객체 지향의 본질: 메시징]]
