---
title: "로직 재사용 패턴: HOC, Render Props, 커스텀 훅"
concept: "HOC Render Props"
summary: "여러 컴포넌트가 같은 상태 로직(구독, 마우스 위치, 마운트 여부)을 나눠 쓰는 세 가지 방법. 컴포넌트를 받아 감싼 컴포넌트를 돌려주는 고차 컴포넌트(HOC), 무엇을 그릴지 함수로 받는 render props, 훅 안에 로직만 담는 커스텀 훅을 비교하고, 컨테이너 컴포넌트와 커스텀 훅 중 무엇을 재사용할지 고르는 기준을 정리한다."
tags: ["react", "hooks", "design-pattern", "component", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/HOC%20%EA%B3%A0%EC%B0%A8%20%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/Render%20props.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/Custom%20Hook.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/custom%20Hook%EC%9C%BC%EB%A1%9C%20container%20%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%20%EB%8C%80%EC%B2%B4.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/forward%20refs.md", "https://legacy.reactjs.org/docs/higher-order-components.html", "https://legacy.reactjs.org/docs/render-props.html", "https://react.dev/learn/reusing-logic-with-custom-hooks"]
---

> 「[Frontend_TIL](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL)」의 「[HOC 고차 컴포넌트](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/HOC%20%EA%B3%A0%EC%B0%A8%20%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8.md)」, 「[Render props](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/Render%20props.md)」, 「[Custom Hook](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/Custom%20Hook.md)」, 「[custom Hook으로 container 컴포넌트 대체](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/custom%20Hook%EC%9C%BC%EB%A1%9C%20container%20%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%20%EB%8C%80%EC%B2%B4.md)」, 「[forward refs](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/forward%20refs.md)」를 바탕으로 재구성하고 React 공식 문서로 최신화한 노트다.

## 무엇을 재사용하나

두 컴포넌트가 **그리는 것은 다르고 상태 로직은 같은** 경우가 있다. 댓글 목록과 블로그 글이 둘 다 「데이터 소스를 구독하고, 바뀌면 state를 갱신하고, 언마운트 때 구독을 끊는다」를 반복하는 식이다. 이 반복을 한곳에 모으는 방법이 시대별로 셋 나왔다.

| 패턴 | 모양 | 로직을 넘기는 통로 |
| --- | --- | --- |
| 고차 컴포넌트(HOC) | `withX(Component)` → 감싼 새 컴포넌트 | 감싼 컴포넌트가 **props를 주입**한다 |
| Render props | `<X render={(value) => <UI />} />` | 컴포넌트가 **함수를 호출하며 인자로** 넘긴다 |
| 커스텀 훅 | `const value = useX()` | **반환값**으로 받는다 |

지금 새 코드의 기본은 커스텀 훅이다. HOC와 render props는 라이브러리 API와 옛 코드에서 자주 만나므로 읽을 줄 알아야 한다.

## 고차 컴포넌트(HOC)

**고차 컴포넌트(Higher-Order Component)**는 컴포넌트를 받아 새 컴포넌트를 돌려주는 함수다. 함수를 받아 함수를 돌려주는 고차 함수를 컴포넌트에 옮긴 것이다. react-redux의 `connect`, React Router v5의 `withRouter`가 대표 예다.

```jsx
// 공통 로직(구독)은 HOC에, 다른 부분(무엇을 고를지)은 인자로
function withSubscription(WrappedComponent, selectData) {
  function WithSubscription(props) {
    const [data, setData] = useState(() => selectData(DataSource, props))
    useEffect(() => {
      const handleChange = () => setData(selectData(DataSource, props))
      DataSource.addChangeListener(handleChange)
      return () => DataSource.removeChangeListener(handleChange)
    }, [props])
    return <WrappedComponent {...props} data={data} />   // 받은 props는 그대로 넘기고 data만 더한다
  }
  WithSubscription.displayName = `withSubscription(${WrappedComponent.displayName || WrappedComponent.name})`
  return WithSubscription
}

const CommentListWithSubscription = withSubscription(CommentList, (ds) => ds.getComments())
const BlogPostWithSubscription = withSubscription(BlogPost, (ds, props) => ds.getBlogPost(props.id))
```

| 규칙 | 이유 |
| --- | --- |
| 원본 컴포넌트를 고치지 말고 감싼다 | 원본의 메서드를 바꾸면 다른 HOC와 겹쳐 쓸 때 덮어쓴다 |
| 관계없는 props는 그대로 통과시킨다 | 감싼 컴포넌트가 원래 받던 props를 잃지 않게 |
| `displayName`을 `withX(원래이름)`으로 | DevTools에서 어느 HOC가 감쌌는지 보인다 |
| **렌더링 안에서 HOC를 적용하지 않는다** | 렌더링마다 새 컴포넌트 타입이 되어 하위 트리 전체가 리마운트되고 state가 사라진다([[reconciliation\|재조정]]). 모듈 최상위에서 한 번만 적용한다 |
| ref를 넘겨 준다 | 감싼 쪽에 준 `ref`가 안쪽 컴포넌트까지 가야 한다. React 19부터 함수 컴포넌트는 `ref`를 일반 prop으로 받으므로 `{...props}`로 통과한다. 그 전에는 HOC 반환값을 `React.forwardRef((props, ref) => <Inner {...props} forwardedRef={ref} />)`로 감싸 다른 이름의 prop으로 내려 보냈다([[components-and-props#ref도 props다\|ref도 props다]]) |

## Render props

**Render props**는 「무엇을 그릴지」를 함수 prop으로 받아, 컴포넌트가 가진 값을 인자로 그 함수를 호출하는 패턴이다. prop 이름은 `render`든 `children`이든 상관없다.

```jsx
function Mouse({ render }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  return (
    <div style={{ height: '100vh' }} onPointerMove={(e) => setPos({ x: e.clientX, y: e.clientY })}>
      {render(pos)}
    </div>
  )
}

// 마우스 위치 로직은 Mouse에, 그 위치로 무엇을 그릴지는 쓰는 쪽이 정한다
<Mouse render={(mouse) => <Cat mouse={mouse} />} />
<Mouse>{(mouse) => <p>({mouse.x}, {mouse.y})</p>}</Mouse>   // children을 함수로
```

`MouseWithCat`, `MouseWithDog`처럼 그릴 것마다 컴포넌트를 새로 만들 필요가 없어진다. Context의 `<Consumer>{(value) => ...}</Consumer>`, Formik, react-media-recorder가 이 모양이다.

- 인라인 화살표 함수는 렌더링마다 새로 만들어지므로, `React.memo`(옛 `PureComponent`)로 감싼 컴포넌트에 넘기면 props가 매번 달라 **메모가 깨진다**. 함수를 컴포넌트 밖에 두거나 `useCallback`으로 고정한다.

## 커스텀 훅

**커스텀 훅**은 `use`로 시작하는 함수에 훅 호출을 담은 것이다. 특별한 API가 아니라 **훅을 부르는 함수**일 뿐이고, 이름이 `use`로 시작해야 린터가 [[hooks|Hook 규칙]] 위반을 검사한다. 훅 안의 state는 **부르는 컴포넌트마다 따로** 생긴다. 상태 자체가 아니라 상태 로직을 공유하는 것이다.

```jsx
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return width
}

// HOC withHasMounted(App)이 props로 넣어 주던 값을 훅 하나로
function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => setHasMounted(true), [])
  return hasMounted
}
```

## 비교

| | HOC | Render props | 커스텀 훅 |
| --- | --- | --- | --- |
| 값의 출처 | **암묵적**. props에 `dispatch`가 어디서 왔는지 컴포넌트만 봐서는 모른다 | 명시적. 함수 인자로 보인다 | 명시적. 반환값으로 보인다 |
| 이름 충돌 | HOC 둘이 같은 이름의 prop을 주입하면 **나중 것이 덮어쓴다** | 인자 이름을 쓰는 쪽이 정한다 | 구조 분해로 이름을 바꾼다 |
| 트리 | 감쌀수록 DevTools에 래퍼가 쌓인다(wrapper hell) | JSX 안에 콜백이 중첩된다 | 트리에 아무것도 더하지 않는다 |
| 여러 개 조합 | `withA(withB(withC(C)))` | 콜백 안에 콜백 | 훅을 차례로 부른다 |
| 지금 쓰는 곳 | 라우트 접근 제어 같은 **컴포넌트 단위 감싸기**, 옛 라이브러리 | 렌더링 위임이 필요한 UI 라이브러리 | 상태 로직 재사용의 기본 |

HOC와 render props는 둘 다 컴포넌트를 한 겹 더 만들어 로직을 나르기 때문에, 훅이 나온 뒤에는 대부분 커스텀 훅으로 바뀌었다. 로직이 아니라 **컴포넌트 구조**를 재사용하는 패턴(Compound Components, Props Getters 등)은 [[advanced-react-patterns|재사용 컴포넌트를 위한 리액트 패턴 5가지]]에 있다.

## 컨테이너 컴포넌트와 커스텀 훅

Redux 시절에는 store와 연결하는 **컨테이너**와 props만 받아 그리는 **프레젠테이셔널** 컴포넌트를 나눴다([[redux#컨테이너와 프레젠테이셔널 컴포넌트|Redux]]). 같은 로직을 커스텀 훅으로 옮기면 재사용되는 쪽이 바뀐다.

```jsx
// 컨테이너: 로직은 여기 묶이고, Count는 어떤 데이터든 받는 순수 UI로 남는다
function CountContainer() {
  const num = useSelector((s) => s.count.count)
  const dispatch = useDispatch()
  return <Count num={num} increase={() => dispatch(increase())} decrease={() => dispatch(decrease())} />
}

// 커스텀 훅: 로직을 어디서든 꺼내 쓰지만, 훅을 부르는 Count는 이 store에 묶인다
function useCount() {
  const num = useSelector((s) => s.count.count)
  const dispatch = useDispatch()
  return { num, increase: () => dispatch(increase()), decrease: () => dispatch(decrease()) }
}
```

| | 재사용되는 것 | 고르는 때 |
| --- | --- | --- |
| 컨테이너 + 프레젠테이셔널 | **UI 컴포넌트**. 프레젠테이셔널은 데이터 출처를 모른다 | 같은 화면 조각을 다른 데이터로 여러 곳에 쓴다, 디자인 시스템·스토리북에 올린다 |
| 커스텀 훅 | **상태 로직**. 컴포넌트는 훅을 부르는 순간 그 출처에 묶인다 | UI는 한 번만 쓰고 로직을 여러 화면이 공유한다 |

둘은 배타적이지 않다. 훅에 로직을 담고, 재사용할 UI는 props만 받게 두고, 그 사이를 얇은 컴포넌트가 잇는 조합이 흔하다. 나누는 기준은 [[component-splitting|컴포넌트 분리 기준]]에 있다.

## 정리

- 같은 상태 로직을 여러 컴포넌트가 쓸 때 HOC·render props·커스텀 훅으로 한곳에 모은다.
- HOC는 props를 암묵적으로 주입하고 이름 충돌·래퍼 중첩이 생긴다. 렌더링 안에서 적용하지 않는다.
- render props는 값이 명시적이지만 콜백 중첩과 메모 깨짐을 조심한다.
- 새 코드의 기본은 커스텀 훅이다. 훅은 상태가 아니라 상태 로직을 공유한다.
- UI를 재사용하려면 프레젠테이셔널 컴포넌트를, 로직을 재사용하려면 커스텀 훅을 쓴다.

관련 노트: [[hooks|React Hooks]], [[advanced-react-patterns|재사용 컴포넌트를 위한 리액트 패턴 5가지]], [[composition|합성: 상속 대신 Composition]], [[redux|Redux와 react-redux]], [[function-decorators|데코레이터와 콜 포워딩]], [[code-readability|가독성을 높이는 전략]]
