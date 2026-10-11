---
title: "디자인 시스템과 공용 스킬 배포하기"
concept: "Design System"
summary: "디자인 토큰과 UI 컴포넌트를 중앙 저장소에서 패키지로 만들어 여러 프로젝트에 배포하고, 같은 방식으로 AI 코딩 도구용 SKILL.md도 공유·갱신하는 구조."
tags: ["design-system", "frontend", "collaboration", "monorepo"]
source: notion
---

여러 프로젝트가 같은 버튼·색·간격을 쓰게 하려면 각 저장소에 스타일을 복사하지 말고 **한 곳에서 만들어 패키지로 배포**해야 한다. 이것이 디자인 시스템의 배포 구조다. 같은 아이디어를 AI 코딩 도구(Claude Code 등)의 팀 규칙 파일인 `SKILL.md`에도 적용할 수 있다: 중앙 저장소에서 관리하고, 각 저장소는 설치·업데이트만 한다.

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

## 2. 공용 SKILL.md 배포하기

AI 코딩 도구가 읽는 팀 규칙(코딩 컨벤션, 커밋 규칙, 디자인 시스템 사용법 등)도 저장소마다 따로 관리하면 금방 어긋난다.

- 중앙 스킬 저장소를 만들고, 각 저장소에서 **명령어 한 줄**로 프로젝트의 `.claude/skills/<skill-name>/SKILL.md` 위치에 복사되게 한다.
- npm 패키지로 만들면 버전 추적이 되고 설치 명령도 단순하다.

```text
skill-installer/
├── package.json
├── bin/
│   └── install.js        # skills/ 아래 파일을 대상 저장소로 복사
└── skills/
    └── team-dev-guide/
        └── SKILL.md
```

```bash
npx @my-org/skill-installer install team-dev-guide
```

## 3. 관리: 자동 업데이트 PR

디자인 시스템과 스킬 모두, 중앙 저장소에서만 수정하고 각 저장소는 **새 버전을 자동으로 감지해 업데이트 PR을 받는** 구조로 운영한다(예: Renovate, Dependabot, 또는 GitHub Actions 스케줄 작업). 사람이 저장소를 돌며 복사하지 않아도 되고, 변경 내역은 PR 리뷰로 확인할 수 있다.

## 핵심 정리

- 토큰(값) → 컴포넌트(UI) → 문서(Storybook)를 중앙 모노레포에서 관리하고 패키지로 배포한다.
- 컴포넌트는 검증된 오픈 소스 위에 토큰을 입혀 빠르게 만든다.
- 팀 규칙 파일(SKILL.md)도 같은 방식으로 패키지화하고, 업데이트는 자동 PR로 받는다.
