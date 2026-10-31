---
title: "C++ 스마트 포인터: unique_ptr, shared_ptr, weak_ptr"
concept: "Smart Pointer"
summary: "힙 객체의 소유권을 RAII 객체로 표현하는 C++ 스마트 포인터를 정리한다. 단독 소유인 unique_ptr(이동만 가능, 원시 포인터와 같은 크기), 참조 카운트로 공유하는 shared_ptr(제어 블록, make_shared, 원자적 카운트), 순환 참조를 끊는 비소유 weak_ptr(lock), C++17에서 제거된 auto_ptr의 문제, 함수 인자로 넘기는 규칙을 다룬다. 기본은 unique_ptr이고 소유가 정말 여럿일 때만 shared_ptr을 쓴다."
tags: ["cpp", "memory", "pointer", "computer-science"]
source: other
date: "2026-10-31"
sources: ["https://github.com/avgspacelover/Subjective-studies_OS-CN-DBMS", "https://en.cppreference.com/w/cpp/memory", "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#S-resource"]
---

> GitHub 자료 모음 「[Subjective-studies_OS-CN-DBMS](https://github.com/avgspacelover/Subjective-studies_OS-CN-DBMS)」의 OOP 면접 정리에서 출발해, cppreference와 C++ Core Guidelines의 자원 관리 규칙을 기준으로 재구성한 노트다.

## 스마트 포인터란

스마트 포인터는 **원시 포인터를 감싸고, 소멸자에서 가리키던 객체를 해제하는 클래스 템플릿**이다. `new`로 만든 객체를 스마트 포인터에 맡기면 스마트 포인터 자신이 스택에서 사라질 때(블록 끝, 중간 `return`, 예외) `delete`가 자동으로 불린다. [[cpp-basics#소멸자와 RAII|RAII]]를 힙 메모리에 적용한 것이고, 모두 `<memory>`에 있다.

원시 포인터는 "누가 이 객체를 지울 책임이 있나"를 타입으로 말하지 못한다. 스마트 포인터는 **소유권을 타입으로 드러낸다.**

| 타입 | 소유 | 복사 | 해제 시점 | 도입 |
| --- | --- | --- | --- | --- |
| `std::unique_ptr<T>` | 단독 소유 | 불가, 이동만 | 소유자가 사라질 때 | C++11 |
| `std::shared_ptr<T>` | 공동 소유 | 가능, 참조 카운트 +1 | 마지막 소유자가 사라질 때 | C++11 |
| `std::weak_ptr<T>` | 소유하지 않음 | 가능 | 해제에 관여하지 않는다 | C++11 |
| `std::auto_ptr<T>` | 단독 소유 | "복사"가 소유권을 몰래 옮김 | - | C++98, C++11에서 폐기 예정, **C++17에서 제거** |

## unique_ptr: 단독 소유

```cpp
#include <memory>

{
    auto p = std::make_unique<Widget>(42);   // C++14. new를 직접 쓰지 않는다
    p->run();

    // auto q = p;                           // 오류: 복사 생성자가 삭제됐다
    auto q = std::move(p);                   // 소유권 이동. 이제 p는 nullptr
    if (!p) { /* 비어 있다 */ }
}   // q가 사라질 때 Widget 소멸
```

- **복사는 막고 이동만 허용한다.** 소유자가 늘 하나라는 불변 조건을 컴파일러가 지킨다. 그래서 `std::vector<std::unique_ptr<Shape>>`처럼 다형적 객체를 컨테이너에 담는 기본 수단이 된다([[cpp-virtual-functions#객체 슬라이싱|객체 슬라이싱]]).
- 기본 삭제자(`delete`)를 쓰면 **크기가 원시 포인터와 같고** 역참조 비용도 같다. 공짜에 가까워서 `new`/`delete`를 직접 쓸 이유가 거의 없다.
- 배열은 `std::unique_ptr<int[]>`로 받아 `delete[]`가 불린다. 다만 보통은 `std::vector`가 낫다.
- 삭제자를 바꿔 메모리가 아닌 자원도 맡긴다.

```cpp
std::unique_ptr<FILE, decltype(&std::fclose)> f(std::fopen("a.txt", "r"), &std::fclose);
```

- `get()`은 소유권을 유지한 채 원시 포인터를 빌려주고, `release()`는 소유권을 포기하고 포인터를 넘기며, `reset(new T)`는 기존 객체를 지우고 새 객체를 맡는다.

## shared_ptr: 참조 카운트로 공유

```cpp
auto a = std::make_shared<Config>();   // 카운트 1
{
    std::shared_ptr<Config> b = a;     // 카운트 2
}                                      // b 소멸 → 카운트 1
a.reset();                             // 카운트 0 → Config 소멸
```

`shared_ptr`은 객체 포인터와 **제어 블록(control block)** 포인터, 두 개를 들고 있다. 제어 블록에는 강한 참조 수(소유자 수), 약한 참조 수(`weak_ptr` 수), 삭제자가 들어 있다. 강한 참조 수가 0이 되면 객체를, 약한 참조 수까지 0이 되면 제어 블록을 해제한다.

| 만드는 법 | 할당 | 특징 |
| --- | --- | --- |
| `std::make_shared<T>(args...)` | 객체와 제어 블록을 **한 번에** | 할당이 한 번이고 캐시에 유리하다. 기본 선택 |
| `std::shared_ptr<T>(new T(args...))` | 객체, 제어 블록 따로 두 번 | 커스텀 삭제자가 필요할 때 |

주의할 점:

- **참조 카운트 증감은 원자적**이라 여러 스레드가 각자 복사본을 들고 있어도 안전하다. 가리키는 객체에 대한 접근까지 동기화되는 것은 아니다. 같은 `shared_ptr` 변수 하나를 여러 스레드가 읽고 쓰려면 C++20의 `std::atomic<std::shared_ptr<T>>`를 쓴다.
- 원자적 연산과 제어 블록 때문에 `unique_ptr`보다 비싸다. 복사가 일어날 때마다 카운트를 바꾸므로, 소유권을 나눌 필요가 없는 함수에는 `shared_ptr`을 값으로 넘기지 않는다.
- **같은 원시 포인터로 `shared_ptr`을 두 번 만들면** 제어 블록이 둘 생겨 객체가 두 번 지워진다. 멤버 함수 안에서 자기 자신의 `shared_ptr`이 필요하면 `this`로 새로 만들지 말고 `std::enable_shared_from_this<T>`를 상속해 `shared_from_this()`를 쓴다.

## weak_ptr: 순환 참조 끊기

참조 카운트는 서로를 가리키는 객체를 회수하지 못한다. `Parent`가 `Child`를, `Child`가 `Parent`를 `shared_ptr`로 들면 바깥 참조가 모두 사라져도 서로의 카운트가 1로 남아 둘 다 새어 나간다. 역방향 하나를 `weak_ptr`로 바꾸면 고리가 끊긴다.

```cpp
struct Parent;
struct Child {
    std::weak_ptr<Parent> parent;          // 소유하지 않는 역참조
    void notify();
};
struct Parent {
    std::vector<std::shared_ptr<Child>> children;
    void onChildChanged();
};

void Child::notify() {
    if (auto p = parent.lock()) {          // 살아 있으면 shared_ptr, 아니면 빈 포인터
        p->onChildChanged();
    }
}
```

`weak_ptr`은 객체를 직접 역참조할 수 없다. `lock()`으로 그 순간에만 유효한 `shared_ptr`을 얻어 쓰고, `expired()`로 이미 해제됐는지 확인한다. 캐시, 옵저버 목록처럼 "살아 있으면 쓰고, 아니면 무시한다"는 관계에도 쓴다. 순환을 따로 수집하지 못하는 참조 카운팅의 한계는 [[how-programs-run|프로그램이 실행되기까지]]의 GC 비교에 있다.

## auto_ptr이 사라진 이유

`auto_ptr`은 이동 의미론이 없던 C++98에서 단독 소유를 표현하려고 **복사 생성자가 소유권을 옮기게** 만들었다. `auto_ptr<T> b = a;` 뒤에 `a`는 조용히 null이 되고, 복사가 원본을 바꾸므로 `std::vector`나 정렬 알고리즘에 넣으면 원소가 사라졌다. C++11은 복사와 이동을 문법으로 구분해 `unique_ptr`을 만들었고, `auto_ptr`은 C++11에서 폐기 예정, C++17에서 표준에서 빠졌다.

## 무엇을 쓰고 어떻게 넘기나

| 상황 | 선택 |
| --- | --- |
| 힙 객체의 소유자가 하나 | `unique_ptr` (기본값) |
| 소유자가 여럿이고 누가 마지막일지 모른다 | `shared_ptr` |
| 소유하지 않고 관찰만, 순환을 끊어야 한다 | `weak_ptr` |
| 함수가 객체를 쓰기만 하고 수명에 관심이 없다 | `T&` 또는 `T*`(없을 수 있으면). 스마트 포인터를 넘기지 않는다 |
| 함수에 소유권을 넘긴다 | `std::unique_ptr<T>`를 값으로 받는다. 호출자는 `std::move` |
| 함수가 소유권을 나눠 갖는다 | `std::shared_ptr<T>`를 값으로 받는다 |

함수가 `const std::shared_ptr<T>&`나 `std::unique_ptr<T>&`를 받는 것은 "이 함수는 특정 스마트 포인터 종류에 묶인다"는 뜻이라, 스마트 포인터 자체를 바꾸거나 다시 넘길 때만 쓴다. 원시 포인터는 이제 **소유하지 않는다는 표시**로만 남는다.

## 정리

- 스마트 포인터는 힙 객체의 해제를 소멸자에 묶는 RAII 래퍼이고, 소유권을 타입으로 드러낸다.
- `unique_ptr`은 이동만 되는 단독 소유이고 비용이 원시 포인터와 같다. `make_unique`로 만든다.
- `shared_ptr`은 제어 블록의 참조 카운트로 공유한다. 카운트는 원자적이지만 객체 접근은 동기화되지 않는다. `make_shared`로 만든다.
- 순환 참조는 한쪽을 `weak_ptr`로 바꿔 끊고, 쓸 때는 `lock()`으로 확인한다.
- `auto_ptr`은 복사가 소유권을 옮기는 설계 때문에 C++17에서 제거됐다.
- 기본은 `unique_ptr`, 소유하지 않는 인자는 참조나 원시 포인터다.

관련 노트: [[cpp-basics|C++ 기초]], [[cpp-virtual-functions|C++ 상속과 가상 함수]], [[cpp-exceptions|C++ 예외 처리의 내부 동작]], [[pointers-and-memory|포인터와 메모리]], [[how-programs-run|프로그램이 실행되기까지]], [[memory-pool|메모리 풀]]
