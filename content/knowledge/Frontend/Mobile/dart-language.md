---
title: "Dart 핵심 문법: final과 const, 널 안전성, Future와 Stream"
concept: "Dart"
summary: "Flutter의 언어 Dart에서 처음 헷갈리는 세 가지. 런타임 상수 final과 컴파일 타임 상수 const, 타입에 ?를 붙여야만 null을 허용하는 건전한 널 안전성, 값 하나를 기다리는 Future와 여러 값을 흘려보내는 Stream·제너레이터(async*, sync*, yield)를 정리한다."
tags: ["mobile", "flutter", "dart", "async"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/9fa8948af7f745189515ba6301c67c28", "https://80000coding.notion.site/7cd69c275cf1420dbe661c8dac21fb1f", "https://80000coding.notion.site/fb62fce7ee32488fb42a057cb438019c", "https://dart.dev/null-safety", "https://dart.dev/libraries/async/async-await"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[Flutter] const vs final」, 「Null safety 라는게 뭐지?」, 「Asynchronous programming in Dart」를 바탕으로 재구성한 노트다.

**Dart**는 Google이 만든 객체 지향 언어로, [[flutter-architecture|Flutter]]의 앱 코드를 쓰는 언어다. 문법은 Java·JavaScript와 비슷해 다른 언어를 써 봤다면 금방 읽힌다. 처음 걸리는 지점은 대개 상수 선언, null 처리, 비동기 세 가지다.

## final과 const

둘 다 **한 번 대입하면 바꿀 수 없다.** 차이는 값이 정해지는 시점이다.

| 키워드 | 값이 정해지는 때 | 예 |
| --- | --- | --- |
| `final` | **런타임**. 실행 중에 계산된 값도 담을 수 있다 | `final now = DateTime.now();` |
| `const` | **컴파일 타임**. 빌드할 때 이미 알 수 있는 값만 된다 | `const pi = 3.14;` |

```dart
final createdAt = DateTime.now(); // OK: 실행할 때 정해진다
const limit = 10;                 // OK: 리터럴
const now = DateTime.now();       // 오류: 컴파일 타임에 알 수 없다
```

`const`가 따로 있는 이유는 **최적화**다. `const` 값과 `const` 생성자로 만든 객체는 컴파일 때 한 번만 만들어지고, 같은 값이면 같은 인스턴스를 공유한다. Flutter에서 화면이 다시 빌드될 때 `const Text('제목')` 같은 위젯은 새로 만들지 않고 재사용되므로, 바뀌지 않는 위젯에는 `const`를 붙이는 것이 관례다. 린트 규칙 `prefer_const_constructors`가 이것을 권한다.

## 널 안전성(Null safety)

null은 "값이 없음"이다. null인 변수를 값이 있는 것처럼 쓰면 실행 중에 오류가 난다. 조회 결과가 비었거나, 초기화를 빠뜨렸거나, null 검사를 잊은 경우가 대표적이다. 이런 오류는 개발 중보다 운영 중에 터지기 쉽다.

Dart는 **건전한 널 안전성(sound null safety)** 으로 이 문제를 컴파일 단계로 끌어온다. Dart 2.12에서 도입되었고, **Dart 3부터는 끌 수 없는 기본값**이다.

| 표기 | 의미 |
| --- | --- |
| `String` | null이 될 수 없다. null을 넣으면 정적 분석에서 오류 |
| `String?` | null이 될 수 있다(nullable). 쓰기 전에 null인지 확인해야 한다 |
| `value!` | "여기서는 null이 아니다"라고 단언한다. 틀리면 런타임 오류 |
| `value ?? '기본값'` | null이면 오른쪽 값을 쓴다 |
| `user?.name` | user가 null이면 접근하지 않고 null을 돌려준다 |
| `late` | 선언과 초기화를 나누되, 쓰기 전에는 반드시 초기화된다고 약속한다 |

```dart
void greet(String? name) {
  print(name);       // nullable을 그대로 받는 함수는 null도 출력한다
}

void shout(String name) {
  print(name.toUpperCase());
}

String? input;
shout(input!);       // 컴파일은 통과하지만 input이 null이라 실행 중 오류
shout(input ?? ''); // 안전: null이면 빈 문자열
```

`!`는 정적 분석기를 침묵시킬 뿐 null을 없애 주지 않는다. **매개변수와 모델 필드를 설계할 때 정말 null이 올 수 있는지 먼저 정하고**, 올 수 있는 곳에만 `?`를 붙인다. 서버 응답 모델이라면 API 명세의 필수·선택 필드를 그대로 따르면 된다.

## 비동기: Future와 Stream

동기 코드는 결과가 나올 때까지 다음 줄로 넘어가지 않는다. 네트워크 요청을 기다리는 동안 화면이 멈추면 안 되므로, Flutter 앱은 **비동기**로 요청을 보내 놓고 그동안 로딩 화면을 보여 준 뒤 성공·실패에 따라 다른 화면을 그린다. Dart의 비동기 타입은 둘이다.

| 타입 | 값의 개수 | 함수 표시 | 받는 쪽 | JavaScript 대응 |
| --- | --- | --- | --- | --- |
| `Future<T>` | 나중에 **하나** | `async` | `await`, `.then()` | Promise |
| `Stream<T>` | 시간에 걸쳐 **여러 개** | `async*` + `yield` | `await for`, `.listen()` | async iterator, Observable |

### Future와 async/await

```dart
Future<int> fetchCount() async {
  return 1;
}

void main() async {
  print(fetchCount());        // Instance of 'Future<int>': 아직 결과가 아니다
  print(await fetchCount());  // 1
}
```

`async` 함수는 항상 `Future`를 돌려준다. 결과값을 꺼내려면 `await`로 기다리고, `await`는 `async` 함수 안에서만 쓸 수 있다. 실패는 `try`/`catch`로 잡는다. 흐름은 [[async-await|JavaScript의 async/await]]와 같다.

### Stream과 제너레이터

```dart
Stream<int> countUp(int to) async* {
  for (var i = 0; i < to; i++) {
    yield i;                 // 값을 하나씩 내보낸다
  }
}

Stream<int> countFrom(int i) async* {
  yield i;
  if (i < 3) yield* countFrom(i + 1); // 다른 Stream을 통째로 이어 붙인다
}

void main() async {
  await for (final n in countUp(3)) print(n); // 0 1 2
}
```

- `async*`는 `Stream`을 돌려주는 함수, `yield`는 값 하나를 내보내고 계속 실행한다.
- `yield*`는 다른 Stream이나 Iterable의 값을 그대로 이어 내보낸다. 재귀 제너레이터에 쓴다.
- 같은 문법의 동기 버전은 `sync*`다. `Iterable`을 돌려주며, 값을 요청할 때마다 하나씩 계산하는 지연 시퀀스가 된다.

```dart
Iterable<int> naturals(int n) sync* {
  var i = 0;
  while (i < n) yield i++;
}
```

Flutter에서는 `Future`를 `FutureBuilder`, `Stream`을 `StreamBuilder` 위젯에 넘겨 대기·성공·오류 상태별 화면을 선언적으로 그린다. 실시간 채팅, 센서 값, Firestore 구독처럼 값이 계속 들어오는 곳이 Stream의 자리다.

## 정리

- `final`은 런타임 상수, `const`는 컴파일 타임 상수다. 바뀌지 않는 위젯에 `const`를 붙이면 재빌드 때 재사용된다.
- Dart 3에서 널 안전성은 기본이다. null이 올 수 있는 타입에만 `?`를 붙이고, `!`는 확신할 때만 쓴다.
- 값 하나는 `Future` + `async`/`await`, 여러 값은 `Stream` + `async*`/`yield`/`await for`.
- 동기 지연 시퀀스는 `sync*`로 만든 `Iterable`이다.

관련 노트: [[flutter-architecture|Flutter의 구조와 위젯 트리]], [[async-await|async/await]], [[mobile-frameworks|모바일 앱 프레임워크 비교]]
