---
title: "Storybook: 컴포넌트를 상태별로 떼어 보는 도구"
concept: "Storybook"
summary: "컴포넌트를 앱에서 떼어 내 상태별 '스토리'로 등록하고 보고·조작·테스트하는 UI 작업장. CSF3 스토리 객체와 args·argTypes, meta·스토리·전역 3단계 설정, decorators, 사이드바 계층, Storybook 9부터 코어에 들어간 Controls·Actions·Viewport 같은 도구, TypeScript의 Meta·StoryObj와 satisfies, 스토리를 그대로 테스트로 쓰는 흐름까지 정리한다."
tags: ["testing", "component", "design-system", "react", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Storybook.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Storybook%282%29.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Storybook%283%29.md", "https://storybook.js.org/docs/writing-stories", "https://storybook.js.org/docs/configure/integration/typescript", "https://storybook.js.org/docs/releases/migration-guide"]
---

> 「[Frontend_TIL: Storybook](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Storybook.md)」 1~3편을 바탕으로, 문법은 Storybook 10 공식 문서로 확인해 재구성한 노트다.

## Storybook이란

**Storybook**은 컴포넌트를 앱에서 떼어 내 **상태별로 등록해 두고** 따로 띄워 보는 UI 작업장(workshop)이다. 등록한 상태 하나를 **스토리(story)** 라고 한다. 버튼의 `primary`·`disabled`·`loading`처럼 앱에서 재현하려면 라우트를 옮기고 데이터를 꾸며야 하는 상태를, 스토리 목록에서 바로 고른다.

| 쓰임 | 내용 |
| --- | --- |
| 개발 | 컴포넌트 하나만 띄워 놓고 상태를 바꿔 가며 만든다. 컴포넌트 주도 개발(Component-Driven Development)의 기본 도구다 |
| 문서 | 스토리와 props 표가 곧 컴포넌트 사용 설명서다. 디자이너·기획자와 같은 화면을 보고 이야기한다 |
| 테스트 | 스토리를 렌더링 테스트·상호작용 테스트·시각 회귀·접근성 검사의 입력으로 그대로 쓴다 |

```bash
npm create storybook@latest      # 과거에는 npx sb init
npm run storybook                # 기본 6006 포트
```

설치하면 `.storybook/main.ts`(어떤 파일이 스토리인지, 프레임워크, 애드온)와 `.storybook/preview.ts`(모든 스토리에 적용할 전역 설정)가 생긴다.

## 스토리 쓰기: CSF3

스토리 파일은 **CSF(Component Story Format)** 라는 ES 모듈 규칙을 따른다. `default export`가 컴포넌트 단위 설정(**meta**)이고, 이름 붙은 export 하나하나가 스토리다. 컴포넌트 옆에 `Button.stories.tsx`로 둔다.

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from './Button'

const meta = {
  title: 'Form/Button',            // 사이드바 경로. 생략하면 파일 위치로 자동 생성
  component: Button,
  args: { children: 'Button', onClick: fn() },   // 모든 스토리 공통 args
  argTypes: {
    color: { control: 'radio', options: ['blue', 'gray', 'orange'] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Blue: Story = { args: { color: 'blue' } }
export const Gray: Story = { args: { color: 'gray' } }
export const LongGray: Story = {
  name: 'Gray (긴 텍스트)',          // 사이드바에 보일 이름
  args: { ...Gray.args, children: '아주 긴 버튼 텍스트' },
}
```

| 요소 | 역할 |
| --- | --- |
| `args` | 스토리가 컴포넌트에 넘길 props. 스토리 → meta → 전역 순으로 **가까운 쪽이 이긴다** |
| `argTypes` | args를 어떻게 다룰지. 컨트롤 종류(`radio`·`select`·`color`…), 선택지, 설명 |
| `title` | 사이드바 계층. `Form/Button`이면 Form 폴더 안의 Button |
| `name` | 스토리 표시 이름. export 이름은 짧게, 보이는 이름은 자세하게 |
| `fn()` | 호출을 기록하는 스파이. Actions 패널에 이벤트가 찍히고 테스트에서 단언할 수 있다 |

- 스토리가 **객체**라서 다른 스토리의 `args`를 펼쳐 재사용한다. 스토리를 다른 스토리 안에 컴포넌트로 넣어 조합할 수도 있다.
- 과거 CSF2는 `const Template = (args) => <Button {...args} />`를 만들고 `Template.bind({})`로 스토리를 복제했으며, 표시 이름은 `Blue.storyName`으로 바꿨다. 그보다 앞에는 스토리를 JSX를 돌려주는 함수(`export const Blue = () => <Button color="blue" />`)로만 썼다. 지금도 함수 스토리는 `render`로 쓸 수 있지만 args를 거치지 않으면 컨트롤로 값을 바꿀 수 없다.

### TypeScript

| 쓰는 법 | 특징 |
| --- | --- |
| `const meta = { … } satisfies Meta<typeof Button>` + `StoryObj<typeof meta>` | **권장.** meta에 넣은 args가 타입에 반영되어, meta에서 채운 필수 props를 스토리마다 다시 쓰라고 요구하지 않는다(TS 4.9+) |
| `const meta: Meta<typeof Button> = { … }` + `StoryObj<typeof Button>` | 타입 주석 방식. meta의 args를 추론하지 못해 필수 props 오류가 날 수 있다 |

args가 컴포넌트 props와 맞지 않으면 타입 오류가 난다. 별도 설정 없이 프레임워크 패키지(`@storybook/react-vite`, `@storybook/nextjs-vite` 등)에서 타입을 가져온다.

## 설정의 세 층

같은 설정(args, decorators, parameters)을 세 곳에 둘 수 있고, **아래로 갈수록 범위가 좁고 우선한다.**

```text
.storybook/preview.ts   전역     모든 스토리
Button.stories.tsx      meta     이 컴포넌트의 모든 스토리
  export const Blue     스토리    이 스토리 하나
```

### decorators

**decorator**는 스토리를 감싸는 함수다. 가운데 정렬 같은 Storybook 전용 배치, 테마·라우터·데이터 Provider처럼 컴포넌트가 앱에서 기대하는 바깥 환경을 넣는다.

```tsx
// meta에 두면 이 컴포넌트의 스토리만, preview.ts에 두면 전부 감싼다
decorators: [(Story) => <div style={{ display: 'flex', justifyContent: 'center' }}><Story /></div>],
```

### parameters

정렬·배경·뷰포트처럼 **Storybook 기능에 주는 설정**이다. 예를 들어 사이드바 정렬은 `preview.ts`에서 정한다.

```ts
// .storybook/preview.ts
const preview = {
  parameters: {
    layout: 'centered',                                  // 단순 가운데 정렬은 이것으로 충분
    options: { storySort: { method: 'alphabetical' } },  // 기본은 import 순서
  },
}
export default preview
```

## 화면을 살피는 도구

대부분의 기능은 애드온으로 붙는다. **Storybook 9부터 자주 쓰는 도구는 코어에 들어가** 따로 설치하지 않는다(과거에는 `@storybook/addon-essentials` 묶음을 설치했다). 문서(Docs)·접근성(a11y)·테스트(Vitest)는 별도 애드온이다.

| 도구 | 하는 일 |
| --- | --- |
| Controls | args를 라디오·텍스트·색 선택 UI로 바꿔 즉석에서 상태를 바꾼다. **args로 쓴 스토리에서만 동작한다** |
| Actions | `onClick` 같은 콜백이 불렸는지, 어떤 인자로 불렸는지 로그로 보여 준다 |
| Backgrounds | 배경색을 바꿔 라이트·다크에서 확인한다 |
| Viewport | 기기 크기를 바꿔 반응형을 확인한다 |
| Measure·Outline | 선택한 요소의 박스 모델(margin·padding·크기)과 모든 요소의 윤곽선을 보여 준다 |
| Docs (`@storybook/addon-docs`) | 스토리·props 표·소스로 문서 페이지를 자동 생성한다. `tags: ['autodocs']` |
| a11y (`@storybook/addon-a11y`) | 스토리마다 axe 검사 결과를 보여 준다([[accessibility-evaluation\|접근성 평가]]) |

## 스토리를 테스트로 쓰기

스토리는 **이미 준비(Arrange)를 끝낸 테스트 케이스**다. 그래서 같은 스토리를 여러 테스트의 입력으로 재사용한다.

| 테스트 | 방법 |
| --- | --- |
| 렌더링(스모크) | 모든 스토리가 에러 없이 그려지는지. `@storybook/addon-vitest`가 스토리를 Vitest 테스트로 바꿔 실제 브라우저(Vitest 브라우저 모드)에서 돌린다. 과거의 `test-runner`는 지원 종료 예정이다 |
| 상호작용 | 스토리에 `play` 함수를 두고 클릭·입력을 실행한 뒤 단언한다 |
| 시각 회귀 | 스토리 스크린숏을 기준 이미지와 비교한다(Chromatic 등) |
| 접근성 | a11y 애드온 검사를 테스트 실패로 연결한다 |

```tsx
import { expect } from 'storybook/test'

export const Clicked: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Button' }))
    await expect(args.onClick).toHaveBeenCalled()
  },
}
```

`play` 안의 쿼리는 Testing Library와 같다. 네트워크가 필요한 컴포넌트는 MSW 핸들러를 스토리에 붙여 응답을 고정한다([[api-mocking|API 모킹]]).

## 정리

- 스토리 = 컴포넌트 + 상태 하나. 앱을 돌아다니지 않고 상태별 UI를 바로 본다.
- CSF3에서는 스토리가 `args`를 담은 **객체**다. meta·전역에 공통 args·decorators·parameters를 두고, 가까운 설정이 이긴다.
- TypeScript는 `satisfies Meta<typeof X>` + `StoryObj<typeof meta>`로 쓴다.
- Controls·Actions·Viewport 같은 도구는 Storybook 9부터 코어에 있다. Docs·a11y·Vitest는 애드온이다.
- 스토리를 렌더링·상호작용·시각·접근성 테스트에 재사용한다. 디자인 시스템에서는 Storybook이 곧 컴포넌트 문서다([[design-system|디자인 시스템]]).

관련 노트: [[frontend-test-types|프론트엔드 테스트의 종류와 도구]], [[design-system|디자인 시스템]], [[api-mocking|API 모킹: MSW와 json-server]], [[accessibility-evaluation|접근성 평가]]
