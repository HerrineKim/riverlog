---
title: "Django ORM과 QuerySet"
concept: "ORM"
summary: "Django ORM으로 SQL 없이 객체 문법으로 CRUD·조건 조회·정렬·집계를 수행하는 방법과, 각 API가 어떤 SQL이 되는지 대응표로 정리한다."
tags: ["django", "orm", "database", "sql"]
source: til
date: "2026-10-13"
---

ORM(Object-Relational Mapping)은 객체지향 언어의 객체와 관계형 DB의 테이블 사이에서 **호환되지 않는 데이터를 변환해 주는 기법**이다. Django는 내장 ORM으로 DB를 객체처럼 조작하게 해 준다.

| 장점 | 단점 |
| --- | --- |
| SQL을 몰라도 DB 조작 가능 | 복잡한 쿼리는 ORM만으로 표현하기 어려울 수 있음 |
| 절차적 SQL이 아닌 객체지향적 접근 → 생산성 향상 | 생성되는 SQL을 의식하지 않으면 비효율적 쿼리(N+1 등)가 생기기 쉬움 |

생성되는 SQL은 `print(queryset.query)`로 언제든 확인할 수 있다. SQL 문법 자체는 [[sql-basics|SQL 기초]]에 있다.

## ORM ↔ SQL 대응표

예시 모델은 `User(first_name, last_name, age, country, phone, balance)`, 테이블은 `users_user`다.

| ORM | SQL | 비고 |
| --- | --- | --- |
| `User.objects.create(first_name='길동', ...)` | `INSERT INTO users_user (...) VALUES (...)` | `User(...).save()`와 같다 |
| `User.objects.all()` | `SELECT * FROM users_user` | QuerySet 반환 |
| `User.objects.get(pk=101)` | `... WHERE id = 101` | 정확히 1건. 아래 주의 참고 |
| `user.last_name = '김'; user.save()` | `UPDATE ... SET ... WHERE id = 101` | 가져와서, 바꾸고, 저장 |
| `user.delete()` | `DELETE FROM ... WHERE id = 101` | |
| `filter(age=30, last_name='김')` | `WHERE age = 30 AND last_name = '김'` | 키워드 인자는 AND |
| `filter(age__gte=30)` | `WHERE age >= 30` | `__gt`·`__lt`·`__lte`도 같은 방식 |
| `filter(phone__startswith='02-')` | `WHERE phone LIKE '02-%'` | `__endswith`, `__contains`는 `'%x'`, `'%x%'` |
| `filter(id__in=[1, 2])`, `filter(phone__isnull=True)` | `IN (1, 2)`, `IS NULL` | |
| `filter(Q(age=30) \| Q(last_name='김'))` | `WHERE age = 30 OR last_name = '김'` | `Q`로 OR(`\|`)·AND(`&`)·NOT(`~`) |
| `order_by('balance', '-age')` | `ORDER BY balance ASC, age DESC` | `-`는 내림차순, 앞 기준이 우선 |
| `[:10]`, `[4]` | `LIMIT 10`, `LIMIT 1 OFFSET 4` | 슬라이싱이 LIMIT/OFFSET이 된다 |
| `count()` | `SELECT COUNT(*)` | |
| `aggregate(Avg('age'), Max('age'))` | `SELECT AVG(age), MAX(age)` | QuerySet 전체를 dict 하나로 |
| `values('country').annotate(n=Count('id'))` | `SELECT country, COUNT(id) ... GROUP BY country` | 그룹마다 값을 붙인다 |

```python
from django.db.models import Avg, Count, Max, Q

User.objects.filter(last_name='김').aggregate(Avg('age'), Max('age'))
# {'age__avg': 28.2, 'age__max': 64} — 이름을 주려면 avg_value=Avg('age')

User.objects.values('country').annotate(num=Count('id'), avg_balance=Avg('balance'))
```

## 주의할 점

### `get()`은 정확히 한 건

- 없으면 `DoesNotExist`, 여러 건이면 `MultipleObjectsReturned` 예외가 난다. 그래서 PK처럼 고유한 값으로만 쓴다.
- view에서는 `get_object_or_404(Model, pk=pk)`를 쓰면 없을 때 예외 대신 404 응답이 된다.
- 목록은 0건이어도 정상 상태다. `get_list_or_404`보다 `filter()`로 빈 QuerySet을 받는 편이 자연스럽다.

### `values()`는 dict를 돌려준다

`.values('first_name')`은 모델 인스턴스가 아니라 **딕셔너리**의 QuerySet이다. `.values(...).first()`는 dict라서 `user.phone`처럼 속성으로 접근할 수 없고 `['first_name']`으로 꺼낸다. 인스턴스가 필요하면 `.values()` 없이 `.first()`를 쓴다.

### `count()` vs `len()`

`.count()`는 DB에서 `COUNT(*)`로 센다. `len(User.objects.all())`은 모든 행을 메모리로 가져온 뒤 센다. 개수만 필요하면 `count()`다. 이미 QuerySet을 순회할 예정이라면 `len()`이 추가 쿼리를 아낀다.

### `annotate()`는 조회 결과에 컬럼을 덧붙일 뿐이다

DB를 바꾸지 않는다. 1:N 관계에서 부모마다 자식 수를 붙일 때 특히 쓸모 있다.

```python
Article.objects.annotate(
    total_count=Count('comment'),
    old_count=Count('comment', filter=Q(comment__created_at__lte='2000-01-01')),
)
```

### 제약 위반

필수 필드를 빼고 생성하면 `NOT NULL constraint failed`, 이미 있는 id로 넣으면 `UNIQUE constraint failed`가 난다. ORM이 SQL로 번역할 뿐이라 오류도 DB의 것이 그대로 올라온다.

## 핵심 정리

- `Model.objects`(Manager) → QuerySet API(`all`, `filter`, `get`, `order_by`, `values` …).
- 단건은 `get(pk=)`, 다건·조건은 `filter()`, OR은 `Q`.
- 전체 집계는 `aggregate`(dict 반환), 그룹별 계산은 `values().annotate()`.
- 의심스러우면 `queryset.query`로 SQL을 본다.

관련 노트: [[sql-basics|SQL 기초]], [[model-migration|Django Model과 Migration]], [[relationships|Django 모델 관계 (1:1, 1:N, M:N)]]
