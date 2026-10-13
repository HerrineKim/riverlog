---
title: "Django 시작하기와 MTV 패턴"
concept: "MTV"
summary: "Django 프로젝트와 앱을 만들고, Model·Template·View가 요청을 나눠 처리하는 MTV 구조를 이해한다."
tags: ["django", "python", "mtv", "backend"]
source: til
date: "2026-10-13"
---

Django 프로젝트는 여러 **앱(app)의** 묶음이고, 각 앱은 MTV 패턴에 따라 데이터(Model), 화면(Template), 처리 로직(View)을 나눠 갖는다.

## 설치와 프로젝트 생성

```bash
python -m venv venv && source venv/bin/activate   # 가상환경 권장
pip install django                 # 특정 버전: pip install "django==5.2.*" (LTS)
python -m django --version

django-admin startproject firstpjt .   # 현재 폴더에 프로젝트 생성
python manage.py runserver             # http://127.0.0.1:8000
```

- Django 6.x는 Python 3.12 이상이 필요하다. Python 3.10·3.11 환경이라면 5.2 LTS를 쓴다.
- 프로젝트 이름에 `django`, `test`, `class`처럼 Python·Django가 쓰는 이름이나 하이픈(`-`)은 쓸 수 없다.
- 개발 서버는 코드를 저장하면 자동으로 다시 로드된다. 단, 새 파일 추가 등 일부 변경은 재시작이 필요할 수 있다.
- 가상환경 폴더나 `db.sqlite3`, `__pycache__` 등은 `.gitignore`로 버전 관리에서 제외한다.

### 프로젝트 구조

| 파일 | 역할 |
| --- | --- |
| `manage.py` | 프로젝트와 상호작용하는 커맨드라인 유틸리티 |
| `settings.py` | 앱 등록, DB, 템플릿, 언어·시간대 등 모든 설정 |
| `urls.py` | URL과 view의 연결 |
| `wsgi.py` / `asgi.py` | 동기(WSGI) / 비동기(ASGI) 웹 서버와 Django를 연결하는 진입점 |
| `__init__.py` | 이 폴더를 Python 패키지로 인식시킴 |

## 앱 생성과 등록

```bash
python manage.py startapp articles   # 앱 이름은 보통 복수형
```

```python
# settings.py — 반드시 "앱 생성 → 등록" 순서
INSTALLED_APPS = [
    # 1. Local apps
    'articles',
    # 2. Third party apps
    # 3. Django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]
```

| 앱 파일 | 역할 |
| --- | --- |
| `models.py` | 데이터 구조(DB 테이블) 정의 |
| `views.py` | 요청을 받아 처리하고 응답을 반환하는 함수/클래스 |
| `admin.py` | 관리자 페이지 등록 |
| `apps.py` | 앱 정보 (거의 수정하지 않음) |
| `tests.py` | 테스트 코드 |

**프로젝트와 앱의 관계**: 프로젝트는 여러 앱의 집합이고, 앱은 보통 하나의 역할·기능 단위로 만든다. 잘 만든 앱은 다른 프로젝트에서 재사용할 수도 있다.

## MTV 패턴

![Django 기본 개발 흐름](/images/til/BACKEND/Django/00_django_intro.assets/image-20220302134411476.png)

| MTV | MVC 대응 | 역할 |
| --- | --- | --- |
| **Model** | Model | 데이터 구조 정의와 DB 기록 관리(추가·수정·삭제). [ORM](Backend/Django/orm-queryset) 덕분에 SQL 없이 Python으로 DB를 다룬다 |
| **Template** | View | 사용자에게 보여지는 화면의 구조·레이아웃 (HTML + [DTL](Backend/Django/templates-static)) |
| **View** | Controller | HTTP 요청을 받아 Model로 데이터를 다루고, Template에 응답 렌더링을 맡김 |

여기에 **URLconf**(`urls.py`)가 "어떤 URL 요청을 어떤 view로 보낼지"를 정한다. Django 1.x는 정규식 기반 `url()`을 썼지만 2.0부터 `path()`로 훨씬 간단해졌다.

| 하고 싶은 일 | 작업할 곳 |
| --- | --- |
| 데이터를 어떤 형태로 저장할지 | `models.py` |
| 어떤 주소로 들어오면 무엇을 할지 | `urls.py` |
| 데이터를 처리·가공할지 | `views.py` |
| 화면을 어떻게 보여줄지 | `templates/*.html` |

## 기본 설정

```python
# settings.py
LANGUAGE_CODE = 'ko-kr'   # 번역 언어 (USE_I18N = True 여야 적용)
TIME_ZONE = 'Asia/Seoul'  # 표시 시간대
USE_I18N = True           # 번역 시스템 사용
USE_TZ = True             # 시간대 인식(aware) datetime 사용. DB에는 UTC로 저장
```

> 과거 설정 파일에 있던 `USE_L10N`(지역화 형식)은 Django 4.0부터 기본값이 True가 되며 deprecated되었고 5.0에서 제거되었다. 더 이상 설정하지 않는다.

## 핵심 정리

- `startproject` → `startapp` → `INSTALLED_APPS` 등록 → `runserver`.
- Model = 데이터, Template = 화면, View = 처리, URLconf = 연결.
