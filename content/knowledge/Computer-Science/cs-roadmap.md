---
title: "CS 학습 로드맵"
concept: "CS Roadmap"
summary: "CS50으로 시작해 컴퓨터 구조, 운영체제, 네트워크 순서로 공부하기 위한 주제와 자료 모음."
tags: ["computer-science", "roadmap", "career", "os", "network"]
source: notion
sources: ["https://app.notion.com/p/dd5877ac8ce54e5da39958409239a563", "https://app.notion.com/p/579891559f614dfda8c952a2c12d23a2"]
---

비전공자나 실무 위주로 개발을 배운 사람이 CS 기초를 다지려면 어디서부터 시작해야 할지 막막하다. 이 노트는 **CS50 → 컴퓨터 구조 → 운영체제 → 네트워크** 순서로 공부할 때 각 과목에서 무엇을 배우고, 왜 필요한지, 어떤 자료가 좋은지를 정리한 로드맵이다.

## 0. 입문: CS50

- [부스트코스 CS50 강의](https://www.boostcourse.org/cs112) (무료)
- C 언어로 메모리, 포인터, 자료구조, 알고리즘의 기초를 한 번에 훑을 수 있다. 이후 과목들을 이해하는 바탕이 된다.
- 정리한 노트: [[c-basics|C 기초]], [[pointers-and-memory|포인터와 메모리]], [[file-io|C 입력과 파일 입출력]], [[data-structures|기초 자료구조]]

## 1. 컴퓨터 구조

논리 게이트를 조합해 실제 컴퓨터가 어떻게 만들어지는지, CPU·메모리·입출력 장치가 데이터를 어떻게 처리·저장·이동하는지 배운다. 하드웨어 동작을 알면 성능을 고려한 코드를 쓰는 데 도움이 되고, 운영체제를 훨씬 쉽게 이해할 수 있다.

**학습 주제**

- 현대 컴퓨터에 이르기까지의 역사와 시스템 구성 요소 — [[computer-system-basics|컴퓨터 시스템의 기본 구성]]
- 논리 회로와 디지털 부품, 데이터 표현과 산술 — [[digital-logic-circuits|디지털 논리 회로]], [[digital-components|디지털 부품]], [[data-representation|데이터의 표현]], [[computer-arithmetic|컴퓨터 산술 연산]]
- CPU의 구성과 내부 동작, 데이터 경로 — [[register-transfer|레지스터 전송과 마이크로 연산]], [[basic-computer-design|기본 컴퓨터의 구조와 설계]], [[basic-computer-programming|기본 컴퓨터 프로그래밍]]
- 명령어 집합과 주소 지정 방식 — [[cpu-instructions|CPU와 명령어 구조]]
- 파이프라이닝과 해저드 — [[pipeline-and-parallelism|파이프라인과 병렬 처리]]
- 메모리 계층, 캐시, MMU와 TLB — [[memory-hierarchy|메모리 계층 구조]], [[cache-and-virtual-memory|캐시 메모리와 MMU]]
- 폴링·인터럽트·DMA 입출력 — [[io-organization|입출력 구조]]

**자료**

- 영상: [컴퓨터시스템구조 강의](https://www.youtube.com/playlist?list=PLc8fQ-m7b1hCHTT7VH2oo0Ng7Et096dYc) (약 23시간, 『컴퓨터시스템구조』 3판 교재 기반)
- 교재: 『밑바닥부터 만드는 컴퓨팅 시스템』 — 하드웨어부터 OS·컴파일러까지 12개 프로젝트로 직접 만들어 보는 책
- 보조 교재: 『혼자 공부하는 컴퓨터 구조 + 운영체제』, 『한 권으로 읽는 컴퓨터 구조와 프로그래밍』

**선수 과목**: 논리 설계(가산기 같은 논리 회로로 컴퓨터 동작의 감을 잡는다), 컴퓨터·전자공학 개론

## 2. 운영체제

하드웨어를 관리하고 응용 프로그램이 공통으로 쓰는 서비스를 제공하는 시스템 소프트웨어다. 대규모 서비스를 운영하거나 서버 성능을 튜닝하려면 운영체제 지식이 필수다.

**학습 주제**

- 운영체제의 역할과 커널 — [[os-overview|운영체제 개요]], [[kernel-types|커널의 종류]]
- 컴퓨터 시스템의 구조와 프로그램 실행 과정 — [[system-structure|컴퓨터 시스템 구조와 인터럽트]]
- 프로세스와 스레드, CPU 스케줄링 — [[process-and-thread|프로세스와 스레드]], [[process-scheduling|프로세스 상태와 CPU 스케줄링]]
- 동기화와 데드락 — [[process-synchronization|프로세스 동기화]], [[deadlock|교착 상태]]
- 메모리·가상 메모리 관리 — [[memory-management|메모리 관리]], [[virtual-memory|가상 메모리]]
- 파일 시스템과 디스크 관리 — [[file-system|파일 시스템]], [[file-system-implementation|파일 시스템 구현]], [[disk-scheduling|디스크 관리와 스케줄링]]

**자료**

- 영상: [KOCW 운영체제 (반효경)](http://www.kocw.net/home/search/kemView.do?kemId=1046323) (약 27시간, 핵심이 잘 정리되어 있고 전달력이 좋다)
- 교재: 『그림으로 배우는 구조와 원리 운영체제』

## 3. 네트워크

데이터가 애플리케이션에서 OS, 하드웨어를 거쳐 전달되는 과정을 계층별로 이해하면, 여러 층에 걸친 네트워크 문제를 진단하는 힘이 생긴다.

**학습 주제**

- 네트워크 기초 용어(노드, 호스트, 링크, 홉, 경로, 프로토콜)와 OSI 7계층 — [[network-basics|네트워크 기초]], [[osi-7-layer|OSI 7계층]]
- 네트워크 계층: IP, 서브넷, NAT, ARP, ICMP, 라우팅 알고리즘 — [[network-layer|네트워크 계층 프로토콜]]
- 전송 계층: TCP(연결 지향)·UDP(비연결), 다중화, 연결·흐름·혼잡 제어 — [[transport-layer|전송 계층, 포트, UDP]], [[tcp|TCP]]
- 응용 계층: HTTP와 그 위의 기술 — [[http|HTTP 프로토콜]], [[https|HTTPS와 TLS]], [[dns|DNS]], [[url-to-page|브라우저에 URL을 입력하면 일어나는 일]]

**자료**

- 영상: [네트워크 기초(개정판)](https://www.youtube.com/playlist?list=PL0d8NnikouEWcF1jJueLdjRIC4HsUlULi) (약 8시간, 애니메이션으로 계층별 프로토콜을 쉽게 설명)
- 교재: 『IT 엔지니어를 위한 네트워크 입문』 — 가상화·클라우드 시대의 네트워크까지 다루는 기초서

## 핵심 정리

| 순서 | 과목 | 왜 필요한가 |
| --- | --- | --- |
| 0 | CS50 | 메모리·포인터 등 기초 감각 |
| 1 | 컴퓨터 구조 | 하드웨어 동작 이해, OS 학습의 기반 |
| 2 | 운영체제 | 프로세스·메모리·파일 관리, 서버 성능 이해 |
| 3 | 네트워크 | 계층별 통신 이해, 장애 진단 능력 |
