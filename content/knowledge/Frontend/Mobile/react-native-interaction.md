---
title: "React Native 상호작용과 리스트"
concept: "FlatList"
summary: "목표 관리 앱 실습으로 본 React Native의 이벤트 처리, ScrollView와 FlatList, 컴포넌트 분리, Pressable·Modal·StatusBar."
tags: ["react-native", "mobile", "react", "state"]
source: til
---

React Native에서 state·이벤트·컴포넌트 분리는 React와 거의 같다. 다른 점은 이벤트 이름(`onPress`, `onChangeText`)과, 긴 목록을 효율적으로 그리기 위한 `FlatList` 같은 모바일 전용 컴포넌트다. "목표(goal)를 입력해 목록에 추가하고, 누르면 삭제하는" 간단한 앱을 만들며 정리했다.

## 이벤트와 State

| 웹(React) | React Native |
| --- | --- |
| `onClick` | `onPress` |
| `onChange={(e) => e.target.value}` | `onChangeText={(text) => ...}` — 입력된 문자열을 바로 받는다 |

```jsx
import { useState } from 'react'
import { Button, TextInput, View } from 'react-native'

export default function App() {
  const [enteredGoalText, setEnteredGoalText] = useState('')
  const [courseGoals, setCourseGoals] = useState([])

  function goalInputHandler(enteredText) {
    setEnteredGoalText(enteredText)
  }

  function addGoalHandler() {
    // 이전 값에 의존하므로 함수형 업데이트
    setCourseGoals((currentCourseGoals) => [
      ...currentCourseGoals,
      { text: enteredGoalText, id: Math.random().toString() },
    ])
  }

  return (
    <View>
      <TextInput placeholder="Your course goal!" onChangeText={goalInputHandler} />
      <Button title="ADD" onPress={addGoalHandler} />
    </View>
  )
}
```

id를 `Math.random()`으로 만든 것은 실습용이다. 실제로는 충돌 가능성이 없는 UUID 등을 쓴다.

## ScrollView vs FlatList

React Native의 `View`는 내용이 넘쳐도 스크롤되지 않는다. 스크롤이 필요하면 아래 둘 중 하나를 쓴다.

| | ScrollView | FlatList |
| --- | --- | --- |
| 렌더링 | 모든 항목을 **한 번에** 렌더링 | 화면에 **보이는 부분만** 렌더링(가상화) |
| 적합한 경우 | 양이 적고 고정된 콘텐츠(약관, 설정 화면) | 길이가 가변적이거나 긴 목록 |
| 사용법 | 자식을 `map`으로 넣음(key 필요) | `data`와 `renderItem`을 props로 넘김 |

```jsx
<FlatList
  data={courseGoals}
  renderItem={(itemData) => <GoalItem text={itemData.item.text} />}
  keyExtractor={(item) => item.id}
  alwaysBounceVertical={false}
/>
```

- `renderItem`은 `{ item, index }`가 담긴 객체를 받는다. 실제 데이터는 `itemData.item`.
- 데이터에 `key` 속성이 있으면 자동으로 쓰고, 다른 이름(`id`)이면 `keyExtractor`로 알려 준다. key가 없으면 경고가 뜬다.
- `alwaysBounceVertical`처럼 iOS·Android 중 한쪽에서만 동작하는 props도 있으니 공식 문서에서 플랫폼 표시를 확인한다.

## 컴포넌트 분리

React와 똑같이 컴포넌트를 파일로 나누고 props로 데이터와 함수를 전달한다.

```jsx
// components/GoalInput.js — 입력 state는 입력 컴포넌트가 가진다
function GoalInput({ onAddGoal }) {
  const [enteredGoalText, setEnteredGoalText] = useState('')

  function addGoalHandler() {
    onAddGoal(enteredGoalText) // 부모에게 값 전달
    setEnteredGoalText('')     // 입력창 비우기
  }

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        placeholder="Your course goal!"
        onChangeText={setEnteredGoalText}
        value={enteredGoalText}   // 제어 컴포넌트로 만들어야 비우기가 화면에 반영된다
      />
      <Button title="ADD" onPress={addGoalHandler} />
    </View>
  )
}
```

