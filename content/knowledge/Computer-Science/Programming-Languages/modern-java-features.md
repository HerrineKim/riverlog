---
title: "모던 Java 기능: 모듈, var, record, sealed, 패턴 매칭, switch 식"
concept: "Modern Java"
summary: "Java 9 이후 LTS 버전에 들어온 언어 기능을 정리한다. LTS별 주요 기능 표, 모듈 시스템의 requires·exports·opens와 강한 캡슐화, var의 지역 타입 추론과 제약, 불변 데이터 운반 클래스 record, 상속을 닫는 sealed, instanceof·switch·레코드 패턴 매칭, 화살표 문법과 yield·완전성 검사를 갖춘 switch 식, 처음과 끝 접근을 통일한 Sequenced Collections."
tags: ["java", "backend", "oop", "type-system"]
source: other
date: "2026-10-30"
sources: ["https://github.com/gyoogle/tech-interview-for-developer/blob/master/Language/%5Bjava%5D%20Java%20major%20feature%20changes.md", "https://github.com/fru1tworld/cs-basic/blob/main/interview/etc/java.md", "https://openjdk.org/jeps/261", "https://openjdk.org/jeps/286", "https://openjdk.org/jeps/361", "https://openjdk.org/jeps/395", "https://openjdk.org/jeps/409", "https://openjdk.org/jeps/431", "https://openjdk.org/jeps/440", "https://openjdk.org/jeps/441", "https://openjdk.org/jeps/456", "https://javaalmanac.io/"]
---

