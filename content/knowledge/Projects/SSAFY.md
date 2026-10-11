---
title: "SSAFY 관통 프로젝트 회고"
concept: "SSAFY"
summary: "파이썬 데이터 수집부터 Django, DRF, Vue까지 '영화 추천 서비스'라는 하나의 주제로 10번의 프로젝트를 거치며 풀스택 웹 개발을 익힌 여정."
tags: ["project", "retrospective", "django", "vue", "python"]
source: til
---

SSAFY(삼성 청년 SW 아카데미) 1학기 동안 매주 진행한 **관통 프로젝트**는 "영화 정보·추천 서비스"라는 하나의 주제를 따라, 배운 기술을 차곡차곡 쌓아 올리는 구조였습니다. 첫 주에는 JSON 파일을 읽는 파이썬 스크립트였던 것이, 마지막 주에는 Vue SPA가 되었습니다. 이 노트는 10개의 프로젝트를 한눈에 정리한 지도이고, 세부 내용은 단계별 노트에 있습니다.

## 여정 한눈에 보기

| 단계 | 프로젝트 | 만든 것 | 핵심 기술 |
| --- | --- | --- | --- |
| 1. 데이터 | pjt01 | 영화 JSON에서 필요한 정보만 추출·가공 | 파일 입출력, `json`, `dict.get` |
| | pjt02 | TMDB API로 인기/추천 영화 목록 만들기 | `requests`, API, `sorted` + `lambda` |
| 2. 화면 | pjt03 | 영화 커뮤니티 페이지 레이아웃 | HTML/CSS, Bootstrap 그리드·컴포넌트 |
| 3. Django | pjt04 | TMDB 데이터를 보여주는 영화 메인·랜덤 추천 페이지 | Django URL–View–Template, DTL |
| | pjt05 | 영화 정보 CRUD 게시판 | Model, ORM, migration, admin |
| | pjt06 | ModelForm 기반 게시판 + 이미지 업로드 | ModelForm, 유효성 검사, Media 파일 |
| | pjt07 | 회원가입·로그인과 댓글이 있는 게시판 | Django Auth, 커스텀 User, 1:N 관계 |
| 4. API | pjt08 | 영화·배우·리뷰 REST API 서버 | DRF, Serializer, 1:N·M:N 관계 |
| 5. 추천·비동기 | pjt09 | 인기 영화 추천, 좋아요·팔로우 | 추천 로직, 커스텀 템플릿 필터, axios(AJAX) |
| 6. 프론트 | pjt10 | 영화 목록·랜덤 추천·보고 싶은 영화 SPA | Vue, Vuex, Vue Router, TMDB API |

## 단계별 노트

1. [데이터 수집·가공](SSAFY/data-collection.md) — pjt01~02
2. [Django 영화 서비스와 CRUD](SSAFY/django-web-service.md) — pjt03~06
3. [사용자 인증과 댓글](SSAFY/auth-and-comments.md) — pjt07
4. [DRF로 만든 REST API 서버](SSAFY/rest-api-server.md) — pjt08
5. [추천 알고리즘과 비동기 좋아요·팔로우](SSAFY/recommendation-and-ajax.md) — pjt09
6. [Vue + Vuex 영화 SPA](SSAFY/vue-spa.md) — pjt10

## 전체를 돌아보며

- **쌓이는 재미**: 파이썬 문법, HTML/CSS, Bootstrap, Django, JavaScript가 하나씩 더해지면서, 이전 프로젝트의 결과물이 다음 프로젝트의 재료가 되었다. 배운 것을 총동원해야 풍부한 결과물이 나온다는 걸 체감했다.
- **구조를 지키면 빨라진다**: Django의 URL → View → Template 순서(그리고 Model/Form)를 의식적으로 지키기 시작하면서 오류가 줄고 속도가 붙었다. 프로그래밍은 기계와의 대화라 절차가 중요하다.
- **데이터 관계가 설계의 핵심**: 1:N(댓글), M:N(배우·좋아요·팔로우)을 어떻게 모델링하느냐가 View와 API 구조를 결정했다.
- **페어 프로그래밍**: pjt07부터는 VS Code Live Share로 짝과 기능을 번갈아 구현했다. 설명하면서 코드를 쓰다 보니 내가 이해하지 못한 부분이 금방 드러났다.
- **진로 고민**: 백엔드는 어려울 거라 생각했는데 Django가 의외로 재미있었고, 프론트엔드도 즐거워 갈팡질팡했다. 결국 사용자와 가장 가까운 곳에서 일하고 싶다는 생각에 프론트엔드를 더 깊이 공부하기로 했다.
- **외우지 말고 이해하기**: 참고 코드를 따라 쓰다 `event.preventDefault()` 한 줄을 빠뜨려 한참 헤맨 경험 이후, 코드 한 줄 한 줄의 동작을 이해하려고 노력하게 되었다.
