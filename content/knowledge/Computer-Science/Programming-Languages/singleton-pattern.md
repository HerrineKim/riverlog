---
title: "싱글턴 패턴"
concept: "Singleton"
summary: "인스턴스를 하나만 두는 싱글턴 패턴의 목적과 Java 구현 방식(이른 초기화, synchronized, DCL과 volatile, 홀더 클래스, enum)을 스레드 안전성과 비용으로 비교하고, 전역 상태가 되는 단점과 DI 컨테이너·모듈로 대신하는 방법을 정리한다."
tags: ["design-pattern", "java", "oop", "concurrency"]
source: other
date: "2026-10-30"
sources: ["https://github.com/jbee37142/Interview_Question_for_Beginner/blob/main/DesignPattern/README.md"]
---

> jbee의 「[Interview Question for Beginner](https://github.com/jbee37142/Interview_Question_for_Beginner)」 저장소 디자인 패턴 문서의 Singleton 절을 바탕으로, Java 메모리 모델 기준으로 확인해 재구성한 노트다.

## 싱글턴이란

싱글턴(Singleton)은 **클래스의 인스턴스를 프로그램 전체에서 하나만 만들고, 어디서나 그 하나에 접근하게 하는** 생성 패턴이다. 커넥션 풀, 스레드 풀, 설정 객체, 로거처럼 여러 개 만들면 자원을 낭비하거나 상태가 갈라져 버그가 나는 객체에 쓴다. GoF 23개 패턴의 전체 지도는 [[gof-design-patterns|GoF 디자인 패턴]]에 있다.

구현의 세 요소는 같다.

1. 생성자를 `private`으로 막아 밖에서 `new`를 못 하게 한다.
2. 유일한 인스턴스를 담을 `static` 필드를 둔다.
3. 그 인스턴스를 돌려주는 `static` 메서드(`getInstance()`)를 연다.

## Java 구현 방식

### 1. 지연 초기화 (스레드 안전하지 않음)

```java
public class Singleton {
    private static Singleton instance;
    private Singleton() {}
    public static Singleton getInstance() {
        if (instance == null) {          // 두 스레드가 동시에 통과할 수 있다
            instance = new Singleton();
        }
        return instance;
    }
}
```

두 스레드가 동시에 `null` 검사를 통과하면 인스턴스가 둘 생긴다. 단일 스레드에서만 맞다.

### 2. synchronized 메서드

`getInstance()`에 `synchronized`를 붙이면 안전하지만, 인스턴스가 이미 있는데도 **호출할 때마다 잠금**을 잡는다. 자주 불리면 병목이 된다.

### 3. DCL (Double-Checked Locking) + volatile

```java
public class Singleton {
    private static volatile Singleton instance;
    private Singleton() {}
    public static Singleton getInstance() {
        Singleton local = instance;
        if (local == null) {                       // 1차 검사: 잠금 없이
            synchronized (Singleton.class) {
                local = instance;
                if (local == null) {               // 2차 검사: 잠금 안에서
                    instance = local = new Singleton();
                }
            }
        }
        return local;
    }
}
```

인스턴스가 만들어진 뒤에는 잠금 없이 읽는다. **`volatile`이 빠지면 틀린 코드다.** `new`는 「메모리 할당 → 생성자 실행 → 참조 대입」인데, 컴파일러·CPU가 순서를 바꾸면 다른 스레드가 **생성자가 덜 끝난 객체의 참조**를 볼 수 있다. Java 5 이후의 메모리 모델에서 `volatile`은 쓰기 전의 동작이 읽는 쪽에 모두 보이도록(happens-before) 보장해 이 문제를 막는다. 지역 변수 `local`은 `volatile` 읽기 횟수를 줄이는 관용 표현이다.

### 4. 이른 초기화 (eager)

```java
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();
    private Singleton() {}
    public static Singleton getInstance() { return INSTANCE; }
}
```

클래스 초기화는 JVM이 한 번만, 스레드 안전하게 한다. 가장 단순하지만 쓰지 않아도 클래스가 로딩되면 만들어진다.

### 5. 홀더 클래스 (Initialization-on-demand holder)

```java
public class Singleton {
    private Singleton() {}
    private static class Holder {
        static final Singleton INSTANCE = new Singleton();
    }
    public static Singleton getInstance() { return Holder.INSTANCE; }
}
```

`Holder`는 `getInstance()`가 처음 불릴 때 초기화된다. **지연 초기화 + 잠금 없음 + 스레드 안전**을 클래스 로딩 규칙만으로 얻는다.

### 6. enum

```java
public enum Singleton {
    INSTANCE;
    public void doWork() { }
}
```

JVM이 enum 상수를 하나만 만들도록 보장하고, **직렬화·역직렬화와 리플렉션 공격에도 두 번째 인스턴스가 생기지 않는다.** 다른 클래스를 상속해야 하면 쓸 수 없다.

### 비교

| 방식 | 스레드 안전 | 지연 생성 | 호출 비용 | 비고 |
| --- | --- | --- | --- | --- |
| 지연 초기화 | X | O | 없음 | 단일 스레드 전용 |
| synchronized 메서드 | O | O | 매번 잠금 | 단순하지만 느리다 |
| DCL + volatile | O | O | 생성 뒤 volatile 읽기 | `volatile` 필수, 실수하기 쉽다 |
| 이른 초기화 | O | X | 없음 | 생성 비용이 작으면 충분하다 |
| 홀더 클래스 | O | O | 없음 | 클래스 기반 싱글턴의 기본 선택 |
| enum | O | X(클래스 로딩 때) | 없음 | 직렬화·리플렉션까지 안전하다 |

직렬화되는 클래스 싱글턴은 역직렬화 때 새 객체가 생기므로 `readResolve()`로 기존 인스턴스를 돌려줘야 한다. enum은 이 처리가 필요 없다.

## 단점과 대안

싱글턴은 사실상 **전역 상태**다.

| 문제 | 이유 |
| --- | --- |
| 테스트가 어렵다 | `getInstance()`를 직접 부르는 코드는 가짜 객체로 바꿔 끼울 수 없고, 테스트끼리 상태가 샌다 |
| 의존이 숨는다 | 생성자·매개변수에 드러나지 않아 무엇에 기대는지 보이지 않는다 |
| 동시성 위험 | 하나뿐인 객체의 필드를 여러 스레드가 고친다 |
| 클래스로더·프로세스마다 하나 | 「하나」의 범위가 JVM 전체가 아니다. 여러 서버로 늘리면 각자 하나씩이다 |

그래서 요즘은 클래스가 스스로 하나임을 지키기보다 **DI 컨테이너가 하나만 만들어 주입**하게 한다. Spring 빈의 기본 스코프가 싱글턴이고, 이때 빈을 상태 없이 짜는 법은 [[spring-singleton-thread-safety|싱글톤 빈과 스레드 안전성]]에 있다. JavaScript·Python에서는 **모듈이 한 번만 평가되므로** 모듈 최상위에서 만든 객체가 곧 싱글턴이다([[js-design-patterns|JavaScript 생성 패턴]], [[singleton-service-pattern|Express 싱글톤 패턴]]).

## 정리

- 싱글턴 = private 생성자 + static 인스턴스 + static 접근 메서드
- 멀티스레드에서 단순 지연 초기화는 인스턴스가 둘 생길 수 있다
- DCL은 `volatile` 없이는 반쯤 만들어진 객체를 노출한다
- 클래스로 만든다면 홀더 클래스, 직렬화까지 막으려면 enum이 기본 선택이다
- 테스트와 의존 관리를 위해 직접 구현보다 DI 컨테이너의 싱글턴 스코프를 먼저 고려한다

관련 노트: [[gof-design-patterns|GoF 디자인 패턴]], [[spring-singleton-thread-safety|싱글톤 빈과 스레드 안전성]], [[java-language-basics|Java 언어 기본]], [[process-synchronization|프로세스 동기화]]
