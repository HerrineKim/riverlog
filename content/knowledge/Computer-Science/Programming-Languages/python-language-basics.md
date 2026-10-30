---
title: "Python 언어 기본: 객체와 가변성, 함수, 데코레이터, 클래스, 타입 힌트, import"
concept: "Python Basics"
summary: "Python 문법이 실제로 어떻게 동작하는지 주제별로 정리한다. 이름과 객체, 가변·불변 타입과 is·==, 얕은 복사와 깊은 복사, *args·**kwargs와 인자 종류, 일급 함수와 LEGB 스코프·클로저·nonlocal, 람다의 제약, 데코레이터, 컴프리헨션과 제너레이터 식, 컨텍스트 매니저, 클래스 변수와 인스턴스 변수, 매직 메서드, 프로퍼티와 디스크립터, 타입 힌트와 mypy, import 시스템과 __init__.py, Python 2와 3의 차이."
tags: ["python", "programming-language", "oop", "type-system"]
source: other
date: "2026-10-30"
sources: ["https://github.com/fru1tworld/cs-basic/blob/main/interview/etc/python.md", "https://docs.python.org/3/reference/datamodel.html", "https://docs.python.org/3/reference/executionmodel.html", "https://docs.python.org/3/howto/descriptor.html", "https://docs.python.org/3/reference/import.html", "https://docs.python.org/3/library/copy.html", "https://docs.python.org/3/library/contextlib.html", "https://peps.python.org/pep-0484/", "https://peps.python.org/pep-0649/"]
---

> fru1tworld/cs-basic 모의 면접 질문 목록의 Python 질문이 묻는 개념을, Python 언어 레퍼런스(데이터 모델, 실행 모델, import 시스템)와 PEP로 확인해 정리한 노트다.

제너레이터·MRO·메모리 관리·GIL과 동시성·성능은 [[python-internals|Python 언어 동작]]에, 가상 환경과 패키지 관리 도구는 [[python-pyenv-setup|pyenv로 Python 환경 잡기]]에 있다.

## 이름과 객체

**Python의 모든 값은 객체이고, 변수는 객체에 붙인 이름(참조)이다.** 객체는 정체성(`id()`), 타입, 값을 가진다. `a = b`는 객체를 복사하지 않고 같은 객체에 이름을 하나 더 붙인다. 함수 인자도 같은 방식으로 넘어간다(공유에 의한 호출, [[programming-language-semantics|프로그래밍 언어 의미론]]).

| 구분 | 타입 | 특징 |
| --- | --- | --- |
| 불변(immutable) | `int`, `float`, `bool`, `str`, `bytes`, `tuple`, `frozenset`, `None` | 값을 바꾸는 연산이 **새 객체**를 만든다. 해시 가능해 `dict` 키·`set` 원소가 될 수 있다 |
| 가변(mutable) | `list`, `dict`, `set`, `bytearray`, 대부분의 사용자 클래스 인스턴스 | 제자리에서 바뀌어, 같은 객체를 가리키는 모든 이름에서 변화가 보인다. `dict` 키로 쓸 수 없다 |

```python
a = [1, 2]; b = a; b.append(3)   # a도 [1, 2, 3]
s = "hi"; t = s; t += "!"        # 새 str이 t에 묶인다. s는 "hi"
```

- `tuple`은 불변이지만 안에 `list`가 있으면 그 리스트는 바뀐다. 이런 튜플은 해시할 수 없다.
- `+=`는 가변 객체에서는 제자리 변경(`__iadd__`), 불변 객체에서는 새 객체 대입이다.
- `==`는 값이 같은지(`__eq__`), `is`는 **같은 객체인지**(정체성)를 본다. `None` 비교는 `is None`으로 한다. CPython은 -5~256 정수와 일부 문자열을 미리 만들어 재사용(인터닝)하므로 그 범위에서 `is`가 우연히 참이 되지만, 이는 구현 세부라 값 비교에 `is`를 쓰면 안 된다.

## 얕은 복사와 깊은 복사

