---
title: "파이썬 데이터 분석 프로세스"
concept: "EDA"
summary: "데이터를 구하고 처리한 뒤 탐색적 데이터 분석(EDA)과 시각화로 패턴을 찾고, 필요하면 성능을 개선하는 파이썬 데이터 분석의 흐름."
tags: ["data-science", "python", "eda", "visualization"]
source: notion
---

파이썬은 데이터 수집부터 분석·시각화까지 한 언어로 처리할 수 있는 생태계를 갖추고 있어 데이터 분석의 기본 언어로 쓰입니다. 분석은 대략 **데이터 구하기 → 처리와 분석 → 탐색·시각화 → 개선**의 흐름으로 진행됩니다.

## 1. 데이터 구하기

| 출처 | 예 |
| --- | --- |
| 내부 원천 데이터 | RDB, 데이터 웨어하우스(DW), 데이터 레이크, 파일(CSV, 로그, Excel) |
| 공개 데이터 | Open Dataset(Kaggle, 공공데이터포털), Open API |
| 스크래핑 | 웹 페이지에서 직접 추출 |
| 직접 수집 / 구매 | 설문, 센서, 데이터 판매처 |

### 파이썬 스크래핑 도구

- **요청**: `requests`, `urllib3`
- **크롤링 프레임워크**: `scrapy`
- **브라우저 자동화**(JavaScript로 그려지는 페이지): `selenium`
- **파싱**: `BeautifulSoup`, `lxml`, `json`

```python
import requests
from bs4 import BeautifulSoup

html = requests.get("https://example.com").text
soup = BeautifulSoup(html, "html.parser")
print(soup.select_one("h1").text)
```

## 2. EDA: 탐색적 데이터 분석

**EDA(Exploratory Data Analysis)** 는 본격적인 모델링 전에 시각화, 요약 통계, 간단한 모델 등으로 데이터를 여러 각도에서 살펴보며 **이해하는** 과정입니다.

- 데이터의 구조와 분포 이해
- 트렌드와 패턴 파악
- 이상치(특이값) 발견
- 어떤 모델·분석 방법을 쓸지 결정

## 3. 시각화

시각화는 "예뻐서"가 아니라 **사람이 이해하기 쉽게 전달하기 위해** 합니다. 패턴을 알아보는 인간의 능력을 활용하는 방법이자, EDA의 핵심 단계입니다. 하나의 차트에 의존하지 말고 **여러 방식으로 다방면에서** 살펴보는 것이 중요하며, 결과를 올바르게 읽고 해석하는 **데이터 리터러시**도 함께 길러야 합니다.

| 라이브러리 | 특징 |
| --- | --- |
| matplotlib | 가장 기본이 되는 정적 그래프 라이브러리 |
| seaborn | matplotlib 기반, 통계 그래프를 간결한 코드로 |
| Plotly / Plotly Express | JavaScript 기반 인터랙티브 차트 |
| Bokeh | 웹 브라우저용 인터랙티브 시각화 |
| Altair (Vega) | 선언적 문법의 시각화 |

모두 [Jupyter Notebook](jupyter-notebook.md) 안에서 바로 결과를 확인할 수 있습니다.

## 4. 분석 개선하기

### 성능

- **프로파일링**: Jupyter 매직 명령 `%time`(한 번 실행 시간), `%timeit`(반복 측정 평균), `%prun`(함수별 프로파일)
- **GPU 가속**: CUDA, cuDF(GPU 기반 DataFrame)
- **병렬·분산 처리**: Dask, Vaex (메모리보다 큰 데이터 처리)
- **JIT 컴파일**: PyPy, Numba

### 협업과 환경

- 노트북 공유·배포: nbconvert(다른 형식으로 변환), nbviewer(웹에서 보기), Binder(실행 가능한 환경으로 공유)
- 클라우드 노트북: AWS SageMaker, GCP Vertex AI(구 AI Platform), Azure ML
- 대체 도구: JupyterLab, VS Code 노트북, PyCharm(Jupyter 지원. 예전의 JetBrains DataSpell은 2026년 PyCharm으로 통합)

## 더 공부하기

- 커뮤니티: PyCon, PyData, JupyterCon
- 책: 『파이썬 라이브러리를 활용한 데이터 분석』, 『파이썬 데이터 사이언스 핸드북』, 『밑바닥부터 시작하는 데이터 과학』

관련 노트: [[jupyter-notebook|Jupyter Notebook]], [[data-collection|파이썬 데이터 수집·가공 (SSAFY)]], [[data-journalism|데이터 저널리즘 실무]]
