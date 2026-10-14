---
title: "운영체제"
concept: "Operating System"
summary: "하드웨어와 프로그램 사이에서 자원을 관리하고 실행 환경을 제공하는 시스템 소프트웨어에 대한 노트 모음. 프로세스·메모리·파일의 이론과 함께 UNIX 시스템 프로그래밍(파일 디스크립터, 시그널, 셸, pthread, 타이머)과 리눅스 운영(systemd, 접근 제어, 배포판, 가상화)을 다룬다."
tags: ["os", "kernel", "process", "memory", "file-system"]
source: mixed
date: "2026-10-14"
---

운영체제(OS)는 CPU·메모리·입출력 장치 같은 한정된 자원을 여러 프로그램에 나눠 주고, 프로그램이 하드웨어를 직접 다루지 않아도 되게 해 주는 소프트웨어 계층이다. 서버 성능 튜닝이나 대규모 서비스 운영처럼 "프로그램이 실제로 어떻게 돌아가는가"를 알아야 하는 순간에 바탕이 되는 지식이다.

- [운영체제 개요](Computer-Science/Operating-System/os-overview.md) — 운영체제의 정의, 목적, 분류와 대표적인 예
- [커널의 종류](Computer-Science/Operating-System/kernel-types.md) — 단일형·마이크로·하이브리드 커널 비교
- [리눅스 배포판과 패키지 관리](Computer-Science/Operating-System/linux-distributions.md) — 커널과 배포판, Debian·RHEL 계열과 apt·dnf, CentOS Stream과 Rocky·AlmaLinux
- [컴퓨터 시스템 구조와 인터럽트](Computer-Science/Operating-System/system-structure.md) — 모드 비트, 타이머, 인터럽트, 시스템 콜, DMA로 본 컴퓨터 시스템 구조
- [운영체제의 시간과 타이머](Computer-Science/Operating-System/time-and-timers.md) — 벽시계·단조·CPU 시간, RTC·TSC, clock_gettime, sleep, alarm과 POSIX 타이머
- [프로세스와 스레드](Computer-Science/Operating-System/process-and-thread.md) — 프로세스의 문맥과 PCB, 문맥 교환, 스케줄러, 스레드, 멀티프로세스·멀티스레드 비교, fork·exec·wait, IPC
- [UNIX 시그널](Computer-Science/Operating-System/unix-signals.md) — 주요 시그널과 기본 동작, sigaction과 핸들러 규칙, SIGCHLD와 좀비, 시그널 통신의 한계
- [셸이 명령을 실행하는 방식](Computer-Science/Operating-System/shell-pipeline.md) — 토큰화·파싱·확장, fork·execve, pipe·dup2로 잇는 파이프라인, heredoc과 서브셸
- [데몬과 systemd](Computer-Science/Operating-System/daemon-and-systemd.md) — 데몬과 세션, SysV 이중 fork, systemd 유닛·서비스, cron을 대체하는 타이머
- [프로세스 상태와 CPU 스케줄링](Computer-Science/Operating-System/process-scheduling.md) — 프로세스 상태, CPU 스케줄링 알고리즘과 성능 척도, 다중 프로세서·실시간 스케줄링
- [프로세스 동기화](Computer-Science/Operating-System/process-synchronization.md) — 경쟁 상태, 임계 구역 문제, 세마포어, 고전적인 동기화 문제
- [POSIX 스레드와 동기화 API](Computer-Science/Operating-System/pthread-sync-api.md) — pthread 생성·join, 뮤텍스와 조건 변수, POSIX 세마포어, 원자 명령어와 스핀락
- [교착 상태](Computer-Science/Operating-System/deadlock.md) — 교착 상태의 발생 조건과 예방·회피·탐지·무시
- [메모리 관리](Computer-Science/Operating-System/memory-management.md) — 주소 바인딩과 MMU, 연속 할당과 단편화, 페이징과 세그멘테이션
- [가상 메모리](Computer-Science/Operating-System/virtual-memory.md) — 요구 페이징, 페이지 교체 알고리즘, 스래싱과 Working Set
- [가상화와 하이퍼바이저](Computer-Science/Operating-System/virtualization.md) — 하이퍼바이저 Type 1·2, 전가상화·반가상화·하드웨어 지원, 컨테이너, 샌드박스
- [파일 시스템](Computer-Science/Operating-System/file-system.md) — 파일·디렉터리·open()·접근 제어 등 파일 시스템의 인터페이스
- [UNIX 파일 입출력과 파일 디스크립터](Computer-Science/Operating-System/unix-file-io.md) — fd와 커널의 세 테이블, read·write·dup2, 버퍼와 fsync, epoll, mmap의 한계
- [리눅스 접근 제어: DAC, MAC, sudo](Computer-Science/Operating-System/linux-access-control.md) — 파일 권한과 setuid, AppArmor·SELinux, sudoers 문법, PAM
- [파일 시스템 구현](Computer-Science/Operating-System/file-system-implementation.md) — 디스크 할당 방식, UNIX/FAT 구조, 버퍼 캐시와 페이지 캐시
- [디스크 관리와 스케줄링](Computer-Science/Operating-System/disk-scheduling.md) — 디스크 구조와 부팅, 디스크 스케줄링 알고리즘, 스왑 공간, RAID
