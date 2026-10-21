---
title: "백엔드 테스트: 범위, 대역, 구조, 자동화"
concept: "Backend Testing"
summary: "도메인 로직은 프레임워크 없는 단위 테스트로, 경계는 실제 자원이나 에뮬레이터(Testcontainers·LocalStack)로 검증한다. 목은 통제할 수 없는 의존성에만 쓰고, 테스트는 공개 인터페이스만 보며 수를 줄인다. Describe-Context-It으로 구조화하고, CI는 결과를 PR 단계에 보여 준다."
tags: ["backend", "testing", "ci-cd", "software-engineering"]
source: other
date: "2026-10-21"
sources: ["https://github.com/cheese10yun/blog-sample/blob/master/test-code/README.md", "https://blog.outsider.ne.kr/1275", "https://blog.shiren.dev/2020-06-15-%EC%9C%A0%EC%9A%A9%ED%95%9C%ED%85%8C%EC%8A%A4%ED%8A%B8%EC%BC%80%EC%9D%B4%EC%8A%A4%EB%A5%BC%EC%9C%84%ED%95%9C%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98%EC%9E%90%EC%84%B8/", "https://gyuwon.github.io/blog/false-positive-in-software-testing/", "https://johngrib.github.io/wiki/junit5-nested/", "http://woowabros.github.io/tools/2019/07/18/localstack-integration.html", "https://engineering.linecorp.com/ko/blog/server-side-test-automation-journey-1/", "https://testcontainers.com/"]
---

