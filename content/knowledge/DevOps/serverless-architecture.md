---
title: "서버리스 아키텍처"
concept: "Serverless"
summary: "서버를 예약하지 않고 이벤트가 올 때만 코드를 실행해 실행한 만큼 내는 방식이다. IaaS·PaaS·컨테이너와의 차이, FaaS와 BaaS, 함수를 부르는 네 가지 경로, 함수를 나누는 네 가지 코드 구성(함수당 작업 하나·서비스·모놀리식·그래프), 콜드 스타트·실행 시간·연결 수·종속 같은 제약과 맞는 곳을 정리했다."
tags: ["devops", "cloud", "serverless", "aws", "architecture"]
source: other
date: "2026-10-21"
sources: ["https://microservices.io/patterns/deployment/serverless-deployment.html", "https://www.serverless.com/blog/serverless-architecture-code-patterns", "https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html"]
---

> microservices.io의 「[Pattern: Serverless deployment](https://microservices.io/patterns/deployment/serverless-deployment.html)」, Serverless Inc.의 「[Serverless Architecture Code Patterns](https://www.serverless.com/blog/serverless-architecture-code-patterns)」를 바탕으로 재구성하고, 수치는 AWS Lambda 공식 문서 「[Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)」로 확인했다.

## 서버리스란

**서버리스(serverless)는 서버·VM·컨테이너를 미리 잡아 두지 않고, 코드를 올리면 클라우드가 이벤트가 올 때마다 실행해 주고 실제 사용한 자원만큼 과금하는 실행 방식이다.** 서버가 없는 것이 아니라 서버를 **의식하지 않는** 것이다. OS 패치, 용량 계획, 확장, 격리는 제공자가 맡고, 사용자는 함수 코드와 메모리·타임아웃 같은 성능 조건만 정한다.

| 모델 | 사용자가 관리 | 과금 단위 | 예 |
| --- | --- | --- | --- |
| IaaS | OS부터 위 전부 | 켜 둔 시간 | EC2, Compute Engine |
| PaaS | 앱 코드와 설정. 인스턴스 수는 사용자가 정한다 | 켜 둔 인스턴스 시간 | App Service, Elastic Beanstalk, Heroku |
| 컨테이너 서버리스 | 컨테이너 이미지 | 요청·실행 중인 시간. 0으로 줄어들 수 있다 | Cloud Run, Fargate, Azure Container Apps |
| FaaS | 함수 코드 | 호출 횟수 × 실행 시간 × 메모리 | AWS Lambda, Azure Functions, Cloud Run functions |

FaaS(Function as a Service)와 함께 인증·DB·스토리지·큐를 관리형 서비스로 쓰는 것을 BaaS(Backend as a Service)라 한다. Firebase, Supabase, Cognito, DynamoDB, S3가 여기에 든다. **서버리스 앱은 대개 FaaS로 접착 코드를 짜고 상태는 BaaS에 둔다.**

## 함수를 부르는 경로

함수는 상태 없는(stateless) 이벤트 처리기다. 호출 경로는 네 가지다.

| 경로 | 예 |
| --- | --- |
| 다른 서비스의 이벤트 | S3에 객체 생성, DynamoDB 변경 스트림, SQS·Kinesis 메시지, 이메일 수신 |
| HTTP 요청 | API Gateway가 HTTP 요청을 이벤트 객체로 바꿔 함수를 부르고 반환값을 응답으로 바꾼다. Lambda는 함수 URL로 게이트웨이 없이도 받는다 |
| 직접 호출 | SDK·API로 JSON을 넘겨 부른다. 동기(결과를 기다림)와 비동기(큐에 넣고 반환) 중 고른다 |
| 일정 | cron 식으로 5분마다, 매일 새벽 3시에 |

이벤트가 오면 제공자는 놀고 있는 실행 환경을 찾고, 없으면 새로 띄워 핸들러를 부른다. 부하만큼 실행 환경을 늘리고 일이 없으면 0까지 줄인다. Lambda가 이를 마이크로VM으로 어떻게 하는지는 [[aws-lambda-internals|AWS Lambda의 내부 구조]]에 있다.

## 함수를 나누는 코드 구성

함수 하나에 얼마만큼의 일을 넣을지에 따라 네 가지 모양이 있다.

| 구성 | 모양 | 장점 | 단점 |
| --- | --- | --- | --- |
| 작업당 함수(nanoservice) | 엔드포인트·작업 하나마다 함수 하나 | 관심사가 완전히 분리되어 하나만 고쳐 배포한다. 디버깅이 쉽다 | 함수가 수백 개로 늘어 관리가 어렵다. 각 함수가 덜 불려 **콜드 스타트가 잦다**. 배포가 느리다 |
| 서비스 | 데이터 모델 하나(예: 사용자)의 CRUD 4개 정도를 한 함수에. 함수 안에 작은 라우터를 둔다 | 함수 수가 적고 자주 불려 덜 식는다 | 한 함수의 결과가 여러 가지라 디버깅이 조금 어렵다 |
| 모놀리식 | 앱 전체를 함수 하나에. 모든 경로가 그 함수로 간다 | 이해·관리가 쉽다. 기존 웹 프레임워크(Express 등)를 어댑터로 그대로 올린다 | 크기 제한에 걸리기 쉽고, 실행 시간이 제각각이라 성능을 읽기 어렵다 |
| 그래프 | 함수 하나 + GraphQL 엔드포인트 하나. 쿼리가 필요한 데이터를 고른다 | 엔드포인트가 하나라 배포가 빠르다. 호출당 과금과 잘 맞는다 | 모놀리식과 같은 크기·성능 문제. [[graphql\|GraphQL]] |

정답은 없다. 흔한 출발점은 **도메인(서비스) 단위**로 묶고, 부하·권한·배포 주기가 다른 작업만 떼어 내는 것이다. 마이크로서비스를 서버리스로 배포하는 것도 이 선택의 한 경우다([[microservices-architecture|마이크로서비스 아키텍처]]).

## 제약

| 제약 | 내용 (AWS Lambda 기준) | 대응 |
| --- | --- | --- |
| 실행 시간 | 호출 하나에 최대 15분 | 긴 작업은 쪼개 [[cloud-design-patterns\|큐·워크플로]]로 잇거나 컨테이너 잡으로 옮긴다 |
| 콜드 스타트 | 새 실행 환경을 띄우고 런타임·코드를 초기화하는 지연. 런타임·패키지 크기·VPC 설정에 따라 수십 ms~수 초 | 패키지를 줄인다. 프로비저닝된 동시성, SnapStart(Java·Python·.NET) |
| 상태 | 실행 환경은 언제든 사라진다. 메모리·로컬 디스크(`/tmp`)는 캐시로만 쓴다 | 상태는 DB·캐시·객체 스토리지에 둔다 |
| 동시성 | 계정·리전당 기본 동시 실행 1,000(증설 요청 가능) | 함수별 예약 동시성으로 한 함수가 전부 먹지 않게 한다 |
| DB 연결 | 실행 환경마다 연결을 열어 폭주 시 DB 연결 수가 바닥난다 | RDS Proxy 같은 연결 풀 프록시, HTTP 기반 DB API([[connection-pool\|커넥션 풀]]) |
| 크기 | 동기 호출 페이로드 6MB, zip 패키지 압축 해제 250MB, 컨테이너 이미지 10GB, 메모리 최대 10,240MB | 큰 파일은 S3를 거친다(클레임 체크) |
| 종속 | 이벤트 형식·트리거·권한 모델이 제공자마다 다르다 | 핸들러는 얇게, 도메인 로직은 제공자와 무관한 모듈로 둔다 |
| 관측 | 요청이 여러 함수·관리형 서비스를 지나 흐름이 흩어진다 | 분산 트레이싱과 상관관계 ID([[observability\|관측 가능성]]) |

과금은 Lambda 기준 1ms 단위다(2020년 전에는 100ms 단위로 올림했다). 그래서 **트래픽이 들쭉날쭉하고 평균 사용률이 낮은 작업일수록** 이득이 크고, 하루 종일 꾸준히 바쁜 서비스는 컨테이너나 VM이 싸다.

## 맞는 곳과 아닌 곳

| 맞는 곳 | 맞지 않는 곳 |
| --- | --- |
| 이벤트 처리(업로드된 이미지 리사이즈, 웹훅 수신) | 지연에 민감하고 콜드 스타트를 감당할 수 없는 경로 |
| 트래픽이 드물거나 폭주하는 API | 계속 높은 부하가 이어지는 서비스(비용 역전) |
| 예약 작업, 데이터 파이프라인의 단계 | 오래 연결을 유지해야 하는 서버(WebSocket 서버, 게임 서버). API Gateway WebSocket처럼 관리형 연결 계층을 따로 써야 한다 |
| 프론트엔드에 붙는 작은 백엔드(BFF, 폼 처리) | 실행 시간이 길거나 GPU·특수 하드웨어가 필요한 작업 |

## 정리

- 서버리스는 **서버 관리와 용량 계획을 제공자에게 넘기고, 실행한 만큼만 내는** 실행 모델이다. FaaS로 로직을, BaaS로 상태를 맡긴다.
- 함수는 이벤트·HTTP·직접 호출·일정으로 불리고, 상태를 가질 수 없다.
- 함수를 얼마나 잘게 나눌지는 관리 비용과 콜드 스타트 사이의 거래다. 도메인 단위로 묶는 것이 무난한 출발점이다.
- 15분 실행 제한, 콜드 스타트, DB 연결 폭주, 제공자 종속을 설계 단계에서 감안한다.

관련 노트: [[aws-lambda-internals|AWS Lambda의 내부 구조]], [[aws-cloud-basics|AWS 클라우드 기초]], [[cloud-native|클라우드 네이티브]], [[devops-sre-platform-engineering|DevOps, SRE, 플랫폼 엔지니어링, NoOps]], [[cloud-design-patterns|클라우드 설계 패턴]], [[database-selection|데이터베이스 선택]]