```jsx
// App.js — 목록 state는 부모가 가진다
function addGoalHandler(enteredGoalText) {
  setCourseGoals((current) => [...current, { text: enteredGoalText, id: Math.random().toString() }])
}

<GoalInput onAddGoal={addGoalHandler} />
```

## 눌러서 삭제: Pressable

`Pressable`은 감싼 영역의 터치를 감지한다(`TouchableOpacity`의 현대적 대체). 누른 항목의 id를 넘기기 위해 `bind`로 인자를 고정한다([함수와 this](/knowledge/dictionary/frontend/javascript/functions)의 bind).

```jsx
// components/GoalItem.js
function GoalItem({ id, text, onDeleteItem }) {
  return (
    <Pressable
      onPress={onDeleteItem.bind(this, id)}
      android_ripple={{ color: '#210644' }}            // Android 물결 효과
      style={({ pressed }) => pressed && styles.pressedItem} // iOS용 눌림 스타일
    >
      <View style={styles.goalItem}>
        <Text style={styles.goalText}>{text}</Text>
      </View>
    </Pressable>
  )
}
```

```jsx
// App.js
function deleteGoalHandler(id) {
  setCourseGoals((current) => current.filter((goal) => goal.id !== id))
}

<FlatList
  data={courseGoals}
  renderItem={(itemData) => (
    <GoalItem text={itemData.item.text} id={itemData.item.id} onDeleteItem={deleteGoalHandler} />
  )}
  keyExtractor={(item) => item.id}
/>
```

## Modal로 입력 화면 띄우기

버튼을 누르면 입력 화면을 모달로 띄우고, 추가하거나 취소하면 닫는다.

```jsx
// App.js
const [modalIsVisible, setModalIsVisible] = useState(false)

function addGoalHandler(text) {
  setCourseGoals((current) => [...current, { text, id: Math.random().toString() }])
  setModalIsVisible(false) // 추가 후 닫기
}

<Button title="Add New Goal" color="#5e0acc" onPress={() => setModalIsVisible(true)} />
<GoalInput
  visible={modalIsVisible}
  onAddGoal={addGoalHandler}
  onCancel={() => setModalIsVisible(false)}
/>
```

```jsx
// GoalInput.js
<Modal visible={visible} animationType="slide">
  <View style={styles.inputContainer}>
    <Image style={styles.image} source={require('../assets/images/goal.png')} />
    <TextInput style={styles.textInput} onChangeText={setEnteredGoalText} value={enteredGoalText} />
    <View style={styles.buttonContainer}>
      <View style={styles.button}>
        <Button title="Add" onPress={addGoalHandler} />
      </View>
      <View style={styles.button}>
        <Button title="Cancel" onPress={onCancel} />
      </View>
    </View>
  </View>
</Modal>
```

- 로컬 이미지는 `source={require('경로')}`로 불러온다.
- `Button`은 `style` prop을 받지 않으므로, 크기·여백은 바깥 `View`로 감싸서 지정한다.

## 마무리: 배경색과 상태바

- 앱 전체 배경색은 최상위 컨테이너 스타일(`backgroundColor`)이나 `app.json`의 `backgroundColor`로 지정한다.
- 상태바(시계·배터리 영역) 글자색은 `expo-status-bar`로 바꾼다. 어두운 배경이면 `light`.

```jsx
import { StatusBar } from 'expo-status-bar'

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <View style={styles.appContainer}>{/* ... */}</View>
    </>
  )
}
```

![완성된 앱](/images/til/FRONTEND/React-Native/-YouTube-React-Native-Crash-Course/07_design-final-touch.assets/image-20220911202114272.png)

## 핵심 정리

- 이벤트는 `onPress`, 텍스트 입력은 `onChangeText`(문자열을 바로 받음).
- 짧고 고정된 목록은 `ScrollView`, 길거나 가변적인 목록은 `FlatList` + `keyExtractor`.
- 입력창을 비우려면 `value`를 연결한 제어 컴포넌트로 만든다.
- 터치는 `Pressable`, 오버레이 화면은 `Modal`, 상태바는 `expo-status-bar`.
