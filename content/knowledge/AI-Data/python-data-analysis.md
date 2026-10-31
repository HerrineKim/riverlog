---
title: "파이썬 데이터 분석 프로세스"
concept: "EDA"
summary: "데이터를 구하고 처리한 뒤 탐색적 데이터 분석(EDA)과 시각화로 패턴을 찾고, 필요하면 성능을 개선하는 파이썬 데이터 분석의 흐름."
tags: ["data-science", "python", "eda", "visualization"]
source: notion
date: "2026-10-13"
sources: ["https://pandas.pydata.org/", "https://pola.rs/", "https://bytebytego.com/guides/5-functions-to-merge-data-with-pandas", "https://playwright.dev/python/docs/intro", "고려사이버대학교 데이터 시각화 강의(최대영 교수, 2024 여름계절학기)"]
---

> 노션 정리를 바탕으로 재구성하고, pandas로 표 합치기는 ByteByteGo의 System Design 101 가이드 「[5 Functions to Merge Data with Pandas](https://bytebytego.com/guides/5-functions-to-merge-data-with-pandas)」를 바탕으로 pandas 공식 문서 기준으로 보강한 노트다.
> 분석 방법의 네 갈래와 시각화 절은 고려사이버대학교 「데이터 시각화」(2024 여름계절학기) 강의 내용으로 보강했다.

파이썬은 데이터 수집부터 분석·시각화까지 한 언어로 처리할 수 있는 생태계를 갖추고 있어 데이터 분석의 기본 언어로 쓰인다. 분석은 대략 **데이터 구하기 → 처리와 분석 → 탐색·시각화 → 개선**의 흐름으로 진행된다.

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
- **브라우저 자동화**(JavaScript로 그려지는 페이지): `playwright`, `selenium`. 새로 짜면 자동 대기와 헤드리스 실행이 기본인 Playwright를 먼저 고려한다
- **파싱**: `BeautifulSoup`, `lxml`, `json`
- **기사 본문 추출**: `newspaper4k`: [[newspaper-article-scraping|newspaper로 기사 본문 추출하기]], [[data-pipeline-basics|데이터 파이프라인과 저장소 용어]]

```python
import requests
from bs4 import BeautifulSoup

html = requests.get("https://example.com").text
soup = BeautifulSoup(html, "html.parser")
print(soup.select_one("h1").text)
```

### 수집 데이터 다루기 기본기

JSON 파일이나 API 응답을 받으면 `dict`/`list`가 중첩된 구조가 되므로, 접근하기 전에 구조를 먼저 출력해 보는 것이 안전하다.

```python
import json
import requests

# 파일 입출력: with 문은 블록이 끝나면 파일을 자동으로 닫는다
with open("data/movie.json", encoding="utf-8") as f:   # 한글 데이터는 encoding을 명시
    movie = json.load(f)                                # JSON → dict/list
with open("result.json", "w", encoding="utf-8") as f:
    json.dump(movie, f, ensure_ascii=False)             # dict/list → JSON

# 키가 없을 수 있으면 dict.get으로 기본값 지정 (dict[key]는 KeyError)
price = movie.get("price", "정보 없음")

# API 요청: params 딕셔너리가 ?region=KR&language=ko 쿼리 스트링이 된다
response = requests.get(
    "https://api.themoviedb.org/3/movie/now_playing",
    params={"api_key": API_KEY, "region": "KR", "language": "ko"},   # 키는 환경 변수 등으로 관리
)
movies = response.json().get("results", [])

# 필터링과 정렬
high_rated = [m for m in movies if m["vote_average"] >= 8]
top5 = sorted(movies, key=lambda m: m["vote_average"], reverse=True)[:5]   # 내림차순 상위 5개
```

- 응답이 두 API에 걸쳐 있으면(예: 영화 검색 → 출연진 조회) 첫 응답의 id를 다음 요청의 경로에 넣어 이어서 호출한다.
- API 키를 코드에 직접 쓰지 않는다.

### 표 데이터 다루기

수집한 데이터는 DataFrame(행·열로 된 표)으로 바꿔 다룬다.

| 라이브러리 | 특징 |
| --- | --- |
| NumPy | 같은 타입 값만 담는 다차원 배열과 배열 연산. 파이썬 리스트보다 빠르고 메모리를 덜 쓴다. pandas·머신 러닝 라이브러리의 바탕 |
| pandas | 1차원 Series와 2차원 DataFrame으로 행·열 데이터를 다루는 표준 라이브러리. 생태계(시각화·머신 러닝 라이브러리)와 가장 잘 맞물린다 |
| Polars | Rust로 만든 DataFrame. 멀티코어와 지연 실행(lazy)으로 pandas보다 훨씬 빠르고 메모리를 덜 쓴다. 큰 데이터에 먼저 고려한다 |
| DuckDB | 파일(CSV·Parquet)과 DataFrame에 바로 SQL을 던지는 내장형 분석 DB |

```python
import pandas as pd

df = pd.read_csv("data/sales.csv")
df.info()              # 열 이름·타입·결측치 수
df.describe()          # 숫자 열의 요약 통계
df.groupby("region")["amount"].sum().sort_values(ascending=False)
```

#### pandas로 표 합치기

| 함수 | 합치는 방식 | 쓰임 |
| --- | --- | --- |
| `pd.concat([a, b])` | 위아래(`axis=0`) 또는 옆으로(`axis=1`) 이어 붙인다 | 샤드별·날짜별로 나뉜 같은 구조의 표 합치기 |
| `a.merge(b, on="key", how=...)` | **열 값**을 키로 SQL 조인처럼 합친다. `how`는 `inner`(기본)·`left`·`right`·`outer` | 키가 같은 서로 다른 도메인의 데이터 결합 |
| `a.join(b)` | **인덱스**를 키로 합친다. 기본은 left 조인 | 인덱스가 이미 맞춰진 표에 열 붙이기 |
| `a.combine(b, func)` | 같은 위치의 셀끼리 함수로 계산해 합친다. `combine_first`는 `a`의 빈칸을 `b`로 채운다 | 두 출처 중 작은 값 고르기, 결측치 보완 같은 정제 |

과거에는 행을 덧붙일 때 `DataFrame.append`를 썼지만 pandas 2.0에서 없어졌다. 지금은 `pd.concat`을 쓴다. 크롤러처럼 행이 계속 늘어나면 리스트에 모았다가 마지막에 한 번 `concat`하는 편이 빠르다.

```python
orders.merge(users, left_on="user_id", right_on="id", how="left")
pd.concat([df_jan, df_feb], ignore_index=True)
```

## 2. EDA: 탐색적 데이터 분석

**EDA(Exploratory Data Analysis)** 는 본격적인 모델링 전에 시각화, 요약 통계, 간단한 모델 등으로 데이터를 여러 각도에서 살펴보며 **이해하는** 과정이다.

- 데이터의 구조와 분포 이해
- 트렌드와 패턴 파악
- 이상치(특이값) 발견
- 어떤 모델·분석 방법을 쓸지 결정

EDA는 데이터 분석 방법 네 갈래 중 첫 번째에 속한다.

| 방법 | 묻는 것 | 대표 기법 |
| --- | --- | --- |
| 기술적(descriptive) | 무슨 일이 있었나 | 요약 통계, EDA |
| 진단적(diagnostic) | 무엇이 특이하고 왜 그런가 | 군집화 같은 비지도 학습 |
| 예측적(predictive) | 변수 사이에 어떤 관계가 있고 앞으로 어떻게 될까 | 회귀·분류 같은 지도 학습 |
| 처방·적응적(prescriptive) | 무엇을 해야 하나 | 시행과 보상을 반복하는 강화 학습 |

## 3. 시각화

시각화는 "예뻐서"가 아니라 **사람이 이해하기 쉽게 전달하기 위해** 한다. 패턴을 알아보는 인간의 능력을 활용하는 방법이자, EDA의 핵심 단계다. 다만 기술적 분석에만 쓰이지 않는다. 모델 결과를 해석하는 설명 가능한 AI(XAI)까지 분석 전 과정에 쓰인다.

- **늘 최선인 차트는 없다.** 데이터 특성과 목적에 맞게 여러 방식으로 그려 본 뒤 사람이 고른다.
- 그림만 두지 말고 핵심 통계치·숫자를 함께 보여 줄 때 전달력이 높다.
- 결과를 올바르게 읽고 해석하는 데이터 리터러시도 함께 길러야 한다.

| 알고 싶은 것 | 노트 |
| --- | --- |
| 시각 채널의 원리(그래픽 문법, 지각), 질문별 차트 고르기, 겹침·색·레이블 같은 디자인 판단 | [[data-visualization\|데이터 시각화]] |
| 시각화 도구를 과업 분석부터 평가까지 설계하기 | [[visualization-design-process\|시각화 설계 과정]] |

| 라이브러리 | 특징 |
| --- | --- |
| matplotlib | 가장 기본이 되는 정적 그래프 라이브러리 |
| seaborn | matplotlib 기반, 통계 그래프를 간결한 코드로 |
| Plotly / Plotly Express | JavaScript 기반 인터랙티브 차트 |
| Bokeh | 웹 브라우저용 인터랙티브 시각화 |
| Altair (Vega) | 선언적 문법의 시각화 |

Altair처럼 그래픽 문법을 API로 옮긴 라이브러리의 바탕은 [[data-visualization#그래픽 문법: 차트를 일곱 부품으로 나누기|데이터 시각화]]에 있다. 모두 [Jupyter Notebook](jupyter-notebook.md)이나 설치 없이 브라우저에서 돌고 GPU도 쓸 수 있는 Google Colab에서 바로 결과를 확인할 수 있다.

## 4. 분석 개선하기

### 성능

- **프로파일링**: 어디가 느린지 먼저 재고 고친다. 측정 방법은 Jupyter 매직 명령 정리([[jupyter-notebook#알아 두면 좋은 기능|Jupyter Notebook]])에 있다.
- **GPU 가속**: CUDA, cuDF(GPU 기반 DataFrame)
- **더 빠른 DataFrame**: Polars, DuckDB로 바꾸는 것만으로 단일 머신에서 수십 배 빨라지는 경우가 많다
- **병렬·분산 처리**: Dask, Ray, Spark(PySpark) (메모리보다 큰 데이터 처리)
- **JIT 컴파일**: Numba(숫자 계산 루프), PyPy(순수 파이썬 코드)

### 협업과 환경

노트북을 공유·배포하는 도구(nbconvert, nbviewer, Binder), 클라우드 노트북 서비스, JupyterLab·VS Code·PyCharm 같은 대체 환경은 [[jupyter-notebook|Jupyter Notebook]] 노트에서 다룬다.

## 더 공부하기

- 커뮤니티: PyCon, PyData, JupyterCon
- 학습 지도: 「[I want to study Data Science](https://github.com/Team-Neighborhood/I-want-to-study-Data-Science/wiki)」 위키는 데이터 분석가·엔지니어·ML 엔지니어·과학자 직무 구분과 Git·리눅스·파이썬·선형대수부터 비전·NLP·추천·MLOps까지의 공부 목록, 데이터셋·포트폴리오 자료를 모아 둔다.
- 책: 『파이썬 라이브러리를 활용한 데이터 분석』, 『파이썬 데이터 사이언스 핸드북』, 『밑바닥부터 시작하는 데이터 과학』

관련 노트: [[jupyter-notebook|Jupyter Notebook]], [[data-journalism|데이터 저널리즘 실무]], [[machine-learning-basics|머신 러닝 기초: 네 단계 추상화]], [[location-estimation|데이터의 위치 추정]], [[newspaper-article-scraping|newspaper로 기사 본문 추출하기]], [[data-visualization|데이터 시각화]], [[visualization-design-process|시각화 설계 과정]]
