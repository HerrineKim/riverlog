---
title: "파이썬 데이터 수집·가공"
concept: "Data Collection"
summary: "JSON 파일과 TMDB API에서 영화 데이터를 읽어 필요한 정보만 골라내고 정렬·필터링한 첫 관통 프로젝트."
tags: ["python", "json", "api", "project"]
source: til
---

관통 프로젝트의 출발점은 **데이터를 다루는 일**이었습니다. pjt01에서는 로컬 JSON 파일을, pjt02에서는 TMDB(The Movie Database) API를 통해 영화 데이터를 가져와, 원하는 형태로 가공했습니다. 이후 Django 프로젝트에서 화면에 뿌릴 데이터를 준비하는 기초가 되었습니다.

## 만든 것

- **pjt01**: `movie.json`에서 특정 필드만 골라 새 딕셔너리 만들기 → 장르 ID를 장르 이름으로 바꾸기 → 여러 영화에 같은 작업 반복하기
- **pjt02**: TMDB API로
  - 현재 상영 중인 영화 개수 세기
  - 평점이 일정 기준 이상인 영화만 필터링
  - 평점 상위 5개 영화 뽑기
  - 영화 제목으로 검색해 추천 영화 목록 / 출연 배우·감독 목록 만들기 (API 두 개를 이어서 호출)

## 핵심 기술

### 파일 입출력과 JSON

```python
import json

# with 문을 쓰면 블록이 끝날 때 파일이 자동으로 닫힌다
with open('data/movie.json', encoding='utf-8') as f:
    movie = json.load(f)       # JSON → 파이썬 객체(dict/list)

with open('result.json', 'w', encoding='utf-8') as f:
    json.dump(movie, f, ensure_ascii=False)   # 파이썬 객체 → JSON
```

- `open(file, mode='r', encoding=None)`: 한글 데이터는 `encoding='utf-8'`을 명시하는 습관을 들이자.
- **JSON**(JavaScript Object Notation): 웹에서 데이터를 주고받을 때 쓰는 텍스트 기반 표준 포맷. 대부분의 언어에서 쉽게 읽고 쓸 수 있다.

### 안전한 딕셔너리 접근

```python
for stock in stocks:
    print(stock.get('price', '비상장주식'))   # 키가 없으면 기본값, 기본값을 안 주면 None
```

`dict[key]`는 키가 없으면 `KeyError`가 나지만, `dict.get(key, default)`는 안전하게 기본값을 돌려줍니다.

### API 요청 (requests)

```python
import requests

BASE_URL = 'https://api.themoviedb.org/3'
path = '/movie/now_playing'
params = {
    'api_key': 'YOUR_API_KEY',   # 키는 코드에 직접 쓰지 말고 환경 변수 등으로 관리
    'region': 'KR',
    'language': 'ko',
}

response = requests.get(BASE_URL + path, params=params)
print(response.status_code, response.url)   # 200, 실제 요청 URL 확인
data = response.json()
movies = data.get('results', [])
```

`params`를 딕셔너리로 넘기면 `?api_key=...&region=KR&language=ko` 쿼리 스트링이 자동으로 만들어집니다.

### 정렬과 필터링

```python
# 평점 8 이상만
high_rated = [m for m in movies if m['vote_average'] >= 8]

# 평점 내림차순 상위 5개
top5 = sorted(movies, key=lambda m: m['vote_average'], reverse=True)[:5]
```

처음에는 `key=lambda x: -x['vote_average']`와 for 문으로 0~4번 인덱스를 옮겨 담았는데, `reverse=True`와 슬라이싱을 쓰면 훨씬 간결합니다.

### 웹 스크래핑 맛보기

API가 없는 페이지는 HTML을 받아 직접 파싱합니다.

```python
import requests
from bs4 import BeautifulSoup

html = requests.get('https://finance.naver.com/sise/').text
soup = BeautifulSoup(html, 'html.parser')
kospi = soup.select_one('#KOSPI_now')   # 개발자 도구에서 복사한 CSS 선택자
print(kospi.text)
```

## 배운 점

- API를 쓰면 남이 쌓아 둔 데이터를 내 서비스에 다양하게 활용할 수 있다는 게 신선했다.
- 자료형(list 안의 dict 안의 list …)에 따라 접근 방법을 정확히 알고 있어야 한다. 구조를 먼저 출력해 보고 접근하는 습관이 생겼다.
- 길어 보이는 문제도 결국 기본 문법의 조합이다. 이전 문제와 **같은 방법으로 풀 수 있는 문제임을 알아보는 것**이 중요하다.

관련 노트: [[python-data-analysis|파이썬 데이터 분석 프로세스]], [[rest-api|REST API 설계]]
