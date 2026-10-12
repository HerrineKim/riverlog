---
title: "React Native 기초와 스타일링"
concept: "React Native"
summary: "React 코드를 네이티브 UI로 바꿔 주는 React Native의 동작 원리(브리지에서 New Architecture로), Expo로 시작하기, 코어 컴포넌트, StyleSheet와 Flexbox 레이아웃."
tags: ["react-native", "mobile", "react", "css"]
source: mixed
---

**React Native**는 React 문법으로 Android·iOS **네이티브 앱**을 만드는 크로스 플랫폼 프레임워크다. React의 컴포넌트·props·state·Hooks를 그대로 쓰되, `<div>`, `<p>` 같은 HTML 대신 네이티브 UI로 변환되는 **코어 컴포넌트**를 쓴다.

## 동작 원리

![React Native 개요](/images/til/FRONTEND/React-Native/-YouTube-React-Native-Crash-Course/00_Intro.assets/image-20220904182039167.png)

- React Native는 React 코드와 각 플랫폼의 **Native API를 연결**하는 다리 역할을 한다.
- `<View>`, `<Text>` 같은 컴포넌트는 Android·iOS 각각의 네이티브 뷰로 그려진다(웹뷰가 아니다).
- JavaScript로 작성한 로직은 네이티브 코드로 컴파일되지 않고, 앱 안에서 React Native가 관리하는 **JavaScript 스레드**에서 따로 실행된다.
- (레거시 아키텍처) 예전에는 JS와 네이티브가 **브리지(Bridge)** 를 통해 메시지를 비동기로 직렬화해 주고받았다.
- (현재) React Native 0.76부터 **New Architecture**가 기본이고, 0.82부터는 New Architecture만 쓸 수 있다(이전 아키텍처를 끄는 설정이 무시됨). JS가 JSI로 네이티브 객체를 직접 호출하고, 새 렌더러(Fabric)와 Turbo Modules가 브리지를 대신한다.

![컴포넌트가 각 플랫폼 네이티브 뷰로 변환된다](/images/til/FRONTEND/React-Native/-YouTube-React-Native-Crash-Course/00_Intro.assets/image-20220904212351135.png)

## 시작하기: Expo vs React Native CLI

| | Expo | React Native CLI |
| --- | --- | --- |
| 난이도 | 쉽다. 네이티브 개발 환경 없이 시작 | 설정할 것이 많아 초심자에게 어렵다 |
| 네이티브 코드(Swift, Kotlin) 통합 | 제한적이었으나 현재는 dev build로 가능 | 쉽다 |
| 전환 | 필요하면 CLI 방식으로 전환 가능 | — |

입문에는 **Expo**를 추천한다. React Native 공식 문서도 새 앱은 Expo 같은 **프레임워크**로 시작하라고 권하고, 프레임워크 없이 Android Studio·Xcode로 직접 구성하는 방식은 특별한 제약이 있을 때의 선택지로 둔다.

```bash
npx create-expo-app@latest RNCourse   # (예전 방식: npm i -g expo-cli && expo init RNCourse)
cd RNCourse
npm start
```

### 실행해 보기

1. 휴대폰에 **Expo Go** 앱을 설치한다.
2. `npm start` 후 터미널에 표시된 QR 코드를 스캔하면 앱이 실행되고, 저장할 때마다 자동으로 반영된다.
3. 실물 기기가 없거나 iPhone만 있다면 Android Studio 에뮬레이터(Play Store 아이콘이 있는 기기 이미지로 생성)를 띄운 뒤 터미널에서 `a`를 누르면 자동으로 실행된다.

### 프로젝트 구조

| 파일 | 역할 |
| --- | --- |
| `App.js` | 시작 컴포넌트. 처음에는 유일한 실제 코드 파일 |
| `app.json` | 앱 이름, 아이콘 등 앱 설정. Expo가 빌드할 때 읽어 간다 |
| `babel.config.js` | 보통 수정할 필요 없음 |

## 코어 컴포넌트

| 컴포넌트 | 역할 | 웹에서의 대응 |
| --- | --- | --- |
| `View` | 레이아웃 컨테이너 | `div` |
| `Text` | 텍스트 표시 | `p`, `span` |
| `TextInput` | 텍스트 입력 | `input` |
| `Button` | 기본 버튼 | `button` |
| `Image` | 이미지 | `img` |
| `ScrollView`, `FlatList` | 스크롤 영역, 목록 | — |
| `Pressable`, `Modal` | 터치 감지, 모달 | — |

