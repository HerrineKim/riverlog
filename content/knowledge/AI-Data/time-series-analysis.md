---
title: "시계열 분석: 정상성·분해·ARIMA에서 Prophet과 딥러닝 예측까지"
concept: "Time Series Analysis"
summary: "시간 순서로 관측한 데이터를 다루는 시계열 분석을 정리한다. 추세·계절성·주기 성분, 정상성과 ACF·PACF·단위근 검정, 로그 변환과 차분, 고전 분해와 STL, 기준 예측과 지수평활, ARIMA·SARIMAX와 GARCH 같은 확장, Prophet의 성분 모델과 주요 파라미터, 윈도 지도 학습·seq2seq·인과 합성곱 같은 딥러닝 예측, 시간 순서를 지키는 평가, DTW 거리로 하는 시계열 분류·군집까지 다룬다."
tags: ["ai", "data-science", "statistics", "forecasting", "machine-learning", "python"]
source: other
date: "2026-10-31"
sources: ["https://github.com/Team-Neighborhood/I-want-to-study-Data-Science/wiki/%EC%8B%9C%EA%B3%84%EC%97%B4-%EB%B6%84%EC%84%9D", "https://otexts.com/fppkr/", "https://yjucho1.github.io/categories/", "https://namu.wiki/w/%EC%8B%9C%EA%B3%84%EC%97%B4%20%EB%B6%84%EC%84%9D", "https://towardsdatascience.com/almost-everything-you-need-to-know-about-time-series-860241bdc578", "https://hamait.tistory.com/862", "https://www.slideshare.net/hunkim/time-series-classification", "https://zzsza.github.io/data/2019/02/06/prophet/", "https://github.com/AileenNielsen/TimeSeriesAnalysisWithPython", "https://github.com/alexminnaar/time-series-classification-and-clustering", "https://github.com/maxim5/time-series-machine-learning", "https://github.com/JEddy92/TimeSeries_Seq2Seq", "http://www.kocw.net/home/search/kemView.do?kemId=977301"]
---