| 방법 | 새로 만드는 것 | 안쪽 객체 |
| --- | --- | --- |
| 대입 `b = a` | 없음. 같은 객체 | 공유 |
| 얕은 복사 `copy.copy(a)`, `a[:]`, `list(a)`, `a.copy()`, `{**d}` | **바깥 컨테이너만** 새로 | **공유**한다 |
| 깊은 복사 `copy.deepcopy(a)` | 바깥과 안쪽을 **재귀적으로 모두** 새로 | 공유하지 않는다 |

```python
import copy
a = [[1, 2], [3]]
s = copy.copy(a);     s[0].append(9)   # a[0]도 [1, 2, 9]
d = copy.deepcopy(a); d[0].append(7)   # a는 그대로
```

- `deepcopy`는 이미 복사한 객체를 메모 딕셔너리에 기록해 **순환 참조**와 같은 객체를 두 번 가리키는 구조를 그대로 보존한다.
- 불변 객체는 복사해도 같은 객체를 돌려준다(바꿀 수 없으니 공유해도 안전하다).
- 클래스는 `__copy__`·`__deepcopy__`로 복사 방식을 정할 수 있다. `[[0] * 3] * 3`이 같은 리스트 세 개를 가리키는 것도 얕은 복사 문제다. `[[0] * 3 for _ in range(3)]`로 만든다.

## 함수

### 인자의 종류와 *args, **kwargs

```python
def f(a, b=2, /, c=3, *args, d, e=5, **kwargs): ...
#     위치 전용  일반  가변 위치  키워드 전용  가변 키워드
```

| 표기 | 받는 것 |
| --- | --- |
| `*args` | 남는 **위치 인자**를 튜플로 |
| `**kwargs` | 남는 **키워드 인자**를 딕셔너리로 |
| `/` 앞 (3.8+) | 위치로만 넘길 수 있는 매개변수. 이름을 바꿔도 호출자가 깨지지 않는다 |
| `*` 또는 `*args` 뒤 | 키워드로만 넘길 수 있는 매개변수. `sorted(xs, key=..., reverse=True)` |

호출할 때는 반대로 `f(*lst, **dct)`가 시퀀스와 딕셔너리를 인자로 펼친다. 데코레이터·래퍼가 받은 인자를 그대로 넘길 때 `(*args, **kwargs)`를 쓴다. 기본값은 정의 시점에 한 번만 만들어지므로 가변 기본값(`def f(a=[])`)은 쓰지 않는다([[python-internals|Python 언어 동작]]의 누수 패턴).

### 스코프와 클로저, nonlocal

이름은 **LEGB** 순서로 찾는다: Local(함수 안) → Enclosing(감싼 함수) → Global(모듈) → Built-in.

```python
def counter():
    count = 0
    def inc():
        nonlocal count      # 없으면 count += 1이 inc의 지역 변수로 취급돼 UnboundLocalError
        count += 1
        return count
    return inc

c = counter(); c(); c()     # 2
```

- 함수 안에서 이름에 **대입**하면 그 이름은 그 함수 전체에서 지역 변수가 된다. 바깥 변수를 읽기만 하면 선언이 필요 없지만, 다시 묶으려면 감싼 함수의 변수는 `nonlocal`, 모듈 변수는 `global`로 선언한다.
- `inc`는 `count`라는 **변수(셀)를 캡처**한 클로저다. 값을 복사하지 않으므로 `inc.__closure__`의 셀 내용이 호출마다 바뀐다.
- 반복문에서 만든 람다가 모두 마지막 값을 보는 함정(`[lambda: i for i in range(3)]`)도 변수 캡처 때문이다. `lambda i=i: i`처럼 기본값으로 값을 묶는다.

### 람다

`lambda x: x * 2`는 **식(expression) 하나**만 본문으로 갖는 이름 없는 함수다.

| 제약 | 결과 |
| --- | --- |
| 문(statement)을 쓸 수 없다 | 대입(3.8+의 `:=` 제외), `return`, `try`, `for`, 여러 줄 본문이 안 된다 |
| 이름이 `<lambda>`로 나온다 | 스택 트레이스와 디버깅이 불편하다 |
| 어노테이션·독스트링이 없다 | 타입 힌트를 달 수 없다 |

