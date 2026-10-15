---
title: "CI/CD"
concept: "CI/CD"
summary: "코드 변경을 자동으로 빌드·테스트하고(CI) 배포까지 이어 주는(CD) 파이프라인의 개념, Docker와 함께 쓰는 흐름, GitHub Actions 예시와 CI 비밀 값 관리."
tags: ["ci-cd", "devops", "docker", "github", "automation"]
source: notion
date: "2026-10-14"
sources: ["https://80000coding.notion.site/594fdf538093483f99c17f9800dc4c8e", "https://80000coding.notion.site/ecf91c98f04040f59a8de48b35d6b0d2", "https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions"]
---

> 「GitHub Actions 예시」는 팔만코딩경(42Seoul 커뮤니티 위키)의 「DevOps 간단 정리」, 「Github Action을 이용해 코드 검사 자동화하기」를 바탕으로 보강한 노트다.

배포 과정은 사람이 손으로 할수록 **휴먼 에러**가 잦다. 빌드 명령을 빠뜨리거나, 테스트를 건너뛰거나, 엉뚱한 서버에 올리는 식이다. CI/CD는 이 과정을 파이프라인으로 자동화해 매번 같은 절차가 실행되게 만든다.

CI/CD는 개발과 운영의 협업 문화인 DevOps의 핵심 수단으로, 개발부터 배포까지를 하나의 자동화된 절차로 잇는다. 배경은 [DevOps](DevOps)에 있다.

## CI와 CD

| | 의미 | 하는 일 |
| --- | --- | --- |
| **CI** (Continuous Integration, 지속적 통합) | 여러 개발자의 변경을 자주 main에 합치고 그때마다 자동 검증 | 푸시·MR마다 빌드, 린트, 테스트 실행 |
| **CD** (Continuous Delivery/Deployment, 지속적 제공/배포) | 검증된 결과물을 언제든 배포 가능한 상태로 만들고(Delivery), 나아가 자동 배포까지(Deployment) | 이미지 빌드·레지스트리 푸시, 스테이징/운영 배포 |

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
- 비밀 값은 CI 변수로 관리한다.
- GitHub Actions는 `on` + `jobs`로 쓰고, 브랜치 보호의 필수 검사로 걸어야 강제력이 생긴다.

관련 노트: [[github-collaboration|GitHub 협업 저장소 설정]], [[tdd|프론트엔드에서의 TDD]], [[startup-infra-decisions|스타트업 인프라 결정: 지지와 후회]]
