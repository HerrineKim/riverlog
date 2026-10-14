---
title: "Flutter UI 실전 기법: 중첩 내비게이션, CustomPaint, 리치 텍스트, 네이티브 스플래시"
concept: "Flutter UI"
summary: "Flutter 앱을 만들다 자주 부딪히는 네 가지 화면 문제의 해법. 화면 일부만 전환하는 중첩 Navigator, 기본 위젯으로 안 되는 모양을 그리는 CustomPaint와 Path, 한 문장 안에 여러 스타일을 섞는 Text.rich, 앱 시작 때의 흰 화면을 없애는 네이티브 스플래시를 정리한다."
tags: ["mobile", "flutter", "ui", "navigation"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/c5a5dd8efb5a452facdb79baa1cc16bc", "https://80000coding.notion.site/06043af3e166468a9eab10375eb7a477", "https://80000coding.notion.site/5baeee620ec44f7f82b736707019f725", "https://80000coding.notion.site/531f3cf56830483d9a2943c34e14d9db", "https://pub.dev/packages/flutter_native_splash", "https://pub.dev/packages/go_router"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[Flutter] Navigator 위젯으로 마치 Fragment처럼 화면 일부만 이동하기」, 「[Flutter] CustomPaint를 이용하여 Border를 밥아저씨처럼 쉽게 그려보기」, 「[Flutter] EasyRichText를 이용하여 밥아저씨처럼 간단하게 글자 꾸미기」, 「[Flutter] flutter_native_splash를 활용하여, 밥아저씨처럼 손쉽게 네이티브 스플래시 만들기」를 바탕으로 재구성한 노트입니다.

| 문제 | 해법 |
| --- | --- |
| 상단 바는 그대로 두고 아래 영역만 화면 전환하고 싶다 | 영역 안에 **별도의 `Navigator`** 를 둔다(또는 go_router의 셸 라우트) |
| 대각선 테두리, 오각형처럼 기본 위젯에 없는 모양이 필요하다 | **`CustomPaint` + `CustomPainter`** 로 직접 그린다 |
| 한 문장 안에서 일부만 굵게, 색을 다르게 하고 싶다 | **`Text.rich`** 와 `TextSpan` |
| 앱을 켤 때 잠깐 흰 화면이 보인다 | **네이티브 스플래시**를 설정한다 |

## 1. 화면 일부만 전환하기: 중첩 Navigator

`Navigator`는 화면(Route)을 스택으로 쌓는 위젯이다. `MaterialApp`이 앱 최상위에 하나를 만들고, `Navigator.of(context).push()`는 보통 그 최상위 스택을 조작한다. 그래서 push하면 앱 바까지 통째로 새 화면에 덮인다.

탭 화면처럼 **고정 영역은 유지한 채 본문만 이동**하려면 본문 자리에 `Navigator`를 하나 더 두어 그 영역만의 스택을 만든다.

```dart
final _innerNav = GlobalKey<NavigatorState>();

Column(children: [
  const FixedHeader(),            // 이동해도 그대로 남는 영역
  Expanded(
    child: Navigator(
      key: _innerNav,
      initialRoute: '/',
      onGenerateRoute: (settings) => MaterialPageRoute(
        builder: (_) => switch (settings.name) {
          '/b' => const PageB(),
          _ => const PageA(),
        },
      ),
    ),
  ),
]);

// 안쪽 스택을 조작할 때는 key로 그 Navigator를 지목한다
_innerNav.currentState?.pushNamed('/b');
```

- 안쪽 위젯에서 그냥 `Navigator.of(context)`를 부르면 가장 가까운 Navigator, 즉 안쪽 것이 잡힌다. 바깥(상위) 위젯에서 조작하려면 위처럼 `GlobalKey<NavigatorState>`로 지목한다.
- `currentState`는 nullable이므로 `?.`로 다룬다.
- `canPop()`은 스택에 돌아갈 화면이 있는지 확인하고, `maybePop()`은 가능할 때만 pop한다. 스택의 첫 화면에서 `pop()`하면 빈 화면이 되므로, 뒤로 가기 버튼을 보여 줄지 정할 때는 `canPop()`으로 먼저 확인한다.
- Android 뒤로 가기 버튼은 `PopScope`로 안쪽 스택에 먼저 전달되게 연결해야 한다.

실무에서는 이 배선을 직접 하기보다 Flutter 팀이 관리하는 **go_router**의 `ShellRoute`(탭마다 스택을 따로 보존하려면 `StatefulShellRoute`)를 쓰는 것이 일반적이다. 셸이 고정 레이아웃을 그리고, 자식 경로만 그 안에서 바뀐다. URL·딥 링크와도 맞물린다.

## 2. 직접 그리기: CustomPaint

`BoxDecoration`으로 테두리·둥근 모서리·그림자는 되지만 대각선 변이나 다각형은 안 된다. SVG를 늘려 붙이면 크기가 바뀔 때 비율이 깨진다. 이럴 때 `CustomPainter`로 그린다.

```dart
class PentagonPainter extends CustomPainter {
  const PentagonPainter({required this.color});
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke   // 채우기 대신 선
      ..strokeWidth = 2;

    final path = Path()
      ..moveTo(size.width / 2, 0)                 // 그리지 않고 이동
      ..lineTo(size.width, size.height / 3)        // 선을 그으며 이동
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..lineTo(0, size.height / 3)
      ..close();                                   // 시작점으로 닫기
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(PentagonPainter old) => old.color != color;
}

CustomPaint(size: const Size(120, 140), painter: const PentagonPainter(color: Colors.teal));
```

| 요소 | 역할 |
| --- | --- |
| `paint(canvas, size)` | 실제 그리기. `size`는 위젯이 받은 크기라 비율로 좌표를 잡으면 크기가 바뀌어도 모양이 유지된다 |
| `shouldRepaint` | 새 painter가 들어올 때 다시 그릴지 결정. 그리기에 쓰는 값이 바뀌었을 때만 `true` |
| `Paint` | 색, 선/채우기, 두께 같은 붓 설정 |
| `Path` | `moveTo`·`lineTo`·`close`로 도형을 만들고 `drawPath`로 그린다 |

모서리를 둥글게 하려면 곡선 메서드를 쓴다.

- `arcToPoint(end, radius: Radius.circular(r))`: 현재 위치에서 `end`까지 반지름 r의 호를 긋는다. 시작·끝 접점을 알 때 편하다.
- `arcTo(rect, startAngle, sweepAngle, forceMoveTo)`: `rect`에 내접한 원에서 시작 각도부터 일정 각도만큼 호를 긋는다. 각도는 **라디안**이고 0은 3시 방향, 시계 방향으로 증가한다. 원의 중심을 알 때 편하다.
- 대각선 변의 모서리는 변의 기울기 각도를 `atan`으로 구한 뒤 `cos`·`sin`으로 접점 좌표를 계산한다.
- 2차·3차 베지어 곡선은 `quadraticBezierTo`·`cubicTo`로 그린다.

## 3. 한 문장에 여러 스타일: Text.rich

`Text` 위젯을 Row로 여러 개 이어 붙이면 줄바꿈이 깨진다. 한 문단 안의 부분 스타일은 `TextSpan` 트리로 표현한다.

```dart
Text.rich(
  TextSpan(
    text: '오늘은 ',
    children: [
      TextSpan(text: '굵게', style: TextStyle(fontWeight: FontWeight.bold)),
      const TextSpan(text: ', '),
      TextSpan(text: '파랗게', style: TextStyle(color: Colors.blue)),
    ],
  ),
)
```

`RichText` 위젯도 같은 일을 하지만 `Text.rich`는 앱의 기본 텍스트 스타일과 글자 크기 배율을 이어받아 보통 이쪽을 쓴다. "특정 단어가 나올 때마다 굵게"처럼 **패턴으로 스타일을 입히고 싶다면** `easy_rich_text` 같은 패키지가 문자열·정규식 패턴을 받아 `TextSpan`을 대신 만들어 준다. 패턴끼리 겹치면 원하는 결과가 안 나올 수 있으니 패턴을 서로 겹치지 않게 짠다.

## 4. 시작 화면의 흰 화면: 네이티브 스플래시

Flutter 앱은 실행되면 먼저 **네이티브 앱이 뜨고, 그 위에서 Flutter 엔진이 로드된 뒤** 첫 프레임을 그린다. 그 사이 네이티브 기본 화면(흰색)이 잠깐 보인다. Dart 코드에서 `Future.delayed`로 스플래시를 보여 줘도 이 구간은 가릴 수 없다. **네이티브 쪽에 스플래시를 설정**해야 한다.

`flutter_native_splash` 패키지는 YAML 설정을 읽어 Android·iOS·웹의 네이티브 스플래시 코드를 생성한다.

```yaml
# flutter_native_splash.yaml (pubspec.yaml에 넣어도 된다)
flutter_native_splash:
  color: "#42a5f5"
  image: assets/splash.png
  color_dark: "#042a49"
  android_12:            # Android 12+는 시스템 SplashScreen API 규칙을 따른다
    color: "#42a5f5"
    image: assets/splash_icon.png
```

```bash
dart run flutter_native_splash:create    # 네이티브 코드 생성
dart run flutter_native_splash:remove    # 생성한 코드 제거(기본 흰 화면으로)
```

스플래시는 Flutter가 첫 프레임을 그리면 사라진다. 로그인 정보 확인처럼 **초기화가 끝날 때까지** 붙잡아 두려면 직접 제어한다.

```dart
void main() {
  final binding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: binding);
  runApp(const MyApp());
}

// 초기화가 끝난 곳에서
FlutterNativeSplash.remove();
```

`preserve`를 썼다면 `remove`가 호출되고 **그리고** 첫 프레임이 그려졌을 때 사라진다. 설정을 바꾸면 YAML을 고친 뒤 `create`를 다시 실행한다. Android에서 이미지가 빈 화면으로 나오면 다크 모드·API 레벨별 `drawable` 폴더에 이미지가 빠진 경우가 많으므로, 다크 모드 설정도 함께 채운다.

## 정리

- 화면 일부만 전환하려면 그 영역에 별도 `Navigator`를 둔다. 실무에서는 go_router의 셸 라우트가 같은 일을 한다.
- 기본 위젯에 없는 모양은 `CustomPainter`의 `paint`에서 `Path`로 그리고, `shouldRepaint`로 다시 그릴 조건을 좁힌다.
- 한 문장 안의 부분 스타일은 `Text.rich` + `TextSpan`이다.
- 시작 때의 흰 화면은 Dart가 아니라 네이티브 스플래시로 가린다.

관련 노트: [[flutter-architecture|Flutter의 구조와 위젯 트리]], [[dart-language|Dart 핵심 문법]], [[react-native-interaction|React Native 상호작용과 리스트]]