`sorted(key=lambda u: u.age)`처럼 짧은 일회용 함수에만 쓰고, 변수에 담을 함수는 `def`로 쓴다(PEP 8). 클로저 규칙은 `def`와 같다.

### 데코레이터

**데코레이터는 함수(또는 클래스)를 받아 새 함수를 돌려주는 호출 가능 객체다.** `@deco`는 정의 직후 `f = deco(f)`를 실행하는 문법이다. 함수가 일급 객체이고 클로저가 있기 때문에 가능하다.

```python
import functools, time

def timed(func):
    @functools.wraps(func)                 # __name__, __doc__, 시그니처 정보를 원래 함수에서 복사
    def wrapper(*args, **kwargs):
        t = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            print(func.__name__, time.perf_counter() - t)
    return wrapper

def retry(times):                          # 인자를 받는 데코레이터: 데코레이터를 돌려주는 함수
    def deco(func):
        @functools.wraps(func)
        def wrapper(*a, **kw):
            for i in range(times):
                try: return func(*a, **kw)
                except Exception:
                    if i == times - 1: raise
        return wrapper
    return deco

@retry(3)
@timed            # 아래부터 적용: f = retry(3)(timed(f))
def fetch(url): ...
```

- 데코레이터 코드는 **모듈을 import할 때(정의 시점)** 한 번 실행되고, `wrapper`는 호출할 때마다 실행된다.
- 표준 데코레이터: `@property`, `@staticmethod`, `@classmethod`, `@functools.cache`·`lru_cache`, `@dataclass`, `@contextlib.contextmanager`.
- JavaScript의 같은 패턴은 [[function-decorators|함수 데코레이터]]에 있다.

## 컴프리헨션과 제너레이터 식

| 비교 | 리스트 컴프리헨션 `[x*x for x in xs]` | 제너레이터 식 `(x*x for x in xs)` |
| --- | --- | --- |
| 결과 | 원소를 모두 담은 `list` | 값을 하나씩 만드는 제너레이터(이터레이터) |
| 평가 | **즉시** 전부 계산 | **지연**. 요청할 때마다 하나 |
| 메모리 | 원소 수에 비례 | 크기와 무관하게 일정 |
| 재사용 | 여러 번 순회, 인덱싱, `len()` | 한 번 순회하면 소진. 인덱싱 불가 |
| 맞는 곳 | 결과를 여러 번 쓰거나 크기가 작을 때 | 큰 데이터, 바로 집계(`sum(x*x for x in xs)`), 파이프라인 |

집합 `{…}`, 딕셔너리 `{k: v for …}` 컴프리헨션도 있다. Python 3에서 컴프리헨션은 자기 스코프를 가져 반복 변수가 바깥으로 새지 않는다. 제너레이터의 동작은 [[python-internals|Python 언어 동작]]에 있다.

## 컨텍스트 매니저

**컨텍스트 매니저는 `with` 블록에 들어갈 때와 나올 때의 동작을 정의한 객체다.** 블록이 정상으로 끝나든 예외로 끝나든 정리 코드가 실행된다. Java의 try-with-resources, C++의 RAII와 같은 목적이다.

```python
with open("a.txt") as f:          # f = open(...).__enter__()
    data = f.read()
# 블록을 나가면 __exit__(exc_type, exc, tb)가 불린다. 예외가 있으면 그 정보가 넘어온다
```

| 메서드 | 역할 |
| --- | --- |
| `__enter__(self)` | 자원을 얻고, `as` 뒤 이름에 묶일 값을 돌려준다 |
| `__exit__(self, exc_type, exc, tb)` | 자원을 정리한다. **참을 돌려주면 예외를 삼킨다**(보통은 `None`을 돌려 예외를 그대로 전파) |

`contextlib.contextmanager`로 제너레이터 하나로 쓸 수 있다. `yield` 앞이 진입, 뒤가 정리다. 파일, 락(`with lock:`), DB 트랜잭션, 임시 디렉터리, `decimal` 정밀도 변경처럼 「바꿨다가 반드시 되돌리는」 일에 쓴다. 비동기 버전은 `async with`와 `__aenter__`·`__aexit__`다.

