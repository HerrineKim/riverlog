---
title: "프로그래밍 패러다임"
concept: "Programming Paradigms"
summary: "명령형·선언형·객체 지향·함수형·반응형·관점 지향·제네릭·동시성 프로그래밍이 각각 무엇을 중심에 두고 코드를 짜는지 비교한다. 명령형·함수형·객체 지향의 차이와 객체 지향의 네 기둥(추상화, 캡슐화, 상속, 다형성)도 함께 정리한다."
tags: ["programming-paradigm", "oop", "computer-science", "design", "paradigm"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/top-8-programming-paradigms", "https://bytebytego.com/guides/imperative-vs-functional-vs-object-oriented-programming", "https://bytebytego.com/guides/the-fundamental-pillars-of-object-oriented-programming", "https://bytebytego.com/guides/8-key-oop-concepts-every-developer-should-know"]
---

> ByteByteGo의 System Design 101 가이드 「[Top 8 Programming Paradigms](https://bytebytego.com/guides/top-8-programming-paradigms)」, 「[Imperative vs Functional vs Object-oriented Programming](https://bytebytego.com/guides/imperative-vs-functional-vs-object-oriented-programming)」, 「[The Fundamental Pillars of Object-Oriented Programming](https://bytebytego.com/guides/the-fundamental-pillars-of-object-oriented-programming)」, 「[8 Key OOP Concepts Every Developer Should Know](https://bytebytego.com/guides/8-key-oop-concepts-every-developer-should-know)」를 바탕으로 재구성한 노트다.

## 패러다임이란

**프로그래밍 패러다임은 프로그램을 무엇의 조합으로 볼지에 대한 관점이다.** 명령의 나열로 볼 수도, 함수의 합성으로 볼 수도, 협력하는 객체로 볼 수도 있다. 패러다임은 언어에 묶여 있지 않다. 현대 언어 대부분은 여러 패러다임을 섞어 쓰는 멀티 패러다임 언어다.

## 여덟 가지 패러다임

| 패러다임 | 중심 생각 | 대표 언어·도구 |
| --- | --- | --- |
| 명령형(Imperative) | 상태를 바꾸는 명령을 순서대로 적는다. **어떻게** 할지를 쓴다 | C, 대부분의 절차형 코드 |
| 선언형(Declarative) | 제어 흐름 없이 **무엇을** 원하는지 쓴다 | SQL, HTML, 함수형 언어 |
| 객체 지향(OOP) | 데이터와 행동을 묶은 객체들이 메시지를 주고받는다 | Java, C#, C++, Python, Ruby |
| 함수형(FP) | 계산을 수학 함수의 평가로 본다. 불변 데이터, 순수 함수, 함수 합성 | Haskell, Lisp, Erlang, Scala, JS·Python의 함수형 기능 |
| 반응형(Reactive) | 비동기 데이터 스트림과 변화의 전파를 다룬다 | RxJS, Reactor, 스트림 처리 |
| 관점 지향(AOP) | 로깅·트랜잭션·보안처럼 여러 곳에 흩어지는 횡단 관심사를 모듈로 뺀다 | AspectJ, Spring AOP |
| 제네릭(Generic) | 타입에 독립적인 알고리즘과 자료구조를 쓴다 | C++ 템플릿, Java·TypeScript 제네릭 |
| 동시성(Concurrent) | 여러 작업을 겹쳐 실행하도록 구조를 짠다 | Go, Erlang, 멀티스레드 서버 |

반응형은 [[reactive-programming|반응형 프로그래밍과 RxJS]], 동시성은 [[concurrency-models|동시성·병렬·비동기·논블로킹과 동시성 모델]]에서 자세히 다룬다.

## 명령형·함수형·객체 지향 비교

| 비교 | 명령형 | 함수형 | 객체 지향 |
| --- | --- | --- | --- |
| 기본 단위 | 문장(statement) | 함수 | 객체 |
| 상태 | 변경 가능한 상태를 직접 바꾼다 | 불변. 새 값을 만든다 | 객체 안에 캡슐화하고 메서드로만 바꾼다 |
| 흐름 제어 | 반복문, 조건문 | 재귀, 고차 함수(map, filter, reduce) | 메서드 호출과 다형성 |
| 부수 효과 | 자연스럽다 | 피하고, 경계로 몰아낸다 | 객체 내부로 가둔다 |
| 강점 | 하드웨어에 가깝고 직관적이다 | 추론·테스트·병렬화가 쉽다 | 큰 도메인을 역할별로 나누기 쉽다 |

같은 일을 세 방식으로 쓰면 차이가 보인다.

```python
# 명령형: 상태를 바꿔 가며 어떻게 할지 적는다
total = 0
for p in prices:
    if p > 100:
        total += p

# 함수형: 데이터를 변환하는 식으로 무엇을 원하는지 적는다
total = sum(filter(lambda p: p > 100, prices))

# 객체 지향: 책임을 가진 객체에게 메시지를 보낸다
total = cart.total_of_items_over(100)
```

## 객체 지향의 핵심 개념

### 구성 요소

| 개념 | 뜻 |
| --- | --- |
| 클래스(Class) | 객체를 만드는 설계도. 속성과 메서드를 정의한다 |
| 객체(Object) | 클래스로 만든 실체. 자기 상태를 가진다 |
| 메서드(Method) | 객체가 할 수 있는 행동 |
| 인터페이스(Interface) | 구현 없이 "무엇을 할 수 있어야 하는가"만 정한 계약([[abstract-class-vs-interface\|추상 클래스와 인터페이스]]) |

### 네 기둥

| 기둥 | 뜻 | 예 |
| --- | --- | --- |
| **추상화(Abstraction)** | 구현 세부를 숨기고 꼭 필요한 특징만 드러낸다 | `Vehicle`에 추상 메서드 `stop()`만 둔다 |
| **캡슐화(Encapsulation)** | 데이터와 메서드를 한 단위로 묶고 접근 제한자로 직접 접근을 막는다 | private 필드 + 공개 메서드 |
| **상속(Inheritance)** | 기존 클래스(부모)의 속성과 메서드를 새 클래스(자식)가 물려받아 재사용한다 | `Car extends Vehicle` |
| **다형성(Polymorphism)** | 같은 메시지에 객체마다 다르게 반응한다. 같은 상속 계보의 타입은 서로 바꿔 쓸 수 있다 | `vehicle.stop()`이 차와 자전거에서 다르게 동작 |

상속은 재사용 수단이지만 결합을 강하게 만든다. 행동을 재사용하려면 상속보다 **조합(composition)**을 먼저 고려하는 것이 일반적인 원칙이다. 객체 지향을 클래스가 아니라 **메시지를 주고받는 객체**로 보는 관점은 [[oop-messaging|객체 지향의 본질: 메시징]]에, JavaScript에서의 객체 지향은 [[oop-and-javascript|객체 지향 프로그래밍과 JavaScript]]에 있다.

## 정리

- 패러다임은 프로그램을 보는 관점이고, 현대 언어는 여러 패러다임을 섞는다.
- 명령형은 "어떻게", 선언형·함수형은 "무엇을" 쓴다. 객체 지향은 상태와 행동을 객체로 묶어 책임을 나눈다.
- 함수형은 불변성과 순수 함수로 추론과 병렬화를 쉽게 하고, 객체 지향은 큰 도메인을 역할로 나누기 쉽게 한다.
- 객체 지향의 네 기둥은 추상화, 캡슐화, 상속, 다형성이다. 상속보다 조합을 먼저 생각한다.

관련 노트: [[oop-messaging|객체 지향의 본질: 메시징]], [[oop-and-javascript|객체 지향 프로그래밍과 JavaScript]], [[reactive-programming|반응형 프로그래밍과 RxJS]], [[concurrency-models|동시성·병렬·비동기·논블로킹과 동시성 모델]], [[gof-design-patterns|GoF 디자인 패턴]], [[how-programs-run|프로그램이 실행되기까지]]
