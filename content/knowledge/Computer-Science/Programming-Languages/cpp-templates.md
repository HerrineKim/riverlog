---
title: "C++ 템플릿"
concept: "C++ Template"
summary: "타입을 매개변수로 받아 함수와 클래스를 찍어 내는 C++ 템플릿을 정리한다. 함수·클래스 템플릿, 기본 템플릿 인자와 비타입 인자, 특수화, 템플릿 재귀와 가변 인자 템플릿까지 다루며, 템플릿은 컴파일 시점에 타입별 코드를 생성하는 정적 다형성이라는 점이 핵심이다."
tags: ["cpp", "oop", "computer-science", "design-pattern"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/e4d170fd04df4c2497c48c2a27d9f8d0", "https://80000coding.notion.site/bce4147ecad5436e89b9a46d284bad69", "https://en.cppreference.com/w/cpp/language/templates"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[C++] Template 은 무엇일까」, 「[c++] Template Recursion(템플릿 재귀)」를 바탕으로 재구성한 노트다.

## 템플릿이란

템플릿(template)은 **함수나 클래스를 만들어 내는 틀**이다. 타입을 매개변수(`T`)로 비워 두고, 사용하는 곳에서 타입이 정해지면 컴파일러가 그 타입용 코드를 생성한다. 이 과정을 **인스턴스화(instantiation)**라 한다.

| 비교 | 함수 오버로딩 | 템플릿 |
| --- | --- | --- |
| 타입별 코드 | 사람이 타입마다 직접 작성 | 컴파일러가 필요한 타입만 생성 |
| 새 타입 대응 | 오버로드를 하나 더 써야 한다 | 연산만 지원하면 그대로 동작 |
| 적합한 경우 | 타입마다 동작이 다를 때 | 타입과 무관하게 같은 로직일 때 |

템플릿은 **정적(컴파일 타임) 다형성**이다. 가상 함수가 실행 중에 vtable로 함수를 고르는 동적 다형성이라면, 템플릿은 컴파일할 때 이미 타입별 함수가 따로 만들어져 호출 비용이 없다. 대신 타입 수만큼 코드가 늘어난다(코드 비대).

## 함수 템플릿

```cpp
template <typename T>
void printPair(T a, T b) { std::cout << a << ", " << b << '\n'; }

printPair(100, 999);             // T = int 로 추론
printPair(3.14, 0.0015);         // T = double
printPair<std::string>("A", "B"); // 명시적 지정
```

- 인자에서 `T`를 추론할 수 있으면 `<int>`를 생략한다. `printPair(1, 2.0)`처럼 추론이 엇갈리면 오류다.
- 타입이 둘이면 `template <typename T1, typename T2>`로 매개변수를 늘린다.
- `typename`과 `class`는 템플릿 매개변수 선언에서 같은 뜻이다.

## 클래스 템플릿

`IntArray`, `DoubleArray`, `StringArray`처럼 원소 타입만 다른 클래스를 하나로 합친다.

```cpp
template <typename T = int, int Capacity = 100>   // 기본 인자, 비타입 인자
class Array {
    T*  buf;
    int size;
public:
    Array() : buf(new T[Capacity]), size(0) {}
    ~Array() { delete[] buf; }
    void add(const T& v) { buf[size++] = v; }
    const T& operator[](int i) const { return buf[i]; }
    int getSize() const { return size; }
};

Array<>                 a;  // int, 100
Array<double>           b;  // double, 100
Array<std::string, 10>  c;  // std::string, 10
```

- 클래스 템플릿은 C++17 이전에는 타입을 반드시 명시해야 했다. C++17부터는 생성자 인자로 추론한다(CTAD, `std::vector v{1, 2, 3};`).
- `int Capacity`처럼 타입이 아닌 **비타입 템플릿 인자**는 컴파일 타임 상수여야 한다. `std::array<int, 5>`가 이 방식이다.
- 멤버 함수 정의까지 헤더에 둔다. 사용하는 쪽에서 정의가 보여야 인스턴스화할 수 있어서, 템플릿을 `.cpp`에만 두면 링크 오류가 난다.

## 템플릿 특수화

대부분의 타입에는 일반 템플릿이 맞지만, 특정 타입만 다르게 처리해야 할 때가 있다. 예를 들어 `sizeof(std::string)`은 문자열 길이가 아니라 객체 크기(구현에 따라 24~32바이트)를 돌려준다.

```cpp
template <typename T>
struct Info { static void print(const T& v) { std::cout << sizeof(v); } };

template <>                                   // 완전 특수화
struct Info<std::string> {
    static void print(const std::string& v) { std::cout << v.size(); }
};
```

| 종류 | 형태 | 지원 |
| --- | --- | --- |
| 완전 특수화 | `template <> struct Info<std::string>` | 함수·클래스 템플릿 |
| 부분 특수화 | `template <typename T> struct Info<T*>` | 클래스 템플릿만 |

함수 템플릿은 부분 특수화가 없으므로 오버로딩으로 대신한다.

## 템플릿 재귀와 가변 인자

템플릿이 자기 자신을 더 작은 인자로 인스턴스화하게 만들면 **컴파일 타임 재귀**가 된다. 종료 조건은 특수화로 준다.

```cpp
template <int N> struct Factorial { static const int value = N * Factorial<N - 1>::value; };
template <>      struct Factorial<0> { static const int value = 1; };
// Factorial<5>::value 는 컴파일할 때 120으로 계산된다
```

C++11의 **가변 인자 템플릿**(variadic template)은 인자 묶음을 하나씩 벗겨 내는 재귀로 처리했고, C++17의 **폴드 식**(fold expression)이 그 재귀를 한 줄로 줄였다.

```cpp
template <typename... Args>
void printAll(const Args&... args) { ((std::cout << args << ' '), ...); }  // C++17 폴드 식
```

값 계산이 목적이면 오늘날에는 템플릿 재귀보다 `constexpr` 함수가 읽기 쉽다. 템플릿 재귀는 타입 목록을 다루는 메타프로그래밍에 주로 남아 있다.

## 한계

- 오류 메시지가 길고 읽기 어렵다. C++20의 **콘셉트**(concepts)로 `template <std::integral T>`처럼 요구 조건을 선언하면 오류가 호출 지점에서 짧게 나온다.
- 타입마다 코드가 복제되어 바이너리와 컴파일 시간이 늘어난다.
- 정의가 헤더에 노출되므로 구현을 숨기기 어렵다.

## 정리

- 템플릿은 타입을 비워 둔 틀이고, 컴파일러가 쓰이는 타입마다 코드를 생성한다.
- 함수 템플릿은 인자에서 타입을 추론하고, 클래스 템플릿은 C++17부터 생성자 인자로 추론한다.
- 특정 타입만 다르게 처리할 때는 특수화를 쓴다. 부분 특수화는 클래스 템플릿에만 있다.
- 템플릿 재귀는 컴파일 타임 계산의 원리이고, 오늘날에는 폴드 식과 `constexpr`이 그 자리를 많이 대신한다.
- STL 컨테이너와 알고리즘이 모두 템플릿으로 만들어져 있다.

관련 노트: [[cpp-stl-containers|C++ STL 컨테이너와 시간 복잡도]], [[cpp-virtual-functions|가상 함수와 vtable]], [[cpp-basics|C++ 기초 문법과 참조자]]