> Team-Neighborhood의 「[I want to study Data Science](https://github.com/Team-Neighborhood/I-want-to-study-Data-Science/wiki/%EC%8B%9C%EA%B3%84%EC%97%B4-%EB%B6%84%EC%84%9D)」 위키 「시계열 분석」 문서가 모은 자료를 하나씩 읽고 재구성한 노트다.
> 정상성·분해·지수평활·ARIMA의 뼈대는 「[예측: 원리와 실제](https://otexts.com/fppkr/)」(Forecasting: Principles and Practice 한국어판), AR·MA·ARIMA·ARMAX·GARCH는 조윤주의 「[시계열 분석](https://yjucho1.github.io/categories/)」 연재, 정상성 정의와 Box-Jenkins 절차는 「[나무위키: 시계열 분석](https://namu.wiki/w/%EC%8B%9C%EA%B3%84%EC%97%B4%20%EB%B6%84%EC%84%9D)」과 한양대 「[시계열 분석](http://www.kocw.net/home/search/kemView.do?kemId=977301)」 강의 소개, 지수평활·SARIMA 요약은 「[Almost Everything You Need to Know About Time Series](https://towardsdatascience.com/almost-everything-you-need-to-know-about-time-series-860241bdc578)」로 보강했다.
> Prophet은 「[시계열 예측을 위한 Facebook Prophet 사용하기](https://zzsza.github.io/data/2019/02/06/prophet/)」, DTW와 분류·군집은 「[파이썬 코딩으로 말하는 데이터 분석: DTW](https://hamait.tistory.com/862)」·「[Time Series Classification and Clustering](https://github.com/alexminnaar/time-series-classification-and-clustering)」·「[Time series classification](https://www.slideshare.net/hunkim/time-series-classification)」(TF-KR, 2016), 실습 흐름은 「[TimeSeriesAnalysisWithPython](https://github.com/AileenNielsen/TimeSeriesAnalysisWithPython)」, 머신 러닝·딥러닝 예측은 「[Time Series Prediction with Machine Learning](https://github.com/maxim5/time-series-machine-learning)」·「[TimeSeries_Seq2Seq](https://github.com/JEddy92/TimeSeries_Seq2Seq)」으로 보강했다. 옛 API는 2026년 기준 라이브러리로 고쳐 썼다.

## 시계열 분석이란

시계열(time series)은 **시간 순서대로 관측한 값의 나열**이다. 주가, 시간별 전력 사용량, 일별 매출, 서버 지표, 심전도가 모두 시계열이다. 인접한 시점의 값은 서로 상관이 있어서, 관측이 서로 독립이라는 일반 통계·머신 러닝의 가정이 깨진다. 시계열 분석은 이 시간 의존성을 모델에 넣는 방법이다.

| 목적 | 예 |
| --- | --- |
| 예측(forecasting) | 다음 달 수요, 내일 전력 피크 |
| 분류 | 심전도 파형으로 심장 질환 판별, 네트워크 트래픽 유형 분류 |
| 군집 | 비슷한 사용 패턴을 가진 고객·기기 묶기 |
| 이상 탐지 | 평소 패턴에서 벗어난 서버 지표·센서 값 찾기 |
| 구조 이해 | 추세와 계절성을 분리해 계절 조정 지표 만들기 |

시계열 분석과 횡단면 분석(한 시점의 여러 대상)을 합치면 패널 분석이 된다.

## 구성 성분

| 성분 | 뜻 | 예 |
| --- | --- | --- |
| 추세(trend) | 장기적으로 오르거나 내리는 방향 | 인구 증가에 따른 매출 증가 |
| 계절성(seasonality) | **고정된 주기**로 반복되는 패턴 | 낮에 높고 밤에 낮은 전력 사용, 연말 쇼핑 |
| 주기(cycle) | 길이가 **고정되지 않은** 오르내림 | 경기 순환, 포식자·피식자 개체 수 |
| 불규칙(irregular) | 위로 설명되지 않는 잡음 | 측정 오차, 돌발 사건 |

계절성과 주기는 길이가 고정됐는지로 구분한다. 자기상관 그래프가 사인 곡선 모양이면 계절성이 있다는 신호이고, 그 주기가 계절의 길이다.

## 분석 흐름

```text
1. 그래프를 그린다: 추세, 계절성, 급격한 변화, 이상치를 눈으로 확인
2. 필요하면 변환한다: 로그·Box-Cox로 커지는 분산을 고르게
3. 추세와 계절성을 걷어 낸다: 분해로 추정해 빼거나, 차분으로 없앤다
4. 남은 정상 잔차에 모델을 맞춘다: ARMA 등
5. 잔차를 진단한다: 백색잡음처럼 보여야 한다
6. 예측한 뒤 변환을 거꾸로 적용해 원래 단위로 돌린다
```

## 정상성

### 정의

**정상 시계열(stationary time series)** 은 통계적 성질이 관측 시점에 따라 변하지 않는 시계열이다. 실무에서는 약정상성을 쓴다.

| 구분 | 조건 |
| --- | --- |
| 약정상(weak) | 평균이 시점 t와 무관하게 일정하고, 분산이 유한하며, 공분산 `Cov(X_{t+h}, X_t)`가 t가 아니라 시차 h에만 달려 있다 |
| 강정상(strict) | 임의의 시점 묶음을 h만큼 옮겨도 결합 분포가 같다 |

둘은 한쪽이 다른 쪽을 포함하는 관계가 아니다. 분산이 없는 iid 코시 분포는 강정상이지만 약정상이 아니다.

- **추세나 계절성이 있으면 정상이 아니다.** 시점에 따라 평균이 달라지기 때문이다.
- **주기만 있고 추세·계절성이 없으면 정상일 수 있다.** 주기의 길이가 고정되지 않아 관측 전에는 봉우리 위치를 알 수 없기 때문이다.
- 정상 시계열은 장기적으로 예측 가능한 패턴이 없고, 그래프가 대략 평평하며 분산이 일정하다.
- **백색잡음(white noise)**: 평균 0, 분산 일정, 시차가 있으면 공분산 0인 정상 시계열이다. 모든 iid 잡음은 백색잡음이지만 역은 성립하지 않는다.

정상성이 중요한 이유는, 예측이 「시간이 지나도 변하지 않는 무언가」를 전제로 하기 때문이다. ARMA 같은 모델은 정상 시계열을 가정한다.

### 자기상관으로 진단하기

| 도구 | 뜻 | 읽는 법 |
| --- | --- | --- |
| 자기상관 함수(ACF) | 시차 h만큼 떨어진 값끼리의 상관 `ρ(h) = γ(h) / γ(0)` | 비정상 시계열은 ACF가 **천천히** 줄어든다. 정상이면 빠르게 0 근처로 떨어진다 |
| 편자기상관 함수(PACF) | 중간 시차의 영향을 뺀 h 시차 상관 | AR 차수를 고를 때 본다 |
| 융-박스(Ljung-Box) 검정 | 여러 시차의 자기상관을 한꺼번에 검정 | p값이 크면 백색잡음과 구별되지 않는다. 잔차 진단에 쓴다 |

ACF 그래프의 점선 `±1.96/√T`는 백색잡음일 때의 95% 범위다. 막대 대부분이 이 안에 있으면 남은 자기상관이 없다고 본다.

### 단위근 검정

| 검정 | 귀무가설 | 결론 |
| --- | --- | --- |
| ADF(Augmented Dickey-Fuller) | 단위근이 있다(비정상) | p값이 작으면 기각, 정상으로 본다 |
| KPSS | 정상이다 | p값이 작으면 기각, 차분이 필요하다 |

두 검정은 귀무가설이 반대다. 하나만 쓰면 결론이 뒤집히기 쉬우니 그래프·ACF와 함께 판단한다.

```python
from statsmodels.tsa.stattools import adfuller, kpss, acf, pacf
from statsmodels.stats.diagnostic import acorr_ljungbox

adf_stat, adf_p, *_ = adfuller(y, autolag="AIC")
kpss_stat, kpss_p, *_ = kpss(y, regression="c")
acorr_ljungbox(residuals, lags=[10])
```

### 정상으로 만들기

| 문제 | 처리 |
| --- | --- |
| 분산이 시간에 따라 커진다 | 로그·Box-Cox 같은 거듭제곱 변환. 큰 값을 더 많이 줄인다 |
| 평균(수준)이 변한다 | **차분(differencing)** `y'_t = y_t − y_{t−1}` |
| 차분해도 정상이 아니다 | 2차 차분. 「변화의 변화」를 모델링하는 셈이고, 실무에서 그 이상은 거의 없다 |
| 계절성이 있다 | **계절 차분** `y_t − y_{t−m}` (m은 계절 길이, 월별이면 12) |

차분한 값이 백색잡음이면 원래 시계열은 **확률보행(random walk)** `y_t = y_{t−1} + ε_t`이다. 이때 최선의 예측은 마지막 관측값이고(단순 기법), 차분 평균 c가 0이 아니면 `y_t = c + y_{t−1} + ε_t`인 표류(drift) 모델이 된다. 주가처럼 긴 추세와 예측할 수 없는 방향 전환이 섞인 금융·경제 데이터가 이 모양이다.

## 분해

시계열을 성분으로 나눠 각각 보는 방법이다.

| 형태 | 식 | 언제 |
| --- | --- | --- |
| 덧셈 분해 | `y = T + S + R` | 계절 변동의 폭이 수준과 상관없이 일정할 때 |
| 곱셈 분해 | `y = T × S × R` | 수준이 오를수록 계절 변동도 커질 때. 로그를 취하면 덧셈이 된다 |

| 방법 | 특징 |
| --- | --- |
| 이동평균 | 창 크기만큼 평균해 추세-주기를 뽑는다. 창이 길수록 매끄럽다. 계절 길이가 짝수면 이동평균의 이동평균(2×m-MA)을 쓴다 |
| 고전적 분해 | 이동평균으로 추세를 빼고 같은 계절끼리 평균해 계절 성분을 구한다. 양 끝의 추세를 못 구하고, 계절 성분이 매년 같다고 가정한다 |
| X11, SEATS | 공식 통계(계절 조정 지표)에 쓰이는 방법. 월별·분기별 데이터용 |
| **STL** | Loess(국소 회귀)로 추세와 계절을 추정한다. 어떤 주기의 계절성도 다루고, 계절 성분이 천천히 변해도 되며, 이상치에 강건한(robust) 옵션이 있다. 덧셈 분해만 하므로 곱셈 구조는 로그를 취한 뒤 쓴다 |

STL의 주요 설정은 추세 창(`trend`)과 계절 창(`seasonal`)이다. 작을수록 성분이 빨리 변하도록 허용한다. 분해한 뒤 계절 조정 데이터를 예측하고 계절 성분을 다시 더하는 방식으로 예측에도 쓴다.

```python
from statsmodels.tsa.seasonal import STL
res = STL(y, period=12, robust=True).fit()
res.trend, res.seasonal, res.resid
```

## 기준 예측과 지수평활

### 기준 예측

어떤 모델이든 아래 단순 기법보다 나아야 쓸 가치가 있다.

| 기법 | 예측값 |
| --- | --- |
| 평균 | 과거 전체의 평균 |
| 단순(naive) | 마지막 관측값 |
| 계절 단순(seasonal naive) | 작년(지난 계절) 같은 시점의 값 |
| 표류(drift) | 첫 값과 마지막 값을 잇는 직선을 연장 |

### 지수평활

지수평활(exponential smoothing)은 과거 관측에 **멀수록 지수적으로 작아지는 가중치**를 주어 평균한다.

| 기법 | 다루는 것 | 파라미터 |
| --- | --- | --- |
| 단순 지수평활(SES) | 수준만. 예측은 평평하다 | α (0~1). 작을수록 과거를 오래 기억해 매끄럽다 |
| 홀트 선형 추세 | 수준 + 추세 | α, β. 감쇠 추세(damped)는 먼 미래로 갈수록 추세를 누그러뜨린다 |
| 홀트-윈터스 | 수준 + 추세 + 계절 | α, β, γ와 계절 길이 m. 덧셈형과 곱셈형이 있다 |
| ETS 상태 공간 모델 | 오차(Error)·추세(Trend)·계절(Season)을 덧셈(A)·곱셈(M)·없음(N)으로 조합 | 예: ETS(A,A,N)은 덧셈 오차의 홀트 기법. 우도로 추정하고 정보 기준으로 고른다 |

지수평활과 ARIMA는 가장 널리 쓰는 두 예측 접근이고 서로 보완한다. 지수평활은 추세·계절성을 직접 서술하고, ARIMA는 데이터의 자기상관을 서술한다.

## ARIMA

### 구성

| 부분 | 뜻 | 식 |
| --- | --- | --- |
| AR(p) 자기회귀 | 현재 값을 **자기 과거 값** p개로 회귀 | `X_t = φ₁X_{t−1} + … + φ_pX_{t−p} + Z_t` |
| MA(q) 이동평균 | 현재 값을 **과거 오차(백색잡음)** q개의 선형 결합으로 | `X_t = Z_t + θ₁Z_{t−1} + … + θ_qZ_{t−q}` |
| I(d) 누적 | d번 차분해서 정상으로 만든다 | `(1 − B)^d X_t`, B는 후방이동 연산자 `BX_t = X_{t−1}` |

MA(q)는 항상 약정상이다. `|θ| < 1`이면 MA(1)을 AR(∞)로 바꿔 쓸 수 있는데(가역성, invertibility), 정상 시계열에서 AR과 MA는 서로 바꿔 표현할 수 있다. ARIMA(p, d, q)는 d번 차분한 시계열이 ARMA(p, q)를 따르는 모델이다.

### Box-Jenkins 절차

```text
1. 식별: 그래프·ACF·단위근 검정으로 d를 정하고, 차분한 시계열의 ACF·PACF로 p, q 후보를 정한다
2. 추정: 최대 우도(MLE)로 계수를 구한다
3. 진단: 잔차가 백색잡음인지 ACF와 융-박스 검정으로 확인한다
4. 예측: 통과하면 예측하고, 아니면 1로 돌아간다
```

| 그래프 모양 | 시사하는 모델 |
| --- | --- |
| PACF가 p 시차 뒤 끊기고 ACF는 서서히 감소 | AR(p) |
| ACF가 q 시차 뒤 끊기고 PACF는 서서히 감소 | MA(q) |
| 양의 ACF가 아주 천천히 감소 | 차분이 더 필요하다 |

그래프로 정하기 애매하면 **정보 기준(AIC, AICc, BIC)** 이 가장 작은 후보를 고른다. 단, 차분 차수 d가 다른 모델끼리는 정보 기준으로 비교하지 않는다. R `forecast` 패키지의 `auto.arima()`는 KPSS 검정으로 d를 정하고 AICc로 p, q를 단계적으로 탐색한다. 파이썬에서는 `pmdarima.auto_arima`, Nixtla `statsforecast`의 `AutoARIMA`가 같은 일을 한다.

### 확장

| 모델 | 무엇을 더하나 |
| --- | --- |
| SARIMA(p,d,q)(P,D,Q)ₛ | 계절 성분. P·Q는 계절 시차의 AR·MA 차수, D는 계절 차분 횟수, s는 계절 길이 |
| ARIMAX·SARIMAX | 시간에 따라 변하는 **외부 변수(exogenous)**. 초미세먼지 예측에 같은 지역의 온도·습도를 넣었더니 AR(3)의 RMSE가 8.04에서 7.71로 줄었다 |
| VAR | 여러 시계열이 서로의 과거에 영향을 주는 다변량 모델 |
| ARFIMA | d를 0~0.5 사이의 분수로 둬 ACF가 아주 천천히 줄어드는 **장기 기억** 과정을 다룬다 |
| ARCH·GARCH | 분산이 일정하다는 가정을 풀어, **조건부 분산이 과거 값(과 과거 분산)에 따라 변하게** 한다. 금융 수익률의 변동성 군집에 쓴다 |

```python
from statsmodels.tsa.statespace.sarimax import SARIMAX

model = SARIMAX(y, exog=weather, order=(1, 1, 1), seasonal_order=(1, 1, 1, 12))
fit = model.fit()
fit.summary()                                  # 계수, AIC·BIC
fit.forecast(steps=12, exog=future_weather)    # 미래 외부 변수도 함께 넣는다
```

과거에는 `statsmodels.tsa.arima_model.ARIMA`를 썼지만 지금은 `statsmodels.tsa.arima.model.ARIMA`와 `SARIMAX`를 쓴다. 옛 클래스는 statsmodels 0.13에서 없어졌다.

### 주파수 영역: 스펙트럼 분석

시간 영역 대신 주파수 영역에서 시계열을 본다. 고속 푸리에 변환(FFT)으로 어떤 주기가 강한지 찾고, 추세를 뺀 뒤 강한 고조파 몇 개만 남겨 연장하면 단순한 주기 외삽 예측이 된다. Prophet의 계절성도 푸리에 급수로 근사한다.

## Prophet

Prophet은 Meta(구 Facebook)가 만든 시계열 예측 라이브러리다. 통계 지식이 깊지 않아도 **직관적인 파라미터**로 모델을 조정하게 하는 것이 목표다.

```text
y(t) = g(t)      +   s(t)       +   h(t)      +  ε
       추세(growth)  계절성(푸리에)   휴일·이벤트   잡음
```

ARIMA가 시간 의존 구조(자기회귀)를 모델링한다면, Prophet은 **시간을 입력으로 하는 곡선 맞추기(curve fitting)** 로 푼다. 그래서 학습이 빠르고, 빈 구간을 보간하지 않아도 되며, 매달 1일만 있는 것처럼 간격이 불규칙한 데이터도 받는다. 학습은 Stan으로 하고, 기본은 빠른 MAP 추정, `mcmc_samples`를 주면 MCMC로 불확실성을 더 자세히 본다.

| 성분 | 내용 | 주요 파라미터 |
| --- | --- | --- |
| 추세 | 변화점(changepoint)이 있는 선형 추세, 또는 상한이 있는 로지스틱 추세 | `growth="logistic"`이면 데이터에 `cap`(상한)·`floor`(하한) 열 |
| 변화점 | 기본으로 데이터 앞쪽 80% 구간에서 잠재 변화점을 자동 탐지 | `changepoint_range=0.8`, `changepoint_prior_scale=0.05`(키우면 추세가 유연해져 과소적합을 풀고, 줄이면 과적합을 막는다), `changepoints=[...]`로 직접 지정 |
| 계절성 | 주간·연간 계절성을 푸리에 급수로 근사 | `yearly_seasonality=10`(푸리에 차수, 키우면 빠른 변동을 잡지만 과적합 위험), `add_seasonality(name, period, fourier_order)`로 월간 등 추가, `seasonality_mode="multiplicative"` |
| 휴일·이벤트 | 주기는 없지만 크게 영향을 주는 날. 효과는 서로 독립이라 가정 | `holidays` DataFrame(과거와 미래 날짜 모두), `lower_window`·`upper_window`로 앞뒤 영향 범위, `holidays_prior_scale=10`, `add_country_holidays(country_name="KR")` |
| 외부 회귀 변수 | 추세의 선형 부분에 변수를 더한다 | `add_regressor("name")`, 미래 값도 넣어야 한다 |
| 불확실성 | 추세·계절성 추정·잡음의 불확실성을 구간으로 | `interval_width=0.8`(기본 80% 구간) |

```python
from prophet import Prophet          # 과거 패키지 이름은 fbprophet

df = df.rename(columns={"date": "ds", "value": "y"})   # ds, y 두 열이 필수
m = Prophet(changepoint_prior_scale=0.05)
m.add_country_holidays(country_name="KR")
m.fit(df)                                              # 객체 하나는 한 번만 fit할 수 있다
future = m.make_future_dataframe(periods=365)
forecast = m.predict(future)                           # yhat, yhat_lower, yhat_upper
m.plot_components(forecast)                            # 추세·주간·연간·휴일 효과
```

- **이상치는 지운다.** 튀는 값이 있으면 그 뒤의 불확실성 구간이 크게 벌어진다. 해당 구간의 `y`를 `None`으로 두면 예측은 그대로 하되 학습에서 뺀다.
- 모델 평가는 `prophet.diagnostics`의 `cross_validation`·`performance_metrics`(MSE, RMSE, MAE, MAPE, coverage)로 한다.
- 자기회귀가 없으므로 직전 값에 강하게 의존하는 단기 예측에서는 ARIMA·지수평활보다 못할 수 있다. 기준 예측과 같이 비교한다.

## 머신 러닝·딥러닝 예측

### 지도 학습으로 바꾸기

최근 k개 값의 창(window)을 입력, 다음 값을 정답으로 두면 시계열 예측이 일반 회귀 문제가 된다.

```text
창 크기 k=10:  (x[t−10], x[t−9], …, x[t−1])  →  x[t]
```

| 모델 | 특징 |
| --- | --- |
| 선형 회귀 | 아주 단순하지만 의외로 잘 맞고, 앙상블에서 복잡한 모델을 보완한다 |
| 그래디언트 부스팅(XGBoost, LightGBM) | 시차·이동 통계·달력 특징을 만들어 넣는다. 표 데이터식 접근의 강자([[decision-tree-ensemble\|결정 트리와 앙상블]]) |
| MLP, RNN(LSTM·GRU), 1D CNN | 창 전체를 받아 패턴을 학습한다 |
| 앙상블 | 서로 다른 모델의 예측을 섞는다 |

가격처럼 수준이 계속 변하는 값은 원값 대신 **변화율(percent change)** 로 바꿔 학습하고 예측도 변화율로 낸다. 정상성을 확보하는 차분과 같은 발상이다.

### 수많은 계열을 한 번에: seq2seq

웹페이지 수십만 개의 일별 트래픽처럼 **계열이 아주 많으면** 계열마다 ARIMA를 맞추고 파라미터를 관리하기 어렵다. 이때 모든 계열을 한 모델로 학습하는 신경망이 빛난다.

- **인코더-디코더(seq2seq)**: 인코더 LSTM이 과거 구간을 읽어 상태로 요약하고, 디코더가 그 상태에서 미래 구간(예: 14일)을 한 스텝씩 생성한다. 학습 때는 디코더 입력에 실제 값(한 스텝 밀린 것)을 넣는 **teacher forcing**을 쓰고, 예측 때는 자기 예측값을 다음 입력으로 넣는다.
- **전처리**: 계열마다 규모가 다르므로 `log1p` 변환 뒤 인코더 구간 평균을 빼서 맞추고, `(계열 수, 시점 수, 특징 수)` 텐서로 만든다. 예측 뒤에는 거꾸로 되돌린다.
- **인과 합성곱(causal convolution)**: 일반 1D 합성곱은 미래 입력이 과거 출력에 섞인다. 출력을 시점만큼 밀어 **과거만 보게** 한 것이 인과 합성곱이다(Keras `padding="causal"`). 여기에 층마다 팽창률(dilation)을 1, 2, 4, 8 …로 두 배씩 키우면 가중치를 크게 늘리지 않고도 수용 영역이 지수적으로 넓어져 긴 의존성을 잡는다. 음성 생성 모델 WaveNet의 구조다.

지금은 N-BEATS, Temporal Fusion Transformer 같은 예측 전용 신경망과, 대량의 시계열로 사전 학습한 시계열 파운데이션 모델(TimesFM, Chronos 등)까지 선택지가 넓어졌다. 파이썬에서는 `statsforecast`·`neuralforecast`, `darts`, `sktime`이 통계 모델과 신경망을 같은 인터페이스로 묶는다. 그래도 출발점은 기준 예측과 지수평활·ARIMA다.

## 평가: 시간 순서를 지킨다

- **무작위로 섞어 나누지 않는다.** 과거로 학습하고 그 뒤 구간으로 검증해야 미래 데이터가 학습에 새지 않는다.
- **워크 포워드(walk-forward) 검증**: 검증 구간을 학습 구간과 같은 길이로 두되 시간상 앞으로 밀어서(예: 14일 뒤) 만든다. 원점을 계속 옮기며 여러 번 하면 시계열 교차 검증(rolling origin)이다.
- 잔차(학습 데이터에 대한 한 스텝 오차)가 작은 것과 예측 오차(처음 보는 미래)가 작은 것은 다르다. 모델 선택은 예측 오차로 한다.

| 지표 | 특징 |
| --- | --- |
| MAE | 단위가 원 데이터와 같고 해석이 쉽다 |
| RMSE | 큰 오차에 더 큰 벌점 |
| MAPE | 비율이라 계열 간 비교가 되지만, 값이 0이나 0 근처면 터진다 |
| MASE | 단순 기법(또는 계절 단순 기법)의 오차로 나눈 척도. 1보다 작으면 기준보다 낫다 |

## 시계열끼리 비교하기: DTW, 분류, 군집

### 유클리드 거리의 한계

같은 길이의 두 시계열은 시점끼리 값 차이의 제곱합으로 비교할 수 있다. 하지만 이 거리는 **세로(값) 방향 변화에는 둔감하고 시간 축의 늘어남·밀림에는 민감**하다. 같은 사인파를 조금 늘인 것이 전혀 다른 파형보다 멀게 나오기도 한다. 길이가 다른 시계열을 선형 보간으로 맞추면 뾰족한 봉우리가 뭉개진다.

### 동적 시간 왜곡(DTW)

DTW(Dynamic Time Warping)는 두 시계열의 **최적 비선형 정렬**을 찾고, 정렬된 쌍끼리의 거리를 합한다. 한 점이 상대편 여러 점에 대응할 수 있어 속도가 다른 걷기 패턴, 길이가 다른 시계열도 비교한다.

```text
비용 행렬:  cost[i][j] = d(a_i, b_j) + min(cost[i−1][j−1], cost[i−1][j], cost[i][j−1])
최종 거리:  cost[n−1][m−1],  최적 경로는 끝에서부터 가장 작은 이웃 칸을 따라 거꾸로 찾는다
```

| 제약 | 뜻 |
| --- | --- |
| 경계 | 경로는 두 시계열의 처음끼리에서 시작해 끝끼리에서 끝난다 |
| 단조 | 시간을 거꾸로 가지 않는다 |
| 스텝 크기 | 한 번에 오른쪽·위·대각선 한 칸처럼 정해진 만큼만 움직인다. 허용 스텝을 늘리면 더 많이 탐색하지만 느려진다 |

경로가 대각선으로 곧게 가면 두 시계열이 같은 속도로 변했다는 뜻이다.

| 가속 | 방법 |
| --- | --- |
| 지역 창 제약(Sakoe-Chiba band) | 두 시점 i, j의 차이가 창 크기 w 이하인 칸만 계산한다. 멀리 떨어진 시점끼리는 대응하지 않는다는 가정 |
| LB_Keogh 하한 | 상대 시계열의 앞뒤 r 범위 최댓값·최솟값으로 띠를 만들고, 띠 밖으로 나간 정도만 더한다. 계산이 **선형**이고 항상 DTW 이하이므로, 지금까지 찾은 최근접보다 하한이 크면 DTW를 계산하지 않고 버린다 |

DTW의 계산량은 두 길이의 곱 O(nm)이라 긴 시계열을 많이 비교하면 비싸다. 위 두 가지를 같이 쓴다.

### 분류와 군집

| 과제 | 방법 |
| --- | --- |
| 분류 | **DTW 거리 + 1-최근접 이웃(1-NN)** 이 오래전부터 강력한 기준이다. k=1일 때 결과가 가장 좋은 경우가 많다. SVM·나이브 베이즈는 입력 특징이 독립이라는 가정이 시계열과 맞지 않는다 |
| 군집 | k-means의 거리를 DTW로 바꾸거나, DTW 거리 행렬로 계층적 군집(Ward 연결)을 한다 |
| 딥러닝 분류 | 원 데이터를 평활(잡음 억제), 필터링, 업·다운샘플링(시간 축 늘이기·줄이기)으로 여러 버전으로 변형하고, 버전마다 1D CNN을 학습해 소프트맥스 가중 앙상블로 합친다. 같은 패턴이 다른 시간 규모로 나타나는 문제와 잡음 문제를 함께 다룬다 |

지금은 무작위 합성곱 커널로 특징을 뽑는 ROCKET 계열과 InceptionTime 같은 신경망이 시계열 분류의 기준 모델로 쓰인다. DTW·1-NN·ROCKET은 `tslearn`, `aeon`, `sktime`에 구현돼 있다. 응용은 가전별 전력 사용 패턴 인식, 심전도 진단, 신생아 패혈증 조기 진단, 네트워크 트래픽 분류, 서버 전력 예측 등이다.

## pandas로 시계열 다루기

| 작업 | 방법 |
| --- | --- |
| 날짜 인덱스 | `pd.read_csv(..., parse_dates=["date"], index_col="date")`로 `DatetimeIndex`를 만든다 |
| 부분 문자열 인덱싱 | `df["1949"]`, `df["1949-01":"1949-03"]`처럼 기간으로 자른다 |
| 시간대 | `tz_localize`로 시간대를 붙이고 `tz_convert`로 바꾼다 |
| 리샘플링 | `df.resample("ME").sum()`처럼 주기를 바꿔 집계한다 |
| 이동 창 | `df.rolling(window=12).mean()`, `.var()`로 평균·분산이 시간에 따라 변하는지 본다. 창 크기 선택은 판단의 문제다 |
| 시차·차분 | `df.shift(1)`, `df.diff()`, 로그 차분 `np.log(df).diff()` |

## 정리

- 시계열은 인접 관측이 서로 의존한다. 추세·계절성·주기·불규칙 성분으로 나눠 본다.
- 많은 통계 모델은 정상성을 전제로 한다. 로그 변환으로 분산을, 차분·계절 차분으로 평균 변화를 다스리고, ACF와 ADF·KPSS로 확인한다.
- 분해(STL)는 구조 이해와 계절 조정에, 지수평활과 ARIMA는 예측에 쓴다. 차수는 ACF·PACF와 정보 기준으로 정하고, 잔차가 백색잡음인지 꼭 진단한다.
- Prophet은 추세·푸리에 계절성·휴일을 더한 곡선 맞추기로, 결측과 불규칙 간격에 강하고 파라미터가 직관적이다.
- 계열이 많으면 하나의 신경망(seq2seq, 인과 합성곱)으로 함께 학습한다. 어떤 모델이든 단순 기법보다 나은지, 시간 순서를 지킨 검증으로 확인한다.
- 시계열끼리의 비교는 DTW가 기본이고, DTW + 1-NN이 분류의 강한 기준이다.

관련 노트: [[machine-learning-basics|머신 러닝 기초: 네 단계 추상화]], [[python-data-analysis|파이썬 데이터 분석 프로세스]], [[data-visualization|데이터 시각화]], [[decision-tree-ensemble|결정 트리와 앙상블]], [[observability|관측 가능성]]
