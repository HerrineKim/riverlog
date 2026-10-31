---
title: "C++ 상속과 가상 함수: 접근 지정, 생성·소멸 순서, vtable, 슬라이싱, 다중 상속"
concept: "C++ Inheritance"
summary: "C++ 상속에서 protected와 상속 방식(public·protected·private)이 접근 수준을 어떻게 바꾸는지, 기반에서 파생으로 생성되고 역순으로 소멸되는 순서, 가상 함수가 vtable과 vptr로 호출 대상을 고르는 원리와 비가상 함수의 이름 가림, 생성자·소멸자 안의 가상 호출과 pure virtual call, 가상 소멸자, 객체 슬라이싱, 다이아몬드 문제와 가상 상속을 정리한다."
tags: ["cpp", "oop", "memory", "design-pattern", "computer-science"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/7e1085b337114dd2aeb657ac2b4fec16", "https://isocpp.org/wiki/faq/strange-inheritance#calling-virtuals-from-ctors", "고려사이버대학교 객체지향 프로그래밍(C++) 강의(장윤경 교수, 2024-2학기)"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「소멸자에서 가상함수를 호출하면 생기는 에러」를 바탕으로 재구성한 노트다.
> 상속 방식과 접근 지정, 생성·소멸 순서, 이름 가림과 정적 바인딩, 슬라이싱, 다중 상속은 고려사이버대학교 「객체지향 프로그래밍(C++)」(2024-2학기) 강의 내용으로 보강했다.

## 상속이란

상속은 기존 클래스(기반 클래스, base)의 멤버를 물려받아 새 클래스(파생 클래스, derived)를 만드는 것이다. 파생 클래스는 멤버를 더하거나 가상 함수를 재정의해 동작을 바꾼다. 파생 객체는 기반 객체 자리에 그대로 쓰일 수 있어야 하므로(is-a), 코드 재사용만이 목적이라면 상속보다 멤버로 들고 쓰는 컴포지션이 낫다.

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
    Truck() : Vehicle(6) {}  // 기반 생성자는 초기화 리스트에서 고른다
};
```

## 접근 지정과 상속 방식

`private` 멤버도 파생 객체 안에 들어 있지만 파생 클래스가 직접 접근할 수는 없다. 파생 클래스에만 열고 바깥에는 닫으려면 `protected`를 쓴다. 클래스 자체의 접근 지정은 [[cpp-basics|C++ 기초]]의 클래스 절에 있다.

`class Truck : public Vehicle`의 `public`은 **상속 방식**이다. 물려받은 멤버가 파생 클래스에서 갖는 접근 수준을 정하며, 결과는 원래 수준과 상속 방식 중 더 좁은 쪽이다.

| 기반 멤버 \ 상속 방식 | `public` 상속 | `protected` 상속 | `private` 상속 |
| --- | --- | --- | --- |
| `public` | public | protected | private |
| `protected` | protected | protected | private |
| `private` | 접근 불가 | 접근 불가 | 접근 불가 |

- 상속 방식을 빼면 `class`는 `private` 상속, `struct`는 `public` 상속이다. `class D : B`는 뜻하지 않게 private 상속이 되므로 항상 적는다.
- **is-a 관계는 `public` 상속뿐이다.** `private` 상속은 "구현에 쓴다"는 뜻이라 `Base*`로 받을 수 없고, 대부분 컴포지션으로 바꾸는 편이 읽기 쉽다.
- 생성자, 소멸자, 대입 연산자, `friend` 관계는 물려받지 않는다. 기반 생성자를 그대로 쓰려면 `using Vehicle::Vehicle;`로 끌어온다(C++11).

## 생성과 소멸 순서

```text
생성:  기반 클래스 → 멤버(선언 순서) → 파생 클래스 생성자 본문
소멸:  파생 클래스 소멸자 본문 → 멤버(선언 역순) → 기반 클래스
```

파생 생성자가 기반 생성자를 고르지 않으면 기반의 **기본 생성자**가 불린다. 기반에 기본 생성자가 없으면 컴파일 오류이므로 초기화 리스트에서 `Vehicle(6)`처럼 명시한다. 이 순서 때문에 생성·소멸 도중에는 가상 함수가 파생 쪽으로 가지 않는다(아래 「생성자·소멸자에서 가상 함수를 부르면」).

## 가상 함수와 재정의

가상 함수(virtual function)는 **포인터나 참조의 타입이 아니라 실제 객체의 타입**에 따라 호출할 함수를 실행 중에 고르는 멤버 함수다. 기반 타입으로 파생 객체를 다루면서 파생의 동작을 끌어내는, C++ 동적 다형성의 수단이다.

```cpp
struct Shape  { virtual double area() const = 0; virtual ~Shape() = default; };
struct Circle : Shape { double r; double area() const override { return 3.14 * r * r; } };

