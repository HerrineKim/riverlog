# riverlog

River(Hyerin Kim)의 블로그이자 지식 창고. Next.js App Router로 만든 정적 사이트입니다.

- **About** (`/`) — 소개, RSS·LinkedIn·GitHub·메일 링크
- **Blog** (`/blog`) — 마크다운 글, RSS 피드 `/rss.xml`
- **Knowledge** — 같은 노트를 두 가지 방식으로 탐색
  - `/knowledge` — 3D 개념 지도 (분야 허브 ↔ 개념 노트, 같은 태그끼리 연결)
  - `/knowledge/dictionary` — 계층형 사전 (분야 → 주제 → 노트, 가나다·ABC 색인, 추가일·수정일 기준 최신순·오래된순, 검색)
- **Books** (`/books`) — 책장 목록과 책별 독후감
- **Portfolio** (`/portfolio`) — 회사별 경력과 프로젝트

처음 방문하면 OS의 라이트·다크 설정을 따르고, 헤더의 버튼으로 바꾼 테마는 브라우저에 기억됩니다.

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
노트를 처음 추가한 날짜와 마지막으로 수정한 날짜는 git 이력에서 자동으로 뽑아 `content/.knowledge-dates.json`에 저장합니다(`npm run dev`/`build` 전에 갱신). 배포 환경에 git 이력이 없으면 커밋된 이 파일을 그대로 쓰므로, 노트를 고친 뒤에는 로컬에서 dev나 build를 한 번 돌리고 함께 커밋하세요.

```md
---
title: "React Hooks"
concept: "Hooks"          # 3D 지도에 표시할 짧은 개념어 (생략 시 title에서 자동 추출)
summary: "한 줄 요약"
tags: ["react", "state"]  # 태그가 2개 이상 겹치는 노트끼리 지도에서 연결됩니다
source: til               # til | notion | mixed
---
```

### 책 / 독후감

`content/books/<slug>.md` — 형식은 `content/_templates/책.md` 참고. 본문이 곧 독후감이고, `pdf: "[[파일.pdf]]"`를 넣으면 책 페이지에 「PDF 보기」 버튼이 생깁니다.
사이트의 책 페이지에서 「독후감 쓰기」를 누르면 GitHub 웹 에디터에서 해당 파일이 열리고, 커밋하면 Vercel이 다시 배포합니다.

### 포트폴리오

`content/portfolio/<회사>.md` — 회사 하나가 파일 하나이고, 본문의 `##` 헤딩 하나가 프로젝트 하나입니다. 헤딩 바로 아래 `> 한 줄 요약`은 목록에 프로젝트 설명으로 나오고, 마무리용 `## 돌아보며`는 목록에서 빠집니다. 이미지만 있는 줄은 alt 텍스트가 캡션이 됩니다. 최신 경력이 위로 오도록 `start`로 정렬하고, 스크린샷은 `content/attachments/portfolio/<회사>/`에 둡니다.

```md
---
kind: "career"          # career(기본) | education | project — project는 타임라인에서 빠지고 경력 뒤에 나옵니다
company: "회사명"
companyEn: "Company"
role: "직무 · 직급"
period: "2023.06 – 2026.02"
start: "2023-06"
end: "2026-02"          # 타임라인 막대 길이(start → end)
location: "서울 · 대면"
summary: "카드와 상단에 보일 한 줄 요약"
about: "회사 소개 한두 문장"
stack: ["Next.js", "FastAPI"]
highlights:
  - { value: "+220%", label: "오가닉 검색 클릭" }
cover: "portfolio/회사/cover.png"
---
```

### About

`content/about.md`, 연락처는 `src/lib/site.ts`에서 수정합니다.

## 개발

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

배포 URL을 바꾸면 `NEXT_PUBLIC_SITE_URL` 환경 변수로 RSS 링크의 기준 주소를 지정하세요.
