---
title: "Django ORM과 QuerySet"
concept: "ORM"
summary: "Django ORM으로 SQL 없이 객체 문법으로 CRUD·조건 조회·정렬·집계를 수행하고, 각각이 어떤 SQL이 되는지 비교한다."
tags: ["django", "orm", "database", "sql"]
source: til
---

ORM(Object-Relational Mapping)은 객체지향 언어의 객체와 관계형 DB의 테이블 사이에서 **호환되지 않는 데이터를 변환해 주는 기법**이다. Django는 내장 ORM으로 DB를 객체처럼 조작하게 해 준다.

| 장점 | 단점 |
| --- | --- |
| SQL을 몰라도 DB 조작 가능 | 복잡한 쿼리는 ORM만으로 표현하기 어려울 수 있음 |
| 절차적 SQL이 아닌 객체지향적 접근 → 생산성 향상 | 생성되는 SQL을 의식하지 않으면 비효율적 쿼리(N+1 등)가 생기기 쉬움 |

> 생성되는 SQL은 `print(queryset.query)`로 언제든 확인할 수 있다. 아래 예시의 SQL 대응은 [SQL 기초](Backend/Database/sql-basics)와 함께 보면 좋다.

예시 모델: `User(first_name, last_name, age, country, phone, balance)`

## CRUD

```python
# Create
User.objects.create(first_name='길동', last_name='홍', age=100,
                    country='제주도', phone='010-1234-4567', balance=10000)
# 또는 user = User(...); user.save()

# Read
User.objects.all()            # SELECT * FROM users_user;
User.objects.get(pk=101)      # SELECT * FROM users_user WHERE id = 101;

# Update — 가져와서, 바꾸고, 저장
user = User.objects.get(pk=101)
user.last_name = '김'
user.save()                   # UPDATE users_user SET ... WHERE id = 101;

# Delete
User.objects.get(pk=101).delete()   # DELETE FROM users_user WHERE id = 101;
```

- `get()`은 **정확히 한 개**를 기대한다. 없으면 `DoesNotExist`, 여러 개면 `MultipleObjectsReturned` 예외가 난다. 그래서 PK처럼 고유한 값으로만 쓴다.
- view에서는 `get()` 대신 `get_object_or_404(Model, pk=pk)`를 쓰면 없을 때 예외 대신 404 응답이 된다. 목록 조회는 데이터가 0건이어도 정상 상태이므로 `get_list_or_404`보다 `all()`/`filter()`로 빈 QuerySet을 받는 편이 자연스럽다.
- 필수 필드를 빼고 생성하면 ORM·SQL 모두 `NOT NULL constraint failed` 오류가 난다. 이미 있는 id로 insert하면 `UNIQUE constraint failed`가 난다.

## 조건 조회: `filter()`

`filter()`는 결과 개수를 보장할 수 없으므로 항상 **QuerySet**을 반환한다.

```python
User.objects.count()                                   # SELECT COUNT(*) ...
User.objects.filter(age=30).values('first_name')       # SELECT first_name ... WHERE age = 30
User.objects.filter(age__gte=30).count()               # WHERE age >= 30
User.objects.filter(age__lte=20).count()               # WHERE age <= 20
User.objects.filter(age=30, last_name='김').count()    # WHERE age = 30 AND last_name = '김'
User.objects.filter(phone__startswith='02-').count()   # WHERE phone LIKE '02-%'
```

| lookup | 의미 |
| --- | --- |
| `__gt`, `__gte`, `__lt`, `__lte` | >, >=, <, <= |
| `__startswith`, `__endswith`, `__contains` | LIKE `'x%'`, `'%x'`, `'%x%'` |
| `__in` | IN (...) |
| `__isnull` | IS NULL |

- `.values('필드')`는 모델 인스턴스 대신 **딕셔너리**의 QuerySet을 돌려준다. 따라서 `.values(...).first()`는 dict이고, `user.phone`처럼 속성으로 접근할 수 없다(`['first_name']`로 접근). 인스턴스가 필요하면 `.values()` 없이 `.first()`를 쓴다.
- `.count()`는 DB에서 `COUNT(*)`로 세므로, 전부 가져와서 세는 `len(User.objects.all())`보다 효율적이다.

### OR 조건: `Q` 객체

여러 키워드 인자는 AND로 묶인다. OR(`|`), AND(`&`), NOT(`~`) 조합은 `Q` 객체로 표현한다.

```python
from django.db.models import Q

User.objects.filter(Q(age=30) | Q(last_name='김'))   # WHERE age = 30 OR last_name = '김'
```

## 정렬과 LIMIT/OFFSET

```python
Movie.objects.order_by('-popularity')[:10]      # 인기도 상위 10개 (인기도 기반 추천의 기본형)
User.objects.order_by('-age')[:10]              # ORDER BY age DESC LIMIT 10
User.objects.order_by('balance', '-age')[:10]   # ORDER BY balance ASC, age DESC LIMIT 10
User.objects.order_by('-last_name', '-first_name')[4]   # ... LIMIT 1 OFFSET 4
```

- `-`는 내림차순. 여러 기준은 **앞의 것이 우선**이고, 앞 기준이 같을 때 다음 기준이 적용된다.
- 슬라이싱 `[:10]`은 `LIMIT`, `[4]`는 `LIMIT 1 OFFSET 4`로 번역된다.

## 집계: `aggregate()`

QuerySet **전체**에 대해 값을 계산해 딕셔너리로 반환한다.

```python
from django.db.models import Avg, Max, Min, Sum, Count

User.objects.aggregate(Avg('age'))                          # {'age__avg': 28.23}
User.objects.aggregate(avg_value=Avg('age'))                # 이름 지정
User.objects.filter(last_name='김').aggregate(Avg('age'), Max('age'), Min('age'))
User.objects.aggregate(Sum('balance'))                      # SELECT SUM(balance) ...
```

## 그룹별 계산: `annotate()`

QuerySet의 **각 항목(그룹)에** 계산한 값을 컬럼처럼 붙인다. `values()`와 함께 쓰면 SQL의 `GROUP BY`가 된다. DB를 바꾸는 것이 아니라 조회 결과에 컬럼을 하나 덧붙이는 것이다.

```python
User.objects.values('country').annotate(Count('country'))
# SELECT country, COUNT(country) AS country__count FROM users_user GROUP BY country

User.objects.values('country').annotate(num=Count('country'), avg_balance=Avg('balance'))
```

1:N 관계에서도 유용하다. 예: 게시글마다 댓글 수, 특정 날짜 이전 댓글 수 붙이기

```python
Article.objects.annotate(
    total_count=Count('comment'),
    old_count=Count('comment', filter=Q(comment__created_at__lte='2000-01-01')),
)
```

## 핵심 정리

- `Model.objects` (Manager) → QuerySet API(`all`, `filter`, `get`, `order_by`, `values` …).
- 단건은 `get(pk=)`, 다건·조건은 `filter()`, OR은 `Q`.
- 전체 집계는 `aggregate`(dict 반환), 그룹별 계산은 `values().annotate()`.
