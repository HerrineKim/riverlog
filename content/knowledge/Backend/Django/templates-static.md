---
title: "Django Template과 Static 파일"
concept: "Django Template"
summary: "DTL의 변수·필터·태그와 템플릿 상속으로 화면을 구성하고, form으로 데이터를 받고, CSS·이미지 같은 정적 파일을 연결하는 방법."
tags: ["django", "python", "template", "frontend"]
source: til
---

Django 템플릿은 **표현(presentation)을 위한 도구**다. 조건·반복 같은 구조를 쓸 수 있지만 Python 코드가 실행되는 것이 아니며, 로직은 view에 두고 템플릿은 보여 주는 일에만 집중하도록 설계되었다(표현과 로직의 분리, 중복 배제).

## DTL(Django Template Language) 문법

| 문법 | 형태 | 설명 |
| --- | --- | --- |
| Variable | `{{ variable }}` | view의 context로 넘긴 값 출력. `.`으로 속성 접근(`{{ article.title }}`). 밑줄로 시작하거나 공백·구두점 포함 불가 |
| Filter | `{{ variable\|filter }}` | 출력 값 변형. 예: `{{ name\|lower }}`, `{{ content\|truncatechars:20 }}` |
| Tag | `{% tag %}` | 반복·조건 등 제어 흐름. 일부는 `{% endtag %}`로 닫음 |
| Comment | `{# 주석 #}` | 한 줄 주석 (여러 줄은 `{% comment %}`) |

```django
{% for article in articles %}
  <p>{{ forloop.counter }}. {{ article.title|upper }}</p>
{% empty %}
  <p>글이 없습니다.</p>
{% endfor %}

{% if user.is_authenticated %}안녕하세요, {{ user.username }}님{% endif %}
```

### 커스텀 템플릿 필터

내장 필터로 부족하면 앱 안에 `templatetags/` 폴더(이름 고정, `__init__.py` 필요)를 만들어 직접 등록한다. 예를 들어 M:N 장르 목록을 `액션, 드라마`처럼 한 줄로 보여 주는 필터다.

```python
# movies/templatetags/movie_filters.py
from django import template

register = template.Library()

@register.filter
def make_genre_list(genres):
    return ', '.join(genre.name for genre in genres)
```

```django
{% load movie_filters %}
<p>Genre: {{ movie.genres.all|make_genre_list }}</p>
```

- 모듈은 위치와 무관하게 **파일 이름으로** `{% load %}`되므로 다른 앱의 모듈과 이름이 겹치지 않게 짓는다.
- 처음 만든 뒤에는 개발 서버를 재시작해야 인식된다.

## 템플릿 상속

공통 레이아웃(헤더, 네비게이션, 푸터)을 `base.html` 하나에 두고, 자식 템플릿은 바뀌는 블록만 채운다.

```django
<!-- templates/base.html -->
<!DOCTYPE html>
<html>
<head>
  <title>{% block title %}My Site{% endblock title %}</title>
  {% block css %}{% endblock css %}
</head>
<body>
  {% block content %}{% endblock content %}
</body>
</html>
```

```django
<!-- articles/templates/articles/index.html -->
{% extends 'base.html' %}

{% block title %}행운로또{% endblock title %}

{% block content %}
  <h1>로또 번호입니다.</h1>
  <h2>{{ lotto }}</h2>
{% endblock content %}
```

- `{% extends %}`는 **템플릿의 첫 번째 태그**여야 하며 한 번만 쓸 수 있다.
- `{% block %}`은 자식이 덮어쓸(override) 수 있는 공간이다. 가독성을 위해 `endblock`에도 이름을 붙일 수 있다.
- 앱 밖(프로젝트 루트)의 `templates/`를 쓰려면 경로를 추가한다.

```python
# settings.py
TEMPLATES = [{
    ...,
    'DIRS': [BASE_DIR / 'templates'],
    'APP_DIRS': True,   # 각 앱의 templates/ 도 검색
}]
```

## form으로 데이터 주고받기

HTML `<form>`의 `action`(보낼 URL), `method`(GET/POST), `<input name="...">`으로 서버에 데이터를 보낸다. GET이면 `?message=hello` 같은 쿼리 스트링으로 전달된다.

```django
<!-- throw.html -->
<form action="{% url 'articles:catch' %}" method="GET">
  <label for="message">Throw</label>
  <input type="text" id="message" name="message">
  <input type="submit">
</form>
```

```python
# views.py
def catch(request):
    message = request.GET.get('message')
    return render(request, 'articles/catch.html', {'message': message})
```

> 데이터를 생성·수정하는 요청은 POST로 보내고, 템플릿 form 안에 `{% csrf_token %}`을 넣어야 한다. 입력 검증은 [Form·ModelForm](Backend/Django/forms-modelform)이 담당한다.

## Static files

이미지·CSS·JS처럼 요청에 따라 바뀌지 않고 **그대로 제공되는 파일**이다.

### 설정과 사용

1. `django.contrib.staticfiles`가 `INSTALLED_APPS`에 있는지 확인
2. `settings.py`에 `STATIC_URL` 정의
3. 앱의 `static/` 폴더에 파일 저장 (예: `articles/static/articles/sample.png`. 템플릿처럼 앱 이름 폴더를 한 번 더 둔다)
4. 템플릿에서 `{% load static %}` 후 `{% static '경로' %}`로 URL 생성

```django
{% extends 'base.html' %}
{% load static %}

{% block css %}
  <link rel="stylesheet" href="{% static 'style.css' %}">
{% endblock css %}

{% block content %}
  <img src="{% static 'articles/sample.png' %}" alt="sample">
{% endblock content %}
```

### 관련 설정

| 설정 | 의미 |
| --- | --- |
| `STATIC_URL` | 정적 파일을 참조할 때 쓰는 URL 접두사(예: `'static/'`). 실제 폴더가 아니라 URL로만 존재 |
| `STATICFILES_DIRS` | 앱의 `static/` 외에 추가로 탐색할 폴더 목록. 예: `[BASE_DIR / 'static']` |
| `STATIC_ROOT` | 배포 시 `python manage.py collectstatic`이 모든 정적 파일을 모아 둘 절대 경로. 운영에서는 Nginx 같은 웹 서버가 이 폴더를 직접 서빙 |

- 개발 중(`DEBUG = True`)에는 `runserver`가 앱의 `static/`과 `STATICFILES_DIRS`를 자동으로 서빙하며 `STATIC_ROOT`는 쓰이지 않는다.

## 핵심 정리

- `{{ }}` 출력, `|` 필터(부족하면 `templatetags`로 직접 등록), `{% %}` 태그, `{# #}` 주석.
- `base.html` + `{% extends %}` + `{% block %}`으로 중복 레이아웃을 제거한다.
- 정적 파일은 `{% load static %}` + `{% static %}`, 배포 땐 `collectstatic`.
