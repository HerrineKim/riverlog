---
title: "React와 TypeScript"
concept: "React TypeScript"
summary: "React 코드에 타입을 붙이는 자리별 방법. 컴포넌트는 props 타입을 매개변수에 붙인 평범한 함수로 쓰고, children은 ReactNode, HTML 요소 감싸기는 ComponentProps<'button'>, ref는 React 19부터 Ref<T> prop으로 받는다. props 조합은 판별 유니언·never·오버로드로 제한하고, 제네릭 컴포넌트로 목록 항목 타입을 이어 준다. 이벤트·훅(useState·useRef·useReducer·useActionState·useOptimistic)·Context·클래스·Redux의 타입까지."
tags: ["react", "typescript", "state", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://react.vlpt.us/using-typescript/", "https://react.vlpt.us/using-typescript/02-ts-react-basic.html", "https://react.vlpt.us/using-typescript/03-ts-manage-state.html", "https://react.vlpt.us/using-typescript/04-ts-context.html", "https://react.vlpt.us/using-typescript/05-ts-redux.html", "https://react.vlpt.us/using-typescript/06-ts-redux-middleware.html", "https://react.dev/learn/typescript", "https://redux.js.org/usage/usage-with-typescript", "https://github.com/typescript-cheatsheets/react", "https://react-typescript-cheatsheet.netlify.app/docs/basic/setup", "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/function_components", "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/default_props", "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example", "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks", "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forms_and_events", "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context", "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forward_and_create_ref", "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/class_components", "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/patterns_by_usecase", "https://react-typescript-cheatsheet.netlify.app/docs/reference/ReactNode", "https://react-typescript-cheatsheet.netlify.app/docs/reference/ComponentProps", "https://react-typescript-cheatsheet.netlify.app/docs/reference/CSSProperties", "https://react-typescript-cheatsheet.netlify.app/docs/reference/Ref"]
---

> 벨로퍼트의 「[벨로퍼트와 함께하는 모던 리액트](https://react.vlpt.us/)」 중 「[리액트 프로젝트에서 타입스크립트 사용하기](https://react.vlpt.us/using-typescript/)」 장을 바탕으로 재구성하고, [react.dev의 Using TypeScript](https://react.dev/learn/typescript)와 [Redux 공식 TypeScript 가이드](https://redux.js.org/usage/usage-with-typescript)로 최신화한 노트다.
> [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)([GitHub](https://github.com/typescript-cheatsheets/react))를 바탕으로 다시 짰다. 타입 이름과 시그니처는 `@types/react` 19.3 정의로 확인했다.

React에서 TypeScript를 쓰면 컴포넌트를 쓰는 쪽에서 **어떤 props가 필요한지**, 컴포넌트 안에서 state와 props에 무엇이 있는지, Redux store에 어떤 값이 있는지 에디터가 바로 알려 준다. 빠뜨린 props나 잘못된 액션은 실행 전에 에러로 잡힌다. TypeScript 문법 자체(`type`과 `interface`, `satisfies`, 유틸리티 타입)는 [[typescript-basics|TypeScript: 개념과 문법 한눈에 보기]]에 있고, 이 노트는 React의 각 자리에 타입을 붙이는 방법을 다룬다.

## 시작하기

- 컴포넌트 파일은 `.tsx`, JSX가 없는 파일은 `.ts`다.
- 새 프로젝트는 TypeScript 템플릿으로 만든다.

  | 도구 | 명령 |
  | --- | --- |
  | Vite (프레임워크 없는 SPA) | `npm create vite@latest my-app -- --template react-ts` |
  | Next.js | `npx create-next-app@latest` (TypeScript가 기본) |
  | React Router 프레임워크 모드 | `npx create-react-router@latest` |
  | Expo | `npx create-expo-app` (TypeScript가 기본) |

  과거에는 `npx create-react-app my-app --typescript`(나중에 `--template typescript`)를 썼다.
- `react`·`react-dom`의 타입은 `@types/react`·`@types/react-dom`으로 따로 설치한다. 라이브러리가 자체 타입(`index.d.ts`)을 싣고 있으면 설치할 것이 없다. Redux, React Redux(v8부터), Redux Toolkit은 자체 타입을 싣는다. 과거에는 `@types/react-redux`를 따로 설치했다.
- 빠르게 재현해 볼 때는 TypeScript Playground나 StackBlitz의 react-ts 템플릿을 쓴다.

## 함수 컴포넌트

컴포넌트는 **props 타입을 매개변수에 붙인 평범한 함수**로 쓴다. 반환 타입은 추론에 맡긴다.

```tsx
type AppProps = { message: string }

function App({ message }: AppProps) {
  return <div>{message}</div>
}

// 반환 타입을 못 박고 싶으면
const App2 = ({ message }: AppProps): React.JSX.Element => <div>{message}</div>
```

### React.FC를 쓰지 않는 이유

`const App: React.FC<AppProps> = ({ message }) => ...`로 쓰는 코드가 많았다. 예전 `FC`는 받지 않는 컴포넌트에도 `children`을 열어 두었고, `defaultProps`와 함께 쓰면 기본값이 타입에 반영되지 않았다. React 18 타입부터 암묵적 `children`이 빠졌고 TypeScript 5.1부터 컴포넌트 반환 타입 제약도 풀려, 지금 `FC`는 **스타일 차이**일 뿐이다. 그래도 평범한 함수가 짧고, 제네릭 컴포넌트를 만들 수 있어 표준이다. 기존 코드에서 `FC`를 걷어 내는 jscodeshift 코드모드(`codemod-replace-react-fc-typescript`)도 있다.

### 반환 타입: ReactNode와 JSX.Element

| 타입 | 뜻 | 쓰는 자리 |
| --- | --- | --- |
| `React.ReactNode` | React가 **그릴 수 있는 모든 것**: 엘리먼트, `string`, `number`, `bigint`, `boolean`, `null`, `undefined`, 그 배열(Iterable), 포털, `Promise<ReactNode>` | `children`, 내용을 받는 prop(`label`, `icon`) |
| `React.ReactElement` | JSX·`createElement`가 만든 **객체 하나**(`type`·`props`·`key`). 문자열은 아니다 | 엘리먼트 하나만 받을 때 |
| `React.JSX.Element` | JSX 식의 추론 타입. 사실상 `ReactElement<any, any>` | 반환 타입을 명시할 때 |

- 컴포넌트가 **받는** 것은 `ReactNode`, 컴포넌트가 **돌려주는** 타입은 추론에 맡기거나 `JSX.Element`로 적는다. 반환 타입을 `ReactNode`로 적으면 지나치게 넓다.
- 전역 `JSX` 네임스페이스는 `@types/react` 18.3에서 deprecated되고 19에서 빠졌다. `React.JSX`를 쓴다.
- `Promise<ReactNode>`가 들어 있는 것은 async 서버 컴포넌트 때문이다. `async function UserProfile() { const user = await fetchUser(); return <p>{user.name}</p> }`를 `<Suspense>` 안에 두면 React가 Promise를 풀어 그린다([[react-server-components|React Server Components의 동작 원리]]).

## props 타입

### 자주 쓰는 모양

```tsx
type Props = {
  message: string
  count: number
  disabled: boolean
  names: string[]
  status: 'waiting' | 'success'                 // 문자열 리터럴 유니언
  obj: { id: string; title: string }
  objArr: { id: string; title: string }[]
  dict: Record<string, MyType>                   // 키 개수가 정해지지 않은 사전
  onClick: () => void                            // 가장 흔한 함수 prop
  onChange: (id: number) => void
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  optional?: OptionalType                        // 선택 prop
  setState: React.Dispatch<React.SetStateAction<number>>  // useState setter를 넘길 때
  children?: React.ReactNode
  style?: React.CSSProperties
}
```

- `object`는 「아무 객체」가 아니라 「원시값이 아닌 것」이고, `{}`·빈 `interface`·`Object`는 「`null`·`undefined`가 아닌 모든 값」이다(숫자·문자열도 들어간다). props 타입에는 거의 쓰지 않는다. 「정말 빈 객체」에 가까운 것은 `Record<string, never>`다.
- `Function` 타입은 호출 시그니처가 없어 쓰지 않는다. `() => void`처럼 모양을 적는다.
- `type`과 `interface`는 어느 쪽이든 된다. 앱의 props·state는 유니언·교차를 자유롭게 쓰는 `type`, 사용자가 선언 병합으로 확장해야 하는 라이브러리 공개 API는 `interface`가 관례다. 차이표는 [[typescript-basics|TypeScript 노트]]의 「type과 interface」에 있다.

### 기본값

React 19에서 함수 컴포넌트의 `defaultProps`는 **무시된다**(`Greet.defaultProps = {...}`는 동작하지 않고 `FunctionComponent` 타입에서도 빠졌다). 구조 분해 기본값을 쓰면 TypeScript가 그 prop을 선택 prop으로 본다.

```tsx
type GreetProps = { age?: number }

function Greet({ age = 21 }: GreetProps) { ... }

// 기본값을 여러 컴포넌트가 공유할 때
const defaults = { age: 21 } satisfies GreetProps
function Greet2({ age = defaults.age }: GreetProps) { ... }
```

클래스 컴포넌트는 `static defaultProps`가 계속 동작한다. props 타입에는 `age: number`(필수)로 적고, JSX가 `LibraryManagedAttributes`로 호출하는 쪽에서 선택으로 바꿔 준다.

## React가 주는 타입

### ComponentProps: 요소·컴포넌트의 props 가져오기

| 타입 | 주는 것 |
| --- | --- |
| `ComponentProps<'button'>` | `<button>`이 받는 모든 props. 컴포넌트면 `ComponentProps<typeof Modal>` |
| `ComponentPropsWithRef<T>` | 위 + `ref`. React 19 함수 컴포넌트에서는 `ref`가 이미 prop이라 `ComponentProps`와 같다 |
| `ComponentPropsWithoutRef<T>` | `ref`를 뺀 것. props를 다른 요소에 펼칠 때 `ref`가 새지 않게 |
| `ComponentRef<'input'>` | 그 요소·컴포넌트의 ref 대상 타입(`HTMLInputElement`) |

```tsx
// 라이브러리가 export하지 않은 prop 타입을 꺼낸다
import { Icon } from 'component-library'
type IconName = React.ComponentProps<typeof Icon>['name']   // 'warning' | 'checkmark'
```

`ComponentProps`는 `React.JSX.IntrinsicElements['button']`과 같은 결과이고, `React.ButtonHTMLAttributes<HTMLButtonElement>`로도 쓸 수 있다. **`React.HTMLProps`·`React.HTMLAttributes`는 쓰지 않는다.** `HTMLProps`는 모든 요소의 속성을 합친 타입이라 `type`이 `string`으로 넓어져 `<button {...rest}>`에서 에러가 나고, `HTMLAttributes`에는 `<button>` 전용 속성(`type`, `disabled`)이 없다.

### CSSProperties: style 객체

`React.CSSProperties`는 `style` prop의 타입이다. `csstype`을 바탕으로 모든 CSS 속성의 자동완성과 값 검사를 해 준다.

- 길이 속성에 숫자를 주면 `px`가 붙는다(`width: 100` → `100px`). `lineHeight`·`opacity`·`zIndex`·`flexGrow`는 단위 없이 그대로다.
- 벤더 접두사는 PascalCase로 쓴다(`WebkitTransform`, `MozAppearance`).
- 하나의 CSS 값만 받는 prop은 `csstype`의 `Property` 네임스페이스로 적는다: `color?: Property.Color`. `csstype`은 `@types/react`의 의존성이라 따로 설치하지 않는다.

**CSS 변수(`--accent`)는 그냥 쓰면 에러**다. `CSSProperties`에 인덱스 시그니처가 없기 때문이다.

```tsx
// 1) 단언: 한 번 쓸 때. 나머지 속성 검사도 사라진다
<div style={{ '--accent': 'tomato' } as React.CSSProperties} />

// 2) 템플릿 리터럴 키와 교차: 일반 속성 검사를 유지한다 (권장)
type CSSPropertiesWithVars = React.CSSProperties & { [key: `--${string}`]: string | number }
const style: CSSPropertiesWithVars = { color: 'white', '--accent': 'tomato' }

// 3) 모듈 보강: 디자인 시스템 변수 목록이 정해져 있을 때 (global.d.ts)
declare module 'react' {
  interface CSSProperties { '--accent'?: string; '--spacing'?: string | number }
}
```

emotion·styled-components 같은 CSS-in-JS 라이브러리는 `'&:hover'` 같은 키를 받도록 스스로 `CSSProperties`를 보강한다. 스타일링 방식 비교는 [[styling|React 스타일링]]에 있다.

### Ref, RefObject, RefCallback

| 타입 | 무엇 | 쓰는 자리 |
| --- | --- | --- |
| `RefObject<T>` | `{ current: T }` | `useRef`·`createRef`의 반환값 |
| `RefCallback<T>` | `(instance: T \| null) => void \| (() => void)` | `ref={(node) => ...}` 콜백 |
| `Ref<T>` | `RefCallback<T> \| RefObject<T \| null> \| null` | ref를 **prop으로 받을 때**. 부모가 어느 쪽을 넘겨도 된다 |

- `MutableRefObject`는 deprecated다. 이제 `useRef`는 언제나 `RefObject`를 돌려준다.
- `LegacyRef`(문자열 ref 포함)는 deprecated, `ForwardedRef`는 `forwardRef` 전용이다.
- React 19부터 콜백 ref가 **cleanup 함수를 반환**할 수 있다. 반환하면 언마운트 때 `null`로 다시 부르지 않고 cleanup을 부른다.

```tsx
<div ref={(node) => {
  const observer = new IntersectionObserver(onIntersect)
  observer.observe(node!)
  return () => observer.disconnect()
}} />
```

## ref를 받는 컴포넌트

React 19부터 함수 컴포넌트는 `ref`를 **일반 prop**으로 받는다. `forwardRef`가 필요 없다([[components-and-props|컴포넌트와 Props]]의 「ref도 props다」).

```tsx
// 1) 네이티브 요소의 props를 통째로 이어받기: ref도 들어 있다
function MyInput(props: React.ComponentProps<'input'>) {
  return <input {...props} />
}

// 2) 직접 적기: 받는 ref를 원하는 하위 요소에 단다
type LabelledInputProps = { label: string; ref?: React.Ref<HTMLInputElement> }
function LabelledInput({ label, ref }: LabelledInputProps) {
  return <label>{label}<input ref={ref} /></label>
}

const inputRef = useRef<HTMLInputElement>(null)
<LabelledInput label="이름" ref={inputRef} />
```

### useImperativeHandle: DOM 대신 메서드를 노출

```tsx
export type CountdownHandle = { start: () => void }

function Countdown({ ref }: { ref?: React.Ref<CountdownHandle> }) {
  useImperativeHandle(ref, () => ({ start() { alert('Start') } }))
  return <div>Countdown</div>
}

const countdownRef = useRef<CountdownHandle>(null)
countdownRef.current?.start()   // 타입 추론된다
```

### 과거: forwardRef와 createRef

React 18까지는 `forwardRef<HTMLButtonElement, Props>((props, ref) => <button ref={ref} ... />)`로 감쌌다. 제네릭 매개변수가 `<Ref 대상, Props>` 순서라 헷갈렸고, `forwardRef`로 감싼 컴포넌트는 **제네릭을 잃어서** `declare module 'react'`로 `forwardRef`를 다시 선언하거나 ref를 `listRef` 같은 다른 이름의 prop으로 받는 우회가 필요했다. `ref`가 prop이 되면서 이 문제가 사라졌다. `createRef<HTMLDivElement>()`는 클래스 컴포넌트의 필드에 쓴다.

## HTML 요소 감싸기

`<button>`의 모든 props를 받으면서 기능을 더한 `<Button>`은 `ComponentProps`를 확장한다. 자기 prop만 꺼내고 나머지를 펼친다.

```tsx
interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: 'primary' | 'ghost'
}

function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return <button className={`btn btn-${variant} ${className ?? ''}`} {...rest} />
}

<Button type="submit">저장</Button>   // type="foo"는 에러
```

내 prop 이름이 요소의 속성과 겹치면(`label`, `onChange`의 의미를 바꾸고 싶을 때) `Omit`으로 원래 것을 뺀다.

```tsx
type TextboxProps = {
  label: React.ReactNode
  onChange: (text: string) => void              // 이벤트 대신 문자열을 넘긴다
} & Omit<React.ComponentProps<'input'>, 'onChange' | 'label'>
// 겹치는 것을 모두 빼려면 Omit<..., keyof OwnProps>
```

## props 조합을 타입으로 제한하기

TypeScript는 구조적 타입이라 「최소한 이 속성이 있다」만 말한다. 「이것과 저것은 같이 올 수 없다」는 유니언으로 만든다.

| 원하는 것 | 방법 |
| --- | --- |
| 모드에 따라 다른 props | **판별 유니언**: 공통 리터럴 필드(`type`, `variant`)로 나눈다 |
| A나 B 중 하나만 | 반대쪽을 `?: never`로 막은 유니언 |
| 전부 주거나 하나도 안 주거나 | 묶어서 선택 객체 prop 하나로(`obj?: { a; b }`) |
| A가 있을 때만 B 허용 | 함수 오버로드 |
| `href`가 있으면 `<a>`, 없으면 `<button>` | 두 props 유니언 + 타입 가드 |

```tsx
// 판별 유니언: 가장 읽기 쉽다
type Props = { type: 'foo'; foo: string } | { type: 'bar'; bar: string }
function OneOrTheOther(props: Props) {
  return props.type === 'foo' ? <>{props.foo}</> : <>{props.bar}</>   // 분기마다 좁혀진다
}

// never로 「둘 중 하나만」
type Props2 = { foo: string; bar?: never } | { bar: string; foo?: never }

// 오버로드: expanded는 truncate가 있을 때만
type Common = { children?: React.ReactNode }
function Text(props: Common & { truncate?: false }): React.JSX.Element
function Text(props: Common & { truncate: true; expanded?: boolean }): React.JSX.Element
function Text({ children, truncate, expanded }: Common & { truncate?: boolean; expanded?: boolean }) {
  return <div className={truncate ? 'truncate' : ''} aria-expanded={!!expanded}>{children}</div>
}
// <Text expanded>...</Text> → 에러

// href로 요소를 고르기
type ButtonProps = React.ComponentProps<'button'> & { href?: undefined }
type AnchorProps = React.ComponentProps<'a'> & { href: string }
const isAnchor = (p: ButtonProps | AnchorProps): p is AnchorProps => p.href !== undefined
function Clickable(props: ButtonProps | AnchorProps) {
  return isAnchor(props) ? <a {...props} /> : <button {...props} />
}
// <Clickable href="/x" disabled /> → 에러: <a>에는 disabled가 없다
```

- 판별 유니언은 **값**으로 좁힌다. `typeof props.value === 'string'`처럼 타입으로 검사하면 다른 필드는 좁혀지지 않는다.
- 「모두 아니면 전무」를 `All | Record<string, never>`로 만들 수도 있지만, 빈 객체 타입은 공식 권장이 아니라 묶음 prop이 낫다.

### children 제한의 한계

`children`의 **구조**(하나, `[ReactNode, ReactNode]` 튜플, `number[]`, 함수)는 타입으로 정할 수 있다. 하지만 「`<Tabs>` 안에는 `<Tab>`만」처럼 **어떤 컴포넌트인지**는 정할 수 없다. JSX 식의 타입은 모두 `React.JSX.Element`로 뭉개지기 때문이다. 그런 제약은 런타임 검사나 합성 API 설계로 푼다([[composition|합성: 상속 대신 Composition]]).

render props는 `children: (value: string) => React.ReactNode`처럼 함수 타입으로 적는다. 다만 로직 재사용은 대부분 커스텀 훅이 낫다.

## 제네릭 컴포넌트

항목 타입이 정해지지 않은 목록·셀렉트·테이블은 **제네릭 함수**로 만든다. 넘긴 `items`에서 `T`가 추론되어 `renderItem`의 인자 타입까지 이어진다.

```tsx
type ListProps<T> = {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  getKey: (item: T) => React.Key
}

function List<T>({ items, renderItem, getKey }: ListProps<T>) {
  return <ul>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>
}

<List items={['a', 'b']} getKey={(s) => s} renderItem={(s) => s.toUpperCase()} /> // s: string
<List<number> items={['a']} ... />   // 타입 인자를 직접 주면 추론 대신 검사한다 → 에러
```

- `.tsx`에서 화살표 함수로 쓸 때는 `<T,>` 또는 `<T extends unknown>`으로 적는다. `<T>`만 쓰면 JSX 태그로 읽힌다: `const List = <T,>(props: ListProps<T>) => ...`
- `React.FC<Props>` 형태로는 제네릭 컴포넌트를 만들 수 없다. 평범한 함수를 쓰는 또 하나의 이유다.
- `ref`가 prop이라 제네릭 컴포넌트에도 그냥 `ref?: React.Ref<HTMLUListElement>`를 추가하면 된다.

**as prop(다형 컴포넌트)**은 `as?: React.ElementType`으로 받으면 동작은 하지만 넘긴 요소의 props는 검사하지 않는다. 요소에 맞춰 props까지 검사하려면 제네릭으로 묶는다.

```tsx
type TextProps<C extends React.ElementType> = { as?: C; children?: React.ReactNode } &
  Omit<React.ComponentProps<C>, 'as' | 'children'>

function Text<C extends React.ElementType = 'p'>({ as, ...rest }: TextProps<C>) {
  const Component: React.ElementType = as ?? 'p'   // 바깥 타입은 검사했으니 안쪽에서는 넓혀 쓴다
  return <Component {...rest} />
}

<Text as="a" href="/about">소개</Text>     // href 검사됨
<Text as="h2" href="/about">제목</Text>    // 에러
```

as prop 자체의 쓰임은 [[composition|합성: 상속 대신 Composition]]에 있다.

## 이벤트

핸들러를 JSX 안에 **인라인으로 쓰면 `e`가 자동으로 추론**된다(문맥적 타이핑). 따로 함수로 뺄 때만 적고, 모르면 JSX의 `onChange`에 마우스를 올려 에디터가 보여 주는 타입을 쓴다.

```tsx
// 1) 인자에 이벤트 타입
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setText(e.currentTarget.value)

// 2) 핸들러 자체에 타입 (@types/react가 정의한 핸들러 타입)
const onChange2: React.ChangeEventHandler<HTMLInputElement> = (e) => setText(e.currentTarget.value)

// 폼 제출: SubmitEvent의 target은 늘 HTMLFormElement다
const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
  e.preventDefault()
  const data = new FormData(e.currentTarget)
}
```

| 이벤트 타입 | 언제 |
| --- | --- |
| `ChangeEvent` | `<input>`·`<select>`·`<textarea>` 값 변경 |
| `InputEvent` | 값이 바뀌기 직전(`onBeforeInput`·`onInput`) |
| `SubmitEvent` | `<form>` 제출 |
| `MouseEvent` · `PointerEvent` | 마우스 · 마우스·펜·터치를 아우르는 포인터(새 코드는 포인터 권장) |
| `KeyboardEvent` | 키 하나의 입력 |
| `FocusEvent` | 포커스를 얻거나 잃을 때 |
| `DragEvent` · `TouchEvent` · `WheelEvent` | 드래그 앤 드롭 · 터치 · 휠(스크롤 이벤트와 다르다) |
| `ClipboardEvent` · `CompositionEvent` | 복사·붙여넣기 · 한글·일본어 같은 조합 입력 |
| `AnimationEvent` · `TransitionEvent` | CSS 애니메이션·트랜지션 |
| `InvalidEvent` | `max="10"`인데 20을 넣는 등 검증 실패 |
| `SyntheticEvent` | 모든 이벤트의 바탕. 무엇인지 모를 때 |

- `FormEvent`·`FormEventHandler`는 `@types/react` 19.2.10부터 deprecated다. 실제로 그런 이벤트가 없어서다. 제출은 `SubmitEvent`, 값 변경은 `ChangeEvent`·`InputEvent`를 쓴다. 옛 예제의 `onChange = (e: React.FormEvent<HTMLInputElement>)`는 `ChangeEvent`로 바꾼다.
- `e.target`과 `e.currentTarget`: 핸들러를 단 요소의 타입이 보장되는 쪽은 `currentTarget`이다. `ChangeEvent`의 `target`은 호환성 때문에 지금은 `currentTarget`과 같게 잡혀 있다.
- 비제어 폼에서 이름 붙은 입력을 꺼낼 때는 `new FormData(e.currentTarget).get('email')`이 단언(`e.target as typeof e.target & { email: { value: string } }`)보다 안전하다. React 19에서는 `<form action={fn}>`으로 `FormData`를 바로 받는다([[forms|폼과 제어 컴포넌트]]).
- 이벤트 처리 자체는 [[react-events|React 이벤트 처리]]에 있다.

## 훅의 타입

### useState

초깃값에서 타입을 추론한다(`useState(false)` → `boolean`). 제네릭은 **초깃값만으로 타입을 알 수 없을 때** 적는다.

```tsx
const [user, setUser] = useState<User | null>(null)   // 나중에 채워질 값
const [items, setItems] = useState<string[]>([])       // 빈 배열은 never[]로 추론된다
const [form, setForm] = useState<User>({} as User)     // 단언: 곧바로 채운다는 약속. 안 지키면 런타임 에러
```

setter를 자식에게 넘기는 prop 타입은 `React.Dispatch<React.SetStateAction<User | null>>`다.

### useRef

```tsx
const divRef = useRef<HTMLDivElement>(null)        // DOM 참조: RefObject<HTMLDivElement | null>
useEffect(() => {
  if (!divRef.current) throw new Error('divRef is not assigned')
  divRef.current.focus()                           // 여기서는 HTMLDivElement
})

const sureRef = useRef<HTMLDivElement>(null!)      // null이 아니라고 단언. 조건부 렌더링이면 런타임 에러

const intervalRef = useRef<number | null>(null)    // 렌더링과 무관한 값 보관. 직접 쓴다
intervalRef.current = window.setInterval(tick, 1000)
```

- 요소 타입은 구체적일수록 좋다. `HTMLElement`보다 `HTMLDivElement`.
- 이름을 모르면 일부러 틀린 타입을 넣어 에러 메시지에서 확인한다.
- `useRef`는 이제 초깃값이 필수다. `useRef<T>()`처럼 인자 없이 쓰던 코드는 `useRef<T>(undefined)`로 바꾼다.

### useReducer: 액션은 판별 유니언으로

액션을 `|`로 이은 **판별 유니언**으로 만들면, `switch`에서 `action.type`에 따라 나머지 필드가 좁혀지고 `dispatch`할 때 빠뜨린 필드가 에러로 잡힌다. reducer의 반환 타입을 적어 두면 분기에서 state 모양을 틀렸을 때 바로 잡힌다.

```tsx
type Color = 'red' | 'orange' | 'yellow'
type State = { count: number; text: string; color: Color; isGood: boolean }
type Action =
  | { type: 'SET_COUNT'; count: number }
  | { type: 'SET_TEXT'; text: string }
  | { type: 'SET_COLOR'; color: Color }
  | { type: 'TOGGLE_GOOD' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_COUNT': return { ...state, count: action.count } // action은 { type: 'SET_COUNT'; count: number }
    case 'SET_TEXT': return { ...state, text: action.text }
    case 'SET_COLOR': return { ...state, color: action.color }
    case 'TOGGLE_GOOD': return { ...state, isGood: !state.isGood }
    default: {
      const _exhaustive: never = action   // 새 액션을 추가하고 처리를 빠뜨리면 컴파일 에러
      return state
    }
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0, text: '', color: 'red', isGood: true })
dispatch({ type: 'SET_COLOR', color: 'orange' })  // color 오타나 누락은 에러
```

추론이 안 될 때는 `useReducer<State, [Action]>(reducer, initial)`처럼 액션 타입을 **요소 하나짜리 튜플**로 준다(React 19 타입).

### useCallback·useEffect

- `useCallback`의 함수 인자에는 일반 함수처럼 타입을 적는다. React 18 타입부터는 적지 않으면 `e`가 암묵적 `any` 에러다: `useCallback((e: React.MouseEvent<HTMLButtonElement>) => {...}, [])`.
- `useEffect`는 함수나 `undefined`만 반환해야 한다. 중괄호 없는 화살표 함수 `() => setTimeout(...)`은 타이머 id(숫자)를 반환해 에러다. 본문을 `{ }`로 감싼다.

### 커스텀 훅의 튜플 반환

배열을 돌려주면 `(boolean | typeof load)[]`처럼 섞인 배열로 추론된다. **`as const`**로 튜플로 만든다.

```tsx
export function useLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const load = (p: Promise<unknown>) => {
    setIsLoading(true)
    return p.finally(() => setIsLoading(false))
  }
  return [isLoading, load] as const   // readonly [boolean, (p: Promise<unknown>) => Promise<unknown>]
}
```

값이 셋 이상이면 튜플보다 객체를 돌려준다.

### React 19 액션 훅

```tsx
// useActionState(action, initialState): [state, dispatch, isPending]
// action의 두 번째 인자가 payload. <form action>에 넘기면 FormData가 온다
type State = { error: string | null }

async function updateName(prev: State, formData: FormData): Promise<State> {
  const name = formData.get('name')
  if (typeof name !== 'string' || !name) return { error: '이름을 입력해 주세요' }
  await saveName(name)
  return { error: null }
}

const [state, formAction, isPending] = useActionState(updateName, { error: null })
// <form action={formAction}>  /  버튼에서 직접 부르면 startTransition(() => formAction(fd)) 안에서

// useOptimistic(state, reducer): [optimisticState, addOptimistic]
const [optimisticTodos, addOptimistic] = useOptimistic(
  todos,
  (current: Todo[], newTodo: Todo) => [...current, { ...newTodo, pending: true }],
)

// useFormStatus (react-dom): 부모 <form>의 상태. pending이 true일 때만 data·method·action이 채워진 유니언
const { pending } = useFormStatus()
```

- `useActionState<State, Payload>`의 State는 `Awaited<State>`로 풀린다. async 액션이어도 `state`는 Promise가 아니다.
- payload가 없는 액션이면 `dispatch`는 `() => void`다.
- 이 훅들은 트랜지션 위에서 돈다. `useTransition`·`use`·`Suspense`의 타입과 쓰임은 [[concurrent-rendering|동시성 렌더링]]과 [[react-use-hook|use 훅과 리액트 비동기 처리]]에 있다.

## Context: null 기본값 + 검사하는 훅

의미 있는 기본값이 있으면 `createContext<'light' | 'dark'>('light')`로 끝난다. 없으면 기본값을 `null`로 두고, **Provider 밖 사용을 막는 커스텀 훅**에서 `null`을 걸러 준다. 쓰는 쪽은 `null` 검사 없이 정확한 타입을 받고, Provider를 빠뜨리면 콘솔에 분명한 에러가 남는다. 이 구조 자체는 [[context|Context와 전역 상태]]에 있다.

```tsx
type SampleDispatch = React.Dispatch<Action>

const SampleStateContext = createContext<State | null>(null)
const SampleDispatchContext = createContext<SampleDispatch | null>(null)

export function SampleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <SampleStateContext value={state}>
      <SampleDispatchContext value={dispatch}>{children}</SampleDispatchContext>
    </SampleStateContext>
  )
}

export function useSampleState() {
  const state = use(SampleStateContext)   // useContext도 같다
  if (!state) throw new Error('useSampleState는 <SampleProvider> 안에서 써야 한다')
  return state                            // State 타입
}
```

- React 19부터 `<Ctx.Provider value>` 대신 `<Ctx value>`로 쓴다. 읽기는 `useContext`와 조건문 안에서도 부를 수 있는 `use` 둘 다 된다.
- 검사 대신 단언하는 방법도 있다: `use(Ctx)!.username`, `createContext<T>({} as T)`, `createContext<T>(null!)`. Provider를 빠뜨려도 타입 에러 없이 런타임에 터지므로, 고민되면 **런타임 검사 + throw**를 고른다.

## 클래스 컴포넌트

새 코드는 함수 컴포넌트로 쓰지만, 에러 경계는 지금도 클래스로만 만든다([[frontend-error-handling|프런트엔드 에러 핸들링]]). `React.Component<Props, State>` 두 제네릭을 준다.

```tsx
type MyProps = { message: string }
type MyState = { count: number }

class App extends React.Component<MyProps, MyState> {
  state: MyState = { count: 0 }     // 필드에도 적어야 this.state 추론이 정확하다
  pointer!: number                   // 나중에 채울 필드. 초기값 없이 선언
  increment = (amt: number) => this.setState((s) => ({ count: s.count + amt }))
  render() {
    return <div onClick={() => this.increment(1)}>{this.props.message} {this.state.count}</div>
  }
}
```

- 제네릭의 State는 `setState`의 타입을, 필드 선언은 `this.state`의 타입을 정한다. 둘 다 적는다.
- props·state에 `readonly`를 붙일 필요는 없다. `React.Component`가 이미 읽기 전용으로 잡는다.
- `static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null`처럼 반환 타입을 적는다. 정적 멤버는 클래스의 제네릭 `T`를 쓸 수 없어, 제네릭 클래스에서는 메서드 자체에 `<T>`를 붙인다. 파생 state는 대부분 렌더링 중 계산이나 `useMemo`로 대신한다.

## Redux: store에서 타입을 추론한다

Redux Toolkit은 `createSlice`의 `initialState`와 `PayloadAction<T>`에서 대부분의 타입을 추론한다. 앱에서 직접 할 일은 store에서 두 타입을 뽑고, 미리 타입을 붙인 훅을 한 번 만드는 것이다.

```ts
// app/store.ts
export const store = configureStore({ reducer: { counter: counterSlice.reducer, todos: todosSlice.reducer } })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// app/hooks.ts — store 파일과 분리해 순환 참조를 피한다 (react-redux 9.1+)
import { useDispatch, useSelector } from 'react-redux'
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

```ts
// features/counter/counterSlice.ts
const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 } as CounterState,
  reducers: {
    increaseBy: (state, action: PayloadAction<number>) => { state.count += action.payload },
  },
})

// 컴포넌트
const count = useAppSelector((state) => state.counter.count) // number로 추론
const dispatch = useAppDispatch()
dispatch(counterSlice.actions.increaseBy(5))                // 인자 타입 검사
```

- 기본 `useDispatch`의 타입은 thunk를 모른다. thunk를 dispatch하려면 `useAppDispatch`를 쓴다.
- 비동기 thunk의 타입(`createAsyncThunk.withTypes`)은 [[redux-middleware|Redux 미들웨어와 비동기 처리]]에 있다.

과거에는 손으로 쓴 Redux에 타입을 붙이느라 코드가 많았다. 액션 타입 상수에 `as const`를 붙여 `string`이 아닌 리터럴로 추론되게 하고, `ReturnType<typeof increase> | ReturnType<typeof decrease>`로 액션 유니언을 만들고, `ReturnType<typeof rootReducer>`로 `RootState`를 뽑았다. 이를 줄이려고 typesafe-actions(`createStandardAction`·`createReducer`·`ActionType<typeof actions>`)를 쓰기도 했다. 이 일을 지금은 `createSlice`가 모두 한다. 직접 쓴 reducer에는 redux의 `Reducer<State, Action>` 타입을 붙이면 반환 타입까지 잡힌다.

## 정리

- 컴포넌트는 props 타입을 붙인 평범한 함수다. `React.FC`와 함수 컴포넌트 `defaultProps`는 쓰지 않고, 기본값은 구조 분해로 준다.
- 받는 내용은 `ReactNode`, HTML 요소 감싸기는 `ComponentProps<'button'>`, 스타일은 `CSSProperties`, ref prop은 `Ref<T>`.
- React 19에서 `ref`는 prop이다. `forwardRef` 없이 받고, 제네릭 컴포넌트에도 그대로 붙는다.
- 같이 올 수 없는 props는 판별 유니언·`never`·오버로드로 막는다.
- 이벤트는 인라인이면 추론에 맡기고, 제출은 `SubmitEvent`, 값 변경은 `ChangeEvent`.
- `useState` 제네릭은 `null`·빈 배열일 때만, reducer 액션은 판별 유니언, 커스텀 훅 튜플은 `as const`, Context는 `null` + 검사하는 훅.
- Redux는 store에서 `RootState`·`AppDispatch`를 추론하고 `withTypes`로 만든 훅만 쓴다.

관련 노트: [[components-and-props|컴포넌트와 Props]], [[typescript-basics|TypeScript: 개념과 문법 한눈에 보기]], [[typescript-advanced-types|TypeScript로 동적인 코드에 정적 타입 입히기]], [[context|Context와 전역 상태]], [[hooks|React Hooks]], [[forms|폼과 제어 컴포넌트]], [[react-events|React 이벤트 처리]], [[composition|합성: 상속 대신 Composition]], [[concurrent-rendering|동시성 렌더링]], [[portals|포털]], [[redux|Redux와 react-redux]], [[redux-middleware|Redux 미들웨어와 비동기 처리]]
