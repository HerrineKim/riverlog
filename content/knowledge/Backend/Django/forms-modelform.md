---
title: "Django Form과 ModelForm"
concept: "ModelForm"
summary: "Django Form으로 입력 폼 렌더링과 유효성 검사를 자동화하고, ModelForm으로 모델 필드를 재사용해 생성·수정 로직을 단순화한다."
tags: ["django", "python", "validation", "form"]
source: til
---

사용자 입력을 HTML `<input>`으로 직접 받아 검증하는 일은 번거롭고 실수하기 쉽다. Django Form은 이 작업의 상당 부분을 자동화하고, 직접 짜는 것보다 안전하다.

## Form이 해 주는 일

1. 렌더링을 위한 데이터 준비·재구성
2. 데이터에 맞는 HTML form 생성
3. 클라이언트가 제출한 데이터 수신·처리, 그리고 무엇보다 **유효성 검사**

## Form vs ModelForm

| | Form | ModelForm |
| --- | --- | --- |
| 필드 정의 | 직접 정의 | 지정한 Model의 필드로 자동 생성 |
| 저장 | 직접 `Model.objects.create(...)` | `form.save()`로 바로 저장 |
| 쓰임 | 검색창·로그인처럼 DB 저장과 무관한 입력 | 모델 데이터를 생성·수정하는 입력 |

어느 쪽이 더 낫다기보다 **용도에 따라** 고른다.

```python
# forms.py — Form: 필드를 직접 정의 (사용자가 입력할 필드만)
from django import forms

class RecordForm(forms.Form):
    date = forms.CharField(max_length=8)
    push_up = forms.CharField(max_length=20)
    pull_up = forms.CharField(widget=forms.Textarea)
```

```python
# forms.py — ModelForm: Meta에 모델과 필드만 지정
from .models import Record

class RecordForm(forms.ModelForm):
    class Meta:
        model = Record
        fields = '__all__'      # 또는 ('date', 'push_up') / exclude = ('created_at',)
```

## 템플릿 렌더링

```django
<form action="{% url 'records:create' %}" method="POST">
  {% csrf_token %}
  {{ form.as_p }}
  <button>저장</button>
</form>
```

| 옵션 | 렌더링 |
| --- | --- |
| `{{ form.as_p }}` | 각 필드를 `<p>`로 감쌈 |
| `{{ form.as_ul }}` | 각 필드를 `<li>`로 (`<ul>`은 직접 작성) |
| `{{ form.as_table }}` | 각 필드를 `<tr>`로 (`<table>`은 직접 작성) |
| `{{ form.as_div }}` | 각 필드를 `<div>`로 (Django 4.1+) |

## 생성 view 패턴

GET이면 빈 폼을 보여 주고, POST면 검증 후 저장하는 **하나의 view**로 new/create를 합친다.

```python
from django.shortcuts import render, redirect

def create(request):
    if request.method == 'POST':                 # (A) 제출
        form = RecordForm(request.POST)          #     입력값이 채워진(bound) 폼
        if form.is_valid():                      # (B) 유효성 검사
            record = form.save()
            return redirect('records:detail', record.pk)  # (C) 성공
    else:                                        # (D) 처음 접근(GET)
        form = RecordForm()                      #     빈 폼
    return render(request, 'records/create.html', {'form': form})  # (E)
```

- `context`/`render`를 `else` 밖에 둔 이유: **POST인데 검증에 실패한 경우**에도 (E)로 내려와 폼을 다시 보여 주기 위해서다.
- 이때 다시 보여 주는 폼은 빈 폼이 아니라 **사용자가 입력한 값과 에러 메시지를 담은 폼**이다. 사용자는 잘못된 부분만 고쳐 다시 제출하면 된다.
- 수정(update)도 같은 구조에서 `RecordForm(request.POST, instance=record)` / `RecordForm(instance=record)`만 바꾸면 된다.

> 고친 점: 원래 필기의 Form 예시는 GET 요청에서도 `RecordForm(request.POST)`를 만들어, 처음 페이지에 들어갈 때부터 "필수 항목입니다" 에러가 표시되는 문제가 있었다. GET에서는 인자 없는 빈 폼을 만들어야 한다.

## Widget

위젯은 input 요소의 **HTML 렌더링**만 담당한다. 유효성 검사는 필드가 담당한다는 점을 혼동하지 않는다.

```python
class RecordForm(forms.ModelForm):
    # 방법 1: 필드를 다시 선언하며 위젯 지정
    pull_up = forms.CharField(
        label='턱걸이',
        widget=forms.TextInput(attrs={'class': 'pull_up', 'placeholder': '턱걸이 개수'}),
    )

    class Meta:
        model = Record
        fields = '__all__'
        # 방법 2: Meta.widgets에서 지정
        widgets = {
            'push_up': forms.TextInput(attrs={'class': 'push_up', 'placeholder': '팔굽혀펴기 개수'}),
        }
```

방법 1은 라벨·검증 옵션까지 함께 바꿀 수 있고, 방법 2는 모델 필드 정의를 그대로 둔 채 렌더링만 바꿀 때 간결하다.

## 핵심 정리

- Form은 렌더링 + 검증, ModelForm은 여기에 모델 필드 재사용 + `save()`까지.
- view는 `if POST → is_valid → save → redirect / else → 빈 폼 → render` 패턴.
- 검증 실패 시 입력값·에러가 담긴 폼을 그대로 다시 렌더링한다.

참고: [Django Forms 문서](https://docs.djangoproject.com/en/stable/topics/forms/)
