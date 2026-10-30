---
title: "Java 언어 기본: 접근 제어자에서 스레드 안전 컬렉션까지"
concept: "Java Basics"
summary: "Java 면접에서 자주 묻는 언어 기본기를 주제별로 정리한다. 접근 제어자, final·finally·finalize, 오버로딩과 오버라이딩, 업·다운캐스팅, ==·equals·hashCode와 문자열 상수 풀, 래퍼 클래스와 오토박싱, 제네릭과 타입 소거, 어노테이션의 보존 정책, 컬렉션 프레임워크와 스레드 안전 컬렉션, volatile·Atomic·Callable, ThreadLocal."
tags: ["java", "oop", "backend", "concurrency"]
source: other
date: "2026-10-30"
sources: ["https://github.com/jbee37142/Interview_Question_for_Beginner/blob/main/Java/README.md", "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html", "https://openjdk.org/jeps/421", "https://openjdk.org/jeps/506", "https://github.com/4z7l/tech_interview.zip/blob/main/%EC%A7%81%EB%AC%B4/JAVA.md"]
---

> jbee의 「[Interview Question for Beginner](https://github.com/jbee37142/Interview_Question_for_Beginner)」 저장소 Java 문서를 바탕으로, Java SE 공식 문서와 JEP로 확인해 재구성한 노트다.
> 업·다운캐스팅, 객체 비교와 문자열 상수 풀, volatile·Atomic·Callable은 4z7l의 「[tech_interview.zip](https://github.com/4z7l/tech_interview.zip)」 Java 문서를 바탕으로 보강했다.

JVM 구조와 GC는 [[jvm-internals|JVM 내부 구조]], Enum·Optional·예외 같은 실무 관용구는 [[java-idioms|Java 실무 관용구]], 코딩 규칙은 [[java-coding-convention|Java 코딩 컨벤션]]에 있다. 이 노트는 그 아래 깔린 언어 문법의 기본기를 다룬다.

## 접근 제어자

| 제어자 | 같은 클래스 | 같은 패키지 | 다른 패키지의 하위 클래스 | 그 밖 |
| --- | --- | --- | --- | --- |
| `public` | O | O | O | O |
| `protected` | O | O | O | X |
| (default, package-private) | O | O | X | X |
| `private` | O | X | X | X |

- 필드는 `private`으로 숨기고 필요한 동작만 메서드로 연다(캡슐화). 기본값은 「아무것도 안 쓴」 package-private이다.
- Java 9의 모듈 시스템(`module-info.java`)은 그 위에서 **패키지 단위로** 무엇을 `exports`할지 한 번 더 막는다. `public` 클래스라도 내보내지 않은 패키지에 있으면 모듈 밖에서 못 쓴다.

## final, finally, finalize

이름만 비슷한 세 가지다.

| 이름 | 종류 | 뜻 |
| --- | --- | --- |
| `final` 클래스 | 키워드 | 상속할 수 없다(`String`, 래퍼 클래스) |
| `final` 메서드 | 키워드 | 오버라이딩할 수 없다 |
| `final` 변수 | 키워드 | 한 번만 대입한다. 참조 변수면 **참조만 고정**되고 가리키는 객체의 내용은 바뀔 수 있다 |
| `finally` | 블록 | `try`의 정상 종료·예외와 상관없이 마지막에 실행된다. 자원 정리는 `try-with-resources`(`AutoCloseable`)가 더 안전하다 |
| `finalize()` | `Object`의 메서드 | GC가 객체를 회수하기 전에 부를 수도 있는 메서드. 호출 시점·실행 여부가 보장되지 않아 **Java 9에서 deprecated, Java 18(JEP 421)부터 제거 예정**이다. 대신 `try-with-resources`나 `java.lang.ref.Cleaner`를 쓴다 |

## 오버로딩과 오버라이딩

| 기준 | 오버로딩(overloading) | 오버라이딩(overriding) |
| --- | --- | --- |
| 무엇을 | 같은 이름, **다른 매개변수 목록**의 메서드를 여럿 만든다 | 상위 타입의 메서드를 하위 클래스가 **같은 시그니처로 다시 정의**한다 |
| 반환 타입 | 달라도 되지만 반환 타입만 다른 것은 안 된다 | 같거나 하위 타입(공변 반환) |
| 언제 결정되나 | **컴파일 시점**, 인자의 정적 타입으로 고른다 | **실행 시점**, 실제 객체의 타입으로 고른다(동적 바인딩) |
| 접근 제어자 | 상관없다 | 상위보다 좁힐 수 없다 |

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

## 래퍼 클래스와 오토박싱

기본형(`int`, `double`, `boolean` …)을 객체로 감싼 것이 래퍼 클래스(`Integer`, `Double`, `Boolean` …)다. 제네릭과 컬렉션은 객체만 담으므로 `List<int>`는 안 되고 `List<Integer>`를 쓴다. Java 5부터 컴파일러가 둘 사이를 자동으로 바꿔 준다.

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

## 어노테이션

어노테이션은 코드에 붙이는 **메타데이터**다. 그 자체로는 동작하지 않고, 컴파일러·어노테이션 프로세서·프레임워크가 읽어서 의미를 부여한다(`@Override`, `@Deprecated`, Spring의 `@Transactional`, JPA의 `@Entity`).

| `@Retention` | 남는 곳 | 읽는 쪽 |
| --- | --- | --- |
| `SOURCE` | 소스에만. 컴파일 뒤 사라진다 | 컴파일러, Lombok 같은 어노테이션 프로세서 |
| `CLASS`(기본값) | 클래스 파일까지. 실행 중에는 없다 | 바이트코드 도구 |
| `RUNTIME` | 실행 중에도 남는다 | 리플렉션으로 읽는 프레임워크(Spring, JPA, Jackson) |

`@Target`으로 붙일 수 있는 위치(클래스, 메서드, 필드, 매개변수)를 정한다.

## 컬렉션 프레임워크와 스레드 안전성

컬렉션 프레임워크는 여러 데이터를 다루는 표준 인터페이스(`List`, `Set`, `Queue`/`Deque`, `Map`)와 구현체 묶음이다. 인터페이스 계층과 구현체 고르는 기준은 [[data-structures|기초 자료구조]]의 Java 컬렉션 절에, `HashMap` 내부는 [[hash-table|해시 테이블]]에 있다. `HashSet`은 내부적으로 값만 키로 쓰는 `HashMap`이다.

여러 스레드가 같은 컬렉션을 고치면 기본 구현체(`ArrayList`, `HashMap`)는 깨진다. 선택지는 세 단계다.

| 방식 | 예 | 특징 |
| --- | --- | --- |
| 옛 동기화 클래스 | `Vector`, `Hashtable`, `Stack` | 모든 메서드가 `synchronized`라 느리다. 새 코드에서는 쓰지 않는다 |
| 동기화 래퍼 | `Collections.synchronizedList/Map/Set` | 객체 전체에 잠금 하나. 순회(iterator)할 때는 직접 `synchronized` 블록으로 감싸야 한다 |
| 동시성 컬렉션(`java.util.concurrent`, Java 5부터) | `ConcurrentHashMap`, `CopyOnWriteArrayList`, `ConcurrentLinkedQueue`, `BlockingQueue` | 잠금을 잘게 나누거나 CAS를 써서 동시에 여러 스레드가 진행한다. `ConcurrentHashMap`은 Java 8부터 버킷 단위 잠금 + CAS다 |

`ConcurrentHashMap`이라도 「읽고 → 판단하고 → 쓰기」를 따로 호출하면 그 사이에 끼어들 수 있다. `putIfAbsent`, `computeIfAbsent`, `merge` 같은 **원자적 복합 연산**을 쓴다.

### synchronized와 공유 필드

여러 스레드가 함께 쓰는 객체(싱글턴, Spring 빈)의 **필드에 요청별 상태를 두면 경쟁 상태**가 생긴다. 상태는 지역 변수·매개변수로 넘기는 것이 기본이다([[spring-singleton-thread-safety|싱글톤 빈과 스레드 안전성]]).

꼭 공유해야 하면 `synchronized`로 상호 배제한다. 메서드에 붙이면 그 인스턴스(`this`, `static`이면 클래스 객체) 전체를 잠그고, 블록으로 쓰면 지정한 객체로 지정한 구간만 잠근다. 잠그는 범위는 좁을수록 좋다.

### volatile, Atomic, 작업 인터페이스

| 도구 | 보장 | 맞는 곳 |
| --- | --- | --- |
| `volatile` | 쓰기가 다른 스레드에 **바로 보인다**(가시성)와 재배치 금지. 원자성은 보장하지 않아 `count++`는 여전히 깨진다 | 한 스레드가 쓰고 여럿이 읽는 플래그, [[singleton-pattern\|DCL 싱글턴]] |
| `synchronized`, `ReentrantLock` | 상호 배제 + 가시성 | 여러 필드를 함께 바꾸는 임계 구역 |
| `AtomicInteger`, `AtomicReference`, `LongAdder` | 잠금 없이 CAS(compare-and-swap)로 단일 변수의 원자적 갱신 | 카운터, 상태 전환. 경합이 심한 카운터는 `LongAdder` |

스레드에 넘기는 작업은 `Runnable`(반환값 없음, checked 예외를 던질 수 없음)과 `Callable<V>`(값을 돌려주고 예외를 던질 수 있음)이다. `ExecutorService.submit(callable)`은 `Future<V>`를 돌려주고, 결과를 조합하려면 [[java-idioms|CompletableFuture]]를 쓴다. Java 21부터는 I/O가 많은 작업에 `Executors.newVirtualThreadPerTaskExecutor()`로 가상 스레드를 쓴다.

### ThreadLocal

`ThreadLocal`은 **스레드마다 따로 보이는 변수**다. 같은 `ThreadLocal` 객체라도 `get()`은 현재 스레드가 `set()`한 값만 돌려준다. 요청 단위 사용자 정보, 트랜잭션 컨텍스트(Spring의 `TransactionSynchronizationManager`, `SecurityContextHolder`)처럼 매개변수로 계속 넘기기 번거로운 값에 쓴다.

```java
private static final ThreadLocal<User> CURRENT = new ThreadLocal<>();

try {
    CURRENT.set(user);
    handle();                // 깊은 곳에서 CURRENT.get()
} finally {
    CURRENT.remove();        // 스레드 풀에서는 반드시 지운다
}
```

- 스레드 풀의 스레드는 재사용되므로 `remove()`를 빼먹으면 **다음 요청이 이전 사용자의 값을 본다.** 값이 남아 메모리 누수도 된다.
- Java 21의 가상 스레드는 수백만 개가 생길 수 있어 스레드마다 큰 값을 두는 `ThreadLocal`이 부담이 된다. Java 25에서 정식이 된 **`ScopedValue`**(JEP 506)는 정해진 범위 안에서만 보이는 불변 값을 넘겨 이 문제를 줄인다.

## 정리

- 접근 제어자는 `public` > `protected` > package-private > `private` 순으로 좁아지고, 모듈은 패키지 단위로 한 번 더 막는다
- `final`은 고정, `finally`는 정리 블록, `finalize`는 제거 예정이라 쓰지 않는다
- 오버로딩은 컴파일 시점 정적 타입, 오버라이딩은 실행 시점 실제 타입으로 고른다
- `equals`를 재정의하면 `hashCode`도 함께 재정의한다. 문자열 리터럴은 상수 풀에서 공유된다
- 래퍼 객체는 `equals`로 비교하고 `null` 언박싱을 조심한다. 제네릭은 컴파일 때만 있고 실행 중에는 소거된다
- 공유 컬렉션은 `java.util.concurrent`의 구현체와 원자적 복합 연산을 쓰고, `ThreadLocal`은 `finally`에서 지운다

관련 노트: [[jvm-internals|JVM 내부 구조]], [[java-idioms|Java 실무 관용구]], [[java-coding-convention|Java 코딩 컨벤션]], [[spring-singleton-thread-safety|싱글톤 빈과 스레드 안전성]], [[abstract-class-vs-interface|추상 클래스와 인터페이스]], [[singleton-pattern|싱글턴 패턴]]
