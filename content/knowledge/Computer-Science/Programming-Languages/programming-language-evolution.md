---
title: "프로그래밍 언어의 계보와 선택"
concept: "Language Evolution"
summary: "기계어·어셈블리에서 고급 언어까지 세대 구분, 1950년대 Fortran·LISP부터 2010년대 Rust·Go·Kotlin·Swift·TypeScript까지 언어가 어떤 문제를 풀려고 이어져 왔는지, C++가 여전히 쓰이는 분야, 언어별 에너지 효율 연구의 결론을 정리한다."
tags: ["computer-science", "programming-paradigm", "cpp", "performance", "history"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/a-brief-history-og-programming-languages", "https://bytebytego.com/guides/top-8-c++-use-cases", "https://bytebytego.com/guides/what-are-the-greenest-programming-languages", "https://greenlab.di.uminho.pt/wp-content/uploads/2017/10/sleFinal.pdf", "https://www.youtube.com/watch?v=RU1u-js7db8"]
---

> ByteByteGo의 System Design 101 가이드 「[A Brief History of Programming Languages](https://bytebytego.com/guides/a-brief-history-og-programming-languages)」, 「[Top 8 C++ Use Cases](https://bytebytego.com/guides/top-8-c++-use-cases)」, 「[What Are the Greenest Programming Languages?](https://bytebytego.com/guides/what-are-the-greenest-programming-languages)」를 바탕으로 재구성한 노트다. 에너지 효율 연구의 원 자료는 Pereira 외 「[Energy Efficiency across Programming Languages](https://greenlab.di.uminho.pt/wp-content/uploads/2017/10/sleFinal.pdf)」(SLE 2017)다.
> 「어셈블러와 컴파일러가 바꾼 것」 절은 CrashCourse의 「Crash Course Computer Science」 강의를 바탕으로 보강했다.

## 언어의 세대

| 세대 | 형태 | 특징 |
| --- | --- | --- |
| 1세대 | 기계어(천공 카드에 직접 기록) | CPU가 바로 실행. 사람이 읽기 어렵다 |
| 2세대 | 어셈블리어 | 기계어 명령에 이름을 붙였다. 여전히 기계 중심이다 |
| 3세대 | 고급 언어(1957년 Fortran 이후) | 사람 중심. 컴파일러·인터프리터가 기계어로 바꾼다([[how-programs-run\|프로그램이 실행되기까지]]) |

### 어셈블러와 컴파일러가 바꾼 것

초기에는 프로그램을 먼저 종이에 의사 코드(pseudo-code)로 쓰고, 옵코드 표를 보며 손으로 이진 기계어로 옮겼다. 각 단계는 사람이 하던 번역을 **번역 프로그램**에 넘기며 생겼다.

| 단계 | 번역 프로그램이 대신한 일 | 남은 부담 |
| --- | --- | --- |
| 어셈블러(assembler, 1940년대 말~1950년대) | 옵코드에 붙인 이름(니모닉, mnemonic)과 피연산자를 이진 명령으로 바꾼다(`LOAD_A 14` → `0010 1110`). **레이블**을 달면 점프 주소를 자동으로 계산해 준다. 코드 앞부분에 명령을 끼워 넣어 주소가 밀려도 고칠 필요가 없다 | 명령 하나가 기계어 하나에 1:1로 대응해 CPU에 묶인다. 어떤 레지스터·메모리 주소를 쓸지 여전히 프로그래머가 정한다 |
| 컴파일러(compiler, 1952년 그레이스 호퍼의 A-0) | 고급 언어 한 줄을 기계어 수십 개로 펼친다. 레지스터와 메모리 위치를 컴파일러가 배정하고, 프로그래머는 이름 붙인 **변수**만 다룬다 | 당시에는 「컴퓨터는 산술만 할 수 있다」며 회의적인 반응이 많았다 |
| Fortran(1957, IBM) | 같은 프로그램이 손으로 짠 어셈블리보다 평균 약 20배 짧았다. 실행 속도가 조금 느려도 **기계 시간보다 비싼 프로그래머 시간**을 크게 줄여 경제적으로 이겼다 | 처음에는 IBM 컴퓨터에서만 컴파일됐다. 1950년대 언어는 대개 한 기종 전용이라 컴퓨터를 바꾸면 코드를 다시 써야 했다 |
| COBOL(1959, 업계·학계·정부 위원회 CODASYL) | 기종마다 자기 컴파일러를 두되 **같은 소스 코드를 받게** 했다. 어떤 기계에서든 같은 코드를 돌리는 **이식성**이 고급 언어의 기본 성질이 되었다 | |

고급 언어의 가장 큰 효과는 **진입 장벽을 낮춘 것**이다. 과학자·엔지니어·의사·경제학자가 전업 프로그래머 없이도 계산을 업무에 쓸 수 있게 되었고, 전문 프로그래머는 어셈블리로는 수천만 줄이 필요했을 규모의 프로그램을 만들 수 있게 되었다. 그 전에 프로그램을 기계에 넣던 수단(플러그보드, 천공 카드, 패널 스위치)은 [[computing-history#프로그램을 넣는 수단의 변천|컴퓨터의 역사]]에 있다.

## 시대별 흐름

| 시기 | 사건 | 남긴 것 |
| --- | --- | --- |
| 1950년대 | Fortran, LISP, COBOL | 재귀, 가비지 컬렉션, 예외 같은 개념이 이때 나와 지금 언어에도 남아 있다. COBOL은 기종을 넘는 공통 언어를 목표로 했다 |
| 1972년 | **C**와 **Smalltalk** | C는 유닉스를 쓰려고 만들어져 시스템 프로그래밍의 기반이 됐다([[c-history-and-standards\|C의 역사와 표준]]). Smalltalk는 객체 지향과 이후 스크립트·클라이언트 언어에 영향을 줬다 |
| 1980년대 | C++, Objective-C | 그래픽 사용자 인터페이스를 짜기 좋아 객체 지향이 퍼졌다 |
| 1990년대 | Python(1991), Java·JavaScript·PHP·Ruby(1995) | PC가 싸지며 안전성과 단순함을 강조했다. 가상 머신과 웹이 등장했다 |
| 2000년대 | C# | .NET과 함께 나와 현대적 기능을 빠르게 흡수했다 |
| 2010년대 | Rust, Zig, Go, Kotlin, Swift, Dart, TypeScript | 기존 언어의 약점을 고치는 언어들이 나왔다 |

2010년대 이후의 언어는 대개 **기존 언어 하나를 개선하려는 계보**로 읽힌다.

| 개선 대상 | 후계 언어 | 고치려는 것 |
| --- | --- | --- |
| C/C++ | Rust, Zig, D, Carbon(실험) | 메모리 안전성, 빌드·도구 체계 |
| Java | Kotlin, Go | 장황한 문법, 무거운 런타임, 동시성 |
| Objective-C | Swift | 안전성과 현대적 문법 |
| JavaScript | TypeScript | 정적 타입. JavaScript와 완전히 호환된다 |

Dart는 Flutter와 함께 널리 쓰이게 됐다([[dart-language|Dart 핵심 문법]]).

## C++가 여전히 쓰이는 곳

C++의 강점은 **하드웨어와 메모리를 세밀하게 제어하면서도 추상화를 쓸 수 있다**는 점이다. 성능과 자원 통제가 핵심인 분야에 남아 있다.

| 분야 | 이유 |
| --- | --- |
| 임베디드 시스템 | 작은 메모리와 하드웨어 직접 제어 |
| 게임 엔진 | 프레임마다 지켜야 하는 성능 |
| 운영체제·시스템 유틸리티 | 자원과 메모리에 대한 완전한 통제 |
| 데이터베이스 엔진 | 메모리 관리와 빠른 쿼리 실행 |
| 금융(고빈도 거래) | 마이크로초 단위의 지연 |
| 웹 브라우저 | 렌더링 엔진, JavaScript 엔진 |
| 네트워크 장비·시뮬레이터 | 패킷 처리 성능 |
| 과학 계산 | 수치 연산 성능과 정밀한 자원 제어 |

이 분야들 중 새 프로젝트에서 Rust가 C++의 자리를 일부 나눠 갖고 있다. Rust 공식 입문서 『The Rust Programming Language』는 [한국어 번역판](https://doc.rust-kr.org/)이 있다. C++ 문법은 [[cpp-basics|C++ 기초]]에 있다.

## 언어와 에너지 효율

같은 벤치마크 문제 10개를 27개 언어로 풀어 실행 시간·메모리·에너지를 잰 연구가 있다. 결론은 다음과 같다.

| 관찰 | 내용 |
| --- | --- |
| 상위권 | C, Rust, C++ 같은 네이티브 컴파일 언어가 에너지를 가장 적게 쓴다. Java 같은 VM 언어가 그 뒤를 잇는다 |
| 하위권 | Python, Perl, Ruby 같은 인터프리터 언어가 가장 많이 쓴다 |
| 속도와 에너지 | 대체로 빠른 언어가 에너지도 적게 쓰지만, **항상 그렇지는 않다** |
| 메모리 | 메모리 사용량이 에너지에 영향을 주지만, 실행 시간만큼 크지 않다 |

벤치마크는 순수 계산 위주라 I/O가 대부분인 웹 서비스에 그대로 옮길 수 없다. 실제 시스템의 에너지는 언어보다 아키텍처, 알고리즘, 서버 가동률에 더 크게 좌우된다.

## 정리

- 언어는 기계어 → 어셈블리 → 고급 언어로 추상화 수준을 높여 왔다.
- 재귀·GC·예외 같은 핵심 개념은 1950년대에 이미 나왔고, 이후 언어는 그것을 다듬고 조합했다.
- 최근 언어는 대부분 기존 언어의 약점(메모리 안전성, 장황함, 타입 부재)을 고치는 후계자다.
- C++는 성능과 자원 통제가 핵심인 분야에 남아 있다. 에너지 효율도 대체로 네이티브 언어가 앞선다.

관련 노트: [[computing-history|컴퓨터의 역사]], [[how-programs-run|프로그램이 실행되기까지]], [[programming-paradigms|프로그래밍 패러다임]], [[c-history-and-standards|C의 역사와 표준]], [[cpp-basics|C++ 기초 문법과 참조자]]
