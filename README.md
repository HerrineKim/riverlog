# riverlog

River(Hyerin Kim)의 블로그이자 지식 창고. Next.js App Router로 만든 정적 사이트입니다.

- **About** (`/`) — 소개, RSS·LinkedIn·GitHub·메일 링크
- **Blog** (`/blog`) — 마크다운 글, RSS 피드 `/rss.xml`
- **Knowledge** — 같은 노트를 두 가지 방식으로 탐색
  - `/knowledge` — 개념 지도 (분야 허브 ↔ 개념 노트, 같은 태그끼리 연결)
  - `/knowledge/dictionary` — 계층형 사전 (분야 → 주제 → 노트, 가나다·ABC 색인, 검색)
- **Books** (`/books`) — 책장 목록과 책별 독후감

기본 테마는 다크 모드이고, 헤더의 버튼으로 라이트 모드로 바꿀 수 있습니다.

## 글 쓰기

`content/` 폴더가 곧 **Obsidian vault**입니다. Obsidian에서 「Open folder as vault」로 `content/`를 열고 쓰면 됩니다.

- **링크**: `[[노트]]`, `[[노트|보일 이름]]`, `[[노트#헤딩]]` 모두 사이트에서 해당 페이지 링크로 바뀝니다. 지식 노트·책·블로그 어디로든 연결돼요. 없거나 비공개인 노트로 가는 링크는 글자만 남습니다.
- **첨부 파일**: 이미지·PDF는 `content/attachments/`에 저장됩니다(Obsidian 설정에 지정됨). `![[그림.png]]`는 이미지로, `![[파일.pdf]]`는 링크로 보입니다. dev/build 전에 `public/attachments/`로 복사돼요.
- **비공개**: frontmatter에 `publish: false`를 넣거나, 이름이 `_`로 시작하는 파일·폴더는 사이트에 나오지 않습니다.
- **템플릿**: `content/_templates/`의 「책」「지식 노트」「블로그 글」을 Obsidian의 Templates 명령(⌘P → Templates: Insert template)으로 넣습니다.
- **배포**: 커밋하고 푸시하면 Vercel이 다시 배포합니다. Obsidian Git 플러그인을 쓰면 Obsidian 안에서 커밋·푸시까지 할 수 있어요.

### 블로그

`content/blog/<slug>.md`

```md
---
title: "글 제목"
date: "2026-10-11"
description: "목록과 RSS에 보일 요약"
tags: ["회고"]
---
본문…
```

### 지식 창고

`content/knowledge/<분야>/<주제>/<노트>.md` — 폴더 구조가 곧 사전의 계층입니다.
폴더와 같은 이름의 `.md` 파일(`React.md` + `React/`)은 그 주제의 개요 페이지가 됩니다.

```md
---
title: "React Hooks"
concept: "Hooks"          # 지도에 표시할 짧은 개념어 (생략 시 title에서 자동 추출)
summary: "한 줄 요약"
tags: ["react", "state"]  # 태그가 2개 이상 겹치는 노트끼리 지도에서 연결됩니다
source: til               # til | notion | mixed
---
```

### 책 / 독후감

`content/books/<slug>.md` — 형식은 `content/_templates/책.md` 참고. 본문이 곧 독후감이고, `pdf: "[[파일.pdf]]"`를 넣으면 책 페이지에 「PDF 보기」 버튼이 생깁니다.
사이트의 책 페이지에서 「독후감 쓰기」를 누르면 GitHub 웹 에디터에서 해당 파일이 열리고, 커밋하면 Vercel이 다시 배포합니다.

### About

`content/about.md`, 연락처는 `src/lib/site.ts`에서 수정합니다.

## 개발

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

배포 URL을 바꾸면 `NEXT_PUBLIC_SITE_URL` 환경 변수로 RSS 링크의 기준 주소를 지정하세요.
