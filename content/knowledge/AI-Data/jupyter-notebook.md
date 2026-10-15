---
title: "Jupyter Notebook"
concept: "Jupyter"
summary: "코드·실행 결과·마크다운 문서·시각화를 한 파일에 담는 웹 기반 인터랙티브 개발 환경으로, 데이터 과학의 사실상 표준 도구."
tags: ["data-science", "python", "jupyter", "tools"]
source: notion
date: "2026-10-13"
sources: ["https://jupyter.org/", "https://jupyter-notebook.readthedocs.io/en/latest/"]
---

Jupyter Notebook은 **"실행되는 문서"**다. 하나의 노트북 안에 설명(마크다운), 코드, 실행 결과, 그래프, 수식을 함께 담을 수 있어 분석 과정을 그대로 기록하고 공유하기 좋다. 그래서 데이터 과학 분야의 사실상 표준(de facto) 도구가 되었다.

## 특징

- 이름은 **Ju**lia + **Pyt**hon + **R** 에서 왔다. 세 언어를 시작으로 현재 40개 이상의 언어(커널)를 지원한다.
- IPython 프로젝트에서 출발해 2014년 Project Jupyter로 독립했다.
- **웹 브라우저 기반 + 통합 개발 환경 + 인터랙티브 실행**: 셀 단위로 코드를 실행하고 바로 결과를 본다.
- 노트북 = 문서(Markdown) + 코드 + 시각화 + 수식(LaTeX)

## 어디에, 누가 쓰나

- 데이터 분석·머신러닝 과정 전반 (탐색, 실험, 결과 보고)
- 개발 프로토타입을 빠르게 만들어 볼 때
- 학습·강의 자료, 튜토리얼
- 데이터를 다루는 누구나: 개발과 기록을 한 번에 하고, HTML·PDF 등으로 내보내 공유할 수 있다.

## 시작하는 방법

| 방식 | 선택지 | 비고 |
| --- | --- | --- |
| 설치형 | `pip install notebook` (또는 `jupyterlab`) | 가장 단순 |
| 설치형 | **Anaconda** | 데이터 분석 패키지와 가상 환경 관리를 한 번에 (입문 추천) |
| 설치형 | Docker | 재현 가능한 환경 |
| 서비스형 | Google Colab | 설치 없이 브라우저에서, 무료 GPU |
| 서비스형 | **Kaggle Notebooks** | 데이터셋·대회와 바로 연결 |
| 서비스형 | AWS SageMaker, GCP Vertex AI(구 AI Platform), Azure ML | 클라우드 노트북 서비스. 데이터·모델 인프라와 같은 계정 안에서 쓴다 |

## 알아 두면 좋은 기능

```python
%time sum(range(10**6))       # 한 번 실행 시간
%timeit sum(range(10**6))     # 여러 번 반복 실행한 평균 시간
%prun my_function()            # 함수별 실행 시간 프로파일
```

- `%`로 시작하는 **매직 명령**으로 시간 측정, 프로파일링, 셸 명령 실행(`!pip install ...`) 등을 할 수 있다. 분석이 느릴 때는 이것으로 병목을 먼저 잰다.
- **JupyterLab**은 파일 브라우저·터미널·여러 탭을 갖춘 IDE 형태의 인터페이스다. Notebook 7(2023)부터는 클래식 Notebook도 JupyterLab의 구성 요소 위에서 다시 만들어져, 둘은 같은 확장을 공유하고 화면 구성만 다르다.
- VS Code, PyCharm 등에서도 `.ipynb` 파일을 직접 열고 실행할 수 있다. JetBrains의 데이터 과학 전용 IDE였던 DataSpell은 2026년 신규 판매가 끝나고 기능이 PyCharm으로 합쳐졌다.

## 공유와 배포

| 도구 | 하는 일 |
| --- | --- |
| nbconvert | 노트북을 HTML·PDF·스크립트 등 다른 형식으로 변환 |
| nbviewer | 노트북 파일을 웹에서 정적으로 보여 줌 (실행은 안 됨) |
| Binder | 저장소를 그대로 실행 가능한 환경으로 띄워 공유 |

관련 노트: [[python-data-analysis|파이썬 데이터 분석 프로세스]]
