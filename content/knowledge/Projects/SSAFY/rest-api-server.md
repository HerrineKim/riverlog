---
title: "DRF로 만든 영화 REST API 서버"
concept: "REST API"
summary: "Django REST Framework로 영화·배우·리뷰 데이터를 JSON으로 제공하고, 1:N·M:N 관계를 Serializer로 표현한 API 서버 프로젝트."
tags: ["django", "drf", "rest-api", "database", "project"]
source: til
---

pjt08에서는 HTML을 그리던 Django를 **JSON을 응답하는 API 서버**로 바꿨습니다. 화면은 나중에 Vue 같은 프론트엔드가 맡고, 서버는 데이터만 제공하는 구조로 가는 첫 단계였습니다.

## 요구사항과 ERD

- 영화·배우·리뷰 데이터 조회
- 리뷰 생성·수정·삭제
- 관계: **Movie : Actor = M : N**, **Movie : Review = 1 : N**

![ERD](/images/til/My-Projects/SSAFY/pjt08/README.assets/image-20220422165535202.png)

## 모델

```python
from django.db import models

class Actor(models.Model):
    name = models.CharField(max_length=100)

class Movie(models.Model):
    title = models.CharField(max_length=100)
    overview = models.TextField()
    release_date = models.DateTimeField()
    poster_path = models.TextField()
    actors = models.ManyToManyField(Actor, related_name='movies')   # M:N, 역참조는 actor.movies

class Review(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)       # 1:N, 역참조는 movie.review_set
    title = models.CharField(max_length=100)
    content = models.TextField()
```

## API 설계

앱의 `urls.py`에 아래 경로를 정의하고, 프로젝트 `urls.py`에서 `path('api/v1/', include('movies.urls'))`로 묶었습니다.

| Method | URL | 설명 |
| --- | --- | --- |
| GET | `/api/v1/movies/` | 영화 목록 |
| GET | `/api/v1/movies/<movie_pk>/` | 영화 상세 (배우·리뷰 포함) |
| POST | `/api/v1/movies/<movie_pk>/reviews/` | 리뷰 작성 |
| GET | `/api/v1/reviews/` | 리뷰 목록 |
| GET / PUT / DELETE | `/api/v1/reviews/<review_pk>/` | 리뷰 상세·수정·삭제 |
| GET | `/api/v1/actors/`, `/api/v1/actors/<actor_pk>/` | 배우 목록·상세 (출연작 포함) |

## Serializer: 관계를 JSON으로

Serializer는 모델 인스턴스 ↔ JSON 변환과 입력 검증을 담당합니다. 관계 데이터를 원하는 모양으로 보여주려면 **중첩 Serializer**를 씁니다.

```python
# serializers/movie.py
from rest_framework import serializers
from ..models import Movie, Actor, Review

class ActorNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actor
        fields = ('name',)

class ReviewSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('title', 'content')

class MovieListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ('title', 'overview')

class MovieSerializer(serializers.ModelSerializer):
    actors = ActorNameSerializer(many=True, read_only=True)          # M:N 정참조
    review_set = ReviewSimpleSerializer(many=True, read_only=True)   # 1:N 역참조
    class Meta:
        model = Movie
        fields = '__all__'
```

```python
# serializers/review.py
class MovieTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ('title',)

class ReviewListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('title', 'content')

class ReviewSerializer(serializers.ModelSerializer):
    movie = MovieTitleSerializer(read_only=True)   # 리뷰는 영화 하나에 속하므로 many=False
    class Meta:
        model = Review
        fields = ('id', 'movie', 'title', 'content')
```

- 리뷰 하나는 영화 **하나**를 참조하므로 `movie = MovieTitleSerializer(read_only=True)` 처럼 `many` 없이 쓴다. (원래 코드에는 Review에 없는 `movies` 필드를 `many=True`로 선언한 실수가 있었다.)
- 같은 이름의 Serializer(`MovieSerializer`)를 파일마다 다시 정의했더니 import가 꼬였다. **용도를 드러내는 이름**(`MovieTitleSerializer` 등)으로 구분하는 것이 안전하다.
- `read_only=True` 필드는 응답에만 나오고 입력 검증에서는 제외된다. 리뷰 작성 시 `movie`는 URL에서 받아 `save(movie=movie)`로 넣는다.

## View

```python
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Movie, Review
from .serializers.movie import MovieListSerializer, MovieSerializer
from .serializers.review import ReviewListSerializer, ReviewSerializer

@api_view(['GET'])
def movie_list(request):
    movies = Movie.objects.all()
    serializer = MovieListSerializer(movies, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def review_create(request, movie_pk):
    movie = get_object_or_404(Movie, pk=movie_pk)
    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid(raise_exception=True):     # 실패 시 자동으로 400 응답
        serializer.save(movie=movie)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
def review_detail(request, review_pk):
    review = get_object_or_404(Review, pk=review_pk)

    if request.method == 'GET':
        return Response(ReviewSerializer(review).data)

    if request.method == 'PUT':
        serializer = ReviewSerializer(review, data=request.data)   # instance + data → 수정
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)

    review.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
```

- 목록 조회에 `get_list_or_404`를 쓰면 데이터가 0건일 때 404가 된다. 빈 목록은 정상 상태이므로 `objects.all()`로 빈 배열(`[]`)을 돌려주는 편이 REST 관례에 맞다.
- **204 No Content**는 본문이 없는 응답이다. 삭제 메시지를 보내고 싶다면 `200 OK`와 함께 보내야 한다.
- 상태 코드는 숫자 대신 `status.HTTP_201_CREATED`처럼 상수를 쓰면 의도가 드러난다.

## 배운 점

- 외래키, 1:N, M:N 같은 **DB 관계를 처음에 잘 정립하는 것**이 API 응답 구조까지 결정한다는 것을 제대로 느꼈다.
- 정참조(`movie.actors`)와 역참조(`actor.movies` — `related_name`, `movie.review_set`)를 구분해야 Serializer 필드 이름을 맞게 쓸 수 있다.
