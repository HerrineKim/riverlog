---
title: "머신 러닝"
concept: "Machine Learning"
summary: "데이터에서 패턴을 학습하는 모델의 기초, 신경망과 트리 앙상블, 강화 학습, 비전·자연어, 평가 지표, 서빙과 MLOps."
tags: ["ai","machine-learning","data-science"]
source: mixed
date: "2026-11-26"
---

머신 러닝 노트는 데이터를 모델·손실·최적화로 나누는 기초에서 출발해, 신경망과 트리 앙상블, 강화 학습, 비전·자연어, 평가 지표, 그리고 모델을 서비스에 올리는 서빙과 MLOps까지 잇는다.

## 하위 노트

- [문자열·문서 유사도: 편집 거리와 코사인 유사도](AI-Data/Machine-Learning/text-similarity.md): 오타에 강한 제목 검색(Jaro-Winkler)과 키워드 벡터 기반 영화 추천
- [머신 러닝 기초: 네 단계 추상화](AI-Data/Machine-Learning/machine-learning-basics.md): 데이터 → 모델 → 손실 → 최적화, 지도·비지도, 최소제곱법, 과적합·MLE·MAP·정규화
- [퍼셉트론과 다층 퍼셉트론](AI-Data/Machine-Learning/perceptron-mlp.md): 인공 뉴런·활성화 함수, 퍼셉트론 학습과 XOR 한계, MLP와 오류 역전파
- [딥러닝 직관으로 이해하기: 신경망으로 숫자에서 패턴 찾기](AI-Data/Machine-Learning/deep-learning-intuition.md): 모든 것이 숫자인 컴퓨터, 규칙으로 못 적는 패턴, 프로그래밍과 학습의 차이, 층별 특징과 해석의 어려움, 강화 학습과 알파제로, 전이 학습
- [딥러닝 학습과 추론](AI-Data/Machine-Learning/training-vs-inference.md): 순전파·역전파로 가중치 수렴, 학습 연산량, 미세 조정과 어댑터, LLM 추론의 prefill·decode와 분리 서빙·추측 디코딩, 지연과 처리량, MLPerf, 테스트 타임 스케일링
- [컴퓨터 비전 기초: 커널과 합성곱에서 CNN까지](AI-Data/Machine-Learning/computer-vision-basics.md): 영상 처리와의 차이, 분류·탐지·분할 등 세부 과제, 색 추적, 패치·커널·합성곱과 프리윗 에지 검출, Viola-Jones 얼굴 검출, 커널을 학습하는 CNN과 비전 트랜스포머, 랜드마크·표정·생체 인식
- [결정 트리와 앙상블: 랜덤 포레스트와 부스팅](AI-Data/Machine-Learning/decision-tree-ensemble.md): 지니 불순도, 배깅과 부스팅 비교, 정형 데이터에 강한 트리 모델, 서버·엣지 배포
- [분류 모델 성능 평가 지표](AI-Data/Machine-Learning/classification-metrics.md): 혼동 행렬, 정밀도·재현율·정확도·F1, ROC·AUC, 회귀 지표, 객체 탐지의 IoU·PR 곡선·AP·mAP
- [논문 읽기와 구현: 고르고, 여러 번 나눠 읽고, 재현할 수 있게 공개하기](AI-Data/Machine-Learning/paper-reading-implementation.md): 논문 고르기와 여러 번 나눠 읽기, 이해 점검 네 질문, 구현할 때의 태도, 재현 가능한 코드 공개 다섯 가지
- [서비스용 텍스트 분류 모델 만들기](AI-Data/Machine-Learning/text-classification-in-production.md): 라벨 기준, 노이즈 많은 텍스트 토큰화, 가벼운 모델, 클래스 불균형, 라벨 오류 찾기와 재학습, 다중 입력 모델
- [머신러닝 모델 서빙](AI-Data/Machine-Learning/ml-model-serving.md): 배포 방식과 CPU·GPU 선택, 동기 API와 큐 기반 비동기 워커, 가중치·이미지 분리, 배치 처리, 헬스 체크·배포 게이트, BentoML
- [MLOps: 머신러닝을 운영 환경에서 굴리기](AI-Data/Machine-Learning/mlops.md): 서빙·버전 관리·모니터링·재학습, 생명 주기별 도구, Kubeflow Pipelines, ML 테스트, 학습·서빙 불일치
- [불확실한 지식으로 추론하기: 베이지안 분류기와 퍼지 추론](AI-Data/Machine-Learning/bayesian-fuzzy-inference.md): 베이즈 정리·최소 오류/위험 분류기·나이브 베이즈, 퍼지 집합·관계·논리
- [지능형 튜터링 시스템과 베이지안 지식 추적](AI-Data/Machine-Learning/intelligent-tutoring-system.md): 생성 규칙·버그 규칙의 도메인 모델, 학생 모델, 숙달·추측·실수·전이 확률의 BKT 갱신식, 숙달 학습과 적응형 순서, LLM 튜터
- [강화 학습: 에이전트·MDP·가치 함수와 알고리즘 분류](AI-Data/Machine-Learning/reinforcement-learning.md): 상태·행동·보상, MDP, 리턴·Q 함수·벨만 방정식, 모델 기반/프리·가치/정책·온/오프 정책
- [비헤이비어 트리](AI-Data/Machine-Learning/behavior-tree.md): 틱마다 깊이 우선 평가, Success·Failure·Running, Sequence·Selector·Parallel과 데코레이터, FSM과 비교
- [자연어 처리 파이프라인: 전처리부터 언어 모델까지](AI-Data/Machine-Learning/nlp-pipeline.md): 과제 분류, 말뭉치 → 토큰화·정규화·인코딩 → 언어 모델(n-gram → 트랜스포머 → LLM) → 평가
