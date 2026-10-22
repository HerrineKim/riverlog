---
title: "React Native 기초와 스타일링"
concept: "React Native"
summary: "React 코드를 네이티브 UI로 바꿔 주는 React Native의 동작 원리(브리지에서 New Architecture로), Expo로 시작하기, 코어 컴포넌트, StyleSheet와 Flexbox 레이아웃, onPress·onChangeText 이벤트와 ScrollView·FlatList 목록."
tags: ["react-native", "mobile", "react", "css", "state"]
source: mixed
date: "2026-10-21"
sources: ["https://reactnative.dev/docs/environment-setup", "https://docs.expo.dev/get-started/create-a-project/", "https://tadeuzagallo.com/blog/react-native-bridge/", "https://reactnative.dev/architecture/landing-page"]
---

> 브리지의 동작은 Tadeu Zagallo의 「[Bridging in React Native](https://tadeuzagallo.com/blog/react-native-bridge/)」를 바탕으로, New Architecture는 [React Native 공식 문서](https://reactnative.dev/architecture/landing-page)로 확인해 보강했다.

**React Native**는 React 문법으로 Android·iOS **네이티브 앱**을 만드는 크로스 플랫폼 프레임워크다. React의 컴포넌트·props·state·Hooks를 그대로 쓰되, `<div>`, `<p>` 같은 HTML 대신 네이티브 UI로 변환되는 **코어 컴포넌트**를 쓴다.

## 동작 원리

```text
React 컴포넌트 (<View>, <Text>)
   │  JS 스레드에서 실행 (네이티브 코드로 컴파일되지 않음)
   ▼
JSI ─ Fabric(렌더러) · Turbo Modules
   ▼
Android View / iOS UIView   ← 웹뷰가 아니라 진짜 네이티브 뷰
```

- `<View>`, `<Text>` 같은 컴포넌트는 플랫폼마다 네이티브 뷰로 그려진다.
- JavaScript 로직은 앱 안의 **JavaScript 스레드**에서 따로 실행된다.
- React Native 0.76부터 **New Architecture**가 기본이고, 0.82부터는 New Architecture만 쓸 수 있다. JS가 JSI로 네이티브 객체를 직접 호출하고, Fabric과 Turbo Modules가 옛 구조를 대신한다.

### 브리지에서 JSI로

과거에는 JS와 네이티브가 **브리지(Bridge)** 로 메시지를 비동기 직렬화해 주고받았다. 그 구조에서 앱은 세 스레드로 돌았다. JS 코드가 도는 **JS 스레드**, 네이티브 뷰를 그리는 **메인(UI) 스레드**, 레이아웃(Yoga)을 계산하는 **섀도 스레드**다. 네이티브 모듈은 각자 따로 큐를 받았다.

| 단계 | 브리지 시절 | New Architecture |
| --- | --- | --- |
| 모듈 등록 | 앱 시작 때 모든 네이티브 모듈을 만들고, 이름·메서드 시그니처를 **JSON 설정**으로 JS 쪽 전역에 넘긴다. JS에서는 `NativeModules.Person`으로 보인다 | Turbo Modules는 처음 쓸 때 **지연 로드**한다. 타입은 TypeScript 명세에서 Codegen으로 만든다 |
| 호출 | JS가 네이티브 메서드를 부르면 (모듈, 메서드, 인자)가 **큐에 쌓이고**, JS 실행이 한 번 끝날 때 묶음으로 네이티브에 넘어간다. 인자는 JSON으로 직렬화된다 | JSI가 C++ 호스트 객체의 참조를 JS에 직접 쥐여 준다. 직렬화가 없고 필요하면 **동기 호출**도 된다 |
| 결과 | 콜백·Promise로 비동기로만 돌아온다 | 동기·비동기 모두 |
| 렌더링 | 섀도 스레드의 레이아웃 결과를 브리지로 넘겨 UI 스레드가 반영 | Fabric 렌더러가 C++로 공유되어 동기 레이아웃 측정, 동시성 렌더링(React 18 기능)을 지원 |

브리지의 병목은 **잦은 왕복과 직렬화**였다. 스크롤에 맞춰 움직이는 애니메이션이나 제스처처럼 프레임마다 JS와 네이티브를 오가야 하는 일에서 끊김이 생겼다. 그래서 Animated의 `useNativeDriver`, Reanimated처럼 작업을 UI 스레드로 넘기는 우회가 발달했다. JS 엔진은 처음에 iOS의 JavaScriptCore를 썼고, 지금은 시작 속도와 메모리에 맞춘 **Hermes**(바이트코드를 빌드 때 미리 만든다)가 기본이다.

## 시작하기

새 앱은 **Expo** 같은 프레임워크로 시작한다. 공식 문서의 권장이다.
프레임워크 없이 Android Studio·Xcode로 직접 구성하는 방식은 특별한 제약이 있을 때의 예외다.

```bash
npx create-expo-app@latest RNCourse --template blank   # 템플릿 없이 만들면 Expo Router + TypeScript
cd RNCourse && npx expo start                           # 터미널의 QR 코드를 휴대폰 Expo Go 앱으로 스캔
# 에뮬레이터: Android Studio 에뮬레이터를 띄운 뒤 터미널에서 a (iOS 시뮬레이터는 i)
```

blank 템플릿에서는 `App.js`가 시작 컴포넌트이고, `app.json`에 앱 이름·아이콘·배경색 같은 설정을 둔다. 과거의 전역 `expo-cli`(`expo init`)는 더 이상 쓰지 않는다.

## 코어 컴포넌트

| 컴포넌트 | 역할 | 웹에서의 대응 |
| --- | --- | --- |
| `View` | 레이아웃 컨테이너 | `div` |
| `Text` | 텍스트 표시 | `p`, `span` |
| `TextInput` | 텍스트 입력 | `input` |
| `Button` | 플랫폼 기본 버튼 | `button` |
| `Image` | 이미지. 로컬 파일은 `source={require('./a.png')}` | `img` |
| `ScrollView`, `FlatList` | 스크롤 영역, 목록 | - |
| `Pressable`, `Modal` | 터치 감지, 오버레이 화면 | - |

웹보다 문법이 엄격하다. **문자열은 반드시 `<Text>` 안에** 있어야 하며, `<View>` 안에 바로 넣으면 에러가 난다.

### 기본 `Button`은 스타일을 받지 않는다

`<Button style={...}>`는 **아무것도 반영되지 않는다.** 기본 `Button`은 `title`, `color`, `disabled` 정도만 받는다. 크기·여백은 바깥 `View`로 감싸 지정하고, 모양을 직접 꾸미려면 `Pressable`로 `Text`를 감싸 버튼을 만든다.

```jsx
<Pressable style={styles.button} onPress={onPress}>
  <Text style={styles.buttonText}>확인</Text>
</Pressable>
```

컴포넌트가 받는 props는 에디터에서 `Cmd`(Windows `Ctrl`) + 클릭으로 타입 정의를 열어 확인한다.

## 스타일링

React Native에는 **CSS가 없다.** 모든 스타일을 JavaScript 객체로 쓴다. 속성 이름은 CSS를 따르되 camelCase, 단위 없는 숫자, 거의 없는 상속이 다르다. 인라인 객체도 되지만 `StyleSheet.create`가 자동 완성과 유효성 검사를 주므로 권장된다.

### Flexbox 레이아웃

레이아웃은 **Flexbox**가 기본이다. 웹 CSS Flexbox와 거의 같지만 기본값이 다르다.

| 항목 | React Native | 웹 |
| --- | --- | --- |
| flex 컨테이너 | 모든 `View`가 기본으로 flex | `display: flex`를 써야 한다 |
| 기본 `flexDirection` | **`column`** | `row` |
| 축약 속성 | `paddingHorizontal`, `marginVertical` 등이 있다 | 없다 |

```jsx
const styles = StyleSheet.create({
  appContainer: { flex: 1, paddingTop: 50, paddingHorizontal: 16 },
  inputContainer: {
    flex: 1,                        // 입력 영역 : 목록 = 1 : 4
    flexDirection: 'row',           // 입력창과 버튼을 가로로
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalsContainer: { flex: 4 },
})
```

Flexbox 개념 자체는 [Float와 Flexbox](/knowledge/dictionary/frontend/css/flexbox) 노트에 있다.

## 이벤트와 입력

state·이벤트·컴포넌트 분리는 React와 같다. 이벤트 이름만 다르다.

| 웹(React) | React Native |
| --- | --- |
| `onClick` | `onPress` |
| `onChange={(e) => e.target.value}` | `onChangeText={(text) => ...}`. 입력된 문자열을 바로 받는다 |

```jsx
function GoalInput({ onAddGoal }) {
  const [text, setText] = useState('')

  function addHandler() {
    onAddGoal(text)
    setText('')            // 입력창 비우기
  }

  return (
    <View style={styles.inputContainer}>
      <TextInput value={text} onChangeText={setText} placeholder="목표" />
      <Button title="추가" onPress={addHandler} />
    </View>
  )
}
```

**입력창을 비우려면 `value`를 연결한 제어 컴포넌트로 만든다.** `value` 없이 `onChangeText`만 두면 state를 `''`로 바꿔도 화면의 글자는 남는다.

## ScrollView와 FlatList

`View`는 내용이 넘쳐도 스크롤되지 않는다. 스크롤이 필요하면 둘 중 하나를 쓴다.

| | ScrollView | FlatList |
| --- | --- | --- |
| 렌더링 | 모든 항목을 **한 번에** 렌더링 | 화면에 **보이는 부분만** 렌더링(가상화) |
| 적합한 경우 | 양이 적고 고정된 콘텐츠(약관, 설정 화면) | 길이가 가변적이거나 긴 목록 |
| 사용법 | 자식을 `map`으로 넣는다(key 필요) | `data`와 `renderItem`을 props로 넘긴다 |
| key | 각 자식에 `key` | 데이터의 `key` 속성을 자동으로 쓰고, 다른 이름이면 `keyExtractor` |

```jsx
<FlatList
  data={goals}
  renderItem={({ item }) => <GoalItem text={item.text} onDelete={() => deleteGoal(item.id)} />}
  keyExtractor={(item) => item.id}
/>
```

`renderItem`은 `{ item, index }` 객체를 받는다. `alwaysBounceVertical`처럼 한 플랫폼에서만 동작하는 props도 있으니 문서의 플랫폼 표시를 확인한다. id는 `Math.random()` 대신 `expo-crypto`의 `randomUUID()`로 만든다.

## 그 밖의 상호작용 컴포넌트

- `Pressable`: `android_ripple={{ color }}`은 Android 물결 효과이고, iOS에는 `style={({ pressed }) => pressed && styles.pressed}`로 눌림 스타일을 준다.
- `Modal`: `visible`과 `animationType="slide"`로 입력 화면 같은 오버레이를 띄우고, 닫기는 부모 state로 제어한다.
- `expo-status-bar`: `<StatusBar style="light" />`로 상태바(시계·배터리) 글자색을 배경에 맞춘다.

## 정리

- React Native = React 문법 + 네이티브 UI. 로직은 JS 스레드에서 실행된다.
- 새 앱은 Expo로 시작한다. 문자열은 반드시 `Text` 안에 둔다.
- 기본 `Button`은 꾸밀 수 없다. 커스텀 버튼은 `Pressable` + `Text`.
- 스타일은 `StyleSheet.create` 객체, 레이아웃은 Flexbox(기본 방향 `column`).
- 이벤트는 `onPress`·`onChangeText`, 입력을 비우려면 제어 컴포넌트. 짧은 목록은 `ScrollView`, 긴 목록은 `FlatList`.

관련 노트: [[react-native-practical-tips|React Native 실무 팁]], [[mobile-frameworks|모바일 앱 프레임워크 비교]], [[lists-and-keys|리스트와 Key]]
