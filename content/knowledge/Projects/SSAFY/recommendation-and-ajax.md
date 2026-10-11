---
title: "영화 추천 알고리즘과 비동기 좋아요·팔로우"
concept: "Recommendation"
summary: "인기도 기반 영화 추천, 커스텀 템플릿 필터, 그리고 axios로 페이지 새로고침 없이 좋아요·팔로우를 처리한 Django 프로젝트."
tags: ["django", "javascript", "ajax", "recommendation", "project"]
source: til
---

pjt09의 주제는 **"알고리즘을 적용한 서버 구성"** 이었습니다. 세 개의 앱을 하나의 서비스로 묶고, 처음으로 JavaScript 비동기 요청(AJAX)으로 페이지의 일부만 갱신하는 경험을 했습니다. 이번에도 짝과 Live Share로 기능을 번갈아 구현했습니다.

| 앱 | 기능 |
| --- | --- |
| `movies` | 영화 목록·상세, 추천 영화 페이지 |
| `community` | 리뷰 게시판 CRUD + **좋아요** |
| `accounts` | 회원 기능 + **프로필, 팔로우** |

![영화 목록 화면](/images/til/My-Projects/SSAFY/pjt09/README.assets/image-20220515150123701.png)

## 1. 추천 알고리즘: 인기도 기반

TMDB에서 받아 둔 영화 데이터(fixture)의 `popularity` 값을 기준으로 내림차순 정렬한 뒤 상위 10개를 추천합니다.

```python
@require_safe
def recommended(request):
    popular_movies = Movie.objects.order_by('-popularity')[:10]
    return render(request, 'movies/recommended.html', {'popular_movies': popular_movies})
```

가장 단순한 **인기도 기반(popularity-based) 추천**입니다. 모든 사용자에게 같은 결과를 보여 준다는 한계가 있어서, 다음 단계로는 사용자가 좋아요한 영화의 장르나 팔로우한 사람의 취향을 반영하는 개인화 추천을 생각해 볼 수 있습니다.

## 2. 커스텀 템플릿 필터

장르(M:N) 목록을 템플릿에서 `액션, 드라마, 스릴러`처럼 한 줄로 보여주고 싶었는데, DTL만으로는 마지막 쉼표 처리 등이 번거로웠습니다. 그래서 **templatetags**로 직접 필터를 만들었습니다.

```python
# movies/templatetags/movie_filters.py   (폴더 이름 templatetags는 고정, __init__.py 필요)
from django import template

register = template.Library()

@register.filter
def make_genre_list(genres):
    return ', '.join(genre.name for genre in genres)
```

```django
{% load movie_filters %}
<img src="https://image.tmdb.org/t/p/w500{{ movie.poster_path }}" class="card-img-top" alt="{{ movie.title }}">
<p>Genre: {{ movie.genres.all|make_genre_list }}</p>
<p>Popularity: {{ movie.popularity }}</p>
```

- 모듈은 위치와 상관없이 **파일 이름으로 `{% load %}`** 되므로, 다른 앱의 모듈과 이름이 겹치지 않게 짓는다.
- 등록 후에는 개발 서버를 재시작해야 인식된다.

## 3. 좋아요: JsonResponse + axios

이전까지는 버튼을 누르면 폼이 제출되고 페이지 전체가 새로고침되었습니다. 이번에는 **JavaScript가 비동기 요청을 보내고, 서버는 JSON만 돌려주고, 바뀐 부분만 DOM에서 고치는** 방식으로 바꿨습니다.

```python
# community/models.py
class Review(models.Model):
    # ...
    like_users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='like_reviews')
```

```python
# community/views.py
from django.http import JsonResponse, HttpResponse

@require_POST
def like(request, review_pk):
    if not request.user.is_authenticated:
        return HttpResponse(status=401)        # JS에서 401을 받아 로그인 페이지로 보낸다

    review = get_object_or_404(Review, pk=review_pk)
    if review.like_users.filter(pk=request.user.pk).exists():
        review.like_users.remove(request.user)
        is_liked = False
    else:
        review.like_users.add(request.user)
        is_liked = True

    return JsonResponse({
        'is_liked': is_liked,
        'like_count': review.like_users.count(),
    })
```