웹보다 문법이 엄격하다. 예를 들어 문자열은 반드시 `<Text>` 안에 있어야 하며, `<View>` 안에 문자열을 바로 넣으면 에러가 난다. 이 코어 컴포넌트들을 조합해 UI를 만든다.

### 주의: 기본 `Button`은 스타일을 받지 않는다

`StyleSheet`로 크기·배경·테두리를 만들어 `<Button style={...}>`에 넘겨도 **아무것도 반영되지 않는다.** 기본 `Button`은 `style` prop이 없고 `title`, `color`, `disabled` 정도만 지원하는 플랫폼 기본 버튼이기 때문이다. 모양을 직접 꾸미려면 `Pressable`(또는 `TouchableOpacity`)로 `Text`를 감싸 버튼을 만든다.

```jsx
<Pressable style={styles.button} onPress={onPress}>
  <Text style={styles.buttonText}>확인</Text>
</Pressable>

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  buttonText: { fontSize: 32, fontWeight: '400' },
})
```

컴포넌트가 어떤 props를 받는지는 문서를 열지 않아도 에디터에서 `Ctrl`(macOS `Cmd`) + 클릭으로 타입 정의를 열어 확인할 수 있다. 스타일이 안 먹을 때는 import한 스타일 객체를 `console.log`로 찍어 보는 것도 원인을 좁히는 데 도움이 된다.

## 스타일링

React Native에는 **CSS가 없다.** 모든 스타일을 JavaScript 객체로 작성하며, 속성 이름과 개념은 CSS를 따르지만 완전히 같지는 않다(camelCase, 단위 없는 숫자, 상속이 거의 없음 등).

### 인라인 스타일 vs StyleSheet

```jsx
import { StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.container}>
      {/* 인라인 스타일 */}
      <Text style={{ margin: 16, borderWidth: 2, borderColor: 'red', padding: 16 }}>
        Inline
      </Text>
      {/* StyleSheet */}
      <Text style={styles.dummyText}>StyleSheet</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dummyText: {
    margin: 16,
    borderWidth: 2,
    borderColor: 'red',
    padding: 16,
  },
})
```

`StyleSheet.create`를 쓰면 스타일 속성 **자동 완성**과 **유효성 검사**를 받을 수 있어 인라인보다 권장된다.

### Flexbox 레이아웃

React Native의 레이아웃은 **Flexbox**가 기본이고 매우 중요하다. 웹 CSS Flexbox와 거의 같지만 기본값이 다르다.

- 모든 `View`가 기본적으로 flex 컨테이너다(`display: flex`를 따로 쓰지 않는다).
- 기본 `flexDirection`이 **`column`**(웹은 `row`).
- `flex: 1`은 남은 공간을 비율로 나눠 갖는다.

```jsx
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  inputContainer: {
    flex: 1,                     // 1 : 4 비율로
    flexDirection: 'row',        // 입력창과 버튼을 가로로
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#cccccc',
    width: '80%',
    marginRight: 8,
    padding: 8,
  },
  goalsContainer: {
    flex: 4,                     // 목록이 나머지 공간의 대부분을 차지
  },
})
```

![Flexbox로 개선한 레이아웃](/images/til/FRONTEND/React-Native/-YouTube-React-Native-Crash-Course/03_Styling-React-Native-apps.assets/image-20220910231136593.png)

`paddingHorizontal`, `marginVertical`처럼 웹에 없는 축약 속성도 있다. Flexbox 개념 자체는 [Float와 Flexbox](/knowledge/dictionary/frontend/css/flexbox) 노트 참고.

## 핵심 정리

- React Native = React 문법 + 네이티브 UI. 로직은 JS 스레드에서 실행된다.
- 입문은 Expo + Expo Go로 시작한다.
- HTML 대신 코어 컴포넌트(`View`, `Text`, `TextInput`…), 문자열은 반드시 `Text` 안에.
- 기본 `Button`은 꾸밀 수 없다. 커스텀 버튼은 `Pressable` + `Text`.
- CSS 대신 `StyleSheet.create` 객체, 레이아웃은 Flexbox(기본 방향 `column`).
