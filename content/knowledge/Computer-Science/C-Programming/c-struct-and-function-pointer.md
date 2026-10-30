---
title: "구조체와 함수 포인터"
concept: "Struct and Function Pointer"
summary: "C에는 클래스가 없지만 구조체, 함수 포인터, void 포인터, 불투명 포인터를 조합하면 캡슐화·다형성·제네릭 컨테이너를 흉내 낼 수 있다. 구조체 기초와 메모리 배치, 함수 포인터 문법과 콜백, 생성자·소멸자 함수와 가상 함수 테이블 패턴을 정리한다."
tags: ["c", "oop", "pointer", "data-structure", "struct"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/65cbd691258f411289c7305fd6b30922", "https://80000coding.notion.site/892137b4b3b44cf180f1f04ed7a7eed2", "https://80000coding.notion.site/107bc2ff145e427b9bd076b015908916", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/architecture.md"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「C에서 시작하는 객체생활.」, 「[C] 구조체 개념 정리 및 연결 리스트 구현」, 「atexit을 활용해 누수 확인하기」를 바탕으로 재구성한 노트다.
> 정렬이 성능과 정확성에 주는 영향 부분은 fru1tworld/cs-basic 모의 면접 질문 목록을 점검해 빠진 개념을 보강했다.

## 구조체

**구조체(struct)**는 서로 다른 타입의 값을 하나로 묶은 사용자 정의 타입이다. 관련 있는 데이터를 함께 다루게 해 주는, C에서 가장 기본적인 추상화 도구다.

```c
typedef struct s_point {
    int x;
    int y;
} t_point;

t_point p = { .x = 1, .y = 2 };   /* C99 지정 초기화자 */
t_point *pp = &p;
pp->x = 10;                       /* (*pp).x 와 같음 */
```

구조체 대입(`a = b`)은 멤버 전체를 복사하고, 함수에 구조체를 값으로 넘기면 통째로 복사된다. 큰 구조체는 포인터(`const t_point *`)로 넘긴다. 비교 연산자(`==`)는 구조체에 쓸 수 없다.

### 메모리 배치와 패딩

컴파일러는 각 멤버를 그 타입의 **정렬(alignment)** 경계에 맞추려고 멤버 사이와 끝에 빈 바이트(패딩)를 넣는다.

```text
struct { char c; int i; char d; }     → c ___ iiii d ___   = 12바이트
struct { int i; char c; char d; }     → iiii c d __       =  8바이트
```

정렬을 맞추는 이유는 성능과 정확성이다.

| 정렬이 어긋나면 | 결과 |
| --- | --- |
| 값 하나가 캐시 라인·페이지 경계에 걸친다 | 한 번에 읽을 값을 두 라인(최악은 두 페이지)에서 읽어 합쳐야 해 느려진다. x86은 처리해 주지만 비용이 든다 |
| 정렬을 요구하는 아키텍처 | 일부 RISC CPU와 SIMD 정렬 load 명령(`_mm_load_ps`)은 예외(`SIGBUS`)를 낸다 |
| 원자 연산 | 원자성은 자연 정렬된 값에만 보장된다. x86에서 캐시 라인에 걸친 `lock` 명령은 버스 전체를 잠그는 split lock이 되어 다른 코어까지 느려진다 |

그래서 `malloc`은 어떤 기본 타입에도 맞게 정렬된 주소(64비트 시스템에서 보통 16바이트)를 돌려주고, 더 큰 정렬이 필요하면 C11 `aligned_alloc`과 `alignas`를 쓴다. 스레드마다 쓰는 데이터를 캐시 라인 단위로 떼어 거짓 공유를 막는 것도 같은 도구로 한다([[cache-friendly-code|캐시를 고려한 코드]]).

멤버를 큰 타입부터 나열하면 크기가 줄어든다. 패딩 때문에 구조체를 `memcmp`로 비교하거나 파일·네트워크에 그대로 쓰면 안 된다. 멤버의 위치는 `offsetof(type, member)`로 확인한다. `struct`, 멤버, 변수 이름이 서로 충돌하지 않는 이유는 [[c-scope-and-linkage|C의 스코프와 링키지]]의 이름 공간 부분에 있다.

### 자기 참조 구조체

구조체는 자신의 타입을 가리키는 포인터를 멤버로 가질 수 있다. 연결 리스트·트리의 노드가 이렇게 만들어진다. 구현은 [[data-structures|기초 자료구조]]에 있다.

```c
typedef struct s_list {
    void          *content;
    struct s_list *next;    /* 아직 typedef 이름 t_list가 없으므로 struct 태그로 */
} t_list;
```

## 함수 포인터

함수도 메모리의 코드 영역에 있는 주소를 가지며, 그 주소를 담는 변수가 **함수 포인터**다. 어떤 함수를 부를지 실행 중에 정할 수 있게 해 준다.

```c
int  add(int a, int b) { return a + b; }
int  (*op)(int, int) = add;     /* 반환형 (*이름)(매개변수 타입) */
op(1, 2);                        /* 3 */

typedef int (*t_binop)(int, int);  /* typedef로 읽기 쉽게 */
t_binop ops[] = { add, sub, mul };  /* 함수 포인터 배열: 디스패치 테이블 */
```

가장 흔한 쓰임은 **콜백(callback)**이다. 라이브러리가 "무엇을 할지"를 호출한 쪽에 맡긴다.

| 예 | 콜백이 하는 일 |
| --- | --- |
| `qsort(base, n, size, cmp)` | 두 원소의 순서 비교 |
| `atexit(func)` | 프로그램이 정상 종료될 때 실행할 정리 작업 (어느 경로의 `exit`든 실행) |
| `signal(SIGINT, handler)` | 시그널을 받았을 때의 처리 |
| `pthread_create(&t, NULL, routine, arg)` | 새 스레드가 실행할 함수 |
| `ft_lstiter(lst, f)`, `ft_lstclear(&lst, del)` | 리스트 각 원소에 적용할 함수, 원소 내용을 해제하는 함수 |

## C로 객체 흉내 내기

객체 지향은 언어 기능이 아니라 설계 방식이다. C++의 클래스가 컴파일러 차원에서 해 주는 일을 C에서는 직접 쓴다.

| C++ 기능 | C에서의 대응 |
| --- | --- |
| 멤버 변수 | 구조체 멤버 |
| 멤버 함수 | 구조체를 첫 인자로 받는 함수 (`this`를 명시적으로 넘김) |
| `private` | 불투명 포인터: 헤더에는 `typedef struct s_vec t_vec;`만 두고 정의는 `.c` 파일 안에 숨김 |
| 생성자·소멸자 | `vec_new()`·`vec_free()` 함수. 호출을 잊지 않는 것은 프로그래머 몫 |
| 템플릿 | `void *`와 원소 크기(`size_t elem_size`)를 받는 제네릭 구현 |
| 가상 함수 | 함수 포인터를 모은 구조체(가상 함수 테이블)를 객체가 가리킴 |

```c
/* vec.h: 사용자는 내부 구조를 모른다 */
typedef struct s_vec t_vec;
t_vec *vec_new(size_t elem_size, void (*del)(void *));
int    vec_push(t_vec *v, const void *elem);
void  *vec_at(t_vec *v, size_t i);
void   vec_free(t_vec *v);   /* 각 원소에 del을 호출한 뒤 버퍼 해제 */

/* vec.c */
struct s_vec {
    void   *buf;
    size_t  size;
    size_t  capacity;
    size_t  elem_size;
    void  (*del)(void *);    /* 원소의 소멸자 역할 */
};
```

메서드를 함수 포인터 멤버로 구조체마다 넣어 `v->push(v, x)`처럼 부르는 방식도 가능하다. 하지만 객체마다 포인터 여러 개를 들고 다니고 초기화를 빠뜨리기 쉽다. 같은 타입끼리 동작이 같다면 일반 함수(`vec_push(v, x)`)가 낫고, **타입마다 동작이 달라야 할 때만** 함수 포인터를 쓴다. 이때도 포인터 묶음을 정적 테이블 하나로 공유한다.

```c
struct s_shape_vtable {
    double (*area)(const void *self);
    void   (*destroy)(void *self);
};
struct s_shape { const struct s_shape_vtable *vt; };  /* 각 도형 구조체의 첫 멤버 */

double shape_area(const struct s_shape *s) { return s->vt->area(s); }
```

리눅스 커널의 `struct file_operations`, 표준 입출력의 `FILE`(불투명 포인터)이 이 패턴의 대표 사례다.

C에는 자동 소멸자가 없어서, 오류 처리 경로마다 해제를 빠뜨리는 것이 가장 흔한 버그다. 함수 끝에 정리 코드를 한곳에 모으고 `goto cleanup;`으로 보내는 관용구가 널리 쓰인다. 객체 지향의 본질에 대한 논의는 [[oop-messaging|객체 지향의 본질: 메시징]]에 있다.

## 정리

- 구조체는 데이터를 묶고, 패딩 때문에 멤버 순서가 크기에 영향을 준다.
- 함수 포인터는 실행 중에 부를 함수를 고르게 해 준다. 콜백과 디스패치 테이블이 대표적이다.
- 불투명 포인터 + 생성·해제 함수로 캡슐화하고, `void *` + 원소 크기로 제네릭을 만든다.
- 타입마다 동작이 다를 때만 가상 함수 테이블 패턴을 쓴다.

관련 노트: [[pointers-and-memory|포인터와 메모리]], [[data-structures|기초 자료구조]], [[oop-messaging|객체 지향의 본질: 메시징]], [[c-scope-and-linkage|C의 스코프와 링키지]]
