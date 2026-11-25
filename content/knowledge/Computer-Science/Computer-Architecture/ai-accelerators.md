---
title: "AI 반도체: CPU·GPU·NPU·TPU·DPU와 ASIC·FPGA"
concept: "AI Accelerators"
summary: "AI 연산은 같은 계산을 많은 데이터에 동시에 적용하는 행렬 연산이라, 범용 CPU 대신 GPU와 전용 가속기가 맡는다. GPU는 범용 병렬 연산, NPU는 기기 안의 저전력 추론, TPU 같은 ASIC은 특정 워크로드 전용, FPGA는 재구성 가능한 회로, DPU는 네트워크·스토리지 처리의 분담이다. 학습과 추론의 요구 차이, 온디바이스 AI와 클라우드의 역할 분담까지 정리했다."
tags: ["computer-architecture", "ai", "gpu", "cpu", "semiconductor", "deep-learning"]
source: mixed
date: "2026-11-23"
sources: ["https://cloud.google.com/blog/products/ai-machine-learning/google-supercharges-machine-learning-tasks-with-custom-chip", "https://en.wikipedia.org/wiki/Tensor_Processing_Unit", "https://www.nvidia.com/en-us/about-nvidia/corporate-timeline/", "https://blogs.nvidia.com/blog/whats-a-dpu-data-processing-unit/", "https://learn.microsoft.com/en-us/windows/ai/npu-devices/", "https://developers.googleblog.com/en/tensorflow-lite-is-now-litert/", "https://pytorch.org/blog/introducing-executorch-1-0/", "https://blogs.nvidia.com/blog/davos-wef-blackrock-ceo-larry-fink-jensen-huang/"]
---

