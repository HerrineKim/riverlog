---
title: "브랜치 전략: Git Flow, GitHub Flow, 트렁크 기반 개발"
concept: "Branching Strategy"
summary: "팀이 브랜치를 어떻게 나누고 언제 합치는지 정한 규칙. 릴리스 주기가 긴 제품에 맞는 Git Flow(main·develop·feature·release·hotfix), 지속 배포에 맞는 GitHub Flow(main + 짧은 기능 브랜치 + PR), 하루 단위로 trunk에 합치는 트렁크 기반 개발을 비교하고 고르는 기준과 git-flow 도구의 현재 상태, 중앙 집중·기능 브랜치·포크 워크플로의 차이를 정리했다."
tags: ["git", "branch", "collaboration", "ci-cd", "version-control"]
source: other
date: "2026-10-21"
sources: ["https://github.com/arslanbilal/git-cheat-sheet", "https://nvie.com/posts/a-successful-git-branching-model/", "https://docs.github.com/en/get-started/using-github/github-flow", "https://trunkbaseddevelopment.com/", "https://github.com/gittower/git-flow-next", "https://www.atlassian.com/git/tutorials/comparing-workflows", "https://guides.github.com/introduction/flow/"]
---

> arslanbilal의 「[Git and Git Flow Cheat Sheet](https://github.com/arslanbilal/git-cheat-sheet)」의 Git Flow 부분을 뼈대로, Vincent Driessen의 「A successful Git branching model」, GitHub Docs의 GitHub flow, trunkbaseddevelopment.com을 참고해 재구성한 노트다. 저장소 구성별 워크플로는 Atlassian의 「[Comparing Git workflows](https://www.atlassian.com/git/tutorials/comparing-workflows)」를 바탕으로 보강했다.

## 브랜치 전략이란

브랜치 전략(branching strategy)은 **어떤 브랜치를 오래 두고, 작업 브랜치를 어디서 따서 어디로 합치며, 무엇을 배포하는지** 팀이 합의한 규칙이다. Git은 브랜치를 마음대로 만들게 해 줄 뿐 규칙을 강제하지 않는다. 규칙이 없으면 오래 산 브랜치가 쌓이고, 합칠 때마다 충돌이 커지고, 지금 무엇이 배포돼 있는지 알기 어렵다.

전략을 가르는 축은 두 가지다.

| 축 | 질문 |
| --- | --- |
| 배포 주기 | 하루에도 여러 번 배포하나, 버전을 정해 몇 주·몇 달마다 출시하나 |
| 동시에 지원하는 버전 수 | 늘 최신 하나만 운영하나(웹 서비스), 여러 버전을 함께 고쳐 줘야 하나(설치형 소프트웨어, 라이브러리) |

## 저장소를 어떻게 나누나: 중앙 저장소와 포크

브랜치 전략과 별개로 **누가 어느 원격 저장소에 push하나**도 워크플로를 가른다. 다음 절의 세 전략은 모두 이 표의 2번(기능 브랜치) 위에 규칙을 더한 것이다.

| 워크플로 | 구조 | 맞는 곳 |
| --- | --- | --- |
| 1. 중앙 집중(Centralized) | 중앙 저장소 하나, 브랜치는 `main` 하나. 모두 `main`에 직접 커밋하고 push 전에 `git pull --rebase origin main`으로 남의 커밋 위에 자기 커밋을 다시 쌓는다 | SVN에서 넘어오는 작은 팀. 사람이 늘면 충돌 해결이 병목이 된다 |
| 2. 기능 브랜치(Feature Branch) | 중앙 저장소 하나, 기능마다 브랜치. `main`에는 PR로만 합친다 | 대부분의 팀. 리뷰와 CI를 붙이기 쉽다 |
| 3. 포크(Forking) | **기여자마다 서버 쪽 저장소(포크)가 따로 있다.** 자기 포크에 push하고, 원본(`upstream`)으로 PR을 보낸다. 관리자만 원본에 쓸 수 있다 | 오픈 소스처럼 신뢰할 수 없는 다수가 기여하는 곳 |

포크 워크플로에서는 원격이 둘이다. `origin`은 자기 포크, `upstream`은 원본이다. 원본의 변경은 `git fetch upstream` 후 자기 브랜치에 합친다. 기여 절차는 [[open-source-contribution|오픈 소스 기여]]에 있다.

## 세 가지 대표 전략

### 1. Git Flow

오래 사는 브랜치 둘(`main`, `develop`)과 짧게 사는 보조 브랜치 셋(`feature/*`, `release/*`, `hotfix/*`)으로 나눈다.

| 브랜치 | 어디서 딴다 | 어디로 합친다 | 역할 |
| --- | --- | --- | --- |
| `main` | — | — | 출시된 코드만. 출시마다 버전 태그를 단다 |
| `develop` | `main` | — | 다음 출시를 위한 통합 브랜치 |
| `feature/*` | `develop` | `develop` | 기능 하나 |
| `release/*` | `develop` | `main`과 `develop` | 출시 준비. 기능 추가는 멈추고 버그 수정·버전 번호·메타데이터만 |
| `hotfix/*` | `main`(해당 버전 태그) | `main`과 `develop` | 운영 중인 버전의 긴급 수정 |

```text
main     ●───────────────●(v1.0)──────────●(v1.0.1)───────●(v1.1)
          \             /  \             /                /
hotfix     \           /    ●──fix──────●                /
            \         /                  \              /
release      \       ●──fix──●            \       ●────●
              \     /         \            \     /
develop        ●───●───●───────●────────────●───●
                    \     /
feature              ●───●
```

- **장점**: 출시 시점과 내용이 분명하고, 출시 준비와 다음 기능 개발이 동시에 진행된다. 여러 버전을 따로 유지 보수하는 제품에 맞는다.
- **단점**: 브랜치가 많고 합치는 방향이 두 갈래라 실수가 잦다. `develop`과 `main`이 어긋나기 쉽고, 기능 브랜치가 오래 살아 큰 충돌을 만든다.
- 이 모델을 처음 제안한 글도 이후 덧붙인 회고에서 **지속적으로 배포하는 웹 앱이라면 GitHub Flow 같은 더 단순한 흐름을 쓰라**고 권한다. Git Flow는 명시적인 버전을 출시하거나 여러 버전을 함께 지원해야 할 때의 선택지다.

#### git-flow 도구

Git Flow의 브랜치 생성·병합·태그를 명령 하나로 묶어 주는 확장 도구가 있다. 원조인 nvie/gitflow는 2025년에 보관(archive) 처리됐고, 오래 쓰이던 포크 git-flow-avh도 더 이상 관리되지 않는다. **지금 관리되는 구현은 Tower가 만든 [git-flow-next](https://github.com/gittower/git-flow-next)** 다(Go로 다시 작성, Homebrew·WinGet·Scoop 배포). 명령 체계는 전통적인 git-flow를 잇는다.

```bash
git flow init                       # 브랜치 이름 규칙 정하기 (develop, feature/ 등)
git flow feature start login        # develop에서 feature/login을 따고 이동
git flow feature finish login       # develop에 합치고 브랜치 삭제
git flow release start 1.2.0        # develop에서 release/1.2.0
git flow release finish 1.2.0       # main에 합치고 태그, develop에 역병합, 브랜치 삭제
git flow hotfix start 1.2.1         # main에서 hotfix/1.2.1
git flow hotfix finish 1.2.1        # main·develop 양쪽에 합치고 태그
git push origin main develop --tags # finish는 로컬에서만 일어나므로 직접 올린다
```

도구 없이도 같은 흐름을 `git switch -c`, `git merge --no-ff`, `git tag -a`로 그대로 할 수 있다. 도구는 순서를 빠뜨리지 않게 해 줄 뿐이다.

### 2. GitHub Flow

오래 사는 브랜치는 **`main` 하나**다. `main`은 언제나 배포할 수 있는 상태로 유지한다.

```text
1. main에서 설명적인 이름의 브랜치를 딴다      git switch -c fix-login-redirect
2. 작게 커밋하고 자주 push한다
3. Pull Request를 열어 리뷰·CI를 받는다
4. 리뷰가 끝나면 main에 합친다 (merge·squash·rebase 중 팀 규칙)
5. main을 배포한다 (팀에 따라 합치기 전에 브랜치를 먼저 배포해 검증하기도 한다)
6. 브랜치를 지운다
```

- **장점**: 규칙이 거의 없어 배우기 쉽고, PR이 리뷰·CI·토론의 단위가 된다. 지속 배포(CD)와 잘 맞는다.
- **단점**: 배포된 여러 버전을 동시에 고쳐 줄 장치가 없다. 기능 브랜치가 길어지면 결국 같은 충돌 문제가 생긴다.
- 배포 환경이 여러 단계(staging, production)면 `main` 뒤에 환경별 브랜치를 두는 변형(GitLab Flow의 환경 브랜치)을 쓰기도 한다.

### 3. 트렁크 기반 개발 (Trunk-Based Development)

모든 개발자가 **trunk(`main`) 하나에 최소 하루에 한 번 이상** 합친다. 작업 브랜치를 쓰더라도 수명은 몇 시간에서 하루 이틀이다.

- 덜 만든 기능도 합친다. 대신 **기능 플래그(feature flag)** 로 꺼 두거나([[deployment-strategies|배포 전략]]의 피처 토글), 추상화 뒤에 숨겨 두고 점진적으로 바꾼다(branch by abstraction).
- 강한 자동 테스트와 CI가 전제다. trunk가 깨지면 모두가 막히므로 깨진 빌드는 최우선으로 고친다.
- 출시가 필요하면 trunk에서 **릴리스 브랜치를 따서** 그 버전만 고치고, 수정은 trunk에 먼저 넣은 뒤 릴리스 브랜치로 cherry-pick한다.
- **장점**: 충돌이 작을 때 바로바로 풀리고, 통합 지연이 없어 지속적 통합(CI)의 원래 뜻에 가장 가깝다.
- **단점**: 테스트 자동화, 기능 플래그, 코드 리뷰 속도 같은 엔지니어링 기반이 없으면 trunk가 자주 깨진다.

## 비교와 고르는 기준

| 항목 | Git Flow | GitHub Flow | 트렁크 기반 |
| --- | --- | --- | --- |
| 오래 사는 브랜치 | `main`, `develop` | `main` | `main`(trunk) |
| 작업 브랜치 수명 | 기능 단위(며칠~몇 주) | PR 단위(며칠) | 몇 시간~하루 |
| 배포 단위 | 버전 출시 | `main`의 커밋 | trunk의 커밋 또는 릴리스 브랜치 |
| 미완성 기능 | 브랜치에 둔다 | 브랜치에 둔다 | 플래그로 숨기고 합친다 |
| 여러 버전 동시 지원 | 쉽다 | 어렵다 | 릴리스 브랜치로 한다 |
| 맞는 곳 | 설치형 앱, 라이브러리, 정해진 출시 일정 | 웹 서비스, 작은~중간 팀 | 지속 배포, 큰 조직, 모노레포 |

```text
여러 버전을 동시에 고쳐 줘야 한다?
├─ 예 → Git Flow (또는 트렁크 + 릴리스 브랜치)
└─ 아니오 → 하루 여러 번 배포하고 자동 테스트·기능 플래그가 갖춰져 있다?
            ├─ 예 → 트렁크 기반 개발
            └─ 아니오 → GitHub Flow
```

어느 전략·워크플로를 고르든 공통 지침은 셋이다.

- **브랜치를 짧게 산다.** 오래 떨어져 있을수록 `main`과 멀어져 합칠 때 충돌이 커진다.
- **되돌리기를 작고 단순하게.** 작은 PR, 기능 플래그로 위험한 변경을 끌 수 있게 하고, `main`에 합치기 전에 테스트를 통과시킨다.
- **출시 주기에 맞춘다.** 하루 여러 번 배포하면 `main`을 늘 배포 가능하게, 몇 주마다 출시하면 릴리스 브랜치·태그로 버전을 고정한다.

## 전략과 함께 정할 것

| 항목 | 정하는 내용 | 관련 노트 |
| --- | --- | --- |
| 브랜치 이름 | `feature/`, `fix/` 접두사, 이슈 번호 포함 여부 | [[github-issue-workflow\|GitHub 이슈·프로젝트로 진행 상황 관리하기]] |
| 합치는 방식 | merge 커밋·squash·rebase | [[merge-squash-rebase\|merge·squash·rebase 언제 쓰나]] |
| 보호 규칙 | `main`에 직접 push 금지, 필수 리뷰·CI | [[github-collaboration\|GitHub 협업 저장소 설정]] |
| 버전과 태그 | 출시 커밋에 `v1.2.0` 같은 주석 태그 | [[branch\|Git 브랜치]]의 태그, [[semantic-versioning\|유의적 버전(SemVer)]] |
| 배포 방식 | 어떤 브랜치·태그가 어느 환경으로 가나 | [[deployment-strategies\|배포 전략]], [[ci-cd\|CI/CD]] |

## 정리

- 브랜치 전략은 배포 주기와 동시에 지원하는 버전 수로 고른다.
- Git Flow는 버전 출시형 제품용이다. 브랜치가 많고 양방향 병합이 필요하다. 도구를 쓴다면 지금은 git-flow-next다.
- GitHub Flow는 `main` + 짧은 브랜치 + PR이 전부다. 대부분의 웹 서비스에 충분하다.
- 저장소 축은 따로다. 팀은 중앙 저장소 + 기능 브랜치, 오픈 소스는 기여자마다 포크를 두고 `upstream`으로 PR을 보낸다.
- 트렁크 기반 개발은 하루 단위로 합치고 미완성 기능은 플래그로 숨긴다. 자동 테스트가 받쳐 줘야 한다.
- **어느 전략이든 핵심은 작업 브랜치를 짧게 유지하는 것이다.** 브랜치가 오래 살수록 합치는 비용이 커진다.

관련 노트: [[branch|Git 브랜치]], [[merge|Git 브랜치 병합]], [[merge-squash-rebase|merge·squash·rebase 언제 쓰나]], [[github-collaboration|GitHub 협업 저장소 설정]], [[ci-cd|CI/CD]], [[deployment-strategies|배포 전략]]
