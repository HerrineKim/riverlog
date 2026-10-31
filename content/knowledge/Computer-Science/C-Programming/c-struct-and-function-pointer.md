---
title: "C 사용자 정의 타입과 함수 포인터: 구조체, 공용체, 열거형, typedef"
concept: "Struct and Function Pointer"
summary: "C의 사용자 정의 타입(구조체, 공용체, 열거형, typedef)과 함수 포인터를 정리한다. 구조체의 메모리 배치와 패딩, 멤버가 한 메모리를 공유하는 공용체와 태그 공용체·타입 퍼닝, int 상수일 뿐인 열거형, 새 타입이 아니라 별명인 typedef, 함수 포인터와 콜백, 그리고 이들을 조합해 캡슐화·다형성·제네릭 컨테이너를 흉내 내는 불투명 포인터와 가상 함수 테이블 패턴."
tags: ["c", "oop", "pointer", "data-structure", "struct", "type"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/65cbd691258f411289c7305fd6b30922", "https://80000coding.notion.site/892137b4b3b44cf180f1f04ed7a7eed2", "https://80000coding.notion.site/107bc2ff145e427b9bd076b015908916", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/architecture.md", "고려사이버대학교 프로그래밍 기초와 실습(C언어) 강의(권오상 교수, 2024-2학기)"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「C에서 시작하는 객체생활.」, 「[C] 구조체 개념 정리 및 연결 리스트 구현」, 「atexit을 활용해 누수 확인하기」를 바탕으로 재구성한 노트다.
> 정렬이 성능과 정확성에 주는 영향 부분은 fru1tworld/cs-basic 모의 면접 질문 목록을 점검해 빠진 개념을 보강했다.
> 공용체, 열거형, typedef는 고려사이버대학교 「프로그래밍 기초와 실습(C언어)」(2024-2학기) 강의 내용으로 보강했다.

## 사용자 정의 타입 네 가지

| 종류 | 키워드 | 하는 일 |
| --- | --- | --- |
| 구조체 | `struct` | 서로 다른 타입의 값을 **모두 함께** 묶는다 |
| 공용체 | `union` | 서로 다른 타입 중 **하나를** 같은 자리에 담는다 |
| 열거형 | `enum` | 가능한 값의 목록에 이름을 붙인다 |
| 별명 | `typedef` | 기존 타입에 다른 이름을 붙인다 |

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

구조체 대입(`a = b`)은 멤버 전체를 복사하고, 함수에 구조체를 값으로 넘기면 통째로 복사된다. 큰 구조체는 포인터(`const t_point *`)로 넘긴다. 비교 연산자(`==`)는 구조체·공용체에 쓸 수 없으므로 멤버를 하나씩 비교하는 함수를 만든다(패딩 때문에 `memcmp`도 위험하다).

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

## 공용체

**공용체(union)는 모든 멤버가 같은 시작 주소의 메모리를 함께 쓰는 타입**이다. 서로 다른 타입 중 하나를 같은 자리에 담는다.

```c
union number {
    int    i;
    double d;
    char   bytes[8];
};
```

| | 구조체 | 공용체 |
| --- | --- | --- |
| 멤버의 메모리 | 각자 다른 위치 | 모두 같은 시작 주소 |
| 크기 | 멤버 크기의 합 + 패딩 | 가장 큰 멤버 크기 + 정렬용 패딩 |
| 동시에 유효한 멤버 | 전부 | 마지막에 쓴 하나 |

`d`에 쓰고 `i`를 읽으면 `double`의 바이트 일부를 `int`로 해석한 값이 나온다. **공용체는 지금 어느 멤버가 들어 있는지 기억하지 않는다.** 그것은 프로그래머의 몫이다.

### 태그 공용체

그래서 공용체는 어느 멤버가 유효한지 나타내는 열거형 태그와 함께 구조체로 감싸 쓴다. 이를 태그 공용체(tagged union) 또는 판별 공용체라 한다.

```c
enum shape_kind { SHAPE_CIRCLE, SHAPE_RECT };

struct shape {
    enum shape_kind kind;          /* 태그: 아래 union에서 어느 쪽이 유효한가 */
    union {
        struct { double r; } circle;
        struct { double w, h; } rect;
    };                              /* 이름 없는 공용체 (C11) */
};

double area(const struct shape *s) {
    switch (s->kind) {
    case SHAPE_CIRCLE: return 3.14159 * s->circle.r * s->circle.r;
    case SHAPE_RECT:   return s->rect.w * s->rect.h;
    }
    return 0;
}
```

- 도형, JSON 값, 토큰, 메시지처럼 여러 종류 중 하나인 값을 한 타입으로 표현하면서 메모리는 가장 큰 경우만큼만 쓴다.
- 타입 이론의 **합 타입(sum type)**이다. Rust의 `enum`, Swift의 연관 값 `enum`, TypeScript의 판별 유니온, C++의 `std::variant`는 태그 확인을 언어나 라이브러리가 강제하지만, C에서는 태그와 내용이 어긋나도 아무도 막지 않는다([[type-systems|타입 시스템]]).

### 타입 퍼닝

공용체로 같은 바이트를 다른 타입으로 읽는 것을 타입 퍼닝(type punning)이라 한다. C는 이를 허용하고 바이트를 새 타입으로 재해석한다고 정한다. 바이트 순서 확인이 대표 예다.

```c
union { uint32_t word; uint8_t byte[4]; } probe = { .word = 1 };
int little_endian = (probe.byte[0] == 1);
```

C++에서는 마지막에 쓰지 않은 멤버를 읽는 것이 미정의 동작이라 `memcpy`나 C++20 `std::bit_cast`를 쓴다. 바이트 순서 자체는 [[data-representation|데이터 표현]]에 있다.

## 열거형

```c
enum weekday { MON = 1, TUE, WED, THU, FRI, SAT, SUN };   /* TUE = 2, WED = 3, ... */
enum weekday today = WED;
```

- 값을 주지 않으면 0부터 시작하고 이후 상수는 앞 값 + 1이다. 중간에 값을 정하면 거기서부터 다시 1씩 는다.
- **열거 상수는 그냥 `int` 상수다.** 타입 검사가 약해 `enum weekday d = 42;`도, 다른 열거형끼리 섞는 것도 컴파일된다.
- 그래도 정수를 바로 쓰는 것보다 낫다. 이름이 의미를 설명하고, 디버거가 이름을 보여 주며, `switch`에서 빠진 경우를 `-Wswitch`(`-Wall`에 포함)가 경고한다. `default`를 두면 이 경고가 꺼지므로 모든 경우를 다루는 `switch`에는 `default`를 두지 않는 편이 낫다.
- C23부터 `enum color : uint8_t { ... }`처럼 바탕 타입을 정할 수 있다. C++의 `enum class`는 정수로 암묵 변환되지 않고 이름이 열거형 범위에 갇히는 타입 안전한 열거형이다.

| 상수 정의 방법 | 장단점 |
| --- | --- |
| 정수 리터럴 직접 사용 | 의미를 알 수 없는 매직 넘버 |
| `#define LCD 1` | 전처리기 치환이라 컴파일러와 디버거가 이름을 모른다 |
| `enum tv { LCD, OLED };` | 관련 상수를 묶고 번호를 자동으로 매긴다. 배열 크기, `case`처럼 정수 상수가 필요한 곳에 쓸 수 있다 |

기호 상수를 고르는 기준은 [[c-scope-and-linkage|C의 스코프와 링키지]]에 더 있다.

## typedef

`typedef`는 **새 타입을 만들지 않고 기존 타입에 별명을 붙인다.** 별명과 원래 타입은 완전히 같은 타입이라 섞어 써도 컴파일러가 구분하지 않는다.

| 쓰임 | 예 |
| --- | --- |
| 구조체·공용체 이름 줄이기 | 위의 `typedef struct s_point { ... } t_point;` |
| 복잡한 선언 읽기 쉽게 | 아래 함수 포인터 타입 `t_binop` |
| 플랫폼 독립 타입 | `size_t`, `uint32_t`, `pid_t`처럼 플랫폼마다 실제 타입이 다른 것을 한 이름으로 |
| 불투명 타입 | 헤더에는 `typedef struct s_vec t_vec;`만 두고 정의는 숨긴다 (아래 「C로 객체 흉내 내기」) |

- 포인터를 `typedef`로 숨기면(`typedef struct node *node_ptr;`) 변수가 포인터라는 사실이 안 보이고, `const node_ptr`이 "대상이 const"가 아니라 "포인터가 const"가 되는 혼란이 생긴다. 불투명 핸들이 아니면 `*`를 드러내 쓴다.
- `_t`로 끝나는 이름은 POSIX가 예약해 두었다. 42 스타일의 `t_` 접두사처럼 자기 타입에는 `_t` 접미사를 피하는 규칙이 여기서 나왔다.
- 진짜 다른 타입이 필요하면(미터와 피트를 섞지 못하게) 멤버 하나짜리 구조체로 감싼다. `typedef double meter;`로는 막을 수 없다.

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

- 구조체는 데이터를 묶고, 패딩 때문에 멤버 순서가 크기에 영향을 준다. 대입은 되지만 `==` 비교는 안 된다.
- 공용체는 멤버가 한 메모리를 공유하고 지금 어느 멤버인지 기억하지 않으므로, 태그 열거형과 함께 태그 공용체(합 타입)로 쓴다.
- 열거 상수는 `int` 상수다. 타입 검사는 약하지만 이름과 `-Wswitch` 경고를 얻는다. `typedef`는 별명일 뿐 새 타입이 아니고, 포인터는 숨기지 않는다.
- 함수 포인터는 실행 중에 부를 함수를 고르게 해 준다. 콜백과 디스패치 테이블이 대표적이다.
- 불투명 포인터 + 생성·해제 함수로 캡슐화하고, `void *` + 원소 크기로 제네릭을 만든다.
- 타입마다 동작이 다를 때만 가상 함수 테이블 패턴을 쓴다.

관련 노트: [[pointers-and-memory|포인터와 메모리]], [[data-structures|기초 자료구조]], [[oop-messaging|객체 지향의 본질: 메시징]], [[c-scope-and-linkage|C의 스코프와 링키지]], [[type-systems|타입 시스템]], [[cpp-basics|C++ 기초]]
