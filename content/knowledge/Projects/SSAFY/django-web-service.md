---
title: "Django 영화 서비스와 CRUD 게시판"
concept: "Django CRUD"
summary: "Bootstrap 레이아웃에서 시작해 Django의 URL·View·Template, Model·ORM, ModelForm을 차례로 붙여 영화 정보 게시판을 완성한 과정."
tags: ["django", "python", "bootstrap", "crud", "project"]
source: til
---

데이터를 다룰 줄 알게 된 다음은 **화면**과 **서버**였습니다. 4주에 걸쳐 같은 영화 서비스를 조금씩 키워 나갔습니다.

| 프로젝트 | 추가된 것 |
| --- | --- |
| pjt03 | Bootstrap으로 영화 커뮤니티의 nav/footer, 홈, 커뮤니티 페이지 마크업 |
| pjt04 | Django 서버에서 TMDB API 결과를 받아 카드 목록과 랜덤 추천 페이지로 렌더링 |
| pjt05 | Model과 ORM으로 영화 정보를 DB에 저장하는 CRUD 게시판, admin 페이지 |
| pjt06 | 직접 만든 HTML 폼 대신 **ModelForm**으로 입력·검증, 포스터 이미지 업로드 |

## 1. Bootstrap 레이아웃 (pjt03)

- 공식 문서의 navbar·card·modal 컴포넌트를 가져와 고쳐 쓰면 대부분의 화면을 빠르게 만들 수 있다.
- 반응형 배치의 핵심은 **그리드 시스템**(`row`/`col-sm-6 col-md-4 …`)이다.
- 메뉴를 오른쪽으로 정렬하는 데서 막혔는데, 결국 flexbox 이해 부족이었다. Bootstrap 5에서는 `ms-auto`(margin-start: auto) 유틸리티 하나로 해결된다.

## 2. 프로젝트 세팅 순서 (pjt04~)

```bash
python -m venv venv
source venv/Scripts/activate      # Windows(Git Bash). macOS/Linux는 source venv/bin/activate
pip install django requests       # 또는 pip install -r requirements.txt

django-admin startproject config .
python manage.py startapp movies
python manage.py runserver
```

```python
# config/settings.py
INSTALLED_APPS = [
    'movies',                   # 앱 등록 (각 항목 뒤 쉼표 필수)
    'django.contrib.admin',
    # ...
]
LANGUAGE_CODE = 'ko-kr'
TIME_ZONE = 'Asia/Seoul'
TEMPLATES[0]['DIRS'] = [BASE_DIR / 'templates']   # 공용 base.html 위치
```

가상 환경을 활성화하지 않거나 VS Code에서 인터프리터를 venv로 선택하지 않으면 import 오류가 나므로, 세팅 순서를 체크리스트처럼 지키는 것이 중요했습니다. `.gitignore`에 `venv/`, `db.sqlite3` 등을 넣는 것도 잊지 말자.

## 3. URL → View → Template (pjt04)

```python
# movies/urls.py
from django.urls import path
from . import views

app_name = 'movies'
urlpatterns = [
    path('', views.index, name='index'),
    path('recommendation/', views.recommendation, name='recommendation'),
]
```

```python
# movies/views.py
import random
import requests
from django.conf import settings
from django.shortcuts import render

TMDB_URL = 'https://api.themoviedb.org/3/movie/278/recommendations'

def get_movies():
    params = {'api_key': settings.TMDB_API_KEY, 'region': 'KR', 'language': 'ko'}
    return requests.get(TMDB_URL, params=params).json().get('results', [])

def index(request):
    return render(request, 'movies/index.html', {'movies': get_movies()})

def recommendation(request):
    movie = random.choice(get_movies())
    return render(request, 'movies/recommendation.html', {'movie': movie})
```

같은 API 호출을 두 View에 복사해 두었던 것을 함수로 묶었습니다. 프로젝트 레벨 `urls.py`에서는 `include('movies.urls')`로 앱별 URL을 분리합니다.

```django
{% extends 'base.html' %}
{% block content %}
  <div class="row">
    {% for movie in movies %}
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card">
          <img src="https://image.tmdb.org/t/p/w500{{ movie.poster_path }}" class="card-img-top" alt="{{ movie.title }}">
          <div class="card-body">
            <h5 class="card-title">{{ movie.title }}</h5>
            <p class="card-text">{{ movie.overview|truncatechars:100 }}</p>
          </div>
        </div>
      </div>
    {% endfor %}
  </div>
{% endblock content %}
```

- `base.html`에 navbar·footer를 두고 `{% extends %}`·`{% block %}`으로 상속한다.
- DTL `{% for %}`로 카드를 반복 생성하면 영화 수만큼 일일이 쓸 필요가 없다.
- 포스터를 누르면 Bootstrap modal이 뜨게 하는 것까지는 성공했고, modal 안에 스틸컷 carousel을 넣는 것은 과제로 남았다.

## 4. Model과 CRUD (pjt05)

