---
title: "개발자 역량 지도: 주니어에서 시니어, 풀스택, 아키텍트까지"
concept: "Skill Roadmap"
summary: "주니어에서 시니어로 가며 넓혀야 할 열한 가지 역량(협업 도구, 언어, API, 서버·클라우드, 인증·테스트, DB, CI/CD, 자료구조·알고리즘, 시스템 설계, 디자인 패턴, AI 도구), 풀스택 개발자가 다루는 일곱 영역, 소프트웨어 아키텍트에게 필요한 지식 지도, 모든 개발자가 알아야 할 여덟 가지 표준을 한 장에 정리한다."
tags: ["career", "roadmap", "growth", "architecture", "learning"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/11-steps-to-go-from-junior-to-senior-developer", "https://bytebytego.com/guides/a-roadmap-for-full-stack-development", "https://bytebytego.com/guides/the-ultimate-software-architect-knowledge-map", "https://bytebytego.com/guides/top-8-standards-every-developer-should-know"]
---

> ByteByteGo의 System Design 101 가이드 「[11 Steps to Go From Junior to Senior Developer](https://bytebytego.com/guides/11-steps-to-go-from-junior-to-senior-developer)」, 「[A Roadmap for Full-Stack Development](https://bytebytego.com/guides/a-roadmap-for-full-stack-development)」, 「[The Ultimate Software Architect Knowledge Map](https://bytebytego.com/guides/the-ultimate-software-architect-knowledge-map)」, 「[Top 8 Standards Every Developer Should Know](https://bytebytego.com/guides/top-8-standards-every-developer-should-know)」를 바탕으로 재구성한 노트다.

## 이 지도를 읽는 법

역량 지도는 **다 외워야 할 목록이 아니라 빈 곳을 찾는 지도**다. 깊게 아는 영역 하나를 두고, 나머지는 필요할 때 찾아 쓸 수 있을 만큼 넓혀 가는 T자형이 기본 전략이다. 분야별 세부 지도는 [[backend-developer-roadmap|백엔드 개발자가 알아야 할 것]], [[frontend-roadmap|프론트엔드 학습 로드맵]]에 있다.

## 주니어에서 시니어로: 열한 가지 역량

| 영역 | 익힐 것 | 왜 |
| --- | --- | --- |
| 협업 도구 | 이슈 트래커, 위키, 메신저, 화상 회의 | 개발은 사회적 활동이다. 일을 드러내고 맞추는 도구에 능숙해야 한다 |
| 프로그래밍 언어 | 한두 개를 깊게(Java, Python, JavaScript·TypeScript, C#, Go 등) | 언어 하나를 깊게 알면 다른 언어는 차이만 배우면 된다 |
| API 개발 | REST, GraphQL, gRPC | 시스템은 API로 연결된다([[api-architectural-styles\|API 아키텍처 스타일]]) |
| 웹 서버와 호스팅 | 웹 서버, 클라우드(AWS, Azure, GCP), 쿠버네티스 | 코드가 어디서 어떻게 도는지 알아야 장애를 다룬다 |
| 인증과 테스트 | JWT, OAuth 2.0 / TDD, E2E, 성능 테스트 | 안전하고 믿을 수 있는 코드를 내놓는 기본기 |
| 데이터베이스 | 관계형(PostgreSQL, MySQL, SQLite)과 비관계형(MongoDB, Cassandra, Redis) | 데이터 모델 선택이 시스템 수명을 좌우한다 |
| CI/CD | GitHub Actions 등 파이프라인 도구 | 자주, 안전하게 배포하는 습관([[ci-cd\|CI/CD]]) |
| 자료구조·알고리즘 | 빅오, 정렬, 트리, 그래프 | 성능을 예측하고 맞는 도구를 고르는 눈 |
| 시스템 설계 | 네트워크, 캐시, CDN, 마이크로서비스, 메시징, 로드 밸런싱, 복제, 분산 시스템 | 시니어의 핵심. 기능이 아니라 시스템을 책임진다([[system-design-fundamentals\|시스템 설계의 품질 속성과 트레이드오프]]) |
| 디자인 패턴 | 의존성 주입, 팩토리, 프록시, 옵저버, 퍼사드 | 공통 어휘로 설계를 빠르게 소통한다([[gof-design-patterns\|GoF 디자인 패턴]]) |
| AI 도구 | AI 코딩 어시스턴트와 에이전트, 프롬프트 작성, LLM 애플리케이션 구성 | 반복 작업을 맡기고 검증하는 능력이 생산성을 가른다 |

기술 목록 밖의 성장(피드백 사이클, 업무 난이도 높이기)은 [[growing-at-work|회사에서 빠르게 성장하는 법]]에 있다.

## 풀스택 개발자가 다루는 영역

| 영역 | 하는 일 |
| --- | --- |
| 프론트엔드 | 사용자 인터페이스와 경험을 만든다 |
| 백엔드 | 서버 로직, 데이터베이스 연동, 여러 서비스의 통합을 맡는다 |
| 데이터베이스 | 데이터를 저장·조회·변경하는 구조를 설계한다 |
| 모바일 | 모바일 기기용 앱을 만든다 |
| 클라우드 | 클라우드 플랫폼에 배포하고 운영한다 |
| UI/UX 디자인 | 화면과 사용 흐름을 설계한다 |
| 인프라와 DevOps | 인프라, 배포, CI/CD를 관리한다 |

풀스택은 모든 영역의 전문가가 아니라 **요청 하나가 화면에서 DB까지 가는 전 구간을 혼자 끝낼 수 있는 사람**이다.

## 소프트웨어 아키텍트의 지식 지도

아키텍트는 계속 배우는 역할이다. 기술 깊이와 함께 의사결정과 소통이 무게를 갖는다.

| 영역 | 내용 |
| --- | --- |
| 프로그래밍 언어 | 한두 언어의 숙련 |
| 도구 | 버전 관리, CI 서버, 이슈 트래커, 로그 분석, 정적 분석 |
| 설계 원칙 | 객체 지향, 클린 코드, TDD, DDD, CAP 정리, MVC, ACID, GoF 패턴 |
| 아키텍처 패턴 | 마이크로서비스, 발행-구독, 계층형, 이벤트 기반, 클라이언트-서버, 헥사고날([[software-architecture-patterns\|소프트웨어 아키텍처 패턴]]) |
| 플랫폼 | 컨테이너와 오케스트레이션, 클라우드, 서버리스, CDN, API 게이트웨이, 분산 시스템, CI/CD |
| 데이터와 분석 | SQL·NoSQL, Kafka 같은 스트리밍, 객체 스토리지, 데이터 이전, OLAP |
| 네트워크와 보안 | DNS, TCP, TLS·HTTPS, 암호화, JWT, OAuth, 자격 증명 관리 |
| 보조 역량 | 의사결정, 기술 동향 파악, 이해관계자 관리, 소통, 추정, 리더십 |

## 모든 개발자가 알아야 할 여덟 가지 표준

표준은 서로 다른 시스템이 같은 말로 대화하게 만든다. 표준을 알면 바퀴를 다시 만들지 않는다.

| 표준 | 정한 곳 | 다루는 것 |
| --- | --- | --- |
| TCP/IP | IETF | 인터넷 통신의 기반([[osi-7-layer\|OSI 7계층]]) |
| HTTP | IETF | 웹의 요청·응답 규칙([[http\|HTTP 프로토콜]]) |
| SQL | ISO/IEC | 관계형 데이터 질의 언어([[sql-basics\|SQL 기초]]) |
| OAuth | IETF | 비밀번호를 넘기지 않고 제한된 접근 권한을 위임한다([[oauth2\|OAuth 2.0]]) |
| HTML·CSS | WHATWG, W3C | 브라우저마다 같은 화면을 그리게 해 호환성 비용을 줄인다 |
| ECMAScript | Ecma International(TC39) | JavaScript의 언어 명세([[ecmascript-tc39\|ECMAScript 표준과 TC39 프로세스]]) |
| ISO 8601 | ISO | 날짜·시간 표기(`2026-10-21T09:00:00Z`). 나라와 문화에 따라 다른 형식으로 생기는 버그를 막는다 |
| OpenAPI | OpenAPI Initiative | REST API를 기계가 읽을 수 있게 기술하는 명세. 문서·클라이언트 코드·테스트를 생성한다 |

## 정리

- 역량 지도는 빈 곳을 찾는 도구다. 하나를 깊게, 나머지는 넓게 쌓는다.
- 시니어로 가는 핵심은 코드 너머의 시스템 설계, 테스트·배포, 협업이다.
- 풀스택은 요청 하나의 전 구간을 끝낼 수 있는 사람이고, 아키텍트는 기술 지식 위에 의사결정과 소통을 얹은 역할이다.
- 표준을 알면 다른 시스템과 바로 연결된다.

관련 노트: [[backend-developer-roadmap|백엔드 개발자가 알아야 할 것]], [[frontend-roadmap|프론트엔드 학습 로드맵]], [[growing-at-work|회사에서 빠르게 성장하는 법]], [[tech-reading-list|개발 분야별 추천 도서]], [[tech-interview-prep|기술 면접 준비: 유형별 대비와 시스템 디자인 7단계]], [[engineering-levels|엔지니어 레벨]]