```python
from contextlib import contextmanager

@contextmanager
def timer():
    t = time.perf_counter()
    try:
        yield
    finally:
        print(time.perf_counter() - t)
```

## 클래스

### 클래스 변수와 인스턴스 변수

| 구분 | 정의 위치 | 저장 위치 | 공유 |
| --- | --- | --- | --- |
| 클래스 변수 | 클래스 본문 | 클래스의 `__dict__` | 모든 인스턴스가 공유 |
| 인스턴스 변수 | 메서드 안 `self.x = …` | 각 인스턴스의 `__dict__` | 인스턴스마다 따로 |

```python
class Dog:
    kind = "canine"        # 클래스 변수
    tricks = []            # 함정: 가변 클래스 변수는 모든 인스턴스가 같은 리스트를 쓴다
    def __init__(self, name):
        self.name = name   # 인스턴스 변수
```

`d.kind`는 인스턴스 `__dict__`에서 먼저 찾고, 없으면 클래스(그리고 MRO)에서 찾는다. `d.kind = "x"`로 **대입**하면 인스턴스 변수가 새로 생겨 클래스 변수를 가릴 뿐 클래스 변수는 그대로다. 반면 `d.tricks.append(...)`는 대입이 아니라 공유된 리스트를 고친다. 인스턴스마다 다른 가변 값은 `__init__`에서 만든다. `@classmethod`는 첫 인자로 클래스(`cls`)를 받아 대안 생성자(`from_json`)에, `@staticmethod`는 아무것도 받지 않아 네임스페이스로 묶은 함수에 쓴다.

### 매직 메서드

**매직 메서드(던더 메서드, `__x__`)는 언어 문법과 내장 함수가 호출하는 훅이다.** 구현하면 사용자 클래스가 내장 타입처럼 동작한다.

| 분류 | 메서드 | 불리는 때 |
| --- | --- | --- |
| 생성 | `__new__(cls)` / `__init__(self)` | 객체를 **만든다**(불변 타입 상속, 싱글턴에 쓴다) / 만든 객체를 **초기화**한다 |
| 표현 | `__repr__` / `__str__` | `repr()`·디버거·컨테이너 안 출력: 개발자용, 가능하면 다시 만들 수 있는 모양 / `str()`·`print()`: 사용자용. `__str__`이 없으면 `__repr__`을 쓴다 |
| 비교·해시 | `__eq__`, `__lt__`, `__hash__` | `==`, `<`, `dict` 키. `__eq__`만 정의하면 `__hash__`가 `None`이 돼 해시할 수 없다 |
| 컨테이너 | `__len__`, `__getitem__`, `__contains__`, `__iter__` | `len()`, `obj[k]`, `in`, `for` |
| 연산자 | `__add__`, `__radd__`, `__iadd__` | `+`, 왼쪽이 처리 못할 때의 `+`, `+=` |
| 호출·속성 | `__call__`, `__getattr__`, `__getattribute__` | `obj()`, 없는 속성 접근, 모든 속성 접근 |
| 문맥 | `__enter__`, `__exit__` | `with` |

`@dataclass`는 필드 선언에서 `__init__`·`__repr__`·`__eq__`(옵션으로 `__hash__`, 순서 비교, `frozen`)를 만들어 준다.

### 프로퍼티와 디스크립터

**프로퍼티(property)** 는 속성 접근을 메서드 호출로 바꾼다. 처음에는 공개 속성으로 두었다가 검증이 필요해지면 호출 코드를 바꾸지 않고 프로퍼티로 바꿀 수 있어, Java식 getter·setter를 미리 만들 필요가 없다.

```python
class Account:
    def __init__(self, balance): self.balance = balance   # setter를 거친다
    @property
    def balance(self): return self._balance
    @balance.setter
    def balance(self, v):
        if v < 0: raise ValueError("음수 불가")
        self._balance = v
```

**디스크립터(descriptor)** 는 `__get__`·`__set__`·`__delete__` 중 하나를 가진 객체를 **클래스 속성**으로 두어, 그 속성의 접근을 가로채는 프로토콜이다. `property`, 메서드(함수 객체의 `__get__`이 `self`를 묶은 바운드 메서드를 만든다), `classmethod`, `staticmethod`, Django 모델 필드, SQLAlchemy 컬럼이 모두 디스크립터다.

