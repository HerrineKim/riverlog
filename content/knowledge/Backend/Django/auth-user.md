---
title: "Django User와 인증"
concept: "Django Auth"
summary: "django.contrib.auth의 User 모델로 회원가입·로그인을 구현하고, 템플릿에서 현재 사용자 정보를 쓰는 방법."
tags: ["django", "auth", "security", "python"]
source: til
date: "2026-10-12"
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

> 권장: 새 프로젝트는 처음부터 `AbstractUser`를 상속한 커스텀 User 모델을 만들고 `settings.AUTH_USER_MODEL = 'accounts.User'`로 지정해 두는 것이 Django 공식 권장 사항이다. 프로젝트 중간에 바꾸기는 매우 어렵다. 다른 곳에서 User를 참조할 때는 모델의 외래키에는 `settings.AUTH_USER_MODEL`, 폼 등 그 밖의 코드에서는 `get_user_model()`을 쓴다. `AUTH_USER_MODEL`은 **첫 `migrate` 전에** 설정해야 한다.

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

로그인한 사용자만 접근하게 하려면 view에 `@login_required` 데코레이터를 붙인다. 비로그인 사용자는 로그인 페이지로 이동하며 `?next=/movies/create/`가 붙는다. 로그인 view에서 `redirect(request.GET.get('next') or 'movies:index')`로 원래 가려던 페이지로 돌려보낼 수 있고, 이때 로그인 템플릿의 `<form action="">`을 비워 두어야 쿼리스트링의 `next`가 유지된다.

### 계정 관리 도구

| 기능 | 사용할 도구 |
| --- | --- |
| 회원가입 (커스텀 User) | `UserCreationForm`을 상속하고 `Meta.model = get_user_model()`로 교체 |
| 회원정보 수정 | `UserChangeForm`을 상속하고 `fields`로 노출 필드 제한 |
| 비밀번호 변경 | `PasswordChangeForm` + `update_session_auth_hash()` (변경 후에도 로그아웃되지 않게 세션 해시 갱신) |
| 탈퇴 | `request.user.delete()` 후 `logout()` |

### 작성자만 수정·삭제

글과 댓글에 작성자(`ForeignKey`)를 두고, update·delete view에서 `request.user == obj.user`일 때만 처리한다. 템플릿에서 같은 조건으로 버튼을 숨기는 것은 편의일 뿐이고, **실제 보안은 view의 검사**다. 작성자 채우기는 [Form과 ModelForm](Backend/Django/forms-modelform)의 `commit=False`를 쓴다.

## 세션과 CSRF를 맡는 미들웨어

미들웨어는 요청이 view에 닿기 전과 응답이 나가기 전에 끼어드는 층이다. 요청은 `settings.MIDDLEWARE`에 등록된 순서대로 미들웨어를 지나 view에 닿고, 응답은 그 역순으로 나간다. 인증과 관련된 것은 셋이다.

| 미들웨어 | 하는 일 |
| --- | --- |
| `SessionMiddleware` | 세션 ID 쿠키로 세션을 찾아 `request.session`에 붙인다. 세션 데이터는 DB(`django_session` 테이블)에 있고 브라우저에는 ID만 있다 |
| `AuthenticationMiddleware` | 세션을 보고 `request.user`에 로그인한 User(없으면 `AnonymousUser`)를 붙인다 |
| `CsrfViewMiddleware` | POST 같은 변경 요청에 CSRF 토큰이 없거나 틀리면 `403 Forbidden`으로 막는다 |

POST 폼에는 `{% csrf_token %}`을 넣는다. 이 태그는 토큰을 담은 `<input type="hidden">`으로 렌더링된다. CSRF 공격 원리는 [[web-security|웹 보안]]에 있다.

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

관련 노트: [[cookie-session|쿠키와 세션]], [[relationships|Django 모델 관계]] — 작성자·댓글 같은 1:N 설계

참고: [Django 인증 문서](https://docs.djangoproject.com/en/stable/topics/auth/default/)
