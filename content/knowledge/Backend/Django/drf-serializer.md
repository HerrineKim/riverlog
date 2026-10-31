---
title: "DRF Serializer와 관계 표현"
concept: "DRF Serializer"
summary: "Django REST Framework의 Serializer로 모델을 JSON으로 바꾸고, 중첩 Serializer로 1:N·M:N 관계를 응답에 담으며, api_view로 CRUD를 구현하는 방법."
tags: ["django", "backend", "api", "rest", "database"]
source: mixed
date: "2026-10-12"
---

Django REST Framework(DRF)는 Django를 HTML 대신 **JSON을 응답하는 API 서버**로 만들어 주는 라이브러리다. 그 중심인 Serializer가 모델 인스턴스와 JSON 사이의 변환과 입력 검증을 맡는다. 화면은 Vue나 React 같은 프론트엔드가 그리고 서버는 데이터만 제공하는 구조의 출발점이다.

## Serializer가 하는 일

| 방향 | 사용법 | 용도 |
| --- | --- | --- |
| 모델 → JSON | `Serializer(instance).data` (여러 개면 `many=True`) | 조회 응답 |
| JSON → 모델 | `Serializer(data=request.data)` → `is_valid()` → `save()` | 생성 |
| 수정 | `Serializer(instance, data=request.data)` | instance와 data를 함께 넘기면 수정 |

`ModelSerializer`는 `Meta`에 모델과 필드만 지정하면 필드 정의와 검증을 자동으로 만든다. Django의 ModelForm과 같은 역할이다([Form과 ModelForm](Backend/Django/forms-modelform) 참고).

## 관계를 JSON으로: 중첩 Serializer

Movie : Actor = M : N, Movie : Review = 1 : N 구조에서 영화 상세에 배우와 리뷰를 함께 담으려면 관계 필드를 **다른 Serializer로 선언**한다.

```python
class ActorNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actor
        fields = ('name',)

class ReviewSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('title', 'content')

class MovieSerializer(serializers.ModelSerializer):
    actors = ActorNameSerializer(many=True, read_only=True)          # M:N 정참조
    review_set = ReviewSimpleSerializer(many=True, read_only=True)   # 1:N 역참조

    class Meta:
        model = Movie
        fields = '__all__'
```

반대로 리뷰에서 영화를 보여 줄 때는 영화가 **하나**이므로 `many`를 쓰지 않는다.

```python
class MovieTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ('title',)

class ReviewSerializer(serializers.ModelSerializer):
    movie = MovieTitleSerializer(read_only=True)   # 리뷰는 영화 하나에 속한다 → many=False

    class Meta:
        model = Review
        fields = ('id', 'movie', 'title', 'content')
```

- **필드 이름은 정참조·역참조 규칙을 따른다.** 정참조는 필드명(`actors`), 역참조는 `모델명_set`이나 `related_name`이다([모델 관계](Backend/Django/relationships) 참고).
- `many=True`는 "여러 개"일 때만 쓴다. 단일 객체에 붙이거나 존재하지 않는 역참조 이름을 선언하면 오류가 난다.
- `read_only=True`인 필드는 응답에만 나오고 입력 검증에서는 빠진다. 그래서 리뷰를 만들 때 `movie`는 URL에서 받은 객체를 `save(movie=movie)`로 직접 넘긴다.
- 같은 이름의 Serializer를 파일마다 다시 정의하면 import가 꼬인다. `MovieListSerializer`, `MovieTitleSerializer`처럼 **용도를 드러내는 이름**으로 구분한다.

## View: `@api_view`

```python
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def review_create(request, movie_pk):
    movie = get_object_or_404(Movie, pk=movie_pk)
    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid(raise_exception=True):     # 실패하면 400 응답을 자동 반환
        serializer.save(movie=movie)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
def review_detail(request, review_pk):
    review = get_object_or_404(Review, pk=review_pk)

    if request.method == 'GET':
        return Response(ReviewSerializer(review).data)

    if request.method == 'PUT':
        serializer = ReviewSerializer(review, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)

    review.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
```

- `@api_view`는 허용 메서드를 명시하고, 템플릿 대신 `Response`로 JSON을 돌려준다.
- `is_valid(raise_exception=True)`를 쓰면 검증 실패 처리를 따로 쓰지 않아도 된다.
- 상태 코드는 숫자 대신 `status.HTTP_201_CREATED`처럼 상수를 쓰면 의도가 드러난다. 어떤 상황에 어떤 코드를 쓸지는 [REST API 설계](Backend/Web-Basics/rest-api)의 표를 따른다.
- 목록 조회는 `get_list_or_404` 대신 `objects.all()`로 빈 배열을 돌려준다.

## 정리

- Serializer는 모델 ↔ JSON 변환과 검증을 맡고, 관계는 **중첩 Serializer**로 표현한다.
- 관계 필드 이름은 DB 관계를 먼저 정리해야 정할 수 있다. 외래키·M:N 설계가 API 응답 구조까지 결정한다.
- 생성·수정은 `is_valid(raise_exception=True)` → `save()`, 응답은 `Response`와 상태 코드 상수.

관련 노트: [[rest-api|REST API 설계]], [[relationships|Django 모델 관계 (1:1, 1:N, M:N)]], [[orm-queryset|Django ORM과 QuerySet]], [[forms-modelform|Django Form과 ModelForm]]
