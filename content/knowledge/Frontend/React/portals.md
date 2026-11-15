---
title: "포털: createPortal로 다른 DOM에 그리기"
concept: "React Portal"
summary: "createPortal(children, domNode)은 컴포넌트 트리의 위치는 그대로 두고 DOM만 다른 곳(보통 document.body)에 그린다. 모달·툴팁·토스트가 부모의 overflow·z-index에 갇히지 않게 할 때 쓰며, 이벤트 버블링과 Context는 DOM이 아니라 React 트리를 따른다."
tags: ["react", "dom", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/portals", "https://react.dev/reference/react-dom/createPortal"]
---

> [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)의 「[Portals](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/portals)」를 바탕으로, react.dev의 [createPortal](https://react.dev/reference/react-dom/createPortal) 문서로 보강한 노트다.

## 포털이란

**포털(portal)**은 자식을 부모 DOM 노드 밖의 다른 DOM 노드에 그리는 방법이다. 컴포넌트는 트리에서 원래 자리에 그대로 있고, **실제 DOM만** 다른 곳에 붙는다.

모달을 버튼 옆에서 그리면 조상 요소의 `overflow: hidden`에 잘리거나, 조상이 만든 쌓임 맥락(stacking context) 때문에 `z-index`를 아무리 올려도 다른 요소 아래에 깔린다. 포털로 `document.body` 아래에 그리면 이 제약에서 벗어난다.

| 쓰임 | 이유 |
| --- | --- |
| 모달·다이얼로그 | 화면 전체를 덮어야 한다 |
| 툴팁·팝오버·드롭다운 메뉴 | 스크롤 영역(`overflow`)에 잘리지 않아야 한다 |
| 토스트 알림 | 어느 화면에서 띄워도 같은 자리에 쌓인다 |
| React 밖 DOM에 React UI 넣기 | 지도 라이브러리의 마커 영역, 서버가 그린 페이지의 일부 |

## 사용법

```tsx
import { createPortal } from 'react-dom'

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return createPortal(
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    document.body,   // 그릴 DOM 노드
  )
}

function App() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ overflow: 'hidden' }}>
      <button onClick={() => setOpen(true)}>열기</button>
      {open && <Modal onClose={() => setOpen(false)}>모달 내용</Modal>}
    </div>
  )
}
```

- 시그니처는 `createPortal(children, domNode, key?)`이고 `react-dom`에서 가져온다. 반환값(`ReactPortal`)은 JSX처럼 렌더링 결과로 돌려준다.
- 대상 노드는 이미 존재해야 한다. `index.html`에 `<div id="modal-root">`를 두고 `document.getElementById('modal-root')!`로 가져오거나 `document.body`를 쓴다.
- 서버 렌더링에서는 `document`가 없으므로, 마운트된 뒤에만 포털을 그린다(`useEffect`에서 노드를 state에 담는 식).

## DOM이 아니라 React 트리를 따른다

| 동작 | 따르는 것 | 결과 |
| --- | --- | --- |
| 이벤트 버블링 | React 트리 | 포털 안에서 일어난 클릭이 DOM상 조상이 아닌 **React 부모**의 `onClick`까지 올라간다 |
| Context | React 트리 | 포털 안에서도 부모가 제공한 테마·인증 Context를 그대로 읽는다 |
| CSS 상속·선택자 | DOM 트리 | 부모의 CSS 상속·`.parent .child` 선택자는 적용되지 않는다 |

버블링 때문에 모달 안을 클릭했는데 부모의 「바깥 클릭 시 닫기」 핸들러가 실행되는 일이 생긴다. 모달 쪽에서 `e.stopPropagation()`을 부르거나, 바깥 클릭 판정을 `e.target`으로 한다.

## 접근성과 대안

포털은 DOM 위치만 옮길 뿐 모달의 접근성은 챙겨 주지 않는다. 포커스를 모달 안에 가두고, 닫으면 연 버튼으로 돌려주고, Esc로 닫고, `role="dialog"`·`aria-modal`을 붙이는 일은 따로 해야 한다. 그래서 직접 만들기보다 Radix·MUI 같은 라이브러리의 Dialog(내부에서 포털을 쓴다)를 쓰는 경우가 많다([[confirm-dialog|MUI Dialog로 삭제 확인 창 만들기]]).

브라우저의 `<dialog>` 요소를 `showModal()`로 열거나 Popover API(`popover` 속성)를 쓰면 **최상위 레이어(top layer)**에 올라가, 포털 없이도 `overflow`·`z-index` 문제를 피하고 포커스 관리와 Esc 닫기를 브라우저가 해 준다.

## 역사

클래스 컴포넌트 시절에는 `componentDidMount`에서 `document.createElement('div')`로 만든 요소를 `modalRoot`에 붙이고, `componentWillUnmount`에서 떼어 내고, `render`에서 `ReactDOM.createPortal(this.props.children, this.el)`을 돌려주는 패턴이 흔했다. 훅으로는 `useRef`로 요소를 한 번만 만들고 `useEffect`에서 붙였다 떼는 같은 구조로 옮겨졌다. 대상 노드가 이미 있으면 이 과정 없이 바로 `createPortal`에 넘기면 된다.

## 정리

- 포털은 React 트리 위치는 그대로, DOM만 다른 곳에 그린다. 모달·툴팁이 `overflow`·`z-index`에 갇히지 않게 한다.
- 이벤트 버블링과 Context는 React 트리를, CSS는 DOM 트리를 따른다.
- 포커스 관리·Esc·ARIA는 직접 챙기거나 라이브러리 Dialog를 쓴다. `<dialog>`·Popover API의 top layer도 대안이다.

관련 노트: [[confirm-dialog|MUI Dialog로 삭제 확인 창 만들기]], [[react-events|React 이벤트 처리]], [[context|Context와 전역 상태]], [[composition|합성: 상속 대신 Composition]], [[react-typescript|React와 TypeScript]]
