---
title: "CI/CD"
concept: "CI/CD"
summary: "코드 변경을 자동으로 빌드·테스트하고(CI) 배포까지 이어 주는(CD) 파이프라인의 개념과 단계, dev·QA·UAT·운영으로 산출물을 승격하는 흐름, Docker와 함께 쓰는 흐름, GitHub Actions 예시와 CI 비밀 값 관리."
tags: ["ci-cd", "devops", "docker", "github", "automation"]
source: notion
date: "2026-10-21"
sources: ["https://80000coding.notion.site/594fdf538093483f99c17f9800dc4c8e", "https://80000coding.notion.site/ecf91c98f04040f59a8de48b35d6b0d2", "https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions", "https://bytebytego.com/guides/cicd-pipeline-explained-in-simple-terms", "https://bytebytego.com/guides/cicd-simplified-visual-guide", "https://bytebytego.com/guides/how-do-companies-ship-code-to-production", "https://github.com/cheese10yun/github-project-management", "https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule"]
---

> 「GitHub Actions 예시」는 팔만코딩경(42Seoul 커뮤니티 위키)의 「DevOps 간단 정리」, 「Github Action을 이용해 코드 검사 자동화하기」를 바탕으로 보강한 노트다. 「파이프라인 단계」와 「환경 승격」은 ByteByteGo의 System Design 101 가이드 「[CI/CD Pipeline Explained in Simple Terms](https://bytebytego.com/guides/cicd-pipeline-explained-in-simple-terms)」, 「[CI/CD Simplified Visual Guide](https://bytebytego.com/guides/cicd-simplified-visual-guide)」, 「[How do Companies Ship Code to Production?](https://bytebytego.com/guides/how-do-companies-ship-code-to-production)」를 바탕으로 보강했다.
>
> 「PR에 테스트 커버리지 보이기」, 「상태 배지와 예약 실행」은 cheese10yun의 「[github-project-management](https://github.com/cheese10yun/github-project-management)」을 바탕으로, Travis CI 설정을 GitHub Actions 기준으로 바꿔 보강했다.

배포 과정은 사람이 손으로 할수록 **휴먼 에러**가 잦다. 빌드 명령을 빠뜨리거나, 테스트를 건너뛰거나, 엉뚱한 서버에 올리는 식이다. CI/CD는 이 과정을 파이프라인으로 자동화해 매번 같은 절차가 실행되게 만든다.

CI/CD는 개발과 운영의 협업 문화인 DevOps의 핵심 수단으로, 개발부터 배포까지를 하나의 자동화된 절차로 잇는다. 배경은 [DevOps](DevOps)에 있다.

## CI와 CD

| | 의미 | 하는 일 |
| --- | --- | --- |
| **CI** (Continuous Integration, 지속적 통합) | 여러 개발자의 변경을 자주 main에 합치고 그때마다 자동 검증 | 푸시·MR마다 빌드, 린트, 테스트 실행 |
| **CD** (Continuous Delivery/Deployment, 지속적 제공/배포) | 검증된 결과물을 언제든 배포 가능한 상태로 만들고(Delivery), 나아가 자동 배포까지(Deployment) | 이미지 빌드·레지스트리 푸시, 스테이징/운영 배포 |

두 CD의 차이는 **운영 배포 직전에 사람의 승인이 있느냐**다. 지속적 제공은 운영 배포를 버튼 하나로 할 수 있는 상태까지 자동화하고, 지속적 배포는 그 버튼까지 없앤다.

## 파이프라인 단계

소프트웨어 개발 수명 주기(SDLC)의 개발 → 테스트 → 배포 → 운영 단계를 CI/CD가 자동으로 잇는다. 어느 단계에서든 실패하면 개발자에게 바로 알려 고치게 하는 **빠른 피드백**이 목적이다.

```text
커밋·push
  → CI 서버가 변경 감지, 빌드 시작
  → 컴파일, 단위·통합 테스트, 커버리지·정적 분석 게이트
  → 결과를 개발자에게 알림 (실패하면 여기서 멈추고 개발로 되돌림)
  → 성공하면 산출물(아티팩트·이미지)을 저장소에 보관
  → 스테이징에 배포, E2E·추가 테스트
  → 승인(지속적 제공) 또는 자동(지속적 배포)으로 운영 배포
```

### 환경 승격

여러 팀이 함께 개발하는 조직은 **같은 산출물**을 환경마다 차례로 올리며(승격, promotion) 검증한다.

| 환경 | 누가 무엇을 확인하나 |
| --- | --- |
| dev | 개발자가 통합된 결과를 빠르게 확인한다 |
| QA (팀·기능별로 여러 개) | QA가 기능·회귀·성능 테스트를 한다. 기능을 독립적으로 시험하려고 환경을 나눈다 |
| UAT (사용자 인수 테스트) | 실제 사용자·현업이 요구 사항대로 동작하는지 확인한다. 통과하면 릴리스 후보가 된다 |
| production | 일정에 맞춰 배포하고, SRE·운영이 모니터링한다 |

환경마다 다시 빌드하지 않고 **한 번 빌드한 산출물을 그대로 승격**해야 "QA에서 본 것이 운영에 나간 것"이 보장된다. 환경마다 다른 것은 설정뿐이어야 한다. 운영에 올리는 방식(롤링·블루-그린·카나리)은 [[deployment-strategies|배포 전략]]에 있다.

## Docker와 함께 쓰는 흐름

```text
git push
  → CI: 의존성 설치 → 린트/테스트 → docker build
  → 이미지에 태그를 붙여 레지스트리(GitLab Container Registry 등)에 push
  → CD: 서버(또는 오케스트레이터)가 새 이미지를 pull 해서 컨테이너 교체
```

[[vm-vs-container|컨테이너]] 이미지는 "빌드된 결과물 + 실행 환경"을 하나로 묶으므로, CI에서 테스트한 것과 똑같은 것이 운영에서 실행된다고 보장한다.

## GitHub Actions 예시

GitHub Actions는 저장소의 `.github/workflows/*.yml` 파일 하나를 **워크플로**로 실행한다. 워크플로는 `on`(언제 실행할지)과 `jobs`(무엇을 할지)가 필수다.

```yaml
name: check
on:
  push:                    # 모든 브랜치의 push
  pull_request:            # 모든 PR
jobs:
  lint:
    runs-on: ubuntu-latest # GitHub가 제공하는 실행 환경(러너)
    steps:
      - uses: actions/checkout@v6        # 저장소 코드를 내려받는 공개 액션
      - run: pip install ruff            # 셸 명령 실행
      - run: ruff check .
  build:
    runs-on: ubuntu-latest
    needs: lint            # lint가 성공해야 실행. 없으면 job끼리 병렬 실행
    steps:
      - uses: actions/checkout@v6
      - run: make
```

| 키 | 의미 |
| --- | --- |
| `on` | 트리거 이벤트. `push`, `pull_request`, `schedule`(cron), `workflow_dispatch`(수동) 등. `branches:`로 대상 브랜치를 좁힌다 |
| `jobs.<id>` | 작업 단위. job마다 **새 가상 머신에서 따로** 실행되어 기본적으로 병렬이다 |
| `runs-on` | 러너. Ubuntu·Windows·macOS가 제공되며, 직접 운영하는 self-hosted 러너도 쓸 수 있다 |
| `steps` | job 안에서 순서대로 실행할 단계. `run`(명령) 또는 `uses`(재사용 액션) |
| `needs` | job 사이 의존 관계. 지정하면 순서대로 실행된다 |

러너는 깨끗한 기본 이미지에서 시작하므로 코드 checkout과 의존성 설치를 매번 해야 한다. `actions/checkout`이 인증 토큰 처리까지 맡아 주고, 설치 시간은 `actions/cache`나 `actions/setup-*`의 캐시 옵션으로 줄인다.

**브랜치 보호 규칙과 연결**하면 효과가 커진다. main에 직접 push를 막아 PR을 강제하고, 이 워크플로를 **필수 상태 검사(required status check)** 로 지정하면 검사를 통과한 코드만 main에 들어간다. 여기에 리뷰 승인까지 필수로 걸면 실수로 깨진 코드가 올라가는 일을 미리 막는다([[github-collaboration|GitHub 협업 저장소 설정]]).

### PR에 테스트 커버리지 보이기

리뷰 흐름은 **PR 생성 → CI 빌드·테스트 → 통과한 코드만 리뷰 → 머지**다. 빌드가 깨진 코드는 리뷰하지 않는다. 같은 CI에서 커버리지를 재서 PR마다 보여 주면, 테스트 없이 들어온 변경이 바로 드러난다.

```yaml
      - run: npm test -- --coverage          # lcov 등 커버리지 리포트 생성
      - uses: codecov/codecov-action@v5
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

- Codecov·Coveralls 같은 서비스가 리포트를 받아 PR에 **기준 브랜치 대비 변화(change from base)** 를 코멘트와 상태 검사로 남긴다. 줄었으면 `-`로 표시되고, 기준치 아래면 검사를 실패시킬 수도 있다. 외부 서비스 없이 리포트를 아티팩트로 올리거나 잡 요약(`$GITHUB_STEP_SUMMARY`)에 쓰는 방법도 있다.
- 전체 커버리지 숫자보다 **변경분의 커버리지**를 지키는 편이 현실적이다. 기존 코드를 한 번에 올리지 못해도 새 코드부터 테스트가 붙는다.
- 토큰·웹훅 URL은 설정 파일에 적지 않고 **Secrets**에 둔다. 공개 저장소의 설정 파일에 들어간 토큰은 커밋 이력에 영구히 남는다.

### 상태 배지와 예약 실행

- 워크플로 실행 화면의 **Create status badge**가 README에 붙일 마크다운을 준다. 주소는 `https://github.com/<owner>/<repo>/actions/workflows/<파일>.yml/badge.svg?branch=main` 꼴이다. 커버리지 배지는 커버리지 서비스가 준다.
- `on.schedule`의 `cron`으로 주기 작업(정리 배치, 의존성 점검, 알림)을 돌린다. 시각은 **UTC**, 최소 간격은 5분이고 기본 브랜치의 워크플로 파일만 쓴다. 부하가 몰리는 정각에는 지연되거나 빠질 수 있다.

```yaml
on:
  schedule:
    - cron: '0 0 * * 1'      # 매주 월요일 00:00 UTC (한국 09:00)
  workflow_dispatch:         # 수동 실행도 열어 둔다
```

과거 공개 저장소의 CI는 GitHub 밖의 **Travis CI**(`.travis.yml`)가 흔했고, 지금은 저장소에 내장된 GitHub Actions가 그 자리를 대신한다.

## 대표 CI/CD 도구

| 도구 | 특징 |
| --- | --- |
| GitHub Actions | GitHub에 내장. `.github/workflows/*.yml`. 공개 액션을 조합해 쓰며 GitHub 저장소의 기본 선택지 |
| GitLab CI/CD | GitLab에 내장. `.gitlab-ci.yml` |
| Bitbucket Pipelines | Bitbucket에 내장. Jira와 연동된다. 같은 Atlassian의 Bamboo는 자체 호스팅용(Data Center) 제품이다 |
| Jenkins | 오래된 오픈소스. 플러그인이 풍부하고 자체 서버에 설치해 운영한다 |
| CircleCI | 저장소 호스팅과 분리된 SaaS CI |
| Argo CD · Flux | 쿠버네티스용 **GitOps** CD. 클러스터가 Git 저장소에 선언된 상태를 끌어와(pull) 맞춘다 |

GitLab은 저장소 루트의 `.gitlab-ci.yml`을 읽어 stage 순서대로 job을 실행한다. 비밀번호·토큰은 파일에 쓰지 않고 CI/CD Variables에 저장해 `$변수`로 참조한다. `docker login -p 비밀번호`처럼 인자로 넘기면 프로세스 목록·로그에 남을 수 있으므로 표준 입력으로 넘긴다.

```yaml
script:
  - echo "$CI_REGISTRY_PASSWORD" | docker login "$CI_REGISTRY" -u "$CI_REGISTRY_USER" --password-stdin
```

Vercel·Netlify 같은 배포 플랫폼은 저장소를 연결하면 푸시마다 빌드·미리보기 배포를 자동으로 해 주므로, 프론트엔드 앱은 별도 CD 파이프라인 없이 운영하기도 한다.

## 핵심 정리

- CI = 합칠 때마다 자동 빌드·테스트, CD = 검증된 결과물을 자동으로 배포 가능/배포.
- Docker 이미지를 파이프라인의 산출물로 삼으면 테스트한 환경 그대로 배포된다.
- 한 번 빌드한 산출물을 dev → QA → UAT → 운영으로 승격한다. 환경마다 다른 것은 설정뿐이다.
- 비밀 값은 CI 변수로 관리한다.
- GitHub Actions는 `on` + `jobs`로 쓰고, 브랜치 보호의 필수 검사로 걸어야 강제력이 생긴다.

관련 노트: [[s3-cloudfront-static-hosting|S3·CloudFront로 정적 사이트 배포하기]], [[github-collaboration|GitHub 협업 저장소 설정]], [[tdd|프론트엔드에서의 TDD]], [[startup-infra-decisions|스타트업 인프라 선택 원칙]], [[test-run-stages|테스트를 돌리는 시점: 로컬, PR, CI]], [[deployment-strategies|배포 전략]], [[devops-sre-platform-engineering|DevOps, SRE, 플랫폼 엔지니어링, NoOps]]