> Google Cloud의 TPU 공개 글, NVIDIA의 [DPU 설명](https://blogs.nvidia.com/blog/whats-a-dpu-data-processing-unit/)과 연혁, Microsoft Learn의 [Copilot+ PC NPU 문서](https://learn.microsoft.com/en-us/windows/ai/npu-devices/), LiteRT·ExecuTorch 공식 발표를 바탕으로 종합한 노트다.

## AI 반도체란

신경망의 학습과 추론은 대부분 큰 행렬과 텐서의 곱셈이다. 분기가 거의 없고 **같은 연산을 수많은 데이터에 동시에 적용**한다. 분기 많은 코드를 빠르게 차례로 처리하도록 만든 CPU는 이 일에 맞지 않아, 병렬 연산에 맞춘 칩이 따로 쓰인다. 이런 칩을 묶어 AI 반도체 또는 AI 가속기라고 부른다.

## 프로세서 종류

| 칩 | 맡는 일 | 구조의 특징 |
| --- | --- | --- |
| CPU (Central Processing Unit) | 운영체제, 분기 많은 범용 코드, 다른 칩의 지휘 | 강력한 코어 소수. 명령을 차례로 빠르게 처리하고, 코어 수를 늘려 동시 처리를 더한다 |
| GPU (Graphics Processing Unit) | 대규모 병렬 부동소수점 연산. 학습과 대형 모델 추론 | 단순한 코어 수천 개가 같은 명령을 여러 데이터에 동시에 적용한다([[pipeline-and-parallelism\|SIMD 계열 병렬 처리]]) |
| NPU (Neural Processing Unit) | 스마트폰·PC 안에서의 저전력 추론 | 신경망 연산 전용 회로. INT8·FP16 같은 낮은 정밀도 연산에 맞춰 전력당 처리량을 높인다 |
| TPU (Tensor Processing Unit) | Google 데이터센터의 학습·추론 | Google이 설계한 머신 러닝 전용 ASIC |
| DPU (Data Processing Unit) | 네트워크·스토리지·보안 처리를 CPU 대신 맡는다 | 프로그래밍 가능한 멀티코어 CPU, 고성능 네트워크 인터페이스, 가속 엔진을 한 칩(SoC)에 묶는다 |

- **GPU**: NVIDIA가 1999년에 그래픽 전용 프로세서를 GPU라는 이름으로 내놓았고, 2006년에 GPU를 범용 계산에 쓰게 하는 병렬 컴퓨팅 플랫폼 **CUDA**를 공개했다(SDK 공개 배포는 2007년). 이후 딥러닝 학습의 표준 장비가 됐다.
- **NPU**: 성능은 **TOPS**(초당 조 단위 연산 수)로 표시한다. Microsoft의 Copilot+ PC는 40 TOPS가 넘는 NPU를 요건으로 둔다. 같은 추론을 GPU보다 적은 전력으로 처리하는 것이 목적이지만, 지원하는 연산과 모델 크기가 제한된다.
- **TPU**: Google이 2015년부터 자사 데이터센터에서 쓰다가 2016년 5월에 공개했다. 처음부터 TensorFlow에 맞춰 설계됐다. 2025년 4월의 7세대(Ironwood)는 추론 수요를 전면에 내세웠고, 2026년 4월의 8세대는 학습용(TPU 8t)과 추론용(TPU 8i)으로 설계를 나눴다. 외부에서는 Google Cloud를 통해 쓴다.
- **DPU**: 데이터센터 서버가 패킷 처리(가상 스위칭, RDMA), 스토리지 입출력, 암호화 같은 인프라 작업에 CPU 코어를 쓰지 않게 한다. CPU와 GPU는 애플리케이션과 모델 연산에만 집중한다.

## ASIC과 FPGA

| | ASIC | FPGA |
| --- | --- | --- |
| 뜻 | 특정 용도에 맞춰 회로를 고정해 만든 주문형 집적 회로(Application-Specific Integrated Circuit) | 출하 뒤에도 회로 구성을 다시 짤 수 있는 칩(Field-Programmable Gate Array) |
| 장점 | 그 용도에서는 성능과 전력 효율이 가장 좋고, 대량 생산하면 단가가 낮다 | 설계를 바꿔 다시 올릴 수 있어 시제품과 소량 생산, 규격이 바뀌는 분야에 맞다 |
| 단점 | 설계·제조 초기 비용이 크고, 만든 뒤에는 바꿀 수 없다 | 같은 기능의 ASIC보다 느리고 전력을 더 쓰며 개당 가격이 높다 |
| 예 | TPU, 비트코인 채굴 칩, 통신 모뎀 칩 | 통신 장비, 영상 처리, ASIC 설계 검증 |

FPGA의 내부 구조(LUT와 플립플롭, 배선)는 [[digital-logic-circuits|디지털 논리 회로와 부품]]에 있다. GPU는 이 둘과 달리 소프트웨어로 어떤 병렬 연산이든 시킬 수 있는 범용 가속기다. 범용성이 필요하면 GPU, 워크로드가 정해져 있고 물량이 크면 ASIC, 그 사이에서 유연성이 필요하면 FPGA를 쓴다.

## 학습과 추론은 요구가 다르다

| | 학습(training) | 추론(inference) |
| --- | --- | --- |
| 하는 일 | 대량의 데이터로 가중치를 반복해서 고친다 | 고정된 가중치로 입력 하나의 결과를 낸다 |
| 연산 | 순전파와 역전파, 높은 정밀도, 긴 실행 시간 | 순전파만. 낮은 정밀도로 줄여도 되는 경우가 많다 |
| 중요한 것 | 처리량, 메모리 용량과 대역폭, 칩 사이 연결 | 지연 시간, 요청당 비용, 전력 |
| 주로 쓰는 칩 | 데이터센터의 GPU와 학습용 ASIC | GPU 외에 추론용 ASIC, NPU, FPGA까지 선택지가 넓다 |

추론은 기능이 제한된 칩으로도 처리할 수 있어서, 서비스 이용량이 늘수록 GPU 외의 맞춤형 칩이 쓰일 자리가 넓어진다. 다만 대형 언어 모델의 추론은 메모리 대역폭이 병목이라 여전히 GPU와 HBM에 크게 의존한다([[llm-serving-at-scale|LLM 서빙의 병목]]).

가속기 옆의 메모리도 계층을 이룬다. 연산 중인 데이터는 DRAM(가속기에는 HBM), 자주 쓰는 데이터는 칩 안의 SRAM 캐시, 오래 보관할 데이터는 낸드 플래시 기반 SSD에 둔다. 각 계층과 HBM·HBF·SOCAMM은 [[memory-hierarchy|메모리 계층 구조]]에 있다.

## 온디바이스 AI와 클라우드

**온디바이스 AI**는 추론을 서버가 아니라 스마트폰·PC·가전 같은 단말에서 실행하는 방식이다. 엣지 AI의 한 형태다.

| | 기기에서 | 클라우드에서 |
| --- | --- | --- |
| 장점 | 네트워크 왕복이 없어 지연이 짧고, 데이터가 기기를 떠나지 않으며, 오프라인에서도 동작하고, 서버 비용이 들지 않는다 | 큰 모델과 긴 컨텍스트를 쓸 수 있고, 모델을 한곳에서 바꾸면 된다 |
| 제약 | NPU 성능과 RAM, 배터리 소모와 발열, 모델 크기 한계, 기기마다 다른 모델 버전의 배포·업데이트 관리 | 지연, 요청당 비용, 데이터 전송에 따른 프라이버시 부담 |
| 맞는 일 | 사진 보정, 음성 인식, 실시간 번역, 키보드 추천처럼 가볍고 즉시 응답해야 하는 기능 | 대형 모델이 필요한 복잡한 추론과 생성 |

실제 제품은 가벼운 기능은 기기에서, 어려운 요청은 클라우드로 올리는 **하이브리드**가 일반적이다.

모델을 기기에 넣으려면 작게 만들어야 한다. 가중치를 8비트 등으로 줄이는 **양자화**, 기여가 작은 가중치를 잘라 내는 **프루닝**, 큰 모델의 출력을 작은 모델이 배우는 **지식 증류**, 처음부터 작게 설계한 소형 언어 모델(SLM)을 쓴다. 기법의 자세한 내용은 [[ml-model-serving|머신러닝 모델 서빙]]에 있다.

| 런타임 | 내용 |
| --- | --- |
| LiteRT | Google의 온디바이스 런타임. 2024년 9월에 TensorFlow Lite에서 이름이 바뀌었다 |
| ExecuTorch | PyTorch의 온디바이스 런타임. 2025년 10월에 1.0이 나왔고, 예전 PyTorch Mobile의 자리를 이어받았다 |
| Core ML | Apple 기기용 프레임워크. CPU·GPU·Neural Engine에 연산을 나눠 보낸다 |

브라우저 안에서 모델을 돌리는 방법은 [[client-side-web-ai|클라이언트 사이드 웹 AI]]에 있다.

## AI 산업의 다섯 층

AI 산업은 아래에서 위로 다섯 층으로 나눠 볼 수 있다. 어느 층이 병목인지 가려 볼 때 쓰는 틀이다.

| 층 | 내용 | 병목의 예 |
| --- | --- | --- |
| 1. 에너지 | 데이터센터에 들어가는 전력 | 발전·송전 용량 |
| 2. 칩과 컴퓨팅 인프라 | GPU, 가속기, 메모리, 네트워크 장비 | 첨단 공정, HBM, 패키징 물량 |
| 3. 클라우드 데이터센터 | 칩을 모아 서비스로 제공하는 시설 | 부지, 냉각, 건설 기간 |
| 4. AI 모델 | 기반 모델과 그 학습 | 연산 자원, 데이터 |
| 5. 애플리케이션 | 모델을 써서 산업별 문제를 푸는 제품 | 도입과 수익화 |

## 정리

- AI 연산은 병렬 행렬 연산이라 CPU가 아니라 GPU와 전용 가속기가 맡는다.
- GPU는 범용 병렬, ASIC(TPU 등)은 전용 고효율, FPGA는 재구성, DPU는 인프라 작업 분담이다.
- 학습은 처리량과 메모리, 추론은 지연과 비용·전력이 기준이라 맞는 칩이 다르다.
- 온디바이스 AI는 지연·프라이버시·비용을 줄이지만 모델 크기와 전력의 제약을 받는다. 그래서 클라우드와 나눠 쓴다.

관련 노트: [[memory-hierarchy|메모리 계층 구조]], [[pipeline-and-parallelism|파이프라인과 병렬 처리]], [[digital-logic-circuits|디지털 논리 회로와 부품]], [[semiconductor-process-yield|반도체 공정 용어]], [[llm-serving-at-scale|LLM 서빙의 병목]], [[ml-model-serving|머신러닝 모델 서빙]], [[client-side-web-ai|클라이언트 사이드 웹 AI]], [[training-vs-inference|딥러닝 학습과 추론]]