> 「[테스트 코드 작성에 대한 나름의 고찰](https://github.com/cheese10yun/blog-sample/blob/master/test-code/README.md)」, 「[유닛테스트에 대한 생각](https://blog.outsider.ne.kr/1275)」, 「[유용한 테스트 케이스를 위한 개발자의 자세](https://blog.shiren.dev/2020-06-15-%EC%9C%A0%EC%9A%A9%ED%95%9C%ED%85%8C%EC%8A%A4%ED%8A%B8%EC%BC%80%EC%9D%B4%EC%8A%A4%EB%A5%BC%EC%9C%84%ED%95%9C%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98%EC%9E%90%EC%84%B8/)」, 「[소프트웨어 테스팅의 False Positive](https://gyuwon.github.io/blog/false-positive-in-software-testing/)」, 「[JUnit5로 계층 구조의 테스트 코드 작성하기](https://johngrib.github.io/wiki/junit5-nested/)」, 「[LocalStack을 활용한 Integration Test 환경 만들기](http://woowabros.github.io/tools/2019/07/18/localstack-integration.html)」, 「[서버 사이드 테스트 자동화 여정](https://engineering.linecorp.com/ko/blog/server-side-test-automation-journey-1/)」을 바탕으로 재구성한 노트다.

## 백엔드 테스트에서 정할 것

백엔드 테스트는 네 가지 결정으로 모양이 정해진다.

| 결정 | 질문 |
| --- | --- |
| **범위** | 무엇을 가장 작은 단위로 검증할까 |
| **대역** | DB·메시지 큐·외부 API를 진짜로 쓸까, 가짜로 바꿀까 |
| **구조** | 테스트를 어떻게 읽히게 쓸까 |
| **자동화** | CI에서 언제, 무엇을, 어떻게 보여 줄까 |

테스트 층(단위·통합·E2E)과 피라미드·트로피 같은 전략의 모양은 [[frontend-test-types|테스트의 종류]]에 있다. 여기서는 서버 쪽에서 특히 갈리는 결정을 다룬다.

## 1. 범위: 도메인은 작게

- **도메인 로직은 프레임워크 없는 단위 테스트로.** 스프링 컨텍스트나 DB 없이 순수 객체(POJO)만으로 검증하면 빠르고 의존성이 적다. 도메인 테스트는 비즈니스 규칙을 보여 주는 문서도 된다.
- **슬라이스 테스트보다 작은 범위를 먼저 고른다.** 검증 대상의 의존성이 적을수록 쓰기도 고치기도 쉽다.
- **Given 절이 너무 길면 설계 신호다.** 준비할 연관 데이터가 많다면 테스트 범위가 너무 넓거나 객체가 너무 많은 것에 의존한다. 의존성을 줄이고 객체 생성을 단순하게 만들면 단위 테스트가 늘어난다.
- **함수 단위가 기본, 필요하면 동작 단위.** 여러 함수를 거치는 사용자 시나리오는 동작(behavior) 단위로 묶는다.

## 2. 대역: 목은 마지막 수단

| 의존성 | 권장 |
| --- | --- |
| 데이터베이스 | 가능하면 **진짜 DB**. 운영과 같은 엔진을 Testcontainers로 띄운다. 인메모리 DB는 SQL 방언·제약이 달라 거짓 통과를 만든다 |
| 클라우드 서비스(S3, SQS, DynamoDB) | **에뮬레이터**. LocalStack을 컨테이너로 띄우고 클라이언트의 엔드포인트만 바꾼다. 액세스 키·과금·공용 자원 간섭이 없다 |
| 과금되는 외부 API, 자동화가 어려운 인증 | 여기에만 **목·스텁**. HTTP 수준에서는 WireMock 같은 가짜 서버를 쓴다 |

과도한 목은 **실제와 다르게 동작해도 통과하는** 테스트를 만든다. 반대로 구현 세부에 묶인 목은 동작이 맞아도 깨진다.

### 에뮬레이터로 통합 테스트 환경 만들기

```text
테스트 시작
  └─ Testcontainers가 컨테이너 기동 (DB, LocalStack)
       └─ 테스트 설정이 클라이언트 빈의 엔드포인트를 컨테이너 주소로 교체
            └─ 테스트 실행 ──▶ 종료 시 컨테이너 폐기
```

- 서비스 목록만 바꿔 쓰도록 컨테이너 설정을 공용 테스트 모듈의 애너테이션·확장으로 감싼다.
- 로컬 실행은 프로필로 나눈다. `local` 프로필은 에뮬레이터를, 나머지는 실제 클라우드를 본다.
- 여러 애플리케이션이 메시지를 주고받는 시나리오는 `docker compose`로 공용 에뮬레이터를 띄우고 각 앱이 같은 엔드포인트를 보게 한다.
- 에뮬레이터는 실제 서비스의 모든 동작(권한, 일관성, 한도)을 재현하지 못한다. 경계 동작은 스테이징에서 한 번 더 확인한다.

## 3. 무엇을 남길까: 적고 믿을 수 있게

- **공개 인터페이스만 테스트한다.** private 메서드를 테스트하고 싶다면 그 로직을 별도 객체로 뽑아 그 객체의 공개 인터페이스를 테스트한다. 테스트를 위해 접근 제어자를 넓히는 것은 최후의 절충이다.
- **테스트 전용 코드를 운영 코드에 넣지 않는다.** 테스트를 위한 setter는 도메인의 방어 로직과 객체의 자율성을 깨뜨린다. 불가피하면 접근 범위를 가장 좁게 둔다.
- **테스트는 적을수록 좋다.** 개발 중에 쓴 「지금을 위한」 테스트는 끝나면 「미래를 위한」 테스트로 정리하고 나머지는 지운다. 리팩터링으로 코드가 사라지면 그 테스트도 함께 사라진다. 하위 층에서 검증한 로직을 상위 층에서 반복하지 않는다.
- **초록불에 속지 않는다.** 쉽게 쓴 테스트가 꼭 도움이 되는 것은 아니다. 커버리지는 빠진 곳을 찾는 양적 지표일 뿐이다. 테스트의 질은 **뮤테이션 테스트**(코드를 일부러 바꿨을 때 테스트가 실패하나)로 점검한다.

### 거짓 양성과 거짓 음성

통계 용어를 빌리면 테스트 실패가 「양성 반응」이다.

| | 코드가 정상 | 코드에 결함 |
| --- | --- | --- |
| 테스트 실패 | **거짓 양성(false positive)**: 잘못된 경보 | 참 양성 |
| 테스트 통과 | 참 음성 | **거짓 음성(false negative)**: 놓친 결함 |

거짓 양성은 대개 테스트가 **구현 세부에 묶여** 생긴다. 리팩터링할 때마다 깨지는 테스트가 쌓이면 개발자는 실패를 무시하기 시작하고, 진짜 결함까지 놓친다. 「잘못된 경보(false alarm)」로 기억하면 헷갈리지 않는다.

## 4. 구조: Describe-Context-It

테스트를 대상 → 상황 → 기대 행동의 계층으로 쓰면 실패 보고서가 그대로 명세가 된다.

| 층 | 쓰는 것 | 한국어로 쓸 때 |
| --- | --- | --- |
| **Describe** | 테스트 대상 | 명사 (「주문 취소」) |
| **Context** | 대상이 놓인 상황 | 「~인 경우」, 「~할 때」 |
| **It** | 기대하는 행동 | 「~한다」, 「~이다」. 수동형(「~된다」)은 피한다 |

```java
@DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
class 주문_취소 {
    @Nested
    class 배송_전인_경우 {
        @Test
        void 전액을_환불한다() { /* subject() 호출 후 단언 */ }
    }
    @Nested
    class 배송이_시작된_경우 {
        @Test
        void 취소를_거절한다() { }
    }
}
```

- JUnit 5는 `@Nested`로 계층을 만든다. 이어 읽었을 때 한 문장이 되는지 확인한다.
- 테스트 대상 호출은 `subject()` 같은 메서드 하나에 모아 시그니처가 바뀌어도 한 곳만 고친다.
- 같은 패턴을 Kotest `DescribeSpec`, RSpec, Jest·Vitest의 중첩 `describe`, Go의 Ginkgo가 지원한다.

### 테스트 데이터

| 상황 | 방법 |
| --- | --- |
| 단순한 객체 | 생성자·빌더·테스트 픽스처 팩토리 |
| 복잡한 요청·응답 | JSON 같은 외부 파일. 다만 값을 바꿔 가며 검증해야 하면 파일이 불어나 관리가 어렵다 |
| 여러 테스트가 쓰는 데이터 | **공유하지 않는다.** 누군가 공용 데이터를 고치면 무관한 테스트가 깨진다. 테스트마다 만들고 정리한다 |

## 5. 자동화: 결과를 PR에서 보여 준다

| 원칙 | 내용 |
| --- | --- |
| 작게 시작 | 이미 있는 단위 테스트부터 CI에 올리고 넓혀 간다 |
| **PR 단계에 노출** | 배포 단계에서 막기보다 코드 리뷰 단계에서 결과를 보여 주면 피드백이 빠르고 파이프라인이 덜 멈춘다 |
| 차단 정책은 신중히 | 잘못된 테스트가 배포를 막을 수 있다. 방치되거나 주석 처리된 테스트는 고치거나 지운다 |
| **설정 검증 테스트** | 환경별 설정 객체가 실제로 로딩되는지 테스트해 설정 오류로 서버가 못 뜨는 일을 막는다 |
| 외부 의존성 점검 | 연동 서비스·스토리지가 그 환경에서 기대한 상태인지 확인하는 테스트를 해당 환경에서 돌린다 |
| 변경 단위 성능 테스트 | PR마다 전용 환경에 배포해 부하를 걸고 지표를 리뷰에 붙인다 |
| 중복 실행 줄이기 | 같은 코드에 같은 테스트를 환경마다 반복하지 않는다 |
| 수평 확장 | 테스트가 늘어 파이프라인이 병목이면 CI 에이전트를 늘린다 |

## 정리

- 도메인은 순수 단위 테스트로, 경계는 진짜 자원이나 에뮬레이터로 검증한다.
- 목은 통제할 수 없는 의존성에만 쓴다.
- 공개 인터페이스만 보고, 적게 남기고, 거짓 양성을 줄인다.
- 대상·상황·행동의 계층으로 쓰면 테스트가 명세가 된다.
- CI 결과는 리뷰 단계에서 보여 준다.

관련 노트: [[frontend-test-types|프론트엔드 테스트의 종류와 도구]], [[js-testing-best-practices|JavaScript 테스트 모범 사례]], [[tdd|TDD]], [[api-testing|API 테스트]], [[ci-cd|CI/CD]], [[humble-object-pattern|험블 객체 패턴]]
