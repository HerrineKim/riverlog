---
title: "메모리 풀"
concept: "Memory Pool"
summary: "같은 크기의 객체를 자주 할당·해제할 때 큰 블록을 미리 잡아 두고 한 칸씩 나눠 주는 메모리 풀을 정리한다. 고정 크기 풀은 빈 칸 인덱스 스택 하나로 할당과 해제를 O(1)에 끝내고, 가변 풀은 고정 풀을 청크로 이어 붙인다. 클래스의 operator new/delete를 오버로딩하면 호출 코드를 바꾸지 않고 풀을 쓸 수 있다."
tags: ["cpp", "memory", "performance", "c", "os"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/5074d6c4b3244e919a2bbce03f85cf59", "https://en.cppreference.com/w/cpp/memory/new/operator_new"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「메모리 풀, malloc()보다 100배 빠르다!」를 바탕으로 재구성한 노트다.

## 메모리 풀이란

메모리 풀(memory pool)은 **큰 메모리 덩어리를 한 번에 확보해 두고, 할당 요청이 오면 그 안에서 미리 정한 크기의 칸을 떼어 주는** 할당 방식이다. `node`를 자주 만들고 지운다면 `node[1000]`만큼 한 번에 잡아 두고 한 칸씩 빌려주는 식이다.

## 왜 malloc이 느린가

`malloc`/`free`(그리고 그 위의 `new`/`delete`)는 **어떤 크기의 요청이든** 처리해야 하는 범용 할당기다.

| 비용 | 내용 |
| --- | --- |
| 빈 공간 탐색 | 크기별 free list나 bin에서 맞는 블록을 찾는다 |
| 분할과 병합 | 큰 블록을 쪼개 주고, 해제된 이웃 블록을 다시 합친다 |
| 메타데이터 | 블록마다 크기·상태 헤더를 둔다 |
| 스레드 동기화 | 여러 스레드가 같은 힙을 쓰면 잠금이나 스레드별 캐시가 필요하다 |
| 시스템 콜 | 힙이 모자랄 때만 `brk`/`mmap`으로 OS에 요청한다. 매 호출이 시스템 콜은 아니다 |

크기가 하나로 정해진 풀은 탐색·분할·병합이 필요 없어 이 비용 대부분이 사라진다. 할당 패턴과 크기에 따라 수 배에서 수십 배 빨라지며, 같은 종류의 객체가 연속 메모리에 모여 **캐시 지역성**도 좋아진다.

## 고정 크기 풀

```text
storage:     [ 0 ][ 1 ][ 2 ][ 3 ][ 4 ] ...   ← 같은 크기 칸들
free_index:  [ 4, 3, 2, 1, 0 ]  top = 5       ← 비어 있는 칸 번호 스택

alloc(): return &storage[free_index[--top]]
free(p): free_index[top++] = (p - storage)
```

빈 칸 번호를 스택에 쌓아 두면 할당과 해제가 각각 **한 줄, O(1)**이다. 빈 칸 자체에 다음 빈 칸의 주소를 적어 두는 **free list** 방식을 쓰면 별도 인덱스 배열도 필요 없다.

```cpp
template <typename T, size_t N>
class FixedPool {
    alignas(T) unsigned char storage[N * sizeof(T)];
    size_t freeIndex[N];
    size_t top = N;
public:
    FixedPool() { for (size_t i = 0; i < N; ++i) freeIndex[i] = N - 1 - i; }
    void* allocate()        { assert(top > 0); return storage + freeIndex[--top] * sizeof(T); }
    void  deallocate(void* p) {
        freeIndex[top++] = (static_cast<unsigned char*>(p) - storage) / sizeof(T);
    }
};
```

- `assert`는 디버그 빌드에서만 검사하고 릴리스 빌드에서는 사라지므로 정상 경로 비용이 없다.
- 이 풀은 생 메모리만 돌려준다. 객체는 placement new(`new (p) T(...)`)로 생성하고, 반납 전에 소멸자를 직접 불러야 한다.

## 가변 풀: 고정 풀을 청크로 잇기

고정 풀의 한계는 **용량이 처음에 정해진다**는 것이다. 최대 사용량을 아는 프로그램이면 충분하지만, 모르면 풀이 꽉 찬 순간 할당이 실패한다.

```text
VariablePool
 ├─ chunk 0: FixedPool  (가득 참)
 ├─ chunk 1: FixedPool  (빈 칸 있음) ← 여기서 할당
 └─ 모두 가득 차면 chunk 2를 새로 malloc해 목록에 추가

블록 = [ chunk 번호 | 데이터 ]   ← 해제 시 앞쪽 헤더를 읽어 어느 청크로 돌려줄지 안다
```

각 블록 앞에 출신 청크 번호를 붙여 두면 `free`할 때 주소 몇 바이트 앞만 읽어 올바른 청크로 돌려보낼 수 있다.

## operator new/delete 오버로딩

풀을 직접 호출하게 하면 실수하기 쉽다. 클래스에 `operator new`/`operator delete`를 정의하면 **평소처럼 `new`/`delete`만 써도** 그 클래스는 풀을 쓴다.

```cpp
struct MsgBlock {
    char msg[512];
    static void* operator new(size_t)    { return pool.allocate(); }
    static void  operator delete(void* p) { pool.deallocate(p); }
private:
    static FixedPool<MsgBlock, 4096> pool;
};

MsgBlock* m = new MsgBlock;   // 풀에서 할당
delete m;                     // 풀로 반납
```

클래스마다 전용 힙을 두면 다른 스레드와 잠금을 나눌 일이 없고, 메모리 누수나 손상이 어느 클래스에서 났는지 추적하기도 쉽다.

## 쓰임새와 주의점

| 쓰임새 | 이유 |
| --- | --- |
| 네트워크 서버의 메시지 버퍼 | 같은 크기 버퍼가 초당 수천 번 생기고 사라진다. 버퍼를 연속 페이지에 모으면 잠금(pinning)할 페이지 수도 줄어든다 |
| 게임의 총알·파티클 | 프레임마다 생성·파괴가 반복된다. 객체 자체를 재사용하는 **오브젝트 풀 패턴**도 같은 발상이다 |
| 파서·컴파일러의 AST 노드 | 한꺼번에 만들고 한꺼번에 버리는 **아레나(arena)** 할당이 잘 맞는다 |

- 풀은 크기와 수명이 비슷한 객체에만 이득이다. 크기가 제각각이면 범용 할당기가 낫다.
- 풀을 여러 스레드가 공유하면 잠금이 다시 필요하다. 스레드별 풀을 두는 편이 단순하다.
- 범용 할당기도 발전했다. glibc의 스레드별 캐시(tcache), jemalloc·mimalloc 같은 할당기가 작은 객체 할당을 이미 빠르게 처리하므로, 풀을 만들기 전에 프로파일러로 할당이 병목인지 확인한다.
- C++17의 `std::pmr`(polymorphic memory resource)은 `monotonic_buffer_resource`, `unsynchronized_pool_resource` 같은 풀을 표준으로 제공해 컨테이너에 바로 꽂아 쓸 수 있다.

## 정리

- 메모리 풀은 큰 블록을 미리 잡아 두고 고정 크기 칸을 빌려주는 방식이다.
- 범용 할당기의 탐색·분할·병합·잠금 비용을 없애 할당·해제를 O(1)로 만든다.
- 용량이 고정되는 한계는 고정 풀을 청크로 잇는 가변 풀로 푼다.
- `operator new`/`delete` 오버로딩이나 `std::pmr`로 호출 코드를 바꾸지 않고 풀을 붙인다.
- 만들기 전에 할당이 정말 병목인지 측정한다.

관련 노트: [[pointers-and-memory|포인터와 메모리]], [[memory-management|메모리 관리]], [[cpp-stl-containers|C++ STL 컨테이너와 시간 복잡도]]
