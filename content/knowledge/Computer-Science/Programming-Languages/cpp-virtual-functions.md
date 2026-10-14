---
title: "가상 함수와 vtable"
concept: "Virtual Function"
summary: "C++ 가상 함수가 vtable과 vptr로 실행 중에 호출 대상을 고르는 원리를 정리한다. 생성자와 소멸자는 실행 단계마다 vptr을 그 클래스의 vtable로 바꿔 끼우므로, 여기서 가상 함수를 부르면 자식 구현이 아니라 자기 클래스 구현이 불리고, 순수 가상이면 pure virtual call로 프로그램이 죽는다."
tags: ["cpp", "oop", "memory", "computer-science"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/7e1085b337114dd2aeb657ac2b4fec16", "https://isocpp.org/wiki/faq/strange-inheritance#calling-virtuals-from-ctors"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「소멸자에서 가상함수를 호출하면 생기는 에러」를 바탕으로 재구성한 노트입니다.

## 가상 함수란

가상 함수(virtual function)는 **포인터나 참조의 타입이 아니라 실제 객체의 타입**에 따라 호출할 함수를 실행 중에 고르는 멤버 함수다. 부모 타입으로 자식 객체를 다루면서 자식의 동작을 끌어내는, C++ 동적 다형성의 수단이다.

```cpp
struct Shape  { virtual double area() const = 0; virtual ~Shape() = default; };
struct Circle : Shape { double r; double area() const override { return 3.14 * r * r; } };

Shape* s = new Circle{...};
s->area();   // Shape::area가 아니라 Circle::area가 불린다
```

- `= 0`은 **순수 가상 함수**다. 구현이 없고, 하나라도 있으면 그 클래스는 추상 클래스가 되어 직접 만들 수 없다.
- `override`는 부모의 가상 함수를 재정의한다는 선언이다. 시그니처가 틀리면 컴파일 오류로 잡아 준다.

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

**생성과 소멸 도중의 객체는 아직(또는 이미) 자식 타입이 아니다.** 그래서 컴파일러는 각 단계에서 vptr을 그 단계 클래스의 vtable로 바꿔 끼운다.

```text
생성:  Base 생성자 진입 → vptr = Base vtable → Derived 생성자 진입 → vptr = Derived vtable
소멸:  Derived 소멸자 실행 → Base 소멸자 진입 → vptr = Base vtable → Base 멤버 정리
```

부모 소멸자가 돌 때 자식의 멤버는 이미 파괴되었다. 이때 자식 구현을 부르면 죽은 멤버에 접근하게 되므로, 언어가 일부러 부모 구현을 부르게 만든 것이다.

### pure virtual call

부모 쪽에서 그 함수가 **순수 가상**이면 부모 vtable의 해당 칸에는 구현 대신 런타임의 오류 함수가 들어 있다.

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

부모 포인터로 자식 객체를 `delete`할 일이 있다면 **부모 소멸자는 반드시 `virtual`**이어야 한다. 아니면 부모 소멸자만 불려 자식 멤버가 정리되지 않는다(정의되지 않은 동작).

```cpp
Shape* s = new Circle{...};
delete s;   // ~Shape()가 virtual이어야 ~Circle()부터 불린다
```

상속을 전제로 한 클래스는 `virtual ~Base() = default;`를 두고, 상속을 막을 클래스는 `final`을 붙인다.

## 정리

- 가상 함수는 객체 안의 vptr이 가리키는 vtable에서 함수 주소를 읽어 호출한다.
- 그 대가는 간접 호출, 인라인 불가, 객체당 포인터 하나다.
- 생성자·소멸자 안에서는 vptr이 그 단계 클래스의 vtable이므로 가상 함수가 자식 구현으로 가지 않는다.
- 순수 가상 함수를 생성·소멸 중에 간접 호출하면 pure virtual call로 프로그램이 종료된다.
- 다형적으로 지울 클래스의 소멸자는 `virtual`로 선언한다.

관련 노트: [[cpp-templates|C++ 템플릿]], [[abstract-class-vs-interface|추상 클래스와 인터페이스]], [[cpp-exceptions|C++ 예외 처리의 내부 동작]], [[oop-messaging|객체 지향의 본질: 메시징]]
