---
title: "웹 서버, WAS, 그리고 Nginx"
concept: "Web Server"
summary: "정적 자원을 내주는 웹 서버(Apache·Nginx)와 동적 처리를 맡는 WAS(Tomcat 등)의 역할 분담, 리버스 프록시·로드밸런싱, 그리고 Nginx의 location·rewrite·proxy_pass로 404를 다른 서버로 넘기는 설정."
tags: ["backend", "web", "http", "architecture", "devops"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/249", "https://riverkim.kr/310"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트다.

## 웹 서버와 WAS

웹 서비스의 서버 쪽은 보통 두 층으로 나뉜다. **앞단의 웹 서버가 요청을 받고, 뒤에서 WAS가 실제 로직을 처리한다.**

| 구분 | 웹 서버 | WAS (Web Application Server) |
| --- | --- | --- |
| 하는 일 | HTML·CSS·JS·이미지 같은 정적 자원을 지정된 폴더에서 꺼내 준다 | 요청마다 코드를 실행해 동적인 결과를 만든다 |
| 대표 제품 | Apache, Nginx, IIS | Tomcat(Java), 그 밖의 언어에서는 Node.js 서버, Django 서버 등 |
| 위치 | 클라이언트와 WAS 사이 | 웹 서버 뒤 |

웹 서버만으로도 간단한 PHP 정도의 동적 페이지는 처리할 수 있지만, 본격적인 동적 처리는 WAS에 맡기고 웹 서버는 앞에서 관리 역할을 한다.

### 웹 서버를 앞에 두는 이유

WAS 앞에 웹 서버를 두면 그 웹 서버가 **리버스 프록시**가 된다. 클라이언트는 웹 서버만 보고, 웹 서버가 캐시·로드밸런싱·헬스 체크·TLS 종료를 맡아 WAS의 주소와 구성을 감춘다. 각 기능의 설명은 [[proxy|프록시: 포워드 프록시와 리버스 프록시]]에 있다.

### Apache vs Nginx

| | Apache | Nginx |
| --- | --- | --- |
| 처리 방식 | 클라이언트(연결)마다 프로세스·스레드를 따로 만든다 | 이벤트 기반으로 적은 수의 워커가 많은 연결을 처리한다 |
| 장점 | 오래 쓰여 안정적이고 모듈 생태계가 넓다 | 동시 접속이 많아도 메모리·CPU 부담이 적다 |

### Tomcat과 Spring 배포

- Java·JSP로 만든 웹 애플리케이션은 Tomcat 같은 WAS 위에서 실행된다.
- 예전에는 Spring 앱을 **war** 파일(.class, JSP, 정적 파일을 압축한 것)로 빌드해, 설치한 Tomcat의 정해진 폴더에 넣고 실행했다.
- 지금은 반대로 Spring Boot가 Tomcat을 내장해, Tomcat까지 들어 있는 **jar** 하나로 빌드해 배포하는 방식이 일반적이다. 그래서 Tomcat을 직접 만질 일은 줄었다.
- 언어 생태계마다 배포 구조와 용어는 다르지만 "웹 서버를 앞에 두고 뒤에서 애플리케이션 서버가 일한다"는 그림은 같다.

## Nginx 설정 기초: 404를 다른 서버로 넘기기

예를 들어 워드프레스 사이트를 Next.js 사이트로 **점진적으로** 옮기는 중이라고 하자. 아직 워드프레스가 서빙하는 페이지도 있으니, 요청은 먼저 기존 서버에서 찾아보고 **404가 나면 새 사이트의 404 페이지로 프록시**해야 한다. Nginx는 언어가 아니라 자체 지시어(directive)로 설정한다.

```nginx
server {
    # ... 기존 워드프레스 설정
    error_page 404 = @fallback;

    location @fallback {
        proxy_set_header Host new-site.example.com;  # 프록시할 대상의 호스트
        rewrite ^ /404 break;                         # 모든 경로를 /404로 바꾸고 재작성 중단
        proxy_pass https://new-site.example.com;      # 바뀐 경로로 대상 서버에 요청
    }
}
```

| 지시어 | 역할 |
| --- | --- |
| `location` | 특정 URL(문자열·정규식)에 대한 처리를 묶는 블록. `@이름`은 URL과 무관한 **이름 붙은 location**으로, `error_page`처럼 다른 설정에서 연결고리로 부른다 |
| `proxy_set_header 헤더 값` | 프록시 요청에 실을 헤더를 정한다. 대상 서버가 자기 도메인으로 인식하도록 `Host`를 바꾸는 경우가 많고, 필요한 다른 헤더도 함께 설정한다 |
| `rewrite 정규식 대체경로 플래그` | 요청 경로를 바꾼다. `^`는 모든 경로에 매치되고, `break`는 이후 재작성을 멈춘다. 이 블록에 들어온 요청은 이미 404 판정을 받았으니 전부 `/404`로 바꾼다 |
| `proxy_pass 주소` | 요청을 대상 서버로 넘긴다. 결과적으로 사용자는 `대상 호스트/404` 응답을 받는다 |

기존 설정에 404 처리(불필요한 슬래시 제거, 소문자 변환 후 `/404.html` 보여 주기 등)가 이미 있다면, 그 폴백 지점에서 대상만 새 서버로 바꾸면 된다.

## 정리

- 웹 서버는 정적 자원과 앞단 관리(프록시·캐시·로드밸런싱·헬스 체크)를, WAS는 동적 처리를 맡는다.
- Apache는 연결마다 프로세스·스레드, Nginx는 이벤트 기반이라 동시 접속에 강하다.
- Spring Boot는 Tomcat을 내장한 jar로 배포하는 것이 일반적이다.
- Nginx에서는 `location`으로 묶고, `rewrite`로 경로를 바꾸고, `proxy_pass`로 다른 서버에 넘긴다.

관련 노트: [[http-web-architecture|웹 앱의 요청·응답 구조]], [[vm-vs-container|VM과 컨테이너]], [[web-scalability-components|웹 확장성의 구성 요소]], [[cdn|CDN]], [[spring-singleton-thread-safety|스프링의 싱글톤 빈과 요청 스레드]], [[high-traffic-resilience|대규모 트래픽에서 서비스를 지키는 설계]]
