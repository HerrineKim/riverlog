---
title: "Java 빌드 도구와 IntelliJ 실행 오류"
concept: "Java Build Tools"
summary: "빌드와 빌드 도구(Ant·Maven·Gradle)의 의미, JDK 설치 뒤 챙길 것, 그리고 IntelliJ가 힙 메모리 설정(-Xms > -Xmx) 때문에 조용히 죽을 때 원인을 찾고 고치는 법."
tags: ["tools", "java", "ide", "build"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/56", "https://riverkim.kr/145", "https://riverkim.kr/155", "https://riverkim.kr/261"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트입니다.

## 빌드와 빌드 도구

**빌드(build)는** 소스 코드 파일을 컴퓨터나 휴대폰에서 실행할 수 있는 독립(standalone) 결과물로 바꾸는 과정, 또는 그 결과물이다. 핵심 단계는 소스 코드를 실행 코드로 바꾸는 컴파일이고, 의존성 내려받기·테스트·패키징까지 이어지는 이 과정을 관리하는 프로그램이 **빌드 도구**다.

| 도구 | 특징 |
| --- | --- |
| Ant | 초기 Java 빌드 도구. XML로 빌드 절차를 하나하나 적는다 |
| Maven | XML(`pom.xml`)로 프로젝트와 의존성을 선언하고, 정해진 빌드 생명주기를 따른다 |
| Gradle | Ant·Maven의 단점을 보완한 오픈소스 빌드 도구. XML 대신 스크립트로 설정해 간결하고 유연하다. 처음에는 Groovy DSL이었고, 지금 새 프로젝트의 기본은 Kotlin DSL(`build.gradle.kts`)이다. Android의 표준 빌드 도구이고 Spring에서도 Maven과 함께 널리 쓴다 |
| Bazel·Buck2 | Google·Meta가 만든 대형 모노레포용 빌드 시스템. 여러 언어를 한 저장소에서 빠르게, 증분으로 빌드한다. Meta는 Buck을 Rust로 다시 쓴 Buck2로 옮겼다 |

Java로 개발하려면 먼저 **JDK(Java Development Kit)를** 설치하고, 필요하면 `JAVA_HOME` 환경 변수와 `PATH`에 JDK 경로를 등록한다. 새 프로젝트는 장기 지원(LTS) 버전을 쓰고, 여러 버전을 오가야 하면 SDKMAN! 같은 버전 관리자나 IntelliJ의 JDK 다운로드 기능을 쓴다. 프로젝트마다 요구하는 Java 버전이 다를 수 있으니 IDE의 프로젝트 SDK 설정과 Gradle·Maven의 toolchain 설정도 함께 맞춘다.

## IntelliJ가 실행조차 되지 않을 때

### 증상 · 원인 · 해결

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| IntelliJ IDEA를 업데이트한 뒤 앱이 아예 뜨지 않고, 오류 창도 나오지 않는다 | VM 옵션의 최소 힙 크기(`-Xms`)가 최대 힙 크기(`-Xmx`)보다 크게 잡혀 JVM이 시작되지 못한다. 오류 메시지는 `Initial heap size set to a larger value than the maximum heap size` | 사용자용 `idea.vmoptions`에서 `-Xms`를 `-Xmx` 이하(보통 더 작게)로 고친다 |

**힙(heap)은** 프로그램이 실행 중에 필요한 만큼 할당하고 해제하는 메모리 영역이다(함수 호출이 끝나면 자동으로 정리되는 스택과 대비된다, [[process-and-thread|프로세스와 스레드]]). IntelliJ 같은 JVM 기반 프로그램은 실행할 때 힙의 최소·최대 크기를 정하는데, 최대 힙이 너무 작으면 IDE가 느려지고 크게 잡으면 그만큼 메모리를 많이 쓴다. 내 PC의 메모리에 맞춰 정하면 된다.

설정은 **Help → Edit Custom VM Options**로 연다. 이 메뉴가 여는 사용자용 파일이 앱 안의 기본 파일보다 우선하고, 업데이트해도 유지된다. IDE가 아예 안 뜰 때는 아래 위치의 파일을 직접 고친다(앱 번들 안의 파일은 고치지 않는다. 서명이 깨질 수 있다).

```text
# macOS 사용자용 설정 파일 위치 (<버전>은 예: IntelliJIdea2026.2)
~/Library/Application Support/JetBrains/<버전>/idea.vmoptions

-Xms512m     # 최소(초기) 힙
-Xmx2048m    # 최대 힙 — -Xms보다 작으면 JVM이 시작되지 않는다
```

### 오류 창이 없을 때 원인 찾는 법

GUI 앱이 조용히 죽으면 **터미널에서 앱을 실행**해 본다. 앱이 내보내는 에러 로그가 터미널에 그대로 찍힌다.

```bash
open -a "IntelliJ IDEA.app"
```

## 정리

- 빌드 도구는 컴파일·의존성·테스트·패키징을 자동화한다. Java 진영은 Ant → Maven → Gradle 순으로 발전했고, 지금은 Maven과 Gradle(Kotlin DSL)이 주로 쓰인다.
- GUI 앱이 오류 창 없이 죽으면 터미널에서 실행해 로그부터 본다.
- JVM 앱의 힙 설정에서 `-Xms`(최소)가 `-Xmx`(최대)보다 크면 실행되지 않는다.

참고 자료: [Gradle 공식 문서](https://docs.gradle.org/), [Buck2](https://buck2.build/), [IntelliJ IDEA: JVM 옵션 설정](https://www.jetbrains.com/help/idea/tuning-the-ide.html)

관련 노트: [[cpu-instructions|CPU와 명령어 구조]] (컴파일과 인터프리트), [[web-server-and-nginx|웹 서버, WAS, 그리고 Nginx]] (Spring 배포), [[python-pyenv-setup|macOS에서 pyenv로 Python 환경 잡기]], [[windows-dev-environment|Windows 개발 환경: 터미널, Git 설치, 줄바꿈]]
