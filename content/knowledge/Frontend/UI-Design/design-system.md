---
title: "디자인 시스템을 패키지로 배포하기"
concept: "Design System"
summary: "디자인 토큰과 UI 컴포넌트를 중앙 모노레포에서 패키지로 만들어 여러 프로젝트에 배포하고 Storybook으로 문서화하는 구조."
tags: ["design-system", "frontend", "collaboration", "monorepo"]
source: notion
---

여러 프로젝트가 같은 버튼·색·간격을 쓰게 하려면 각 저장소에 스타일을 복사하지 말고 **한 곳에서 만들어 패키지로 배포**해야 한다. 이것이 디자인 시스템의 배포 구조다.

## 1. 디자인 시스템 만들기

### 디자인 토큰 표준화

색상, 간격, 모서리 둥글기, 폰트 크기, 반응형 브레이크포인트처럼 **디자인 결정을 값으로 정의**한 것이 디자인 토큰이다.

```json
{
  "color": {
    "primary": { "value": "#5B5CFF" }
  },
  "spacing": {
    "md": { "value": "16px" }
  }
}
```

토큰 JSON에서 CSS 변수, TypeScript 상수, 테마 객체 등을 자동 생성해 쓴다(예: Style Dictionary).

### UI 컴포넌트 표준화

`Button`, `Input`, `Select`, `Modal`, `Tabs`, `Table`, `DatePicker`처럼 반복해서 쓰는 컴포넌트를 정해진 props 규칙으로 만든다.

```tsx
<Button variant="primary" size="md" loading={isSubmitting} disabled={isSubmitting}>
  저장
</Button>
```

바닥부터 만들기보다 **shadcn/ui** 같은 접근성이 검증된 컴포넌트를 가져와 토큰과 디자인을 입히는 편이 빠르다.

### 중앙 저장소 구조 (모노레포)

```text
design-system/
├─ packages/
│  ├─ tokens/      # 색상, spacing, typography, radius
│  ├─ icons/       # 공통 아이콘
│  ├─ ui/          # Button, Input, Modal, Table 등
│  └─ theme/       # 테마, CSS 변수, 다크 모드
├─ apps/
│  └─ storybook/   # 컴포넌트 문서
└─ package.json
```

### 각 프로젝트에서 쓰기

```bash
npm install @my-org/ui @my-org/tokens
```

```javascript
import "@my-org/tokens/css"
import { Button, TextField, Modal } from "@my-org/ui"
```

### 문서화: Storybook

컴포넌트마다 사용 예와 props를 시각적으로 보여 주는 문서 사이트를 둔다. 디자이너·기획자도 실제 컴포넌트를 확인할 수 있어 소통 비용이 줄어든다.

## 2. 팀 규칙 파일에도 같은 구조를

AI 코딩 도구가 읽는 팀 규칙 파일(`SKILL.md`)도 중앙 저장소에서 패키지로 배포하고 자동 업데이트 PR로 갱신하면 저장소마다 어긋나지 않는다. 방법은 [[claude-skill-building-guide#팀 공용 스킬을 패키지로 배포하기|Claude 스킬 만들기 가이드]]에 정리했다.

## 핵심 정리

- 토큰(값) → 컴포넌트(UI) → 문서(Storybook)를 중앙 모노레포에서 관리하고 패키지로 배포한다.
- 컴포넌트는 검증된 오픈 소스 위에 토큰을 입혀 빠르게 만든다.
- 각 저장소는 설치와 버전 업데이트만 하고, 수정은 중앙에서만 한다.

관련 노트: [[animated-icon|Animated Icon — 영상을 투명 배경 아이콘으로 쓰기]], [[claude-skill-building-guide|Claude 스킬 만들기 가이드]], [[atomic-design|Atomic Design과 컴포넌트 폴더 구조]]
