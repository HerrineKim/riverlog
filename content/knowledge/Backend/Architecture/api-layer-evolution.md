---
title: "아키텍처와 API 계층의 진화: 모놀리스에서 페더레이션까지"
concept: "Architecture Evolution"
summary: "대규모 서비스가 모놀리스 → 서비스 분리(SOA·마이크로서비스) → 매크로서비스로 옮겨 가는 이유와, 그에 맞춰 API 계층이 직접 호출 → 게이트웨이 집계 → BFF → GraphQL 페더레이션으로 바뀌는 흐름을 정리했다. 반대로 모놀리스와 단순한 백엔드로 큰 트래픽을 감당하는 사례와 여러 SaaS API를 묶는 통합 플랫폼도 다룬다."
tags: ["backend", "architecture", "msa", "api", "graphql"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/airbnb-artchitectural-evolution", "https://bytebytego.com/guides/evolution-of-airbnb's-microservice", "https://bytebytego.com/guides/evolution-of-the-netflix-api-architecture", "https://bytebytego.com/guides/evolution-of-uber's-api-layer", "https://bytebytego.com/guides/how-netflix-really-uses-java", "https://bytebytego.com/guides/how-will-you-design-the-stack-overflow-website", "https://bytebytego.com/guides/how-levelsfyi-scaled-to-millions-of-users-with-google-sheets", "https://bytebytego.com/guides/api-of-apis-app-integrations"]
---

> ByteByteGo의 System Design 101 가이드 「[Airbnb's Architectural Evolution](https://bytebytego.com/guides/airbnb-artchitectural-evolution)」, 「[Evolution of Airbnb's Microservice Architecture](https://bytebytego.com/guides/evolution-of-airbnb's-microservice)」, 「[Evolution of the Netflix API Architecture](https://bytebytego.com/guides/evolution-of-the-netflix-api-architecture)」, 「[Evolution of Uber's API Layer](https://bytebytego.com/guides/evolution-of-uber's-api-layer)」, 「[How Netflix Really Uses Java](https://bytebytego.com/guides/how-netflix-really-uses-java)」, 「[How to Design Stack Overflow](https://bytebytego.com/guides/how-will-you-design-the-stack-overflow-website)」, 「[How Levelsfyi Scaled with Google Sheets](https://bytebytego.com/guides/how-levelsfyi-scaled-to-millions-of-users-with-google-sheets)」, 「[API of APIs - App Integrations](https://bytebytego.com/guides/api-of-apis-app-integrations)」를 바탕으로 재구성한 노트다.

## 왜 아키텍처는 진화하나

아키텍처는 한 번 고르고 끝나는 것이 아니라 **조직과 트래픽이 커지면서 생긴 병목을 푸는 순서**로 바뀐다. 큰 서비스들의 변천을 겹쳐 보면 비슷한 단계가 반복된다. 각 단계는 앞 단계의 문제를 풀지만 새 문제를 만든다.

| 단계 | 푸는 문제 | 새로 생기는 문제 |
| --- | --- | --- |
| 모놀리스 | 빠른 초기 개발, 단순한 배포 | 코드 소유권이 흐려지고, 누구 것도 아닌 코드가 생기고, 배포가 느려진다 |
| 서비스 분리(SOA·마이크로서비스) | 팀별 소유와 독립 배포 | 수백 개 서비스와 의존 관계를 사람이 관리하기 어렵다 |
| 마이크로 + 매크로서비스 | 관련 서비스를 큰 단위로 묶고 API를 통일한다 | 묶는 경계를 다시 설계해야 한다 |

마이크로서비스 자체의 구조와 운영 요소는 [[microservices-architecture|마이크로서비스 아키텍처]]에서 다룬다.

## 서비스를 층으로 나누기

모놀리스를 쪼갤 때 서비스를 기능별로만 나누면 서로 아무렇게나 호출하는 그물이 된다. 숙박 플랫폼 사례(Airbnb)는 **호출 방향이 한쪽으로 흐르는 층**으로 나눴다.

```text
클라이언트 → 게이트웨이
  └→ 표현 서비스(presentation): 여러 서비스 데이터를 모아 화면용으로 가공
       └→ 중간 계층 서비스(middle tier): 데이터 층에 안 맞는 핵심 비즈니스 로직
            └→ 파생 데이터 서비스(derived data): 데이터 서비스를 읽어 기본 규칙 적용
                 └→ 데이터 서비스(data): 엔티티 읽기·쓰기의 유일한 입구 → DB
```

- **데이터 서비스가 엔티티의 유일한 입구**라서, 다른 서비스가 DB를 직접 건드리지 않는다.
- 위 층은 아래 층만 부른다. 순환 의존이 생기지 않는다.
- 쓰기 흐름을 전담하는 서비스를 따로 두기도 한다.

서비스가 수백 개로 늘면 다음 단계로 **관련 서비스를 큰 단위(매크로서비스)로 묶고 API를 통일**해 사람이 이해할 수 있는 규모로 되돌린다.

## API 계층의 진화

서비스가 쪼개지면 클라이언트가 무엇을 어떻게 부를지가 문제가 된다. API 계층은 대략 네 단계를 거친다.

| 단계 | 구조 | 한계 |
| --- | --- | --- |
| 1. 모놀리스 | 앱 하나가 API 전부를 노출 | 앞의 모놀리스 한계와 같다 |
| 2. 직접 접근 | 클라이언트가 각 마이크로서비스를 직접 호출 | 수백 개 서비스를 클라이언트에 노출하게 된다. 서비스 구조가 바뀌면 앱도 바뀐다 |
| 3. 게이트웨이 집계 | 게이트웨이가 여러 서비스를 불러 화면 하나에 필요한 데이터를 합친다 | 모든 팀의 집계 로직이 게이트웨이 하나에 몰려 병목이 된다 |
| 4. 페더레이션 게이트웨이 | 도메인 팀마다 자기 GraphQL 서브그래프를 소유하고, 게이트웨이가 이를 하나의 그래프로 합친다 | 스키마 거버넌스, 서브그래프 간 조인 비용 |

### 게이트웨이 집계에서 페더레이션으로

영상 스트리밍 사례(Netflix)는 중간에 **BFF(Backend For Frontend)** 단계를 거쳤다.

```text
단일 API 게이트웨이
  → 문제: TV·모바일·웹 클라이언트마다 필요한 데이터가 조금씩 다르다
BFF: 클라이언트 팀이 자기 화면용 집계 스크립트를 작성(게이트웨이는 프록시로 물러남)
  → 문제: UI 개발자가 서버 스크립트와 리액티브 프로그래밍까지 떠안는다
GraphQL 페더레이션: 도메인 팀이 서브그래프를 소유, 클라이언트는 하나의 그래프에 질의
```

BFF 자체는 [[bff|BFF]], GraphQL과 페더레이션 도입 패턴은 [[graphql|GraphQL]]에서 다룬다.

### 게이트웨이를 셀프서비스로

차량 호출 사례(Uber)는 게이트웨이를 세 세대로 바꿨다.

| 세대 | 모습 |
| --- | --- |
| 1세대 | 배차 서비스와 API 서비스 두 개로 시작한 자연 발생적 구조 |
| 2세대 | 모든 것을 담는 단일 게이트웨이. 마이크로서비스가 수천 개로 늘어난다 |
| 3세대 | **셀프서비스·탈중앙·계층형** 게이트웨이. 새 사업 부문이 늘면서 각 팀이 게이트웨이 설정을 직접 관리한다 |

공통 교훈은 **게이트웨이가 중앙 팀의 병목이 되면, 소유권을 도메인 팀에 나눠 주고 게이트웨이는 조립만 한다**는 것이다.

## 단순한 구조로 버티는 사례

진화의 단계를 꼭 다 밟아야 하는 것은 아니다.

| 사례 | 구조 | 원칙 |
| --- | --- | --- |
| Stack Overflow | 클라우드 대신 자체 서버, 소수의 웹 서버, **모놀리스** | 트래픽이 크다는 이유만으로 마이크로서비스·이벤트 소싱·샤딩이 필요한 것은 아니다. 캐시와 잘 튜닝된 DB로 멀리 간다 |
| Levels.fyi | 초기에 **스프레드시트를 DB처럼** 쓰고 서버리스 함수와 정적 프론트엔드로 서비스 | 단순하게 시작하고 병목이 보일 때 바꾼다. 백엔드를 미리 만들지 않아 제품에 집중한다 |

면접에서 기대하는 「정답 구조」(서비스별 DB, 메시지 큐, CQRS, 샤딩)와 실제로 잘 돌아가는 구조는 다를 수 있다. **설계는 요구 사항과 팀 규모에서 출발해야지, 유행하는 부품 목록에서 출발하지 않는다.**

## API를 묶는 API: 통합 플랫폼

Zapier, IFTTT, n8n 같은 노코드 통합 도구는 수많은 SaaS의 API를 하나의 **트리거-액션(trigger-action)** 모델로 감싼 「API의 API」다.

```text
트리거: 앱 A에서 이벤트 발생(웹훅 수신 또는 주기적 폴링)
  → 필터·데이터 변환(필드 매핑)
  → 액션: 앱 B·C의 API 호출
```

- 각 서비스의 인증(OAuth 토큰)과 API 차이를 커넥터가 흡수한다.
- 트리거는 웹훅을 지원하면 웹훅, 아니면 폴링으로 감지한다. 웹훅은 [[webhook|웹훅]]에서 다룬다.

## 정리

- 아키텍처는 모놀리스 → 서비스 분리 → 매크로서비스처럼 **병목이 생긴 순서대로** 바뀐다.
- 서비스를 나눌 때는 데이터 → 파생 데이터 → 중간 계층 → 표현으로 호출 방향이 한쪽으로 흐르게 층을 둔다.
- API 계층은 직접 호출 → 게이트웨이 집계 → BFF → GraphQL 페더레이션으로, **집계 책임을 중앙에서 도메인 팀으로** 옮겨 간다.
- 큰 트래픽도 모놀리스나 단순한 백엔드로 버틸 수 있다. 쪼개는 이유는 트래픽보다 조직 규모와 배포 독립성이다.

관련 노트: [[microservices-architecture|마이크로서비스 아키텍처]], [[bff|BFF (Backend For Frontend)]], [[graphql|GraphQL]], [[auth-placement|인증·인가 로직은 어디에 두나]], [[web-scalability-components|웹 확장성의 구성 요소]], [[big-tech-stack-anatomy|대규모 서비스 기술 스택 해부]]
