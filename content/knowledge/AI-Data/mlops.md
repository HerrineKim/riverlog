---
title: "MLOps: 머신러닝을 운영 환경에서 굴리기"
concept: "MLOps"
summary: "MLOps는 머신러닝(ML)과 운영(Ops)을 합친 말로, 모델을 서비스에 올리고 데이터·모델 버전 관리, 모니터링, 재학습까지 계속 돌리는 일이다. 생명 주기별 구성 요소와 도구, 프로젝트를 고르고 지표·베이스라인을 정하는 법, Kubeflow Pipelines로 본 학습·배포 파이프라인, ML 시스템에 필요한 테스트, 피처 테이블과 학습·서빙 불일치를 막는 법, 파이프라인을 먼저 잇고 모델은 나중에 키우는 원칙을 정리했다."
tags: ["ai", "machine-learning", "mlops", "devops", "data"]
source: other
date: "2026-10-31"
sources: ["https://github.com/Team-Neighborhood/I-want-to-study-Data-Science/wiki/MLOps", "https://en.wikipedia.org/wiki/MLOps", "https://fullstackdeeplearning.com/march2019", "https://zzsza.github.io/mlops/2019/10/06/fullstack-deeplearning-bootcamp/", "https://github.com/alirezadir/Production-Level-Deep-Learning", "https://jameskle.com/writes/deep-learning-infrastructure-tooling", "https://medium.com/daangn/%EB%94%A5%EB%9F%AC%EB%8B%9D-%EC%B6%94%EC%B2%9C-%EC%8B%9C%EC%8A%A4%ED%85%9C-in-production-fa623877e56a", "https://docs.google.com/presentation/d/1AqiRVm32zCg59TKDgbs14FaVgNf8kqfXFkCYxAPw8ac/edit", "https://www.kubeflow.org/docs/components/pipelines/"]
---