| 종류 | 정의한 메서드 | 인스턴스 `__dict__`와의 우선순위 |
| --- | --- | --- |
| 데이터 디스크립터 | `__set__` 또는 `__delete__` | 디스크립터가 **이긴다**(`property`) |
| 비데이터 디스크립터 | `__get__`만 | 인스턴스 `__dict__`가 이긴다(메서드, `functools.cached_property`) |

`obj.x`의 탐색 순서는 ① 타입의 데이터 디스크립터 → ② 인스턴스 `__dict__` → ③ 타입의 비데이터 디스크립터·일반 클래스 속성 → ④ `__getattr__`이다. 같은 검증을 여러 속성에 재사용하려면 프로퍼티를 반복하지 않고 디스크립터 클래스 하나를 만든다(`__set_name__`으로 속성 이름을 받는다).

추상 클래스(`abc.ABC`)는 [[abstract-class-vs-interface|추상 클래스와 인터페이스]]에, 다중 상속과 MRO, 덕 타이핑은 [[python-internals|Python 언어 동작]]에 있다.

## 타입 힌트와 정적 검사

**타입 힌트(PEP 484)는 변수·매개변수·반환값에 타입을 적는 주석 문법이고, 인터프리터는 실행 중에 이를 검사하지 않는다.** 검사는 mypy, pyright 같은 정적 타입 검사기가 실행 전에 한다. 힌트가 없는 코드와 섞어 쓸 수 있는 **점진적 타이핑(gradual typing)** 이며, 힌트가 없는 부분은 `Any`로 취급한다.

```python
def first[T](xs: list[T]) -> T | None:      # 3.12+ 제네릭 문법, 3.10+ X | Y 유니언
    return xs[0] if xs else None

type UserId = int                           # 3.12+ 타입 별칭
```

| 도구 | 역할 |
| --- | --- |
| `typing.Protocol` | 구조적 타입. 상속 없이 메서드 모양으로 호환 |
| `TypedDict`, `dataclass` | 딕셔너리 모양, 레코드 |
| `Literal`, `Final`, `TypeGuard` | 값 제한, 재대입 금지, 타입 좁히기 |
| mypy `--strict`, pyright | 힌트 누락·`Any` 사용까지 오류로 잡는다 |
| pydantic, beartype | 힌트를 읽어 **실행 중에** 검증한다(API 입력 검증) |

- 힌트는 IDE 자동완성, 리팩터링 안정성, 문서 역할을 한다. 실행 속도에는 영향이 없다.
- Python 3.14부터 어노테이션은 정의 시점이 아니라 **처음 읽을 때 평가**된다(PEP 649). 아직 정의되지 않은 클래스를 따옴표 없이 참조할 수 있고 import 비용이 준다. 이전 버전에서는 `from __future__ import annotations`로 문자열로 저장했다.
- 타입 시스템의 일반 개념(구조적·명목적 타입, 변성, 제네릭)은 [[type-systems|타입 시스템]]에 있다.

## 모듈과 import

**모듈은 `.py` 파일 하나, 패키지는 모듈을 담은 디렉터리다.** `import x`는 다음 순서로 동작한다.

1. `sys.modules`(이미 import한 모듈 캐시)에 있으면 그것을 쓴다. **모듈 코드는 프로세스에서 한 번만 실행된다.** 모듈 수준 객체가 사실상 싱글턴인 이유다.
2. 없으면 `sys.path`(스크립트 디렉터리, `PYTHONPATH`, 표준 라이브러리, site-packages)를 차례로 찾아 파인더·로더가 모듈 객체를 만든다.
3. 모듈 코드를 위에서 아래로 실행해 그 네임스페이스를 채우고, 현재 네임스페이스에 이름을 묶는다.

