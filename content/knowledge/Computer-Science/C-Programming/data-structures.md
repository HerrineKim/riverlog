---
title: "기초 자료구조: 배열에서 트라이까지"
concept: "Data Structure"
summary: "CS50 자료구조 강의 정리: 배열과 크기 조정 비용, 연결 리스트, 이진 탐색 트리와 균형, 해시 테이블과 충돌, 트라이, 스택·큐·딕셔너리, 얕은 복사와 깊은 복사."
tags: ["data-structure", "cs50", "linked-list", "hash-table", "tree"]
source: notion
sources: ["https://app.notion.com/p/96b9122486a74f108954fde4677e727d"]
---

자료구조는 데이터를 메모리에 어떻게 배치하고 연결하느냐의 문제다. 배열처럼 연속된 공간을 쓰면 접근은 빠르지만 크기를 바꾸기 어렵고, [[pointers-and-memory|포인터]]로 흩어진 공간을 이으면 크기는 자유롭지만 접근이 느려진다. CS50의 자료구조 강의를 바탕으로, 스터디에서 Kotlin 예제로 정리한 내용을 함께 담았다.

## 배열 (Array)

- **고정된 크기의 메모리 덩어리**다. 원소들이 **이웃한 공간(contiguous memory)** 에 할당된다.
- 배열의 시작 주소(base address)는 첫 번째 원소가 있는 주소다. 인덱스로 위치를 바로 계산할 수 있어 **임의 접근(random access)** 이 O(1)이다.
- 정렬되어 있다면 이진 탐색으로 O(log n)에 찾을 수 있다.
- JVM에서 배열은 참조 타입이며 힙 영역에 할당된다. 선언과 메모리 할당이 분리된다.

```java
int intArray[];           // 선언
intArray = new int[10];   // 메모리 할당
```

### 크기를 늘리면 무슨 일이 생기나

연속된 공간 바로 뒤가 다른 데이터로 차 있을 수 있으므로, 원소 하나를 추가하려 해도

1. 더 큰 메모리 공간을 새로 할당하고
2. 기존 원소를 모두 복사한 뒤 새 원소를 넣어야 한다.

원소 n개를 읽고 쓰는 작업이 필요하므로 **O(n)** 이다.

## 연결 리스트 (Linked List)

원소를 연속된 곳에 두지 않고 **아무 빈 공간에 할당한 뒤, 다음 원소의 주소를 가리키게** 연결한다. 각 노드는 값과 다음 노드를 가리키는 포인터를 가진다.

```kotlin
class Node(val value: String, var next: Node? = null)

class MyList {
    private var head: Node? = null

    // 맨 끝에 노드 추가 — 끝까지 따라가야 하므로 O(n)
    fun add(value: String) {
        if (head == null) {
            head = Node(value)
            return
        }
        var temp = head
        while (temp?.next != null) temp = temp.next
        temp?.next = Node(value)
    }

    // prev 다음에 새 노드 끼워 넣기 — 포인터 두 개만 바꾸면 됨
    fun addAfter(prev: Node, value: String) {
        prev.next = Node(value, prev.next)
    }

    // 값으로 노드 찾기 — 처음부터 순회, O(n)
    fun search(value: String): Node? {
        var temp = head
        while (temp != null) {
            if (temp.value == value) return temp
            temp = temp.next
        }
        return null
    }
}
```

| 장점 | 단점 |
| --- | --- |
| 공간이 부족해도 더 큰 공간을 잡고 전부 복사할 필요 없이, 새 노드를 만들어 포인터만 연결하면 된다 | 임의 접근이 안 된다. 특정 위치를 찾으려면 처음부터 따라가야 하므로 **탐색 O(n)** |
| 중간 삽입·삭제 자체는 포인터 변경만으로 끝난다 | 순서를 지켜 삽입하려 해도 위치를 찾는 탐색 때문에 **O(n)** |
| | 포인터를 저장할 추가 메모리가 든다 |

## 트리와 이진 탐색 트리

연결 리스트를 응용해 **계층(hierarchical) 구조**를 만든 것이 트리다. 노드(vertex)와 간선(edge)으로 이루어진다.

**이진 탐색 트리(BST)** 는 자식을 최대 2개 가지며, 각 노드의 **왼쪽에는 더 작은 값, 오른쪽에는 더 큰 값**이 온다. 즉 이미 정렬된 상태로 저장하는 트리다.

- 매 단계마다 탐색 범위가 절반으로 줄어 탐색이 평균 **O(log n)** 이다.
- 같은 구조가 왼쪽·오른쪽 서브트리에 반복되므로 재귀로 다루기 좋다.

### 편향 트리와 균형 트리

- **편향(skewed) 트리**: 정렬된 순서로 값을 넣으면 한쪽으로만 자라 사실상 연결 리스트가 된다. 탐색이 O(n)인 최악의 경우다.
- **균형(balanced) 트리**: 삽입·삭제 때 높이를 제한해 한쪽으로 치우치지 않게 유지한다. AVL 트리, 레드-블랙 트리, B 트리, B+ 트리, B* 트리 등이 있다.

## 해시 테이블 (Hash Table)

**배열과 연결 리스트를 조합**한 구조다.

1. 키를 **해시 함수**에 넣으면 정수(해시값)가 나온다.
2. 이 값을 정해진 크기의 배열(버킷, bucket)의 인덱스로 써서 바로 그 칸을 찾는다.