**ORM**(Object Relational Mapping) 덕분에 SQL 대신 파이썬 객체로 DB를 다룹니다. 모델을 정의하고 `makemigrations` → `migrate`로 테이블을 만든 뒤, admin에 등록해 데이터를 관리했습니다.

| 기능 | URL | 템플릿 | 처리 후 |
| --- | --- | --- | --- |
| 목록 | `/movies/` | index.html | — |
| 작성 폼 / 저장 | `new/`, `create/` | new.html / 없음 | detail로 redirect |
| 상세 | `<pk>/` | detail.html | — |
| 수정 폼 / 반영 | `<pk>/edit/`, `<pk>/update/` | edit.html / 없음 | detail로 redirect |
| 삭제 | `<pk>/delete/` | 없음 | index로 redirect |

create·update·delete는 **DB 작업만 하고 보여줄 화면이 없으므로** 템플릿이 필요 없고, 작업 후 다른 페이지로 보냅니다.

### render vs redirect

- `render(request, template, context)`: 템플릿에 context를 넣어 **HTML을 만들어 응답**한다.
- `redirect('app:name', ...)`: 브라우저에게 **다른 URL로 다시 요청하라고** 응답한다. context를 넘기지 않으며, URL name을 사용한다.
- POST로 데이터를 바꾼 뒤에는 redirect해야 새로고침 시 같은 요청이 다시 전송되지 않는다(PRG 패턴).

## 5. ModelForm (pjt06)

ModelForm은 모델 정의로부터 **폼 필드와 유효성 검사를 자동으로** 만들어 줍니다. 덕분에 new/create, edit/update 두 쌍의 View를 하나씩으로 합칠 수 있었습니다.

```python
# movies/forms.py
from django import forms
from .models import Movie

class MovieForm(forms.ModelForm):
    class Meta:
        model = Movie
        fields = '__all__'
```

```python
# movies/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_http_methods, require_POST
from .models import Movie
from .forms import MovieForm

@require_http_methods(['GET', 'POST'])
def create(request):
    if request.method == 'POST':
        form = MovieForm(request.POST, request.FILES)   # 이미지 파일은 request.FILES로 받는다
        if form.is_valid():
            movie = form.save()
            return redirect('movies:detail', movie.pk)
    else:
        form = MovieForm()
    # GET이거나, POST인데 검증에 실패한 경우 → 에러 메시지가 담긴 폼을 다시 보여준다
    return render(request, 'movies/create.html', {'form': form})

@require_http_methods(['GET', 'POST'])
def update(request, pk):
    movie = get_object_or_404(Movie, pk=pk)
    if request.method == 'POST':
        form = MovieForm(request.POST, request.FILES, instance=movie)
        if form.is_valid():
            form.save()
            return redirect('movies:detail', movie.pk)
    else:
        form = MovieForm(instance=movie)    # instance로 기존 값을 채워 보여준다
    return render(request, 'movies/update.html', {'movie': movie, 'form': form})

@require_POST
def delete(request, pk):
    movie = get_object_or_404(Movie, pk=pk)
    movie.delete()
    return redirect('movies:index')
```

```django
<form action="{% url 'movies:create' %}" method="POST" enctype="multipart/form-data">
  {% csrf_token %}
  {{ form.as_p }}
  <button type="submit" class="btn btn-primary">Submit</button>
</form>

{# detail.html: 업로드한 이미지 출력 #}
{% if movie.image %}
  <img src="{{ movie.image.url }}" class="card-img-top" alt="{{ movie.title }}">
{% endif %}
```

### 이미지 업로드 체크리스트

- 모델에 `ImageField`(Pillow 필요), `settings.py`에 `MEDIA_ROOT`, `MEDIA_URL`
- 폼 태그에 `enctype="multipart/form-data"`, View에서 `request.FILES` 전달
- 개발 서버에서 미디어 파일을 서빙하도록 프로젝트 `urls.py`에 추가

```python
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('movies/', include('movies.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

## 배운 점

- 처음엔 백엔드는 절대 못 할 줄 알았는데, Django는 정해진 구조를 따르면 정해진 결과가 나오는 "친절한" 프레임워크였다.
- 작은 디테일(쉼표 하나, `csrf_token` 누락, `request.FILES` 누락) 때문에 에러를 정말 많이 만났다. 프로젝트를 거듭하면서 에러를 만나도 차분히 읽고 해결하는 참을성이 생겼다.
- 배울수록 더 배울 것이 늘어난다. 웹 요청이 실제로 어떻게 오가는지 이해하려면 네트워크 등 CS 공부가 필요하다는 것을 느꼈다.

관련 개념 노트: [[getting-started-mtv|Django 시작하기와 MTV 패턴]], [[urls-views|Django URL과 View]], [[templates-static|Django Template과 Static 파일]], [[model-migration|Django Model과 Migration]], [[orm-queryset|Django ORM과 QuerySet]], [[forms-modelform|Django Form과 ModelForm]], [[Backend/Django/admin|Django Admin]]
