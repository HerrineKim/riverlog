---
title: "Django Admin"
concept: "Django Admin"
summary: "모델을 admin.py에 등록해 데이터를 확인·생성·수정할 수 있는 관리자 페이지를 자동으로 만드는 Django 기능."
tags: ["django", "python", "admin", "backend"]
source: til
---

Django Admin은 서버 관리자가 쓰는 페이지로, 모델을 등록하기만 하면 목록·생성·수정·삭제 화면을 자동으로 만들어 준다. 레코드가 제대로 생성되는지 확인하거나 테스트 데이터를 직접 넣을 때 특히 유용하다. (`django.contrib.admin` 앱이 제공하며, 로그인·권한은 `django.contrib.auth`를 사용한다.)

## 사용 순서

1. 관리자 계정 생성

   ```bash
   python manage.py createsuperuser
   ```

2. `admin.py`에 모델 등록

   ```python
   # articles/admin.py
   from django.contrib import admin
   from .models import Article

   class ArticleAdmin(admin.ModelAdmin):
       list_display = ('pk', 'title', 'content', 'created_at', 'updated_at')  # 목록에 보일 열

   admin.site.register(Article, ArticleAdmin)   # ModelAdmin 클래스를 함께 넘겨야 적용됨
   ```

3. `python manage.py runserver` 후 `/admin`에서 로그인

> 고친 점: 원래 필기는 `list_display`에 오타(`'little'`)가 있었고, `ArticleAdmin`을 정의만 하고 `register(Article)`에 넘기지 않아 설정이 적용되지 않았다.

데코레이터 방식도 같다.

```python
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('pk', 'title', 'created_at')
```

## 자주 쓰는 ModelAdmin 옵션

| 옵션 | 효과 |
| --- | --- |
| `list_display` | 목록 화면에 보일 필드 |
| `list_filter` | 오른쪽 필터 사이드바 |
| `search_fields` | 검색창 대상 필드 |
| `ordering` | 기본 정렬 |
| `readonly_fields` | 수정 불가 필드 |

## 핵심 정리

- `createsuperuser` → `admin.site.register(Model, ModelAdmin)` → `/admin`.
- 화면 구성은 `ModelAdmin` 옵션으로 조정한다.

참고: [ModelAdmin options](https://docs.djangoproject.com/en/stable/ref/contrib/admin/#modeladmin-options)