| 형태 | 묶는 이름 |
| --- | --- |
| `import pkg.mod` | `pkg` (속성으로 `pkg.mod` 접근) |
| `from pkg.mod import f` | `f`. import 시점의 객체를 묶으므로 나중에 `pkg.mod.f`를 바꿔도 반영되지 않는다(테스트 목킹 시 주의) |
| `from . import sibling` | 현재 패키지 기준 상대 import. 패키지 안에서만 된다 |
| `from mod import *` | `__all__`에 적힌 이름(없으면 `_`로 시작하지 않는 이름). 출처가 흐려져 쓰지 않는다 |

**`__init__.py`의 역할**:

- 디렉터리를 **일반 패키지(regular package)** 로 만든다. 패키지를 import하면 `__init__.py`가 먼저 실행된다.
- 패키지 초기화 코드, 하위 모듈의 공개 API 재노출(`from .core import Client`), `__all__` 정의를 둔다.
- Python 3.3부터 `__init__.py`가 없는 디렉터리도 **네임스페이스 패키지**(PEP 420)로 import된다. 여러 경로에 흩어진 디렉터리를 한 패키지로 합칠 수 있지만, 일반 패키지보다 탐색이 느리고 실수로 엉뚱한 디렉터리가 패키지가 될 수 있어 보통은 `__init__.py`를 둔다.

`if __name__ == "__main__":`은 파일이 직접 실행될 때만 돌 코드를 가른다. import되면 `__name__`이 모듈 이름이 된다. 패키지 안 모듈은 `python -m pkg.mod`로 실행해야 상대 import가 동작한다. 두 모듈이 서로를 최상위에서 import하면 반쯤 초기화된 모듈을 보게 되므로(순환 import), 공통 부분을 떼어 내거나 함수 안에서 import한다.

## Python 2와 3

Python 2는 2020년 1월 1일 지원이 끝났다. 3은 하위 호환을 깨고 언어의 오래된 불일치를 정리했다.

| 항목 | Python 2 | Python 3 |
| --- | --- | --- |
| 문자열 | `str`은 바이트, 유니코드는 `u""` | `str`은 유니코드, 바이트는 `bytes`. 둘을 섞으면 오류 |
| `print` | 문(statement) | 함수 `print()` |
| 정수 나눗셈 | `3 / 2 == 1` | `3 / 2 == 1.5`, 몫은 `//` |
| 정수 | `int`와 `long` 구분 | `int` 하나(임의 정밀도) |
| `range`, `map`, `zip`, `dict.keys()` | 리스트를 만든다 | 지연 객체·뷰를 돌려준다 |
| 예외 | `except E, e:` | `except E as e:`, 예외 연쇄(`raise … from …`) |
| 클래스 | 옛 스타일 클래스와 새 스타일 클래스 | 모두 새 스타일(`object` 상속), C3 MRO |
| 그 밖 | - | 키워드 전용 인자, `nonlocal`, f-문자열(3.6), `async`/`await`(3.5), 타입 힌트 |

## 정리

- 변수는 객체에 붙인 이름이다. 가변 객체는 공유되는 모든 이름에서 변화가 보이고, `is`는 정체성, `==`는 값 비교다.
- 얕은 복사는 바깥만, 깊은 복사는 안쪽까지 새로 만든다.
- `*args`·`**kwargs`는 남는 위치·키워드 인자를 모으고, 바깥 변수를 다시 묶으려면 `nonlocal`·`global`이 필요하다.
- 데코레이터는 `f = deco(f)`이고 `functools.wraps`로 원래 정보를 보존한다. 컨텍스트 매니저는 `__enter__`·`__exit__`로 정리를 보장한다.
- 가변 클래스 변수는 모든 인스턴스가 공유한다. 프로퍼티와 메서드는 디스크립터 프로토콜로 동작한다.
- 타입 힌트는 실행 중에 검사되지 않고 정적 검사기가 읽는다. 모듈은 `sys.modules`에 캐시돼 한 번만 실행된다.

관련 노트: [[python-internals|Python 언어 동작]], [[python-pyenv-setup|pyenv로 Python 환경 잡기]], [[abstract-class-vs-interface|추상 클래스와 인터페이스]], [[type-systems|타입 시스템]], [[programming-language-semantics|프로그래밍 언어 의미론]], [[function-decorators|함수 데코레이터]]
