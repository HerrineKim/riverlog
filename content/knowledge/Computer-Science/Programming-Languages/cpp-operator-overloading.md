---
title: "C++ 연산자 오버로딩과 형 변환"
concept: "Operator Overloading"
summary: "C++ 연산자 오버로딩은 operator+ 같은 이름의 함수를 정의하는 것이다. 왼쪽 피연산자가 내 클래스가 아닐 때(2 * v, cout << v)는 멤버가 아닌 함수로 만들어야 하고, +=는 멤버로 만들어 *this를 돌려주고 +는 +=로 구현하는 것이 관례다. 변환 생성자와 변환 연산자는 암묵적 형 변환을 만들므로 기본으로 explicit을 붙인다."
tags: ["cpp", "oop", "type", "computer-science"]
source: other
date: "2026-10-31"
sources: ["고려사이버대학교 객체지향 프로그래밍(C++) 강의(장윤경 교수, 2024-2학기)"]
---

> 고려사이버대학교 「객체지향 프로그래밍(C++)」(2024-2학기) 강의 내용을 바탕으로 정리했다.

## 연산자 오버로딩이란

클래스는 새 타입이므로 처음에는 `+`, `==`, `<<` 같은 연산자를 쓸 수 없다. 연산자 오버로딩(operator overloading)은 **`operator기호`라는 이름의 함수를 정의해** 내 타입에 연산자의 의미를 부여하는 것이다. 컴파일러는 연산식을 함수 호출로 바꾼다.

| 연산식 | 멤버 함수로 정의했을 때 | 멤버가 아닌 함수로 정의했을 때 |
| --- | --- | --- |
| `a + b` | `a.operator+(b)` | `operator+(a, b)` |
| `-a` | `a.operator-()` | `operator-(a)` |
| `a == b` | `a.operator==(b)` | `operator==(a, b)` |

`std::string`의 `+`, `std::cout`의 `<<`, 반복자의 `*`·`++`가 모두 표준 라이브러리가 해 둔 연산자 오버로딩이다. 의미가 수학적·관례적으로 자연스러울 때만 쓴다. `+`가 원소를 지우는 식의 오버로딩은 읽는 사람을 속인다.

## 멤버로 할까, 바깥 함수로 할까

멤버 함수로 만들면 **왼쪽 피연산자가 반드시 그 클래스의 객체**여야 한다. `v * 2`는 `v.operator*(2)`로 되지만 `2 * v`는 `int`에 멤버 함수가 없으므로 불가능하다. 이럴 때 멤버가 아닌 함수로 만든다. `private` 멤버에 접근해야 하면 클래스 안에서 `friend`로 선언한다.

| 연산자 | 권장 형태 | 이유 |
| --- | --- | --- |
| `=`, `[]`, `()`, `->`, 형 변환 | 멤버만 가능 | 언어 규칙 |
| `+=`, `-=`, `++`, `--` | 멤버 | 자기 상태를 바꾼다 |
| `+`, `-`, `*`, `==`, `<` 같은 대칭 이항 연산 | 바깥 함수(필요하면 `friend`) | 양쪽 피연산자 모두 암묵적 변환을 받을 수 있다 |
| `<<`, `>>` (스트림) | 바깥 함수 | 왼쪽이 `std::ostream`이다 |

## 관례적인 구현

```cpp
class Vec2 {
public:
    Vec2(double x, double y) : x_(x), y_(y) {}

    Vec2& operator+=(const Vec2& o) {          // 멤버, 자기 자신을 바꾸고
        x_ += o.x_; y_ += o.y_;
        return *this;                          // *this를 참조로 돌려준다 → (a += b) += c 가능
    }
    Vec2 operator-() const { return {-x_, -y_}; }

    friend Vec2 operator+(Vec2 a, const Vec2& b) { return a += b; }   // +는 +=로
    friend Vec2 operator*(double k, const Vec2& v) { return {k * v.x_, k * v.y_}; }
    friend bool operator==(const Vec2&, const Vec2&) = default;       // C++20
    friend std::ostream& operator<<(std::ostream& os, const Vec2& v) {
        return os << '(' << v.x_ << ", " << v.y_ << ')';              // os를 돌려줘야 연쇄 출력
    }
private:
    double x_, y_;
};
```

