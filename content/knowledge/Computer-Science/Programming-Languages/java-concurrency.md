---
title: "Java 동시성: 메모리 모델, 동기화, 스레드 풀, 가상 스레드"
concept: "Java Concurrency"
summary: "Java에서 여러 스레드가 안전하게 협력하는 방법을 정리한다. happens-before로 정의되는 Java 메모리 모델, synchronized와 고유 락·wait/notify, volatile·Atomic·Lock의 보장 차이, 스레드 안전 컬렉션과 ConcurrentHashMap, ThreadLocal과 ScopedValue, ThreadPoolExecutor의 매개변수와 거부 정책, 작업 훔치기로 도는 Fork/Join, 가상 스레드가 플랫폼 스레드와 다른 점과 쓰는 법."
tags: ["java", "concurrency", "backend", "jvm"]
source: other
date: "2026-10-30"
sources: ["https://github.com/jbee37142/Interview_Question_for_Beginner/blob/main/Java/README.md", "https://github.com/4z7l/tech_interview.zip/blob/main/%EC%A7%81%EB%AC%B4/JAVA.md", "https://github.com/gyoogle/tech-interview-for-developer/blob/master/Language/%5BJava%5D%20Intrinsic%20Lock.md", "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html", "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html", "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html", "https://openjdk.org/jeps/444", "https://openjdk.org/jeps/491", "https://openjdk.org/jeps/506", "https://github.com/fru1tworld/cs-basic/blob/main/interview/etc/java.md"]
---

