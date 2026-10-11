---
title: "Django 사용자 인증과 댓글 게시판"
concept: "Django Auth"
summary: "커스텀 User 모델과 Django 인증 폼으로 회원 기능을 만들고, 작성자 권한과 1:N 댓글을 갖춘 영화 게시판을 구현한 페어 프로젝트."
tags: ["django", "authentication", "database", "project"]
source: til
---

pjt07의 주제는 **"사용자 인증 기반 관계형 DB 설계"** 였습니다. 회원가입·로그인한 사용자만 영화 게시글과 댓글을 쓸 수 있고, **자기 글·댓글만** 수정·삭제할 수 있는 게시판을 만들었습니다. 이 프로젝트부터 VS Code Live Share로 짝과 기능을 번갈아 구현하는 페어 프로그래밍을 했습니다.

![게시판 메인 화면](/images/til/My-Projects/SSAFY/pjt07/README.assets/image-20220515130307157.png)

## 앱 구성

| 앱 | 기능 |
| --- | --- |
| `accounts` | 회원가입, 로그인/로그아웃, 회원정보 수정, 비밀번호 변경, 탈퇴 |
| `movies` | 게시글 CRUD, 댓글 작성/삭제 |

## 모델: User – Movie – Comment

```python
# accounts/models.py
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    pass          # 지금은 기본 User와 같지만, 나중에 필드를 추가할 수 있도록 처음부터 교체
```

```python
# settings.py
AUTH_USER_MODEL = 'accounts.User'   # 첫 migrate 전에 설정해야 한다
```

```python
# movies/models.py
from django.db import models
from django.conf import settings

class Movie(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=20)
    description = models.TextField()

class Comment(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.CharField(max_length=200)
```

- User 1 : N Movie, User 1 : N Comment, Movie 1 : N Comment
- 모델에서 User를 참조할 때는 `settings.AUTH_USER_MODEL`, 그 밖의 코드(폼 등)에서는 `get_user_model()`을 쓴다.
- 게시글의 댓글은 **역참조** `movie.comment_set.all()`로 가져온다.

## 인증 View의 핵심

Django가 제공하는 폼과 함수를 조합하면 인증 기능 대부분을 직접 구현하지 않아도 됩니다.

| 기능 | 사용한 도구 |
| --- | --- |
| 회원가입 | `UserCreationForm`을 상속한 `CustomUserCreationForm` (모델을 커스텀 User로) |
| 로그인 | `AuthenticationForm` + `login()` |
| 로그아웃 | `logout()` (POST로만) |
| 회원정보 수정 | `UserChangeForm`을 상속, `fields = ('first_name', 'last_name')`로 노출 필드 제한 |
| 비밀번호 변경 | `PasswordChangeForm` + `update_session_auth_hash()` (변경 후 로그아웃되지 않도록) |
| 탈퇴 | `request.user.delete()` 후 `logout()` |

```python
from django.contrib.auth import login as auth_login
from django.contrib.auth.forms import AuthenticationForm

@require_http_methods(['GET', 'POST'])
def login(request):
    if request.user.is_authenticated:
        return redirect('movies:index')    # return을 빠뜨리면 아무 효과가 없다 (실제로 했던 실수)

    if request.method == 'POST':
        form = AuthenticationForm(request, request.POST)
        if form.is_valid():
            auth_login(request, form.get_user())
            return redirect(request.GET.get('next') or 'movies:index')
    else:
        form = AuthenticationForm()
    return render(request, 'accounts/login.html', {'form': form})
```

`@login_required`가 로그인 페이지로 보낼 때 `?next=/movies/create/`를 붙여 주므로, 로그인 후 원래 가려던 페이지로 돌려보낼 수 있습니다. 이때 로그인 템플릿의 `<form action="">`을 비워 두어야 쿼리스트링의 `next`가 유지됩니다.

## 작성자 권한과 댓글

```python
@login_required
@require_http_methods(['GET', 'POST'])
def create(request):
    if request.method == 'POST':
        form = MovieForm(request.POST)
        if form.is_valid():
            movie = form.save(commit=False)   # DB 저장 전에
            movie.user = request.user         # 작성자를 채워 넣고
            movie.save()                      # 저장
            return redirect('movies:detail', movie.pk)
    else:
        form = MovieForm()
    return render(request, 'movies/create.html', {'form': form})

@require_POST
def comment_create(request, pk):
    if not request.user.is_authenticated:
        return redirect('accounts:login')
    movie = get_object_or_404(Movie, pk=pk)
    comment_form = CommentForm(request.POST)
    if comment_form.is_valid():
        comment = comment_form.save(commit=False)
        comment.movie = movie
        comment.user = request.user
        comment.save()
    return redirect('movies:detail', movie.pk)
```

- 폼에는 사용자가 입력할 필드(`title`, `description` / `content`)만 두고, `user`·`movie` 같은 외래키는 `commit=False`로 받아 View에서 채운다.
- update·delete는 `request.user == movie.user`일 때만 수행한다. 템플릿에서도 같은 조건으로 버튼을 숨기지만, **진짜 보안은 View에서의 검사**다.
- `@require_POST`, `@require_safe`(GET/HEAD) 데코레이터로 허용 메서드를 명시해 의도치 않은 요청을 막았다.

```django
{% if request.user == movie.user %}
  <a href="{% url 'movies:update' movie.pk %}" class="btn btn-warning btn-sm">UPDATE</a>
  <form action="{% url 'movies:delete' movie.pk %}" method="POST">
    {% csrf_token %}
    <input type="submit" value="DELETE">
  </form>
{% endif %}

{% if request.user.is_authenticated %}
  <form action="{% url 'movies:comment_create' movie.pk %}" method="POST">
    {% csrf_token %}
    {{ comment_form }}
    <input type="submit">
  </form>
{% else %}
  <a href="{% url 'accounts:login' %}">[댓글을 작성하려면 로그인하세요.]</a>
{% endif %}
```

## 배운 점

- 앱이 두 개라는 게 처음엔 부담이었지만, 앱은 기능별 의미상의 구분일 뿐이다. 결국 할 일은 **URL 작성 → View·Form 작성 → Template에서 사용** 의 반복이었다.
- URL–View–Template 순서를 지키며 개발하니 오류가 줄고 속도가 빨라졌다.
- 페어 프로그래밍에서 기능을 번갈아 구현하다 보니, 상대가 쓴 코드를 읽고 이어 쓰는 능력도 함께 늘었다.