- **복합 대입(`+=`)을 먼저 만들고, 이항 연산(`+`)은 그것으로 구현한다.** 계산 로직이 한 곳에만 있게 된다. `+`는 새 값을 만들어 값으로 돌려주고, `+=`는 자기 자신을 참조로 돌려준다.
- 대입 연산자와 복합 대입이 `*this`를 참조로 돌려주는 이유는 `a = b = c`, `(a += b) += c` 같은 연쇄를 내장 타입과 똑같이 쓰게 하기 위해서다. `this`는 호출한 객체를 가리키는 포인터라 `*this`가 그 객체 자신이다.
- `<<`가 `std::ostream&`을 돌려주는 것도 `cout << a << b`를 `(cout << a) << b`로 이어 가기 위해서다.
- 비교 연산은 C++20부터 `operator<=>`(3방향 비교)와 `operator==`를 `= default`로 두면 나머지 `<`, `<=`, `!=` 등을 컴파일러가 만들어 준다. 그 전에는 `==`와 `<`를 직접 만들고 나머지를 그것으로 구현했다.

### 전위·후위 증감

```cpp
Counter& operator++();      // ++c : 증가 후 자기 자신(참조)
Counter  operator++(int);   // c++ : 쓰이지 않는 int 인자로 구분, 증가 전 복사본(값)
```

후위형은 이전 값을 복사해 돌려줘야 하므로 비용이 더 든다. 결과값을 쓰지 않는 반복문에서는 `++it`을 쓰는 습관이 여기서 나왔다.

## 바꿀 수 없는 것

- 새 연산자를 만들 수 없고, 우선순위·결합 방향·피연산자 수도 바꿀 수 없다.
- `::`, `.`, `.*`, `?:`, `sizeof`, `typeid`는 오버로딩할 수 없다.
- 피연산자 중 하나 이상은 사용자 정의 타입이어야 한다. `int + int`의 의미는 바꿀 수 없다.
- `&&`, `||`, `,`는 오버로딩할 수는 있지만 하지 않는다. 오버로딩하면 일반 함수 호출이 되어 **단락 평가가 사라지고** 양쪽이 모두 평가된다.

## 클래스와 형 변환

사용자 정의 타입과 다른 타입 사이의 변환은 두 방향으로 정의된다.

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
double d = static_cast<double>(m);   // explicit이므로 명시적 변환만 허용
// Meter n = 3.0;                    // 오류: 암묵적 변환 금지
```

`explicit`이 없으면 컴파일러가 필요할 때마다 몰래 변환을 끼워 넣는다. `void send(Meter)`에 `send(3.0)`이 통과하고, 변환 연산자가 있으면 `m + 1`이 `double` 덧셈으로 바뀌는 식이다. 단위나 의미가 다른 값이 섞이는 버그가 컴파일을 통과하므로 **인자 하나짜리 생성자와 변환 연산자에는 기본으로 `explicit`을 붙이고**, 정말 같은 값으로 봐도 되는 경우(`std::string`이 `const char*`를 받는 것처럼)만 뺀다.

`explicit operator bool()`은 예외적으로 `if (ptr)`, `while (stream)` 같은 조건문 안에서는 명시 없이도 쓰인다. 스마트 포인터와 스트림이 이 방식으로 "유효한가"를 표현한다.

## 정리

- 연산자 오버로딩은 `operator기호` 함수 정의다. 의미가 자연스러울 때만 쓴다
- 왼쪽 피연산자가 내 타입이 아닐 수 있는 대칭 연산과 `<<`는 바깥 함수(`friend`)로
- `+=`는 멤버로 `*this`를 참조 반환, `+`는 `+=`로 구현. 비교는 C++20의 `<=>`
- `&&`, `||`는 오버로딩하면 단락 평가가 사라진다
- 변환 생성자와 변환 연산자에는 기본으로 `explicit`

관련 노트: [[cpp-classes-and-constructors|C++ 클래스와 생성자·소멸자]], [[cpp-basics|C++ 기초 문법과 참조자]], [[cpp-templates|C++ 템플릿]], [[type-systems|타입 시스템]], [[c-operators-and-expressions|C 연산자와 수식]]