> jbee의 「[Interview Question for Beginner](https://github.com/jbee37142/Interview_Question_for_Beginner)」, 4z7l의 「[tech_interview.zip](https://github.com/4z7l/tech_interview.zip)」, gyoogle의 「[tech-interview-for-developer](https://github.com/gyoogle/tech-interview-for-developer)」 Java 문서와 fru1tworld/cs-basic 모의 면접 질문 목록을 바탕으로, Java 언어 명세(17장)와 java.util.concurrent 문서, OpenJDK JEP로 확인해 재구성한 노트다.

동시성·병렬·비동기의 개념 구분과 런타임별 스케줄링은 [[concurrency-models|동시성·병렬·비동기·논블로킹과 동시성 모델]]에, 락·세마포어·모니터의 일반 원리는 [[process-synchronization|프로세스 동기화]]에, `CompletableFuture`는 [[java-idioms|Java 실무 관용구]]에 있다.

## Java 메모리 모델

**Java 메모리 모델(JMM)은 한 스레드의 쓰기가 다른 스레드의 읽기에 언제 보이는지를 정한 규칙이다.** CPU 캐시, 저장 버퍼, 컴파일러·JIT의 명령 재배치 때문에 한 스레드가 쓴 값이 다른 스레드에 늦게 보이거나 순서가 바뀌어 보일 수 있다. JMM은 그런 최적화를 허용하되, 프로그래머가 **happens-before** 관계를 만들면 순서와 가시성을 보장한다.

| happens-before 규칙 | 뜻 |
| --- | --- |
| 프로그램 순서 | 한 스레드 안에서는 앞의 동작이 뒤의 동작보다 먼저다 |
| 모니터 락 | 어떤 락의 해제(unlock)는 같은 락의 이후 획득(lock)보다 먼저다 |
| volatile | volatile 변수 쓰기는 같은 변수의 이후 읽기보다 먼저다 |
| 스레드 시작·종료 | `t.start()` 이전 동작은 t 안의 동작보다, t 안의 동작은 `t.join()` 반환보다 먼저다 |
| 전이성 | A가 B보다, B가 C보다 먼저면 A가 C보다 먼저다 |
| final 필드 | 생성자가 끝나기 전에 `this`가 새지 않았다면, 객체 참조를 본 스레드는 생성자에서 쓴 final 필드 값을 본다 |

- 두 스레드가 같은 변수에 접근하고 하나 이상이 쓰기인데 그 사이에 happens-before가 없으면 **데이터 경쟁(data race)** 이다. 데이터 경쟁이 없는 프로그램은 순차적으로 일관된 것처럼 동작한다(DRF-SC 보장).
- **안전한 발행(safe publication)**: 다른 스레드에 객체를 넘길 때 volatile 필드, `final` 필드, 락, 동시성 컬렉션, static 초기화를 거치면 생성이 끝난 상태로 보인다. 그냥 일반 필드에 대입하면 반쯤 만든 객체가 보일 수 있다. [[singleton-pattern|DCL 싱글턴]]에 `volatile`이 필요한 이유다.

## synchronized와 고유 락

여러 스레드가 함께 쓰는 객체(싱글턴, Spring 빈)의 **필드에 요청별 상태를 두면 경쟁 상태**가 생긴다. 상태는 지역 변수·매개변수로 넘기는 것이 기본이다([[spring-singleton-thread-safety|싱글톤 빈과 스레드 안전성]]).

꼭 공유해야 하면 `synchronized`로 상호 배제한다. Java의 모든 객체는 **고유 락(intrinsic lock, 모니터 락)** 을 하나씩 갖고, `synchronized`는 그 락을 잡는다. 이미 그 락을 가진 스레드가 다시 들어가도 막히지 않는다(재진입, reentrancy). `count++`는 읽기·고치기·쓰기 세 단계라 원자적이지 않으므로 이런 보호가 필요하다. 메서드에 붙이면 그 인스턴스(`this`, `static`이면 클래스 객체) 전체를 잠그고, 블록으로 쓰면 지정한 객체로 지정한 구간만 잠근다. 잠그는 범위는 좁을수록 좋다.

고유 락에는 조건 대기 장치도 붙어 있다. `synchronized` 블록 안에서 `wait()`는 락을 놓고 잠들고, `notify()`는 그 객체에서 기다리는 스레드 하나를, `notifyAll()`은 모두를 깨운다. 깨어난 스레드는 락을 다시 얻은 뒤 이어서 실행하므로, 조건은 `if`가 아니라 **`while`로 다시 검사**한다(가짜 깨어남 대비). 생산자-소비자 같은 대기는 `BlockingQueue`나 `Lock`·`Condition`으로 쓰는 편이 안전하다.

## 동기화 도구 비교

| 도구 | 보장 | 맞는 곳 |
| --- | --- | --- |
| `synchronized` | 상호 배제 + 가시성. 블록을 나가면 자동으로 풀린다 | 여러 필드를 함께 바꾸는 임계 구역 |
| `ReentrantLock`, `ReadWriteLock`, `StampedLock` | 상호 배제 + 가시성. `tryLock`·시간 제한·인터럽트 가능한 대기·공정성 옵션·여러 `Condition` | 대기를 포기해야 하거나 읽기가 압도적으로 많을 때. `finally`에서 `unlock()`한다 |
| `volatile` | 쓰기가 다른 스레드에 **바로 보인다**(가시성)와 앞뒤 재배치 금지. **원자성은 보장하지 않는다** | 한 스레드가 쓰고 여럿이 읽는 상태 플래그(`running = false`), 안전한 발행 |
| `AtomicInteger`, `AtomicReference`, `LongAdder` | 잠금 없이 CAS(compare-and-swap)로 단일 변수의 원자적 갱신 | 카운터, 상태 전환. 경합이 심한 카운터는 셀을 나눠 더하는 `LongAdder` |
| `Semaphore`, `CountDownLatch`, `CyclicBarrier`, `Phaser` | 허용 개수 제한, 여러 스레드의 완료·도착 기다리기 | 동시 접근 수 제한, 작업 묶음 동기화 |

`volatile int count`에 `count++`를 해도 깨진다. 읽기와 쓰기 각각은 보이지만, 그 사이에 다른 스레드가 끼어들 수 있다. 원자성이 필요하면 `AtomicInteger.incrementAndGet()`이나 락을 쓴다.

## 스레드 안전 컬렉션

기본 구현체(`ArrayList`, `HashMap`)는 여러 스레드가 함께 고치면 깨진다(`HashMap`은 내부 구조가 손상되거나 갱신이 사라진다). 선택지는 세 단계다.

| 방식 | 예 | 특징 |
| --- | --- | --- |
| 옛 동기화 클래스 | `Vector`, `Hashtable`, `Stack` | 모든 메서드가 `synchronized`라 느리다. 새 코드에서는 쓰지 않는다 |
| 동기화 래퍼 | `Collections.synchronizedList/Map/Set` | 객체 전체에 잠금 하나. 순회할 때는 직접 `synchronized` 블록으로 감싸야 한다 |
| 동시성 컬렉션(`java.util.concurrent`) | `ConcurrentHashMap`, `CopyOnWriteArrayList`, `ConcurrentLinkedQueue`, `BlockingQueue` | 잠금을 잘게 나누거나 CAS를 써서 여러 스레드가 동시에 진행한다 |

**`ConcurrentHashMap`과 `HashMap`의 차이**:

| 비교 | `HashMap` | `ConcurrentHashMap` |
| --- | --- | --- |
| 스레드 안전 | 아니다 | 그렇다. 읽기는 잠그지 않는다 |
| 쓰기 방식 | - | 빈 버킷에는 CAS로 넣고, 이미 노드가 있으면 그 버킷의 첫 노드만 잠근다(Java 8부터). Java 7까지는 테이블을 세그먼트 16개로 나눠 세그먼트 단위로 잠갔다 |
| null 키·값 | 허용 | **허용하지 않는다.** `get`이 `null`이면 「없음」으로만 해석되게 하려는 것이다 |
| 순회 | 순회 중 다른 수정이 있으면 `ConcurrentModificationException`(fail-fast) | 예외 없이 순회 시점 전후의 상태 일부를 반영한다(weakly consistent) |
| `size()` | 정확하다 | 동시 수정 중에는 근삿값이다 |

`ConcurrentHashMap`이라도 「읽고 → 판단하고 → 쓰기」를 따로 호출하면 그 사이에 끼어들 수 있다. `putIfAbsent`, `computeIfAbsent`, `merge` 같은 **원자적 복합 연산**을 쓴다. 해시 버킷과 트리화 같은 `HashMap` 내부는 [[hash-table|해시 테이블]]에 있다.

## ThreadLocal과 ScopedValue

`ThreadLocal`은 **스레드마다 따로 보이는 변수**다. 같은 `ThreadLocal` 객체라도 `get()`은 현재 스레드가 `set()`한 값만 돌려준다. 각 `Thread` 객체가 `ThreadLocalMap`을 갖고 그 안에 `ThreadLocal`을 키로 값을 저장하는 구조다. 요청 단위 사용자 정보, 트랜잭션 컨텍스트(Spring의 `TransactionSynchronizationManager`, `SecurityContextHolder`)처럼 매개변수로 계속 넘기기 번거로운 값에 쓴다.

```java
private static final ThreadLocal<User> CURRENT = new ThreadLocal<>();

try {
    CURRENT.set(user);
    handle();                // 깊은 곳에서 CURRENT.get()
} finally {
    CURRENT.remove();        // 스레드 풀에서는 반드시 지운다
}
```

- 스레드 풀의 스레드는 재사용되므로 `remove()`를 빼먹으면 **다음 요청이 이전 사용자의 값을 본다.** 값이 남아 메모리 누수도 된다(맵의 키는 약한 참조지만 값은 강한 참조다).
- 비동기로 다른 스레드에 작업을 넘기면 값이 따라가지 않는다. `InheritableThreadLocal`은 자식 스레드 생성 시점에만 복사한다.
- 가상 스레드는 수백만 개가 생길 수 있어 스레드마다 큰 값을 두는 `ThreadLocal`이 부담이 된다. Java 25에서 정식이 된 **`ScopedValue`**(JEP 506)는 `ScopedValue.where(KEY, v).run(...)`의 범위 안에서만 보이는 불변 값을 넘긴다. 범위가 끝나면 사라지므로 지울 필요가 없다.

## 스레드 풀과 Executor 프레임워크

스레드를 작업마다 만들고 버리면 생성 비용이 크고 개수가 무한히 늘 수 있다. **Executor 프레임워크는 작업 제출(`Runnable`, `Callable`)과 실행 방식(스레드 풀)을 분리한다.**

| 인터페이스 | 역할 |
| --- | --- |
| `Executor` | `execute(Runnable)` 하나 |
| `ExecutorService` | `submit`으로 `Future`를 받고, `invokeAll`·`invokeAny`, `shutdown`·`awaitTermination`으로 생명주기를 관리한다. Java 19부터 `AutoCloseable`이라 try-with-resources로 종료를 기다린다 |
| `ScheduledExecutorService` | 지연·주기 실행 |

`Runnable`은 반환값이 없고 checked 예외를 던질 수 없다. `Callable<V>`는 값을 돌려주고 예외를 던질 수 있으며, `submit`은 `Future<V>`를 돌려준다. `Future.get()`은 블로킹이고 작업 중 예외는 `ExecutionException`으로 감싸져 나온다.

### ThreadPoolExecutor의 동작

```text
작업 제출
  ├─ 실행 중 스레드 < corePoolSize      → 새 스레드를 만들어 실행
  ├─ 아니면 큐에 넣을 수 있다            → 작업 큐에 대기
  ├─ 큐가 가득 찼고 스레드 < maximumPoolSize → 스레드를 더 만든다
  └─ 그것도 안 된다                     → 거부 정책(RejectedExecutionHandler)
corePoolSize를 넘는 스레드는 keepAliveTime 동안 놀면 종료된다
```

| 거부 정책 | 동작 |
| --- | --- |
| `AbortPolicy`(기본) | `RejectedExecutionException`을 던진다 |
| `CallerRunsPolicy` | 제출한 스레드가 직접 실행한다. 제출 속도가 자연히 느려진다(배압) |
| `DiscardPolicy` / `DiscardOldestPolicy` | 새 작업 / 가장 오래 기다린 작업을 버린다 |

- `Executors.newFixedThreadPool(n)`은 **크기 제한이 없는 큐**를 써서, 처리보다 제출이 빠르면 큐가 무한히 쌓여 메모리가 터진다. `newCachedThreadPool()`은 **스레드 수 제한이 없다.** 운영 코드는 큐 크기와 거부 정책을 직접 정한 `ThreadPoolExecutor`를 쓴다.
- 크기는 작업 성격으로 정한다. CPU 바운드는 코어 수 근처, I/O 바운드는 대기 비율만큼 더 크게 잡는다. I/O 바운드가 대부분이면 가상 스레드가 더 단순하다.
- 풀 안의 작업이 같은 풀의 다른 작업 결과를 기다리면 스레드가 모두 대기에 묶이는 교착(스레드 기아)이 생긴다.

### Fork/Join 프레임워크

**Fork/Join은 큰 작업을 재귀적으로 쪼개(fork) 병렬로 처리하고 결과를 합치는(join) 분할 정복용 풀이다.** `RecursiveTask<V>`(결과 있음)·`RecursiveAction`(없음)의 `compute()`에서 작업이 충분히 작으면 직접 계산하고, 크면 둘로 나눠 한쪽을 `fork()`하고 다른 쪽을 직접 계산한 뒤 `join()`한다.

```java
class Sum extends RecursiveTask<Long> {
    protected Long compute() {
        if (hi - lo <= 10_000) return sequentialSum();
        Sum left = new Sum(arr, lo, mid), right = new Sum(arr, mid, hi);
        left.fork();                          // 왼쪽은 다른 워커가 가져갈 수 있다
        return right.compute() + left.join(); // 오른쪽은 직접
    }
}
```

- **작업 훔치기(work stealing)**: 워커 스레드마다 양방향 덱(deque)을 갖는다. 자기 덱의 꼬리에서 작업을 꺼내 쓰고(LIFO, 캐시 지역성), 일이 없으면 다른 워커 덱의 머리에서 훔친다(FIFO, 큰 작업을 가져간다). 쪼갠 작업이 불균형해도 놀고 있는 스레드가 생기지 않는다.
- `join()`에서 기다리는 워커는 놀지 않고 다른 작업을 실행한다. 그래서 블로킹 I/O를 넣으면 이 설계가 무너진다.
- `ForkJoinPool.commonPool()`(병렬도는 코어 수 - 1)은 병렬 스트림과 `CompletableFuture`의 기본 실행기로 JVM 전체가 함께 쓴다. 가상 스레드의 캐리어 스케줄러도 별도의 `ForkJoinPool`이다.

## 가상 스레드

**가상 스레드(virtual thread)는 JVM이 관리하는 가벼운 `Thread`다(Java 21, JEP 444).** 플랫폼 스레드는 OS 스레드를 1:1로 감싼 것이고, 가상 스레드는 적은 수의 플랫폼 스레드(캐리어) 위에 M:N으로 올라간다. 블로킹 I/O·`sleep`·락 대기를 만나면 JVM이 가상 스레드의 스택을 힙에 내려놓고(unmount) 캐리어에 다른 가상 스레드를 올린다.

| 비교 | 플랫폼 스레드 | 가상 스레드 |
| --- | --- | --- |
| 구현 | OS 스레드 1:1 | JVM이 캐리어 위에 M:N 스케줄링 |
| 스택 | 생성 시 큰 고정 스택 예약(보통 1MB 안팎) | 힙에 필요한 만큼. 수백 바이트~수 KB |
| 개수 | 수천 개가 한계 | 수백만 개 |
| 생성 비용 | 비싸서 풀로 재사용한다 | 싸서 **작업마다 새로 만든다. 풀에 넣지 않는다** |
| 블로킹 | OS 스레드가 그대로 묶인다 | 캐리어를 놓아주므로 다른 작업이 진행된다 |
| 맞는 작업 | CPU 바운드 | 대기가 많은 I/O 바운드(요청당 스레드 서버) |

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (var req : requests) executor.submit(() -> handle(req));   // 블로킹 코드 그대로
}
Thread.ofVirtual().start(task);
```

**동시성 프로그래밍에서 달라지는 것**:

- **블로킹 코드로 다시 확장한다.** 콜백·`CompletableFuture` 체인·리액티브 스트림으로 스레드를 아끼던 코드를 순차적인 블로킹 코드로 써도 동시 연결 수가 늘어난다. 스택 트레이스와 디버거도 평소처럼 동작한다.
- **동시성 제한은 풀 크기가 아니라 `Semaphore`로 한다.** 스레드 수가 더는 자원 상한 역할을 하지 않으므로, DB 커넥션·외부 API 호출 수를 세마포어로 직접 제한한다.
- **CPU 바운드 작업은 빨라지지 않는다.** 캐리어 수(기본은 코어 수)만큼만 실제로 돈다.
- **고정(pinning)**: JNI 같은 네이티브 프레임 안에서 블로킹하면 가상 스레드가 캐리어에 묶인다. Java 21~23에서는 `synchronized` 안의 블로킹도 묶였지만 **Java 24(JEP 491)부터 해결**됐다. `-Djdk.tracePinnedThreads`나 JFR의 `jdk.VirtualThreadPinned` 이벤트로 찾는다.
- `ThreadLocal`에 큰 객체를 캐시하던 관용(예: 스레드마다 파서 하나)은 가상 스레드 수만큼 복제되므로 `ScopedValue`나 공유 객체로 바꾼다.
- 여러 하위 작업을 하나의 단위로 시작·취소·대기하는 구조적 동시성(`StructuredTaskScope`)은 Java 25 기준 아직 프리뷰다([[structured-concurrency|구조적 동시성]]).

이벤트 루프 서버와의 선택은 [[event-loop-server|비동기 서버의 이벤트 루프]]에, Spring에서 켜는 방법은 [[spring-singleton-thread-safety|싱글톤 빈과 스레드 안전성]]에 있다.

## 정리

- JMM은 happens-before로 가시성과 순서를 정한다. 락 해제→획득, volatile 쓰기→읽기, start·join이 그 관계를 만든다.
- `synchronized`·`Lock`은 상호 배제, `volatile`은 가시성만, Atomic은 단일 변수의 CAS 원자성이다.
- 공유 컬렉션은 `java.util.concurrent` 구현체와 원자적 복합 연산을 쓴다. `ConcurrentHashMap`은 버킷 단위로 잠그고 null을 받지 않는다.
- `ThreadLocal`은 `finally`에서 지우고, 가상 스레드에서는 `ScopedValue`를 고려한다.
- 스레드 풀은 큐 크기와 거부 정책을 정해 만든다. Fork/Join은 작업 훔치기로 분할 정복을 병렬화한다.
- 가상 스레드는 작업마다 만들고, 동시성 제한은 세마포어로 하며, I/O 바운드에만 이득이 있다.

관련 노트: [[java-language-basics|Java 언어 기본]], [[java-idioms|Java 실무 관용구]], [[jvm-internals|JVM 내부 구조]], [[concurrency-models|동시성 모델]], [[process-synchronization|프로세스 동기화]], [[event-loop-server|비동기 서버의 이벤트 루프]], [[structured-concurrency|구조적 동시성]], [[spring-singleton-thread-safety|싱글톤 빈과 스레드 안전성]]