그래서 평균 탐색 시간이 **O(1)** 이다.

### 해시 충돌 (Collision)

서로 다른 키가 같은 해시값을 가지면 충돌이 생긴다. 같은 칸에 들어온 값들을 **연결 리스트로 이어 붙여**(체이닝) 해결한다.

- 특정 칸에만 데이터가 몰리면 그 리스트를 순회해야 하므로 최악의 경우 **O(n)** 이 된다.
- 충돌을 줄이려면 값을 고르게 분산하는 좋은 해시 함수를 쓰거나 버킷 수를 늘린다.

## 트라이 (Trie)

문자열 검색에 특화된 트리다. 알파벳이라면 각 노드가 a~z 26칸짜리 배열을 갖고, 각 칸이 다음 글자의 노드를 가리킨다.

- "Harry"를 찾으려면 H → a → r → r → y 다섯 단계면 된다.
- 탐색 시간은 저장된 단어 수가 아니라 **찾는 단어의 길이 k**에 비례한다(O(k)). 단어 길이에는 현실적인 상한이 있으므로 사실상 **O(1)** 로 볼 수 있다.
- 대신 노드마다 26칸 배열을 두므로 **메모리를 많이 쓴다.** 시간과 공간의 트레이드오프다.

## 스택, 큐, 딕셔너리

| 자료구조 | 특징 | 연산 | 예 |
| --- | --- | --- | --- |
| 스택 (Stack) | LIFO(Last In First Out) | `push`(top에 넣기), `pop`(top에서 꺼내기) | 최신 메일이 맨 위에 오는 메일함 |
| 큐 (Queue) | FIFO(First In First Out) | `enqueue`(넣기), `dequeue`(꺼내기) | 식당 대기 줄, 공용 프린터 출력 대기 |
| 딕셔너리 (Dictionary) | key–value 쌍 | 키로 값 조회 | 단어와 뜻이 짝지어진 사전. Java·Kotlin에서는 `Map` |

스택과 큐의 구현과 활용은 [[stack|스택]], [[queue-deque|큐와 덱]]에 더 자세히 정리했다.

## 얕은 복사와 깊은 복사

C에서 `char *t = s;`가 문자열이 아니라 **주소만 복사**하는 것과 같은 문제가 객체에서도 생긴다.

| 구분 | 동작 | 결과 |
| --- | --- | --- |
| 얕은 복사 (Shallow Copy) | 원본 객체의 **주소**를 그대로 참조 | 같은 메모리를 가리키므로 한쪽을 바꾸면 다른 쪽도 바뀜 |
| 깊은 복사 (Deep Copy) | 원본의 **값**을 새 메모리 공간에 복사 | 서로 독립적 |

```kotlin
class AnyObject(var name: String)

val a = AnyObject("Jimin")
val b = a               // 얕은 복사: 같은 객체
b.name = "SUGA"
println(a === b)        // true  (===는 참조 비교)
println(a.name)         // SUGA
```

Kotlin에서 깊은 복사를 하는 방법:

- **data class의 `copy()`**: data class는 `toString()`, `hashCode()`, `equals()`, `copy()`를 자동으로 가진다. `copy()`는 새 객체를 만든다.
- **`Cloneable` 구현**: `clone()`을 오버라이드한다. 단, `super.clone()`은 필드를 그대로 복사하므로 **필드가 리스트 같은 참조 타입이면 그 리스트는 여전히 공유된다.** 이런 필드는 `clone()` 안에서 새 리스트로 복사해 줘야 진짜 깊은 복사가 된다.

```kotlin
class AnyObject(var name: String, var list: MutableList<Int>) : Cloneable {
    public override fun clone(): AnyObject {
        val copied = super.clone() as AnyObject
        copied.list = list.toMutableList()   // 리스트도 새로 복사
        return copied
    }
}
```

## 참고: JVM 메모리 영역

| 영역 | 내용 |
| --- | --- |
| Heap | 객체(배열 포함)가 저장되는 곳. JVM 시작 시 생성되어 실행 중 커지거나 줄고, 쓰지 않는 객체는 GC가 회수 |
| Stack | 스레드마다 있는 LIFO 구조. 메서드 호출 정보와 지역 변수 저장 |
| PC Register | 현재 실행 중인 명령어의 위치를 추적 |
| Native Method Stack | C 같은 자바 외 언어로 구현된 네이티브 메서드를 호출할 때 사용 |
| Execution Engine | 바이트코드를 실제로 실행하는 JVM의 핵심 구성 요소 |

## 핵심 정리

| 자료구조 | 탐색 | 삽입 | 특징 |
| --- | --- | --- | --- |
| 배열 | O(1) 접근 / 정렬 시 O(log n) 탐색 | 크기 조정 시 O(n) | 연속 메모리 |
| 연결 리스트 | O(n) | 위치를 알면 O(1), 찾으려면 O(n) | 포인터로 연결 |
| 이진 탐색 트리 | 평균 O(log n), 편향 시 O(n) | 평균 O(log n) | 균형 유지가 관건 |
| 해시 테이블 | 평균 O(1), 최악 O(n) | 평균 O(1) | 해시 함수 + 충돌 처리 |
| 트라이 | O(k) ≈ O(1) | O(k) | 메모리를 많이 씀 |
