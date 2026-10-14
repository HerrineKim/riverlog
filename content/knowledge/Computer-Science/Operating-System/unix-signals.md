---
title: "UNIX 시그널"
concept: "Signal"
summary: "커널이나 다른 프로세스가 프로세스에 보내는 비동기 알림인 시그널. 주요 시그널과 기본 동작, sigaction과 핸들러 작성 규칙, 보류·병합 특성, SIGCHLD와 좀비 프로세스, 시그널을 통신에 쓸 때의 한계를 정리한다."
tags: ["os", "process", "system-call", "c", "interrupt"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/a70aa8cc081c4918a996f83a51299f73", "https://80000coding.notion.site/f50d12ceb3a84f2a83a611fae04a3e63", "https://80000coding.notion.site/49da4c70a23844dabc4e6a6ba4aca5f6", "https://man7.org/linux/man-pages/man7/signal.7.html"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「minitalk 에서 컴퓨터 통신 맛보기」, 「exit() atexit() _exit() 뭐가 다른지 설명할 수 있어?」, 「[운영체제] Time의 종류와 Alarm」을 바탕으로 재구성한 노트입니다.

## 시그널이란

시그널(signal)은 **프로세스에 "어떤 사건이 일어났다"는 사실만 비동기로 알리는 소프트웨어 인터럽트**다. 하드웨어 인터럽트가 CPU의 흐름을 끊듯, 시그널은 프로세스의 흐름을 끊고 미리 정한 동작을 실행시킨다. 데이터는 거의 실어 나르지 않는다. 시그널 번호 자체가 메시지다.

| 보내는 쪽 | 예 |
| --- | --- |
| 커널 (예외) | 잘못된 메모리 접근 → `SIGSEGV`, 0으로 나누기 → `SIGFPE`, 닫힌 파이프에 쓰기 → `SIGPIPE` |
| 커널 (이벤트) | 자식 종료 → `SIGCHLD`, 타이머 만료 → `SIGALRM` |
| 터미널 | `Ctrl+C` → `SIGINT`, `Ctrl+\` → `SIGQUIT`, `Ctrl+Z` → `SIGTSTP` |
| 다른 프로세스 | `kill(pid, sig)`, 셸의 `kill` 명령 |

## 주요 시그널과 기본 동작

| 시그널 | 기본 동작 | 언제 |
| --- | --- | --- |
| `SIGINT` | 종료 | 터미널 인터럽트(`Ctrl+C`) |
| `SIGTERM` | 종료 | 정상 종료 요청. `kill`의 기본값. 서비스 매니저가 데몬을 멈출 때 |
| `SIGKILL` | 종료 | 강제 종료. **잡거나 무시할 수 없다** |
| `SIGQUIT` | 종료 + 코어 덤프 | `Ctrl+\` |
| `SIGSEGV`·`SIGBUS`·`SIGILL`·`SIGFPE` | 종료 + 코어 덤프 | 메모리·명령어·산술 예외 |
| `SIGABRT` | 종료 + 코어 덤프 | `abort()`, `assert` 실패 |
| `SIGPIPE` | 종료 | 읽는 쪽이 없는 파이프·소켓에 쓰기 |
| `SIGHUP` | 종료 | 제어 터미널이 끊김. 데몬은 관례상 "설정 다시 읽기"로 쓴다 |
| `SIGCHLD` | 무시 | 자식이 종료·정지·재개 |
| `SIGALRM`·`SIGVTALRM`·`SIGPROF` | 종료 | 실시간·사용자 CPU 시간·전체 CPU 시간 타이머 만료 |
| `SIGSTOP` | 정지 | 강제 정지. **잡거나 무시할 수 없다** |
| `SIGTSTP`·`SIGTTIN`·`SIGTTOU` | 정지 | `Ctrl+Z`, 백그라운드 프로세스의 터미널 읽기·쓰기 |
| `SIGCONT` | 재개 | 정지된 프로세스를 다시 실행 |
| `SIGUSR1`·`SIGUSR2` | 종료 | 프로그램이 뜻을 정해 쓰는 사용자 정의 시그널 |

번호는 시스템마다 다를 수 있으므로 코드에서는 항상 이름 상수를 쓴다. 전체 목록은 `man 7 signal`에 있다.

## 시그널의 일생

```text
발생(generate) ─▶ 보류(pending) ─▶ 전달(deliver)
                     │                 ├─ 기본 동작 (종료·코어·정지·무시)
   시그널 마스크로 ───┘                 ├─ 무시 (SIG_IGN)
   막혀 있으면 계속 보류                 └─ 핸들러 실행 → 끊긴 지점으로 복귀
```

- **표준 시그널은 큐에 쌓이지 않는다.** 보류 상태는 시그널마다 비트 하나라서, 같은 시그널이 처리 전에 여러 번 오면 한 번으로 합쳐진다.
- 서로 다른 시그널이 함께 보류되면 어떤 순서로 전달될지 정해져 있지 않다.
- 실시간 시그널(`SIGRTMIN`~`SIGRTMAX`)은 예외다. 큐에 쌓이고, 번호 순으로 전달되며, `sigqueue()`로 정수나 포인터 하나를 함께 보낼 수 있다.
- 마스크는 `sigprocmask()`(스레드에서는 `pthread_sigmask()`)로 바꾼다. 임계 구역 동안 막아 두었다가 풀면 그때 전달된다.

## 핸들러 등록: sigaction

`signal()`은 시스템마다 의미가 달라(핸들러가 한 번 실행 후 기본값으로 돌아가는지 등) 이식성이 없다. **`sigaction()`을 쓴다.**

```c
struct sigaction sa = {0};
sa.sa_sigaction = handler;          // void handler(int sig, siginfo_t *info, void *ctx)
sa.sa_flags = SA_SIGINFO | SA_RESTART;
sigemptyset(&sa.sa_mask);           // 핸들러 실행 중 추가로 막을 시그널
sigaction(SIGUSR1, &sa, NULL);
```

- `SA_SIGINFO`: 핸들러가 `siginfo_t`로 보낸 프로세스의 PID(`si_pid`) 등을 받는다. 응답을 보낼 상대를 알 수 있다.
- `SA_RESTART`: 핸들러 때문에 끊긴 `read` 같은 느린 시스템 콜을 자동으로 다시 시작한다. 없으면 `EINTR`로 실패한다.
- 핸들러가 실행되는 동안 같은 시그널은 자동으로 막힌다.

### 핸들러 작성 규칙

핸들러는 프로그램의 **아무 지점에나** 끼어든다. `malloc` 한가운데서 불렸는데 핸들러가 또 `malloc`을 부르면 힙이 깨진다.

- 핸들러 안에서는 **async-signal-safe 함수만** 부른다. `write`, `_exit`, `kill`, `sigaction`은 되고 `printf`, `malloc`, `free`, `exit`은 안 된다(`man 7 signal-safety`).
- 메인 흐름과 공유하는 변수는 `volatile sig_atomic_t`로 선언하고, 핸들러는 플래그만 세운다. 실제 처리는 메인 루프에서 한다.
- 핸들러가 `errno`를 바꿀 수 있으므로 들어갈 때 저장하고 나올 때 복원한다.

## SIGCHLD, 좀비, 고아

자식이 `_exit()`하면 커널은 메모리와 fd를 회수하지만, **종료 상태를 담은 프로세스 테이블 항목은 부모가 거둘 때까지 남긴다.** 이 상태가 좀비(zombie, `ps`에서 `Z`)다.

| 상황 | 결과 | 대응 |
| --- | --- | --- |
| 부모가 `wait`·`waitpid`로 거둠 | 항목 삭제, 종료 코드 전달 | 정상 |
| 부모가 거두지 않고 살아 있음 | 좀비가 계속 쌓여 PID 고갈 | `SIGCHLD` 핸들러에서 `while (waitpid(-1, &st, WNOHANG) > 0);` |
| 부모가 먼저 죽음 | 고아(orphan)가 되어 init(PID 1)이나 subreaper가 입양해 거둠 | 셸·컨테이너의 PID 1은 반드시 자식을 거둬야 한다 |

`SIGCHLD`는 합쳐질 수 있으므로 핸들러에서 한 번만 `waitpid`하면 자식을 놓친다. 위처럼 반복해서 거둔다. `SIGCHLD`를 `SIG_IGN`으로 두면 커널이 자식을 자동으로 거둔다(대신 종료 코드를 받을 수 없다).

## 시그널로 통신하기의 한계

`SIGUSR1`을 0, `SIGUSR2`를 1로 정하면 비트 단위로 문자열을 보낼 수 있다. 그러나 시그널은 통신용으로 설계되지 않았다.

| 문제 | 원인 | 완화 |
| --- | --- | --- |
| 비트가 사라짐 | 같은 시그널이 처리 전에 다시 오면 하나로 합쳐짐 | 수신 측이 비트마다 확인 응답(ACK)을 보낸 뒤 다음 비트를 보냄 |
| 순서가 바뀜 | 다른 시그널 간 전달 순서 미정 | 한 번에 하나만 보내는 stop-and-wait |
| 느림 | 비트 하나마다 문맥 교환과 핸들러 실행 | 대량 전송은 파이프·소켓·공유 메모리로 |
| `sleep`으로 간격 두기 | 도착을 보장하지 못하고 느리기만 함 | ACK 기반 흐름 제어 |

비트마다 ACK를 기다리는 방식은 TCP 이전의 정지-대기(stop-and-wait) ARQ와 같은 구조다. 한 번에 여러 개를 보내고 누적 ACK를 받는 슬라이딩 윈도우, 실패 지점부터 다시 보내는 Go-Back-N, 실패한 것만 다시 보내는 Selective Repeat로 효율을 높이는 것이 [[tcp|TCP]]의 흐름 제어다.

## 정리

- 시그널은 데이터 없는 비동기 알림이다. `SIGKILL`·`SIGSTOP`만 잡을 수 없다.
- 표준 시그널은 큐에 쌓이지 않고 합쳐진다. 개수를 세거나 순서에 기대는 설계는 깨진다.
- 핸들러는 `sigaction`으로 등록하고, 안에서는 플래그만 세우거나 async-signal-safe 함수만 쓴다.
- 부모는 `SIGCHLD`를 받으면 `WNOHANG` 루프로 자식을 모두 거둬 좀비를 막는다.
- **프로세스 간 데이터 전달에는 파이프·소켓을 쓰고, 시그널은 "깨워라·멈춰라·다시 읽어라" 같은 제어에만 쓴다.**

관련 노트: [[process-and-thread|프로세스와 스레드]], [[system-structure|컴퓨터 시스템 구조와 인터럽트]], [[shell-pipeline|셸이 명령을 실행하는 방식]], [[time-and-timers|시간과 타이머]], [[daemon-and-systemd|데몬과 systemd]]
