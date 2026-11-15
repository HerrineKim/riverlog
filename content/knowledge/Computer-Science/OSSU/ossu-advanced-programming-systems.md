---
title: "OSSU 심화 프로그래밍과 시스템"
concept: "Advanced Programming Systems"
summary: "병렬 프로그래밍·컴파일러·Haskell·Prolog·디버깅과 디지털 회로·컴퓨터 구조 심화 선택 과목."
tags: ["computer-science", "curriculum", "programming", "computer-architecture", "compiler"]
source: other
date: "2026-11-15"
sources: ["https://github.com/ossu/computer-science", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/README.md"]
---

> OSSU의 공개 컴퓨터과학 커리큘럼과 관련 자료를 주제별로 재구성한 노트다.

## 심화 과정의 위치

Advanced CS는 Core CS를 마친 뒤 **진로와 목표에 맞는 과목을 선택**하는 단계다. 모든 심화 강좌를 의무적으로 듣는 과정은 아니다.

| 심화 영역 | 깊게 파는 질문 |
| --- | --- |
| 병렬 프로그래밍 | 독립 계산을 동시에 수행할 때 공유 상태와 경합을 어떻게 통제할까 |
| 컴파일러 | 소스 코드가 파싱·중간 표현·최적화·기계 코드로 어떻게 변환될까 |
| 논리·함수형 언어 | 계산을 값·규칙·증명에 가깝게 기술할 수 있을까 |
| 테스트·디버깅 | 실패 원인을 체계적으로 격리하고 검증할 수 있을까 |
| 컴퓨터 구조 | 회로·명령어·캐시·파이프라인이 성능에 어떤 제약을 만들까 |

## 심화 프로그래밍

### Advanced programming
| 강좌 | 기간 | 주당 학습량 | 선수 지식·참고 |
| --- | --- | --- | --- |
| [Parallel Programming](https://www.coursera.org/learn/scala-parallel-programming) | 4 weeks | 6-8 hours/week | Scala programming |
| [Compilers](https://www.edx.org/learn/computer-science/stanford-university-compilers) | 9 weeks | 6-8 hours/week | none |
| [Introduction to Haskell](https://www.seas.upenn.edu/~cis194/fall16/) | 14 weeks | - | - |
| [Learn Prolog Now!](https://www.let.rug.nl/bos/lpn//lpnpage.php?pageid=online) ([alternative](https://github.com/ossu/computer-science/files/6085884/lpn.pdf))* | 12 weeks | - | - |
| [Software Debugging](https://www.youtube.com/playlist?list=PLAwxTw4SYaPkxK63TiT88oEe-AIBhr96A) | 8 weeks | 6 hours/week | Python, object-oriented programming |
| [Software Testing](https://www.youtube.com/playlist?list=PLAwxTw4SYaPkWVHeC_8aSIbSxE_NXI76g) | 4 weeks | 6 hours/week | Python, programming experience |


## 심화 시스템

### Advanced systems
| 강좌 | 기간 | 주당 학습량 | 선수 지식·참고 |
| --- | --- | --- | --- |
| [Computation Structures 1: Digital Circuits](https://learning.edx.org/course/course-v1:MITx+6.004.1x_3+3T2016) [alternative 1](https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/) [alternative 2](https://ocw.mit.edu/courses/6-004-computation-structures-spring-2009/) | 10 weeks | 6 hours/week | [Nand2Tetris II](https://www.coursera.org/learn/nand2tetris2); Alternate links contain all 3 courses. |
| [Computation Structures 2: Computer Architecture](https://learning.edx.org/course/course-v1:MITx+6.004.2x+3T2015) | 10 weeks | 6 hours/week | Computation Structures 1; - |
| [Computation Structures 3: Computer Organization](https://learning.edx.org/course/course-v1:MITx+6.004.3x_2+1T2017) | 10 weeks | 6 hours/week | Computation Structures 2; - |


관련 노트: [[programming-paradigms|프로그래밍 패러다임]], [[how-programs-run|프로그램 실행]], [[java-concurrency|동시성]]
