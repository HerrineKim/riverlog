---
title: "Computer Science"
concept: "Computer Science"
summary: "컴퓨터 구조, 운영체제(프로세스·메모리·파일), 네트워크(TCP·HTTP), 데이터베이스, C와 기초 자료구조, 정보처리기사 개념까지 개발의 바탕이 되는 CS 지식 모음."
tags: ["computer-science", "os", "network", "database", "computer-architecture"]
source: mixed
sources: ["https://app.notion.com/p/dd5877ac8ce54e5da39958409239a563", "https://app.notion.com/p/579891559f614dfda8c952a2c12d23a2"]
date: "2026-10-13"
---

프레임워크와 언어는 바뀌어도, 프로그램이 하드웨어 위에서 어떻게 실행되고 데이터가 어떻게 오가는지에 대한 이해는 오래 쓰인다. 이 분야에는 하드웨어(컴퓨터 구조)에서 시작해 운영체제, 네트워크, 데이터베이스로 올라가는 CS 기초를 모았다. 정보처리기사 실기에 반복해 나오는 개념도 따로 묶었다. 처음 공부한다면 아래 「학습 순서와 자료」의 순서를 따르면 된다.

- [Computer-Architecture](Computer-Science/Computer-Architecture.md) — 논리 회로와 디지털 부품, 데이터 표현과 컴퓨터 산술, 레지스터 전송, 기본 컴퓨터의 설계와 어셈블리 프로그래밍, CPU 명령어, 파이프라인, 현대 CPU의 마이크로아키텍처, 입출력, 메모리 계층과 캐시, 캐시를 고려한 코드
- [Operating-System](Computer-Science/Operating-System.md) — 운영체제 개요, 커널, 인터럽트와 시스템 콜, 프로세스와 스레드, CPU 스케줄링, 동기화와 교착 상태, 메모리 관리와 가상 메모리, 파일 시스템과 UNIX 파일 입출력, 시그널과 셸, 데몬과 systemd, 리눅스 접근 제어와 배포판, 가상화, 디스크 스케줄링과 LVM
- [Network](Computer-Science/Network.md) — 네트워크 기초와 OSI 7계층, IP와 서브넷·라우팅·NAT, 전송 계층과 포트, TCP, HTTP·HTTPS, 프록시, 리눅스 네트워크 네임스페이스, RFC, WebRTC
- [Database](Computer-Science/Database.md) — 데이터 모델, 트랜잭션, 정규화, SQL
- [C-Programming](Computer-Science/C-Programming.md) — C 기초와 포인터, 자료형과 형 변환, 구조체·스코프·링키지, 입출력, gcc·make 빌드와 디버깅 도구, 호출 규약과 저수준 최적화, C의 역사와 표준
- [Programming-Languages](Computer-Science/Programming-Languages.md) — C++ 문법·템플릿·STL·예외·vtable·메모리 풀, Java·JVM과 Go, 언어의 계보·패러다임·실행 방식, 추상 클래스와 인터페이스·위임·DTO/VO·클린 코드·GoF 디자인 패턴 같은 객체 지향 설계
- [Engineer-Information-Processing](Computer-Science/Engineer-Information-Processing.md) — 정보처리기사 실기의 반복 출제 개념 정리
- [개발자가 빠지는 함정 모음](Computer-Science/developer-traps.md) — CSS·유니코드·부동소수점·시간·SQL·동시성·Git 등에서 직관과 다르게 동작하는 지점
- [달력과 시간에 대한 개발자의 착각](Computer-Science/calendar-fallacies.md) — 하루·주·달·해·시간대·서머타임에 대한 흔한 가정과 그것을 깨는 실제 사례
- [소프트웨어 비대화](Computer-Science/software-bloat.md) — 하드웨어가 빨라져도 체감 속도가 그대로인 이유, 의존성·계층·임시방편이 쌓이는 원인과 효율을 기본값으로 두는 태도
- [베지어 곡선](Computer-Science/bezier-curve.md) — 선형 보간을 겹친 드 카스텔조 알고리즘, 2·3차 곡선 식과 행렬 표현, 펜 툴·SVG·CSS의 곡선
- [변환 행렬: 이동·크기·회전과 동차 좌표](Computer-Science/transformation-matrix.md) — 그래픽스의 2D·3D 변환 행렬, 기준점·임의 축 변환의 합성, 곱하는 순서와 투영
- [양자역학 기초: 이중 슬릿, 중첩, 얽힘](Computer-Science/quantum-mechanics-basics.md) — 파동-입자 이중성, 양자 중첩과 얽힘, 양자역학에 대한 흔한 오해
- [양자 컴퓨터의 원리: 큐비트, 양자 알고리즘, 양자 게이트](Computer-Science/quantum-computing.md) — 진폭 간섭으로 정답 확률 키우기, 블로흐 구면과 X·H·CNOT, 그로버·쇼어, 양자내성암호, 오류 정정

## 학습 순서와 자료

CS 기초는 **CS50 → 컴퓨터 구조 → 운영체제 → 네트워크** 순서로 쌓으면 앞 과목이 다음 과목의 바탕이 된다. 하드웨어 동작을 알면 운영체제가 쉬워지고, 운영체제를 알면 네트워크 스택이 OS와 하드웨어를 거쳐 데이터를 나르는 과정이 보인다.

| 순서 | 과목 | 얻는 것 | 강의 | 책 |
| --- | --- | --- | --- | --- |
| 0 | CS50 | C로 메모리·포인터·자료구조·알고리즘 감각 | [부스트코스 CS50](https://www.boostcourse.org/cs112) | — |
| 1 | 컴퓨터 구조 | 논리 회로에서 CPU·메모리·입출력까지, 성능을 고려한 코드의 바탕 | [컴퓨터시스템구조 강의](https://www.youtube.com/playlist?list=PLc8fQ-m7b1hCHTT7VH2oo0Ng7Et096dYc) (약 23시간) | 『밑바닥부터 만드는 컴퓨팅 시스템』, 『혼자 공부하는 컴퓨터 구조 + 운영체제』, 『한 권으로 읽는 컴퓨터 구조와 프로그래밍』 |
| 2 | 운영체제 | 프로세스·메모리·파일 관리, 서버 성능 튜닝의 바탕 | [KOCW 운영체제(반효경)](http://www.kocw.net/home/search/kemView.do?kemId=1046323) (약 27시간) | 『그림으로 배우는 구조와 원리 운영체제』 |
| 3 | 네트워크 | 계층별 통신 과정, 여러 층에 걸친 장애 진단 | [네트워크 기초(개정판)](https://www.youtube.com/playlist?list=PL0d8NnikouEWcF1jJueLdjRIC4HsUlULi) (약 8시간) | 『IT 엔지니어를 위한 네트워크 입문』 |

컴퓨터 구조에 들어가기 전에 논리 설계(가산기 같은 회로)를 가볍게 보면 컴퓨터 동작의 감을 잡기 쉽다. CS50 내용은 [[c-basics|C 기초]]와 [[pointers-and-memory|포인터와 메모리]]에서 이어진다.