Shape* s = new Circle{...};
s->area();   // Shape::area가 아니라 Circle::area가 불린다
```

기반과 같은 이름·시그니처의 함수를 파생에 만들면 기반 함수가 가상인지에 따라 결과가 갈린다.

| 기반 함수 | 결과 | 호출 대상이 정해지는 때 |
| --- | --- | --- |
| `virtual` | 재정의(override). 기반 포인터·참조로 불러도 파생 구현 | 실행 시점, 실제 객체 타입 |
| 비가상 | 가림(hide). 포인터·참조의 선언 타입을 따른다(정적 바인딩) | 컴파일 시점, 선언된 타입 |

비가상 함수를 다시 쓰면 기반 포인터 배열에 여러 파생 객체를 담아 같은 함수를 불러도 모두 기반 구현이 불린다. 파생 객체 자신(`Circle c; c.area()`)으로 부를 때만 파생 구현이 보여서, 차이는 기반 타입으로 다룰 때 드러난다. Java는 모든 인스턴스 메서드가 기본으로 가상이라 이 구분이 없다.

- `override`를 붙이면 기반 함수가 비가상이거나 시그니처가 틀렸을 때 컴파일 오류로 잡힌다. 재정의 의도는 늘 `override`로 밝힌다.
- **이름 가림은 오버로드 전체에 걸린다.** 파생에 `log(int)` 하나만 있어도 기반의 `log(double)`, `log(const std::string&)`이 모두 가려진다. 기반 오버로드를 살리려면 파생 클래스 안에 `using Base::log;`를 둔다.

## vtable과 vptr


대부분의 컴파일러는 가상 함수를 두 장치로 구현한다.

| 장치 | 위치 | 내용 |
| --- | --- | --- |
| vtable | 클래스마다 하나, 읽기 전용 데이터 영역 | 그 클래스가 쓸 가상 함수들의 주소 배열 |
| vptr | 객체마다 하나, 보통 객체 맨 앞 | 자기 클래스의 vtable을 가리키는 포인터 |

```text
Circle 객체                 Circle의 vtable
┌──────────┐               ┌───────────────────┐
│ vptr ────┼─────────────▶ │ [0] Circle::area  │
│ r        │               │ [1] Circle::~Circle│
└──────────┘               └───────────────────┘
```

`s->area()`는 컴파일 후 대략 다음 세 단계가 된다.

```text
mov  rax, [s]        ; 객체 맨 앞의 vptr을 읽는다
mov  rax, [rax + 0]  ; vtable의 0번 칸(area 주소)을 읽는다
call rax             ; this(s)를 첫 인자로 넘겨 호출한다
```

일반 함수 호출보다 메모리 읽기가 두 번 많고, 컴파일러가 대상을 모르니 인라인할 수 없다. 객체마다 포인터 하나만큼 크기도 늘어난다. 정적 다형성인 [[cpp-templates|템플릿]]과 대비되는 비용이다.

## 생성자·소멸자에서 가상 함수를 부르면

**생성과 소멸 도중의 객체는 아직(또는 이미) 파생 타입이 아니다.** 그래서 컴파일러는 각 단계에서 vptr을 그 단계 클래스의 vtable로 바꿔 끼운다.

```text
생성:  Base 생성자 진입 → vptr = Base vtable → Derived 생성자 진입 → vptr = Derived vtable
소멸:  Derived 소멸자 실행 → Base 소멸자 진입 → vptr = Base vtable → Base 멤버 정리
```

기반 소멸자가 돌 때 파생의 멤버는 이미 파괴되었다. 이때 파생 구현을 부르면 죽은 멤버에 접근하게 되므로, 언어가 일부러 기반 구현을 부르게 만든 것이다.

### pure virtual call

기반 쪽에서 그 함수가 **순수 가상**이면 기반 vtable의 해당 칸에는 구현 대신 런타임의 오류 함수가 들어 있다.

```cpp
struct A {
    virtual void work() = 0;
    void helper() { work(); }          // 가상 호출
    virtual ~A() { helper(); }         // 소멸자에서 간접적으로 호출
};
struct B : A { void work() override { /* ... */ } };

