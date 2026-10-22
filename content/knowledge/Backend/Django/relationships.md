---
title: "Django 모델 관계 (1:1, 1:N, M:N)"
concept: "Model Relationship"
summary: "OneToOneField, ForeignKey, ManyToManyField로 모델 간 1:1, 1:N, M:N 관계를 표현하고 역참조하는 방법."
tags: ["django", "database", "orm", "modeling"]
source: til
date: "2026-10-13"
---

관계형 DB의 힘은 테이블 사이의 관계에서 나온다. Django는 세 가지 필드로 관계를 표현하고, 반대 방향 조회(역참조)도 자동으로 만들어 준다.

| 관계 | 필드 | 예 |
| --- | --- | --- |
| 1:1 | `OneToOneField` | 자동차 ↔ 엔진, User ↔ Profile |
| 1:N | `ForeignKey` | 소유자 1 ↔ 자동차 N, 게시글 1 ↔ 댓글 N |
| M:N | `ManyToManyField` | 책 ↔ 저자, 의사 ↔ 환자 |

## 1:1: `OneToOneField`

```python
class Engine(models.Model):
    name = models.CharField(max_length=30)

class Car(models.Model):
    name = models.CharField(max_length=30)
    engine = models.OneToOneField(Engine, on_delete=models.CASCADE)
```

`OneToOneField(Engine)`은 DB 구조상 `ForeignKey(Engine, unique=True)`와 같다. 차이는 **역참조**에서 나타난다.

- `OneToOneField`: `engine.car` → 객체 하나
- `ForeignKey(unique=True)`: `engine.car_set.all()` → (항상 0~1개인) QuerySet

## 1:N: `ForeignKey`

**N쪽 모델에** 1쪽 모델을 가리키는 외래 키를 둔다.

```python
class Owner(models.Model):
    name = models.CharField(max_length=30)

class Car(models.Model):
    name = models.CharField(max_length=30)
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE)
```

```python
car.owner                 # 정참조: 차의 소유자
owner.car_set.all()       # 역참조: 소유자의 모든 차 (모델명_set)
```

- DB에는 `owner_id` 열이 생긴다.
- `on_delete`: 참조 대상이 삭제될 때의 동작. `CASCADE`(함께 삭제), `PROTECT`(삭제 막기), `SET_NULL`(null로, `null=True` 필요) 등.
- `related_name='cars'`를 주면 역참조 이름을 `owner.cars.all()`로 바꿀 수 있다.

## M:N: `ManyToManyField`

M:N은 두 테이블만으로는 표현할 수 없고, 양쪽 id를 짝지어 저장하는 **중개 테이블**이 필요하다.

| 방식 | 언제 | 조회 방식 |
| --- | --- | --- |
| 중개 모델을 직접 만들기 (FK 두 개) | 쓰지 않는다. 아래 `through`가 같은 일을 더 편하게 한다 | `BookAuthor.objects.filter(book=b)`처럼 중개 모델을 거쳐야 해 번거롭다 |
| `ManyToManyField` | 양쪽 id만 있으면 될 때. 중개 테이블(`앱_patient_doctors`)을 Django가 자동 생성 | `patient.doctors.all()`, 역참조 `doctor.patients.all()` |
| `ManyToManyField(through=...)` | 예약 일시처럼 관계 자체에 데이터가 필요할 때 | 위와 같고, 추가 필드는 중개 모델로 조회 |

```python
class Doctor(models.Model):
    name = models.CharField(max_length=10)

class Patient(models.Model):
    name = models.CharField(max_length=10)
    doctors = models.ManyToManyField(Doctor, related_name='patients')

patient.doctors.add(doctor)     # 관계 추가
patient.doctors.remove(doctor)  # 관계 제거
```

관계에 데이터가 붙으면 중개 모델을 만들고 `through`로 지정한다.

```python
class Patient(models.Model):
    doctors = models.ManyToManyField(Doctor, through='Reservation', related_name='patients')

class Reservation(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    reserved_at = models.DateTimeField()
```

> 관계 필드의 첫 인자에는 모델 클래스(`Doctor`)나 문자열(`'Doctor'`, 다른 앱이면 `'app.Doctor'`)을 넘긴다. 아직 정의되지 않은 모델을 가리킬 때는 문자열을 쓴다. 소문자 `doctor`처럼 없는 이름을 쓰면 `NameError`가 난다.

### 자기 자신과의 M:N (팔로우)

같은 모델끼리 맺는 M:N은 `'self'`를 쓴다. 팔로우처럼 **한 방향** 관계라면 `symmetrical=False`가 필요하다. 기본값 `True`에서는 A가 B를 추가하면 B도 A를 자동으로 추가한다.

```python
class User(AbstractUser):
    followings = models.ManyToManyField('self', symmetrical=False, related_name='followers')
```

### 토글 패턴 (좋아요·팔로우)

이미 관계가 있으면 `remove`, 없으면 `add`로 뒤집는다. 존재 여부는 `filter(...).exists()`로 확인한다.

```python
if review.like_users.filter(pk=request.user.pk).exists():
    review.like_users.remove(request.user)
else:
    review.like_users.add(request.user)
```

### `related_name`이 필요한 경우

같은 두 모델 사이에 관계 필드가 둘 이상이면(예: User와 Article 사이 `author` FK와 `like_users` M2M) 기본 역참조 이름 `article_set`이 충돌하므로 `related_name`을 반드시 지정해야 한다.

## 핵심 정리

- 1:N은 N쪽에 `ForeignKey`, 역참조는 `모델명_set` 또는 `related_name`.
- M:N은 `ManyToManyField`. 관계에 추가 데이터가 필요하면 `through` 중개 모델.
- `on_delete`로 참조 무결성 정책을 정한다.

관련 노트: [[normalization|정규화와 반정규화]], [[database-models|데이터베이스 모델]]
