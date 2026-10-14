---
title: "Flutter의 구조와 위젯 트리"
concept: "Flutter"
summary: "Flutter는 Dart 프레임워크·C++ 엔진·플랫폼 임베더의 세 층으로 이루어져, OS의 UI 컴포넌트를 빌리지 않고 화면을 직접 그린다. 프레임워크 라이브러리(Material, Cupertino, Widgets, Rendering 등)의 역할, Widget·Element·RenderObject 세 트리, StatefulWidget 순서를 바꿀 때 Key가 필요한 이유, 패키지·플러그인을 만들어 pub.dev에 배포하는 법을 정리한다."
tags: ["mobile", "flutter", "dart", "rendering", "architecture"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/497dc9bfb79549dba4e2946ad868224b", "https://80000coding.notion.site/0acaa5e70c944ea48b5a258ad5459e39", "https://80000coding.notion.site/9ef01c5e463f4fffac00f9475877d31c", "https://docs.flutter.dev/resources/architectural-overview", "https://docs.flutter.dev/perf/impeller", "https://80000coding.notion.site/420abc5b7b4741959b308b8fd0d8da23", "https://dart.dev/tools/pub/publishing"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「Flutter 아키텍쳐 계층 살펴보기」, 「[Flutter] setState를 해도 위젯순서가 바뀌지 않는 이유를 Key로 해결해보자」, 「내가 Flutter를 쓰는 이유」, 「[Flutter] 플러터 패키지 배포, 밥아저씨처럼 단숨에 해보기」를 바탕으로 재구성한 노트입니다.

**Flutter**는 Google이 만든 오픈 소스 UI 툴킷이다. [[dart-language|Dart]] 코드 하나로 Android·iOS·웹·Windows·macOS·Linux 앱을 만든다. React Native가 각 OS의 네이티브 UI 컴포넌트를 호출하는 것과 달리, Flutter는 **화면의 픽셀을 자체 렌더링 엔진으로 직접 그린다.** 그래서 플랫폼이 달라도 모양이 같고, 플랫폼별 UI 차이에 덜 흔들린다. 크로스 플랫폼 방식 전반의 비교는 [[mobile-frameworks|모바일 앱 프레임워크 비교]]에 있다.

## 왜 Flutter를 고르나

| 장점 | 내용 |
| --- | --- |
| 한 코드베이스 | 개발 → 수정 → 테스트 → 배포 주기를 플랫폼마다 따로 돌리지 않는다. 혼자나 작은 팀에 특히 크다 |
| 개발자 경험(DX) | 상태를 유지한 채 코드 변경을 바로 반영하는 **핫 리로드**, DevTools, IDE 지원, 정리된 문서와 Cookbook |
| 배우기 쉬운 언어 | Dart는 Java·JavaScript와 비슷하고, 널 안전성 같은 현대 언어 기능을 갖췄다 |
| 알아야 할 것이 적다 | React Native는 JS/TS + React + JSX + 스타일 규칙을 함께 알아야 하지만, Flutter는 레이아웃·스타일까지 전부 위젯으로 쓴다 |

한계도 분명하다. 웹 빌드는 캔버스에 그리는 방식이라 SEO와 첫 로딩에 약해, 문서형 웹사이트보다 앱형 웹에 맞는다. 플랫폼 고유 기능은 플러그인이나 플랫폼 채널로 네이티브 코드를 불러야 한다.

## 세 개의 층

```text
┌──────────────────────────────────────────────┐
│ Framework (Dart)                             │
│   Material · Cupertino                       │  ← 디자인 언어별 위젯
│   Widgets                                    │  ← 위젯 기본 클래스, 조합
│   Rendering                                  │  ← 레이아웃·페인트 객체 트리
│   Animation · Painting · Gestures            │
│   Foundation                                 │  ← 저수준 유틸리티
├──────────────────────────────────────────────┤
│ Engine (C++) — 렌더러(Impeller), Dart 런타임, │
│   텍스트 레이아웃, 플랫폼 채널               │
├──────────────────────────────────────────────┤
│ Embedder (플랫폼별) — Android(Java/C++),      │
│   iOS·macOS(Objective-C/Swift), Windows·Linux │
└──────────────────────────────────────────────┘
```

| 층 | 언어 | 하는 일 |
| --- | --- | --- |
| Framework | Dart | 앱 개발자가 직접 쓰는 층. 아래 라이브러리를 쌓아 올린 구조라, 위 라이브러리는 아래 것을 써서 만들어졌다 |
| Engine | 대부분 C++ | 프레임을 실제 픽셀로 그리는 렌더러, Dart 코드를 실행하는 런타임, 텍스트 배치, 파일·네트워크 I/O, 접근성, 플러그인 통신 |
| Embedder | 플랫폼 언어 | OS와 엔진 사이의 접착제. 그릴 화면(surface)을 받아 오고, 입력 이벤트·접근성·메시지 루프를 OS와 주고받는다 |

렌더러는 오랫동안 **Skia**였고, 지금은 iOS·Android·macOS·Windows·Linux에서 **Impeller**가 기본이다. iOS는 Impeller만 지원하고, Android는 API 29 이상에서 기본이며 그보다 낮거나 Vulkan이 없는 기기에서는 기존 OpenGL 렌더러로 자동 전환된다. 웹은 아직 Skia로 그린다. Impeller는 셰이더를 빌드 때 미리 컴파일해 첫 애니메이션에서 생기던 버벅임(shader compilation jank)을 없앴다.

## 프레임워크 라이브러리

| 라이브러리 | import | 역할 |
| --- | --- | --- |
| Material | `package:flutter/material.dart` | Google의 Material Design(현재 Material 3)을 따르는 위젯. 대부분의 앱이 이것으로 시작한다 |
| Cupertino | `package:flutter/cupertino.dart` | Apple Human Interface Guidelines를 따르는 iOS 스타일 위젯. 이름은 Apple 본사가 있는 도시에서 왔다 |
| Widgets | `package:flutter/widgets.dart` | 두 디자인 언어에 속하지 않는 기본 위젯과 `StatelessWidget`·`StatefulWidget` 같은 토대 |
| Rendering | `package:flutter/rendering.dart` | 위젯을 실제로 배치하고 그리는 `RenderObject` 트리 |
| Animation | `package:flutter/animation.dart` | 트윈, 커브, 컨트롤러. 복잡한 애니메이션은 Rive·Lottie 파일을 불러와 쓰기도 한다 |
| Painting | `package:flutter/painting.dart` | 테두리, 그림자, 그라디언트, 이미지 같은 저수준 그리기. 직접 그리기는 `CustomPaint`([[flutter-ui-techniques|Flutter UI 실전 기법]]) |
| Gestures | `package:flutter/gestures.dart` | 탭·드래그·스와이프 같은 터치 동작 인식 |
| Foundation | `package:flutter/foundation.dart` | 다른 층이 쓰는 범용 클래스와 함수 |

위젯은 화면에 **보이는 위젯**(Text, Icon, Button)과 보이지 않지만 배치를 돕는 **레이아웃 위젯**(Row, Column, Container, Padding)으로 나뉜다. Flutter에서는 스타일·정렬·제스처까지 모두 위젯이다.

## 세 개의 트리

Flutter의 위젯은 모두 **불변(@immutable)** 이다. 그런데 화면은 사용자와 상호작용하며 계속 바뀐다. 이 모순을 Flutter는 성격이 다른 세 트리로 푼다.

| 트리 | 수명 | 담는 것 |
| --- | --- | --- |
| Widget | 빌드할 때마다 새로 만든다. 가볍다 | 화면의 **설정값**(색, 글자, 자식 목록) |
| Element | 오래 유지된다 | 위젯과 RenderObject를 잇는 **자리**. 부모·자식 관계와 생명주기, `StatefulWidget`의 `State` 객체를 붙들고 있다 |
| RenderObject | 오래 유지된다 | 크기·위치를 계산하는 레이아웃과 그리기 로직 |

`setState`가 호출되면 위젯 트리는 새로 만들어지지만, Element는 **이전 위젯과 새 위젯의 타입(그리고 Key)이 같으면 자기 자리를 그대로 두고 위젯 참조만 바꾼다.** RenderObject도 바뀐 속성만 고친다. 가벼운 위젯은 매번 버리고, 비싼 객체는 재사용하는 구조다. React가 가상 DOM을 비교해 바뀐 부분만 반영하는 것과 같은 발상이다([[lists-and-keys|React의 리스트와 key]]).

## Key: StatefulWidget의 순서를 바꿀 때

두 타일의 순서를 바꾸는 코드가 있다고 하자.

```dart
List<Widget> tiles = [ColorTile(), ColorTile()];
// 버튼을 누르면
setState(() => tiles.insert(1, tiles.removeAt(0)));
```

| 타일 종류 | 결과 | 이유 |
| --- | --- | --- |
| `StatelessWidget`, 색을 위젯 필드에 저장 | 순서가 바뀐다 | 색이 위젯 자체에 있으므로 새 위젯 순서대로 그려진다 |
| `StatefulWidget`, 색을 `State`에 저장 | **바뀌지 않는다** | Element가 타입만 비교한다. 둘 다 `ColorTile`이라 "같은 자리"로 보고 위젯 참조만 갱신한다. 색을 가진 `State`는 Element에 붙은 채 그대로 남는다 |

해결은 위젯에 **Key**를 주는 것이다.

```dart
List<Widget> tiles = [
  ColorTile(key: UniqueKey()),
  ColorTile(key: UniqueKey()),
];
```

Key가 있으면 Element는 타입과 Key를 함께 비교한다. 같은 자리에서 Key가 다르면 그 Element를 떼어 내고, 형제 중 Key가 맞는 Element를 찾아 옮겨 붙인다. 그래서 `State`가 위젯을 따라 이동한다.

- Key는 **같은 부모 아래 형제들 사이에서** 비교된다. 타일을 `Padding`으로 감쌌다면 Key는 타일이 아니라 형제 위치에 있는 `Padding`에 줘야 한다.
- 색뿐 아니라 입력 중인 텍스트, 스크롤 위치, 애니메이션 진행 상태도 모두 `State`에 있다. 상태를 가진 위젯을 **재정렬·삽입·삭제**하는 리스트에는 Key가 필요하다.
- 데이터에 고유 ID가 있으면 `ValueKey(item.id)`를 쓴다. `UniqueKey()`는 빌드할 때마다 새로 만들면 매번 다른 위젯으로 취급되어 상태가 초기화되므로, 한 번 만들어 보관할 때만 쓴다.
- 트리의 다른 위치로 옮겨도 상태를 유지하거나 바깥에서 `State`에 접근하려면 `GlobalKey`를 쓴다.

## 패키지와 플러그인: pub.dev에 배포하기

Dart·Flutter 라이브러리는 공식 저장소 **pub.dev**로 배포한다. 버전 관리, 버전별 API 문서, 품질 점수(pub points)를 제공한다.

| 종류 | 내용 | 만들기 |
| --- | --- | --- |
| 패키지(package) | Dart 코드로만 된 라이브러리. 플랫폼과 무관하게 쓴다 | `flutter create --template=package my_pkg` |
| 플러그인(plugin) | 패키지 + 플랫폼별 네이티브 코드(Kotlin, Swift 등). 카메라·센서처럼 OS 기능이 필요할 때 | `flutter create --template=plugin --platforms=android,ios my_plugin` |

```text
my_pkg/
├── lib/            ← 공개 API (lib/src/는 내부 구현)
├── example/        ← 사용 예제 앱. pub.dev의 Example 탭에 보인다
├── test/
├── pubspec.yaml    ← name, description, version, repository 등. pub.dev에 그대로 노출
├── README.md       ← 패키지 소개 페이지가 된다
├── CHANGELOG.md    ← 버전별 변경 내역
└── LICENSE
```

1. 패키지 자체는 실행해 볼 수 없으므로, 별도 앱의 `pubspec.yaml`에서 `my_pkg: { path: ../my_pkg }`처럼 **경로 의존성**으로 연결해 확인한다.
2. `pubspec.yaml`의 `version`은 시맨틱 버전으로 올리고, 같은 번호로 `CHANGELOG.md`에 기록한다. 한 번 올린 버전은 지울 수 없고(retract만 가능) 덮어쓸 수도 없다.
3. `dart pub publish --dry-run`(또는 `flutter pub publish --dry-run`)으로 빠진 파일·설정을 먼저 점검한다.
4. `dart pub publish`로 배포한다. 처음에는 Google 계정 인증을 거친다. 이후에는 GitHub Actions에서 태그를 푸시하면 자동 배포되게 설정할 수 있다.
5. 배포 후 pub.dev의 점수 항목(문서 주석, 예제, 플랫폼 지원, 정적 분석, 최신 의존성)을 보고 놓친 부분을 채운다.

## 정리

- Flutter = Dart 프레임워크 + C++ 엔진(Impeller) + 플랫폼 임베더. OS 위젯을 빌리지 않고 직접 그린다.
- 프레임워크는 Foundation부터 Material·Cupertino까지 쌓인 라이브러리이고, 스타일·배치까지 전부 위젯이다.
- 불변인 Widget은 매번 새로 만들고, Element와 RenderObject는 타입·Key가 같으면 재사용한다.
- 상태를 가진 위젯의 순서를 바꾸면 Key가 있어야 상태가 위젯을 따라간다.
- Dart만 쓰면 패키지, 네이티브 코드가 들어가면 플러그인이다. `--dry-run`으로 점검한 뒤 pub.dev에 배포한다.

관련 노트: [[dart-language|Dart 핵심 문법]], [[flutter-ui-techniques|Flutter UI 실전 기법]], [[mobile-frameworks|모바일 앱 프레임워크 비교]], [[react-native-basics|React Native 기초]]
