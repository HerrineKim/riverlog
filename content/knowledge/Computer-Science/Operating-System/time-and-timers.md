---
title: "운영체제의 시간과 타이머"
concept: "System Clock"
summary: "운영체제가 다루는 세 가지 시간(벽시계·단조·프로세스 CPU 시간), 이를 재는 하드웨어(RTC·HPET·TSC), POSIX 시계 API, sleep 계열 함수, alarm과 인터벌 타이머를 정리한다. 경과 시간은 단조 시계로 재야 하는 이유가 핵심이다."
tags: ["os", "linux", "system-call", "c", "process"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/49da4c70a23844dabc4e6a6ba4aca5f6", "https://man7.org/linux/man-pages/man2/clock_gettime.2.html", "https://man7.org/linux/man-pages/man7/time.7.html"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[운영체제] Time의 종류와 Alarm」을 바탕으로 재구성한 노트입니다.

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
- CPU 시간 시계로는 `clock_nanosleep`을 쓸 수 없다. 잠든 동안 그 시계가 흐르지 않기 때문이다.

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

## 정리

- 시각은 벽시계, 경과 시간은 단조 시계, CPU 사용량은 프로세스 시계로 잰다.
- 새 코드는 `clock_gettime`·`clock_nanosleep`을 쓴다. `gettimeofday`·`usleep`은 구식이다.
- sleep은 최소 시간만 보장한다. 주기 작업은 절대 시각으로 잠든다.
- 타이머는 `alarm` → `setitimer` → POSIX 타이머·`timerfd` 순으로 기능이 많아진다.
- **"얼마나 걸렸나"를 `Date.now()` 차이로 재는 코드는 시계 조정 한 번에 틀린다.**

관련 노트: [[unix-signals|UNIX 시그널]], [[system-structure|컴퓨터 시스템 구조와 인터럽트]], [[calendar-fallacies|달력과 시간에 대한 개발자의 착각]]
