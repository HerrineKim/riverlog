---
title: "AWS Lambda의 내부 구조"
concept: "AWS Lambda Internals"
summary: "서버리스 함수 서비스 Lambda가 요청을 처리하는 과정을 동기·비동기 호출 경로, 실행 환경을 배정하는 Assignment 서비스와 Placement 서비스, 함수마다 격리하는 Firecracker 마이크로VM, 코드·이미지를 청크로 나눠 공유하는 저장 계층, 콜드 스타트를 줄이는 SnapStart로 나눠 정리했다."
tags: ["aws", "cloud", "devops", "performance", "infra"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/how-does-aws-lambda-work-behind-the-scenes", "https://bytebytego.com/guides/what-makes-aws-lambda-so-fast", "https://firecracker-microvm.github.io/", "https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html"]
---

> ByteByteGo의 System Design 101 가이드 「[How AWS Lambda Works Behind the Scenes](https://bytebytego.com/guides/how-does-aws-lambda-work-behind-the-scenes)」, 「[What makes AWS Lambda so fast?](https://bytebytego.com/guides/what-makes-aws-lambda-so-fast)」를 바탕으로, [Firecracker](https://firecracker-microvm.github.io/)와 [Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html) 공식 문서로 확인해 재구성한 노트다.

## Lambda란

AWS Lambda는 **이벤트가 올 때만 함수를 실행하고 실행한 시간만큼 과금하는 서버리스 컴퓨팅 서비스**다. 사용자는 코드만 올리고, 서버 배정·격리·확장은 Lambda가 맡는다. 언제 쓰면 좋은지는 [[aws-cloud-basics|AWS 클라우드 기초]]에 있다. 여기서는 그 뒤에서 무슨 일이 일어나는지를 본다.

Lambda가 빠르고 안전하게 돌아가는 이유는 네 가지 부품으로 나뉜다.

| 부품 | 하는 일 |
| --- | --- |
| 호출 경로(Frontend) | 요청을 받아 인증하고, 동기 호출은 바로, 비동기 호출은 내부 큐를 거쳐 실행으로 넘긴다 |
| Assignment 서비스 | 함수별로 쓸 수 있는 실행 환경을 추적하고, 요청을 따뜻한 환경에 배정하거나 새 환경을 요청한다 |
| Firecracker 마이크로VM | 실행 환경 하나하나를 가벼운 VM으로 격리한다 |
| 저장 계층 | 함수 코드·컨테이너 이미지를 빠르게 가져오도록 쪼개 저장하고 공유한다 |

## 호출 경로

### 동기 호출

호출자(SDK, API Gateway, ALB 등)가 응답을 기다린다.

```text
호출자 → Frontend
          └─ Assignment 서비스: 이 함수의 따뜻한(warm) 실행 환경이 있나?
               ├─ 있음 → 그 환경에서 Invoke
               └─ 없음 → Placement 서비스가 워커 호스트에 새 실행 환경(샌드박스)을 배치
                         → Init: 함수 패키지를 내려받고 런타임을 초기화 (콜드 스타트)
                         → Invoke
```

### 비동기 호출

호출자는 응답을 기다리지 않는다. S3 업로드 알림, EventBridge 이벤트가 이 방식이다.

```text
호출자 → Frontend → 요청 인증 후 내부 큐(SQS)에 이벤트를 넣고 바로 접수 응답
                      └─ 폴러(poller)들이 큐에서 꺼내 → 동기 호출 경로로 실행
                           └─ 실패하면 재시도, 끝내 실패하면 실패 대상(DLQ 등)으로
```

비동기 호출은 큐가 완충 역할을 해서 갑작스러운 이벤트 폭주를 흡수한다. 대신 같은 이벤트가 두 번 처리될 수 있으므로 함수를 멱등하게 만든다([[resiliency-patterns|장애 확산을 막는 복원력 패턴]]).

## Assignment 서비스

초기 구조에서는 Worker Manager가 실행 환경의 상태를 관리했다. 지금은 이를 대신하는 **Assignment 서비스**가 그 역할을 한다.

- 고성능을 위해 Rust로 작성되었다.
- 여러 파티션으로 나뉘고, 파티션마다 **리더-팔로워** 구조로 이중화되어 리더가 죽어도 팔로워가 이어받는다.
- 실행 환경의 상태를 외부 저널 로그에 기록해, 장애 뒤에도 상태를 복구한다.

## Firecracker 마이크로VM

여러 고객의 함수가 같은 물리 호스트에서 돈다. 컨테이너는 커널을 공유해 격리가 약하고, 일반 VM은 무겁고 느리게 뜬다. **Firecracker**는 그 사이를 메운다.

| 특징 | 내용 |
| --- | --- |
| 기반 | 리눅스 KVM 위에서 동작하는 가상 머신 모니터(VMM). Rust로 작성된 오픈소스 |
| 가벼움 | 장치 모델을 네트워크·블록·직렬 콘솔 등 최소한만 둬서 메모리 사용이 작고 수백 ms 안에 부팅한다 |
| 격리 | 함수 실행 환경마다 별도의 VM 경계를 둬서 다른 고객과 커널을 공유하지 않는다 |
| 쓰임 | Lambda와 Fargate의 실행 기반 |

실행 환경 안에는 최소한의 리눅스 사용자 영역과 공통 라이브러리, 언어 런타임이 들어 있다. 가상화와 경량 VM의 일반 개념은 [[virtualization|가상화와 하이퍼바이저]]에 있다.

## 저장 계층: 코드와 이미지를 빨리 가져오기

새 실행 환경을 띄울 때마다 수백 MB짜리 컨테이너 이미지를 통째로 받으면 콜드 스타트가 길어진다.

| 기법 | 하는 일 |
| --- | --- |
| 청킹(chunking) | 이미지를 작은 청크로 쪼개 저장하고, 실행에 **실제로 필요한 청크만** 그때그때 가져온다 |
| 중복 제거와 공유 | 많은 이미지가 같은 베이스 레이어를 쓰므로 같은 청크는 한 번만 저장하고 캐시를 공유한다 |
| 수렴 암호화(convergent encryption) | 청크 내용에서 암호화 키를 만들어, 서로 다른 고객의 같은 청크가 같은 암호문이 되게 한다. 덕분에 암호화한 채로 중복 제거를 할 수 있다 |

## 콜드 스타트와 SnapStart

**콜드 스타트**는 새 실행 환경을 만들고 런타임과 함수 초기화 코드를 돌리는 시간이다. 특히 JVM처럼 초기화가 무거운 런타임에서 길다.

**SnapStart**는 함수 버전을 배포할 때 초기화를 미리 한 번 끝내고, 그 실행 환경의 메모리·디스크 상태를 Firecracker 스냅숏으로 저장한다. 이후 새 실행 환경이 필요하면 초기화를 다시 하지 않고 스냅숏에서 복원한다. Java에서 시작해 Python과 .NET으로 지원이 넓어졌다.

스냅숏에서 복원하면 여러 실행 환경이 같은 메모리 상태로 시작하므로, 초기화 때 만든 난수 시드나 고유 ID, 네트워크 연결은 복원 뒤에 다시 만들어야 한다.

## 정리

- Lambda는 동기 호출은 바로, 비동기 호출은 내부 큐와 폴러를 거쳐 실행한다.
- Assignment 서비스가 따뜻한 실행 환경을 재사용하게 배정하고, 없으면 새로 만든다. 새로 만드는 비용이 콜드 스타트다.
- Firecracker 마이크로VM은 컨테이너만큼 빠르게 뜨면서 VM 수준으로 격리한다.
- 이미지는 청크로 쪼개 필요한 부분만 가져오고, SnapStart는 초기화된 상태를 스냅숏으로 복원해 콜드 스타트를 줄인다.

관련 노트: [[aws-cloud-basics|AWS 클라우드 기초]], [[virtualization|가상화와 하이퍼바이저]], [[cloud-native|클라우드 네이티브와 코드형 인프라]], [[vm-vs-container|VM과 컨테이너]], [[serverless-architecture|서버리스 아키텍처]]
