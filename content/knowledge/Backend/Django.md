---
title: "Django"
concept: "Django"
summary: "Model·Template·View 구조와 ORM·Admin·인증을 기본 제공하는 Python 웹 프레임워크."
tags: ["django", "python", "backend", "mtv"]
source: til
---

Django는 "배터리 포함(batteries included)"을 내세우는 Python 웹 프레임워크다. ORM, 템플릿 엔진, 폼 검증, 사용자 인증, 관리자 페이지가 기본으로 들어 있어 별도 라이브러리 없이도 완성된 웹 서비스를 빠르게 만들 수 있다. 구조는 MVC를 따르되 이름을 **MTV(Model-Template-View)**라고 부른다.

> 필기는 Django 3.2 LTS 기준이다. 이후 4.x·5.x·6.x에서도 핵심 개념은 같으며, 바뀐 설정은 각 노트에 보충했다. 2026년 10월 기준 최신 버전은 6.1, 장기 지원(LTS) 버전은 5.2다. ([Django 다운로드](https://www.djangoproject.com/download/))

## 노트 목록

| 순서 | 노트 | 내용 |
| --- | --- | --- |
| 1 | [시작하기와 MTV](Backend/Django/getting-started-mtv) | 프로젝트·앱 생성, 구조, MTV 패턴, 기본 설정 |
| 2 | [URL과 View](Backend/Django/urls-views) | 요청 흐름, 변수 라우팅, include, URL 이름과 namespace |
| 3 | [Template과 Static 파일](Backend/Django/templates-static) | DTL 문법, 템플릿 상속, form으로 데이터 받기, 정적 파일 |
| 4 | [Model과 Migration](Backend/Django/model-migration) | 모델 필드, makemigrations/migrate |
| 5 | [ORM과 QuerySet](Backend/Django/orm-queryset) | CRUD, 조건 조회, 정렬, aggregate·annotate |
| 6 | [모델 관계](Backend/Django/relationships) | 1:1, 1:N(ForeignKey), M:N(ManyToManyField) |
| 7 | [Form과 ModelForm](Backend/Django/forms-modelform) | 폼 렌더링, 유효성 검사, 위젯 |
| 8 | [User와 인증](Backend/Django/auth-user) | User 모델, 회원가입·로그인 |
| 9 | [Admin](Backend/Django/admin) | 관리자 페이지 등록과 커스터마이징 |
| 10 | [DRF Serializer](Backend/Django/drf-serializer) | JSON API 서버, 중첩 Serializer로 1:N·M:N 표현, api_view |

SQL 자체의 문법은 [SQL 기초](Backend/Database/sql-basics)에서, REST API 설계는 [REST API](Backend/Web-Basics/rest-api)에서 다룬다.
