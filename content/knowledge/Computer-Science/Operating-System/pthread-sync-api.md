---
title: "POSIX 스레드와 동기화 API"
concept: "Pthreads"
summary: "C에서 스레드를 다루는 POSIX pthread API와 동기화 도구. 스레드 생성·join·detach, 뮤텍스와 조건 변수, POSIX 세마포어, 원자성을 하드웨어가 보장하는 방법, 커널 내부의 스핀락, Java 모니터와의 대응을 정리한다."
tags: ["os", "thread", "concurrency", "c", "process"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/b7c35daad31e4f7f9573caa31685dbf5", "https://80000coding.notion.site/001f68841ca94386a7d90e4a35116cea", "https://80000coding.notion.site/126dc22073ec453b91d981e3a5b680f2", "https://80000coding.notion.site/0e912b650f404936b211f9c9a4b6880f", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/os.md"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[운영체제] Thread 와 Mutex의 개념과 관련 함수」, 「[OS] Synchronization Examples」, 「원자성이란 무엇인가?」, 「mutex 동작원리」를 바탕으로 재구성한 노트다.
> futex 설명과 「가시성·순서와 volatile」 절은 fru1tworld/cs-basic 모의 면접 질문 목록을 점검해 빠진 개념을 보강했다.

경쟁 상태, 임계 구역 조건, 세마포어의 개념과 고전적인 동기화 문제는 [[process-synchronization|프로세스 동기화]]에 있다. 이 노트는 그 개념을 **실제 코드에서 어떤 API로 쓰는지**를 다룬다.

## 스레드가 공유하는 것

| 영역 | 공유 여부 | 담기는 것 |
| --- | --- | --- |
| 코드 | 공유 | 함수, 상수 |
| 데이터·BSS | 공유 | 전역 변수, `static` 변수 |
| 힙 | 공유 | `malloc`으로 할당한 메모리 |
| 열린 fd, 시그널 처리 방식 | 공유 | 프로세스 단위 자원 |
| 스택 | **스레드마다** | 지역 변수, 함수 호출 기록 |
| 레지스터·PC, `errno`, 시그널 마스크 | **스레드마다** | 실행 상태 |

공유 영역에 동시에 쓰는 코드가 임계 구역이다.

## 스레드 생명주기

| 함수 | 역할 |
| --- | --- |
| `pthread_create(&tid, attr, start, arg)` | `start(arg)`를 실행하는 스레드를 만든다. 성공하면 0, 실패하면 **오류 번호를 반환**한다(`errno`를 쓰지 않는다) |
| `pthread_join(tid, &ret)` | 그 스레드가 끝날 때까지 기다렸다가 자원을 거두고 반환값을 받는다 |
| `pthread_detach(tid)` | 끝나면 자동으로 자원이 해제되게 한다. 이후 join할 수 없다 |
| `pthread_exit(ret)` | 호출한 스레드만 끝낸다. `main`에서 `return`하면 프로세스 전체가 끝난다 |
| `pthread_self()` | 자기 스레드 ID |
| `pthread_cancel(tid)` | 취소 요청. 취소 지점(cancellation point)에서 실제로 끝나므로 즉시 죽지 않는다 |

- 기본 스레드는 joinable이다. **join도 detach도 하지 않으면** 끝난 스레드의 자원이 남는다(프로세스의 좀비와 같은 문제).
- 속성(`pthread_attr_t`)으로 detach 상태, 스택 크기, 스케줄링 정책을 바꿀 수 있다. Linux는 스레드를 커널 스레드에 1:1로 대응시키므로 경쟁 범위는 시스템 전체(`PTHREAD_SCOPE_SYSTEM`)만 지원한다.
- `start`에 지역 변수 주소를 넘기면, 스레드가 읽기 전에 그 변수가 바뀌거나 사라질 수 있다. 스레드마다 별도 메모리를 넘긴다.

## 뮤텍스

뮤텍스(mutex)는 **한 번에 한 스레드만 임계 구역에 들어가게 하는 잠금**이다. 잠근 스레드만 풀 수 있다는 소유권 개념이 세마포어와 다르다.

```c
pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;   // 또는 pthread_mutex_init(&m, NULL)

pthread_mutex_lock(&m);      // 이미 잠겨 있으면 풀릴 때까지 잠든다
counter++;                   // 임계 구역
pthread_mutex_unlock(&m);

pthread_mutex_destroy(&m);   // 더 쓰지 않을 때
```

- `pthread_mutex_trylock`: 잠겨 있으면 기다리지 않고 `EBUSY`를 반환한다. 교착을 피하며 다른 일을 하고 싶을 때 쓴다.
- 같은 스레드가 두 번 잠그면 기본 뮤텍스는 교착된다. 필요하면 `PTHREAD_MUTEX_RECURSIVE` 속성을 쓴다.
- 여러 뮤텍스를 잡을 때는 **모든 스레드가 같은 순서로** 잡는다. 순서가 엇갈리면 [[deadlock|교착 상태]]가 생긴다.
- Linux의 뮤텍스는 futex 위에 구현되어, 경쟁이 없으면 커널에 들어가지 않는다(아래).

잠금을 커널이 관리하면 잠든 스레드를 스케줄러에서 빼 CPU를 낭비하지 않지만, 잠그고 풀 때마다 시스템 콜(모드 전환) 비용을 낸다. 스핀락은 시스템 콜이 없지만 기다리는 동안 CPU를 태운다. Linux의 뮤텍스는 둘을 합친 **futex**(fast userspace mutex) 위에 구현된다.

```text
잠금 상태 = 사용자 공간의 정수 하나
lock:   CAS(0 → 1) 성공      → 끝. 커널에 들어가지 않는다 (빠른 경로)
        실패(이미 잠김)       → "대기자 있음"으로 표시하고 futex(FUTEX_WAIT) 시스템 콜로 잠든다
unlock: 대기자 표시가 없으면  → 정수만 0으로. 시스템 콜 없음
        대기자가 있으면       → futex(FUTEX_WAKE)로 하나를 깨운다
```

경쟁이 없는 대부분의 경우는 원자 연산 한 번으로 끝나고, 실제로 기다려야 할 때만 커널을 부른다. glibc는 여기에 잠깐 스핀하다 잠드는 단계를 더한다(아래 「커널 안의 동기화」의 스핀 설명). Windows의 `SRWLOCK`·`WaitOnAddress`, macOS의 `os_unfair_lock`도 같은 발상이다.

## 조건 변수

뮤텍스는 "동시에 들어오지 마라"만 표현한다. "버퍼가 빌 때까지 기다려라" 같은 **조건을 기다리는 일**은 조건 변수(`pthread_cond_t`)로 한다.

```c
pthread_mutex_lock(&m);
while (count == 0)                  // if가 아니라 while
    pthread_cond_wait(&not_empty, &m);  // 원자적으로 m을 풀고 잠든다 → 깨면 m을 다시 잡고 반환
item = buf[--count];
pthread_cond_signal(&not_full);     // 기다리는 스레드 하나를 깨운다 (전부는 broadcast)
pthread_mutex_unlock(&m);
```

- `pthread_cond_wait`는 반드시 뮤텍스를 잡은 상태에서 부른다. 잠금 해제와 잠들기가 원자적이어서 그 사이에 온 신호를 놓치지 않는다.
- **조건은 `while`로 다시 확인한다.** 이유 없이 깨는 가짜 깨어남(spurious wakeup)이 허용되고, 깨어난 사이 다른 스레드가 먼저 조건을 소비할 수 있다.
- `signal`은 뮤텍스를 풀지 않는다. 깨어난 스레드는 신호를 보낸 쪽이 `unlock`한 뒤에야 뮤텍스를 얻는다.
- 여러 스레드를 한꺼번에 깨워 같은 뮤텍스를 두고 다투게 하는 것(thundering herd)은 낭비다. 하나만 필요하면 `signal`을 쓴다.

C에는 언어 차원의 모니터가 없으므로, **뮤텍스 + 조건 변수 조합이 모니터 역할**을 한다.

## POSIX 세마포어

| 종류 | 만들기 | 용도 |
| --- | --- | --- |
| 이름 없는 세마포어 | `sem_init(&s, pshared, value)` | `pshared=0`이면 한 프로세스의 스레드끼리, 0이 아니면 공유 메모리에 두고 프로세스끼리 |
| 이름 있는 세마포어 | `sem_open("/name", O_CREAT, mode, value)` | 관련 없는 프로세스들이 이름으로 같은 세마포어를 연다 |

`sem_wait`이 P(wait), `sem_post`가 V(signal)다. 값이 0이면 `sem_wait`은 잠든다. 세마포어에는 소유자가 없어 다른 스레드가 `post`해도 된다. 그래서 실행 순서를 맞추는 신호로 쓰기 좋다. macOS는 이름 없는 세마포어(`sem_init`)를 지원하지 않으므로 이식성이 필요하면 이름 있는 세마포어나 조건 변수를 쓴다.

## 원자성은 누가 보장하나

세마포어의 `wait`은 "값을 확인하고 → 줄인다"는 두 단계다. 그 사이에 문맥 교환이 일어나면 두 스레드가 동시에 통과한다. 세마포어는 경쟁을 없앤 게 아니라 **변수 하나에 몰아 둔 것**이고, 그 변수 조작이 원자적(atomic, 쪼갤 수 없음)이어야 비로소 동작한다.

| 방법 | 설명 | 한계 |
| --- | --- | --- |
| 인터럽트 끄기 | 그 구간에 문맥 교환이 못 일어나게 한다 | 단일 코어 커널에서만 의미. 사용자 프로그램은 쓸 수 없고 오래 끄면 시스템이 멈춘다 |
| 원자 명령어 | 읽기-수정-쓰기를 CPU 명령 하나로: test-and-set, compare-and-swap(x86 `lock cmpxchg`), ARM의 LL/SC | 하드웨어·컴파일러·커널이 함께 맞춰야 한다. C11 `<stdatomic.h>`, C++ `std::atomic`이 이를 감싼다 |

x86에서 원자 연산은 명령어 앞의 `lock` 접두어로 표시된다(`lock xadd`로 `a += b`, `lock cmpxchg`, 암묵적으로 잠기는 `xchg`). 뮤텍스·세마포어도 뜯어 보면 이런 원자 명령 위에 서 있다.

**캐시 일관성만으로는 부족하다.** MESI 같은 프로토콜은 각 쓰기가 다른 코어에 보이게 할 뿐, `load → add → store` 세 단계 사이에 다른 코어가 끼어드는 것은 막지 않는다. 원자 명령은 그 캐시 라인을 세 단계 내내 독점해 끼어들기를 막는다. 그래서 원자 연산도 공짜가 아니다.

| 비용 | 이유 |
| --- | --- |
| 캐시 라인 독점 | 같은 라인을 쓰는 다른 코어가 기다린다. 여러 코어가 한 변수를 두드리면 라인이 코어 사이를 왕복한다 |
| 순서 장벽 | `lock` 명령은 앞뒤 메모리 접근의 재정렬을 막아 비순차 실행의 이점을 줄인다 |
| 버퍼 비우기 | 스토어 버퍼와 쓰기 결합 버퍼를 비워야 결과가 즉시 다른 코어에 보인다 |

그래도 잠금 하나로 감싸는 것보다는 훨씬 싸다. 카운터 하나라면 뮤텍스 대신 `atomic_int`로 충분하다. 캐시 수준의 비용은 [[cache-friendly-code|캐시를 고려한 코드]]를 본다.

## 가시성·순서와 volatile

원자성만으로는 부족하다. 한 스레드가 쓴 값이 다른 스레드에 **언제 보이는지**(가시성)와 **어떤 순서로 보이는지**(순서)도 맞아야 한다. 컴파일러는 값을 레지스터에 담아 두고 메모리를 다시 읽지 않거나 접근 순서를 바꾸고, CPU도 스토어 버퍼와 비순차 실행으로 순서를 바꾼다. x86은 저장끼리·읽기끼리의 순서를 지키는 비교적 강한 모델(TSO)이고 ARM은 더 약해서, 배리어 없이 짠 코드가 x86에서만 우연히 맞게 돌기도 한다.

| 수단 | 보장 |
| --- | --- |
| 메모리 배리어(펜스) | 앞뒤 메모리 접근의 재정렬을 막는다. x86 `mfence`, ARM `dmb`, C11 `atomic_thread_fence` |
| 원자 변수의 메모리 순서 | C11·C++의 `memory_order_acquire`·`release`·`seq_cst`. release로 쓴 값을 acquire로 읽은 스레드는 그 앞의 쓰기도 모두 본다 |
| 뮤텍스 | 잠금은 acquire, 해제는 release 의미를 가진다. 해제 전에 쓴 값은 다음에 잠근 스레드에 보인다 |

`volatile`은 언어마다 뜻이 다르다.

| 언어 | 뜻 | 스레드 동기화에 쓸 수 있나 |
| --- | --- | --- |
| C·C++ | 그 변수의 읽기·쓰기를 생략하거나 레지스터에 캐시하지 말고 **매번 메모리에 접근**하라는 컴파일러 지시. 메모리 맵 I/O 레지스터([[io-organization\|입출력 구조]]), 시그널 핸들러와 주고받는 `volatile sig_atomic_t` 플래그용 | 아니다. 원자성도, CPU 수준의 순서도 보장하지 않으며 스레드 사이의 데이터 경쟁은 여전히 정의되지 않은 동작이다. `_Atomic`·`std::atomic`을 쓴다 |
| Java·C# | 읽기·쓰기가 다른 스레드에 바로 보이고 앞뒤 접근과 순서가 섞이지 않는다(Java는 happens-before 관계) | 상태 플래그 하나를 알리는 데는 된다. `count++` 같은 읽기-수정-쓰기는 여전히 원자적이지 않아 `AtomicInteger`나 락이 필요하다 |

정리하면 멀티코어에서의 동기화는 세 층이 함께 맞아야 성립한다. **캐시 일관성**이 같은 주소의 사본을 맞추고, **원자 명령**이 읽기-수정-쓰기 동안 라인을 독점하고, **메모리 순서(배리어)** 가 여러 주소에 대한 접근이 보이는 순서를 정한다.

## 커널 안의 동기화

| 환경 | 도구 | 쓰는 경우 |
| --- | --- | --- |
| Linux 커널 | `atomic_t` | 카운터 하나처럼 단순한 값 |
| Linux 커널 (멀티코어) | 스핀락 | 아주 짧은 구간. 잠들 수 없는 인터럽트 문맥에서도 사용 |
| Linux 커널 (단일 코어) | 커널 선점 끄기 | 스핀락 대신 |
| Linux 커널 | 세마포어, 뮤텍스 | 오래 걸리는 구간. 기다리는 동안 잠든다 |
| Windows | 디스패처 객체(뮤텍스·세마포어·이벤트·타이머) | signaled면 획득, nonsignaled면 대기 |

**스핀락**은 잠들지 않고 루프를 돌며 잠금을 기다린다. 문맥 교환 비용보다 대기가 짧을 때만 이득이다. 대기가 길면 CPU를 태우므로 잠드는 잠금을 쓴다.

스핀을 직접 짠다면 원자 연산을 쉬지 않고 반복하지 않는다. 시도할 때마다 라인을 독점해 잠금을 가진 코어까지 느려진다. 일반 읽기로 풀렸는지 확인하며 x86 `pause`(ARM `yield`)로 잠깐 쉬고, 풀린 것 같을 때만 원자 연산으로 다시 시도하고, 오래 걸리면 잠든다(`sched_yield`, futex 대기). `pthread_mutex`·`std::mutex`가 내부에서 이미 이렇게 짧게 돈 뒤 잠드는 방식을 쓰므로, 직접 만든 스핀락이 이기는 경우는 드물다.

## Java 모니터와의 대응

| Java | POSIX |
| --- | --- |
| 모든 객체가 가진 고유 락, `synchronized` 메서드·블록 | `pthread_mutex_lock`/`unlock` |
| `wait()`: 락을 놓고 대기 집합(wait set)으로 | `pthread_cond_wait` |
| `notify()` / `notifyAll()` | `pthread_cond_signal` / `pthread_cond_broadcast` |
| 진입 집합(entry set): 락을 기다리는 스레드들 | 뮤텍스 대기열 |

Java도 `wait()`는 `while` 루프 안에서 부른다. 같은 이유(가짜 깨어남, 조건 재확인)다.

## 정리

- 스레드는 join하거나 detach해서 반드시 거둔다.
- 공유 데이터는 뮤텍스로 감싸고, 여러 개를 잡을 때는 순서를 통일한다.
- 조건을 기다릴 때는 뮤텍스 + 조건 변수, 대기 조건은 `while`로 다시 확인한다.
- 동기화 도구의 원자성은 결국 CPU의 원자 명령어가 보장한다.
- **짧은 대기는 스핀, 긴 대기는 잠들기.** 사용자 코드에서는 직접 스핀락을 만들기보다 표준 뮤텍스를 쓴다.

관련 노트: [[process-synchronization|프로세스 동기화]], [[process-and-thread|프로세스와 스레드]], [[deadlock|교착 상태]], [[cache-friendly-code|캐시를 고려한 코드]], [[thread-models|사용자 수준 스레드와 커널 수준 스레드]]
