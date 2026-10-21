---
title: "프로그래밍 패러다임"
concept: "Programming Paradigms"
summary: "명령형·선언형·객체 지향·함수형·반응형·관점 지향·제네릭·동시성 프로그래밍이 각각 무엇을 중심에 두고 코드를 짜는지 비교한다. 패러다임을 레코드·클로저·동시성·이름 붙은 상태 같은 개념의 묶음으로 보는 관점, 관찰 가능한 비결정성과 상태 표현력이라는 두 축, 새 개념이 필요하다는 신호인 창조적 확장 원칙, goto를 없앤 구조적 프로그래밍, 명령형·함수형·객체 지향의 차이와 객체 지향의 네 기둥(추상화, 캡슐화, 상속, 다형성)을 정리한다."
tags: ["programming-paradigm", "oop", "computer-science", "design", "paradigm"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/top-8-programming-paradigms", "https://bytebytego.com/guides/imperative-vs-functional-vs-object-oriented-programming", "https://bytebytego.com/guides/the-fundamental-pillars-of-object-oriented-programming", "https://bytebytego.com/guides/8-key-oop-concepts-every-developer-should-know", "https://www.info.ucl.ac.be/~pvr/VanRoyChapter.pdf", "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf"]
---

> ByteByteGo의 System Design 101 가이드 「[Top 8 Programming Paradigms](https://bytebytego.com/guides/top-8-programming-paradigms)」, 「[Imperative vs Functional vs Object-oriented Programming](https://bytebytego.com/guides/imperative-vs-functional-vs-object-oriented-programming)」, 「[The Fundamental Pillars of Object-Oriented Programming](https://bytebytego.com/guides/the-fundamental-pillars-of-object-oriented-programming)」, 「[8 Key OOP Concepts Every Developer Should Know](https://bytebytego.com/guides/8-key-oop-concepts-every-developer-should-know)」를 바탕으로 재구성한 노트다. 개념 묶음으로서의 패러다임은 Peter Van Roy의 「[Programming Paradigms for Dummies: What Every Programmer Should Know](https://www.info.ucl.ac.be/~pvr/VanRoyChapter.pdf)」(2009)를, 구조적 프로그래밍은 Edsger Dijkstra의 「[Go To Statement Considered Harmful](https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf)」(1968)를 바탕으로 보강했다.

## 패러다임이란

**프로그래밍 패러다임은 프로그램을 무엇의 조합으로 볼지에 대한 관점이다.** 명령의 나열로 볼 수도, 함수의 합성으로 볼 수도, 협력하는 객체로 볼 수도 있다. 패러다임은 언어에 묶여 있지 않다. 현대 언어 대부분은 여러 패러다임을 섞어 쓰는 멀티 패러다임 언어다.

언어는 수천 개지만 패러다임은 수십 개다. 패러다임의 눈으로 보면 Java, JavaScript, C#, Ruby, Python은 거의 같은 객체 지향 패러다임을 구현한 언어다.

## 패러다임은 개념의 묶음이다

패러다임을 정확하게 정의하는 방법은 **그 패러다임이 쓰는 프로그래밍 개념의 집합**으로 보는 것이다. 개념들을 작은 핵심 언어(kernel language)로 묶으면 패러다임 하나가 된다. 겉보기에 전혀 다른 함수형과 객체 지향도 개념 하나 차이일 때가 많다.

| 핵심 개념 | 뜻 | 더하면 생기는 것 |
| --- | --- | --- |
| 레코드(record) | 이름 붙은 필드의 묶음 | 자료구조 |
| 렉시컬 클로저(lexically scoped closure) | 정의된 환경을 기억하는 일급 함수 | 함수형 프로그래밍. 클로저만으로 람다 계산과 같은 튜링 완전성을 얻는다 |
| 독립성(concurrency) | 서로 순서가 정해지지 않은 활동 | 동시성 프로그래밍 |
| 이름 붙은 상태(named state) | 이름 하나가 시간에 따라 여러 값을 가진다 | 명령형·객체 지향 프로그래밍 |

패러다임을 가르는 축은 둘이다.

- **관찰 가능한 비결정성(observable nondeterminism)**: 같은 입력으로 시작해도 스케줄러의 선택에 따라 결과가 달라질 수 있는가. 경쟁 상태(race condition)가 대표 증상이다. 이름 붙은 상태와 동시성을 함께 가진 언어(Java 등)는 이것을 표현할 수 있어 동시성 프로그래밍이 어렵다. 실세계 상호작용(클라이언트-서버)에는 필요하지만, 필요할 때만 허용한다. 모든 프로그램이 결정적인 **선언적 동시성(declarative/dataflow concurrency)** 패러다임도 있다.
- **상태의 표현력**: 상태가 이름 붙었나(named, 변수·셀) 이름 없나(unnamed, 모나드처럼 인자로 실려 다니나), 결정적인가, 순차인가 동시인가. 함수형(이름 없음·결정적·순차) → 선언적 동시성 → 동시 논리 프로그래밍 → 메시지 전달·공유 상태 동시성(이름 있음·비결정적·동시) 순으로 표현력이 커진다.

**이름 붙은 상태는 모듈성을 위해 필요하다.** 모듈 M의 함수 F가 몇 번 불렸는지 세고 싶을 때, 상태가 없으면 F의 인자에 카운트 입력·출력을 더해야 하고 F를 부르는 모든 사용자 코드가 바뀐다. 모듈 안에 셀 하나를 두면 인터페이스를 그대로 두고 해결된다. 대신 상태를 가진 구성 요소는 한 번 옳다고 증명해도 계속 옳다는 보장이 없다. 그래서 상태는 **밖에서 들여다볼 방법을 남겨 둔다**.

### 새 개념이 필요하다는 신호: 창조적 확장 원칙

프로그램이 풀려는 문제와 무관한 기술적 이유로 **프로그램 전체를 고쳐야 하는 일(pervasive modification)** 이 생기면, 언어에 개념 하나가 빠져 있다는 신호다. 이를 창조적 확장 원칙(creative extension principle)이라 한다.

| 함수형 언어에서 하려는 일 | 개념 없이 하면 | 더할 개념 |
| --- | --- | --- |
| 독립적인 활동 여럿을 모델링 | 실행 스택 여러 개, 스케줄러, 선점 장치를 직접 구현 | 동시성 |
| 과거를 기억하고 갱신하는 개체 | 모든 함수 호출에 메모리 입력·출력 인자 두 개를 추가 | 이름 붙은 상태 |
| 어디서든 오류를 감지해 복구 루틴으로 이동 | 모든 반환값에 오류 코드, 모든 호출 뒤에 검사 조건문 | 예외 |

개념은 많을수록 좋은 것이 아니다. **너무 적으면 프로그램이 복잡해지고, 너무 많으면 추론이 복잡해진다.** 문제에 딱 맞는 개념만 가진 패러다임을 고른다. 상태가 복잡성의 주원인이라는 관점은 [[software-complexity|소프트웨어 복잡성]]에 있다.

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

### 구조적 프로그래밍: goto를 없앤 첫 전환

명령형 안에서도 가장 먼저 자리 잡은 규율은 **구조적 프로그래밍(structured programming)** 이다. 프로그램을 순차·선택(`if`)·반복(`while`)·프로시저 호출만으로 짜고 임의 점프 `goto`를 쓰지 않는다.

근거는 「실행 중인 프로세스의 진행 상황을 어떤 좌표로 설명할 수 있는가」다. 구조적 제어만 쓰면 지금 위치는 **코드 안의 위치(텍스트 인덱스)** 와 **호출 스택·반복 횟수(동적 인덱스)** 로 기술된다. 이 좌표는 프로그래머가 통제하지 않아도 정해지므로 변수 값이 무엇을 뜻하는지 해석할 기준이 된다. `goto`를 마구 쓰면 그런 좌표 체계를 찾기가 끔찍하게 어려워진다. 이 논증(Dijkstra, 1968)은 이후 「~ considered harmful」이라는 제목 관용구를 낳았다. 같은 논리를 동시성으로 옮긴 것이 [[structured-concurrency|구조적 동시성]]이다. C의 `goto cleanup`처럼 함수 안에서 한 방향으로만 뛰는 제한된 쓰임은 지금도 관용구로 남아 있다.

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
- 패러다임은 레코드·클로저·동시성·이름 붙은 상태 같은 개념의 묶음이다. 비결정성과 상태는 필요할 때만 들인다. 코드 전체를 고쳐야 하는 일이 반복되면 개념이 하나 빠졌다는 신호다.
- 명령형은 "어떻게", 선언형·함수형은 "무엇을" 쓴다. 객체 지향은 상태와 행동을 객체로 묶어 책임을 나눈다.
- 함수형은 불변성과 순수 함수로 추론과 병렬화를 쉽게 하고, 객체 지향은 큰 도메인을 역할로 나누기 쉽게 한다.
- 객체 지향의 네 기둥은 추상화, 캡슐화, 상속, 다형성이다. 상속보다 조합을 먼저 생각한다.

관련 노트: [[software-complexity|소프트웨어 복잡성]], [[state-and-decoupling-designs|상태와 결합을 다루는 열다섯 가지 설계]], [[oop-messaging|객체 지향의 본질: 메시징]], [[oop-and-javascript|객체 지향 프로그래밍과 JavaScript]], [[reactive-programming|반응형 프로그래밍과 RxJS]], [[concurrency-models|동시성·병렬·비동기·논블로킹과 동시성 모델]], [[gof-design-patterns|GoF 디자인 패턴]], [[how-programs-run|프로그램이 실행되기까지]]
