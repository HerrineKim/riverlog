---
title: "Django URL과 View"
concept: "URLconf"
summary: "urls.py가 요청 주소를 view 함수로 연결하고, view가 render로 응답을 만드는 흐름과 URL 분리·이름·namespace."
tags: ["django", "python", "routing", "backend"]
source: til
---

Django의 요청 처리는 `urls.py → views.py → template` 순서로 흐른다. 장고 서버로 요청이 들어오면 URLconf가 경로를 보고 알맞은 view 함수로 넘기고, view는 데이터를 준비해 템플릿을 렌더링한 응답을 돌려준다.

## 기본 흐름

```python
# firstpjt/urls.py
from django.contrib import admin
from django.urls import path
from articles import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('index/', views.index),   # /index/ 로 오면 views.index 실행
]
```

```python
# articles/views.py
from django.shortcuts import render

def index(request):                      # 첫 번째 인자는 항상 request
    return render(request, 'index.html') # render(request, 템플릿 이름, context)
```

- 페이지가 요청되면 Django는 요청 정보를 담은 `HttpRequest` 객체를 만들어 view의 첫 번째 인자로 넘기고, view는 `HttpResponse`를 반환한다. `render()`는 템플릿을 렌더링해 `HttpResponse`를 만들어 주는 단축 함수다.
- 템플릿 파일은 기본적으로 **각 앱의 `templates/` 폴더**에서 찾는다.

## Variable routing

주소의 일부를 변수처럼 받아 동적으로 처리한다. 받은 값은 view 함수의 파라미터로 전달된다.

```python
# urls.py
path('hello/<str:name>/', views.hello),   # 타입 생략 시 str

# views.py
def hello(request, name):
    return render(request, 'hello.html', {'name': name})
```

path converter: `str`(기본), `int`, `slug`, `uuid`, `path`

## 앱별 URL 분리: `include()`

앱이 여러 개면 각 앱에 `urls.py`를 만들고 프로젝트 `urls.py`가 위임한다. `include()`를 만나면 그 지점까지 일치한 부분을 잘라내고 나머지 문자열을 해당 URLconf로 넘긴다.

```python
# firstpjt/urls.py
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('articles/', include('articles.urls')),
    path('pages/', include('pages.urls')),
]
```

```python
# articles/urls.py
from django.urls import path
from . import views          # 명시적 상대 경로 import 권장

app_name = 'articles'        # URL namespace
urlpatterns = [
    path('index/', views.index, name='index'),
    path('hello/<str:name>/', views.hello, name='hello'),
]
```

> 앱의 `urls.py`에 `urlpatterns`가 없으면(빈 리스트라도 있어야 함) 에러가 난다.

## URL 이름과 `{% url %}` 태그

`name`을 붙이면 템플릿이나 view에서 주소를 하드코딩하지 않고 이름으로 참조할 수 있다(DRY). 주소가 바뀌어도 `urls.py`만 고치면 된다.

```django
<a href="{% url 'articles:index' %}">목록</a>
<a href="{% url 'articles:hello' 'django' %}">인사</a>
```

```python
from django.shortcuts import redirect
return redirect('articles:index')
```

## Namespace 두 가지

앱이 두 개 이상이면 같은 이름(`index`)이 충돌한다.

| 문제 | 해결 |
| --- | --- |
| `{% url 'index' %}`가 엉뚱한 앱의 주소로 연결됨 | **URL namespace**: 앱 `urls.py`에 `app_name`을 지정하고 `'앱이름:URL이름'`으로 참조 |
| `pages`의 `index.html`을 렌더링했는데 `articles`의 `index.html`이 나옴 | **Template namespace**: Django는 `INSTALLED_APPS` 순서대로 모든 앱의 `templates/`를 합쳐 검색하므로, `app/templates/app/index.html` 구조로 폴더를 한 단계 더 만들고 `render(request, 'pages/index.html')`로 지정 |

## render vs redirect

| | `render(request, template, context)` | `redirect('app:name', ...)` |
| --- | --- | --- |
| 응답 | 템플릿에 context를 넣어 **HTML을 만들어 응답** | 브라우저에게 **다른 URL로 다시 요청**하라고 응답 |
| context | 넘긴다 | 넘기지 않는다 (URL name으로 이동) |

- 생성·수정·삭제처럼 DB만 바꾸는 view는 보여 줄 화면이 없으므로 템플릿 없이 redirect로 끝낸다.
- POST로 데이터를 바꾼 뒤에는 redirect해야 새로고침해도 같은 요청이 다시 전송되지 않는다(PRG 패턴: Post → Redirect → Get).

## 허용 메서드 제한

데코레이터로 허용하는 HTTP 메서드를 명시하면 의도하지 않은 요청을 막을 수 있다. 허용되지 않은 메서드는 405 응답이 된다.

```python
from django.views.decorators.http import require_http_methods, require_POST, require_safe

@require_http_methods(['GET', 'POST'])   # 폼을 보여 주고(GET) 처리하는(POST) view
def create(request): ...

@require_POST                            # 삭제처럼 데이터를 바꾸는 view
def delete(request, pk): ...

@require_safe                            # 조회 전용(GET, HEAD)
def index(request): ...
```

## 핵심 정리

- URL → view → template. view의 첫 인자는 `request`, 반환은 `render()`/`redirect()`.
- 앱별 `urls.py` + `include()`로 분리하고, `app_name`과 `name`으로 주소를 이름 참조한다.
- 템플릿은 `app/templates/app/` 구조로 이름 공간을 만든다.
- DB를 바꾼 뒤에는 `redirect`(PRG), 허용 메서드는 `require_*` 데코레이터로 제한한다.
