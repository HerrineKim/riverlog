---
title: "Python 언어 동작: 제너레이터, MRO, 메모리 관리, 동시성, 성능"
concept: "Python Internals"
summary: "Python의 런타임 동작을 정리한다. 이터러블·이터레이터·제너레이터의 관계와 지연 평가, 다중 상속의 MRO(C3 선형화)와 super(), CPython의 참조 카운팅·세대별 순환 수집과 메모리 누수 패턴, threading·multiprocessing·asyncio 비교와 이벤트 루프·TaskGroup, 측정에서 런타임 교체까지의 성능 최적화, CPython·PyPy(추적 JIT)·Jython(JVM, GIL 없음) 구현체 비교, 덕 타이핑과 Protocol."
tags: ["python", "programming-language", "gc", "oop"]
source: other
date: "2026-10-30"
sources: ["https://github.com/jbee37142/Interview_Question_for_Beginner/blob/main/Python/README.md", "https://docs.python.org/3/library/gc.html", "https://docs.python.org/3/howto/mro.html", "https://peps.python.org/pep-0442/", "https://peps.python.org/pep-0544/", "https://docs.python.org/3/whatsnew/3.14.html", "https://docs.python.org/3/library/asyncio-task.html", "https://docs.python.org/3/library/concurrent.futures.html", "https://github.com/fru1tworld/cs-basic/blob/main/interview/etc/python.md", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/os.md"]
---

> jbee의 「[Interview Question for Beginner](https://github.com/jbee37142/Interview_Question_for_Beginner)」 저장소 Python 문서를 바탕으로, Python 공식 문서와 PEP로 확인해 재구성한 노트다. 동시성 도구 비교, asyncio, 성능 최적화, 구현체 비교는 fru1tworld/cs-basic 모의 면접 질문 목록의 Python·운영체제 질문을 바탕으로 보강했다.

가변·불변 객체, 복사, 함수·데코레이터·클래스·import 같은 문법의 동작은 [[python-language-basics|Python 언어 기본]]에, GIL과 free-threaded 빌드는 [[concurrency-models|동시성 모델]]의 「GIL과 스크립트 언어의 선택」 절에, 바이트코드 실행과 언어별 GC 비교는 [[how-programs-run|프로그램이 실행되기까지]]에, `sorted()`가 쓰는 Timsort는 [[merge-quick-sort|병합 정렬과 퀵 정렬]]에 있다.

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

- 순환 수집기는 **세대별**로 돈다. 새로 만든 객체를 젊은 세대에 두고, 할당 수가 임계값(`gc.get_threshold()`)을 넘으면 젊은 세대부터 검사한다. 살아남은 객체는 늙은 세대로 옮겨 덜 자주 본다. 3.14.0~3.14.4에는 늙은 세대를 조금씩 나눠 훑는 점진적(incremental) 수집기가 들어갔지만, 운영 환경의 메모리 압박 문제로 3.14.5에서 3.13의 세대별 수집기로 되돌렸다([What's New In Python 3.14](https://docs.python.org/3/whatsnew/3.14.html)).
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

## 동시성: threading, multiprocessing, asyncio

GIL의 원리와 free-threaded 빌드는 [[concurrency-models|동시성 모델]]의 「GIL과 스크립트 언어의 선택」에 있다. 그 위에서 세 가지 도구를 고른다.

| 비교 | `threading` | `multiprocessing` | `asyncio` |
| --- | --- | --- | --- |
| 실행 단위 | OS 스레드 | OS 프로세스 | 한 스레드 안의 코루틴 |
| 전환 | OS가 선점. GIL은 일정 시간마다·I/O 대기 때 넘어간다 | OS가 선점 | **`await` 지점에서만** 협력적으로 |
| 병렬 실행(CPU) | 기본 빌드에서는 안 된다(GIL) | 된다. 프로세스마다 인터프리터와 GIL | 안 된다 |
| 메모리 공유 | 공유. 락이 필요하다 | 공유하지 않는다. 인자·결과를 pickle로 직렬화해 주고받는다 | 공유. 전환 지점이 명시적이라 락이 덜 필요하다 |
| 비용 | 스레드당 수 MB 스택 예약, 수천 개가 한계 | 프로세스 생성·직렬화 비용이 크다 | 코루틴당 수 KB. 수만 개 동시 연결 |
| 맞는 작업 | 블로킹 I/O 라이브러리(requests, DB 드라이버)를 그대로 쓰는 I/O 바운드 | **CPU 바운드**(계산, 이미지 처리) | 연결이 많은 I/O 바운드(웹 서버, 크롤러, 웹소켓) |
| 고수준 API | `concurrent.futures.ThreadPoolExecutor` | `ProcessPoolExecutor` | `asyncio.TaskGroup`, `gather` |

- I/O 바운드인데 쓰는 라이브러리가 동기식이면 스레드, 비동기 생태계(httpx, asyncpg, FastAPI)라면 asyncio를 고른다. CPU 바운드는 프로세스, 또는 GIL을 놓는 C 확장(NumPy)이나 free-threaded 빌드를 쓴다.
- 3.14의 `concurrent.futures.InterpreterPoolExecutor`는 같은 프로세스 안의 서브인터프리터들로 병렬 실행한다. 프로세스보다 가볍고, 인터프리터끼리 객체를 공유하지 않는다.

### asyncio와 비동기 프로그래밍

**asyncio는 이벤트 루프 하나가 여러 코루틴을 번갈아 실행하는 단일 스레드 비동기 프레임워크다.** 코루틴이 I/O를 기다리며 `await`하면 제어를 이벤트 루프에 돌려주고, 루프는 준비된 다른 코루틴을 이어 실행한다. OS의 `epoll`·`kqueue`로 어떤 소켓이 준비됐는지 알아낸다(Reactor 패턴, [[concurrency-models|동시성 모델]]).

```python
import asyncio, httpx

async def fetch(client, url):
    r = await client.get(url)          # 기다리는 동안 다른 코루틴이 돈다
    return r.status_code

async def main(urls):
    async with httpx.AsyncClient() as client:
        async with asyncio.TaskGroup() as tg:              # 3.11+: 하나가 실패하면 나머지를 취소
            tasks = [tg.create_task(fetch(client, u)) for u in urls]
    return [t.result() for t in tasks]

asyncio.run(main(["https://a.com", "https://b.com"]))
```

| 개념 | 뜻 |
| --- | --- |
| 코루틴 함수 `async def` | 호출하면 본문을 실행하지 않고 **코루틴 객체**를 돌려준다(제너레이터와 같다). `await`하거나 태스크로 감싸야 실행된다 |
| `await` | 어웨이터블(코루틴, 태스크, 퓨처)이 끝날 때까지 현재 코루틴을 멈추고 루프에 제어를 넘긴다 |
| 태스크 `create_task` | 코루틴을 루프에 등록해 **동시에** 진행시킨다. 그냥 `await coro()`를 차례로 쓰면 순차 실행이다 |
| `gather`, `TaskGroup` | 여러 태스크를 함께 기다린다. `TaskGroup`은 구조적 동시성을 따른다([[structured-concurrency\|구조적 동시성]]) |
| `asyncio.timeout()`, `wait_for` | 시간 제한과 취소(`CancelledError`) |

- **이벤트 루프를 막으면 모든 코루틴이 멈춘다.** `async def` 안에서 `time.sleep`, `requests.get`, 무거운 계산을 부르면 그 동안 다른 코루틴이 돌지 못한다. 블로킹 함수는 `await asyncio.to_thread(f)`나 `loop.run_in_executor`로 스레드·프로세스 풀에 넘긴다.
- 「함수 색깔」 문제: `async` 함수는 `async` 함수 안에서만 `await`할 수 있어 비동기가 호출 체인 전체로 번진다.
- 제너레이터의 `yield`·`send`가 코루틴의 뿌리이고, `async`/`await` 문법은 3.5에 들어왔다.

## 성능 최적화

순서는 **측정 → 알고리즘 → 구현 → 런타임 교체**다. 추측으로 최적화하지 않는다.

| 단계 | 방법 |
| --- | --- |
| 측정 | `cProfile`·`pstats`(함수별 시간), `timeit`(작은 코드 비교), `tracemalloc`(메모리), 샘플링 프로파일러 py-spy·Scalene(운영 중인 프로세스) |
| 알고리즘·자료구조 | 리스트 `in`(O(n)) 대신 `set`·`dict`(O(1)), `collections.deque`로 양끝 삽입, `heapq`, `bisect`. 대부분의 큰 개선이 여기서 나온다 |
| 내장과 표준 라이브러리 | 파이썬 반복문보다 C로 구현된 `sum`, `map`, `sorted`, `str.join`, `itertools`, 컴프리헨션이 빠르다. 문자열은 `+=` 대신 `"".join()` |
| 인터프리터 비용 줄이기 | 반복문 안의 속성·전역 조회를 지역 변수로 빼기, `__slots__`로 인스턴스 메모리와 속성 접근 줄이기, `functools.cache`로 메모이제이션 |
| 큰 데이터 | 제너레이터로 지연 처리, NumPy·pandas·Polars로 벡터화(반복을 C 수준으로 내린다) |
| 병렬화 | CPU 바운드는 `multiprocessing`·free-threaded 빌드, I/O 바운드는 asyncio·스레드 |
| 런타임·컴파일 | PyPy(아래), Cython·mypyc로 C 확장 컴파일, 뜨거운 부분만 Rust(PyO3)·C로 작성, Numba로 숫자 계산 JIT |

CPython 자체도 빨라지고 있다. 3.11의 적응형 특수화 인터프리터가 일반 코드를 평균 25% 안팎 빠르게 했으므로, 버전을 올리는 것도 저렴한 최적화다.

## 구현체: CPython, PyPy, Jython

Python은 언어 명세이고, 그것을 실행하는 프로그램(구현체)은 여럿이다. 같은 소스라도 구현체에 따라 실행 과정, GIL 여부, 쓸 수 있는 라이브러리가 다르다.

| 구현 | 실행 과정 | GIL | 메모리 관리 | 특징 |
| --- | --- | --- | --- | --- |
| CPython | 소스 → 바이트코드(`.pyc`) → C로 쓴 인터프리터가 해석. 3.11부터 자주 쓰는 연산을 타입에 맞게 바꾸는 적응형 인터프리터, 3.13부터 실험적 JIT | 있다. free-threaded 빌드(3.13 실험, 3.14부터 공식 지원)는 없다 | 참조 카운팅 + 순환 수집기 | 표준 구현. C 확장(NumPy 등) 생태계 전체를 쓴다 |
| PyPy | 소스 → 바이트코드 → **추적 JIT(tracing JIT)** 가 자주 도는 루프의 실제 경로를 기록해 기계어로 컴파일 | 있다 | 추적형 세대별 GC(참조 카운팅이 아니라 해제 시점이 늦다) | 순수 Python 루프가 많으면 몇 배 빠르다 |
| Jython | 소스 → **JVM 바이트코드** → JVM이 실행하고 HotSpot JIT가 컴파일 | **없다.** Python 스레드가 Java 스레드라 여러 코어에서 병렬로 돈다 | JVM GC | Java 클래스를 바로 import해 쓴다. C 확장은 못 쓰고, Python 2.7 문법까지만 지원한다 |

PyPy는 RPython(제약을 둔 Python)으로 인터프리터를 쓰고, RPython 툴체인이 그 인터프리터에 추적 JIT를 자동으로 붙여 C로 번역한다. 언어 규칙(인터프리터)과 최적화(JIT 생성기)를 분리한 구조라 다른 동적 언어 인터프리터에도 같은 툴체인을 쓸 수 있다. 메서드 단위로 컴파일하는 전통적 JIT와 달리 컴파일 단위가 루프 경로다. C 확장 호출이 많은 코드는 이득이 작거나 호환성 문제가 있다.

Jython에 GIL이 없는 이유는 객체 관리를 JVM에 맡기기 때문이다. CPython의 GIL은 참조 카운트와 인터프리터 내부 상태를 지키려고 있는데, Jython은 참조 카운팅을 하지 않고 JVM의 GC와 스레드 안전한 내부 자료구조를 쓴다. 대신 CPython C API에 묶인 라이브러리를 쓸 수 없고 Python 3를 따라가지 못해, JVM 위의 Python 3가 필요하면 GraalVM 기반의 GraalPy를 쓴다. .NET 위에서 도는 IronPython도 같은 구조로 GIL이 없다.

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
- CPU 바운드는 프로세스, 블로킹 I/O는 스레드, 연결이 많은 I/O는 asyncio. 이벤트 루프 안에서는 블로킹 호출을 하지 않는다
- 최적화는 프로파일링으로 병목을 찾은 뒤 자료구조와 내장 함수부터 바꾼다
- 구현체마다 실행 과정이 다르다. CPython은 바이트코드 인터프리터, PyPy는 추적 JIT, Jython은 JVM 바이트코드로 바꿔 GIL 없이 돈다
- 덕 타이핑은 타입보다 동작으로 판단하고, `Protocol`로 정적 검사를 더할 수 있다

관련 노트: [[python-language-basics|Python 언어 기본]], [[how-programs-run|프로그램이 실행되기까지]], [[structured-concurrency|구조적 동시성]], [[concurrency-models|동시성 모델]], [[iterators-and-generators|이터레이터와 제너레이터]], [[garbage-collection|가비지 컬렉션과 메모리 누수]], [[merge-quick-sort|병합 정렬과 퀵 정렬]]