> 「[I want to study Data Science](https://github.com/Team-Neighborhood/I-want-to-study-Data-Science/wiki/MLOps)」 위키의 MLOps 문서와 [Wikipedia MLOps 항목](https://en.wikipedia.org/wiki/MLOps)을 뼈대로, 「[Full Stack Deep Learning Bootcamp](https://fullstackdeeplearning.com/march2019)」(2019)와 그 [정리 글](https://zzsza.github.io/mlops/2019/10/06/fullstack-deeplearning-bootcamp/), 「[A Guide to Production Level Deep Learning](https://github.com/alirezadir/Production-Level-Deep-Learning)」, 「[The 7 questions you need to ask to operate deep learning infrastructure at scale](https://jameskle.com/writes/deep-learning-infrastructure-tooling)」, 당근마켓 「[딥러닝 추천 시스템 in production](https://medium.com/daangn/%EB%94%A5%EB%9F%AC%EB%8B%9D-%EC%B6%94%EC%B2%9C-%EC%8B%9C%EC%8A%A4%ED%85%9C-in-production-fa623877e56a)」(2019), 「[스타트업에서 데이터를 더하는 법](https://docs.google.com/presentation/d/1AqiRVm32zCg59TKDgbs14FaVgNf8kqfXFkCYxAPw8ac/edit)」(2019)으로 보강했다. 도구 현황은 2026년 기준 [Kubeflow Pipelines 문서](https://www.kubeflow.org/docs/components/pipelines/) 등으로 확인해 고쳐 썼다.

## MLOps란

MLOps는 **머신러닝(Machine Learning)과 운영(Operations)을 합친 말로, 모델을 실제 서비스에 올린 뒤 겪는 운영 문제를 다루는 실천 방법**이다. 머신러닝, 소프트웨어 엔지니어링(특히 DevOps의 CI/CD), 데이터 엔지니어링이 겹치는 자리에 있다.

학습은 한 번 잘 돌면 끝나지만 운영은 끝나지 않는다. 운영 중인 모델은 **코드 + 데이터 + 학습된 가중치**로 이루어지고, 셋 중 하나만 바뀌어도 결과가 달라진다. 그래서 MLOps는 다음을 계속 돌린다.

| 할 일 | 내용 |
| --- | --- |
| 서빙 | 모델을 API·배치 작업으로 띄워 예측을 내놓는다([[ml-model-serving\|머신러닝 모델 서빙]]) |
| 버전 관리 | 코드, 데이터, 모델, 실험 설정을 함께 기록해 같은 결과를 다시 만들 수 있게 한다 |
| 모니터링 | 장애·지연뿐 아니라 입력 분포 변화(데이터 드리프트)와 예측 품질 하락을 잡는다 |
| 재학습 | 새 데이터로 주기적으로, 또는 성능이 떨어질 때 다시 학습하고 배포한다 |

실제 ML 시스템에서 모델 코드는 작은 일부이고, 데이터 수집·검증·피처 추출·자원 관리·서빙·모니터링이 대부분을 차지한다. 2015년 논문 「Hidden Technical Debt in Machine Learning Systems」가 이 점을 지적하면서 MLOps라는 분야가 자라났다. 비슷한 이름의 AIOps는 지금 주로 「AI로 IT 운영(장애 탐지·알림 정리)을 자동화하는 것」을 가리켜 서로 다른 말이다.

## 생명 주기와 구성 요소

```text
기획(문제·지표·베이스라인) → 데이터(수집·라벨링·저장·버전) → 학습(실험·튜닝·분산 학습)
      ↑                                                              ↓
  재학습 ← 모니터링(장애·드리프트·품질) ← 배포(테스트·서빙) ←──────────┘
```

| 영역 | 핵심 | 대표 도구(2026) |
| --- | --- | --- |
| 데이터 라벨링 | 라벨 기준을 정하고 직접 만든 정답 샘플로 품질을 관리한다. 크라우드소싱은 싸고 빠르지만 검수가 필요하고, 직접 고용은 비싸고 늘리기 느리다 | Label Studio, 라벨링 서비스 업체 |
| 데이터 저장 | 이미지·음성 같은 바이너리는 객체 저장소, 라벨·경로·사용자 활동 같은 메타데이터는 DB, 로그는 데이터 레이크, 여러 모델이 같이 쓰는 피처는 피처 스토어 | S3·GCS, PostgreSQL, Feast |
| 데이터 버전 관리 | **데이터 버전이 없으면 모델 버전도 없다.** 어떤 데이터로 학습했는지 남긴다 | DVC, lakeFS, 테이블 포맷의 스냅샷(Iceberg·Delta) |
| 실험 관리 | 코드·하이퍼파라미터·데이터셋·지표·결과 모델을 실험마다 기록하고 나란히 비교한다 | MLflow, Weights & Biases, TensorBoard(실험 하나 보기에 적합) |
| 하이퍼파라미터 탐색 | 격자·무작위 탐색, 베이지안 최적화, Hyperband·ASHA처럼 가망 없는 시도를 일찍 끊는 방법 | Optuna, Ray Tune |
| 학습 자원 | 여러 사람이 GPU를 나눠 쓰며 환경을 격리한다. 스프레드시트 예약 → Slurm 같은 작업 스케줄러 → Docker + Kubernetes로 발전한다 | Kubernetes, Slurm, Ray |
| 분산 학습 | 한 번 도는 시간이 너무 길면 **데이터 병렬**(모델 복제, 데이터 분할), 모델이 GPU 하나에 안 들어가면 **모델 병렬**. 실무에서는 데이터 병렬이 대부분이다 | PyTorch DDP·FSDP, DeepSpeed |
| 파이프라인 오케스트레이션 | 수집 → 전처리 → 학습 → 평가 → 배포를 단계별 작업으로 잇고 반복 실행한다. Makefile로는 커지면 감당이 안 된다 | Kubeflow Pipelines, Airflow, Vertex AI Pipelines, SageMaker Pipelines |
| 모델 레지스트리 | 학습된 모델을 이름·버전·단계(스테이징·운영)로 등록하고 승격한다 | MLflow Model Registry, 클라우드 레지스트리 |
| 모니터링 | 다운타임·오류 알림, 입력·예측 분포 변화, 서비스·데이터 회귀를 잡는다. 기록할 수 있는 것은 모두 모니터링 대상이다 | Evidently, 클라우드 모니터링, Prometheus |

학습부터 배포까지 묶은 올인원 플랫폼(SageMaker, Vertex AI, Databricks, TFX 기반 구성)도 있다. 기능은 넓지만 익히는 비용과 플랫폼 의존이 생긴다.

## 프로젝트를 고르고 목표를 정하는 법

ML 프로젝트는 실험 단계에서 끝나고 운영까지 못 가는 경우가 많다. 기술적으로 불가능하거나 범위가 흐릿하고, 성공 기준이 불분명하기 때문이다.

| 판단 | 기준 |
| --- | --- |
| 영향이 큰 문제 | 파이프라인에서 복잡한 부분, 「싼 예측」이 가치 있는 곳, 복잡한 수작업을 자동화할 수 있는 곳 |
| 비용 | 데이터를 얻을 수 있는가, 요구 정확도가 얼마인가, 문제가 본래 어려운가. **요구 정확도가 높아질수록 비용은 선형보다 가파르게** 오르므로, 제품 설계로 정확도 요구를 낮출 수 있으면 낮춘다 |
| 지표 | ML 시스템은 숫자 하나를 최적화할 때 가장 잘 작동한다. 여러 지표는 가중 평균으로 합치거나, n-1개는 기준선만 넘기게 하고 하나를 최적화한다. 공식은 바뀔 수 있다 |
| 베이스라인 | 모델 성능의 하한선이다. 규칙 기반 스크립트, 단순한 선형·bag-of-words 모델, 사람의 성능이 후보다. 하한선이 엄격할수록 다음 행동을 정하기 쉽다 |

학습은 **작게 시작한다.** 작은 데이터 묶음에 작은 모델로 먼저 돌아가는지 확인하고, 그다음에 데이터·모델을 키우고 튜닝한다. 시작 전에 「이 문제가 정말 머신러닝이어야 하나, 정확도는 낮아도 다른 방법으로 몇 배의 일을 할 수 있지 않나」를 먼저 묻는다.

## 파이프라인 예: Kubeflow Pipelines

Kubeflow Pipelines(KFP)는 **Kubernetes 위에서 단계마다 컨테이너를 띄워 ML 워크플로를 돌리는 플랫폼**이다. 파이썬 SDK로 파이프라인을 정의해 올리면 웹 화면에서 실행·비교한다. Kubeflow는 CNCF 졸업(graduated) 프로젝트이고, KFP는 v2가 현재 버전이다.

| 기능 | 쓰임 |
| --- | --- |
| 컨테이너 단계 | 기존 작업을 이미 컨테이너로 만들어 두었다면 그대로 단계로 잇는다 |
| 실행 파라미터 | 하이퍼파라미터를 바꿔 가며 실험을 바로 돌린다 |
| 반복 실행(recurring run) | 하루 두 번 재학습처럼 cron 일정으로 돌린다 |
| 실행별 지표·시각화 | 평가 지표와 샘플 예측 결과를 실행마다 남겨 화면에서 비교하고, TensorBoard를 바로 띄운다 |
| API | 파이프라인 교체(업로드 → 반복 실행 갱신 → 옛것 정리)를 화면 대신 스크립트로 처리한다 |

범용 DAG 도구인 Airflow로도 같은 일을 할 수 있지만, 기존 코드를 DAG로 옮기는 작업이 많고 실험·아티팩트 개념이 없다. 추천 모델을 예로 든 재학습 흐름은 다음과 같다.

```text
이벤트 로그(BigQuery) → 필요한 열만 모은 중간 테이블 → 전처리(ID 사전, 희귀 ID 제거)
  → 학습(관리형 학습 환경) → 평가 지표 기록 → 임베딩 추출 → 근사 최근접 이웃 인덱스 학습
  → 모델 파일을 서빙 쪽 저장소로 복사 → 서빙 서비스 재시작으로 새 모델 반영
```

서로 의존하지 않는 단계(인덱스 학습과 모델 복사)는 동시에 돌린다. 추천 모델 자체의 구조는 [[deep-learning-recsys|딥러닝 추천 시스템]]에 있다.

## ML 시스템의 테스트

ML 서비스는 일반 소프트웨어보다 테스트 종류가 많다.

| 테스트 | 확인하는 것 |
| --- | --- |
| 학습 시스템 테스트 | 학습 파이프라인이 끝까지 돌고 손실이 줄어드는가 |
| 검증 테스트 | 검증 데이터에서 예측 시스템의 지표가 기준 이상인가 |
| 기능 테스트 | 꼭 맞혀야 하는 몇 가지 핵심 예시에서 기대한 답을 내는가 |
| 단위·통합 테스트 | 모듈과 전체 시스템이 맞물리는가 |

새 코드가 저장소에 올라갈 때마다 CI가 이 테스트를 돌리고, 통과해야 배포한다. 격리된 환경을 위해 컨테이너에서 돌린다. 생성형 AI 기능의 평가 루프는 [[evaluation-driven-development|평가 주도 개발]]에 따로 정리했다.

## 피처와 학습·서빙 일관성

| 원칙 | 방법 |
| --- | --- |
| 배치 피처 테이블을 먼저 | 상품 기준(카테고리, CTR, 방문·주문·취소 수, 평점)과 사용자 기준(자주 보는 카테고리, 최근 주문 N개, 검색어) 피처를 배치로 쌓는다. 집계 원천(app, web, db, server)별로 테이블을 나누면 한쪽이 바뀔 때 재작업이 줄어든다 |
| 다시 나눌 수 있게 저장 | 일 단위 파티션에 평균 대신 합계·개수를 담는다. 기간 내 고유 수는 1·7·14·28일 테이블을 따로 만든다 |
| 실시간 피처는 비싸다 | 「최근 N시간 검색」 같은 실시간 피처는 별도 스트림 저장소와 처리 앱이 필요하다. 정말 필요한지 따져 본다 |
| **실험과 운영의 도구를 같게** | 노트북에서는 PySpark로, 운영 적재는 Scala Spark로 짜거나, 실험은 Trino로 운영은 Hive로 하면 결과가 어긋난다. 이것이 학습·서빙 불일치(training-serving skew)의 흔한 원인이다. 전처리를 모델 그래프 안에 넣으면(TensorFlow Transform 등) 서빙 때 같은 전처리를 다시 짤 필요가 없다 |
| 이중 기록 | 서비스용 저장소에 내보낸 결과를 분석 도구로 조회할 수 있는 곳에도 함께 써 두면 디버깅이 쉽다 |

## 파이프라인을 먼저 잇는다

- **파이프라인은 한번 연결되면 안의 모델을 쉽게 바꿀 수 있다.** 100점짜리 모델을 만들 전문가가 없으면 80점짜리 모델로 먼저 끝까지 잇고, 나중에 사람을 구하거나 밴딧·온라인 학습 같은 자동 개선으로 키운다.
- 초기에는 **결과를 설명할 수 있는 모델**이 신뢰를 쌓는다. 예측이 틀렸을 때 왜 틀렸는지 사업 쪽이 이해해야 다음 블랙박스 모델도 받아들인다.
- 첫 데이터 서비스는 비즈니스 담당자가 가중치(주문 금액, 좋아요 수, 같이 본 수)를 바꿔 가며 결과를 보는 **시뮬레이션 도구**로 검토한다. 기술적으로 나온 결과와 브랜드·정책에 맞는 결과는 다르다.
- 내보낸 뒤에는 A/B 테스트로 비교한다. 시드로 사용자를 나눠 실험 간에도 같은 집단을 유지하고, QA용 사용자는 고정 그룹에 넣고, 개인화 결과를 못 주는 사용자(식별자 수집 미동의, 저장소 장애)에게는 인기 상품 같은 기본값을 준다([[realtime-recsys|추천 시스템의 실시간 피드백과 A/B 테스트]]).

노트북은 탐색과 프로토타입에 좋지만 운영 코드로는 약하다. 거대한 JSON이라 병합이 안 되고, 셀을 순서 없이 실행해 상태가 꼬이며, 함수로 나누고 테스트하기 어렵다. 실험이 굳으면 스크립트와 패키지로 옮겨 테스트를 붙인다([[jupyter-notebook|Jupyter Notebook]]).

## 정리

- MLOps는 모델을 서비스에 올린 뒤 서빙·버전 관리·모니터링·재학습을 계속 돌리는 일이다. 모델은 코드 + 데이터 + 가중치이므로 셋을 함께 관리한다.
- 프로젝트는 영향과 비용(데이터, 요구 정확도)으로 고르고, 숫자 하나로 된 지표와 베이스라인을 먼저 정한다.
- 파이프라인 오케스트레이터(Kubeflow Pipelines 등)로 수집부터 배포까지 자동화하고, 테스트를 통과해야 배포한다.
- 실험과 운영의 도구·전처리를 같게 해 학습·서빙 불일치를 막는다.
- 80점짜리라도 파이프라인을 먼저 끝까지 잇고, 모델은 그 위에서 키운다.

관련 노트: [[ml-model-serving|머신러닝 모델 서빙]], [[data-pipeline-basics|데이터 파이프라인과 저장소 용어]], [[deep-learning-recsys|딥러닝 추천 시스템]], [[predictive-vs-generative-ai|예측형 AI와 생성형 AI]], [[text-classification-in-production|서비스용 텍스트 분류 모델 만들기]], [[llm-serving-at-scale|LLM 서빙의 병목]]
