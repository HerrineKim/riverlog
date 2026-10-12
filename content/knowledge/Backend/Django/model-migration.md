---
title: "Django Model과 Migration"
concept: "Django Model"
summary: "models.py의 클래스로 DB 테이블 구조를 정의하고, makemigrations·migrate로 그 변경을 데이터베이스에 반영하는 방법."
tags: ["django", "database", "orm", "python"]
source: til
---

Model은 **웹 애플리케이션의 데이터를 구조화하고 조작하기 위한 도구**다. 저장할 데이터의 필드와 동작을 정의하며, 일반적으로 모델 하나가 DB 테이블 하나에 매핑된다. 기본 DB는 SQLite다.

## 데이터베이스 기본 용어

| 용어 | 의미 |
| --- | --- |
| 스키마(Schema) | DB의 자료 구조, 표현 방법, 관계를 정의한 구조 |
| 테이블(Table) | 행과 열로 조직된 데이터 집합 (관계형 DB에서는 relation이라고도 함) |
| 열(Column) | 필드·속성. 열마다 데이터 타입이 정해짐 |
| 행(Row) | 레코드·튜플. 실제 데이터 한 건 |
| PK(Primary Key) | 각 행을 고유하게 식별하는 값. Django는 `id`(자동 증가)를 자동 생성 |
| 쿼리(Query) | 데이터를 조회·조작하는 명령. "쿼리를 날린다" = DB를 조작한다 |

## 모델 작성

```python
# articles/models.py
from django.db import models

class Article(models.Model):              # django.db.models.Model 상속
    title = models.CharField(max_length=10)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
```

클래스 속성 하나하나가 테이블의 열에 매핑된다.

| 필드 | 설명 |
| --- | --- |
| `CharField(max_length=...)` | 길이 제한이 있는 문자열. `max_length` **필수**이며 DB 제약과 Django 유효성 검사에 모두 쓰인다 |
| `TextField()` | 길이 제한 없는 긴 텍스트. `max_length`를 줘도 폼 위젯(textarea)에만 반영되고 DB에는 적용되지 않는다 |
| `DateTimeField(auto_now_add=True)` | **최초 생성** 시각. 처음 insert될 때만 기록 |
| `DateTimeField(auto_now=True)` | **최종 수정** 시각. `save()`할 때마다 갱신 |
| `IntegerField`, `BooleanField`, `ForeignKey` … | 숫자, 불리언, [관계](Backend/Django/relationships) 등 |

## Migration

Migration은 **모델의 변경 사항을 DB 스키마에 반영하는 방법**이다. 모델을 "설계도"로 만든 뒤 실제 DB에 적용하는 두 단계를 거친다.

```bash
python manage.py makemigrations      # 모델 변경 → 설계도(migrations/0001_initial.py) 생성
python manage.py migrate             # 설계도를 실제 DB에 적용 (모델과 스키마 동기화)
python manage.py sqlmigrate articles 0001   # 설계도가 어떤 SQL로 실행될지 미리 보기
python manage.py showmigrations      # 각 설계도의 적용 여부 확인 ([X] = 적용됨)
```

`sqlmigrate` 출력 예:

```sql
BEGIN;
CREATE TABLE "articles_article" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "title" varchar(10) NOT NULL,
  "content" text NOT NULL
);
COMMIT;
```

테이블 이름은 기본적으로 `앱이름_모델이름`(소문자)이 된다.

### 기존 데이터가 있는 테이블에 필드 추가

이미 행이 있는 테이블에 `NOT NULL` 필드(예: `created_at`)를 추가하면 `makemigrations`가 기존 행에 넣을 기본값을 묻는다.

1. `1`을 선택해 지금 기본값을 입력하겠다고 답한다.
2. 프롬프트에서 엔터를 누르면 제안된 `timezone.now`가 기본값으로 쓰인다.
3. `migrate`로 반영한다.

> 생성된 migration 파일은 버전 관리에 포함하고, 이미 적용된 파일은 함부로 수정·삭제하지 않는다.

## 모델 → DB API

모델을 정의하면 Django가 데이터를 생성·조회·수정·삭제할 수 있는 **DB API**를 자동으로 만들어 준다.

```python
Article.objects.all()
# Article: 모델 클래스
# objects: Manager — DB 쿼리와 연결되는 인터페이스 (모든 모델에 기본 추가)
# all(): QuerySet API — DB에서 받은 객체 목록(0개 이상)을 다룸
```

자세한 사용법은 [ORM과 QuerySet](Backend/Django/orm-queryset).

## 핵심 정리

- 모델 클래스 = 테이블, 클래스 속성 = 열, 인스턴스 = 행.
- 모델을 바꾸면 항상 `makemigrations` → `migrate`.
- `auto_now_add`는 생성 시각, `auto_now`는 수정 시각.
