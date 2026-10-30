---
title: "스프링의 싱글톤 빈과 요청 스레드"
concept: "Thread per Request"
summary: "스프링 빈은 하나뿐인데 동시에 들어온 수많은 요청을 어떻게 처리하는가. 내장 Tomcat의 스레드 풀이 요청마다 스레드를 배정하고, 모든 스레드가 같은 싱글톤 빈을 공유하므로 빈은 상태 없이(stateless) 짜야 한다. NIO 커넥터, 스레드 풀 설정, 가상 스레드까지 정리한다."
tags: ["backend", "spring", "thread", "concurrency", "design-pattern"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/80fdeed4c57b440b9f5bedd62d2dd493"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「스프링의 싱글톤과 멀티 스레딩」을 바탕으로 재구성한 노트다.

## 질문: 객체는 하나인데 요청은 동시에 수천 개

스프링 컨테이너는 `@Service`, `@Controller`, `@Repository` 같은 빈(bean)을 기본적으로 **싱글톤 스코프**로 만든다. 애플리케이션 전체에서 `UserService` 인스턴스는 하나다. 그런데 사용자 수천 명이 동시에 요청을 보내도 서로 섞이지 않고 처리된다. 비결은 두 가지다.

1. **요청마다 다른 스레드**가 같은 객체의 메서드를 실행한다.
2. 요청마다 다른 데이터는 객체의 필드가 아니라 **각 스레드의 스택(지역 변수, 매개변수)** 에 있다.

싱글톤 패턴 자체의 장단점은 [[singleton-service-pattern|싱글톤 패턴과 서비스 패턴]]에, 스레드의 개념은 [[process-and-thread|프로세스와 스레드]]에 있다.

## 요청이 스레드를 만나는 과정

Spring Boot 웹 앱(Spring MVC)은 **내장 Tomcat**이 서블릿 컨테이너 겸 WAS 역할을 한다.

```text
클라이언트 요청 ─► Tomcat 커넥터(NIO)가 연결 수락
                   └ 요청 처리 스레드 풀에서 스레드 하나 배정 (http-nio-8080-exec-N)
                       └ DispatcherServlet ─► Controller ─► Service ─► Repository
                                                  (모두 싱글톤 빈, 모든 스레드가 공유)
                   ◄ 응답을 쓰면 스레드는 풀로 돌아간다
```

| 구성 요소 | 역할 |
| --- | --- |
| 서블릿(Servlet) | HTTP 요청을 받아 응답을 만드는 자바 객체. 스프링 MVC에서는 `DispatcherServlet` 하나가 모든 요청을 받아 알맞은 컨트롤러로 보낸다 |
| 서블릿 컨테이너 | 서블릿의 생성·초기화·소멸을 관리하고 요청을 스레드에 배정한다. Tomcat, Jetty, Undertow |
| 스레드 풀 | 스레드를 미리 만들어 두고 재사용한다. 스레드 생성 비용이 크기 때문에 요청마다 새로 만들지 않는다 |

이 구조를 **요청당 스레드(thread-per-request)** 모델이라 한다. 요청 하나를 처리하는 동안 그 스레드는 그 요청 전용이다.

## 커넥터: BIO에서 NIO로

| 방식 | 동작 | 현재 |
| --- | --- | --- |
| BIO(Blocking I/O) | 연결 하나에 스레드 하나가 연결이 끝날 때까지 붙어 있다. Keep-Alive로 놀고 있는 연결도 스레드를 잡는다 | Tomcat 8.5부터 제거됐다 |
| NIO(Non-blocking I/O) | 소수의 Poller 스레드가 수많은 연결을 감시하다가, **데이터가 도착한 요청만** 작업 스레드에 넘긴다 | Tomcat 8부터 기본값. Spring Boot도 NIO를 쓴다 |

NIO 덕분에 동시 **연결** 수(기본 8192)는 작업 **스레드** 수(기본 200)보다 훨씬 많을 수 있다. 다만 요청 하나가 처리되는 동안에는 여전히 스레드 하나를 점유한다. NIO는 연결 대기를 줄일 뿐, 스레드 안전성을 대신 지켜 주지 않는다.

## 핵심: 싱글톤 빈은 상태 없이 짠다

여러 스레드가 같은 빈 인스턴스를 동시에 실행하므로, **빈의 인스턴스 필드는 모든 요청이 공유하는 변수**다.

```java
@Service
public class OrderService {
    private int lastPrice;                 // ✗ 모든 요청 스레드가 공유한다

    private final OrderRepository repo;     // ✓ 불변 의존성(주입 후 바뀌지 않음)

    public int order(Long itemId, int qty) {
        int price = repo.findPrice(itemId) * qty;   // ✓ 지역 변수: 스레드마다 따로
        lastPrice = price;                          // ✗ 다른 요청이 덮어쓴다
        return lastPrice;                           // 다른 사용자의 금액이 나갈 수 있다
    }
}
```

| 둬도 되는 것 | 두면 안 되는 것 |
| --- | --- |
| `final`로 주입받은 다른 빈, 설정값 | 요청·사용자마다 다른 값을 담는 필드 |
| 불변 객체, 스레드 안전한 객체(`ConcurrentHashMap`, `AtomicLong`) | `HashMap`, `ArrayList`, `SimpleDateFormat` 같은 비동기화 가변 객체 |
| 지역 변수, 매개변수 | 카운터·캐시를 일반 필드로 직접 구현한 것 |

요청별 상태가 꼭 필요하면 메서드 매개변수로 넘기고, 정말 필요할 때만 `@RequestScope` 빈이나 `ThreadLocal`을 쓴다. `ThreadLocal`은 스레드가 풀로 돌아가 재사용되므로 **요청이 끝나면 반드시 `remove()`** 해야 다음 요청에 값이 새지 않는다. 공유 자원을 꼭 바꿔야 한다면 `synchronized`나 락으로 보호하되, 모든 요청이 그 지점에서 줄을 서게 된다는 점을 감안한다.

## 스레드 풀 설정과 확장

Spring Boot에서 내장 Tomcat 설정은 `application.yml`로 바꾼다.

```yaml
server:
  tomcat:
    threads:
      max: 200          # 작업 스레드 최대 수 (기본 200)
      min-spare: 10     # 항상 대기시켜 둘 스레드 수 (기본 10)
    max-connections: 8192   # 동시에 유지할 연결 수 (기본 8192)
    accept-count: 100       # 연결이 꽉 찼을 때 OS 대기열 길이 (기본 100)
```

| 상황 | 대응 |
| --- | --- |
| DB·외부 API 대기가 길어 스레드가 모자란다 | 먼저 느린 쿼리·호출을 고친다. 스레드만 늘리면 DB 커넥션 풀이 병목이 된다 |
| I/O 대기가 대부분인 서비스 | Java 21 이상, Spring Boot 3.2 이상이면 `spring.threads.virtual.enabled=true`로 **가상 스레드**를 켠다. 요청당 스레드 모델은 그대로 두고 스레드를 아주 싸게 만든다 |
| 매우 많은 동시 연결, 스트리밍 | Spring WebFlux(Netty) 같은 이벤트 루프 기반 논블로킹 스택을 검토한다 |
| 오래 걸리는 작업을 요청과 분리 | `@Async`와 `TaskExecutor`로 별도 스레드 풀에 넘기거나 메시지 큐로 뺀다 |

가상 스레드를 켜도 **싱글톤 빈이 공유된다는 사실은 그대로**다. 상태 없이 짜야 하는 규칙은 바뀌지 않는다.

## 정리

- 스프링 빈은 기본이 싱글톤이고, Tomcat 스레드 풀의 스레드들이 요청마다 같은 빈을 동시에 실행한다.
- 요청마다 다른 데이터는 스레드의 스택(지역 변수)에 있으므로 섞이지 않는다. 섞이는 것은 빈의 필드다.
- 빈에는 불변 의존성과 설정만 두고, 요청 상태는 매개변수로 흘린다.
- Tomcat은 NIO 커넥터로 연결과 스레드를 분리한다. 스레드가 모자라면 느린 I/O부터 고치고, 가상 스레드를 검토한다.

관련 노트: [[singleton-pattern|싱글턴 패턴]], [[java-language-basics|Java 언어 기본(ThreadLocal)]], [[singleton-service-pattern|Express 싱글톤 패턴과 서비스 패턴]], [[web-server-and-nginx|웹 서버, WAS, 그리고 Nginx]], [[module|NestJS Module과 Provider: 의존성 주입과 캡슐화]], [[process-and-thread|프로세스와 스레드]], [[event-loop-server|비동기 서버의 이벤트 루프: 다중 접속 서버에서 Reactor 패턴까지]], [[spring-application-design|스프링 애플리케이션 설계]]
