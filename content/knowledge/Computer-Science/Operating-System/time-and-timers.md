---
title: "운영체제의 시간과 타이머"
concept: "System Clock"
summary: "운영체제가 다루는 세 가지 시간(벽시계·단조·프로세스 CPU 시간), 이를 재는 하드웨어(RTC·HPET·TSC), POSIX 시계 API, sleep 계열 함수, alarm과 인터벌 타이머를 정리한다. 경과 시간은 단조 시계로 재야 하는 이유가 핵심이다. 타이머가 수만~수백만 개일 때 쓰는 자료구조(정렬 리스트, 힙, 해시 타이밍 휠, 계층적 타이밍 휠)와 Kafka·Netty·리눅스 커널의 쓰임도 다룬다."
tags: ["os", "linux", "system-call", "c", "process"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/49da4c70a23844dabc4e6a6ba4aca5f6", "https://man7.org/linux/man-pages/man2/clock_gettime.2.html", "https://man7.org/linux/man-pages/man7/time.7.html", "https://blog.acolyer.org/2015/11/23/hashed-and-hierarchical-timing-wheels/"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[운영체제] Time의 종류와 Alarm」을 바탕으로 재구성한 노트다.
> 타이밍 휠은 Varghese·Lauck의 논문 「Hashed and Hierarchical Timing Wheels」(SOSP 1987)를 요약한 Adrian Colyer의 「[the morning paper](https://blog.acolyer.org/2015/11/23/hashed-and-hierarchical-timing-wheels/)」(2015.11) 글을 바탕으로 보강했다.

## 세 가지 시간

"지금 몇 시인가"와 "얼마나 걸렸나"는 다른 질문이다. 운영체제는 목적에 따라 시간을 세 가지로 나눠 제공한다.

| 시간 | 뜻 | 바뀔 수 있나 | 쓰는 곳 |
| --- | --- | --- | --- |
| 벽시계 시간(wall time) | 달력상의 현재 시각. 1970-01-01 00:00 UTC부터 흐른 초(Unix time) | **바뀐다.** 사용자·NTP가 앞뒤로 조정 | 로그 시각, 사용자에게 보여 줄 시간, 만료 일시 |
| 단조 시간(monotonic time) | 부팅 같은 임의 기준점부터 계속 증가만 하는 시간 | 뒤로 가지 않는다 | **경과 시간, 타임아웃, 성능 측정** |
| 프로세스 시간(process time) | 프로세스가 실제로 CPU를 쓴 시간 | 기다리거나 잠든 동안은 흐르지 않는다 | 프로파일링, CPU 사용량 |

**경과 시간을 벽시계로 재면 안 된다.** 측정 도중 NTP가 시계를 1초 되돌리면 경과 시간이 음수가 된다. 타임아웃·재시도 간격·벤치마크는 단조 시계로 잰다. 시간대와 달력 계산의 함정은 [[calendar-fallacies|달력과 시간에 대한 개발자의 착각]]에 있다.

## 시간을 재는 하드웨어

| 장치 | 특징 |
| --- | --- |
| RTC (Real Time Clock) | 메인보드의 배터리로 전원이 꺼져도 돈다. 정밀도가 낮아 부팅 때 벽시계 초기값을 읽는 데 쓴다 |
| HPET (High Precision Event Timer) | 주기적 인터럽트를 낼 수 있는 정밀 타이머. 전원이 꺼지면 멈춘다 |
| TSC (Time Stamp Counter) | CPU 사이클마다 증가하는 카운터. 가장 정밀하고 읽기도 빠르지만 인터럽트는 내지 않는다. 최신 CPU는 주파수가 바뀌어도 일정한 속도로 증가(invariant TSC)한다 |

커널은 이 장치들로 **시스템 클록**을 유지한다. 전통적으로 커널은 일정 주기(tick)마다 타이머 인터럽트를 받아 시간을 진행시키고 스케줄링을 했다. 이 주기를 `HZ`라 하며 배포판 설정에 따라 보통 100·250·1000이다(250이면 4ms). 현대 Linux는 할 일이 없을 때 tick을 멈추고(tickless, `NO_HZ`) 고해상도 타이머(hrtimer)로 나노초 단위 만료를 처리한다.

## 시계 API

| API | 출처 | 해상도 | 비고 |
| --- | --- | --- | --- |
| `time()` | C 표준 | 초 | 벽시계 |
| `gettimeofday(&tv, NULL)` | BSD | 마이크로초 (`timeval`) | 벽시계. POSIX에서 구식으로 지정됨 |
| `clock_gettime(id, &ts)` | POSIX | 나노초 (`timespec`) | **권장.** 시계 종류를 고른다 |
| `clock_getres(id, &ts)` | POSIX | | 그 시계의 해상도 |
| `clock_settime(id, &ts)` | POSIX | | 루트 권한 필요. 단조 시계는 바꿀 수 없다 |

| `clockid_t` | 의미 |
| --- | --- |
| `CLOCK_REALTIME` | 벽시계 |
| `CLOCK_MONOTONIC` | 단조 시간. 시스템이 잠든(suspend) 동안은 멈춘다 |
| `CLOCK_BOOTTIME` (Linux) | 단조 시간 + 잠든 시간 포함 |
| `CLOCK_PROCESS_CPUTIME_ID` | 프로세스(모든 스레드 합계)의 CPU 시간 |
| `CLOCK_THREAD_CPUTIME_ID` | 호출한 스레드의 CPU 시간 |

```c
struct timespec a, b;
clock_gettime(CLOCK_MONOTONIC, &a);
work();
clock_gettime(CLOCK_MONOTONIC, &b);
double ms = (b.tv_sec - a.tv_sec) * 1e3 + (b.tv_nsec - a.tv_nsec) / 1e6;
```

다른 언어의 대응: JavaScript `performance.now()`, Python `time.monotonic()`, Java `System.nanoTime()`이 단조 시계이고, `Date.now()`·`time.time()`·`System.currentTimeMillis()`는 벽시계다.

## 잠들기

| 함수 | 단위 | 중간에 깨면 |
| --- | --- | --- |
| `sleep(sec)` | 초 | 남은 초를 반환 |
| `usleep(usec)` | 마이크로초 | POSIX에서 제거됨. 새 코드는 `nanosleep` |
| `nanosleep(&req, &rem)` | 나노초 | -1과 `EINTR`, 남은 시간을 `rem`에 |
| `clock_nanosleep(id, flags, &req, &rem)` | 나노초 | 시계를 고를 수 있고, `TIMER_ABSTIME`으로 **절대 시각까지** 잠든다 |

- 잠든 프로세스는 CPU를 받지 않는다. 시그널이 오면 일찍 깬다.
- 요청한 시간은 **최소 시간**이다. 스케줄링 때문에 더 늦게 깰 수 있다.
- 주기 작업을 `sleep(간격)`으로 반복하면 작업 시간만큼 오차가 누적된다. 다음 깰 절대 시각을 계산해 `clock_nanosleep(..., TIMER_ABSTIME, ...)`을 쓰면 밀리지 않는다.
- `CLOCK_THREAD_CPUTIME_ID`로는 `clock_nanosleep`을 쓸 수 없다(`EINVAL`). 잠든 동안 그 스레드의 CPU 시간이 흐르지 않기 때문이다. `CLOCK_PROCESS_CPUTIME_ID`와 `clock_getcpuclockid()`로 얻은 CPU 시계는 되지만, 다른 스레드가 CPU를 쓰지 않으면 영원히 깨지 않을 수 있다.

## 알람과 타이머

### alarm

`alarm(sec)`은 sec초 뒤 자기 자신에게 `SIGALRM`을 예약하고 **바로 반환한다.** 잠들지 않는다. 새로 부르면 이전 알람은 취소되고, 0을 주면 알람을 끈다. 시그널 처리는 [[unix-signals|UNIX 시그널]]을 본다.

### 인터벌 타이머 (setitimer)

| 모드 | 기준 시간 | 만료 시그널 |
| --- | --- | --- |
| `ITIMER_REAL` | 벽시계 경과 | `SIGALRM` |
| `ITIMER_VIRTUAL` | 사용자 모드 CPU 시간 | `SIGVTALRM` |
| `ITIMER_PROF` | 사용자 + 커널 모드 CPU 시간 | `SIGPROF` (프로파일러가 사용) |

`it_value`는 첫 만료까지, `it_interval`은 이후 반복 간격이다. 간격이 0이면 한 번만 울린다. 프로세스당 모드별 하나뿐이고 오버런(처리하기 전에 다시 만료)을 알려 주지 않는다.

### POSIX 타이머

`timer_create(clockid, &sigevent, &timerid)` → `timer_settime` → `timer_delete`. 시계를 고를 수 있고 여러 개 만들 수 있으며, `timer_getoverrun`으로 놓친 만료 횟수를 알 수 있다. 만료 알림 방식은 고른다.

| `sigev_notify` | 만료 시 |
| --- | --- |
| `SIGEV_SIGNAL` | 지정한 시그널 전송 (기본은 `SIGALRM`) |
| `SIGEV_THREAD` | 지정한 함수를 새 스레드에서 실행 |
| `SIGEV_THREAD_ID` (Linux) | 특정 스레드에 시그널 |
| `SIGEV_NONE` | 알리지 않음. `timer_gettime`으로 직접 확인 |

Linux에는 만료를 fd 읽기로 받는 `timerfd_create`도 있다. 시그널 대신 `epoll`로 다른 I/O와 함께 기다릴 수 있어 이벤트 루프에 잘 맞는다.

## 타이머가 아주 많을 때: 타이밍 휠

서버는 요청마다 타임아웃 타이머를 건다. 연결 수만 개, 대기 중인 요청 수십만 개면 타이머도 그만큼이고, 대부분은 만료되기 전에 취소된다. 그래서 타이머 자료구조는 **시작·중지가 싸고, 틱마다 할 일이 적어야** 한다. Varghese와 Lauck은 1987년 논문에서 방법들을 비교하고 해시 타이밍 휠과 계층적 타이밍 휠을 제안했다.

| 방식 | 시작 | 중지 | 틱마다 | 특징 |
| --- | --- | --- | --- | --- |
| 정렬 안 한 리스트 | O(1) | O(1) | O(n) | 틱마다 모든 타이머의 남은 시간을 줄인다 |
| 만료 시각순 정렬 리스트 | O(n) | O(1) | O(1) | 맨 앞만 보면 된다. 넣을 자리를 찾느라 느리다 |
| 힙·트리 | O(log n) | O(log n) | O(1) | 범용 런타임의 흔한 선택 |
| 단순 타이밍 휠 | O(1) | O(1) | O(1) | 최대 대기 시간만큼 칸이 필요하다 |
| 해시 타이밍 휠 | O(1) | O(1) | 평균 O(1) | 칸 수를 고정하고, 칸 수보다 먼 타이머는 「몇 바퀴 뒤」를 함께 적는다 |
| 계층적 타이밍 휠 | O(1) | O(1) | 평균 O(1) | 단위가 다른 휠 여러 개. 큰 휠에서 작은 휠로 옮겨 담는다 |

**타이밍 휠**은 시계 문자판 같은 원형 배열이다. 칸 하나가 틱 하나이고, 칸마다 그 시각에 만료될 타이머 목록이 있다. j틱 뒤에 울릴 타이머는 현재 위치에서 j칸 앞 칸의 목록에 넣고, 틱마다 바늘을 한 칸 옮겨 그 칸의 목록을 실행한다. 칸 수가 8인데 20틱 뒤의 타이머를 넣으려면 해시 휠은 칸 위치를 칸 수로 나눈 나머지로 정하고, 그 칸을 몇 번 지나친 뒤에 울릴지(바퀴 수)를 함께 적는다.

```python
class HashedWheel:
    """칸 수가 고정된 해시 타이밍 휠 (Varghese·Lauck의 6번 방식)."""
    def __init__(self, slots=8):
        self.slots = [[] for _ in range(slots)]
        self.now = 0                                   # 현재 칸 위치

    def start(self, ticks, callback):                  # ticks(≥1)틱 뒤에 실행
        n = len(self.slots)
        rounds = (ticks - 1) // n                      # 그 칸을 몇 번 지나친 뒤인가
        self.slots[(self.now + ticks) % n].append([rounds, callback])

    def tick(self):                                    # 1틱마다 한 칸 전진
        self.now = (self.now + 1) % len(self.slots)
        due, keep = [], []
        for t in self.slots[self.now]:
            (due if t[0] == 0 else keep).append(t)
            t[0] -= 1
        self.slots[self.now] = keep
        for _, cb in due:
            cb()
```

**계층적 타이밍 휠**은 초 휠(60칸), 분 휠(60칸), 시 휠(24칸), 일 휠(100칸)처럼 단위가 다른 휠을 겹친다. 칸 244개로 초 단위 864만 가지 시각을 표현한다. 11시간 15분 15초 뒤의 타이머는 시 휠의 11칸 앞에 넣어 두고, 시 휠이 그 칸에 오면 분 휠의 15칸 앞으로, 다시 초 휠의 15칸 앞으로 옮긴다. 아래 휠이 한 바퀴 돌 때마다 위 휠이 한 칸 나아간다.

| 쓰는 곳 | 방식 |
| --- | --- |
| Kafka | 지연 요청 대기열(purgatory)에 계층적 타이밍 휠을 쓴다. 빈 칸을 하나씩 넘기지 않도록 타이머가 든 칸만 Java `DelayQueue`에 넣어 다음 만료 칸으로 바로 건너뛴다 |
| Netty | `HashedWheelTimer`가 해시 타이밍 휠이다. 연결별 읽기·쓰기 타임아웃처럼 정밀도가 덜 중요하고 개수가 많은 타이머에 쓴다 |
| 리눅스 커널 | 저해상도 타이머(`timer_list`)가 계층적 타이밍 휠이다. 4.8부터는 먼 타이머를 아래 휠로 옮기는(cascading) 대신 멀수록 만료 시각을 거칠게 잡는다. 정밀한 고해상도 타이머(`hrtimer`)는 레드-블랙 트리를 쓴다 |
| 힙을 쓰는 런타임 | Go 런타임(프로세서마다 4진 힙), libuv(Node.js의 이벤트 루프), Java `ScheduledThreadPoolExecutor`는 힙에 타이머를 둔다. 타이머 수가 아주 많지 않으면 힙으로 충분하다 |

타이밍 휠은 틱 단위로 시간을 뭉뚱그리므로 정밀도는 틱 크기만큼이다. 타임아웃처럼 「대략 그때쯤」이면 되는 타이머에 맞고, 정확한 시각이 필요한 타이머는 힙이나 트리로 다룬다.

## 정리

- 시각은 벽시계, 경과 시간은 단조 시계, CPU 사용량은 프로세스 시계로 잰다.
- 새 코드는 `clock_gettime`·`clock_nanosleep`을 쓴다. `gettimeofday`·`usleep`은 구식이다.
- sleep은 최소 시간만 보장한다. 주기 작업은 절대 시각으로 잠든다.
- 타이머는 `alarm` → `setitimer` → POSIX 타이머·`timerfd` 순으로 기능이 많아진다.
- 타이머가 아주 많으면 시작·중지가 O(1)인 타이밍 휠을 쓴다. 해시 휠은 바퀴 수를 함께 적고, 계층적 휠은 큰 단위에서 작은 단위로 옮겨 담는다.
- **"얼마나 걸렸나"를 `Date.now()` 차이로 재는 코드는 시계 조정 한 번에 틀린다.**

관련 노트: [[unix-signals|UNIX 시그널]], [[system-structure|컴퓨터 시스템 구조와 인터럽트]], [[calendar-fallacies|달력과 시간에 대한 개발자의 착각]], [[real-world-algorithms|현실 시스템을 움직이는 알고리즘과 자료구조]], [[heap-priority-queue|힙과 우선순위 큐]]
