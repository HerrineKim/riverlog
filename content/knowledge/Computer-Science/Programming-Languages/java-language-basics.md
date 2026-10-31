---
title: "Java 언어 기본: 접근 제어자, static, 객체 비교, 제네릭, 리플렉션"
concept: "Java Basics"
summary: "Java 면접에서 자주 묻는 언어 기본기를 주제별로 정리한다. 접근 제어자와 패키지, final·finally·finalize, static과 static final(C·C++의 static과 컴파일 시 처리 포함), 오버로딩과 오버라이딩, 업·다운캐스팅, ==·equals·hashCode와 문자열 상수 풀, String 계열, Comparable과 Comparator, 값 전달, 컴포지션, 기본형과 래퍼 클래스·오토박싱, 제네릭과 타입 소거, 리플렉션·어노테이션·동적 프록시."
tags: ["java", "oop", "backend", "concurrency"]
source: other
date: "2026-10-30"
sources: ["https://github.com/jbee37142/Interview_Question_for_Beginner/blob/main/Java/README.md", "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html", "https://openjdk.org/jeps/421", "https://openjdk.org/jeps/506", "https://github.com/4z7l/tech_interview.zip/blob/main/%EC%A7%81%EB%AC%B4/JAVA.md", "https://github.com/gyoogle/tech-interview-for-developer/blob/master/Language/%5Bjava%5D%20String%20StringBuilder%20StringBuffer%20%EC%B0%A8%EC%9D%B4.md", "https://github.com/gyoogle/tech-interview-for-developer/blob/master/Language/%5Bjava%5D%20Call%20by%20value%EC%99%80%20Call%20by%20reference.md", "https://github.com/gyoogle/tech-interview-for-developer/blob/master/Language/%5Bjava%5D%20%EC%BB%B4%ED%8F%AC%EC%A7%80%EC%85%98%28Composition%29.md", "https://github.com/gyoogle/tech-interview-for-developer/blob/master/Language/%5BJava%5D%20Intrinsic%20Lock.md", "https://github.com/gyoogle/tech-interview-for-developer/blob/master/Language/%5Bjava%5D%20Java%20major%20feature%20changes.md", "https://github.com/fru1tworld/cs-basic/blob/main/interview/etc/java.md", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/etc.md", "고려사이버대학교 Java언어 강의(도성룡 교수, 2023-2학기)"]
---

> jbee의 「[Interview Question for Beginner](https://github.com/jbee37142/Interview_Question_for_Beginner)」 저장소 Java 문서를 바탕으로, Java SE 공식 문서와 JEP로 확인해 재구성한 노트다.
> 업·다운캐스팅, 객체 비교와 문자열 상수 풀, volatile·Atomic·Callable은 4z7l의 「[tech_interview.zip](https://github.com/4z7l/tech_interview.zip)」 Java 문서를 바탕으로 보강했다.
> String 계열 비교, 값 전달, 컴포지션, 고유 락과 wait·notify, 버전별 기능은 gyoogle의 「[tech-interview-for-developer](https://github.com/gyoogle/tech-interview-for-developer)」 저장소의 Language 문서를 바탕으로, OpenJDK JEP로 확인해 보강했다.
> static, Comparable과 Comparator, 리플렉션·커스텀 어노테이션·동적 프록시는 fru1tworld/cs-basic 모의 면접 질문 목록의 Java·언어 기본 질문을 바탕으로 보강했다.
> 패키지와 import, 상속 형태, 기본형 표, 배열과 컬렉션의 차이는 고려사이버대학교 「Java언어」(2023-2학기) 강의 내용으로 보강했다.

JVM 구조와 GC는 [[jvm-internals|JVM 내부 구조]], Enum·Optional·예외 같은 실무 관용구는 [[java-idioms|Java 실무 관용구]], 코딩 규칙은 [[java-coding-convention|Java 코딩 컨벤션]]에, 동시성은 [[java-concurrency|Java 동시성]]에, 버전별 새 기능은 [[modern-java-features|모던 Java 기능]]에 있다. 이 노트는 그 아래 깔린 언어 문법의 기본기를 다룬다.

## 접근 제어자

| 제어자 | 같은 클래스 | 같은 패키지 | 다른 패키지의 하위 클래스 | 그 밖 |
| --- | --- | --- | --- | --- |
| `public` | O | O | O | O |
| `protected` | O | O | O | X |
| (default, package-private) | O | O | X | X |
| `private` | O | X | X | X |

- 필드는 `private`으로 숨기고 필요한 동작만 메서드로 연다(캡슐화). 기본값은 「아무것도 안 쓴」 package-private이다.
- Java 9의 모듈 시스템(`module-info.java`)은 그 위에서 **패키지 단위로** 무엇을 `exports`할지 한 번 더 막는다. `public` 클래스라도 내보내지 않은 패키지에 있으면 모듈 밖에서 못 쓴다.

### 패키지와 import

**패키지는 관련 클래스·인터페이스를 묶는 이름 공간이다.** 파일 첫 줄의 `package com.example.member;`로 선언하고, 소스 디렉터리 구조(`com/example/member/`)가 이름과 일치해야 한다. 클래스의 진짜 이름은 패키지까지 붙인 **완전한 이름(fully qualified name)** `com.example.member.Student`이므로, 다른 패키지에 같은 단순 이름의 클래스가 있어도 충돌하지 않는다. 그리고 package-private과 `protected`의 경계가 바로 이 패키지다.

| 규칙 | 내용 |
| --- | --- |
| 이름 | 전부 소문자, 소유한 도메인을 뒤집어 시작한다(`com.example`). `java.*`는 JDK 전용이다 |
| `package` 생략 | 이름 없는 기본 패키지에 들어간다. 다른 패키지에서 `import`할 수 없으므로 연습 코드에만 쓴다 |
| `import a.b.C;` | 클래스 하나를 단순 이름으로 쓰게 한다 |
| `import a.b.*;` | 그 패키지의 클래스를 필요할 때 찾는다. **하위 패키지(`a.b.c`)는 포함하지 않는다.** 두 와일드카드에 같은 이름이 있으면 그 이름을 쓰는 순간 모호성 오류다 |
| 자동 import | `java.lang`(`String`, `Math`, `System`, 래퍼 클래스)과 같은 패키지의 클래스는 `import` 없이 쓴다 |

`import`는 컴파일러에게 이름을 알려 줄 뿐이고 코드를 붙여 넣지 않는다. C의 `#include`와 달리 실행 파일 크기나 속도에 영향이 없다.

## final, finally, finalize

이름만 비슷한 세 가지다.

| 이름 | 종류 | 뜻 |
| --- | --- | --- |
| `final` 클래스 | 키워드 | 상속할 수 없다(`String`, 래퍼 클래스) |
| `final` 메서드 | 키워드 | 오버라이딩할 수 없다 |
| `final` 변수 | 키워드 | 한 번만 대입한다. 참조 변수면 **참조만 고정**되고 가리키는 객체의 내용은 바뀔 수 있다 |
| `finally` | 블록 | `try`의 정상 종료·예외와 상관없이 마지막에 실행된다. 자원 정리는 `try-with-resources`(`AutoCloseable`)가 더 안전하다 |
| `finalize()` | `Object`의 메서드 | GC가 객체를 회수하기 전에 부를 수도 있는 메서드. 호출 시점·실행 여부가 보장되지 않아 **Java 9에서 deprecated, Java 18(JEP 421)부터 제거 예정**이다. 대신 `try-with-resources`나 `java.lang.ref.Cleaner`를 쓴다 |

## static

**`static`은 멤버를 객체가 아니라 클래스에 속하게 한다.** 인스턴스를 만들지 않고 `클래스명.멤버`로 쓰고, 모든 인스턴스가 하나를 공유한다.

| 대상 | 뜻 |
| --- | --- |
| static 필드 | 클래스당 하나. 클래스가 초기화될 때(`<clinit>`) 값이 정해지고 클래스가 언로드될 때까지 산다 |
| static 메서드 | `this`가 없어 인스턴스 멤버를 직접 쓸 수 없다. 오버라이딩되지 않고 하위 클래스의 같은 시그니처는 **숨김(hiding)** 이다. 호출 대상은 컴파일 시점에 정해진다(`invokestatic`) |
| static 블록 | 클래스 초기화 때 한 번 실행된다 |
| static 중첩 클래스 | 바깥 인스턴스 참조를 갖지 않는다. 내부(inner) 클래스는 바깥 `this`를 숨은 필드로 붙잡아 누수의 원인이 되므로, 바깥 인스턴스가 필요 없으면 static으로 둔다 |
| static import | `import static java.lang.Math.max;`로 클래스 이름 없이 쓴다 |

**주의할 점**:

- **공유 가변 상태다.** static 필드는 사실상 전역 변수라 여러 스레드가 함께 바꾸면 경쟁 상태가 생기고([[java-concurrency|Java 동시성]]), 테스트끼리 상태가 샌다.
- **메모리 누수**: static 컬렉션에 넣은 객체는 클래스가 살아 있는 한 회수되지 않는다. 캐시라면 크기 제한을 둔다.
- **테스트와 확장이 어렵다.** static 메서드는 오버라이딩·가짜 객체로 바꿔 끼울 수 없다. 상태 없는 유틸리티(`Math.max`)와 팩터리 메서드(`List.of`)에만 쓰고, 의존성이 있는 로직은 인스턴스로 만들어 주입한다.
- 초기화 순서: static 필드 초기화와 static 블록은 **소스에 적힌 순서**대로 실행된다. 서로를 참조하면 아직 기본값(0, `null`)인 필드를 읽을 수 있다.

### static, final, static final

| 선언 | 개수 | 대입 | 쓰임 |
| --- | --- | --- | --- |
| `static int count` | 클래스당 하나 | 언제든 바꿀 수 있다 | 공유 카운터(동시성 주의) |
| `final int id` | **객체마다** 하나 | 생성자가 끝나기 전 한 번 | 객체별로 다르지만 바뀌지 않는 값 |
| `static final int MAX = 10` | 클래스당 하나 | 클래스 초기화 때 한 번 | 상수 |

- 기본형·`String`에 컴파일 시점 상수식을 대입한 `static final`은 **상수 변수(constant variable)** 다. `javac`가 쓰는 곳마다 값을 **복사해 넣는다(인라이닝).** 그래서 상수를 정의한 클래스만 다시 컴파일하면, 그 상수를 쓰는 다른 클래스는 옛 값을 그대로 가진다. 함께 다시 빌드해야 한다.
- `static final List<String> NAMES = new ArrayList<>()`는 참조만 고정된다. 내용까지 고정하려면 `List.of(...)`를 쓴다.

### C·C++의 static

같은 키워드가 C 계열에서는 두 가지 다른 뜻을 가진다.

| 위치 | 뜻 |
| --- | --- |
| 함수 안의 지역 변수 | **저장 기간(storage duration)이 정적**이다. 스택이 아니라 데이터 영역에 놓여 함수가 끝나도 값이 유지되고, 처음 한 번만 초기화된다 |
| 파일 수준 전역 변수·함수 | **내부 링크(internal linkage)**. 이 번역 단위(.c 파일) 안에서만 보이고 다른 파일에서 `extern`으로 쓸 수 없다 |
| C++ 클래스 멤버 | Java와 같다. 클래스에 속하고 인스턴스 없이 쓴다 |

**컴파일할 때의 처리**: static 저장 기간 변수는 프로그램 시작 전에 자리가 정해진다. 0이 아닌 초깃값이 있으면 실행 파일의 `.data` 섹션에, 0이거나 초깃값이 없으면 `.bss` 섹션에 들어가고 로더가 0으로 채운다. 이름이 같은 함수 안 static 변수끼리 충돌하지 않도록 컴파일러가 심볼 이름을 고유하게 바꾼다. 내부 링크인 static 함수·전역 변수는 목적 파일의 심볼 테이블에 **지역(local) 심볼**로 기록돼 링커가 다른 파일의 같은 이름과 연결하지 않는다(`nm`에서 소문자 `t`·`d`·`b`로 보인다). 그래서 파일마다 같은 이름의 static 함수를 둬도 충돌하지 않는다. 메모리 영역 배치는 [[gcc-compile-and-link|GCC 컴파일과 링크]]에 있다.

## 오버로딩과 오버라이딩

| 기준 | 오버로딩(overloading) | 오버라이딩(overriding) |
| --- | --- | --- |
| 무엇을 | 같은 이름, **다른 매개변수 목록**의 메서드를 여럿 만든다 | 상위 타입의 메서드를 하위 클래스가 **같은 시그니처로 다시 정의**한다 |
| 반환 타입 | 달라도 되지만 반환 타입만 다른 것은 안 된다 | 같거나 하위 타입(공변 반환) |
| 언제 결정되나 | **컴파일 시점**, 인자의 정적 타입으로 고른다 | **실행 시점**, 실제 객체의 타입으로 고른다(동적 바인딩) |
| 다형성 분류 | 정적(컴파일 시간) 다형성 | 동적(실행 시간) 다형성 |
| 접근 제어자 | 상관없다 | 상위보다 좁힐 수 없다 |
| 생성자 | 오버로딩할 수 있다(매개변수 목록이 다른 생성자 여럿) | 생성자는 상속되지 않으므로 오버라이딩도 없다 |

```java
class Animal { String sound() { return "..."; } }
class Dog extends Animal { @Override String sound() { return "멍"; } }

static void print(Animal a) { System.out.println("animal"); }
static void print(Dog d)    { System.out.println("dog"); }

Animal a = new Dog();
a.sound();   // "멍"     : 오버라이딩, 실제 객체(Dog) 기준
print(a);    // "animal" : 오버로딩, 변수의 정적 타입(Animal) 기준
```

`@Override`를 붙이면 시그니처가 어긋났을 때 컴파일러가 잡아 준다. `static`·`private` 메서드는 오버라이딩되지 않는다(하위 클래스의 같은 이름은 숨김, hiding).

업캐스팅(하위 객체를 상위 타입 변수에 담기, `Animal a = new Dog()`)은 자동이고 항상 안전하다. 다운캐스팅(`(Dog) a`)은 실제 객체가 그 타입일 때만 성공하고 아니면 `ClassCastException`이므로, Java 16부터는 패턴 매칭 `if (a instanceof Dog d)`로 검사와 형 변환을 한 번에 한다.

## 객체 비교: ==, equals, hashCode

| 비교 | 무엇을 보나 |
| --- | --- |
| `==` | 기본형은 값, 참조형은 **같은 객체(같은 참조)인가** |
| `equals()` | **논리적으로 같은가.** `Object`의 기본 구현은 `==`와 같고, `String`·래퍼·`record`처럼 값 의미가 있는 클래스가 재정의한다 |
| `hashCode()` | 해시 컬렉션이 버킷을 고를 때 쓰는 정수. 객체 메모리 주소가 아니다(기본 구현은 JVM이 만든 식별 해시) |

**`equals`를 재정의하면 `hashCode`도 반드시 재정의한다.** 「`equals`가 같으면 `hashCode`도 같아야 한다」는 규약을 어기면 `HashMap`·`HashSet`이 같은 객체를 다른 버킷에서 찾아 중복을 허용하거나 못 찾는다([[hash-table|해시 테이블]]). 반대로 `hashCode`가 같다고 `equals`가 같을 필요는 없다(충돌). Java 16의 `record`는 둘을 컴포넌트 기준으로 자동 생성한다.

문자열 리터럴 `"abc"`는 힙 안의 **문자열 상수 풀(string pool)** 에 한 번만 만들어져 같은 리터럴이 같은 객체를 공유한다. `new String("abc")`는 풀과 별개로 매번 새 객체를 만든다. 그래서 `"abc" == "abc"`는 `true`, `"abc" == new String("abc")`는 `false`다. 문자열은 항상 `equals`로 비교하고, `intern()`은 풀의 객체를 돌려준다. `String`이 불변이라 이런 공유가 안전하다.

### String, StringBuilder, StringBuffer

| 클래스 | 변경 | 스레드 안전 | 맞는 곳 |
| --- | --- | --- | --- |
| `String` | **불변**. 연결하면 새 객체가 생긴다 | 불변이라 안전하다 | 대부분의 문자열 값, 해시 키 |
| `StringBuilder` | 가변 버퍼에 이어 붙인다 | X | 반복문 안에서 문자열 조립 |
| `StringBuffer` | 가변, 모든 메서드가 `synchronized` | O | 여러 스레드가 한 버퍼를 함께 고칠 때(드물다) |

한 줄의 `a + b + c`는 컴파일러가 알아서 최적화하므로(Java 9부터 `invokedynamic` 기반 연결) 그대로 써도 된다. **반복문 안에서 `+=`로 이어 붙이면** 매번 새 문자열을 만들어 O(n²)이 되므로 `StringBuilder`를 쓴다.

### Comparable과 Comparator

| 비교 | `Comparable<T>` | `Comparator<T>` |
| --- | --- | --- |
| 패키지·메서드 | `java.lang`, `int compareTo(T o)` | `java.util`, `int compare(T a, T b)` |
| 누가 구현하나 | 정렬될 **클래스 자신** | 클래스 **바깥**의 별도 객체(람다) |
| 기준 개수 | 하나. 그 타입의 **자연 순서(natural ordering)** | 원하는 만큼. 상황별 정렬 기준 |
| 쓰는 곳 | `Collections.sort(list)`, `TreeSet`, `TreeMap`의 기본 순서 | `list.sort(cmp)`, `new TreeSet<>(cmp)`, 고칠 수 없는 클래스 정렬 |

```java
record User(String name, int age) implements Comparable<User> {
    public int compareTo(User o) { return Integer.compare(age, o.age); }   // 자연 순서: 나이
}
users.sort(Comparator.comparing(User::name)
                     .thenComparing(User::age, Comparator.reverseOrder()));
```

- 반환값은 음수(앞), 0(같음), 양수(뒤)다. `a - b`로 빼면 오버플로가 날 수 있으므로 `Integer.compare`를 쓴다.
- **`compareTo`가 0인 것과 `equals`가 참인 것은 일치시키는 편이 좋다.** `TreeSet`·`TreeMap`은 `equals`가 아니라 `compareTo`로 중복을 판단한다. `BigDecimal`의 `2.0`과 `2.00`은 `equals`는 거짓, `compareTo`는 0이라 `HashSet`과 `TreeSet`에서 원소 수가 다르다.

## 값 전달: Java는 언제나 call by value

Java는 메서드 인자를 **항상 값으로 복사해 넘긴다.** 참조형 인자도 「객체를 가리키는 참조 값」이 복사될 뿐이다.

```java
void rename(User u) { u.setName("B"); }   // 같은 객체를 고친다 → 호출한 쪽에서도 보인다
void replace(User u) { u = new User("C"); } // 복사된 참조만 바꾼다 → 호출한 쪽은 그대로
```

그래서 메서드 안에서 객체의 **내용**은 바꿀 수 있지만 호출한 쪽의 변수가 **다른 객체를 가리키게** 할 수는 없다. 두 변수를 바꾸는 `swap(a, b)`를 Java로 짤 수 없는 이유다. JavaScript·Python도 같은 방식이다([[variables-and-types|변수와 타입]]). 이 방식을 따로 공유에 의한 호출(call by sharing)이라 부르며, 언어별 인자 전달 방식 비교는 [[programming-language-semantics|프로그래밍 언어 의미론]]에 있다.

## 상속보다 컴포지션

Java 클래스는 `extends`로 **부모를 하나만** 둔다. 한 부모에 자식 하나(단일), 부모 → 자식 → 손자로 이어지는 사슬(다단계), 한 부모에 여러 자식(계층적)은 모두 되지만, 한 클래스가 두 클래스를 동시에 상속하는 다중 상속은 없다. 여러 타입의 역할이 필요하면 인터페이스를 여러 개 `implements`한다([[abstract-class-vs-interface|추상 클래스와 인터페이스]]). 부모의 `private` 멤버는 자식 객체 안에 있지만 자식 코드에서 직접 접근할 수 없고, 부모가 연 메서드나 `super`로 다룬다.

상속은 상위 클래스의 구현에 하위 클래스를 묶는다. 상위 클래스가 내부 동작을 바꾸면 하위 클래스가 깨질 수 있다(깨지기 쉬운 상위 클래스 문제). 예를 들어 `HashSet`을 상속해 `add`·`addAll`을 재정의해 개수를 세면, `addAll`이 내부에서 `add`를 부르는 구현 때문에 두 번 세어진다. **컴포지션**은 기존 클래스를 필드로 갖고 필요한 메서드만 넘겨(forwarding) 쓴다. 구현이 아니라 공개 API에만 기대므로 덜 깨진다. 「is-a」가 분명할 때만 상속하고, 기능을 빌려 쓰려면 컴포지션을 쓴다. Kotlin은 이를 `by`로 문법에 넣었다([[kotlin-delegation|위임 패턴과 Kotlin by]]).

## 래퍼 클래스와 오토박싱

Java의 기본형은 8개이고, 크기가 플랫폼과 상관없이 명세로 고정돼 있다(C와 다른 점이다).

| 기본형 | 크기 | 필드 기본값 | 래퍼 클래스 |
| --- | --- | --- | --- |
| `byte` | 1바이트 | `0` | `Byte` |
| `short` | 2바이트 | `0` | `Short` |
| `int` | 4바이트 | `0` | `Integer` |
| `long` | 8바이트 | `0L` | `Long` |
| `float` | 4바이트 | `0.0f` | `Float` |
| `double` | 8바이트 | `0.0d` | `Double` |
| `char` | 2바이트(UTF-16 코드 단위, 부호 없음) | `'\u0000'` | `Character` |
| `boolean` | 명세상 크기 미정 | `false` | `Boolean` |

- 기본값은 **필드와 배열 원소**에만 자동으로 들어간다. 지역 변수는 대입 전에 읽으면 컴파일 오류다.
- 정수 리터럴은 `int`, 실수 리터럴은 `double`이 기본이라 `long`·`float`는 `10L`, `3.14f`처럼 접미사를 붙인다.

기본형을 객체로 감싼 것이 래퍼 클래스다. 제네릭과 컬렉션은 객체만 담으므로 `List<int>`는 안 되고 `List<Integer>`를 쓴다. Java 5부터 컴파일러가 둘 사이를 자동으로 바꿔 준다.

```java
List<Integer> list = new ArrayList<>();
list.add(1);            // 오토박싱: Integer.valueOf(1)
int x = list.get(0);    // 언박싱: intValue()
```

| 함정 | 이유 |
| --- | --- |
| `Integer` 끼리 `==` 비교 | 객체 주소 비교다. `Integer.valueOf`는 **-128~127만 캐시**해 그 범위에서만 우연히 `true`가 된다. 값 비교는 `equals` |
| `null` 언박싱 | `Integer n = null; int m = n;`은 `NullPointerException` |
| 반복문 안 박싱 | `Long sum`에 더하면 매번 객체가 생긴다. 계산에는 기본형을 쓴다 |

## 제네릭

제네릭은 타입을 매개변수로 받아 **컴파일 시점에 타입을 검사**한다. 꺼낼 때 형 변환이 필요 없고, 잘못된 타입을 넣으면 컴파일 오류가 난다.

- **타입 소거(type erasure)**: 타입 인자는 컴파일 뒤 지워지고 바이트코드에는 `Object`(또는 상한 타입)로 남는다. 그래서 실행 중에 `List<String>`과 `List<Integer>`를 구분할 수 없고, `new T()`, `T[]` 생성, `instanceof List<String>`이 안 된다.
- **와일드카드**: `List<? extends Number>`는 읽기 전용(생산자), `List<? super Integer>`는 쓰기용(소비자)이다. 「Producer Extends, Consumer Super(PECS)」로 외운다.
- 제네릭은 **불공변**이다. `Integer`가 `Number`의 하위 타입이어도 `List<Integer>`는 `List<Number>`의 하위 타입이 아니다.

## 리플렉션, 어노테이션, 동적 프록시

### 리플렉션

**리플렉션(reflection)은 실행 중에 클래스의 구조(필드, 메서드, 생성자, 어노테이션)를 조회하고, 이름만으로 객체를 만들거나 메서드를 호출하는 API다.** 각 클래스는 로딩될 때 `Class` 객체가 만들어지고, 리플렉션은 이 메타데이터를 읽는다.

```java
Class<?> c = Class.forName("com.example.UserService");
Object svc = c.getDeclaredConstructor().newInstance();
Method m = c.getMethod("find", long.class);
Object user = m.invoke(svc, 1L);
Field f = c.getDeclaredField("repo"); f.setAccessible(true);   // private 접근
```

- **쓰는 곳**: 컴파일 시점에 모르는 클래스를 다뤄야 하는 프레임워크다. Spring의 의존성 주입과 빈 생성, JPA의 엔티티 매핑, Jackson의 직렬화, JUnit의 `@Test` 메서드 탐색, IDE·디버거가 그렇다.
- **비용과 위험**: 컴파일 시점 타입 검사가 사라져 오류가 실행 중에 난다. 직접 호출보다 느리고(JIT 최적화가 덜 된다), `private`을 열어 캡슐화를 깬다. 모듈 시스템은 `opens`하지 않은 패키지의 깊은 리플렉션을 막는다([[modern-java-features|모던 Java 기능]]). 애플리케이션 코드에서는 인터페이스와 다형성으로 풀 수 있으면 리플렉션을 쓰지 않는다.
- 반복 호출이 많으면 `MethodHandle`(`java.lang.invoke`)이 JIT에 더 잘 최적화된다.

### 어노테이션

어노테이션은 코드에 붙이는 **메타데이터**다. 그 자체로는 동작하지 않고, 컴파일러·어노테이션 프로세서·프레임워크가 읽어서 의미를 부여한다(`@Override`, `@Deprecated`, Spring의 `@Transactional`, JPA의 `@Entity`). 어노테이션 타입은 컴파일되면 `java.lang.annotation.Annotation`을 상속한 인터페이스가 된다.

| `@Retention` | 남는 곳 | 읽는 쪽 |
| --- | --- | --- |
| `SOURCE` | 소스에만. 컴파일 뒤 사라진다 | 컴파일러, Lombok 같은 어노테이션 프로세서 |
| `CLASS`(기본값) | 클래스 파일까지. 실행 중에는 없다 | 바이트코드 도구 |
| `RUNTIME` | 실행 중에도 남는다 | 리플렉션으로 읽는 프레임워크(Spring, JPA, Jackson) |

커스텀 어노테이션은 `@interface`로 선언하고 메타 어노테이션으로 성질을 정한다.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)            // 붙일 수 있는 위치: TYPE, FIELD, METHOD, PARAMETER ...
public @interface Retry {
    int times() default 3;             // 요소는 매개변수 없는 메서드 모양. 기본형·String·enum·Class·어노테이션·이들의 배열만
}

for (Method m : target.getClass().getMethods()) {
    Retry r = m.getAnnotation(Retry.class);          // 리플렉션으로 읽는다
    if (r != null) runWithRetry(m, r.times());
}
```

`@Inherited`는 클래스 어노테이션을 하위 클래스가 물려받게 하고, `@Repeatable`은 같은 어노테이션을 여러 번 붙이게 한다. 실행 중 리플렉션 대신 **컴파일 시점**에 처리하려면 `javax.annotation.processing.Processor`(어노테이션 프로세서)를 만든다. 프로세서는 새 소스 파일을 생성할 수 있어 MapStruct, Dagger, QueryDSL이 이 방식으로 코드를 만든다(Lombok은 기존 AST를 고치는 비공식 방식이다).

### 동적 프록시

**동적 프록시는 실행 중에 인터페이스 구현 클래스를 만들어, 모든 메서드 호출을 한 처리기로 가로채는 장치다.** 로깅, 트랜잭션, 권한 검사처럼 여러 메서드에 같은 앞뒤 처리를 붙일 때 메서드마다 프록시 클래스를 손으로 짜지 않게 한다.

```java
UserService proxy = (UserService) Proxy.newProxyInstance(
    UserService.class.getClassLoader(),
    new Class<?>[] { UserService.class },
    (p, method, args) -> {                         // InvocationHandler
        long t = System.nanoTime();
        try { return method.invoke(target, args); }  // 실제 객체에 위임
        finally { log(method.getName(), System.nanoTime() - t); }
    });
```

| 방식 | 원리 | 제약 |
| --- | --- | --- |
| JDK 동적 프록시(`java.lang.reflect.Proxy`) | 지정한 **인터페이스**를 구현하는 클래스를 실행 중 생성하고, 모든 호출을 `InvocationHandler.invoke`로 보낸다 | 인터페이스가 있어야 한다 |
| 바이트코드 생성(CGLIB, ByteBuddy) | 대상 **클래스를 상속**한 하위 클래스를 생성해 메서드를 오버라이딩한다 | `final` 클래스·메서드는 가로채지 못한다 |

Spring AOP는 둘 중 하나로 빈을 프록시로 감싸 `@Transactional`을 구현한다(Spring Boot는 기본으로 클래스 기반). 프록시는 **바깥에서 들어오는 호출만** 가로채므로, 같은 객체 안에서 `this.other()`로 부른 메서드에는 트랜잭션이 걸리지 않는다(자기 호출 문제). 횡단 관심사의 개념은 [[interceptor-aop|인터셉터와 AOP]]에 있다.

## 컬렉션 프레임워크

컬렉션 프레임워크는 여러 데이터를 다루는 표준 인터페이스(`List`, `Set`, `Queue`/`Deque`, `Map`)와 구현체 묶음이다. 배열과는 이렇게 다르다.

| 비교 | 배열 `int[]`, `String[]` | 컬렉션 `List<Integer>` |
| --- | --- | --- |
| 크기 | 생성할 때 고정. 늘리려면 새 배열에 복사한다 | 원소를 넣고 빼면 알아서 늘고 준다 |
| 원소 타입 | 기본형도 담는다 | 객체만 담는다(기본형은 오토박싱) |
| 길이 | `arr.length` (필드) | `list.size()` (메서드) |
| 타입 검사 | 공변이라 `Object[] o = new String[1]; o[0] = 1;`이 실행 중 `ArrayStoreException` | 제네릭이 컴파일 시점에 막는다 |
| 기능 | 인덱스 접근뿐. 정렬·검색은 `java.util.Arrays` 유틸리티로 | 삽입·삭제·포함 검사·반복자(`Iterator`)를 메서드로 제공 |

`Map`은 `Collection`을 상속하지 않는 별도 계층이다. 키 중복은 허용하지 않고 값 중복은 허용한다. 인터페이스 계층과 `ArrayList`·`LinkedList` 같은 구현체 고르는 기준은 [[data-structures|기초 자료구조]]의 Java 컬렉션 절에, `HashMap`의 해시 충돌 처리와 트리화는 [[hash-table|해시 테이블]]에 있다. `HashSet`은 내부적으로 값만 키로 쓰는 `HashMap`이다. 여러 스레드가 함께 쓰는 컬렉션(`ConcurrentHashMap` 등)과 `synchronized`·`volatile`·`ThreadLocal`은 [[java-concurrency|Java 동시성]]에 있다.

Java 8 이후 언어 기능(`record`, `sealed`, `var`, 패턴 매칭, 모듈)과 LTS 버전별 기능 표는 [[modern-java-features|모던 Java 기능]]에 있다.

## 정리

- 접근 제어자는 `public` > `protected` > package-private > `private` 순으로 좁아지고, 모듈은 패키지 단위로 한 번 더 막는다
- `final`은 고정, `finally`는 정리 블록, `finalize`는 제거 예정이라 쓰지 않는다
- 오버로딩은 컴파일 시점 정적 타입, 오버라이딩은 실행 시점 실제 타입으로 고른다
- `equals`를 재정의하면 `hashCode`도 함께 재정의한다. 문자열 리터럴은 상수 풀에서 공유된다
- 래퍼 객체는 `equals`로 비교하고 `null` 언박싱을 조심한다. 제네릭은 컴파일 때만 있고 실행 중에는 소거된다
- Java는 참조도 값으로 넘긴다. 반복문 문자열 조립은 `StringBuilder`, 기능 재사용은 상속보다 컴포지션
- `static`은 클래스에 속한 공유 멤버다. 상수가 아니면 전역 상태처럼 조심하고, `static final` 상수는 쓰는 쪽에 인라이닝된다
- 리플렉션은 실행 중 구조를 읽는 프레임워크용 도구이고, 동적 프록시는 인터페이스 호출을 가로채 횡단 관심사를 붙인다

관련 노트: [[jvm-internals|JVM 내부 구조]], [[java-concurrency|Java 동시성]], [[modern-java-features|모던 Java 기능]], [[java-idioms|Java 실무 관용구]], [[java-coding-convention|Java 코딩 컨벤션]], [[spring-singleton-thread-safety|싱글톤 빈과 스레드 안전성]], [[abstract-class-vs-interface|추상 클래스와 인터페이스]], [[singleton-pattern|싱글턴 패턴]], [[java-io-streams|Java 입출력 스트림]], [[java-swing-gui|Java Swing GUI]]
