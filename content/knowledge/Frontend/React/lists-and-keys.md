---
title: "리스트와 Key"
concept: "Key"
summary: "배열을 map으로 엘리먼트 목록으로 바꿔 렌더링하는 방법과, 각 항목을 식별하는 key의 역할."
tags: ["react", "jsx", "frontend"]
source: til
---

목록을 그릴 때는 JavaScript 배열의 `map()`으로 각 데이터를 엘리먼트로 바꿔 반환한다. 이때 각 항목에는 **key**를 줘야 한다. key는 React가 리렌더링 때 "어떤 항목이 추가·삭제·이동되었는지"를 알아내는 이름표다.

## map으로 여러 컴포넌트 렌더링

```javascript
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map((number) => number * 2) // [2, 4, 6, 8, 10]
```

같은 방식으로 데이터를 엘리먼트로 바꾼다.

```jsx
function NumberList({ numbers }) {
  const listItems = numbers.map((number) => (
    <li key={number.toString()}>{number}</li>
  ))
  return <ul>{listItems}</ul>
}

const root = createRoot(document.getElementById('root'))
root.render(<NumberList numbers={[1, 2, 3, 4, 5]} />)
```

JSX 안에서 바로 쓰는 경우가 더 흔하다.

```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

## Key

- 형제 항목 사이에서 **고유하고 안정적인** 값이어야 한다(전체 앱에서 고유할 필요는 없다).
- key가 없으면 콘솔에 경고가 뜬다. React Native에서도 마찬가지다.
- 가장 좋은 key는 데이터의 **id**다.

### 인덱스를 key로 쓰면 안 되는 이유

`map((item, index) => <li key={index}>)`는 항목이 추가·삭제·정렬되면 같은 인덱스가 다른 데이터를 가리키게 된다. React는 key가 같으면 같은 컴포넌트로 보고 재사용하므로, 입력창 값이나 내부 state가 엉뚱한 항목에 붙는 버그가 생긴다. 목록이 절대 바뀌지 않는 경우에만 인덱스를 쓴다.

마찬가지로 `Math.random()`처럼 렌더링마다 바뀌는 값을 key로 쓰면 매번 모든 항목을 새로 만든다. 고유 id는 **데이터를 만들 때 한 번** 생성해 저장한다(예: `{ text, id: crypto.randomUUID() }`).

### key는 map을 호출하는 곳에

key는 배열을 만드는 위치의 엘리먼트에 준다. 항목을 컴포넌트로 뽑았다면 그 컴포넌트 **안의** `<li>`가 아니라, `map` 안의 `<ListItem key={...} />`에 준다. key는 props로 전달되지 않으므로 자식에서 id가 필요하면 따로 넘긴다.

```jsx
{todos.map((todo) => (
  <TodoItem key={todo.id} id={todo.id} title={todo.title} />
))}
```

## 핵심 정리

- 목록은 `map()`으로 엘리먼트 배열을 만든다.
- key는 형제 사이에서 고유하고 변하지 않는 값(데이터 id). 인덱스·랜덤 값은 피한다.
- key는 `map` 안의 최상위 엘리먼트에 준다.
