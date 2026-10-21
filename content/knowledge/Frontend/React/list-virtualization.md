---
title: "리스트 가상화(Windowing)"
concept: "List Virtualization"
summary: "항목이 수천 개인 목록에서 화면에 보이는 항목만 DOM에 그리고 나머지는 높이만 차지하게 하는 기법. 원리(전체 높이 + 보이는 구간 계산 + 절대 위치), TanStack Virtual·react-window 사용법, 가변 높이·접근성·찾기 기능 같은 한계와 content-visibility 대안을 정리한다."
tags: ["react", "performance", "rendering", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/react-virtualized.md", "https://tanstack.com/virtual/latest/docs/introduction", "https://github.com/bvaughn/react-window", "https://web.dev/articles/virtualize-long-lists-react-window"]
---

> 「[Frontend_TIL: react-virtualized](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/react-virtualized.md)」를 바탕으로 재구성하고, [TanStack Virtual](https://tanstack.com/virtual/latest/docs/introduction)·[react-window](https://github.com/bvaughn/react-window) 문서로 현재 도구를 맞춘 노트다.

## 가상화란

목록 항목이 수천 개면 `map`으로 전부 그리는 것만으로 첫 렌더링이 느려지고, DOM 노드가 많아 스크롤·입력 반응도 무거워진다([[inp-optimization|INP 최적화]]). **리스트 가상화(virtualization, windowing)**는 **스크롤 영역에 보이는 항목과 그 앞뒤 몇 개만** 실제로 렌더링하고, 나머지는 그리지 않은 채 스크롤 높이만 유지하는 기법이다. 스크롤하면 보이는 구간이 바뀌고, 들어온 항목은 그리고 나간 항목은 지운다.

`React.memo`는 바뀌지 않은 항목의 **다시 그리기**를 막을 뿐 처음 그리는 비용과 DOM 개수는 줄이지 못한다. 가상화는 **그리는 개수 자체**를 줄인다.

## 원리

```text
스크롤 컨테이너 (height: 500px, overflow: auto)
└─ 안쪽 박스 (height: 항목 수 × 항목 높이 = 10000 × 50 = 500000px)  ← 스크롤바 길이를 만든다
   ├─ 항목 #120 (position: absolute; transform: translateY(6000px))
   ├─ 항목 #121 (translateY(6050px))
   └─ … 보이는 구간 + overscan 몇 개만

scrollTop이 바뀔 때마다
  시작 인덱스 = floor(scrollTop / 항목 높이) - overscan
  끝 인덱스   = ceil((scrollTop + 컨테이너 높이) / 항목 높이) + overscan
```

그래서 라이브러리는 **컨테이너 크기, 항목 수, 항목 높이(또는 추정치), 항목을 그리는 함수**를 받는다. 각 항목에는 라이브러리가 계산한 위치 스타일을 반드시 붙여야 한다. 빠뜨리면 모든 항목이 맨 위에 겹친다.

## 사용하기

### TanStack Virtual

헤드리스 훅이라 마크업을 직접 쓴다. 높이가 제각각인 항목도 렌더링 뒤 실제 크기를 재서 보정한다.

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function TodoList({ todos }: { todos: Todo[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: todos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 57,   // 추정 높이. 실제 높이는 measureElement로 잰다
    overscan: 5,
  })

  return (
    <div ref={parentRef} style={{ height: 513, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={item.key}
            data-index={item.index}
            ref={virtualizer.measureElement}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}
          >
            <TodoListItem todo={todos[item.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 컴포넌트형 라이브러리

| 라이브러리 | 특징 |
| --- | --- |
| react-window | 작고 단순하다. 고정·가변 높이 목록과 그리드. 행 컴포넌트가 받은 `style`을 루트 요소에 넣는다 |
| react-virtuoso | 가변 높이 자동 측정, 아래에서 위로 쌓는 채팅 목록, 그룹 헤더가 내장돼 있다 |
| TanStack Virtual | 헤드리스. 목록·그리드·가로 스크롤을 한 훅으로 |

과거에는 react-virtualized(`<List width height rowCount rowHeight rowRenderer />`, `rowRenderer({ index, key, style })`)를 많이 썼다. 같은 저자가 더 작게 다시 만든 것이 react-window이고, react-virtualized는 새 기능 개발이 멈췄다.

## 한계

| 문제 | 이유 | 대응 |
| --- | --- | --- |
| 브라우저 찾기(Ctrl+F)로 화면 밖 항목을 못 찾는다 | DOM에 없다 | 목록 안 검색 기능을 따로 제공한다 |
| 스크린 리더가 전체 개수를 모른다 | 몇 개만 DOM에 있다 | `aria-setsize`·`aria-posinset`으로 전체 크기와 위치를 알린다 |
| 빠르게 스크롤하면 빈칸이 잠깐 보인다 | 그리기가 스크롤을 못 따라간다 | `overscan`을 늘리고 항목을 가볍게(`memo`) |
| 가변 높이에서 스크롤바가 튄다 | 추정 높이와 실제 높이가 다르다 | 추정치를 실제 평균에 가깝게, 측정 기능 사용 |
| 항목 안 state가 사라진다 | 화면 밖으로 나가면 언마운트된다 | state를 목록 밖(부모·스토어)으로 올린다 |

수백 개 정도라면 가상화 대신 CSS `content-visibility: auto`(+ `contain-intrinsic-size`)로 화면 밖 구역의 레이아웃·페인트만 건너뛰는 방법이 더 간단하다. DOM은 그대로 있어 찾기·접근성 문제가 없다. 서버에서 끝없이 이어 받는 목록이면 [[tanstack-query#페이지네이션과 무한 스크롤|useInfiniteQuery]]와 가상화를 함께 쓴다.

## 정리

- 가상화는 보이는 항목만 DOM에 그리고 전체 높이는 빈 박스로 유지한다.
- 필요한 입력은 컨테이너 크기, 항목 수, 항목 높이(추정), 그리는 함수. 항목에는 계산된 위치 스타일을 꼭 붙인다.
- 지금 쓰는 도구는 TanStack Virtual·react-window·react-virtuoso다. react-virtualized는 옛 도구다.
- 찾기·접근성·항목 state 소실이라는 대가가 있으니, 수천 개 이상일 때 쓰고 그 아래는 `content-visibility`부터 검토한다.

관련 노트: [[lists-and-keys|리스트와 Key]], [[re-rendering|리렌더링 원인과 추적]], [[inp-optimization|INP 최적화]], [[realtime-chat-app|실시간 채팅 앱의 데이터 흐름]], [[intersection-observer|Intersection Observer]]
