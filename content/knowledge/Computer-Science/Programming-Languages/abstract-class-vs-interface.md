---
title: "추상 클래스와 인터페이스"
concept: "Abstract Class vs Interface"
summary: "인스턴스를 만들 수 없는 추상 클래스와, 구현할 행동의 계약만 정하는 인터페이스를 Java 기준으로 비교한다. 추상 클래스는 상태와 공통 구현을 물려주는 'is-a' 관계, 인터페이스는 여러 개를 붙일 수 있는 'can-do' 역할이며, Java 8 이후 디폴트 메서드로 경계가 흐려졌어도 상태를 가질 수 있느냐가 결정적 차이다."
tags: ["oop", "design-pattern", "software-engineering", "computer-science"]
source: other
date: "2026-10-14"
sources: ["https://github.com/fru1tworld/cs-basic/blob/main/interview/etc/java.md", "https://github.com/fru1tworld/cs-basic/blob/main/interview/etc/python.md", "https://80000coding.notion.site/6b1c657ef1284851a66fe008c3709bbf", "https://docs.oracle.com/javase/tutorial/java/IandI/abstract.html", "고려사이버대학교 Java언어 강의(도성룡 교수, 2023-2학기)"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「추상 클래스와 인터페이스」를 바탕으로 재구성한 노트다. 인터페이스 정적 메서드와 디폴트 메서드 충돌 규칙, Python의 ABC는 fru1tworld/cs-basic 모의 면접 질문 목록의 Java·Python 질문을 바탕으로 보강했다.
> 추상화의 세 종류는 고려사이버대학교 「Java언어」(2023-2학기) 강의 내용으로 보강했다.

## 추상화에서 출발한다

**추상화**(abstraction)는 복잡한 대상에서 핵심만 남기고 나머지를 감추는 일이다. 여러 클래스의 공통점을 뽑아 상위 타입을 만들거나, 내부를 몰라도 호출만 하면 되게 만드는 것이 모두 추상화다. 추상 클래스와 인터페이스는 이 상위 타입을 만드는 두 도구이고, 둘 다 **개방-폐쇄 원칙**(확장에는 열리고 수정에는 닫힘)을 지키는 기반이 된다.

무엇을 감추느냐에 따라 추상화를 셋으로 나누기도 한다. 달력 프로그램을 예로 들면 이렇다.

| 종류 | 감추는 것 | 달력 예 |
| --- | --- | --- |
| 과정(procedural) 추상화 | 세부 단계. 큰 흐름부터 정하고 각 단계의 구현은 미룬다 | 「날짜 입력 → 요일 계산 → 출력」만 먼저 정한다 |
| 데이터 추상화 | 데이터의 내부 표현. 대표 이름과 연산만 드러낸다 | 연·월·일 세 값을 `Date` 하나로 다룬다 |
| 제어 추상화 | 분기·반복의 구체적 흐름 | 윤년이면 A, 아니면 B로 계산하는 분기를 「요일 계산」 한 단계로 묶는다 |

추상 클래스와 인터페이스는 이 중 데이터 추상화를 타입으로 표현하는 도구다.

## 추상 클래스

추상 클래스(abstract class)는 `abstract`로 선언해 **직접 인스턴스를 만들 수 없는** 클래스다. 보통 구현이 없는 **추상 메서드**를 하나 이상 품고, 자식 클래스가 그것을 반드시 구현하게 한다.

```java
public abstract class Animal {
    protected String name;                     // 상태(필드)를 가질 수 있다
    public Animal(String name) { this.name = name; }  // 생성자도 있다

    public abstract String sound();            // 추상 메서드: 자식이 구현해야 한다
    public void speak() {                      // 공통 구현은 물려준다
        System.out.println(name + ": " + sound());
    }
}
```

### 템플릿 메서드와 훅 메서드

추상 클래스의 대표 활용이 **템플릿 메서드 패턴**이다. 부모가 알고리즘의 뼈대(순서)를 고정하고, 달라지는 단계만 자식에게 맡긴다.

| 메서드 종류 | 구현 | 자식의 재정의 |
| --- | --- | --- |
| 템플릿 메서드 | 부모가 완성. 보통 `final` | 하지 않는다 |
| 추상 메서드 | 없음 | **반드시** 한다 |
| 훅(hook) 메서드 | 비어 있거나 기본 동작만 | 필요할 때만 한다 |

```java
public abstract class Report {
    public final void print() {    // 템플릿 메서드: 순서 고정
        header();
        body();                    // 추상: 자식마다 다름
        if (needsFooter()) footer();
    }
    protected abstract void body();
    protected boolean needsFooter() { return true; }  // 훅: 끄고 싶은 자식만 재정의
    private void header() { /* ... */ }
    private void footer() { /* ... */ }
}
```

훅은 문법적으로는 평범한 메서드다. "자식이 끼어들 수 있는 지점"이라는 **설계상의 역할**에 붙인 이름이다.

## 인터페이스

인터페이스(interface)는 **구현할 행동의 목록, 즉 계약**만 정의하는 타입이다. Java는 클래스 다중 상속을 막는 대신 인터페이스는 여러 개 구현할 수 있게 해서 "여러 역할을 겸하는" 표현을 허용한다.

- 필드는 자동으로 `public static final`(상수)이다. 인스턴스 상태를 가질 수 없다.
- 본문 없는 메서드는 자동으로 `public abstract`다.

| 버전 | 인터페이스에 추가된 것 |
| --- | --- |
| Java 8 | **디폴트 메서드**(`default`): 구현을 가진 메서드. 구현 클래스가 재정의하지 않아도 동작한다. **정적 메서드**(`static`) |
| Java 9 | **private 메서드**: 디폴트 메서드끼리 공유하는 내부 도우미 |
| Java 17 | **sealed 인터페이스**: `permits`로 구현 가능한 클래스를 제한 |

디폴트 메서드가 생긴 이유는 **하위 호환**이다. 인터페이스에 추상 메서드를 하나 추가하면 이를 구현한 모든 클래스가 컴파일되지 않는다. 디폴트 메서드로 추가하면 기존 구현체는 손대지 않아도 된다. Java 8이 `Collection`에 `stream()`, `forEach()`를 더할 때 이 방법을 썼다.

```java
public interface Thinkable {
    String think();
    default void thinkAloud() { System.out.println(think()); }
}
```

- **정적 메서드**는 인터페이스 이름으로만 부른다(`Comparator.naturalOrder()`, `List.of()`). 구현 클래스나 그 인스턴스로는 부를 수 없고 상속되지도 않는다. 별도 유틸리티 클래스(`Collections`) 없이 인터페이스 곁에 팩터리와 도우미를 두는 용도다.
- **디폴트 메서드 충돌 규칙**: 같은 시그니처의 구현이 여러 곳에서 오면 ① 클래스(또는 상위 클래스)에 정의된 메서드가 이긴다 ② 그다음 더 구체적인(하위) 인터페이스의 디폴트가 이긴다 ③ 그래도 둘 이상 남으면 컴파일 오류이고, 구현 클래스가 재정의하며 `A.super.m()`으로 하나를 골라 부른다.
- 디폴트 메서드는 `Object`의 `equals`·`hashCode`·`toString`을 재정의할 수 없다. 상태가 없으므로 다른 추상 메서드를 조합하는 편의 기능에 쓴다.

## 무엇이 다른가

| 항목 | 추상 클래스 | 인터페이스 |
| --- | --- | --- |
| 선언 | `abstract class` | `interface` |
| 상속 키워드 | `extends` | `implements` (인터페이스끼리는 `extends`) |
| 다중 상속 | 하나만 | 여러 개 |
| 인스턴스 필드(상태) | 가질 수 있다 | 없다. 상수만 |
| 생성자 | 있다 | 없다 |
| 메서드 접근 제어 | 제한 없음 | `public`(Java 9부터 `private` 도우미 가능) |
| 관계 | **is-a**: "사람은 동물이다" | **can-do**: "사람은 생각할 수 있다" |

```java
public class Human extends Animal implements Thinkable, Comparable<Human> { ... }
```

디폴트 메서드로 인터페이스도 구현을 가질 수 있게 되면서 둘은 비슷해졌다. 그래도 **상태(필드)와 생성자는 여전히 추상 클래스만 가진다.** 공통 상태와 그 상태를 다루는 구현을 물려줘야 하면 추상 클래스, 서로 무관한 클래스들에 같은 능력을 붙이려면 인터페이스다.

- 자식 객체를 만들면 **부모 생성자가 먼저** 실행된다. 자식 생성자에 `super(...)`가 없으면 컴파일러가 첫 줄에 `super()`를 넣는다. 추상 클래스에 생성자가 있는 이유다.
- 오버라이딩된 메서드는 참조 변수의 타입이 아니라 **실행 시점의 실제 객체**로 고른다(동적 바인딩). `Animal a = new Human(...)`이어도 `a.sound()`는 `Human`의 구현이 실행된다.

## 고르는 기준

1. 기본은 **인터페이스**다. 타입 계층이 가볍고, 여러 개를 조합할 수 있으며, 테스트에서 가짜 구현으로 바꾸기 쉽다.
2. 여러 구현이 **상태와 코드를 실제로 공유**하면 인터페이스 아래에 추상 클래스를 하나 두어 공통 구현을 담는다(`List` ← `AbstractList` ← `ArrayList`).
3. 공통 구현을 위해 상속을 늘리기보다 **위임**(composition)을 먼저 검토한다. 상속은 부모 구현에 강하게 묶인다. 언어 차원의 위임 문법은 [[kotlin-delegation|위임 패턴과 Kotlin by]] 노트에 있다.

## 다른 언어에서는

| 언어 | 추상 클래스 | 인터페이스 |
| --- | --- | --- |
| C++ | 순수 가상 함수(`= 0`)가 있는 클래스 | 별도 문법 없음. 순수 가상 함수만 있는 클래스로 표현 ([[cpp-virtual-functions\|가상 함수와 vtable]]) |
| Kotlin | `abstract class` | `interface`. 기본 구현과 추상 프로퍼티 가능, 상태(backing field)는 불가 |
| TypeScript | `abstract class` | `interface`. 컴파일 후 사라지는 타입 정보 |
| Python | `abc.ABC`를 상속하고 `@abstractmethod`를 붙인다. 추상 메서드를 모두 구현하지 않은 하위 클래스는 **인스턴스를 만들 때** `TypeError` | 별도 문법 없음. 추상 메서드만 둔 ABC를 쓰거나, 상속 없이 메서드 모양만 맞추면 되는 `typing.Protocol`(정적 검사기용, [[python-internals\|덕 타이핑]]). ABC의 `register()`로 상속 없이 가상 하위 클래스를 등록할 수도 있다 |

## 정리

- 추상 클래스와 인터페이스는 모두 직접 만들 수 없는 상위 타입이다.
- 추상 클래스는 상태·생성자·공통 구현을 물려주는 is-a 관계이고, 하나만 상속한다.
- 인터페이스는 여러 개 붙일 수 있는 can-do 계약이며, Java 8의 디폴트 메서드는 하위 호환을 위해 생겼다.
- 템플릿 메서드 패턴은 추상 클래스가 순서를 고정하고 추상·훅 메서드로 변하는 부분만 연다.
- 기본은 인터페이스, 공유할 상태가 있을 때 추상 클래스, 그 전에 위임을 검토한다.

관련 노트: [[frontend-solid|프론트엔드와 SOLID 원칙]], [[oop-messaging|객체 지향의 본질: 메시징]], [[kotlin-delegation|위임 패턴과 Kotlin by]], [[software-engineering|소프트웨어 설계와 공학]], [[cpp-inheritance|C++ 상속]]
