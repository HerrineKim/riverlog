---
title: "Django User와 인증"
concept: "Django Auth"
summary: "django.contrib.auth의 User 모델로 회원가입·로그인을 구현하고, 템플릿에서 현재 사용자 정보를 쓰는 방법."
tags: ["django", "auth", "security", "python"]
source: til
---

Django는 `django.contrib.auth` 앱으로 사용자 모델, 비밀번호 해싱, 로그인 세션 관리를 기본 제공한다. 직접 구현하지 않고 이 기능을 그대로 쓰는 것이 안전하다.

## User 모델

- 필수 필드: `username`, `password`. 그 외 `email`, `first_name`, `is_staff`, `is_superuser` 등이 있다.
- 비밀번호는 평문이 아니라 **해시**로 저장되어야 하므로, 일반 `create()` 대신 전용 메서드를 쓴다.

```python
from django.contrib.auth.models import User

user = User.objects.create_user(username='john', password='johnpassword')  # 비밀번호 해싱 포함
user.set_password('new_password')  # 비밀번호 변경도 전용 메서드로
user.save()
```

> 권장: 새 프로젝트는 처음부터 `AbstractUser`를 상속한 커스텀 User 모델을 만들고 `settings.AUTH_USER_MODEL = 'accounts.User'`로 지정해 두는 것이 Django 공식 권장 사항이다. 프로젝트 중간에 바꾸기는 매우 어렵다. 다른 곳에서 User를 참조할 때는 `get_user_model()`이나 `settings.AUTH_USER_MODEL`을 쓴다.

## 인증과 로그인

```python
from django.contrib.auth import authenticate, login, logout

user = authenticate(request, username='john', password='secret')
# 비밀번호가 맞으면 User 객체, 틀리면 None

if user is not None:
    login(request, user)   # 세션에 로그인 상태 저장 (세션 쿠키 발급)
logout(request)            # 세션 삭제
```

내장 폼을 쓰면 회원가입·로그인 view가 간단해진다.

```python
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm

# 회원가입
form = UserCreationForm(request.POST)
if form.is_valid():
    user = form.save()

# 로그인
form = AuthenticationForm(request, request.POST)
if form.is_valid():
    login(request, form.get_user())
```

로그인한 사용자만 접근하게 하려면 view에 `@login_required` 데코레이터를 붙인다.

## 템플릿에서 사용자 정보 쓰기

`settings.py`의 `TEMPLATES` → `OPTIONS` → `context_processors`에 기본 등록된 프로세서 덕분에, view에서 넘기지 않아도 모든 템플릿에서 다음 변수를 쓸 수 있다.

| context processor | 템플릿 변수 |
| --- | --- |
| `django.template.context_processors.request` | `request` — 현재 `HttpRequest` |
| `django.contrib.auth.context_processors.auth` | `user` — 로그인한 User 또는 `AnonymousUser`, `perms` — 현재 사용자의 권한 |

```django
{% if user.is_authenticated %}
  <p>{{ user.username }}님 환영합니다.</p>
  <form action="{% url 'accounts:logout' %}" method="POST">{% csrf_token %}<button>로그아웃</button></form>
{% else %}
  <a href="{% url 'accounts:login' %}">로그인</a>
{% endif %}
```

## 핵심 정리

- 사용자 생성은 `create_user()`, 검증은 `authenticate()`, 세션 로그인은 `login()`.
- `UserCreationForm`·`AuthenticationForm`으로 회원가입·로그인을 빠르게 구현한다.
- 템플릿의 `user` 변수는 auth context processor가 자동 제공한다.

관련 노트: [[cookie-session|쿠키와 세션]], [[auth-and-comments|Django 사용자 인증과 댓글 게시판]]

참고: [Django 인증 문서](https://docs.djangoproject.com/en/stable/topics/auth/default/)
