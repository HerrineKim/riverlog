---
title: "자바스크립트 패키지 매니저: npm, yarn, pnpm"
concept: "Package Manager"
summary: "패키지 설치·업데이트·의존성 관리를 맡는 패키지 매니저 npm·yarn·pnpm의 차이와 고르는 기준, 그리고 배포 중 만나는 npm EINTEGRITY 오류의 원인과 해결."
tags: ["javascript", "nodejs", "frontend", "tools"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/91", "https://riverkim.kr/265"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트입니다. 도구별 비교는 글을 쓴 시점(2022~2023) 기준이라 지금과 다를 수 있습니다.

## 패키지 매니저란

패키지 매니저는 프로젝트에 필요한 외부 패키지를 **설치·업데이트·삭제하고, 패키지끼리의 의존성을 관리**하는 도구다. 자바스크립트 프로젝트는 수십~수백 개의 패키지에 기대기 때문에, 어떤 버전이 설치됐는지 기록하고 누구의 컴퓨터에서든 같은 의존성을 재현하는 일이 중요하다.

| 파일 | 역할 |
| --- | --- |
| `package.json` | 필요한 패키지와 허용 버전 범위(`^1.2.0` 등)를 적는다 |
| lock 파일 (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) | 실제로 설치된 **정확한 버전과 무결성 해시**를 기록한다. 커밋해서 팀이 공유한다 |
| `node_modules/` | 설치된 패키지가 들어가는 폴더. 커밋하지 않는다 |

## 세 가지 매니저 비교

| | npm | yarn | pnpm |
| --- | --- | --- | --- |
| 출발 | 최초의 Node.js 패키지 매니저 | Facebook이 주도해 npm의 속도·일관성·보안 문제를 보완하려고 만듦 | "performant npm". 디스크 효율을 목표로 만든 매니저 |
| 설치 | Node.js에 기본 포함, 따로 설치할 필요 없음 | 별도 설치(또는 Corepack) | 별도 설치(또는 Corepack) |
| 특징 | 가장 오래되어 생태계·자료가 가장 많다 | 병렬 설치로 속도 개선. 현재 버전(yarn berry)은 Plug'n'Play 같은 새 방식을 지원 | 패키지를 **전역 저장소에 한 번만 저장**하고 프로젝트에서는 링크로 연결해 디스크와 설치 시간을 아낀다 |
| lock 파일 | `package-lock.json` | `yarn.lock` | `pnpm-lock.yaml` |

pnpm의 `node_modules`는 `package.json`에 적지 않은 패키지에 접근할 수 없도록 엄격하게 구성된다. 다른 패키지의 의존성을 우연히 가져다 쓰는 "유령 의존성" 문제를 막아 주지만, 그런 패키지에 기대던 프로젝트는 옮길 때 오류가 날 수 있다.

## 어떤 것을 고를까

- 세 도구 모두 실무에서 쓰기에 충분히 안정적이다. 초기에는 yarn이 npm의 보안·속도 문제의 대안으로 꼽혔지만, npm도 lock 파일 도입 등으로 꾸준히 개선해 격차가 줄었다.
- **프로젝트 하나에는 매니저 하나만** 쓴다. lock 파일이 두 종류 섞이면 팀원마다 다른 버전이 설치된다.
- 디스크를 많이 쓰는 모노레포나 패키지가 많은 프로젝트라면 pnpm의 이점이 커진다.
- 결국은 팀 컨벤션과 배포 환경 지원 여부를 보고, 필요하면 직접 설치 속도와 방식을 비교해 정한다.

## 트러블슈팅: `npm ERR! code EINTEGRITY`

Vercel 같은 배포 환경에서 `npm install` 단계가 다음처럼 실패할 때가 있다.

```text
npm ERR! code EINTEGRITY
npm ERR! sha512-... integrity checksum failed when using sha512: wanted sha512-... but got sha512-...
Error: Command "npm install" exited with 1
```

| 항목 | 내용 |
| --- | --- |
| 증상 | 설치 중 무결성(integrity) 검사 실패로 빌드가 멈춘다 |
| 원인 | 내려받은 패키지의 해시가 lock 파일에 기록된 해시와 다르다. 손상된 npm 캐시나 어긋난 lock 파일이 흔한 원인이다 |
| 해결 | 캐시를 비우고 lock 파일을 새로 만들어 설치한다 |

Vercel이라면 프로젝트 설정의 **Install Command**를 다음처럼 덮어쓴다.

```bash
npm cache verify && npm cache clean --force && rm -rf package-lock.json && npm install
```

다만 `package-lock.json`을 지우면 버전 범위 안에서 새 버전이 설치될 수 있다. 급한 불을 끈 뒤에는 **로컬에서 lock 파일을 다시 생성해 커밋**하고 Install Command를 원래대로 돌려 두는 편이 안전하다.

## 정리

- 패키지 매니저는 의존성 설치와 버전 재현을 맡고, 그 핵심은 lock 파일이다.
- npm은 기본 포함과 생태계, yarn은 속도와 새 설치 방식, pnpm은 디스크 효율과 엄격한 의존성이 강점이다.
- 한 프로젝트에는 한 매니저, lock 파일은 커밋한다.
- EINTEGRITY는 해시 불일치다. 캐시를 비우고 lock 파일을 다시 만든다.

관련 노트: [[ci-cd|CI/CD]], [[windows-dev-environment|Windows 개발 환경]]
