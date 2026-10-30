---
title: "Python 언어 동작: 제너레이터, MRO, 메모리 관리, 덕 타이핑"
concept: "Python Internals"
summary: "Python 면접 단골 주제를 언어 동작 기준으로 정리한다. 이터러블·이터레이터·제너레이터의 관계와 지연 평가, 다중 상속의 MRO(C3 선형화)와 super(), CPython의 참조 카운팅·세대별 순환 수집과 메모리 누수 패턴, PyPy의 추적 JIT, 덕 타이핑과 Protocol."
tags: ["python", "programming-language", "gc", "oop"]
source: other
date: "2026-10-30"
sources: ["https://github.com/jbee37142/Interview_Question_for_Beginner/blob/main/Python/README.md", "https://docs.python.org/3/library/gc.html", "https://docs.python.org/3/howto/mro.html", "https://peps.python.org/pep-0442/", "https://peps.python.org/pep-0544/", "https://docs.python.org/3/whatsnew/3.14.html"]
---

> jbee의 「[Interview Question for Beginner](https://github.com/jbee37142/Interview_Question_for_Beginner)」 저장소 Python 문서를 바탕으로, Python 공식 문서와 PEP로 확인해 재구성한 노트다.

GIL과 free-threaded 빌드는 [[concurrency-models|동시성 모델]]의 「GIL과 스크립트 언어의 선택」 절에, 바이트코드 실행과 언어별 GC 비교는 [[how-programs-run|프로그램이 실행되기까지]]에, `sorted()`가 쓰는 Timsort는 [[merge-quick-sort|병합 정렬과 퀵 정렬]]에 있다.

## 이터러블, 이터레이터, 제너레이터

| 개념 | 조건 | 예 |
| --- | --- | --- |
| 이터러블(iterable) | `__iter__()`로 이터레이터를 돌려준다. 여러 번 순회할 수 있다 | `list`, `dict`, `str`, `range` |
| 이터레이터(iterator) | `__next__()`로 다음 값을 주고, 끝나면 `StopIteration`. 자기 자신이 이터러블이다 | `iter([1, 2])`, 파일 객체 |
| 제너레이터(generator) | `yield`가 든 함수를 호출하면 나오는 **이터레이터** | `def f(): yield 1`, `(x for x in xs)` |

`for x in obj`는 `iter(obj)`로 이터레이터를 얻고 `StopIteration`이 날 때까지 `next()`를 부른다. `range`는 이터러블이지만 이터레이터가 아니어서 `next(range(3))`은 `TypeError`다.

### 제너레이터의 동작

1. 제너레이터 함수를 호출하면 **본문은 실행되지 않고** 제너레이터 객체만 생긴다.
2. `next()`가 불리면 본문을 실행하다 `yield`에서 값을 내주고 멈춘다.
3. 이때 지역 변수, 실행 위치, 내부 스택, 예외 상태가 **그대로 보존**된다.
4. 다음 `next()`에서 멈춘 곳부터 이어 간다. 함수가 끝나면 `StopIteration`이다.

```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1

gen = countdown(3)
next(gen), next(gen), next(gen)   # (3, 2, 1)
next(gen)                          # StopIteration
```

- **지연 평가로 메모리를 아낀다.** `[i for i in range(100_000)]`는 원소를 모두 담아 수백 KB지만, `(i for i in range(100_000))`는 크기와 상관없이 객체 하나(수백 바이트 미만)다. 무한 수열, 큰 파일 줄 단위 처리, 파이프라인에 맞다.
- **한 번 쓰면 소진된다.** 같은 제너레이터를 두 번 `list()`하면 두 번째는 빈 리스트다. 여러 번 써야 하면 리스트로 만들거나 제너레이터를 새로 만든다.
- `gen.send(v)`는 멈춘 `yield` 식의 값으로 `v`를 넣으며 재개한다(`next()`는 `None`을 넣는 것과 같다). `yield from sub`은 하위 제너레이터에 위임한다. 이 「멈췄다 재개하는 함수」가 `async def` 코루틴의 뿌리다.

JavaScript의 같은 개념은 [[iterators-and-generators|이터레이터와 제너레이터]]에 있다.

## 다중 상속과 MRO

`obj.method()`를 부르면 Python은 **MRO(Method Resolution Order)** 순서로 클래스를 훑어 처음 찾은 메서드를 쓴다. MRO는 클래스의 `__mro__`(또는 `mro()`)로 볼 수 있다.

```python
class A: pass
class B(A): pass
class C(A): pass
class D(B, C): pass

D.__mro__   # (D, B, C, A, object)
```

Python 2.3부터 MRO는 **C3 선형화**로 계산한다. 규칙은 두 가지다.

- 자식은 부모보다 먼저 온다.
- 클래스 정의에 적은 부모 순서(`B, C`)를 지킨다.

두 규칙을 동시에 만족하는 순서가 없으면 클래스를 만들 때 `TypeError: Cannot create a consistent method resolution order (MRO)`가 난다. 예를 들어 `class X(A, B)`와 `class Y(B, A)`를 함께 상속하면 A와 B의 순서가 모순된다.

`super()`는 「부모 클래스」가 아니라 **MRO에서 다음 클래스**를 부른다. 그래서 다이아몬드 상속에서 모든 클래스가 `super().__init__()`을 부르면 `A.__init__`이 한 번만 실행된다(협력적 다중 상속).

## 메모리 관리

CPython은 두 장치를 함께 쓴다.

| 장치 | 동작 | 놓치는 것 |
| --- | --- | --- |
| 참조 카운팅 | 객체마다 참조 수(`ob_refcnt`)를 세고 0이 되는 **즉시** 해제한다. `sys.getrefcount(obj)`로 볼 수 있다(인자로 넘기며 1이 더해진다) | 서로를 가리키는 순환 참조 |
| 순환 수집기(`gc` 모듈) | 컨테이너 객체(리스트, 딕셔너리, 사용자 객체)를 추적해 바깥에서 닿지 않는 순환 묶음을 찾아 해제한다 | - |

```python
a = []; b = [a]; a.append(b)   # a ↔ b 순환
del a, b                        # 참조 수가 1씩 남아 즉시 해제되지 않는다 → 순환 수집기가 회수
```

- 순환 수집기는 **세대별**로 돈다. 새로 만든 객체를 젊은 세대에 두고, 할당 수가 임계값(`gc.get_threshold()`)을 넘으면 젊은 세대부터 검사한다. 살아남은 객체는 늙은 세대로 옮겨 덜 자주 본다. 3.14.0~3.14.4에는 늙은 세대를 조금씩 나눠 훑는 점진적(incremental) 수집기가 들어갔지만, 운영 환경의 메모리 압박 문제로 3.14.5에서 3.13의 세대별 수집기로 되돌렸다.
- `gc.disable()`로 순환 수집을 끄거나, 서버가 fork하기 전에 `gc.freeze()`로 기존 객체를 수집 대상에서 빼면 copy-on-write 메모리 공유가 덜 깨진다. 순환 참조가 거의 없는 대형 서비스가 쓰는 최적화다.
- free-threaded 빌드는 참조 카운팅을 스레드별로 나누는(biased reference counting) 방식으로 GIL 없이도 카운트를 안전하게 바꾼다.

### 메모리 누수 패턴

GC가 있어도 **닿을 수 있는데 더는 쓰지 않는 객체**는 회수되지 않는다.

| 패턴 | 문제 | 대신 |
| --- | --- | --- |
| 가변 기본 인자 `def f(a=[])` | 기본값은 함수 정의 때 **한 번만** 만들어져 호출마다 같은 리스트에 쌓인다 | `def f(a=None): a = [] if a is None else a` |
| 만료 없는 캐시·전역 딕셔너리 | 요청마다 쌓이기만 한다. 무제한 `@functools.lru_cache(maxsize=None)`도 같다 | `maxsize` 지정, TTL 캐시, `weakref.WeakValueDictionary` |
| 지우지 않는 콜백·리스너 | 등록한 쪽이 객체를 계속 붙잡는다 | 해제 API를 부르거나 `weakref`로 등록한다 |
| C 확장·네이티브 자원 | 파이썬 GC 밖의 메모리다 | `with` 문(컨텍스트 관리자)으로 닫는다 |

과거에는 `__del__`을 정의한 객체가 순환에 끼면 수집기가 해제하지 못하고 `gc.garbage`에 남겼다. **Python 3.4(PEP 442)부터는 이런 순환도 회수**한다. 그래도 `__del__`은 실행 시점이 보장되지 않으므로 자원 정리는 `with` 문으로 한다. 누수 추적에는 `tracemalloc`의 스냅숏 비교를 쓴다.

## PyPy가 CPython보다 빠른 이유

| 구현 | 실행 방식 |
| --- | --- |
| CPython | 소스를 바이트코드로 바꿔 인터프리터가 한 줄씩 해석한다. 3.11부터 자주 쓰는 연산을 타입에 맞게 바꾸는 적응형 인터프리터, 3.13부터 실험적 JIT가 들어왔다 |
| PyPy | **추적 JIT(tracing JIT)**: 실행 중 자주 도는 **루프**의 실제 경로를 기록해 기계어로 컴파일한다. 메서드 단위로 컴파일하는 전통적 JIT와 단위가 다르다 |

PyPy는 RPython(제약을 둔 Python)으로 인터프리터를 쓰고, RPython 툴체인이 그 인터프리터에 추적 JIT를 자동으로 붙여 C로 번역한다. 언어 규칙(인터프리터)과 최적화(JIT 생성기)를 분리한 구조라 다른 동적 언어 인터프리터에도 같은 툴체인을 쓸 수 있다. 순수 Python 루프가 많은 코드는 몇 배 빨라지지만, C 확장(NumPy 등) 호출이 많은 코드는 이득이 작거나 호환성 문제가 있다.

## 덕 타이핑

**덕 타이핑(duck typing)** 은 객체의 선언된 타입이 아니라 **필요한 메서드·속성을 가졌는가**로 쓸 수 있는지를 정하는 방식이다. 「오리처럼 걷고 꽥꽥거리면 오리다」라는 덕 테스트에서 왔다.

```python
class Duck:
    def quack(self): return "Quack!"

class Robot:
    def quack(self): return "삐빅, 꽥"

def make_noise(x):
    return x.quack()      # 타입을 묻지 않는다

make_noise(Duck()), make_noise(Robot())   # 둘 다 된다
make_noise(42)                             # AttributeError: 실행해야 안다
```

- 장점은 상속 없이도 같은 인터페이스를 만족하면 바꿔 끼울 수 있다는 것이다. 파일처럼 `read()`만 있으면 되는 함수에 `io.StringIO`를 넘기는 식이다.
- 단점은 잘못된 객체를 넘겨도 **실행해 봐야 안다**는 것이다. 타입 힌트의 `typing.Protocol`(PEP 544)은 「이 메서드를 가진 무엇이든」을 선언해, 상속 없이도 mypy·pyright 같은 정적 검사기가 덕 타이핑을 미리 검사하게 한다(구조적 타이핑).
- 「먼저 해 보고 실패하면 예외로 처리한다(EAFP)」가 덕 타이핑과 어울리는 Python의 관용 스타일이다. TypeScript의 구조적 타입도 같은 발상이다.

## 정리

- 제너레이터는 상태를 보존하며 멈췄다 재개하는 이터레이터다. 메모리를 아끼지만 한 번 쓰면 소진된다
- 메서드 탐색은 C3 선형화로 만든 MRO를 따르고, `super()`는 MRO의 다음 클래스를 부른다
- CPython은 참조 카운팅으로 즉시 해제하고, 순환 참조는 세대별 순환 수집기가 회수한다
- 누수는 대개 가변 기본 인자, 무제한 캐시, 지우지 않은 참조에서 나온다
- 덕 타이핑은 타입보다 동작으로 판단하고, `Protocol`로 정적 검사를 더할 수 있다

관련 노트: [[how-programs-run|프로그램이 실행되기까지]], [[concurrency-models|동시성 모델]], [[iterators-and-generators|이터레이터와 제너레이터]], [[garbage-collection|가비지 컬렉션과 메모리 누수]], [[merge-quick-sort|병합 정렬과 퀵 정렬]]
