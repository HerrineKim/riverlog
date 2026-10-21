---
title: "컴퓨터 구조"
concept: "Computer Architecture"
summary: "CPU, 메모리, 입출력 장치가 어떻게 구성되고 협력해 프로그램을 실행하는지, 그리고 현대 CPU의 비순차 실행·분기 예측·캐시가 코드 성능에 어떤 영향을 주는지 다루는 분야."
tags: ["computer-architecture", "cpu", "memory", "io", "digital-logic"]
source: notion
date: "2026-10-14"
---

컴퓨터 구조는 논리 회로 수준의 부품이 모여 CPU와 메모리, 입출력 시스템을 이루고, 그 위에서 명령어가 실행되는 원리를 다룬다. 운영체제와 성능 최적화를 이해하는 기반이 된다.

- [컴퓨터 시스템의 기본 구성](Computer-Science/Computer-Architecture/computer-system-basics.md) — 컴퓨터의 역사와 기본 구성(CPU·메모리·저장 장치)
- [디지털 논리 회로와 부품](Computer-Science/Computer-Architecture/digital-logic-circuits.md) — 논리 게이트, 부울 대수와 카르노 맵, 가산기·디코더·MUX, 플립플롭과 레지스터·카운터, RAM/ROM, 집적회로
- [데이터의 표현](Computer-Science/Computer-Architecture/data-representation.md) — 진법, 보수와 보수 뺄셈, 고정·부동 소수점, 에러 검출 코드
- [레지스터 전송과 마이크로 연산](Computer-Science/Computer-Architecture/register-transfer.md) — 레지스터 전송 언어, 버스, 산술·논리·시프트 마이크로 연산
- [기본 컴퓨터의 구조와 설계](Computer-Science/Computer-Architecture/basic-computer-design.md) — 기본 컴퓨터의 명령어 형식, 레지스터와 버스, 명령어 사이클, 인터럽트, 하드와이어드 제어 장치 설계와 마이크로프로그램 제어
- [기본 컴퓨터 프로그래밍](Computer-Science/Computer-Architecture/basic-computer-programming.md) — 기계어와 어셈블리, 2-pass 어셈블러, 루프·서브루틴·입출력 프로그래밍
- [CPU와 명령어 구조](Computer-Science/Computer-Architecture/cpu-instructions.md) — 명령어 형식, 주소 지정 방식, 인터럽트, RISC와 CISC
- [파이프라인과 병렬 처리](Computer-Science/Computer-Architecture/pipeline-and-parallelism.md) — 병렬 처리 분류, 파이프라인과 해저드, 벡터 처리
- [현대 CPU의 마이크로아키텍처](Computer-Science/Computer-Architecture/cpu-microarchitecture.md) — μop과 비순차·슈퍼스칼라 실행, 실행 포트, 분기 예측과 분기 없는 코드, SMT
- [컴퓨터 산술 연산](Computer-Science/Computer-Architecture/computer-arithmetic.md) — 데이터 형식별 덧셈·뺄셈, 곱셈·나눗셈 알고리즘, 부동 소수점과 BCD 연산
- [입출력 구조](Computer-Science/Computer-Architecture/io-organization.md) — 입출력 인터페이스, 인터럽트 우선순위, DMA, 직렬 통신
- [메모리 계층 구조](Computer-Science/Computer-Architecture/memory-hierarchy.md) — 메모리 계층, 주기억·보조기억 장치, RAID
- [캐시 메모리와 MMU](Computer-Science/Computer-Architecture/cache-and-virtual-memory.md) — 캐시 매핑과 쓰기 정책, 하드웨어 관점의 MMU(재배치·공유·보호)와 보호 필드
- [캐시를 고려한 코드](Computer-Science/Computer-Architecture/cache-friendly-code.md) — 캐시 라인과 프리페처, 배열 vs 연결 리스트, 넌템포럴 저장, MESI와 거짓 공유, TLB shootdown