`JsonResponse`는 `HttpResponse`의 하위 클래스로, 딕셔너리를 JSON 응답으로 만들어 줍니다.

```django
<form class="like-form" data-review-id="{{ review.pk }}">
  {% csrf_token %}
  <button type="submit" id="like-{{ review.pk }}">
    {% if request.user in review.like_users.all %}좋아요 취소{% else %}좋아요{% endif %}
  </button>
</form>
<p id="like-count-{{ review.pk }}">{{ review.like_users.count }}명이 이 글을 좋아합니다.</p>
```

```javascript
const forms = document.querySelectorAll('.like-form')
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value

forms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault()                        // 폼의 기본 제출(새로고침)을 막는다
    const reviewId = event.target.dataset.reviewId

    axios({
      method: 'post',
      url: `/community/${reviewId}/like/`,
      headers: { 'X-CSRFToken': csrftoken },      // Django CSRF 검사 통과
    })
      .then((response) => {
        const { is_liked, like_count } = response.data
        document.querySelector(`#like-${reviewId}`).innerText = is_liked ? '좋아요 취소' : '좋아요'
        document.querySelector(`#like-count-${reviewId}`).innerText = `${like_count}명이 이 글을 좋아합니다.`
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/accounts/login/'
        } else {
          console.error(error)
        }
      })
  })
})
```

### 원래 코드에서 고친 점

- 폼에 `click` 이벤트를 걸면 폼 안 어디를 클릭해도 요청이 나가므로, **`submit` 이벤트**에 거는 것이 맞다. 그러면 `event.target`도 항상 `data-review-id`를 가진 form이 된다.
- 비로그인 시 서버가 `redirect`를 돌려주면 axios는 로그인 페이지 HTML을 성공 응답으로 받아 버린다. JS에서 401을 처리하려면 서버도 **401 상태 코드**를 돌려줘야 한다.
- `<input ...></input>`은 잘못된 HTML이다(`input`은 닫는 태그가 없는 빈 요소). 텍스트를 바꿀 버튼이라면 `<button>`이 자연스럽다.

## 4. 팔로우와 프로필

```python
# accounts/models.py
class User(AbstractUser):
    followings = models.ManyToManyField('self', symmetrical=False, related_name='followers')
```

자기 자신과의 M:N 관계이며, 팔로우는 일방향이므로 `symmetrical=False`가 필요합니다.

```python
@require_POST
def follow(request, user_pk):
    if not request.user.is_authenticated:
        return HttpResponse(status=401)
    person = get_object_or_404(get_user_model(), pk=user_pk)
    if person == request.user:                     # 자기 자신은 팔로우할 수 없다
        return HttpResponse(status=400)

    if person.followers.filter(pk=request.user.pk).exists():
        person.followers.remove(request.user)
        is_followed = False
    else:
        person.followers.add(request.user)
        is_followed = True

    return JsonResponse({
        'is_followed': is_followed,
        'followers_count': person.followers.count(),
        'followings_count': person.followings.count(),
    })
```

```javascript
const { is_followed, followers_count, followings_count } = response.data
followButton.innerText = is_followed ? '언팔로우' : '팔로우'
document.querySelector('#followers-count').innerText = followers_count
document.querySelector('#followings-count').innerText = followings_count
```

> 원래 코드는 서버가 `is_follow`를 보내는데 JS에서 `isFollow`로 구조 분해해 버튼 문구가 바뀌지 않는 버그가 있었다. **서버 응답의 키 이름과 클라이언트의 변수 이름을 정확히 맞추는 것**, 키 이름 규칙(snake_case로 통일 등)을 하나로 정하는 것이 중요하다.

## 배운 점

- 참고 코드에서 `event.preventDefault()` 한 줄을 빠뜨려 한참 헤맸다. 코드를 외워서 쓰면 이런 일이 생긴다. 각 줄이 **왜** 필요한지 알고 써야 한다.
- 새로고침 없이 일부만 바뀌는 화면을 직접 만들어 보니, 평소 쓰는 웹사이트들이 어떻게 동작하는지 감이 오기 시작했다. 이 경험이 다음 프로젝트인 [Vue SPA](vue-spa.md)로 이어졌다.
