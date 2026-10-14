---
title: "프로그래밍 언어와 객체 지향 설계"
concept: "Programming Languages"
summary: "C++의 문법·템플릿·STL·예외·가상 함수·메모리 풀 같은 언어 내부 동작과, 추상 클래스·인터페이스·위임·DTO/VO·클린 코드 같은 객체 지향 설계 개념 모음."
tags: ["cpp", "oop", "design-pattern", "clean-code", "computer-science"]
source: other
date: "2026-10-14"
---

언어의 문법은 금방 익히지만, 그 문법이 컴파일된 뒤 무엇이 되는지(템플릿 인스턴스화, vtable, 예외 테이블)를 알면 성능과 버그를 설명할 수 있습니다. 이 주제에는 C++를 중심으로 한 언어 내부 동작과, 언어를 넘어 쓰이는 객체 지향 설계 개념을 모았습니다. C 언어와 포인터는 [C-Programming](Computer-Science/C-Programming.md)에, 객체 지향의 철학은 [객체 지향의 본질: 메시징](Computer-Science/oop-messaging.md)에 있습니다.

## 하위 노트

### C++

- [C++ 기초 문법과 참조자](Computer-Science/Programming-Languages/cpp-basics.md) — 초기화와 L/R-value, 스트림, 헤더와 네임스페이스, 포인터와 참조자의 차이, switch fallthrough
- [C++ 템플릿](Computer-Science/Programming-Languages/cpp-templates.md) — 함수·클래스 템플릿, 기본·비타입 인자, 특수화, 템플릿 재귀와 가변 인자
- [C++ STL 컨테이너와 시간 복잡도](Computer-Science/Programming-Languages/cpp-stl-containers.md) — vector의 분할 상환 O(1), deque·list, 레드-블랙 트리 기반 set·map과 해시 기반 unordered
- [C++ 예외 처리의 내부 동작](Computer-Science/Programming-Languages/cpp-exceptions.md) — 스택 되감기, 동적 등록과 zero-cost 테이블 방식, 예외 객체의 힙 할당
- [가상 함수와 vtable](Computer-Science/Programming-Languages/cpp-virtual-functions.md) — vptr과 vtable, 생성자·소멸자 안의 가상 호출과 pure virtual call, 가상 소멸자
- [메모리 풀](Computer-Science/Programming-Languages/memory-pool.md) — 고정·가변 메모리 풀, operator new/delete 오버로딩, std::pmr
- [C++ 코딩 표준과 clang-format](Computer-Science/Programming-Languages/cpp-coding-style.md) — 코딩 표준이 정하는 항목, 이름 규칙 예, clang-format으로 서식 자동화

### 객체 지향 설계

- [추상 클래스와 인터페이스](Computer-Science/Programming-Languages/abstract-class-vs-interface.md) — is-a와 can-do, 템플릿 메서드와 훅, Java 8 디폴트 메서드, 고르는 기준
- [위임 패턴과 Kotlin by](Computer-Science/Programming-Languages/kotlin-delegation.md) — 상속 대신 위임, 클래스·프로퍼티 위임, by lazy와 by viewModels()
- [DTO와 VO, DAO와 Repository](Computer-Science/Programming-Languages/dto-vo-dao-repository.md) — 전송 객체와 값 객체, 테이블 중심 DAO와 도메인 중심 Repository
- [클린 코드: 함수와 이름](Computer-Science/Programming-Languages/clean-code-functions-naming.md) — 작은 함수와 추상화 수준, 팩터리로 분기 가두기, 의미 있는 이름