int main() { B b; }   // main 끝에서 b 소멸 → pure virtual function call
```

| 단계 | 일어나는 일 |
| --- | --- |
| `~B()` 종료 | B 부분 정리 끝 |
| `~A()` 진입 | vptr을 A의 vtable로 교체 |
| `helper()` → `work()` | A vtable의 `work` 칸을 읽음 |
| 그 칸의 내용 | MSVC는 `_purecall`, GCC·Clang은 `__cxa_pure_virtual` |
| 결과 | 오류 메시지 출력 후 `abort()` |

소멸자에서 `work()`를 직접 부르면 컴파일러가 경고하거나 링크 오류를 내지만, 위처럼 **다른 멤버 함수를 거치면** 컴파일 타임에 잡히지 않고 실행 중에 터진다. MSVC는 `_set_purecall_handler`로 이 상황에 호출할 핸들러를 등록할 수 있어 크래시 덤프를 남길 때 쓴다.

## 가상 소멸자

기반 포인터로 파생 객체를 `delete`할 일이 있다면 **기반 소멸자는 반드시 `virtual`**이어야 한다. 아니면 기반 소멸자만 불려 파생 멤버가 정리되지 않는다(정의되지 않은 동작).

```cpp
Shape* s = new Circle{...};
delete s;   // ~Shape()가 virtual이어야 ~Circle()부터 불린다
```

상속을 전제로 한 클래스는 `virtual ~Base() = default;`를 두고, 상속을 막을 클래스는 `final`을 붙인다.

## 추상 클래스와 final

순수 가상 함수(`virtual double area() const = 0;`)가 하나라도 있으면 추상 클래스가 되어 직접 객체를 만들 수 없고, 파생 클래스가 모두 구현해야 객체를 만들 수 있다. 공통 인터페이스를 강제하는 수단이며, Java의 추상 클래스·인터페이스와 비교는 [[abstract-class-vs-interface|추상 클래스와 인터페이스]]에 있다. 더 상속하지 못하게 하려면 클래스나 가상 함수에 `final`을 붙인다.

## 객체 슬라이싱

파생 객체를 기반 타입 **값**으로 복사하면 기반 부분만 잘려 복사되고, 파생이 더한 멤버와 재정의한 동작이 사라진다. 이를 객체 슬라이싱(object slicing)이라 한다.

```cpp
void draw(Shape s);        // 값으로 받음 → Circle을 넘겨도 Shape만 남는다
void draw(const Shape& s); // 참조로 받음 → 가상 함수가 Circle 구현으로 불린다
```

다형적으로 쓰는 객체는 참조나 (스마트) 포인터로 넘기고, 컨테이너에도 `std::vector<std::unique_ptr<Shape>>`처럼 담는다. 기반 클래스의 복사를 `= delete`로 막아 두면 실수로 슬라이싱하는 코드가 컴파일되지 않는다.

## 다중 상속

C++은 기반 클래스를 여럿 둘 수 있다(`class C : public A, public B`). 두 기반에 같은 이름의 멤버가 있으면 `c.f()`는 모호해서 컴파일 오류다. `c.A::f()`처럼 범위 결정 연산자로 고르거나 파생에서 재정의해 한쪽으로 넘긴다.

### 다이아몬드 문제와 가상 상속

```text
        Device
       /      \
  Scanner    Printer
       \      /
     MultiFunction
```

`Scanner`와 `Printer`가 둘 다 `Device`를 상속하면 `MultiFunction` 안에 `Device`가 **두 벌** 생겨 멤버 접근이 모호하고 상태도 갈라진다.

```cpp
class Scanner : public virtual Device { /* ... */ };
class Printer : public virtual Device { /* ... */ };
class MultiFunction : public Scanner, public Printer {
public:
    MultiFunction() : Device("mfp"), Scanner(), Printer() {}  // 가상 기반은 최종 파생이 직접 초기화
};
```

**가상 상속**으로 받으면 공통 기반이 한 벌만 생긴다. 대신 가상 기반의 생성자는 **가장 마지막 파생 클래스가 직접 부르고**, 객체 배치가 복잡해져 기반 멤버 접근에 간접 단계가 더해진다. Java·C#·Kotlin은 이 복잡함을 피하려고 클래스 다중 상속을 막고 인터페이스만 여럿 구현하게 했다. C++에서도 상태가 있는 클래스는 하나만 상속하고 나머지는 순수 가상 함수만 있는 인터페이스 클래스로 두는 방식이 안전하다.

## 정리

- `protected`는 파생 클래스에만 연다. is-a 관계는 `public` 상속뿐이고, 상속 방식은 항상 적는다.
- 생성은 기반 → 멤버 → 파생, 소멸은 그 역순이다.
- 가상 함수는 객체의 vptr이 가리키는 vtable에서 주소를 읽어 호출한다. 대가는 간접 호출, 인라인 불가, 객체당 포인터 하나다.
- 비가상 함수를 같은 이름으로 쓰면 재정의가 아니라 가림이고, 기반 오버로드도 모두 가려진다. `override`와 `using Base::f`로 의도를 밝힌다.
- 생성자·소멸자 안에서는 가상 함수가 파생 구현으로 가지 않고, 순수 가상이면 pure virtual call로 종료된다.
- 다형적으로 지울 기반 클래스의 소멸자는 `virtual`, 다형적 객체는 참조·포인터로 다뤄 슬라이싱을 피한다.
- 다이아몬드는 가상 상속으로 풀지만, 상태 있는 기반을 하나만 두는 설계가 먼저다.

관련 노트: [[cpp-basics|C++ 기초]], [[cpp-templates|C++ 템플릿]], [[abstract-class-vs-interface|추상 클래스와 인터페이스]], [[cpp-exceptions|C++ 예외 처리의 내부 동작]], [[oop-messaging|객체 지향의 본질: 메시징]], [[kotlin-delegation|위임 패턴과 Kotlin by]]
