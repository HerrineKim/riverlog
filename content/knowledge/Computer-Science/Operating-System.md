---
title: "운영체제"
concept: "Operating System"
summary: "하드웨어와 프로그램 사이에서 자원을 관리하고 실행 환경을 제공하는 시스템 소프트웨어에 대한 노트 모음."
tags: ["os", "kernel", "process", "file-system"]
source: mixed
---

운영체제(OS)는 CPU·메모리·입출력 장치 같은 한정된 자원을 여러 프로그램에 나눠 주고, 프로그램이 하드웨어를 직접 다루지 않아도 되게 해 주는 소프트웨어 계층이다. 서버 성능 튜닝이나 대규모 서비스 운영처럼 "프로그램이 실제로 어떻게 돌아가는가"를 알아야 하는 순간에 바탕이 되는 지식이다.

- **os-overview** — 운영체제의 정의, 목적, 분류와 대표적인 예
- **kernel-types** — 단일형·마이크로·하이브리드 커널 비교
- **system-structure** — 모드 비트, 타이머, 인터럽트, 시스템 콜, DMA로 본 컴퓨터 시스템 구조
- **process-scheduling** — 프로세스 상태, CPU 스케줄링 알고리즘, 문맥 교환, IPC
- **file-system** — 파일·디렉터리·open()·접근 제어 등 파일 시스템의 인터페이스
- **file-system-implementation** — 디스크 할당 방식, UNIX/FAT 구조, 버퍼 캐시와 페이지 캐시