> gyoogle의 「[tech-interview-for-developer](https://github.com/gyoogle/tech-interview-for-developer)」 Java 버전별 기능 문서와 fru1tworld/cs-basic 모의 면접 질문 목록을 바탕으로, 각 기능의 OpenJDK JEP로 확인해 재구성한 노트다.

언어 기본 문법은 [[java-language-basics|Java 언어 기본]]에, 가상 스레드는 [[java-concurrency|Java 동시성]]에, 합 타입과 완전성 검사의 이론은 [[type-systems|타입 시스템]]에 있다.

## LTS 버전별 주요 기능

Java는 6개월마다 새 버전을 내고 2년마다 LTS를 지정한다. 대부분의 조직은 LTS만 쓴다. 기능은 프리뷰(preview)로 몇 차례 다듬은 뒤 정식이 된다.

| 버전 | 주요 기능 |
| --- | --- |
| 8 (2014) | 람다, 스트림, 함수형 인터페이스, `Optional`, 인터페이스 `default`·`static` 메서드, `java.time`. PermGen을 없애고 Metaspace 도입 |
| 11 (2018) | 9~11의 모듈 시스템, `var`(지역 변수 타입 추론), 불변 컬렉션 팩터리(`List.of`), 표준 `HttpClient`(HTTP/2), `String`의 `isBlank`·`strip`·`lines`. 9부터 기본 GC가 G1 |
| 17 (2021) | `record`, `sealed` 클래스, `switch` 식, 텍스트 블록(`"""`), `instanceof` 패턴 매칭, JDK 내부 API 강한 캡슐화 |
| 21 (2023) | 가상 스레드, `switch` 패턴 매칭과 레코드 패턴, Sequenced Collections, 세대별 ZGC |
| 25 (2025) | `ScopedValue`, 모듈 import 선언, 단순한 소스 파일과 인스턴스 `main`(클래스 선언 없이 실행), 생성자 본문에서 `super()` 앞에 문장 쓰기, 압축 객체 헤더 |

22에서 이름 없는 변수와 패턴(`_`)이 정식이 됐다. 버전별 기능·상태는 [The Java Version Almanac](https://javaalmanac.io/)에서 찾는다.

## 모듈 시스템 (Java 9)

**모듈은 패키지 묶음에 이름을 붙이고, 무엇에 의존하고 무엇을 공개하는지를 `module-info.java`에 선언하는 단위다(JEP 261, Project Jigsaw).** 클래스패스는 모든 JAR의 `public` 클래스를 평평하게 섞어 놓아, 내부용 패키지도 누구나 쓸 수 있었고 의존 누락은 실행 중 `NoClassDefFoundError`로야 드러났다.

```java
module com.example.order {
    requires com.example.payment;          // 의존 모듈
    requires transitive java.sql;          // 내 모듈을 쓰는 쪽에도 의존을 전달
    exports com.example.order.api;         // 이 패키지만 공개(컴파일·실행 접근)
    opens com.example.order.model to com.fasterxml.jackson.databind;  // 리플렉션 접근만 허용
    uses com.example.spi.Plugin;           // ServiceLoader로 구현을 찾는다
}
```

| 해결한 문제 | 방법 |
| --- | --- |
| 신뢰할 수 있는 구성 | 시작할 때 모듈 그래프를 검사해 빠진 모듈, 같은 패키지를 가진 두 모듈(split package), 순환 의존을 거부한다 |
| 강한 캡슐화 | `exports`하지 않은 패키지는 `public` 클래스라도 바깥에서 못 쓴다. `opens`하지 않으면 리플렉션으로도 못 연다 |
| 작은 런타임 | JDK 자체를 약 70개 모듈로 나눠 `jlink`로 필요한 모듈만 담은 런타임 이미지를 만든다 |

- 모듈이 아닌 JAR는 클래스패스의 **이름 없는 모듈**로, 모듈 경로에 둔 일반 JAR는 **자동 모듈**로 다뤄 점진적으로 옮길 수 있다.
- Java 17부터 JDK 내부 API(`sun.misc` 일부 제외)가 강하게 캡슐화돼, 내부 필드를 리플렉션으로 열던 라이브러리는 `--add-opens`가 필요하다. 애플리케이션 코드 대부분은 여전히 클래스패스로 돌고, 모듈 선언은 주로 라이브러리와 JDK가 쓴다.
- Java 25의 모듈 import 선언 `import module java.base;`는 모듈이 공개한 패키지를 한 줄로 가져온다.

## var: 지역 변수 타입 추론 (Java 10)

**`var`는 초기화 식에서 지역 변수의 타입을 컴파일러가 추론하게 하는 예약된 타입 이름이다.** 동적 타입이 아니다. 컴파일 뒤 타입은 고정되고 바이트코드는 명시적 타입과 같다.

```java
var list = new ArrayList<String>();     // ArrayList<String>
for (var entry : map.entrySet()) { }    // 반복 변수에도 쓴다
try (var in = Files.newInputStream(p)) { }
```

| 쓸 수 없는 곳 | 이유 |
| --- | --- |
| 필드, 메서드 매개변수, 반환 타입 | 지역 변수 전용이다. API의 타입은 명시적이어야 한다 |
| 초기화 없는 선언 `var x;`, `var x = null;` | 추론할 식이 없거나 타입이 null뿐이다 |
| 배열 초기화자 `var a = {1, 2};`, 람다·메서드 참조 `var f = () -> 1;` | 대상 타입 없이는 타입이 정해지지 않는다 |

- 람다 매개변수에는 Java 11부터 `(var x, var y) -> ...`로 쓸 수 있어 어노테이션을 붙일 수 있다.
- `var`는 키워드가 아니라서 변수 이름으로는 여전히 쓸 수 있지만 클래스 이름으로는 못 쓴다.
- `var list = new ArrayList<>();`는 `ArrayList<Object>`가 된다. 오른쪽에서 타입이 잘 보일 때만 쓰고, `var result = service.process();`처럼 타입이 숨으면 명시한다.

## record (Java 16)

**`record`는 불변 데이터를 운반하는 클래스를 한 줄로 선언하는 문법이다.** 컴포넌트를 적으면 `private final` 필드, 정식 생성자, 컴포넌트 이름과 같은 접근자(`name()`), 컴포넌트 기준의 `equals`·`hashCode`·`toString`이 생긴다.

```java
public record Money(BigDecimal amount, Currency currency) {
    public Money {                                   // 간결한 생성자: 검증만 쓴다
        if (amount.signum() < 0) throw new IllegalArgumentException();
    }
    public Money plus(Money o) { return new Money(amount.add(o.amount), currency); }
}
```

- 암묵적으로 `final`이라 상속할 수 없고, `java.lang.Record`를 상속하므로 다른 클래스를 상속할 수 없다. 인터페이스 구현, static 필드, 메서드 추가는 된다. 인스턴스 필드는 추가할 수 없다.
- **얕은 불변**이다. 컴포넌트가 `List`면 리스트 내용은 바뀔 수 있으므로 생성자에서 `List.copyOf`로 방어 복사한다.
- 맞는 곳: DTO, 값 객체, 메서드의 여러 반환값, 맵의 복합 키, 합 타입의 각 경우([[dto-vo-dao-repository|DTO와 VO]]). JPA 엔티티처럼 가변·프록시가 필요한 곳에는 맞지 않는다. Jackson은 record를 기본 지원한다.

## sealed 클래스 (Java 17)

**`sealed`는 어떤 클래스·인터페이스를 상속할 수 있는 하위 타입을 `permits`로 닫아 두는 선언이다.** `final`은 상속을 전부 막고, 일반 클래스는 전부 열어 두는데, sealed는 그 사이에서 「이 목록만」을 표현한다.

```java
public sealed interface Payment permits Card, Transfer, Point {}
public record Card(String number) implements Payment {}
public record Transfer(String bank) implements Payment {}
public non-sealed class Point implements Payment {}   // 여기서부터 다시 연다
```

- 하위 타입은 `final`, `sealed`, `non-sealed` 중 하나를 선언해야 한다.
- **필요한 이유**: 도메인의 경우가 정해져 있다는 사실을 타입에 담는다. 그러면 컴파일러가 경우의 목록을 알아 `switch`에서 **완전성 검사**를 할 수 있다. sealed 인터페이스 + record 조합이 Java에서 합 타입을 만드는 방법이다.
- 라이브러리가 공개 상위 타입을 외부에서 함부로 구현하지 못하게 막는 데도 쓴다.

## 패턴 매칭

| 단계 | 버전 | 기능 |
| --- | --- | --- |
| `instanceof` 패턴 | 16 | `if (obj instanceof String s && s.length() > 3)`: 검사와 형 변환, 변수 선언을 한 번에 |
| `switch` 패턴 | 21 | `case Circle c ->`처럼 타입으로 분기, `case null`, 가드 `when` |
| 레코드 패턴 | 21 | `case Point(int x, int y) ->`: 레코드를 컴포넌트로 분해, 중첩 가능 |
| 이름 없는 패턴 | 22 | 쓰지 않는 컴포넌트는 `_`로 버린다 |
| 기본형 패턴 | 프리뷰 | `case int i when i > 100` 같은 기본형 타입 패턴(Java 25 기준 프리뷰) |

```java
double area(Shape s) {
    return switch (s) {
        case Circle c                 -> Math.PI * c.r() * c.r();
        case Rect(double w, double h) -> w * h;
        case Square(var side) when side < 0 -> throw new IllegalArgumentException();
        case Square(var side)         -> side * side;
    };   // Shape가 sealed면 default 없이도 완전하다
}
```

`Shape`에 새 하위 타입을 더하면 이 `switch`가 컴파일 오류로 알려 준다. 타입 분기를 다형성(메서드 오버라이딩) 대신 패턴 매칭으로 쓰는 것은 데이터와 연산을 분리하는 선택이다. 연산이 자주 늘고 경우가 고정된 도메인에 맞다.

## switch 식과 switch 문 (Java 14)

| 비교 | 기존 switch 문 | switch 식(expression) |
| --- | --- | --- |
| 결과 | 값을 내지 않는다. 변수에 대입하려면 각 `case`에서 따로 대입한다 | **값을 낸다.** `int n = switch (d) { ... };` |
| 문법 | `case A:` + `break` | `case A, B ->` 화살표. 여러 값을 쉼표로 묶는다 |
| fallthrough | `break`를 빠뜨리면 다음 `case`로 넘어간다 | 화살표 문법에는 없다 |
| 블록에서 값 내기 | - | `{ ...; yield value; }` |
| 완전성 | 검사하지 않는다 | 모든 경우를 다뤄야 컴파일된다. enum·sealed 타입은 `default` 없이도 완전할 수 있다 |
| 대상 타입 | 정수형, `char`, `String`, enum | 같은 타입 + 21부터 모든 참조 타입(패턴) |

```java
int days = switch (month) {
    case FEB -> leap ? 29 : 28;
    case APR, JUN, SEP, NOV -> 30;
    default -> { log(month); yield 31; }
};
```

화살표 문법은 문(statement)으로 쓰는 `switch`에도 쓸 수 있어 fallthrough 실수를 없앤다. C 계열 switch의 fallthrough 함정은 [[cpp-basics|C++ 기초 문법]]에 있다.

## Sequenced Collections (Java 21)

**`SequencedCollection`·`SequencedSet`·`SequencedMap`은 순서가 정해진 컬렉션에 처음·끝 원소 접근과 역순 보기를 통일한 인터페이스다(JEP 431).**

| 이전 | 문제 |
| --- | --- |
| `list.get(0)`, `list.get(list.size() - 1)` | 장황하고 빈 리스트에서 예외 종류가 다르다 |
| `deque.getFirst()`, `sortedSet.first()`, `linkedHashSet.iterator().next()` | 타입마다 메서드 이름이 달랐다. `LinkedHashSet`은 마지막 원소를 얻는 방법이 없었다 |
| 역순 순회 | `List`는 `ListIterator`, `Deque`는 `descendingIterator`, `NavigableSet`은 `descendingSet`으로 제각각 |

```java
interface SequencedCollection<E> extends Collection<E> {
    SequencedCollection<E> reversed();   // 복사가 아닌 역순 뷰
    void addFirst(E e); void addLast(E e);
    E getFirst(); E getLast();
    E removeFirst(); E removeLast();
}
```

`List`, `Deque`, `LinkedHashSet`, `SortedSet`이 이 계층에 들어갔고, `LinkedHashMap`·`SortedMap`은 `SequencedMap`(`firstEntry`, `pollLastEntry`, `putFirst`, `sequencedKeySet`)이 됐다. 불변 컬렉션에서 변경 메서드를 부르면 `UnsupportedOperationException`이다. 컬렉션 계층 전체는 [[data-structures|기초 자료구조]]에 있다.

## 정리

- 모듈은 `requires`·`exports`·`opens`로 의존과 공개 범위를 선언해 구성 오류를 시작 시점에 잡고 내부를 강하게 숨긴다.
- `var`는 지역 변수 전용 정적 추론이고 초기화 식이 반드시 필요하다.
- `record`는 얕은 불변 데이터 운반 클래스, `sealed`는 하위 타입 목록을 닫는다. 둘을 합치면 합 타입이 된다.
- 패턴 매칭과 switch 식은 sealed 타입에 대해 `default` 없는 완전성 검사를 해 준다.
- Sequenced Collections는 순서 있는 컬렉션의 처음·끝·역순 접근을 하나로 통일했다.

관련 노트: [[java-language-basics|Java 언어 기본]], [[java-concurrency|Java 동시성]], [[jvm-internals|JVM 내부 구조]], [[type-systems|타입 시스템]], [[kotlin-basics|Kotlin 핵심 문법]], [[dto-vo-dao-repository|DTO와 VO]]
